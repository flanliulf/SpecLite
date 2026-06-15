---
Story: 8-6
Round: 3
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子代理工具在当前环境不可用，本轮按 `bmenhance-cr-01-reviewer` 降级路径在主上下文串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；因用户明确限制只允许写 review summary，本轮未创建 `.tmp/` 中间文件。Round 2 点名的默认 `zh-CN` `resolve --human` 英文 label/prose 已修复，`status`、`validate`、`update`、`resolve --human` 重点路径通过 focused tests、定向复现、build、full test 与 `git diff --check`；但默认 `zh-CN` `install` human output 仍直接输出英文自然语言和 human label，属于 Round 1 broad finding 的残留范围，建议本轮结论为不通过。

## 上轮问题回顾

### 已修复

1. Round 2 / Finding #1 — 默认 `zh-CN` 的 `resolve --human` 仍透出英文 human label 与 issue prose
   - `src/cli/messages.ts:365`、`src/cli/messages.ts:383-384` 已将 `resolveSourcePath`、`resolveSourcePaths`、`resolveFallbackSource` 的默认 `zh-CN` label 改为 `来源路径`、`来源路径列表`、`回退来源`。
   - `src/commands/resolve.ts:359-367` 的 `formatResolveHumanIssues()` 在 `zh-CN` 分支不再直接输出英文 `issue.impact`，改为本地化 impact summary，同时保留 `severity`、`category`、`issueId`、`affectedPath`、`details.status` 等技术标识。
   - `test/cli-message-catalog.test.ts:232-265` 已补充 focused regression，覆盖 `source path：`、`source paths：`、`fallback source：`、`The resolver command cannot determine...`、`An optional resolver layer...`。
   - 定向复现确认默认 `zh-CN` `resolve --human` 不再输出 Round 2 点名的英文 label/prose；`--locale en-US` 与 `SPECLITE_LOCALE=en-US` 仍输出英文 fallback。

2. Round 1 / Finding #1 — 默认 `zh-CN` human output 仍直接展示英文自然语言（重点路径）
   - `status`、`validate`、`update` 的默认 `zh-CN` human renderer 已使用 locale-aware summary/label，不再直接输出 Round 1 点名的 `Command status:`、`Status: failure`、`Output profile: Evidence`、英文 `CommandResult.summary` 等 prose。
   - 默认 `zh-CN` `resolve --human` 的 `requested key:`、`machine contract:`、`legal command:` 等 ASCII 冒号英文 label 也未在定向复现中出现。
   - command、flag、path、issue id、reason/status code、schema id、JSON field、enum value 等技术标识仍保留英文。

### 仍未修复（阻塞）

