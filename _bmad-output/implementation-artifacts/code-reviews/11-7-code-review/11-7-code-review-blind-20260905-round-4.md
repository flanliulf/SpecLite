---
Story: 11-7
Round: 4
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。发现 `1` 个 P1 evidence blocker，`0` 个 P2。Round 3 Finding #2（lifecycle metadata zero intersection）与 Finding #3（same-basename all-entry inventory）在当前 bounded slice 内已闭环；Finding #1（classified negative / role inventory）仍可被常见 assignment/URL delimiter、复合 report override key，以及 private script 中位于既有切片之外的新 producer 绕过，因此 completion gate 对“完整 fail-close classifier / exact role inventory”的 PASS 声明尚不能成立。

## Findings（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Classified negative / role inventory 仍存在三条确定性 false-green 路径

- **Location**：`test/prd-validation-report-path.test.ts:624-700,708-720,440-490`
- **Affected contract**：Story 11.7 AC5、AC6、AC9；Round 3 Finding #1；completion gate 中“完整 framed/unframed basename classifier、config filename/path override keys及private exact set/role均有独立fail-close断言”的声明。

#### Evidence（证据）

1. `findNextManagedPrefix()` 只接受 start、`/` 或 `/[\s([{:]/` 作为 managed prefix 的前界（`test/prd-validation-report-path.test.ts:680-700`），不接受 shell/TOML-style assignment 与 URL query 中常见的 `=`。将 current helper 原样应用于下列输入时，均找不到 managed basename：

   - `REPORT=prd-validation-report-old.md`
   - `url?report=prd-validation-report-old.md`

   这意味着 active producer/help/example 可用无空格 assignment 或 query-form declaration 引入 forbidden basename，而 corpus test 仍保持绿色。当前 adversarial matrix 只把 filename 放进引号 value（`test/prd-validation-report-path.test.ts:497-524`），没有覆盖该边界。

2. `isReportTargetOverrideKey()` 仅在 key 含 `filename`、精确等于 `path_override`，或同时含 `report` 与其有限 target-role vocabulary 时拒绝（`test/prd-validation-report-path.test.ts:708-720`）。因此当前 predicate 对以下明显 report-directed key 全部返回 `false`：

   - `validation_report`
   - `prd_report`
   - `report_output`
   - `report_destination`

   当前 forbidden-key matrix（`test/prd-validation-report-path.test.ts:424-435`）证明 bare `report` 必须拒绝，却允许增加 `validation_` / `prd_` qualifier 后绕过；`output` / `destination` 也未进入 target-role vocabulary。Published config 因此仍可新增 report target/output override surface而不触发独立 key gate。

3. Generic managed-basename scan 对 private script 执行整文件 `continue`（`test/prd-validation-report-path.test.ts:483-490`）。其替代 assertions 只检查当前 `execute...`、`discover...` 与 `inspectTarget...resolveRoots` 三个固定切片，以及两个常量的出现次数（`test/prd-validation-report-path.test.ts:440-476`）。若在这些切片之外新增第二个 function/CLI branch，并直接以另一 hard-coded legacy/suffixed basename 调用 `writeFile()`，现有全部 private-role assertions仍可通过。也就是说，当前证据证明了已知 producer 的 shape，却没有证明 private script 不存在第二 producer/default；这正是 Round 3 要消除的 whole-file skip false-green。

#### Impact（影响）

当前 canonical corpus 没有发现上述实际违规，因而这不是已证实的 runtime functional defect；但三条反例均可在不改变现有 oracle 期望的情况下引入 AC6 active default / second producer。由于 Round 3 的修复目标本身是关闭 test-oracle false-green，且 completion gate已把该闭环声明为 PASS，本缺口仍是 CR closeout 的 P1 evidence blocker。

#### Suggested bounded fix（建议的最小修复）

- 为 unframed classifier 增加 assignment/query delimiter 反例，并用明确的 filename-token boundary 规则覆盖 `=`（至少同时覆盖上述两例），同时继续避免把普通标识符中的子串误判为 basename。
- 扩充 config key 的 report-directed role vocabulary，至少使 `validation_report`、`prd_report`、`report_output`、`report_destination` fail-close；保留 `output_folder`、`planning_artifacts`、`implementation_artifacts` 的既有 allow cases。
- 不再整文件跳过 private script。可以先精确剔除被允许的 script filename、`REPORT_PREFIX` 与 ordered `LEGACY_PATTERNS` declaration，再对剩余文本运行 managed-basename scan；或建立等价的全文件 producer/write-target inventory，证明只有唯一 canonical write target。
- 只需修改 `test/prd-validation-report-path.test.ts`；不需要 source 语义选择。

## Closed Checks（已闭环检查）

1. **Round 3 Finding #2 — PASS**：install `plannedWrites` / issues、update/repair `changedPaths` / conflicts 已分别投影，并逐 surface 与完整 protected report path set 求交后精确断言 `[]`（`test/prd-validation-report-path.test.ts:210-219,266-275,306-315,851-859`）。原先 `not.arrayContaining(allPaths)` 的“仅全部污染才失败”逻辑已移除。
2. **Round 3 Finding #3 — PASS**：`findNamedEntries()` 在递归前对每个 entry 做 no-follow `lstat`，记录 `location + type`，仅递归真实 directory（`test/prd-validation-report-path.test.ts:822-848`）；独立反例证明 symlink、directory 与 FIFO/other 均进入 inventory（`test/prd-validation-report-path.test.ts:589-612`），lifecycle snapshot只允许 owner内 expected regular集合（`test/prd-validation-report-path.test.ts:787-819`）。
3. **Focused execution — PASS**：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。该绿色结果不反驳 Finding #1，因为上述反例尚未进入 test matrix。
4. **Prior functional closure maintained**：未发现证据重开 exact dated target、single invocation date、same/different-content block、commit-time recheck、legacy preservation、downstream physical owner chain、Step 2–13 path binding或stable issue ID。
5. **Rejected candidate maintained**：Step 13 frontmatter仅为 File references；Round 3 对 `{validationInvocationDate}` 不必重复登记的驳回仍成立。
6. **Excluded external drift**：`speclite-drawer-er-modeler/`、zip、workspace IDE mirrors及 fixed-count drift按任务边界排除，未作为 Story finding。

## Owner Gate（Owner 决策门）

`NONE`。Finding #1 是确定性的 focused test-oracle 修补，不涉及产品、Architecture、Story范围或runtime语义选择。Fresh Evaluator 可独立裁决；若确认，Fixer 应仅修改授权的 focused test 与 evaluation append，不得修改 source、Story、tracker、completion gate、既有CR产物、external drawer/zip、IDE mirrors或fixed-count baselines。

