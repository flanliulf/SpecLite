---
name: speclite-code-review-03-fixer
description: "根据 current CR v2 evaluation 执行有界修复或 verify-only 义务。用于用户要求 CR fix、apply review fixes、代码审查修复、verify obligation 或 test-only closure。核心能力：evaluation hash/scope 绑定、patch 与 verify-only 分流、反 churn 和 fresh review 交接。"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 03 Fixer

## Overview

This is the only CR01–06 step allowed to modify source or tests. It supports runner and manual fresh-session invocation and consumes only evaluator-authorized `patch` or `verify-only` obligations from the current `speclite.cr-evaluation.v2`.

## Activation Boundary

- Use it to execute evaluator-accepted and explicitly bounded fixes or verification obligations.
- Do not use it to evaluate findings, absorb deferred/TODO items, change requirements, update Stories/trackers, or authorize finalization.

## Core Capabilities

- **Authorized scope**: Consume only obligations explicitly approved by the current evaluation.
- **Mode separation**: Keep production patch and verify-only evidence work strictly separate.
- **Churn protection**: Detect repeated fixes, location migration, and architecture categories.
- **Freshness handoff**: Record the fix and require a fresh review/evaluation cycle.

## Contract

Resolve the current Skill directory parent as `{skills-root}`, fully read `{skills-root}/speclite-code-review-contract/references/cr-contract.md`, then run `speclite resolve config --project-root {project-root}`. Consume only the `crDir` passed by the runner or manual orchestrator from `speclite resolve cr-directory`; never re-derive the CR directory. HALT on failure; never depend on a runner or old artifact.

## Inputs

- Story identity, `reviewSeries`, current evaluation, and `mode=patch | verify-only`.
- `confirmationPolicy`, `authorizationSource`, `orchestrationMode`, and `handoffTarget`; default missing confirmation policy to `explicit`.

## Workflow

Fully read and execute `references/fixer-workflow.md`:

1. Bind the current evaluation/hash/scope/round and exact mode.
2. Build an included/excluded plan and validate the authorization source.
3. Apply churn guard, minimal changes, and focused verification.
4. Update the single leading-frontmatter `fixRecord`, reread it, and hand off to fresh CR01/CR02.

HALT on hash/scope/round mismatch, incomplete authorization, an existing completed fix record, or failed verification. Fixer completion never directly authorizes finalization.

## Outputs and Handoff

- The durable output is the structured `fixRecord` plus the human-readable Fix Record in the evaluation artifact.
- On completion, return changed files, fingerprints, commands/results, caveats, and the next fresh reviewer/evaluator step.
- On churn/architecture detection, return a structured route recommendation to `handoffTarget`; manual mode returns to the manual orchestrator or user and never requires a runner to create the decision.

## Notes

- Do not modify Stories, trackers, requirement boundaries, or unauthorized files.
- Verify-only mode cannot change production semantics and cannot be downgraded to TODO.
- When work cannot complete, write `fixRecord.status: blocked`; never claim completion.
- Record the model, commands, and verification results truthfully; human-facing output is Chinese.

## Generation Metadata

This Skill is maintained through speclite-skill-creator. Update `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, and installed copies together.
