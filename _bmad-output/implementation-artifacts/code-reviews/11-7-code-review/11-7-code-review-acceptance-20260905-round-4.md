---
Story: 11-7
Round: 4
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Acceptance Auditor
Type: Code Review Layer Result
---

# Acceptance Review（验收审查）

## Verdict（裁决）

**FAIL** — 发现 `1` 个 P1 blocking finding，`0` 个 P2。Story 11.7 的 producer、single-date、same-day block、legacy lifecycle、downstream owner chain及 Round 3 的 lifecycle zero-intersection / all-entry inventory均有 current evidence；但 Round 3 Finding #1 的 test-only 修复仍存在两个可确定复现的 false-green 分支，因而 completion gate 对“完整 framed value”与“config filename/path override keys”均已 fail-close 的 PASS 陈述不成立。

Current corpus 未发现已经写入非法 basename 或 config override；本 finding 是 AC5/AC6/AC9 的可执行回归证据仍不充分，不把它误报为 production 已发生命名漂移。

## Scope And Evidence（范围与证据）

- 已核对 Story 11.7、Epic 11 Story 11.7、PRD `FR23e`、`SPEC 07` stable issue、`SPEC 09` lifecycle边界、current bounded diff、Round 1–3 summary/evaluation/fix records与current completion gate。
- 已运行 `npx vitest run test/prd-validation-report-path.test.ts`：`1 file / 10 tests passed`。
- 已执行两个只读最小复现：quoted/code-span中managed prefix带前置文本时，current helper返回被截断的合法canonical token；config role predicate对`report_output`、`report_destination`、`report_directory`均返回`false`。
- 未运行 build、full suite或packaging；未修改 source、tests、Story、tracker、gate或既有CR产物。
- `assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip、workspace IDE mirrors与fixed-count drift不属于本层审查，明确排除。

## Finding（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Round 3 的 framed-value 与 config-role oracle 仍可假绿

- **违反**：AC5、AC6、AC9；Round 3 Evaluation Finding #1 的两项独立交付义务。
- **位置**：`test/prd-validation-report-path.test.ts:649-657`、`:660-672`、`:708-719`；现有反例只覆盖`:511-524`中managed prefix位于framed value起始位置的形式。
- **Evidence A — framed value仍会退回截断路径**：
  - `extractManagedBasenameFromFramedValue()`只有在managed prefix位于value开头或其前一字符为`/`时才返回完整`candidate`；只要前面存在描述文本，`:657`便退回`extractManagedBasenamesFromValue()`。
  - 该unframed helper在`:667`遇到空格、逗号、分号或pipe即停止，因此会再次丢弃非法尾部。
  - 只读复现：`value = "prefix prd-validate-report-{yyyy-MM-dd}.md backup"`与`` `Use prd-validate-report-{yyyy-MM-dd}.md backup` ``均只提取`prd-validate-report-{yyyy-MM-dd}.md`，随后`isAllowedCanonicalBasename()`返回true。包含两个managed名称的同一quoted value也被拆成多个token，而不是按完整framed value拒绝。
  - 这与Round 3 Evaluation明确要求“已framed value只要出现managed prefix，就把完整framed value作为一个candidate，禁止二次截断”直接矛盾。
- **Evidence B — config target/override key集合仍不完整**：
  - `isReportTargetOverrideKey()`只把`path`、`filename`、`file`、`target`、`override`视为target role；没有覆盖同义的`output`、`destination`、`directory`、`location`。
  - 只读复现中`report_output`、`report_destination`、`report_directory`、`prd_report_location`全部返回`false`。若这些key的value为`"arbitrary.md"`，managed basename scan也为空，所以完整focused test仍可通过。
  - 这不能证明published config没有开放report filename/path target/override，仍违反Round 3 Evaluation要求的独立config key-role gate。
- **Impact**：active Markdown/TOML/CSV framed surface可通过前置文本隐藏非法suffix/legacy值；published config可通过同义target key恢复用户可配置report output而不触发test。当前`10/10`与completion gate第40、49行因此不能作为完整false-green closure evidence。
- **Bounded suggestion**：只修改focused test及Evaluator授权的fix record。Framed value一旦包含managed prefix，应把从prefix开始至frame末尾的完整值作为单一candidate，不因prefix前有描述文本而退回unframed tokenizer；补充带前置文本与多managed值的quoted/code-span反例。Config key classifier应采用明确、可审计的report-target role vocabulary，至少覆盖`output`、`destination`、`directory`、`location`，同时继续证明普通root字段`output_folder`、`planning_artifacts`、`implementation_artifacts`不被误拒。修复后需由outer Flow Gate owner刷新current evidence。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | Private producer仅构造exact `prd-validate-report-{yyyy-MM-dd}.md`，未发现第二producer。 |
| AC2 | PASS | 日期为单次invocation锁定的四位年、两位月、两位日，并做真实calendar validation。 |
| AC3 | PASS | 唯一新target位于`{planning_artifacts}/prd/`。 |
| AC4 | PASS | Canonical Skill ID保持`speclite-validate-prd`。 |
| AC5 | **BLOCKED** | Current surfaces已同步，但published config target-role gate仍可漏过同义override key。 |
| AC6 | **FAIL** | 带前置文本的完整framed value仍会被二次tokenize并丢弃非法尾部。 |
| AC7 | PASS | 五类legacy与canonical control跨install/update/repair保持path/type/bytes/hash/tree；逐surface metadata交集为空，全项目inventory记录全部no-follow entry type。 |
| AC8 | PASS | Same/different target均pre-write block，stable issue、project-relative path、exact action、commit-time recheck、exclusive create与zero suffix/reuse成立。 |
| AC9 | **FAIL** | Focused `10/10`仍可被上述两个确定性反例假绿。 |
| AC10 | PASS | 未发现validation rules、scoring、report body或IR filename扩面。 |

## Round 3 Fix Verification（第三轮修复核验）

| Round 3 obligation | Result | Evidence |
| --- | --- | --- |
| Generic framed/unframed classifier | **FAIL** | Prefix带前置文本时`:655-657`退回unframed tokenizer，非法尾部被`:667`截断。 |
| Published config key-role gate | **FAIL** | `report_output` / `report_destination` / `report_directory`等同义target keys未被`:708-719`拒绝。 |
| Private `REPORT_PREFIX` / exact `LEGACY_PATTERNS` role | PASS | Exact constant、ordered anchored set、唯一discovery消费及producer/discovery隔离均有独立断言。 |
| Lifecycle per-surface zero intersection | PASS | Install/update/repair的planned/issues/changed/conflicts已分别投影并与protected paths求实际交集。 |
| Same-basename all-entry inventory | PASS | Helper先按basename记录location+no-follow type，只递归真实directory；symlink/directory/FIFO反例可观察。 |

## Owner Gate（Owner 门禁）

**NONE**。本 finding 沿用 Round 3 Evaluator 已唯一化的test-only语义，无需产品或architecture决策；在fresh Evaluator确认并由bounded Fixer修复后，仍需fresh Reviewer/Evaluator双PASS方可进入CR04/05/06。

