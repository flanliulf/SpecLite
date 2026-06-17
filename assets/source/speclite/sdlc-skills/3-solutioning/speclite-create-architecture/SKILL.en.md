---
name: speclite-create-architecture
description: "Creates SpecLite technical architecture decisions that let multiple AI agents implement consistently. Use when the user asks to create architecture, technical architecture, solution design, architecture design, or solution architecture. Capable of step-file orchestration, project-context-aware decisions, technology research, architecture `.md` output, and project-tree generation."
allowed-tools: Read, Write, Grep, Glob, Bash, WebSearch
metadata:
  version: "1.0.3"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Create Architecture

[Skill Description]
    Architecture decision collaboration engine for the Speclite solutioning phase. Through an 8-step micro-file workflow, partner with the user as architectural peer to discover and lock in every decision, pattern, and project structure that lets multiple AI agents implement the system consistently.

    Core goal: **prevent conflicting choices across AI agents** by explicitly fixing naming, structure, format, communication, and process patterns.

    **Your Role**: facilitator, peer to the user. You bring structured thinking and architecture knowledge; the user brings domain and product vision. **Never** auto-generate in place of user decisions; **forbid** any time estimation.

[Core Capabilities]
    - **Micro-file workflow orchestration**: 8 step files + continuation handler; each self-contains rules, A/P/C menu, and `stepsCompleted` advancement. See `references/workflow-steps.md`.
    - **Three-tier configuration**: `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow` resolves the `workflow` block. Load `workflow.persistent_facts` and merged runtime config.
    - **Continuation detection**: Auto-detect existing `*architecture*.md` and choose fresh vs continue by `stepsCompleted`; menu `[R]/[C]/[O]/[X]`.
    - **A/P/C collaboration menu**: After each content step, present Advanced Elicitation / Party Mode / Continue; only `C` persists and advances; A/P must return to the menu.
    - **Web-research-driven tech selection**: All versions verified live via WebSearch; **forbid** hard-coded versions; depth adapts to user skill level.
    - **Consistency patterns + project-tree lockdown**: Lock naming/structure/format/communication/process rules; generate a complete, concrete, executable project tree (no placeholders).
    - **Architecture validation and handoff**: Three-dimensional validation (consistency / coverage / implementation readiness) + Gap Analysis; output Completeness Checklist and Handoff.
    - **on_complete terminal directive**: Resolve `workflow.on_complete` and run as the final terminal directive before exit.

[Conventions]
    - Bare paths (e.g., `references/steps/step-01-init.md`) resolve relative to the skill root
    - `{skill-root}` = install dir of this skill (where `customize.toml` lives)
    - `{project-root}`-prefixed paths resolve relative to the project working dir
    - `{speclite-runtime-root}` = `{project-root}/_speclite`
    - `{skill-name}` = basename of the skill dir (`speclite-create-architecture`)

[Activation Flow]
    Once triggered, execute these 6 activation steps before [Execution Flow]. Exact procedure, lookup order, and merge rules in `references/activation-en.md` — read it in full.

    1. Confirm `speclite` is available, then resolve `workflow` via `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`
    2. Run `{workflow.activation_steps_prepend}` in order
    3. Load `{workflow.persistent_facts}` (`file:` entries loaded as path/glob under `{project-root}`)
    4. Load merged runtime config (`user_name`, `communication_language`, `document_output_language`, `planning_artifacts`, `project_knowledge`)
    5. Greet `{user_name}` in `{communication_language}`
    6. Run `{workflow.activation_steps_append}` in order

[Execution Flow]
    After activation, **read in full and follow** `references/steps/step-01-init.md`. All input-document discovery and initialization protocols live there.

    Full 8-step index (incl. Step 1b continuation handler), per-step A/P/C menus, frontmatter advancement rules, Step 8 terminal frontmatter, `on_complete` resolution, and the generation-footer rule are in `references/workflow-steps.md`.

    Input artifacts (PRD required, others optional), output (`{planning_artifacts}/architecture.md`), and the resource inventory (`references/steps/`, `data/`, `customize.toml`, `assets/architecture-decision-template.md`) are in `references/inputs-outputs.md`.

    On completion, run `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow.on_complete`; if non-empty, execute as the final terminal directive.

[Notes]
    Mandatory operational rules — including no-content-without-input, full step-file reading, A/P/C closure, time-estimation prohibition, WebSearch-verified versions, no-placeholder project tree, HALT on missing PRD, `on_complete` execution, and document footer — are all in `references/notes-en.md`. Read it in full and follow it.

[Generation Info]
    Generated by skills-creator. Sync forge/ and .claude/skills/ copies; manage versions via skills-upgrade.
