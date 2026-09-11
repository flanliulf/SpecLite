---
Story: 11-5
Round: 1
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-5-code-review-summary-20260904-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查共提出 5 项 finding：3 项高优先级 contract/runtime 边界，2 项局部 resolver 行为缺口。经独立核对 Story、`SPEC 07`、`SPEC 09`、Owner gate、current code/tests，5 项均不是误报；其中 #1、#4、#5 可在现有 contract 下进入 Fixer patch，#2、#3 需要 Owner 先裁决实现边界。AC7/AC10 仍未被当前实现和 fixture 完整关闭；本评估未修改源码、Story、SPEC、tracker、review summary、external drawer、packaging 或 mirror。

---

## 发现 #1 评估

### 审查原文

> **[高] Canonical whole/index 可通过 symlink 越出 authoritative boundary 后继续消费**
> - 来源：blind
> - 分类：decision_needed

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

当前 `resolveArtifactDocument()` 只用 `isReadableFile()` 判断 canonical whole 与 canonical `index.md` 是否存在（`src/config/artifact-document-discovery.ts:101-102`）。`isReadableFile()` 明确接受 symlink 且不做 `realpath` containment（`src/config/artifact-document-discovery.ts:411-416`）。相比之下，只有 index 声明的 shard target 会在读取后做 `realpath` 与 subject realpath 的 containment 校验（`src/config/artifact-document-discovery.ts:350-367`）。因此 canonical whole 或 canonical index 自身为 symlink 时，现有代码确实存在越界后仍 `continue` 的路径。

Contract 足以要求 fail closed：`SPEC 09` 将 canonical whole outputs 和 sharded `index.md` 约束在 phase-owned subject directory（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:80-84`），并要求 block result 时 `actualConsumedPath=null`、`consumedPaths=[]`、零 artifact write 与零 progress mutation（同文件 `98`）。`SPEC 07` 已有通用 `artifact-path.symlink-escape`（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:267-270`）。审查原文说 `broken-shard-reference` 对 canonical whole/index 自身映射未明确，这一点成立；但不需要新增 issue，也不应把 whole/index 自身逃逸塞进 `broken-shard-reference`，因为 `SPEC 07` 将 `broken-shard-reference` 限定为 `index.md` 声明的 shard 缺失、不可读或越界（同文件 `286-291`）。

**严重性判断：合理**

该缺口可让 consumer 读取 subject/project boundary 外内容，破坏 authoritative boundary、display-safe evidence 与 deterministic discovery，直接影响 AC4/AC5/AC10。评估为 P1 blocking patch。

**修复建议：可行**

Fixer 可在现有 contract 下修复：对 canonical whole 与 canonical index 自身做 `lstat/access/realpath`，并要求 target realpath 位于 subject realpath 内；越界时返回 `artifact-path.symlink-escape`，`actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`，并补 whole symlink escape、index symlink escape、in-bound symlink 和 zero-mutation fixtures。由合法 in-bound index 声明的 shard target 越界仍继续使用 `artifact-path.broken-shard-reference`。

**误报评估：非误报**

现有 source 与 SPEC 映射均支持该 finding；classification 从 `decision_needed` 调整为 `patch`，因为 stable issue 可直接使用 `artifact-path.symlink-escape`。

---

## 发现 #2 评估

### 审查原文

> **[高] Configured root 与实际 artifact location 不一致时误报 subject missing**
> - 来源：edge+auditor
> - 分类：decision_needed

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级，Owner 决策后）

### 评估分析

**问题描述准确性：准确**

当前 resolver 只检查传入 root 下的一个 subject directory：canonical whole、canonical index、同目录 Markdown candidates（`src/config/artifact-document-discovery.ts:101-156`）。若该 subject 下没有 whole 或 index，则返回 `artifact-path.subject-document-missing`（同文件 `156-173`）。`config-artifact-mismatch` 分支只覆盖调用者传入了错误 root field 的 helper misuse（同文件 `81-99`），不覆盖“root field 正确、explicit config 指向新 root、实际 workflow-owned artifact 仍在旧位置”的 public discovery 场景。现有 `test/artifact-document-discovery.test.ts` 只覆盖 subject/root field mismatch（`226-240`）和缺 `solutioning_artifacts` 时 Architecture `legacy-compatible` Planning fallback（`307-329`），没有覆盖 explicit-new-root-but-old-artifact。

