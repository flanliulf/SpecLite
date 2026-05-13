<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Deep-Dive Analyzer — 定向深潜分析

> 本文档定义深潜的触发条件、区域选择规则、exhaustive 分析流程、输出结构和规划反馈机制。
> Phase 4 的核心参考文件。仅在 `targeted_deep_dive` 模式或 `initial_scan`/`full_rescan` 中按需触发。

## 1 触发条件

深潜不是默认执行的阶段，只有满足以下任一条件才触发：

### 1.1 用户主动指定

用户明确要求对某区域做深入分析：
- "对订单模块做深潜分析"
- "帮我详细分析 authentication 的实现"
- "我需要了解 payment-service 的内部结构"

### 1.2 基线识别高风险

Phase 3 生成 `baseline/change-risk-map.md` 后，以下区域自动标记为深潜候选：
- `dependency-graph.json` 中 `is_high_coupling: true` 的节点所属模块
- `test-surface.json` 中无测试覆盖但被大量依赖的模块
- `config-surface.json` 中强绑定多个外部服务的模块

### 1.3 规划阶段发现不足

Phase 5 生成规划文档时发现：
- 某模块的能力边界不清晰，无法判断是否可复用
- 某模块的变更影响范围无法准确评估
- 某 Epic 的技术可行性存疑

### 1.4 关键流程理解需要

需要对特定 API / Service / State Machine / Workflow 进行更高密度理解：
- 跨多个模块的业务流程（如：订单创建→库存→支付→通知）
- 复杂状态机（如：订单状态流转）
- 核心数据管道

## 2 区域选择规则

### 2.1 区域粒度

深潜区域的粒度可以是：

| 粒度 | 示例 | 适用场景 |
|:-----|:-----|:---------|
| 目录级 | `server/src/services/order/` | 整个模块分析 |
| 文件级 | `server/src/middleware/auth.ts` | 关键单文件 |
| 能力级 | "支付处理流程" | 跨模块业务流程 |
| API 级 | `POST /api/v1/orders` | 单个关键 API |

### 2.2 选择优先级

当多个区域都可以深潜时，按以下优先级排序：

1. 用户明确指定的区域（最高优先）
2. 本次需求直接变更的核心模块
3. change-risk-map 中标注为高风险的模块
4. 业务能力矩阵中涉及的关键能力模块

### 2.3 范围控制

- 每次深潜聚焦 **1-3 个区域**，避免过度发散
- 每个区域的文件数量建议 **不超过 50 个**
- 如果目标区域过大，先按子模块拆分，分批深潜

## 3 Exhaustive 分析流程

### 3.1 Step 1：文件清单收集

对目标区域收集完整文件列表：

```
目标目录下所有源码文件
├── 按类型分组（service / controller / model / middleware / util / test / config）
├── 标注每个文件的行数
└── 标注每个文件的最后修改时间（如可获取）
```

### 3.2 Step 2：依赖关系分析

从 `evidence/dependency-graph.json` 中提取目标区域的子图：

- **内部依赖**：区域内文件间的 import/require 关系
- **入向依赖**（dependents）：哪些外部文件依赖本区域
- **出向依赖**（dependencies）：本区域依赖哪些外部文件/模块
- **exports 清单**：本区域对外暴露的接口（函数、类、常量、类型）

### 3.3 Step 3：数据流追踪

追踪目标区域内的数据流向：

- 数据入口（API 请求参数、消息队列消费、定时任务触发）
- 数据变换（service 层处理逻辑）
- 数据出口（数据库写入、API 响应、消息发布、外部 API 调用）
- 状态管理（缓存读写、session 管理、状态机流转）

### 3.4 Step 4：副作用识别

识别目标区域产生的 side effects：

| 副作用类型 | 具体内容 | 影响范围 |
|:-----------|:---------|:---------|
| 数据库写入 | INSERT/UPDATE/DELETE 操作 | 列出涉及的表 |
| 缓存操作 | Redis SET/DEL/EXPIRE | 列出 key 模式 |
| 消息发布 | Kafka/RabbitMQ produce | 列出 topic/queue |
| 外部 API 调用 | HTTP 请求到第三方服务 | 列出目标服务 |
| 文件系统操作 | 读写本地文件 | 列出路径 |
| 日志/监控 | 重要的日志点和指标 | 列出 metric 名 |

