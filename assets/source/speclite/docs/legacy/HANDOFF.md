# Handoff - skills-creator Speclite Review Skill Work

生成时间：2026-05-11
仓库：`/Users/fancyliu/Repos/skills-creator`
临时来源：`/var/folders/m8/1dsqp1x11bq5mwvk4tjdf0cw0000gn/T/handoff-XXXXXX.md.mUl83egVoP`

本 handoff 记录 Speclite catalog、BMEnhance Review skills 迁移、README 更新和后续接手注意事项。用户要求中文回复；不要回滚无关工作区改动。

## 当前目标与完成状态

已完成：

- 将 BMEnhance review 体系迁移为 Speclite 对应 skill 内容。
- 保留 BMEnhance 的编号阶段语义，CR 使用 `01-06`，SR 使用 `01-03`。
- 将 BMAD 路径和运行模型改为 Speclite：`_bmad-output` -> `_speclite-output`，`_bmad` -> `_speclite`，`config.yaml` -> `config.toml`。
- 新增 Speclite review 支撑 skill：`speclite-review-acceptance-auditor`。
- 新增 CR 01-06 编号链路和 SR 01-03 编号链路。
- 更新 `assets/source/speclite/README.md` 与 `assets/source/speclite/README.en.md`，新增 Review Skills 小节。
- 更新 `assets/source/speclite/sdlc-skills/module.yaml` 与 `module-help.csv`，补充安装目录和菜单索引。

2026-06-05 后续更新：

- 新增 `assets/source/speclite/sdlc-skills/5-devops/`，作为 SDLC 第 5 阶段，承载研发完成后的 CI/CD、部署、发布和包分发类 DevOps skill。
- 新增 `assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher/`，用于开源 Node.js 项目发布到 npm。
- 后续维护 `assets/source/speclite/` 下的 canonical skill 源定义时，默认使用本项目 `support-skills/speclite-skill-creator` 和 `support-skills/speclite-skill-lint`；外部 `skills-creator` 仓库只保留 forge mirror 或历史参考角色。

## Speclite Catalog README

关键文件：

- `assets/source/speclite/README.md`：中文主 README。
- `assets/source/speclite/README.en.md`：英文版 README。
- `assets/source/speclite/docs/legacy/HANDOFF.md`：本 handoff 的持久副本，作为历史渊源记录保留。

README 当前包含：

- `core-skills/`、`sdlc-skills/`、`support-skills/`、`scripts/`、`custom/` 的职责边界。
- 安装后 runtime 模型：`.claude/skills/{skill-name}`、`_speclite/config.toml`、`_speclite/custom`、`_speclite/scripts`。
- 单个 Skill 包布局规则：根目录入口/版本/配置，`references/` 放规约和步骤，`assets/` 放模板，`data/` 放结构化查表数据，`scripts/` 放本地脚本。
- Review Skills 小节：支撑层、CR 01-06、SR 01-03、编号 CR 起始入口、review artifact 子目录。
- DevOps Skills 阶段：`5-devops/` 用于 CI/CD、部署、发布和包分发工作流。
- scoped validation 建议，避免全仓库大 diff。

后续如新增或移动 Speclite catalog 目录，优先同步更新 `README.md` 和 `README.en.md`。

## 本轮新增 Review Skills

Core support：

- `assets/source/speclite/core-skills/speclite-review-acceptance-auditor/`
  - 来源：`forge/bmenhance/review-acceptance-auditor/`
  - 职责：对照 Story AC 审计代码实现偏差、遗漏和矛盾。

Code Review 01-06，位于 `assets/source/speclite/sdlc-skills/4-implementation/`：

- `speclite-code-review-01-reviewer/`
- `speclite-code-review-02-evaluator/`
- `speclite-code-review-03-fixer/`
- `speclite-code-review-04-rules-extractor/`
- `speclite-code-review-05-todo-tracker/`
- `speclite-code-review-06-finalizer/`

Story Review 01-03，位于 `assets/source/speclite/sdlc-skills/3-solutioning/`：

- `speclite-story-review-01-reviewer/`
- `speclite-story-review-02-evaluator/`
- `speclite-story-review-03-fixer/`

保留关系：

- 非编号 `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review/` 已不再作为 canonical skill 源头入口。
- 编号 `speclite-code-review-01-reviewer` 是 CR 链路起始入口，并承接 BMEnhance CR-01 的跨轮产物链路语义。

## Review Artifact 目录约定

