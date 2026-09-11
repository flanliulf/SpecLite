# Anchor Evidence（锚点证据）

## Current Round Boundary（当前轮边界）

- 本轮输入是相对显式 base `ff7528d3f9ec34072bb669ee79f7569345c23d47` 的完整 42 文件 current diff，包含 baseline 41 个 approved source paths 与 `release/packaging-manifest.json`。
- Frozen context: `storyId=11-9`、`reviewSeries=directory-routing`、`crDir=canonicalCrDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`。
- 主 directory resolver 已唯一运行一次；本轮每次写入只调用 production `--mode validate-context`，不得重跑 `--mode resolve`。
- Shared contract 从 `## Review Scope Manifest` 到 EOF 的 current normalized hash 为 `305ac191483eb724e78aa23d4f69aacd54edfcf152976114babe61d91ce86f97`，与 HEAD 对应审批 tail 保持逐字节一致。
- Story 与 sprint tracker 当前仍为 `review`；Story 11.10 仍为 `ready-for-dev` 且未启动。

## CR03 Fix Evidence（CR03 修复证据，仅供核验）

- Round 1 evaluation current raw/canonical hash: `bbbc4df791371ed585896614dcaf486961e290d1c21c914544d2b3b4867dbded`；其原 verdict 仍为 `FIX_REQUIRED`，不能因 fixRecord 自动视为关闭。
- `fixRecord.status=completed`，`sourceMutationAt=2026-09-09T12:36:20.348Z`；接受的 P1 为 F1/F2/F3/F4/F5/F6/F7/F9，F8 dismissed。
- 8 文件 fix delta：shared resolver/contract、CR01/CR06 workflow、两个 CR tests、title-bearing ledger 与真实 packaging manifest。Round 2 reviewer 必须独立验证历史 fingerprint 是 closed、recurred、superseded 还是仍有新失败场景。
- Focused evidence: `31 passed / 4 todo / 0 failed`；syntax、3 个 Skill lint、canonical warn/strict PASS。
- Fixed-input isolated build/packaging PASS：input hash `89e2e227744b15acbc7a807ff380446344d16575327a457e9e071fb279436f42`；manifest raw `46af6656c082fd17eb94b0d2ec8178533c38a0c06e42ac96907ec12b7b0ccdf5`；packageHash `sha256:5b47ae5d416c18e535d24b1fb558faf3e41a3cdaa6b1b32bc7dc5be5ba005172`；root live 与 isolated manifest 逐字节一致。

## Freshness And Limits（时效与限制）

- Development completion gate 位于 `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md`，raw hash `e7f93a5531ebfaffe7e483361eca67dd45a4b7e56a8b645d8532dded6935cd1f`，result=`PASS`。
- 该 gate 生成早于 CR03 `sourceMutationAt`，只证明上次 development slice，不是 current closeout gate，不得作为本轮最终完成依据。
- 历史 full suite 为 `695 passed / 13 failed / 4 todo`，不是 full green；固定计数和环境失败保持范围外，不能扩范围修复。
- F8 的运行级保留 `.tmp` 约束继续有效，但不得扩写为 global cleanup policy。
- TODO-018–022 的 fresh 状态在 round 1 evaluation 中已有独立说明；本轮不能修改 backlog，也不能因删除旧代码自动标为 resolved。
