# Changelog（变更日志）

本文件记录 `@fancyliu/speclite` 每个已发布版本面向用户的变更。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

- 日期取自各版本发布基线 commit 的提交日期。
- 条目末尾括注的短 hash 是仓库内的证据 commit。
- 标注 **Breaking** 的条目表示对既有安装、外部脚本或 Skill 消费者有兼容性影响。

## [Unreleased]

尚无未发布变更。

## [0.4.0] - 2026-09-15

本版本完成 Epic 9（Story 9.3）、Epic 10（生态模块治理）与 Epic 11（Artifact Root 统一），并重组公开文档体系。旧安装通过 `speclite update --yes` 升级；所有产物位置变更均不做静默迁移，旧位置产物原位保留。

### Added

- 新增 `speclite resolve artifact-roots` 子命令，按 `explicit-config` / `fresh-default` / `legacy-fallback` 优先级返回七类 artifact root 的 `resolvedRoot` 与 `resolutionMode`（59af402、c8f2d21、cd33ab7）。
- 新增 `speclite resolve artifact-documents --subject <prd|epics|architecture>` 子命令，统一判定 PRD / Epics / Architecture 的整篇与分片产物归属，歧义时只读阻断、零写入（a0b75bf）。
- 新增 `speclite resolve cr-directory --story-id <N.N|N-N> --review-series <series>` 子命令，按 Story ID 归一化 Code Review 目录，canonical 与 legacy 目录并存且无法判断时阻断（6079257）。
- fresh install 现在把七类 artifact root 写入 `_speclite/config.toml`，并预创建带阶段序号的默认目录（`_speclite-output/0-brainstorming-artifacts` … `5-devops-artifacts`、`project-knowledge-base`）；`Ready Summary` 与 `status` 输出 Filesystem planes，`docs/` 单列为 Public Documentation plane（c8f2d21）。
- 新增 `ecosystems/<category>/<id>/` optional ecosystem module 体系：install 支持「前端 / 后端 / 其他」到具体生态 id 的两级引导选择，未选择的生态保持 source-only，不进入 IDE mirror 与 installed indexes（1785074）。
- 新增 5 个生态模块 Skill：`speclite-react-project-context-and-review`、`speclite-vue-project-context-and-review`、`speclite-npm-package-project-auditor`、`speclite-cli-tool-contract-auditor`、`speclite-documentation-only-project-auditor`（1785074）。
- 新增 6 个 core Skill：`speclite-domain-modeling`、`speclite-grilling`、`speclite-grill-with-docs`、`speclite-handoff`（65018ad）、`speclite-terminology-governance`（afa50f6）、`speclite-drawer-er-modeler`（436bf71）。
- 新增 5 个 SDLC Skill：`speclite-create-technical-solution-document`（3cff68b）、`speclite-implementation-readiness-grill-consistency-reviewer`、`speclite-goal-orchestrator-epic-story-review-runner`（5a28ff0）、`speclite-goal-orchestrator-epic-story-code-review-runner`（3483793）、`speclite-code-review-contract`（462fe7e）。
- 新增 3 个 support Skill：`speclite-html-ppt-generator`（abbc34d）、`speclite-docs-intro-ppt-creator`（c147c9e）、`speclite-canonical-source-governance-runner`（4d14cdf）。
- default install 的 canonical package 数从 61 增至 69（core 13→19、sdlc 48→50），生态模块按需另装（436bf71、1785074）。
- `speclite update` 新增可恢复的 canonical inventory migration：旧安装可吸收新版 canonical 新增文件、迁移后的 `sourceRef` 与派生索引，支持 operation lock、单文件安全写、indexes-last 提交与中断后续跑（4972d6b）。
- Story kickoff 强制走 Flow Gate：goal orchestrator 在 Story 开工前校验 kickoff gate report，未通过不进入实现（3483793）。
- installed skill package 的 root-level `data/` 目录纳入安装的 copy / hash / validation 范围（2972a8e）。
- 新增 `npm run docs:check` 文档治理门禁，校验 `docs/` 与根 README 的链接、fragment、索引可达性、package 边界、Draft / Moved 状态与 Markdown 风格规则（691c858、2e32d4b）。

### Changed

