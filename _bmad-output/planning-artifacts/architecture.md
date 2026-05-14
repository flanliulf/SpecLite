---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - path: '_bmad-output/planning-artifacts/prd.md'
    type: 'prd'
    title: 'Product Requirements Document - SpecLite'
  - path: '_bmad-output/planning-artifacts/research/technical-speclite-bmad-tooling-system-design-research-2026-05-11.md'
    type: 'research'
    title: 'SpecLite 工具化系统设计研究'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-05-13'
project_name: 'SpecLite'
user_name: 'Fancyliu'
date: '2026-05-13'
---

# Architecture Decision Document（架构决策文档）

_本文档通过逐步协作发现构建。我们会在推进每个架构决策时持续追加对应章节。_

## Project Context Analysis（项目上下文分析）

### Requirements Overview（需求概览）

**Functional Requirements（功能需求）：**
SpecLite 的功能需求覆盖一个完整的本地安装控制面，而不是单点脚本能力。PRD 中共有 78 条 FR，主要分布在以下领域：

- Installation & Project Onboarding（安装与项目接入）：指定安装目录、选择模块、选择 AI IDE target、生成 `_speclite` runtime、`_speclite-output` artifact repository 和 IDE skill mirrors。
- Methodology Discovery & Execution（方法论发现与执行）：生成 IDE discovery metadata，将阶段化研发能力映射为 canonical skill id、IDE entry path 和 activation target，并支持 SPEC、方案评审、故事规划、实现、测试和审查等能力调用。
- Status & Validation（状态与验证）：检查 manifest、skill/help/files index、IDE mirrors、runtime path、legacy namespace residue、菜单 target 和产物路径。
- Update & File Ownership Protection（更新与文件所有权保护）：区分 installer-owned、human-owned 和 workflow-owned 文件，更新前检测本地修改，避免覆盖用户定制和过程产物。
- Configuration & Customization（配置与定制化）：支持项目级配置、团队/个人覆盖、skill workflow/agent customization，并统一解析输出。
- Distribution Sources & Channels（分发来源与渠道）：支持 npm public/private registry、local tarball、offline bundle 和 Git source。
- Installation Feedback & Readiness（安装反馈与就绪状态）：安装过程需要清晰阶段状态、IDE target 摘要、ready summary 和下一步指引。
- Maintainer Workflow & Examples（维护者工作流与示例）：通过 fixture project 验证 fresh install、status、validate、update 和 skill artifact loop。
- Post-MVP Governance & Expansion（Post-MVP 治理与扩展）：预留 init/list/doctor/sync/uninstall、机器可读输出和流程覆盖报告。

架构上，这些需求意味着系统至少需要 source discovery、module manager、installer pipeline、IDE adapter registry、manifest/index generator、config/customization resolver、validator、update protection 和 fixture test harness 等组件。

**Non-Functional Requirements（非功能需求）：**
NFR 共 40 条，对架构有直接约束：

- Performance（性能）：`status` 需要轻量返回，`validate` 和 `update` 需要分阶段输出并避免重复写未变化文件。
- Reliability & Determinism（可靠性与确定性）：相同 source、配置和 IDE target 应生成可重复结果；validate issue set 必须稳定。
- Security & Safety（安全与保护）：安装计划外不得隐式访问外部 source；human-owned custom 和 workflow-owned artifacts 不得静默覆盖；路径输出需避免泄露无关本机信息。
- Compatibility & Portability（兼容性与可移植性）：MVP 至少覆盖 macOS 13+ 和 Windows 11；所有 manifest/index/hash/report 使用 project-relative POSIX-style path。
- Integration Quality（集成质量）：IDE adapter 必须声明能力与限制；canonical skill package hash 不应因 IDE target 不同而变化。
- Diagnostics & Observability（诊断与可观测性）：所有核心命令必须输出明确状态、issue id、category、severity、affected path 和 suggested next step。
- Maintainability & Extensibility（可维护性与可扩展性）：source discovery、module selection、IDE adapter、manifest/index generation 和 validation checks 必须模块化，新增 adapter 不应修改 canonical skill 内容。

这些 NFR 会强烈推动架构选择：本地文件契约优先、确定性 manifest/index、集中 resolver、数据驱动 IDE adapter、hash-backed update protection、fixture-driven validation。

**Scale & Complexity（规模与复杂度）：**
SpecLite 的复杂度主要来自本地工具链治理和跨 IDE 一致性，而不是高并发或大数据量。

- Primary Domain（主要领域）：AI-assisted SDLC developer tooling / local installer control plane
- Complexity Level（复杂度等级）：高
- Estimated Architectural Components（预计架构组件）：9-11 个核心组件，包括 CLI、source discovery、module manager、config resolver、customization resolver、manifest/index generator、IDE adapter registry、validator、update protection、fixture test harness、artifact governance layer。

复杂度指标：

- Real-Time Features（实时特性）：不需要实时协作或后台服务。
- Multi-Tenancy（多租户）：不需要 SaaS 多租户，但需要 team/user 配置分层。
- Regulatory Compliance（合规要求）：无强监管行业要求，但有企业研发规范落地和 Git 可审查性要求。
- Integration Complexity（集成复杂度）：高，需适配多个 AI IDE、共享 target directory、command pointer 和未来平台差异。
- Data Complexity（数据复杂度）：中等，主要是 TOML/YAML/CSV/Markdown/JSON 文件契约、manifest/hash 和 artifact metadata。
- User Interaction Complexity（用户交互复杂度）：中高，CLI 需要同时支持交互式和脚本化使用，并提供清晰诊断。

### Technical Constraints & Dependencies（技术约束与依赖）

SpecLite 的关键技术约束包括：

- MVP 必须以 Node.js 为 installer/control plane 主轴；现有 Python resolver 可作为参考或兼容背景，但不应成为主控制面依赖。
- TOML 继续作为 config/customization 的外部契约；installer-owned TOML 可生成，human-owned TOML 默认应只读或保守更新。
- 系统必须 local-first、offline-capable，不依赖数据库、云服务或后台守护进程。
- `_speclite` 是 metadata/control hub，不是 skill execution directory。
- `.claude/skills`、`.agents/skills` 等 IDE skill mirrors 是 execution plane。
- `_speclite-output` 和配置指定的 `docs` 是 workflow artifact / project knowledge plane。
- manifest/index 是 discovery、routing、phase topology、integrity 和 validation 的统一入口。
- 安装来源必须显式记录 source/channel/version/hash/trust status。
- 文件路径、hash、manifest 和 validate report 必须跨平台稳定。
- 已删除或非正式分发的辅助来源不得进入 installer scope、IDE mirrors 或 manifest。

