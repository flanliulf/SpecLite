# Story 11.4: Route Analysis Workflows Into Dedicated Artifact Subdirectories（将 Analysis Workflows 路由至专属 Artifact 子目录）

Status: done

## Story（故事）

作为使用 SpecLite 的 AI IDE 用户和项目维护者，  
我希望 `1-analysis` workflow artifacts 输出到 `{analysis_artifacts}` 下的专属子目录，  
以便分析产物与 Planning、Project Knowledge、Public Documentation 明确分离。

## Acceptance Criteria（验收标准）

1. Fresh install 预创建 `{analysis_artifacts}/research/`、`{analysis_artifacts}/product-brief/`、`{analysis_artifacts}/prfaq/`。
2. `speclite-domain-research`、`speclite-market-research`、`speclite-technical-research` 统一写 `{analysis_artifacts}/research/`，保留原 basename 规则。
3. `speclite-product-brief` 写入 `{analysis_artifacts}/product-brief/`。
4. `speclite-prfaq` 写入 `{analysis_artifacts}/prfaq/`。
5. 同步所有受影响 ZH/EN Skill、steps/references、help、metadata、artifact contracts、config examples 与治理文档，不遗留冲突 active defaults。
6. Analysis producers 可读取 `{project_knowledge}`，但不得把 research 输出到它；`docs/` 仍是 Public Documentation。
7. Existing install 无 `analysis_artifacts` 时消费 11.1 resolver 与 11.3 compatibility，保持旧 artifacts 原位。
8. Negative corpus scan 必须排除 active `{planning_artifacts}/research/`、Planning-root product brief/PRFAQ 与 `{project_knowledge}` research producer defaults。
9. Focused tests 覆盖 fresh directories、新默认路径、legacy fallback、artifact metadata/default path 与三类空间边界。
10. Scope 仅 `1-analysis`；不处理 Planning、UX、Readiness、CR routing。

## Tasks / Subtasks（任务 / 子任务）

- [x] 核验 11.1–11.3 completion Gates，并通过 11.4 `story-kickoff`。
- [x] 先建立 producer/path/metadata/legacy/corpus-scan 失败测试矩阵。
- [x] 扩展 module/runtime directory plan，加入三个 Analysis 子目录。
- [x] 更新三类 Research、Product Brief、PRFAQ ZH/EN producer 与 resume/finalization paths，保持现有 basename/stage 行为。
- [x] 更新 help/metadata/artifact contracts/docs/fixtures 与 consumers；证明 Project Knowledge/Public Docs/Analysis 三 planes 分离。
- [x] 运行 focused suites、canonical parity/negative scan、build、`git diff --check`，review 前执行 completion Gate。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- 三个 research workflow-details 当前仍声明 `{planning_artifacts}/research/`。
- Product Brief 的 prompts/finalize/manifest 当前写 Planning root；PRFAQ workflow/stages/manifest 同样未使用专属 Analysis root。
- `module.yaml` / runtime structure 尚未创建三个 Analysis subject directories；manifest interpolation 需支持 `{analysis_artifacts}`。
- `module.yaml` 当前只有旧 Planning/Implementation/DevOps/Project Knowledge fields/directories；新增 Analysis roots 时必须保留 agents、既有 directories 与 deterministic order。
- 现有 output filename、resume/progress、distillate 行为必须保留；只改变 root/subject directory。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- 使用 Story 11.1 shared resolver；不硬编码另一份 fallback/default；不升级依赖、不需 web research。
- 更新 ZH/EN 定义与 package-internal references 时保持语义 parity；不得只改入口文件。
- Legacy fallback 是 read/resolve compatibility，禁止迁移、复制或重写既有 artifacts。
- 测试覆盖 3 directories + 5 producer families、metadata defaultOutputPath、legacy fallback、no-migration、relative POSIX、negative scan。

## Previous Story Intelligence（前序 Story 情报）

