---
Story: 11-2
Round: 3
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-2-code-review-summary-20260903-round-3.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-2 的第 3 轮 CR 代码审查结果（复审）进行独立评估。Round 3 reviewer 结论为通过，新增 findings 为 0；其历史复核结论、controlled correction、runtime/test/docs/canonical/package evidence 与当前 worktree truth 一致。

评估结论：通过。无需进入 CR fixer；无需新的 owner decision。`docs/reference/workflow-artifact-layout.md` 中面向后续 workflow routing 的 generic route strings 仍应保持为 Story 11.4+ / CR TODO 候选，不构成 Story 11.2 blocker。

本评估未修改源码、tests、Story、SPEC、Flow Gate、tracker、review summary、CR rules 或编排日志；只新增本 Round 3 evaluation 文件。

---

## 上轮问题回顾确认

### Round 1 Finding #1：ReadyCheck / manifest reconciliation：Closed

当前代码已关闭 Round 1 的 ReadyCheck false-positive 缺口。`src/installer/ready-check.ts:115-119` 在读取 manifest 后立即比较 caller/input 的 expected `artifactRoots` 与 manifest `paths.artifactRoots`；`src/installer/ready-check.ts:360-380` 覆盖 caller present + manifest missing 时 fail-closed，同时保留 caller 与 manifest 均省略 projection 的 legacy compatibility；`src/installer/ready-check.ts:388-409` 对逐 entry 字段做完整比较；`src/installer/ready-check.ts:415-459` 覆盖 count、duplicate field 与固定顺序；`src/installer/ready-check.ts:485-497` 复用 `manifest-schema.malformed-field` 并把 `details.field` 固定为 `paths.artifactRoots`。

回归证据也充分：`test/install-progress-ready-summary.test.ts:126-155` 覆盖 manifest 省略 expected projection；`:161-194` 覆盖顺序错配；`:200-233` 覆盖 `resolvedRoot` 错配；`:239-270` 覆盖 duplicate field；`:276-301` 覆盖 caller/manifest 双省略的 legacy compatibility。Round 3 reviewer 对该项关闭的判断成立。

### Round 1 Finding #2：Current public docs fresh roots：Closed

Round 1 授权的 D1 current docs 主体已同步 fresh 七 root defaults 与 Public Documentation / Project Knowledge separation。当前 `docs/quick-start.md:159-167` 列出 `_speclite-output/0-brainstorming-artifacts` 到 `_speclite-output/project-knowledge-base` 的七个默认 root，并明确 `docs/` 不是 fresh `project_knowledge` 默认目录；`docs/how-to/install-speclite.md:131-142`、`docs/reference/runtime-layout.md:26-33` 和 `docs/explanation/runtime-boundaries.md:75-77` 保持相同分离语义；`docs/explanation/speclite-modules.md:49-63` 与 `docs/reference/workflow-artifact-layout.md:38-46` 也已同步 module defaults。

