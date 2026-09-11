# Process Mutation Record（过程写入记录）

## Incident（事件）

- 首次 Blind attempt 执行了 `npm run release:packaging-check`。
- `scripts/release/packaging-check.mjs` 包含 `writeFileSync`，因此该命令不是只读命令；首次 Blind 报告中的“未修改任何文件”自报不准确。
- 命令将 `release/packaging-manifest.json` 的 mtime 更新为 `2026-09-07T08:19:41.577Z`。
- 本记录不修改、不回滚 implementation 文件，仅纠正过程证据。

## Byte Equivalence（字节等价）

- pre-run snapshot：`release-packaging-manifest-pre-run.json`。
- snapshot 构造：从用户指定 `baseSha=ff7528d3f9ec34072bb669ee79f7569345c23d47` 的 `git show` 内容，在内存应用冻结 `review-input.diff` 中 `release/packaging-manifest.json` 的完整 hunks。
- pre-run raw SHA-256：`624d6b5af8d6b86da90ffa9237dce9528995695f7d5571cb5352dd2011a9f6ce`。
- current raw SHA-256：`624d6b5af8d6b86da90ffa9237dce9528995695f7d5571cb5352dd2011a9f6ce`。
- 逐字节比较：相同。
- JSON semantic diff：`changedKeys=[]`、`addedFiles=[]`、`removedFiles=[]`。

因此本次命令造成 mtime-only equal-content rewrite，没有造成 declared implementation bytes 或冻结审查内容漂移；不降低 current scope/layer quorum。`sourceMutationAt` 仍如实采用当前文件 mtime，并以 raw hash/declared content digests证明内容等价。

## Drawer Audit（Drawer 对账）

本命令没有引入任何 drawer 条目。以下条目在 pre-run snapshot 与 current manifest 中均已存在：

- `assets/source/speclite/core-skills/speclite-drawer-er-modeler.zip`
- `assets/source/speclite/core-skills/speclite-drawer-er-modeler/CHANGELOG.md`
- `assets/source/speclite/core-skills/speclite-drawer-er-modeler/references/er-drawing-rules.md`
- `assets/source/speclite/core-skills/speclite-drawer-er-modeler/SKILL.en.md`
- `assets/source/speclite/core-skills/speclite-drawer-er-modeler/SKILL.md`

这些路径仍属于用户明确排除的外部 drawer surface；Reviewer 没有把 drawer 功能、fixed counts 或 mirrors 纳入 finding 判定。

## Review Input Canonicalization Note（审查输入规范化说明）

重新生成的 41 文件 diff 与持久化 `review-input.diff` 的 implementation patch bytes一致；唯一差异是 `apply_patch` 为 evidence 文件自身增加了一个额外文件尾 LF（fresh in-memory diff `447593` bytes，durable evidence `447594` bytes，首个差异位于 EOF）。这不是 declared file content mutation。
