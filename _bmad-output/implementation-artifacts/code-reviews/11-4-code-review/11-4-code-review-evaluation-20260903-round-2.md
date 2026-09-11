---
Story: 11-4
Round: 2
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-4-code-review-summary-20260903-round-2.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-4 的第 2 轮 CR 代码审查结果（replacement full-scope 复审）进行逐条评估。Round 1 因流程 provenance 无效被本轮 Reviewer 明确 supersede，本评估仅消费 `11-4-code-review-summary-20260903-round-2.md`。

评估结论：Reviewer 提出的 #1 与 #2 均指向真实风险，但二者不应直接进入无 Owner decision 的 Fixer `patch`。它们分别触及 `speclite resolve config` 的 raw merged config / resolved artifact-root public contract，以及 Product Brief / PRFAQ legacy root-level artifacts 与新 subject directory 的 precedence / resume / write 目标。现有 `SPEC 09`、Story 11.1 与 Story 11.4 能证明风险存在，但不足以唯一授权最小修复方式。因此 #1 与 #2 均评估为 P1 `decision_needed`，阻塞进入 Fixer。#3 为真实 completion evidence hygiene 问题，维持 P2 CR TODO，非阻塞交付修复。

本评估未修改源码、测试、Story、tracker、Flow Gate、Reviewer 输出、CR rules/TODO 或日志；唯一新增文件为本 evaluation。

---

## 上轮问题回顾确认

### Round 1 通过结论：无效，维持作废

Round 2 summary 已记录 Round 1 因未执行 `bmenhance-cr-01-reviewer` 要求的独立审查层而被流程作废。Evaluator 不使用 Round 1 的通过结论作为本轮判断依据。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#1 / R2-#3 | broad scan `575` 精确计数缺少可复现命令 | CR TODO / 非阻塞 | 同意维持 evidence hygiene TODO；不扩大为本轮 Story 11.4 源码修复。 |

---

## 发现 #1 评估

### 审查原文

> **[高][新] Existing install 中 Analysis workflows 读取 raw merged config，未消费 artifact-root resolver 的 legacy fallback**
> - 来源：blind
> - 分类：patch

### 评估结论：⚠️ 确认有效，但分类调整为 `decision_needed`（P1）

### 评估分析

**问题描述准确性：基本准确**

Reviewer 对运行时事实的描述成立：`speclite-product-brief` 与 `speclite-prfaq` 的 activation guidance 要求运行 `speclite resolve config --project-root {project-root}` 并直接从返回的 merged runtime config 读取 `{analysis_artifacts}`，见 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:53-59` 与 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:44-50`；入口 Skill 也声明配置文件缺失或关键字段为空时必须 HALT，见 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/SKILL.md:27-30` 与 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/SKILL.md:27-30`。

当前 CLI 的 `resolve config` 只调用 `resolveProjectConfig({ projectRoot, keys })`，见 `src/commands/resolve.ts:51-54`；`resolveProjectConfig()` 只读取 `_speclite/config.toml`、`config.user.toml` 与 custom config layers 后返回 raw TOML merge，见 `src/config/config-reader.ts:11-48`；`selectDottedKeys()` 对不存在的 key 返回空对象，见 `src/config/customization-reader.ts:111-134`。这解释了 focused 复现中 `--key modules.sdlc.analysis_artifacts` 输出 `{}` 的行为。

与此同时，Story 11.1 resolver 已具备 `analysis_artifacts -> modules.sdlc.planning_artifacts` 的 legacy-compatible fallback：registry 定义在 `src/config/artifact-root-resolver.ts:62-68`，existing lifecycle fallback 在 `src/config/artifact-root-resolver.ts:265-280` 与 `src/config/artifact-root-resolver.ts:315-326`，project-config handoff 在 `src/config/artifact-root-resolver.ts:195-220`。Focused 复现确认同一 legacy config 下 resolver API 返回：

```json
{
  "field": "analysis_artifacts",
  "configPath": "modules.sdlc.analysis_artifacts",
  "placeholder": "{analysis_artifacts}",
  "resolvedRoot": "_speclite-output/planning-artifacts",
  "resolutionMode": "legacy-compatible"
}
```

