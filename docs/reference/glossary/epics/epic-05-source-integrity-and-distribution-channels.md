# Epic 5: Source Integrity And Distribution Channels Glossary（来源完整性与分发渠道术语表）

本文解释 Epic 5「Source Integrity And Distribution Channels」中的英文组合术语，帮助维护者理解 bundled、registry、tarball、offline bundle、Git 和 local path 来源如何被解析、固定、校验和脱敏报告。

> Note: 本文解释的是 Epic 5 规划文档中的术语语义，不表示相应 Story 已经实施或通过验证。Source type、字段、trust status、evidence type 和 issue id 保留英文。

## Source Selection（来源选择）

| Term | 中文直译 | Definition |
|---|---|---|
| **distribution channel** | 分发渠道 | SpecLite package 到达目标项目的分发途径，例如 bundled、npm registry、offline bundle 或 Git。 |
| **source selection** | 来源选择 | 用户在安装规划前明确选择 source type、version 或 channel 的过程。 |
| **bundled source** | 内置来源 | 随当前 npm package 分发的默认 canonical source，位于 `assets/source/speclite/`。 |
| **npm public registry** | npm 公共注册表 | 公开 npm registry 中的 package 来源。来源类型公开不代表内容自动 trusted。 |
| **private registry** | 私有注册表 | 需要企业地址或认证配置的 package registry；public output 必须隐藏 credential 和 private query。 |
| **local tarball** | 本地 tar 包 | 本机可读取的 package archive，其压缩包本体需要 artifact hash。 |
| **offline bundle** | 离线包 | 为离线或受限网络环境准备的分发包，需要记录 bundle artifact hash。 |
| **Git source** | Git 来源 | 由 Git remote 和 ref 定位、最终必须固定到具体 commit SHA 的来源。 |
| **local path source** | 本地路径来源 | 本机目录中的 canonical source tree，只允许对明确 allowlist 内容计算 snapshot hash。 |
| **source type** | 来源类型 | `SourceDescriptor` 中区分 bundled、registry、tarball、bundle、Git 或 local path 的稳定分类。 |
| **channel** | 渠道 | 用户请求的 release stream 或 distribution label，例如 stable、tag 或组织内部 channel。 |
| **requested version** | 请求版本 | 用户在解析前提出的版本约束或标签。 |
| **resolved version** | 已解析版本 | Source resolution 后实际选定、可被记录和复现的具体版本。 |

## Source Resolution（来源解析）

| Term | 中文直译 | Definition |
|---|---|---|
| **source resolution** | 来源解析 | 把 requested source、version 或 channel 解析成具体 source tree、version 和 integrity evidence 的过程。 |
| **requested source** | 请求来源 | 用户输入的 package、registry、archive、Git remote 或 local path 描述。 |
| **resolved root** | 已解析根目录 | Source resolution 后供 install planning 读取的 canonical source tree 根目录。Public output 只展示 display-safe form。 |
| **source label** | 来源标签 | 不暴露 credential 或 absolute path、但足以让人识别来源的显示名称。 |
| **external access intent** | 外部访问意图 | 命令在访问 registry 或 Git remote 前声明将访问什么外部资源及原因。 |
| **declared external access** | 声明的外部访问 | 只执行已在 plan 中展示并获用户确认的外部访问。 |
| **source staging** | 来源暂存 | 将下载或解包内容放入临时区域、供 integrity check 和 install planning 使用的过程。 |
| **temporary extraction path** | 临时解压路径 | 解包 tarball/bundle 的临时目录；它是实现细节，不能进入 public contract。 |
| **remote freshness check** | 远程时效性检查 | 访问远程 source 判断是否有更新的操作；普通本地 validate 不执行。 |
| **provenance revalidation** | 来源追溯再验证 | 重新访问来源以确认发布者或来源链的操作；Epic 5 规定 installed-state validate 不隐式执行。 |

## SourceDescriptor（来源描述对象）

| Term | 中文直译 | Definition |
|---|---|---|
| **SourceDescriptor** | 来源描述符 | 归一描述 source type、channel、version、display label、integrity evidence 和 trust status 的结构化对象。 |
| **source descriptor projection** | 来源描述符投影 | 将 resolved SourceDescriptor 写入 install summary、manifest/index、status 或 validate output。 |
| **owning source truth** | 来源权威真源 | 定义 SourceDescriptor 字段和值域的唯一 SPEC，其他文档和 command 只能引用。 |
| **display-safe value** | 显示安全值 | 已去除 token、credential、home directory、absolute local path 和临时目录的公开字段值。 |
| **source-integrity category** | 来源完整性类别 | Source 不可读取、evidence 缺失、hash mismatch 或 policy 拒绝等问题的稳定 validation category。 |

