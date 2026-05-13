<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Baseline Synthesizer — 基线合成

> 本文档定义证据→基线的映射规则、各基线文档的生成逻辑、来源标注规则和质量标准。
> Phase 3 的核心参考文件。

## 1 证据→基线映射规则

### 1.1 总体原则

- 基线文档**只描述当前系统现状**（as-is），不包含规划或建议
- 每个结论必须**标注证据来源**，禁止无来源推断
- 历史文档候选事实必须经过交叉验证后才能进入基线
- 证据不足时标注 `[UNVERIFIED]` 而非省略或猜测

### 1.2 映射表

| 基线文档 | 主要证据输入 | 补充证据输入 |
|:---------|:------------|:------------|
| index.md | 全部已生成的基线文档 | — |
| system-overview.md | repo-manifest.json | existing-doc-inventory.json, config-surface.json |
| as-is-architecture.md | dependency-graph.json | repo-manifest.json, config-surface.json, api-inventory.json |
| business-capability-matrix.md | api-inventory.json, business-fact-candidates.json | data-model-inventory.json, existing-doc-inventory.json |
| change-risk-map.md | dependency-graph.json, test-surface.json | config-surface.json, api-inventory.json |
| api-contracts.md | api-inventory.json | data-model-inventory.json |
| domain-model.md | data-model-inventory.json | api-inventory.json, business-fact-candidates.json |
| reuse-opportunities.md | dependency-graph.json, api-inventory.json | data-model-inventory.json, test-surface.json |
| constraints-and-invariants.md | config-surface.json, api-inventory.json | business-fact-candidates.json |
| api-governance.md | api-inventory.json | config-surface.json, existing-doc-inventory.json |

### 1.3 历史候选事实交叉验证

在生成基线文档时，对 `business-fact-candidates.json` 中的候选事实进行验证：

| 验证结果 | 新状态 | 新置信度 | 处理方式 |
|:---------|:-------|:---------|:---------|
| 代码中有明确实现 | CODE_CONFIRMED | high | 写入基线，标注代码路径 |
| 现有文档支持但代码未直接验证 | DOC_SUPPORTED | medium | 写入基线，标注 `[DOC_SUPPORTED]` |
| 基于模式或间接证据推断 | INFERRED | low | 写入基线，标注 `[INFERRED]` |
| 历史文档记载但已被覆盖 | SUPERSEDED | — | 不写入基线，记录到注释中 |
| 无法验证 | UNVERIFIED | low | 不写入基线正文，附录中列出 |

## 2 基线文档职责与生成逻辑

### 2.1 index.md — 基线总索引

**职责**：基线文档的入口和导航目录

**生成逻辑**：
1. 列出所有已生成的基线文档，每个文档附一句话摘要
2. 标注项目基本信息（仓库类型、主语言、框架、扫描时间）
3. 标注 evidence 目录中的证据文件列表
4. 如有事实冲突待确认，在索引顶部标注提醒

**结构**：
```markdown
# Brownfield Baseline — {project_name}
> 扫描时间：{timestamp} | 仓库类型：{repo_type} | 主语言：{primary_language}

## 基线文档
- [系统概览](system-overview.md) — {一句话摘要}
- [架构现状](as-is-architecture.md) — ...
...

## 证据文件
- evidence/repo-manifest.json
- evidence/api-inventory.json
...

## 待确认事项
- {fact_conflicts_pending} 条事实冲突待确认
```

### 2.2 system-overview.md — 系统概览

**职责**：对系统的高层描述，让读者快速了解"这是什么系统"

**证据输入**：repo-manifest.json, existing-doc-inventory.json, config-surface.json

**生成逻辑**：
1. 从 repo-manifest 提取：仓库类型、语言、框架、parts 划分
2. 从 config-surface 提取：第三方服务依赖
3. 从 existing-doc-inventory 提取：现有文档概况
4. 综合生成系统概览叙述

**必须包含的章节**：
- 项目概况（类型、语言、框架）
- 子系统/Parts 结构（如有）
- 技术栈摘要
- 外部依赖与第三方服务
- 文档现状
- 来源标注

### 2.3 as-is-architecture.md — 架构现状

**职责**：描述当前系统的模块结构、依赖关系和集成方式

**证据输入**：dependency-graph.json, repo-manifest.json, config-surface.json, api-inventory.json

**生成逻辑**：
1. 从 dependency-graph 的 module_summary 提取模块列表和耦合度
2. 从 repo-manifest 的 parts 提取子系统边界
3. 从 config-surface 的 third_party_services 提取外部集成
4. 从 api-inventory 提取 API 层结构
5. 标注高耦合模块（dependency-graph.high_coupling_nodes）

**必须包含的章节**：
- 模块结构概览（表格：模块、职责、文件数、耦合度）
- 模块依赖关系（文字描述核心依赖链路）
- 外部集成点
- 高耦合区域标注
- 来源标注

### 2.4 business-capability-matrix.md — 业务能力矩阵

**职责**：将系统的业务能力按矩阵组织，映射到模块/API/数据

**证据输入**：api-inventory.json, business-fact-candidates.json, data-model-inventory.json

**生成逻辑**：
1. 从 api-inventory 按 module 分组，推断业务能力
2. 从 business-fact-candidates 中提取 CODE_CONFIRMED 和 DOC_SUPPORTED 的事实
3. 从 data-model-inventory 关联数据实体
4. 构建矩阵表格

