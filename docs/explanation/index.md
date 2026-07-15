# Explanation（概念说明）

Explanation 文档用于解释 SpecLite 的核心概念、架构、原理和设计取舍。

## Documents（文档）

| 文档 | 说明 |
|---|---|
| [`local-first-control-plane.md`](local-first-control-plane.md) | SpecLite 为什么是 local-first CLI control plane。 |
| [`runtime-boundaries.md`](runtime-boundaries.md) | canonical source、IDE mirrors、`_speclite`、`_speclite-output` 的边界。 |
| [`skill-taxonomy-and-sdlc.md`](skill-taxonomy-and-sdlc.md) | 区分 CLI、Help、Agent、Workflow、support Skill，并按 SDLC 阶段选择入口。 |
| [`ide-specific-discovery-metadata.md`](ide-specific-discovery-metadata.md) | self-contained Skill entry、installed indexes 与 IDE-specific runtime config 的边界。 |
| [`file-ownership-model.md`](file-ownership-model.md) | installer-owned、human-owned、workflow-owned 的保护模型。 |
| [`speclite-agents.md`](speclite-agents.md) | SpecLite Agent 的 role activation、persona、菜单和 workflow 分发边界。 |
| [`speclite-modules.md`](speclite-modules.md) | SpecLite Module 的安装组织、配置、依赖和 runtime contract。 |
| [`speclite-workflows.md`](speclite-workflows.md) | SpecLite Workflow 的渐进式披露、SDLC 链路、产物和执行边界。 |
