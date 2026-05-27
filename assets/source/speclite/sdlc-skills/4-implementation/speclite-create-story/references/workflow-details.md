# speclite-create-story 完整工作流细节

本文件是 `speclite-create-story` 的完整操作规约。主 `SKILL.md` 为高频入口；本文件承载完整流程细节，执行时必须完整加载和遵循。

## 约定

- 裸路径（如 `discover-inputs.md`）相对于 skill 根目录解析。
- `{skill-root}` 解析为本 skill 的安装目录（即 `customize.toml` 所在位置）。
- 以 `{project-root}` 为前缀的路径相对于项目工作目录解析。
- `{speclite-runtime-root}` 解析为目标项目安装后的 SpecLite 运行目录，即 `{project-root}/_speclite`。
- `{skill-name}` 解析为 skill 目录的 basename（即 `speclite-create-story`）。
- `{project-root}/_speclite/config.toml` 是本 Skill 运行前由目标项目提供并维护的运行时配置文件；Skill 定义目录中的 `config.toml.example` 仅作字段结构参考，不参与运行时读取。

## 激活流程

本 Skill 在被触发后必须先执行下述 6 步激活，激活完成才进入执行流程。

### Activation Step 1：解析 Workflow 配置块

- 执行：`python3 {speclite-runtime-root}/scripts/resolve_customization.py --skill {skill-root} --key workflow`
- 如脚本失败，按 base → team → user 顺序读取以下三个文件，并应用与解析器相同的结构化合并规则自行解析 `workflow` 块：
  1. `{skill-root}/customize.toml`（默认值）
  2. `{speclite-runtime-root}/custom/{skill-name}.toml`（团队覆盖）
  3. `{speclite-runtime-root}/custom/{skill-name}.user.toml`（个人覆盖）
- 任何缺失文件直接跳过。合并规则：
  - 标量：覆盖
  - 表：深度合并
  - 以 `code` 或 `id` 为键的表数组：按键替换匹配项并追加新项
  - 其他数组：追加

### Activation Step 2：执行前置激活步骤

- 按顺序执行 `{workflow.activation_steps_prepend}` 中的每一项。

### Activation Step 3：加载持久事实

- 把 `{workflow.persistent_facts}` 中的每一项作为贯穿整个工作流运行期的基础上下文。
- 前缀为 `file:` 的条目是位于 `{project-root}` 下的路径或 glob，加载所引用的文件内容作为事实。
- 其他条目作为字面事实使用。
- 默认持久事实至少包含：`file:{project-root}/**/project-context.md` 与 `file:{project-root}/docs/**/*.md`。

### Activation Step 4：加载配置

- 从目标项目根下的 `{project-root}/_speclite/config.toml` 加载并解析。该文件必须在本 Skill 运行前已由用户人工维护或安装/初始化工具生成；若不存在或关键字段为空，应提示用户先初始化/补全配置并 HALT，不得回退读取 Skill 定义目录中的 `config.toml.example`：
  - `[core]`：`project_name`、`user_name`
  - `[core]`：`communication_language`、`document_output_language`（实际值使用确定枚举，例如 `Chinese` 或 `English`，不要使用 `Chinese / English` 占位值）
  - `[core]`：`user_skill_level`、`output_folder`
  - `[modules.sdlc]`：`planning_artifacts`、`implementation_artifacts`、`project_knowledge`
  - `date`（系统当前日期时间）
- 若 `project_knowledge` 存在且非空，把 `{project_knowledge}/**/*.md` 按 `file:` 持久事实格式加载为补充项目知识；默认值通常为 `{project-root}/docs`，与默认 `persistent_facts` 中的 docs glob 保持一致。

### Activation Step 5：问候用户

- 用 `{communication_language}` 向 `{user_name}` 打招呼。

### Activation Step 6：执行后置激活步骤

- 按顺序执行 `{workflow.activation_steps_append}` 中的每一项。

## 路径

- `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`
- `epics_file` = `{planning_artifacts}/epics.md`
- `prd_file` = `{planning_artifacts}/prd.md`
- `architecture_file` = `{planning_artifacts}/architecture.md`
- `ux_file` = `{planning_artifacts}/*ux*.md`
- `story_title` = ""（如果不能推断则向用户索取）
- `story_root` = `{implementation_artifacts}/stories`
- `default_output_file` = `{story_root}/{story_key}.md`
- `project_knowledge` = `{project-root}/docs`（可由 `{project-root}/_speclite/config.toml` 覆盖）

## 输入文件