- **Breaking** 四个 Skill 的默认输出位置对齐 SPEC 09 artifact roots：复盘写入 `{implementation_artifacts}/retrospectives/`，npm 发布报告写入 `{devops_artifacts}/npm-releases/`，领域模型 CONTEXT / CONTEXT-MAP / ADR 写入 `{solutioning_artifacts}/architecture/` 并要求 `workflowType` / `sourceSkill` / `generatedAt` frontmatter，术语表 fallback 改为 `{project_knowledge}/glossary/`；旧位置产物原位保留（f106a89）。
- **Breaking** `speclite-skill-lint` 升至 3.0.0，引入唯一 `rule-registry.json` 与 density `schema_version=2`；Workflow 缺失或歧义时 `workflow_chars` / `workflow_ratio` / `triggered_density_warning` 为 `null`，消费者必须检查新增的 `workflow_status`（f030e2c）。
- **Breaking** `speclite-skill-creator` 升至 2.0.0，与 lint 3.x 共用 `contract_version=1.0.0` 的 rule-registry 契约；lint 与 creator 需成对升级（887c4d6）。
- **Breaking** 两个 Implementation Readiness Skill 更名：`speclite-check-implementation-readiness` → `speclite-implementation-readiness-check`，`speclite-ir-grill-consistency-reviewer` → `speclite-implementation-readiness-grill-consistency-reviewer`，输出统一到 `{solutioning_artifacts}/implementation-readiness-report/`；旧 ID 由 `module.yaml` 的 `skill_renames` 重定向，`speclite update` 以 `canonical-skill-renamed` 显式展示并重投影，引用旧 ID 的外部脚本须改用新 ID（1daa064）。
- Analysis 产物路由到专属子目录：research Skill 输出到 `{analysis_artifacts}/research/`，`speclite-product-brief` 到 `{analysis_artifacts}/product-brief/`，`speclite-prfaq` 到 `{analysis_artifacts}/prfaq/`；旧路径降级为标注 `legacy-compatible` 的只读 fallback（cd33ab7）。
- PRD / Epics / Architecture 整篇文档默认路径固定为 `{planning_artifacts}/prd/prd.md`、`{planning_artifacts}/epics/epics.md`、`{solutioning_artifacts}/architecture/architecture.md`，分片留在同一 subject 目录，不引入 `shards/` 层级（a0b75bf）。
- UX 产物归集到 `{planning_artifacts}/ux/`，越界写入以 realpath 与 lexical 双重 fail-closed 拒绝；旧位置 UX 产物保持可发现、不迁移（51acd4f）。
- PRD 验证报告文件名固定为 `prd-validate-report-{yyyy-MM-dd}.md`，同日目标已存在时以 `artifact-path.prd-validation-report-exists` 阻断，不 overwrite、append 或生成后缀（6fb3911）。
- Code Review 产物目录改为按 Story ID 归属（`11.9` 与 `11-9` 均归一为 `11-9-code-review`），拒绝 title、slug 与 traversal 文本；legacy title-bearing 目录不自动迁移（45c5696、6079257）。
- `speclite-brainstorming` 输出收口到 `{brainstorming_artifacts}`，不再写 `{output_folder}/brainstorming`（f9fc646）。
- existing install 的显式 artifact root 配置继续权威，缺失的新字段走 legacy fallback 并标记 `legacy-compatible`，不再报告为配置损坏；config root 与实际产物位置不一致时只产生 `artifact-path.config-artifact-mismatch` 诊断（95eddc8）。
- SR / CR 审查流程加入收敛控制：无界 "repeat until pass" 改为有界循环（`max_rounds=5`、`stop_loss_consecutive_rounds=3`）与 PASS / PASS_WITH_VERIFY_OBLIGATIONS / ARCHITECTURE_TRIAGE / STOP_LOSS 终止判定，并移除 reviewer「至少找出 10 个问题」的配额（e913aa6）。
- Code Review 从各自复制的 `cr-config.md` 迁移为共享契约包 `speclite-code-review-contract`，CR01–06 与 runner 平级消费；finalizer 收口改为 fail-closed coordinated write（462fe7e、cb11bc9、b9cc196）。
- Flow Gate story-kickoff 报告升级为 v2 handoff 契约，新增 `handoffContractVersion`、`foundationPrerequisiteStatus` / `Refs`、`closureOwnerCheckStatus` / `Refs`、`sourceSkill`；hook 以 v2 为 REQUIRED，v1 作为 LEGACY 拒绝（34c4153）。

