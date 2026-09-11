---
Story: 11-2
Round: 1
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-2-code-review-summary-20260903-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查提出 2 个 `[中]` finding：ReadyCheck 对 fresh manifest `paths.artifactRoots[]` 的 reconciliation 缺口，以及 D1 current public docs 仍发布旧 fresh defaults。独立只读核验后，Finding #1 确认为有效且应上调为 P1 阻塞；Finding #2 确认为有效，按 P2 current fixer patch 做受控 D1 文档闭环，不进入自由扩 scope。

本评估未修改源码、tests、Story、SPEC、Flow Gate、tracker、review summary 或编排日志；只写入本 evaluation 文件。

---

## 发现 #1 评估

### 审查原文

> **[中] ReadyCheck 可在 fresh manifest 缺失或错配 `artifactRoots[]` 时仍通过**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码证据支持 reviewer 的判断。`runReadyCheck()` 先通过 `normalizeReadyPaths()` 接收 command input 的 `paths.artifactRoots`，该 helper 仅要求 `specliteRoot`、`artifactRoot`、`manifestPath` 存在，若 input 携带 `artifactRoots` 就原样保留（`src/installer/ready-check.ts:277-292`）。随后 `readyPaths` 会在 manifest 存在 `paths.artifactRoots` 时用 manifest 覆盖；如果 manifest 缺失该 optional field，则不产生 issue，继续使用 command input projection（`src/installer/ready-check.ts:127-133`）。后续 runtime path gate 只检查最终 `readyPaths.artifactRoots[].resolvedRoot` 对应目录存在，不比较 manifest 与 command input，也不验证 manifest projection 的完整性、唯一性或顺序一致性（`src/installer/ready-check.ts:134-145`）。

fresh install 调用路径确实会给 ReadyCheck 传入 apply phase 产出的 `applyResult.paths`（`src/commands/install.ts:782-789`、`src/commands/install.ts:1113-1120`），而 apply phase 当前总是从同一 artifact root context 投影 `artifactRoots` 并写入 manifest（`src/installer/runtime-structure.ts:123-133`、`src/installer/runtime-structure.ts:301-306`）。因此，在 fresh install context 中，manifest 缺失或错配 projection 时 ReadyCheck 应 fail-closed；现状会掩盖 installed-state drift。

契约证据也成立：`SPEC 01` 将 `CommandPathSummary.artifactRoots` 定义为 optional additive projection，但明确用于 fresh install 和 Ready Summary 展示七个 workflow-owned artifact filesystem planes，并要求固定顺序（`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:612-617`、`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:675-691`）。`SPEC 04` 对 manifest paths 做同样 additive shape，并列出 fresh install 七个 default resolved roots 与 Public Documentation separation（`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:113-146`）。Story AC4-6 要求 manifest/index、Ready Summary、fixtures 覆盖实际 resolved roots 与 deterministic ordering（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:22-32`）。

**严重性判断：偏低**

Reviewer 原始 `[中]` 合理识别了风险，但对 CR 交付优先级偏低。该问题会让 Story 11.2 的 fresh install ReadyCheck 在 manifest 缺失或错配七 root projection 时仍可能 `ok=true`，直接破坏 AC4-6 和 completion gate 对 ReadyCheck/Ready Summary 可信度的依赖。它不是安全或数据破坏级问题，所以不是 P0；但它是质量门禁 false positive，阻塞 Story 11.2 交付，应定为 P1。

**修复建议：可行**

允许 fixer 在 `src/installer/ready-check.ts` 增加 bounded reconciliation：

- 当 `input.paths.artifactRoots` 存在时，将其视为 fresh/install caller 的 expected projection；manifest 缺失 `paths.artifactRoots`、manifest projection 与 input projection 不完全一致、顺序不一致、field 不唯一或数量不为七时，ReadyCheck 必须返回 blocking `ValidationIssue`。
- 旧 manifest compatibility 必须保留：当 caller/input 没有 `paths.artifactRoots` 且 manifest 也没有 `paths.artifactRoots` 时，不得仅因 optional additive field 缺失而 fail；当 manifest 有 projection 而 input 没有时，可继续以 manifest projection 驱动 runtime path check。
- expected comparison 不得引入 command-local defaults；应消费 command input projection或既有 Story 11.1 registry派生的字段顺序。
- regression 至少覆盖 manifest 缺失 `artifactRoots[]`、manifest root order/field/`resolvedRoot` mismatch 但目录存在、重复/非唯一 root field 三类场景。优先放在 `test/install-progress-ready-summary.test.ts` 的 ReadyCheck local gate 附近，必要时补充 focused fixture assertion。

Stable issue 决定：本评估批准复用现有 `manifest-schema.malformed-field`。`SPEC 07` 已将 `manifest-schema` 定义为 installed manifest/index/schema version shape failures，并保留 `manifest-schema.malformed-field`（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:67-90`）；现有 validate implementation 也在 manifest/index schema shape 不合法时使用该 issue id（`src/validation/rules/manifest-schema.ts:326-335`、`src/validation/rules/manifest-schema.ts:620-631`）。Fixer 应使用 deterministic details，例如 `field: "paths.artifactRoots"`、`reason: "missing-fresh-projection"` 或 `reason: "artifact-roots-mismatch"`、`expectedCount`、`actualCount`；不得把 path、hash、timestamp 或自由文本塞入 issue id。若实现者坚持新增 `manifest-schema.artifact-roots-mismatch` 或改变 `SPEC 07` taxonomy，必须另走 owner-gated SPEC 07 decision，本 evaluation 不授权。

