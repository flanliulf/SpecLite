---
Story: 11-2
Round: 2
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-2-code-review-summary-20260903-round-2.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-2 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。Round 2 提出 2 个 `[中][新] patch` finding：fresh detailed artifact root 显式覆盖被投影为 `fresh-default`，以及 brownfield tutorial Step 1 / Step 6 仍指向旧 quick default 路径。

独立核验后，Finding #1 的现象成立，但不能按当前 closed contract 直接授权为代码 patch：Story 11.2 kickoff gate 明确写入 “`resolutionMode` is `fresh-default` for all seven roots in fresh install”，同时 CLI detailed prompt、config initialization tests 和 Story 11.2 Task 3 又保留 artifact root override 行为。该冲突需要 owner decision。Finding #2 确认为当前 D1 docs drift，可授权同一 tutorial 文件两个 section 的 bounded patch。

本评估未修改源码、tests、Story、SPEC、Flow Gate、tracker、review summary 或编排日志；只写入本 Round 2 evaluation 文件。

---

## 上轮问题回顾确认

### Round 1 Finding #1: ReadyCheck fresh projection reconciliation：Closed

Round 1 evaluation 要求 ReadyCheck 在 caller `paths.artifactRoots[]` 存在时，对 manifest `paths.artifactRoots[]` 做 fail-closed reconciliation。当前代码已具备该闭环：`src/installer/ready-check.ts:53-63` 定义比较字段集合，包含 `field`、`configPath`、`placeholder`、`resolvedRoot`、`resolutionMode`、`plane`、`ownership`、`contractRefs`；`src/installer/ready-check.ts:360-380` 覆盖 caller present + manifest missing 时失败、manifest-only 时兼容继续；`src/installer/ready-check.ts:388-410` 比较逐 entry 字段；`src/installer/ready-check.ts:415-459` 覆盖 count、duplicate、registry order；`src/installer/ready-check.ts:461-498` 复用 `manifest-schema.malformed-field` 并使用 deterministic/redacted details。

Round 2 review summary 也记录 focused ReadyCheck tests 已覆盖 manifest missing、order mismatch、`resolvedRoot` mismatch、duplicate field 与 legacy both-omit compatibility，并且定向复现显示 malformed manifest entry 会返回 `manifest-schema.malformed-field` / `invalid-field`。该项持续关闭，不进入本轮 fixer。

### Round 1 Finding #2: bounded current public docs body：Closed，tutorial follow-up 仍打开

Round 1 evaluation 授权的 8 个 docs 文件主体修复已基本关闭。当前 `docs/quick-start.md:150-167` 列出七个 fresh defaults，并明确 `docs/` 是 Public Documentation，不是 fresh `project_knowledge` default；`docs/reference/runtime-layout.md:26-33` 也列出七个 workflow-owned planes 与 `docs/*` public docs boundary。

但 Round 1 fix record 明确留下两个未授权 follow-up：`docs/tutorials/first-brownfield-project.md` 的 Step 1 与 Step 6 仍含旧路径。Round 2 Finding #2 对这两个 section 的命中有效，见下文。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R2-follow-up | `docs/reference/workflow-artifact-layout.md` 后续 generic `planning-artifacts/`、`implementation-artifacts/`、`devops-artifacts/` route strings | CR TODO / 后续 Story | 不作为 Story 11.2 当前 patch。`docs/reference/workflow-artifact-layout.md:129-148` 是 producer route/catalog 当前行为说明，`docs/reference/workflow-artifact-layout.md:212-223` 是 `Current Differences` 表；Story 11.2 AC7 明确不修改 Analysis、Planning、UX、Readiness 或 CR workflow 具体路由。归属 Story 11.4+ workflow routing / canonical Skill alignment 或单独 owner decision。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] fresh detailed artifact root 显式覆盖被投影为 `fresh-default`**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：⚠️ 确认现象有效 — 需要 owner 决策（P1 优先级）

### 评估分析

**问题描述准确性：基本准确**

Reviewer 对源码现象的描述准确。CLI detailed mode 会收集七个 artifact root 字段（`src/bin/speclite.ts:650-661`），且 `collectConfigValue()` 的 prompt 明确 “Press Enter to keep the deterministic default from module metadata”，非空输入会写入 `values[field]`（`src/bin/speclite.ts:707-723`）。`createConfigInitializationPlan()` 在 fresh lifecycle 下调用 `resolveArtifactRoots()`，并通过 `createFreshArtifactRootConfig()` 注入 detailed `values`（`src/installer/config-initialization.ts:124-131`、`src/installer/config-initialization.ts:425-445`）。

