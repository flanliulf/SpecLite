---
Story: 1-4
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 1-4-code-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 1-4 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查共提出 2 个 `patch` 类发现：1 个 detailed config CLI 字段调整缺失，1 个 rejected artifact path public 输出泄露风险。经独立代码验证，2 个发现均成立，严重性判断基本合理，均需修复后再进入通过判定。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] Detailed config 在 CLI 中只能选择模式，不能调整 AC4 要求的配置项**
> - 来源：single-llm(auditor+edge)
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

该发现准确。Story AC4 明确要求 detailed config 允许确认或调整 `user_name`、`project_name`、`communication_language`、`document_output_language`、`output_folder`、module-specific artifact paths、安装模块和 IDE targets。实现层面虽然定义了 `ConfigInitializationSelection.values`、`selectedModuleIds` 和 `ideTargetIds`（`src/installer/config-initialization.ts:30-35`），且 `runInstallCommand` 会把这些字段传给 `createConfigInitializationPlan`（`src/commands/install.ts:257-265`），但实际 CLI adapter 只调用一次 `io.prompt(configInput.prompt)` 并交给 `parseConfigInitializationAnswer`（`src/bin/speclite.ts:49-50`）。解析函数只返回 `{ mode: "detailed" | "quick" }`，不会收集或返回任何配置字段、模块选择或 IDE target（`src/bin/speclite.ts:121-126`）。

与此同时，prompt 文案承诺 detailed config 可以调整 project fields、module artifact paths、selected modules 和 IDE targets（`src/installer/config-initialization.ts:192-198`）。现有测试也主要覆盖 direct plan API 的 detailed values 注入（`test/config-initialization.test.ts:87-100`）和 CLI prompt 包含 `quick or detailed`（`test/cli-smoke.test.ts:113-120`），未覆盖真实 CLI detailed 字段调整流程。因此，对用户可见的 interactive install 只支持选择模式，不满足 AC4 的交互能力。

**严重性判断：合理**

原始严重性为 `[中]` 合理。该问题不是运行时崩溃或隐私漏洞，但属于 Story AC4 的直接功能缺口，并且 prompt 已对用户承诺可调整字段，阻塞 Story 1.4 交付。评估后按 CR 优先级归为 P1：需要在通过前修复。

**修复建议：可行**

审查建议可行。修复应在 CLI/config collection 层补齐 detailed 模式字段收集流程，并把结果落入 `ConfigInitializationSelection.values`、`selectedModuleIds`、`ideTargetIds`；或者如果产品决定本 Story 不实现 detailed 字段调整，则必须先调整 Story/AC/prompt 承诺。但在当前 Story 明确 AC 下，推荐补齐 CLI detailed collection 和对应测试。

**误报评估：非误报**

不是误报。类型定义和内部 plan 能处理 detailed values，并不等于 CLI 已暴露该能力；真实 CLI 路径缺少字段收集。

---

## 发现 #2 评估

### 审查原文

> **[高] Rejected artifact path 会在 public issue 中回显原始绝对路径/敏感路径**
> - 来源：single-llm(blind+edge+auditor)
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

该发现准确。`normalizeProjectRelativeConfigPath` 在检测空路径、`..`、`../`、POSIX absolute path 或 Windows drive-letter path 时，直接把 `input.value` 传给 `createArtifactPathIssue`（`src/config/config-schema.ts:70-90`）。`createArtifactPathIssue` 随后把该原始值写入 `ValidationIssue.affectedPath`（`src/config/config-schema.ts:100-114`）。

该 issue 会进入 public `CommandResult.issues`：config plan 失败时 `runInstallCommand` 将 `configPlan.issues` 放入 failure result（`src/commands/install.ts:268-282`），`createInstallFailureResult` 保留排序后的 `issues`（`src/diagnostics/command-result.ts:57-83`），`renderCommandResultJson` 会完整 JSON 序列化 result（`src/diagnostics/output.ts:3-4`）。虽然 human renderer 的 `formatIssue` 当前不显示 `affectedPath`（`src/diagnostics/output.ts:34-35`），但 `install --json` 属于 public output，仍会包含原始 rejected path。现有回归测试只断言 `../outside` 会作为 `affectedPath` 返回（`test/config-initialization.test.ts:186-209`），没有覆盖 `/Users/...`、home directory、drive letter 或 credential-bearing path 的 redaction。

**严重性判断：合理**

