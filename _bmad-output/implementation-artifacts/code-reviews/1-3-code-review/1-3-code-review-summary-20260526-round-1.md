---
Story: 1-3
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具在当前执行环境不可用，已按 skill 降级为当前上下文串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均已覆盖，但不具备独立 sub-agent 上下文隔离。`npm run build` 与 `npm test` 已执行但因本地缺少 `node_modules` 中的 `tsup` / `vitest` 失败；`npm run lint` 因未定义脚本失败。发现 3 个需要处理的问题，其中 1 个需要产品/契约裁决，2 个可直接修补；建议不通过本轮 CR，进入 evaluator 后再决定 fixer 范围。

## 新发现

### 1. [高] Install 命令没有任何用户模块选择入口，AC6 尚未真正落地

- **来源**：blind+auditor
- **分类**：decision_needed

- **证据**
  - `src/bin/speclite.ts:24-30` 只暴露 `[target-directory]`、`--json` 和 `--yes`，没有 module selection argument、option 或 interactive prompt channel。
  - `src/commands/install.ts:183` 调用 `createModuleSelection({ modules: modulesResult.modules })`，没有传入 `userSelectedModuleIds`，因此 install orchestration 永远只能使用 required/default selection。
  - `test/source-and-modules.test.ts:173-196` 只覆盖 pure model 层的 `userSelectedModuleIds`；`test/install-module-selection.test.ts:41-87` 只覆盖 `--yes` 后默认选择，不证明用户可在 install 流程选择一个或多个官方模块。

- **影响**
  - Story AC6 要求用户可以选择一个或多个 official modules；当前 CLI 用户无法选择 `core` only、无法显式选择/取消 `sdlc`，也无法通过 command path 触发 invalid module id diagnostic。
  - 因 Story 明确限制 MVP public flag matrix 只有 `--json`、`--yes`，修复方式需要先裁决：引入 interactive prompt、契约化现有默认选择语义，还是先更新 owning SPEC 后增加 selection input。

- **建议**
  - 先由 evaluator/产品契约裁决 Story 1.3 是否必须实现交互选择入口。
  - 若必须实现，优先补 interactive prompt 或受控 selection input，并为 install command 增加多选、取消默认项、invalid id 的集成测试。
  - 若决定 MVP 只支持默认选择，应回写 Story/owning SPEC，明确 AC6 在本轮仅落到 internal selection model，避免把未实现的用户能力标为完成。

### 2. [中] Selected modules 只存在于 summary 文本，没有进入 internal InstallPlan.selectedModules

- **来源**：auditor
- **分类**：patch

- **证据**
  - `src/installer/install-plan-schema.ts:42-52` 已定义 `InstallPlanSchema.selectedModules`，这是 pre-write planning 的 executable anchor。
  - `src/commands/install.ts:183-205` 计算 `moduleSelection` 后只把 selected modules 投影到 human-readable `summary`，public JSON 只保留 `sourceDescriptor` / `installedModules` / paths / lifecycle steps，没有构造或校验 internal `InstallPlan`。
  - Story 文件 `1-3-official-module-selection-and-install-summary.md:122-127` 要求在 `src/installer/` 中把 selected modules 写入 internal `InstallPlan.selectedModules`，但不得新增 public JSON fields。

- **影响**
  - 当前实现满足“不把 selectedModules 塞进 public CommandResult”的约束，但没有留下结构化 internal plan，后续 Story 1.4+ 很难可靠消费本次选择结果，只能解析 summary prose 或重新选择。
  - 这削弱 pre-write JSON/plan contract 边界：用户看到 summary，但代码没有用 schema 保护 selected modules、source descriptor、write authorization 和 planned writes 的一致性。

- **建议**
  - 在 installer 层构造并校验 internal `InstallPlan`，至少包含 `sourceDescriptor`、`selectedModules: moduleSelection.selectedModuleIds`、空 `targetAdapters` / `externalAccesses` / `plannedWrites`、`requiresConfirmation` 和 `writeAuthorized`。
  - 保持 `selectedModules` 不进入 `CommandResult<InstallCommandData>` public JSON，测试只断言 internal plan/schema 行为和 summary 投影。

### 3. [中] required_dependencies 指向不存在模块时会被静默忽略

- **来源**：edge
- **分类**：patch

- **证据**
  - `src/modules/module-metadata.ts:187-215` 只校验 duplicate module code 和 duplicate skill id，没有校验每个 `required_dependencies` 是否指向已发现的 module code。
  - `src/modules/module-selection.ts:56-58` 在 dependency id 不存在时直接 `return`，不会产生 invalid metadata diagnostic，也不会阻断 selection。
  - `test/source-and-modules.test.ts:116-169` 覆盖 duplicate code / duplicate skill id，但没有覆盖 unknown required dependency。

- **影响**
  - 如果 bundled metadata 中 `sdlc.required_dependencies` 拼错或 `core` module 缺失，系统仍可能把 `sdlc` 作为 selected/default module 返回，违反 Story AC6 对 required dependency 的显式语义要求。
  - 这种错误会推迟到后续 install/mirror/ReadyCheck 阶段才暴露，破坏 Story 1.3 的 module metadata/schema 诊断边界。

- **建议**
  - 在 module metadata discovery 阶段新增 dependency existence validation，未知 dependency 输出 deterministic `module-metadata.unknown-required-dependency` 或等价 issue code。
  - 在 `module-selection` 中避免静默忽略缺失 dependency；若保留 defensive return，也应保证 parser 阶段已阻断并补测试。

## 验证摘要

- ❌ `npm test` 失败：`vitest: command not found`，本地 `node_modules` 缺失。
- ❌ `npm run build` 失败：`tsup: command not found`，本地 `node_modules` 缺失。
- ❌ `npm run lint` 失败：`package.json` 未定义 `lint` script。
- 定向复现：未执行代码级复现；本轮基于 Story File List 的 full-file 审查、Story AC 对照、owning SPEC 片段和测试内容完成。

## 通过项

- Story 状态为 `review`，File List 已列出本轮实现与测试对象。
- Bundled source descriptor 使用 `sourceType: "bundled"` 与 display-safe `resolvedRoot: "assets/source/speclite"`，没有泄露本机绝对路径。
- 缺少 packaging evidence 时会生成 `source-integrity.missing-evidence` 并阻断后续 module selection。
- Module parser 从 `assets/source/speclite/*/module.yaml` 发现 `core` / `sdlc`，并递归识别 nested `SKILL.md` package roots。
- Public `CommandResult<InstallCommandData>` 未新增 `selectedModules`、`pendingModuleSelection`、`installSummary` 或 `readySummary` 字段，pre-write fresh install 的 `installedModules` 保持为空。
- 当前实现未发现提前创建 `_speclite`、`_speclite-output`、`.claude/skills`、`.agents/skills`、config、manifest/index 或 ready summary 的代码路径。
