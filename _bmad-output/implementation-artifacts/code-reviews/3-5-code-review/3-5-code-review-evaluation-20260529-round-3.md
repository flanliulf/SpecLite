---
Story: 3-5
Round: 3
Date: 2026-05-29
Model Used: GPT-5 Codex (codex)
Review Source: 3-5-code-review-summary-20260529-round-3.md
Review Model: GPT-5 Codex (codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-5 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。审查报告确认 Round 1 / Round 2 两个 P1 已修复，但提出 1 个新阻塞发现：`install` command 未按 AC6 使用 `_speclite/config.toml` 中 trim 后非空的 `core.project_name` 作为 `CommandResult.targetProject`，仍输出 target directory basename。经独立代码核对与临时目录复现，该发现有效，严重性为 P1，需要进入 fixer 做最小修复。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 修复项：已修复

Round 1 的阻塞问题是无 `details` 的合法 `ValidationIssue` 会被 redaction guard 判为 unsafe。当前 `findUnsafeIssueValue` 已在 root 入口允许 `undefined` 缺省：`src/validation/issue-model.ts:55-58`；focused test 也覆盖无 `details` 的合法 issue 应通过：`test/contract-anchors.test.ts:135-144`。因此 Round 1 原始问题已修复。

### Round 2 修复项：已修复

Round 2 的阻塞问题是 `details` 内部 nested `undefined` 被 schema 接受。当前递归检查函数 `findUnsafeIssueValueAt` 不再把 `undefined` 作为安全原子值处理，未命中 string/null/number/boolean/array/object 分支时会返回 unsafe path：`src/validation/issue-model.ts:60-90`；focused tests 覆盖 object nested `undefined` 和 array `undefined` 均应失败：`test/contract-anchors.test.ts:158-181`。因此 Round 2 原始问题已修复。

### 历史 CR TODO（非阻塞）

无。

---

## 发现 #1 评估

### 审查原文

> **[高][新] `install` command 的 `targetProject` 未读取 project config name，违反 AC6**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 3.5 AC6 明确要求 public `CommandResult.targetProject` 必须优先使用 trim 后非空的 project config name，缺失时才 fallback 到 target project directory basename，并且不得改写为 checkout-root-dependent path：`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:52-58`。Task 5 也要求建立 shared target project display identifier helper：`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:110-113`。

共享 helper 已实现该优先级：`resolveTargetProjectDisplayName` 会先读取 `targetRoot/_speclite/config.toml`，对 `parsed.core?.project_name` 执行 `trim()`，非空则返回；否则才使用 explicit name 或 target root basename：`src/diagnostics/command-result.ts:262-273`、`src/diagnostics/command-result.ts:387-394`。

当前 `status`、`validate`、`update` 已使用该 helper：`src/commands/status.ts:34-37`、`src/commands/validate.ts:37-40`、`src/commands/update.ts:43-46`。`update` 还已有 focused test 覆盖非 ASCII config name 不被 slugify：`test/update-command.test.ts:91-100`。

但 `install` 没有调用该 helper。runtime guard 失败路径直接使用 `input.runtime?.targetProject ?? basename(cwd)`：`src/commands/install.ts:99-107`；主路径创建 install context 时也传入 `input.runtime?.targetProject ?? normalizedTarget.targetProject`：`src/commands/install.ts:117-130`。而 `normalizedTarget.targetProject` 本身来自 target root basename：`src/fs/path-normalizer.ts:30-34`。

我使用临时目录独立复现，目录内写入：

```toml
[core]
project_name = " 项目 Install "
```

在同一 `cwd` 下调用四个 command 后得到：

```json
{
  "install": "tmp.7yOczJ2f7f",
  "status": "项目 Install",
  "validate": "项目 Install",
  "update": "项目 Install"
}
```

这说明 `install` 与其他 covered commands 的 `targetProject` 行为确实不一致，且 `install` 输出的是 target directory basename，不是 trim 后 config project name。

**严重性判断：合理**

原始严重性 `[高]` 合理，评估后映射为 **P1**。原因是 `speclite install --json` 属于 Story 3.5 AC1 覆盖的 public JSON command，`targetProject` 又是 AC6 明确约束的 stable display identifier。当前行为会在已有 `_speclite/config.toml` 的项目中输出 checkout-root-dependent basename，破坏 install/status/validate/update 的一致 public contract，阻塞交付。

该问题不属于 P0，因为没有安全漏洞或数据破坏证据；也不应降级为 CR TODO，因为它直接违反 AC6 且影响 covered command JSON envelope。

**修复建议：可行**

Reviewer 的修复建议可行，且应保持最小边界：

- 在 `runInstallCommand` normalized target directory 确定后复用 `resolveTargetProjectDisplayName({ targetRoot: normalizedTarget.targetRoot, explicitName: input.runtime?.targetProject })` 生成 `targetProject`。
- runtime guard 失败路径也应避免只用 `basename(cwd)`；若 guard 在 normalized target 之后执行，可复用同一 `targetProject`；若保留早返回，也应按 target root/config name helper 推导。
- 补充 focused test：存在 `_speclite/config.toml` 且 `project_name = " 项目 Install "` 时，`runInstallCommand` 的 JSON `targetProject` 应为 `项目 Install`，并继续覆盖缺失/空白 config name fallback 到 target directory basename。
- 修复边界只限 `install` targetProject display id，不扩大到 Epic 4 update/repair 写入、真实 conflict detection、operation lock 或 repair apply。

**误报评估：非误报**

Story AC6、shared helper、其他 command 调用路径、`install` 当前实现和临时目录复现结果一致。该发现不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `install` command 未使用 project config name 作为 `targetProject` | [高] | **P1** | 直接违反 AC6，导致 `install --json` 与 status/validate/update 的 stable display identifier contract 不一致。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`install` command 的 `targetProject` 未读取 project config name）**：确认有效，阻塞交付，需要 fixer 执行最小修复与 focused test 补充。
- **本轮评估结论**：不通过。
- **是否要求 fixer**：是。
- **修复边界建议**：只修复 `install` 的 targetProject display id 来源，并补充 config-name / fallback focused tests；不要修改 Story 文档或 owning SPEC，不要扩大到 Epic 4 update/repair 写入行为。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-29
- **Model Used**: GPT-5 Codex (codex)
- **Fix Items**: 1

#### 修复项 1：`install` command targetProject 未读取 project config name

- **状态**: 已修复
- **修改文件**:
  - `src/commands/install.ts`
  - `test/config-initialization.test.ts`
- **关键修改**:
  - `runInstallCommand` 在 target directory 归一化后统一调用 `resolveTargetProjectDisplayName` 生成 `targetProject`。
  - runtime guard 失败路径与主 install context 复用同一个 `targetProject`，确保 `_speclite/config.toml` 中 trim 后非空的 `core.project_name` 优先于显式 runtime 名称和目录 basename。
  - focused tests 覆盖 install 对 trim 后 config project name 的优先使用，以及缺失、空字符串、纯空白 config name 时 fallback 到 target directory basename。
- **边界确认**:
  - 未修改 Story 状态。
  - 未修改 owning SPEC。
  - 未扩大到 Epic 4 `update` / `repair` 写入行为。
  - 未执行 reviewer、evaluator、finalizer、commit 或 push。
