---
name: speclite-goal-orchestrator-epic-story-code-review-runner
description: "Use when the user asks to run Epic Story development and CR in strict serial order, fresh sub-agents, speclite-dev-story, speclite-code-review-01..06, PLAN.md, EXPERIMENTS.md, EXPERIMENT_NOTES.md, or a final local commit."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
metadata:
  version: "1.0.2"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Goal Orchestrator Epic Story Code Review Runner

## Overview

This Skill is the global orchestration layer for Epic-level Story development and code review (CR) loops. It handles goal decomposition, strict per-Story serial execution, progress logging, CR gate decisions, CR closeout, and the final local commit. It does not replace the internal capabilities of `speclite-dev-story`, `speclite-code-review-*`, or `git-commit-convention`.

Core principle: advance only one Story and one step at a time. Each step must finish before the next begins. No parallel outer orchestration is allowed.

Story development entry gates must be explicitly run or verified by this runner. The project-level `flow-gate-enforcement` hook is only a deterministic guardrail for direct prompt execution; outer sub-agent dispatch must not assume that `UserPromptSubmit` hooks will fire.

## When To Use

Use this Skill when the user asks for:

- Running each Story in an Epic through fresh sub-agents.
- `speclite-dev-story` for each Story.
- `speclite-code-review-01-reviewer {story_id}`.
- `speclite-code-review-02-evaluator {story_id}`.
- `speclite-code-review-03-fixer {story_id}`.
- Repeating reviewer/evaluator/fixer until both review and evaluation pass.
- Running `speclite-code-review-04-rules-extractor`, `speclite-code-review-05-todo-tracker`, and `speclite-code-review-06-finalizer`.
- Maintaining `PLAN.md`, `EXPERIMENTS.md`, and `EXPERIMENT_NOTES.md`.
- A final Chinese Conventional Commit, local only, no push.
- Fresh sub-agents, strict serial execution, or no parallel execution.

Do not use this Skill when:

- Only one Story needs development and no CR loop is needed.
- The user only wants one CR reviewer run.
- The user is asking about status and has not requested execution.
- The user explicitly asks for parallel execution.
- The task is Story design review (SR); use the Epic Story Review runner instead.

## Inputs

Extract from the user request:

- `epic_id`: for example `5`.
- `story_scope`: all Stories under the Epic, or a user-specified subset.
- `model`: default `GPT-5.5`; if unavailable, record the actual model.
- `runtime_config`: resolved with `speclite resolve config --project-root {project-root}`.
- `planning_artifacts`: from runtime config; default semantics are `{project-root}/_speclite-output/planning-artifacts`.
- `implementation_artifacts`: from runtime config; default semantics are `{project-root}/_speclite-output/implementation-artifacts`.
- `cr_dir_pattern`: `{implementation_artifacts}/code-reviews/{story_id}-code-review/`.
- `progress_record_dir_pattern`: `{implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/`.
- `plan_files`: `PLAN.md`, `EXPERIMENTS.md`, `EXPERIMENT_NOTES.md`.
- `commit_policy`: Chinese Conventional Commit, local only, no push.

If `epic_id` or the Story list cannot be identified, ask the user instead of guessing.

## Speclite Adaptation

This runner must use the SpecLite runtime and current canonical skills:

- Story kickoff gate: `speclite-flow-gate`.
- Story development: `speclite-dev-story`.
- CR reviewer: `speclite-code-review-01-reviewer`.
- CR evaluator: `speclite-code-review-02-evaluator`.
- CR fixer: `speclite-code-review-03-fixer`.
- CR rules extractor: `speclite-code-review-04-rules-extractor`.
- CR TODO tracker: `speclite-code-review-05-todo-tracker`.
- CR finalizer: `speclite-code-review-06-finalizer`.
- Final commit: `git-commit-convention`.

All Story, CR, and progress artifact paths must come from merged runtime config. Common runtime paths:

- Epic files: `{planning_artifacts}/epics/`.
- Story files: `{implementation_artifacts}/stories/`.
- Sprint status: `{implementation_artifacts}/sprint-status.yaml`.
- Flow Gate output: `{implementation_artifacts}/flow-gates/`.
- Code Review output: `{implementation_artifacts}/code-reviews/`.
- CR rules and TODO output: `{implementation_artifacts}/cr-rules/`.
- Goal execution records: `{implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/`.

Fixed source paths, fixtures, schemas, commands, or file names are hard gates only when the owning SPEC says so. Otherwise use equivalent implementation policy and record the basis in `EXPERIMENT_NOTES.md`.

The `flow-gate-enforcement` hook does not replace this runner's explicit gate step. Before each Story starts development, the runner must confirm `{implementation_artifacts}/flow-gates/{story_id}-story-kickoff-gate.md` frontmatter metadata:

