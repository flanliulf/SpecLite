---
Story: 11-9
Round: 19
Date: 2026-09-07
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260907-round-19.md
Review Model: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 19 轮 CR 代码审查结果（复审）进行独立逐条评估。已核对被评估文件 SHA-256 为 `22c66c41d2a7644858a50c23970dfa77079b4baadb0881b70f8e1b35121a7f85`。Reviewer 提出的 6 项 P1 均有 current source 反例，并且正确行为已由 shared CR contract、Story 11.9 AC7/AC9/AC11/AC12 或 Round 1/2/5 的历史范围裁决冻结，不构成新的 validation scope；全部确认为阻塞交付的 P1。`supersededIndex` identity/continuity 继续维持 carried deferred P2，Option A（拒绝 named handle，不实现 `%TAG` binding）保持不变。

本轮授权严格限制为 existing resolver、focused regression、两处 public docs/help metadata 与本 evaluation 的 Fix Summary。不得修改 shared contract、Story、tracker、completion gate、CR logs、其他 docs 或其他代码，也不得运行 broad build、full suite、packaging 或 governance。

---

## Previous Round Review（上轮问题回顾确认）

### Round 18 Finding #1/#2：部分关闭

Round 18 已证明 document-root quoted/flow/block/property-only 与 owner-before/after 既定矩阵持续通过，但 `property + plain remainder` 没有进入现有 bounded whole-file state，故只在该相邻分支上复发。本轮不得重开已关闭的 quoted/flow/block/property-only controls。

### Round 18 Finding #3：保持关闭

Invalid/bounded-disallowed anchor 与 primary tag token 的拒绝仍有效；bare/primary/secondary/verbatim controls 继续保留。Option A 不变，本轮不得实现 `%TAG` binding、named handle、通用 YAML parser或扩大 tag vocabulary。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|---|---|---|
| Round 5–18 | `supersededIndex` identity/continuity | CR TODO / P2 | 继续 deferred；不得混入本轮 P1 patch。 |

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高] Document-root property 后的 plain remainder 泄露伪 terminal owner**
> - 来源：auditor + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:920-938,1022-1051` 的 document-root property 检查只验证并消费 property token；`plainHeader` 仅识别 sequence/mapping value，不覆盖 allowed property 后的 document-root plain remainder。于是该 remainder 没有建立 `plainScalarIndent` 或 ambiguity state，后续缩进 exact key 可进入 terminal matcher。shared contract `cr-contract.md:65,409` 要求 tracker 只接受 role-owned、唯一且可解析的 scalar，并对 ambiguous/non-scalar whole file fail-close。

**严重性判断：合理**

Parser-invalid tracker 可伪造 terminal authority并改变 legacy completion/new-run选择，直接破坏 AC9/AC11，P1 合理。

**修复建议：可行**

只在现有 bounded YAML scanner 中识别 document-root allowed property 后的 plain remainder并进入受界 plain/ambiguous state；不得实现通用 YAML parser、`%TAG` binding、named handle或新 tag vocabulary。

**误报评估：非误报**

控制流存在明确漏支，且 Reviewer 已给出 sprint/workflow 双 role 的 production-function 反例。

---

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[高] Module API 未对 caller-frozen input contract 统一 fail-close**
> - 来源：blind + edge + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:25-57` 在 `RegExp.test(reviewSeries)` 前未验证 string，也在 code-review root 缺失的成功返回前不验证 `trackerBindings`；完整 binding 只在 `validDoneFinalizer()` 下游触发。与之相对，production CLI 在 `:1307-1350` 已对 unknown/duplicate/partial binding 做入口拒绝。shared contract `cr-contract.md:54,63-65` 明确要求 module API 与 CLI 消费同一组 caller-frozen `reviewSeries`/`trackerBindings`，非法输入 preflight HALT。

**严重性判断：合理**

非法 identity/binding 会随 filesystem topology 在 success、failure或异常之间漂移，破坏 read-only resolver 的稳定 fail-close preflight，属于 P1。

**修复建议：可行**

在任何 filesystem inspection 前执行精确的 module input validation；复用既有 series pattern 与三 role binding schema，保持 CLI 的 redacted `invalid-arguments` 行为和现有 valid inputs。不得新增 config resolver、默认 workflow binding或扩大 public CLI。

