# Speclite Skill 目录

`assets/source/speclite/` 是 Speclite Skill、支撑工具、运行时辅助脚本和默认定制示例的源码目录。这里是创作区；安装后的目标项目应通过自己的 `.claude/skills/` 和 `_speclite/` 目录消费 Skill 与共享脚本。

英文版见 [README.en.md](README.en.md)。

## 目录结构

| 路径 | 用途 |
| ---- | ---- |
| `core-skills/` | 多个 SDLC 工作流共享的 Speclite 基础能力，例如启发、头脑风暴、帮助、文档索引、文档拆分和评审辅助能力。 |
| `sdlc-skills/` | 按生命周期阶段组织的 Speclite SDLC 工作流 Skill，包括分析、计划、方案设计、实现和 DevOps 发布阶段。 |
| `ecosystems/<category>/<id>/` | 可选技术生态模块。初始 `category` 仅允许 `frontend`、`backend`、`other`；每个生态目录必须有自己的 `module.yaml` 和 `module-help.csv`，并用 `ecosystem-<category>-<id>` 作为 module code。 |
| `support-skills/` | 用于创建、迁移、检查和对齐 SpecLite canonical skill 源定义的支撑 Skill。 |
| `hooks/` | 独立 canonical hook packages，安装到目标项目 `_speclite/hooks/` 并合并生成 Claude/Codex hook config。 |
| `scripts/` | 共享运行时辅助脚本的源码副本，例如配置解析和 customization 解析。目标项目运行时应安装到 `{project-root}/_speclite/scripts`。 |
| `custom/` | 团队级和用户级 customization 覆盖示例。目标项目运行时应放在 `{project-root}/_speclite/custom`。 |

## 运行模型

Speclite Skill 文档应描述安装后的运行模型，而不是本仓库的源码布局。

- Skill 安装根目录：`{project-root}/.claude/skills/{skill-name}`
- Speclite 运行时根目录：`{project-root}/_speclite`
- 运行时配置：`{project-root}/_speclite/config.toml`
- 运行时 customization 覆盖：`{project-root}/_speclite/custom/{skill-name}.toml` 和 `{project-root}/_speclite/custom/{skill-name}.user.toml`
- 运行时脚本：`{project-root}/_speclite/scripts`

不要在当前执行规约中把 `assets/source/speclite/scripts`、`assets/source/speclite/custom` 或其他源码仓库路径写成 runtime 依赖。

## Skill 包布局

单个 Skill 包应遵循以下约定：

- 根目录保留入口和版本文件：`SKILL.md`、可选的 `SKILL.en.md`、`CHANGELOG.md`。
- 需要时在根目录保留默认定制和配置示例：`customize.toml`、`config.toml.example`。
- 工作流规则、协议、检查清单和微步骤文件放入 `references/`。
- 可填充模板和骨架文档放入 `assets/`。
- 结构化查表数据如果不是模板，放入 `data/`。
- Skill 本地可执行脚本放入 `scripts/`；共享运行时脚本放在 `assets/source/speclite/scripts/`，安装到 `_speclite/scripts/`。

## Ecosystem Authoring Contract（生态创作契约）

Ecosystem Skill package 的 canonical source path 是 `assets/source/speclite/ecosystems/<category>/<id>/<skill-name>/`。`category` 只允许 `frontend`、`backend`、`other`；`id` 使用 lowercase kebab-case，并与 `module.yaml` 的 `ecosystem_id` 一致。对应 module code 必须是 `ecosystem-<category>-<id>`。

每个 `ecosystems/<category>/<id>/` module root 必须包含：

