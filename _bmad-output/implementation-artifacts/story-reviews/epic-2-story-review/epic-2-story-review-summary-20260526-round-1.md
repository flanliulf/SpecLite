---
Epic: 2
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Story Review Summary
Stories Reviewed: 5
---

## 审查结论

首轮审查。共审查 Epic 2 下 5 个 Story。审查层状态：Structure & Completeness Hunter、Consistency Checker、Contract & Boundary Auditor 三层均完成；未记录失败层。

- 通过：0 个
- 有条件通过：3 个
- 硬阻塞：2 个

总体判断：不通过。Epic 2 的 Story 结构完整，前置实现 gate、范围边界、测试约束和 owning SPEC 引用整体充分；但 Story 2.2 / 2.3 与 Story 2.4 的 resolver 依赖存在 release-gate 归属决策缺口，必须先裁决后再进入对应 Story 开发。其余问题属于可修补的文档边界收口。

## 审查范围

- Story 文件：
  - `_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md`
  - `_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md`
  - `_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md`
  - `_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md`
  - `_bmad-output/implementation-artifacts/2-5-workflow-artifact-output-and-metadata-validation.md`
- Epic 定义：
  - `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md`
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
  - `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
  - `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
  - `assets/source/speclite/core-skills/module-help.csv`
  - `assets/source/speclite/sdlc-skills/module-help.csv`
- 路径偏差记录：
  - `sr-config.md` 的 Story 文件目录是 `_bmad-output/implementation-artifacts/stories/`，但当前仓库不存在该目录。
  - 本轮按已确认事实使用真实存在的 `_bmad-output/implementation-artifacts/2-*.md` 作为 Epic 2 Story 输入。
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与架构文档一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互/认证/安全/性能口径
  - 跨 Epic 共享契约
  - Manifest / adapter / resolve / artifact owning SPEC 一致性

## 新发现

### 1. [高] resolver 依赖的 reverse validation / skill-artifact-loop 归属存在跨 Story 决策缺口
- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：2-2、2-3、2-4
- **证据** - Adapter SPEC 要求 installed entry reverse validation 证明离开 source checkout 后仍可 discovery，并能通过 `speclite resolve` 读取 config/customization（`_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 第 80 行）。Story 2.2 把 Story 2.4 resolver implementation 排除在范围外（`_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md` 第 150-154 行）；Story 2.3 在 Story 2.4 resolver 未实现时只验证 invocation boundary，不伪造 resolver success（`_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md` 第 100-104 行）。
- **影响** - 若按 Adapter SPEC 执行，Story 2.2 / 2.3 的 fixture gate 依赖尚未实现的 Story 2.4；若按 Story 范围执行，则 Adapter SPEC 的 reverse validation 要求暂时无法满足。实现代理可能在 2.2 / 2.3 中越界实现 resolver，或留下 release-gate 断言缺口。
- **建议** - 人工裁决：A) 将 resolver-dependent reverse validation 明确推迟到 Story 2.4 或 2.5，并在 Story 2.2 / 2.3 只断言 activation target / invocation boundary；或 B) 调整 Story 顺序/范围，把最小 resolver runtime 提前到 2.2 / 2.3 前。裁决后同步对应 AC、Tasks 和 fixture gate 描述。

### 2. [中] `customize.toml` required layer 与 self-contained entry optional copy 规则未闭合
- **来源**：consistency+contract
- **分类**：patch
- **涉及 Story**：2-2、2-4
- **证据** - Story 2.2 只在 canonical source package 存在 `customize.toml` 时复制（`_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md` 第 15-20 行、第 85-91 行）；Story 2.4 将 `<skill-dir>/customize.toml` 定义为 required layer（`_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md` 第 23-29 行、第 113-122 行）。当前 source assets 中 53 个 `SKILL.md` package 只有 31 个 `customize.toml`，22 个 skill package 缺少 defaults。
- **影响** - 若 `resolve customization` 被任何缺少 `customize.toml` 的 installed skill 调用，会变成 blocking required-layer failure；但 Story 2.2 并不保证所有 installed entries 都包含该文件。fixture 若随意选择 skill，可能出现非业务预期失败。
- **建议** - 在 Story 2.4 明确 required `customize.toml` 的适用范围：只对声明 customization-capable 的 skill 调用；并在 Story 2.2 / 2.4 fixture 指定至少一个带 `customize.toml` 的 skill。若产品要求所有 installed skills 都可 customization，则需先补 source packages 或让 adapter 生成空 defaults，并同步 owning SPEC。

### 3. [中] `artifactContract` 从 `output-location` 派生的白名单和多输出策略不足
- **来源**：structure+consistency
- **分类**：patch
- **涉及 Story**：2-1、2-5
- **证据** - Manifest SPEC 要求 `defaultOutputPath` 是 project-relative POSIX path，并落在 `_speclite-output` 或 configured workflow artifact root（`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 第 121-127 行）。Story 2.5 要解析 `module-help.csv` / phase coverage / `artifactContract` 的 `output-location`（`_bmad-output/implementation-artifacts/2-5-workflow-artifact-output-and-metadata-validation.md` 第 87-92 行）。source `module-help.csv` 存在 `{planning_artifacts}|{project_knowledge}` 这类多输出和 `{project-root}/_speclite/_memory/...` 这类非 workflow artifact root（`assets/source/speclite/sdlc-skills/module-help.csv` 第 8 行、第 13-16 行）。
- **影响** - 开发者可能把所有 `output-location` 都投影成 `artifactContract`，导致非 workflow artifact 或多路径输出进入单一 `artifactContract` shape；也可能各 Story 对 absent / diagnostic 的选择不一致。
- **建议** - 在 Story 2.1 增加 `artifactContract` eligibility / normalization 矩阵：只允许可解析到 configured artifact root 的单一 project-relative output；多输出 rows 明确 absent 或 Post-MVP；`{project-root}/_speclite/custom`、`_memory` 等 control/custom paths 不进入 `artifactContract`。Story 2.5 复用同一规则并覆盖 fixture。

