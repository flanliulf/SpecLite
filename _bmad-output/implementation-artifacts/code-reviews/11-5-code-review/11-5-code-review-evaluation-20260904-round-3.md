---
Story: 11-5
Round: 3
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-5-code-review-summary-20260904-round-3.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-5 的第 3 轮 CR 复审结果进行独立评估。Round 3 汇总的 4 个 finding 均可由 current source、focused fixtures、Story AC3/4/5/8/10，以及 Owner 已批准并写入 `SPEC 09` 的 bounded Markdown destination/reference contract 直接确认；它们都是阻塞交付的 P1 patch。没有 P0、P2、误报或需要新 Owner 决策的项目。

**Overall verdict（整体裁决）**：`FAIL`。Story 11-5 不得进入 CR04、CR05、CR06 或 `done`。下一步应由 fresh Fixer 只修复本评估明确授权的 #1-#4，完成 required verification 后进入 fresh Reviewer Round 4 与 fresh Evaluator Round 4。

## Previous Round Confirmation（上轮问题回顾确认）

### Round 2 #1 Architecture finite probe 条件：已关闭

Planning root-level `architecture.md` 已在 `planningRoot` 可用时无条件加入候选；额外 Planning Architecture subject whole/index 只在 Solutioning root 为 `explicit-config` 时追加，顺序与 Owner M 一致（`src/config/artifact-document-discovery.ts:718-731`）。

### Round 2 #2 subject directory symlink rebinding：已关闭

Canonical entry/list/read 前已拒绝 lexical subject-directory symlink，whole/index/shard 的 containment guard 继续生效（`src/config/artifact-document-discovery.ts:102-124,415-453,670-692`）。

### Round 2 #3 angle external/network inline destination：已关闭原 finding

Angle destination 目前先 unwrap，再对 raw external scheme/network 分类，local angle destination 仍进入 single-decode pipeline（`src/config/artifact-document-discovery.ts:536-565`）。Round 3 #1 是 reference definition 状态丢失，属于不同分支。

### Round 2 #4 fenced code context：已关闭

Backtick/tilde fence、较长 closing fence与 unclosed-to-EOF 已由 bounded masker 排除（`src/config/artifact-document-discovery.ts:568-587`；`test/artifact-document-discovery.test.ts:186-213`）。

### Round 2 #5 raw Windows drive-letter：已关闭原 finding

Raw slash/backslash drive-letter 已在 generic scheme 前返回 `unsupported-local`（`src/config/artifact-document-discovery.ts:552-555`；`test/artifact-document-discovery.test.ts:368-394`）。Round 3 #2 是 drive-letter 仅在 single percent-decode 后形成的 pipeline 缺口。

### Round 2 #6 nested inline / shortcut reference：已关闭原 finding

Nested-bracket inline、normalized full/collapsed/shortcut reference、声明顺序与首次去重已有实现和 focused fixtures（`src/config/artifact-document-discovery.ts:483-531,599-650`；`test/artifact-document-discovery.test.ts:139-165`）。Round 3 #4 是 outer opener escape classification 的相邻缺口。

### Historical CR TODO（历史 CR TODO，非阻塞）

无。Round 3 的 4 项均属于 current Story 11-5 delivery scope，不能降级为 CR TODO。

## Finding #1 Evaluation（发现 #1 评估）

### Review Finding（审查原文）

