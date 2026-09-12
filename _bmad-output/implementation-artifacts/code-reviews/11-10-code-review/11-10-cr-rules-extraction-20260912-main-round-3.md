---
schemaVersion: speclite.cr-rules-extraction.v2
artifactType: cr-rules-extraction
storyId: 11-10
storyKey: 11-10-inventory-all-grill-related-skill-references-for-human-confirmation
reviewSeries: main
round: 3
generatedAt: 2026-09-12T12:52:06+08:00
modelUsed: Claude Opus 5 (claude-opus-5)
evaluationSource: 11-10-code-review-evaluation-20260912-main-round-3.md
evaluationSourceHash: sha256:ec00e3ad716bd5c5b0edb3dedb0e7fb1fd9e6ead2c3fce959f3896b69d88e014
eligibleFindingSetHash: sha256:a087e5f5e9f872a20188680af71b6ea18edfdccb45cd0e17de54555d9ea4d64f
candidateRuleCount: 3
globalRuleEligibleCount: 0
result: COMPLETED
---

# CR Rules Extraction（CR 规则提炼）

## Binding Verification（绑定验证）

- Story、series、round：11-10 / main / 3（current evaluation `PASS_WITH_DEFERRED_TODOS`，p1=0）。
- Evaluation source/hash：`11-10-code-review-evaluation-20260912-main-round-3.md` / `sha256:ec00e3ad716bd5c5b0edb3dedb0e7fb1fd9e6ead2c3fce959f3896b69d88e014`。
- Eligible finding set hash：`sha256:a087e5f5e9f872a20188680af71b6ea18edfdccb45cd0e17de54555d9ea4d64f`（10 个 fingerprint：8 accepted-then-resolved + 1 deferred + 1 VERIFY→前置条件；排除 3 dismissed：R1-F9、R3-F1，以及 R1-F7 作为 finding 的 dismissed 处置——其根 invariant 仍计入 eligible 以提炼规则）。
- crDir 由 orchestrator 传入（canonical），未重推导。

## Model Timeline（模型时间线）

| 轮次 | 角色 | 模型 | Evidence caveat |
|---:|---|---|---|
| 1 | reviewer 三层 + aggregator | Claude Opus 5 (claude-opus-5) | 首次启动被 session 中断（无输出），同输入重跑 |
| 1 | evaluator / fixer（patch，仅 Story 文件） | Claude Opus 5 (claude-opus-5) | fix commit `c2eb474` |
| 2 | reviewer 三层 / evaluator / fixer | Claude Opus 5 (claude-opus-5) | fix commit `d1d1f54` |
| 3 | reviewer 三层 / evaluator | Claude Opus 5 (claude-opus-5) | `PASS_WITH_DEFERRED_TODOS` |

单一模型家族为 evidence caveat；每轮 blocking finding 均有脚本 validator 第一手复核（重建扫描树、269 行逐条比对）。

## Eligible Evidence（合格证据）

| 发现指纹 | Disposition | 验证证据 | 跨 Story 复现 |
|---|---|---|---|
| `sha256:d67075a0dd0a233a1f1373cc7ce6b3eb3afe43cdc281be6e18b18050ea4105d8`（R1-F1） | accepted P1 (r1) → resolved (r2) | r2 三层 validator 计数 2/59 | 否 |
| `sha256:7059edc3124572f6d49f6dea5194a7c82b9a9c90900bb6621ac487fb01e4d214`（R1-F2） | accepted P1 (r1) → resolved (r2) | r2 269 行反引号成对、literal ⊂ raw | 否 |
| `sha256:b0b85677f9d6011ce95feeec5939219591de0e0749796cd28212c5e25a28ee1d`（R1-F3） | accepted P1 (r1) → resolved (r2) | r2 文案核对 | 否 |
| `sha256:c6d8d3c43ee98a2d51b0cfa6c09183123e10f62e1057b7a79d2350b1dfd44292`（R1-F4） | accepted P1 (r1) → resolved (r2) | r2 G176 | 否 |
| `sha256:5b30af7c65c1c126d024b0640111681ddb36d76503013d361e3f98d31dbb854d`（R1-F5） | accepted P1 (r1) → resolved (r2) | r2 :56 核对 | 否 |
| `sha256:ab4c1540c66965e0fe1f75fbb589ca1ecb5b09cf5798d098bc0e1af3dc92649e`（R1-F6） | accepted P1 (r1) → resolved (r2) | r2 `rg -a` 集合一致 | 否 |
| `sha256:2a2c5112174b2b4a5f2b751962282cdaf8a7101079e39bd39084cfa17ddf54e7`（R1-F7） | VERIFY (r1) → Story 侧 resolved (r2) → gate 转 CR06 前置条件 (r3) | r2 Post-confirmation 小节 + File List；r3 gate STALE 转前置条件 | 是：CR-PROCESS-03（11-9 main，完成证据绑定 predecessor graph 与 freshness）同 family |
| `sha256:2aa33e08aed8bcf90107d218d7ab644b1c056a9c9c37c9c90a9cd366e364693e`（R1-F8） | deferred T2 (r1–r3) | 三轮 gate 无 stories/ 路径 | 否 |
| `sha256:ed4ffc64739e318f09b56d97b72158bbc1ee55f5d0fa00a907e89cd48d72d39b`（R2-F1） | accepted P1 (r2) → resolved (r3) | r3 per-file dirty 0 不一致，10 条署名行 Target 一致 | 否 |
| `sha256:43d8fa8386d1760aa1c9d9585d7df0173a5579ee117281d80a7afd918a8c26da`（R2-F2） | deferred T3 (r2) → resolved 顺带 (r3) | r3 22 = 18 + 4，0 命中 | 否 |

