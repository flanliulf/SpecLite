# External Knowledge and External Skills（外部知识与外部 Skill）

## Document Context（文档背景）

- 日期：2026-10-05。
- 状态：方案草案，待决策。本文属于 research evidence，不参与 live planning gate；进入实施前需要转为 Story 或 SPEC。
- 写法：按 ASD-STE100 原则编写：每句只说一件事，使用主动语态，一个词只表示一个意思。英文版见 [technical-speclite-external-knowledge-and-skills-research-2026-10-05.en.md](technical-speclite-external-knowledge-and-skills-research-2026-10-05.en.md)。
- 来源：2026-10-04 至 2026-10-05 的方案讨论。本文是经过第一性原理复盘后的修订版。
- 证据快照：SpecLite `44295f0`；SCRM 知识库 `44b2703`（2026-10-04）；交付项目 `wshoto-ka-vw-anhui` `71a1f1f`。
- 知识库侧的配合事项已于 2026-10-05 决策：KC-D-00 至 KC-D-16 全部按建议。方案见知识库 `planning/knowledge-consumption-plan.md`。决策 KC-D-09 修正了本文 3.3 节：证据等级的词表由知识库定义。

## Terms（术语）

| 术语 | 本文含义 |
|---|---|
| 知识库 | 由其他团队维护的领域知识仓库，例如 SCRM 知识库。 |
| 外部 Skill | 由其他作者编写的 Skill，例如 impeccable。 |
| 关卡 | SpecLite 流程中的检查点，例如 readiness check、Story review、code review。 |
| 规则 ID | 一条规则的唯一编号，例如 CS-ENG-08。 |
| 证据等级 | 一条知识的可信程度。词表由知识库定义，SpecLite 只引用。 |
| 引用 | 产物中指向知识库内容的记录。 |
| 版本锁定 | 项目固定使用知识库的某一个 commit。 |
| 知识缺口 | Agent 资料不足、停下来询问人的一次事件。 |

## 1. Problem（问题）

SpecLite 提供一套 AI 编码方法。这套方法有阶段、步骤和检查。

每个公司还有自己的知识。例如，SCRM 知识库里有规则、API 契约和平台事实。AI Agent 必须使用这些知识，才能把工作做对。

一些用户还会使用其他作者的 Skill。例如，UI 设计师会用 impeccable、taste、ui-ux-pro-max 和 frontend-design。

目前，SpecLite 没有标准方法连接这两类外部内容。`wshoto-ka-vw-anhui` 项目里能看到后果：

- AGENTS.md 写的是一台电脑上的完整路径。其他电脑用不了这个路径。
- 团队手工复制规则文件。
- 项目提到知识库 254 次。我们检查过的引用都没有版本。
- 技术栈文档两天内出了四个版本。三次更新里有两次只是跟进知识库的变化。

## 2. Basic Facts（基本事实）

我们用六条基本事实来检查方案。

| # | 事实 | 对设计的要求 |
|---|---|---|
| A1 | Agent 只能使用上下文里的内容。上下文的容量有限。 | 只给相关知识，不给全部知识。 |
| A2 | Agent 不一定遵守上下文里的规则。关卡上的检查每次结果都相同。 | 在关卡上检查规则，不能只加载规则。 |
| A3 | 结论的可信度不会高于它最弱的来源。 | 每条引用都带上证据等级。 |
| A4 | 每个所有者只应控制自己这一侧。 | 接口放在所有者的边界上，并且保持小。 |
| A5 | 同一项目的两个人应该得到相同的结果。 | 锁定版本。每次升级都是一次可见的变更。 |
| A6 | 只有 SpecLite 知道流程状态：阶段、Story、产物和关卡。 | SpecLite 只做需要流程状态的工作。 |

## 3. Changes to the First Plan（对上一版的修改）

### 3.1 按主题选择知识，不按阶段选择

**问题：** 上一版按 SDLC 阶段选择知识。但决定哪些知识相关的，是工作主题，例如 ID Mapping 或 Open 回调。阶段列表还会让知识库依赖 SpecLite 的阶段名称。

**修改：**

- 知识库只描述自己：身份、入口文件、阅读分层和只读策略。
- SpecLite 在创建 Story 时选择一次相关知识。这时工作范围最小，而且有人审查 Story。
- Story 里保留一个"知识引用"小节。dev-story 和 code-review 直接复用这个小节。

### 3.2 检查规则，不只加载规则

**问题：** 全局规范有 61 条规则。上一版只是把规则放进上下文。Agent 可能忘记或忽略规则。

**修改：**

- 给每条规则一个规则 ID。部分规则已经有规则 ID，例如 CS-ENG、CS-GAP、GOV。全局规范的规则还没有，需要知识库团队补上。
- 每个设计决策都引用相关的规则 ID。
- 如果某个决策不遵守某条规则，就记录这个例外和批准人。
- readiness check、Story review 和 code review 按规则 ID 检查相关规则。
- 有些规则可以用脚本检查，例如"禁止监听标品内部 MQ topic"。把这些规则做成自动检查。

