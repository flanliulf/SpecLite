---
Story: 7-1
Round: 1
Date: 2026-06-15
Model Used: GPT-5 (Codex)
Review Source: 7-1-code-review-summary-20260615-round-1.md
Review Model: GPT-5 (Codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 7-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 2 个发现：1 个 existing hook config conflict 的 plan-before-write 违规，1 个 installed runner 在缺失 `_speclite/config.toml` 时缺少结构化 block 输出的韧性问题。评估结论：审查结论不通过成立；Finding #1 需要修复并阻塞交付，Finding #2 有效但建议降级为 CR TODO，误报 0 个。

---

## 发现 #1 评估

### 审查原文

> **[中] Existing hook config conflict 在返回 manual action 前已产生部分安装写入**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码路径确认冲突检测发生在多类安装写入之后。`src/installer/runtime-structure.ts:189-204` 先调用 `writeIdeMirrors` 并完成 `ide-mirror-creation`；`src/installer/runtime-structure.ts:209-216` 随后才调用 `writeFlowGateHookArtifacts`，并在 hook artifact 结果返回后才处理 failure。`src/installer/hook-artifacts.ts:36-67` 先创建 `_speclite/hooks/flow-gate-enforcement/` 并写入 `runner.mjs` 与 `hook-manifest.json`；`src/installer/hook-artifacts.ts:69-77` 之后才对 `.claude/settings.json` / `.codex/hooks.json` 做 existing config conflict 检测。

Story AC3 要求 existing project configs 必须 `plan-before-write`、保留 human-owned 配置并输出 manual action，见 `_bmad-output/implementation-artifacts/stories/7-1-flow-gate-hook-enforcement.md:27-31`。当前实现虽然没有覆盖既有 `.claude/settings.json`，但没有在写入前完成 hook config conflict planning，违反 `plan-before-write` 语义。

独立临时目录复现也确认：预置 `.claude/settings.json` 后执行 `runInstallCommand({ yes: true })` 返回 `exitCode=1` 和 `ide-mirror.hook-config-conflict`，但 `_speclite/hooks/flow-gate-enforcement/runner.mjs`、`_speclite/hooks/flow-gate-enforcement/hook-manifest.json`、`_speclite/config.toml`、`.agents/skills/speclite-dev-story/SKILL.md`、`.claude/skills/speclite-dev-story/SKILL.md` 均已存在。

**严重性判断：合理**

原始严重性为 `[中]`，但从交付门禁角度应评估为 P1 阻塞。原因是 AC3 明确要求 existing config 场景具备 `plan-before-write` 保护；该问题会在返回 manual action 的失败路径中留下 partial installed state，属于功能契约违反，而不是纯体验或测试缺口。

**修复建议：可行**

审查建议在任何 IDE mirror、runtime structure 或 hook artifact 写入前预扫描 selected execution targets 的 platform hook config 冲突是可行的。更稳妥的修复方向是把 hook config conflict 检查提升到安装计划或 apply 前置阶段，并补充 `.claude/settings.json` 与 `.codex/hooks.json` 的 conflict 测试，断言失败路径不会新增 hook artifacts、IDE mirrors 或 installer runtime artifacts。

**误报评估：非误报**

该发现同时由 blind+edge+auditor 命中，且代码顺序与临时复现均支持原始审查结论；不是误报。

---

## 发现 #2 评估

### 审查原文

> **[低] Runner 缺失 `_speclite/config.toml` 时崩溃，而不是返回可执行 block 决策**
> - 来源：edge
> - 分类：patch

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

installed runner 入口在 `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs:9-17` 顶层直接读取 stdin、调用 `evaluate` 并输出结果，没有外层 `try/catch`。`assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs:64-66` 直接读取 `_speclite/config.toml`，缺失时 `readFile` 抛出 `ENOENT`。同构 TypeScript 实现 `src/hooks/flow-gate-enforcement.ts:29-31` 与 `src/hooks/flow-gate-enforcement.ts:101-111` 也没有捕获 config 读取错误。

测试覆盖显示正常路径均通过 `createProjectWithConfig()` 先写入 `_speclite/config.toml`，见 `test/flow-gate-hook-runner.test.ts:145-160`；现有 block tests 覆盖 missing/non-pass/wrong/stale gate metadata，见 `test/flow-gate-hook-runner.test.ts:65-121`，但未覆盖 runtime config 缺失或损坏。

独立临时目录复现确认：对缺少 `_speclite/config.toml` 的项目执行 `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs`，输入 `{"prompt":"/bmad-dev-story story 7-1","projectRoot":"<tmp>"}`，输出 Node `ENOENT` stack trace，`EXIT_STATUS=1`，而不是结构化 `{"decision":"block","reason":"..."}` 或 hook 约定的 `exitCode=2`。

**严重性判断：偏高**

原始严重性为 `[低]` 是合理方向，但不应阻塞 Story 7-1 当前交付。Story AC5 的前提限定为 kickoff gate 缺失、非通过、目标不匹配或 metadata 过期时的 blocking output，见 `_bmad-output/implementation-artifacts/stories/7-1-flow-gate-hook-enforcement.md:39-43`；这些主路径场景已由 `test/flow-gate-hook-runner.test.ts:65-121` 覆盖。缺失 `_speclite/config.toml` 更像损坏安装或 Finding #1 partial install 后的韧性缺口，不是 AC5 主路径失败。

**修复建议：可行但非必要**

捕获 config 缺失、不可读或不可解析错误并返回 platform 支持的 block shape 是可行改进；补充直接执行 installed `runner.mjs` 的测试也合理。但该修复可以作为 P2 CR TODO 延后，不应与 Finding #1 一起阻塞本轮交付。

**误报评估：非误报**

该行为真实存在，且直接复现支持审查原文；只是严重性和处理方式应降级为非阻塞 TODO。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Existing hook config conflict 在返回 manual action 前已产生部分安装写入 | [中] | **P1** | 违反 AC3 `plan-before-write`，失败路径留下 partial installed state，必须修复。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 2 | Runner 缺失 `_speclite/config.toml` 时崩溃，而不是返回可执行 block 决策 | [低] | **P2** | 真实韧性缺口，但不属于 AC5 主路径阻塞；建议作为 damaged/partial install resilience TODO 跟踪。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（Existing hook config conflict 在返回 manual action 前已产生部分安装写入）**：确认有效，P1 阻塞交付，需要 fixer 修复。
- **发现 #2（Runner 缺失 `_speclite/config.toml` 时崩溃，而不是返回可执行 block 决策）**：确认有效但降级为 P2 CR TODO，不阻塞本轮交付。

最终决定：本轮评估不通过，未 Approved。需要先修复 1 个阻塞项；建议新增 1 个 CR TODO；误报 0 个。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-15
- **Model Used**: GPT-5 (Codex)
- **Fix Items**: 1

#### 修复范围

- 修复 Finding #1：existing hook config conflict 在返回 manual action 前已产生 partial install writes，违反 AC3 `plan-before-write`。
- 未修复 Finding #2：runner 缺失 `_speclite/config.toml` 时崩溃；该项已由 evaluator 降级为 P2 CR TODO，留给后续 TODO tracker。

#### 修改摘要

- 在 `src/installer/hook-artifacts.ts` 中提取并导出 `detectFlowGateHookConfigConflict`，复用既有 `ide-mirror.hook-config-conflict` issue 生成逻辑。
- 在 `src/installer/runtime-structure.ts` 中将 selected target 的 hook config conflict 检测前置到 `acquireProjectOperationLock` 和任何 runtime / IDE mirror / hook artifact 写入之前；命中冲突时返回 manual action 且 `changedPaths=[]`。
- 在 `writeFlowGateHookArtifacts` 内部也先执行同一 preflight，避免该低层投影函数被直接调用时先写入 hook runtime artifacts 再发现 platform config conflict。
- 在 `test/hook-artifact-install.test.ts` 中将 existing hook config 测试扩展到 `.claude/settings.json` 与 `.codex/hooks.json`，断言失败路径不会产生 `_speclite/config.toml`、hook artifacts、IDE mirror skill 文件或 `_speclite/.lock`，且 issue details 不附带 partial `changedPaths`。

#### 验证结果

- `npm test -- test/hook-artifact-install.test.ts`：通过，3 个测试全部通过。
- `npm run build`：通过，`tsup` ESM 与 DTS build 成功。
- `git diff --check -- src/installer/runtime-structure.ts _bmad-output/implementation-artifacts/code-reviews/7-1-code-review/7-1-code-review-evaluation-20260615-round-1.md`：通过，无 whitespace error。

#### 结果

- P1 阻塞项已修复。
- 本轮未处理 P2 TODO。