### 4. [中] 关键 SDLC 阶段覆盖矩阵缺少可执行的最小 phase-to-skill 清单
- **来源**：structure+consistency
- **分类**：patch
- **涉及 Story**：2-1、2-3
- **证据** - Story 2.1 / 2.3 要求覆盖 SPEC、方案评审、故事规划、实现、测试和审查等关键阶段（`_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md` 第 92-97 行；`_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md` 第 29-41 行）。source `module-help.csv` 的 phase 值是 `anytime`、`1-analysis`、`2-planning`、`3-solutioning`、`4-implementation`，测试和审查能力是同一 phase 内的 skill 行（`assets/source/speclite/sdlc-skills/module-help.csv` 第 19-43 行）。
- **影响** - 如果没有明确最小矩阵，phase coverage generator、renderer 和 fixtures 可能各自理解“测试/审查/方案评审”的映射，导致缺失覆盖、重复覆盖或用 optional / anytime skill 伪造关键阶段覆盖。
- **建议** - 在 Story 2.1 或 2.3 增加一张 MVP minimum coverage fixture table，列出每个关键阶段对应的 required `canonicalSkillId` 集合、source `phaseId`、expected missing behavior 和排序断言；避免 renderer 或 fixture snapshot 硬编码第二套映射。

## 逐篇审查结论

### Story 2.1: Methodology Discovery Metadata Generation（方法论发现元数据生成）

**结论：有条件通过**

**优点**
- Canonical skill identity、phase coverage、help index、target order、diagnostics 和 artifact contract 均有明确 AC。
- 已明确当前仓库缺少实现锚点时必须停止，避免在 Epic 2 重建 Epic 1 scaffold。

**关键问题**
1. **artifactContract 派生规则不足** — 需要补充对 source `output-location` 的白名单、多输出和 absent 策略。
2. **关键阶段最小矩阵不足** — 需要明确 SPEC / 方案评审 / 故事规划 / 实现 / 测试 / 审查如何映射到 source `phaseId` 与 `canonicalSkillId`。

**建议动作**
- 在 Story 2.1 的 Task 4 / Task 5 补充最小 coverage table 和 artifactContract eligibility table。

### Story 2.2: IDE Skill Entry Mapping（IDE Skill Entry 映射）

