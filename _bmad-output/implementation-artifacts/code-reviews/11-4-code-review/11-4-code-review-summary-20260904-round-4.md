---
Story: 11-4
Round: 4
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮是 Story 11.4 Reviewer replacement 复审。外层编排已完成三个相互独立的 fresh GPT-5.5 只读审查层，随后由本聚合 Reviewer 独立复现和裁决候选。Owner A+B 的 existing-install 主路径与 Analysis producer happy paths 继续通过，但新增 public `resolve artifact-roots` surface 的 fresh lifecycle、公开 resolver 文档一致性，以及 Product Brief / PRFAQ shared route helper 的 path/file boundary 仍有 3 项真实 `patch` finding。因此本轮不通过，必须进入 fresh Evaluator；不得直接 Fixer、CR04、CR05 或 CR06。

审查层 provenance：

- Blind Hunter：完成；报告 fresh empty project 的 `--lifecycle fresh` CLI failure，以及 README / explanation / glossary 仍只列 `resolve config` 与 `resolve customization` 的 stale public resolver description。
- Edge Case Hunter：完成；报告 unsafe `projectName`、directory/non-file candidate 与 symlink escape 三类未防护边界。
- Acceptance Auditor：完成；结论为 `PASS_WITH_LOW_DEFER`，AC1–AC10 与 Owner A+B 已覆盖的主路径通过，Round 2 Finding #3 维持 P2 defer；full/canonical 红色仅来自外部 untracked `speclite-drawer-er-modeler` drift。

`11-4-code-review-summary-20260904-round-3.md` 与 `11-4-code-review-evaluation-20260904-round-3.md` 来自另一并发证据流：其 summary 声称 Acceptance Auditor 不可用且按 2/3 层聚合，并使用了与本次正式 Blind layer 不同的 finding set。二者 provenance 与本次三层证据不一致，明确标记为 concurrent invalid provenance，不得作为本轮修复授权或 closeout 依据。本文件不覆盖、改写或追认该失效产物。

## Previous Findings Review（上轮问题回顾）

### 已关闭的主路径

1. Round 2 / Finding #1 — Analysis Skill runtime config 消费路径未接入 Story 11.1 resolver
   - Existing-install 主路径已关闭：`resolve config` 保持 raw merged-config 语义，五个 Analysis producer guidance 改为消费独立 `resolve artifact-roots` surface；legacy-compatible resolver-backed root 有聚焦测试支撑。
   - 但新 public surface 的 fresh config-absent 路径未关闭，见本轮 Finding #1；因此不能把整个 public command contract 标记为完全修复。

2. Round 2 / Finding #2 — Product Brief / PRFAQ existing-install fallback 会错过旧 root-level artifact
   - Owner B 的主体 policy 已关闭：仅 `legacy-compatible` 启用 legacy root-level discovery，new subject 优先，legacy-only 原地 resume/write，related artifacts 跟随 selected main directory。
   - 本轮 Finding #3 是新增 shared helper 的 path/file boundary 缺口，不否定上述 precedence 主路径，但会阻塞其安全交付。

### 仍为非阻塞待办

1. Round 2 / Finding #3 — broad legacy-pattern `575` 精确计数缺少可复现命令
   - 维持既有结论：P2 / CR TODO / evidence hygiene，不混入本轮 P1 修复。

## New Findings（新发现）

### 1. [高][新] `resolve artifact-roots --lifecycle fresh` 无法解析尚无 config 的 fresh project

- **来源**：blind；聚合 Reviewer 已独立复现
- **分类**：patch

