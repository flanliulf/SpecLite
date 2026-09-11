---
Story: 11-7
Round: 6
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。Round 5 的共享 unframed boundary、project-existing TOML parser semantic paths、单行多条 named fs import 与 current top-level local-function reachability均已落地；focused test当前为`1 file / 10 tests passed / 0 failed`。但对本轮有限修复做mutant-oriented复核后，仍发现`2`个P1 evidence blocker、`0`个P2：support allowlist登记的仍是句内fragment而非完整role clause；fs binding与discovery reachability的regex对同一已授权语法的换行/缩进形式fail-open。两者都有直接对应AC6/AC7的稳定bounded mutant，不要求通用自然语言、TOML或JavaScript分析器。

## Findings（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Support allowlist仍以句内fragment冒充完整role clause

- **Location**：`test/prd-validation-report-path.test.ts:576-613,614-624,990-1001`
- **Affected contract**：Story 11.7 AC5、AC6、AC9；Round 5 Finding #1与Evaluator明确授权的`relativePath + exact complete clause/anchor + exact occurrence count`。

#### Evidence（证据）

- `supportReferenceAllowlist`的数据字段虽改名为`clause`，但多数值仍只是完整句子中的局部fragment。例如`validate-prd/SKILL.md`只登记“通过 private `scripts/prd-validation-report-operation.mjs` 执行 exclusive create”这一句内片段（`:576-599`），`removeExactRoleFragments()`仍只核对该片段的次数后执行`replaceAll()`（`:990-1001`）。它没有绑定完整bullet、完整句子或能证明reference role的两侧anchor。
- Current `roleSwapMutant`把原完整句替换成一个**不再包含登记fragment**的新句（`:601-613`），因此只证明“fragment消失时会失败”，没有覆盖Evaluator要求的“fragment与count保持不变但role换位”。
- 本轮只读稳定复现：将真实`validate-prd/SKILL.md`完整contract句替换为`- **默认 report filename**：通过 private \`scripts/prd-validation-report-operation.mjs\` 执行 exclusive create。`。登记fragment仍精确出现`1`次；`removeExactRoleFragments()`删除它后，`prd-validation-report-operation.mjs`不再进入managed scan。也就是说，support basename已经换成active report filename/default role，但integrated oracle仍会绿色。

#### Impact（影响）

Active ZH/EN Skill、workflow或docs可在保留同一局部措辞的情况下把support script basename换位为report target/default，AC6 negative inventory仍无法发现。Completion gate关于“support allowlist绑定完整clause role”的PASS声明因此尚未形成可执行证据。

#### Suggested Bounded Fix（建议的最小修复）

- 每项allowlist登记并移除真实文件中的完整、稳定reference sentence/bullet/CSV field，而不是包含basename的句内fragment；继续绑定`relativePath + occurrence count`。
- 修正integrated role-swap mutant：必须保留当前登记basename fragment和相同occurrence count，只改变其surrounding complete clause为report filename/default role，并证明scan失败。
- 仅需修改`test/prd-validation-report-path.test.ts`；不需要自然语言通用role parser，也不得修改canonical source来迁就测试。

### 2. [中][P1 / PATCH-EVIDENCE] Fs binding与local reachability只覆盖单行零缩进文本形态，同一授权语法可绕过

- **Location**：`test/prd-validation-report-path.test.ts:514-557,914-987`
- **Affected contract**：Story 11.7 AC7、AC9；Round 5 Finding #3；Evaluator授权的全部static named fs bindings与discovery local-function direct-call可达闭包。

#### Evidence（证据）

