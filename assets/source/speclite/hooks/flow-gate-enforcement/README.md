# Flow Gate Enforcement Hook（Flow Gate 强制执行 Hook）

该 source root 是独立 canonical hook package，不属于 `speclite-dev-story` skill package。

Installed projection 必须把 `runner.mjs` 和 `hook-manifest.json` 写入 `_speclite/hooks/flow-gate-enforcement/`，并按 selected execution planes 生成 project-level hook config。

Runner 只读取 hook event JSON、installed `_speclite/config.toml` 和 `{implementation_artifacts}/flow-gates/<story-key>-story-kickoff-gate.md` 的 YAML frontmatter metadata。Runner 不生成 Flow Gate report、不修改 Story、不推进 `sprint-status.yaml`。
