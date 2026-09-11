---
Story: 11-7
Round: 5
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。Round 4 的 framed-value 完整保留、`=` 前界、基础 config 同义 key、whole-file managed basename scan、唯一当前 `writeFile` 与 discovery 前后 no-follow snapshot 均已落地，focused test 当前为 `1 file / 10 tests passed`。但对 current oracle 做 mutant-oriented 复核后，仍发现 `3` 个可确定复现的 P1 evidence blocker、`0` 个 P2：support reference allowlist 仍未绑定 clause role；TOML key-role scan 丢失 table scope 与常见缩写；private filesystem role inventory 可被第二条 aliased import / aliased producer 绕过。三者都允许违反 AC5/AC6/AC7 的变更保持 focused green，因此最新 completion gate 的对应 PASS 声明仍不能成立。

## Findings（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Support basename allowlist 只绑定 file + fragment count，未验证 clause/reference role

- **Location**：`test/prd-validation-report-path.test.ts:528-558,588-594,835-846`
- **Affected contract**：Story 11.7 AC5、AC6、AC9；Round 4 Finding #1；Round 4 Evaluator要求“合法 support 名称只能通过精确 `file + clause/reference role` allowlist 剔除，同名值位于 active producer/default clause 时必须失败”。

#### Evidence（证据）

- `supportReferenceAllowlist` 对多数文件只登记裸 fragment，例如 `validate-prd/SKILL.md`、`SKILL.en.md`、`workflow-details.md` 与两份 public docs 都只登记 `` `scripts/prd-validation-report-operation.mjs` ``；`removeExactRoleFragments()` 只检查该 fragment 在指定文件中的 occurrence count，然后全局 `replaceAll()`（`:528-558,835-846`）。它没有验证 fragment 所在句子、字段或 clause 是“support script reference”而不是“report filename/default”。
- 当前独立反例 `report filename = "prd-validation-report-path.test.ts"` 只直接调用 basename extractor（`:588-594`），没有经过真实 inventory 的 allowlist removal。把 allowlisted文件中唯一的合法 support reference 原位改写为 `report filename/default = scripts/prd-validation-report-operation.mjs`，fragment 仍恰好出现一次并在 scan 前被删除，因而 integrated corpus oracle 保持绿色。
- 这不是要求理解任意自然语言语义：现有 allowlist 已声称绑定 clause/reference role，但数据结构没有保存 expected surrounding clause 或可审计 anchor，测试实际只能证明 `file + fragment + count`。

#### Impact（影响）

Round 4 已关闭 basename-global skip，却用一个仍可被语义换位复用的 fragment-global skip 取代它。Active default 可复用 support basename 并绕过 integrated negative scan，故 AC6 与 completion gate 中“support basename按 `relativePath + exact fragment + occurrence count` 限定豁免，active同名负例继续fail-close”的组合声明未形成同一条可执行证据链。

#### Suggested Bounded Fix（建议的最小修复）

- 将每个 support exemption 锚定到精确、稳定的 surrounding clause/line（或等价的 role parser），而不是只移除裸 basename fragment。
- 新增 integrated mutant fixture：在一个真实 allowlisted `relativePath` 中保留同一 fragment 与 occurrence count、但将其置于 report target/default role，必须失败；合法 reference clause 仍须通过。
- 仅需修改 `test/prd-validation-report-path.test.ts`，不需要修改 canonical source。

### 2. [中][P1 / PATCH-EVIDENCE] Published TOML key-role scan 丢失 table scope，并遗漏 `dir` / `folder` 等常见 target role

- **Location**：`test/prd-validation-report-path.test.ts:427-456,776-797`
- **Affected contract**：Story 11.7 AC5、AC6、AC9；Round 4 Finding #2；published config 不得恢复第二套 report filename/path/output target。

#### Evidence（证据）

- `extractTomlAssignmentKeys()` 只返回 assignment 行左侧的局部 key，不保留当前 TOML table header（`:776-779`）。因此以下两个明确 report-directed config surface 都只产生局部 key `path` / `output`，而 `isReportTargetOverrideKey()` 对它们返回 `false`：

  ```toml
  [report]
  path = "arbitrary.md"

  [validation.report]
  output = "arbitrary.md"
  ```

- 本轮直接以 current predicate 复现：上述样例的 `rejected=[]`。由于 value 不含 managed basename，basename scan也不会补捕；focused fixture可保持绿色。
- Vocabulary 对完整词 `directory` 有覆盖，但对常见等价字段 `report_dir` 与 `report_folder` 返回 `false`；本轮同样直接复现 `rejected=[]`。Round 4 的 adversarial table只列出了已知完整词，没有证明 semantic deny 能覆盖其常用规范化形式。

#### Impact（影响）

Published `config.toml.example` 可以通过 table-scoped `report.path` / `validation.report.output` 或常见 `report_dir` / `report_folder` 重新开放 report target，而当前“无 forbidden assignment key”的断言仍通过。这是确定性的 config key-role false-green，不是对未来任意命名的无限枚举要求。

#### Suggested Bounded Fix（建议的最小修复）

- TOML assignment inventory必须保留table scope，并对 fully-qualified key（如 `report.path`、`validation.report.output`）应用deny predicate；同时覆盖 quoted table/key 与 dotted形式。
- 将 `dir`、`folder`（以及项目选择的等价规范化词）纳入 report-target role vocabulary，并加入当前四个最小反例；继续保留 `output_folder`、`planning_artifacts`、`implementation_artifacts` 的合法证明。
- 仅需修改 `test/prd-validation-report-path.test.ts`，不需要改变 runtime config 语义。

