---
Story: 11-5
Round: 7
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-5-code-review-summary-20260904-round-7.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-5 的第 7 轮 CR 复审结果进行独立逐项评估。Round 7 的两个 findings 均有 current source 证据，但交付处置不同：Finding #1 会把 declared shard symlink 指向的 directory/FIFO 等 non-regular target 写入 `declaredShardPaths` 与 `consumedPaths` 后错误 continue，是确定的 P1 blocker；Finding #2 会在 missing-index candidate scan 中漏掉 lexical `.md` symlink，影响 diagnostic truth，但 current owning contract 没有唯一规定 undeclared candidate symlink 各类 target 的候选语义，且当前行为仍 fail closed、空消费、零 mutation，因此作为 P2 纳入 CR TODO，不阻塞本 Story closeout，也不在本轮进入 Owner Gate。

本轮整体结论为 **FAIL / FIX_REQUIRED**。仅 Finding #1 授权 bounded patch；Finding #2 交由 CR05 登记 TODO。Finding #1 经 Fixer 修复并由 fresh Reviewer/Evaluator 关闭前，不得进入 CR04、CR05 或 CR06。

## Previous Round Closure（上轮问题回顾确认）

### Round 6 Finding #1 canonical entry 与 mismatch probe final-target regular-file：PASS（原 finding 保持关闭）

`inspectReadableSubjectFile()` 当前在 lexical `lstat`、`realpath` containment 后执行 dereferenced `stat(...).isFile()`，然后才返回 `readable`（`src/config/artifact-document-discovery.ts:804-825`）。Round 7 Finding #1 位于独立的 `resolveDeclaredShards()` 控制流，不重开 canonical whole/index 或 Owner M probe 的已关闭问题。

### Round 6 Finding #2 Owner 方案 I candidate scan unreadable：PASS（原 finding 保持关闭）

Missing-index 必要 scan 的 root/nested non-`ENOENT` `readdir` failure 已返回 `artifact-path.invalid-sharded-document-shape` / `reason=shard-candidate-scan-unreadable` 与失败目录的安全相对路径（`src/config/artifact-document-discovery.ts:165-191,768-801`；`SPEC 07:286-293`；`SPEC 09:95-103`）。Round 7 Finding #2 是成功枚举后的 `Dirent` 分类遗漏，不是 scan failure，也不推翻 Owner 已确认的方案 I。

### Owner 方案 S、M、L：PASS（保持关闭）

- 方案 S 的显式 `selection=whole` 仍不读取未选 `index.md` graph，同时保留 canonical index entry safety。
- Owner M 的有限只读 probes 仍仅产生 diagnostic，不 fallback、不消费、不迁移。
- Owner L 的 bounded Markdown grammar、query/fragment、single decode、声明顺序、去重与 self-link 行为未被本轮 findings 重开。

### Historical CR TODO（历史 CR TODO，非阻塞）

无。Finding #2 将在本轮通过后由 CR05 新增，而不是改写历史记录。

## Finding #1 Evaluation（发现 #1 评估）

### Review Finding（审查原文）

