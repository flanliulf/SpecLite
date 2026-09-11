---
Story: 11-4
Round: 1
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。当前执行上下文未提供独立 Agent 调度工具，本轮按 `bmenhance-cr-01-reviewer` 降级规则在单一上下文中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个审查视角；未发现需要修复的 `patch` 项，也未发现需要 Owner 裁决的 `decision_needed` 项。

结论：通过。Story 11.4 的 bounded scope 已覆盖三类 Research、Product Brief、PRFAQ 的 `{analysis_artifacts}` subject routing、fresh directory projection、artifact contract interpolation、existing-install legacy fallback/no-migration、Project Knowledge/Public Docs 分离、active negative corpus 与验证门禁。仅记录 1 个非阻塞证据可复现性 caveat：completion gate 中 broad scan `575` 精确计数未随命令落盘，本轮只能复现 active scan clean 与 broad legacy-pattern 命中存在，不能独立复现精确 `575` 数值；该 caveat 不改变本轮通过建议。

## 新发现

本轮未发现新的阻塞项、中高优先级问题、`patch` 项或 Owner issue。

### 1. [低] Broad legacy-pattern `575` 精确计数缺少可复现命令

- **来源**：auditor
- **分类**：future/TODO（非阻塞证据可复现性改进；不是 Story 11.4 实现缺陷）

- **证据**
  - `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md:62-63` 声称 active 11.4 corpus 为 `missingRequired=[]` / `activeViolations=[]`，并将 broad repo scan 的 `575` legacy-pattern hits 分类为 frozen config audit snapshots、legacy history、flow-gate evidence、test evidence、Story history、CR record 与 `TODO-012`。
  - 本轮对 active 11.4 surface 复跑旧默认负向扫描，范围包含五个 producer packages、`module-help.csv`、`docs/reference/skills/sdlc-workflows.md`、`docs/reference/workflow-artifact-layout.md`，结果为空输出且 `rg` exit code 为 1，说明 active surface 没有旧 producer default。
  - 本轮用旧路由显式正则复跑 broad repo scan，排除 `node_modules/dist/coverage` 时得到 125 条；使用更宽 `planning_artifacts.*research/product-brief/prfaq` 与 `project_knowledge.*research` 口径得到 154 条。当前 completion gate 没有记录原始命令或正则，因此不能独立复现精确 `575` 数值。

- **影响**
  - 不影响 AC 8 的 active negative corpus 判断，也不影响五个 producer family 的实际 routing；但会降低后续 Reviewer/Evaluator 对 broad historical classification 数值的可审计性。

- **建议**
  - 后续若要关闭该 caveat，可在 CR05/TODO 或 future evidence hygiene 中补一条“broad scan command + regex + include/exclude glob + per-bucket count”的可复现记录；无需修改 Story 11.4 实现代码。

## 验证摘要

- `npm test -- test/analysis-artifact-routing.test.ts --reporter=dot` PASS：1 file / 4 tests passed。
- `npx vitest run test/analysis-artifact-routing.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/manifest-discovery.test.ts test/source-and-modules.test.ts test/skill-artifact-loop.test.ts --reporter=dot` PASS：6 files / 55 tests passed。
- `npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts` PASS：6 files / 61 tests passed。
- `npm test` PASS：63 files passed；495 passed / 4 todo。
- `npm run docs:check` PASS：72 Markdown files、5 drafts、links and governance rules valid。
- `npm run build` PASS：tsup ESM/DTS build success。
- `npm run release:packaging-check` PASS：`release/packaging-manifest.json` and `dist/packaging-manifest.json` accepted。
- `git diff --check` PASS：无 whitespace error。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` PASS：`status=ok`、`findings=[]`、`decisionRecordRequired=false`。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict` PASS：`status=ok`、`findings=[]`、`decisionRecordRequired=false`。
- `python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py` PASS：五个 affected Analysis packages 及 runner 推荐的两个 support skills 均 `triggered_density_warning=false`。

## 通过项

- 三类 Research workflow details 均从 `{planning_artifacts}/research/...` 改为 `{analysis_artifacts}/research/...`，并保留 `domain|market|technical-{{research_topic_slug}}-research-{{date}}.md` basename 规则。
- Product Brief 的 entry guidance、workflow details、contextual discovery、draft/review、finalize、manifest、config example 均指向 `{analysis_artifacts}/product-brief`；main brief 与 distillate basename 保持不变。
- PRFAQ 的 entry guidance、workflow details、resume detection、headless creation、stage references、verdict、manifest、config example 均指向 `{analysis_artifacts}/prfaq`；stage/resume/distillate/verdict 行为只改变 root/subject directory。
- Runtime/install path 真实消费 `artifactRoots`：fresh directories 由 `module.yaml` 声明并经 `runtime-structure.ts` interpolation 创建；artifact contracts 由 `target-writer.ts` 调用 `createArtifactContract`，并由 `manifest-generator.ts` 解析 `{analysis_artifacts}`。
- Existing install 缺少 `analysis_artifacts` 时走 Story 11.1/11.3 legacy-compatible fallback 到 existing `planning_artifacts`，测试确认旧文件 hash 不变且不创建 fresh analysis root。
- Project Knowledge 只作为 contextual scanning/read plane；`docs/` 仍作为 Public Documentation，不被改成 Analysis artifact target。
- Scope 未越界到 Story 11.5+ 的 Planning whole/sharded governance、Story 11.6 UX routing、Story 11.7+ readiness/CR routing 或 migration 行为。
