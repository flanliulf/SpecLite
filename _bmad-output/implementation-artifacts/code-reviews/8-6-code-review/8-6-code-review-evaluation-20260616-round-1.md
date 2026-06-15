---
Story: 8-6
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 8-6-code-review-summary-20260616-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 8-6 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 1 个阻塞发现：默认 `zh-CN` human output 仍直接展示英文自然语言。经 Story AC、代码路径和定向命令复现交叉验证，该 finding 成立，非误报；评估结论为 not approved，需要进入 CR-03 fixer。

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高] 默认 `zh-CN` human output 仍直接展示英文自然语言**
> - 来源：blind+edge+auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Story AC1 明确要求任一默认 locale 的 human-readable command 在输出 Summary、Authorization、Issues 或 Next Actions 时，自然语言必须使用 `zh-CN` catalog，且不得直接透传英文内部 `nextActions`（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:15-19`）。Story 同时明确边界：command name、flags、paths、ids、schema names、JSON field names 等技术标识不本地化（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:79-82`）。

代码验证支持审查描述。`renderStatusHumanOutput` 默认 `locale` 为 `zh-CN`，但 summary 中继续输出 `result.summary`，并硬编码英文句子 `Command status: ...`（`src/diagnostics/output.ts:363-378`）。`StatusCommandResult` 的未安装路径仍生成英文自然语言 summary `SpecLite is not configured in this project.`（`src/status/installed-state.ts:57-60`、`src/status/installed-state.ts:317-322`）。

`renderValidateHumanOutput` 同样默认 `zh-CN`，但 summary 中继续输出 `result.summary`、`Status: ...`、`Output profile: Evidence (...)`（`src/diagnostics/output.ts:404-447`）。`ValidateCommandResult` producer 生成的 `summary` 是英文句子 `SpecLite validate found issues in checked categories.` 或 `SpecLite validate completed for checked categories.`（`src/diagnostics/command-result.ts:156-170`）。

`renderResolveHumanOutput` 部分字段已通过 catalog 输出，例如 `Summary（摘要）`、`完成状态`、`写入状态`、`用户动作`，但同一默认 human path 中仍硬编码 `requested key`、`resolved layer`、`source path`、`value summary`、`output mode`、`machine contract: default stdout remains pure JSON when --human is omitted`、`legal command`、`failed layer`、`source paths`、`fallback source` 等英文 human bullet labels 或说明句（`src/commands/resolve.ts:169-232`）。

本次评估还用临时目录做了只读定向复现。默认 `npm run dev -- status <tmp>` 输出 `SpecLite is not configured in this project.` 和 `Command status: success means status read completed; it does not certify installation health.`；默认 `npm run dev -- validate <tmp>` 输出 `SpecLite validate found issues in checked categories.`、`Status: failure`、`Output profile: Evidence (compact-table)`；默认 `npm run dev -- resolve config --project-root <tmp> --human` 输出 `requested key`、`machine contract`、`legal command` 等英文 human prose。复现与 review summary 的描述一致。

**这些英文输出是否应保留：部分应保留，review 指出的 prose 不应保留**

应保留的英文技术标识包括 `speclite resolve config`、`--project-root`、`--human`、`<projectRoot>`、`core.project_name`、`_speclite/config.toml`、`runtime-path.missing-entry`、`affectedPath`、`reason`、`manifest-schema.schema-corruption`、`failure` 等 command/flag/path/issue id/reason code/schema or enum identifier。这些符合 Story scope boundary。

不应保留为英文的，是面向 human output 的自然语言 label 或说明句，例如 `SpecLite is not configured in this project.`、`Command status: success means status read completed; it does not certify installation health.`、`SpecLite validate found issues in checked categories.`、`Output profile: Evidence (compact-table)`、`requested key`、`resolved layer`、`machine contract: default stdout remains pure JSON when --human is omitted`。这些不是必须保持英文的技术标识，而是 Summary / Scope / Evidence / Issues 区域里给人读的 prose，应由 `zh-CN` catalog 或 locale-aware formatter 输出。

