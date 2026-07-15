# Flow Gate Handoff Glossary（Flow Gate 交接术语表）

本文解释 Flow Gate handoff 体系中容易混淆的术语。核心记忆法：source index 是上游证据索引，gate report 是门禁结果，frontmatter 是下游机器契约。

## Terms（术语）

| Term | 中文解释 | 在流程中的角色 | 常见误解 |
|---|---|---|---|
| Foundation handoff | 地基交接。前序 Story/Epic 已形成的基础契约、限制和未来关闭项，供后续 Story 消费。 | 帮助后续 Story 判断哪些前置契约可用、哪些能力仍只是 future scope。 | 误以为 foundation handoff 等于业务功能已经完成。 |
| Foundation handoff source index | 地基交接源索引。项目自有 JSON 索引，列出 handoff evidence、machine fixtures 和 verify commands。 | `speclite-flow-gate` 的上游输入之一。 | 误以为 hook 或 dev-story 会直接读取它。 |
| `{implementation_artifacts}/foundation-handoff/source-index.json` | 推荐的 source index 默认路径。`{implementation_artifacts}` 来自目标项目 `_speclite/config.toml`。 | preferred machine artifact path。 | 误以为所有项目必须存在该文件。它是 preferred，不是唯一合法来源。 |
| Explicit refs | 显式引用。Story、Epic、Architecture、evidence docs、fixtures、gate reports 或 commands 中明确列出的证据来源。 | source index 缺失时，`speclite-flow-gate` 可用它们作为项目提供的 handoff sources。 | 误以为没有 source index 就必须 `NOT_APPLICABLE`。如果 explicit refs 足够，仍可 `PASS`。 |
| Flow Gate | 流程门禁。检查 Story/Epic 的契约、实现、证据、指引和 foundation handoff 是否允许继续。 | 由 `speclite-flow-gate` skill 执行。 | 误以为 hook 就是 Flow Gate。hook 只是执行面 guard。 |
| Story kickoff gate | Story 启动门禁。在 `speclite-dev-story` 把 Story 推进到 `in-progress` 前执行。 | 保护 Story 开发入口。 | 误以为它验证 Story 已经实现完成；它只验证开发前置条件。 |
| Kickoff gate report | 启动门禁报告。`story-kickoff` mode 生成的 Flow Gate report。 | 存在于 `{implementation_artifacts}/flow-gates/<story-key>-story-kickoff-gate.md`。 | 误以为 Markdown 正文是下游契约；真正契约是 frontmatter。 |
| Flow Gate report | Flow Gate 报告。任意 mode 的门禁报告，例如 story kickoff、story completion、epic kickoff、epic completion。 | 记录 gate result、证据和建议动作。 | 误把所有 gate report 都当作 dev-story 前置；dev-story 前置只需要 story-kickoff report。 |
| `flow-gates/*-story-kickoff-gate.md` | Story kickoff gate report 的文件形态。 | downstream skills 和 hook 通过固定命名查找目标 Story 的启动门禁。 | 误以为任何 `flow-gates/*.md` 都可放行开发。 |
| YAML frontmatter | Markdown 文件开头的 `--- ... ---` 机器可读元数据块。 | 下游唯一稳定读取面。 | 误以为正文里的 PASS 就足够。下游必须读 frontmatter。 |
| Gate report frontmatter | gate report 的 YAML frontmatter。 | 包含 `schemaVersion`、`mode`、`result`、handoff status 等字段。 | 误以为它只是展示信息；它是 workflow contract。 |
| v2 metadata | `schemaVersion: "speclite.flow-gate-report.v2"` 的 report metadata。 | 当前 story-kickoff handoff contract。 | 误以为 v1 只要字段类似也可继续。legacy v1 必须重新生成。 |
| `handoffContractVersion` | 交接契约版本，例如 `speclite.story-kickoff-handoff.v1`。 | 区分 report schema 与 downstream handoff semantics。 | 误以为有 `schemaVersion` 就够；downstream 还需要 handoff contract version。 |
| `foundationPrerequisiteStatus` | Foundation 前置条件状态。 | 告诉下游目标 Story 是否已经检查并满足 foundation prerequisites。 | 误以为它代表业务功能完成。它只代表前置契约可消费。 |
| `foundationPrerequisiteRefs` | Foundation 前置条件引用。 | 记录 source index、explicit refs、fixtures 或 verify commands。 | 误引用不存在的 source index 会制造 stale evidence。 |
| `closureOwnerCheckStatus` | Future closure owner 检查状态。 | 告诉下游目标 Story 是否错误认领了未来关闭项。 | 误以为 `NOT_APPLICABLE` 表示没有 future closure ledger；也可能只是当前 Story 不涉及。 |
| `closureOwnerRefs` | Closure owner 检查引用。 | 记录 future closure ledger、owner Story/Epic 或 source refs。 | 误以为只写人类说明即可；应尽量指向真实 source。 |
| Closure owner | 未来关闭项 owner。负责把某个 future-only 能力变成真实完成项的 Epic 或 Story。 | 防止早期 Story 把 future scope 误标为 done。 | 误把当前 Story 的 planned evidence 当作 closure 完成。 |
| Future closure ledger | 未来关闭台账。列出 future-only 能力、owner、first possible Story 和阻断原因。 | `speclite-flow-gate` 用它检查 closure owner。 | 误以为 ledger 是可选备注；当 Story 涉及 future closure 时它是关键证据。 |
| Downstream prerequisites | 下游前置条件。后续 Epic/Story 启动前必须消费的基础契约和验证要求。 | Foundation handoff 的主要证据类别之一。 | 误以为 prerequisite 通过就等于下游功能已实现。 |
| `machineRef` | 机器可解析引用，例如 JSON fixture、manifest 或 schema。 | 支撑自动校验和可重复证据。 | 误把 prose doc 当成 machineRef。 |
| `humanRef` | 人类可读引用，例如 Story、Epic、Architecture 或 evidence doc。 | 帮助审计和解释 machineRef 的上下文。 | 误以为 humanRef 可替代 machineRef。高风险 gate 应尽量两者都有。 |
| `verifyCommand` | 验证命令。证明 source index 中证据仍然有效。 | 支撑 Flow Gate 的 Evidence Anchor。 | 误以为列出文件路径即可，无需验证命令。 |
| `scope` | source index entry 的适用范围，例如 `epic-2` 或某个 Story key。 | 判断目标 Story 是否与 source entry 相交。 | 误以为所有 source 对所有 Story 都适用。 |
| Evidence Anchor | 证据锚点。证明契约或功能成立的测试、fixture、snapshot、command output。 | Flow Gate 判断 PASS / FAIL_EVIDENCE 的依据。 | 误把 planned evidence 当 actual evidence。 |
| Contract Anchor | 契约锚点。owning SPEC 明确要求的 schema、API、field、command 或规则。 | Flow Gate 判断 FAIL_CONTRACT 的依据。 | 误把建议路径当 hard contract。 |
| Guidance Anchor | 指引锚点。Story local suggested path、命名或拆分建议。 | 可以通过 equivalent implementation 处理。 | 误把 guidance mismatch 直接判定 blocked。 |
| `PASS_EQUIVALENT` | 等价通过。实现路径不同，但契约、功能和证据等价成立。 | 允许继续，但必须保留等价说明。 | 误以为它比 PASS 弱到需要阻断。 |
| `NOT_APPLICABLE` | 不适用。当前 Story 不涉及某类 handoff 检查，或项目未提供该类 source。 | 对 foundation/closure status 是允许值。 | 误用为“懒得检查”。如果 source 存在且 scope 相交，不能随意写 `NOT_APPLICABLE`。 |
| Legacy v1 report | 旧版 `speclite.flow-gate-report.v1` report。 | 必须重新生成，不能进入 dev-story。 | 误以为字段齐全即可兼容。 |
| Stale report | 过期报告。Story 或 source evidence 已变更，或 `generatedAt` 超过 freshness policy。 | 下游应要求重新运行 Flow Gate。 | 误以为历史 PASS 永久有效。 |
| `flow-gate-enforcement` hook | 安装到目标项目的执行面 guard。 | 在直接触发 `speclite-dev-story` 前 fail-closed 检查 kickoff report frontmatter。 | 误以为它会生成 report、读取 source index 或推进状态。 |
| `speclite-dev-story` | Story 实现 workflow。 | 在 Step 4 前验证 story-kickoff report metadata，允许后才进入 `in-progress`。 | 误以为它应自己重新解释 foundation evidence。 |
| `speclite-sprint-status` | Sprint 状态与推荐 workflow。 | 读取 kickoff gate metadata，决定推荐 flow-gate 还是 dev-story。 | 误以为它是 gate executor。 |
| Goal orchestrator | Epic Story 开发和 CR 编排器。 | 每个 Story 开发前验证 kickoff gate report frontmatter。 | 误以为它可以跳过 Flow Gate 或只看历史摘要。 |

## Boundary Rules（边界规则）

- Source index 是 evidence locator，不是 downstream allow/deny decision。
- Flow Gate report 是 decision record，frontmatter 是 machine contract。
- Hook 是 deterministic guard，不是 workflow engine。
- `dev-story` 和 goal orchestrator 不应直接读 source index；它们应要求 `speclite-flow-gate` 生成或刷新 gate report。
- Report refs 不应引用不存在的文件。source index 缺失时，应写真实 explicit refs。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 完整 handoff 契约 | [`../flow-gate-handoff-contract.md`](../flow-gate-handoff-contract.md) |
| Workflow artifact layout | [`../workflow-artifact-layout.md`](../workflow-artifact-layout.md) |
| Workflow 体系解释 | [`../../explanation/speclite-workflows.md`](../../explanation/speclite-workflows.md) |
