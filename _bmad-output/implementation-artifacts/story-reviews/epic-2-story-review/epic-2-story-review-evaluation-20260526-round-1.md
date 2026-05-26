---
Epic: 2
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: epic-2-story-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Story Review Evaluation
---

## 评估总结

本次评估仅针对 `_bmad-output/implementation-artifacts/story-reviews/epic-2-story-review/epic-2-story-review-summary-20260526-round-1.md` 的首轮 SR reviewer 结果。逐条核对 Story、owning SPEC 与 source CSV 后，reviewer 的 4 条新发现均有明确证据支撑，未发现误报。

整体判断为 reviewer 结论有效：Epic 2 当前不应直接进入开发。Finding 1 属于必须先人工裁决的跨 Story release-gate 归属问题；Finding 2-4 属于进入开发前应修订的 Story / fixture 口径闭合问题。

## 发现 #1 评估

### 审查原文

> **[高] resolver 依赖的 reverse validation / skill-artifact-loop 归属存在跨 Story 决策缺口**
> - 来源：consistency+contract
> - 分类：decision_needed
> - 涉及 Story：2-2、2-3、2-4
> - 证据 - Adapter SPEC 要求 installed entry reverse validation 证明离开 source checkout 后仍可 discovery，并能通过 `speclite resolve` 读取 config/customization（`_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 第 80 行）。Story 2.2 把 Story 2.4 resolver implementation 排除在范围外（`_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md` 第 150-154 行）；Story 2.3 在 Story 2.4 resolver 未实现时只验证 invocation boundary，不伪造 resolver success（`_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md` 第 100-104 行）。
> - 影响 - 若按 Adapter SPEC 执行，Story 2.2 / 2.3 的 fixture gate 依赖尚未实现的 Story 2.4；若按 Story 范围执行，则 Adapter SPEC 的 reverse validation 要求暂时无法满足。实现代理可能在 2.2 / 2.3 中越界实现 resolver，或留下 release-gate 断言缺口。
> - 建议 - 人工裁决：A) 将 resolver-dependent reverse validation 明确推迟到 Story 2.4 或 2.5，并在 Story 2.2 / 2.3 只断言 activation target / invocation boundary；或 B) 调整 Story 顺序/范围，把最小 resolver runtime 提前到 2.2 / 2.3 前。裁决后同步对应 AC、Tasks 和 fixture gate 描述。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Adapter SPEC 明确把 installed entry reverse validation 与 `speclite resolve` 可读性绑定在同一句要求中，而 Story 2.2 明确排除 Story 2.4 resolver implementation，Story 2.3 也仅允许验证 resolver invocation boundary。

**严重性判断**：合理 — 这是跨 Story release-gate 归属问题，不先裁决会导致实现代理在 2.2 / 2.3 越界实现 resolver，或让 Adapter SPEC 的 reverse validation 在本轮 Story 中不可测。

**修订建议**：可行 — reviewer 给出的 A/B 两种裁决路径都可执行；更保守的路径是把 resolver-success reverse validation 推迟到 Story 2.4 或 2.5，并在 2.2 / 2.3 明确只覆盖 entry layout、activation target 与 invocation boundary。

**误报评估**：非误报 — 证据来自 owning SPEC 与三个 Story 的范围边界，且属于多来源命中。

## 发现 #2 评估

### 审查原文

> **[中] `customize.toml` required layer 与 self-contained entry optional copy 规则未闭合**
> - 来源：consistency+contract
> - 分类：patch
> - 涉及 Story：2-2、2-4
> - 证据 - Story 2.2 只在 canonical source package 存在 `customize.toml` 时复制（`_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md` 第 15-20 行、第 85-91 行）；Story 2.4 将 `<skill-dir>/customize.toml` 定义为 required layer（`_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md` 第 23-29 行、第 113-122 行）。当前 source assets 中 53 个 `SKILL.md` package 只有 31 个 `customize.toml`，22 个 skill package 缺少 defaults。
> - 影响 - 若 `resolve customization` 被任何缺少 `customize.toml` 的 installed skill 调用，会变成 blocking required-layer failure；但 Story 2.2 并不保证所有 installed entries 都包含该文件。fixture 若随意选择 skill，可能出现非业务预期失败。
> - 建议 - 在 Story 2.4 明确 required `customize.toml` 的适用范围：只对声明 customization-capable 的 skill 调用；并在 Story 2.2 / 2.4 fixture 指定至少一个带 `customize.toml` 的 skill。若产品要求所有 installed skills 都可 customization，则需先补 source packages 或让 adapter 生成空 defaults，并同步 owning SPEC。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：基本准确 — Story 2.4 的 AC 前提是“已安装 skill 需要读取 workflow 或 agent customization”，并不必然表示所有 skill 都必须支持 customization；但 Story 2.2 的 optional copy 与 Story 2.4 的 required layer 之间确实缺少显式 selection / capability invariant。

**严重性判断**：合理 — 如果 fixture 或实现任意选择缺少 `customize.toml` 的 installed skill 调用 resolver，会把预期成功路径变成 required-layer failure，影响 AC2 与 resolve-parity fixture 的可测性。

**修订建议**：可行 — 应明确 customization-capable skill 的判定方式，并让 2.2 / 2.4 fixtures 选用带 `customize.toml` 的 canonical skill；若产品目标是全 skill 可 customization，则需要先更新 source package 或 SPEC，而不能在实现中隐式生成不受契约约束的 defaults。

**误报评估**：非误报 — reviewer 对 53 个 `SKILL.md` 与 31 个 `customize.toml` 的数量判断可复核，且 Story 间契约闭合确有缺口。

## 发现 #3 评估

### 审查原文

> **[中] `artifactContract` 从 `output-location` 派生的白名单和多输出策略不足**
> - 来源：structure+consistency
> - 分类：patch
> - 涉及 Story：2-1、2-5
> - 证据 - Manifest SPEC 要求 `defaultOutputPath` 是 project-relative POSIX path，并落在 `_speclite-output` 或 configured workflow artifact root（`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 第 121-127 行）。Story 2.5 要解析 `module-help.csv` / phase coverage / `artifactContract` 的 `output-location`（`_bmad-output/implementation-artifacts/2-5-workflow-artifact-output-and-metadata-validation.md` 第 87-92 行）。source `module-help.csv` 存在 `{planning_artifacts}|{project_knowledge}` 这类多输出和 `{project-root}/_speclite/_memory/...` 这类非 workflow artifact root（`assets/source/speclite/sdlc-skills/module-help.csv` 第 8 行、第 13-16 行）。
> - 影响 - 开发者可能把所有 `output-location` 都投影成 `artifactContract`，导致非 workflow artifact 或多路径输出进入单一 `artifactContract` shape；也可能各 Story 对 absent / diagnostic 的选择不一致。
> - 建议 - 在 Story 2.1 增加 `artifactContract` eligibility / normalization 矩阵：只允许可解析到 configured artifact root 的单一 project-relative output；多输出 rows 明确 absent 或 Post-MVP；`{project-root}/_speclite/custom`、`_memory` 等 control/custom paths 不进入 `artifactContract`。Story 2.5 复用同一规则并覆盖 fixture。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Manifest SPEC 对 `defaultOutputPath` 有明确根目录约束，Story 2.1 要从 source metadata / help rows / customization 读取 default output convention，Story 2.5 又要解析 `module-help.csv` / phase coverage / `artifactContract`。source CSV 中确实存在多输出与 `_speclite/_memory` 这类 control path。

