---
Story: 10-6
Round: 1
Date: 2026-07-07
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 并行子代理工具在当前会话不可用，本轮按 `bmenhance-cr-01-reviewer` 降级路径由主审查上下文串行覆盖 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个视角。定向 tests、canonical source check、build、packaging check 均通过，但发现 2 个 AC6 / AC7 相关的中优先级问题：public skill catalog 仍存在 SDLC / ecosystem 归属矛盾，canonical governance map 对 ecosystem-only canonical changes 分类不足。

结论：不通过。建议先修复以下 findings，再进入 CR evaluator / fixer 后续流程。

## 新发现

### 1. [中] SDLC skill catalog 仍把已迁移 backend ecosystem skills 列为 SDLC workflow

- **来源**：auditor+edge（主审查串行降级）
- **分类**：patch

- **证据**
  - `docs/reference/skills/sdlc-workflows.md:41-43` 仍列出 `speclite-brownfield-java-springboot-backend-tech-stack-digger`、`speclite-brownfield-nodejs-backend-tech-stack-digger`、`speclite-brownfield-python-backend-tech-stack-digger` 为 Analysis 阶段 SDLC workflows。
  - `docs/reference/skills/ecosystem-skills.md:34-36` 同时把同三个 skill 列为 `ecosystem-backend-java-springboot`、`ecosystem-backend-nodejs`、`ecosystem-backend-python`。
  - `find assets/source/speclite/sdlc-skills/1-analysis -maxdepth 2 -type d -name 'speclite-brownfield-*-backend-tech-stack-digger' -print` 无输出；实际 package roots 已位于 `assets/source/speclite/ecosystems/backend/*/`。

- **影响**
  - 违反 AC6 的 “core / sdlc / support / ecosystem skill catalogs 的职责清楚” 要求。
  - 新用户或维护者会从 catalog 误判这些 backend-specific skills 仍属于 default-selected SDLC surface，从而削弱 AC1 / AC5 的 optional ecosystem boundary。
  - 当前新增 `test/docs-reference-cli-options.test.ts` 只检查 ecosystem catalog 入口和关键词，未断言 SDLC catalog 不再列出已迁移 ecosystem skills，因此该 drift 未被测试挡住。

- **建议**
  - 从 `docs/reference/skills/sdlc-workflows.md` 移除这三条 backend-specific rows，或改成明确的 “moved to ecosystem-skills.md” cross-reference，不再把它们列为 SDLC workflow catalog 正文。
  - 补充 focused docs test，断言 `docs/reference/skills/sdlc-workflows.md` 不包含这三条已迁移 backend ecosystem package ids，或只允许出现在明确迁移说明中。

### 2. [中] canonical governance map 未把 `ecosystems/**` 纳入 ecosystem-only 变更分类

- **来源**：auditor+edge（主审查串行降级）
- **分类**：patch

- **证据**
  - `assets/source/speclite/canonical-governance.json:9-16` 的 `canonical-source-truth.pathGlobs` 包含 `core-skills/**`、`sdlc-skills/**`、`support-skills/**`、`hooks/**`、`scripts/**`、`custom/**`，但不包含 `assets/source/speclite/ecosystems/**`。
  - `assets/source/speclite/canonical-governance.json:29-34` 的 `module-discovery-contract.pathGlobs` 只覆盖 core / sdlc 的 `module.yaml` 与 `module-help.csv`，不覆盖 `ecosystems/<category>/<id>/module.yaml` 或 `module-help.csv`。
  - `assets/source/speclite/canonical-governance.json:118-181` 的 impact rules 只有 core/sdlc、support skill、hook、governance map 变更规则，没有 ecosystem module change rule。
  - `docs/reference/canonical-source-governance.md:31-32` 的 Classification 表也没有把 `ecosystems/` 列入 `canonical-source-truth` 或 `module-discovery-contract` source，虽然同页 `docs/reference/canonical-source-governance.md:47` 已新增 ecosystem module change 行。

