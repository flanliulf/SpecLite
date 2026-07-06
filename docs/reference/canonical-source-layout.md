# Canonical Source Layout（规范来源目录结构）

本文记录 `assets/source/speclite/` 的 canonical source layout、模块边界、Skill package root 发现规则和 hooks source 分区。它回答“installer 从哪里读取要安装的内容”。

## Snapshot（当前快照）

| Area | Current Count | Source |
|---|---:|---|
| Core skill package roots | 13 | `assets/source/speclite/core-skills/` |
| SDLC skill package roots | 48 | `assets/source/speclite/sdlc-skills/` |
| Ecosystem modules | 8 modules / 8 package roots | `assets/source/speclite/ecosystems/<category>/<id>/` |
| Support skill package roots | 7 | `assets/source/speclite/support-skills/` |
| Canonical hook packages | 2 | `assets/source/speclite/hooks/` |
| Shared runtime scripts | 2 | `assets/source/speclite/scripts/` |

## Top-Level Layout（顶层布局）

| Path | Role |
|---|---|
| `core-skills/` | Core Module 的 canonical Skill packages，提供共享交互、文档、审查和协作能力。 |
| `sdlc-skills/` | SDLC Module 的 canonical Skill packages，按生命周期阶段组织 Agent 与 Workflow。 |
| `ecosystems/` | 可选 ecosystem extension modules。只发现 `ecosystems/<category>/<id>/module.yaml`，不做 arbitrary deep module scan。 |
| `support-skills/` | 维护 canonical Skill source 的支撑工具，例如 creator 和 lint，不是默认业务协作 persona。 |
| `hooks/` | 独立 canonical hook packages。当前包含 `flow-gate-enforcement` 与 `canonical-source-change-check`，不属于某个 Skill package root。 |
| `scripts/` | 共享 runtime compatibility scripts，安装到目标项目 `_speclite/scripts/`。 |
| `custom/` | customization 示例源，目标项目中的人工覆盖位于 `_speclite/custom/`。 |

## Module Roots（模块根）

官方 Module 由带 `module.yaml` 的目录声明：

| Module | Source Directory | Default Behavior |
|---|---|---|
| `core` | `assets/source/speclite/core-skills/` | required module，提供共享基础能力。 |
| `sdlc` | `assets/source/speclite/sdlc-skills/` | default-selected module，依赖 `core`，提供 SDLC Agent、Workflow、目录和配置 prompts。 |
| `ecosystem-<category>-<id>` | `assets/source/speclite/ecosystems/<category>/<id>/` | optional extension module，依赖 `sdlc`，只有用户 selected 后才投影。 |

Module metadata 读取规则在 `src/modules/module-metadata.ts` 中实现。CLI 会发现 top-level modules 以及 bounded nested ecosystem modules：`ecosystems/<category>/<id>/module.yaml`。每个 module root 内会递归查找带 `SKILL.md` 的目录作为 package roots，并校验 `module-help.csv` 中引用的 skill id 必须能在 discovered package roots 中找到。

> Note: `module-help.csv` 必须覆盖当前 core / SDLC / ecosystem module package roots。一个 Skill 可以有多条 help/menu rows，但每个 canonical package root 至少应有一条非 `_meta` row。

## Bounded Nested Ecosystem Modules（有界嵌套生态模块）

