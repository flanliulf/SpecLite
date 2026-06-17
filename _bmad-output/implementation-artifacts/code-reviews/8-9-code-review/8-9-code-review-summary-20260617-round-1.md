---
Story: 8-9
Round: 1
Date: 2026-06-17
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子审查工具在当前会话不可用，本轮按技能降级为单一 LLM 审查，并从 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个视角串行覆盖实现、边界和 AC 对照。

结论：不通过。Story 8.9 的主要 layout、`picocolors@1.1.1` dependency、集中 helper、install prewrite bullet layout、interactive prompt layout、JSON contract 和 focused tests 大体成立；但 ANSI guard 存在一个明确 AC 违约：调用方传入 `noColor: false` / `ci: false` 时可以绕过 `NO_COLOR=1` 或 CI 环境禁色约束。全量 `npm test` 仍失败，失败集中在 mixed worktree 中 SDLC skill package root 数量从 57/44 漂移到 61/48 的非 8.9 变更，记录为外部阻塞，不计入本轮 patch finding。

## 新发现

### 1. [中] `NO_COLOR` / CI 禁色护栏可被 options 显式绕过

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/ansi-style.ts:31-38` 中 `shouldUseAnsi()` 只有在 `options.noColor !== false` 时才读取 `process.env.NO_COLOR`，只有在 `options.ci !== false` 时才读取 `process.env.CI`。因此调用方传入 `{ noColor: false, isTty: true, ci: false }` 时，即使环境里存在 `NO_COLOR=1`，函数仍会返回 true。
  - 定向复现命令：`npx tsx -e '...'` 设置 `process.env.NO_COLOR="1"` 后调用 `renderInstallHumanOutput(..., { locale:"en-US", noColor:false, isTty:true, ci:false })`，输出 ANSI 检测结果为 `true`，并出现 `\u001b[36m` / `\u001b[1m`。
  - Story AC 7 明确要求：`NO_COLOR=1`、CI、non-TTY、docs 示例、fixture 或 `--json` 输出不得包含 ANSI escape；启用颜色的前提是 `NO_COLOR` 未设置、CI 未设置、`options.noColor !== true` 且 `options.isTty !== false`。
  - 当前 focused tests 覆盖了 positive TTY、`noColor: true`、JSON 无 ANSI，但没有覆盖 `NO_COLOR=1` 与 `noColor:false` / `ci:false` 同时出现的强禁色优先级。

- **影响**
  - public renderer API 可以生成违反 Story contract 的 ANSI 输出；如果测试、docs generation 或上层 CLI adapter 明确传入 `ci:false` / `noColor:false`，环境级 `NO_COLOR` 或 CI 约束会失效。
  - 这不会改变 JSON contract，但会破坏 AC 7 / AC 11 中“无色环境无 ANSI”的硬性护栏。

- **建议**
  - 调整 `shouldUseAnsi()` 的优先级：`options.noColor === true`、`options.isTty === false`、`options.ci === true`、`process.env.NO_COLOR`、`process.env.CI` 都应先无条件禁色；`options.noColor === false` 不应覆盖 `NO_COLOR`，`options.ci === false` 不应覆盖真实 CI 环境。
  - 增加回归测试：设置 `process.env.NO_COLOR="1"` 且传入 `{ noColor:false, isTty:true, ci:false }` 时无 ANSI；设置 `process.env.CI="true"` 且传入 `{ isTty:true, ci:false }` 时无 ANSI。

## 验证摘要

- `npm test -- test/install-outcome-human-output.test.ts test/cli-output-presentation.test.ts test/cli-human-output-matrix.test.ts` ✅ 通过（21 / 21）
- `npm test -- test/cli-smoke.test.ts` ✅ 通过（11 / 11）
- `npm test -- test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts test/source-selection.test.ts test/git-source-resolution.test.ts test/cli-message-catalog.test.ts` ✅ 通过（90 / 90）
- `npm test -- test/install-outcome-human-output.test.ts test/cli-output-presentation.test.ts test/cli-human-output-matrix.test.ts test/cli-smoke.test.ts test/source-selection.test.ts test/git-source-resolution.test.ts test/cli-message-catalog.test.ts` ✅ 通过（63 / 63）
- `npm run build` ✅ 通过（tsup ESM / DTS build success）
- `npm run release:packaging-check` ✅ 通过（`Packaging acceptance passed: release/packaging-manifest.json and dist/packaging-manifest.json`）
- `git diff --check -- <8.9 scoped files>` ✅ 通过
- `npm ls picocolors chalk colorette strip-ansi --depth=0` ✅ 通过，仅 direct production dependency `picocolors@1.1.1`
- `rg -n "from \"picocolors\"|chalk|colorette|strip-ansi|\\u001b\\[|\\x1b\\[" package.json src test docs/reference/cli-human-output-matrix.md` ✅ 通过，只有 `src/diagnostics/ansi-style.ts` 直接 import `picocolors`，未发现 `chalk` / `colorette` / `strip-ansi` 依赖或手写 ANSI escape
- `NO_COLOR=1 npm run dev -- install /Users/fancyliu/Repos/noi --locale zh-CN` ✅ 通过，实际 prewrite output 展示 `Summary`、`Scope`、`State`、`Evidence`、`Issues`、`Next Actions`，并使用 bullet / nested bullet / path-safe command
- `npx tsx -e '...'` ❌ 复现本轮 finding：`NO_COLOR=1` 加 `{ noColor:false, isTty:true, ci:false }` 时仍输出 ANSI
- `npm test` ❌ 未通过（366 / 373 passed，7 failed）。失败集中在 `source-and-modules`、`fixture-release-gates`、`install-module-selection`、`runtime-structure`、`story-6-4-path-portability` 对 canonical skill count 仍期望 `57` / `sdlc=44`，当前 mixed worktree 实际为 `61` / `sdlc=48`。

## 通过项

- `package.json` / `package-lock.json` 已将 `picocolors@1.1.1` 放入 production dependency；未引入 `chalk`、`colorette`、`strip-ansi`。
- 直接 `picocolors` import 收敛在 `src/diagnostics/ansi-style.ts`；renderer、message catalog、docs 和 tests 未直接调用 `picocolors` API。
- `renderCommandResultJson()` 当前仍只是 `JSON.stringify(result, null, 2)`，focused tests 覆盖 JSON 不含 human-only absolute target context、outcome、human sections 或 ANSI。
- install prewrite 实际输出符合 Story 8.9 的 section 顺序、空行、bullet / nested bullet、Evidence hierarchy、Issues 友好空状态和 path-safe Next Actions。
- interactive prompt 的 Step 1/2/3 spacing、`SpecLite SDLC Module 0.0.0`、`quick` / `detailed` 对比列表、Step 3 中文 section label、IDE target directory 与 trailing slash write boundary 已由 `test/cli-smoke.test.ts` 覆盖。
- 已知既有/外部问题：全量 `npm test` 的 7 个失败由 mixed worktree 中非 8.9 新增 SDLC skill package roots 导致 count/golden 断言漂移，不属于本 Story layout/color 改动直接引入；后续需要在对应非 8.9 变更范围内刷新 fixture/count 合同。
