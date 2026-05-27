---
Story: 1-3
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 1-3-code-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 1-3 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 3 个发现：1 个 `decision_needed`、2 个 `patch`。经 Story、实现代码与测试核对，3 个发现均有效，均需要 fixer 处理；无误报。本轮评估不通过，不能 Approved。

推荐决策：Story 1-3 AC6 必须落到真实用户可选择入口，而不只是 pure model 层。考虑 Story 已明确 MVP public flag matrix 只有 `--json`、`--yes`，最小实现不应新增 `--modules` 等 public flag；应在 human interactive path 增加受控多选入口，在 module discovery 后、pre-write summary 前允许用户选择一个或多个 official modules。JSON/headless path 继续使用已契约化 defaults 或 pending/no-write 表达，且不得向 public `CommandResult` 新增 `selectedModules` 字段。

---

## 发现 #1 评估

### 审查原文

> **[高] Install 命令没有任何用户模块选择入口，AC6 尚未真正落地**
> - 来源：blind+auditor
> - 分类：decision_needed

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC6 明确要求用户可以在交互模式中选择模块，或在脚本模式中使用后续已契约化的 selection input，并产生 deterministic selected module set（`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md:56-61`）。实现层面，CLI 只声明 `[target-directory]`、`--json`、`--yes`，没有模块选择参数、选项或 prompt 通道（`src/bin/speclite.ts:24-35`）。安装编排固定调用 `createModuleSelection({ modules: modulesResult.modules })`，未传入任何用户选择输入（`src/commands/install.ts:183-196`）。测试也只覆盖 model 层 `userSelectedModuleIds`（`test/source-and-modules.test.ts:172-196`）和 `--yes` 后默认选择（`test/install-module-selection.test.ts:41-87`），没有覆盖 command path 上的用户多选。

**严重性判断：合理**

这是 AC6 的直接缺口，且 `blind+auditor` 双来源命中。虽然当前实现不执行 project writes，但 Story 本轮目标包含 official module selection 和 pre-write summary；用户无法选择 `core` only、无法显式选择 `sdlc`、也无法通过 install command 触发 invalid module id diagnostic，因此阻塞 Story 1-3 交付，评为 P1。

**修复建议：可行**

采纳推荐决策并转化为 fixer 范围：不新增 public selection flag；在 human interactive path 增加最小多选入口，展示 module id、name、version 和 scope，接受一个或多个 module id；将选择结果传入 `createModuleSelection`；invalid id 走 stable diagnostic；`--json`/headless 保持契约化 defaults 或 pending/no-write 语义；新增 install command 集成测试覆盖多选、取消默认项、invalid id。该范围符合 Story Task 5 对 MVP flag matrix 的限制（`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md:115-120`）。

**误报评估：非误报**

`createModuleSelection` 支持用户输入不等于 install command 已暴露用户入口。当前 command orchestration 没有把任何用户选择输入传入 selection model，因此不是误报。

---

## 发现 #2 评估

### 审查原文

> **[中] Selected modules 只存在于 summary 文本，没有进入 internal InstallPlan.selectedModules**
> - 来源：auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`InstallPlanSchema` 已定义 internal `selectedModules` 字段（`src/installer/install-plan-schema.ts:42-52`），owning SPEC 也要求 `InstallPlan` 在任何文件写入前记录 resolved `SourceDescriptor`、selected modules、target adapter plan、planned writes、confirmation state 和 write authorization（`_bmad-output/planning-artifacts/specs/03-install-plan-contract.md:37-54`）。但当前 `runInstallCommand` 只把 `moduleSelection.selectedModuleIds` 用于生成 human-readable summary（`src/commands/install.ts:183-205`、`src/commands/install.ts:347-367`），没有构造或解析 `InstallPlanSchema`。仓库内仅 contract anchor 测试直接 parse 空 `selectedModules`，未见 install path 生成 internal plan 的实现证据。

**严重性判断：偏低**

原始严重性为中，但 Story Task 6 明确要求“在 `src/installer/` 中把 selected modules 写入 internal `InstallPlan.selectedModules`，但不要执行 project writes”（`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md:122-127`）。该缺口不是仅影响后续扩展，而是本 Story 明确任务与 internal planning contract 未落地，评估后提升为 P1 阻塞项。

**修复建议：可行**

fixer 应在 installer 边界构造并校验 internal `InstallPlan`，至少包含 `sourceDescriptor`、`selectedModules: moduleSelection.selectedModuleIds`、`targetAdapters: []`、`externalAccesses: []`、`plannedWrites: []`、`requiresConfirmation` 与 `writeAuthorized`。保持 public `CommandResult<InstallCommandData>` 不新增 `selectedModules` 字段，只测试 internal plan/schema 行为及 summary 投影。

**误报评估：非误报**

summary 文本不能替代 internal executable plan。当前 public JSON 未暴露 selected modules 是正确约束，但 internal `InstallPlan.selectedModules` 缺失仍然有效。

---

## 发现 #3 评估

### 审查原文

> **[中] required_dependencies 指向不存在模块时会被静默忽略**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`readModuleYaml` 读取 `required_dependencies` 并只校验其为 string array（`src/modules/module-metadata.ts:125-139`、`src/modules/module-metadata.ts:233-246`）。metadata discovery 只检查 duplicate module code 和 duplicate skill id（`src/modules/module-metadata.ts:41-43`、`src/modules/module-metadata.ts:187-215`），没有校验 dependency id 是否存在。selection 递归依赖时，如果 dependency id 不存在，会在 `addWithDependencies` 中直接 return（`src/modules/module-selection.ts:51-64`）。现有测试覆盖 duplicate code、duplicate skill id、user invalid ids，但没有 unknown `required_dependencies` fixture（`test/source-and-modules.test.ts:116-196`）。

