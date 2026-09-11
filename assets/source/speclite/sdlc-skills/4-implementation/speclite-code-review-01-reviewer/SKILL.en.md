---
name: speclite-code-review-01-reviewer
description: "执行 Story code review，用 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查并生成 CR v2 结果。用于用户要求 CR、code review、代码审查、复审或 Story implementation review。核心能力：精确 scope、稳定 finding fingerprint、layer quorum 和结构化 verdict。"
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 01 Reviewer

## Overview

Perform a read-only three-layer review for one Story and emit `speclite.cr-review.v2`. The Skill supports runner orchestration and independent fresh-session use; it never modifies source, tests, Stories, or trackers.

## Activation Boundary

- Use it to freeze one Story's current review scope, run the three layers, and create the reviewer artifact.
- Do not use it to evaluate findings, apply fixes, register TODOs, finalize a Story, or orchestrate an Epic; use CR02–06 or the runner for those tasks.

- Hard gate: consume only the numeric Story identity, `reviewSeries`, and `crDir` resolved once and then frozen; implementations must not rederive a directory from Story title, name, slug, filename, or a local candidate.

## Core Capabilities

- **Exact scope**: Freeze declared, actual, and excluded files with `scopeHash` validation.
- **Three-layer quorum**: Combine Blind Hunter, Edge Case Hunter, and Acceptance Auditor.
- **Stable findings**: Filter noise and history drift using concrete failure scenarios and fingerprints.
- **Structured handoff**: Emit a `speclite.cr-review.v2` artifact that CR02 can bind exactly.

## Contract

Resolve the current Skill directory parent as `{skills-root}`, fully read `{skills-root}/speclite-code-review-contract/references/cr-contract.md`, then run `speclite resolve config --project-root {project-root}`. HALT on any failure; never use a runner, old artifact, or historical default path as fallback.

## Inputs

- Story path, `storyId`, or `storyKey`, plus `reviewSeries`.
- Runner mode requires the frozen `directoryContext` and all four verified directory fields; manual mode invokes the shared resolver once. Call the production context validator before any actual write.
- A review scope manifest, or a development record/user-specified commit range sufficient to build it independently.
- `orchestrationMode` and `handoffTarget`; default to manual standalone invocation when omitted.

## Workflow

Fully read and execute `references/reviewer-workflow.md`; keep the three-layer internal algorithm in `references/review-engine.md`. The entry retains these hard gates:

1. Resolve identity, current-series round, and runtime paths.
2. Freeze a complete scope including staged, unstaged, and untracked changes.
3. Run three fresh review layers and normalize findings.
4. Write the template, reread it, and hand off to CR02.

If `scopeExceptions` is non-empty, emit only `REVIEW_DEGRADED`. HALT when only 0/3 or 1/3 layers succeed. A complete pass recommendation requires 3/3 quorum.

## Outputs and Handoff

- Use `assets/output-template.md` and write the review canonical path defined by the shared contract.
- Return artifact path, hash, scope, round, verdict, layer status, and the next step `speclite-code-review-02-evaluator`.
- Send the result to `handoffTarget`; manual mode returns directly to the manual orchestrator or user and does not require a runner.

## Notes

- There is no finding quota; zero findings is valid with complete scope and 3/3 quorum.
- Do not present an old completion gate or historical test count as executed this round.
- Never run the same `storyId + reviewSeries + round` reviewer concurrently.
- Record the model, commands, and evidence sources truthfully; human-facing output is Chinese.

## Generation Metadata

This Skill is maintained through speclite-skill-creator. Update `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, `assets/`, and installed copies together.
