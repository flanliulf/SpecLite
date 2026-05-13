# 第十五章：四阶段方法论（Analysis → Planning → Solutioning → Implementation）

> "1-analysis, 2-planning, 3-solutioning, 4-implementation"
>
> — src/bmm-skills/ 的目录结构

---

## 阶段化的力量

打开 BMAD-METHOD 的 `src/bmm-skills/` 目录，你会看到：

```
bmm-skills/
├── 1-analysis/
├── 2-planning/
├── 3-solutioning/
└── 4-implementation/
```

这个目录结构编码了 BMAD-METHOD 的核心方法论：**四阶段开发**。

为什么是四个阶段？为什么是这个顺序？

## 问题定义：开发流程的本质

### 传统瀑布模型

```
需求 → 设计 → 编码 → 测试 → 部署
```

**问题**：
- 阶段之间难以回溯
- 假设需求一开始就清晰
- AI 时代失效（迭代速度太快）

### 敏捷模型

```
迭代1: 需求→设计→编码→测试
迭代2: 需求→设计→编码→测试
...
```

**问题**：
- 每次迭代仍需要"小型瀑布"
- 缺乏整体方向感
- AI 时代变量太多

### BMAD-METHOD 的四阶段模型

```
1. Analysis（分析）：理解问题
   ↓
2. Planning（规划）：定义解决方案
   ↓
3. Solutioning（设计）：技术决策
   ↓
4. Implementation（实施）：编码与审查
```

**关键差异**：
- 不是线性瀑布（每阶段可回溯）
- 不是无序迭代（有清晰阶段）
- AI 友好（每阶段有专属 Skills）

---

## 阶段 1：Analysis（分析）

### 核心问题

> "我们要解决什么问题？"

### Skills 与 Agent

**Skills**（在 `src/bmm-skills/1-analysis/` 中）：
- `bmad-brainstorming`：引导式头脑风暴
- `bmad-advanced-elicitation`：高级需求提取
- `create-brief`：创建产品简报

**Agent**：Mary（Business Analyst）

### 输出

**主要产物**：
- 项目简报（Project Brief）
- 头脑风暴记录
- 需求初稿

**示例**：
```markdown
# Project Brief: CRM System

## 问题陈述
销售团队使用 Excel 管理客户，导致：
- 数据分散
- 协作困难
- 报表手工

## 目标用户
- 销售代表（30 人）
- 销售经理（5 人）
- 高管（3 人）

## 核心需求
1. 客户信息集中管理
2. 销售流程跟踪
3. 自动化报表
```

### 设计意图

**为什么先 Analysis 而非直接 Planning**？

- **避免方案先行**：不要在理解问题前设计方案
- **挖掘真实需求**：用户说的需求 ≠ 真正需求
- **降低返工成本**：在分析阶段调整远比在编码阶段调整便宜

---

## 阶段 2：Planning（规划）

### 核心问题

> "我们要做什么？做到什么程度？"

### Skills 与 Agent

**Skills**（在 `src/bmm-skills/2-planning/` 中）：
- `create-prd`：创建产品需求文档
- `create-prfaq`：创建 PR/FAQ（Amazon 风格）

**Agent**：John（Product Manager）

### 输出

**主要产物**：
- PRD（Product Requirements Document）
- 验收标准
- 优先级矩阵

**示例**：
```markdown
# PRD: CRM System

## FR-1: 客户管理
- 创建/编辑/删除客户
- 客户标签与分组
- 验收标准：
  - AC-1.1: 用户可在 < 10 秒内创建客户
  - AC-1.2: 支持批量导入（CSV）
  - AC-1.3: 删除有二次确认

## FR-2: 销售流程
...

## NFR-1: 性能
- 页面响应 < 2 秒
- 并发用户：100

## NFR-2: 安全
- HTTPS only
- RBAC 权限控制
```

### 设计意图

**为什么 Planning 在 Solutioning 之前**？

- **What 优先 How**：先定义"做什么"，再考虑"怎么做"
- **避免技术驱动**：避免先选技术再找问题
- **方便变更**：需求变更比技术变更容易

---

## 阶段 3：Solutioning（设计）

### 核心问题

> "技术上如何实现？"

### Skills 与 Agent

**Skills**（在 `src/bmm-skills/3-solutioning/` 中）：
- `create-architecture`：创建架构文档
- `review-architecture`：审查架构

**Agent**：Winston（Software Architect）

### 输出

**主要产物**：
- 架构文档
- 技术栈选择
- 关键决策记录（ADR）

