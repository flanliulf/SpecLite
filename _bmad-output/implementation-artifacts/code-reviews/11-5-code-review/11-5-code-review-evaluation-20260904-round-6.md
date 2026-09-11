---
Story: 11-5
Round: 6
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-5-code-review-summary-20260904-round-6.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-5 的第 6 轮 CR 复审结果进行独立逐项评估。Round 6 报告的两个反例均能由 current source 的控制流直接证明：shared readability helper 只验证 lexical entry 是 file/symlink，却未验证 dereferenced symlink target 仍是 regular file；missing-index 的必要 candidate scan 则只把 `ENOENT` 转为空集合，任何 root/nested `readdir` failure 都会逃逸 structured result。

两项均是阻塞交付的 **P1**。Finding #1 已有唯一 stable mapping，可直接授权 bounded patch。Finding #2 的故障状态是“candidate set 无法判定”：现有 `artifact-path.invalid-sharded-document-shape` 要求已知存在 shard candidates，`artifact-path.subject-document-missing` 要求已能确定不存在有效 sharded input，另外两个 discovery IDs 也不适用，因此 owning contract 无法唯一推出 stable ID/reason；本 Evaluator 不得猜测或新增 ID，必须进入最小 Owner Gate。

本轮整体结论为 **FAIL / OWNER_DECISION_REQUIRED**。Finding #1 可授权修复，但 Finding #2 在 Owner 决策前不得修复、不得进入 CR04、CR05 或 CR06。

## Previous Round Closure（上轮问题回顾确认）

### Round 5 Finding #1 canonical whole direct non-file/unreadable：PASS（原 finding 保持关闭）

Caller 已在 shape、selection、index graph 与 mismatch probe 前处理 direct canonical whole `unreadable`，并使用 `artifact-path.subject-document-missing` / `canonical-whole-unreadable` block（`src/config/artifact-document-discovery.ts:106-134`）。Round 6 Finding #1 是 shared helper 对 symlink 最终 target 类型验证不完整的新边界，不回退 Round 5 caller precedence 修复。

### Round 5 Finding #2 index-present 不扫描未声明 subtree：PASS（原 finding 保持关闭）

Candidate scan 现已只在 `!indexPresent` 时调用（`src/config/artifact-document-discovery.ts:163-169`）。Round 6 Finding #2 只处理 missing-index decision 必需 scan 本身无法完成的情形，不授权恢复 index-present scan，也不授权泛化 filesystem exception taxonomy。

### Owner 方案 S：PASS（核心决策保持关闭）

显式 `selection=whole` 时仍只豁免未选 index 内容与 graph 的读取，不豁免 canonical index entry safety。Round 6 Finding #1 要求 canonical index symlink 的最终 target 必须是 regular file，正是 `SPEC 09` 对 entry safety 的既有要求（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:93-101`），不重开方案 S。

### Owner M 与 Owner L：PARTIAL / PASS

- Owner M 的有限 probe 集合、声明顺序与只诊断不消费语义保持不变；但 probe 共用的 helper 会把 symlink→non-regular target 误判为 readable，故由 Finding #1 bounded patch 闭合。
- Owner L 的 inline/reference、query/fragment、single decode、portable classification、declaration order、dedupe 与 self-link contract 未被本轮 findings 重开。

### Historical CR TODO（历史 CR TODO，非阻塞）

无。两项均影响 current Story 的 structured discovery contract，不应降级为 CR TODO。

## Finding #1 Evaluation（发现 #1 评估）

### Review Finding（审查原文）

> **[P1 / PATCH] Symlink canonical entry 与 mismatch candidate 未校验最终 target 是 regular file**
> - 来源：Blind Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`inspectReadableSubjectFile()` 对 lexical entry 执行 `lstat` 后，允许 regular file 或 symlink 继续；其后只执行 `access`、`realpath` 与 subject containment，便直接返回 `readable`，没有对 dereferenced target 执行 `stat(...).isFile()` 或等价检查（`src/config/artifact-document-discovery.ts:756-777`）。因此，指向 subject 内 directory、FIFO 或其它 non-regular target 的 symlink 会被视为 readable。