### 3.3 每条引用都带上证据等级

**问题：** 上一版的引用只记录位置和 commit。但知识库里的内容有不同的证据等级，例如业务已确认、源码已核对、机器稿、待确认。如果 PRD 引用了机器稿，下游 Story 可能把它当成确定的契约。这是错误的。

**修改：**

- 证据等级的词表由知识库定义。SpecLite 只引用这个词表，不自己定义等级。
- 每条引用都标出证据等级。
- 如果证据等级是机器稿、待确认或未检查，产物就把这一项加入待确认清单。
- 如果 Agent 无法判断证据等级，就按待确认处理。
- **限制：** 知识库目前没有机器可读的证据等级数据。Agent 只能从正文里读出证据等级。知识库会先整理一张词表（知识库方案 KC-4）。

### 3.4 锁定版本，主动升级

**问题：** 上一版让 Agent 读取本机最新的知识库副本。两个开发者的副本可能不同，Agent 就会给出不同的结果。

**修改：**

- 项目把知识库锁定到一个 commit。
- 升级是一次可见的变更，由人审查。
- 升级时，SpecLite 先找出发生变化的规则，再找出引用了这些规则的决策和 Story，最后给出一份需要重新检查的清单。
- 推荐用 Git submodule。它提供固定路径、版本锁定和清晰的 diff。
- 如果多个项目共用本机同一份副本，SpecLite 就记录 Agent 实际读取的 commit。这个 commit 和锁定的 commit 不一致时，SpecLite 给出警告。

### 3.5 知识缺口出现时立即记录

**问题：** 上一版只在复盘时向知识库反馈。这太晚，也会丢掉很多细节。

**修改：**

- Agent 资料不足时，停下来询问人。
- 这时记录一个知识缺口，内容包括：问题、答复、答复人、适用范围（仅本项目或所有项目）、相关的规则 ID。
- 复盘时只对这些记录做汇总和分类。

### 3.6 在产物上连接外部 Skill，不在命令上连接

**问题：** 上一版把 SpecLite 的步骤连接到外部 Skill 的某个命令。外部 Skill 经常变化，例如 taste 从 v1 到 v2 完全重写了。每次重写都可能弄坏这种连接。

**修改：**

- SpecLite 规定每个扩展点必须产出什么。例如，UX 视觉方向文档必须包含设计令牌、字体、色彩和组件规则。
- 谁来产出都可以：impeccable、taste、设计师本人，或者 Figma 导出。
- 知识库里已经有一个好样板：scrm-skills 的 task-handoff 契约。它定义了输入和输出，dev-story 可以直接使用。
- **缺口：** SpecLite 的 customization 目前没有命名的步骤扩展点。SpecLite 需要在 workflow 里增加命名扩展点。

### 3.7 工艺类 Skill 属于个人，不属于项目

**问题：** 设计师用 impeccable 或 taste，后端开发者用不到。每装一个 Skill，它的描述每一轮都要占用上下文，还会增加错误触发 Skill 的风险。

**修改：**

- 个人 Skill 装在用户级目录，例如 `~/.claude/skills`。
- 项目只声明关卡需要的外部 Skill。
- 只有这些 Skill 需要声明、版本锁定和 doctor 检查。
- 上一版的精选清单和 profile 改成一份推荐文档。

### 3.8 两个问题用同一个模型

**问题：** 上一版引入了六个新概念。但外部知识和外部 Skill 需要的东西完全相同：身份、位置、版本锁定、信任等级、只读所有权、健康检查。

**修改：**

- 只用一个模型：外部依赖（External Dependency）。
- 内容类型决定使用方式：Agent 读取知识、检查规则、调用 Skill。
- 信任等级分三级：
  - 内部经过审查的知识库，信任最高。
  - 锁定了版本的社区 Skill，信任其次。
  - 没有锁定版本的社区 Skill，信任最低。
- 带脚本的 Skill 会在电脑上运行代码，要仔细检查。

### 3.9 SpecLite 只做需要流程状态的工作

| 工作 | 需要流程状态？ | 负责方 |
|---|---|---|
| 找到知识库路径 | 否 | SpecLite resolve（保持精简） |
| 在知识库内部检索 | 否 | 知识库自己 |
| 安装外部 Skill | 否 | 各自的原生安装渠道 |
| 为 Story 选择相关知识 | 是 | SpecLite（create-story） |
| 在关卡上检查规则 | 是 | SpecLite |
| 分析一次升级 | 是 | SpecLite |
| 定义产物契约 | 是 | SpecLite |
| 外部 Skill 的命令和提示词 | 否 | 上游作者 |

AGENTS.md 是基础层，所有 Agent 都会读它。SpecLite 不替代 AGENTS.md，只补上它做不到的部分：可移植的位置、Story 级知识、关卡检查、证据等级和版本锁定。

### 3.10 定义怎样衡量成功

**问题：** 上一版没有说明怎样判断方案有效。

**修改：**