剩余 `docs/reference/workflow-artifact-layout.md:133-146`、`:189`、`:223` 的 generic `planning-artifacts/` route strings 不是 current fresh default drift，而是后续 workflow producer routing / current differences 说明。Story 11.2 AC7 明确不修改 Analysis、Planning、UX、Readiness 或 CR workflow 的具体路由（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:30`），tracker 中 Story 11.4 仍为 `ready-for-dev`（`_bmad-output/implementation-artifacts/sprint-status.yaml:147`）。因此该项应维持 Story 11.4+ / CR TODO 候选，非 Story 11.2 fixer blocker。

### Round 2 Finding #1：fresh detailed per-root override mode：Closed

用户已批准方案 A：fresh detailed prompt 中，某个 artifact root field 的非空逐 field 输入标记为 `explicit-config`；quick/default、未显式 fields、以及仅由 `output_folder` 派生出的 roots 继续标记为 `fresh-default`。

Owner artifacts 已以 dated controlled correction 闭环：`SPEC 09` 在 `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:74-78` 明确该语义；Story 11.1 在 `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:38` 和 `:216-217` 补充 resolver matrix；Story 11.2 在 `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:24`、`:113`、`:187`、`:241` 补充 AC、guardrail、completion notes 与 changelog；kickoff gate 在 `_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-kickoff-gate.md:36-38` 保留原决策并用 controlled correction supersede 最后一句。

Runtime 与 tests 也一致。`src/config/artifact-root-resolver.ts:245-252` 在 fresh lifecycle 下先识别 explicit field value 并返回 `explicit-config`；`:255-262` 仅对 fresh default / `output_folder` 派生路径返回 `fresh-default`。`test/artifact-root-resolution.test.ts:81-141` 验证 detailed per-field override 为 `explicit-config`，其它 `output_folder` 派生 roots 保持 `fresh-default`；`test/config-initialization.test.ts:166-195` 验证 detailed config round-trip 中 `planning_artifacts` 为 `_speclite-output/plans` + `explicit-config`，其它 roots 为 `fresh-default`。

本轮还在临时目录用 `runInstallCommand()` 复跑 detailed install：最终结果为 `exitCode: 0`，command result 与 manifest 中 `planning_artifacts` 均为 `resolvedRoot: "_out/plans"`、`resolutionMode: "explicit-config"`，其它六个 command projection modes 均为 `fresh-default`。前两次 ad-hoc 失败分别由 `tsx --eval` top-level await 限制和手写 manifest path 错误导致，不是产品行为失败；最终 async main + `_speclite/_config/manifest.yaml` 路径复跑通过。

### Round 2 Finding #2：brownfield tutorial Step 1 / Step 6：Closed

`docs/tutorials/first-brownfield-project.md` 的两个授权 section 已对齐 fresh default。Step 1 现在说明默认 quick config 中 `project_knowledge` 为 `_speclite-output/project-knowledge-base`，sentinel path 为 `_speclite-output/project-knowledge-base/brownfield/project-scan-report.json`（`docs/tutorials/first-brownfield-project.md:74-77`）。Step 6 允许路径现在包含 `_speclite-output/project-knowledge-base/brownfield/**`、三个 `_speclite-output/2-planning-artifacts/...` handoff 文件，以及按 Skill/effective config 解析到 brownfield planning 子目录的条件路径（`docs/tutorials/first-brownfield-project.md:192-198`）。

未发现该修复暗示 brownfield Skill runtime routing 已迁移，也未发现其扩大到 Story 11.3+ 或 workflow routing 实现。Round 3 reviewer 对该项关闭的判断成立。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R2-follow-up | `docs/reference/workflow-artifact-layout.md` generic workflow routing strings | CR TODO / Story 11.4+ | 同意维持为非阻塞候选。当前文件仍有 generic producer route strings（`docs/reference/workflow-artifact-layout.md:133-146`、`:189`、`:223`），但 Story 11.2 AC7 与 completion gate 均把 Analysis/Planning/UX/Readiness/CR workflow routing 留给 Story 11.4+（`_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-completion-gate.md:61-64`）。本 evaluator 不授权修改该文件后续 routing 段落。 |

---

## 发现 #1 评估

### 审查原文

> Round 3 reviewer 结论：通过。本轮未发现新的阻塞项、中高优先级缺陷或需要重新返修的问题。

### 评估结论：✅ 确认有效 — 无需修复

### 评估分析

**问题描述准确性：准确**

Reviewer 对“新增 findings 为 0”的结论与当前证据一致。Round 1/2 历史 findings 均已有 owner decision、runtime/docs/test evidence 闭环；未发现新的 P0/P1/P2 blocker。

**严重性判断：合理**

本轮没有新缺陷，故无需 severity 上调。唯一保留项是 generic workflow routing 的 future-scope / CR TODO 候选，不影响 Story 11.2 fresh-install projection 交付。

**修复建议：可行但非必要**

无需 fixer。后续应按 strict-serial CR 流程进入 CR04 / CR05 / CR06，而不是修改当前源码或 Story。

**误报评估：非误报**

Round 3 reviewer 的通过结论不是误报。独立验证、当前文件证据与 reviewer summary 保持一致。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 无 | 无 | - | - | Round 3 新增 findings 为 0；Round 1/2 blocker 均已关闭。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R2-follow-up | `workflow-artifact-layout.md` generic workflow routing strings | [follow-up] | **P2 / future-story** | 维持 Story 11.4+ / CR TODO 候选；不阻塞 Story 11.2，不授权本轮 fixer。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | - | 本轮没有需要 dismiss 的 reviewer finding。 |

### 评估决定

- **整体结论**：通过。Round 3 reviewer 的“通过 / 0 findings”结论成立。
- **Fixer 决策**：不需要 CR fixer。没有 P0/P1 blocker，也没有当前 Story 11.2 范围内需要 patch 的 P2。
- **Owner decision 决策**：不需要新的 owner decision。Round 2 方案 A 已由用户批准并通过 controlled correction 收口。
- **CR TODO 决策**：`workflow-artifact-layout.md` generic routing strings 继续作为 Story 11.4+ / CR TODO 候选交给后续 CR05 判断或登记；本 evaluator 不修改 `cr-todo-backlog.md`。
- **11.3+ boundary**：维持关闭。Story 11.2 不实现 existing fallback/mismatch/migration（Story 11.3）或 Analysis/Planning/UX/Readiness/CR workflow routing（Story 11.4+）；tracker 当前仍显示 11.2=`review`、11.3/11.4+=`ready-for-dev`（`_bmad-output/implementation-artifacts/sprint-status.yaml:145-147`）。
- **`npm run lint`**：确认只是项目未配置脚本。`package.json:39-47` 只定义 `build`、`dev`、`docs:check`、`test`、`release:*` 和 `prepublishOnly`，没有 `lint`；实际执行 `npm run lint` 返回 `Missing script: "lint"`。该结果不是产品回归或 Story 11.2 失败证据。

## Verification（验证）

- `npx vitest run test/artifact-root-resolution.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts test/fixture-release-gates.test.ts test/resolve-readers.test.ts test/artifact-path-validation.test.ts`：PASS，7 files，66 tests。
- `npm run docs:check`：PASS，72 Markdown files，5 drafts，links and governance rules valid。
- `npm run lint`：非产品失败；NPM 返回 `Missing script: "lint"`，并由 `package.json:39-47` 证实未配置该 script。
- Canonical governance warn checker：PASS，`status: ok`，`findings: []`，`changedPathCount: 1`，impacted classes 为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，`decisionRecordRequired: false`；counts 为 core 18、sdlc 50、support 8、hooks 2、defaultInstall 68。
- Canonical governance strict checker：PASS，`status: ok`，`findings: []`，同样 `decisionRecordRequired: false`。
- Governance runner classification：已按 `speclite-canonical-source-governance-runner` 读取 governance map/doc 并分类。当前 canonical 变更为 `assets/source/speclite/sdlc-skills/module.yaml:35-68` 的七 root fields/defaults，属于 D0 canonical-source-truth / module-discovery-contract；checker 未要求 D1/D2 decision record。`release/packaging-manifest.json:22` 已有更新后的 package hash。
- `npm run build`：PASS，`tsup` build success。
- Canonical recommended focused tests：`npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts`：PASS，6 files，61 tests。
- Skill density checks：`speclite-canonical-source-governance-runner` 与 `speclite-check-canonical-source-change` 均 PASS，no density warnings。
- `npm test`：PASS，61 files，481 passed，4 todo。
- `npm run release:packaging-check`：PASS，`release/packaging-manifest.json` and `dist/packaging-manifest.json`。
- `git diff --check`：PASS，无输出。
- Ad-hoc detailed install projection：PASS，临时目录 install `exitCode: 0`；command result 与 manifest 中 `planning_artifacts` 均为 `_out/plans` + `explicit-config`，其它六个 roots 为 `fresh-default`。