### Fixed

- 修复 fresh install 后 `speclite validate` 直接 exit 1：安装器登记的 human-owned custom stub 不再被 `file-integrity.unknown-ownership` 误报为 error（9a88a1a）。
- 修复 `speclite update --repair` 在真实安装上恒为 `blocked-by-conflict`：repair 现在与普通 update 一致跳过 human-owned / workflow-owned 条目，conflicts 只保留 unknown ownership、path escape、missing source evidence 与 unsupported repair（9a88a1a）。
- `artifact-path.missing-required-artifact` 区分 `not-yet-produced`（info）与 `no-artifacts-found`（warning），治理报告的 `openGapCount` 排除前者并新增 `notYetProducedCount`（9a88a1a）。
- 修复 `speclite-grill-with-docs` 调用的 Skill ID（a349f08）。
- 从 canonical source 移除误入的 `speclite-drawer-er-modeler.zip`，避免其随 packaging manifest 进入 npm 包（436bf71）。

### Docs

- 公开文档体系按 Diataxis 重组：Epic 1–11 过程术语表移入 `reference/glossary/epics/`，flow-gate handoff 契约升入 `reference/specs/`，`ide-specific-discovery-metadata` → `ide-discovery-metadata`、`tutorials/quick-start` → `first-install-walkthrough`，旧路径保留 Moved 兼容页（0b195b0、b8ee37b）。
- 新增唯一源定义页 `sdlc-phases`、`skills/agent-roster`、`install-defaults`、`ownership-matrix`；`core-skills` 与 `validation-issues` 从 Draft 补全为正式 catalog；新增 `flow-gate-handoff-pitfalls` 与完整版 `customize-a-skill`（b8ee37b、bbf5ced）。
- README 与 reference / how-to 按 Epic 9–11 实际实现修正：`resolve` 子命令补齐为 5 个，canonical 计数更新为 19 / 50 / 69，npm 包内死链改为 GitHub URL，human output 示例替换为真实 CLI 输出（bbf5ced）。
- 新增安装后的版本控制与 gitignore 策略：`runtime-layout` 增加 Commit Guidance 与 Version Control Guidance，`install-speclite` 增加 Step 6: Commit and Ignore（f6cabd1）。
- 新增 canonical source 治理介绍 deck 与 presentations 索引（6147a55、5596373），以及 Codex 与 Claude Code 会话参考（c96fe9a）。

### Upgrade Notes（升级说明）

1. 运行 `speclite update --yes` 吸收新增 Skill、生态模块 taxonomy 与 Readiness Skill 更名。
2. 旧安装不会自动获得七类 artifact root 字段，缺失字段走 `legacy-compatible` fallback；需启用新默认目录时手工在 `_speclite/config.toml` 补字段。
3. 安装漂移导致 validate 报错时，`speclite update --repair --yes` 现在可正常闭环。
4. 依赖 `speclite-skill-lint` density JSON 的外部脚本须适配 `schema_version=2`。

## [0.3.0] - 2026-06-18

本版本完成 Epic 8（outcome 导向人类输出）与 Epic 9 前两个 Story（installed runtime activation 契约）。

### Added

- 已安装 Skill 的激活契约统一收口到 `speclite resolve`：Agent / Workflow 不再直连 `_speclite/config.toml` 或 Python resolver，激活前需通过 `command -v speclite` 预检，CLI 不可用时明确中止并给出修复指引（564f847）。
- 新增 canonical source 变更检查能力：Skill `speclite-check-canonical-source-change` 与 `canonical-source-change-check` hook，在改动 canonical source 时提示配套同步项（e7d91ea、20e5c72）。
- 新增 4 个 brownfield 后端技术栈分析 Skill（通用 tech-stack digger、Java Spring Boot、Node.js、Python），产出结构化技术栈报告（be6eb88）。
- CLI 人类可读输出升级为 outcome 导向体系：统一输出框架、本地化 message catalog 与 `Next Actions`，覆盖 `install`、`update`、`update --repair`、`status`、`validate`、`resolve`；`--json` 契约与 exit code 保持不变（cb93536）。
- 新增 human output presentation profiles（operation / diagnostic / report-support）；install 的 `Next Actions` 使用 path-safe 目标路径（e349853）。
- 输出改为可扫描的 bullet 布局、分层 Evidence、带计数的 steps 与带标签的 Next Actions；新增受控 ANSI 颜色护栏，`NO_COLOR`、CI、非 TTY 与 `--json` 下一律无颜色（9404065）。
- 运行时 config 新增 `agents` 与 `hooks` 描述符契约，并自动为 `_speclite/config.user.toml`、`_speclite/custom/config.user.toml` 追加 gitignore 规则（5cc0c3f）。

