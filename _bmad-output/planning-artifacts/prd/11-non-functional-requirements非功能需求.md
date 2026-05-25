# Non-Functional Requirements（非功能需求）

## Performance（性能）

- NFR1: 在常规 fixture 项目中，fresh install 必须至少输出 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 5 个阶段状态；fixture baseline 应记录阶段顺序和完成结果。Machine-readable progress `stepId` 必须使用 stable lower-kebab id，例如 `ready-check`，作为 fixture-observable deterministic signal；它不是 MVP automation API。Automation 依赖必须读取 `CommandResult.data.completedSteps` 和 `CommandResult.data.pendingSteps`。Human-readable step label 可以是 `ready check`；contract/internal guard 名称统一为 `ReadyCheck`。阶段耗时只作为 performance evidence 或 human-readable/profiling 数据，默认不得进入 stable command JSON snapshots。
- NFR2: `status` 在常规 fixture 项目中应在 2 秒内返回项目安装摘要，不执行完整文件完整性扫描；性能基准以 3 次连续运行的 p95 结果为准。
- NFR2a: MVP `status` 必须是轻量本地只读摘要，只读取本地 manifest、source descriptor、manifest version、installed modules、IDE target summary、关键路径和 high-level health；不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source，不得执行 remote freshness check、provenance revalidation、完整文件 hash scan 或隐式 update check。
- NFR3: `validate` 可以执行完整 local deterministic validation；`validate.data.checkedCategories` 和 validate progress 必须使用 canonical issue category order：`environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。常规 fixture 项目中每个实际执行类别必须在开始和结束时输出状态。
- NFR4: `update` 与 `validate` 必须跳过 hash 未变化的 source skills 和 IDE mirrors；在 fixture baseline 中，未变化文件的重复写入次数必须为 0。
- NFR5: fixture project 中的 fresh install、status、validate、update 必须记录 baseline runtime；任一命令相较上一 accepted baseline 退化超过 25% 时，验证报告必须标记为 performance regression。
- NFR5a: Runtime/p95 baseline、regression percentage 和 profiling sample 必须作为 release/performance evidence 保存，不得进入 stable `CommandResult` JSON 或 stable fixture snapshots。MVP 可以用 release checklist section 或 non-stable `performance-evidence` artifact 承载 measurement；fixture 只断言 evidence 存在、测量口径和 pass/fail conclusion，不比较具体 wall-clock values。

## Reliability & Determinism（可靠性与确定性）

- NFR6: 相同 source、配置、目标 IDE 和安装目录在同一平台上重复安装，应生成 byte-for-byte 一致的 `_speclite/_config`、manifest/index 和 IDE mirror 文件；允许差异仅限明确标记的时间戳字段。
- NFR7: `install` 对已存在安装内容必须输出 existing-install 状态，列出 detected runtime、manifest version、IDE targets 和下一步选项，不得静默覆盖已有 SpecLite 状态。
- NFR8: `update` 必须在修改文件前完成所有权和本地变更判断；无法确认安全时必须跳过该文件、输出 conflict 状态，并保留原文件不变。
- NFR9: `validate` 的检查结果必须可复现，同一安装状态下连续运行 3 次应返回相同 issue id、category、severity 和 affected path 集合。
- NFR9a: MVP `validate` 必须是本地确定性命令，不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source；不得执行 remote freshness check 或 provenance revalidation。远程重新验证只能发生在显式 `update`、安装来源解析流程或 Post-MVP `doctor` 中。
- NFR10: 安装失败时，系统不得展示 ready summary；失败结果必须列出 completed steps、failed step、pending steps 和 manual action，且退出状态不得为成功。
- NFR11: ready summary 只能在 source discovery、manifest generation、IDE mirror creation、config initialization 和 ReadyCheck 全部成功后展示；ReadyCheck 是 install 内部最小就绪检查，不等同于完整 `speclite validate`。

## Security & Safety（安全与防护）

- NFR12: 安装器不得在 install plan 未声明且用户未确认的情况下访问远程 source、下载额外资源或执行外部脚本；install summary 必须记录每个 external access 的 redacted/display-safe source、reason 和 confirmation state。
- NFR13: bundled source、自定义 Git source、local path、tarball 和 offline bundle 必须在安装摘要中展示 source type、redacted/display-safe source value、resolved version 或 content hash。
- NFR13a: `sourceDescriptor.trustStatus` 必须区分 `trusted`、`unverified` 和 `blocked`：MVP 中只有 expected hash、lock match，或 bundled source 的等价 packaging manifest / package hash / package lock match 可产生 `trusted`，不提供通用 trusted source allowlist schema；缺少信任锚但可安装的 source 为 `unverified`；hash mismatch、lock mismatch、unsupported source 或 Post-MVP source policy 拒绝必须为 `blocked` 并阻止写入。
- NFR13b: `sourceDescriptor.contentHash` 不对所有 source type 强制存在；MVP 必须强制 `sourceDescriptor.integrityEvidence` 至少包含一种可复现证据。bundled source 记录 packaging manifest / package hash / lock evidence；registry source 记录 package/version/integrity 或 lock match；tarball/offline bundle 记录 content hash；Git source 记录 commit SHA；local source 记录 snapshot hash 或等价 manifest hash。只指定 remote URL、branch 或 tag 的浮动 Git source 不得写入。缺少完整性证据时必须输出 `source-integrity` error 并阻止写入。
- NFR13b-1: Local source snapshot hash 只覆盖 canonical source tree allowlist，必须排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。Local source 不得指向目标项目中的 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output；违反时必须输出 `source-integrity.local-source-self-reference` 并阻止写入。Tarball/offline bundle 至少必须记录包文件 artifact hash；解包后的 canonical source tree hash 可作为 expected installed state 输入，但不得与 artifact `contentHash` 混用。
- NFR13b-2: Source staging、临时解包目录、package-manager cache path 和临时 Git checkout path 是 private implementation state，不得进入 public JSON、manifest/index、files index、fixture snapshot 或 `ValidationIssue.details`。受控成功/失败应 best-effort cleanup；崩溃残留不属于 installed-state validation 范围。
- NFR13c: `integrityEvidence[].verified === false` 只能表示 evidence 可复现但未被 expected hash 或 lock match 背书，并且只能对应 `sourceDescriptor.trustStatus === "unverified"`。hash mismatch、lock mismatch 或 evidence 校验失败必须输出 `source-integrity` error，将 source 标记为 `blocked` 并阻止写入。
- NFR13d: `source-integrity` 与 `file-integrity` 必须是不同 issue category。source resolver/install planning 阶段的来源证据、registry/proxy/authentication failure、unreadable tarball/offline bundle 或 Post-MVP source policy 问题必须使用 `source-integrity`；已安装文件、manifest files index 或 IDE mirror hash mismatch 必须使用 `file-integrity` 或更具体的 `ide-mirror` category。
- NFR13e: Source descriptor 字段与语义以 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 为准。PRD、Architecture、Manifest/index 和 CommandResult 中的 source descriptor 描述只作为摘要或投影，不得各自定义 trust/evidence 规则。
- NFR14: human-owned custom 文件、workflow-owned 产物和发生 drift 的 IDE mirror 文件不得被 install 或 update 静默覆盖；覆盖保护通过 ownership manifest、路径规则和 hash comparison 共同判断。
- NFR15: 对遗留入口或 stale entries 的处理必须默认提供 path、risk category、suggested manual action 和 verification command，不应在未确认的情况下删除用户目录中的文件。
- NFR16: validate 报告和 JSON payload 不得泄露 home directory 以外的无关本机路径、环境变量值或认证信息；路径展示应使用 project-relative POSIX path，只有项目外诊断场景可使用明确标记的 redacted absolute path。
- NFR17: installer 生成的脚本和配置文件必须在 manifest 中记录 generator、source version、content hash 和 ownership，便于用户审查其由 SpecLite 安装器生成。
- NFR17a: Manifest/index schema、skill/help/files index、minimum phase coverage matrix、canonical target ordering、package-level hash 与 file-level hash 的职责分离必须遵守 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`。Canonical skill package hash 用于跨 IDE mirror 一致性；files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed paths、skipped paths 和 conflicts。File hash 基于 raw bytes；line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions。Runtime scripts 与 generated scripts 必须在 files index 中记录 `executable`。
- NFR17b: Canonical source text files 必须使用 LF。Installer 不得按平台改写 canonical text line endings；如果必须生成平台专用脚本，必须作为独立 generated file 记录自己的 files index entry 和 raw-byte hash。`executable` 表示 POSIX executable intent；Windows 不要求 POSIX chmod 语义，但仍保留该字段用于脚本生成意图和跨平台 fixture。