Contract 要求 mismatch 诊断，但没有给 resolver 足够实现边界。`SPEC 09` 要求 existing explicit roots 继续权威、缺 `solutioning_artifacts` 时 Architecture 才按 Planning fallback 标记 `legacy-compatible`，且 config root 与实际 artifact location 不一致时使用 `artifact-path.config-artifact-mismatch` block，不得搜索第二 root 作为隐式 fallback（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`）。`SPEC 07` 也定义了 `config-artifact-mismatch` details（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:284`）。但两者均未定义 Story 11.5 subject documents 的 bounded diagnostic candidate set，也未定义 trusted caller 如何向 artifact-documents resolver 传入 actual-path evidence。

**严重性判断：合理**

该问题直接导致 AC7 的 stable diagnostic 与 AC10 mismatch fixture 不成立。由于自动搜索第二 root 会与 no-fallback/no-migration 冲突，必须先 Owner decision，不能让 fixer凭猜测扩张搜索范围。

**修复建议：可行但需要 Owner 决策**

Owner 需先选择最小边界之一：

1. **Trusted actual-path evidence 输入**：`artifact-documents` public surface 或其 trusted caller 显式传入 observed actual artifact path；resolver 只做 project-relative POSIX、subject/type、readability 与 no-consumption 校验，然后返回 `artifact-path.config-artifact-mismatch`。
2. **Contract-owned finite probe set**：为 PRD、Epics、Architecture 分别列出只读 diagnostic candidates。最小集建议区分：Architecture 在缺 `solutioning_artifacts` 时的 `legacy-compatible` Planning fallback 已是 solutioning；但 explicit `solutioning_artifacts` 存在而 artifact 留在 `{planning_artifacts}/architecture/` 时是 mismatch，不是 fallback。PRD/Epics 旧 root-level `{planning_artifacts}/prd.md`、`{planning_artifacts}/epics.md` 是否纳入 diagnostic evidence 必须由 Owner 明确。

两种方案都必须禁止把 probe 结果作为 fallback 继续消费，且保持 `actualConsumedPath=null`、`consumedPaths=[]`、零 artifact write 与零 progress mutation。

**误报评估：非误报**

现有 production-like resolver 路径确实无法报告该 mismatch；但修复授权需停在 Owner 问题，不可直接 patch 搜索范围。

---

## 发现 #3 评估

### 审查原文

> **[高] `index.md` 支持的 local Markdown link grammar 未定义，当前实现会静默少消费**
> - 来源：blind+edge
> - 分类：decision_needed

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级，Owner 决策后）

### 评估分析

**问题描述准确性：准确**

当前 parser 是手写 inline-link regex（`src/config/artifact-document-discovery.ts:376-391`），不解析 reference-style link definitions。它先用 `reference.split("#", 1)[0].endsWith(".md")` 筛选，再在 shard resolution 中 decode 并只剥离 fragment（同文件 `343-345`）。因此 query-bearing destination 如 `z.md?raw=1` 会在 `.endsWith(".md")` 前被忽略，percent-encoded extension 如 `z%2Emd` 也会被忽略，reference-style local Markdown link 不会进入 `references`。忽略结果仍可返回 `sharded-only` continue（同文件 `228-235`），而不会产生 stable issue。

Contract 没有天然把 CommonMark 全量 grammar 纳入支持集。`SPEC 09` 只说 `index.md` 及其“明确声明的 shard links”（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:84`、`91`），没有定义 reference-style、query、fragment、percent-decoding、angle destination、malformed destination、unsupported-but-local destination 的支持/拒绝策略。现有 `test/artifact-document-discovery.test.ts` 只覆盖 inline relative link 与 fragment（`59-87`），未覆盖审查列出的三类 grammar。

**严重性判断：合理**

静默少消费会让 resolver 构造不完整文档并仍 `continue`，影响 AC3/AC4/AC5/AC10。由于 parser 行为会成为 public workflow contract，必须由 Owner 先定义，不应由 fixer按实现便利决定支持集。

**修复建议：可行但需要 Owner 决策**

Owner 需裁决最小 grammar：

1. **Minimal inline-only contract**：只支持 CommonMark inline link destination 的 project-relative `.md` path，可支持 `#fragment`；reference-style、query-bearing、percent-encoded path、malformed percent-encoding 均作为 unsupported local shard reference block。可复用 `artifact-path.broken-shard-reference` 并在 `details.referenceKind` 标明 `unsupported-link-syntax` / `malformed-link-destination`，或要求 `SPEC 07` 新增更精确 issue。
2. **Parser-backed CommonMark subset**：支持 inline 与 reference-style link definitions；按明确顺序先解析 Markdown destination，再剥离 query/fragment，再 percent-decode filesystem path，并定义 decode error 为 block。仍必须拒绝 external scheme、network-path 与 subject 外 path。

