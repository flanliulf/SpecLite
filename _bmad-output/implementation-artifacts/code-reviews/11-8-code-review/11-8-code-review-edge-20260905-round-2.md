---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-8-rename-and-relocate-implementation-readiness-skills"
round: 2
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T19:09:52.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
---

# Story 11.8 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `2` 项 P1、`0` 项 P2。两项均可由 Story 11.8、Round 1 Evaluator 已授权的 resolver HALT 与 candidate-scan 方案 I 唯一确定，`Owner Gate: NONE`。

## P1 Findings（P1 发现）

### P1-1 — Existing artifact-root resolver 失败被静默吞掉，rename update 会退回 Planning route 继续写

- **Location**：`src/update/update-plan.ts:571-599,611-632,889-899,1007`
- **Trigger condition**：existing project 的任一 artifact root 解析失败，例如 explicit `solutioning_artifacts` 发生 symlink escape，或另一个 root 缺失/不安全。
- **Unhandled path**：`resolveExistingArtifactRootContext()` 在 `resolveArtifactRoots()` 返回 `ok=false` 时只返回 `undefined`，没有把 `rootResult.issues` 并入 planning issues，也没有令 `readPlanningContext()` blocked。随后 `buildCanonicalMigrationProjection()` 以 `createLegacyArtifactRootContext(input.artifactRoot)` 继续构造 projection；该 fallback 明确把 `solutioning_artifacts` 指向 `${artifactRoot}/planning-artifacts`。因此 resolver 的 block/error 不仅没有 HALT，还会在 `writeAuthorized=true` 时按错误 root 生成 renamed package/help/artifact contract 并进入 transaction。
- **Consequence**：不安全或不可解析的配置可触发错误 route 写入，违反 resolver failure 必须 HALT/zero-write 的合同。
- **Evidence**：Round 2 current code 的 `if (!rootResult.ok) return undefined` 与 `input.artifactRootContext ?? createLegacyArtifactRootContext(...)` 形成直接可达分支；focused tests没有构造 `artifact-path.symlink-escape`/missing-required-root 后执行 authorized update 的负向用例。
- **Guard sketch**：保留并传播 `rootResult.issues`，任一 blocking root issue 都令 planning blocked；只有 resolver 明确返回 `legacy-compatible` roots 时才使用其结果，不得把 resolver failure解释为 legacy fallback。

### P1-2 — Candidate-scan 的冻结 roots、exclusions 与 tokens 全由同一 fixture 自证，可缩面后 false-green

- **Location**：`test/implementation-readiness-rename-routing.test.ts:142-193`；`test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:1-30`
- **Trigger condition**：fixture 删除 `test`/`release` candidate root、删除任一 old-ID/path token，或新增一个隐藏 active surface 的 exclusion，并同步删掉对应 ledger rows。
- **Unhandled path**：测试直接用 fixture 的 `candidateRoots`、`excludedPaths` 与 `searchTokens` 决定扫描面，再把结果与同一 fixture 的 `matchLedger` 比较；它没有独立断言这三组 control-plane 值等于 kickoff/Evaluator 冻结的 exact 集合。当前双向 ledger equality、raw-byte读取、no-follow `lstat` 与 role allowlist只约束“fixture选择扫描的内容”，不能阻止 fixture本身缩小范围或移除 needle。这样 active old ID/path residual可以与其 ledger row一起消失，测试仍通过。
- **Consequence**：AC6/AC9/AC10 的 bounded closure gate仍可通过修改扫描配置来规避真实残留。
- **Evidence**：current test在读取 JSON 后立即调用 `listCandidateFiles(manifest.candidateRoots, manifest.excludedPaths)` 并遍历 `manifest.searchTokens`；不存在对 exact roots、exact exclusions、六个冻结 token key/parts 或禁止额外 exclusion 的独立 assertion。
- **Guard sketch**：在测试代码或独立 immutable contract 中固定并 exact-assert authorized roots、exclusions、token key/parts，再执行 fixture ledger equality；任何缺失、额外或变形 control-plane entry 必须先 fail-close。

## P2 Findings（P2 发现）

无。

## Closed Round-1 Paths（Round 1 已闭合路径）

- `createMappedTargetProjection()` 的 Story-owned `TS2345` 已删除，未新增 phase rename schema。
- 两个 old IDs × `.agents`/`.claude` 的 authorized clean update均进入真实 transaction，old entry改写为最小 redirect，active package与 indexes 同步。
- content、executable、non-file/type、missing 四类 precondition在 journal/operation 前 fail-close；target与 journal不发生 partial mutation。
- Grill producer/record spec 已统一要求 resolver-provided `solutioning_artifacts.resolvedRoot`，移除 `.specskills/output/...` fallback；本轮发现的是 TypeScript existing-update consumer吞掉 resolver failure的独立路径。
- Legacy fixture覆盖 install/update/repair 后 path、no-follow regular-file type、raw bytes、hash 与 tree不变；mutation集合与受保护 files无交集。
- Candidate scanner 对当前 fixture选择的文件已采用 raw bytes，并对实际遍历到的 symlink/non-file/scan error fail-close；本轮缺口仅是扫描 control-plane 未被独立冻结。

## Evidence Boundary（证据边界）

- 已遍历：resolver success/failure、explicit/legacy-compatible/fallback route、rename projection、authorized transaction与recovery preconditions、2×2 identity-target apply、raw-byte/no-follow ledger、legacy lifecycle、fresh identity/index projection。
- 未运行：build、full suite、packaging；未修改 production、Story、tracker、gate、root logs或其他 review artifact。
- 排除：`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、其 zip、workspace mirrors、fixed-count drift与其他 Story 的 TypeScript问题。

## Owner Gate（Owner 门禁）

`NONE`。两项都是已锁定合同的 fail-close 实现/证据缺口，不涉及新的业务或架构选择。

---

*本文档由 bmad-review-edge-case-hunter Skill 自动生成*
