---
Story: 11-4
Round: 3
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-4-code-review-summary-20260904-round-3.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-4 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。本轮 Reviewer 在 Round 2 Owner A+B 修复后提出 2 个新发现：`release/packaging-manifest.json` 吸入外部未跟踪 core package，以及 `resolveAnalysisDocumentRoute()` 缺少 basename / file-boundary 防护。

评估结论：两个 finding 都不是误报。Finding #1 是真实的 release evidence / canonical D0 污染问题，但不应作为无条件的 Story 11.4 Fixer 源码 patch 执行；它需要先由 Owner/canonical governance 决定外部 `speclite-drawer-er-modeler` 的处理方式，或在隔离环境中恢复 11.4 release manifest 的可复现性。Finding #2 直接落在 Round 2 A+B 新增的 shared helper 上，应作为 bounded Story 11.4 P1 patch 修复。Acceptance Auditor 层不可用不阻止本轮评估，因为本轮不是通过结论，且 Blind/Edge 两层证据足以支持这两个阻塞判断；但修复后仍建议补一次 acceptance-oriented 复审。

本评估未修改源码、测试、Story、tracker、Flow Gate、Reviewer 输出、CR rules/TODO 或日志；唯一新增文件为本 evaluation。

---

## 上轮问题回顾确认

### Round 2 / Finding #1：已修复，但仍需复审后续边界

Round 3 summary 记录 Owner A 的修复方式为保留 `speclite resolve config` raw merged-config 语义，并新增独立 `speclite resolve artifact-roots` machine-readable surface；验证命令为 5 files / 34 tests passed（`11-4-code-review-summary-20260904-round-3.md:19-21`）。Story Dev Agent Record 同步记录 Round2 Fixer 验证：`resolve config --key modules.sdlc.analysis_artifacts` 仍输出 `{}`，`resolve artifact-roots` 输出 `speclite.resolve.artifact-roots.v1`（`_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:112-114`）。本轮未发现该修复本身回退。

### Round 2 / Finding #2：主体修复成立，但新增 helper 边界缺口真实存在

Round 3 summary 记录 Owner B 的修复方式为新增 `resolveAnalysisDocumentRoute()` shared policy，并让 Product Brief / PRFAQ 的 legacy root-level discovery 只在 `legacy-compatible` mode 生效（`11-4-code-review-summary-20260904-round-3.md:23-25`）。`test/analysis-artifact-routing.test.ts:236-354` 覆盖 legacy-only、new-only、both、neither 与 explicit mode 禁用 legacy discovery。该主体 policy 成立；但 Finding #2 指出的 unsafe `projectName`、directory candidate、non-file candidate、symlink candidate 缺口不在这些测试覆盖内，属于新增 helper 的真实边界问题。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R2-#3 | broad legacy-pattern `575` 精确计数缺少可复现命令 | CR TODO / 非阻塞 | 同意维持 P2 evidence hygiene TODO；不混入 Round 3 A+B patch。 |

---

## 发现 #1 评估

### 审查原文

> **[高][新] `release/packaging-manifest.json` 吸入外部 untracked core package drift**
> - 来源：blind
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer 的事实描述成立。当前 `git ls-files --others --exclude-standard assets/source/speclite/core-skills/speclite-drawer-er-modeler assets/source/speclite/core-skills/speclite-drawer-er-modeler.zip` 返回 5 个未跟踪路径：zip、`CHANGELOG.md`、`SKILL.en.md`、`SKILL.md`、`references/er-drawing-rules.md`。同时，tracked diff 已把这些未跟踪路径写入 `release/packaging-manifest.json`：package hash 从 `sha256:9695...` 变为 `sha256:5a68...`，并新增 `speclite-drawer-er-modeler*` 条目（`release/packaging-manifest.json:22`、`release/packaging-manifest.json:66-70`、`release/packaging-manifest.json:792-796`）。

当前 strict canonical checker 也验证了同一外部包的 D0 问题：`status=error`，唯一 finding 为 `module-help.missing-row`，路径为 `assets/source/speclite/core-skills/module-help.csv`，message 指向 `speclite-drawer-er-modeler`。`assets/source/speclite/core-skills/module-help.csv:1-20` 没有该 skill row；`assets/source/speclite/sdlc-skills/module-help.csv:14-21` 只覆盖 Analysis producer rows，与 core drawer package 无关。

