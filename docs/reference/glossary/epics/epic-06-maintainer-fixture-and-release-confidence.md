# Epic 6: Maintainer Fixture And Release Confidence Glossary（维护者 Fixture 与发布信心术语表）

本文解释 Epic 6「Maintainer Fixture And Release Confidence」中的英文组合术语，帮助维护者理解 fixture contract、release gate、path portability、packaging acceptance 和 Skill artifact loop 如何形成发布证据。

> Note: 本文解释的是 Epic 6 规划文档中的术语语义，不表示相应 Story 已经实施或通过验证。Fixture ID、字段、命令、path 和 assertion 名称保留英文。

## Fixture Foundations（Fixture 基础）

| Term | 中文直译 | Definition |
|---|---|---|
| **fixture project** | Fixture 项目 | 为可重复测试安装、更新、验证或 Skill 执行而准备的最小目标项目。 |
| **fixture case** | Fixture 用例 | 具有独立 input、expected outputs 和 assertions 的单一测试场景。 |
| **fixture case layout** | Fixture 用例布局 | Fixture input、expected state、command output 和 metadata 在目录中的稳定组织方式。 |
| **fixture contract** | Fixture 契约 | 规定 case ID、目录布局、输入、expected output 类型、比较规则和分类的 owning contract。 |
| **lower-kebab case ID** | 小写连字符ID | 由小写单词和连字符组成的稳定 case 名，例如 `fresh-install-empty-project`。 |
| **fixture input** | Fixture 输入 | 执行测试前提供的 config、source、installed state、文件树或环境条件。 |
| **expected output** | 预期输出 | 按 contract 预先声明的文件树、snapshot、command result 或 validation assertion。 |
| **expected file tree** | 预期文件树 | Fixture 执行后预期存在的相对路径清单。 |
| **expected manifest/index snapshot** | 预期清单/索引快照 | 对 manifest、skill/help/files indexes 等 installed projection 的稳定预期快照。 |
| **expected command output** | 预期命令输出 | Command human/JSON output 中需要被断言的稳定字段与语义。 |
| **validation assertion** | 验证断言 | 对 issue、category、severity、path、metadata 或状态的明确检查。 |
| **fixture registry** | Fixture 注册表 | 注册 case、sub-case、variant 和其 release/regression 分类的结构化清单。 |

## Stable Comparison（稳定比较）

| Term | 中文直译 | Definition |
|---|---|---|
| **stable comparison** | 稳定比较 | 排除 contract 允许变化的字段后，对相同输入得到的结果进行可重复比较。 |
| **snapshot normalization** | 快照归一化 | 比较前按 schema 规则处理 timestamp 等允许变化的值，但不掩盖 required field 缺失。 |
| **timestamp exclusion** | 时间戳排除 | Schema 明确允许某个时间值不参与相等比较；字段本身和格式仍需验证。 |
| **project-relative path snapshot** | 项目相对路径快照 | Snapshot 中只记录相对于 fixture project 的 POSIX path，不包含 home directory 或 checkout root。 |
| **non-deterministic field** | 非确定性字段 | Timestamp、random ID、wall-clock duration 或环境文本等可能每次变化的字段。 |
| **stable ordering** | 稳定排序 | 列表、issue、path 和 index entries 使用 contract-defined order，不依赖 filesystem traversal。 |
| **profile fixture** | Profile 测试夹具 | 覆盖 Compact、Evidence 或 Structured presentation 的代表性 expected output。 |
| **layout-independent assertion** | 布局无关断言 | Terminal width 改变布局时仍检查 severity、issue ID、path 和 next action 等核心语义。 |
| **key-value fallback** | 键值回退 | 窄终端无法安全展示 table 时使用的逐项文本布局。 |
| **contract-first snapshot update** | 契约优先快照更新 | 行为变化时先更新 owning SPEC 和 executable parser/schema，再刷新 expected snapshots。 |

## Fixture Gates（Fixture 门禁）

