---
Epic: 1
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Story Review Summary
Stories Reviewed: 6
---

## 审查结论

首轮审查。共审查 Epic 1 下 6 个 Story。审查层状态：0/3 个 Agent 子审查层完成；当前环境未提供 `Agent` 工具，因此已降级为单一 LLM 回退审查，并按 structure / consistency / contract 三个维度完成交叉审查。

- 通过：3 个
- 有条件通过：1 个
- 硬阻塞：2 个

总体判断：不建议直接进入 Epic 1 全量开发。Story 1.1、1.2、1.4 的结构和边界基本可执行；Story 1.3 需要先明确 pre-write JSON 契约；Story 1.5 和 Story 1.6 存在会阻断 fresh install 闭环的设计缺口，尤其是 operation lock bootstrap、默认 SDLC 模块缺少 canonical skill packages、以及 progress lifecycle 顺序与前序 gate 不一致。

## 审查范围

- Story 文件：
  - `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`
  - `_bmad-output/implementation-artifacts/1-2-project-target-directory-resolution-and-existing-install-detection.md`
  - `_bmad-output/implementation-artifacts/1-3-official-module-selection-and-install-summary.md`
  - `_bmad-output/implementation-artifacts/1-4-project-config-initialization.md`
  - `_bmad-output/implementation-artifacts/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`
  - `_bmad-output/implementation-artifacts/1-6-install-progress-and-ready-summary.md`
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md`
  - `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
  - `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
  - `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
  - `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
  - `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
  - `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
  - `assets/source/speclite/core-skills/module.yaml`
  - `assets/source/speclite/sdlc-skills/module.yaml`
  - `assets/source/speclite/core-skills/module-help.csv`
  - `assets/source/speclite/sdlc-skills/module-help.csv`
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与 owning SPEC 一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互、安全、隐私、确定性输出口径
  - 跨 Epic 共享契约和 installed-state 投影边界

## 新发现

### 1. [高] `_speclite/.lock` 的 fresh-install bootstrap 语义自相依赖
- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：1-5
- **证据** - Story 1.5 要求“即将创建或修改任何 installer-owned path”前先获取 `_speclite/.lock`（`1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md` 第 21-26 行），但同一 Story 又把创建 `_speclite` 和 `_speclite/_config` 定义为写入阶段内容（第 28-33 行）。Install Plan Contract 同样规定 install/update/repair 在可写入或应用变更前必须获取 project-level operation lock，且 lock path 固定为 `_speclite/.lock`（`03-install-plan-contract.md` 第 122-128 行）。
- **影响** - 对 fresh install 来说，如果目标项目尚无 `_speclite/`，创建 lock 文件本身需要先创建 `_speclite/` 父目录；但 Story 又要求 lock 先于任何 installer-owned mutation。开发代理无法判断“为 lock 创建 `_speclite/`”是否是允许的 lock bootstrap mutation，容易出现两类错误：要么在无锁状态下创建 runtime root，要么因无法获取 lock 而阻断所有 fresh install。
- **建议** - 先裁决 fresh-install lock bootstrap 规则。推荐在 Story 1.5 和 Install Plan Contract 中补一句：在 target confirmation、source trust 和 final config summary 已完成后，允许以 project-boundary/case/symlink checks 保护的方式创建 `_speclite/` 作为 lock parent，并把该 bootstrap 行为视为 lock acquisition 的一部分；除 lock parent 与 lock file 外，任何 runtime/config/mirror/manifest mutation 仍必须在 lock 获取后执行。若不接受该规则，则需要选择 project-root 级临时 lock 路径并同步 SPEC。

### 2. [高] 默认 SDLC 模块缺少 canonical skill packages，会阻断 IDE mirror 与 ReadyCheck
- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：1-3, 1-5, 1-6
- **证据** - `assets/source/speclite/sdlc-skills/module.yaml` 声明 `code: sdlc` 且 `default_selected: true`（第 1-4 行），Story 1.3 也要求当前 source tree 至少发现 `core` 与 `sdlc` 两个 official module（`1-3-official-module-selection-and-install-summary.md` 第 98-107 行）。但当前文件系统中 `assets/source/speclite/sdlc-skills/` 只有 `module.yaml` 与 `module-help.csv`，Story 1.5 明确记录该目录“未发现 self-contained `SKILL.md` packages”（第 179-185 行），Story 1.6 也要求不得为 missing packages 合成 ready evidence（第 155-161 行）。
- **影响** - Epic 1 的目标是用默认官方内置来源完成可信 fresh install，并生成 IDE skill mirrors 和 ready summary（Epic 定义第 1-3 行）。如果 `sdlc` 是默认选择但没有 canonical skill packages，Story 1.5 无法完成 `.claude/skills/<canonicalSkillId>/` / `.agents/skills/<canonicalSkillId>/` 写入，Story 1.6 的 ReadyCheck 也必须失败。当前 Story 集只说“阻断安装”或“依赖前序更新”，但没有明确哪个 Story 负责补齐 source assets、改变默认选择，或把 SDLC 视为 metadata-only module。
- **建议** - 需要产品/架构裁决三选一：A. 在 Story 1.3 或 Story 1.5 明确补齐 `sdlc-skills` canonical skill package assets 和对应 tests；B. 将 `sdlc` 改为非默认可选，缺包时不进入默认 installedModules；C. 明确 `sdlc` 是 metadata-only module，并更新 manifest/index、phase coverage、ReadyCheck 和 module selection 规则。未裁决前，Story 1.5/1.6 不应进入开发。

### 3. [高] Story 1.6 的 lifecycle order 与 Story 1.4/1.5 的真实 gate 顺序冲突
- **来源**：structure+consistency
- **分类**：patch
- **涉及 Story**：1-6
- **证据** - Story 1.6 AC #1 要求按 `source-discovery`、`manifest-generation`、`ide-mirror-creation`、`config-initialization`、`ready-check`、`ready-summary` 报告阶段（`1-6-install-progress-and-ready-summary.md` 第 15-22 行），Task 2 又要求用同样顺序定义 stable lifecycle（第 95-99 行）。但 Story 1.4 明确 final configuration summary 必须在任何 config/runtime/artifact/IDE write 之前确认（`1-4-project-config-initialization.md` 第 60-65 行），Story 1.5 又要求写入阶段在 project config initialization 和 final configuration summary 完成之后才开始，并在写入阶段生成 manifest/index 与 IDE mirrors（`1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md` 第 15-19 行、第 63-69 行）。
- **影响** - 如果按 Story 1.6 当前顺序实现，manifest generation 和 IDE mirror creation 会被标记在 config initialization 之前，违反前序 Story 的 no-write gate；如果按前序 gate 实现，Story 1.6 的 AC 和 fixtures 又会失败。`completedSteps` / `pendingSteps` 是 public JSON 的 stable lifecycle arrays（`01-command-result-json-contract.md` 第 548-565 行），这个顺序冲突会直接固化到契约测试。
- **建议** - Patch Story 1.6 的 AC、Tasks、Progress Lifecycle Requirements 和 fixture guidance，使 lifecycle 至少满足前序 gate：`source-discovery` / `module-selection` -> `config-initialization` -> `runtime-structure` -> `ide-mirror-creation` -> `manifest-generation` -> `ready-check` -> `ready-summary`。如果保留较粗粒度 step，也必须把 `config-initialization` 移到任何 write / mirror / manifest step 之前，并同步 Epic 1 定义中相同的进度顺序。

### 4. [高] Pre-write module/config 状态没有清晰的 `CommandResult` JSON 表达边界
- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：1-3, 1-4
- **证据** - Story 1.3 要求 module selection 阶段的 `install --json` 通过 `sourceDescriptor`、`installedModules`、`paths`、`completedSteps` 和 `pendingSteps` 表达状态，并说明若需要 `pendingModuleSelection`、`selectedModules` 或 module summary 新字段，必须先更新 CommandResult SPEC（`1-3-official-module-selection-and-install-summary.md` 第 75-80 行）。CommandResult Contract 的 `InstallCommandData` 目前只有 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps`、`pendingSteps`（`01-command-result-json-contract.md` 第 306-317 行）。Story 1.4 也要求配置初始化完成/等待确认/失败时只通过现有字段表达 automation-relevant state，并禁止未契约化 config blobs（`1-4-project-config-initialization.md` 第 67-72 行）。
- **影响** - 在 Story 1.3 和 Story 1.4 还未写入 manifest/index 前，`installedModules` 这个字段名称语义上表示 installed projection，但 Story 又需要表达 selected / pending module selection 和 config summary。若开发时把 selected modules 塞进 `installedModules`，会把 pre-write plan 伪装成 installed state；若不放，则 automation 无法判断用户选择了哪些模块或配置是否处于 pending state。当前 Story 没有明确裁决“pre-write planning state 是否进入 public JSON”。
- **建议** - 先决定 public JSON 边界：要么更新 `01-command-result-json-contract.md`，给 `InstallCommandData` 增加 optional `selectedModules` / `pendingModuleSelection` / `configPending` 等字段并同步 schema/fixtures；要么在 Story 1.3/1.4 明确 pre-write 期间 `installedModules` 必须为空或仅反映已安装事实，automation 只通过 `completedSteps` / `pendingSteps` 与 human-readable summary 判断 pending state。不要在实现中临时重载 `installedModules`。

