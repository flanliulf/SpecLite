---
Story: 8-6
Round: 3
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 8-6-code-review-summary-20260616-round-3.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 8-6 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。本轮审查提出 1 个上轮遗留阻塞发现：默认 `zh-CN` 的 `install` human output 仍透出英文自然语言和 human label。经 Story AC、前两轮评估/修复记录、源码路径、测试覆盖点和一次无写入 CLI 复现交叉验证，该 finding 成立，非误报；评估结论为 not approved，需要进入第三轮 CR-03 fixer。

---

## Previous Round Confirmation（上轮问题回顾确认）

### Round 2 Finding #1：已修复，可关闭

Round 2 evaluation 确认的阻塞项是默认 `zh-CN` 的 `resolve --human` 仍透出英文 human label 与 issue prose（`_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-2.md:37-67`）。Round 2 修复记录显示 fixer 已修改 `src/cli/messages.ts`、`src/commands/resolve.ts` 与 `test/cli-message-catalog.test.ts`，将 `resolveSourcePath`、`resolveSourcePaths`、`resolveFallbackSource` 改为中文 human label，并停止直接输出英文 `issue.impact`（`_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-2.md:107-118`）。

本轮源码验证与 Round 3 review 一致：`zh-CN` catalog 中相关 resolve label 已为 `来源路径`、`来源路径列表`、`回退来源`（`src/cli/messages.ts:365`、`src/cli/messages.ts:383-384`），focused regression 已覆盖中文冒号形式和 resolver issue prose（`test/cli-message-catalog.test.ts:232-265`）。因此 Round 2 finding 可关闭。

### Round 1 Finding #1：部分修复，install 仍有阻塞遗留

Round 1 broad finding 是默认 `zh-CN` human output 仍直接展示英文自然语言。前两轮已收敛 `status`、`validate`、`update`、`resolve --human` 重点路径，但本轮验证显示 `install` human renderer 仍保留同类问题。该残留仍落在 Round 1 broad finding 范围内，不能关闭 Story 8.6。

