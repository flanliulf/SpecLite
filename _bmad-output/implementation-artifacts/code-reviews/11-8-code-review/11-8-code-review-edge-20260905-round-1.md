---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-8-rename-and-relocate-implementation-readiness-skills"
round: 1
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T18:43:22.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
---

# Story 11.8 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `5` 项 P1、`0` 项 P2。所有修复路径均可由既有 Story / SPEC 合同唯一确定，`Owner Gate: NONE`。

## P1 Findings（P1 发现）

### P1-1 — 新增的 phase projection 必填参数在两个 IDE target 分支均未传入

- **Location**：`src/ide/target-writer.ts:260-265,310-315`
- **Trigger condition**：为任意 help entry 生成 Claude 或 Agents phase coverage row。
- **Unhandled path**：`createMappedTargetProjection` 的参数类型新增必填 `renamedFromCanonicalSkillIds`，唯一调用点却仍只传 `targetId`、`canonicalSkillId`、`mapped`。因此两个 target 分支都会进入同一个 TypeScript 参数缺失路径；该字段在函数体内也未消费，说明它被误加到了错误的 projection 层。
- **Consequence**：DTS/type gate 被 Story 11.8 的变更直接阻断，completion gate 的 build-passed 声明不能由 current tree 重现。
- **Evidence**：只读 `npx tsc --noEmit --pretty false` 明确返回 `src/ide/target-writer.ts(261,43): error TS2345 ... Property 'renamedFromCanonicalSkillIds' is missing`。该命令同时显示其他 Story 的既存类型问题；本项只引用 Story 11.8 直接引入的精确错误。
- **Guard sketch**：删除该未使用的函数参数，或在唯一调用点传入并在 phase projection contract 中真实消费；按当前 schema，最小修复是删除错误参数。

### P1-2 — clean existing update 保留可直接激活的旧 package，并未实现 old-ID activation redirect/deprecation

- **Location**：`src/update/update-plan.ts:188-201,1206-1223`；`src/modules/module-metadata.ts:105-120`
- **Trigger condition**：existing install 含 hash-clean 的旧 canonical package，用户执行授权 update。
- **Unhandled path**：planner 对旧 package 的每个 files-index entry 生成 `action=skip` / `reason=canonical-skill-renamed`，apply 阶段也只加 precondition 后 `continue`，不会删除、改写为 redirect stub 或让旧 activation target 转发到 replacement。全仓 `resolveCanonicalSkillIdentity` 的生产消费仅在 `update-plan.ts` 的 migration ownership 解析中；help/status/validate/实际 IDE activation 均未消费它。update 后旧 `.agents/.claude/skills/<old-id>/SKILL.md` 仍可按旧 ID 直接运行旧实现。
- **Consequence**：existing install 同时暴露 old 与 active 两套可执行 identity，违反“redirect 或 stable deprecation”以及不得恢复第二 active identity 的合同。
- **Evidence**：`test/update-planning.test.ts:397-410` 只断言 dry-run plan 中 old=`skip`、new=`create`；没有 `yes/writeAuthorized` apply 后 old-ID activation 断言。`rg resolveCanonicalSkillIdentity src test` 只有 metadata 定义、update migration 调用与本 Story 单测调用。
- **Guard sketch**：为 clean old package 生成受 hash/precondition 保护的 deterministic redirect/deprecation entry，或让实际 activation resolver 消费 rename mapping；不得保留可独立执行的旧实现。

### P1-3 — update precondition 的关键 apply/race 分支没有被测试执行

- **Location**：`test/update-planning.test.ts:397-424`；`src/update/update-plan.ts:1211-1222`
- **Trigger condition**：plan 完成后、transaction commit 前，clean old package 被并发修改或移除。
- **Unhandled path**：测试两次 `runUpdateCommand` 都未传 `options.yes`，所以 `writeAuthorized=false`，`applyUpdateActions` 和 `canonical-skill-renamed` precondition 从未运行。测试随后主动把旧文件改成 drift，只验证下一次重新 plan 的 conflict；它没有验证同一轮 plan-to-write 间发生 drift 时 transaction fail-closed，也没有验证 clean authorized reprojection 的最终文件/index 状态。
- **Consequence**：最危险的 TOCTOU/partial-apply 边界仍无 regression evidence，无法支撑 completion gate 关于 apply precondition 与 zero-destructive-write 的结论。
- **Evidence**：`runUpdateCommand` 仅在 `options.yes === true && dryRun !== true` 时授权写入；本测试 `runtime` 参数之外未提供 options，且只断言 `changedPaths=[]` 于 drifted dry run。
- **Guard sketch**：新增授权 apply fixture，并在 transaction prepare 后制造 old-path hash/type/missing drift；断言零 partial writes、稳定 issue、old/new package 与 installed indexes 的最终一致状态。

