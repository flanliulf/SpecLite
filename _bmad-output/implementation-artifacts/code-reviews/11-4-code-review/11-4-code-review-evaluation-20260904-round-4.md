---
Story: 11-4
Round: 4
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-4-code-review-summary-20260904-round-4.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-4 的第 4 轮 CR 代码审查结果（复审）进行独立逐条评估。本轮唯一 Review Source 为 `11-4-code-review-summary-20260904-round-4.md`；Round 3 summary/evaluation 因 concurrent invalid provenance 明确失效，未被用于 finding 复现、修复授权或 canonical governance 判断。

三项 finding 均经当前源码、测试、Story/SPEC 与定向运行证据确认有效，均属于已有 Owner A+B 决策内可直接执行的 bounded patch，不需要再次请求 Owner decision：

1. fresh config-absent failure 是 Story 11.4 新增 public `resolve artifact-roots` surface 的接线缺陷，而不是 Story 11.1 pure resolver 本身失效；评为 P1 `patch`。
2. README / explanation / glossary 的 two-command closed list 与新 public surface 及 Story 11.4 AC5 冲突；评为 P1 `patch`。
3. `resolveAnalysisDocumentRoute()` 对 basename、candidate file type 与 symlink boundary 未 fail closed，会破坏 Owner B 的安全选路；评为 P1 `patch`。