## Compatibility & Portability（兼容性与可移植性）

- NFR18: MVP 必须支持 macOS 13+ 和 Windows 11 的核心安装、状态检查、验证和更新路径；不满足平台要求时必须输出 `environment.unsupported-platform` 诊断。
- NFR19: 所有 manifest、index、hash、validate 报告、IDE target 记录、`CommandResult.data` path fields、`issues[].affectedPath` 和 plan action affected paths 必须使用 project-relative POSIX-style path，并通过同一 normalization function 生成。
- NFR20: 系统必须通过跨平台 fixture 覆盖路径分隔符、LF/CRLF、可执行权限、大小写敏感路径冲突、symlink escape、path escape 和 shell invocation 差异；写入前必须阻断 symlink/path escape、case conflict 和 unsafe overwrite。
- NFR21: Node.js MVP 运行时版本要求必须在安装前检查；`package.json engines.node` 必须表达 Node 22 minimum（`>=22`），CLI preflight 必须在读取或写入项目文件前校验 detected version。不满足要求时必须输出 `environment.unsupported-node`，并包含 detected version、required range 和安装前置建议。Node 22 和 Node 24 必须进入 fixture/release matrix；Node 24-only API 不得进入 MVP，除非提供 Node 22 兼容路径或更新 runtime policy。
- NFR22: bundled source、npm public registry、private registry、local tarball、offline bundle、Git source 和 local source 的安装入口必须最终归一为包含 source type、resolved root、version、integrity evidence 和 trust status 的 source descriptor。完整 source lockfile 生成、刷新、轮转和迁移属于 Post-MVP；MVP 只消费 packaging manifest / package hash / lock evidence、expected hash、version-lock、registry integrity、content hash、snapshot hash 或 Git commit SHA 作为最小 trust evidence。
- NFR23: 不同 AI IDE 的平台差异必须限制在 adapter 配置、target directory metadata 和 Post-MVP command pointer artifact 中；MVP 不生成 command pointer artifact，canonical skill package 内容 hash 不得因 IDE target 不同而变化。MVP target id 必须表示物理 execution target：`claude` 对应 `.claude/skills`，`agents` 对应 `.agents/skills`；GitHub Copilot/Cursor 在 MVP 中只能通过 `agents` target 表示，不能伪造专用 target id，也不得在 human-readable output 中把 `agents` 渲染为 branded Copilot/Cursor readiness。

