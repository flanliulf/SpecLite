---
Story: 10-1
Round: 1
Date: 2026-07-06
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 10-1-code-review-summary-20260706-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 10-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查只提出 1 个发现：interactive install 未实现 AC5 要求的 category -> ecosystem id 两级选择。经 Story AC、CLI wiring、prompt 实现和测试覆盖独立核对，该发现确认有效，属于 Story 10.1 验收缺口，应作为 P1 阻塞项交给 fixer 修复后复审。

---

## 发现 #1 评估

### 审查原文

> **[中] Interactive install 未实现 category -> ecosystem id 的两级选择**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 10.1 AC5 明确要求 interactive `speclite install` 在最终选择包含 `sdlc` 时，先展示 ecosystem category selection：`frontend` / `backend` / `other` / `skip`，并且用户选择 category 后只能看到该 category 下的 ecosystem ids；同时 `--yes`、`--json` 或无交互默认路径不得自动选择 ecosystem module，CLI / programmatic selection 仍需支持 exact module code（`_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md:47-54`）。

当前 CLI wiring 在 explicit interactive mode 中只注入一个 `selectModuleIds` prompt：`src/bin/speclite.ts:367-370` 调用 `createModuleSelectionQuestion(...)` 后直接把一次输入交给 `parseModuleSelectionAnswer(...)`。这说明交互层没有保存“用户先选 category”的中间状态，也没有第二个只展示所选 category ids 的 prompt。

当前 prompt 虽然把 ecosystem categories 和 ecosystem ids 展示在同一段文本里（`src/bin/speclite.ts:455-469`），但英文 prompt 仍要求 `Enter one or more module ids`（`src/bin/speclite.ts:487`），中文 prompt 仍要求输入 `exact module code`（`src/bin/speclite.ts:506`）。解析函数也只是把一次 answer 按空白或逗号拆成 module ids（`src/bin/speclite.ts:510-514`）。这与 AC5 的 category-first 两级交互不一致。

测试覆盖也支持 reviewer 判断：`test/install-module-selection.test.ts:231-255` 只验证 `ModuleSelectionPromptInput.ecosystemCategories` 数据结构和一次性返回 `["sdlc", "core"]`；`test/install-module-selection.test.ts:270-284` 直接通过 programmatic selection 返回 `["ecosystem-backend-java-springboot"]`。CLI smoke 测试仍以一次 `module ids` prompt 为契约，例如 `test/cli-smoke.test.ts:360-364` 和 `test/cli-smoke.test.ts:390`，以及 detailed config 路径的 `test/cli-smoke.test.ts:525-528`。未见 category-first、backend -> java-springboot 或 category skip 的 CLI 层测试。

**严重性判断：合理**

原始严重性标为 `[中]`，但从交付门禁角度应升级为 P1 阻塞修复。原因是 AC5 是 Story 10.1 的明确验收标准，且相关任务 Task 5 已标记完成（`_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md:101-107`），但当前实现只提供 grouped display + exact module code input，并未完成两级交互。该缺口直接影响用户可见安装 UX 和验收结果，不适合降级为 TODO。

**修复建议：可行**

reviewer 建议在 CLI 交互层增加真正的两步选择、保留 programmatic exact module code selection 和 invalid module id 诊断、补充 CLI 层测试，方向可行且范围清晰。修复应集中在 `src/bin/speclite.ts` 的 interactive prompt orchestration 和相关 CLI/focused tests：第一步选择 ecosystem category 或 skip；第二步只展示该 category 下 ids，并把 ecosystem id 映射到 `ecosystem-<category>-<id>` module code；非交互和 programmatic exact module code path 保持现有契约。

**误报评估：非误报**

这不是误报。当前代码确实能展示 category 分组，也能通过 exact module code 安装 ecosystem module，但这只能满足 programmatic/exact-code selection，不满足 AC5 要求的 interactive category -> ecosystem id 两级选择。reviewer finding 的来源为 blind+auditor，且同时命中 AC 覆盖缺口和代码行为证据，可信度高。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Interactive install 未实现 category -> ecosystem id 的两级选择 | [中] | **P1** | AC5 明确要求两级交互，当前 CLI 仍是一次 exact module code prompt，阻塞 Story 10.1 通过。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有适合降级为 CR TODO 的发现。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮未发现误报。 |

### 评估决定

- **发现 #1（Interactive install 未实现 category -> ecosystem id 的两级选择）**：确认有效，需进入 fixer，优先级 P1；修复后应补充 category-first、skip、backend -> java-springboot、unknown/empty answer 等 CLI 层测试，并保留 programmatic exact module code selection 契约。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-07-06
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：interactive `speclite install` 补齐 category -> ecosystem id 两级选择

- **状态**: 已修复
- **修复范围**:
  - `src/bin/speclite.ts`
  - `test/cli-smoke.test.ts`
- **修复策略**:
  - 将 explicit interactive install 的 `selectModuleIds` adapter 从一次性 exact module code prompt 改为 CLI 侧编排：
    1. 先选择 standard module ids，空回答继续使用默认模块；
    2. 当最终 standard selection 包含 `sdlc` 且存在 ecosystem categories 时，展示 ecosystem category prompt；
    3. category 输入为空或 `skip` 时不选择 ecosystem module；
    4. category 有效时，只展示该 category 下的 ecosystem ids，并将用户输入的 ecosystem id 映射为对应 `ecosystem-<category>-<id>` module code；
    5. 未知 category 或未知 ecosystem id 保留为 invalid module id 输入，继续复用现有 unknown module selection 诊断；
    6. `--yes` / `--json` / 非交互默认路径和 `runInstallCommand` programmatic exact module code selection 契约不变。
- **测试覆盖**:
  - 新增 CLI smoke 覆盖 explicit `skip`；
  - 新增 CLI smoke 覆盖空 category answer；
  - 新增 CLI smoke 覆盖 `backend -> java-springboot` 映射到 `ecosystem-backend-java-springboot`；
  - 新增 CLI smoke 覆盖 unknown ecosystem id 进入 stable invalid module diagnostic；
  - 保留并更新原有 interactive module prompt 断言。
- **验证结果**:
  - `npm test -- --run test/cli-smoke.test.ts`：通过，17 tests passed。
  - `npm test -- --run test/install-module-selection.test.ts`：通过，11 tests passed。
  - `npm run build`：通过。
  - `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`：通过，`status=ok`，`findings=[]`；检查仍报告 71 个外部 canonical source changed paths，未纳入本 P1 修复。
  - `npm test`：通过，56 test files / 408 tests passed。
- **边界说明**:
  - 未修改 Story 文档内容。
  - 未修改 `_bmad-output/implementation-artifacts/sprint-status.yaml`。
  - 未修复、回滚、暂存或提交既有外部 drift，包括 `speclite-docs-intro-ppt-creator`、`speclite-html-ppt-generator`、`docs/reference/canonical-source-layout.md`、`.specskills/` 和 canonical source 相关变更。
