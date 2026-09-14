# IDE Discovery Glossary（IDE 发现术语表）

本文提供 IDE Skill entry 与 installed discovery metadata 的短定义。完整解释见 [`../../explanation/ide-discovery-metadata.md`](../../explanation/ide-discovery-metadata.md)。

## Terms（术语）

| Term | Definition |
|---|---|
| **self-contained Skill entry** | IDE 可以直接加载的完整 installed Skill package；当前位于 `.claude/skills/<id>/` 或 `.agents/skills/<id>/`。 |
| **IDE-specific discovery metadata** | 帮助 IDE 或 CLI 找到、展示、验证或调用 installed entry 的索引、路径和平台配置，不重新定义 Skill 语义。 |
| **activation target** | 指向 installed `SKILL.md` 的可执行入口路径，由 help index 或 phase coverage 使用。 |
| **skill index** | 记录 canonical Skill id、source path、package hash、installed targets 和 phases 的安装态索引。 |
| **help index** | 记录帮助菜单 label、canonical Skill id 和 activation target 的安装态路由索引。 |
| **phase coverage** | 记录 Module、phase、Skill、IDE target 与 artifact contract projection 的安装态索引。 |
| **platform Hook config** | `.claude/settings.json` 或 `.codex/hooks.json` 等 IDE-specific event 配置；它不定义 Hook 的业务语义。 |
| **command pointer** | 指向已有执行入口的薄声明；当前 adapter registry 使用 `commandPointerBehavior: none`，不属于已实现 runtime surface。 |

## Related Documents（相关文档）

| Topic | Link |
|---|---|
| IDE discovery 完整解释 | [`../../explanation/ide-discovery-metadata.md`](../../explanation/ide-discovery-metadata.md) |
| Runtime 三层边界 | [`../../explanation/runtime-boundaries.md`](../../explanation/runtime-boundaries.md) |
| Runtime layout | [`../runtime-layout.md`](../runtime-layout.md) |
| Agent 体系 | [`../../explanation/speclite-agents.md`](../../explanation/speclite-agents.md) |