因此，问题不是 resolver 不存在，而是 affected Analysis workflows 当前被指向 raw merged config consumer surface，拿不到 resolver-backed fallback。

**严重性判断：合理，但交付动作应从 `patch` 调整为 `decision_needed`**

Story 11.4 AC7 明确要求 existing install 无 `analysis_artifacts` 时消费 Story 11.1 resolver 与 Story 11.3 compatibility，见 `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:17-21`；Story 11.1 AC5 要求 resolver result 可被 downstream consumers 复用，但也说明 Story 11.1 本身不要求所有 consumers 切换，见 `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:54-60`；`SPEC 09` 规定 skill 必须通过 installed runtime config 或 `speclite resolve config` 读取 artifact root values，见 `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:60-72`。

这些证据足以证明现状不满足 Story 11.4 的 existing-install consumer requirement，属于 P1。可是它们没有唯一规定应该如何改变 public surface：扩展 `speclite resolve config` 为 resolved artifact-root aware 会改变 raw merged config / dotted key / provenance contract；新增 `speclite resolve artifact-roots` 或类似 command/API 又会新增 public CLI contract；让 Skill 文案自行用 `planning_artifacts` fallback 会复制 resolver 语义，违反 Story 11.1 的 single resolver boundary。三种方向都不是 evaluator 可替 Owner 选择的最小 patch。

**修复建议：需要 Owner Decision 后才可行**

Reviewer 的方向“让 workflow activation 消费 resolver-backed artifact roots”正确，但 Fixer 不能在未裁决时直接修改 CLI 或 Skill 文案。Owner 需先决定 resolved artifact-root 的 machine-readable public contract：

- 是否保持 `speclite resolve config` 为 raw merged config，并新增独立 resolved artifact-root command/API。
- 或是否扩展 `speclite resolve config` 的输出与 `--key` 语义，使其可返回 resolver-backed synthetic values、`resolutionMode` 与 provenance。
- 如果新增/扩展 public surface，是否同步 `SPEC 09`、resolve command contract、docs、fixtures 与 affected Skills。

**误报评估：非误报**

问题可由当前源码和 focused 命令复现，不是误报；只是 Reviewer 将其归为可直接修复的 `patch` 过度推进。

---

## 发现 #2 评估

### 审查原文

> **[高][新] Product Brief / PRFAQ legacy fallback 会错过旧 planning root-level artifact**
> - 来源：blind
> - 分类：patch

### 评估结论：⚠️ 确认有效，但分类调整为 `decision_needed`（P1）

### 评估分析

**问题描述准确性：基本准确**

Reviewer 对路径变化的描述成立。`HEAD` 中旧 Product Brief / PRFAQ artifact 位于 Planning root 直下，例如 `HEAD:assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/draft-and-review.md:21` 使用 `{planning_artifacts}/product-brief-{project_name}.md`，`HEAD:assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:63` 使用 `{planning_artifacts}/prfaq-{project_name}.md`。

