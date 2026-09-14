# File Ownership Glossary（文件所有权术语表）

本文提供 SpecLite 文件所有权模型的短定义。完整行为和示例见 [`../../explanation/file-ownership-model.md`](../../explanation/file-ownership-model.md)。

## Terms（术语）

| Term | Definition |
|---|---|
| **installer-owned** | SpecLite installer 生成和管理的 runtime 文件；可以计划 update、repair 或 uninstall，但仍受 hash、source evidence、conflict 和授权约束。 |
| **human-owned** | 团队或个人维护的 customization；SpecLite 可以读取，但不能静默覆盖或删除。 |
| **workflow-owned** | Workflow 执行后产生的 planning、implementation、review 或 release artifacts；update 跳过，uninstall 要求人工处理。 |
| **unknown** | 无法证明 owner 的路径；按 protected 处理，不自动写入或删除。 |
| **protected path** | 当前操作无权自动修改的路径，包括 human-owned、workflow-owned 和 unknown。 |
| **artifact root** | Workflow-owned 内容的配置根目录；默认是 `_speclite-output`，也可以由 runtime config 指定。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 所有权矩阵（唯一源定义） | [`../ownership-matrix.md`](../ownership-matrix.md) |
| 所有权模型解释 | [`../../explanation/file-ownership-model.md`](../../explanation/file-ownership-model.md) |
| Runtime 三层边界 | [`../../explanation/runtime-boundaries.md`](../../explanation/runtime-boundaries.md) |
| Runtime layout | [`../runtime-layout.md`](../runtime-layout.md) |
| Workflow artifact 术语 | [`workflow-artifact.md`](workflow-artifact.md) |
