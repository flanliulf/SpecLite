# Experiment Notes（实验备注）

## 2026-09-02 23:03:46 CST — Initial Decision（初始决策）

- 实时判断：Epic 11 planning readiness 与 Story Review 已通过，可以进入 Story lifecycle，但 implementation authorization 仍由 Story 11.1 `story-kickoff` gate 控制。
- 决策原因：IR 明确要求从 Story 11.1 开始并严格按 `11.1 → 11.10` 串行；Story 11.1 Dependency Gate 明确要求 unresolved-token issue-id 决策在 kickoff 中关闭。
- 风险：若 development agent 把 Story 11.2/11.3 的 installer、manifest、module metadata 或 workflow projection 混入本 Story，将构成 scope creep；若自由生成未注册 issue ID，将违反 `SPEC 07` taxonomy owner 边界。
- 待关注问题：优先评估在 `SPEC 07` 注册 `artifact-path.unresolved-token`；若复用已有 issue ID，必须给出可复核 taxonomy rationale。任何 `DECISION_NEEDED` 都不得被 tracker 的 `ready-for-dev` 状态绕过。
- 用户介入点：仅当 gate 决策会改变需求边界、需要修改未授权文件、删除内容或 push 时请求用户；普通 bounded engineering decision 采用最保守、可追溯方案并写入日志。

## 2026-09-02 23:27:09 CST — Development Result（开发结果）

- 实时判断：Story 11.1 development 已完成，可进入独立 CR Reviewer；不得因 development tests 通过而跳过 Reviewer/Evaluator 双 gate。
- 决策原因：两份 Flow Gate 的 frontmatter 已 live 核验为 target/storyKey 精确匹配且 `PASS`；Story/tracker 均为 `review`。
- 风险：当前工作树包含 Story 11.1 implementation、SPEC 07、Flow Gates、Story/tracker 与编排日志；后续 Reviewer 必须把未跟踪的新 resolver/test/gate 文件纳入审查输入，不能只看 tracked `git diff`。
- 待关注问题：重点核验 path normalization/symlink boundary 抽取是否改变既有行为、unresolved-token redaction 是否完整、fresh/existing/mixed mode 与 no-write/no-migration 是否真正由 tests 证明。
- 用户介入点：若 Reviewer 产生 `decision_needed`，先交 Evaluator 判断；外层不会在 Reviewer 阶段自行修复。

## 2026-09-02 — Reviewer Result（审查结果）

- 实时判断：Reviewer finding 有具体代码路径与定向复现，必须交由独立 Evaluator；不能因全量测试绿而直接 dismiss，也不能由外层抢跑修复。
- 决策原因：CR workflow 明确要求 Reviewer 与 Evaluator 分离，Fixer 只能消费 evaluator-approved findings。
- 风险：Story 对 provenance handoff 的措辞是否构成 hard AC、还是仅 Guidance/consumer-future requirement，需要 Evaluator 对 Story、Dev Notes 与实现边界进行精确解释。
- 待关注问题：Evaluator 应核对 `resolveProjectConfig()` full-read source map 行为、七类 root effective dotted-key provenance 的必要形状，以及修复是否会无意改变通用 config-reader public behavior。
- 用户介入点：当前 finding 为 `patch` 而非 `decision_needed`；若 Evaluator 仍确认 bounded fix，无需用户介入。若修复必须改变需求/公开 schema，则停止请求授权。

## 2026-09-02 — Evaluator Gate（评估门禁）

- 实时判断：唯一 finding 已被独立确认为 P1，满足进入 Fixer 的条件；不得将其降级为 TODO 或因 tests 绿而跳过修复。
- 决策原因：Evaluator 将 provenance handoff 绑定到 Story 11.1 Project Structure Notes 与 Functional Anchor，并确认现有 wrapper 已把空 `configSources` 当完成证据暴露。
- 风险：修复通用 `selectSourceMetadata()` full-read 语义可能影响所有 config/customization consumers；Fixer 必须补 no-key full-read regression，并运行 full suite。优先选择最小变更，不能重写 merge logic。
- 待关注问题：legacy fallback provenance 必须能关联 `core.output_folder` 与 `modules.sdlc.planning_artifacts` 的 effective source；team/user custom override 必须返回正确 source role/path。
- 用户介入点：无。若实现发现必须修改 evaluator 未授权的 public schema、Story 或 consumer surface，Fixer 必须 HALT。

