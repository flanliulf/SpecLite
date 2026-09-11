---
artifactType: acceptance-auditor-layer
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: evidence-v2
round: 3
completedAtUtc: "2026-09-07T13:26:19Z"
modelUsed: "OpenAI GPT-5.6 Sol (high)"
inputDiffRawSha256: "2d34d3d44fd7b48a18ed58dfbc831459be274fdaf0d5b99ea69abe4fd4b77834"
acCoverageComplete: true
findingCount: 0
blockingFindingCount: 0
verifyRequiredCount: 0
findings: []
---

# Acceptance Audit（验收审计）

## Result（结果）

- 结论：`PASS_RECOMMENDED`（Acceptance Auditor layer）。
- 本层 findings：`0`。不设最低 finding 数；零 finding 为合法结果。
- 输入身份：已在读取审查内容前核验 `review-input.diff` raw SHA-256，精确等于 `2d34d3d44fd7b48a18ed58dfbc831459be274fdaf0d5b99ea69abe4fd4b77834`。
- 审查边界：仅消费本轮固定五项输入，以及其明确引用的 current Story、current completion gate 与 owning `cr-contract.md`；未读取 Blind、Edge 或旧 layer 输出。
- 执行边界：未运行 tests、build、packaging、full-suite、canonical-governance 或 writer。

## AC Coverage（AC 覆盖）

