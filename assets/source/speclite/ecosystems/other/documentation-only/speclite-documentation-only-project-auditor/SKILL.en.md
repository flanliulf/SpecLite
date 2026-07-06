---
name: speclite-documentation-only-project-auditor
description: "Audit documentation-only project facts from repository evidence. Use for docs-only repositories, docs/ source, README, Diataxis boundaries, package-facing docs, link integrity, public docs source, or documentation readiness without application/runtime code."
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Documentation-only Project Auditor

[Overview]
    This workflow audits documentation-only project facts for a selected `ecosystem-other-documentation-only` module. It focuses on `docs/`, README, Diataxis boundaries, package-facing docs, link integrity, public docs source, and project facts.

[Workflow]
    1. Confirm `{project-root}`, docs source root, and output location. If the project is not documentation-only, record why.
    2. Gather evidence from `docs/`, README, style guide, indexes, package metadata, links, assets, site config, and CI/docs scripts.
    3. Do not describe generic writing guidance as an existing project rule without evidence.
    4. Write a documentation-only audit note covering docs source, Diataxis map, link/render readiness, unknowns, and handoff.
    5. Hand actual public-docs writing to `speclite-write-opensource-docs` and docs governance to `speclite-agent-docs-steward`.

[Boundaries]
    This Skill does not mean all documentation work belongs in `other`; generic public-docs writing and stewardship remain SDLC workflows.