## Integrity Evidence（完整性证据）

| Term | 中文直译 | Definition |
|---|---|---|
| **integrity evidence** | 完整性证据 | 证明 resolved source 内容可以被识别和复现的 hash、lock match 或 Git commit 记录。 |
| **trust anchor** | 信任锚点 | 能把当前 evidence 与预期来源绑定的证据，例如 expected hash、lock match 或 bundled packaging lock。 |
| **expected hash** | 预期哈希值 | 事先可信地获得、用于比较实际 source 或 artifact hash 的值。 |
| **lock match** | 锁定值匹配 | 当前 package/version/hash 与受控 lock 记录一致。 |
| **registry integrity** | Registry 完整性 | Registry 提供的 package integrity 值，用于证明下载内容，但仍需结合 trust anchor 判断 trusted。 |
| **artifact hash** | 产物哈希 | 对 tarball 或 offline bundle 文件本体计算的 hash。 |
| **canonical source tree hash** | 规范来源树哈希 | 对解包后或 local path 中的 canonical tree allowlist 计算的 hash。 |
| **snapshot hash** | 快照哈希 | 对选定 source tree 内容按稳定规则生成的可复现整体 hash。 |
| **contentHash** | 内容哈希 | Artifact 内容自身的 hash 字段，不能与 source tree hash 或 extraction directory hash 混用。 |
| **integrity mismatch** | 完整性不符 | 实际 hash 或 lock 证据与 expected value 不一致，source 必须进入 blocked 状态。 |
| **evidence shape validation** | 证据结构验证 | 本地 validate 检查 SourceDescriptor 和 evidence 字段结构是否有效，而不访问远程 source。 |

## Trust Status（信任状态）

| Term | 中文直译 | Definition |
|---|---|---|
| **trust status** | 信任状态 | `SourceDescriptor.trustStatus` 对来源可信程度的结构化结论。 |
| **trusted** | 可信 | Source 通过 expected hash、lock match 或等价 bundled trust anchor 验证。来源类型本身不能单独产生 trusted 结论。 |
| **unverified** | 未验证 | Source 有可复现 integrity evidence，但没有 expected hash 或 lock match 背书；必须由用户显式选择和确认。 |
| **blocked** | 已阻断 | Source 缺失 evidence、发生 mismatch、使用 unsupported/floating source 或违反 policy，install/update 不能继续写入。 |
| **`verified: false`** | 未获信任锚验证 | 表示 evidence 尚未被 trust anchor 背书，不等于 integrity check 已失败。 |
| **source policy rejection** | 来源策略拒绝 | 来源不满足允许类型、固定方式或边界规则而被拒绝。 |
| **trusted source allowlist** | 可信来源白名单 | 预先允许某些来源自动 trusted 的通用 schema；Epic 5 的 MVP 不提供此能力。 |

## Registry Sources（Registry 来源）

| Term | 中文直译 | Definition |
|---|---|---|
| **registry resolution** | Registry 来源解析 | 根据 package name、requested version/channel 和 registry config 获得 resolved version 与 integrity。 |
| **registry unreachable** | 注册表不可达 | Registry 网络不可达的稳定 source-integrity diagnostic。 |
| **authentication required** | 需要认证 | Private registry 缺少或拒绝认证时的 diagnostic，输出必须 redacted。 |
| **credential-bearing URL** | 含凭据 URL | URL 中含 token、用户名密码或敏感 query 的地址，禁止进入 public output。 |
| **private query string** | 私有查询字符串 | Registry 或 Git URL 中可能携带组织、认证或签名信息的 query，必须脱敏。 |
| **package/version not found** | 包/版本未找到 | Requested package 或版本不存在、无法形成 resolved source 的失败状态。 |

## Local And Offline Sources（本地与离线来源）

