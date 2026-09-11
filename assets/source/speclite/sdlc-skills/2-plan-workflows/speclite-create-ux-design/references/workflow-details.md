# Create Ux Design Workflow Details

# Create UX Design Workflow

**Goal:** Create comprehensive UX design specifications through collaborative visual exploration and informed decision-making where you act as a UX facilitator working with a product stakeholder.

## Conventions

- Bare paths (e.g. `steps/step-01-init.md`) resolve from the skill root.
- `{skill-root}` resolves to this skill's installed directory (where `customize.toml` lives).
- `{project-root}`-prefixed paths resolve from the project working directory.
- `{skill-name}` resolves to the skill directory's basename.

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** for disciplined execution:

- Each step is a self-contained file with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation

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
- Run `speclite resolve artifact-roots --project-root {project-root}` and continue only when the result is `ok: true`, contains no blocking issue, and contains exactly one `planning_artifacts` root. Reuse its diagnostics and HALT with empty consumption and zero artifact/progress mutation otherwise. Use that root's `resolvedRoot` as `{planning_artifacts}` and preserve its `resolutionMode` for UX discovery evidence; do not implement a workflow-local root resolver.
- Use `{planning_artifacts}/ux` as the only canonical UX output boundary
- Use `{project_knowledge}` for additional context scanning

### Step 5: Greet the User

Greet `{user_name}`, speaking in `{communication_language}`.

### Step 6: Execute Append Steps

Execute each entry in `{workflow.activation_steps_append}` in order.

Activation is complete. Begin the workflow below.

## Paths

- `ux_artifacts` = `{planning_artifacts}/ux`
- `default_output_file` = `{planning_artifacts}/ux/ux-design-specification.md`
- `color_themes_file` = `{planning_artifacts}/ux/ux-color-themes.html`
- `design_directions_file` = `{planning_artifacts}/ux/ux-design-directions.html`
- `design_system_root` = `{planning_artifacts}/ux/design-system/` (on-demand; do not create it until a workflow actually writes a design-system artifact)

## UX Artifact Route Contract

- For a fresh workflow, create the three core artifacts only at the exact canonical paths above. Every other UX workflow-owned document, screenshot, generated page, stylesheet, image, or auxiliary asset must remain under `{ux_artifacts}`; never write it to the Planning root, `docs/`, or `{project_knowledge}`.
- For an existing workflow, discover the canonical main document first at `{planning_artifacts}/ux/ux-design-specification.md`. Only when it is absent, probe the exact legacy main document `{planning_artifacts}/ux-design-specification.md` read-only. If the legacy document exists, continue it in place and discover its legacy sibling HTML files without moving, copying, renaming, deleting, or rewriting paths in config. If both main documents exist, the canonical document wins and the legacy document remains untouched.
- Before reading or authorizing a write candidate, require a portable project-relative POSIX path and an explicit owner/intent. Canonical existing targets and the nearest existing ancestor of every canonical missing write target must resolve inside the real `{planning_artifacts}/ux` physical owner; selected legacy exact files must resolve inside the real Planning physical owner. The owner root must itself exist as an accessible directory and be physically unambiguous. `ENOTDIR`, a regular-file/FIFO parent, dangling symlink, cross-space/out-of-project symlink, unreadable entry, or dereferenced non-regular file must HALT with empty consumption/append target and zero artifact/frontmatter/progress mutation. Reuse the shared artifact-path diagnostics; do not add a UX-local issue taxonomy.
- An existing selected main document must contain valid workflow frontmatter with a non-empty integer `stepsCompleted` array. Missing or invalid state is a structured recovery halt: never treat it as fresh, never overwrite it, and preserve artifact/progress state unchanged.
- Record discovery evidence from the shared artifact-root resolver: `resolvedRoot`, `resolutionMode`, `actualConsumedPath`, `actualColorThemesPath`, and `actualDesignDirectionsPath`. For a canonical main, both supporting paths are canonical. For a legacy main, select each existing legacy sibling in place; select the exact canonical `{ux_artifacts}` path only for a missing sibling because it is a new artifact. Never create a missing sibling in the Planning root. Do not infer a second planning root or report legacy discovery as migration.
- Resolve every local Markdown link and every HTML `href` / `src` in the bounded Markdown inline/reference-style and HTML attribute subset. Normalized duplicate Markdown definitions are first-definition-wins; later definitions remain masked but never replace the first. For HTML attributes, ignore an explicit external scheme and a raw value beginning with literal `#` or `?`; any other local-ish raw value containing `&` must HALT as `unsupported-local-reference` before query/fragment stripping or decoding. Otherwise parse, strip query/fragment, percent-decode exactly once, reject encoded separators and unsupported local-ish forms, resolve relative to the containing UX artifact directory, then enforce lexical and `realpath` project containment plus readable regular-file type. Malformed encoding, undefined references, absolute/drive/backslash/network paths, traversal and symlink escapes HALT before mutation. Keep cross-document links relative to each selected artifact's containing directory.
- Execute every exclusive canonical `wx` create with `node "{skill-root}/scripts/ux-artifact-operation.mjs" create-file --project-root "{project-root}" --planning-root "{planning_artifacts}" --target "{target}" --source "{source-file}"`, where `{source-file}` supplies the exact bytes. Execute every on-demand `mkdir` with `node "{skill-root}/scripts/ux-artifact-operation.mjs" create-directory --project-root "{project-root}" --planning-root "{planning_artifacts}" --target "{target}"`. This single Skill-private implementation reruns the owner/intent and nearest-existing-ancestor guard against current filesystem state at commit time and immediately performs the filesystem operation; it is not a public `speclite` CLI. Each invocation must emit exactly one JSON object on stdout. Success requires exit `0` and `{ "ok": true, "targetPath": "...", "operation": "create-file|create-directory" }`. A non-zero exit, invalid JSON, or `ok !== true` must HALT without writing or advancing frontmatter, progress, consumption, or append target. Unknown flags fail closed. Create `{design_system_root}` and any other UX subdirectory only through this operation when its owning workflow first needs the directory. Installer guarantees `{ux_artifacts}` only.

## EXECUTION

- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`
- ✅ YOU MUST ALWAYS WRITE all artifact and document content in `{document_output_language}`
- Read fully and follow: `./steps/step-01-init.md` to begin the UX design workflow.


## Speclite Runtime Guardrails

- Runtime config is read from merged output of `speclite resolve config --project-root {project-root}`.
- `config.toml.example` in this Skill package is a field-structure reference only and is not a runtime fallback.
- Customization is resolved from merged JSON output of `speclite resolve customization --skill {skill-root} --project-root {project-root}`.
- Resolve customization with `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`.
- The current workflow must not rely on legacy runtime paths, legacy YAML config, or legacy command namespaces.
