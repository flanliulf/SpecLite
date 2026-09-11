# First Brownfield Project（第一个既有项目）

本教程带你在一个小型既有代码仓库中完成第一次 SpecLite brownfield 分析：确认安装健康、让 `speclite-help` 推荐入口、运行 `speclite-brownfield-context-builder`，然后检查 evidence、as-is baseline 和 planning handoff。完成实验后，你应能证明本次 Workflow 只新增分析产物，没有修改业务代码。

## What You'll Learn（你会学到什么）

完成本教程后，你将能够：

- 区分 SpecLite CLI 命令与 IDE 中的 installed Skill。
- 使用 `speclite-help` 根据项目事实获得下一步建议。
- 显式调用 `speclite-brownfield-context-builder` 建立既有项目基线。
- 在配置决定的路径中找到 evidence、baseline、validation 和 planning handoff。
- 用 Git 直接检查写入范围，避免把“分析项目”误解为“修改项目”。

## Lab Boundary（实验边界）

本教程只建立 brownfield baseline，不实现功能、不重构业务代码，也不替代后续的 PRD、Architecture、Epics 或 Stories Workflow。

`speclite-brownfield-context-builder` 是 installed Skill，由 AI IDE 加载 `.claude/skills/` 或 `.agents/skills/` 中的 Skill package。`speclite` CLI 负责安装、校验和解析 runtime config；当前没有 `speclite run <skill>` 这类 CLI 入口，因此不要把下文的 AI 提示词当成 shell 命令。

本实验把以下条件设为硬边界：

| Boundary | Requirement |
|---|---|
| Source reading | 可以读取业务代码、测试、配置和现有文档。 |
| Allowed writes | 只允许写入解析后的 `{brownfield_output}` 与 `{planning_artifacts}`。 |
| Business code | 不得修改源代码、测试、构建配置或运行配置。 |
| Optional analysis | 第一次实验不做 targeted deep dive。 |
| Fact conflicts | 出现待确认冲突时暂停，由学习者裁决，不自动猜测。 |

## Prerequisites（前置条件）

准备一个专门用于培训的小型既有 Git 仓库。它应包含少量真实代码、至少一个测试或 README，规模以 5 到 20 分钟可以浏览完为宜。不要直接把生产仓库作为第一次练习对象。

开始前确认：

- 已安装 Node.js `>=22` 和可直接执行的 `speclite` CLI。
- 已按 [`quick-start.md`](quick-start.md) 将 SpecLite 安装到训练仓库。
- 默认 `core` + `sdlc` Module 已安装；本实验不要求 optional ecosystem Module。
- SpecLite installed projection 已纳入训练仓库基线，当前 Git worktree 干净。
- 你正在支持 `.claude/skills/` 或 `.agents/skills/` 的 AI IDE 中打开该仓库。

> Caution: 如果仓库中还有未提交的工作，不要继续实验。请换用 disposable clone 或按团队流程先保存已有工作，避免无法判断后续改动来自谁。

## Quick Path（快速路径）

本实验的最短路径如下：

```text
clean training repository
  -> status and validate
  -> speclite-help
  -> speclite-brownfield-context-builder
  -> inspect evidence and baseline
  -> inspect planning handoff
  -> verify Git changes stay inside artifact paths
```

其中只有 `status`、`validate`、`list` 和必要时的 `resolve config` 在 shell 中运行。两个 Skill 通过 AI IDE 调用。

## Step 1: Prepare the Workspace（准备工作区）

把训练仓库的绝对路径写入变量，并确认当前目录与 Git 状态：

```sh
export PROJECT_ROOT=/absolute/path/to/brownfield-training-repo
cd "$PROJECT_ROOT"
git rev-parse --show-toplevel
git status --short --untracked-files=all
```

最后一条命令应没有输出。若存在任何 tracked change 或 untracked file，先停止实验。

再确认第一次扫描尚未开始。默认 quick config 中，`project_knowledge` 解析为 `_speclite-output/project-knowledge-base`，brownfield 状态文件会位于该 root 下：

```sh
test ! -e "$PROJECT_ROOT/_speclite-output/project-knowledge-base/brownfield/project-scan-report.json"
```

如果该文件已经存在，不要手工删除。Skill 会根据状态进入 resume、`full_rescan`、`targeted_deep_dive` 或 `planning_generation`；为了获得可重复的第一次实验结果，请改用新的训练仓库。

## Step 2: Verify Installation（验证安装）

先确认当前 AI session 的 `PATH` 能找到 Node CLI：

```sh
command -v speclite
speclite --version
```

