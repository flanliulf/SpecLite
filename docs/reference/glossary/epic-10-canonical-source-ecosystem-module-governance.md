# Epic 10: Canonical Source Ecosystem Module Governance Glossary（Canonical Source 生态模块治理术语表）

本文解释 Epic 10「Canonical Source Ecosystem Module Governance」中的英文组合术语，帮助用户和维护者理解 ecosystem taxonomy、两级选择、selected-only projection、authoring contract 与 release gate。

> Note: 本文解释的是 Epic 10 规划文档中的术语语义。Epic 10 的 planning artifact 是历史计划基线；术语定义不代表可以重新执行已完成 Story，也不代表新增范围已获 implementation authorization。

## Ecosystem Governance Foundations（生态治理基础）

| Term | 中文直译 | Definition |
|---|---|---|
| **canonical source ecosystem governance** | Canonical Source 生态模块治理 | 在 `assets/source/speclite/` 内分层管理通用 SDLC 方法论和特定技术生态扩展的规则体系。 |
| **ecosystem module** | 生态模块 | 面向某一稳定技术生态提供额外 Skill 的 optional module，依赖 `sdlc` 但不默认安装。 |
| **generic SDLC Skill** | 通用SDLC技能 | 跨技术栈适用的规划、架构、实现、测试或发布 Skill，继续归属 `sdlc-skills/`。 |
| **ecosystem-specific Skill** | 生态专属 Skill | 明确依赖 React、Vue、Java/Spring Boot、Node.js、Python 等项目事实的 Skill。 |
| **ecosystem source taxonomy** | 生态来源分类体系 | 使用 `ecosystems/<category>/<id>/` 表达技术生态类别和具体生态身份的 canonical 目录分类。 |
| **extension module layer** | 扩展模块层 | 位于 required `core` 和 default-selected `sdlc` 之外、按需安装的 module 层。 |
| **signal quality** | 信号质量 | Installed runtime 只保留与目标项目相关的 Skill，减少无关技术栈入口带来的噪声。 |
| **incremental ecosystem growth** | 增量生态增长 | 先建立 taxonomy 和首批闭环，后续生态通过独立变更逐步加入，而不是一次补齐全部矩阵。 |

## Source Taxonomy And Identity（源分类与身份）

| Term | 中文直译 | Definition |
|---|---|---|
| **ecosystem source root** | 生态来源根目录 | `assets/source/speclite/ecosystems/<category>/<id>/` 形式的 module root。 |
| **ecosystem category** | 生态类别 | 初始固定为 `frontend`、`backend`、`other` 的一级分类。 |
| **ecosystem ID** | 生态ID | Category 内表示具体生态的稳定 ID，例如 `react`、`nodejs` 或 `java-springboot`。 |
| **flat stable module code** | 扁平稳定 Module Code | `ecosystem-<category>-<id>` 形式的全局 module identity，不把目录分隔符写进 code。 |
| **module kind** | 模块类型 | `module.yaml` 中声明 module 类型的字段；ecosystem module 使用 `module_kind: ecosystem`。 |
| **required dependency** | 必需依赖项 | 选择某 module 时必须自动包含的依赖；ecosystem modules 声明 `required_dependencies: [sdlc]`。 |
| **default selected** | 默认选中 | 无交互默认安装是否自动选择 module；ecosystem module 必须为 `false`。 |
| **required module** | 必需模块 | 无论用户选择如何都必须安装的 module；`core` 是 required，ecosystem 不是。 |
| **optional but recommended** | 可选但推荐 | Interactive install 强烈建议用户选择相关生态，但 skip 仍是合法路径。 |
| **module source directory** | 模块来源目录 | `OfficialModule.sourceDirectory` 保存的稳定 POSIX relative path，例如 `ecosystems/backend/nodejs`。 |

## Module Discovery And Validation（Module 发现与验证）

