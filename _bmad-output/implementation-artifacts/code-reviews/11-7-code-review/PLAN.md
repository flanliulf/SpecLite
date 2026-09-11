# Plan（计划）

## Goal（目标）

在 Epic 11 strict-serial 约束下完成 Story 11.7 的 PRD validation exact dated report filename、single-invocation date、same-day pre-write hard block、legacy discovery/preservation 与 CR 闭环；仅在 Story 11.7 满足全部 completion 条件后进入 Story 11.8。

## Current Status（当前状态）

- Story 11.1–11.6 与 tracker 均为 `done`；11.6 latest Reviewer/Evaluator Round 5 双 PASS，CR04/05/06 已完成。
- Story 11.7 Development已完成：kickoff=`PASS`、completion=`PASS_EQUIVALENT`、Story/tracker=`review`，无Owner gate。
- Scope锁定：`prd-validate-report-{yyyy-MM-dd}.md`、runtime date一次固定、same-day existing target read-only block、legacy reports原位保留、no suffix、SPEC 07 stable issue。
- External `speclite-drawer-er-modeler`、zip、IDE mirrors与fixed-count drift继续隔离。
- Round8 latest Reviewer/Evaluator双PASS，CR04/05/06均完成；Story与tracker=`done`，允许进入Story 11.8。

## Execution Checklist（执行清单）

- [x] Step 0：完成live tracker、Story、Epic corpus与前序completion preflight。
- [x] Step 1：初始化Story 11.7三份执行记录。
- [x] Step 2：fresh `bmad-dev-story`完成；kickoff PASS、completion PASS_EQUIVALENT、Story/tracker review。
- [x] Step 3：Round8 latest Reviewer/Evaluator双PASS，历轮P1均闭环。
- [x] Step 4：严格串行CR04 → CR05 → CR06完成。
- [x] Step 5：Story/tracker=`done`，允许进入Story 11.8。

## Termination Conditions（终止条件）

Story 11.7仅在development、kickoff/completion gates、latest Reviewer/Evaluator双PASS、必要Fixer复审复评、CR04/05/06、日志与Story/tracker=`done`全部成立时完成。不得处理validation rules/scoring/report body、IR filename、Story 11.8+、external drawer、删除或push。
