---
Epic: 5
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Story Review Summary
Stories Reviewed: 5
---

## 审查结论

首轮审查。共审查 Epic 5 下 5 个 Story。审查层状态：Structure & Completeness、Consistency、Contract & Boundary 三个维度均已覆盖；当前工具集中未提供可调用的独立 Agent 子代理，因此按 review-engine 降级策略由单一模型执行三层审查口径。

- 通过：3 个
- 有条件通过：1 个
- 硬阻塞：1 个

总体判断：不通过。Story 5.2 的 registry trust AC 与 SourceDescriptor owning SPEC 存在安全相关契约冲突，需先修订再进入开发；Story 5.5 作为 Epic 收口 Story 也需要补齐 blocked-status AC 覆盖面。

## 审查范围

- Story 文件：
  - `_bmad-output/implementation-artifacts/5-1-source-selection-and-channel-summary.md`
  - `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md`
  - `_bmad-output/implementation-artifacts/5-3-local-tarball-offline-bundle-and-local-path-integrity.md`
  - `_bmad-output/implementation-artifacts/5-4-git-source-pinning-and-floating-source-rejection.md`
  - `_bmad-output/implementation-artifacts/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md`
- 路径偏差记录：
  - sr-config 中 Story 文件目录为 `_bmad-output/implementation-artifacts/stories/`，但该目录实际不存在。
  - 本轮按用户指定与仓库真实状态，使用 `_bmad-output/implementation-artifacts/5-*.md` 作为 Epic 5 Story 审查输入。
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
  - `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
  - `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
  - `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
  - `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
  - `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
  - `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与架构文档一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互/认证/安全/性能口径
  - 跨 Epic 共享契约
  - SourceDescriptor / integrityEvidence / trustStatus 契约一致性
  - Redaction、validate/status no-network 与 fixture release gate 覆盖

## 新发现

