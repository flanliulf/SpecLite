# Speclite Agent Lint Report Template

```markdown
# Speclite Agent Lint Report

目标目录：<path>
检查时间：<YYYY-MM-DD>
总体结论：<通过 / 有警告 / 有错误>

## 摘要

- 通用 Skill 规则：<passed>/<total>
- Agent 定义规则：<passed>/<total>
- Speclite 运行模型规则：<passed>/<total>
- Critical：<n>
- Major：<n>
- Minor：<n>
- Observation：<n>
- 脚本检查：`python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <path>`

## Findings

### Critical

| # | 证据 | 问题 | 影响 | 建议 |
| --- | --- | --- | --- | --- |
| 1 | <file path and excerpt> | <issue> | <impact> | <fix> |

### Major

| # | 证据 | 问题 | 影响 | 建议 |
| --- | --- | --- | --- | --- |

### Minor

| # | 证据 | 问题 | 影响 | 建议 |
| --- | --- | --- | --- | --- |

### Observation

| # | 证据 | 说明 |
| --- | --- | --- |

## 调整方案

- <file>: <change summary>

## 验证建议

- 重新运行 `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <path>` 和 `speclite-agent-lint`。
- 搜索 `_bmad|config.yaml|/bmad:`。
- 检查 `customize.toml` 是否保留 `[agent]`。
- 检查 `agent.menu` 的 skill 目标和 prompt 文件是否存在。
- 如存在 `SKILL.en.md`，检查它与 `SKILL.md` 的版本和运行模型一致。
```
