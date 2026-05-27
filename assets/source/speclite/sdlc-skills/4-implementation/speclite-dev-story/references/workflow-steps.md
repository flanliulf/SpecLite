# Workflow Steps（主工作流详细步骤）

> 本文件为 `speclite-dev-story` 主工作流的权威定义。所有 Step 必须**严格按顺序执行**，禁止跳过。
> 激活流程见 `activation.md`，完成定义校验清单见 `checklist.md`。

## 路径

- `story_file` = ""（用户显式指定的 Story 路径；为空则自动发现）
- `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`
- `story_root` = `story_location` from `{sprint_status}` when present, otherwise `{implementation_artifacts}/stories`
- `flow_gate_root` = `{implementation_artifacts}/flow-gates`

## 关键约束（贯穿全部 Step）

- 所有响应使用 `{communication_language}`，语言风格根据 `{user_skill_level}` 调整
- 所有文档使用 `{document_output_language}` 生成
- **只能**修改 Story 文件的以下区域：Tasks/Subtasks 复选框、Dev Agent Record（Debug Log、Completion Notes）、File List、Change Log、Status
- **必须**严格按顺序执行所有步骤，禁止跳过
- **绝对禁止**因"阶段性里程碑"、"显著进展"或"会话边界"而停止；必须在一次执行内持续工作直到 Story **完成**（所有 ACs 满足、所有任务/子任务勾选完毕），除非触发 HALT 条件或用户另有指示
- 除非触发 HALT 条件，**禁止**安排"下一次会话"或请求暂停以待评审；只有 Step 9 才能决定完成
- `{user_skill_level}` 仅影响对话风格，**不影响**代码更新内容

---

## Step 1：定位下一条就绪 Story 并完整加载

### 1.1 用户显式输入分支
- 若用户提供了 `{story_path}`：
    · 直接使用 `{story_path}`
    · **完整读取**该 Story 文件
    · 从文件名或元数据中提取 `story_key`
    · 跳到 1.4（task_check）

### 1.2 基于 sprint-status 的发现（条件：`{sprint_status}` 文件存在）
- **关键**：必须从头到尾**完整读取** `sprint-status.yaml` 文件以保留顺序
- 加载完整文件 `{sprint_status}`，从首行读到末行，禁止跳读
- 完整解析 `development_status` 段以理解 Story 顺序
- 解析 `story_location`；若缺失，设置 `story_root = {implementation_artifacts}/stories`。后续 Story 文件查找必须使用 `story_root`。
- 按从上到下顺序找到**第一条**满足以下全部条件的 Story：
    · key 形如 `数字-数字-名称`（如 "1-2-user-auth"）
    · 不是 epic key（`epic-X`）或 retrospective（`epic-X-retrospective`）
    · 状态值等于 `ready-for-dev`
- 若**未找到** `ready-for-dev` 或 `in-progress` Story：

    输出："📋 sprint-status.yaml 中未发现 ready-for-dev Story

    **当前 Sprint 状态：** {sprint_status_summary}

    **可选操作：**
    1. 运行 `create-story` 从 epics 创建下一条 Story（携完整上下文）
    2. 运行 `*validate-create-story` 在开发前优化已有 Story（推荐质量检查）
    3. 指定具体的 Story 文件路径进行开发
    4. 检查 {sprint_status} 查看当前 Sprint 状态

    💡 **提示：** `ready-for-dev` 状态的 Story 可能尚未被验证，建议先运行 `validate-create-story` 做一次质量检查。"

    询问："选择 [1]、[2]、[3] 或 [4]，或直接提供 Story 文件路径："
    · 用户选 '1' → HALT，提示运行 `create-story`
    · 用户选 '2' → HALT，提示运行 `validate-create-story`
    · 用户选 '3' → 询问 Story 路径，存为 `{story_path}`，跳到 1.4
    · 用户选 '4' → 输出"正在加载 {sprint_status} 进行详细状态审阅..."，展示 sprint 状态详情，HALT
    · 用户提供 Story 路径 → 存为 `{story_path}`，跳到 1.4

