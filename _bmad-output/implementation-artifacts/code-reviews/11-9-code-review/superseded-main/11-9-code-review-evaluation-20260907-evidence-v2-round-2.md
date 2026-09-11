---
schemaVersion: speclite.cr-evaluation.v2
artifactType: code-review-evaluation
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: evidence-v2
round: 2
generatedAt: 2026-09-07T10:50:23.053Z
modelUsed: "OpenAI GPT-5.6 Sol (medium)"
reviewModel: "OpenAI GPT-5.6 Sol (high)"
reviewSource: 11-9-code-review-summary-20260907-evidence-v2-round-2.md
reviewSourceHash: sha256:7b7b8fbf4b6c22facbccc0498e2b0fe0bc898e1be3a6221df8bce7c0dfef1164
headSha: ff7528d3f9ec34072bb669ee79f7569345c23d47
scopeHash: sha256:b453941087e5c4ac29705f51438704f374c50e63badf0dd8f5357d528379a9fe
verdict: FIX_REQUIRED
acceptedCounts:
  p0: 0
  p1: 1
  deferred: 2
  verifyRequired: 0
  dismissed: 4
convergence:
  newBlocking: 1
  recurredBlocking: 0
  resolvedBlocking: 6
  churnDetected: false
  architectureCategories: []
fixRecord:
  mode: patch
  status: completed
  generatedAt: 2026-09-07T12:43:35Z
  modelUsed: "OpenAI GPT-5.6 Sol (medium)"
  changedFiles: [assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs, test/code-review-contract.test.ts]
  sourceMutationAt: 2026-09-07T12:42:41.443Z
  verificationCommands: [npx vitest run test/code-review-contract.test.ts -t "preflights reserved CR subpaths without following symlinks or writing" --reporter=dot, node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs, npx vitest run test/code-review-contract.test.ts --reporter=dot, git diff --check -- assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs test/code-review-contract.test.ts]
  verificationResult: PASS
---

# Code Review Evaluation（代码审查评估）

## Binding Verification（绑定验证）

- Review 来源及 hash：`11-9-code-review-summary-20260907-evidence-v2-round-2.md`；canonical hash=`sha256:7b7b8fbf4b6c22facbccc0498e2b0fe0bc898e1be3a6221df8bce7c0dfef1164`，raw SHA-256=`9106c02817bc4f1080ef6d1be49e57d50e0e73c7574b4c7a7da1382cf5dc81c4`，与冻结输入一致。
- Story、series、round：`11-9` / `evidence-v2` / `2`，匹配；`headSha=ff7528d3f9ec34072bb669ee79f7569345c23d47`。
- Scope hash：`sha256:b453941087e5c4ac29705f51438704f374c50e63badf0dd8f5357d528379a9fe`，匹配；`41 declared / 585 actual / 544 excluded / 0 exceptions`，41 个 declared canonical content digest 本轮只读重算均一致。
- Reviewer quorum：`3/3`；`blind + edge + auditor` 均为 fresh 层，review verdict=`FINDINGS_REPORTED`，scope exception 与 failed layer 均为空。
- Finding set：`sha256:3c8754e1e6bae0712bfbcdf5dfaaca67581c9bb63a7df62d8bbde660481852fa`；7 个 seed 的 fingerprint 本轮只读重算均一致。
- Resolver context：消费 runner 已冻结的 `ok=true`、`crDir=canonicalCrDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`、`issue=null`；未重跑 directory resolver。按 Skill 要求执行 runtime config resolution成功。
- Evaluator 独立性：Reviewer 与 Evaluator 同属 OpenAI GPT-5.6 Sol，虽 reasoning effort 分别为 high 与 medium，仍不构成跨模型独立性；本评估未以层数量支持 severity，并对每条候选主动检查 owning contract、合法反例与责任边界。
- 验证边界：未重跑 Reviewer 的 focused suite；`103 passed / 4 todo / 0 failed` 仅引用其本轮已记录证据。本评估未运行 build、packaging、full suite 或任何 writer。

