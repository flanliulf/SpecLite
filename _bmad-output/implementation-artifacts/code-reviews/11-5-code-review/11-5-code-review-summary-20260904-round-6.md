---
Story: 11-5
Round: 6
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Round 6 三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级）。Blind 与 Edge 各报告 1 个 P1 candidate，Acceptance 报告 PASS / 0 findings。Aggregator 独立检查 current source、tests、`SPEC 07`、`SPEC 09` 与 Round 5 summary/evaluation/fix record，并在已清理的临时项目中复现两项候选。

最终确认 **2 个去重后的 P1 blocking findings**。Finding #1 是 canonical whole/index 与 Owner M mismatch probe 共用 readability helper 对 symlink 最终 target 类型校验不完整；既有 stable mapping 足以支持 bounded patch，无需 Owner 决策。Finding #2 是 canonical index 缺失时，为判定 `shards-without-index` 而必需的有限递归扫描在 nested `readdir` 失败时抛出 raw error；它属于 Story 11.5 的 structured result / stable issue / zero-mutation 范围，并非 Round 5 排除的泛化 filesystem 异常治理，但现有 `SPEC 07` 四个 discovery IDs 均没有准确覆盖“candidate set 无法判定”，因此必须由 fresh Evaluator 裁决 stable mapping，并在必要时进入窄化 Owner gate。

本轮总体结论为 **FAIL**。不得进入 CR04、CR05 或 CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 1 P1 candidate | Finding #1 确认有效；`inspectReadableSubjectFile()` 未确认 symlink 最终 target 为 regular file。其 focused `76/76`、相关 `24/24` 与 `17/17` 均通过，但没有覆盖该反例。 |
| Edge Case Hunter | PASS | `FAIL` / 1 P1 candidate | Finding #2 确认有效；missing-index 必要扫描遇 nested `EACCES` 时由 `listMarkdownFiles()` 原样抛出。该层未写文件，也未运行 build/full suite。 |
| Acceptance Auditor | PASS | `PASS` / 0 findings | 确认 Round 5 #1/#2、Owner S/M/L 与历史 closure 的现有正向 fixtures；其结论未覆盖 Blind/Edge 的新反例。 |

## Findings（去重发现）

### 1. [P1 / PATCH] Symlink canonical entry 与 mismatch candidate 未校验最终 target 是 regular file

- **Source**：Blind Hunter；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:106-164,756-801`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:93-105`
- **Evidence**：`inspectReadableSubjectFile()` 对 lexical entry 执行 `lstat`，若为 symlink 即允许继续；随后只执行 `access`、`realpath` 与 subject containment，未对 dereferenced target 执行 `stat` 或等价 regular-file check。只要 symlink target 在允许的 subject/container 内且 `access(R_OK)` 成功，directory、FIFO 或其它 non-regular target 都会返回 `state="readable"`。
- **Reproduction A1**：canonical `prd.md` symlink 指向 subject 内 directory，且无 `index.md`；resolver 返回 `ok=true` / `whole-only` / `continue` 并把该 symlink 当作已消费 whole。
- **Reproduction A2**：安全 whole 存在、canonical `index.md` symlink 指向 subject 内 directory；`selection=whole` 返回 `ok=true` / `whole+sharded` / `continue`。同一 fixture 无 selection 时，后续 `readFile(index.md)` 抛 raw `EISDIR`。
- **Reproduction A3**：Owner M 的 bounded legacy `prd.md` probe symlink 指向同 root 内 directory；`findLegacyMismatchCandidates()` 把它作为 readable candidate，产生虚假的 `artifact-path.config-artifact-mismatch`。
- **Impact**：破坏 canonical entry “先完成安全校验”的 Owner S precedence、whole/sharded shape真实性、Owner M diagnostic probe真实性及 structured result。影响 AC3、AC4、AC5、AC7、AC8、AC10；对于 FIFO 等 target 还可能把非终止 I/O 风险推迟到后续 reader。
- **Stable mapping / authorized boundary**：无需新增 ID 或 Owner 决策。Canonical whole final target 非 regular 继续复用 `artifact-path.subject-document-missing` / `canonical-whole-unreadable`；canonical index final target 非 regular 继续复用 `artifact-path.broken-shard-reference` / `unreadable-shard`；mismatch probe 只有 dereferenced final target 为 project-local readable regular file时才算命中，否则不产生 mismatch。修复应位于 shared helper 或等价单一边界，保持站内 symlink→regular file合法、站外 target仍为 `artifact-path.symlink-escape`。
- **Required fixtures**：whole symlink→directory/FIFO 覆盖 no selection、`whole`、`sharded`；index symlink→directory至少覆盖 `selection=whole` 与需读 graph 的 invocation；PRD/Epics/Architecture bounded mismatch probes覆盖 symlink→directory不命中、symlink→regular file仍按声明顺序命中。断言 schema、safe relative evidence、stable result、zero mutation及无 raw error。