### P1-4 — Grill reviewer 的主输出 route 硬编码默认目录，custom Solutioning root 会被静默忽略

- **Location**：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:48-66`；`references/record-output-spec.md:3-25`
- **Trigger condition**：目标项目把 `modules.sdlc.solutioning_artifacts` 配置为非默认 project-relative root。
- **Unhandled path**：两份执行合同都把首选目录写死为 `_speclite-output/3-solutioning-artifacts/...`，没有先解析并使用 `{solutioning_artifacts}`，却又声称“若没有可解析 root”才 fallback。readiness-check 使用 placeholder，grill reviewer 不使用，因此两条 route 在 custom config 下分叉。
- **Consequence**：Grill records 写入错误目录，artifact discovery、ownership 与后续 readiness evidence 无法共享同一 resolved Solutioning root。
- **Evidence**：`test/implementation-readiness-rename-routing.test.ts:82-110` 只检查 `module-help.csv` 中 placeholder 出现两次，以及 record basenames 存在；从未以 custom root 验证 workflow/record output location。
- **Guard sketch**：首选路径改为 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`，明确先解析 root，只有解析失败才使用 `.specskills` fallback，并增加 custom-root fixture。

### P1-5 — “classified exact scan”既未覆盖冻结域，也没有逐命中分类

- **Location**：`test/implementation-readiness-rename-routing.test.ts:113-143,168-182`；`test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json`
- **Trigger condition**：old ID/path 残留在 `test/`、`release/`、root scripts/hooks，或 `.js/.cjs/.sh/.py/.txt` 等未列扩展名；或者新增命中属于未授权 role。
- **Unhandled path**：scanner roots 只有 `assets/source/speclite`、`src`、`docs`、root `README.md`，直接漏掉 kickoff 冻结的 `test/` 与 generated fresh-install evidence 的扫描，以及 active release/hooks/scripts surface；扩展名 allowlist 也漏掉常见脚本/文本类型。fixture 的 `allowedOldIdRoles/allowedOldPathRoles` 从未读取，且没有 per-match `{path,line,token,role}` inventory；`surfaceGroups` 只验证路径存在，无法证明每个命中已分类。
- **Consequence**：任意未扫描 active surface 可残留 old identity/path 而测试仍绿，AC6/AC9/AC10 的独立 bounded closure 是 fail-open。
- **Evidence**：kickoff gate 明确冻结扫描域包含 `test/`、generated fresh-install expected state、active hooks/scripts/tests，并要求逐条四类记录；当前测试第 126-131 行没有这些 roots，第 173 行只接受有限扩展名，fixture 的 allowed roles 没有任何消费者。
- **Guard sketch**：生成 deterministic exact-match inventory，覆盖全部冻结 roots/文件类型并 no-follow；每个 match 必须精确关联允许 role，未分类、重复分类、越域或 scan error 均 fail-closed。

## P2 Findings（P2 发现）

无。

## Evidence Boundary（证据边界）

- 已遍历：fresh projection、两个 old-ID resolution、duplicate/missing mapping guard、clean/drifted update plan、authorized apply precondition、legacy no-migration、两条输出 route/basename、exact scan classification。
- 未运行：build、full suite、packaging。
- 只读辅助检查：`npx tsc --noEmit --pretty false`；仅采用其中精确归属于 Story 11.8 的 `target-writer.ts` 错误作为 finding evidence。
- 排除：`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、其 zip、workspace mirrors、fixed-count drift 与其他 Story 的变更/类型错误。

## Owner Gate（Owner 门禁）

`NONE`。五项均是既有合同下的确定性实现/验证缺口，不涉及新的产品、业务或架构取舍。

---

*本文档由 bmad-review-edge-case-hunter Skill 自动生成*