### Cross-Cutting Concerns Identified（已识别的横切关注点）

- File Ownership Model（文件所有权模型）：installer-owned、human-owned、workflow-owned 文件边界贯穿 install、update、validate 和 docs。
- Deterministic Validation（确定性验证）：manifest/schema、IDE mirror、runtime path、menu target、legacy namespace residue、artifact path 和 file integrity 都需要稳定 issue model。
- Cross-IDE Consistency（跨 IDE 一致性）：同一 canonical skill 在不同 IDE target 中必须内容一致，平台差异限制在 adapter 或 command pointer。
- Config/Customization Resolution（配置与定制化解析）：配置合并规则必须集中实现，skill 或 adapter 不应各自实现私有合并逻辑。
- Source/channel 抽象：npm、private registry、tarball、offline bundle 和 Git source 最终需要归一为 canonical source tree。
- Path Normalization（路径规范化）：macOS/Windows、LF/CRLF、权限、大小写敏感和 shell invocation 差异需要基础设施级处理。
- Artifact Governance（产物治理）：workflow 产物必须可追踪、可再输入，但不得被 installer/update 覆盖。
- Diagnostics（诊断）：所有失败都需要可操作报告，而不是只给出错误文本。
- Fixture 驱动验收：fresh install、existing update、custom source、IDE drift 和 skill artifact loop 需要成为验收资产。

## Starter Template Evaluation（Starter 模板评估）

### Primary Technology Domain（主要技术领域）

SpecLite 的主技术域是 CLI tool / local installer control plane。基于 PRD 与技术研究，MVP 基础应采用 Node.js + TypeScript，用于实现安装器、配置解析、manifest/index 生成、IDE adapter、status/validate/update 和 fixture validation。

### Starter Options Considered（已评估的 Starter 选项）

**Option 1: oclif generator（选项 1：oclif generator）**

当前核验结果：

- `oclif`: 4.23.0
- `@oclif/core`: 4.11.2
- 官方创建命令：`oclif generate mynewcli`
- 现有项目初始化命令：`oclif init`

oclif 提供 TypeScript CLI 模板、命令生成、bin scripts、help、hooks 和插件化扩展。它适合需要插件生态、复杂命令生命周期或长期 CLI 平台化的项目。

取舍：SpecLite MVP 的核心复杂度在 installer pipeline、文件所有权、manifest/index、IDE mirror 和 deterministic validation，而不是 CLI 插件生态。oclif 会提前引入较强框架结构，可能让实现者围绕 oclif lifecycle 建模，而不是围绕 SpecLite 的文件契约和安装控制面建模。

**Option 2: Custom TypeScript CLI Starter with commander（选项 2：基于 commander 的自定义 TypeScript CLI starter）**

当前核验结果：

- `commander`: 14.0.3，Node engine `>=20`
- `tsup`: 8.5.1
- `vitest`: 4.1.6
- `typescript`: 6.0.3
- `tsx`: 4.21.0

commander 是轻量命令声明层，适合把业务架构保持在自己的模块边界内：source discovery、module manager、manifest generator、IDE adapter registry、validator、update protection。它也与 BMad installer 的既有方向更接近。

取舍：需要 SpecLite 自己定义项目结构、错误模型、help 文案、测试布局和命令约定。但这些正是 PRD 中要求成为产品契约的部分，适合由 SpecLite 控制，而不是交给重型 starter 隐式决定。

**Option 3: yargs（选项 3：yargs）**

当前核验结果：

- `yargs`: 18.0.0

yargs 成熟、功能完整，适合复杂参数解析和子命令。它可以满足 CLI 需求，但与 PRD 中强调的 installer pipeline 没有额外结构收益，也不如 commander 轻。

**Option 4: cac（选项 4：cac）**

当前核验结果：

- `cac`: 7.0.0

cac 足够轻量，但约定更少。对 SpecLite 这种需要企业可诊断输出、稳定 issue model、fixture-driven validation 的工具链来说，它提供的架构基础偏少。

**Option 5: clipanion（选项 5：clipanion）**

当前核验结果：

- `clipanion`: 4.0.0-rc.4

clipanion 当前为 RC 版本。考虑 MVP 需要稳定、可维护、企业环境可解释，不建议作为首选基础。

### Selected Starter（选定 Starter）：Custom TypeScript Node CLI Starter（自定义 TypeScript Node CLI Starter）

**Rationale for Selection（选择理由）：**

推荐采用自定义 TypeScript CLI starter，以 commander 作为命令层，而不是使用 oclif 这类完整 CLI 平台。原因是 SpecLite 的核心架构价值在本地安装控制面：可重复安装、跨 IDE mirror、一致 manifest/index、TOML customization、hash-backed update protection 和 deterministic validation。轻量 starter 能让这些边界直接成为代码结构，而不是被 starter 框架结构稀释。

**Initialization Command（初始化命令）：**

```bash
mkdir speclite-cli
cd speclite-cli
npm init -y
npm pkg set type=module
npm pkg set bin.speclite=./dist/bin/speclite.js
npm pkg set engines.node='>=20'

npm install commander@14.0.3 yaml@2.9.0 toml@4.1.1 csv-parse@6.2.1 fs-extra@11.3.5 zod@4.4.3
npm install --save-dev typescript@6.0.3 tsx@4.21.0 tsup@8.5.1 vitest@4.1.6 @types/node@25.7.0
```

**Architectural Decisions Provided by Starter（Starter 提供的架构决策）：**

**Language & Runtime（语言与运行时）：**
基于 Node.js 的 TypeScript，采用 ESM package structure，并在 starter 初始命令中显式设置 Node engine 要求。注意：该初始命令里的 `>=20` 已被后续核心决策修正为 Node 22 minimum + Node 24 recommended；实现 story 必须同步修正。

**Styling Solution（样式方案）：**
不适用。该项目是 CLI/control-plane，不是前端应用。输出格式应通过轻量 diagnostics/output 层处理，而不是引入 UI styling libraries。

**Build Tooling（构建工具）：**
`tsup` 提供简单的 TypeScript 构建管线，用于 CLI 分发。架构应保持 build output 与 source 分离，并在可行处保持 generated files 的确定性。

**Testing Framework（测试框架）：**
`vitest` 支持 config/customization merge rules、path normalization、source discovery、manifest generation、validator issue model 和 update protection 的单元测试。Installer pipeline 周围应补充 fixture install tests。

