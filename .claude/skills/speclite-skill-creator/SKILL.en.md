---
name: speclite-skill-creator
description: "Creates complete Agent Skill packages through structured dialogue, including `SKILL.md`. Use when the user asks for speclite-skill-creator, create skill, new skill, build skill, generate skill, or package a workflow. Capable of progressive disclosure design, YAML frontmatter generation, reference structuring, script scaffolding, and trigger testing guidance."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.7.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview]
    Creates Agent Skills packages through structured interaction. It turns requirements into SKILL.md, SKILL.en.md, CHANGELOG.md, references/, scripts/, and assets/, using a scripted Workflow density gate to keep entry files concise.

[Core Capabilities]
    - **Requirement discovery**: Ask up to 3 questions to collect name, goal, triggers, inputs, outputs, catalog, and workflow steps.
    - **Workflow matching**: Recommend sequential, multi-MCP, iterative, context-aware, or domain-specific patterns. See `references/workflow-patterns.md`.
    - **Specification translation**: Generate three-part description, `speclite-` prefixed kebab-case name, allowed-tools, and metadata fields: `metadata.version`, `metadata.author`, and optional `metadata.catalog`.
    - **Bilingual entry generation**: Generate canonical Chinese SKILL.md and English mirror SKILL.en.md with aligned YAML, versions, directories, and execution semantics.
    - **Workflow density gate**: Use a deterministic script to count body length, Workflow length, and ratio, then extract workflow references when thresholds are triggered.
    - **Flow Gate guidance**: For workflow skills that advance Story/Epic state or depend on implementation anchors, generate Contract -> Functional -> Evidence gate wording and avoid fixed-path false gates.
    - **Progressive file organization**: Allocate core instructions, detailed knowledge, scripts, and templates across SKILL.md, SKILL.en.md, CHANGELOG.md, references/, scripts/, and assets/.
    - **Quality and testing guidance**: Enforce body length, language rules, naming, generation metadata, and trigger tests.

[Workflow]
    This Skill follows a sequential flow: collect requirements, plan structure, generate files, run density gate, and summarize delivery. Full steps are in `references/skill-creation-workflow.md`.

    Step 1: Collect and confirm requirements
        Read the Requirement Collection section in `references/skill-creation-workflow.md`. Ask at most 3 questions at a time and show a confirmation checklist before generation.

    Step 2: Plan file structure and generate entries
        Write first to `assets/source/speclite/<group>/<skill-name>/`, where `<group>` is `core-skills`, `sdlc-skills/<phase>`, or `support-skills`. Generate SKILL.md, SKILL.en.md, CHANGELOG.md, and optional references/, scripts/, and assets/. When an external forge mirror is needed, sync afterward to the matching `/Users/fancyliu/Repos/skills-creator/forge/speclite/` area.

    Step 3: Add Flow Gate guidance
        If the Skill advances Story/Epic state, consumes Story files, checks implementation anchors, or writes implementation artifacts, include flow-gate guidance in the entry or reference: fixed paths are hard gates only when required by an owning SPEC; otherwise describe the equivalent implementation policy.

    Step 4: Run Workflow density gate
        After drafting files, run `speclite-skill-lint/scripts/check_skill_density.py <skill-dir>` or this repository's equivalent script. The script result is the only decision source.

    Step 5: Extract Workflow when needed
        If any entry file satisfies `workflow_chars > 1500` and `workflow_ratio > 0.5`, create `references/<skill-name>-workflow.md` or equivalent. Keep only phase summary, reference loading conditions, and stop conditions in the entry Workflow.

    Step 6: Summarize completion
        Show the file tree, progressive disclosure layers, trigger test suggestions, version information, and follow-up entry points through `speclite-skill-lint`.

[Notes]
    - SKILL.md is the canonical Chinese document; SKILL.en.md is an English mirror with no extra capabilities, steps, limits, or triggers.
    - Every Skill must include SKILL.md, SKILL.en.md, and CHANGELOG.md with synchronized versions.
    - Chinese and English entry bodies must each stay under 5000 characters; Workflow density gate is a Warning-level quality rule, but creation must extract Workflow when triggered.
    - YAML frontmatter allows only name, description, license, allowed-tools, and metadata; metadata supports only `version`, `author`, and optional `catalog`.
    - Directory and name fields must be kebab-case, start with `speclite-`, and must not use reserved prefixes claude-*, codex-*, or anthropic-*.
    - Workflow skills that advance implementation state or check anchors must describe the owning SPEC, equivalent implementation policy, and Flow Gate report consumption.
    - Runtime outputs go under `.specskills/output/`; process analysis goes under `.specskills/docs/analysis/`.
    - Install test copies only into existing install roots; do not create `.codex/skills` when it does not exist.

[Generation Metadata]
    This Skill was generated by speclite-skill-creator. Update SKILL.md and SKILL.en.md together, and sync `assets/source/speclite/support-skills/speclite-skill-creator/` with installed copies.
