---
Story: 11-5
Round: 5
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Round 5 三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级）。三层对 Owner 已确认的方案 S 核心闭环判断一致：显式 `selection=whole` 时，安全的未选 `index.md` 内容及 shard graph 已不再被读取或解析；canonical index entry 的安全校验仍保留。Blind / Edge 所报目录扫描不是重开该 Owner 决策，而是 selection 分支之前仍存在的无条件、递归 subject-tree 扫描。

Aggregator 独立检查 current source、tests、`SPEC 09` 与 public docs，并在已清理的临时项目中复现候选 A/B。结果确认 **2 个去重后的 P1 blocking findings**：canonical whole entry 的 non-file/unreadable 状态没有 fail closed；任意 `index.md` 已存在的分支仍递归扫描未选且无关的 subject subtree，并可把 `EACCES` 作为非结构化异常抛出。因此本轮总体结论为 **FAIL**，不得进入 CR04、CR05 或 CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 2 P1 candidates | 候选 A/B 均确认；focused `67/67`、related `41/41`、docs、canonical 与 diff checks 通过。 |
| Edge Case Hunter | PASS | `FAIL` / 1 P1 candidate | 确认候选 B；独立复现 `listMarkdownFiles()` 对无关 mode-000 subtree 抛出 `EACCES`，且只有缺 index 的 invalid-shape 判定需要递归扫描。 |
| Acceptance Auditor | PASS | `FAIL` / 1 P1 candidate | 确认候选 A；方案 S 核心及其现有 fixtures 通过，但 canonical whole entry 的 non-file 状态被当作 absent。 |

## Findings（去重发现）

### 1. [P1] Canonical whole 的 non-file/unreadable 状态未 fail closed，而被当作 absent

- **Source**：Blind Hunter + Acceptance Auditor；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:106-143,247-306`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:93-103`
- **Evidence**：`inspectReadableSubjectFile()` 会把 canonical whole 的目录、不可读文件或其它 non-file entry 返回为 `unreadable`，但 caller 只处理 `wholeState.state === "symlink-escape"`；随后 `wholePresent` 仅在 `readable` 时为 true。相同的 canonical index `unreadable` 状态会在 `122-141` 立即结构化 block，whole 却被静默降为 absent。
- **Reproduction**：在 `prd/` 下把 canonical `prd.md` 建成目录，同时提供安全、有效的 `index.md -> s.md`。无 selection 与 `selection=sharded` 均返回 `ok=true`、`discoveryShape=sharded-only` 并消费 index/shard；`selection=whole` 才以 `artifact-path.subject-document-missing` / `selected-document-shape-missing` block。三种 invocation 均未把已经存在但不合法的 canonical whole entry 作为 entry-validation failure。
- **Impact**：`SPEC 09:99` 明确要求 canonical whole 与 canonical index 自身“必须先”完成 `lstat`、readability 与 realpath containment；不合法 whole 可在无 selection 或选择 sharded 时被绕过，破坏 AC3、AC4、AC5、AC8、AC10 以及 block 的稳定 evidence/zero-mutation contract。
- **Recommendation**：在计算 discovery shape 或解析 index graph 前，对 `wholeState.state === "unreadable"` 确定性返回结构化 block，并补 canonical whole 为 directory/non-file/unreadable 时在无 selection、`whole`、`sharded` 三种 invocation 下的 fixtures，断言 `actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block` 与 before/after zero mutation。现有 `SPEC 07` 没有像 symlink escape 那样显式声明 canonical whole non-file/unreadable 的唯一 stable issue；Evaluator 必须独立裁决是复用现有 `artifact-path.subject-document-missing` 并新增稳定 reason，还是需要窄化 taxonomy/Owner gate，Reviewer 不擅自扩写 contract。

### 2. [P1] `index.md` 已存在时仍无条件递归扫描整个 subject tree，可因未选/无关目录抛出非结构化异常

