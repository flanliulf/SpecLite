---
Story: 4-2
Round: 1
Date: 2026-05-31
Model Used: GPT-5.5
Review Source: 4-2-code-review-summary-20260531-round-1.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 4-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮 review 仅提出 1 个阻塞 `patch`：`speclite update` / `speclite update --repair` 的 `targetProject` 显示名绕过四层 config resolver。经独立代码核验，该发现成立，属于 Story 4-2 AC1 覆盖范围内的行为缺口。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] update 结果显示名绕过四层 config resolver**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 4-2 AC1 明确要求 `speclite update` 与 `speclite update --repair` 解析 config 时必须按 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 顺序合并，并复用 `src/config/` 统一 resolver，不得在 `src/update/`、`src/commands/update.ts` 或 planner 中实现第二套私有 merge logic（`_bmad-output/implementation-artifacts/stories/4-2-config-and-customization-merge-order-for-updates.md:15-20`）。

当前 `runUpdateCommand` 在调用 `planRepair` / `planUpdate` 前先计算 `targetProject`（`src/commands/update.ts:40-43`），随后把该值写入 repair/update command result（`src/commands/update.ts:51-59`、`src/commands/update.ts:63-70`）。该显示名来自 `resolveTargetProjectDisplayName`，而 `resolveTargetProjectDisplayName` 优先调用 `readConfigProjectName`（`src/diagnostics/command-result.ts:266-276`）。`readConfigProjectName` 只读取 `_speclite/config.toml` 并解析 `core.project_name`（`src/diagnostics/command-result.ts:380-384`），不会调用 `resolveProjectConfig`，也不会读取 installer user 或 human custom 覆盖层。

同时，`readPlanningContext` 内部确实调用了 shared config resolver（`src/update/update-plan.ts:169-170`），但该函数只把 resolver issues 用于 blocking/warning 与 planning context，并未把 merged `core.project_name` 回传给 command result 显示名（`src/update/update-plan.ts:210-216`）。因此 reviewer 关于“planning context 使用 resolver 不等于外层 `targetProject` 使用 merged config”的判断成立。

测试覆盖也支持该缺口判断：`test/update-command.test.ts:114-123` 只断言 base `_speclite/config.toml` 中的非 ASCII project name 会被 trim 后作为 `targetProject`，没有覆盖 `_speclite/config.user.toml` 或 custom 层覆盖；`test/update-planning.test.ts:52-80` 构造了 `config.user.toml` 与 malformed custom config 的 warning 场景，但通过 runtime explicit targetProject 避开了 display-name merge 断言。

**严重性判断：合理**

原始严重性为 `[中]`，但作为 CR workflow 的交付门禁，应按 P1 阻塞处理。原因是 Story AC1 覆盖的是 update/repair 对项目配置的规范 resolver 顺序；`targetProject` 是 JSON/human command result 的公共输出字段，若后层配置覆盖 `core.project_name`，当前输出仍会展示 base 值，导致用户可见结果与 canonical resolver 语义不一致。

**修复建议：可行**

reviewer 建议让 update/repair 的 `targetProject` 使用 `resolveProjectConfig({ projectRoot, keys: ["core.project_name"] })` 的 merged result，或让 `planUpdate` / `planRepair` 的 planning context 显式返回 resolved config display value。两种方向都可行；更保守的实现应避免新增第二套 merge logic，并复用 `src/config/config-reader.ts` 的 shared resolver。建议同时补充 focused tests，覆盖 `update --json` 与 `update --repair --json` 在后层 config 覆盖 `core.project_name` 时均输出 merged `targetProject`。

**误报评估：非误报**

这不是误报。代码中存在一条独立于 shared resolver 的 base-config 读取路径，且该路径直接影响 update/repair 的公共结果字段。虽然 planning 阶段已有 resolver 调用，但其 merged config value 未参与 `targetProject` 计算，无法消除该问题。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | update 结果显示名绕过四层 config resolver | [中] | **P1** | 违反 Story 4-2 AC1 的 shared config resolver order 要求，影响 update/repair 公共输出的 `targetProject`。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮无需要延迟跟踪的非阻塞项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮无误报。 |

### 评估决定

- **发现 #1（update 结果显示名绕过四层 config resolver）**：确认有效，必须修复后复审；本轮评估决定不通过。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-31
- **Model Used**: GPT-5.5
- **Fix Items**: 1

#### 修复条目

| # | Evaluation 条目 | 修复状态 | 修复说明 |
|---|-----------------|----------|----------|
| 1 | update 结果显示名绕过四层 config resolver | 已修复 | `speclite update` 与 `speclite update --repair` 的 `targetProject` 改为优先通过 `resolveProjectConfig({ keys: ["core.project_name"] })` 读取四层 merged config value，trim 后非空即使用；缺失或不可用时再沿用既有 fallback。 |

#### 修改文件

- `src/commands/update.ts`
  - 新增 update 专用 display name resolver，复用 `src/config/config-reader.ts` 的 shared config resolver。
  - 保留既有 explicit/runtime name 与 basename fallback 作为 merged config 不可用时的兜底。
- `test/update-command.test.ts`
  - 补充 `update --json` 四层 config 覆盖下的 `targetProject` 断言。
  - 补充 `update --repair --json` 四层 config 覆盖下的 `targetProject` 断言。

#### 验证结果

- `npm test -- test/update-command.test.ts`：通过，1 个 test file / 4 个 tests passed。
- `npm run build`：通过，ESM 与 DTS build 均成功。
- `git diff --check`：通过，无 whitespace error。
