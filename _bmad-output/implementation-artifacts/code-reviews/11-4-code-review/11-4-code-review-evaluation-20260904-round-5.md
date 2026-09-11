---
Story: 11-4
Round: 5
Date: 2026-09-04
Model Used: GPT-5 Codex (gpt-5)
Review Source: 11-4-code-review-summary-20260904-round-5.md
Review Model: GPT-5 Codex (gpt-5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-4 的第 5 轮 CR 代码审查结果（Round 4 Fixer 后复审）进行独立逐条评估。本轮 Review Source 为 `11-4-code-review-summary-20260904-round-5.md`。Round 3 summary/evaluation 已由 Round 4 provenance recovery 明确失效，本轮不引用其 finding、结论或授权。

Round 4 三项主体修复确认已关闭：fresh config-absent `resolve artifact-roots --lifecycle fresh`、public resolver docs closed-list drift、以及 TS helper 的 traversal / directory / non-file / symlink boundary 已有实现和测试记录。Round 5 Reviewer 提出的两个残留项均有效，且均属于 Story 11.4 / Owner A+B 已授权 contract completion，不需要新的 Owner decision：

1. Product Brief / PRFAQ installed Markdown workflow 没有同步 TS helper 的 portable single filename、project-local、regular non-symlink、symlink escape / HALT 规则；评为 P1 `patch`。
2. `assertPortableProjectName()` 以 trimmed 值校验，却用原始 `projectName` 生成 basename；应使用 trimmed project name 生成 artifact basename，保留内部空格与 Unicode；评为 P1 `patch`。

外部 drawer count / module-help drift、Acceptance build/packaging 副作用仅作为 caveat；不得进入 Fixer。Round 2 Finding #3 继续维持 P2 defer / CR TODO 候选，本轮不授权修复。

## Previous Findings Review（上轮问题回顾确认）

### Round 4 / Finding #1：fresh config-absent public artifact-root resolution：已关闭

Round 4 evaluation 的修复执行记录显示，`resolveArtifactRootsFromProjectConfig()` 已仅在 `lifecycle=fresh` 且 required base `_speclite/config.toml` 为 `ENOENT` 时以 empty config 调用 pure resolver，并保持 malformed、non-file、unreadable、existing missing 与 raw `resolve config` fail-closed 语义（`11-4-code-review-evaluation-20260904-round-4.md:214-219`）。Round 5 reviewer 也复核 public CLI fresh absent case exit `0`、7 roots、`configSources={}`，未重新打开该项。

### Round 4 / Finding #2：public resolver docs closed list：已关闭

Round 4 fix record 限定四个 active public surfaces 已补 `resolve artifact-roots`，并补 bounded contract scan（`11-4-code-review-evaluation-20260904-round-4.md:221-226`）。Round 5 reviewer 未发现 docs closed-list 回归，本项关闭。

### Round 4 / Finding #3：TS route helper path integrity：主体关闭，installed workflow 同步缺口重新打开为本轮 Finding #1

当前 `src/manifest/analysis-artifact-routing.ts:107-128` 对 candidate 执行 project-boundary symlink check、`lstat()` regular file check，并只把 `ENOENT` 视为 missing；`test/analysis-artifact-routing.test.ts:356-416` 覆盖 unsafe names、new/legacy directory、external symlink 与 new-wins precedence。TS helper 主体已关闭。

但 Round 4 授权的 Owner B 语义不仅是测试 helper evidence，也约束真实 installed Product Brief / PRFAQ workflow。两份 Markdown workflow 当前仍只按 `exists` 三步选路，未同步 helper 等价 HALT 规则；该残留作为本轮 Finding #1 继续 P1 patch。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R2-#3 | broad scan `575` 精确计数缺少可复现命令 | CR TODO / P2 / 非阻塞 | 维持 defer；本轮 Fixer 不得借机修 broad evidence governance 或 TODO backlog。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][新] Product Brief / PRFAQ installed workflow 未获得 TS route helper 的安全边界**
> - 来源：blind
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolveAnalysisDocumentRoute()` 只在 `src/manifest/analysis-artifact-routing.ts:46` 定义，并仅由 `test/analysis-artifact-routing.test.ts:11` 及同文件测试调用；`rg -n "resolveAnalysisDocumentRoute" src test assets docs ...` 未发现 runtime、CLI 或 installed Skill Markdown consumer 调用该 helper。也就是说，helper 是 executable evidence / shared contract candidate，不是 Product Brief / PRFAQ installed workflow 的实际执行路径。

真实 installed workflow 仍由 Markdown 指令驱动：

- Product Brief 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:76-91` 绑定 `{analysis_artifacts}/product-brief/product-brief-{project_name}.md` 与 `{analysis_artifacts}/product-brief-{project_name}.md`，并按 `exists` 三步选择。
- PRFAQ 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:135-150` 使用同样的 new subject / legacy root-level / fallback new selection。
- 两份 workflow 只在 artifact-root command non-zero 或 required root missing 时 HALT（Product Brief `:58-64`，PRFAQ `:49-55`），没有声明 `{project_name}` 必须是 portable single filename segment，也没有声明 candidate 必须是 project-local regular non-symlink file，directory、non-file、candidate symlink、symlink escape 或其他 non-`ENOENT` 读取异常必须 HALT。

当前测试也证明文档 contract scan 不足：`test/analysis-artifact-routing.test.ts:435-482` 只断言 workflow 包含 `artifact-roots`、`resolutionMode`、legacy-compatible、new subject exists 与 no-migration 文案；未锁定 portable filename、regular non-symlink、project-local、symlink escape / HALT 等真实 workflow 指令。

**严重性判断：合理，P1**

Story 11.4 的有效执行面是 installed Skill Markdown workflow，而不是 TS helper 自身。若 Product Brief / PRFAQ Agent 只按 Markdown 的 `exists` 规则操作，unsafe `{project_name}`、directory/non-file candidate 或 project-boundary symlink 仍可能被当作可 resume/write artifact。该缺口直接破坏 Owner B 已关闭的 project-local、regular non-symlink、fail closed、no-migration/write-in-place 语义，属于阻塞交付的 runtime contract gap。

**修复建议：可行**

Fixer 可在两份 workflow-details 中同步 TS helper 等价规则，并补 installed workflow contract assertions。精确语义如下：

1. 先 trim `{project_name}`；trim 后为空、包含 `/`、`\`、NUL、`.`、`..`、absolute path 或 drive-like shape 时 HALT。
2. `{project_name}` 仅作为 single filename segment，不做 slash normalization，不做 slugify，不收窄合法内部空格或 Unicode。
3. new subject candidate 与 legacy root-level candidate 都必须 stay inside `{project-root}`，且 existing candidate 必须是 regular non-symlink file。
4. directory、non-file、candidate symlink、symlink escape、unreadable 或其他非 `ENOENT` 读取异常均 HALT；只有 `ENOENT` 可视为 missing candidate。
5. 保持 Owner B precedence：new subject existing regular file 优先；仅 `legacy-compatible` 且 new missing、legacy valid regular file 时使用 legacy；两者均 missing 时创建 new subject path；distillate/stage/verdict 等 related artifacts 跟随 selected main directory；不得 migration/copy/delete/rename/rewrite。

允许修改文件仅限：

- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md`
- `test/analysis-artifact-routing.test.ts`

**误报评估：非误报**

TS helper 安全检查已存在不等于 installed Markdown workflow 消费它；Reviewer 的 finding 指向真实执行链断层，证据充分。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[中][新] `assertPortableProjectName()` 允许首尾空格通过却用原始值生成 basename**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

当前 helper 在 `src/manifest/analysis-artifact-routing.ts:90-103` 计算 `const trimmed = projectName.trim()`，并以 trimmed 值判断空字符串、`.` / `..`、absolute path 与 drive-like shape；但 `resolveAnalysisDocumentRoute()` 在 `src/manifest/analysis-artifact-routing.ts:53-56` 仅调用校验函数，随后仍使用原始 `input.projectName` 拼接 `mainBasename` 与 `distillateBasename`。因此 `" alpha "` 通过校验后会生成 `product-brief- alpha .md` / `product-brief- alpha -distillate.md`，而不是与 `"alpha"` 对齐。

现有 owner / contract 已足够决定使用 trimmed 值生成 basename，不需要请求用户：

- PRD NFR35a-1 明确同一 trim 后非空 project config 项目名称应产生相同 `targetProject`，且 MVP 不得通过 slugify、字符集限制或长度改写改变显示标识（`_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md:83-87`）。
- SPEC 01 定义 `targetProject` 是 stable display identifier；存在 trimmed non-empty project config name 时必须使用它，不得是 slugified id（`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:128-130`）。
- 安装实现 `trimOrDefault()` 返回 trim 后非空值（`src/config/config-schema.ts:101-104`），`initializeConfig()` 对 `core.project_name` 使用该 helper（`src/installer/config-initialization.ts:93-100`）。

上述语义比“首尾空格 fail closed”更贴近现有产品 contract：首尾空格是配置输入 normalization；内部空格和 Unicode 是合法 display identity，不能额外收窄。

**严重性判断：原始“中”偏低，评估后为 P1**

单看 path escape 风险不高，但它会让同一 trim 后 project identity 在 install / CommandResult 与 artifact route helper 之间产生不同 basename，导致 Product Brief / PRFAQ resume/discovery 错过已有 `product-brief-alpha.md` / `prfaq-alpha.md`，并产生看似重复但实际只差首尾空格的 workflow artifact。Story 11.4 明确要求保留 basename/resume 行为；这是 bounded runtime contract 缺陷，阻塞交付。

**修复建议：可行**

Fixer 应让 project name 校验 helper 返回 trimmed name，并用该 trimmed name 生成 `mainBasename` 与 `distillateBasename`。精确语义：

- `" alpha "` 与 `"alpha"` 生成同一 basename。
- `"alpha beta"` 保留内部空格，生成 `product-brief-alpha beta.md` / `prfaq-alpha beta.md`。
- `"项目A"` 保留 Unicode，生成 `product-brief-项目A.md` / `prfaq-项目A.md`。
- `""`、纯空白、`.`、`..`、包含 `/`、`\`、NUL、absolute path、drive-like shape 继续 fail closed。
- 不做 slugify，不做 Unicode transliteration，不做长度或字符集收窄。

允许修改文件仅限：

- `src/manifest/analysis-artifact-routing.ts`
- `test/analysis-artifact-routing.test.ts`

**误报评估：非误报**

代码路径直接显示校验值和生成值不一致；owner artifacts 对 trim 后 identity 的方向明确，因此无需 `decision_needed`。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 分类 | 说明 |
|---|------|----------|-----------|------|------|
| 1 | PB/PRFAQ installed workflow 未同步 route safety contract | [高] | **P1** | `patch` | TS helper 安全检查未进入真实 installed Markdown 执行链。 |
| 2 | trimmed 校验与原始 basename 生成不一致 | [中] | **P1** | `patch` | 同一 trim 后 project identity 会生成不同 artifact basename，破坏 resume/discovery 稳定性。 |

### CR TODO Tracking（建议纳入 CR TODO，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R2-#3 | broad scan `575` 缺少可复现命令 | [低] | **P2** | 维持 defer；本轮 Fixer 不得处理。 |

### Ignorable / Unrelated（可忽略或无关）

| # | 项目 | 处理理由 |
|---|------|---------|
| - | external drawer count / module-help drift | Story 11.4 外部 mixed-worktree caveat；不得授权 drawer、module-help、fixed count baseline、manifest 或 canonical governance 修复。 |
| - | Acceptance build / packaging side effect | 仅为 Reviewer 流程 caveat；不得纳入 Story finding 或 Fixer 范围。 |
| - | Round 3 summary/evaluation | provenance invalid；不得引用为授权或 closeout 输入。 |

### Exact Fixer Authorization（精确 Fixer 授权）

Fresh Fixer 仅获授权处理以下范围：

1. 在 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md` 与 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md` 中补齐 installed workflow route safety contract：trim 后 project name、portable single filename segment、project-local regular non-symlink existing candidate、symlink escape / directory / non-file / non-`ENOENT` HALT，以及 Owner B new-first / legacy-compatible-only / no-migration / related artifacts co-location 语义。
2. 在 `src/manifest/analysis-artifact-routing.ts` 中让校验 helper 返回 trimmed project name，并用 trimmed name 生成 Product Brief / PRFAQ main 与 distillate basename；继续保留内部空格与 Unicode，继续拒绝空白、path separator、NUL、`.`、`..`、absolute / drive-like shape。
3. 在 `test/analysis-artifact-routing.test.ts` 中补最小 focused assertions：两份 installed workflow Markdown 包含 portable filename、regular non-symlink、project-local/symlink escape/HALT 规则；`" alpha "` 与 `"alpha"` 生成同一 basename；内部空格与 Unicode 保留；纯空白继续 fail closed。

本授权不包括：Story/tracker/flow gate 状态改写，CR04/CR05/CR06，Round 2 #3 P2 TODO 修复，外部 drawer 文件、module-help、manifest、fixed count baseline 或 canonical governance，Acceptance build/packaging 副作用处理，任何 11.5+ routing 或 migration policy，commit 或 push。Fixer 完成后必须进入 fresh Reviewer replacement 与 fresh Evaluator；不得凭本 evaluation 直接 closeout。

### Evaluation Decision（评估决定）

- **Finding #1**：有效，P1 `patch`；不需要 Owner decision。
- **Finding #2**：有效，P1 `patch`；裁定使用 trimmed project name 生成 basename，保留内部空格与 Unicode，不采用首尾空格 fail closed；不需要 Owner decision。
- **Round 4 主体三项**：确认关闭；仅 Finding #1 对真实 installed workflow 的同步缺口作为新 P1 继续。
- **Round 2 Finding #3**：继续 P2 defer / CR TODO 候选，本轮不授权修。
- **Overall Verdict**：`FIX_REQUIRED`。两个 P1 完成并经 fresh Reviewer/Evaluator 通过前，Story 11.4 不得进入 CR04、CR05 或 CR06。

## Fix Execution Record（修复执行记录）

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5 Codex
- **Fix Items**: 2

#### Fix Item #1：PB/PRFAQ installed workflow route safety contract

- **Status**: Completed
- **Files Modified**:
  - `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md`
  - `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md`
- **Change Summary**: 两份 installed workflow 的 artifact route selection 已同步 executable safety contract：先 trim `{project_name}`，要求 trimmed value 是 portable single filename segment；保留内部空格与 Unicode；禁止 slugify、slash normalization、transliteration；candidate 必须保持 project-local；existing candidate 必须是 regular non-symlink file；directory、non-file、symlink、symlink escape、unreadable candidate 或任何 non-`ENOENT` error 均 HALT；只有 `ENOENT` 表示 missing。保留 new-first、`legacy-compatible` only、neither=>new、related artifacts co-location 与 no migration/copy/delete/rename/rewrite 语义。

#### Fix Item #2：trimmed project name basename generation

- **Status**: Completed
- **Files Modified**:
  - `src/manifest/analysis-artifact-routing.ts`
  - `test/analysis-artifact-routing.test.ts`
- **Change Summary**: `assertPortableProjectName()` 现在返回 trimmed project name；`resolveAnalysisDocumentRoute()` 使用该 trimmed value 生成 Product Brief / PRFAQ `mainBasename` 与 `distillateBasename`。现有 empty、separator、NUL、`.`、`..`、absolute、drive-like 输入继续 fail closed；合法内部空格与 Unicode 继续原样保留。测试补充 `" alpha "` 与 `"alpha"` basename 对齐、内部空格与 Unicode 保留，以及两份 installed workflow Markdown 的 portable filename / regular non-symlink / project-local / symlink escape / HALT / `ENOENT` contract assertions。

#### Verification（验证）

- `npm test -- test/analysis-artifact-routing.test.ts`：PASS，1 file / 9 tests。
- Targeted workflow contract scan：PASS，PB/PRFAQ workflow 与 focused tests 均命中 portable filename、regular non-symlink、project-local、symlink escape、`ENOENT` missing、resume/write/migration 前 HALT、no migration/copy/delete/rename/rewrite 文案。
- `git diff --check -- assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md src/manifest/analysis-artifact-routing.ts test/analysis-artifact-routing.test.ts`：PASS。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`：PASS，`status: ok`，`findings: []`。

#### Scope Notes（范围说明）

- 未修改 Story、tracker、flow gates、CR rules、TODO backlog、external drawer、release manifest、module-help、其它 docs/Skill、Round 2 Finding #3、CR04/CR05/CR06。
- 未运行 build、full test、release packaging check 或 packaging 相关命令，避免触发本轮未授权副作用；这些保持为后续 release verification / fresh Reviewer-Evaluator 后的残余验证项。
