---
Epic: 6
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: epic-6-story-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Story Review Evaluation
---

## 评估总结

本次只评估 Epic 6 最新首轮 SR 审查总结 `epic-6-story-review-summary-20260526-round-1.md`。Reviewer 提出的 4 个发现均能由 Story 6.2、6.3、6.4、6.5 与 fixture / CommandResult SPEC 的文本证据支撑，未发现误报。

整体判断为需修订后再审。Finding 1 与 Finding 2 是 release gate 归属和执行顺序的决策型阻塞；Finding 3 与 Finding 4 是可直接修订的 Story 文档缺口，但会影响 fixture gate 的 deterministic、可执行性和 repair path coverage 边界，因此也应在 SR-03 中一并修订。

## 发现 #1 评估

### 审查原文

> **[高] explicit `update --repair` fixture ownership 仍可从 Epic 6 末端漂移出去**
> - 来源：consistency+contract
> - 分类：decision_needed
> - 涉及 Story：6-2、6-3、6-4
> - 证据 - Story 6.2 明确普通 `existing-install-update` 不覆盖 `update --repair`，并把 repair fixture ownership handoff 给 Story 6.3 / 6.4（`_bmad-output/implementation-artifacts/6-2-fresh-install-and-existing-update-fixture-gates.md` 第 63-67 行、第 108-112 行、第 225-228 行）。Story 6.3 默认不实现 repair execution fixture，并把 remaining expected outputs handoff 给 Story 6.4（`_bmad-output/implementation-artifacts/6-3-drift-source-integrity-and-resolve-parity-fixtures.md` 第 143-148 行、第 313-318 行）。Story 6.4 又允许如果不覆盖 explicit repair，则继续记录 handoff 到 subsequent repair fixture scope（`_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` 第 242-245 行），但 Epic 6 没有 6.6 或后续 repair Story。CommandResult SPEC 已把 `speclite update --repair --json` 定义为 MVP 命令，要求 `command: "update.repair"` 和 `RepairCommandData`（`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 第 76-82 行、第 106-110 行），并要求 `RepairPlan` 只包含 installer-owned actions、每个 repair action 有 `expectedHash`（第 493-512 行）。
> - 影响 - release gate 可能只验证 normal update conflict、validate next action 和 source/resolve/path portability，却没有任何 Story 真正拥有 explicit repair expected outputs。实现代理可能把 repair 误塞进 normal update / validate fixture，或把 `RepairCommandData` 留到未定义的后续范围，导致 MVP 命令契约与 Epic 6 release confidence 脱节。
> - 建议 - 人工裁决：A) 将 explicit repair fixture 强制归属 Story 6.4，并删除或改写 “handoff to subsequent repair fixture scope” 表述；或 B) 明确 Epic 6 不阻塞 repair execution fixture，并同步降级 CommandResult / fixture SPEC 的 MVP gate 语义。若选择 A，Story 6.4 至少应覆盖 IDE mirror drift repair、missing-source-evidence conflict、human/workflow protected paths、`RepairCommandData` snapshots、human-readable repair plan block 和 post-repair validate guidance。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 6.2 明确将 explicit repair handoff 给 6.3 / 6.4，Story 6.3 默认不实现并继续 handoff 给 6.4，Story 6.4 又允许继续 handoff 到未定义的 subsequent repair fixture scope。Epic 6 当前没有后续 6.6 Story，漂移风险成立。

**严重性判断**：合理 — `speclite update --repair --json` 已在 CommandResult SPEC 中列为 MVP 命令，并要求 `command: "update.repair"`、`RepairCommandData`、installer-owned-only `RepairPlan` 和 required `expectedHash`。如果 Epic 6 不闭合 fixture ownership，会留下 release confidence 缺口。

**修订建议**：可行 — 推荐选择 A：由 Story 6.4 明确承接 explicit repair fixture，并删除继续 handoff 到 subsequent scope 的表述。若产品决策选择 B，则必须同步调整 MVP gate / SPEC 语义；但这会超出单个 Story wording 修订，风险更高。

**误报评估**：非误报 — Reviewer 引用的 Story 与 SPEC 证据一致，且没有其它 Epic 6 Story 接住 explicit repair expected outputs。

## 发现 #2 评估

### 审查原文

> **[高] Story 6.4 对 `skill-artifact-loop` 的矩阵要求与 6.5 后置边界冲突**
> - 来源：structure+consistency
> - 分类：decision_needed
> - 涉及 Story：6-4、6-5
> - 证据 - Fixture SPEC 将 `skill-artifact-loop` 列为 MVP release gate，并要求 release gate fixtures 在 Node 22/24 上通过（`_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 第 29-35 行、第 49-51 行）。Story 6.4 Task 2 要求 runtime matrix 覆盖 `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity`、`resolve-parity`、`path-portability` 和最小 `skill-artifact-loop` 的可运行性边界（`_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` 第 90-94 行）。同一 Story 的 AC11 又明确不得提前实现 Story 6.5 `skill-artifact-loop` release gate 或 documentation examples（第 76-80 行）。Story 6.5 才创建 / 扩展 `test/fixtures/skill-artifact-loop/` 并把它注册为 fixture project release gate（`_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md` 第 66-70 行）。
> - 影响 - 若按 Story 6.4 执行，开发者需要在 6.5 之前把 matrix 指向一个尚未创建的 release gate；若按 6.5 后置边界执行，6.4 的 matrix evidence 又无法完整满足 fixture SPEC。CI/release evidence wiring 可能在 6.4 伪造 placeholder gate、跳过 `skill-artifact-loop`，或越界实现 6.5。
> - 建议 - 人工裁决矩阵边界：Story 6.4 应只实现 matrix runner 支持与已存在 gate 的 evidence，并为 `skill-artifact-loop` 预留 typed gate slot / skip reason；Story 6.5 在创建 gate 后补充 matrix inclusion。或者调整顺序，把最小 `skill-artifact-loop` gate 先于 6.4 完成。裁决后同步 6.4 Task 2、AC11 和 6.5 Task 2 的 wording。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Fixture SPEC 要求 `skill-artifact-loop` 是 MVP release gate 且 Node 22/24 通过；Story 6.4 要求 matrix 覆盖最小 `skill-artifact-loop`，但 AC11 又禁止提前实现 6.5 的 gate。Story 6.5 才负责创建该 fixture gate。

