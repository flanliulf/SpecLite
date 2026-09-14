# Flow Gate Handoff Pitfalls（Flow Gate 交接常见误区）

本文解释 Flow Gate handoff 体系中各个角色在流程里的位置，以及围绕它们最常见的误解。核心记忆法：source index 是上游证据索引，gate report 是门禁结果，frontmatter 是下游机器契约。术语的短定义见 [`../reference/glossary/flow-gate-handoff.md`](../reference/glossary/flow-gate-handoff.md)，字段与允许值见规范性说明 [`../reference/specs/flow-gate-handoff-contract.md`](../reference/specs/flow-gate-handoff-contract.md)。

## Three Layers（三层结构）

| Layer | Owner | 它回答的问题 |
|---|---|---|
| 项目证据层 | 目标项目 | 前序 Story / Epic 留下的 foundation handoff 证据在哪里？ |
| 门禁报告层 | `speclite-flow-gate` | 目标 Story 现在能不能进入开发？依据是什么？ |
| 下游消费层 | hook、`speclite-dev-story`、`speclite-sprint-status`、goal orchestrator | 是否存在一份新鲜、通过、可机读的 kickoff report？ |

下游只读 gate report 的 YAML frontmatter，不直接解释 source index；这是所有误区的分界线。

## Evidence Sources（证据来源）

| Term | 在流程中的角色 | 常见误解 |
|---|---|---|
| Foundation handoff | 帮助后续 Story 判断哪些前置契约可用、哪些能力仍只是 future scope。 | 误以为 foundation handoff 等于业务功能已经完成。 |
| Foundation handoff source index | `speclite-flow-gate` 的上游输入之一。 | 误以为 hook 或 dev-story 会直接读取它。 |
| `{implementation_artifacts}/foundation-handoff/source-index.json` | preferred machine artifact path。 | 误以为所有项目必须存在该文件；它是 preferred，不是唯一合法来源。 |
| Explicit refs | source index 缺失时，可作为项目提供的 handoff sources。 | 误以为没有 source index 就必须 `NOT_APPLICABLE`；explicit refs 足够时仍可 `PASS`。 |
| `machineRef` / `humanRef` | 前者支撑自动校验，后者解释上下文。 | 误把 prose doc 当成 machineRef，或以为 humanRef 可替代 machineRef。 |
| `verifyCommand` | 证明 source index 中的证据仍然有效。 | 误以为列出文件路径即可，无需验证命令。 |
| `scope` | 判断目标 Story 是否与 source entry 相交。 | 误以为所有 source 对所有 Story 都适用。 |

## Gate And Report（门禁与报告）

| Term | 在流程中的角色 | 常见误解 |
|---|---|---|
| Flow Gate | 由 `speclite-flow-gate` 执行，检查契约、实现、证据、指引与 foundation handoff。 | 误以为 hook 就是 Flow Gate；hook 只是执行面 guard。 |
| Story kickoff gate | 在 `speclite-dev-story` 把 Story 推进到 `in-progress` 前执行。 | 误以为它验证 Story 已经实现完成；它只验证开发前置条件。 |
| Kickoff gate report | 落在 `{implementation_artifacts}/flow-gates/<story-key>-story-kickoff-gate.md`。 | 误以为 Markdown 正文是下游契约；真正契约是 frontmatter。 |
| Flow Gate report | 任意 mode 的门禁报告。 | 误把所有 gate report 都当作 dev-story 前置；dev-story 只需要 story-kickoff report。 |
| `flow-gates/*-story-kickoff-gate.md` | 下游按固定命名查找目标 Story 的启动门禁。 | 误以为任何 `flow-gates/*.md` 都可放行开发。 |
| YAML frontmatter | 下游唯一稳定读取面。 | 误以为正文里的 PASS 就足够。 |
| v2 metadata 与 `handoffContractVersion` | 区分 report schema 与 downstream handoff 语义。 | 误以为 v1 字段类似即可继续；legacy v1 必须重新生成。 |
| Evidence / Contract / Guidance Anchor | 分别对应 `FAIL_EVIDENCE`、`FAIL_CONTRACT` 与可等价实现的建议。 | 误把 planned evidence 当 actual evidence，误把建议路径当 hard contract，或把 guidance mismatch 直接判定 blocked。 |
| `PASS_EQUIVALENT` | 实现路径不同但契约、功能和证据等价成立。 | 误以为它弱到需要阻断。 |
| `NOT_APPLICABLE` | 当前 Story 不涉及某类检查，或项目未提供该类 source。 | 误用为“懒得检查”；source 存在且 scope 相交时不能写它。 |
| Stale report | `generatedAt` 超过 freshness policy，或 Story / source evidence 已变更。 | 误以为历史 PASS 永久有效。 |

## Closure Ownership（关闭项归属）

| Term | 在流程中的角色 | 常见误解 |
|---|---|---|
| `foundationPrerequisiteStatus` / `foundationPrerequisiteRefs` | 告诉下游目标 Story 是否已检查并满足 foundation prerequisites，以及依据是什么。 | 误以为它代表业务功能完成；误引用不存在的 source index 会制造 stale evidence。 |
| `closureOwnerCheckStatus` / `closureOwnerRefs` | 告诉下游目标 Story 是否错误认领了未来关闭项。 | 误以为 `NOT_APPLICABLE` 表示没有 future closure ledger；也可能只是当前 Story 不涉及。 |
| Closure owner | 负责把某个 future-only 能力变成真实完成项的 Epic 或 Story。 | 误把当前 Story 的 planned evidence 当作 closure 完成。 |
| Future closure ledger | `speclite-flow-gate` 用它检查 closure owner。 | 误以为 ledger 是可选备注；Story 涉及 future closure 时它是关键证据。 |
| Downstream prerequisites | Foundation handoff 的主要证据类别之一。 | 误以为 prerequisite 通过就等于下游功能已实现。 |

## Consumers（消费者）

| Consumer | 它应该做什么 | 常见误解 |
|---|---|---|
| `flow-gate-enforcement` hook | 在直接触发 `speclite-dev-story` 前 fail-closed 检查 kickoff report frontmatter。 | 误以为它会生成 report、读取 source index 或推进状态。 |
| `speclite-dev-story` | 在进入 `in-progress` 前验证 story-kickoff report metadata。 | 误以为它应自己重新解释 foundation evidence。 |
| `speclite-sprint-status` | 读取 kickoff gate metadata，决定推荐 flow-gate 还是 dev-story。 | 误以为它是 gate executor。 |
| Goal orchestrator | 每个 Story 开发前验证 kickoff gate report frontmatter。 | 误以为它可以跳过 Flow Gate 或只看历史摘要。 |

## Boundary Rules（边界规则）

- Source index 是 evidence locator，不是 downstream allow/deny decision。
- Flow Gate report 是 decision record，frontmatter 是 machine contract。
- Hook 是 deterministic guard，不是 workflow engine。
- `dev-story` 和 goal orchestrator 不应直接读 source index；它们应要求 `speclite-flow-gate` 生成或刷新 gate report。
- Report refs 不应引用不存在的文件。source index 缺失时，应写真实 explicit refs。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 规范性说明 | [`../reference/specs/flow-gate-handoff-contract.md`](../reference/specs/flow-gate-handoff-contract.md) |
| 术语短定义 | [`../reference/glossary/flow-gate-handoff.md`](../reference/glossary/flow-gate-handoff.md) |
| Workflow artifact layout | [`../reference/workflow-artifact-layout.md`](../reference/workflow-artifact-layout.md) |
| Workflow 体系解释 | [`speclite-workflows.md`](speclite-workflows.md) |
