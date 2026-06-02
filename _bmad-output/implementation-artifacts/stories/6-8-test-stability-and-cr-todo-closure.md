# Story 6.8: Test Stability And CR TODO Closure（测试稳定性与 CR TODO 收尾）

Status: done

<!-- Note: This file is ready-for-dev story context. It is not evidence that default npm test stability, Git confirmation assertions, or CR TODO closure are complete. -->

## Story（故事）

作为 SpecLite 维护者，
我希望复核默认测试稳定性、补强 Git source confirmation assertion，并对 Epic 6 CR TODO backlog 做最终证据化关闭，
以便 Epic 6 在新增收口项完成后可以重新进入可靠收尾。

## Acceptance Criteria（验收标准）

1. **Default test command is stable or explicitly configured（默认测试命令稳定或显式配置）**
   **前提** 维护者运行默认测试命令；
   **当** 执行 `npm test`；
   **则** default test timeout、fixture suite runtime 和 Vitest 配置必须能稳定支持当前 suite；
   **并且** 若仍需更长 timeout，必须通过 `vitest.config.ts`、`package.json` script 或等价配置显式化，而不是依赖 story 里的人工命令记忆。

2. **Confirmed Git source assertion is present（Confirmed Git Source 断言存在）**
   **前提** confirmed Git source install scenario 运行；
   **当** Git source 拥有 version、contentHash 或等价 confirmation evidence；
   **则** test 必须断言输出、structured data 或 public projection 中的 `confirmationState=confirmed`；
   **并且** pending/unconfirmed scenario 仍保留独立断言。

