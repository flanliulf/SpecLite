# Plan（计划）

## Goal（目标）

在 Epic 11 strict-serial 约束下完成 Story 11.8 的 Implementation Readiness Skill exact rename、Solutioning routing、compatibility/update/legacy 保护与 bounded exact scan，并完成 latest Reviewer/Evaluator 双 PASS、CR04/05/06 后才进入 Story 11.9。

## Current Status（当前状态）

- Story 11.1–11.7 与 tracker 均为 `done`；11.7 latest Round 8 双 PASS 且 CR04/05/06 已完成。
- Story 11.8 Development已完成：kickoff=`PASS`、completion=`PASS_EQUIVALENT`、Story/tracker=`review`，无Owner Gate。
- Stable diagnostic唯一关闭：old-ID redirect不生成deprecation issue；modified old package复用`file-integrity.hash-mismatch`并由`update.conflicts`汇总。
- External drawer/zip、workspace mirrors与fixed-count drift继续隔离。

## Execution Checklist（执行清单）

- [x] Step 0：完成live tracker、Story、Epic corpus与前序completion preflight。
- [x] Step 1：fresh Development运行kickoff并冻结bounded surface manifest。
- [x] Step 2：完成实现与completion gate，Story/tracker进入`review`。
- [x] Step 3：Round4 latest Reviewer/Evaluator双PASS，历轮10个P1均闭环。
- [x] Step 4：严格串行CR04 → CR05 → CR06完成。
- [x] Step 5：Story/tracker=`done`，允许进入Story 11.9。

## Termination Conditions（终止条件）

不得依赖Story 11.9/11.10，不得修改IR algorithm/scoring/body或generic grill semantics；仅在全部Story 11.8 completion与CR closeout证据成立后完成。
