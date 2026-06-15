---
Epic: 8
Scope: epic
Round: 1
Date: 2026-06-15
Model Used: GPT-5 (codex)
Type: Story Review Summary
Stories Reviewed: 7
---

## Review Conclusion（审查结论）

首轮审查。共审查 Epic 8 下 7 个 Story。审查层状态：0/3 个 Agent 子审查层完成；当前 Codex 工具环境未提供 `Agent` 子代理工具，已按 `review-engine.md` B0 降级为单一 LLM 回退审查，覆盖结构完整性、AC 可测性、Epic 一致性、架构一致性、Story 间冲突与依赖、任务拆分、交互/安全/性能口径、跨 Epic 共享契约八个维度。失败/不可用层：`structure`、`consistency`、`contract` 子代理层。

- 通过：2 个
- 有条件通过：4 个
- 硬阻塞：1 个

总体判断：有条件通过，但 Story 8.5 存在 1 个必须先裁决的高严重性契约问题。Epic 8 的总体 Story 结构、Anchor Contract Map、Evidence Plan 和 implementation order 基本完整；`install`、`update`、`status`、`validate`、`resolve`、catalog、fixture/docs 的职责拆分可继续推进。进入开发前建议先处理 Story 8.5 的 `resolve` 默认 pure JSON 例外与 human output mode 触发方式，再修补 Story 8.3、8.4 和 8.1/8.6 的文档级 patch。

## Review Scope（审查范围）

- Story 文件：
  - `_bmad-output/implementation-artifacts/stories/8-1-shared-cli-outcome-and-presentation-contract.md`
  - `_bmad-output/implementation-artifacts/stories/8-2-install-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-4-status-and-validate-human-output-separation.md`
  - `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
  - `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`
- Epic 定义：
  - `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
  - `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
  - `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
  - `_bmad-output/planning-artifacts/ux-install-cli-interaction-spec-2026-06-12.md`
  - `_bmad-output/implementation-artifacts/stories/1-7-install-cli-interaction-and-localized-human-output.md`
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与架构文档一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互/认证/安全/性能口径
  - 跨 Epic 共享契约
  - `CommandResult`、`resolve` pure JSON、message catalog、fixture stable comparison 和 docs 示例契约边界

分批说明：Epic 模式下 Story 数量为 7，已按 SR-01 要求分两批审查。Batch 1 覆盖 Story 8.1-8.5；Batch 2 覆盖 Story 8.6-8.7，并回看 Batch 1 的 shared frame、catalog、Next Actions 和 fixture/docs 口径，确保跨批次一致。

说明：`sr-config.md` 示例命名中的 `_bmad-output/planning-artifacts/epics/epic-8.md` 不存在；本轮按用户指定和实际文件匹配 `*epic-8*`，使用 `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md` 作为 Epic 8 定义，未创建兼容副本，也未重命名文件。

## New Findings（新发现）

### 1. [高] Story 8.5 的 unresolved human outcome 与 resolve 默认 missing-key / pure JSON 契约存在未决冲突

- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：8-5
- **证据** - Story 8.5 AC3 要求 resolver 无法返回请求值时 outcome 为 `unresolved`，且 `Issues` 包含 `reason`、`missing key` 或 `failed layer`（`_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md` 第 27-31 行）。同一 Story 的 Dependency Gate 承认现有 resolve contract 要求 stdout pure JSON、Epic 8 又要求 human-readable result，不能直接改默认 stdout（第 85-88 行）。而 canonical resolve contract 明确 stdout 只能包含 resolved JSON object，machine mode stderr 不能混入 human-readable prose（`_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 第 30-39 行），并规定默认 missing key 行为是 stdout `{}`、exit code 0、stderr 为空（第 59-68 行）。Architecture 也把 `resolve` 定义为 runtime support command，stdout 必须只输出解析结果 JSON（`_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md` 第 96-100 行）。
- **影响** - 如果开发者按 AC3 直接把默认 missing key 渲染为 `unresolved` / `Issues`，会破坏 installed skills 依赖的 resolve automation contract；如果开发者选择新增 human mode，又缺少明确触发方式、flag 名称、strict missing-key 语义和 SPEC 更新范围，容易在实现时自行做设计决策。
- **建议** - 在 Story 8.5 进入开发前先裁决并写入 Story：默认 `resolve config/customization` 继续 pure JSON；human-readable mode 通过哪个显式入口触发；`missing key` 在默认模式下是否仍保持 `{}` / exit 0；`unresolved` 只适用于 required layer failure、显式 strict/human mode，还是需要先变更 `06-resolve-command-contract.md`。

### 2. [中] Story 8.3 缺少 `partial-or-failed` 的验收标准

- **来源**：structure+consistency
- **分类**：patch
- **涉及 Story**：8-3
- **证据** - Epic 8 的 Update / Repair outcome taxonomy 包含 `partial-or-failed`，语义是写入或 repair 执行失败，需要人工处理（`_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md` 第 86-95 行）。Story 8.3 AC 当前只覆盖 `plan-ready`、`no-op`、`blocked-by-conflict`、`repair-plan-ready` 和 `applied`（`_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md` 第 15-45 行）。Task 2 要求 renderer 支持 `partial-or-failed`（第 54-57 行），Task 4 也提到 operation-lock failure 和 JSON stability（第 64-67 行），但 AC 没有定义该 outcome 的触发条件和可验收输出。
- **影响** - 写入阶段失败、partial apply、operation-lock blocker、safe write failure 等失败路径可能只被 task/test 暗示，而没有 AC 级验收口径；后续实现与 reviewer 可能无法判断 Summary、Evidence、Issues 和 Next Actions 是否达标。
- **建议** - 给 Story 8.3 增加独立 AC：当 update/repair 已进入或准备进入写入阶段但发生 apply/safe-write/operation-lock/partial failure 时，human output outcome 为 `partial-or-failed`，必须展示已完成写入、失败步骤或 blocker、未执行项、受保护边界和具体人工恢复/验证动作。

### 3. [中] Story 8.4 的 status outcome 与 `highLevelHealth` contract 缺少确定性映射

- **来源**：consistency+contract
- **分类**：patch
- **涉及 Story**：8-4
- **证据** - Story 8.4 AC1 要求 status outcome 来自 `installed`、`not-installed`、`stale`、`partial`、`failed` 或 `unknown`（`_bmad-output/implementation-artifacts/stories/8-4-status-and-validate-human-output-separation.md` 第 15-19 行）。CommandResult contract 当前只允许 `status.data.highLevelHealth` 为 `not-configured`、`configured`、`partial`、`failed`，并给出 deterministic aggregation order（`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 第 184-204 行）。Story 8.4 Dependency Gate 虽说明若需要 `stale` 或 `unknown` 超出现有 values，应实现为 human-derived label 或先更新 SPEC（第 87-91 行），但 AC/Tasks 没有提供 mapping table。
- **影响** - 开发者可能把 `stale` / `unknown` 当成新的 public JSON health value，或反过来把所有非 configured 状态粗略映射为失败；这会冲击 `status` lightweight、local-only 和“不自动创建 warning issues”的契约。
- **建议** - 在 Story 8.4 增加确定性映射表，例如 `configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`；同时明确 `stale` / `unknown` 的证据来源、是否仅为 human-derived label、是否需要更新 `01-command-result-json-contract.md` 或 validation taxonomy。

### 4. [低] Story 8.1 与 Story 8.6 对 message catalog / Next Actions 的职责边界仍可能重叠

