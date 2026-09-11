---
Story: 11-5
Round: 4
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Round 4 三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级）。Aggregator 对去重后的 9 组行为候选逐项检查 current source，并在已清理的临时项目中做最小运行时复现。结果确认 **6 个去重后的 P1 blocking findings**，驳回 3 个候选/证据主张，因此总体结论为 **FAIL**，不得进入 CR04、CR05 或 CR06。

Round 3 #1-#4 的原始修复目标均已关闭；本轮有效问题是相邻但未覆盖的 Owner L / AC5 边界：分类发生在 single decode 之前、first-definition-wins 发生在 duplicate destination validation 之后、空 definition 被静默当作 non-shard、非 drive-letter 反斜杠路径在 POSIX host 被当作可消费文件、angle destination 内部空白被 trim 后接受，以及显式 `selection=whole` 仍被未选 index 的 broken shard 阻断。这些均能由现有 `SPEC 09` 顺序、portable/malformed 约束与“只消费所选形态”唯一裁决，不需要新 Owner decision。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 5 P1 candidates | Pipeline 顺序、duplicate definition 与空 definition 确认；non-angle trailing junk 驳回。 |
| Edge Case Hunter | PASS | `FAIL` / 6 P1 candidates | Pipeline、duplicate definition、backslash portability、angle 内空白、whole selection 确认；escaped-punctuation 的“应支持”主张驳回。 |
| Acceptance Auditor | PASS | `FAIL` / 2 P1 candidates | 空 definition 与 post-decode external/network 均被确认；Round 3 四项原 finding 已关闭。 |

## Findings（去重发现）

### 1. [P1] Destination 在 single decode 前提前分类，造成 drive/external/network 语义错位

- **Location**：`src/config/artifact-document-discovery.ts:565-594`
- **Evidence**：当前先对 raw destination 执行 drive/generic-scheme/network 判定，随后才 strip query/fragment 与 single decode；decode 后只重做 drive-letter 与 `.md` suffix 检查。这与 `SPEC 09:100` 的 `parse -> strip -> single percent-decode -> portable/...` 顺序直接冲突。
- **Reproduction**：`C:%2Fprivate%2Fout.md` 与 `C:%5Cprivate%5Cout.md` 被 generic scheme 当作 external 而 `ok=true` 静默忽略；`https%3A%2F%2Fexample.com%2Fa.md` 在存在字面目录时被消费为 `out/prd/https:/example.com/a.md`；`%2F%2Fcdn.example.com%2Fa.md` 被误报 `outside-subject-directory`，而不是确定性 ignore。
- **Impact**：同一解码后语义因 raw encoding 不同而被忽略、消费或阻断，违反 AC3/4/5/8/10。
- **Recommendation**：将 external/network/drive/portable 分类统一放到 exactly-once decode 之后、`.md` acceptance 之前；drive 映射既有 `unsupported-local-reference`，external/network 确定性 ignore，不得 second decode 或泄露 raw path。

### 2. [P1] Duplicate reference definition 在 first-definition-wins 之前验证 destination

- **Location**：`src/config/artifact-document-discovery.ts:474-487`
- **Evidence**：每个 definition 都先调用 `parseMarkdownLinkDestination()`，然后才检查 `definitions.has(label)`。因此后续 duplicate 仍能改变已由首个 definition 决定的结果。
- **Reproduction**：`[x][d]` + `[d]: good.md` + `[d]: bad%ZZ.md` 在 `good.md` 存在时仍以 `malformed-link-destination` block。
- **Impact**：破坏 Round 3 评估与修复明确保留的 first-definition-wins，使不应生效的 duplicate 可阻断合法 shard，影响 AC3/4/5/10。
- **Recommendation**：对 normalized label 已存在的后续 definition 先跳过，不解析、不访问其 destination；补合法首定义 + malformed/local/external duplicate 回归。

### 3. [P1] 空 reference definition 被标记为 defined-but-ignore，未按 malformed 失败关闭

- **Location**：`src/config/artifact-document-discovery.ts:474-485,565-566`
- **Evidence**：definition regex 允许 destination 缺失；空串在 parser 中返回 `ignore`，随后被存为 `defined-but-ignore`。
- **Reproduction**：`[x][d]` + `[d]:` 返回 `ok=true`、只消费 `index.md`，没有 `malformed-link-destination`。
- **Impact**：已进入支持的 reference-definition grammar 却没有 destination，被静默当作 non-shard，违反 Owner L 对 malformed destination 的 fail-closed 要求，影响 AC3/4/5/8/10。
- **Recommendation**：将缺失/空 definition destination 映射为既有 `malformed-link-destination`；保留明确 fragment/external/network definition 的 `defined-but-ignore`。

