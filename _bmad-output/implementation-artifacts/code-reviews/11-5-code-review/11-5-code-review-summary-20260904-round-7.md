---
Story: 11-5
Round: 7
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Round 7 三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级）。Blind 报告 1 个 P1 与 1 个 P2 candidate，Edge 与 Acceptance 各报告同一个 P1 candidate。Aggregator 独立检查 Story、Round 6 summary/evaluation/fix record、current source/tests、`SPEC 07`、`SPEC 09` 与 public guidance，并用已清理的临时项目复现两个候选。

最终确认 **2 个去重 findings**。Finding #1 是 P1 blocker：declared shard 的 lexical entry 虽要求为 file/symlink，但 symlink 通过 containment 后没有验证 dereferenced final target 仍为 regular file，导致 directory 等 non-regular target 被写入 `declaredShardPaths` / `consumedPaths` 并错误 continue；既有 `broken-shard-reference` / `unreadable-shard` mapping 唯一，无需 Owner 决策。Finding #2 保持 P2：missing-index candidate scan 用 `Dirent.isFile()` 排除 lexical `.md` symlink，至少会把 subject 内 symlink→readable regular file 的真实 shard candidate误报为 subject missing；但所有已复现场景仍 fail closed、空消费且零 mutation，且 owning contract没有唯一规定 undeclared candidate symlink 对 outbound、broken、directory targets应按 lexical entry计数还是先做target safety分类，因此 Reviewer不得自行扩写完整策略。

本轮总体结论为 **FAIL**。必须先由 fresh Evaluator 裁决；Finding #1 修复并经 fresh Reviewer/Evaluator 关闭前，不得进入 CR04、CR05 或 CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 1 P1 + 1 P2 | Finding #1 与 #2 均确认可由 current source 控制流及独立复现支持。 |
| Edge Case Hunter | PASS | `FAIL` / 1 P1 | Finding #1 确认有效：declared shard symlink 的 final target type 未验证。 |
| Acceptance Auditor | PASS | `FAIL` / 1 P1 | Finding #1 直接破坏 AC4/AC5/AC8/AC10 的“只消费可读 declared shards”与 stable block contract。 |

## Findings（去重发现）

### 1. [P1 / PATCH] Declared shard symlink 未验证最终 target 为 regular file

- **Source**：Blind Hunter、Edge Case Hunter、Acceptance Auditor；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:344-381`；`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:290,293`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:96,101,103`
- **Evidence**：`resolveDeclaredShards()` 对 target 执行 lexical `lstat`，允许 regular file 或 symlink；随后执行 `access`、`realpath` 与 subject containment，却未对 dereferenced target执行 `stat(...).isFile()` 或等价regular-file检查。与已修复的 canonical entry shared helper不同，该路径仍可把 subject内symlink→directory/FIFO/其它non-regular target判为valid declared shard。
- **Independent reproduction**：合法 `index.md` 声明 `chapter.md`，而 `chapter.md` 是指向subject内directory的symlink；resolver返回 `ok=true`、`discoveryShape=sharded-only`、`continuation=continue`，并把 `chapter.md` 同时加入 `declaredShardPaths` 与 `consumedPaths`。
- **Impact**：消费者收到并被授权消费一个non-regular path；这既不是真实的“可读 shard”，也没有返回既有 structured block。FIFO 等target还可能把阻塞I/O风险留给下游reader。影响 AC4、AC5、AC8、AC10。
- **Deterministic mapping**：无需新增stable ID或Owner决策。Declared shard symlink最终target非regular/unreadable时复用 `artifact-path.broken-shard-reference` / `reason=unreadable-shard` / `referenceKind=unreadable-shard`，`discoveryShape=invalid-sharded`、`actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`。Subject内symlink→readable regular file继续合法；subject外target继续映射既有 `outside-subject-directory`。
- **Required fixtures**：declared shard symlink→directory与FIFO；至少覆盖 direct/reference-style declaration、重复调用稳定性、schema、安全relative evidence、无raw/absolute泄露及zero mutation。同时保留in-bound symlink→regular file continue与outbound symlink block fixtures。