**误报评估：非误报**

contract 对 module/CLI parity 有直接明文要求，且 current root-missing fast path确实绕过 binding验证。

---

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[高] Current artifact 缺失 `disposition` 仍被当作 current evidence**
> - 来源：blind + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:435-445` 显式把 `frontmatter.disposition === undefined` 当作 current。虽然 shared contract 的示例块没有逐块展示 `disposition: current`，但 `cr-contract.md:81,113-120` 以及 Round 1/2 evaluation 已冻结 current/superseded disposition identity：current artifact 必须完整绑定 current disposition，non-current disposition应进入 existing invalid-evidence path。历史裁决优先于把示例省略误读成 optional compatibility。

**严重性判断：合理**

缺失字段的截断/旧格式 artifact 可被升级为 current round evidence并影响 legacy resume，属于 lifecycle authenticity P1。

**修复建议：可行**

仅把 current identity校验收紧为 `frontmatter.disposition === "current"`；保留 superseded exact binding与 ordinary unrelated files，不新增 disposition值或 reason taxonomy。

**误报评估：非误报**

Round 1/2 已批准 exact current disposition，不需要新的 owner decision。

---

## Finding #4 Evaluation（发现 #4 评估）

### Review Original（审查原文）

> **[高] Authentic `DONE` 未验证完整 predecessor schema与严格日历时间**
> - 来源：blind + edge + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:448-580` 已 no-follow读取 predecessor并验证一部分 identity/hash/state，但没有执行 `cr-contract.md:137-207` 已定义的完整 review/evaluation v2 required schema：review 的 scope manifest、layer quorum、AC coverage、finding hash/counts以及 evaluation 的 review binding、accepted counts、convergence仍可缺失。`test/code-review-contract.test.ts:3391-3422` 的 happy-path helper正是缺字段的 minimal artifact。Round 1/2 evaluation 已明确要求“完整 v2”、各 predecessor schema/state 与 real hash一致，因此这是旧 P1 的残余，不是新 validation scope。

`validTimestamp()` 仅做 lexical regex + `Date.parse`；ECMAScript 会归一化 `2026-02-29`、`2026-02-30` 等不存在日期，不能满足 Round 2 已冻结的合法 `generatedAt`/freshness语义。

**严重性判断：合理**

缺 quorum/scope/evaluation binding或虚假日历日期的 predecessor仍可组成 authentic `DONE`，会错误切换 unfinished legacy lifecycle，P1 合理。

**修复建议：可行**

为四类 predecessor应用各自 existing v2 required-field validator，并以 exact schema/value-domain/identity/binding为界；timestamp在保留现有 offset语法的前提下 round-trip验证真实日历日期。不得增加新 schema字段、重写 producer、实现通用 YAML parser或扩大到 unrelated artifact validation。

**误报评估：非误报**

完整 schema已经由 owning contract和Round 1/2裁决承诺；本轮只补齐 resolver authenticity实现。

---

## Finding #5 Evaluation（发现 #5 评估）

### Review Original（审查原文）

