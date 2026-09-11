# Blind Hunter Layer Report

- `actor`: `fresh Blind Hunter`
- `dispatchModel`: `gpt-5.6-sol`
- `reasoningEffort`: `high`
- `reviewMode`: `read-only / diff-only`
- `candidateCount`: `2`
- `blockingFindingCount`: `2`
- `verifyRequiredCount`: `0`

## Findings（发现）

### BH-R2-01：`validate-context` 无法证明 frozen context 来自 resolver

- `severity`: `blocking`
- `category`: `authority/provenance`
- `invariant`: production validator 只有在 `frozenContext` 确实来自本 Story、当前磁盘状态下唯一一次 resolver 调用时，才能返回 `ok=true`。
- `concrete_failure_scenario`:
  1. 磁盘上仅有一个 current legacy run：`state/code-reviews/11-9-old-title-code-review`。
  2. 调用方跳过 resolver，向 validator 同时传入两份相同的伪造 canonical context：`crDir=state/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`。
  3. `normalizeContext()` 只检查字段内部一致性，`sameContext()` 只比较两份调用方输入；两者都通过。
  4. canonical 目录不存在时，`validateCrDirectoryContext()` 又因 `compatibilityMode === "canonical"` 使用 `missingAllowed: true`，最终返回 `ok=true`。
  5. consumer 因而可以在 canonical sibling 写入，绕过“唯一 current legacy 必须原位续写”的目录 ownership。
- `evidence`: validator 没有消费 resolver 生成的不可伪造结果、绑定摘要或其他 provenance evidence；`frozenContext` 与 `consumerContext` 均由同一调用边界提供，自相等只能发现两份参数漂移，不能证明首次 resolution 实际发生或结果未被替换。
- `primary_location`: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` — `validateCrDirectoryContext()`、`normalizeContext()`、`sameContext()`。

### BH-R2-02：非 closing delimiter 可伪造 current artifact ownership

- `severity`: `blocking`
- `category`: `identity/provenance`
- `invariant`: 只有具备完整、合法 frontmatter 边界的 current-family artifact 才能成为 CR directory ownership evidence。
- `concrete_failure_scenario`:
  1. legacy 目录中放入匹配 current filename 的文件，例如 `11-9-code-review-summary-20260909-directory-routing-round-1.md`。
  2. 文件以合法 identity 字段开头，但使用 `---not-a-delimiter` 结束：
     ```yaml
     ---
     schemaVersion: speclite.cr-review.v2
     artifactType: code-review-summary
     storyId: 11-9
     reviewSeries: directory-routing
     round: 1
     ---not-a-delimiter
     ```
  3. `readLeadingIdentity()` 使用 `content.indexOf("\n---", 4)`，会把 `---not-a-delimiter` 的前三个字符误认为 closing delimiter。
  4. 所有 identity 字段随后通过比较，`currentCount` 增加；该目录被标记为 `CURRENT`。
  5. resolver 返回 `legacy-resume`，虽然磁盘上并不存在有效的 v2 frontmatter artifact。
- `evidence`: closing boundary 只检查字符串前缀 `\n---`，没有要求 delimiter 独占一行，也没有验证 frontmatter 的完整闭合。
- `primary_location`: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` — `readLeadingIdentity()` 中 `content.indexOf("\n---", 4)`。
