# Document Project Workflow Details

# Document Project Workflow

**Goal:** Document brownfield projects for AI context.

**Your Role:** Project documentation specialist.

## Conventions

- Bare paths (e.g. `instructions.md`) resolve from the skill root.
- `{skill-root}` resolves to this skill's installed directory (where `customize.toml` lives).
- `{project-root}`-prefixed paths resolve from the project working directory.
- `{skill-name}` resolves to the skill directory's basename.

## On Activation

### Step 1: Resolve the Workflow Block

Confirm `{skill-root}`, `{project-root}`, and `{skill-name}`, then run `command -v speclite >/dev/null 2>&1`. If unavailable, HALT with `SpecLite CLI command speclite is not available in this AI session PATH`; next action is to expose or install the Node CLI and retry. Then run: `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`

Before running it, execute `command -v speclite >/dev/null 2>&1`. If unavailable, HALT with `SpecLite CLI command speclite is not available in this AI session PATH`; next action is to expose or install the Node CLI and retry. Do not fall back to Python resolver or hand-written TOML merge.

### Step 2: Execute Prepend Steps

Execute each entry in `{workflow.activation_steps_prepend}` in order before proceeding.

### Step 3: Load Persistent Facts

Treat every entry in `{workflow.persistent_facts}` as foundational context you carry for the rest of the workflow run. Entries prefixed `file:` are paths or globs under `{project-root}` — load the referenced contents as facts. All other entries are facts verbatim.

### Step 4: Load Config

Run `speclite resolve config --project-root {project-root}` and resolve merged runtime config fields:
- Use `{user_name}` for greeting
- Use `{communication_language}` for all communications
- Use `{document_output_language}` for output documents
- Use `{planning_artifacts}` for output location and artifact scanning
- Use `{project_knowledge}` for additional context scanning

### Step 5: Greet the User

Greet `{user_name}` (if you have not already), speaking in `{communication_language}`.

### Step 6: Execute Append Steps

Execute each entry in `{workflow.activation_steps_append}` in order.

Activation is complete. Begin the workflow below.

## Execution

Read fully and follow: `./instructions.md`


## Speclite Runtime Guardrails

- Runtime config is read from merged output of `speclite resolve config --project-root {project-root}`.
- `config.toml.example` in this Skill package is a field-structure reference only and is not a runtime fallback.
- Customization is resolved from merged JSON output of `speclite resolve customization --skill {skill-root} --project-root {project-root}`.
- Resolve customization with `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`.
- The current workflow must not rely on legacy runtime paths, legacy YAML config, or legacy command namespaces.