当前 Story 11.4 改动后，Product Brief 主输出为 `{analysis_artifacts}/product-brief/product-brief-{project_name}.md`，见 `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/draft-and-review.md:21`；PRFAQ resume/create 输出为 `{analysis_artifacts}/prfaq/prfaq-{project_name}.md`，见 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:64-67` 与 `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:113`。

Focused reproduction 同样成立：existing install 缺 `analysis_artifacts` 时，resolver 把 `{analysis_artifacts}` fallback 到 `_speclite-output/planning-artifacts`，但 `createArtifactContract({ outputLocation: "{analysis_artifacts}/product-brief" })` 解析到 `_speclite-output/planning-artifacts/product-brief`，`"{analysis_artifacts}/prfaq"` 解析到 `_speclite-output/planning-artifacts/prfaq`。这不会命中旧 root-level basename `_speclite-output/planning-artifacts/product-brief-{project_name}.md` 或 `_speclite-output/planning-artifacts/prfaq-{project_name}.md`。

当前 regression 覆盖也确有缺口：`test/analysis-artifact-routing.test.ts:172-233` 只证明 research artifact 在 fallback planning root 下不迁移、不重写，未覆盖 Product Brief main/distillate 或 PRFAQ main/stage/distillate/verdict 的旧 root-level resume/write 行为。

**严重性判断：合理，但交付动作应从 `patch` 调整为 `decision_needed`**

Story 11.4 AC7 要求 existing install 缺 `analysis_artifacts` 时消费 11.1 resolver 与 11.3 compatibility，并保持旧 artifacts 原位，见 `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:17-21`；技术要求同时禁止迁移、复制或重写既有 artifacts，见 `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:43-48`。`SPEC 09` 也禁止普通 install/update/repair 移动、复制、重命名、删除或重写 workflow-owned artifacts，见 `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:84-92`。

但现有合同没有唯一回答双路径场景：

- existing install 只有旧 root-level Product Brief / PRFAQ 时，是否应该 resume/update 旧 root-level artifact，还是只保持原位并在新 subject directory 创建新 artifact。
- 如果旧 root-level artifact 与新 subject-directory artifact 同时存在，哪个路径优先 resume。
- distillate、PRFAQ stage/resume/verdict 是否跟随旧 root-level main artifact，还是统一进入新 subject directory。
- 如果需要 legacy discovery，规则应位于 Skill workflow guidance、resolver/contract layer、还是独立 compatibility helper。

因此 Reviewer 的“无需 Owner decision，现有 AC7/AC9/SPEC09 已给出唯一方向”判断不成立。现有合同能证明风险，不能唯一授权 fixer 选择 precedence/write target。

**修复建议：需要 Owner Decision 后才可行**

Owner 需先给出 Product Brief / PRFAQ legacy artifact policy，至少覆盖：

- legacy root-level main artifact 存在、新 subject artifact 不存在时的 resume/read/write target。
- legacy root-level 与 new subject artifact 同时存在时的 precedence。
- Product Brief distillate 与 PRFAQ stage/distillate/verdict 是否与 main artifact 同目录。
- 该兼容是否只限 existing install missing `analysis_artifacts`，以及是否永久保留或有 deprecation rule。

Owner 决定后，bounded Fixer 才能只改相应 Product Brief / PRFAQ workflow guidance、artifact contract/tests 或 selected resolver/contract surface；不得迁移、复制、删除或重写 existing artifacts。

**误报评估：非误报**

旧 root-level artifact 与当前 fallback subject path 不一致可复现，测试缺口真实存在。该 finding 是有效风险，但不是可直接执行的无裁决 patch。

---

## 发现 #3 评估

### 审查原文

> **[低][新] Broad scan `575` 计数缺少可复现命令**
> - 来源：auditor
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2）

### 评估分析

**问题描述准确性：准确**

Story completion gate 记录 broad scan `575` legacy-pattern hits，见 `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md:59-64`；Story Dev Agent Record 同样记录 broad scan 575，见 `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:157-166`。两处都没有记录原始 command、regex、include/exclude glob 或 per-bucket input source，导致 exact count 不可独立复现。

**严重性判断：偏低但合理为 P2**

该问题削弱 completion evidence 的可审计性，但不直接证明 active Analysis producer route 仍错误。当前 focused test 仍通过：`npx vitest run test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/resolve-readers.test.ts --reporter=dot` 返回 3 files / 17 tests passed。`test/analysis-artifact-routing.test.ts:138-170` 也对 active affected corpus 中旧 Analysis defaults 建立 negative assertion。

**修复建议：可行但非本轮 Fixer 阻塞项**

建议由 CR05 或后续 evidence governance TODO 补充 command、regex、scope 与 per-bucket count，或在 future completion gate rerun 中记录可复现命令。不要把该 P2 TODO 扩大为 Story 11.4 runtime/source 修复。

**误报评估：非误报**

缺少可复现 command 是真实 evidence hygiene gap；维持 defer/P2。

---

## 外部漂移记录（非 11.4 finding）

Reviewer 后当前工作树出现与 Epic 11 Story 11.4 无关的 untracked canonical source 目录：`assets/source/speclite/core-skills/speclite-mermaid-er-modeler/`。该 drift 会影响 global canonical source counts 与 governance warning，但不属于 Round2 review source 的 11.4 active producer routing finding，也不得纳入 11.4 Fixer 范围。

本评估仅记录外部 drift；未修改、未删除、未纳入 Story 11.4 结论。

---

## 整体评估结论

### 需要 Owner Decision（阻塞 Fixer）

| # | 发现 | 原始严重性 | 原始分类 | 评估后优先级 | 评估后分类 | 说明 |
|---|------|----------|----------|-------------|------------|------|
| 1 | Analysis workflows 读取 raw `resolve config`，拿不到 resolver-backed `analysis_artifacts` legacy fallback | [高] | patch | **P1** | **decision_needed** | 问题真实，但最小修复会改变 public CLI/resolver consumption contract，需 Owner 先裁决输出 surface。 |
| 2 | Product Brief / PRFAQ existing fallback 会错过旧 Planning root-level artifacts | [高] | patch | **P1** | **decision_needed** | 问题真实，但旧 root-level 与新 subject directory 的 resume/write/precedence 未由现有合同唯一决定。 |

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-------------|------|
| - | 无可直接授权 Fixer patch | - | - | #1/#2 在 Owner Decision 前不得进入 Fixer。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-------------|------|
| 3 | broad scan `575` 缺少可复现命令 | [低] | **P2** | completion evidence hygiene 问题，建议补 command/regex/scope/per-bucket counts。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮无纯误报；#1/#2 为真实风险但需 Owner Decision，#3 为 P2 TODO。 |

### Owner 问题

1. `artifact-root` resolved runtime contract：是否新增独立 `speclite resolve artifact-roots` 之类的 machine-readable public command/API，还是扩展 `speclite resolve config` 使其返回 resolver-backed synthetic roots、`resolutionMode` 与 provenance？若扩展，raw merged config 与 `--key` 输出 `{}` 的现有行为是否仍需保留？
2. Product Brief / PRFAQ legacy root-level artifacts：existing install missing `analysis_artifacts` 时，旧 root-level `product-brief-{project_name}.md` / `prfaq-{project_name}.md` 应如何 discovery/resume/update？当 root-level 与 subject directory 两边都存在时谁优先？distillate、stage、verdict 是否跟随 main artifact？

### Bounded Fixer 建议

Owner Decision 未关闭前，不运行 Fixer。

Owner Decision 关闭后，Fixer 范围应限制为被裁决的最小 surface：

- 若 Owner 选择 resolved artifact-root CLI/API：只改 selected CLI/API contract、affected Analysis Skill activation guidance、对应 docs/fixtures/tests；不得让 Skill 手写 fallback。
- 若 Owner 选择 Product Brief / PRFAQ legacy discovery：只改 Product Brief / PRFAQ workflow guidance、artifact contract/tests 或选定 compatibility helper；不得迁移、复制、删除、重命名或重写 existing artifacts。
- #3 仅交给 CR TODO/evidence governance，不进入本轮代码 Fixer。

### 验证

- `npx vitest run test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/resolve-readers.test.ts --reporter=dot` -> PASS，3 files / 17 tests passed。
- Focused CLI/API reproduction -> PASS：legacy config 缺 `modules.sdlc.analysis_artifacts` 时，`npm run dev -- resolve config --project-root <temp> --key modules.sdlc.analysis_artifacts` 输出 `{}`；同一 config 的 `resolveArtifactRootsFromProjectConfig({ lifecycle: "existing" })` 返回 `analysis_artifacts` 为 `_speclite-output/planning-artifacts`，`resolutionMode=legacy-compatible`。
- Focused artifact contract reproduction -> PASS：`{analysis_artifacts}/product-brief` 解析到 `_speclite-output/planning-artifacts/product-brief`，`{analysis_artifacts}/prfaq` 解析到 `_speclite-output/planning-artifacts/prfaq`，与旧 `HEAD` root-level basename 不同。

### 评估决定

- **发现 #1（Analysis workflows raw config consumption）**：确认有效，P1；从 `patch` 改为 `decision_needed`。请求 Owner 先裁决 resolved artifact-root public consumption contract。
- **发现 #2（Product Brief / PRFAQ legacy root-level artifact gap）**：确认有效，P1；从 `patch` 改为 `decision_needed`。请求 Owner 先裁决 legacy root-level vs subject directory precedence/resume/write policy。
- **发现 #3（broad scan 575 evidence hygiene）**：确认有效，P2；纳入 CR TODO / evidence governance，非本轮 Fixer 阻塞项。

---

## 结论

**CR Evaluation Result: DECISION_NEEDED**

Story 11.4 不应进入 Fixer，除非 Owner 先回答上述两个 P1 决策问题。当前无 evaluation-approved code patch；唯一可后续跟踪的是 #3 P2 TODO。

---

## 修复执行记录

### Round2 Fixer 2026-09-04

- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2
- **Owner Decision Source**: 用户确认 `确认 A+B`，关闭本评估中的两个 P1 `decision_needed` gate。

#### Finding #1 Fix（Analysis workflows raw config consumption）

- 保持 `speclite resolve config` 为 raw merged-config public surface，保留现有 `--key` 选择语义；未把 resolver-backed fallback 注入 raw config。
- 新增独立 machine-readable `speclite resolve artifact-roots --project-root <projectRoot> [--lifecycle existing|fresh]` surface，stdout 使用 `speclite.resolve.artifact-roots.v1` payload，直接消费 Story 11.1 artifact-root resolver projection：`resolvedRoot`、`resolutionMode`、`plane`、`ownership`、`contractRefs` 与 `configSources`。
- 五个 Analysis producer Skill 的 activation/workflow guidance 已改为：非 artifact-root runtime fields 继续读取 `resolve config`，artifact roots 读取 `resolve artifact-roots`；required roots 缺失时 HALT，不手写 fallback。

#### Finding #2 Fix（Product Brief / PRFAQ legacy root-level artifacts）

- 新增 `resolveAnalysisDocumentRoute` helper 与 production contract tests，覆盖 legacy only、new only、both、neither、explicit analysis root 禁用 legacy discovery、related artifacts 同目录。
- Product Brief route policy：仅当 `analysis_artifacts.resolutionMode=legacy-compatible` 时发现 `{analysis_artifacts}/product-brief-{project_name}.md`；new subject main artifact 优先；只有 legacy root-level main artifact 存在时原地 resume/write；均不存在时创建 `{analysis_artifacts}/product-brief/product-brief-{project_name}.md`；distillate 跟随所选 main artifact 目录。
- PRFAQ route policy：仅当 `analysis_artifacts.resolutionMode=legacy-compatible` 时发现 `{analysis_artifacts}/prfaq-{project_name}.md`；new subject main artifact 优先；只有 legacy root-level main artifact 存在时原地 resume/write；均不存在时创建 `{analysis_artifacts}/prfaq/prfaq-{project_name}.md`；press release、Customer FAQ、Internal FAQ、verdict、stage/resume 与 distillate 跟随所选 main artifact 目录。
- 未执行 migration、copy、delete、rename 或 rewrite existing artifacts。

#### Files Changed（本记录覆盖的主要文件）

- `src/commands/resolve.ts`
- `src/config/resolve-output-schema.ts`
- `src/diagnostics/output.ts`
- `src/manifest/analysis-artifact-routing.ts`
- `test/resolve-readers.test.ts`
- `test/analysis-artifact-routing.test.ts`
- `test/fixtures/resolve-parity/expected/human/config-invalid-input.txt`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/contextual-discovery.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/draft-and-review.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/finalize.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/SKILL.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/press-release.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/customer-faq.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/internal-faq.md`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/verdict.md`
- `docs/reference/cli.md`
- `docs/reference/config-and-customization.md`
- `docs/reference/command-result-json.md`
- `docs/reference/cli-human-output-matrix.md`
- `docs/reference/workflow-artifact-layout.md`
- `docs/reference/specs/command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
- `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md`

