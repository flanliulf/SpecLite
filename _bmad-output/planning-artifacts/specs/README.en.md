# Spec Contracts Index（SPEC 契约索引）

## Status（状态）

Accepted for MVP planning.

## Purpose（用途）

This index defines the implementation reading order and ownership boundary for MVP contracts.

Implementation agents must read the owning SPEC before implementing or changing behavior in that area. PRD and Architecture are summaries and mappings; they must not be treated as field-level contract sources when a SPEC exists.

## Reading Order（阅读顺序）

1. `01-command-result-json-contract.en.md`: public `CommandResult` JSON, issue model projection, schema anchor, ordering, path, timestamp, and summary policy.
2. `02-source-descriptor-contract.en.md`: source trust, integrity evidence, source staging/cache redaction, and validate no-network boundary.
3. `03-install-plan-contract.en.md`: source resolution plan, install/update/repair planning, write authorization, operation lock, safe writes, rollback boundary, and repair source policy.
4. `04-manifest-index-contract.en.md`: manifest/index installed-state projections, files index, phase coverage matrix, hashes, ownership projection, and installed metadata.
5. `05-ide-adapter-registry-contract.en.md`: MVP target ids, adapter definitions, target order, unsupported/failed status boundary, and command pointer non-goal.
6. `06-resolve-command-contract.en.md`: `speclite resolve` stdout/stderr, merge order, fallback, array merge, layer failure, and parity fixtures.
7. `07-validation-issue-taxonomy.en.md`: issue categories, issue ids, default severity, and validation fixture ownership.
8. `08-fixture-contract.en.md`: fixture layout, expected outputs, snapshot comparison, release gate ownership matrix, release gates, and regression asset policy.

## Implementation Anchors（实现锚点）

The `Implementation Anchor` in each owning SPEC is the executable schema/parser/registry entrypoint that implementation must reuse. MVP includes at least:

- `src/diagnostics/command-result-schema.ts`
- `src/source/source-descriptor-schema.ts`
- `src/installer/install-plan-schema.ts`
- `src/manifest/manifest-schema.ts`
- `src/ide/adapter-registry.ts`
- `src/config/resolve-output-schema.ts`
- `src/fixtures/fixture-contract.ts`

## MVP Non-Goals（MVP 非目标）

Do not implement these from Post-MVP summaries unless a future SPEC explicitly promotes them:

- branded Copilot/Cursor target ids or dedicated adapters
- command pointer artifacts
- top-level `speclite repair`
- `speclite sync`, `doctor`, `uninstall`, or migration commands
- backup/restore or standalone update report artifacts
- full source lockfile lifecycle management
- enterprise source policy, signatures, provenance verification, or allowlists
- coverage dashboards, trend reports, or multi-project rollups

## Change Rule（变更规则）

Contract changes must update the owning SPEC first, then implementation schemas/parsers, then fixtures. Snapshot changes must not define new behavior by themselves.
