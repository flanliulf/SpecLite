---
Story: 8-5
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。`npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts`、`npm run build`、`npm test` 和 `git diff --check` 均通过；默认 machine mode 的 pure JSON stdout、JSON Lines diagnostics、missing key `{}` / exit 0 / empty stderr、显式 `--human` opt-in 和 `CommandResult` exception 均已复核通过。

注意：本环境没有可用的 Agent 子代理工具，内部三层审查从并行子代理降级为当前上下文串行审查；本轮结果基于 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层口径的串行复核。

结论：不通过。存在 1 个中优先级 patch finding，直接影响 AC1 对 human output `source path` 的准确性要求。

## 新发现

### 1. [中] Human resolve output 会把 source path 显示为候选首层，而不是真实 resolved 来源

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `src/commands/resolve.ts:49-60` 为 `resolve config` 传入固定 `sourcePaths` 列表，`src/commands/resolve.ts:170-173` 渲染 `source path` 时始终取 `context.sourcePaths?.[0]`。因此成功输出总是显示 `_speclite/config.toml`。
  - `test/fixtures/resolve-parity/input/config/_speclite/config.toml:1-3` 定义 `core.project_name = "Fixture Base"`，`test/fixtures/resolve-parity/input/config/_speclite/config.user.toml:1-2` 覆盖为 `Fixture User`。实际 resolved value 来自 user layer，但 `test/resolve-cli.test.ts:75-78` 反而断言 human output 包含 `source path: _speclite/config.toml`。
  - 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config --key core.project_name --human` 输出 `Outcome: resolved`、`requested key: core.project_name`、`source path: _speclite/config.toml`，但该 key 的最终值是 `Fixture User`，由 `_speclite/config.user.toml` 覆盖得到。

- **影响**
  - Story AC1 要求成功 resolve 的 human output 展示 requested key、resolved layer、source path 和 value summary。当前 `source path` 字段对被后续 layer 覆盖的 key 会给出错误来源，维护者会被引导去检查错误文件。
  - 同一模式也适用于 `resolve customization`：`src/commands/resolve.ts:86-97` 传入 `customize.toml`、team custom、user custom 三个候选路径，而渲染层仍只取第一个候选路径，无法准确说明 `workflow.on_complete` 这类由 user layer 覆盖的 key 来源。

- **建议**
  - 在 resolver result 中携带每个 selected dotted key 的 effective source metadata，或在 human output 中避免使用单数 `source path` 伪装为精确来源，改为明确的 `source paths checked` 并同步 SPEC/AC 语义。
  - 补充覆盖后续 layer 覆盖 base value 的 human mode 测试：例如 `core.project_name` 应显示 `_speclite/config.user.toml`，customization 的 `workflow.on_complete` 应显示 `_speclite/custom/speclite-create-story.user.toml`。

## 验证摘要

- ✅ `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts` 通过：2 个 test files / 19 个 tests passed。
- ✅ `npm run build` 通过：`tsup` ESM 与 DTS build success。
- ✅ `npm test` 通过：49 个 test files / 356 个 tests passed。
- ✅ `git diff --check` 通过：无 whitespace error 输出。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config --key missing.value` 输出 `{}`，exit code `0`。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config-broken-optional` stdout 为 pure JSON object，stderr 为单行 `ValidationIssue` JSON Lines diagnostic，exit code `0`。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config --key core.project_name --human` 输出 `Outcome: resolved` 且 stderr 为空。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config-broken-optional --human` 输出 `Outcome: resolved-with-warnings` 且 stderr 为空。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --project-root test/fixtures/resolve-parity/input/config --key missing.value --human` 输出 `Outcome: unresolved` 且 exit code `0`。
- ✅ 定向复现：`node dist/bin/speclite.js resolve config --human` 输出 `Outcome: invalid-input` 且 exit code `1`。

## 通过项

- 默认 `resolve config/customization` 未传 `--human` 时仍走 machine mode，stdout 为 resolved JSON object，stderr 为 JSON Lines diagnostics；未发现 `CommandResult` envelope。
- 默认 missing key 行为保持 `{}` / exit code `0` / empty stderr。
- `--human` 是 explicit opt-in；未传入 `--human` 的测试覆盖确认 stdout 不包含 `Outcome`。
- Human outcomes `resolved`、`resolved-with-warnings`、`unresolved`、`invalid-input` 均有测试或定向复现覆盖。
- Optional layer warning 在 default mode 中仍以 `ValidationIssue` JSON Lines 输出；human mode 将 warning 渲染到 `Issues`。
- 未发现 merge order、optional/required layer semantics、missing key behavior 或 fallback project search 被实现代码改动。
- 测试覆盖了 fixture root、home directory 和 raw `Error:` 不泄露；本轮未发现 absolute path、home/cache path 或 raw exception 泄露。