- **Source**：Blind Hunter + Edge Case Hunter；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:142-178,717-731`
- **Evidence**：完成 whole/index entry inspection 后，resolver 无条件调用 `listMarkdownFiles(subjectDirectory)`，再用结果判断 `!indexPresent && shardCandidates.length > 0`。当 `indexPresent=true` 时，`shardCandidates` 在所有后续分支都不参与结果，但递归扫描仍会进入任意子目录；除 missing 外的 `readdir` error 会原样 throw。
- **Reproduction**：在 `prd/` 下提供安全可读的 `prd.md`、`index.md`、`s.md`，另建与文档 graph 无关的 mode-000 `unrelated/`；以 `selection=whole` 调用返回 rejected Promise `{ code: "EACCES" }`，而不是方案 S 规定的 whole continuation。三层 Edge 复现与 Aggregator 临时复现一致。
- **Impact**：显式 whole selection 虽已跳过 `resolveDeclaredShards()`，仍读取未选/无关 subject subtree；不可访问的非 graph 目录可以阻断 whole、sharded 或无 selection invocation，绕过 command-result/stable-issue/zero-mutation evidence。该问题也影响所有 `indexPresent=true` 分支，不仅影响方案 S；但不需要扩大成泛化 filesystem error 治理。
- **Recommendation**：仅在 `!indexPresent`、确实需要判断 `shards-without-index` 时调用 `listMarkdownFiles()`；`indexPresent=true` 时完全跳过该扫描，由 `resolveDeclaredShards()`（除方案 S 的显式 whole 分支外）只访问 index 明确声明的 targets。补 whole+index+unrelated inaccessible subtree 的无 selection、`whole`、`sharded` fixtures，证明无关 subtree 不被访问；保留缺 index + shard candidates 的现有 invalid-sharded coverage。不要把修复扩大为任意 `readdir` 异常 taxonomy。

## Owner S And Round 4 Closure（Owner S 与 Round 4 闭环）

| Round 4 finding / decision | Round 5 result | Evidence |
| --- | --- | --- |
| #1 decode 后统一分类 | PASS（原 finding 已关闭） | `parseMarkdownLinkDestination()` 在 bounded grammar parse 后执行 strip、single decode，再统一 drive/external/network/backslash/local classification；Round 5 三层未发现回归。 |
| #2 first-definition-wins | PASS（原 finding 已关闭） | Duplicate label 在 destination parse/access 前跳过，首定义保持权威。 |
| #3 empty first definition | PASS（原 finding 已关闭） | 首定义缺失/空 destination 返回 `malformed-link-destination`。 |
| #4 ordinary backslash portability | PASS（原 finding 已关闭） | Decode 后 local-ish backslash 返回 `unsupported-local-reference`。 |
| #5 angle body whitespace | PASS（原 finding 已关闭） | 空 angle body 或其内部首尾空白返回 malformed；closing `>` 后 whitespace 仍保留既有语义。 |
| #6 Owner 方案 S | PASS（核心 finding 已关闭） | `skipUnselectedIndexGraph` 在 whole+index+显式 whole 时阻止 `resolveDeclaredShards()`；missing/malformed/undefined graph fixtures均继续 whole，unsafe/non-file canonical index entry 仍 block。Round 5 Finding #2 是未参与 graph 解析的无条件 subject-tree 扫描，相邻但不重开 S 的 validation precedence。 |

Round 3 #1-#4、Round 2 #1-#6 与 Round 1 #1/#4/#5 的已关闭原 findings 也未被本轮反例重开。Round 5 Finding #1 是 canonical whole `unreadable` caller 分支缺失；Finding #2 是仅用于 missing-index shape detection 的扫描时机错误，均与历史 closure 可区分。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Evidence / note |
| --- | --- | --- |
| AC1 | PASS | Fresh phase-owned subject directory projection未被本轮推翻。 |
| AC2 | PASS | 三个 canonical whole producer path保持稳定。 |
| AC3 | **FAIL** | Canonical whole non-file/unreadable entry可被当作 absent；有 index 时仍递归混入无关 subtree 的可访问性。 |
| AC4 | **FAIL** | Shared consumer resolver可在不合法 whole 下继续 sharded，或因无关目录抛 raw error。 |
| AC5 | **FAIL** | Owner S 的未选 index graph precedence已正确，但 canonical entry“先校验”和确定性 decision-table result仍未完全满足。 |
| AC6 | PASS | Explicit-root authority 与 Architecture `legacy-compatible` fallback未受影响。 |
| AC7 | PASS | Owner M finite probes 与 no-migration约束未被重开。 |
| AC8 | **FAIL** | `SPEC 09`/docs承诺 canonical whole/index entry安全校验与 resolver结构化结果，current runtime仍存在上述反例。 |
| AC9 | PASS | Active fresh producer negative scan未被本轮发现推翻。 |
| AC10 | **FAIL** | Current `67/67` focused fixtures未覆盖 canonical whole non-file三种 selection及 index-present + inaccessible unrelated subtree。 |
| AC11 | PASS | 两项 finding均限于 Story 11.5 shared discovery，不扩展 Story 11.6+。 |

## Verification（验证）

- `npx vitest run test/artifact-document-discovery.test.ts`：PASS，`67/67`。
- `npx vitest run test/artifact-root-resolution.test.ts test/story-6-4-path-portability.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts test/docs-reference-cli-options.test.ts`：PASS，`41/41`。
- `npm run docs:check`：PASS，72 Markdown files / 5 drafts。
- Canonical source checker warn：`status=ok`、`findings=[]`；`changedPathCount=82`，impact为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，`decisionRecordRequired=false`。
- Scoped `git diff --check`：PASS。
- Aggregator 临时复现 A：canonical `prd.md` 为目录、index/shard有效时，无 selection与 `selection=sharded` 均错误继续 sharded；`selection=whole`才报 selected shape missing。
- Aggregator 临时复现 B：whole/index/shard有效且存在无关 mode-000 subtree时，`selection=whole`抛 `EACCES`；临时目录权限已恢复并清理。
- 未运行 build、full suite或 packaging；本 Aggregator除本 summary外未修改 source、tests、Story、tracker、SPEC/docs、progress logs或其它 CR 文件。

## Caveats（限制与隔离）

- External `speclite-drawer-er-modeler`、`.agents/.claude` mirrors与 fixed-count drift不属于 Story 11.5 finding，未纳入结论或修复建议。
- Canonical checker把当前82个 changed paths分类为 D0且无 finding；本 Aggregator不执行写型 governance fix或D1/D2 record。Root orchestrator仍应按 hook要求在最终收口前完成 governance runner分类与 final strict checker。
- Focused/related tests全绿只证明已登记的67/41 cases，不能推翻本轮已由 current runtime复现的两个未登记边界。
- Finding #2的修复边界仅是把 shard-candidate递归扫描限制到 `!indexPresent`；不授权泛化 filesystem异常模型、扫描未声明文件、dependency upgrade或 Story 11.6+变更。

## Next Gate（下一门禁）

进入 fresh Evaluator Round 5。Evaluator应独立裁决以上2个 P1 findings，尤其明确 Finding #1 的 stable issue映射与是否需要窄化 Owner/taxonomy decision。只有 latest Reviewer与latest Evaluator同时 PASS，且 required verification无 Story 11.5新增失败，才可进入 CR04、CR05或CR06。
