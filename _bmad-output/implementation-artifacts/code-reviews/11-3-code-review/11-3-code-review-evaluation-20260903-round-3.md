---
Story: 11-3
Round: 3
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-3-code-review-summary-20260903-round-3.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-3 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。Review Source 确认 Round 1 的 4 个 P1 finding 与 Round 2 的 legacy `sprint-status.story_location` 目录噪声 finding 均已闭环，且未提出新的阻塞项或中高优先级问题。

独立源码核验、focused tests、canonical warn/strict checks、build、docs check、packaging check 与 `git diff --check` 均支持 reviewer 的通过结论。评估结论：通过。当前无需进入 Fixer；可进入 fresh CR04，但仍需按 strict-serial workflow 继续执行 CR04/CR05/CR06，不得跳过后续 gates 或直接推进 Story 11.4。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：malformed/invalid existing config 被错误降级为 healthy status：Closed

`src/status/installed-state.ts:113-165` 将 blocking root resolution issue 映射为 `highLevelHealth = "failed"`，并在 blocking 情况下移除 manifest-derived `paths.artifactRoots`，避免用 fresh default projection 冒充当前 installed truth。`src/commands/status.ts:43-58` 使用 top-level `issues` 推导 command `status` 与 exit code。`test/existing-install-compatibility.test.ts:102-147` 覆盖 malformed `_speclite/config.toml` 时 `exitCode=1`、`status="failure"`、`highLevelHealth="failed"`、`manifest-schema.malformed-field`、human output 不含 `mode=fresh-default`，且 JSON 不泄露 temp root。

评估：已闭环。Reviewer 的 Closed 判断有效。

### Round 1 / Finding #2：production validate 未真实消费 legacy `sprint-status.story_location`：Closed

`src/validation/validate-project.ts:95-117` 将 existing artifact root evidence 与 legacy actual output evidence 接入 `validateArtifactPaths()`。`src/validation/validate-project.ts:160-245` 从 legacy `sprint-status.yaml` 读取 `story_location`，并用同一 `development_status` map 中合法 story key 生成 explicit `actualArtifactPaths`。`src/validation/artifact-paths.ts:60-70` 消费 actual evidence，`src/validation/artifact-paths.ts:231-260` 在 caller 提供 explicit `actualArtifactPaths` 时只读取该精确列表。`src/validation/rules/artifact-path.ts:238-262` 输出稳定 `artifact-path.config-artifact-mismatch` details，包含 `field`、`configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode` 和 `reason`。

`test/existing-install-compatibility.test.ts:216-328` 证明 helper plumbing 会对合法 legacy story path 产生 mismatch，并排除 README、notes、sidecar 与 recursive 噪声；`test/existing-install-compatibility.test.ts:330-416` 进一步覆盖 production `runInstallCommand()` + `runValidateCommand()` 的 mixed-noise regression。

评估：已闭环。Reviewer 的 Closed 判断有效。

### Round 1 / Finding #3：artifact root overlap 把 installer-owned namespace 误判为 workflow-owned：Closed

`src/update/ownership-model.ts:41-67` 当前顺序为 human-owned custom path 优先，其后 installer-owned namespace，再匹配 configured/default artifact roots。`src/update/ownership-model.ts:109-120` 覆盖 `_speclite/_config/*`、`_speclite/hooks/*`、`_speclite/scripts/*`、`.claude/skills/*`、`.agents/skills/*`、`.claude/settings.json`、`.codex/hooks.json` 等 installer-owned paths。`test/ownership-model.test.ts:46-68` 覆盖 `_speclite`、`.claude`、`.agents` 与 artifact roots overlap 时仍判为 installer-owned；`test/existing-install-compatibility.test.ts:483-567` 覆盖 update/repair 下 installer-managed drift 不再被 `workflow-owned skip` 吞掉。

评估：已闭环。Resolver-level protected namespace rejection 仍未实现，但当前 `SPEC 09` 没有定义这类 root rejection，也没有 stable diagnostic 合同。独立 ad-hoc 复现确认 `implementation_artifacts = "_speclite"` 仍可解析为 `ok=true`、`issues=[]`、`resolutionMode="explicit-config"`。这与 Round 1 / Round 2 evaluator 的 future / owner decision 边界一致，不是当前 Story 11.3 blocker。

### Round 1 / Finding #4：unknown future metadata 被 `.strict()` schema 拒绝：Closed

`src/manifest/manifest-schema.ts:89-101` 的 `WorkflowArtifactMetadataSchema` 已改为 `.passthrough()`，允许 unknown future keys。`src/manifest/manifest-schema.ts:146-161` 对 artifact contract required metadata 仍是 strict schema；`src/validation/rules/artifact-path.ts:292-355` 仍先检查 `workflowType`、`sourceSkill`、`generatedAt` 是否存在，再验证 required value domain，并保留 canonical `sourceSkill` mismatch failure。

`test/artifact-path-validation.test.ts:36-121` 覆盖 frontmatter、sidecar、directory metadata 三种 unknown future key 正向兼容；`test/artifact-path-validation.test.ts:398-464` 覆盖 missing required metadata 与 wrong canonical `sourceSkill` 仍失败。

评估：已闭环。Reviewer 的 Closed 判断有效。

### Round 2 / Finding #1：legacy `story_location` 目录噪声污染 story `actualConsumedPath`：Closed