3. **CR TODO backlog is closed only with evidence（CR TODO Backlog 只按证据关闭）**
   **前提** Story 6.6 和 6.7 的相关修复已经完成；
   **当** 复核 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`；
   **则** 所有已实现 TODO 必须移动到 resolved section，并更新统计、resolved date、resolution evidence 和 affected files；
   **并且** 任何缺少代码、fixture 或测试证据的 TODO 仍保持 open。

4. **Final release confidence verification is run（最终发布信心验证已运行）**
   **前提** CR TODO 全部关闭或剩余项明确延期；
   **当** 准备再次收尾 Epic 6；
   **则** 必须运行 focused tests、`npm run build`、默认 `npm test` 和可用的 release verification command；
   **并且** sprint/story 状态更新不得早于代码、测试和 backlog 证据。

5. **Epic status is not prematurely closed（Epic 状态不提前关闭）**
   **前提** 本 Story 实现完成；
   **当** 更新 story、sprint 或 retrospective 状态；
   **则** 只有本 Story 完成 dev、CR、evaluation、fix、rules/todo 和 finalizer 后，才允许把 `6-8-test-stability-and-cr-todo-closure` 标记为 `done`；
   **并且** `epic-6` 是否重新标记 `done` 必须以所有 6.6-6.8 Story 均 `done` 为前置条件。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Preflight and dependency check（AC: 1-5）
  - [x] 读取 `package.json`、`vitest.config.ts`、Story 4.3、Story 5.5、Story 6.6、Story 6.7 和 `cr-todo-backlog.md`。
  - [x] 确认 Story 6.6/6.7 的 TODO 范围是否已实现；若未实现，本 Story 只处理自身范围并保留 backlog open。
  - [x] 检查 dirty worktree；不得回滚或格式化无关改动。

- [x] Task 2: Stabilize or document default `npm test` behavior（AC: 1）
  - [x] 运行默认 `npm test`，记录是否稳定通过、失败测试、timeout 位置和 runtime。
  - [x] 若默认 timeout 不足，优先通过 `vitest.config.ts` 或 `package.json` script 显式配置合理 timeout。
  - [x] 若失败来自真实测试缺陷，按对应 code path 修复；不得通过跳过测试、削弱断言或删除 fixture 让 suite 变绿。
  - [x] 更新 `TODO-003` resolution evidence，或保持 open 并记录未关闭原因。

- [x] Task 3: Add confirmed Git source assertion（AC: 2）
  - [x] 复核 `test/git-source-resolution.test.ts` 或等价 Git source confirmed scenario。
  - [x] 在 confirmed install path 中断言 `confirmationState=confirmed`，并保留 pending/unconfirmed scenario 的 `confirmationState=pending` 或等价断言。
  - [x] 确认 implementation 不泄漏 credentials、absolute local path、checkout root 或 raw remote URL secret。

- [x] Task 4: Final CR TODO backlog reconciliation（AC: 3）
  - [x] 对 `TODO-001` 到 `TODO-008` 逐项核对代码、fixture、test 和 story evidence。
  - [x] 将已实现项移动到 resolved section，补充 resolved date、resolution evidence、affected files 和 closing story。
  - [x] 更新 backlog summary 统计。
  - [x] 对缺少证据的项保持 open，且不要把它们隐藏在 vague follow-up 中。

- [x] Task 5: Final verification and status readiness（AC: 4-5）
  - [x] 运行 focused tests：default test stability、Git source resolution、CR TODO touched surfaces。
  - [x] 运行 `npm run build`。
  - [x] 运行默认 `npm test`。
  - [x] 运行 Story 6.7 建立的 release verification command；若不存在，运行 `npm run release:packaging-check` 并记录原因。
  - [x] 只有验证和 CR TODO bookkeeping 通过后，才进入 dev-story review/finalizer 状态更新。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，`TODO-004` 已在 backlog 中标记 resolved，但当前审计建议补一条 regression assertion，确保 confirmed Git install path 明确覆盖 `confirmationState=confirmed`。
- Story 4.3 的历史记录显示 default `npm test` 曾因 5s timeout 失败，并通过 `--testTimeout=15000` 通过；当前 `vitest.config.ts` 是否仍无 timeout 需要实现时实时确认。
- 本 Story 是三个新增收口 Story 的最后一步，必须读取 Story 6.6 和 6.7 的完成结果后再决定哪些 TODO 可以关闭。

### Scope Boundary（范围边界）

- 本 Story 负责 `TODO-003`、`TODO-004` regression assertion 和最终 `cr-todo-backlog.md` reconciliation。
- 本 Story 可以关闭 Story 6.6/6.7 已实现但尚未 bookkeeping 的 TODO，但只能在重新核对代码、fixture 和 tests 后关闭。
- 本 Story 不负责新增 feature、重写 release fixture suite、扩大 Post-MVP command 范围或改变 Git source trust policy。
- 不要为了让 default `npm test` 通过而删除慢测试、跳过 release fixture gates、降低 source-integrity/path-portability assertions 或缩小 test coverage。

### Architecture Requirements（架构要求）

- Default test command 应服务项目维护者日常验证，不应依赖隐藏的人工作业参数。
- Git source confirmation semantics 以 source descriptor / diagnostics output contract 为准；confirmed、pending/unconfirmed、blocked scenario 必须区分。
- CR TODO backlog 是 code review deferred improvement 账本；关闭必须具备实现和验证证据，不得只凭 Story status。

### Implementation Anchors（实现锚点）

```text
package.json
vitest.config.ts
src/diagnostics/output.ts
test/git-source-resolution.test.ts
_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md
_bmad-output/implementation-artifacts/sprint-status.yaml
```

### Previous Story Intelligence（前序 Story 情报）

- Story 4.3 记录了 default `npm test` timeout 风险。
- Story 5.5 记录了 Git install human output 已显示 confirmed state，并关闭 `TODO-004`；本 Story 只补 regression assertion。
- Story 6.6/6.7 是本 Story 的前置收口项；实现时必须先读取它们的 completion notes 和 file list。

### References（参考）

- `_bmad-output/implementation-artifacts/stories/4-3-update-plan-before-write.md`
- `_bmad-output/implementation-artifacts/stories/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md`
- `_bmad-output/implementation-artifacts/stories/6-6-fixture-contract-hardening.md`
- `_bmad-output/implementation-artifacts/stories/6-7-packaging-gate-hardening.md`
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- `package.json`
- `vitest.config.ts`
- `test/git-source-resolution.test.ts`
- `src/diagnostics/output.ts`

## Dev Agent Record（开发代理记录）

### Agent Model Used

GPT-5.5

### Debug Log References

- 2026-06-02 18:59 CST: `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 因 `tomllib` 缺失失败；改用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 成功解析，workflow 无 prepend/append steps。
- 2026-06-02 18:59 CST: 读取 Story 6.8、`sprint-status.yaml`、`_bmad-output/project-context.md`、`package.json`、`vitest.config.ts`、Story 4.3/5.5/6.6/6.7、`cr-todo-backlog.md`、`test/git-source-resolution.test.ts` 和 `src/diagnostics/output.ts`。
- 2026-06-02 18:59 CST: 初始默认 `npm test` 通过，38 files / 288 tests passed，Duration 10.13s；未复现 Story 4.3 记录的 5s timeout failure。
- 2026-06-02 19:00 CST: `npx vitest run test/git-source-resolution.test.ts` 通过，1 file / 14 tests passed；confirmed Git install path 已新增 `confirmationState=confirmed` regression assertion，pending path 保留 `confirmationState=pending` 断言。
- 2026-06-02 19:01 CST: focused touched-surface tests 通过：`npx vitest run test/git-source-resolution.test.ts test/release-packaging-check.test.ts test/resolve-cli.test.ts test/fixture-contract.test.ts test/artifact-metadata.test.ts test/story-6-4-path-portability.test.ts test/artifact-path-validation.test.ts`，7 files / 58 tests passed。
- 2026-06-02 19:01 CST: `npm run build` 通过。
- 2026-06-02 19:01 CST: 默认 `npm test` 通过，38 files / 288 tests passed，Duration 8.62s。
- 2026-06-02 19:01 CST: `npm run release:verify` 通过，串行执行 `npm run build && npm run release:packaging-check`，packaging acceptance passed。
- 2026-06-02 19:02 CST: `git diff --check` 通过。

