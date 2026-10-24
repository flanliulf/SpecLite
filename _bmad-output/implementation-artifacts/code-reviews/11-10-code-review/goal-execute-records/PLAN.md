# Plan（计划）

## Goal（目标）

在 Story 11.9 restart 之后的 current tree 上完成 Story 11.10 的 broad read-only grill reference inventory：100% match-to-entry、分类 / 关系 / ZH-EN parity 完整、11.8 regression 与治理候选分离，并向用户请求人工确认；不修改任何被盘点的 canonical 定义。

## Current Status（当前状态）

- Story 11.1–11.10 与 tracker 均为 `done`；Epic 11 completion gate 为 `PASS`，Epic 与 retrospective 均已完成。
- Inventory 已写入 Story 文件：raw 269 / entries 269 / unmapped 0；11.8 regression 0。用户裁决、CR 修正与 done 后 docs follow-up 均已记录；盘点结果不是修改被盘点定义的授权。
- 当前轮次：`main` Round 3 已收口。Evaluation 为 `PASS_WITH_DEFERRED_TODOS`，CR04/05 完成，`TODO-028` 已登记，CR06 为 `DONE`。2026-10-24 对账补齐本计划；不恢复旧会话或重跑已完成流程。

## Execution Checklist（执行清单）

- [x] Step 0：核验 predecessors，记录 HEAD / tree / dirty identity，运行 kickoff gate。
- [x] Step 1：deterministic scanner（`rg` 单 token，固定 scope / exclusions），raw 269 行。
- [x] Step 2：规则化分类 + 逐条人工复核；关系 / parity / 高风险摘要。
- [x] Step 3：写入 Story `Grill Reference Inventory` 章节；read-only 前后比较一致。
- [x] Step 4：completion gate → 向用户展示摘要 / 高风险 / 歧义并取得确认；裁决已写入 Story 与执行记录。
- [x] Step 5：CR01 → CR02 →（必要时 CR03）→ CR04 → CR05 → CR06（reviewSeries=`main`，Round 3 收口）。
- [x] Step 6：用户授权的 done 后 docs follow-up 已修正并经 fresh review 通过，提交 `ec3f3a0`；Epic completion gate 提交 `17633f5`，Epic done 提交 `219f6f5`。

## Termination Conditions（终止条件）

不得修改被盘点的 Skill / docs / tests / src；不得根据 inventory 擅自 rename / delete / rewrite；"已列出"不等于批准；治理候选须等待用户确认并另立 Story / change。
