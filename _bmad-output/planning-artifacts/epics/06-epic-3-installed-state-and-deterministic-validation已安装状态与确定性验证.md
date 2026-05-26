# Epic 3: Installed State And Deterministic Validation（已安装状态与确定性验证）

工具链维护者可以查看安装状态，并用本地 deterministic validation 诊断 manifest、IDE mirror、runtime path、menu target、legacy residue、artifact path、file integrity 和 JSON issue contract 问题。

## Story 3.1: Lightweight Install Status Summary（轻量安装状态摘要）

作为工具链维护者，
我希望运行 `speclite status` 时快速看到当前项目的 SpecLite 安装状态，
以便判断项目是否已配置、哪些 IDE targets 可用，以及下一步应运行安装、验证还是修复流程。

**验收标准：**

**前提** 用户在目标项目中运行 `speclite status`
**当** 项目尚未安装 SpecLite
**则** 命令返回成功状态并显示 `not-configured` high-level health
**并且** 下一步建议包含运行 `speclite install`。

**前提** 项目存在 SpecLite manifest 或安装状态
**当** status 读取本地安装摘要
**则** 输出包含 source/channel/version、manifest presence、manifest version、installed modules、IDE target summary 和关键路径
**并且** 不执行完整 file hash scan。

**前提** 已配置一个或多个 IDE targets
**当** status 生成 target coverage 摘要
**则** 每个 target 使用 `not-configured`、`configured`、`partial` 或 `failed` 状态表达 high-level 状态
**并且** partial 或 failed target 会提供原因摘要和 affected path。

**前提** status 命令运行
**当** 需要判断安装健康摘要
**则** `status.data.highLevelHealth` 与 `CommandResult.status` 不互相推导
**并且** 命令成功读取到 `not-configured`、`partial` 或 `failed` 安装状态时，`CommandResult.status` 仍可为 `success` 且 exit code 为 0。

**前提** 自动化需要判断安装健康或读取可修复问题
**当** 它消费 `speclite status --json`
**则** 安装健康断言必须读取 `data.highLevelHealth`
**并且** `status` 不提供 full validation category coverage；需要 issue id、category、severity、affected path 和 suggested next step 时必须运行 `speclite validate`。

**前提** 用户请求 `speclite status --json`
**当** 命令成功生成轻量摘要
**则** JSON 可以包含 `issues: []`
**并且** 空 issues 只表示本次轻量 status 命令无命令级 warning/error/critical issue，不表示安装健康通过。

**前提** status 命令执行
**当** 生成 lightweight summary
**则** 命令不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source
**并且** 不得执行 remote freshness check、provenance revalidation、完整文件 hash scan 或隐式 update check。

## Story 3.2: Manifest And Index Schema Validation（Manifest 与索引 Schema 验证）

作为工具链维护者，
我希望运行 `speclite validate` 时能够验证 manifest、skill index、help index 和 files index 的结构与版本，
以便确认当前安装投影可被后续 status、validate、update 和 IDE adapter 稳定读取。

**验收标准：**

**前提** 项目中存在 `_speclite/_config/manifest.yaml`
**当** 用户运行 `speclite validate`
**则** 系统会验证 manifest schema version、必需字段和 installed-state 投影结构
**并且** 缺失或不兼容 schema 时报告 `manifest-schema` category issue。

