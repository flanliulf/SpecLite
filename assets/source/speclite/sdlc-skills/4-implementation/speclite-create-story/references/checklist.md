# Story 上下文质量自检清单（Checklist）

## 使命

在独立、清白的视角下，对 `speclite-create-story` 刚生成的 Story 文件做"再做一遍"式审查，发现一切可能导致开发智能体踩坑、回归、或实现失败的缺失与含糊之处，并就地修复。

## 必须杜绝的实现灾难

- **重复造轮子**：未指出可复用的既有实现，导致开发新建重复功能
- **错用库/框架**：未声明版本、API 或破坏性变更
- **错误的文件位置**：未给出符合项目结构的路径
- **破坏性回归**：未列出"必须保留"的既有行为
- **忽视 UX**：未引用 UX 文档关键约束
- **模糊实现**：用了"妥善处理""适当验证"等模糊词
- **谎报完成**：AC 不可测、无验证手段
- **不学习历史**：忽略上一个 Story 的教训
- **门控误判**：把未契约化的建议文件名写成 hard gate，导致后续 `dev-story` 误 HALT

## 输入

- **Story 文件**：刚生成的 `{default_output_file}`
- **源文档**：Epics、Architecture、UX、PRD、上一 Story
- **工作流变量**：`implementation_artifacts`、`planning_artifacts` 等

## 系统化复盘步骤

### Step 1：加载并理解目标

1. 加载 Story 文件，提取 `epic_num`、`story_num`、`story_key`、`story_title`
2. 解析所有工作流变量
3. 识别当前提供了哪些实现指引

### Step 2：穷尽源文档分析

#### 2.1 Epics 与 Story 分析

- 加载 `{epics_file}`（或分片）
- 抽取：Epic 目标与价值、Epic 内全部 Story、本 Story 的 AC、技术要求、依赖

#### 2.2 Architecture 深度扫描

- 加载 `{architecture_file}`（整文件或分片）
- 系统化扫描：技术栈与版本、代码结构、API、Schema、安全、性能、测试、部署、集成

#### 2.3 上一 Story 情报（若适用）

- 当 `story_num > 1`，加载上一 Story
- 抽取：Dev Notes、File List、问题与解决方案、代码模式

#### 2.4 Git 历史（若可用）

- 分析最近若干提交，抽取：触及文件、库依赖变化、测试方法

#### 2.5 最新技术核对

- 识别关键库/框架，确认最新稳定版本与破坏性变更

### Step 3：灾难预防缺口分析

按以下分组逐项检查并标注缺口：

#### 3.1 复用与反模式

- 是否指明可复用的既有实现，避免重复造轮子？

#### 3.2 技术规格灾难

- 是否给出准确的库/框架版本？
- 是否给出 API 端点、契约、认证方式？
- 是否覆盖 Schema 约束、安全、性能要求？

#### 3.3 文件结构灾难

- 是否声明每个 NEW/UPDATE 文件的精确路径？
- 是否符合项目命名与目录规范？

#### 3.4 回归灾难

- 是否对每个 UPDATE 文件给出"现状—变更—必须保留"三段？
- 是否引用上一 Story 的相关教训？

#### 3.5 实现灾难

- 是否消除模糊词，所有 AC 可测？
- 是否定义"完成"的可验证标准？

#### 3.6 Anchor 与 Flow Gate 灾难

- 是否包含 `Dependency Gate`、`Anchor Contract Map`、`Equivalent Implementation Policy`、`Evidence Plan` 和 `Anchor Evidence Summary`？
- 每个前置依赖是否按 `Contract Anchor`、`Functional Anchor`、`Evidence Anchor` 或 `Guidance Anchor` 分类？
- 是否明确：固定文件名只有在 owning SPEC 指定时才是 hard gate？
- 是否为 `story-kickoff` gate 写明预期证据，而不是只检查文件是否存在？

### Step 4：LLM-Dev-Agent 优化

- **冗余**：删除无信息量的赘述
- **歧义**：让所有指令唯一可解
- **结构**：用清晰的标题、列表、强调
- **token 效率**：以最少文字承载最多信息
- **关键信号**：把关键要求从段落中"提"到醒目位置

### Step 5：改进建议

把发现按下列三档输出：

- **Critical Misses（必修）**：缺失会导致实现失败/回归/安全问题
- **Enhancement Opportunities（应加）**：能显著提升实现质量的指引
- **Optimization Suggestions（可加）**：性能/调试/开发流程的额外提示
- **LLM Optimization**：token 效率与可读性优化

## 应用改进

- 直接在 Story 文件上**就地修复**，让结果读起来像是"一次成稿"
- 不要在 Story 中提及审查过程或"补充/增强"等措辞
- 修复后立即覆盖保存

## 成功标准

修订后的 Story 应让 dev agent 能够：

- 清晰知道每个技术约束
- 复用既有实现而非重复造轮子
- 避免破坏性回归与已知反模式
- 满足全部 AC 且端到端可工作
- 在开发前能通过 `speclite-flow-gate` 验证前置依赖，或清晰指出需要人工裁决的缺口
- 在最少 token 下获得最大指引

---

本文档由 speclite-create-story Skill 自动生成