- 11.1–11.3 当前均仅为 planned `ready-for-dev`；11.4 kickoff 必须等待它们实际 `done`，并消费 resolver/projection/compatibility 的 current evidence。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.3 `done` + completion Gate；不得依赖 11.5+。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-kickoff-gate.md`。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| `FR23b` / `SPEC 09` Analysis roots | exact producer/path matrix | `FAIL_CONTRACT` |
| Project Knowledge/Public Docs separation | read-vs-write boundary tests | `FAIL_FUNCTION` |
| ZH/EN + metadata parity | corpus reconciliation | `FAIL_EVIDENCE` |
| legacy/no-migration | before/after artifact hashes | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Internal helper、test file 或 metadata projection 的拆分可调整；三个 subject directories、五类 producer 路由、原 basename、三 planes 边界、legacy no-migration 与 corpus negative assertions 不可改变。

## Files To Modify（预计文件范围）

- `assets/source/speclite/sdlc-skills/module.yaml`、`src/installer/runtime-structure.ts`、`src/manifest/manifest-generator.ts`。
- 三个 Research package 的 `references/workflow-details.md`：current `{planning_artifacts}/research/` → `{analysis_artifacts}/research/`；保留各 basename、resume 与 ZH/EN semantics。
- Product Brief 的 `references/workflow-details.md`、`references/prompts/contextual-discovery.md`、`references/prompts/draft-and-review.md`、`references/prompts/finalize.md`、`data/speclite-manifest.json`、ZH/EN/config examples：改到 `{analysis_artifacts}/product-brief/`；保留 contextual discovery、main/distillate naming 与 final handoff。
- PRFAQ 的 `references/workflow-details.md`、`references/customer-faq.md`、`references/internal-faq.md`、`references/press-release.md`、`references/verdict.md`、`data/speclite-manifest.json`、ZH/EN/config examples：改到 `{analysis_artifacts}/prfaq/`；保留 customer/internal FAQ、stage/resume/distillate/verdict content behavior。
- `assets/source/speclite/sdlc-skills/module-help.csv`、`docs/reference/skills/sdlc-workflows.md`、`docs/reference/workflow-artifact-layout.md`。

### New Files（新增文件，Guidance）

- `test/analysis-artifact-routing.test.ts` 或等价 suite：覆盖 exact subdirs、五 producer families、basename/resume/stage/distillate preservation、ZH/EN parity、legacy no-migration 与 active scan 100% classification。

## Evidence Plan（证据计划）

- Producer matrix 逐条记录 old literal、新 resolved path、basename 与 resume/finalization behavior。
- Fresh directories + metadata + legacy fallback + three-plane fixtures。
- ZH/EN/package-manifest/help/docs reconciliation 与 active old-default negative scan。

## References（参考资料）

- [Source: Epic 11 Story 11.4]
- [Source: PRD FR23b]
- [Source: `SPEC 09` Analysis routing]
- [Source: `assets/source/speclite/sdlc-skills/1-analysis/`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
GPT-5.5 (gpt-5.5)

### Completion Notes List（完成说明）
- 11.4 `story-kickoff` Gate 已在实现前通过；11.1–11.3 Story/tracker `done` 与 completion Gates 均为 exact `PASS`。
- Development recovery 已独立审计首个 Agent 遗留的 untrusted candidate；结论为 adopted-with-current-verification，无需重写源码，仅刷新 Story / completion gate 的 recovery 证据口径。
- 五个 Analysis producer family 已路由到专属 subject directories：三类 Research -> `{analysis_artifacts}/research/`，Product Brief -> `{analysis_artifacts}/product-brief/`，PRFAQ -> `{analysis_artifacts}/prfaq/`。
- 保留 basename、resume/progress、stage、distillate、verdict 行为；本 Story 只调整 root/subject directory 与对应 metadata/help/docs/fixtures。
- `module.yaml` 与 fresh subject directories 已由 Story 11.2 存在；本 Story 通过 focused tests 核验并消费该 projection，没有重复发明 resolver 或 runtime 语义。
- Existing install 缺少 `analysis_artifacts` 时保留 legacy fallback/no-migration；旧 artifacts 原位不迁移、不复制、不重写。
- Negative corpus scan 已分类：active 11.4 corpus 为 `missingRequired=[]`、`activeViolations=[]`；全仓旧命中属于 frozen config audit snapshot、legacy planning artifact history、flow-gate/story/test/CR 记录或 `TODO-012` backlog 描述，不是 active producer default。
- Canonical governance warn/strict 均为 `status=ok` 且 `decisionRecordRequired=false`；五个受影响 package 与 runner 推荐 support skill density、ZH/EN parity、docs、build、packaging、full test 与 `git diff --check` 均通过。
- `TODO-012` 仅处理 Story 11.4 明确覆盖的 Analysis rows；未宣称全部关闭，未执行 Reviewer/CR04-06/commit/push。
- Round2 Fixer 于 2026-09-04 仅执行 Owner-confirmed A+B 两项 P1：新增 `speclite resolve artifact-roots` machine-readable public surface，保持 `speclite resolve config` raw merged-config 与现有 `--key` 语义；五个 Analysis producer activation guidance 改为消费该 surface，不手写 fallback。
- Product Brief / PRFAQ legacy root-level discovery 仅在 `analysis_artifacts.resolutionMode=legacy-compatible` 时启用；new subject main artifact 优先，只有 legacy root-level main artifact 存在时才原地 resume/write，均不存在时创建 new subject；distillate、PRFAQ stage/resume/verdict 跟随所选 main artifact 目录，不 migration/copy/delete/rename/rewrite existing artifacts。
- Round2 Fixer 验证：focused+contract `npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/contract-anchors.test.ts test/cli-message-catalog.test.ts --reporter=dot` -> 5 files / 34 tests passed；CLI e2e 证明 `resolve config --key modules.sdlc.analysis_artifacts` 仍输出 `{}`，`resolve artifact-roots` 输出 `speclite.resolve.artifact-roots.v1`；build/docs/packaging/density/diff 均通过。
- Round2 Fixer full `npm test` 已执行，当前唯一剩余失败类为外部 untracked `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 让 canonical core package count 从 18 变成 19，导致固定基线计数断言失败；该 drift 不属于 11.4 A+B，未修改、未删除、未补 module-help 或 manifest。Canonical warn/strict 同样仅报告该 external `module-help.missing-row`。
- CR06 Finalizer 于 2026-09-04 完成：最新有效 Reviewer Round 7 为 `REVIEWER_PASS`，Evaluator Round 7 为 `EVALUATION_PASS`；Round 3 invalid provenance 未采信；completion Gate 为 `PASS` 且 `target/storyKey=11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories`；CR04 已沉淀 `CR-API-40`、`CR-SEC-19`、`CR-DOC-05`；CR05 已登记 `TODO-015`（P2/open）；无 P0/P1 残留。Story 与 sprint tracker 已同步为 `done`，未启动 11.5，未改外部 drawer、`.agents/.claude` mirror、CR rules、TODO、PLAN、EXPERIMENTS、源码、测试、manifest 或 flow-gate owner evidence。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-kickoff-gate.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md`
- `test/analysis-artifact-routing.test.ts`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/manifest-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/data/speclite-manifest.json`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/contextual-discovery.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/draft-and-review.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/finalize.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/data/speclite-manifest.json`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/press-release.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/customer-faq.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/internal-faq.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/verdict.md`
- `docs/reference/skills/sdlc-workflows.md`
- `docs/reference/workflow-artifact-layout.md`
- `release/packaging-manifest.json`
- `src/commands/resolve.ts`
- `src/config/resolve-output-schema.ts`
- `src/diagnostics/output.ts`
- `src/manifest/analysis-artifact-routing.ts`
- `test/resolve-readers.test.ts`
- `test/fixtures/resolve-parity/expected/human/config-invalid-input.txt`
- `docs/reference/cli.md`
- `docs/reference/config-and-customization.md`
- `docs/reference/command-result-json.md`
- `docs/reference/cli-human-output-matrix.md`
- `docs/reference/specs/command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/PLAN.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260903-round-2.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-cr-finalizer-20260904-main-round-7.md`

