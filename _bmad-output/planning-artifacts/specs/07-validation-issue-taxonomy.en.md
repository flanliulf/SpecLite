# Validation Issue Taxonomy（验证问题分类契约）

## Status（状态）

Accepted for MVP planning.

## Ownership（所有权）

This SPEC is the canonical taxonomy for `ValidationIssue.category`, issue id boundaries, default severity guidance, and fixture ownership.

`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.en.md` owns the public JSON shape of `ValidationIssue`. This SPEC owns the meaning and registry discipline behind issue categories and stable issue ids.

## Issue Id Policy（问题 ID 策略）

Issue ids must use:

```text
<category>.<stable-code>
```

Issue ids must not include path, IDE target, source name, hash, count, timestamp, random id, or any other dynamic value. Dynamic context belongs in `affectedPath`, `component`, or `details`.

Adding a new issue id is allowed in MVP when it follows the existing category boundary. Changing an existing issue id meaning is a breaking diagnostic contract change and requires fixture updates plus explicit migration notes.

Each MVP category must reserve a minimum issue id baseline before implementation. Producers must use reserved ids when the scenario matches; free-form issue ids are not allowed.

## Canonical Category Order（标准类别顺序）

MVP category order:

1. `environment`
2. `manifest-schema`
3. `source-integrity`
4. `ide-mirror`
5. `runtime-path`
6. `menu-target`
7. `legacy-namespace`
8. `artifact-path`
9. `file-integrity`
10. `operation-lock`
11. `update`

Command JSON sorting must use this order before normalized affected path and issue id.

## Category Boundaries（类别边界）

### `environment`

Use for command runtime/platform guard failures. It describes that the current execution environment cannot safely run an MVP command; it does not describe installed project state.

Examples:

- detected Node.js runtime does not satisfy the MVP required range
- detected OS/platform is outside the MVP supported platform policy

Default severity:

- `error` when the command must stop before reading or writing project files

Reserved MVP issue ids:

- `environment.unsupported-node`
- `environment.unsupported-platform`

`environment.unsupported-node` details must include at least `detectedVersion` and `requiredRange`. `environment.unsupported-platform` details must include at least `detectedPlatform` and `supportedPlatforms`. Details must not include absolute paths, home directories, environment variable values, timestamps, stack traces, or raw process dumps.

### `manifest-schema`

Use for installed manifest/index/schema version shape failures.

Examples:

- missing schema version
- unsupported manifest/index schema version
- migration needed for an older incompatible schema version
- malformed required manifest field
- schema corruption that blocks installed-state reads

Default severity:

- `critical` when required runtime contract is missing or corrupted
- `error` when validation cannot complete because installed metadata is unreadable

Reserved MVP issue ids:

- `manifest-schema.missing-version`
- `manifest-schema.unsupported-version`
- `manifest-schema.migration-needed`
- `manifest-schema.malformed-field`
- `manifest-schema.schema-corruption`

`manifest-schema.migration-needed` details must include:

- `currentSchemaVersion`
- `supportedSchemaVersion`
- `migrationKind`: `manual` | `automated-available` | `unsupported`
- `manualActionRequired`: boolean

MVP producers may emit only `migrationKind: "manual"` or `"unsupported"`. `"automated-available"` is a forward-compatible enum value and may be emitted by producers only after Post-MVP migration tooling is explicitly implemented and this SPEC is updated first.

Details must not include absolute paths, timestamps, free-form stack traces, or environment-specific text.

### `source-integrity`

Use for source resolver or install planning issues before installed files are trusted for writing.

Examples:

- missing integrity evidence
- hash mismatch
- lock mismatch
- unsupported source
- floating Git source without resolved commit SHA
- local source points at installed-state, execution-plane, workflow-output, dependency, cache, temporary, or build directories inside the target project
- Post-MVP source policy rejection
- registry unreachable
- authentication required
- unreadable local tarball
- unreadable offline bundle

Default severity:

- `error` when install/update must stop before writing

Do not use for installed file drift. Use `file-integrity` or `ide-mirror` instead.

Reserved MVP issue ids:

- `source-integrity.missing-evidence`
- `source-integrity.hash-mismatch`
- `source-integrity.lock-mismatch`
- `source-integrity.unsupported-source`
- `source-integrity.floating-git-source`
- `source-integrity.policy-rejected`
- `source-integrity.registry-unreachable`
- `source-integrity.authentication-required`
- `source-integrity.offline-bundle-unreadable`
- `source-integrity.tarball-unreadable`
- `source-integrity.local-source-self-reference`

Credentials, registry tokens, proxy secrets, and credential-bearing URLs must be redacted from `details`, `impact`, and `suggestedNextStep`.

`source-integrity.local-source-self-reference` details must include at least `reason: "local-source-self-reference"` and `blockedRootKind`. `blockedRootKind` must be a stable enum value such as `installed-state`, `execution-plane`, `workflow-output`, `dependency`, `cache`, `temporary`, or `build-output`; it must not contain raw absolute paths, home directories, checkout roots, cache paths, or temporary paths.

When local source points at target project blocked roots, producers must use `source-integrity.local-source-self-reference` and must not fall back to `source-integrity.unsupported-source`. `source-integrity.unsupported-source` is only for source types, source selectors, or source policy shapes that MVP does not support and that have no more specific reserved issue id.

### `ide-mirror`

Use for IDE execution-plane mirror problems.

Examples:

