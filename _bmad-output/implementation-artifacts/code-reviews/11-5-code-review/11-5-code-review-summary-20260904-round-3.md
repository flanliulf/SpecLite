---
Story: 11-5
Round: 3
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Round 3 三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级），但 latest implementation 仍有 **4 个去重后的 P1 blocking findings**，因此总体结论为 **FAIL**，不得进入 CR04、CR05 或 CR06。

Round 2 的六个具体修复目标均已在 current source 与 focused fixtures 中闭环；本轮发现是其相邻但未覆盖的 bounded Markdown destination/reference 边界：external/network/fragment reference definition 被丢弃、percent-decode 后形成 Windows drive-letter、malformed inline destination 被静默忽略或截断接受、以及 escaped opening bracket 被误解析。上述缺口均可由 Owner L 已批准并写入 `SPEC 09` 的现有顺序与 fail-closed/ignore 语义唯一裁决，不需要新的 Owner decision，也不授权扩成完整 CommonMark parser。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Incorporated evidence |
| --- | --- | --- | --- |
| Blind Hunter | PASS（层执行成功） | `FAIL` / 1 finding | External/network/fragment reference-style definition 被识别为 non-shard 后未保留定义状态，full/collapsed usage 被误报 `undefined-reference`。 |
| Edge Case Hunter | PASS（层执行成功） | `FAIL` / 4 findings | 确认 external reference、post-decode drive-letter、两种 malformed inline destination、escaped opening bracket 四类边界。 |
| Acceptance Auditor | PASS（层执行成功） | `FAIL` / 2 findings | 确认 external reference 与 missing-close malformed inline destination 阻塞 AC3/4/5/8/10；Round 2 #1-#6 已关闭。 |

Aggregator 独立复核 current source、tests、Story、Round 2 summary/evaluation+Fixer record、`SPEC 09` 与 CLI docs，并以临时目录完成 8 个最小运行时复现后清理。三层对 external reference 的重复候选合并为 Finding #1；Edge 与 Acceptance 对 missing-close 的重复候选，以及同属 malformed destination contract 的 angle-close trailing junk，合并为 Finding #3。External drawer、IDE mirrors 与 fixed-count drift 未计入本 Story finding。

## Findings（去重发现）

### 1. [P1] Non-shard reference definition 被丢弃，合法 usage 被误报 undefined

- **Category**：parser / reference-definition classification
- **Source**：Blind Hunter + Edge Case Hunter + Acceptance Auditor；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:469-480,503-518`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`；`docs/reference/cli.md:226`
- **Evidence**：definition scanner 仅把 `local-md` destination 写入 `definitions`；external scheme、network path 与 fragment-only destination 都以 `kind=ignore` 被丢弃。后续 full/collapsed reference usage 无法区分“已定义但不是 shard”和“真正未定义”，统一返回 `artifact-path.broken-shard-reference` / `undefined-reference`。
- **Reproduction**：`[External][web]` + `[web]: https://example.com/chapter.md`、`[CDN][cdn]` + `[cdn]: //cdn.example.com/chapter.md`、`[Here][frag]` + `[frag]: #section` 均返回 `ok=false`、`undefined-reference`、空 `consumedPaths`；它们按 Owner L 应被忽略且不得 block。
- **Impact**：合法 reference-style non-shard link 阻塞 whole/sharded discovery，runtime 与 public docs 不一致，影响 AC3、AC4、AC5、AC8、AC10。
- **Recommendation**：definition table 保留 `local-md` 与 `defined-but-ignore` 的分类状态；full/collapsed usage 遇到 ignore sentinel 时确定性跳过，只有 label 真正不存在时才返回 `undefined-reference`。补 external scheme、angle external、network 与 fragment-only 的 full/collapsed fixtures；不得访问 external target。

### 2. [P1] Percent-decode 后形成的 Windows drive-letter 绕过 portable guard

- **Category**：portability / destination processing order
- **Source**：Edge Case Hunter；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:552-565`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100,106`
- **Evidence**：raw drive-letter 检查发生在 query/fragment stripping 与 single percent-decode 之前，decode 后没有再次做 drive/network portable classification。`C%3A/private/outside.md` 因 raw text 不匹配 drive guard，decode 为 `C:/private/outside.md` 后直接作为 `local-md` 返回。
- **Reproduction**：当 subject directory 中存在字面目录 `C:/private/outside.md` 时，`[Drive](C%3A/private/outside.md)` 返回 `ok=true`，并把 `out/prd/C:/private/outside.md` 加入 `declaredShardPaths` 与 `consumedPaths`。
- **Impact**：违反 Owner L 的 `parse -> strip query/fragment -> single percent-decode -> portable/containment/readability` 顺序，接受了禁止进入证据的 drive-letter local-ish destination，影响 AC3、AC4、AC5、AC10。
- **Recommendation**：在 single decode 后执行 portable、drive-letter 与 network-path classification；返回既有 `artifact-path.broken-shard-reference` / `unsupported-local-reference`，并继续确保 public details 不泄露 raw drive/absolute path。补 percent-encoded colon 与必要的 slash/backslash fixtures，不做二次 decode。

