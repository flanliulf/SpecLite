```markdown
---
schemaVersion: "speclite.flow-gate-report.v1"
mode: "{{mode}}"
target: "{{target}}"
storyKey: "{{story_key}}"
result: "{{result}}"
generatedAt: "{{generated_at}}"
sourceSkill: "speclite-flow-gate"
---

# Flow Gate Report: {{target}}

## Summary（摘要）

- Mode: `{{mode}}`
- Target: `{{target}}`
- Date: `{{date}}`
- Result: `{{result}}`
- Model Used: `{{model_used}}`

## Contract Anchors（契约锚点）

{{contract_anchor_findings}}

## Functional Anchors（功能锚点）

{{functional_anchor_findings}}

## Evidence Anchors（证据锚点）

{{evidence_anchor_findings}}

## Guidance Equivalence（指引等价性）

{{guidance_equivalence_findings}}

## Missing Or Ambiguous Items（缺失或歧义项）

{{missing_or_ambiguous_items}}

## Recommended Next Action（推荐下一步）

{{recommended_next_action}}

---

*本文档由 speclite-flow-gate Skill 自动生成*
```
