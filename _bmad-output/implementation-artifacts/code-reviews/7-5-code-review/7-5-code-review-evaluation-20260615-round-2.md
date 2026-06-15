---
Story: 7-5
Round: 2
Date: 2026-06-15
Model Used: GPT-5 Codex (codex)
Review Source: 7-5-code-review-summary-20260615-round-2.md
Review Model: GPT-5 Codex (codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 7-5 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。本轮审查结论为通过：Round 1 P1 bundled source root 问题已修复，未发现新的阻塞项；Round 1 P2 absent custom stub 语义仍维持为非阻塞 CR TODO。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：已闭环

经当前代码独立验证，`init` / `list` 已不再使用真实 target cwd 作为 bundled source root。`runInitCommand` 在解析 target 后通过 `PACKAGE_ROOT` 调用 `discoverOfficialModules({ projectRoot: PACKAGE_ROOT })`，见 `src/commands/init.ts:47-65`；`runListCommand` 同样通过命令模块位置解析 `PACKAGE_ROOT`，再调用 `discoverOfficialModules({ projectRoot: PACKAGE_ROOT })`，见 `src/commands/list.ts:30-47`。`discoverOfficialModules` 的默认行为仍会把 `projectRoot` 拼接到 `assets/source/speclite`，见 `src/modules/module-metadata.ts:58-64`，因此当前修复实际把 source discovery 锚定到 package root，而不是调用时的 target cwd。

测试也覆盖了复现条件。`test/init-command.test.ts:11-23` 在临时 target project 内执行 `process.chdir(tempRoot)` 后调用 `runInitCommand` 并解析 `InitCommandResultSchema`；`test/list-command.test.ts:51-64` 在临时 target project 内执行 `process.chdir(tempRoot)` 后调用 `runListCommand` 并解析 `ListCommandResultSchema`。本轮评估重新运行 `npm test -- test/init-command.test.ts test/list-command.test.ts`，结果为 2 个 test files / 7 个 tests passed。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#2 | 明确 absent custom stub 是否允许由 `init --yes` 创建 | CR TODO / 非阻塞 | 同意维持。当前代码确实会创建缺失的 human-owned custom stubs，但 Story AC 明确禁止的是静默覆盖 existing human-owned custom 文件；没有新的 AC 证据要求把 absent stub 首次创建判定为 blocker。 |

---

## 发现 #1 评估

### 审查原文

> **[低] 明确 absent custom stub 是否允许由 `init --yes` 创建**
> - 来源：auditor
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：基本准确**

当前实现仍会为缺失的 human-owned custom stubs 生成 create plan。`createHumanOwnedStubPlans` 对 `_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml` 在不存在时返回 `ownership: "human-owned"`、`action: "create"`、`reason: "create-if-absent-human-owned-stub"`，见 `src/installer/config-initialization.ts:331-341`。`createInitPlan` 会把非 skip 的 human-owned planned write 转为 `action: "create"`，见 `src/commands/init.ts:233-240`；`applyInitPlan` 会执行所有 `create` / `update` action，见 `src/commands/init.ts:295-318`。

但这仍是需求语义澄清项，而不是已证明违反 Story 7-5 AC 的缺陷。Story AC1 要求 `init` 不得静默覆盖 human-owned custom 文件，见 `_bmad-output/implementation-artifacts/stories/7-5-project-config-init-and-listing-commands.md:15-19`；Task 2 要求对 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml` 只读保护、不覆盖、不重排、不格式化，见 `_bmad-output/implementation-artifacts/stories/7-5-project-config-init-and-listing-commands.md:52-57`。这些约束明确覆盖 existing human-owned 文件保护，但没有明确禁止 absent custom stub 的首次创建。

现有测试也把 fresh init 创建 custom stubs 作为当前契约期望：`test/init-command.test.ts:10-43` 期望 changed paths 包含 `_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml`；existing human-owned custom protection 测试确认已有 custom 文件会被 `skip` 且原内容保留，见 `test/init-command.test.ts:103-144`。

**严重性判断：合理**

维持 P2 合理。该问题代表需求措辞存在后续澄清价值，但当前证据不能证明它阻塞 AC1/AC2 交付；已有 human-owned 文件保护路径也有测试覆盖。

**修复建议：可行但非必要**

如果产品/架构后续明确 absent human-owned stubs 不应由 `init --yes` 创建，可调整 `createHumanOwnedStubPlans` / `createInitPlan` / fresh init 测试期望；如果确认允许创建，则应补充 Story 或 contract 文案以避免后续重复审查争议。本轮不需要启动 fixer。

**误报评估：非误报**

非误报。代码确实创建 absent custom stubs，review 对需求语义不清的提醒有效；但它不是 blocker，应作为 suggested CR TODO 保留。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮未确认任何 blocking finding。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 明确 absent custom stub 是否允许由 `init --yes` 创建 | [低] | **P2** | 当前实现保护 existing human-owned 文件；absent stub 首次创建属于需求语义澄清，建议作为 CR TODO 跟踪。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮无 false positive。 |

### 评估决定

- **Round 1 / Finding #1（`init` / `list` 从真实 target cwd 查找 bundled source）**：已闭环。当前实现使用 `PACKAGE_ROOT` 作为 source discovery root，并有真实 target cwd focused tests 覆盖。
- **发现 #1（absent custom stub 是否允许由 `init --yes` 创建）**：确认有效但非阻塞，建议纳入 CR TODO；本轮不要求 fixer 修改。

**Approved**：是。
