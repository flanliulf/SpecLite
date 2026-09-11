---
Story: 11-4
Round: 2
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

本轮为 replacement full-scope 复审。Round 1 `11-4-code-review-summary-20260903-round-1.md` 因错误声明 Agent 调度不可用、未执行 `bmenhance-cr-01-reviewer` 要求的独立审查层而被流程作废；本 Round 2 明确 supersede Round 1，不把 Round 1 的通过结论作为进入 Evaluator 的依据。

三层 provenance：

- Blind Hunter：outer-dispatched fresh GPT-5.5 layer completed；提出 2 个 high patch 候选。Reviewer aggregator 已独立复现并采纳为 `patch`。
- Edge Case Hunter：outer-dispatched fresh GPT-5.5 layer completed；未提出 finding。Reviewer aggregator 复核 active corpus scan 与 focused tests 后未补充 edge finding。
- Acceptance Auditor：outer-dispatched fresh GPT-5.5 layer completed；AC 维度为 `PASS_WITH_LOW_DEFER`，低优先 defer 为 broad scan `575` 缺少可复现命令。Reviewer aggregator 已采纳为非阻塞 evidence hygiene 问题。

结论：不通过。当前实现满足 fresh install Analysis subject directories、active producer route、三空间边界与 focused tests，但存在 2 个必须进入 Evaluator 的 `patch` 桶问题：新 Analysis Skill 的 runtime config 消费路径没有真正接入 Story 11.1 artifact-root resolver；Product Brief / PRFAQ 的 existing-install legacy fallback 会错过旧 planning root-level artifact，导致 resume/create 行为不兼容。二者均无需 Owner decision，现有 AC 7、AC 9 与 `SPEC 09` 已给出唯一方向：保持 existing artifacts 原位且可被旧配置继续消费。

## 上轮问题回顾

### 已作废

1. Round 1 — 单上下文串行审查通过结论
   - 作废原因：报告声称 Agent 调度工具不可用，但外层 runner 已证明可调度 fresh layer；因此 Round 1 缺少所声明 cross-agent review 的真实 provenance。
   - 处置：保留文件作为 invalid process evidence；本 Round 2 重新执行 full-scope 审查并 supersede 其结论。

### 仍为非阻塞待办

1. Round 1 / Finding #1 — Broad legacy-pattern `575` 精确计数缺少可复现命令
   - 维持既有判断：真实存在的 evidence hygiene gap，非 Story 11.4 active producer routing 缺陷；本轮归入 `defer`。

## 新发现

### 1. [高][新] Existing install 中 Analysis workflows 读取 raw merged config，未消费 artifact-root resolver 的 legacy fallback

- **来源**：blind
- **分类**：patch

