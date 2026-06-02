---
Story: 6-4
Round: 1
Date: 2026-06-02
Model Used: GPT-5.5
Review Source: 6-4-code-review-summary-20260602-round-1.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 6-4 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查结论为不通过，包含 4 个 `patch` 类 blocking findings：`path-portability` gate 未执行真实 CLI/fixture 状态、AC 6 path escape / unsafe overwrite 覆盖缺失、terminal width matrix 不完整、`release:packaging-check` package inventory 存在非幂等风险。经只读核对，4 个发现均成立，均需要修复后再进入下一轮 CR。

---

## 发现 #1 评估

### 审查原文

> **[高] `path-portability` gate 没有执行真实命令，手写 expected artifacts 可绕过 AC 3-8**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查指出测试主要读取手写 expected artifacts，而不是执行真实 CLI/fixture 状态。代码核对成立：`test/story-6-4-path-portability.test.ts:77-109` 解析 `expected/command-json/*`、`expected/resolve/*` 和 `expected/manifest-index/files-index.json`；`test/story-6-4-path-portability.test.ts:111-170` 基于这些已存在快照做字段与 path leak 断言。该测试文件只在 packaging acceptance 中调用了 `scripts/release/packaging-check.mjs`（`test/story-6-4-path-portability.test.ts:228-230`），未执行 `install`、`status`、`validate`、`update` 或 `speclite resolve config/customization` 的真实命令链路。

fixture 输入也支撑该判断：`test/fixtures/path-portability/input/.gitkeep` 是唯一 input 文件，`test/fixtures/path-portability/expected/*` 承载了验证内容，无法证明真实项目状态会触发 case conflict、symlink/path escape、shell invocation 或跨 OS 差异。Story 对该 gate 的要求是执行 `install`、`status`、`validate`、`update` 和 `resolve` 相关路径并证明 public path fields 稳定（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:28-31`、`203-207`）。

**严重性判断：合理**

这是 release gate 的真实性缺口。CI 即便在 macOS/Windows 与 Node 22/24 上运行，也可能只是重复解析同一组 expected files；不能证明真实 CLI 输出、fixture 状态迁移和 path projection 满足 AC 3-8，因此应阻塞交付。

**修复建议：可行**

建议把 `path-portability` gate 改成从 `input/` 建立临时项目并执行真实 `install`、`status`、`validate`、`update`、`update --repair` 与 `resolve config/customization`，再做 semantic comparison。该方向与 Story 的命令覆盖要求一致（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:203-206`）。

**误报评估：非误报**

未发现已有代码执行真实 path-portability CLI gate 的证据；该 finding 有三来源命中，且与当前测试结构一致。

---

## 发现 #2 评估

### 审查原文

> **[高] AC 6 的 path escape / unsafe overwrite 没有被 path-portability fixture 覆盖**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/fixtures/path-portability/expected/command-json/validate.json:7-31` 只有两个 issue：`file-integrity.case-conflict` 和 `artifact-path.symlink-escape`。定向检索 `test/story-6-4-path-portability.test.ts` 与 `test/fixtures/path-portability/` 中的 `escapes-project`、`unsafe-overwrite`、`path escape`、`path-escape`、`overwrite`，没有发现 path escape 或 unsafe overwrite fixture 覆盖。Story AC 6 明确要求 case conflict、symlink escape、path escape 和 unsafe overwrite 必须被阻断或由 validate 报告稳定 issue / conflict reason（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:45-49`、`110-115`）。

**严重性判断：合理**

AC 6 是路径安全边界要求，缺少 path escape / unsafe overwrite 代表 release gate 未覆盖最关键的越界写入与覆盖风险。此类问题即使底层 unit test 已存在，也不能替代 Story 6.4 要求的 `path-portability` release fixture evidence。

**修复建议：可行**

增加 `artifact-path.escapes-project`、`runtime-path.escapes-project` 或 owning taxonomy 中等价 issue，以及 `file-integrity.unsafe-overwrite-risk` 或等价 unsafe overwrite conflict reason；同时断言 public JSON 与 `ValidationIssue.details` 不泄漏 escaped absolute path。

**误报评估：非误报**

当前 fixture 的 validate expected output 确实没有 path escape / unsafe overwrite issue，测试也没有对应断言。

