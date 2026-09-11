---
Story: 11-5
Round: 5
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-5-code-review-summary-20260904-round-5.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-5 的第 5 轮 CR 复审结果进行独立逐项评估。Round 5 报告的两个反例均能由 current source 的控制流直接证明：canonical whole entry 的 `unreadable` 状态没有进入任何 block 分支；`indexPresent=true` 时仍无条件递归扫描整个 subject tree，且扫描结果在该分支不参与后续决策。两项均为本 Story shared discovery contract 的功能与门禁缺陷，确认是阻塞交付的 P1 patch。

本轮整体结论为 **FAIL / PATCH_REQUIRED**。Finding #1 唯一复用既有 `artifact-path.subject-document-missing`，以稳定 reason `canonical-whole-unreadable` 区分“canonical entry 存在但不能成为有效 whole shape”；Finding #2 仅授权把 shard-candidate scan 限制到 `!indexPresent`。两项均不需要新的 Owner 决策，也不重开已确认的 Owner 方案 S。Round 5 Reviewer 与 Evaluator 尚未同时 PASS，不得进入 CR04、CR05 或 CR06。

## Previous Round Closure（上轮问题回顾确认）

### Round 4 #1-#5 bounded Markdown fixes：PASS（原 findings 已关闭）

Current parser 已把 destination classification 统一到 exactly-once decode 后、在 destination parse 前应用 first-definition-wins、对 empty first definition 与 angle-body whitespace fail closed，并拒绝普通 raw/encoded backslash local-ish destination。Round 5 三层审查及 Aggregator 均未重开这些 findings（`11-5-code-review-summary-20260904-round-5.md` 的 “Owner S And Round 4 Closure”）。

### Round 4 #6 Owner 方案 S：PASS（核心 finding 已关闭）

Owner 已确认显式 `selection=whole` 时只校验 canonical index entry，而不读取或解析未选 index graph。Current `skipUnselectedIndexGraph` 已在 whole+index+显式 whole 时跳过 `resolveDeclaredShards()`（`src/config/artifact-document-discovery.ts:149-152`），且 SPEC 与 public docs 已同步该 precedence（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:93-101`；`docs/reference/workflow-artifact-layout.md:140-144`；`docs/reference/cli.md:224-228`）。本轮 Finding #2 针对的是进入该分支前、仅为识别 shards-without-index 而执行的无条件 subject-tree scan，不改变或重开 S 的 graph-validation 决策。

### Historical CR TODO（历史 CR TODO，非阻塞）

无。本轮两个 finding 都是 Story 11-5 的交付阻塞项，不应降级为 CR TODO。

## Finding #1 Evaluation（发现 #1 评估）

### Review Finding（审查原文）

> **[P1] Canonical whole 的 non-file/unreadable 状态未 fail closed，而被当作 absent**
> - 来源：Blind Hunter + Acceptance Auditor；Aggregator 独立确认
> - 分类：patch（stable issue mapping 待 Evaluator 裁决）

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`inspectReadableSubjectFile()` 会把 canonical entry 的 directory、其它 non-file 或读取/解析失败统一返回 `unreadable`（`src/config/artifact-document-discovery.ts:734-755`）。Caller 对 whole 只处理 `symlink-escape`，随后仅以 `state === "readable"` 计算 `wholePresent`；相同的 index `unreadable` 状态却会立即结构化 block（`src/config/artifact-document-discovery.ts:106-143`）。因此 whole entry 已存在但不合法时会被降成 absent：有安全 index 时，无 selection 或 `selection=sharded` 可以继续 sharded；`selection=whole` 则被延后误报为 selected shape missing（`src/config/artifact-document-discovery.ts:247-303`）。这直接违反 canonical whole/index entry 必须先通过 `lstat`、readability 与 realpath containment 的 owning contract（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:99`）。

**严重性判断：合理**

该缺陷允许一个已发现但不合法的 canonical whole entry绕过先行 entry validation，并改变 continuation、consumption 与 stable evidence；它影响 AC3、AC4、AC5、AC8、AC10。P1 合理，必须在进入 CR04-06 前修复。

**修复建议：可行，stable mapping 唯一且无需 Owner 决策**

