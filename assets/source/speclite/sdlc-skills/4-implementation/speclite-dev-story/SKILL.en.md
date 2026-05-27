---
name: speclite-dev-story
description: "Execute story implementation following a context filled story spec file as the developer agent. Use when user mentions 'dev this story', 'dev story', 'implement story', 'implement the next story in the sprint plan', 'develop story file', '开发 Story', '实现 Story', '执行 Story 实现', '继续开发 Story', '开发下一个 Story', '实现故事', '编码实现 Story', or provides a story file path. Capable of customize.toml three-tier resolution and config-driven activation, sprint-status driven story discovery and review-continuation detection, red-green-refactor implementation with multi-level testing and HALT triggers, definition-of-done validation per references/checklist.md, sprint-status synchronization preserving comments, and on_complete terminal directive execution."
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
metadata:
    version: "1.0.3"
    author: "fancyliu"
    catalog: "speclite"
---

[Skill Description]
    Story implementation engine for the SpecLite implementation phase, acting as the developer who consumes a context-filled story spec and executes every task/subtask in order. Drives a strict red-green-refactor cycle, authors comprehensive tests, runs full regressions, validates the Definition of Done, and finally marks the story as `review`.

    **Role (Developer):**
    - Communicate in `{communication_language}` with tone tailored to `{user_skill_level}`; generate documents in `{document_output_language}`
    - Only modify the story file in: Tasks/Subtasks checkboxes, Dev Agent Record (Debug Log, Completion Notes), File List, Change Log, Status
    - Execute steps in exact order; do NOT skip. NEVER stop for "milestones" or "session boundaries". Run continuously to story completion unless a HALT condition triggers or the user instructs otherwise
    - `{user_skill_level}` only affects conversation style, not code updates

[Core Capabilities]
    - **Three-tier customize resolution and config-driven activation**: run `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow` to resolve the `workflow` block; on failure, merge `customize.toml` / `{skill-name}.toml` / `{skill-name}.user.toml` in base→team→user order; load `persistent_facts` (with `file:` prefix support); resolve `project_name` / `user_name` / `communication_language` / `document_output_language` / `user_skill_level` / `implementation_artifacts` / `date` from `{project-root}/_speclite/config.toml`. See `references/activation.md`
    - **Story auto-discovery and review-continuation detection**: support explicit `{story_path}`; otherwise use `sprint-status.yaml` `story_location` or `{implementation_artifacts}/stories` to find the first `ready-for-dev` Story; detect "Senior Developer Review (AI)" and "Review Follow-ups (AI)" sections and extract verdict, unchecked items, and severity counts
    - **Test-driven implementation and quality gates**: enforce red-green-refactor (failing test first → minimal code to pass → refactor while green); author unit / integration / end-to-end tests; run existing tests to prevent regressions, run new tests, run lint/static checks; validate every Acceptance Criterion with explicit quantitative thresholds
    - **HALT, Flow Gate, and DoD validation**: run `story-kickoff` gate before state advancement and `story-completion` gate before `review`; HALT on out-of-scope dependencies, 3 consecutive failures, missing required config, or gate failure; NEVER mark a task `[x]` unless tests truly exist and pass
    - **Sprint-status synchronization**: flip `ready-for-dev → in-progress` at start and `in-progress → review` at completion; **preserve ALL comments and structure of sprint-status.yaml** (incl. STATUS DEFINITIONS); `[AI-Review]` follow-up tasks MUST be checked in BOTH Review Follow-ups and Senior Developer Review → Action Items
    - **on_complete terminal directive**: after the completion conversation, resolve and execute `workflow.on_complete` as the final terminal directive before exit

[Conventions]
    - Bare paths (e.g. `references/checklist.md`, `references/workflow-steps.md`) resolve from the skill root
    - `{skill-root}` resolves to this skill's installed directory (where `customize.toml` lives)
    - `{project-root}`-prefixed paths resolve from the project working directory
    - `{speclite-runtime-root}` resolves to the installed SpecLite runtime directory in the target project, i.e. `{project-root}/_speclite`
    - `{skill-name}` resolves to the skill directory's basename (i.e. `speclite-dev-story`)