**误报评估：非误报**

不是误报。当前 tests 覆盖 happy path ReadyCheck 与缺失 manifest/index/menu target 等 failures（`test/install-progress-ready-summary.test.ts:89-159`、`test/install-progress-ready-summary.test.ts:240-264`），也覆盖 fresh manifest 正常写出 `paths.artifactRoots`（`test/runtime-structure.test.ts:197-248`），但没有覆盖 reviewer 复现的 manifest projection 缺失/错配仍通过场景。

---

## 发现 #2 评估

### 审查原文

> **[中] D1 current public docs 仍发布旧 fresh defaults**
> - 来源：auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P2 优先级）

### 评估分析

**问题描述准确性：准确**

D1 governance 证据成立。机器可读 governance map 将 `docs/**`、`README.md`、`assets/source/speclite/README*.md` 归为 `current-public-docs`，policy 是 current user-facing docs 必须反映 runtime/install/module/hook/workflow behavior 变化（`assets/source/speclite/canonical-governance.json:59-72`）。对应 reference doc 也说明 D1 需要人工判断并记录 update/skip decision，current public docs 在行为变化时应同步（`docs/reference/canonical-source-governance.md:21-35`、`docs/reference/canonical-source-governance.md:77-84`）。本轮开发记录承认 D1 drift 已被 skipped，且把是否阻塞交给 CR（`_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/EXPERIMENT_NOTES.md:19-33`）。

具体 drift 也存在。`docs/quick-start.md` 仍把 defaults 写成旧 `output_folder`、`planning_artifacts`、`implementation_artifacts`、`project_knowledge=docs`（`docs/quick-start.md:150-161`）。`docs/reference/workflow-artifact-layout.md` 仍描述三类 SDLC root 从 `core.output_folder` 派生，并把 `project_knowledge` 默认写为 `{project-root}/docs`（`docs/reference/workflow-artifact-layout.md:30-42`）。`docs/reference/config-and-customization.md` 的 runtime config 表仍只列旧 `[modules.sdlc]` 四字段（`docs/reference/config-and-customization.md:18-27`）。`docs/explanation/speclite-modules.md` 仍只列旧 SDLC fields/defaults 与 `project_knowledge=docs`（`docs/explanation/speclite-modules.md:40-60`）。此外，`docs/reference/runtime-layout.md`、`docs/explanation/runtime-boundaries.md` 和 `docs/tutorials/first-brownfield-project.md` 仍暴露旧 config field/default 认知（`docs/reference/runtime-layout.md:28-39`、`docs/explanation/runtime-boundaries.md:62-74`、`docs/tutorials/first-brownfield-project.md:147-155`）。

Story 11.2 明确要求 fresh `project_knowledge` 不再以 `docs/` 为 default，同时 Public Documentation plane 要独立呈现（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:68-80`）。因此 reviewer 将该项归为 D1 docs drift 是正确的。

**严重性判断：合理但不应上调到 P1**

这是 current public docs 与 fresh runtime defaults 不一致，确实会误导用户和后续审查；但 runtime implementation、manifest schema、Ready Summary 和 fixtures 的核心行为不因此失效，且 Story 11.2 的 explicit scope boundary 不包含 workflow routing 或 historical rewrite（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:31-32`）。因此不应作为 runtime P1 阻塞；应作为 P2 current fixer patch 在本轮 CR 中受控闭环，而不是默认推迟到无边界 CR TODO。

**修复建议：可行**

本评估明确授权后续 CR fixer 对以下 current public docs 做 bounded patch，只同步 fresh install 七 root defaults、`project_knowledge` fresh default、Public Documentation plane 与 Project Knowledge plane separation；不得修改 workflow routing、Skill output ownership、legacy/historical records、Flow Gate/CR workflow、README、`assets/source/speclite/README*.md` 或 docs index。

