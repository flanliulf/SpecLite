# Speclite Skill Catalog

`assets/source/speclite/` contains the source packages for Speclite skills, support tools, runtime helper scripts, and default customization examples. This catalog is the authoring area; installed runtime projects should consume skills and shared scripts through their own `.claude/skills/` and `_speclite/` directories.

## Directory Layout

| Path | Purpose |
| ---- | ------- |
| `core-skills/` | Cross-workflow Speclite capabilities shared by multiple SDLC flows, such as elicitation, brainstorming, help, document indexing, sharding, and review helpers. |
| `sdlc-skills/` | Speclite SDLC workflow skills grouped by lifecycle phase: analysis, planning, solutioning, implementation, and DevOps release operations. |
| `ecosystems/<category>/<id>/` | Optional technology ecosystem modules. Initial categories are `frontend`, `backend`, and `other`; each ecosystem directory owns `module.yaml`, `module-help.csv`, and an `ecosystem-<category>-<id>` module code. |
| `support-skills/` | Creator, migration, and lint skills used to author or validate SpecLite canonical skill source definitions. |
| `hooks/` | Standalone canonical hook packages installed under target-project `_speclite/hooks/` and merged into Claude/Codex hook config. |
| `scripts/` | Source copies of shared runtime helper scripts, including config and customization resolution. Runtime projects should install these under `{project-root}/_speclite/scripts`. |
| `custom/` | Source examples of team/user customization overlays. Runtime projects should place overlays under `{project-root}/_speclite/custom`. |

## Runtime Model

Speclite skill documents should describe the installed runtime model, not this repository's source layout.

- Skill install root: `{project-root}/.claude/skills/{skill-name}`
- Speclite runtime root: `{project-root}/_speclite`
- Runtime config: `{project-root}/_speclite/config.toml`
- Runtime customization overlays: `{project-root}/_speclite/custom/{skill-name}.toml` and `{project-root}/_speclite/custom/{skill-name}.user.toml`
- Runtime scripts: `{project-root}/_speclite/scripts`

Do not write `assets/source/speclite/scripts`, `assets/source/speclite/custom`, or other source-repository paths as runtime dependencies inside active skill instructions.

## Skill Package Layout

Within an individual skill package, use these conventions:

- Keep entry and version files at the skill root: `SKILL.md`, optional `SKILL.en.md`, and `CHANGELOG.md`.
- Keep default customization and config examples at the root when needed: `customize.toml`, `config.toml.example`.
- Put workflow rules, protocols, checklists, and micro-step files under `references/`.
- Put fillable templates and skeleton documents under `assets/`.
- Put structured lookup/reference data under `data/` when it is not a template.
- Put skill-local executable scripts under `scripts/`; shared runtime scripts belong in `assets/source/speclite/scripts/` and install to `_speclite/scripts/`.

## Ecosystem Authoring Contract

Ecosystem skill package canonical paths use `assets/source/speclite/ecosystems/<category>/<id>/<skill-name>/`. `category` is limited to `frontend`, `backend`, and `other`; `id` uses lowercase kebab-case and must match `module.yaml` `ecosystem_id`. Module code must be `ecosystem-<category>-<id>`.

Each `ecosystems/<category>/<id>/` module root must contain:

- `module.yaml`: declares `module_kind: ecosystem`, `ecosystem_category`, `ecosystem_id`, `required_dependencies: [sdlc]`, `default_selected: false`, and `required: false`.
- `module-help.csv`: gives every canonical package root at least one non-`_meta` row with stable `skill`, display name, phase, menu code / action, output location, and artifact type.
- One or more skill package roots: each package keeps `SKILL.md`, optional `SKILL.en.md`, `CHANGELOG.md`, `metadata.version`, and required references/assets/scripts in sync.

Generic SDLC workflows stay under `sdlc-skills/`. Only skills tied to a specific language, framework, runtime, or toolchain belong in ecosystem modules. Moving a skill from `sdlc-skills/` to an ecosystem module must record source path movement, runtime behavior continuity, and whether the package id remains unchanged.

Use this maintainer sequence for ecosystem source changes: creator / lint -> `module.yaml` / `module-help.csv` -> canonical source check -> fixtures -> build / tests / packaging check. First create or lint the skill package, then sync module metadata, help rows, version, and changelog; next run the canonical source check and refresh default no-ecosystem plus selected ecosystem fixtures; finally run build-first, packaging-last release verification.

`support-skills/` is not a default install module. Use `speclite-skill-creator` / `speclite-skill-lint` for workflow-style skills and `speclite-agent-creator` / `speclite-agent-lint` for agent definition packages.

## Current Catalog Areas

### Core Skills

