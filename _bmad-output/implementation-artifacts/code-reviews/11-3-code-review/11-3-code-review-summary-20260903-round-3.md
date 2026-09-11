---
Story: 11-3
Round: 3
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

本轮为 Round 3 复审。Round 1 的 4 个 P1 finding 与 Round 2 的 legacy `story_location` 目录噪声 finding 均已在当前源码与测试中闭环；本轮未发现新的阻塞项或中高优先级问题。当前结论：通过，建议进入 fresh Evaluator Round 3 独立复评；在 Evaluator 通过前仍不得执行 CR04/CR05/CR06 或推进 Story 11.4。

本轮是在前一无响应 Reviewer 被中断后启动的 replacement Reviewer 产物；前一 Reviewer 未落盘任何产物，因此本报告是唯一有效 Round 3 reviewer artifact。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 - `status` 在 malformed/invalid existing config 下静默回退 manifest fresh roots。
   - 修复状态：Closed。
   - 代码证据：`src/status/installed-state.ts:113-165` 将 blocking root resolution issue 映射为 `highLevelHealth = "failed"`，并在 blocking 情况下不展示 manifest-derived `paths.artifactRoots`；`src/commands/status.ts:43-58` 基于 top-level `issues` 推导 command `status` 与 exit code。
   - 测试证据：`test/existing-install-compatibility.test.ts:102-147` 覆盖 malformed `_speclite/config.toml` 返回 `exitCode=1`、`status="failure"`、`manifest-schema.malformed-field`、human output 不含 `mode=fresh-default`，且 JSON 不泄露 temp root。

2. Round 1 / Finding #2 - production validate 未真实消费 legacy `sprint-status.story_location` 并产生 `actualConsumedPath` mismatch。
   - 修复状态：Closed。
   - 代码证据：`src/validation/validate-project.ts:95-117` 将 existing artifact root evidence 与 legacy actual output evidence 接入 `validateArtifactPaths()`；`src/validation/validate-project.ts:160-198` 读取 legacy `sprint-status.yaml`；`src/validation/rules/artifact-path.ts:238-262` 输出稳定 `artifact-path.config-artifact-mismatch` details。
   - 测试证据：`test/existing-install-compatibility.test.ts:149-328` 覆盖 helper 与 validation plumbing，断言 `configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode` 和 project-relative redaction。

3. Round 1 / Finding #3 - artifact root overlap 使 installer-owned namespace 被误判为 `workflow-owned skip`。
   - 修复状态：Closed。
   - 代码证据：`src/update/ownership-model.ts:41-67` 保持 human-owned custom path 优先，其后 installer-owned namespace，再匹配 configured/default artifact roots；`src/update/ownership-model.ts:109-120` 明确 `_speclite/_config/*`、`.claude/skills/*`、`.agents/skills/*` 等 installer-owned path。
   - 测试证据：`test/ownership-model.test.ts:46-68` 与 `test/existing-install-compatibility.test.ts:483-567` 覆盖 overlap 下 update/repair 不再输出 `workflow-owned skip`，installer-managed drift 仍可 conflict/regenerate。

4. Round 1 / Finding #4 - unknown future metadata 被 `.strict()` schema 拒绝。
   - 修复状态：Closed。
   - 代码证据：`src/manifest/manifest-schema.ts:89-101` 使用 `.passthrough()` 允许 unknown future keys；`src/manifest/manifest-schema.ts:146-161` 与 `src/validation/rules/artifact-path.ts:292-355` 仍严格要求 `workflowType`、`sourceSkill`、`generatedAt`，并保留 wrong canonical `sourceSkill` failure。
   - 测试证据：`test/artifact-path-validation.test.ts:33-121` 覆盖 frontmatter、sidecar、directory metadata unknown future keys；既有 missing/invalid required metadata 与 sourceSkill mismatch negative tests 保持通过。

5. Round 2 / Finding #1 - legacy `story_location` 目录把 README/notes/temp/recursive 噪声当作 story `actualConsumedPath` mismatch。
   - 修复状态：Closed。
   - 代码证据：`src/validation/validate-project.ts:201-245` 只接受合法 `development_status` story key regex：`^\d+-\d+-[a-z0-9]+(?:-[a-z0-9]+)*$`；`src/validation/validate-project.ts:215-225` 要求 `story_location` 为目录，并只纳入 direct child `{story_key}.md`；`src/validation/artifact-paths.ts:231-260` 在 caller 提供 `actualArtifactPaths` 时只验证该 explicit list，没有改窄通用 directory discovery。
   - 测试证据：`test/existing-install-compatibility.test.ts:216-416` 覆盖 legal story key path、README、notes.md、notes.txt、sidecar、hidden/temp、recursive child 排除，以及 single-file `story_location` 不产生 story actual mismatch。