> **[高] Story tracker允许 `**Status**` 冒充 exact machine-owned key**
> - 来源：blind + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:680-690` 为 Story key两侧加入可选 `**`。shared contract `cr-contract.md:65,409` 与 Round 5–11连续裁决均只批准 Markdown region外、未缩进、原始 exact `Status` scalar；没有任何 contract或历史 decision批准 bold key兼容。展示文本不是 machine-owned key。

**严重性判断：合理**

`**Status**: done` 可在真实 whole-file hash下替代 owning scalar并伪造 completed legacy，属于 P1。

**修复建议：可行**

删除 Story key的可选 bold wrapper，仅接受原始 `Status:`；补 bold/italic/link/code/comment/body negatives与 plain positive control。不得改变 Story格式或引入 CommonMark parser。

**误报评估：非误报**

不存在已批准兼容；current regex与 contract exact-key语义直接冲突。

---

## Finding #6 Evaluation（发现 #6 评估）

### Review Original（审查原文）

> **[高] CR04/CR05 durable output plane在 public docs与help metadata中未同步**
> - 来源：blind
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确，但修复面必须受限**

`workflow-artifact-layout.md:183-186` 正确声明 Story-local CR04/CR05 reports与 project-level backlog；`:237-245` 却仍称 CR04 只输出建议且 CR05 backlog才稳定落盘，与 shared contract `cr-contract.md:239-287` 及 current CR04/CR05 Skill相冲突。Story 11.9 AC7要求同步 docs/help/metadata，因此 stale row 是 P1。

`module-help.csv:48-49` 的 description 已表达 CR04 durable result及 CR05 backlog + Story result，但 CR05 `output-location` 只列 Story-local `code-reviews`。该列由 `src/modules/module-metadata.ts:510-550` 作为 opaque CSV field读取；项目已有 `{pathA}|{pathB}` 双输出惯例，且 tests明确保留该值。与此同时，`src/manifest/manifest-generator.ts:181-202` 对含 `|` 的 location刻意不生成单一 `artifactContract`。因此可以使用既有 `|` 语法表达双 plane，但必须把“help entry保留双路径、phase coverage不伪造单一默认 contract”的现有机器语义纳入 GREEN；不得引入逗号导致列移位，也不得顺带改 CSV parser或 manifest algorithm。

**严重性判断：合理**

公开目录规约与 canonical Skills互斥，且 help metadata遗漏 durable plane，违反 AC7并可能误导 closeout消费者，P1合理。

**修复建议：可行**

删除/更新仅 `Current Differences` 中 stale CR rules row，并只更新 CR05 help row为现有 `|` 双 output-location语法；增加定向 CSV parse/help-entry断言，确认字段数、skill identity、双路径顺序以及既有 multi-output manifest语义。不得改变 basenames、round、approval、CR04/05 algorithm、CSV parser或 manifest generator。

**误报评估：非误报**

单来源 finding有 contract、Skill与 public doc三方直接证据；既有 pipe convention足以在不发明新 CSV语法的情况下修复。

---

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|---|---|---|---|
| 1 | document-root property + plain remainder泄露 | [高] | **P1** | existing bounded whole-file grammar的相邻 fail-open分支。 |
| 2 | module input contract未入口 fail-close | [高] | **P1** | shared contract明确要求 module/CLI消费同组 frozen inputs。 |
| 3 | missing `disposition`被视为 current | [高] | **P1** | Round 1/2已冻结 exact current disposition。 |
| 4 | `DONE` predecessor schema/calendar验证不完整 | [高] | **P1** | existing v2 authenticity承诺尚未完整落地。 |
| 5 | bold Story status冒充 exact key | [高] | **P1** | 无兼容授权，违反 exact machine-owned scalar。 |
| 6 | CR04/05 docs/help output plane不一致 | [高] | **P1** | AC7与 durable output contract已明确要求同步。 |

### CR TODO（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|---|---|---|---|
| carried | `supersededIndex` identity/continuity | [延续] | **P2** | 保持 deferred，由后续 CR05登记；本轮禁止实现。 |

### Evaluation Decision（评估决定）

- **Finding #1–#6**：全部确认有效，结论为 `FIX_REQUIRED`。
- **Owner Gate**：`NONE`。六项均由 existing contract/历史裁决唯一确定；本轮 normal defects 已授权修复，无需重复请求用户批准。
- **Option A**：保持不变；拒绝 named handle，不实现 `%TAG` binding。

## Bounded Fixer Authorization（受界 Fixer 授权）

### Exact File Whitelist（精确文件白名单）

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
2. `test/code-review-contract.test.ts`
3. `docs/reference/workflow-artifact-layout.md`
4. `assets/source/speclite/sdlc-skills/module-help.csv`
5. 本 evaluation 文件仅允许 append `Fix Summary`

除上述文件外零写入。尤其禁止修改 shared contract、Story、tracker、completion gate、review logs、CR04/05 Skill、README、release/fixture baselines、source/installed mirrors、SPEC或其他 docs。

### Independent RED / GREEN Matrix（独立 RED / GREEN 矩阵）

1. **Root property plain remainder**
   - RED：sprint/workflow分别覆盖 `!local note`、`&memo note` 后缩进伪owner，owner前/后顺序均证明 current错误 accepted。
   - GREEN：上述全部 stable fail-close；bare/primary/secondary/verbatim、quoted/flow/block/property-only与真实 owner controls持续通过。
2. **Module input preflight**
   - RED：non-string `reviewSeries`及 missing/partial/contradictory三 role bindings在 root missing、canonical-only、unfinished legacy至少两种 topology下证明非稳定或错误 success。
   - GREEN：任何 filesystem inspection前统一拒绝；valid module与 CLI parity controls保持。
3. **Current disposition**
   - RED：canonical与legacy各至少一个 missing `disposition` current basename错误继续。
   - GREEN：missing/unknown/non-current stable invalid-evidence、zero write；exact `current`与合法 `superseded` controls保持。
4. **Full predecessor v2 + calendar time**
   - RED：逐 review required group（scope/quorum/finding fields）、evaluation group（review binding/accepted/convergence）至少各一 missing/malformed反例；四 predecessor identity/state controls；`2026-02-29`、`2026-02-30` impossible dates及 valid leap-day/offset controls。
   - GREEN：只接受 owning contract现有 required v2 fields/value domains、same identity/binding与真实 calendar timestamp；不得新增 schema字段。
5. **Exact Story status**
   - RED：bold/italic/link/code/comment/body variants不得认证，plain `Status: done`为正控。
   - GREEN：只接受 region外未缩进 raw exact `Status`；既有 fence/comment/raw controls保持。
6. **Docs/help metadata**
   - RED：定向断言 current layout stale row与 CR05 help entry缺少双 location事实。
   - GREEN：stale row消失；CSV以既有 parser成功读取且 CR05 entry精确保留 Story-local + backlog双路径、无列位移；`|` 的 existing multi-output manifest语义保持，不修改 parser/generator。

### Allowed Verification（允许验证）

- 仅运行上述六组新增 test name的独立 RED，再在 patch后逐组独立 GREEN。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`
- 对五个白名单文件执行 `git diff --check` 与实际 diff越界审计。
- 只读 syntax check或 production-function定向 probe。

