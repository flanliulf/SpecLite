# Changelog

## [1.0.1] - 2026-05-27

### Changed

- `story_location` 和 `story_location_absolute` 默认指向 `{implementation_artifacts}/stories`，使 Story 文件位于独立子目录。
- sprint-status 模板中的 review 后续动作改为从 `code-review-01-reviewer` 开始。

## [1.0.0] - 2026-05-07

### Added

- Initial Speclite migration with normalized entry files, runtime configuration example, references, assets, and data/resources copied from the legacy source package.
- Added Speclite runtime guardrails for `{project-root}/_speclite/config.toml`, three-tier customize fallback, and completion handoff.
