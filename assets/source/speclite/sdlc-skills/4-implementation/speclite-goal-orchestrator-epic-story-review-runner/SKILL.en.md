---
name: speclite-goal-orchestrator-epic-story-review-runner
description: "Use when the user asks for an Epic-level Story Review/SR strict-serial loop, fresh sub-agents, speclite-story-review-01/02/03, PLAN.md, EXPERIMENTS.md, EXPERIMENT_NOTES.md, or a final local commit."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
metadata:
  version: "1.0.1"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Goal Orchestrator Epic Story Review Runner

## Overview

This Skill is the global orchestration layer for Epic-level Story Review (SR) loops. It handles goal decomposition, strict serial execution, progress logging, loop gate decisions, and the final local commit. It does not replace the internal capabilities of `speclite-story-review-*` or `git-commit-convention`.

Core principle: each step must finish before the next begins. No parallel outer orchestration is allowed. If the user provides multiple Epics or an Epic range, process them one Epic at a time.

## When To Use

Use this Skill when the user asks for:

- Epic-level Story Review or SR execution.
- `speclite-story-review-01-reviewer epic {epic_id}`.
- `speclite-story-review-02-evaluator epic {epic_id}`.
- `speclite-story-review-03-fixer epic {epic_id}`.
- Repeating reviewer/evaluator/fixer until both review and evaluation pass.
- Maintaining `PLAN.md`, `EXPERIMENTS.md`, and `EXPERIMENT_NOTES.md`.
- A final Chinese Conventional Commit, local only, no push.
- Fresh sub-agents, strict serial execution, or no parallel execution.

Do not use this Skill when:

- Only one Story needs review and no full SR loop is needed.
- The user only wants one reviewer run.
- The user only wants a commit.
- The user is asking about status and has not requested execution.
- The user explicitly asks for parallel execution.

## Inputs

Extract from the user request:

- `epic_scope`: one Epic, such as `10`, or an explicit range/subset.
- `model`: default `GPT-5.5`; if unavailable, record the actual model.
- `runtime_config`: resolved with `speclite resolve config --project-root {project-root}`.
- `planning_artifacts`: from runtime config; default semantics are `{project-root}/_speclite-output/planning-artifacts`.
- `implementation_artifacts`: from runtime config; default semantics are `{project-root}/_speclite-output/implementation-artifacts`.
- `sr_dir`: `{implementation_artifacts}/story-reviews/epic-{epic_id}-story-review/`.
- `progress_record_dir`: `{sr_dir}/goal-execute-records/`.
- `plan_files`: `PLAN.md`, `EXPERIMENTS.md`, `EXPERIMENT_NOTES.md`.
- `commit_policy`: Chinese Conventional Commit, local only, no push.

If `epic_scope`, runtime config, or Epic/Story inputs cannot be located, ask the user instead of guessing.

## Speclite Adaptation

This runner must use the SpecLite runtime and current canonical skills:

- SR reviewer: `speclite-story-review-01-reviewer`.
- SR evaluator: `speclite-story-review-02-evaluator`.
- SR fixer: `speclite-story-review-03-fixer`.
- Final commit: `git-commit-convention`.

All Story, SR, and progress artifact paths must come from merged runtime config. Common runtime paths:

- Epic files: `{planning_artifacts}/epics/`.
- Story files: `{implementation_artifacts}/stories/`.
- Sprint status: `{implementation_artifacts}/sprint-status.yaml`.
- Story Review output: `{implementation_artifacts}/story-reviews/`.
- Goal execution records: `{implementation_artifacts}/story-reviews/epic-{epic_id}-story-review/goal-execute-records/`.

Fixed source paths, fixtures, schemas, commands, or file names are hard gates only when the owning SPEC says so. Otherwise use equivalent implementation policy and record the basis in `EXPERIMENT_NOTES.md`.

## Workflow

### Step 0: Preflight

Before starting any sub-agent:

