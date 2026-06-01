---
Story: 5-5
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-5-code-review-summary-20260601-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 报告 1 个 `patch` 发现：install plan / apply 写入边界未直接拒绝 `trustStatus="blocked"` 的 `SourceDescriptor`。经独立代码验证，该发现有效，并阻塞 Story 5.5 AC4。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] 写入边界未直接拒绝 `trustStatus=blocked` 的 SourceDescriptor**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 5.5 AC4 明确要求 `trustStatus` 为 `blocked` 时 install/update 不得继续写入步骤。Source Descriptor SPEC 也规定 `blocked` 必须在写入前停止 install/update，见 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md:94-98`。Install Plan SPEC 进一步把 `InstallPlan` 定义为写入前记录 resolved `SourceDescriptor`、planned writes 和 `writeAuthorized` 的 internal planning contract，见 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md:37-54`，并声明 `writeAuthorized` 不能自动接受 failed evidence verification 或 source policy rejection，见同文件 `:92-98`。

当前 `InstallPlanSchema` 只组合 `SourceDescriptorSchema`、modules、targets、external accesses、planned writes、confirmation 和 `writeAuthorized`，没有对 `sourceDescriptor.trustStatus === "blocked"` 与写入授权的组合做约束，见 `src/installer/install-plan-schema.ts:42-52`。`SourceDescriptorSchema` 允许 blocked descriptor 作为合法 descriptor，且仅对 non-blocked empty evidence、trusted evidence、evidence ordering、redaction 和 source-type/contentHash 做校验，见 `src/source/source-descriptor-schema.ts:52-149`；这本身合理，但不能替代 install write eligibility gate。

`applyInstallPlan` 入口目前只在 `writeAuthorized` 为 false 时返回 `operation-lock.project-locked`，见 `src/installer/runtime-structure.ts:35-62`。如果传入 `writeAuthorized=true` 且 descriptor 为 blocked，函数会在 `src/installer/runtime-structure.ts:64-68` 获取 operation lock，并在后续创建目录、写 config、写 IDE mirrors、写 manifest/index，见 `src/installer/runtime-structure.ts:84-96`、`:113-132`、`:171-183`、`:188-255`。因此 reviewer 对“写入边界自身可接受 blocked descriptor”的判断成立。

同时，当前 CLI 主路径确实有上游保护：registry/local/Git resolver 失败分支在 `src/commands/install.ts:285-312`、`:334-360`、`:420-447` 返回 failure；bundled source 在 descriptor blocked 时于 `src/commands/install.ts:492-512` 停止；update planning 已有 blocked source gate，见 `src/update/update-plan.ts:434-441`，并有 `test/update-planning.test.ts:265-310` 覆盖。因此这是 write boundary invariant 缺口，不是现有 resolver happy path 已直接失败的表现。

**严重性判断：偏低**

Reviewer 标记为 `[中]` 可以理解为当前 CLI happy path 仍被上游分支保护；但从 AC4 和 install/update 写入边界看，这是交付阻塞缺陷。`applyInstallPlan` 是实际写入入口，一旦未来 update/install 复用、测试构造、内部调用或 command 分支漂移绕过上游 resolver gate，就会在 blocked source 下获取 lock 并写入。评估后优先级应为 **P1**。

**修复建议：可行**

最小修复边界应同时覆盖 `InstallPlanSchema.superRefine` 与 `applyInstallPlan` 入口：

- `InstallPlanSchema.superRefine`：增加 plan-level invariant。建议至少拒绝 `writeAuthorized === true && sourceDescriptor.trustStatus === "blocked"`，并把 issue path 指向 `["sourceDescriptor", "trustStatus"]`。这样不会破坏现有 pending/unapplied plan 中 `writeAuthorized=false` 的 blocked descriptor anchor，例如 `test/contract-anchors.test.ts:231-244`，但能防止“已授权写入计划”携带 blocked source。
- `applyInstallPlan` 入口：在现有 `writeAuthorized` 检查之后、`acquireProjectOperationLock` 之前增加 runtime write gate。blocked source 应返回稳定 `ValidationIssue`，建议复用语义为 `source-integrity.blocked-source`、`category: "source-integrity"`、`severity: "error"`，`details` 仅包含 redacted-safe 字段，例如 `reason: "blocked-source"` 和 `sourceType`。不得包含 `resolvedRoot`、raw URL、local absolute path、cache/temp/staging path、raw stderr 或 stack trace。

仅改 `InstallPlanSchema.superRefine` 不够，因为 `applyInstallPlan` 是实际写入边界，TypeScript type、pre-parsed object 或未来 internal caller 仍可能直接进入 apply。仅改 `applyInstallPlan` 可以阻断实际写入，但 schema anchor 仍不能表达 install plan 的 write eligibility invariant，后续测试和 planner 仍容易构造已授权的 blocked write plan。因此两者都需要，且 apply guard 是 no lock/no write 的最后防线。

返回/抛出稳定性建议：schema 层可以抛出 deterministic Zod issue 作为开发期/测试期 invariant；公开 command 路径若可能触发该 parse failure，应映射为 redacted `source-integrity.blocked-source` failure，而不是泄露 Zod raw error。apply 层必须返回 `ApplyInstallPlanResult` failure，且在获取 lock 前返回：`completedSteps=[]`、`changedPaths=[]`、pending steps 保持 runtime/apply 后续步骤，确保 no lock/no write。

建议补充一条定向测试：构造 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus="blocked"` 的 install plan 或等价 apply 输入，断言 `applyInstallPlan` 返回 `source-integrity.blocked-source`，目标目录未创建 `_speclite`、未生成 manifest/index、未获取/留下 `_speclite/.lock`，`changedPaths=[]`。

**误报评估：非误报**

该发现有明确 AC/SPEC 依据，并被 `InstallPlanSchema` 与 `applyInstallPlan` 当前实现证实。不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 写入边界未直接拒绝 blocked SourceDescriptor | [中] | **P1** | 阻塞 Story 5.5 AC4；必须在 install plan 已授权写入和 apply 入口都建立 blocked source gate。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（写入边界未直接拒绝 blocked SourceDescriptor）**：确认有效，阻塞交付。下一步应进入 fixer，仅修复 `InstallPlanSchema.superRefine` 与 `applyInstallPlan` 写入入口，并补定向测试；不得扩大到 resolver 重写、update 已有 gate 重构、Epic 6 fixture matrix 或 source lock lifecycle。
