# Epic 11: Phase-Aligned Workflow Artifact Governance Glossary（阶段对齐的 Workflow Artifact 治理术语表）

本文解释 Epic 11「Phase-Aligned Workflow Artifact Governance」中反复出现的英文组合术语，帮助项目维护者、Workflow 作者和 AI IDE 使用者用一致的语言讨论 artifact 路径、安装兼容、证据与审计边界。

> Note: 本文解释的是 Epic 11 规划文档中的术语语义，不表示相应 Story 已经实施或通过验证。字段名、路径、Skill ID 和 diagnostic ID 保留英文，以便与配置、代码和测试直接对应。

## Governance Foundations（治理基础）

| Term | 中文直译 | Definition |
|---|---|---|
| **phase-aligned workflow artifact governance** | 阶段对齐的 Workflow 产物治理 | 按 SDLC 阶段统一管理 Workflow 产物的根目录、写入位置、发现方式、所有权和兼容规则，使产物位置可预测、可审计。 |
| **workflow artifact** | 工作流产物 | Workflow 在分析、规划、实现、评审或发布过程中创建或更新的文件，例如 PRD、Story、review report 和 evidence。它不同于公开文档、安装程序文件和方法论源文件。 |
| **artifact topology** | 产物拓扑 | Artifact roots、阶段目录、专属子目录及其相互边界组成的整体文件布局。它回答“某类产物应该位于哪里”。 |
| **SDLC stage** | 软件开发生命周期阶段 | 软件交付生命周期中的阶段，例如 Analysis、Planning、Solutioning、Implementation 和 DevOps；每个阶段拥有对应的 artifact space。 |
| **artifact root** | 产物根目录 | 某类 Workflow 产物的配置根目录。Workflow 应先解析 root，再在 root 下选择约定的文件或子目录。 |
| **artifact contract** | 产物契约 | 对 artifact 类型、默认位置、所有权、producer、consumer 和兼容行为的稳定约定；它描述产物应如何处理，不代表产物已经生成。 |
| **executable resolution contract** | 可执行解析契约 | 可由 runtime 实际执行和测试的 root 解析规则。它把默认值、显式配置、fallback、路径校验和结果字段集中在一个 owner 中。 |
| **single owning contract** | 单一权威契约 | 某项规则只有一个权威定义位置，其他 command、manifest、validator 和 Workflow 只能消费该定义，不能各自维护副本。 |
| **canonical source** | 规范来源 | SpecLite 方法论、Skill package 和安装内容的权威源。对 canonical source 的修改会影响后续安装或更新投影。 |
| **canonical metadata** | 规范元数据 | Canonical source 中描述 module、Skill、artifact contract、目录需求或帮助信息的结构化元数据。 |
| **canonical corpus** | 规范语料 | Canonical source 内所有需要保持一致的 Skill、workflow、reference、template、script、hook、metadata 和公开说明的集合。 |
| **runtime projection** | 运行时投影 | Installer 把 canonical source 和配置解析结果投影到目标项目后的安装态文件、目录、manifest 或 Skill package。 |

## Artifact Roots（产物根目录）