### 仍为非阻塞待办

1. Resolver-level protected namespace rejection。
   - 维持 Round 1 / Round 2 evaluator 边界：当前 Story 11.3 已通过 ownership precedence 解决 update/repair overlap；是否在 config resolver 层拒绝 `_speclite`、`.claude`、`.agents` 作为 artifact root 仍是 future / owner decision，不是本轮 current requirement。

2. Single-file `story_location` 与 metadata-only legacy story。
   - 维持 Round 2 evaluator 边界：`SPEC 09` 当前把 `story_location` 定义为 Story 文件所在目录，合法 artifact 为 `{story_root}/{story_key}.md`；若要支持 single-file 或 metadata-only `legacy.md`，需要先更新 owner contract，本轮不得升级为当前需求。

## 新发现

本轮未发现新的阻塞项或中高优先级问题。

## 验证摘要

- ✅ `npx vitest run test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts --reporter=dot`：2 files passed / 18 tests passed。
- ✅ `npx vitest run test/status-command.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/ownership-model.test.ts test/update-planning.test.ts test/validate-command.test.ts --reporter=dot`：6 files passed / 91 tests passed。
- ✅ `npx vitest run test/artifact-root-resolution.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/update-planning.test.ts test/fixture-release-gates.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts test/status-command.test.ts test/validate-command.test.ts test/ownership-model.test.ts --reporter=dot`：10 files passed / 133 tests passed。
- ✅ `npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts --reporter=dot`：6 files passed / 61 tests passed。
- ✅ `npm run build`：tsup ESM / DTS build success。
- ✅ `npm run docs:check`：72 Markdown files / 5 drafts，links and governance rules valid。
- ✅ `npm test -- --reporter=dot`：62 files passed / 491 passed / 4 todo。
- ❌ `npm run lint`：项目未配置 `lint` script，npm 返回 `Missing script: "lint"`；记录为脚本缺失事实，不作为本轮产品代码回归。
- ✅ `npm run release:packaging-check`：packaging acceptance passed for `release/packaging-manifest.json` and `dist/packaging-manifest.json`。
- ✅ Canonical source checker warn：`status="ok"`、`findings=[]`、`changedPathCount=1`、counts 为 `core=18`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=68`、`decisionRecordRequired=false`。
- ✅ Canonical source checker strict：`status="ok"`、`findings=[]`、counts 同 warn mode。
- ✅ Skill density：`speclite-canonical-source-governance-runner` 与 `speclite-check-canonical-source-change` 均无 density warning。
- ✅ `git diff --check`：通过，无 whitespace error 输出。

## 通过项

- Existing explicit / legacy-compatible artifact root resolution 未被 manifest fresh defaults 覆盖；malformed config 失败路径不再冒充 healthy status。
- `artifact-path.config-artifact-mismatch` diagnostic shape 保持稳定、project-relative POSIX 且 redacted，包含 `field`、`configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode`、`reason`。
- Legacy `story_location` production discovery 只消费 direct child story-key `.md`；README、notes、metadata sidecar、hidden/temp、recursive child 不进入 `actualConsumedPath`。
- Generic `discoverArtifacts()` directory behavior 未被全局收窄；report/directory artifact metadata discovery 仍通过现有 artifact path validation tests。
- Update/repair no-migration 边界成立：workflow-owned artifacts 保护为 skip，installer-owned namespaces 在 artifact root overlap 下仍保持 installer ownership。
- Unknown future metadata passthrough 成立，required metadata 与 canonical `sourceSkill` strict validation 仍成立。
- 本轮未修改产品代码、tests、Story、SPEC、flow gates、tracker、evaluation、PLAN、EXPERIMENTS、EXPERIMENT_NOTES 或 canonical source。

## 结论

- **结论：通过**
- **阻塞项**：无。
- **建议**：启动 fresh Evaluator Round 3 独立复评；Evaluator 通过后再按 strict-serial workflow 决定是否进入 CR04/CR05/CR06。