### Historical CR TODO（历史 CR TODO）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | 前两轮 evaluation 均未产生非阻塞 CR TODO，本轮也不建议新增 CR TODO。 |

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高] [上轮遗留] 默认 `zh-CN` `install` human output 仍透出英文自然语言和 human label**
> - 来源：blind+edge+auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Story AC1 要求任一默认 locale 的 human-readable command 在输出 Summary、Authorization、Issues 或 Next Actions 时，自然语言必须使用 `zh-CN` catalog，且不得直接透传英文内部 `nextActions`（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:15-19`）。Task 1 明确覆盖 `install/update/status/validate/resolve` 的 `zh-CN` 默认和 `en-US` fallback（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:41-44`）。Story scope boundary 只排除 command、flag、path、id、schema name、JSON field name 等技术标识的本地化（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:79-82`）。

源码验证支持审查描述。`renderInstallHumanOutput()` 默认 `locale` 为 `zh-CN`，但 `summaryLines` 仍直接追加 `result.summary`（`src/diagnostics/output.ts:307-326`）。`install` producer 的 `createTargetSummary()` 返回英文自然语言，例如 `Target: ... Directory state: missing. After confirmation...`（`src/commands/install.ts:1280-1304`），该文本随后进入默认中文 Summary 区域。

`renderInstallHumanOutput()` 的 State / Evidence 区域还硬编码英文 human label：`Completed steps:`、`Pending steps:`、`IDE target statuses:`、`Source`、`External Access`、`Authorization`（`src/diagnostics/output.ts:331-356`）。其中 `completedSteps=...`、`pendingSteps=...`、`sourceType=...`、`resolvedRoot=...`、`trustStatus=...` 等 key/value 是技术标识，可保留英文；但 `Completed steps:`、`Pending steps:`、`IDE target statuses:`、`Source`、`External Access`、`Authorization` 是面向 human output 的 label，不是 machine contract 字段。

相同问题还出现在 install ready summary 分支：`renderInstallReadySummary()` 在默认中文路径中仍输出 `Target project:`、`Install location:`、`Manifest version:`、`Key paths`、`Completed steps`、`Installed modules`、`IDE targets`、`Source`、`External Access`、`Authorization` 等英文 human label（`src/diagnostics/output.ts:763-820`）。这说明修复不应只处理 prewrite-paused 路径，而应覆盖 install human renderer family。

本次评估还执行了无写入复现：`npm run dev -- install /tmp/speclite-cr-eval-preview-target-8-6-round-3`。输出已包含中文 section title 与 localized Next Actions，但默认 `zh-CN` 仍显示 `Target: speclite-cr-eval-preview-target-8-6-round-3. Directory state: missing. After confirmation...`、`Completed steps: none`、`Pending steps: ...`、`IDE target statuses:`、`Source`、`External Access`、`Authorization`。命令输出同时声明 `写入状态：未写入项目文件`，且目标路径未创建。

测试覆盖盲点也成立。`test/cli-message-catalog.test.ts` 已覆盖默认中文 install 不透传内部英文 `nextActions`（`test/cli-message-catalog.test.ts:18-44`），并覆盖 `status`、`validate`、`update`、`resolve` 的默认中文 prose deny-list（`test/cli-message-catalog.test.ts:80-221`）以及 Round 2 `resolve --human` 回归（`test/cli-message-catalog.test.ts:232-265`）。但现有断言没有禁止默认 `zh-CN` install 输出中的 `result.summary`、target summary、`Completed steps:`、`Pending steps:`、`IDE target statuses:`、`Source`、`External Access`、`Authorization`。部分旧测试还仅在 `en-US` 下断言这些英文 label（例如 `test/source-selection.test.ts:189-200`、`test/install-outcome-human-output.test.ts:154-160`），不能证明默认中文路径合规。

**这些 install 输出是否应本地化：应本地化**

应本地化的是 human-facing prose/label：target summary 中的 `Target`、`Directory state`、`After confirmation...`，State / Evidence / Authorization 中的 `Completed steps:`、`Pending steps:`、`IDE target statuses:`、`Source`、`External Access`、`Authorization`，以及 ready summary 中同类 `Target project:`、`Install location:`、`Manifest version:`、`Key paths` 等 label。它们用于人类阅读，不是 public JSON field、reason/status code、schema id 或 enum value。

应保留英文的是技术标识和 machine-traceable value：`targetProject`、`projectRoot`、`manifestVersion`、`completedSteps`、`pendingSteps`、path/display path、`sourceType`、`resolvedRoot`、`trustStatus`、`evidence`、step id、IDE target id/status code、command、flag、issue id、reason/status code、schema id、JSON field、enum value。Reviewer 的修复建议已经正确区分了这两类内容。

**严重性判断：合理**

保持 `[高]` / P1 阻塞合理。该 finding 直接违反 AC1，并且 Task 1 将 `install` 明确列入 catalog 覆盖范围。Story 的用户价值是让中文默认用户不用在中英文混杂输出中猜测下一步（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md:7-11`）；当前默认 `install` 输出仍在 Summary、State、Evidence/Authorization 区域展示英文 prose/label，属于核心验收缺口，不适合降级为 CR TODO。

**修复建议：可行**

review 建议可行且范围清晰。CR-03 fixer 应将 install target summary、step state label、IDE target label、Source / External Access / Authorization、ready summary label 等 human-facing 文案纳入 `src/cli/messages.ts` catalog 或 locale-aware formatter。实现上应避免翻译 machine contract 字段和值：继续保留 `targetProject`、`projectRoot`、`manifestVersion`、`completedSteps`、`pendingSteps`、`sourceType`、`resolvedRoot`、`trustStatus`、path、status code、step id、command、flag、issue id、reason/status code、schema id、JSON field、enum value。

测试应补充默认 `zh-CN` install regression，覆盖真实 `install <target>` 或 `renderInstallHumanOutput()` 的 prewrite-paused、blocked/source access、write-failed/ready-check-failed、ready summary 代表路径。至少应对 `Target:`, `Directory state:`, `After confirmation`, `Completed steps:`, `Pending steps:`, `IDE target statuses:`, `Source`, `External Access`, `Authorization`, `Target project:`, `Install location:`, `Manifest version:`, `Key paths` 做负断言；同时保留对 `targetProject`、`projectRoot`、`completedSteps`、`pendingSteps`、`sourceType`、`resolvedRoot`、`trustStatus`、display path、step id/status code 等技术标识的正断言。

**误报评估：非误报**

不是误报。Round 3 review 的代码定位、Story AC、Round 1 broad finding 范围、现有测试盲点和本次独立 CLI 复现一致；且来源为 `blind+edge+auditor`，三层审查同时命中。该 finding 应进入第三轮 CR-03 fixer。