`src/validation/validate-project.ts:201-245` 将 `story_location` 解释为目录，并只从同一 `sprint-status.yaml` 的 `development_status` 读取合法 story key。合法 key regex 为 `^\d+-\d+-[a-z0-9]+(?:-[a-z0-9]+)*$`，因此同一 map 内的 `epic-11`、`epic-11-retrospective` 等非 Story key 不会进入 story evidence。`src/validation/validate-project.ts:215-225` 要求 `story_location` 是 directory，并只纳入 direct child `{story_key}.md`。`src/validation/artifact-paths.ts:231-260` 在 explicit `actualArtifactPaths` 存在时不调用通用 directory recursion，从而不改变 report/directory artifact metadata 的通用发现行为。

`test/existing-install-compatibility.test.ts:330-416` 覆盖 production mixed noise：合法 story file 被纳入 mismatch，README、notes.md、notes.txt、metadata sidecar、hidden/temp 和 recursive child 均不会成为 story `actualConsumedPath`；single-file `story_location` 不作为本轮合法 legacy story evidence。`SPEC 09` 将 `story_location` 定义为 Story 文件所在目录，`default_output_file` 定义为 `{story_root}/{story_key}.md`（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:101-113`），因此 single-file 或 metadata-only `legacy.md` 支持仍是 future / owner decision。

评估：已闭环。Reviewer 的 Closed 判断有效。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-3-follow-up | Resolver-level protected namespace rejection：是否在 config resolver 层拒绝 `_speclite`、`.claude`、`.agents` 作为 artifact root | CR TODO / Owner future | 同意维持。当前 Story 11.3 已通过 ownership precedence 解决 update/repair overlap；root rejection 需要 owner contract 与 stable diagnostic，不应升级为当前 blocker。 |
| R2-future | 是否正式支持 single-file `story_location` 或 metadata-only legacy story file | CR TODO / Owner future | 同意维持。`SPEC 09` 当前将 `story_location` 定义为目录，合法 Story artifact 为 `{story_root}/{story_key}.md`；扩展兼容输入必须先更新 owner contract。 |

---

## 本轮新发现评估

Reviewer Round 3 未提出新的 finding。独立复核未发现新的阻塞项或中高优先级问题。

---

## 整体评估结论

### 需要修复（阻塞交付）

无。

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R1-3-follow-up | config resolver 层拒绝 artifact root 指向 installer/control namespace | [中] | **P2 / Owner future** | 当前无 owning contract 与 stable diagnostic；不能作为 Story 11.3 当前 blocker。 |
| R2-future | single-file `story_location` 或 metadata-only legacy story 支持 | [中] | **P2 / Owner future** | 当前 owner contract 定义为 directory + `{story_key}.md`；扩展支持需先 owner decision。 |

### 可忽略（误报）

无。

### 评估决定

- **整体结论**：通过。Reviewer Round 3 的通过结论成立。
- **Round 1 / Finding #1**：确认 Closed；无需 Fixer。
- **Round 1 / Finding #2**：确认 Closed；无需 Fixer。
- **Round 1 / Finding #3**：确认 Closed；resolver-level namespace rejection 维持 CR TODO / Owner future。
- **Round 1 / Finding #4**：确认 Closed；无需 Fixer。
- **Round 2 / Finding #1**：确认 Closed；single-file / metadata-only legacy support 维持 CR TODO / Owner future。
- **Owner**：进入 CR04 前不需要 owner 介入。
- **Next Gate**：可以进入 fresh CR04。不得跳过 CR04/CR05/CR06，也不得在 CR04 之前推进 Story 11.4。

---

## Verification（验证）

- 静态核验：读取并对照 `11-3-code-review-summary-20260903-round-3.md`、Round 1 / Round 2 evaluation、`src/status/installed-state.ts`、`src/commands/status.ts`、`src/validation/validate-project.ts`、`src/validation/artifact-paths.ts`、`src/validation/rules/artifact-path.ts`、`src/manifest/manifest-schema.ts`、`src/update/ownership-model.ts`、`src/config/artifact-root-resolver.ts`、`src/config/config-schema.ts`、`test/existing-install-compatibility.test.ts`、`test/artifact-path-validation.test.ts`、`test/ownership-model.test.ts` 与 `SPEC 07` / `SPEC 09` 相关段落。
- Focused independent verification：`npx vitest run test/status-command.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/ownership-model.test.ts test/update-planning.test.ts test/validate-command.test.ts --reporter=dot` -> 6 files passed / 91 tests passed。
- Canonical source checker warn：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` -> `status="ok"`、`findings=[]`、`changedPathCount=1`、counts `core=18`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=68`、`decisionRecordRequired=false`。
- Canonical source checker strict：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict` -> `status="ok"`、`findings=[]`，counts 同 warn mode。
- Build：`npm run build` -> 通过，ESM / DTS build success。
- Docs：`npm run docs:check` -> 通过，72 Markdown files / 5 drafts。
- Packaging：`npm run release:packaging-check` -> 顺序重跑通过，`release/packaging-manifest.json` and `dist/packaging-manifest.json` acceptance passed。说明：评估过程中曾误将 `npm run build` 与 `npm run release:packaging-check` 并行执行，packaging 在 build 清理 `dist` 时出现 `runtime-schemas-included` 竞态失败；该结果不作为产品回归，最终有效验证为顺序重跑通过。
- Future boundary ad-hoc check：`implementation_artifacts = "_speclite"` 在 current resolver 下仍解析为 `ok=true`、`issues=[]`、`resolutionMode="explicit-config"`；因此 protected namespace rejection 仍是 future / owner decision，而非当前 blocker。
- Whitespace：`git diff --check` -> 通过，无输出。

## 实际改动文件

- 新增：`_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-code-review-evaluation-20260903-round-3.md`
