---
Story: 6-2
Round: 1
Date: 2026-06-02
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具在当前运行环境不可用，已降级为串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均已完成。`npm test` 通过（270 / 270）；定向 `npx vitest run test/fixture-release-gates.test.ts test/update-planning.test.ts test/fixture-contract.test.ts` 通过（32 / 32）；`npm run lint` 不适用（`package.json` 未定义 lint script）；`npm run build` 未执行，因为本次用户要求严格只读且 build 会重写 `dist/`。本轮发现 2 个阻塞问题，建议不通过。

## 新发现

### 1. [高] Normal update apply 后未同步 installed-state 投影，下一次 update 会把刚应用的更新误判为 installer-owned drift

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/update/update-plan.ts:120-132` 在 `currentHash === entry.hash` 且 canonical `sourceHash !== entry.hash` 时产生 `update` action，`expectedHash` 指向新 canonical hash。
  - `src/update/update-plan.ts:146-153` 只在 `writeAuthorized` 时调用 `applyUpdateActions`，并把原始 `context.filesIndex` 传入 apply。
  - `src/update/update-plan.ts:575-685` 的 `applyUpdateActions` 只执行 `safeWriteFile` 并返回 `changedPaths` / `skippedPaths`，没有更新 `_speclite/_config/files-index.json`、manifest/index projection 或对应 entry hash。
  - `test/fixtures/existing-install-update/expected/command-json/normal-update-success.json:31-67` 记录 `_speclite/config.toml` 已 changed，`updatePlan.actions[2].expectedHash` 已是新 hash，但 expected output 没有任何 files-index / manifest projection update。
  - 定向复现：用一个 installer-owned `_speclite/config.toml`、旧 files-index hash 和新 `canonical/config.toml` 运行 `speclite update --yes` 后，第一次结果为 `success` 且 `changedPaths=["_speclite/config.toml"]`；紧接着普通 `speclite update` 返回 `failure`，`conflicts[0].reason="installer-owned-drift"`，`currentHash` 为刚写入的新 hash，`expectedHash` 仍是旧 files-index hash。

- **影响**
  - 违反 AC4：normal update 的 planned/apply 结果与 manifest/files-index projection 没有形成一致的已安装状态。
  - 违反 AC7：刚由 installer 应用的 safe planned update 会在下一次普通 update 中被当成 installer-owned drift conflict，导致 release gate 只能证明一次性写入，不能证明 existing install update 的持续可用状态。
  - 该问题也会让后续 `validate` / `update` / 显式 repair fixture 继承错误基线。

- **建议**
  - 在 normal update 成功 apply installer-owned `create` / `update` 后，同步更新 installed-state projection：至少更新 files-index entry 的 `hash` / `hashAlgorithm` / source projection，必要时同步 manifest/index snapshot 的 owning contract 字段。
  - 为 release gate 增加回归断言：`update --yes` 后立即再跑一次普通 `update`，应无 `installer-owned-drift` conflict，且 planned action 不应再次要求同一路径 update。
  - Expected outputs 应覆盖 apply 后的 files-index / manifest projection，而不是只覆盖 command JSON。

### 2. [高] Existing update conflict failure 缺少 AC8 要求的 step state，且冲突 summary 错误宣称已应用更新

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/command-result.ts:297-315` 对 `update.conflicts` 只写入 `details.conflictCount`，没有 `completedSteps`、`failedStep`、`pendingSteps`、`manualAction` 或具体 blocking conflict reason 的 structured fields。
  - `src/diagnostics/output.ts:178-275` 的 update human renderer 输出 Summary、Plan、Authorization、Changed/Skipped Paths、Conflicts、Issues 和 Next actions；冲突分支只打印 `affectedPath`、`ownership`、`reason`、`nextAction`，没有 completed step / failed step / pending step 状态。
  - `test/fixture-release-gates.test.ts:239-264` 的 conflict gate 只断言 exit code、`update.conflicts`、conflict path/reason、无 ready summary；没有断言 AC8 要求的 completed steps、failed step、pending steps。
  - `test/fixtures/existing-install-update/expected/command-json/installer-owned-drift-conflict.json:3-18` 是 failure，但 `summary` 写成 `"SpecLite update applied authorized non-conflicting installer-owned planned updates."`，与 `writeAuthorized=false`、`changedPaths=[]` 和 conflict failure 矛盾。

- **影响**
  - 违反 AC8：existing update fixture 失败输出必须包含 completed steps、failed step、pending steps、blocking issue/conflict reason 和 suggested manual action，且 automation 依赖必须在 structured fields 中存在。
  - 错误 summary 会让 human-readable output 和 JSON consumer 误判失败命令已经应用更新，削弱 release gate 对 failure behavior 的证明力。

- **建议**
  - 为 normal update conflict failure 建立稳定 step state，例如 completed planning steps、`failedStep: "update-conflict-detection"` 或具体 path step、pending apply steps，以及 conflict-specific manual action。
  - `projectUpdateCommandIssues` 或上游 `planUpdate` 应把这些 structured fields 写入 `update.conflicts` issue details；human renderer 应展示这些字段。
  - 修正 conflict expected JSON summary：冲突时应说明 update stopped/blocked by conflicts，而不是 applied updates。
  - 补充 fixture release gate 断言，覆盖 JSON structured fields 和 human-readable Evidence profile 中的 failed/pending step state。

## 验证摘要

- `npm test` ✅ 通过（270 / 270）
- `npm run lint` 不适用（`package.json` 未定义 lint script）
- `npm run build` 未执行（用户要求严格只读；该命令会重写 `dist/`）
- 定向复现 ✅ 完成
  - `npx vitest run test/fixture-release-gates.test.ts test/update-planning.test.ts test/fixture-contract.test.ts`：3 files / 32 tests passed
  - 一次性 `npx tsx -e ...` 复现 apply 后再次 update：第一次 `success`，第二次 `failure` + `installer-owned-drift`

## 通过项

- Fresh install release gate 已覆盖 53 个 canonical package roots、两个 IDE mirror 各 53 个 skill directory、`files-index` 中 106 个 `SKILL.md` entry、project-relative POSIX paths，并通过 full installed-state snapshot 与 repeated run determinism 比较。
- ReadyCheck 成功路径只在 completed `ready-check` / `ready-summary` 后展示 ready summary；失败路径断言不展示 ready summary / release-ready summary。
- Existing update normal fixture 已覆盖 dry-run planned effects 与 apply result 分离：dry-run `changedPaths` / `skippedPaths` 为空，`--yes` apply 后只变更 installer-owned planned path。
- Human-owned `_speclite/custom/*.toml` 和 workflow-owned `_speclite-output/*` 在 normal update 中以 `skip` + `reason` 保护，并有 byte-for-byte unchanged 断言。
- Installer-owned drift 在 normal update 中进入 `conflicts[]`，`CommandResult.status=failure` 且 exit code non-zero。
- 普通 `existing-install-update` fixture 未混入 `update --repair`：expected data 不包含 `repairPlan`、`restore-canonical` 或 `regenerate`，README 已 handoff 给 Story 6.3 / 6.4。
