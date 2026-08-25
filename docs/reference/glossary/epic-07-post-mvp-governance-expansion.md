# Epic 7: Post-MVP Governance Expansion Glossary（Post-MVP 治理扩展术语表）

本文解释 Epic 7「Post-MVP Governance Expansion」中的英文组合术语，帮助团队理解未来的 hook enforcement、doctor/sync/uninstall、CI integration、governance report 和 init/list 如何在不改变 MVP contract 的前提下扩展。

> Note: Epic 7 是 Post-MVP backlog。本文只解释规划语义，不表示这些能力已经成为 MVP release gate、已经发布或已获当前 implementation authorization。

## MVP And Post-MVP Boundaries（MVP 与 Post-MVP 边界）

| Term | 中文直译 | Definition |
|---|---|---|
| **Post-MVP backlog** | MVP 后待办清单 | MVP 之后才考虑实施的能力清单，不进入当前 MVP sprint backlog 或 readiness gate。 |
| **MVP contract boundary** | MVP 契约边界 | Post-MVP 能消费但不能破坏的稳定基础，包括 `CommandResult`、manifest/index、fixtures 和 owning SPEC。 |
| **MVP guard** | MVP 边界保护 | 防止未来能力被提前当作 MVP requirement、release gate 或完成条件的范围约束。 |
| **compatible extension** | 兼容扩展 | 在保留既有字段和语义的前提下，为新 command 增加 owning SPEC、data payload 和 fixtures。 |
| **command owning SPEC** | 命令权威 SPEC | 定义某个 command 的输入、data payload、status、issue 和写入边界的唯一规范。 |
| **change-controlled Story** | 变更受控 Story | 新产品范围通过独立 Story ID、gate 和状态进入实施，而不是重开已完成历史 Story。 |
| **historical evidence mapping** | 历史证据映射 | 将已完成 Story 按独立产品域整理证据，不把整理动作当作重新实施。 |

## Flow Gate Hook Enforcement（Flow Gate Hook 强制执行）

| Term | 中文直译 | Definition |
|---|---|---|
| **Flow Gate** | 流程门禁 | 在进入下一执行阶段前检查必需证据和结果的 Workflow gate。 |
| **story-kickoff gate** | Story 启动门禁 | `speclite-dev-story` 开始实现前必须具备的 Story 级 gate evidence。 |
| **hook enforcement** | Hook强制执行 | 由 IDE execution plane 的 project hook 强制检查 gate，而不只依赖 Skill 文案提醒。 |
| **hook source root** | Hook 来源根目录 | Canonical source 中独立保存 hook definition、runner 和 metadata 的目录。 |
| **installer-managed hook artifact** | Installer 管理的 Hook 产物 | Installer 写入或安全合并到 target project 的 hook config、runner 或 source metadata。 |
| **execution-plane projection** | 执行平面投影 | 将 canonical hook source 投影到 Claude、Codex 等实际拦截 prompt/command 的项目配置。 |
| **hook runner** | Hook运行器 | 在 Skill intent 执行前读取 gate metadata、判断是否放行的程序。 |
| **gate evidence** | 门禁证据 | Gate report 中可验证 mode、target、result 和 freshness 的机器可读事实。 |
| **PASS_EQUIVALENT** | 等价通过 | 与 `PASS` 具有同等放行语义、但来源或表达不同的 contract result。 |
| **stale gate metadata** | 过期门禁元数据 | Gate report 存在但已过期或不再匹配当前 Story target，不能用于放行。 |
| **machine-readable gate metadata** | 机器可读门禁元数据 | YAML frontmatter 或 sidecar JSON 中的稳定 gate fields，hook 不解析自由 Markdown prose。 |
| **source-to-installed-to-runtime chain** | 来源 → 安装态 → 运行时链路 | Hook source、installer projection 和运行时实际 enforcement 之间的全链路证据。 |
| **hook review/trust boundary** | Hook审查/信任边界 | 用户在 Codex/Claude 中审查和信任 project hook 的安全边界，必须在安装摘要或文档中说明。 |

## Doctor, Sync And Uninstall（Doctor、Sync 与 Uninstall）