- 做一次对照测试：
  1. 选 `wshoto-ka-vw-anhui` 里一个已完成的 Story。
  2. 运行两次 create-story 和 code-review：一次连接知识库，一次不连接。
  3. 比较两次运行发现的规则问题。
- 长期跟踪以下数值：
  - 关卡发现的规则问题数，和合并后才发现的规则问题数做对比。
  - 引用了规则 ID 的决策所占的比例。
  - 手工同步修改的次数。
  - 知识缺口的次数，以及其中回流到知识库的次数。

## 4. The New Design（新设计）

| 组成部分 | 内容 | 替代上一版的 |
|---|---|---|
| **外部依赖（External Dependency）** | 团队声明（提交到 Git）、本机位置（不提交）、版本锁定、内容类型、信任等级、只读所有权、doctor 检查 | knowledge source、companion、external ownership |
| **扩展点（Extension Point）** | workflow 中的一个命名步骤，加上一份产物契约。人、外部 Skill 或知识库自带的 Skill 都可以完成这个步骤。 | slot、profile、binding |
| **引用规则** | 依赖 ID + 位置或规则 ID + 版本 + 证据等级。每个 Story 有"知识引用"小节，每个知识缺口有一条记录。 | citation、drift |

## 5. Steps（落地步骤）

**步骤 1：用小改动验证价值。**

1. 为所有 Skill 增加一个全局 customization 层。
2. 增加一个从用户级配置读取的路径变量，例如 `{dependency:wshoto-scrm}`。
3. 在 create-story 模板里增加"知识引用"小节。
4. 在 code-review 里增加规则 ID 检查。
5. 在 `wshoto-ka-vw-anhui` 的下一个 Story 上做对照测试。
6. 如果 Story 级引用没有比只用 AGENTS.md 多发现问题，就停在这一步。

**步骤 2：增加版本锁定和升级分析。**

1. 请知识库团队给全局规范的规则补上规则 ID。
2. 增加版本锁定。
3. 增加升级影响分析。
4. 增加知识缺口记录。

**步骤 3：增加扩展点和产物契约。**

1. 先做两个产物契约：UX 视觉方向、UI 审查 findings。
2. 只有当某个关卡需要某个外部 Skill 时，才声明并锁定这个 Skill。

## 6. What Does Not Change（保持不变的决定）

- SpecLite 不保存、不复制、不修改知识库。
- SpecLite 不把外部 Skill 复制进自己的源码。
- 外部 Skill 由原生渠道安装，例如 `npx skills`、Claude Code marketplace，或 Skill 自带的安装工具。

## Evidence References（证据索引）

| 证据 | 位置 |
|---|---|
| customization 只按单个 Skill 叠三层，没有跨 Skill 的全局层 | [src/config/customization-reader.ts](../../../src/config/customization-reader.ts) |
| sdlc `customize.toml` 只有 `activation_steps_prepend/append`、`persistent_facts`、`on_complete`，没有命名的步骤扩展点 | `assets/source/speclite/sdlc-skills/*/*/customize.toml` |
| `.claude/skills/`、`.agents/skills/` 按路径前缀判为 installer-owned，没有 external 类别 | [src/update/ownership-model.ts](../../../src/update/ownership-model.ts) |
| 早期调研已提出外部 skill 源需要 lockfile/hash | [technical-speclite-bmad-tooling-system-design-research-2026-05-11.md](technical-speclite-bmad-tooling-system-design-research-2026-05-11.md) |
| 来源信任模型 | [ADR 0004](../adr/0004-source-descriptor-trust-model.md) |
| 全局规范（61 条规则，其中 48 条以"强制 / 禁止"开头） | 知识库 `instructions/scrm-global-development-guidelines.md` |
| 已有规则 ID：`CS-ENG-*`、`CS-GAP-*`、`GOV-*` | 知识库 `docs/03-wshoto-scrm-delivery/custom-services/`、`planning/system-consistency-todo.md` |
| task-handoff 契约（scrm-skills 的输入与输出） | 知识库 `docs/90-wshoto-scrm-support/contracts/task-handoff.md` |
| `knowledge_root` 与 `target_root` 分离 | 知识库 `scrm-skills/plugins/scrm-skills/skills/scrm-skills-overview/references/SCRM上下文契约.md` |
| 绝对路径与规范的同步副本 | 交付项目 `AGENTS.md`、`wshoto-scrm-base-knowledge/instructions/scrm-global-development-guidelines.md` |
| 手工跟进知识库变化 | 交付项目 `_speclite/backend-tech-stack.md`（v1.0 至 v1.3） |
| taste v2 重写 | [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) |
| `npx skills` 的项目级 `skills-lock.json` | [vercel-labs/skills sync](https://www.mintlify.com/vercel-labs/skills/commands/sync) |
| Claude Code 项目级 `enabledPlugins` 与插件依赖 | [Claude Code 组织级插件配置](https://code.claude.com/docs/de/plugins/org)、[插件依赖](https://code.claude.com/docs/de/plugins/dependencies.md) |
