# Acceptance Auditor Report（验收审计报告）

- layer: `acceptance-auditor`
- status: `FINDINGS_REPORTED`
- modelUsed: `OpenAI GPT-5.6 Sol (high)`
- storyId: `11-9`
- reviewSeries: `evidence-v2`
- round: `6`
- inputMode: `frozen-diff`
- inputRawSha256: `fd5575c85b07437665085d2650d649f77e2f23ad63eecf9f6a0244cb7012a84e`
- findingCount: `1`
- blockingFindingCount: `1`
- verifyRequiredCount: `0`

## Read Evidence（完整读取证据）

以下输入均已从首行至 EOF 完整读取；未读取 Blind Hunter、Edge Case Hunter、history registry、旧 layer、旧 summary 或旧 evaluation 正文。

| 输入 | 完整范围 | raw SHA-256 | 用途 |
|---|---:|---|---|
| `assets/source/speclite/core-skills/speclite-review-acceptance-auditor/SKILL.md` | 66 行 | `25080fe1dc5c8640c9eacb013b64a1ac0a280014a47b8685bf858208f15593d6` | canonical 审计方法 |
| `.tmp/evidence-v2-round-6/review-input.diff` | 8054 行 | `fd5575c85b07437665085d2650d649f77e2f23ad63eecf9f6a0244cb7012a84e` | 41 个 declared header 的冻结变更输入 |
| `.tmp/evidence-v2-round-6/spec-content.md` | 145 行 | `11a807f2ff6a19466c920c0750463a12d5eb229487a9a6f13306edf50effca84` | Story、AC1–AC12 与四类 Anchor |
| `.tmp/evidence-v2-round-6/anchor-evidence.md` | 18 行 | `48e11ad5d7f79b6c68b30009af90f7c3993abe08159dd1850b6b30d9b7bd6b54` | 本轮冻结 binding、R5 待复核指纹与 coordinator evidence |
| `flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md` | 124 行 | `7560114371ee86f71fbc33f12e010c140ec2fbe14000668b16b17d9b1745f0da` | stale historical completion evidence |

Current source/test 的 raw SHA-256 分别为 `0fceb4e0788d99d63ba83d134fcd25a18999f8d5e1fbd6ede9c9b12558aaaf30` 与 `fdb534e14c60b5c73ece31ffa73786ebe7ad476dd26c26ef44b14ae8f08ae904`，与 Anchor Evidence 给出的 current identity 一致。

## Acceptance Criteria Coverage（验收标准覆盖）

| AC | 状态 | 第一手证据与判定 |
|---|---|---|
| AC1 | PASS | `resolve-cr-directory.mjs:55-59,167` 构造唯一 `{implementation_artifacts}/code-reviews/{storyId}-code-review` canonical root；新 run 不写 title-bearing root。 |
| AC2 | PASS | `resolve-cr-directory.mjs:8,19-23` 只接受两段无前导零正整数的 `N.N` / `N-N`，并将点转连字符；`test/code-review-contract.test.ts:461-478` 覆盖 `11.9 -> 11-9` 与非法 identity。 |
| AC3 | PASS | Resolver API 不消费 title/name/slug/filename；`resolve-cr-directory.mjs:19-23,55-59` 只从 numeric `storyId` 构造 canonical name，`test/code-review-contract.test.ts:480-510` 覆盖中文、空格、标点和 traversal title 不影响结果。 |
| AC4 | PASS | `runner-workflow.md:11,17,72,76,98,104-107` 规定一次 resolver 调用并把同一 `crDir/canonicalCrDir/compatibilityMode/legacyArtifactPaths` 传给 CR01–06；各 leaf workflow 均有 runner-mode frozen-context preflight。 |
| AC5 | PASS | `cr-contract.md:79` 把 review/evaluation/fix/rules/TODO/finalizer/`.tmp`/goal records 绑定到 resolved `crDir`；runner 的 CR01–06 invocation 使用相同四字段。 |
| AC6 | PASS | `runner-workflow.md:11,43` 固定 `{crDir}/goal-execute-records/`；文档与测试保持 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 三个 basename。 |
| AC7 | PASS | 冻结 diff 覆盖 shared contract/resolver、runner、CR01–06 中英文入口与 workflow、help、README、public docs、packaging manifest、tests 和 classified fixture ledger；没有发现真实 authority/provenance surface 缺失。共享 manifest 中外部增量属于已声明 excluded ownership，不作为机械 metadata finding。 |
| AC8 | PASS | Resolver 只用 `lstat/readFile/readdir/realpath`，没有 filesystem writer；恢复分支只返回路径。`test/code-review-contract.test.ts:513-534,1610-1659` 断言 legacy 原位保留、dual/multi 前后 snapshot 不变。 |
| AC9 | FAIL | 唯一 unfinished legacy 的正常矩阵与 dual/multi stable diagnostic 已实现，但不完整 current artifact 可绕过 authentic-v2 门禁并被当作 `UNFINISHED`，从而授权错误的 `legacy-resume`。见 Finding A-01。 |
| AC10 | PASS | `test/code-review-contract.test.ts:1909-2002` 的 frozen no-follow scanner、exact ledger 与 bounded detector 覆盖 active title-bearing families；current ledger 的 `active-canonical` 为零，保留项只分为 compatibility fixture/regression assertion。 |
| AC11 | PASS | Current tests 覆盖 numeric-only、title isolation、CR01–06 propagation、goal records、legacy-only、dual/multi ambiguity、title traversal、zero-write 和 installed parity；Anchor Evidence 记录本轮 coordinator focused `110 passed / 4 todo / 0 failed`。本 Auditor 未重跑 tests。 |
| AC12 | PASS | Diff 保留五类 report basename、`reviewSeries`/round filename 结构、CR01→CR06 顺序、verdict/approval routing；未发现 algorithm、round numbering 或 approval rules 被实质改写。 |