| 输入 | 描述 | 路径模式 | 加载策略 |
| --- | --- | --- | --- |
| prd | PRD（兜底，epics 文件应已包含大部分内容） | 整文件 `{planning_artifacts}/*prd*.md`；分片 `{planning_artifacts}/*prd*/*.md` | SELECTIVE_LOAD |
| architecture | 架构（兜底，epics 文件应已包含相关章节） | 整文件 `{planning_artifacts}/*architecture*.md`；分片 `{planning_artifacts}/*architecture*/*.md` | SELECTIVE_LOAD |
| ux | UX 设计（兜底，epics 文件应已包含相关章节） | 整文件 `{planning_artifacts}/*ux*.md`；分片 `{planning_artifacts}/*ux*/*.md` | SELECTIVE_LOAD |
| epics | 增强后的 epics+stories 文件（含 BDD 与 source hints） | 整文件 `{planning_artifacts}/*epic*.md`；分片 `{planning_artifacts}/*epic*/*.md` | SELECTIVE_LOAD |

## 执行流程

### Step 1：确定目标 Story

#### 1.1 用户显式输入分支

- 若用户提供了 `{story_path}`，或给出了 epic 与 story 编号（如 "2-4"、"1.6"、"epic 1 story 5"）：
  - 解析用户输入：从 "1-2-user-auth" 这类格式中提取 `epic_num`、`story_num`、`story_title`。
  - 设置 `{epic_num}`、`{story_num}`、`{story_key}`。
  - 跳到 Step 2。

#### 1.2 检查 `sprint_status` 是否存在

- 若不存在，输出：

```text
🚫 未找到 sprint status 文件，且未指定 story
**必选项：**
1. 运行 `sprint-planning` 初始化 sprint 跟踪（推荐）
2. 提供具体的 epic-story 编号（例如 "1-2-user-auth"）
3. 如果 sprint status 尚不存在，提供 story 文档路径
```

- 询问：`选择 [1]、提供 epic-story 编号、提供 story 文档路径，或输入 [q] 退出：`
- 用户选 `q`：HALT，无需任何工作。
- 用户选 `1`：输出 `请先运行 sprint-planning 工作流以创建 sprint-status.yaml`，HALT。
- 用户提供 epic-story 编号：解析并设置变量，跳到 Step 2。
- 用户提供 story 文档路径：使用该路径，跳到 Step 2。

#### 1.3 自动发现（仅在无用户输入时）

- 必须从头到尾完整读取 `{sprint_status}` 文件以保留顺序，不要跳过任何内容。
- 完整解析 `development_status` 区块。
- 按从上到下顺序找到第一条满足全部条件的 story：
  - key 形如 `数字-数字-名称`（例如 "1-2-user-auth"）。
  - 不是 epic key（`epic-X`）或 retrospective（`epic-X-retrospective`）。
  - 状态值等于 `backlog`。
- 若未找到 backlog story，输出：

```text
📋 sprint-status.yaml 中未发现 backlog story
所有 story 要么已创建、正在进行，要么已完成。
**可选操作：**
1. 运行 sprint-planning 刷新 story 跟踪
2. 加载 PM 智能体并运行 correct-course 添加更多 story
3. 检查当前 sprint 是否完成并运行 retrospective
```

- HALT。
- 从找到的 story key（如 "1-2-user-authentication"）中提取：
  - `epic_num` = 第一个短横线之前的数字（如 "1"）。
  - `story_num` = 第一个短横线之后的数字（如 "2"）。
  - `story_title` = 第二个短横线之后的剩余部分（如 "user-authentication"）。
- 设置 `{story_id}` = "{epic_num}.{story_num}"，保存 `story_key` 供后续使用。

#### 1.4 Epic 状态机维护

- 通过查找 `{epic_num}-1-*` 模式判断是否为该 epic 的第一个 story。
- 若是该 epic 的第一个 story：
  - 加载 `{sprint_status}` 并检查 `epic-{epic_num}` 状态。
  - `backlog` → 更新为 `in-progress`。
  - `contexted`（旧状态）→ 更新为 `in-progress`（向后兼容）。
  - `in-progress` → 无需变更。
  - `done` → 输出 `🚫 错误：无法在已完成的 epic 中创建 story / Epic {epic_num} 已被标记为 'done'`，并提示用户手动改回 in-progress 或新建 epic，HALT。
  - 不属于 backlog/contexted/in-progress/done → 输出 `🚫 错误：epic 状态非法 '{epic_status}'，期望值为 backlog/in-progress/done`，提示手动修复 sprint-status.yaml 或运行 sprint-planning，HALT。
  - 状态变更后输出：`📊 Epic {epic_num} 状态已更新为 in-progress`。
