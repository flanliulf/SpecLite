# Epic 5: Source Integrity And Distribution Channels（来源完整性与分发渠道）

项目维护者可以在默认 `bundled` source 之外，从 npm public/private registry、local tarball、offline bundle、Git source 或 local path 安装 SpecLite，并获得可诊断的 source descriptor、integrity evidence、trust status、channel/version 和失败原因。

## Story 5.1: Source Selection And Channel Summary（来源选择与 Channel 摘要）

作为项目维护者，
我希望在安装过程中选择 SpecLite 的安装来源和 channel，
以便明确本次安装使用默认 bundled source，还是来自 npm registry、本地包、离线包、Git source 或本地路径，并在写入前确认来源摘要。

**验收标准：**

**前提** 用户运行 `speclite install` 并进入来源选择阶段
**当** 系统展示可用来源选项
**则** 用户可以选择默认 `bundled` source，或选择 npm public registry、private registry、local tarball、offline bundle、Git source 或 local path
**并且** 每种来源都以清晰的 source type 展示。

**前提** 用户选择默认来源
**当** 系统生成安装来源摘要
**则** 摘要会显示 source type 为 `bundled`，canonical tree 来自 package 内 `assets/source/speclite/`，并展示 display-safe resolved root
**并且** 不会隐式访问未声明的远程 source。

**前提** 用户选择自定义来源
**当** 系统收集 source 输入
**则** 系统会记录 requested source、requested version 或 requested channel
**并且** 在解析前展示 external access intent 和需要确认的原因。

**前提** source resolution 完成
**当** 系统生成 install summary 或 `install --json` 输出
**则** 输出包含 source type、channel、requested version、resolved version 或可展示的 source label
**并且** 不泄露 credential-bearing URL、home directory 或本机 absolute source path。

**前提** 用户尚未确认来源摘要
**当** 系统准备进入 install planning
**则** 不得访问未确认的外部 source 或下载额外资源
**并且** 不得写入任何项目文件。

**前提** 来源选择或 channel 输入不合法
**当** 系统无法继续 source resolution
**则** 命令输出明确失败原因和建议下一步
**并且** 使用稳定 `source-integrity` issue category 或对应 command-level diagnostic。

## Story 5.2: Registry Source Resolution And Diagnostics（Registry 来源解析与诊断）

作为项目维护者，
我希望 SpecLite 能从 npm public registry 或 private registry 解析安装来源，
以便在标准环境或企业内网环境中获得可诊断、可记录、可验证的 registry source。

**验收标准：**

**前提** 用户选择 npm public registry source
**当** 系统执行 source resolution
**则** 系统会解析 package name、requested version 或 channel，并得到 resolved version
**并且** 记录 registry integrity 或 version-lock evidence。

**前提** 用户选择 private registry source
**当** 系统执行 source resolution
**则** 系统会使用用户显式配置的 registry/channel 信息
**并且** public output 中不得泄露 token、credential-bearing URL 或 private query string。

**前提** registry source 成功解析
**当** 系统生成 SourceDescriptor
**则** descriptor 会包含 source type、package、resolved version、integrity evidence 和 trust status
**并且** npm public/private registry source 不会因为来源类型本身自动成为 `trusted`。

**前提** registry integrity 或 expected lock match 验证成功
**当** 系统计算 trust status
**则** source 可以标记为 `trusted`
**并且** 信任结论必须来自 expected hash 或 lock match，而不是 registry 类型。

**前提** registry source 可解析但没有信任锚
**当** source 仍满足最小 integrity evidence 要求
**则** source 可以标记为 `unverified`
**并且** 只有在用户显式选择并确认该 source 后才能进入 install planning。

**前提** registry 不可达、认证失败或 package/version 不存在
**当** source resolution 失败
**则** 系统会报告稳定 `source-integrity` issue id，例如 registry unreachable 或 authentication required
**并且** credentials 与 credential-bearing URLs 必须 redacted。

**前提** validate 检查已安装 registry source descriptor
**当** 本地 manifest 中已有 source descriptor
**则** validate 只检查 descriptor 和 integrity evidence shape
**并且** 不重新访问 registry 或执行 remote freshness check。

## Story 5.3: Local Tarball, Offline Bundle And Local Path Integrity（本地包、离线包与本地路径完整性）

作为项目维护者，
我希望 SpecLite 能从 local tarball、offline bundle 或 local path 安装，并记录可复现的完整性证据，
以便在离线、受限网络或内部交付场景中安全验证安装来源。

**验收标准：**

**前提** 用户选择 local tarball source
**当** 系统执行 source resolution
**则** 系统会验证 tarball 可读取并记录包文件 artifact hash
**并且** public output 不泄露本机 absolute source path。

**前提** 用户选择 offline bundle source
**当** 系统执行 source resolution
**则** 系统会验证 bundle 可读取并记录 offline bundle artifact hash
**并且** 不在 public JSON、manifest/index 或 fixture snapshot 中暴露临时解包目录。

**前提** 用户选择 local path source
**当** 系统计算 local source snapshot hash
**则** hash 只覆盖 canonical source tree allowlist
**并且** 排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。

**前提** 用户选择 local path source
**当** 该 path 指向目标项目的 installed state、IDE mirrors、workflow output、dependency/cache/build 目录
**则** source 必须被标记为 `blocked`
**并且** 不得把 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output 当作 canonical source root。

