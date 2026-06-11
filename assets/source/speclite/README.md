# Speclite Skill 目录

`assets/source/speclite/` 是 Speclite Skill、支撑工具、运行时辅助脚本和默认定制示例的源码目录。这里是创作区；安装后的目标项目应通过自己的 `.claude/skills/` 和 `_speclite/` 目录消费 Skill 与共享脚本。

英文版见 [README.en.md](README.en.md)。

## 目录结构

| 路径 | 用途 |
| ---- | ---- |
| `core-skills/` | 多个 SDLC 工作流共享的 Speclite 基础能力，例如启发、头脑风暴、帮助、文档索引、文档拆分和评审辅助能力。 |
| `sdlc-skills/` | 按生命周期阶段组织的 Speclite SDLC 工作流 Skill，包括分析、计划、方案设计、实现和 DevOps 发布阶段。 |
| `support-skills/` | 用于创建、迁移、检查和对齐 SpecLite canonical skill 源定义的支撑 Skill。 |
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
- `3-solutioning/`：架构、Epic 和 Story、项目上下文、实现就绪检查、Story Review 01-03、架构师 Agent。
- `4-implementation/`：Story 创建和开发、快速开发、Sprint 状态和计划、Code Review 01-06、QA 测试生成、回顾、检查点预览、纠偏、开发者 Agent。
- `5-devops/`：研发完成后的 CI/CD、部署、发布和包分发工作流，例如开源 Node.js 项目发布到 npm。

实现阶段运行产物默认位于 `{project-root}/_speclite-output/implementation-artifacts/`，其中 review 相关子目录包括：`stories/`、`code-reviews/`、`story-reviews/`、`cr-rules/`、`retrospectives/`。

DevOps 发布阶段运行产物默认位于 `{project-root}/_speclite-output/devops-artifacts/`，其中 npm 发布报告写入 `npm-releases/`。

既有系统分析能力位于 `sdlc-skills/1-analysis/speclite-brownfield-context-builder/`。它将 brownfield 仓库恢复为 evidence、baseline、deep-dives、planning handoff 四层产物，默认写入 `{project_knowledge}/brownfield/`，并把 brownfield planning brief 交给后续 PRD、Architecture、Epics/Stories 工作流继续细化。

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

非编号 `speclite-code-review` 已不再作为 canonical skill 源头入口；代码审查链路从 `speclite-code-review-01-reviewer` 开始，并由 CR2/CR3/CR6 等编号 skill 完成评估、修复与收尾。

Review 产物目录约定如下：

- `stories/`：Story spec 文件。
- `code-reviews/`：CR summary、evaluation 和修复记录。
- `story-reviews/`：SR summary、evaluation 和修订记录。
- `cr-rules/`：CR backlog、规则提炼和跨 Story TODO。
- `retrospectives/`：Epic/Sprint 回顾总结。

### Support Skills

`support-skills/` 包含 canonical skill 源定义的创作和验证工具：

- `speclite-skill-creator`：创建或迁移 workflow 风格的 Speclite Skill 包。
- `speclite-skill-lint`：验证通用 Skill 规则，以及 Speclite runtime 和迁移对齐规则。
- `speclite-agent-creator`：创建或迁移 `speclite-agent-*` / `bmad-agent-*` 这类 role activation Agent 定义包。
- `speclite-agent-lint`：验证 Agent 专属 `[agent]` 定制面、persona、菜单目标、prompt 引用和 runtime 残留。

维护 `assets/source/speclite/` 下的 canonical skill 源定义时，workflow 风格 Skill 默认使用 `speclite-skill-creator` 与 `speclite-skill-lint`；Agent 定义包默认使用 `speclite-agent-creator` 与 `speclite-agent-lint`。不再回退到外部 `skills-creator` 仓库的通用 creator/lint skill。

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