**严重性判断：合理，但原始 `patch` 分类过窄**

严重性为 P1 合理。Story 11.4 的 File List 包含 `release/packaging-manifest.json`（`_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:157-163`），且 evidence plan 要求 docs/build/packaging/git 通过（同文件 `178-190`）。如果当前 manifest 携带未跟踪 package inventory，单独提交 Story 11.4 tracked diff 后，clean checkout 无法复现同一 package inventory / hash；如果把 drawer package 一并纳入，又会把外部 core package drift 夹带进 Analysis routing Story。

但它不是可以无条件交给 Story 11.4 Fixer 的普通源码 patch。`EXPERIMENT_NOTES.md:56-61` 明确记录 Owner A+B 授权范围不包含外部 untracked core drift；`EXPERIMENT_NOTES.md:63-69` 与 `78-83` 也将 full suite / canonical strict 红色归因到外部 `speclite-drawer-er-modeler`，并要求隔离报告。当前 checker 将该问题归入 canonical source truth / module discovery contract D0，已经超出单个 Analysis routing helper 的代码修复边界。

**修复建议：可行，但需要 Owner/canonical governance 先裁决**

Fixer 不应擅自补 `core-skills/module-help.csv`、纳入 drawer package、删除 untracked drawer files，或把 drawer package 作为 Story 11.4 的实现内容提交。下一步应先由 Owner 在两个方向中裁决：

- 独立处理外部 `speclite-drawer-er-modeler` canonical package：登记/补齐 core module discovery、lint、packaging、hash 与相关治理证据，并作为独立 scope 关闭 D0。
- 或隔离 Story 11.4 release evidence：在不消费外部 untracked drawer package 的干净/隔离状态下重新生成或恢复 `release/packaging-manifest.json`，使 11.4 manifest 只反映本 Story 授权变更。

在该裁决前，Finding #1 阻塞 CR closeout，但不授权 11.4 Fixer 直接触碰外部 core package。

**误报评估：非误报**

该 finding 由 git untracked 状态、manifest tracked diff 与 canonical checker D0 error 共同证明，不是误报。

---

## 发现 #2 评估

### 审查原文

> **[中][新] `resolveAnalysisDocumentRoute()` 未约束 artifact basename 与现存 artifact 类型**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer 对新增 helper 的描述成立。`src/manifest/analysis-artifact-routing.ts:42-53` 直接从 `input.projectName` 构造 `mainBasename` 与 `distillateBasename`，随后用 `path.posix.join()` 拼接 `newSubjectMainArtifact` 和 `legacyRootLevelMainArtifact`。如果 `projectName` 包含 `/`、多段 `../`、反斜杠或 drive/absolute-like 形状，它就不再是 basename，而是参与路径结构。`pathExists()` 又在 `src/manifest/analysis-artifact-routing.ts:85-88` 只用 `access()` 判断存在性，不能区分 regular file、directory、symlink 或 symlink escape。

同仓已有可复用路径边界工具：`normalizeProjectRelativePosixPath()` 会拒绝空路径、`.`、`..`、`../`、POSIX absolute 与 Windows drive-like path（`src/fs/path-normalizer.ts:64-79`）；`findProjectBoundarySymlinkEscape()` 会逐段检查 symlink 是否逃出 project root（`src/fs/path-normalizer.ts:107-138`）。当前 helper 没有使用这些能力，也没有等价防护。

测试缺口同样成立。`test/analysis-artifact-routing.test.ts:236-354` 只覆盖 legacy-compatible 与 explicit mode 的 route precedence；`test/analysis-artifact-routing.test.ts:356-390` 覆盖 affected Analysis Skills 是否记录 resolved artifact-root activation 与 legacy policy。未覆盖 unsafe `projectName`、directory candidate、non-file candidate 或 symlink candidate。

**严重性判断：原始 [中] 偏低，评估为 P1**