### Implementation Plan

- 先复核 Story 6.6/6.7 与 CR TODO backlog 证据，避免把未实现项误关闭。
- 使用默认 `npm test` 作为 TODO-003 的稳定性证据；当前 suite 在默认命令下已稳定通过，因此未修改 `package.json` 或 `vitest.config.ts`。
- 在 Git confirmed install regression test 中补 `confirmationState=confirmed` 断言，同时保留 pending/unconfirmed path 的独立断言。
- 最后更新 CR TODO backlog 为 open 0 / resolved 8，并在状态更新前运行 focused tests、build、默认 test 和 release verification。

### Completion Notes List

- 已完成 preflight：Story 6.6/6.7 均为 done；6.6 关闭 TODO-001/002/005/006，6.7 关闭 TODO-007/008；Story 6.8 范围为 TODO-003、TODO-004 regression assertion 和最终 backlog reconciliation。
- 默认 `npm test` 当前在无额外人工参数下两次通过，未复现 5s timeout；`TODO-003` 已以默认命令稳定性和最终 release confidence verification 证据关闭。
- `test/git-source-resolution.test.ts` 已在 confirmed Git install path 中断言 human output 包含 `confirmationState=confirmed`，并继续保留 unconfirmed path 的 `confirmationState=pending` 断言；输出仍断言不泄漏 token、secret、raw remote host 或 temp root。
- `cr-todo-backlog.md` 已更新为 open 0 / resolved 8；TODO-003 移入 resolved archive，TODO-004 补充 Story 6.8 regression assertion 证据。
- 本 Story 在 dev-story 阶段只移动到 `review`，未提前关闭；finalizer 验证 CR evaluation 通过后，已将 `6-8-test-stability-and-cr-todo-closure` 与 `epic-6` 标记为 `done`。

### File List

- `_bmad-output/implementation-artifacts/code-reviews/6-8-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/6-8-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/6-8-test-stability-and-cr-todo-closure.md`
- `test/git-source-resolution.test.ts`

## Change Log（变更日志）

- 2026-06-02: Created ready-for-dev Story 6.8 from test stability and CR TODO closure plan.
- 2026-06-02: Implemented Story 6.8 test stability and CR TODO closure; added confirmed Git regression assertion, closed TODO-003 with default `npm test` evidence, reconciled backlog to open 0 / resolved 8, and moved story to review.
