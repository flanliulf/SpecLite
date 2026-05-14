<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Brownfield Planning Brief

> 本文档是基于既有系统基线生成的规划摘要，作为 PRD / Architecture / Epics 的前置输入。

## 1 当前系统相关能力摘要

<!-- 从 business-capability-matrix.md 提取与本次需求相关的现有能力 -->

| 能力 | 子能力 | 涉及模块 | 证据等级 |
|:-----|:-------|:---------|:---------|
| {{capability}} | {{sub_capability}} | {{modules}} | {{evidence_level}} |

## 2 与本次需求相关的现有模块

<!-- 从 as-is-architecture.md 和 system-overview.md 提取 -->

| 模块 | 职责 | 当前状态 | 关联 API |
|:-----|:-----|:---------|:---------|
| {{module}} | {{responsibility}} | {{status}} | {{apis}} |

## 3 可复用能力

<!-- 从 reuse-opportunities.md 提取 -->

- {{reusable_service_or_component}}

## 4 不可突破的约束

<!-- 从 constraints-and-invariants.md 提取 -->

- {{constraint}}

## 5 风险与未知点

<!-- 从 change-risk-map.md 提取 -->

| 风险区域 | 风险类型 | 等级 | 说明 |
|:---------|:---------|:-----|:-----|
| {{area}} | {{type}} | {{level}} | {{description}} |

## 6 候选变更切片

<!-- 从基线分析推导 -->

| 切片 | 维度 | 影响模块 | 可独立实施 | 风险等级 |
|:-----|:-----|:---------|:-----------|:---------|
| {{slice}} | {{dimension}} | {{modules}} | {{independent}} | {{risk}} |

## 7 推荐的迭代范围边界

<!-- 基于上述分析给出建议 -->

- {{boundary_recommendation}}
