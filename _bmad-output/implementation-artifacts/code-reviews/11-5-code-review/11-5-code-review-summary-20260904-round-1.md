---
Story: 11-5
Round: 1
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

首轮审查，三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级）。独立复现确认：canonical whole/index 可经 symlink 越出 subject/project boundary 后仍被接受；configured root 与已存在 artifact 的 mismatch 被误报为普通 missing；当前 Markdown link parser 会静默忽略 reference-style、query-bearing 与 percent-encoded local Markdown destinations；此外声明顺序被排序改写，index self-link 会重复进入 `consumedPaths`。

Acceptance Auditor 判定 `FAIL`，明确将 AC7/AC10 mismatch 缺口列为 blocking；综合三层后，symlink 与 link-grammar 缺口还影响 AC3/AC4/AC5/AC10 的可信度。虽然现有 focused suite 通过，但它没有覆盖这些已复现路径。本轮结论为 **FAIL**，应进入 Evaluator；其中三个 contract 边界需要 Owner 决策，两个局部行为可直接 patch。

## Layer Provenance（三层来源）

| Layer | Status | Formal result | Incorporated evidence |
| --- | --- | --- | --- |
| Blind Hunter | PASS（层执行成功） | 3 findings | canonical entry symlink escape、declared shard order、reference-style links |
| Edge Case Hunter | PASS（层执行成功） | 3 findings | config/artifact mismatch、query/percent-encoded links、index self-link |
| Acceptance Auditor | PASS（层执行成功） | `FAIL` / 2 blocking gaps | AC7/AC10 mismatch fixture/behavior 缺失；其余 AC 在该层检查中通过 |

`PASS（层执行成功）`只表示该审查层成功产出结果，不表示 Story 通过。三层 findings 已由本 aggregator 独立复现、语义去重并重新分类。

## Acceptance Matrix（验收矩阵摘要）

| AC | Auditor result | Aggregated result | Evidence / note |
| --- | --- | --- | --- |
| AC1 | PASS | PASS | fresh subject directories 有 runtime/corpus evidence。 |
| AC2 | PASS | PASS | three canonical whole producer paths 已锁定。 |
| AC3 | PASS | FAIL | self-link、声明顺序改写与未定义 link grammar 使“index 明确声明 shards”的实现边界不完整。 |
| AC4 | PASS | FAIL | resolver 对若干有效/待定义的 index link shape 静默少消费；canonical entry symlink 可越界消费。 |
| AC5 | PASS | FAIL | decision table 已写入 owning SPEC，但 entry-boundary 与 link grammar 尚无完整 branch/issue mapping。 |
| AC6 | PASS | PASS | Architecture 缺 `solutioning_artifacts` 的 `legacy-compatible` Planning fallback 已覆盖。 |
| AC7 | FAIL | FAIL | actual artifact 位于另一已知 workflow location 时未产生 `config-artifact-mismatch`。 |
| AC8 | PASS | PASS | producer/consumer guidance 与 public surface 已同步。 |
| AC9 | PASS | PASS | active negative scan evidence 存在。 |
| AC10 | FAIL | FAIL | mismatch、canonical entry symlink、link grammar/order/self-link fixtures 缺失。 |
| AC11 | PASS | PASS | scope 保持 PRD/Epics/Architecture。 |

## New Findings（新发现）

### 1. [高] Canonical whole/index 可通过 symlink 越出 authoritative boundary 后继续消费

- **来源**：blind
- **分类**：decision_needed
- **Story ownership**：Story 11.5 owned

- **证据**
  - `src/config/artifact-document-discovery.ts:101-102` 仅通过 `isReadableFile` 判断 canonical whole/index 是否存在；`src/config/artifact-document-discovery.ts:411-416` 明确把 symbolic link 当作可读文件，却未对其 `realpath` 做 subject/project containment 校验。
  - 相比之下，只有 index 声明的 shard target 在 `src/config/artifact-document-discovery.ts:350-367` 做了 realpath containment。
  - 独立复现：把 `prd/prd.md` symlink 到 subject 外文件，结果仍为 `ok=true`、`whole-only`；把 `prd/index.md` symlink 到 subject 外文件，结果仍为 `ok=true`、`sharded-only`，均无 issue。
  - `SPEC 09:84-96` 要求 canonical document 位于 authoritative subject directory，并明确 symlink escape 必须 block；`SPEC 07:267-270,286-293` 同时存在通用 `artifact-path.symlink-escape` 与 shard-reference 专用 `artifact-path.broken-shard-reference`，但未明确 canonical whole/index 自身逃逸的 ID 映射。

- **影响**
  - Consumer 按 `consumedPaths` 读取时可能读取 target project/subject directory 之外的内容，违反 authoritative root、path safety 与 deterministic discovery contract。

- **建议**
  - Owner 明确 stable ID mapping 后，对 canonical whole 和 canonical index 自身执行 realpath containment；block 结果必须保持 `actualConsumedPath=null`、`consumedPaths=[]` 和零 mutation。
  - 推荐裁决：canonical whole/index 自身 symlink escape 使用通用 `artifact-path.symlink-escape`；由合法 in-bound index 声明、但最终 shard realpath 越界的情况继续使用 `artifact-path.broken-shard-reference`。
  - 增加 whole symlink escape、index symlink escape、in-bound symlink 与 zero-mutation fixtures。