**结论：硬阻塞**

**优点**
- Adapter target、target order、self-contained entry、hash、diagnostics 与 no branded target id 的边界清晰。
- 范围边界正确排除了 resolver、activation protocol 和 artifact validation 的实现越界。

**关键问题**
1. **resolver-dependent reverse validation 归属未裁决** — Adapter SPEC 要求的 `speclite resolve` reverse validation 与 Story 2.2 范围排除 Story 2.4 resolver 冲突。
2. **customize.toml optional copy 与后续 required resolver layer 未闭合** — 需避免缺少 defaults 的 installed skill 进入 customization resolver fixture。

**建议动作**
- 先裁决 Finding 1，再补充 fixture boundary：Story 2.2 只验证 target entry layout / hash / installed metadata，或明确依赖 Story 2.4 后再跑 resolver-dependent fixture。

### Story 2.3: Skill Activation And Phase Capability Coverage（Skill 激活与阶段能力覆盖）

**结论：硬阻塞**

**优点**
- Activation target 指向 installed `SKILL.md`、no source checkout dependency、menu-target diagnostics 和 phase evidence 的边界完整。
- 已明确 Story 2.4 未实现时只验证 resolver invocation boundary，不伪造 resolver success。

**关键问题**
1. **resolver-dependent reverse validation 仍需裁决** — Story 2.3 的 invocation-only 处理与 Adapter SPEC 的 resolver-readable reverse validation 要求需要显式对齐。
2. **关键 SDLC 阶段覆盖缺少 fixture-level 最小映射表** — 测试/审查能力不是独立 source phase，必须约束映射口径。

**建议动作**
- 在 Story 2.3 明确 activation-only vs resolver-success 的分界，并补充最小 phase-to-skill table。

### Story 2.4: Runtime Config And Customization Resolve（Runtime Config 与 Customization Resolve）

**结论：有条件通过**

**优点**
- Resolve stdout/stderr、exit code、missing key、repeat key、layer failure、array merge parity 和 Node/TypeScript runtime direction 与 owning SPEC 一致。
- 范围边界明确：不实现 Story 2.5 artifact writing，不修改 every source skill instruction。

**关键问题**
1. **customize.toml required layer 的适用范围未闭合** — 当前 source packages 并非全部带 `customize.toml`，Story 2.4 需要明确哪些 skills 允许调用 customization resolver。

**建议动作**
- 在 AC2 / Task 5 / fixture 中补充 customization-capable skill selection 或 required defaults invariant。

### Story 2.5: Workflow Artifact Output And Metadata Validation（Workflow Artifact 输出与 Metadata 校验）

**结论：有条件通过**

**优点**
- Artifact path、frontmatter、sidecar metadata、workflow-owned protection、artifact-path taxonomy 和 structural validation 边界清晰。
- 明确不验证叙事质量、不实现 dashboard、不扩大到 Epic 3 / Epic 4 / Epic 6。

**关键问题**
1. **artifactContract 输入规则需要与 Story 2.1 同步收口** — 否则 Story 2.5 解析 `module-help.csv` 时可能接收非 artifact root 或多输出字段。

**建议动作**
- Story 2.5 复用 Story 2.1 的 artifactContract eligibility table，并对 absent / diagnostic / multi-output 策略做 fixture 覆盖。

## 通过项

- Story 文件均包含 Story、Acceptance Criteria、Tasks / Subtasks、Dev Notes、Scope Boundary、Architecture Requirements、Testing Requirements 和 References。
- Epic 2 的五个 Story 均记录当前仓库缺少 `package.json` / `src` / `test` / fixture harness 的前置状态，并要求前序实现缺失时停机；这是已知既有问题，非本次 Story 文档新引入。
- `agents` target generic semantics、no `copilot` / `cursor` target id、canonical target order、project-relative POSIX path、reserved issue ids、no external network tests 等关键边界在 Story 和 owning SPEC 中基本一致。
- `_bmad-output/project-context.md` 当前为初始化占位内容；本轮以 live PRD / Architecture / UX / owning SPEC artifacts 作为实际 guardrails，未将占位 context 误判为缺陷。
