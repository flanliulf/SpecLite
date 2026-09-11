---
schemaVersion: "speclite.flow-gate-report.v2"
mode: "story-completion"
target: "11-9-normalize-code-review-artifact-directories-by-story-id"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
result: "PASS"
generatedAt: "2026-09-09T08:33:22.000Z"
handoffContractVersion: "speclite.story-completion-handoff.v1"
foundationPrerequisiteStatus: "PASS"
foundationPrerequisiteRefs: "Story 11.1-11.8 current completion gates allow continuation; Story 11.9 kickoff gate result=PASS"
closureOwnerCheckStatus: "PASS"
closureOwnerRefs: "Epic 11 Story 11.9; PRD FR23g; NFR14a; NFR40f; shared speclite-code-review-contract"
sourceSkill: "speclite-flow-gate"
---

# Flow Gate Report: 11-9-normalize-code-review-artifact-directories-by-story-id

## Summary（摘要）

- Mode: `story-completion`
- Target: `11-9-normalize-code-review-artifact-directories-by-story-id`
- Date: `2026-09-09 16:33:22 CST`
- Result: `PASS`
- Model Used: `OpenAI GPT-5.6 Sol (medium)`
- Story Status Target: `review`；本 gate 只证明当前 development slice 可以进入正式 review，不替代或预先要求 CR01–06。
- Current development identity: `storyId=11-9`、`reviewSeries=directory-routing`。orchestrator 已唯一运行 production resolver 并冻结 `directory-routing-runtime-context.json`；本 gate 未重跑 resolver。

## Contract Anchors（契约锚点）

- PASS：PRD `FR23g`、Epic 11 Story 11.9 与 Story 原 12 条 AC 继续要求 Story-ID-only root、numeric identity、single propagation、legacy no-migration、ambiguity stop、title/traversal isolation 和 approval scope boundary。
- PASS：shared CR contract 明确 resolver 只拥有 numeric identity、current candidate 归属、`directoryChoice` 与物理安全；approval、tracker、gate、scope/hash、freshness、round 和 coordinated-write 继续由 runner、Flow Gate 与 CR01–06 原 owner 验证。
- PASS：Completion Freshness、Review Scope Manifest 及其后所有 shared approval contract 内容与 HEAD 原始版本逐字节一致；原 `test/code-review-contract.test.ts` 精确保留 15 个审批 tests 与 4 个 `it.todo`。
- PASS：新增 Directory Routing Replacement 六项开发任务全部完成；原 AC、report basenames、CR algorithm、round numbering 与 approval rules 未修改。

## Functional Anchors（功能锚点）

- PASS：`resolve-cr-directory.mjs` 从原 1791 行收敛为 757 行，只接受规范 numeric Story identity，枚举 current canonical/legacy candidates，读取少量 identity 字段并验证 symlink、escape、non-directory 与 identity conflict。
- PASS：无 current candidate 选择 canonical；唯一 current canonical 使用 canonical；唯一 current legacy 即使含 `DONE` claim 仍原位绑定，由正常 approval owner 判断完成性。多个 current candidates 默认 stable fail-close，仅显式 `directoryChoice` 可解决安全归属歧义。
- PASS：`directoryChoice` 不能绕过 unsafe candidate、移动历史 artifacts、合并目录或拆分同一 round；resolver 不读取 tracker、completion gate 或完整 approval history。
- PASS：同一 production script 导出并提供 CLI `validate-context`，逐字段比较 frozen/consumer 的 `storyId`、`reviewSeries`、`crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`，并在 write 前验证物理路径；validator 不重新选择目录。
- PASS：runner 只调用一次 `--mode resolve` 并冻结 `directoryContext`；CR01–06 中英文入口和 workflow 均消费同一 context，并在任何实际写入前调用 production `--mode validate-context`。
- PASS：source README、SDLC module help、public workflow/layout docs 和 title-bearing ledger 已与 directory-only ownership 同步；未修改 SPEC07/09、PRD、installer source、其他 Story、TODO018–022 或 installed mirrors。

## Evidence Anchors（证据锚点）

