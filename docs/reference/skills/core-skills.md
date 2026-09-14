# Core Skills（核心 Skills）

本文记录 `assets/source/speclite/core-skills/` 下的 canonical skill package roots。Core Module 是 required baseline，随默认安装进入目标项目；它提供跨 SDLC 阶段共享的交互、文档、审查和协作能力，不绑定某个具体阶段。本文是快速查阅用 Reference，不替代各 Skill 包内的 `SKILL.md`、`references/` 和 `assets/`。

## Snapshot（当前快照）

| Item | Value |
|---|---|
| Canonical source root | `assets/source/speclite/core-skills/` |
| 当前 package roots | 19 个带 `SKILL.md` 的目录 |
| Phase | 全部为 `anytime`，不占用 SDLC phase coverage 行 |
| Help catalog | `assets/source/speclite/core-skills/module-help.csv` |
| Module metadata | `assets/source/speclite/core-skills/module.yaml` |

> Note: 本快照只描述当前仓库 `main` 的 canonical source。CLI module discovery 以递归发现 `SKILL.md` package roots 为准，`module-help.csv` 提供 menu code 与输出位置，但不是 package root 发现的唯一来源。

## Interaction and Ideation（交互与发散）

| Skill | Menu | Purpose | Output |
|---|---|---|---|
| `speclite-help` | `SH` | 分析当前 SpecLite workflow 状态，回答使用问题或推荐下一步 Skill；是 installed Skill 的默认入口。 | 无固定产物。 |
| `speclite-brainstorming` | `BSP` | 组织互动式头脑风暴，用多种创意技法扩展与筛选想法。 | `{brainstorming_artifacts}` 下的 brainstorming session 文件。 |
| `speclite-advanced-elicitation` | `AE` | 用结构化引导方法推动 LLM 复盘、质疑并改进近期输出。 | 无固定产物。 |
| `speclite-party-mode` | `PM` | 编排多个已安装 SpecLite Agent 进行圆桌讨论，必要时退化为角色扮演。 | 无固定产物。 |
| `speclite-handoff` | `HF` | 把当前会话压缩为可供下一个 Agent 接续的 handoff 文档。 | 由用户指定。 |

## Grilling and Domain Modeling（追问与领域建模）

| Skill | Menu | Purpose | Output |
|---|---|---|---|
| `speclite-grilling` | `GR` | 对计划、决策或想法进行持续追问，帮助用户压力测试自己的思路。 | 无固定产物。 |
| `speclite-grill-with-docs` | `GWD` | 在追问中同步沉淀 ADR 与术语表；调用 `speclite-grilling` 与 `speclite-domain-modeling`。 | 由被调用 Skill 决定。 |
| `speclite-domain-modeling` | `DM` | 建立并锐化项目领域模型，固定 ubiquitous language 并记录架构决策。 | `{solutioning_artifacts}/architecture/` 下的 `CONTEXT.md`、`CONTEXT-MAP.md` 与 `adr/`。 |
| `speclite-drawer-er-modeler` | `ERM` | 基于证据设计 ER 模型并渲染技术型 entity-relationship diagram。 | 由用户指定的输出路径。 |
| `speclite-terminology-governance` | `TMG` | 从规划与实现意图文档中抽取、归一并治理项目术语，生成带 provenance 的 Epic Glossary 与 DDD 候选交接。 | 由用户指定的 glossary root，默认 `{project_knowledge}/glossary/`。 |

> Note: `speclite-grilling` 与 `speclite-grill-with-docs` 当前仍是独立 core skills。把 Grill 能力融合进核心流程 Skills 属于 README Roadmap 项，尚未实施。

## Documents（文档处理）

| Skill | Menu | Purpose | Output |
|---|---|---|---|
| `speclite-index-docs` | `ID` | 为目标目录生成或更新 `index.md` 文档索引。 | 目标目录内的 `index.md`。 |
| `speclite-shard-doc` | `SD` | 按 Markdown 标题把大型 `.md` 文档拆分为有组织的小文件；对 PRD / Epics / Architecture 使用同目录 `index.md` 声明 shards。 | 与源文档同目录的 shards。 |
| `speclite-distillator` | `DG` | 将源文档无损压缩为适合 LLM 使用的高密度 distillate。 | 与源文档相邻，或用户指定的 `output_path`。 |
| `speclite-editorial-review-prose` | `EP` | 审校文本表达问题并给出最小 prose 修复建议。 | 与目标文档同位置的三列修订表。 |
| `speclite-editorial-review-structure` | `ES` | 评审文档结构，提出删减、重组与简化建议而不损失理解。 | 与目标文档同位置的报告。 |

## Review（审查）

| Skill | Menu | Purpose | Output |
|---|---|---|---|
| `speclite-review-adversarial-general` | `AR` | 对内容、spec、story、diff 或文档做批判性审查并产出 findings。 | Markdown findings。 |
| `speclite-review-edge-case-hunter` | `ECH` | 穷举分支路径与边界条件，只报告未处理的 edge case。 | JSON findings。 |
| `speclite-review-acceptance-auditor` | `AA` | 按 Story 验收标准审计代码变更并报告偏差。 | 结构化 Markdown findings。 |

SDLC Module 的 Code Review 链路会自动调用这三个 reviewer；它们也可单独用于文档或方案审查。

## Customization（定制）

| Skill | Menu | Purpose | Output |
|---|---|---|---|
| `speclite-customize` | `SC` | 为已安装 SpecLite Skill 编写或更新 customization 覆盖配置，并验证合并结果。 | `_speclite/custom/` 下的 TOML override 文件。 |

## Boundaries（边界）

- Core skills 不属于某个 SDLC phase，`phase-coverage.json` 只统计 SDLC Module 的阶段覆盖。
- Core skills 的输出位置以 `speclite resolve artifact-roots` 与各 `SKILL.md` 为准；`module-help.csv` 的 `output-location` 是 catalog 提示，不是写入契约。
- 与 Support skills 不同，core skills 会被投影到 `.claude/skills/` 与 `.agents/skills/`；Support skills 只服务 canonical source 维护，不进入默认安装。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| Skill catalog 入口 | [`index.md`](index.md) |
| SDLC 阶段 Skill catalog | [`sdlc-workflows.md`](sdlc-workflows.md) |
| Skill 分类与入口选择 | [`../../explanation/skill-taxonomy-and-sdlc.md`](../../explanation/skill-taxonomy-and-sdlc.md) |
| Workflow 产物目录 | [`../workflow-artifact-layout.md`](../workflow-artifact-layout.md) |
| Canonical source layout | [`../canonical-source-layout.md`](../canonical-source-layout.md) |
| 首次调用 installed Skill | [`../../how-to/use-installed-skills.md`](../../how-to/use-installed-skills.md) |