**前提** tarball 或 offline bundle 被解包用于安装规划
**当** 系统需要记录 expected installed state 输入
**则** 可以额外记录解包后的 canonical source tree hash
**并且** 不得与 artifact `contentHash` 混用或把 cache/extraction directory hash 当成 source evidence。

**前提** local tarball、offline bundle 或 local path source 缺少 integrity evidence
**当** source resolution 结束
**则** source 必须被标记为 `blocked`
**并且** 命令输出 `source-integrity` error 并阻止写入。

**前提** local tarball、offline bundle 或 local path source 有可复现 evidence 但没有 expected hash 或 lock match
**当** 系统计算 trust status
**则** source 可以标记为 `unverified`
**并且** 只有用户显式选择并确认后才能进入 install planning。

**前提** source staging 或临时解包过程中发生失败
**当** 命令输出诊断结果
**则** issue 使用稳定 `source-integrity` issue id，例如 tarball unreadable 或 offline bundle unreadable
**并且** cache path、temporary extraction path 和本机 absolute path 必须 redacted。

## Story 5.4: Git Source Pinning And Floating Source Rejection（Git 来源固定与浮动来源拒绝）

作为项目维护者，
我希望从 Git source 安装 SpecLite 时必须固定到具体 commit SHA，
以便安装结果可复现，并避免 branch、tag 或 remote URL 浮动导致不可审查的安装状态。

**验收标准：**

**前提** 用户选择 Git source
**当** 系统执行 source resolution
**则** 系统会解析 remote、requested ref 和 resolved commit SHA
**并且** 只有 resolved commit SHA 存在时才允许进入 install planning。

**前提** 用户只提供 remote URL、branch 或 tag
**当** 系统无法固定到具体 commit SHA
**则** source 必须被标记为 `blocked`
**并且** 不得进入 install planning 或写入步骤。

**前提** Git source 成功解析到 commit SHA
**当** 系统生成 integrity evidence
**则** evidence 至少包含 `git-commit` 记录
**并且** requested branch、tag 或输入 ref 不得覆盖 resolved version 或 commit evidence。

**前提** Git source 解析需要访问远程 source
**当** 系统准备执行 external access
**则** external access intent 必须在 source resolution plan 中显式声明
**并且** 用户未确认前不得访问未声明 remote。

**前提** Git remote 不可达、认证失败或 ref 无法解析
**当** source resolution 失败
**则** 系统会输出稳定 `source-integrity` issue
**并且** redacted output 不泄露 credential-bearing URL、token 或 private query string。

**前提** Git source 已写入 manifest 的 source descriptor
**当** 后续运行 `speclite validate`
**则** validate 只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline
**并且** 不访问 Git remote 或重新验证 freshness/provenance。

**前提** Git source 没有 expected hash 或 lock match
**当** resolved commit SHA evidence 可复现且无 mismatch
**则** source 可以是 `unverified`
**并且** 不得自动标记为 `trusted`。

## Story 5.5: SourceDescriptor Trust Status And Redacted Reporting（SourceDescriptor 信任状态与脱敏报告）

作为项目维护者，
我希望所有安装来源都被归一为稳定的 SourceDescriptor，并以脱敏方式报告 trust status 和 integrity evidence，
以便团队能审查安装来源是否可信，同时不会泄露凭据、本机路径或临时实现细节。

**验收标准：**

**前提** source resolution 成功
**当** 系统生成 SourceDescriptor
**则** descriptor 会包含 source type、channel、resolved version 或 display-safe source label、integrityEvidence 和 trustStatus
**并且** source/channel/version 信息可在 install summary、status 和 validate 中可见。

**前提** source 通过 expected hash 或 lock match 验证
**当** 系统计算 trustStatus
**则** trustStatus 可以是 `trusted`
**并且** bundled source 的 packaging manifest / package hash / package lock match 视为等价 trust anchor
**并且** MVP 不提供通用 trusted source allowlist schema。

**前提** source 缺少信任锚但具备可复现 integrity evidence
**当** 用户显式选择并确认该 source
**则** trustStatus 可以是 `unverified`
**并且** evidence 中的 `verified: false` 只表示未被 expected hash 或 lock match 背书，不表示校验失败。

**前提** source 存在 hash mismatch、lock mismatch、unsupported source 或 source policy 拒绝
**当** 系统计算 trustStatus
**则** trustStatus 必须是 `blocked`
**并且** install/update 不得继续写入步骤。

**前提** public JSON、manifest/index、issues 或 fixture snapshot 需要展示 source 信息
**当** 系统渲染 source descriptor 或 diagnostics
**则** credential、credential-bearing URL、private query string、home directory、本机 absolute source path、cache path、temporary extraction path 和临时 Git checkout path 必须 redacted
**并且** source staging 和 package-manager cache path 不进入 public contract。

**前提** validate 读取已安装 SourceDescriptor
**当** 检查 source integrity 状态
**则** validate 只检查本地 descriptor、integrity evidence shape 与 installed state 是否一致
**并且** 不重新访问远程 source 或执行 provenance revalidation。

**前提** source descriptor 字段语义需要被 PRD、Architecture、Manifest/index 或 CommandResult 引用
**当** 文档或实现描述该对象
**则** 必须引用 source-descriptor owning SPEC 作为字段与语义真源
**并且** 不在多个文件中定义第二套 trust/evidence 规则。
