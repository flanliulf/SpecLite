---
Story: 11-9
Round: 1
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。Story 11.9 已建立 numeric-only resolver、canonical/legacy recovery matrix 与 CR01–06 的同目录文案，但 current diff 仍有 5 个 bounded P1：缺失 `code-reviews` root 时未验证既有 symlink ancestor，可能把后续写入导向 project 外；没有合法 round evidence 的单一 legacy 目录仍被当成可恢复 run；finalizer completion 只靠 filename 和两个正文 regex，可被 identity/round 不匹配或正文伪字段误判；runner invocation 只传 `crDir`，没有传下游声明必需的完整 resolver evidence；所谓 active negative scan 只扫描手列 Markdown 子集与两个窄 regex，无法支撑全 corpus closure。

- **P1：5**
- **P2：0**
- **Owner Gate：`NONE`**
- **Review boundary**：Story 11.9、Epic 11、shared CR contract、numeric-only resolver、runner/CR01–06 propagation、legacy resume/ambiguity、focused tests、current docs 与 kickoff/completion gates。
- **Explicit exclusions**：未运行 build、full suite、packaging 或 canonical governance；未将 `speclite-drawer-er-modeler/`、zip、workspace `.agents` / `.claude` mirrors 或 fixed-count drift 归因于 Story 11.9；未处理 Story 11.10，也未修改 Story、tracker、gate、root goal records 或源码。

## P1 Findings（P1 发现）

### P1-1 缺失 CR root 时 symlink ancestor 可让 verified `crDir` 逃出 project

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:37-47,151-168`；`test/code-review-contract.test.ts:470-503`
- **Evidence**：resolver 只在 `codeReviewRoot` 已存在时 `realpath()` 并检查 `isWithin(resolvedProjectRoot, resolved)`；只要 `lstat(codeReviewRoot)` 返回 `ENOENT`，就直接返回 canonical success。若 `implementationArtifacts` 本身或其中任一既有 ancestor 是指向 project 外的 symlink，而其下尚未创建 `code-reviews/`，这条 fresh-run 分支会把 project-relative 字符串标成 verified `crDir`，后续 `mkdir/write` 实际落到 project 外。focused test 只覆盖普通实目录，没有 symlink-ancestor + missing-leaf case。
- **Consequence**：title/traversal 输入虽然不能直接参与目录名，但恶意或损坏的 artifact-root filesystem topology 仍能突破目录边界；runner 将错误地冻结并向 CR01–06 传播一个可越界写入的 `crDir`，违反 Story AC2/AC11 与 `$cr_dir` 必须位于 project 内的 hard contract。
- **Classification**：`patch`。在 missing leaf 返回 success 前验证最近既有 ancestor 的 no-follow/realpath containment（并在必要时逐段拒绝 symlink），补充 zero-write symlink-ancestor regression。

### P1-2 无法绑定 current series/round 的单一 legacy 目录被静默当作 unfinished run 恢复

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:84-118,182-213`；`test/code-review-contract.test.ts:573-623`
- **Evidence**：`inspectCandidate()` 在目录内没有任何匹配 `reviewSeries` 的 round artifact 时得到 `maxRound=null`、`completed=false`；外层随后把它计入 `unfinishedLegacy`，且在仅一个 legacy 目录时直接返回 `ok=true`、`compatibilityMode=legacy-resume`。因此一个空目录、只含 `round-evidence.md` 的目录、只含其他 series 的目录，或文件名无法绑定 current round 的目录，都能成为唯一 write target。kickoff 与 shared contract 明确要求“evidence 无法唯一绑定 current series/round”必须 stable conflict + stop；现有 ambiguity test 反而用不符合 round schema 的 `round-evidence.md` 把这类未知状态建模成 unfinished。
- **Consequence**：新 run 可能续写到一个并非 current run 的 title-bearing legacy directory，恢复目标仍靠猜测；后续 artifacts 与 goal records 会被固定到错误目录，造成 AC8/AC9 要避免的 silent split 或历史污染。
- **Classification**：`patch`。区分 `NO_EVIDENCE/UNBOUND` 与 `UNFINISHED`；只有至少一份合法且 identity/series/round 可绑定的 current v2 artifact 才允许 `legacy-resume`，否则返回 `cr-directory.ambiguous-resume-root` 且 zero-write，并补单 legacy empty/other-series/malformed evidence fixtures。

