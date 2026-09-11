# Experiments（实验记录）

## 2026-09-05 — Live Preflight

- Story ID：11.8
- 结果：11.1–11.7均`done`且completion/CR closeout完成；11.8=`ready-for-dev`，hard predecessor gate满足。
- Scope：两个exact old IDs→new IDs、fresh-only-new projection、`renamedFromCanonicalSkillIds`、Solutioning fixed root、update/drift/legacy与bounded exact scan。
- Stable diagnostics：kickoff必须核对`SPEC 07`，不得由producer/activation/update planner临场生成free-form issue。
- Boundary：IR algorithm/scoring/body、generic grill semantics、Story11.9/11.10、external drawer/zip/mirrors/fixed counts排除。
- 下一步判断：启动fresh `bmad-dev-story`并先运行Story11.8 kickoff。

## 2026-09-05 — Development Result

- Story ID：11.8
- 结果：kickoff=`PASS`、completion=`PASS_EQUIVALENT`、Story/tracker=`review`，无Owner Gate。
- Stable contract：old ID直接redirect；modified old package复用`file-integrity.hash-mismatch`redaction-safe details并由`update.conflicts`阻断，无新issue ID。
- Implementation：两个exact package rename、`skill_renames`→`renamedFromCanonicalSkillIds` projection、fresh-only-new、Solutioning fixed route、update rename/reprojection、drift protection、legacy read-only discovery、bounded exact scan。
- Verification：focused43/43；build/docs/density/canonical strict/packaging/diff PASS；full677 pass/12 fail/4 todo，十二项仅external drawer fixed counts。
- Boundary：未改IR algorithm/scoring/body、generic grill semantics、Story11.9+、drawer/mirrors/fixed counts，未commit/push。
- 下一步判断：启动fresh Reviewer Round1三层只读审查。

## 2026-09-05 — CR Reviewer / Round 1

- 结果：FAIL；3/3有效layers，fresh aggregator将13 raw candidates去重为6 P1/0 P2，Owner Gate NONE。
- P1：target-writer TS2345/未消费参数；Grill resolver route+D1 truth；真实old-ID activation/双active；authorized apply/precondition；bounded scan ledger；legacy behavior preservation。
- 下一步判断：启动fresh Evaluator Round1。

## 2026-09-05 — CR Evaluator / Round 1

- 结果：FAIL；6/6 P1确认，0 P2，Owner Gate=`NONE`。
- 收敛：resolver failure HALT/zero-write；clean-existing deterministic redirect；方案I raw-byte/no-follow candidate scan+逐match ledger，不扩11.10。
- 授权：仅evaluation列出的9个实现/文档/test/fixture文件与evaluation append。
- 下一步判断：启动fresh Fixer Round1。

## 2026-09-05 — CR Fixer / Round 1

- 结果：6/6 P1已修复，evaluation追加fix record，Owner Gate NONE。
- RED/GREEN：focused 5 pass/2 fail、update 33 pass/1 fail与target-writer TS2345 → focused47/47，Story-owned TS2345零匹配。
- Fix：resolver-only Grill route+D1 docs；transactional clean-old redirect；2×2 authorized apply与四类precondition；方案I 24-occurrence ledger；真实legacy lifecycle preservation。
- Gate：root affected rerun=`119 pass/4 fail`，四项仅drawer；UTC/HEAD/current command已刷新。
- 下一步判断：启动fresh Reviewer Round2。

## 2026-09-05 — CR Reviewer / Round 2

- 结果：Acceptance PASS、Blind/Edge FAIL；fresh aggregator确认3 P1/0 P2，Owner Gate NONE。
- P1：existing root resolver吞`ok=false`后fallback写；方案I control-plane与ledger同源；redirect entrypoint缺typed rename/replacement及幂等重放。
- Round1既定六项closure保持关闭。
- 下一步判断：启动fresh Evaluator Round2。

## 2026-09-05 — CR Evaluator / Round 2

- 结果：FAIL；3/3 P1确认，0 P2，Owner Gate=`NONE`。
- 授权：限定resolver fail-close、独立freeze、actual redirect plan语义；排除Story11.10/drawer/global tsc/build/full/packaging。
- 下一步判断：启动fresh Fixer Round2。

## 2026-09-05 — CR Fixer / Round 2

- 结果：3/3 P1已RED→GREEN，evaluation追加fix record，Owner Gate NONE。
- Fix：`ok=false` issues传播且pre-transaction HALT；6/3/6 independent freeze；首次typed rename与二次typed skip携唯一replacement，stable sourceRef。
- Verification：root focused50/50；affected122 pass/4 fail且仅drawer；fixture diff=0，未跑build/full/packaging。
- 下一步判断：启动fresh Reviewer Round3。

## 2026-09-05 — CR Reviewer / Evaluator / Fixer Round 3

- Reviewer：Blind/Acceptance PASS、Edge FAIL；aggregator确认唯一P1为walker隐式跳过任意`dist/node_modules`，Owner Gate NONE。
- Evaluator：限定test-local walker与系统临时probe，不改fixture/ledger，不扩Story11.10。
- Fixer：probe先得`1 failed / 8 skipped`，移除basename skip后focused51/51；fixture保持6/3/6/24。
- Gate：root affected=`123 pass/4 fail`，四项仅drawer；UTC/HEAD/current command已刷新。
- 下一步判断：启动fresh Reviewer Round4。

## 2026-09-05 — Round 4 Double-PASS And Closeout

- Reviewer：3/3 layers及fresh aggregator均PASS，P1/P2=0/0，Owner Gate NONE；Round1–3共10项P1全CLOSED。
- Evaluator：独立PASS，0 P1/P2/defer，ALLOW CR04。
- CR04：新增`CR-API-43`，去重更新`CR-API-37`、`CR-TEST-08`、`CR-TEST-02`、`CR-DOC-05`。
- CR05：evidence-based no-op，无P2/defer；broad inventory/drawer/global tsc不登记。
- CR06：Story/tracker`review -> done`；Epic11仍in-progress，11.9仍ready-for-dev；finalizer evidence已绑定各门禁身份/hash。
- 下一步判断：允许outer owner进入Story11.9 preflight/kickoff。
