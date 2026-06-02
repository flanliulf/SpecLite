# Existing Install Update（既有安装 Update）

本 fixture 是 Story 6.2 的 release gate fixture project case。

它只覆盖普通 `speclite update`：

- installer-owned planned update 在 `--yes` 且无 conflict 时写入并进入 `changedPaths`
- `_speclite/custom/*.toml` human-owned files 保持 byte-for-byte unchanged，并在 `updatePlan.actions` 中以 `skip` + `reason: "human-owned"` 表达
- `_speclite-output/` workflow-owned artifacts 与 metadata sidecars 保持 byte-for-byte unchanged，并在 `updatePlan.actions` 中以 `skip` + `reason: "workflow-owned"` 表达
- installer-owned drift 产生 `conflicts[]`，reason 为 `installer-owned-drift`，command-level issue 仅投影为 `update.conflicts`

Repair fixture ownership handoff:

- 本 fixture 不调用 `speclite update --repair`
- 本 fixture 不包含 `RepairPlan` expected output
- 本 fixture 不把 `restore-canonical`、`regenerate` 或 repair actions 混入 normal `UpdatePlan.actions`
- 显式 repair fixture 由 Story 6.3 / 6.4 承接；后续必须先更新 owning SPEC，再更新 executable schema/parser/comparator，最后更新 repair expected outputs
