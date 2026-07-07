# Canonical Source Governance Decision Record

| Field | Value |
|---|---|
| Date | 2026-07-06 |
| Change Scope | 新增 `speclite-html-ppt-generator` support skill；将 `speclite-docs-intro-ppt-creator` 从外部 `guizang-ppt-skill` 切换为 SpecLite-owned HTML PPT generator；同步 support catalog、count 和 packaging manifest。 |
| Governance Classes | `canonical-source-truth` (`D0`), `current-public-docs` (`D1`) |
| D0 Findings | `speclite-check-canonical-source-change` warn / strict mode 均为 `status: ok` 且 `findings: []`。 |
| D1 Decisions | `assets/source/speclite/README.md` 和 `docs/reference/canonical-source-layout.md` 已更新为当前 support skill catalog 与 count。 |
| D2 Decisions | 本轮未修改 frozen historical record 或 living legacy reference。 |
| Verification | `check_skill_density.py` 已覆盖两个相关 support skills；HTML PPT 输出脚本和 Swiss validator 已用既有 deck 验证；`npm run build`、6 个 focused tests、`npm run release:packaging-check`、canonical checker strict mode 和 `git diff --check` 均通过。 |

## Decisions

| Surface | Decision | Reason | Evidence |
|---|---|---|---|
| `assets/source/speclite/support-skills/speclite-html-ppt-generator/` | updated | 外部 `guizang-ppt-skill` 是硬依赖；为保证 canonical source 可复现，需要把模板、layout、theme、validator 和授权说明收纳为 SpecLite-owned support skill。 | 新增 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`assets/`、`references/` 和 `scripts/validate-swiss-deck.mjs`。 |
| `assets/source/speclite/support-skills/speclite-docs-intro-ppt-creator/` | updated | 原 workflow 指向外部 skill 和个人绝对路径，不适合作为 canonical source contract。 | `SKILL.md` / `SKILL.en.md` 版本更新到 `1.1.0`，workflow 改为调用 `speclite-html-ppt-generator`。 |
| `assets/source/speclite/README.md` | updated | public support catalog 需要展示新增 docs presentation support skills，避免读者看到旧支持工具集合。 | Support Skills 小节新增 `speclite-docs-intro-ppt-creator` 与 `speclite-html-ppt-generator`。 |
| `docs/reference/canonical-source-layout.md` | updated | 当前 support skill package roots 从 7 增至 8，reference docs 必须反映当前 canonical source snapshot。 | Snapshot 表将 Support skill package roots 更新为 `8`。 |
| `release/packaging-manifest.json` / `dist/packaging-manifest.json` | updated | 新增 canonical files 必须进入 release package inventory，否则发布包缺少 HTML PPT generator 资产。 | `npm run release:packaging-check` 已刷新并通过，manifest 包含 `speclite-html-ppt-generator` 的 17 个文件。 |

---

*本文档由 speclite-canonical-source-governance-runner Skill 自动生成*
