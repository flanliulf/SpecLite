# Canonical Skill Iteration Context（Canonical Skill 迭代背景）

## Executive Summary（执行摘要）

SpecLite 当前一边使用 BMAD 框架推进自身研发，一边建设类似 BMAD 的 canonical skill 体系。`assets/source/speclite/core-skills/` 和 `assets/source/speclite/sdlc-skills/` 是 SpecLite 本地研发方法论的 canonical 源定义；它们参考 BMAD skill 的职责划分和 workflow 经验，但必须按 SpecLite 自身的 artifact taxonomy、runtime model、flow gate、template 和 evidence contract 重新约束。

因此，BMAD 在本项目开发过程中暴露的问题，应被视为 SpecLite canonical skill 迭代的高价值反馈来源。尤其是 `create-story`、`dev-story`、SR、CR、finalizer 等阶段中出现的 late HALT、anchor drift、path drift 和 evidence drift，不能只作为单个 Story 个案处理，而应抽象成可复用的 skill、template、lint 和 gate 改进。

当前所有直接映射或拆链映射自 BMAD 的 SpecLite canonical skill，均通过 support skill 体系参考 BMAD skill 定义进行体系化和自定义创建。workflow 风格 Skill 使用 `support-skills/speclite-skill-creator` 与 `support-skills/speclite-skill-lint`；`speclite-agent-*` 这类 role activation Agent 定义包使用 `support-skills/speclite-agent-creator` 与 `support-skills/speclite-agent-lint`。后续 `assets/source/speclite/` 下新增或调整 canonical skill 源定义时，默认使用本项目内 support skill，不再回退到外部 `skills-creator` 仓库的通用 creator/lint skill。

## Development Context（开发背景）

本项目 SpecLite 的开发过程当前由 BMAD 框架和 BMAD skills 支撑。BMAD 在这里承担两层角色：

- 实际执行工具：用于创建 Story、推进 Story 开发、执行 review、评估、修复和收尾。
- 方法论参考源：为 SpecLite canonical skill 的职责拆分、交互方式、产物组织和 agent 协作模式提供参考。

SpecLite 的目标不是复制 BMAD 的路径、文件名或运行时细节，而是建立一套可安装到目标项目 AI IDE 中的本地 SDLC skill 体系。该体系应吸收 BMAD 的有效模式，同时修复或规避 BMAD 在实际执行中暴露的流程缺陷。

## Canonical Source Boundary（Canonical 源边界）

`assets/source/speclite/` 是 SpecLite skill 体系的源码区。后续迭代时应区分以下边界：

| Source Area | Role（角色） | Runtime Meaning（运行时含义） |
| --- | --- | --- |
| `core-skills/` | 跨 SDLC workflow 共享的基础能力，例如启发、帮助、文档处理和 review 支撑。 | 属于目标项目可安装的 canonical skill 来源。 |
| `sdlc-skills/` | 按 SDLC 阶段组织的 workflow 和 agent skills，覆盖分析、计划、方案设计、实现和 DevOps 发布阶段。 | 属于目标项目可安装的 canonical skill 来源，是 SpecLite 本地研发方法论主体。 |
| `support-skills/` | 创建、迁移、检查和迭代 canonical skill 源定义的 authoring support。 | 不属于目标项目默认运行时 SDLC 方法论的安装集合。 |
| `scripts/` | 共享运行时辅助脚本源码副本。 | 安装后作为 `_speclite/scripts` 被 runtime 使用。 |
| `custom/` | customization 示例和默认覆盖。 | 安装后作为 `_speclite/custom` 的参考或初始配置。 |

`support-skills/` 的定位需要特别保持清晰。`speclite-skill-creator`、`speclite-skill-lint`、`speclite-agent-creator` 与 `speclite-agent-lint` 是为了支持 SpecLite canonical skill 源定义本身的创建和演进，不应被当作目标项目日常开发中必须安装到 AI IDE 的 SDLC workflow skill。

换言之，它们是 SpecLite 方法论生产线的一部分，而不是方法论运行时的一部分：workflow support skill 负责普通流程型 Skill 的创建和检查；agent support skill 负责 persona、`[agent]`、menu dispatch 和持续身份这类 Agent 定义包的创建和检查。

## BMAD Feedback Loop（BMAD 反馈闭环）

BMAD 执行过程中的问题应按以下闭环反馈到 SpecLite：

1. Observe（观察）：记录 BMAD skill 的输入、执行阶段、HALT 条件、产物路径、判断依据和验证结果。
2. Map（映射）：在 `BMAD_SPECLITE_SKILL_MAPPING.md` 中定位对应的 SpecLite canonical skill 或 split chain。
3. Abstract（抽象）：判断问题是个案、路径漂移、契约漂移、功能漂移、证据漂移，还是状态流转缺陷。
4. Design（设计）：优先从 high-level flow、gate、template、checklist、lint 和 acceptance criteria 层面修复，而不是只补单个文件名或单个 Story 条件。
5. Implement（实施）：修改 canonical skill 源定义、模板、引用文档或 lint 规则。
6. Regress（回归）：把触发问题的案例转化为 regression scenario，验证等价实现、证据和 contract 判断不会再次被固定路径误判。
7. Document（沉淀）：更新映射、背景文档或 skill 维护说明，让下一次类似问题能被更早发现。

## Flow Gate Lesson Pattern（流程门控经验模式）

BMAD 原生 `create-story` 与 `dev-story` 工作流暴露出的关键风险是：前序 Story 或 Epic 的实现形态与后续 Story 的 anchor 假设发生偏移时，问题可能直到 `dev-story` 执行中途才以 HALT 形式出现。这个问题不应被抽象为某个具体文件缺失，而应被抽象为流程门控缺失。

