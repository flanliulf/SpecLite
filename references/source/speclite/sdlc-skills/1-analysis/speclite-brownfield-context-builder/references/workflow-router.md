<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Workflow Router — 模式与阶段路由

> 本文档定义 speclite-brownfield-context-builder 的 4 种运行模式、6 个执行阶段的路由规则，以及中断恢复策略。
> 这是 Phase 0 的核心参考文件，决定整个工作流的执行路径。

## 1 模式判定逻辑

在 Phase 0 中，按以下顺序判定运行模式：

```
1. 读取 <project_root>/<output_dir>/project-scan-report.json
2. 文件不存在？
   → mode = initial_scan
3. 文件存在，用户明确要求 "重新扫描" / "full rescan"？
   → mode = full_rescan
   → 归档旧产物到 <output_dir>/archive/<timestamp>/
   → 重新初始化状态文件
4. 文件存在，phase = completed 或 phase >= phase_3_baseline，用户要求 "深潜" / "deep dive" 某区域？
   → mode = targeted_deep_dive
5. 文件存在，phase = completed 或 phase >= phase_3_baseline，用户要求 "生成规划" / "generate planning"？
   → mode = planning_generation
6. 文件存在，phase 未完成？
   → resume 模式：继续上次未完成的 phase
```

## 2 模式进入条件总表

| 模式 | 进入条件 | 执行路径 | 前置要求 |
|:-----|:---------|:---------|:---------|
| `initial_scan` | 无状态文件 | Phase 0→1→2→3→(4)→5 | 无 |
| `full_rescan` | 有状态文件 + 用户明确要求重扫 | Phase 0→1→2→3→(4)→5 | 归档旧产物 |
| `targeted_deep_dive` | 用户指定深潜区域 | Phase 0→4 | Phase 3 已完成 |
| `planning_generation` | 用户要求生成规划 | Phase 0→5 | Phase 3 已完成 |

## 3 阶段跳转矩阵

### 3.1 正常流转

| 当前阶段 | 完成条件 | 下一阶段 |
|:---------|:---------|:---------|
| Phase 0 (Routing) | 模式确定、参数确认、状态文件就绪 | Phase 1 / 4 / 5（取决于模式） |
| Phase 1 (Classification) | repo-manifest.json 生成、parts 划分完成 | Phase 2 |
| Phase 2 (Evidence) | MVP 证据文件生成（至少 4 个核心 JSON） | Phase 3 |
| Phase 3 (Baseline) | MVP 基线文档生成（至少 6 个核心 Markdown） | Phase 4 或 Phase 5 |
| Phase 4 (Deep-Dive) | 指定区域分析完成 | Phase 5（如需更新规划）或结束 |
| Phase 5 (Planning) | MVP 规划文档生成（至少 4 个核心文档） | completed |

### 3.2 模式→阶段跳转规则

| 模式 | Phase 0 之后跳转到 | 可跳过的阶段 |
|:-----|:------------------|:-------------|
| `initial_scan` | Phase 1 | Phase 4（可选） |
| `full_rescan` | Phase 1（归档后） | Phase 4（可选） |
| `targeted_deep_dive` | Phase 4 | Phase 1, 2, 3, 5 |
| `planning_generation` | Phase 5 | Phase 1, 2, 3, 4 |

### 3.3 Phase 完成判定标准

**Phase 1 完成**：
- `evidence/repo-manifest.json` 已生成
- `evidence/existing-doc-inventory.json` 已生成
- 状态文件中 `project_parts` 已填充

**Phase 2 完成**（MVP 最低要求）：
- `evidence/api-inventory.json` 已生成
- `evidence/data-model-inventory.json` 已生成
- `evidence/dependency-graph.json` 已生成
- `evidence/business-fact-candidates.json` 已生成（如有历史文档输入）