### P1-3 非法或错绑 finalizer 可把 unfinished legacy run 误判为 completed

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:185-204`；`test/code-review-contract.test.ts:505-571`
- **Evidence**：最大轮次来自任何以 `-{reviewSeries}-round-N.md` 结尾的文件名，不校验 canonical basename、artifact type、`storyId` 或 frontmatter；finalizer 只要 filename 含 `-cr-finalizer-`，且文件任意位置分别出现 `schemaVersion: speclite.cr-finalizer.v2` 与 `result: DONE` 就会加入 `doneRounds`。实现没有验证这两个字段位于同一个合法 frontmatter，也没有核验 frontmatter 的 `storyId`、`reviewSeries`、`round`、source/evaluation bindings 或 finalizer schema required fields。现有 tests 仅提供完全正确的 happy-path finalizer 和 older-DONE case。
- **Consequence**：错误 Story、错误 series/round、缺失 required bindings，甚至正文示例里出现两个字段的文件，都可将当前 legacy round 判为 DONE；resolver 随后启动 canonical new run，在真实 unfinished legacy 尚存时制造同一 Story 的新旧目录分裂，直接破坏 AC8/AC9。
- **Classification**：`patch`。只从 canonical current-series artifact basenames 和严格解析的 v2 frontmatter建立 round state，并要求 finalizer identity/series/round/result 与当前最大轮精确绑定；invalid/unbound evidence 必须 conflict-stop，补 wrong-story、wrong-round、body-only、malformed-frontmatter fixtures。

### P1-4 Runner 没有把 leaf 声明必需的 resolver evidence 实际传给 CR01–06

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md:17,72,76,98,104-107`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:63`；`test/code-review-contract.test.ts:625-645`
- **Evidence**：shared contract 要求 runner 把同一 `crDir`、`canonicalCrDir`、`compatibilityMode` 与 `legacyArtifactPaths` 传给 CR01–06，各 leaf Directory Preflight 也说必须消费这些 evidence 且不得重新调用 resolver；但 runner 的 CR01–06 invocation 全部只包含 `crDir={crDir}`。fresh leaf 因而既拿不到其余冻结值来验证“精确匹配 orchestrator resolver result”，又被禁止重新解析。focused test 只 regex 断言六条命令出现 `crDir={crDir}`，没有断言三项 compatibility evidence 的端到端传播或 leaf mismatch rejection。
- **Consequence**：正常 canonical run 中 leaf 只能盲信 path；legacy resume 时更无法知道传入的是合法 legacy target 还是伪造 title-bearing path。single-resolution 变成不可验证的单字符串 handoff，AC4–AC6 的 verified propagation 并未闭环。
- **Classification**：`patch`。为 runner→CR01–06 定义并传递完整、稳定的 resolver-evidence input（或一个具 hash/binding 的 immutable evidence object），leaf 明确验证所有字段与 `storyId/reviewSeries` 一致；测试应逐 CR01–06 断言完整 evidence 和 mismatch fail-close。

### P1-5 Active title-bearing negative scan 不是全量 corpus scan

- **Location**：`test/code-review-contract.test.ts:647-697`
- **Evidence**：negative test 的 `activeFiles` 只手列 shared/runner/CR01–06 的 `SKILL.md`、`SKILL.en.md` 和一个 workflow reference；没有遍历同 packages 的 `assets/output-template.md`、`references/review-engine.md`、executable resolver、CHANGELOG/current metadata，也没有覆盖 canonical scripts/hooks/fixtures、module metadata、release/current docs 的全部文本 surface。两个 regex 仅识别 `{storyId}-{storyKey|Slug|Name}-code-review` 这两种相邻 placeholder 形式，无法识别 template literal/concatenation、`$story_id-$story_slug`、`cr_dir_pattern` 或具体 title-bearing sample producer。公开文档测试只检查每份内容“至少出现一个”canonical token，并不拒绝同文件同时保留 active title-bearing expression。
- **Consequence**：任一未手列 active consumer/producer 重新引入 title-derived directory 时，focused suite 仍会 false-green；completion gate `active title-bearing directory expression negative scan passed` 与 Story AC7/AC10 的“全部 `$cr_dir` expressions / active corpus closure”缺少可重放保障。
- **Classification**：`patch`。以冻结 roots/extensions 递归产生 match inventory，对每个 CR-directory expression 做 `path + literal + role` 分类；active title-bearing match 为零，legacy fixture/compatibility prose 必须显式 allowlist 且 exact-match，多出或缺失均 fail-close。

## P2 Findings（P2 发现）

无。

## Positive Evidence（已验证正向证据）

1. `normalizeStoryId()` 对 `N.N` / `N-N` 使用 full-string numeric grammar，拒绝零前导、title、中文、空格和显式 traversal input，没有从 `storyKey` 或 filename fallback。
2. resolver 对已存在的 CR root 与 candidate directory 使用 `lstat`/`realpath` containment，candidate symlink/non-directory 会 fail-close；diagnostic 的 canonical/legacy paths 为 project-relative 并采用 byte-wise 排序。
3. shared contract 已唯一关闭 legacy-only 原位 resume、completed legacy canonical restart、dual/multi ambiguity、no-migration 与 CR-local stable issue owner，未扩大 `SPEC 07`。
4. runner 文案已把 review/evaluation/fix/rules/TODO/finalizer、`.tmp/` 与 goal records 统一到一个 resolved `crDir`；CR01–06 的 ZH/EN入口和 detailed workflow 均明确禁止 title/slug/filename 重推导。
5. report basenames、CR algorithm、round numbering 与 approval rules 未见 Story 11.9 引入的改动；source resolver 已进入 release packaging manifest，current public docs 已发布 numeric-only root 与 legacy compatibility 行为。

## Scope Audit（范围审计）

- 本层只记录 Story 11.9 resolver、propagation 与 evidence closure 的直接缺口；没有把 accumulated Epic 11 前序修改重新归因为 11.9 scope creep。
- 未要求修改 report basename、CR algorithm、round/approval semantics、project validation taxonomy、legacy filesystem migration、Story 11.10、external drawer/zip、workspace mirrors 或 fixed-count baselines。
- 未触发 build、full suite、packaging 或 canonical-governance 执行，未修复源码、测试、Story、tracker、gate 或 root goal records。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 五个 P1 的正确方向都由 Story 11.9、kickoff 和 shared CR contract 唯一确定：fresh-root 必须验证 ancestor containment；unbound legacy evidence 必须 stop；completion 必须来自严格绑定的合法 finalizer；runner 必须传播 leaf 可验证的完整 resolver evidence；negative scan 必须覆盖冻结的 active corpus 并精确分类。可交 fresh Aggregator/Evaluator 独立判定；本层不授权 Fixer。
