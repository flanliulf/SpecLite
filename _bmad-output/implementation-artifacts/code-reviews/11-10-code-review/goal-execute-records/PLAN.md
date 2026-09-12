# Plan（计划）

## Goal（目标）

在 Story 11.9 restart 之后的 current tree 上完成 Story 11.10 的 broad read-only grill reference inventory：100% match-to-entry、分类 / 关系 / ZH-EN parity 完整、11.8 regression 与治理候选分离，并向用户请求人工确认；不修改任何被盘点的 canonical 定义。

## Current Status（当前状态）

- Story 11.1–11.9 与 tracker 均为 `done`；11.10 = `in-progress`，kickoff gate `PASS`（2026-09-12）。
- Inventory 已写入 Story 文件：raw 269 / entries 269 / unmapped 0；11.8 regression 0；治理候选 B1–B6。
- 等待用户对 B1–B5 与 completion evidence 的确认；确认后进入 CR 闭环与 CR06。

## Execution Checklist（执行清单）

- [x] Step 0：核验 predecessors，记录 HEAD / tree / dirty identity，运行 kickoff gate。
- [x] Step 1：deterministic scanner（`rg` 单 token，固定 scope / exclusions），raw 269 行。
- [x] Step 2：规则化分类 + 逐条人工复核；关系 / parity / 高风险摘要。
- [x] Step 3：写入 Story `Grill Reference Inventory` 章节；read-only 前后比较一致。
- [ ] Step 4：completion gate → 向用户展示摘要 / 高风险 / 歧义并请求确认。
- [ ] Step 5：CR01 → CR02 →（必要时 CR03）→ CR04 → CR05 → CR06（reviewSeries=`main`）。

## Termination Conditions（终止条件）

不得修改被盘点的 Skill / docs / tests / src；不得根据 inventory 擅自 rename / delete / rewrite；"已列出"不等于批准；治理候选须等待用户确认并另立 Story / change。