**前提** manifest/index schema 版本旧于当前支持版本
**当** validate 判断需要迁移
**则** 系统会报告稳定 issue id `manifest-schema.migration-needed`
**并且** details 至少包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind` 和 `manualActionRequired`
**并且** MVP producers 只能输出 `migrationKind: "manual"` 或 `"unsupported"`；`"automated-available"` 只能由 Post-MVP migration tooling 引入。

**前提** skill index 存在
**当** validate 检查 skill index
**则** 系统会验证 canonical skill id、moduleId、source reference、target projection 和 hash 字段是否满足 manifest/index owning SPEC
**并且** 不允许 skill index 定义第二套 skill identity。

**前提** help index 存在
**当** validate 检查 help index
**则** 系统会验证 help entry 只引用 canonicalSkillId、phase、entry label 和 activation target
**并且** menu target 必须能在后续检查中解析到唯一 installed self-contained skill entry。

**前提** files index 存在
**当** validate 检查 files index
**则** 系统会验证 ownership、file-level hash、executable intent 和 project-relative POSIX path 字段
**并且** line ending、executable bit、file mode、symlink handling 和 case conflict 作为独立 validation dimensions，不被 hash normalization 隐式吸收。

**前提** manifest、skill index、help index 或 files index 缺失
**当** validate 生成诊断结果
**则** 系统会报告稳定 issue id、category、severity 和 affected path
**并且** 不使用自由文本 issue id 表达 schema 或 index 问题。

## Story 3.3: IDE Mirror And File Integrity Validation（IDE 镜像与文件完整性验证）

作为工具链维护者，
我希望 `speclite validate` 能检查 IDE mirrors 与 installed manifest/hash baseline 是否一致，
以便发现 `.claude/skills`、`.agents/skills` 或 installer-owned 文件发生的 drift，并获得稳定、可复现的诊断结果。

**验收标准：**

**前提** manifest 记录了 canonical skill package hash
**当** validate 检查 `.claude/skills` 中的 mapped skill entry
**则** 系统会验证该 entry 的 canonical skill package 内容是否匹配 manifest baseline
**并且** mismatch 时报告 `ide-mirror` 或 `file-integrity` category issue。

**前提** manifest 记录了 canonical skill package hash
**当** validate 检查 `.agents/skills` 中的 mapped skill entry
**则** 系统会验证该 entry 与同一 canonical skill 在其他 target 中的 package hash 是否一致
**并且** 不因 target directory 不同而允许 canonical package 内容漂移。

**前提** files index 记录了 installer-owned 文件的 file-level hash
**当** validate 检查已安装文件
**则** 系统会基于 raw bytes 计算当前 hash
**并且** 将 mismatch 报告为稳定的 `file-integrity` issue。

**前提** validate 发现 IDE mirror drift
**当** 命令输出诊断结果
**则** issue 包含稳定 issue id、category、severity 和 affected path
**并且** validate 不会自动修复或重写 drift 文件。

**前提** validate 检查 target mirrors
**当** 某个 expected skill entry 缺失或额外 entry 与 canonical skill id 重叠
**则** 系统会报告 missing、mismatched 或 drift 诊断
**并且** 建议用户运行后续明确的 update/repair 路径，而不是静默覆盖。

**前提** 同一安装状态连续运行 `speclite validate` 三次
**当** IDE mirrors 和 files index 未发生变化
**则** 返回的 issue id、category、severity 和 affected path 集合保持一致
**并且** 输出不依赖 filesystem traversal order。

## Story 3.4: Runtime Path, Menu Target, Legacy Entry And Artifact Path Validation（运行时路径、菜单目标、遗留入口与产物路径验证）

作为工具链维护者，
我希望 `speclite validate` 能检查 runtime path、menu target、legacy namespace residue、遗留入口冲突和 artifact path，
以便快速定位安装漂移、重复加载、菜单冲突或产物路径不可用的问题。

**验收标准：**

**前提** manifest 或 installed skill entry 记录了 runtime path
**当** validate 检查 runtime path
**则** 系统会确认路径指向当前 `_speclite` runtime namespace
**并且** 发现旧 runtime path 或错误 namespace 时报告 `runtime-path` category issue。

**前提** help index 或 menu metadata 中存在 menu target
**当** validate 解析该 menu target
**则** 每个 target 必须解析到唯一 installed self-contained skill entry
**并且** 缺失、重复或不可激活 target 会报告 `menu-target` category issue。

**前提** 项目中存在旧版或遗留 AI IDE entry
**当** validate 检测到它与当前 canonical skill id 或 IDE target 重叠
**则** 系统会报告 `legacy-namespace` category issue
**并且** issue 会说明重复加载、菜单冲突或能力漂移风险。

**前提** validate 报告 legacy entry 问题
**当** 生成 suggested next step
**则** 系统会提供 path、risk category、manual action 和 verification command
**并且** 不会在未确认的情况下删除用户目录中的文件。

**前提** manifest 或 discovery metadata 记录 artifact contract
**当** validate 检查 artifact path
**则** 系统会确认默认输出路径和 configured artifact root 都可解析为 project-relative POSIX path，且位于 target project boundary 内
**并且** 缺失、越界、symlink/path escape 或不可写路径会报告 `artifact-path` category issue。

**前提** validate 检查 legacy、runtime、menu 和 artifact path 问题
**当** 输出诊断结果
**则** affected path 不泄露无关 absolute local path、home directory、环境变量或认证信息
**并且** 必须使用稳定 issue id、category、severity 和 suggested next step。

## Story 3.5: CommandResult And ValidationIssue JSON Contract（CommandResult 与 ValidationIssue JSON 契约）

作为工具链维护者，
我希望核心命令的人类可读输出、`--json` 输出、exit code 和 fixture assertions 使用同一套 `CommandResult` 与 `ValidationIssue` 语义，
以便自动化、CI 和人工排查看到一致、稳定、可测试的结果。

**验收标准：**

**前提** 用户运行 MVP 核心命令并传入 `--json`
**当** 命令生成机器可读输出
**则** 输出必须使用统一 `CommandResult` envelope
**并且** `issues` 必须复用同一 `ValidationIssue` model。

**前提** 命令产生 error 或 critical issue
**当** 系统推导 command status 与 exit code
**则** `CommandResult.status` 不得为 `success`
**并且** exit code 必须为非 0。

**前提** 命令只产生 success 或 warning 状态
**当** 系统推导 exit code
**则** exit code 必须为 0
**并且** warning issue 不得阻断命令成功返回。

**前提** 同一检查结果需要同时输出 human-readable 和 `--json`
**当** reporter 渲染结果
**则** issue id、category、severity 和 affected path 必须一致
**并且** human-readable output 不得成为自动化依赖的唯一承载位置。

**前提** `CommandResult.command` 被写入 JSON
**当** 用户使用不同 shell、参数顺序或命令别名
**则** command id 仍保持稳定
**并且** `update --repair` 的 command id 必须为 `update.repair`。

**前提** `CommandResult.targetProject` 被写入 JSON
**当** 同一项目在不同 checkout root 下运行命令
**则** targetProject 使用稳定显示标识
**并且** 不通过 slugify、字符集限制或长度改写改变该标识。

**前提** `ValidationIssue.details`、impact 或 suggestedNextStep 被写入 JSON
**当** fixture snapshot 比较输出
**则** 这些字段必须稳定可比较
**并且** 不包含 absolute path、home directory、环境变量、认证信息、stack trace、timestamp、随机 id、hash 或长段非确定性解释。

**前提** 同一 semantic command result 需要渲染为不同 presentation profile
**当** 系统生成 compact、evidence 或 structured 输出
**则** 三类 profile 必须复用同一 `CommandResult`、`ValidationIssue`、nextActions 和 path normalization source
**并且** command implementation 不得绕过 `src/diagnostics/output.ts` 或 reporter 层自行拼接状态词、issue layout、path display 或 summary template。

**前提** 用户请求 `--json`
**当** structured renderer 输出 command result
**则** JSON 必须不包含 ANSI escape、terminal width formatting、颜色标记、图标或 human-only 装饰字段
**并且** human-readable output 中出现的 automation 必需字段必须在 structured JSON 或 file contract 中有对应来源。

## Story 3.6: Validation Progress, Category Coverage And Local Determinism（验证进度、类别覆盖与本地确定性）

作为工具链维护者，
我希望 `speclite validate` 按稳定顺序展示检查进度、覆盖类别、目标和路径，
以便验证结果可以被人读懂，也可以被 fixture、CI 和自动化脚本稳定比较。

**验收标准：**

**前提** 用户运行 `speclite validate`
**当** validate 开始执行检查
**则** 系统会按 canonical issue category order 处理并报告 checkedCategories
**并且** 顺序为 `environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。
**并且** `source-integrity` 在 Epic 3 中仅作为 canonical order 的 reserved position；若没有实际执行本地只读 `source-integrity` rule/category group，`checkedCategories` 不得包含它，human-readable output 必须显示 skipped / not checked。
**并且** source descriptor / integrity evidence shape、source lockfile lifecycle、remote freshness、provenance revalidation 和 distribution channel rules 由 Epic 5 收口，不在 Story 3.6 中补实现。

