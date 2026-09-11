# Plan（计划）

## Goal（目标）

在 Epic 11 strict-serial 约束下完成 Story 11.5 的 Planning/Solutioning whole-sharded discovery contract、producer/consumer routing、兼容与代码审查闭环；仅在 Story 11.5 满足全部完成条件后进入 Story 11.6。

## Current Epic（当前 Epic）

- Epic：11 — Phase-aligned Workflow Artifact Governance（阶段对齐的 Workflow Artifact 治理）
- 当前 Story：11.5 — Govern Planning And Solutioning Documents As Whole And Sharded Artifacts（治理 Planning 与 Solutioning 文档的整篇与分片产物）
- 当前轮次：CR Reviewer Round 2

## Preflight Evidence（前置审计证据）

- Story 11.1–11.4 的 Story/tracker均为`done`；11.4 latest Reviewer/Evaluator Round7双通过，CR04/05/06完成，Next Story Gate允许进入11.5。
- `sprint-status.yaml`中11.5为`ready-for-dev`，11.6–11.10仍为`ready-for-dev`；11.5当前无kickoff/completion gate或CR历史。
- Story11.5要求PRD/Epics/Architecture进入phase-owned subject directories，whole与sharded使用单一decision table，ambiguity/broken/missing必须stable issue且block前零写入/零progress mutation。
- Story Dependency Gate要求完整decision table由`SPEC 09`承载或获得明确Owner批准；live `SPEC 09`当前只有phase-owned subject directory与确定性发现原则，未在preflight中发现完整state/continuation/evidence/issue table。
- 工作树包含11.1–11.4累计实现与外部untracked`assets/source/speclite/core-skills/speclite-drawer-er-modeler*`；后者及`.agents/.claude`镜像不得混入11.5。

## Execution Checklist（执行清单）

- [x] Step 0：完成Story11.5 live preflight与前序Story completion核验。
- [x] Step 1：初始化`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 2：fresh development recovery已完成owner contract、shared resolver、producer/consumer与fixtures；kickoff PASS、completion PASS_EQUIVALENT、Story/tracker为review。
- [x] Step 3：Reviewer/Evaluator Round8双PASS（0 P0/P1，1 P2 defer）。
- [ ] Step 4：CR04与CR05已完成（P2=`TODO-016`）；下一步CR06。
- [ ] Step 5：Story/tracker done与日志完整后，才进入Story11.6。

## Current Status（当前状态）

Reviewer/Evaluator Round8双PASS，CR04已新增三条规则，CR05已将candidate symlink taxonomy P2登记为`TODO-016`（open）。下一步fresh CR06核验全部completion gates并更新Story/tracker；完成前不得进入11.6。

## Termination Conditions（终止条件）

Story11.5仅在development完成、kickoff/completion gate通过、latest Reviewer/Evaluator双通过、必要Fixer后复审复评、CR04/05/06完成、三份日志更新且Story/tracker为`done`时结束。UX、validation filename、readiness rename、CR routing、artifact migration、外部drawer、删除或push均不在本Story授权范围。
