# Epic 9: Installed Runtime Activation Contract Hardening Glossary（已安装 Runtime 激活契约收口术语表）

本文解释 Epic 9「Installed Runtime Activation Contract Hardening」中的英文组合术语，帮助维护者理解 Node CLI resolver、activation preflight、Python compatibility assets 与 Skill-local `data/` projection 的边界。

> Note: 本文解释的是 Epic 9 规划文档中的术语语义，不表示相应 Story 已经实施或通过验证。命令、path、field、artifact kind 和 diagnostic 保留英文。

## Runtime Activation Contract（Runtime 激活契约）

| Term | 中文直译 | Definition |
|---|---|---|
| **installed runtime activation contract** | 已安装 Runtime 激活契约 | Installed Skill 在 target project 中启动时，如何检查 CLI、读取 merged config/customization 和加载本地资源的统一约定。 |
| **activation contract hardening** | 激活契约收口 | 清除 legacy resolver、单文件 config 读取和 source checkout 依赖，让全部 canonical Skills 遵守同一 installed runtime 入口。 |
| **default resolver entry** | 默认解析入口 | 所有 installed Skill 默认调用的唯一解析入口：`speclite resolve`。 |
| **Node CLI resolver** | Node CLI 解析器 | 由 Node/TypeScript CLI 实现的 `resolve config`、`resolve customization`、`resolve artifact-roots` 和 `resolve artifact-documents` commands。 |
| **merged runtime config** | 合并运行时配置 | 按 config precedence 合并 base、user、team custom 和 user custom 后的最终项目配置。 |
| **merged customization** | 合并自定义设置 | 按 Skill defaults、team custom 和 user custom 合并后的最终 persona 或 Workflow 设置。 |
| **explicit project root** | 显式项目根目录 | 每次 resolve 调用都显式传入的 `--project-root`，避免依赖当前工作目录猜测 target project。 |
| **Skill root** | Skill 根目录 | 当前 installed Skill package 的根目录，通过 `--skill` 提供给 customization resolver。 |
| **source-independent activation** | 不依赖来源的激活 | Skill 只依赖 installed package、target project runtime 和公开 CLI，不读取 source checkout 或 package cache。 |
| **Node-only default** | 仅 Node 默认 | Normal activation 只使用 Node CLI；Python scripts 即使存在，也不能成为 fallback。 |

## CLI Availability Preflight（CLI 可用性预检）

| Term | 中文直译 | Definition |
|---|---|---|
| **CLI availability preflight** | 命令行可用性预检 | Skill 调用 resolve 前，使用 `command -v speclite` 或等价方式确认当前 AI session 能执行 CLI。 |
| **AI session PATH** | AI会话路径 | 当前 Agent shell 查找 executable 的环境路径；CLI 已安装但不在此 PATH 中仍视为 unavailable。 |
| **CLI unavailable** | CLI 不可用 | 当前 AI session 无法执行 `speclite` 的阻断状态，Skill 必须 halt 并给出 remediation。 |
| **activation halt** | 激活停止 | 前置条件不满足时停止 Skill 激活，不继续菜单、Workflow 或 artifact 写入。 |
| **remediation** | 补救措施 | 让用户在当前 AI session 暴露或安装 Node CLI 的明确处理建议。 |
| **fallback prohibition** | 禁止回退 | CLI unavailable 时不得调用 Python resolver、手写 TOML merge、读取 source checkout 或误报 config field 缺失。 |
| **preflight false diagnosis** | 预检误诊 | 未读取 merged config 就把 user name、language 等已存在字段误报为缺失。 |

## Resolver Machine Contract（Resolver 机器契约）

