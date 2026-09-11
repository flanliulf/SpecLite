---
schemaVersion: "speclite.flow-gate-report.v2"
mode: "story-completion"
target: "11-9-normalize-code-review-artifact-directories-by-story-id"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
result: "FAIL_FUNCTION"
generatedAt: "2026-09-09T02:40:39.000Z"
handoffContractVersion: "speclite.story-completion-handoff.v1"
foundationPrerequisiteStatus: "PASS"
foundationPrerequisiteRefs: "Story 11.1-11.8 exact story-completion gates allow continuation; Story 11.9 exact story-kickoff gate result=PASS"
closureOwnerCheckStatus: "PASS"
closureOwnerRefs: "Epic 11 Story 11.9; PRD FR23g; SPEC 09; shared speclite-code-review-contract; evidence-v2 Round 6 evaluation and TODO closeout"
sourceSkill: "speclite-flow-gate"
---

# Flow Gate Report: 11-9-normalize-code-review-artifact-directories-by-story-id

## Summary（摘要）

- Mode: `story-completion`
- Target: `11-9-normalize-code-review-artifact-directories-by-story-id`
- Date: `2026-09-09 10:40:39 CST`
- Result: `FAIL_FUNCTION`
- Model Used: `OpenAI GPT-5.6 Sol (medium)`
- Story Status Target: `done`（由后续 CR06 负责；本 gate 不修改 Story、sprint 或 workflow tracker）
- Current CR identity: `storyId=11-9`、`reviewSeries=evidence-v2`、`round=6`、`orchestrationMode=runner`、`handoffTarget=runner`。
- Frozen resolver context: `crDir=canonicalCrDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`；本 gate 未再次运行 CR directory resolver。
- Decision basis: owning contract 与大部分功能/证据锚点存在，但 R6 已确认三个可复现的 production behavior 缺口仍未修复。用户已明确接受其当前交付风险并登记为 T1；该授权合法完成 CR05 延期登记，却不构成实际功能实现或等价实现，因此不能把 gate 写成 `PASS` 或 `PASS_EQUIVALENT`。

## Contract Anchors（契约锚点）

- PASS：PRD `FR23g` 与 Epic 11 Story 11.9 要求 CR artifact root 只由 numeric Story ID 生成；legacy-only unfinished run 必须单目录恢复，canonical/legacy 无法唯一判断时必须稳定诊断并 stop-before-write。
- PASS：shared `speclite-code-review-contract/references/cr-contract.md` 固定 numeric `storyId`、canonical `{storyId}-code-review/`、runner 单次解析/下游复用、structured classifier、legacy recovery matrix、malformed-current-intent fail-close 与 evidence 无法唯一绑定时阻断。
- PASS：Story AC1–AC12、`Anchor Contract Map`、`Equivalent Implementation Policy`、`File List` 与 `Anchor Evidence Summary` 均存在；Story 当前为 `review`，sprint tracker 的 exact key 同为 `review`，没有提前写成 `done`。
- PASS：R6 current review/evaluation/CR04/CR05 的 Story、series、round、scope 与 source hash bindings 一致；CR04、CR05 均为 `COMPLETED`，CR05 已消费用户授权并将五项 deferred finding 映射到 `TODO-018`–`TODO-022`。
- PASS：用户于 2026-09-08 明确接受 R6 三个原技术 P1 的当前交付风险并要求转 TODO；2026-09-09 又明确批准四个并发 core Skill 文件保持原样、精确排除出 Story 11.9。授权没有修改 PRD、Epic、Story、SPEC 09 或 shared CR contract 的行为要求。

## Functional Anchors（功能锚点）

