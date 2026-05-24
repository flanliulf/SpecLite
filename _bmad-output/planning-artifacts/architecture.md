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
- Post-MVP Governance & Expansion（Post-MVP 治理与扩展）：预留 init/list/doctor/sync/uninstall、CI/企业自动化集成增强和流程覆盖报告。

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
- Integration Complexity（集成复杂度）：高，需适配多个 AI IDE、共享 target directory 和未来平台差异；command pointer artifact 保持 Post-MVP。
- Data Complexity（数据复杂度）：中等，主要是 TOML/YAML/CSV/Markdown/JSON 文件契约、manifest/hash 和 artifact metadata。
- User Interaction Complexity（用户交互复杂度）：中高，CLI 需要同时支持交互式和脚本化使用，并提供清晰诊断。

### Technical Constraints & Dependencies（技术约束与依赖）

SpecLite 的关键技术约束包括：

- MVP 必须以 Node.js 为 installer/control plane 主轴；现有 Python resolver 可作为参考或兼容背景，但不应成为主控制面依赖。
- TOML 继续作为 config/customization 的外部契约；installer-owned TOML 可生成，human-owned TOML 默认应只读或保守更新。
- 系统必须 local-first、offline-capable，不依赖数据库、云服务或后台守护进程。
- `_speclite` 是 metadata/control hub，不是 skill execution directory。
- `.claude/skills`、`.agents/skills` 是 MVP 硬交付 IDE execution plane；GitHub Copilot/Cursor 可通过 `.agents/skills` 兼容路径使用，专用 command pointer 或专有 adapter 属于 Post-MVP。
- `_speclite-output` 和配置指定的 `docs` 是 workflow artifact / project knowledge plane。
- manifest/index 是 discovery、routing、phase topology、minimum phase coverage matrix、integrity 和 validation 的统一入口；覆盖率百分比、趋势、团队汇总和治理 dashboard 属于 Post-MVP 流程覆盖报告。
- 安装来源必须显式记录 source/channel/version、integrity evidence 和 trust status。
- 文件路径、hash、manifest 和 validate report 必须跨平台稳定。
- 已删除或非正式分发的辅助来源不得进入 installer scope、IDE mirrors 或 manifest。

### Cross-Cutting Concerns Identified（已识别的横切关注点）

- File Ownership Model（文件所有权模型）：installer-owned、human-owned、workflow-owned 文件边界贯穿 install、update、validate 和 docs。
- Deterministic Validation（确定性验证）：manifest/schema、IDE mirror、runtime path、menu target、legacy namespace residue、artifact path 和 file integrity 都需要稳定 issue model。
- Cross-IDE Consistency（跨 IDE 一致性）：同一 canonical skill 在不同 IDE target 中必须内容一致。MVP 平台差异限制在 adapter target directory 与 metadata 映射；command pointer artifact 保持 Post-MVP。
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
npm pkg set engines.node='>=22'