| Term | 中文直译 | Definition |
|---|---|---|
| **doctor diagnostics** | Doctor 诊断 | 比 validate 更深入地检查 environment、source、permission、IDE target、manifest、path 和 file integrity。 |
| **external access plan** | 外部访问计划 | Doctor 访问 remote source 或执行 freshness/provenance 检查前展示并等待授权的计划。 |
| **ExternalAccess** | 外部访问 | Install-plan contract 中表达外部访问目标、原因和授权状态的结构化项。 |
| **local-only validation boundary** | 本地验证边界 | MVP `validate` 不访问远程 source；Post-MVP doctor 的外部检查不能改变该边界。 |
| **source-to-mirror reconciliation** | 来源到镜像协调 | `speclite sync` 显式比较并协调 canonical/resolved source 与 IDE mirrors。 |
| **sync command** | 同步命令 | 复用 manifest/index、files index、ownership/hash 和 adapter registry 的 Post-MVP 同步命令。 |
| **update/repair semantic preservation** | 更新/修复语义保留 | Sync 不改变普通 update 的 conflict 规则或 repair eligibility。 |
| **ownership-safe uninstall** | 所有权安全卸载 | `speclite uninstall` 只移除 installer-owned 内容，保留或提示处理 human/workflow-owned 文件。 |
| **uninstall plan** | 卸载计划 | 删除发生前展示 removable、preserved 和 manual-action paths 的计划。 |
| **partial command failure** | 部分命令失败 | New command 只完成部分步骤时，必须输出 completed、failed、pending 和 manual action。 |

## CI And Enterprise Automation（CI 与企业自动化）

| Term | 中文直译 | Definition |
|---|---|---|
| **CI integration** | CI 集成 | Continuous Integration pipeline 通过稳定 JSON 和 exit code 自动检查 SpecLite 状态。 |
| **enterprise automation** | 企业自动化 | 组织内部平台消费 SpecLite command data、issue 和 artifacts 的集成。 |
| **machine-readable contract** | 机器可读契约 | Automation 依赖的 `CommandResult` schema、data fields、issue semantics 和 path rules。 |
| **health assertion** | 健康断言 | CI 读取 `status.data.highLevelHealth` 判断安装状态，而不是把空 issues 当作健康。 |
| **validation assertion** | 验证断言 | CI 读取 issueCounts、checked categories/targets 和 paths 判断 validation outcome。 |
| **plan/apply distinction** | 计划/应用区别 | Automation 区分 update 的 unapplied plan 与实际 apply result。 |
| **blocking conflict** | 阻塞冲突 | 计划中禁止普通授权继续执行的 conflict。 |
| **private status model** | 私有状态模型 | 企业系统自行创造并与 `CommandResult` 冲突的状态语义，是 Epic 7 明确避免的反模式。 |
| **schema-compatible payload** | Schema 兼容载荷 | 通过 `schemaVersion`、parser 和 fixtures 管理、不会破坏 `speclite.command-result.v1` 的 command-specific data。 |
| **automation-safe path** | 自动化安全路径 | Project-relative POSIX path，不泄露 credential、home、cache 或 temporary extraction details。 |

## Governance Coverage Report（治理覆盖报告）

| Term | 中文直译 | Definition |
|---|---|---|
| **process governance coverage report** | 流程治理覆盖报告 | 基于 installed state、phase coverage、artifact contract 和 validation result 计算流程落地情况的 Post-MVP 报告。 |
| **phase entry coverage rate** | 阶段入口覆盖率 | 关键研发阶段中具有 mapped Skill entry 的比例。 |
| **standard artifact presence rate** | 标准产物存在率 | Contract 要求的标准 artifact 中，路径存在且 metadata 合法的比例。 |
| **validation pass rate** | 验证通过率 | 选定项目或检查范围内 validate 通过的比例。 |
| **unresolved gap count** | 未解决缺口数 | 缺失 phase entry、artifact 或仍未解决 issue 的数量。 |
| **governance gap** | 治理缺口 | 某个阶段没有 mapped entry、标准 artifact 缺失或 validation 未通过的可定位缺口。 |
| **coverage metric** | 覆盖指标 | 由 manifest/index、phase coverage 和 validation evidence 推导的结构化指标。 |
| **content-quality exclusion** | 内容质量排除 | 自动 coverage 不把文档叙事质量或人工评审结论当作客观存在率指标。 |
| **multi-project view** | 多项目视图 | 在多个项目间汇总 coverage 和 trend 的未来扩展，仍需建立在 MVP contract 上。 |
| **governance report artifact** | 治理报告产物 | 保存 coverage metrics、gaps 和 evidence references 的报告产物。 |

