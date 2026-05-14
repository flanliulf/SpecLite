<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Planning Synthesizer — 规划合成

> 本文档定义规划层的生成逻辑，包括基线→规划映射、各规划文档的生成步骤、模板使用规则和 Stories 前置条件。
> Phase 5 的核心参考文件。

## 1 规划生成模式入口

### 1.1 前置条件

- Phase 3（基线合成）已完成，至少 6 个 MVP 基线文档已生成
- 状态文件中 `baseline_status` 的 MVP 文档均为 `done`
- 如有 `fact_conflicts_pending > 0`，提示用户先确认冲突

### 1.2 触发方式

- **完整流程**：initial_scan / full_rescan 完成 Phase 3 后自动进入 Phase 5
- **独立触发**：mode = `planning_generation`，从 Phase 0 直接跳转到 Phase 5
- **深潜后更新**：Phase 4 完成后，可重新进入 Phase 5 更新规划文档

### 1.3 用户输入

Phase 5 开始时需要确认：
- **目标功能/需求描述**：用户想要添加什么新功能？（如未提供，生成通用 planning-brief）
- **迭代范围偏好**：大范围还是小步迭代？
- **优先级偏好**：哪些能力优先？

## 2 基线/深潜→规划映射

| 规划文档 | 主要输入 | 补充输入 | 模板 |
|:---------|:---------|:---------|:-----|
| brownfield-planning-brief.md | 全部基线文档 | deep-dives/（如有） | assets/brownfield-planning-brief-template.md |
| prd.md | planning-brief, 用户需求描述 | baseline/system-overview.md | assets/prd-template.md |
| architecture.md | planning-brief, prd.md | baseline/as-is-architecture.md, baseline/change-risk-map.md | assets/architecture-template.md |
| epics.md | prd.md, architecture.md | baseline/business-capability-matrix.md | assets/epics-template.md |
| feature-entry-points.md | baseline/api-contracts.md, baseline/as-is-architecture.md | planning-brief | — |
| candidate-change-slices.md | planning-brief, baseline/change-risk-map.md | baseline/business-capability-matrix.md | — |
| stories/ | epics.md, baseline 文档 | deep-dives/（如有） | assets/story-template.md |

## 3 各文档生成逻辑

### 3.1 brownfield-planning-brief.md（MVP 必需）

**用途**：规划层的关键中间文档，避免直接从仓库跳到 PRD。

**生成步骤**：
1. 读取 `baseline/system-overview.md` → 提取系统概况摘要
2. 读取 `baseline/business-capability-matrix.md` → 提取与目标需求相关的现有能力
3. 读取 `baseline/as-is-architecture.md` → 提取相关模块信息
4. 读取 `baseline/reuse-opportunities.md`（如有）→ 提取可复用能力
5. 读取 `baseline/constraints-and-invariants.md`（如有）→ 提取约束
6. 读取 `baseline/change-risk-map.md` → 提取风险
7. 综合以上信息，填充 `assets/brownfield-planning-brief-template.md` 模板
8. 如有 deep-dives/ 结果，补充到相关章节

**关键输出章节**：
- 当前系统相关能力摘要
- 与本次需求相关的现有模块
- 可复用能力
- 不可突破的约束
- 风险与未知点
- 候选变更切片
- 推荐的迭代范围边界

### 3.2 prd.md（MVP 必需）

**用途**：基于 brownfield 基线生成的增量需求文档。

**生成步骤**：
1. 读取 planning-brief.md → 获取系统上下文和约束
2. 读取用户提供的需求描述 → 提取功能需求
3. 读取 `baseline/constraints-and-invariants.md`（如有）→ 填充约束章节
4. 读取 `baseline/change-risk-map.md` → 填充风险章节
5. 填充 `assets/prd-template.md` 模板

**注意**：
- PRD 的"背景"章节必须引用基线文档，而非凭空描述
- "约束与风险"章节必须来自基线证据，不能编造
- 如果用户未提供具体需求描述，生成框架性 PRD，标注 `[待用户填充]` 占位符

### 3.3 architecture.md（MVP 必需）

**用途**：基于当前 as-is 架构的增量变更设计。

**生成步骤**：
1. 读取 `baseline/as-is-architecture.md` → 提取当前模块结构
2. 读取 prd.md → 确定需要变更的范围
3. 读取 planning-brief.md → 获取候选变更切片
4. 读取 `baseline/change-risk-map.md` → 识别高风险区域
5. 填充 `assets/architecture-template.md` 模板

**关键区别**：
- `baseline/as-is-architecture.md` = 当前系统现状（事实）
- `planning/architecture.md` = 本次增量变更设计（规划）
- 二者必须严格分离

### 3.4 epics.md（MVP 必需）

**用途**：基于 PRD 和增量架构设计拆分的 Epic 清单。

**生成步骤**：
1. 读取 prd.md → 提取功能需求列表
2. 读取 architecture.md → 提取模块变更范围
3. 读取 planning-brief 中的候选变更切片 → 参考切片建议
4. 读取 `baseline/business-capability-matrix.md` → 确认能力边界
5. 按以下维度拆分 Epic：
   - 按业务能力（capability slice）
   - 按工作流（workflow slice）
   - 按数据变更（data slice）
   - 按接口变更（interface slice）
