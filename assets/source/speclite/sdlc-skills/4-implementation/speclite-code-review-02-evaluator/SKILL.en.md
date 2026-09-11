---
name: speclite-code-review-02-evaluator
description: "独立评估最新 CR v2 review 并输出结构化 verdict。用于用户要求 CR evaluate、review assessment、代码审查评估、finding validation 或 false-positive analysis。核心能力：review hash 一对一绑定、反证验证、finding disposition、收敛判定和 read-only 安全。"
allowed-tools: Read, Write, Grep, Glob
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 02 Evaluator

## Overview

Independently evaluate the current `speclite.cr-review.v2` finding by finding and emit one bound `speclite.cr-evaluation.v2`. The Skill supports runner and manual standalone invocation and is strictly read-only except for the evaluation artifact.

## Activation Boundary

- Use it to validate reviewer findings, counterevidence, severity, disposition, and convergence.
- Do not use it to modify source/tests, run the fixer, register TODOs, update Stories/trackers, or replace the reviewer.

## Core Capabilities

- **One-to-one binding**: Bind Story, series, round, scope, and review hash exactly.
- **Independent validation**: Seek first-hand evidence, counterevidence, and severity boundaries for each finding.
- **Exact decisions**: Separate patch, verify-only, deferred, triage, and stop-loss routes.
- **Convergence metrics**: Compute new, recurred, resolved, and superseded states by fingerprint.

## Contract

Resolve the current Skill directory parent as `{skills-root}`, fully read `{skills-root}/speclite-code-review-contract/references/cr-contract.md`, then run `speclite resolve config --project-root {project-root}`. Consume only the `crDir` passed by the runner or manual orchestrator from `speclite resolve cr-directory`; never re-derive the CR directory. HALT on failure; never depend on a runner or old artifact.

## Inputs

- `crDir`, `compatibilityMode`, and `legacyArtifactPaths`: resolved by the runner or manual orchestrator through `speclite resolve cr-directory` and passed in; when omitted, call that CLI exactly once and never derive them any other way.
- Story identity, `reviewSeries`, and the current v2 review, or enough information to locate it independently.
- `orchestrationMode` and `handoffTarget`; default to manual standalone invocation when omitted.

## Workflow

Fully read and execute `references/evaluator-workflow.md`:

1. Locate the valid maximum-round review in the current series.
2. Bind the review hash, scope, and same-round evaluation identity.
3. Perform first-hand validation and active disconfirmation for every finding.
4. Emit an exact verdict, convergence metrics, and durable evaluation.

HALT for a degraded review or invalid schema/scope/quorum. Idempotently return an existing current evaluation for the same review hash; never create two current evaluations.

## Outputs and Handoff

- Use `assets/output-template.md` and write the evaluation canonical path defined by the shared contract.
- Return artifact path/hash, exact verdict, accepted obligations, convergence, and the single next state.
- Send the result to `handoffTarget`; manual mode returns directly to the manual orchestrator or user.

## Notes

- Never apply fixes or modify the review source, Story, or trackers.
- `VERIFY_REQUIRED` must enter verify-only execution and cannot be downgraded directly to TODO/finalizer.
- Legacy reviews provide historical counterevidence only and cannot authorize a v2 finalizer.
- When reviewer and evaluator use the same model, record an independence caveat and actively seek disconfirmation.
- Record the model and evidence truthfully; human-facing output is Chinese.

## Generation Metadata

This Skill is maintained through speclite-skill-creator. Update `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, `assets/`, and installed copies together.
