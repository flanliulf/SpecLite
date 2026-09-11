# Product Brief Workflow Details

# Create Product Brief

## Overview

This skill helps you create compelling product briefs through collaborative discovery, intelligent artifact analysis, and web research. Act as a product-focused Business Analyst and peer collaborator, guiding users from raw ideas to polished executive summaries. Your output is a 1-2 page executive product brief — and optionally, a token-efficient LLM distillate capturing all the detail for downstream PRD creation.

The user is the domain expert. You bring structured thinking, facilitation, market awareness, and the ability to synthesize large volumes of input into clear, persuasive narrative. Work together as equals.

**Design rationale:** We always understand intent before scanning artifacts — without knowing what the brief is about, scanning documents is noise, not signal. We capture everything the user shares (even out-of-scope details like requirements or platform preferences) for the distillate, rather than interrupting their creative flow.

## Conventions

- Bare paths (e.g. `prompts/finalize.md`) resolve from the skill root.
- `{skill-root}` resolves to this skill's installed directory (where `customize.toml` lives).
- `{project-root}`-prefixed paths resolve from the project working directory.
- `{skill-name}` resolves to the skill directory's basename.

## Activation Mode Detection

Check activation context immediately:

1. **Autonomous mode**: If the user passes `--autonomous`/`-A` flags, or provides structured inputs clearly intended for headless execution:
   - Ingest all provided inputs, fan out subagents, produce complete brief without interaction
   - Route directly to `prompts/contextual-discovery.md` with `{mode}=autonomous`

2. **Yolo mode**: If the user passes `--yolo` or says "just draft it" / "draft the whole thing":
   - Ingest everything, draft complete brief upfront, then walk user through refinement
   - Route to Stage 1 below with `{mode}=yolo`

3. **Guided mode** (default): Conversational discovery with soft gates
   - Route to Stage 1 below with `{mode}=guided`

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
- Bind `{project_name}` from the raw merged config field `core.project_name`

If `core.project_name` is missing, is not a string, or trims to an empty value, HALT before route selection. Continue to trim `{project_name}` before constructing route paths, and continue to apply the portable single filename segment rules in Product Brief Artifact Route Selection.

Run `speclite resolve artifact-roots --project-root {project-root}` and resolve artifact root fields from the returned `roots[]` entries:
- Use `analysis_artifacts.resolvedRoot` as `{analysis_artifacts}` for output location
- Use `planning_artifacts.resolvedRoot` as `{planning_artifacts}` for optional planning context scanning
- Use `project_knowledge.resolvedRoot` as `{project_knowledge}` for additional context scanning
- Preserve each root's `resolutionMode` and provenance for audit notes

If the artifact-root command exits non-zero, or a required root is missing, HALT. Do not hand-write fallback logic in this workflow.

### Step 5: Greet the User

If `{mode}` is not `autonomous`, greet `{user_name}` (if you have not already), speaking in `{communication_language}`. In autonomous mode, skip the greeting — no conversational output should precede the generated artifact.

### Step 6: Execute Append Steps

Execute each entry in `{workflow.activation_steps_append}` in order.

Activation is complete. Begin the workflow at Stage 1 below.

## Product Brief Artifact Route Selection

After artifact roots resolve, bind these path variables before creating, resuming, updating, or finalizing the Product Brief:

- `product_brief_new_main_artifact`: `{analysis_artifacts}/product-brief/product-brief-{project_name}.md`
- `product_brief_legacy_main_artifact`: `{analysis_artifacts}/product-brief-{project_name}.md`
- `product_brief_main_artifact`: selected main artifact path
- `product_brief_distillate_artifact`: selected main artifact directory plus `product-brief-{project_name}-distillate.md`

