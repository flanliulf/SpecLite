# Canonical Source Change Checklist（Canonical Source 变更检查清单）

## Scope（适用范围）

当 `assets/source/speclite/` 下已有 Skill、Hook、Agent 定义发生修改，或新增 Skill、Hook、Agent、script、custom 示例时，必须执行本清单。

## Required Checks（必查项）

- 统计 `core-skills`、`sdlc-skills`、`support-skills` 和 `hooks` 的当前 package roots。
- 确认默认安装 baseline 只计算 `core+sdlc`，不把 `support-skills` 纳入普通目标项目 skill mirrors。
- 检查 `core-skills/module-help.csv` 与 `sdlc-skills/module-help.csv`：
  - 每个 canonical package root 都有一条非 `_meta` row。
  - 没有重复 `skill` row。
  - 没有指向不存在 package root 的 row。
- 如果修改 `speclite-agent-*` 或含 `[agent]` 的定义包，运行 `speclite-agent-lint`，不要只跑通用 Skill lint。
- 检查每个 `assets/source/speclite/hooks/<hook-id>/`：
  - `README.md`
  - `hook-manifest.json`
  - `runner.mjs`
  - `claude-settings.fragment.json`
  - `codex-hooks.fragment.json`
  - `hook-manifest.json` 的 `hookId` 与目录名一致。
- 检查 `src/validation/rules/manifest-schema.ts` 中 `CORE_SDLC_BASELINE_ENTRY_COUNT` 是否等于当前 `core+sdlc`。
- 扫描 `docs README.md assets/source/speclite test src release`，确认没有旧数字，例如 `sdlc=44,total=57`、`Support skill package roots | 4`，也没有旧 Codex hook array shape。
- 刷新 fresh-install 和 path-portability fixtures，确认 `.claude/settings.json` 与 `.codex/hooks.json` 的 hook config 当前 contract 一致。
- 更新 `release/packaging-manifest.json` 和生成的 `dist/packaging-manifest.json`。

## Commands（建议命令）

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/support-skills/speclite-check-canonical-source-change
npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts
npm run build
npm test
npm run release:packaging-check
git diff --check
```
