---
Story: 10-4
Round: 1
Date: 2026-07-06
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具在当前环境未暴露，已按 skill 降级为串行三层审查；Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层均在当前上下文完成。已运行 focused tests、canonical source check 和 diff whitespace check，均通过。发现 1 个中优先级 patch 项：`other/misc`、`other/general`、`other/tools` 等 banned id 目前主要停留在文档/规则文本，缺少可执行 gate 的负例保护。不建议直接通过，建议修复后进入下一轮 CR。

## 新发现

### 1. [中] banned other ecosystem ids are documented but not enforced by executable gates

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `assets/source/speclite/README.md:72`、`docs/reference/canonical-source-layout.md:62`、`docs/reference/skills/ecosystem-skills.md:42`、`assets/source/speclite/support-skills/speclite-skill-creator/references/skill-creation-workflow.md:52` 和 `assets/source/speclite/support-skills/speclite-skill-lint/references/check-rules.md:270-272` 均说明 `other/misc`、`other/general`、`other/tools` 默认不允许。
  - `src/modules/module-metadata.ts:285-321` 的实际 ecosystem metadata validation 只校验 category enum、`ecosystem-<category>-<id>` code、`required_dependencies: [sdlc]`、`default_selected: false` 和 `required: false`，没有拒绝 `ecosystem_category: other` 且 `ecosystem_id` 为 `misc` / `general` / `tools` 的路径。
  - `assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs:630-636` 只扫描 “other is catch-all / miscellaneous tools” 这类文案漂移；`test/canonical-source-change-check-script.test.ts:293` 的 fixture 也只构造 catch-all 文本，没有构造实际 `ecosystems/other/misc/` module root。
  - `test/source-and-modules.test.ts:410-509` 覆盖 invalid category、missing id、wrong code、missing dependency、default selected 和 required ecosystem，但没有 banned `other` id 的负例。

- **影响**
  - Story 10.4 AC1 / AC6 的 “strict admission rules” 和 “禁止 catch-all ids” 容易退化为文档约定。后续维护者仍可能加入 `ecosystems/other/misc/`、`other/general/` 或 `other/tools/`，只要 module metadata 其他字段合法，就可能被 discovery、list、package 或 install selection 流程接受。

- **建议**
  - 增加可执行 banned-id gate。可选落点是 `src/modules/module-metadata.ts` 的 ecosystem metadata validation，或 canonical checker 的 `listEcosystemModules` / follow-up checks；至少要有一个 release/validation 路径会拒绝 `ecosystem_category: other` 且 `ecosystem_id` in `["misc", "general", "tools"]`。
  - 补充对应测试：在 `test/source-and-modules.test.ts` 增加 `ecosystem-other-misc` / `other/general` / `other/tools` metadata rejection；如选择 canonical checker gate，则在 `test/canonical-source-change-check-script.test.ts` 构造实际 `assets/source/speclite/ecosystems/other/misc/module.yaml` 并断言 finding id。

## 验证摘要

- ✅ `npm test -- test/source-and-modules.test.ts test/install-module-selection.test.ts test/canonical-source-change-check-script.test.ts` 通过（3 files / 34 tests）。
- ✅ `npm test -- test/runtime-structure.test.ts test/fixture-release-gates.test.ts` 通过（2 files / 16 tests）。
- ✅ `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` 通过，`status: "ok"`，`findings: []`，counts 为 `frontend=2`、`backend=3`、`other=3`、`defaultInstall.total=61`。
- ✅ `git diff --check -- assets/source/speclite docs src test release _bmad-output/implementation-artifacts/stories/10-4-other-ecosystem-source-expansion.md` 通过（无输出）。
- ⚠️ `npm run lint` 未运行：`package.json` 当前没有 `lint` script。
- ⚠️ `npm run build` 未运行：该 script 为 `tsup`，会写 `dist/`，本轮 reviewer 边界禁止修改实现/构建产物。
- ⚠️ `npm run release:packaging-check` 未运行：`scripts/release/packaging-check.mjs` 会写 `release/packaging-manifest.json` 和 `dist/packaging-manifest.json`，本轮 reviewer 边界禁止修改实现/构建产物。

## 通过项

- 三个 other module root 均存在 `module.yaml`、`module-help.csv` 和 seed Skill package；`module.yaml` 均声明 `module_kind: ecosystem`、`ecosystem_category: other`、对应 `ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false`。
- `npm-package`、`cli-tool`、`documentation-only` seed Skill 内容分别围绕 package surface / CLI contract / docs-only source readiness 取证，未发现大段复制既有 SDLC workflow。
- `speclite-npm-publisher`、`speclite-write-opensource-docs`、`speclite-agent-docs-steward` 仍保留在 `sdlc-skills`，并在 docs 中声明 other seed 只是 companion guidance。
- 默认 `--yes` / `--json --yes` 安装仍为 `core` + `sdlc`；focused tests 证明 selected `ecosystem-other-npm-package` 不安装 `cli-tool`、`documentation-only`、frontend 或 backend modules。
- `release/packaging-manifest.json` 已包含三个 other module root 及其 Skill 文件；canonical checker 当前返回 `other=3`、`defaultInstall.total=61`。
