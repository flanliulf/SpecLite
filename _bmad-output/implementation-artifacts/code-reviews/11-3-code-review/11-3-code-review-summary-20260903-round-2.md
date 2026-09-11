---
Story: 11-3
Round: 2
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

本轮为 Round 2 复审。Round 1 的 4 个 P1 finding 在当前 diff 中均已按 bounded scope 闭环：invalid config status 不再回退 fresh defaults、legacy `story_location` 真实进入 validate mismatch path、ownership 优先级保留 human / installer / workflow 顺序、metadata passthrough 只放宽 unknown keys 而不放宽 required/value/sourceSkill 检查。

但本轮新增 1 个 `[中][新]` 边界问题：production `validate` 经 legacy `sprint-status.story_location` 指向目录时，会把同目录下非 story 文件也当作 story artifact 纳入 `actualConsumedPath` mismatch。该行为会造成 validation false positive，且正落在本轮要求独立核验的 “是否误把目录/非story artifacts纳入” 范围内。

当前结论：不通过。建议启动 fresh Evaluator Round 2；若 Evaluator 确认该新 finding 有效，再授权 fixer 做窄修，修复范围应限制在 legacy story actual artifact discovery/filtering，不得提前实现 Story 11.5 whole/sharded precedence、新 routing 或 artifact migration。

## Execution Notes（执行说明）

- Reviewer 写入范围：仅新增本 summary；未修改源码、测试、Story、SPEC、gate、tracker、evaluation 或编排日志。
- 三层审查：当前工具环境未暴露可用的 `spawn_agent` / `wait_agent` 子代理接口，因此 Blind Hunter、Edge Case Hunter、Acceptance Auditor 方法由当前 reviewer 串行覆盖，未形成独立子代理隔离报告。
- `failed_layers`：
  - `parallel-agent-dispatch-unavailable`：无法按 Skill 偏好的并行子代理模式拆分三层。
  - `standalone-acceptance-auditor-skill-missing`：当前可用 Skill 只暴露 CR reviewer 主 Skill，Acceptance Auditor 以方法层串行执行。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — malformed/invalid existing config 被错误降级为 healthy status。
   - 修复状态：已闭环。
   - 代码证据：
     - `src/status/installed-state.ts:113-164`：blocking root resolution issue 会使 `highLevelHealth = "failed"`，且 blocking 情况下剥离 manifest-derived `artifactRoots`，不展示 fresh-default 投影。
     - `src/commands/status.ts:43-58`：status command 基于 top-level `issues` 推导 command `status` 与 exit code。
     - `src/status/installed-state.ts:153-158`：缺少整个 config 的 lightweight fallback 仍被保留为非 blocking 边界，不误报 invalid config。
   - 测试证据：
     - `test/existing-install-compatibility.test.ts:116-132` 覆盖 exitCode=1、`status="failure"`、`highLevelHealth="failed"`、top-level `manifest-schema.malformed-field`、不展示 `artifactRoots`、human output 不含 `mode=fresh-default`、JSON 不泄露 temp root。
   - 复核结论：通过。human/JSON/redaction 边界均成立。

2. Round 1 / Finding #2 — production validate 未真实消费 legacy `sprint-status.story_location` 并产生 `actualConsumedPath` mismatch。
   - 修复状态：核心路径已闭环；本轮另发现非 story false-positive，见“新发现”。
   - 代码证据：
     - `src/validation/validate-project.ts:166-193`：只从 `artifactType === "story"` 的 artifact contract 生成 legacy actual output evidence，并只读取 top-level `story_location`。
     - `src/validation/rules/artifact-path.ts:78-91` 与 `src/validation/rules/artifact-path.ts:238-258` 将 actual artifact path 与 resolved configured root 对比，并输出 deterministic mismatch details。
     - `SPEC 09:84-92` 明确 existing explicit root 权威、legacy fallback 不是 migration、普通 install/update/repair 不迁移 workflow-owned artifacts。
   - 测试与复现证据：
     - `test/existing-install-compatibility.test.ts:205-285` 覆盖 legacy actual `story_location` plumbing 产生 `artifact-path.config-artifact-mismatch`，details 含 `actualConsumedPath`。
     - 临时 production fixture 通过 `runInstallCommand()` 生成真实 installed state 后写入 legacy `sprint-status.yaml` 与 `legacy.md`，`runValidateCommand()` 产生 `status="failure"`、`artifact-path.config-artifact-mismatch`，`actualConsumedPath="_speclite-output/implementation-artifacts/stories/legacy.md"`。
   - 复核结论：story artifact mismatch 核心闭环通过；非 story filtering 仍需新修复。

