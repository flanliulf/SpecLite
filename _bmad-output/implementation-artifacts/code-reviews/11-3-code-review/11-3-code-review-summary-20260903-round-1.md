---
Story: 11-3
Round: 1
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

# Code Review Summary（代码审查摘要）

## Verdict（审查结论）

首轮审查结论：不通过。当前 focused、affected、full test、build、docs、canonical checker、packaging 与 `git diff --check` 均通过，但审查发现 4 个 Story 11.3 范围内的中优先级 patch findings，主要集中在 existing config 读取失败、actual consumed path 发现、ownership skip 边界和 unknown future metadata 兼容性。

当前环境没有可调用的 Agent 并行调度工具，本轮按 `bmenhance-cr-01-reviewer` 降级为当前 reviewer 上下文串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均已覆盖。

`failed_layers`：

- `parallel-agent-dispatch-unavailable`：当前运行上下文未暴露 Skill 期望的内部 Agent 并行调度能力，因此三层审查没有独立子代理隔离执行。
- `standalone-acceptance-auditor-skill-missing`：当前可用 Skill 列表没有独立 Acceptance Auditor Skill；本轮由当前 reviewer 直接按 Story AC / SPEC anchor 执行验收审计。

是否需要 Evaluator：需要。按 strict-serial CR workflow，Reviewer Round 1 不通过后仍需 fresh Evaluator 独立判定 findings 有效性、优先级和 fixer 范围；Reviewer 本轮不修复、不启动 evaluator、不执行 CR04/CR05/CR06、commit 或 push。

## Scope（审查范围）

纳入审查：

- Story 11.3 File List 中的 resolver/status/readout/validation/update/test/SPEC 07 相关文件。
- Story 11.1 / 11.2 最新通过的 CR summary / evaluation 作为前序 baseline。
- Story 11.3 kickoff / completion gate、Story AC、SPEC 07、SPEC 09 与当前 worktree diff。

排除为前序或未来 Story 范围：

- Story 11.1 / 11.2 已完成的 fresh projection、manifest、ReadyCheck、public docs、fixture baseline 与 prior CR artifacts，除非它们直接影响 11.3 contract。
- Story 11.4-11.10 的 workflow routing、rename、inventory、migration、whole/sharded precedence 和 public navigation。

## Findings（新发现）

### 1. [中] `status` 在 config 解析失败时静默退回 manifest paths，并继续输出 success / no issues

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - Story 11.3 要求 existing-state readout 必须消费同一 resolved evidence，不得从 manifest 单一 `artifactRoot` 猜测：`_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md:50`、`:69`。
  - `SPEC 09` 要求 Skill 必须通过 installed runtime config 或 `speclite resolve config` 读取 artifact roots，不得从 manifest projection 反推：`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:62`。
  - 当前 `src/status/installed-state.ts:129-142` 在 `resolveArtifactRootsFromProjectConfig()` 返回 `!ok` 时直接 `return input.manifestPaths`，没有把 config resolver issues 传回 `StatusCommandResult`。
  - `src/commands/status.ts:38-45` 总是构造 `status: "success"` 且 `issues: []`，因此上述 config 失败不会进入 JSON 或 human output。
  - 定向复现：临时 existing install 中写入 malformed `_speclite/config.toml`，manifest 含 7 个 `fresh-default` artifactRoots；`runStatusCommand()` 返回 `exitCode=0`、`status=success`、`issues=[]`，并继续输出 7 个 `fresh-default` modes。

- **影响**
  - Existing explicit authority 被破损 config 隐藏；用户看到的是 manifest/fresh projection，而不是当前 config truth 或 failure 状态。
  - JSON-human parity 也会一致地展示错误状态：human `Filesystem planes` 与 JSON `paths.artifactRoots` 都来自 fallback manifest，不是 resolved existing evidence。

- **建议**
  - `readInstalledStateSummary()` 应在 existing root resolver 失败时保留并输出 resolver issues，将 status health 置为 `failed` 或至少不展示 manifest artifactRoots 作为 current resolved roots。
  - 增加 malformed / unreadable `_speclite/config.toml` 的 `status` JSON + human regression test，断言不会以 fresh defaults 冒充 current state。

