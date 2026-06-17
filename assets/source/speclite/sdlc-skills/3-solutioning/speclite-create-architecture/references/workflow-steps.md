# 架构创建工作流 - 详细步骤索引

本文件是 `speclite-create-architecture` Skill 的步骤详细说明，由主入口 SKILL.md 引用。所有步骤的精确执行规则、A/P/C 协议、frontmatter 推进与微文件源文件保持一致；详细规则请同时阅读 `references/steps/step-XX-*.md` 原文件。

## 工作流总览

本工作流采用**微文件架构**确保纪律性执行：

- 每个步骤是一个自包含文件，含内嵌规则
- 顺序推进，每步用户控制
- 文档状态在 frontmatter 中追踪（`stepsCompleted` 数组）
- 通过对话以 append-only 方式构建文档
- **绝不**在当前步骤指示用户必须批准并明确继续之前推进到下一步骤文件

## 步骤索引（按顺序执行）

### Step 1：架构工作流初始化（`references/steps/step-01-init.md`）

- 检测既有工作流：扫描 `{planning_artifacts}/*architecture*.md`
- 若存在且 frontmatter 含 `stepsCompleted`：**立即停止**并加载 `references/steps/step-01b-continue.md`
- 若不存在：进行新工作流初始化
  - 输入文档发现：在 `{planning_artifacts}/**`、`{output_folder}/**`、`{project_knowledge}/**`、`{project-root}/docs/**` 范围内查找 `*brief*.md`、`*prd*.md`、`*ux-design*.md`、`*research*.md`、`**/project-context.md`，单文件未找到时回退查找 `*foo*/index.md` 分片目录
  - 必须与用户确认发现结果并询问是否补充
  - 加载规则：完整加载（无 offset/limit）；分片目录全量加载；index.md 优先；所有成功加载文件追踪到 frontmatter `inputDocuments`
  - 验证 PRD 必填，缺失则输出 "Architecture requires a PRD..." 并 HALT
  - 复制 `assets/architecture-decision-template.md` 到 `{planning_artifacts}/architecture.md`
  - 报告找到的文档数量，呈现 `[C] Continue` 菜单
- 用户选 C → 加载 `references/steps/step-02-context.md`

### Step 1b：工作流续作处理器（`references/steps/step-01b-continue.md`）

- 完整读取既有架构文档，分析 frontmatter（`stepsCompleted`、`inputDocuments`、`lastStep`）与正文章节
- 呈现续作摘要并提供菜单：`[R]` 从中断处恢复 / `[C]` 推进到下一步 / `[O]` 概览所有剩余步骤 / `[X]` 重新开始（需 y/n 二次确认）
- 根据 `stepsCompleted` 决定下一步加载哪个 step 文件
- 处理特殊情况：`stepsCompleted` 为空但有内容、文档损坏、文档完整但未标记完成

### Step 2：项目上下文分析（`references/steps/step-02-context.md`）

- 分析已加载文档（PRD、Epics、UX Spec）的架构含义
- 计算项目复杂度（实时特性、多租户、合规、集成、交互、数据复杂度）
- 把分析作为 "Project Context Analysis" 段落呈现并 A/P/C
- 仅 C 才追加到 `{planning_artifacts}/architecture.md` 并更新 `stepsCompleted: [1, 2]`

### Step 3：起始模板评估（`references/steps/step-03-starter.md`）

- 检查项目上下文中既有的技术偏好；若无则与用户讨论：语言/框架/数据库/团队经验/平台部署/集成偏好
- 识别主技术域（web/mobile/api/cli/full-stack/desktop）
- 考虑 UX 需求对起始模板的约束（动画/表单/实时/设计系统/离线）
- 通过 WebSearch 研究当前可用、维护中的 starter（含 CLI 命令、技术栈、项目结构、生产能力、维护状态）
- 按用户技能等级（专家/中级/初级）分别呈现选项
- 获取所选 starter 的精确当前 CLI 命令
- A/P/C，仅 C 才追加并更新 `stepsCompleted: [1, 2, 3]`
- **关键**：起始模板初始化命令应作为第一个实现 story

### Step 4：核心架构决策（`references/steps/step-04-decisions.md`）

