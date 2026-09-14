# IDE-Specific Discovery Metadata（IDE 特定发现元数据）

IDE-specific discovery metadata 是 SpecLite 为目标 IDE 生成的安装态索引、入口路径或平台配置。它帮助 IDE 和 CLI 发现、展示、验证或调用已安装 Skill，但不重新定义 canonical Skill 的语义。

术语速查见 [`../reference/glossary/ide-discovery.md`](../reference/glossary/ide-discovery.md)。

## Canonical Package and Runtime Entry（Canonical 包与运行入口）

Canonical Skill package 位于 `assets/source/speclite/` 的 selected Module root 中。一个可安装 package 以 `SKILL.md` 为入口，并可包含 `references/`、`assets/`、`scripts/`、`data/`、`customize.toml` 等内容。

当前 IDE adapters 都使用 `self-contained-skill` entry：

| Target | Installed Entry |
|---|---|
| Claude | `.claude/skills/<canonical-skill-id>/` |
| Agents / Codex | `.agents/skills/<canonical-skill-id>/` |

Installer 将 selected canonical package 复制到这些 entry。`skill-index.json` 记录 package hash 和 installed targets，IDE mirror validator 再检查安装内容是否与 installed baseline 一致。

## Discovery Surfaces（发现面）

当前 installed runtime 使用多种 discovery surfaces：

| Surface | Purpose | Semantic Authority |
|---|---|---|
| Self-contained Skill entry | 让 IDE 加载完整 Skill package。 | 内容来自 canonical package；mirror 本身不是新 source。 |
| `_speclite/_config/skill-index.json` | 记录 canonical Skill identity、source path、hash、targets 和 phases。 | Installed-state index，不定义 Skill workflow。 |
| `_speclite/_config/help-index.json` | 为菜单、帮助和入口路由提供 label 与 activation target。 | 来自 selected Module metadata。 |
| `_speclite/_config/phase-coverage.json` | 记录 phase、Module、Skill、IDE target 和 artifact contract projection。 | 来自 selected Module help metadata。 |
| `_speclite/_config/files-index.json` | 记录 installed file、hash、ownership、artifact kind 和 source ref。 | Installer ownership 与 integrity evidence。 |
| `.claude/settings.json`、`.codex/hooks.json` | 为 selected IDE 配置 Hook event entry。 | Platform-specific runtime config，不定义 Hook 或 Skill 的业务语义。 |

这些 surfaces 可以包含不同的目标路径和平台结构，但必须指向同一个 canonical Skill identity 和 selected installed state。

## Adapter Boundary（Adapter 边界）

当前 adapter registry 只支持：

- `claude` 与 `agents` 两个 target。
- `self-contained-skill` entry type。
- `dedupe-by-canonical-skill-id` shared target policy。
- `commandPointerBehavior: none`。

因此，command pointer、wrapper file 或其他 IDE-specific entry shape 目前不是已实现的公共 runtime contract。未来如果新增，必须同步 adapter registry、manifest/index schema、validation、fixtures 和公开 Reference，不能只在文档中推断其存在。

## Hash and Repair Boundary（Hash 与修复边界）

Canonical package hash 用于证明 installed mirror 是否保持 package 内容一致。Discovery indexes 和 platform Hook config 是独立 installer-owned artifacts，由各自 schema、files index 和 validation 约束。

这意味着：

- 改动 IDE mirror 中的 canonical package 文件会产生 hash mismatch。
- 修改 help、phase 或 target metadata 不能改变 `SKILL.md` 的 workflow 语义。
- IDE-specific path 或 config 不能回写成 canonical package source。
- Repair 必须从 source evidence 恢复 installer-owned 内容，不能从 drifted mirror 反向生成 source。

## Design Rules（设计规则）

- Canonical package 定义 Skill；discovery metadata 只定义如何找到和验证 installed entry。
- Selected module truth 决定生成哪些 entries 和 indexes。
- 不同 IDE 可以拥有不同 target path 和 platform config，但同一 canonical Skill 的 package identity 必须一致。
- Runtime descriptor、help row 和 capability catalog 不替代 `SKILL.md`。
- 未进入 adapter registry、schema 和 tests 的 entry shape 不应写成当前能力。

## Related Documents（相关文档）

| Topic | Link |
|---|---|
| Runtime 三层边界 | [`runtime-boundaries.md`](runtime-boundaries.md) |
| Installed runtime layout | [`../reference/runtime-layout.md`](../reference/runtime-layout.md) |
| Canonical source layout | [`../reference/canonical-source-layout.md`](../reference/canonical-source-layout.md) |
| Agent activation 与 runtime descriptor | [`speclite-agents.md`](speclite-agents.md) |
| Module selection 与 installed indexes | [`speclite-modules.md`](speclite-modules.md) |