[Execution Flow]
    Activation MUST run before the main workflow. Both are authoritatively defined under `references/`; this section provides only an overview and entry points.

    === Activation Flow (run first) ===
        See `references/activation.md` for the 6 steps:
        1. Resolve the `workflow` block (merge three tomls in base→team→user order if the script fails)
        2. Run `{workflow.activation_steps_prepend}`
        3. Load `{workflow.persistent_facts}` (`file:` prefix loaded as path/glob contents)
        4. Load config from `{project-root}/_speclite/config.toml`
        5. Greet `{user_name}` in `{communication_language}`
        6. Run `{workflow.activation_steps_append}`

    === Main Workflow (10 Steps) ===
        See `references/workflow-steps.md` for each step's full definition, all branches, exact output messages, and all HALT conditions. **Execute in exact order; do NOT skip.**

        - **Step 1**: find the next ready story and load it fully (three branches: explicit input / sprint-status discovery / non-sprint search; read `sprint-status.yaml` end-to-end; parse all story sections; identify the first incomplete task)
        - **Step 2**: load `{project_context}` and Story Dev Notes
        - **Step 3**: detect review continuation; extract verdict, unchecked items, severity; set `review_continuation` and `{pending_review_items}`
        - **Step 4**: run `speclite-flow-gate mode=story-kickoff`, then sync story status `ready-for-dev → in-progress`
        - **Step 5**: implement current task/subtask via red-green-refactor; record technical approach in Dev Agent Record → Implementation Plan; HALT immediately on triggers
        - **Step 6**: author unit / integration / end-to-end tests covering edge cases from Dev Notes
        - **Step 7**: run existing tests + new tests + lint/static checks; validate ACs with explicit thresholds; STOP and fix on any failure
        - **Step 8**: only when all validation gates pass and tests truly exist and pass, mark task `[x]`, update File List and Completion Notes; for `[AI-Review]` tasks check BOTH Review Follow-ups and Senior Developer Review → Action Items; record Change Log entry on review continuation; loop back to Step 5 if more tasks remain
        - **Step 9**: fill Anchor Evidence Summary, run `story-completion` gate, pass DoD, then sync sprint-status to `review`; HALT on any failure
        - **Step 10**: completion communication, explanations tailored to `{user_skill_level}`, suggest next steps (recommend running `code-review` with a DIFFERENT LLM), then resolve and execute `workflow.on_complete`

    === Paths ===
        - `story_file` = "" (explicit story path; auto-discovered if empty)
        - `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`

[Notes]
    - Directory name and YAML `name` stay kebab-case: `speclite-dev-story`
    - The 6 activation steps MUST run before the main workflow; missing `customize.toml` files may be skipped, but the merge rules are not optional
    - MUST read `sprint-status.yaml` end-to-end to preserve order — no skipping
    - The red-green-refactor cycle is mandatory; any HALT trigger fires immediately
    - NEVER implement anything outside the story's tasks/subtasks; NEVER mark a task `[x]` unless tests truly exist and pass
    - `[AI-Review]` follow-ups MUST be checked in BOTH Review Follow-ups and Senior Developer Review → Action Items
    - File List MUST include ALL new/modified/deleted files using paths relative to repo root
    - sprint-status.yaml updates MUST preserve all comments and structure (incl. STATUS DEFINITIONS); never overwrite with a truncated version
    - Definition of Done validation follows `references/checklist.md`; any failure triggers HALT
    - The completion sequence MUST resolve and execute `workflow.on_complete` as the final terminal directive
    - `config.toml.example` in this Skill directory is only a field-structure reference for the target project's `_speclite/config.toml`; never use it as a runtime fallback
    - Step details / output messages / branches / error handling are authoritative in `references/workflow-steps.md` and `references/activation.md`

[Generation Info]
    This skill is auto-generated by skills-creator. To modify, please synchronize forge/ and .claude/skills/ copies, or manage versions via skills-upgrade.
