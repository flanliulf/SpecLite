---
Story: 8-4
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。`npm test -- test/status-command.test.ts test/validate-command.test.ts`、`npm test`、`npm run build` 和 scoped `git diff --check` 均通过；但发现 1 个 AC3 相关中等严重性问题：`validate` human output 没有按 canonical order 展示 `checkedTargets`，在输入顺序为 `agents, claude` 时会直接保留非 canonical 顺序。建议本轮不通过，修复后复审。

注意：当前执行环境没有 bmenhance skill 所述的 Agent 子代理工具可调用，本轮已按 skill 允许路径降级为当前上下文串行三层审查。Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层逻辑均完成，无单层审查失败；隔离性低于真正 Agent 并行模式。

## 新发现

### 1. [中] Validate human output 未按 canonical order 展示 checked targets

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/output.ts:413-415` 已对 `checkedCategories`、`issues`、`validatedPaths` 做 canonical sorting，但 `src/diagnostics/output.ts:450` 输出 `Checked targets: ${formatList(result.data.checkedTargets)}`，直接使用输入顺序。
  - `src/validation/validation-order.ts:22-24` 已提供 `sortCheckedTargets()`，其 canonical 顺序来自 `CANONICAL_TARGET_ORDER`，但 `renderValidateHumanOutput()` 未导入或调用该 helper。
  - 定向复现：构造 `checkedTargets: ["agents", "claude"]` 后调用 `renderValidateHumanOutput()`，实际输出为 `Checked targets: agents, claude`；根据 `src/ide/adapter-registry.ts:1`，canonical 顺序应为 `claude, agents`。
  - 当前新增测试 `test/validate-command.test.ts:888-970` 传入了非 canonical `checkedTargets`，但只断言 outcome、issue order 和 Next Actions，未断言 `Checked targets` 的输出顺序，因此未覆盖该 AC 缺口。

- **影响**
  - 违反 AC3 中 “checked targets 必须按 canonical order 展示” 的 human output 要求。
  - 当 `ValidateCommandResult` 来自非 `validateProject()` 路径、fixture、未来命令适配层或调用方手工构造时，human renderer 会泄露输入顺序，造成输出不稳定。

- **建议**
  - 在 `renderValidateHumanOutput()` 中复用 `sortCheckedTargets()`，例如先计算 `const checkedTargets = sortCheckedTargets(result.data.checkedTargets as Iterable<IdeTargetId>)`，再在 `Scope` 中输出 `formatList(checkedTargets)`。
  - 补充测试断言：传入 `checkedTargets: ["agents", "claude"]` 时，human output 必须包含 `Checked targets: claude, agents`，防止回归。

## 验证摘要

- ✅ `npm test -- test/status-command.test.ts test/validate-command.test.ts` 通过：2 files / 31 tests passed。
- ✅ `npm test` 通过：49 files / 348 tests passed。
- ✅ `npm run build` 通过：`tsup` ESM 与 DTS build success。
- ⚠️ `npm run lint` 未执行：`package.json` 未定义 `lint` script。
- ✅ `git diff --check -- src/cli/messages.ts src/diagnostics/output.ts test/status-command.test.ts test/validate-command.test.ts` 通过：无输出。
- ❌ 定向复现：
  - 命令：`./node_modules/.bin/tsx -e '<construct ValidateCommandResult with checkedTargets ["agents", "claude"] and print Checked targets line>'`
  - 实际结果：`Checked targets: agents, claude`
  - 预期结果：`Checked targets: claude, agents`

## 通过项

- Status human outcome 按 `status.data.highLevelHealth` deterministic mapping 推导：`configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`，见 `src/diagnostics/output.ts:901-912`。
- `stale` / `unknown` 未新增为 public JSON enum：`StatusCommandDataSchema.highLevelHealth` 仍仅允许 `not-configured`、`configured`、`partial`、`failed`，见 `src/diagnostics/command-result-schema.ts:108-118`。
- Status human output 明确区分 `CommandResult.status=success` 与 installation health success，见 `src/diagnostics/output.ts:373-377` 及 `src/diagnostics/output.ts:949-967`。
- Validate outcome 按 issue state / command status 推导为 `valid`、`valid-with-warnings`、`invalid`、`cannot-validate`，见 `src/diagnostics/output.ts:981-990`。
- Validate issue counts、checked categories、validated paths 和 issue list 的输出顺序使用 canonical helpers 或 severity/category/path sorting，见 `src/diagnostics/output.ts:413-415`、`src/diagnostics/output.ts:448-454`、`src/diagnostics/output.ts:456-460`。
- Error / critical Next Actions 优先使用 blocking issue 的 `suggestedNextStep`，见 `src/diagnostics/output.ts:1005-1030`。
- 未发现 8.4 为 status/validate 新增 public JSON fields；相关 command result schemas 仍为 `.strict()`，见 `src/diagnostics/command-result-schema.ts:108-118`、`src/diagnostics/command-result-schema.ts:238-245`、`src/diagnostics/command-result-schema.ts:474-486`。
- 未发现 `status` 被改成 validate、repair 或 implicit update；本轮相关实现集中在 human renderer 和 tests。
