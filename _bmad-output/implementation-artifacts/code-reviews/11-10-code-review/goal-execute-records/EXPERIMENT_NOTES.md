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
