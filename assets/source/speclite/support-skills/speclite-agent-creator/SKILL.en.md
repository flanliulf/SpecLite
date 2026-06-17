---
name: speclite-agent-creator
description: "Create or migrate SpecLite Agent definition packages while preserving persona, menu, customization, and runtime model. Use when the user mentions speclite agent creator, create speclite agent, migrate bmad agent, bmad agent to speclite, 创建 Agent, 迁移 BMad Agent, 生成 agent 定义, or asks to convert bmad-agent-* directories. Core capabilities: identify role activation skills, convert [agent] customization blocks, map menus, relocate prompt references, and hand off to agent lint."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview]
    Speclite Agent Creator creates or migrates Agent definition packages that follow the SpecLite runtime model. It handles `speclite-agent-*` / `bmad-agent-*` role activation skills whose core behavior is persona activation, `[agent]` customization, menu dispatch, and persistent identity until dismissal. It must not treat them as ordinary `[workflow]` Skills.

[Core Capabilities]
    - **Agent object detection**: Identify Agent definition packages centered on persona, `[agent]`, menu dispatch, and persistent identity.
    - **Persona preservation**: Preserve role name, title, icon, role, identity, communication_style, principles, persistent_facts, activation steps, and persistent identity rules.
    - **Runtime model conversion**: Convert `_bmad/scripts`, `_bmad/custom`, and `_bmad/bmm/config.yaml` to `{speclite-runtime-root}/scripts`, `{speclite-runtime-root}/custom`, and merged runtime config.
    - **Agent customization generation**: Preserve the `[agent]` namespace and structural merge rules in `customize.toml`; never convert it into `[workflow]`.
    - **Menu mapping and dependency planning**: Map `skill = "bmad-*"` menu items only to existing `speclite-*` targets, and record unresolved targets as risks.
    - **Prompt file classification**: Move executable prompt Markdown files from the Agent root into `references/` or `assets/` and update `{skill-root}` references.
    - **Lint-ready handoff**: Hand generated packages to `speclite-agent-lint` for Agent block, menu target, residue, version, and file classification checks.

[Workflow]
    1. Confirm inputs: source Agent directory, target Agent name, target phase directory, and whether an English entry is needed. Ask at most 3 missing questions at once.
    2. Read `references/creation-workflow.md` and `references/agent-migration-baseline.md`; build the source-target mapping instead of applying ordinary workflow Skill migration rules.
    3. Inventory the source package: read `SKILL.md`, `customize.toml`, root prompt Markdown files, `skill` and `prompt` menu references, runtime paths, and config fields.
    4. Plan the target tree under `assets/source/speclite/sdlc-skills/<phase>/<speclite-agent-name>/`; keep entry and config files at the root, specification documents in `references/`, and templates in `assets/`.
    5. Convert the entry and config: use SpecLite frontmatter, switch activation to the Speclite resolver with `--key agent`, and keep `customize.toml` under `[agent]`.
    6. Convert menus: map existing `bmad-*` targets to same-purpose `speclite-*` targets. Do not guess unavailable targets; record them in the risk list.
    7. Self-check and hand off: check BMad residue, Agent semantics, menu targets, referenced files, version consistency, and the root Markdown whitelist, then recommend `speclite-agent-lint`.

[Notes]
    - This Skill belongs to `support-skills/`; it supports SpecLite canonical skill source creation and migration, and is not part of the default target-project SDLC runtime install set.
    - This Skill migrates only Agent definition directories. Ordinary `bmad-*` workflow Skills continue to use `speclite-skill-creator`.
    - `customize.toml` must carry the default `[agent]` customization surface; it must not be converted to `[workflow]`.
    - Current runtime instructions must not depend on `_bmad`, `config.yaml`, `/bmad:*`, or source repository paths.
    - If generated, `config.toml.example` only documents target project runtime config fields and must not be used as fallback.
    - Agent package `SKILL.en.md` is optional. When present, it must match the Chinese canonical entry for version, paths, and activation semantics.
    - Local prompt files referenced by menu items must exist. If moved to `references/`, the prompt text must be updated too.
    - Do not remove persona, greeting, menu pause, fuzzy matching, or persistent identity semantics for formatting consistency.

[Generation Metadata]
    This Skill is maintained by speclite-agent-creator and included in the SpecLite support-skills system. Any change must keep `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, and related references synchronized.