- PASS（已成立范围）：current resolver 只接受规范 numeric Story ID；runner 将一次解析的 `crDir` 传播给 CR01–06；canonical/legacy 基本恢复矩阵、stable redacted diagnostic、reserved subpath containment、tracker/finalizer 认证、active title-bearing scan 和 installed resolver parity 均已有实现。
- FAIL：unfinished current-v2 authenticity 仍只以 identity 字段参与目录恢复选择。`resolve-cr-directory.mjs:291-311` 在 current candidate 路径仅检查 `validArtifactIdentity()`，因此 identity-only 的残缺 review 仍可能把 title-bearing legacy directory 授权为后续写入 root。该行为违反 Story AC9 与 shared contract 的“evidence 无法唯一绑定 current series/round 时 block”要求；对应 fingerprint `sha256:3efe0732e9f9a20aa9940913efe212d59102bf583c2ffbe8a551e123e5bacb20` / `TODO-018`。
- FAIL：near-current filename classifier 仍遗漏非法 `~round` delimiter。`resolve-cr-directory.mjs:445-458` 仅把 `. + : @` 等 selected-series delimiter 识别为 malformed；`11-9-code-review-summary-20260905-main~round-1.md` 可被静默归为 unrelated，而不是 `malformed-current-intent` 并 fail-close。该行为违反 shared classifier contract；对应 fingerprint `sha256:6a902447d67688642c6465da4fe74e1914a6011c0a9214b3346d734836dbfdc8` / `TODO-019`。
- FAIL：bounded inline-list parser 仍会把未加引号的 YAML flow mapping item 当作 path scalar。`resolve-cr-directory.mjs:695-715,780-854` 对 review predecessor 的四个 list 字段使用 bounded parser，但没有拒绝 unquoted colon+ASCII-whitespace mapping indicator；`declaredFiles: [src/a.ts: injected]` 因而可参与完成认证。该行为违反 predecessor artifact authentication 语义；对应 fingerprint `sha256:dd07435baba8abce70cb0f54bdf7a7a43c42b020c7c42cb8dbe5325983813ddc` / `TODO-020`。
- RESULT：三个缺口都有明确 owning contract 与当前 source failure path，不是 contract 缺失，也不是 Story-local path guidance 差异；依最严重结果顺序应判 `FAIL_FUNCTION`。

## Evidence Anchors（证据锚点）

- PASS：current scope manifest `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/.tmp/evidence-v2-round-6/scope-rebind-2.json` 绑定 `baseSha=headSha=ff7528d3f9ec34072bb669ee79f7569345c23d47`、`678 actual / 41 declared / 637 excluded / 0 exceptions`、`scopeHash=sha256:d93db82ef3ae4e6c97da4bb1a4f6b6e3a635a8541de35b36661bac8d6f956186` 与 `sourceMutationAt=2026-09-08T08:13:09.208Z`。本 gate 生成前 live path set 与 manifest 双向相等，41 个 declared digests 无已报告漂移。
- PASS：current review `11-9-code-review-summary-20260908-evidence-v2-round-6.md` canonical hash 为 `sha256:fbb1e95fe261443fc59a6fbf7f9f1fe345bdcab002ef32e321f3202a6b527176`，scope complete、三层 quorum=`3/3`、`acCoverageComplete=true`，verdict=`FINDINGS_REPORTED`；AC9 明确失败。
- PASS：current evaluation `11-9-code-review-evaluation-20260908-evidence-v2-round-6.md` canonical hash 为 `sha256:22724d2503314a6e4d5a1cf9935b83a3114a96f0b2cdf5f4e34496b4849d5594`，`generatedAt=2026-09-09T02:14:43Z`，verdict=`PASS_WITH_DEFERRED_TODOS`，counts=`p0:0 / p1:0 / deferred:5 / verifyRequired:0 / dismissed:3`。正文明确三项原技术 P1 未修复，`p1=0` 只表示用户例外后的 current-delivery blocking obligation 为零。
- PASS：current CR04 canonical hash 为 `sha256:c86237b3b6fcb70a880381c650ab9010a1029d07e59ae18a6068b9246fde55b8`、result=`COMPLETED`；current CR05 canonical hash 为 `sha256:30afa643846c0da9a8c6dac6df55129f9285283a28e8f6e0a608a9fec7600831`、result=`COMPLETED`，且 backlog canonical hash 为 `sha256:868deabd5fd2c537dd380cf8be2df827d910e6943ece1942d3b4c9595b98b874`。
- PASS：本 gate fresh 执行 `npx --no-install vitest run test/code-review-contract.test.ts --reporter=dot`，结果 `110 passed / 4 todo / 0 failed`、exit `0`、duration `10.12s`；`node --check` resolver 通过，resolver + focused test 的 scoped `git diff --check` 通过。
- LIMIT：focused green 证明既有 110 项行为未回归，但 current test corpus 没有关闭上述三个 R6 反例。current Reviewer/Evaluator 的静态控制流证据直接证明缺口仍存在，因此不能用 green suite 覆盖已知 negative evidence。
- HISTORY：被替换的旧 completion gate 已逐字保全到 `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/.tmp/evidence-v2-round-6/completion-gate-before-closeout.md`，raw SHA-256 为 `7560114371ee86f71fbc33f12e010c140ec2fbe14000668b16b17d9b1745f0da`。其 `generatedAt=2026-09-07T04:45:00.000Z`，早于 current `sourceMutationAt` 与 R6 evaluation，只是历史 evidence，不是本轮 current gate。

