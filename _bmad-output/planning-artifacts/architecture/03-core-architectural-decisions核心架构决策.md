# Core Architectural Decisions（核心架构决策）

## Decision Priority Analysis（决策优先级分析）

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

## Data Architecture（数据架构）

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
承载 schema 的文件必须包含 schema version。Manifest/index 字段、版本、target id、排序、hash 和 ownership 投影由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 作为 canonical contract 管理；source trust/evidence 语义由 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 管理；install/update pre-write planning、external access、`--yes`、dry-run 与 write authorization 语义由 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 管理；validation issue category、issue id 边界和默认 severity 指引由 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 管理。未来不兼容变更应产生 `manifest-schema.migration-needed` diagnostics，而不是静默重写。

**Caching Strategy（缓存策略）：**
MVP 不使用持久 database cache。使用 manifest/hash baselines 优化 update 与 validation。

## Authentication & Security（认证与安全）

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
- Fresh install 可以 create-if-absent 方式创建 human-owned TOML stub；MVP 仅限 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`。如果目标文件已存在，install/update/repair 不得覆盖、重写、重排或格式化；fresh install 不默认创建 skill-specific `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`。
- Installer-owned drift 虽发生在 installer-owned areas，也不得被 `validate` 或普通 `update` 静默覆盖；`update` 默认产生 conflict，普通 `update` 的确认或 `--yes` 不得把 drift conflict 转成 repair。MVP 通过 `speclite update --repair` 恢复可安全 repair 的 canonical 内容，不新增顶级 `speclite repair` 命令，`speclite sync` 保持 Post-MVP。
- Install/update/repair 写入前必须获取 `_speclite/.lock` project operation lock；拿不到锁时不得写入，并产生 `operation-lock.project-locked` command-level issue，且不得把该问题放入 `data.conflicts`。Lock file shape 为 `schemaVersion`、`operation`、`pid?`、`createdAt` 和 `projectRootHash`；lock file 是 volatile control file，不进入 files index，也不参与 stable files-index hash；`createdAt` 不进入 stable fixture snapshot，stale-lock 测试使用注入或规范化 fixture clock；`pid` 只是 best-effort hint，不是唯一 stale 判定；`projectRootHash` 只用于 lock ownership hint，不作为跨 checkout 稳定 public value。
- Installer-owned files 仅在 ownership 与 hash checks 后更新。
- 所有 public report paths 必须使用 project-relative POSIX-style paths；只有项目外诊断可使用明确标记的 redacted absolute path。
- Validator 将 `_bmad`、legacy runtime path 和 stale IDE entry residue 标记为显式 issue categories。
- Git source、tarball 和 offline bundle installs 必须产生 source/hash diagnostics。

**Authorization Pattern（授权模式）：**
MVP 不适用。未来企业策略控制可以叠加在 source/channel allowlists 与 validation gates 上。

## API & Communication Patterns（API 与通信模式）

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
所有失败在内部返回 structured diagnostic objects，再渲染为 human-readable CLI output 或 `--json` output。MVP JSON output 必须复用同一 issue model。Human-readable output 可以更丰富，但不得承载 structured JSON 或 file contract 中不存在的自动化依赖；progress events/spinner output 不是 MVP automation API。Machine-readable progress `stepId` 只作为 fixture-observable deterministic signal；自动化必须依赖 `CommandResult.data.completedSteps`、`CommandResult.data.pendingSteps` 或 owning SPEC 中定义的 file contracts。

**Rate Limiting（限流）：**
MVP 不适用，因为没有服务器请求面。

## Frontend Architecture（前端架构）

MVP 不涉及前端架构。

**Decision（决策）：** MVP 不提供 browser UI 或 desktop UI。

**Rationale（理由）：**
PRD 描述的是本地 CLI/control plane。UI 会增加表面积，却不能改善核心验证目标：install、status、validate、update、cross-IDE mirrors 和 workflow artifact governance。

**Implication（影响）：**
所有用户交互通过 CLI prompts、flags、generated files 和 validation reports 完成。未来任何 UI 都应消费同一 manifest 和 issue model，而不是发明独立状态。

## Infrastructure & Deployment（基础设施与部署）

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

## Decision Impact Analysis（决策影响分析）

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
