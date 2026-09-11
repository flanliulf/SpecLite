# Reviewer Workflow v2（Reviewer 工作流 v2）

本文档承载 CR01 的详细顺序流程。共享 identity、scope、schema、round、quorum 和 standalone execution context 以 `{skills-root}/speclite-code-review-contract/references/cr-contract.md` 为准。

## Step 1: Resolve Identity and Round（解析身份与轮次）

1. 建立唯一 `storyId -> storyKey -> storyFile` 映射。
2. CR 目录只消费 runner 或人工 orchestrator 通过 `speclite resolve cr-directory` 解析并传入的 `crDir`（连同 `compatibilityMode`、`legacyArtifactPaths`），不重推导；无传入值时自行调用该 CLI 一次，`continuation=block` 时 HALT。
3. 扫描同一 `reviewSeries` 的 v2 summary，取最大 round + 1；不得按文件数量或 mtime 计算。
4. legacy/其他 series 只作为 historical context。
5. 建立 `orchestrationMode` 与 `handoffTarget`；人工模式不得等待 runner record。

## Step 2: Freeze Review Scope（冻结审查范围）

1. 读取或生成 `baseSha`、`headSha`、`declaredFiles`、`actualChangedFiles`、`excludedFiles`、`scopeExceptions`。
2. staged、unstaged、untracked 必须全部进入实际改动扫描。
3. `baseSha` 只能来自用户输入或 development record；不得默认 `main...HEAD`。
4. 计算绑定文件内容摘要的 `scopeHash` 与 `sourceMutationAt`。
5. `scopeExceptions` 非空时写入完整清单，verdict 固定为 `REVIEW_DEGRADED` 并停止进入可收口裁决。

## Step 3: Build Inputs（构建审查输入）

1. diff 覆盖 `actualChangedFiles - excludedFiles`。
2. 同时生成 Story AC、Anchor Evidence Summary、completion gate、current-series finding registry 和 scope manifest。
3. 完整文件 fallback 只有 Story 明确要求时可用，并标记 `inputMode: full-file`；不得把既有代码误称为本轮新增改动。
4. 临时文件使用 `$crDir/.tmp/{reviewSeries}-round-{round}/`，避免同 Story series 冲突。

## Step 4: Run Three Layers（三层审查）

完整读取并执行 `references/review-engine.md`。三个 fresh layer 可以并行，但必须共享以下硬约束：

- 不设最低 finding 数；零 finding 合法。
- blocking finding 必须有 category、invariant、具体失败场景和 primary location。
- 可由测试判定但尚无反例的关切标为 `verify-required` 候选。
- 仅措辞或位置变化、无新失败场景的历史问题按 fingerprint 判 `recurred` 或 `dismissed`。
- metadata/provenance 机械同步与真正 authority/provenance 缺陷必须区分。

## Step 5: Enforce Quorum（执行 Quorum）

- 3/3：允许 `PASS_RECOMMENDED` 或 `FINDINGS_REPORTED`。
- 2/3：保留 findings，但 verdict 固定为 `REVIEW_DEGRADED`；只有同轮补跑失败层成功才能升级。
- 0/3 或 1/3：HALT，不生成可供 evaluator/finalizer 消费的 current review。
- auditor 缺失时 `acCoverageComplete=false`。

## Step 6: Normalize Findings（规范发现）

每条 finding 生成 `findingId`、`fingerprint`、`category`、`invariant`、`concreteFailureScenario`、`primaryLocation`、`sourceLayers`、`bucket` 和 `disposition`。语义去重以 invariant 与具体失败场景为主，不能只比较行号或措辞。

## Step 7: Write and Verify（写入并验证）

1. 严格使用 `assets/output-template.md`，frontmatter 满足共享 Review schema。
2. `PASS_RECOMMENDED` 只是 reviewer 建议；有 finding 时为 `FINDINGS_REPORTED`。
3. `findingCounts` 与正文逐项一致。
4. 写入后重读并核对 schema、scope hash、finding set hash、文件名和 canonical path。
5. 清理当前 round 临时目录；清理失败不改变 verdict，但必须报告。
6. 返回 artifact 给 `handoffTarget`，下一步固定为 fresh CR02 evaluator。

## Common Mistakes（常见错误）

- 自动采用 `main...HEAD`，或只审查 Story File List 而漏掉未声明工作树改动。
- 2/3 quorum 时仍输出可收口 PASS，或用当前模型补写失败层冒充独立审查。
- 把历史测试、旧 completion gate 或 full-file 内容表述为本轮 fresh diff evidence。
- 人工模式仍等待 runner 生成 scope、round 或 handoff record。
