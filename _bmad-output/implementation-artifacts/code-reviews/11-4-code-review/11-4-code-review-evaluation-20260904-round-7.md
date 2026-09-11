---
Story: 11-4
Round: 7
Date: 2026-09-04
Model Used: GPT-5 Codex (gpt-5)
Review Source: 11-4-code-review-summary-20260904-round-7.md
Review Model: GPT-5 Codex (gpt-5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-4 的第 7 轮 CR 代码审查结果（Round 6 Fixer 后复审）进行独立评估。本轮 Review Source 为 `11-4-code-review-summary-20260904-round-7.md`。Reviewer Round 7 的 Blind Hunter、Edge Case Hunter、Acceptance Auditor 与 aggregator 均为 PASS / no findings；本评估经当前源码、installed workflow 文档、focused tests、fresh CLI、docs、canonical checker、scoped negative scan 与 diff check 独立复核后确认：Story 11.4 范围内没有新增阻塞项或中高优先级问题。

Round 4、Round 5、Round 6 的 P1 findings 均已关闭。Round 2 Finding #3 继续维持 P2 / CR TODO / 非阻塞。Round 3 summary/evaluation 已由 Round 4 provenance recovery 判定为 concurrent invalid provenance，本轮不使用其 finding、授权或 closeout 结论。External drawer、`.agents/.claude` mirror、build/packaging/full-suite caveat 均与 Story 11.4 closeout scope 隔离，不构成本轮阻塞项。

评估决定：`EVALUATION_PASS`。允许进入 CR04；本文件不自行执行 CR04、CR05、CR06、Story/tracker 状态改写、commit 或 push。

---

## Previous Findings Review（上轮问题回顾确认）

### Round 4 Finding #1：fresh `resolve artifact-roots --lifecycle fresh` config-absent path：已关闭

当前 public CLI integration 已消费 Story 11.1 pure resolver contract。`src/config/artifact-root-resolver.ts:197-211` 在 `lifecycle=fresh` 且 required base `_speclite/config.toml` 缺失时调用 `resolveArtifactRoots()`，并返回空 `configSources`；`src/commands/resolve.ts:124-171` 将 `resolve artifact-roots` 注册为独立 public surface，并以 root resolver 结果决定 exit code 与 machine-readable JSON。

独立验证：

- `npm --silent run dev -- resolve artifact-roots --project-root test/fixtures/fresh-install-empty-project/input --lifecycle fresh` -> PASS，exit `0`，`schemaVersion="speclite.resolve.artifact-roots.v1"`，7 个 roots，全部 `fresh-default`，`configSources={}`。
- `npx vitest run test/analysis-artifact-routing.test.ts test/resolve-readers.test.ts test/artifact-root-resolution.test.ts --reporter=dot` -> PASS，3 files / 27 tests。

### Round 4 Finding #2：public resolver docs closed-list drift：已关闭

Round 7 Reviewer 记录 `npm run docs:check` PASS。当前 focused test `test/analysis-artifact-routing.test.ts:526-541` 锁定 `README.md`、`docs/explanation/local-first-control-plane.md`、`docs/explanation/runtime-boundaries.md`、`docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md` 均包含 `resolve config`、`resolve customization`、`resolve artifact-roots` 与 `Node CLI`。本评估复跑 `npm run docs:check`，结果为 PASS：72 Markdown files、5 drafts、links and governance rules valid。

### Round 4 Finding #3 / Round 5 Finding #2：route helper basename、directory/non-file、symlink boundary、trimmed basename mismatch：已关闭

当前 `src/manifest/analysis-artifact-routing.ts:53-56` 使用 `assertPortableProjectName()` 返回的 trimmed project name 生成 Product Brief / PRFAQ main 与 distillate basename；`src/manifest/analysis-artifact-routing.ts:90-105` 对 trim 后空值、`.`、`..`、separator、NUL、absolute / drive-like shape fail closed，并保留内部空格与 Unicode；`src/manifest/analysis-artifact-routing.ts:108-134` 对 existing candidate 执行 project-boundary symlink guard、`lstat()` regular non-symlink check、readability `fs.open(..., "r")` probe 与 `finally close()`，且只有 `ENOENT` 表示 missing。

当前 `test/analysis-artifact-routing.test.ts:383-524` 覆盖 trimmed basename、内部空格、Unicode、unsafe names、directory、legacy directory、external symlink、unreadable `EACCES` 与 new-wins 不读取 legacy。独立 focused tests PASS：3 files / 27 tests。

### Round 5 Finding #1：PB/PRFAQ installed workflow route safety contract：已关闭

Product Brief workflow 当前在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:53-67` 绑定 raw merged config、artifact roots 与 HALT 条件，在 `:79-96` 明确 Product Brief route variables、portable single filename segment、project-local regular non-symlink candidate、unreadable / symlink escape / non-`ENOENT` HALT、new-first、legacy-compatible-only、selected-directory distillate 与 no migration/copy/delete/rename/rewrite。

PRFAQ workflow 当前在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:44-58` 绑定 raw merged config、artifact roots 与 HALT 条件，在 `:138-155` 明确同等 route safety、press release / FAQ / verdict / stage / resume / distillate co-location 与 no migration/copy/delete/rename/rewrite。

当前 `test/analysis-artifact-routing.test.ts:543-612` 锁定两份 installed workflow contract tokens，包括 `speclite resolve artifact-roots --project-root {project-root}`、`resolutionMode`、raw merged `core.project_name` binding、trim-empty HALT、portable filename、regular non-symlink、project-local、symlink escape、`ENOENT` missing、HALT before resume/write/migration 与 no-migration 语义。

### Round 6 Finding #1：existing candidate readability probe：已关闭

`src/manifest/analysis-artifact-routing.ts:118-134` 在 regular non-symlink candidate 判定后执行 `fs.open(candidate.absolutePath, "r")`，并在 `finally` 中 close file handle；`ENOENT` 仍返回 missing，`EACCES`、`EPERM` 或其它 non-`ENOENT` open failures 继续抛出并 HALT。`test/analysis-artifact-routing.test.ts:484-499` 通过 `node:fs/promises.open` mock 注入 `EACCES`，锁定 unreadable regular file regression；`test/analysis-artifact-routing.test.ts:501-519` 锁定 new subject valid file 时不探测 legacy candidate。

### Round 6 Finding #2：PB/PRFAQ `core.project_name` binding：已关闭

Product Brief workflow `workflow-details.md:53-59` 与 PRFAQ workflow `workflow-details.md:44-50` 均明确从 raw merged config field `core.project_name` 绑定 `{project_name}`，且字段缺失、非 string 或 trim 后为空时在 route selection 前 HALT。该语义由 `test/analysis-artifact-routing.test.ts:559-599` 的 installed workflow contract scan 覆盖。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R2-#3 | broad legacy-pattern `575` 精确计数缺少可复现命令 | CR TODO / P2 / 非阻塞 | 维持 defer；该项是 evidence hygiene TODO，不阻塞 Story 11.4 Round 7 `EVALUATION_PASS`，本轮也不授权修复 TODO backlog 或 broad evidence governance。 |

### Invalid Provenance（失效来源）

Round 3 summary/evaluation 由 Round 4 Reviewer/Evaluator 明确判定为 concurrent invalid provenance。本轮不引用 Round 3 的 finding set、修复授权、canonical governance 判断或 closeout 结论，避免污染 Round 7 pass decision。

---

## Findings Evaluation（发现评估）

本轮 Reviewer Round 7 未报告新的 findings。Blind Hunter、Edge Case Hunter、Acceptance Auditor 与 aggregator 均为 PASS / no findings。因此本轮没有逐条 finding 需要确认、降级或判定误报。

本评估独立确认 Reviewer 的 no-finding 结论成立：

- Fresh CLI/docs/path safety：current `resolve artifact-roots --lifecycle fresh`、public resolver docs、portable basename、candidate file type、symlink boundary 与 readability probe 均有 current source / test / command evidence。
- Workflow safety/trim identity：PB/PRFAQ installed workflow 的 route safety contract、trimmed project name basename generation、internal spaces / Unicode preservation、new-first / legacy-compatible-only / no-migration policy 均有 current workflow text 与 focused tests。
- Raw `project_name` binding：PB/PRFAQ Load Config 均从 raw merged `core.project_name` 绑定 `{project_name}`；`resolve config` 保持 raw merged config surface，未被 artifact-root synthetic fallback 污染。
- Scoped active negative scan：`assets/source/speclite/sdlc-skills/1-analysis`、`module-help.csv`、`docs/reference/skills/sdlc-workflows.md`、`docs/reference/workflow-artifact-layout.md` 未命中 active旧 `{planning_artifacts}/research/`、`{planning_artifacts}/product-brief`、`{planning_artifacts}/prfaq` 或 `{project_knowledge}/research` producer defaults。
- Canonical checker warn/strict 均为 `status=ok`、`findings=[]`、`decisionRecordRequired=false`。当前 counts 为 core=19、sdlc=50、default total=69；external drawer / fixed-count 历史 caveat 已与本 Story 11.4 closure 分离。

---

## Validation Summary（验证摘要）

- `npx vitest run test/analysis-artifact-routing.test.ts test/resolve-readers.test.ts test/artifact-root-resolution.test.ts --reporter=dot` -> PASS，3 files / 27 tests。
- `npm --silent run dev -- resolve artifact-roots --project-root test/fixtures/fresh-install-empty-project/input --lifecycle fresh` -> PASS，exit `0`，7 roots，全部 `fresh-default`，`configSources={}`。
- `npm --silent run dev -- resolve config --project-root test/fixtures/resolve-parity/input/config` -> PASS，stdout 包含 raw merged `core.project_name="Fixture User"`。
- `npm run docs:check` -> PASS，72 Markdown files，5 drafts，links and governance rules valid。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` -> PASS，`status=ok`、`findings=[]`。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict` -> PASS，`status=ok`、`findings=[]`。
- Scoped active negative scan -> PASS，无 active旧 producer default 命中。
- `git diff --check -- <Story 11.4 scoped files>` -> PASS，无 whitespace error。

本轮未运行 `npm run build`、`npm run release:packaging-check` 或 full `npm test`；原因是本轮指令禁止 build / packaging / full-suite 写副作用。Round 7 Reviewer 同样未将这些命令作为本轮 closure 条件；历史 build/packaging/full fixed-count caveat 与 Story 11.4 bounded CR scope 已隔离。

---

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | Reviewer Round 7 无新增 finding；Round 4-6 P1 findings 均已关闭。 |

### CR TODO Tracking（建议纳入 CR TODO，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R2-#3 | broad legacy-pattern `575` 精确计数缺少可复现命令 | [低] | **P2** | 维持既有 CR TODO / defer；不阻塞 `EVALUATION_PASS`，不授权本轮修复。 |

### Ignorable / Unrelated（可忽略或无关）

| # | 项目 | 处理理由 |
|---|------|---------|
| - | Round 3 summary/evaluation | concurrent invalid provenance；不得作为本轮授权或 closeout 输入。 |
| - | external drawer / fixed-count / release packaging caveat | 与 Story 11.4 bounded scope 隔离；canonical warn/strict 当前为 `status=ok`。 |
| - | `.agents/.claude` mirror caveat | 本轮 source of truth 为 canonical source、current tests 与 canonical checker；未授权 mirror sync，且不阻塞 11.4 CR pass。 |
| - | build / packaging / full-suite caveat | 本轮按指令未运行有写副作用风险的 build、packaging 或 full suite；不作为新增 finding。 |

### Evaluation Decision（评估决定）

- **Overall Verdict**：`EVALUATION_PASS`。
- **是否允许进入 CR04**：允许。Round 7 Reviewer no-finding 结论经独立复核成立，Story 11.4 范围内没有待 Fixer 处理的 P0/P1 finding。
- **是否需要 Fixer**：不需要。当前无授权给 Fixer 的阻塞项。
- **是否允许 CR05/CR06**：本 evaluation 本身不直接授权 CR05/CR06；CR04 完成后应按 CR workflow 顺序再决定 CR05/CR06。
- **残余 TODO**：Round 2 Finding #3 继续作为 P2 / CR TODO / evidence hygiene defer。
- **残余 caveat**：external drawer、`.agents/.claude` mirror、build/packaging/full-suite 固定计数或副作用 caveat 均保持 scope-isolated，不阻塞 Story 11.4 Round 7 `EVALUATION_PASS`。
