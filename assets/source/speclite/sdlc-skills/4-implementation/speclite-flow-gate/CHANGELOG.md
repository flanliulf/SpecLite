# Changelog

本文件记录 `speclite-flow-gate` 技能的版本变更历史。

## [1.1.0] - 2026-07-07

### Changed

- 将 story-kickoff report 契约升级为 `speclite.flow-gate-report.v2`，新增 `handoffContractVersion: "speclite.story-kickoff-handoff.v1"`。
- 用项目提供的 `foundation_handoff_source_index` 或 Story/Epic 显式 references 读取 foundation handoff 事实，移除对特定仓库目录和 schema package 的默认假设。
- 明确 `NOT_APPLICABLE` 只适用于项目未声明 foundation handoff source 的场景；legacy v1 report 必须重新生成。

## [1.0.0] - 2026-05-27

### Added

- 新增 Story/Epic implementation flow gate 检查。
- 支持 `story-kickoff`、`story-completion`、`epic-completion`、`epic-kickoff` 四种 mode。
- 定义 `PASS`、`PASS_EQUIVALENT`、`FAIL_CONTRACT`、`FAIL_FUNCTION`、`FAIL_EVIDENCE`、`DECISION_NEEDED` 结果枚举。
- 区分 `Contract Anchor`、`Functional Anchor`、`Evidence Anchor` 和 `Guidance Anchor`。
- 生成 `{implementation_artifacts}/flow-gates/` 报告供后续 workflow 消费。