#### Verification（验证）

- PASS: `npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts --reporter=dot` -> 3 files / 20 tests passed.
- PASS: `npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/contract-anchors.test.ts test/cli-message-catalog.test.ts --reporter=dot` -> 5 files / 34 tests passed.
- PASS: `npx vitest run test/resolve-cli.test.ts test/installed-activation-contract.test.ts --reporter=dot` -> 2 files / 20 tests passed.
- PASS: CLI e2e `npm run dev -- resolve artifact-roots --project-root .` -> stdout includes `schemaVersion: "speclite.resolve.artifact-roots.v1"` and resolver-backed root modes/provenance.
- PASS: CLI negative guard `npm run dev -- resolve config --project-root . --key modules.sdlc.analysis_artifacts` -> stdout `{}`，证明 raw merged-config / `--key` 语义未被 synthetic root fallback 污染。
- PASS: `npm run build` -> tsup ESM/DTS success.
- PASS: `npm run docs:check` -> 72 Markdown files, 5 drafts, links and governance rules valid.
- PASS: `npm run release:packaging-check` -> packaging acceptance passed for `release/packaging-manifest.json` and `dist/packaging-manifest.json`.
- PASS: changed Skill density checks for five Analysis producer packages -> `triggered_density_warning=false`.
- PASS: scoped negative scan for old active `{planning_artifacts}` / `{project_knowledge}` Analysis producer defaults and fixed Output Location residuals -> no matches.
- PASS: `git diff --check` -> no whitespace errors.
- CAVEAT: Full `npm test` was executed twice after Round2 Fixer. Final run result: 58 files passed, 5 files failed, 486 passed / 12 failed / 4 todo. All remaining failures are fixed expected-count drift caused by unrelated untracked `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` changing canonical `core` package roots from 18 to 19 and default total from 68 to 69. This external core drift is outside Story 11.4 and was not modified.
- CAVEAT: Canonical source checker warn mode returned `status=warning`; strict mode returned `status=error`; both report only `module-help.missing-row` for external `speclite-drawer-er-modeler`. No 11.4-owned canonical-source finding remains.

