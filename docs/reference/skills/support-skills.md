# Support Skills（支撑 Skills）

本文记录维护 SpecLite canonical skill source 所需的 support skills。它们服务 `assets/source/speclite/` 的创建、迁移、检查和派生一致性治理，不属于默认目标项目 SDLC runtime install set。

## Catalog（目录）

| Support Skill | Purpose | Default Install |
|---|---|---|
| `speclite-skill-creator` | 创建或迁移 workflow 风格的 SpecLite Skill package。 | 否 |
| `speclite-skill-lint` | 只读检查普通 Skill 的 YAML、description、版本、runtime model 和 workflow density。 | 否 |
| `speclite-agent-creator` | 创建或迁移 `speclite-agent-*` role activation Agent 定义包。 | 否 |
| `speclite-agent-lint` | 只读检查 Agent 定义包的 `[agent]`、persona、菜单、prompt 引用和 runtime 残留。 | 否 |
| `speclite-check-canonical-source-change` | 在 canonical source 变更后检查 root counts、`module-help.csv`、hooks、fixtures、docs 和 packaging manifest 派生一致性。 | 否 |

## Boundaries（边界）

- `support-skills/` 不计入默认安装 baseline；当前默认目标项目 baseline 仍是 `core=13`、`sdlc=48`、`total=61`。
- `support-skills/` 可以被 SpecLite 维护者或自动化流程直接运行，但不应被写成普通目标项目开发者必须执行的 SDLC gate。
- 新增或调整 `assets/source/speclite/` 后，优先运行 `speclite-check-canonical-source-change`，再按对象类型运行 `speclite-skill-lint` 或 `speclite-agent-lint`。

## Related Commands（相关命令）

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py <skill-dir>
python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <agent-dir>
```