该问题直接落在 Round 2 A+B 新增 shared helper，且 helper 的输出将进入 Product Brief / PRFAQ main/distillate/stage/verdict workflow artifact paths。路径 escape 或把 directory/symlink 误判为可 resume artifact，都会让后续 workflow read/write 指向错误位置，破坏 Story 11.4 AC7 的 existing-install keep-in-place/no-migration 语义和 AC9 的路径边界测试要求（Story 文件 `17-21`、`43-48`、`68-70`）。因此它不仅是 hardening 建议，而是阻塞交付的 P1 patch。

**修复建议：可行，且属于 bounded Story 11.4 Fixer 范围**

该 finding 可以交给 fresh Fixer，范围应严格限制在 Round 2 A+B 新增 helper 与对应 regression：

- 对 `{project_name}` 生成的 basename 做 fail-closed validation 或 deterministic safe-basename normalization；至少拒绝 path separators、traversal segment、absolute/drive-like shape 与空 basename。不要改变 Product Brief / PRFAQ 的 family prefix、new-first precedence、legacy-compatible-only discovery、no-migration/no-copy/no-delete/no-rename/no-rewrite 语义。
- 对 existing candidate 使用 `lstat()` / project-boundary symlink guard 或等价实现；只有 regular project-local file 才可被视为可 resume artifact。directory、non-file、symlink escape 应被当作不存在或返回明确 issue，具体行为需保持调用方可测试、可诊断。
- 补 `test/analysis-artifact-routing.test.ts` regression：unsafe `projectName`、directory candidate、non-file candidate、symlink escape，以及修复后仍保持 legacy-only/new-only/both/neither/explicit mode precedence。

**误报评估：非误报**

这是由新增 helper 当前实现和测试矩阵缺口共同证明的真实问题；可在 11.4 bounded scope 内修复。

---

## Acceptance Auditor 层不可用评估

Round 3 summary 明确记录 Blind Hunter 与 Edge Case Hunter 两层已完成，Acceptance Auditor 因请求非 sandbox 运行并停在 `waitingOnApproval`，外层未批准扩权，因此按 2/3 层聚合（`11-4-code-review-summary-20260904-round-3.md:11-13`、`72-77`）。

该缺失不阻止本轮 Evaluator 形成结论，原因是本轮结论为“不通过”，不是以缺失验收层为依据放行 Story。两个 finding 均有足够的本地代码、git 与 checker 证据支撑：Finding #1 来自 manifest / git / canonical checker；Finding #2 来自新增 helper 源码与 regression 缺口。残余风险是：修复后仍需要 acceptance-oriented 复审确认 AC7/AC9、release evidence 与 no-migration 语义没有被补丁破坏。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `release/packaging-manifest.json` 吸入外部 untracked `speclite-drawer-er-modeler` inventory/hash | [高] | **P1** | 真实污染 release evidence；阻塞 closeout，但需 Owner/canonical D0 裁决后处理，不是无条件 11.4 Fixer source patch。 |
| 2 | `resolveAnalysisDocumentRoute()` 未约束 basename 与 existing candidate 类型 / symlink boundary | [中] | **P1** | A+B 新增 helper 的真实边界缺陷；应由 bounded 11.4 Fixer 修 helper 与 regression。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R2-#3 | broad legacy-pattern `575` 精确计数缺少可复现命令 | [低] | **P2** | 维持 CR TODO；不阻塞 Round 3 P1 修复。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 两个 Round 3 findings 均为真实问题。 |

### 评估决定

- **发现 #1（manifest 吸入外部 drawer package）**：确认有效、P1、阻塞 CR closeout；分类从普通 `patch` 调整为 `decision_needed / canonical-governance`。在 Owner/canonical governance 未裁决前，11.4 Fixer 不得补 module-help、纳入 drawer package、删除 untracked files，或把该外部 core package 混进 Story 11.4。
- **发现 #2（route helper path/file boundary）**：确认有效、P1、可直接进入 bounded 11.4 Fixer。修复范围限 `src/manifest/analysis-artifact-routing.ts` 及对应 regression，必要时复用 `src/fs/path-normalizer.ts` 的 project-relative 与 symlink boundary 能力；不得改变 Owner B 的 legacy-compatible-only / new-first / no-migration 语义。
- **Acceptance Auditor 缺失**：不阻止本轮不通过结论；修复后需要在下一轮补足 acceptance-oriented 复审或明确记录不可用残余风险。