| Term | 中文直译 | Definition |
|---|---|---|
| **official module discovery** | 官方模块发现 | Installer 从 bundled canonical source 中发现并解析可安装 module roots。 |
| **top-level module** | 顶级模块 | `core-skills/`、`sdlc-skills/` 等 source root 第一层 module。 |
| **nested ecosystem module** | 嵌套生态模块 | 位于 `ecosystems/<category>/<id>/` 的分层 module。 |
| **deterministic nested discovery** | 确定性嵌套发现 | 同时发现 top-level 和 nested modules，并使用稳定排序而非 filesystem order。 |
| **module metadata validation** | 模块元数据验证 | 检查 kind、category、ID、dependencies、required/default-selected 和 module code 是否匹配。 |
| **duplicate module code** | 重复模块代码 | 两个 module roots 声明同一 module code，必须 fail fast。 |
| **duplicate canonical Skill ID** | 重复规范Skill ID | 不同 package roots 使用同一 Skill identity，必须阻断 discovery。 |
| **unknown dependency** | 未知依赖 | `required_dependencies` 引用不存在或不允许的 module。 |
| **missing module-help reference** | 缺失 Module Help 引用 | Canonical package root 没有对应 help row，必须由 source check 或 validation 暴露。 |
| **fail fast** | 快速失败 | Metadata 或 identity 不一致时立即停止，不把不合法 module 带入 install selection。 |

## Guided Ecosystem Selection（引导式生态选择）

| Term | 中文直译 | Definition |
|---|---|---|
| **guided selected install** | 引导式选择安装 | Interactive install 通过 category → ecosystem ID 两级选择，只安装用户明确选择的 modules。 |
| **two-level selection** | 两级选择 | 第一级选择 `frontend`/`backend`/`other`/skip，第二级只展示所选 category 的 IDs。 |
| **category selection** | 类别选择 | 用户先选择技术生态大类的交互步骤。 |
| **ecosystem recommendation** | 生态模块推荐 | 当 `sdlc` 被选择时，提示用户可增加匹配项目技术栈的 ecosystem module。 |
| **skip path** | 跳过路径 | 用户不选择任何 ecosystem module 的合法分支。 |
| **exact module code selection** | 精确模块代码选择 | CLI/programmatic caller 直接使用 `ecosystem-<category>-<id>` 选择 module。 |
| **invalid module selection** | 无效模块选择 | 用户输入未知 category、ecosystem ID 或 module code 时产生的稳定错误。 |
| **no-prompt default** | 无提示默认选择 | `--yes`、`--json` 或默认无 selector 安装只选择既有 `core` + `sdlc`，不自动选择 ecosystem。 |
| **dependency auto-inclusion** | 依赖自动包含 | 用户选择 ecosystem 后自动加入 `sdlc`，再由 `sdlc` dependency 加入 `core`。 |

## Selected-Only Projection And Backend Migration（选择性投影与后端迁移）

| Term | 中文直译 | Definition |
|---|---|---|
| **selected-only projection** | 选择性投影 | IDE mirrors、indexes、phase coverage、config 和 summary 只包含 selected modules。 |
| **selected module truth** | 已选模块真相 | Manifest 中实际 selected modules 是 validate、status、update、repair 和 uninstall 判断 installed state 的依据。 |
| **unselected leakage** | 未选中泄漏 | 未选择 ecosystem 的 Skill、help row、phase row 或 file entry 错误进入 target project。 |
| **cross-category leakage** | 跨类别泄漏 | 选择 frontend module 却安装 backend/other package 等跨类别污染。 |
| **negative assertion** | 负向断言 | Fixture 明确证明某个未选择 module 或跨 category package 不存在。 |
| **selected module count** | 选中模块计数 | Ready Summary 中根据实际 selected modules 计算的数量，不包含 source tree 中未选择 modules。 |
| **installed-state truth** | 安装状态真相 | Target project 当前 manifest、indexes 和 selected packages，而不是 bundled source 中全部可用内容。 |
| **repair non-expansion** | 修复非扩展 | Repair 不能因为 bundled source 新增可选 ecosystem 就自动补装未选择 package。 |
| **default baseline** | 默认基线 | 特定版本默认 `core+sdlc` 安装的 snapshot/count，只描述默认 case，不是所有 installs 的全局预期。 |
| **global package-count fallacy** | 全局包数谬误 | 把 default baseline 固定数量误用为 selected ecosystem installs 的全局真相。 |
| **initial backend migration** | 首批后端迁移 | 将 Java/Spring Boot、Node.js 和 Python 技术栈专属 Skills 从 `sdlc` 迁入对应 backend modules 的首批闭环。 |
| **generic backend Skill** | 通用后端技能 | 不绑定具体语言/framework 的 backend 方法论能力，默认仍留在 `sdlc`。 |
| **source path migration** | 来源路径迁移 | Canonical package 从 `sdlc-skills/` 移到 ecosystem root，同时记录变更并保持 package identity/behavior。 |
| **runtime behavior unchanged** | 运行时行为不变 | Migration 只改变 canonical ownership 和 selected install 边界，不改变 activation 或 artifact contract。 |
| **minimum selected-only proof** | 最小选择性投影证明 | 至少证明一个 selected backend module 被安装、另一个 unselected module 不安装且 default baseline 不变。 |
| **full matrix handoff** | 全矩阵移交 | 将 backend/frontend/other 全矩阵 fixtures、fixed-count 泛化和 packaging/docs 闭环交给后续 Stories。 |

