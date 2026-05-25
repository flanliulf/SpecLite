# Implementation Patterns & Consistency Rules（实现模式与一致性规则）

## Pattern Categories Defined（已定义的模式类别）

**Critical Conflict Points Identified（已识别的关键冲突点）：**
已识别 11 类容易造成 AI agent 实现不一致的冲突点：命令命名、文件命名、路径规范化、manifest 字段、配置合并行为、source descriptor、IDE adapter 输出、validation issue 格式、update ownership 状态、fixture 组织和诊断文案。

## Naming Patterns（命名模式）

**Database Naming Conventions（数据库命名约定）：**
MVP 不使用数据库。Agent 不得引入 SQLite、嵌入式数据库或长期缓存存储，除非后续 ADR 明确改变存储模型。

**API Naming Conventions（API 命名约定）：**
SpecLite 的 API 表面是 CLI 命令和文件契约。

- CLI 命令使用清晰动词：`speclite install`、`speclite status`、`speclite validate`、`speclite update`。
- CLI flags 使用 kebab-case：`--project-root`、`--source-type`、`--offline-bundle`、`--json`。
- 机器可读 issue 字段使用 camelCase：`issueId`、`affectedPath`、`suggestedNextStep`。
- 面向用户的 issue category 使用稳定 lower-kebab category：`environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。
- 每个 MVP issue category 必须使用 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 中预留的最小 issue id baseline；实现不得发明自由文本 issue id。`manifest-schema.migration-needed` 的 details 至少包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind` 和 `manualActionRequired`。

**Code Naming Conventions（代码命名约定）：**

- TypeScript 源文件使用 kebab-case：`source-descriptor.ts`、`path-normalizer.ts`。
- Class 和 type 使用 PascalCase：`SourceDescriptor`、`ValidationIssue`。
- Function 和 variable 使用 camelCase：`normalizeProjectPath`、`sourceDescriptor`。
- 全局常量仅在 process-wide constant 场景使用 SCREAMING_SNAKE_CASE：`DEFAULT_MANIFEST_VERSION`。
- Canonical skill id 以 source 定义为准，不得被代码风格规则改写。

## Structure Patterns（结构模式）

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

## Format Patterns（格式模式）

**API Response Formats（API 响应格式）：**
MVP 无 REST API。API 边界是 CLI commands 与 file contracts；Public JSON 的字段 schema、排序、路径、timestamp、schema evolution、fixture comparison policy 和 executable schema anchor 由 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 作为 canonical contract 管理。本节只描述实现映射和模块责任，不复制字段真源。

CommandResult 中引用的领域对象不得在 Architecture 中重新定义语义：`SourceDescriptor` 以 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 为 trust/evidence 真源；install/update plan-before-write、external access、dry-run、`--yes`、operation lock、safe write 和 `writeAuthorized` 以 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 为真源；manifest/index 投影以 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 为真源；validation issue taxonomy 以 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 为真源。

实现映射如下：

- `src/commands/` 负责参数解析、命令模式归一和 orchestration，不直接定义 public JSON 字段或深层领域规则。
- `src/diagnostics/command-result-schema.ts` 是 CommandResult executable contract anchor；JSON reporter、fixture assertions 和 contract tests 必须复用该 module。
- `src/source/source-descriptor-schema.ts` 是 `SourceDescriptor` 与 `SourceIntegrityEvidence` 的 executable contract anchor。
- `src/installer/install-plan-schema.ts` 是 install/update pre-write planning、planned writes、confirmation 和 write authorization 的 executable contract anchor。
- `src/manifest/manifest-schema.ts` 是 manifest、skill index、help index、files index 和 phase coverage projection 的 executable contract anchor。
- `src/ide/adapter-registry.ts` 是 adapter ids、target ids、capability fields、target ordering 和 target status mapping 的 executable registry/schema anchor。
- `src/config/resolve-output-schema.ts` 是 `speclite resolve` stdout/stderr 与 merge-result parser 的 executable contract anchor。
- `src/diagnostics/command-result.ts` 与 reporter/output 模块负责把领域结果投影为 CommandResult、human-readable output 和 exit code。
- `src/source/`、`src/installer/`、`src/update/`、`src/manifest/`、`src/ide/` 和 `src/validation/` 只产出各自领域结果；public projection 和排序规则由 owning SPEC 约束。
- `speclite resolve` 是 runtime support command，不包裹 CommandResult；stdout/stderr、merge order、fallback 和 parity fixture 行为以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 为准。