3. Round 1 / Finding #3 — ownership 优先级在 `_speclite` overlap 下把 installer-owned managed files 误判为 workflow-owned。
   - 修复状态：已闭环。
   - 代码证据：
     - `src/update/ownership-model.ts:105-120`：human-owned custom path 优先，其后 installer-owned managed namespaces。
     - `src/update/ownership-model.ts:50-67`：installer-owned 匹配早于 configured/default artifact roots，因此 overlap 下 managed files 不会被 workflow-owned skip。
   - 测试证据：
     - `test/existing-install-compatibility.test.ts:360-438` 覆盖 `_speclite` 作为 configured artifact root 时，`_speclite/_config/managed.json` 在 update 中为 installer-owned conflict，在 repair plan 中为 installer-owned regenerate，不被 workflow-owned skip。
   - 复核结论：通过。该修复不需要在 config resolver 层拒绝 `_speclite` root；后者仍属于未来 decision / hardening，不是本 Story 已授权 patch。

4. Round 1 / Finding #4 — metadata passthrough 可能放宽 required/value/sourceSkill 严格性。
   - 修复状态：已闭环。
   - 代码证据：
     - `src/manifest/manifest-schema.ts:89-101`：`WorkflowArtifactMetadataSchema` 对 required fields 保留 regex / ISO validation，只对 unknown future keys 使用 `.passthrough()`。
     - `src/manifest/manifest-schema.ts:153-159`：`ArtifactContract.requiredMetadata` 仍必须包含 `workflowType`、`sourceSkill`、`generatedAt`。
     - `src/validation/rules/artifact-path.ts:300-355`：missing required metadata、invalid values、wrong canonical `sourceSkill` 仍产生 strict diagnostics。
   - 测试证据：
     - `test/artifact-path-validation.test.ts:36-117` 覆盖 frontmatter、sidecar、directory metadata 的 unknown future keys 被接受。
     - `test/artifact-path-validation.test.ts:398-462` 覆盖缺失 required fields 与 wrong canonical `sourceSkill` 仍被拒绝。
   - 复核结论：通过。

### 仍为非阻塞待办

1. Round 1 / Finding #3 衍生建议 — config resolver 层拒绝 artifact root 指向 installer namespace。
   - 维持当前边界：该建议不是 Story 11.3 已授权修复项；当前 bounded fix 通过 ownership precedence 解决 update/repair overlap，不新增 config-root prohibition。
   - 建议：如后续要禁止 `_speclite` / `.agents` / `.claude` 等 installer namespace 被配置为 workflow artifact root，应由后续 Story/SPEC 明确 contract 后实施。

## 新发现