Ecosystem module source root 使用 `assets/source/speclite/ecosystems/<category>/<id>/`。`category` 只允许 `frontend`、`backend`、`other`；`id` 使用 lowercase kebab-case；module code 使用 `ecosystem-<category>-<id>`。`module.yaml` 必须声明 `module_kind: ecosystem`、`ecosystem_category`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false` 和 `required: false`。

Ecosystem module 是 selected-only extension：默认安装 baseline 仍由 selected `core` + `sdlc` 决定，不因为 source tree 存在 ecosystem packages 就安装它们。选择某个 ecosystem module 时，installer 会通过 dependency closure 包含 `sdlc` 和 `core`，但不会安装同 category 下其它 ecosystem modules。

Interactive install 会按 ecosystem category -> id 引导选择；`--yes`、`--json` 和 default no-prompt install 不会自动选择 ecosystem modules。Ecosystem modules 只表示 SpecLite Skill package selection，不是项目依赖安装器、package manager 或 UI framework installer。

通用 SDLC workflow 继续留在 `sdlc-skills/`。只有绑定到具体 language、framework、runtime 或 toolchain 的 Skill 才进入 ecosystem module。`support-skills/` 仍是维护者工具区，不是 default install module。

当前 frontend ecosystem modules 是 `ecosystems/frontend/react/` 和 `ecosystems/frontend/vue/`。它们是 optional extension，依赖 `sdlc`，只在用户选择对应 module code 后投影。React / Vue Skill 必须从目标项目文件、lockfile、官方 docs 或用户资料取证，不硬编码未验证的 framework version；generic UX、PRD、Architecture、Story creation 和 Code Review workflow 仍属于 `sdlc`。

### Other Category Admission（其他类别准入）

`ecosystems/other/<id>/` 只接受 stable project shape（稳定项目形态），并且必须说明不能归入 `frontend` 或 `backend` 的原因。初始允许 ids 是 `npm-package`、`cli-tool` 和 `documentation-only`：

| Source | Module Code | Stable Project Shape |
|---|---|---|
| `ecosystems/other/npm-package/` | `ecosystem-other-npm-package` | npm package project，围绕 `package.json`、package surface、tarball / `npx` smoke 和 release gate evidence。 |
| `ecosystems/other/cli-tool/` | `ecosystem-other-cli-tool` | CLI tool project，围绕 `bin` entry、command surface、TTY / non-TTY、exit code、JSON contract 和 shell portability。 |
| `ecosystems/other/documentation-only/` | `ecosystem-other-documentation-only` | documentation-only project，围绕 `docs/`、README、Diataxis、package-facing docs、link integrity 和 public docs source。 |

新增 other id 必须记录 `why-not-frontend`、`why-not-backend`、目标项目事实、安装价值和 selected-only 验收。`other/misc`、`other/general`、`other/tools` 默认不允许，因为这些 id 没有稳定项目形态边界。既有 `speclite-npm-publisher`、`speclite-write-opensource-docs`、`speclite-agent-docs-steward` 等 SDLC workflow 不因 other module 存在而迁移。

## Fixture And Release Gates（Fixture 与发布门禁）

Default no-ecosystem install fixture 只证明 `core` + `sdlc` baseline，不代表所有 selected ecosystem installs 的全局 package root count。Selected ecosystem fixture matrix 由独立 case 覆盖：

| Fixture Case | Selected Module | Required Negative Assertions |
|---|---|---|
| `fresh-install-empty-project` | default `core` + `sdlc` | 不安装任何 optional ecosystem module。 |
| `fresh-install-selected-backend-ecosystem` | `ecosystem-backend-java-springboot` | Node.js / Python backend、frontend、other 和 support packages 不出现。 |
| `fresh-install-selected-frontend-ecosystem` | `ecosystem-frontend-react` | Vue frontend、backend、other 和 support packages 不出现。 |
| `fresh-install-selected-other-ecosystem` | `ecosystem-other-npm-package` | CLI tool、documentation-only、frontend、backend 和 support packages 不出现。 |

Release packaging manifest 必须包含 `assets/source/speclite/ecosystems/**` 下的 `module.yaml` 和 Skill package source files，同时继续排除 `test/fixtures/`、`fixtures/`、cache、temp 和 build fixture outputs。`speclite-check-canonical-source-change` 会报告 `core`、`sdlc`、`support`、`hooks`、`ecosystems.byCategory`、`ecosystems.totalPackageRoots` 与 `defaultInstall.total`，并检查每个 ecosystem module 的 `module-help.csv` 覆盖。

## SDLC Phase Layout（SDLC 阶段布局）

| Phase Directory | Responsibility | Recent Notable Roots |
|---|---|---|
| `1-analysis/` | 研究、brownfield baseline、通用技术栈分析、产品发现和文档治理。 | `speclite-brownfield-context-builder`、`speclite-brownfield-backend-tech-stack-digger`、`speclite-write-opensource-docs` |
| `2-plan-workflows/` | PRD、UX 和产品规划 Agent。 | `speclite-agent-pm`、`speclite-agent-ux-designer` |
| `3-solutioning/` | 架构、Epics/Stories、Story Review 和 readiness。 | `speclite-agent-architect`、`speclite-story-review-01-reviewer`、`speclite-ir-grill-consistency-reviewer` |
| `4-implementation/` | Sprint、Story、Flow Gate、Dev Story、Code Review、QA 和 Retrospective。 | `speclite-flow-gate`、`speclite-dev-story`、`speclite-code-review-01-reviewer`、`speclite-goal-orchestrator-epic-story-review-runner`、`speclite-goal-orchestrator-epic-story-code-review-runner` |
| `5-devops/` | 发布和运维流程。 | `speclite-npm-publisher` |

## Skill Package Layout（Skill 包布局）

单个 Skill package root 通常包含：

| File or Directory | Required | Role |
|---|---|---|
| `SKILL.md` | 是 | Skill 入口、触发描述、能力、流程和注意事项。 |
| `SKILL.en.md` | 可选 | 英文镜像。Agent package 中该文件不是强制项。 |
| `CHANGELOG.md` | 常见 | 版本和变更记录。 |
| `customize.toml` | 常见 | 默认 workflow 或 Agent customization。 |
| `config.toml.example` | 可选 | 项目级配置示例。 |
| `references/` | 可选 | 深层流程、协议、校验规则、步骤和解释。 |
| `assets/` | 可选 | 模板、骨架文件和可复用输出格式。 |
| `scripts/` | 可选 | Skill 本地辅助脚本。 |

## Canonical Hooks（规范 Hook）

Hooks 是独立 canonical package，不等同于 Skill package root。当前 hook sources 是：

| Hook | Source | Runtime Projection | Purpose |
|---|---|---|---|
| `flow-gate-enforcement` | `assets/source/speclite/hooks/flow-gate-enforcement/` | `_speclite/hooks/flow-gate-enforcement/` | 在执行 `speclite-dev-story` 前检查 story-kickoff Flow Gate 通过证据。 |
| `canonical-source-change-check` | `assets/source/speclite/hooks/canonical-source-change-check/` | `_speclite/hooks/canonical-source-change-check/` | 在 `assets/source/speclite/` 发生变更后 warning-only 提醒执行 governance runner 和 canonical source 一致性检查。 |

该 hook source 包含：

- `hook-manifest.json`
- `runner.mjs`
- `claude-settings.fragment.json`
- `codex-hooks.fragment.json`
- `README.md`

安装时，runtime projection 为每个 hook 写入 `runner.mjs` 和 `hook-manifest.json`，并按 selected IDE targets 合并生成 `.claude/settings.json` 或 `.codex/hooks.json`。Codex config 使用 event-keyed `{"hooks": {"Event": [...]}}` 形态。

## Source Versus Runtime（Source 与 Runtime）

| Source Path | Installed Runtime Path | Ownership |
|---|---|---|
| `core-skills/<skill>/` | `.claude/skills/<skill>/`、`.agents/skills/<skill>/` | `installer-owned` |
| `sdlc-skills/<phase>/<skill>/` | `.claude/skills/<skill>/`、`.agents/skills/<skill>/` | `installer-owned` |
| `ecosystems/<category>/<id>/<skill>/` | `.claude/skills/<skill>/`、`.agents/skills/<skill>/` only when selected | `installer-owned` |
| `hooks/flow-gate-enforcement/runner.mjs` | `_speclite/hooks/flow-gate-enforcement/runner.mjs` | `installer-owned` |
| `hooks/flow-gate-enforcement/hook-manifest.json` | `_speclite/hooks/flow-gate-enforcement/hook-manifest.json` | `installer-owned` |
| `hooks/canonical-source-change-check/runner.mjs` | `_speclite/hooks/canonical-source-change-check/runner.mjs` | `installer-owned` |
| `hooks/canonical-source-change-check/hook-manifest.json` | `_speclite/hooks/canonical-source-change-check/hook-manifest.json` | `installer-owned` |
| `scripts/resolve_config.py`、`scripts/resolve_customization.py` | `_speclite/scripts/*` | `installer-owned` compatibility assets |
| `custom/*.toml` examples | `_speclite/custom/*.toml` | `human-owned` in target project |

## Maintenance Rules（维护规则）

- 新增 canonical Skill package 时，必须提供 `SKILL.md`，并确认它位于正确 module / phase root。
- 新增 ecosystem Skill package 时，必须放在 `ecosystems/<category>/<id>/<skill>/`，同步 `module.yaml`、`module-help.csv`、`SKILL.md`、`SKILL.en.md`、`CHANGELOG.md` 和 metadata version。
- Ecosystem source authoring 使用 creator / lint -> `module.yaml` / `module-help.csv` -> canonical source check -> fixtures -> build / tests / packaging check 的维护顺序。
- 新增 other ecosystem id 时，必须同步准入说明、`why-not-frontend` / `why-not-backend` evidence、`module-help.csv`、creator/lint expectations、release gate 和 docs index。
- 新增对用户可见的 workflow 时，应同步 `module-help.csv` 和 `docs/reference/skills/`。
- 新增 Agent 时，应同步 `module.yaml` 的 `agents` roster，并使用 `speclite-agent-lint` 校验。
- 新增 hook source 时，应同步 hook manifest、runtime projection 代码、`_speclite/config.toml` hook descriptor 和 `docs/reference/runtime-layout.md`。
- 修改 canonical source 时，应先按 [`canonical-source-governance.md`](canonical-source-governance.md) 分类影响面；`D0` 用 checker / strict mode 收口，`D1` / `D2` 记录更新或跳过决策。
- 不要把 `_speclite-output/` 过程产物回写到 canonical source。

## Related Docs（相关文档）

| Topic | Link |
|---|---|
| SDLC skill catalog | [`skills/sdlc-workflows.md`](skills/sdlc-workflows.md) |
| Runtime layout | [`runtime-layout.md`](runtime-layout.md) |
| Canonical source governance | [`canonical-source-governance.md`](canonical-source-governance.md) |
| File ownership model | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| Agent explanation | [`../explanation/speclite-agents.md`](../explanation/speclite-agents.md) |
| Module explanation | [`../explanation/speclite-modules.md`](../explanation/speclite-modules.md) |

本文档由 speclite-agent-docs-steward Skill 自动生成
