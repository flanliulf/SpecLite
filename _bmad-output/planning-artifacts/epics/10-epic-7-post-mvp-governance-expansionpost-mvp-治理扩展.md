# Epic 7: Post-MVP Governance Expansion（Post-MVP 治理扩展）

团队后续可以在不破坏 MVP 契约的前提下扩展 Flow Gate hook enforcement、doctor/sync/uninstall、CI/企业自动化集成、规范落地覆盖报告和 init/list。本 Epic 是 Post-MVP backlog，不得进入 MVP sprint backlog 或 MVP implementation readiness gate。

MVP 只需提供稳定 `CommandResult` JSON、manifest/index、fixture 和 owning SPEC 边界，供本 Epic 未来消费；不得把本 Epic 的 hook enforcement、command、CI/enterprise integration workflow 或 governance report 作为 MVP release gate。

## Story 7.1: Flow Gate Hook Enforcement（Flow Gate Hook 强制执行）

作为 SpecLite workflow owner，
我希望 installer 把 `speclite-flow-gate` 的 `story-kickoff` gate 投射为项目级 Claude/Codex hooks，
以便 `speclite-dev-story` 在开发 Story 前不能只靠 skill 文案自觉触发 gate，而是由 execution plane 的 hook 先检查 gate evidence。

**验收标准：**

**前提** SpecLite 需要发布 hook source
**当** 维护 canonical source tree
**则** hook source 定义必须位于独立 hooks source root（推荐 `assets/source/speclite/hooks/flow-gate-enforcement/`）
**并且** 不得把 hook source 埋入 `speclite-dev-story` skill package；相关 skills 只声明被 hook 保护的关系。

**前提** 用户安装 SpecLite 到目标项目
**当** installer 生成 Claude/Codex execution-plane projection
**则** 项目级 hook 配置、hook runner 和 source metadata 必须作为 installer-managed hook artifacts 被写入或安全合并
**并且** files index 记录 sha256、executable intent、sourceRef、artifactKind 和 ownership。

**前提** 目标项目已有 `.claude` 或 `.codex` 配置
**当** installer 需要启用 hook
**则** 必须 plan-before-write、保留既有 human-owned 配置、对冲突输出 manual action
**并且** 不得静默覆盖用户已有 hooks、rules、settings 或 trust 决策。

**前提** 用户尝试触发 `speclite-dev-story`
**当** 项目级 hook 识别到开发 Story 的 prompt/command intent
**则** hook 必须读取对应 `{implementation_artifacts}/flow-gates/{story-key}-story-kickoff-gate.md` 的机器可读 metadata
**并且** 只有 `mode=story-kickoff` 且 `result=PASS` 或 `PASS_EQUIVALENT` 才允许继续。

**前提** kickoff gate 缺失、非通过、目标不匹配或 metadata 过期
**当** hook 拦截到 `speclite-dev-story` intent
**则** hook 必须阻断并给出可执行原因与下一步，例如运行 `speclite-flow-gate mode=story-kickoff target=<story-key>`
**并且** hook 本身不得生成 gate report、推进 sprint status 或修改 Story。

**前提** Flow Gate report 需要被 hook 稳定消费
**当** 更新 `speclite-flow-gate`
**则** report template 必须新增 YAML frontmatter 或 sidecar JSON metadata
**并且** hook 不得依赖 human-readable Markdown prose 解析 gate result。

**前提** hook enforcement 已进入 installed projection
**当** 更新相关 skills 与 fixtures
**则** `speclite-flow-gate`、`speclite-dev-story`、installer tests、fresh install fixtures 和 validation rules 必须覆盖 source-to-installed-to-runtime 全链路
**并且** Codex 项目 hooks 的 `/hooks` review/trust 边界必须在 install summary 或文档中明确。

## Story 7.2: Doctor, Sync And Uninstall Commands（Doctor、Sync 与 Uninstall 命令）

作为工具链维护者，
我希望 Post-MVP 提供 `speclite doctor`、`speclite sync` 和 `speclite uninstall`，
以便进行更深入环境诊断、显式同步 source 与 IDE mirrors，并安全移除 installer-owned 安装结果。

