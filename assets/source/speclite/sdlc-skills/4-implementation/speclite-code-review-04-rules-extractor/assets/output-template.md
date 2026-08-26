# CR Rules Extraction v2 Output Template（CR 规则提炼 v2 输出模板）

```markdown
---
schemaVersion: speclite.cr-rules-extraction.v2
artifactType: cr-rules-extraction
storyId: <story-id>
storyKey: <story-key>
reviewSeries: <series>
round: <evaluation-round>
generatedAt: <RFC3339 timestamp>
modelUsed: <actual model>
evaluationSource: <evaluation filename>
evaluationSourceHash: sha256:<hex>
eligibleFindingSetHash: sha256:<hex>
candidateRuleCount: 0
globalRuleEligibleCount: 0
result: <COMPLETED|HALTED>
---

# CR Rules Extraction（CR 规则提炼）

## Binding Verification（绑定验证）

- Story、series、round：...
- Evaluation source/hash：...
- Eligible finding set hash：...

## Model Timeline（模型时间线）

| 轮次 | 角色 | 模型 | Evidence caveat |
|---:|---|---|---|

## Eligible Evidence（合格证据）

| 发现指纹 | Disposition | 验证证据 | 跨 Story 复现 |
|---|---|---|---|

## Excluded Evidence（排除证据）

| 来源 | 排除理由 |
|---|---|

## Candidate Rules（候选规则）

### <rule-id>: <规则标题>

- 类型：`<avoidance|principle|best-practice|exception>`
- 适用范围：...
- Evidence：...
- Global eligibility：`<candidate-rule|global-rule-eligible>`
- 例外：...

## Document Suggestions（文档建议）

| Candidate rule | 建议文件/章节 | 是否需要用户授权 | 理由 |
|---|---|---|---|

## Result（结果）

- 结果：`<COMPLETED|HALTED>`
- 下一步：`speclite-code-review-05-todo-tracker`

---

*本文档由 speclite-code-review-04-rules-extractor Skill 自动生成*
```

## Rules（规则）

- Frontmatter 必须是唯一 leading YAML block。
- candidate/global counts 必须与正文一致。
- 未经用户明确授权不得修改全局文档。