当前 resolver 确实优先使用 fresh lifecycle 中的 `explicitValue`，但无论是否存在显式 artifact root value 都返回 `resolutionMode: "fresh-default"`（`src/config/artifact-root-resolver.ts:245-256`）。现有测试也确认 detailed fresh config 可以写入自定义 artifact roots：`test/config-initialization.test.ts:166-201` 使用 `planning_artifacts: "_speclite-output/plans"` 并断言 TOML round-trip 生效；`test/config-initialization.test.ts:80-112` 使用 custom `output_folder` 并断言七 roots 跟随变化。但这些 tests 没有断言 detailed per-root override 的 `resolutionMode`。

问题在于，当前 owner artifacts 没有给出一致合同语义。支持 reviewer patch 方向的证据是：`ArtifactRootResolutionMode` 明确定义 `fresh-default | explicit-config | legacy-compatible`（`src/config/artifact-root-resolver.ts:21-24`），Story 11.1 要求所有 consumers 获得稳定的 `resolutionMode`（`_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:52-58`），Story 11.2 AC5 要展示实际 root 与 resolution mode（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:24-25`），而 detailed prompt 的非空 artifact-root 输入语义上不是 default。

反向证据同样是 owner-level：Story 11.2 AC4 字面要求 manifest/index 投影 `resolutionMode: fresh-default`（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:22-23`）；Story 11.2 kickoff gate 把 public shape 决策写死为 “`resolutionMode` is `fresh-default` for all seven roots in fresh install”（`_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-kickoff-gate.md:30-34`）；Story 11.1 AC2 / Evidence Plan 只规定 fresh defaults 全部 `fresh-default`，AC3 才规定 existing explicit config 标记 `explicit-config`（`_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:22-43`、`_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:214-220`）；`SPEC 09` 也只明确 fresh-install default 与 existing-install explicit behavior，没有明确 fresh detailed 非空 per-root input 的 mode（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:64-86`）。

因此，本 finding 的底层风险有效，但 reviewer 将其直接分类为 `patch` 过早。当前 evaluator 不应猜测“fresh detailed override 必然等同 `explicit-config`”，也不能忽略 CLI/test 已经允许 override 的事实；应先由 contract owner 裁决。

**严重性判断：偏低**

原始 `[中]` 对用户可见误导风险成立，但在 CR workflow 中应提升为 P1 decision gate。原因是 `resolutionMode` 被投影到 manifest、CommandResult 和 Ready Summary（`src/installer/config-initialization.ts:457-460`、`src/commands/install.ts:1293-1320`、`src/commands/install.ts:1426-1432`；`SPEC 01` / `SPEC 04` 也将其定义为 public projection 字段，见 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:599-617`、`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:100-119`）。如果含义未裁决，后续 fixer 不知道应该修 resolver、修 prompt/tests，还是保留 current projection。

这不是 P0：没有证据表明目录创建、manifest reconciliation 或 ReadyCheck 因此失效；Round 2 summary 也说明各输出会一致传播同一个 mode，主要风险是 public semantics 错误。

**修复建议：当前不可直接授权；需 owner decision 后执行**

需要先由 owner 对以下问题给出稳定裁决：

1. Fresh lifecycle 中，用户在 detailed prompt 对某个 artifact root 字段输入非空值时，该 field 的 `resolutionMode` 是否必须为 `explicit-config`？
2. 如果答案是“是”，Story 11.2 kickoff gate line 33 的 “all seven roots in fresh install 为 `fresh-default`”是否需要通过 controlled correction / decision record 收口，避免后续 CR 再次把同一行为判为违背 gate？
3. 如果答案是“否”，CLI detailed prompt、config initialization tests 和 user-facing summary 是否需要明确说明 fresh artifact-root overrides 只是 fresh default projection 的参数化结果，还是应禁止/移除 per-root prompt override？

Owner 文件与决策位置：

- `SPEC 09`：拥有 artifact roots、fresh defaults、existing explicit config、legacy fallback 与 mode semantics，应作为首要 owner。
- Story 11.1：拥有 executable resolver contract 与 focused resolver tests；若要扩展 fresh detailed explicit semantics，应同步其 contract/evidence matrix。
- Story 11.2 kickoff / Story 11.2：当前已经写入 fresh projection public shape 与 “all seven roots fresh-default” gate decision；若新裁决改变该语义，需要 controlled follow-up，不应由 fixer 擅自编辑历史 gate。
- `SPEC 01` / `SPEC 04`：目前只定义 public projection field 和 enum，不拥有 lifecycle source-selection semantics；仅当 owner 决策需要补充 public field semantics/examples 时再更新。

