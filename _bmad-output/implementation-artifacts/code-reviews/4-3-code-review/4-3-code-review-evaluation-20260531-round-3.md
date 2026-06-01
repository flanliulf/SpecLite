---
Story: 4-3
Round: 3
Date: 2026-05-31
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 4-3-code-review-summary-20260531-round-3.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 4-3 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。本轮审查确认 Round 2 的 manifest 读取/解析失败 blocker 已修复，Round 1 的两个 blocker 未回归，同时提出 1 个新的 `patch` 项：`test/update-command.test.ts` 仍断言旧 missing files-index 行为，导致全量 `npm test` 有 2 个非 timeout 失败。经代码和测试验证，该发现成立且必须修复；历史慢测治理项继续作为非阻塞 defer 记录。评估结论如下。

---

## 上轮问题回顾确认

### Round 2 / Finding #1：manifest 文件缺失或不可读时仍绕过 source descriptor blocker 并授权 update plan：已修复

经代码验证，`src/update/update-plan.ts:198-230` 的 `readManifestContext()` 当前在读取或解析 `_speclite/_config/manifest.yaml` 失败时返回 `source-integrity.missing-source-descriptor` error issue。`src/update/update-plan.ts:169-178` 会在该 blocking issue 出现后提前返回 `blocked: true`，并保留空 `updatePlan.actions`，因此不再继续构造 write-capable update plan。

### Round 1 / Finding #1：Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical`：未回归

第 3 轮 review 复核结论可接受：`planRepair()` 未重新生成 executable repair actions，本轮没有证据显示 Round 1 的 repair 越界行为回归。

### Round 1 / Finding #2：manifest 存在但缺失或 malformed `sourceDescriptor` 被当作无问题：未回归

经代码验证，`src/update/update-plan.ts:249-290` 仍将 manifest 中缺失 `sourceDescriptor` 映射为 `source-integrity.missing-source-descriptor`，将 schema parse 失败映射为 `source-integrity.malformed-source-descriptor`。这些 issue 会被 `src/update/update-plan.ts:169-178` 的 blocking gate 阻断。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#3 | 默认 `npm test` 5s timeout 下慢测治理 | CR TODO / 非阻塞 | 同意维持为非阻塞 defer；本轮 `npm test` 的失败来自断言与当前 source descriptor gate 语义不一致，不是默认 5s timeout 慢测问题。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] `test/update-command.test.ts` 仍断言旧 missing files-index 行为，导致全量测试失败**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述与当前测试和实际运行结果一致。`test/update-command.test.ts:15-75` 的第一个 case 构造了 `_speclite/config.toml`、`_speclite/config.user.toml` 和 custom TOML，但没有创建 `_speclite/_config/manifest.yaml`，仍断言 `issues[0].issueId === "update.conflicts"`、`requiresConfirmation === true`，并期待 `_speclite/_config/files-index.json` conflict。`test/update-command.test.ts:77-137` 的 `update --repair --json` case 同样没有 manifest，却断言 `parsed.issues` 只包含 `update.conflicts`。

当前实现已经先执行 manifest/source descriptor gate。`src/update/update-plan.ts:169-178` 会把 `readManifestContext()` 产生的 blocking issue 合并进 planning context 后提前返回；`src/update/update-plan.ts:198-230` 在 manifest 读取或 YAML parse 失败时返回 `source-integrity.missing-source-descriptor`。因此，缺 manifest fixture 的首要预期应是 source descriptor blocker，而不是旧 missing files-index conflict 行为。

独立执行 `npx vitest run test/update-command.test.ts --testTimeout=15000` 复现 2 个失败：第一个 case 实际返回 `source-integrity.missing-source-descriptor`、`conflicts: []`、`requiresConfirmation: false`；第二个 case 实际返回 `source-integrity.missing-source-descriptor` 和 `update.conflicts` 两个 issues，导致原本只期待 `update.conflicts` 的断言失败。独立执行 `npm test` 也复现全量失败：28 个测试文件中 27 passed / 1 failed，180 个测试中 178 passed / 2 failed，失败均位于 `test/update-command.test.ts`，不是 timeout。

**严重性判断：合理**

该问题不是产品代码继续暴露 write-capable plan，而是测试套件与当前 Story 4.3 source descriptor gate 契约不一致。但它导致全量 `npm test` 红灯，属于质量门禁阻塞；按 P1 阻塞交付合理。

**修复建议：可行**

审查建议可行。若这两个 case 的目标是继续验证 missing files-index conflict，应补齐有效 `_speclite/_config/manifest.yaml` 与可信 `sourceDescriptor`，让 fixture 越过 manifest gate 后再触发 files-index conflict。若目标是验证缺 manifest gate，则应更新断言为 `source-integrity.missing-source-descriptor`、空 `conflicts`、`requiresConfirmation: false`、空 plan/apply results。`update --repair` case 还需要明确预期是否允许同时保留 files-index conflict；从当前实际输出看，至少必须把 source descriptor blocker 纳入 expected issues。

**误报评估：非误报**

不是误报。代码行号、focused test 和全量 `npm test` 都证明该 patch 项成立，且失败不是已知的默认 5s timeout 慢测治理项。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `test/update-command.test.ts` 仍断言旧 missing files-index 行为，导致全量测试失败 | [中] | **P1** | 全量 `npm test` 有 2 个非 timeout 失败，测试预期未同步当前 source descriptor gate 契约。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R1-#3 | 默认 `npm test` 5s timeout 下慢测治理 | [低] | **P2** | 本轮失败不是 timeout；继续作为既有慢测治理项延迟处理。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`test/update-command.test.ts` 仍断言旧 missing files-index 行为，导致全量测试失败）**：确认有效，必须修复后才能通过。
- **R1-#3（默认 `npm test` 5s timeout 下慢测治理）**：有效但非阻塞，仅建议维持 CR TODO / 后续测试治理记录。

**最终评估决定：不通过。** 本轮共有 1 个阻塞修复项、1 个非阻塞延迟项、0 个误报。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-31
- **Model Used**: GPT-5.5
- **Fix Items**: 1

#### 已修复条目

| # | Evaluation 条目 | 修复状态 | 修复说明 |
|---|-----------------|----------|----------|
| 1 | `test/update-command.test.ts` 仍断言旧 missing files-index 行为，导致 `npm test` 2 个非 timeout 失败 | 已修复 | 在前两个 update command fixture 中补齐可信 `_speclite/_config/manifest.yaml`，使测试越过 Story 4.3 source descriptor gate 后继续覆盖缺失 `_speclite/_config/files-index.json` 的 `update.conflicts` 行为；未修改 Story 文档。 |

#### 未处理 / Defer 条目

| # | 条目 | 处理结果 |
|---|------|----------|
| R1-#3 | 默认 `npm test` 5s timeout 下慢测治理 | 按 evaluation round 3 结论维持 CR TODO / 非阻塞 defer，本轮 fixer 未处理。 |

#### 修改文件

- `test/update-command.test.ts`

#### 验证结果

- `npx vitest run test/update-command.test.ts --testTimeout=15000`：通过，1 个测试文件 / 5 个测试通过。
- `npx vitest run test/update-planning.test.ts --testTimeout=15000`：通过，1 个测试文件 / 12 个测试通过。
- `npm test`：通过，28 个测试文件 / 180 个测试通过。
- `npm run build`：通过，ESM 与 DTS 构建成功。
- `git diff --check`：通过，无 whitespace error。
