# Flow Gate Enforcement Hook（Flow Gate 强制执行 Hook）

该 source root 是独立 canonical hook package，不属于 `speclite-dev-story` skill package。

Installed projection 必须把 `runner.mjs` 和 `hook-manifest.json` 写入 `_speclite/hooks/flow-gate-enforcement/`，并按 selected execution planes 生成 project-level hook config。

Runner 只读取 hook event JSON、installed `_speclite/config.toml` 和 `{implementation_artifacts}/flow-gates/<story-key>-story-kickoff-gate.md` 的 YAML frontmatter metadata。Runner 不生成 Flow Gate report、不修改 Story、不推进 `sprint-status.yaml`。

允许进入 `speclite-dev-story` 的 report metadata 必须同时满足：

- `mode: "story-kickoff"`
- `target` 与 `storyKey` 均匹配当前 Story
- `result` 为 `PASS` 或 `PASS_EQUIVALENT`
- `generatedAt` 未超过 freshness policy
- `schemaVersion` 为 `speclite.flow-gate-report.v2`
- `handoffContractVersion` 为 `speclite.story-kickoff-handoff.v1`
- `foundationPrerequisiteStatus` 为 `PASS` 或 `NOT_APPLICABLE`
- `closureOwnerCheckStatus` 为 `PASS` 或 `NOT_APPLICABLE`

`foundationPrerequisiteStatus` 与 `closureOwnerCheckStatus` 的语义判定由 `speclite-flow-gate` 基于项目自己的 foundation handoff source index 或显式 Story / Epic 引用生成；本 hook 只负责 fail-closed 消费这些机器字段。Legacy v1 report 必须重新运行 `speclite-flow-gate` 生成 v2 report 后才能进入 `speclite-dev-story`。
