# Changelog（变更日志）

本文件记录 `speclite-drawer-er-modeler` 的版本变更。

## [1.0.0] - 2026-09-03

### Added（新增）

- 新增 evidence-aware 的 conceptual、logical 与 physical 数据建模流程。
- 新增 Mermaid `erDiagram` 属性、约束键、基数和布局规范。
- 新增实体、关联实体、完整性、索引及范式/反范式设计检查。
- 新增与 `speclite-domain-modeling`、Architecture、Technical Solution 和 PRD Skill 的调用边界。
- 新增“设计图不等于 implementation evidence”的显式限制。
- 初始包在 canonical 接入前由 `speclite-mermaid-er-modeler` 重命名为 renderer-neutral 的 `speclite-drawer-er-modeler`。
- 新增字段充分性门控，禁止在输入缺少明细字段时泛化补齐常见字段。
- 新增 `existing`、`new`、`modified`、`unresolved` 对象分类及固定视觉语义。
- 新增稳定英文 identifier 与中文 display alias 的双语对象名规则。
- 统一 Mermaid 关系标签为双引号包裹的 `中文(英文)` 表达，并要求两种语言的关系方向一致。
- 新增图后关系多重性说明，要求每条关系输出数值形式、关系名称和两个方向的 optional/mandatory 自然语言约束。

### Known Limitations（已知限制）

- Mermaid 自动布局无法保证固定位置或完全避免连线重叠。
- Mermaid ER 不能完整表达所有数据库方言特有约束；复杂约束需在图外补充。