### 4. [P1] 普通 raw/encoded backslash destination 可依赖 POSIX 字面文件并伪造 POSIX evidence

- **Location**：`src/config/artifact-document-discovery.ts:585-594,428-453`；`src/fs/path-normalizer.ts:48-65`
- **Evidence**：decode 后只拒绝 drive-letter backslash，普通 `dir\\chapter.md` 仍被当作 local Markdown path。POSIX filesystem 可存在带字面反斜杠的文件，而 evidence normalizer 又把该字符改写为 `/`。
- **Reproduction**：对同一字面 `dir\\chapter.md` 文件，raw `dir\\chapter.md` 与 encoded `dir%5Cchapter.md` 均 `ok=true`，并报告并不对应真实 POSIX 文件名的 `out/prd/dir/chapter.md`。
- **Impact**：消费结果依赖 host，evidence 与真实 target 不同，违反 portable/project-relative POSIX contract 及 AC3/4/5/8/10。
- **Recommendation**：在 single decode 后把任何含 backslash 的 local-ish destination 作为既有 `unsupported-local-reference` block；不扩展为 CommonMark escape unescaping。

### 5. [P1] Angle destination 内部首尾空白被 trim 后接受

- **Location**：`src/config/artifact-document-discovery.ts:565-579`
- **Evidence**：angle body 被 `slice(1, closingIndex)` 提取后再 `trim()`，所以 angle 内部的非法空白丢失；这与已支持的 angle destination 及 malformed fail-closed 属同一 bounded grammar。
- **Reproduction**：`[x](< good.md>)` 和 `[x](<good.md >)` 在 `good.md` 存在时都 `ok=true` 并消费该 shard。
- **Impact**：明确 malformed 的 supported angle form 被规范化为有效输入，违反 AC3/4/5/8/10。
- **Recommendation**：angle body 为空或含首尾空白时返回 `malformed-link-destination`；保留 `>` 与 outer `)` 之间只有空白的现有合法 fixture。

### 6. [P1] `selection=whole` 在选择分支之前解析未选 sharded index

- **Location**：`src/config/artifact-document-discovery.ts:129-156,226-258`
- **Evidence**：只要 `index.md` 存在，resolver 就先调用 `resolveDeclaredShards()` 并可立即 block；`whole+sharded` 的 explicit selection 分支在此之后才执行。
- **Reproduction**：`prd.md` 存在、`index.md` 引用 missing shard，且 invocation 明确 `selection=whole` 时，返回 `artifact-path.broken-shard-reference` / `missing-shard`、`consumedPaths=[]`、`unselectedPath=null`。
- **Impact**：直接违反 AC5 / `SPEC 09:93` 的“只消费所选 whole，记录未选 index，Continue”；未选形态可阻断明确选择，同时破坏 AC4/8/10。
- **Recommendation**：在 whole 存在且 invocation 明确选 whole 时，只验证/消费 canonical whole，将未选 `index.md` 记为 `unselectedPath`，不读取或验证其 shard graph；无 selection 或选 sharded 时仍保留现有 sharded validation。

## Rejected Candidates（驳回候选）

1. **Non-angle trailing junk / link title**：`[x](good.md junk)` 确实只取首 token 并消费 `good.md`，但 Owner L 只规范 destination，Round 3 evaluator 又明确排除 link-title grammar。要求识别、验证或拒绝任意 title/tail 会扩展 bounded subset，现有 AC 无法唯一裁决，本轮不立 finding。
2. **CommonMark backslash-escaped punctuation 应被 unescape 并消费**：现有 Owner L 没有授权完整 CommonMark escape semantics。该输入含 backslash，在现有 portable contract 下应由 Finding #4 fail closed，不应反向扩展为 unescape-and-consume。
3. **Edge payload 的 `guard_snippet`**：该片段是建议性伪代码，不存在于 current source，未被当作实现证据或 closure 证据。

## Round 3 Closure（上轮闭环）