禁止 broad build、full suite、packaging、canonical governance、fixture regeneration或 completion gate刷新。Fixer完成后只向本 evaluation append Fix Summary；随后必须 fresh Reviewer → fresh Evaluator。latest Reviewer/Evaluator双 PASS前不得进入 CR04、CR05或 CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-07
- **Model Used**: GPT-5.6Sol
- **Fix Items**: 6
- **Mode**: patch
- **Evaluation Input SHA-256**: `c40058e2c7fac92c6999c65d9c294e6fe12b43da21d24ae8d5a76ba9bb617666`

#### Fix Results（修复结果）

1. **Finding #1 — document-root property + plain remainder**
   - RED：首次运行先由 `yaml` parser 证明 `!local note` / `&memo note` 后缩进伪 owner 为 parser-invalid（`MULTILINE_IMPLICIT_KEY`）；修正测试断言后，对本项识别行做 isolated baseline replay，resolver 仍错误返回 `ok:true`，独立 RED 成立。该 replay 发生在其余 production patch 已落盘之后，不声称所有 RED 均先于全部生产修改。
   - FIX：只在现有 bounded scanner 中识别 document-root allowed property 后的 plain remainder，并进入既有 `plainScalarIndent` / whole-file ambiguity state；未增加 tag vocabulary、named handle、`%TAG` binding 或通用 YAML parser。
   - GREEN：sprint/workflow、tag/anchor、owner 前后顺序全部 stable fail-close；focused suite 中既有 bare/primary/secondary/verbatim、quoted/flow/block/property-only与真实 owner controls持续通过。
2. **Finding #2 — module input preflight**
   - RED：non-string `reviewSeries` 在 missing root topology 错误 success；missing/partial/contradictory bindings 的结果随 topology漂移。
   - FIX：在任何 filesystem inspection 前验证 string series 与三 role binding 的既有 frozen shape；旧 happy fixtures通过集中 helper补入合法 bindings，未把 bindings 改回 optional。
   - GREEN：missing/canonical/legacy三种 topology均稳定返回 `invalid-review-series` 或 `invalid-tracker-bindings`；合法 module与既有 CLI controls通过。