**严重性判断：合理**

保持 P1 / 阻塞交付合理。该问题直接违反 AC1 的核心验收目标，且覆盖 `status`、`validate`、`resolve --human` 多条默认 human output 路径，不是单一边缘文案。Story 的用户价值就是让中文默认用户不用在中英文混杂输出中猜测下一步（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:7-11`）；当前实现仍在 Summary / Scope / Evidence / Issues 中混入英文自然语言，足以阻塞 Story 交付。

**修复建议：可行**

review 建议可行且方向正确。CR-03 fixer 应将 human-only summary、state/evidence label、resolve human bullets 纳入 catalog，或在 human renderer 中用 catalog summary 替代 `CommandResult.summary` 的英文句子。实现时应保留 JSON `CommandResult` contract 和英文技术标识：command、flag、path、issue id、reason code、schema id、JSON field name、enum value 不应被翻译；但 human prose label 和解释句应走 `zh-CN` / `en-US` catalog。

建议补充默认 `zh-CN` focused regression tests，至少覆盖 `status`、`validate`、`update`、`resolve --human` 的 Summary / Scope / State / Evidence / Issues / Next Actions 中的已知英文 prose，并用白名单方式允许技术标识继续出现，避免把 AC1 修复误扩展为翻译 technical identifier。

**误报评估：非误报**

不是误报。review 的代码定位、默认命令复现、Story AC 和本次独立验证一致；三层来源为 `blind+edge+auditor`，可信度高。该 finding 应进入修复流程。

---

## Overall Evaluation Conclusion（整体评估结论）

### Blocking Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 默认 `zh-CN` human output 仍直接展示英文自然语言 | [高] | **P1** | 直接违反 AC1，影响 `status`、`validate`、`resolve --human` 等默认 human output；需要 CR-03 fixer。 |

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
- **发现 #1（默认 `zh-CN` human output 仍直接展示英文自然语言）**：确认有效，保持 P1，阻塞交付，需要 CR-03 fixer。
- **CR TODO 数量**：0。
- **误报数量**：0。
- **Fixer 指令建议**：修复范围应聚焦 human output catalog 与 renderer 消费路径，将 human-only summary、state/evidence label、resolve human bullets 纳入 catalog，或用 catalog summary 替代 `CommandResult.summary` 的英文句子；同时保留 command/flag/path/issue id/reason code/schema id/JSON field/enum value 等英文技术标识，并补充默认 `zh-CN` 回归测试。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复条目

1. **Finding #1：默认 `zh-CN` human output 仍直接展示英文自然语言**
   - 修复状态：已修复。
   - 修复范围：`src/cli/messages.ts`、`src/diagnostics/output.ts`、`src/commands/resolve.ts`、相关 CLI/locale tests。
   - 修复摘要：停止在默认 `zh-CN` human renderer 中直接输出英文 `CommandResult.summary`；将 `status`、`validate`、`update`、`resolve --human` 的 human-only summary、state/evidence label、resolve bullet label 和说明句改为 catalog/locale-aware 输出；保留 command、flag、path、issue id、reason code、schema id、JSON field、enum value 等技术标识。
   - 补充处理：`Issues` human 输出中对默认 `zh-CN` 的 `impact` 与 `manualAction` prose 改为中文 catalog 文案，避免 issue details 中继续透出英文自然语言；JSON contract 未改变。

#### 验证结果

- `npm test -- test/cli-message-catalog.test.ts`：通过（5 / 5）。
- `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过（70 / 70）。
- `npm run build`：通过；build 后出现 `release/packaging-manifest.json` 删除型 drift，已从 `HEAD` 精确恢复，该文件最终无 diff。
- `npm test`：通过（50 files / 361 tests）。
- `git diff --check`：通过。