- 跳到 Step 2。

### Step 2：加载并分析核心制品

必须穷尽式分析制品，这是预防未来开发者犯错的关键。

#### 2.1 通过发现协议加载所有可用内容

- 完整阅读并遵循 `references/discover-inputs.md` 加载所有输入文件。
- 可用内容：`{epics_content}`、`{prd_content}`、`{architecture_content}`、`{ux_content}`，以及激活时通过 `persistent_facts` 加载的 project-context 事实。

#### 2.2 EPIC 分析

- 从 `{epics_content}` 中提取 Epic `{epic_num}` 的完整上下文：
  - Epic 目标与业务价值。
  - 本 epic 内的所有 story（用于跨 story 上下文）。
  - 本 story 的具体需求、user story 陈述、验收标准。
  - 技术需求与约束。
  - 对其他 story/epic 的依赖。
  - 指向原始文档的 source hints。

#### 2.3 STORY 基础提取

- 提取本 story（`{epic_num}-{story_num}`）的细节：
  - User story 陈述（As a / I want / so that）。
  - 详细验收标准（已经是 BDD 格式）。
  - 本 story 特有的技术需求。
  - 业务上下文与价值。
  - 成功标准。

#### 2.4 上一 Story 情报（条件：`story_num > 1`）

- 查找 `{previous_story_num}`：在 `{story_root}` 中扫描 epic `{epic_num}` 内 story 编号小于 `{story_num}` 的最大编号 story 文件。
- 加载上一个 story 文件：`{story_root}/{epic_num}-{previous_story_num}-*.md`。
- 提取：dev notes 与经验、评审反馈与修正点、创建/修改过的文件及模式、有效/无效的测试方式、遇到的问题与解决方案、已建立的代码模式。
- 提取所有可能影响当前 story 实现的经验。

#### 2.5 Git 情报（条件：存在上一个 story 且检测到 git 仓库）

- 获取最近 5 条提交标题以了解近期工作模式。
- 分析最近 1-5 条提交与当前 story 的相关性：
  - 创建/修改过的文件。
  - 使用过的代码模式与约定。
  - 新增/变更过的库依赖。
  - 已实现的架构决策。
  - 使用过的测试方法。
- 提取对当前 story 实现具有可操作性的洞察。

### Step 3：架构分析以构建开发者护栏

#### 3.1 加载架构（整文件或分片）

- 单个文件：加载完整 `{architecture_content}`。
- 分片到目录：加载架构索引并扫描所有架构文件。

#### 3.2 关键架构提取

- 对每个架构章节判断是否与本 story 相关，并按以下分类提取：
  - 技术栈：语言、框架、库及其版本。
  - 代码结构：目录组织、命名规范、文件模式。
  - API 模式：服务结构、端点模式、数据契约。
  - 数据库 Schema：与 story 相关的表、关系、约束。
  - 安全要求：认证模式、授权规则。
  - 性能要求：缓存策略、优化模式。
  - 测试标准：测试框架、覆盖率预期、测试模式。
  - 部署模式：环境配置、构建流程。
  - 集成模式：外部服务集成、数据流。
- 提取任何开发者必须遵循的 story 专属要求。
- 识别任何会覆盖既有模式的架构决策。

#### 3.3 阅读将被修改的既有代码

- 从架构目录结构中识别本 story 将触及的、所有标记为 UPDATE（不是 NEW）的文件。
- 完整阅读每一个相关的 UPDATE 文件，在 dev notes 中为每个文件记录三段：
  - 现状：它今天做什么（状态机、API 调用、数据形态、既有行为）。
  - 本 story 改什么：被修改的具体段落或行为。
  - 必须保留什么：本 story 不能破坏的既有交互与行为。
- 一个 story 的实现必须让系统继续端到端运行，不仅仅是满足显式列出的 ACs。如果一个行为是该功能在既有系统中正确工作所必需的，那它就是一个需求，无论 story 中是否显式写出，dev 智能体对此负责。

### Step 4：进行网络研究以获取最新技术细节

#### 4.1 识别需要最新版本知识的具体技术领域

- 从架构分析中识别具体的库、API 或框架。

#### 4.2 对每项关键技术研究最新稳定版本与关键变化

- 最新 API 文档与破坏性变更。
- 安全漏洞或更新。
- 性能改进或弃用。
- 当前版本的最佳实践。