若 owner 裁决为“fresh detailed per-root 非空输入应为 `explicit-config`”，建议 bounded fixer scope 为：

- `src/config/artifact-root-resolver.ts`：仅修改 `selectRootValue()` fresh 分支。`explicitValue !== undefined` 时返回该 value 与 `resolutionMode: "explicit-config"`；只有走 `createFreshDefaultForOutputFolder(...)` 的 per-root default 时返回 `fresh-default`。
- `test/artifact-root-resolution.test.ts`：增加 fresh lifecycle + per-root explicit value 的 focused contract test，证明对应 field 为 `explicit-config`，其他未显式字段仍为 `fresh-default`。
- `test/config-initialization.test.ts`：在 fresh detailed round-trip case 中断言 `planning_artifacts` projection 为 `explicit-config`；补 quick/default negative guard，证明 quick fresh 七 roots 仍为 `fresh-default`。
- `src/installer/config-initialization.ts`：默认无需改；只有 resolver API 调整后类型或 test 暴露传播缺口时才改。
- `src/bin/speclite.ts`：默认无需改；prompt 已表达 Enter 保留 deterministic default、非空输入覆盖。
- 受影响 fixtures：quick fresh fixtures 不应变化；仅当仓库存在或新增 detailed install fixture 时，才更新对应 manifest/CommandResult expected projection。不得改 quick default snapshots 来掩盖 regression。

Quick defaults negative guard：`resolveArtifactRoots({ lifecycle: "fresh" })`、`install --yes` quick path，以及只设置 `output_folder` 后派生七 root defaults的场景，仍应保持七个 per-root `fresh-default`，除非 owner 明确把 `output_folder` 本身也定义为 per-root explicit source。

**误报评估：非误报，但分类需改为 decision_needed**

不是误报，因为 runtime 确实把用户可输入的 non-default root 显示为 `fresh-default`。但它也不是可直接修的普通 bug：closed gate 与 Story AC 已经给出相反字面约束。结论是 `decision_needed`，阻塞本轮 closeout；不得在没有 owner decision 的情况下让 fixer 改 resolver 或改 Story/SPEC/gates。

---

## 发现 #2 评估

### 审查原文

> **[中][新] brownfield tutorial Step 1 / Step 6 仍把 default quick config 指向旧路径**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P2 优先级）

### 评估分析

**问题描述准确性：准确**

当前文件证据支持 reviewer 判断。`docs/tutorials/first-brownfield-project.md:74-78` 仍写明“默认 quick config 会把状态文件写到 `docs/brownfield/project-scan-report.json`”，并用 `test ! -e "$PROJECT_ROOT/docs/brownfield/project-scan-report.json"` 作为第一次扫描 sentinel。该路径与 Story 11.2 fresh `project_knowledge` default 已不一致。

同一 tutorial 的 Step 5 已经被 Round 1 fixer 修正为 `_speclite-output/project-knowledge-base/brownfield/`，并说明 planning handoff 可位于 `_speclite-output/2-planning-artifacts/` 或 `{project_knowledge}/brownfield/planning/`（`docs/tutorials/first-brownfield-project.md:149-171`）。这进一步证明 Step 1 / Step 6 是局部遗漏，而不是历史示例。