| Term | 中文直译 | Definition |
|---|---|---|
| **brainstorming artifacts** | 头脑风暴产物 | 头脑风暴阶段产物，对应配置字段 `brainstorming_artifacts`。 |
| **analysis artifacts** | 分析产物 | Research、Product Brief 和 PRFAQ 等分析阶段产物，对应配置字段 `analysis_artifacts`。 |
| **planning artifacts** | 规划产物 | PRD、Epics、Architecture 和 UX 等规划产物，对应配置字段 `planning_artifacts`。 |
| **solutioning artifacts** | 方案产物 | Implementation Readiness 等从规划进入实现前的方案确认产物，对应配置字段 `solutioning_artifacts`。 |
| **implementation artifacts** | 实现产物 | Story、Code Review、执行记录等实现阶段产物，对应配置字段 `implementation_artifacts`。 |
| **devops artifacts** | DevOps产物 | CI/CD、deployment 和 release 相关产物，对应配置字段 `devops_artifacts`。 |
| **project knowledge** | 项目知识 | Workflow 生成、供后续 Workflow 和 AI Agent 使用的项目知识，对应配置字段 `project_knowledge`；它不是面向外部读者的公开文档。 |
| **Public Documentation** | 公开文档 | 面向项目用户和维护者发布的说明文档这一 filesystem plane。在 SpecLite 目标项目中，它与 Project Knowledge、Workflow artifacts 分开管理。 |
| **Primary Public Document** | 主要公开文档 | 项目主要公开文档的正式承载位置；Epic 11 明确以 `docs/` 表示这一位置，不允许把它当作 `{project_knowledge}` 的 alias 或 fallback。 |
| **filesystem plane** | 文件系统平面 | 按用途和所有权划分的文件空间，例如 Phase Artifact、Project Knowledge 和 Public Documentation。不同 plane 可以共处一个项目，但不能混用语义。 |
| **Filesystem Space Map** | 文件系统空间映射 | 面向人展示各 filesystem plane、实际 root、阶段、resolution mode 和 ownership 的视图。 |

## Installation And Resolution（安装与解析）

| Term | 中文直译 | Definition |
|---|---|---|
| **fresh install** | 全新安装 | 目标项目尚无既有 SpecLite 配置和历史产物时进行的首次安装。它可以采用当前 canonical defaults，并创建当前版本要求的目录结构。 |
| **existing install** | 既有安装 | 已有 SpecLite 配置、安装态文件或 Workflow 产物的项目。更新时必须尊重显式配置和历史产物，不能按 fresh install 处理。 |
| **fresh default** | 全新安装默认值 | 只用于新安装或缺少全部既有状态时的当前默认值。默认值变化不构成覆盖 existing install 配置的授权。 |
| **fresh config** | 全新安装配置 | Fresh install 根据当前 contract 生成的新配置文件，例如 `_speclite/config.toml`。 |
| **explicit config** | 显式配置 | 用户或项目已经明确写入配置文件的值；在 existing install 中，它优先于新的 canonical default。 |
| **legacy fallback** | 遗留回退 | Existing install 缺少后来新增字段时使用的兼容解析规则。它让旧项目继续工作，但不会改写配置或移动产物。 |
| **legacy-compatible** | 遗留兼容 | `resolutionMode` 的一种值，表示结果来自为旧安装保留的兼容 fallback，而不是配置损坏或已经完成 migration。 |
| **resolver** | 解析器 | 读取配置和 canonical rules，计算实际 artifact root，并执行边界校验的 runtime 组件。 |
| **root resolution** | 根解析 | Resolver 从 default、explicit config 或 legacy fallback 中确定实际 artifact root 的过程。 |
| **resolution result** | 解析结果 | Root resolution 的结构化输出，至少包含实际路径和解析来源，供 installer、manifest、validator 与 Workflow 复用。 |
| **resolved root** | 已解析根目录 | 解析完成后实际使用的 artifact root；结构化字段名为 `resolvedRoot`。 |
| **resolution mode** | 解析模式 | 说明 resolved root 来源的分类字段 `resolutionMode`，例如 `fresh-default`、`explicit-config` 或 `legacy-compatible`。 |
| **fresh-default** | 全新默认 | `resolutionMode` 的一种值，表示 root 来自当前新安装默认值。 |
| **explicit-config** | 显式配置 | `resolutionMode` 的一种值，表示 root 来自项目已有的显式配置。 |
| **directory plan** | 目录计划 | Installer 在写入前计算出的待创建目录集合和顺序。Epic 11 要求它由 canonical metadata 与 resolved model 驱动。 |
| **final write plan** | 最终写入计划 | 执行文件写入前供授权和审查的最终变更计划；只有获授权并取得 operation lock 后才能实际创建目录。 |
| **operation lock** | 操作锁 | 防止并发安装或更新同时修改 runtime structure 的互斥保护。未取得 lock 时不能执行写入。 |
| **manifest/index projection** | Manifest / 索引投影 | 把实际 resolved roots、resolution mode、ownership 和 contract references 写入 manifest 或 index，供工具发现和审计；manifest/index 不是第二份配置真源。 |
| **Ready Summary** | 就绪摘要 | 安装或状态流程面向人的结果摘要，展示实际 filesystem planes、roots、resolution mode 和 ownership。 |