3. **Finding #3 — current disposition**
   - RED：canonical current basename缺少 `disposition` 时错误 success。
   - FIX：current identity只接受 exact `disposition: current`；superseded分支保持原有 exact判断。
   - GREEN：canonical与legacy missing disposition均进入既有 invalid-evidence path；focused current/superseded controls通过。未触碰 deferred `supersededIndex` P2。
4. **Finding #4 — predecessor v2 schema与真实日历时间**
   - RED：删除 review `baseSha` 后，完整 hash仍被错误认证为 completed。
   - FIX：对 review/evaluation predecessor应用 owning contract现有 required groups、value domains、review binding与 head/scope关系的 bounded validator；timestamp增加 Gregorian calendar round-trip，不新增字段。
   - GREEN：review scope/quorum/finding groups、evaluation binding/accepted/convergence groups逐组缺失均拒绝；`2026-02-29`、`2026-02-30`拒绝，`2028-02-29T12:40:00+08:00`接受；四 predecessor既有 identity/state/hash controls通过。
5. **Finding #5 — exact Story status**
   - RED：`**Status**: done` 错误认证 completed。
   - FIX：移除 Story key的可选 bold wrapper，只保留 raw exact key。
   - GREEN：bold/italic/link/code/comment/body variants拒绝，`Status: done`正控与既有 fence/comment/raw controls通过。
6. **Finding #6 — CR04/CR05 durable output plane**
   - RED：public layout仍含“CR4只输出建议”的 stale row，CR05 help仅列 Story-local location。
   - FIX：仅删除 `Current Differences` 中 stale CR row；CR05 `output-location`使用既有 `|` 语法列出 `{implementation_artifacts}/code-reviews|{implementation_artifacts}/cr-rules/cr-todo-backlog.md`。
   - GREEN：CSV由项目既有 parser成功解析，skill identity、outputs列和双路径顺序精确；`createArtifactContract()`对 multi-output仍返回 `undefined`，未修改 CSV parser、manifest generator或单一路径 contract。

#### Verification（验证）

- 六组 `npx vitest run test/code-review-contract.test.ts -t "CR19 Finding N" --reporter=dot`：逐项 GREEN，均为 `1 passed`。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`84 passed | 4 todo`，PASS。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- 白名单 tracked diff `git diff --check` 与 untracked resolver `--no-index --check`：PASS。
- 按授权未运行 broad build、full suite、packaging、canonical governance或 completion gate刷新。

#### Output Hashes（输出哈希，evaluation append前）

- `resolve-cr-directory.mjs`: `90681391e31f440ca3416d5b2468da9cf79265d83d4923981151108adad60134`
- `test/code-review-contract.test.ts`: `4d61bee12d035981dd4e6cdd14b7c2c7f1487d24d91b1409c696072d940fad4c`
- `docs/reference/workflow-artifact-layout.md`: `2dff7d27c86a21a17982ebdec784c05a0092348aabed21d7ee0bbd44fd750664`
- `assets/source/speclite/sdlc-skills/module-help.csv`: `a196fa2a43f3c57b0a2ae5830d56e0bd6add54c034752db844655ebc906f433a`

#### Scoped Diff Audit（范围审计）

- 写入仅限 evaluation授权的 5 个文件：resolver、focused test、`workflow-artifact-layout.md`、SDLC `module-help.csv` 与本 evaluation append。
- `workflow-artifact-layout.md` 与 `module-help.csv` 含本轮开始前既存 mixed-worktree改动；本轮分别只删除1个 stale CR row、修改1个 CR05 row，未覆盖其他改动。
- 未修改 shared contract、Story、tracker、completion gate、review logs、CR04/CR05 Skill、SPEC、11.10、drawer、mirrors、其他 docs或 packaging。
- `supersededIndex` P2保持 deferred；未新增 schema字段、通用 parser、`%TAG`、named handle或词汇扩张。

**Result**: ✅ 六项授权 P1 已完成最小修复与 focused验证；等待 fresh Reviewer → fresh Evaluator，未进入 CR04/CR05/CR06。
