---
Story: 5-2
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-2-code-review-summary-20260601-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查发现包含 1 个 `decision_needed`、2 个 `patch`，另有 1 个 reviewer 明确 dismiss 的维护风险项。评估确认：3 个 finding 均有效且阻塞交付；`install.ts` 重复 orchestration 不单独阻塞。本轮 evaluator 不通过，需要进入 fixer。

---

## 发现 #1 评估

### 审查原文

> **[高] Private registry 目前没有真实的显式 endpoint/config lifecycle，成功路径只存在于 injected test client**
> - 来源：auditor+edge
> - 分类：decision_needed

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC2 要求 private registry source resolution 使用用户显式配置的 registry/channel 信息，且 public output 不泄露 token、credential-bearing URL 或 private query string（`_bmad-output/implementation-artifacts/stories/5-2-registry-source-resolution-and-diagnostics.md:21-25`）。当前 CLI install 参数只有 `--source`、`--source-value`、`--channel`、`--version`，没有 private registry endpoint/config lifecycle 输入（`src/bin/speclite.ts:123-132`）。resolver client contract 只接收 `sourceType`、`packageName`、`requestedVersion`、`channel`、`registryKind`，没有显式 private registry runtime config 或 redacted registry label contract（`src/source/registry-source-resolver.ts:21-28`）。默认 client 对 `private-registry` 直接抛出 `authentication-required`（`src/source/registry-source-resolver.ts:219-226`）。成功 install 测试依赖 injected `registryClient` 和 `confirmSourceAccess`，未证明 public runtime 如何取得用户显式 private registry config（`test/registry-source-resolution.test.ts:326-346`）。

**严重性判断：合理**

这是 AC2 成功路径缺口，不只是测试覆盖不足。Story 5.2 明确宣称 npm public 和 private registry source resolution；若 private registry 的成功路径只存在于测试注入层，当前实现不能证明真实 runtime 具备“用户显式配置”语义。

**修复建议：可行**

裁决：该项应作为 Story 5.2 当前 blocker，不判为误报，也不建议把 private registry 成功解析整体降级为 blocked/auth-required，因为这会削弱 AC2 对 private registry resolution 的正向要求。

推荐默认决策：在本 Story 内定义最小 private in-memory/runtime config contract，而不是新增猜测性的 CLI flag、配置文件格式或 token lifecycle。fixer 边界为：

- 只在 runtime/API 层表达最小 private registry explicit config，例如 display-safe registry label、registry kind、channel/package selector 和 injected metadata client/config 之间的显式绑定。
- 未提供该 explicit runtime config 时，继续稳定返回 `source-integrity.authentication-required`，不得隐式回退 public registry。
- public JSON、manifest、fixtures、human output 不新增 raw endpoint、auth token、credential-bearing URL、private query、proxy secret 或 cache path。
- focused tests 覆盖“缺少 explicit private config -> blocked/auth-required”和“提供 explicit private runtime config -> private registry success descriptor”两条路径。
- 不扩展到企业 token scope、持久配置文件、`.npmrc` 解析、完整 auth lifecycle 或 Story 5.3+ 范围。

**误报评估：非误报**

reviewer 的证据与 Story AC2、当前 CLI/runtime/default client/test 形态一致。

---

## 发现 #2 评估

### 审查原文

> **[中] Registry SourceDescriptor 把 package identity 放进 `resolvedRoot`，违反 AC3 的 identity 投影边界**
> - 来源：auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC3 明确要求 registry package identity 只能通过 `integrityEvidence[].packageName` 表示（`_bmad-output/implementation-artifacts/stories/5-2-registry-source-resolution-and-diagnostics.md:27-31`）。当前成功 resolver 在 registry descriptor 顶层写入 `resolvedRoot: packageName`（`src/source/registry-source-resolver.ts:203-214`），fixtures 也把 private package name 投影到顶层 `resolvedRoot`（`test/fixtures/source-integrity/registry-unverified/expected/source-descriptor.json:1-15`、`test/fixtures/source-integrity/registry-lock-trusted/expected/source-descriptor.json:1-22`）。schema 虽允许 `resolvedRoot` 为 optional 字段（`src/source/source-descriptor-schema.ts:49-60`），但 Story AC3 对 registry package identity 的投影边界更窄，应按 Story 执行。