## 2026-09-02 — Fixer Result（修复结果）

- 实时判断：Evaluator-authorized provenance gap 已按最小方式修复，但 full suite 未全绿，因此不能进入 closeout；必须重新 Reviewer/Evaluator。
- 决策原因：Fixer 后强制复审复评，且现有 anchor test failure 可能是合理的 expectation 更新，也可能揭示通用 reader contract 漂移，不能由外层主观裁决。
- 风险：如果 `test/contract-anchors.test.ts` 的 `sources: {}` 是刻意保护的 public contract，当前 source selection change 可能扩大行为；如果只是陈旧 anchor，则需要新 evaluator 明确授权更新该 test。
- 待关注问题：Reviewer Round 2 应确认 anchor 的意图、是否有 docs/schema 对 no-key full-read sources 为空作出外部承诺，以及 Round 1 P1 的 custom/fallback provenance 是否持续成立。
- 用户介入点：暂不需要。只有新 Evaluator 判定需要改变 public contract/需求边界时才请求用户；若只是 bounded stale test expectation，可进入下一 fixer。

## 2026-09-02 — Reviewer Round 2 Result（第二轮复审结果）

- 实时判断：历史 P1 已关闭，但 Reviewer/Evaluator 双通过条件尚未满足；必须评估新 anchor finding。
- 决策原因：Reviewer 给出 specific failing test 与相关 public output 反证，支持“stale test expectation”假设，但 Reviewer 无权授权修复。
- 风险：直接把 anchor 改为当前 received shape 可能过度耦合 metadata；Evaluator 应判断应精确断言 `core.project_name` provenance，还是收窄为 schema/value/issue/exitCode 并单独锚定 sources shape。
- 待关注问题：修复范围应优先只包含 `test/contract-anchors.test.ts`，不得回退 runtime provenance；修复后需 full suite 重新转绿。
- 用户介入点：若 Evaluator 认定只是 stale test anchor，无需用户介入；若认定存在 public contract choice，则停止并请求明确选择。

## 2026-09-03 — Evaluator Round 2 Gate（第二轮评估门禁）

- 实时判断：已满足进入第二轮 Fixer 的条件；允许修复范围只有一个 test expectation。
- 决策原因：Evaluator 独立证明 machine output 只输出 `result.value`、human no-key 仍显示 `multiple`，内部 leaf sources 不改变 public contract；full suite 失败由 stale direct-API anchor 单独造成。
- 风险：Fixer 不得通过回退 runtime 让旧 anchor 转绿，也不得顺手重构该 test 文件其他 anchors。
- 待关注问题：expected 应锚定 `core.project_name` 的 leaf key、`_speclite/config.toml` 与 `required-config`，可补不含顶层 `core`，但不扩展到 unrelated roots。
- 用户介入点：无。若修复后出现新的 full-suite failure，Fixer 必须停止并回报，不得扩大 scope。

## 2026-09-03 — Fixer Round 2 Result（第二轮修复结果）

- 实时判断：两个 evaluator-authorized P1 均已有修复证据，full suite 已转绿；现阶段满足进入 Reviewer Round 3，不满足直接 closeout。
- 决策原因：CR completion 要求 fixer 后重新 reviewer/evaluator，且必须以最新两份产物为准。
- 风险：Reviewer 需要确认 anchor 更新没有弱化 schema/value/issues/exitCode 断言，且未把 internal leaf provenance泄露到 public CLI output。
- 待关注问题：Round 3 应明确列出 Round 1 provenance P1、Round 2 stale anchor P1 的关闭证据，并重新检查未跟踪 resolver/tests/gates 全量 diff。
- 用户介入点：当前无。若 Reviewer 发现新问题，继续进入独立 Evaluator；不得自行修复。

## 2026-09-03 — Reviewer Round 3 Pass（第三轮复审通过）

- 实时判断：最新 Reviewer 已满足通过条件，但 CR 双 gate 尚缺 Evaluator Round 3，不能提前执行 closeout。
- 决策原因：Orchestrator completion criteria 要求最新 Reviewer 与最新 Evaluator 同时通过，且历史 fixer 后已完成复审。
- 风险：Evaluator 仍需独立检查 Reviewer 是否把测试 green 错当成 contract 完整性，尤其是 public source output、Flow Gate freshness 与 11.2+ no-diff boundary。
- 待关注问题：若 Evaluator 通过，closeout 必须按 CR04 → CR05 → CR06 串行，且每一步后更新日志。
- 用户介入点：无。若 Evaluator 发现新 P1，重新进入 fixer loop。