该 helper 同时服务 canonical whole、canonical index 与 Owner M mismatch probes（`src/config/artifact-document-discovery.ts:106-164,780-801`），所以反例会分别导致：whole 被错误消费并 continue；index 在 `selection=whole` 时绕过 graph 后错误 continue，需读 graph 时可能产生 raw I/O error；legacy directory 被错误报告为 `config-artifact-mismatch` candidate。

**严重性判断：合理**

该缺陷改变 shape、continuation、consumption 与 diagnostic truth，并破坏 `SPEC 09` 的 canonical entry safety precedence及 Owner M “probe 只接受真实 artifact”的边界。它影响 AC3、AC4、AC5、AC7、AC8、AC10，属于阻塞交付的 P1。

**修复建议：可行，stable mapping 唯一且无需 Owner 决策**

在 shared helper 内保留 lexical `lstat` 与 subject containment，并在返回 `readable` 前验证 dereferenced final target 为 readable regular file。不得禁止所有 symlink：subject 内 symlink→regular file 继续合法，subject 外 target 继续使用 `artifact-path.symlink-escape`。

授权的 deterministic mapping如下：

- canonical whole final target 非 regular/unreadable：复用 `artifact-path.subject-document-missing` / `reason=canonical-whole-unreadable`，`discoveryShape=subject-missing`；
- canonical index final target 非 regular/unreadable：复用 `artifact-path.broken-shard-reference` / `reason=unreadable-shard` / `referenceKind=unreadable-shard`，`discoveryShape=invalid-sharded`；
- Owner M mismatch probe final target 非 regular/unreadable：视为 probe 未命中，不产生 `config-artifact-mismatch`，不消费、不 fallback、不迁移。

所有 block result 的 top-level `actualConsumedPath` 必须为 `null`、`consumedPaths=[]`、`continuation=block`。Issue details 只能包含 current contract 已允许的 project-relative POSIX evidence 与稳定枚举；不得包含 dereferenced absolute target、raw error、errno message、stack、home/temp path、timestamp或随机值。

修复仅限 shared helper 与直接 fixtures：canonical whole symlink→directory/FIFO覆盖 no selection、`whole`、`sharded`；canonical index symlink→directory至少覆盖 `selection=whole`及需读 graph 的 invocation；PRD/Epics/Architecture bounded probes覆盖 symlink→non-regular不命中且symlink→regular仍按声明顺序命中。不得扩展为通用 symlink 政策或一般 filesystem error framework。

**误报评估：非误报**

Current helper 缺少 final-target regular-file check 是直接可见的代码事实；现有 focused tests 未覆盖该反例，绿测不能推翻它。

## Finding #2 Evaluation（发现 #2 评估）

### Review Finding（审查原文）

> **[P1 / DECISION_NEEDED] Missing-index 必要 candidate scan 的 nested `readdir` failure 逃逸 structured result**
> - 来源：Edge Case Hunter；Aggregator 独立确认
> - 分类：decision_needed

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要 Owner 决策（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