| Term | 中文直译 | Definition |
|---|---|---|
| **stdout pure JSON** | 标准输出纯JSON | Resolve 默认成功结果只写 stdout JSON，不混入 human prose。 |
| **stderr JSON Lines** | 标准错误JSON行 | Resolve diagnostics 逐行以 JSON object 写入 stderr。 |
| **missing-key behavior** | 缺失键行为 | 缺失 single key 默认返回 `{}` 并 exit 0；repeated keys 中缺失项被省略。 |
| **optional-layer warning** | 可选层警告 | Optional TOML layer 读取/解析失败时在 stderr 报 warning，但没有 error/critical 时仍可成功。 |
| **required-layer failure** | 必需层失败 | Required layer 失败时 resolve 返回非 0，并保持约定 stdout/stderr shape。 |
| **merge-order preservation** | 合并顺序保留 | Epic 9 只迁移 activation caller，不改变 Story 2.4 已定义的 merge semantics。 |
| **`--human` opt-in** | `--human` 显式启用 | Human-readable resolve output 只有显式请求时启用；Skill activation 默认消费 machine JSON。 |
| **second resolver prohibition** | 禁止第二套解析器 | 不新增 wrapper daemon、IDE-specific resolver 或另一套 TOML merge 实现。 |

## Canonical Corpus Migration（Canonical Corpus 迁移）

| Term | 中文直译 | Definition |
|---|---|---|
| **canonical activation migration** | 规范激活迁移 | 将 Agent/Workflow `SKILL.md` 和 activation references 从 legacy path 迁移到 `speclite resolve`。 |
| **full canonical corpus** | 完整规范语料库 | Canonical persona Agents、customization-capable Workflows、completion references 和 installed mirrors 的完整检查范围。 |
| **corpus regression gate** | 语料回归门禁 | Release 前扫描全部相关 canonical/installed Skill text，发现 legacy resolver dependency 时失败。 |
| **negative corpus scan** | 负向语料扫描 | 搜索禁止表达，例如 `resolve_config.py`、单文件 `_speclite/config.toml` runtime read 或 source checkout fallback。 |
| **persona Agent inventory** | Persona Agent 清单 | 具有明确 Agent activation block、必须执行 config/customization preflight 的 canonical Agent 集合。 |
| **support-side Agent package** | 支撑侧 Agent 包 | 位于 `support-skills/`、名称可能带 `agent` 但不一定是 persona Agent 的维护工具；应进入 inventory，但不能被误判迁移对象。 |
| **Workflow completion reference** | Workflow 完成引用 | `workflow.on_complete` 等 Workflow terminal step 对 customization 的解析引用。 |
| **fresh-install expected Skill** | Fresh install 预期 Skill | Fixture 预计投影到 IDE mirrors 的 installed Skill package，用于验证 source 和 installed contract 一致。 |
| **legacy resolver dependency** | 遗留解析依赖 | Activation text、runtime entry、help 或 docs 把 Python script 当作默认 resolver。 |
| **single-file config dependency** | 单文件配置依赖 | Skill 只读取 `_speclite/config.toml`、忽略 user/custom layers 的错误模式。 |

## Merged Config Regression（合并配置回归）

| Term | 中文直译 | Definition |
|---|---|---|
| **Alice / NOI regression** | Alice / NOI 回归 | 模拟 Agent 在 base config 缺字段、user config 有字段时，必须读取 merged values 并继续激活的回归场景。 |
| **config preflight** | 配置预检 | Agent 菜单前读取 `core.user_name`、`communication_language` 和 `document_output_language` 等必要配置。 |
| **merged-field precedence** | 合并字段优先级 | 字段存在于 user/custom layer 时，以 resolver merged output 为准，不能要求用户复制到 base config。 |
| **config example boundary** | 配置示例边界 | `config.toml.example` 只说明字段结构，不能作为 runtime fallback 或真实项目配置。 |
| **optional persistent fact** | 可选持久事实 | `project-context.md` 等 glob 没有匹配时视为无事实可加载，不阻断 Agent menu。 |
| **menu continuation** | 菜单续行 | Preflight 成功后继续渲染 persona Agent menu，而不是因错误配置判断停止。 |

## Python Compatibility Assets（Python 兼容资产）

