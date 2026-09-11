# Correct Course Workflow Details

# Correct Course - Sprint Change Management Workflow

**Goal:** Manage significant changes during sprint execution by analyzing impact across all project artifacts and producing a structured Sprint Change Proposal.

**Your Role:** You are a Developer navigating change management. Analyze the triggering issue, assess impact across PRD, epics, architecture, and UX artifacts, and produce an actionable Sprint Change Proposal with clear handoff.

## Conventions

- Bare paths (e.g. `checklist.md`) resolve from the skill root.
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

- `project_name`, `user_name`
- `communication_language`, `document_output_language`
- `user_skill_level`
- `implementation_artifacts`
- `planning_artifacts`
- `project_knowledge`
- `date` as system-generated current datetime
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- Language MUST be tailored to `{user_skill_level}`
- Generate all documents in `{document_output_language}`
- DOCUMENT OUTPUT: Updated epics, stories, or PRD sections. Clear, actionable changes. User skill level (`{user_skill_level}`) affects conversation style ONLY, not document updates.

### Step 5: Greet the User

Greet `{user_name}`, speaking in `{communication_language}`.

### Step 6: Execute Append Steps

Execute each entry in `{workflow.activation_steps_append}` in order.

Activation is complete. Begin the workflow below.

## Paths

- `default_output_file` = `{planning_artifacts}/sprint-change-proposal-{date}.md`

## Input Files

| Input | Path | Load Strategy |
|-------|------|---------------|
| PRD | shared resolver subject `prd`; canonical `{planning_artifacts}/prd/` | FULL_LOAD |
| Epics | shared resolver subject `epics`; canonical `{planning_artifacts}/epics/` | FULL_LOAD |
| Architecture | shared resolver subject `architecture`; canonical `{solutioning_artifacts}/architecture/` | FULL_LOAD |
| UX Design | canonical `{planning_artifacts}/ux/ux-design-specification.md`; exact legacy fallback `{planning_artifacts}/ux-design-specification.md` | FULL_LOAD |
| PRD Validation Evidence | canonical `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`; legacy historical names remain discoverable in the PRD directory | SELECTIVE_LOAD |
| Spec | `{planning_artifacts}/*spec-*.md` (whole) | FULL_LOAD |
| Document Project | `{project_knowledge}/index.md` (sharded) | INDEX_GUIDED |

## Execution

### Document Discovery - Loading Project Artifacts

**Strategy**: Course correction needs broad project context to assess change impact accurately. Load all available planning artifacts.

Before writing the change proposal or mutating any source/progress state, run `speclite resolve artifact-documents --subject <subject> --project-root {project-root}` separately with `<subject>` set to `prd`, `epics`, and `architecture`. Load only each result's `consumedPaths` and record its evidence fields. If ambiguity is reported, ask for current-invocation selection and rerun the affected subject with `--selection whole|sharded`. Any `continuation=block` HALTs with zero artifact write and zero progress mutation. Do not define local precedence, combine shapes, load undeclared shards or migrate artifacts.

For UX, use Planning root evidence from `speclite resolve artifact-roots --project-root {project-root}`. Check canonical `{planning_artifacts}/ux/ux-design-specification.md` first and exact legacy `{planning_artifacts}/ux-design-specification.md` only when canonical is absent; record `resolvedRoot`, `resolutionMode`, and project-relative `actualConsumedPath`. Canonical wins when both exist. Load legacy in place without migration, copy, rename, delete, or config rewrite; resolve related local assets relative to the selected UX directory and reject project-root escapes. Spec and Document Project keep their current rules.

For PRD validation evidence, enumerate `{planning_artifacts}/prd/` read-only. Recognize canonical historical `prd-validate-report-{yyyy-MM-dd}.md` with a valid calendar date and legacy historical `validation-report-*.md`, `prd-validation-report-*.md`, `prd-validation-*.md`, `validate-prd-report-*.md`, or undated `prd-validation-report.md`. Load only reports relevant to the change trigger, record project-relative consumed paths, and preserve every report in place; never rename, migrate, overwrite, delete, or reuse a legacy basename as a producer default.

