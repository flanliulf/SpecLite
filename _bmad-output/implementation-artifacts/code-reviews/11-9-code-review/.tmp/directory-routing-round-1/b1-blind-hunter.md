# Blind Hunter Review（盲审报告）

- `actor`: Blind Hunter
- `model`: GPT-6
- `inputType`: diff
- `findingCount`: 2

## Findings（发现）

1. **blocking: true**
   - `category`: lifecycle
   - `invariant`: 不符合完整 current-artifact 文件名结构的普通文件不得参与 current CR directory 归属判定。
   - `concrete_failure_scenario`: 当 `storyId=11-9`、`reviewSeries=main`，候选目录中存在普通文件 `11-9-code-review-summary-maintenance.md` 时，完整 artifact regex 均不匹配，但文件名以 reserved basename 开头，且 `name.includes("main")` 因 `maintenance` 含 `main` 而成立；resolver 将该目录判为 `current-directory-identity-conflict` 并阻断本可继续的新 run。
   - `primary_location`: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:363`，`classifyCurrentArtifact()`，尤其第 382 行。
   - `first_hand_evidence`: diff 中的 fallback 条件是 `name.startsWith(\`${storyId}-${basename}-\`) && name.includes(reviewSeries)`，它未把 `reviewSeries` 限定在 filename 的 series 字段；同一 diff 的 contract 明确声明 ordinary notes 不参与归属。

2. **blocking: true**
   - `category`: provenance
   - `invariant`: 只有具备与 filename 一致的完整 v2 identity（含 `schemaVersion` 与 `artifactType`）的 artifact 才能建立 current directory authority。
   - `concrete_failure_scenario`: canonical 目录不存在，而某 legacy 目录包含精确命名的 `11-9-code-review-summary-20260909-directory-routing-round-1.md`，其 frontmatter 只有 `storyId: 11-9`、`reviewSeries: directory-routing`、`round: 1`，缺少 `schemaVersion` 和 `artifactType`。`readLeadingIdentity()` 返回两个 `undefined` 字段；校验仅在字段已定义且不匹配时拒绝，因此 `currentCount` 仍递增，resolver 实际返回该 legacy 目录为 `legacy-resume`，后续写入被错误绑定到一个没有合法 v2 artifact provenance 的目录。
   - `primary_location`: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:341`，`inspectDirectoryCandidate()`；以及第 389–411 行 `readLeadingIdentity()`。
   - `first_hand_evidence`: diff 第 341 行使用 `(identity.artifactType !== undefined && …)`，`schemaVersion` 采用相同的可选式判断；第 349 行随后无条件执行 `currentCount += 1`。同一 diff 的 runner contract 要求 current state 来自合法 v2 frontmatter。

## Runtime Metadata Correction（运行时元数据更正）

- 原 `model: GPT-6` 是 actor 依据通用系统人格文字作出的未验证自述，没有 runtime metadata 或工具证据。
- root 的实际 fresh spawn metadata：`actor=/root/story119_r1_blind`、`model=gpt-5.6-sol`、`reasoning_effort=high`、`fork_turns=none`。
- 此更正只校正元数据；actor 未获得 Story/AC/计划/gate/历史报告等新增项目上下文，原 findings 不变。
