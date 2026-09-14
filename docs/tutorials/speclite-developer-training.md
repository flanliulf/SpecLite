# Developer Starter Training（开发者入门培训）

本文把 13 篇公开文档组织成一场面向初次接触 SpecLite、后续需要在真实项目中使用它的开发者培训。主线从“认清 SpecLite 是什么”开始，经过 Module 安装边界、Agent persona、Workflow 生命周期、Skill 选择和首次激活，最后在一个小型既有项目中完成 brownfield baseline，并能判断产物边界、文件所有权和维护方式。

这是一份培训组织文档，不替代 13 篇材料本身。讲师用它安排节奏、练习和验收；学员按表中的顺序阅读和操作。

## Audience and Outcomes（受众与培训结果）

适合以下学员：

- 第一次接触 SpecLite，但已经能够使用终端、Git 和 AI coding IDE 的开发者。
- 即将在 existing project 中参与需求分析、方案设计、Story 实现或文档维护的开发者。
- 已听说 Agent、Skill 或 Workflow，但还不能判断应该调用哪一种入口的开发者。

完成培训后，学员应能独立做到：

1. 用自己的话解释 SpecLite 的用途，以及它不负责什么。
2. 区分 canonical source、installed runtime projection 和 workflow artifact repository。
3. 解释 `core`、`sdlc` 和 ecosystem Module 的选择、依赖与安装投影边界。
4. 先预览、再授权安装，并用 `status`、`validate` 和 `command -v speclite` 验证环境。
5. 在 CLI、Agent、Workflow 和 support Skill 之间做出有依据的选择，并为任务匹配合适的 Agent persona。
6. 把任务映射到 `1-analysis` 至 `5-devops` 的 SDLC 生命周期，同时知道它不是必须完整执行的固定流水线。
7. 使用 `speclite-help` 定位下一步，并完成一次 evidence-first brownfield baseline。
8. 根据产物路径和 ownership 判断哪些内容可更新、可修复或必须保留。

## Scope and Non-Goals（范围与非目标）

本次培训以一个小型 brownfield repository 为统一案例，覆盖新手第一次安装、发现 Skill、选择 Workflow、检查产物和维护 installed project 的完整闭环。

以下主题不进入核心 13 篇材料：

- `CommandResult` JSON 的字段级规范和自动化消费者实现。
- CI、企业自动化、canonical source 治理和 npm 发布流程。
- 完整 PRD、Architecture、Epic、Story、Flow Gate 与 Code Review 链路实战。
- optional ecosystem Module 的开发和 support Skill 的维护者操作。

这些内容不是不重要，而是需要在掌握本次培训的 runtime boundary、activation 和 artifact 基础后再学习。Greenfield feature 实战可作为后续进阶培训单独组织。

## Prerequisites（前置条件）

讲师应在开课前一天确认所有学员具备：

