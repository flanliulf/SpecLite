---
Story: 4-3
Round: 2
Date: 2026-05-31
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

本轮为复审。由于当前环境没有可调用的 `Agent` 子代理工具，本轮按 `bmenhance-cr-01-reviewer` 降级规则串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；审查层均已完成，无失败层。Round 1 的 `restore-canonical` / repair action 越界实现已收敛，manifest 存在但缺失或 malformed `sourceDescriptor` 的 blocker 也已补齐；但 manifest 文件本身缺失或不可读时仍会被静默放行，并可在 `--yes` 下暴露 write-capable update plan。本轮建议不通过，进入 evaluator/fixer。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical`
   - `src/update/update-plan.ts:112-126` 的 `planRepair()` 现在只返回空 `repairPlan.actions`、空 apply results 和 `writeAuthorized: false`，不再遍历 files index 生成 `restore-canonical` / `regenerate` action。
   - `src/commands/update.ts:53-63` 仍保留稳定 `update.repair` command id，但其 data 来自受保护的空 repair projection；`rg` 复核未发现 `test/update-planning.test.ts` 继续断言 repair action。

2. Round 1 / Finding #2 — manifest 存在但缺失或 malformed `sourceDescriptor` 被当作无问题
   - `src/update/update-plan.ts:239-280` 现在将 manifest 中缺失 `sourceDescriptor` 映射为 `source-integrity.missing-source-descriptor`，将 schema parse 失败映射为 `source-integrity.malformed-source-descriptor`。
   - `src/update/update-plan.ts:169-178` 会在这些 error issue 出现后返回空 `updatePlan.actions` 并设置 `blocked: true`。
   - `test/update-planning.test.ts:318-421` 已覆盖 manifest 存在但缺失 `sourceDescriptor`、以及 malformed `sourceDescriptor` 两个场景。

### 仍为非阻塞待办

1. Round 1 / Finding #3 — 默认 `npm test` 5s timeout 下慢测治理
   - 本轮 `npm test` 在当前环境通过（28 files / 178 tests），未复现为本次修复引入的新回归。
   - 维持既有评估结论：非本轮阻塞项。

## 新发现

### 1. [中][新] manifest 文件缺失或不可读时仍绕过 source descriptor blocker 并授权 update plan

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `src/update/update-plan.ts:203-219` 在读取或解析 `_speclite/_config/manifest.yaml` 失败时直接返回 `{ artifactRoot: "_speclite-output", issues: [] }`。
  - `src/update/update-plan.ts:169-178` 只在 `manifestContext.issues` 存在 error/critical 时阻断 planning；因此 manifest 缺失时不会进入新补的 `source-integrity.missing-source-descriptor` blocker。
  - 定向复现：构造有效 `_speclite/config.toml`、有效 `_speclite/_config/files-index.json` 和 canonical source file，但不创建 `_speclite/_config/manifest.yaml`，调用 `runUpdateCommand({ options: { yes: true } })` 返回 `exitCode: 0`、`status: "success"`、`issues: []`、`updatePlan.actions[0].action: "update"`、`writeAuthorized: true`。

- **影响**
  - Round 1 的 source descriptor 修复只覆盖 manifest 文件存在但字段缺失或字段 malformed 的路径；安装状态中 manifest 文件缺失、不可读或 YAML parse 失败时仍可产生 write-capable update plan。
  - 这仍违反 Story 4.3 AC 1 / Task 4 对 source descriptor trust/evidence gate 的要求：写入计划前必须读取 source descriptor，缺少可验证 source evidence 时必须阻断 write planning。

- **建议**
  - 将 `readManifestContext()` 的 catch 分支改为返回 `source-integrity.missing-source-descriptor` 或更精确的 manifest/source descriptor blocker issue，并让 `blocked: true`。
  - 增加 focused test 覆盖 `_speclite/_config/manifest.yaml` 缺失、不可读或 YAML parse 失败且 files index/sourceRef 可生成 update action 的场景，断言 `updatePlan.actions: []`、`writeAuthorized: false`、exit code non-zero。

## 验证摘要

- `npm test` ✅ 通过（28 files / 178 tests）。
- `npm run lint` ❌ 未配置：`package.json` 没有 `lint` script，npm 返回 `Missing script: "lint"`。
- `npm run build` ✅ 通过（ESM / DTS build success）。
- `npx vitest run test/update-planning.test.ts test/update-command.test.ts --testTimeout=15000` ✅ 通过（2 files / 15 tests）。
- `git diff --check` ✅ 通过。
- 额外复核：
  - `rg` 复核确认 Story 4.3 代码路径中不再生成 `restore-canonical` / `regenerate` repair actions；保留的 schema 枚举和 renderer 兼容逻辑属于既有 public schema/显示层，不是本轮新增 executable repair behavior。
  - 定向复现确认 manifest 缺失路径仍会绕过 source descriptor blocker。

## 通过项

- Round 1 的 repair 越界执行路径已收敛：当前 `planRepair()` 不生成 repair actions，不写入文件，`writeAuthorized` 恒为 `false`。
- manifest 存在但缺失 `sourceDescriptor`、manifest 存在但 `sourceDescriptor` malformed 的 focused tests 已覆盖并通过。
- normal update 的 planned update、authorization state、conflict projection、Evidence profile 相关 focused tests 保持通过。
- 已知既有问题（defer）：默认测试超时治理维持非阻塞；本轮全量 `npm test` 已通过。

## 结论

- **结论：不通过**
- **阻塞项**：1 个 patch 项。
- **建议**：进入 `bmenhance-cr-02-evaluator` 评估后，由 fixer 补齐 manifest 缺失/不可读路径的 source descriptor blocker。