- target mirror missing a canonical skill
- target mirror content hash differs from canonical package hash
- duplicate target entry for one canonical skill
- target directory cannot represent required self-contained skill entry

Default severity:

- `error` when the IDE entry is unusable or content drift is detected
- `warning` when a target is unsupported by adapter declaration but other targets remain valid

If the user explicitly selected a target and that target is unsupported, the issue is an `error`. If the target was not selected or is optional for the current module set, adapter-declared unsupported status may be `warning` or `info`.

Reserved MVP issue ids:

- `ide-mirror.missing-entry`
- `ide-mirror.hash-mismatch`
- `ide-mirror.duplicate-entry`
- `ide-mirror.unsupported-target`
- `ide-mirror.target-write-failed`

### `runtime-path`

Use for generated runtime path or resolver entry problems.

Examples:

- missing `_speclite` runtime entry
- generated runtime script path is invalid
- installed skill points to an old resolver/runtime path
- runtime path escapes the target project through a symlink

Default severity:

- `critical` when installed skills cannot resolve required runtime configuration
- `error` when one runtime entry is broken but validation can continue

Reserved MVP issue ids:

- `runtime-path.missing-entry`
- `runtime-path.invalid-script-path`
- `runtime-path.legacy-resolver-path`
- `runtime-path.symlink-escape`

### `menu-target`

Use when help/menu/discovery metadata cannot resolve to exactly one installed skill entry.

Examples:

- menu target missing
- menu target resolves to multiple installed entries
- help index references unknown `canonicalSkillId`
- phase coverage row has no mapped target

Default severity:

- `error` for missing or ambiguous activation target
- `warning` for optional target unsupported by adapter declaration

If the user explicitly selected a target and a required menu target cannot be represented for that target, the issue is an `error`. Optional unsupported targets may remain `warning`.

Reserved MVP issue ids:

- `menu-target.missing-target`
- `menu-target.ambiguous-target`
- `menu-target.unknown-skill`
- `menu-target.no-mapped-target`

### `legacy-namespace`

Use for stale old namespaces or legacy generated structures that can cause duplicate loading or user confusion.

Examples:

- old runtime namespace residue
- stale copied skill entry that overlaps canonical id
- legacy config path still referenced by installed skill

Default severity:

- `warning` when residue is inert but risky
- `error` when duplicate loading or wrong activation is likely

Reserved MVP issue ids:

- `legacy-namespace.runtime-residue`
- `legacy-namespace.stale-skill-entry`
- `legacy-namespace.legacy-config-reference`

### `artifact-path`

Use for workflow artifact repository and configured output path problems.

Examples:

- configured output path escapes project boundary
- configured output path escapes project boundary through a symlink
- `_speclite-output` missing when required
- expected artifact directory unwritable
- skill artifact fixture fails to write expected artifact

Default severity:

- `error` when workflow output cannot be written
- `warning` when optional artifact path is missing but workflow can continue

Reserved MVP issue ids:

- `artifact-path.escapes-project`
- `artifact-path.symlink-escape`
- `artifact-path.missing-required-directory`
- `artifact-path.unwritable-directory`
- `artifact-path.fixture-write-failed`
- `artifact-path.missing-required-metadata`
- `artifact-path.invalid-required-metadata`

### `file-integrity`

Use for installed file, files index, installer-owned drift, or generated metadata/control file hash mismatch.

Examples:

- installed file hash differs from files index
- files index references a missing installer-owned file
- manifest-generated control file drift
- installer-owned file ownership cannot be established
- case-insensitive path conflict
- executable bit or file mode drift
- stale safe-write temp file

Default severity:

- `error` for drift that blocks update safety
- `critical` for unsafe overwrite risk or schema corruption
- `warning` for stale temp files that require manual cleanup but do not by themselves prove installed content drift
- `error` for stale temp files that block safe-write target naming, rename, or safe mutation

Reserved MVP issue ids:

- `file-integrity.hash-mismatch`
- `file-integrity.missing-installer-owned-file`
- `file-integrity.control-file-drift`
- `file-integrity.unknown-ownership`
- `file-integrity.unsafe-overwrite-risk`
- `file-integrity.case-conflict`
- `file-integrity.executable-bit-mismatch`
- `file-integrity.stale-temp-file`

### `operation-lock`

Use for project-level SpecLite operation lock problems that prevent write-capable commands from safely planning or applying changes.

Examples:

- another install/update/repair is active
- stale `_speclite/.lock` requires manual cleanup

Default severity:

- `error` when a write-capable command cannot acquire the project operation lock
- `warning` when validate observes a stale lock but no write is being attempted

Reserved MVP issue ids:

- `operation-lock.project-locked`
- `operation-lock.stale-lock`

### `update`

Use for command-level update or repair planning blockers that summarize path-level conflicts.

Examples:

- update plan contains one or more path-level conflicts
- repair plan contains blockers that cannot be safely repaired

Default severity:

- `error` when update or repair cannot proceed as a successful plan

Reserved MVP issue ids:

- `update.conflicts`

IDE mirror content drift may use `ide-mirror` when the problem is target-specific and `file-integrity` when the problem is a generic installed file/hash mismatch. Do not duplicate the same finding in both categories.

## Fixture Policy（Fixture 策略）

Each validation rule must own at least one fixture assertion covering:

- `issueId`
- `category`
- `severity`
- `affectedPath` or `component`
- deterministic `details`
- stable `impact`
- stable `suggestedNextStep`

New validation categories require updating this SPEC before implementation. New issue ids under existing categories require fixture updates in the same change.