### 3.5 Step 5：集成点分析

列出目标区域与外部的所有集成点：

- 与其他内部模块的接口
- 与外部服务/API 的集成
- 与中间件/基础设施的交互（数据库、缓存、消息队列）
- 与前端/客户端的接口

### 3.6 Step 6：代码质量信号

收集代码中的质量信号：

- **TODO / FIXME / HACK / WORKAROUND** 注释
- **已弃用**的代码（@deprecated、unused exports）
- **错误处理模式**（try-catch 覆盖范围、error propagation 策略）
- **测试覆盖**：该区域有哪些测试、覆盖哪些场景、缺失哪些

### 3.7 Step 7：复用机会与修改指引

- **可复用的组件**：该区域内哪些 service/util/validator/schema 可被新功能直接复用
- **可扩展的接口**：哪些接口设计上支持扩展
- **修改指引**：如果要在此区域新增功能，建议的切入点、需要注意的约束、推荐的实现模式

## 4 输出结构

### 4.1 文件命名

```
{project_knowledge}/brownfield/deep-dives/deep-dive-{area-name}.md
```

`{area-name}` 使用 kebab-case，如：
- `deep-dive-order-service.md`
- `deep-dive-authentication.md`
- `deep-dive-payment-workflow.md`

### 4.2 文档结构模板

```markdown
# Deep-Dive: {区域名称}

> 深潜目标：{一句话描述分析目标}
> 触发原因：{用户指定 / 高风险标记 / 规划需要}
> 分析范围：{目录/文件/能力}

## 1 文件清单

| 文件 | 类型 | 行数 | 说明 |
|:-----|:-----|:-----|:-----|

## 2 依赖关系

### 2.1 内部依赖
### 2.2 入向依赖（谁依赖我）
### 2.3 出向依赖（我依赖谁）
### 2.4 Exports 清单

## 3 数据流

### 3.1 数据入口
### 3.2 数据变换
### 3.3 数据出口

## 4 副作用

| 类型 | 内容 | 影响范围 |
|:-----|:-----|:---------|

## 5 集成点

## 6 代码质量信号

### 6.1 TODO / FIXME
### 6.2 测试覆盖
### 6.3 错误处理模式

## 7 复用机会

## 8 修改指引

### 8.1 推荐切入点
### 8.2 需注意的约束
### 8.3 推荐实现模式
```

## 5 规划反馈机制

深潜完成后，分析结果需要反馈到规划层：

### 5.1 更新基线文档

| 深潜发现 | 更新目标 |
|:---------|:---------|
| 新发现的可复用组件 | `baseline/reuse-opportunities.md`（如有）|
| 新发现的系统约束 | `baseline/constraints-and-invariants.md`（如有）|
| 新发现的风险点 | `baseline/change-risk-map.md` 追加 |
| 更准确的模块职责描述 | `baseline/as-is-architecture.md` 修正 |

### 5.2 更新规划文档（如已生成）

| 深潜发现 | 更新目标 |
|:---------|:---------|
| 变更影响范围更准确 | `planning/architecture.md` 修正变更范围 |
| 新的风险识别 | `planning/prd.md` 追加风险 |
| Epic 可行性评估 | `planning/epics.md` 调整 Epic 拆分 |
| Story 开发注意事项 | `planning/stories/` 中追加 Dev Notes |

### 5.3 更新状态文件

```bash
python scripts/update_state.py update \
  --deep-dive-target "order-service" \
  --deep-dive-status "order-service=done" \
  --step "phase_4_deep_dive_order_service" \
  --output "deep-dives/deep-dive-order-service.md"
```

### 5.4 反馈循环

```
深潜完成
    ↓
更新相关基线文档（事实修正）
    ↓
更新状态文件
    ↓
如已有规划文档 → 重新进入 Phase 5 更新规划
如尚未生成规划 → 正常流转到 Phase 5
```

## 6 原则与约束

- 深潜**不替代全仓全量 exhaustive 分析**，只做局部加密理解
- 深潜文档是**事实记录**，不是建议书 — 修改指引章节除外
- 每个深潜文档必须**自包含**，读者不需要先看其他深潜文档
- 深潜结果中发现的事实必须标注来源（代码行号、文件路径）
- 如果深潜发现与基线记录矛盾，以深潜（更深入的分析）为准，更新基线
