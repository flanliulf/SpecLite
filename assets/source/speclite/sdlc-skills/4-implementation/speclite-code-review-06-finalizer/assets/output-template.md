# CR Finalizer v2 Output Template（CR Finalizer v2 输出模板）

```markdown
---
schemaVersion: speclite.cr-finalizer.v2
artifactType: cr-finalizer
storyId: <story-id>
storyKey: <story-key>
reviewSeries: <series>
round: <evaluation-round>
generatedAt: <RFC3339 timestamp>
modelUsed: <actual model>
evaluationSource: <evaluation filename>
evaluationSourceHash: sha256:<hex>
evaluationVerdict: <PASS|PASS_WITH_DEFERRED_TODOS>
rulesExtractionSource: <cr-rules-extraction filename>
rulesExtractionSourceHash: sha256:<hex>
todoResultSource: <cr-todo-result filename>
todoResultSourceHash: sha256:<hex>
scopeHash: sha256:<hex>
completionGateSource: <gate filename>
completionGateResult: <PASS|PASS_EQUIVALENT>
completionGateGeneratedAt: <RFC3339 timestamp>
completionGateSourceHash: sha256:<hex>
trackerWrites: []
trackerChangeSet:
  - path: <tracker path>
    key: <exact key>
    beforeHash: sha256:<hex>
    afterHash: sha256:<hex>
    rereadConsistent: <true|false>
trackerRereadConsistent: <true|false>
result: <DONE|HALTED>
---

# CR Finalizer Report（CR Finalizer 报告）

## Binding Verification（绑定验证）

- Review/evaluation Story、series、round：...
- Evaluation source/hash/verdict：...
- Current scope hash：...

## Completion Gate（完成门禁）

- Source/result/generatedAt：...
- Freshness boundary：...
- Foundation/closure owner status：...

## Tracker Change Set（Tracker 变更集）

| 文件 | 精确 key | 写入前 | 写入后 | 重读结果 |
|---|---|---|---|---|

## Partial Write Recovery（部分写入恢复）

- 已写入：...
- 未写入：...
- 恢复动作：...

无 partial write 时写：`无。`

## Result（结果）

- 结果：`<DONE|HALTED>`
- Epic handoff：...

---

*本文档由 speclite-code-review-06-finalizer Skill 自动生成*
```

## Rules（规则）

- Frontmatter 必须是唯一 leading YAML block。
- `DONE` 只允许在全部 required tracker 重读一致时使用。
- partial write、stale gate 或 binding mismatch 必须为 `HALTED`。
