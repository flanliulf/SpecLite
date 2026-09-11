# Review Dimensions（审查维度）

## Dimension Matrix（维度矩阵）

| Dimension | What to Check | Typical Fix |
| --- | --- | --- |
| Source of Truth | PRD / UX / Architecture / Epic index、archive、reports、prototype gate 是否边界清楚。 | 增加 `implementation consumption boundary`、`current-use boundary`、report scope。 |
| Traceability | FR / NFR / AR / UX-DR、页面 / Shell / route 合同、wireframe、Launch Gate、Story dependency 是否双向闭合。 | 补 owner Story、coverage row、explicit exclusion，或收缩 overclaim。 |
| Terminology | 领域词、状态名、DTO 名、产品概念是否漂移。 | 建 glossary / registry，替换别名，补概念边界。 |
| UX Contract | page family、page instance、route、guard、fallback、mobile boundary、a11y、status region 是否能进入 Story gate。 | 绑定页面合同、Shell 合同、RouteContract 和 StoryGateRule 或等价 normalized gate。 |
| API Schema | DTO、enum、error code、OpenAPI、typed client、list query、reason code 是否稳定。 | 建 registry、schema version、unknown handling、owner Story。 |
| State Lifecycle | transition、terminal guard、rollback、stale callback、snapshot freshness 是否明确。 | 补状态表、version / expiry、fail-closed、refetch / re-preview。 |
| Evidence Gate | EvidenceManifest、minimum evidence matrix、contract test、schema test、E2E、QA note 是否可追踪。 | 补 evidence type、evidence refs、hard blocker、exception rule。 |
| Runtime Ownership | api-server、scheduler、worker、importer、AI provider、notification、incident service 的 owner 是否清楚。 | 补 handoff DTO、JobRunContract、domain result、root verification。 |
| Security Privacy | low leakage、redaction、trace boundary、用户生成内容、私密日志、隐藏评估数据、受监管用户数据是否安全。 | 使用 opaque refs、redaction profile、viewer-filtered count、server-side decision DTO。 |
| Test QA Fixture | fixture provenance、seed reset、fixed clock、QA manifest、manual QA evidence 是否可复现。 | 补 TestPersonaFixture、TestDataResetContract、ClockProvider、QA evidence plan。 |
| Implementation Handoff | Story Review、Sprint Planning、QA guide、Dev Story 是否消费同一 normalized gate。 | 补 StoryGateRule 或等价 gate 的 source refs、conflict state、QA plan、scope lock、reopen trigger。 |

## Issue Taxonomy（问题归类）

| Category | Symptom | Recommendation |
| --- | --- | --- |
| Missing Anchor | PRD 有需求，Epic / Story 没有 owner、字段、验收或证据。 | 在 owner Story 补字段、DTO、event、fixture 或 root verification。 |
| Orphan Reference | ref 在 registry 或目标文档中不存在。 | 补 registry / owner；不适用则写 explicit exclusion。 |
| Overclaim | 摘要或报告声明正文没证明的能力。 | 收缩 claim，增加 scope boundary。 |
| Terminology Drift | 同一概念多名或职责不同。 | 建 canonical term / registry，写相邻概念边界。 |
| Source Boundary Ambiguity | 多个入口都像当前真相源。 | 在 index / report 声明用途、历史性和下游 gate。 |
| Gate Evidence Gap | gate 无 evidence type、refs 或 fail condition。 | 建 minimum evidence matrix，接入 evidence DTO。 |
| State Lifecycle Gap | 状态、过期、撤回、回滚、重放不清。 | 写 transition guard、terminal state、rollback / compensation。 |
| Snapshot Freshness Gap | 旧 policy / capability / eligibility snapshot 可继续成功。 | 加 version / revision / expiry 和 stale fail-closed。 |
| Ownership Gap | 决策、NFR、Architecture step 或 incident action 无 owner。 | 补 Epic / Story owner、blocker type、handoff artifact。 |
| UX Runtime Mismatch | UX 可见动作和 API / state gate 不一致。 | 绑定 route、页面合同、Shell 合同、status region、mobile boundary。 |
| API Schema Gap | DTO、enum、error code、operationId、typed client 分散。 | 建 registry 和 schema version，规定 unknown handling。 |
| Security Privacy Gap | trace、用户生成内容、私密日志、隐藏评估数据、受监管用户数据可能泄露。 | 服务端低泄露决策、redaction、opaque refs、audit access decision。 |
| Testability Gap | 只有 prose，没有 fixture、test、schema 或 evidence。 | 补 fixture manifest、schema / contract / E2E / manual QA 计划。 |
| Handoff Gap | 实现者不知道以哪份文档为准或冲突时是否停工。 | 增加 implementation handoff、source conflict、planning reopen trigger。 |

## Priority（优先级）

- P0：会导致错误实现、发布误判、数据泄露、合规承诺误读或 hard blocker 被绕过。
- P1：会导致 Story Review / Dev Story 重复解释、实现返工或 QA 无法验收。
- P2：会造成局部术语漂移、低风险 overclaim 或后续维护成本。
- P3：纯整理或 readability，不应占用 grill question，除非它阻断证据可读性。

## Version（版本）

- v1.0.0 - 2026-07-04：初始维度矩阵。
