# Plan（计划）

## Goal（目标）

在 Epic 11 strict-serial 约束下完成 Story 11.3 的 existing-install compatibility、mismatch diagnostics 与 no-migration 开发及代码审查闭环；仅在 Story 11.3 满足全部完成条件后进入 Story 11.4。

## Current Epic（当前 Epic）

- Epic：11 — Phase-aligned Workflow Artifact Governance（阶段对齐的 Workflow Artifact 治理）
- Story 顺序：11.1 → 11.2 → 11.3 → 11.4 → 11.5 → 11.6 → 11.7 → 11.8 → 11.9 → 11.10
- 当前 Story：11.3 — Existing Install Compatibility And Diagnostics（Existing Install 兼容与诊断）
- 当前轮次：Story 11.3 Complete

## Preflight Evidence（前置审计证据）

- Story 11.1 与 Story 11.2 的 Story/tracker状态均为 `done`，两份current completion gate均为精确target/storyKey匹配的`PASS`。
- Story 11.2最新Reviewer Round 3与Evaluator Round 3均通过，CR04/CR05/CR06已完成，三份编排日志完整。
- `sprint-status.yaml`：Epic 11为`in-progress`；Story 11.3为`ready-for-dev`；11.4–11.10仍为`ready-for-dev`。
- Story 11.3尚无kickoff/completion gate、CR review/evaluation/fixer/finalizer产物，属于新Story开发步骤，不是CR续跑。
- `SPEC 07`尚未注册专用`config-artifact-mismatch` stable issue；kickoff必须关闭issue ID、configured/resolved/actual evidence schema与read-only/no-migration边界，否则HALT。
- 当前mixed worktree为同一Epic goal累计的Story 11.1/11.2实现与CR产物；Story 11.3必须在其上增量工作，不得回滚前序Story或混入11.4+ routing。

## Execution Checklist（执行清单）

- [x] Step 0：完成Story 11.3 live preflight、前序Story completion与current-state核验。
- [x] Step 1：初始化`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 2：fresh development sub-agent已完成`/bmad-dev-story story 11-3`；kickoff/completion gates均`PASS`，Story/tracker进入`review`。
- [x] Step 3：fresh CR Reviewer Round 1已完成；结论不通过，新增4个`[中]/patch` findings。
- [x] Step 4：Reviewer完成后启动fresh Evaluator；Evaluator Round 1结论不通过，4项均确认有效。
- [x] Step 5a：Evaluator agent越权落盘candidate fixes；外层已中断并记录role violation，candidate未直接作为合规Fixer结果。
- [x] Step 5b：fresh Fixer Recovery已独立审计4项P1、确认bounded implementation并追加superseding ownership record；full 490 passed/4 todo。
- [x] Step 5c：fresh Reviewer Round 2已完成；4个历史P1 Closed，但新增1个`[中][新]/patch` false-positive finding。
- [x] Step 5d：fresh Evaluator Round 2已完成；确认1个P1 bounded fix，无当前Owner Decision。
- [x] Step 5e：fresh Fixer Round 2已完成；仅收窄legacy Story actual evidence，full 491 passed/4 todo。
- [x] Step 5f：fresh replacement Reviewer Round 3已完成并通过；前一无响应Reviewer无产物且已中断。
- [x] Step 5g：fresh Evaluator Round 3已完成并通过；五项历史finding全部Closed，无当前Owner blocker。
- [x] Step 6a：fresh CR04已完成record-only规则提炼，新增CR-API-37/38/39与CR-SEC-18。
- [x] Step 6b：fresh CR05已完成；新增TODO-013与TODO-014，均为open/P2/Owner future。
- [x] Step 6c：fresh CR06 finalizer已完成；Story/tracker同步为done，Epic 11保持in-progress。
- [x] Step 7：三份日志与Story 11.3 completion criteria已完成外层readback核验。
- [ ] Step 8：只有Story 11.3完成后才进入Story 11.4。

## Current Status（当前状态）

CR06已完成并生成`11-3-cr-finalizer-20260903-main-round-3.md`。外层readback确认Story 11.3与tracker均为`done`，completion gate target/storyKey精确匹配且`PASS`，Round3 Reviewer/Evaluator唯一有效且双通过，CR04/05证据存在，Epic 11保持`in-progress`、Story 11.4保持`ready-for-dev`。Canonical strict与`git diff --check`通过。Story 11.3 completion criteria已全部满足，可以进入Story 11.4 Next Story Gate。

## Termination Conditions（终止条件）

Story 11.3仅在development完成、kickoff/completion gate通过、最新Reviewer/Evaluator双通过、必要Fixer后复审复评、CR04/CR05/CR06完成、三份日志更新且Story/tracker为`done`时结束。任何未关闭owner contract、需求边界变化、未授权文件修改、删除或push均须停止。