**严重性判断**：合理 — 这是 Story 执行顺序与 release evidence wiring 的直接冲突，会使 6.4 在不越界的情况下无法完成完整 matrix evidence。

**修订建议**：可行 — 推荐修订为：6.4 只实现 matrix runner、已有 gates evidence、以及 `skill-artifact-loop` typed pending/skip slot；6.5 创建 gate 后补充 matrix inclusion 和最终 release evidence。

**误报评估**：非误报 — 证据同时来自 fixture SPEC、6.4 AC/Task 和 6.5 Task，属于多来源一致命中。

## 发现 #3 评估

### 审查原文

> **[中] Story 6.5 缺少 deterministic skill activation harness 边界，容易把 fixture gate 误解为 LLM workflow 执行**
> - 来源：structure+contract
> - 分类：patch
> - 涉及 Story：6-5
> - 证据 - Story 6.5 要求 fixture 激活 installed skill、通过 installed runtime support 读取 config/customization，并在最小闭环中写出 planning / review artifact（`_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md` 第 21-31 行、第 78-88 行）。同一 Story 的 fixture requirements 要求 activation 使用 installed `SKILL.md` 与相邻 resources，并从 on-disk metadata 验证 artifact（第 188-203 行）。但前序 Story 2.3 已明确 fixture 不需要由 LLM 实际执行完整 workflow 文案，只验证 installed IDE entry discovery、activation protocol、resolver access 边界和 artifact metadata 值域（`_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md` 第 103-107 行）。Fixture SPEC 也把 `skill-artifact-loop` 限定为 installed entry discovery、activation protocol、resolver access 和 artifact metadata 值域，不包括复杂 workflow 叙事质量或人工评审结论（`_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 第 39-41 行）。
> - 影响 - 开发者可能尝试在 Vitest/fixture runner 内驱动真实 agent/LLM，造成不确定、不可离线、不可 CI 的 release gate；也可能反向伪造 artifact pass，绕过 installed activation protocol。两种实现都会削弱 release confidence。
> - 建议 - 在 Story 6.5 Task 4 / Task 5 补充 deterministic harness 约束：fixture 只读取 installed `SKILL.md` 的 activation protocol 起点、调用 `speclite resolve`、并通过受控 test skill 或 fixture-owned minimal workflow writer 生成带 metadata 的 artifact；不得调用 LLM，不得依赖 agent runtime，不得用 source checkout prompt 直接生成 artifact。若需要新增最小阶段化 skill，必须同步 source metadata、manifest/help/phase coverage、fixtures 和 packaging inventory。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：基本准确 — Story 6.5 已限定 installed runtime support、installed package resources 和 metadata validation，但没有明说 fixture harness 不得调用 LLM / agent runtime。考虑到 `skill-artifact-loop` 名称和 workflow artifact 输出语义，确实存在执行者误解空间。

**严重性判断**：合理 — 原始严重性为中，但该缺口会影响 release gate 是否 deterministic、local-only、CI-friendly。按优先级定义，它更接近 AC 可测性与实现边界问题，因此评估为 P1 修订项。

**修订建议**：可行 — 可在 Story 6.5 Task 4、Task 5 与 Skill Artifact Loop Fixture Requirements 中补充 no-LLM / no-agent-runtime / fixture-owned deterministic writer 约束，并保留 installed activation protocol 与 `speclite resolve` 断言。

**误报评估**：非误报 — Story 2.3 与 fixture SPEC 已提供更窄的 deterministic MVP 边界，Story 6.5 需要显式继承该边界。

## 发现 #4 评估

### 审查原文

> **[中] path-portability Story 将 repair path 字段纳入覆盖，但 repair fixture 是否存在仍未确定**
> - 来源：consistency
> - 分类：patch
> - 涉及 Story：6-4
> - 证据 - Story 6.4 Task 4 要求 public path fields 覆盖 `repairPlan.actions[].affectedPath`（`_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` 第 106 行），Task 10 又要求运行 affected update/repair tests（第 143 行）。但 Story 6.4 的 Path Portability Fixture Requirements 只在“本 Story 选择覆盖 repair handoff”时才包含 explicit `update --repair` 场景（第 203-204 行），Repair Fixture Handoff 也允许不覆盖并继续 handoff（第 242-245 行）。
> - 影响 - 如果 evaluator 允许 Story 6.4 不实现 explicit repair fixture，Task 4 / Task 10 仍会要求 repair path assertions，导致测试计划不可执行；如果实现者为了满足 path assertions 隐式创建 repair fixture，又会触碰 Finding 1 的 ownership 决策。
> - 建议 - 将 Story 6.4 的 repair path coverage 改成条件化：仅当本 Story 承接 explicit repair fixture 时覆盖 `repairPlan.actions[].affectedPath` 和 affected repair tests；否则必须输出明确 deferred evidence item，并说明由哪个 Story / gate 补齐。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 6.4 Task 4 和 Task 10 已要求 repair path / repair tests，但 Path Portability Fixture Requirements 与 Repair Fixture Handoff 又把 explicit repair 设为可选或可继续 handoff。

**严重性判断**：合理 — 这是测试计划可执行性问题，并且与 Finding 1 的 ownership 决策强相关。若不修订，Story 6.4 可能同时要求和不要求 repair fixture。

**修订建议**：可行 — 若按 Finding 1 推荐由 6.4 承接 explicit repair，则应把 `repairPlan.actions[].affectedPath` 和 affected repair tests 设为 6.4 必做项；若不承接，则需条件化并写明 deferred evidence owner。

**误报评估**：非误报 — Reviewer 对 Task、Fixture Requirements 与 Repair Fixture Handoff 的交叉引用成立。

## 整体评估结论

### 需要修订（阻塞进入开发）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 1 | explicit `update --repair` fixture ownership 仍可从 Epic 6 末端漂移出去 | [高] | P1 | 需闭合 repair ownership |
| 2 | Story 6.4 对 `skill-artifact-loop` 的矩阵要求与 6.5 后置边界冲突 | [高] | P1 | 需裁决 matrix 边界 |
| 3 | Story 6.5 缺少 deterministic skill activation harness 边界 | [中] | P1 | 需补 no-LLM harness |
| 4 | path-portability Story 将 repair path 字段纳入覆盖，但 repair fixture 是否存在仍未确定 | [中] | P1 | 需条件化或承接 repair |

### 建议纳入后续改善跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 无 | 无 | 无 | 无 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 |

### 评估决定

**整体结论**：需修订后再审

建议 SR-03 fixer 仅修订 Story 6.4 与 Story 6.5 的相关章节，并在必要时按人工决策同步 repair MVP gate 语义。推荐默认修订方向为：Story 6.4 承接 explicit repair fixture、为 `skill-artifact-loop` 只预留 typed pending slot；Story 6.5 创建 `skill-artifact-loop` gate 后补齐 matrix inclusion，并明确 deterministic no-LLM harness。

### SR-03 推荐修订项

| # | 涉及文件/章节 | 推荐修订方向 |
|---|--------------|-------------|
| 1 | `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` / Repair Fixture Handoff、Task 10 | 删除继续 handoff 到 subsequent scope 的表述；明确 6.4 承接 explicit repair fixture 与 `RepairCommandData` snapshots。 |
| 2 | `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` / Task 2、AC11 | 将 `skill-artifact-loop` 改为 typed pending/skip slot，不要求 6.4 在 6.5 前创建 gate。 |
| 3 | `_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md` / Task 2 | 明确 6.5 创建 gate 后补充 matrix inclusion，并与 6.4 runner wiring 对齐。 |
| 4 | `_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md` / Task 4、Task 5、Fixture Requirements | 补充 no-LLM、no-agent-runtime、fixture-owned deterministic writer、installed `SKILL.md` activation protocol 和 `speclite resolve` 断言。 |
| 5 | `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` / Task 4、Task 10、Path Portability Fixture Requirements | 将 repair path assertions 与 affected repair tests 绑定到 6.4 explicit repair fixture；若产品不选择 6.4 承接，则改为条件化并声明 deferred owner。 |

## 修订执行记录

### 修订执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 5

#### 修订项 #1: explicit `update --repair` fixture ownership 仍可从 Epic 6 末端漂移出去
- **文件**: `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md`
- **章节**: Acceptance Criteria、Task 9、Task 10、Repair Fixture Handoff
- **修改摘要**: 删除继续 handoff 到未定义 subsequent scope 的选择式表述，明确 6.4 承接 explicit repair fixture ownership；补充 `RepairCommandData` snapshots、human-readable repair plan block、post-repair validate guidance 等 explicit repair expected outputs。
- **状态**: 已完成

#### 修订项 #2: Story 6.4 对 `skill-artifact-loop` 的矩阵要求与 6.5 后置边界冲突
- **文件**: `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md`
- **章节**: AC11、Task 2
- **修改摘要**: 将 6.4 对 `skill-artifact-loop` 的要求从提前覆盖可运行 gate 改为 typed pending/skip slot、stable skip reason 与后续 inclusion hook，明确不要求 6.4 在 6.5 前创建 gate。
- **状态**: 已完成

#### 修订项 #3: Story 6.5 创建 `skill-artifact-loop` gate 后补充 matrix inclusion
- **文件**: `_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md`
- **章节**: Task 2、Task 9
- **修改摘要**: 明确 6.5 创建 `skill-artifact-loop` gate 后必须复用 6.4 runner wiring、Node `[22, 24]` policy、release evidence metadata 和 typed gate slot，将 6.4 pending/skip slot 转为实际 gate run evidence。
- **状态**: 已完成

#### 修订项 #4: Story 6.5 缺少 deterministic skill activation harness 边界
- **文件**: `_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md`
- **章节**: Task 4、Task 5、Skill Artifact Loop Fixture Requirements、Testing Requirements
- **修改摘要**: 补充 no-LLM、no-agent-runtime、无 IDE automation / network / 人工交互约束；明确 fixture harness 只以 installed `SKILL.md` activation protocol、`speclite resolve` 输出和 fixture input 为确定性输入，并通过受控 test skill 或 fixture-owned deterministic writer 生成 artifact。
- **状态**: 已完成

#### 修订项 #5: Story 6.4 repair path assertions 与 affected repair tests 绑定到 explicit repair fixture
- **文件**: `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md`
- **章节**: Task 4、Task 10、Path Portability Fixture Requirements、Testing Requirements
- **修改摘要**: 将 `repairPlan.actions[].affectedPath` 限定到 6.4 承接的 explicit `speclite update --repair --json` sub-scenario，并要求 affected repair tests 使用 `update.repair` 与 `RepairCommandData`，避免 repair path assertions 混入 normal update 或非 repair path-portability snapshots。
- **状态**: 已完成
