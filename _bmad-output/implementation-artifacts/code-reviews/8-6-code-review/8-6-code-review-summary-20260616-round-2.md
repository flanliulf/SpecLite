---
Story: 8-6
Round: 2
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子代理工具在当前环境不可用，本轮按 `bmenhance-cr-01-reviewer` 降级路径在主上下文串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；受用户写入约束影响，未创建 `.tmp/` 中间文件。Round 1 finding 在 `status`、`validate`、`update` 默认 `zh-CN` human output 中的主要英文 prose/label 已修复，focused tests、build、full test 与 `git diff --check` 均通过；但默认 `zh-CN` 的 `resolve --human` 仍透出英文 human label 与 issue prose，Round 1 finding 未完全修复，建议本轮结论为不通过。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — 默认 `zh-CN` human output 仍直接展示英文自然语言
   - `status`、`validate`、`update` human renderer 已停止直接输出英文 `CommandResult.summary`，改为 catalog/locale-aware summary 与 label。
   - 默认 `zh-CN` 下，Round 1 点名的 `Command status:`、`Status: failure`、`Output profile: Evidence`、`requested key:`、`machine contract:` 等 ASCII 冒号形式不再出现在 focused regression 覆盖的默认中文路径。
   - `command`、flag、path、issue id、reason code、schema id、JSON field、enum value 等技术标识仍保留英文。

### 仍未修复（阻塞）