## Finding Evaluations（逐项评估）

### EVIDENCE-V2-R2-F1: 延期 TODO backlog 未被 current hash 认证

- 发现指纹：`sha256:4b9c617b38f75a104c3cd08fbce260af490fd72d0722f0ff353bf1075a374ac9`
- Reviewer 提出的失败场景：CR05 report 可写任意合法 hash，即使当前 backlog 不存在或不含 deferred fingerprint，resolver 仍可能认证 `DONE`。
- 独立证据：CR05 workflow 把 backlog 写入、重读、hash 计算与 durable result 生成作为 CR05 自身原子责任；CR06/目录恢复链绑定并认证该 durable report。shared contract 没有要求 resolver 在未来每次恢复时把历史 report hash与全局 backlog 的当前 bytes 再比较。
- 已检查的反证：若强制“current backlog hash必须等于历史 report hash”，任何后续 Story 合法追加或 resolve TODO 都会使先前 completed run失效；这与共享、持续变化的 backlog生命周期冲突。单独检查 fingerprint 当前仍存在也属于 CR05 `check/resolve` 的 live backlog职责，不能由 Story 11.9 的 generic directory resolver擅自新增认证语义。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。若维护者希望把 live backlog状态提升为 resolver completion authority，必须先明确 retention、resolved item和跨 Story mutation语义，再修改 owning contract；不得作为本 finding 的默认 patch。

### EVIDENCE-V2-R2-F2: 结构无效的 YAML tracker 可授权完成

- 发现指纹：`sha256:f113580e33ce900c8f1516e7cd540b7bac96b7ceafdc5907d243c0ecbaebf1e4`
- Reviewer 提出的失败场景：tracker 含 `]\nimplementation: done` 时，scanner 可接受 terminal scalar，尽管整个文档不是合法 YAML。
- 独立证据：shared contract 明确冻结的是 tracker 的 bounded grammar：sprint/workflow YAML 仅认证 block scalar正文外唯一 exact key scalar，并列出应排除的 comment、block scalar、duplicate、missing、non-terminal 与 substring；它未授权 resolver成为任意全 YAML validator。当前 scanner 对目标 authority scalar的识别与排除职责不同于文档整体 parse。
- 已检查的反证：首行 `]` 不会伪造、重复或覆盖 `implementation` authority key；要求 whole-document YAML parse会扩大既有 grammar/algorithm，并把 tracker整体结构所有权从 producer移入 generic resolver，违反 Story AC-12 的 bounded scope。当前没有 owner依据决定 YAML版本、schema或全量解析失败策略。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。若要新增 whole-document structural validity，应先由 tracker owner批准 schema/grammar contract；本轮不得自行选择 parser或扩展 resolver职责。

### EVIDENCE-V2-R2-F3: 未识别的合法 YAML duplicate-key 形式可伪造 DONE

- 发现指纹：`sha256:6c2824d6e2d973a0d1e630d4d84bf21b9f46b53ed0c95594f0ad4974c06bd7ca`
- Reviewer 提出的失败场景：`result : HALTED` 或 explicit mapping `? result` / `: HALTED` 与 canonical `result: DONE` 同存时，bounded parser忽略额外语法并保留 DONE。
- 独立证据：canonical producer schemas/templates均使用 bounded bare `key: value` frontmatter；Round 1授权只修复同一 bounded authority parser中的 quoted/bare duplicate与既有 producer-compatible场景，没有授权把 parser扩为全 YAML。当前 shared contract也未声明 explicit mapping key或 colon前空格是 canonical artifact grammar。
- 已检查的反证：本候选与 Round 1 F1同属 authority uniqueness家族，不能仅换语法便制造新的 blocking invariant；但新触发必须扩大 accepted grammar才能纳入，不能冒充旧授权的复现。直接引入通用 YAML parser还会改变 duplicate、tag、anchor、merge key与scalar coercion语义，超出 Story 11.9 的 approval/algorithm边界。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。若 owner决定 canonical artifacts接受完整 YAML key grammar，须先明确 schema和parser contract后再评估；R1三文件六项授权不能泛化到此新场景。