**Code Organization（代码组织）：**
Starter 应建立以下顶层模块：

- `src/bin/`: CLI Entrypoint（CLI 入口）与 Command Registration（命令注册）。
- `src/commands/`: Command Orchestration（命令编排），覆盖 `install`、`status`、`validate`、`update` 和 runtime support command `resolve`。
- `src/source/`: Source/Channel Resolution（来源/渠道解析）与 Source Discovery（来源发现）。
- `assets/source/speclite/`: Bundled Source Assets（内置源资产），存放随产品发布的 SpecLite source definitions；不得与 `src/source/` resolver 代码混放。
- `src/modules/`: Module Metadata Parsing（模块元数据解析）与 Module Selection（模块选择）。
- `src/config/`: Config Resolver（配置解析器）与 Customization Resolver（定制化解析器）。
- `src/manifest/`: Manifest Generation（清单生成）与 skill/help/files index generation（索引生成）。
- `src/ide/`: Data-Driven IDE Adapter Registry（数据驱动 IDE 适配器注册表）。
- `src/validation/`: Deterministic Validation Rules（确定性验证规则）与 Issue Model（问题模型）。
- `src/update/`: Ownership Manifest（所有权清单）、Hash Comparison（哈希比较）与 Update Protection（更新保护）。
- `src/fs/`: Path Normalization（路径规范化）、Project-Relative POSIX Paths（项目相对 POSIX 路径）与 Safe Writes（安全写入）。
- `test/fixtures/`: fresh install、existing update、custom source、IDE drift 和 skill artifact loop fixtures。

**Development Experience（开发体验）：**
该 starter 保持 CLI framework 轻量，并让 SpecLite 自身架构显式化。它通过 `tsx` 支持快速本地执行，通过 `tsup` 支持生产构建，通过 `vitest` 支持确定性测试。

**Note（说明）：** 使用该命令初始化项目应作为第一条 implementation story；同时必须按后续核心决策修正 Node engine 与类型依赖策略。

## Core Architectural Decisions（核心架构决策）

### Decision Priority Analysis（决策优先级分析）

**Critical Decisions（关键决策，阻塞实现）：**

- Runtime Baseline（运行时基线）：Node.js 22 LTS 是最低支持运行时，Node.js 24 LTS 是推荐运行时。
- CLI Foundation（CLI 基础）：TypeScript + commander，并由 SpecLite 自己拥有 installer pipeline modules。
- Storage Model（存储模型）：filesystem-first，MVP 不使用数据库或后台服务。
- Runtime Boundaries（运行时边界）：`_speclite` 是 metadata/control hub，IDE skill directories 是 execution plane，`_speclite-output` 是 artifact repository。
- Validation Model（验证模型）：`status`、`validate`、未来 JSON output 和 fixture assertions 共享 deterministic issue model。
- Update Safety（更新安全）：写入前先执行 ownership manifest + hash comparison。

**Important Decisions（重要决策，塑造架构）：**

- TOML Contract（TOML 契约）：TOML 保持为面向人的 config/customization contract。
- File-Contract Responsibilities（文件契约职责）：YAML/CSV/JSON/Markdown 各自承担明确的 file-contract 职责。
- Data-Driven IDE Adapters（数据驱动 IDE 适配器）：IDE integrations 采用 data-driven adapters。
- Source/Channel Abstraction（来源/渠道抽象）：将 npm、private registry、tarball、offline bundle 和 Git source 归一为 canonical source descriptor。
- Fixture Projects（Fixture 项目）：fixture projects 是必需的验收资产，不是可选示例。

**Deferred Decisions（延后决策，Post-MVP）：**

- Web service、hosted registry UI 或云同步：延后，因为 MVP 是 local-first。
- 数据库支撑的索引或缓存：延后，直到 manifest/file scan 成本被证明成为瓶颈。
- 从 legacy/manual installs 完整自动迁移：延后；MVP 负责报告边界并保护既有文件。
- 所有命令的 machine-readable JSON output：模型现在设计，完整 CLI surface 可在 Post-MVP 扩展。

### Data Architecture（数据架构）

SpecLite 使用 filesystem-backed data contracts，而不是数据库。

**Decision（决策）：** MVP 不使用数据库。使用 project-relative files 作为 system of record。

**Rationale（理由）：**
该产品是本地 installer/control plane。它的核心状态天然适合表示为 Git 可审查文件：config、manifests、indexes、hashes、IDE mirrors 和 workflow artifacts。

**Data Contracts（数据契约）：**

- TOML：`_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/*.toml`。
- YAML：module metadata、platform adapter registry 和 `_speclite/_config/manifest.yaml`。
- CSV：`skill-manifest.csv`、help/menu index 和 `files-manifest.csv`。
- Markdown：skills、workflow instructions 和生成的 planning/implementation/review artifacts。
- JSON：internal resolver output、validation issue model 和未来 machine-readable command output。

**Validation Strategy（验证策略）：**
在需要 TypeScript runtime checks 的地方使用 `zod@4.4.3` 做内部 schema validation。YAML/TOML/CSV parsing 使用 starter 评估阶段已核验的固定版本 parser libraries。

**Migration Approach（迁移策略）：**
承载 schema 的文件必须包含 schema version。未来不兼容变更应产生 `migration-needed` diagnostics，而不是静默重写。

**Caching Strategy（缓存策略）：**
MVP 不使用持久 database cache。使用 manifest/hash baselines 优化 update 与 validation。

### Authentication & Security（认证与安全）

**Decision（决策）：** MVP 不实现用户认证系统。安全重点放在 local source trust、file ownership 和 safe writes。

**Rationale（理由）：**
SpecLite 在 MVP 中不托管用户账号或远程服务。真正的安全面是本地供应链和文件变更安全。

**Security Decisions（安全决策）：**

- Install plans 必须在执行前声明 external source access。
- Source descriptors 记录 source type、channel、version/hash 和 trust status。
- Human-owned custom files 与 workflow-owned artifacts 永不被静默覆盖。
- Installer-owned files 仅在 ownership 与 hash checks 后更新。
- 所有 report paths 尽可能使用 project-relative POSIX-style paths。
- Validator 将 `_bmad`、legacy runtime path 和 stale IDE entry residue 标记为显式 issue categories。
- Git source、tarball 和 offline bundle installs 必须产生 source/hash diagnostics。

**Authorization Pattern（授权模式）：**
MVP 不适用。未来企业策略控制可以叠加在 source/channel allowlists 与 validation gates 上。

### API & Communication Patterns（API 与通信模式）