| Term | 中文直译 | Definition |
|---|---|---|
| **compatibility asset** | 兼容资产 | 为迁移、排障或旧环境保留的文件，不属于正常 activation 默认路径。 |
| **runtime-compat-script** | 运行时兼容脚本 | Python resolver script 在 manifest/files index 中建议使用的 artifact kind。 |
| **legacy Python resolver** | 遗留Python解析器 | `resolve_config.py`、`resolve_customization.py` 等历史解析脚本。 |
| **compatibility asset projection** | 兼容资产投影 | Fresh install 可将 approved scripts 投影到 `_speclite/scripts/`，同时记录 ownership、sourceRef 和 hash。 |
| **approved compatibility path** | 已批准兼容路径 | Files index 已明确标为 compatibility asset 的 Python script path；仅因存在不能报告 legacy dependency。 |
| **legacy activation reference** | 遗留激活引用 | Skill、manifest runtime entry、help 或 docs 把 compatibility script 当作默认 resolver 的违规引用。 |
| **compatibility classification** | 兼容性分类 | Packaging manifest、files index 和 docs 一致声明该 asset 的非默认职责。 |
| **troubleshooting asset** | 排障资产 | 仅供维护者排障或迁移使用的兼容文件，正常用户文档不应建议在 activation 中调用。 |
| **packaged source asset** | 已打包来源资产 | Python script 作为 bundled canonical source 文件进入 npm package，不代表它是默认 runtime dependency。 |

## Compatibility Asset Lifecycle（兼容资产生命周期）

| Term | 中文直译 | Definition |
|---|---|---|
| **ownership metadata** | 所有权元数据 | Files index 对 compatibility script 记录 `installer-owned`、artifact kind、sourceRef、hash 和 executable intent。 |
| **mode drift** | 模式漂移 | Installed script 的 executable/file mode 与 expected intent 不一致。 |
| **sourceRef drift** | 来源引用漂移 | Installed asset 的 source reference 与 canonical projection 不一致。 |
| **normal update semantics** | 常规更新语义 | 普通 update 对 drift 保持 planned change/conflict 规则，不因 asset 是兼容脚本而绕过保护。 |
| **explicit repair semantics** | 显式修复语义 | `update --repair` 只在 ownership 和 source/hash evidence 充分时恢复 installer-owned compatibility scripts。 |
| **uninstall eligibility** | 可卸载性 | Uninstall 可以移除 installer-owned compatibility scripts，但不触碰 human/workflow-owned 内容。 |
| **packaging inventory assertion** | 打包清单断言 | Release gate 验证 scripts 存在且 classification 为 compatibility，而不是 default resolver。 |

## Skill-Local Data Projection（Skill 本地 Data 投影）

| Term | 中文直译 | Definition |
|---|---|---|
| **Skill-local `data/`** | Skill 本地 data | Canonical Skill package 根下的结构化 CSV/JSON 查表资源，运行时通过 `{skill-root}/data/` 读取。 |
| **installed data projection** | 已安装数据投影 | 将 root-level `data/` regular files 递归复制到 `.claude/skills/<id>/data/` 和 `.agents/skills/<id>/data/`。 |
| **self-contained data dependency** | 自包含数据依赖 | Installed Workflow 所需查表数据与 Skill package 一起安装，不回到 source checkout 查找。 |
| **root-level `data/`** | 根级 data 目录 | 与 `SKILL.md` 同级的 `data/` directory，属于 installed package surface。 |
| **`references/data/`** | 引用数据目录 | References 目录内的数据资源，继续由 existing `references/` copy surface 覆盖，不能与 root-level data 混淆。 |
| **regular file recursion** | 普通文件递归复制 | 按原 relative path 递归复制 `data/` 内普通文件，不生成 placeholder。 |
| **raw-byte preservation** | 原始字节保存 | Data file 复制时保持原始 bytes，不进行格式或 line-ending 改写。 |
| **source-only `SKILL.en.md`** | 仅源侧 SKILL.en.md | Canonical source 中不属于 installed projection 的英文 mirror；纳入 data surface 不改变其排除规则。 |
| **adapter-owned placeholder data** | Adapter 所有的占位 data | Adapter 为补缺而生成虚假 data file 的反模式。 |

## Copy And Hash Surface Equality（复制与 Hash 面一致性）