CommandResult 行为在实现中的关键边界是：

- `status` 与 `validate` 分工清晰：`status` 保持 lightweight local-only summary，读取 `data.highLevelHealth` 表示健康摘要；详细 issue set、issue counts 和 validation coverage 由 `validate` 提供。
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

Manifest/index 文件契约必须引用 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`，不得在 Architecture type snippet 中复制字段真源。Validation issue taxonomy 必须引用 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`，不得由单个 validation rule 自行定义 category 语义。

## Communication Patterns（通信模式）

**Event System Patterns（事件系统模式）：**
MVP 无运行时 event bus。Installer pipeline steps 表达为有序 step records：

- `source-discovery`
- `manifest-generation`
- `ide-mirror-creation`
- `config-initialization`
- `ready-check`（human-readable label 可以是 `ready check`，contract/internal guard 名称是 `ReadyCheck`）
- `ready-summary`

Machine-readable progress `stepId` 必须使用这些 stable lower-kebab names。Step output 必须包含 status、component，以及相关 affected paths。`stepId` 是 fixture-observable deterministic signal，用于断言阶段顺序和 ready summary gate；它不是 MVP automation API。

**State Management Patterns（状态管理模式）：**
状态从文件系统和 manifest 推导，不依赖隐藏进程内存。

- `status` 读取轻量 installed state，只从本地 manifest/source descriptor/IDE target summary/high-level health 推导结果。
- `validate` 执行完整检查。
- `update` 写入前必须构建 explicit update plan。
- `install` 必须检测 existing install，禁止静默覆盖。

## Process Patterns（流程模式）

**Error Handling Patterns（错误处理模式）：**
所有 validation 与 command error 使用同一 issue model。`ValidationIssue` JSON shape 由 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 管理；category、issue id、default severity 和 fixture ownership 由 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 管理。Architecture 只规定错误处理模块边界，不复制字段真源。

规则：

- 不向用户直接抛出 raw parser error；文件系统、parser 和 adapter error 必须包装为 diagnostic issue。
- 不暴露无关 absolute local path、环境变量值、认证信息、credential-bearing URL、cache path 或临时解包路径。
- `status` 是 lightweight local-only summary；它不证明 installation healthy，详细 diagnostics、issue counts 和 validation coverage 留给 `validate`。
- `validate` 是 local-only deterministic validation；需要远程 freshness check 或 provenance revalidation 的流程只能放在显式 `update`、安装来源解析或 Post-MVP `doctor` 中。
- IDE mirror drift、source-integrity、file-integrity、operation-lock 和 update conflicts 必须使用 taxonomy 中的稳定 category/issue id；`validate` 只报告，不修复。
- Human-readable output、`--json` output、exit code 和 fixture assertions 必须共享同一 CommandResult status 推导逻辑。
- Write-capable command 出现 project operation lock blocker 时不得写入，也不得输出 plan/conflict payload 假装规划完成；stale lock 在 `validate` 中可作为 warning 呈现。
- Command-specific automation fields 必须进入契约化 `data` payload；不得把 CI 依赖字段只放在 `summary` 或非契约化对象里。
- `targetProject`、public path fields、issue ordering、nextActions ordering 和 JSON summary rendering 由 diagnostics/output 层统一处理；命令、validator、update 和 IDE adapter 不得各自拼接 public report path 或自行定义排序。

**Loading State Patterns（加载状态模式）：**
长操作 CLI 命令输出有序 progress events。Progress `stepId` 必须与上面的 installer step names 一致；human-readable label 可以独立渲染。只有 required steps 全部通过后才能展示 ready summary。自动化集成必须读取 `CommandResult.data.completedSteps`、`CommandResult.data.pendingSteps` 或契约化 file outputs，不得解析 spinner/progress stream 作为 API。

## Enforcement Guidelines（执行与约束指南）

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

## Pattern Examples（模式示例）

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
