# CR Review v2 Output Template（CR Review v2 输出模板）

```markdown
---
schemaVersion: speclite.cr-review.v2
artifactType: code-review-summary
storyId: <story-id>
storyKey: <story-key>
reviewSeries: <series>
round: <round>
generatedAt: <RFC3339 timestamp>
modelUsed: <actual model>
verdict: <PASS_RECOMMENDED|FINDINGS_REPORTED|REVIEW_DEGRADED>
baseSha: <git sha>
headSha: <git sha>
scopeHash: sha256:<hex>
sourceMutationAt: <RFC3339 timestamp>
inputMode: <diff|full-file>
declaredFiles: []
actualChangedFiles: []
excludedFiles: []
scopeExceptions: []
availableLayers: [blind, edge, auditor]
failedLayers: []
acCoverageComplete: true
findingSetHash: sha256:<hex>
findingCounts:
  decisionNeeded: 0
  patch: 0
  verifyRequired: 0
  defer: 0
  dismiss: 0
---

# Code Review Summary（代码审查总结）

## Scope Manifest（范围清单）

- 声明文件：...
- 实际改动文件：...
- 排除文件及授权依据：...
- 范围例外：无
- 基线来源：<用户输入或开发记录>

## Layer Status（审查层状态）

| 审查层 | 状态 | 输出 |
|---|---|---|
| blind | PASS/FAILED | ... |
| edge | PASS/FAILED | ... |
| auditor | PASS/FAILED | ... |

## Previous Findings（历史发现）

| 发现指纹 | 历史轮次 | 处置 | 证据 |
|---|---:|---|---|

## Findings（发现）

### <finding-id>: <title>

- 发现指纹：`sha256:...`
- 类别：`<category>`
- 不变量：<被违反的单一不变量>
- 具体失败场景：<输入或状态 -> 错误结果>
- 主要位置：`<file:line>`
- 来源审查层：`<blind+edge>`
- 分类桶：`<decision-needed|patch|verify-required|defer|dismiss>`
- 处置：`<new|recurred|resolved|superseded|deferred|dismissed>`
- 证据：...
- 影响：...
- 建议下一步：...

零 finding 时写：`本轮在冻结范围和 3/3 quorum 下未发现实质问题。`

## Verification Evidence（验证证据）

### Executed This Round（本轮实际执行）

- `<command>`：PASS/FAIL

### Referenced Historical Evidence（引用历史证据）

- `<artifact>`：<结果与时效限制>

## Convergence Input（收敛输入）

- 新增阻塞指纹候选：...
- 复现指纹候选：...
- 已关闭指纹：...
- 反复修改位置：...
- 架构类别：...

## Reviewer Verdict（Reviewer 结论）

- 裁决：`<exact enum>`
- 理由：...
- 必须执行的下一步：`speclite-code-review-02-evaluator`
```

## Rules（规则）

- Frontmatter 必须是文件唯一 leading YAML block。
- 计数必须与 findings 正文一致。
- `PASS_RECOMMENDED` 只在 scope complete、3/3 quorum、无 blocking candidate 时使用。
- Reviewer 不能输出最终 `PASS`、`FIX_REQUIRED` 或 finalizer authorization。
- 不得把历史测试结果写入“本轮实际执行”。
