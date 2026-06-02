# Changelog

## [1.0.1] - 2026-05-27

### Added

- 在推荐 `speclite-dev-story` 前检查 ready-for-dev Story 的 story-kickoff gate，缺失、失败或过期时优先推荐 `speclite-flow-gate`。
- review 状态 Story 的推荐入口改为 `code-review-01-reviewer`。

## [1.0.0] - 2026-05-07

### Added

- Initial Speclite migration with normalized entry files, runtime configuration example, references, assets, and data/resources copied from the legacy source package.
- Added Speclite runtime guardrails for `{project-root}/_speclite/config.toml`, three-tier customize fallback, and completion handoff.
