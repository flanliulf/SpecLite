---
name: speclite-skill-creator
description: "Create or update SpecLite workflow Skills when asked to create a skill or package a workflow. Design entries, supporting resources and validation cases; route Agent definition packages to speclite-agent-creator."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "2.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

## Overview

Create ordinary SpecLite workflow Skills with Chinese SKILL.md, an English maintenance mirror, CHANGELOG and optional resources. Use the shared contract to distinguish base format, Codex adaptation and project policy; do not claim official certification.

## Core Capabilities

- Identify goals, inputs, outputs, trigger boundaries and missing information; ask at most three material questions at once.
- Select workflow patterns and core, sdlc, support or ecosystem source targets.
- Generate fields, semantically aligned bilingual entries and versions from the shared registry.
- Configure Codex invocation policy, appearance and verified MCP dependencies when needed.
- Organize rules, template guides, output templates and deterministic code by purpose, with explicit load routes.
- Measure density, review static results and provide executable behavioral cases, separating untested from verified behavior.

## Workflow

1. Read `references/skill-creation-workflow.md`. Confirm the SpecLite target, source path, host and existing authorization. Route Agent packages to their dedicated creator.
2. Before planning, read `references/spec-guide.md`; resolve the actual `{lint-root}` through Shared Contract and read its registry. Read `references/workflow-patterns.md` when selecting a pattern.
3. Before generation, read `references/templates.md`. Instantiate entries and resources under the contract. Generate Codex configuration only when needed and verified. Add owning SPEC, equivalent implementation evidence and Flow Gate guidance for implementation workflows.
4. Run the paired lint's `scripts/check_skill_density.py` on both entries. An unidentified Workflow is not PASS. When project thresholds trigger, extract the actual procedure into a reference and explain when to read it.
5. Before validation, read `references/testing-guide.md`. Review the draft against the shared plan and record static results and host behavior tests separately. Continue under existing authorization without asking for it again.
6. Deliver the tree, versions, contract version, evidence and unexecuted cases. Perform installation, external mirror sync or distribution only within the current authorization.

## Notes

- This creator targets SpecLite. Chinese canonical, English mirror, CHANGELOG, speclite- names and length budgets are project policy.
- metadata.version / author are required; catalog is optional and equals speclite when present. Verify extension sources and consumers instead of claiming unknown fields are officially forbidden.
- Descriptions may be translated with equivalent goals, triggers and exclusions; identity fields match. The English mirror is not a second automatically loaded Codex entry.
- Route speclite-agent-* / bmad-agent-* names or customize.toml containing [agent] to speclite-agent-creator; report unexecuted work if that dependency is unavailable.
- The ecosystem source group is `ecosystems/<category>/<id>`, with frontend, backend or other categories. Preserve module metadata, help rows, selected-only and other admission checks in the detailed workflow.
- Use scripts for deterministic needs. allowed-tools is neither cross-host permission isolation nor MCP dependency configuration.
- Process outputs follow project `.specskills/output/` and `.specskills/docs/analysis/` policy. Record source edits and installed-copy sync separately; do not implicitly write external workspaces.
- Maintain both entries, relevant references/scripts and CHANGELOG together. A source update does not establish installed-copy updates.
