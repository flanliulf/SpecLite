# Changelog

## [1.1.0] - 2026-09-04

### Changed

- Locked each invocation to `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` with a single generated calendar date.
- Added a private exclusive-create operation that blocks an existing same-day target with `artifact-path.prd-validation-report-exists`, zero progress/temp/suffix writes, and the exact manual remediation.
- Preserved legacy validation reports as read-only historical evidence across discovery and install/update/repair.

## [1.0.0] - 2026-05-07

### Added

- Initial Speclite migration with normalized entry files, runtime configuration example, references, assets, and data/resources copied from the legacy source package.
- Added Speclite runtime guardrails for `{project-root}/_speclite/config.toml`, three-tier customize fallback, and completion handoff.