### EVIDENCE-V2-R2-F4: Reviewer finding 与 Evaluator disposition 未完整闭合

- 发现指纹：`sha256:12d668827d3f339bd533356fc7f8b68a88e33fbd4150dafea1ade6debeacb29b`
- Reviewer 提出的失败场景：review有两个 patch candidate而evaluation只记录一个 dismissed，resolver仍可按 `PASS` 认证完成。
- 独立证据：CR02 workflow明确把逐条第一手评估、disposition与 `acceptedCounts` 对正文一致性归给 Evaluator；CR06消费已绑定 current evaluation，generic directory resolver认证artifact identity/hash/schema，不替代CR02重新裁决。Round 1已按用户单独授权恢复 evaluator-owned generic approval语义。
- 已检查的反证：current evaluation确实必须对本轮7条候选逐条闭合，本文件已做到；但将 reviewer bucket总数与accepted count机械相等也不可靠，因为Evaluator可合并重复候选、改判priority或迁移decision。若要让resolver解析所有正文finding并重演CR02，需要新增机器可读 disposition schema与owner contract，而非在现有count blocks上猜测。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。保持 Reviewer提出候选、Evaluator逐条裁决、resolver认证绑定产物的职责分离；若需机器级逐finding闭合，应另行批准 schema演进。

### EVIDENCE-V2-R2-F5: RFC3339 小数秒精度被 Date.parse 截断

- 发现指纹：`sha256:a71d3d571a9ff71b09d6f36a00e65148d2ceb2e57c1b1603ecd4cd93ecd31244`
- Reviewer 提出的失败场景：`.9001Z` 与 `.9000Z` 被 `Date.parse()` 折叠到同一毫秒，使早100微秒的evaluation/fix/gate通过顺序检查。
- 独立证据：`validTimestamp()` 接受任意长度小数秒，而 freshness comparisons使用毫秒时间值，故场景在手工构造的超毫秒RFC3339输入上成立。
- 已检查的反证：canonical producer当前使用毫秒级时间，filesystem mutation证据也是毫秒级；候选没有展示真实 producer会生成更高精度值，也没有造成Story-ID目录分裂、错误resolver root或当前run的freshness误判。将完整RFC3339精度提升为hard gate需要owner明确精度上限或exact comparator contract。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：本轮不实现。建议 `T2`：下次修改freshness authentication或timestamp schema前，由owner选择“规范化限制为毫秒”或“完整小数秒比较”之一，并补边界测试；当前不得按P1启动Fixer。

### EVIDENCE-V2-R2-F6: Reserved CR subpath symlink 可将写入导向目录外

- 发现指纹：`sha256:4ac82b8bd024bfb5ba610fa75e3eba2230a93105fbbee4caf6de478cf629030a`
- Reviewer 提出的失败场景：预置 `.tmp -> /outside` 或 `goal-execute-records -> /outside`，resolver因将其分类为unrelated而返回成功，后续CR writer按冻结路径写出resolved `crDir`。
- 独立证据：Story AC-5/AC-6和Anchor Contract Map明确要求temp/round artifacts与goal records写入同一 normalized `crDir`；AC-11要求traversal无法越界。resolver只在artifact filename分类为current/superseded后检查symlink/non-file，reserved directories在第271–276行前置continue分支中未验证。当前磁盘两路径均为真实目录且realpath位于`crDir`，所以当前run未发生逃逸，但预置symlink场景可直接违反明确owning obligation。
- 已检查的反证：仅有project-relative lexical path或canonical parent自身的realpath校验不能约束子路径的physical target；CR01与runner确实会在resolver之后写这两个reserved paths。无需修改report basename、approval规则或全YAML grammar即可封闭预存在的unsafe node。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：需用户对本新finding单独明确授权后，在shared resolver的candidate preflight中对`.tmp`、`goal-execute-records`执行no-follow `lstat`：不存在时允许后续安全创建；存在时必须是真实目录、非symlink且realpath严格留在当前resolved `crDir`，否则沿既有safe diagnostic在任何writer前fail-close。补两个reserved path的symlink/non-directory/contained-directory反例与zero-write断言。该授权即使只涉及R1旧三文件中的resolver/test，也不能从R1六项授权推导。

