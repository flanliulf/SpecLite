<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Evidence Schema — 证据文件字段规范

> 本文档定义所有 evidence/ 目录下 JSON 文件的字段 schema、状态标签、必填/选填字段和命名规范。

## 1 状态标签定义

| 标签 | 含义 |
|:-----|:-----|
| `CODE_CONFIRMED` | 代码中有明确实现佐证 |
| `DOC_SUPPORTED` | 现有文档支持但未直接在代码中验证 |
| `INFERRED` | 基于模式或间接证据推断 |
| `SUPERSEDED` | 历史文档记载但已被后续变更覆盖 |
| `UNVERIFIED` | 尚未验证 |

## 2 来源类别标签

| 标签 | 含义 |
|:-----|:-----|
| `code` | 来自代码分析 |
| `current-doc` | 来自仓库现有文档 |
| `historical-doc` | 来自历史 PRD/技术方案 |
| `user-guidance` | 来自用户手动补充 |

## 3 各证据文件字段 Schema

### 3.1 repo-manifest.json

仓库结构清单，由 `scan_repo.py` 生成。

```json
{
  "project_root": "/path/to/project",
  "repo_type": "monolith | monorepo | multi-part",
  "primary_language": "TypeScript",
  "languages": ["TypeScript", "Python"],
  "frameworks": ["Express", "React"],
  "package_manager": "npm | yarn | pnpm | pip | gradle | maven",
  "parts": [
    {
      "name": "server",
      "path": "server/",
      "type": "backend",
      "language": "TypeScript",
      "framework": "Express",
      "entry_point": "server/src/index.ts"
    }
  ],
  "top_level_dirs": ["src/", "docs/", "tests/", "config/"],
  "config_files": ["package.json", "tsconfig.json", ".env.example"],
  "doc_files": ["README.md", "docs/architecture.md"],
  "test_dirs": ["tests/", "__tests__/"],
  "total_files": 342,
  "total_lines_estimate": 45000,
  "scan_timestamp": "2026-04-17T10:30:00Z"
}
```

必填字段：`project_root`, `repo_type`, `primary_language`, `parts`, `scan_timestamp`

### 3.2 api-inventory.json

已实现 API 的事实清单，由 `extract_api_inventory.py` 生成。

```json
{
  "apis": [
    {
      "endpoint": "/api/v1/orders/:id",
      "method": "GET",
      "module": "orders",
      "handler_file": "server/src/routes/orders.ts",
      "handler_symbol": "getOrderById",
      "request_schema_source": "zod/order.ts#GetOrderRequest",
      "response_schema_source": "dto/order.ts#OrderResponse",
      "auth_required": true,
      "middleware": ["auth", "tenantScope"],
      "versioning": "path:v1",
      "source_of_truth": "code",
      "confidence": "high"
    }
  ],
  "total_count": 0,
  "scan_timestamp": "2026-04-17T10:30:00Z"
}
```

必填字段：`endpoint`, `method`, `handler_file`, `source_of_truth`, `confidence`
选填字段：`handler_symbol`, `request_schema_source`, `response_schema_source`, `auth_required`, `middleware`, `versioning`

### 3.3 data-model-inventory.json

数据模型清单，由 `extract_data_models.py` 生成。

```json
{
  "models": [
    {
      "name": "Order",
      "type": "orm_entity | db_table | schema_definition",
      "file": "server/src/models/order.ts",
      "table_name": "orders",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "primary_key": true
        }
      ],
      "relationships": [
        {
          "type": "belongs_to",
          "target": "Customer",
          "foreign_key": "customer_id"
        }
      ],
      "source_of_truth": "code",
      "confidence": "high"
    }
  ],
  "migrations": [
    {
      "file": "migrations/20260101_create_orders.sql",
      "timestamp": "2026-01-01",
      "description": "Create orders table"
    }
  ],
  "scan_timestamp": "2026-04-17T10:30:00Z"
}
```