- PASS：RED 首次为 `1 passed / 9 failed`，resolver/validator 首轮后为 `8 passed / 2 failed`；最终 focused `npm test -- test/code-review-contract.test.ts test/cr-directory-resolution.test.ts` 为 `25 passed / 4 todo / 0 failed`。
- PASS：focused tests 覆盖 numeric/title、canonical/legacy/current ambiguity、explicit choice、unsafe path、zero mutation、frozen-vs-consumer mismatch、strict CLI、single runner resolution、六 consumer preflight、title ledger scan，以及真实 fresh install 到 `.agents/.claude` 后的 byte parity 与 target-cwd resolve/validate CLI。
- PASS：`npm run build`；`npm run docs:check`（72 Markdown、5 drafts）；canonical strict checker（`status=ok`、`findings=[]`）；八个 changed Skill density lint；`node --check`；`git diff --check` 全部通过。
- PASS（定向）：affected matrix 为 `37 passed / 4 failed`；四项失败全部是本 Story 范围外已存在的 core package count `18→19` / default total `68→69` 漂移，未修改相关 assertions。
- PASS（隔离诊断）：关闭 file parallelism、使用独立 npm cache 的 full suite 为 `695 passed / 13 failed / 4 todo`。其中 12 项同属上述外部 fixed-count drift；唯一额外失败是 repo copy 位于 `/private/tmp` 被 local-source 自引用安全规则拒绝，该 test 在允许的系统 TMPDIR 单独重跑为 `14 passed / 0 failed`。没有 directory-routing regression，且 manifest 并发缺失不再复现；不把该结果描述为 full PASS。
- PASS（release）：最终隔离 fixed-input packaging 为 `731 files / 726 runtime assets`，release/dist 与主 manifest raw SHA-256 均为 `029b8110cd2cc87d5870a9ddd7ac185af11b7ff5c4b574d90a791c91efcc576a` 且逐字节一致，packageHash=`sha256:143d04dc22b6ab4dfe2248352841588a696baa7c7146efc8197a28c6ed2c2335`。
- PASS（runtime context）：`directory-routing-runtime-context.json` raw SHA-256=`eec9baeabf11640b339bb09ee502aef4e61df010c6ba59dcf38c7f6c49e26dbb`，记录 `directoryResolutionCount=1`、canonical `crDir`、`legacyArtifactPaths=[]` 及真实 production context validation。

## Guidance Equivalence（指引等价性）

- Story 历史 guidance 曾提到不存在的 shared `cr-config.md`；当前实现继续使用既有 shared contract 与同一 production resolver script，不新增第二个配置 owner。该差异仅是 Guidance Anchor，不影响 contract/function/evidence。
- 新方案没有通过风险接受或 `PASS_EQUIVALENT` 绕过旧 functional failures，而是按用户批准的 directory-layer replacement 直接移除 resolver 中不属于目录归属的 approval replay，并用生产 context validator 关闭真实 consumer consistency。
- 正式 approval E2E 尚未在 development gate 前执行，也不应成为进入 review 的循环前置。实际顺序必须为 fresh CR01/CR02 → 仅在 evaluator 要求时执行 CR03 并 fresh 复审复评 → CR04/CR05 → fresh closeout completion gate → CR06；完整链证据在 CR06 结束后齐备，未触发的 optional CR03 不得冒充已执行。

## Foundation Handoff（地基交接）

- `foundationPrerequisiteStatus=PASS`：Story 11.1–11.8 current completion gates 允许继续，Story 11.9 exact kickoff gate 为 v2 `PASS`；本 Story 的 predecessor 与 implementation owner 明确。
- `closureOwnerCheckStatus=PASS`：Epic 11、PRD FR23g 与 Story 11.9 把 Story-ID-only CR directory closure 归属本 Story；Story 11.10 仍为独立 grill-reference inventory，不承接 directory routing 实现。
- 当前 gate 只允许 development → review；CR04/CR05 后仍须生成更晚的新鲜 closeout gate，验证正式 CR 链、scope/hash、TODO 与 tracker freshness。

## Missing Or Ambiguous Items（缺失或歧义项）

- 没有阻断 development → review 的 contract、functional、evidence、identity、scope 或 directory ownership 歧义。
- 范围外 core `18→19` / total `68→69` fixed-count assertions 仍导致 full suite 非全绿；其失败在开发前已可复现，当前精确排除且本 Story 未修改相关 source/tests，因此不扩范围修复。
- 旧 `FAIL_FUNCTION` completion gate 已在覆盖前逐字节保全到 `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/.tmp/directory-routing-development-completion/gate-before-refresh-fail-function.md`，原始 raw SHA-256=`b013691d7d53c2b91c1397294ba2c82688356212fc596e043e4987ca534c65ff`。本报告是当前 directory-routing development slice 的 fresh gate，不改写旧 evidence-v2 历史。

## Recommended Next Action（推荐下一步）

允许将 Story 11.9 与 sprint tracker 从 `in-progress` 更新为 `review`，然后使用已冻结的 `directory-routing-runtime-context.json` 启动正式 fresh CR01 round 1。不得重跑 directory resolver；依次执行 CR01/02、必要时 CR03 与 fresh 复审复评、CR04/05、fresh closeout gate、CR06，不得跳过 scope/hash/freshness/coordinated-write。

---

*本文档由 speclite-flow-gate Skill 自动生成*
