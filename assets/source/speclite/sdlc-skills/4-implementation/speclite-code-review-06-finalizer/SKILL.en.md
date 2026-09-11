---
name: speclite-code-review-06-finalizer
description: "在 current CR v2 evaluation 与 fresh completion gate 通过后 fail-closed 同步 Story 状态。用于用户要求 CR done、CR approved、mark done、关闭 Story 或 CR finalizer。核心能力：精确 verdict、scope/gate freshness、required tracker fail-closed 和写后重读一致性。"
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
metadata:
  version: "2.1.1"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 06 Finalizer

## Overview

Mark a Story done only when the current CR v2 state, fresh completion gate, and all required trackers agree, then write a durable `speclite.cr-finalizer.v2` report. The Skill supports runner and manual fresh-session invocation and independently validates every eligibility condition.

## Activation Boundary

- Use it to validate final CR/gate/tracker eligibility and apply minimal Story state synchronization.
- Do not use it to apply fixes, add tests, register TODOs, infer prose approval, commit Git changes, or close an Epic automatically.

## Core Capabilities

- **Exact eligibility**: Accept only a current, exactly bound, closable v2 verdict.
- **Evidence freshness**: Independently recompute scope and require a completion gate newer than the latest mutation/evaluation.
- **Tracker fail-closed**: Stop when any required tracker is missing, ambiguous, or unwritable.
- **Fail-closed closeout**: Prepare one change set, apply a coordinated write with before/after hashes, roll back in reverse on failure, and emit a durable result.

## Contract

Resolve the current Skill directory parent as `{skills-root}`, fully read `{skills-root}/speclite-code-review-contract/references/cr-contract.md`, then run `speclite resolve config --project-root {project-root}` for paths and required tracker configuration. Consume only the `crDir` passed by the runner or manual orchestrator from `speclite resolve cr-directory`; never re-derive the CR directory. HALT on failure; never depend on a runner.

## Inputs

- Story identity, `reviewSeries`, and the current evaluation, or enough information to locate it independently.
- `confirmationPolicy`, `authorizationSource`, `orchestrationMode`, and `handoffTarget`; default missing confirmation policy to `explicit`, and HALT when `preauthorized` lacks an `authorizationSource`.

## Workflow

Fully read and execute `references/finalizer-workflow.md`:

1. Independently resolve identity, current evaluation/review, and current scope hash.
2. Validate exact verdict, TODO mapping, and a fresh completion gate.
3. Validate Story, sprint, and configured required workflow trackers.
4. Prepare the change set, apply the fail-closed coordinated write, reread, and write the finalizer report.

HALT on any binding, freshness, TODO-mapping, or required-tracker failure. Never replace enum validation with prose words such as Approved or pass.

## Outputs and Handoff

- Use `assets/output-template.md` and write the finalizer canonical path defined by the shared contract.
- Return report path/hash, evaluation/gate binding, tracker writes/reread, and `DONE | HALTED`.
- A partial write must be `HALTED` with recovery actions. Manual mode returns the durable result directly to the manual orchestrator or user.

## Notes

- State may advance only from current review/in-progress to done; for an already-done Story, revalidate all evidence before an idempotent return.
- Missing required trackers and stale gates are blockers, not warnings.
- Only suggest an Epic completion gate; never update Epic status without explicit user authorization.
- Never commit or push. Human-facing output is Chinese and lists every exact written file.

## Generation Metadata

This Skill is maintained through speclite-skill-creator. Update `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, `assets/`, and installed copies together.
