---
Story: 6-4
Round: 2
Date: 2026-06-02
Model Used: GPT-5.5
Review Source: 6-4-code-review-summary-20260602-round-2.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 6-4 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。本轮 review 结论为不通过，包含 2 个阻塞发现和 1 个非阻塞覆盖缺口：packaging manifest 的 `files` 与真实 `npm pack --dry-run --json` inventory 不一致、`path-portability` expected validate snapshot 仍未覆盖 path escape / unsafe overwrite、真实 CLI gate 捕获但未断言 exit code semantics。经只读核对，3 个发现均成立；前 2 项需要修复后再进入下一轮 CR，第 3 项建议纳入 CR TODO 或随修复同步补强。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：已修复

第 2 轮 review 对该项的修复确认成立。`test/story-6-4-path-portability.test.ts:52-117` 已新增基于临时项目的真实 CLI gate，依次调用 `install`、`status`、`resolve config`、`resolve customization`、`update`、`update --repair` 和 `validate`，不再只解析手写 expected artifacts。

### Round 1 / Finding #2：仍有阻塞残留

动态 CLI gate 已补充 `artifact-path.escapes-project`、`file-integrity.case-conflict`、`file-integrity.unsafe-overwrite-risk` 断言（`test/story-6-4-path-portability.test.ts:89-108`），但 stable fixture expected snapshot 仍只包含 `file-integrity.case-conflict` 与 `artifact-path.symlink-escape`（`test/fixtures/path-portability/expected/command-json/validate.json:7-31`），且 expected-output 测试没有断言 expected snapshot 必含 path escape / unsafe overwrite issue（`test/story-6-4-path-portability.test.ts:145-181`）。

### Round 1 / Finding #3：已修复

第 2 轮 review 对该项的修复确认成立。`test/story-6-4-path-portability.test.ts:263-300` 已覆盖 `72`、`100`、`120` 三档 terminal width，并继续断言 no-color / non-TTY / CI 下关键字段可读且无 ANSI。

### Round 1 / Finding #4：仍有阻塞残留

幂等文本风险已有改进：`scripts/release/packaging-check.mjs:18-22` 将 `dist/packaging-manifest.json` 从 stable inventory 过滤，`test/story-6-4-path-portability.test.ts:310-331` 断言连续两次 manifest 文本一致。但残留问题成立：真实 `npm pack --dry-run --json` 当前包含 `dist/packaging-manifest.json`，而 `dist/packaging-manifest.json.files` 排除了该路径，导致 manifest 的 `files` 字段不是实际 package inventory。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| 无 | 无 | 无 | Round 1 evaluation 未产生可继承的 defer 项。 |

---

## 发现 #1 评估

### 审查原文

> **[高][新] Packaging manifest 的 `files` 与真实 npm package inventory 不一致**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`package.json:9-15` 将整个 `dist/` 纳入 npm package `files`。`scripts/release/packaging-check.mjs:18-22` 从 `packResult.files` 中过滤 `dist/packaging-manifest.json`，并在 `scripts/release/packaging-check.mjs:71-72` 将过滤后的 `files` 写入 manifest；脚本还明确断言 `packaging-manifest-excluded-from-stable-inventory`（`scripts/release/packaging-check.mjs:55-57`）。

当前生成的 `dist/packaging-manifest.json` 也印证该策略：`files` 从 `dist/packaging-manifest.json:23` 开始，末尾仅列出 `dist/bin/speclite.d.ts`、`dist/bin/speclite.js`、`dist/bin/speclite.js.map` 和 `package.json`（`dist/packaging-manifest.json:523-527`），没有列出 `dist/packaging-manifest.json`。只读复核命令 `npm pack --dry-run --json` 显示真实 package inventory 为 504 个文件且包含 `dist/packaging-manifest.json`；manifest 自身 `files` 为 503 个文件且不包含该路径，唯一差异就是 `dist/packaging-manifest.json`。

Story AC9 要求 packaging acceptance 生成 `dist/packaging-manifest.json` 并列出 package file inventory（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:63-68`、`223-240`）。因此 review 关于「manifest 列表与真实 npm inventory 不一致」的描述成立。

**严重性判断：合理**

该问题直接影响 release acceptance artifact 的可信度：发布包实际包含一个 manifest 自身未声明的文件，而 manifest 又标注来源为 `npm-pack-dry-run-json`。即使过滤策略能保持文本幂等，当前 contract 仍会让 `files` 字段无法准确代表实际 npm package inventory，属于 Story 6.4 交付阻塞。

**修复建议：可行**

review 给出的两条路径都可行：要么通过 `package.json` / `.npmignore` / npm packaging contract 让真实 package 排除 `dist/packaging-manifest.json`，使真实 inventory 与 manifest 一致；要么让 manifest 明确列出自身，并通过两阶段生成、normalized self-entry 或等价策略保持幂等。无论选择哪条，都应增加只读断言：真实 `npm pack --dry-run --json` 的 `files[].path` 与 manifest 约定字段完全一致。

**误报评估：非误报**

多来源命中，且脚本、manifest artifact 与只读 npm pack 结果相互印证。未发现误报。

---

## 发现 #2 评估

### 审查原文

> **[中][新] `path-portability` expected validate snapshot 仍未覆盖 path escape / unsafe overwrite**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/fixtures/path-portability/expected/command-json/validate.json:7-31` 仍只有两个 stable expected issues：`file-integrity.case-conflict` 与 `artifact-path.symlink-escape`。`test/story-6-4-path-portability.test.ts:145-153` 只解析该 expected validate snapshot，`test/story-6-4-path-portability.test.ts:179-181` 只断言 `validatedPaths`，没有断言 expected snapshot 必须包含 `artifact-path.escapes-project`、`runtime-path.escapes-project` 或 `file-integrity.unsafe-overwrite-risk`。