## Compatibility And Migration（兼容与迁移）

| Term | 中文直译 | Definition |
|---|---|---|
| **existing-install compatibility** | 既有安装兼容性 | 在 topology 演进后继续读取旧配置、发现旧产物并保持历史内容不变的能力。 |
| **no-silent-migration** | 无静默迁移 | 未经用户明确授权，不自动移动、复制、重命名、删除或重写既有 Workflow artifacts。 |
| **artifact migration** | 产物迁移 | 把既有产物从旧路径转移到新路径的显式操作。它是独立能力，不能由普通 install、update 或 repair 暗中完成。 |
| **compatibility mode** | 兼容模式 | Workflow 或 resolver 为适配旧配置、旧路径或旧 Skill ID 而采用的受控行为，并应进入可审计 evidence。 |
| **compatibility mapping** | 兼容映射 | 旧标识到新标识的明确映射，例如旧 Skill ID 到新 canonical Skill ID；它用于识别和引导，不等于删除旧 package。 |
| **rename mapping** | 重命名映射 | 专门表达标识更名关系的 metadata，使 help、status、validate、update 和 activation 能识别旧 ID。 |
| **deprecation diagnostic** | 弃用诊断 | 用户使用旧 ID 或旧路径时返回的稳定提示，说明替代项和处理方式，而不是把旧引用当作未知错误。 |
| **package reprojection** | 包重投影 | 更新时按新 canonical ID 重新投影 Skill package 的计划动作；若旧 package 被用户修改，仍需遵守保护规则。 |
| **config-artifact mismatch** | 配置-产物不匹配 | 配置指向的新 root 与磁盘上实际历史产物位置不一致的状态；稳定 diagnostic ID 为 `config-artifact-mismatch`。它触发诊断，不自动迁移。 |
| **legacy artifact discovery** | 遗留产物发现 | Consumer 在新默认路径之外继续发现和读取旧位置历史产物的兼容能力。 |
| **historical evidence** | 历史证据 | 旧 Workflow run 留下、仍可用于追踪决策或验证历史状态的产物；保留它不表示应继续用旧路径生成新产物。 |

## Path And Boundary Safety（路径与边界安全）

| Term | 中文直译 | Definition |
|---|---|---|
| **project-relative POSIX form** | 项目相对 POSIX 表示 | 相对于项目根目录、使用 `/` 分隔符的公开路径表示。它避免泄露机器相关的 absolute path，并保持跨平台输出稳定。 |
| **project boundary** | 项目边界 | 目标项目允许读写和公开展示的路径边界。Resolver 必须阻止解析结果逃逸到边界之外。 |
| **unresolved token** | 未解析标记 | 路径模板中仍未替换的 placeholder，例如未解析的 `{project-root}`；这样的路径不能作为有效 resolved root。 |
| **path escape** | 路径逃逸 | 通过 `..`、absolute path 或其他路径组合跳出 project boundary 的情况。 |
| **symlink escape** | 符号链接逃逸 | 表面位于项目内的路径经 symlink 解析后指向项目外部的情况。 |
| **stable diagnostic** | 稳定诊断 | 具有稳定分类或 ID、可供人和自动化可靠识别的错误或警告；其含义不应随文案微调而变化。 |
| **owning taxonomy** | 权威分类体系 | 负责定义 diagnostic 分类、名称和语义的权威 taxonomy，避免多个组件为同一问题创造不同错误名。 |
| **deterministic ordering** | 确定性排序 | 相同输入始终产生相同的目录、字段或记录顺序，避免输出因运行环境或遍历顺序发生无意义变化。 |
| **stable snapshot** | 稳定快照 | 可重复比较的 fixture 输出，不包含 checkout root、absolute path 或未契约化 timestamp 等环境噪声。 |

## Document Forms And Discovery（文档形态与发现）

