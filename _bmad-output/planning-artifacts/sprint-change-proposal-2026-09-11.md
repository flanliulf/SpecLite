---
workflow: bmad-correct-course
project: SpecLite
date: 2026-09-11
mode: batch
status: applied
changeId: CC-2026-09-11-story-11-9-restart
iterationId: 1
changeRequest: story-11-9-code-review-directory-resolver-restart
selectedApproach: direct-adjustment
decisionRoot: implementation
decisionTarget: "Story 11.9 / speclite-code-review-contract CR Directory Resolution"
triggerEvidence:
  - _bmad-output/implementation-artifacts/code-reviews/11-9-code-review/superseded-main/
  - _bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-kickoff-gate.md
---

# Sprint Change Proposal（Story 11.9 重启变更提案）

## Executive Summary（执行摘要）

Story 11.9 的首版实现（1.0 / 1.1，2026-09-05 → 09-09）把"CR 目录归属"做成了 875–1791 行的产物认证与审批重放引擎，经 24 + 10 + 2 轮 CR 仍未收敛（234 个产物、14 个 superseded、5 条以"接受风险"入库的 P1），并正面违反 AC12（不修改 CR 算法 / 审批规则）。根因是 AC9 把"判定 current round / unfinished run"交给了目录 resolver 而 Story 没有给出威胁模型边界，三层对抗式审查对任何读取产物内容的代码都会无限产出 authenticity / path-safety P1。

本提案采用 Direct Adjustment：不改变 FR23g 与 AC1–12 的本质诉求，以三项裁决固定实现边界后从 `ff7528d` 重做。重做后以 reviewSeries=`restart` 三轮收敛（5 P1 → 2 P1 → 0），completion gate `PASS`，Story `done`。

## Change-Controlled Decision（受控变更决策）

### Decision（决策）

- **A · 威胁模型边界**：resolver 面向协作式本地文件系统。In scope：Story ID 数字归一化与 fail-close、canonical / legacy 目录归属、symlink 越界检测（复用 `src/fs/path-normalizer.ts` 的 `findProjectBoundarySymlinkEscape`）、按 v2 文件名判定未完成 run（目录 D 含 series S 的未完成 run ⇔ D 的直接子文件中存在 S 的 review summary 且不存在 S 的 finalizer）、ambiguity 稳定诊断且零 mutation。Out of scope（明示）：hard link、CRLF、TOCTOU、伪造 frontmatter / 正文伪字段、产物真伪认证、审批重放、tracker 认证、freshness 比较。审批与 round 有效性继续归 runner 与 CR06；CR 对 out-of-scope 类 finding 按契约归 `dismiss`。
- **B · 实现位置**：与 Story 11.1 / 11.5 同构——逻辑在 `src/config/cr-directory.ts`，通过 `speclite resolve cr-directory` 暴露（SPEC 01 CommandResult，`speclite.resolve.cr-directory.v1`）；Skill 只调用 CLI，canonical Skill 包不随包投影 `.mjs`。不引入 ownership marker、per-write validator、frontmatter 解析器。`cr-directory.ambiguous-resume-root`（`lifecycle` / `error` / `block`）由 shared CR contract 拥有，不进入 SPEC 07。
- **C · 历史处置**：现有 234 个 CR 产物移入 `11-9-code-review/superseded-main/`；TODO-018~022 标 `superseded-by-restart`。不删除。

### Rationale（理由）

- 仓库 69 个 CR 目录全部已是 `N-M-code-review`，全历史无 title-bearing CR 目录；真实缺口只是缺可执行派生点、测试与 ambiguity 诊断 ID，不需要产物认证引擎。
- 决策 A 把 CR 的无限对抗面收敛到 Story 可承载的边界；决策 B 让实现可被 tsc / vitest / packaging 常规门禁覆盖；决策 C 保留全部历史证据。
- 不改变 PRD FR23g、Epic AC 1–12、requirement ID 或产品范围。

## Impact Analysis（影响分析）

- **Epic / Story**：仅 Story 11.9；Story 11.10 不受影响（仍以新 canonical state 为 baseline）。
- **Artifacts**：Story 文件新增 `Threat Model & Non-Goals` 章节，AC9 措辞明确为按 v2 文件名判定；Epic 11 Story 11.9 章节增加 Correct Course Decisions；`cr-contract.md` 增加 CR Directory Resolution；PRD 不变。
- **Technical**：`src/config/cr-directory.ts`、`src/commands/resolve.ts`、`src/config/resolve-output-schema.ts`、`test/cr-directory.test.ts`；8 个 canonical CR 包同步；fresh-install fixture 与 packaging manifest 重生成。

## Application Matrix（应用矩阵）

| Order | Owner / Artifact | Planned Change | State | Verification |
| --- | --- | --- | --- | --- |
| 1 | Correct Course brief（Story 11.9 Restart Brief） | 记录偏离、根因、决策 A/B/C 与执行清单 | approved | 项目负责人 2026-09-11 裁决 |
| 2 | 实现回退与归档 | 9 包回退到 `ff7528d`，产物归档，TODO 标记 | applied | commit `523ab4e` |
| 3 | Story / kickoff gate | Threat Model、AC9、Dev Notes、restart kickoff gate | applied | kickoff `PASS` |
| 4 | 实现 + 契约 + 测试 | resolver / CLI / schema / 8 包同步 / 29 tests | applied | commit `6079257`；vitest / docs:check / release:check PASS |
| 5 | CR 闭环（restart r1–r3） | 7 blocking 关闭，5 deferred 登记 | applied | commits `53195ae`、`bee8e07`、`22909c8`；completion gate `PASS`，CR06 `DONE` |
| 6 | Epic 11 / rules-summary | 记录决策 A/B/C；CR04 两条 global-eligible 并入既有 family | applied | 本提案随同 commit |

## Safety And Scope Boundaries（安全与范围边界）

- 不修改 report basename、round 编号、审批规则（AC12）。
- 不修改 PRD FR/NFR；不重开 Story 11.1–11.8。
- 不删除 `superseded-main/` 历史证据。
- 21 个非 Epic 11 未提交文件不纳入本变更任何 commit。

## Approval（批准）

- Decision approval: approved on 2026-09-11（决策 A / B / C）
- Application authorization: approved on 2026-09-11（"根据这个方案，开始执行"）
- Application state: applied