**示例**：
```markdown
# Architecture: CRM System

## 技术栈
- Backend: Node.js + Express
- Database: PostgreSQL
- Frontend: React + TypeScript
- Deployment: Docker + Kubernetes

## 系统架构
[图：三层架构]
- Presentation Layer
- Business Logic Layer
- Data Access Layer

## 关键决策
1. 选择 PostgreSQL 而非 MongoDB
   - 原因：关系型数据为主
2. 选择 React 而非 Vue
   - 原因：团队已熟悉
3. 微服务 vs 单体
   - 选择：单体（团队规模适中）
   - 未来：可拆分为微服务
```

### 设计意图

**为什么独立的 Solutioning 阶段**？

- **技术决策很重要**：架构决策一旦定型难以改变
- **需要专门思考**：不应被需求细节淹没
- **AI 易出错**：架构需要全局视角，AI 容易局部最优

---

## 阶段 4：Implementation（实施）

### 核心问题

> "如何高质量地编码？"

### Skills 与 Agent

**Skills**（在 `src/bmm-skills/4-implementation/` 中）：
- `create-epic`：创建 Epic
- `create-story`：创建 Story
- `dev-story`：实施 Story
- `code-review`：代码审查

**Agent**：Amelia（Developer）+ Quinn（QA）

### 输出

**主要产物**：
- Epic + Stories
- 代码
- 代码审查报告
- 测试

**示例**：
```markdown
# Epic 1: 客户管理

## Story 1.1: 创建客户
**作为** 销售代表
**我希望** 创建新客户
**以便** 跟踪销售机会

### 任务
- [ ] API: POST /api/customers
- [ ] UI: 客户创建表单
- [ ] 验证：必填字段
- [ ] 测试：单元测试 + 集成测试

### 验收标准
- AC-1.1.1: 必填字段验证
- AC-1.1.2: 创建成功后跳转到客户详情
- AC-1.1.3: 错误消息友好显示
```

### 设计意图

**为什么 Implementation 单独成阶段**？

- **细粒度任务**：Story 是最小可执行单元
- **质量保障**：内置代码审查
- **AI 协作**：每个 Story 一个对话上下文

---

## 阶段间的衔接

### 数据流

```
Brief (Analysis)
   ↓ 输入到
PRD (Planning)
   ↓ 输入到
Architecture (Solutioning)
   ↓ 输入到
Epics + Stories (Implementation)
   ↓ 输入到
Code + Tests
```

**关键设计**：
- 每个阶段输出是下一阶段输入
- 文档作为接口（解耦阶段）
- 可以回溯（修改前置文档）

### 可逆性

虽然有顺序，但允许回溯：

```
Implementation 发现需求模糊
   ↓
回到 Planning 澄清 PRD
   ↓
更新 PRD
   ↓
回到 Implementation
```

**设计意图**：
- 不假设需求一开始完美
- 允许迭代式改进
- 但有明确的"主线"

---

## 设计哲学：分而治之

### 反例：混合一切

**典型场景**：
```
用户："帮我做一个 CRM。"
AI："好的，我来设计架构和编码..."
（直接跳到 Implementation）
```

**问题**：
- 跳过了需求分析
- 跳过了架构设计
- 实施了"AI 理解的需求"
- 最终：不符合用户实际需求

### BMAD 的方式

```
用户："帮我做一个 CRM。"
AI："好的。让我们从理解需求开始。
     先调用 Mary 进行 brainstorming..."

[Phase 1: Analysis]
[Phase 2: Planning]
[Phase 3: Solutioning]
[Phase 4: Implementation]
```

**优势**：
- 每阶段聚焦一个问题
- 减少认知负担
- 提高质量

---

## 验证与证据

### 证据 1：阶段独立性

**目录结构验证**：

```bash
$ ls src/bmm-skills/
1-analysis/
2-planning/
3-solutioning/
4-implementation/
```

**每阶段独立**：
- 独立的 Skills
- 独立的 Agent
- 独立的输出

### 证据 2：阶段间依赖

**Skill 之间的引用**：

`create-prd/SKILL.md`（Planning）：
```markdown
## 输入
- 项目简报（来自 Analysis 阶段）
  - 文件：{output_folder}/brief.md
  - 如果不存在：先调用 create-brief
```

`create-architecture/SKILL.md`（Solutioning）：
```markdown
## 输入
- PRD（来自 Planning 阶段）
  - 文件：{output_folder}/prd.md
  - 如果不存在：先调用 create-prd
```

**关键设计**：
- 显式声明输入依赖
- 自动调用前置 Skill
- 文档化阶段关系

### 证据 3：实际执行流程

**用户视角**：