| Term | 中文直译 | Definition |
|---|---|---|
| **fixture gate** | Fixture 门禁 | 必须通过的一组 fixture cases，用来证明某项 release contract 没有回归。 |
| **release gate fixture** | 发布门禁 Fixture | 直接参与发布决策、失败会阻止 release 的 fixture。 |
| **regression asset** | 回归资产 | 用于定位历史 bug 或扩展边界的测试资产，不一定单独构成 release blocker。 |
| **fresh-install-empty-project** | 全新安装空项目 | 从空项目执行 fresh install，并验证 runtime、artifact root、indexes、IDE mirrors 和 ReadyCheck 的基线 case。 |
| **existing-install-update** | 现有安装更新 | 从已有安装执行 update，验证 installer-owned 更新及 human/workflow-owned 保护的 case。 |
| **full canonical package projection** | 完整规范包投影 | Selected modules 下每个 canonical package root 都必须进入 skill index 和 selected IDE mirrors。 |
| **baseline assertion** | 基线断言 | 对特定版本和默认选择下的预期 package count、tree 或 output 作明确检查。Baseline 不是永久全局真相。 |
| **ready-summary suppression** | 准备摘要抑制 | Fixture 失败时不得展示 ready 或 release-ready summary。 |
| **failure progression evidence** | 失败进展证据 | Failure output 中如实记录 completed、failed、pending steps 和 manual action。 |

## Drift And Source Fixtures（漂移与来源 Fixture）

| Term | 中文直译 | Definition |
|---|---|---|
| **IDE drift fixture** | IDE 漂移 Fixture | 人为修改 installed Skill package，验证 `ide-mirror` 或 `file-integrity` diagnostic 的 case。 |
| **source-integrity fixture group** | 来源完整性 Fixture 组 | 围绕 bundled、registry、Git、tarball、bundle 和 local path trust 行为的一组独立 cases。 |
| **fixture sub-case** | Fixture 子用例 | 同一能力域下具有独立 input、expected JSON、issues 和 assertions 的具体场景。 |
| **fixture variant** | Fixture 变体 | 在同一 sub-case 基础上改变平台、runtime 或输入条件的注册变体。 |
| **bundled packaging trusted** | 捆绑打包信任 | Bundled source 有 packaging manifest/hash/lock evidence，因此预期 `trusted`。 |
| **missing evidence blocked** | 缺失证据阻断 | 缺少所需 integrity evidence，来源必须 blocked 的负向 case。 |
| **registry lock trusted** | 注册表锁定信任 | Registry source 与 expected hash 或 lock 匹配的正向 case。 |
| **registry unverified** | 未验证注册表 | Registry source 只有可复现 evidence、没有 trust anchor 的 case。 |
| **Git floating blocked** | Git漂移阻断 | Git source 只有 branch/tag/URL、没有 resolved commit SHA 的负向 case。 |
| **local source snapshot unverified** | 本地来源快照未验证 | Local tree hash 可复现但没有 expected hash/lock，因此保持 unverified 的 case。 |
| **local source self-reference** | 本地来源自引用 | Local source 指向 installed state、IDE mirror、artifact output、cache 或 build directory 的 blocked case。 |
| **artifact hash mismatch** | 产物哈希不符 | Archive/bundle 实际 hash 与 expected value 不一致，必须阻断 planning。 |
| **redaction assertion** | 脱敏断言 | 明确验证 output 不包含 credential、home directory、absolute path、cache 或 temporary path。 |

## Resolve Parity（解析一致性）

