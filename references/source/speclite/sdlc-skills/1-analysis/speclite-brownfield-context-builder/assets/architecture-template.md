<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Architecture — {{feature_name}} 增量架构设计

> 本文档描述基于当前 as-is 架构的增量变更设计，不是系统全貌重写。

## 1 当前基线

<!-- 引用 baseline/as-is-architecture.md 中的相关部分 -->

### 1.1 相关模块现状

| 模块 | 当前职责 | 技术栈 |
|:-----|:---------|:-------|
| {{module}} | {{responsibility}} | {{tech}} |

### 1.2 相关数据模型现状

<!-- 引用 baseline/data-models.md -->

## 2 增量目标

- {{delta_goal}}

## 3 模块变更

| 模块 | 变更类型 | 变更内容 | 影响范围 |
|:-----|:---------|:---------|:---------|
| {{module}} | 新增/修改/扩展 | {{change}} | {{impact}} |

## 4 数据变更

| 实体/表 | 变更类型 | 变更内容 |
|:---------|:---------|:---------|
| {{entity}} | 新增/修改字段 | {{change}} |

## 5 API 变更

| 端点 | 方法 | 变更类型 | 说明 |
|:-----|:-----|:---------|:-----|
| {{endpoint}} | {{method}} | 新增/修改 | {{description}} |

## 6 集成变更

<!-- 外部服务、第三方 API、消息队列等变更 -->

## 7 风险与缓解

| 风险 | 等级 | 缓解方案 |
|:-----|:-----|:---------|
| {{risk}} | {{level}} | {{mitigation}} |

## 8 实施顺序建议

1. {{step_1}}
2. {{step_2}}

## 9 参考文档

- baseline/as-is-architecture.md
- baseline/change-risk-map.md
- planning/prd.md
