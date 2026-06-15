---
Story: 8-7
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具不可用，本轮按 `bmenhance-cr-01-reviewer` 降级路径在当前上下文中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查，3/3 层完成。matrix focused test、focused CLI output tests、build、full test、release packaging check 和 `git diff --check` 均通过；`release/packaging-manifest.json` packageHash drift 已按要求精确恢复。当前存在 1 个中优先级 `patch` 类文档契约不一致问题，建议本轮结论为不通过，修复后复审。

## 新发现

### 1. [中] `docs/reference/cli.md` 把 `--locale` 记录到不支持的 `init/list`，同时漏列真实支持的 `status/validate`

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `docs/reference/cli.md:71-73` 在 `Init Options` 中新增 `--locale <locale>`，且描述为 `status output`；`docs/reference/cli.md:86-87` 在 `List Options` 中新增 `--locale <locale>`，且描述为 `validate output`。
  - `src/bin/speclite.ts:80-85` 注册 `init` 时只有 `--json`、`--dry-run`、`--yes`；`src/bin/speclite.ts:112-116` 注册 `list` 时只有 `--json`。
  - `src/bin/speclite.ts:286-313` 显示真实支持 `--locale` 的是 `status` 和 `validate`。
  - 定向复现：`node dist/bin/speclite.js init --locale en-US --dry-run /tmp/speclite-review-readonly` 和 `node dist/bin/speclite.js list --locale en-US /tmp/speclite-review-readonly` 均以 exit code `1` 失败，输出 `error: unknown option '--locale'`。

- **影响**
  - CLI reference 现在会指导用户复制不可用命令，违反 Story 8.7 AC4 的 “docs examples match outcome vocabulary and renderer” 要求。
  - 同一文档又没有在 `Status Options` / `Validate Options` 表中列出真实支持的 `--locale`，降低 read-only 和 validation flow 文档可信度。

- **建议**
  - 从 `Init Options` 和 `List Options` 删除这两行 `--locale`。
  - 在 `Status Options` 和 `Validate Options` 表中分别补充 `--locale <locale>`，文案与 `src/bin/speclite.ts` 保持一致。
  - 可补一个轻量 docs/reference test，对 `docs/reference/cli.md` 中 documented options 与 `node dist/bin/speclite.js <command> --help` 的核心 option surface 做 focused parity 检查，避免后续表格错位。

## 验证摘要

- ✅ `npm test -- test/cli-human-output-matrix.test.ts`：通过，1 file / 4 tests。
- ✅ `npm test -- test/cli-human-output-matrix.test.ts test/cli-output-presentation.test.ts test/install-outcome-human-output.test.ts test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/update-command.test.ts test/status-command.test.ts test/validate-command.test.ts test/resolve-cli.test.ts`：通过，9 files / 96 tests。
- ✅ `npm run build`：通过，`tsup` ESM/DTS build success。
- ✅ `npm test`：通过，51 files / 367 tests。
- ✅ `npm run release:packaging-check`：通过，`Packaging acceptance passed: release/packaging-manifest.json and dist/packaging-manifest.json`。
- ✅ `git diff --check`：通过，无 whitespace 输出。
- ✅ 定向 CLI smoke：
  - `node dist/bin/speclite.js init --locale en-US --dry-run /tmp/speclite-review-readonly`：按预期复现失败，exit code `1`，`unknown option '--locale'`。
  - `node dist/bin/speclite.js list --locale en-US /tmp/speclite-review-readonly`：按预期复现失败，exit code `1`，`unknown option '--locale'`。
  - `node dist/bin/speclite.js status --locale en-US --help`：help 中列出 `--locale <locale>`。
  - `node dist/bin/speclite.js validate --locale en-US --help`：help 中列出 `--locale <locale>`。

## 通过项

- `docs/reference/cli-human-output-matrix.md` 覆盖 `install`、`update`、`update --repair`、`status`、`validate`、`resolve --human` 的关键 outcome、focused test、JSON parity、docs example 或 fixture/semantic assertion。
- matrix 明确 docs 示例不是 contract source；契约来源仍指向 SPEC、schema 和 focused tests。
- 新增 `test/cli-human-output-matrix.test.ts` 覆盖 matrix 完整性、`NO_COLOR` / non-TTY / CI / 窄终端语义、`--json` 稳定性、resolve human mode 和 matrix packaging boundary。
- `--json` 稳定性在 focused tests 中验证为不受 locale、TTY、terminal width、`NO_COLOR` 影响；human renderer 语义不依赖 ANSI、颜色、图标或动态覆盖行。
- `release:packaging-check` 通过，且 matrix 文档没有被纳入 packaged runtime assets。

## 结论

- **结论：不通过**
- **阻塞项**：1 个中优先级 `patch` finding，需修正文档 option 表与真实 CLI surface 的不一致。
- **建议**：修复 `docs/reference/cli.md` 后执行 focused docs/CLI parity 检查，并进入 Round 2 CR。