6. 填充 `assets/epics-template.md` 模板
7. 建立 Epic 间的依赖关系

**拆分原则**：
- 每个 Epic 应可独立交付和验证
- Epic 粒度适中：不宜太大（超过 2 周）也不宜太小（1 天内完成）
- 优先级基于：业务价值、技术依赖、风险程度

### 3.5 feature-entry-points.md（补充）

**用途**：标注新功能在现有系统中的接入点。

**生成步骤**：
1. 读取 `baseline/api-contracts.md` → 找到需要扩展/新增的 API
2. 读取 `baseline/as-is-architecture.md` → 找到需要修改的模块
3. 为每个接入点标注：位置、当前状态、变更方式、影响范围

### 3.6 candidate-change-slices.md（补充）

**用途**：Epic 拆分前的中间层，提供切片建议。

**生成步骤**：
1. 读取 planning-brief → 获取初步切片建议
2. 读取 `baseline/change-risk-map.md` → 按风险评估切片可行性
3. 按 6 个维度组织切片：
   - capability slice / workflow slice / data slice
   - interface slice / state slice / migration slice
4. 每个切片标注：影响模块、风险等级、依赖关系、是否可独立成 Epic

### 3.7 stories/（MVP 后，WP7）

**前置条件**：
- epics.md 已生成且每个 Epic 有明确的完成定义
- architecture.md 已生成且模块变更范围明确
- 基线文档中相关模块信息可查阅

**生成步骤**：

1. **读取 epics.md** → 遍历每个 Epic，提取：
   - Epic 目标和变更范围
   - 涉及的模块列表
   - Epic 间依赖关系

2. **对每个 Epic 拆分 Story**：
   a. 读取 `planning/architecture.md` → 获取该 Epic 涉及的模块变更详情
   b. 读取 `baseline/business-capability-matrix.md` → 确认业务能力边界
   c. 读取 `baseline/change-risk-map.md` → 提取风险注意事项
   d. 如有 `deep-dives/` → 提取深潜发现的复用机会和修改指引
   e. 按功能点/变更点拆分为 Story

3. **Story 拆分原则**：
   - 每个 Story 应是一个可独立交付和验证的功能增量
   - Story 粒度：1-3 天工作量
   - 数据模型变更和 API 变更通常拆为独立 Story
   - 前后端变更如有强依赖，优先拆 API Story 在前，UI Story 在后

4. **填充模板**：
   使用 `assets/story-template.md` 模板，逐个字段填充：
   - 背景：引用所属 Epic
   - 用户价值：从 prd.md 提取
   - 验收标准：从 Epic 的完成定义细化
   - 受影响模块：从 architecture.md 提取
   - 现有能力复用：从 baseline/reuse-opportunities.md 或 deep-dives/ 提取
   - 依赖与前置条件：从 Epic 依赖关系和 Story 间顺序推导
   - 开发注意事项：从 change-risk-map.md 和 deep-dives/ 提取
   - 测试要点：从 evidence/test-surface.json 提取现有测试 + 新增测试要求

5. **文件命名与组织**：
   ```
   planning/stories/
     epic-01-story-01-{story-name}.md
     epic-01-story-02-{story-name}.md
     epic-02-story-01-{story-name}.md
   ```
   - `{nn}` 使用两位数字编号（01, 02, ...）
   - `{story-name}` 使用 kebab-case

6. **Story 间依赖标注**：
   在每个 Story 的"依赖与前置条件"章节中，明确标注：
   - 同 Epic 内的前置 Story
   - 跨 Epic 的依赖 Story
   - 外部依赖（如需其他团队配合）

7. **批量生成后验证**：
   - 检查所有 Story 的验收标准加起来是否覆盖 Epic 的完成定义
   - 检查 Story 间依赖是否形成环（禁止循环依赖）
   - 检查每个 Story 的受影响模块是否在 architecture.md 变更范围内

## 4 生成顺序

```
1. brownfield-planning-brief.md   ← 必须最先（中间转换层）
2. candidate-change-slices.md     ← 可选（辅助 Epic 拆分）
3. feature-entry-points.md        ← 可选（辅助定位接入点）
4. prd.md                         ← 需求文档
5. architecture.md                ← 增量架构
6. epics.md                       ← Epic 拆分
7. stories/                       ← MVP 后（WP7）
```

步骤 2-3 可选，步骤 4-6 按顺序依赖生成。

## 5 模板使用规则

- 模板文件位于 `assets/` 目录
- 模板中的 `{{placeholder}}` 占位符替换为实际内容
- 如果某章节无对应证据，标注 `[信息不足，待补充]` 而非删除该章节
- 模板结构可根据项目特点微调，但核心章节不可删除

## 6 质量检查

每个规划文档生成后，检查：
- [ ] 所有结论和建议有基线证据支撑
- [ ] 无凭空编造的系统描述
- [ ] architecture.md 是增量设计而非 as-is 重写
- [ ] Epic 拆分有明确的完成定义
- [ ] 各文档间交叉引用路径正确
- [ ] 风险评估引用了 change-risk-map.md