### 2. [P2 / DECISION_NEEDED] Missing-index candidate scan 忽略 lexical `.md` symlink

- **Source**：Blind Hunter；Aggregator 独立确认并保留下调后的P2严重性
- **Location**：`src/config/artifact-document-discovery.ts:163-220,703-732`；`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:289`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:95,99`
- **Evidence**：`listMarkdownFiles()` 只在 `entry.isFile() && name.endsWith(".md")` 时记录candidate；`readdir(..., { withFileTypes: true })` 对symlink返回 `isSymbolicLink()`，因此 lexical `.md` symlink会被静默忽略。
- **Independent reproduction**：whole/index均不存在，subject内 `chapter.md` symlink指向同subject内readable regular `real-target.txt`；resolver返回 `artifact-path.subject-document-missing` / `subject-document-missing`，而相同可读内容若为regular `chapter.md` 会走 `artifact-path.invalid-sharded-document-shape` / `shards-without-index`。
- **Validity boundary**：至少“subject内 lexical `.md` symlink→subject内readable regular file”成立，因为current contract与runtime已明确允许安全的 canonical/declared shard symlink代表Markdown artifact。它不能因Node `Dirent.isFile()`实现细节而从candidate set消失。
- **Severity**：保持P2。Current outcome仍为structured `block`、`actualConsumedPath=null`、`consumedPaths=[]`，未发现错误continue、越界读取或mutation；缺陷主要是 discoveryShape/stable diagnostic truth以及可能的mismatch优先级错误，低于Finding #1的消费安全破坏。
- **Decision boundary**：现有contracts没有唯一规定 missing-index candidate enumeration 对 symlink→outbound regular、broken target、directory/FIFO target应仅凭lexical `.md` entry计为candidate，还是先做target containment/readability/regular-file分类。不得凭“policy consistency”把canonical/declared entry规则自动推广到所有undeclared candidate。Fresh Evaluator应决定：(a) 只授权已唯一成立的in-bound readable regular symlink candidate窄修；(b) 作为P2登记CR TODO；或 (c) 若要求一次性定义全部symlink candidate taxonomy，则进入最小Owner Gate。Reviewer不授权新增ID、通用filesystem framework、symlink-directory递归或index-present scan。
- **Required fixtures（若获授权）**：至少覆盖in-bound readable regular symlink→`shards-without-index`；并按Evaluator/Owner裁决明确outbound、broken、directory target行为。所有结果保持安全relative evidence、zero mutation；index-present仍不得扫描undeclared subtree。

## Candidate Rejections（候选驳回）

无。三层候选均有current source证据。Finding #2没有提升为P1，也没有擅自把未定义的所有candidate-symlink target类别归入同一修复规则。

## Round 6 And Historical Closure（Round 6 与历史闭环）

| Prior item | Round 7 result | Evidence |
| --- | --- | --- |
| Round 6 #1 canonical whole/index与M probe final-target regular-file | PASS（原finding保持关闭） | `inspectReadableSubjectFile()` 已在realpath containment后执行dereferenced `stat(...).isFile()`；93项focused fixtures覆盖whole/index/probe non-regular与合法regular symlink。Round 7 #1位于独立的declared shard resolver。 |
| Round 6 #2 Owner方案I candidate scan unreadable | PASS（原finding保持关闭） | Missing-index root/nested non-`ENOENT` `readdir` failure现返回 `invalid-sharded-document-shape` / `shard-candidate-scan-unreadable`及safe failing-directory evidence。Round 7 #2是成功枚举后Dirent分类遗漏，不是scan failure。 |
| Owner S：显式whole不读未选index graph | PASS | Current `skipUnselectedIndexGraph`保持不读/不解析未选graph，同时canonical index entry safety不变。 |
| Owner M：有限diagnostic probes | PASS（除Finding #2可能改变precedence的P2边界） | Probe集合、顺序、regular target约束与no-fallback/no-migration保持正确；只有missing-index symlink candidate被漏掉时才可能先进入mismatch probe。 |
| Owner L：bounded Markdown grammar | PASS | 未发现inline/reference、query/fragment、single decode、portable classification、order/dedupe/self-link回归。 |
| Round 1-5已关闭findings | PASS | Round 7没有重开Architecture fallback、subject-directory/canonical-entry symlink、whole selection、parser、order、自引用、whole unreadable或index-present scan findings。 |

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Evidence / note |
| --- | --- | --- |
| AC1 | PASS | Fresh phase-owned subject directory projection未被本轮推翻。 |
| AC2 | PASS | 三个canonical whole producer paths保持稳定。 |
| AC3 | PASS | Whole/sharded同目录、无额外`shards/`层与explicit selection contract未被重开。 |
| AC4 | **FAIL** | Declared shard symlink→non-regular可被写入消费路径并continue。 |
| AC5 | **FAIL** | Broken/unreadable declared shard未稳定block；missing-index安全symlink candidate还可能被误分类。 |
| AC6 | PASS | Explicit-root authority与Architecture `legacy-compatible` fallback未被重开。 |
| AC7 | PASS（P2 caveat） | Diagnostic-only/no-migration保持成立，但漏掉symlink candidate可能使mismatch precedence证据不准确。 |
| AC8 | **FAIL** | Runtime尚未完全兑现SPEC对declared readable shard与stable discovery evidence的承诺。 |
| AC9 | PASS | Active fresh producer negative scan未被本轮发现推翻。 |
| AC10 | **FAIL** | 93项focused suite缺少declared shard non-regular symlink与missing-index `.md` symlink fixtures。 |
| AC11 | PASS | Findings均限定于Story 11.5 shared discovery，不扩展Story 11.6+。 |

## Verification（验证）

- Aggregator：`npx vitest run test/artifact-document-discovery.test.ts` PASS，`1 file / 93 tests`；现有suite不覆盖两个反例。
- Aggregator独立复现 #1：declared `chapter.md` symlink→subject内directory错误返回 `ok=true` / `sharded-only` / `continue`，并出现在declared/consumed paths。
- Aggregator独立复现 #2：missing whole/index + lexical `chapter.md` symlink→subject内regular non-`.md` target错误返回 `subject-document-missing`；临时项目已递归清理。
- Canonical source checker（warn）：`status=ok`、`findings=[]`、`changedPathCount=82`，impacted classes为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，`decisionRecordRequired=false`。
- `git diff --check`：PASS（无输出）。
- 本Aggregator未运行build、full suite或packaging；除本summary外未修改source、tests、Story、tracker、SPEC/docs、progress logs或其它CR文件。

## Caveats（限制与隔离）

- External `speclite-drawer-er-modeler`、`.agents/.claude` mirrors与fixed-count drift不属于Story 11.5 findings，未纳入本轮裁决。
- Developer hook要求的canonical governance最终分类与strict checker仍由root orchestrator在最终收口前完成；本轮read-only warn checker为D0且无finding。
- Finding #1不得扩展为禁止所有declared shard symlink；in-bound readable regular target仍合法，outbound target仍使用既有containment mapping。
- Finding #2不得扩展为跟随symlink directory递归、扫描index-present subtree、通用filesystem taxonomy或新增stable issue ID。
- Worktree存在多Story及external concurrent changes；本Aggregator只审查Story 11.5 bounded surface，不据混合状态修改或撤销任何文件。

## Next Gate（下一门禁）

进入 fresh Evaluator Round 7。Evaluator应独立确认Finding #1为P1 bounded patch并裁决Finding #2的P2去向及是否需要最小Owner decision。只有Finding #1完成Fixer修复、所有获授权项经fresh Reviewer复审，且latest Reviewer与latest Evaluator同时PASS、required verification无Story 11.5新增失败，才可进入CR04、CR05或CR06。