---

## 发现 #3 评估

### 审查原文

> **[中] Terminal width matrix 只覆盖 `<80`，缺少 `80-119` 和 `>=120`**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/story-6-4-path-portability.test.ts:195-218` 只调用一次 `renderUpdateHumanOutput`，参数为 `columns: 72`、`noColor: true`、`isTty: false`、`ci: true`。fixture 中 human output 文件只有 `compact-width-72.txt` 与 `evidence-no-color.txt`，未看到 `80-119` 或 `>=120` 的 expected output。Story AC 8 要求 terminal width 覆盖 `<80`、`80-119`、`>=120`，并覆盖 `NO_COLOR`、non-TTY、CI、copy-paste review（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:57-61`、`123-127`）。

**严重性判断：合理**

原始严重性为中，但作为 Story 6.4 明确验收项缺失，应在本 Story 交付前修复。评估优先级定为 P1，不是因为渲染缺陷本身等同安全风险，而是因为 release gate 对 AC 8 的覆盖不完整。

**修复建议：可行**

为 `80-119` 与 `>=120` 增加 expected human output 或生成式断言，并将 no-color、non-TTY、CI、copy-paste review 的关键字段可读性拆成可辨别断言。关键字段至少应覆盖 path、issue id、target id、next action、planned effect、conflict reason、status、severity 与 artifact metadata。

**误报评估：非误报**

当前测试与 fixture 均只证明窄终端/无颜色组合，不能覆盖标准宽度与宽终端断点。

---

## 发现 #4 评估

### 审查原文