动态 smoke gate 的确补充了真实 validate 输出断言（`test/story-6-4-path-portability.test.ts:89-108`），但这没有更新 stable fixture expected artifact。Story AC6 要求 case conflict、symlink escape、path escape 和 unsafe overwrite 必须被阻断或由 validate 报告稳定 issue / conflict reason（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:45-49`、`110-115`）。因此 review 关于 expected evidence 面仍旧不足的判断成立。

**严重性判断：合理**

原始严重性标为中，但本评估将其归为 P1 阻塞。原因是 `path-portability` expected artifacts 是 Story 6.4 release gate evidence 的一部分；如果 stable expected snapshot 仍停留在旧 issue set，即使动态测试有局部覆盖，也会让 fixture comparator / release evidence 消费方看不到 path escape / unsafe overwrite 的稳定证据。

**修复建议：可行**

需要更新 `test/fixtures/path-portability/expected/command-json/validate.json`，让 expected validate artifact 至少包含 path escape 与 unsafe overwrite 的 owning issue；同时在 expected-output 测试中显式断言这些 issue 必须存在。若当前动态 fault 仅覆盖 artifact root escape，应补充真正 project-boundary escape（例如 `../`）或在 taxonomy / Story evidence 中明确其等价语义。

**误报评估：非误报**

expected snapshot 的实际内容和 expected-output 测试断言均支持该 finding。未发现误报。

---

## 发现 #3 评估

### 审查原文

> **[低][新] 真实 CLI gate 捕获 exit code 但未断言 AC7 的 exit code semantics**
> - 来源：auditor
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

`runSpecliteCli` helper 返回 `{ stdout, stderr, exitCode }`，并在 `setExitCode` 回调中捕获 exit code（`test/story-6-4-path-portability.test.ts:343-363`）。但真实 CLI gate 对 `install`、`status`、`resolve config`、`resolve customization`、`update`、`update --repair`、`validate` 的调用只解析 stdout 和 command result schema（`test/story-6-4-path-portability.test.ts:57-92`），后续断言也只覆盖 command/status/issue/path leak 等语义（`test/story-6-4-path-portability.test.ts:94-113`），没有对成功命令或 failure diagnostics 的 process exit code 做断言。

Story AC7 明确要求 command id、path normalization、exit code 和 JSON output semantics 保持稳定（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:51-55`），Path Portability Fixture Requirements 也再次要求 command ids、exit codes 与 JSON semantics 稳定（`_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md:211-212`）。因此该覆盖缺口成立。

**严重性判断：合理但可 defer**

review 将其列为低严重性和 `defer` 合理。当前 gate 已验证 `CommandResult.status`、command id、schema parse 和路径泄漏，主要交付风险集中在前两个 blocking；exit code semantics 是 AC7 的补强缺口，但不应覆盖 packaging inventory 与 expected snapshot 这两个更直接的 release evidence 阻塞项。

**修复建议：可行但非必要**

建议在真实 CLI gate 中保留每次 `runSpecliteCli` 的完整返回对象，并断言成功命令 exit code 为 `0`；对 `validate` 报告 failure issue、resolve diagnostics 或其他约定失败场景，按 CLI contract 断言 `0` / `1`。该项可以随本轮 blocking 修复同步完成，也可以进入 CR TODO。

**误报评估：非误报**

代码确实捕获了 exit code 但没有使用该值进行断言。未发现误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Packaging manifest 的 `files` 与真实 npm package inventory 不一致 | [高] | **P1** | 真实 npm pack inventory 包含 `dist/packaging-manifest.json`，manifest `files` 排除该路径，AC9 package file inventory 证据不一致。 |
| 2 | `path-portability` expected validate snapshot 未覆盖 path escape / unsafe overwrite | [中] | **P1** | 动态 CLI gate 有局部断言，但 stable expected validate artifact 仍是旧 issue set，release fixture evidence 不完整。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | 真实 CLI gate 捕获 exit code 但未断言 AC7 semantics | [低] | **P2** | 有效覆盖缺口；建议补强成功 / 失败命令 exit code 断言，但不单独阻塞本轮主要修复路径。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 | 本轮 3 个发现均成立，未发现误报。 |