## 2026-09-03 — Evaluator Round 3 Pass（第三轮评估通过）

- 实时判断：最新 Reviewer 与 Evaluator 均通过，满足进入 CR closeout 的必要条件。
- 决策原因：Evaluator 独立复核 Story AC/anchors、source/tests、public output、Flow Gates、tracker 和 11.2+ no-diff boundary，未发现新问题。
- 风险：CR04 的规则升格不能借 closeout 修改未经授权的全局文档；CR05 不得把已修复 P1 当 open TODO；CR06 不能仅凭“通过”关键词而忽略 completion gate、Story current status 与 strict-serial tracker。
- 待关注问题：若 CR04 候选规则建议 global-doc，默认只做 record-only 或保留建议，不改全局文档；CR05 预计无新增 TODO；CR06 完成后 Story 11.2 应仍保持 `ready-for-dev`。
- 用户介入点：Epic 11 尚未全部完成，不涉及 Epic status 更新确认；不 push。

## 2026-09-03 — CR04 Record-only Result（规则沉淀结果）

- 实时判断：CR04 可以完成，且无需全局文档修改。两个可复用结论均已解决：artifact-root resolver handoff 的 leaf dotted-key provenance 作为新规则沉淀；stale contract anchor 属于既有 `CR-API-13` 的跨 Story 复现。
- 决策原因：Round 1/2 findings 都有 reviewer/evaluator/fixer/复审证据，状态明确为已关闭；外层编排只授权 record-only，明确禁止修改 project-context、Architecture、AGENTS、CLAUDE 或其他全局文档。
- 风险：若把已修复 P1 当成 open TODO，会重复管理；若把 `CR-API-13` 再创建新编号，会制造重复规则。因此本次仅新增 `CR-API-34`，并更新既有 `CR-API-13` 的索引来源与评分。
- 待关注问题：CR05 应以所有 11-1 CR summaries/evaluations 再次核验 deferred/non-blocking candidates；预期新增 TODO 为 0，但不能跳过读取输入。
- 用户介入点：无。CR04 没有识别需要用户决策的 global-doc 候选或未解决非阻塞项。

## 2026-09-03 — CR05 TODO Result（待办提取结果）

- 实时判断：CR05 无新增 backlog 条目，`cr-todo-backlog.md` 不应被无意义改写。
- 决策原因：全部 11-1 CR summaries/evaluations 中只有两个已修复 P1 和明确的 “CR TODO 0 / 无需新增 TODO” 结论；没有未解决的非阻塞 finding。现有 backlog 的 open 项均来自其他 Story。
- 风险：把 Round 1 provenance P1 或 Round 2 stale anchor P1 写成 open TODO 会与 Round 3 closure evidence 冲突；把 build-generated packaging hash churn 写成 TODO 也会扩大 scope，因为各轮记录均显示该 drift 已恢复且不纳入 Story 11.1 finding。
- 待关注问题：CR06 需要重新核验 Story 当前为 `review`、completion gate 为 `PASS` 且 target/storyKey 匹配，然后只同步 Story 11.1 与 sprint tracker 状态。
- 用户介入点：无。Epic 11 仍有 11.2-11.10 未 done，不触发 Epic 状态更新确认。

## 2026-09-03 00:36 CST — CR06 Finalizer Result（状态收尾结果）

- 实时判断：Story 11.1 满足 finalizer 条件，已完成状态同步；不得继续推进 Story 11.2。
- 决策原因：最新 evaluation `11-1-code-review-evaluation-20260903-round-3.md` 明确通过且允许 closeout；completion gate 是 `speclite.flow-gate-report.v2`，`mode: story-completion`、`target/storyKey` 均匹配本 Story，`result: PASS`；Story/tracker 入场状态均为 `review`。
- 风险：Epic 11 仍有 11.2-11.10 为 `ready-for-dev`，因此不能更新 Epic 11 为 `done`；`bmm-workflow-status.yaml` 不存在，不能臆造 planning tracker。
- 待关注问题：后续如继续 Epic 11，应从 Story 11.2 的 kickoff gate 开始；Story 11.1 的 closeout 不代表后续 Story 已获实现或 completion 证据。
- 用户介入点：无。未 commit、未 push，未更新全局文档。
