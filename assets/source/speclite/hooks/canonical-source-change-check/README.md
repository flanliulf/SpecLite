# Canonical Source Change Check Hook（Canonical Source 变更检查 Hook）

`canonical-source-change-check` 是 SpecLite canonical source 维护时的 warning-only hook。它在 Claude Code / Codex 修改 `assets/source/speclite/` 后提醒运行 `speclite-check-canonical-source-change`，但不阻断会话。

Installed projection 必须把 `runner.mjs` 和 `hook-manifest.json` 写入 `_speclite/hooks/canonical-source-change-check/`，并按 selected execution planes 合并生成 project-level hook config。

## Runtime Behavior（运行行为）

- 若当前 git diff、staged diff 和 untracked files 都未触及 `assets/source/speclite/`，静默退出 `0`。
- 若触及 canonical source，调用：
  `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope changed --format json`
- 输出 warning JSON，提醒 Agent 执行检查 Skill、刷新 fixtures/docs/packaging manifest 并运行验证命令。
- 永远退出 `0`，不返回 `decision: block`，不使用 exit code `2`。

## Events（事件）

- `PostToolUse`：在写文件工具之后提醒尽快检查。
- `Stop`：会话收尾时汇总提醒，降低漏刷派生产物的概率。