| Term | 中文直译 | Definition |
|---|---|---|
| **whole document** | 完整文档 | PRD、Epics 或 Architecture 的单一完整文档，例如 `prd/prd.md`。 |
| **sharded document** | 分片文档 | 使用 `shard-doc` 将完整文档按章节拆分后得到的一组文件，通常通过同目录的 `index.md` 组织。 |
| **subject directory** | 主题目录 | 按主题隔离的专属目录，例如 `prd/`、`epics/`、`architecture/` 或 `ux/`。完整文档与 shards 可以在其中共存。 |
| **whole/sharded discovery precedence** | 整体/分片发现优先级 | Whole 与 sharded 两种形态同时存在时，Consumer 按 canonical Workflow 规则确定实际输入的优先级，并记录所选路径。 |
| **actual consumed path** | 实际消费路径 | Consumer 本次真正读取的 artifact 路径。记录它可以证明 Workflow 没有悄悄混用新旧版本。 |
| **workflow-owned subdirectory** | Workflow 所有子目录 | 由 Workflow 和项目维护者管理的 artifact 子目录；Installer 可以保证约定父目录存在，但不能擅自覆盖其中内容。 |
| **producer** | 生产者 | 实际创建或更新某类 artifact 的 Skill 或 Workflow。目录存在、metadata 声明或 Consumer 引用都不能替代 producer evidence。 |
| **consumer** | 消费者 | 读取、校验、汇总或继续处理既有 artifact 的 Skill、Workflow 或 runtime 组件。 |
| **discovery rule** | 发现规则 | Consumer 查找 whole、sharded、canonical 或 legacy artifact 的确定性规则。 |

## Evidence And Verification（证据与验证）

| Term | 中文直译 | Definition |
|---|---|---|
| **validation evidence** | 验证证据 | 证明校验运行过及其结果的报告、结构化输出或可定位记录。 |
| **artifact provenance** | 产物溯源 | Artifact 的来源信息，包括 producer、输入、实际路径、生成或更新时间以及关联 contract。 |
| **fixture** | 测试夹具 | 为测试预置的配置、目录树、文件内容和 expected output，用于复现 fresh install、existing install 或 mismatch 场景。 |
| **focused test suite** | 聚焦测试套件 | 针对某个 Story contract 的小范围测试集合，用来快速验证关键正向与负向边界；它不自动替代项目级最终验证。 |
| **corpus consistency check** | 语料一致性检查 | 扫描 canonical corpus，确认 active 定义、路径、Skill ID、help 和 metadata 没有遗留冲突声明。 |
| **path consistency check** | 路径一致性检查 | 专门检查 producer、consumer、配置示例和测试对路径契约的表述是否一致。 |
| **stable basename** | 稳定基名 | 不含目录部分、按固定规则生成的文件名，例如 `prd-validate-report-{yyyy-MM-dd}.md`。 |
| **conflict strategy** | 冲突策略 | 目标文件已存在时 Workflow 采用的明确处理规则，例如停止、请求选择或使用既有版本；不得演变为 silent overwrite。 |
| **Completeness Check** | 完整性检查 | 把机器扫描得到的每一条 match 与 inventory 条目逐项对应；存在未分类或遗漏项时，盘点不能宣称完成。 |

## Implementation Readiness Terms（实施就绪术语）

| Term | 中文直译 | Definition |
|---|---|---|
| **Implementation Readiness** | 实施就绪 | 在进入实现前检查 PRD、UX、Architecture、Epics 和 Stories 是否完整、一致且可执行的阶段性判断。 |
| **readiness evidence** | 就绪证据 | Implementation Readiness 检查或 reviewer 生成、用于支持 READY 或 NOT READY 判断的可审计报告。 |
| **Readiness Check** | 就绪检查 | 汇总实施就绪状态的检查 Workflow；Epic 11 规划的新 Skill ID 为 `speclite-implementation-readiness-check`。 |
| **Grill Consistency Reviewer** | Grill 一致性审查器 | 对实施就绪材料进行深入一致性追问和审查的 Skill；它与汇总型 Readiness Check 职责不同。 |
| **Skill discovery** | Skill 发现 | 用户、Agent 或工具通过 help、registry、frontmatter 和 installed indexes 找到正确 Skill ID 与入口的过程。 |
| **activation metadata** | 激活元数据 | 将用户调用或旧 ID 引导到实际 canonical Skill 的安装态元数据。 |
| **active canonical reference** | 当前规范引用 | 当前 producer、orchestrator、help 或 contract 正在使用的引用；它必须采用当前 canonical ID 和路径。 |
| **regression fixture** | 回归 Fixture | 为防止兼容行为或历史 bug 再次出现而保留的测试样本，其中可以受控出现旧 ID 或旧路径。 |