然后执行只读检查：

```sh
speclite status "$PROJECT_ROOT"
speclite validate "$PROJECT_ROOT"
speclite list "$PROJECT_ROOT"
```

继续实验前应满足：

- `status` 显示项目已安装，而不是 `not-installed` 或 `partial`。
- `validate` 没有阻塞性安装健康问题。
- `list` 能在目标项目 installed-state 中看到 `speclite-help` 和 `speclite-brownfield-context-builder`。
- `.claude/skills/speclite-brownfield-context-builder/SKILL.md` 或 `.agents/skills/speclite-brownfield-context-builder/SKILL.md` 至少存在一处。

如果 `command -v speclite` 没有输出，先修复当前 AI session 的 `PATH`；不要回退到 Python resolver，也不要让 Skill 依赖 SpecLite 源码仓库中的脚本路径。

## Step 3: Ask for Routing Help（请求路由建议）

在同一个目标项目的 AI IDE 会话中，显式选择 `speclite-help`；如果 IDE 没有 Skill selector，则发送包含准确 Skill ID 的自然语言请求：

```text
请使用 speclite-help 检查当前项目状态。我准备为这个既有项目建立证据化
as-is baseline，请告诉我应该运行哪个 Skill、需要哪些输入、会写到哪些路径；
暂时不要执行其它 Workflow。
```

合理的回复应以 installed runtime 的 `help-index.json`、`phase-coverage.json`、runtime config 和已有产物为依据，并推荐 `speclite-brownfield-context-builder`，而不是凭项目名称猜测。

在继续前，确认帮助结果至少说明：

| Item | Expected Result |
|---|---|
| Recommended Skill | `speclite-brownfield-context-builder` |
| Phase | `1-analysis` |
| Primary output | `{project_knowledge}/brownfield` |
| Planning handoff | `{planning_artifacts}` 或 `{brownfield_output}/planning/` |
| Downstream boundary | 后续再交给 PRD、Architecture、Epics/Stories Workflow。 |

## Step 4: Run the Brownfield Workflow（运行 Brownfield Workflow）

新开一个 context window，并显式选择 `speclite-brownfield-context-builder`。发送以下实验请求：

```text
请使用 speclite-brownfield-context-builder 对当前项目执行第一次 brownfield
baseline 分析。请完成仓库分类、evidence 提取、as-is baseline 和 planning
handoff；本次不做 targeted deep dive。只读取业务代码、测试、配置和已有文档，
只允许写入 Skill 解析出的 brownfield_output 与 planning_artifacts，不修改业务
代码、测试、构建配置或 SpecLite runtime。若发现待确认的 fact conflicts，请暂停
并向我说明冲突与证据，不要自动裁决。
```

Skill 应先运行 `speclite resolve config --project-root {project-root}`，再从 installed Skill package 自己的 `scripts/` 加载确定性提取工具。正常第一次运行会选择 `initial_scan`，依次完成 repository classification、evidence、baseline、可选 deep dive 和 planning handoff；本实验明确跳过可选 deep dive。

运行期间可以回答 Skill 对项目边界、历史文档目录或事实冲突提出的问题，但不要授权它扩大写入范围。如果 Workflow 中断，保留 `project-scan-report.json`，下次让同一 Skill 按状态 resume，不要手工拼接半成品。

## Step 5: Inspect the Outputs（检查产物）

默认 quick config 中，`project_knowledge` 是 `{project-root}/_speclite-output/project-knowledge-base`，因此主要产物位于：

```text
_speclite-output/project-knowledge-base/brownfield/
├── project-scan-report.json
├── evidence/
├── baseline/
├── deep-dives/
├── planning/
└── validation/
```

`deep-dives/` 可以为空，因为本实验没有请求 targeted deep dive。重点抽查：

| Layer | What to Inspect | Why It Matters |
|---|---|---|
| State | `project-scan-report.json` | 确认 mode、phase 和各阶段状态，支持中断恢复。 |
| Evidence | `evidence/repo-manifest.json`、API、data model、dependency 等 inventory | 记录机器提取的代码事实，不把叙述当证据。 |
| Baseline | `baseline/index.md`、system overview、as-is architecture、capability 和 risk 文档 | 说明当前系统是什么，不混入未来设计。 |
| Validation | `validation/` 下的报告 | 检查完整性、anchor 和 grounding。 |
| Handoff | `brownfield-planning-brief.md`，以及按运行模式生成的 `candidate-change-slices.md`、`feature-entry-points.md` | 把已验证事实交给后续规划 Workflow。 |