Step 6 仍把 default quick config 允许路径列为 `docs/brownfield/**` 与 `_speclite-output/planning-artifacts/*.md`（`docs/tutorials/first-brownfield-project.md:192-197`），缺少 fresh `project_knowledge` default 和 numbered planning root。`SPEC 09` 明确 `docs/` 不是 fresh-install `{project_knowledge}` default、alias 或 fallback，Workflow-generated project knowledge 的 fresh default 是 `_speclite-output/project-knowledge-base/`（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:88-93`）。

**严重性判断：合理**

该问题是 current public tutorial 的可执行步骤，用户按文档操作会检查错误 sentinel path，并在 Step 6 把正确的新 default outputs 判成越界或遗漏。它不会改变 runtime 行为，也不证明 brownfield Skill runtime routing 已经迁移，因此不应升级为 P1 runtime blocker；但作为 D1 current docs drift，P2 current fixer patch 合理。

**修复建议：可行**

授权后续 fixer 仅修改 `docs/tutorials/first-brownfield-project.md` 两个 section：

- `Step 1: Prepare the Workspace（准备工作区）`：把 sentinel path 从 `docs/brownfield/project-scan-report.json` 改为默认 `{project_knowledge}` 下的 `_speclite-output/project-knowledge-base/brownfield/project-scan-report.json`；也可采用先通过 `speclite resolve config --project-root "$PROJECT_ROOT"` 得到 `{project_knowledge}` 再检查 `{project_knowledge}/brownfield/project-scan-report.json` 的表达，但不得引入新的 runtime behavior claim。
- `Step 6: Verify the Write Boundary（验证写入边界）`：把允许路径从 `docs/brownfield/**` 与 `_speclite-output/planning-artifacts/*.md` 对齐到 fresh default `_speclite-output/project-knowledge-base/brownfield/**`，并列出 `_speclite-output/2-planning-artifacts/brownfield-planning-brief.md`、`_speclite-output/2-planning-artifacts/candidate-change-slices.md`、`_speclite-output/2-planning-artifacts/feature-entry-points.md`；如保留 optional planning under `{project_knowledge}/brownfield/planning/`，必须表述为按 Skill/effective config 解析结果出现。

禁止 scope：

- 不修改 brownfield Skill runtime routing、scripts、Skill packages 或 canonical source behavior。
- 不修改 `docs/tutorials/first-brownfield-project.md` 以外的 docs。
- 不修改 `docs/reference/workflow-artifact-layout.md` 后续 generic routing strings、Story、SPEC、Flow Gate、tracker、review summaries 或 CR TODO backlog。

**误报评估：非误报**

不是误报。Round 1 已授权的 bounded docs 主体不包含 Step 1 / Step 6，因此这些旧路径仍是当前文档 drift，不是历史记录，也不是 workflow routing future-story 的 generic string。

---

## 整体评估结论

### 需要决策（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | fresh detailed artifact root 显式覆盖被投影为 `fresh-default` | [中] | **P1 / decision_needed** | 现象有效，但 Story 11.2 AC/gate 与 CLI detailed override/test 行为冲突；必须由 owner 裁决 fresh detailed per-root 非空输入的 `resolutionMode`。 |

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 无 | 无 | - | - | 本轮没有可在无 owner decision 情况下直接修复的 P1 code blocker。 |

### 当前 Fixer Patch（非阻塞 D1 闭环）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 2 | brownfield tutorial Step 1 / Step 6 仍把 default quick config 指向旧路径 | [中] | **P2** | 可授权修改 `docs/tutorials/first-brownfield-project.md` 的 Step 1 与 Step 6，修正 fresh default docs drift。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R2-follow-up | `docs/reference/workflow-artifact-layout.md` generic workflow routing strings | [follow-up] | **P2 / future-story** | 归属 Story 11.4+ workflow routing / canonical Skill alignment 或 owner decision；不是当前 Story 11.2 patch。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | - | 两项 finding 的底层现象均成立。 |

### 评估决定

- **Round 1 ReadyCheck reconciliation**：持续 Closed。当前代码已 fail-closed 比较 fresh projection missing/count/order/duplicate/entry mismatch，并保留 legacy optional compatibility。
- **Round 1 bounded docs 主体**：持续 Closed。核心 docs 已同步七 fresh defaults 与 Public Documentation / Project Knowledge separation。
- **Finding #1（fresh detailed explicit root mode）**：改裁为 `decision_needed`。不得直接进入 code fixer；必须先由 `SPEC 09` / Story 11.1 / Story 11.2 owner 决策 fresh detailed per-root 非空输入是否属于 `explicit-config`，并明确是否需要 controlled correction Story/gate/SPEC 文本。若 owner 裁决为 `explicit-config`，fixer scope 限于 `src/config/artifact-root-resolver.ts`、`test/artifact-root-resolution.test.ts`、`test/config-initialization.test.ts`，以及必要时新增/更新 detailed fixture；quick defaults 必须有 negative guard。
- **Finding #2（brownfield tutorial Step 1 / Step 6）**：确认有效，P2 current fixer patch。授权仅修改 `docs/tutorials/first-brownfield-project.md` 的 Step 1 与 Step 6 两个 section；禁止改变 brownfield Skill runtime routing 或其他 docs。
- **workflow-artifact-layout generic route strings**：不作为当前 patch。维持 CR TODO / Story 11.4+ owner scope。
- **additive v1 strategy**：持续合理。`SPEC 01` / `SPEC 04` 的 `artifactRoots[]` 是 optional additive projection，legacy `artifactRoot` 保留，schema version 不需要 bump（`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:612-617`、`:675-691`；`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:113-146`）。
- **packaging / canonical closure**：持续合理。Round 2 review 记录 canonical warn/strict、packaging check、build、full tests 与 `git diff --check` 均通过；未发现需要回滚 packaging hash 或 canonical source closure 的证据。
- **11.3+ boundary**：持续合理。Story 11.2 AC7 明确不实现 existing fallback/mismatch/migration，也不改 Analysis、Planning、UX、Readiness 或 CR workflow routing；本轮不授权进入 Story 11.3+。
- **整体结论**：不通过。下一步不是 finalizer；先完成 owner decision。若 owner 决策允许 `explicit-config` path，再执行 bounded fixer；同时可执行 Finding #2 的 tutorial Step 1 / Step 6 patch。修复后需要新一轮 CR reviewer/evaluator。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-03
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2

#### Fix Item 1: fresh detailed artifact root 显式覆盖 mode

- **Decision Input**: 用户已明确批准方案 A：fresh detailed prompt 中某个 artifact root 的非空逐 field 输入必须标为 `explicit-config`；未显式输入的 fields、quick/default、以及仅设置 `output_folder` 后派生的七 roots 仍为 `fresh-default`。
- **Owner Artifact Correction**: 已在 `SPEC 09`、Story 11.1、Story 11.2 和 Story 11.2 kickoff gate 中追加 `Controlled Correction 2026-09-03`，保留 2026-09-02 “fresh install all seven roots are `fresh-default`” 原决策轨迹，并将其范围收窄到 quick/default 与未显式逐 field 覆盖场景。
- **Runtime Fix**: `src/config/artifact-root-resolver.ts` 的 fresh 分支现在在 `explicitValue !== undefined` 时返回 `resolutionMode: "explicit-config"`；只有走 canonical fresh default 或 `output_folder` 派生 default 时返回 `fresh-default`。
- **Test Evidence**: `test/artifact-root-resolution.test.ts` 新增 fresh detailed per-field override 断言；`test/config-initialization.test.ts` 在 detailed round-trip 中断言 `planning_artifacts` 为 `explicit-config`，并保留 quick + `output_folder` 派生七 roots 全部 `fresh-default` 的守卫。

#### Fix Item 2: brownfield tutorial Step 1 / Step 6 路径 drift

- **Docs Fix**: 仅修改 `docs/tutorials/first-brownfield-project.md` 的 Step 1 和 Step 6：sentinel path 从 `docs/brownfield/project-scan-report.json` 改为 `_speclite-output/project-knowledge-base/brownfield/project-scan-report.json`；允许写入范围改为 `_speclite-output/project-knowledge-base/brownfield/**` 与 `_speclite-output/2-planning-artifacts/...` 三个 planning handoff 文件，并保留 Skill/effective config 将 handoff 解析到 brownfield planning 子目录的条件表达。
- **Scope Guard**: 未修改 brownfield Skill runtime routing、其它 generic docs routes、Story 11.3+、schema version、SPEC 01/04/07、canonical module source或其它未授权文件。

#### Verification（验证）

- `npx vitest run test/artifact-root-resolution.test.ts test/config-initialization.test.ts` -> 2 files passed, 18 tests passed.
- `npx vitest run test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts test/fixture-release-gates.test.ts test/resolve-readers.test.ts test/artifact-path-validation.test.ts` -> 5 files passed, 48 tests passed.
- `npm run docs:check` -> passed: 72 Markdown files, 5 drafts.
- `npm run build` -> passed.
- `npm test` -> 61 files passed, 481 passed, 4 todo.
- Canonical governance/check: `speclite-canonical-source-governance-runner` workflow applied read-only classification; changed canonical path remains `assets/source/speclite/sdlc-skills/module.yaml`, impacted classes are `canonical-source-truth:D0` and `module-discovery-contract:D0`, `decisionRecordRequired: false`. Warn and strict checker both returned `status: ok`, `findings: []`.
- `npm run release:packaging-check` -> passed for `release/packaging-manifest.json` and `dist/packaging-manifest.json`.
- `git diff --check` -> passed.

#### Residual Risk（遗留风险）

- 本轮未启动 Reviewer、Evaluator 或 Finalizer；按 strict-serial CR 流程，仍需要 fresh Round 3 reviewer/evaluator 复核后才能 finalizer。
- 工作树已有本轮前存在的大量 Story 11.1/11.2 相关变更和 CR artifacts；本次未 commit、未 push、未回退无关变更。