> **[P1] Non-shard reference definition 被丢弃，合法 usage 被误报 undefined**
> - 来源：Blind Hunter + Edge Case Hunter + Acceptance Auditor；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Definition scanner 会解析每个 definition destination，但只把 `local-md` 写入 `definitions`；`ignore`（external scheme、network path、fragment-only）状态被直接丢弃（`src/config/artifact-document-discovery.ts:469-480`）。随后 full/collapsed usage 仅以 `Map.get()` 的 `undefined` 区分 label，不可能判断“label 已定义但 destination 不是 shard”，因此合法 non-shard definition usage 被映射为 `undefined-reference` 并阻塞（`src/config/artifact-document-discovery.ts:503-518`）。这与 `SPEC 09` 对 external/network links“不作为 shard”的约束和 public CLI docs 不一致（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`；`docs/reference/cli.md:226`）。

**严重性判断：合理**

错误结果进入统一 broken-shard block 路径，产生 `actualConsumedPath=null`、空 `consumedPaths` 与 `continuation=block`（`src/config/artifact-document-discovery.ts:129-155`），使有效 index 无法被消费，直接影响 AC3、AC4、AC5、AC8、AC10。P1 合理。

**修复建议：可行且唯一**

Fixer 应把 definition table 的 value 收窄为带分类的 union，例如 `local-md(path)` 与 `defined-but-ignore`；保持 first-definition-wins。Full/collapsed/shortcut usage 命中 `defined-but-ignore` 时只跳过且不得访问 target；命中 `local-md` 时沿用现有 order/dedupe/self-link flow。只有语法上明确的 full/collapsed usage 的 label 真正不存在时才返回既有 `undefined-reference`；未定义的普通 shortcut-like bracket text 不得因此新增 block。

**误报评估：非误报**

三层均命中且 current control flow 能直接证明状态丢失，不需要推测 filesystem 或 external response。

## Finding #2 Evaluation（发现 #2 评估）

### Review Finding（审查原文）

> **[P1] Percent-decode 后形成的 Windows drive-letter 绕过 portable guard**
> - 来源：Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Drive-letter 与 generic scheme 检查当前发生在 query/fragment stripping 和 `decodeURIComponent()` 之前（`src/config/artifact-document-discovery.ts:552-560`）；decode 后直接依据 suffix 返回 `local-md`，没有再次执行 drive-letter portable classification（`src/config/artifact-document-discovery.ts:563-565`）。所以 `C%3A/private/outside.md` 可在 POSIX host 上成为 subject directory 内的字面路径并被消费，违反 Owner L 明确规定的 `parse -> strip query/fragment -> single percent-decode -> portable/subject containment/readability` 顺序（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`）。

**严重性判断：合理**

这是 platform-dependent evidence acceptance，既绕过 portable guard，也可能将禁止持久化的 drive-letter 语义带入 discovery；AC3、AC4、AC5、AC10 被破坏。P1 合理。

**修复建议：可行且唯一**

Fixer 应在 single decode 后、`.md` suffix/local path acceptance 前再次识别 slash/backslash Windows drive-letter，并返回既有 `unsupported-local`，最终映射为 `artifact-path.broken-shard-reference` / `referenceKind=unsupported-local-reference`。保留 raw fast-path 可以接受，但 decode 后检查不可省略；不得进行第二次 decode，不得在 public result 泄露 raw destination、drive letter 或 absolute path。本 finding 不授权顺带重写未报告的 URL parser 或 portability subsystem。

**误报评估：非误报**

现有 raw drive fixtures（`test/artifact-document-discovery.test.ts:368-394`）不覆盖 encoded colon/backslash，且 source 顺序与 owning contract 明确冲突。

## Finding #3 Evaluation（发现 #3 评估）

### Review Finding（审查原文）

> **[P1] Malformed inline destination 被静默忽略或截断接受**
> - 来源：Edge Case Hunter + Acceptance Auditor；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Outer scanner 已识别合法 bracketed link text 和紧随其后的 `(`，但 `scanInlineDestinationEnd()` 找不到 closing `)` 时，调用方直接 `continue`，把已进入 supported inline grammar 的 malformed destination 当作不存在（`src/config/artifact-document-discovery.ts:483-500,617-635`）。Angle branch 又只截取首个 `<...>`，没有校验 `>` 后的 trailing content，因此 `<chapter.md>junk` 被截断为 `chapter.md` 接受（`src/config/artifact-document-discovery.ts:543-550`）。现有 malformed fixture 只覆盖 percent encoding（`test/artifact-document-discovery.test.ts:322-366`），不能关闭这两个分支。

**严重性判断：合理**

前者可漏掉应声明的 shard，后者可消费输入并未合法声明的 shard；两者都违反 Owner L 对 malformed destination fail-closed 的明确要求（`SPEC 09:100`），影响 AC3、AC4、AC5、AC10。P1 合理。

**修复建议：可行且唯一**