**Decision（决策）：** SpecLite 暴露 CLI API 和 file-contract API，而不是 REST 或 GraphQL。

**MVP CLI Commands（MVP CLI 命令）：**

- `speclite install`
- `speclite status`
- `speclite validate`
- `speclite update`
- `speclite resolve config`
- `speclite resolve customization`

`resolve` 是 runtime support command（运行时支撑命令）：它属于 MVP API surface，用于支撑已安装 skills 解析 config/customization，但不作为主用户旅程命令宣传。

**Communication Contracts（通信契约）：**

- Installer-to-project：source tree 写入 `_speclite`、IDE mirrors、manifest/index 和 output directories。
- IDE-to-skill：`.claude/skills/*` 和 `.agents/skills/*` 加载 self-contained skill packages。
- Skill-to-runtime：skills 通过 `_speclite` 解析 project config/customization。
- Workflow-to-artifact：workflows 写入已配置的 artifact locations。
- Validator-to-user：findings 使用稳定的 issue id、category、severity、affected path、impact 和 suggested next step。

**Error Handling Standard（错误处理标准）：**
所有失败在内部返回 structured diagnostic objects，再渲染为 human-readable CLI output。未来 JSON output 必须复用同一 issue model。

**Rate Limiting（限流）：**
MVP 不适用，因为没有服务器请求面。

### Frontend Architecture（前端架构）

MVP 不涉及前端架构。

**Decision（决策）：** MVP 不提供 browser UI 或 desktop UI。

**Rationale（理由）：**
PRD 描述的是本地 CLI/control plane。UI 会增加表面积，却不能改善核心验证目标：install、status、validate、update、cross-IDE mirrors 和 workflow artifact governance。

**Implication（影响）：**
所有用户交互通过 CLI prompts、flags、generated files 和 validation reports 完成。未来任何 UI 都应消费同一 manifest 和 issue model，而不是发明独立状态。

### Infrastructure & Deployment（基础设施与部署）

**Decision（决策）：** 以 Node.js CLI package 分发，并支持 local/offline install paths。

**Runtime Baseline（运行时基线）：**
Node.js 22 LTS 是最低支持运行时，Node.js 24 LTS 是推荐运行时。MVP 的兼容性声明必须由 Node 22 与 Node 24 上的 fixture install/status/validate/update/resolve 覆盖支撑。Node 20 因 EOL 被排除，Node 26 Current 不作为 MVP 基线。

**Distribution Channels（分发渠道）：**

- npm 公共 registry
- 私有 npm registry
- 本地 tarball
- 离线 bundle
- Git source

**CI/CD Approach（CI/CD 策略）：**
CI 应运行 formatting、linting、unit tests、fixture install tests、manifest validation 和 IDE mirror validation。Release readiness 必须依赖 fixture acceptance，而不只依赖 unit tests。

**Environment Configuration（环境配置）：**
MVP 不需要环境服务器配置。CLI 读取 explicit flags、project config 和 source/channel descriptors。

**Monitoring and Logging（监控与日志）：**
不提供 runtime monitoring service。Diagnostics 来自 command outputs、validation reports 和 manifest/index state。

**Scaling Strategy（扩展策略）：**
通过 deterministic manifests、shared target dedupe、hash-based skip logic 和 scoped validation 扩展。除非 file-contract complexity 被证明不足，否则不引入服务或数据库。

### Decision Impact Analysis（决策影响分析）

**Implementation Sequence（实现顺序）：**

1. Establish TypeScript CLI skeleton on Node 22 minimum and Node 24 recommended runtime policy.
2. Implement shared path normalization and safe filesystem writes.
3. Implement source/channel descriptor and source discovery.
4. Implement module metadata parser and module selection.
5. Implement TOML config/customization resolver and `speclite resolve` runtime support command.
6. Implement manifest/index generator.
7. Implement data-driven IDE adapter registry.
8. Implement install/status/validate/update command flows.
9. Implement ownership manifest and hash-backed update protection.
10. Add fixture projects and deterministic validation assertions, including resolve parity fixtures, for both Node 22 and Node 24.

**Cross-Component Dependencies（跨组件依赖）：**

- Path normalization 支撑 manifest generation、validation reports、update safety 和 cross-platform fixtures。
- Source/channel descriptor 供 install、status、validate 和 update 使用。
- Config/customization resolver 必须被 skills、installer 和 validation rules 共享。
- IDE adapter output 必须能被 validator 反向验证。
- Ownership 与 hash model 必须在 install 阶段写入，update 才可信。
- Fixture tests 必须覆盖 generated files 和 user-owned preservation behavior。

## Implementation Patterns & Consistency Rules（实现模式与一致性规则）

### Pattern Categories Defined（已定义的模式类别）

**Critical Conflict Points Identified（已识别的关键冲突点）：**
已识别 11 类容易造成 AI agent 实现不一致的冲突点：命令命名、文件命名、路径规范化、manifest 字段、配置合并行为、source descriptor、IDE adapter 输出、validation issue 格式、update ownership 状态、fixture 组织和诊断文案。

### Naming Patterns（命名模式）

**Database Naming Conventions（数据库命名约定）：**
MVP 不使用数据库。Agent 不得引入 SQLite、嵌入式数据库或长期缓存存储，除非后续 ADR 明确改变存储模型。

**API Naming Conventions（API 命名约定）：**
SpecLite 的 API 表面是 CLI 命令和文件契约。

- CLI 命令使用清晰动词：`speclite install`、`speclite status`、`speclite validate`、`speclite update`。
- CLI flags 使用 kebab-case：`--project-root`、`--source-type`、`--offline-bundle`、`--json`。
- 机器可读 issue 字段使用 camelCase：`issueId`、`affectedPath`、`suggestedNextStep`。
- 面向用户的文件契约分类使用稳定 lower-kebab category：`manifest-schema`、`ide-mirror`、`runtime-path`、`file-integrity`。

**Code Naming Conventions（代码命名约定）：**

- TypeScript 源文件使用 kebab-case：`source-descriptor.ts`、`path-normalizer.ts`。
- Class 和 type 使用 PascalCase：`SourceDescriptor`、`ValidationIssue`。
- Function 和 variable 使用 camelCase：`normalizeProjectPath`、`sourceDescriptor`。
- 全局常量仅在 process-wide constant 场景使用 SCREAMING_SNAKE_CASE：`DEFAULT_MANIFEST_VERSION`。
- Canonical skill id 以 source 定义为准，不得被代码风格规则改写。

### Structure Patterns（结构模式）

**Project Organization（项目组织）：**