外部 untracked `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 与 `.zip` 仅记为 unrelated mixed-worktree caveat，不属于 Story 11.4 finding，也不授权本轮 Fixer 修改、补登记或执行 canonical governance。Round 2 Finding #3（broad scan `575` 可复现性）继续保持 P2 defer / CR TODO，不混入本轮 P1 patch。

## Previous Findings Review（上轮问题回顾确认）

### Round 3 产物：失效，不作为输入

`11-4-code-review-summary-20260904-round-3.md` 与 `11-4-code-review-evaluation-20260904-round-3.md` 的 provenance 已由正式 Round 4 Reviewer 判定为 concurrent invalid provenance。本评估不沿用其中任何 finding、结论、Fixer 授权或 canonical governance 授权。

### Round 2 Owner A+B 主决策：仍有效

- Owner A 已授权：`resolve config` 保持 raw merged-config 语义；effective artifact roots 由独立 machine-readable `resolve artifact-roots` surface 提供。
- Owner B 已授权：仅 `legacy-compatible` 启用 legacy root-level discovery；new subject regular artifact 优先；仅 legacy regular artifact 存在时原地 resume/write；两者均不存在时选择 new subject path；related artifacts 跟随 selected main directory；禁止 migration/copy/delete/rename/rewrite。
- 本轮三个 finding 都是上述已授权方向的 contract completion 与安全边界，不引入新的产品策略分叉。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R2-#3 | broad scan `575` 精确计数缺少可复现命令 | CR TODO / P2 / 非阻塞 | 维持 defer；本轮 Fixer 不得借机改写 broad evidence governance。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][新] `resolve artifact-roots --lifecycle fresh` 无法解析尚无 config 的 fresh project**
> - 来源：blind
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确，但需校正归属**

`src/commands/resolve.ts:124-157` 对 `fresh` 与 `existing` 都调用 `resolveArtifactRootsFromProjectConfig()`；后者在 `src/config/artifact-root-resolver.ts:195-207` 无条件先调用 `resolveProjectConfig()`。`src/config/config-reader.ts:17-27` 又把 `_speclite/config.toml` 固定为 required layer，因此 fresh config 尚不存在时，在进入 pure artifact-root resolution 前即返回失败。

独立执行：

```text
npm run dev -- resolve artifact-roots --project-root test/fixtures/fresh-install-empty-project/input --lifecycle fresh
```

实际 stdout 为空，stderr 为 `runtime-path.missing-entry`，`affectedPath="_speclite/config.toml"`，进程失败；没有返回七个 roots。

与此同时，`src/config/artifact-root-resolver.ts:133-193` 的 pure `resolveArtifactRoots()` 支持省略 config；`test/artifact-root-resolution.test.ts:13-78` 已证明它在空目录中返回七个 `fresh-default` roots且不读写 config。这与 Story 11.1 AC2（`_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:22-38`）一致。因此，Story 11.1 的 resolver core 没有回归；真实缺陷是 Story 11.4 为落实 Owner A 新增 public CLI 后，没有把 `fresh + base-config absent` 映射到该 pure resolver contract。

**严重性判断：合理**

该 command 显式公开 `--lifecycle fresh`（`src/commands/resolve.ts:125-130`），却无法完成 fresh lifecycle 的核心前置场景；这是 public runtime support contract 的功能缺陷，会让 installed workflow/fixture consumer 得到假失败，故 P1 阻塞交付合理。

**修复建议：可行，已有 Owner A 与 Story 11.1 契约充分授权**

Fixer 应仅放宽 `lifecycle=fresh` 且 required base config 确实 `ENOENT` 的路径：直接以 empty config 调用 Story 11.1 pure resolver，返回七个 `fresh-default` roots及空 `configSources`。不得把所有 config errors 吞掉，也不得改变 `resolve config` 的 required-layer/raw semantics。

必须锁定以下 public CLI matrix：

- fresh + base config absent -> exit 0，七个 fresh defaults，`configSources={}`；
- fresh + valid config present -> 继续合并合法 layers，explicit fields 为 `explicit-config`，其余为 fresh defaults；
- fresh + malformed/unreadable/non-file base config -> 保持 fail closed，不降级为空 config；
- existing + base config absent -> 保持当前 required-layer failure；
- `resolve config` 行为完全不变。

**误报评估：非误报**

Reviewer 的运行复现与代码路径一致；仅需把责任边界从“Story 11.1 resolver 失败”精确表述为“Story 11.4 public integration 未覆盖 Story 11.1 fresh-config-absent contract”。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[中][新] Public resolver 文档仍把 Node CLI command set 固定为 `config` 与 `customization`**
> - 来源：blind
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

当前 active public surfaces 存在同一 closed-list drift：

- `README.md:146-153` 的 command table 不含 `resolve artifact-roots`，并把唯一默认 resolver 写成 `resolve config` + `resolve customization`；
- `docs/explanation/local-first-control-plane.md:48-52` 重复 two-command runtime support / activation list；
- `docs/explanation/runtime-boundaries.md:60` 重复 two-command default resolver list；
- `docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md:13-14` 虽保留唯一 entry `speclite resolve`，但把 Node CLI resolver 定义成仅两个 subcommands。

而 `docs/reference/cli.md:198-214`、`docs/reference/config-and-customization.md:83-103`、SPEC 01 与 SPEC 09 已把 `resolve artifact-roots` 定义为独立 public support surface。Story 11.4 AC5（Story 文件 `:17`）要求同步所有受影响治理文档且不遗留冲突 active defaults。由于 public command 是本 Story 为 Owner A 引入，四处 stale closed list 即为 Story-owned documentation contract gap；不能以它们在候选前已存在为由排除更新责任。

**严重性判断：原始“中”不足以表达交付门禁，评估后为 P1**

单看文字影响可为中等，但这里的文档直接定义 installed Skill 唯一默认 activation resolver。stale list 会诱导维护者继续用 raw `resolve config` 获取 effective roots，重新制造 Round 2 #1。它同时直接违反 AC5 的 no-conflicting-active-defaults，因此应作为 P1 quality gate patch，而非 P2 文案优化。

**修复建议：可行，无需 Owner decision**

Fixer 可只在上述四个 active public surfaces 中加入 `resolve artifact-roots`，并保持以下既有边界不变：唯一默认 entry 仍是 Node CLI `speclite resolve`；`resolve config` 仍是 raw merged config；Python `resolve_*.py` 仍仅是 compatibility/migration/troubleshooting assets。补一个 bounded docs/contract assertion，确保公开 resolver command list 与 CLI 注册面不再遗漏 `artifact-roots`。

**误报评估：非误报**

四处 exact-line evidence 与已更新 reference/owning contracts 形成直接冲突，且属于 AC5 明示范围。

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[中][新] `resolveAnalysisDocumentRoute()` 未约束 basename、artifact 类型与 symlink boundary**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`src/manifest/analysis-artifact-routing.ts:48-58` 直接把 `projectName` 拼入 basename，再以 `path.posix.join()` 生成候选；`src/manifest/analysis-artifact-routing.ts:85-94` 仅以 `access()` 判断存在性。当前没有 portable filename-segment validation、regular-file check 或 project-boundary symlink guard。

独立定向复现得到：

- `projectName="../../../outside"` -> `mainArtifact="analysis/outside.md"`；
- `projectName="../../../../outside"` -> `mainArtifact="outside.md"`，已经逃离 `analysisRoot`；
- legacy candidate 是 directory 时仍被选择为 `legacy-root-level`；
- legacy candidate 是指向 project root 外现存文件的 symlink 时仍被选择为 `legacy-root-level`。

Windows separator / drive-like 输入也没有 portable guard：当前 POSIX host 会保留 `\\` 字符，但相同值在 Windows native `path.join()` existence check 中具有 separator 语义。`test/analysis-artifact-routing.test.ts:236-354` 只覆盖 legacy-only/new-only/both/neither/explicit-mode happy paths，没有上述边界 regression。

**严重性判断：原始“中”不足以表达 path-integrity 影响，评估后为 P1**

该 helper 是 Owner B compatibility policy 的 executable contract evidence。它可返回 analysis root 外路径，或把不可安全 resume/write 的 directory、non-file、escape symlink 认作 existing artifact，直接破坏 basename preservation、project-local、new-first 与 no-migration/write-in-place 边界。属于功能与 path-integrity 缺陷，P1 阻塞合理。

**修复建议：可行，Owner B 已足够授权**

最小 Fixer 语义应明确为：

1. `projectName` 只作为单个 portable filename segment 使用；对 trim 后空值、`/`、`\\`、NUL、traversal/absolute/drive-like shape fail closed。不得静默 normalize 成另一个名称，因为 Owner B 要求保留既有 basename identity。
2. 对 new-subject 与启用的 legacy candidate 都先做 project-relative/path-boundary 校验；project root 外 symlink 必须 fail closed。
3. existing resume candidate 只有在 project-local 且 `lstat().isFile()` 为真时才算存在。`ENOENT` 才是 missing candidate；directory、FIFO/socket/device、candidate symlink 或其他 non-regular existing entry 均 fail closed，而不是静默当作可写目标。
4. 保持 Owner B precedence：valid new regular file 优先；仅 `legacy-compatible` 且 new missing、legacy valid regular file 时选择 legacy；两者均 `ENOENT` 时返回 new subject target；related artifacts 始终跟随 selected main directory；不得 migration/copy/delete/rename/rewrite。
5. 对 Product Brief 与 PRFAQ 补齐 unsafe name、new/legacy directory、non-file、escape symlink、valid regular files 与 neither-missing regression；验证失败发生在任何 write/migration 之前。

上述修复可以复用 `src/fs/path-normalizer.ts:64-138` 的 project-relative normalization / `findProjectBoundarySymlinkEscape()` 语义，并用 `lstat()` 区分 regular file；无需发明新的 routing policy或请求 Owner 再裁决。

**误报评估：非误报**

Reviewer 的三个 boundary 子项均可独立复现；它们共享同一 candidate classification 缺口，合并为一个 P1 patch 合理。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 分类 | 说明 |
|---|------|----------|-----------|------|------|
| 1 | fresh config-absent public artifact-root resolution 失败 | [高] | **P1** | `patch` | Story 11.4 public integration 未接通 Story 11.1 已有 pure fresh resolver。 |
| 2 | public resolver docs 仍为 stale two-command list | [中] | **P1** | `patch` | 违反 Story 11.4 AC5，并可能让 consumer 回退 raw config 错误路径。 |
| 3 | Analysis document route 缺 basename/file/symlink 边界 | [中] | **P1** | `patch` | 可逃离 analysis root 或选择非安全 existing candidate，破坏 Owner B。 |

### CR TODO Tracking（建议纳入 CR TODO，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R2-#3 | broad scan `575` 缺少可复现命令 | [低] | **P2** | 维持既有 defer；不属于本轮 Fixer。 |

### Ignorable / Unrelated（可忽略或无关）

| # | 项目 | 处理理由 |
|---|------|---------|
| - | external untracked `speclite-drawer-er-modeler` drift | 非 Story 11.4 改动；仅 mixed-worktree caveat，不授权 Fixer、module-help/manifest 补丁或 canonical governance。 |
| - | Round 3 summary/evaluation | concurrent invalid provenance；不得用于本轮修复或 closeout。 |

### Exact Fixer Authorization（精确 Fixer 授权）

Fresh Fixer 仅获授权处理以下范围：

1. 在 `src/config/artifact-root-resolver.ts` / 必要的 `src/commands/resolve.ts` 与 focused tests 中，补齐 `fresh + required base config ENOENT` public resolution，同时保持 malformed/non-file/unreadable、existing missing 与 raw `resolve config` fail-closed/既有语义。
2. 仅更新 `README.md`、`docs/explanation/local-first-control-plane.md`、`docs/explanation/runtime-boundaries.md`、`docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md` 的 resolver command list，并添加最小 contract scan；不得借机重写无关文档结构。
3. 仅在 `src/manifest/analysis-artifact-routing.ts` 与 focused routing tests 中加入 portable basename fail-closed、project-boundary guard 和 regular-file candidate classification，并严格保持 Owner B precedence、related-output co-location 与 no-migration policy。

本授权不包括：Story/tracker/flow gate 状态改写，CR04/CR05/CR06，Round 2 #3 P2 TODO 修复，外部 drawer 文件及其 `module-help.csv`/manifest/governance，任何其他 canonical source 重构，commit 或 push。Fixer 完成后必须进入 fresh Reviewer replacement，不得凭本 evaluation 直接 closeout。

### Evaluation Decision（评估决定）

- **Finding #1**：有效，P1 `patch`；不需要 Owner decision。
- **Finding #2**：有效，P1 `patch`；属于 Story-owned documentation contract patch，不需要 Owner decision。
- **Finding #3**：有效，P1 `patch`；按 portable basename fail-closed + project-local regular-file candidate 语义修复，不需要 Owner decision。
- **Overall Verdict**：`FIX_REQUIRED`。三项 P1 完成并经 fresh Reviewer/Evaluator 通过前，Story 11.4 不得进入 CR04、CR05 或 CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 3

#### Finding #1：fresh config-absent public artifact-root resolution

- **Result**: 已修复。
- **Files**: `src/config/artifact-root-resolver.ts`、`test/artifact-root-resolution.test.ts`、`test/resolve-readers.test.ts`。
- **Change**: `resolveArtifactRootsFromProjectConfig()` 仅在 `lifecycle=fresh`、project root 为现存目录且 required base `_speclite/config.toml` 经 `lstat()` 确认 `ENOENT` 时，以 empty config 调用 Story 11.1 pure resolver，并显式返回空 `configSources`。base config 现存、dangling symlink、malformed、non-file、unreadable 或 project root 不存在时仍交由 required config reader fail closed；`existing` 与 `resolve config` 路径未放宽。
- **Evidence**: public CLI 的 fresh absent case exit `0`，返回 7 个 `fresh-default` roots 与 `{}` configSources；fresh valid config 继续返回 explicit/default 混合 roots 与 provenance；existing absent 与 raw config absent 均 exit `1`。聚焦测试覆盖 absent、valid、malformed、directory、dangling symlink 与 missing project root。

#### Finding #2：public resolver docs closed list

- **Result**: 已修复。
- **Files**: `README.md`、`docs/explanation/local-first-control-plane.md`、`docs/explanation/runtime-boundaries.md`、`docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md`、`test/analysis-artifact-routing.test.ts`。
- **Change**: 四个获批 active public surfaces 的 Node CLI resolver command list 均加入 `resolve artifact-roots`；唯一默认 entry 仍为 Node CLI `speclite resolve`，Python `resolve_*.py` 仍限定为 legacy compatibility、migration aid 与 troubleshooting asset。新增 bounded contract scan，锁定三个 subcommands 与 Node CLI 边界。
- **Evidence**: `npm run docs:check` PASS（72 Markdown files、5 drafts）；聚焦 contract test PASS。

#### Finding #3：Analysis document route path integrity

- **Result**: 已修复。
- **Files**: `src/manifest/analysis-artifact-routing.ts`、`test/analysis-artifact-routing.test.ts`。
- **Change**: `projectName` 对 trim 后空值、`/`、`\\`、NUL、`.`/`..` traversal、absolute 与 drive-like shape fail closed；new/legacy candidate 均执行 lexical project-relative 与 symlink boundary 检查；只有 `lstat().isFile()` 且非 candidate symlink 才算 existing，只有 `ENOENT` 算 missing，其他 directory/FIFO/socket/device/symlink 等 unsafe existing entry 均 fail closed。new existing 时不再检查 legacy candidate，保持 new-first；legacy 仅在 `legacy-compatible`、new missing 且 legacy safe regular file 时选中；neither missing 仍选 new，related artifacts 仍 co-locate，未执行 migration/copy/delete/rename/rewrite。
- **Evidence**: 聚焦测试覆盖 Product Brief/PRFAQ 既有 precedence，并新增 unsafe names、new/legacy directory、external symlink、safe new-wins 与 neither-missing 边界。

#### Validation Summary（验证总结）

- `npx vitest run test/artifact-root-resolution.test.ts test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts`：PASS，3 files / 26 tests。
- CLI matrix：fresh absent PASS（7 roots、全 `fresh-default`、空 configSources）；fresh valid PASS；existing absent 与 raw config absent 均按 required-layer contract exit `1`。
- `npm run build`：PASS。
- `npm run docs:check`：PASS。
- `npm run release:packaging-check`：PASS（在最终 build 后顺序执行）。
- canonical source check warn/strict：均 `status=ok`、`findings=[]`；当前计数为 core=19、sdlc=50、default total=69。
- `git diff --check`：PASS。
- `npm test`：491 passed、4 todo、12 failed；全部 12 项失败均可精确归因于外部 untracked `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 与 `.zip` 令固定基线从 core=18/default total=68 变为 core=19/default total=69。失败只出现在固定数量/fixture 断言（`source-and-modules`、`runtime-structure`、`fixture-release-gates`、`install-module-selection`、`cli-smoke`），与本轮三个 P1 patch 无关；本 Fixer 未修改该外部 drift 或其 governance/baseline。

#### Scope Audit（范围审计）

- 本轮源码/文档/测试增量严格限于 evaluation 授权文件；`src/commands/resolve.ts` 无需追加修改。
- 未修改 Story、`sprint-status.yaml`、flow gates、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`、CR04/05/06、CR TODO/rules、Round 2 #3 或外部 drawer/governance。
- 未 commit、未 push。下一步仍须 fresh Reviewer replacement 与 fresh Evaluator；本记录不构成 closeout 授权。
