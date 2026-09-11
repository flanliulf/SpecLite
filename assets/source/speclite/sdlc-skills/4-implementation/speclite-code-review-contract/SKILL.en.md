---
name: speclite-code-review-contract
description: "解析并验证 SpecLite CR v2 共享契约与审查产物。用于用户要求 CR contract、validate CR artifact、检查代码审查契约、验证 review/evaluation/fix/finalizer 绑定或手动编排 CR01–06。核心能力：统一身份与路径、校验 schema/verdict、验证 scope/round/hash/freshness，并提供独立于 runner 的只读契约入口。"
allowed-tools: Read, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review Contract

## Overview

This Skill owns the shared contract consumed by SpecLite CR01–06 and related runners. In a fresh session it independently resolves and validates CR v2 identity, paths, artifact schemas, verdicts, fingerprints, quorum, round binding, freshness, and closeout conditions without depending on a runner.

This Skill is read-only. It does not create review, evaluation, fix, TODO, or finalizer artifacts and does not modify source code, Stories, or trackers.

- Hard gate: consume only the numeric Story identity, `reviewSeries`, and `crDir` resolved once and then frozen; implementations must not rederive a directory from Story title, name, slug, filename, or a local candidate.

## Core Capabilities

- **Single contract source**: Treats `references/cr-contract.md` as the only normative CR v2 definition.
- **Independent operation**: Supports manually invoking CR01–06 in sequence without first invoking an Epic runner.
- **Structural validation**: Validates schemas, exact verdicts, Story identity, series, round, scope, and source hashes.
- **Freshness validation**: Checks freshness relationships across reviews, evaluations, fix records, and Flow Gates.
- **Closeout validation**: Validates canonical paths, schemas, and binding for rules-extraction, TODO-result, and finalizer durable reports.
- **CR directory routing**: Limits resolution to numeric identity, current-candidate ownership, and physical safety; the production validator compares frozen and consumer contexts before writes without owning approval or tracker rules.
- **Read-only diagnostics**: Reports exact inconsistencies and next steps without replacing reviewer, evaluator, fixer, or finalizer behavior.

## Workflow

1. Fully read `references/cr-contract.md`; HALT if it is unavailable.
2. Run `speclite resolve config --project-root {project-root}` and resolve merged `planning_artifacts` and `implementation_artifacts`; HALT on failure.
3. Build a unique `storyId -> storyKey -> storyFile` mapping, resolve one verified `crDir` through `scripts/resolve-cr-directory.mjs`, and locate the requested or current CR artifact.
4. Validate artifact schema, identity, path, series, round, hash, scope, verdict, freshness, and CR04–06 durable closeout binding against the shared contract.
5. Return a read-only result containing `VALID | INVALID | INCOMPLETE`, itemized evidence, and an exact next step; do not modify inspected files.

## Notes

- CR01–06 and runners consume this contract and must not duplicate its definitions.
- Runner/manual describes only the orchestration source; no CR Skill may treat a runner as the sole scope, authorization, convergence, or freshness authority.
- Fixed artifact paths are owned by this CR workflow contract. A target-project source path is a hard gate only when required by the owning SPEC; otherwise accept an equivalent implementation backed by test or fixture evidence.
- `SKILL.md` and `references/cr-contract.md` are Chinese canonical content; field names, enums, schema ids, hashes, and commands remain in English.
- `Bash` is limited to read-only resolver, hash, and status checks; do not write, delete, commit, or push.
- This Skill does not advance Story or Epic status and does not commit or push.

## Generation Metadata

This Skill is maintained through speclite-skill-creator. Update `SKILL.md`, `SKILL.en.md`, `CHANGELOG.md`, `references/`, and installed copies together.