### Changed

- **Breaking** SpecLite Agent persona 全部重命名（如 Mary→Alice、Paige→Taylor、Nora→Sarah、John→Paul、Sally→Uma、Winston→Adam）；按旧 persona 名称调用 Agent 的自定义配置与文案需同步更新（2a2bcf9）。
- Python resolver 脚本降级为 runtime compatibility assets，不再作为默认激活路径，install / validate / update / repair / uninstall / packaging 边界随之收紧（564f847）。

### Fixed

- `speclite install` 完成后补充 installed skill 的 PATH 激活提示，避免通过 `npx` 或开发版安装后 AI 会话找不到裸 `speclite` 命令（c38e5de）。
- `speclite-help` 改用 installed help index 读取帮助目录，修正已安装环境下的帮助内容来源（167b6f0）。

### Docs

- 新增 Agent / Module / Workflow 概念说明并补全文档索引入口（0c6dc7a）。
- 完善文件所有权边界文档，明确 installer-owned、human-owned 与 workflow-owned 路径划分（913173c）。
- 同步 quick-start、install how-to、CLI reference 与 human output matrix，并对齐交互式安装的用户显示名说明（4748a5d、67fa503、66b12e1）。

## [0.2.0] - 2026-06-15

本版本完成 Epic 7（Post-MVP 治理扩展）与 Story 1.7（安装 CLI 交互与本地化输出）。

### Added

- 新增治理命令 `speclite init`、`list`、`doctor`、`sync`、`uninstall`、`governance-report`，均支持 `--json`；写入类命令支持 `--dry-run` / `--yes` 的 plan-before-write 流程（e6b2f77）。
- `speclite install` 把 Flow Gate 强制执行 hook 投射为项目级 Claude / Codex hook artifacts，在开发 Story 前校验 `story-kickoff` gate 证据并记录 sha256 与 ownership（e6b2f77）。
- `speclite governance-report` 提供只读过程治理覆盖报告，并配套 CI 与企业自动化集成指引（e6b2f77）。
- `speclite install` 新增 `--interactive` 显式交互模式与 `--locale zh-CN|en-US`，在写入任何项目文件前分步确认模块选择、config 初始化、来源访问与写入范围（c332281）。
- 新增 support Skill `speclite-agent-creator` 与 `speclite-agent-lint`，用于创建和校验 Agent 定义（da2826f）。
- 新增文档治理 Skill `speclite-agent-docs-steward` 与 `speclite-write-opensource-docs`，并按 Diataxis 建立 tutorials / how-to / reference / explanation 文档体系（d719fcf）。
- 新增发布打包清单与发布前校验 `npm run release:packaging-check`（32ae76c）。
- 新增 MIT `LICENSE`（d810174）。

### Changed

- 打包清单位置从 `dist/packaging-manifest.json` 迁移到 `release/packaging-manifest.json`（32ae76c）。
- `speclite-npm-publisher` 的发布 SOP 与 hooks 防护流程完善（aad0d17）。
- `.gitignore` 明确忽略本地运行态文件（82ffd0e）。

### Docs

- 完善安装与 CLI 使用文档，澄清命令执行目录与安装目标目录的区别（ad7f6cd、48bf71f）。

## [0.1.1] - 2026-06-11

### Added

- 新增 implementation 阶段 Skill `speclite-qa-write-test-guide`，把 PRD、技术方案或代码事实转成面向测试人员的可执行测试指南（6c37664）。

### Fixed

