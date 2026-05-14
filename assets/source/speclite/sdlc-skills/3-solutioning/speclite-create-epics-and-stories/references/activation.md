# Activation Protocol

## Conventions

- Bare paths such as `references/workflow-steps.md` resolve from the skill root.
- `{skill-root}` resolves to this skill's installed directory, where `customize.toml` lives.
- `{project-root}` resolves to the project working directory.
- `{skill-name}` resolves to the skill directory basename.
- `{speclite-runtime-root}` resolves to `{project-root}/_speclite`.

## Workflow Architecture

This workflow uses step-file architecture for disciplined execution.

### Core Principles

- **Micro-file design**: each major phase is defined as a self-contained section in `references/workflow-steps.md`.
- **Just-in-time loading**: read the complete workflow reference first, then execute only the current step's instructions until it completes.
- **Sequential enforcement**: complete steps in order; no skipping, reordering, or optimization.
- **State tracking**: when writing `epics.md`, maintain `stepsCompleted` in frontmatter.
- **Append-only building**: initialize from `assets/epics-template.md`, then replace placeholders or append sections only as directed.

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire applicable reference file before taking action.
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order.
3. **WAIT FOR INPUT**: If a menu is presented, HALT and wait for user selection.
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed when the user selects `C`.
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before moving to the next step.
6. **LOAD NEXT**: When directed, continue to the next step in `references/workflow-steps.md`.

### Critical Rules

- Never process multiple steps as if they were one step.
- Always read the complete reference file before execution.
- Never skip steps or optimize the sequence.
- Always update frontmatter when a step writes final output.
- Always halt at menus and wait for user input.
- Never create mental todo lists from future steps while executing the current step.

## Activation Steps

### Step 1: Resolve the Workflow Block

Run:

```bash
python3 {speclite-runtime-root}/scripts/resolve_customization.py --skill {skill-root} --key workflow
```

If the script fails, resolve the `workflow` block yourself by reading these files in base → team → user order and applying the same structural merge rules:

1. `{skill-root}/customize.toml` — defaults
2. `{speclite-runtime-root}/custom/{skill-name}.toml` — team overrides
3. `{speclite-runtime-root}/custom/{skill-name}.user.toml` — personal overrides

Any missing file is skipped. Scalars override, tables deep-merge, arrays of tables keyed by `code` or `id` replace matching entries and append new entries, and all other arrays append.

### Step 2: Execute Prepend Steps

Execute each entry in `{workflow.activation_steps_prepend}` in order before proceeding.

### Step 3: Load Persistent Facts

Treat every entry in `{workflow.persistent_facts}` as foundational context for the rest of the workflow run. Entries prefixed with `file:` are paths or globs under `{project-root}`; load the referenced contents as facts. All other entries are literal facts.

### Step 4: Load Config

Load runtime config from `{project-root}/_speclite/config.toml` and resolve:

- Use `{user_name}` for greeting.
- Use `{communication_language}` for all communications.
- Use `{document_output_language}` for output documents.
- Use `{planning_artifacts}` for output location and artifact scanning.
- Use `{project_knowledge}` for additional context scanning.

If the runtime config is missing or any required field is empty, HALT and ask the user to provide or fix `{project-root}/_speclite/config.toml`. Do not use this skill package's `config.toml.example` as fallback.

### Step 5: Greet the User

Greet `{user_name}`, speaking in `{communication_language}`.

### Step 6: Execute Append Steps

Execute each entry in `{workflow.activation_steps_append}` in order.

Activation is complete. Begin `references/workflow-steps.md` at Step 1.
