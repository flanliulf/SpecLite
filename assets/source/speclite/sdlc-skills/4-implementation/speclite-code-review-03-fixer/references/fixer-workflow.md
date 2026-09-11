# Fixer Workflow v2（Fixer 工作流 v2）

本文档承载 CR03 的详细有界修改流程。共享 evaluation binding、fixRecord、execution context 和 state machine 以 CR shared contract 为准。

## Directory Preflight（目录预检）

- runner mode 必传 orchestrator 冻结的 `directoryContext` 以及 `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`；不得再次调用 resolver。manual Story mode 必须用 shared script 的 `--mode resolve` 只解析一次并冻结相同 context。
- 任何 artifact、`.tmp`、source 或 progress write 前，必须真实调用 production validator：`node "{skills-root}/speclite-code-review-contract/scripts/resolve-cr-directory.mjs" --mode validate-context --project-root "{projectRoot}" --implementation-artifacts "{implementation_artifacts}" --frozen-context "{directoryContextJson}" --story-id "{storyId}" --review-series "{reviewSeries}" --cr-dir "{crDir}" --canonical-cr-dir "{canonicalCrDir}" --compatibility-mode "{compatibilityMode}" --legacy-artifact-paths "{legacyArtifactPathsJson}" --write-subpath "{storyId}-code-review-evaluation-{date}-{reviewSeries}-round-{round}.md"`。
- validator stdout 必须为 `ok=true`；缺字段、consumer context 与 frozen context 不一致、unsafe write path、non-zero 或 invalid JSON 时在任何写入前 HALT。validator 只验证目录 context/path，不替代本 Skill 原有 approval、scope/hash、tracker、freshness、round 或 coordinated-write gate。
- 所有 Story mode 不得根据 Story title、slug、filename 或 tracker 重新推导目录；全部 outputs 使用同一个 resolved `crDir`。

## Step 1: Bind Current Evaluation（绑定 current evaluation）

1. 定位同一 Story/series 最大 round 的 v2 evaluation。
2. 重算 evaluation file hash、current scope hash 和 review source hash。
3. `mode=patch` 只接受 `verdict=FIX_REQUIRED`；`mode=verify-only` 只接受 `verdict=VERIFY_REQUIRED`。
4. hash/scope/round 不匹配、evaluation 非 current 或已有 completed fixRecord 时 HALT。

## Step 2: Build Authorized Plan（生成授权计划）

1. `patch` 只提取 Required Fixes 中 evaluator accepted P0/P1。
2. `verify-only` 只提取 Verify Obligations；允许测试、断言、fixture 和机械证据，不允许改变 production semantics。
3. 每项记录 fingerprint、文件、位置、方案、预期验证和 excluded scope。
4. `confirmationPolicy=explicit` 时展示计划并等待当前用户确认。
5. `confirmationPolicy=preauthorized` 时验证 `authorizationSource` 指向 runner goal record、人工 orchestrator record 或当前明确用户授权；计划超出 evaluation scope 时仍须 HALT。

## Step 3: Churn Guard（反 churn）

检查：

- 同一 fingerprint 连续修复仍复现；
- 同一函数反复修改且 blocking count 不下降；
- finding 已迁移到 architecture category。

命中时停止局部 patch，返回 `STOP_LOSS_CANDIDATE` 或 `ARCHITECTURE_TRIAGE_CANDIDATE`、fingerprint/location evidence 和建议下一步。该结果交给 `handoffTarget`，由 fresh evaluator、manual orchestrator 或用户按共享契约裁决；Fixer 自身不伪造 evaluation verdict。

## Step 4: Apply Changes（执行变更）

1. 逐项、最小、定点修改。
2. 不得顺手修复 deferred/TODO/dismissed finding。
3. `verify-only` 一旦发现必须修改生产语义，立即停止并要求重新评估。
4. 每项记录 changed files、关键差异和 fingerprint。

## Step 5: Verify（验证）

1. 运行 evaluation 指定的 focused commands。
2. 对增量编译敏感环境使用 clean/fresh build evidence。
3. aggregate gate 因环境缺失停止时如实记录 caveat；等价命令说明环境与覆盖边界。
4. 验证失败不得把 fixRecord 标为 completed。

## Step 6: Update Fix Record（更新修复记录）

1. 在 evaluation 唯一 leading frontmatter 中更新共享契约定义的 `fixRecord`。
2. 正文末尾追加 `## Fix Record（修复执行记录）`，含 model、mode、fingerprints、changed files、commands、results、caveats。
3. 写入后重读验证 frontmatter 可解析且只有一个 YAML block。

## Step 7: Fresh Handoff（Fresh 交接）

1. 返回 `handoffTarget`，重新冻结 scope。
2. 必须执行 fresh reviewer 和 fresh evaluator；completed fixer 不是 finalizer authorization。
3. 人工模式给出下一次独立调用命令，不要求 runner 存在。

## Common Mistakes（常见错误）

- 把 evaluator 未接受的 P2/TODO 顺手并入修复。
- 用 verify-only 改 production semantics，或把验证失败记录为 completed。
- churn 命中后继续局部 patch，而不是返回可审计 route recommendation。
- fixer 后直接进入 finalizer，未执行 fresh review/evaluation。
