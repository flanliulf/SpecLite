---
Story: 8-5
Round: 2
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Round 1 finding 已修复：`ResolverResult.sources` 已携带 selected dotted key 的 effective source metadata，explicit `--human` Summary 的 `source path` 已从 metadata 渲染，默认 machine mode 仍只输出 `result.value` JSON。`npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`、`npm run build`、`npm test` 和 `git diff --check` 均通过。

注意：当前环境没有可用的 Agent 子代理工具，按 reviewer skill 降级为当前上下文串行三层审查；Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层口径均已完成。

结论：通过。本轮未发现新的阻塞项、中高优先级问题或需要修复的 patch finding。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — Human resolve output 会把 source path 显示为候选首层，而不是真实 resolved 来源
   - 修复位置：`src/config/customization-reader.ts:79-118` 在 successful TOML layer merge 时记录 leaf dotted key 的 `affectedPath` 和 `role`；`src/config/customization-reader.ts:243-257` 只为实际 selected key 返回 source metadata。
   - 修复位置：`src/commands/resolve.ts:255-281` 的 `formatResolveSourcePath()` 不再读取候选首层，而是读取 `result.sources[key]?.affectedPath`；无 requested key 或多 source 时返回 `multiple`，missing / invalid 时返回 `none`。
   - 覆盖场景验证：`core.project_name` 由 `_speclite/config.user.toml` 覆盖 base value；`workflow.on_complete` 由 `_speclite/custom/speclite-create-story.user.toml` 覆盖 base value。构建产物 CLI 复现均显示 user layer effective source。

### 仍为非阻塞待办

无。

## 新发现

本轮未发现新的阻塞项或中高优先级问题。

Finding 分类统计：`decision_needed: 0`，`patch: 0`，`defer: 0`。

## 验证摘要

- ✅ `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts` 通过：3 个 test files / 26 个 tests passed。
- ✅ `npm run build` 通过：`tsup` ESM 与 DTS build success。
- ✅ `npm test` 通过：49 个 test files / 356 个 tests passed。
- ✅ `git diff --check` 通过：无 whitespace error 输出。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config --key core.project_name --human` 输出 `source path: _speclite/config.user.toml`，未泄露 absolute path / home path。
- ✅ 定向复现：`node dist/bin/speclite.js resolve customization --skill test/fixtures/resolve-parity/input/customization/.claude/skills/speclite-create-story --project-root test/fixtures/resolve-parity/input/customization --key workflow.on_complete --human` 输出 `source path: _speclite/custom/speclite-create-story.user.toml`，未泄露 absolute path / home path。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config --key core.project_name` stdout 为 pure JSON `{ "core.project_name": "Fixture User" }`，未出现 `sources` metadata 或 `Outcome` prose，exit code 为 `0`。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config --key missing.value` stdout 为 `{}`，exit code 为 `0`，stderr 为空。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config-broken-optional --key core.project_name` stdout 为 pure JSON，stderr 为单行 `ValidationIssue` JSON Lines diagnostic，exit code 为 `0`。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --human` 与 missing required layer human mode 均输出 `Outcome: invalid-input`，exit code 为 `1`，stderr 为空，未出现 raw `Error:`、stack trace、absolute project root、home/cache path。
- ⚠️ `npm run build` 后曾产生 `release/packaging-manifest.json` 的 `packageHash` drift；已按用户要求只恢复该 hash drift，最终 `git status --short release/packaging-manifest.json` 为空。

## 通过项

- Round 1 finding 的核心覆盖场景已修复：后续 layer 覆盖 base value 时，human Summary `source path` 使用真实 effective source。
- 默认 `speclite resolve config` / `speclite resolve customization` 未传 `--human` 时仍保持 pure JSON stdout contract，`sources` metadata 没有进入 CLI stdout。
- 默认 missing key behavior 保持 stdout `{}`、exit code `0`、stderr empty。
- `--human` 输出中的路径保持 project-relative 或 skill-relative；测试和定向复现未发现 absolute path、home/cache path、raw exception 或 stack trace 泄露。
- SPEC、README、CLI reference、schema anchor、tests 与 fixtures 对 `--human`、machine mode、missing key 和 source metadata 的描述保持一致。

## 结论

- **结论：通过**
- **阻塞项**：无
- **建议**：可进入 CR-02 evaluation / 后续 finalization 流程。
