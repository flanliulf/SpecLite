---
Story: 11-7
Round: 4
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Edge Case Hunter
Type: Code Review Layer Result
---

## Verdict（结论）

**FAIL**。本轮发现 3 个可确定复现的 P1 evidence-oracle fail-open；它们不表示 current canonical source 已发生该漂移，但允许与 Story 11.7 AC5/AC6/AC7/AC9 直接冲突的后续改动仍保持 focused suite green。

- Focused verification：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed`。
- Review boundary：仅审查 Story 11.7 bounded slice 及 Round 1–3 修复后 oracle；未运行 build/full/packaging。
- Explicit exclusions：external `speclite-drawer-er-modeler/` 与 zip、workspace IDE mirrors、fixed-count drift 不计入 finding。

## Findings（发现）

### 1. [P1 / PATCH-EVIDENCE] Known support basenames 被全局豁免，仍可作为 active report default 绕过 classifier

- **Location**：`test/prd-validation-report-path.test.ts:649-657,660-677`
- **Trigger condition**：任一 active inventory surface 把 `prd-validation-report-operation.mjs` 或 `prd-validation-report-path.test.ts` 声明为 report filename/default。
- **Evidence**：`isKnownNonReportSurfaceName()` 只按 candidate basename 全局返回 `true`，不校验它出现的 `file + clause + role`。因此 `extractManagedBasenameTokens('report filename = "prd-validation-report-path.test.ts"')` 和对 operation basename 的同类 active producer 声明都返回空 candidate 集；后续 anchored allowlist 根本不会执行。这两个名称只应在精确的 test/script reference 位置作为非 report token，不能在 `module-help.csv`、Skill prose、config 或 docs 中成为通用免检 basename。
- **Potential consequence**：AC6 禁止的 `prd-validation-*` active default 可在 focused green 下重新出现。
- **Minimal guard**：删除 basename-global skip；把合法 script/test filename 限定为 exact `file + clause/role` allowlist，并新增同一 basename 出现于 active producer/default clause 时必须 reject 的 mutant fixture。

### 2. [P1 / PATCH-EVIDENCE] Published config key gate 仍漏掉多个等价 report target/filename 字段

- **Location**：`test/prd-validation-report-path.test.ts:419-437,708-720`
- **Trigger condition**：`config.toml.example` 新增 `report_name`、`validation_report_name`、`report_output`、`report_destination`、`report_location` 或 camelCase 等价字段。
- **Evidence**：`isReportTargetOverrideKey()` 只把 `filename`、exact `path_override`、`filepath` 或 token `path|filename|file|target|override` 视为 target role。直接以 current predicate 复现，上述 `report_name` / `report_output` / `report_destination` / `report_location` 均返回 `false`；当 value 不含 managed prefix 时，`extractManagedBasenameTokens()` 也无法补捕。Round 3 Evaluator 要求的是拒绝任何 report filename/path target/override key，而不是只拒绝当前列举的少数拼写。
- **Potential consequence**：Published config 可重新暴露第二套 report target override，但 active inventory 仍通过。
- **Minimal guard**：对 normalized assignment key 建立明确的 report-target semantic deny set，至少覆盖 `name|output|destination|location|directory` 与 report/validation-report 组合，同时保留 `output_folder`、`planning_artifacts`、`implementation_artifacts` 的 allow cases；将上述同义 key 加入 adversarial table。

### 3. [P1 / PATCH-EVIDENCE] Private legacy discovery 的 read-only role 只排除 `writeFile`，其他 mutation API 可假绿

- **Location**：`test/prd-validation-report-path.test.ts:452-476`
- **Trigger condition**：`discoverPrdValidationReports()` 或其直接 discovery section 引入 `rename`、`rm`、`unlink`、`copyFile`、`appendFile`、`truncate` 等 filesystem mutation。
- **Evidence**：Round 3 的 role assertion 只有 `expect(discoverySection).not.toContain("writeFile(")`。它会接受其他所有 mutation primitive，也没有断言 discovery 前后的 report path/type/bytes/hash/tree 不变。首个 behavior test 在调用 `discoverPrdValidationReports()` **之前** 验证 legacy bytes/entries，调用后只验证返回的 path arrays；因此 discovery 在枚举后 rename/delete/copy 的 mutant 仍可返回预期数组，而静态 gate 只要不用 `writeFile` 就不会拦截。
- **Potential consequence**：Legacy evidence discovery 可执行迁移、删除或复制，却仍满足 current focused oracle。
- **Minimal guard**：首选在 discovery 调用前后对完整 canonical/legacy corpus 做 path/type/bytes/hash/tree snapshot；同时将静态 role check 扩展为不允许任何 filesystem mutation import/call，不仅是 `writeFile`。

## Closed Checks（已关闭边界）

- **Exact filename/date/path**：`REPORT_PREFIX` + invocation date + `.md` 的 current producer、真实日历验证、零填充及 `{planning_artifacts}/prd/` 绑定未发现 current behavior 分支缺口。
- **Single invocation date**：Step 1 只生成 `{validationInvocationDate}` 一次，Step 1/13 的 metadata/body 及 Step 2–13 path binding 无第二 clock/path source；cross-midnight fixture 继续成立。
- **Existing-target block**：same/different content、commit-time recheck、exclusive `wx`、stable issue、exact manual action、zero suffix/temp/progress 当前都有直接证据；未重开已驳回的无可控 seam OS-level race。
- **Legacy lifecycle**：five-family corpus + canonical control 已在 install/update/repair 前建立，三阶段 command success、bytes/hash/type/tree 与六个 metadata zero-intersection 断言均存在。Finding #3 仅指向 private discovery 自身的 read-only oracle。
- **Downstream discovery**：三个 consumer 均绑定 `realProject → realPlanning → exact realPlanning/prd → candidate` fail-closed chain，并覆盖 external/cross-space 反例。
- **Lifecycle intersection**：Round 3 已改为每个 `plannedWrites` / `issues` / `changedPaths` / `conflicts` surface 独立求与 protected paths 的交集并断言为空，不再使用 negated `arrayContaining(all)`。
- **Same-basename inventory**：当前 helper 在递归前记录所有 exact-name entry 的 no-follow `regular|symlink|directory|other` 类型，且不 follow symlink；symlink/directory/FIFO 定向 fixture 通过。

## Owner Gate（Owner 门禁）

**NONE**。三项都是不改变 Story 产品语义的 focused evidence 加固，修复方向唯一；不需要产品或 Architecture 取舍。

## Edge Findings JSON（边界发现 JSON）

```json
[
  {
    "location": "test/prd-validation-report-path.test.ts:649-677",
    "trigger_condition": "Known support basename appears as an active report default",
    "guard_snippet": "Scope support-name exemptions to exact file and reference role",
    "potential_consequence": "Forbidden active default passes the negative inventory"
  },
  {
    "location": "test/prd-validation-report-path.test.ts:708-720",
    "trigger_condition": "Config uses report name, output, destination, or location key",
    "guard_snippet": "Reject normalized report keys with all target-role synonyms",
    "potential_consequence": "A second configurable report target bypasses the gate"
  },
  {
    "location": "test/prd-validation-report-path.test.ts:452-476",
    "trigger_condition": "Discovery mutates files through an API other than writeFile",
    "guard_snippet": "Snapshot reports around discovery and reject all mutation calls",
    "potential_consequence": "Legacy evidence can move or disappear while tests pass"
  }
]
```

## Recommended Next Action（建议下一步）

由 fresh Aggregator 对三项 candidate 做去重与严重性裁决，再交 fresh Evaluator。在最新 Reviewer/Evaluator 双 PASS 之前，不得进入 CR04/CR05/CR06。