### 1. [中][新] legacy `story_location` 目录会把非 story 文件当作 story artifact 产生 mismatch

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/validate-project.ts:166-193` 确实只从 story contract 读取 legacy `story_location`，但传入的是 story directory。
  - `src/validation/artifact-paths.ts:187-217` 对 directory 调用 `listArtifactEntities()` 后把返回项全部作为 `DiscoveredArtifact`。
  - `src/validation/artifact-paths.ts:220-237` 递归收集目录下所有 file，除了 `metadata.json` 与 `*.metadata.json` 外没有按 story artifact signature、extension、frontmatter 或 sprint status entry 过滤。
  - 临时 production 复现：
    - 输入：真实 `runInstallCommand({ yes: true })` 生成 installed state；legacy `_speclite-output/implementation-artifacts/sprint-status.yaml` 写入 `story_location: _speclite-output/implementation-artifacts/stories`；同目录创建合法 `legacy.md` 与非 story `notes.txt`。
    - 预期：legacy actual consumed mismatch 只针对可识别的 story artifact，例如 `legacy.md`；非 story 文件不应作为 story `actualConsumedPath`。
    - 实际：`runValidateCommand()` 返回 `status="failure"`，同时产生：
      - `artifact-path.config-artifact-mismatch` / `actualConsumedPath="_speclite-output/implementation-artifacts/stories/legacy.md"`
      - `artifact-path.config-artifact-mismatch` / `actualConsumedPath="_speclite-output/implementation-artifacts/stories/notes.txt"`
      - `validatedPaths` 也包含 `_speclite-output/implementation-artifacts/stories/notes.txt`

- **影响**
  - Existing install 若在 legacy story directory 中保留 README、notes、临时文本、导出文件或其它非 story 辅助文件，`speclite validate` 会产生 artifact-path false positive。
  - 该行为会污染 `actualConsumedPath` 证据，使 evaluator/user 难以区分真实 workflow-owned story artifact 与目录噪声。
  - 这不改变 artifact/config，也不是 migration；但它破坏 Story 11.3 对 deterministic mismatch diagnostics 的质量要求。

- **建议**
  - 在 legacy `story_location` actual discovery 上增加 story artifact 过滤：至少不要把无 story metadata / 非 markdown story artifact / 不符合 Story artifact contract 的普通文件纳入 `actualConsumedPath`。
  - 保持 bounded scope：只修正 actual story artifact discovery/filtering；不得在本 fix 中实现 Story 11.5 whole/sharded precedence、新 workflow routing 或 artifact migration。
  - 增加 production-level regression：从真实 `runInstallCommand()` 生成 installed state，经 legacy `sprint-status.story_location` 同时放置合法 story 与 `notes.txt`，断言 mismatch 只包含合法 story artifact。

## 验证摘要

- ✅ Focused Round 1 / Story 11.3 suite：
  - `npx vitest run test/status-command.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/ownership-model.test.ts test/update-planning.test.ts test/validate-command.test.ts --reporter=dot`
  - 结果：6 files passed，90 tests passed。
- ✅ Canonical source warn mode：
  - `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`
  - 结果：`status="ok"`，`findings=[]`，`changedPathCount=1`。
- ✅ Canonical source strict mode：
  - 同上增加 `--mode strict`
  - 结果：`status="ok"`，`findings=[]`。
- ✅ Skill density checks：
  - `python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/support-skills/speclite-canonical-source-governance-runner`
  - `python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/support-skills/speclite-check-canonical-source-change`
  - 结果：无 density warning。
- ✅ Canonical focused tests：
  - `npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts --reporter=dot`
  - 结果：6 files passed，61 tests passed。
- ❌ `npm run lint`
  - 结果：失败原因是 `package.json` 未配置 `lint` script：`npm error Missing script: "lint"`。这是项目脚本缺失，不是 lint findings 通过。
- ✅ `npm run build`
  - 结果：tsup ESM/DTS build success。
- ✅ `npm run docs:check`
  - 结果：72 Markdown files，5 drafts，links and governance rules valid。
- ✅ Full test suite：
  - `npm test -- --reporter=dot`
  - 结果：62 files passed，490 tests passed，4 todo。
- ✅ Packaging check：
  - `npm run release:packaging-check`
  - 结果：packaging acceptance passed for `release/packaging-manifest.json` and `dist/packaging-manifest.json`。
- ✅ `git diff --check`
  - 结果：无 whitespace error 输出。
- ✅ Final canonical warn/strict checks：
  - 结果：均为 `status="ok"`，`findings=[]`。
- ❌ 新 edge-case production reproduction：
  - 结果：`notes.txt` 被纳入 `artifact-path.config-artifact-mismatch`，见“新发现”。

## 通过项

- Existing invalid config status：blocking config/root resolution issue 会使 command failure、exit 1、`highLevelHealth="failed"`，并在 top-level `issues` 暴露；human/JSON 不泄露 absolute/temp/home path，不展示 fresh-default roots。
- Missing config lightweight fallback：仍限定为 missing required config 的非 blocking existing status fallback，不与 malformed/invalid config 混淆。
- Legacy `story_location` core mismatch：production validate 能经 legacy sprint-status 读到 actual story path，并产生包含 `actualConsumedPath` 的 deterministic mismatch diagnostic。
- No migration：install/update/repair 普通路径没有移动、复制、重命名、删除或重写 workflow-owned artifacts；Story/SPEC 仍把 migration 留给未来独立能力。
- No Story 11.5 early routing：当前代码没有提前实现 whole/sharded precedence 或新 workflow output routing；existing compatibility 只做 legacy handoff/discovery evidence。
- Ownership precedence：human-owned custom path 优先，installer-owned managed namespaces 次之，workflow roots 其后；update/repair overlap 不再 skip managed installer files。
- Metadata passthrough：unknown future keys 被接受；required metadata、value domain、canonical `sourceSkill` mismatch 仍严格拒绝。
- Canonical governance：canonical checker 当前判定 D0 impacted classes，`decisionRecordRequired=false`；本 reviewer 未修改 canonical source 或 public docs。

## 结论

- **结论：不通过**
- **阻塞项**：Round 2 / Finding #1 — legacy `story_location` 目录会把非 story 文件当作 story artifact 产生 mismatch。
- **建议**：启动 fresh Evaluator Round 2。Evaluator 应独立确认：
  1. Round 1 的 4 个 P1 是否可标记 closed。
  2. Round 2 新 finding 是否有效、是否应授权 fixer 做 bounded patch。
  3. 若授权 fixer，修复不得扩展到 Story 11.5 precedence、新 workflow routing、artifact migration、tracker/gate 状态推进或 canonical docs 改写。