```bash
$ claude

You: "我想做一个 CRM 系统"

Claude: "让我们开始分析。先调用 Mary 进行 brainstorming..."
[Phase 1 完成，输出 brief.md]

Claude: "现在让 John 创建 PRD..."
[Phase 2 完成，输出 prd.md]

Claude: "让 Winston 设计架构..."
[Phase 3 完成，输出 architecture.md]

Claude: "让 Amelia 创建 Epics 和 Stories..."
[Phase 4 完成，输出 epics/, stories/]

Claude: "现在可以开始 dev-story 实施了。"
```

**关键观察**：
- 流程清晰
- AI 自动协调
- 用户随时可中断

---

## 诚实陈述：四阶段的局限

### 局限 1：流程感强

**问题**：
- 流程清晰 ≠ 流程不繁琐
- 用户可能感觉"步骤太多"
- 想跳过某些步骤

**实际反馈**：
- "我只想写代码，不想做 PRD"
- "为什么不能直接进入 Implementation？"

**缓解措施**：
- Level 0 跳过 Analysis 和 Planning
- 用户可手动跳过
- 文档说明每阶段的价值

### 局限 2：文档负担

**问题**：
- 每阶段产出文档
- 文档需要维护
- 文档可能过时

**实际影响**：
- L3+ 项目可能有 10+ 文档
- 需求变更时需要更新多个文档

**缓解措施**：
- 文档是引导，非束缚
- 提供 `update-prd` 等 Skill
- 文档同步检查工具（未实现）

### 局限 3：阶段边界模糊

**问题**：
- Planning 和 Solutioning 边界模糊
- 有些技术决策属于 Planning（如选择是否做移动端）
- 有些需求决策属于 Solutioning（如性能要求）

**实际影响**：
- 用户困惑：这个决策放哪个阶段？
- AI 可能在错误阶段提出问题

**缓解措施**：
- 文档清晰定义边界
- 允许阶段间回溯
- 不强制严格分隔

---

## 案例研究：完整的四阶段流程

### 项目：小型 SaaS 产品

**Phase 1: Analysis（2 小时）**

```
Mary: "你想解决什么问题？"
User: "小团队管理任务困难。"

Mary: "现有工具有哪些？"
User: "Trello、Asana，但太复杂了。"

Mary: "你的目标用户是？"
User: "5-15 人的小团队，技术背景。"

[输出 brief.md]
```

**Phase 2: Planning（1.5 小时）**

```
John: "基于 brief，我们需要哪些核心功能？"

[FR-1: 任务管理]
[FR-2: 团队协作]
[FR-3: 简洁界面]

[NFR-1: 加载 < 1s]
[NFR-2: 移动端响应式]

[输出 prd.md]
```

**Phase 3: Solutioning（1 小时）**

```
Winston: "基于 PRD，技术栈推荐：
- Frontend: Next.js（SEO + 性能）
- Backend: Supabase（快速开发）
- Database: PostgreSQL（Supabase 内置）

理由：
1. 快速 MVP
2. 团队熟悉 React
3. Supabase 减少后端工作量"

[输出 architecture.md]
```

**Phase 4: Implementation（持续）**

```
Amelia: "基于 PRD 和架构，我创建 3 个 Epic：
- Epic 1: 用户认证（5 个 Story）
- Epic 2: 任务管理（8 个 Story）
- Epic 3: 团队协作（6 个 Story）"

[开始 Story 1.1: User Sign-up]
[dev-story → code-review → next story]
```

**总时间**：4.5 小时规划 + 持续实施

**对比直接编码**：
- 节省返工时间：估计 20-40 小时
- ROI：4-9 倍

---

## 设计原则提炼

从四阶段方法论中，可以提炼出一个核心原则：

> **结构化思考，分而治之**

**具体体现**：

1. **What → Why → How → Do**：清晰的认知顺序
2. **角色专注**：每阶段有专属 Agent
3. **输出沉淀**：每阶段有可见产物
4. **可回溯**：但有明确主线

**统一思想**：
- 不是"要么有流程，要么没流程"
- 而是"轻量但清晰的流程"

---

## 数字证据

### 阶段时间分布

**典型 L2 项目**：

| 阶段 | 时间 | 占比 |
|------|------|------|
| **Analysis** | 1-2h | 5% |
| **Planning** | 2-3h | 10% |
| **Solutioning** | 1-2h | 5% |
| **Implementation** | 30-40h | 80% |
| **总计** | 35-50h | 100% |

**关键观察**：
- 前三阶段共占 20%
- 但能避免 80% 的返工
- ROI 极高

---

*下一章，我们将分析"引导式协作 vs 自动化"——为什么 BMAD 选择"引导"而非"自动"？*
