<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Brownfield Context Builder — 使用示例

## 示例 1：首次扫描（initial_scan）

### 背景

用户有一个已运行 2 年的 Node.js + React 全栈项目，采用 Express 后端 + React 前端的 multi-part 结构。现在需要添加"订单导出"新功能，希望先了解系统现状再做规划。

### 触发

```
帮我分析这个既有项目的现状，生成规划上下文
```

### 执行过程

1. **Phase 0**：检测到无状态文件 → mode = `initial_scan`，确认项目根目录和扫描级别（deep）
2. **Phase 1**：运行 `scan_repo.py`，识别为 multi-part 项目（server/ + client/），主语言 TypeScript，框架 Express + React
3. **Phase 2**：依次运行证据提取脚本
   - `extract_api_inventory.py` → 发现 47 个 API 端点
   - `extract_data_models.py` → 发现 12 个数据模型，3 个 migration
   - `build_dependency_graph.py` → 识别出 `order-service` 为高耦合节点
   - `collect_config_surface.py` → 检测到 Redis、PostgreSQL、Stripe 依赖
   - `collect_test_surface.py` → 发现 23 个单元测试，无集成测试
4. **Phase 3**：生成 6 个基线文档
   - system-overview.md — 系统概览
   - as-is-architecture.md — 标注 order 模块高耦合
   - business-capability-matrix.md — 识别订单管理、用户管理、支付等 5 个业务能力
   - change-risk-map.md — 订单模块为高风险区（高耦合 + 无集成测试）
   - api-contracts.md — 47 个 API 分模块展示
   - index.md — 汇总索引
5. **Phase 5**：基于"订单导出"需求，生成 planning-brief → prd → architecture → epics

### 输出

```
{project_knowledge}/brownfield/
├── project-scan-report.json
├── evidence/           (7 个 JSON 文件)
├── baseline/           (6 个 Markdown 文件)
└── planning/           (4 个 Markdown 文件)
```

---

## 示例 2：全量重扫（full_rescan）

### 背景

3 个月后，项目新增了支付模块和通知服务，需要更新基线。

### 触发

```
项目有大量变更，需要重新扫描更新基线
```

### 执行过程

1. **Phase 0**：检测到已有状态文件 + 用户要求重扫 → mode = `full_rescan`
2. 归档旧产物到 `{project_knowledge}/brownfield/archive/20260717-103000/`
3. 重新初始化状态文件
4. 按 initial_scan 相同流程重新执行 Phase 1-5

### 要点

- 旧产物被完整归档，不会丢失
- 新扫描会发现新增的支付模块和通知服务
- 基线文档全量更新

---

## 示例 3：定向深潜（targeted_deep_dive）

### 背景

规划阶段发现订单模块需要大改，但 change-risk-map 标注其为高风险区，需要更深入理解。

### 触发

```
对订单模块做深潜分析，我需要详细了解 order-service 的内部结构
```

### 执行过程

1. **Phase 0**：检测到基线已完成 + 用户指定深潜区域 → mode = `targeted_deep_dive`
2. **Phase 4**：对 `server/src/services/order-service/` 区域做 exhaustive 分析
   - 完整文件清单（15 个文件）
   - exports/imports 关系图
   - data flow：订单创建 → 库存检查 → 支付 → 通知
   - side effects：写入 Redis 缓存、发送 Kafka 消息
   - integration points：Stripe API、库存服务
   - TODO/FIXME：3 个待处理项
   - 测试覆盖：仅 2 个单元测试
   - reuse opportunities：OrderValidator 可复用

### 输出

```
{project_knowledge}/brownfield/deep-dives/deep-dive-order-service.md
```

---

## 示例 4：规划生成（planning_generation）

### 背景

基线已经生成，现在有了新的功能需求（添加批量退款），需要重新生成规划文档。

### 触发

```
基线已经有了，现在帮我生成批量退款功能的规划文档
```

### 执行过程

1. **Phase 0**：检测到基线已完成 + 用户要求生成规划 → mode = `planning_generation`
2. **Phase 5**：基于基线和新需求生成规划
   - planning-brief — 引用支付模块和订单模块的现有能力
   - prd.md — 批量退款的需求定义
   - architecture.md — 增量设计：扩展退款服务、新增批量处理队列
   - epics.md — 3 个 Epic：退款 API、批量队列、管理后台

---

## 示例 5：历史文档摄取

### 背景

项目有 3 份历史 PRD（企业租户、权限管理、订单 v2）存放在 `{project-root}/docs/history/` 目录。

### 触发

首次扫描时自动检测到 `{project-root}/docs/history/` 目录，或用户指定：

```
请同时把 {project-root}/docs/history/ 下的历史文档也纳入分析
```

### 执行过程

1. Phase 2 中运行 `merge_historical_facts.py --history-dir {project-root}/docs/history`
2. 扫描到 3 份文档，分类为 prd
3. 提取 15 条候选事实（全部标记为 UNVERIFIED）
4. 检测到 2 条冲突：
   - 历史 PRD 声称"支持 RBAC"，但代码中仅有 isAdmin 检查
   - 历史 PRD 声称"支持多语言"，但代码中无 i18n 实现
5. Phase 3 生成基线时：
   - 8 条事实在代码中找到实现 → CODE_CONFIRMED
   - 4 条仅有文档支持 → DOC_SUPPORTED
   - 1 条被推断 → INFERRED
   - 2 条冲突提示用户确认

### 要点

- 历史文档结论不直接写入基线
- 冲突需要用户手动确认
- 所有候选事实在基线中标注验证状态