- **证据**
  - Analysis workflow guidance 要求运行 `speclite resolve config --project-root {project-root}` 并从 merged runtime config 读取 `{analysis_artifacts}`，例如 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:53-58`、`assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:44-49` 与 `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/references/workflow-details.md:38-42`。
  - `src/commands/resolve.ts:51-54` 的 `resolve config` 仅调用 `resolveProjectConfig({ projectRoot, keys })`；`src/config/config-reader.ts:17-43` 只读取四层 TOML；`src/config/customization-reader.ts:111-112` 只从 merged TOML 中选择 dotted keys。
  - 真实 resolver 另在 `src/config/artifact-root-resolver.ts:62-68` 定义 `analysis_artifacts` 的 `legacyFallbackFrom: "modules.sdlc.planning_artifacts"`，并由 `resolveArtifactRootsFromProjectConfig()` 在 `src/config/artifact-root-resolver.ts:209-219` 消费；`resolve config` 当前没有调用这条路径。
  - 定向复现：临时 existing install 配置只含 `planning_artifacts` 而不含 `analysis_artifacts` 时，`npm run dev -- resolve config --project-root <temp> --key modules.sdlc.analysis_artifacts` 输出 `{}`，full `resolve config` 也不包含 `analysis_artifacts`；同一配置调用 `resolveArtifactRootsFromProjectConfig({ lifecycle: "existing" })` 可得到 `analysis_artifacts -> _speclite-output/planning-artifacts, resolutionMode=legacy-compatible`。

- **影响**
  - Story 11.4 AC 7 要求 existing install 无 `analysis_artifacts` 时消费 Story 11.1 resolver 与 Story 11.3 compatibility；当前 Skill 激活路径拿不到 resolver-backed value，可能 HALT 于“关键字段为空”，或保留未解析 `{analysis_artifacts}` placeholder，导致 existing install 的 Analysis workflows 无法按 legacy fallback 写入。

- **建议**
  - 让 workflow activation 能消费 resolver-backed artifact roots，而不是只消费 raw TOML。可选修复方向包括：为 `speclite resolve config` 增加清晰的 resolved artifact-root 输出契约，或提供并在 affected Skills 中使用专门的 artifact-root resolve command/API；同时补 CLI/Skill 层 regression，覆盖 existing install 缺 `analysis_artifacts` 时 `{analysis_artifacts}` 能解析到 legacy `planning_artifacts`。

### 2. [高][新] Product Brief / PRFAQ legacy fallback 会错过旧 planning root-level artifact

- **来源**：blind
- **分类**：patch

- **证据**
  - 旧版 Product Brief / PRFAQ artifact 位于 planning root 直下：`git grep` against `HEAD` 显示 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/draft-and-review.md:21` 为 `{planning_artifacts}/product-brief-{project_name}.md`，`assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:63` 为 `{planning_artifacts}/prfaq-{project_name}.md`。
  - 当前实现把新路径改为 subject directory：Product Brief 使用 `{analysis_artifacts}/product-brief/product-brief-{project_name}.md`，PRFAQ resume/headless/create 使用 `{analysis_artifacts}/prfaq/prfaq-{project_name}.md`，见 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/draft-and-review.md:21`、`assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:64-67`。
  - 定向复现：在 existing install 缺 `analysis_artifacts` 时，resolver 将 `{analysis_artifacts}` root fallback 到 `_speclite-output/planning-artifacts`；`createArtifactContract({ outputLocation: "{analysis_artifacts}/product-brief" })` 解析为 `_speclite-output/planning-artifacts/product-brief`，`"{analysis_artifacts}/prfaq"` 解析为 `_speclite-output/planning-artifacts/prfaq`，不会命中旧的 `_speclite-output/planning-artifacts/product-brief-{project_name}.md` / `_speclite-output/planning-artifacts/prfaq-{project_name}.md`。
  - 当前 `test/analysis-artifact-routing.test.ts:172-220` 的 legacy fallback regression 只覆盖 research artifact `_speclite-output/planning-artifacts/research/...`，未覆盖 Product Brief / PRFAQ 的旧 root-level main、distillate、stage/resume/verdict artifact。

- **影响**
  - Existing users with legacy Product Brief / PRFAQ artifacts will not be migrated, but the updated workflows will look in a new subject subdirectory and fail to resume the existing artifact. This can duplicate product brief / PRFAQ creation and breaks AC 7's legacy no-migration compatibility promise for two of the five Story 11.4 producer families.

- **建议**
  - 为 Product Brief / PRFAQ 增加 explicit legacy root-level discovery/resume compatibility，或在 resolver/contract 层提供 subject-specific legacy path mapping；无论实现位置如何，都必须补 tests 覆盖 legacy root-level Product Brief main/distillate 与 PRFAQ main/stage/distillate/verdict，不只覆盖 research subdirectory。

### 3. [低][新] Broad scan `575` 计数缺少可复现命令

- **来源**：auditor
- **分类**：defer

- **证据**
  - Completion gate 在 `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md:61-63` 声称 broad repo scan found `575` legacy-pattern hits，并给出分类桶；Story Dev Agent Record 也在 `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:165` 记录该数值。
  - Gate / Story 未记录原始 command、regex、include/exclude glob 或 per-bucket input source。Acceptance layer reported 不同 regex 得到 `126`、`154`、`599`、`605`；aggregator 本轮用两个显式 regex 在当前 worktree 复跑，得到 `123` 与 `154`。这些结果足以证明 exact `575` 不可独立复现。
  - Active 11.4 surface scan 仍为空输出：五个 affected producer packages、`module-help.csv`、current docs 与 `test/analysis-artifact-routing.test.ts` 未发现 active `{planning_artifacts}/research/`、Planning-root Product Brief/PRFAQ 或 `{project_knowledge}/research` producer default。

- **影响**
  - 不影响当前两个高优先 `patch` 的判断，也不证明 active route regression；但削弱 completion gate 中 broad historical classification 的可审计性。

- **建议**
  - 保留为 CR TODO / evidence hygiene defer；后续由 CR05 或独立证据治理补充 command、regex、scope 与 per-bucket counts。无需在本轮 fixer 中扩大为源码修复，除非 Evaluator 另行认定其阻塞。

## 验证摘要

- `npx vitest run test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/resolve-readers.test.ts --reporter=dot` PASS：3 files / 17 tests passed。
- 定向 CLI 复现 PASS：legacy config 缺 `modules.sdlc.analysis_artifacts` 时，raw `speclite resolve config --key modules.sdlc.analysis_artifacts` 输出 `{}`；resolver API 同配置返回 `analysis_artifacts` legacy-compatible fallback。
- 定向 contract 复现 PASS：Product Brief / PRFAQ 在 current fallback root 下解析到 `_speclite-output/planning-artifacts/product-brief` 与 `_speclite-output/planning-artifacts/prfaq`，与 HEAD 旧 root-level basename 不同。
- Active negative scan PASS：active 11.4 surface 未发现旧 Analysis producer defaults。
- Broad scan evidence CHECKED：exact `575` 未能复现；不同 regex/count 口径不稳定，保留 defer。

## 通过项

- Edge Case Hunter 未发现额外边界问题；aggregator 未在 active producer surface 中发现旧默认路径残留。
- Fresh install subject directories 与 artifact contract projection 仍由 `test/analysis-artifact-routing.test.ts` 覆盖。
- Story 11.1 resolver 的 root-level fallback 行为本身存在且测试通过；问题集中在 Story 11.4 affected workflow 的消费方式与 Product Brief / PRFAQ subject-specific legacy compatibility。
- Project Knowledge 仍仅作为 context/read plane；`docs/` 未被作为 Analysis output target。
- 本轮未修改源码、测试、Story、flow gate、tracker、CR rules、TODO 或日志。

## 结论

- **结论：不通过**
- **阻塞项**：Finding #1、Finding #2
- **非阻塞项**：Finding #3
- **建议**：进入 fresh `bmenhance-cr-02-evaluator 11-4`。若 Evaluator 采纳 #1/#2，应授权 Fixer 做定点修复并补覆盖；修复后必须重新 Reviewer / Evaluator。