### 2. [高] Configured root 与实际 artifact location 不一致时误报 subject missing

- **来源**：edge+auditor
- **分类**：decision_needed
- **Story ownership**：Story 11.5 owned

- **证据**
  - `src/config/artifact-document-discovery.ts:101-173` 只检查 resolver 已选择的一个 subject directory；若该处无 whole/index，直接返回 `artifact-path.subject-document-missing`，没有只读 mismatch probe 或 caller-supplied actual-location reconciliation。
  - `src/config/artifact-document-discovery.ts:81-99` 的现有 mismatch 分支只覆盖调用者把错误 root field 直接传入 helper，不覆盖 public CLI 正常选择正确 field、但 artifact 实际位于另一 workflow-owned location 的场景。
  - 独立复现：Architecture root 为 `configured/solutioning`，实际文件存在于 `legacy/planning/architecture/architecture.md`，结果为 `artifact-path.subject-document-missing`，未返回 `artifact-path.config-artifact-mismatch`。
  - `SPEC 09:100` 和 `SPEC 07:284` 要求 config root 与实际 artifact location 不一致时用 `artifact-path.config-artifact-mismatch` 只读诊断并 block；但 contract 同时禁止“搜索第二 root 作为隐式 fallback”，且没有列出 mismatch diagnostic 的 bounded candidate locations 或显式 actual-path 输入来源。

- **影响**
  - AC7/AC10 的 stable diagnostic 不成立；用户无法区分“文档确实不存在”和“文档存在但配置与位置不一致”，也无法获得 contract 要求的 `configuredRoot/resolvedRoot/actualConsumedPath` reconciliation evidence。

- **建议**
  - Owner 先裁决 mismatch 发现边界：要么定义每个 subject 的有限、只读 diagnostic candidate set；要么为 trusted caller 定义显式 actual-path evidence 输入。无论哪种方式，都不得把 probe 结果当作隐式 fallback 或继续消费。
  - 增加 PRD、Epics、Architecture explicit-root mismatch、Architecture legacy/default mismatch、多个候选冲突及 zero-mutation fixtures。

### 3. [高] `index.md` 支持的 local Markdown link grammar 未定义，当前实现会静默少消费

- **来源**：blind+edge
- **分类**：decision_needed
- **Story ownership**：Story 11.5 owned

- **证据**
  - `src/config/artifact-document-discovery.ts:376-391` 使用只识别 inline links 的正则，并在 URI decode 与 query stripping之前用 `.endsWith(".md")` 筛选。
  - 独立复现：`[Z][z]` + `[z]: z.md`、`[Z](z.md?raw=1)`、`[Z](z%2Emd)` 三种 index 均返回 `ok=true`、`sharded-only`，但 `declaredShardPaths=[]`、`consumedPaths` 只有 `index.md`；实际存在的 `z.md` 被静默遗漏。
  - `SPEC 09:84-96` 只称 `index.md` 中“明确声明的 shard links”，没有明确限定为 inline-only，也没有定义 query、percent-encoding、reference-style links 的支持/拒绝策略。

- **影响**
  - 不同合法或常见 Markdown 写法会让 resolver 静默构造不完整文档；更严重的是结果仍标记为 continue，而非可诊断 block。

- **建议**
  - Owner 明确最小 link grammar：是否支持 CommonMark reference-style destinations、是否把 query/fragment 从 filesystem target 剥离、何时 percent-decode、以及 unsupported/malformed local Markdown link 是忽略还是用 stable issue block。
  - 在裁决前不得凭实现便利把这些形式自动定义为 supported 或 unsupported；裁决后使用 parser-backed 或有明确 grammar 的实现，并为每种 accepted/rejected syntax 建立 fixtures。

### 4. [低] Resolver 对 declared shards 做 alphabetical sort，改写 index 声明顺序

- **来源**：blind
- **分类**：patch
- **Story ownership**：Story 11.5 owned

- **证据**
  - `src/config/artifact-document-discovery.ts:368-373` 在收集 index references 后执行 `new Set(...).sort(localeCompare)`。
  - 独立复现：index 按 `z.md`、`a.md` 顺序声明，结果 `declaredShardPaths`/`consumedPaths` 却为 `a.md`、`z.md`。
  - `SPEC 09:84,91,93` 定义 consumer 消费 index “明确声明的 shards”；文档章节顺序是 index 声明的一部分，未授权 resolver 重新排序。

- **影响**
  - PRD、Epics、Architecture 的组合读取顺序可能变化，导致章节语义、叙事结构或后续分析输入顺序偏离 index。

- **建议**
  - 保留 first-declaration order，仅做稳定的 first-occurrence dedupe，不做 alphabetical sort；增加逆字母顺序和重复声明 fixture。

### 5. [低] Index self-link 被当作 shard，导致 `consumedPaths` 重复包含 `index.md`