### 3. [P1] Malformed inline destination 被静默忽略或截断接受

- **Category**：parser / fail-closed malformed destination
- **Source**：Edge Case Hunter + Acceptance Auditor；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:489-498,543-550`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`
- **Evidence**：scanner 识别到 `](` 后若找不到 closing `)`，`scanInlineDestinationEnd()` 返回 `-1`，调用方直接 `continue`；angle destination 则只取首个 `<...>` 内容，未验证 `>` 后到 closing `)` 之间是否存在 trailing junk。
- **Reproduction**：`[Broken](chapter.md` 返回 `ok=true`、仅消费 `index.md`；`[X](<chapter.md>junk)` 在 `chapter.md` 存在时返回 `ok=true` 并消费该 shard。两者均未生成 `malformed-link-destination`。
- **Impact**：明显进入已支持 inline grammar 的 malformed destination 未 fail closed，可能少消费或错误消费，影响 AC3、AC4、AC5、AC10。
- **Recommendation**：一旦识别 inline opener，缺失合法 close 必须返回 `malformed-link-destination`；angle form 必须验证 close 后只允许 bounded grammar 已明确接受的尾部，否则同样 block。补 missing close、missing angle close、angle-close trailing junk 与合法 angle local/external regression fixtures。
- **Dedup rationale**：两种表现位于不同 parser 分支，但违反同一 Owner L malformed/fail-closed contract，使用同一 stable issue、同一 `referenceKind` 与同一 bounded parser hardening 验收，因此合并为一个 finding。

### 4. [P1] Escaped opening bracket 被误解析为 inline shard link