**Phase 3 完成**（MVP 最低要求）：
- `baseline/index.md` 已生成
- `baseline/system-overview.md` 已生成
- `baseline/as-is-architecture.md` 已生成
- `baseline/business-capability-matrix.md` 已生成
- `baseline/change-risk-map.md` 已生成
- `baseline/api-contracts.md` 已生成

**Phase 4 完成**：
- 所有 `deep_dive_targets` 对应的 `deep-dives/deep-dive-{area}.md` 已生成

**Phase 5 完成**（MVP 最低要求）：
- `planning/brownfield-planning-brief.md` 已生成
- `planning/prd.md` 已生成
- `planning/architecture.md` 已生成
- `planning/epics.md` 已生成

## 4 Resume 恢复策略

### 4.1 恢复判定

当状态文件存在且 `phase` 不是 `completed` 时，进入 resume 流程：

```
1. 读取 state.phase → 确定从哪个阶段继续
2. 读取 state.completed_steps → 确定该阶段内哪些步骤已完成
3. 读取 state.resume_instructions → 获取人可读恢复指令
4. 读取 state.*_status → 确定哪些产出文件需要补生成
5. 从未完成的步骤继续执行
```

### 4.2 各阶段恢复入口

| 中断点 | 恢复动作 |
|:-------|:---------|
| Phase 1 中断 | 重新运行 scan_repo.py（幂等） |
| Phase 2 中断 | 检查 evidence_status，跳过已 done 的，继续 pending 的脚本 |
| Phase 3 中断 | 检查 baseline_status，跳过已 done 的，继续 pending 的文档 |
| Phase 4 中断 | 检查 deep_dive_status，跳过已 done 的区域 |
| Phase 5 中断 | 检查 planning_status，跳过已 done 的，继续 pending 的文档 |

### 4.3 恢复安全规则

- 所有脚本必须是**幂等**的：重新运行不会产生重复数据
- 已生成的文件不自动覆盖，除非用户明确要求 rescan
- evidence_status 为 `error` 的项，恢复时重试一次，仍失败则标为 `skipped` 并记录原因

### 4.4 full_rescan 归档逻辑

```
1. 创建归档目录：<output_dir>/archive/<YYYYMMDD-HHMMSS>/
2. 移动当前 evidence/, baseline/, deep-dives/, planning/ 到归档目录
3. 保留旧状态文件副本到归档目录
4. 重新初始化状态文件
5. 从 Phase 1 开始全新执行
```

## 5 各阶段对应的 Reference / Script

| 阶段 | 需读取的 Reference | 需调用的 Script |
|:-----|:------------------|:---------------|
| Phase 0 | workflow-router.md（本文件） | update_state.py init |
| Phase 1 | repository-classifier.md | scan_repo.py |
| Phase 2 | evidence-extractor.md, evidence-schema.md, historical-doc-ingestion.md | extract_api_inventory.py, extract_data_models.py, build_dependency_graph.py, collect_config_surface.py, collect_test_surface.py, merge_historical_facts.py |
| Phase 3 | baseline-synthesizer.md | update_state.py update |
| Phase 4 | deep-dive-analyzer.md | update_state.py update |
| Phase 5 | planning-synthesizer.md, document-templates.md | update_state.py update |
| 验证 | validation-checklist.md | validate_outputs.py |

## 6 错误处理

### 6.1 脚本执行失败

- 记录错误到 `completed_steps`（step 名称加 `_error` 后缀）
- 对应 evidence_status 设为 `error`
- 更新 resume_instructions 说明失败点
- 不阻塞其他独立脚本的执行

### 6.2 证据不足以生成基线

- 如果 Phase 2 的核心证据文件缺失（api-inventory 或 data-model-inventory），阻塞进入 Phase 3
- 提示用户检查脚本输出或手动补充

### 6.3 事实冲突

- fact_conflicts.json 中存在 pending 冲突时，进入 Phase 3 前提示用户确认
- 不自动裁决冲突
- 用户确认后更新 fact_conflicts.json 的 resolution 字段
