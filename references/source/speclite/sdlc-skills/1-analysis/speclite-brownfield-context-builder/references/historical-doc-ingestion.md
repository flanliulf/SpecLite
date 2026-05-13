<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Historical Document Ingestion — 历史文档摄取规则

> 本文档定义历史文档的支持类型、提取规则、候选事实生成逻辑、冲突识别机制和不可覆盖约束。

## 1 支持的历史文档类型

| 类型 | 关键词 | 典型内容 |
|:-----|:-------|:---------|
| PRD | prd, 产品需求, product requirement | 功能需求、用户场景、验收标准 |
| 技术方案（TSD） | tsd, 技术方案, technical spec, technical design | 技术选型、架构决策、接口设计 |
| 架构文档（ADD） | add, 架构文档, architecture doc | 系统架构、模块划分、部署拓扑 |
| 架构决策记录（ADR） | adr, 架构决策, architecture decision | 决策背景、选项对比、最终决策 |
| Epic / Story | epic, story, 史诗, 用户故事 | 功能拆分、验收标准、开发注意事项 |
| 分析报告 | analysis, 分析, 调研, report, 报告 | 技术调研、可行性分析、竞品分析 |

## 2 输入目录

- 默认路径：`{project-root}/docs/history/`
- 支持用户通过 `--history-dir` 参数指定其他路径
- 支持多级目录结构（递归扫描）
- 支持的文件格式：`.md`, `.rst`, `.txt`, `.adoc`

## 3 提取规则

### 3.1 文档级元数据提取

每份历史文档自动提取以下元数据：

| 字段 | 提取方式 | 说明 |
|:-----|:---------|:-----|
| path | 文件相对路径 | 自动获取 |
| doc_type | 文件名和内容中的关键词匹配 | 见§1 类型表 |
| title | 首个 `# ` 标题，或文件名 | 优先取标题 |
| date_estimate | 正则匹配 `YYYY-MM-DD` 或 `YYYY年MM月` | 从内容前 1000 字符中提取 |
| module_scope | 匹配 "模块/服务/组件：XXX" 模式 | 最多 10 个 |
| related_capabilities | 匹配 "系统支持/提供/实现 XXX" 模式 | 最多 5 个（摘要） |

### 3.2 能力声明提取

从文档内容中提取业务能力声明，作为候选事实：

**中文模式**：
- `系统支持 {能力描述}`
- `平台提供 {能力描述}`
- `模块实现 {能力描述}`
- `应用具备 {能力描述}`

**英文模式**：
- `support {capability}`
- `provide {capability}`
- `implement {capability}`
- `enable {capability}`

每份文档最多提取 20 条能力声明。

### 3.3 代码路径提示提取

从文档中识别代码路径引用：
- 匹配 `src/...`, `app/...`, `server/...`, `client/...`, `lib/...`, `packages/...` 格式
- 每份文档最多 20 个路径提示
- 这些路径用于后续交叉验证时定位代码

## 4 候选事实生成

### 4.1 生成逻辑

`merge_historical_facts.py` 的候选事实生成流程：

```
1. 扫描历史文档目录
2. 对每份文档：
   a. 提取元数据（类型、标题、时间、模块范围）
   b. 提取能力声明（正则匹配）
   c. 提取代码路径提示
3. 每条能力声明生成一条候选事实
4. 分配唯一 fact_id（BF-001, BF-002, ...）
5. 初始状态设为 UNVERIFIED，置信度设为 low
6. 写入 business-fact-candidates.json
```

### 4.2 候选事实字段

```json
{
  "fact_id": "BF-001",
  "statement": "系统支持多租户客户隔离",
  "source_type": "historical-doc",
  "source_file": "{project-root}/docs/history/prd-enterprise-tenant.md",
  "related_code_paths": ["server/src/middleware/tenant.ts"],
  "status": "UNVERIFIED",
  "confidence": "low",
  "notes": ""
}
```

### 4.3 状态流转

候选事实生成后初始为 `UNVERIFIED`，在 Phase 3 基线合成阶段由 AI 进行交叉验证：

```
UNVERIFIED
   ├── 代码中找到实现 → CODE_CONFIRMED (high)
   ├── 现有文档支持 → DOC_SUPPORTED (medium)
   ├── 间接证据推断 → INFERRED (low)
   ├── 已被后续变更覆盖 → SUPERSEDED (不进入基线)
   └── 无法验证 → 保持 UNVERIFIED (不进入基线正文)
```

## 5 冲突识别

### 5.1 冲突检测规则

`merge_historical_facts.py` 在生成候选事实时进行简单冲突检测：

**规则 1：相似声明来自不同文档**
- 两条候选事实的 statement 前 30 字符相似（忽略大小写）
- 但来源文档不同
- 标记为潜在冲突

**规则 2：同一模块的矛盾声明**（由 Phase 3 AI 检测）
- 历史文档声称某能力存在，但代码中未找到对应实现
- 或历史文档声称使用技术 A，但代码中使用技术 B

### 5.2 冲突记录格式

```json
{
  "conflict_id": "FC-001",
  "description": "历史 PRD 声称支持 RBAC，但代码中仅有简单角色检查",
  "fact_a": {
    "source": "{project-root}/docs/history/prd-auth.md",
    "claim": "支持 RBAC 细粒度权限"
  },
  "fact_b": {
    "source": "server/src/middleware/auth.ts",
    "claim": "仅检查 isAdmin 布尔值"
  },
  "resolution": "pending",
  "resolved_as": ""
}
```

### 5.3 冲突处理原则

- 冲突**不自动裁决**，必须提示用户确认
- `resolution` 值：`pending` → `user_confirmed` 或 `auto_resolved`
- `resolved_as` 记录最终裁决结果
- 所有 pending 冲突在进入 Phase 3 前提醒用户
- 用户确认后更新 `fact-conflicts.json`

## 6 不可覆盖约束

### 6.1 核心原则

**历史文档是"证据源"，不是"真相源"。**

任何历史事实必须经过以下路径才能进入基线：

```
historical-doc → candidate fact → code/doc cross-check → baseline fact
```

### 6.2 禁止行为

- 禁止将历史 PRD 中的需求描述直接作为当前系统能力写入基线
- 禁止将历史技术方案中的设计选型直接作为当前架构描述
- 禁止跳过交叉验证步骤
- 禁止自动将 UNVERIFIED 事实提升为 CODE_CONFIRMED

### 6.3 例外情况

仅当以下条件同时满足时，可将历史文档结论直接标记为 DOC_SUPPORTED：
1. 现有仓库文档（README / docs/）明确引用或确认该结论
2. 结论涉及的模块/文件在代码中存在（但逻辑无法由脚本自动验证）
3. 无其他文档或代码与之矛盾
