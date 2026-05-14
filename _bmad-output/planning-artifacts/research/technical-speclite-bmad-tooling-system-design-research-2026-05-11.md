---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Speclite 借鉴 BMad 工具化思路的系统设计'
research_goals: '提炼 BMad 的 skill/config/tooling/installer/output 设计，结合 Speclite 当前定义与配置，形成可落地的系统设计建议。'
user_name: 'Fancyliu'
date: '2026-05-11'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-05-11
**Author:** Fancyliu
**Research Type:** technical

---

## Research Overview

本研究围绕“Speclite 如何借鉴 BMad 工具化思路形成系统设计”展开，采用本地证据版技术研究方法：主要分析 `references/BMAD-METHOD-6.6.0/` 的 Node.js installer/tooling 源码、`references/bmad-method-book/` 的架构资料、`references/source/speclite/` 的现有 skill/module/scripts 定义，以及安装后样本中的 `_bmad` manifest/config 产物。由于本次研究语料由用户限定为本地源码与文档，未使用外部 Web citation；所有技术判断均以本地文件证据为准。

核心结论是：Speclite 应借鉴 BMad 的 Node-first installer/control plane，而不是复制 BMad 的命名空间。目标架构应明确分离 IDE skill execution plane、`_speclite` metadata/control hub 和 `_speclite-output` artifact repository。用户已删除的辅助来源不进入本次系统工具的安装范围；安装器只应处理正式可分发的 Speclite skills、runtime scripts、manifest/index、IDE mirrors 和输出目录。

完整结论、路线图、风险评估与成功指标见文末 `Research Synthesis`。最重要的落地点包括：Node.js CLI installer、TOML customization contract、manifest/index integrity gateway、hash-backed update protection、data-driven IDE adapter 和 deterministic validation pipeline。

## Technical Research Scope Confirmation

**Research Topic:** Speclite 借鉴 BMad 工具化思路的系统设计

**Research Goals:** 提炼 BMad 的 skill/config/tooling/installer/output 设计，结合 Speclite 当前定义与配置，形成可落地的系统设计建议。

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Local source and installed-artifact analysis across the provided Speclite and BMad directories
- Evidence-based comparison of definitions, configuration layers, installation outputs, and runtime artifacts
- Confidence level framework for claims derived from code and generated outputs
- External web verification not used in this run because the requested evidence corpus is local and no general web search tool is available

**Scope Confirmed:** 2026-05-11

## Technology Stack Analysis

### Research Coverage and Verification Boundary

本步骤原始 TR 工作流要求 Web search 与 URL citation。本次研究按用户确认的本地证据范围执行：研究对象是 Speclite 源定义、BMad 6.6.0 源文件、BMad 架构分析资料，以及 student-score-echarts 项目中的安装后样本。因此，本节引用本地文件路径作为证据来源，不声明外部 Web 事实。

_Confidence: High for local architecture and file-format findings; Medium for broader ecosystem interpretation because no external Web verification was used._

### Programming Languages

Speclite 当前系统设计不应把 installed runtime 过早限定为 Python。BMad 的 **Node.js CLI installer/tooling** 正是 Speclite 希望重点参考的对象，尤其适合安装、更新、manifest 生成、IDE 适配、同步校验和交互式配置采集。Python 标准库脚本只是当前 Speclite/BMad 源中已有的 TOML 解析实现之一，不构成技术方向上的硬性偏好。

BMad 源仓以 Node.js 为安装器主语言。`references/BMAD-METHOD-6.6.0/package.json` 声明 `main` 和 `bin` 均指向 `tools/installer/bmad-cli.js`，并要求 `node >=20.0.0`。CLI 入口使用 CommonJS、`commander` 命令注册、`semver` 版本检查和安装器命令模块加载。这说明 BMad 的“分发/安装/更新”职责主要在 Node 工具层完成。

Speclite 源定义当前保留了 Python 标准库解析脚本。`references/source/speclite/scripts/resolve_config.py` 和 `references/source/speclite/scripts/resolve_customization.py` 都声明使用 Python 3.11+ 的 `tomllib`，并明确“不需要 uv、pip install、virtualenv”。这说明现有实现强调本地、可审计、低依赖；但它并不说明 TOML 无法适配 Node.js，也不说明 Speclite installed runtime 必须倾向 Python。

相反，BMad installer 已经在 Node.js 中生成和维护 TOML。`references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js` 的 `writeCentralConfig` 会写出 `_bmad/config.toml` 与 `_bmad/config.user.toml`；`references/BMAD-METHOD-6.6.0/tools/installer/set-overrides.js` 会把 `--set` 覆盖写回 TOML。它没有依赖完整 TOML round-trip parser，而是对 installer 生成的规则化 TOML 做定向写入，以保留注释和格式。这证明 Node.js 与 TOML 文件格式本身不存在适配障碍。

_Popular Languages in This Corpus: JavaScript/Node.js for BMad installer; Python 3.11+ for Speclite runtime helper scripts; Markdown for LLM-facing skill definitions._

_Emerging/Preferred Direction for Speclite: 参考 BMad 的 Node.js installer/tooling 作为系统工具化主轴；TOML customization 继续保留，解析实现可选择 Node.js parser、规则化 writer，或保留 Python resolver 作为兼容层。_

_Language Evolution: BMad uses Node.js for a broad multi-IDE installer and Python for installed resolver scripts; Speclite can choose Node-first tooling while preserving TOML contracts._

_Performance Characteristics: TOML config trees are small; performance is not the deciding factor. The deciding factor is ownership boundary: Node.js is strong for installer/tooling orchestration, while either Node.js or Python can implement deterministic config/customization resolution._

_Source Evidence: `references/BMAD-METHOD-6.6.0/package.json`; `references/BMAD-METHOD-6.6.0/tools/installer/bmad-cli.js`; `references/source/speclite/scripts/resolve_config.py`; `references/source/speclite/scripts/resolve_customization.py`._

### Development Frameworks and Libraries

BMad 的工具层使用成熟 CLI 生态：`commander` 负责命令结构，`@clack/prompts` 与 `chalk`/`picocolors` 负责交互体验，`js-yaml`/`yaml`/`csv-parse` 负责结构化文件解析，`glob`/`ignore` 负责文件遍历和忽略规则。它还使用 Astro/Starlight、ESLint、Prettier、Jest、markdownlint 等作为文档站点、验证和质量工具。

Speclite 不应把 BMad 的 Node 依赖全部无差别带入 installed-project runtime，但这不同于排斥 Node.js。更合理的边界是：

- **源码/构建/安装器层** 应重点借鉴 BMad 的 Node.js CLI 生态，负责安装、同步、manifest 生成、校验和跨 IDE 适配。
- **目标项目运行时层** 可以有两种实现路线：Node-first resolver（统一工具链）或保留轻量 Python resolver（兼容现有实现）。关键不是语言，而是解析契约稳定、输出 JSON、错误可诊断、无隐式副作用。
- **Skill 内容层** 继续使用 Markdown + YAML frontmatter + TOML customization，避免把工作流逻辑编译进代码。

Speclite 的 `references/source/speclite/README.md` 已明确区分源码创作区与安装后的运行模型，并规定 `scripts/` 是共享运行时辅助脚本源码，目标项目应安装到 `{project-root}/_speclite/scripts`。

_Major Frameworks: BMad installer uses Node CLI libraries; Speclite 当前 helper scripts use Python stdlib，但系统设计可以转向 Node-first runtime/tooling。_

_Micro-frameworks: Speclite skill/workflow 本身不需要应用框架，主要靠 Markdown 步骤文件和 TOML customization 驱动。_

_Evolution Trends: 系统正在从“一个大型方法论仓库”拆分为“skill 内容包 + 项目 runtime + 安装/校验工具”三层。_

_Ecosystem Maturity: Node CLI 生态适合安装器和统一工具链；Python stdlib 适合低依赖 fallback；Markdown/TOML/YAML/CSV 对 Git diff 和人工审查友好。_

_Source Evidence: `references/BMAD-METHOD-6.6.0/package.json`; `references/source/speclite/README.md`; `references/source/speclite/sdlc-skills/module.yaml`._

### Database and Storage Technologies

本体系不需要数据库。BMad 与 Speclite 都以文件系统作为事实存储层：Skill 定义是目录树，配置是 TOML/YAML，导航和清单是 CSV，产物是 Markdown/YAML，完整性追踪可通过 manifest/hash 实现。

BMad 安装样本在 `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/manifest.yaml` 中记录安装版本、安装时间、模块和 IDE 列表；`_bmad/config.toml` 明确标注 installer-managed，提示直接修改会在下次安装时被覆盖，并要求团队和个人覆盖放入 `_bmad/custom/config.toml` 与 `_bmad/custom/config.user.toml`。

Speclite 已有相似但更明确的运行模型：`_speclite/config.toml` 为中央配置，`_speclite/config.user.toml` 为用户覆盖，`_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml` 为人工覆盖层。`resolve_config.py` 用四层 TOML 合并生成 JSON；`resolve_customization.py` 用 skill 默认、团队覆盖、个人覆盖三层合并生成 workflow/agent 定制。

_Relational Databases: Not applicable; no evidence suggests SQL is needed._

_NoSQL Databases: Not applicable; document storage is plain files, not a DB service._

_In-Memory Databases: Not applicable; config resolution is batch read/merge and can remain stateless._

_Data Warehousing: Not applicable; research and implementation artifacts should remain Markdown/YAML files under output directories._

_Storage Recommendation: Adopt manifest files and CSV indexes for inspectability; avoid introducing SQLite or server-side state until file counts and query complexity clearly exceed simple scans._

