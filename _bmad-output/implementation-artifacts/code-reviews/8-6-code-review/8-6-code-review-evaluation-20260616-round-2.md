---
Story: 8-6
Round: 2
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 8-6-code-review-summary-20260616-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 8-6 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。本轮审查提出 1 个上轮遗留阻塞发现：默认 `zh-CN` 的 `resolve --human` 仍透出英文 human label 与 issue prose。经 Story AC、Round 1 修复记录、源码路径和测试覆盖点交叉验证，该 finding 成立，非误报；评估结论为 not approved，需要进入第二轮 CR-03 fixer。

---

## Previous Round Confirmation（上轮问题回顾确认）

### Round 1 Finding #1：部分修复，仍有阻塞遗留

Round 1 evaluation 确认的阻塞项是默认 `zh-CN` human output 仍直接展示英文自然语言。修复执行记录显示 fixer 已停止在默认 `zh-CN` human renderer 中直接输出英文 `CommandResult.summary`，并覆盖 `status`、`validate`、`update`、`resolve --human` 的 human-only summary、state/evidence label、resolve bullet label 和说明句（`_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-1.md:102-107`）。

本轮源码验证显示该修复在 `status`、`validate`、`update` 主路径已基本收敛，但 `resolve --human` 的默认中文路径仍有残留：`zh-CN` catalog 中 `resolveSourcePath`、`resolveSourcePaths`、`resolveFallbackSource` 仍分别为 `source path`、`source paths`、`fallback source`（`src/cli/messages.ts:365`、`src/cli/messages.ts:383-384`）；`formatResolveHumanIssues()` 仍直接拼接英文 `issue.impact`（`src/commands/resolve.ts:359-362`）。因此 Round 1 finding 不能关闭。

### Historical CR TODO（历史 CR TODO）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | Round 1 evaluation 未产生非阻塞 CR TODO，本轮也不建议新增 CR TODO。 |

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高] [上轮遗留] 默认 `zh-CN` 的 `resolve --human` 仍透出英文 human label 与 issue prose**
> - 来源：blind+edge+auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Story AC1 要求任一默认 locale 的 human-readable command 在输出 Summary、Authorization、Issues 或 Next Actions 时，自然语言必须使用 `zh-CN` catalog，且不得直接透传英文内部 `nextActions`（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:15-19`）。Story 的范围边界只排除 command name、flags、paths、ids、schema names、JSON field names 等技术标识的本地化（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:79-82`）。

Round 2 review 指出的 `source path`、`source paths`、`fallback source` 是有效问题。它们位于 `zh-CN` catalog 的 label key 中（`src/cli/messages.ts:365`、`src/cli/messages.ts:383-384`），并由 `renderResolveHumanOutput()` 通过 `formatResolveBullet()` 渲染到默认中文 human output（`src/commands/resolve.ts:187-196`、`src/commands/resolve.ts:238-249`）。`formatResolveBullet()` 对 `zh-CN` 使用中文冒号 `：` 拼接 label 和 value（`src/commands/resolve.ts:407-414`），因此实际输出会形成 `- source path：...`、`- source paths：...`、`- fallback source：...`。这些 label 是 human-facing section/bullet label，不是实际 path 值、JSON field、issue id、reason code 或 enum value，不属于 Story 允许保留英文的技术标识。

Round 2 review 关于 `issue.impact` 的判断也成立。resolver issue 的 `impact` 由 `createImpact()` 生成英文 prose，例如 warning path 的 `An optional resolver layer could not be used and was treated as an empty object.` 和 invalid args path 的 `The resolver command cannot determine the requested runtime input.`（`src/config/resolve-diagnostics.ts:39-47`）。`formatResolveHumanIssues()` 在非 resolved/unresolved 分支直接输出 `issue.impact`（`src/commands/resolve.ts:359-362`），没有按 `locale` 使用 catalog 或 locale-aware formatter。相比之下，shared diagnostics issue formatter 在 `zh-CN` 下会用 localized impact summary 替代直接输出英文 `issue.impact`（`src/diagnostics/output.ts:1713-1718`），说明 `resolve --human` 当前路径确实遗漏了同类本地化处理。

测试覆盖盲点同样准确。`test/cli-message-catalog.test.ts` 对 resolve 的 deny-list 只检查 ASCII 冒号形式的 `source path:`、`source paths:`、`fallback source:`（`test/cli-message-catalog.test.ts:210-220`），但当前 `zh-CN` renderer 使用中文冒号 `：`，因此不会拦截 `source path：` 等残留。该片段也没有对上述 resolver warning/invalid-input 英文 `issue.impact` prose 做负断言。

**严重性判断：合理**

保持 `[高]` / P1 阻塞合理。该 finding 是 Round 1 阻塞项的残留范围，直接违反 AC1 的默认中文 human-readable output 要求。残留位置处于 `resolve --human` 的 Summary / Evidence / Issues 区域，且涉及 label 与 prose 两类 human-facing 文案；这不是纯风格问题，也不是仅影响英文 fallback 的可选优化。