### 2. [P1 / DECISION_NEEDED] Missing-index 必要 candidate scan 的 nested `readdir` failure 逃逸 structured result

- **Source**：Edge Case Hunter；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:163-169,200-220,739-753`；`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:286-293`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:95-105`
- **Evidence**：Round 5 Fix #2 已正确把递归 scan 收窄到 `!indexPresent`。但此时 scan 是区分“shards 存在但缺 index”与“subject document missing”的必要步骤；`listMarkdownFiles()` 仅将 `ENOENT` 映射为空集合，其它 root 或 nested `readdir` error 均原样抛出。
- **Reproduction**：whole 与 index 均不存在，subject 内存在 inaccessible nested directory；resolver 抛 rejected Promise `{ code: "EACCES" }`，没有返回 `ArtifactDocumentDiscoveryResult`、stable issue、`continuation=block` 或 safe evidence。临时目录权限已恢复并清理。
- **Why in scope**：AC5 要求 missing-index/missing-subject 走唯一 decision table，AC5/AC8 要求 block 使用 `SPEC 07` stable IDs 且零 write/progress mutation；`SPEC 09:103` 进一步要求“每次 discovery evidence”记录结构化字段。因此，这个有限、必需的 candidate scan 失败是 Story 11.5 blocker。Round 5 排除的是“catch/映射任意 `readdir` 异常、建立泛化 filesystem exception taxonomy”；本 finding 不要求扫描 index-present subtree，也不扩展到任意 filesystem API。
- **Why decision is still needed**：现有 `artifact-path.invalid-sharded-document-shape` 精确定义为“已知存在 shard candidates 但缺 index”；扫描失败时无法证明 candidates 存在。`artifact-path.subject-document-missing` 要求 whole 与有效 sharded input均不存在，但扫描失败同样无法证明后者。`broken-shard-reference` 只适用于已存在 index 的声明 graph，`ambiguous-subject-document-shape` 显然不适用。Reviewer不得擅自把 unknown state伪装成 known-invalid或known-missing。
- **Required decision**：fresh Evaluator 应先确认 P1，并给出唯一 stable mapping；若无法从 owning contract唯一推出，应进入窄化 Owner gate。决策范围只允许 missing-index candidate scan 的 unreadable/indeterminate state、稳定 reason/details/discoveryShape及 safe affected path，不授权通用 filesystem error framework、新 discovery precedence、dependency upgrade或 Story 11.6+改动。
- **Required fixtures**：利用 current injected `readdir` IO seam，覆盖 root/nested scan `EACCES`、重复调用稳定性、schema、无 absolute/raw error泄露及 before/after zero mutation；同时证明正常 root-level/nested candidate仍映射 `invalid-sharded-document-shape` / `shards-without-index`，完全无 candidate仍走 bounded mismatch probes后映射 subject missing。

## Candidate Rejections（候选驳回）

无。两项正式候选均成立；Acceptance Auditor 的 PASS 是现有正向与 Round 5 closure 证据，不足以驳回可由 current runtime复现的新反例。

## Round 5 And Historical Closure（Round 5 与历史闭环）