- `src/bin/`: 只放 CLI entrypoint。
- `src/commands/`: `install`、`status`、`validate`、`update` 和 `resolve` 的命令编排。
- `src/source/`: source/channel descriptor 与 canonical source discovery。
- `assets/source/speclite/`: 产品内置 SpecLite source definitions；由 `src/source/` 的 resolver 读取并归一为 canonical source tree。
- `src/modules/`: module metadata 解析与 module selection。
- `src/config/`: config 与 customization resolver。
- `src/manifest/`: manifest、skill/help/files index 生成。
- `src/ide/`: data-driven IDE adapter registry 与 target writers。
- `src/validation/`: validation rules 与共享 issue model。
- `src/update/`: ownership state、hash comparison 与 update plan。
- `src/fs/`: path normalization、safe writes 与 project-relative POSIX paths。
- `test/fixtures/`: fixture projects 与 expected outputs。

**File Structure Patterns（文件结构模式）：**

- 测试单个模块的 unit test 与源文件同目录，命名为 `*.test.ts`。
- Fixture integration tests 放在 `test/fixtures/`，包含 expected file tree 和 expected validation summary。
- 生成的 fixture output 必须确定性稳定，除非字段明确声明允许 timestamp 差异。
- 用户文档和示例不得复制 schema 真相源；应引用 schema 或 fixture output。

### Format Patterns（格式模式）

**API Response Formats（API 响应格式）：**
MVP 无 REST API。CLI 内部仍使用共享 command result shape：

```ts
type CommandResult = {
  status: "success" | "warning" | "failure";
  command: string;
  targetProject: string;
  summary: string;
  issues: ValidationIssue[];
  nextActions: string[];
};
```

**Data Exchange Formats（数据交换格式）：**

- manifest、index 和 validation output 中的路径使用 project-relative POSIX-style path。
- 需要 timestamp 的 generated metadata 使用 ISO 8601 string。
- JSON fields 使用 camelCase。
- YAML manifest fields 默认使用 camelCase，除非匹配既有外部契约。
- CSV headers 必须显式定义，并由所属 manifest/schema version 管理。
- 仅当“缺失”和“空值”语义不同的时候使用 `null`。

### Communication Patterns（通信模式）

**Event System Patterns（事件系统模式）：**
MVP 无运行时 event bus。Installer pipeline steps 表达为有序 step records：

- `source-discovery`
- `manifest-generation`
- `ide-mirror-creation`
- `config-initialization`
- `basic-validation`
- `ready-summary`

Step output 必须包含 status、component，以及相关 affected paths。

**State Management Patterns（状态管理模式）：**
状态从文件系统和 manifest 推导，不依赖隐藏进程内存。

- `status` 读取轻量 installed state。
- `validate` 执行完整检查。
- `update` 写入前必须构建 explicit update plan。
- `install` 必须检测 existing install，禁止静默覆盖。

### Process Patterns（流程模式）

**Error Handling Patterns（错误处理模式）：**
所有 validation 与 command error 使用同一 issue model：

```ts
type ValidationIssue = {
  issueId: string;
  category: string;
  severity: "info" | "warning" | "error" | "critical";
  affectedPath?: string;
  component?: string;
  impact: string;
  suggestedNextStep: string;
};
```

规则：

- 不向用户直接抛出 raw parser error。
- 文件系统、parser 和 adapter error 必须包装为 diagnostic issue。
- 不暴露无关 absolute local path、环境变量值或认证信息。
- unsafe overwrite、schema corruption、missing required runtime contract 使用 `critical`。

**Loading State Patterns（加载状态模式）：**
长操作 CLI 命令输出有序 progress events。Progress label 必须与上面的 installer step names 一致。只有 required steps 全部通过后才能展示 ready summary。

### Enforcement Guidelines（执行与约束指南）

**All AI Agents MUST（所有 AI Agent 必须）：**

- 在生成 manifest、index 和 report 时使用 project-relative POSIX-style paths。
- 保持 `_speclite` 为 metadata/control hub，IDE skill directories 为 execution plane，`_speclite-output` 为 artifact repository。
- 对 `status`、`validate`、update conflicts 和未来 JSON output 使用共享 validation issue model。
- 默认保护 human-owned custom files 与 workflow artifacts。
- 修改 install、update、validation、source 或 IDE adapter 行为时，同步新增或更新 fixture assertions。
- 将 config/customization merge logic 集中放在 `src/config/`。

**Pattern Enforcement（模式约束）：**

- Unit tests 验证 schema 命名、merge behavior 和 path normalization。
- Fixture tests 验证 generated file trees、manifest/index snapshots、update protection 和 validation output。
- Validator rules 使用稳定 issue id 报告 pattern violations。
- Pattern 变更必须更新本文档或后续 ADR。

### Pattern Examples（模式示例）

**Good Examples（正例）：**

- `affectedPath: "_speclite/_config/manifest.yaml"`
- `issueId: "manifest-schema.missing-version"`
- `category: "ide-mirror"`
- `src/validation/ide-mirror.test.ts`
- `speclite validate --project-root ./fixtures/fresh-install-empty-project`

**Anti-Patterns（反模式）：**

- 将 absolute home-directory path 写入 manifest。
- 让 IDE adapter 修改 canonical skill package 内容。
- 在 adapter 或 skill helper 中新增第二套 config merge implementation。
- install/update 未经明确用户动作就修改 `_speclite/custom/*.toml`。
- 未覆盖 Node 22 fixture 却使用 Node 24-only API。
- validation failure 只输出 free-form string，没有 issue id、category 和 affected path。

## Project Structure & Boundaries（项目结构与边界）

### Complete Project Directory Structure（完整项目目录结构）