> **[P1 / PATCH] Declared shard symlink 未验证最终 target 为 regular file**
> - 来源：blind + edge + auditor；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolveDeclaredShards()` 对 lexical target 执行 `lstat`，允许 regular file 或 symlink；随后执行 `access`、`realpath` 与 subject containment，但没有在成功路径中验证 dereferenced target 是 regular file（`src/config/artifact-document-discovery.ts:465-524`，尤其 `504-520`）。因此，subject 内 `chapter.md` symlink 指向 directory、FIFO 或其它 non-regular target 时会通过该路径，并被加入 `resolvedPaths`；caller 随后把它写入 `declaredShardPaths` 与 `consumedPaths` 并返回 `continuation=continue`（`src/config/artifact-document-discovery.ts:196-224,343-353`）。

这与 `SPEC 09` 对 valid sharded input“只消费 `index.md` 及其明确声明 shards”以及不可读 shard 必须 block 的要求冲突（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:88-103`）。`SPEC 07` 已明确 `artifact-path.broken-shard-reference` 覆盖不可读 declared shard，并要求 details 中记录 `referenceKind`（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:286-293`）。

**严重性判断：合理**

该缺陷不是单纯诊断差异，而是把 non-regular filesystem object 授权给 downstream consumer，破坏 AC4、AC5、AC8 与 AC10，并可能把 FIFO 等阻塞读取风险传给后续 reader。P1 阻塞交付合理。

**修复建议：可行，授权最小 bounded patch**

在 `resolveDeclaredShards()` 中保留现有 lexical type、`realpath` containment 与 readability 检查，并在成功加入 `resolvedPaths` 前对 dereferenced `targetRealPath` 执行 `stat(...).isFile()`（或严格等价的 final-target regular-file check）。最终 target 为 non-regular 或不可读时，必须走现有唯一 mapping：

- `issueId=artifact-path.broken-shard-reference`
- `reason=unreadable-shard`
- `referenceKind=unreadable-shard`
- `discoveryShape=invalid-sharded`
- top-level `actualConsumedPath=null`
- `consumedPaths=[]`
- `continuation=block`

Subject 内 symlink→readable regular file 继续合法；subject 外 target 继续使用现有 `outside-subject-directory` mapping；broken target 保留现有 missing/unreadable distinction。不得禁止所有 shard symlink、不得改变 Markdown grammar、不得新增 stable ID，也不得扩展为通用 filesystem taxonomy。

Direct fixtures 至少覆盖 inline declared shard symlink→directory 与 reference-style declared shard symlink→FIFO（平台允许时），并断言 schema、稳定重复调用、安全 project-relative evidence、无 absolute/raw error 泄露和 zero mutation；同时保留 in-bound symlink→regular continue 与 outbound symlink block。Focused test 应证明 issue details 的 `reason` 和 `referenceKind` 都是 `unreadable-shard`。

**误报评估：非误报**

Current source 的成功路径确实缺少 final-target regular-file check，且现有 focused fixtures 只覆盖 canonical whole/index 的 non-regular symlink，并未覆盖 declared shard 对应反例（`test/artifact-document-discovery.test.ts:436-651`）。

## Finding #2 Evaluation（发现 #2 评估）

### Review Finding（审查原文）

> **[P2 / DECISION_NEEDED] Missing-index candidate scan 忽略 lexical `.md` symlink**
> - 来源：blind；Aggregator 独立确认
> - 分类：decision_needed

### Evaluation Conclusion（评估结论）：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确，但完整处置 contract 不足**

`listMarkdownFiles()` 只把 `entry.isFile() && name.endsWith(".md")` 加入 candidate set；`readdir(..., { withFileTypes: true })` 对 symlink 返回 `isSymbolicLink()`，所以所有 lexical `.md` symlink 都被忽略（`src/config/artifact-document-discovery.ts:768-801`）。当 whole/index 都不存在时，这会使至少一个语义上可信的场景——subject 内 lexical `.md` symlink→subject 内 readable regular file——从 `shards-without-index` 落为 `subject-document-missing`（`src/config/artifact-document-discovery.ts:192-245`）。现有 test 只覆盖 regular root/nested candidates和 enumeration failure，没有该 symlink matrix（`test/artifact-document-discovery.test.ts:741-820`）。

然而，`SPEC 07` 只规定“subject directory 中存在 shard candidates 但缺 canonical `index.md`”映射为 `invalid-sharded-document-shape`，没有定义 candidate 是 lexical `.md` entry 还是通过安全 target eligibility 后的 artifact（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:286-293`）。`SPEC 09` 同样只规定“shards 存在但缺 `index.md`”以及 candidate scan 何时执行、scan failure 如何映射；其 symlink 规则明确覆盖 canonical whole/index 与 `index.md` 已声明的 shard target，并未覆盖 undeclared candidate enumeration（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:88-103`）。

因此，current contract 无法唯一推出以下类别是否都应“仅凭 lexical `.md` entry 存在”计入 candidate，或应先按 target safety 分类：

- subject 内 symlink→readable regular file；
- symlink→subject 外 regular file；
- broken symlink；
- symlink→directory、FIFO 或其它 non-regular target。

这些 entries 在 missing-index 分支只用于判断 candidate 是否存在，并不会被消费；但选择 lexical-existence 或 safe-target-eligibility 仍会改变 `discoveryShape`、stable issue/reason、mismatch probe precedence与 evidence。不能把 canonical/declared symlink policy 仅凭“policy consistency”自动推广到 undeclared candidates，也不能在 Evaluator 中猜测新 taxonomy。

**严重性判断：原始 P2 合理；作为非阻塞治理缺口处理**

已知反例仍返回 structured `block`，top-level `actualConsumedPath=null`、`consumedPaths=[]`，且 resolver 本身不执行 artifact write 或 progress mutation。未发现 unsafe consumption、错误 continue 或越界读取。影响集中在 diagnostic truth 与潜在 mismatch precedence，所以不提升为 P1。

由于 Story 11.5 的核心交付可在 Finding #1 修复后安全、确定地运行，而 Finding #2 的完整修复需要先补全 owning candidate semantics，本轮不强制进入 Owner Gate；将其作为 P2 TODO 保留，避免为了关闭低优先级项而猜测 contract 或扩大范围。

**修复建议：当前不授权代码 patch；由 CR05 登记 bounded TODO**

建议 CR05 新增以下 TODO：

> **Story 11.5 missing-index lexical `.md` symlink candidate semantics**：由 owner 明确 undeclared candidate 的判定基准，并分别定义 subject 内 readable regular、outbound、broken、directory/FIFO symlink 的 candidate 与 stable diagnostic 行为；实现时保持 index-present no-scan、只判断不消费、structured block、safe project-relative evidence 与 zero mutation，不新增 stable issue ID，除非 owning contract 明确要求。

建议字段：`Priority=P2`、`Source=Story 11.5 CR Round 7 Finding #2`、`Status=Open`。该 TODO 不授权 CR05 自行修复或替 owner 选择 taxonomy。

