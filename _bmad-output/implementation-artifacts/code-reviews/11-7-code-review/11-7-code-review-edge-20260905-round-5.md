---
Story: 11-7
Round: 5
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Edge Case Hunter
Type: Code Review Layer Result
---

## Verdict（结论）

**FAIL**。Round 4 的 focused 修复在 current source 上为绿色，但沿其新增 classifier、config-role 与 private-role oracle 逐分支复核后，仍有 3 个可确定构造的 P1 false-green。它们不表示 current canonical source 已出现非法 default 或 mutation；它们表示与 Story 11.7 AC5/AC6/AC7/AC9 冲突的后续改动仍可能保持 focused suite green。

- Focused verification：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed`。
- Review boundary：Story 11.7 current bounded slice、Round 1–4 正式 summary/evaluation/fix records 与 current completion gate；未运行 build/full/packaging。
- Explicit exclusions：external `speclite-drawer-er-modeler/` 与 zip、workspace IDE mirrors、fixed-count drift 均未进入 finding。

## Findings（发现）

### 1. [P1 / PATCH-EVIDENCE] Unframed managed-prefix 前界与 tokenizer 分隔符集合不对称

- **Location**：`test/prd-validation-report-path.test.ts:738-773`
- **Trigger condition**：unframed active surface 在 `?`、`&`、`,`、`;` 或 `|` 后紧接 legacy/非法 managed basename，例如 `?prd-validation-report-old.md`。
- **Evidence**：`extractManagedBasenamesFromValue()` 把 whitespace、backtick、comma、semicolon、pipe 与 quote 都作为 token 终止符（`:744-748`），但 `findNextManagedPrefix()` 的允许前界只有 start、`/`、whitespace、`(`、`[`、`{`、`:`、`=`（`:763-768`）。因此同一 syntax delimiter 位于 candidate 前方时并不等价：`REPORT=prd-validation-report-old.md` 已覆盖并命中，而 `items=ok,prd-validation-report-old.md`、`old;prd-validation-report-old.md`、`old|prd-validation-report-old.md`、`url?prd-validation-report-old.md` 与 query continuation `x=1&prd-validation-report-old.md` 均返回空集合。Current adversarial matrix只覆盖 `=` 前界和普通 identifier 内嵌，不覆盖这些由 changed helper 直接到达的分支。
- **Potential consequence**：CSV/help/prose/query 风格 active default 可重新引入 AC6 禁止名称而 negative inventory 仍通过。
- **Minimal guard**：定义一份共享、可审计的 unframed token boundary 集合并同时用于 candidate 起止；增加 `?`、`&`、`,`、`;`、`|` 前界反例，同时保留普通 identifier substring 不命中的证明。只需修改 focused test helper/assertions。

### 2. [P1 / PATCH-EVIDENCE] TOML key-role 扫描丢失 table context 与合法 quoted/spaced dotted keys

- **Location**：`test/prd-validation-report-path.test.ts:427-455,776-797`
- **Trigger condition**：published config 以 `[report]` table 下的 `name`/`output`，或 `"workflow"."report_name"`、`workflow . report_name` 定义 target。
- **Evidence**：`extractTomlAssignmentKeys()` 只提取单个 quoted key或不含空白的 `[A-Za-z0-9_.-]+` key（`:776-779`），不维护当前 TOML table header，也不能解析合法的 quoted dotted key与 dot 两侧空白。随后 `isReportTargetOverrideKey()` 只接收这一扁平字符串（`:781-797`）。因此 `[report]\nname = "arbitrary.md"` 只向 gate 提供 `name`，因缺 `report` 返回 false；`"workflow"."report_name" = "arbitrary.md"` 与 `workflow . report_name = "arbitrary.md"` 则根本不进入 assignment key 集合。Value 不含 managed prefix 时，basename scanner也无法补捕。Round 4 的 snake/camel/dotted反例只覆盖未加引号且 dot 无空白的单行形式。
- **Potential consequence**：`config.toml.example` 可恢复第二套 report target/output surface，但 AC5/AC6/AC9 的 published-config evidence 保持绿色。
- **Minimal guard**：使用 project 已有 TOML parser，或在 test-local scanner 中组合 table header 与完整 dotted key path（支持 bare/quoted components及 dot 周围空白），再对完整 semantic path执行 report-target deny vocabulary；增加 `[report] name`、quoted dotted与spaced dotted反例，并保留普通 artifact-root allow cases。

### 3. [P1 / PATCH-EVIDENCE] Private mutation gate只审计首个精确 named import与字面 API call，间接 helper仍可绕过

- **Location**：`test/prd-validation-report-path.test.ts:458-521,819-833`
- **Trigger condition**：private script 新增第二条/别名 filesystem import，或 discovery 调用名称不在 deny list 的 mutation helper。
- **Evidence**：`extractFsPromiseBindings()` 用非全局 regex只取首个精确单行 `node:fs/promises` named import（`:819-826`）；额外 `import { unlink as erase } from "node:fs/promises"`、`node:fs` sync import或 dynamic import不会进入 binding 集合。`findFunctionCalls()`只搜索 deny list 中的字面函数名（`:829-833`），因此 `erase()`、`cleanupLegacyEvidence()`等别名/间接 helper不会被识别。Discovery section gate也只拒绝列举的 mutation names和三个已知 producer names（`:495-509`），并未建立 call graph或限制 discovery 的可调用 helper 集。Behavioral snapshot只覆盖当前 fixture tree；条件化 mutation若只针对未在fixture出现的legacy basename/entry状态，仍可保持 snapshot相等。Whole-file managed scan不能补捕不含 managed literal、以参数接收路径的 helper。
- **Potential consequence**：private discovery 可在特定 legacy 状态下迁移、删除或改写 evidence，或出现第二 mutation path，而 current role oracle 仍通过。
- **Minimal guard**：枚举全部 `node:fs`/`node:fs/promises` static/dynamic imports并解析local alias，审计所有 mutation bindings/calls；对 discovery 建立允许调用集合或递归 call-graph，证明所有可达 helper均只读。Behavior fixture再补至少一个条件化legacy/entry-state mutant，避免单一当前tree替代静态可达性证明。若新断言对current source产生RED，必须返回Evaluator，不得自行改private script。

## Closed Checks（已关闭边界）

- **Exact filename/date/path**：current producer只从 exact `REPORT_PREFIX`、valid calendar invocation date与`.md`构造 `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`；未发现新的行为分支缺口。
- **Single invocation date**：workflow activation只生成并锁定一次 `{validationInvocationDate}`；Step 1初始metadata/body与Step 13 final metadata只消费该state，Step 2–13均绑定 `{validationReportPath}`，未发现第二clock/path source。
- **Existing-target block/race**：early probe、commit-time recheck、exclusive `wx`、same/different content、stable issue、project-relative path、exact manual action及zero suffix/temp/progress evidence均仍成立；不重开已由前轮驳回的无额外可控 seam OS-level race。
- **Legacy lifecycle**：五类 authoritative legacy family加canonical control、install/update/repair success、逐metadata surface zero intersection、path/type/bytes/hash/tree与全项目same-basename no-follow inventory均保持闭环。Finding #3只针对private discovery的可达 mutation oracle。
- **Downstream owner chain**：Edit PRD、Implementation Readiness与Correct Course继续共享 `realProject → realPlanning → exact realPlanning/prd → candidate` fail-closed contract，external/cross-space/symlink/non-file/unreadable/missing条件有明确拒绝语义。
- **Round 4 framed/support fixes**：framed value从首个managed prefix至frame末尾不再二次截断；support basename豁免已绑定 exact `relativePath + fragment + occurrence count`，active同名default反例会进入classifier。
- **Round 4 report-key vocabulary**：既有snake_case、camelCase及简单dotted key矩阵已覆盖 `name|output|destination|directory|location|path|filename|file|target|override`；Finding #2只指出合法TOML层级表示未进入该predicate。
- **Round 4 whole-file baseline**：current private script确实只有一个 `writeFile(...,{flag:"wx"})` producer，current discovery行为只读，真实discovery前后no-follow snapshot相等；Finding #3不误述为current production已发生mutation。

## Owner Gate（Owner 门禁）

**NONE**。三项均为不改变产品或current source语义的 focused evidence 加固，修复方向可限定在 `test/prd-validation-report-path.test.ts`；若新增断言揭示current source事实，则必须返回 fresh Evaluator重新授权。

## Edge Findings JSON（边界发现 JSON）

```json
[
  {
    "location": "test/prd-validation-report-path.test.ts:738-773",
    "trigger_condition": "Managed prefix follows an unframed delimiter other than equals",
    "guard_snippet": "Use one symmetric delimiter set for token start and end",
    "potential_consequence": "Forbidden active basename escapes the negative inventory"
  },
  {
    "location": "test/prd-validation-report-path.test.ts:776-797",
    "trigger_condition": "TOML report target uses table context or quoted dotted keys",
    "guard_snippet": "Parse full TOML key paths before applying target-role denial",
    "potential_consequence": "A configurable report target bypasses published-config evidence"
  },
  {
    "location": "test/prd-validation-report-path.test.ts:819-833",
    "trigger_condition": "Discovery reaches mutation through an alias or indirect helper",
    "guard_snippet": "Resolve all filesystem aliases and recursively audit reachable calls",
    "potential_consequence": "Legacy evidence mutates while the focused oracle stays green"
  }
]
```

## Recommended Next Action（建议下一步）

由 fresh Aggregator 对三个 candidate 进行跨层去重和严重性裁决，再交 fresh Evaluator。最新 Reviewer/Evaluator 双 PASS 前不得进入 CR04、CR05 或 CR06。