_Source Evidence: `/Users/fancyliu/Repos/student-score-echarts/_bmad/config.toml`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/manifest.yaml`; `references/source/speclite/scripts/resolve_config.py`; `references/source/speclite/scripts/resolve_customization.py`._

### Development Tools and Platforms

BMad 的安装器是一个平台适配层，而不仅是文件复制器。`tools/installer/bmad-cli.js` 动态加载 commands 目录下的命令模块，注册到 `commander`，并做 best-effort npm 版本检查。安装后的 student-score-echarts 样本显示同一套 BMad skills 被安装到 `.claude/skills` 和 `.agents/skills`，同时 `_bmad/_config/manifest.yaml` 记录 IDE 列表，包括 `claude-code`、`codex`、`cursor`、`github-copilot`、`auggie`、`opencode`。

Speclite 的系统设计应保留这种“IDE skill 目录 + 项目 runtime 目录 + 输出产物目录”的三分法：

- IDE skill 目录：`.claude/skills/{skill-name}`、`.agents/skills/{skill-name}` 等，面向 AI 工具加载。
- Runtime 目录：`_speclite/`，存放配置、custom 覆盖、共享脚本、清单。
- Output 目录：`_speclite-output/`，按 planning/implementation/artifacts 分区沉淀过程产物。

Speclite 的 `sdlc-skills/module.yaml` 已声明安装时要创建的目录，包括 planning artifacts、implementation artifacts、review 子目录和 brownfield 知识库子目录。这说明 Speclite 可以把“运行所需目录”做成 declarative module metadata，而不是散落在各 skill 的执行步骤里。

_IDE and Editors: Claude Code and GitHub Copilot-style `.agents/skills` are first-class installation targets in the sample corpus._

_Version Control: File-based config, Markdown outputs, CSV manifests, and TOML customization all favor Git review and team-level override._

_Build Systems: BMad uses npm scripts for lint/test/docs/validate; Speclite can start with scoped validation scripts before building a full installer._

_Testing Frameworks: BMad has Jest and validation scripts; Speclite should prioritize deterministic lint/validation for skill layout, references, runtime-model alignment, and config merge behavior._

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/bmad-cli.js`; `references/BMAD-METHOD-6.6.0/package.json`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/manifest.yaml`; `references/source/speclite/sdlc-skills/module.yaml`; `references/source/speclite/README.md`._

### Cloud Infrastructure and Deployment

当前研究对象不是云服务系统，而是本地方法论/skill 工具化系统。BMad 的“部署”更接近 npm 包分发、GitHub/自定义源拉取、IDE 目录适配和项目内文件安装；Speclite 也应把第一阶段目标限定为本地 CLI/脚本安装，不需要引入云基础设施。

这意味着 Speclite 的系统设计应避免过早建设服务端组件。更稳的路线是：

- 源仓保留 Speclite 可安装 skill 定义、module metadata、runtime scripts；已删除的辅助来源不进入本次工具设计与目标项目安装范围。
- 安装器或同步工具把 skill 包复制/转换到目标 IDE skills 目录。
- 目标项目用 `_speclite/config.toml`、`_speclite/custom/` 和 `_speclite/scripts/` 本地解析配置。
- 产物全部写入 `_speclite-output/` 或用户配置指定的位置。

_Major Cloud Providers: Not relevant for the first Speclite tooling system design._

_Container Technologies: Not required; the runtime scripts are local file operations._

_Serverless Platforms: Not required; no remote execution boundary is present._

_CDN and Edge Computing: Not required; if Speclite later publishes packages, npm/GitHub release channels are enough._

_Deployment Recommendation: Treat npm/GitHub distribution as optional installer-layer concern; keep installed-project runtime fully local and offline-capable._

_Source Evidence: `references/BMAD-METHOD-6.6.0/package.json`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/manifest.yaml`; `references/source/speclite/README.md`._

### Technology Adoption Trends

从本地证据看，BMad 的关键趋势不是某个框架，而是工具化架构范式：

- **Skill-first:** 把 LLM 行为和工作流主要放在 Markdown skill 包里，而不是写成硬编码应用逻辑。
- **Named agents:** 用 Mary/John/Winston/Sally/Paige/Amelia 这类具名角色降低用户记忆负担，菜单和技能分发由 agent customization 驱动。
- **Declarative modules:** 用 `module.yaml` 描述配置问题、目录创建、agent roster，而不是把安装逻辑散落到多个脚本。
- **Layered configuration:** 安装器生成配置与人工覆盖分离，团队覆盖和个人覆盖分离，workflow/agent customization 再单独分层。
- **Manifest/index:** 安装后生成 manifest、skill index、help index、file manifest，支持导航、完整性追踪和后续校验。
- **Local-first artifacts:** PRD、architecture、research、review、sprint status 等过程资产都沉淀为文件，便于 Git 管理和 LLM 再消费。

Speclite 当前方向与这些趋势基本一致，但应进一步固化边界：BMad 可以作为“参考架构”，不应成为 Speclite runtime 的直接依赖。Speclite 应在命名、目录、配置、产物和验证规则上形成自己的稳定契约，例如 `_speclite`、`_speclite-output`、`speclite-*` skill 命名、`references/assets/data/scripts` 目录分区，以及 Python stdlib 配置解析。

_Migration Patterns: BMad `_bmad`/`_bmad-output` 模式可迁移为 Speclite `_speclite`/`_speclite-output`，但配置格式可从 YAML/TOML 混用进一步收敛为 TOML runtime + YAML module metadata._

_Emerging Technologies: 在本研究范围内，最值得采用的是 AI IDE skill packaging 与本地文件型 agent workflow，而不是云平台或数据库。_

_Legacy Technology: 手工复制 skill、无 manifest、无配置分层、无产物命名规则的做法应逐步淘汰。_

_Community Trends: BMad 样本显示可通过外部 skill 源补充自定义技能；Speclite 可保留这种扩展能力，但需要 lockfile/hash/manifest 防止来源漂移。_

_Source Evidence: `references/source/speclite/core-skills/module.yaml`; `references/source/speclite/sdlc-skills/module.yaml`; `references/BMAD-METHOD-6.6.0/src/bmm-skills/module.yaml`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/config.toml`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/manifest.yaml`._

### Technology Stack Implications for Speclite System Design

基于技术栈分析，Speclite 的系统设计建议采用四层边界：

1. **Authoring Layer:** `references/source/speclite/` 作为可安装 skill、module、runtime scripts 的创作区。
2. **Installer/Sync Layer:** 负责从 authoring source 生成 IDE skill 包、`_speclite` runtime、manifest/index、初始目录。可借鉴 BMad Node installer，但不要让 installed runtime 依赖 Node。
3. **Runtime Resolution Layer:** 目标项目本地解析 config/customization，并输出 JSON 给 skill 执行步骤使用。实现可采用 Node-first resolver，也可保留 Python stdlib resolver 作为兼容或降级路径。
4. **Artifact Layer:** 所有研究、规划、实现、review、brownfield 资产写入 `_speclite-output` 和 `docs` 等配置路径，保持文件可审查、可追踪、可再输入。

优先级最高的工程化建设项应是：

- 定义 Speclite manifest/index schema。
- 实现或完善 skill layout lint、runtime model alignment check、file reference validation。
- 明确 `.claude/skills` 与 `.agents/skills` 的同步策略。
- 固化 `_speclite/config.toml`、`_speclite/custom/`、skill `customize.toml` 的合并契约，并评估 Node.js TOML parser/serializer 或规则化 TOML writer 的取舍。
- 将 BMad 术语迁移为 Speclite 术语，避免安装后文档继续引用 `_bmad`、`bmad-*` 或 BMad runtime 路径。

## Integration Patterns Analysis

### Research Coverage and Verification Boundary

本节仍按本地证据版 TR 执行，不使用外部 Web citation。由于 Speclite/BMad 是本地 skill 工具化系统，本节中的 “API / protocol / interoperability” 主要指 **文件契约、CLI 契约、目录协议、manifest schema、skill 激活协议、配置合并协议、IDE skills 适配协议和产物路径协议**，而不是 REST/gRPC 这类网络 API。

_Confidence: High for local file/CLI/directory integration findings; Medium for future Node-first implementation recommendations because具体 Node TOML parser/serializer 选型尚未验证。_

### API Design Patterns

Speclite 应把系统 API 定义为一组稳定的本地契约，而不是先设计网络 API。BMad 的安装器和安装后样本显示，核心 API 面包括：

- **CLI API:** `bmad` / `bmad-method` 命令入口，子命令由 `tools/installer/bmad-cli.js` 动态加载 commands 目录并注册到 `commander`。
- **Manifest API:** `_bmad/_config/manifest.yaml` 记录 installation、modules、ides；`skill-manifest.csv` 记录 canonicalId、name、description、module、path；`bmad-help.csv` 记录菜单、phase、before/after、output-location；`files-manifest.csv` 记录 type、name、module、path、hash。
- **Skill API:** 每个 skill 的 `SKILL.md` frontmatter 暴露 name/description/metadata，正文暴露激活流程、执行流程、引用文件和 HALT 条件。
- **Customization API:** `customize.toml` 暴露 `[workflow]` 或 `[agent]`，再由项目级 team/user override 合并。
- **Config API:** `_speclite/config.toml` 和 `_speclite/custom/config*.toml` 暴露 core/module/agent 配置。

这些 API 的共同特征是：人类可读、Git 可 diff、LLM 可直接消费、安装器可生成/校验。Speclite 系统设计应明确把这些契约版本化，而不是让各 skill 在文档里自行解释一套局部规则。

_RESTful APIs: Not applicable for first-phase Speclite; local file contracts are the primary API._

_GraphQL APIs: Not applicable; no evidence of runtime query service need._

_RPC and gRPC: Not applicable; skill invocation is mediated by IDE skill loading and local command/file contracts._

