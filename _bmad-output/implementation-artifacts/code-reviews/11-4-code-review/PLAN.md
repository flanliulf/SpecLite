# Plan（计划）

## Goal（目标）

在 Epic 11 strict-serial 约束下完成 Story 11.4 的 Analysis workflow artifact routing、三空间边界、legacy no-migration 与代码审查闭环；仅在 Story 11.4 满足全部完成条件后进入 Story 11.5。

## Current Epic（当前 Epic）

- Epic：11 — Phase-aligned Workflow Artifact Governance（阶段对齐的 Workflow Artifact 治理）
- 当前 Story：11.4 — Route Analysis Workflows Into Dedicated Artifact Subdirectories（将 Analysis Workflows 路由至专属 Artifact 子目录）
- 当前轮次：Completed

## Preflight Evidence（前置审计证据）

- Story 11.1–11.3的Story/tracker均为`done`，各自current completion gate为精确target/storyKey匹配的`PASS`；11.3最新Reviewer/Evaluator Round 3双通过，CR04/05/06完成。
- `sprint-status.yaml`：Epic 11为`in-progress`；Story 11.4为`ready-for-dev`；11.5–11.10仍为`ready-for-dev`。
- Story 11.4当前无kickoff/completion gate或CR历史；必须作为新Story启动，不能继承11.3 gate。
- Story 11.2已将`analysis_artifacts` root及三个fresh subject directories写入module/runtime projection；11.4 bounded scope是`1-analysis` producers、metadata/help/docs/fixtures与legacy compatibility，不得重复发明root resolver或进入11.5+。
- `docs/reference/workflow-artifact-layout.md`存在TODO-012覆盖的generic routing残留；11.4只关闭其明确覆盖的Analysis rows，其余跨Story内容保持open。

## Execution Checklist（执行清单）

- [x] Step 0：完成Story 11.4 live preflight与前序Story completion核验。
- [x] Step 1：初始化`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 2：fresh development recovery已独立审计并采用candidate；kickoff/completion gates均PASS，Story/tracker进入review。
- [x] Step 3a：Round 1因错误降级声明作废；fresh三层外层调度与aggregator完成有效Round 2 full-scope审查。
- [x] Step 3b：fresh Evaluator Round 2已完成；2项P1改裁为decision_needed，1项P2交CR TODO。
- [x] Step 3c：Owner于2026-09-04明确确认推荐A+B，resolved-root public contract与legacy dual-path policy已关闭。
- [x] Step 3d：fresh Fixer Recovery已独立采用A+B candidate并追加superseding record；下一步重新Reviewer/Evaluator。
- [x] Step 3e：三个fresh只读layer均完成；并发生成的Round 3 summary/evaluation因provenance与findings不匹配作废，fresh aggregator已生成有效replacement Reviewer Round 4。
- [x] Step 3f：fresh Evaluator Round 4确认3项均为P1 `patch`，Owner A+B已足够授权；失效Round 3与外部drawer均排除。
- [x] Step 3g：bounded Fixer Round 4已修复fresh config-absent、四处public docs旧口径与route helper path/file/symlink边界，并追加有效evaluation修复记录。
- [x] Step 3h：三个fresh Reviewer Round 5只读layers与fresh aggregator完成；Reviewer发现2项新的runtime-contract/basename patch并判定不通过。
- [x] Step 3i：fresh Evaluator Round 5确认2项均为P1 `patch`；裁定workflow同步HALT语义并使用trimmed project name生成basename。
- [x] Step 3j：bounded Fixer Round 5已同步两份workflow安全HALT语义，并以trimmed project name生成稳定basename，focused/canonical/diff通过。
- [x] Step 3k：三个fresh Reviewer Round 6只读layers与fresh aggregator完成；Reviewer确认2项新的readability/project-name binding patch并判定不通过。
- [x] Step 3l：fresh Evaluator Round 6确认2项均为P1 `patch`；授权open-readability probe与raw`core.project_name`显式绑定。
- [x] Step 3m：bounded Fixer Round 6已加入`open("r")`readability probe与raw`core.project_name`显式绑定，focused/canonical/diff通过。
- [x] Step 3n：三个fresh Reviewer Round 7只读layers与fresh aggregator均PASS，无新增findings。
- [x] Step 3o：fresh Evaluator Round 7判定`EVALUATION_PASS`，确认历史P1关闭且允许进入CR04。
- [x] Step 4a：fresh CR04已完成，新增/更新3条record-only项目规则并通过验证。
- [x] Step 4b：fresh CR05已完成，新增`TODO-015`登记Round2#3 broad scan evidence hygiene。
- [x] Step 4c：fresh CR06已完成，Story/tracker均更新为`done`并生成Round7 finalizer report。
- [x] Step 5：Story/tracker done、latest Reviewer/Evaluator PASS、CR04/05/06与三份日志完整，允许进入Story 11.5。

## Current Status（当前状态）

Story 11.4已完成：latest Reviewer Round7=`REVIEWER_PASS`、Evaluator Round7=`EVALUATION_PASS`，CR04/05/06严格串行完成，Story与tracker均为`done`，finalizer report已落盘。Round2#3已登记`TODO-015`；Round3 invalid provenance与external drawer/mirror/full caveat保持隔离。Next Story Gate通过，可进入Story 11.5 preflight。

## Termination Conditions（终止条件）

Story 11.4仅在development完成、kickoff/completion gate通过、最新Reviewer/Evaluator双通过、必要Fixer后复审复评、CR04/CR05/CR06完成、三份日志更新且Story/tracker为`done`时结束。任何11.5+ routing、migration、未授权owner contract扩展、删除或push均须停止。