## R5 P1 Closure Verdict（R5 P1 闭环结论）

- historical fingerprint: `sha256:f901eda7efb58650982cf9e821fce188a4e6e64468449e0b2ca04493b79ed7e3`
- verdict: `RESOLVED`
- source evidence: `resolve-cr-directory.mjs:780-837` 的 bounded inline-list scanner 在 quote 外遇到 `#` 且位于 item 开头、空白之后或 closing quote 之后时立即返回 `null`；因此 comment 不再吞掉 closing `]` 后仍被认证。
- negative regression: `test/code-review-contract.test.ts:4858-4885` 覆盖 `[src/a.ts # comment]`、`[# comment]`、comma/tab 后 comment，以及单双引号关闭后紧邻 comment；每个输入先证明 YAML frontmatter 非法，再断言 resolver 返回 `legacy-current-series-evidence-invalid` 且 snapshot 零变化。
- positive controls: `test/code-review-contract.test.ts:4887-4913` 保留 ordinary list、bare/quoted hash 与 NBSP 非 comment 输入。
- execution evidence boundary: Anchor Evidence 记录 Fixer 后 GREEN 与本轮 coordinator focused `110 passed / 4 todo / 0 failed`；本 Auditor 只复核 current source/test，不冒称执行该测试。
- fingerprint relation: 本轮 Finding A-01 的具体失败场景是“不完整 current v2 artifact 授权 legacy-resume”，与 R5 的“quote 外 comment 吞 closing `]`”不同，不是该历史指纹的复发或措辞迁移。

## Findings（发现）

### A-01 — 不完整 current v2 artifact 可授权 title-bearing legacy directory 续写

- blocking: `true`
- category: `artifact-authenticity`
- invariant: `legacy-resume` 只能由合法、完整且可唯一认证的 current v2 artifact evidence 授权；不完整 current evidence 必须在任何写入前 fail-close。
- concrete failure scenario: 给定安全的 project root、合法 frozen tracker bindings、canonical directory 不存在，且磁盘上只有 `state/code-reviews/11-9-attacker-title-code-review/11-9-code-review-summary-20260905-main-round-1.md`；该文件的 leading frontmatter 仅含 `schemaVersion: speclite.cr-review.v2`、`artifactType: code-review-summary`、`storyId: 11-9`、`reviewSeries: main`、`round: 1`，缺少 `storyKey`、`generatedAt`、`headSha`、`scopeHash`、`sourceMutationAt`、scope lists、quorum、finding counts/hash 与合法 verdict。实际代码在 `validArtifactIdentity()` 只核对五个 identity 字段后，把它计作 current artifact，最终标为 `UNFINISHED`；由于它是唯一 legacy candidate，resolver 返回 `ok=true`、`compatibilityMode=legacy-resume`、`crDir=state/code-reviews/11-9-attacker-title-code-review`。后续 runner 将同一未经认证的 title-bearing 目录传播给 CR01–06 并允许写入，而不是返回 `cr-directory.ambiguous-resume-root` / `legacy-current-series-evidence-invalid` 并 stop-before-write。
- violated AC: `AC9`；同时违反 Contract Anchor 中“evidence 无法唯一绑定 current series/round 必须 block”以及 runner `runner-workflow.md:9` 的“current 状态只能来自合法 v2 frontmatter、artifact hash、scope hash”。
- primary location: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:291-311,356-372,485-495`；错误路由发生于 `:157-165`。
- test evidence gap: 现有 malformed/unbound fixtures 覆盖 wrong schema、wrong round 和 wrong Story，但没有覆盖“basename/identity 正确、required v2 fields 缺失”的 unfinished legacy summary/evaluation/rules/TODO；完整 schema 校验目前只在 `validDoneFinalizer()` 的 DONE 路径执行。
- suggested bucket: `patch`
- suggested direction: 在 artifact 被计入 current round 或用于 `legacy-resume` 前，按 family 执行与 canonical producer contract 一致的 required-schema/authenticity 校验；对无法形成合法 current v2 state 的 candidate 返回既有 stable invalid-evidence diagnostic，并增加最小 frontmatter、缺 required field、孤立 evaluation/rules/TODO 的 zero-write 回归。

## Anchor Verdicts（锚点判定）

| Anchor | 状态 | 结论 |
|---|---|---|
| Contract Anchor | FAIL | Numeric root、single propagation、stable diagnostic 文面已对齐，但 legacy-resume 的 current artifact authenticity 门禁存在可复现绕过。 |
| Functional Anchor | FAIL | 正常与显式 ambiguity 分支工作；Finding A-01 会把未经认证的 title-bearing candidate 实际选为写入目录。 |
| Evidence Anchor | PARTIAL | AC11 主矩阵与 R5 回归证据充分；缺少 Finding A-01 的 malformed-but-identity-matching unfinished legacy 反例。 |
| Guidance Anchor | PASS | Shared contract、runner、CR01–06、help 与 public docs 一致声明 numeric-only、single propagation、legacy no-migration 和 ambiguity stop。 |

## Gate Freshness Boundary（门禁时效边界）

真实 completion gate 的 `result=PASS_EQUIVALENT`，但 `generatedAt=2026-09-07T04:45:00.000Z`，早于 Anchor Evidence 记录的 R5 `sourceMutationAt=2026-09-08T08:13:09.208Z`。因此它仅是 stale historical evidence；本报告没有把它当作 Round 6 fresh completion gate，也不据此裁决 P0/P1、启动 CR02 或任何下游步骤。