**严重性判断：偏低**

原始严重性为中，但 AC6 要求如果 `core` 是运行时必需能力，必须通过 metadata/schema 或 installer rule 显式表达 required dependency，不得在 prompt renderer 中隐式硬编码（`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md:56-61`）。当前 live metadata 中 `sdlc` 声明 `required_dependencies: [core]`（`assets/source/speclite/sdlc-skills/module.yaml:5-7`），如果该引用拼错，系统会静默忽略而非给出 deterministic metadata diagnostic，属于 Story 1-3 的 dependency semantics 缺口，评估后提升为 P1 阻塞项。

**修复建议：可行**

fixer 应在 module metadata discovery 阶段验证所有 `required_dependencies` 均指向已发现 module code；未知依赖输出 deterministic issue code，例如 `module-metadata.unknown-required-dependency`，并通过 `discoverModulesForInstall` 映射到 install failure diagnostic。`module-selection` 可以保留 defensive return，但 parser/discovery 阶段必须阻断，并新增 fixture test 覆盖 unknown dependency。

**误报评估：非误报**

当前 bundled metadata 正确不代表 schema 边界正确。Story 要求 dependency semantics 显式且可诊断，缺少 unknown dependency 校验是有效边界问题。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Install 命令没有用户模块选择入口 | [高] | **P1** | AC6 未落到 command path；推荐不新增 public flag，增加 human interactive 多选入口。 |
| 2 | `InstallPlan.selectedModules` 未由 install path 构造 | [中] | **P1** | Story Task 6 与 Install Plan contract 的 internal executable plan 未落地。 |
| 3 | unknown `required_dependencies` 静默忽略 | [中] | **P1** | dependency semantics 缺少 metadata-level deterministic diagnostic。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 3 个发现均为阻塞修复项，不建议延后。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 无误报。 |

### 评估决定

- **发现 #1（Install 命令没有用户模块选择入口）**：确认有效，P1 阻塞。推荐决策为不新增 public selection flag，在 human interactive path 增加最小多选入口，并把选择传入 `createModuleSelection`；JSON/headless path 保持已契约化 defaults 或 pending/no-write 表达。
- **发现 #2（`InstallPlan.selectedModules` 未构造）**：确认有效，P1 阻塞。fixer 需要构造并校验 internal `InstallPlan`，但不得把 selected modules 加入 public `CommandResult`。
- **发现 #3（unknown `required_dependencies` 静默忽略）**：确认有效，P1 阻塞。fixer 需要在 module metadata discovery 阶段校验 dependency existence，新增 deterministic diagnostic 和测试。

### 最终决定

- **Approved / 通过**：否。
- **是否需要 fixer**：是。
- **需要修复项数量**：3。
- **误报数量**：0。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 3

#### 修复摘要

1. **发现 #1：Install 命令没有用户模块选择入口**
   - **状态**：已修复。
   - **修改**：在 human interactive path 增加内部 module selection prompt 回调；CLI prompt 展示 module id、name、version 和 scope，接受逗号或空白分隔的一个或多个 module id；选择结果传入 `createModuleSelection`。
   - **边界**：未新增 public selection flag；`--json`/无 prompt 的 headless path 仍保持默认选择或 pending/no-write 语义；invalid module id 返回 stable diagnostic `module-selection.invalid-module-id`。
   - **测试**：新增 command path 覆盖多选、取消默认项、invalid id，以及 CLI prompt 展示内容。

2. **发现 #2：`InstallPlan.selectedModules` 未由 install path 构造**
   - **状态**：已修复。
   - **修改**：install 成功路径构造并通过 `InstallPlanSchema` 校验 internal `InstallPlan`，包含 `sourceDescriptor`、`selectedModules`、`targetAdapters: []`、`externalAccesses: []`、`plannedWrites: []`、`requiresConfirmation` 和 `writeAuthorized`。
   - **边界**：未向 public `CommandResult<InstallCommandData>` 新增 `selectedModules` 字段；测试断言 public result 中不包含该字段。

3. **发现 #3：unknown `required_dependencies` 静默忽略**
   - **状态**：已修复。
   - **修改**：module metadata discovery 阶段新增 dependency existence 校验，未知依赖抛出 deterministic `ModuleMetadataError`，code 为 `module-metadata.unknown-required-dependency`。
   - **边界**：`module-selection` 的 defensive return 未扩大修改；parser/discovery 阶段会阻断，并通过 install discovery mapping 输出 `source-integrity.unsupported-source`，details.reason 保留 metadata error code。
   - **测试**：新增 unknown dependency fixture test 和 install failure diagnostic mapping test。

#### 验证记录

- `npm test`：通过，7 个 test files，39 个 tests 全部通过。
- `npm run build`：通过，ESM build 和 DTS build 成功。
- 依赖与构建清理：验证后已清理 `node_modules/` 和 `dist/`，未纳入提交范围。

#### 后续建议

- 当前 3 项 findings 均已完成修复，无已知 blocker。
- 需要重新执行 `bmenhance-cr-01-reviewer` 与 `bmenhance-cr-02-evaluator` 进行复审/复评后再进入后续 CR 收尾步骤。