**验收标准：**

**前提** 用户运行 Post-MVP `speclite doctor`
**当** 命令执行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断
**则** 输出复用 `ValidationIssue` category、issue id、severity 和 affected path 语义
**并且** 不发明第二套诊断模型。

**前提** Post-MVP `speclite doctor` 需要访问远程 source 或执行 freshness/provenance revalidation
**当** 命令规划外部访问
**则** external access intent 必须显式展示并等待授权
**并且** external access shape 必须复用或扩展 install-plan contract 的 `SourceResolutionPlan.externalAccesses` 与 `ExternalAccess`，不得发明第二套授权模型
**并且** 不改变 MVP `validate` local-only 边界。

**前提** 用户运行 Post-MVP `speclite sync`
**当** 命令显式同步 source 与 IDE mirrors
**则** 同步行为必须复用 manifest/index、files index、ownership/hash 和 adapter registry
**并且** `sync` 是 Post-MVP source-to-mirror reconciliation，不得改变 MVP `update` / `update --repair` 的 conflict、repair eligibility 和 ownership 语义
**并且** 不修改 human-owned custom 文件或 workflow-owned artifacts。

**前提** 用户运行 Post-MVP `speclite uninstall`
**当** 命令移除安装结果
**则** 只能移除 installer-owned 文件或目录
**并且** 对 human-owned custom 文件和 workflow-owned artifacts 必须保留或提示人工处理。

**前提** Post-MVP `speclite doctor`、Post-MVP `speclite sync` 或 Post-MVP `speclite uninstall` 需要写入项目
**当** 命令进入写入阶段
**则** 必须使用 project operation lock、plan-before-write 和 safe write
**并且** 失败时输出 completed steps、failed step、pending steps 和 manual action。

**前提** Post-MVP 新命令输出 `--json`
**当** 机器可读结果被生成
**则** 复用 `CommandResult` 兼容扩展机制
**并且** command-specific `data` payload 必须先由对应 command owning SPEC 定义，再同步 `CommandResult` schema anchor 和 fixture expected outputs
**并且** 不破坏 MVP fixture 和既有 automation 依赖。

## Story 7.3: CI And Enterprise Automation Integration（CI 与企业自动化集成）

作为工具链维护者，
我希望在 Post-MVP 阶段让 CI 和企业自动化工具链消费 MVP 的机器可读输出，
以便团队可以自动检查安装健康、验证结果、更新冲突和发布门禁，而不依赖人工读取 CLI 文案。

**验收标准：**

**前提** Post-MVP CI 运行 `speclite status --json`
**当** 项目处于未安装、partial 或 failed high-level health 状态
**则** CI 可以读取 `status.data.highLevelHealth` 判断安装摘要
**并且** 不把 `issues: []` 误判为安装健康通过。

**前提** Post-MVP CI 运行 `speclite validate --json`
**当** validate 输出 issueCounts、checkedCategories、checkedTargets 和 validatedPaths
**则** 自动化可以基于稳定字段判断验证是否通过
**并且** 不依赖 human-readable output。

**前提** Post-MVP CI 运行 `speclite update --json` 或 `speclite update --repair --json`
**当** 命令输出 planned effects、changed paths、skipped paths 和 conflicts
**则** 自动化可以区分 unapplied plan、actual apply result 和 blocking conflicts
**并且** 不把 path-level conflicts 当成多个 command-level issues。

**前提** 企业工具链接入 SpecLite JSON output
**当** 需要解析 command status 和 exit code
**则** 必须遵守 MVP `CommandResult.status`、issue severity 和 exit code 推导规则
**并且** 不定义企业私有的第二套状态语义。

**前提** CI 或企业自动化需要新增字段
**当** 扩展 command-specific data payload
**则** 必须先新增或扩展对应 command owning SPEC，再通过 `CommandResult.schemaVersion`、executable schema/parser 和 fixture expected outputs 管理兼容性
**并且** 不破坏 `speclite.command-result.v1` 的既有字段语义。