允许文件与章节：

- `docs/quick-start.md`：仅更新 `Configuration Modes（配置模式）` 下的 “常见默认值与交互规则” 表及紧邻说明。
- `docs/how-to/install-speclite.md`：仅更新 `What You Get（你会得到什么）` 下安装后目录/manifest说明，补足七 filesystem planes 与 `docs/` public documentation separation。
- `docs/reference/workflow-artifact-layout.md`：仅更新 `Scope and Boundaries（范围与边界）`、`Configuration Mapping（配置映射）`、`Default Directory Tree（默认目录树）` 中与 fresh root default、预创建目录和 Public Documentation separation 直接相关的文本/表格/目录树。
- `docs/reference/config-and-customization.md`：仅更新 `Runtime Config（运行时配置）` 的 section/field 表。
- `docs/reference/runtime-layout.md`：仅更新 `Runtime Paths（Runtime 路径）` 与 `Config Files（配置文件）` 中 `_speclite-output` 和 `[core]` / `[modules.sdlc]` field rows。
- `docs/explanation/speclite-modules.md`：仅更新 Core/SDLC module config 表和安装时创建目录说明。
- `docs/explanation/runtime-boundaries.md`：仅更新 `Artifact Repository（产物仓库）` 对实际 config fields 和 public docs separation 的说明。
- `docs/tutorials/first-brownfield-project.md`：仅更新 `Step 5: Inspect the Outputs（检查产物）` 中依赖 quick config `project_knowledge` default 的输出路径示例。

如果 fixer 发现这些章节外还有相同 fresh default drift，只能记录为 follow-up evidence，不得自行扩大文件或章节范围；需要用户或 owner decision 后再改。

**误报评估：非误报**

不是误报。项目 AGENTS.md 的“未点名文件修改先授权”限制在 reviewer 阶段阻止了直接改 docs；但本 evaluation 已基于 canonical governance D1 hook 和 current Story CR goal 给出精确 bounded docs scope。后续 fixer 可按上述文件/章节修复；不需要额外用户决策，除非选择扩大 docs scope 或把 D1 docs 改为延后 TODO。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | ReadyCheck 可在 fresh manifest 缺失或错配 `artifactRoots[]` 时仍通过 | [中] | **P1** | ReadyCheck false positive 会破坏 Story 11.2 AC4-6 的 manifest / Ready Summary gate 可信度，必须先修。 |

### 当前 Fixer Patch（非阻塞 D1 闭环）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 2 | D1 current public docs 仍发布旧 fresh defaults | [中] | **P2** | 不是 runtime P1，但 canonical governance 要求 targeted closure；允许按本 evaluation 精确文件/章节修复。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 无 | 无 | - | - | 本轮 finding 均可在 bounded fixer scope 内处理；暂不建议转 CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | - | 两项 finding 均为真阳性。 |

### 评估决定

- **发现 #1（ReadyCheck projection reconciliation）**：确认有效，上调 P1。Fixer 允许修改 `src/installer/ready-check.ts` 与 focused regression tests；推荐复用 `manifest-schema.malformed-field`，不得自由新增 issue id。若要新增或改变 `SPEC 07` taxonomy，必须 owner-gated，本轮不授权。
- **发现 #2（D1 current public docs fresh defaults）**：确认有效，定为 P2 current fixer patch。Fixer 仅可修改本 evaluation 列出的 8 个 docs 文件对应章节，且只同步 fresh install 七 root defaults、Project Knowledge default 和 Public Documentation separation；不得改 workflow routing、历史记录、Story、SPEC、tracker、Flow Gate、CR artifacts 或 README。
- **通过项确认**：Reviewer 对 additive v1 strategy、`src/bin/speclite.ts`、`release/packaging-manifest.json`、11.3+ scope 的通过判断合理。`artifactRoots[]` 在 executable schemas 中仍是 optional additive field（`src/diagnostics/command-result-schema.ts:91-111`、`src/manifest/manifest-schema.ts:163-188`）；CLI 只把新增 config fields 暴露给 existing interactive install prompt surface（`src/bin/speclite.ts:650-663`）；packaging manifest hash 变化是 packaged source evidence 更新（`release/packaging-manifest.json:14-23`）；completion gate 也明确未实现 existing fallback/mismatch/migration 或 11.4+ workflow routing（`_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-completion-gate.md:59-64`）。
- **整体结论**：CR evaluation 不通过。必须进入 CR fixer，先修 P1 ReadyCheck reconciliation，再按 bounded scope 修 P2 D1 docs。修复后需要新一轮 CR reviewer/evaluator；不得直接 finalizer。
- **用户决策点**：当前 bounded path 不需要用户额外决策。只有以下情况需要用户/owner 决策：新增或改变 `SPEC 07` issue taxonomy；docs scope 超出本 evaluation 列出的文件/章节；将 D1 docs 从本轮 fixer patch 改为延期 CR TODO；或试图实现 11.3 existing compatibility / 11.4+ workflow routing。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-09-03
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2