npm install commander@14.0.3 yaml@2.9.0 toml@4.1.1 csv-parse@6.2.1 fs-extra@11.3.5 zod@4.4.3
npm install --save-dev typescript@6.0.3 tsx@4.21.0 tsup@8.5.1 vitest@4.1.6 @types/node@22
```

**Architectural Decisions Provided by Starter（Starter 提供的架构决策）：**

**Language & Runtime（语言与运行时）：**
基于 Node.js 的 TypeScript，采用 ESM package structure，并在 starter 初始命令中显式设置 Node 22 minimum；Node 24 是推荐运行时，需要通过 fixture matrix 覆盖兼容性。`@types/node` 使用 Node 22 类型基线，避免实现中误用 Node 24-only API。

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
- `src/installer/`: Install Flow（安装流程）、Progress Events（进度事件）与 Ready Summary（就绪摘要）编排；不拥有 source、manifest、IDE adapter 或 validation 领域规则。
- `src/source/`: Source/Channel Resolution（来源/渠道解析）与 Source Discovery（来源发现）。
- `assets/source/speclite/`: Bundled Source Assets（内置源资产），存放随产品发布的 SpecLite source definitions；不得与 `src/source/` resolver 代码混放。
- `src/modules/`: Module Metadata Parsing（模块元数据解析）与 Module Selection（模块选择）。
- `src/config/`: Config Resolver（配置解析器）与 Customization Resolver（定制化解析器）。
- `src/manifest/`: Manifest Generation（清单生成）与 skill/help/files index generation（索引生成）。
- `src/ide/`: Data-Driven IDE Adapter Registry（数据驱动 IDE 适配器注册表）。
- `src/validation/`: Deterministic Validation Rules（确定性验证规则）与 Issue Model（问题模型）。
- `src/diagnostics/`: CommandResult schema anchor、JSON/human reporters、diagnostic ordering 与 output rendering。
- `src/update/`: Ownership Manifest（所有权清单）、Hash Comparison（哈希比较）与 Update Protection（更新保护）。
- `src/fs/`: Path Normalization（路径规范化）、Project-Relative POSIX Paths（项目相对 POSIX 路径）与 Safe Writes（安全写入）。
- `test/fixtures/`: fixture projects 与 expected outputs；baseline case 集合以 fixture contract 为准。

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
- Validation Model（验证模型）：`status`、`validate`、MVP JSON output 和 fixture assertions 共享 deterministic issue model。
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
- CI/企业自动化对 JSON output 的深度集成：MVP 提供核心命令 `--json` 契约，Post-MVP 扩展自动化工作流和新增命令覆盖。

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
承载 schema 的文件必须包含 schema version。Manifest/index 字段、版本、target id、排序、hash 和 ownership 投影由 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md` 作为 canonical contract 管理；source trust/evidence 语义由 `_bmad-output/planning-artifacts/specs/source-descriptor-contract.md` 管理；install/update pre-write planning、external access、`--yes`、dry-run 与 write authorization 语义由 `_bmad-output/planning-artifacts/specs/install-plan-contract.md` 管理；validation issue category、issue id 边界和默认 severity 指引由 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md` 管理。未来不兼容变更应产生 `manifest-schema.migration-needed` diagnostics，而不是静默重写。

**Caching Strategy（缓存策略）：**
MVP 不使用持久 database cache。使用 manifest/hash baselines 优化 update 与 validation。

### Authentication & Security（认证与安全）

**Decision（决策）：** MVP 不实现用户认证系统。安全重点放在 local source trust、file ownership 和 safe writes。

**Rationale（理由）：**
SpecLite 在 MVP 中不托管用户账号或远程服务。真正的安全面是本地供应链和文件变更安全。

**Security Decisions（安全决策）：**

- Install plans 必须在执行前声明 external source access。
- Source descriptors 记录 source type、channel、version、integrity evidence 和 trust status。
- Source staging、临时解包目录、package-manager cache path 和临时 Git checkout path 是 private implementation state；不得进入 public JSON、manifest/index、files index、fixture snapshot 或 `ValidationIssue.details`，受控成功/失败只做 best-effort cleanup。
- Source resolution 与 install planning 分两阶段执行：`SourceResolutionPlan` 先声明 external access intent，`InstallPlan` 再记录 resolved source descriptor、target adapter plan、planned writes、confirmation state 和 write authorization。
- `--yes` 或交互确认只表示 command-level write authorization，不表示接受 unverified source、floating Git、unsupported source、failed evidence verification 或 source policy rejection。
- 显式 `--dry-run` 只产生 plan、不写文件、`writeAuthorized: false`；未显式 dry-run 但确认未完成或脚本模式缺少 `--yes` 时也保持 unapplied plan，不得把真实 planned action 改写成 `skip:not-authorized`。
- Human-owned custom files 与 workflow-owned artifacts 永不被静默覆盖。
- MVP 默认不修改 `_speclite/custom/*.toml` 或 `_speclite/custom/*.user.toml`；Architecture 中的“保守更新”只表示读取、保护和诊断，未来写入必须通过显式命令或交互确认并记录 ADR。
- Fresh install 可以 create-if-absent 方式创建 human-owned TOML stub；如果目标文件已存在，install/update/repair 不得覆盖、重写、重排或格式化。
- Installer-owned drift 虽发生在 installer-owned areas，也不得被 `validate` 或普通 `update` 静默覆盖；`update` 默认产生 conflict，MVP 通过 `speclite update --repair` 或用户确认恢复，不新增顶级 `speclite repair` 命令，`speclite sync` 保持 Post-MVP。
- Install/update/repair 写入前必须获取 `_speclite/.lock` project operation lock；拿不到锁时不得写入，并产生 `operation-lock.project-locked` command-level issue，且不得把该问题放入 `data.conflicts`。Lock file shape 为 `schemaVersion`、`operation`、`pid?`、`createdAt` 和 `projectRootHash`；lock file 是 volatile control file，不进入 files index，也不参与 stable files-index hash；`createdAt` 不进入 stable fixture snapshot，stale-lock 测试使用注入或规范化 fixture clock；`pid` 只是 best-effort hint，不是唯一 stale 判定；`projectRootHash` 只用于 lock ownership hint，不作为跨 checkout 稳定 public value。
- Installer-owned files 仅在 ownership 与 hash checks 后更新。
- 所有 public report paths 必须使用 project-relative POSIX-style paths；只有项目外诊断可使用明确标记的 redacted absolute path。
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
`resolve` 的 stdout 必须只输出解析结果 JSON；stderr 以 JSON Lines 输出 `ValidationIssue` 形状的 diagnostics；退出码表达成功或失败。
`resolve` 解析成功但存在 warning diagnostics 时返回 exit code 0；只有 error 或 critical diagnostics 返回非 0。
`resolve` 的产品 JSON 输出应使用 2 空格缩进、末尾换行，并保留非 ASCII 字符不转义；parity fixtures 比较 JSON 语义，不要求 byte-for-byte 文本一致。
`resolve --key` 请求不存在的 dotted key 时，默认输出 `{}`、退出码为 0、stderr 为空；严格缺失校验只能通过未来显式 flag 引入。
`resolve` 必须支持重复 `--key`，输出对象以原 dotted key 字符串作为字段名，缺失 key 省略。
`resolve config` 必须要求显式 `--project-root`。`resolve customization` 必须支持显式 `--project-root`；未传时为 Python parity 保留 fallback：先从 skill directory 向上查找 `_speclite` 或 `.git`，找不到再从 cwd 向上查找；installed skill instructions 应优先显式传 `--project-root`。
`resolve` 必须区分 required 与 optional TOML layers：required layer 读取或解析失败返回 failure；optional layer 读取或解析失败时继续解析，并向 stderr 输出 `ValidationIssue` 形状的 warning JSON diagnostic。
`resolve` 的数组合并必须保持 Python parity：只有当所有元素都是 table 且共享同一个 `code` 或同一个 `id` 时才 keyed merge；命中同 key 时 override item 整项替换 base item，不做 item-level deep merge；混用 `code`/`id`、部分元素缺 key 或包含非 table 元素时 append。
`resolve` 的 MVP 合并模型不提供删除机制；不得通过 `null`、`enabled=false`、`remove` 列表或其他特殊字段隐式删除 base items。
`resolve config` 的合并顺序必须保持 Python parity：`_speclite/config.toml` → `_speclite/config.user.toml` → `_speclite/custom/config.toml` → `_speclite/custom/config.user.toml`，后者覆盖前者。
`resolve customization` 的合并顺序必须保持 Python 实际代码行为：skill `customize.toml` → `_speclite/custom/{skill}.toml` → `_speclite/custom/{skill}.user.toml`，后者覆盖前者。
`resolve customization --skill` 使用 skill directory basename 作为 customization lookup key；IDE adapters 不得重命名 canonical skill directory，除非未来 manifest 明确记录 customization key 且 resolver 支持该 key。

**Communication Contracts（通信契约）：**

- Installer-to-project：source tree 写入 `_speclite`、IDE mirrors、manifest/index 和 output directories。
- IDE-to-skill：`.claude/skills/*` 和 `.agents/skills/*` 加载 self-contained skill packages；支持 `.agents/skills` 的 GitHub Copilot/Cursor 复用该通用路径，不需要 MVP 专用 adapter。
- Skill-to-runtime：skills 通过 `_speclite` 解析 project config/customization。
- Workflow-to-artifact：workflows 写入已配置的 artifact locations。
- Validator-to-user：findings 使用稳定的 issue id、category、severity、affected path、impact 和 suggested next step。

**Error Handling Standard（错误处理标准）：**
所有失败在内部返回 structured diagnostic objects，再渲染为 human-readable CLI output 或 `--json` output。MVP JSON output 必须复用同一 issue model。Human-readable output 可以更丰富，但不得承载 structured JSON 或 file contract 中不存在的自动化依赖；progress events/spinner output 不是 MVP automation API。

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
- 面向用户的 issue category 使用稳定 lower-kebab category：`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。
- 每个 MVP issue category 必须使用 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md` 中预留的最小 issue id baseline；实现不得发明自由文本 issue id。`manifest-schema.migration-needed` 的 details 至少包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind` 和 `manualActionRequired`。

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
- `src/installer/`: install flow、progress events 和 ready summary 编排。
- `src/source/`: source/channel descriptor 与 canonical source discovery。
- `assets/source/speclite/`: 产品内置 SpecLite source definitions；由 `src/source/` 的 resolver 读取并归一为 canonical source tree。
- `src/modules/`: module metadata 解析与 module selection。
- `src/config/`: config 与 customization resolver。
- `src/manifest/`: manifest、skill/help/files index 生成。
- `src/ide/`: data-driven IDE adapter registry 与 target writers。
- `src/validation/`: validation rules 与共享 issue model。
- `src/diagnostics/`: command result schema、reporters、diagnostic sorting 与 output rendering。
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
MVP 无 REST API。API 边界是 CLI commands 与 file contracts；Public JSON 的字段 schema、排序、路径、timestamp、schema evolution、fixture comparison policy 和 executable schema anchor 由 `_bmad-output/planning-artifacts/specs/command-result-json-contract.md` 作为 canonical contract 管理。本节只描述实现映射和模块责任，不复制字段真源。

CommandResult 中引用的领域对象不得在 Architecture 中重新定义语义：`SourceDescriptor` 以 `_bmad-output/planning-artifacts/specs/source-descriptor-contract.md` 为 trust/evidence 真源；install/update plan-before-write、external access、dry-run、`--yes`、operation lock、safe write 和 `writeAuthorized` 以 `_bmad-output/planning-artifacts/specs/install-plan-contract.md` 为真源；manifest/index 投影以 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md` 为真源；validation issue taxonomy 以 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md` 为真源。

实现映射如下：

- `src/commands/` 负责参数解析、命令模式归一和 orchestration，不直接定义 public JSON 字段或深层领域规则。
- `src/diagnostics/command-result-schema.ts` 是 CommandResult executable contract anchor；JSON reporter、fixture assertions 和 contract tests 必须复用该 module。
- `src/diagnostics/command-result.ts` 与 reporter/output 模块负责把领域结果投影为 CommandResult、human-readable output 和 exit code。
- `src/source/`、`src/installer/`、`src/update/`、`src/manifest/`、`src/ide/` 和 `src/validation/` 只产出各自领域结果；public projection 和排序规则由 owning SPEC 约束。
- `speclite resolve` 是 runtime support command，不包裹 CommandResult；stdout/stderr、merge order、fallback 和 parity fixture 行为以 `_bmad-output/planning-artifacts/specs/resolve-command-contract.md` 为准。

CommandResult 行为在实现中的关键边界是：

- `status` 与 `validate` 分工清晰：`status` 保持 lightweight local-only summary；详细 issue set、issue counts 和 validation coverage 由 `validate` 提供。
- `update` 与 `update --repair` 必须保留 planned effects、actual apply results 和 conflicts 的分离；写入授权、dry-run、operation lock、safe write 和 partial failure 行为由 install plan contract 约束。
- JSON reporter 只投影已契约化字段；automation 依赖必须进入 command-specific `data`，不得依赖 human-readable summary。
- 任何改变 public JSON 行为的实现变更，必须同一变更内同步更新 owning SPEC、`src/diagnostics/command-result-schema.ts` 和 fixture expected outputs。

**Data Exchange Formats（数据交换格式）：**

- manifest、index、validation output 和 `CommandResult` JSON payload 中的路径使用 project-relative POSIX-style path。
- `CommandResult.schemaVersion` 是真实兼容性边界；`speclite.command-result.v1` 只允许向后兼容扩展，breaking changes 必须升级 schema version。
- `CommandResult.command` 必须使用稳定 command id：`install`、`status`、`validate`、`update` 或 `update.repair`；不得使用 raw argv、shell command string、命令别名或带 flags 的字符串。
- public `CommandResult` JSON 默认不得包含 timestamp；只有 schema 明确声明的 manifest/generated metadata 字段可以使用 ISO 8601 string，且不得进入 stable fixture snapshot comparison。
- JSON fields 使用 camelCase。
- YAML manifest fields 默认使用 camelCase，除非匹配既有外部契约。
- CSV headers 必须显式定义，并由所属 manifest/schema version 管理。
- 仅当“缺失”和“空值”语义不同的时候使用 `null`。

Manifest/index 文件契约必须引用 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md`，不得在 Architecture type snippet 中复制字段真源。Validation issue taxonomy 必须引用 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md`，不得由单个 validation rule 自行定义 category 语义。

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

- `status` 读取轻量 installed state，只从本地 manifest/source descriptor/IDE target summary/high-level health 推导结果。
- `validate` 执行完整检查。
- `update` 写入前必须构建 explicit update plan。
- `install` 必须检测 existing install，禁止静默覆盖。

### Process Patterns（流程模式）

**Error Handling Patterns（错误处理模式）：**
所有 validation 与 command error 使用同一 issue model。`ValidationIssue` JSON shape 由 `_bmad-output/planning-artifacts/specs/command-result-json-contract.md` 管理；category、issue id、default severity 和 fixture ownership 由 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md` 管理。Architecture 只规定错误处理模块边界，不复制字段真源。

规则：

- 不向用户直接抛出 raw parser error；文件系统、parser 和 adapter error 必须包装为 diagnostic issue。
- 不暴露无关 absolute local path、环境变量值、认证信息、credential-bearing URL、cache path 或临时解包路径。
- `status` 是 lightweight local-only summary；详细 diagnostics、issue counts 和 validation coverage 留给 `validate`。
- `validate` 是 local-only deterministic validation；需要远程 freshness check 或 provenance revalidation 的流程只能放在显式 `update`、安装来源解析或 Post-MVP `doctor` 中。
- IDE mirror drift、source-integrity、file-integrity、operation-lock 和 update conflicts 必须使用 taxonomy 中的稳定 category/issue id；`validate` 只报告，不修复。
- Human-readable output、`--json` output、exit code 和 fixture assertions 必须共享同一 CommandResult status 推导逻辑。
- Write-capable command 出现 project operation lock blocker 时不得写入，也不得输出 plan/conflict payload 假装规划完成；stale lock 在 `validate` 中可作为 warning 呈现。
- Command-specific automation fields 必须进入契约化 `data` payload；不得把 CI 依赖字段只放在 `summary` 或非契约化对象里。
- `targetProject`、public path fields、issue ordering、nextActions ordering 和 JSON summary rendering 由 diagnostics/output 层统一处理；命令、validator、update 和 IDE adapter 不得各自拼接 public report path 或自行定义排序。

**Loading State Patterns（加载状态模式）：**
长操作 CLI 命令输出有序 progress events。Progress label 必须与上面的 installer step names 一致。只有 required steps 全部通过后才能展示 ready summary。

### Enforcement Guidelines（执行与约束指南）

**All AI Agents MUST（所有 AI Agent 必须）：**

- 在生成 manifest、index 和 report 时使用 project-relative POSIX-style paths。
- 保持 `_speclite` 为 metadata/control hub，IDE skill directories 为 execution plane，`_speclite-output` 为 artifact repository。
- 对 `status`、`validate`、update conflicts 和 MVP JSON output 使用共享 validation issue model。
- 默认保护 human-owned custom files 与 workflow artifacts。
- 修改 install、update、validation、source 或 IDE adapter 行为时，同步新增或更新 fixture assertions。
- 将 config/customization merge logic 集中放在 `src/config/`。

**Pattern Enforcement（模式约束）：**

- Unit tests 验证 schema 命名、merge behavior 和 path normalization。
- Fixture tests 验证 generated file trees、manifest/index snapshots、update protection 和 validation output。
- Validator rules 使用稳定 issue id 报告 pattern violations；动态上下文不得拼入 issue id。
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
│   │       └── agents-directory.ts
│   ├── validation/
│   │   ├── issue-model.ts
│   │   ├── validate-project.ts
│   │   ├── rules/
│   │   │   ├── manifest-schema.ts
│   │   │   ├── source-integrity.ts
│   │   │   ├── ide-mirror.ts
│   │   │   ├── runtime-path.ts
│   │   │   ├── menu-target.ts
│   │   │   ├── legacy-namespace.ts
│   │   │   ├── artifact-path.ts
│   │   │   ├── file-integrity.ts
│   │   │   └── operation-lock.ts
│   │   └── reporters/
│   │       ├── human-reporter.ts
│   │       └── json-reporter.ts
│   ├── update/
│   │   ├── ownership-model.ts
│   │   ├── update-plan.ts
│   │   ├── conflict-detector.ts
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
│   │   ├── command-result-schema.ts
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
│   │   ├── update.test.ts
│   │   └── resolve.test.ts
│   └── fixtures/
│       ├── fresh-install-empty-project/
│       ├── existing-install-update/
│       ├── ide-drift/
│       ├── source-integrity/
│       ├── resolve-parity/
│       ├── skill-artifact-loop/
│       └── path-portability/
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

- `source/` 只负责把 npm/private registry/tarball/offline bundle/Git source 归一为 Canonical Source Tree（规范来源树）与 Source Descriptor（来源描述符）；trust/evidence 语义以 `_bmad-output/planning-artifacts/specs/source-descriptor-contract.md` 为准。
- `assets/source/speclite/` 是 bundled source assets（内置源资产）边界，存放产品随包发布的 SpecLite source definitions；它由 `src/source/` 读取，但不属于 resolver 代码。
- `modules/` 只负责读取 Module Metadata（模块元数据）、选择模块、创建 Declarative Directories（声明式目录）。
- `config/` 是唯一 Config/Customization Merge Implementation（配置/定制化合并实现）所在位置。
- `manifest/` 是唯一 Manifest/Index/Hash Generation（清单/索引/哈希生成）位置；字段契约以 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md` 为准。
- `ide/` 只处理 Platform Adapter（平台适配器）、Target Directory（目标目录）、adapter metadata、canonical target order 和 Mirror Validation（镜像验证）。Adapter registry 字段、target id、target order、capability 和 status 语义以 `_bmad-output/planning-artifacts/specs/ide-adapter-registry-contract.md` 为准。MVP adapter schema 可保留 command pointer 扩展位，但不得生成 Command Pointer（命令指针）artifact。
- `validation/` 只读取 State（状态）并产生 Issues（问题），不直接修复。
- `update/` 只基于 Ownership/Hash（所有权/哈希）生成并执行 Update Plan（更新计划）；遇到 installer-owned drift 默认生成 conflict，除非 `speclite update --repair` 或用户确认。`update --repair` 可恢复 IDE mirrors、manifest/index 和 runtime scripts，但不得覆盖 human-owned custom 或 workflow-owned artifacts。repair 写入前必须生成 repair plan，列出 affected paths、ownership、current hash、expected hash 和 action；交互模式确认后写入，脚本模式需要 `--yes`。普通 dry-run、交互确认前或脚本模式缺少 `--yes` 时仍输出真实 unapplied plan，不得把 planned action 改写为 `skip:not-authorized`。`restore-canonical` 必须有 resolved canonical source 或 installed canonical package baseline；缺少 source evidence 时进入 conflict，reason 为 `missing-source-evidence`。MVP 输出 impact summary、changed/skipped/conflict paths 和 machine-readable plan，但不生成 standalone report artifact；`sync`、顶级 `repair`、backup/restore 和 richer update reports 不进入 MVP。
- `installer/` 编排 Install Flow（安装流程），但不拥有各领域规则；pre-write install plan、external access、dry-run、`--yes` 和 write authorization 语义以 `_bmad-output/planning-artifacts/specs/install-plan-contract.md` 为准。实现必须保持 `SourceResolutionPlan -> InstallPlan -> write/apply -> CommandResult projection` 顺序。
- `fs/` 是唯一允许实现 Path Normalization（路径规范化）、Safe Writes（安全写入）和跨平台文件操作的模块。Installer-owned 写入必须 temp-write + rename；`changedPaths` 只记录当前命令实际完成的 mutation。Safe-write temporary files 不进入 files index；`validate` 可将不阻断 safe write 的 stale temp files 报告为 `file-integrity.stale-temp-file` warning，如果 stale temp file 阻断 safe-write target naming、rename 或 safe mutation 则必须报告为 error；MVP update/repair 不自动清理 lock 或 stale temp files。`fs/` 还负责阻断 symlink escape、path escape、case conflict 和 unsafe overwrite。

**Service Boundaries（服务边界）：**
MVP 无网络服务。内部 service boundary 通过 TypeScript module API 和 file contract 体现。跨模块通信必须使用明确数据结构，例如 `SourceDescriptor`、`InstallPlan`、`Manifest`、`ValidationIssue`、`UpdatePlan`。

**Data Boundaries（数据边界）：**

- `_speclite/`: metadata/control hub。
- `assets/source/speclite/`: product-shipped bundled source assets。
- `.claude/skills/`、`.agents/skills/`: MVP IDE execution plane；target id 分别为 `claude` 与 `agents`。Copilot/Cursor 专用 command pointer 或 adapter 是 Post-MVP，MVP 中不得伪造 `copilot` 或 `cursor` target id。
- `_speclite-output/`: workflow artifact repository。
- `docs/`: project knowledge。
- `test/fixtures/`: acceptance and regression assets。

### Requirements to Structure Mapping（需求到结构的映射）

**Feature/FR Mapping（功能/FR 映射）：**

- FR1-FR17 安装与项目接入 → `src/commands/install.ts`、`src/installer/`、`src/source/`、`src/modules/`、`src/ide/`、`src/manifest/`。
- FR18-FR24 方法论发现与执行 → `src/manifest/help-index.ts`、`src/ide/adapter-registry.ts`、`src/ide/target-writer.ts`、fixture `skill-artifact-loop/`；FR24 只要求 MVP 最小阶段覆盖矩阵，不要求覆盖率报告或治理 dashboard；矩阵字段契约以 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md` 为准，adapter registry 契约以 `_bmad-output/planning-artifacts/specs/ide-adapter-registry-contract.md` 为准。
- FR25-FR35、FR28a、FR35a-1 与 FR35a-FR35d 状态、验证与 JSON 输出 → `src/commands/status.ts`、`src/commands/validate.ts`、`src/validation/`、`src/diagnostics/`、`src/diagnostics/command-result.ts`、`src/diagnostics/command-result-schema.ts`。
- FR36-FR41 与 FR41a-FR41e 更新与文件所有权保护 → `src/commands/update.ts`、`src/update/`、`src/manifest/files-index.ts`、`_bmad-output/planning-artifacts/specs/install-plan-contract.md`。
- FR42-FR52k 配置与定制化 → `src/config/` 与 `src/commands/resolve.ts`；FR51a 要求 MVP 默认只读并保护 human-owned TOML；resolve 行为契约以 `_bmad-output/planning-artifacts/specs/resolve-command-contract.md` 为准。
- FR53-FR59 分发来源与渠道 → `src/source/`。
- FR60-FR65 安装反馈与就绪状态 → `src/installer/progress-events.ts`、`src/installer/ready-summary.ts`、`src/diagnostics/output.ts`。
- FR66-FR71 维护者工作流与示例 → `test/fixtures/`、`fixtures/expected/`、`docs/`。Fixture expected outputs 是契约测试资产，不是普通示例；fixture layout、expected output classes、comparison policy 和 release gate 分类以 `_bmad-output/planning-artifacts/specs/fixture-contract.md` 为准。
- FR72-FR78 Post-MVP 治理与扩展 → 在 `commands/`、`validation/reporters/`、`ide/adapters/` 中复用 MVP JSON schema 与 module boundaries。

**Cross-Cutting Concerns（横切关注点）：**

- 路径规范化 → `src/fs/path-normalizer.ts`，所有模块调用它，不自行拼接 report path。
- Issue model → `src/validation/issue-model.ts` 与 `src/diagnostics/command-result.ts`。
- Producer/consumer JSON schema → `src/diagnostics/command-result-schema.ts`。
- 文件所有权 → `src/update/ownership-model.ts`。
- Hash integrity → `src/manifest/hash.ts` 与 `src/manifest/files-index.ts`。
- Node 运行时支持 → CI workflow 和 Node 22/Node 24 fixture matrix。
- Legacy namespace residue → `src/validation/rules/legacy-namespace.ts`。

### Integration Points（集成点）

**Internal Communication（内部通信）：**

- CLI command → installer/update/validation/resolve orchestration。
- Resolve command → config/customization resolver → stable JSON output for installed skills；failures emit `ValidationIssue`-shaped JSON Lines diagnostics to stderr；stdout/stderr、merge order、fallback 和 parity fixture rules 以 `_bmad-output/planning-artifacts/specs/resolve-command-contract.md` 为准。
- Installer → source resolver → module manager → manifest generator → IDE target writer → validation。
- Update → files index/hash → conflict detector → update/repair plan → safe write。MVP 输出 impact summary、changed/skipped/conflict paths 和 `--json` machine-readable plan；Backup/restore、standalone report artifact、历史对比和 richer update reports 是 Post-MVP 增强，不属于基础 hash-backed update protection。
- Status → manifest reader + source descriptor reader + IDE target summary + high-level health summary；no full hash scan, no remote source access, no implicit update check。
- Validate → all validation rules → human/json reporter。

**External Integrations（外部集成）：**

- npm public/private registry 通过 source resolver 接入。
- local tarball 与 offline bundle 通过 source resolver 接入。
- Git source 通过 source resolver 接入，但 MVP 只有解析到具体 commit SHA 的 pinned Git source 才能进入 install planning 和写入步骤。
- MVP AI IDE target directories 通过 `.claude/skills` 与 `.agents/skills` adapters 接入；GitHub Copilot/Cursor 专用 command pointer 或专有 adapter 保持 Post-MVP。
- CI 通过 npm scripts 和 fixture test commands 接入。

**Data Flow（数据流）：**

1. 用户命令创建 command context。
2. Source resolver 返回 canonical source descriptor。
3. Module manager 选择模块并声明 required directories。
4. Installer 写入 `_speclite`、IDE mirrors 和 `_speclite-output`。
5. Manifest generator 记录 installed state 与 file hashes。
6. Validator 读取 installed state 并输出 issues。
7. Update 在写入变更前使用 files manifest 与 ownership model。

**Manifest And Index Semantics（清单与索引语义）：**

- Source 侧以 `assets/source/speclite/` 下的 module metadata 与 source skill package 作为 canonical truth。
- Installed 侧以 manifest/index 作为 selected modules、source descriptor、IDE targets、phase coverage、installed files、ownership 和 hash 的投影。
- Help index 只能引用 `canonicalSkillId`、phase、entry label 和 activation target；不得定义第二套 skill identity、alias-only identity 或 IDE-specific skill identity。
- Canonical skill package hash 用于验证同一 canonical package 在不同 IDE targets 中内容一致；files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed paths、skipped paths 和 conflicts。
- File hash 基于 raw bytes 计算；line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation 维度，不得通过 hash normalisation 隐式吸收。Canonical source text files 固定 LF，installer 不得按平台改写 canonical text line endings；平台专用脚本必须作为独立 generated file 记录自己的 files index entry 和 raw-byte hash。Runtime scripts 与 generated scripts 必须在 files index 中记录 `executable`；Windows 不要求 POSIX chmod 语义，但该字段仍表示 POSIX executable intent。
- Tarball/offline bundle 的 `contentHash` 表示来源 artifact hash；若实现额外使用解包后的 canonical source tree hash 作为 expected installed-state 输入，必须基于 canonical source tree allowlist 计算，不得混用 cache/extraction directory hash、mtime 或平台 metadata。
- Adapter registry contract 拥有 canonical target order。MVP 顺序为 `claude`、`agents`；manifest generation、`CommandResult.data.ideTargets`、`validate.data.checkedTargets` 和 fixture snapshots 必须复用该顺序。Adapter status vocabulary、unsupported/failed 边界和 command pointer 扩展位以 `_bmad-output/planning-artifacts/specs/ide-adapter-registry-contract.md` 为准。
- Minimum phase coverage matrix 是 deterministic installed-state matrix，字段与排序遵守 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md`。
- Artifact contract 最少校验 artifact type、默认输出路径，以及 `workflowType`、`sourceSkill`、`generatedAt` metadata 值域；`workflowType` 必须是非空稳定字符串，`sourceSkill` 必须是非空 canonical skill id，`generatedAt` 若存在必须是 ISO 8601 string 且默认排除出 stable fixture snapshot comparison。内容质量、叙事完整度或人工评审结论不进入 MVP validation。
- Target status 必须分层使用：install planning 使用 `planned`、`unsupported`、`failed`；installed phase coverage 使用 `mapped`、`unsupported`、`failed`；status summary 使用 `not-configured`、`configured`、`partial`、`failed`。这些枚举不得跨层复用含义。用户显式选择的 target 若 unsupported 必须成为 blocking error；未选择或可选 target 的 unsupported 可作为 warning、info 或 known limitation。

**Source Descriptor Trust Semantics（来源描述符信任语义）：**

`SourceDescriptor` 与 `SourceIntegrityEvidence` 的字段和语义以 `_bmad-output/planning-artifacts/specs/source-descriptor-contract.md` 为 canonical contract；Architecture 只保留实现映射摘要。

- `SourceDescriptor.trustStatus === "trusted"` 在 MVP 中只表示该 source 通过 expected hash / lock match 验证；MVP 不提供通用 trusted source allowlist schema。
- `SourceDescriptor.trustStatus === "unverified"` 表示 source 可继续进入 install planning，但缺少可证明的信任锚；它只有在用户显式选择该 source、至少记录一种可复现 integrity evidence、且没有 hash mismatch / lock mismatch / unsupported source / source policy rejection 时才能进入写入规划。local tarball、offline bundle、Git source 和 local source 默认属于该状态。
- `SourceDescriptor.trustStatus === "blocked"` 表示 hash mismatch、lock mismatch、unsupported source 或 Post-MVP source policy 拒绝；installer 不得继续执行写入步骤，必须通过 `ValidationIssue` 和 `CommandResult.status` 报告失败。
- npm public/private registry source 不得因为来源类型本身自动成为 `trusted`；必须由 lock 或 hash 验证产生信任结论。

**Source Descriptor Integrity Semantics（来源描述符完整性语义）：**

- `SourceDescriptor.contentHash` 只对可整体内容寻址的 source artifact 强制，例如 local tarball、offline bundle 和 local source snapshot；registry 和 Git source 不应被迫伪造 content hash。
- `SourceDescriptor.integrityEvidence` 是 MVP 必填数组，所有进入写入步骤的 source 至少包含一项 evidence。
- MVP 可以消费 expected hash 或 lock match 作为 `trusted` 的信任锚，但不负责生成、刷新、轮转或批量迁移外部 source lockfile；完整 source lockfile 管理属于 Post-MVP。
- Local source snapshot hash 只覆盖 canonical source tree allowlist，排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。Tarball/offline bundle 至少记录包文件 artifact hash；解包后的 tree hash 可作为 expected installed state 输入，但不得与 artifact `contentHash` 混用。
- `SourceIntegrityEvidence.verified === false` 只表示 evidence 已记录且可复现，但未命中 expected hash 或 lock match；它不表示 verification failed。
- 当所有 integrity evidence 都是 `verified: false` 时，source descriptor 只能是 `trustStatus: "unverified"`，不能是 `trusted`。
- npm public/private registry source 必须记录 package name、version 与 `registry-integrity` 或 `version-lock` evidence。
- `SourceDescriptor.version` 表示 resolved installed source version；用户输入的 range、tag、dist-tag 或 branch 如需公开，必须使用 `requestedVersion` 或 internal plan 字段，不得覆盖 resolved `version`。
- `resolvedRoot` 进入 public JSON 时只能是 project-relative POSIX path 或 redacted/display-safe source label；不得暴露 npm cache、临时解压目录、本机 absolute path、home directory 或 drive letter。
- Git source 必须解析到 `git-commit` evidence；只记录 branch、tag 或 remote URL 不足以进入 install planning 或写入步骤，并必须产生 `source-integrity` issue。
- Private registry、proxy、Git remote、tarball 和 offline bundle source metadata 必须 redacted；credentials、tokens、credential-bearing URL、private query string 和本机 absolute source path 不得进入 public JSON 或 fixture snapshot。
- 缺少 integrity evidence、hash mismatch、lock mismatch 或 evidence 校验失败时，source resolver 必须产生 `source-integrity` error issue，将 `trustStatus` 置为 `blocked`，并让 install/update 停止写入。
- `source-integrity` 不得复用 `file-integrity` category；`source-integrity` 表示安装来源无法被安全解析或固定，`file-integrity` 表示已安装文件或 IDE mirror 与 manifest/hash baseline 不一致。
- MVP `validate` 不重新访问远程 source 来重新计算 `source-integrity`；它只检查 manifest 中记录的 source descriptor 与 integrity evidence 是否存在、形状是否有效、是否与本地安装状态一致。

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
- Fixture case directory 使用稳定 lower-kebab 命名，layout、expected output classes、comparison rules 和 release gate policy 以 `_bmad-output/planning-artifacts/specs/fixture-contract.md` 为准。
- MVP release gate fixtures 至少包括 `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity`、`resolve-parity` 和 `path-portability`；`skill-artifact-loop` 作为 regression asset，除非 release checklist 显式提升为 gate。Release gate fixtures 必须覆盖 Node 22 和 Node 24，并提供 macOS 与 Windows path-portability 证据。

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

Starter 模板评估中的初始化命令已同步为 `engines.node='>=22'` 和 Node 22 类型基线；“核心架构决策”继续要求 Node.js 22 LTS 为 minimum、Node.js 24 LTS 为 recommended，并通过 Node 22/24 测试矩阵覆盖兼容性。

**Pattern Consistency（模式一致性）：**
Implementation Patterns 支持核心架构决策。路径规范化、issue model、ownership model、config resolver、IDE adapter、fixture assertions 都被定义为共享规则，能够减少不同 AI agent 在命名、目录、错误格式、manifest 字段和更新行为上的分歧。

**Structure Alignment（结构对齐）：**
项目结构与架构边界一致。`src/source/`、`src/modules/`、`src/config/`、`src/manifest/`、`src/ide/`、`src/validation/`、`src/diagnostics/`、`src/update/`、`src/installer/`、`src/fs/` 的职责边界清楚，能够承载 PRD 中的 install/status/validate/update/resolve、source/channel、IDE mirror、manifest/index、文件所有权、diagnostic output 和 fixture 验证需求。

### Requirements Coverage Validation（需求覆盖验证）✅

**Epic/Feature Coverage（Epic/功能覆盖）：**
当前未加载独立 epics/stories，因此以 FR 分类验证。所有主要功能域都有明确架构承载位置：安装与 onboarding、方法论发现与执行、status/validate、update protection、config/customization、distribution source、readiness summary、maintainer fixture workflow 和 Post-MVP 扩展点均已映射到目录与组件。

**Functional Requirements Coverage（功能需求覆盖）：**
FR1-FR78、FR23a、FR28a、FR35a-1、FR35a-FR35d、FR41a-FR41f、FR51a-FR51b、FR52a-FR52k 及 FR71a-FR71c 均有架构支撑：

- FR1-FR17 → installer/source/modules/ide/manifest。
- FR18-FR24 → help index、IDE adapter、skill artifact fixture；FR24 的阶段覆盖矩阵由 manifest/help index/installed skill entries 本地生成和验证。
- FR25-FR35、FR28a、FR35a-1 与 FR35a-FR35d → status/validate、validation rules、diagnostics、human/json reporters。
- FR36-FR41 与 FR41a-FR41l → update、ownership model、files index/hash、update plan、repair plan、changed/skipped/conflict paths、operation lock、safe write 和 partial failure recovery；standalone report artifact 和 backup/restore 属于 Post-MVP。
- FR42-FR52k → config/customization resolver and `resolve` runtime support command。
- FR53-FR59 → source resolver/source descriptor。
- FR60-FR65 → progress events、ready summary、diagnostics output。
- FR66-FR71 → fixture projects、expected outputs、docs。
- FR72-FR78 → Post-MVP 命令与 reporter 扩展边界；FR78 的流程覆盖报告在 MVP 最小阶段覆盖矩阵和 validate output 之上扩展覆盖率、趋势、导出和团队/多项目治理视图。

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

- Starter 初始化命令已跟随最终 runtime 决策修正为 `engines.node='>=22'` 和 Node 22 类型基线；实现 story 仍必须覆盖 Node 22/24 fixture matrix。
- JSON reporter 已进入 MVP 必交付边界；实现时应保持 `CommandResult` envelope 与 `ValidationIssue` issue model 稳定，并避免把 Post-MVP 命令面一起提前。
- Git source/private registry/offline bundle 的 source resolver 边界、MVP trust status 语义和 validate no-network boundary 已定义；其中 Git source 在 MVP 中必须固定到 commit SHA 后才可写入，`trusted` 只由 expected hash / lock match 产生。MVP 只消费最小 integrity evidence，不生成或轮转外部 source lockfile；更细的 source lockfile 生命周期管理、企业 source policy、allowlist、签名验证或 provenance 检查仍保持 Post-MVP。

**Nice-to-Have Gaps（可选增强缺口）：**

- Source descriptor schema 已在 `_bmad-output/planning-artifacts/specs/source-descriptor-contract.md` 和 `_bmad-output/planning-artifacts/adr/0004-source-descriptor-trust-model.md` 中固化；后续 ADR 只记录供应链策略取舍，不重新定义字段真源。
- Manifest/index contract 已在 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md` 和 `_bmad-output/planning-artifacts/adr/0005-manifest-index-contract-boundary.md` 中固化；后续 ADR 只记录取舍，不重新定义字段真源。
- Validation issue taxonomy 已在 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md` 和 `_bmad-output/planning-artifacts/adr/0006-validation-issue-taxonomy-boundary.md` 中固化；后续 ADR 只记录取舍，不重新定义 category 语义。
- 可在后续文档中补充 fixture expected output 示例，但 fixture expected outputs 本身是契约测试资产。

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

- Source descriptor、manifest/index schema 与 validation issue taxonomy 已有 SPEC 与 ADR；后续 ADR 只补供应链治理、迁移或平台扩展取舍。
- 在 implementation 阶段补充 fixture expected outputs，目录命名遵守 `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity`、`resolve-parity`、`skill-artifact-loop` 和 `path-portability` baseline。
- Post-MVP 再扩展 JSON output 的 CI/企业集成、doctor/sync/uninstall 和迁移指南。
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
实现 agent 的契约阅读顺序必须先看 `_bmad-output/planning-artifacts/specs/README.md`，再按其中顺序阅读各 owning SPEC，然后再读 PRD 与 Architecture 摘要。创建 TypeScript CLI skeleton 后，必须优先落地 `src/diagnostics/command-result-schema.ts` executable contract anchor、producer/consumer contract tests 和最小 fixture expected outputs，再实现 JSON reporter。随后立即修正 starter 初始化命令：

- `engines.node` 应表达 Node 22 minimum 和 Node 24 recommended 的策略。
- CI/fixture matrix 必须覆盖 Node 22 和 Node 24。
- 不得使用 Node 24-only API，除非提供 Node 22 兼容路径或调整 runtime policy。
- 第一批代码应优先建立 `src/bin/`、`src/commands/`、`src/fs/`、`src/diagnostics/` 和测试骨架。