`core-skills/` currently includes shared interaction, documentation, and review utilities such as:

- `speclite-advanced-elicitation`
- `speclite-brainstorming`
- `speclite-customize`
- `speclite-distillator`
- `speclite-help`
- `speclite-index-docs`
- `speclite-party-mode`
- `speclite-shard-doc`
- `speclite-review-adversarial-general`
- `speclite-review-edge-case-hunter`
- `speclite-review-acceptance-auditor`
- editorial review helpers

### SDLC Skills

`sdlc-skills/` is grouped by phase:

- `1-analysis/`: product discovery, brownfield baseline analysis, project documentation, PRFAQ, product brief, analyst and technical writer agents.
- `2-plan-workflows/`: PRD creation/editing/validation, UX design, PM and UX agent packages.
- `3-solutioning/`: architecture, epics and stories, project context, implementation readiness, IR grill consistency review, Story Review 01-03, architect agent.
- `4-implementation/`: story creation/development, quick development, sprint status/planning, Epic-level SR/CR orchestration, Code Review 01-06, QA test generation, retrospective, checkpoint preview, corrective course, developer agent.
- `5-devops/`: post-development CI/CD, deployment, release, and package publishing workflows, including open-source Node.js npm publishing.

Implementation-stage runtime artifacts default to `{project-root}/_speclite-output/implementation-artifacts/`; review-related subdirectories include `stories/`, `code-reviews/`, `story-reviews/`, `cr-rules/`, and `retrospectives/`.

DevOps-stage runtime artifacts default to `{project-root}/_speclite-output/devops-artifacts/`; npm release reports go under `npm-releases/`.

Brownfield analysis lives under `sdlc-skills/1-analysis/speclite-brownfield-context-builder/`. It reconstructs existing repositories into evidence, baseline, deep-dive, and planning handoff layers, defaults outputs to `{project_knowledge}/brownfield/`, and hands the brownfield planning brief to downstream PRD, Architecture, and Epics/Stories workflows for refinement.

### Ecosystem Skills

`ecosystems/` contains optional extensions for a concrete technology ecosystem or project shape. Generic SDLC workflows stay in `sdlc-skills/`; only skills bound to a specific language, framework, runtime, or toolchain belong in an ecosystem module.

Current backend ecosystem modules:

- `ecosystems/backend/java-springboot/`: `ecosystem-backend-java-springboot`
- `ecosystems/backend/nodejs/`: `ecosystem-backend-nodejs`
- `ecosystems/backend/python/`: `ecosystem-backend-python`

Current frontend ecosystem modules:

- `ecosystems/frontend/react/`: `ecosystem-frontend-react`
- `ecosystems/frontend/vue/`: `ecosystem-frontend-vue`

Current other ecosystem modules:

- `ecosystems/other/npm-package/`: `ecosystem-other-npm-package`
- `ecosystems/other/cli-tool/`: `ecosystem-other-cli-tool`
- `ecosystems/other/documentation-only/`: `ecosystem-other-documentation-only`

These ecosystem modules depend on `sdlc`, but use `default_selected: false` and `required: false`. Default install still selects only `core` + `sdlc`; selecting one ecosystem module projects only that ecosystem skill package and does not install sibling ecosystem modules.

Ecosystem modules are SpecLite optional skill package selection, not project dependency installers, package managers, or UI framework installers. A React / Vue / Java / npm package ecosystem selection does not install target-project runtime dependencies.

### Review Skills

The review system preserves BMEnhance numbered-stage semantics while adapting paths and naming to the Speclite runtime model.

Shared review support skills live under `core-skills/`:

- `speclite-review-adversarial-general`: Blind Hunter for adversarial risk review of code, specs, or documents.
- `speclite-review-edge-case-hunter`: Edge Case Hunter for exhaustive boundary and unhandled-branch analysis.
- `speclite-review-acceptance-auditor`: Acceptance Auditor for checking implementation gaps and deviations against Story ACs.

The Code Review workflow lives under `sdlc-skills/4-implementation/` and uses the 01-06 numbered chain:

- `speclite-code-review-01-reviewer`: runs parallel three-layer code review and generates a structured CR summary.
- `speclite-code-review-02-evaluator`: evaluates CR findings and handling conclusions.
- `speclite-code-review-03-fixer`: applies fixes according to evaluation conclusions and records the fix summary.
- `speclite-code-review-04-rules-extractor`: extracts reusable rules from historical CR, evaluation, and fix records.
- `speclite-code-review-05-todo-tracker`: maintains cross-Story CR TODO backlog.
- `speclite-code-review-06-finalizer`: syncs Story and workflow status after CR approval.