### 1. [高] [上轮遗留] 默认 `zh-CN` 的 `resolve --human` 仍透出英文 human label 与 issue prose

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/cli/messages.ts:365`、`src/cli/messages.ts:383-384` 的 `zh-CN` catalog 值仍为 `source path`、`source paths`、`fallback source`。这些是 human output label，不是具体 path 值、JSON field 或 enum value。
  - `src/commands/resolve.ts:187-196`、`src/commands/resolve.ts:238-249` 在默认 `zh-CN` `resolve --human` 中渲染上述 label，因此实际输出仍包含 `- source path：多个`、`- source paths：_speclite/config.toml, ...`、`- fallback source：optional layer 作为 empty object 处理; 检查 _speclite/custom/config.toml`。
  - `src/commands/resolve.ts:359-362` 对 non-resolved issue 仍直接输出 `issue.impact`。定向复现中，默认 `zh-CN` invalid-input 输出 `The resolver command cannot determine the requested runtime input.`；optional layer warning 输出 `An optional resolver layer could not be used and was treated as an empty object.`。
  - `test/cli-message-catalog.test.ts:210-220` 的 deny-list 只检查 `source path:`、`source paths:`、`fallback source:` 等 ASCII 冒号形式；当前输出使用中文冒号 `：`，因此测试没有覆盖这个残留。该测试也没有覆盖 `resolve --human` warning issue 的英文 `issue.impact`。

- **影响**
  - AC1 要求默认 human-readable natural language 使用 `zh-CN` catalog，Round 1 finding 也明确点名 `source paths` 等英文自然语言 label。当前 `resolve --human` 仍在 Summary/Evidence/Issues 区域展示英文 label 与英文 issue prose，中文默认用户仍会看到中英文混杂说明。
  - 这些残留不属于必须保留英文的 command、flag、path、issue id、reason code、schema id、JSON field 或 enum value；它们是 human-facing label/prose。

- **建议**
  - 将默认 `zh-CN` 的 `resolveSourcePath`、`resolveSourcePaths`、`resolveFallbackSource` 等 label 改为中文或中英并列形式，保留实际 path 值和 command/flag 不翻译。
  - `formatResolveHumanIssues()` 默认 `zh-CN` 分支不要直接输出英文 `issue.impact`；可复用 shared issue formatter 的 localized impact 策略，或为 resolver issue impact 建立 catalog 文案，同时保留 `issueId`、`affectedPath`、reason code。
  - 扩展回归测试，至少覆盖中文冒号形式和 `resolve --human` warning/invalid-input issue prose，例如断言默认 `zh-CN` 不包含 `source path：`、`source paths：`、`fallback source：`、`The resolver command cannot determine...`、`An optional resolver layer...`。

### 仍为非阻塞待办

1. 无。

## 新发现

本轮未发现新的独立阻塞项或中高优先级问题。上述问题是 Round 1 Finding #1 的遗留未修复范围。

## 验证摘要

- ✅ `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts` 通过（6 files / 70 tests）。
- ✅ `npm run build` 通过。
- ✅ `npm test` 通过（50 files / 361 tests）。
- ✅ `git diff --check` 通过；恢复 packaging manifest drift 后再次通过。
- 未执行 `npm run lint`：`package.json` 未定义 `lint` script。
- 额外复核：
  - ✅ 默认 `zh-CN` `status` 定向复现未再出现 Round 1 的 `SpecLite is not configured in this project.` / `Command status:` 英文 label。
  - ✅ 默认 `zh-CN` `validate` 定向复现未再出现 Round 1 的 `SpecLite validate found issues in checked categories.` / `Status: failure` / `Output profile: Evidence`。
  - ✅ 默认 `zh-CN` `update --dry-run` 定向复现未再直接透出英文 `CommandResult.summary`。
  - ❌ 默认 `zh-CN` `resolve config --project-root <tmp> --human` 仍输出 `source path：多个` 与 `source paths：...`。
  - ❌ 默认 `zh-CN` `resolve config --human` 仍输出英文 issue prose：`The resolver command cannot determine the requested runtime input.`。
  - ❌ 默认 `zh-CN` optional layer warning 路径仍输出 `fallback source：...` 与英文 issue prose：`An optional resolver layer could not be used and was treated as an empty object.`。
  - ✅ `--locale en-US` / `SPECLITE_LOCALE=en-US` focused tests 通过，英文 fallback 仍可输出英文 human labels/prose。
  - ✅ `--json` / default resolve machine mode focused tests 通过，未发现 locale 影响 `CommandResult` JSON、exit code、issue ordering、path normalization 或 resolve default machine stdout。
- 副作用处理：
  - `npm test` 后观察到 `release/packaging-manifest.json` 的 `packageHash` drift（`sha256:4b5e7e895ffb9db3af627e163edc2459d6e4afe47a752fd94d5a5e8bc1d6c51c` → `sha256:709e1701653d60288323c2f34ef1d7c7be99e0f3fe223b18907328fcb6ddebeb`），已按用户要求精确恢复该文件；恢复后该文件无 diff。

## 通过项

- `status`、`validate`、`update` 的默认 `zh-CN` human output 已使用 locale-aware summary/labels，不再直接输出 Round 1 中对应的英文 `CommandResult.summary`。
- `command`、flag、path、issue id、reason code、schema id、JSON field、enum value 等技术标识在默认中文输出中仍保留英文。
- `--locale en-US` 与 `SPECLITE_LOCALE=en-US` 的英文 human fallback 仍通过 focused tests。
- `resolve` 默认 machine mode 仍保持 stdout pure JSON；`resolve --human` 仍为显式 opt-in support output。
- JSON output 与 exit code 未因 locale 参数变化而改变；focused tests 覆盖 `--json --locale en-US` 与默认 `--json` 输出相等。
- Next Actions 命令建议仍包含实际 display path 或 `<target>` 占位；update 建议按 blocker 修复、授权写入、validate/status 复查的安全优先级排序。

## 结论

- **结论：不通过**
- **阻塞项**：1 个，上轮遗留，分类 `patch`，严重性 `[高]`。
- **新发现**：0 个。
- **CR TODO**：0 个。
- **误报 / dismiss**：0 个。
- **建议**：进入 CR-03 fixer，聚焦默认 `zh-CN` `resolve --human` 的残留 label/prose 与测试盲点，不改变 machine contract 和英文技术标识。