## 逐篇审查结论

### Story 1.1: CLI Install Entry And Runtime Guard（CLI 安装入口与运行时守卫）

**结论：通过**

**优点**
- Scaffold、contract anchors、runtime/platform guard、no-write failure 和 deterministic diagnostics 的边界清晰。
- 明确禁止提前实现 Story 1.2+ 能力，降低首个实现 Story 的范围漂移风险。

**关注点**
- 该 Story 作为后续所有 Story 的前置，开发时必须先建立 executable schema anchors，避免后续 Story 在 schema 缺位时手写第二套契约。

**建议动作**
- 无阻塞动作。

### Story 1.2: Project Target Directory Resolution And Existing Install Detection（项目目标目录解析与既有安装检测）

**结论：通过**

**优点**
- Target directory resolution、existing-install detection、no-write gate、path redaction 和 manifest-schema issue 复用边界明确。
- 对 `[target-directory]` 与禁止新增 `--project-root` 的约束与 CommandResult flag matrix 一致。

**关注点**
- Story 1.2 的 no-write 规则已经明确 operation lock 不得在 target confirmation 前创建，后续 Story 1.5 必须补齐 confirmation 后的 lock bootstrap 规则。

**建议动作**
- 无独立阻塞动作；跟随 Finding #1 在 Story 1.5 / Install Plan Contract 中补清 lock bootstrap。