## Ecosystem Authoring And Support Skills（生态创作与支撑 Skill）

| Term | 中文直译 | Definition |
|---|---|---|
| **ecosystem authoring contract** | 生态创作契约 | 定义 module root、metadata、naming、Skill layout、module-help、version、changelog、lint 和 release checks 的维护规则。 |
| **creator routing** | Creator 路由 | `speclite-skill-creator` 把 ecosystem Workflow Skill 生成到正确 category/ID module root。 |
| **ecosystem target** | 生态系统目标 | Creator 中选择的 `ecosystems/<category>/<id>/` 目标，而不是 external project path。 |
| **Agent creator boundary** | Agent Creator 边界 | Persona Agent package 仍由专用 Agent creator 创建，普通 Workflow creator 不生成。 |
| **ecosystem lint** | 生态 Lint | 校验 category、ID、module code、YAML、version、mirror、density、help row 和 changelog 的规则集。 |
| **directory/metadata parity** | 目录与元数据一致性 | Directory category/ID 与 `module.yaml` fields、module code 必须相互一致。 |
| **module-help coverage** | Module Help 覆盖 | 每个 canonical package root 至少有一条非 `_meta` help row。 |
| **help-row identity** | 帮助行标识 | Help row 使用稳定 Skill ID、display name、phase、action/menu、output location 和 artifact type。 |
| **version parity** | 版本一致性 | `SKILL.md`、`SKILL.en.md`、metadata 和 changelog 对版本与变更保持一致。 |
| **migration rationale** | 迁移理由 | 移动既有 Skill 时记录为什么属于该生态、默认 baseline 影响和 runtime behavior 是否变化。 |
| **canonical source change check** | 规范来源变更检查 | 扫描 nested package roots、module-help drift、stale docs counts 和 packaging drift 的维护门禁。 |
| **warning-only guardrail** | 警告型防护栏 | Canonical source hook 提醒维护者检查影响，但不能替代完整 release verification。 |
| **support-skills** | 支撑 Skills | Skill creator、lint、Agent creator 和 canonical source checker 等维护者工具的 source area。 |
| **maintainer-only Skill** | 维护者专属Skill | 用于维护 SpecLite canonical source、默认不投影到 target project runtime 的 Skill。 |
| **default runtime exclusion** | 默认运行时排除 | Support Skills 不因 source 中存在就进入 default selected modules 或 IDE mirrors。 |
| **authoring workflow** | 创作工作流 | Creator → metadata/help update → lint/source check → fixtures → build/tests → packaging 的维护顺序。 |

## Frontend Ecosystem Terms（前端生态术语）

