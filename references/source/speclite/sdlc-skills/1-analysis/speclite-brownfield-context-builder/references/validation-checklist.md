<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Validation Checklist — 验证检查清单

> 本文档定义各阶段产物的验证标准。运行 `python scripts/validate_outputs.py` 可自动检查文件级问题。
> 本清单补充自动化脚本无法覆盖的人工检查项。

## 1 文件完整性检查（自动）

### 1.1 Evidence MVP（Phase 2 完成后）

- [ ] `evidence/repo-manifest.json` 存在且 JSON 合法
- [ ] `evidence/api-inventory.json` 存在且 JSON 合法
- [ ] `evidence/data-model-inventory.json` 存在且 JSON 合法
- [ ] `evidence/dependency-graph.json` 存在且 JSON 合法
- [ ] `evidence/business-fact-candidates.json` 存在（如有历史文档输入）

### 1.2 Baseline MVP（Phase 3 完成后）

- [ ] `baseline/index.md` 存在且有标题结构
- [ ] `baseline/system-overview.md` 存在且有标题结构
- [ ] `baseline/as-is-architecture.md` 存在且有标题结构
- [ ] `baseline/business-capability-matrix.md` 存在且有标题结构
- [ ] `baseline/change-risk-map.md` 存在且有标题结构
- [ ] `baseline/api-contracts.md` 存在且有标题结构

### 1.3 Planning MVP（Phase 5 完成后）

- [ ] `planning/brownfield-planning-brief.md` 存在且有标题结构
- [ ] `planning/prd.md` 存在且有标题结构
- [ ] `planning/architecture.md` 存在且有标题结构
- [ ] `planning/epics.md` 存在且有标题结构

### 1.4 状态文件

- [ ] `project-scan-report.json` 存在且 JSON 合法
- [ ] 包含必需字段：workflow_version, mode, phase, evidence_status, baseline_status, planning_status
- [ ] phase 值与实际完成进度一致

## 2 JSON 质量检查（人工抽查）

- [ ] repo-manifest.json 的 `repo_type` 与实际仓库结构一致
- [ ] api-inventory.json 的 API 数量大致合理（与实际路由文件对照）
- [ ] data-model-inventory.json 的模型数量大致合理
- [ ] dependency-graph.json 的 `high_coupling_nodes` 标注是否有遗漏
- [ ] business-fact-candidates.json 中的事实状态标签是否正确

## 3 Markdown 质量检查（人工抽查）

- [ ] 每个基线文档的关键结论有证据来源标注
- [ ] 基线文档无面向未来的建议性表述（"应该..."、"建议..."）
- [ ] 表格对齐且可读
- [ ] 文件间交叉引用路径正确（链接能跳转）
- [ ] 历史候选事实在基线中有明确的验证状态标注

## 4 事实一致性检查（人工）

- [ ] 历史文档与代码的冲突已在 `fact-conflicts.json` 中标注
- [ ] 每个基线文档的关键结论有来源类别标签（code / current-doc / historical-doc）
- [ ] 不存在未说明来源的推断结论（或已标注 [INFERRED]）
- [ ] `business-capability-matrix.md` 中的能力与 `api-inventory.json` 的 API 对得上

## 5 Planning Readiness 检查（人工）

生成的规划文档是否能回答以下问题：

- [ ] 当前系统有哪些相关业务能力？（→ business-capability-matrix.md）
- [ ] 这次新需求会改动哪些模块？（→ architecture.md）
- [ ] 哪些模块/能力可以优先复用？（→ planning-brief 可复用能力章节）
- [ ] 哪些约束不可突破？（→ planning-brief 约束章节）
- [ ] Epic 可以怎样切？（→ epics.md）
- [ ] Story 依赖如何串联？（→ epics.md 依赖关系图）

## 6 Deep-Dive 质量检查（Phase 4 后，如适用）

- [ ] 深潜文档覆盖了目标区域的完整文件清单
- [ ] 包含 exports/imports/dependents 分析
- [ ] 包含 data flow 和 side effects
- [ ] 包含 integration points
- [ ] 包含 reuse opportunities 和 modification guidance

## 7 Stories 质量检查（WP7 后，如适用）

- [ ] 每个 Story 有明确的验收标准
- [ ] Story 的受影响模块与 architecture.md 一致
- [ ] Story 间的依赖关系明确
- [ ] 文件命名遵循 `epic-{nn}-story-{nn}-{name}.md` 格式