### Fix #1: ReadyCheck projection reconciliation

- **Status**: 已修复。
- **Files**: `src/installer/ready-check.ts`、`test/install-progress-ready-summary.test.ts`。
- **Change**: `runReadyCheck()` 现在在 manifest/index/IDE mirror gate 前后保留 legacy-compatible optional projection 语义，但当 caller `paths.artifactRoots[]` 存在时，会把它作为 fresh/install expected projection，与 manifest `paths.artifactRoots[]` 做 fail-closed reconciliation。manifest 缺失 projection、count mismatch、non-unique field、固定顺序 mismatch、entry field content mismatch、schema-level incomplete/invalid entry 均返回 blocking `ValidationIssue`。
- **Issue semantics**: 复用 `manifest-schema.malformed-field`；`details.field` 固定为 `paths.artifactRoots`，`reason` 使用 deterministic code（`missing-fresh-projection`、`artifact-roots-count-mismatch`、`duplicate-artifact-root-field`、`artifact-roots-order-mismatch`、`artifact-root-entry-mismatch`、`invalid-field`），只携带 count、index、field name、mismatched field name 等稳定信息，不携带真实 absolute path、hash、timestamp 或自由新增 taxonomy。
- **Regression coverage**: focused tests 覆盖 manifest missing projection、order mismatch while directories exist、`resolvedRoot` mismatch while directory exists、duplicate/non-unique field、caller+manifest both omit projection 的 legacy compatibility。

### Fix #2: D1 current public docs bounded patch

- **Status**: 已修复授权范围内 drift。
- **Files**: `docs/quick-start.md`、`docs/how-to/install-speclite.md`、`docs/reference/workflow-artifact-layout.md`、`docs/reference/config-and-customization.md`、`docs/reference/runtime-layout.md`、`docs/explanation/speclite-modules.md`、`docs/explanation/runtime-boundaries.md`、`docs/tutorials/first-brownfield-project.md`。
- **Change**: 指定章节已同步 fresh 七 root defaults（`0-brainstorming-artifacts`、`1-analysis-artifacts`、`2-planning-artifacts`、`3-solutioning-artifacts`、`4-implementation-artifacts`、`5-devops-artifacts`、`project-knowledge-base`）、fresh `project_knowledge` default，以及 Public Documentation (`docs/`) 与 Project Knowledge (`project_knowledge`) separation。

### Validation

- `npm test -- test/install-progress-ready-summary.test.ts`: PASS, 1 file, 15 tests.
- `npm test -- test/config-initialization.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts`: PASS, 3 files, 36 tests.
- `npm run build`: PASS.
- `npm run docs:check`: PASS, 72 Markdown files, 5 drafts, links and governance rules valid.
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`: PASS, `status=ok`, `mode=warn`, `findings=[]`.
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict`: PASS, `status=ok`, `mode=strict`, `findings=[]`.
- `npm test`: PASS, 61 files, 480 passed, 4 todo.
- `npm run release:packaging-check`: PASS, `release/packaging-manifest.json` and `dist/packaging-manifest.json`.
- `git diff --check`: PASS after this record append.

### Scope Not Changed

- 未新增或修改 `SPEC 07` issue taxonomy。
- 未修改 Story、tracker、Flow Gate、README、`assets/source/speclite/README*.md`、docs index、workflow routing 或历史记录。
- 未改 canonical source；当前 canonical dirty path `assets/source/speclite/sdlc-skills/module.yaml` 为本 fixer 进入前既有变更，canonical warn/strict check 均为 PASS。
- 未启动 Reviewer/Evaluator，未 commit，未 push。

### Follow-Up Evidence Outside Authorized Patch

- `docs/reference/workflow-artifact-layout.md` 的 `Root and Planning Artifacts`、`DevOps Artifacts`、`External Inputs and Updater-Only Paths`、`Current Differences` 仍含旧 generic `planning-artifacts/`、`implementation-artifacts/`、`devops-artifacts/` 表述；这些章节不在本 evaluation 授权 patch 范围内，需 owner 决策后另行处理。
- `docs/tutorials/first-brownfield-project.md` 的 `Step 1: Prepare the Workspace` 和 `Step 6: Verify the Write Boundary` 仍含 `docs/brownfield/**` 或 `_speclite-output/planning-artifacts/*` 旧示例；这些章节不在本 evaluation 授权 patch 范围内，需 owner 决策后另行处理。