- **来源**：structure+consistency
- **分类**：patch
- **涉及 Story**：8-1, 8-6
- **证据** - Story 8.1 Task 3 要扩展 `src/cli/messages.ts`，至少支持 `zh-CN` 默认和 `en-US` fallback，并让 empty states 使用 catalog（`_bmad-output/implementation-artifacts/stories/8-1-shared-cli-outcome-and-presentation-contract.md` 第 51-55 行）；Task 4 又要求迁移 install/status/validate/update human renderers 到 shared primitive（第 56-59 行）。Story 8.6 Task 1/2 也要求为 install/update/status/validate/resolve 提供 `zh-CN` / `en-US` catalog、建立 Next Actions builder（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md` 第 41-49 行），Dependency Gate 只说要避免重复定义同一文案 key（第 86-90 行）。
- **影响** - 8.1 和 8.6 可能分别定义 command-specific catalog keys、Next Actions priority 或 empty-state 文案，造成后续迁移时重复 key、重复 builder 或 renderer 分叉。
- **建议** - 在 Story 8.1 明确其 ownership 是 shared output frame、primitive、key namespace / fallback resolver 和最小 common empty-state；Story 8.6 ownership 是 command-specific catalog 填充、localized Next Actions builder、locale propagation 和跨命令去重。若 8.1 需要先实现最小 catalog，应要求 8.6 只扩展同一 registry。

## Per-Story Review Conclusion（逐篇审查结论）

### Story 8.1: Shared CLI Outcome And Presentation Contract（共享 CLI Outcome 与展示契约）

**结论：有条件通过**

**优点**
- 结构完整，AC 覆盖 shared title、outcome、Summary、Next Actions、中文技术标识保留、empty state 和 JSON semantic parity。
- Scope Boundary 明确不新增 GUI/TUI、不把 human outcome label 写入 JSON、不改变 command core behavior。

**关键问题**
1. **与 Story 8.6 的 catalog / Next Actions ownership 需要再收紧** - 8.1 已要求扩展 `src/cli/messages.ts` 和迁移 renderer，但 8.6 也承担全命令 catalog 与 Next Actions builder。

**建议动作**
- 在 Story 8.1 补一句 shared primitive 与 key registry ownership，避免 command-specific 文案在 8.1 和 8.6 两处重复定义。

### Story 8.2: Install Outcome-Oriented Output（Install Outcome 导向输出）

**结论：通过**

**优点**
- AC 覆盖 `prewrite-paused`、`blocked-before-write`、`write-failed`、`ready-check-failed` 和 `ready`，与 Epic 8 install outcome taxonomy 对齐。
- 明确保护 Story 1.7 的 no-prompt、locale、prompt separation、NO_COLOR/non-TTY/CI 语义，并保持 `install --json` schema 不变。

**关注点**
- 依赖 Story 8.1 的 shared frame；若 8.1 尚未完成，8.2 只能建立最小等价 primitive，不能另起 renderer/catolog 分支。

### Story 8.3: Update And Repair Outcome-Oriented Output（Update 与 Repair Outcome 导向输出）

**结论：有条件通过**

**优点**
- 明确保持 update/repair safety semantics，不允许 ordinary `--yes` 绕过 conflicts，也不把普通 update 隐藏成 repair。
- Anchor Contract Map 对 `CommandResult`、install plan/write authorization、update plan source 和 human renderer 的引用方向正确。

**关键问题**
1. **`partial-or-failed` 缺少 AC 级验收** - Epic outcome taxonomy 已包含该 outcome，但 Story AC 没有覆盖失败/partial apply 输出。

**建议动作**
- 增加 `partial-or-failed` AC，并将 operation-lock / safe write / partial execution failure 的 Summary、Evidence、Issues、Next Actions 口径写清楚。

### Story 8.4: Status And Validate Human Output Separation（Status 与 Validate 人类输出分层）

**结论：有条件通过**

**优点**
- 清楚区分 `status` 的 lightweight direction 和 `validate` 的完整 diagnostics，不让 status 隐式执行 full validation、remote source access、update check 或 repair planning。
- 对 `CommandResult.status` 与 installation health 的区别有明确 AC，契合 command-result contract。

**关键问题**
1. **status outcome mapping 不够确定** - Story 使用 `installed` / `not-installed` / `stale` / `unknown` 等 human outcome，但 contract 当前 `highLevelHealth` values 不同。

**建议动作**
- 增加 human outcome mapping table，并明确 `stale` / `unknown` 是否需要 SPEC 变更或仅为 renderer 派生标签。

### Story 8.5: Resolve Command Support Output（Resolve 命令支持输出）

**结论：硬阻塞**

**优点**
- Story 已识别 `resolve` 是 runtime support command，明确默认 pure JSON stdout 不能被破坏。
- Anchor Contract Map 正确引用 `06-resolve-command-contract.md`、`01-command-result-json-contract.md` 和 resolve parser/schema anchors。

**关键问题**
1. **`unresolved` / human mode 触发方式未裁决** - AC3 与 default missing-key contract 仍可能冲突，Dependency Gate 要求先处理该冲突，但 Story 未给出确定设计。

**建议动作**
- 先完成设计裁决：human-readable resolve mode 的入口、默认 missing-key 行为、`unresolved` 的适用范围、SPEC/schema/fixtures 更新范围。未裁决前不建议让 Story 8.5 进入开发。

### Story 8.6: Localized Next Actions And Message Catalog（本地化 Next Actions 与消息目录）

**结论：有条件通过**

**优点**
- AC 覆盖默认 `zh-CN`、`en-US` fallback、target/display path、安全优先级排序、issue id/category 到本地化 action 映射，并保护 JSON/exit code/path normalization。
- Scope Boundary 明确不把 catalog 变成 plugin system、remote translation service 或 user-editable runtime customization。

**关键问题**
1. **与 Story 8.1 的 catalog ownership 需对齐** - 8.6 应消费并扩展 8.1 的 shared registry，而不是另建文案 key / builder 分支。

**建议动作**
- 在 Dependency Gate 或 Equivalent Implementation Policy 中明确：8.6 只扩展 8.1 定义的 catalog registry 与 Next Actions primitive；重复 key 视为需要修正的设计问题。

### Story 8.7: Human Output Fixture And Documentation Matrix（人类输出 Fixture 与文档矩阵）

**结论：通过**

**优点**
- AC 覆盖 focused tests、JSON contract stability、NO_COLOR/non-TTY/CI/narrow terminal 语义和 docs 示例一致性。
- Scope Boundary 清楚说明不再新增 outcome vocabulary、不改变 command core behavior 或 JSON schema、不把 docs 示例变成唯一 contract source。

**关注点**
- 若 Story 8.1-8.6 尚未全部完成，8.7 应按自身 Dependency Gate 保留 matrix TODO，而不是伪造 coverage。

## Passed Checks（通过项）

- 7 个 Story 均包含 Story、Acceptance Criteria、Tasks / Subtasks、Dev Notes、Dependency Gate、Anchor Contract Map、Equivalent Implementation Policy、Evidence Plan、Anchor Evidence Summary、Dev Agent Record 和 Change Log。
- Epic 8 的 corrective planning 边界表达一致：不新增 GUI/TUI，不改变 command core behavior，不让 human-readable 文案成为 automation contract。
- `CommandResult` JSON、exit code、issue ordering、path normalization、fixture stable comparison 和 public JSON schema 的保护在多数 Story 中都有明确约束。
- Story 8.2 与 Story 1.7 的 install locale/prompt/no-prompt 基础衔接清晰，未发现对已完成 install interaction contract 的反向要求。
- Story 8.7 对 fixture/docs coverage 的定义与 `08-fixture-contract.md` 的 stable comparison 和 release gate 思路一致。
- 已知既有问题，非本次 Story 引入：`_bmad-output/project-context.md` 仍处于 initialized / placeholder 状态，未提供实质项目规则；本轮已使用 architecture/specs/UX/prior Story 作为主要可执行基准，因此不阻断 Epic 8 SR 结论。