**严重性判断：合理**

原始严重性为中，但它直接违反 AC3 的 automation contract，评估后作为 P1 阻塞修复处理。若保留顶层 `resolvedRoot` 作为 package identity，会让 install/status/manifest 消费方获得第二个 registry package identity 位置。

**修复建议：可行**

fixer 应删除 registry success descriptor 中用 package name 填充 `resolvedRoot` 的行为；package identity 保留在 `registry-integrity` / `version-lock` evidence 的 `packageName`。同步更新 focused tests、fixtures，以及依赖 `resolvedRoot` 展示 registry package 的 output assertion。若 human output 需要 registry source label，只能使用 source type、resolved version、trust status 或 contract 允许的 display-safe label，且不得成为 automation identity 的第二来源。

**误报评估：非误报**

存在明确 AC 文本和当前源码/fixture 对照，不是误报。

---

## 发现 #3 评估

### 审查原文

> **[中] `validateSourceIntegrity` 只检查 evidence 是否存在，未校验 trusted/blocked 与 evidence verification 的本地一致性**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Source descriptor contract 规定 `verified: false` 只能表示 evidence 可复现但未匹配 trust anchor，不得表示 failed verification；hash/lock mismatch、failed evidence verification 等必须产生 `source-integrity` issue 和 `trustStatus: "blocked"`（`_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md:80-97`）。registry source 只有 lock 或 expected hash verification 成功时才会变为 `trusted`（`_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md:109-113`）。当前 `validateSourceIntegrity` 对 registry descriptor 只检查是否存在 `registry-integrity` 或 `version-lock` evidence，一旦存在即返回无 issue（`src/validation/rules/source-integrity.ts:21-30`）。这无法发现本地 manifest 被篡改为 `trustStatus: "trusted"` 但所有 evidence `verified: false`，也无法发现 installed descriptor 仍处于 `blocked`。

**严重性判断：合理**

AC7 要求 validate 对本地 descriptor 和 integrity evidence shape 做 local-only 检查（`_bmad-output/implementation-artifacts/stories/5-2-registry-source-resolution-and-diagnostics.md:51-55`）。该检查不需要访问 registry，但必须能识别本地 descriptor/evidence 的关键一致性漂移；否则 validate 会把错误 trusted 状态视为通过。

**修复建议：可行**

fixer 应在 `validateSourceIntegrity` 中增加 local-only consistency rules，并补 focused tests：

- registry descriptor `trustStatus: "trusted"` 必须至少有一条 `verified: true` 的 `registry-integrity` 或 `version-lock` evidence，否则报稳定 `source-integrity` issue。
- registry descriptor `trustStatus: "blocked"` 作为已安装状态应产生本地 `source-integrity` issue。
- registry descriptor `trustStatus: "unverified"` 必须至少有 registry/lock evidence，且不能借 `verified: false` 表示 failed verification。
- 不新增 remote freshness/latest check，不调用 registry client。

**误报评估：非误报**

当前 validate 代码与 contract/AC7 之间存在真实缺口。

---

## 通过项补充评估

### `install.ts` 重复 orchestration：可忽略

reviewer 将 `src/commands/install.ts` 的 duplicated bundled/registry orchestration 判为维护风险，但未作为独立 blocker。评估同意该 dismiss：当前证据只显示 registry path 在确认后调用 resolver，失败时停在 install planning 前（`src/commands/install.ts:259-333`），bundled path 另行继续现有 install flow（`src/commands/install.ts:336-560`）。这可能增加未来维护成本，但本轮没有证明它违反 Story 5.2 AC，且修复它会扩大重构范围。无需在本 Story CR 中单独修复，也不列 CR TODO。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Private registry 缺少真实显式 config lifecycle | [高] | **P1** | AC2 正向成功路径缺口；需定义最小 private runtime config contract。 |
| 2 | Registry package identity 被放入顶层 `resolvedRoot` | [中] | **P1** | 违反 AC3 “只能通过 `integrityEvidence[].packageName` 表示”的投影边界。 |
| 3 | validate 未校验 trustStatus 与 evidence verification 一致性 | [中] | **P1** | AC7 local-only validate 缺少关键 descriptor/evidence consistency 检查。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报或不阻塞）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 4 | `install.ts` 重复 orchestration | dismiss | 只构成维护风险；当前没有独立 AC 行为失败证据，修复会扩大重构范围。 |

