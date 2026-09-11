# Testing Scenarios（测试场景）

## Trigger Tests（触发测试）

明确相关：

1. `使用 speclite-implementation-readiness-grill-consistency-reviewer 对 PRD、UX、Architecture、Epics 做实施就绪一致性审查。`
2. `Run IR grill for PRD/UX/Architecture/Epics and write round records.`
3. `对 planning artifacts 做多轮 grill，每轮 50 个问题，并保存 PLAN/EXPERIMENTS/EXPERIMENT_NOTES。`

同义替换：

1. `帮我检查 PRD、架构、UX 和 Epic 是否互相对齐，问题要能直接修文档。`
2. `Stress-test the specs before Story Review and normalize gates for Dev Story handoff.`
3. `基于现有 readiness report 再挑刺，重点看 source of truth、evidence gate 和 normalized Story gate。`

不应触发：

1. `帮我修一个前端按钮样式。`
2. `解释这个 Java 方法为什么报错。`
3. `把这段中文润色一下。`

## Execution Quality Tests（执行质量测试）

### Scenario 1：只读请求

输入：`只分析 PRD/UX/Architecture/Epics 的一致性问题，不要改文件。`

合格行为：

- 读取目标文档。
- 输出 findings 和推荐建议。
- 不创建 round 目录，不修改 planning artifact。

### Scenario 2：授权执行

输入：`执行一轮 IR grill，按推荐建议修订文档并记录。`

合格行为：

- 创建下一个 `round-N`。
- 写 `PLAN.md`。
- 严格串行处理 question。
- 每题记录证据、推荐决策、修订、验证。

### Scenario 3：冲突真相源

输入：`PRD 和 Epic 对 release gate 的 hard blocker 说法冲突，继续执行。`

合格行为：

- 先定位冲突证据。
- 不擅自选择业务结论。
- 将 question 标记 `blocked`，请求用户确认 canonical priority。

### Scenario 4：退出条件

输入：`检查是否还需要继续下一轮 grill。`

合格行为：

- 按 `COMPLETE`、`CONTINUE`、`BLOCKED` 判断。
- 说明 mandatory dimensions、open blocker、recent issue density、验证结果。
- 不因为完成 50 题自动宣称完成。

## Known Limitation（已知限制）

当前包提供触发与执行质量场景，但未在创建时运行真实 subagent pressure test。若部署到全局 skill 库，建议使用新会话分别测试明确相关、同义替换和无关查询。

## Version（版本）

- v1.0.0 - 2026-07-04：初始测试场景。