**前提** validate 只执行部分类别
**当** 输出 checkedCategories
**则** 已执行类别仍保留 canonical relative order
**并且** 不使用文件系统遍历、规则注册或对象 key 顺序作为输出顺序。

**前提** validate 输出 issueCounts
**当** 某个 severity 没有 issue
**则** `validate.data.issueCounts` 仍固定包含 `info`、`warning`、`error` 和 `critical` 四个 key
**并且** 计数为 0 的 severity 不得省略。

**前提** validate 输出 checkedTargets
**当** 已安装多个 IDE targets
**则** target 顺序必须遵守 manifest/adapter registry canonical target order
**并且** 不依赖 glob、文件系统、平台返回或 adapter 完成顺序。

**前提** validate 输出 validatedPaths
**当** 路径集合生成完成
**则** 每个路径先规范化为 project-relative POSIX path
**并且** 再按字典序输出。

**前提** validate 输出 CommandResult.issues
**当** 多个 issue 同时存在
**则** issues 必须按 severity order、canonical issue category order、normalized affected path、issue id 排序
**并且** 不按发现顺序、rule execution order 或异步完成顺序输出。

**前提** 同一安装状态连续运行 `speclite validate`
**当** source、manifest、IDE mirrors 和 artifacts 未发生变化
**则** 除明确允许的 timestamp 字段外，JSON 语义内容保持一致
**并且** validate 不访问远程 source、不执行 remote freshness check 或 provenance revalidation。

**前提** validate 需要渲染 human-readable output
**当** terminal width 小于 80 columns、处于 80-119 columns 或大于等于 120 columns
**则** 输出可以在 key-value block 与 table 间切换，但不得丢失 severity、category、issueId、affectedPath、impact、suggestedNextStep、checkedCategories、checkedTargets 或 nextActions
**并且** `--json` 输出不受 terminal width、TTY、locale 或平台影响。

**前提** validate 输出使用颜色、图标或符号辅助扫描
**当** 用户在无颜色、screen reader、复制到 issue tracker 或 CI log 的场景阅读输出
**则** severity、status、empty state、issue category 和 next action 必须仍有文本等价物
**并且** `No issues found`、`No conflicts detected` 或未检查项必须显式呈现，不得以空白表示。
