---
Story: 11-5
Round: 8
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-5-code-review-summary-20260904-round-8.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-5 的第 8 轮 CR 复审结果进行独立评估。Round 8 Reviewer 三层正式结果为 `3/3 PASS`，去重后没有 P0/P1 finding；本 Evaluator 对 current source、tests、Story、`SPEC 07`、`SPEC 09` 与 public guidance 交叉核验，并在当前工作树复跑 Story 11.5 focused/related tests、docs、canonical warn/strict 与 diff whitespace gate。Round 7 Finding #1 的 declared shard final-target regular-file gate 已在进入消费路径前生效，相关 directory/FIFO/in-bound regular/outbound fixtures齐全；未发现新的阻塞问题。

Round 7 Finding #2 仍真实存在：missing-index candidate scan 仅收集 `Dirent.isFile()` 的 `.md` entry，不收集 lexical `.md` symlink。该项没有被修复、忽略或证明为误报；但 current outcome 仍为 structured block、空消费与零 mutation，且 owning contract 尚未规定 undeclared candidate symlink 的完整 target matrix，因此维持 Round 7 已裁决的非阻塞 P2，必须由 CR05 登记 TODO。

本轮整体结论为 **PASS**：latest Reviewer Round 8 与 latest Evaluator Round 8 构成 double-pass，当前为 **0 P0 / 0 P1**，仅保留一个明确的 P2 TODO candidate。可以按严格顺序进入 **CR04 → CR05 → CR06**；CR05 必须完成该 P2 的正式登记，遗漏登记不构成完整 closeout。

## Previous Round Closure（上轮问题回顾确认）

### Round 7 Finding #1：PASS（已关闭）

`resolveDeclaredShards()` 先验证 lexical entry 为 file/symlink、执行 readability 与 `realpath` containment，再对 dereferenced `targetRealPath` 执行 `stat(...).isFile()`；只有该 gate 通过后才计算并加入 `resolvedPaths`（`src/config/artifact-document-discovery.ts:496-529`）。因此 symlink→directory/FIFO 等 non-regular final target 会稳定返回 `unreadable-shard`，不会进入 `declaredShardPaths` 或 `consumedPaths`。

Direct fixtures 覆盖 inline/reference-style、sharded-only、whole+sharded 无 selection、`selection=sharded`、directory、FIFO、subject 内 regular symlink 与 outbound symlink；同时断言 schema、重复调用、安全 evidence、空消费与 zero mutation（`test/artifact-document-discovery.test.ts:173-331`）。Current focused/related run为 `4 files / 123 tests` 全部通过。Round 7 P1 已被充分关闭，不再阻塞交付。

### Owner M：PASS（保持关闭）

Mismatch probes 仍是有限集合：PRD root-level whole、Epics root-level whole、Architecture Planning root-level whole，以及仅在 `solutioning_artifacts` 为 `explicit-config` 时加入 Planning Architecture subject whole/index；候选按声明顺序返回，且只在 canonical whole/index 均不存在后用于 diagnostic block（`src/config/artifact-document-discovery.ts:245-278,837-875`）。Probe eligibility 复用 canonical readable regular-file gate（`src/config/artifact-document-discovery.ts:812-835`），没有 fallback consumption、迁移或写入；existing missing Solutioning 的 Planning fallback仍由 root resolver标记 `legacy-compatible`（`src/config/artifact-root-resolver.ts:79-85`；`SPEC 09:105`）。

### Owner L：PASS（保持关闭）

Current parser继续支持 bounded inline/reference-style local Markdown links、reference label normalization、声明顺序与首次去重；destination顺序为 strip query/fragment后single decode，再执行 external/network、Windows/backslash、`.md` 与 containment/readability分类（`src/config/artifact-document-discovery.ts:540-679,757-769`）。Direct/normalized/repeated self-link只排除不消费（`src/config/artifact-document-discovery.ts:528-529`）。相关 fixtures覆盖 query/fragment、percent decode、reference forms、malformed/undefined/unsupported local-ish、external/network、Windows、escape parity、order/dedupe/self-link（`test/artifact-document-discovery.test.ts:93-170,334-493,1033-1275`）。未发现 Owner L 回归。

### Owner S：PASS（保持关闭）

Canonical whole/index entry 都在 shape/selection 分支前完成 entry safety 检查（`src/config/artifact-document-discovery.ts:102-162`）。当 whole 与 index 共存且 invocation 显式选择 `whole` 时，resolver 跳过未选 index 的内容与 shard graph，仅消费 whole并记录 `unselectedPath=index.md`（`src/config/artifact-document-discovery.ts:196-224,286-326`）。Fixtures证明 malformed/missing/undefined 的未选 graph不被解析，但 unsafe/non-regular canonical index entry仍先行block（`test/artifact-document-discovery.test.ts:537-685`），与 `SPEC 09:93,99` 及 public guidance一致。

