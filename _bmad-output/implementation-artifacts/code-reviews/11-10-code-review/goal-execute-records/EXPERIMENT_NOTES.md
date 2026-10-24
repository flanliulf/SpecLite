# Experiment Notes（实验备注）

## 2026-09-12 — Inventory Decisions（盘点决策）

- 实时判断：单 token `grill` 已覆盖 AC2 全部 variants，无需多 token；"machine match" 取 rg 行级输出，行内多 literal 全列，避免行内去重造成 match-to-entry 不可回查。
- 分类边界：同一行同时含新 output 路径与 legacy `ir-grill/` 只读发现条款（IR check SKILL zh/en:19/18）按 11.8 ledger 判 compatibility，不判 regression。
- 用户介入点：B1 是否提交工作树修正；B2–B5 是否立项；inventory 是否作为 completion evidence。本 Story 不代用户决定。

## 2026-09-12 — Orchestrator Observations Not Reviewed（未进入 CR 的观察）

- G113（`docs/reference/workflow-artifact-layout.md:170`）：裸反引号 `ir-grill/` 只读发现条款分类为 active/none，与 G032/G033/G035/G076/G092（compatibility）不一致；非 11.8 exact regression。
- B4 / B5 / B2 引用的条目（G043/G046/G049/G059/G072/G087/G088、G093、G099）Rec 为 keep，与 §B "待确认" 不一致（现已裁决，可标 `confirm → resolved`）。
- 条目表引言"File:line 可直接回查"未注明基准 HEAD 3cc1ba9；cfe49c1 后 reviewer CHANGELOG 行号 +6。
- 用户介入点：以上为 Story 文档一致性问题，round 3 已 PASS；是否作为 Story done 后的 docs follow-up（需 fresh review）由用户决定。

## 2026-10-24 — Completion Audit Decisions（完成审计决策）

- 判断：上述三项观察已在用户授权的 post-done docs follow-up 中修正，并经 fresh review 通过；证据为 `EXPERIMENTS.md` 最后一条 2026-09-12 记录及提交 `ec3f3a0`。它们不再等待用户裁决。
- 当前闭环：Story 11.10 的 main Round 3 evaluation 为 `PASS_WITH_DEFERRED_TODOS`，CR04/05 完成，CR06 为 `DONE`；Epic completion gate 为 `PASS`，十个 Story 与 Epic tracker 均为 `done`。
- 决策：续跑以当前仓库为准；不恢复已被 restart 取代的 11.9 旧流程。只修正目标内的日志缺口，不改源码、不改现有 Epic 12/13 与 AGENTS 改动。
- 证据边界：2026-09-12 的测试数属于历史记录。本次验证在当前 HEAD 的临时副本中运行，避免 build / packaging 生成物改写用户工作树；结果单独记入 `EXPERIMENTS.md`。
- 交付要求：最终回复提供 [Story 11.10 inventory](../../../stories/11-10-inventory-all-grill-related-skill-references-for-human-confirmation.md) 的可点击路径。非阻塞 TODO 不冒称已修复。