Fixer 在 Owner 选择前不得把这些语法自动定义为 supported 或 ignored。Owner 决策后需要补 supported/rejected syntax fixtures，并断言 unsupported/malformed local Markdown reference 不会静默 continue。

**误报评估：非误报**

current parser 与测试覆盖均支持该 finding；decision_needed 分类准确。

---

## 发现 #4 评估

### 审查原文

> **[低] Resolver 对 declared shards 做 alphabetical sort，改写 index 声明顺序**
> - 来源：blind
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`resolveDeclaredShards()` 在收集 resolved paths 后执行 `return { ok: true, paths: [...new Set(resolvedPaths)].sort(...) }`（`src/config/artifact-document-discovery.ts:373`）。这会把 index 中的 first-declaration order 改成 alphabetical order。`SPEC 09` 的 valid sharded-only 行为是消费 `index.md` 及其明确声明的 shards（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:91`），Story 11.5 也要求 shards 保持在 subject directory，consumer 不得自行定义 precedence（`_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md:15-29`）。声明顺序是 sharded document 的内容顺序，resolver 没有 contract 授权重新排序。

**严重性判断：偏低**

审查原文标为低，但该行为会改变 consumer 输入顺序，可能改变 PRD/Epics/Architecture 的章节语义，并影响 AC3/AC4 的可信度。评估提升为 P1 patch，因为这是明确 implementation mismatch，且修复范围小。

**修复建议：可行**

Fixer 可直接 patch：保留 first occurrence order，只做 first-declaration dedupe，不做 alphabetical sort。`extractLocalMarkdownReferences()` 若继续 dedupe，也应确认 dedupe 保持 first occurrence。补充逆字母顺序、重复声明 fixture，并确认 `consumedPaths` 为 `[index.md, ...declaredShardPaths]` 且顺序与 index 一致。

**误报评估：非误报**

源码存在排序；现有测试只用 alphabetical 顺序 `goals.md`、`requirements.md`（`test/artifact-document-discovery.test.ts:59-85`），没有暴露该缺口。

---

## 发现 #5 评估

### 审查原文

> **[低] Index self-link 被当作 shard，导致 `consumedPaths` 重复包含 `index.md`**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`resolveDeclaredShards()` 对每个 local Markdown reference 做 path containment 与 readability 校验后直接 push 到 `resolvedPaths`（`src/config/artifact-document-discovery.ts:343-370`），没有排除 target 等于 canonical `index.md`。随后 sharded-only 和 explicit sharded selection 都把 `shardedIndexPath` prepend 到 declared shard list（同文件 `202-205`、`228-233`），因此 index self-link 会造成 `consumedPaths` 重复包含 `index.md`。`SPEC 09` 明确区分 canonical `index.md` 和其声明的 shards（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:84`、`91`）；index 本身不是 shard。

**严重性判断：偏低**

审查原文标为低，但 duplicate `consumedPaths` 破坏 resolver evidence 与 consumer load contract，属于 AC3/AC4/AC10 的直接缺口。评估提升为 P1 patch。它不需要 Owner 新增 issue，因为用户请求的是 exclude self-link，且现有 contract 已足够说明 index 不是自己的 shard。

**修复建议：可行**

