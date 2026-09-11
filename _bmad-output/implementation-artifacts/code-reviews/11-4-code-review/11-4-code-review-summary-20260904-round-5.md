---
Story: 11-4
Round: 5
Date: 2026-09-04
Model Used: GPT-5 Codex (gpt-5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Story 11.4 Round 4 Fixer 后的 fresh replacement 复审。三层输入均已纳入并由本 aggregator 独立复现裁决：Blind Hunter 为 `FIX_REQUIRED`，Edge Case Hunter 为 `FAIL`，Acceptance Auditor 为 `PASS`。Round 4 的 public `resolve artifact-roots` fresh config-absent failure 与 public resolver docs closed-list drift 已关闭；Round 4 route helper 的 source-level basename / candidate-file / symlink 边界只在 TS helper 与测试层部分关闭，未落到真实 installed Product Brief / PRFAQ Markdown workflow，且 helper 仍存在首尾空格 basename mismatch。因此本轮结论为不通过，需要进入 fresh Evaluator；不得直接 CR04、CR05 或 CR06。

Provenance（来源）：

- Blind Hunter：完成，`FIX_REQUIRED`。指出 TS helper 安全检查当前只被 tests 引用，真实 installed Product Brief / PRFAQ Markdown workflow 仍只声明 path 拼接与 `exists` 判断，缺少 portable single filename、project-local、regular non-symlink、symlink escape / HALT 规则；focused / CLI / docs / build / packaging / diff 通过。
- Edge Case Hunter：完成，`FAIL`。指出 `assertPortableProjectName()` 使用 `trimmed` 检查，但 basename 仍使用原始 `input.projectName`，`" alpha "` 会生成带首尾空格的 artifact 文件名；合法内部空格与 Unicode 应保留。
- Acceptance Auditor：完成，`PASS`。AC1-AC10 与 Round 4 三项均判关闭，focused 26、CLI、docs/build/packaging/canonical/diff 通过；full 仅 external drawer count 失败。其自认运行 build / packaging 并刷新 dist / release manifest，属于 Reviewer 只读副作用偏差，不能作为 Story 11.4 finding 或 closeout 授权。

## Previous Findings Review（上轮问题回顾）

### 已关闭

1. Round 4 / Finding #1 — `resolve artifact-roots --lifecycle fresh` 无法解析尚无 config 的 fresh project
   - 当前 `src/config/artifact-root-resolver.ts:197-211` 在 `lifecycle=fresh` 且 required base `_speclite/config.toml` 为 `ENOENT` 时走 pure resolver，并返回空 `configSources`。
   - 独立复现：`npm --silent run dev -- resolve artifact-roots --project-root test/fixtures/fresh-install-empty-project/input --lifecycle fresh` exit `0`，返回 schema `speclite.resolve.artifact-roots.v1`、7 个 roots、全部 `fresh-default`、`configSources={}`。

2. Round 4 / Finding #2 — Public resolver 文档仍把 Node CLI command set 固定为 `config` 与 `customization`
   - 当前 `README.md:146-154`、`docs/explanation/local-first-control-plane.md:48-52`、`docs/explanation/runtime-boundaries.md:60`、`docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md:13-14` 均包含 `resolve artifact-roots`。
   - `test/analysis-artifact-routing.test.ts:418-433` 已加入四个 public resolver docs 的 bounded contract scan。

3. Round 4 / Finding #3 — `resolveAnalysisDocumentRoute()` 未约束 basename、artifact 类型与 symlink boundary
   - TS helper 的 path traversal、directory/non-file 与 symlink escape 主缺口已有实现与测试：`src/manifest/analysis-artifact-routing.ts:107-128` 要求 project-local regular non-symlink file；`test/analysis-artifact-routing.test.ts:356-416` 覆盖 unsafe names、directory、legacy directory、external symlink 与 new-wins。
   - 但该 finding 未完全关闭：真实 installed Markdown workflow 没有消费 TS helper，也没有同步同等 HALT 规则；helper 本身仍有首尾空格 basename mismatch。见本轮 Finding #1 与 Finding #2。

### 仍为非阻塞待办

1. Round 2 / Finding #3 — broad legacy-pattern `575` 精确计数缺少可复现命令
   - 维持既有结论：P2 / CR TODO / 非阻塞。本轮不授权修复。

## New Findings（新发现）

### 1. [高][新] Product Brief / PRFAQ installed workflow 未获得 TS route helper 的安全边界

- 来源：blind；aggregator 独立复核
- 分类：patch

- 证据
  - `resolveAnalysisDocumentRoute()` 仅在 `test/analysis-artifact-routing.test.ts:11` 和同文件测试用例中被导入/调用；`rg` 未发现 `src/` runtime、CLI 或 installed Skill activation 调用该 helper。
  - Product Brief workflow 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:76-91` 仍要求手工绑定 `{analysis_artifacts}/product-brief/product-brief-{project_name}.md`、`{analysis_artifacts}/product-brief-{project_name}.md`，并按 “exists” 三步选择。
  - PRFAQ workflow 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:135-150` 采用同样的 Markdown route selection。
  - 两份 workflow 只在 `artifact-roots` 缺失时 HALT（Product Brief `:58-64`，PRFAQ `:49-55`），没有要求 `{project_name}` 是 portable single filename segment，没有要求 candidate 是 project-local regular non-symlink file，也没有 symlink escape / directory / non-file fail-closed 规则。
  - 当前 focused test `test/analysis-artifact-routing.test.ts:435-482` 只断言 workflow 包含 `artifact-roots`、`resolutionMode`、legacy-compatible 和 no-migration 文案；没有断言 installed Markdown workflow 的 safety contract。

- 影响
  - TS helper 安全修复无法保护真实 installed Product Brief / PRFAQ workflow 执行；AI agent 按 Markdown 说明创建或 resume artifact 时，仍可能把 unsafe `{project_name}`、directory/non-file candidate 或 project-boundary symlink 当作合法 path。
  - 这直接破坏 Round 4 Evaluator 授权的 Owner B 边界：project-local、regular non-symlink、fail closed、no-migration/write-in-place。

- 建议
  - 在 Product Brief 与 PRFAQ workflow-details 中同步 helper 等价 contract：先 trim project name；trim 后为空、包含 `/`、`\`、NUL、`.`、`..`、absolute/drive-like shape 时 HALT；new/legacy candidate 必须是 project-local regular non-symlink file；directory、non-file、candidate symlink 或 symlink escape 均 HALT；只有 `ENOENT` 可视为 missing candidate。
  - 增加 installed workflow contract assertions，覆盖 PB/PRFAQ 两份 Markdown 的 portable filename、regular non-symlink、symlink escape / HALT 文案，避免只测 TS helper。

### 2. [中][新] `assertPortableProjectName()` 允许首尾空格通过却用原始值生成 basename

- 来源：edge；aggregator 独立复现
- 分类：patch

- 证据
  - `src/manifest/analysis-artifact-routing.ts:90-103` 用 `const trimmed = projectName.trim()` 判断空值、`.` / `..`、absolute / drive-like shape，但 `src/manifest/analysis-artifact-routing.ts:53-56` 调用校验后仍用原始 `input.projectName` 生成 `mainBasename` 与 `distillateBasename`。
  - 定向复现：`projectName: " alpha "` 返回 `mainArtifact="_speclite-output/planning-artifacts/product-brief/product-brief- alpha .md"`，`distillateArtifact="_speclite-output/planning-artifacts/product-brief/product-brief- alpha -distillate.md"`。
  - Owner 语义已有唯一方向：NFR35a-1 在 `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md:86` 与 SPEC 01 在 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:130` 均要求同一 trim 后非空 project config name 产生稳定 display identifier；安装实现也通过 `trimOrDefault()` 保留 trim 后值，见 `src/config/config-schema.ts:101-104` 与 `src/installer/config-initialization.ts:93-100`。
  - 合法内部空格与 Unicode 当前可通过并应保留：`"alpha beta"` 生成 `prfaq-alpha beta.md`，`"项目A"` 生成 `prfaq-项目A.md`。

- 影响
  - 同一个配置 display name `" alpha "` 与 `"alpha"` 在安装/CommandResult 侧被视为同一 trim 后 identity，但 route helper 会生成不同 artifact basename，导致 resume/discovery 错过既有 `product-brief-alpha.md` / `prfaq-alpha.md`。
  - 该问题不会造成 path escape，但会破坏 Story 11.4 要求的 basename/resume 稳定性，属于 P1 前必须关闭的 bounded patch。

- 建议
  - 让 `assertPortableProjectName()` 返回 `trimmed`，并用该 trimmed 值生成 main/distillate basename；保留内部空格和 Unicode，不做 slugify 或字符集收窄。
  - 补 Product Brief / PRFAQ regression：`" alpha "` 与 `"alpha"` 生成同一 basename；`"alpha beta"` 与 `"项目A"` 保持原样；纯空白继续 fail closed。

## Validation Summary（验证摘要）

- `npx vitest run test/analysis-artifact-routing.test.ts test/resolve-readers.test.ts test/artifact-root-resolution.test.ts --reporter=dot` -> PASS，3 files / 26 tests。
- `npm --silent run dev -- resolve artifact-roots --project-root test/fixtures/fresh-install-empty-project/input --lifecycle fresh` -> PASS，exit `0`，7 roots，`configSources={}`。
- `npm run docs:check` -> PASS，72 Markdown files，5 drafts。
- `npm run build` -> PASS。
- `npm run release:packaging-check` -> PASS，`release/packaging-manifest.json` 与 `dist/packaging-manifest.json` accepted；注意该命令会刷新 packaging manifest 类输出，不应由 Reviewer 作为只读无副作用动作伪装。
- `npm test -- --reporter=dot` -> FAIL，58 files passed / 5 failed，492 passed / 12 failed / 4 todo。12 个失败均为 external untracked `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 与 `.zip` 让 fixed counts 从 core=18/default total=68 变成 core=19/default total=69；不列为 Story 11.4 finding。
- `git diff --check -- <11.4 scoped files>` -> PASS。
- 定向 whitespace repro -> FAIL：`" alpha "` 生成带首尾空格 basename，确认 Finding #2。
- Installed workflow route safety audit -> FAIL：PB/PRFAQ Markdown workflow 未声明 portable filename、regular non-symlink、project-local/symlink HALT，确认 Finding #1。

## Scope Audit（范围审计）

- 本 summary 是本轮唯一新增正式 Reviewer summary；未修改源码、测试、Story、tracker、flow gate、logs、rules 或 TODO。
- 当前 `release/packaging-manifest.json` diff 吸入 external untracked drawer package 与 hash 变化，属于 build/packaging validation 造成或暴露的 workspace side effect / external drift，不作为 Story 11.4 修复授权；不得借本轮修该 drawer、module-help、manifest baseline 或 canonical governance。
- `src/manifest/analysis-artifact-routing.ts` 与 `test/analysis-artifact-routing.test.ts` 当前仍为 Story 11.4 owned diff；本轮仅审查，不修复。
- Round 3 summary/evaluation 继续按 Round 4 provenance recovery 处理为失效，不作为修复授权或 closeout 输入。

## Passed Areas（通过项）

- `resolve artifact-roots` public fresh config-absent path 已可返回 Story 11.1 pure fresh defaults；`resolve config` raw required-layer failure 未被放宽。
- Public resolver docs closed-list 已补齐 `resolve artifact-roots`，四个 active public surfaces 与 CLI 注册面保持一致。
- TS helper 已覆盖 traversal、absolute/drive-like、directory/non-file、external symlink 与 new-first happy path；合法内部空格和 Unicode 不应被拒绝。
- Acceptance Auditor 的 AC1-AC10 happy-path pass 与 Round 2 Finding #3 P2 defer 判断可保留，但不能覆盖本轮两个 route-safety 残留阻塞项。

## Final Verdict（最终结论）

- 结论：不通过
- 阻塞项：Finding #1、Finding #2
- 非阻塞项：Round 2 Finding #3 P2 defer；external drawer count drift
- 是否需要 Evaluator：需要，fresh `bmenhance-cr-02-evaluator 11-4`
- 是否需要 Fixer：需要等待 Evaluator 明确授权后再执行；建议授权范围仅限 Product Brief / PRFAQ workflow safety contract、对应 contract tests、以及 `resolveAnalysisDocumentRoute()` 使用 trimmed project name 生成 basename。
