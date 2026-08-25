# Source Authority And Provenance（来源职责与溯源）

## Authority By Concern（按关注点划分事实来源）

| Artifact | Owns | Does Not Prove |
|---|---|---|
| PRD | 业务目标、用户价值、能力、范围和产品约束。 | 技术实现已经存在。 |
| UX | 用户动作、交互对象、体验状态和界面行为目标。 | Backend contract 或 runtime behavior 已实现。 |
| Architecture / SPEC / ADR | 系统边界、架构决策、技术契约和 owning policy。 | 每个 Story 已完成或部署。 |
| Epic | 交付切片、solution-level scope 和 Story 分解语义。 | 代码、tests 或 release gate 已通过。 |
| Story | Acceptance intent、局部任务边界和实现指导。 | 当前代码一定符合 Story；Guidance 一定是 hard gate。 |
| Code / Tests / Runtime | 当前实现、可观察行为和验证证据。 | 产品优先级或规划 intent 已被合法改写。 |
| `CONTEXT.md` | 已确认的 ubiquitous language 和避免使用的 aliases。 | 实现细节、完整 SPEC 或 ADR rationale。 |
| Public Glossary | 面向人的短定义、翻译和导航。 | 对 owning artifact 的覆盖权。 |

不要使用一个“最新文件覆盖全部”的顺序。发生冲突时，先判断 concern，再回到对应 owner。

## Provenance Record（溯源记录）

每个 Terminology Inventory record 至少记录：

- exact source form；
- artifact type 与相对路径；
- Epic / Story ID（存在时）；
- section heading 或其它定位信息；
- source status：current、historical、proposed 或 unknown；
- scope 与 bounded context（存在时）；
- Definition 所依据的 source 片段摘要；
- 术语状态：candidate、approved、conflicted 或 deprecated。

Sources 单元格可以包含多个相对链接；禁止记录无助于复核的“来自文档”等模糊来源。

## Conflict Routing（冲突路由）

| Conflict | Owner To Consult | Default Action |
|---|---|---|
| PRD 与 Epic 的业务范围不同 | PRD / Product owner | 标记 conflicted，Epic 不覆盖 PRD。 |
| Architecture/SPEC 与 Story 固定路径不同 | Owning Architecture/SPEC | 判断 Story path 是 Contract 还是 Guidance，并允许 equivalent implementation policy。 |
| Epic 与 Story 定义不同 | Epic owner / approved Correct Course | 保留两份 evidence，Story 不静默提升。 |
| Glossary 与任何 owning artifact 不同 | Owning artifact | 修订 Glossary projection，而不是反向改 owner。 |
| Code 与 Story intent 不同 | Story + implementation evidence | 记录 target/current delta，不把任一方改写成另一方。 |
| `CONTEXT.md` 与新候选不同 | Domain owner | 交给 `speclite-domain-modeling` 澄清 canonical language。 |

## Historical Sources（历史来源）

Completed Story、retrospective、旧 proposal 和 historical planning snapshot 可以解释过去为什么使用某个术语，但不得未经 current owner 确认就恢复为当前 canonical language。保留原文、时间和替代关系；不为追求表面一致性重写历史记录。

## Implementation Status Wording（实现状态措辞）

从 Epic 或 Story 派生的 Glossary 使用：planned、defined、required、proposed、accepted 等与 source 相符的措辞。只有 code、tests、runtime 或 release evidence 支撑时才使用 implemented、verified、passed 或 released。

如果 evidence 不在本次 scope，写明“本文解释规划语义，不表示相应 Story 已实施或通过验证”。
