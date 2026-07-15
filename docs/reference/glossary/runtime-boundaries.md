# Runtime Boundaries Glossary（运行边界术语表）

本文提供 SpecLite source、installed runtime 与 workflow artifact 边界的短定义。完整解释见 [`../../explanation/runtime-boundaries.md`](../../explanation/runtime-boundaries.md)。

## Terms（术语）

| Term | Definition |
|---|---|
| **canonical source** | 定义 SpecLite 可以发现、校验和安装什么的权威方法论源包；仓库内置路径是 `assets/source/speclite/`。 |
| **installed runtime projection** | Selected canonical content 在目标项目中的安装态投影，包括 `_speclite/`、IDE mirrors、indexes 和 Hook runtime。 |
| **IDE execution plane** | `.claude/skills/` 与 `.agents/skills/` 下的 self-contained Skill entries，供 IDE 发现和执行。 |
| **metadata/control hub** | 目标项目中的 `_speclite/`，保存 config、manifest、indexes、hooks、compatibility scripts 和 customization 入口。 |
| **workflow artifact repository** | `_speclite-output/` 或配置后的 `output_folder`，保存 workflow-owned 研发过程产物。 |
| **selected module truth** | Manifest、installed indexes 与 runtime tree 共同记录的实际安装模块；bundled source 中未选择的 Module 不属于 installed state。 |
| **runtime projection drift** | Installer-owned mirror、index 或 runtime file 与 installed baseline 不一致的状态。 |

## Related Documents（相关文档）

| Topic | Link |
|---|---|
| 运行边界完整解释 | [`../../explanation/runtime-boundaries.md`](../../explanation/runtime-boundaries.md) |
| Runtime 目录 | [`../runtime-layout.md`](../runtime-layout.md) |
| Canonical source 目录 | [`../canonical-source-layout.md`](../canonical-source-layout.md) |
| IDE discovery 术语 | [`ide-discovery.md`](ide-discovery.md) |
| Workflow artifact 术语 | [`workflow-artifact.md`](workflow-artifact.md) |
