---
Story: 11-2
Round: 3
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

# Code Review Summary（代码审查摘要）

## Verdict（结论）

Round 3 reviewer 结论：通过。本轮未发现新的阻塞项、中高优先级缺陷或需要重新返修的问题。

历史 findings 当前状态：

- Round 1 Finding #1：ReadyCheck / manifest reconciliation 已关闭。
- Round 1 Finding #2：public docs / brownfield tutorial 当前 fresh roots 更新已关闭。
- Round 2 Finding #1：fresh detailed per-root override mode 经用户批准方案 A 后已关闭。
- Round 2 Finding #2：brownfield tutorial Step 1 / Step 6 当前路径更新已关闭。

是否需要 Evaluator：需要。按 strict-serial CR 流程，本 summary 完成后下一步应启动 fresh `bmenhance-cr-02-evaluator 11-2` Round 3；不得直接进入 CR04/CR05/CR06 finalizer。

## Method（方法）

本轮在当前上下文中串行执行三层复核：

- Blind Hunter：复核历史 findings、源码实现、schema / manifest / command result 投影、ReadyCheck 与 summary propagation。
- Edge Case Hunter：复核 quick/default、blank Enter、仅 `output_folder`、fresh detailed per-field override、zero-mutation、legacy / existing boundary 与 11.3+ scope boundary。
- Acceptance Auditor：复核 Story 11.2 AC、SPEC 09 controlled correction、Story 11.1 / 11.2 / kickoff gate 一致性、public docs 与 fixture gates。

`failed_layers`：

- `parallel-agent-dispatch-unavailable`：当前运行上下文未暴露协作 agent 工具，不能启动 Skill 期望的并行 reviewer agents。
- `standalone-acceptance-auditor-skill-missing`：当前可用 Skill 列表中没有独立 Acceptance Auditor Skill；本轮由当前 reviewer 在同一上下文内串行覆盖 auditor 检查。

## Historical Findings Review（历史问题复核）

### Round 1 Finding #1：ReadyCheck Reconciliation（已关闭）

复核结果：关闭。

证据：

- `src/installer/ready-check.ts` 的 reconciliation key 包含 `resolutionMode`，并比较 manifest projection 与 expected projection。
- `src/installer/ready-check.ts` 在 `ReadyPaths` 中从 manifest projection 取 `artifactRoots`，同时 runtime paths 使用 resolved roots。
- `test/install-progress-ready-summary.test.ts` 覆盖 missing `artifactRoots`、order mismatch、path mismatch、duplicate projection 与 legacy manifest omit 场景。

本轮重点判断：ReadyCheck 不再只检查单一 `artifactRoot`，也不会把 manifest projection 当成第二套 config truth；实际比较的是 resolver/manifest 输出的一致 ordered projection。

### Round 1 Finding #2：Current Public Docs Fresh Roots（已关闭）

复核结果：关闭。

证据：

- `docs/tutorials/first-brownfield-project.md` Step 1 现在将 brownfield 状态文件定位到 `_speclite-output/project-knowledge-base/brownfield/project-scan-report.json`。
- `docs/tutorials/first-brownfield-project.md` Step 6 允许路径现在区分 `_speclite-output/project-knowledge-base/brownfield/**` 与 `_speclite-output/2-planning-artifacts/...`。
- Step 5 的 project knowledge / planning split 已由 Round 1 修正，本轮未将其误判为 Round 2 fixer 越界。

仍保留的非阻塞项：

- `docs/reference/workflow-artifact-layout.md` 中面向后续 workflow routing 的泛化表述仍属于 Story 11.4+ / CR TODO 范围，不构成 Story 11.2 当前 blocker。

### Round 2 Finding #1：Fresh Detailed Per-Root Override Mode（已关闭）

复核结果：关闭。

用户批准的方案 A 已落地：fresh detailed prompt 中，某个 artifact root field 的非空逐 field 输入标记为 `explicit-config`；未显式输入的 artifact root fields、quick/default flow、以及仅由 `output_folder` 派生出的 roots 继续标记为 `fresh-default`。

证据：

- `SPEC 09` 新增 `Controlled Correction 2026-09-03`，明确 fresh detailed 非空逐 field 输入是 `explicit-config`，同时保留并收窄 2026-09-02 kickoff 原决策。
- Story 11.2 AC4 增加 controlled correction，明确 fresh detailed override mode 语义。
- Story 11.2 kickoff gate 保留原 bullet，并用 2026-09-03 controlled correction supersede 最后一句；没有静默改写历史。
- `src/config/artifact-root-resolver.ts` 在 fresh lifecycle 中先检查 explicit config value，存在时返回 `resolutionMode: "explicit-config"`；否则基于 fresh default / `output_folder` 派生并返回 `fresh-default`。
- `test/artifact-root-resolution.test.ts` 覆盖 fresh detailed per-field override：被覆盖 field 为 `explicit-config`，未覆盖 field 保持 `fresh-default`。
- `test/config-initialization.test.ts` 覆盖 quick + custom `output_folder` negative guard：所有 roots 仍为 `fresh-default`；并覆盖 detailed planning override 为 `explicit-config`。
- 本轮 ad-hoc full install propagation check 验证 command JSON 与 manifest 中 `planning_artifacts` 均为 `_out/plans` + `explicit-config`，其它 roots 为 `fresh-default`。

判断：Round 2 的 decision_needed 已由 owner decision + controlled correction + resolver/test/propagation evidence 闭环。

### Round 2 Finding #2：Brownfield Tutorial Step 1 / Step 6（已关闭）

复核结果：关闭。

证据：

