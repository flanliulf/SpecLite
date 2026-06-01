# Story 4.6 实验笔记

更新时间：2026-06-01 14:20 CST

## Notes（笔记）

- 当前 `sprint-status.yaml` 显示 `epic-4: in-progress`，Story 4.1-4.5 为 `done`，Story 4.6 为 `ready-for-dev`。
- 已按 dev-story workflow 将 Story 4.6 推进到 `in-progress`，后续完成 DoD 后再推进到 `review`。
- Story 4.6 明确要求 repair 只处理可证明的 installer-owned drift；human-owned、workflow-owned、unknown ownership 和 missing source evidence 不能进入 executable repair actions。
- 当前工作树已有大量无关 dirty/untracked 文件，包括前序 code review 目录、planning artifacts、assets source、`src/update/`、operation-lock/safe-write 相关源码与测试。处理时必须逐文件读取，并只在 Story 4.6 需要范围内修改。
- TDD 红灯已确认：现有 `planRepair` 不生成 `RepairPlan.actions[]`，`--yes` 也不会通过 safe write 应用修复；human-readable repair 输出仍沿用 `Update Plan / Planned Effects` 标题。
- 当前实现已让 focused tests 从红转绿：repairable installer-owned drift 会进入 `repairPlan.actions[]`，未授权不写入，`--yes` 通过 safe write 记录 `changedPaths`，protected/missing evidence 仍为 conflicts。
- 增补 IDE mirror package 级 repair 后，全量测试为 29 files / 198 tests 通过；`git diff --check` 通过。
- Story 4.6 已按 dev-story 边界推进到 `review`；未启动 reviewer/evaluator/fixer/rules/todo/finalizer，未做 commit/push。

## Risks（风险）

- 前序 Story 4.1-4.5 的源码在当前工作树中可能尚未提交但已存在；需要以 live source 为准，避免覆盖。
- Story 4.6 范围大，测试应优先覆盖 public contract、planner eligibility、授权语义和 deterministic ordering，避免引入超出 MVP 的 source channel / fixture matrix 实现。

## Reviewer Round 1（审查第 1 轮）

- `Agent` 子工具在当前 Codex 环境不可用；未创建 `.tmp/` 审查中间目录，按 skill 降级策略在当前上下文完成审查。
- 复核 Story 4.6 AC 1-8、repair planner、authorized apply、CommandResult schema、human-readable Evidence profile 和 focused tests。
- 主要通过项：`update --repair` 已归一化为 `update.repair`；未授权 / dry-run 路径不填 `changedPaths` / `skippedPaths`；human-owned、workflow-owned、unknown ownership、missing-source-evidence 在当前测试覆盖下保持 conflict；`issues[]` 投影为单个 `update.conflicts`；`RepairPlan.actions[].expectedHash` schema 为必填。
- 阻塞发现：IDE mirror package 级 `restore-canonical` apply 只遍历 canonical source files 并写回目标，未移除目标 package 中 canonical hash 语义内的额外文件。如果 drift 是 `references/obsolete.md` 这类多余文件，repair 可返回 success，但后续 package hash 仍与 `expectedHash` 不一致。
- 本轮结论：不通过；`decision_needed=0`、`patch=1`、`defer=0`、`dismiss=0`。

## Evaluator Round 1（评估第 1 轮）

- 本轮严格只执行 evaluator，不启动 fixer、reviewer、finalizer，不提交 git。
- 已核对 reviewer summary、Story 4.6 AC/Tasks 与当前实现：Story 要求 IDE mirror 可恢复 drift 进入 `restore-canonical`，action 带 `expectedHash`，授权 repair 后真实报告结果。
- `isCanonicalPackageHashFile()` 会把 `references` / `assets` / `scripts` 等目录纳入 canonical package hash；`hashPackageDirectory()` 会把 include 范围内文件名和内容纳入 hash，因此目标包内额外 `references/obsolete.md` 会影响 package hash。
- 当前 IDE mirror repair planner 生成 package-level `restore-canonical`，`expectedHash` 是 `entry.canonicalPackageHash`；apply 阶段只遍历 source package 文件写回目标，未处理 target-only canonical-hash 文件，也未复算目标 package hash。
- 评估结论：reviewer finding 确认有效，非误报；本轮不通过，需修复 1 项。
- 推荐修复边界：仅处理 IDE mirror package 级 installer-owned canonical-hash drift；删除 target-only hash 文件并记录 changed path，或在 MVP 不支持删除/无法证明时转 blocking issue/conflict；apply 后必须校验 package hash 不再误报 success。不得扩大到 human/workflow/unknown/protected 覆盖。

## Fixer Round 1（修复第 1 轮）

- 本轮严格只执行 fixer，不启动 reviewer、evaluator、finalizer，不提交 git。
- 修复项只有 evaluation round 1 确认的 P1：package 级 `restore-canonical` 的 `expectedHash` 是 package hash，repair 不能只写回 source 中存在的文件后误报 success。
- 采用最小可验证修复：IDE mirror package repair 先比较 source package 与 target package 的 `isCanonicalPackageHashFile()` 文件集合，删除 target-only canonical-hash 文件并记录 changed path，再写回 source 文件。
- 增加 post-apply 校验：repair apply 完成后重新计算 target package canonical hash；若不等于 action `expectedHash`，返回 `update.repair-postcondition` blocking issue，避免 misleading success。
- 安全边界保持不变：该删除逻辑只在 IDE mirror package 级 `restore-canonical` action 内执行，不覆盖 human-owned、workflow-owned、unknown ownership 或 protected files，不改变普通 `speclite update` 语义。
- Focused regression 覆盖 `.agents/skills/speclite-help/references/obsolete.md`：授权 repair 后文件被删除，changedPaths 包含删除路径，target package hash 等于 canonical package hash。