| AC | 状态 | First-hand evidence（第一手证据） |
|---|---|---|
| AC-1 | Covered | frozen diff 中 resolver 以 `{implementationArtifacts}/code-reviews` 和 `${normalized.storyId}-code-review` 组成唯一 canonical root；见 `resolve-cr-directory.mjs:55-61`。 |
| AC-2 | Covered | `STORY_ID_PATTERN` 只接受两段无前导零正整数，`normalizeStoryId()` 仅将点转连字符；见 `resolve-cr-directory.mjs:8,19-24`。对应静态用例覆盖 `11.9 -> 11-9` 与 `11-9 -> 11-9`；见 `test/code-review-contract.test.ts:454-470`。 |
| AC-3 | Covered | resolver API 不消费 title/name/slug/filename，目录只由 normalized numeric identity 生成；见 `resolve-cr-directory.mjs:26-58`。任意英文、中文、空格、标点与 traversal title 不影响输出的静态矩阵见 `test/code-review-contract.test.ts:472-506`。 |
| AC-4 | Covered | runner 明确限定每 Story 只在 Step 0 调用一次 resolver，冻结并把 `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths` 传给 CR01–06；见 `runner-workflow.md:11,16-18,72,76,98,104-107`。各 leaf workflow 同时声明 runner mode 不得重调 resolver、manual mode 只调一次；frozen diff 对应新增证据位于 `review-input.diff:121-124,200-203,274-277,348-351,426-429,500-503`。 |
| AC-5 | Covered | owning contract 明确 review、evaluation、fix record、rules、TODO result、finalizer、`.tmp/` 全部使用 resolved `crDir`；runner 调用面逐项传递同一冻结值，见 `cr-contract.md:103-147`、`runner-workflow.md:11,72-109`。 |
| AC-6 | Covered | owning contract 固定 `{crDir}/goal-execute-records/`，runner 在该目录维护 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`；见 `cr-contract.md:67-75,133-147`、`runner-workflow.md:41-51`。 |
| AC-7 | Covered | `scope-manifest.json` 声明 41 个 implementation files、`scopeExceptions=[]`，frozen diff 同样覆盖 41 个 declared surfaces；其中包含 orchestrator、CR01–06、shared contract、resolver、help/metadata、docs、release manifest、tests 与 fixture ledger。未发现新的 owner obligation 缺口。 |
| AC-8 | Covered | resolver 全程使用 `lstat`/`realpath`/`readFile`/`readdir` 做只读 preflight，没有迁移、重命名、复制或删除操作；legacy path 仅进入 `legacyArtifactPaths` 或作为 resume target，见 `resolve-cr-directory.mjs:74-167,201-400`。 |
| AC-9 | Covered | 唯一 unfinished legacy 在 canonical 不存在时返回 `legacy-resume` 并原位续写；canonical+unfinished legacy 或多个 unfinished legacy 返回 stable blocking diagnostic，见 `resolve-cr-directory.mjs:118-167,183-198`。静态用例覆盖 legacy resume/completed restart、later unfinished round 与 dual/multi ambiguity；见 `test/code-review-contract.test.ts:508-600,1607-1822`。 |
| AC-10 | Covered | active title-bearing negative scan、classified compatibility ledger 与 bounded detector 的静态用例存在；见 `test/code-review-contract.test.ts:1896-2020`。owning contract 将 legacy path 限定为 compatibility evidence，不允许成为新目录命名 authority。 |
| AC-11 | Covered | frozen diff 内测试覆盖 numeric-only、任意 title/traversal isolation、single propagation、goal records、legacy-only、dual/multi ambiguity、zero-write、installed consumers 与 active negative scan；见 `test/code-review-contract.test.ts:454-2020,2021-2120`。本轮额外覆盖 reserved `.tmp` / `goal-execute-records` containment；见 `test/code-review-contract.test.ts:4566-4637`。本层未执行测试，执行结果不由本报告重新声称。 |
| AC-12 | Covered | frozen diff 保留 owning contract 的 canonical report basenames、round/series identity与 state-machine approval semantics；CR01–06 的变化限定于 resolved-directory evidence、propagation 与 pre-write HALT。未发现 report basename、CR algorithm、round numbering 或 approval rule 的行为改写。 |

## R2 F6 Fresh Review（R2 F6 新鲜复核）

- 结论：`RESOLVED_BY_STATIC_FIRST_HAND_EVIDENCE`。
- Invariant：reserved CR subpaths `.tmp` 与 `goal-execute-records` 必须是真实且包含于 resolved `crDir` 的目录；resolver 不得跟随 symlink，也不得在 preflight 期间写入。
- Production evidence：`RESERVED_CR_SUBPATHS` 同时列出两项目录；`inspectCandidate()` 在读取 candidate artifacts 之前调用 `inspectReservedCrSubpaths()`。该函数对每项先 `lstat`，对 symlink 或 non-directory 返回 `unsafe-cr-artifact-entry`；随后 `realpath` 并以 `isWithin(candidateResolved, resolved)` 验证 containment；见 `resolve-cr-directory.mjs:17,247-267,376-399`。
- Test evidence：静态矩阵对 `.tmp` 与 `goal-execute-records` 分别覆盖 `contained-directory`、`internal-symlink`、`external-symlink`、`non-directory`，并断言 unsafe topology 不调用 mutation callback、project/external snapshot 不变且 diagnostic 不泄漏绝对路径；另覆盖 absent subpath 保持 absent 且 resolver 不创建目录；见 `test/code-review-contract.test.ts:4566-4637`。
- Failure scenario复核：当 `$crDir/goal-execute-records` 或 `$crDir/.tmp` 是指向内部或外部 target 的 symlink 时，当前实现返回 `ok=false` / `reason=unsafe-cr-artifact-entry`，不会进入 mutation callback；原“写入可沿 symlink 逃离 resolved `crDir`”场景已被前置阻断。

## History Disposition（历史裁决约束）

- R2 F1–F4：未发现新的 owner obligation 或不同的具体失败场景；保持 `dismissed`，未换措辞升级。
- R2 F5 / F7：保持原 fingerprint 与 `T2 deferred`，未升级为本轮 blocking finding。
- Current completion gate：指定 anchor 明确其 `PASS_EQUIVALENT` 生成于本次 fix mutation 之前，因此只作为历史 provenance；本报告不把它表述为本轮 fresh completion evidence。fresh gate 仍应由后续 current review/evaluation 后的 closeout 流程生成，这不构成本层新的 AC finding。

## Findings（发现）

无。逐条 AC 审查未发现同时具备单一 invariant、具体输入/状态到实际错误结果、primary location 与第一手证据的实质问题；也未发现需要新增 `verify-required` 的未闭合反例。