### 评估决定

- **发现 #1（Private registry explicit config lifecycle）**：确认有效，阻塞交付；默认采用“最小 private in-memory/runtime config contract”，不猜测 CLI/config file/token lifecycle。
- **发现 #2（Registry `resolvedRoot` package identity）**：确认有效，阻塞交付；fixer 应移除 registry success descriptor 顶层 package identity 投影并同步 tests/fixtures/output。
- **发现 #3（validate trust/evidence consistency）**：确认有效，阻塞交付；fixer 应补 local-only consistency 规则和 focused tests。
- **通过项补充（`install.ts` 重复 orchestration）**：可忽略，不单独阻塞，不列 CR TODO。

### 数量汇总

- 需要修复：3
- 可忽略：1
- 待讨论：0
- CR TODO：0

### 最终结论

本轮 CR evaluation 不通过。需要进入 fixer，且 fixer 只处理上述 3 个 Story 5.2 范围内阻塞项，不扩大到 Story 5.3/5.4/5.5/Epic 6/Post-MVP。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-01
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 3

#### 修复项 1：Private registry explicit config lifecycle

- 结果：已修复。
- 修改：在 `src/source/registry-source-resolver.ts` 定义最小 `RegistryRuntimeConfig`，表达 `displaySafeRegistryLabel`、`registryKind`、`packageName`、`channel`；private registry 在缺少 explicit runtime config、kind/package/channel 绑定不匹配或 label 不满足 display-safe 约束时，在调用 metadata client 前返回 `source-integrity.authentication-required`。
- 修改：在 `src/commands/install.ts` 增加 `privateRegistryRuntimeConfig` runtime/API 输入，并仅在 private registry path 传入 resolver；未新增 CLI flag、持久配置文件、token scope、`.npmrc` 解析或完整 auth lifecycle。
- 测试：`test/registry-source-resolution.test.ts` 覆盖缺少 explicit private config 时 blocked/auth-required 且不调用 client，以及提供 explicit runtime config 时 private registry success descriptor 成功生成。

#### 修复项 2：Registry success descriptor 顶层 `resolvedRoot` identity

- 结果：已修复。
- 修改：`resolveRegistrySource` 成功 descriptor 不再写入顶层 `resolvedRoot: packageName`；package identity 仅保留在 `integrityEvidence[].packageName`。
- 修改：同步更新 `test/fixtures/source-integrity/registry-unverified/expected/source-descriptor.json` 与 `test/fixtures/source-integrity/registry-lock-trusted/expected/source-descriptor.json`，移除 registry success fixture 顶层 `resolvedRoot`。
- 测试：focused resolver/install assertions 已改为按 `sourceType`、`version`、`trustStatus` 与 evidence package identity 校验，不新增 top-level `package` / `packageName` 字段。

#### 修复项 3：`validateSourceIntegrity` local-only consistency

- 结果：已修复。
- 修改：`src/validation/rules/source-integrity.ts` 对 registry descriptor 增加本地一致性规则：缺少 registry/lock evidence 报 `source-integrity.missing-evidence`；installed `blocked` descriptor 报本地 `source-integrity` issue；`trusted` 必须至少有一条 verified registry/lock evidence；`unverified` 不能携带 failed `version-lock` evidence。
- 测试：`test/registry-source-resolution.test.ts` 新增 trusted-without-verified-evidence、installed blocked descriptor、unverified failed lock evidence 的 validate focused assertions。
- 边界：未访问 registry，未做 freshness/latest check。

#### 验证命令

- `npm test -- test/registry-source-resolution.test.ts`：通过，1 file / 13 tests。
- `npm run build`：通过，tsup ESM 与 DTS build 成功。
- `npm test -- test/source-selection.test.ts test/registry-source-resolution.test.ts test/contract-anchors.test.ts test/status-command.test.ts test/validate-command.test.ts`：通过，5 files / 56 tests。
- `npm test`：通过，31 files / 222 tests。
- `git diff --check`：通过，无 whitespace errors。
