# Changelog

本文件记录 `speclite-flow-gate` 技能的版本变更历史。

## [1.0.0] - 2026-05-27

### Added

- 新增 Story/Epic implementation flow gate 检查。
- 支持 `story-kickoff`、`story-completion`、`epic-completion`、`epic-kickoff` 四种 mode。
- 定义 `PASS`、`PASS_EQUIVALENT`、`FAIL_CONTRACT`、`FAIL_FUNCTION`、`FAIL_EVIDENCE`、`DECISION_NEEDED` 结果枚举。
- 区分 `Contract Anchor`、`Functional Anchor`、`Evidence Anchor` 和 `Guidance Anchor`。
- 生成 `{implementation_artifacts}/flow-gates/` 报告供后续 workflow 消费。