### 3. [中][P1 / PATCH-EVIDENCE] Private filesystem role inventory 只解析首条 exact import 与原始 API 名，可被 aliased second producer 绕过

- **Location**：`test/prd-validation-report-path.test.ts:458-521,819-833`
- **Affected contract**：Story 11.7 AC5、AC6、AC7、AC9；Round 4 Finding #3；private script whole-file唯一producer、完整filesystem mutation binding/call及间接helper gate。

#### Evidence（证据）

- `extractFsPromiseBindings()` 使用单次、单行 anchored regex `exec()`（`:819-827`），只读取第一条 `node:fs/promises` named import。若在现有import后新增第二条 `import { writeFile as emitReport } from "node:fs/promises";`，helper仍只返回第一条import中的既有bindings。
- `findFunctionCalls()`只搜索原始 primitive name（`:829-833`）。新增 `emitReport(target, content)` 不会计入 `writeFile` call；现有 `privateProducer.match(/\bwriteFile\s*\(/g)`仍只有当前唯一一次（`:499-503`）。若第二producer从参数消费target，它也无需增加 managed basename、`REPORT_PREFIX` 或 `LEGACY_PATTERNS` occurrence，因此whole-file basename scan与constant counts同样保持绿色。
- 由此可构造无需触碰既有producer的直接 mutant：第二条 aliased import + `export async function emitAdditionalReport(target, content) { await emitReport(target, content); }`。当前所有静态 unique-producer assertions都会通过，behavior fixtures也从未调用该新export。相同结构也允许 discovery 调用一个 aliased/间接 mutation helper，而当前 discovery call list只枚举已知primitive与三个已知producer函数（`:504-509`）。
- Discovery前后snapshot对当前执行路径有效，但不能替代whole-file static role gate；Round 4 Evaluator明确要求二者同时成立，正是为了阻止未被当前fixture触发的第二producer/条件mutation分支。

#### Impact（影响）

Private script可新增第二filesystem writer或间接mutation路径而保持 `10/10`，所以“只有唯一 `writeFile(...,{flag:"wx"})` producer”目前只是对原始标识符的文本计数，不是完整binding/call inventory。AC5/AC6唯一producer与AC7 discovery只读回归证据仍未闭环。

#### Suggested Bounded Fix（建议的最小修复）

- 解析全部 `node:fs` / `node:fs/promises` imports（包括多条import、alias、namespace/default形式），将local binding映射回原始mutation API，再按local binding检查全文件调用与允许位置。
- Whole-file gate必须证明除已授权producer local binding外不存在第二writer；discovery section还需拒绝对任意已识别mutation binding及非白名单local helper的调用，或使用等价的可审计call-graph边界。
- 加入“第二条 aliased `writeFile` import + parameterized second producer”的静态mutant反例；它必须在不依赖behavior fixture执行该export时失败。
- 仅需修改 `test/prd-validation-report-path.test.ts`；若新assertion揭示current source问题，须返回Evaluator，不得自行修改private script。

## Closed Checks（已闭环检查）

1. **Round 4 framed-value semantics — PASS**：`extractManagedBasenameFromFramedValue()`从首个managed prefix保留至frame末尾；前置描述、非法尾部及同frame第二名称均已编码，未发现再次截断（`:565-584,732-736`）。
2. **Round 4 assignment/query boundary — PASS**：`findNextManagedPrefix()`已接受`=`前界，`REPORT=...`与`url?report=...`反例通过；普通identifier嵌入仍不命中（`:585-590,753-773`）。
3. **Round 4 basic config vocabulary — PARTIAL PASS**：bare `validation_report` / `prd_report`及`name|output|destination|directory|location`完整词已进入matrix和predicate（`:432-455,781-797`）；Finding #2只指出TOML scope与常见规范化同义词仍可绕过。
4. **Round 4 private current-path evidence — PARTIAL PASS**：current script只有一个直接 `writeFile(...,{flag:"wx"})`；authorized constants剔除后的whole-file managed scan为空；当前discovery前后no-follow tree snapshot相等（`:54-100,458-521`）。Finding #3只指出alias/multi-import/indirect binding的静态oracle未闭合，不否定current source行为。
5. **Prior closure maintained**：未发现证据重开single invocation date、exact dated target、same/different-content zero mutation、commit-time recheck、five-family lifecycle、per-metadata-surface zero intersection、same-basename all-entry inventory、Step 2–13 path binding或downstream physical owner chain。
6. **Focused execution — PASS**：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。该绿色结果不反驳上述三个finding，因为三类mutant均尚未进入integrated matrix。
7. **Excluded external drift**：`speclite-drawer-er-modeler/`、zip、workspace IDE mirrors与fixed-count drift按任务边界排除，未作为Story finding。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 三项均是唯一方向明确的 focused test-evidence修补，不涉及产品、Architecture或current runtime语义选择。Fresh Evaluator可独立裁决；若确认，Fixer应仅修改其授权的focused test并追加evaluation Fix Summary，不得修改source、Story、tracker、completion gate、既有CR、external drawer/zip、IDE mirrors或fixed-count baselines。
