---
Story: 1-2
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 1-2-code-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 1-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 提出的 5 个 patch findings 均有代码或测试证据支撑；其中 4 项属于直接 AC/实现缺陷，1 项属于测试覆盖与质量门禁缺口。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[高] missing manifest 的 existing-install 在 JSON 中被误报为默认 manifest version**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC5 要求 existing-install 列出 detected runtime、manifest version、IDE targets 和建议下一步，并且 manifest/index 不可读或 schema version 不受支持时必须复用 `manifest-schema` issue model（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:42`-`47`）。Story 还明确 `_speclite/` 存在但没有 readable manifest 时仍是 existing installed state，必须报告 runtime present 与 manifest unavailable（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:74`-`81`，`204`）。

当前实现中，manifest 缺失时 `readManifestProjection` 返回的 `manifestFields` 只有 `installedModules: []`，没有 `manifestVersion`（`src/installer/target-directory.ts:115`-`122`）。但 `createTargetStateData` 对 existing-install 使用 `state.manifestVersion ?? DEFAULT_INSTALL_MANIFEST_VERSION`，会把缺失 manifest 投影为 `"speclite.manifest.v1"`（`src/commands/install.ts:160`-`176`）。`DEFAULT_INSTALL_MANIFEST_VERSION` 确实是 `"speclite.manifest.v1"`（`src/diagnostics/command-result.ts:30`）。

**严重性判断：合理**

原始严重性为高，评估后按本模板归为 P1。该问题不会立即写文件，但会让 automation-stable JSON 把未知 manifest 伪装成可读 v1 manifest，直接削弱 existing-install 安全判断和后续处理依据。

**修复建议：可行**

修复方向可行：不能在 existing-install manifest unavailable 时回填默认 manifest version；需要用合规的 unavailable 表达、issue 或 nextAction 呈现。若 public schema 当前强制 `manifestVersion` 为 string（`src/diagnostics/command-result-schema.ts:40`-`49`），修复时应避免擅自新增 required field，必要时在既有 contract 允许范围内选择稳定 sentinel 或通过 failure/issue 表达。

**误报评估：非误报**

代码证据与 Story 要求一致，非误报。

---

## 发现 #2 评估

### 审查原文