## Integration Quality（集成质量）

- NFR24: 每个 AI IDE adapter 必须声明 id、target directory、supported entry types、shared target policy、known limitations、validation checks 和 canonical target order。Adapter registry 字段与状态语义必须遵守 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`。MVP adapter schema 可以声明 `commandPointerBehavior: "none" | "unsupported"`，但不得生成 command pointer artifact。Manifest generation、`CommandResult.data.ideTargets`、`validate.data.checkedTargets` 和 fixture snapshots 必须复用 adapter registry 的 canonical target order，不得使用 glob、filesystem、user selection 或 async completion order。
- NFR24a: Target status 词汇必须按层区分。Install planning 使用 `planned`、`unsupported`、`failed`；installed phase coverage 使用 `mapped`、`unsupported`、`failed`；status summary 使用 `not-configured`、`configured`、`partial`、`failed`。同名 literal 可以出现在不同层，但必须由 layer-scoped type 解释，不能跨层复用含义。用户显式选择的 target 若 unsupported 必须成为 blocking error；未选择或可选 target 的 unsupported 可作为 warning、info 或 known limitation。
- NFR25: IDE mirror 生成结果必须能被 validate 反向检查，确认 skill 数量、canonical id、relative path、content hash 和 source reference 一致。
- NFR25a: IDE mirror drift 必须产生稳定 issue id、category、severity 和 affected path；MVP 只有 `speclite update --repair` 可以显式触发 repair 行为并被 fixture 验证，普通 `update` 的用户确认或 `--yes` 不得修复 drift，`speclite sync` 保持 Post-MVP。
- NFR25b: installer-owned drift repair 必须覆盖 `_speclite` metadata/control hub 与 IDE execution plane 中的 installer-owned files，并通过 fixture 验证 human-owned 与 workflow-owned 内容保持不变。
- NFR25c: repair plan 输出必须稳定、可诊断、可测试；相同 drift 状态下 repeated repair planning 应产生相同 affected path、hash 和 action 集合。
- NFR26: 系统必须用 not-configured、configured、partial、failed 4 类状态报告每个 IDE target，并为 partial/failed 输出原因和 affected path。
- NFR27: 新增 IDE adapter 不应要求修改 canonical skill 内容；adapter 测试必须证明 canonical skill package hash 在新增前后不变。
- NFR28: manifest/index、help catalog 和 menu target 之间必须保持可验证的一致关系：MVP 中每个 menu target 必须能解析到唯一 installed self-contained skill entry；command pointer target 保持 Post-MVP。
- NFR28a: Source 侧以 `assets/source/speclite/` 下的 module metadata 与 source skill package 作为 canonical truth；installed 侧以 manifest/index 作为已安装投影。Help index 只能引用 `canonicalSkillId`、phase、entry label 和 activation target，不得定义第二套 skill identity、alias-only identity 或 IDE-specific skill identity。
- NFR28b: Configured workflow artifact root 和 `artifactContract.defaultOutputPath` 必须是 project-relative POSIX path，并且解析后位于 target project boundary 内；symlink/path escape 必须报告 `artifact-path.escapes-project` 或 `artifact-path.symlink-escape`，不得把 escaped absolute path 写入 public JSON、manifest/index 或 fixture snapshot。
- NFR29: shared scripts、module directories、configuration 和 help catalog 的安装结果必须能在 ready summary 和 validate 中以 installed/missing/mismatched 状态检查。

## Diagnostics & Observability（诊断与可观测性）

- NFR30: 所有核心命令必须输出 success、warning 或 failure 状态；每个状态必须包含 command、target project、summary 和 next action。`failure` 必须对应非 0 exit code；`success` 和 `warning` 必须对应 0 exit code。
- NFR31: 错误信息必须包含 issue id、category、severity、affected path 或 component、impact 和 suggested next step。
- NFR32: environment guard、stale legacy entries、legacy namespace residue、runtime path 错误、manifest/schema 错误、source integrity 错误、installed file integrity 错误、operation lock 错误、update/repair planning blocker 和 IDE mirror 漂移必须以不同 issue category 呈现，并在 validate summary 或 command-level issue 输出中分别计数或呈现。
- NFR32a: `ValidationIssue.category`、issue id 边界、默认 severity 指引和 validation fixture ownership 由 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 作为 canonical taxonomy 管理。新增 issue category 必须先更新该 SPEC；新增 issue id 必须在同一变更中补 fixture assertion。
- NFR32b: `manifest-schema.migration-needed` 是 MVP 保留 issue id，用于旧版或不兼容 manifest/index schema 需要迁移时的诊断；不得用自由文本 issue id 表示 schema migration。
- NFR32c: `manifest-schema.migration-needed` 的 `details` 至少必须包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind` 和 `manualActionRequired`，且不得包含 absolute path、timestamp、stack trace 或环境相关文本。MVP producers 只能输出 `migrationKind: "manual"` 或 `"unsupported"`；`"automated-available"` 只作为 Post-MVP migration tooling 的 forward-compatible enum value。
- NFR32d: 每个 MVP issue category 必须在 taxonomy SPEC 中预留最小 issue id baseline。实现不得发明自由文本 issue id；新增 issue id 必须先更新 taxonomy，并在同一变更中补 fixture assertion。
- NFR32e: 企业 source 失败必须使用稳定 source-integrity issue id，包括 registry unreachable、authentication required、offline bundle unreadable 和 tarball unreadable；credentials 和 credential-bearing URLs 必须 redacted。
- NFR32f: Write-capable command 出现 `operation-lock.project-locked` 必须为 `failure` 且非 0 exit code；`validate` 发现 stale lock 时可以输出 `operation-lock.stale-lock` warning，不阻断。
- NFR32g: `update.conflicts` 是 command-level update/repair planning blocker，category 必须为 `update`，severity 必须为 `error`；逐路径冲突只放在 `data.conflicts`，不得复制成多个 issues。
- NFR33: `status` 只提供 source/channel/version、IDE target coverage、manifest presence、required path presence 和 high-level health；`status` 不提供 full validation category coverage，也不证明 installation healthy。安装健康断言必须读取 `status.data.highLevelHealth`；逐项 issue id、category、severity、affected path 和修复建议属于 `validate`。
- NFR34: 安装完成摘要必须展示安装位置、已安装模块、已配置 AI IDE、关键目录、manifest version、source descriptor 和下一步使用建议。
- NFR35: MVP 的机器可读输出必须与人类可读输出共享同一 issue model；同一检查结果的 issue id、category、severity 和 affected path 必须一致。
- NFR35a: `--json` 输出必须保持 deterministic schema；相同安装状态和命令参数下，除明确允许的 timestamp 字段外，`CommandResult.schemaVersion`、`CommandResult`、`ValidationIssue` 和 command-specific `data` 的语义内容必须一致。详细 deterministic comparison policy 以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。
- NFR35a-schema: `CommandResult.schemaVersion` 必须作为真实兼容性边界使用。`speclite.command-result.v1` 内不得删除字段、重命名字段、改变既有字段语义、收窄枚举、做字段类型不兼容改变或新增必填字段；这些变更必须发布为新的 schema version。
- NFR35a-0: `CommandResult.command` 必须可跨 shell、参数顺序和命令别名稳定比较；`--json`、`--yes`、`--project-root`、source 参数和其他 flags 不得影响 command ID。`update --repair` 的 command ID 必须为 `update.repair`。
- NFR35a-1: `CommandResult.targetProject` 必须可跨不同 checkout root 稳定比较；同一 trim 后非空的 project config 项目名称应产生相同 targetProject，缺失、空字符串或纯空白项目名称时同一目录 basename 应产生相同 targetProject；MVP 不得通过 slugify、字符集限制或长度改写改变该显示标识。
- NFR35b: human-readable output、`--json` output、exit code 和 fixture assertions 必须从同一 `CommandResult.status` 推导；不得出现 JSON 为 `success` 但 exit code 非 0，或存在 error/critical issue 但 exit code 为 0 的情况。
- NFR35b-1: `status.data.highLevelHealth` 不得与 `CommandResult.status` 互相推导。`CommandResult.status` 表示命令结果；`highLevelHealth` 表示安装健康摘要。命令成功读取到 `not-configured`、`partial` 或 `failed` 安装状态时，`CommandResult.status` 仍可为 `success`，exit code 仍应为 0。
- NFR35b-2: `status.data.highLevelHealth === "not-configured"` 是合法未安装状态，不是命令失败。`status` 成功判断该状态时必须返回 `CommandResult.status: "success"`，exit code 0，并在 `nextActions` 中建议运行 `speclite install`。
- NFR35b-3: `status.data.highLevelHealth === "partial"` 或 `"failed"` 不得自动生成 warning issue，也不得自动把 `CommandResult.status` 推导为 `warning`。`status` 必须优先通过 `summary`、`highLevelHealth` 和 `nextActions` 表达轻量摘要；只有轻量读取过程本身发现明确 warning 条件时，才产生 warning issue。
- NFR35b-4: `speclite status --json` 必须允许 `issues: []`；空 issues 只表示本次轻量 status 命令无命令级 warning/error/critical issue，不得作为安装健康通过的证明。安装健康断言必须读取 `data.highLevelHealth`。
- NFR35b-5: MVP `status.data` 不得包含 `issueCounts`；`issueCounts` 只属于 `validate.data`。fixture、CI 和自动化脚本不得要求 `status` 输出问题计数，也不得把 `status` 当成弱化版 `validate`。
- NFR35b-6: `validate.data.issueCounts` 必须固定包含 `info`、`warning`、`error` 和 `critical` 四个 key；计数为 0 的 severity 也不得省略。fixture、CI 和自动化脚本可以依赖该固定 key set。
- NFR35b-7: `validate.data.checkedCategories` 必须按 canonical issue category order 输出：`environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。部分执行时必须保留已执行类别的相对顺序，不得使用文件系统遍历、规则注册或对象 key 顺序作为输出顺序。
- NFR35b-8: `validate.data.checkedTargets` 和 command data 中的 `ideTargets` 必须按 manifest/adapter registry canonical target order 输出。部分执行时必须保留已执行 targets 的相对顺序，不得使用 glob、文件系统、平台返回或 adapter 完成顺序作为输出顺序。
- NFR35b-9: `validate.data.validatedPaths` 必须先规范化为 project-relative POSIX path，再按字典序输出。不得使用 validation rule execution order、filesystem traversal order 或 issue discovery order 作为输出顺序。
- NFR35b-10: `CommandResult.issues` 必须按 severity order（`critical`、`error`、`warning`、`info`）、canonical issue category order、normalized affected path、issue id 依次排序。
- NFR35b-11: `CommandResult.nextActions` 必须按 command-specific priority order 输出：blocking remediation、recommended next step、optional exploration。同一 priority tier 内按命令定义的稳定顺序输出，不得按字母序或 reporter 拼接顺序重排。
- NFR35b-12: `CommandResult.summary` 必须使用 command-specific stable summary template，且该约束只适用于 `--json` output。JSON summary 不得包含 timestamp、absolute path、home directory、环境相关措辞、随机排序内容或未规范化路径；human-readable output 不受该模板限制。
- NFR35b-13: Human-readable output 可以更丰富，但不得成为自动化依赖的唯一承载位置；automation 需要的值必须进入 structured JSON 或 file contract。Human output 也必须遵守 credential、cache path、temporary extraction path、home directory 和 local absolute source path 的 redaction/display-safe 策略。
- NFR35c: command-specific `data` payload 不得使用未记录字段作为自动化依赖；新增、弃用或重命名 payload 字段必须通过 `CommandResult.schemaVersion` 和 fixture expected outputs 管理。
- NFR35d: JSON path fields 必须可跨 macOS/Windows 和不同 checkout root 稳定比较；fixture snapshots 不得依赖 absolute local path、OS-specific separators 或 home directory；`data.paths.projectRoot` 必须为 `"."`。
- NFR35e: `ValidationIssue.issueId` 必须可跨不同 affected path、IDE target、source name、hash 和运行次数稳定比较。Issue id 不得包含动态值；新增 validation rule 可以新增 issue id，但不得改变已有 issue id 的问题类型语义。
- NFR35f: `ValidationIssue.details` 必须可被 fixture snapshot 稳定比较，并不得泄露 absolute path、home directory、环境变量、认证信息、stack trace、raw exception object、timestamp、随机 id 或其它非确定性字段。
- NFR35g: `ValidationIssue.severity` 必须作为 `CommandResult.status` 和 exit code 的稳定输入；各 validation rule 不得自行重定义 severity 语义，不得用 warning 阻断命令，也不得在 error/critical issue 存在时输出 command success。
- NFR35h: `ValidationIssue.impact` 与 `ValidationIssue.suggestedNextStep` 必须可被 fixture snapshot 稳定比较；不得包含 path、IDE target、source name、timestamp、stack trace、hash、随机值或长段解释。
- NFR35i: public JSON timestamp 必须是显式例外而非默认能力；任何允许 timestamp 的字段必须在 schema 中声明，并从 stable fixture snapshot comparison 中排除。
- NFR35j: public JSON arrays 不得依赖 filesystem traversal、object insertion、rule execution、adapter completion 或 async completion order。`changedPaths`、`skippedPaths`、`conflicts`、`completedSteps`、`pendingSteps`、`installedModules` 等数组必须在 schema 中声明排序规则。

## Maintainability & Extensibility（可维护性与可扩展性）

- NFR36: source discovery、module selection、IDE adapter、manifest/index 生成和 validation checks 必须通过独立模块边界和公开接口连接；新增 adapter 不得修改 source discovery 逻辑。
- NFR37: 新增官方模块只允许通过 module metadata、skill package 和 manifest/index generation 扩展安装流程，不应要求重写 installer pipeline。
- NFR38: 新增验证规则不得改变已有 issue id、category、severity 字段含义；需要新增字段时必须通过 schema version 扩展。
- NFR39: 配置和定制化解析逻辑必须集中在统一 resolver 中；skill 或 adapter 不得实现自己的配置合并规则。
- NFR40: fixture project 应作为维护者验证 installer 行为的基础资产；每个新增安装能力必须同步新增或更新 fixture case、expected output 和 validation assertion。
- NFR40a: MVP release gate fixtures 必须在 Node 22 和 Node 24 上通过，并包含 macOS 与 Windows path-portability 证据。Windows fixture 不要求 POSIX chmod，但必须验证 files index 中的 `executable` intent 和受支持的脚本入口可用性。
- NFR40b: MVP release gate fixtures 必须包含最小 `skill-artifact-loop`，覆盖 installed IDE entry discovery、activation protocol、resolver access 和 artifact metadata 值域；多 skill、复杂 workflow 质量和人工评审结论属于 regression assets 或 Post-MVP validation。
- NFR40c: `source-integrity` release gate 必须拆为稳定 sub-cases，至少覆盖 `bundled-packaging-trusted`、`bundled-packaging-missing-evidence-blocked`、`registry-lock-trusted`、`registry-unverified`、`git-floating-blocked`、`local-source-snapshot-unverified`、`local-source-path-redacted`、`local-source-installed-state-blocked`、`artifact-hash-mismatch-blocked` 和 `source-unreadable-blocked`。
- NFR40d: Release packaging acceptance 必须作为 release checklist gate 生成 packaging manifest，验证 npm package、local tarball 和 offline bundle 包含 compiled CLI、`package.json` bin mapping、`assets/source/speclite/`、installer/runtime schemas、runtime scripts/templates 和安装执行所需 runtime assets；`test/fixtures/` 与 root `fixtures/` 默认不得进入 package，除非明确标记为 packaged documentation example。Packaging acceptance 不一定是 fixture project case，但必须有 stable artifact、expected assertions 和 CI/release evidence。

## NFR Measurement Matrix（NFR 度量矩阵）

| Area | Primary NFRs | Measurement Method | Pass Criteria |
| --- | --- | --- | --- |
| Install progress | NFR1, NFR10, NFR11 | Run fresh install on fixture project and parse ordered step events | Required steps appear once, in order, and final ready summary appears only after ReadyCheck passes |
| Command runtime | NFR2, NFR3, NFR5, NFR5a | Run 3 repeated fixture commands and record p95 duration into release/performance evidence | `status` p95 < 2s; accepted baseline regression <= 25%; wall-clock values stay out of stable snapshots |
| Determinism | NFR6, NFR9, FR71a | Repeat install/validate on same fixture and compare normalized outputs | Generated canonical files and issue sets match except allowed timestamp fields |
| Update safety | NFR8, NFR14 | Modify installer-owned, human-owned, and workflow-owned fixture files before update | Conflicts are reported; human/workflow-owned files remain unchanged |
| Path portability | NFR18-NFR20 | Run path fixtures on macOS 13+ and Windows 11 | Normalized paths are project-relative POSIX-style; no separator, newline, permission, symlink escape, path escape, unsafe overwrite, or case-conflict failure |
| IDE integration | NFR23-NFR29 | Generate mirrors for all selected IDE targets and run reverse validation | Each canonical skill has expected target paths and matching package/file hash projections |
| Diagnostics | NFR30-NFR35j, NFR32a | Compare human-readable and machine-readable outputs against issue schema and taxonomy | Required issue fields are present and semantic fields match across output modes |
| Extensibility | NFR36-NFR40 | Add a fixture module, adapter, and validation rule in isolation | Existing module, adapter, and issue schema behavior remains compatible |
