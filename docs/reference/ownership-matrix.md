# Ownership Matrix（所有权矩阵）

本文是 SpecLite 文件所有权分类及其在 `update`、`update --repair`、`uninstall` 中行为的唯一源定义。其它文档引用本文，不再各自维护矩阵。

事实锚点：`src/update/update-plan.ts`（plan action 与 conflict 规则）、`src/commands/uninstall.ts`、`src/validation/issue-model.ts` 的 `UPDATE_REASON_CODES`，以及 `test/fixtures/existing-install-update/`。

## Matrix（矩阵）

| Ownership | Definition | Examples | `update` | `update --repair` | `uninstall` | Rationale |
|---|---|---|---|---|---|---|
| `installer-owned` | SpecLite installer 生成和管理的 runtime 文件。 | `_speclite/config.toml`、`_speclite/_config/*`、`_speclite/hooks/*`、`_speclite/scripts/*`、IDE skill mirrors | 可生成 `create`、`update`、`skip` 或 `conflict` action（`reason` 为 `unchanged` 或 `installer-owned-drift`） | 可恢复有安全证明的 drift | 可自动 `remove` | 属于 installer 管理范围，但仍受 hash、source evidence、conflict 和授权约束。 |
| `human-owned` | 团队或个人维护的 customization。 | `_speclite/custom/*.toml`、`_speclite/custom/*.user.toml`、fresh install 生成的 `.gitignore` | `skip`（`reason: human-owned`） | `skip`，不自动修复，不产生 conflict | `preserve` | 团队人工维护，installer 可读取但不可重写。 |
| `workflow-owned` | Workflow 执行后产生的 planning、implementation、review 或 release artifacts。 | `_speclite-output/*` 或 configured artifact root 下的产物 | `skip`（`reason: workflow-owned`） | `skip`，不自动重建 | `manual-action` | 过程产物记录真实研发历史，删除或修改需要人工判断。 |
| `unknown` | 无法证明 owner 的路径。 | files-index 中 classifier 无法判定的条目 | `conflict`（`reason: unknown-ownership`） | `conflict` | `manual-action` | 无法证明 owner 时保守处理，并阻断自动写入。 |

## Terms（术语）

- protected path：当前操作无权自动修改的路径，包括 `human-owned`、`workflow-owned` 和 `unknown`。
- artifact root：workflow-owned 内容的配置根目录；默认 `_speclite-output`，也可由 runtime config 指定，effective roots 以 `speclite resolve artifact-roots` 为准。
- `conflicts` 只保留真正无法安全处理的 blocker：`unknown-ownership`、path escape、`missing-source-evidence` 和 `unsupported-repair`；protected ownership 本身不产生 conflict。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 所有权模型解释 | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| 所有权术语 | [`glossary/file-ownership.md`](glossary/file-ownership.md) |
| Runtime layout | [`runtime-layout.md`](runtime-layout.md) |
| 更新与修复操作 | [`../how-to/update-and-repair.md`](../how-to/update-and-repair.md) |
| issue id 与 reason code 参考 | [`validation-issues.md`](validation-issues.md) |
