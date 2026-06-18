# Canonical Source Layout（规范来源目录结构）

本文记录 `assets/source/speclite/` 的 canonical source layout、模块边界、Skill package root 发现规则和 hooks source 分区。它回答“installer 从哪里读取要安装的内容”。

## Snapshot（当前快照）

| Area | Current Count | Source |
|---|---:|---|
| Core skill package roots | 13 | `assets/source/speclite/core-skills/` |
| SDLC skill package roots | 48 | `assets/source/speclite/sdlc-skills/` |
| Support skill package roots | 5 | `assets/source/speclite/support-skills/` |
| Canonical hook packages | 2 | `assets/source/speclite/hooks/` |
| Shared runtime scripts | 2 | `assets/source/speclite/scripts/` |

## Top-Level Layout（顶层布局）

| Path | Role |
|---|---|
| `core-skills/` | Core Module 的 canonical Skill packages，提供共享交互、文档、审查和协作能力。 |
| `sdlc-skills/` | SDLC Module 的 canonical Skill packages，按生命周期阶段组织 Agent 与 Workflow。 |
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

Module metadata 读取规则在 `src/modules/module-metadata.ts` 中实现。CLI 会递归查找带 `SKILL.md` 的目录作为 package roots，并校验 `module-help.csv` 中引用的 skill id 必须能在 discovered package roots 中找到。

> Note: `module-help.csv` 必须覆盖当前 core / SDLC package roots。一个 Skill 可以有多条 help/menu rows，但每个 canonical package root 至少应有一条非 `_meta` row。

## SDLC Phase Layout（SDLC 阶段布局）

| Phase Directory | Responsibility | Recent Notable Roots |
|---|---|---|
| `1-analysis/` | 研究、brownfield baseline、技术栈分析、产品发现和文档治理。 | `speclite-brownfield-backend-tech-stack-digger`、`speclite-brownfield-java-springboot-backend-tech-stack-digger`、`speclite-brownfield-nodejs-backend-tech-stack-digger`、`speclite-brownfield-python-backend-tech-stack-digger` |
| `2-plan-workflows/` | PRD、UX 和产品规划 Agent。 | `speclite-agent-pm`、`speclite-agent-ux-designer` |
| `3-solutioning/` | 架构、Epics/Stories、Story Review 和 readiness。 | `speclite-agent-architect`、`speclite-story-review-01-reviewer` |
| `4-implementation/` | Sprint、Story、Flow Gate、Dev Story、Code Review、QA 和 Retrospective。 | `speclite-flow-gate`、`speclite-dev-story`、`speclite-code-review-01-reviewer` |
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
| `canonical-source-change-check` | `assets/source/speclite/hooks/canonical-source-change-check/` | `_speclite/hooks/canonical-source-change-check/` | 在 `assets/source/speclite/` 发生变更后 warning-only 提醒执行 canonical source 一致性检查。 |

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
| `hooks/flow-gate-enforcement/runner.mjs` | `_speclite/hooks/flow-gate-enforcement/runner.mjs` | `installer-owned` |
| `hooks/flow-gate-enforcement/hook-manifest.json` | `_speclite/hooks/flow-gate-enforcement/hook-manifest.json` | `installer-owned` |
| `hooks/canonical-source-change-check/runner.mjs` | `_speclite/hooks/canonical-source-change-check/runner.mjs` | `installer-owned` |
| `hooks/canonical-source-change-check/hook-manifest.json` | `_speclite/hooks/canonical-source-change-check/hook-manifest.json` | `installer-owned` |
| `scripts/resolve_config.py`、`scripts/resolve_customization.py` | `_speclite/scripts/*` | `installer-owned` compatibility assets |
| `custom/*.toml` examples | `_speclite/custom/*.toml` | `human-owned` in target project |

## Maintenance Rules（维护规则）

- 新增 canonical Skill package 时，必须提供 `SKILL.md`，并确认它位于正确 module / phase root。
- 新增对用户可见的 workflow 时，应同步 `module-help.csv` 和 `docs/reference/skills/`。
- 新增 Agent 时，应同步 `module.yaml` 的 `agents` roster，并使用 `speclite-agent-lint` 校验。
- 新增 hook source 时，应同步 hook manifest、runtime projection 代码、`_speclite/config.toml` hook descriptor 和 `docs/reference/runtime-layout.md`。
- 不要把 `_speclite-output/` 过程产物回写到 canonical source。

## Related Docs（相关文档）

| Topic | Link |
|---|---|
| SDLC skill catalog | [`skills/sdlc-workflows.md`](skills/sdlc-workflows.md) |
| Runtime layout | [`runtime-layout.md`](runtime-layout.md) |
| File ownership model | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| Agent explanation | [`../explanation/speclite-agents.md`](../explanation/speclite-agents.md) |
| Module explanation | [`../explanation/speclite-modules.md`](../explanation/speclite-modules.md) |

本文档由 speclite-agent-docs-steward Skill 自动生成
