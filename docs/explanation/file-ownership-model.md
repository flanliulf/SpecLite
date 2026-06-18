# File Ownership Model（文件所有权模型）

SpecLite 的文件所有权模型解释 installer-owned、human-owned 和 workflow-owned 三类路径如何被 install、update、repair、validate 和 uninstall 命令保护。它的核心目的不是给目录命名，而是防止安装控制面误改用户定制和 workflow 过程产物。

术语速查见 [`../glossary/file-ownership-boundaries.md`](../glossary/file-ownership-boundaries.md)。

## Overview（概览）

SpecLite 是 local-first CLI control plane。它会把 canonical skill package、runtime config、hooks、scripts 和 IDE mirror 投影安装到目标项目，也会读取项目内的人工 customization，并允许 workflow 产出 planning、implementation、review 和 research 记录。

这些文件都在同一个项目目录里，但它们的 owner 不同：

- `installer-owned` 是 SpecLite installer 生成和管理的安装产物。
- `human-owned` 是团队人工维护的配置或定制内容。
- `workflow-owned` 是 workflow 执行后产生的过程产物。

所有权模型决定两个问题：

- `update` 或 `repair` 是否可以计划写入某个 path。
- `uninstall` 是否可以自动移除某个 path。

## Classification Order（分类顺序）

当前实现入口是 [`../../src/update/ownership-model.ts`](../../src/update/ownership-model.ts)。分类时先把输入 path normalize 成 project-relative POSIX path；无法安全 normalize 的 path 归为 `unknown`，并按 protected 处理。

有效 path 的分类顺序是：

1. 匹配 `_speclite/custom/*.toml` 或 `_speclite/custom/*.user.toml` 时，归为 `human-owned`。
2. 位于 `artifactRoot` 下时，归为 `workflow-owned`；默认 `artifactRoot` 是 `_speclite-output`。
3. 匹配 installer 管理路径时，归为 `installer-owned`。
4. 其他 path 归为 `unknown`，并按 protected 处理。

这个顺序很重要。SpecLite 宁可把未知或越界 path 保护起来，也不会默认把它当成 installer 可写目标。

## Installer-Owned（安装器所有）

`installer-owned` 文件是 installer 负责生成、验证、更新、repair 或 uninstall 的安装产物。典型路径包括：

- `_speclite/config.toml`
- `_speclite/config.user.toml`
- `_speclite/_config/*`
- `_speclite/hooks/*`
- `_speclite/scripts/*`
- `.claude/skills/*`
- `.agents/skills/*`

这类路径的 ownership classifier 返回 `protected: false`，表示它们属于 installer 管理范围。但这不等于静默覆盖。`update` 仍要比较 files index、当前 hash、source evidence 和 conflict 状态；只有在没有 conflict、存在 planned write 且用户显式授权时才会写入。

`repair` 的边界更窄：它只恢复可由 source evidence 证明的 installer-owned drift。缺失 source evidence 时，repair 不会凭空重建。

## Human-Owned（人工所有）

`human-owned` 文件是团队人工维护的 customization。当前代码明确保护：

- `_speclite/custom/*.toml`
- `_speclite/custom/*.user.toml`

这些 path 的 `protected` 状态为 `true`。SpecLite 可以读取它们来解析 project/user customization，但不能把它们当成 installer-owned output 重新生成。

在命令行为上：

- `update` 遇到 human-owned action 会 `skip`。
- `repair` 不会把 human-owned drift 当作可自动恢复项。
- `uninstall` 遇到 human-owned path 会 `preserve`。

这条边界保护的是用户意图。即使 installer 能读懂这些 TOML，也不能假设自己有权重写它们。

## Workflow-Owned（Workflow 所有）

`workflow-owned` 文件是 workflow 执行后产生的过程产物。默认 `artifactRoot` 是 `_speclite-output`；如果目标项目配置了其他 `artifactRoot`，分类逻辑会使用配置后的 root。

典型内容包括：

- `_speclite-output/planning-artifacts/*`
- `_speclite-output/implementation-artifacts/*`
- `_speclite-output/review-artifacts/*`
- `_speclite-output/research-artifacts/*`
- story、CR、SR、research 和 process record 等 workflow 记录