**修复建议：可行**

review 建议可行且范围清晰。CR-03 fixer 应将默认 `zh-CN` 的 `resolveSourcePath`、`resolveSourcePaths`、`resolveFallbackSource` 等 label 改为中文 human label，同时保留实际 path 值、command、flag、issue id、reason/status code、JSON field 等技术标识。`formatResolveHumanIssues()` 应改为 locale-aware 输出：默认 `zh-CN` 不直接透传英文 `issue.impact` prose，可复用 shared issue formatter 的 localized impact 策略，或为 resolver issue impact 建立 catalog 文案；同时继续输出 `issueId`、`affectedPath`、`details.status` / reason code 等技术标识，避免丢失诊断可追踪性。

测试应补充默认 `zh-CN` `resolve --human` 的负断言，至少覆盖中文冒号形式 `source path：`、`source paths：`、`fallback source：`，以及 warning/invalid-input issue prose `The resolver command cannot determine...`、`An optional resolver layer...`。测试仍应允许 `_speclite/config.toml`、`--project-root`、`runtime-path.missing-entry`、`manifest-schema.malformed-field` 等技术标识保留英文。

**误报评估：非误报**

不是误报。Round 2 review 的代码定位、Story AC、Round 1 finding 范围和本轮独立源码验证一致；且来源为 `blind+edge+auditor`，三层审查同时命中。该 finding 应进入第二轮 CR-03 fixer。

---

## Overall Evaluation Conclusion（整体评估结论）

### Blocking Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 默认 `zh-CN` 的 `resolve --human` 仍透出英文 human label 与 issue prose | [高] | **P1** | 直接违反 AC1；`source path` / `source paths` / `fallback source` 是 human label，`issue.impact` 是英文 prose，需要 catalog/locale-aware formatter 修复。 |

### CR TODO Tracking（建议纳入 CR TODO 跟踪，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有建议延后处理的非阻塞项。 |

### False Positives（可忽略，误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮没有误报。 |

### Evaluation Decision（评估决定）

- **整体决定**：not approved。
- **发现 #1（默认 `zh-CN` 的 `resolve --human` 仍透出英文 human label 与 issue prose）**：确认有效，保持 P1，阻塞交付，需要第二轮 CR-03 fixer。
- **CR TODO 数量**：0。
- **误报数量**：0。
- **是否需要 fixer**：需要。
- **Fixer 指令建议**：仅修复 `resolve --human` 默认 `zh-CN` 残留范围；将 `source path`、`source paths`、`fallback source` 等 human label 改为中文 catalog 文案；将 resolver invalid/warning issue 的 `impact` 改为 locale-aware human 输出；保留 command、flag、path、issue id、reason/status code、schema id、JSON field、enum value 等英文技术标识；补充覆盖中文冒号形式和 resolver issue prose 的 focused regression tests；不得改变 `CommandResult` JSON、exit code、issue ordering 或 path normalization。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### Fix Item 1: 默认 `zh-CN` 的 `resolve --human` 残留英文 human label/prose

- **状态**：已修复。
- **修改文件**：
  - `src/cli/messages.ts`
  - `src/commands/resolve.ts`
  - `test/cli-message-catalog.test.ts`
- **修复内容**：
  - 将默认 `zh-CN` catalog 中 `resolveSourcePath`、`resolveSourcePaths`、`resolveFallbackSource` 的 human label 改为中文文案，避免输出 `source path：`、`source paths：`、`fallback source：`。
  - 调整 `formatResolveHumanIssues()` 的默认 `zh-CN` issue formatter，不再直接输出英文 `issue.impact`，改为 catalog 中的中文 impact summary。
  - 默认 `zh-CN` issue 行继续保留 `severity`、`category`、`issueId`、`affectedPath`、`details.status`、`details.layerKind`、`details.layerRole` 等技术标识，保证 resolver invalid/warning 诊断可追踪。
  - 新增 focused regression test，覆盖中文冒号形式的 `source path：`、`source paths：`、`fallback source：`，以及 invalid/warning issue prose `The resolver command cannot determine the requested runtime input.`、`An optional resolver layer could not be used and was treated as an empty object.`。
- **范围控制**：
  - 未修改 `CommandResult` JSON contract、exit code、issue ordering、path normalization。
  - 未修改默认 resolve machine mode pure JSON stdout。
  - 未修改 `--json` output。
  - 未修改 Story 8.7。
  - 未修改本 code-review 目录的 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- **验证结果**：
  - `npm test -- test/cli-message-catalog.test.ts`：通过，6 tests passed。
  - `npm test -- test/cli-message-catalog.test.ts test/resolve-cli.test.ts`：通过，21 tests passed。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 362 tests passed。
  - `git diff --check`：通过。
- **副作用处理**：
  - `npm test` 后 `release/packaging-manifest.json` 出现 `packageHash` drift，已按要求精确恢复；恢复后该文件无 diff。
