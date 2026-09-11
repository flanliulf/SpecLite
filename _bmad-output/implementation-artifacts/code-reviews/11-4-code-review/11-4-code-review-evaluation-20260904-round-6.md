---
Story: 11-4
Round: 6
Date: 2026-09-04
Model Used: GPT-5 Codex (gpt-5)
Review Source: 11-4-code-review-summary-20260904-round-6.md
Review Model: GPT-5 Codex (gpt-5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-4 的第 6 轮 CR 代码审查结果（Round 5 Fixer 后复审）进行独立逐条评估。本轮 Review Source 为 `11-4-code-review-summary-20260904-round-6.md`。

Round 4 三项与 Round 5 两项均确认关闭：fresh `resolve artifact-roots --lifecycle fresh` config-absent path、public resolver docs closed-list、route helper basename / directory / non-file / symlink boundary、installed PB/PRFAQ route safety contract、以及 trimmed basename generation 均已有 current source / workflow / focused test evidence。Round 2 Finding #3 继续维持 P2 defer / CR TODO 候选，不进入本轮 Fixer。

本轮 Reviewer 新增两项 finding 均确认有效，均属于 Story 11.4 / Owner A+B 已授权后的 bounded contract completion，不需要新的 Owner decision：

1. `resolveAnalysisDocumentRoute()` 的 existing regular candidate route selection 未执行 readability probe，但 installed workflow 已明确 unreadable candidate 必须在 resume/write/migration 前 HALT；评为 P1 `patch`。
2. Product Brief / PRFAQ Load Config 未显式把 raw merged config `core.project_name` 绑定为后续 `{project_name}`；评为 P1 `patch`。

外部 drawer、`.agents/.claude` mirror、build/packaging 副作用、full-suite fixed-count drift 与 Round 2 #3 均排除在本轮授权外。

## Previous Findings Review（上轮问题回顾确认）

### Round 4 / Finding #1：fresh config-absent public artifact-root resolution：已关闭

Round 5 evaluation 确认 `resolveArtifactRootsFromProjectConfig()` 只在 `lifecycle=fresh` 且 required base config 为 `ENOENT` 时消费 empty config / pure resolver，同时保留 malformed、non-file、unreadable、existing missing 与 raw `resolve config` fail-closed 语义。Round 6 summary 也复核 fresh artifact-roots CLI 当前可返回 schema `speclite.resolve.artifact-roots.v1`、7 个 roots、`configSources={}`。本项不重新打开。

### Round 4 / Finding #2：public resolver docs closed-list drift：已关闭

Round 5 后 focused contract scan 已锁定 `README.md`、`docs/explanation/local-first-control-plane.md`、`docs/explanation/runtime-boundaries.md` 与 `docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md` 同时包含 `resolve config`、`resolve customization`、`resolve artifact-roots` 与 `Node CLI`。Round 6 summary 记录 `npm run docs:check` PASS。本项关闭。

### Round 4 / Finding #3 与 Round 5 Finding #2：route helper basename / unsafe candidate boundary：主体已关闭

当前 `src/manifest/analysis-artifact-routing.ts:53-56` 已使用 `assertPortableProjectName()` 返回的 trimmed project name 生成 Product Brief / PRFAQ main 与 distillate basename；`src/manifest/analysis-artifact-routing.ts:90-105` 对空白、`.`、`..`、separator、NUL、absolute / drive-like shape fail closed，并保留内部空格与 Unicode。`test/analysis-artifact-routing.test.ts:356-411` 覆盖 trimmed basename、内部空格与 Unicode；`test/analysis-artifact-routing.test.ts:413-473` 覆盖 unsafe names、directory、legacy directory、external symlink 与 new-wins precedence。主体关闭。

Round 6 Finding #1 不是推翻上述 closure，而是在已写入 installed workflow contract 的 `unreadable candidate` 语义上发现 helper 仍缺少 readability probe，因此作为新的 bounded P1 patch 处理。

### Round 5 Finding #1：PB/PRFAQ installed workflow route safety contract：主体已关闭

Product Brief workflow 当前在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:76-93` 明确 new/legacy route variables、trimmed portable single filename segment、project-local candidate、regular non-symlink、symlink escape、non-`ENOENT` HALT、new-first、legacy-compatible-only、selected-directory distillate 与 no migration/copy/delete/rename/rewrite。PRFAQ workflow 当前在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:135-152` 明确同等规则，并覆盖 press release / FAQ / verdict / stage / resume / distillate co-location。`test/analysis-artifact-routing.test.ts:492-553` 已锁定主要 installed workflow contract tokens。主体关闭。

Round 6 Finding #2 指向同一 workflow activation chain 的 Load Config binding 缺口：route selection 使用 `{project_name}`，但 Load Config 没有说明它来自 raw merged `core.project_name`。这是新的 contract-completion patch，不需要重新打开 Round 5 Finding #1 的其它安全语义。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R2-#3 | broad scan `575` 精确计数缺少可复现命令 | CR TODO / P2 / 非阻塞 | 维持 defer；本轮 Fixer 不得处理 broad evidence governance、TODO backlog 或 CR05。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[中][新] `isSafeExistingCandidate()` 未验证 regular candidate 可读，unreadable file 仍被选中**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`src/manifest/analysis-artifact-routing.ts:108-128` 中 `isSafeExistingCandidate()` 的 existing candidate 判定流程是：

- `resolveProjectRelativePath()` 将 candidate 约束为 project-relative path；
- `findProjectBoundarySymlinkEscape()` 检测 project-boundary symlink escape；
- `lstat(candidate.absolutePath)` 后仅检查 `candidateStat.isFile()` 与 `candidateStat.isSymbolicLink()`；
- regular non-symlink file 直接 `return true`；
- 只有 `ENOENT` 返回 `false`，其它 error 抛出。

该流程确实没有验证 current process 是否能读取 candidate contents。与此同时，installed workflow 已把 unreadable candidate 写成 route selection 的 fail-closed contract：Product Brief `workflow-details.md:89-90` 与 PRFAQ `workflow-details.md:148-149` 都声明 existing candidate 如为 unreadable candidate 或任何 non-`ENOENT` error，必须 HALT；`workflow-details.md:93` 与 `:152` 又明确只有 `ENOENT` 表示 missing，并且必须在 resume/write/migration 前 fail closed。

因此，Reviewer 对“regular non-symlink candidate 仍可能被选中”的描述成立。现有 focused tests `test/analysis-artifact-routing.test.ts:413-473` 覆盖 directory、legacy directory、external symlink 与 new-wins precedence，但没有 unreadable regular file regression。

**严重性判断：原始“中”偏低，评估后为 P1**

该问题不造成 path escape，也不推翻 directory / symlink / basename closure；但它直接违反 Round 5 已写入真实 installed workflow 的 route safety contract。Story 11.4 的 PB/PRFAQ route helper 是 Owner B policy 的 executable contract evidence；若 helper 可把 unreadable regular file 返回为 selected existing artifact，后续 resume/write 才失败，错误位置更晚，且不同 Agent 可能产生不一致恢复行为。由于 contract 明确要求 HALT before resume/write/migration，本项阻塞交付，评为 P1。

**修复建议：可行**

Fixer 应在 `isSafeExistingCandidate()` 的 regular non-symlink check 后加入 explicit readability probe，并把除 `ENOENT` missing 以外的读取权限/打开异常作为 HALT。最小语义如下：

1. 对 regular non-symlink existing candidate 执行 `open(candidate.absolutePath, "r")` 并立即 `close()`；能打开才返回 `true`。
2. `ENOENT` 继续表示 missing candidate，返回 `false`。
3. `EACCES`、`EPERM`、ACL / capability / sandbox 导致的 open failure、以及其它 non-`ENOENT` errors 均 HALT，不降级为 missing。
4. 不改变 project-boundary symlink escape、directory、non-file、new-first、legacy-compatible-only、no-migration/write-in-place 与 selected-directory co-location 语义。

不建议只把 `access(candidate.absolutePath, R_OK)` 作为最终 contract。`access(R_OK)` 是有用的权限预检，但它不是 resume/read 行为本身；在 root、ACL、platform-specific permission model 或 TOCTOU 场景下，它可能与实际 open/read 结果不完全一致。这里要证明的是“route selection 选择的 existing artifact 可被当前 workflow 读取/恢复”，所以更稳妥的 contract 是 open/read probe。读取 0 byte 或 open-close 即可；不需要解析文档内容，也不需要迁移、复制或重写 artifact。

测试范围应限定在 `test/analysis-artifact-routing.test.ts`：创建 regular file 后 `chmod 000`，断言 `resolveAnalysisDocumentRoute()` rejects / HALT；在 `process.getuid?.() === 0` 或不具备 POSIX chmod semantics 的平台上显式 skip 或使用环境守卫，避免跨平台误报。现有 repo 当前 targeted runtime 为 Darwin / Node，`chmod 000` regression 可以作为本地 focused test。

允许修改文件仅限：

- `src/manifest/analysis-artifact-routing.ts`
- `test/analysis-artifact-routing.test.ts`

**误报评估：非误报**

`lstat().isFile()` 只能证明文件类型，不证明 route selection 阶段可读；workflow contract 已明确 unreadable candidate 不是 valid existing artifact。本项不是 decision_needed，而是 bounded patch。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[中][新] PB/PRFAQ route selection 使用 `{project_name}`，但 Load Config 未明确绑定 `core.project_name`**
> - 来源：blind
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Product Brief workflow 的 Load Config 当前在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:53-56` 只显式绑定：

- `{user_name}`
- `{communication_language}`
- `{document_output_language}`

但同一文件的 route variables 在 `workflow-details.md:80-85` 使用 `{project_name}` 构造 `product_brief_new_main_artifact`、`product_brief_legacy_main_artifact` 与 distillate basename。

PRFAQ workflow 同样在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:44-47` 只显式绑定 user/language/output language，却在 `workflow-details.md:139-144` 使用 `{project_name}` 构造 main / legacy / distillate artifact paths。

`core.project_name` 本身是明确存在的 raw merged runtime config 字段：`docs/reference/config-and-customization.md:24` 将 `[core] project_name` 记录为共享项目标识；Product Brief 与 PRFAQ 的 `config.toml.example:1-7` 也包含 `[core] project_name`。`src/commands/resolve.ts:45-80` 的 `resolve config` command 是 raw merged config 输出 surface，不是 artifact-root synthetic fallback。因此缺口不是字段不存在，而是 installed Markdown workflow 没有把 raw merged `core.project_name` 绑定为 `{project_name}`。

**严重性判断：原始“中”偏低，评估后为 P1**

Round 5 已将 PB/PRFAQ route selection 从 literal path 文案提升为 explicit route safety contract，其中 basename、resume、distillate/stage co-location 都依赖 `{project_name}`。如果 strict installed workflow runner 按 Markdown 执行，它会知道 user/language/output language 与 artifact roots，却缺少 `{project_name}` 的来源声明，导致 route selection 依赖隐式上下文或旧模板习惯。Story 11.4 要求五类 producer routing 可执行且不遗留 active defaults；该 binding 缺口直接削弱 PB/PRFAQ basename/resume/stage/distillate preservation 的可执行性，评为 P1。

**修复建议：可行**

Fixer 应在两份 workflow 的 Load Config 字段列表中明确：

1. 从 `speclite resolve config --project-root {project-root}` 的 raw merged config `core.project_name` 绑定 `{project_name}`。
2. `{project_name}` trim 后非空是 route selection 前置条件；缺失、非 string 或 trim 后为空时 HALT before route selection。
3. 继续由 route selection 段执行 portable single filename segment 校验；不要引入 slugify、slash normalization、transliteration 或额外字符集收窄。
4. 保持 `resolve config` raw merged-config 语义，不改 `resolve artifact-roots` surface，不把 `config.toml.example` 当 runtime fallback。

测试范围应限定在 `test/analysis-artifact-routing.test.ts` 的 installed workflow contract scan：两份 workflow 均必须包含 `core.project_name`、`{project_name}` binding、raw merged config / `resolve config` 语义、trim 后非空 / HALT 前置语义。无需修改 runtime config schema、config examples、prompts/finalize、manifest 或 docs。

允许修改文件仅限：

- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md`
- `test/analysis-artifact-routing.test.ts`

**误报评估：非误报**

两份 workflow 当前确实使用 `{project_name}` 且未在 Load Config 显式绑定其 raw merged config 来源。Owner A 已明确 `resolve config` 保持 raw merged config，Owner B 已明确 PB/PRFAQ route policy；现有 contracts 足够授权该文档与测试补丁，不需要新的 Owner gate。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 分类 | 说明 |
|---|------|----------|-----------|------|------|
| 1 | regular non-symlink existing candidate 未验证 readability | [中] | **P1** | `patch` | Route helper 未履行 installed workflow 已声明的 unreadable candidate HALT before resume/write contract。 |
| 2 | PB/PRFAQ Load Config 未显式绑定 raw `core.project_name` 到 `{project_name}` | [中] | **P1** | `patch` | Route selection 的 basename/resume/stage/distillate 变量来源不完整，削弱 installed workflow 可执行性。 |

### CR TODO Tracking（建议纳入 CR TODO，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R2-#3 | broad scan `575` 精确计数缺少可复现命令 | [低] | **P2** | 维持 defer；本轮 Fixer 不得处理。 |

### Ignorable / Unrelated（可忽略或无关）

| # | 项目 | 处理理由 |
|---|------|---------|
| - | external drawer / fixed-count drift | Story 11.4 外部 mixed-worktree caveat；不得授权 drawer、module-help、manifest、canonical governance 或 fixed-count baseline 修复。 |
| - | `.agents/.claude` mirror | 本轮 source of truth 为 canonical source / current tests；未授权 mirror sync。 |
| - | build / packaging side effect / full-suite caveat | 仅为验证 caveat；不得扩大为 Story finding 或 Fixer 范围。 |
| - | Round 2 Finding #3 | P2 evidence hygiene / CR TODO 候选；不阻塞本轮 bounded patch。 |
| - | CR04 / CR05 / CR06 | 两个 P1 未经 fresh Fixer + Reviewer + Evaluator 关闭前不得进入。 |

### Exact Fixer Authorization（精确 Fixer 授权）

Fresh Fixer 仅获授权处理以下范围：

1. 在 `src/manifest/analysis-artifact-routing.ts` 中为 `isSafeExistingCandidate()` 增加 regular non-symlink candidate readability probe。优先使用 `open(candidate.absolutePath, "r")` + close 的 open/read probe；`ENOENT` 仍返回 missing，`EACCES` / `EPERM` / ACL / sandbox / 其它 non-`ENOENT` open failures 均 HALT。不得改变 symlink boundary、directory/non-file、new-first、legacy-compatible-only、no-migration 或 selected-directory co-location 语义。
2. 在 `test/analysis-artifact-routing.test.ts` 中补 unreadable regular file regression；可用 `chmod 000`，并在 root 或不具备 POSIX chmod semantics 的平台上显式 skip / guard。
3. 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md` 与 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md` 的 Load Config 中明确从 raw merged config `core.project_name` 绑定 `{project_name}`，字段缺失、非 string 或 trim 后为空时 HALT before route selection。
4. 在 `test/analysis-artifact-routing.test.ts` 的 installed workflow contract scan 中补断言：两份 workflow 均包含 `core.project_name`、`{project_name}` binding、raw merged config / `resolve config`、trim 后非空 / HALT 前置语义。

本授权不包括：Story/tracker/flow gate 状态改写，CR04/CR05/CR06，CR rules / TODO backlog，Round 2 #3 修复，外部 drawer、`.agents/.claude` mirror、module-help、manifest、fixed count baseline、canonical governance、build/packaging side effect、其它 docs/Skill/prompt 文件、11.5+ routing 或 migration policy、commit 或 push。

Fixer 完成后必须进入 fresh Reviewer replacement 与 fresh Evaluator；不得凭本 evaluation 直接 closeout。

### Evaluation Decision（评估决定）

- **Finding #1（readability probe 缺失）**：有效，P1 `patch`；不需要 Owner decision。`access(R_OK)` 可作为参考但不应作为最终 contract，授权 open/read probe。
- **Finding #2（`core.project_name` binding 缺失）**：有效，P1 `patch`；不需要 Owner decision。授权两份 workflow Load Config + focused contract tests。
- **Round 4 / Round 5 closure**：确认关闭；Round 6 两项是新的 bounded contract-completion patch，不推翻已关闭主体。
- **Round 2 Finding #3**：继续 P2 defer / CR TODO 候选，本轮不授权修。
- **Overall Verdict**：`FIX_REQUIRED`。两个 P1 完成并经 fresh Reviewer/Evaluator 通过前，Story 11.4 不得进入 CR04、CR05 或 CR06。

## Fix Execution Record（修复执行记录）

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5 Codex
- **Fix Items**: 2

#### Fix Item 1：existing candidate readability probe

- **Status**: Completed
- **Files Changed**:
  - `src/manifest/analysis-artifact-routing.ts`
  - `test/analysis-artifact-routing.test.ts`
- **Summary**: `isSafeExistingCandidate()` now keeps the existing project-local, non-symlink, `lstat()` regular-file checks, then probes readability with `fs.open(candidate.absolutePath, "r")` and closes the file handle in `finally`. `ENOENT` remains the only missing-candidate condition; `EACCES`, `EPERM`, ACL/sandbox failures, and any other non-`ENOENT` open errors HALT by propagation. The existing new-first, legacy-compatible-only, both-missing-to-new, no-migration, and selected-directory co-location semantics are unchanged.
- **Regression Coverage**: Added a stable `node:fs/promises.open` mock path that injects `EACCES` for a regular file candidate without relying on chmod/root behavior, and added a new-first assertion that the legacy read probe is not invoked when the new subject artifact is valid.

#### Fix Item 2：PB/PRFAQ `core.project_name` binding

- **Status**: Completed
- **Files Changed**:
  - `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md`
  - `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md`
  - `test/analysis-artifact-routing.test.ts`
- **Summary**: Both Product Brief and PRFAQ Load Config sections now bind `{project_name}` from raw merged config field `core.project_name`, and HALT before route selection when the field is missing, non-string, or trims to empty. The existing trim and portable single filename segment route-selection rules remain the place for slash, NUL, absolute, drive-like, `.`, and `..` validation; no slugify, migration, fallback, or artifact-root surface change was introduced.
- **Regression Coverage**: Extended the installed workflow contract scan to lock `core.project_name`, `{project_name}` binding, raw merged config wording, trim-empty HALT before route selection, and existing route safety tokens in both workflow files.

#### Verification

- `npm test -- --run test/analysis-artifact-routing.test.ts` — PASS, 9 tests.
- `rg -n -e 'core\.project_name' -e 'Bind `\{project_name\}`' -e 'HALT before route selection' -e 'Only `ENOENT` means' -e 'unreadable candidate' -e 'fs\.open\(' ...` — PASS; targeted tokens present in authorized files.
- `git diff --check -- assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md src/manifest/analysis-artifact-routing.ts test/analysis-artifact-routing.test.ts` — PASS.
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` — PASS, `status=ok`, `findings=[]`.

#### Scope Notes

- No Story, tracker, flow gate, CR rules, CR TODO, external drawer, `.agents/.claude` mirror, module-help, manifest, packaging, broad baseline, commit, or push changes were made by this Fixer.
- Round 2 Finding #3 remains deferred/P2 and was not modified.