**误报评估：非误报**

Lexical `.md` symlink 被 `Dirent.isFile()` 排除是确定的代码事实；只是完整 target-class policy 缺少唯一 owning contract，因此适合 defer，而非在当前 Fixer 中猜测实现。

## Overall Evaluation（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Declared shard symlink 未验证最终 target 为 regular file | P1 | **P1** | 会把 non-regular target 写入消费路径并错误 continue；现有 stable mapping 唯一，可做最小 `stat` 修复。 |

### CR TODO（建议纳入 CR TODO 跟踪，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | CR05 内容 |
|---|------|----------|-----------|-----------|
| 2 | Missing-index candidate scan 忽略 lexical `.md` symlink | P2 | **P2** | 明确四类 symlink target 的 candidate semantics 后再实现；保持 no-consume、block、safe evidence、zero mutation与index-present no-scan。 |

### False Positives（可忽略，误报）

无。

### Owner Gate（Owner 门禁）

- **本轮无新增阻塞 Owner Gate。** Finding #1 的 issue/reason/referenceKind 与 bounded patch 均由 current `SPEC 07/09` 唯一确定。
- Finding #2 的完整 taxonomy 确实缺少 owner contract，但因其为 P2、当前运行仍 fail closed，采用 CR TODO defer；不得在本轮 Fixer 中实施窄修或完整 symlink policy。

### Verification Requirements（验证要求）

Fixer 后至少执行：

1. `npx vitest run test/artifact-document-discovery.test.ts`，包含 declared shard symlink→directory/FIFO、in-bound regular 与 outbound target 回归；
2. schema、重复调用稳定性、safe relative evidence、no raw/absolute leakage、zero mutation assertions；
3. Story 11.5 scoped `git diff --check`；
4. canonical checker warn/strict 与 developer hook要求的 governance classification；
5. 不把 external `speclite-drawer-er-modeler`、`.agents/.claude` mirrors 或 fixed-count drift 归因给 Story 11.5。

本 Evaluator 未运行 build、full suite或packaging，也未授权 Fixer借 Finding #1 改动 Story、tracker、flow gates、CR closeout、TODO backlog、root progress logs、Story 11.6+、external drawer或fixed-count expectations。

### Scope Audit（范围审计）

- 本 Evaluator 仅创建当前 Round 7 evaluation 文件；未修改 source、tests、Story、tracker、SPEC、docs、其它 CR 产物或 progress logs。
- Finding #1 授权范围仅为 `resolveDeclaredShards()` 的 final-target regular-file check、直接 fixtures及必要的现有 contract wording澄清；如 current `SPEC 07/09` 已完整表达该 mapping，则无需文档改动。
- Finding #2 只授权未来 CR05 登记 TODO，不授权本轮 source/test/SPEC/docs patch。
- 未 commit、未 push、未迁移、复制、重命名或删除任何 artifact。

### Evaluation Decision（评估决定）

- **Finding #1**：确认有效，P1，授权 fresh Fixer 执行最小 bounded patch。
- **Finding #2**：确认有效，P2，defer 至 CR TODO；本轮不需要 Owner 回应，也不授权代码修复。
- **Overall**：`FAIL / FIX_REQUIRED`。Fixer 完成 Finding #1 后进入 fresh Reviewer 三层复审与 fresh Evaluator；只有 latest Reviewer 与 latest Evaluator 同时 PASS、required verification 无 Story 11.5 新增失败，才能进入 CR04、CR05 与 CR06，并由 CR05 正式登记 Finding #2 TODO。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 1

