# Workflow Details（详细工作流）

## Purpose（目的）

把 AI-oriented planning artifacts 转换为可供产品、研发、测试、运维、安全和外部协作方共同评审的技术方案。输出是来源产物的 human-facing projection，不创建第二套需求或架构事实。

## Workflow Pattern（工作流模式）

采用 Sequential Workflow Orchestration 与 Iterative Refinement：先锁定范围和证据，再确认大纲、生成正文、执行确定性检查并定点修复。最多 3 轮修复；仍有 blocker 时保持 `Draft` 并停止 Finalization。

## Step 1 Scope and Audience（范围与受众）

确认以下输入：

- `requirement-id`：稳定的需求、Epic 或 change id，只使用 lowercase kebab-case 生成文件名。
- 文档标题、目标发布版本、主要读者和评审角色。
- 交付范围：单需求、单 Epic、跨 Epic 或跨系统 change slice。
- 模式：`draft` 或 `final`。Skill 只可把 final 产物置为 `Review`；`Approved` 需要显式人工审批事实。
- 是否允许读取目标项目源码、配置、API contract、schema、测试和运行证据。

若 requirement id、范围或目标读者无法从用户输入和项目事实中唯一确定，必须 HALT 请求澄清，不得自行命名或扩张范围。

## Step 2 Source Discovery（来源发现）

按以下优先级发现并记录 source baseline：

1. PRD 或 requirement artifact。
2. Architecture 与相关 ADR / SPEC。
3. UX（存在用户界面时）。
4. Epics / Stories 与验收标准。
5. 最新 Implementation Readiness report。
6. 目标项目知识、源码、API contract、schema、migration、测试和运行证据。

对每个来源记录 path、type、version / commit、status 与本次用途。Sharded document 必须从 active index 发现并读取相关 shards，禁止只读 `index.md` 后猜测正文。

若存在多份候选 owner，先根据 active index、frontmatter、配置和 lifecycle 标记判断；无法确定时报告冲突。历史或 archived artifact 只作为历史背景，不得覆盖 active owner。

## Step 3 Readiness and Evidence Gate（就绪与证据门禁）

使用 `references/evidence-and-traceability.md` 分类来源与 anchor。

- `draft`：允许 IR 缺失或未通过，但必须在 Document Control 与 Executive Summary 标明未验证输入和 blocker。
- `final`：需要最新 IR 结论允许进入实现，且 blocking source conflict 已关闭。若无法证明该条件，降级为 `Draft`，不得伪造 readiness。
- 若 `speclite-flow-gate` report 被作为实现证据，仅接受 `PASS` 或 `PASS_EQUIVALENT`；本 Skill 不据此推进任何 Story / Epic 状态。

发现来源冲突时，不修改 PRD、Architecture、Story 或代码；生成 Conflict Register，标明 owner、影响和建议的 owning workflow，然后 HALT Finalization。

## Step 4 Outline Tailoring（大纲裁剪）

读取 `assets/technical-solution-template.md` 与 `references/document-structure.md`。先生成 Applicability Matrix：

- `Required`：必须生成完整章节。
- `Applicable`：本次变更涉及，生成完整章节。
- `N/A`：不适用，记录可验证原因。
- `TBD`：尚未确定，记录 owner、due date 与 blocker impact。

不得创建空章节。条件章节可以省略，但 Applicability Matrix 必须保留章节名和省略理由。向用户展示大纲、图表计划和主要证据缺口，等待确认后再写正文。

## Step 5 Section Drafting（分节撰写）

按以下阅读顺序组织内容：结论 → 图表或表格 → 关键细节 → 失败与边界 → 验证方式。

1. 先完成 Document Control、Executive Summary、Context and Scope。
2. 描述 Current State 与 Target State，明确 Changed / Unchanged。
3. 按 `references/diagram-guidelines.md` 生成最少必要图表。
4. 按 `references/multi-system-design-checklist.md` 写跨系统职责和 contract。
5. 补齐数据、质量属性、部署迁移、测试验收、风险与开放问题。
6. 建立 Requirement → Design → Component / Contract → Verification 追溯表。

不得从附件示例或其他项目复制业务名、字段、DDL、链接或容量数据。完整 API Schema、DDL 和 Event Schema 应链接到权威契约；正文只保留本次 delta、关键语义、兼容性和风险。

## Step 6 Validation Loop（验证循环）

读取 `references/quality-checklist.md`，然后执行：

```sh
python3 scripts/validate_technical_solution.py <document> --mode draft
```

准备进入 Review 时执行：

```sh
python3 scripts/validate_technical_solution.py <document> --mode final
```

针对每项 error 定点修复受影响章节并复查，最多 3 轮。Warning 必须逐条接受、修复或在交付摘要中说明理由。脚本通过不代表事实正确，仍需人工核对 source baseline、图表语义和 contract owner。

若目标项目提供 Mermaid renderer，必须实际渲染全部 Mermaid code block；未提供 renderer 时明确记录“结构检查通过，render verification 未执行”。

## Step 7 Finalization and Handoff（定稿与交接）

- 更新 frontmatter：`status`、`version`、`updatedAt`、`sourceDocuments`。
- 确认输出位于 `{project_knowledge}/tsd/<requirement-id>-technical-solution-document.md`。
- 确认末尾生成标注存在。
- 返回输出路径、文档状态、source baseline、主要决策、未关闭风险和推荐下一步。
- 文档状态为 `Review` 时等待人工评审；只有显式审批事实才能更新为 `Approved`。

## Stop Conditions（停止条件）

以下任一条件成立时停止 Finalization：

- requirement id、范围或目标读者不明确。
- active PRD / Architecture / Epic owner 无法确定。
- final 模式缺少允许进入实现的最新 IR 结论。
- blocking source conflict 未关闭。
- 关键外部 contract、认证、安全或数据迁移事实缺失。
- 3 轮修复后 validator 仍有 error。