### EVIDENCE-V2-R2-F7: supersededIndex identity/continuity

- 发现指纹：`sha256:cc04b874c8df8002fee766dfe795e7b68aed5e67658359dffd159c66831b6483`
- Reviewer 提出的失败场景：superseded suffix缺口或重编号时，resolver未验证ordinal continuity。
- 独立证据：resolver只要求suffix为正安全整数及`supersededBy`绑定current，未实现continuity；shared contract仅写“`n`从1递增”，未定义历史缺口恢复或不可重编号认证策略。
- 已检查的反证：该缺口不改变current artifact唯一性、round continuity或completion authentication；本轮没有升级证据，用户授权明确要求carried原hash、非阻塞、不实现。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：继续沿用Round 1的`T2`候选；仅在未来修改supersession lineage/authentication或需要以ordinal作为审计身份前，由owner决定连续性/恢复规则。本轮不升级、不实现、不提前运行CR05。

## Required Fixes（阻塞修复）

| 发现指纹 | 优先级 | 失败场景 | 授权范围 |
|---|---|---|---|
| `sha256:4ac82b8bd024bfb5ba610fa75e3eba2230a93105fbbee4caf6de478cf629030a` | P1 | `.tmp`或`goal-execute-records`预置symlink/非目录可让后续writer逃出resolved `crDir` | 当前未授权；需用户确认shared resolver reserved-path no-follow containment检查及focused regression，预计仅涉及resolver与`test/code-review-contract.test.ts` |

## Verify Obligations（验证义务）

| 发现指纹 | 必须补充的测试或断言 | 是否允许修改生产语义 |
|---|---|---|
| 无 | 无独立verify-only义务；F6要求生产语义与回归测试共同修复 | 否；不得用`VERIFY_REQUIRED`替代P1 patch |

## Deferred TODO Candidates（延期候选）

| 发现指纹 | 建议紧迫度 | 触发条件 |
|---|---|---|
| `sha256:a71d3d571a9ff71b09d6f36a00e65148d2ceb2e57c1b1603ecd4cd93ecd31244` | T2 | 下次修改freshness authentication或timestamp schema前，先由owner决定毫秒限制或完整精度比较 |
| `sha256:cc04b874c8df8002fee766dfe795e7b68aed5e67658359dffd159c66831b6483` | T2 | 下次修改supersession lineage/authentication，或需要以superseded ordinal作为审计身份之前 |

## Convergence（收敛）

- 新增阻塞项：`1`，仅F6；其不变量与Round 1六个fixed fingerprints不同。
- 复现阻塞项：`0`。F3虽与Round 1 F1属于同一parser家族，但因缺少完整YAML grammar owner依据而dismissed，既不按措辞制造new，也不冒充recurred P1。
- 已关闭阻塞项：`6`；Round 1 F1–F6均有completed fixRecord、current digest与Reviewer的`103 passed / 4 todo`证据，且本轮未复现其已授权具体场景。
- Churn证据：`false`。同一resolver文件再次出现不同类别finding不足以构成churn；没有同一accepted fingerprint修复后复现或阻塞数不降的反复修改。
- 架构类别：`[]`。F1–F4因owner边界不足dismiss；F5/F7维持非阻塞owner候选；F6由现有AC和shared resolver preflight owner直接裁决，无需先作跨组件架构选择。
- Stop-loss：未触发；Round 2小于`maxRounds=5`，仅连续两轮存在new blocking，未达到连续3轮阈值，且无accepted recurrence/churn。

## Evaluation Verdict（评估结论）

