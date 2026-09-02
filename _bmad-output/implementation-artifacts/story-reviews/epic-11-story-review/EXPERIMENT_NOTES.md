# Experiment Notes（执行笔记）

## Current Judgment（当前判断）

- 当前任务是 Epic 11 的首轮 Epic-level SR，不复用旧轮次结论。
- Epic 11 已有 10 个 implementation Story 文件，Reviewer 必须按 Epic 模式覆盖全部 Story，并启用跨 Story 一致性与依赖检查。
- 当前工作树干净，后续任何新增 diff 均可按 SR 闭环来源追踪，但最终提交前仍须重新审计。

## Decision Rationale（决策原因）

- `epic_id` 取 11：直接来自当前对话中的 active Epic、fresh IR 与紧接的用户指令，不存在多个候选 Epic。
- 使用严格串行：Reviewer、Evaluator、Fixer 之间不得并行；只有 Evaluator 明确确认需要修订时才授权 Fixer 修改 Story 文档。
- 默认中文 Conventional Commit、本地提交、不 push：遵循 Goal Orchestrator 的 commit policy。

## Risks（风险）

- Story 11.5、11.8、11.9、11.10 为高触达面 Story，审查与修订不得扩大到无关治理清理。
- Epic 11 要求 strict-serial implementation；SR 可以覆盖全部 Story，但不得借 SR 推进 Story 状态或开始实现。
- Reviewer 内部可以按其 Skill 规则执行多层审查；外层仍保持 Reviewer → Evaluator → Fixer 串行。

## User Intervention Points（用户介入点）

- 若修订会改变需求边界、修改 Epic 11 之外的未授权文件、删除内容或需要 push，停止并请求用户确认。
- 普通、可追溯且不改变范围的 Story 文档修订由 Evaluator 授权后交给 Fixer，无需中断等待。

## Round 1 Reviewer Judgment（第 1 轮 Reviewer 判断）

- Reviewer 的正式结论不是通过：Story 11.2 与 11.5 被判定为硬阻塞，Story 11.3、11.4、11.8、11.9 为有条件通过。
- 两个高严重度 finding 都涉及 owning contract 边界：Story 11.2 的 public JSON / manifest projection 与 `SPEC 01` / `SPEC 04`，以及 Story 11.5 的 whole/sharded decision table 与 `SPEC 09`。
- 两个 patch finding 涉及 `SPEC 07` stable diagnostic registry scope，以及 Story 11.4 exact path / canonical Skill ID 表达。
- Reviewer 降级为单一 LLM fallback 是已披露的执行限制，不自动否定 summary；Evaluator 必须独立核验每条 finding 的证据、有效性、修订授权与范围，不能仅复述 Reviewer。
- 当前不得进入 Story 11.1 kickoff，也不得由外层直接修订任何 Story；必须先完成 Evaluator gate。

## Round 1 Evaluator Decision（第 1 轮 Evaluator 决策）

- Evaluation 整体结论为“需修订后再审”，因此满足启动 SR Fixer 的条件。
- P1 只阻塞 Story 11.2 与 11.5 各自 implementation，不否定 fresh IR 的 Epic 11 `READY`，也不表示 SR Fixer 可以修改 owning SPEC。
- Fixer 的 P1 授权仅是把 `SPEC 01` / `SPEC 04` / `SPEC 09` 的 owner decision、同变更条件或 no-schema-change rationale 写清到对应 Story；不得替 owner 决定实际 schema 或把 Story-local contract 冒充为 owning SPEC 已更新。
- P2 授权仅限：Story 11.3、11.8、11.9 的 stable diagnostic owner范围表达，以及 Story 11.4 AC 1-4 的完整 path / canonical Skill ID 精确化。
- 任何超出六个授权 Story 的修改，或对 Epic、SPEC、Architecture、IR、源码、tracker、SR summary/evaluation、编排日志的改动，均属于越界，必须拒绝。

## Round 1 Fixer Result（第 1 轮 Fixer 结果）

- Fixer 严格停留在六个获批 Story，并按 SR03 要求只额外追加 Round 1 evaluation 的修订执行记录。
- P1 的处理方式是增加 owner-decision / owner-gated 同变更条件，并未提前修改或伪造 `SPEC 01`、`SPEC 04`、`SPEC 09` 已完成；这符合 evaluation 授权，但是否充分关闭 Reviewer finding 必须由 Round 2 Reviewer/Evaluator 独立判断。
- P2 的处理补齐了 `SPEC 07` / shared CR contract 的唯一 owner 选择边界，以及 Analysis AC 的完整 path / canonical Skill ID。
- 主代理 diff 审计未发现越界；工作树当前的 tracked 修改仅为六个 Story，SR 目录内产物与编排日志为 untracked，均属于本 goal 范围。
- 不能把 Fixer 自报“已完成”视为 SR 双通过；必须继续 Round 2 Reviewer → Evaluator。

## Round 2 Reviewer Judgment（第 2 轮 Reviewer 判断）

- Reviewer 正式结论为“通过”，10/10 Story 通过，未发现新 finding。
- Round 1 的 P1 缺口被判定为已在 Story 文档层关闭；`SPEC 01` / `SPEC 04` / `SPEC 09` 的实际 owner decision 仍保留为对应 implementation kickoff gate，没有被误写成已完成。
- Round 1 的 P2 缺口被判定为已关闭；stable diagnostic owner / rationale / fixture assertion boundary 与 exact path / canonical Skill ID 已补足。
- Reviewer 的内部三层独立 Agent 仍不可用，fallback 已如实披露；因此尤其需要 Round 2 Evaluator 基于 live diff 与 owning contracts 独立确认，不能仅凭 Reviewer“通过”结束 goal。
- 若 Round 2 Evaluator 也通过且不授权新修订，SR 循环才满足双通过 gate，随后进入最终 Git 范围审计与本地提交。

## Round 2 Evaluator Decision（第 2 轮 Evaluator 决策）

- Evaluator 独立确认 Round 1 Finding 1-4 均已在 Story 文档层关闭，Round 2 新 finding 为 0，不授权新 Fixer。
- Reviewer 与 Evaluator 最新轮次均通过，因此满足 Goal Orchestrator 的 SR 循环终止 gate。
- “可直接进入开发”只表示下一步可以从 Story 11.1 `story-kickoff` 开始；Story 11.1 gate 仍缺失，当前不得把 SR 通过写成 Story 已进入 `in-progress`、implementation 已开始或 owning SPEC decision 已关闭。
- 最终提交范围应精确包含：六个获批 Story 文档、Round 1/2 各一份 summary 与 evaluation、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。除此之外均排除；提交后不 push。

## Final Git Decision（最终 Git 决策）

- Included：六个获批 Story 文档修订，以及 Epic 11 SR 目录下 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`、Round 1/2 summary 与 Round 1/2 evaluation。
- Excluded：Epic 11 之外的 planning/solutioning artifacts、owning SPEC、Architecture、IR、源码、tests、tracker、installer/runtime 文件、任何 ignored/local tool 文件与 push 操作。
- 七组提交原因：六个 Story 文件分别对应独立 Story 审查修订，必须按 Story 边界拆分；SR 目录 7 个 artifacts 是同一 Epic-level Story Review 闭环证据，作为最终 `docs(epic-11)` 收口提交。
- Push policy：用户明确授权本地提交、不 push；当前 final commit 不执行 remote push。
- Story 11.1 kickoff 仍未执行；SR 双通过只关闭 Epic 11 Story Review corpus gate，不代表 implementation 已开始、Story 状态已推进或 Flow Gate evidence 已生成。
