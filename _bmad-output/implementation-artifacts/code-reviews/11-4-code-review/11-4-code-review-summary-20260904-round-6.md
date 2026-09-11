---
Story: 11-4
Round: 6
Date: 2026-09-04
Model Used: GPT-5 Codex (gpt-5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Story 11.4 Round 5 Fixer 后的 fresh independent aggregator 复审。三层候选均已独立复核：Acceptance Auditor 的 AC1-AC10 / Round 4 / Round 5 closure 判断成立；Edge Case Hunter 的 unreadable existing candidate 问题成立；Blind Hunter 的 PB/PRFAQ `project_name` raw config binding 问题成立。当前 focused 3 files / 27 tests、fresh artifact-roots CLI、docs:check 与 scoped diff check 均通过；本轮未运行 build、packaging 或 full suite，避免触发已知外部 drawer drift 和 packaging side effect。

结论：不通过。Round 5 两项 P1 已关闭，但本轮新增 2 项 Story-owned `patch` finding，需进入 fresh `bmenhance-cr-02-evaluator 11-4`；Evaluator 明确授权前不得执行 Fixer、CR04、CR05 或 CR06。

三层 provenance：

- Acceptance Auditor：PASS。AC1-AC10、Round 4 三项与 Round 5 两项均可由当前源码、workflow 文档和 focused tests 支撑；未发现新的 acceptance-level 主路径失败。
- Edge Case Hunter：FAIL。`isSafeExistingCandidate()` 只执行 project boundary symlink check 与 `lstat()` regular non-symlink check，未验证 candidate readable；`chmod 000` regular file 会被选为 existing route。
- Blind Hunter：FAIL。PB/PRFAQ Load Config 阶段只显式绑定 user/language/output language，后续 route selection 使用 `{project_name}`，但没有明确从 raw merged config `core.project_name` 绑定；CLI 能提供该字段，当前 tests 未锁定 installed workflow contract。

## Previous Findings Review（上轮问题回顾）

### 已关闭

1. Round 4 / Finding #1 — `resolve artifact-roots --lifecycle fresh` fresh config-absent failure
   - 当前 `npm --silent run dev -- resolve artifact-roots --project-root test/fixtures/fresh-install-empty-project/input --lifecycle fresh` exit `0`，输出 schema `speclite.resolve.artifact-roots.v1`、7 个 roots、全部 `fresh-default`、`configSources={}`。
   - Round 5 evaluation fix record 已确认该修复只放宽 fresh `ENOENT` base config case，并保留 raw `resolve config` required-layer failure。

2. Round 4 / Finding #2 — public resolver docs closed-list drift
   - Round 5 之后的 focused test 已锁定 `README.md`、`docs/explanation/local-first-control-plane.md`、`docs/explanation/runtime-boundaries.md`、`docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md` 同时包含 `resolve config`、`resolve customization`、`resolve artifact-roots` 与 `Node CLI`。
   - 本轮 `npm run docs:check` PASS。

3. Round 4 / Finding #3 / Round 5 Finding #2 — unsafe basename、directory/non-file、symlink boundary 与 trimmed basename mismatch
   - 当前 `src/manifest/analysis-artifact-routing.ts:53-56` 使用 `assertPortableProjectName()` 返回的 trimmed project name 生成 Product Brief / PRFAQ main 与 distillate basename。
   - 当前 `src/manifest/analysis-artifact-routing.ts:90-105` 对空白、`.`、`..`、separator、NUL、absolute / drive-like shape fail closed，并保留内部空格与 Unicode。
   - 当前 `src/manifest/analysis-artifact-routing.ts:108-128` 对 existing candidate 执行 project-boundary symlink guard、`lstat()`、regular file 与 non-symlink 检查；directory、non-file、symlink escape 已关闭。
   - `test/analysis-artifact-routing.test.ts:356-473` 覆盖 trimmed basename、内部空格、Unicode、unsafe names、directory、legacy directory、external symlink 与 new-wins precedence。

4. Round 5 Finding #1 — PB/PRFAQ installed workflow route safety contract 缺失
   - Product Brief workflow 当前在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:76-93` 明确 route variables、trimmed portable single filename segment、project-local candidate、regular non-symlink、symlink escape、non-`ENOENT` HALT、new-first、legacy-compatible-only、selected-directory distillate 与 no migration/copy/delete/rename/rewrite。
   - PRFAQ workflow 当前在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:135-152` 明确同等规则，并覆盖 press release / FAQ / verdict / stage / resume / distillate co-location。
   - `test/analysis-artifact-routing.test.ts:492-553` 已锁定两份 installed workflow Markdown 包含 route safety contract 关键语义。

### 仍为非阻塞待办

1. Round 2 / Finding #3 — broad legacy-pattern `575` 精确计数缺少可复现命令
   - 维持既有结论：P2 / CR TODO / 非阻塞。本轮不授权修复。

## New Findings（新发现）

### 1. [中][新] `isSafeExistingCandidate()` 未验证 regular candidate 可读，unreadable file 仍被选中

- **来源**：edge；aggregator 独立复现
- **分类**：patch

- **证据**
  - `src/manifest/analysis-artifact-routing.ts:108-128` 中 `isSafeExistingCandidate()` 只调用 `findProjectBoundarySymlinkEscape()` 和 `lstat()`；`candidateStat.isFile()` 且非 symlink 后直接 `return true`，没有 `access(candidate.absolutePath, R_OK)` 或等价 read-open probe。
  - Product Brief workflow 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:89-90` 明确 `unreadable candidate` 必须 HALT；PRFAQ workflow 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:148-149` 明确同等规则。
  - 当前 `test/analysis-artifact-routing.test.ts:413-473` 覆盖 unsafe names、directory、legacy directory、external symlink 与 new-wins，但没有 unreadable regular file regression。
  - 定向复现（当前 Darwin / Node 环境）：在临时 project root 下创建 `_speclite-output/planning-artifacts/product-brief/product-brief-unreadable.md`，`chmod 000` 后调用 `resolveAnalysisDocumentRoute()`；实际输出为 `{"outcome":"selected","mainArtifact":"_speclite-output/planning-artifacts/product-brief/product-brief-unreadable.md","selectedSource":"new-subject"}`，未 HALT。

- **影响**
  - installed workflow contract 要求 unreadable candidate 在 resume/write/migration 前 fail closed，但 executable helper 会把 unreadable regular file 当成 valid existing artifact。后续 agent 可能尝试 resume 该文件，得到更晚、更弱的读取失败，或在错误处理不一致时偏离 Round 5 固化的 route safety semantics。
  - 该问题不造成 path escape，也不推翻 directory / symlink / basename 修复；但它破坏 Round 5 明确写入的 `unreadable candidate` HALT contract，属于 Story 11.4 owner surface 内的 bounded patch。

- **建议**
  - 在 `isSafeExistingCandidate()` 的 regular non-symlink check 后增加 readability probe，例如 `await access(candidate.absolutePath, constants.R_OK)`，并将 `EACCES` / `EPERM` 等 non-`ENOENT` 权限错误作为 HALT。
  - 补充 focused regression：创建 regular file 后 `chmod 000`，断言 route resolution rejects；测试需在支持 POSIX permission 的当前 `darwin` / Node runtime 下执行，必要时对不支持 chmod semantics 的平台做显式 skip 或环境守卫。

### 2. [中][新] PB/PRFAQ route selection 使用 `{project_name}`，但 Load Config 未明确绑定 `core.project_name`

- **来源**：blind；aggregator 独立复核
- **分类**：patch

- **证据**
  - Product Brief workflow 的 Load Config 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:53-56` 只显式绑定 `{user_name}`、`{communication_language}`、`{document_output_language}`；但 route variables 在同文件 `:80-85` 使用 `{project_name}` 构造 main / distillate paths。
  - PRFAQ workflow 的 Load Config 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:44-47` 同样只显式绑定 user/language/output language；但 route variables 在同文件 `:139-144` 使用 `{project_name}`。
  - CLI 确实提供该字段：`npm --silent run dev -- resolve config --project-root test/fixtures/resolve-parity/input/config` 输出 nested raw merged config，其中 `core.project_name` 为 `"Fixture User"`；`src/commands/resolve.ts:45-80` 的 `resolve config` surface 输出 merged config value，没有 artifact-root synthetic fallback。
  - `docs/reference/config-and-customization.md:24` 将 `[core] project_name` 定义为共享项目标识；`config.toml.example` 在 Product Brief 与 PRFAQ 中也均包含 `[core] project_name`。问题不是字段不存在，而是 installed Markdown workflow 的 binding step 没有把 raw config 字段绑定到 `{project_name}`。
  - 当前 `test/analysis-artifact-routing.test.ts:492-553` 只断言 workflow 包含 artifact-roots、route safety、legacy 与 no-migration 文案，没有断言 `core.project_name` binding。

- **影响**
  - Strict installed workflow runner 按 Markdown 执行时，可以正确知道 user/language/output language 和 artifact roots，却缺少 `{project_name}` 的来源声明；route selection 仍可能依赖隐式上下文或旧模板习惯。
  - 这会削弱 Story 11.4 对 Product Brief / PRFAQ basename、resume、stage 与 distillate preservation 的可执行性，尤其是在 Round 5 已把 route selection 从简单 literal path 提升为 explicit safety contract 后，`project_name` 来源必须同样明确。

- **建议**
  - 在 Product Brief 与 PRFAQ `workflow-details.md` 的 Load Config 字段列表中明确：从 raw merged config `core.project_name` 绑定 `{project_name}`；trim 后非空是 route selection 前置条件，字段缺失或 trim 后为空时 HALT。
  - 在 `test/analysis-artifact-routing.test.ts` 的 installed workflow contract scan 中补断言：两份 workflow 均包含 `core.project_name`、`{project_name}` binding、raw merged config / `resolve config` 语义，避免后续只依赖隐式 placeholder。

## Validation Summary（验证摘要）

- `npx vitest run test/analysis-artifact-routing.test.ts test/resolve-readers.test.ts test/artifact-root-resolution.test.ts --reporter=dot` -> PASS，3 files / 27 tests。
- `npm test -- test/analysis-artifact-routing.test.ts --reporter=dot` -> PASS，1 file / 9 tests。
- `npm --silent run dev -- resolve artifact-roots --project-root test/fixtures/fresh-install-empty-project/input --lifecycle fresh` -> PASS，exit `0`，7 roots，全部 `fresh-default`，`configSources={}`。
- `npm --silent run dev -- resolve config --project-root test/fixtures/resolve-parity/input/config` -> PASS，stdout 包含 raw merged `core.project_name="Fixture User"`。
- `npm run docs:check` -> PASS，72 Markdown files，5 drafts。
- `git diff --check -- <11.4 scoped tracked files>` -> PASS（无输出）。
- 定向 unreadable candidate repro -> FAIL，`chmod 000` regular file 被 selected；确认 Finding #1。
- 未运行：`npm run build`、`npm run release:packaging-check`、full `npm test`。原因：本轮 Reviewer 遵守只读/低副作用边界，且既有记录显示 build/packaging/full 会与外部 drawer drift / packaging side effect 交织；这些不作为本轮 closure 证据。

## Scope Audit（范围审计）

- 本文件是本轮唯一新增正式 Reviewer summary；未修改源码、测试、Story、tracker、flow gates、CR rules、TODO backlog、manifest、docs 或 `.agents` mirror。
- 当前仓库有外部 untracked drawer package / fixed-count drift 的既有 caveat；按 Round 4/5 evaluation 口径，它不属于 Story 11.4 finding，不授权本轮修 `module-help`、manifest、core drawer package 或 canonical governance。
- `.agents/skills` 下未发现可核验的 `speclite-product-brief` / `speclite-prfaq` mirror 路径；因此本轮不能把 installed mirror sync 当作 closure evidence，只审查 canonical source 与 current tests。
- `src/manifest/analysis-artifact-routing.ts` 与 `test/analysis-artifact-routing.test.ts` 当前为未跟踪 Story-owned files；本轮只读审查它们，不改变内容。

## Passed Areas（通过项）

- Round 4 public `resolve artifact-roots` fresh config-absent path 已关闭，且 raw `resolve config` required-layer contract 未被放宽。
- Public resolver docs closed-list drift 已关闭。
- Product Brief / PRFAQ route helper 的 trimmed basename、unsafe basename、directory / non-file、symlink escape 与 new-first precedence 已有当前实现和 focused coverage。
- Product Brief / PRFAQ installed workflow 已同步 portable single filename、project-local、regular non-symlink、symlink escape、non-`ENOENT` HALT、legacy-compatible-only、no-migration 与 selected-directory co-location 语义。
- Round 2 Finding #3 继续维持 P2 defer，不阻塞本轮 Story-owned patch 判断。

## Final Verdict（最终结论）

- **结论**：不通过 / `FIX_REQUIRED`
- **阻塞项**：Finding #1、Finding #2
- **非阻塞项**：Round 2 Finding #3 P2 defer；external drawer / `.agents` mirror caveats
- **是否需要 Evaluator**：需要，fresh `bmenhance-cr-02-evaluator 11-4`
- **是否需要 Fixer**：需要等待 Evaluator 明确授权后再执行；建议授权范围仅限 unreadable candidate readability guard 与 PB/PRFAQ `core.project_name` binding contract/tests。