- 裁决：`FIX_REQUIRED`
- 理由：F6由Story AC-5/6/11及实际resolver控制流直接支持，是一个可在writer前封闭的生产filesystem containment缺陷；F1–F4的候选失败依赖未获owner授权的live backlog、全YAML或resolver重演Evaluator职责，予以dismiss；F5与F7真实但当前仅为T2 owner/精度与lineage决定，不阻塞。
- 必须进入的下一状态：`HALT + USER CONFIRMATION`。runner应请求用户仅对F6 exact bounded patch明确授权；获批后才可启动fresh CR03 Fixer `mode=patch`，修复后重新冻结scope并执行fresh CR01→CR02。不得直接进入CR04、CR05、completion gate或CR06。
- 授权边界：本轮用户只授权写current evaluation。Round 1三文件六项修复授权不涵盖F6；F5/F7不得实现或提前登记，F1–F4不得以本evaluation作为修改授权。

## Fix Record（修复执行记录）

- 执行模型：`OpenAI GPT-5.6 Sol (medium)`；`mode=patch`、`confirmationPolicy=preauthorized`、`orchestrationMode=runner`、`handoffTarget=runner`。
- 授权来源：`goal-execute-records/evidence-v2-authorization.md` 的 `Round 2 and Subsequent Bounded Fix Authorization（第二轮及后续定点修复授权）`；仅消费F6 `sha256:4ac82b8bd024bfb5ba610fa75e3eba2230a93105fbbee4caf6de478cf629030a`。
- 修改文件：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`、`test/code-review-contract.test.ts`。
- 修复内容：resolver在读取candidate artifacts前，对`.tmp`与`goal-execute-records`逐一执行no-follow `lstat`；absent路径保持合法，已存在节点必须为非symlink真实目录，且`realpath`必须物理包含于当前resolved `crDir`。symlink、非目录或逃逸继续使用既有redacted `unsafe-cr-artifact-entry`，检查I/O失败继续使用既有`inspection-io-failure`；未新增diagnostic分类。
- 真实RED：先只添加authentic producer baseline回归，未改生产代码；`npx vitest run test/code-review-contract.test.ts -t "preflights reserved CR subpaths without following symlinks or writing" --reporter=dot`得到`1 failed / 107 skipped`，首个失败反例`.tmp:internal-symlink`实际返回`ok=true`而预期fail-close。
- GREEN验证：同一targeted命令`1 passed / 107 skipped`；`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`通过；`npx vitest run test/code-review-contract.test.ts --reporter=dot`得到`104 passed / 4 todo / 0 failed`；两目标文件的`git diff --check`通过。
- 覆盖边界：对每个reserved path覆盖指向current `crDir`的internal symlink、指向外部目录的external symlink、non-directory、真实contained directory；另覆盖两个路径同时absent合法。所有阻断反例断言resolver返回redacted stable diagnostic、writer callback调用为0，且project/external tree逐项不变。
- Scope审计：修前41个declared canonical content digests重算均匹配Round 2 manifest；修后除获批两文件外的39个declared digests仍全部匹配。两目标文件修后canonical content hash分别为`sha256:9bb18332ecccbbe25c1971da50070ebf4448cd88013c940eee7072f0e68676e2`与`sha256:43dbe996f282700bd6ab49bc018e0dee81251881f3ac41b37baa83432ff764b0`；`sourceMutationAt=2026-09-07T12:42:41.443Z`。
- 排除与caveat：未实现F5时间精度或F7 `supersededIndex`，未修改F1–F4 dismissed项；未运行build、full suite、packaging writer、canonical governance runner或派生mirror/baseline更新。`apply_patch`的warning-only canonical governance hook提示D1潜在影响，但这些动作明确超出本次两文件授权，留给fresh reviewer/evaluator与runner判断。
- Fresh handoff：本`completed`记录不授权CR04/CR05/finalizer；runner须重新冻结scope，并执行fresh CR01 Reviewer与fresh CR02 Evaluator。