| Prior item | Round 6 result | Evidence |
| --- | --- | --- |
| Round 5 #1 canonical whole direct non-file/unreadable fail-close | PASS（原 finding 保持关闭） | Caller 已在 shape、selection、graph与mismatch前处理 `wholeState.state === "unreadable"`，并映射 `subject-document-missing` / `canonical-whole-unreadable`。Round 6 #1 是 helper把 symlink→non-regular错误标为 readable的新边界，不回退原 caller fix。 |
| Round 5 #2 index-present 不扫描未声明 subtree | PASS（原 finding 保持关闭） | `shardCandidates` 仅在 `!indexPresent` 时调用 `listMarkdownFiles()`。Round 6 #2 只针对 missing-index 必要 scan 本身失败，不要求恢复 index-present scan。 |
| Owner S：显式 whole 不读/解析未选 index graph | PASS（核心决策保持关闭） | `skipUnselectedIndexGraph` 仍跳过 graph；Round 6 #1 只要求 canonical index entry最终 target确为 regular file，属于 Owner S 明确保留的 entry safety gate。 |
| Owner M：有限 mismatch probes、仅诊断不消费 | **PARTIAL / 新反例** | Probe集合、顺序及 no-fallback/no-migration保持正确，但 symlink→non-regular可被误判为 readable mismatch candidate；由 Finding #1 bounded patch处理。 |
| Owner L：bounded CommonMark-compatible subset | PASS | Round 6 未发现 inline/reference、query/fragment、single decode、portable classification、order/dedupe/self-link回归。 |
| Round 1-4 已关闭 findings | PASS | Round 6 两项均是 symlink final-target type与missing-index necessary-scan failure，不重开既有 parsing、ordering、self-link、selection或入口扫描时机 findings。 |

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Evidence / note |
| --- | --- | --- |
| AC1 | PASS | Fresh phase-owned subject directory projection未被本轮推翻。 |
| AC2 | PASS | 三个 canonical whole producer paths保持稳定。 |
| AC3 | **FAIL** | Symlink→non-regular可伪装为whole/index shape；missing-index必要扫描可raw throw。 |
| AC4 | **FAIL** | Shared consumer resolver可消费非regular canonical entry或不返回结构化结果。 |
| AC5 | **FAIL** | Owner S graph precedence保持正确，但canonical entry safety与missing-index deterministic result不完整。 |
| AC6 | PASS | Explicit-root authority与Architecture `legacy-compatible` fallback未被重开。 |
| AC7 | **FAIL** | Owner M probe边界/顺序仍正确，但symlink→non-regular可产生伪mismatch evidence。 |
| AC8 | **FAIL** | Runtime未完全兑现SPEC中的entry safety、structured evidence与stable issue承诺。 |
| AC9 | PASS | Active fresh producer negative scan未被本轮发现推翻。 |
| AC10 | **FAIL** | Current fixtures缺少两项反例及其stable/zero-mutation assertions。 |
| AC11 | PASS | Findings均限于Story 11.5 shared discovery与bounded M/S contracts，不扩展Story 11.6+。 |

## Verification（验证）

- Aggregator：`npx vitest run test/artifact-document-discovery.test.ts` PASS，`1 file / 76 tests`。
- Blind Hunter正式结果：focused `76/76`、相关 `24/24` 与 `17/17` PASS；这些已登记测试不覆盖 Finding #1。
- Acceptance Auditor正式结果：focused、docs、canonical checker与diff checks PASS；不覆盖两项反例。
- Aggregator独立复现 A：whole symlink→directory错误 `whole-only/continue`；index symlink→directory在 `selection=whole` 下错误 `whole+sharded/continue`，无 selection抛 raw `EISDIR`；legacy mismatch symlink→directory错误产生 mismatch。
- Aggregator独立复现 B：missing whole/index + inaccessible nested directory抛 raw `EACCES`；临时目录权限已恢复并清理。
- Aggregator canonical source checker：`status=ok`、`findings=[]`、`changedPathCount=82`，impacted classes为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，`decisionRecordRequired=false`。
- Aggregator scoped `git diff --check`：PASS（无输出）。
- 本 Aggregator未运行 build、full suite或 packaging；除本 summary外未修改 source、tests、Story、tracker、SPEC/docs、progress logs或其它CR文件。

## Caveats（限制与隔离）

- External `speclite-drawer-er-modeler`、`.agents/.claude` mirrors与fixed-count drift不属于Story 11.5 finding，未纳入本轮裁决。
- Canonical checker当前为D0且无finding；本Aggregator不执行写型governance fix或D1/D2 record。Root orchestrator仍需按hook要求在最终收口前完成governance runner分类与final strict checker。
- Finding #1不得扩大为禁止所有symlink：站内symlink→readable regular file仍是既有合法路径；站外target仍使用既有symlink escape语义。
- Finding #2不得扩大为index-present integrity scan、任意filesystem API异常治理或通用taxonomy；它仅覆盖missing-index decision所必需的candidate enumeration无法完成。

## Next Gate（下一门禁）

进入 fresh Evaluator Round 6。Evaluator应独立确认两项P1，直接授权Finding #1的bounded patch，并裁决Finding #2是否已有唯一stable mapping；若没有，应停在窄化Owner gate。只有最新Reviewer与最新Evaluator同时PASS、所有authorized fixes经fresh复审复评关闭且required verification无Story 11.5新增失败，才可进入CR04、CR05或CR06。