- Node.js `>=22`；推荐使用团队统一的 LTS 版本。
- Git、终端和一个能够发现 `.claude/skills/` 或 `.agents/skills/` 的 AI coding IDE。
- `npm install -g @fancyliu/speclite` 的安装权限，或团队准备好的等价 CLI 安装方式。
- 一个可丢弃、可恢复的小型 existing repository；开始实验时 `git status --short` 应为空。
- 创建 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/` 和项目知识目录的写权限。

学员进入课堂后先执行：

```sh
node --version
command -v speclite
speclite --version
git status --short
```

任一命令不符合预期时，先进入环境排错，不要带着未确认的 CLI 或脏工作区开始实验。

## Delivery Format（授课形式）

推荐采用 3 小时半日培训，包含 10 分钟休息和 9 分钟结课验收。13 篇材料不要求课堂逐字通读：Tutorial 用于跟练，Explanation 只讲与本次判断模型直接相关的章节，How-To 用于完成任务，Reference 用于现场查证。

| Stage | Materials | Teaching Mode | Stage Outcome |
|---|---|---|---|
| 基础与安装 | 1-4 | 导览 + 边界图 + Module 归类 + CLI 跟练 | 知道 SpecLite 的职责、三层 runtime 边界和实际安装内容。 |
| 入口与执行模型 | 5-8 | 决策题 + persona 匹配 + 生命周期图 + Skill 激活 | 能区分 Agent 与 Workflow，并选择正确入口。 |
| 首次真实任务 | 9-10 | catalog 查阅 + brownfield 实验 | 找到当前 Workflow 并产出 evidence-backed baseline。 |
| 产物与维护 | 11-13 | 路径追踪 + ownership 情景题 | 能安全查看、保留、更新和修复项目。 |

建议每位学员独立操作自己的示例仓库。两人共用环境会掩盖 PATH、IDE discovery 和 ownership 判断问题，不利于验收个人能力。

## Training Checklist（13 篇培训材料清单）

| Order | Material | Role in Training | Classroom Use | Time | Expected Result |
|---:|---|---|---|---:|---|
| 1 | [`speclite-orientation.md`](speclite-orientation.md) | 建立产品全景、核心术语和学习地图。 | 讲师快速导览，学员完成术语口述。 | 8 min | 能回答“SpecLite 是什么、不是什么”。 |
| 2 | [`../explanation/runtime-boundaries.md`](../explanation/runtime-boundaries.md) | 建立 canonical source、installed runtime projection、workflow artifact repository 三层模型。 | 结合安装前后的目录树讲解。 | 8 min | 能把常见路径放到正确层级。 |
| 3 | [`../explanation/speclite-modules.md`](../explanation/speclite-modules.md) | 理解 Module 是安装、配置和索引边界，以及 `core`、`sdlc`、ecosystem 的选择关系。 | 选讲 Module shape、installation model；用三类 Module 卡片归类。 | 8 min | 能解释默认 `core + sdlc`、ecosystem selected-only 和 dependency closure。 |
| 4 | [`first-install-walkthrough.md`](first-install-walkthrough.md) | 完成安全安装、状态检查和基础验证。 | 第一段动手实验。 | 22 min | `status`、`validate` 和 PATH 检查均有明确结果。 |
| 5 | [`../explanation/skill-taxonomy-and-sdlc.md`](../explanation/skill-taxonomy-and-sdlc.md) | 区分 CLI、Module、Skill、Agent、Workflow、Artifact 和 support Skill。 | 聚焦入口决策表，完成任务选择题。 | 10 min | 面对任务时能说明为什么选择某类入口。 |
| 6 | [`../explanation/speclite-agents.md`](../explanation/speclite-agents.md) | 认识 7 个 Agent persona、持续身份、菜单和 Workflow 分发职责。 | 用 persona 卡匹配需求发现、文档、PM、UX、Architecture 和实现任务。 | 8 min | 能选择合适 persona，并说明 Agent 不替代 Workflow。 |
| 7 | [`../explanation/speclite-workflows.md`](../explanation/speclite-workflows.md) | 理解 Workflow package、渐进式披露，以及编号 1-5 的 SDLC 生命周期。 | 用五阶段泳道和任务卡讲解，可按任务跳过不需要的阶段。 | 12 min | 能把任务映射到正确阶段，并说明 Workflow 的输入、步骤、产物和验证。 |
| 8 | [`../how-to/use-installed-skills.md`](../how-to/use-installed-skills.md) | 从“安装成功”走到“AI IDE 实际发现并调用 Skill”。 | 第二段动手实验，使用 `speclite-help`。 | 18 min | AI 会话能读取当前项目事实并推荐下一步。 |
| 9 | [`../reference/skills/sdlc-workflows.md`](../reference/skills/sdlc-workflows.md) | 查找 SDLC 阶段、Skill ID、menu code 和主要输出。 | 现场检索，不逐行讲解。 | 8 min | 能定位 `speclite-brownfield-context-builder` 及其阶段和输出。 |
| 10 | [`first-brownfield-project.md`](first-brownfield-project.md) | 在 existing repository 中完成第一次 evidence-first 分析。 | 第三段、也是核心动手实验。 | 35 min | 得到 evidence、as-is baseline 和 planning handoff，并确认业务代码未被修改。 |
| 11 | [`../reference/workflow-artifact-layout.md`](../reference/workflow-artifact-layout.md) | 判断 planning、implementation、devops 和 project knowledge 产物放在哪里。 | 从实验产物反查目录规范。 | 8 min | 能解释 baseline 与 `_speclite-output/` 的关系。 |
| 12 | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) | 理解 installer-owned、human-owned、workflow-owned 的保护边界。 | 用三个文件变更场景做判断。 | 8 min | 能判断 update、repair、uninstall 是否应触碰某个文件。 |
| 13 | [`../how-to/update-and-repair.md`](../how-to/update-and-repair.md) | 建立后续维护的 preview、authorization 和 conflict 处理习惯。 | 讲师演示 update plan，学员口述决策。 | 8 min | 能先预览再写入，不把 repair 当成无条件覆盖。 |

### Persona Focus（Persona 教学重点）

persona 匹配必须覆盖 Alice（Business Analyst）、Taylor（Technical Writer）、Sarah（Docs Steward）、Paul（PM）、Uma（UX Designer）、Adam（Architect）和 David（Developer）。当前没有独立 DevOps persona；Taylor 与 Sarah 的 package 位于 `1-analysis/`，但相关能力可以按 help catalog 在其它阶段使用，因此 package placement 不等于只能在该阶段调用。

### Lifecycle Focus（生命周期教学重点）

阶段的目录名、catalog phase、职责与典型产物以 [`../reference/sdlc-phases.md`](../reference/sdlc-phases.md) 为准；课堂只强调每个阶段的教学重点：

| Order | Phase | Classroom Focus |
|---:|---|---|
| 1 | Analysis | 理解用户、领域、市场和 existing system 事实，包括 brownfield baseline。 |
| 2 | Planning | 定义产品范围、需求和用户体验；提醒学员目录名 `2-plan-workflows/` 与 catalog phase `2-planning` 是两个不同技术标识。 |
| 3 | Solutioning | 形成 Architecture、Epics/Stories，并检查 Story 与 implementation readiness。 |
| 4 | Implementation | 计划和执行 Story、测试、Flow Gate、Code Review、QA 与 Retrospective。 |
| 5 | DevOps | 进入发布与运维；当前已落地的具体 Workflow 是 `speclite-npm-publisher`。 |

五个阶段是发现、排序和交接模型，不要求每个任务机械走完整链路。

总材料时间为 161 分钟。加上 10 分钟休息和 9 分钟结课验收，完整课程仍为 180 分钟。

## Agenda（课程议程）

| Time | Activity | Evidence |
|---|---|---|
| `00:00-00:08` | 材料 1：产品导览与术语地图 | 学员用一句话描述 SpecLite。 |
| `00:08-00:16` | 材料 2：三层 runtime boundary | 路径归类题全部完成。 |
| `00:16-00:24` | 材料 3：Module 安装边界 | 能预测默认与 selected-only Module。 |
| `00:24-00:46` | 材料 4：安装与验证实验 | 保存 `status`、`validate` 和 `command -v speclite` 结果。 |
| `00:46-00:56` | 材料 5：入口分类决策 | 完成 CLI、Agent、Workflow、support Skill 选择题。 |
| `00:56-01:04` | 材料 6：Agent persona 匹配 | 为典型开发任务选择 persona，并说明分发边界。 |
| `01:04-01:16` | 材料 7：Workflow 与五阶段生命周期 | 将任务卡放入正确阶段，并识别可跳过路径。 |
| `01:16-01:34` | 材料 8：激活 `speclite-help` | 得到带当前项目依据的下一步建议。 |
| `01:34-01:44` | Break（休息） | 讲师检查未完成的环境问题。 |
| `01:44-01:52` | 材料 9：Workflow catalog 检索 | 找到 brownfield Workflow、menu code 和 output。 |
| `01:52-02:27` | 材料 10：brownfield baseline 实验 | 检查 evidence、baseline、planning handoff 与 Git diff。 |
| `02:27-02:35` | 材料 11：artifact layout 反查 | 指出本次产物的 owner 和长期落点。 |
| `02:35-02:43` | 材料 12：ownership 情景题 | 三类 ownership 判断无混淆。 |
| `02:43-02:51` | 材料 13：update / repair 演示 | 能说明 preview 与 write authorization 的区别。 |
| `02:51-03:00` | Exit Check（结课验收） | 完成个人验收清单和下一步选择。 |

## Lab Design（实验设计）

示例项目应足够小，让 35 分钟内能观察完整流程；同时要有足够真实的结构，让 evidence extraction 不退化为阅读单个文件。建议准备：

- 一个应用入口、2-3 个业务模块、manifest 或 lockfile、少量配置和测试。
- 一个明确的 API 或命令入口，以及至少一个数据模型或持久化边界。
- `docs/history/` 中 1-2 篇可能过时的历史说明，用于展示“历史文档是证据源，不是真相源”。
- 一份开课前的 clean commit，以及讲师保留的预期目录树和成功产物快照。

三个实验必须分别收口：

| Lab | Learner Action | Pass Condition |
|---|---|---|
| Install and validate | preview install、授权写入、运行 `status` / `validate`、确认 PATH。 | 安装状态有效，学员能指出本次写入目录。 |
| Discover and route | 在新 AI 会话调用 `speclite-help`，再从 catalog 查找下一步。 | 推荐基于 help index、配置或已有产物，不是凭空猜测。 |
| Build brownfield context | 运行 brownfield Workflow，检查 evidence、baseline、planning handoff 和 Git diff。 | 产物有 evidence anchor，as-is 与 to-be 分离，业务源文件未被改动。 |

如果课堂机器无法完成 IDE discovery，讲师可以用预先准备的成功产物快照继续讲解 artifact 和 ownership，但必须把该学员的 activation lab 标记为“未通过”，课后仍需在真实环境补验，不能把观看演示视为完成操作。

## Instructor Preparation（讲师准备）

开课前按以下清单准备：

- [ ] 使用与课堂相同的 Node.js、CLI version 和 IDE 完整走通三段实验。
- [ ] 确认默认安装包含 `core` + `sdlc`，且目标 IDE mirror 中存在 `speclite-help` 与 `speclite-brownfield-context-builder`。
- [ ] 准备 Module 归类、7 个 persona 匹配和五阶段任务映射的题卡与答案。
- [ ] 准备 clean 示例仓库、恢复脚本或可重复 clone 的本地来源；不要用生产仓库授课。
- [ ] 保存安装前、安装后、brownfield 完成后的三份目录树和 `git status --short` 结果。
- [ ] 准备一份经过验证的成功产物快照，仅用于故障时继续讲解，不替代个人实验验收。
- [ ] 预先测试网络、npm registry、全局安装权限与 `PATH`；必要时准备团队认可的离线 package。
- [ ] 把 13 篇材料按本文顺序加入培训入口，不使用根目录 package-facing [`../quick-start.md`](../quick-start.md) 代替课堂 Tutorial。

## Assessment and Exit Check（评估与结课验收）

结课时每位学员独立完成以下检查；讲师只追问依据，不代替操作：

- [ ] 能把 `assets/source/speclite/`、`_speclite/`、`.agents/skills/` 和 `_speclite-output/` 放入正确边界。
- [ ] 能解释默认安装为什么包含 `core + sdlc`，以及 ecosystem Module 为什么是 selected-only。
- [ ] 能说明不带 `--yes` 的 install preview 与授权写入的区别。
- [ ] 能解释 `command -v speclite` 为什么是 installed Skill activation 的前置条件。
- [ ] 能为“查看安装状态”“请求角色引导”“执行 brownfield baseline”“维护 canonical source”选择正确入口类型。
- [ ] 能为至少三个开发场景匹配合适的 Agent persona，并说明 Agent 与 Workflow 的职责差异。
- [ ] 能按顺序说明 `1-analysis` 至 `5-devops`，并把至少五个任务映射到正确阶段。
- [ ] 能从 `sdlc-workflows.md` 找到一个 Skill 的阶段、menu code 和 output。
- [ ] 能指出 brownfield evidence、baseline 与 planning handoff，并说明它们不是业务代码。
- [ ] 能判断 installer-owned、human-owned 和 workflow-owned 文件的处理方式。
- [ ] 能在 update 或 repair 前先找 preview、conflict 和 write authorization 证据。

建议通过标准为 11 项全部完成。PATH 或 IDE discovery 未通过属于环境阻塞，需要补验；概念题错误则回到对应材料重新学习后再验收。

## Follow-Up Path（课后路径）

完成本次培训后，按实际职责继续学习：

| Need | Next Material |
|---|---|
| 重新安装或排查安装方式 | [`../how-to/install-speclite.md`](../how-to/install-speclite.md) |
| 深入验证 installed state | [`../how-to/validate-installation.md`](../how-to/validate-installation.md) |
| 管理已安装项目 | [`../how-to/manage-installed-project.md`](../how-to/manage-installed-project.md) |
| 查阅完整 CLI | [`../reference/cli.md`](../reference/cli.md) |
| 使用 npm package 自带的独立入口 | [`../quick-start.md`](../quick-start.md) |
| 进入 PRD、Architecture、Story 或 implementation | 回到 [`../reference/skills/sdlc-workflows.md`](../reference/skills/sdlc-workflows.md)，结合 `speclite-help` 选择下一步。 |

进阶课程可以分别组织 greenfield planning、Story implementation / review、CI automation 和 canonical source maintenance，不要在新手课中一次铺开全部 surface。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 学员起点 | [`speclite-orientation.md`](speclite-orientation.md) |
| Module 安装与配置边界 | [`../explanation/speclite-modules.md`](../explanation/speclite-modules.md) |
| Agent persona 与分发职责 | [`../explanation/speclite-agents.md`](../explanation/speclite-agents.md) |
| Workflow package 与五阶段生命周期 | [`../explanation/speclite-workflows.md`](../explanation/speclite-workflows.md) |
| 首次安装实验 | [`first-install-walkthrough.md`](first-install-walkthrough.md) |
| 首次 brownfield 实验 | [`first-brownfield-project.md`](first-brownfield-project.md) |
| 文档分类与维护规则 | [`../README.md`](../README.md) |
| 写作与发布规范 | [`../_STYLE_GUIDE.md`](../_STYLE_GUIDE.md) |
