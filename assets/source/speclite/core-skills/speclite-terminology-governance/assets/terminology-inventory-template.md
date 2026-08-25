# Terminology Inventory Template（术语清单模板）

使用以下 Markdown 骨架维护跨 artifact 术语和可选领域候选：

```markdown
# Terminology Inventory（术语清单）

本文档是来源可追溯的派生清单，不覆盖 PRD、Architecture、SPEC、Epic、Story、代码、tests 或 `CONTEXT.md`。

## Terms（术语）

| Canonical Term | 中文名称 | Definition | Category | Scope | Sources | Status | Aliases |
|---|---|---|---|---|---|---|---|
| **{{canonical_term}}** | {{chinese_name}} | {{definition}} | {{category}} | {{scope}} | {{sources}} | candidate | {{aliases}} |

## Conflicts（冲突）

| Term | Source A | Source B | Conflict | Owner | Recommended Resolution |
|---|---|---|---|---|---|
| **{{term}}** | {{source_a}} | {{source_b}} | {{conflict}} | {{owner}} | {{recommendation}} |

---

*本文档由 speclite-terminology-governance Skill 自动生成*
```

```markdown
# Domain Candidates（领域候选）

| Term | Candidate Kind | Proposed Bounded Context | Evidence | Conflicts | Recommendation |
|---|---|---|---|---|---|
| **{{term}}** | {{candidate_kind}} | {{bounded_context}} | {{evidence}} | {{conflicts}} | Review with `speclite-domain-modeling` |

---

*本文档由 speclite-terminology-governance Skill 自动生成*
```

`{{...}}` 均为 template placeholder，不是 runtime config field。