> **[中] `release:packaging-check` 的 package inventory 依赖执行前是否已有 `dist/packaging-manifest.json`**
> - 来源：blind+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`scripts/release/packaging-check.mjs:7-21` 先执行 `npm pack --dry-run --json`，并从 `packResult.files` 生成 sorted `files`。`scripts/release/packaging-check.mjs:55-67` 将这些 files 和 `hashInventory(packResult.files)` 写入 manifest 数据，随后才在 `scripts/release/packaging-check.mjs:79-83` 写入 `dist/packaging-manifest.json`。当前 `dist/packaging-manifest.json:523-527` 的 package inventory 包含 `dist/packaging-manifest.json`，说明该 inventory 会受执行前 manifest 是否存在影响。Story AC 9 要求 `npm run release:packaging-check` 生成稳定 packaging manifest，并列出 package file inventory（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:63-68`、`223-240`）。

**严重性判断：合理**

原始严重性为中，但该问题直接影响 `dist/packaging-manifest.json` 作为 stable packaging acceptance artifact 的可信度。首次运行和二次运行可能得到不同 `files` 与 `packageHash`，因此应阻塞 Story 6.4 交付。

**修复建议：可行**

需要固定 manifest inclusion 策略：要么先生成最终/临时 manifest 再执行 `npm pack --dry-run --json`，要么明确排除 manifest 自身并让 assertions 固定该策略。还应增加删除 manifest 后连续运行两次的幂等性测试，断言 `files` 和 `packageHash` 稳定。

**误报评估：非误报**

脚本顺序与当前 manifest 内容共同证明该风险存在；未看到幂等性测试覆盖首次/二次运行差异。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `path-portability` gate 未执行真实 CLI / fixture 状态 | [高] | **P1** | 只解析手写 expected artifacts，不能证明 AC 3-8 的真实 release evidence。 |
| 2 | AC 6 path escape / unsafe overwrite 覆盖缺失 | [高] | **P1** | fixture 只覆盖 case conflict 与 symlink escape，缺少路径越界与 unsafe overwrite 证据。 |
| 3 | Terminal width matrix 缺少 `80-119` 与 `>=120` | [中] | **P1** | AC 8 明确要求三段宽度与自动化可读字段稳定，当前只覆盖 `72` 列组合。 |
| 4 | `release:packaging-check` package inventory 非幂等风险 | [中] | **P1** | package inventory 与 package hash 可能随执行前 manifest 是否存在而变化。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 无 | 无 | 无 | 无 | 本轮 4 项均为 Story 6.4 交付阻塞项，不建议 defer。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 | 未发现误报。 |

### 评估决定

- **发现 #1（`path-portability` gate 未执行真实 CLI / fixture 状态）**：确认有效，维持 blocking，需要修复。
- **发现 #2（AC 6 path escape / unsafe overwrite 覆盖缺失）**：确认有效，维持 blocking，需要修复。
- **发现 #3（Terminal width matrix 不完整）**：确认有效；虽原始严重性为中，但因 AC 8 覆盖缺失，维持 blocking，需要修复。
- **发现 #4（`release:packaging-check` package inventory 非幂等风险）**：确认有效；虽原始严重性为中，但影响 stable release artifact，维持 blocking，需要修复。
- **整体决定**：不通过 / Not Approved。Story 6.4 当前不应 finalizer；需完成上述 4 项修复后进行下一轮 CR。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-02
- **Model Used**: GPT-5.5
- **Fix Items**: 4

#### 修复项 #1：`path-portability` gate 执行真实 CLI / fixture 状态

- **修改文件**: `test/story-6-4-path-portability.test.ts`
- **执行内容**: 新增基于临时项目的真实 CLI gate，依次执行 `speclite install --json --yes`、`speclite status --json`、`speclite resolve config`、`speclite resolve customization`、`speclite update --json`、`speclite update --repair --json`、`speclite validate --json`，再对真实输出做 schema parse、command semantic 与 portable path leak 断言。
- **修复结果**: `path-portability` 不再只解析手写 expected artifacts，测试会验证真实 CLI 解析、真实临时 installed-state 与真实 validate/update/resolve 输出。

#### 修复项 #2：AC 6 path escape / unsafe overwrite fixture 覆盖

- **修改文件**: `test/story-6-4-path-portability.test.ts`
- **执行内容**: 在临时 path-portability fixture project 中注入 `artifactContract.defaultOutputPath` 越出 configured artifact root 的状态，并在 `files-index.json` 中注入 installer-owned `_speclite-output/review.md` 以触发 unsafe overwrite risk；同时保留 case-only conflict 覆盖。
- **修复结果**: 真实 `speclite validate --json` 断言覆盖 `artifact-path.escapes-project`、`file-integrity.case-conflict`、`file-integrity.unsafe-overwrite-risk`，并继续断言公共 JSON 不泄漏宿主绝对路径。

#### 修复项 #3：Terminal width matrix 覆盖 `80-119` 与 `>=120`

- **修改文件**: `test/story-6-4-path-portability.test.ts`
- **执行内容**: 将 human output 测试从单一 `columns: 72` 扩展为 `72`、`100`、`120` 三段矩阵，分别断言 `Evidence (key-value)`、`Evidence (compact-table)`、`Evidence (full-table)` 输出 profile。
- **修复结果**: AC 8 的 `<80`、`80-119`、`>=120` 三段终端宽度均有自动化断言，同时继续覆盖 `NO_COLOR`、non-TTY、CI 与 copy-paste 字段。

#### 修复项 #4：`release:packaging-check` package inventory 幂等性

- **修改文件**: `scripts/release/packaging-check.mjs`、`test/story-6-4-path-portability.test.ts`
- **执行内容**: `packaging-check` 对 `npm pack --dry-run --json` 结果采用稳定 inventory 策略，明确从 `files` 与 `packageHash` 中排除 `dist/packaging-manifest.json`；测试先删除 manifest，再连续运行两次 packaging check，断言两次 manifest 文本完全一致，且 `manifest.files` 不包含自身。
- **修复结果**: 首次运行和二次运行不再因为执行前是否已有 `dist/packaging-manifest.json` 而产生不同 package inventory / package hash。

#### 验证结果

- `npm test -- test/story-6-4-path-portability.test.ts`：通过，1 个文件 / 6 个测试通过。
- `npm test -- test/fixture-contract.test.ts test/fixture-release-gates.test.ts`：通过，2 个文件 / 16 个测试通过。
- `npm run build`：通过，ESM 与 DTS 构建成功。
- `npm run release:packaging-check`：通过，输出 `Packaging acceptance passed: dist/packaging-manifest.json`。
- `npm test`：通过，37 个文件 / 280 个测试通过。

✅ CR 修复执行完成，修复记录已追加到评估文件。
