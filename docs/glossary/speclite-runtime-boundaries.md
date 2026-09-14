# SpecLite Runtime Boundaries（SpecLite 运行边界）

> Status: Frozen Compatibility（冻结兼容）。

本文是 legacy compatibility entry，不再承载完整 runtime boundary 说明。

- 术语速查：[`../reference/glossary/runtime-boundaries.md`](../reference/glossary/runtime-boundaries.md)
- 完整解释：[`../explanation/runtime-boundaries.md`](../explanation/runtime-boundaries.md)
- 目录参考：[`../reference/runtime-layout.md`](../reference/runtime-layout.md)

新增引用应优先指向以上主要公开文档；本路径仅用于保持旧链接可用。

兼容说明（测试所必需的最小说明）：`_speclite/scripts/resolve_*.py` 只是 legacy compatibility assets，用于迁移与排查，不是默认 Skill activation path；已安装 Skill 的唯一默认 resolver 是 Node CLI 的 `speclite resolve config`、`speclite resolve customization` 等命令，完整清单见 [`../reference/cli.md`](../reference/cli.md)。