## Guidance Equivalence（指引等价性）

- Story 曾把不存在的 shared `cr-config.md` 列为预计更新面；kickoff 已将 shared contract + executable resolver 判为允许的 equivalent implementation，该 guidance path mismatch 继续不构成阻塞。
- 当前三个 T1 不是文件名、模块拆分或 Story-local guidance drift；它们分别改变 legacy write-root authorization、near-current malformed detection 与 predecessor authentication 的实际行为。没有另一条 functional implementation 或 focused evidence 能证明行为等价，因此不适用 `PASS_EQUIVALENT`。
- 用户风险接受改变的是 current CR disposition 和 delivery route，不改变实现 bytes、失败反例或 owning contract。将它写成等价实现会掩盖已知风险，与授权记录“保留技术未修复事实”相冲突。
- 两项历史 T2（RFC3339 小数秒 freshness 精度 `TODO-021`、superseded ordinal lineage `TODO-022`）继续保持 deferred，不机械升级；本 gate 的 `FAIL_FUNCTION` 由三个当前可复现 T1 触发。

## Foundation Handoff（地基交接）

- `foundationPrerequisiteStatus=PASS`：项目没有 `_bmad-output/implementation-artifacts/foundation-handoff/source-index.json` 或 `_speclite/custom/speclite-flow-gate.toml`；Story 11.9 使用显式 predecessor refs。Story 11.1–11.8 的 exact `story-completion` reports 均为 v2 且结果为 `PASS` 或 `PASS_EQUIVALENT`，Story 11.9 exact kickoff gate 为 `PASS`。
- `closureOwnerCheckStatus=PASS`：Epic 11、PRD FR23g 与 shared CR contract 都把 numeric root、single propagation、legacy recovery/ambiguity closure 归给 Story 11.9；Story 11.10 仍是独立的 grill-related read-only inventory owner，不承接本 gate 的三个 resolver 缺口。
- Foundation/closure owner 检查通过只证明前置与归属明确，不覆盖当前 Functional Anchor 失败。

## Missing Or Ambiguous Items（缺失或歧义项）

- 没有 scope、identity、authority、tracker binding、CR04/CR05 lineage 或 TODO 映射歧义；四个并发 core Skill 文件已有精确排除批准，不再次请求延期或 scope 授权。
- 当前唯一 blocking facts 是三个已知、未修复的 Functional Anchor failure；它们已有用户风险接受和 TODO 登记，但 flow-gate contract 没有“以风险接受替代实际实现并返回 allowing result”的枚举或等价规则。
- 本 gate 不修改 shared contract，也不把 CR `PASS_WITH_DEFERRED_TODOS` 机械翻译为 Flow Gate `PASS`。若交付方坚持不修复而仍要求 CR06 收口，需要由 owning lifecycle/Flow Gate contract 提供显式、可机读且不冒充功能等价的批准路径；当前合同下本 gate 不能自行发明该语义。

## Recommended Next Action（推荐下一步）

停止在本 `FAIL_FUNCTION` gate：runner 不得调用 CR06，不得把 Story/sprint 写为 `done`，也不得启动 Story 11.10。无需再次请求已经完成的 P1→T1 延期授权；下一动作只能是二选一并由 owning workflow 明确处理：实现 `TODO-018`–`TODO-020` 对应的三个 bounded resolver 修复并重新生成 fresh review/evaluation/CR04/CR05/completion gate，或先通过受控 contract/correct-course 明确定义“已接受风险但功能未等价”如何成为 machine-readable allowing completion outcome。两项 T2 保持延期。

---

*本文档由 speclite-flow-gate Skill 自动生成*