### 1.3 无 sprint-status 的发现（条件：`{sprint_status}` 文件**不存在**）
- 设置 `story_root = {implementation_artifacts}/stories`，直接在 `{story_root}` 下搜索 Story 文件
- 查找文件名匹配 `*-*-*.md` 模式的候选 Story
- 逐个读取候选 Story 文件，检查 Status 段，找到状态为 `ready-for-dev` 的
- 若**未找到**：

    输出："📋 未找到 ready-for-dev 的 Story

    **可选操作：**
    1. 运行 `create-story` 从 epics 创建下一条 Story
    2. 运行 `*validate-create-story` 优化已有 Story
    3. 指定要开发的 Story"

    询问："选择 [1]、[2] 或 [3]："
    · 用户选 '1' → HALT，提示运行 `create-story`
    · 用户选 '2' → HALT，提示运行 `validate-create-story`
    · 用户选 '3' → 询问"无法判断你想开发哪条 Story，请提供完整的 Story 文件路径："，存为 `{story_path}`，继续
- 若**找到**：使用发现的 Story 文件并提取 `story_key`

### 1.4 task_check 锚点：完整加载 Story
- 保存找到的 `story_key`（如 "1-2-user-authentication"）以备后续状态更新
- 在 `{story_root}` 中按 `{story_key}.md` 模式匹配 Story 文件
- **完整读取**发现路径下的 Story 文件
- 解析以下区段：Story、Acceptance Criteria、Tasks/Subtasks、Dev Notes、Dev Agent Record、File List、Change Log、Status
- 从 Story 文件 Dev Notes 段加载完整上下文
- 从 Dev Notes 提取开发者指引：架构需求、上一 Story 经验、技术规格
- 用增强后的 Story 上下文指导实现决策与方法
- 找到 Tasks/Subtasks 中**第一个**未完成（未勾选 `[ ]`）的任务
- 若**没有**未完成任务 → 跳到 Step 9（完成序列）
- 若 Story 文件不可访问 → HALT："Cannot develop story without access to story file"
- 若未完成任务/子任务的需求模糊 → 询问用户澄清，或 HALT

---

## Step 2：加载项目上下文与 Story 信息

**关键**：加载所有可用上下文以指导实现

- 2.1 加载 `{project_context}`（如存在）以获取编码标准与项目级模式
- 2.2 解析 Story 区段：Story、Acceptance Criteria、Tasks/Subtasks、Dev Notes、Dev Agent Record、File List、Change Log、Status
- 2.3 从 Story 文件 Dev Notes 段加载完整上下文
- 2.4 从 Dev Notes 提取开发者指引：架构需求、上一 Story 经验、技术规格
- 2.5 用增强后的 Story 上下文指导实现决策与方法
- 2.6 输出："✅ **上下文已加载** —— Story 与项目上下文已就绪，可用于实现"

---

## Step 3：检测评审延续并提取评审上下文

**关键**：判断本次是从零开始还是在代码评审之后继续

- 3.1 检查 Story 文件中是否存在 "Senior Developer Review (AI)" 段
- 3.2 检查 Tasks/Subtasks 下是否存在 "Review Follow-ups (AI)" 子段

### 3.3 若 "Senior Developer Review (AI)" 段**存在**
- 设置 `review_continuation = true`
- 从该段提取：
    · 评审结论（Approve / Changes Requested / Blocked）
    · 评审日期
    · 全部行动项及复选框（统计已勾选 vs 未勾选）
    · 严重度分布（High / Med / Low 计数）
- 在 "Review Follow-ups (AI)" 子段统计未勾选 `[ ]` 的评审跟进任务
- 把未勾选评审项列表存为 `{pending_review_items}`
- 输出："⏯️ **代码评审后继续 Story** ({review_date})

    **评审结论：** {review_outcome}
    **行动项：** 还有 {unchecked_review_count} 项需处理
    **优先级：** High {high_count}、Medium {med_count}、Low {low_count}

    **策略：** 优先处理标记为 [AI-Review] 的评审跟进任务，再继续常规任务。"