Before loading any canonical or legacy candidate, construct the logical Planning root and logical PRD owner from the portable project-relative resolver result; the logical PRD owner must be exactly `{planning_artifacts}/prd`. Require `realProject` to exist and be a directory. Require the logical Planning root to exist and resolve to a directory, then require `realPlanning` to be the same as or a descendant of `realProject`. Require the logical PRD owner to exist and pass a no-follow `lstat` as a directory or inspected entry, resolve it to the directory `realPrdOwner`, and require the normalized physical path of `realPrdOwner` to equal exactly `realPlanning/prd`; containment inside `realPlanning` alone is insufficient. Only then require the candidate to be a portable project-relative path, exist, have readable bytes, pass a no-follow `lstat` as a regular file and not a symlink, and have its `realpath` remain the same as or a descendant of `realPrdOwner`. Any failed owner-chain or candidate check, including a symlink, non-file, unreadable or missing candidate, external escape, or project-internal cross-space or redirect, must fail closed before content is loaded or parsed and record project-relative rejection evidence.

**Discovery Process for FULL_LOAD documents (Spec only; PRD/Epics/Architecture and UX use the governed rules above):**

1. **Search non-governed whole documents first** - This local pattern applies only to Spec (e.g., `*spec-*.md`)
2. **Check for non-governed sharded version** - If a Spec whole document is absent, look for its `index.md`
3. **If sharded version found**:
   - Read `index.md` to understand the document structure
   - Read ALL section files listed in the index
   - Process the combined content as a single document
4. **Priority**: This legacy procedure does not apply to PRD/Epics/Architecture or UX; use their explicit resolver-backed contracts above.

**Discovery Process for INDEX_GUIDED documents (Document Project):**

1. **Search for index file** - Look for `{project_knowledge}/index.md`
2. **If found**: Read the index to understand available documentation sections
3. **Selectively load sections** based on relevance to the change being analyzed — do NOT load everything, only sections that relate to the impacted areas
4. **This document is optional** — skip if `{project_knowledge}` does not exist (greenfield projects)

**Fuzzy matching**: Be flexible with document names — users may use variations like `prd.md`, `bmm-prd.md`, `product-requirements.md`, etc.

**Missing documents**: Not all documents may exist. PRD and Epics are essential; Architecture, UX Design, Spec, and Document Project are loaded if available. HALT if PRD or Epics cannot be found.

<workflow>

<step n="1" goal="Initialize Change Navigation">
  <action>Confirm change trigger and gather user description of the issue</action>
  <action>Ask: "What specific issue or change has been identified that requires navigation?"</action>
  <action>Verify access to project documents:</action>
    - PRD (Product Requirements Document) — required
    - Current Epics and Stories — required
    - Architecture documentation — optional, load if available
    - UI/UX specifications — optional, load if available
  <action>Ask user for mode preference:</action>
    - **Incremental** (recommended): Refine each edit collaboratively
    - **Batch**: Present all changes at once for review
  <action>Store mode selection for use throughout workflow</action>

<action if="change trigger is unclear">HALT: "Cannot navigate change without clear understanding of the triggering issue. Please provide specific details about what needs to change and why."</action>

<action if="PRD or Epics are unavailable">HALT: "Need access to PRD and Epics to assess change impact. Please ensure these documents are accessible. Architecture and UI/UX will be used if available."</action>
</step>

<step n="2" goal="Execute Change Analysis Checklist">
  <action>Read fully and follow the systematic analysis from: checklist.md</action>
  <action>Work through each checklist section interactively with the user</action>
  <action>Record status for each checklist item:</action>
    - [x] Done - Item completed successfully
    - [N/A] Skip - Item not applicable to this change
    - [!] Action-needed - Item requires attention or follow-up
  <action>Maintain running notes of findings and impacts discovered</action>
  <action>Present checklist progress after each major section</action>

<action if="checklist cannot be completed">Identify blocking issues and work with user to resolve before continuing</action>
</step>

<step n="3" goal="Draft Specific Change Proposals">
<action>Based on checklist findings, create explicit edit proposals for each identified artifact</action>

<action>For Story changes:</action>

- Show old → new text format
- Include story ID and section being modified
- Provide rationale for each change
- Example format:

  ```
  Story: [STORY-123] User Authentication
  Section: Acceptance Criteria

  OLD:
  - User can log in with email/password

  NEW:
  - User can log in with email/password
  - User can enable 2FA via authenticator app

  Rationale: Security requirement identified during implementation
  ```

<action>For PRD modifications:</action>

- Specify exact sections to update
- Show current content and proposed changes
- Explain impact on MVP scope and requirements

<action>For Architecture changes:</action>

- Identify affected components, patterns, or technology choices
- Describe diagram updates needed
- Note any ripple effects on other components

<action>For UI/UX specification updates:</action>

- Reference specific screens or components
- Show wireframe or flow changes needed
- Connect changes to user experience impact

<check if="mode is Incremental">
  <action>Present each edit proposal individually</action>
  <ask>Review and refine this change? Options: Approve [a], Edit [e], Skip [s]</ask>
  <action>Iterate on each proposal based on user feedback</action>