当 canonical index 不存在时，resolver 必须调用 `listMarkdownFiles()` 才能区分 `shards-without-index` 与 subject missing（`src/config/artifact-document-discovery.ts:163-169,200-220`）。该递归函数仅将 `ENOENT` 映射为空集合；root 或 nested `readdir` 的其它 failure均原样 `throw`（`src/config/artifact-document-discovery.ts:739-753`）。因此 `EACCES` 等反例不会返回 `ArtifactDocumentDiscoveryResult`、stable issue、`continuation=block`与safe evidence，违反 AC5/AC8/AC10及 `SPEC 09` 每次 discovery 均结构化记录的要求（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:95-105`）。

**严重性判断：合理**

这里的 scan 不是可省略的 index-present integrity scan，而是 missing-index decision table 的必要步骤。Raw rejected Promise绕过stable issue、CLI schema与zero-mutation可验证结果，故为Story 11.5 P1；但范围只包含这一次必要 enumeration，不包含其它 filesystem API或任意异常。

**修复建议：技术上可行，但 stable mapping 在 Owner 决策前不可授权**

现有四个 discovery stable IDs 均不能在不改变定义的情况下唯一表示该 unknown state：

- `artifact-path.invalid-sharded-document-shape` 当前精确定义为“已知存在 shard candidates但缺 index”（`SPEC 07:289`）；scan失败时 candidates是否存在未知。
- `artifact-path.subject-document-missing` 当前要求 whole与有效sharded input均不存在（`SPEC 07:291`）；scan失败时无法证明后者不存在。
- `artifact-path.broken-shard-reference` 要求已存在 index及其声明 reference，当前场景没有index（`SPEC 07:290`）。
- `artifact-path.ambiguous-subject-document-shape` 要求两个有效shape共存，显然不适用（`SPEC 07:288`）。

现有 stable reasons `shards-without-index` 与 `subject-document-missing` 同样分别断言 known-invalid 或 known-missing，不能诚实表达 indeterminate candidate scan。Evaluator无权把 unknown伪装成任一known state，也无权新增或猜测 issue ID/reason。

**误报评估：非误报**

Current recursion 的非-`ENOENT` raw throw路径明确存在，且当前 test IO seam 已能直接构造 root/nested failure；这不是假设性问题。

## Owner Gate（Owner 决策门禁）

Owner 只需裁决 missing-index candidate scan unreadable/indeterminate 的 stable mapping，不需要重开 discovery precedence、Owner S/M/L或引入新 ID。

### Option I（选项 I，推荐）：扩展既有 invalid-sharded ID

- `issueId`: `artifact-path.invalid-sharded-document-shape`
- 建议由 Owner 明确批准的 `reason`: `shard-candidate-scan-unreadable`
- `discoveryShape`: `invalid-sharded`
- `affectedPath`: candidate scan 实际失败的 root/nested directory之 project-relative POSIX path
- details：`resolvedRoot`、`resolutionMode`、`actualConsumedPath`（同一 safe failing directory evidence）、`discoveryShape`、`ambiguityStatus=not-ambiguous`、`selectionSource`、`entryKind=shard-candidate-scan`、`entryState=unreadable`

推荐理由：resolver正在判定 sharded shape，但必要 enumeration 无法完成；将其归为“sharded shape 无法验证”比断言 subject missing 更接近事实。该选择需要 Owner 对 `SPEC 07` 现有 ID定义做最小扩展，不新增 stable ID。

### Option II（选项 II）：扩展既有 subject-missing ID

- `issueId`: `artifact-path.subject-document-missing`
- 建议由 Owner 明确批准的 `reason`: `shard-candidate-scan-unreadable`
- `discoveryShape`: `subject-missing`
- safe affectedPath/details与Option I相同，仅按该ID固定shape语义

该选项把“无法证明存在有效sharded input”归入 missing，但语义弱于Option I，因为实际absence尚未得到证明。

两种选项都必须保持 top-level `actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`，不得泄露raw error、errno message、absolute/home/temp path或stack。若Owner不批准上述reason名称，应明确给出替代稳定reason；Fixer不得自行命名。

最小确认语句：`确认 11.5 candidate-scan 方案 I` 或 `确认 11.5 candidate-scan 方案 II`。

## Fix Authorization（修复授权）

### Finding #1：已授权 bounded patch

Fixer可按本 evaluation 的唯一 mapping修复shared final-target regular-file validation并增加直接fixtures。由于Finding #2仍有Owner Gate，建议等待Owner确认后由同一个fresh Fixer一次完成两项，减少交叉修改与重复复审；这不改变Finding #1已经获得技术授权的事实。

### Finding #2：未授权，等待Owner

在Owner确认Option I/II或明确其它既有ID+stable reason前，Fixer不得捕获后随意映射、不得新增ID、不得把failure吞为空集合、不得继续执行mismatch probes，也不得泄露raw error。Owner确认后，Fixer仅可把missing-index必要candidate enumeration的root/nested non-`ENOENT` failure转为所选structured block，并保留正常candidate与完全无candidate路径。

## Required Verification（必要验证）

- **Finding #1 direct fixtures**：whole symlink→directory/FIFO覆盖no selection、`whole`、`sharded`；index symlink→directory覆盖`selection=whole`与graph-reading invocation；PRD/Epics/Architecture probes覆盖non-regular不命中、regular命中与声明顺序。
- **Finding #2 direct fixtures（Owner确认后）**：通过current injected `readdir` seam覆盖root及nested `EACCES`、重复调用稳定性、schema与before/after zero mutation；断言safe project-relative affected path且无raw/absolute泄露。
- **Regression**：normal root/nested candidates仍映射`invalid-sharded-document-shape` / `shards-without-index`；完全无candidate仍先执行bounded M probes，未命中再映射subject missing；index-present subtree仍不得扫描。
- **Focused gates**：artifact-document-discovery、direct resolver/CLI/schema、docs check、canonical source checker与scoped `git diff --check`。必要build只用于直接测试依赖；不得把external drawer/fixed-count drift当作Story 11.5 finding。

## Scope Exclusions（范围排除）

- 不新增dependency、stable issue ID、discovery precedence或通用filesystem exception taxonomy。
- 不捕获/映射所有filesystem异常；Finding #2只限missing-index必要candidate enumeration的root/nested `readdir` failure。
- 不改变Owner S：显式whole仍校验canonical index entry但不读/解析未选graph。
- 不改变Owner M probe集合、顺序、diagnostic-only语义或Architecture explicit/fallback边界。
- 不改变Owner L Markdown grammar、single-decode、order/dedupe/self-link contract。
- 不扫描index-present未声明subtree，不消费candidate，不进行migration/copy/rename/delete/config rewrite/progress mutation。
- 不修改external `speclite-drawer-er-modeler`、`.agents/.claude` mirrors、fixed-count baseline或Story 11.6+。
- 本Evaluator未运行build、full suite、packaging或任何写型生成命令；除本evaluation外未修改source、tests、Story、tracker、SPEC/docs、progress logs或其它CR文件。

## Evaluation Decision（评估决定）

- **Finding #1（symlink final target non-regular）**：确认P1，已有唯一stable mapping，授权bounded patch。
- **Finding #2（missing-index candidate scan unreadable）**：确认P1；现有contract无法唯一映射，进入最小Owner Gate，推荐Option I。
- **Overall**：`FAIL / OWNER_DECISION_REQUIRED`。在Owner确认Finding #2 mapping、Fixer完成两项修复并经fresh Reviewer/Evaluator同时PASS前，不得进入CR04、CR05或CR06。

## Next Gate（下一门禁）

1. Owner确认`确认 11.5 candidate-scan 方案 I`（推荐）或方案II。
2. 同一个fresh Fixer执行Finding #1及Owner已选择的Finding #2 bounded patch，并把fix record追加到本evaluation。
3. 进入fresh Reviewer三层复审与fresh Evaluator；仅latest Reviewer/Evaluator同时PASS且Story 11.5 required verification无新增失败后，方可进入CR04、CR05与CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2
- **Owner Decision**: 已确认 `11.5 candidate-scan 方案 I`

### Fix Result #1（修复结果 #1）：canonical entry 与 mismatch probe 的最终 target 类型

- **Status**: ✅ 已修复
- **Files**: `src/config/artifact-document-discovery.ts`、`test/artifact-document-discovery.test.ts`、`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`、`docs/reference/workflow-artifact-layout.md`
- **Change**: `inspectReadableSubjectFile()` 保留 lexical `lstat`、`realpath` subject containment 与 readability，并在返回 `readable` 前使用 dereferenced `stat(...).isFile()` 验证最终 target 是 regular file。站内 symlink→regular file 继续合法；站外 target 仍按 `symlink-escape`；站内 symlink→directory/FIFO 映射为 `unreadable`。
- **Deterministic mapping**: canonical whole 继续映射 `artifact-path.subject-document-missing` / `canonical-whole-unreadable`；canonical index 继续映射 `artifact-path.broken-shard-reference` / `unreadable-shard`；Owner M probe 的 non-regular target 视为未命中，不产生 `config-artifact-mismatch`。
- **Direct evidence**: 新增 whole symlink→directory 与 symlink→FIFO 的 no selection / `whole` / `sharded` 覆盖；新增 index symlink→directory 的三种 selection 覆盖；新增 PRD、Epics、Architecture probe 的 non-regular 不命中与 in-bound regular symlink 命中覆盖。所有 block result 均断言 top-level `actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block` 与 safe evidence。

### Fix Result #2（修复结果 #2）：Owner 方案 I 的 missing-index candidate scan failure

- **Status**: ✅ 已修复
- **Files**: `src/config/artifact-document-discovery.ts`、`test/artifact-document-discovery.test.ts`、`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`、`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`、`docs/reference/workflow-artifact-layout.md`
- **Change**: 仅将 missing-index 必要 `listMarkdownFiles()` enumeration 改为 bounded result；root 或 nested `readdir` 的 non-`ENOENT` failure 返回 `artifact-path.invalid-sharded-document-shape` / `reason=shard-candidate-scan-unreadable` / `discoveryShape=invalid-sharded`，并使用 `entryKind=shard-candidate-scan`、`entryState=unreadable`。
- **Safe evidence**: `affectedPath` 与 issue details `actualConsumedPath` 只记录实际失败目录的 project-relative POSIX path；top-level `actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`。不输出 raw error、errno message、absolute/home/temp path或stack。
- **Boundary**: 未新增 stable issue ID、dependency、discovery precedence或通用 filesystem exception taxonomy；未改变 `ENOENT` 空集合语义，未扫描 index-present subtree，scan failure 后不继续 Owner M probes。
- **Direct evidence**: current injected `readdir` seam 新增 root/nested `EACCES`、重复调用稳定性、schema、safe evidence、no raw leakage 与 zero-mutation assertions；既有 normal root/nested candidates、完全无 candidate→Owner M probes→subject missing、index-present no scan 均继续通过。

### Verification（验证）

- `npx vitest run test/artifact-document-discovery.test.ts`：PASS，`1 file / 93 tests`。
- `npx vitest run test/artifact-root-resolution.test.ts test/story-6-4-path-portability.test.ts test/resolve-readers.test.ts`：PASS，`3 files / 24 tests`。
- `npm run build`：PASS，ESM 与 DTS build 成功。
- `npm run docs:check`：PASS，`72 Markdown files / 5 drafts`。
- canonical checker warn：PASS，`status=ok`、`findings=[]`、`core=19`、`sdlc=50`、`defaultInstall.total=69`、`changedPathCount=82`。
- canonical checker strict：PASS，`status=ok`、`findings=[]`；impacted classes 为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，`decisionRecordRequired=false`。
- changed canonical package density lint：PASS，17 个 changed package 均无 triggered density warning。
- `npm run release:packaging-check`：PASS。
- scoped `git diff --check`：PASS。
- `npm test`：Story 11.5 相关回归通过；全量结果为 `64 files` 中 `59 passed / 5 failed`，`602 tests` 中 `586 passed / 12 failed / 4 todo`。12 项失败全部是 external `speclite-drawer-er-modeler` 使 current inventory 从 `core=18,total=68` 变为 `core=19,total=69` 后的旧 fixed-count expectations；没有 Story 11.5 discovery failure，且按本轮范围未修改 drawer 或 fixed-count baseline。

### Canonical Governance Decisions（Canonical 治理决策）

| Surface | Level | Decision | Reason / Evidence |
| --- | --- | --- | --- |
| canonical source truth / module discovery | D0 | verified | warn 与 strict checker 均 `status=ok`、`findings=[]`；packaging check 与 17 个 changed package density lint 通过。External drawer inventory drift 保持隔离。 |
| current public docs | D1 | updated | `docs/reference/workflow-artifact-layout.md` 已同步 final-target regular-file 与方案 I structured block 行为；`npm run docs:check` 通过。 |
| living legacy reference | D2 | skipped | 本轮仅闭合 current whole/sharded discovery safety 与 structured failure，不改变 legacy migration/mapping policy；未改写 legacy reference。 |
| frozen historical record | D2 | historical snapshot | 既有 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 与旧 round 产物保留当时事实，本 Fixer 未改写。 |
| release evidence | D0 | verified | build 与 `release:packaging-check` 通过；本 Fixer未手工改写 packaging manifest。 |

### Scope Audit（范围审计）

- 本 Fixer 仅修改 shared discovery source、direct test、方案 I 所需最小 `SPEC 07/09`、一处 public guidance，以及本 evaluation 的修复记录。
- 未修改 Story、tracker、flow gates、review summary、CR closeout、CR rules、TODO、root progress logs、Story 11.6+、`.agents/.claude` mirrors、external drawer 或 fixed-count expectations。
- 未 commit、未 push、未执行 artifact migration/copy/rename/delete/config rewrite/progress mutation。
- **New Owner Blocker**: 无。下一门禁是 fresh Reviewer 三层 Round 7 与 fresh Evaluator。
