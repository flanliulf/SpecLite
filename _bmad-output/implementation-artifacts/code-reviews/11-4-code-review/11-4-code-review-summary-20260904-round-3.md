---
Story: 11-4
Round: 3
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Round 2 Owner A+B 已由 Fresh Fixer Recovery 接管，`resolve config` raw 语义、独立 `resolve artifact-roots` surface、Analysis producer activation guidance、Product Brief / PRFAQ legacy-compatible route selection 均有聚焦测试支撑；但 Reviewer Round 3 发现 2 个仍需 Evaluator 裁决的 `patch` 桶问题。本轮不通过，进入 fresh Evaluator Round 3。

审查层状态：Blind Hunter 与 Edge Case Hunter 两个 fresh GPT-5.5 只读层完成；Acceptance Auditor 因请求非 sandbox 执行并停在 `waitingOnApproval`，外层明确不批准扩权，本轮按 2/3 层结果聚合，标记该层不可用。

## 上轮问题回顾

### 已修复

1. Round 2 / Finding #1 — Analysis Skill runtime config 消费路径未接入 Story 11.1 resolver
   - 修复方式：保持 `speclite resolve config` raw merged-config 语义不变，新增独立 machine-readable `speclite resolve artifact-roots` CLI surface，并让五个 Analysis producer guidance 消费 resolver-backed roots、`resolutionMode` 与 provenance。
   - 验证结果：`npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/contract-anchors.test.ts test/cli-message-catalog.test.ts --reporter=dot` -> 5 files / 34 tests passed。

2. Round 2 / Finding #2 — Product Brief / PRFAQ existing-install legacy fallback 会错过旧 root-level artifact
   - 修复方式：新增 `resolveAnalysisDocumentRoute()` shared policy，并同步 Product Brief / PRFAQ workflow guidance；仅 `legacy-compatible` mode 启用 legacy root-level discovery，new subject main artifact 优先，legacy-only 原地 resume/write，两者均无则创建 new subject，distillate/stage/verdict 跟随 selected main 目录。
   - 验证结果：`test/analysis-artifact-routing.test.ts` 覆盖 legacy-only、new-only、both、neither、explicit mode 禁用 legacy discovery 与 related artifacts 同目录。

### 仍为非阻塞待办

1. Round 2 / Finding #3 — broad legacy-pattern `575` 精确计数缺少可复现命令
   - 维持既有 Evaluator 结论：P2 / CR TODO，不阻塞 A+B 修复；本轮未将其混入源码修复。

## 新发现

### 1. [高][新] `release/packaging-manifest.json` 吸入外部 untracked core package drift

- **来源**：blind
- **分类**：patch

- **证据**
  - `git ls-files --others --exclude-standard assets/source/speclite/core-skills/speclite-drawer-er-modeler assets/source/speclite/core-skills/speclite-drawer-er-modeler.zip` 显示 drawer core package 与 zip 仍是 untracked。
  - `release/packaging-manifest.json:66-70` 与 `release/packaging-manifest.json:792-796` 已列入 `assets/source/speclite/core-skills/speclite-drawer-er-modeler*` 文件。
  - `release/packaging-manifest.json:22` 的 `packageHash` 已随该 package inventory 变化。
  - 当前 strict canonical checker 仅报 `module-help.missing-row` for `speclite-drawer-er-modeler`，说明 manifest 已吸入该外部 package，但 `core-skills/module-help.csv` 尚无对应 row。

- **影响**
  - 若只提交 11.4 tracked diff，packaging manifest 会引用未纳入提交的 untracked drawer files，clean checkout 上 release evidence 不可复现。
  - 若把 drawer files 一并纳入 Story 11.4，则会把外部 core package drift 夹带进 Analysis routing Story，且 module discovery contract 仍不完整。

- **建议**
  - Evaluator 需判定该 finding 是否属于 Story 11.4 Fixer 范围，或按 canonical governance 独立处理。
  - 不应在未记录治理决策的情况下让 `release/packaging-manifest.json` 同时承担 11.4 release evidence 与外部 untracked package inventory。

### 2. [中][新] `resolveAnalysisDocumentRoute()` 未约束 artifact basename 与现存 artifact 类型

- **来源**：edge
- **分类**：patch

- **证据**
  - `src/manifest/analysis-artifact-routing.ts:50-53` 直接将 `projectName` 拼入 `mainBasename` / `distillateBasename`；若 `projectName` 含 `/`、`\`、`..` 或绝对路径形状，`path.posix.join()` 会把 basename 变成额外 path segment。
  - `src/manifest/analysis-artifact-routing.ts:85-88` 仅用 `access()` 判定 existing candidate，未确认目标是 regular file，未拒绝 directory、non-file 或 symlink escape。
  - `test/analysis-artifact-routing.test.ts:236-354` 覆盖 legacy/new/explicit precedence，但未覆盖 unsafe `projectName`、directory candidate、non-file candidate 或 symlink candidate。
  - 同仓已有路径安全工具可复用：`src/fs/path-normalizer.ts:64-79` 约束 project-relative path，`src/fs/path-normalizer.ts:107-138` 可检测 project-boundary symlink escape。

- **影响**
  - Product Brief / PRFAQ main artifact 可能逃出 selected subject directory，或在 legacy discovery 中选中不可写 directory / symlink，使后续 workflow resume/write 指向错误位置。
  - 该问题直接落在 Round 2 A+B 新增的 shared helper 上；不是 pre-existing producer text 问题。

- **建议**
  - 在 route helper 中把 `{project_name}` 转为文件名安全 basename，拒绝或规范化 path separators / traversal / absolute shapes，并补 regression。
  - 对 existing candidate 使用 `lstat()` / project-boundary symlink guard，只把 regular project-local file 视为可 resume artifact；directory / symlink / non-file 应继续按不存在处理或返回明确 issue。

## 验证摘要

- `npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/contract-anchors.test.ts test/cli-message-catalog.test.ts --reporter=dot` -> PASS，5 files / 34 tests passed。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict` -> ERROR，仅 D0 `module-help.missing-row` for `speclite-drawer-er-modeler`。
- `git diff --check` -> PASS，无 whitespace error。
- Acceptance Auditor 未完成：其 `npm run dev -- resolve ...` 命令因 `tsx` IPC `listen EPERM` 失败后请求非 sandbox 运行；外层未批准扩权，因此该层未纳入 findings。

## 通过项

- Owner Decision A 的 core behavior 仍通过聚焦测试：raw `resolve config --key modules.sdlc.analysis_artifacts` 未被 synthetic fallback 污染；`resolve artifact-roots` 独立输出 machine-readable roots。
- Owner Decision B 的 happy path / precedence path 仍通过既有 tests：new subject 优先、legacy-compatible legacy-only 原地选择、explicit mode 禁用 legacy discovery、related artifacts 跟随 selected main directory。
- 五个 Analysis producer guidance 已统一要求消费 `speclite resolve artifact-roots --project-root {project-root}`，未发现重新手写 fallback 的 active route。

## 结论

- **结论：不通过**
- **阻塞项**：Finding #1、Finding #2
- **建议**：启动 fresh `bmenhance-cr-02-evaluator 11-4` Round 3，分别裁定外部 drawer manifest drift 与 `resolveAnalysisDocumentRoute()` path/file boundary finding 的修复范围和优先级。