## Code Review Artifact Terms（Code Review 产物术语）

| Term | 中文直译 | Definition |
|---|---|---|
| **Story-ID-only directory** | 仅 Story ID 目录 | 只根据规范 Story 编号生成的 Code Review 目录，例如 Story `11.9` 对应 `11-9-code-review/`；标题和 slug 不参与路径。 |
| **title-bearing directory** | 含标题目录 | 目录名中包含 Story title、name 或 slug 的旧模式。标题变化或字符差异可能让同一 Story 的产物分裂到多个目录。 |
| **canonical `$cr_dir`** | 规范 `$cr_dir` | Orchestrator 为一个 Story 的 CR 闭环只解析一次并传给全部 CR Skills 的权威目录变量。 |
| **CR round artifact** | CR轮次产物 | Reviewer、evaluator、fixer、rules extractor、TODO tracker 或 finalizer 在同一 CR 闭环中生成的记录。 |
| **goal execution record** | 目标执行记录 | Orchestrator 保存的计划、实验与进度记录，例如 `PLAN.md`、`EXPERIMENTS.md` 和 `EXPERIMENT_NOTES.md`。 |
| **legacy-only recovery** | 仅遗留恢复 | 只有旧 title-bearing CR 目录存在时，在明确 compatibility diagnostic 下继续未完成 CR，并保证新产物仍集中在一个目录。 |
| **canonical/legacy conflict** | 规范/遗留冲突 | Canonical 与 legacy CR 目录同时存在且无法唯一判断当前轮次的状态；Workflow 必须停止并报告冲突，不能猜测。 |

## Inventory And Audit Terms（盘点与审计术语）

| Term | 中文直译 | Definition |
|---|---|---|
| **reference inventory** | 引用清单 | 对目标表达逐条列出 owner、source file、line、language、reference type、literal expression、状态分类和建议动作的可复核清单。 |
| **grill-related reference** | Grill 相关引用 | 包含 `grill`、相关词形、Skill ID、调用关系、输出路径或兼容表达的引用，不限于名称中带 `grill` 的 package。 |
| **caller → callee invocation** | 调用方 → 被调用方调用 | 一个 Skill 或 Workflow 显式调用另一个 Skill 的关系，caller 是调用方，callee 是被调用方。 |
| **reference type** | 引用类型 | 引用在 contract 中承担的角色，例如 Skill name、trigger、invocation、prerequisite、output directory、report filename 或 help entry。 |
| **active reference** | 当前引用 | 当前 canonical producer、consumer 或 orchestration 仍在执行路径中使用的引用。 |
| **compatibility reference** | 兼容性引用 | 为识别旧 ID、旧路径或旧行为而有意保留的引用，不应被误判为 active default。 |
| **legacy reference** | 遗留引用 | 仅用于描述历史状态或旧产物的引用；它可以被发现，但不应指导新产物生成。 |
| **fixture reference** | Fixture 引用 | 只存在于测试输入、expected output 或 regression case 中的引用。 |
| **parity check** | 一致性检查 | 分别核对 ZH、EN 和 shared 定义，确认名称、路径、调用关系与行为语义一致。 |
| **current state** | 当前状态 | 以指定前置变更完成后的 canonical tree 为基准得到的实际状态，而不是提案、预期或旧快照。 |
| **read-only audit boundary** | 只读审计边界 | 盘点阶段只收集和分类证据，不据此擅自更名、删除或重写被审计的 canonical definitions。 |
| **human confirmation** | 人工确认 | 人类先审阅清单摘要、高风险项和歧义项，再明确决定是否授权后续修改；“已列出”不等于“已批准”。 |