统计：全部 finding 均为 inventory 文档产物自身的自洽性 / 留痕问题（分类 1、literal 截断 1、计数措辞 1、字段矛盾 1、出处标注 2、exclusion 准确性 2、AC11 留痕 1、AC8 载体 1）；无源码 / canonical Skill 缺陷；三处 canonical change（B1 / B2 / B4）三轮均未被指出问题。修复引入回归 1 次（R1-F1 修复覆盖 dirty 标注 → R2-F1），round 3 归零。

## Excluded Evidence（排除证据）

| 来源 | 排除理由 |
|---|---|
| R1-F9 `sha256:0414dad9…` | dismissed：脏工作树 manifest 漂移源于 scope 外用户未提交 skill-lint 文件 |
| R3-F1 `sha256:a993c4dd…` | dismissed：exclusion glob 为概括性描述，可核验断言全部为真 |

## Candidate Rules（候选规则）

### CR-11-10-R1: 机器生成的 inventory 表格必须用独立 validator 断言字段自洽（分类一致性、literal 完整性、计数 = 正文、per-file 标注一致），而不只断言 match-to-entry 计数

- 类型：`best-practice`
- 适用范围：以 Markdown 表格交付的 audit / inventory 类 Story 产物。
- Evidence：R1-F1（子串误命中导致分类错误、计数派生错误）、R1-F2（硬截断无省略标记）、R1-F4（Target 与 Note 互斥）、R2-F1（修复覆盖既有标注）——四者均在 raw 269 = entries 269 的 reconciliation 通过下仍存在；round 2–3 三层各自的 validator 才把它们机械化。
- Global eligibility：`candidate-rule`（单 Story）。
- 例外：无。

### CR-11-10-R2: 修复 inventory 条目时只改目标字段，不得整体重写含多段语义的 Note / Target

- 类型：`avoidance`
- 适用范围：文档类 fixer 操作。
- Evidence：R2-F1（R1-F1 修复把 G022 Note 从 `dirty-worktree` 整体替换为署名说明，丢失出处标注；同时 Target 偏离 evaluator 指定且 fixRecord 未记录理由）。
- Global eligibility：`candidate-rule`。
- 例外：无。

### CR-11-10-R3: 用户确认后的 canonical change 作为 Story change 落地时，必须同步 Story File List、AC 评估结论留痕，并在 CR 结束前重生成 completion gate

- 类型：`principle`
- 适用范围：read-only audit Story 之后由用户裁决触发的独立 change commit。
- Evidence：R1-F7（12 个 change 文件未入 File List、"Story change" 结论未字面留痕、completion gate 早于 change commits 导致 CR06 freshness 必 HALT）。跨 Story：CR-PROCESS-03（11-9 main series，完成证据绑定 predecessor graph 与 source freshness）同 family，但该规则来源已随 11.9 restart 标为历史。
- Global eligibility：`candidate-rule`（family 在 11-9 的来源为 superseded main series，不据此升格）。
- 例外：无。

## Document Suggestions（文档建议）

| Candidate rule | 建议文件/章节 | 是否需要用户授权 | 理由 |
|---|---|---|---|
| CR-11-10-R1 / R2 / R3 | `cr-rules/cr-rules-summary.md` 仅记录（不升格） | 是（全局文档） | 单 Story 候选；R3 family 的既有来源为 superseded 记录 |

本 report 未修改任何全局文档。

## Result（结果）

- 结果：`COMPLETED`
- 下一步：`speclite-code-review-05-todo-tracker`（mode=closeout，登记 R1-F8 T2）

---

*本文档由 speclite-code-review-04-rules-extractor Skill 自动生成*
