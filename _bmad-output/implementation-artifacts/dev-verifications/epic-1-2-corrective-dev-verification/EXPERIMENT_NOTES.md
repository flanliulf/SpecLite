# EXPERIMENT_NOTES（实时笔记）

## 2026-05-28

- 本轮目标是 corrective dev verification，不是重新实现 Epic 1/2。
- 当前工作树很脏，包含大量已有用户改动；只能在目标相关文件上增量修改。
- 初步缺口：
  - `src/commands/install.ts` 里存在 `createPrewriteModuleSummary`，但当前 install flow 未调用它；实际 final summary 在 `src/installer/config-initialization.ts` 中生成。
  - `src/installer/config-initialization.ts` 的 final summary 当前只展示 selected module ids，未展示每个 selected module 的 canonical package root count。
  - `src/installer/ready-check.ts` 当前按 skill-index 已列 entries 检查 mirror 可见性，但没有独立验证 installed module 的 full package root evidence，也没有校验 `ideTargets[].skillCount` 与 skill-index/mirror entry 数一致。
  - `src/ide/target-writer.ts` 已从 `selectedModules.packageRoots` 建 entry，help rows 只是 projection 输入；这个实现方向正确。
- 下一步：先写 focused red tests，再补最小实现。
- Focused red tests 已跑：summary evidence 和 ReadyCheck full inventory gate 是当前真实缺口。
- 实现策略：
  - 在 config final summary 与 ready summary 中加入 selected module package root counts，不新增 public JSON field。
  - 给 `runReadyCheck` 增加内部可选 `selectedModules` 输入；install flow 传入当前 selected modules，ReadyCheck 用它对照 skill-index 和 selected IDE target mirrors。
  - 继续保持 standalone ReadyCheck 的旧调用可用；没有 `selectedModules` 时只执行 installed projection 自洽检查。
- Focused green 已通过。下一步跑用户建议的最低验证集扩展版，再跑 full regression 与 `git diff --check`。
- 验证已通过。下一步只更新 6 个 reopened Story 的允许区域和 `sprint-status.yaml` 对应状态，不碰 planning artifacts 或无关 Story。
- Story 收尾完成：6 个 reopened Story 与 `sprint-status.yaml` 均已进入 `review`。
- 最终验证完成：`npm test` 20 files / 116 tests 通过，`git diff --check` 通过。
- `workflow.on_complete` 为空；下一步应进入 CR / finalizer，而不是继续改实现。