| Term | 中文直译 | Definition |
|---|---|---|
| **canonical tree allowlist** | 规范树白名单 | Local path snapshot 只纳入已定义 canonical source directories/files 的规则。 |
| **source exclusion set** | 来源排除集 | `.git`、`node_modules`、cache、build output、fixture output、临时文件和 editor/OS metadata 等不参与 source hash 的内容。 |
| **installed-state source rejection** | 已安装状态来源拒绝 | 禁止把目标项目中的 `_speclite`、IDE mirrors 或 `_speclite-output` 反向当作 canonical source。 |
| **cache path** | 缓存路径 | Package manager 或 resolver 的本地缓存位置，属于实现细节，不进入 public JSON 或 manifest。 |
| **offline reproducibility** | 离线可重复性 | 不访问网络，仅凭 bundle/tarball 和其 integrity evidence 可以重复形成相同 install input。 |
| **tarball unreadable** | tar包不可读 | Local tarball 无法读取或解析时的 source-integrity failure。 |
| **offline bundle unreadable** | 离线包不可读 | Offline bundle 无法读取或解析时的 source-integrity failure。 |

## Git Source Pinning（Git 来源固定）

| Term | 中文直译 | Definition |
|---|---|---|
| **Git source pinning** | Git 来源固定 | 将 requested ref 解析并固定到不可变 commit SHA，使安装输入可复现。 |
| **floating source** | 浮动来源 | 只由 branch、tag 或 remote URL 表达、会随时间指向不同内容的来源。 |
| **floating-source rejection** | 浮动来源拒绝 | 无法解析到具体 commit SHA 时把 Git source 标记 blocked，并阻止 install planning。 |
| **requested ref** | 请求 Ref | 用户输入的 branch、tag 或 commit-like reference。 |
| **resolved commit SHA** | 已解析 Commit SHA | Resolver 实际获得的不可变 Git commit identity。 |
| **git-commit evidence** | Git提交证据 | Integrity evidence 中记录 resolved commit SHA 的条目。 |
| **temporary Git checkout** | 临时Git检出 | 为读取 source 创建的临时 working tree；其路径不得进入 public contract。 |

## Redacted Reporting（脱敏报告）

| Term | 中文直译 | Definition |
|---|---|---|
| **redaction** | 脱敏 | 在保留诊断价值的同时删除或替换 credential、private URL、home directory 和机器相关 path。 |
| **redacted diagnostic** | 脱敏诊断 | Issue ID 和原因仍稳定可读，但敏感 source details 已被清除的诊断。 |
| **public contract boundary** | 公开契约边界 | 规定哪些 source 字段可以进入 JSON、manifest/index、issue 和 fixture，哪些只能留在内部实现。 |
| **credential leakage** | 凭据泄露 | Token、认证 URL 或 private query 被输出到 log、JSON 或 fixture 的安全问题。 |
| **path leakage** | 路径泄露 | Home directory、absolute source path、cache 或 temporary extraction path 被写入公开输出。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **integrity evidence vs. trust anchor** | Evidence 让内容可识别；trust anchor 证明该内容与预期可信来源一致。 |
| **trusted vs. unverified** | Trusted 有 expected hash/lock 背书；unverified 只有可复现 evidence，仍需用户确认。 |
| **unverified vs. blocked** | Unverified 可以在明确确认后继续；blocked 禁止进入写入阶段。 |
| **artifact hash vs. source tree hash** | 前者校验 archive/bundle 文件；后者校验其中 canonical tree 内容。 |
| **requested version vs. resolved version** | Requested 是用户约束；resolved 是最终实际采用的具体版本。 |
| **branch/tag vs. commit SHA** | Branch/tag 会移动；commit SHA 是不可变的 Git 内容身份。 |
| **local validation vs. remote freshness** | Local validation 只检查 installed descriptor/evidence；freshness 需要外部访问，不能隐式发生。 |
| **source path vs. display-safe label** | Source path 可能包含敏感本机信息；display label 只保留人类识别所需内容。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 安装指南 | [`../../how-to/install-speclite.md`](../../how-to/install-speclite.md) |
| 更新与修复指南 | [`../../how-to/update-and-repair.md`](../../how-to/update-and-repair.md) |
| Runtime 边界术语 | [`runtime-boundaries.md`](runtime-boundaries.md) |
| Validation issues | [`../validation-issues.md`](../validation-issues.md) |
| Canonical source 布局 | [`../canonical-source-layout.md`](../canonical-source-layout.md) |