这些文件记录真实研发过程，不是 installer metadata，也不是 canonical source mirror。它们可能包含人工判断、review 结论、gate 状态和历史证据，因此不能被 install/update 覆盖。

在命令行为上：

- `update` 遇到 workflow-owned action 会 `skip`。
- `repair` 不会自动重建 workflow 产物。
- `uninstall` 不会自动删除 workflow-owned path，而是要求 manual action。

## Lifecycle Matrix（生命周期矩阵）

| Ownership | `update` | `update --repair` | `uninstall` | Rationale |
|---|---|---|---|---|
| `installer-owned` | 可生成 `create`、`update`、`skip` 或 `conflict` action | 可恢复安全证明的 drift | 可自动 `remove` | 属于 installer 管理范围，但仍受 hash、source evidence、conflict 和授权约束。 |
| `human-owned` | `skip` | 不自动修复 | `preserve` | 团队人工维护，installer 可读取但不可重写。 |
| `workflow-owned` | `skip` | 不自动修复 | `manual-action` | 过程产物记录真实研发历史，删除或修改需要人工判断。 |
| `unknown` | protected | protected | `manual-action` | 无法证明 owner 时保守处理。 |

## Safety Gates（安全门禁）

文件所有权不是唯一门禁。installer-owned 写入还需要通过以下检查：

- files index 记录了 path、ownership、hash、sourceRef 和 executable intent。
- 当前文件 hash 与计划预期一致，避免覆盖未确认 drift。
- source evidence 可读取，避免从缺失来源生成内容。
- conflict 列表为空。
- 用户通过 `--yes` 明确授权写入。
- 实际写入经过 safe write，并在现有文件场景传入 expected existing file 条件。

因此，`installer-owned` 的含义是“installer 可以管理”，不是“installer 可以无条件覆盖”。

## Validation Relationship（与 validate 的关系）

`validate` 的 file integrity 规则会重新分类 files index entries。如果 files index 记录某个 entry 是 `installer-owned`，但 runtime 分类发现它落在 `human-owned` 或 `workflow-owned` 边界内，系统会报告 `file-integrity.unsafe-overwrite-risk`。

这个检查用于发现旧 manifest、错误迁移或路径配置变化造成的危险状态。它把潜在覆盖风险暴露为 validation issue，而不是让后续 update 继续写入。

## Common Misreadings（常见误解）

`installer-owned` 不表示静默覆盖。它只表示 path 属于 installer 管理范围，实际写入仍要经过 update plan、hash、source evidence、conflict 和授权。

`human-owned` 不表示 SpecLite 完全忽略。SpecLite 可以读取 human-owned TOML 来解析配置，但不能把它们当作安装产物重写。

`workflow-owned` 不表示临时缓存。Workflow 产物记录团队研发过程，默认应长期保留，除非项目维护者明确清理。

`unknown` 不会被当作 installer-owned 自动写入。分类器会把未知 path 保护起来，要求人工判断。

## Example Scenarios（示例场景）

如果 `_speclite/scripts/resolve_config.py` 的 hash 与 files index 不一致，`update --repair` 可以在 source evidence 存在时计划恢复它，因为该 path 属于 installer-owned。

如果 `_speclite/custom/config.toml` 已存在，`update` 不会重写它。该文件属于 human-owned，即使 installer 需要读取它参与配置解析，也不能格式化或替换它。

如果 `_speclite-output/planning-artifacts/epics/index.md` 出现在 files index 中，runtime 分类会把它视为 workflow-owned。`update` 会跳过，`uninstall` 也不会自动删除。

如果项目把 `artifactRoot` 配置为 `.artifacts`，那么 `.artifacts/review/report.md` 会归为 workflow-owned，而不是 unknown 或 installer-owned。

## Related Docs（相关文档）

| Topic | Link |
|---|---|
| 术语速查 | [`../glossary/file-ownership-boundaries.md`](../glossary/file-ownership-boundaries.md) |
| update / repair 操作 | [`../how-to/update-and-repair.md`](../how-to/update-and-repair.md) |
| uninstall 操作 | [`../how-to/manage-installed-project.md`](../how-to/manage-installed-project.md) |
| CLI 参考 | [`../reference/cli.md`](../reference/cli.md) |
| runtime 边界 | [`runtime-boundaries.md`](runtime-boundaries.md) |

本文档由 speclite-agent-docs-steward Skill 自动生成