| Term | 中文直译 | Definition |
|---|---|---|
| **resolve parity fixture** | Resolve 一致性 Fixture | 验证 Node CLI 对 config/customization 的 merge 结果与既定 resolver baseline 一致。 |
| **config merge parity** | 配置合并一致性 | Config layer order、missing/repeated key 和 failure behavior 在实现间保持相同。 |
| **customization merge parity** | 自定义合并一致性 | Skill defaults、team/user overrides、lookup key 和 array rules 保持相同。 |
| **stdout/stderr parity** | 标准输出/错误一致性 | Resolve 结果继续写 stdout JSON，diagnostics 继续写 stderr，不因实现迁移改变。 |
| **Python resolver baseline** | Python解析器基准 | 用于对照既有 merge 语义的历史 Python 实现；它是 parity evidence，不表示默认 runtime 应依赖 Python。 |
| **input externalization** | 输入外置 | 将真实 config/customization layers 放进 fixture assets，而不是硬编码在 test helper 中。 |
| **second merge implementation** | 第二套合并实现 | Adapter、helper 或 test 自行复制 merge 逻辑的反模式，会制造新的语义真源。 |

## Path And Runtime Matrix（路径与运行时矩阵）

| Term | 中文直译 | Definition |
|---|---|---|
| **path portability** | 路径可移植性 | 相同项目在 macOS、Windows 和不同 checkout root 下产生可比较 path 和 output 的能力。 |
| **runtime matrix** | 运行时矩阵 | Release gate 覆盖的 Node.js 版本组合，例如 Node 22 minimum 与 Node 24 recommended。 |
| **minimum runtime** | 最小运行时 | 官方承诺支持的最低运行时版本，代码不得无兼容路径地使用更高版本专属 API。 |
| **recommended runtime** | 推荐运行时 | 推荐使用、但不能收窄 minimum runtime contract 的版本。 |
| **platform matrix** | 平台矩阵 | Fixture 覆盖的操作系统组合，例如 macOS 13+ 和 Windows 11。 |
| **p95 runtime baseline** | 第95百分位运行时基线 | 95% command runs 不超过的 duration 参考，用于发现性能回归，但不进入 stable JSON snapshot。 |
| **profiling sample** | 性能分析样本 | 支撑 runtime regression 判断的性能样本和上下文。 |
| **LF preservation** | 换行符保留 | Installer 复制 canonical text 时保持 LF line endings，不按平台改写内容。 |
| **executable intent** | 可执行意图 | Files index 对 script 是否应可执行的跨平台记录；Windows 不要求 POSIX chmod 相同。 |
| **shell invocation parity** | Shell 调用一致性 | 不同 shell 下 command ID、exit code、path normalization 和 JSON semantics 保持一致。 |
| **case-conflict fixture** | 大小写冲突 Fixture | 验证大小写路径冲突会被阻断的跨平台负向场景。 |
| **path-escape assertion** | 路径逃逸断言 | 不只检查 issue ID，还验证 `details.reason` 等稳定原因字段。 |

## Packaging Confidence（打包信心）

| Term | 中文直译 | Definition |
|---|---|---|
| **packaging acceptance** | 打包验收 | 对 npm package、local tarball 或 offline bundle 的文件清单和运行资产执行发布验收。 |
| **packaging check** | 打包检查 | `npm run release:packaging-check` 执行的 package inventory assertions。 |
| **packaging manifest** | 打包清单 | `dist/packaging-manifest.json` 等记录 packaged files 和 classification 的稳定 artifact。 |
| **package inventory** | 包文件清单 | 实际进入发布包的 bin、runtime、schemas、templates、scripts 和 canonical source files 清单。 |
| **build-first gate** | 构建优先门禁 | Packaging check 前必须先构建，避免对 stale `dist/` 产生假阳性。 |
| **packaging-last** | 最后执行打包检查 | Release verification 中最后运行 packaging check，确保它读取的是前序步骤产出的最终 assets。 |
| **packaged documentation example** | 打包文档示例 | 明确允许进入 package、供读者使用的 docs example；它不同于 test fixture。 |
| **fixture packaging exclusion** | Fixture 打包排除 | `test/fixtures/` 和 root `fixtures/` 默认不进入 npm package。 |
| **non-empty documentation assertion** | 非空文档断言 | Packaged docs examples 不能用空数组或缺失路径假装通过 gate。 |
| **serial release entry** | 串行发布入口 | 按固定顺序执行 build、tests 和 packaging check 的单一 release command。 |