1. Confirm the repository path and user goal.
2. Confirm `epic_scope`; expand ranges into a stable serial order.
3. Resolve runtime config and confirm `planning_artifacts` and `implementation_artifacts`.
4. Locate or create the current Epic `sr_dir` and `progress_record_dir`.
5. Cross-check the current Epic's Story list and statuses from `sprint-status.yaml`, `{implementation_artifacts}/stories/`, and `{planning_artifacts}/epics/`.
6. Check `progress_record_dir` for existing `PLAN.md`, `EXPERIMENTS.md`, and `EXPERIMENT_NOTES.md`.
7. Check `sr_dir` for existing SR review files, SR evaluation files, and fixer records.
8. Check git status and identify unrelated changes.
9. Decide whether this is a new run or a continuation.

For continuation runs, do not restart. Determine the next step from existing review/evaluation/fix artifacts, Story status, and git state.

### Step 1: Initialize Logs

Maintain three Chinese log files in the current Epic `progress_record_dir`:

- `PLAN.md`: plan, current state, checklist.
- `EXPERIMENTS.md`: each attempt, rationale, result.
- `EXPERIMENT_NOTES.md`: live judgment, decisions, risks.

`progress_record_dir` must be `sr_dir/goal-execute-records/`; do not write these three files directly in the `sr_dir` root.

Create missing files. Append or update current state without overwriting history.

### Step 2: Reviewer

Start a fresh sub-agent:

```text
/speclite-story-review-01-reviewer epic {epic_id}
```

Wait for completion, record output file, conclusion, finding count, and pass/fail status. Do not start evaluator before reviewer finishes.

### Step 3: Evaluator

Start a fresh sub-agent:

```text
/speclite-story-review-02-evaluator epic {epic_id}
```

Wait for completion, record evaluation file, conclusion, valid findings, and pass/fail status. Do not start fixer before evaluator finishes.

### Step 4: Gate

**Before deciding, first run `## Convergence Control` (below)**: read this round's reviewer/evaluator outputs, update the convergence metrics in `PLAN.md`, and check the terminal-verdict set. If any of `PASS_WITH_VERIFY_OBLIGATIONS` / `ARCHITECTURE_TRIAGE` / `STOP_LOSS` fires, exit the loop per its routing and **do not enter fixer**.

If no convergence terminal verdict fires, use the latest reviewer and evaluator outputs:

- If reviewer passes and evaluator passes, exit the loop (`PASS`).
- If evaluator requires revisions, enter fixer.
- If evaluator rejects findings and no revision is needed, record the reason and either rerun reviewer or end based on the latest evaluation.
- If unclear, choose the most conservative traceable engineering decision and record it.

Never fabricate a pass conclusion to finish the loop. Likewise, never revise unboundedly chasing "0 P1" — `## Convergence Control` is a hard upper bound.

### Step 5: Fixer

If revisions are needed, start a fresh sub-agent:

```text
/speclite-story-review-03-fixer epic {epic_id}
```

The fixer may only revise Story documents and related planning artifacts within its responsibility according to evaluator conclusions. Record changed files, revision summary, verification, and residual risk. Then return to reviewer.

### Step 6: Next Epic Gate

For multiple Epics, move to the next Epic only when the current Epic has:

- Latest SR reviewer pass.
- Latest SR evaluator pass.
- Re-review/re-evaluation after any fixer work.
- Updated progress files.
- Rechecked Story list, SR artifacts, and git status.

### Step 7: Final Commit

After all target Epics pass, run:

```text
/git-commit-convention
```

Use a Chinese Conventional Commit, local only, no push. Audit git status first and include only changes from this Epic SR loop. Isolate or ask about unrelated worktree changes.

## Decision Policy

- Choose the most conservative, traceable option aligned with existing docs.
- Record decisions, reasons, and impact in `EXPERIMENT_NOTES.md`.
- Do not wait for routine engineering tradeoffs.
- Stop and ask before changing requirements, modifying unauthorized files, deleting content, pushing, or doing destructive operations.

## Convergence Control

The SR loop MUST be bounded, not an unbounded "repeat until pass". Run this section before every Gate (Step 4).

### Convergence metrics (record each round in `PLAN.md` and `EXPERIMENT_NOTES.md`)

