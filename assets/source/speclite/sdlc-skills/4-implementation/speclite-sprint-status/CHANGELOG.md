# Changelog

## [1.0.2] - 2026-07-07

### Changed

- 将 ready-for-dev Story 的 `story-kickoff` gate 推荐规则升级为同时检查 v2 schema、handoff contract version、gate result、foundation prerequisite 与 closure owner metadata。
- 对 legacy v1 report 或缺失 `handoffContractVersion` 的 report 给出重新运行 `speclite-flow-gate` 的建议。

## [1.0.1] - 2026-05-27

### Added

- 在推荐 `speclite-dev-story` 前检查 ready-for-dev Story 的 story-kickoff gate，缺失、失败或过期时优先推荐 `speclite-flow-gate`。
- review 状态 Story 的推荐入口改为 `code-review-01-reviewer`。

## [1.0.0] - 2026-05-07

### Added

- Initial Speclite migration with normalized entry files, runtime configuration example, references, assets, and data/resources copied from the legacy source package.
- Added Speclite runtime guardrails for `{project-root}/_speclite/config.toml`, three-tier customize fallback, and completion handoff.
