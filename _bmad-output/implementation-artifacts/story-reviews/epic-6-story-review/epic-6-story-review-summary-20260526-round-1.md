---
Epic: 6
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Story Review Summary
Stories Reviewed: 5
---

## 审查结论

首轮审查。共审查 Epic 6 下 5 个 Story。审查层状态：Structure & Completeness Hunter、Consistency Checker、Contract & Boundary Auditor 三层均完成；未记录失败层。

- 通过：1 个
- 有条件通过：2 个
- 硬阻塞：2 个

总体判断：不通过。Epic 6 的五个 Story 已经把 fixture contract、fresh/update gates、source integrity、resolve parity、path portability、packaging acceptance 和 skill artifact loop 的主线拆开，并且普遍保留了 owning SPEC first、local-only、Node 22/24、redaction 和不伪造源码完成状态的边界。但 explicit `update --repair` fixture ownership 仍可能从 6.2/6.3 漂移出 Epic 6，且 Story 6.4 同时要求 runtime matrix 覆盖最小 `skill-artifact-loop`、又禁止提前实现 Story 6.5，形成跨 Story 执行顺序阻塞。进入开发前需要先裁决这两处 release-gate 归属。

## 审查范围

- Story 文件：
  - `_bmad-output/implementation-artifacts/6-1-fixture-case-layout-and-expected-output-contract.md`
  - `_bmad-output/implementation-artifacts/6-2-fresh-install-and-existing-update-fixture-gates.md`
  - `_bmad-output/implementation-artifacts/6-3-drift-source-integrity-and-resolve-parity-fixtures.md`
  - `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md`
  - `_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md`
- Epic 定义：
  - `_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
  - `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
  - `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
  - `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
  - `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
  - `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
  - `_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md`
  - `_bmad-output/implementation-artifacts/2-5-workflow-artifact-output-and-metadata-validation.md`
- 路径偏差记录：
  - `sr-config.md` 的 Story 文件目录是 `_bmad-output/implementation-artifacts/stories/`，但当前仓库不存在该目录。
  - 本轮沿用现有 Epic 2 SR 的事实口径，使用真实存在的 `_bmad-output/implementation-artifacts/6-*.md` 作为 Epic 6 Story 输入。
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与架构文档一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互/认证/安全/性能口径
  - 跨 Epic 共享契约
  - Fixture gate / release checklist / regression asset ownership
  - Explicit repair、skill artifact loop、packaging acceptance 与前序 Epic 契约边界

## 新发现