### 3.4 若 "Senior Developer Review (AI)" 段**不存在**
- 设置 `review_continuation = false`
- 设置 `{pending_review_items}` = 空
- 输出："🚀 **开始全新实现**

    Story：{story_key}
    Story 状态：{current_status}
    第一个未完成任务：{first_task_description}"

---

## Step 4：把 Story 标记为 in-progress（sprint-status 同步）

### 4.0 Flow Gate 前置检查
- 在任何状态写入之前，执行 `speclite-flow-gate` 的 `story-kickoff` mode，目标为 `{story_key}` 或当前 Story 文件路径。
- 读取 gate report，确认结果为 `PASS` 或 `PASS_EQUIVALENT`。
- 若结果为 `FAIL_CONTRACT`、`FAIL_FUNCTION`、`FAIL_EVIDENCE` 或 `DECISION_NEEDED`，立即 HALT，不得把 Story 或 sprint-status 推进到 `in-progress`。
- 若缺少 gate report，先运行 `speclite-flow-gate mode=story-kickoff` 并等待结果；不得以“文件名存在”代替 gate 结果。

### 4.1 若 `{sprint_status}` 文件存在
- 加载完整文件 `{sprint_status}`
- 读取所有 `development_status` 条目，定位 `{story_key}`
- 取得 `development_status[{story_key}]` 的当前状态值
- 若当前状态 == `ready-for-dev` **或** `review_continuation == true`：
    · 在 sprint status 报告中把该 Story 状态更新为 `in-progress`
    · 把 `last_updated` 更新为当前日期
    · 输出："🚀 开始处理 Story {story_key} —— 状态更新：ready-for-dev → in-progress"
- 若当前状态 == `in-progress`：
    · 输出："⏯️ 继续处理 Story {story_key} —— Story 已处于 in-progress"
- 若当前状态既不是 `ready-for-dev` 也不是 `in-progress`：
    · 输出："⚠️ 非预期 Story 状态：{current_status} —— 期望 ready-for-dev 或 in-progress。继续执行..."
- 保存 `{current_sprint_status}` 供后续使用

### 4.2 若 `{sprint_status}` 文件不存在
- 输出："ℹ️ 未发现 sprint status 文件 —— Story 进度仅在 Story 文件内跟踪"
- 设置 `{current_sprint_status}` = `no-sprint-tracking`

---

## Step 5：按红-绿-重构循环实现任务

**关键**：严格按照 Story 文件 Tasks/Subtasks 顺序执行 —— **不得偏离**

- 5.1 审阅 Story 文件中的当前任务/子任务 —— 这是权威实现指南
- 5.2 按红-绿-重构（red-green-refactor）循环规划实现

### 5.3 RED 阶段
- 为该任务/子任务的功能**先写失败测试**
- 在实现之前确认测试**失败** —— 这验证了测试的正确性

### 5.4 GREEN 阶段
- 编写**最小代码**让测试通过
- 运行测试确认其通过
- 按任务/子任务规格处理错误条件与边界情况

### 5.5 REFACTOR 阶段
- 在保持测试通过的前提下改善代码结构
- 确保代码遵循 Dev Notes 中的架构模式与编码标准

### 5.6 记录
- 把技术方案与决策记录到 Dev Agent Record → Implementation Plan

### 5.7 HALT 条件
- 若需要 Story 规格之外的新依赖 → HALT："Additional dependencies need user approval"
- 若连续 3 次实现失败 → HALT 并请求指导
- 若所需配置缺失 → HALT："Cannot proceed without necessary configuration files"

### 5.8 关键约束
- **绝不**实现任何未映射到 Story 文件具体任务/子任务的内容
- **绝不**在当前任务/子任务**完成且测试通过**之前推进到下一任务
- 持续不间断执行直到所有任务/子任务完成或显式 HALT 条件触发
- 在 Step 9 完成门未满足之前**禁止**提议暂停以待评审

---

## Step 6：编写完整测试

