---
Story: 7-5
Round: 1
Date: 2026-06-15
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

首轮审查。由于当前环境没有 `Agent` 子代理工具，已按 `bmenhance-cr-01-reviewer` fallback 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；`review-acceptance-auditor` 本地技能不可用，AC 审计由当前上下文手工完成。本轮 `npm run build`、focused tests、全量 `npm test` 和 `git diff --check` 通过，`npm run lint` 因项目没有 `lint` script 无法运行。

结论：不通过。存在 1 个 blocking finding：`init` / `list` 在真实 CLI cwd 为 target project 时从 target project 查找 bundled source metadata，导致命令无法读取 canonical source，直接影响 AC2/AC3/AC4。

## New Findings（新发现）

### 1. [高] `init` / `list` 从 `process.cwd()` 查找 bundled source，非仓库 cwd 下命令不可用

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/commands/init.ts:62` 和 `src/commands/list.ts:44` 都调用 `discoverOfficialModules({ projectRoot: process.cwd() })`。
  - `src/modules/module-metadata.ts:62-64` 会把 `projectRoot` 拼成 `<projectRoot>/assets/source/speclite`。
  - 定向复现：在临时 target project 目录作为 `process.cwd()` 后调用 `runListCommand({ runtime: { cwd: target } })`，结果抛出 `ENOENT: no such file or directory, scandir '<target>/assets/source/speclite'`，没有返回 `CommandResult`。

- **影响**
  - `speclite list` 在用户从 target project 目录运行时无法列出 canonical modules / skills / IDE targets / versions，违反 AC3。
  - `speclite list --json` 在同一场景不会输出 `CommandResult` envelope，影响 AC4。
  - `speclite init` 在读取 installed state 并规划写入前也会先尝试发现 modules；非仓库 cwd 下同样可能失败，影响 AC2 的实际可达性。
  - 现有 tests 通过是因为测试进程 `process.cwd()` 仍是 SpecLite repo，未覆盖真实 CLI cwd。

- **建议**
  - 不要用 target process cwd 作为 bundled source root。应从 package / executable location、已解析 install source root，或显式 runtime/sourceRoot 注入 canonical source root。
  - 给 `init` 和 `list` 增加非 repo cwd 测试：在 `process.chdir(tempTarget)` 后调用命令，断言仍能返回 schema-valid `CommandResult`，且 `modules`、`skills`、`ideTargets` 来源仍为 canonical metadata / adapter registry。

## Non-Blocking Findings / TODO（非阻塞发现 / 待办）

### 1. [低] 明确 absent custom stub 是否允许由 `init --yes` 创建

- **来源**：auditor
- **分类**：defer

- **证据**
  - `src/installer/config-initialization.ts:331-341` 对不存在的 `_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml` 生成 `ownership: "human-owned"`、`action: "create"`。
  - `src/commands/init.ts:231-240` 将这些 human-owned create 计划转换为 `InitPlanAction.action = "create"`。
  - `src/commands/init.ts:293-316` apply 阶段会执行所有 `create` / `update` action，不再按 ownership 跳过。
  - 定向复现：fresh target project 运行 authorized init 后，`changedPaths` 包含 `_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml`，两个文件均存在。

- **影响**
  - 当前实现已通过 existing custom 文件保护测试，未发现静默覆盖 existing human-owned custom 的路径。
  - 但 Story Task 2 写明 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml` 只读保护；如果该约束也适用于 absent stubs，则当前实现和 focused test 期望需要调整。

- **建议**
  - 由产品/架构确认 `init --yes` 是否仍允许创建 absent human-owned custom stubs。
  - 若不允许，`createInitPlan` / `applyInitPlan` 应跳过 human-owned actions，并更新 fresh init focused test。

## Verification Summary（验证摘要）

- `npm run build`：通过；`tsup` ESM build 和 DTS build 成功。
- `npm test -- test/init-command.test.ts test/list-command.test.ts`：通过；2 个 test files、7 个 tests。
- `npm test`：通过；47 个 test files、331 个 tests。
- `npm run lint`：未运行成功；项目 `package.json` 没有 `lint` script，npm 返回 `Missing script: "lint"`。
- `git diff --check`：通过；无 whitespace/error 输出。
- 定向复现 1：fresh target project 调用 `runInitCommand({ options: { yes: true, json: true } })` 返回 `success`，`changedPaths` 包含两个 `_speclite/custom` 文件，且文件实际存在。
- 定向复现 2：`process.chdir(tempTarget)` 后调用 `runListCommand`，失败并抛出 `ENOENT`，路径为 `<target>/assets/source/speclite`。

## Passed Items（通过项）

- `init` 已注册 CLI command，输出复用 `CommandResult` envelope 和 `InitCommandData` schema。
- `init` 在写入前读取 manifest、files index 和 config layers，并在未授权时返回 plan。
- `init` 对 existing `_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml` 的 focused test 覆盖保留原内容，不重排、不格式化。
- `list` data payload 已通过 `ListCommandDataSchema` 契约化，`list --json` 在 repo cwd 场景返回 schema-valid `CommandResult`。
- `list` 的 IDE target 顺序来自 `adapter-registry`，skill identity 使用 `canonicalSkillId`。

## Final Decision（结论）

- **结论：不通过**
- **阻塞项**：1
- **非阻塞 findings / TODO**：1
- **fallback 串行审查**：是，`Agent` 子代理工具不可用。
