<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Evidence Extractor — 证据层提取

> 本文档定义证据层的目标、事实分类、脚本职责映射和历史文档摄取流程。

## 1 证据层目标

提取确定性、准确定性、可追溯、可复查的系统事实证据，形成结构化证据层。

所有证据必须满足：
- **可追溯**：每条事实标注来源（code / current-doc / historical-doc / user-guidance）
- **可复查**：结构化 JSON 格式，字段定义见 `evidence-schema.md`
- **可分级**：每条事实标注置信度（high / medium / low）和状态标签

## 2 事实分类

| 分类 | 产出文件 | 提取脚本 |
|:-----|:---------|:---------|
| 技术事实 | repo-manifest.json, tech-stack-inventory.json, entry-points.json, config-surface.json, dependency-graph.json, integration-surface.json, test-surface.json | scan_repo.py, build_dependency_graph.py, collect_config_surface.py, collect_test_surface.py |
| API/数据事实 | api-inventory.json, api-contract-candidates.json, data-model-inventory.json, schema-migration-index.json | extract_api_inventory.py, extract_data_models.py |
| 文档事实 | existing-doc-inventory.json, historical-docs-index.json | scan_repo.py, merge_historical_facts.py |
| 业务候选事实 | business-fact-candidates.json, fact-conflicts.json | merge_historical_facts.py |

## 3 脚本职责映射

### 3.1 scan_repo.py

| 项目 | 说明 |
|:-----|:-----|
| **用途** | 扫描仓库结构，识别语言/框架/配置/文档/测试目录 |
| **输入** | `<project_root>` 项目根目录 |
| **参数** | `--output-dir` 输出目录（默认 `{project_knowledge}/brownfield`） |
| **输出** | `evidence/repo-manifest.json` — 仓库结构清单 |
|  | `evidence/existing-doc-inventory.json` — 现有文档索引 |
| **支持** | monolith / monorepo / multi-part 自动检测；JS/TS/Python/Java/Go/Rust/Ruby/PHP/Dart 语言识别 |
| **幂等** | 是，重复运行覆盖旧文件 |

### 3.2 extract_api_inventory.py

| 项目 | 说明 |
|:-----|:-----|
| **用途** | 提取已实现的 API 端点清单 |
| **输入** | `<project_root>` 项目根目录 |
| **参数** | `--output-dir` |
| **输出** | `evidence/api-inventory.json` — API 清单 |
| **支持** | Express/Koa/Fastify/NestJS/Flask/FastAPI/Django/Spring Boot/Go (Gin/Echo) |
| **检测** | 路由文件自动识别（文件名和目录名包含 route/controller/endpoint/api/handler/view） |
| **幂等** | 是 |

### 3.3 extract_data_models.py

| 项目 | 说明 |
|:-----|:-----|
| **用途** | 提取数据模型和 migration 索引 |
| **输入** | `<project_root>` |
| **参数** | `--output-dir` |
| **输出** | `evidence/data-model-inventory.json` — 数据模型清单 |
|  | `evidence/schema-migration-index.json` — Migration 索引 |
| **支持** | Prisma/TypeORM/Sequelize/Mongoose/SQLAlchemy/Django ORM/JPA |
| **幂等** | 是 |

### 3.4 build_dependency_graph.py

| 项目 | 说明 |
|:-----|:-----|
| **用途** | 构建模块间依赖关系图 |
| **输入** | `<project_root>` |
| **参数** | `--output-dir` |
| **输出** | `evidence/dependency-graph.json` — 依赖图（nodes + edges + 模块摘要） |
| **支持** | JS/TS (import/require)、Python (import/from)、Java/Kotlin (import)、Go (import) |
| **特性** | 高耦合节点检测（被 >=10 个文件引用）；按模块聚合的耦合度评分 |
| **幂等** | 是 |

### 3.5 collect_config_surface.py

| 项目 | 说明 |
|:-----|:-----|
| **用途** | 收集配置面：环境变量、配置文件、Feature Flag、第三方服务 |
| **输入** | `<project_root>` |
| **参数** | `--output-dir` |
| **输出** | `evidence/config-surface.json` |
| **检测** | process.env / os.environ / os.getenv / System.getenv / @Value；17 种第三方服务指纹 |
| **幂等** | 是 |

### 3.6 collect_test_surface.py

| 项目 | 说明 |
|:-----|:-----|
| **用途** | 收集测试面：测试文件、类型分类、覆盖率配置 |
| **输入** | `<project_root>` |
| **参数** | `--output-dir` |
| **输出** | `evidence/test-surface.json` |
| **分类** | unit / integration / e2e 自动归类；Jest/NYC/pytest/Vitest/Jacoco 配置识别 |
| **幂等** | 是 |

### 3.7 merge_historical_facts.py

| 项目 | 说明 |
|:-----|:-----|
| **用途** | 摄取历史文档，生成候选事实和冲突记录 |
| **输入** | `<project_root>` |
| **参数** | `--history-dir`（默认 `{project-root}/docs/history`）、`--output-dir` |
| **输出** | `evidence/historical-docs-index.json` — 历史文档索引 |
|  | `evidence/business-fact-candidates.json` — 候选事实（初始状态 UNVERIFIED） |
|  | `evidence/fact-conflicts.json` — 冲突记录 |
| **文档类型** | PRD / TSD / ADD / ADR / Epic / Story / 分析报告 自动分类 |
| **约束** | 历史文档结论只能生成候选事实，不直接进入基线 |
| **幂等** | 是 |

## 4 执行顺序

Phase 2 中脚本推荐执行顺序：

```
1. scan_repo.py                   ← 必须最先（后续脚本依赖仓库结构信息）
2. extract_api_inventory.py       ← MVP 核心
3. extract_data_models.py         ← MVP 核心
4. build_dependency_graph.py      ← MVP 核心
5. collect_config_surface.py      ← P1 补充
6. collect_test_surface.py        ← P1 补充
7. merge_historical_facts.py      ← 有历史文档时执行
```

步骤 2-6 之间无依赖，可并行执行。步骤 7 独立于 2-6。

## 5 历史文档摄取流程

详细规则见 `references/historical-doc-ingestion.md`。核心流程：

```
历史文档目录（{project-root}/docs/history/）
    ↓
merge_historical_facts.py 扫描
    ↓
为每份文档提取：主题、时间、模块范围、能力声明、代码路径提示
    ↓
生成候选事实（status = UNVERIFIED, confidence = low）
    ↓
简单冲突检测（相似声明来自不同文档）
    ↓
写入 historical-docs-index.json + business-fact-candidates.json + fact-conflicts.json
```

候选事实进入基线前必须经过交叉验证：
- 在代码中找到对应实现 → 提升为 `CODE_CONFIRMED`
- 仅有文档支持 → 标记为 `DOC_SUPPORTED`
- 基于模式推断 → 标记为 `INFERRED`
- 已被后续变更覆盖 → 标记为 `SUPERSEDED`

交叉验证由 Phase 3（基线合成）阶段的 AI 完成，不由脚本自动执行。