**矩阵表格格式**：
```markdown
| 业务能力 | 子能力 | 用户角色 | 入口点 | API 端点 | 数据实体 | 相关模块 | 证据等级 |
|:---------|:-------|:---------|:-------|:---------|:---------|:---------|:---------|
| 订单管理 | 创建订单 | 商家 | /orders/new | POST /api/v1/orders | Order, OrderItem | orders | CODE_CONFIRMED |
```

### 2.5 change-risk-map.md — 变更风险地图

**职责**：识别系统中的高风险区域，为后续变更规划提供风险参考

**证据输入**：dependency-graph.json, test-surface.json, config-surface.json, api-inventory.json

**生成逻辑**：
1. 从 dependency-graph 提取高耦合节点和高耦合度模块
2. 从 test-surface 识别测试薄弱区（有代码但无测试的模块）
3. 从 config-surface 识别外部集成强绑定区
4. 从 api-inventory 识别高流量/关键入口
5. 综合评估风险等级

**风险分类**：
| 风险类型 | 判定依据 | 证据来源 |
|:---------|:---------|:---------|
| 高耦合区 | coupling_score > 0.5 或 imported_by_count >= 10 | dependency-graph |
| 测试薄弱区 | 模块有代码文件但 test_surface 中无对应测试 | test-surface |
| 外部集成高依赖区 | 模块强绑定第三方服务（AWS/支付/消息队列） | config-surface |
| 高回归风险入口 | API 端点关联多个模块 | api-inventory + dependency-graph |

### 2.6 api-contracts.md — API 合约视图

**职责**：将 API 清单组织为可读的合约文档，面向消费者视角

**证据输入**：api-inventory.json, data-model-inventory.json

**生成逻辑**：
1. 从 api-inventory 按模块分组
2. 每个 API 列出：端点、方法、认证要求、中间件
3. 关联 data-model-inventory 中的请求/响应 schema
4. 按 RESTful 分组展示

**展示格式**：
```markdown
### 订单模块 (orders)

| 端点 | 方法 | 认证 | 中间件 | 处理文件 |
|:-----|:-----|:-----|:-------|:---------|
| /api/v1/orders | GET | 是 | auth, tenantScope | server/src/routes/orders.ts |
| /api/v1/orders | POST | 是 | auth, tenantScope | server/src/routes/orders.ts |
| /api/v1/orders/:id | GET | 是 | auth | server/src/routes/orders.ts |
```

## 3 As-is / Planning 边界

- `baseline/` **只记录当前系统现状**
- `planning/` 记录增量设计和迭代规划
- 二者不得混写
- `baseline/as-is-architecture.md` ≠ `planning/architecture.md`

基线文档中允许的内容：
- 当前实现的事实描述
- 从代码/配置/文档中观察到的模式
- 经验证的业务能力

基线文档中禁止的内容：
- "建议改进为..."
- "应该重构..."
- "计划支持..."
- 任何面向未来的表述

## 4 来源标注规则

### 4.1 标注格式

每个关键结论后必须标注证据来源，使用以下格式：

- 行内标注：`[来源: evidence/api-inventory.json]`
- 表格标注：在表格中增加"证据等级"列，值为 CODE_CONFIRMED / DOC_SUPPORTED / INFERRED
- 段落标注：段落末尾添加 `> 来源：{文件列表}`

### 4.2 示例

```markdown
系统采用 Express + TypeScript 构建后端服务。[来源: evidence/repo-manifest.json]

| 能力 | 证据等级 | 来源 |
|:-----|:---------|:-----|
| 多租户隔离 | CODE_CONFIRMED | evidence/api-inventory.json, server/src/middleware/tenant.ts |
| RBAC 权限管理 | DOC_SUPPORTED | evidence/business-fact-candidates.json (BF-005) |
```

### 4.3 无法确认的结论

对于证据不足的内容，使用以下标记：
- `[INFERRED]` — 基于间接证据推断
- `[UNVERIFIED]` — 无法验证，仅供参考

## 5 补充基线文档（按需生成）

以下文档在 MVP 阶段为可选，根据项目复杂度按需生成：

| 文档 | 触发条件 | 说明 |
|:-----|:---------|:-----|
| domain-model.md | data-model-inventory 中模型数 > 5 | 领域模型和实体关系 |
| reuse-opportunities.md | 用户要求或规划阶段需要 | 可复用的 service/component/schema |
| constraints-and-invariants.md | 有 config-surface 或 business-fact-candidates | 不可突破的系统约束 |
| api-governance.md | api-inventory 中 API 数 > 20 | 全局 API 规约 |
| source-tree-analysis.md | monorepo 或 multi-part 项目 | 源码树详细分析 |
| integration-map.md | config-surface 中 services > 3 | 外部集成地图 |
| development-guide.md | 大型项目 | 开发环境搭建指南 |
| data-models.md | 数据模型复杂 | 完整数据模型文档 |

## 6 生成顺序

```
1. system-overview.md       ← 最先（全局概览）
2. as-is-architecture.md    ← 模块结构
3. business-capability-matrix.md  ← 业务能力映射
4. change-risk-map.md       ← 风险识别
5. api-contracts.md         ← API 合约
6. index.md                 ← 最后（汇总索引）
```

步骤 2-5 的生成顺序可灵活调整，但 index.md 必须最后生成（需要引用其他文档的摘要）。

## 7 质量检查

每个基线文档生成后，检查：
- [ ] 每个关键结论有证据来源标注
- [ ] 无面向未来的建议性表述
- [ ] 表格对齐且可读
- [ ] 文件间交叉引用路径正确
- [ ] 历史候选事实已标注验证状态
