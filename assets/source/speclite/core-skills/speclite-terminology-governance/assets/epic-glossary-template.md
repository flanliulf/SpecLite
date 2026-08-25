# Epic Glossary Template（Epic 术语表模板）

按以下 Markdown 骨架生成每个 Epic 的人类可读 Glossary：

```markdown
# Epic {{epic_number}}: {{epic_title_en}} Glossary（{{epic_title_zh}}术语表）

本文解释 Epic {{epic_number}}「{{epic_title_en}}」中反复出现、影响理解或契约判断的项目术语。

> Note: 本文解释的是规划和 acceptance intent，不表示相应 Story 已经实施、验证或发布。命令、路径、字段名、schema/issue id 和专有技术标识保留英文。

## {{category_en}}（{{category_zh}}）

| Term | 中文直译 | Definition |
|---|---|---|
| **{{term}}** | {{chinese_name}} | {{definition}} |

## Common Distinctions（常见区分）

| Distinction | Explanation |
|---|---|
| **{{term_a}} vs. {{term_b}}** | {{explanation}} |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| Source Epic | [{{source_title}}]({{source_path}}) |

---

*本文档由 speclite-terminology-governance Skill 自动生成*
```

文件名必须为 `epic-{NN}-{slug}.md`，其中 `{NN}` 是两位 Epic 编号；H1 使用自然数字 `Epic N`。
