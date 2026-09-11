# Changelog（变更记录）

本文件记录 `speclite-code-review-contract` 的版本变更历史。

## [Unreleased] - 2026-09-11

- Story 11.9 restart：新增 CR Directory Resolution 章节；唯一派生点改为 `speclite resolve cr-directory`（`src/config/cr-directory.ts`），只按目录名与 v2 文件名判定归属，定义 `cr-directory.ambiguous-resume-root` 与威胁模型边界；不再随包投影 `scripts/resolve-cr-directory.mjs`，不引入 validate-context / ownership marker。

## [1.0.0] - 2026-08-25

### Added（新增）

- 建立独立于 runner 的 CR v2 共享契约 owner。
- 提供 identity、path、schema、verdict、fingerprint、quorum、round binding 与 freshness 定义。
- 支持人工 fresh session 按顺序独立调用 CR01–06。
- 提供只读 CR artifact 验证流程。
- 增加 Contract / Functional / Evidence / Guidance Anchor 分层和 equivalent implementation policy，避免把非 owning SPEC 固定路径误判为 hard gate。
- 增加 runner/manual 双执行上下文、通用 `authorizationSource` 与 standalone handoff 规则，禁止 leaf Skill 把 runner 当成唯一 authority。
- 对齐 Review scope frontmatter 与输出模板字段，补充 `inputMode`、文件清单、`scopeExceptions` 和 `acCoverageComplete`。
- 定义 CR04 rules extraction、CR05 TODO result 与 CR06 finalizer 的 durable schema 和 canonical path。

### Known Limitations（已知限制）

- 本 Skill 只验证契约，不创建或修改 CR workflow artifacts。