SpecLite canonical skill 应采用以下通用策略：

- Story 创建时，前置依赖必须按 `Contract -> Functional -> Evidence` 表达。
- Story 开发前，执行 kickoff gate，检查前置 contract、功能实现和测试证据是否满足。
- Story 完成前，执行 completion gate，检查 Story 声称的 anchors、File List、测试结果和实现证据是否一致。
- Epic 完成后，生成 implementation evidence summary，作为下一 Epic kickoff 的输入。
- 下一 Epic 开始前，执行 epic kickoff gate，核对前序 Epic 输出与当前 Epic 前置假设。

固定文件名只有在 owning SPEC、schema、template 或明确 acceptance criteria 要求时才是 hard gate。若 owning SPEC 允许集中式实现、生成式实现或等价模块实现，则 gate 应优先检查 functional implementation 和 evidence，并在证据充分时输出 `PASS_EQUIVALENT`，而不是误判为缺失。

## Case As Regression（案例作为回归）

曾出现过一种典型问题：后续 Story 期待前序 Epic 产出若干独立 anchor 文件，但实际实现把相关能力集中在已有 builder 或 generator 中，并且测试证据可以证明功能存在。此时问题的本质不是“功能一定缺失”，而是 Story/skill 把 guidance path 当成 hard gate，导致等价实现被误判。

该类案例在 SpecLite 中应作为 regression scenario 使用：

- owning SPEC 明确不要求固定拆分文件时，不得只因固定文件名不存在而 FAIL。
- 若集中式实现满足 contract，且测试或产物证据存在，应允许 `PASS_EQUIVALENT`。
- 若 contract、功能或证据任一层缺失，应分别返回 `FAIL_CONTRACT`、`FAIL_FUNCTION` 或 `FAIL_EVIDENCE`。
- 若需要产品或架构决策，应返回 `DECISION_NEEDED`，而不是在 dev-story 中途继续推进。

## Implementation Guidance（实施建议）

迭代 SpecLite canonical skill 时，优先在以下层面解决通用问题：

- Flow Gates（流程门控）：将关键检查前移到 story kickoff、story completion、epic completion 和 epic kickoff。
- Templates（模板）：在 Story 模板中显式提供 dependency gate、anchor contract map、equivalent implementation policy、evidence plan 和 anchor evidence summary。
- Checklists（检查清单）：要求所有前置依赖以 `Contract -> Functional -> Evidence` 形式表达。
- Lint Rules（规范检查）：识别 `must exist` 加具体源码路径的 hard gate 表述，要求同时声明 owning SPEC 或 equivalent implementation policy。
- Review Chains（审查链路）：SR/CR/finalizer 应读取 flow gate report 和 anchor evidence summary，避免 review 阶段继续传播错误的固定路径假设。
- Path Contracts（路径契约）：Story 输出路径、review 输出路径和 sprint status 中的 story location 必须保持一致，避免消费者各自硬编码旧路径。

## Support Skills Policy（Support Skills 策略）

`support-skills/` 不是 SpecLite 目标项目运行时 SDLC 方法论的主体。它们的主要使用者是维护 SpecLite canonical skill 源定义的人或自动化流程。

因此：

- `speclite-skill-creator` 应帮助创建符合 SpecLite runtime model 的 workflow skill 源包，并避免复制 BMAD 中已知的固定路径门控问题。
- `speclite-skill-lint` 应帮助发现 workflow skill 源定义中的路径漂移、runtime model 漂移、过密 SKILL 入口、缺失 mirror 或 hard gate 表述。
- `speclite-agent-creator` 应帮助创建或迁移符合 SpecLite runtime model 的 Agent 定义包，并保留 persona、`[agent]`、menu dispatch、prompt 引用和持续身份语义。
- `speclite-agent-lint` 应帮助发现 Agent 定义包中的 `[agent]` 漂移、菜单目标断链、prompt 文件缺失、runtime 残留和可选 mirror 不一致。
- 新增或调整 `assets/source/speclite/` 下的 skill 时，必须优先使用本项目内对应类型的 support skill；外部 `skills-creator` 仓库只保留 mirror 或历史参考角色。
- support skill 的产物和规则可以影响 canonical skill 质量，但不应被写成目标项目普通开发者必须运行的 SDLC gate。
- 对于 `DIRECT` 和 `SPLIT_CHAIN` 类型的 canonical skill，support skill 应保留“参考 BMAD、体系化改造、SpecLite 自定义、lint 验证”的标准建设路径。

## Maintenance Rules（维护规则）

- 修改 `core-skills/` 或 `sdlc-skills/` 时，应检查是否有 BMAD 对应 skill 的经验需要同步反映。
- 新增 SDLC 阶段目录时，应同步更新 `module.yaml`、`module-help.csv`、README、映射文档、安装基线和相关 fixture。
- 修改 BMAD-to-SpecLite 映射时，应同时检查是否影响 help、module metadata、templates、lint rules 或 flow gates。
- 新增 split chain 时，应明确入口 skill、后续 skill、状态流转和产物目录，不应保留含混的聚合入口。
- 删除 canonical skill 源头目录后，应同步清理映射、help 和引用，不应在新文档中重新恢复旧入口。
- 新增或修改 skill-local `data/` 文件时，若同名文件或同名字段存在不同 schema，应优先判断它是公共基础数据、phase-specific variant，还是 skill-local capability manifest；已接受的变体必须记录到 `assets/source/speclite/canonical-data-variant-policy.json`。
- 任何从具体 Story 得出的经验，都应先抽象为通用 failure pattern，再决定是否进入 canonical skill 源定义。