### Fix Result（修复结果）

#### Finding #1：Declared shard symlink final-target regular-file gate — 已修复

- 在 `src/config/artifact-document-discovery.ts` 的 `resolveDeclaredShards()` 中，于 lexical entry type/readability、`realpath` 与 subject containment 成功后、加入 `resolvedPaths` 前增加 dereferenced target `stat(...).isFile()` 校验。
- subject 内 symlink 最终指向 directory、FIFO 或其它 non-regular target，以及 final-target `stat` 失败，统一返回既有 `unreadable-shard`；caller 保持 `artifact-path.broken-shard-reference`、`discoveryShape=invalid-sharded`、`actualConsumedPath=null`、`consumedPaths=[]` 与 `continuation=block`。
- subject 内 symlink→readable regular file 继续合法；subject 外 symlink 仍在 prior containment gate 返回 `outside-subject-directory`，未改变既有 mapping。
- `test/artifact-document-discovery.test.ts` 新增 inline/reference-style、sharded-only、whole+sharded 无 selection、whole+sharded `selection=sharded`、directory、FIFO、in-bound regular 与 outbound containment fixtures；断言 schema、重复调用稳定、safe evidence、无 absolute/raw target 泄露和 zero mutation。

### Verification（验证）

- `npx vitest run test/artifact-document-discovery.test.ts`：PASS，`1 file / 99 tests`。
- `npx vitest run test/artifact-root-resolution.test.ts test/story-6-4-path-portability.test.ts test/resolve-readers.test.ts`：PASS，`3 files / 24 tests`。
- `npm run build`：PASS。
- `npm run docs:check`：PASS，`72 Markdown files / 5 drafts`。
- canonical checker warn：PASS，`status=ok`、`findings=[]`、`core=19`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=69`、`changedPathCount=82`。
- canonical checker strict：PASS，`status=ok`、`findings=[]`；impacted classes 仅为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，`decisionRecordRequired=false`。
- `npm run release:packaging-check`：PASS。
- `git diff --check`：PASS。

### Governance Decisions（治理决策）

| Surface | Level | Decision | Reason | Evidence |
|---|---:|---|---|---|
| canonical source truth / module discovery | D0 | verified | 本 Fixer 未修改 canonical package roots 或 module metadata；82-path canonical drift 为既有并发范围，warn/strict checker 均无 finding。 | canonical warn/strict：`status=ok`、`findings=[]`、default install `69`。 |
| current public docs | D1 | skipped | 本 patch 只落实已由 current contract 表达的 declared shard “不可读即 block”语义；没有新增用户可见 contract，禁止为本轮扩改 docs。 | `SPEC 07` broken shard taxonomy、`SPEC 09` lifecycle table与 `docs/reference/workflow-artifact-layout.md` 现有 readable-shard 文案；`docs:check` PASS。 |
| living legacy / frozen historical records | D2 | historical snapshot | 本 patch 不改变 legacy mapping；历史 `PLAN.md` / `EXPERIMENTS.md` / handoff 事实保持原样。 | scoped status/diff audit；未修改任何 canonical legacy 或历史 progress 文件。 |
| release evidence | D0 | verified | build-first、packaging-last 通过；`release/packaging-manifest.json` 的 current diff 仅反映 pre-existing external drawer inventory，不归因或纳入本 Fixer。 | `npm run build` 与 `npm run release:packaging-check` PASS；manifest diff 为 `speclite-drawer-er-modeler` entries。 |

### Scope Audit（范围审计）

- 本 Fixer 仅修改 `src/config/artifact-document-discovery.ts`、`test/artifact-document-discovery.test.ts`，并向本 Round 7 evaluation 追加当前记录。
- Finding #2 未修改：`listMarkdownFiles()` 与 missing-index lexical `.md` symlink candidate semantics 保持原样，等待 CR05 登记 P2 TODO。
- 未修改 SPEC、docs、Story、tracker、flow gates、Reviewer summary、root `PLAN.md` / `EXPERIMENTS.md` / `EXPERIMENT_NOTES.md`、CR rules/TODO、Story 11.6+、external `speclite-drawer-er-modeler`、`.agents/.claude` mirrors 或 fixed-count expectations。
- 未 commit、未 push；无新增 Owner blocker。下一步必须由 fresh Reviewer 三层复审与 fresh Evaluator 裁决。