### Owner I：PASS（保持关闭）

仅在 canonical `index.md` 不存在时执行 recursive candidate scan；root/nested non-`ENOENT` enumeration failure稳定映射为 `artifact-path.invalid-sharded-document-shape` / `reason=shard-candidate-scan-unreadable`，并只记录失败目录的 project-relative POSIX evidence（`src/config/artifact-document-discovery.ts:163-191,776-809`）。Fixtures覆盖 root/nested failure、重复调用、schema、no raw/absolute error leakage、block、空消费与 zero mutation（`test/artifact-document-discovery.test.ts:860-980`）。这符合 `SPEC 07:286-293` 与 `SPEC 09:99`；未新增 stable issue ID，也未扩展为通用 filesystem taxonomy。

### Round 1-6 P0/P1：PASS（保持关闭）

Current source与 `123/123` focused/related tests没有重开此前已关闭的 canonical/subject symlink containment、root mismatch probes、Markdown grammar、portable destination、definition precedence、selection、candidate scan scope、order/dedupe/self-link、canonical entry readability或 Owner M/L/S/I 问题。Round 8 Reviewer同样给出 `3/3 PASS` 且没有新的 P0/P1 finding；因此历史阻塞项保持关闭。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R7-#2 | Missing-index candidate scan 忽略 lexical `.md` symlink | CR TODO candidate / 非阻塞 | 确认仍存在，维持 P2；CR05 必须登记，不得写成已解决或误报。 |

## Deferred Finding Evaluation（延后发现评估）

### Review Finding（审查原文）

> **[P2 / DEFER] Missing-index candidate scan 忽略 lexical `.md` symlink**
> - 来源：Round 7 blind；Round 7/8 Aggregator 与本 Evaluator 独立确认
> - 分类：defer

### Evaluation Conclusion（评估结论）：⚠️ 有效但维持降级 — 必须纳入 CR TODO（P2 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`listMarkdownFiles()` 仅在 `entry.isFile() && entry.name.toLowerCase().endsWith(".md")` 时加入 candidate；symlink 的 `Dirent.isFile()` 为 false，因此 lexical `.md` symlink 不进入 candidate set（`src/config/artifact-document-discovery.ts:776-809`）。当 canonical whole/index 都缺失时，至少 subject 内 symlink→subject 内 readable regular `.md` 的场景会被诊断为 `subject-document-missing`，而不是可能的 `shards-without-index`。Current tests覆盖 regular root/nested candidates与 enumeration failure，但没有 undeclared symlink candidate matrix（`test/artifact-document-discovery.test.ts:902-980`）。

**严重性判断：P2 合理，不升级为阻塞项**

该差异影响 diagnostic truth 与可能的 mismatch precedence，但 missing-index branch没有读取或消费该 undeclared entry；current result仍为 `continuation=block`、top-level `actualConsumedPath=null`、`consumedPaths=[]`，resolver本身不产生 artifact write或progress mutation（`src/config/artifact-document-discovery.ts:225-278,381-411`）。`SPEC 07:289` 与 `SPEC 09:95,99` 没有唯一规定 in-bound regular、outbound、broken、directory/FIFO 等 undeclared symlink candidate应按 lexical existence还是safe-target eligibility分类。缺少该 owner contract时，不应由本轮凭“policy consistency”猜测完整语义，也没有 current evidence支持提升为P1。

**修复建议：本轮不授权 patch；CR05 登记 bounded TODO**

CR05 应登记：由 owner定义 missing-index undeclared lexical `.md` symlink candidate semantics，至少覆盖 subject 内 readable regular、outbound、broken、directory/FIFO/non-regular target；后续实现保持 index-present no-scan、只判断不消费、structured block、safe project-relative evidence与zero mutation。除非 owning contract明确要求，不新增 stable issue ID，也不扩展为通用 filesystem异常治理。

**误报评估：非误报**