### 2. [中] project-level artifact validation 不会真实发现 legacy actual consumed path，mismatch 只在低层 helper 手动传参时成立

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `SPEC 09` 明确：仅修改 config root、但实际 artifacts 仍在旧路径时，validator 必须产生 config/artifact mismatch 诊断，不得报告 migration success：`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:91`。
  - Story 11.3 Anchor Map 要求 existing discovery/output 提供 `configured/resolved/actual reconciliation`：`_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md:87-92`。
  - 当前 `src/validation/artifact-paths.ts:38-82` 只在 `contract.defaultOutputPath` 下调用 `discoverArtifacts()`；没有从 legacy `story_location`、whole/sharded discovery 或其他 consumer evidence 中接收旧 actual path。
  - `src/validation/artifact-paths.ts:51-63` 在新 configured/default output root 下找不到 artifact 时，仅创建 `artifact-path.missing-required-artifact`，不会检查旧路径上的 workflow-owned artifact。
  - 代码库中唯一生产调用是 `src/validation/artifact-paths.ts:52` 和 `:68`；`test/existing-install-compatibility.test.ts:114-149` 的 mismatch 测试直接调用 `validateArtifactPathContract()` 并手动传入 `actualArtifactPath`，未证明 `validateProject()` / `validateArtifactPaths()` 能发现实际 consumed path。
  - 定向复现：configured implementation root 为 `_speclite-output/4-implementation-artifacts`，legacy artifact 实际存在于 `_speclite-output/implementation-artifacts/stories/legacy.md`；调用 `validateArtifactPaths()` 只返回 `artifact-path.missing-required-artifact`，`artifactChecks.artifactPaths=[]`，没有 `artifact-path.config-artifact-mismatch` 或 `actualConsumedPath`。

- **影响**
  - AC4 / AC5 在 validate/project-level producer 上未闭环：低层 issue taxonomy 是稳定的，但实际 workflow-owned artifact divergence 不能被发现。
  - Completion evidence 中的 `actualConsumedPath` 容易变成 fixture 手写值，而不是 consumer 真实消费路径。

- **建议**
  - 让 project-level validation 接收或计算 actual consumer paths，例如 legacy `sprint-status.story_location`、whole/sharded discovery result 或 phase consumer handoff，并把这些 paths 传入 `validateArtifactPathContract()`。
  - 增加 `runValidateCommand()` 或 `validateProject()` 级别测试，构造 config root 与 legacy artifact path 不一致的 existing install，断言输出 `artifact-path.config-artifact-mismatch` 且 `details.actualConsumedPath` 为真实旧路径。

### 3. [中] artifact root 可覆盖 installer namespace，update/repair 会把 installer-managed files 误判为 `workflow-owned skip`

- **来源**：blind+edge
- **分类**：patch

- **证据**
  - Story 11.3 要求 no-migration 保护不能过宽吞掉 managed updates；File List 明确触及 `src/update/update-plan.ts` / `src/update/ownership-model.ts` 的 ownership assertions。
  - `src/config/config-schema.ts:118-159` 只校验 artifact root 是 project-relative POSIX 且不逃逸项目；没有拒绝 `_speclite`、`_speclite/_config`、`.claude/skills`、`.agents/skills` 等 installer/control namespaces。
  - `src/update/ownership-model.ts:50-58` 在 `isInstallerOwnedPath()` 之前检查 configured `artifactRoots`，所以路径一旦落在 configured artifact root 下，就先被分类为 `workflow-owned`；installer-owned path 规则位于 `src/update/ownership-model.ts:109-120`，不会再生效。
  - `src/update/update-plan.ts:113-132` 会把 files-index 中原本 `installer-owned` 但被 classification 判为 `workflow-owned` 的 entry 直接加入 `skip`；repair 路径在 `src/update/update-plan.ts:365-379` 也有同样提前 skip。
  - 定向复现：`resolveArtifactRoots()` 接受 `modules.sdlc.implementation_artifacts = "_speclite"`，`issues=[]`；随后 `classifyOwnership({ relativePath: "_speclite/_config/manifest.yaml", artifactRoots: ["_speclite"] })` 返回 `ownership="workflow-owned"`、`reason="workflow-owned"`。

- **影响**
  - 若 existing config 或 mixed config 把某个 artifact root 指向 installer/control namespace，普通 update / `update --repair` 可能跳过 manifest、files-index、skill package 或 hook config 等真正 installer-managed files。
  - 这会把 no-migration 保护扩大成 managed update bypass，正好破坏 Story 11.3 的“保护 workflow-owned artifacts，但不吞掉 managed updates”边界。

- **建议**
  - 在 artifact root resolver/config validation 中拒绝与 installer-owned namespaces 重叠的 roots，或在 `classifyOwnership()` 中让 installer-owned namespaces 优先于 configured artifact roots。
  - 增加 `_speclite`、`_speclite/_config`、`.claude/skills`、`.agents/skills` 与 nested overlap 的 update/repair regression tests。

