# Flow Gate Handoff Contract（Flow Gate 交接契约）

本文定义 `speclite-flow-gate`、`flow-gate-enforcement` hook、`speclite-dev-story`、`speclite-sprint-status` 和 goal orchestrator 之间的 foundation handoff 信息流。目标是把项目特定证据留在目标项目内，把 SpecLite 的通用契约稳定在 Flow Gate report frontmatter 上。

## Executive Summary（执行摘要）

Flow Gate handoff 应采用三层结构：

1. 项目证据层：目标项目可以提供 foundation handoff source index，推荐路径为 `{implementation_artifacts}/foundation-handoff/source-index.json`。它只描述项目自有证据在哪里，不是 SpecLite 的内置默认路径。
2. 门禁报告层：`speclite-flow-gate` 读取 source index 或 Story/Epic 显式 references，生成 `{implementation_artifacts}/flow-gates/<story-key>-story-kickoff-gate.md`。
3. 下游消费层：hook、`speclite-dev-story`、`speclite-sprint-status` 和 goal orchestrator 只读取 gate report YAML frontmatter，不直接读取 source index。

这意味着 source index 是上游证据索引，gate report frontmatter 是下游机器契约。任何下游 workflow 不应重新解释项目证据，也不应只靠 Markdown 正文判断是否可进入开发。

## Contract Layers（契约层级）

| Layer | Owner | Path / Surface | Consumer | Required Behavior |
|---|---|---|---|---|
| Foundation source index | Target project workflow | `{implementation_artifacts}/foundation-handoff/source-index.json` 或 `_speclite/custom/speclite-flow-gate.toml` 指定路径 | `speclite-flow-gate` | 指向项目自有 handoff evidence、machine fixtures 和 verification commands。 |
| Explicit refs | Target project Story/Epic docs | Story / Epic / architecture / evidence refs | `speclite-flow-gate` | 当 source index 缺失时作为项目显式证据来源。 |
| Story kickoff gate report | `speclite-flow-gate` | `{implementation_artifacts}/flow-gates/<story-key>-story-kickoff-gate.md` | hooks 和 downstream workflows | 写入 v2 YAML frontmatter，作为唯一 machine-readable handoff result。 |
| Flow gate hook | SpecLite installed hook | `_speclite/hooks/flow-gate-enforcement/runner.mjs` | Prompt execution | 只验证 gate report frontmatter；不生成 report，不读取 source index，不推进状态。 |
| Downstream workflows | SpecLite installed skills | `speclite-dev-story`、`speclite-sprint-status`、goal orchestrator | Story development flow | 只消费 gate report v2 metadata；失败时重新运行 `speclite-flow-gate` 或修订 Story references。 |

## Source Index Contract（Source Index 契约）

推荐 source index schema：

```json
{
  "schemaVersion": "speclite.foundation-handoff-source-index.v1",
  "sources": [
    {
      "kind": "downstream-prerequisites",
      "humanRef": "project-owned human-readable evidence path",
      "machineRef": "project-owned machine-readable evidence path",
      "verifyCommand": "project-owned verification command",
      "scope": ["epic-2"]
    }
  ]
}
```

字段含义：

| Field | Requirement | Meaning |
|---|---|---|
| `schemaVersion` | 必须等于 `speclite.foundation-handoff-source-index.v1` | 标识 source index schema。 |
| `sources[].kind` | `downstream-prerequisites`、`future-closure-ledger`、`foundation-handoff-snapshot` | 声明证据类别。 |
| `sources[].humanRef` | 推荐 | 人类可读的说明、Story、Epic、evidence doc 或 report。 |
| `sources[].machineRef` | 推荐；存在时必须可读取 | 机器可解析的 fixture、manifest、snapshot 或 ledger。 |
| `sources[].verifyCommand` | 推荐 | 可复现校验命令。 |
| `sources[].scope` | 推荐 | 该 source 适用的 Epic、Story 或 scope label。 |

SpecLite 不应假设任何目标项目路径、framework、schema package、service name 或 Epic 编号。`machineRef` 和 `verifyCommand` 都是 project-owned。

## Report Metadata Contract（Report Metadata 契约）

`story-kickoff` report 必须写入 v2 frontmatter：