- `round`: current round.
- `p1_accepted` / `p2_accepted`: P1 / P2 accepted by the evaluator this round.
- `p1_trend`: up / down / flat vs. the previous round.
- `doc_delta`: line-count growth of the reviewed Story design doc vs. the previous round (positive = the contract is growing).
- `category_recurrence`: whether this round's P1 categories repeat the last two rounds (e.g. totality/state-machine, lifecycle/concurrency, provenance/metadata, cross-doc drift).

### Thresholds (overridable in `references/sr-config.md` convergence block)

- `max_rounds`: default `5`.
- `stop_loss_consecutive_rounds`: default `3`.
- `doc_growth_watch`: default `on`.

### Terminal verdict set (check before Gate; on hit, exit per routing, do not enter fixer)

1. **PASS**: reviewer and evaluator both pass.
2. **PASS_WITH_VERIFY_OBLIGATIONS**: remaining blockers are only `verify-obligation` (properties decidable by compiler/tests) or `metadata/provenance` → stop the prose loop; hand `verify-obligation` items to implementation as tests; the Story design is ready.
3. **ARCHITECTURE_TRIAGE**: P1 migrates to authority / ownership / lifecycle / cross-component concurrency → stop per-finding prose revision; produce a one-shot architecture-decision input for the user/architect; do NOT keep iterating prose via fixer.
4. **STOP_LOSS**: `stop_loss_consecutive_rounds` consecutive rounds still produce NEW P1, or `round` reaches `max_rounds`, or `doc_growth_watch` triggers → stop the loop and report the convergence metrics plus candidate exits (accept current contract and implement / architecture triage / explicitly reduce scope) to the user; do NOT revise unboundedly.

### Reporting (the human is a data-informed circuit breaker)

On `STOP_LOSS` or `ARCHITECTURE_TRIAGE`, record and surface the convergence metrics (round, P1 trend, `doc_delta`, category recurrence); do not default to "authorize one more revision".

## Serial Execution Rules

- No parallel execution.
- Do not advance multiple Epics at once.
- Do not start multiple outer sub-agents at once.
- Wait for each step to finish.
- Any internal sub-agents used by `speclite-story-review-01-reviewer` belong to that Skill; the outer orchestrator remains serial.
- Update log files after each step.
- Each loop must show reviewer/evaluator/fixer status in the logs.

## Logging Rules

All log content must be Chinese.

`PLAN.md` includes goal, current Epic or range, steps, round, per-step status, and stop condition.

`EXPERIMENTS.md` records time, Epic ID, round, skill run, rationale, result, and next judgment.

`EXPERIMENT_NOTES.md` records live judgment, decision reasons, risks, watch items, and user intervention points.

## Completion Criteria

The run is complete only when:

- Each target Epic's latest `speclite-story-review-01-reviewer` conclusion passes.
- Each target Epic's latest `speclite-story-review-02-evaluator` conclusion passes.
- Any fixer work has been followed by review/evaluation.
- Progress files are updated.
- Git status is audited.
- A local Chinese Conventional Commit has been created with `git-commit-convention`.
- No push was performed unless explicitly requested.

## Common Mistakes

- Starting evaluator before reviewer completes.
- Starting fixer before evaluator completes.
- Treating reviewer internal parallelism as permission for outer parallelism.
- Advancing multiple Epics at once.
- Checking reviewer pass but ignoring evaluator status.
- Skipping re-review/re-evaluation after fixer.
- Overwriting log history.
- Including unrelated worktree changes in the final commit.
- Changing requirement boundaries because a recommendation exists.

## Invocation Template

```text
Epic {epic_id} SR goal:
1. Preflight runtime config, current progress, Epic file, Story files and git status.
2. Maintain PLAN.md, EXPERIMENTS.md, EXPERIMENT_NOTES.md under {implementation_artifacts}/story-reviews/epic-{epic_id}-story-review/goal-execute-records/.
3. Strictly serial:
   - speclite-story-review-01-reviewer epic {epic_id}
   - speclite-story-review-02-evaluator epic {epic_id}
   - speclite-story-review-03-fixer epic {epic_id} only when evaluation requires fixes
4. Repeat until reviewer and evaluator both pass, OR `## Convergence Control` fires a terminal verdict (round cap / stop-loss / architecture-triage / verify-obligations-only); never loop unbounded.
5. Run git-commit-convention in Chinese, local commit only, no push.
```