- **Category**：parser / escape semantics
- **Source**：Edge Case Hunter；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:483-500,599-615`
- **Evidence**：outer scanner 看到 `[` 就进入 `scanBracketed()`，只排除前置 `!`，没有按连续反斜杠奇偶性判断 opening bracket 是否被转义。内部 scanner 处理 escape，不能补偿 opener 的误分类。
- **Reproduction**：Markdown `\[Not a link](missing.md)` 被解析为 local shard 并以 `missing-shard` block；对照 `\\[Link](one.md)` 在文件存在时被消费。前者的奇数反斜杠应使 `[` 成为普通文本，后者的偶数反斜杠才保留未转义 opener 语义。
- **Impact**：合法转义文本制造伪 shard declaration 和 false block，破坏 AC3、AC4、AC5、AC10。
- **Recommendation**：outer scanner 在识别 link opener 前计算紧邻 `[` 的连续反斜杠数量，奇数时跳过、偶数时继续解析；补 odd/even backslash fixtures，并保持现有 image exclusion、order/dedupe/self-link 行为。

## Round 2 Closure Matrix（上一轮闭环矩阵）

| Round 2 finding | Round 3 result | Evidence |
| --- | --- | --- |
| #1 Architecture finite probe 条件 | PASS（原 finding 已关闭） | Root-level Planning `architecture.md` 无条件加入 bounded candidates；额外 subject whole/index 仅限 explicit mode（source `718-731`；tests `537-589`）。 |
| #2 Subject directory symlink rebinding | PASS（原 finding 已关闭） | Canonical reads 前拒绝 lexical subject-directory symlink，in-project/out-of-project fixtures 均 block（source `102-105`；tests `441-470`）。 |
| #3 Angle external/network inline destination | PASS（原 finding 已关闭） | Angle unwrap 后 raw inline external/network 已被 ignore，local angle 继续消费（source `543-555`；tests `167-183`）。Round 3 #1 是 reference-definition state 丢失的不同分支。 |
| #4 Fenced code context | PASS（原 finding 已关闭） | Backtick/tilde、较长 close、unclosed-to-EOF 已由 line-state masker与 fixture 覆盖（source `568-587`；tests `186-213`）。 |
| #5 Raw Windows drive-letter | PASS（原 finding 已关闭） | Raw slash/backslash forms 已在 generic scheme 前 fail closed（source `552-555`；tests `368-394`）。Round 3 #2 是 decode 后才形成 drive-letter 的 destination-pipeline 边界。 |
| #6 Nested inline / shortcut reference | PASS（原 finding 已关闭） | Bracket scanner、full/collapsed/shortcut 与 normalized label 已实现并覆盖（source `483-531,599-615`；tests `139-165`）。 |

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Evidence / note |
| --- | --- | --- |
| AC1 | PASS | Fresh PRD/Epics/Architecture phase-owned subject directories 已有既有 runtime/fixture evidence。 |
| AC2 | PASS | 三个 canonical whole producer paths 已锁定。 |
| AC3 | **FAIL** | Reference classification、post-decode portability、malformed inline 与 escape semantics 仍可伪造或漏掉 shard declarations。 |
| AC4 | **FAIL** | Consumer 仍可能对合法 non-shard reference 错误 block，或对 malformed/encoded input 少消费、误消费。 |
| AC5 | **FAIL** | 唯一 decision table 已存在，但 Owner L destination grammar/fail-closed 分支尚未完全实现。 |
| AC6 | PASS | Explicit root authority 与 `legacy-compatible` Architecture fallback 未被本轮反例破坏。 |
| AC7 | PASS | Owner M finite mismatch probes、diagnostic-only/no-migration 与 Architecture explicit/fallback 条件已闭环。 |
| AC8 | **FAIL** | Public docs 对 external/reference-style/malformed/portable 的声明与 current runtime 在本轮四类边界不一致。 |
| AC9 | PASS | Active fresh producer negative scan evidence 未被本轮反例推翻。 |
| AC10 | **FAIL** | 当前 38 个 focused fixtures 未覆盖本轮 8 个最小反例。 |
| AC11 | PASS | Findings 只涉及 PRD/Epics/Architecture shared discovery；未扩展到 UX、Story 11.6+ 或已完成 Story。 |

## Verification（验证）

- `npx vitest run test/artifact-document-discovery.test.ts`：PASS，`38/38`。
- `npx vitest run test/artifact-root-resolution.test.ts test/resolve-readers.test.ts test/story-6-4-path-portability.test.ts`：PASS，`24/24`。
- `npm run docs:check`：PASS，72 Markdown files / 5 drafts。
- Canonical source checker warn/strict：均 `status=ok`、`findings=[]`；`changedPathCount=82`，impact 为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，`decisionRecordRequired=false`。
- Aggregator 临时目录最小复现：external、network、fragment reference definitions 均误报 `undefined-reference`；encoded drive 被消费；missing-close 被静默忽略；angle trailing junk 被接受；odd escaped opener 被误解析；even escaped opener 继续按 link 解析。共 `8/8` 确认 current behavior，临时目录已清理。
- Scoped `git diff --check`：PASS。
- 未运行 build、full suite 或 packaging；本 Aggregator 未修改 source、tests、Story、tracker、SPEC/docs、progress logs 或其它 CR 文件。

Acceptance Auditor 报告的 related current inventory `32/32` 与 Fixer 记录的 `24/24` 不应构成 finding：本 Aggregator 使用与 Fixer 明确相同的三文件命令复跑得到 `24/24`；`32` 来自不同测试集合或统计口径，不能在没有相同 command identity 时据此宣称 test drift。Focused discovery 的 current inventory 独立为 `38/38`。

## Caveats（限制与隔离项）

- External `speclite-drawer-er-modeler`、`.agents/.claude` mirrors 与 canonical fixed-count drift 不属于 Story 11.5 Round 3 finding，也未据此扩大修复范围。
- Hook 要求的 canonical governance classification 当前为两个 D0 classes，且 checker 明确给出 `decisionRecordRequired=false`；本 Aggregator 的授权仅允许写本 summary，因此未运行可能产生治理修复/记录的 governance runner。Root orchestrator 应在最终收口前按其授权边界完成该 runner 与最终 checker。
- 现有 focused/related tests 全绿仅证明已登记的 38/24 cases；它们未覆盖已由运行时复现确认的本轮四类缺口，不能据此判定 CR PASS。
- 本轮不授权 dependency upgrade、完整 CommonMark、HTML、code span、image link 或其它未形成 finding 的 grammar 扩展。

## Next Gate（下一门禁）

进入 fresh Evaluator Round 3。Evaluator 应逐项确认以上 4 个 findings 的有效性、P1 优先级与最小 Fixer 授权，尤其保持 external/reference ignore、post-decode portable check、malformed fail-closed 与 odd/even escape semantics 的 bounded scope。在 latest Reviewer 与 latest Evaluator 均通过前，Story 11.5 保持 `review`，不得执行 CR04、CR05 或 CR06。
