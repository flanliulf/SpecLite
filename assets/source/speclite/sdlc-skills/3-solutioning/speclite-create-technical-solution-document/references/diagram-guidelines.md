# Diagram Guidelines（图表指引）

## Selection Matrix（选型矩阵）

| 要回答的问题 | Mermaid 类型 | 重点 |
|---|---|---|
| 涉及哪些系统、边界和依赖 | `flowchart` | 系统边界、方向、信任域 |
| 系统内部有哪些组件 | `flowchart` + `subgraph` | 模块职责、调用关系 |
| 跨系统调用顺序是什么 | `sequenceDiagram` | 参与方、协议、同步/异步、失败分支 |
| 状态如何迁移 | `stateDiagram-v2` | 事件、guard、终态、非法转换 |
| 领域对象如何关联 | `classDiagram` | 聚合、关系、关键职责 |
| 数据实体如何关联 | `erDiagram` | 主外键、基数、核心字段 |
| 发布或迁移如何推进 | `flowchart` | 顺序、检查点、回滚分支 |

除非目标 renderer 已验证相应扩展，不使用 Mermaid C4、实验性语法或 renderer-specific directive。

## Readability Rules（可读性规则）

- 一张图只回答一个核心问题；建议不超过 7–9 个主要节点或 6 个 sequence participants。
- 超过限制时按系统层、业务阶段、happy path / failure path 或同步 / 异步拆图。
- 图前写“图示目的”，图后写“关键结论”；图表不得代替正文解释。
- 节点使用业务或系统名称，避免直接使用类名堆砌架构图。
- Current 与 Target 使用相同方向和术语；Changed、Unchanged、External 必须由文字或图例区分，不能只依赖颜色。
- 箭头标注动作、协议或事件；避免无标签连线。
- 不使用大段自定义样式、装饰性 emoji 或低对比度配色影响打印和黑白阅读。

## Multi-system Sequence Rules（跨系统时序规则）

- participant 按调用链从左到右排列，名称与系统职责表一致。
- 同步调用标注 protocol、timeout 和主要 response；异步调用标注 topic / event、delivery 语义和 consumer。
- 使用 `alt` 表达失败与降级，`opt` 表达可选行为，`par` 表达并行处理，`loop` 必须有退出条件。
- 标注 authentication / authorization boundary、idempotency key、correlation id 和重试责任方。
- 大型端到端时序拆为 overview 与场景级 detail，不把所有消息压入单页。

## Prompt Contract（生成提示约束）

生成每张图前先回答：

1. 这张图要解决什么评审问题？
2. 读者需要看到哪些边界，哪些细节应下钻到另一张图？
3. Current、Target、External 和 Changed 如何区分？
4. 跨系统调用的失败、超时、重试、幂等和降级是否可见？
5. 图中的每个术语是否已在正文或 Glossary 定义？

Mermaid 代码必须使用 CommonMark fenced code block。若目标项目有 renderer，实际渲染后检查截断、交叉线、字号和分页；只有结构检查时必须明确说明 render verification 未执行。
