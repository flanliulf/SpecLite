---
Story: 4-3
Round: 2
Date: 2026-05-31
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 4-3-code-review-summary-20260531-round-2.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 4-3 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。本轮审查确认 Round 1 的 2 个阻塞项已收敛，同时提出 1 个新的 `patch` 项：manifest 文件本身缺失或不可读时仍会绕过 source descriptor blocker，并可在 `--yes` 下暴露 write-capable update plan。经代码验证，该发现成立且必须修复；Round 1 的慢测治理项继续作为非阻塞 defer 记录。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical`：已修复

经代码验证，`src/update/update-plan.ts:112-126` 的 `planRepair()` 当前只返回空 `repairPlan.actions`、空 apply results 和 `writeAuthorized: false`，不再遍历 `filesIndex` 生成 `restore-canonical` 或 `regenerate` repair action。`src/commands/update.ts:53-63` 仍保留稳定 `update.repair` command id，但 command data 来自受保护的空 repair projection，因此 Round 1 的越界 repair 行为已收敛。

### Round 1 / Finding #2：manifest 存在但缺失或 malformed `sourceDescriptor` 被当作无问题：已修复

经代码验证，`src/update/update-plan.ts:239-280` 当前会将 manifest 中缺失 `sourceDescriptor` 映射为 `source-integrity.missing-source-descriptor`，将 schema parse 失败映射为 `source-integrity.malformed-source-descriptor`。`src/update/update-plan.ts:169-178` 会在这些 error issue 出现后返回空 `updatePlan.actions` 并设置 `blocked: true`。`test/update-planning.test.ts:318-421` 已覆盖 manifest 存在但缺失 `sourceDescriptor`、以及 malformed `sourceDescriptor` 两个场景。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#3 | 默认 `npm test` 5s timeout 下慢测治理 | CR TODO / 非阻塞 | 同意维持为非阻塞 defer；Round 2 review 记录本轮 `npm test` 已通过，未构成本轮交付 blocker。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] manifest 文件缺失或不可读时仍绕过 source descriptor blocker 并授权 update plan**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述与当前代码一致。`src/update/update-plan.ts:169-178` 会把 `readManifestContext()` 返回的 `issues` 合并进 planning context，并且只在 `hasBlockingResolverIssue(issues)` 为真时提前返回 `blocked: true`。但 `src/update/update-plan.ts:203-219` 的 `readManifestContext()` 在读取或解析 `_speclite/_config/manifest.yaml` 失败时直接进入 `catch`，返回 `{ artifactRoot: "_speclite-output", issues: [] }`。

因此，manifest 文件缺失、不可读或 YAML parse 失败不会产生任何 `source-integrity.*` blocker。随后 `planUpdate()` 会继续遍历 `context.filesIndex.entries`，并在 canonical source hash 与 installed hash 不一致时生成 `action: "update"`（`src/update/update-plan.ts:45-85`）。当调用方传入 `--yes` 时，`src/commands/update.ts:66-79` 会把 `writeAuthorized` 传给 `planUpdate()`；`src/update/update-plan.ts:98-106` 会在无 conflicts 且存在 planned write action 时返回 `writeAuthorized: true`。

当前已有测试只覆盖 manifest 存在但缺失 `sourceDescriptor`、以及 manifest 存在但 `sourceDescriptor` malformed 的路径（`test/update-planning.test.ts:318-421`），没有覆盖 manifest 文件本身缺失、不可读或 YAML parse 失败的路径。Round 2 review 对剩余 patch 的定位准确。

**严重性判断：合理**

该问题会让缺少可验证 source evidence 的安装状态继续生成 write-capable update plan，直接绕过 Story 4.3 对 source descriptor trust/evidence gate 的要求。虽然 Story 4.3 不执行真实文件写入，但 `--yes` 下暴露 `writeAuthorized: true` 的 update plan 会破坏 pre-write gate 语义，因此按 P1 阻塞修复合理。

**修复建议：可行**

建议将 `readManifestContext()` 的 `catch` 分支改为返回稳定的 blocking issue，例如 `source-integrity.missing-source-descriptor` 或更精确的 manifest/source descriptor blocker，并保持 `hasBlockingResolverIssue()` 能将 planning 设置为 `blocked: true`。同时补充 focused tests 覆盖 `_speclite/_config/manifest.yaml` 缺失、不可读或 YAML parse 失败且 files index/sourceRef 足以生成 update action 的场景，断言 `updatePlan.actions: []`、`writeAuthorized: false`、exit code non-zero。

**误报评估：非误报**

不是误报。代码证据显示 manifest 读取失败路径返回空 issues，且后续 update planning 可继续产生 write-capable plan；现有测试未覆盖该剩余缺口。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | manifest 文件缺失或不可读时仍绕过 source descriptor blocker 并授权 update plan | [中] | **P1** | manifest 读取失败路径返回空 issues，导致缺少 source evidence 时仍可能生成 `writeAuthorized: true` 的 update plan。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R1-#3 | 默认 `npm test` 5s timeout 下慢测治理 | [低] | **P2** | 维持 Round 1 评估结论，仅记录为既有慢测治理项；Round 2 review 记录本轮 `npm test` 已通过。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（manifest 文件缺失或不可读时仍绕过 source descriptor blocker 并授权 update plan）**：确认有效，必须修复后才能通过。
- **R1-#3（默认 `npm test` 5s timeout 下慢测治理）**：有效但非阻塞，仅建议维持 CR TODO / 后续测试治理记录。

**最终评估决定：不通过。** 本轮共有 1 个阻塞修复项、1 个非阻塞延迟项、0 个误报。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-31
- **Model Used**: GPT-5.5
- **Fix Items**: 1

#### 修复条目

1. **发现 #1（manifest 文件缺失或不可读时仍绕过 source descriptor blocker 并授权 update plan）**
   - **状态**: 已修复
   - **修改文件**:
     - `src/update/update-plan.ts`
     - `test/update-planning.test.ts`
   - **修复内容**:
     - 将 `readManifestContext()` 的 manifest 读取/解析失败路径从返回空 `issues` 改为返回 `source-integrity.missing-source-descriptor` error issue，使 `readPlanningContext()` 通过既有 `hasBlockingResolverIssue()` gate 阻断 update planning。
     - 补充 `--yes` focused tests 覆盖 `_speclite/_config/manifest.yaml` 缺失、manifest YAML 无法解析两类路径，断言 `updatePlan.actions: []`、`writeAuthorized: false`、exit code non-zero，防止再次暴露 write-capable update plan。
   - **非阻塞 defer**:
     - R1-#3 默认 `npm test` 5s timeout 下慢测治理仅保留为 CR TODO / 后续治理项，本轮 fixer 未处理。

#### 验证记录

- `npx vitest run test/update-planning.test.ts`：通过，1 个测试文件 / 12 个测试通过。
- `npm run build`：通过，ESM 与 DTS 构建成功。
- `git diff --check -- src/update/update-plan.ts test/update-planning.test.ts _bmad-output/implementation-artifacts/code-reviews/4-3-code-review/4-3-code-review-evaluation-20260531-round-2.md`：通过，无 whitespace error。
- `git diff --check --no-index /dev/null <target-file>` 分别检查 `src/update/update-plan.ts`、`test/update-planning.test.ts`、本 evaluation 文件：通过，无 whitespace error；补充原因是当前目标文件在工作树中未跟踪，普通 `git diff --check` 没有可显示 diff。