### 评估决定

- **发现 #1（Packaging manifest `files` 与真实 npm inventory 不一致）**：确认有效，维持 blocking，需要修复。
- **发现 #2（expected validate snapshot 未覆盖 path escape / unsafe overwrite）**：确认有效，维持 blocking，需要修复。
- **发现 #3（exit code semantics 未断言）**：确认有效但可 defer，建议纳入 CR TODO；也可在修复前两项时顺手补强。
- **整体决定**：不通过 / Not Approved。Story 6.4 当前不应 finalizer；需完成发现 #1 和 #2 的修复后进行下一轮 CR。发现 #3 不作为单独 blocking，但应记录为 CR TODO 或随下一轮修复一并处理。

## 验证摘要

- 已读取并评估最新 review：`_bmad-output/implementation-artifacts/code-reviews/6-4-code-review/6-4-code-review-summary-20260602-round-2.md`。
- 已参考 Round 1 review / evaluation 与其中修复执行记录：`6-4-code-review-summary-20260602-round-1.md`、`6-4-code-review-evaluation-20260602-round-1.md`。
- 已只读核对相关文件：`package.json`、`scripts/release/packaging-check.mjs`、`dist/packaging-manifest.json`、`test/fixtures/path-portability/expected/command-json/validate.json`、`test/story-6-4-path-portability.test.ts`、Story 6.4 文档。
- 已只读执行 `npm pack --dry-run --json`：真实 pack inventory 为 504 个文件且包含 `dist/packaging-manifest.json`；manifest `files` 为 503 个文件且不包含该路径。
- 未执行 fixer、rules、todo、finalizer 或 git commit；未修改源码、Story 文档、sprint-status 或进度文件。

✅ CR 代码审查结果评估完成（第 2 轮），结果已保存

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-02
- **Model Used**: GPT-5.5
- **Fix Items**: 3

#### 修复范围

仅处理 Story 6.4 第 2 轮 evaluation 确认的 2 个 P1 与同一真实 CLI gate 范围内的 1 个 P2 补强；未修改 Story 文档、sprint-status、rules、todo、finalizer 或 Story 6.5 相关产物。

#### 修复结果

1. **P1 / Packaging manifest inventory 不一致**：已修复。
   - 修改 `scripts/release/packaging-check.mjs`：`manifest.files` 现在包含 `dist/packaging-manifest.json`，并与真实 `npm pack --dry-run --json` 的 package inventory 对齐。
   - 保留 normalized self-entry 策略：`packageHash` 继续排除自指 manifest 条目，避免 manifest 自身大小导致重复生成文本震荡。
   - 修改 `test/story-6-4-path-portability.test.ts`：packaging acceptance gate 现在断言 `manifest.files` 包含 `dist/packaging-manifest.json`，且与真实 pack inventory 完全一致。

2. **P1 / path-portability expected validate snapshot 未覆盖 path escape / unsafe overwrite**：已修复。
   - 修改 `test/fixtures/path-portability/expected/command-json/validate.json`：新增 `artifact-path.escapes-project` 与 `file-integrity.unsafe-overwrite-risk` stable expected issue，并将 `issueCounts.error` 从 2 更新为 4。
   - 修改 `test/story-6-4-path-portability.test.ts`：expected-output gate 现在显式断言 expected validate snapshot 必含 `artifact-path.escapes-project`、`artifact-path.symlink-escape`、`file-integrity.case-conflict`、`file-integrity.unsafe-overwrite-risk`。

3. **P2 / 真实 CLI gate 未断言 exit code semantics**：已同步补强，未转 TODO。
   - 修改 `test/story-6-4-path-portability.test.ts`：真实 CLI gate 保留每次 `runSpecliteCli` 的完整返回对象，并断言成功命令 `install`、`status`、`resolve config`、`resolve customization` 的 exit code 为 `0`，failure diagnostics 命令 `update`、`update --repair`、`validate` 的 exit code 为 `1`。
   - 同步断言 `update`、`update --repair`、`validate` 的 `CommandResult.status` 为 `failure`，使 process exit code 与 JSON status semantics 对齐。

#### 验证记录

- `npm test -- test/story-6-4-path-portability.test.ts`：先在新增断言后复现失败；修复后通过，1 个测试文件、6 个测试全部通过。
- `npm run build`：通过，tsup ESM 与 DTS 构建成功。
- `npm run release:packaging-check`：通过，生成 `dist/packaging-manifest.json`。
- `npm pack --dry-run --json` inventory 比对脚本：通过，packCount 504，manifestCount 504，`includesManifest: true`，`equal: true`，差异列表为空。
- `npm test`：通过，37 个测试文件、280 个测试全部通过。

✅ CR 修复执行完成，修复记录已追加到评估文件
