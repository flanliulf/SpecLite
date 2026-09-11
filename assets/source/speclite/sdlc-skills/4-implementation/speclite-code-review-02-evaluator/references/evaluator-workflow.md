# Evaluator Workflow v2（Evaluator 工作流 v2）

本文档承载 CR02 的详细 read-only 评估流程。共享 schema、round binding、verdict 和 execution context 以 CR shared contract 为准。

## Directory Preflight（目录预检）

- runner mode 必传 orchestrator 冻结的 `directoryContext` 以及 `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`；不得再次调用 resolver。manual Story mode 必须用 shared script 的 `--mode resolve` 只解析一次并冻结相同 context。
- 任何 evaluation、`.tmp` 或 progress write 前，必须真实调用 production validator：`node "{skills-root}/speclite-code-review-contract/scripts/resolve-cr-directory.mjs" --mode validate-context --project-root "{projectRoot}" --implementation-artifacts "{implementation_artifacts}" --frozen-context "{directoryContextJson}" --story-id "{storyId}" --review-series "{reviewSeries}" --cr-dir "{crDir}" --canonical-cr-dir "{canonicalCrDir}" --compatibility-mode "{compatibilityMode}" --legacy-artifact-paths "{legacyArtifactPathsJson}" --write-subpath "{storyId}-code-review-evaluation-{date}-{reviewSeries}-round-{round}.md"`。
- validator stdout 必须为 `ok=true`；缺字段、consumer context 与 frozen context 不一致、unsafe write path、non-zero 或 invalid JSON 时在任何写入前 HALT。validator 只验证目录 context/path，不替代本 Skill 原有 approval、scope/hash、tracker、freshness、round 或 coordinated-write gate。
- 所有 Story mode 不得根据 Story title、slug、filename 或 tracker 重新推导目录；全部 outputs 使用同一个 resolved `crDir`。

## Step 1: Locate Current Review（定位 current review）

1. 解析唯一 `storyId/storyKey/reviewSeries`。
2. 在 current series 中取最大 round 的 v2 review；不得按文件数量或 mtime 判断。
3. review 为 `REVIEW_DEGRADED`、schema 无效、scope exception 非空或 quorum 不满足时 HALT，不生成可收口 evaluation。

## Step 2: Enforce One-to-One Binding（一对一绑定）

1. 计算 `reviewSourceHash`，evaluation round 必须等于 review round。
2. 同一 review hash 已有 current evaluation 时幂等返回已有 artifact。
3. 用户明确要求替代时，旧 evaluation 标记 superseded 并由新文件引用；不得制造两个 current evaluation。
4. 复制并核对 review 的 `headSha` 与 `scopeHash`。

## Step 3: Independent Verification（独立验证）

逐条验证：

- 第一手代码证据是否支持具体失败场景；
- invariant 与 Story/owning contract 是否一致；
- 是否存在反证或合法场景；
- severity 与 bounded scope 是否合理；
- 动作属于 production patch、verify-only、defer 或 decision-needed；
- fingerprint 属于 new/recurred/resolved/superseded。

多来源只提高复核优先级，不自动等于有效；单来源也不能仅因来源单一而 dismiss。同模型评估必须为每条 blocking finding 主动寻找 disconfirmation，并记录 independence caveat。

## Step 4: Classify Verdict（结构化裁决）

- P0/P1 生产语义缺陷：`FIX_REQUIRED`。
- 只有测试、断言、fixture 或机械证据义务：`VERIFY_REQUIRED`。
- 只有真实非阻塞项：`PASS_WITH_DEFERRED_TODOS`。
- 无义务或延期项：`PASS`。
- authority/ownership/lifecycle/跨组件并发需要一次性裁决：`ARCHITECTURE_TRIAGE`。
- 达到 round/churn/new blocking 阈值：`STOP_LOSS`。
- 缺少需求或授权：`DECISION_NEEDED`。

## Step 5: Compute Convergence（计算收敛）

按 fingerprint 计算 `newBlocking`、`recurredBlocking`、`resolvedBlocking`、`churnDetected` 和 `architectureCategories`。不能把措辞变化当新 P1，也不能用主观判断替代 fingerprint/location evidence。

## Step 6: Write and Verify（写入并验证）

1. 严格使用 `assets/output-template.md`，frontmatter 满足 v2 schema。
2. `acceptedCounts` 与正文一致，每条 finding 写 disposition、priority、理由和必须动作。
3. 写入后重读核对 review hash、scope hash、round、verdict、counts 和 canonical filename。
4. 返回 artifact 给 `handoffTarget`，并给出共享 state machine 中唯一下一状态。

## Common Mistakes（常见错误）

- 在 evaluation 阶段修改源码、Story、tracker 或 review source。
- 把 reviewer 来源数量当作 finding 有效性的替代证据。
- 把 verify obligation 或 metadata 记账项直接转入 TODO/finalizer。
- 人工模式下等待 runner 选择 verdict 或下一状态。