原始严重性为 `[高]` 基本合理。该问题违反 AC9 对 prompt、summary、issue、next action 和 JSON output 的隐私约束，可能泄露 home directory、absolute local path、drive letter 或用户输入中的敏感片段。考虑当前 CLI detailed 字段收集仍缺失，直接从真实 CLI 触发 unsafe artifact path 的路径受限，但公共 API 和后续 detailed 修复都会放大该风险，因此仍应作为阻塞交付项处理。评估后归为 P1；如果后续发现 credential-bearing URL/token 可直接进入该字段，可升级为 P0。

**修复建议：可行**

审查建议可行。修复应避免在 public `ValidationIssue.affectedPath` 和 `details` 中保留 rejected 原始输入；可改为字段名、安全占位值或 redaction-safe display value，并新增 absolute path、home path、drive-letter path、credential-bearing path 的 JSON/human output 断言。若需要保留原始输入，只能留在 private/internal state，不能进入 public `CommandResult`。

**误报评估：非误报**

不是误报。代码确实把 rejected raw path 投射到 public JSON issue 中；现有测试未覆盖敏感路径 redaction。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Detailed config 在 CLI 中只能选择模式，不能调整 AC4 要求的配置项 | [中] | **P1** | AC4 直接功能缺口；真实 CLI adapter 没有收集 detailed 字段、模块或 IDE target。 |
| 2 | Rejected artifact path 会在 public issue 中回显原始绝对路径/敏感路径 | [高] | **P1** | 违反 AC9 public output 隐私契约；`affectedPath` 会进入 public JSON result。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 2 个发现均为阻塞修复项，不建议降级为 CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮无误报。 |

### 评估决定

- **发现 #1（Detailed config CLI 字段调整缺失）**：确认有效，需要 fixer 补齐真实 CLI detailed config collection，或在获得产品/Story 授权后收缩 AC/prompt 承诺；当前不通过。
- **发现 #2（Rejected artifact path public 输出泄露）**：确认有效，需要 fixer 对 rejected path public projection 做 redaction，并补充敏感路径回归测试；当前不通过。
- **总体决定**：Not Approved / 不通过。需要进入 fixer。需要修复项 2 个，误报 0 个，CR TODO 0 个。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2

#### Finding #1：Detailed config CLI 字段调整缺失

- **Status**: Fixed
- **Modified Files**: `src/bin/speclite.ts`, `src/commands/install.ts`, `test/cli-smoke.test.ts`, `test/install-module-selection.test.ts`
- **Fix Summary**: CLI adapter 现在在用户选择 `detailed` 后收集 `user_name`、`project_name`、`communication_language`、`document_output_language`、`output_folder`、SDLC module-specific fields、selected modules 和 IDE targets，并将结果写入 `ConfigInitializationSelection.values`、`selectedModuleIds`、`ideTargetIds`。`runInstallCommand` 会把 detailed 选择投射到 config initialization plan 与 internal `InstallPlan`，同时仅保留 pre-write planning state，不创建 runtime structure、IDE mirror、manifest/index 或 ready summary。
- **Verification**: 新增 CLI integration test 覆盖真实 prompt flow，并断言 detailed summary 包含调整后的字段、selected modules 与 IDE targets。

#### Finding #2：Rejected artifact path public 输出泄露

- **Status**: Fixed
- **Modified Files**: `src/config/config-schema.ts`, `test/config-initialization.test.ts`
- **Fix Summary**: rejected artifact path 不再把原始用户输入写入 public `ValidationIssue.affectedPath`，改为稳定 redaction-safe 占位 `project-config:<field>`；同时拒绝 home path、drive-letter path 和 credential-bearing URL shape，避免敏感路径进入 public issue、JSON output 或 human output。
- **Verification**: 新增回归测试覆盖 absolute path、home path、drive-letter path、credential-bearing path，并断言 `renderCommandResultJson`、`renderInstallHumanOutput` 和 serialized result 均不包含原始敏感路径、home 片段或 credential 片段。

#### Commands（验证命令）

- `npm ci`：通过。
- `npm test`：通过，8 个 test files、47 个 tests。
- `npm run build`：首次因本次新增 helper 的 `exactOptionalPropertyTypes` 类型签名失败；已最小修正。
- `npm run build`：通过。
- `npm test`：通过，8 个 test files、47 个 tests。

#### Blockers（阻塞项）

- 无。

#### Next Review Step（后续审查步骤）

- 需要重新执行 reviewer/evaluator，对本轮两个修复项进行复审。