The Story Review workflow lives under `sdlc-skills/3-solutioning/` and uses the 01-03 numbered chain:

- `speclite-story-review-01-reviewer`: reviews Epic-level or single-Story design and generates an SR summary.
- `speclite-story-review-02-evaluator`: evaluates SR findings and generates an evaluation document.
- `speclite-story-review-03-fixer`: updates Story documents according to evaluation conclusions and records the revision summary.

IR grill consistency review lives under `sdlc-skills/3-solutioning/`:

- `speclite-ir-grill-consistency-reviewer`: runs strict-serial implementation-readiness consistency grill across PRD, UX, Architecture, and Epics / Stories, and writes process records under `{planning_artifacts}/ir-grill`.

Epic-level goal orchestration workflows live under `sdlc-skills/4-implementation/`:

- `speclite-goal-orchestrator-epic-story-review-runner`: orchestrates strict-serial SR reviewer / evaluator / fixer loops for an Epic and keeps progress records under `story-reviews/.../goal-execute-records/`.
- `speclite-goal-orchestrator-epic-story-code-review-runner`: orchestrates strict-serial Dev Story and CR loops for every Story in an Epic and keeps progress records under `code-reviews/.../goal-execute-records/`.

The unnumbered `speclite-code-review` is no longer a canonical source skill entrypoint. Code review starts with `speclite-code-review-01-reviewer`, then continues through the numbered CR2/CR3/CR6 skills for evaluation, fixes, and finalization.

Review artifact directories are:

- `stories/`: Story spec files.
- `code-reviews/`: CR summaries, evaluations, and fix records.
- `story-reviews/`: SR summaries, evaluations, and revision records.
- `cr-rules/`: CR backlog, extracted rules, and cross-Story TODOs.
- `retrospectives/`: Epic/Sprint retrospective summaries.

### Support Skills

`support-skills/` contains authoring and validation tools for canonical skill source definitions:

- `speclite-skill-creator`: creates or migrates workflow-style Speclite skill packages.
- `speclite-skill-lint`: validates generic skill rules plus Speclite runtime and migration alignment.
- `speclite-agent-creator`: creates or migrates `speclite-agent-*` / `bmad-agent-*` role activation Agent definition packages.
- `speclite-agent-lint`: validates Agent-specific `[agent]` customization, persona, menu targets, prompt references, and runtime residue.
- `speclite-canonical-source-governance-runner`: classifies impact, records D1/D2 decisions, guides targeted edits, and closes with strict checker verification after hooks report canonical source changes.
- `speclite-check-canonical-source-change`: checks root counts, ecosystem category/package totals, `module-help.csv`, hooks, fixtures, docs, and packaging manifest after canonical source changes.

When maintaining canonical skill source definitions under `assets/source/speclite/`, use `speclite-skill-creator` and `speclite-skill-lint` for workflow-style Skills, `speclite-agent-creator` and `speclite-agent-lint` for Agent definition packages, and `speclite-canonical-source-governance-runner` plus `speclite-check-canonical-source-change` for canonical source change closure. Do not fall back to the generic creator/lint skills from the external `skills-creator` repository.

### Hooks

`hooks/` currently contains two canonical hook packages:

- `flow-gate-enforcement`: checks story-kickoff Flow Gate evidence before `speclite-dev-story`.
- `canonical-source-change-check`: warning-only reminder to run canonical source consistency checks after `assets/source/speclite/` changes.

During install, the installer projects each hook's `runner.mjs` and `hook-manifest.json` to `_speclite/hooks/<hook-id>/`, then merges `.claude/settings.json` and `.codex/hooks.json`. Codex hook config uses the event-keyed `{"hooks": {"Event": [...]}}` shape.

## Validation Guidance

For a changed skill package, run scoped checks rather than broad repository diffs:

```sh
rg -n '_bmad|config\.yaml|/bmad:|bmad-|BMAD|BMad|assets/source/speclite/(src|scripts|custom)' assets/source/speclite/<path-to-skill> --glob '!CHANGELOG.md'
/usr/bin/find assets/source/speclite/<path-to-skill> -maxdepth 1 -type f -name '*.md' -print | sort
```

Also check editor diagnostics for the target skill package and verify that `metadata.version` matches the latest `CHANGELOG.md` entry.

For `speclite-agent-*` packages, use the Agent-specific checker:

```sh
python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <agent-dir>
python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills
```

After changing `assets/source/speclite/`, run the canonical source change checker:

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict
```

The `canonical-source-change-check` hook is a warning-only guardrail and does not replace release verification. Changes touching ecosystem modules, fixtures, or packaging manifests still require `npm run build`, focused tests / fixture gates / canonical source check, and finally `npm run release:packaging-check`.
