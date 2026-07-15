# Runtime Boundaries（运行边界）

SpecLite 的运行边界用于区分三类容易混淆的内容：canonical methodology package source、目标项目中的 installed runtime projection，以及 workflow 执行后形成的 artifact repository。三者处于同一安装与执行链路，但拥有不同的事实来源、所有权和生命周期。

术语速查见 [`../reference/glossary/runtime-boundaries.md`](../reference/glossary/runtime-boundaries.md)；具体目录字段见 [`../reference/runtime-layout.md`](../reference/runtime-layout.md)。

## Boundary Model（边界模型）

| Layer | Typical Paths | Responsibility | Ownership |
|---|---|---|---|
| Canonical source | `assets/source/speclite/` | 定义 SpecLite 可以发现、校验和安装的方法论 package、Module、Hook 与 runtime helper。 | source-owned |
| Installed runtime projection | `_speclite/`、`.claude/skills/`、`.agents/skills/` | 记录 selected modules、安装状态、配置、索引、Hook 和 IDE execution entries。 | installer-owned + human-owned customization |
| Workflow artifact repository | `_speclite-output/` 或配置后的 `output_folder` | 保存 research、planning、implementation、review、release 等真实 workflow 产物。 | workflow-owned |

数据流方向是 canonical source → installed runtime projection → workflow artifacts。IDE mirror 或 `_speclite-output/` 不能反向成为 canonical source。

## Canonical Source（规范来源）

`assets/source/speclite/` 是仓库内置方法论源包的事实来源。它包含：

- `core-skills/`、`sdlc-skills/` 和 optional `ecosystems/` Module roots。
- `support-skills/` 中只面向维护者的 canonical source 工具。
- `hooks/` 中可安装的 deterministic guardrails。
- `scripts/` 中需要投影到目标项目的 compatibility helpers。
- `custom/` 中的 customization 示例。

Canonical source 回答“可以安装什么”。Module selection 再决定“本次实际安装什么”。默认安装只选择 `core` + `sdlc`；optional ecosystem module 只有被显式选择后才进入目标项目。

详细源目录见 [`../reference/canonical-source-layout.md`](../reference/canonical-source-layout.md)。

## IDE Execution Plane（IDE 执行面）

`.claude/skills/<skill-id>/` 和 `.agents/skills/<skill-id>/` 是 selected canonical Skill package 的 self-contained runtime mirrors。

这些目录用于让对应 IDE 发现并加载 Skill。它们是 installer-owned projection，不是新的权威来源：

- `skill-index.json` 记录 `canonicalSkillId`、`canonicalPackageHash` 和 `installedTargets`。
- IDE mirror validator 根据 installed index 和 package hash 检查 missing entry、hash mismatch 和 duplicate entry。
- `update --repair` 只能依据 source evidence 修复可恢复的 installer-owned drift。
- 人工修改 mirror 不会改变 canonical source，只会制造 installed-state drift。

IDE-specific discovery metadata 与 self-contained Skill 内容的区别见 [`ide-specific-discovery-metadata.md`](ide-specific-discovery-metadata.md)。

## Control Hub（控制中心）

`_speclite/` 是目标项目的 metadata/control hub，不是 Skill execution directory，也不是 workflow artifact root。

它主要保存：

| Path | Role |
|---|---|
| `_speclite/config.toml` | installer-managed shared runtime config。 |
| `_speclite/config.user.toml` | installer-managed user-local install answers。 |
| `_speclite/custom/*.toml` | human-owned team/user customization。 |
| `_speclite/_config/manifest.yaml` | installed source、selected modules、targets 与路径。 |
| `_speclite/_config/*-index.json` | installed Skill、help、file 与 phase discovery metadata。 |
| `_speclite/hooks/` | installed Hook runners 与 metadata。 |
| `_speclite/scripts/` | legacy compatibility、migration aid 与 troubleshooting scripts。 |

已安装 Skill 的唯一默认 resolver 是 Node CLI：`speclite resolve config` 和 `speclite resolve customization`。`_speclite/scripts/resolve_*.py` 只属于 compatibility assets，不是默认 activation dependency。

## Artifact Repository（产物仓库）

`_speclite-output/` 是默认 workflow artifact repository。实际路径来自 `_speclite/config.toml`：

- `core.output_folder`
- `modules.sdlc.planning_artifacts`
- `modules.sdlc.implementation_artifacts`
- `modules.sdlc.devops_artifacts`
- `modules.sdlc.project_knowledge`

Artifact repository 回答“workflow 实际产生了什么”。其中的 Story、PRD、Architecture、review、Flow Gate 和 release report 记录真实过程，不参与 install/update 覆盖，也不会被 uninstall 自动删除。

目录、producer 和生命周期分类见 [`../reference/workflow-artifact-layout.md`](../reference/workflow-artifact-layout.md)。

## Ownership Boundary（所有权边界）

安装位置相邻不代表 owner 相同：

| Ownership | Examples | Installer Behavior |
|---|---|---|
| `installer-owned` | `_speclite/_config/*`、Hook runtime、IDE mirrors | 可以计划 update、repair 或 uninstall，但必须通过 hash、source evidence、conflict 和授权检查。 |
| `human-owned` | `_speclite/custom/*.toml` | 可以读取，不能静默覆盖或删除。 |
| `workflow-owned` | `_speclite-output/*` 或 configured artifact root | update 跳过，repair 不重建，uninstall 要求人工处理。 |

详细保护模型见 [`file-ownership-model.md`](file-ownership-model.md)。

## Selected Module Truth（已选模块事实）

Bundled source 中存在某个 Module，不表示目标项目已经安装它。Installed-state 以 manifest 的 `installedModules`、`skill-index.json` 的 `installedTargets` 和已生成 indexes 为准。

因此：

- 未选择的 ecosystem Module 只存在于 canonical source。
- 已选择的 Module 才进入 IDE mirrors、config、help index、phase coverage 和 files index。
- `validate`、`status`、`update` 和 `repair` 不从未选择的 bundled packages 推导目标项目应有内容。

## Common Misreadings（常见误解）

- `_speclite/` 不是 canonical source；它记录某个目标项目的 installed runtime state。
- `.claude/skills/` 和 `.agents/skills/` 不是可独立演进的 Skill source；它们是可验证、可修复的 installed mirrors。
- `_speclite-output/` 不是 installer cache；它保存 workflow-owned 研发历史。
- Bundled ecosystem source 不等于 installed ecosystem projection；selected module truth 才决定目标项目内容。
- Python resolver compatibility scripts 的存在不改变 Node CLI resolver 的唯一默认地位。

## Related Documents（相关文档）

| Topic | Link |
|---|---|
| Runtime 目录与 installed paths | [`../reference/runtime-layout.md`](../reference/runtime-layout.md) |
| Canonical source 目录 | [`../reference/canonical-source-layout.md`](../reference/canonical-source-layout.md) |
| Workflow artifact 目录与生命周期 | [`../reference/workflow-artifact-layout.md`](../reference/workflow-artifact-layout.md) |
| Config 与 customization | [`../reference/config-and-customization.md`](../reference/config-and-customization.md) |
| File ownership model | [`file-ownership-model.md`](file-ownership-model.md) |
| IDE discovery metadata | [`ide-specific-discovery-metadata.md`](ide-specific-discovery-metadata.md) |