- 复盘 Step 3 的技术偏好、starter 决策、项目上下文技术规则
- 识别尚未决策的关键事项，按优先级分类（Critical/Important/Nice-to-Have）
- 按 5 大类逐一协同决策：
    1. 数据架构（数据库、建模、校验、迁移、缓存）
    2. 认证与安全（认证方式、授权、安全中间件、加密、API 安全）
    3. API 与通信（REST/GraphQL、文档、错误处理、限流、服务间通信）
    4. 前端架构（状态管理、组件架构、路由、性能、打包）
    5. 基础设施与部署（托管、CI/CD、环境配置、监控、扩展）
- 每项涉及具体技术时必须 WebSearch 验证最新稳定版/LTS/生产就绪性
- 按用户技能等级（专家/中级/初级）调整解释深度
- 每项决策记录：类别、决定、版本、理由、影响、是否来自 starter
- 识别级联影响（"这个选择意味着我们还需要决定..."）
- A/P/C，仅 C 才追加并更新 `stepsCompleted: [1, 2, 3, 4]`

### Step 5：实现模式与一致性规则（`references/steps/step-05-patterns.md`）

- 识别 AI 智能体可能产生差异的潜在冲突点（命名、结构、格式、通信、流程）
- 按 5 大类协同定义模式：
    1. 命名模式（数据库表/列、API 端点/路由参数/查询参数/Header、代码组件/文件/函数/变量）
    2. 结构模式（项目组织、测试位置、组件组织、共享工具、文件结构）
    3. 格式模式（API 响应包装、错误格式、日期格式、JSON 字段命名）
    4. 通信模式（事件命名/载荷/版本控制、状态管理）
    5. 流程模式（错误处理、加载状态、重试、认证流、校验时机）
- 每个模式提供具体示例与反模式
- 输出 Enforcement Guidelines（"All AI Agents MUST..."）
- A/P/C，仅 C 才追加并更新 `stepsCompleted: [1, 2, 3, 4, 5]`

### Step 6：项目结构与边界（`references/steps/step-06-structure.md`）

- 把 Epics/FR Categories 映射到具体模块/目录/服务
- 定义完整目录结构：根配置文件、源码组织、测试组织、构建与分发
- 定义集成边界：API 边界、组件边界、数据边界
- 生成**完整、具体的项目树**（非通用占位符），按技术栈给出实际示例（Next.js Full-Stack、NestJS API 等）
- 显式映射 Epic/Feature 到目录（如 "Epic: User Management → src/components/features/users/、src/services/users/、prisma/migrations/_*users*_、tests/features/users/"）
- 处理 Cross-Cutting Concerns（认证系统等）的位置映射
- A/P/C，仅 C 才追加并更新 `stepsCompleted: [1, 2, 3, 4, 5, 6]`

### Step 7：架构验证与完成（`references/steps/step-07-validation.md`）

- 一致性验证：决策兼容性、版本兼容、模式一致性、结构对齐
- 需求覆盖验证：Epic/FR/NFR 全覆盖检查
- 实现就绪验证：决策完整性、结构完整性、模式完整性
- Gap Analysis：Critical/Important/Nice-to-Have 三级
- 协同解决发现的问题
- 输出 Architecture Completeness Checklist 与 Readiness Assessment
- 包含 Implementation Handoff（AI Agent Guidelines + First Implementation Priority）
- A/P/C，仅 C 才追加并更新 `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`

### Step 8：架构完成与交接（`references/steps/step-08-complete.md`）

- 祝贺用户完成
- 更新 frontmatter：

  ```yaml
  stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
  workflowType: 'architecture'
  lastStep: 8
  status: 'complete'
  completedAt: '{{current_date}}'
  ```

- Next Steps：提供中性的后续实施指引；提议回答有关架构文档的任何问题
- 执行 `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow.on_complete`；如解析出的值非空，作为退出前的最终终端指令执行
- 在 `{planning_artifacts}/architecture.md` 末尾追加生成标注：

  ```text
  ---

  *本文档由 speclite-create-architecture Skill 自动生成*
  ```

## A/P/C 协议集成

每个生成内容的步骤都必须呈现 A/P/C 菜单：

- **A (Advanced Elicitation)**：执行本步骤的 Advanced Elicitation 分支进行深度发现
- **P (Party Mode)**：执行本步骤的 Party Mode 分支引入多视角分析
- **C (Continue)**：保存内容并进入下一步
- A 或 P 完成后总是返回本步骤的 A/P/C 菜单；用户接受/拒绝协议变更后才能继续
- 落盘时机：**仅 C 才**追加到 `{planning_artifacts}/architecture.md` 并更新 `stepsCompleted`
- 跳出步骤时机：**禁止**在当前步骤未确认 C 之前加载下一步 step 文件
