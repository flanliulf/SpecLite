---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 3
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T21:11:54.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `7` 项 P1、`0` 项 P2。Round 2 Fixer 后 focused test 为 `35 passed / 4 todo`，但下列分支仍未被 production guard 或 executable evidence 覆盖。Findings 仅限 Story 11.9 的 malformed evidence、DONE authenticity、frozen execution context、14 类 blocked matrix、installed parity 与 bounded detector/ledger；不涉及 Story 11.10、external drawer、report basename、CR algorithm、round/approval policy、build、full suite或 packaging。

## P1 Findings（P1 发现）

### P1-1 — Canonical known-family filename 的非数字 round 被当作无关文件

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:253-256,333-339`
- **Trigger condition**：canonical 目录含 `11-9-code-review-summary-20260905-main-round-nope.md` 等 Story/current-series/known-family 信号，但 round token 非数字。
- **Unhandled path**：`looksLikeCrArtifactSignal()` 只有在 known family 同时匹配 `-round-[0-9]+.md` 或完整 numeric current suffix 时才返回 true；因此 malformed round filename 根本不会进入 `suffixMatch` / `invalidEvidence`。canonical 目录只有该文件时 `currentArtifactCount===0`，最终仍返回 `ok=true, compatibilityMode=canonical`。Round 2 canonical matrix只覆盖合法 numeric filename配 malformed frontmatter，未覆盖 malformed filename token。
- **Consequence**：身份不完整的 current artifact 可与新 round 共目录续写，破坏 AC9/AC11 的 malformed evidence fail-close。
- **Guard sketch**：先识别 Story + known family + current series 的 artifact intent，再单独严格校验 date/round/extension；intent 已命中但 filename identity 非法时一律 `current-series-evidence-invalid`。

### P1-2 — CR04/CR05 可不绑定 current evaluation 却仍使 legacy round 判定 DONE

- **Location**：`resolve-cr-directory.mjs:415-433,467-477`；`test/code-review-contract.test.ts:1472-1501,1521-1548`
- **Trigger condition**：rules/TODO predecessor具有同 Story/series/round和 `result: COMPLETED`，但缺失或伪造 `evaluationSource` / `evaluationSourceHash`。
- **Unhandled path**：`readBoundArtifact()` 只验证通用 identity；`validDoneFinalizer()` 对 CR04/CR05 只检查 `result === COMPLETED`，没有验证二者的 `evaluationSource` 和 `evaluationSourceHash` 都绑定本次真实 evaluation。当前 `currentRulesArtifact()` 与 `currentTodoArtifact()` 完全不含这两个字段，仍被 `writeAuthenticCompletedRound()` 当作 authentic DONE GREEN fixture。
- **Consequence**：来自其他 evaluation 或绕过 RULES/TODO closeout 的同轮文件可完成 legacy lifecycle，随后错误切换 canonical sibling。
- **Guard sketch**：要求 CR04/CR05 的 evaluation basename/hash精确等于 finalizer current evaluation，并对真实 evaluation bytes执行相同 canonicalized hash校验；缺失或不一致稳定阻断。

### P1-3 — Tracker authenticity 只验证三项形状，不验证 required tracker identity或真实写后内容

- **Location**：`resolve-cr-directory.mjs:402-411,503-523`；`test/code-review-contract.test.ts:1577-1594`
- **Trigger condition**：finalizer提供任意三个不同 project-relative path/key，以及任意格式合法的 before/after hash和 `rereadConsistent: true`。
- **Unhandled path**：`validTrackerChangeSet()` 不要求三项分别是当前 Story file、sprint tracker与 configured required workflow tracker，不校验 Story key/Status、sprint key或 workflow key，也不 no-follow读取 tracker并比对 `afterHash`。GREEN fixture甚至使用不存在且非完整 storyKey的 `.../stories/11-9.md` 与任意全重复 hex，仍满足 authentic DONE。
- **Consequence**：tracker未写、写错对象或写后内容不一致时，legacy run仍可被判 completed并启动 canonical新生命周期。
- **Guard sketch**：把 resolver输入扩为已冻结的 required tracker identity，逐项校验 exact path/key、no-follow regular file与当前 canonicalized after hash；无法验证 configured tracker时不得贡献 DONE。

### P1-4 — Leaf preflight 仅拒绝名为 titleFallback 的额外输入

- **Location**：`test/code-review-contract.test.ts:962-980,1269-1311`
- **Trigger condition**：CR01–06 supplied context携带 `storyTitle`、`storySlug`、`storyFilename`、`crDirCandidate` 等 title-derived fallback字段，而四个 frozen字段保持相等。
- **Unhandled path**：test-only executable adapter只检查 `supplied.titleFallback !== undefined`；其他额外 title/slug/filename派生输入被忽略并执行 mutation callback。Round 2 matrix只注入一个人为字段名 `titleFallback`，不能证明 contract所禁止的真实 fallback surfaces在 write 前 HALT。
- **Consequence**：leaf仍可接受并消费 title-bearing local candidate，测试却把 frozen context enforcement报告为 GREEN。
- **Guard sketch**：定义 exact accepted context schema或显式拒绝所有 title/slug/filename/candidate derivation字段；逐 CR01–06 注入真实字段族并断言 stable HALT与 callback零调用。

### P1-5 — 14 类 blocked matrix 未冻结每类 stable reason

- **Location**：`test/code-review-contract.test.ts:768-883`
- **Trigger condition**：任一 failure class仍返回相同 issue envelope，但 reason被错误映射为其他有限值或意外新增值。
- **Unhandled path**：矩阵覆盖了14个类并检查 full controlled-tree零变化，但除 `invalid-project-root` 外只断言 `details.reason: expect.any(String)`；dual/multi的精确 reason只在另一测试覆盖，其余12类均未绑定 expected reason。Round 2 GREEN要求“每例断言 stable issue/reason”，当前断言允许跨类 reason漂移且 focused test仍通过。
- **Consequence**：调用方恢复/诊断分支可收到错误稳定码，completion evidence仍误报 runner-wide stable diagnostic closure。
- **Guard sketch**：为14类建立 frozen `{class -> top-level/issueId/reason}` 表，逐例精确断言；I/O classes仍统一映射到合同允许的有限 reason。

### P1-6 — Source/installed activation parity允许禁止性语义完全缺失

- **Location**：`test/code-review-contract.test.ts:1109-1175`
- **Trigger condition**：某个 source ZH/EN或installed `SKILL.md` 仍引用 workflow/contract，但删掉 numeric-only handoff或“不按 title/slug/filename 重推导”的入口硬门禁。
- **Unhandled path**：source测试分别对两种语言做宽松 OR regex（包含任一 `resolver evidence` 即可），并仅断言不存在“derive title”正向措辞；它没有要求两份entry都明确包含同一禁止性语义。installed entry同样只排除一个紧邻 `storyTitle|storySlug ... code-review` regex，规则缺失会通过。byte parity只能证明复制一致，不能补足 source activation语义遗漏。
- **Consequence**：入口可丢失 AC4/AC7 的 single-resolution/no-title-fallback hard gate，而 installed parity继续为绿。
- **Guard sketch**：对八个package冻结各自必须出现的 numeric resolver、workflow/contract activation与 explicit no-title-rederive语义；ZH/EN逐项对齐，installed active `SKILL.md` 重放同一必需断言并保留 ENOENT。

### P1-7 — Detector 的 shell/template split-expression mutation实际仍是连续 token

- **Location**：`test/code-review-contract.test.ts:1043-1068,1407-1421`
- **Trigger condition**：active producer使用 `${story_id}"-"${story_slug}"-code-review"`、`${story.id}${"-"}${story.slug}${"-code-review"}`、shell quoted fragments或等价分段 interpolation。
- **Unhandled path**：标为 `shell-concat` 的 fixture实际是连续 `$story_id-$story_slug-code-review`，`template-concat` 也是连续 `${story.id}-${story.slug}-code-review`；两者由 placeholder regex命中，并未测试split expression。专用 concat regex仅接受 JS `+ "-" +` 形状，无法识别 shell quoted fragments、`${"-"}` 分段模板或其他等价 interpolation，因此这些 producer不会进入 candidate集合，ledger仍可 exact-equal且 `active-canonical=[]`。
- **Consequence**：frozen active roots可新增 title-bearing CR directory producer并绕过未分类 fail-close，违反 AC7/AC10/AC11。
- **Guard sketch**：将 mutation fixture改成真实分段字节形态，并让 detector归一 shell quoted concat、segmented template interpolation与已有JS/config families；每族必须先被发现，再因临时路径未分类而稳定失败。

## P2 Findings（P2 发现）

无。

## Exclusions（明确排除）

- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 及 zip。
- 未运行 `npm run build`、full suite、packaging或 canonical governance。
- 未建议修改 report basenames、CR algorithm、round numbering、approval/confirmation policy、public CLI或 dependencies。