_Webhook Patterns: Reinterpreted as completion hooks such as `workflow.on_complete`, which should be resolved through the same customization protocol._

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/bmad-cli.js`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/skill-manifest.csv`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/bmad-help.csv`; `references/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/SKILL.md`._

### Communication Protocols

Speclite 的主要通信协议应分成四类：

1. **Installer-to-project protocol:** 安装器把 source skill/module/scripts 转换为目标项目的 `_speclite/`、IDE skills 目录和 `_speclite-output/` 初始化目录。
2. **IDE-to-skill protocol:** IDE 通过 `.claude/skills/{skill-name}/SKILL.md` 或 `.agents/skills/{skill-name}/SKILL.md` 加载 skill 指令；GitHub Copilot 还可通过 `.github/agents/*.agent.md` command pointer 指向 `.agents/skills/{canonicalId}/SKILL.md`。
3. **Skill-to-runtime protocol:** skill 激活时解析 `{skill-root}`、`{project-root}`、`{speclite-runtime-root}`、`{skill-name}`，再读取 `_speclite/config.toml` 和 customization resolver 输出。
4. **Workflow-to-artifact protocol:** workflow 按 module config 中的 `planning_artifacts`、`implementation_artifacts`、`project_knowledge` 写入 Markdown/YAML/JSON/CSV 产物。

BMad 的 `platform-codes.yaml` 是 IDE 适配协议的核心证据：不同平台映射到不同 target_dir，多个平台可共享 `.agents/skills`；GitHub Copilot 还定义 `commands_target_dir`、`commands_extension`、`commands_body_template` 和 `commands_filter: agents-only`。Speclite 如果参考这一模式，应把平台适配做成数据驱动配置，而不是在安装器代码里硬编码多个 IDE 分支。

_HTTP/HTTPS Protocols: Only relevant to future package/source fetching; not part of installed runtime protocol._

_WebSocket Protocols: Not relevant; no persistent service boundary exists._

_Message Queue Protocols: Not relevant; workflow state is file-based and user-mediated._

_gRPC and Protocol Buffers: Not relevant for current local-first architecture._

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/ide/platform-codes.yaml`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/_config-driven.js`; `references/source/speclite/README.md`; `references/source/speclite/sdlc-skills/module.yaml`._

### Data Formats and Standards

Speclite 与 BMad 的互操作核心是多格式分工，而不是单一数据格式：

- **Markdown + YAML frontmatter:** LLM-facing skill entrypoint，兼顾元数据和可执行指令。
- **TOML:** human-authored config/customization，适合注释、局部覆盖和团队/个人分层。
- **YAML:** module metadata、installation manifest、模板型结构数据。
- **CSV:** skill/help/files manifest，适合小规模索引、Git diff 和线性扫描。
- **JSON:** resolver 输出和部分 schema/lock 类机器交换数据。

关键设计点是避免格式错位：`config.toml.example` 只能是字段结构参考，不能作为 runtime fallback；module metadata 负责安装时提问、目录创建和 agent roster；skill `customize.toml` 负责工作流/Agent 默认行为；`_speclite/custom/*.toml` 负责团队和个人覆盖；manifest/index 负责安装后可发现性和完整性。

Node.js 与 TOML 的关系需要明确：BMad Node installer 已经用规则化 writer 生成和定向更新 TOML；如果 Speclite 采用 Node-first resolver，可以选择成熟 TOML parser 读取并按现有合并规则输出 JSON。但对于用户手写的 `_speclite/custom/*.toml`，建议 **只读不重写**，除非引入并验证能保留注释/格式的 round-trip 工具。

_JSON and XML: JSON is suitable as resolver output; XML is not evidenced or needed._

_Protobuf and MessagePack: Not needed; local text contracts are preferable._

_CSV and Flat Files: CSV is appropriate for skill/help/files indexes and hash manifests._

_Custom Data Formats: The domain-specific formats are the manifest schemas, `SKILL.md` frontmatter, `customize.toml` `[workflow]/[agent]`, and `module.yaml` fields._

_Source Evidence: `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/files-manifest.csv`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`; `references/source/speclite/sdlc-skills/module.yaml`._

### System Interoperability Approaches

Speclite 的互操作应采用 **hub-and-spoke file contract**：`_speclite/` 是项目级 runtime hub，IDE skills 和 output artifacts 是两侧 spoke。

建议的连接关系：

```text
references/source/speclite/
	-> installer/sync tool
			-> .claude/skills/{skill-name}/SKILL.md
			-> .agents/skills/{skill-name}/SKILL.md
			-> _speclite/config.toml
			-> _speclite/config.user.toml
			-> _speclite/custom/*.toml
			-> _speclite/scripts/*
			-> _speclite/_config/manifest.yaml
			-> _speclite/_config/skill-manifest.csv
			-> _speclite/_config/speclite-help.csv
			-> _speclite/_config/files-manifest.csv
			-> _speclite-output/{planning-artifacts,implementation-artifacts}/
```

在这个结构里，IDE skills 不直接保存项目配置；它们只声明如何读取 runtime。`_speclite` 不保存 workflow 产物；它保存配置、脚本、manifest 和索引。`_speclite-output` 不保存可执行规则；它保存执行结果和可再输入的过程资产。这个边界能降低耦合：重装/更新 skill 不应覆盖产物，更新配置不应改写用户产物，产物清理也不应破坏 installed runtime。

BMad 的 `InstallPaths` 已经体现了这种分层：项目根下建立 runtime 目录、`_config`、core、scripts、custom；manifest-generator 再生成 central config、main manifest、skill manifest 和 files manifest。Speclite 可把 `_bmad` 名称替换为 `_speclite`，保留分层思想。

_Point-to-Point Integration: Skill 可以直接读取引用文件和 runtime config，但不应绕过 resolver/manifest 契约。_

_API Gateway Patterns: `_speclite/_config` 可视为本地 metadata gateway，统一提供 skill discovery、help routing 和 integrity data。_

_Service Mesh: Not applicable; no distributed services._

_Enterprise Service Bus: Not applicable; local file hub is sufficient._

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/core/install-paths.js`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`; `references/source/speclite/README.md`; `references/source/speclite/sdlc-skills/module.yaml`._

### Microservices Integration Patterns

网络微服务模式不适用于当前 Speclite，但可以借用其边界思想：把系统拆成清晰的本地组件，并通过稳定契约集成。

建议组件边界：

- **Source Package Component:** Speclite 可安装 skill/module/scripts 源定义；非分发辅助来源不进入目标项目安装产物。
- **Installer Component:** 解析 module metadata，生成 runtime、manifest、IDE skills、目录和 stubs。
- **Resolver Component:** 读取 config/customization，执行结构化合并，输出 JSON。
- **Skill Runtime Component:** IDE 加载 `SKILL.md`，按激活协议读取 resolver/config/refs/assets。
- **Artifact Component:** 保存 research、brief、PRD、architecture、story、review、sprint-status、retrospective 等文件。
- **Validator Component:** 检查 skill layout、runtime path、BMad 残留、跨 skill menu 引用、manifest/hash 同步。

这些组件之间不需要 RPC。它们的集成点是命令、路径和文件 schema。这样可以让 Speclite 获得类似微服务的可替换边界，同时避免引入服务发现、网关、链路追踪等不必要复杂度。

_API Gateway Pattern: Reinterpreted as CLI + manifest index layer._

_Service Discovery: Reinterpreted as `skill-manifest.csv` discovery by canonicalId/name/path._

_Circuit Breaker Pattern: Reinterpreted as HALT conditions when config/files are missing or invalid._

_Saga Pattern: Reinterpreted as installer pipeline with backup/rollback and idempotent generated files; future Speclite installer should preserve this principle._

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/skill-manifest.csv`; `references/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/SKILL.md`._

### Event-Driven Integration

Speclite 当前不需要消息总线，但存在轻量事件模型：

- **Activation event:** 用户触发 skill/agent，入口读取 config/customization/persistent facts。
- **Menu dispatch event:** Agent 菜单项通过 `skill` 或 `prompt` 分发到后续能力。
- **Step transition event:** Workflow step 完成后进入下一 step，遇到确认点 HALT。
- **Completion event:** `workflow.on_complete` 在收尾时解析并执行。
- **Artifact update event:** 产物写入后可被后续 skill 作为 input document 或 persistent/project knowledge 重新消费。
- **Install/update event:** installer 生成 manifest、config、IDE skills、hash manifest，并可在更新时保留 custom 文件。

Speclite 应把这些事件保持为显式文档协议，而不是隐藏自动化。尤其是 workflow step 和 user confirmation 的 HALT 语义，直接影响用户能否审查关键产物和防止误执行。

_Publish-Subscribe Patterns: Not needed; skill chaining should remain explicit through menu dispatch and completion hooks._

_Event Sourcing: Partial fit; artifacts and manifest history can serve as auditable event trace, but no event log service is needed._

_Message Broker Patterns: Not needed._

_CQRS Patterns: Partial analogy; `_speclite` config/manifest is read model for execution, `_speclite-output` artifacts are write outputs for workflows._

_Source Evidence: `references/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml`; `references/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/SKILL.md`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`._

### Integration Security Patterns

Speclite 的安全重点不是 OAuth/JWT，而是本地文件边界、覆盖层权限、来源可信度和生成文件保护。

建议安全模式：

- **Installer-owned vs human-owned separation:** `_speclite/config.toml` 和 `_speclite/config.user.toml` 可由 installer 生成；`_speclite/custom/*.toml` 只由人维护，installer 创建 stub 后不改写。
- **Team vs personal scope:** team override 可提交；user override 应 gitignored。
- **Hash/integrity manifest:** `files-manifest.csv` 记录文件 hash，用于检测安装内容漂移。
- **Source lock:** 外部 skill 源应有 lockfile/hash，防止升级或来源变更不可追踪。
- **Agent filtering:** IDE 只展示 persona agent 时，应按 `[agent]` customization 信号筛选，而不是靠目录名猜测。
- **Path hygiene:** 所有 skill 运行规约必须引用 `_speclite`，不得混用 `_bmad` runtime 或旧 `config.yaml`。

这些安全模式可直接转化为 Speclite validator 规则：检查 runtime path、customization namespace、manifest hash、menu skill 存在性、agent/workflow 区分、config fallback 禁止项。

_OAuth 2.0 and JWT: Not applicable._

_API Key Management: Not applicable unless future remote source registries require credentials._

_Mutual TLS: Not applicable._

_Data Encryption: Not primary concern for local runtime; sensitive personal config should live in gitignored user files._

_Source Evidence: `/Users/fancyliu/Repos/student-score-echarts/_bmad/config.toml`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/_config-driven.js`; `references/source/speclite/README.md`._

### Integration Implications for Speclite System Design

第 3 步的核心设计结论是：Speclite 应采用 **file-contract integration architecture**。

推荐的最小系统设计契约：

1. **Runtime Hub:** `_speclite/` 保存 config、custom、scripts、manifest/index，不保存业务产物。
2. **IDE Skill Mirrors:** `.claude/skills`、`.agents/skills` 等由安装器生成或同步；同一 canonicalId 在不同 IDE 目录中保持内容一致，平台差异由 platform config 处理。
3. **Manifest Gateway:** `_speclite/_config/manifest.yaml`、`skill-manifest.csv`、`speclite-help.csv`、`files-manifest.csv` 是 discovery、routing、phase topology 和 integrity 的统一入口。
4. **Customization Contract:** skill 默认 `customize.toml` + `_speclite/custom/{skill-name}.toml` + `_speclite/custom/{skill-name}.user.toml`，合并规则必须语言无关，可由 Node 或 Python 实现。
5. **Config Contract:** `_speclite/config.toml` + `_speclite/config.user.toml` + `_speclite/custom/config.toml` + `_speclite/custom/config.user.toml`，输出给 skill 的格式建议统一为 JSON。
6. **Artifact Boundary:** `_speclite-output/` 和 `docs/` 保存 workflow 结果；installer/update 不应覆盖这些产物。
7. **Validation Layer:** lint/validator 必须验证路径、schema、引用、manifest、hash、IDE mirror、agent menu、BMad 残留和 output path 约定。

这个连接模型可以让 Speclite 充分借鉴 BMad 的工具化强项，同时保留自己的命名空间和更清晰的运行时边界。

## Architectural Patterns and Design

### Research Coverage and Verification Boundary

本节已基于工作区内 `references/bmad-method-book/` 重新执行第 4 步，并与 `references/BMAD-METHOD-6.6.0/` 源码交叉验证。证据重点来自 Skill-first、四层配置、跨平台适配、文件系统存储、文件完整性、CLI 安装器、架构模式提炼和全景图章节，以及安装器源码中的 `Installer`、`IdeManager`、`InstallPaths`、`ManifestGenerator` 等实现。

本节不使用外部 Web citation。这里的“架构模式”是本地工具化系统架构：source package、installer/control plane、IDE skill execution plane、runtime metadata hub、artifact repository、validator/quality gate。

_Confidence: High for BMad-derived architecture patterns and source mapping; Medium for Speclite implementation sequencing because Speclite 的 Node-first installer/resolver 仍需后续设计与验证。_

### System Architecture Patterns

Speclite 应采用 **Skill-first + Installer Control Plane + IDE Skill Execution Plane + Local Metadata Hub + Artifact Repository** 的架构，而不是简单的 “`_speclite` runtime 目录 + scripts” 模式。

重新复核 BMad 6.6.0 源码后，一个关键修正是：安装器在 IDE 集成完成后会清理 `_bmad/` 中的 skill 目录，代码注释明确说 “Skills are self-contained in IDE directories, so `_bmad/` only needs module-level files”。因此，对 Speclite 来说：

- `.claude/skills/*`、`.agents/skills/*` 是真正被 IDE/LLM 加载的 **执行面**。
- `_speclite/` 应是配置、manifest、custom、scripts、模块元数据和更新状态的 **控制/元数据面**。
- `_speclite-output/` 与 `docs/` 是工作流产物和长期知识的 **数据面**。

推荐架构分层：

```text
Authoring Plane
	- references/source/speclite/**
	- module.yaml / SKILL.md / customize.toml / references / assets / data / scripts

Installer Control Plane
	- Node-first CLI
	- module resolver
	- manifest generator
	- IDE manager
	- TOML config writer/updater
	- file hash and update protection

Project Metadata Hub
	- _speclite/config.toml
	- _speclite/config.user.toml
	- _speclite/custom/*.toml
	- _speclite/scripts/*
	- _speclite/_config/manifest.yaml
	- _speclite/_config/skill-manifest.csv
	- _speclite/_config/speclite-help.csv
	- _speclite/_config/files-manifest.csv

IDE Skill Execution Plane
	- .claude/skills/{skill-name}/SKILL.md
	- .agents/skills/{skill-name}/SKILL.md
	- platform command pointer files, e.g. .github/agents/*.agent.md

Artifact Repository
	- _speclite-output/planning-artifacts
	- _speclite-output/implementation-artifacts
	- docs / project_knowledge
```

_Source Evidence: `references/bmad-method-book/src/part2-ch04.md`; `references/bmad-method-book/src/part2-ch07.md`; `references/bmad-method-book/src/appendix-a.md`; `references/BMAD-METHOD-6.6.0/tools/installer/core/installer.js`; `references/BMAD-METHOD-6.6.0/tools/installer/core/install-paths.js`._

### Design Principles and Best Practices

Speclite 应继承 BMad 的原则，但需要按 Speclite 的命名空间和目标重新表达。

**1. Skill-first，但不是 Runtime-first。** Skill 的执行逻辑仍在 Markdown + YAML frontmatter 中，LLM 直接执行。Node installer 不应吞掉 workflow 逻辑；它负责安装、适配、索引、校验和保护。

**2. 抽象差异，而非消除差异。** BMad 跨平台章节强调统一 Skill 格式，并通过 `platform-codes.yaml` 抽象不同 IDE 的 target_dir、command pointer、filter。Speclite 也应采用 data-driven IDE adapter，不应在安装器里散落平台 if/else。

**3. 文件契约是系统 API。** `SKILL.md`、`customize.toml`、`config.toml`、`module.yaml`、manifest CSV/YAML、output artifacts 都是稳定 API。系统设计应给这些 schema 版本和验证规则。

**4. 分层覆盖是 customization 的核心。** 中央配置与 skill customization 都应保留结构化 merge：标量覆盖、表深度合并、`code`/`id` 表数组按键替换并追加、其他数组追加。该契约必须独立于 Python/Node 实现。

**5. 保护用户工作优先于覆盖更新。** BMad 文件完整性章节把 `files-manifest.csv` + SHA256 用作用户修改检测和更新保护。Speclite installer 也应先检测、备份、报告，再更新 generated files。

**6. 简单透明优于复杂高效。** 文件系统、CSV、TOML、Markdown 在当前规模下优于数据库或服务端系统，因为用户可读、Git 友好、易审查。

_Source Evidence: `references/bmad-method-book/src/part2-ch06.md`; `references/bmad-method-book/src/part2-ch07.md`; `references/bmad-method-book/src/part4-ch13.md`; `references/bmad-method-book/src/part8-ch22.md`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/manager.js`._

### Scalability and Performance Patterns

Speclite 的扩展压力来自 skill 数量、IDE 平台数量、manifest 文件规模、团队/个人覆盖层、产物历史和验证成本，而不是请求并发。

推荐模式：

- **Manifest-based discovery:** `skill-manifest.csv` 作为 canonicalId/name/path 索引；`speclite-help.csv` 作为 phase/menu/routing 索引；`files-manifest.csv` 作为完整性和更新基线。
- **Shared target deduplication:** BMad `IdeManager.setupBatch` 会对多个 IDE 共享的 target_dir 去重，避免重复写 `.agents/skills`。Speclite 需要同样处理 Cursor/Copilot/Codex 等共享 `.agents/skills` 的情况。
- **Hash-based update detection:** files manifest 不只是校验，它是 update 前识别 modified/deleted/added 文件的基线。
- **Progressive disclosure:** 大 skill 不应把所有细节塞进入口；入口加载关键协议，深层规则放入 `references/`、`assets/`、`data/`，按需读取。
- **Scoped validation:** 对单个 skill 修改做 scoped lint/reference check；全量 manifest/hash validation 放到安装器或 CI。

性能取舍上，BMad 分析资料明确认为在当前规模下 CSV 线性扫描可接受，主要收益是 Git 友好和可审查。Speclite 可以沿用这一判断，但需要避免 manifest schema 漂移：研究样本中的实际 `skill-manifest.csv` 字段是 `canonicalId,name,description,module,path`，而 gitbook 附录里的示例字段更多，应以源码/安装样本为准。

_Source Evidence: `references/bmad-method-book/src/part3-ch09.md`; `references/bmad-method-book/src/part4-ch13.md`; `references/bmad-method-book/src/part8-ch23.md`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/manager.js`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/_config/skill-manifest.csv`._

### Integration and Communication Patterns

Speclite 的架构通信应使用本地文件契约和 CLI 协议，而不是网络协议。关键连接如下：

| 组件 | 输入 | 输出 | 关键设计约束 |
| --- | --- | --- | --- |
| Source Package | Speclite source skills/modules/scripts | installable package graph | 源路径不能成为安装后 runtime 依赖 |
| Installer CLI | module selection、IDE selection、config answers、existing manifest | `_speclite` metadata hub、IDE skills、output dirs | Node-first，pipeline 化，失败可恢复 |
| Manifest Generator | installed files、module metadata、IDE list | manifest.yaml、skill-manifest.csv、files-manifest.csv、config.toml | generated ownership，schema 可验证 |
| IDE Manager | platform-codes config、skill list | `.claude/skills`、`.agents/skills`、command pointer files | data-driven platform adapter，shared target dedupe |
| Resolver | TOML config/customization | JSON block for skill activation | 合并语义稳定，语言可替换 |
| IDE Skill | SKILL.md + references/assets/data | LLM execution instructions | 自包含于 IDE skills 目录，读取 `_speclite` 作为配置源 |
| Workflow Artifact Writer | resolved config and workflow context | Markdown/YAML/JSON artifacts | 只写配置指定的 artifact/project knowledge 路径 |
| Validator | source tree、installed tree、manifest、hash、menus | findings/report | 先报告，自动修复需显式触发 |

BMad 当前代码中的 `_cleanupSkillDirs` 表明安装后的 `_bmad` 不再是 skill 执行目录；它只是保留 module-level files、shared scripts、custom 和 `_config`。Speclite 设计也应避免让 skill 在安装后去 `_speclite/sdlc/.../SKILL.md` 找执行规约；IDE skills 才是执行入口。

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/core/installer.js`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/platform-codes.yaml`; `references/source/speclite/README.md`._

### Security Architecture Patterns

Speclite 的安全架构应聚焦本地供应链、文件所有权、误执行防护和迁移残留。

**Supply-chain and source trust:** 外部模块/skill 应记录 source、version、channel、sha 或 lock 信息。manifest 是审计入口。

**Installer-generated vs human-owned:** `_speclite/config*.toml`、`_speclite/_config/*` 和 IDE skill mirrors 可由 installer 刷新；`_speclite/custom/*.toml` 和 artifacts 不应被自动覆盖。

**Hash-backed update protection:** 更新前读取 `files-manifest.csv`，对当前文件重新计算 SHA256，识别用户修改并备份/报告。

**Agent classification safety:** GitHub Copilot 等只展示 persona agents 时，不能靠名称猜测；BMad 使用 source `customize.toml` 中 `[agent]` 作为信号。

**Runtime namespace safety:** Speclite 安装后的入口和 references 不得继续要求 `_bmad`、`bmad-*`、旧 `config.yaml` 或 `/bmad:*`。这类残留应进入 lint 的 Critical/Major finding。

**Execution halt safety:** 缺失关键 config、customization 解析失败、menu target 不存在、artifact path 无法解析时应 HALT，而不是自动猜测。

_Source Evidence: `references/bmad-method-book/src/part4-ch13.md`; `references/BMAD-METHOD-6.6.0/tools/installer/core/installer.js`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/_config-driven.js`; `references/source/speclite/README.md`._

### Data Architecture Patterns

Speclite 应采用 **filesystem as storage layer**，但需要明确“执行入口”和“元数据 hub”的边界。

| 数据类别 | 推荐位置 | 所有权 | 设计说明 |
| --- | --- | --- | --- |
| Authoring source | `references/source/speclite/**` | Speclite source | 创作区，不是目标项目 runtime |
| IDE skill packages | `.claude/skills/*`, `.agents/skills/*` | Installer-generated | LLM/IDE 执行入口，自包含 skill 包 |
| Runtime metadata | `_speclite/_config/*` | Installer-generated | install manifest、skill/help/files indexes |
| Central config | `_speclite/config.toml`, `_speclite/config.user.toml` | Installer-generated | 可重装刷新，带只读提示 |
| Human overrides | `_speclite/custom/*.toml` | Human-owned | installer 只创建 stub，不应改写 |
| Shared scripts | `_speclite/scripts/*` | Installer-generated | resolver/辅助脚本，可随版本更新 |
| Output artifacts | `_speclite-output/**` | Workflow-generated | 研究、规划、实现、review 产物 |
| Project knowledge | `docs/` or configured path | Human/workflow co-owned | 长期事实源，被 persistent_facts/project_knowledge 读取 |
| External cache | user home cache, future optional | Tool-owned cache | 可删除、可重建，不提交 Git |

这个数据架构符合 gitbook 第九章的判断：配置、清单、工作产物和缓存适合不同文本/文件系统位置。Speclite 需要在 installer 中把每类数据的所有权写清楚，并在 validator 中强制检查。

_Source Evidence: `references/bmad-method-book/src/part3-ch09.md`; `references/bmad-method-book/src/appendix-b.md`; `references/source/speclite/README.md`; `references/source/speclite/sdlc-skills/module.yaml`; `/Users/fancyliu/Repos/student-score-echarts/_bmad/config.toml`._

### Deployment and Operations Architecture

Speclite 的部署应定义为 **source-to-project installation and update pipeline**。

推荐操作流：

1. **Collect:** 采集 modules、IDEs、core/module config answers、set overrides。
2. **Detect:** 读取既有 `_speclite/_config/manifest.yaml` 和 `files-manifest.csv`，判断 fresh install/update。
3. **Protect:** 基于 hash 检测 custom/modified files，备份 human changes。
4. **Install modules:** 复制/生成 module-level files、shared scripts、module config。
5. **Generate metadata:** 写 central TOML config、manifest.yaml、skill-manifest.csv、files-manifest.csv、help catalog。
6. **Adapt IDEs:** 按 platform config 生成 `.claude/skills`、`.agents/skills`、`.github/agents/*.agent.md` 等。
7. **Cleanup execution duplicates:** 如果采用 BMad 6.6.0 模式，IDE skills 自包含后，`_speclite` 内不保留重复 skill 执行目录。
8. **Restore/Report:** 恢复 custom 文件；modified generated files 可保存为 `.bak` 或报告冲突。
9. **Validate:** 运行 layout/reference/runtime/manifest/hash/IDE mirror/menu validation。

这条 pipeline 把 BMad 安装器的一等职责保留下来：它不是复制器，而是项目级工具化控制器。Speclite 若要真正借鉴 BMad，安装器应成为系统设计核心组件，而不是后置脚本。

_Source Evidence: `references/bmad-method-book/src/part6-ch19.md`; `references/bmad-method-book/src/appendix-a.md`; `references/BMAD-METHOD-6.6.0/tools/installer/core/installer.js`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/manager.js`._

### Architectural Decision Candidates for Speclite

以下是基于工作区 gitbook 与 BMad 6.6.0 源码复核后的候选 ADR：

1. **ADR-001: Speclite adopts Skill-first architecture.** Skill remains Markdown + YAML frontmatter; installer manages packaging, indexing and validation, not workflow business logic.
2. **ADR-002: Speclite separates metadata hub from execution plane.** `_speclite` stores config/custom/scripts/manifests; IDE skill directories are the self-contained execution packages.
3. **ADR-003: Speclite installer is Node-first and pipeline-based.** Follow BMad’s installer responsibilities: install, update, manifest, IDE adaptation, hash, backup, restore, validation.
4. **ADR-004: TOML remains the config/customization contract.** Node compatibility is acceptable; human-authored TOML should be read-only unless round-trip preservation is solved.
5. **ADR-005: Manifest/index files are the metadata gateway.** Discovery, help routing, phase topology and integrity checks go through `_speclite/_config`.
6. **ADR-006: IDE integrations are data-driven.** Platform target dirs, command pointer behavior and agent filtering live in platform config.
7. **ADR-007: Human-owned files are never overwritten by installer.** `_speclite/custom` and artifact repositories are protected ownership zones.
8. **ADR-008: Hash-backed update protection is mandatory.** `files-manifest.csv` is used for modified/deleted/added detection and update safety.
9. **ADR-009: Validation is a first-class architecture component.** Speclite quality depends on deterministic validation of references, runtime paths, manifests, menus, IDE mirrors and namespace migration.
10. **ADR-010: Speclite keeps BMad concepts but not BMad namespace.** Installed contracts use `_speclite`, `speclite-*`, and Speclite-specific manifest/help naming.

---

## Implementation Approaches and Technology Adoption

### Research Coverage and Verification Boundary

本节继续按本地证据版技术研究执行。由于研究目标是为 Speclite 借鉴 BMad 工具化思路形成系统设计， implementation research 的重点不是选型流行度，而是可落地的工程路线：如何从当前 Speclite skill 定义和配置体系，演进到具备 installer、manifest、IDE adapter、customization、validator、output artifact 管理能力的工具化系统。

_Confidence: High for BMad installer/tooling evidence and Speclite current source layout; Medium for future implementation cost estimates because Speclite Node-first installer 尚未实际开发验证。_

### Technology Adoption Strategies

Speclite 应采用渐进式迁移，而不是一次性重写 BMad installer。最稳妥的采用策略是先固化文件契约和边界，再构建最小安装闭环，然后逐步补齐更新保护、验证和扩展能力。

推荐采用顺序：

1. **Contract-first:** 先定义 `_speclite` metadata hub、IDE skill execution plane、`_speclite-output` artifact plane、manifest/index schema、TOML customization merge rules。
2. **Node-first installer MVP:** 实现 install/status/validate 的最小 CLI，负责把 source skills 安装到 `.claude/skills`、`.agents/skills`，并创建 `_speclite` 与初始 manifest。
3. **Config and customization compatibility:** 保留 TOML 作为外部契约，先复用或移植现有 Python 合并规则；Node.js 可以读取/生成规则化 TOML，但 human-authored TOML 默认只读。
4. **Hash-backed update:** 引入 `files-manifest.csv`，更新前检测用户修改，备份或报告冲突，避免覆盖人工变更。
5. **Validation as product feature:** 把 skill layout、BMad 残留、runtime path、menu target、IDE mirror、manifest hash 校验做成一等能力，而不是临时脚本。

这一策略匹配 BMad installer 的实际职责：`Installer` 管理安装/更新 pipeline，`OfficialModules` 读取 `module.yaml` 并创建 declarative directories，`IdeManager` 处理 platform adapter，`ManifestGenerator` 生成安装后元数据。Speclite 不应复制 BMad 命名空间，但应复用这种控制面职责划分。

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/core/installer.js`; `references/BMAD-METHOD-6.6.0/tools/installer/modules/official-modules.js`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/manager.js`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`._

### Development Workflows and Tooling

Speclite 的工程化实现建议拆成五个工具模块：

| Tooling Module | Primary Responsibility | Initial Scope |
| --- | --- | --- |
| `installer-cli` | Node CLI 入口、install/update/status/validate 命令 | 本地 source-to-project 安装 |
| `module-manager` | 读取 `module.yaml`、采集配置、创建声明式目录 | 可安装的 core/sdlc modules |
| `manifest-generator` | 生成 manifest、skill/help/files indexes、central config | `_speclite/_config/*` |
| `ide-manager` | 数据驱动适配 `.claude/skills`、`.agents/skills`、`.github/agents` | Claude Code + Copilot/Cursor 共享 target |
| `validator` | layout、reference、runtime path、BMad residue、hash、menu 校验 | source tree + installed tree |

BMad 的 `package.json` 体现了工具化项目的质量 pipeline：`quality` 串联 format、lint、markdownlint、docs build、install test、URL test、refs validation、skills validation。Speclite 可以先实现较小的 `npm run quality`，但应保留同类分层：格式检查、skill lint、reference validation、installer integration test、manifest/hash validation。

用户已删除辅助来源目录，因此本次系统设计不再把辅助来源纳入任何安装、同步或目标项目 execution plane 范围。后续 deterministic validator 应直接面向当前仍存在的 Speclite source tree、module metadata、runtime scripts、IDE mirrors 和 manifest 产物设计规则；历史迁移规则只可作为外部背景，不应成为安装器输入。

_Source Evidence: `references/BMAD-METHOD-6.6.0/package.json`; `references/source/speclite/README.md`; `references/source/speclite/core-skills/module.yaml`; `references/source/speclite/sdlc-skills/module.yaml`._

### Testing and Quality Assurance

Speclite 的测试策略应按风险而非文件类型排序。

**Highest-priority unit tests:**

- TOML config merge：标量覆盖、表深度合并、`code`/`id` 表数组按键替换追加、普通数组追加。
- customization merge：skill default、team override、user override 三层合并，分别覆盖 `[workflow]` 与 `[agent]`。
- module schema parsing：`module.yaml` metadata、prompt fields、directory declarations、default values。
- path safety：目录创建不得逃逸 project root，父子目录移动需警告而不是危险移动。

**Integration tests:**

- fresh install：从 source 安装可分发 skills 到临时项目，排除非分发来源，生成 `_speclite`、IDE skills、manifest、output dirs。
- update install：读取既有 manifest，识别新增字段、变更目录和已修改 generated files。
- IDE mirror：同一 canonical skill 在 `.claude/skills` 和 `.agents/skills` 内容一致，平台差异只存在 command pointer 或 platform-specific wrapper。
- agent filtering：GitHub Copilot command pointer 只为 `[agent]` 生成时，不能误把 workflow skill 当 agent。

**Validation tests:**

- root Markdown whitelist。
- `references/`、`assets/`、`scripts/` 目录职责。
- `_bmad`、`config.yaml`、`/bmad:*`、旧 runtime path 残留。
- `config.toml.example` 只作为示例，不参与 runtime fallback。
- menu target 和 prompt file existence。

BMad 的 `OfficialModules.createModuleDirectories` 已经展示了值得保留的测试边界：路径不能逃逸项目根目录，路径变更时需要处理旧目录移动，父子路径移动应避免危险操作，移动失败要降级为创建新目录并提示人工处理。

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/modules/official-modules.js`; `references/source/speclite/scripts/resolve_config.py`; `references/source/speclite/scripts/resolve_customization.py`; `references/source/speclite/README.md`._

### Deployment and Operations Practices

Speclite 的部署不是云发布，而是 source-to-project installation/update。推荐操作流程：

1. **Collect:** 采集目标项目、modules、IDEs、core/module config answers、CLI `--set` 覆盖。
2. **Detect:** 读取既有 `_speclite/_config/manifest.yaml` 与 `files-manifest.csv`，识别 fresh install、quick update、modify install。
3. **Protect:** 对 generated files 重新计算 hash，识别 user-modified/deleted/unknown files，备份并报告。
4. **Install:** 复制/生成 shared scripts、module-level files、IDE skill packages、command pointers。
5. **Configure:** 生成 installer-owned `_speclite/config.toml` 与 `_speclite/config.user.toml`，创建 human-owned custom stubs。
6. **Index:** 生成 manifest.yaml、skill-manifest.csv、speclite-help.csv、files-manifest.csv。
7. **Validate:** 执行 manifest、hash、runtime path、IDE mirror、reference、menu 校验。
8. **Report:** 输出安装摘要、创建目录、迁移目录、跳过/备份文件和后续验证建议。

BMad 第 8 部分总结的 fail-safe、人机检查点、透明状态追踪、可逆性优先等模式，应成为 Speclite installer 的操作原则。尤其是透明状态追踪：manifest 和 files hash 不只是机器数据，也应让用户能够直接打开、审查和通过 Git 跟踪。

_Source Evidence: `references/bmad-method-book/src/part8-ch23.md`; `references/BMAD-METHOD-6.6.0/tools/installer/core/installer.js`; `references/BMAD-METHOD-6.6.0/tools/installer/modules/official-modules.js`; `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`._

### Team Organization and Skills

Speclite 的最小实现团队不需要大型平台团队，但需要覆盖以下能力：

- **Node CLI engineering:** commander/clack/fs-extra/yaml/csv/TOML parser、跨平台路径、npm distribution。
- **Schema and file-contract design:** TOML/YAML/CSV/Markdown frontmatter 的版本化、验证和兼容策略。
- **AI IDE packaging:** Claude Code、GitHub Copilot/Cursor `.agents/skills`、`.github/agents` command pointer、shared target dedupe。
- **Validation engineering:** deterministic lint、reference resolver、hash manifest、BMad residue detection、agent menu graph checks。
- **Speclite migration expertise:** 保留 BMad workflow 行为语义，同时替换 runtime namespace、目录归类、配置来源和生成标注。
- **Documentation and examples:** 维护 README、migration baseline、sample installed project、quality checklist。

工作方式上，建议每个 installer 能力都配一个小样本项目作为 golden fixture。每次 installer/schema 变更后，重新安装到 fixture 并比较 `_speclite`、IDE skills 和 manifest diff。

_Source Evidence: `references/source/speclite/README.md`; `references/BMAD-METHOD-6.6.0/package.json`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/platform-codes.yaml`._

### Cost Optimization and Resource Management

Speclite 的成本优化重点是避免引入不必要的运行时复杂度。

**Keep local-first:** 现阶段不需要数据库、daemon、web service、cloud sync 或容器。文件系统、manifest 和 CLI 足以支撑安装、更新、校验和 workflow artifacts。

**Reuse simple text formats:** Markdown/TOML/YAML/CSV/JSON 已经覆盖人类编辑、LLM 执行、模块元数据、索引和机器输出。不要为小规模索引引入 SQLite，除非 manifest 扫描成本或查询复杂度真实变成瓶颈。

**Avoid full round-trip TOML rewriting early:** Node 能处理 TOML，但保存注释和格式是独立问题。早期实现应只重写 installer-owned TOML；human-owned override 只读。

**Incremental validators:** 先实现高风险 deterministic checks：BMad 残留、引用缺失、runtime path、menu target、manifest hash。低风险风格问题可以继续由 LLM lint 或 markdownlint 辅助。

**Fixture-driven testing:** 与其搭建重型测试平台，不如维护少量真实安装样本和 golden output，配合 `npm run quality` 做可重复验证。

_Source Evidence: `references/bmad-method-book/src/part3-ch09.md`; `references/bmad-method-book/src/appendix-c.md`; `references/source/speclite/scripts/resolve_config.py`; `references/source/speclite/scripts/resolve_customization.py`._

### Risk Assessment and Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 把 `_speclite` 误设计成 skill 执行目录 | 安装后路径混乱，IDE execution 与 metadata hub 耦合 | 明确 IDE skills 是 execution plane，`_speclite` 是 metadata/control hub |
| Node 改写 TOML 破坏用户注释 | 用户配置损坏，降低信任 | installer-owned TOML 可重写；human-owned TOML 只读或引入 round-trip 工具后再开放写入 |
| manifest schema 与实际安装样本漂移 | validator/installer 互相不兼容 | 以源码和真实 installed fixture 为准，schema 加版本和测试 |
| IDE mirror 内容不一致 | 不同 AI IDE 行为不同，难以诊断 | 生成后执行 mirror hash check；平台差异只允许在 adapter 层 |
| BMad namespace 残留 | Speclite runtime 误读 `_bmad` 或旧配置 | validator 将 `_bmad`、`config.yaml`、`/bmad:*` 残留设为 Critical/Major |
| 更新覆盖用户修改 | 产物或本地定制丢失 | `files-manifest.csv` + SHA256 + backup/restore/report |
| 校验规则只停留在人工审查 | 质量不可重复 | 将高价值规则沉淀为 deterministic CLI validator，并只面向当前可分发 source tree |
| 过早支持太多平台 | installer 复杂度失控 | 先支持 Claude Code + `.agents/skills` 共享目标，再扩展 command pointer |

_Source Evidence: `references/BMAD-METHOD-6.6.0/tools/installer/core/installer.js`; `references/BMAD-METHOD-6.6.0/tools/installer/ide/manager.js`; `references/source/speclite/README.md`._

## Technical Research Recommendations

### Implementation Roadmap

**Phase 0: Contracts and ADRs**

- 决定 `_speclite`、IDE skills、`_speclite-output` 的 ownership boundary。
- 定义 manifest.yaml、skill-manifest.csv、speclite-help.csv、files-manifest.csv schema。
- 固化 config/customization merge rules，声明语言无关契约。
- 产出 ADR-001 到 ADR-010 的正式版本。

**Phase 1: Installer MVP**

- 创建 Node CLI skeleton。
- 实现可安装 source skill discovery，并显式排除非分发来源。
- 安装 skills 到 `.claude/skills` 与 `.agents/skills`。
- 创建 `_speclite/config.toml`、`_speclite/custom/`、`_speclite/scripts/`、`_speclite-output/`。
- 生成最小 manifest.yaml 和 skill-manifest.csv。

**Phase 2: Config and Module Manager**

- 读取 `module.yaml`。
- 支持 declarative directory creation。
- 支持 core/sdlc module config prompts 或 defaults。
- 实现 config/customization resolver 的 Node 版本，或明确 Python resolver compatibility bridge。

**Phase 3: IDE Adapter and Agent Commands**

- 抽象 platform registry。
- 支持 shared target dedupe。
- 为 GitHub Copilot agent 生成 `.github/agents/*.agent.md` command pointer。
- 基于 `[agent]` customization 而非命名猜测筛选 agents。

**Phase 4: Update Safety**

- 生成 `files-manifest.csv` hash。
- 实现 update 前 modified/deleted/unknown detection。
- 实现 backup/restore/report。
- 支持 quick update：只补新增 schema fields，保留既有配置。

**Phase 5: Validation and CI**

- 实现 deterministic validator：layout、references、runtime path、BMad residue、menu graph、manifest/hash、IDE mirror。
- 建立 fixture install tests。
- 提供 `npm run quality`，最少包括 format、lint、installer test、validator test。

**Phase 6: Migration and Ecosystem Readiness**

- 基于当前 Speclite source tree 和 installed fixture 沉淀 validator 规则。
- 维护 sample installed project。
- 增加外部 source lock/hash 设计。
- 编写 migration guide 和 troubleshooting guide。

### Technology Stack Recommendations

- **Installer/control plane:** Node.js CLI，参考 BMad 的 `commander`/prompts/fs/yaml/csv/hash/manifest 模式。
- **Runtime config contract:** TOML 保持不变；resolver 输出 JSON 给 skill 使用。
- **Module metadata:** YAML，承载 module identity、config prompt、directories、agent roster。
- **Skill package:** Markdown + YAML frontmatter，长规约下沉到 `references/`，模板放 `assets/`，结构化数据放 `data/`，脚本放 `scripts/`。
- **Indexes and integrity:** CSV + YAML manifest，保持 Git 友好和人工可读。
- **Validation:** Node CLI deterministic validator，直接校验当前可分发 source tree、installed runtime、IDE mirrors 和 manifest。
- **Python scripts:** 可作为兼容或 fallback 保留，但不应成为否定 Node-first tooling 的理由。

### Skill Development Requirements

Speclite skill 后续开发必须符合以下工程要求：

- 入口 `SKILL.md` 与 `SKILL.en.md` 保持相同运行模型、版本和关键约束。
- 根目录只保留入口、配置、CHANGELOG 等白名单文件；规约型 Markdown 放 `references/`，模板放 `assets/`。
- 运行时只引用 `{project-root}`、`{skill-root}`、`{speclite-runtime-root}`、`{skill-name}` 等稳定变量，不引用 source repository path。
- `customize.toml` 必须清楚区分 `[workflow]` 与 `[agent]`。
- 任何需要项目配置的 skill 都必须读取 `_speclite/config.toml` 解析结果；`config.toml.example` 不得作为 fallback。
- 生成型 skill 必须输出 lint handoff，建议运行对应 validator。

### Success Metrics and KPIs

Speclite 工具化系统的成功指标应可自动或半自动验证：

- Fresh install 在空项目中可重复完成，生成预期目录、IDE skills 和 manifest。
- Update 不覆盖 human-owned files，modified generated files 有备份/报告。
- 100% installed skills 无 `_bmad`、`config.yaml`、`/bmad:*` runtime 残留。
- `.claude/skills` 与 `.agents/skills` 中同 canonical skill mirror hash 一致，平台差异有白名单。
- config/customization merge tests 覆盖所有规则分支。
- manifest/index schema validation 通过。
- Validator 规则稳定覆盖高风险问题，Critical/Major finding 归零。
- `npm run quality` 能在 CI 和本地稳定运行。

### Strategic Recommendation

Speclite 应把 BMad 视为“工具化控制面参考架构”，而不是 runtime namespace 或文件结构的直接模板。最重要的落点不是复制 `_bmad`，而是建立 Speclite 自己的：

- Node-first installer/control plane；
- `_speclite` metadata hub；
- IDE skill execution plane；
- TOML customization contract；
- manifest/index integrity gateway；
- deterministic validation pipeline；
- `_speclite-output` artifact repository。

这条路线可以在不牺牲 Speclite 当前 skill-first、local-first、TOML customization 优势的前提下，获得 BMad 最值得借鉴的能力：可安装、可更新、可验证、可扩展、可跨 IDE 分发。

---

## Research Synthesis

### Executive Summary

本技术研究的最终判断是：Speclite 应借鉴 BMad 的 **工具化控制面**，而不是复制 BMad 的目录名、命名空间或运行时路径。BMad 6.6.0 的重型价值集中在 Node.js CLI installer：它负责安装、更新、IDE 适配、manifest/index 生成、配置采集、文件 hash 保护和质量验证。Speclite 如果要形成稳定可分发的系统设计，应把 installer/control plane 作为核心工程对象，而不是把每个 workflow 的安装、目录和校验逻辑散落在 skill 文档里。

最终架构建议是明确分离三类平面：`.claude/skills`、`.agents/skills` 等 IDE skill 目录是 **execution plane**；`_speclite/` 是 **metadata/control hub**，保存 config、custom、scripts、manifest、indexes 和 update state；`_speclite-output/` 与 `docs/` 是 **artifact/data plane**，保存 research、planning、implementation、review 和 project knowledge。这个结论由 BMad installer 源码中的一个关键事实支撑：IDE 安装完成后，`_bmad` 中的 skill directories 会被清理，skills 自包含于 IDE directories。

用户已删除辅助来源目录，因此本研究的最终系统设计不再包含任何辅助来源安装、同步或 execution-plane 设计。安装器范围应限于当前 Speclite 可分发 source tree：`core-skills/`、`sdlc-skills/`、`scripts/`、`custom/`、module metadata、manifest/index 和 IDE adapters。校验规则应直接沉淀为 deterministic validator，而不是依赖已删除的辅助 skill 包。

**Key Technical Findings:**

- BMad 的 Node.js CLI installer 是 Speclite 最值得参考的核心，不是可选包装层。
- TOML 与 Node.js 不冲突；真正需要谨慎的是 human-authored TOML 的注释和格式保留。
- `_speclite` 应是 metadata/control hub，不应承担 skill execution directory 职责。
- IDE skill mirrors 是执行入口；同一 canonical skill 在不同 IDE 目录应保持内容一致。
- Manifest/index 文件应成为本地 metadata gateway，承担 discovery、routing、phase topology 和 integrity tracking。
- Hash-backed update protection 是更新安全的必需能力。
- Validator 应成为一等组件，覆盖 source layout、runtime path、BMad namespace residue、manifest schema、IDE mirror、agent menu 和 artifact path。
- 已删除的辅助来源不属于安装范围，不能出现在目标项目 runtime、IDE skill mirrors 或 manifest 中。

**Strategic Technical Recommendations:**

- 以 ADR 形式固化 Skill-first、Node-first installer、metadata hub vs execution plane、TOML contract、manifest gateway、hash update protection 等关键决策。
- 先实现 installer MVP：source discovery、IDE skill mirror、`_speclite` 初始化、manifest/index 生成。
- 保留 TOML 作为 config/customization 外部契约；installer-owned TOML 可生成，human-owned TOML 默认只读。
- 用 data-driven platform registry 适配 IDE，避免硬编码 Claude/Copilot/Cursor 分支。
- 建立 fixture install tests 和 deterministic validator，形成可重复的 `npm run quality`。

### Table of Contents

1. Technical Research Introduction and Methodology
2. Technical Landscape and Architecture Analysis
3. Implementation Approaches and Best Practices
4. Technology Stack Evolution and Current Trends
5. Integration and Interoperability Patterns
6. Performance and Scalability Analysis
7. Security and Compliance Considerations
8. Strategic Technical Recommendations
9. Implementation Roadmap and Risk Assessment
10. Future Technical Outlook and Innovation Opportunities
11. Technical Research Methodology and Source Verification
12. Technical Appendices and Reference Materials

### 1. Technical Research Introduction and Methodology

Speclite 当前处在从 skill 源定义集合走向可安装、可更新、可验证系统的阶段。BMad 提供了一个有价值的参考：它没有把方法论只停留在 Markdown 文件集合，而是通过 Node.js installer、module metadata、IDE adapters、manifest/index 和 hash protection，把 skill-first 内容变成可分发的本地工具化系统。

本研究采用本地证据方法。研究对象包括 BMad 6.6.0 源码、BMad 架构资料、Speclite 当前源码目录、Speclite runtime scripts、module metadata 和安装后 BMad 样本。由于本次研究语料由用户限定为本地源码和文档，未使用外部 Web citation；所有结论均以本地文件证据和源码行为为基础。

**Original Technical Goals:** 提炼 BMad 的 skill/config/tooling/installer/output 设计，结合 Speclite 当前定义与配置，形成可落地的系统设计建议。

**Achieved Technical Objectives:**

- 明确 Speclite 应采用 Node-first installer/control plane。
- 明确 `_speclite`、IDE skills 和 `_speclite-output` 的边界。
- 明确 TOML customization 保留，且 Node.js 可以适配 TOML。
- 明确 manifest/index/hash 是安装和更新的关键契约。
- 明确辅助来源已删除，不进入安装范围。

### 2. Technical Landscape and Architecture Analysis

Speclite 的目标架构应是 **Skill-first + Installer Control Plane + IDE Skill Execution Plane + Metadata Hub + Artifact Repository**。

**Authoring/source plane:** 当前 Speclite source tree 包含 `core-skills/`、`sdlc-skills/`、`scripts/`、`custom/` 和 module metadata。它是可分发 skill 与 runtime 工具的源定义区，不应被目标项目直接当作 runtime path。

**Installer/control plane:** Node.js CLI 负责把 source tree 转换为目标项目中的 `_speclite`、IDE skill mirrors、manifest/index 和 output directories。它还应处理配置采集、更新检测、备份恢复和校验。

**IDE execution plane:** `.claude/skills/{skill-name}`、`.agents/skills/{skill-name}` 和未来 platform-specific command pointer 才是 LLM/IDE 实际执行入口。

**Metadata hub:** `_speclite/` 保存 `config.toml`、`config.user.toml`、`custom/*.toml`、`scripts/*`、`_config/manifest.yaml`、`skill-manifest.csv`、`speclite-help.csv`、`files-manifest.csv`。

**Artifact repository:** `_speclite-output/` 与配置指定的 `docs/` 保存 planning、implementation、review、research 和 project knowledge。Installer/update 不应覆盖这些产物。

关键架构原则是：工作流逻辑仍在 Markdown skill 中，installer 不吞掉业务流程；installer 只负责包装、同步、索引、校验和保护。

### 3. Implementation Approaches and Best Practices

Speclite 实现应采取渐进式路线。

第一步不是做完整包管理系统，而是建立最小 installer 闭环：发现可安装 source skills，生成 IDE skill mirrors，创建 `_speclite`，生成 manifest/index，并能验证结果。随后再引入 config prompt、quick update、hash protection、platform registry 和 fixture tests。

实现模块建议保持清晰边界：

| Module | Responsibility |
| --- | --- |
| `installer-cli` | install/update/status/validate 命令入口 |
| `module-manager` | 读取 `module.yaml`、创建声明式目录、处理配置默认值 |
| `manifest-generator` | 生成 manifest、skill/help/files indexes 和 central config |
| `ide-manager` | 数据驱动生成 `.claude/skills`、`.agents/skills` 和 command pointers |
| `validator` | 校验 source layout、installed tree、runtime path、manifest/hash、IDE mirror |

质量策略应参考 BMad 的 npm quality pipeline，但按 Speclite 当前阶段缩小范围：format、lint、installer fixture test、reference validation、manifest/hash validation。高风险规则必须 deterministic；低风险文案类问题可由人工或 LLM 审查辅助。

### 4. Technology Stack Evolution and Current Trends

BMad 源码证据显示，installer/control plane 使用 Node.js 更合适：跨平台 CLI、文件系统操作、YAML/CSV/TOML 处理、交互式 prompts、npm distribution 和 CI scripts 都有成熟生态。Speclite 应采用 Node-first tooling，不应因为现有 resolver 是 Python 标准库脚本而误判为 Python-runtime-first。

TOML 应继续作为 config/customization 契约。Node.js 可以读取和生成 TOML；设计重点不是“能不能解析”，而是“哪些文件允许重写”。建议规则是：installer-owned TOML 可以由 Node writer 生成；human-owned override TOML 默认只读，除非后续验证了可保留注释和格式的 round-trip 工具。

推荐格式分工：

- Markdown + YAML frontmatter：skill entrypoint 和 workflow references。
- TOML：central config、user config、customization override。
- YAML：module metadata、platform registry、installation manifest。
- CSV：skill/help/files indexes。
- JSON：resolver output、schema 或 machine exchange。

这种多格式分工保持了人类可读、Git 可审查、LLM 可消费和工具可验证的平衡。

### 5. Integration and Interoperability Patterns

Speclite 不需要先设计 REST/gRPC API。它的系统 API 是文件契约和 CLI 契约。

核心协议包括：

- **Installer-to-project:** source tree -> `_speclite` + IDE skills + output dirs + manifest/index。
- **IDE-to-skill:** IDE 加载 `.claude/skills` 或 `.agents/skills` 中的 `SKILL.md`。
- **Skill-to-runtime:** skill 通过 `{project-root}`、`{skill-root}`、`{speclite-runtime-root}`、`{skill-name}` 读取 config/custom/scripts。
- **Workflow-to-artifact:** workflow 按 resolved config 写入 `_speclite-output` 或 `docs`。
- **Validator-to-system:** validator 读取 source tree、installed tree、manifest、hash、menus 并输出 findings。

IDE adapter 应数据驱动。BMad 的 `platform-codes.yaml` 证明不同平台可以由 target_dir、command pointer、extension、filter 等配置表达。Speclite 应沿用这个思路，尤其要处理多个 IDE 共享 `.agents/skills` target 的去重问题。

### 6. Performance and Scalability Analysis

Speclite 的规模压力来自 skill 数量、IDE target 数量、manifest 文件规模、配置层数和 validation 成本，而不是网络并发。

在当前阶段，CSV/YAML/TOML/Markdown 文件系统架构足够。CSV 线性扫描对于 skill/help/files index 可接受，收益是 Git 友好、可读、可 diff。真正需要关注的性能问题是避免重复写入共享 IDE target、避免全量校验在小改动时过慢，以及避免 installer 每次 update 无差别覆盖所有 generated files。

推荐优化策略：

- 用 manifest-based discovery 避免反复深度扫描。
- 对共享 target_dir 做 dedupe。
- 用 `files-manifest.csv` hash 判断哪些文件需要检查或更新。
- 对单 skill 修改做 scoped validation，全量 validation 放到 release/CI。
- 用 fixture install tests 提供稳定回归基线。

### 7. Security and Compliance Considerations

Speclite 的安全重点是本地供应链、文件所有权和误执行防护，而不是 OAuth/JWT。

关键安全规则：

- `_speclite/custom/*.toml` 和 workflow artifacts 是 human/workflow-owned，installer 不应覆盖。
- `_speclite/config*.toml`、`_speclite/_config/*` 和 IDE mirrors 是 installer-owned，可由 installer 更新，但必须有 hash/backup 保护。
- 更新前必须通过 `files-manifest.csv` 检测 user-modified generated files。
- Installed skills 不得引用 `_bmad`、`bmad-*`、旧 `config.yaml` 或 source repository path。
- Agent command pointer 生成必须基于明确的 agent metadata，不靠名称猜测。
- 关键 config、menu target、artifact path 缺失时应 HALT，而不是猜测。

这些规则直接转化为 validator 的 Critical/Major checks。

### 8. Strategic Technical Recommendations

推荐正式记录以下 ADR：

1. Speclite adopts Skill-first architecture.
2. Speclite separates metadata hub from execution plane.
3. Speclite installer is Node-first and pipeline-based.
4. TOML remains the config/customization contract.
5. Manifest/index files are the metadata gateway.
6. IDE integrations are data-driven.
7. Human-owned files are never overwritten by installer.
8. Hash-backed update protection is mandatory.
9. Validation is a first-class architecture component.
10. Deleted auxiliary sources are excluded from installer scope.

技术竞争力来自“可安装、可更新、可验证、可跨 IDE 分发”的本地工具化能力，而不是引入复杂云平台。Speclite 应保持 local-first 和 file-contract-first，同时提升工程化可信度。

### 9. Implementation Roadmap and Risk Assessment

**Phase 0: Contracts and ADRs**

- 定义 `_speclite`、IDE skills、`_speclite-output` ownership boundary。
- 定义 manifest.yaml、skill-manifest.csv、speclite-help.csv、files-manifest.csv schema。
- 定义 config/customization merge rules。
- 明确辅助来源已删除，不进入 installer scope。

**Phase 1: Installer MVP**

- 创建 Node CLI skeleton。
- 实现可安装 source skill discovery，排除非分发来源。
- 生成 `.claude/skills`、`.agents/skills`。
- 创建 `_speclite` 和 `_speclite-output`。
- 生成最小 manifest/index。

**Phase 2: Config and Module Manager**

- 读取 `core-skills/module.yaml` 与 `sdlc-skills/module.yaml`。
- 支持 declarative directory creation。
- 生成 installer-owned TOML config。
- 保留或移植 Python resolver merge semantics。

**Phase 3: IDE Adapter**

- 建立 platform registry。
- 支持 shared target dedupe。
- 支持 `.github/agents/*.agent.md` command pointer。
- 基于 metadata 生成 agent commands。

**Phase 4: Update Safety**

- 生成 `files-manifest.csv` hash。
- 实现 modified/deleted/unknown detection。
- 实现 backup/restore/report。
- 支持 quick update。

**Phase 5: Validation and CI**

- 实现 deterministic validator。
- 建立 fixture install tests。
- 提供 `npm run quality`。

**Major Risks and Mitigations:**

| Risk | Mitigation |
| --- | --- |
| `_speclite` 被误设计成执行目录 | 强制 execution plane 只在 IDE skill mirrors |
| Node 重写 human-owned TOML | human-owned TOML 默认只读 |
| Manifest schema 漂移 | schema version + fixture tests |
| IDE mirrors 不一致 | mirror hash validation |
| 更新覆盖用户修改 | files-manifest hash + backup/restore |
| 非分发来源进入安装包 | source discovery 明确 allowlist |

### 10. Future Technical Outlook and Innovation Opportunities

近期开拓重点应是稳定 installer/control plane，而不是扩展平台数量。1-2 年内最有价值的演进是：fixture-driven installation tests、deterministic validators、quick update、external source lock/hash、platform registry 和 IDE mirror health check。

中期可以考虑 registry 或 package source 管理，但仍应保持 local-first：即使未来支持外部 Speclite skill source，也应通过 lockfile、hash、manifest 和 explicit install plan 保持可审计。

长期创新机会在于让 Speclite 的 artifact repository 反向增强 workflow：research、PRD、architecture、story、review、sprint status 都作为可索引的 project knowledge，被后续 skill 以透明、可审计的方式再消费。

### 11. Technical Research Methodology and Source Verification

**Primary Local Sources:**

- `references/BMAD-METHOD-6.6.0/package.json`
- `references/BMAD-METHOD-6.6.0/tools/installer/bmad-cli.js`
- `references/BMAD-METHOD-6.6.0/tools/installer/core/installer.js`
- `references/BMAD-METHOD-6.6.0/tools/installer/core/manifest-generator.js`
- `references/BMAD-METHOD-6.6.0/tools/installer/modules/official-modules.js`
- `references/BMAD-METHOD-6.6.0/tools/installer/ide/manager.js`
- `references/BMAD-METHOD-6.6.0/tools/installer/ide/platform-codes.yaml`
- `references/source/speclite/README.md`
- `references/source/speclite/core-skills/module.yaml`
- `references/source/speclite/sdlc-skills/module.yaml`
- `references/source/speclite/scripts/resolve_config.py`
- `references/source/speclite/scripts/resolve_customization.py`
- `references/bmad-method-book/src/part2-ch04.md`
- `references/bmad-method-book/src/part2-ch06.md`
- `references/bmad-method-book/src/part2-ch07.md`
- `references/bmad-method-book/src/part3-ch09.md`
- `references/bmad-method-book/src/part4-ch13.md`
- `references/bmad-method-book/src/part6-ch19.md`
- `references/bmad-method-book/src/part8-ch23.md`

**Research Limitations:**

- 本研究未使用外部 Web citation。
- BMad gitbook 示例与实际 6.6.0 源码/安装样本可能存在差异；实际源码和安装样本优先。
- Speclite Node-first installer 尚未实现，路线图和成本评估需通过 MVP 验证。
- 用户已删除辅助来源目录，因此最终设计以当前 source tree 为准。

### 12. Technical Appendices and Reference Materials

**Recommended Installed Project Shape:**

```text
user-project/
	_speclite/
		config.toml
		config.user.toml
		custom/
		scripts/
		_config/
			manifest.yaml
			skill-manifest.csv
			speclite-help.csv
			files-manifest.csv
	.claude/skills/
	.agents/skills/
	.github/agents/
	_speclite-output/
		planning-artifacts/
		implementation-artifacts/
	docs/
```

**Recommended Quality Command Shape:**

```text
npm run format:check
npm run lint
npm run validate:source
npm run test:install
npm run validate:manifest
npm run validate:mirrors
```

**Final Technical Conclusion:**

Speclite 的系统设计应以 BMad 的 Node.js installer/tooling 为参照，建立自己的本地工具化控制面。最终目标不是让 Speclite 变成 BMad 的变体，而是形成 Speclite 自己的稳定契约：可安装的 source skills、`_speclite` metadata hub、IDE execution mirrors、TOML customization、manifest/index integrity、hash update protection、deterministic validation 和 `_speclite-output` artifact repository。

**Technical Research Completion Date:** 2026-05-11
**Research Period:** current local-source technical analysis
**Source Verification:** Local evidence only; no external Web citation used
**Technical Confidence Level:** High for local architecture findings; Medium for future implementation estimates