### 1. [高] [上轮遗留] 默认 `zh-CN` `install` human output 仍透出英文自然语言和 human label

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/output.ts:323-326` 在默认 `zh-CN` `renderInstallHumanOutput()` 中继续追加 `result.summary`；`src/commands/install.ts:1280-1304` 的 `createTargetSummary()` 生成英文自然语言，例如 `Target: ... Directory state: missing. After confirmation...`。
  - `src/diagnostics/output.ts:331-348` 在 install 的 `State` / `Evidence` 区域硬编码英文 human label：`Completed steps:`、`Pending steps:`、`IDE target statuses:`、`Source`、`External Access`、`Authorization`。
  - 定向复现：默认运行 `install preview-target` 时，输出已包含中文 section title 与 localized Next Actions，但仍出现 `Target: preview-target. Directory state: missing. After confirmation...`、`Completed steps: none`、`Pending steps: ...`、`IDE target statuses:`、`Source`、`External Access`、`Authorization`。

- **影响**
  - Story AC1 要求任一默认 locale 的 human-readable command 在 Summary、Authorization、Issues 或 Next Actions 中使用 `zh-CN` catalog；Task 1 明确覆盖 install/update/status/validate/resolve。当前 install 默认 human output 仍在 Summary、State、Evidence/Authorization 区域暴露英文自然语言和 label，中文默认用户仍会看到中英文混杂说明。
  - 这些残留不是必须保留英文的 command、flag、path、issue id、reason/status code、schema id、JSON field 或 enum value；它们是面向用户阅读的 prose/label。

- **建议**
  - 将 install 的 target summary、step state label、IDE target label、Source / External Access / Authorization 等 human label 纳入 catalog 或 locale-aware formatter；保留 `targetProject`、`projectRoot`、`manifestVersion`、`completedSteps`、`pendingSteps`、path/status code 等技术标识。
  - 补充默认 `zh-CN` install 回归测试，覆盖真实 `install <target>` 或 `renderInstallHumanOutput()`，对上述英文 prose/label 做负断言，并继续断言 command/path/status 等技术标识不被翻译。

### 仍为非阻塞待办

1. 无。

## 新发现

本轮未发现新的独立阻塞项。上述问题归入 Round 1 broad finding 的遗留范围；Round 2 `resolve --human` finding 已修复。

## 验证摘要

- ✅ `npm test -- test/cli-message-catalog.test.ts test/resolve-cli.test.ts` 通过（2 files / 21 tests）。
- ✅ `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts` 通过（6 files / 71 tests）。
- ✅ `npm run build` 通过；build 后未产生 `release/packaging-manifest.json` drift。
- ✅ `npm test` 通过（50 files / 362 tests）。
- ✅ `git diff --check` 通过。
- 未执行 `npm run lint`：`package.json` 未定义 `lint` script。
- 额外复核：
  - ✅ 默认 `zh-CN` `status` / `validate` / `resolve --human` 未再出现 Round 1/Round 2 点名的英文 prose/label：`SpecLite is not configured in this project.`、`Command status:`、`SpecLite validate found issues in checked categories.`、`Status: failure`、`Output profile: Evidence`、`source path：`、`source paths：`、`fallback source：`、`The resolver command cannot determine...`、`An optional resolver layer...`。
  - ✅ 默认 `zh-CN` 仍保留技术标识：`speclite resolve config`、`--project-root`、`_speclite/config.toml`、`manifest-schema.malformed-field`、`runtime-path.missing-entry`、`status=parse-failed`、`status=invalid-args`。
  - ✅ `--locale en-US` 与 `SPECLITE_LOCALE=en-US` 的 `resolve --human` 仍输出英文 fallback labels，例如 `source path:`、`machine contract:`。
  - ✅ 默认 `resolve` machine mode stdout 仍为纯 JSON；`--human` 仍为显式 opt-in support output。
  - ❌ 默认 `zh-CN` `install preview-target` 仍输出英文 human prose/label，见阻塞项证据。
- 副作用处理：
  - `npm test` 后 `release/packaging-manifest.json` 出现 `packageHash` drift（`sha256:4b5e7e895ffb9db3af627e163edc2459d6e4afe47a752fd94d5a5e8bc1d6c51c` → `sha256:1322a08317d15eb97ba6799a84ed8e8733e6a6fa2088940c4f49c6d1d18224c9`），已按用户要求精确恢复；恢复后该文件无 diff。

## 通过项

- Round 2 fixer 对默认 `zh-CN` `resolve --human` 的 label/prose 修复有效，focused regression tests 已覆盖中文冒号形式和 resolver issue prose。
- `status`、`validate`、`update`、`resolve --human` 重点路径的默认中文 human output 未再复现 Round 1/Round 2 点名的英文自然语言。
- `command`、flag、path、issue id、reason/status code、schema id、JSON field、enum value 等技术标识在默认中文输出中仍保留英文。
- `--locale en-US` 与 `SPECLITE_LOCALE=en-US` 的英文 human fallback 仍可输出英文 label/prose。
- `CommandResult` JSON、exit code、issue ordering、path normalization、默认 resolve machine mode、`--json` output 未在本轮验证中发现 locale 相关回归。
- Next Actions 命令建议仍保留 technical command/display path，并在默认中文 human output 中使用本地化动作文案。

## 结论

- **结论：不通过**
- **阻塞项**：1 个，上轮遗留，分类 `patch`，严重性 `[高]`。
- **新发现**：0 个独立新发现。
- **CR TODO**：0 个。
- **误报 / dismiss**：0 个。
- **建议**：进入 CR-03 fixer，聚焦默认 `zh-CN` install human output 的 target summary、state/evidence/authorization label 和相关回归测试；不要改变 `CommandResult` JSON、exit code、issue ordering、path normalization、默认 resolve machine mode 或英文技术标识。
