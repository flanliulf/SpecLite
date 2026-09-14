# Normative Specifications（规范性说明）

本目录承载已经稳定、对 SpecLite 实现和外部消费者具有规范效力的公共契约。它是 Reference 的子类型，不承载规划过程、Story、review 记录或尚未接受的设计提案。

## Documents（文档）

| 规范性说明 | Scope | Executable Anchor |
|---|---|---|
| [`command-result-json-contract.md`](command-result-json-contract.md) | `CommandResult` envelope、状态、退出码、路径、兼容性和公共 payload 边界。 | `src/diagnostics/command-result-schema.ts` |
| [`flow-gate-handoff-contract.md`](flow-gate-handoff-contract.md) | Flow Gate report frontmatter、foundation handoff source index 与 hook / downstream workflow 的交接契约。 | `src/hooks/flow-gate-enforcement.ts`、`test/flow-gate-hook-runner.test.ts` |

## Admission Rules（收录规则）

只有同时满足以下条件的内容才能进入本目录：

- 契约已经被当前实现采用，而不是仅存在于规划稿中。
- 契约影响外部消费者、实现模块或跨文档一致性。
- 已有 executable schema、focused tests 或 fixtures 作为可执行锚点。
- 已明确变更顺序、兼容策略和事实冲突处理方式。

`_bmad-output/planning-artifacts/specs/` 可以保存设计来源和历史证据，但不能成为本目录规范性说明的替代入口。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 上级 Reference 索引 | [`../index.md`](../index.md) |
| 消费者快速参考 | [`../command-result-json.md`](../command-result-json.md) |
| 文档目录治理 | [`../../README.md`](../../README.md) |
