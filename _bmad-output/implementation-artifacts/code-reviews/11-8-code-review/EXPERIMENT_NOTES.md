# Experiment Notes（实验备注）

## 2026-09-05 — Initial Decision（初始决策）

- 实时判断：hard predecessors满足，但`ready-for-dev`不构成实现授权；必须由fresh Development先产出exact target-matched kickoff gate。
- 身份不变量：fresh install只投影new IDs；old IDs仅可出现在typed compatibility/legacy/fixture分类，不能保留active package/help/phase row。
- 路由不变量：两个Skills默认写入`{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`；readiness basename保持，grill naming不顺带改变。
- 用户介入点：仅当stable diagnostic code/category/details/redaction无法由current `SPEC 07`唯一决定时触发`DECISION_NEEDED`。

## 2026-09-05 — Development Result（开发结果）

- 实时判断：stable diagnostic已由current SPEC唯一关闭，无需Owner决策；implementation与bounded scan可进入fresh Reviewer。
- Reviewer重点：fresh-only-new identity、mapping uniqueness、old redirect、update plan/precondition、modified-old zero-write、two routes/basenames、legacy no-migration与exact scan分类。
- Completion边界：full非绿仅drawer fixed counts，故gate为`PASS_EQUIVALENT`，不能表述为full green。
- 用户介入点：无。Reviewer findings必须交fresh Evaluator后才能修复。

## 2026-09-05 — Round 1 Review/Fix Result（第一轮审查修复结果）

- 实时判断：Development主体存在6个真实实现/证据缺口，均由Evaluator唯一化且已按白名单修复；无Owner决策。
- Activation/update：old ID不再停留在未消费resolver，clean-existing redirect与active reprojection同事务，precondition失败zero-write。
- Routing/evidence：Grill只消费resolver root；D1 current truth同步；方案I scan逐match ledger与真实legacy tree invariants闭环。
- TypeScript：Story-owned target-writer TS2345已消失；全局`tsc --noEmit`的135个其他错误保留为基线事实，不误报全绿。
- 用户介入点：无。下一步fresh Round2复审，未获Evaluator授权不得继续修改。

## 2026-09-05 — Round 2 Review/Fix Result（第二轮审查修复结果）

- 实时判断：Round1 closure稳定，但resolver fail-close、方案I独立control-plane与actual redirect machine-plan semantics仍有3个残余，已按唯一边界修复。
- Fail-close：resolver stable issues不再被legacy fallback吞掉；transaction前即HALT/zero-write。
- Evidence/identity：freeze constants独立于fixture；redirect首次与幂等重跑均携typed reason/replacement。
- 用户介入点：无。root evidence current，下一步fresh Round3双门禁。

## 2026-09-05 — Round 3 Review/Fix Result（第三轮审查修复结果）

- 实时判断：方案I control-plane仍有一个独立隐式exclusion，已用真实临时树probe闭环；未改fixture或扩大scan vocabulary。
- 用户介入点：无。root evidence current，下一步fresh Round4。

## 2026-09-05 — Closeout Result（收口结果）

- 实时判断：Round4 latest双PASS、CR04/05/06均完成，Story11.8真正达到done。
- Tracker：Epic11保持in-progress；Story11.9未提前启动。
- Governance：canonical checker current ok/findings=[]；147-path全局decision record留Epic最终统一收口，不在CR06扩面。
- 用户介入点：无。下一步Story11.9 fresh Development kickoff。