### 1. [高] explicit `update --repair` fixture ownership 仍可从 Epic 6 末端漂移出去
- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：6-2、6-3、6-4
- **证据** - Story 6.2 明确普通 `existing-install-update` 不覆盖 `update --repair`，并把 repair fixture ownership handoff 给 Story 6.3 / 6.4（`_bmad-output/implementation-artifacts/6-2-fresh-install-and-existing-update-fixture-gates.md` 第 63-67 行、第 108-112 行、第 225-228 行）。Story 6.3 默认不实现 repair execution fixture，并把 remaining expected outputs handoff 给 Story 6.4（`_bmad-output/implementation-artifacts/6-3-drift-source-integrity-and-resolve-parity-fixtures.md` 第 143-148 行、第 313-318 行）。Story 6.4 又允许如果不覆盖 explicit repair，则继续记录 handoff 到 subsequent repair fixture scope（`_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` 第 242-245 行），但 Epic 6 没有 6.6 或后续 repair Story。CommandResult SPEC 已把 `speclite update --repair --json` 定义为 MVP 命令，要求 `command: "update.repair"` 和 `RepairCommandData`（`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 第 76-82 行、第 106-110 行），并要求 `RepairPlan` 只包含 installer-owned actions、每个 repair action 有 `expectedHash`（第 493-512 行）。
- **影响** - release gate 可能只验证 normal update conflict、validate next action 和 source/resolve/path portability，却没有任何 Story 真正拥有 explicit repair expected outputs。实现代理可能把 repair 误塞进 normal update / validate fixture，或把 `RepairCommandData` 留到未定义的后续范围，导致 MVP 命令契约与 Epic 6 release confidence 脱节。
- **建议** - 人工裁决：A) 将 explicit repair fixture 强制归属 Story 6.4，并删除或改写 “handoff to subsequent repair fixture scope” 表述；或 B) 明确 Epic 6 不阻塞 repair execution fixture，并同步降级 CommandResult / fixture SPEC 的 MVP gate 语义。若选择 A，Story 6.4 至少应覆盖 IDE mirror drift repair、missing-source-evidence conflict、human/workflow protected paths、`RepairCommandData` snapshots、human-readable repair plan block 和 post-repair validate guidance。

### 2. [高] Story 6.4 对 `skill-artifact-loop` 的矩阵要求与 6.5 后置边界冲突
- **来源**：structure+consistency
- **分类**：decision_needed
- **涉及 Story**：6-4、6-5
- **证据** - Fixture SPEC 将 `skill-artifact-loop` 列为 MVP release gate，并要求 release gate fixtures 在 Node 22/24 上通过（`_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 第 29-35 行、第 49-51 行）。Story 6.4 Task 2 要求 runtime matrix 覆盖 `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity`、`resolve-parity`、`path-portability` 和最小 `skill-artifact-loop` 的可运行性边界（`_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` 第 90-94 行）。同一 Story 的 AC11 又明确不得提前实现 Story 6.5 `skill-artifact-loop` release gate 或 documentation examples（第 76-80 行）。Story 6.5 才创建 / 扩展 `test/fixtures/skill-artifact-loop/` 并把它注册为 fixture project release gate（`_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md` 第 66-70 行）。
- **影响** - 若按 Story 6.4 执行，开发者需要在 6.5 之前把 matrix 指向一个尚未创建的 release gate；若按 6.5 后置边界执行，6.4 的 matrix evidence 又无法完整满足 fixture SPEC。CI/release evidence wiring 可能在 6.4 伪造 placeholder gate、跳过 `skill-artifact-loop`，或越界实现 6.5。
- **建议** - 人工裁决矩阵边界：Story 6.4 应只实现 matrix runner 支持与已存在 gate 的 evidence，并为 `skill-artifact-loop` 预留 typed gate slot / skip reason；Story 6.5 在创建 gate 后补充 matrix inclusion。或者调整顺序，把最小 `skill-artifact-loop` gate 先于 6.4 完成。裁决后同步 6.4 Task 2、AC11 和 6.5 Task 2 的 wording。