## Reviewer Round 2（审查第 2 轮）

- `Agent` 子工具在当前 Codex 环境不可用；按 skill 降级策略在当前上下文串行完成三层视角审查，未创建 `.tmp/` 中间目录。
- Round 1 唯一 patch 已修复：`applyIdeMirrorRepairAction()` 先读取 source / target package 的 `isCanonicalPackageHashFile()` 文件集合，删除 target-only canonical-hash 文件并记录到 `changedPaths`，随后写回 source files。
- postcondition 已补齐：IDE mirror package repair 完成后复算 target package hash；若不等于 action `expectedHash`，返回 `update.repair-postcondition` error issue，`createRepairCommandResult()` 会将 error issue 投影为 failure / exit code 1。
- 删除范围核查通过：该逻辑只在 skill index 匹配到的 `.claude/skills/<id>` / `.agents/skills/<id>` package-level `restore-canonical` action 内执行；human-owned `_speclite/custom/*`、workflow-owned `_speclite-output/*`、unknown ownership 与 missing source evidence 仍在 repair planning conflicts 中覆盖。
- Regression 覆盖通过：`test/update-planning.test.ts` 新增 `.agents/skills/speclite-help/references/obsolete.md` 场景，断言文件被删除、changedPaths 包含删除路径、target package hash 恢复为 canonical package hash。
- 范围核查通过：未发现 Story 4.7、Epic 5/6、top-level repair command、backup/restore、standalone report artifact 或普通 update overwrite 语义 creep。
- 本轮结论：通过；`decision_needed=0`、`patch=0`、`defer=0`、`dismiss=0`。

## Evaluator Round 2（评估第 2 轮）

- 本轮严格只执行 evaluator，不启动 fixer、reviewer、finalizer，不提交 git。
- 评估对象为最新 reviewer 输出 `4-6-code-review-summary-20260601-round-2.md`；Reviewer 结论为通过，且无新 findings。
- 独立核对确认 Round 1 patch 已修复：IDE mirror package repair 会删除 target-only canonical-hash 文件、记录 `changedPaths`，并在 apply 后复算 target package hash。
- `update.repair-postcondition` 为 apply 阶段 error issue；CommandResult projection 会将 error issue / blocked command 投影为 failure，避免 misleading success。
- 安全边界核对通过：human-owned、workflow-owned、unknown ownership、missing source evidence 仍不进入 executable repair actions；protected/source-unsafe regression 仍覆盖该边界。
- Regression 核对通过：新增 extra canonical-hash file 测试断言删除 `.agents/skills/speclite-help/references/obsolete.md`、记录 changed path，并恢复 canonical package hash。
- 本轮结论：通过；需修复 0 项，可忽略 0 项，待讨论 0 项，CR TODO 0 项。

## Rules Extractor 04（规则提炼）

- 本轮严格只执行 `bmenhance-cr-04-rules-extractor`，尚未启动 05 TODO Tracker 或 06 Finalizer。
- 04 输入包含 Story 4.6 两轮 reviewer summary 与两轮 evaluator evaluation；Round 1 唯一 patch 已修复，Round 2 reviewer/evaluator 均通过，CR TODO 为 0。
- 候选经验为：IDE mirror package 级 `restore-canonical` 不能只写回 source files 后报告 success，必须处理 target-only canonical-hash files，并用 post-apply `expectedHash` 校验阻断 misleading success。
- 升格判定采用保守默认：该经验有证据、可规则化、状态明确，但与既有规则/契约高度重叠，不满足“不重复”硬性门槛。
- 重叠依据：既有 CR rules 已覆盖 canonical hash walker include 边界、protected ownership 优先、source evidence fail-closed、非事务写入 partial progress；规划文档也已要求 `update --repair` repair plan 列出 expected hash、保护 human/workflow files。
- 因此本轮不更新 `cr-rules-summary.md`，不修改 project context / architecture / planning docs，也不向 05 交接 TODO。

## TODO Tracker 05（待办追踪）

- 本轮严格只执行 `bmenhance-cr-05-todo-tracker`，在 04 完成后启动，尚未启动 06 Finalizer。
- 对 4.6 全部 CR summary/evaluation 执行非阻塞候选检索；Round 1 是 blocking patch 且已修复，Round 2 明确 Non-Blocking Follow-Ups 无，evaluator 记录 CR TODO 0。
- 现有 `cr-todo-backlog.md` 有 3 个 open 项：TODO-001 resolve parity fixture 外置、TODO-002 generatedAt contract、TODO-003 默认 `npm test` 5s timeout 慢测治理。
- TODO-003 涉及 update tests，但 Story 4.6 本次只是新增/运行相关 regression，并未处理默认 timeout/慢测治理；按建议时机仍应留到 Epic 6 release confidence / 测试稳定性治理，不在本 Story 收尾中关闭。
- 因此本轮不新增、不更新、不 resolve CR TODO backlog。

## Finalizer 06（状态收尾）

- 本轮严格只执行 `bmenhance-cr-06-finalizer`，在 05 完成后启动。
- 最新 CR evaluation 为 Round 2，结论通过；这是将 Story 4.6 从 review 推进到 done 的依据。
- Story 文件状态已从 `review` 更新为 `done`；`sprint-status.yaml` 中 4-6 entry 也已从 `review` 更新为 `done`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 当前不存在；按 finalizer 容错规则跳过 workflow status 同步，不创建占位文件。
- Epic 4 判断：`sprint-status.yaml` 中 4-1、4-2、4-3、4-4、4-5、4-6 均为 `done`；按照文件内 Epic 状态定义，Epic 4 可标记为 `done`，本轮已同步更新。