## Story Expansion Terms（Story 扩展术语）

本节基于 `Story 11.1–11.10` 的 `ready-for-dev` 实施上下文补充术语。它只解释 planned intent、acceptance contract 与 evidence plan，不表示对应实现、tests 或 Flow Gate 已完成。

| Term | 中文直译 | Definition |
|---|---|---|
| **strict-serial predecessor gate** | 严格串行前序门禁 | 后续 Story 启动前必须核验全部前序 Story 已 `done`，且 current、target-matched completion Gate 已通过的门禁。`ready-for-dev` 规划文件不能替代前序完成证据。 |
| **lifecycle context** | 生命周期上下文 | Resolver 接收的 fresh/existing 显式输入，用于决定 default、explicit config 或 fallback；不得仅凭字段缺失猜测安装状态。 |
| **per-field resolution mode** | 逐字段解析模式 | 每个 artifact field 独立记录的 `resolutionMode`；mixed existing config 不能被压缩成单一 config-level mode。 |
| **display-safe path** | 展示安全路径 | 可进入 public JSON、manifest/index、issue details 或 snapshot 的 project-relative POSIX path；不得包含 absolute、home、temporary/cache 或 credential-bearing 路径。 |
| **cross-output reconciliation** | 跨输出核对 | 对 config、directory tree、manifest/index 与 Ready Summary 中的同一组 resolved roots 逐项核对，证明所有 projections 消费同一 contract。 |
| **zero partial write** | 零部分写入 | 任一授权、锁或路径校验 blocker 出现时，在首个写入前停止，并以 before/after filesystem evidence 证明没有留下部分 config、目录或 manifest。 |
| **configured/resolved/actual path reconciliation** | 配置/解析/实际路径核对 | 分离并核对 `configuredRoot`、`resolvedRoot` 与 `actualConsumedPath`，用于识别 config/artifact mismatch，而不修改任何一方。 |
| **byte-identical preservation** | 字节级不变保全 | Lifecycle operation 前后对 workflow-owned artifacts 做 content hash 或 byte comparison，证明 compatibility/diagnostic 流程没有迁移或改写历史产物。 |
| **three-plane separation** | 三平面分离 | Analysis Artifact、Project Knowledge 与 Public Documentation 各自具有独立写入职责；Analysis producers 可读取 Project Knowledge，但不得向其或 `docs/` 写 research output。 |
| **active-default negative scan** | 当前默认值负向扫描 | 对 canonical corpus 扫描并证明旧 producer path、Skill ID 或 title-bearing pattern 不再作为 active default；明确的 compatibility、legacy 或 fixture expression 必须单独分类。 |
| **discovery shape** | 发现形态 | Subject document discovery 的结构化形态，例如 `whole-only`、`sharded-only` 或 `whole+sharded`；字段名为 `discoveryShape`。 |
| **invocation-scoped explicit selection** | 单次调用显式选择 | Whole 与 sharded 同时存在时，由当前 invocation 明确选择一种输入；选择只对本次调用有效，不删除、覆盖或修改未选版本。 |
| **ambiguity status** | 歧义状态 | 记录 whole/sharded 输入是否存在未解决歧义的 evidence field；无显式 selection 的 `whole+sharded` 必须 block。 |
| **invalid sharded shape** | 无效分片形态 | 存在 shard files 但缺少 owning `index.md` 的阻断状态；Consumer 不得猜测 shard 顺序或集合。 |
| **broken shard reference** | 损坏的分片引用 | `index.md` 引用了缺失、不可读或越出 authoritative subject directory 的 shard 时产生的阻断状态。 |
| **zero progress mutation** | 零进度变更 | Blocker 发生时不写 artifact，也不更新 resume/progress metadata；用于证明 read-only block 没有留下半完成状态。 |
| **on-demand directory** | 按需目录 | Installer 不预创建、仅在对应 producer 实际需要时创建的子目录；Story 11.6 的 `ux/design-system/` 属此类。 |
| **relative-link reconciliation** | 相对链接核对 | Artifact 路径下移后，逐项验证 Markdown/HTML links、screenshots、local assets 与 cross-document navigation 仍解析到 project boundary 内。 |
| **invocation-fixed runtime date** | 单次调用固定运行日期 | Workflow 在一次 invocation 开始时生成并固定的日期，后续 steps 共用它，避免跨日导致 report target 漂移。 |
| **same-day target conflict** | 同日报告目标冲突 | 当日 canonical report target 已存在时的 pre-write blocker；无论内容相同或不同都不得 overwrite、append、truncate、delete、reuse 或生成 suffix。 |
| **bounded surface manifest** | 有界变更面清单 | 对 exact old IDs/paths 相关的 package、metadata、caller、docs、tests 与 fixtures 建立的完整表面清单，用于证明 rename/routing closure 未漏项且未扩大到 generic semantics。 |
| **fresh-only-new projection** | 新安装仅投影新标识 | Fresh install 只生成新 canonical Skill IDs，不生成 old alias package、help entry 或 phase row；旧 ID 仅保留 typed compatibility mapping。 |
| **modified-old-package protection** | 已修改旧包保护 | Update rename/reprojection 遇到用户修改过的 old package 时，将其视为 protected conflict，不覆盖或删除。 |
| **single `$cr_dir` propagation** | 单一 `$cr_dir` 传递 | Orchestrator 只解析一次 canonical CR directory identity，并显式传给 CR01–06；下游不得用 title、slug 或 filename 重新推导。 |
| **dual-directory ambiguity** | 双目录歧义 | Canonical 与 legacy CR directories 同时存在且无法唯一确定 current round 时的阻断状态；必须在任何 round write 或 progress mutation 前停止。 |
| **raw-match reconciliation** | 原始匹配核对 | Broad scan 的每个 machine match 必须 1:1 映射到 inventory entry，并证明 `unmapped=0`；100% reconciliation 只证明盘点完整，不代表修改已获批。 |
| **stable entry identity** | 稳定条目标识 | 基于 normalized source path、line 与 literal occurrence 形成的 inventory entry identity；不得把不同语言或语义角色的 match 合并。 |
| **dirty-worktree scan identity** | 脏工作树扫描标识 | 除 commit/tree 外，记录未提交 canonical changes、normalized command 与 raw match artifact hash，使 broad inventory 能复现实际被扫描的 current state。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **fresh default vs. explicit config** | Fresh default 服务新安装；existing install 的 explicit config 继续权威。 |
| **legacy fallback vs. artifact migration** | Legacy fallback 只决定如何解析旧项目；artifact migration 会改变磁盘上的既有产物，必须另行授权。 |
| **resolved root vs. configured root** | Configured root 是配置声明；resolved root 是 resolver 应用 default、explicit config 或 fallback 后的实际结果。 |
| **Project Knowledge vs. Public Documentation** | Project Knowledge 供 Workflow 和 Agent 延续项目上下文；Public Documentation 面向项目读者发布。 |
| **canonical source vs. runtime projection** | Canonical source 定义应安装什么；runtime projection 是目标项目中实际安装出来的内容。 |
| **producer vs. consumer** | Producer 创建或更新 artifact；consumer 读取或使用 artifact，能读取不代表拥有写入权。 |
| **whole document vs. sharded document** | Whole 是单一完整文件；sharded 是按章节拆分且通常由 `index.md` 组织的一组文件。 |
| **active reference vs. compatibility reference** | Active reference 指导当前行为；compatibility reference 仅用于识别或处理旧状态。 |
| **inventory completed vs. change approved** | 完成 inventory 只表示证据已列全；后续修改仍需 human confirmation 和明确授权。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 基础术语 | [`workflow-artifact.md`](workflow-artifact.md) |
| 路径与生命周期参考 | [`../workflow-artifact-layout.md`](../workflow-artifact-layout.md) |
| Runtime 边界解释 | [`../../explanation/runtime-boundaries.md`](../../explanation/runtime-boundaries.md) |
| 文件所有权术语 | [`file-ownership.md`](file-ownership.md) |
| 配置与 customization 参考 | [`../config-and-customization.md`](../config-and-customization.md) |

---

*本文档由 speclite-terminology-governance Skill 自动生成*
