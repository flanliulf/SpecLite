# Support Skills（支撑 Skills）

本文记录维护 SpecLite canonical skill source 所需的 support skills。它们服务 `assets/source/speclite/` 的创建、迁移、检查和派生一致性治理，不属于默认目标项目 SDLC runtime install set。

## Catalog（目录）

| Support Skill | Purpose | Default Install |
|---|---|---|
| `speclite-skill-creator` | 创建或迁移 workflow 风格的 SpecLite Skill package。 | 否 |
| `speclite-skill-lint` | 只读检查普通 Skill 的 YAML、description、版本、runtime model 和 workflow density。 | 否 |
| `speclite-agent-creator` | 创建或迁移 `speclite-agent-*` role activation Agent 定义包。 | 否 |
| `speclite-agent-lint` | 只读检查 Agent 定义包的 `[agent]`、persona、菜单、prompt 引用和 runtime 残留。 | 否 |
| `speclite-canonical-source-governance-runner` | 在 hook 提醒 canonical source 变化后执行分类、影响面矩阵、D1/D2 决策记录、定点修订和 strict checker 收口。 | 否 |
| `speclite-check-canonical-source-change` | 在 canonical source 变更后检查 root counts、ecosystem category/package totals、`module-help.csv`、hooks、fixtures、docs 和 packaging manifest 派生一致性。 | 否 |

## Boundaries（边界）

- `support-skills/` 不计入 default install module；默认目标项目 baseline 来自 selected module truth，而不是 support skill 数量或 source tree 中全部 ecosystem packages。
- Ecosystem module 是 selected-only extension：存在于 `assets/source/speclite/ecosystems/<category>/<id>/` 不代表默认安装，只有被用户选择后才进入目标项目 runtime mirrors 和 indexes。
- Checker 报告中的 `defaultInstall.total` 只代表 default `core` + `sdlc` baseline；`ecosystems.byCategory` 和 `ecosystems.totalPackageRoots` 单独描述 optional ecosystem source，不得合并成一个全局 install count。
- Release fixture matrix 至少覆盖 default no-ecosystem、selected backend、selected frontend 和 selected other cases，并为同 category 未选 module、跨 category module 与 support packages 提供 negative assertions。
- `support-skills/` 可以被 SpecLite 维护者或自动化流程直接运行，但不应被写成普通目标项目开发者必须执行的 SDLC gate。
- 新增、迁移或删除 `assets/source/speclite/` 下的 Skill / Agent / Hook / ecosystem module 后，先使用 `speclite-canonical-source-governance-runner` 分类影响面和记录 D1/D2 决策，再运行 `speclite-check-canonical-source-change` 做只读收口。
- 普通 workflow Skill 使用 `speclite-skill-creator` / `speclite-skill-lint`；Agent 定义包使用 `speclite-agent-creator` / `speclite-agent-lint`，避免普通 creator 或 lint 误处理 `[agent]` 定制面。

## Ecosystem Authoring Workflow（生态创作流程）

维护 ecosystem source 时使用这个顺序：creator / lint -> `module.yaml` / `module-help.csv` -> canonical source check -> fixtures -> build / tests / packaging check。

具体执行时，先用 `speclite-skill-creator` 创建或迁移普通 workflow Skill，再用 `speclite-skill-lint` 检查 Skill package；Agent 定义包改用 `speclite-agent-creator` / `speclite-agent-lint`。随后同步 ecosystem module metadata、help rows、`SKILL.md` / `SKILL.en.md` / `CHANGELOG.md` 和 selected-only 文案，再运行 canonical source check、刷新 fixture matrix，最后按 release workflow 做 build-first、packaging-last verification。

`canonical-source-change-check` hook 是 warning-only guardrail。它可以提醒维护者运行治理 runner 和 checker，但不替代 release verification，也不替代发布前的 focused tests、fixtures、build 和 packaging check。

## Related Commands（相关命令）

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict
python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py <skill-dir>
python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <agent-dir>
```
