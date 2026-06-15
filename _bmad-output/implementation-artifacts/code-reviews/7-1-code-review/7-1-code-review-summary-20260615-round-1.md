---
Story: 7-1
Round: 1
Date: 2026-06-15
Model Used: GPT-5 (Codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。`npm run build`、focused tests、`npm test`、`git diff --check` 通过；`npm run lint` 不适用，因为 `package.json` 当前没有 `lint` script。本轮使用 `bmenhance-cr-01-reviewer`，但当前工具环境没有 Agent 子代理工具，已按 skill 降级为串行审查模式。

结论：不通过。当前存在 1 个阻塞问题：existing hook config 冲突场景在返回 manual action 前已经写入大量 installer artifacts，违反 Story AC3 对 hook config `plan-before-write` / 既有配置保护的要求。另有 1 个非阻塞问题建议修复或补充测试。

## 新发现

### 1. [中] Existing hook config conflict 在返回 manual action 前已产生部分安装写入

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/installer/runtime-structure.ts:189-217` 先执行 `writeIdeMirrors` 写入 `.claude/skills` / `.agents/skills`，再调用 `writeFlowGateHookArtifacts`。
  - `src/installer/hook-artifacts.ts:36-77` 在检测 `.claude/settings.json` 或 `.codex/hooks.json` 冲突前，已经创建 `_speclite/hooks/flow-gate-enforcement/` 并写入 `runner.mjs`、`hook-manifest.json`。
  - 定向复现：临时项目预置 `.claude/settings.json` 后执行 `runInstallCommand({ yes: true })`，返回 `exitCode: 1` 和 `ide-mirror.hook-config-conflict`，但临时目录已出现 `.claude/skills/*`、`.agents/skills/*`、`_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/hooks/flow-gate-enforcement/runner.mjs`、`_speclite/hooks/flow-gate-enforcement/hook-manifest.json` 等写入。
  - `test/hook-artifact-install.test.ts:75-108` 只断言既有 `.claude/settings.json` 未被覆盖，没有断言冲突路径必须在 hook artifact 或 IDE mirror 写入前停止。

- **影响**
  - Story AC3 明确要求 existing project configs 需要 `plan-before-write`、保留既有 human-owned 配置并输出 manual action。当前实现虽然没有覆盖用户 hook config，但失败前已经改变目标项目，留下部分 installed state，后续用户需要人工清理或面对不完整安装状态。

- **建议**
  - 在任何 IDE mirror、runtime structure 或 hook artifact 写入前预扫描 selected execution targets 的 platform hook config 冲突。
  - 为 `.claude/settings.json` 和 `.codex/hooks.json` 分别补充测试：冲突返回 manual action 时，目标项目不应新增 `_speclite/hooks/*`、IDE skill mirrors、manifest/index 或其他 installer artifacts。

### 2. [低] Runner 缺失 `_speclite/config.toml` 时崩溃，而不是返回可执行 block 决策

- **来源**：edge
- **分类**：patch

- **证据**
  - `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs:9-17` 顶层直接 `await evaluate(...)`，没有捕获 runtime config 读取错误。
  - `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs:64-66` 直接读取 `_speclite/config.toml`；文件缺失时抛出 `ENOENT`。
  - 定向复现：对缺少 `_speclite/config.toml` 的临时项目输入 `{"prompt":"/bmad-dev-story story 7-1","projectRoot":"<tmp>"}`，runner 输出 Node stack trace 并以 `exitCode=1` 结束，而不是输出 `{"decision":"block","reason":"..."}` 和下一步命令。

- **影响**
  - 正常安装路径会生成 `_speclite/config.toml`，因此这不是主路径阻塞。但一旦安装损坏或部分安装残留，hook 的阻断输出不再 actionable，和 AC5 的 “Blocking output is actionable and side-effect free” 存在韧性缺口。

- **建议**
  - 捕获 config 缺失/不可读/不可解析错误，返回 platform 支持的 block shape，提示先运行 `speclite validate` 或修复 `_speclite/config.toml`。
  - 增加直接执行 installed `runner.mjs` 的测试，而不只测试 `src/hooks/flow-gate-enforcement.ts` 中的同构逻辑。

## 验证摘要

- `npm run build` ✅ 通过；`tsup` build success，生成 `dist/bin/speclite.js` 与 d.ts。
- `npm test -- test/flow-gate-hook-runner.test.ts test/hook-artifact-install.test.ts test/file-integrity-ownership.test.ts` ✅ 通过；3 files / 14 tests passed。
- `npm test` ✅ 通过；40 files / 309 tests passed。
- `npm run lint` ❌ 不适用；项目当前缺少 `lint` script，npm 返回 `Missing script: "lint"`。
- `git diff --check` ✅ 通过；无 whitespace error 输出。
- 定向复现 ✅ 已执行：
  - existing `.claude/settings.json` conflict 返回 `ide-mirror.hook-config-conflict`，但失败前已有部分安装写入。
  - 完整 config + PASS kickoff gate 下，实际 `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs` 返回 `decision=allow`、`exitCode=0`。
  - 缺失 `_speclite/config.toml` 下，实际 runner 抛出 `ENOENT` stack trace、`exitCode=1`。

## 通过项

- 独立 canonical hook source root 已位于 `assets/source/speclite/hooks/flow-gate-enforcement/`，未嵌入 `speclite-dev-story` skill package。
- Installer 已把 hook runner、hook manifest、Claude config、Codex config 作为 hook artifacts 记录到 files index，包含 `artifactKind`、`sourceRef`、`executable`、`sha256`。
- Hook runner 主路径覆盖 no-op、Story key expansion、missing/non-pass/stale/mismatch/ambiguous block、`PASS` / `PASS_EQUIVALENT` allow。
- Flow Gate report template 已提供 hook-readable YAML frontmatter metadata。
- Codex `/hooks` review/trust 提示已出现在 install nextActions 与 fixture 中。