- `mode: "story-kickoff"`
- `target` and `storyKey` both match the current `story_id`
- `result` is `PASS` or `PASS_EQUIVALENT`
- `generatedAt` exists and is not older than the project's current hook freshness policy; if freshness cannot be judged, rerun the gate conservatively

## Workflow

### Step 0: Preflight

Before starting any sub-agent:

1. Confirm the repository path and user goal.
2. Confirm `epic_id`.
3. Resolve runtime config and confirm `planning_artifacts` and `implementation_artifacts`.
4. Cross-check the Epic Story list and each Story status from `sprint-status.yaml`, `{implementation_artifacts}/stories/`, and `{planning_artifacts}/epics/`.
5. Locate or create the current Story code review output directory and its `goal-execute-records/` execution record directory.
6. Check the execution record directory for existing `PLAN.md`, `EXPERIMENTS.md`, and `EXPERIMENT_NOTES.md`.
7. Check whether `{story_id}-story-kickoff-gate.md` exists in the current Story Flow Gate output directory, and record whether its metadata allows development.
8. Check the code review output directory for existing CR review files, CR evaluation files, fixer records, and finalizer records.
9. Check git status and identify unrelated changes.
10. Decide whether this is a new run or a continuation.

For continuation runs, do not restart. Determine the next step from Story status, CR artifacts, fix records, and git state.

### Step 1: Initialize Logs

Maintain three Chinese log files in the current Story code review directory's `goal-execute-records/` subdirectory:

- `PLAN.md`: overall plan, current Story, checklist, current state.
- `EXPERIMENTS.md`: each attempt, rationale, result.
- `EXPERIMENT_NOTES.md`: live judgment, current decisions, risks.

The execution record directory must be `{implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/`; do not write these three files directly in the code review output directory root.

Create missing files. Append or update current state without overwriting history.

### Step 2: Story Kickoff Flow Gate

Before starting the `speclite-dev-story` sub-agent, explicitly run or verify the current Story kickoff gate:

```text
/speclite-flow-gate mode=story-kickoff target={story_id}
```

Rules:

- Use `GPT-5.5`; if unavailable, record the actual model.
- If `{implementation_artifacts}/flow-gates/{story_id}-story-kickoff-gate.md` already exists, read YAML frontmatter metadata; do not infer the result from Markdown prose.
- Only `PASS` or `PASS_EQUIVALENT` may enter Story development. `FAIL_CONTRACT`, `FAIL_FUNCTION`, `FAIL_EVIDENCE`, `DECISION_NEEDED`, or missing/mismatched/stale metadata must stop development.
- If the gate does not pass, record the recommended next action from the gate report. Do not modify files outside the current Story/Epic unless the user explicitly authorized it.
- Record gate report path, result, any `PASS_EQUIVALENT` rationale, and the continue/stop decision in `PLAN.md`, `EXPERIMENTS.md`, and `EXPERIMENT_NOTES.md`.
- Do not rely on the `flow-gate-enforcement` hook as the only guard; this step is still required when the hook does not fire or is not enabled.

### Step 3: Story Development

Start a fresh sub-agent:

```text
/speclite-dev-story story {story_id}
```

Wait for completion and record changed files, verification commands, verification results, Story status, and residual risks. Do not start CR reviewer before development completes.

If the Story is already review-ready and development completion is evidenced, record the basis and skip to CR reviewer.

### Step 4: CR Reviewer

Start a fresh sub-agent:

```text
/speclite-code-review-01-reviewer {story_id}
```

Wait for completion and record review result file, conclusion, finding count, and pass/fail status. Do not start evaluator before reviewer finishes.

Any internal sub-agents used by `speclite-code-review-01-reviewer` belong to that Skill; the outer orchestrator remains serial.

### Step 5: CR Evaluator

Start a fresh sub-agent:

```text
/speclite-code-review-02-evaluator {story_id}
```

Wait for completion and record evaluation file, conclusion, valid findings, and pass/fail status. Do not start fixer before evaluator finishes.

### Step 6: CR Gate

Use the latest reviewer and evaluator outputs:

- If reviewer passes and evaluator passes, enter CR closeout.
- If evaluator requires fixes, enter fixer.
- If evaluator rejects findings and no fix is needed, record the reason and either rerun reviewer or end based on the latest evaluation.
- If unclear, choose the most conservative traceable engineering decision and record it.

Never fabricate a pass conclusion to finish the loop.

### Step 7: CR Fixer

If fixes are needed, start a fresh sub-agent:

```text
/speclite-code-review-03-fixer {story_id}
```

The fixer may only perform targeted fixes from evaluator conclusions. Wait for completion and record changed files, fix summary, verification, and residual risk. Then return to CR reviewer.

### Step 8: CR Closeout

After both reviewer and evaluator pass, start a fresh sub-agent and run these strictly in order:

```text
/speclite-code-review-04-rules-extractor {story_id}
/speclite-code-review-05-todo-tracker {story_id}
/speclite-code-review-06-finalizer {story_id}
```