| Term | 中文直译 | Definition |
|---|---|---|
| **frontend ecosystem module** | 前端生态模块 | 面向 React、Vue 等前端项目事实提供特定方法论 Skill 的 optional module。 |
| **React ecosystem** | React 生态 | 以 React component、hooks、routing、state、testing 或 migration evidence 为对象的 module。 |
| **Vue ecosystem** | Vue 生态 | 以 Vue Composition API、SFC、routing、state、testing 或 migration evidence 为对象的 module。 |
| **ecosystem specificity** | 生态特异性 | Skill 必须读取目标项目文件、lockfile 或官方资料来证明框架相关性，不能只复制通用 SDLC 文案。 |
| **version non-assumption** | 版本不假设 | 不凭空猜测 React/Vue version 或 API，必须从项目或权威资料取证。 |
| **frontend isolation** | 前端隔离 | 选择 React 时不安装 Vue、backend 或 other modules，反之亦然。 |
| **generic workflow retention** | 通用 Workflow 保留 | UX、PRD、Architecture、Story 和 Code Review 等通用 Workflows 继续留在 `sdlc`。 |

## Other Ecosystem Terms（Other 生态术语）

| Term | 中文直译 | Definition |
|---|---|---|
| **other category** | Other 类别 | 只承载无法归入 frontend/backend 且具有稳定项目形态的生态，不是杂项目录。 |
| **strict admission rule** | 严格准入规则 | 新 other ID 必须说明 why-not-frontend、why-not-backend、项目事实、安装价值和 selected-only evidence。 |
| **npm-package ecosystem** | npm 包生态 | 围绕 `package.json`、publish metadata、tarball/`npx`、package surface 和 release gate 的项目形态。 |
| **CLI-tool ecosystem** | 命令行工具生态 | 围绕 bin entry、command surface、TTY/non-TTY、exit code、JSON contract 和 shell portability 的项目形态。 |
| **documentation-only ecosystem** | 纯文档项目生态 | 围绕 `docs/`、README、Diataxis、link integrity 和 public docs source 的项目形态。 |
| **dumping-ground drift** | 杂项目录漂移 | 使用 `misc`、`general`、`tools` 等无边界 ID，把无法分类内容随意放入 other。 |
| **companion Skill** | 配套 Skill | 在不迁移通用 `sdlc` Workflow 的前提下，为特定项目形态添加补充能力。 |
| **wrapper guidance** | 包装式指引 | 用 ecosystem-specific 指引包装或调用通用 Workflow，而不复制或破坏其核心职责。 |
| **explicit migration policy** | 显式迁移策略 | 若确需迁移既有 SDLC Skill，必须记录 rationale、baseline impact、docs/fixture 更新和负向断言。 |

## Fixture And Release Generalization（Fixture 与发布泛化）

| Term | 中文直译 | Definition |
|---|---|---|
| **ecosystem fixture matrix** | 生态 Fixture 矩阵 | 至少覆盖 default、selected backend、selected frontend 和 selected other 的 fixture cases。 |
| **within-category negative assertion** | 同类别负向断言 | 选择同 category 的一个 ecosystem 时，证明其他未选 IDs 不出现。 |
| **cross-category negative assertion** | 跨类别负向断言 | 证明其他 categories 的 modules 不进入 installed projection。 |
| **derived expected count** | 派生期望数量 | 根据 selected module package roots 计算 expected entries，而不是使用固定全局 count。 |
| **nested ecosystem source check** | 嵌套生态系统来源检查 | Canonical checker 能统计每个 nested module、package root 和 module-help coverage。 |
| **stale docs count** | 过时文档数量 | Docs 中已过时的固定 core/sdlc/total package 数量表述。 |
| **ecosystem packaging coverage** | 生态系统打包覆盖率 | Packaging manifest 证明 `assets/source/speclite/ecosystems/**` 已进入 bundled source。 |
| **fixture packaging boundary** | Fixture 打包边界 | Ecosystem source 必须打包，但 `test/fixtures/` 和 generated fixture output 仍排除。 |
| **serial release gate** | 串行发布门禁 | Build、focused tests/fixtures 和 packaging check 按顺序执行，不并发读写 `dist/`。 |
| **build-first** | 先构建 | Release verification 先生成最新 runtime/assets。 |
| **packaging-last** | 最后执行打包检查 | 最后验证最终 package inventory，防止 stale manifest 或并发污染。 |

