# Flow Gate Handoff Glossary（Flow Gate 交接术语表）

本文提供 Flow Gate handoff 体系的术语短定义。角色关系与常见误解见 [`../../explanation/flow-gate-handoff-pitfalls.md`](../../explanation/flow-gate-handoff-pitfalls.md)，字段与允许值见 [`../specs/flow-gate-handoff-contract.md`](../specs/flow-gate-handoff-contract.md)。

## Evidence（证据）

| Term | Definition |
|---|---|
| **foundation handoff** | 前序 Story / Epic 形成的基础契约、限制和未来关闭项，供后续 Story 消费。 |
| **foundation handoff source index** | 项目自有的 JSON 索引，列出 handoff evidence、machine fixtures 和 verify commands；推荐路径为 `{implementation_artifacts}/foundation-handoff/source-index.json`。 |
| **explicit refs** | Story、Epic、Architecture、evidence docs、fixtures、gate reports 或 commands 中明确列出的证据来源；source index 缺失时的合法替代。 |
| **machineRef / humanRef** | 机器可解析引用（fixture、manifest、schema）与人类可读引用（Story、Epic、evidence doc）。 |
| **verifyCommand** | 证明 source index 中证据仍然有效的命令。 |
| **scope** | source index entry 的适用范围，例如 `epic-2` 或某个 Story key。 |

## Gate And Report（门禁与报告）

| Term | Definition |
|---|---|
| **Flow Gate** | 由 `speclite-flow-gate` 执行的流程门禁，检查 Story / Epic 的契约、实现、证据、指引和 foundation handoff 是否允许继续。 |
| **story kickoff gate** | 在 `speclite-dev-story` 把 Story 推进到 `in-progress` 前执行的门禁。 |
| **Flow Gate report** | 任意 mode 的门禁报告；story kickoff report 位于 `{implementation_artifacts}/flow-gates/<story-key>-story-kickoff-gate.md`。 |
| **gate report frontmatter** | report 开头的 YAML 元数据块，包含 `schemaVersion`、`mode`、`result` 与 handoff status，是下游唯一稳定读取面。 |
| **v2 metadata** | `schemaVersion: "speclite.flow-gate-report.v2"` 的 report metadata，当前 story-kickoff handoff 契约。 |
| **handoffContractVersion** | 交接契约版本，例如 `speclite.story-kickoff-handoff.v1`；与 report schema 版本分开演进。 |
| **Evidence / Contract / Guidance Anchor** | 分别是证明成立的测试或 fixture、owning SPEC 明确要求的规则、以及可等价实现的 Story 建议。 |
| **PASS_EQUIVALENT** | 实现路径不同但契约、功能和证据等价成立的结果。 |
| **NOT_APPLICABLE** | 当前 Story 不涉及某类 handoff 检查，或项目未提供该类 source。 |
| **stale report** | Story 或 source evidence 已变更，或 `generatedAt` 超过 freshness policy 的报告。 |

## Closure Ownership（关闭项归属）

| Term | Definition |
|---|---|
| **foundationPrerequisiteStatus / Refs** | 目标 Story 是否已检查并满足 foundation prerequisites，及其引用。 |
| **closureOwnerCheckStatus / Refs** | 目标 Story 是否错误认领了未来关闭项，及其引用。 |
| **closure owner** | 负责把某个 future-only 能力变成真实完成项的 Epic 或 Story。 |
| **future closure ledger** | 列出 future-only 能力、owner、first possible Story 和阻断原因的台账。 |
| **downstream prerequisites** | 后续 Epic / Story 启动前必须消费的基础契约和验证要求。 |

## Consumers（消费者）

| Term | Definition |
|---|---|
| **flow-gate-enforcement hook** | 安装到目标项目的执行面 guard，在直接触发 `speclite-dev-story` 前 fail-closed 检查 kickoff report frontmatter。 |
| **goal orchestrator** | Epic Story 开发和 CR 编排器，每个 Story 开发前验证 kickoff gate report frontmatter。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 角色关系与常见误解 | [`../../explanation/flow-gate-handoff-pitfalls.md`](../../explanation/flow-gate-handoff-pitfalls.md) |
| 规范性说明 | [`../specs/flow-gate-handoff-contract.md`](../specs/flow-gate-handoff-contract.md) |
| Workflow artifact layout | [`../workflow-artifact-layout.md`](../workflow-artifact-layout.md) |