### Story 1.3: Official Module Selection And Install Summary（官方模块选择与安装摘要）

**结论：有条件通过**

**优点**
- 对 bundled source `SourceDescriptor`、integrity evidence、module metadata parser、module version 缺口和 no-write summary 均有明确验收标准。
- 已识别 live `module.yaml` 缺少 version 字段，且要求正面处理，避免用 `unknown` 或目录名伪造版本。

**关键问题**
1. **Pre-write JSON 表达边界未裁决** - 见 Finding #4。
2. **默认 SDLC 模块缺少 canonical skill packages 的归属不清** - 见 Finding #2。

**建议动作**
- 在 Story 1.3 开发前先裁决 `selectedModules` / `pendingModuleSelection` 是否进入 public JSON。
- 明确是否由 Story 1.3 补齐 SDLC source package assets，或调整 module selection 默认规则。

### Story 1.4: Project Config Initialization（项目配置初始化）

**结论：通过**

**优点**
- Quick/detailed config、TOML schema、human-owned stubs、final summary gate 和 privacy rules 结构完整。
- 明确 config initialization 不得提前创建 runtime、artifact、IDE mirror 或 manifest/index。

**关注点**
- 如果 Story 1.3 最终需要新增 selected/config pre-write JSON 字段，Story 1.4 必须同步采用同一 public contract，不应在 config renderer 中私自添加 machine-readable blobs。

**建议动作**
- 跟随 Finding #4 对 `install --json` pre-write state 做同一裁决。

### Story 1.5: Runtime Structure, Artifact Directory And IDE Mirror Creation（运行时结构、产物目录与 IDE 镜像创建）

**结论：硬阻塞**

**优点**
- Runtime structure、artifact repository、IDE mirror、manifest/index、ownership、safe-write、target order 和 no-ready-summary failure gate 的覆盖较完整。
- 明确禁止合成 missing canonical packages，契约方向正确。

**关键问题**
1. **Operation lock bootstrap 语义自相依赖** - 见 Finding #1。
2. **默认 SDLC 模块缺包会阻断 canonical mirror** - 见 Finding #2。

**建议动作**
- 先补清 `_speclite/.lock` fresh-install bootstrap 规则。
- 先裁决并补齐或排除 `sdlc` 缺失 canonical packages，否则 Story 1.5 无法完成默认官方模块安装。

### Story 1.6: Install Progress And Ready Summary（安装进度与就绪摘要）

**结论：硬阻塞**

**优点**
- ReadyCheck scope 明确限制为 local-only minimal gate，避免把 full validate / hash scan / remote check 混入 install。
- Failure no-ready-summary gate 与 public JSON 字段约束清楚。

**关键问题**
1. **Lifecycle order 与前序 gate 冲突** - 见 Finding #3。
2. **默认 SDLC 模块缺包会使 ReadyCheck 必须失败** - 见 Finding #2。

**建议动作**
- 先按前序 Story gate 重排 lifecycle step order，并同步 fixtures。
- 在 Story 1.5 解决 SDLC packages / module selection 语义后，再实现 ReadyCheck 和 ready summary。

## 通过项

- Epic 1 的 Story 文件均存在，且本轮按实际根目录 `_bmad-output/implementation-artifacts/1-*.md` 完成全量审查。
- 6 个 Story 均具备 Story、Acceptance Criteria、Tasks / Subtasks、Dev Notes、References、Dev Agent Record、File List 等基本结构。
- Story 1.1-1.6 均明确禁止提前实现后续 Story 或 Post-MVP commands，范围边界整体清晰。
- 多数 Story 已正确引用 live sharded PRD / Architecture / SPEC，而不是 archive whole documents。
- 已知既有问题，非本次引入：`_bmad-output/project-context.md` 当前仍是 initialized placeholder；各 Story 已通过 live PRD、Architecture 和 owning SPEC 弥补主要实现基准。

## 结论

- **结论**：不通过
- **阻塞项**：Finding #1、Finding #2、Finding #3、Finding #4
- **建议**：先完成上述 4 个设计裁决/补丁，再进入 Epic 1 dev-story 执行；尤其不要在 Story 1.5 / Story 1.6 上直接开发，否则会把不一致的 lifecycle、lock bootstrap 和缺包状态固化进代码与 fixtures。