- **来源**：edge
- **分类**：patch
- **Story ownership**：Story 11.5 owned

- **证据**
  - `src/config/artifact-document-discovery.ts:343-370` 未排除 resolved target 等于 canonical `index.md`；`src/config/artifact-document-discovery.ts:228-233` 再把 index prepend 到 declared shard list。
  - 独立复现：index 声明 `[Index](index.md)` 和 `[Z](z.md)` 时，`declaredShardPaths` 包含 index，`consumedPaths` 为 `[index.md, index.md, z.md]`，结果仍 `ok=true`。
  - `SPEC 09:84,91` 区分 canonical `index.md` 与其声明的 shards；index 本身不是自己的 shard。

- **影响**
  - Consumer 可能重复加载 index 内容；若消费方递归解释 links，还会产生更复杂的重复/循环风险。

- **建议**
  - 将 self-reference 判为无效 shard reference并用 `artifact-path.broken-shard-reference` block，或至少从 declared shards 中确定性排除；为避免静默接受 malformed shape，推荐前者。
  - 增加 direct self-link、normalized self-link（如 `./index.md`）和重复 link fixtures。

## Owner Questions（Owner 待裁决）

1. Canonical whole/index 自身通过 symlink 越出 authoritative subject/project boundary 时，是否统一使用 `artifact-path.symlink-escape`；而仅 shard target 越界时继续使用 `artifact-path.broken-shard-reference`？
2. `config-artifact-mismatch` 的只读探测范围是什么：contract-owned有限候选路径，还是 trusted caller 显式提供的 actual path？哪些 legacy/default locations允许作为诊断证据但绝不能作为 fallback 消费？
3. `index.md` 的 local link grammar 是否要求支持 CommonMark reference-style links、query-bearing destinations 与 percent-encoded path；若某种形式不支持，应使用哪个 stable issue 和 continuation，而不是静默忽略？

## Validation Summary（验证摘要）

- `npx vitest run test/artifact-document-discovery.test.ts`：✅ 1 file / 17 tests passed；该绿色结果同时证明现有 suite 未覆盖上述复现。
- 独立定向复现：❌ 7/7 candidate scenarios 均复现（declared order、reference-style、query-bearing、percent-encoded extension、index self-link、whole symlink escape、index symlink escape）；另有 1 个 configured-vs-actual mismatch 场景复现错误 stable issue。
- `git diff --check`（Story 11.5 runtime/spec/test scoped paths）：✅ passed。
- `npm test`：本 aggregator 未重跑 full suite；Acceptance layer 报告其 focused 34 与 CLI 20 tests 通过，completion gate 的隔离 full evidence为 522 passed / 4 todo。Live full/canonical fixed-count drift属于 external drawer，不作为 Story 11.5 成功证据。
- `npm run lint`：未执行；项目 `package.json` 未定义 `lint` script。
- `npm run build`：按本 aggregator 的明确 no-build/no-packaging 约束未执行；completion gate记录既有 ESM/DTS build通过，但不能覆盖本轮新复现缺口。

## Packaging Side-effect Caveat（Packaging 副作用说明）

Acceptance Auditor误运行了 `release:packaging-check`。当前 `release/packaging-manifest.json` 相对 HEAD 为 modified（`11` insertions / `1` deletion），diff包含 external `speclite-drawer-er-modeler` entries 与 `packageHash` 更新。Aggregator开始时该文件已经是 modified，缺少该误运行前的独立 hash/snapshot，因此不能诚实归因哪些字节由该命令新产生；此项记录为 process caveat，不计入 Story finding，也未由本 aggregator修复或回滚。Root orchestrator应按 mixed-worktree ownership审计并保留用户/外部变更。

## Passed / Dismissed Items（通过与排除项）

- Owner批准的 `SPEC 09` decision table 与 `SPEC 07` 四个 discovery stable IDs 已落盘，kickoff current result为 `PASS`。
- whole-only、inline-link sharded-only、whole+sharded ambiguity/selection、missing index、missing/outside shard、subject missing、Architecture legacy-compatible fallback和zero-mutation现有 happy/negative fixtures通过。
- 九个 in-scope consumer guidance均引用共享 `speclite resolve artifact-documents` surface与 `consumedPaths`；未发现另起 precedence实现。
- External `assets/source/speclite/core-skills/speclite-drawer-er-modeler*`、fixed-count drift和由其引出的 canonical/packaging findings不属于 Story 11.5，本轮 `dismiss`，不得由后续 Fixer顺带修改。
- Acceptance Auditor的 packaging误运行是流程副作用 caveat，不提升或降低本轮代码 finding severity。

## Final Decision（最终结论）

- **结论：FAIL**
- **阻塞项**：Finding #1、#2、#3（Owner/contract decisions）；它们关闭并修复前不得进入 CR04/CR05/CR06 或将 Story标记为 `done`。
- **明确 patch**：Finding #4、#5。
- **是否进入 Evaluator**：是。Evaluator应独立判定 findings真实性、P1/P2和 Owner问题；只有 evaluation-approved范围可交给 fresh Fixer。
