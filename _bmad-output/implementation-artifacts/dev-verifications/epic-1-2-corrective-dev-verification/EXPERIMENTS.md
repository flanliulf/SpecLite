# EXPERIMENTS（尝试记录）

## Experiment 1：只读校正检查

- 时间：2026-05-28
- 方案：先读取 reopened Story、sprint status、相关代码与现有测试，不直接改代码。
- 原因：用户明确要求先判断每个 Story 是否需要补充开发；必须避免把 Epic 1/2 重新开发一遍。
- 结果：
  - Story 1.5 / 2.2 的 full canonical mirror/index 已有强证据。
  - Story 1.3 仍需要 summary evidence 补强。
  - Story 1.6 仍需要 ReadyCheck full inventory gate 补强。
  - Story 2.1 / 2.3 需要补充 no-help-row / projection 分层测试证据。
  - targeted tests、full regression、`git diff --check` 已通过。

## Experiment 2：建立 corrective dev verification 执行记录

- 时间：2026-05-28
- 方案：在 `_bmad-output/implementation-artifacts/dev-verifications/epic-1-2-corrective-dev-verification/` 下创建 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- 原因：用户要求当前执行目录下记录计划、尝试和实时笔记；仓库当前没有专门的 dev verification 目录，因此创建最小专用目录。
- 结果：完成。

## Experiment 3：补 focused red tests

- 时间：2026-05-28
- 方案：先新增 focused tests，再运行 `npm test -- test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts`。
- 原因：需要证明 corrective gaps 是真实缺口，而不是直接把 Story 勾选。
- 结果：
  - `test/install-module-selection.test.ts` 失败：summary 未包含 `Canonical package roots: core=13, sdlc=40, total=53.`。
  - `test/install-progress-ready-summary.test.ts` 失败：skill-index 缺少 selected package root 时 ReadyCheck 仍返回 success。
  - `test/ide-target-writer.test.ts` 与 `test/menu-target-validation.test.ts` 新增分层测试通过，证明现有 writer / validation 方向基本正确。

## Experiment 4：最小实现修正并跑 focused green

- 时间：2026-05-28
- 方案：
  - 在 config final summary 与 ready summary 中加入 selected module package root counts。
  - 给 `runReadyCheck` 增加内部 `selectedModules` inventory 输入，并在 install flow 传入当前 selected modules。
  - ReadyCheck 对照 selected module package roots 与 `skill-index.json`，并校验 IDE target reported skill count 与 skill index target count 一致。
- 原因：补足 Story 1.3 / 1.6 corrective gaps，同时保持 public JSON contract 不变。
- 结果：`npm test -- test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts` 通过，4 files / 27 tests。

## Experiment 5：targeted verification、full regression 与 diff check

- 时间：2026-05-28
- 方案：运行用户最低验证集扩展版、全量 `npm test` 和 `git diff --check`。
- 原因：确认 corrective patch 没有破坏 Epic 1/2 现有行为，也没有引入 whitespace / conflict marker 问题。
- 结果：
  - `npm test -- test/source-and-modules.test.ts test/runtime-structure.test.ts test/install-module-selection.test.ts test/manifest-discovery.test.ts test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts` 通过，7 files / 52 tests。
  - `npm test` 通过，20 files / 116 tests。
  - `git diff --check` 通过。

## Experiment 6：Story 收尾与最终验证

- 时间：2026-05-28
- 方案：更新 6 个 reopened Story 的允许区域，勾选 corrective tasks，补 Dev Agent Record / File List / Change Log，将 Story 与 `sprint-status.yaml` 推到 `review`，再跑最终验证。
- 原因：`bmad-dev-story` 完成门槛要求 tasks/subtasks 全部勾选、Story 状态进入 review、sprint tracking 同步。
- 结果：
  - 6 个 Story 均为 `Status: review`。
  - 6 个 Story 均无未勾选 `- [ ]` task/subtask。
  - `sprint-status.yaml` 中 6 个 reopened Story 均为 `review`。
  - 最终 `npm test` 通过，20 files / 116 tests。
  - 最终 `git diff --check` 通过。
  - `bmad-dev-story` 的 `workflow.on_complete` 为空，无额外 terminal instruction。
