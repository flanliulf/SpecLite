---
name: speclite-skill-creator
description: "Creates complete Agent Skill packages through structured dialogue, including `SKILL.md`. Use when the user asks for speclite-skill-creator, create skill, new skill, build skill, generate skill, or package a workflow. Capable of progressive disclosure design, YAML frontmatter generation, reference structuring, script scaffolding, and trigger testing guidance."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.9.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview]
    Creates Agent Skills packages through structured interaction. It turns requirements into SKILL.md, SKILL.en.md, CHANGELOG.md, references/, scripts/, and assets/, with a density gate to keep entries concise.

[Core Capabilities]
    - **Requirement discovery**: Ask up to 3 questions for name, goal, triggers, inputs, outputs, catalog, and workflow steps.
    - **Workflow matching**: Recommend sequential, multi-MCP, iterative, context-aware, or domain-specific patterns.
    - **Agent routing detection**: Route `speclite-agent-*`, `bmad-agent-*`, or `[agent]` role activation packages to `speclite-agent-creator`.
    - **Ecosystem target routing**: Support `ecosystems/<category>/<id>`, write to `assets/source/speclite/ecosystems/<category>/<id>/<skill-name>/`, and prompt for metadata, help row, version, and changelog sync.
    - **Specification translation**: Generate description, `speclite-` kebab-case name, allowed-tools, and metadata.
    - **Bilingual entry generation**: Generate aligned canonical Chinese SKILL.md and English SKILL.en.md for workflow Skills.
    - **Workflow density gate**: Run the density script and extract workflow references when triggered.
    - **Flow Gate guidance**: Add Contract -> Functional -> Evidence wording for implementation-state or anchor-dependent workflow Skills.
    - **Progressive file organization**: Split entry, reference, script, and template content across the package tree.

[Workflow]
    This Skill follows collect requirements -> plan structure -> generate files -> run density gate -> summarize delivery. Full steps are in `references/skill-creation-workflow.md`.

    Step 1: Collect and confirm requirements
        Read the Requirement Collection section in `references/skill-creation-workflow.md`. Ask at most 3 questions and show a confirmation checklist before generation. If the target is `speclite-agent-*`, `bmad-agent-*`, or has `[agent]`, stop and use `speclite-agent-creator`.

    Step 2: Plan file structure and generate entries
        Write first to `assets/source/speclite/<group>/<skill-name>/`, where `<group>` is `core-skills`, `sdlc-skills/<phase>`, `support-skills`, or `ecosystems/<category>/<id>`. For ecosystem targets, confirm `category`, `ecosystem_id`, `ecosystem-<category>-<id>` module code, `module-help.csv` row, CHANGELOG, SKILL.md / SKILL.en.md version sync, and runtime path wording.

    Step 3: Add Flow Gate guidance
        If the Skill advances Story/Epic state, consumes Story files, checks anchors, or writes implementation artifacts, include flow-gate guidance. Fixed paths are hard gates only when required by an owning SPEC.

    Step 4: Run Workflow density gate
        Run `speclite-skill-lint/scripts/check_skill_density.py <skill-dir>` or this repository's equivalent script. The script result is the only decision source.

    Step 5: Extract Workflow when needed
        If any entry satisfies `workflow_chars > 1500` and `workflow_ratio > 0.5`, create `references/<skill-name>-workflow.md` or equivalent and keep only routing text in the entry Workflow.

    Step 6: Summarize completion
        Show the file tree, disclosure layers, trigger test suggestions, version information, and `speclite-skill-lint` follow-up.

[Notes]
    - SKILL.md is the canonical Chinese document; SKILL.en.md is an English mirror with no extra capabilities, steps, limits, or triggers.
    - Every workflow Skill must include SKILL.md, SKILL.en.md, and CHANGELOG.md with synchronized versions.
    - Agent packages are the exception: `speclite-agent-*` `SKILL.en.md` is optional and governed by `speclite-agent-creator` and `speclite-agent-lint`.
    - Entry bodies must stay under 5000 characters; creation must extract Workflow when density is triggered.
    - YAML frontmatter allows only name, description, license, allowed-tools, and metadata; metadata supports only `version`, `author`, and optional `catalog`.
    - Directory and name fields must be kebab-case, start with `speclite-`, and must not use reserved prefixes claude-*, codex-*, or anthropic-*.
    - Ecosystem targets allow only `frontend`, `backend`, and `other`; this creator must not create `speclite-agent-*`, `bmad-agent-*`, or `[agent]` packages.
    - Workflow skills that advance implementation state or check anchors must describe owning SPEC, equivalent implementation policy, and Flow Gate report use.
    - Runtime outputs go under `.specskills/output/`; process analysis goes under `.specskills/docs/analysis/`.
    - Install test copies only into existing install roots; do not create `.codex/skills` when it does not exist.

[Generation Metadata]
    This Skill was generated by speclite-skill-creator. Update SKILL.md and SKILL.en.md together, and sync `assets/source/speclite/support-skills/speclite-skill-creator/` with installed copies.
