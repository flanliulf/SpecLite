---
Story: 5-2
Round: 2
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-2-code-review-summary-20260601-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-2 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。本轮 reviewer 结论为通过，声称 Round 1 的 3 个 P1 均已修复，且仅保留 1 个 `dismiss` 类维护风险。经独立只读核验，评估同意 reviewer 的通过结论：无需继续 fixer 循环。

---

## 上轮问题回顾确认

### Round 1 Finding #1：Private registry explicit runtime config contract：已修复

Round 1 evaluation 要求在本 Story 内定义最小 private in-memory/runtime config contract，不新增 CLI flag、持久配置文件、token scope、`.npmrc` 解析或完整 auth lifecycle。当前实现符合该边界：

- `src/source/registry-source-resolver.ts:32-37` 定义 `RegistryRuntimeConfig`，包含 `registryKind`、`displaySafeRegistryLabel`、`packageName`、`channel`。
- `src/source/registry-source-resolver.ts:95-114` 在 private registry 缺少 explicit config 或绑定不匹配时，先返回 `source-integrity.authentication-required`，不会调用 metadata client。
- `src/source/registry-source-resolver.ts:347-365` 要求 kind/package/channel 精确匹配，并拒绝包含 URL、query、fragment、token/secret/password/credential/auth 字样的 label。
- `src/commands/install.ts:121-122` 只在 runtime/API 层接收 `privateRegistryRuntimeConfig`；`src/commands/install.ts:292-299` 只在 private registry path 向 resolver 传入该 runtime config。
- `test/registry-source-resolution.test.ts:169-209` 覆盖缺 config 时 blocked/auth-required 且不调用 client；`test/registry-source-resolution.test.ts:387-438` 覆盖提供 explicit runtime config 后可生成 private registry success descriptor 且 public output 不泄露 secret；`test/registry-source-resolution.test.ts:441-488` 覆盖 install path 缺 config 时不调用 client。

评估确认：该修复没有扩大到未确认的企业配置生命周期，也没有把 private registry 隐式降级为 public registry。Round 1 P1 已关闭。

### Round 1 Finding #2：Registry success descriptor 顶层 `resolvedRoot` package identity：已修复

Round 1 evaluation 要求 registry package identity 只能保留在 `integrityEvidence[].packageName`，不得通过顶层 `resolvedRoot` 形成第二个 automation identity 位置。当前实现符合该边界：

- `src/source/registry-source-resolver.ts:235-247` 的 success descriptor 只包含 `sourceType`、可选 `channel`、可选 `requestedVersion`、`version`、`integrityEvidence`、`trustStatus`，不再写入顶层 `resolvedRoot`。
- `test/registry-source-resolution.test.ts:48-65`、`test/registry-source-resolution.test.ts:93-110` 和 `test/registry-source-resolution.test.ts:156-159` 的 success assertions 均不期望顶层 `resolvedRoot`。
- `test/fixtures/source-integrity/registry-unverified/expected/source-descriptor.json` 与 `test/fixtures/source-integrity/registry-lock-trusted/expected/source-descriptor.json` 未出现 `resolvedRoot`；package identity 仅出现在 evidence 的 `packageName` 字段。

评估确认：该修复满足 Story AC3 的投影边界。Round 1 P1 已关闭。

### Round 1 Finding #3：`validateSourceIntegrity` local-only trust/evidence consistency：已修复

Round 1 evaluation 要求 validate 只做本地 descriptor/evidence shape 与一致性检查，不访问 registry、不做 latest/freshness check。当前实现符合该边界：

- `src/validation/validate-project.ts:105-112` 只把本地 manifest 传给 `validateSourceIntegrity`，没有 registry client、network access 或 freshness/latest 参数。
- `src/validation/rules/source-integrity.ts:21-33` 覆盖缺少 registry/lock evidence。
- `src/validation/rules/source-integrity.ts:35-44` 覆盖 installed descriptor 仍为 `blocked`。
- `src/validation/rules/source-integrity.ts:46-54` 覆盖 `trusted` 但没有任何 verified registry/lock evidence。
- `src/validation/rules/source-integrity.ts:56-68` 覆盖 `unverified` 携带 failed `version-lock` evidence。
- `test/registry-source-resolution.test.ts:491-665` 覆盖 missing evidence、trusted-without-verified-evidence、blocked installed descriptor、unverified failed lock evidence 四类本地一致性场景。

评估确认：该修复保持 local-only，没有引入 remote revalidation。Round 1 P1 已关闭。

### 历史 CR TODO（非阻塞）

无。

---

## 发现 #1 评估

### 审查原文

> **[低][新] `install.ts` 重复 orchestration 仍维持 dismiss**
> - 来源：blind
> - 分类：dismiss

### 评估结论：❌ 误报 — 建议忽略

### 评估分析

**问题描述准确性：基本准确**

`src/commands/install.ts:261-339` 的 registry path 与后续 bundled install path 仍存在 orchestration 重复/分叉，作为维护风险描述基本准确。但 reviewer 并未把它列为 blocker，而是维持 dismiss。

**严重性判断：合理**

Round 1 evaluator 已明确该项不阻塞、不列 CR TODO；本轮复核未发现 fixer 引入新的行为失败。Story 5.2 的 AC 关注 registry source resolution、diagnostics、redaction、trust derivation 与 validate local-only 边界；当前没有证据证明重复 orchestration 破坏这些 AC。

**修复建议：可行但非必要**

抽取 shared helper 在工程上可行，但会扩大本 Story fixer 范围，并可能触碰 install 主流程。按 Round 1 evaluation 边界和本轮 reviewer 结论，本 Story 不应为该维护风险继续修复。

**误报评估：误报**

作为“需要本 Story 继续处理的问题”属于误报/可忽略项。该项不列 blocker，也不列 CR TODO。

---

## 整体评估结论

### 需要修复（阻塞交付）

无。

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 1 | `install.ts` 重复 orchestration | [低] | 仅为维护风险；Round 1 已裁定不阻塞且不列 CR TODO，本轮无新增行为失败证据。 |

### 评估决定

- **Round 1 Finding #1（Private registry explicit runtime config contract）**：确认已按 evaluation 边界修复；无需继续 fixer。
- **Round 1 Finding #2（Registry success descriptor 顶层 `resolvedRoot` package identity）**：确认已修复；success descriptor 不再投影顶层 package identity。
- **Round 1 Finding #3（validate local-only trust/evidence consistency）**：确认已修复；validate 仍保持 local-only。
- **发现 #1（`install.ts` 重复 orchestration）**：维持可忽略；不列 CR TODO。

### 数量汇总

- 需要修复：0
- 可忽略：1
- 待讨论：0
- CR TODO：0

### 最终结论

本轮 CR evaluation 通过。无需进入下一轮 fixer；可以继续严格串行执行 CR 04 rules extractor、CR 05 todo tracker、CR 06 finalizer 收尾。

### 本轮 evaluator 验证

- `npm test -- test/registry-source-resolution.test.ts`：通过，1 file / 13 tests。
- `git diff --check`：通过。
- 未重跑 `npm run build`：该命令会写入 `dist/`，本步骤写入边界仅允许 evaluation 与本 Story 进度记录，因此本轮 evaluator 不执行会改动工作区的构建命令。
