---
name: speclite-agent-lint
description: "Validate SpecLite Agent definition packages against generic Skill and Agent-specific rules. Use when the user mentions speclite agent lint, lint speclite agent, check speclite agent, validate agent definition, 检查 Speclite Agent, Agent 规范检查, 检查 agent 定义, or asks to audit speclite-agent-* directories. Core capabilities: read-only validation of [agent], persona, menu, prompt references, runtime residue, and structured fix reports."
allowed-tools: Read, Grep, Glob, Bash
metadata:
  version: "1.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview]
    Speclite Agent Lint is a read-only validator for `speclite-agent-*` definition packages. It extends generic Skill checks with Agent-specific semantic checks, preventing `[agent]` packages from being misread as `[workflow]` packages, menu targets from drifting, persona activation semantics from being lost, and BMad runtime residue from becoming current instructions.

[Core Capabilities]
    - **Generic Skill compliance**: Validate YAML frontmatter, description, allowed-tools, metadata, version consistency, body length, required sections, and reference paths.
    - **Agent customization checks**: Confirm `customize.toml` exists, contains `[agent]`, has required persona fields, and follows array and table-array merge semantics.
    - **Activation flow checks**: Confirm the entry uses the Speclite resolver with `--key agent` and preserves persona, persistent facts, config loading, greeting, menu dispatch, and persistent identity.
    - **Menu integrity checks**: Verify unique `[[agent.menu]]` codes, non-empty descriptions, exactly one of `skill` or `prompt`, existing target Skills, and existing local prompt files.
    - **SpecLite runtime model checks**: Scan for `_bmad`, `config.yaml`, `/bmad:*`, source repository runtime dependencies, and config fallback misuse.
    - **Deterministic script checks**: Run `scripts/check_agent_skill.py` and use its auditable JSON result as evidence for the manual report.
    - **File classification checks**: Check root Markdown whitelist, prompt relocation, and `references/` versus `assets/` boundaries.
    - **Fix-plan reporting**: Report Critical / Major / Minor / Observation findings with evidence, impact, suggested adjustment, and verification.

[Workflow]
    1. Confirm the target Agent Skill directory, Skill name, or `--all` scan root. If neither path nor name is provided, ask instead of guessing.
    2. Read `references/lint-rules.md`; inspect the directory, `SKILL.md`, `CHANGELOG.md`, `customize.toml`, referenced files, assets, and local prompts.
    3. Run the read-only checker for a target directory: `python3 scripts/check_agent_skill.py <agent-dir>`. For batch scans, run `python3 scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills`.
    4. Apply generic rules: frontmatter, description, version, body sections, root files, reference paths, and naming.
    5. Apply Agent-specific rules: `[agent]`, activation flow, `--key agent`, persona semantics, menu items, prompt files, and persistent identity.
    6. Apply SpecLite-specific rules: runtime paths, `_speclite/config.toml`, custom fallback, BMad residue, and public source directory misuse.
    7. Output a report with `assets/report-template.md`, including conclusion, Findings, adjustment plan, and verification advice.
    8. On re-check requests, rerun the full scan and mark fixed, new, and still-open findings.

[Notes]
    - This Skill belongs to `support-skills/`; it supports SpecLite canonical skill source validation and is not part of the default target-project SDLC runtime install set.
    - It is read-only and must never modify target Agent Skill files.
    - `scripts/check_agent_skill.py` is the deterministic evidence source; the manual report must not contradict its Critical/Major conclusions.
    - Agent `customize.toml` must carry `[agent]` and must not be checked with workflow-only rules.
    - Agent package `SKILL.en.md` is not mandatory. When present, it must match the Chinese canonical entry for version and runtime model.
    - `CHANGELOG.md` may mention BMad as historical source; `SKILL.md` and current references must not define BMad paths as runtime dependencies.
    - Missing menu targets are usually Major. A default dispatch path pointing to a missing required target may be Critical.
    - `prompt` references are executable instructions; missing or unmigrated prompt files break menu items.
    - Reports must be in Chinese, with workspace-relative paths.

[Generation Metadata]
    This Skill is maintained by speclite-agent-creator and included in the SpecLite support-skills system. Any change must keep `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, `assets/`, and `scripts/` synchronized.