Current source直接证明行为仍存在；Round 8 Reviewer也明确将其保留为 deferred P2。它不是交付 blocker，但必须保持visible并由CR05追踪。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | 结果 | Current evidence / note |
|---|---|---|
| AC1 | PASS | PRD/Epics/Architecture phase-owned roots与fresh projection由root registry、runtime projection及current contract锁定；whole-only三subject fixture通过（`artifact-root-resolver.ts:54-107`；`artifact-document-discovery.test.ts:66-91`）。 |
| AC2 | PASS | Whole producers精确使用`prd/prd.md`、`epics/epics.md`、`architecture/architecture.md`；contract test与producer references锁定（`artifact-document-discovery.test.ts:1760-1773`）。 |
| AC3 | PASS | Same-directory `index.md`/shards、无`shards/`层、共存须invocation selection；source selection分支与producer contract test一致。 |
| AC4 | PASS | Whole/sharded consumers共享resolver；declared shard必须通过lexical、containment、readability及final-target regular-file gates后才消费（`artifact-document-discovery.ts:465-532`）。 |
| AC5 | PASS（P2 caveat） | Decision table、ambiguity、invalid/broken/missing与selection均fail closed；undeclared lexical symlink candidate taxonomy作为R7-#2 P2交CR05，不改变current安全continuation。 |
| AC6 | PASS | Explicit root权威；missing Solutioning的Architecture fallback保持`legacy-compatible`，不改变fresh canonical root（`artifact-root-resolver.ts:79-85`；`artifact-document-discovery.test.ts:1547-1574,1699-1722`）。 |
| AC7 | PASS（P2 caveat） | Mismatch probes有限、只诊断、不消费、不迁移；P2仅可能改变特定missing-index场景的diagnostic precedence。 |
| AC8 | PASS | CLI公开surface调用同一resolver（`src/commands/resolve.ts:197-279`）；九个in-scope consumers被contract test要求调用resolver并在mutation前尊重`consumedPaths`/zero write（`artifact-document-discovery.test.ts:1775-1793`）。 |
| AC9 | PASS | Active fresh Architecture→Planning及root-level PRD/Epics负向扫描fixture保持通过（`artifact-document-discovery.test.ts:1795-1815`）；未发现本轮回归。 |
| AC10 | PASS（P2 caveat） | Current focused/related run为`4 files / 123 tests`通过，覆盖decision states、selection、fallback、mismatch、POSIX、stable issues、symlink final targets与zero mutation；deferred candidate-symlink taxonomy fixture不伪称已覆盖。 |
| AC11 | PASS | Current resolver subject union仅为PRD/Epics/Architecture（`artifact-document-discovery.ts:11-12,47-54`）；未发现Story 11.6+ surface被本轮修复重开。 |

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

无。Round 8 current evidence为 **0 P0 / 0 P1**。

### CR TODO Tracking（建议纳入 CR TODO 跟踪，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R7-#2 | Missing-index candidate scan 忽略 lexical `.md` symlink | P2 | **P2** | 行为仍存在且owner semantics未完整定义；CR05必须登记bounded TODO。 |

### False Positives（可忽略，误报）

无。

### Verification（验证）

- Round 8 Reviewer正式结果：Blind、Edge、Acceptance `3/3 PASS`，无降级，去重后`0 P0 / 0 P1`。
- 本 Evaluator current run：`npx vitest run test/artifact-document-discovery.test.ts test/artifact-root-resolution.test.ts test/story-6-4-path-portability.test.ts test/resolve-readers.test.ts`：PASS，`4 files / 123 tests`。
- `npm run docs:check`：PASS，`72 Markdown files / 5 drafts`。
- Canonical checker warn：PASS，`status=ok`、`findings=[]`、`changedPathCount=82`；impacted classes为`canonical-source-truth:D0`、`module-discovery-contract:D0`，`decisionRecordRequired=false`。
- Canonical checker strict：PASS，`status=ok`、`findings=[]`；同一D0分类成立。
- `git diff --check`：PASS（无输出）。
- 本 Evaluator没有运行build、full suite或packaging；Reviewer/Fixer记录中的这些结果仅作为历史证据，不冒充本轮重跑结果。

### Governance And Scope（治理与范围）

- Canonical warn/strict当前均为D0且无finding；developer hook要求的Epic最终governance/packaging收口仍由root orchestrator统一完成，本 evaluation不替代最终runner gate。
- Current canonical inventory为`core=19`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=69`。Untracked external `speclite-drawer-er-modeler`及mirror/fixed-count drift不归因于Story 11.5，也未被本 Evaluator修改或裁决。
- 本 Evaluator只创建当前Round 8 evaluation文件；未修改source、tests、Story、tracker、SPEC、docs、其它CR产物、progress logs、CR rules/TODO或Story 11.6+。
- 未commit、未push、未迁移、复制、重命名或删除任何artifact。

### Evaluation Decision（评估决定）

- **Round 7 Finding #1**：current source与fixtures证明已关闭，不再阻塞。
- **Round 7 Finding #2**：确认有效，维持P2 defer；CR05必须正式登记TODO，不得写成已解决、误报或本轮已覆盖。
- **Owner M/L/S/I 与Round 1-6 P0/P1**：current source、contracts、fixtures及Round 8三层结果未发现回归，保持关闭。
- **Overall**：`PASS`。Latest Reviewer Round 8与latest Evaluator Round 8已形成double-pass，当前为`0 P0 / 0 P1`。下一步按严格顺序执行CR04，然后CR05登记R7-#2 P2 TODO，最后CR06 finalization；CR05登记完成前不得宣称Story 11.5 closeout完整。