- **证据**
  - `src/commands/resolve.ts:154-157` 对 `existing` 与 `fresh` 一律调用 `resolveArtifactRootsFromProjectConfig()`。
  - `src/config/artifact-root-resolver.ts:195-220` 先调用 `resolveProjectConfig()`；`src/config/config-reader.ts:21-27` 又把 `_speclite/config.toml` 声明为 required layer，缺失时在进入 pure fresh resolver 前失败。
  - 定向复现：`npm run dev -- resolve artifact-roots --project-root test/fixtures/fresh-install-empty-project/input --lifecycle fresh` 实际 exit code 为 `1`，stderr 为 `runtime-path.missing-entry`，`affectedPath="_speclite/config.toml"`，stdout 没有七个 fresh-default roots。
  - Story 11.1 AC2 在 `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:22-38` 明确要求 fresh config 尚不存在时 resolver 返回七个 `fresh-default` roots；`test/artifact-root-resolution.test.ts:13-78` 也证明 pure `resolveArtifactRoots({ lifecycle: "fresh" })` 可在不读写 config 的情况下完成。

- **影响**
  - 新增 public command 宣称支持 `--lifecycle fresh`，但在其核心 fresh-config-absent 场景不可用；fresh install、fixture 或 installed workflow consumer 无法经 Owner A 选择的唯一 public surface 获得 canonical fresh roots。
  - 现有 34-test focused set只覆盖 existing/legacy CLI 与 pure resolver fresh path，没有覆盖两者的 public CLI 组合，因而产生假绿。

- **建议**
  - 让 `artifact-roots --lifecycle fresh` 在 base config 不存在时直接使用 Story 11.1 pure resolver defaults；若 config 存在，则仍应读取合法的 fresh explicit overrides 与 provenance。
  - 增加 CLI regression：fresh empty project、fresh config present、malformed required config，以及 existing missing config，确保只放宽受契约授权的 fresh-config-absent 路径。

### 2. [中][新] Public resolver 文档仍把 Node CLI command set 固定为 `config` 与 `customization`

- **来源**：blind；聚合 Reviewer 已独立复核
- **分类**：patch

- **证据**
  - `README.md:146-153` 的 command table 未列 `speclite resolve artifact-roots`，并声称已安装 Skills 的唯一默认 resolver 是 `resolve config` 与 `resolve customization`。
  - `docs/explanation/local-first-control-plane.md:48-52` 与 `docs/explanation/runtime-boundaries.md:60` 重复同一两-command closed list。
  - `docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md:13-14` 虽把 `speclite resolve` 定义为唯一 default entry，却仍把 Node CLI resolver 定义为仅由 `config` 与 `customization` commands 组成。
  - 与之相对，`docs/reference/config-and-customization.md:83-103`、SPEC 01 与 SPEC 09 已把 `resolve artifact-roots` 定义为 installed Skill 消费 effective artifact roots 的 public runtime support surface。

- **影响**
  - 公开入口文档与 owning contracts/Analysis activation guidance 冲突；维护者或 installed Skill author 可能继续把 effective artifact roots 误归入 raw `resolve config`，重新引入 Round 2 Finding #1 的错误消费模式。
  - Story 11.4 AC5 要求同步治理文档且不遗留冲突 active defaults，因此不能作为纯措辞优化忽略。

- **建议**
  - 在上述 public explanation / glossary surfaces 中加入 `resolve artifact-roots`，同时保留“唯一默认 entry 是 Node CLI `speclite resolve`、Python scripts 仅 compatibility asset”的原边界。
  - 增加文档 contract scan，避免未来 public resolver command list 与 CLI 注册面再次漂移。

### 3. [中][新] `resolveAnalysisDocumentRoute()` 未约束 basename、artifact 类型与 symlink boundary

- **来源**：edge；聚合 Reviewer 已独立复核并合并三个同一 helper boundary 候选
- **分类**：patch

