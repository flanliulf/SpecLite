# Starter Template Evaluation（Starter 模板评估）

## Primary Technology Domain（主要技术领域）

SpecLite 的主技术域是 CLI tool / local installer control plane。基于 PRD 与技术研究，MVP 基础应采用 Node.js + TypeScript，用于实现安装器、配置解析、manifest/index 生成、IDE adapter、status/validate/update 和 fixture validation。

## Starter Options Considered（已评估的 Starter 选项）

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

## Selected Starter（选定 Starter）：Custom TypeScript Node CLI Starter（自定义 TypeScript Node CLI Starter）

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