## Documentation And Completion（文档与完成边界）

| Term | 中文直译 | Definition |
|---|---|---|
| **ecosystem selection guidance** | 生态系统选择指南 | User docs 说明 interactive mode 如何选择生态，以及默认安装不会自动选择。 |
| **selected-only runtime documentation** | 选择性投影 Runtime 文档 | Runtime layout 明确 mirrors 和 indexes 只包含 selected modules。 |
| **ecosystem authoring guidance** | 生态系统编写指南 | Maintainer docs 说明 taxonomy、metadata、creator/lint、fixtures 和 release workflow。 |
| **project dependency installer confusion** | 项目依赖安装器混淆 | 把 SpecLite ecosystem module 误解为会安装 React、Vue、Java 或 npm dependencies。 |
| **methodology extension** | 方法论扩展 | Ecosystem module 提供的是额外方法论和 Skill，不是 package manager 或 framework installer。 |
| **docs navigation closure** | 文档导航闭环 | Ecosystem docs 能从 public indexes 被发现，README、Quick Start 和 reference 互不矛盾。 |
| **stale-expression scan** | 过时表达式扫描 | 搜索 only core+sdlc、fixed total 和 selected-only contradictions 等过时文案。 |
| **deferred documentation risk** | 延期文档风险 | 暂未修正但已明确记录 owner 和后续动作的 docs inconsistency。 |
| **historical planning baseline** | 历史规划基线 | 保留已完成 Epic/Story 的 identity、tracker 和 evidence，不按编号重新执行。 |
| **historical scope decomposition** | 历史范围拆分 | 将 Story 10.1 分成 taxonomy、selection、migration、projection 四个独立 evidence domains。 |
| **completion gate** | 完成门禁 | Epic 10 只有在 taxonomy、selection、projection、migration、docs、fixtures 和 release checks 全部有证据时才完成。 |
| **future maintenance dependency** | 未来维护依赖 | 后续 Story 只依赖所需历史验收域，不要求重放整个 Story 10.1。 |
| **new-scope rule** | 新范围规则 | 任一验收域出现新的未实现范围时，创建独立 Story，不把已完成 Story 改回 `ready-for-dev`。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **generic SDLC Skill vs. ecosystem-specific Skill** | 前者跨技术栈复用；后者围绕特定 framework/language 项目事实。 |
| **optional but recommended vs. mandatory** | Installer 可以强烈建议生态选择，但用户合法 skip，默认路径不自动选择。 |
| **source availability vs. installed selection** | Source tree 中可用不代表 target project 已安装；manifest selected modules 才是 installed truth。 |
| **default baseline vs. global count** | Default baseline 只描述特定默认 fixture；selected ecosystem installs 的 count 必须单独推导。 |
| **other category vs. miscellaneous bucket** | Other 需要稳定项目形态和准入证据，不接纳无边界 `misc/general/tools`。 |
| **support Skill vs. installable ecosystem module** | Support Skill 供维护 canonical source；ecosystem module 供 target project 用户选择安装。 |
| **ecosystem module vs. dependency installer** | Ecosystem module 安装 SpecLite Skills，不安装 React、Vue、Java 或 package dependencies。 |
| **canonical source check vs. release verification** | Source check 是 guardrail；完整 release 仍需 build、tests、fixtures 和 packaging。 |
| **historical evidence domain vs. active backlog** | Evidence domain 用于定位既有验证；新实施范围必须进入新的 change-controlled Story。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| Canonical source 布局 | [`../canonical-source-layout.md`](../canonical-source-layout.md) |
| Canonical source 治理 | [`../canonical-source-governance.md`](../canonical-source-governance.md) |
| SpecLite modules 解释 | [`../../explanation/speclite-modules.md`](../../explanation/speclite-modules.md) |
| Runtime layout | [`../runtime-layout.md`](../runtime-layout.md) |
| Skill catalogs | [`../skills/index.md`](../skills/index.md) |