## Skill Artifact Loop（Skill 产物闭环）

| Term | 中文直译 | Definition |
|---|---|---|
| **Skill artifact loop** | Skill 产物闭环 | 从 installed IDE entry discovery、activation、config/customization resolve 到 artifact output 和 validation 的最小闭环。 |
| **activation/artifact minimum proof** | 激活 / 产物最小证明 | 证明一个代表性 Skill 能运行并写出合法 metadata 的证据，不代表所有 canonical Skills 都已覆盖。 |
| **full Skill set assertion** | 完整技能集断言 | 对 selected modules 下完整 canonical package set 的 install、mirror 和 index coverage。 |
| **artifact metadata loop** | 产物元数据循环 | 生成并验证 `workflowType`、`sourceSkill` 和 `generatedAt` 的闭环。 |
| **documentation example from fixture** | 来自 Fixture 的文档示例 | Docs 示例直接引用或由 fixture expected output 生成，降低文档与真实 renderer 漂移。 |
| **richer regression asset** | 更丰富的回归资产 | 覆盖更多 Workflow、edge case 或内容变化的扩展测试，不替代最小 release gate。 |

## Closure And Evidence（收口与证据）

| Term | 中文直译 | Definition |
|---|---|---|
| **fixture contract hardening** | Fixture 契约收口 | 把 input、timestamp、case classification 和 path-escape assertions 从隐式 helper 规则提升为显式 contract。 |
| **multi-level case ID** | 多级用例ID | 表达 group、sub-case 和 variant 的三段式 fixture identity。 |
| **ambiguous classification** | 模糊分类 | Case 未注册或无法判断 release/regression 归属，必须失败而不能返回 undefined。 |
| **dynamic CLI gate** | 动态 CLI 门禁 | 实际运行 command 并检查 runtime output 的测试，而不是只比较静态文件。 |
| **CR TODO backlog** | CR TODO 待办清单 | Code Review 中延期问题的追踪清单，只有具备代码、fixture 和测试证据时才能关闭。 |
| **evidence-based closure** | 基于证据的关闭 | TODO 或 Story 状态只在相应实现和 verification evidence 存在后推进。 |
| **default test stability** | 默认测试稳定性 | `npm test` 在默认 timeout 和配置下可重复完成，不依赖维护者记住额外 flags。 |
| **confirmation state** | 确认状态 | Source confirmation 的 public 状态，例如 `confirmed` 或 pending/unconfirmed，正负场景需分别断言。 |
| **historical scope decomposition** | 历史范围拆分 | 为已完成 Story 按独立验收域整理历史证据，不重编号、不重开 Story，也不产生新 backlog item。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **fixture case vs. fixture variant** | Case 表达独立行为场景；variant 在同一场景上改变平台或输入条件。 |
| **release gate fixture vs. regression asset** | 前者直接阻断发布；后者用于更广的历史回归定位。 |
| **expected output vs. owning contract** | Expected output 是契约的测试投影；owning contract 才定义行为语义。 |
| **timestamp normalization vs. timestamp omission** | Normalization 允许忽略具体时间值；required timestamp 字段仍必须存在且格式正确。 |
| **package inventory vs. fixture tree** | Package inventory 是发布内容；fixture tree 是测试输入/预期，默认不打包。 |
| **Skill artifact loop vs. full canonical coverage** | Loop 证明代表性执行链可用；full coverage 证明所有 selected packages 均被投影。 |
| **historical decomposition vs. new Story** | 前者整理既有 evidence；新增产品范围必须创建 change-controlled Story。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 安装验证指南 | [`../../how-to/validate-installation.md`](../../how-to/validate-installation.md) |
| Canonical source 治理 | [`../canonical-source-governance.md`](../canonical-source-governance.md) |
| Workflow artifact 术语 | [`workflow-artifact.md`](workflow-artifact.md) |
| Runtime layout | [`../runtime-layout.md`](../runtime-layout.md) |
| CommandResult 参考 | [`../command-result-json.md`](../command-result-json.md) |