Fixer 可直接 patch：将 resolved target 等于 canonical index path 的 reference 从 `declaredShardPaths` 中确定性排除，避免重复消费；同时补 direct self-link、normalized self-link（`./index.md`）和 repeated self-link fixtures。若 fixer认为 self-link 应 block 而非 exclude，需要先回到 Owner，因为 `SPEC 07` 的 `broken-shard-reference` 当前只列出缺失、不可读、越出 subject directory（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:286-291`），没有明确 self-reference issue 映射。

**误报评估：非误报**

源码路径与 `consumedPaths` 构造方式均支持该 finding；现有 tests 没有覆盖 self-link。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | canonical whole/index symlink escape | [高] | **P1** | 现有 SPEC 足以要求 subject-boundary fail closed；使用 `artifact-path.symlink-escape`，不是 `broken-shard-reference`，无需新 issue。 |
| 4 | declared shards 被 alphabetic sort | [低] | **P1** | 改写 index declaration order，影响 sharded document 语义与 consumer 输入顺序。 |
| 5 | index self-link 被重复消费 | [低] | **P1** | index 不是自己的 shard；应确定性 exclude self-link 并补 fixture。 |

### 需要 Owner 决策后修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | Owner 必须裁决 |
|---|------|----------|-----------|---------------|
| 2 | configured root 与 actual artifact location mismatch 误报 missing | [高] | **P1** | 选择 trusted actual-path evidence 输入，或定义 PRD/Epics/Architecture 的 finite diagnostic candidate set；不得隐式 fallback 消费。 |
| 3 | `index.md` local Markdown link grammar 未定义且静默少消费 | [高] | **P1** | 定义 inline/reference-style/query/fragment/percent-decoding/decode-error 的支持或拒绝策略，以及 unsupported/malformed stable issue。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。5 项均影响 Story 11.5 的 current delivery gate，不建议降级为 CR TODO。

### 可忽略（误报）

无。

### 精确 Fixer 授权

- **授权修复 #1**：仅修改 Story 11.5 artifact document discovery runtime/tests/docs 中与 canonical whole/index symlink fail-closed 直接相关的范围；canonical whole/index 自身 symlink escape 使用 `artifact-path.symlink-escape`；合法 index 声明的 shard target 越界继续使用 `artifact-path.broken-shard-reference`；必须保持 block `actualConsumedPath=null`、`consumedPaths=[]` 与 zero mutation。
- **授权修复 #4**：仅移除 declared shard alphabetical sort，保留 first-declaration order 和 first-occurrence dedupe；补逆序与重复声明 fixture。
- **授权修复 #5**：仅排除 index self-link，不重复加入 `declaredShardPaths` / `consumedPaths`；补 direct、`./index.md`、重复 self-link fixture。若要改为 block，必须先取得 Owner issue-mapping 决策。
- **不得修复 #2**：在 Owner 裁决前，不得新增隐式第二 root search、不得把旧 root artifact 当作 fallback 消费、不得把 PRD/Epics root-level 或 Architecture Planning legacy 位置硬编码为 mismatch candidates。
- **不得修复 #3**：在 Owner 裁决前，不得擅自引入 CommonMark parser、支持或拒绝 reference-style/query/percent-encoded destinations，也不得继续静默忽略 unsupported local Markdown links。
- **边界**：不得修改 Story、`SPEC 07`、`SPEC 09`、sprint tracker、flow gates、CR rules、CR TODO、external drawer、packaging manifest、`.agents`/`.claude` mirrors、commit 或 push，除非 Owner/Root orchestrator 另行授权。

### Owner 问题

1. 对 Story 11.5 `config-artifact-mismatch`，请选择实现边界：A) trusted caller 显式传入 actual-path evidence；B) `SPEC 09` 定义有限只读 diagnostic candidate set。若选 B，请逐 subject 明确 PRD/Epics 旧 root-level `{planning_artifacts}/prd.md` / `{planning_artifacts}/epics.md` 是否纳入，以及 explicit `solutioning_artifacts` 存在时 `{planning_artifacts}/architecture/architecture.md` 是否只作为 mismatch evidence。
2. 对 `index.md` local Markdown link grammar，请选择支持集：A) minimal inline-only relative `.md` path（可含 fragment），其它 local-ish forms block；B) parser-backed CommonMark subset，支持 reference-style，并明确 query/fragment stripping、percent-decoding 顺序与 decode-error block 语义。若 unsupported/malformed 需要新 stable issue，请先更新 `SPEC 07`；否则可用 `artifact-path.broken-shard-reference` 加 `referenceKind`。

### 评估决定

- **发现 #1（canonical whole/index symlink escape）**：确认有效；从 decision_needed 调整为 patch；P1；Fixer 可直接修。
- **发现 #2（config-vs-actual legacy mismatch）**：确认有效；decision_needed 保持；P1；Owner 裁决前 Fixer 不得修。
- **发现 #3（Markdown link grammar）**：确认有效；decision_needed 保持；P1；Owner 裁决前 Fixer 不得修。
- **发现 #4（preserve declaration order）**：确认有效；patch；从原始低严重性提升为 P1；Fixer 可直接修。
- **发现 #5（exclude index self-link）**：确认有效；patch；从原始低严重性提升为 P1；Fixer 可直接修 exclude 方案。

**Overall verdict（整体裁决）**：`FAIL`。Story 11.5 不得进入 CR04/CR05/CR06 或 `done` finalizer。下一步应先让 Owner 回答 #2/#3；随后 fresh Fixer 仅修 evaluation-approved 范围，且必须先实现 #1/#4/#5 与 Owner-approved #2/#3 后再进入复审。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 5

#### Fix Scope（修复范围）

- #1 canonical whole/index 自身新增 `lstat`、readability 与 `realpath` subject containment；escape 使用既有 `artifact-path.symlink-escape` block，result `actualConsumedPath=null`、`consumedPaths=[]`，合法 in-bound canonical index symlink 继续可消费。
- #2 按 Owner M 采用 finite read-only diagnostic probes：PRD/Epics root-level legacy whole；Architecture root-level Planning whole 与 explicit `solutioning_artifacts` 下 Planning architecture subject whole/index。Probe 命中仅返回 `artifact-path.config-artifact-mismatch` evidence 和 block，不 fallback 消费、不迁移、不写入。
- #3 按 Owner L 实现无 dependency upgrade 的 bounded Markdown link grammar：支持 inline 与 reference-style local Markdown links；destination 按 parse、strip query/fragment、single percent-decode、portable/subject containment/readability 顺序处理；malformed、undefined、unsupported local-ish references 使用 `artifact-path.broken-shard-reference` 并记录 `referenceKind`；external scheme/network links 不作为 shard。
- #4 declared shards 改为保留 first-declaration order 与 first-occurrence dedupe，不再 alphabetical sort。
- #5 direct、normalized 与 repeated `index.md` self-link 确定性 exclude，不重复进入 `declaredShardPaths` 或 `consumedPaths`，不改为 block。

#### Files Changed（修改文件）

- Runtime/CLI/schema surface：`src/config/artifact-document-discovery.ts`、`src/commands/resolve.ts`
- Focused fixtures/tests：`test/artifact-document-discovery.test.ts`
- Contract/docs sync：`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`、`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`、`docs/reference/cli.md`、`docs/reference/workflow-artifact-layout.md`

#### Verification（验证）

- `npm test -- test/artifact-document-discovery.test.ts`：PASS，29 tests passed。
- `npm run build`：PASS。
- `npm test -- test/artifact-root-resolution.test.ts test/resolve-readers.test.ts test/story-6-4-path-portability.test.ts test/artifact-path-validation.test.ts`：PASS，34 tests passed。
- `npm run docs:check`：PASS，72 Markdown files / 5 drafts。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`：PASS，status `ok`，findings `[]`。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict`：PASS，status `ok`，findings `[]`。
- `npm run release:packaging-check`：PASS。
- `git diff --check`：PASS。
- `npm test`：FAIL with 522 passed / 4 todo / 12 failed；失败均为 existing canonical package count drift（expected `core=18,total=68`，actual checker/runtime `core=19,total=69`，ecosystem totals同步 +1），未发现 artifact-document resolver 新增失败。

#### Boundary（边界）

本轮未修改 Story/tracker/flow gates、CR rules/TODO、CR04-06、external drawer、packaging manifest、`.agents`/`.claude` mirrors，未 commit/push。Full suite 的 68/69 baseline drift 属既有 canonical source count 对齐问题，不在 11.5 Round 1 Fixer 授权内。