- `extractFsPromiseBindings()`只匹配整条位于单行的`import ... from "node:fs..."`（`:914-928`）。Round 5 mutant也只覆盖第二条单行named import（`:518-526`）。在current private source末尾加入合法且同属已授权named-import形态的多行import：

  ```js
  import {
    writeFile as emitReport
  } from "node:fs/promises";
  async function emitAdditionalReport(target, content) {
    await emitReport(target, content);
  }
  ```

  current extractor仍只返回既有`writeFile -> writeFile`，`hasOnlyAuthorizedReportWriter()`仍为true；新增`emitReport()`不含managed literal，也不会触发whole-file basename scan。该mutant只是格式化同一static named import，并非namespace/default/dynamic或通用module-analysis要求。
- `findDiscoveryReachableMutations()`的declaration regex要求`function`从行首第一个字符开始（`:952-960`）。将Round 5已接受的indirect helper仅增加合法leading whitespace，例如`  async function mutateDuringDiscovery(...)`，并保留discovery中的直接调用后，该helper不进入`sections`，reachability遍历不会沿edge到`executePrdValidationReportOperation`。本轮只读复现得到`helper in declarations=false`且call确实存在。该mutant仍是Evaluator明确限定的local function declaration/direct call，不涉及arrow、method dispatch、外部模块或任意JavaScript表达式。

#### Impact（影响）

Private script可通过无语义差异的换行named import新增第二writer，或通过缩进的local function declaration让discovery抵达producer/mutation，而`10/10`保持绿色。于是AC7的legacy evidence只读/不迁移保证和completion gate中的完整binding/reachability PASS仍未闭环。

#### Suggested Bounded Fix（建议的最小修复）

- 将static named fs import matcher限定扩展为允许`{...}`内部换行，并对所有匹配保留`original -> local`；已有namespace/default/dynamic fail-close边界保持不变。
- local function declaration matcher允许行首水平空白，再沿现有direct-call闭包审计；补入“多行aliased named import + parameterized writer”与“有缩进indirect helper”两个独立mutant。
- 不要求完整JavaScript parser、arrow/function-expression call graph、method dispatch或外部模块分析；仅修复已授权语法集合中的格式化false-green。

## Closed Checks（已闭环检查）

1. **Round 5 explicit delimiter matrix — PASS**：`isUnframedBoundary()`由candidate start/end共同使用，`, ; | ? &`前后界与`=`、普通identifier负例均已编码（`test/prd-validation-report-path.test.ts:633-689,817-857`）。本层拒绝把它扩张为任意标点或Unicode语法完备要求。
2. **Round 5 TOML semantic paths — PASS**：项目既有`toml` parser被直接使用；table-scoped、quoted/spaced dotted、`dir`/`folder`反例与artifact-root allow cases均在current matrix中通过（`:428-472,859-892`）。本层不要求数组表、任意同义词或完整TOML元测试。
3. **Round 5 current binding/reachability baseline — PARTIAL PASS**：current source的单行named imports、第二条单行aliased import mutant、current top-level function declarations和无缩进indirect helper mutant均被识别；Finding #2只保留同一授权构造的换行/缩进false-green。
4. **Focused execution — PASS**：`npx vitest run test/prd-validation-report-path.test.ts --reporter=dot` → `1 file / 10 tests passed / 0 failed`。绿色结果不反驳上述finding，因为三个精确mutant尚未进入current matrix。
5. **Prior functional closure maintained**：未发现证据重开exact filename/date/path、single invocation date、same-day conflict、exclusive create、legacy lifecycle、metadata zero intersection、same-basename all-entry inventory、Step 2–13 binding或downstream owner chain。
6. **Excluded external drift**：`speclite-drawer-er-modeler/`、zip、workspace IDE mirrors与fixed-count drift按任务边界排除，未作为Story finding，也未运行build/full/packaging。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 两项均是方向唯一的focused test-evidence修补，不涉及产品、Architecture或runtime语义选择。Fresh Evaluator可独立裁决；若确认，Fixer应仅修改其授权的focused test并追加evaluation Fix Summary，不得修改source、Story、tracker、completion gate、既有CR产物、external drawer/zip、IDE mirrors或fixed-count baselines。