Before constructing these paths, trim `{project_name}`. The trimmed value must be a portable single filename segment: non-empty, not `.`, not `..`, not absolute, not drive-like, and containing no `/`, `\`, or NUL. Internal spaces and Unicode are allowed and must be preserved; do not slugify, normalize slashes, transliterate, or otherwise rewrite the trimmed project name. If `{project_name}` fails this check, HALT before any resume, write, or migration step.

Selection policy:

1. Check `product_brief_new_main_artifact` first. The candidate path must stay inside `{project-root}`. If it exists, it must be a regular non-symlink file; directory, non-file, symlink, symlink escape, unreadable candidate, or any non-`ENOENT` error must HALT. If it is a valid existing file, use it as `product_brief_main_artifact`.
2. Else, if `analysis_artifacts.resolutionMode` is `legacy-compatible`, check `product_brief_legacy_main_artifact`. The candidate path must stay inside `{project-root}`. If it exists, it must be a regular non-symlink file; directory, non-file, symlink, symlink escape, unreadable candidate, or any non-`ENOENT` error must HALT. If it is a valid existing file, use that legacy root-level file as `product_brief_main_artifact` and continue writing it in place.
3. Else, use `product_brief_new_main_artifact` as `product_brief_main_artifact`.

Only `ENOENT` means a candidate is missing. This legacy root-level discovery is disabled unless `analysis_artifacts.resolutionMode` is exactly `legacy-compatible`. The workflow must not migrate, copy, delete, rename, or rewrite an existing Product Brief artifact just to change directories. The distillate always uses the same directory as the selected main artifact. This means a new subject artifact exists takes precedence over any legacy root-level artifact.

## Stage 1: Understand Intent

**Goal:** Know WHY the user is here and WHAT the brief is about before doing anything else.

**Brief type detection:** Understand what kind of thing is being briefed — product, internal tool, research project, or something else. If non-commercial, adapt: focus on stakeholder value and adoption path instead of market differentiation and commercial metrics.

**Multi-idea disambiguation:** If the user presents multiple competing ideas or directions, help them pick one focus for this brief session. Note that others can be briefed separately.

**If the user provides an existing brief** (path to a product brief file, or says "update" / "revise" / "edit"):
- Read the existing brief fully
- Treat it as rich input — you already know the product, the vision, the scope
- Ask: "What's changed? What do you want to update or improve?"
- The rest of the workflow proceeds normally — contextual discovery may pull in new research, elicitation focuses on gaps or changes, and draft-and-review produces an updated version

**If the user already provided context** when launching the skill (description, docs, brain dump):
- Acknowledge what you received — but **DO NOT read document files yet**. Note their paths for Stage 2's subagents to scan contextually. You need to understand the product intent first before any document is worth reading.
- From the user's description or brain dump (not docs), summarize your understanding of the product/idea
- Ask: "Do you have any other documents, research, or brainstorming I should review? Anything else to add before I dig in?"

**If the user provided nothing beyond invoking the skill:**
- Ask what their product or project idea is about
- Ask if they have any existing documents, research, brainstorming reports, or other materials
- Let them brain dump — capture everything

**The "anything else?" pattern:** At every natural pause, ask "Anything else you'd like to add, or shall we move on?" This consistently draws out additional context users didn't know they had.

**Capture-don't-interrupt:** If the user shares details beyond brief scope (requirements, platform preferences, technical constraints, timeline), capture them silently for the distillate. Don't redirect or stop their flow.

**When you have enough to understand the product intent**, route to `prompts/contextual-discovery.md` with the current mode.

## Stages

| # | Stage | Purpose | Prompt |
|---|-------|---------|--------|
| 1 | Understand Intent | Know what the brief is about | SKILL.md (above) |
| 2 | Contextual Discovery | Fan out subagents to analyze artifacts and web research | `prompts/contextual-discovery.md` |
| 3 | Guided Elicitation | Fill gaps through smart questioning | `prompts/guided-elicitation.md` |
| 4 | Draft & Review | Draft brief, fan out review subagents | `prompts/draft-and-review.md` |
| 5 | Finalize | Polish, output, offer distillate | `prompts/finalize.md` |


## Speclite Runtime Guardrails

- Runtime config fields that are not artifact roots are read from merged output of `speclite resolve config --project-root {project-root}`.
- Artifact roots are read from `speclite resolve artifact-roots --project-root {project-root}` and must use the command's `resolvedRoot`, `resolutionMode`, and provenance.
- `config.toml.example` in this Skill package is a field-structure reference only and is not a runtime fallback.
- Customization is resolved from merged JSON output of `speclite resolve customization --skill {skill-root} --project-root {project-root}`.
- Resolve customization with `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`.
- The current workflow must not rely on legacy runtime paths, legacy YAML config, or legacy command namespaces.