> **[中] manifest/index 校验只覆盖 manifest.yaml，其他 index 文件损坏会被静默放过**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC5 明确把 manifest/index 纳入 existing-install 检测与诊断要求，manifest/index 不可读或 schema version 不受支持时必须使用 `manifest-schema` issue model（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:42`-`47`）。Task 3 要求 installed-state 检测至少检查 `_speclite/`、manifest 以及四个 index 文件（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:70`-`76`）；Task 4 要求 unreadable 或 malformed manifest/index 产生 `manifest-schema` issue（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:78`-`82`）。

当前 `INSTALLED_STATE_PATHS` 包含 `skill-index.json`、`help-index.json`、`files-index.json`、`phase-coverage.json`（`src/installer/target-directory.ts:13`-`20`），但 `inspectExistingInstall` 只读取 `manifest.yaml`（`src/installer/target-directory.ts:93`-`104`）。`hasInstalledState` 对所有 installed state paths 仅做存在性检查（`src/installer/target-directory.ts:181`-`189`）。项目已有 index schema 常量和 schema 定义（`src/manifest/manifest-schema.ts:5`-`8`，`19`-`74`），但当前 inspector 没有使用这些 schema 验证 index 文件。

**严重性判断：合理**

原始严重性为中，评估后为 P1。它是 AC5/Task 4 明确覆盖范围的功能缺口，会让 malformed/unsupported index 在 existing-install 分支静默通过。

**修复建议：可行**

建议可行。应对 Story 触达的 index 文件做 readability/schemaVersion/schema 校验，并用现有 `manifest-schema.*` issue id 或当前 taxonomy 允许的 issue model 报告。修复时需注意不要发明未经 owning SPEC 允许的新 public issue id。

**误报评估：非误报**

代码只验证 manifest，不验证 index；非误报。

---

## 发现 #3 评估

### 审查原文

> **[中] 普通文件和 symlink target 未被安全地区分，存在 path escape/误分类风险**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story Task 3 要求使用 `lstat` / `realpath` 或等价 Node 22-compatible API 区分普通目录、文件和 symlink，不得跟随 symlink 产生 path escape 写入风险（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:70`-`76`）。Testing Requirements 要求使用 controlled temp fixtures 覆盖 malformed manifest 和 symlink/path cases（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:234`-`242`）。

当前 `safeLstat` 在遇到 symlink 时只调用 `realpath(targetPath)`，随后仍返回 symlink 本身的 `lstat` 结果（`src/installer/target-directory.ts:237`-`249`）。`inspectTargetDirectory` 对非目录 target 使用 `[path.basename(input.targetRoot)]` 作为 entries，因此普通文件 target 会被分类为 `non-empty`（`src/installer/target-directory.ts:71`-`90`）。更重要的是，`hasInstalledState` 使用 `pathExists(path.join(targetRoot, installedStatePath))`（`src/installer/target-directory.ts:181`-`189`），对 symlink target 下的子路径会跟随 filesystem 解析，存在把 targetRoot 外部内容纳入 installed-state 判断的风险。

**严重性判断：偏低**

原始严重性为中，但从 Story 的安全边界看应按 P1 处理。虽然当前 Story 停在 pre-write 阶段，但 target classification 会成为后续安装阶段的安全前置判断；symlink/path escape 属于需要阻塞交付的边界缺陷。

**修复建议：可行**

建议方向可行，但修复前需要选择符合现有 issue taxonomy 的表达方式。Story 明确不得发明 `existing-install.*` issue id，若需要新增 unsupported/unsafe target 状态，应先确认是否可复用现有 `operation-lock` 或其他已声明 category，或者保持 internal state 并通过合规 issue 失败返回。

**误报评估：非误报**

普通文件误分类和 symlink 跟随风险均可由当前代码路径推出，非误报。

---

## 发现 #4 评估

### 审查原文

> **[中] human-readable output 未满足 target summary 和 existing-install 详情要求**
> - 来源：auditor+blind
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

AC2 要求目标路径摘要以 display-safe 方式展示给用户确认（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:22`-`27`）；AC4 要求展示继续安装可能影响的项目根目录（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:35`-`40`）；AC5 要求 existing-install 列出 detected runtime、manifest version、IDE targets 和建议下一步（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:42`-`47`）。UX Requirements 也要求 human-readable target summary 回答 resolved target、directory state、confirmation 后才会发生什么和 next action（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:222`-`231`）。

当前 human renderer 只输出 `summary`、issues 和 nextActions（`src/diagnostics/output.ts:7`-`21`）。`createTargetSummary` 的文本只包含泛化状态说明，不包含 display-safe target root、manifest version、detectedRuntime 或 canonical IDE target statuses（`src/commands/install.ts:126`-`139`）。虽然 `runInstallCommand` 已经把 `normalizedTarget.displayPath` 传入 context（`src/commands/install.ts:64`-`90`），但该值没有进入 human-readable summary。

**严重性判断：合理**

原始严重性为中，评估后为 P1。该缺口直接影响确认前的人类可审计性，并违反 AC2/AC4/AC5 对 human-readable output 的明确要求。

**修复建议：可行**

建议可行。可以在不新增未经 SPEC 声明 required JSON fields 的前提下，让 human summary 或 renderer 使用 display-safe target root、directory state、detected runtime、manifest version/unavailable、IDE target statuses 和 next action。

**误报评估：非误报**

现有 human output 事实不足，非误报。

---

## 发现 #5 评估

### 审查原文

> **[低] no-write 与边界测试覆盖未达到 Story 声明的断言范围**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P2 优先级）

### 评估分析

**问题描述准确性：准确**

Story 要求 integration tests 覆盖默认 target no-write 行为，并断言不会创建 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:98`-`105`）。No-Write Requirements 进一步列出 target directory、`_speclite`、`_speclite-output`、IDE mirror directories、operation lock、safe-write temporary files、manifest/index files 都不得在 confirmation 前创建，并要求 early-exit 分支均断言 absence（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:208`-`220`）。Testing Requirements 要求 symlink/path cases（`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:234`-`242`）。

当前 `assertNoInstallWrites` 只检查 `_speclite-output`、`.claude/skills`、`.agents/skills`（`test/target-directory.test.ts:322`-`337`），没有覆盖 `_speclite`、operation lock、safe-write temp、manifest/index files。现有测试覆盖 default target、explicit missing target、readable existing install 和 malformed manifest（`test/target-directory.test.ts:169`-`319`），但未覆盖 reviewer 指出的 non-empty target no-write、regular file target、symlink/path escape、index malformed、manifest missing existing-install 等边界。

**严重性判断：合理**

原始严重性为低基本合理，评估后归为 P2。该项主要是测试与质量门禁缺口，不等同于当前代码已经发生写入；但它会遗漏 Story 明确要求的回归保护，需要由 fixer 一并补齐。

**修复建议：可行**

建议可行。扩展 no-write assertion 时需要区分 preexisting installed-state paths 与本次命令新增路径，避免在 existing-install fixture 中把既有 `_speclite` 误判为本次写入。

**误报评估：非误报**

测试覆盖缺口明确存在，非误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | missing manifest 的 existing-install 在 JSON 中被误报为默认 manifest version | [高] | **P1** | manifest unavailable 被投影成真实 v1，会误导 automation-stable 判断。 |
| 2 | manifest/index 校验只覆盖 manifest.yaml，其他 index 文件损坏会被静默放过 | [中] | **P1** | 违反 AC5 与 Task 4 对 manifest/index 诊断的要求。 |
| 3 | 普通文件和 symlink target 未被安全地区分，存在 path escape/误分类风险 | [中] | **P1** | target 安全边界缺陷，应在后续 install stages 前修复。 |
| 4 | human-readable output 未满足 target summary 和 existing-install 详情要求 | [中] | **P1** | 违反确认前 display-safe target summary 与 existing-install 详情要求。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 5 | no-write 与边界测试覆盖未达到 Story 声明的断言范围 | [低] | **P2** | 当前是测试覆盖缺口，但建议 fixer 同轮补齐，避免 P1 修复缺少回归保护。 |

### 可忽略（误报）

无。本轮 5 个 findings 均非误报。

### 评估决定

- **发现 #1（missing manifest 默认回填）**：确认有效，阻塞通过；需要修复 manifest unavailable 的 public JSON/issue/nextAction 表达，不能伪装成默认 manifest version。
- **发现 #2（index 文件未校验）**：确认有效，阻塞通过；需要校验 Story 触达的 installed-state index 文件并复用合规 issue model。
- **发现 #3（regular file/symlink target）**：确认有效，阻塞通过；需要明确区分普通文件、symlink 与 unsafe target，避免 path escape 或误分类。
- **发现 #4（human-readable output 不足）**：确认有效，阻塞通过；需要补足 display-safe target summary、existing-install runtime/manifest/IDE target 明细。
- **发现 #5（no-write/边界测试不足）**：确认有效，建议同轮修复；至少补齐 `_speclite`、manifest/index、operation lock/safe-write temp 断言，以及 reviewer 指出的关键边界测试。

**最终决定**：不通过。本轮 CR 不 Approved，需要进入 fixer。需修复项共 5 项，其中 P1 阻塞项 4 项，P2 测试/质量项 1 项；误报 0 项。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 5

#### 修复摘要

- **发现 #1（missing manifest 默认回填）**：已修复。existing-install 在 manifest 缺失时不再把 `data.manifestVersion` 回填为 `speclite.manifest.v1`，改为稳定 sentinel `unavailable`，并在 summary/human output 中表达 `Manifest version: unavailable`。
- **发现 #2（installed-state index 未校验）**：已修复。existing-install 检测现在会校验 `_speclite/_config/skill-index.json`、`help-index.json`、`files-index.json`、`phase-coverage.json`，对 JSON corruption、missing/unsupported schemaVersion、malformed fields 复用 `manifest-schema.*` issue model。
- **发现 #3（regular file / symlink target 边界）**：已修复。target root 使用 no-follow `lstat` 区分 missing、directory、regular-file 与 unsafe symlink；symlink target 不再跟随到外部 installed state，并以 `runtime-path.symlink-escape` 阻断。
- **发现 #4（human-readable output 不足）**：已修复。install summary/human renderer 现在包含 display-safe target、directory state、existing-install detected runtime、manifest version/unavailable、IDE target statuses 和 next actions。
- **发现 #5（no-write 与边界测试覆盖不足）**：已修复。测试补齐 `_speclite`、manifest/index、operation lock、safe-write temp、non-empty target、regular file target、symlink/path escape、index malformed、manifest missing existing-install 等断言。

#### 修改文件

- `src/installer/target-directory.ts`
- `src/commands/install.ts`
- `src/diagnostics/output.ts`
- `test/target-directory.test.ts`
- `test/cli-smoke.test.ts`
- `_bmad-output/implementation-artifacts/code-reviews/1-2-code-review/1-2-code-review-evaluation-20260526-round-1.md`

#### 验证

- `npm test -- --run test/target-directory.test.ts`：通过，1 个测试文件，15 个测试通过。
- `npm test`：通过，5 个测试文件，23 个测试通过。
- `npm run build`：通过，tsup ESM 与 DTS build 成功。

#### Blocker

无。

#### 后续流程建议

需要重新进入 reviewer/evaluator 复审当前修复结果；本 fixer 步骤不修改 Story 状态。