必填字段：`name`, `type`, `file`, `fields`, `source_of_truth`

### 3.4 dependency-graph.json

模块依赖图，由 `build_dependency_graph.py` 生成。

```json
{
  "nodes": [
    {
      "id": "server/src/services/order-service.ts",
      "module": "orders",
      "type": "service",
      "imports_count": 5,
      "imported_by_count": 3,
      "is_high_coupling": false
    }
  ],
  "edges": [
    {
      "from": "server/src/routes/orders.ts",
      "to": "server/src/services/order-service.ts",
      "type": "import"
    }
  ],
  "high_coupling_nodes": [],
  "module_summary": [
    {
      "module": "orders",
      "internal_edges": 8,
      "external_edges": 3,
      "coupling_score": 0.27
    }
  ],
  "scan_timestamp": "2026-04-17T10:30:00Z"
}
```

必填字段：`nodes`, `edges`, `scan_timestamp`

### 3.5 business-fact-candidates.json

业务候选事实，由 `merge_historical_facts.py` 生成。

```json
{
  "facts": [
    {
      "fact_id": "BF-001",
      "statement": "系统支持多租户客户隔离",
      "source_type": "historical-doc",
      "source_file": "{project-root}/docs/history/prd-enterprise-tenant.md",
      "related_code_paths": [
        "server/src/middleware/tenant.ts",
        "server/src/models/tenant.ts"
      ],
      "status": "CODE_CONFIRMED | DOC_SUPPORTED | INFERRED | SUPERSEDED | UNVERIFIED",
      "confidence": "high | medium | low",
      "notes": ""
    }
  ],
  "total_count": 0,
  "status_summary": {
    "CODE_CONFIRMED": 0,
    "DOC_SUPPORTED": 0,
    "INFERRED": 0,
    "SUPERSEDED": 0,
    "UNVERIFIED": 0
  },
  "scan_timestamp": "2026-04-17T10:30:00Z"
}
```

必填字段：`fact_id`, `statement`, `source_type`, `status`, `confidence`

### 3.6 existing-doc-inventory.json

仓库现有文档索引，由 `scan_repo.py` 生成。

```json
{
  "documents": [
    {
      "path": "docs/architecture.md",
      "type": "architecture | api | deployment | readme | changelog | guide | other",
      "title": "Architecture Overview",
      "source_label": "current-doc",
      "size_bytes": 4500
    }
  ],
  "total_count": 0,
  "scan_timestamp": "2026-04-17T10:30:00Z"
}
```

### 3.7 historical-docs-index.json

历史文档索引，由 `merge_historical_facts.py` 生成。

```json
{
  "documents": [
    {
      "path": "{project-root}/docs/history/prd-enterprise-tenant.md",
      "doc_type": "prd | tsd | add | adr | epic | story | analysis",
      "title": "企业租户 PRD",
      "date_estimate": "2025-06",
      "module_scope": ["tenant", "auth"],
      "related_capabilities": ["多租户隔离", "权限管理"],
      "facts_extracted": 5
    }
  ],
  "total_count": 0,
  "scan_timestamp": "2026-04-17T10:30:00Z"
}
```

### 3.8 fact-conflicts.json

事实冲突记录，由 `merge_historical_facts.py` 生成。

```json
{
  "conflicts": [
    {
      "conflict_id": "FC-001",
      "description": "历史 PRD 声称支持 RBAC，但代码中仅有简单角色检查",
      "fact_a": { "source": "{project-root}/docs/history/prd-auth.md", "claim": "支持 RBAC 细粒度权限" },
      "fact_b": { "source": "server/src/middleware/auth.ts", "claim": "仅检查 isAdmin 布尔值" },
      "resolution": "pending | user_confirmed | auto_resolved",
      "resolved_as": ""
    }
  ],
  "total_count": 0,
  "pending_count": 0,
  "scan_timestamp": "2026-04-17T10:30:00Z"
}
```

## 4 状态文件 Schema

### 4.1 project-scan-report.json