#### Deferred / Not Fixed（未修复项）

- Finding #3 broad scan `575` 可复现性问题保持 P2 / CR TODO；本 Fixer 未修改该 TODO、未执行 CR05、未做 broad evidence governance rewrite。
- 未执行 Reviewer、Evaluator、CR04、CR05、CR06、commit 或 push。

### Fresh Fixer Recovery Record 2026-09-04

- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2
- **Recovery Scope**: Fresh `bmenhance-cr-03-fixer` recovery for Story 11.4 Round 2 after the first Fixer was interrupted.
- **Process Ownership**: 本记录 supersede 首个被中断 Fixer 的流程 ownership。首个 Fixer 已落盘的源码、docs 与测试 candidate 仅作为 untrusted input 重新审计；其先前 fix record 保留为历史自述，不作为进入 Reviewer Round 3 的独立完成证据。
- **Owner Decision Source**: 用户在 2026-09-04 明确确认 `确认 A+B`，关闭本评估中的两个 P1 `decision_needed` gate。

#### Recovery Audit Result（恢复审计结果）

- **Adopted after independent audit**: `speclite resolve config` 仍保持 raw merged-config 与现有 `--key` 语义；`speclite resolve artifact-roots` 已作为独立 machine-readable public surface 注册到 CLI，输出 `speclite.resolve.artifact-roots.v1`，并复用 Story 11.1 `resolveArtifactRootsFromProjectConfig()` / `createArtifactRootProjections()` 的 resolver-backed roots、`resolutionMode`、`plane`、`ownership`、`contractRefs` 与 `configSources`。
- **Adopted after independent audit**: 五个 Analysis producer activation/workflow guidance 均要求同时使用 `speclite resolve config --project-root {project-root}` 读取非 artifact-root runtime fields，并使用 `speclite resolve artifact-roots --project-root {project-root}` 读取 artifact roots；required roots 缺失时 HALT；未引入 hand-written fallback。
- **Adopted after independent audit**: Product Brief / PRFAQ route policy 符合 Owner Decision B。`resolveAnalysisDocumentRoute()` 与 workflow guidance 覆盖 legacy-only、new-only、both、neither、explicit analysis root 禁用 legacy discovery；new subject main artifact 优先；只有 legacy root-level main artifact 存在且 new subject main 不存在时才原地 resume/write；distillate、PRFAQ stage/resume/verdict 均跟随 selected main artifact 同目录；未执行 migration、copy、delete、rename 或 rewrite existing artifacts。
- **No rework required**: 本 Recovery 未进一步修改源码、测试、Story、tracker、completion gate、Reviewer 输出、CR rules/TODO、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`、commit 或 push。
- **Deferred unchanged**: Finding #3 broad scan `575` 可复现性问题保持 P2 / CR TODO；本 Recovery 未将其混入 A+B 修复。

#### Canonical Source Governance（Canonical Source 治理）

- **D0 classification**: `assets/source/speclite/sdlc-skills/**` changed paths impact `canonical-source-truth:D0` and `module-discovery-contract:D0`; required followups were canonical checker, package root classification, module-help coverage, skill density, docs review and packaging manifest verification.
- **D0 closure for Story 11.4 scope**: `npm run build` and `npm run release:packaging-check` passed; five changed Analysis Skill density checks returned `triggered_density_warning=false`; no packaging-manifest finding remained for 11.4-owned changed source.
- **External drift caveat**: Current canonical checker reports only unrelated untracked `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` / `.zip` as `module-help.missing-row`, changing canonical counts to `core=19`, `sdlc=50`, `defaultInstall.total=69`. This Recovery did not modify, delete, package, manifest, or add `module-help.csv` rows for that external drift.
- **D1/D2 decision**: `decisionRecordRequired=false` in current checker output. Current public docs touched by A+B were updated in the candidate and verified by docs/build/packaging; frozen/historical records were not rewritten by this Recovery.

#### Recovery Verification（恢复验证）

- PASS: `npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/contract-anchors.test.ts test/cli-message-catalog.test.ts --reporter=dot` -> 5 files / 34 tests passed.
- PASS: `npx vitest run test/resolve-cli.test.ts test/installed-activation-contract.test.ts --reporter=dot` -> 2 files / 20 tests passed.
- PASS: CLI e2e `npm run dev -- resolve artifact-roots --project-root .` -> stdout contains `schemaVersion: "speclite.resolve.artifact-roots.v1"`, all seven roots, `resolutionMode`, `contractRefs`, and project-relative `configSources`.
- PASS: CLI negative guard `npm run dev -- resolve config --project-root . --key modules.sdlc.analysis_artifacts` -> stdout `{}`, preserving raw merged-config behavior.
- PASS: CLI negative guard `npm run dev -- resolve artifact-roots --project-root . --lifecycle invalid` -> exit 1 with stderr `ValidationIssue` for `affectedPath="--lifecycle"`.
- PASS: CLI negative guard `npm run dev -- resolve artifact-roots --human` -> exit 1 human invalid-input output with legal `artifact-roots` command listed.
- PASS: `npm run build` -> tsup ESM/DTS success.
- PASS: `npm run docs:check` -> 72 Markdown files, 5 drafts, links and governance rules valid.
- PASS: `npm run release:packaging-check` -> packaging acceptance passed for `release/packaging-manifest.json` and `dist/packaging-manifest.json`.
- PASS: changed Skill density checks for `speclite-domain-research`, `speclite-market-research`, `speclite-technical-research`, `speclite-product-brief`, and `speclite-prfaq` -> all `triggered_density_warning=false`.
- PASS: `git diff --check` -> no whitespace errors.
- CAVEAT: Affected suite `npx vitest run test/analysis-artifact-routing.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/manifest-discovery.test.ts test/source-and-modules.test.ts test/skill-artifact-loop.test.ts --reporter=dot` -> 3 files failed / 3 passed; failures are fixed count assertions caused by external `core=19,total=69` drift, while 53 tests passed.
- CAVEAT: Full `npm test` -> 58 files passed / 5 failed; 486 passed / 12 failed / 4 todo. All 12 failures assert old `core=18,total=68` or selected ecosystem totals derived from that baseline; no failure points to Story 11.4 A+B runtime surface, PB/PRFAQ routing, docs, or Skill activation guidance.
- CAVEAT: Canonical checker warn mode returned `status=warning`; strict mode returned `status=error`; both report only `module-help.missing-row` for external `speclite-drawer-er-modeler`. No 11.4-owned canonical-source finding remains.