- `module.yaml`：声明 `module_kind: ecosystem`、`ecosystem_category`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false` 和 `required: false`。
- `module-help.csv`：每个 canonical package root 至少有一条非 `_meta` row，row 使用 stable `skill` id、display name、phase、menu code / action、output location 和 artifact type。
- 一个或多个 Skill package roots：每个 package 至少同步 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`metadata.version` 和必要 references/assets/scripts。

generic SDLC workflow（通用 SDLC workflow）仍归入 `sdlc-skills/`；只有具化到特定 language、framework、runtime 或 toolchain 的 Skill 才进入 `ecosystems/<category>/<id>/`。从 `sdlc-skills/` 迁移到 ecosystem module 时，必须在 `CHANGELOG.md` 或维护记录中说明 source path move、runtime behavior unchanged 和 package id 是否保持不变。

`support-skills/` 不属于 default install module。创建或迁移普通 workflow Skill 时使用 `speclite-skill-creator`，检查时使用 `speclite-skill-lint`；Agent 定义包仍由 `speclite-agent-creator` 与 `speclite-agent-lint` 管理。

维护 ecosystem source 时使用这个顺序：creator / lint -> `module.yaml` / `module-help.csv` -> canonical source check -> fixtures -> build / tests / packaging check。也就是先创建和 lint Skill package，再同步 module metadata、help row、版本和 changelog；随后运行 canonical source check，刷新 default no-ecosystem 与 selected ecosystem fixtures，最后执行 build-first、packaging-last release verification。

## Other Category Admission（其他类别准入）

`ecosystems/other/<id>/` 只接受不能归入 `frontend` / `backend` 且具有稳定项目形态的生态。初始允许的 `other` examples 是：

- `other/npm-package`：面向 npm package 项目的 package surface、tarball / `npx` smoke、publish metadata 和 release gate readiness evidence。
- `other/cli-tool`：面向 CLI tool 项目的 `bin` entry、command surface、TTY / non-TTY output、exit code、JSON contract、shell portability 和 install smoke evidence。
- `other/documentation-only`：面向 documentation-only project 的 `docs/`、README、Diataxis、package-facing docs、link integrity、public docs source 和 project facts evidence。

新增其它 `other` id 必须在 module docs、`module-help.csv`、creator/lint 规则或维护记录中说明：

- `why-not-frontend`：为什么不能归入 frontend ecosystem。
- `why-not-backend`：为什么不能归入 backend ecosystem。
- 目标项目事实：该生态的稳定项目形态、文件证据和常见验证面。
- 安装价值：为什么 selected-only 安装能降低目标项目噪音。
- selected-only 验收：选择该 module 时只投影该 module，未选择的 frontend / backend / other modules 均不得出现在 runtime mirrors 或 indexes。

禁止使用 `other/misc`、`other/general`、`other/tools` 这类无边界 id。generic publishing、public docs writing、CLI output、PRD、Architecture、Story creation 和 Code Review workflow 仍留在 `sdlc-skills/`；`other` seed Skill 只能提供项目形态特异的 companion guidance，不能复制或迁移既有 SDLC workflow。

## 当前目录分区

### Core Skills

`core-skills/` 当前包含共享交互、文档和评审工具，例如：

- `speclite-advanced-elicitation`
- `speclite-brainstorming`
- `speclite-customize`
- `speclite-distillator`
- `speclite-help`
- `speclite-index-docs`
- `speclite-party-mode`
- `speclite-shard-doc`
- `speclite-review-adversarial-general`
- `speclite-review-edge-case-hunter`
- `speclite-review-acceptance-auditor`
- editorial review 相关辅助能力

### SDLC Skills

`sdlc-skills/` 按阶段组织：

- `1-analysis/`：产品发现、既有系统基线分析、项目文档、PRFAQ、产品简报、分析师和技术写作 Agent。
- `2-plan-workflows/`：PRD 创建、编辑、验证，UX 设计，PM 和 UX Agent 包。
- `3-solutioning/`：架构、Epic 和 Story、项目上下文、实现就绪检查、IR grill consistency review、Story Review 01-03、架构师 Agent。
- `4-implementation/`：Story 创建和开发、快速开发、Sprint 状态和计划、Epic 级 SR/CR 编排、Code Review 01-06、QA 测试生成、回顾、检查点预览、纠偏、开发者 Agent。
- `5-devops/`：研发完成后的 CI/CD、部署、发布和包分发工作流，例如开源 Node.js 项目发布到 npm。

实现阶段运行产物默认位于 `{project-root}/_speclite-output/implementation-artifacts/`，其中 review 相关子目录包括：`stories/`、`code-reviews/`、`story-reviews/`、`cr-rules/`、`retrospectives/`。

DevOps 发布阶段运行产物默认位于 `{project-root}/_speclite-output/devops-artifacts/`，其中 npm 发布报告写入 `npm-releases/`。

既有系统分析能力位于 `sdlc-skills/1-analysis/speclite-brownfield-context-builder/`。它将 brownfield 仓库恢复为 evidence、baseline、deep-dives、planning handoff 四层产物，默认写入 `{project_knowledge}/brownfield/`，并把 brownfield planning brief 交给后续 PRD、Architecture、Epics/Stories 工作流继续细化。

### Ecosystem Skills

`ecosystems/` 承载具化到某个技术生态的可选扩展。通用 SDLC workflow 继续留在 `sdlc-skills/`；只有绑定到特定语言、框架、runtime 或工具链的 Skill 才放入 ecosystem module。

当前首批 backend ecosystem modules：

- `ecosystems/backend/java-springboot/`：`ecosystem-backend-java-springboot`
- `ecosystems/backend/nodejs/`：`ecosystem-backend-nodejs`
- `ecosystems/backend/python/`：`ecosystem-backend-python`

当前首批 frontend ecosystem modules：

- `ecosystems/frontend/react/`：`ecosystem-frontend-react`
- `ecosystems/frontend/vue/`：`ecosystem-frontend-vue`

当前首批 other ecosystem modules：

- `ecosystems/other/npm-package/`：`ecosystem-other-npm-package`
- `ecosystems/other/cli-tool/`：`ecosystem-other-cli-tool`
- `ecosystems/other/documentation-only/`：`ecosystem-other-documentation-only`

这些 ecosystem modules 都依赖 `sdlc`，但 `default_selected: false` 且 `required: false`。默认安装仍只选择 `core` + `sdlc`；用户显式选择某个 ecosystem module 时，installer 只投影该 ecosystem 下的 Skill package，不会把同 category 的其它 ecosystem 全量安装。通用 `speclite-brownfield-backend-tech-stack-digger` 保持在 `sdlc-skills/1-analysis/`，作为跨后端技术栈分析能力。

React / Vue modules 是 optional frontend extensions，只承载绑定到具体 framework evidence 的项目上下文、组件架构、状态、路由、测试、可访问性、构建和迁移审查。generic UX、PRD、Architecture、Story creation 和 Code Review workflow 仍留在 `sdlc`；除非分析绑定到具体 frontend framework ecosystem，不要把通用前端讨论迁入 React / Vue module。SpecLite 本身仍是 CLI + filesystem control plane，不因 frontend ecosystem module 而新增 Web UI、dashboard、browser runtime 或 GUI product scope。

Other modules 是 optional project-shape extensions。`npm-package` 只做 package evidence audit，不执行 publish；真实发布仍由 `speclite-npm-publisher` 负责。`cli-tool` 只做 CLI command contract audit，不替代通用 implementation / output workflow。`documentation-only` 只判断 docs-only project shape 和 docs source readiness，不表示所有文档工作都属于 other；公开文档写作和治理仍由 `speclite-write-opensource-docs` 与 `speclite-agent-docs-steward` 负责。

### Review Skills

Review 体系保留 BMEnhance 的编号阶段语义，并按 Speclite 运行模型改造路径与命名。

共享审查支撑能力位于 `core-skills/`：

- `speclite-review-adversarial-general`：Blind Hunter，对代码、规格或文档做对抗式风险审查。
- `speclite-review-edge-case-hunter`：Edge Case Hunter，穷举边界条件和未处理分支。
- `speclite-review-acceptance-auditor`：Acceptance Auditor，对照 Story AC 检查实现偏差和遗漏。

Code Review 工作流位于 `sdlc-skills/4-implementation/`，采用 01-06 编号链路：

- `speclite-code-review-01-reviewer`：执行三层并行代码审查，生成结构化 CR summary。
- `speclite-code-review-02-evaluator`：评估 CR findings 的有效性和处理结论。
- `speclite-code-review-03-fixer`：按评估结论执行修复并记录修复摘要。
- `speclite-code-review-04-rules-extractor`：从历史 CR、评估和修复记录提炼复用规则。
- `speclite-code-review-05-todo-tracker`：维护跨 Story 的 CR TODO backlog。
- `speclite-code-review-06-finalizer`：在 CR 通过后同步 Story 和流程状态。

Story Review 工作流位于 `sdlc-skills/3-solutioning/`，采用 01-03 编号链路：

- `speclite-story-review-01-reviewer`：按 Epic 或单 Story 粒度执行设计审查，生成 SR summary。
- `speclite-story-review-02-evaluator`：评估 SR findings 并生成评估文档。
- `speclite-story-review-03-fixer`：按评估结论修订 Story 文档并记录修订摘要。

IR grill consistency review 位于 `sdlc-skills/3-solutioning/`：

- `speclite-ir-grill-consistency-reviewer`：对 PRD、UX、Architecture、Epics / Stories 做严格串行 implementation-readiness 一致性 grill，并把过程记录写入 `{planning_artifacts}/ir-grill`。

Epic 级目标编排工作流位于 `sdlc-skills/4-implementation/`：

- `speclite-goal-orchestrator-epic-story-review-runner`：按 Epic 严格串行编排 SR reviewer / evaluator / fixer 循环，并在 `story-reviews/.../goal-execute-records/` 下维护进度记录。
- `speclite-goal-orchestrator-epic-story-code-review-runner`：按 Epic 下每个 Story 严格串行编排 Dev Story 和 CR 循环，并在 `code-reviews/.../goal-execute-records/` 下维护进度记录。

非编号 `speclite-code-review` 已不再作为 canonical skill 源头入口；代码审查链路从 `speclite-code-review-01-reviewer` 开始，并由 CR2/CR3/CR6 等编号 skill 完成评估、修复与收尾。

Review 产物目录约定如下：

- `stories/`：Story spec 文件。
- `code-reviews/`：CR summary、evaluation 和修复记录。
- `story-reviews/`：SR summary、evaluation 和修订记录。
- `cr-rules/`：CR backlog、规则提炼和跨 Story TODO。
- `retrospectives/`：Epic/Sprint 回顾总结。

### Support Skills

`support-skills/` 包含 canonical skill 源定义的创作、验证、治理和 docs presentation 支撑工具：

- `speclite-skill-creator`：创建或迁移 workflow 风格的 Speclite Skill 包。
- `speclite-skill-lint`：验证通用 Skill 规则，以及 Speclite runtime 和迁移对齐规则。
- `speclite-agent-creator`：创建或迁移 `speclite-agent-*` / `bmad-agent-*` 这类 role activation Agent 定义包。
- `speclite-agent-lint`：验证 Agent 专属 `[agent]` 定制面、persona、菜单目标、prompt 引用和 runtime 残留。
- `speclite-canonical-source-governance-runner`：在 hook 提醒 canonical source 变化后执行分类、影响面矩阵、D1/D2 决策记录、定点修订和 strict checker 收口。
- `speclite-check-canonical-source-change`：在 canonical source 修改后检查 root counts、`module-help.csv`、hooks、fixtures、docs 和 packaging manifest 是否同步。
- `speclite-docs-intro-ppt-creator`：把项目体系、系统设计、治理机制、理念或工作流生成到 `docs/` 下的介绍型 HTML PPT。
- `speclite-html-ppt-generator`：提供 SpecLite-owned HTML PPT 模板、layout、theme、validator 和第三方授权说明，避免依赖外部个人 skill 路径。

维护 `assets/source/speclite/` 下的 canonical skill 源定义时，workflow 风格 Skill 默认使用 `speclite-skill-creator` 与 `speclite-skill-lint`；Agent 定义包默认使用 `speclite-agent-creator` 与 `speclite-agent-lint`；canonical source 变更闭环默认使用 `speclite-canonical-source-governance-runner` 与 `speclite-check-canonical-source-change`。不再回退到外部 `skills-creator` 仓库的通用 creator/lint skill。

### Hooks

`hooks/` 当前包含两个 canonical hook packages：

- `flow-gate-enforcement`：在执行 `speclite-dev-story` 前检查 story-kickoff Flow Gate 通过证据。
- `canonical-source-change-check`：在 `assets/source/speclite/` 变更后 warning-only 提醒执行 canonical source 一致性检查。

安装时，installer 会把每个 hook 的 `runner.mjs` 和 `hook-manifest.json` 投影到 `_speclite/hooks/<hook-id>/`，并合并生成 `.claude/settings.json` 与 `.codex/hooks.json`。Codex hook config 使用 event-keyed `{"hooks": {"Event": [...]}}` 形态。

## 验证建议

修改单个 Skill 包时，优先做 scoped 检查，避免查看全仓库大 diff：

```sh
rg -n '_bmad|config\.yaml|/bmad:|bmad-|BMAD|BMad|assets/source/speclite/(src|scripts|custom)' assets/source/speclite/<path-to-skill> --glob '!CHANGELOG.md'
/usr/bin/find assets/source/speclite/<path-to-skill> -maxdepth 1 -type f -name '*.md' -print | sort
```

同时检查目标 Skill 包的编辑器诊断，并确认 `metadata.version` 与 `CHANGELOG.md` 最新版本一致。

检查 `speclite-agent-*` 时，使用 Agent 专属脚本：

```sh
python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <agent-dir>
python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills
```

修改 `assets/source/speclite/` 后，运行 canonical source 变更检查：

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict
```

`canonical-source-change-check` hook 只是 warning-only guardrail，不能替代 release verification。涉及 ecosystem modules、fixtures 或 packaging manifest 的变更，发布前仍需先运行 `npm run build`，再运行 focused tests / fixture gates / canonical source check，最后运行 `npm run release:packaging-check`。