Rules:

- No parallel execution.
- If CR4 or CR5 produces default recommendations, apply them only within the authorized scope and record the decision.
- If a recommendation modifies global docs, TODO, state files, or files outside the current Story/Epic scope, first confirm it is authorized; ask if uncertain.
- CR6 must confirm the Story can be marked Done and sync related status files.
- Update `PLAN.md`, `EXPERIMENTS.md`, and `EXPERIMENT_NOTES.md` after each Skill.

### Step 9: Next Story Gate

Move to the next Story only when the current Story has:

- `story-kickoff` Flow Gate result is `PASS` or `PASS_EQUIVALENT`, with metadata matching the current Story.
- Development completed.
- Latest CR reviewer pass.
- Latest CR evaluator pass.
- Re-review/re-evaluation after any fixer work.
- CR rules/todo/finalizer executed in order.
- Updated progress files.
- Completed Story status or explicit completion evidence.

### Step 10: Final Commit

After all target Stories in the Epic are complete, run:

```text
/git-commit-convention
```

Use a Chinese Conventional Commit, local only, no push. Audit git status first and include only changes from this Epic Story development and CR loop. Isolate or ask about unrelated worktree changes.

## Decision Policy

- Choose the most conservative, traceable option aligned with existing docs.
- Record decisions, reasons, and impact in `EXPERIMENT_NOTES.md`.
- Do not wait for routine engineering tradeoffs.
- Stop and ask before changing requirements, modifying unauthorized files, deleting content, pushing, or doing destructive operations.

## Serial Execution Rules

- No parallel execution.
- Do not advance multiple Stories at once.
- Do not start multiple outer sub-agents at once.
- Wait for each step to finish.
- Internal Skill parallelism belongs to that Skill; the outer orchestrator remains serial.
- Update log files after each step.
- Each loop must show development/reviewer/evaluator/fixer/closeout status in the logs.
- Each Story's `story-kickoff` gate must finish before development and be written to the logs.

## Logging Rules

All log content must be Chinese.

`PLAN.md` includes goal, current Epic, Story list and order, current Story, round, per-step status, and stop condition.

`EXPERIMENTS.md` records time, Story ID, round, skill run, rationale, result, and next judgment.

`EXPERIMENT_NOTES.md` records live judgment, decision reasons, risks, watch items, and user intervention points.

## Completion Criteria

The Epic CR loop is complete only when:

- Each target Story has a matching `story-kickoff` Flow Gate report with result `PASS` or `PASS_EQUIVALENT`.
- Each target Story has completed development.
- Each Story's latest `speclite-code-review-01-reviewer` conclusion passes.
- Each Story's latest `speclite-code-review-02-evaluator` conclusion passes.
- Any fixer work has been followed by review/evaluation.
- Each Story has run CR rules extractor, TODO tracker, and finalizer.
- Each Story's progress files are updated.
- Git status is audited.
- A local Chinese Conventional Commit has been created with `git-commit-convention`.
- No push was performed unless explicitly requested.

## Common Mistakes

- Advancing multiple Stories at once.
- Relying on implicit `flow-gate-enforcement` hook execution without explicitly running or verifying `story-kickoff` Flow Gate inside the runner.
- Starting `speclite-dev-story` when the `story-kickoff` gate is missing, failed, stale, or target-mismatched.
- Starting CR reviewer before development completes.
- Starting evaluator before reviewer completes.
- Starting fixer before evaluator completes.
- Treating reviewer internal parallelism as permission for outer parallelism.
- Checking reviewer pass but ignoring evaluator status.
- Skipping re-review/re-evaluation after fixer.
- Skipping rules extractor, TODO tracker, or finalizer after CR pass.
- Overwriting log history.
- Including unrelated worktree changes in the final commit.
- Changing requirement boundaries because a recommendation exists.

## Invocation Template

```text
Epic {epic_id} Story dev/CR goal:
1. Preflight runtime config, current progress, Epic file, Story list and git status.
2. For each Story, maintain PLAN.md, EXPERIMENTS.md, EXPERIMENT_NOTES.md under {implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/.
3. Strictly serial per Story:
   - speclite-flow-gate mode=story-kickoff target={story_id}; continue only on PASS/PASS_EQUIVALENT
   - speclite-dev-story story {story_id}
   - speclite-code-review-01-reviewer {story_id}
   - speclite-code-review-02-evaluator {story_id}
   - speclite-code-review-03-fixer {story_id} only when evaluation requires fixes
4. Repeat CR reviewer/evaluator/fixer until reviewer and evaluator both pass.
5. Run speclite-code-review-04-rules-extractor, speclite-code-review-05-todo-tracker, speclite-code-review-06-finalizer in order.
6. Move to the next Story only after the current Story is fully complete.
7. After all target Stories complete, run git-commit-convention in Chinese, local commit only, no push.
```