### 4. [中] unknown future metadata 被 `.strict()` schema 拒绝，兼容性边界未覆盖

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - Story 11.3 Testing Requirements 明确要求覆盖 `unknown future metadata`：`_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md:61-65`。
  - 当前 `src/manifest/manifest-schema.ts:89-101` 的 `WorkflowArtifactMetadataSchema` 使用 `.strict()`，任何未知字段都会被 Zod 判为 `unrecognized_keys`。
  - `src/validation/rules/artifact-path.ts:311-355` 对 metadata 直接调用该 strict schema；一旦有未知字段，就返回 `artifact-path.invalid-required-metadata`。
  - 定向复现：`WorkflowArtifactMetadataSchema.safeParse({ workflowType, sourceSkill, generatedAt, futureKey: "ok" })` 返回 `success=false`，错误为 `Unrecognized key: "futureKey"`。
  - 新增 `test/artifact-path-validation.test.ts` 与 `test/existing-install-compatibility.test.ts` 只覆盖必填 metadata、缺失/非法 metadata 和 sourceSkill mismatch，未覆盖 unknown future metadata 正向兼容。

- **影响**
  - Existing workflow artifacts 一旦带有未来版本附加 metadata，会在当前 validator 中被判 invalid，破坏 existing install 的向后/向前兼容读取。
  - 该问题与 no-migration 一起会造成普通 validate/update 流程要求用户“修复”其实可忽略的 future metadata。

- **建议**
  - 对 workflow artifact metadata 使用 passthrough / loose object，同时继续严格校验 `workflowType`、`sourceSkill`、`generatedAt` 这三个 required keys 的值域。
  - 增加 frontmatter、sidecar、directory metadata 三种位置的 unknown future metadata regression tests。

## Verification（验证摘要）

- `npx vitest run test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts --reporter=dot`：PASS，2 files / 13 tests。
- `npx vitest run test/artifact-root-resolution.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/update-planning.test.ts test/fixture-release-gates.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts --reporter=dot`：PASS，7 files / 86 tests。
- `npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts --reporter=dot`：PASS，6 files / 61 tests。
- `npm test -- --reporter=dot`：PASS，62 files / 485 passed / 4 todo。
- `npm run lint`：未配置，NPM 返回 `Missing script: "lint"`；不作为产品回归失败，但按 reviewer 模板记录。
- `npm run build`：PASS，tsup ESM / DTS build success。
- `npm run docs:check`：PASS，72 Markdown files / 5 drafts，links and governance rules valid。
- `npm run release:packaging-check`：PASS，`release/packaging-manifest.json` and `dist/packaging-manifest.json`。
- `git diff --check`：PASS，无输出。
- Canonical checker warn：PASS，`status=ok`，`findings=[]`，counts `core=18`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=68`。
- Canonical checker strict：PASS，`status=ok`，`findings=[]`，`decisionRecordRequired=false`。
- Final canonical checker warn：PASS，`status=ok`，`findings=[]`。
- `speclite-canonical-source-governance-runner` 分类：当前 canonical source 变更命中 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，triggered rule 为 `core-or-sdlc-package-change`；checker 未要求 D1/D2 decision record。
- Skill density：`speclite-canonical-source-governance-runner` PASS，无 density warning；`speclite-check-canonical-source-change` PASS，无 density warning。
- 定向复现：
  - malformed `_speclite/config.toml` 下 `runStatusCommand()` 输出 `exitCode=0`、`issues=[]`、7 个 `fresh-default` modes。
  - legacy artifact 位于旧 implementation root 时 `validateArtifactPaths()` 只输出 `artifact-path.missing-required-artifact`，没有 mismatch actual path。
  - `implementation_artifacts="_speclite"` 被 resolver 接受，`_speclite/_config/manifest.yaml` 被 ownership classifier 归为 `workflow-owned`。
  - metadata 带 `futureKey` 时 `WorkflowArtifactMetadataSchema.safeParse()` 返回 `unrecognized_keys`。

## Passed Checks（通过项）

- Existing root resolver 的常规 explicit/missing/mixed matrix 通过 focused tests，缺失 `brainstorming_artifacts`、`analysis_artifacts`、`solutioning_artifacts` 时可逐 field 输出 `legacy-compatible`。
- `artifact-path.config-artifact-mismatch` 已在 `SPEC 07` 注册，低层 `validateArtifactPathContract()` 的 issue shape 包含 `field`、`configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode` 和 `reason`，且定向 helper 测试未泄露 temp root/home path。
- 普通 legacy implementation artifact 的 update / repair no-migration fixture 覆盖了 before/after content hash 与 `changedPaths` 排除，常规路径下 byte-identical 证据成立。
- Story 11.4-11.10 的 routing、rename、inventory、explicit migration 和 whole/sharded precedence 未在本 Story 11.3 源码实现中发现新增行为。

## Conclusion（结论）

- **结论**：不通过。
- **阻塞项**：4 个中优先级 patch findings。
- **建议**：进入 fresh Evaluator Round 1，确认 findings 有效性和 fixer 范围；若 evaluator 批准修复，fixer 应只处理上述 4 项，不扩大到 Story 11.4-11.10 routing/rename/inventory/migration。
