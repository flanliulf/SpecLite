---
Story: 5-1
Round: 2
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-1-code-review-summary-20260601-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-1 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。本轮 review 结论为通过，未提出新的阻塞项、中高优先级问题或 CR TODO。经独立核对 Story 边界、源码、focused regression 与 `npx tsc --noEmit` 失败范围，Round 2 reviewer 的通过结论成立。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：`npm` source value private query/token redaction：已修复

Round 1 唯一 blocker 是 `npm` source value `@scope/pkg?token=secret` 可泄露到 public JSON 与 human-readable output。当前源码已在 `normalizeSourceSelection()` 中继续对非 bundled source 统一调用 `createDisplaySafeSourceLabel()`，并把其返回值作为 public `requestedSourceValue`（`src/source/source-selection.ts:89-99`）；`SourceResolutionPlan.externalAccesses[]` 后续也只使用该 display-safe `requestedSourceValue`（`src/source/source-selection.ts:103-118`）。

关键修复点位于 `sanitizePackageLabel()`：npm source value 先将反斜杠归一，再检查 unsafe display value、secret-like token、query/fragment delimiter 和 strict npm package-name allowlist；命中任一不安全条件时返回 `redacted-npm-package`（`src/source/source-selection.ts:186-227`、`src/source/source-selection.ts:276-289`）。因此 `@scope/pkg?token=secret` 不再作为 raw selector 进入 selection 或 external access intent。

public output 路径也被覆盖：custom source 仍在 source-specific resolver 前创建 blocked `SourceDescriptor` 并失败，不进入 install plan / operation lock / writes（`src/commands/install.ts:201-232`）；blocked descriptor 的 `resolvedRoot` 来自 display-safe `selection.requestedSourceValue`（`src/source/source-selection.ts:121-133`）；human output 的 Source / External Access 段继续从 `sourceDescriptor.resolvedRoot` 投影（`src/diagnostics/output.ts:482-515`）。因此 JSON 与 human output 均继承 redacted label。

回归测试覆盖了两层契约：`normalizeSourceSelection()` 与 `SourceResolutionPlan.externalAccesses[]` 对 `@scope/pkg?token=secret` 输出 `redacted-npm-package`，并断言 public text 不包含 raw query/token（`test/source-selection.test.ts:147-176`）；install JSON 与 human output 同样断言不包含 `@scope/pkg?token=secret`、`?token=secret`、`token` 或 `secret`（`test/source-selection.test.ts:262-303`）。本 evaluator 复跑 `npx vitest run test/source-selection.test.ts` 通过，1 个 test file / 10 个 tests。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | Round 1 未产生非阻塞 CR TODO。 |

---

## 本轮新发现评估

Round 2 review 未提出新的 findings。独立评估未发现需要新增的阻塞项、非阻塞 CR TODO 或待讨论项。

### Story 5.1 边界复核

Story 5.1 明确只建立 source selection、external access intent、redaction、invalid source diagnostics 和未确认前 no access/no write 边界，不负责 Story 5.2 registry resolution、Story 5.3 tarball/offline/local integrity、Story 5.4 Git pinning 或 Story 5.5 full trust reporting（`_bmad-output/implementation-artifacts/stories/5-1-source-selection-and-channel-summary.md:118-129`）。当前修复只扩展 npm display-safe label 判定与 focused regression，没有新增 registry/Git/tarball/local resolver、lockfile trust evidence、commit pinning 或 full trust matrix。

custom source path 仍以 `source-integrity.unsupported-source` 在 source-specific resolution 前停止（`src/commands/install.ts:201-232`），这符合 Story 5.1 对尚未实现 source-specific resolver 的要求：失败并避免 half-installed state（`_bmad-output/implementation-artifacts/stories/5-1-source-selection-and-channel-summary.md:73-78`）。因此 reviewer 关于“未提前实现 Story 5.2-5.5”的结论成立。

### `npx tsc --noEmit` 失败评估

本 evaluator 复跑 `npx tsc --noEmit`，失败集中在既有 `src/config/customization-reader.ts`、`src/fs/safe-write.ts`、`src/ide/target-writer.ts`、`src/installer/ready-check.ts`、`src/installer/runtime-structure.ts`、`src/manifest/*`、`src/update/*`、`src/validation/*` 和旧 tests 类型问题，主要是 `exactOptionalPropertyTypes`、`noUncheckedIndexedAccess`、Node `Dirent` 泛型和既有 schema 类型收窄问题。输出中未出现 `src/source/source-selection.ts` 或 `test/source-selection.test.ts` 的类型错误。

`package.json` 的正式脚本只有 `build`、`dev`、`test` 和 `release:packaging-check`，没有 `lint` 或 `typecheck` script；`npm run build` 对应 `tsup`，并由 Round 2 reviewer 记录已通过 `npm run build -- --out-dir /private/tmp/speclite-cr-5-1-round2-build`。在无法证明这些 `tsc --noEmit` 错误由 Story 5.1 当前变更新增的前提下，将其作为既有类型债/验证能力缺口而非本轮 blocker 是合理的。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | Round 2 未发现阻塞项；Round 1 blocker 已修复。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 未发现需要由本 Story CR TODO 跟踪的非阻塞项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | Round 2 review 未提出误报候选。 |

### 评估决定

- **Round 2 reviewer 通过结论**：确认成立。
- **Round 1 blocker 修复状态**：确认已修复；`@scope/pkg?token=secret` 在 selection、`SourceResolutionPlan.externalAccesses[]`、install JSON 和 human output 中均通过 `redacted-npm-package` 投影，不泄露 raw query/token。
- **Story 5.1 边界**：确认保持；未提前实现 Story 5.2-5.5。
- **`npx tsc --noEmit` 失败**：确认不作为本轮 blocker；未见错误落在 Story 5.1 当前修复文件，且 reviewer 已记录正式 build/test 门禁通过。
- **需要修复数量**：0
- **可忽略数量**：0
- **待讨论数量**：0
- **CR TODO 候选数量**：0
- **下一步建议**：无需继续 fixer 循环；可按严格串行流程进入 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 收尾。