状态文件是整个工作流的 resume 依据，位于 `{project_knowledge}/brownfield/project-scan-report.json`。

```json
{
  "workflow_version": "1.0.0",
  "mode": "initial_scan | full_rescan | targeted_deep_dive | planning_generation",
  "phase": "phase_0_routing | phase_1_classification | phase_2_evidence | phase_3_baseline | phase_4_deep_dive | phase_5_planning | completed",
  "scan_level": "quick | deep | exhaustive",
  "project_root": "/path/to/project",
  "output_dir": "{project_knowledge}/brownfield",
  "history_sources": ["{project-root}/docs/history/"],
  "project_parts": [
    { "name": "server", "path": "server/", "type": "backend" }
  ],
  "completed_steps": [
    { "step": "phase_1_scan_repo", "timestamp": "2026-04-17T10:30:00Z" },
    { "step": "phase_2_extract_api", "timestamp": "2026-04-17T10:35:00Z" }
  ],
  "outputs_generated": [
    "evidence/repo-manifest.json",
    "evidence/api-inventory.json"
  ],
  "evidence_status": {
    "repo-manifest": "done",
    "api-inventory": "done",
    "data-model-inventory": "pending",
    "dependency-graph": "pending",
    "config-surface": "skipped",
    "test-surface": "skipped",
    "historical-docs-index": "pending",
    "business-fact-candidates": "pending",
    "fact-conflicts": "pending"
  },
  "baseline_status": {
    "index": "pending",
    "system-overview": "pending",
    "as-is-architecture": "pending",
    "business-capability-matrix": "pending",
    "change-risk-map": "pending",
    "api-contracts": "pending"
  },
  "deep_dive_targets": [],
  "deep_dive_status": {},
  "planning_status": {
    "brownfield-planning-brief": "pending",
    "prd": "pending",
    "architecture": "pending",
    "epics": "pending"
  },
  "fact_conflicts_pending": 0,
  "resume_instructions": "Continue from phase_2_evidence, next: extract_data_models",
  "created_at": "2026-04-17T10:00:00Z",
  "updated_at": "2026-04-17T10:35:00Z"
}
```

#### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|:-----|:-----|:-----|:-----|
| `workflow_version` | string | 是 | Skill 版本号，与 SKILL.md metadata.version 一致 |
| `mode` | string | 是 | 当前运行模式 |
| `phase` | string | 是 | 当前所处阶段 |
| `scan_level` | string | 是 | 扫描级别 |
| `project_root` | string | 是 | 项目根目录绝对路径 |
| `output_dir` | string | 是 | 产物输出目录（相对于 project_root） |
| `history_sources` | array | 否 | 历史文档目录路径列表 |
| `project_parts` | array | 否 | 仓库 parts 列表（Phase 1 后填充） |
| `completed_steps` | array | 是 | 已完成步骤及时间戳 |
| `outputs_generated` | array | 是 | 已生成的产物文件路径列表 |
| `evidence_status` | object | 是 | 各证据文件状态：done / pending / skipped / error |
| `baseline_status` | object | 是 | 各基线文档状态 |
| `deep_dive_targets` | array | 否 | 深潜目标区域列表 |
| `deep_dive_status` | object | 否 | 各深潜目标的状态 |
| `planning_status` | object | 是 | 各规划文档状态 |
| `fact_conflicts_pending` | number | 是 | 待确认的事实冲突数量 |
| `resume_instructions` | string | 是 | 人可读的恢复指令 |
| `created_at` | string | 是 | 状态文件创建时间 ISO 8601 |
| `updated_at` | string | 是 | 最近更新时间 ISO 8601 |

#### 状态值枚举

- 各 `*_status` 对象中的值：`done` / `pending` / `in_progress` / `skipped` / `error`
- `phase` 值：`phase_0_routing` / `phase_1_classification` / `phase_2_evidence` / `phase_3_baseline` / `phase_4_deep_dive` / `phase_5_planning` / `completed`