```text
speclite-cli/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── .gitignore
├── .npmignore
├── .editorconfig
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── architecture.md
│   ├── installation.md
│   ├── validation.md
│   └── troubleshooting.md
├── assets/
│   └── source/
│       └── speclite/
│           ├── core-skills/
│           ├── sdlc-skills/
│           ├── custom/
│           └── scripts/
├── src/
│   ├── bin/
│   │   └── speclite.ts
│   ├── commands/
│   │   ├── install.ts
│   │   ├── status.ts
│   │   ├── validate.ts
│   │   ├── update.ts
│   │   └── resolve.ts
│   ├── source/
│   │   ├── source-descriptor.ts
│   │   ├── source-resolver.ts
│   │   ├── source-discovery.ts
│   │   └── source-integrity.ts
│   ├── modules/
│   │   ├── module-metadata.ts
│   │   ├── module-selection.ts
│   │   ├── module-directories.ts
│   │   └── official-modules.ts
│   ├── config/
│   │   ├── config-schema.ts
│   │   ├── config-reader.ts
│   │   ├── config-writer.ts
│   │   ├── customization-schema.ts
│   │   ├── customization-reader.ts
│   │   └── merge-rules.ts
│   ├── manifest/
│   │   ├── manifest-schema.ts
│   │   ├── manifest-generator.ts
│   │   ├── skill-index.ts
│   │   ├── help-index.ts
│   │   ├── files-index.ts
│   │   └── hash.ts
│   ├── ide/
│   │   ├── adapter-registry.ts
│   │   ├── adapter-schema.ts
│   │   ├── target-writer.ts
│   │   ├── mirror-validator.ts
│   │   └── adapters/
│   │       ├── claude-code.ts
│   │       ├── agents-directory.ts
│   │       └── github-copilot.ts
│   ├── validation/
│   │   ├── issue-model.ts
│   │   ├── validate-project.ts
│   │   ├── rules/
│   │   │   ├── manifest-schema.ts
│   │   │   ├── ide-mirror.ts
│   │   │   ├── runtime-path.ts
│   │   │   ├── menu-target.ts
│   │   │   ├── legacy-namespace.ts
│   │   │   ├── artifact-path.ts
│   │   │   └── file-integrity.ts
│   │   └── reporters/
│   │       ├── human-reporter.ts
│   │       └── json-reporter.ts
│   ├── update/
│   │   ├── ownership-model.ts
│   │   ├── update-plan.ts
│   │   ├── conflict-detector.ts
│   │   ├── backup.ts
│   │   └── apply-update.ts
│   ├── installer/
│   │   ├── install-plan.ts
│   │   ├── install-context.ts
│   │   ├── install-runner.ts
│   │   ├── ready-summary.ts
│   │   └── progress-events.ts
│   ├── fs/
│   │   ├── path-normalizer.ts
│   │   ├── safe-write.ts
│   │   ├── copy-tree.ts
│   │   └── permissions.ts
│   ├── diagnostics/
│   │   ├── command-result.ts
│   │   ├── errors.ts
│   │   └── output.ts
│   └── index.ts
├── test/
│   ├── unit/
│   │   ├── config/
│   │   ├── fs/
│   │   ├── manifest/
│   │   ├── source/
│   │   └── validation/
│   ├── integration/
│   │   ├── install.test.ts
│   │   ├── status.test.ts
│   │   ├── validate.test.ts
│   │   └── update.test.ts
│   └── fixtures/
│       ├── fresh-install-empty-project/
│       ├── existing-install-update/
│       ├── custom-source-install/
│       ├── ide-mirror-drift/
│       └── skill-artifact-loop/
├── fixtures/
│   ├── sources/
│   │   ├── minimal-speclite-source/
│   │   └── full-speclite-source/
│   └── expected/
│       ├── manifests/
│       ├── file-trees/
│       └── validation-summaries/
└── dist/
    └── bin/
        └── speclite.js
```

### Architectural Boundaries（架构边界）

**API Boundaries（API 边界）：**
SpecLite 的 API 边界是 CLI commands 与 file contracts。`src/commands/` 只负责参数解析、调用 orchestration 和返回 `CommandResult`，不得直接写 manifest、复制 IDE mirrors 或执行深层 validation rule。

**Component Boundaries（组件边界）：**

- `source/` 只负责把 npm/private registry/tarball/offline bundle/Git source 归一为 Canonical Source Tree（规范来源树）与 Source Descriptor（来源描述符）。
- `assets/source/speclite/` 是 bundled source assets（内置源资产）边界，存放产品随包发布的 SpecLite source definitions；它由 `src/source/` 读取，但不属于 resolver 代码。
- `modules/` 只负责读取 Module Metadata（模块元数据）、选择模块、创建 Declarative Directories（声明式目录）。
- `config/` 是唯一 Config/Customization Merge Implementation（配置/定制化合并实现）所在位置。
- `manifest/` 是唯一 Manifest/Index/Hash Generation（清单/索引/哈希生成）位置。
- `ide/` 只处理 Platform Adapter（平台适配器）、Target Directory（目标目录）、Command Pointer（命令指针）和 Mirror Validation（镜像验证）。
- `validation/` 只读取 State（状态）并产生 Issues（问题），不直接修复。
- `update/` 只基于 Ownership/Hash（所有权/哈希）生成并执行 Update Plan（更新计划）。
- `installer/` 编排 Install Flow（安装流程），但不拥有各领域规则。
- `fs/` 是唯一允许实现 Path Normalization（路径规范化）、Safe Writes（安全写入）和跨平台文件操作的模块。

**Service Boundaries（服务边界）：**
MVP 无网络服务。内部 service boundary 通过 TypeScript module API 和 file contract 体现。跨模块通信必须使用明确数据结构，例如 `SourceDescriptor`、`InstallPlan`、`Manifest`、`ValidationIssue`、`UpdatePlan`。

**Data Boundaries（数据边界）：**

- `_speclite/`: metadata/control hub。
- `assets/source/speclite/`: product-shipped bundled source assets。
- `.claude/skills/`、`.agents/skills/`: IDE execution plane。
- `_speclite-output/`: workflow artifact repository。
- `docs/`: project knowledge。
- `test/fixtures/`: acceptance and regression assets。

### Requirements to Structure Mapping（需求到结构的映射）

**Feature/FR Mapping（功能/FR 映射）：**

- FR1-FR17 安装与项目接入 → `src/commands/install.ts`、`src/installer/`、`src/source/`、`src/modules/`、`src/ide/`、`src/manifest/`。
- FR18-FR24 方法论发现与执行 → `src/manifest/help-index.ts`、`src/ide/adapter-registry.ts`、`src/ide/target-writer.ts`、fixture `skill-artifact-loop/`。
- FR25-FR35 状态与验证 → `src/commands/status.ts`、`src/commands/validate.ts`、`src/validation/`、`src/diagnostics/`。
- FR36-FR41 更新与文件所有权保护 → `src/commands/update.ts`、`src/update/`、`src/manifest/files-index.ts`。
- FR42-FR52a 配置与定制化 → `src/config/` 与 `src/commands/resolve.ts`。
- FR53-FR59 分发来源与渠道 → `src/source/`。
- FR60-FR65 安装反馈与就绪状态 → `src/installer/progress-events.ts`、`src/installer/ready-summary.ts`、`src/diagnostics/output.ts`。
- FR66-FR71 维护者工作流与示例 → `test/fixtures/`、`fixtures/expected/`、`docs/`。
- FR72-FR78 Post-MVP 治理与扩展 → 在 `commands/`、`validation/reporters/`、`ide/adapters/` 中预留 schema 与 module boundaries。

