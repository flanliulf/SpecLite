---
name: speclite-check-canonical-source-change
description: "Check derived consistency after SpecLite canonical source changes. Use when asked to check canonical source changes, assets/source/speclite, skill/hook/agent updates, or sdlc/core/total counts. Core capabilities: align root counts, module-help.csv, hook sources, baseline constants, fixtures, docs, and packaging manifest."
allowed-tools: Read, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview]
    Read-only checker for `assets/source/speclite/` changes. It turns canonical skill, hook, agent, fixture, docs, and release packaging relationships into an executable checklist so root counts, `module-help.csv`, hook descriptors, install fixtures, and packaging metadata stay aligned.

[Core Capabilities]
    - **Root counts alignment**: Counts `core-skills`, `sdlc-skills`, `support-skills`, and `hooks`, while keeping the default install baseline scoped to `core+sdlc`.
    - **`module-help.csv` alignment**: Reports missing, duplicate, or unknown rows for `core` and `sdlc` package roots.
    - **Hook source completeness**: Checks each canonical hook package for `README.md`, `hook-manifest.json`, `runner.mjs`, Claude/Codex fragments, and matching manifest id.
    - **Agent lint routing reminder**: Flags `speclite-agent-*` changes so maintainers route through `speclite-agent-lint`.
    - **Derived artifact scan**: Checks `CORE_SDLC_BASELINE_ENTRY_COUNT`, stale docs or fixture counts, legacy Codex hook array shape, and `release/packaging-manifest.json`.
    - **Verification command suggestions**: Emits scoped script, density/lint, focused tests, build, full test, packaging check, and `git diff --check` commands.

[Workflow]
    1. Confirm the repository root; default to the SpecLite repository root.
    2. Read `references/canonical-change-checklist.md` and identify whether the change touched skills, hooks, agents, docs, fixtures, or packaging.
    3. Run the read-only script:
       `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`
    4. Review findings manually. `warning` means derived artifacts likely need sync; `failure` means the script could not read required inputs.
    5. For Agent definition packages, also run:
       `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <agent-dir>`
    6. For regular Skill packages, also run:
       `python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py <skill-dir>`
    7. After fixes, rerun Step 3 and execute the recommended focused tests and packaging check.

[Notes]
    - This Skill is read-only and does not modify canonical source or derived artifacts.
    - `support-skills` are not part of default target-project skill mirrors; the install baseline remains `core+sdlc`.
    - Hook guardrails are deterministic protection layers, not workflow engines or review substitutes.
    - The `canonical-source-change-check` hook is warning-only: it reminds Claude/Codex sessions to run this Skill and verification commands without blocking the session.
    - Count updates must be based on actual files and script output, not memory.

[Generation Metadata]
    This Skill is maintained in the speclite-skill-creator system and belongs to SpecLite support-skills. Update `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, and `scripts/` together.
