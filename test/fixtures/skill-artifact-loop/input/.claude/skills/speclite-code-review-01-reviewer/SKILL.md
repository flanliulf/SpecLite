---
name: speclite-code-review-01-reviewer
description: Fixture-owned installed skill entry for the minimal artifact loop.
---

# Speclite Code Review 01 Reviewer

## Activation Protocol

Run these installed runtime support commands before writing workflow artifacts:

- `speclite resolve config --project-root {project-root}`
- `speclite resolve customization --skill {skill-root} --project-root {project-root}`

Write a deterministic Markdown review artifact under the configured implementation artifact root.
The artifact metadata must include `workflowType`, `sourceSkill`, and `generatedAt`.