#### 4.3 把开发者所需的关键最新信息写入 story

- 选定的库版本及选用理由。
- API 端点（含参数与认证）。
- 近期安全补丁或注意事项。
- 性能优化技巧。
- 升级时的迁移注意事项。

### Step 5：创建完整的 Story 文件

#### 5.1 从模板初始化

- 确保 `{story_root}` 目录存在；如果缺失，先创建该目录。不得把 Story 文件写回 `{implementation_artifacts}` 根目录。
- 读取 `assets/story-template.md` 中 fenced markdown 代码块内的内容作为模板基底，初始化 `{default_output_file}`。
- 模板中的双括号变量（如 `{{role}}`、`{{action}}`、`{{benefit}}`、`{{agent_model_name_version}}`）属于运行时动态填充变量；不要在 Skill 定义中硬编码这些值。

#### 5.2 按以下 template-output 段名顺序渲染

必填段（DEV 智能体护栏）：

1. `story_header`
2. `story_requirements`
3. `developer_context_section`（最重要的部分）
4. `technical_requirements`
5. `architecture_compliance`
6. `library_framework_requirements`
7. `file_structure_requirements`
8. `testing_requirements`
9. `dependency_gate`
10. `anchor_contract_map`
11. `equivalent_implementation_policy`
12. `evidence_plan`

条件段：

- 第 13 段：`previous_story_intelligence`（条件：存在上一个 story 的可用经验）
- 第 14 段：`git_intelligence_summary`（条件：已完成 git 分析）
- 第 15 段：`latest_tech_information`（条件：已完成网络研究）

收尾段：

- 第 16 段：`project_context_reference`
- 第 17 段：`anchor_evidence_summary_placeholder`
- 第 18 段：`story_completion_status`

#### 5.2.1 Anchor 与 Gate 写法规则

- `dependency_gate` 必须列出本 Story 启动前依赖的前序能力，并说明如何用 `Contract -> Functional -> Evidence` 检查。
- `anchor_contract_map` 必须把每个前置依赖分类为 `Contract Anchor`、`Functional Anchor`、`Evidence Anchor` 或 `Guidance Anchor`。
- 固定文件名只有在 owning SPEC 明确要求时才能作为 hard gate；否则必须写成 suggested path，并补充 equivalent implementation policy。
- `evidence_plan` 必须列出预期测试、fixture、snapshot 或命令证据。
- `anchor_evidence_summary_placeholder` 保留给 `speclite-dev-story` 在 Story 完成前填写；create-story 只写占位说明，不伪造实现证据。

#### 5.3 状态与备注

- 将 story `Status` 设置为：`ready-for-dev`。
- 添加完成备注：`终极上下文引擎分析已完成 —— 已创建完整的开发者指南`。

#### 5.4 文件末尾追加生成标注

```text
---

*本文档由 speclite-create-story Skill 自动生成*
```

### Step 6：更新 sprint 状态并收尾

#### 6.1 校验

- 使用 `references/checklist.md` 校验新创建的 story 文件 `{default_output_file}`，并在收尾前应用所有修复。
- 无条件保存 story 文档。

#### 6.2 更新 sprint 状态（条件：sprint status 文件存在）

- 加载完整文件并读取 `development_status` 的所有条目。
- 找到与 `{story_key}` 匹配的 `development_status` key。
- 校验当前状态为 `backlog`（预期前置状态）。
- 更新 `development_status[{story_key}]` = `ready-for-dev`。
- 把 `last_updated` 字段更新为当前日期。
- 保存文件，保留所有注释与结构（含 STATUS DEFINITIONS）。

#### 6.3 报告完成

输出：

```text
**🎯 终极 SpecLite STORY 上下文已创建，{user_name}！**

**Story 详情：**
- Story ID：{story_id}
- Story Key：{story_key}
- 文件：{story_file}
- 状态：ready-for-dev

**后续步骤：**
1. 在 {story_file} 中审阅完整的 story
2. 运行 dev 智能体的 `dev-story` 进行优化实现
3. 完成后运行 `code-review`（自动标记为 done）
4. 可选：若已安装 Test Architect 模块，可在 `dev-story` 后运行对应的自动化测试生成流程来补充护栏测试

**开发者现已拥有无瑕实现所需的一切！**
```

#### 6.4 执行 on_complete 终止指令

- 执行：`python3 {speclite-runtime-root}/scripts/resolve_customization.py --skill {skill-root} --key workflow.on_complete`。
- 如果解析出的值非空，把它作为退出前的最终终端指令执行。