- 6.1 为该任务引入/修改的业务逻辑与核心功能创建**单元测试**
- 6.2 为 Story 需求所规定的组件交互添加**集成测试**
- 6.3 当 Story 需求要求时，为关键用户流程添加**端到端测试**
- 6.4 覆盖 Story Dev Notes 中识别的边界情况与错误处理场景

---

## Step 7：运行校验与测试

- 7.1 判定本仓库的测试运行方式（从项目结构推断测试框架）
- 7.2 运行**全部已有测试**确保无回归
- 7.3 运行新测试验证实现正确性
- 7.4 若项目配置了 lint 与代码质量检查，则运行
- 7.5 验证实现满足 Story **所有 Acceptance Criteria**；显式强制量化阈值

### 7.6 失败处理
- 若回归测试失败 → **停止**并修复后再继续，立即定位破坏性变更
- 若新测试失败 → **停止**并修复后再继续，确保实现正确

---

## Step 8：仅在完全完成时校验并标记任务为完成

**关键**：除非满足**全部**条件，绝不把任务标记为完成 —— **禁止说谎或作弊**

### 8.1 校验门
- 验证该任务/子任务的**所有测试确实存在**且 100% 通过
- 确认实现**严格符合**任务/子任务规格 —— 不要多余功能
- 验证与该任务相关的**所有 Acceptance Criteria** 已满足
- 运行完整测试集，确保**未引入任何回归**

### 8.2 评审跟进任务处理（若任务带有 `[AI-Review]` 前缀）
- 提取评审项详情（严重度、描述、相关 AC/文件）
- 加入解决跟踪列表 `{resolved_review_items}`
- 在 Tasks/Subtasks → Review Follow-ups (AI) 段把任务复选框标为 `[x]`
- **关键**：在 Senior Developer Review (AI) → Action Items 段中按描述匹配对应行动项，并把其复选框标为 `[x]` 表示已解决
- 在 Dev Agent Record → Completion Notes 添加："✅ Resolved review finding [{severity}]: {description}"

### 8.3 仅在所有校验门通过时标记完成
- 若**所有**校验门通过、测试**确实存在并通过**：
    · **才**把任务（及子任务）复选框标为 `[x]`
    · 用本次新建/修改/删除的**所有**文件更新 File List 段（路径相对仓库根）
    · 在 Dev Agent Record 添加 Completion Notes，总结**实际实现并测试过的内容**

### 8.4 任意校验失败
- **不得**把任务标记为完成 —— 先修复
- 若无法修复 → HALT

### 8.5 评审延续场景的 Change Log 记录（条件：`review_continuation == true` 且 `{resolved_review_items}` 非空）
- 统计本会话已解决的评审项总数
- 添加 Change Log 条目："Addressed code review findings - {resolved_count} items resolved (Date: {date})"

### 8.6/8.7 收尾
- 8.6 保存 Story 文件
- 8.7 判断是否还有未完成任务
    · 仍有任务 → 跳到 Step 5（下一个任务）
    · 已无任务 → 跳到 Step 9（完成）

---

## Step 9：Story 完成并标记为 review（sprint-status 同步）

### 9.1 完整性核对
- 重新扫描 Story 文档，验证**所有**任务和子任务都已标记 `[x]`
- 运行**完整回归测试集**（不可跳过）
- 确认 File List 包含所有变更文件
- 填写 Dev Agent Record → Anchor Evidence Summary，记录 contract anchors、functional anchors、evidence anchors 和 equivalent implementation decisions
- 执行增强版 Definition of Done 校验
- 执行 `speclite-flow-gate mode=story-completion`，目标为 `{story_key}` 或当前 Story 文件路径；只有 `PASS` 或 `PASS_EQUIVALENT` 允许继续
- 把 Story Status 更新为：`review`

