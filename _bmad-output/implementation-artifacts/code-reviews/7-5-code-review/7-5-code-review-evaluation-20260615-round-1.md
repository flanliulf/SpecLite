---
Story: 7-5
Round: 1
Date: 2026-06-15
Model Used: GPT-5 Codex (codex)
Review Source: 7-5-code-review-summary-20260615-round-1.md
Review Model: GPT-5 Codex (codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 7-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 1 个阻塞发现和 1 个非阻塞 TODO：`init` / `list` 在真实 target cwd 下从 `process.cwd()` 查找 bundled source metadata，以及 absent human-owned custom stubs 是否允许由 `init --yes` 创建。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[高] `init` / `list` 从 `process.cwd()` 查找 bundled source，非仓库 cwd 下命令不可用**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码验证确认该发现成立。`runInitCommand` 先计算 `runtime.cwd` / target directory，但随后直接调用 `discoverOfficialModules({ projectRoot: process.cwd() })`，见 `src/commands/init.ts:52-63`。`runListCommand` 也同样先使用 `runtime.cwd` 解析 target，再用 `process.cwd()` 作为 official modules 的 `projectRoot`，见 `src/commands/list.ts:35-45`。`discoverOfficialModules` 在没有显式 `sourceRoot` 时会把 `projectRoot` 拼接为 `<projectRoot>/assets/source/speclite`，并立即 `readdir`，见 `src/modules/module-metadata.ts:58-64` 和 `src/modules/module-metadata.ts:77-79`。

独立复现也确认问题存在：在临时 target project 目录执行 `process.chdir(tempTarget)` 后调用 `runListCommand({ runtime: { cwd: tempTarget } })`，实际抛出 `ENOENT: no such file or directory, scandir '<tempTarget>/assets/source/speclite'`；`runInitCommand({ options: { yes: true, json: true }, runtime: { cwd: tempTarget } })` 在相同 cwd 条件下抛出同类 `ENOENT`。因此这不是测试或审查误读，而是真实 CLI cwd 与 bundled source root 混用导致的功能缺陷。

现有 focused tests 未覆盖该真实运行条件。`test/list-command.test.ts:56-61` 和 `test/init-command.test.ts:14-20` 只传入 `runtime.cwd`，但测试进程的 `process.cwd()` 仍保持在 SpecLite repo，因此无法暴露 bundled source root 查找错误。

**严重性判断：合理**

原始严重性 `[高]` 合理。Story AC2 要求 `init` 在写入计划前读取现有安装状态并展示影响范围，AC3 要求 `list` 从 canonical identity sources 读取可列信息，AC4 要求 `list --json` 输出 CommandResult-compatible 结果，见 `_bmad-output/implementation-artifacts/stories/7-5-project-config-init-and-listing-commands.md:21-37`。当前实现会在真实 target cwd 下直接抛异常，无法返回 schema-valid `CommandResult`，阻塞交付。

**修复建议：可行**

审查建议可行。修复应避免把 target project cwd 当作 bundled source root，可从 package / executable location、已解析 install source root，或显式 runtime/sourceRoot 注入 canonical source root；同时需要补充 `process.chdir(tempTarget)` 后调用 `init` / `list` 的 focused tests，确保真实 CLI cwd 下仍能读取 canonical metadata 并返回 `CommandResult`。

**误报评估：非误报**

非误报。静态代码路径和临时目录复现均支持该发现；且发现由 blind+edge+auditor 三层同时命中，可信度高。

---

## 发现 #2 评估

### 审查原文

> **[低] 明确 absent custom stub 是否允许由 `init --yes` 创建**
> - 来源：auditor
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：基本准确**

代码验证确认当前实现会创建缺失的 human-owned custom stubs。`createHumanOwnedStubPlans` 对 `_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml` 在不存在时生成 `ownership: "human-owned"`、`action: "create"`、`reason: "create-if-absent-human-owned-stub"`，见 `src/installer/config-initialization.ts:331-341`。`buildInitPlanActions` 会把非 skip 的 human-owned planned write 转为 `action: "create"`，见 `src/commands/init.ts:231-240`；`applyInitPlan` 对所有 `create` / `update` action 执行写入，不按 ownership 跳过，见 `src/commands/init.ts:293-316`。

但审查将其列为非阻塞 TODO 是合适的。Story AC1 明确禁止的是“不得静默覆盖 human-owned custom 文件”，见 `_bmad-output/implementation-artifacts/stories/7-5-project-config-init-and-listing-commands.md:15-19`；Task 2 进一步要求对 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml` 只读保护，不覆盖、不重排、不格式化，见 `_bmad-output/implementation-artifacts/stories/7-5-project-config-init-and-listing-commands.md:52-57`。这些文字明确覆盖 existing human-owned 文件保护，但没有清楚说明 absent stub 的首次创建是否被禁止。

当前 focused test 还显式把 fresh init 创建两个 custom stub 作为期望，见 `test/init-command.test.ts:23-41`；existing human-owned custom 文件保护测试也确认已有文件会被 `skip` 且内容保持不变，见 `test/init-command.test.ts:100-141`。因此这不是当前 Story 的明确失败项，而是需求语义需要后续确认。

**严重性判断：偏高**

作为 `[低]` 非阻塞发现可以接受，但不应阻塞 Story 7-5 交付。当前证据表明实现满足“不覆盖 existing human-owned custom 文件”的核心安全要求；争议点只是 absent stub 是否应由 installer 初始化。

**修复建议：可行但非必要**

建议先作为 CR TODO 由产品/架构确认。如果确认 absent human-owned stubs 不允许由 `init --yes` 创建，再调整 `createInitPlan` / `applyInitPlan` 和 fresh init focused test；如果确认允许，则只需把 Story 或 contract wording 写清楚，避免后续 review 重复产生歧义。

**误报评估：非误报**

非误报。代码确实创建 absent custom stubs，且 Story 文案存在可解释空间；但它不是已证明违反 AC 的缺陷，因此应作为 P2 CR TODO，而不是 blocking fix。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `init` / `list` 从 `process.cwd()` 查找 bundled source，真实 target cwd 下抛 `ENOENT` | [高] | **P1** | 真实 CLI cwd 下无法读取 canonical metadata，阻塞 AC2/AC3/AC4。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 2 | 明确 absent custom stub 是否允许由 `init --yes` 创建 | [低] | **P2** | 当前实现保护 existing human-owned 文件；absent stub 首次创建属于需求语义澄清。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|

### 评估决定

- **发现 #1（`init` / `list` 从 `process.cwd()` 查找 bundled source）**：确认有效，需启动 fixer；修复范围应限定为 bundled source root 解析 / 注入逻辑及 `init`、`list` 的真实 target cwd focused tests。
- **发现 #2（absent custom stub 是否允许由 `init --yes` 创建）**：确认有效但非阻塞，建议纳入 CR TODO；除非产品/架构明确禁止 absent stub 首次创建，否则本轮不要求 fixer 修改该行为。

**Approved**：否。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-15
- **Model Used**: GPT-5 Codex (codex)
- **Fix Items**: 1

#### 修复项 #1：`init` / `list` 从真实 target cwd 查找 bundled source

- **对应 finding**: 发现 #1，`init` / `list` 从 `process.cwd()` 查找 bundled source，真实 target cwd 下抛 `ENOENT`。
- **修改文件**:
  - `src/commands/init.ts`
  - `src/commands/list.ts`
  - `test/init-command.test.ts`
  - `test/list-command.test.ts`
- **修复内容**:
  - `runInitCommand` / `runListCommand` 改为基于命令模块所在 package root 解析 bundled canonical source，而不是使用调用时的 `process.cwd()`。
  - `init` focused test 在 temp target project 内执行 `process.chdir(tempRoot)` 后调用 `runInitCommand`，覆盖真实 CLI target cwd 场景。
  - `list` focused test 在 temp target project 内执行 `process.chdir(tempRoot)` 后调用 `runListCommand`，覆盖真实 CLI target cwd 场景。
- **范围控制**:
  - 未修改 `install` / `status` / `validate` / `update` 行为。
  - 未处理 P2：absent custom stub 是否允许由 `init --yes` 创建。
  - 未进行全局 CLI 重构。
- **验证结果**:
  - `npm test -- test/init-command.test.ts test/list-command.test.ts`：通过，2 个 test files / 7 个 tests passed。
  - `npm run build`：通过，ESM build 与 DTS build 均成功。