- **证据**
  - Unsafe basename：`src/manifest/analysis-artifact-routing.ts:48-53` 直接把 `projectName` 插入 `mainBasename` / `distillateBasename` 后交给 `path.posix.join()`；多段 `../`、separator 或 drive-like input 可改变预期 subject path 结构，Windows 下反斜杠还会成为 native separator。
  - Directory/non-file：`src/manifest/analysis-artifact-routing.ts:85-94` 只用 `access()` 判断 candidate 是否存在，不确认其为 regular file；可访问 directory 或其他 non-file 会被当成可 resume main artifact。
  - Symlink escape：同一 `access()` 检查会跟随 symlink，未调用 `findProjectBoundarySymlinkEscape()` 或等价 project-local guard；指向 project root 外的 candidate 仍可能被选中。
  - `test/analysis-artifact-routing.test.ts:236-354` 仅覆盖 legacy-only、new-only、both、neither 与 explicit mode precedence；未覆盖 unsafe `projectName`、directory、non-file 或 symlink escape。

- **影响**
  - Product Brief / PRFAQ main artifact 可能偏离 selected subject directory，或把不可安全写入的 directory/non-file/out-of-project symlink 当成既有 artifact，破坏 Owner B 的 keep-in-place、no-migration 与 selected-main-directory contract。

- **建议**
  - 对 `{project_name}` 生成的 basename 做 fail-closed validation 或有明确 contract 的 deterministic safe-basename normalization；至少处理空值、path separators、traversal 与 absolute/drive-like shape。
  - 只有 project-local regular file 才能作为 existing resume candidate；用 `lstat()` 与 project-boundary symlink guard 拒绝 directory、non-file 和 escape symlink，并补齐四类 regression。

## Verification Summary（验证摘要）

- `npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/contract-anchors.test.ts test/cli-message-catalog.test.ts --reporter=dot` -> ✅ 5 files / 34 tests passed。
- 定向 fresh CLI reproduction -> ❌ exit `1`，缺 `_speclite/config.toml`；确认 Finding #1。
- Public docs exact-line audit -> ❌ 四个 surfaces 仍为 stale two-command list；确认 Finding #2。
- Route helper source/test matrix audit -> ❌ unsafe basename、directory/non-file 与 symlink boundary 未防护/未测试；确认 Finding #3。
- Acceptance Auditor evidence：focused CLI 2 files / 20 tests、docs/build/packaging/diff 均通过；AC1–AC10 exercised happy paths 为 `PASS_WITH_LOW_DEFER`。
- Full/canonical 当前非全绿仅因外部 untracked `assets/source/speclite/core-skills/speclite-drawer-er-modeler*` 改变 fixed counts 并缺 core module-help row。该 drift 不属于 Story 11.4，不进入本轮 finding、不授权修改或治理，仅作为 mixed-worktree caveat。
- `git diff --check` -> ✅ PASS。

## Passed Areas（通过项）

- Owner Decision A 的 existing-install behavior 持续有效：raw `resolve config --key modules.sdlc.analysis_artifacts` 未被 synthetic fallback 污染，独立 `resolve artifact-roots` 能在 config-present existing lifecycle 输出 resolver-backed root、mode 与 provenance。
- Owner Decision B 的 precedence happy paths持续有效：new subject 优先、legacy-compatible legacy-only 原地选择、explicit mode 禁用 legacy discovery、related artifacts 跟随 selected main directory。
- 五个 Analysis producer guidance 已统一消费 `speclite resolve artifact-roots --project-root {project-root}`；未发现重新手写 fallback 的 active route。
- Acceptance Auditor 未发现额外 AC1–AC10 主路径失败；Round 2 Finding #3 保持 P2 defer。

## Final Verdict（最终结论）

- **结论：不通过**
- **阻塞项**：Finding #1、Finding #2、Finding #3
- **非阻塞项**：Round 2 Finding #3（P2 / CR TODO）；外部 drawer worktree drift（unrelated caveat）
- **失效产物**：Round 3 summary/evaluation 因 concurrent invalid provenance 不得作为授权依据
- **下一步**：启动 fresh `bmenhance-cr-02-evaluator 11-4`，逐项裁定三个 Story-owned findings；Evaluator 明确授权前不得执行 Fixer。
