---
name: speclite-skill-lint
description: "Read-only review of Skill definitions when asked to lint, check or assess a Skill. Separate base format, Codex adaptation and SpecLite policy, reporting evidence and unchecked items; route Agent definition packages to speclite-agent-lint."
allowed-tools: Read, Bash, Grep, Glob
metadata:
  version: "3.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

## Overview

Review ordinary workflow Skills without modifying them. `references/rule-registry.json` is the shared authority consumed by the creator; derive counts from its rules and applicability. Separate static findings from behavior evidence and project policy from OpenAI requirements.

## Core Capabilities

- Identify actual targets and provenance, selecting base, Codex and SpecLite scopes.
- Review YAML, description goals and trigger boundaries while preserving evidenced host extensions.
- Review SpecLite names, versions, semantically equivalent mirrors, configuration and ecosystem contracts.
- Measure body and Workflow density deterministically, reporting missing and ambiguous sections.
- Review resource purpose, load routes, inputs, outputs, missing dependencies and stop conditions.
- Check optional Codex agents/openai.yaml without inferring host behavior from static files.
- Report source, scope, severity, method, status and reproducible evidence for every rule.

## Workflow

1. Read `references/lint-workflow.md`; locate the target and confirm profile / host. Route speclite-agent-*, bmad-agent-* or [agent] packages to dedicated lint.
2. Read `references/check-rules.md` and `references/rule-registry.json`. Resolve `{lint-root}` from the actual Skill location and run `python3 "{lint-root}/scripts/list_rules.py" "{target}" --profile speclite --host codex`. Adjust arguments to the target; external Skills default to base. This command only generates a pending checklist.
3. Review each registered rule using a safe YAML parser. Run `python3 "{lint-root}/scripts/check_skill_density.py" "{target}"` for density evidence. Do not execute target scripts as a substitute for read-only review.
4. Report PASS / FAIL / WARN / N/A / NOT_CHECKED with reasons, paths and suggestions; derive totals from results. On recheck, reread the target and contract and identify new and resolved findings.

## Notes

- Do not modify files, installed copies or external services. Bash is limited to trusted read-only checking tools.
- Error means a mandatory contract fails within the selected scope, not that every error is official. Warning indicates a quality recommendation; missing evidence means NOT_CHECKED.
- BODY-07 / BODY-08 consume density schema_version=2. Null metrics for missing / ambiguous Workflow are not zero or PASS. See the contract for project thresholds and semantic reference review.
- Chinese canonical, English mirror, versions, speclite- names and budgets apply only to SpecLite. Dedicated Agent lint governs optional Agent mirrors.
- Chinese entries use English-Chinese headings. English descriptions may be translated without changing trigger boundaries or identity.
- Do not infer resource purpose from code fences, trigger quality from quoted keyword counts, or permission isolation from allowed-tools.
- Any NOT_CHECKED prevents an all-pass claim. Static validation does not establish loading, activation or output quality.
- Maintain both entries, registry, references/scripts and CHANGELOG together; record source and installed-copy updates separately.