| Round 3 finding | Round 4 result | Evidence |
| --- | --- | --- |
| #1 non-shard definition state | PASS（原 finding 已关闭） | `local-md` / `defined-but-ignore` union 存在，external/network/fragment full/collapsed/shortcut 已有 focused coverage。Round 4 #2/#3 是 duplicate precedence 与 empty destination 的不同边界。 |
| #2 post-decode drive-letter | PASS（原 finding 已关闭） | `C%3A/...` 与 encoded backslash drive 已在 decode 后 block。Round 4 #1 覆盖的是 raw-colon+encoded-separator 与 decode 后 generic external/network 未统一分类。 |
| #3 malformed inline destination | PASS（原 finding 已关闭） | missing `)`、missing `>`、angle-close trailing junk 已映射 `malformed-link-destination`；Round 4 #5 是 angle body 内部空白的不同分支。 |
| #4 escaped opening bracket | PASS（原 finding 已关闭） | outer scanner 已实现 odd/even opener escape，focused regression 通过。Round 4 不要求新增完整 punctuation unescape。 |

Round 2 的 Architecture finite probe、subject-directory symlink、angle external/network raw form、fenced code、raw drive-letter、nested/reference 原 findings 也未被本轮反例重开。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Evidence / note |
| --- | --- | --- |
| AC1 | PASS | Fresh phase-owned subject directory evidence 未被本轮推翻。 |
| AC2 | PASS | 三个 canonical whole producer path 继续稳定。 |
| AC3 | **FAIL** | Destination/reference 分类、portable backslash 与 angle malformed 边界仍可误忽略、误消费或误阻断。 |
| AC4 | **FAIL** | Consumer 可被 duplicate/空 definition 与未选 index 错误影响。 |
| AC5 | **FAIL** | Destination pipeline 与 `selection=whole` 实现不符唯一 decision table。 |
| AC6 | PASS | Explicit-root authority 与 `legacy-compatible` fallback 未受影响。 |
| AC7 | PASS | Owner M finite probes 与 no-migration 约束仍闭环。 |
| AC8 | **FAIL** | Public docs 对 decode/portable/malformed/selection 的承诺与本轮 runtime 反例不一致。 |
| AC9 | PASS | Active fresh producer negative scan 未被本轮推翻。 |
| AC10 | **FAIL** | Current 48 focused fixtures 未覆盖本轮确认的 11 个最小反例变体。 |
| AC11 | PASS | Findings 仅针对 PRD/Epics/Architecture shared discovery，未扩展 Story 11.6+。 |

## Verification（验证）

- `npx vitest run test/artifact-document-discovery.test.ts`：PASS，`48/48`。
- `npx vitest run test/artifact-root-resolution.test.ts test/story-6-4-path-portability.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts test/docs-reference-cli-options.test.ts`：PASS，`41/41`。
- `npm run docs:check`：PASS，72 Markdown files / 5 drafts。
- Canonical source checker warn 与 `--mode strict`：均 `status=ok`、`findings=[]`；`changedPathCount=82`，impact 为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，`decisionRecordRequired=false`。
- Scoped `git diff --check`：PASS。
- Aggregator 临时项目最小复现确认：raw-colon/encoded-separator `2/2`、decoded external/network `2/2`、duplicate malformed `1/1`、empty definition `1/1`、raw/encoded backslash `2/2`、angle inner whitespace `2/2`、whole-selected broken-unselected index `1/1`；临时目录均已清理。
- 未运行 build、full suite 或 packaging；本 Aggregator 除本 summary 外未修改 source、tests、Story、tracker、SPEC/docs、progress logs 或其它 CR 文件。

## Caveats（限制与隔离）

- External `speclite-drawer-er-modeler`、`.agents/.claude` mirrors 与 fixed-count drift 不属于 Story 11.5 finding，未被纳入修复建议。
- Canonical checker 已确认两个 impacted governance classes 均为 D0 且无 finding。本 Aggregator 的唯一写入授权是本 summary，因此没有运行可能产生分类记录/定点修复的 governance runner；Root orchestrator 应在最终收口前完成该 runner 与 final checker。
- Focused/related tests 全绿只证明已登记的 48/41 cases，不能推翻已由 current runtime 复现的新边界。
- 本轮不授权 dependency upgrade、完整 CommonMark parser、link-title grammar、HTML/code-span/image-link 或 external fetch。

## Next Gate（下一门禁）

进入 fresh Evaluator Round 4。Evaluator 应独立裁决以上 6 个 P1 findings，并严格保持 bounded 修复范围：decode 后统一分类、duplicate 首定义权威、empty definition fail-closed、backslash portable rejection、angle body whitespace malformed，以及 whole selection 不验证未选 index。在 latest Reviewer 与 latest Evaluator 均通过前，Story 11.5 保持 `review`，不得执行 CR04、CR05 或 CR06。