**严重性判断**：合理 — 缺少 eligibility / normalization 矩阵会让 Story 2.1 与 Story 2.5 对 absent、diagnostic、multi-output、control path 的处理分叉，属于实现前必须收口的契约口径。

**修订建议**：可行 — 在 Story 2.1 定义单一 eligibility table，Story 2.5 复用该表并覆盖 fixture，是最小且边界清晰的修订方式。

**误报评估**：非误报 — 该问题由 structure 与 consistency 双来源命中，且 source CSV 提供了真实反例。

## 发现 #4 评估

### 审查原文

> **[中] 关键 SDLC 阶段覆盖矩阵缺少可执行的最小 phase-to-skill 清单**
> - 来源：structure+consistency
> - 分类：patch
> - 涉及 Story：2-1、2-3
> - 证据 - Story 2.1 / 2.3 要求覆盖 SPEC、方案评审、故事规划、实现、测试和审查等关键阶段（`_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md` 第 92-97 行；`_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md` 第 29-41 行）。source `module-help.csv` 的 phase 值是 `anytime`、`1-analysis`、`2-planning`、`3-solutioning`、`4-implementation`，测试和审查能力是同一 phase 内的 skill 行（`assets/source/speclite/sdlc-skills/module-help.csv` 第 19-43 行）。
> - 影响 - 如果没有明确最小矩阵，phase coverage generator、renderer 和 fixtures 可能各自理解“测试/审查/方案评审”的映射，导致缺失覆盖、重复覆盖或用 optional / anytime skill 伪造关键阶段覆盖。
> - 建议 - 在 Story 2.1 或 2.3 增加一张 MVP minimum coverage fixture table，列出每个关键阶段对应的 required `canonicalSkillId` 集合、source `phaseId`、expected missing behavior 和排序断言；避免 renderer 或 fixture snapshot 硬编码第二套映射。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 2.1 / 2.3 都要求覆盖关键研发能力，但 source CSV 的 `phase` 不是这些中文能力的一一对应枚举；例如 review 与 QA 都落在 `3-solutioning` 或 `4-implementation` 下的具体 skill 行。

**严重性判断**：合理 — 如果不指定最小 phase-to-skill 清单，generator、renderer、validator 与 fixture snapshot 可能各自硬编码不同映射，直接影响 AC3 / AC4 的可测性。

**修订建议**：可行 — 在 Story 2.1 或 2.3 增加 MVP minimum coverage fixture table 即可闭合，不需要扩大实现范围。

