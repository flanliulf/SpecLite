# Activation Flow — Detailed Specification (EN)

This document spells out the 6 activation steps that must be executed before entering the workflow. Refer to this file from `SKILL.en.md`.

## Activation Step 1: Resolve Workflow configuration block

- Execute: `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`
- On script failure, read the following three files in base → team → user order and apply the same structured merge rules as the resolver to parse the `workflow` block yourself:
    1. `{skill-root}/customize.toml` (defaults)
    2. `{speclite-runtime-root}/custom/{skill-name}.toml` (team override)
    3. `{speclite-runtime-root}/custom/{skill-name}.user.toml` (personal override)
- Skip any missing file. Merge rules:
  - Scalars override
  - Tables deep-merge
  - "Table arrays" keyed by `code` or `id` replace matched items by key and append new ones
  - Other arrays append

## Activation Step 2: Run prepend activation steps

- Execute each entry in `{workflow.activation_steps_prepend}` in order

## Activation Step 3: Load persistent facts

- Treat each entry in `{workflow.persistent_facts}` as foundational context for the entire workflow run
- Entries prefixed with `file:` are paths or globs under `{project-root}` — load the referenced file content as facts
- Other entries are used as literal facts

## Activation Step 4: Load configuration

Load and parse from merged output of `speclite resolve config --project-root {project-root}`:

- `[core].user_name` — for greeting
- `[core].communication_language` — use this language for all communication
- `[core].document_output_language` — use this language for all output documents
- `[modules.sdlc].planning_artifacts` — output location and artifact-scan root
- `[modules.sdlc].project_knowledge` — additional context-scan root

If the config file is missing or any required field is empty, HALT and ask the user to create or repair merged runtime config. `config.toml.example` documents the expected structure only and must not be used as a runtime fallback.

## Activation Step 5: Greet the user

- Greet `{user_name}` in `{communication_language}`

## Activation Step 6: Run append activation steps

- Execute each entry in `{workflow.activation_steps_append}` in order
