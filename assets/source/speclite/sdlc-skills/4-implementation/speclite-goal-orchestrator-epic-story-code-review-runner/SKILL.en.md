---
name: speclite-goal-orchestrator-epic-story-code-review-runner
description: "按 Epic 对 Story 执行 strict serial 开发与 CR 闭环。用于用户要求 Epic Story runner、fresh sub-agent、code review loop、review/evaluate/fix/finalize 或 local commit。核心能力：显式 Flow Gate、结构化 CR v2 状态机、有界收敛、证据时效校验和安全收口。"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Goal Orchestrator Epic Story Code Review Runner

## Overview

Epic-level strict-serial orchestration for Story development, CR closure, Flow Gates, convergence, tracker sync, and local commit.

Advance one Story, outer agent, and state transition at a time. Route only from structured frontmatter.

## Activation Boundary

Use for an Epic or Story set requiring a full CR loop, fresh outer agents, goal records, strict serial execution, or local commit.

Do not use for isolated Story development, one CR role, read-only status, parallel Story execution, or SR work.

## Core Capabilities

- **Strict-serial orchestration**: Advance one Story and one outer state transition at a time.
- **Structured CR v2 routing**: Route by exact schema, verdict, scope hash, and round binding.
- **Bounded convergence**: Use finding fingerprints, quorum, churn, and stop-loss limits.
- **Resumable execution**: Derive one next state from current structured artifacts and goal records without repeating completed work.
- **Safe closeout**: Validate evidence freshness, TODO mapping, atomic tracker rereads, and local commit boundaries.

## Contract

Fully read `{skills-root}/speclite-code-review-contract/references/cr-contract.md`, the sole owner of shared CR identity, schemas, verdicts, rounds, freshness, and governance.

HALT if the contract is unavailable or required fields cannot be resolved.

## Inputs

- `epicId`: Target Epic.
- `storyScope`: All Epic Stories or an explicit subset.
- `projectRoot`: Target project root.
- `modelPolicy`: Current environment unless user-specified; record the actual model.
- `commitPolicy`: Local Chinese Conventional Commit; no push by default.
- `confirmationPolicy`: `explicit | preauthorized`; default `explicit`, changed only by confirmed authorization.

HALT when Epic, Story set, project root, or authorization is unclear.

## Runtime Activation

1. Run `speclite resolve config --project-root {projectRoot}`.
2. Read merged artifact roots and workflow tracker config.
3. Resolve the Skill parent as `{skills-root}` and read the shared contract.
4. HALT on resolution failure, empty required paths, or identity conflicts.
5. Never fall back to examples or historical default directories.

## Workflow

Fully read `references/runner-workflow.md` and execute Steps 0-12:

1. Resolve unique Story identity, legacy artifacts, and current records.
2. Require a current kickoff gate before fresh development.
3. Update all three records before every next state.
4. Freeze scope before review; HALT on `scopeExceptions`.
5. Run fresh reviewer then read-only evaluator; require v2 artifacts.
6. Run convergence before verdict routing or fixer.
7. Route fix to `patch` and verify to `verify-only`; then fresh review/evaluate.
8. Map deferred TODOs; triage, stop-loss, and decision-needed HALT.
9. Run rules -> TODO -> finalizer; advance only on structured `DONE`.
10. Audit Git scope, commit as authorized, and do not push by default.

## Decision Policy

- Record the most conservative traceable choice that does not expand requirements.
- Ask before requirement changes, unauthorized edits, deletion, push, triage, or stop-loss resolution.
- Never fabricate PASS or chase zero findings without bounds.
- Prefer different reviewer/evaluator models; otherwise seek counterevidence and record the caveat.

## Completion Criteria

Every target Story must satisfy:

- current valid kickoff gate and completed development;
- v2 review/evaluation bound by scope, series, and round;
- `PASS`, or mapped TODOs for `PASS_WITH_DEFERRED_TODOS`;
- fresh review/evaluation after the last source mutation;
- completion gate newer than that mutation;
- ordered rules, TODO, and finalizer completion;
- matching Story, sprint, and required trackers after reread;
- final-state `PLAN.md`, `EXPERIMENTS.md`, and `EXPERIMENT_NOTES.md`;
- audited Git scope and, unless explicit no-commit, a local Chinese `git-commit-convention` commit;
- no push unless explicitly requested.

## Notes

- No parallel Stories or outer steps; internal reviewer quorum may be parallel.
- Fixed paths are hard gates only when owned by a SPEC; otherwise accept equivalent implementation with test, fixture, snapshot, or command evidence.
- Legacy v1 artifacts cannot drive a v2 finalizer.
- Records are Chinese; technical identifiers remain English.

## Generation Metadata

Update both entries, `references/runner-workflow.md`, `CHANGELOG.md`, and installed copies together.
