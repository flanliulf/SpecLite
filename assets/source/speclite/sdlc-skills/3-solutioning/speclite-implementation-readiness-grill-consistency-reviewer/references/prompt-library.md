# Prompt Library（Prompt 组织库）

## Goal Prompt（Goal 级提示）

用于启动一轮或多轮 IR grill：

```text
目标：对目标项目的 PRD、UX、Architecture、Epics / Stories 执行 implementation-readiness 一致性 grill。

输入：
- Canonical PRD：<path>
- Canonical UX：<path>
- Canonical Architecture：<path>
- Canonical Epics / Stories：<path>
- Shared contracts / reports：<paths>
- Prior IR grill records：<paths>

执行规则：
- 使用 speclite-implementation-readiness-grill-consistency-reviewer。
- 使用内建 grill-with-docs 协议：单题追问、推荐答案、证据优先、术语校准、具体场景、文档/代码交叉验证、内联更新。
- 严格串行，每轮 <question_count or 50> 题。
- 每题固定：证据检查 -> grill question -> recommended decision -> 修订 -> 验证 -> 记录。
- 只修改当前问题直接相关 planning artifact 和本轮记录。

输出：
- <output-dir>/goal-execute-records/round-N/PLAN.md
- <output-dir>/goal-execute-records/round-N/EXPERIMENTS.md
- <output-dir>/goal-execute-records/round-N/EXPERIMENT_NOTES.md
- 若本轮产生跨轮次结论、退出判断或下游 gate 变化，则更新 <output-dir>/summary.md

退出：
- 根据 COMPLETE / CONTINUE / BLOCKED 规则收口。
```

## Round Prompt（轮次提示）

用于创建 `PLAN.md`：

```text
本轮为 round-N。

请先读取 prior rounds 的 PLAN / EXPERIMENT_NOTES，列出 Avoided Prior Coverage。
再读取 canonical PRD、UX、Architecture、Epics / Stories 和 shared reports。

本轮 Target: 50。
本轮优先维度：
- <dimension 1>
- <dimension 2>
- <dimension 3>

不要重复 prior rounds 已 fully covered 的主题。
每个 question 只能处理一个缺口。
```

## Single Question Prompt（单题提示）

用于每个 experiment：

```text
处理 R<N>-Q<NNN>。

候选维度：<dimension>
候选问题：<suspected gap>

请先做 Evidence Scan：
- 读取或 grep 相关 PRD / UX / Architecture / Epic / shared contract。
- 如果问题可以由现有文档或代码回答，先用证据回答。

然后输出：
- Grill question
- Risk
- Recommended decision
- Files to update
- Verification command

若推荐决策可以由现有证据支持，则直接按最小范围修订并验证。
若涉及真实业务决策或 canonical source 冲突，则 HALT。
```

## Repair Prompt（修订提示）

用于把问题落成文档修复：

```text
按 R<N>-Q<NNN> 的 recommended decision 修订。

约束：
- 只修改 Files to update 中列出的文档和本轮记录。
- 不修改产品源码。
- 不顺手改相邻但未纳入当前 question 的问题。
- 保留用户或其他会话已有改动，不回滚。

修订应落成具体合同：
- 字段 / DTO / registry / evidence ref / owner / state invariant / gate rule / non-goal / source boundary 中至少一种。
```

## Verification Prompt（验证提示）

用于每题或每轮验证：

```text
请验证 R<N>-Q<NNN> 的修订已经落地。

至少执行：
- rg 检查新增锚点或删除旧误导语义。
- git diff --check -- <changed-files>

如修改 YAML：
- 运行 YAML parse 或项目已有 schema / parser。

记录：
- Verification commands
- Result
- Remaining risk
```

## Final Handoff Prompt（最终交接提示）

用于生成 `summary.md` 或 final update：

```text
请总结 round-<start> 到 round-<end>。

必须包含：
- 执行范围和 question count。
- 维度覆盖。
- 问题分类。
- 每类问题的 targeted recommendations。
- 已更新的 canonical sources。
- Downstream gate：Story Review、Sprint Planning、QA guide、Dev Story 如何消费这些结果。
- Exit status：COMPLETE / CONTINUE / BLOCKED。
```

## Prompt Discipline（提示纪律）

- Prompt 不得要求“批量修复所有发现”；必须保持单题循环。
- Prompt 不得把 “READY” 等同于 implementation complete。
- Prompt 必须显式声明是否允许修订文件；只读任务不得写文件。
- Prompt 必须把 output directory 和 record files 写清。
- Prompt 必须说明 question count，默认 50。

## Version（版本）

- v1.0.0 - 2026-07-04：初始 prompt library。