## Init And List Commands（Init 与 List 命令）

| Term | 中文直译 | Definition |
|---|---|---|
| **project config init** | 项目配置初始化 | `speclite init` 创建或重建项目级 installer config 入口的 Post-MVP 能力。 |
| **config rebuild** | 配置重建 | 基于 existing manifest、config 和 ownership 重新形成 installer-owned config 的显式计划。 |
| **list command** | 列表命令 | `speclite list` 从 manifest/index、source metadata 或 adapter registry 列出 module、Skill、IDE target 或 version。 |
| **identity reuse** | 身份复用 | List 直接使用 canonical Skill 和 IDE target identity，不定义第二套名称体系。 |
| **read-only listing** | 只读列表 | List 只读取和展示 inventory，不修改 target project。 |
| **public payload extension** | 公开载荷扩展 | Init/list 新增 JSON fields 前先定义 owning SPEC、schema/parser 和 expected fixtures。 |

## Cross-Cutting Safety（横切安全）

| Term | 中文直译 | Definition |
|---|---|---|
| **plan-before-write** | 写前计划 | Doctor、sync、uninstall 或 init 需要写入时，先展示影响再请求授权。 |
| **project operation lock** | 项目操作锁 | 所有 Post-MVP write-capable command 复用的项目级互斥锁。 |
| **safe write** | 安全写入 | 写入命令复用 MVP 的 temp-write、path boundary 和 partial-failure 保护。 |
| **ownership preservation** | 所有权保留 | New commands 继续保护 human-owned custom 和 workflow-owned artifacts。 |
| **redaction preservation** | 脱敏保持 | New reports 和 integrations 继续隐藏 credential、home directory、cache 和 temporary path。 |
| **identity preservation** | 身份保持 | New commands 不创造第二套 Skill identity、IDE target identity 或 artifact identity。 |
| **issue-model reuse** | 问题模型复用 | Doctor 和 governance report 复用或兼容扩展 `ValidationIssue`，不创建企业私有 taxonomy。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **MVP contract vs. Post-MVP capability** | MVP contract 是已建立的兼容基础；Post-MVP capability 是未来消费该基础的扩展。 |
| **Flow Gate report vs. hook enforcement** | Report 记录 gate result；hook 在执行前读取结果并决定是否放行。 |
| **validate vs. doctor** | Validate 保持本地、确定性检查；doctor 可以在授权后执行更深或远程诊断。 |
| **update/repair vs. sync** | Update/repair 管理 installer-owned installed state；sync 是显式 source-to-mirror reconciliation。 |
| **uninstall vs. project cleanup** | Uninstall 只移除 installer-owned 内容，不承诺删除 human/workflow-owned 项目文件。 |
| **status success vs. healthy install** | Command 成功只表示读取完成；CI 仍需检查 `highLevelHealth`。 |
| **coverage rate vs. content quality** | Coverage 计算 entry、artifact 和 issue facts；内容质量需要人工或专门 Workflow 评审。 |
| **historical decomposition vs. implementation authorization** | 历史证据分类不等于获准重新实施或扩展命令。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| Flow Gate handoff 术语 | [`flow-gate-handoff.md`](flow-gate-handoff.md) |
| CI 与企业自动化 | [`../../how-to/ci-enterprise-automation.md`](../../how-to/ci-enterprise-automation.md) |
| 治理报告操作指南 | [`../../how-to/process-governance-report.md`](../../how-to/process-governance-report.md) |
| CommandResult 参考 | [`../command-result-json.md`](../command-result-json.md) |
| 文件所有权术语 | [`file-ownership.md`](file-ownership.md) |