- **影响**
  - 本次 mixed worktree 下 canonical checker 仍返回 `status: "ok"`，因为存在 sdlc/support/docs 等其它变更触发分类；但后续如果只有 `assets/source/speclite/ecosystems/**` 变化，governance summary 可能不会把它分类为 D0 canonical-source-truth / module-discovery-contract，也不会触发 ecosystem-specific followups。
  - 这削弱 AC4 / AC7 的 maintainer workflow 闭环：ecosystem authoring 需要 creator/lint -> module metadata/help -> canonical source check -> fixtures -> build/tests/packaging check，而机器可读 governance map 没有把 ecosystem-only changes 接到这条规则上。

- **建议**
  - 更新 `assets/source/speclite/canonical-governance.json`：把 `assets/source/speclite/ecosystems/**` 纳入 `canonical-source-truth`；把 `assets/source/speclite/ecosystems/*/*/module.yaml` 和 `module-help.csv` 纳入 `module-discovery-contract`；增加 `ecosystem-module-change` impact rule，要求 review ecosystem catalog、fixtures、packaging manifest 和 selected-only docs。
  - 同步更新 `docs/reference/canonical-source-governance.md` 的 Classification 表，使文档与 machine-readable map 一致。
  - 补充 checker/governance fixture test，覆盖 ecosystem-only changed path 会触发 D0 / D1 followups。

## 验证摘要

- ✅ `rg -n "core=13|sdlc=51|total=64|only core\\+sdlc|only core\\+SDLC" README.md docs assets/source/speclite test`
  - 只命中 test fixture / test assertions 中当前 `core=13, sdlc=48, total=61` 相关断言；未命中 public docs 或 source README 的旧 `sdlc=51`、`total=64`、`only core+sdlc` 表达。
- ✅ `npm test -- test/docs-reference-cli-options.test.ts test/canonical-source-change-check-script.test.ts`
  - 2 个 test files / 3 个 tests 通过。
- ✅ `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`
  - `status: "ok"`，`findings: []`；counts 为 `core=13`、`sdlc=48`、`ecosystems.totalPackageRoots=8`、`defaultInstall.total=61`。
- ✅ `npm run build`
  - tsup build 通过。
- ✅ `npm run release:packaging-check`
  - `Packaging acceptance passed: release/packaging-manifest.json and dist/packaging-manifest.json`。
- 未运行 `npm run lint`
  - `package.json` 当前没有 `lint` script。
- ✅ `git diff --check -- README.md docs assets/source/speclite test release _bmad-output/implementation-artifacts/stories/10-6-public-docs-and-maintainer-workflow.md _bmad-output/implementation-artifacts/code-reviews/10-6-code-review/10-6-code-review-summary-20260707-round-1.md`
  - 通过，无 whitespace error 输出。

## 通过项

- README、quick start、tutorial quick start、install how-to 均说明 default no-prompt install 仍为 `core` + `sdlc`，interactive 可选 optional ecosystem modules，`--yes` / `--json` / default no-prompt 不自动选择 ecosystem modules。
- user-facing docs 明确 ecosystem modules 是 SpecLite optional Skill package selection，不是项目依赖安装器、package manager 或 UI framework installer，也不安装 React / Vue / Java / npm package runtime dependencies。
- runtime layout、module explanation、runtime boundary glossary 已说明 selected module truth、selected-only projection、unselected ecosystem modules 不进入 IDE mirrors / indexes / installed tree。
- canonical source layout、source README、support skill docs 已覆盖 `ecosystems/<category>/<id>/`、frontend/backend/other 边界、module metadata、module-help、creator/lint、support-skills maintainer-only 语义。
- maintainer docs 已说明 hook 是 warning-only guardrail，不替代 release verification；release workflow 保持 build-first、packaging-last。
- 新增 canonical checker 覆盖 ecosystem counts、ecosystem module-help rows、banned `other` ids、stale count wording、only-core+sdlc wording、other catch-all wording 和 packaging manifest inclusion。

## 结论

- **结论：不通过**
- **阻塞项**：无高优先级阻塞；存在 2 个中优先级 AC6 / AC7 问题，建议在 Story 10.6 CR fixer 阶段修复。
- **后续建议**：先修复 skill catalog drift 与 governance map ecosystem classification，再重跑 focused docs tests、canonical source check、build、packaging check 和 `git diff --check`。

## 操作边界

- 本轮未修复代码或文档。
- 本轮未修改 Story 状态或 sprint status。
- 本轮未 commit。
- 本轮未 push。
- 本轮未触碰 PPT / html-ppt 相关外部 drift。