Planning handoff 可以出现在 `_speclite-output/2-planning-artifacts/`，也可以按 Skill 解析结果写入 `_speclite-output/project-knowledge-base/brownfield/planning/`。路径由配置决定，不要因为文件未出现在默认示例位置就复制一份。

如果项目使用了非默认路径，可用下面的 runtime support 命令排查 effective config：

```sh
speclite resolve config --project-root "$PROJECT_ROOT"
```

抽查一个 baseline 结论，沿它的 evidence anchor 回到具体文件或 symbol。结论没有来源时，应标为问题；`INFERRED`、`DOC_SUPPORTED` 或 `UNVERIFIED` 也必须明确显示，不应伪装成 `CODE_CONFIRMED`。

## Step 6: Verify the Write Boundary（验证写入边界）

回到 shell，直接读取 Git 证据：

```sh
cd "$PROJECT_ROOT"
git diff --name-only
git ls-files --others --exclude-standard
git status --short --untracked-files=all
```

预期只看到配置解析出的 brownfield 与 planning artifact 路径。默认 quick config 中，`brownfield-planning-brief.md` 是主要 handoff；另外两份辅助文档是否出现取决于 effective planning mode。允许的路径通常是：

- `_speclite-output/project-knowledge-base/brownfield/**`
- `_speclite-output/2-planning-artifacts/brownfield-planning-brief.md`
- `_speclite-output/2-planning-artifacts/candidate-change-slices.md`
- `_speclite-output/2-planning-artifacts/feature-entry-points.md`
- 若 Skill/effective config 明确将 planning handoff 解析到 brownfield output，则可出现 `_speclite-output/project-knowledge-base/brownfield/planning/**`

以下任一情况都表示本实验没有通过：

- `src/`、`app/`、`packages/`、`services/`、测试目录或其它业务代码路径被修改。
- `_speclite/`、`.claude/skills/` 或 `.agents/skills/` 在 Workflow 运行期间发生变化。
- 产物写到了 `assets/source/speclite/` 或其它 SpecLite source checkout 路径。
- 关键结论没有 evidence anchor，或事实冲突被自动裁决。

发现越界写入时停止，不要提交结果。先保存 `git status` 和 diff 作为证据，再审查 Skill 执行记录与 effective config。

## Success Criteria（成功标准）

当以下条件全部满足时，第一次 brownfield 实验完成：

- [ ] CLI、installed-state 和 IDE Skill mirror 均通过检查。
- [ ] `speclite-help` 基于项目 evidence 推荐了正确 Workflow。
- [ ] `speclite-brownfield-context-builder` 完成第一次扫描或留下可恢复状态。
- [ ] evidence、baseline、validation 和 planning handoff 可以相互追溯。
- [ ] 至少抽查一个关键结论并找到对应代码或文档 anchor。
- [ ] Git 只显示允许的 artifact paths，业务代码保持不变。
- [ ] 未确认事实保持显式不确定，没有被补写成确定结论。

## Next Steps（下一步）

不要把 brownfield planning handoff 当作已经批准的需求或架构。根据任务目标，在新的 context window 中继续：

| Goal | Next Skill |
|---|---|
| 再次判断当前状态与下一步 | `speclite-help` |
| 将明确需求整理为 PRD | `speclite-create-prd` |
| 基于 PRD 和 baseline 形成技术方案 | `speclite-create-architecture` |
| 拆分 Epic 与 Story | `speclite-create-epics-and-stories` |
| 只对高风险区域补充分析 | 重新调用 `speclite-brownfield-context-builder`，请求 `targeted_deep_dive` |

进入下一 Workflow 前，先人工审阅 baseline 与 planning handoff，解决 `fact-conflicts.json` 中仍为 pending 的冲突，并按团队规则决定是否提交本次分析产物。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 安装与首次验证前置教程 | [`quick-start.md`](quick-start.md) |
| Installed Skill 调用方式 | [`../how-to/use-installed-skills.md`](../how-to/use-installed-skills.md) |
| 安装健康检查 | [`../how-to/validate-installation.md`](../how-to/validate-installation.md) |
| Workflow 概念与执行边界 | [`../explanation/speclite-workflows.md`](../explanation/speclite-workflows.md) |
| Runtime 三层边界 | [`../explanation/runtime-boundaries.md`](../explanation/runtime-boundaries.md) |
| SDLC Skill ID 与阶段速查 | [`../reference/skills/sdlc-workflows.md`](../reference/skills/sdlc-workflows.md) |
| Artifact 路径与 producer | [`../reference/workflow-artifact-layout.md`](../reference/workflow-artifact-layout.md) |