### 1. [高] Registry trust AC 将 registry integrity 写成可触发 trusted 的条件
- **来源**：consistency+contract
- **分类**：patch
- **涉及 Story**：5-2
- **证据** - `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md` AC4 写明 registry integrity 或 expected lock match 验证成功时 source 可以标记为 `trusted`；同文件 Registry Resolution Matrix 又写明 registry SRI-only 应为 `unverified`。`_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 要求 registry sources 只有 lock 或 expected hash verification 成功才可 trusted。
- **影响** - 开发或测试可能把 npm registry SRI 视为信任锚，绕过 Epic 5 的 source trust 边界，属于供应链安全相关歧义。
- **建议** - 修订 Story 5.2 AC4，把 registry integrity 从 trusted 前置条件中移除；明确 `registry-integrity` 只是 reproducible evidence，只有 expected hash 或 `version-lock` match 才能产生 `trusted`。

### 2. [中] Registry SourceDescriptor AC 要求 top-level package 字段
- **来源**：consistency+contract
- **分类**：patch
- **涉及 Story**：5-2
- **证据** - `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md` AC3 要求 descriptor 包含 `package`；但 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 与 `02-source-descriptor-contract.md` 的 `SourceDescriptor` shape 没有 top-level `package` 或 `packageName` 字段。Story 5.2 后文也要求 registry package identity 通过 `integrityEvidence[].packageName` 表示。
- **影响** - AC 与契约真源冲突，可能诱导实现新增未契约化 public JSON 字段，破坏 CommandResult / manifest projection 的稳定性。
- **建议** - 修订 Story 5.2 AC3，将 `package` 表述改为 registry evidence 中的 `packageName` / package identity，或直接引用 SourceDescriptor SPEC 允许字段。

### 3. [中] Story 5.5 blocked-status AC 未覆盖完整阻断矩阵
- **来源**：structure+contract
- **分类**：patch
- **涉及 Story**：5-5
- **证据** - `_bmad-output/implementation-artifacts/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md` AC4 只列出 hash mismatch、lock mismatch、unsupported source 和 source policy rejection；同 Story tasks 与 SourceDescriptor SPEC 还要求 missing evidence、local source self-reference、floating Git source、bundled packaging evidence missing、failed evidence verification 等都必须 `blocked`。
- **影响** - Story 5.5 是 Epic 5 收口 Story，AC 覆盖不完整会让验收与测试漏掉关键 source-integrity 阻断路径。
- **建议** - 扩展 Story 5.5 AC4，使 blocked status 覆盖 SourceDescriptor SPEC 的完整 blocking cases，并要求 cross-source tests 对齐该矩阵。

## 逐篇审查结论

### Story 5.1: Source Selection And Channel Summary（来源选择与 Channel 摘要）

**结论：通过**

**优点**
- 结构完整，Story、AC、Tasks、Dev Notes、References 均有实质内容。
- 范围边界清晰：只建立 source selection、external access intent、summary 和 unsupported-source boundary，不提前实现 5.2-5.5 深度 resolver。

**关注点**
- `install --json` 的 `data.sourceDescriptor` 投影已明确必须遵守 SourceDescriptor SPEC；后续实现需避免在 5.1 中绕过 5.5 的 trust/evidence 收口。

**建议动作**
- 无阻塞修订。

### Story 5.2: Registry Source Resolution And Diagnostics（Registry 来源解析与诊断）

**结论：硬阻塞**

**优点**
- Registry resolver、diagnostics、redaction、status/validate no-network 与 fixture 范围拆分清楚。
- 后文矩阵和 implementation anchors 已基本对齐 owning SPEC。

**关键问题**
1. **Registry trust AC 将 registry integrity 写成可触发 trusted 的条件** - AC4 与 SourceDescriptor trust matrix 冲突，可能导致 SRI-only registry source 被错误标记为 `trusted`。
2. **Registry SourceDescriptor AC 要求 top-level package 字段** - AC3 与 public `SourceDescriptor` shape 冲突，后文虽然纠正为 `integrityEvidence[].packageName`，但 AC 仍会误导实现。

**建议动作**
- 修订 AC3 与 AC4，使 AC 与同文件矩阵、CommandResult SPEC、SourceDescriptor SPEC 完全一致后再进入开发。

### Story 5.3: Local Tarball, Offline Bundle And Local Path Integrity（本地包、离线包与本地路径完整性）

**结论：通过**

**优点**
- Tarball artifact hash、offline bundle staging redaction、local path allowlist snapshot 和 self-reference guard 的职责拆分清楚。
- `contentHash`、`content-hash` evidence、validate/status no-access、redaction 与 source-integrity issue 分类均与 SourceDescriptor SPEC 对齐。

**关注点**
- 需要实现时严格保留 artifact hash 与 extracted canonical tree hash 的语义分离。

**建议动作**
- 无阻塞修订。

### Story 5.4: Git Source Pinning And Floating Source Rejection（Git 来源固定与浮动来源拒绝）

**结论：通过**

**优点**
- Git source 必须解析到 concrete commit SHA 的边界明确，remote/branch/tag/floating source 的 blocked 行为清楚。
- Git CLI wrapper、stderr/stdout redaction、status/validate no-network 和 `git-commit` evidence 语义清晰。

**关注点**
- 实现时必须按 Story 要求证明 commit-ish，而不是只做 SHA-like 字符串检查。

**建议动作**
- 无阻塞修订。

### Story 5.5: SourceDescriptor Trust Status And Redacted Reporting（SourceDescriptor 信任状态与脱敏报告）

**结论：有条件通过**

**优点**
- 作为 Epic 5 收口 Story，已经集中到 single schema/parser、single trust evaluator、redacted public projection、install/status/validate/manifest projection 和 cross-source reporting matrix。
- Tasks、matrix、Dev Notes 和 References 对 SourceDescriptor SPEC 的引用充分。

**关键问题**
1. **blocked-status AC 未覆盖完整阻断矩阵** - AC4 覆盖面窄于同 Story tasks 和 SourceDescriptor SPEC，可能导致验收用例遗漏 missing evidence、floating Git、local self-reference 等关键阻断路径。

**建议动作**
- 扩展 AC4，使 AC 层直接覆盖完整 blocking cases，避免只靠 Tasks 承载验收真相。

## 通过项

- Epic 5 的五个 Story 均包含 Story、Acceptance Criteria、Tasks / Subtasks、Dev Notes、References 和 Dev Agent Record，结构完整。
- Story 5.1 -> 5.5 的依赖顺序整体合理：selection / registry / local artifacts / Git pinning / cross-source trust reporting。
- 各 Story 普遍保留了 ready-for-dev story context 不是源码完成证据、实现前重新检查前置 anchors、保留 dirty worktree 的 guardrail。
- Redaction、local-only validate/status、no access/no write before confirmation、operation lock 前失败不伪造 planned writes 等横切规则在 Story 间基本一致。
- Defer：`_bmad-output/project-context.md` 当前仍是初始化占位内容，Story 已明确实际 guardrails 以 live PRD、Architecture、ADR 和 owning SPEC 为准；这不是本轮 Story 设计新增问题。
