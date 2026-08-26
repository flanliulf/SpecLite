# CR Evaluation v2 Output Template（CR Evaluation v2 输出模板）

```markdown
---
schemaVersion: speclite.cr-evaluation.v2
artifactType: code-review-evaluation
storyId: <story-id>
storyKey: <story-key>
reviewSeries: <series>
round: <same as review round>
generatedAt: <RFC3339 timestamp>
modelUsed: <actual evaluator model>
reviewModel: <review model>
reviewSource: <review filename>
reviewSourceHash: sha256:<hex>
headSha: <review head sha>
scopeHash: sha256:<hex>
verdict: <exact evaluation enum>
acceptedCounts:
  p0: 0
  p1: 0
  deferred: 0
  verifyRequired: 0
  dismissed: 0
convergence:
  newBlocking: 0
  recurredBlocking: 0
  resolvedBlocking: 0
  churnDetected: false
  architectureCategories: []
---

# Code Review Evaluation（代码审查评估）

## Binding Verification（绑定验证）

- Review 来源及 hash：...
- Story、series、round：匹配
- Scope hash：匹配
- Reviewer quorum：3/3
- Evaluator 独立性：<不同模型 | 同模型限制说明>

## Finding Evaluations（逐项评估）

### <finding-id>: <title>

- 发现指纹：`sha256:...`
- Reviewer 提出的失败场景：...
- 独立证据：...
- 已检查的反证：...
- 处置：`<accepted|dismissed|deferred|superseded>`
- 优先级：`<P0|P1|VERIFY|DEFERRED|NONE>`
- 必须执行的动作：...

## Required Fixes（阻塞修复）

| 发现指纹 | 优先级 | 失败场景 | 授权范围 |
|---|---|---|---|

## Verify Obligations（验证义务）

| 发现指纹 | 必须补充的测试或断言 | 是否允许修改生产语义 |
|---|---|---|

## Deferred TODO Candidates（延期候选）

| 发现指纹 | 建议紧迫度 | 触发条件 |
|---|---|---|

## Convergence（收敛）

- 新增阻塞项：...
- 复现阻塞项：...
- 已关闭阻塞项：...
- Churn 证据：...
- 架构类别：...

## Evaluation Verdict（评估结论）

- 裁决：`<exact enum>`
- 理由：...
- 必须进入的下一状态：...
```

`fixRecord` 由 fixer 在 leading frontmatter 中追加或更新，并在正文末尾追加对应修复记录。禁止创建第二个 YAML frontmatter。
