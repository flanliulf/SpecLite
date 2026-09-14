# Changelog

## [1.1.0] - 2026-09-13

### Changed

- 复盘文档从 `{implementation_artifacts}` 根目录改为写入 `module.yaml` 预创建的 `{implementation_artifacts}/retrospectives/`；读取历史复盘时同时兼容 legacy 根目录位置，只读不迁移。

## [1.0.0] - 2026-05-07

### Added

- Initial Speclite migration with normalized entry files, runtime configuration example, references, assets, and data/resources copied from the legacy source package.
- Added Speclite runtime guardrails for `{project-root}/_speclite/config.toml`, three-tier customize fallback, and completion handoff.