| Term | 中文直译 | Definition |
|---|---|---|
| **copy predicate** | 复制判定规则 | 决定 canonical package 中哪些 files 被复制到 installed entry 的规则。 |
| **package-hash predicate** | 包哈希判定规则 | 决定哪些 files 进入 `canonicalPackageHash` 的规则。 |
| **validation predicate** | 验证判定规则 | 决定 validate 扫描哪些 installed files 来比较 package hash 的规则。 |
| **predicate semantic equality** | 判定规则语义一致 | Copy、hash 和 validation 三个 predicates 对 `data/` 使用相同 include 语义。 |
| **canonicalPackageHash parity** | 规范包哈希一致性 | 同一 Skill 在 `.claude` 与 `.agents` mirrors 中包含相同 files，因此 package hash 一致。 |
| **hash mismatch false positive** | 哈希不匹配误报 | Copy 和 validation surfaces 不一致导致健康 package 被误报 `ide-mirror.hash-mismatch`。 |
| **duplicate-entry detection** | 重复项检测 | 检查同一 canonical identity 是否在 mirror 中出现冲突 entry，data files 不能被漏扫。 |
| **source baseline prohibition** | 禁止使用来源基线 | Validate 不能扫描 source checkout 补齐 installed baseline，否则会掩盖缺失 data。 |

## Fixtures And Update Boundaries（Fixture 与更新边界）

| Term | 中文直译 | Definition |
|---|---|---|
| **data-dependent Workflow regression** | 依赖 data 的 Workflow 回归 | 验证 create/validate PRD 等 Skills 能从 installed root 读取必需 CSV 的测试。 |
| **installed-tree refresh** | 已安装树刷新 | Package surface 变化后，从真实 install semantics 更新 expected installed tree。 |
| **files-index refresh** | 文件索引刷新 | Data files 进入 installed projection 后同步更新 expected files index。 |
| **package-hash refresh** | 包哈希刷新 | Installed package contents 变化后依据真实 hash predicate 更新 expected hashes。 |
| **fixture change policy** | Fixture 变更策略 | 先更新 owning contract/parser/predicate，再刷新 snapshots。 |
| **unrelated fixture drift** | 无关 Fixture 漂移 | 与当前 Story 无关的 baseline 差异；必须记录为 scope blocker，不能混入本次修改。 |
| **missing data planned update** | 缺失 data 的计划更新 | Existing install 缺少新纳入 data files 时，按 selected package installer-owned content 进入 update plan。 |
| **data repair eligibility** | 数据修复资格 | Data file drift 只有在 ownership 和 canonical hash evidence 充分时才可显式 repair。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **installed CLI unavailable vs. missing config field** | 前者是 PATH/preflight 问题；后者只有在 merged resolver output 确实缺值时才成立。 |
| **Node CLI resolver vs. Python compatibility asset** | Node CLI 是唯一默认 activation entry；Python scripts 仅用于兼容或排障。 |
| **script presence vs. script dependency** | Approved script 可以存在；Skill 把它当默认 resolver 才是违规。 |
| **base config vs. merged runtime config** | Base config 只是一个 layer；activation 必须使用所有 layers 合并后的结果。 |
| **root-level `data/` vs. `references/data/`** | 前者是独立 installed data surface；后者跟随 references copy rules。 |
| **copy surface vs. hash surface** | Copy 决定安装什么；hash/validation 必须覆盖完全相同的 installed content。 |
| **packaged source asset vs. default runtime support** | 文件进入 npm package 不代表正常 Skill activation 应调用它。 |
| **fixture refresh vs. baseline acceptance** | Refresh 必须由 contract change 证明；不能因为 snapshot 失败就直接接受新 baseline。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| Runtime 边界解释 | [`../../../explanation/runtime-boundaries.md`](../../../explanation/runtime-boundaries.md) |
| 配置与 customization | [`../../config-and-customization.md`](../../config-and-customization.md) |
| IDE discovery 术语 | [`../ide-discovery.md`](../ide-discovery.md) |
| Runtime layout | [`../../runtime-layout.md`](../../runtime-layout.md) |
| Skill 使用指南 | [`../../../how-to/use-installed-skills.md`](../../../how-to/use-installed-skills.md) |
