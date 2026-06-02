# PLAN（计划）

## Objective（目标）

对 reopened 的 Epic 1 / Epic 2 Story 做 corrective dev verification，不重新开发 Epic 1/2，只针对新增 AC / corrective tasks 进行最小实现校正、测试验证和 Story 记录收尾。

## Scope（范围）

- Story 1.3：补足 full canonical package root closure 在 install scope / configuration summary 中的 evidence。
- Story 1.5：核对 IDE mirror、skill index、files index 已覆盖全部 selected canonical package roots。
- Story 1.6：让 ReadyCheck 绑定 full canonical installed set，避免 partial install 被误判 ready。
- Story 2.1：证明 full skill inventory 与 help / phase projection 分层。
- Story 2.2：证明 IDE mapping 覆盖全部 selected package roots。
- Story 2.3：证明 phase coverage 不是 full installed inventory，缺 help/phase row 的 installed skill 不应被误报。

## Work Plan（执行计划）

1. 建立本轮执行记录：`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
2. 基于当前代码和测试证据确认缺口，只做必要最小补丁。
3. 优先补测试，再补实现：
   - `test/install-module-selection.test.ts` 覆盖 summary 中 canonical package root counts。
   - `test/install-progress-ready-summary.test.ts` 覆盖 ReadyCheck 缺少 full selected package root 时失败。
   - `test/ide-target-writer.test.ts` / `test/menu-target-validation.test.ts` 覆盖 no-help-row 与 full inventory 分层。
4. 更新实现：
   - install/config summary 显示 selected module package root counts。
   - ReadyCheck 对照 manifest installed modules 与 skill index module/package evidence，并校验 `ideTargets[].skillCount` 与 skill index/mirror 可见 entry 数一致。
5. 运行验证：
   - `npm test -- test/source-and-modules.test.ts test/runtime-structure.test.ts test/install-module-selection.test.ts test/manifest-discovery.test.ts test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts`
   - `npm test`
   - `git diff --check`
6. 仅在验证通过后更新 6 个 Story 的允许区域：
   - Corrective task checkboxes。
   - Dev Agent Record / Debug Log / Completion Notes。
   - File List。
   - Change Log。
   - Status 改为 `review`。
7. 同步 `sprint-status.yaml` 中这 6 个 Story 为 `review`，保留其他状态和注释结构。

## Guardrails（边界）

- 不重做原实现。
- 不修改 planning artifacts、source assets 或无关 Story。
- 不回滚当前工作树中已有用户改动。
- 不引入新依赖。
- 不新增未契约化 public JSON 字段。