**Cross-Cutting Concerns（横切关注点）：**

- 路径规范化 → `src/fs/path-normalizer.ts`，所有模块调用它，不自行拼接 report path。
- Issue model → `src/validation/issue-model.ts` 与 `src/diagnostics/command-result.ts`。
- 文件所有权 → `src/update/ownership-model.ts`。
- Hash integrity → `src/manifest/hash.ts` 与 `src/manifest/files-index.ts`。
- Node 运行时支持 → CI workflow 和 Node 22/Node 24 fixture matrix。
- Legacy namespace residue → `src/validation/rules/legacy-namespace.ts`。

### Integration Points（集成点）

**Internal Communication（内部通信）：**

- CLI command → installer/update/validation/resolve orchestration。
- Resolve command → config/customization resolver → stable JSON output for installed skills。
- Installer → source resolver → module manager → manifest generator → IDE target writer → validation。
- Update → files index/hash → conflict detector → backup → safe write。
- Status → manifest reader + lightweight validation summary。
- Validate → all validation rules → human/json reporter。

**External Integrations（外部集成）：**

- npm public/private registry 通过 source resolver 接入。
- local tarball 与 offline bundle 通过 source resolver 接入。
- Git source 通过 source resolver 接入。
- AI IDE target directories 通过 IDE adapters 接入。
- CI 通过 npm scripts 和 fixture test commands 接入。

**Data Flow（数据流）：**

1. 用户命令创建 command context。
2. Source resolver 返回 canonical source descriptor。
3. Module manager 选择模块并声明 required directories。
4. Installer 写入 `_speclite`、IDE mirrors 和 `_speclite-output`。
5. Manifest generator 记录 installed state 与 file hashes。
6. Validator 读取 installed state 并输出 issues。
7. Update 在写入变更前使用 files manifest 与 ownership model。

### File Organization Patterns（文件组织模式）

**Configuration Files（配置文件）：**

- Package/build/test 配置保留在项目根目录。
- Runtime config templates 与 schema 位于 `src/config/`；产品内置 source definitions 位于 `assets/source/speclite/`。
- 生成到目标项目的配置由 `_speclite/config.toml` 与 `_speclite/config.user.toml` 持有。
- Human-owned overrides 位于已安装项目的 `_speclite/custom/`。

**Source Organization（源码组织）：**
Source code 按架构能力组织，而不是按泛化 utility buckets 组织。Shared utilities 仅在服务多个架构组件时允许放入 `src/fs/` 和 `src/diagnostics/`。

**Test Organization（测试组织）：**

- Unit tests 验证单个 module boundary。
- Integration tests 验证 command behavior。
- Fixtures 验证端到端 install/update/validate 结果。
- Expected outputs 与 fixture inputs 分开存储。

**Asset Organization（资产组织）：**
MVP 没有 frontend/static assets。随产品发布的 SpecLite source definitions 位于 `assets/source/speclite/`；fixture source 和 expected installed trees 位于 `fixtures/`。

### Development Workflow Integration（开发工作流集成）

**Development Server Structure（开发服务结构）：**
没有 development server。本地开发使用 `tsx` 执行 CLI，使用 `vitest` 运行测试。

**Build Process Structure（构建流程结构）：**
`tsup` 将 `src/bin/speclite.ts` 构建到 `dist/bin/speclite.js`。Package distribution 包含 compiled CLI 和必需 runtime assets；除非明确作为示例打包，否则不包含 test fixtures。

**Deployment Structure（部署结构）：**
分发目标包括 npm package、private registry package、local tarball 和 offline bundle。Build output 必须保留 CLI bin mapping，并包含 installer execution 所需的 runtime assets。

## Architecture Validation Results（架构验证结果）

### Coherence Validation（一致性验证）✅

**Decision Compatibility（决策兼容性）：**
整体架构决策兼容。TypeScript + commander 的轻量 CLI 基础与 local-first filesystem architecture、manifest/index gateway、data-driven IDE adapters、hash-backed update protection 和 deterministic validation pipeline 相互支撑，没有要求数据库、后台服务或云运行时。

唯一需要注意的一致性点是：“Starter 模板评估”中的初始命令仍保留早期 `engines.node='>=20'` 和 `@types/node@25.7.0`，但“核心架构决策”已明确 Node.js 22 LTS 为 minimum、Node.js 24 LTS 为 recommended。该问题不阻塞架构，但必须在第一条 implementation story 中修正为 Node 22/24 测试矩阵对应配置。

**Pattern Consistency（模式一致性）：**
Implementation Patterns 支持核心架构决策。路径规范化、issue model、ownership model、config resolver、IDE adapter、fixture assertions 都被定义为共享规则，能够减少不同 AI agent 在命名、目录、错误格式、manifest 字段和更新行为上的分歧。

**Structure Alignment（结构对齐）：**
项目结构与架构边界一致。`src/source/`、`src/modules/`、`src/config/`、`src/manifest/`、`src/ide/`、`src/validation/`、`src/update/`、`src/installer/`、`src/fs/` 的职责边界清楚，能够承载 PRD 中的 install/status/validate/update/resolve、source/channel、IDE mirror、manifest/index、文件所有权和 fixture 验证需求。

### Requirements Coverage Validation（需求覆盖验证）✅

**Epic/Feature Coverage（Epic/功能覆盖）：**
当前未加载独立 epics/stories，因此以 FR 分类验证。所有主要功能域都有明确架构承载位置：安装与 onboarding、方法论发现与执行、status/validate、update protection、config/customization、distribution source、readiness summary、maintainer fixture workflow 和 Post-MVP 扩展点均已映射到目录与组件。

**Functional Requirements Coverage（功能需求覆盖）：**
FR1-FR78 及 FR52a 均有架构支撑：

- FR1-FR17 → installer/source/modules/ide/manifest。
- FR18-FR24 → help index、IDE adapter、skill artifact fixture。
- FR25-FR35 → status/validate、validation rules、diagnostics。
- FR36-FR41 → update、ownership model、files index/hash。
- FR42-FR52a → config/customization resolver and `resolve` runtime support command。
- FR53-FR59 → source resolver/source descriptor。
- FR60-FR65 → progress events、ready summary、diagnostics output。
- FR66-FR71 → fixture projects、expected outputs、docs。
- FR72-FR78 → Post-MVP 命令与 reporter 扩展边界。

