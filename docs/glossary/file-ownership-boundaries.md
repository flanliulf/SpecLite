# File Ownership Boundaries（文件所有权边界）

`File Ownership Boundaries（文件所有权边界）` 是 SpecLite 用来区分 `installer-owned`、`human-owned` 和 `workflow-owned` 路径的保护模型。它决定 `update`、`repair` 和 `uninstall` 能不能自动修改某个 project-relative path。

完整设计解释见 [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md)。本文作为 glossary 入口，提供快速定义和当前实现边界。

## Terms（术语）

| Term | Definition |
|---|---|
| **installer-owned** | 由 SpecLite installer 生成和管理的安装产物。它可以被 installer 更新、repair 或 uninstall，但写入前仍要经过 manifest、hash、source evidence、update plan 和授权判断。 |
| **human-owned** | 由项目维护者人工维护的配置或定制内容。当前实现明确保护 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml`，允许读取用于配置解析，但不能作为 installer-owned 输出重新生成。 |
| **workflow-owned** | Workflow 执行后产生的过程产物，默认位于 `artifactRoot` 下；默认 `artifactRoot` 是 `_speclite-output`。这些文件记录真实研发过程，不参与 install/update 覆盖。 |

## Installer-Owned（安装器所有）

`installer-owned` 路径属于 SpecLite 安装控制面。典型路径包括：

- `_speclite/config.toml`
- `_speclite/config.user.toml`
- `_speclite/_config/*`
- `_speclite/hooks/*`
- `_speclite/scripts/*`
- `.claude/skills/*`
- `.agents/skills/*`

这类路径不是“可以静默覆盖”的同义词。普通 `update` 会先生成 plan；只有 non-conflicting installer-owned action 在用户显式授权后才会写入。`update --repair` 也只修复可安全恢复的 installer-owned drift。

## Human-Owned（人工所有）

`human-owned` 路径属于项目维护者或团队。当前代码明确匹配：

- `_speclite/custom/*.toml`
- `_speclite/custom/*.user.toml`

这类路径的 `protected` 状态为 `true`。`update` 遇到它们会 `skip`；`uninstall` 遇到它们会 `preserve`。SpecLite 可以读取这些文件来解析 project/user customization，但不能把它们当作 installer 产物重写、重排或格式化。

## Workflow-Owned（Workflow 所有）

`workflow-owned` 路径属于已运行 workflow 的输出。当前分类逻辑是：路径位于 `artifactRoot` 之下时，归为 `workflow-owned`；默认 `artifactRoot` 是 `_speclite-output`。

典型路径包括：

- `_speclite-output/planning-artifacts/*`
- `_speclite-output/implementation-artifacts/*`
- `_speclite-output/review-artifacts/*`
- `_speclite-output/research-artifacts/*`
- story、CR、SR、research 和 process record 等 workflow 记录

这类文件不属于 installer metadata，也不是 canonical source mirror。`update` 遇到它们会 `skip`；`uninstall` 不会自动删除，而是要求 manual action。

## Command Behavior（命令行为）

| Command | Behavior |
|---|---|
| `speclite update` | 对 `human-owned` 和 `workflow-owned` action 生成 `skip`；对 installer-owned drift 生成 update action 或 conflict。 |
| `speclite update --repair` | 只尝试恢复可由 source evidence 安全证明的 installer-owned drift。 |
| `speclite uninstall` | 自动移除 installer-owned paths；保留 human-owned paths；对 workflow-owned 和其他 protected paths 使用 manual action。 |
| `speclite validate` | 检查 files index 与 ownership 分类是否冲突，避免把 protected path 当成 installer-owned 写入目标。 |

## Source Of Truth（事实来源）

| Topic | Source |
|---|---|
| Ownership 分类 | [`../../src/update/ownership-model.ts`](../../src/update/ownership-model.ts) |
| `update` / `repair` plan | [`../../src/update/update-plan.ts`](../../src/update/update-plan.ts) |
| `uninstall` plan | [`../../src/commands/uninstall.ts`](../../src/commands/uninstall.ts) |
| file integrity validation | [`../../src/validation/rules/file-integrity.ts`](../../src/validation/rules/file-integrity.ts) |

本文档由 speclite-agent-docs-steward Skill 自动生成
