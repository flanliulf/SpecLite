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

## Implementation Anchor（实现锚点）

Implementation must provide `src/fixtures/fixture-contract.ts` as the executable contract-test anchor for fixture manifest parsing, expected-output comparison, and release gate classification. This module is not a second contract source; if it conflicts with this SPEC, this SPEC wins.

## Fixture Classes（Fixture 分类）

MVP fixture cases:

| Fixture case | Release gate | Purpose |
| --- | --- | --- |
| `fresh-install-empty-project` | Yes | Fresh install, generated tree, manifest/index, IDE mirrors, ready summary gating. |
| `existing-install-update` | Yes | Update safety, ownership protection, conflict handling, planned/applied separation. |
| `ide-drift` | Yes | IDE mirror drift detection and repair planning. |
| `source-integrity` | Yes | Source descriptor trust/evidence fixture group; see required sub-cases below. |
| `resolve-parity` | Yes | Config/customization resolver parity for installed skills. |
| `path-portability` | Yes | Cross-platform path normalization, separators, executable bit, symlink/path escape, case behavior. |
| `skill-artifact-loop` | Yes | Minimal end-to-end skill activation and artifact metadata loop. |

Release gate fixtures, required release-gate sub-cases, and release checklist gates must pass for MVP release on Node 22 and Node 24.

Regression assets are required repository assets but do not block MVP release unless the release checklist explicitly promotes them to a gate.

Packaging acceptance is a release checklist gate, not a fixture project case. It must produce a stable packaging manifest artifact and store expected assertions plus CI/release evidence; the fixture runner must not treat packaging acceptance as a `test/fixtures/<case>/` project directory.

The MVP release gate for `skill-artifact-loop` only validates installed IDE entry discovery, activation protocol, resolver access, and artifact metadata value ranges. Multi-skill scenarios, complex workflow narrative quality, human review conclusions, and richer documentation examples remain regression assets or Post-MVP validation and do not block MVP release.

Release gate fixture runs must include macOS and Windows path-portability coverage before MVP release. Local developer runs may scope the matrix, but release evidence must include both supported OS families and both supported Node baselines.

## Release Gate Ownership Matrix（发布门禁所有权矩阵）

| Gate class | Gate / Scope | Canonical owner | Evidence artifact | CI / Release scope |
| --- | --- | --- | --- | --- |
| Fixture project gate | `fresh-install-empty-project`, `existing-install-update`, `ide-drift`, `resolve-parity`, `path-portability`, `skill-artifact-loop` | This SPEC owns case naming, layout, gate classification, and comparison policy; domain-specific SPECs own the semantics of asserted fields. | `test/fixtures/<case>/input/**`, `test/fixtures/<case>/expected/**`, expected command JSON, manifest/index snapshots, validation issue set. | Must pass on Node 22 and Node 24 before MVP release; `path-portability` release evidence must include macOS and Windows. |
| Fixture group sub-case | `source-integrity/<sub-case>`, including the required sub-cases listed by this SPEC | This SPEC owns group/sub-case naming, gate classification, and required sub-case baseline; source descriptor, install plan, and validation taxonomy SPECs own source trust, planning, and issue id semantics. | `test/fixtures/source-integrity/<sub-case>/input/**`, expected command JSON, expected issues, redaction assertions. | Every required sub-case is an MVP release gate and must be updated when source type, trust/evidence, or redaction behavior changes. |
| Release checklist gate | `packaging-acceptance` | This SPEC owns release checklist gate classification and evidence requirements; Architecture owns packaging implementation mapping; source descriptor SPEC owns bundled source trust evidence semantics. | Stable packaging manifest artifact, package file inventory, expected assertions, CI/release evidence. | Must pass before MVP release; it is not a fixture project case, and the fixture runner must not treat it as `test/fixtures/<case>/`. |

## Source Integrity Fixture Sub-Cases（Source Integrity Fixture 子用例）

`source-integrity` is a fixture group, not a single broad scenario. The MVP release gate must cover at least these stable lower-kebab sub-cases:

| Sub-case | Release gate | Purpose |
| --- | --- | --- |
| `bundled-packaging-trusted` | Yes | Bundled source becomes `trusted` through packaging manifest, package hash, or package lock match. |
| `bundled-packaging-missing-evidence-blocked` | Yes | Bundled source without packaging evidence cannot become `trusted` and is blocked with a stable `source-integrity` issue. |
| `registry-lock-trusted` | Yes | Registry source becomes `trusted` through expected hash or lock match. |
| `registry-unverified` | Yes | Registry source with reproducible registry evidence but no hash/lock match remains `unverified` and may enter write planning only after explicit user selection. |
| `git-floating-blocked` | Yes | Git source with only branch, tag, or remote URL is blocked and produces a `source-integrity` issue. |
| `local-source-snapshot-unverified` | Yes | Local source snapshot with only allowlist-based reproducible evidence and no expected hash/lock match remains `unverified`. |
| `local-source-path-redacted` | Yes | Local source public JSON and fixture snapshots use display-safe labels and do not leak absolute local paths, home directories, or checkout roots. |
| `local-source-installed-state-blocked` | Yes | Local source pointing at `_speclite/`, IDE mirrors, `_speclite-output/`, fixture output, `node_modules/`, cache, temporary, or build output is blocked and produces `source-integrity.local-source-self-reference`. |
| `artifact-hash-mismatch-blocked` | Yes | Hash/lock mismatch for tarball, offline bundle, or local source snapshot is blocked. |
| `source-unreadable-blocked` | Yes | Registry unreachable, authentication required, tarball unreadable, and offline bundle unreadable use stable `source-integrity` issue ids and redact credentials/cache/temp paths. |

## Directory Layout（目录布局）

Fixture case directories must use stable lower-kebab names.

Fixture group sub-cases must use `test/fixtures/<group>/<sub-case>/`, where both `<group>` and `<sub-case>` are stable lower-kebab names.

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

test/fixtures/<group>/<sub-case>/
  input/
  expected/
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

When artifact metadata contains `generatedAt`, fixtures must only make a semantic assertion: the value matches the canonical UTC ISO string / JavaScript `Date.toISOString()` millisecond UTC form. Stable snapshots must normalize, omit, or separately mark this field as non-stable; they must not compare the concrete timestamp value.

Duration, elapsed time, p95 measurements, profiling samples, and per-step duration must not enter stable command JSON snapshots by default. If a command JSON schema explicitly introduces such a field, that field must be marked non-stable and normalized or excluded during fixture comparison.

Performance baselines, p95 duration, and regression percentages must be stored as release/performance evidence, not as stable command JSON or stable fixture snapshot fields. MVP may use a release checklist section or a separate non-stable `performance-evidence` artifact for these measurements; fixture assertions may verify evidence presence, measurement method, and pass/fail conclusion, but must not compare concrete wall-clock values.

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

Fresh install must not display final ready summary until the ReadyCheck required for that install path passes.

Machine-readable progress `stepId` must use a stable lower-kebab id such as `ready-check`. The human-readable progress step label may be `ready check`; the contract/internal guard name must be `ReadyCheck`. Fixtures may assert `stepId` ordering; the ready summary gate must bind to the `ReadyCheck` pass semantics rather than a free-form text label.

ReadyCheck is the install-internal minimum readiness check; it is not the same as full `speclite validate`. It must cover at least:

- manifest/index are readable, and the schema version is supported by the current runtime
- source descriptor projection exists and has a valid shape
- selected IDE mirrors exist, and required installed skill entries are visible
- `_speclite`, the configured artifact root, and required runtime paths exist
- the install command produced no blocking `ValidationIssue` or failed required step

ReadyCheck must not run a full hash scan, remote source access, remote freshness/provenance revalidation, implicit update check, or repair planning. Those detailed diagnostics belong to explicit `speclite validate`, install/update source resolution, or Post-MVP `doctor`.

`install --json` must expose automation dependencies through structured fields such as `sourceDescriptor`, `manifestVersion`, `installedModules`, `ideTargets`, `paths`, `completedSteps`, and `pendingSteps`; fixture assertions must not depend on a free-form `readySummary` JSON blob.

## Change Policy（变更策略）

When a public contract changes, the same change must update:

1. the owning SPEC
2. the executable schema or parser if one exists
3. fixture expected outputs or contract tests
4. PRD/Architecture summaries only when product intent or implementation mapping changes

Implementation must not update snapshots first and then infer contract behavior from them.