一旦 scanner 识别 `[...](` opener，若 bounded same-line scanner 找不到合法 closing `)`，必须返回现有 `malformed-link-destination`。Inline angle form 必须具有 closing `>`，且 `>` 到 outer `)` 之间只允许 whitespace；任何非 whitespace trailing content 均返回同一 reason。当前 bounded contract 没有承诺 link title，故不得借本 finding 新增或猜测 title grammar，也不得扩成完整 CommonMark parser。合法 local/external angle forms保持现有分类。

**误报评估：非误报**

两个复现虽位于 scanner 与 destination parser 两个分支，但违反相同 stable issue、fail-closed contract 与最小修复边界，合并合理。

## Finding #4 Evaluation（发现 #4 评估）

### Review Finding（审查原文）

> **[P1] Escaped opening bracket 被误解析为 inline shard link**
> - 来源：Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Outer scanner 只要求当前字符为 `[` 且前一字符不是 `!`，没有判断紧邻 opener 的连续反斜杠奇偶性（`src/config/artifact-document-discovery.ts:483-485`）。`scanBracketed()` 内部对反斜杠的处理发生在 opener 已被选中之后（`src/config/artifact-document-discovery.ts:599-615`），不能纠正 `\[Not a link](missing.md)` 中被单个 literal backslash 转义的 opening bracket。因此普通文本可被伪造为 missing shard 并阻塞。

**严重性判断：合理**

合法 escaped text 会产生 false declaration 和 false block，直接破坏 AC3、AC4、AC5、AC10。该行为属于已支持 inline grammar 的 opener classification，而不是可延后的风格问题，P1 合理。

**修复建议：可行且唯一**

Fixer 应在 outer scanner 接受 `[` 前，计算其前方紧邻的连续反斜杠数量：奇数表示 opener 已转义，只作为文本跳过；偶数表示 `[` 未转义，继续走现有 inline/reference scanner。只处理 link opener，不改变既有 image exclusion、内部 bracket escape、order/dedupe/self-link 行为。

**误报评估：非误报**

Current outer guard 缺失且 odd/even 语义可由最小 fixture 确定验证，不需要完整 Markdown parser。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 分类 | 说明 |
|---|------|----------|-----------|------|------|
| 1 | Non-shard reference definition 状态丢失 | P1 | **P1** | patch | 保留 `defined-but-ignore` 状态，避免合法 non-shard usage 被误报 undefined。 |
| 2 | Decode 后 drive-letter 绕过 | P1 | **P1** | patch | single decode 后重新执行 bounded drive-letter portable guard。 |
| 3 | Malformed inline destination 被忽略/截断 | P1 | **P1** | patch | 已识别 opener 必须 fail closed，angle trailing junk 不得截断接受。 |
| 4 | Escaped opening bracket 被误解析 | P1 | **P1** | patch | outer opener 按连续反斜杠奇偶性分类。 |

### CR TODO（非阻塞）

无。不得将 #1-#4 降级或延后。

### False Positives（可忽略/误报）

无。

### Evaluation Decision（评估决定）

- **Finding #1**：确认有效，P1；修复 definition classification state，不访问 external target。
- **Finding #2**：确认有效，P1；修复 post-decode drive-letter guard，保持 exactly-once decode 与 public redaction。
- **Finding #3**：确认有效，P1；修复 missing close 与 angle trailing junk 的 fail-closed 行为，不新增 title grammar。
- **Finding #4**：确认有效，P1；修复 outer opener 的 odd/even escape semantics，不扩展其它 Markdown contexts。

## Owner Decision Gate（Owner 决策门禁）

**Owner decision: not required**。

Owner L 已在 `SPEC 09:100` 唯一定义：支持 bounded inline/reference-style local links；external scheme 与 network path 不作为 shard；destination 按 parse、strip query/fragment、single decode、portable/containment/readability 顺序处理；malformed、undefined 与 unsupported local-ish input 使用既有 `artifact-path.broken-shard-reference` fail closed。Finding #1 是“已定义但应 ignore”与“未定义”的实现状态区分，#2 是既定处理顺序，#3 是既定 malformed fail-closed，#4 是 supported inline opener 的 bounded escape classification；四项均可由该 contract 唯一裁决，不需要新增 stable issue、parser dependency 或 Owner choice。

## Fix Authorization（修复授权）

