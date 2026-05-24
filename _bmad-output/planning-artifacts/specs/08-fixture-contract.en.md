# Fixture Contract（Fixture 契约）

## Status（状态）

Accepted for MVP planning.

## Ownership（所有权）

This SPEC is the canonical contract for MVP fixture layout, expected outputs, snapshot comparison, and release gate classification.

- PRD owns product requirement and acceptance intent.
- Architecture owns implementation mapping and module responsibility.
- This SPEC owns fixture directory names, expected output classes, stable comparison rules, and release gate policy.
- Domain-specific specs own field semantics for their outputs.
- If PRD or Architecture text conflicts with this SPEC, this SPEC wins for fixture behavior.

## Fixture Classes（Fixture 分类）

MVP fixture cases:

| Fixture case | Release gate | Purpose |
| --- | --- | --- |
| `fresh-install-empty-project` | Yes | Fresh install, generated tree, manifest/index, IDE mirrors, ready summary gating. |
| `existing-install-update` | Yes | Update safety, ownership protection, conflict handling, planned/applied separation. |
| `ide-drift` | Yes | IDE mirror drift detection and repair planning. |
| `source-integrity` | Yes | Source descriptor trust/evidence and blocked/unverified behavior. |
| `resolve-parity` | Yes | Config/customization resolver parity for installed skills. |
| `path-portability` | Yes | Cross-platform path normalization, separators, executable bit, symlink/path escape, case behavior. |
| `skill-artifact-loop` | Regression asset | End-to-end skill activation and artifact metadata loop. |

Release gate fixtures must pass for MVP release on Node 22 and Node 24.

Regression assets are required repository assets but do not block MVP release unless the release checklist explicitly promotes them to a gate.

Release gate fixture runs must include macOS and Windows path-portability coverage before MVP release. Local developer runs may scope the matrix, but release evidence must include both supported OS families and both supported Node baselines.

## Directory Layout（目录布局）

Fixture case directories must use stable lower-kebab names.

Recommended layout:

```text
test/fixtures/<case>/
  input/
  expected/
    file-tree.txt
    manifest/
    command-json/
    validation-issues.json
    stderr-jsonl/
  README.md
```

`fixtures/sources/` may hold reusable source packages.

`fixtures/expected/` may hold shared expected snapshots, but each test must make the fixture case it validates explicit.

## Expected Output Classes（期望输出类别）

Every new module, adapter, source type, validation rule, ownership behavior, or installed artifact kind must update the relevant expected outputs:

- expected installed tree
- expected manifest/index snapshots
- expected command JSON output
- expected validation issue set
- expected stderr diagnostics when applicable
- expected file hashes or normalized file-tree summary

Fixture expected outputs are contract test assets, not documentation examples.

## Comparison Rules（比较规则）

Command JSON must be parsed and compared semantically.

Resolve stdout JSON must be parsed and compared semantically.

stderr JSON Lines must be parsed line-by-line and compared as `ValidationIssue` objects.

File content should be compared by normalized expected tree plus hash where the file is installer-owned. Human-owned and workflow-owned preservation should be asserted by content unchanged checks.

On Windows, fixtures must not require POSIX chmod behavior. They must still assert `executable` intent in files index entries and verify that generated script entry points are usable under the supported Windows invocation path.

Stable snapshot comparison may ignore only fields explicitly declared as non-stable by a SPEC, such as allowed generated metadata timestamps.

The following must not appear in stable expected outputs unless a SPEC declares and normalizes them:

- absolute paths
- home directories
- OS-specific separators
- timestamps
- random ids
- process ids
- environment variables
- credentials
- stack traces

## Ready Summary Gate（Ready Summary 门禁）

Fresh install must not display final ready summary until required release gate validation for that install path passes.

`install --json` must expose automation dependencies through structured fields such as `sourceDescriptor`, `manifestVersion`, `installedModules`, `ideTargets`, `paths`, `completedSteps`, and `pendingSteps`; fixture assertions must not depend on a free-form `readySummary` JSON blob.

## Change Policy（变更策略）

When a public contract changes, the same change must update:

1. the owning SPEC
2. the executable schema or parser if one exists
3. fixture expected outputs or contract tests
4. PRD/Architecture summaries only when product intent or implementation mapping changes

Implementation must not update snapshots first and then infer contract behavior from them.
