---
name: speclite-code-review-04-rules-extractor
description: "从历史 CR review、evaluation 与 fix 记录中提炼可复用开发规则。用于用户要求 extract CR rules、CR summary、代码审查经验总结或提取最佳实践。核心能力：分析多轮记录、识别重复问题、提出 project-context.md 等文档更新建议。"
allowed-tools: Read, Write, Grep, Glob
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 04 Rules Extractor

## Overview

Extract candidate rules from evaluator-accepted v2 CR evidence and write a durable `speclite.cr-rules-extraction.v2` report. The Skill supports runner and manual fresh-session use and never relies on chat context as completion evidence.

## Activation Boundary

- Use it to analyze one Story/current-series CR history, extract candidate rules, and assess global promotion eligibility.
- Do not modify global documents by default; apply suggestions only after the user separately authorizes exact target files.
- Do not reevaluate findings, apply fixes, register TODOs, or advance Story state.

## Core Capabilities

- **CR history analysis**: Read Story review, evaluation, and fix records.
- **v2 evidence filtering**: Consume only evaluator-accepted, non-dismissed/non-superseded findings with verification evidence.
- **Cross-Story promotion gate**: Require recurrence across at least two Stories or explicit user approval.
- **Common-pattern detection**: Track repeated invariant/fingerprint families and fix-introduced issues.
- **Rule extraction**: Produce avoidance guidance, principles, best practices, or exception notes.
- **Global-document suggestions**: Identify suitable project-context, architecture, or development-guide sections.
- **Durable output**: Write a structured report that a later fresh session can validate.

## Contract

Resolve the current Skill directory parent as `{skills-root}`, fully read `{skills-root}/speclite-code-review-contract/references/cr-contract.md`, then run `speclite resolve config --project-root {project-root}`. Consume only the `crDir` passed by the runner or manual orchestrator from `speclite resolve cr-directory`; never re-derive the CR directory. HALT on failure; never depend on a runner or old artifact.

## Inputs

- `crDir`, `compatibilityMode`, and `legacyArtifactPaths`: resolved by the runner or manual orchestrator through `speclite resolve cr-directory` and passed in; when omitted, call that CLI exactly once and never derive them any other way.
- Story identity, `reviewSeries`, and the current evaluation, or enough information to locate it independently.
- `orchestrationMode` and `handoffTarget`; default to manual standalone invocation when omitted.

## Workflow

Fully read and execute `references/rules-extractor-workflow.md`: collect eligible CR records, analyze model/finding timelines, extract candidate rules, decide global eligibility, and use `assets/output-template.md` to write the durable report.

When no valid current v2 evaluation exists, evidence is ineligible, or artifact identity/hash does not match, write `result: HALTED` and stop. Never promote legacy or superseded findings into global rules.

## Outputs and Handoff

- Write the rules-extraction canonical path defined by the shared contract with schema `speclite.cr-rules-extraction.v2`.
- Return report path/hash, eligible/excluded findings, candidate/global counts, and `COMPLETED | HALTED`.
- Send the durable result to `handoffTarget`; manual mode can use it to enter CR05 independently in a later fresh session.

## Notes

- Rules must be concrete, actionable, and scoped; never generalize a Story-specific detail.
- For Correct Course superseded findings, preserve only the migrated root invariant and do not inflate confidence by round count.
- Do not read or modify global documents outside the target-project scope without explicit user authorization.
- Record the model and evidence sources truthfully; human-facing output is Chinese.

## Generation Metadata

This Skill is maintained through speclite-skill-creator. Update `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, `assets/`, and installed copies together.