</check>

<action if="mode is Batch">Collect all edit proposals and present together at end of step</action>

</step>

<step n="4" goal="Generate Sprint Change Proposal">
<action>Compile comprehensive Sprint Change Proposal document with following sections:</action>

<action>Section 1: Issue Summary</action>

- Clear problem statement describing what triggered the change
- Context about when/how the issue was discovered
- Evidence or examples demonstrating the issue

<action>Section 2: Impact Analysis</action>

- Epic Impact: Which epics are affected and how
- Story Impact: Current and future stories requiring changes
- Artifact Conflicts: PRD, Architecture, UI/UX documents needing updates
- Technical Impact: Code, infrastructure, or deployment implications

<action>Section 3: Recommended Approach</action>

- Present chosen path forward from checklist evaluation:
  - Direct Adjustment: Modify/add stories within existing plan
  - Potential Rollback: Revert completed work to simplify resolution
  - MVP Review: Reduce scope or modify goals
- Provide clear rationale for recommendation
- Include effort estimate, risk assessment, and timeline impact

<action>Section 4: Detailed Change Proposals</action>

- Include all refined edit proposals from Step 3
- Group by artifact type (Stories, PRD, Architecture, UI/UX)
- Ensure each change includes before/after and justification

<action>Section 5: Implementation Handoff</action>

- Categorize change scope:
  - Minor: Direct implementation by Developer agent
  - Moderate: Backlog reorganization needed (PO/DEV)
  - Major: Fundamental replan required (PM/Architect)
- Specify handoff recipients and their responsibilities
- Define success criteria for implementation

<action>Present complete Sprint Change Proposal to user</action>
<action>Write Sprint Change Proposal document to {default_output_file}</action>
<ask>Review complete proposal. Continue [c] or Edit [e]?</ask>
</step>

<step n="5" goal="Finalize and Route for Implementation">
<action>Get explicit user approval for complete proposal</action>
<ask>Do you approve this Sprint Change Proposal for implementation? (yes/no/revise)</ask>

<check if="no or revise">
  <action>Gather specific feedback on what needs adjustment</action>
  <action>Return to appropriate step to address concerns</action>
  <goto step="3">If changes needed to edit proposals</goto>
  <goto step="4">If changes needed to overall proposal structure</goto>

</check>

<check if="yes the proposal is approved by the user">
  <action>Finalize Sprint Change Proposal document</action>
  <action>Determine change scope classification:</action>

- **Minor**: Can be implemented directly by Developer agent
- **Moderate**: Requires backlog reorganization and PO/DEV coordination
- **Major**: Needs fundamental replan with PM/Architect involvement

<action>Provide appropriate handoff based on scope:</action>

</check>

<check if="Minor scope">
  <action>Route to: Developer agent for direct implementation</action>
  <action>Deliverables: Finalized edit proposals and implementation tasks</action>
</check>

<check if="Moderate scope">
  <action>Route to: Product Owner / Developer agents</action>
  <action>Deliverables: Sprint Change Proposal + backlog reorganization plan</action>
</check>

<check if="Major scope">
  <action>Route to: Product Manager / Solution Architect</action>
  <action>Deliverables: Complete Sprint Change Proposal + escalation notice</action>

<action>Confirm handoff completion and next steps with user</action>
<action>Document handoff in workflow execution log</action>
</check>

</step>

<step n="6" goal="Workflow Completion">
<action>Summarize workflow execution:</action>
  - Issue addressed: {{change_trigger}}
  - Change scope: {{scope_classification}}
  - Artifacts modified: {{list_of_artifacts}}
  - Routed to: {{handoff_recipients}}

<action>Confirm all deliverables produced:</action>

- Sprint Change Proposal document
- Specific edit proposals with before/after
- Implementation handoff plan

<action>Report workflow completion to user with personalized message: "Correct Course workflow complete, {user_name}!"</action>
<action>Remind user of success criteria and next steps for Developer agent</action>
<action>Run: `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow.on_complete` — if the resolved value is non-empty, follow it as the final terminal instruction before exiting.</action>
</step>

</workflow>


## Speclite Runtime Guardrails

- Runtime config is read from merged output of `speclite resolve config --project-root {project-root}`.
- `config.toml.example` in this Skill package is a field-structure reference only and is not a runtime fallback.
- Customization is resolved from merged JSON output of `speclite resolve customization --skill {skill-root} --project-root {project-root}`.
- Resolve customization with `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`.
- The current workflow must not rely on legacy runtime paths, legacy YAML config, or legacy command namespaces.