```yaml
---
schemaVersion: "speclite.flow-gate-report.v2"
mode: "story-kickoff"
target: "<story-key>"
storyKey: "<story-key>"
result: "PASS"
generatedAt: "<timestamp>"
handoffContractVersion: "speclite.story-kickoff-handoff.v1"
foundationPrerequisiteStatus: "PASS"
foundationPrerequisiteRefs: "<source refs>"
closureOwnerCheckStatus: "PASS"
closureOwnerRefs: "<source refs>"
sourceSkill: "speclite-flow-gate"
---
```

Downstream continuation requires:

| Field | Allowed Value |
|---|---|
| `schemaVersion` | `speclite.flow-gate-report.v2` |
| `handoffContractVersion` | `speclite.story-kickoff-handoff.v1` |
| `mode` | `story-kickoff` |
| `target` / `storyKey` | 当前 Story key |
| `result` | `PASS` 或 `PASS_EQUIVALENT` |
| `foundationPrerequisiteStatus` | `PASS` 或 `NOT_APPLICABLE` |
| `closureOwnerCheckStatus` | `PASS` 或 `NOT_APPLICABLE` |

`foundationPrerequisiteRefs` 和 `closureOwnerRefs` 必须引用真实存在的 source index、machineRef、humanRef、gate report 或 verification command。不得引用不存在的 `source-index.json`；如果 source index 不存在，应明确写入使用了哪些 explicit refs。

## Missing Source Index Policy（缺失 Source Index 策略）

Source index 是 preferred artifact，不是唯一合法来源。

当 source index 不存在时，`speclite-flow-gate` 应：

1. 尝试读取 Story/Epic 显式 references 中的 handoff evidence。
2. 如果显式 references 足够，继续生成 v2 report，并在 refs 字段中列出这些 explicit refs。
3. 如果显式 references 不足，输出 `DECISION_NEEDED` 或 `FAIL_CONTRACT`。
4. 不得在 report 中引用不存在的 `{implementation_artifacts}/foundation-handoff/source-index.json`。

当 source index 存在但格式错误、JSON 不可解析、`machineRef` 缺失或 `verifyCommand` 失败时，`speclite-flow-gate` 应 fail closed，不应把状态降级为 `NOT_APPLICABLE`。

## Downstream Consumption（下游消费）

`flow-gate-enforcement` hook：

- 读取 hook event、runtime config 和 kickoff gate report frontmatter。
- 校验 v2 schema、handoff contract version、result、freshness、foundation prerequisite status 和 closure owner status。
- 不读取 source index，也不重新验证项目证据。

`speclite-dev-story`：

- 在状态写入前运行或读取 `story-kickoff` gate。
- 只在 v2 report metadata 允许时推进 `ready-for-dev -> in-progress`。
- 如果 metadata 缺失、legacy、过期或阻断，HALT 并要求重新运行 `speclite-flow-gate` 或修订 Story references。

`speclite-sprint-status`：

- 用 kickoff gate v2 metadata 判断是否推荐 `speclite-flow-gate` 或 `speclite-dev-story`。
- 不应直接解析 source index。

Goal orchestrator：

- 每个 Story 开发前读取 kickoff gate report frontmatter。
- 只有 v2 report 和允许继续的 foundation / closure metadata 才能进入 `speclite-dev-story`。
- 不得用 Markdown prose、历史摘要或直接读取 source index 替代 gate report metadata。

## Recommended Implementation Follow-ups（推荐实施后续）

1. 在 `speclite-flow-gate` workflow 中增加 source refs 完整性规则：report refs 中的文件路径必须存在；不存在时输出 `DECISION_NEEDED`。
2. 增加 source index fixture tests：覆盖 valid index、missing index with explicit refs、stale report refs、invalid schema、missing machineRef。
3. 增加 report authoring test：禁止 `foundationPrerequisiteRefs` 或 `closureOwnerRefs` 引用不存在的 preferred source-index path。
4. 保持 hook 轻量：hook 不读取 source index，只检查 report metadata。
5. 对已存在的目标项目 report 做迁移：若 report 引用了不存在的 source index，应重新运行 `speclite-flow-gate`，或把 refs 修订为真实 explicit refs。

## Current NOI Implication（当前 NOI 含义）

如果 NOI live tree 中不存在 `_speclite-output/implementation-artifacts/foundation-handoff/source-index.json`，则后续 gate report 不应再引用该路径。可接受的通用做法是让 `speclite-flow-gate` 使用 Story 1.16、foundation fixtures、future closure ledger 和对应 verification commands 作为 explicit refs，并把这些真实 refs 写入 v2 metadata。