## Anchor Evidence Summary（锚点证据摘要）
- Kickoff Gate: `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-kickoff-gate.md` -> `result=PASS`。
- Completion Gate: `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md` -> `result=PASS`。
- Focused Story 11.4 suite: `npx vitest run test/analysis-artifact-routing.test.ts --reporter=dot` -> 1 file / 4 tests passed。
- Focused suite: `npx vitest run test/analysis-artifact-routing.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/manifest-discovery.test.ts test/source-and-modules.test.ts test/skill-artifact-loop.test.ts --reporter=dot` -> 6 files / 55 tests passed。
- Canonical focused suite: `npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts` -> 6 files / 61 tests passed。
- Full suite: `npm test` -> 63 files passed, 495 passed / 4 todo。
- Canonical governance: warn + strict -> `status=ok`, `findings=[]`, `decisionRecordRequired=false`。
- Negative/parity scan: active 11.4 corpus `missingRequired=[]`, `activeViolations=[]`; broad scan 575 historical/frozen hits classified outside active producer defaults。
- Docs/build/packaging/git: `npm run docs:check` passed; `npm run build` passed; `npm run release:packaging-check` passed; `git diff --check` passed。
- Round2 focused+contract: `npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/contract-anchors.test.ts test/cli-message-catalog.test.ts --reporter=dot` -> 5 files / 34 tests passed。
- Round2 docs/build/packaging/git: `npm run build` passed；`npm run docs:check` passed；`npm run release:packaging-check` passed；`git diff --check` passed。
- Round2 canonical: warn mode `status=warning` and strict mode `status=error` both report only external `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` / `module-help.missing-row`; not counted as Story 11.4 failure.
- Round2 full suite: `npm test` -> 58 files passed, 5 files failed, 486 passed / 12 failed / 4 todo; all remaining failures are fixed expected-count drift (`core=18,total=68` expected vs current `core=19,total=69`) caused by the external untracked core package, not by 11.4 A+B files.

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 Analysis routing、plane boundary、legacy 与 corpus evidence 上下文。 | Fancyliu / Codex |
| 2026-09-03 | 1.0 | 实现 Story 11.4 Analysis artifact routing，更新 producer defaults、metadata/help/docs/fixtures，并生成 kickoff/completion Gates。 | GPT-5.5 (gpt-5.5) |
| 2026-09-03 | 1.1 | Development recovery 独立审计并采用 candidate，刷新 current completion evidence、negative scan 分类和验证记录。 | GPT-5.5 (gpt-5.5) |
| 2026-09-04 | 1.2 | Round2 Fixer 执行 Owner A+B：新增 `resolve artifact-roots` public surface，保持 raw `resolve config`，补 PB/PRFAQ legacy-compatible route selection 与 contract tests；Story 保持 `review` 等待复审复评。 | GPT-5.5 (gpt-5.5) |
| 2026-09-04 | 1.3 | CR06 Finalizer 核验 Round 7 Reviewer/Evaluator PASS、completion Gate PASS、CR04/CR05 完成与无 P0/P1 残留后，将 Story 与 sprint tracker 同步为 `done`。 | GPT-5 Codex (gpt-5) |

---
*本文档由 bmad-create-story Skill 自动生成*
