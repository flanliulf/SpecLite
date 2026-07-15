# Workflow Artifact Glossary（Workflow 产物术语表）

本文提供 workflow artifact、目录和生命周期的短定义。完整目录参考见 [`../workflow-artifact-layout.md`](../workflow-artifact-layout.md)。

## Terms（术语）

| Term | Definition |
|---|---|
| **workflow artifact** | Workflow 按配置输出的 planning、implementation、review、research 或 release 产物。 |
| **artifact root** | Workflow artifact 的配置根目录；默认是 `_speclite-output`。 |
| **planning artifacts** | Product Brief、PRD、UX、Architecture、Epics、research 等规划阶段产物。 |
| **implementation artifacts** | Story、Flow Gate、Code Review、Story Review、Retrospective 等实现阶段产物。 |
| **devops artifacts** | CI/CD、deployment 和 release workflow 的产物。 |
| **workflow-owned** | 表示产物由 workflow 和项目维护者管理；installer update/repair 不覆盖，uninstall 不自动删除。 |
| **artifact contract** | Help/phase metadata 中对 output location 和 artifact type 的安装态投影，不代表产物已经生成。 |
| **producer** | 实际创建或更新某类 artifact 的 Workflow；目录存在不能替代 producer evidence。 |
| **iteration snapshot** | 按日期、轮次或 gate run 保存的不可覆盖历史证据。 |
| **living contract** | 在同一产品或 Story 生命周期内持续维护的 PRD、Architecture、Story 等契约文档。 |
| **tracker ledger** | 状态单调推进并保留历史的 sprint status、TODO backlog 或 goal execution records。 |

## Related Documents（相关文档）

| Topic | Link |
|---|---|
| Artifact 目录、producer 与生命周期 | [`../workflow-artifact-layout.md`](../workflow-artifact-layout.md) |
| Workflow 执行边界 | [`../../explanation/speclite-workflows.md`](../../explanation/speclite-workflows.md) |
| Runtime 三层边界 | [`../../explanation/runtime-boundaries.md`](../../explanation/runtime-boundaries.md) |
| File ownership 术语 | [`file-ownership.md`](file-ownership.md) |
