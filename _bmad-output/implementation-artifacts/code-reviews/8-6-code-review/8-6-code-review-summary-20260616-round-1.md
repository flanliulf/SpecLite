---
Story: 8-6
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具在当前环境不可用，本轮按 `bmenhance-cr-01-reviewer` 降级路径在主上下文串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；受用户写入约束影响，未创建 `.tmp/` 中间文件。locale focused tests、build、full test 与 `git diff --check` 均通过；但默认 `zh-CN` human output 仍直接输出英文自然语言，违反 AC1，建议本轮结论为不通过。

## 新发现

### 1. [高] 默认 `zh-CN` human output 仍直接展示英文自然语言

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/output.ts:323-325`、`src/diagnostics/output.ts:374-377`、`src/diagnostics/output.ts:442-446`、`src/diagnostics/output.ts:496-503` 在本地化 summary 后继续追加 `result.summary` 或硬编码英文说明，例如 `Command status: ...`、`Status: ...`、`Output profile: ...`、`Mode: ...`。
  - `src/commands/resolve.ts:187-202`、`src/commands/resolve.ts:222-232` 在默认 human mode 下硬编码英文自然语言标签和句子，例如 `requested key`、`resolved layer`、`machine contract: default stdout remains pure JSON when --human is omitted`、`source paths`。
  - 定向复现：默认 `npm run dev -- status <tmp>` 输出 `SpecLite is not configured in this project.` 和 `Command status: success means status read completed; it does not certify installation health.`；默认 `npm run dev -- validate <tmp>` 输出 `SpecLite validate found issues in checked categories.`、`Status: failure`、`Output profile: Evidence (compact-table)`；默认 `npm run dev -- resolve config --project-root <tmp> --human` 输出 `requested key`、`machine contract`、`source paths`。

- **影响**
  - Story 目标是默认中文 human-readable output，同时保留 command、flag、path、id、schema name、JSON field name 等英文技术标识。当前实现只本地化部分 section title、Next Actions 和 issue action，仍把 `CommandResult.summary` 与 renderer 内英文自然语言透出到默认 `zh-CN` human output。用户仍会在 Summary / Scope / Evidence 中看到中英文混杂说明，AC1 未满足。

- **建议**
  - 将 human-only 自然语言 summary、state/evidence label、resolve human bullets 纳入 catalog，或在 human renderer 中用 catalog summary 替代 `CommandResult.summary` 的英文句子；保留 `command`、flag、path、issue id、reason code、schema/JSON field name 等技术标识。
  - 增加默认 `zh-CN` 回归测试，覆盖 `status`、`validate`、`update`、`resolve --human` 的 Summary / Scope / Evidence / Next Actions，并对上述英文自然语言短语做负断言或显式白名单。

## 验证摘要

- ✅ `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts` 通过（69 / 69）。
- ✅ `npm run build` 通过；曾产生 `release/packaging-manifest.json` `packageHash` drift，已精确恢复，恢复后该文件无 diff。
- ✅ `npm test` 通过（360 / 360）。
- ✅ `git diff --check` 通过。
- ❌ 定向复现确认默认 `zh-CN` human output 仍存在英文自然语言透出，见 Finding #1。

## 通过项

- `update/status/validate/resolve` 已接入 `--locale` 或 `SPECLITE_LOCALE` 的 human output 路径；`--json` 分支仍直接调用 JSON renderer。
- `CommandResult` JSON、exit code、issue ordering 与 path normalization 未在测试中出现 locale 相关变更；focused tests 与 full test 均通过。
- Next Actions builder 在默认中文路径下不再直接透传内部英文 `nextActions`，并保留 command、flag、path、issue id、reason code 等技术标识。
- Update command suggestions 包含 `<target>` 占位，并按 blocker 修复、授权写入、validate/status 复查顺序输出。
- Issue `suggestedNextStep` 的中文渲染保留 `issueId`、`affectedPath` 与 reason code。
- 未发现 localization catalog 被实现为 plugin system、remote translation service 或 user-editable runtime customization。