Fresh Fixer 仅获授权修改 Story 11-5 shared artifact-document discovery 的直接实现、focused tests，并把修复记录追加到本 evaluation；授权 findings 为 **#1、#2、#3、#4**。

1. **#1 definition state**：以 typed sentinel/union 保留 first definition 的 `local-md` 或 `defined-but-ignore` 状态；full/collapsed/shortcut 命中 ignore 时跳过，真正未定义的 explicit reference仍按既有 contract block；不得访问 external/network target。
2. **#2 post-decode drive**：single decode 后检查 slash/backslash drive-letter并返回既有 `unsupported-local-reference`；不得 second-decode、fallback consumption 或泄露 raw/absolute/drive evidence。
3. **#3 malformed inline**：识别 `[...](` 后，missing `)`、missing angle `>`、angle close 后出现 non-whitespace trailing content均返回既有 `malformed-link-destination`；不得新增 title grammar或完整 CommonMark parser。
4. **#4 escaped opener**：outer scanner 仅以紧邻连续反斜杠的 odd/even 规则决定 `[` 是否转义；保持 image exclusion、nested bracket、reference normalization、order/dedupe/self-link不变。

Current `SPEC 07`、`SPEC 09` 与 public CLI docs 已准确表达 Owner L，Fixer 不应为重复描述修改它们。不得新增/重命名 stable issue，不得修改 Story、tracker、flow gates、CR summary/rules/TODO、CR04-06、external drawer、IDE mirrors或 Story 11.6+。

## Required Verification（必需验证）

Fixer 完成后至少需要以下 focused evidence；所有 block cases 同时断言 `artifact-path.broken-shard-reference`、正确 `referenceKind`、`actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`、安全 details 与 before/after zero mutation：

- Reference definitions：full、collapsed 与 shortcut usage 分别覆盖 external scheme、angle external、network path与 fragment-only definition，均被确定性 ignore且不访问 target；local definition继续消费；真正未定义的 explicit full/collapsed reference继续以 `undefined-reference` block；first-definition-wins 不回归。
- Post-decode drive：至少覆盖 percent-encoded colon 的 slash form与 encoded/real backslash form，均以 `unsupported-local-reference` block；保留 exactly-once decode fixture，确保不引入二次 decode。
- Malformed inline：覆盖 missing `)`、missing angle `>`、`<local.md>junk`；覆盖 trailing whitespace、合法 angle local与合法 angle external回归。不得以新增 title 支持替代 fail-closed fixture。
- Escaped opener：覆盖一个 literal backslash（odd，作为文本 ignore）与两个 literal backslashes（even，继续解析 link），并回归 image exclusion、nested bracket、reference usage、order/dedupe/self-link。
- 运行 focused artifact-document discovery suite、相关 resolver/path-portability/CLI focused suites、docs check、canonical normal+strict checker与 scoped `git diff --check`。Full suite 若仍仅有 external drawer fixed-count drift，应隔离报告，不得归因 Story 11-5，也不得修改 drawer/mirrors。

## Scope Exclusions（范围排除）

- 不授权 dependency upgrade、完整 CommonMark parser、HTML block、inline code span、image link、link title或其它未形成 finding 的 grammar扩展。
- 不授权隐式 fallback consumption、external fetch、artifact migration/copy/rename/delete、config rewrite或 progress mutation。
- 不授权顺带重构 URL parser、portable path subsystem、definition precedence或 unrelated error schema。
- 不授权新增/重命名 stable issue ID，亦不授权修改 Story、tracker、flow gates、CR rules/TODO或 CR04-06。
- 不授权修改 external `speclite-drawer-er-modeler`、`.agents`/`.claude` mirrors、canonical fixed-count baseline或 Story 11.6+ 范围。
- 不授权 commit 或 push。

## Next Gate（下一门禁）

由 fresh Fixer 按 #1-#4 的唯一授权边界完成修复并在本文件追加 fix record；随后必须进行 fresh Reviewer Round 4 三层审查与 fresh Evaluator Round 4。只有 latest Reviewer 与 latest Evaluator 均为 PASS，且 required verification 无 Story 11.5 新增失败，才可进入 CR04、CR05、CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 4

#### Fix Results（修复结果）