实现阶段运行产物默认位于：

```text
{project-root}/_speclite-output/implementation-artifacts/
```

Review 相关子目录：

- `stories/`：Story spec 文件。
- `code-reviews/`：CR summary、evaluation 和修复记录。
- `story-reviews/`：SR summary、evaluation 和修订记录。
- `cr-rules/`：CR backlog、规则提炼和跨 Story TODO。
- `retrospectives/`：Epic/Sprint 回顾总结。

配置文件：

- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/references/cr-config.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-01-reviewer/references/sr-config.md`

注意：用户或格式化器在最近修改过上述两个 config 文件。后续改动前必须重新读取当前内容，不要基于旧上下文直接 patch。CR/SR config 当前顶部带有 `<!-- markdownlint-disable MD032 MD060 -->`，用于保留迁移来的表格规约格式。

## 迁移原则

- 只做 Speclite 对 BMAD 的路径、配置、命名和目录归属改造；不改变 BMEnhance 核心审查语义。
- CR/SR 主链路 skill 名称必须保留阶段编号和角色后缀，例如 `speclite-code-review-01-reviewer`、`speclite-story-review-01-reviewer`。
- 三层支撑 skill 独立存在，不内嵌到主调度 prompt。
- 根目录只保留 `SKILL.md`、可选 `SKILL.en.md`、`CHANGELOG.md`、配置示例和 customize；规约、流程、协议、检查清单放 `references/`；模板放 `assets/`。
- 新增 review skill 当前统一为 `metadata.version = "1.0.0"`，`CHANGELOG.md` 最新版本也是 `1.0.0`。

## 已执行验证

已验证：

- `get_errors` on `assets/source/speclite/README.md` 与 `README.en.md`：No errors found。
- 之前对新增 review skill 与索引文件执行过编辑器诊断：No errors found。
- 残留扫描已为空：无 `_bmad`、`config.yaml`、`_bmad-output`、`bmm-workflow-status`、`speclite-speclite` 等残留。
- 结构检查通过：新增 skill 根目录只保留 `SKILL.md` / `CHANGELOG.md`，规约在 `references/`，模板在 `assets/`。
- 版本检查通过：新增 skill 的 `SKILL.md` 与 `CHANGELOG.md` 均为 `1.0.0`。

建议复查命令：

```sh
rg -n '_bmad|config\.yaml|/bmad:|bmad-|BMAD|BMad|_bmad-output|bmm-workflow-status|speclite-speclite' assets/source/speclite/core-skills/speclite-review-acceptance-auditor assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-01-reviewer assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-02-evaluator assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-03-fixer --glob '!CHANGELOG.md'
/usr/bin/find assets/source/speclite/<target-skill> -maxdepth 1 -type f -name '*.md' -print | sort
```

## 当前 Git 工作区注意事项

- 本轮 Speclite review 相关文件在当前状态里显示为未跟踪，因为 `assets/source/speclite/` 下多项内容此前也处于未跟踪状态。
- 不要回滚用户或其他工具做出的无关改动。
- 非编号 `speclite-code-review/` 不再作为 canonical skill 源头目录；后续 CR 入口以编号版为准。
- 仓库此前可能存在大量与本任务无关的既有删除或未跟踪改动，尤其是 `vault/` 相关内容；本 handoff 不要求处理它们。

## 重要规则与偏好

- 用户要求中文回复。
- 不要擅自修改未明确要求的文件；若认为需要扩散修改，先说明原因并获得指令。
- macOS/zsh 环境中 `find` 可能表现异常或被替换；需要 POSIX find 语义时使用 `/usr/bin/find`。
- Python 相关命令前需使用 Python 环境工具；普通 shell 检查用 `rg`、`/usr/bin/find` 等即可。
- 需要手工编辑文件时优先使用 `apply_patch`。

## 建议新代理接手方式

1. 先读 `assets/source/speclite/README.md` 和本文件，了解 Speclite catalog 与 review 迁移状态。
2. 若继续改 review skill，先读对应 `SKILL.md`、`references/cr-config.md` 或 `references/sr-config.md` 的当前内容。
3. 若要运行 Speclite lint 思路，参考 `assets/source/speclite/support/speclite-skill-lint/SKILL.md` 与 `references/lint-rules.md`。
4. 若只改 README，同步检查 `README.en.md`，避免中英文 catalog 漂移。
5. 复查时优先 scoped 检查，不要全仓库大 diff。