在 whole/index shape 计算、index graph 解析或 candidate scan 前处理 `wholeState.state === "unreadable"`，确定性返回结构化 block。不得新增 issue ID；在 Story 11-5 已批准的四个 discovery stable IDs 中，唯一可复用的是 `artifact-path.subject-document-missing`：invalid whole entry不能构成有效 whole shape，而 `broken-shard-reference` 专用于 index/shard graph，`invalid-sharded-document-shape` 专用于 shards-without-index，`ambiguous-subject-document-shape` 专用于两个有效 shape 的未选择共存（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:286-293`）。

授权的稳定映射与 safe details 如下：

- `issueId`: `artifact-path.subject-document-missing`
- `reason`: `canonical-whole-unreadable`
- `affectedPath`: project-relative POSIX `canonicalWholePath`
- top-level `actualConsumedPath`: `null`
- top-level `consumedPaths`: `[]`
- `continuation`: `block`
- issue `details`: `resolvedRoot`、`resolutionMode`、`actualConsumedPath: canonicalWholePath`、`discoveryShape: "subject-missing"`、`ambiguityStatus: "not-ambiguous"`、`selectionSource`、`entryKind: "canonical-whole"`、`entryState: "unreadable"`

上述 details 只包含稳定枚举与 project-relative POSIX paths；不得包含 raw filesystem error、errno message、stack、absolute path、home path、temporary path、真实 symlink target、timestamp 或随机值。`canonical-whole-unreadable` 同时覆盖 directory/other non-file 与权限或 I/O unreadable，不按宿主错误文本分裂 reason。允许对 `SPEC 07` / `SPEC 09` 做最小澄清以固定该既有 ID 映射，但不得新增 taxonomy 或 discovery shape。

**误报评估：非误报**

现有 tests 覆盖 canonical index non-file 与 canonical entry symlink escape，却没有覆盖 canonical whole non-file/unreadable 的三种 selection 分支（`test/artifact-document-discovery.test.ts:402-446`）。现有绿测不能推翻该 current-runtime path。

## Finding #2 Evaluation（发现 #2 评估）

### Review Finding（审查原文）

> **[P1] `index.md` 已存在时仍无条件递归扫描整个 subject tree，可因未选/无关目录抛出非结构化异常**
> - 来源：Blind Hunter + Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

在 `indexPresent` 已确定后，resolver仍无条件调用 `listMarkdownFiles()` 并递归整个 subject tree（`src/config/artifact-document-discovery.ts:142-147,717-731`）。`shardCandidates` 只在 `!indexPresent && shardCandidates.length > 0` 的 shards-without-index 判定中使用（`src/config/artifact-document-discovery.ts:178-196`）；当 `indexPresent=true` 时该扫描没有决策用途。递归 `readdir` 对 missing 以外的错误原样 throw（`src/config/artifact-document-discovery.ts:719-724`），所以一个未被 index 声明、与所选 document graph 无关的 inaccessible directory可使 invocation抛出 raw `EACCES`。

**严重性判断：合理**

无关 subtree 可以阻断 whole、sharded 或无 selection invocation，并绕开 resolver 的 stable issue、safe evidence、top-level block result 与 zero-mutation contract。它也使显式 whole selection在已正确跳过未选 index graph后仍访问未选且无关的 subject content。该缺陷影响 AC3、AC4、AC5、AC8、AC10，P1 合理。

**修复建议：可行且边界唯一**

仅在 `!indexPresent`、确实需要区分“完全缺失”与 `shards-without-index` 时调用 `listMarkdownFiles()` 并计算 `shardCandidates`。`indexPresent=true` 时完全跳过 candidate scan；无 selection或 `selection=sharded` 只由 `resolveDeclaredShards()` 访问 index明确声明的 targets，显式 `selection=whole` 则继续按 Owner S 跳过未选 graph。不得把该修复扩大为 catch/映射所有 `readdir` 异常、扫描或校验未声明 Markdown、改变 missing-index shape contract，或建立泛化 filesystem exception taxonomy。

**误报评估：非误报**

`listMarkdownFiles()` 的唯一 consumer和后续条件足以证明扫描在 `indexPresent=true` 时是无用访问；Reviewer 的 mode-000 reproduction与 current control flow一致。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | Finding | 原始严重性 | 评估后优先级 | 分类 | 说明 |
|---|---------|-----------|---------------|------|------|
| 1 | Canonical whole non-file/unreadable 被当作 absent | P1 | **P1** | patch | 先行 fail-close，复用 `artifact-path.subject-document-missing` + `canonical-whole-unreadable`。 |
| 2 | Index present 时仍递归扫描无关 subject subtree | P1 | **P1** | patch | Candidate scan 仅在 `!indexPresent` 时执行。 |

### CR TODO（非阻塞）

无。

### False Positives（可忽略/误报）

无。

### Evaluation Decision（评估决定）

- **Finding #1**：确认有效，P1 patch；复用既有 `artifact-path.subject-document-missing`，稳定 reason 为 `canonical-whole-unreadable`，无需新增 taxonomy 或 Owner gate。
- **Finding #2**：确认有效，P1 patch；把 recursive candidate scan 最小移动到 `!indexPresent` 分支，不授权泛化 filesystem error 治理。

## Owner Decision Gate（Owner 决策门禁）

**Owner decision: not required**。

Owner 方案 S 的核心已经关闭且保持不变：显式 whole selection仍先校验 canonical whole/index entries，只跳过未选 index内容与 graph。Finding #1 是既有“canonical entries先校验”条款缺少 whole caller分支；Finding #2 是 shards-without-index candidate scan 的执行条件过宽。两项都有唯一 bounded patch，不涉及新的 precedence、taxonomy或外部行为选择。

## Fix Authorization（修复授权）

Fresh Fixer仅获授权修复本轮两个 findings，并把 fix record追加到本 evaluation：

1. **Canonical whole entry fail-close**：在任何 shape/graph/candidate处理前，对 `wholeState.state === "unreadable"` 返回 `artifact-path.subject-document-missing`，使用 `reason: "canonical-whole-unreadable"` 与上文限定的 safe details。允许最小同步 `SPEC 07` / `SPEC 09` 和直接 public guidance，使既有 stable ID映射明确；不得新增/重命名 issue ID或 discovery shape。
2. **Candidate scan gating**：仅在 `!indexPresent` 时调用 `listMarkdownFiles()` 并判断 shards-without-index；`indexPresent=true` 时不得遍历未声明 subtree。不得修改 `resolveDeclaredShards()` 的 Owner S分支语义，也不得 catch并重分类一般 filesystem异常。
3. **Focused fixtures**：补齐下述 required verification；只修改 shared resolver、直接 focused tests及必要的最小 contract/doc parity。

不得修改 Story、tracker、flow gates、review summaries、CR rules/TODO、CR04-06、Owner M finite probes、Architecture explicit/fallback、mismatch semantics、consumers、external drawer、IDE mirrors、fixed-count baseline或 Story 11.6+。

## Required Verification（必需验证）

所有 block fixtures均须断言 top-level `actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`、唯一 stable issue/safe details，并比较 before/after snapshot证明零 artifact write与零 progress mutation。

- **Finding #1 / canonical whole directory/non-file**：whole entry为 directory或其它 deterministic non-file；分别覆盖 no selection、`selection=whole`、`selection=sharded`，即使存在安全有效 index/shard也必须在读取 index graph前以 `artifact-path.subject-document-missing` / `canonical-whole-unreadable` block。
- **Finding #1 / unreadable**：用可移植的 mock/injected fs failure或平台受控 fixture覆盖 canonical whole readability failure；不得依赖 root用户可绕过的 mode-bit假设。断言不泄露 raw error/absolute/temp path，且不访问 index graph或 mismatch probes。
- **Finding #1 / regression**：missing whole + valid index仍为正常 `sharded-only`；whole symlink escape仍唯一映射 `artifact-path.symlink-escape`；canonical index non-file/unreadable仍保持既有 `artifact-path.broken-shard-reference`语义；whole-only与whole+sharded正常选择不回归。
- **Finding #2 / index present**：构造 safe whole/index/shard加未声明 inaccessible subtree，分别覆盖 no selection、`selection=whole`、`selection=sharded`；证明无关 subtree未被访问。若测试环境不能可靠制造权限错误，应以 scoped `readdir` mock断言目标 subtree调用次数为零。
- **Finding #2 / missing index regression**：缺 index但存在 root-level与nested Markdown shard candidates时仍确定性返回 `artifact-path.invalid-sharded-document-shape` / `shards-without-index`；完全无 whole/index/shard时仍执行既有 bounded mismatch probes，未命中则 `subject-document-missing`。
- **Schema / CLI / zero mutation**：新增 result可通过 `ResolveArtifactDocumentsOutputSchema`，CLI machine stdout/stderr/exit code保持结构化且无 raw error；重复执行结果稳定，before/after snapshot一致。

Fixer至少运行 focused artifact-document-discovery与直接 resolver/CLI/schema回归、docs check、scoped `git diff --check`。可运行必要 build以生成直接测试依赖，但不得把 external drawer/fixed-count drift当作本 Story finding或据此改动基线。

## Scope Exclusions（范围排除）

- 不新增 dependency、issue taxonomy、discovery shape或泛化 filesystem exception model。
- 不改变 Owner S：显式 whole时仍校验 canonical index entry但不读取/解析未选 graph。
- 不把 candidate scan改造成 index-present integrity scan，不扫描/消费/校验未声明 Markdown。
- 不改变 missing-index + shard-candidate detection；只收窄其扫描触发条件。
- 不进行 migration、copy、rename、delete、config rewrite、fallback consumption、external fetch或 progress mutation。
- 不修改 `speclite-drawer-er-modeler`、`.agents/.claude` mirrors、fixed-count baseline或 Story 11.6+。
- 本 Evaluator未运行 build、full suite、packaging或任何写型生成命令；external drawer与82-path canonical drift均不参与本轮 finding裁决。

## Next Gate（下一门禁）

1. Fresh Fixer按上述唯一授权修复 Finding #1/#2并把修复记录追加到本 evaluation。
2. 完成 focused verification与严格 scope audit后，进入 fresh Reviewer Round 6三层审查与 fresh Evaluator Round 6。
3. 只有 latest Reviewer与latest Evaluator同时 PASS，且 required verification无 Story 11-5新增失败，才可进入 CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2

#### Fix #1：Canonical whole entry fail-close

- **状态**：✅ 已完成
- **修改位置**：`src/config/artifact-document-discovery.ts`
- **修复内容**：在 canonical index inspection、shape/selection、index graph、candidate scan 与 mismatch probes 之前处理 `wholeState.state === "unreadable"`。结果唯一映射为 `artifact-path.subject-document-missing` / `reason=canonical-whole-unreadable`，top-level `actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`；issue details 仅使用 project-relative POSIX canonical whole path与稳定枚举，不泄露 raw filesystem error、absolute/temp path、errno、stack 或 symlink target。
- **Contract parity**：最小澄清 `SPEC 07` 的既有 stable ID映射及 `SPEC 09` 的 canonical entry validation precedence；未新增/重命名 issue ID、discovery shape或 filesystem exception taxonomy。
- **Direct fixtures**：canonical whole directory分别覆盖 no selection、`selection=whole`、`selection=sharded`；注入式 `access(EACCES)` 覆盖 portable readability failure并证明 index graph与 mismatch probes均未访问；CLI fixture验证 machine stdout/stderr、schema、safe evidence、exit code与零写入；重复执行结果稳定。

#### Fix #2：Candidate scan仅在 missing index时执行

- **状态**：✅ 已完成
- **修改位置**：`src/config/artifact-document-discovery.ts`
- **修复内容**：`indexPresent=true` 时不再调用 recursive `listMarkdownFiles()`；只有 `!indexPresent` 时才枚举 shard candidates并保持既有 `shards-without-index`判定。未改变 `resolveDeclaredShards()`、Owner方案 S、未选 index graph语义或一般 filesystem error处理。
- **Direct fixtures**：通过注入式 `readdir(EACCES)` trap证明 no selection、`selection=whole`、`selection=sharded` 均不扫描 index未声明 subtree；missing index时 root-level与nested Markdown仍确定性映射 `artifact-path.invalid-sharded-document-shape` / `shards-without-index`；重复执行结果稳定且 before/after snapshot一致。

#### Verification（验证结果）

- `npx vitest run test/artifact-document-discovery.test.ts`：PASS，`1 file / 76 tests`。
- `npx vitest run test/artifact-document-discovery.test.ts test/resolve-readers.test.ts test/story-6-4-path-portability.test.ts test/artifact-path-validation.test.ts`：首次 `98 passed / 1 failed`，唯一失败为 build prerequisite明确报告 `dist`早于本轮 source；执行 build后重跑 PASS，`4 files / 99 tests`。
- `npm run build`：PASS；最终 focused test调整后再次 build PASS。
- `npm run docs:check`：PASS，`72 Markdown files / 5 drafts`，links与governance rules有效。
- `npm run release:packaging-check`：PASS，`release/packaging-manifest.json`与`dist/packaging-manifest.json`验收通过。
- canonical source checker normal与strict：均 `status=ok`、`findings=[]`；current `core=19`、`sdlc=50`、`defaultInstall=69`。82-path concurrent canonical drift仅命中 `canonical-source-truth:D0`与`module-discovery-contract:D0`，`decisionRecordRequired=false`，无需 D1/D2 decision record。
- `npm test`：Story 11.5相关测试无新增失败；全量 `64 files / 569 passed / 4 todo / 12 failed`。12项失败全部是 external `speclite-drawer-er-modeler` concurrent drift引起的固定计数预期 `core=18,total=68` 与current `core=19,total=69`差异，分布于 `source-and-modules`、`runtime-structure`、`fixture-release-gates`、`install-module-selection`、`cli-smoke`；未据此修改 drawer、mirrors、fixtures或fixed-count baseline。
- scoped whitespace audit：tracked `SPEC 07/09` 的 `git diff --check`无输出；untracked shared source/test分别以 `git diff --no-index --check /dev/null <file>`检查，无 whitespace finding（exit 1仅表示相对 `/dev/null`存在新增内容）。

#### Scope Audit（范围审计）

- 本轮仅修改：`src/config/artifact-document-discovery.ts`、`test/artifact-document-discovery.test.ts`、`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`、`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`，并向本 evaluation追加该记录。
- 未修改 Story、tracker、flow gates、review summary、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`、CR closeout/rules/TODO、Owner M finite probes、Architecture explicit/fallback、consumer workflow、drawer、IDE mirrors、fixed counts或 Story 11.6+。
- 未执行 commit/push；未发现新的 Owner blocker。下一步仍为 fresh Reviewer Round 6三层审查与 fresh Evaluator Round 6。