1. **Finding #1 — Reference definition classification state：已完成**
   - 在 `src/config/artifact-document-discovery.ts` 将 definition table 收窄为 typed union：`local-md(path)` 与 `defined-but-ignore`。
   - 保留 first-definition-wins；full、collapsed 与 shortcut usage 命中 `defined-but-ignore` 时确定性跳过且不进入文件访问，命中 `local-md` 时继续沿用 declaration order、dedupe 与 self-link 流程。
   - 真正未定义的 explicit full/collapsed reference 继续以 `undefined-reference` fail closed；普通未定义 shortcut-like bracket text 的既有忽略语义未改变。
   - 在 `test/artifact-document-discovery.test.ts` 增加 external scheme、angle external、network path、fragment-only、local definition、first-definition-wins、full/collapsed/shortcut 与未定义 collapsed reference 覆盖，并断言 zero mutation。

2. **Finding #2 — Post-decode Windows drive-letter guard：已完成**
   - 在唯一一次 `decodeURIComponent()` 之后、`.md` acceptance 之前再次执行 slash/backslash drive-letter guard，统一映射到既有 `unsupported-local-reference`。
   - 未加入 second decode、fallback consumption 或新增 public evidence；block result 继续只暴露安全 `referenceKind`。
   - 新增 encoded colon slash、encoded colon/backslash 与 exactly-once decode fixtures；均断言 `actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`、稳定 issue、safe details 与 zero mutation。

3. **Finding #3 — Malformed inline destination fail-closed：已完成**
   - outer scanner 已识别 `[...](` 后若同一 bounded line 找不到 closing `)`，立即返回既有 `malformed-link-destination`。
   - angle destination 缺少 `>` 或 `>` 后在 outer `)` 前包含 non-whitespace junk 时返回同一 reason；trailing whitespace 与合法 local/external angle destination 保持有效。
   - 未新增 link title grammar、parser dependency或完整 CommonMark parser。

4. **Finding #4 — Escaped opening bracket odd/even semantics：已完成**
   - outer scanner 在接受 `[` 前计算紧邻连续反斜杠数量：odd 作为 escaped text 跳过，even 继续现有 link/reference scanner。
   - 新增 odd/even fixture，并同场回归 image exclusion、nested label、reference usage、declaration order、dedupe 与 normalized self-link。

#### Verification（验证）

- `npx vitest run test/artifact-document-discovery.test.ts`：**PASS**，1 file / 48 tests。
- `npx vitest run test/artifact-root-resolution.test.ts test/story-6-4-path-portability.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts test/docs-reference-cli-options.test.ts`：build 后复跑 **PASS**，5 files / 41 tests。
- `npm run build`：**PASS**。
- `npm run docs:check`：**PASS**，72 Markdown files / 5 drafts。
- `npm run release:packaging-check`：**PASS**，canonical counts 为 `core=19`、`sdlc=50`、`default=69`，无 finding。
- canonical source checker normal 与 strict：**PASS**，`status=ok`、`findings=[]`；报告的 82 个 canonical changed paths 属于当前共享工作树既有变更，governance classes 为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`。
- `git diff --check -- src/config/artifact-document-discovery.ts test/artifact-document-discovery.test.ts <round-3-evaluation>`：**PASS**。
- `npm test`：64 files 中 59 passed / 5 failed；541 tests passed / 12 failed / 4 todo。12 项失败全部为外部 `speclite-drawer-er-modeler` 引起的固定数量预期漂移（`core 18→19`、`default 68→69`），不涉及 Story 11.5 resolver 行为；未修改 drawer、mirrors 或 fixed-count baseline。

#### Scope Audit（范围审计）

- 本轮仅修改 `src/config/artifact-document-discovery.ts`、`test/artifact-document-discovery.test.ts`，并按 Skill 要求把本记录追加到当前 evaluation。
- 未修改 `SPEC`、public docs、Story、tracker、flow gates、review summary、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`、CR rules/TODO/CR04-06、drawer、IDE mirrors、fixed counts 或 Story 11.6+。
- 无 commit、无 push、无新 stable issue、无新增 Owner blocker。

**Fix outcome（修复结论）**：四项 authorized P1 均已定点修复并通过 Story 11.5 focused/related verification。下一门禁保持不变：fresh Reviewer Round 4 三层审查与 fresh Evaluator Round 4。
