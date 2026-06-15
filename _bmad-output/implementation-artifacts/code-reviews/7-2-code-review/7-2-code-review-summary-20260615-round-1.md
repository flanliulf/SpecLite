---
Story: 7-2
Round: 1
Date: 2026-06-15
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。`npm run build`、focused tests、`npm test` 和 `git diff --check` 均通过；但发现 1 个阻塞问题：`uninstall` 对 installer-owned directory 生成 `remove` plan 后实际无法删除目录，未满足 AC4 的“installer-owned 文件或目录”移除要求。因此本轮建议不通过，需修复后进入下一轮 CR。

注意：当前环境没有 skill 所述 `Agent` 子代理工具，本轮已按 `bmenhance-cr-01-reviewer` 降级规则执行串行三层审查；未发生审查层内容失败。

## 新发现

### 1. [中] `uninstall` 计划移除 installer-owned directory，但 apply 阶段不会递归删除目录

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - Story AC4 要求 `uninstall` 移除 installer-owned 文件或目录，并保留 human-owned custom / workflow-owned artifacts。
  - `src/commands/uninstall.ts:130-136` 会把 ownership 为 `installer-owned` 的 files-index entry 统一规划为 `action: "remove"`，没有区分 file 与 directory。
  - `src/commands/uninstall.ts:176-182` apply 阶段对每个 `remove` action 调用 `rm(target.absolutePath, { force: true })`；Node 对非空 directory 需要 `recursive: true`，否则会失败并保留目录。
  - 定向复现：构造 files-index entry `path: "_speclite/scripts/tool"`，该路径为 installer-owned directory 且包含 `run.mjs`；运行 `uninstall --json --yes` 后返回 `status: "failure"`、`issueIds: ["file-integrity.uninstall-remove-failed"]`、`pendingSteps: ["remove:_speclite/scripts/tool"]`，且 `dirStillExists: true`。

- **影响**
  - `uninstall` 不能移除合法 installer-owned 目录树，例如 `_speclite/hooks/*` 或 `_speclite/scripts/*` 下被 files index 记录为 directory artifact 的安装结果。
  - 这会让 uninstall 在已授权、路径归属正确的情况下失败，违反 AC4；同时会留下 installer-owned state，影响后续 reinstall / sync / validation。

- **建议**
  - 对 `remove` action 在 apply 前识别 path 类型；对 installer-owned directory 使用安全的 project-relative containment 校验后执行 recursive removal。
  - 补充 focused test：files-index entry 指向 installer-owned directory，目录内含文件，`uninstall --json --yes` 应成功删除整棵 directory，并继续保留 human-owned / workflow-owned paths。

### 2. [低] `sync` / `uninstall` human output 未展示失败 step state

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - AC5 要求写入失败时输出 `completed steps`、`failed step`、`pending steps` 和 `manual action`。
  - `src/diagnostics/output.ts:339-350` 的 update renderer 已在存在 lifecycle fields 时输出 `Step State`。
  - `src/diagnostics/output.ts:405-449` 的 sync renderer 和 `src/diagnostics/output.ts:452-491` 的 uninstall renderer 只输出 plan、authorization、paths、issues、next actions，没有等价的 `Step State` block。
  - `src/diagnostics/output.ts:749-755` 的 issue details renderer 会过滤 array 值，因此 issue details 中的 `completedSteps` / `pendingSteps` 不会在 human output 中补偿显示。

- **影响**
  - `--json` 消费者仍可从 `CommandResult.data` 读取 lifecycle fields；但非 JSON 用户在失败时看不到完整 step state，诊断体验与 AC5 文字要求不一致。

- **建议**
  - 为 `renderSyncHumanOutput` 和 `renderUninstallHumanOutput` 增加与 update renderer 相同的 `Step State` 输出逻辑。
  - 补充 human output focused tests，覆盖 safe-write failure / uninstall remove failure 时的 `Completed steps`、`Failed step`、`Pending steps` 和 manual action 文案。

## 验证摘要

- ✅ `npm run build` 通过。
- ✅ `npx vitest run test/contract-anchors.test.ts test/doctor-command.test.ts test/sync-command.test.ts test/uninstall-command.test.ts` 通过（4 files / 12 tests）。
- ✅ `npm test` 通过（43 files / 316 tests）。
- ✅ `git diff --check` 通过（无输出）。
- ❌ 定向复现：installer-owned directory uninstall 失败；输出 `status: "failure"`，目录仍存在。

## 通过项

- `doctor` 复用 `validateProject`、`ValidationIssue` category / severity / issue id 语义，并通过 `DoctorCommandData.externalAccesses` 复用 `ExternalAccess` shape。
- `doctor --revalidate-source` 在未授权时只输出 pending external access intent 和 blocking `source-integrity` issue，未改变 `validate` local-only contract。
- `sync` 复用 `planUpdate`、files index、ownership/hash、conflict semantics、operation lock 和 safe-write 路径；focused test 覆盖 hook/control artifacts、protected paths 与 safe-write failure JSON lifecycle。
- `uninstall` 的 plan 阶段复用 files index、manifest artifact root、ownership classification 和 current hash；对 human-owned custom / workflow-owned artifacts 会规划 `preserve` / `manual-action`，不会删除 protected paths。
- `CommandResult` schema 已扩展 `doctor`、`sync`、`uninstall` command id 与 command-specific data payload，focused contract tests 通过。