- Step 1 当前检查路径为 `_speclite-output/project-knowledge-base/brownfield/project-scan-report.json`。
- Step 6 当前允许路径包含 `_speclite-output/project-knowledge-base/brownfield/**` 与 `_speclite-output/2-planning-artifacts/...`。
- 本轮 `git diff -- docs/tutorials/first-brownfield-project.md` 显示 Step 1 / Step 6 是 Round 2 批准范围内修正；Step 5 属于 Round 1 已批准修正，不作为本轮越界问题。

判断：tutorial 修复范围与批准范围一致，无额外 scope violation。

## Current Scope Checks（当前范围检查）

### SPEC / Story / Kickoff Consistency（一致性）

通过。

- `SPEC 09`、Story 11.1、Story 11.2、Story 11.2 kickoff gate 都明确了 2026-09-03 controlled correction。
- 2026-09-02 kickoff 原始 “fresh install all seven roots are `fresh-default`” 决策没有被删除；新修正只 supersede 该 bullet 的最后一句并限定适用范围。
- Story 11.2 AC7 仍限定为 fresh-install projection，不实现 existing fallback / mismatch / migration，不修改 Analysis、Planning、UX、Readiness 或 CR workflow 的具体路由。

### Resolver Guards（解析器守卫）

通过。

- Fresh lifecycle 对非空逐 field explicit config 返回 `explicit-config`。
- CLI detailed prompt 只在 trimmed answer 非空时写入 `values[field]`；blank Enter 不生成 explicit override。
- Fresh quick/default 与仅 `core.output_folder` 派生 roots 均保持 `fresh-default`。
- Invalid unresolved-token override 在 planned writes 前失败，保持 zero-mutation 语义。

### Propagation（投影传播）

通过。

- Manifest projection 包含 `field`、`configPath`、`placeholder`、`resolvedRoot`、`resolutionMode`、`plane`、`ownership`、`contractRefs`。
- `CommandResult` schema 继续保留 `data.paths.artifactRoot` 兼容字段，并新增 optional `artifactRoots` projection。
- Ready Summary 渲染 filesystem planes，并展示 root、phase/plane、mode、ownership 与 Public Documentation separation。
- ReadyCheck 使用同一 ordered projection 做 manifest reconciliation。

### Additive v1 / Zero Mutation（兼容与零写入）

通过。

- `speclite.command-result.v1` 与 `speclite.manifest.v1` 未 bump schema version；新增字段为 optional/additive。
- 写入仍在 final write plan 授权与 operation lock 后执行；相关 tests 覆盖 failure before planned writes。

### Canonical / Package Boundary（Canonical 与发布边界）

通过。

- Canonical source checker warn / strict 均返回 `status: ok` 且 `findings: []`。
- Governance impact 将 `assets/source/speclite/sdlc-skills/module.yaml` 分类为 D0 canonical-source-truth / module-discovery-contract，未要求独立 decision record。
- D1 public docs evidence 已由当前 docs 更新与 `npm run docs:check` 覆盖。
- D2 frozen legacy / historical record 不在本次直接 impacted scope；历史 kickoff / Story 记录通过 controlled correction 保留原文并追加修正，不做静默改写。
- `npm run release:packaging-check` 通过。

## Verification（验证）

本轮已执行并记录以下验证：

- `npx vitest run test/artifact-root-resolution.test.ts test/config-initialization.test.ts`
  - Result：PASS，2 files passed，18 tests passed。
- `npx vitest run test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts test/fixture-release-gates.test.ts test/resolve-readers.test.ts test/artifact-path-validation.test.ts`
  - Result：PASS，5 files passed，48 tests passed。
- `npm run docs:check`
  - Result：PASS，72 Markdown files，5 drafts。
- `npm run build`
  - Result：PASS，`tsup` build completed。
- `npm test`
  - Result：PASS，61 files passed，481 passed，4 todo。
- `npm run release:packaging-check`
  - Result：PASS，release / dist manifest checks passed。
- `git diff --check`
  - Result：PASS，exit 0，无输出。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`
  - Result：PASS，`status: ok`，`findings: []`，`decisionRecordRequired: false`。
- Strict canonical checker
  - Result：PASS，`status: ok`，`findings: []`。
- Skill density checks for `speclite-canonical-source-governance-runner` and `speclite-check-canonical-source-change`
  - Result：PASS，no density warnings。
- Ad-hoc full install detailed propagation check via `npx tsx --eval`
  - Result：PASS，`exitCode: 0`；`commandPlanning` 与 `manifestPlanning` 均为 `resolvedRoot: "_out/plans"`、`resolutionMode: "explicit-config"`，其它 command projection modes 为 `fresh-default`。
- `npm run lint`
  - Result：未配置，失败原因为 missing script；不作为产品回归证据。

说明：ad-hoc propagation check 前两次失败属于 eval harness / TLA 与 `.js` import resolution 调试问题；最终使用 async main + direct TS import rer跑通过，产品代码行为由最终通过结果和测试集共同支撑。

## New Findings（新发现）

无。

分类统计：

- New P0/P1/P2 findings：0
- New `decision_needed` findings：0
- New `patch_required` findings：0
- Known deferred / future scope：1（`workflow-artifact-layout.md` generic routing strings，归属 Story 11.4+ / CR TODO，非 Story 11.2 blocker）

## Next Step（下一步）

启动 fresh `bmenhance-cr-02-evaluator 11-2` Round 3，对本 summary 与当前 HEAD / worktree truth 做独立 evaluator 判定。Evaluator 通过前，不应启动 CR04/CR05/CR06 或 Story 11.3。