**Non-Functional Requirements Coverage（非功能需求覆盖）：**
NFR 已被架构显式覆盖：

- Performance（性能）：`status` 轻量读取，`validate` 分层检查，`update` 使用 hash skip。
- Reliability & Determinism（可靠性与确定性）：manifest/index、fixture expected outputs、stable issue model。
- Security & Safety（安全与保护）：install plan、source descriptor、ownership/hash、protected human/workflow files。
- Compatibility & Portability（兼容性与可移植性）：Node 22/24 policy、project-relative POSIX paths、跨平台 path normalization。
- Integration Quality（集成质量）：data-driven IDE adapters、mirror validator、canonical skill hash boundary。
- Diagnostics & Observability（诊断与可观测性）：`CommandResult`、`ValidationIssue`、human/json reporters。
- Maintainability & Extensibility（可维护性与可扩展性）：模块边界与 schema/version 扩展点。

### Implementation Readiness Validation（实现就绪验证）✅

**Decision Completeness（决策完整性）：**
关键决策已覆盖运行时、CLI 基础、存储模型、runtime boundaries、validation model、update safety、文件格式、IDE adapter、source/channel 和 fixture 资产。核心依赖版本已在 Starter/Core 决策阶段核验。

**Structure Completeness（结构完整性）：**
项目结构足够具体，覆盖 root config、source modules、tests、fixtures、expected outputs、build output 和 CI 入口。每个 FR 分类均能找到落点。

**Pattern Completeness（模式完整性）：**
命名、结构、格式、communication、state、error handling、loading/progress、enforcement 和 anti-patterns 均已定义。AI agent 可据此避免重复实现 config merge、随意写 absolute path、绕过 issue model 或覆盖 custom artifacts。

### Gap Analysis Results（缺口分析结果）

**Critical Gaps（关键缺口）：**
无未解决 critical gap。当前架构可以指导 implementation story 创建。

**Important Gaps（重要缺口）：**

- Starter 初始化命令需要跟随最终 runtime 决策修正：不得继续使用 `engines.node='>=20'` 作为正式实现命令；`@types/node` 也不应采用与 Node 22/24 兼容目标不一致的版本策略。
- JSON reporter 已在结构中预留，但 PRD 将完整机器可读输出列为 Post-MVP；实现时应避免把 JSON reporter 扩大成 MVP 必交付，除非 story 明确要求。
- Git source/private registry/offline bundle 的 source resolver 边界已定义，但具体安全策略和 trust status 字段仍需要在 implementation story 或 ADR 中细化。

**Nice-to-Have Gaps（可选增强缺口）：**

- 可在后续 ADR 中单独固化 source descriptor schema。
- 可在后续 ADR 中单独固化 validation issue id taxonomy。
- 可在后续文档中补充 fixture expected output 示例。

### Validation Issues Addressed（已处理的验证问题）

- Node runtime policy 已从 “Node 24 only / `>=20`” 修正为 “Node 22 minimum + Node 24 recommended”。
- 架构验证记录 starter 命令与最终 runtime policy 的不一致，并要求第一条 implementation story 修正初始化命令和 CI fixture matrix。
- 数据库、REST API、frontend UI、云服务和后台 daemon 均明确排除在 MVP 之外，避免 implementation agent 扩大范围。
- `_speclite`、IDE skill mirrors 和 `_speclite-output` 的边界已在决策、patterns 和 project structure 三处交叉确认。

### Architecture Completeness Checklist（架构完整性检查清单）

**Requirements Analysis（需求分析）**

- [x] 已充分分析项目上下文
- [x] 已评估规模与复杂度
- [x] 已识别技术约束
- [x] 已映射横切关注点

**Architectural Decisions（架构决策）**

- [x] 关键决策已记录版本信息
- [x] 技术栈已完整说明
- [x] 集成模式已定义
- [x] 性能考量已覆盖

**Implementation Patterns（实现模式）**

- [x] 命名约定已建立
- [x] 结构模式已定义
- [x] 通信模式已说明
- [x] 流程模式已记录

**Project Structure（项目结构）**

- [x] 完整目录结构已定义
- [x] 组件边界已建立
- [x] 集成点已映射
- [x] 需求到结构的映射已完成

### Architecture Readiness Assessment（架构就绪评估）

**Overall Status（整体状态）：** 可以进入实现

**Confidence Level（信心等级）：** 高

**Key Strengths（关键优势）：**

- 架构围绕 installer/control plane 的真实复杂度展开，而不是把 SpecLite 降级为文件复制器。
- runtime/control/artifact 三层边界清晰。
- 文件所有权、hash update protection 和 deterministic validation 被放在 MVP 核心位置。
- FR/NFR 与目录结构有明确映射。
- AI agent 一致性规则足够具体，能减少实现分歧。

**Areas for Future Enhancement（未来增强方向）：**

- 为 source descriptor、validation issue taxonomy 和 manifest/index schema 分别补充 ADR。
- 在 implementation 阶段补充 fixture expected outputs。
- Post-MVP 再扩展完整 JSON output、doctor/sync/uninstall 和迁移指南。
- 若企业采用要求更高，可追加 Node 22/24 之外的运行时兼容策略评估，但必须以 fixture coverage 为前提。

### Implementation Handoff（实现交接）

**AI Agent Guidelines（AI Agent 指南）：**

- 严格遵循本文档中的架构决策，不自行引入数据库、服务端、UI 或后台 daemon。
- 所有路径、manifest、index 和 validation output 使用 project-relative POSIX-style paths。
- 通过 `src/config/` 复用 config/customization merge logic，不在 adapter 或 skill helper 中实现第二套规则。
- 任何 install/update/validate/source/IDE adapter 行为变化必须同步 fixture assertions。
- Human-owned custom files 和 workflow artifacts 默认保护，不得静默覆盖。
- Node 22 minimum + Node 24 recommended 的兼容声明必须由 fixture install/status/validate/update/resolve 覆盖支撑。

**First Implementation Priority（第一实现优先级）：**
创建 TypeScript CLI skeleton，并立即修正 starter 初始化命令：

- `engines.node` 应表达 Node 22 minimum 和 Node 24 recommended 的策略。
- CI/fixture matrix 必须覆盖 Node 22 和 Node 24。
- 不得使用 Node 24-only API，除非提供 Node 22 兼容路径或调整 runtime policy。
- 第一批代码应优先建立 `src/bin/`、`src/commands/`、`src/fs/`、`src/diagnostics/` 和测试骨架。