### 9.2 增强版 Definition of Done 校验（必要要求）
- 所有任务/子任务以 `[x]` 标记完成
- 实现满足**每一条** Acceptance Criterion
- 已为核心功能添加/更新单元测试
- 当需要时已为组件交互添加集成测试
- 当 Story 要求时已为关键流程添加端到端测试
- 所有测试通过（无回归、新测试成功）
- 代码质量检查通过（若已配置 lint、静态分析）
- File List 包含每个新建/修改/删除的文件（相对路径）
- Dev Agent Record 包含实现说明
- Anchor Evidence Summary 包含 gate 结果、已验证 anchors 和等价实现裁决
- Change Log 包含变更摘要
- **仅修改了允许的 Story 区段**

> 完整 DoD 检查清单见 `checklist.md`。

### 9.3 把 Story 标记为待评审 —— sprint-status 条件分支
- 若 `{sprint_status}` 文件存在且 `{current_sprint_status}` != `no-sprint-tracking`：
    · 加载完整文件 `{sprint_status}`
    · 找到与 `{story_key}` 匹配的 `development_status` key
    · 验证当前状态为 `in-progress`（预期前置状态）
    · 更新 `development_status[{story_key}]` = `review`
    · 把 `last_updated` 字段更新为当前日期
    · 保存文件，**保留所有注释与结构（含 STATUS DEFINITIONS）**
    · 输出："✅ Story 状态已在 sprint-status.yaml 中更新为 review"
- 若 `{sprint_status}` 文件**不存在**或 `{current_sprint_status}` == `no-sprint-tracking`：
    · 输出："ℹ️ Story 状态已在 Story 文件中更新为 review（未配置 sprint 跟踪）"
- 若 sprint status 中找不到 story key：
    · 输出："⚠️ Story 文件已更新，但 sprint-status 更新失败：未找到 {story_key} —— Story 状态在文件中已设为 review，但 sprint-status.yaml 可能不一致。"

### 9.4 最终校验门
- 任意任务未完成 → HALT - 完成剩余任务后再标记为待评审
- 存在回归失败 → HALT - 修复回归后再完成
- File List 不完整 → HALT - 用所有变更文件更新 File List
- Definition of Done 校验未通过 → HALT - 处理 DoD 失败项后再完成
- `story-completion` gate 缺失或失败 → HALT - 先补齐 contract/function/evidence 或修订 Story

---

## Step 10：完成沟通与用户支持

- 10.1 使用校验框架执行增强版 Definition of Done 检查清单（参见 `checklist.md`）
- 10.2 在 Dev Agent Record → Completion Notes 准备简洁摘要
- 10.3 用 `{communication_language}` 向 `{user_name}` 沟通：Story 实现已完成、待评审
- 10.4 总结关键成果：Story ID、Story Key、标题、关键变更、新增测试、修改文件
- 10.5 提供 Story 文件路径和当前状态（现已为 `review`）

### 10.6 询问用户是否需要讲解
基于 `{user_skill_level}`，询问用户是否需要任何讲解：
- 实现了什么、如何工作
- 为何采用某些技术决策
- 如何测试或验证变更
- 使用了哪些模式、库或方法
- 其他想要澄清的内容

### 10.7 若用户要求讲解
- 根据 `{user_skill_level}` 提供清晰、有上下文的解释
- 适当使用示例并引用具体代码

### 10.8 建议下一步合理动作
- 审阅已实现的 Story 并测试变更
- 验证所有 Acceptance Criteria 已满足
- 若适用，确认部署就绪
- 运行 `code-review` 工作流进行同行评审
- 可选：若已安装 Test Architect 模块，运行对应的自动化测试生成流程来扩充护栏测试

### 10.9 / 10.10 / 10.11
- 10.9 输出："💡 **提示：** 为获得最佳效果，请使用与本次实现**不同的** LLM 来运行 `code-review`。"
- 10.10 若 `{sprint_status}` 文件存在：建议查阅 `{sprint_status}` 了解项目进度
- 10.11 保持灵活 —— 允许用户选择自己的路径或寻求其他帮助

### 10.12 执行 on_complete 终止指令
- 执行：`speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow.on_complete`
- 如果解析出的值非空，把它作为退出前的最终终端指令执行