**前提** 自动化记录路径或 source 信息
**当** 生成日志、报告或 artifacts
**则** 仍需遵守 project-relative POSIX path 与 redaction 策略
**并且** 不泄露 credentials、home directory、cache path 或 temporary extraction path。

## Story 7.4: Process Governance Coverage Report（流程治理覆盖报告）

作为企业规范负责人，
我希望 Post-MVP 能基于已安装状态、阶段覆盖矩阵、标准产物和 validate 结果生成流程治理覆盖报告，
以便判断 SpecLite 是否真正把 SPEC、方案评审、故事规划、实现、测试和审查规范落到团队执行过程中。

**验收标准：**

**前提** 项目已安装 SpecLite 并生成 MVP 最小阶段覆盖矩阵
**当** 系统生成 Post-MVP 流程治理覆盖报告
**则** 报告可以展示阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量
**并且** 这些指标建立在 MVP manifest/index、phase coverage 和 validate output 之上。

**前提** 某个研发阶段缺少 mapped skill entry
**当** 报告计算阶段入口覆盖
**则** 该阶段被标记为缺口
**并且** 报告显示对应 phaseId、phaseLabel、moduleId、canonicalSkillId 或缺失原因。

**前提** 某个标准过程产物缺失或 metadata 不合法
**当** 报告计算标准产物存在率
**则** 报告引用 artifact contract、artifact path 和 validation issue
**并且** 不把文档内容质量或人工评审结论作为自动覆盖率指标。

**前提** 团队需要查看趋势、导出、多项目或团队视角
**当** Post-MVP 扩展报告能力
**则** 这些能力只能在 MVP 最小阶段覆盖矩阵与 validate output 的基础上扩展
**并且** 不改变 MVP install/status/validate/update 的核心契约。

**前提** 治理报告需要机器可读输出
**当** 输出 `--json` 或报告 artifact
**则** 必须复用 `CommandResult`、`ValidationIssue` 或明确新增的 owning SPEC
**并且** 不定义第二套 issue category、skill identity 或 artifact identity。

**前提** 报告暴露团队或项目路径信息
**当** 生成 human-readable 或 machine-readable output
**则** 路径和 source 信息遵守 project-relative POSIX path 与 redaction 策略
**并且** 不泄露 credentials、home directory、cache path 或 temporary extraction path。

## Story 7.5: Project Config Init And Listing Commands（项目配置初始化与列表命令）

作为项目维护者，
我希望 Post-MVP 提供 `speclite init` 和 `speclite list`，
以便在不重新安装全部内容的情况下初始化或重建项目配置，并查看可用模块、skills、IDE targets 或版本。

**验收标准：**

**前提** 项目需要初始化或重建 SpecLite 项目级配置
**当** 用户运行 Post-MVP `speclite init`
**则** 命令可以创建或重建项目级配置入口
**并且** 不得静默覆盖 human-owned custom 文件。

**前提** 项目已有 `_speclite` 安装状态
**当** 用户运行 Post-MVP `speclite init`
**则** 命令必须读取现有 manifest、config 和 ownership 信息
**并且** 在修改 installer-owned 配置前展示 plan 和影响范围。

**前提** 用户想查看可安装模块、skills、IDE targets 或版本
**当** 用户运行 Post-MVP `speclite list`
**则** 命令会从 manifest/index、source metadata 或 adapter registry 中读取可列信息
**并且** 不定义第二套 skill identity 或 IDE target identity。

**前提** Post-MVP `speclite list` 输出机器可读结果
**当** 用户传入 `--json`
**则** 输出复用 MVP `CommandResult` envelope 和已契约化 data payload 扩展机制
**并且** 不破坏 `speclite.command-result.v1` 的既有字段语义。

**前提** Post-MVP `speclite init` 或 Post-MVP `speclite list` 需要新增 public JSON 字段
**当** 实现该字段
**则** 必须先新增或扩展对应 command owning SPEC，再更新 `CommandResult` executable schema/parser 和 fixture expected outputs
**并且** 不依赖 human-readable output 承载自动化字段。