### 3. [中] Story 6.5 缺少 deterministic skill activation harness 边界，容易把 fixture gate 误解为 LLM workflow 执行
- **来源**：structure+contract
- **分类**：patch
- **涉及 Story**：6-5
- **证据** - Story 6.5 要求 fixture 激活 installed skill、通过 installed runtime support 读取 config/customization，并在最小闭环中写出 planning / review artifact（`_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md` 第 21-31 行、第 78-88 行）。同一 Story 的 fixture requirements 要求 activation 使用 installed `SKILL.md` 与相邻 resources，并从 on-disk metadata 验证 artifact（第 188-203 行）。但前序 Story 2.3 已明确 fixture 不需要由 LLM 实际执行完整 workflow 文案，只验证 installed IDE entry discovery、activation protocol、resolver access 边界和 artifact metadata 值域（`_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md` 第 103-107 行）。Fixture SPEC 也把 `skill-artifact-loop` 限定为 installed entry discovery、activation protocol、resolver access 和 artifact metadata 值域，不包括复杂 workflow 叙事质量或人工评审结论（`_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 第 39-41 行）。
- **影响** - 开发者可能尝试在 Vitest/fixture runner 内驱动真实 agent/LLM，造成不确定、不可离线、不可 CI 的 release gate；也可能反向伪造 artifact pass，绕过 installed activation protocol。两种实现都会削弱 release confidence。
- **建议** - 在 Story 6.5 Task 4 / Task 5 补充 deterministic harness 约束：fixture 只读取 installed `SKILL.md` 的 activation protocol 起点、调用 `speclite resolve`、并通过受控 test skill 或 fixture-owned minimal workflow writer 生成带 metadata 的 artifact；不得调用 LLM，不得依赖 agent runtime，不得用 source checkout prompt 直接生成 artifact。若需要新增最小阶段化 skill，必须同步 source metadata、manifest/help/phase coverage、fixtures 和 packaging inventory。

### 4. [中] path-portability Story 将 repair path 字段纳入覆盖，但 repair fixture 是否存在仍未确定
- **来源**：consistency
- **分类**：patch
- **涉及 Story**：6-4
- **证据** - Story 6.4 Task 4 要求 public path fields 覆盖 `repairPlan.actions[].affectedPath`（`_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` 第 106 行），Task 10 又要求运行 affected update/repair tests（第 143 行）。但 Story 6.4 的 Path Portability Fixture Requirements 只在“本 Story 选择覆盖 repair handoff”时才包含 explicit `update --repair` 场景（第 203-204 行），Repair Fixture Handoff 也允许不覆盖并继续 handoff（第 242-245 行）。
- **影响** - 如果 evaluator 允许 Story 6.4 不实现 explicit repair fixture，Task 4 / Task 10 仍会要求 repair path assertions，导致测试计划不可执行；如果实现者为了满足 path assertions 隐式创建 repair fixture，又会触碰 Finding 1 的 ownership 决策。
- **建议** - 将 Story 6.4 的 repair path coverage 改成条件化：仅当本 Story 承接 explicit repair fixture 时覆盖 `repairPlan.actions[].affectedPath` 和 affected repair tests；否则必须输出明确 deferred evidence item，并说明由哪个 Story / gate 补齐。

## 逐篇审查结论

### Story 6.1: Fixture Case Layout And Expected Output Contract（Fixture Case 布局与 Expected Output 契约）

**结论：通过**

**优点**
- 结构完整，覆盖 stable layout、expected output classes、semantic comparison、path/timestamp/randomness policy、human output profile、release gate classification 和 snapshot update discipline。
- 能正确引用 fixture SPEC、CommandResult、manifest/index、resolve 和 validation taxonomy，且没有越界实现后续 6.2-6.5 的完整 fixture matrix。

**关注点**
- Story 6.1 把全部 release gates 固化为 registry-driven data 是合理 foundation，但后续 6.4/6.5 的 gate readiness 仍需按 Finding 2 收口。

### Story 6.2: Fresh Install And Existing Update Fixture Gates（Fresh Install 与 Existing Update Fixture Gate）

**结论：有条件通过**

**优点**
- fresh install、ReadyCheck、normal existing update、human-owned custom 保护、workflow-owned artifact 保护和 installer-owned drift conflict 的边界清晰。
- 已明确 normal `existing-install-update` 不混入 repair，并把 repair ownership handoff 作为显式项记录。

**关键问题**
1. **repair fixture ownership 仍依赖后续 Story 裁决** — Story 6.2 自身边界合理，但必须由 6.3/6.4 明确接住 explicit repair expected outputs，否则 Epic 6 末端会留下 release-gate 缺口。

**建议动作**
- 保持 Story 6.2 不覆盖 `update --repair` 的边界；在 evaluator 中重点检查 Finding 1 是否被 6.4 强制承接或显式降级。

### Story 6.3: Drift, Source Integrity And Resolve Parity Fixtures（Drift、来源完整性与 Resolve Parity Fixtures）

**结论：有条件通过**

**优点**
- `ide-drift`、`source-integrity` required sub-cases 和 `resolve-parity` 的 fixture group / case 边界与 fixture SPEC 基本一致。
- source trust、redaction、local-only deterministic tests、resolver stdout/stderr 例外和 Python parity baseline 的口径较完整。

**关键问题**
1. **repair fixture 默认继续 handoff 到 6.4** — 这在 Story 6.3 内部可接受，但必须由 Story 6.4 最终闭合，不能继续漂移。

**建议动作**
- 保持 validate/source/resolve 不输出 `RepairCommandData`；在 handoff 处明确“6.4 必须最终决定 cover or downgrade”，避免无边界后移。

### Story 6.4: Path Portability And Runtime Matrix Evidence（路径可移植性与运行时矩阵证据）

**结论：硬阻塞**

**优点**
- Node 22/24、macOS/Windows、path portability、LF、executable intent、case conflict、symlink/path escape、terminal width、NO_COLOR、packaging acceptance 和 performance evidence 的范围完整。
- 正确区分 `packaging-acceptance` release checklist gate 与 `path-portability` fixture project gate。

**关键问题**
1. **explicit repair fixture ownership 可继续漂移** — Story 6.4 是 6.2/6.3 handoff 的最后明确落点，但仍允许继续 handoff 到未定义的 subsequent scope。
2. **matrix coverage 与 6.5 deferred scope 冲突** — 6.4 同时要求覆盖 `skill-artifact-loop` 可运行性，又禁止提前实现 6.5 gate。
3. **repair path assertions 与 repair fixture optionality 不一致** — 如果不实现 repair fixture，`repairPlan.actions[].affectedPath` 和 affected repair tests 没有可执行输入。

**建议动作**
- 先裁决 Finding 1 / Finding 2，再允许 Story 6.4 进入 dev。最小修订是：6.4 必须承接 explicit repair fixture，且只为 6.5 gate 留 matrix slot；6.5 创建 gate 后补齐 runtime matrix evidence。

### Story 6.5: Skill Artifact Loop And Documentation Examples（Skill Artifact Loop 与文档示例）

**结论：硬阻塞**

**优点**
- installed entry discovery、resolver access、artifact metadata、documentation examples、packaged documentation example classification 与前序 Story / SPEC 的边界基本齐全。
- 明确禁止 Python resolver、source checkout path、second merge logic、docs schema duplication 和 Post-MVP governance 扩张。

**关键问题**
1. **需要先解除 6.4 对 `skill-artifact-loop` 的前向依赖** — 否则 6.5 的 gate 创建与 6.4 matrix evidence 谁先完成不清晰。
2. **deterministic activation harness 需要补强** — Story 6.5 需要更明确地说明 fixture 如何在不执行 LLM workflow 的情况下证明 activation protocol、resolver access 和 artifact write。

**建议动作**
- 在 Story 6.5 Task 4 / Task 5 增加 deterministic, no-LLM harness 描述；同时让 6.4 的 matrix runner 等 6.5 gate 存在后再收集完整 gate evidence。

## 通过项

- 5 个 Story 均包含 Story、Acceptance Criteria、Tasks / Subtasks、Dev Notes、Scope Boundary、Architecture Requirements、Testing Requirements 和 References / Project Context Reference 等必要章节。
- Story 6.1-6.5 都反复强调当前 ready-for-dev Story context 不是 actual implementation evidence，并要求 dev agent 重新检查 `package.json`、`src/`、`test/`、`fixtures/` 等实际源码锚点；这是正确的前置风险控制。
- `_bmad-output/project-context.md` 当前为 initialized placeholder；本轮以 live PRD / Architecture / owning SPEC / 前序 Story 作为实际 guardrails，未将占位 context 误判为缺陷。
- Epic 6 对 `packaging-acceptance` 的 release checklist gate 与 fixture project gate 分类基本正确，未把它错误建模为 `test/fixtures/packaging-acceptance/`。
- Node 22 minimum + Node 24 recommended、Node 26 不进 MVP baseline、local-only deterministic tests、redaction everywhere、project-relative POSIX paths、no external network、no source checkout dependency 等全局边界在 Story 之间基本一致。
