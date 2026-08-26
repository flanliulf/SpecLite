---
name: speclite-code-review-05-todo-tracker
description: "管理 CR TODO backlog，记录、检查、解决和列出延期改进项。用于用户要求 CR TODO、add TODO、resolve TODO、CR backlog、查看待办或批量提取 TODO。核心能力：维护待办状态、关联审查来源、输出可跟踪清单。"
allowed-tools: Read, Write, Glob, Grep, Edit
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 05 TODO Tracker

## Overview

Manage evaluator-accepted non-blocking items in `{implementation_artifacts}/cr-rules/cr-todo-backlog.md` and write a durable `speclite.cr-todo-result.v2` for Story closeout. The Skill supports runner and manual standalone invocation and never modifies source code.

## Activation Boundary

- Story closeout: map deferred fingerprints from the current evaluation into the backlog and create a durable result.
- Backlog utility: check, resolve, list, or extract items on user request; these operations never change the original evaluation verdict.
- Do not record P0/P1, `VERIFY_REQUIRED`, dismissed, or superseded findings.

## Core Capabilities

- **Add items**: Extract and confirm non-blocking deferred candidates from the current evaluation.
- **Check items**: Match open/in-progress entries by Story files or user-specified paths.
- **Resolve items**: Update status with resolving Story and commit/PR evidence.
- **List summaries**: Display backlog statistics grouped by T1/T2/T3.
- **Batch extract**: Deduplicate eligible deferred fingerprints across evaluations for the requested Story.

## Contract

Resolve the current Skill directory parent as `{skills-root}`, fully read `{skills-root}/speclite-code-review-contract/references/cr-contract.md`, then run `speclite resolve config --project-root {project-root}`. HALT on failure; never depend on a runner.

## Inputs

- `mode=add | check | resolve | list | extract` plus the Story/TODO identity required by that mode.
- `confirmationPolicy: explicit | preauthorized`; default to `explicit` when omitted.
- `authorizationSource`, `orchestrationMode`, and `handoffTarget`; authorization source is mandatory for `preauthorized`.

## Workflow

Fully read and execute `references/todo-tracker-workflow.md`, using `assets/output-template.md` for backlog maintenance and result generation.

Story closeout consumes only the current `speclite.cr-evaluation.v2` and excludes P0/P1, `VERIFY_REQUIRED`, dismissed, superseded, and fingerprint-less items. `preauthorized` may come from a runner goal record, manual orchestrator record, or explicit current user authorization; it never requires a runner.

## Outputs and Handoff

- After a backlog mutation, reread and validate numbering, fingerprint mapping, status, and statistics.
- For Story closeout, write the shared-contract `speclite.cr-todo-result.v2` canonical report. For project utility mode, return the same structured schema and save it to the utility path defined by the workflow reference.
- Return result path/hash, mapped fingerprints, backlog hash, and `COMPLETED | HALTED` to `handoffTarget`.

## Notes

- T1/T2/T3 are current non-blocking urgency levels and must not reuse CR P1/P2/P3.
- T1 means process before the next touch but does not change the original CR verdict.
- Never reuse an item number; store project-relative file paths.
- Human-facing output is Chinese; never modify source code.

## Generation Metadata

This Skill is maintained through speclite-skill-creator. Update `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, `assets/`, and installed copies together.