- 修复 `install` 目标目录为当前目录时摘要直接显示 `.` 的问题，现在显示为 `current directory`（566f2f2）。
- 修复从已发布 npm 包安装时因缺少 `package-lock.json` 导致 bundled source 缺少 integrity evidence、被判为不可信来源的问题：现在回退读取 `dist/packaging-manifest.json` 生成 version-lock 与 content-hash 证据（566f2f2）。

### Docs

- README 与 quick-start 更新为公开包名 `@fancyliu/speclite`，补充 `npm install -g` 与 `npx @fancyliu/speclite@latest` 两种使用方式，区分 `npm run release:verify` 与 `npm run release:check`（663f776）。
- 归档并迁移 `system-design-discuss` 历史设计讨论文档（cde590d）。

## [0.1.0] - 2026-06-05

首个正式发布版本，完成 Epic 1–6（MVP 安装、解析、验证、更新安全、来源可信度与发布信心）。

### Added

- `speclite install`：完成目录解析、preflight 检查、模块与 IDE target 选择、runtime 写入和 ready summary 的首次安装流程；支持 `--json`、`--yes`、`--dry-run`、`--source`、`--source-value`、`--channel`、`--version`（a1e85a2、6e8c61e）。
- `speclite status`：输出本地 installed-state 摘要，包括 manifest 版本、skill / help 索引与阶段覆盖（395b017）。
- `speclite validate`：对 installed-state、manifest schema、IDE mirror、file integrity、runtime path、menu target、legacy namespace、artifact path、operation lock 与 source integrity 执行确定性校验（395b017、aa55e53、6e8c61e）。
- `speclite update` 与 `speclite update --repair`：更新前生成计划，基于 ownership manifest 与 hash 比对判断可写范围，`--repair` 显式修复可安全恢复的 installer-owned 内容（b966f58）。
- `speclite resolve config` 与 `speclite resolve customization`：供已安装 Skill 读取项目配置与团队 / 用户级 customization 覆盖（aa55e53）。
- canonical 方法论源包：`core-skills`（13 个）、按 SDLC 五阶段组织的 `sdlc-skills`、`support-skills` 的 `speclite-skill-creator` 与 `speclite-skill-lint`，以及 DevOps 阶段的 `speclite-npm-publisher`（c8d4889、c718479、ff8de5a）。
- 多 IDE 执行面：同一 canonical skill 同时镜像到 `.claude/skills/` 与 `.agents/skills/`，按 IDE 报告 mapped / unsupported / failed 状态（531147c、a1e85a2）。
- runtime 目录契约：`_speclite/` 作为 metadata / control hub，`_speclite-output/` 作为按阶段预创建的 artifact 仓库（a1e85a2、aa55e53）。
- 统一的 `CommandResult` JSON 输出契约与 `ValidationIssue` 分类模型，`status`、`validate`、`--json` 输出与 fixture 断言共享同一契约（395b017）。
- 写入安全模型：human-owned 与 workflow-owned 文件不被静默覆盖，写入前必须取得 `_speclite/.lock` 项目操作锁，并提供冲突检测与 safe write（b966f58）。
- 多种安装来源（bundled、npm、private-registry、local-tarball、offline-bundle、git、local），输出带 integrity evidence、trustStatus 与脱敏失败原因的 source descriptor（6e8c61e）。
- 维护者 fixture 门禁与发布校验：覆盖 fresh install、existing update、IDE drift、source integrity、resolve parity、path portability 与 skill artifact loop，以及 `npm run release:verify` / `npm run release:check`（83d47a1、4ebc542、2e11ca9）。

### Docs

- 新增根目录 README，说明产品定位、运行模型、CLI 命令表、安全模型与开发者工作流（675812b）。
- 新增 `docs/quick-start.md` 安装与首次使用指南（2d6ba44）。
- 新增术语表、文档索引与 MVP 契约 / 规划产物文档集（6e3d4e4、5b2c7a4、8836241）。

[Unreleased]: https://github.com/flanliulf/SpecLite/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/flanliulf/SpecLite/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/flanliulf/SpecLite/compare/d810174...v0.3.0
[0.2.0]: https://github.com/flanliulf/SpecLite/compare/ec71e3f...d810174
[0.1.1]: https://github.com/flanliulf/SpecLite/compare/2cba267...ec71e3f
[0.1.0]: https://github.com/flanliulf/SpecLite/commits/2cba267