**误报评估**：非误报 — 该发现不是对 source CSV 的内容质量提出异议，而是要求 Story 明确如何把 source phase 与产品关键阶段语义映射。

## 整体评估结论

### 需要修订（阻塞进入开发）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 1 | resolver 依赖归属决策缺口 | [高] | P1 | 需先裁决 release gate |
| 2 | `customize.toml` required/optional 未闭合 | [中] | P1 | 需明确 capability 范围 |
| 3 | `artifactContract` 派生规则不足 | [中] | P1 | 需统一 eligibility 规则 |
| 4 | 最小 phase-to-skill 清单缺失 | [中] | P1 | 需闭合 fixture 映射 |

### 建议纳入后续改善跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| - | - | - | - | 本轮无降级为非阻塞的发现 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮未发现误报 |

### 评估决定

**整体结论**：需修订后再审

本轮 evaluator 确认 reviewer 的不通过结论成立。下一步应先裁决 Finding 1 的跨 Story release-gate 归属，再由 SR fixer 针对 Story 2.1-2.5 的 AC、Tasks 和 fixture gate 描述做最小修订；修订后再进入下一轮 SR reviewer / evaluator。

### 关于 defer 项的核对

被评估 reviewer 文件的“新发现”部分实际包含 1 条 `decision_needed` 与 3 条 `patch`，未包含单独编号的 `defer` 发现。文件“通过项”中提到当前仓库缺少实现锚点是已知既有问题、非本次 Story 文档新引入；本 evaluator 将其视为背景确认，不作为需要 Story 修订的新增发现。

## 修订执行记录

### 修订执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 4

#### 修订项 #1: resolver 依赖归属决策缺口
- **文件**: `_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md`; `_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md`; `_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md`; `_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md`; `_bmad-output/implementation-artifacts/2-5-workflow-artifact-output-and-metadata-validation.md`
- **章节**: Acceptance Criteria（验收标准）; Tasks / Subtasks（任务 / 子任务）; Scope Boundary（范围边界）; Previous Story Intelligence（前序 Story 情报）
- **修改摘要**: 采用保守方案 A：Story 2.2 / 2.3 只断言 self-contained entry layout、activation target 与 resolver invocation boundary；resolver success / config-customization access release gate 明确后移到 Story 2.4，full skill-artifact-loop gate 明确后移到 Story 2.5；Story 2.1 fixture 描述也改为只表达边界，不要求 resolver success。
- **状态**: 已完成

#### 修订项 #2: `customize.toml` required layer 与 optional copy 规则未闭合
- **文件**: `_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md`; `_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md`
- **章节**: Acceptance Criteria（验收标准）; Tasks / Subtasks（任务 / 子任务）; Self-Contained Entry Requirements（Self-Contained Entry 要求）; Customization Merge Requirements（Customization 合并要求）
- **修改摘要**: 明确 `customize.toml` 只在 source package 已包含时复制，并作为 customization-capable marker；Story 2.4 的 required defaults layer 只适用于 customization-capable installed entry；fixtures 必须选用带 `customize.toml` 的 canonical skill（如 `speclite-create-prd` 或 `speclite-create-story`）；禁止安装器或 resolver 生成 synthetic empty defaults。
- **状态**: 已完成

#### 修订项 #3: `artifactContract` output-location 派生规则不足
- **文件**: `_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md`; `_bmad-output/implementation-artifacts/2-5-workflow-artifact-output-and-metadata-validation.md`
- **章节**: Acceptance Criteria（验收标准）; Tasks / Subtasks（任务 / 子任务）; Artifact Contract Eligibility And Normalization（artifactContract 资格与归一化）; Previous Story Intelligence（前序 Story 情报）
- **修改摘要**: 在 Story 2.1 增加 `artifactContract` eligibility / normalization matrix：只有可解析到 configured artifact root 的单一 project-relative output 可进入 contract；多输出 rows 保持 absent / Post-MVP；`_speclite/custom`、`_speclite/_memory` 等 control/custom paths 不进入 contract。Story 2.5 明确复用同一矩阵并补 fixture 覆盖。
- **状态**: 已完成

#### 修订项 #4: 最小 phase-to-skill 覆盖矩阵缺失
- **文件**: `_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md`; `_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md`
- **章节**: Acceptance Criteria（验收标准）; Tasks / Subtasks（任务 / 子任务）; MVP Minimum Phase-To-Skill Coverage Matrix（MVP 最小阶段到 Skill 覆盖矩阵）; Phase Coverage Requirements（阶段覆盖要求）
- **修改摘要**: 补齐 MVP minimum phase-to-skill fixture table，列出 SPEC / PRD、方案评审、故事规划、实现、测试、Story design review 与 Code review 对应的 required `canonicalSkillId`、source `phaseId`、expected missing behavior 和排序断言；Story 2.3 明确复用 Story 2.1 的 table，renderer、validator 和 fixture snapshot 不得硬编码第二套映射。
- **状态**: 已完成