---

## Overall Evaluation Conclusion（整体评估结论）

### Blocking Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 默认 `zh-CN` `install` human output 仍透出英文自然语言和 human label | [高] | **P1** | 直接违反 AC1；install target summary、State/Evidence/Authorization label 和 ready summary label 是 human prose/label，需要 catalog/locale-aware formatter 修复。 |

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
- **发现 #1（默认 `zh-CN` `install` human output 仍透出英文自然语言和 human label）**：确认有效，保持 P1，阻塞交付，需要第三轮 CR-03 fixer。
- **CR TODO 数量**：0。
- **误报数量**：0。
- **是否需要 fixer**：需要。
- **Fixer 指令建议**：仅修复默认 `zh-CN` install human output 的残留范围；将 install target summary、step state label、IDE target label、Source / External Access / Authorization、ready summary label 等 human-facing 文案纳入 catalog 或 locale-aware formatter；补充默认 `zh-CN` install regression tests；保留 `targetProject`、`projectRoot`、`manifestVersion`、`completedSteps`、`pendingSteps`、path/display path、source descriptor fields、step id、IDE target id/status code、command、flag、issue id、reason/status code、schema id、JSON field、enum value 等英文技术标识；不得改变 `CommandResult` JSON、exit code、issue ordering、path normalization、默认 resolve machine mode 或 `--json` output。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### Fix Item #1：默认 `zh-CN` install human output 英文 prose/label 残留

- **状态**：已修复。
- **修改文件**：
  - `src/cli/messages.ts`
  - `src/diagnostics/output.ts`
  - `test/cli-message-catalog.test.ts`
  - `test/install-progress-ready-summary.test.ts`
  - `test/source-selection.test.ts`
  - `test/cli-smoke.test.ts`
- **修复要点**：
  - 默认 `zh-CN` 的 `renderInstallHumanOutput()` 不再直通英文 `result.summary`；改为输出本地化 outcome summary、`目标项目` 与 `项目根目录`，同时继续保留 `targetProject=`、`projectRoot=`、`manifestVersion=`、`completedSteps=`、`pendingSteps=` 等技术标识。
  - install State / Evidence / Authorization 使用 catalog label：`已完成 steps`、`待处理 steps`、`IDE 目标状态`、`来源`、`外部访问`、`授权状态`；`en-US` fallback 保持 `IDE target statuses:` 等旧 label 兼容。
  - install ready summary 默认中文改为 `目标项目`、`安装位置`、`manifest version`、`关键路径`、`已完成 steps`、`已安装 modules`、`IDE 目标`、`来源`、`外部访问`、`授权状态`，并本地化 key path 描述与 external access reason；保留 path/display path、source descriptor fields、step id、IDE target id/status code、command/flag 等技术标识。
  - 补充默认 `zh-CN` install regression，覆盖 prewrite 与 ready summary 代表路径，对 `Target:`、`Directory state:`、`After confirmation`、`Completed steps:`、`Pending steps:`、`IDE target statuses:`、`Target project:`、`Install location:`、`Manifest version:`、`Key paths`、`Source`、`External Access`、`Authorization` 做负断言，并正断言技术标识保留。
- **验证结果**：
  - ✅ `npm test -- test/cli-message-catalog.test.ts test/install-progress-ready-summary.test.ts test/source-selection.test.ts`：3 files / 27 tests passed。
  - ✅ `npm test -- test/target-directory.test.ts test/cli-smoke.test.ts`：2 files / 26 tests passed。
  - ✅ `npm run build`：通过。
  - ✅ `npm test`：50 files / 363 tests passed。
  - ✅ `git diff --check`：通过。
- **副作用处理**：
  - `npm test` 后 `release/packaging-manifest.json` 出现 `packageHash` drift（`sha256:4b5e7e895ffb9db3af627e163edc2459d6e4afe47a752fd94d5a5e8bc1d6c51c` → `sha256:1396f448fddaf74ff9e27d0de37965fb6b7fe8b2e2fdb42e9c374f9480eacbe5`），已按本轮约束精确恢复；恢复后该文件无 diff。
- **剩余风险**：未发现本 finding 范围内剩余风险；本轮未修改 `CommandResult` JSON contract、exit code、issue ordering、path normalization、默认 resolve machine mode 或 `--json` output。
