---
Story: 11-9
Round: 3
Date: 2026-09-05
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260905-round-3.md
Review Model: GPT-5.6
Type: Code Review Evaluation
---

# CR Evaluation（代码审查评估）

## Evaluation Summary（评估总结）

对 Story 11-9 的第 3 轮 CR 复审结果进行逐条独立评估。已读取 Round 3 summary 与三层结果、Round 1/2 summary/evaluation 及 Round 2 Fix Summary，并核对 current Story、shared CR contract、resolver、focused test oracle 与 classified ledger。Reviewer 合并后的 **7 个 P1 全部有效**，没有误报、降级项或 CR TODO；整体裁决为 **`FIX_REQUIRED`**，**Owner Gate：`NONE`**。

本轮授权严格限制为：补齐已冻结的 malformed current-signal fail-close、CR04/CR05 current evaluation lineage、required tracker authenticity、leaf frozen context、blocked-class stable reason、entrypoint no-title-rederive activation 与 bounded candidate detector。不得修改 CR algorithm、report basename、round/approval policy、Story 11.10、external drawer、workspace mirrors或 fixed-count baseline。

---

## Previous Round Closure Audit（上轮问题回顾确认）

### Round 1 ancestor containment 与 stable/redacted I/O：CLOSED

current resolver 仍逐段执行 no-follow/type/realpath containment，并将 I/O 失败映射为有限、redacted 的 CR-local diagnostic；Round 3 未提供可推翻该主体闭环的新反例。

### Round 2 Finding #1 canonical malformed/unbound evidence：PARTIAL

合法 numeric filename 中的 malformed frontmatter 已 fail-close，但 `looksLikeCrArtifactSignal()` 仍要求 numeric `round` 后才把 known family 识别为 signal；filename 自身 malformed 的 current intent仍可绕过。由本轮 Finding #1 接续关闭。

### Round 2 Finding #2 authentic `DONE`：PARTIAL

predecessor/gate 的 no-follow、identity、状态、canonicalized hash 与 freshness 主体已落地；CR04/CR05 未绑定 current evaluation，tracker change set也未绑定真实 required roles/files/after-state。由本轮 Findings #2–#3 接续关闭。

### Round 2 Finding #3 leaf executable frozen context：PARTIAL

唯一 shared test-only adapter与 callback-zero 主体已落地，但未携带 `reviewSeries`，且只拒绝 synthetic `titleFallback` 字段。由本轮 Finding #4 接续关闭。

### Round 2 Finding #4 runner-wide zero mutation：PARTIAL

14 类 blocked case 与 controlled-tree exact equality 已存在，但除 `invalid-project-root` 外大多只断言任意字符串 reason。由本轮 Finding #5 接续关闭。

### Round 2 Finding #5 entry activation parity：PARTIAL

source/installed surface 与 byte parity 边界正确，installed `SKILL.en.md` 保持 `ENOENT`；但 entrypoint 本身未明确声明禁止根据 title/slug/filename 重推导，因此删除该门禁语义仍可 false-green。由本轮 Finding #6 接续关闭。

### Round 2 Finding #6 bounded candidate scanner：PARTIAL

现有 detector 已覆盖若干 concrete/alternate/concat/config 形式，但遗漏 bare `title/name/slug/filename` 命名族和真实 quoted/interleaved split expressions。由本轮 Finding #7 接续关闭。

### Historical CR TODO（历史 CR TODO，非阻塞）

无。本轮 focused suite 中既有 4 个 `it.todo` 不因本次评估改变状态，也不纳入本轮授权。

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[P1] Canonical known-family 的 malformed filename 会绕过 current-signal fail-close**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:252-262,333-339` 先用 `looksLikeCrArtifactSignal()` 筛选，再执行 strict suffix/identity 校验；但 signal predicate 本身要求 `-round-[0-9]+.md`。因此 `11-9-code-review-summary-20260905-main-round-nope.md`、空 round 或错误 extension 等携带 current Story + known family + current series intent的 basename可在第 254 行被跳过，并在 canonical 目录返回 `no-current-series-evidence`。`test/code-review-contract.test.ts:649-681` 只覆盖合法 basename配坏 frontmatter，没有覆盖 filename-level mutation。

**严重性判断：合理**

该分支允许在身份损坏的 current lifecycle 上继续新 run，直接破坏 AC9/AC11 的 fail-close 与 zero-write，P1 合理。

**修复建议：可行**

只调整 current resolver 的 candidate intent识别顺序：先精确识别 current Story、known family、current series 的 artifact intent，再校验 date/round/extension；intent命中但 canonical basename非法时返回既有 `current-series-evidence-invalid`。必须保留普通 notes、其他 Story artifact和其他 series的合法 artifact为 unrelated。

**误报评估：非误报**

控制流与缺失测试矩阵可直接证明 fail-open。

---

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[P1] CR04/CR05 `COMPLETED` 未绑定 current evaluation basename/hash**
> - 来源：blind + edge + auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:396-433,467-477` 对 CR04/CR05 只核对通用 artifact identity、source hash和 `result=COMPLETED`，没有检查两份 predecessor 自身的 `evaluationSource` / `evaluationSourceHash`。`test/code-review-contract.test.ts:1472-1501` 的 current CR04/CR05 helper没有这两个字段，却仍组成 authentic DONE。shared contract `Completion Freshness` #7 明确要求二者都绑定本次 evaluation。

**严重性判断：合理**

同 Story/series/round但源自另一 evaluation 的 closeout报告可被复用，从而误判 legacy lifecycle为 completed，影响 AC8/AC9/AC11，属于 P1。

**修复建议：可行**

在已有 `validDoneFinalizer()` / `readBoundArtifact()` 边界内，要求 CR04与CR05各自的 `evaluationSource` basename精确等于 finalizer的 current evaluation basename，且 `evaluationSourceHash`精确等于对真实 evaluation bytes按现有 canonicalization重算的 hash；missing、wrong source与 hash mismatch全部稳定阻断。不得改变 CR04/CR05或 finalizer algorithm/schema。

**误报评估：非误报**

current happy-path fixture缺字段仍通过，是直接反例。

---

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[P1] Tracker change set 只验形状，不验 required role、真实路径/key与写后状态**
> - 来源：blind + edge + auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:503-523` 只要求三条不同 portable path、任意非空 key、hash形状及文本 `rereadConsistent=true`；它既不验证 Story/sprint/configured workflow三种 role，也不 no-follow读取 tracker比对当前 canonicalized `afterHash`。`test/code-review-contract.test.ts:1578-1594` 甚至使用不存在的 `.../stories/11-9.md` 与构造 hash，仍可促成 DONE。shared contract `Completion Freshness` #6要求 required tracker真实存在、精确定位并写后重读一致。

**严重性判断：合理**

任意三个文件或伪造 hash可替代真实完成状态，使 unfinished legacy被判 DONE，属于交付阻塞 P1。

**修复建议：可行，但必须 fail-close处理配置边界**

resolver只能消费调用方已冻结的 required tracker identities，不得自行猜测 configured workflow path/key。Story role必须精确绑定 `${implementationArtifacts}/stories/${storyKey}.md` + `Status`，sprint role必须精确绑定 `${implementationArtifacts}/sprint-status.yaml` +完整 `storyKey`；workflow role只在 merged runtime config明确声明 required时按该 exact path/key验证，明确 optional时才可省略。每个 required target必须 no-follow读取 project-contained regular file，并使当前 canonicalized bytes等于报告中的 `afterHash`。若 current resolver invocation拿不到 configured workflow identity/requiredness，必须 stable block/HALT并返回 Evaluator，不得默认 `bmm-workflow-status.yaml`、不得因文件不存在而宽松跳过，也不得扩大到新 config resolver或 public CLI。

**误报评估：非误报**

current helper中的假路径/假 hash证明现有验证仅为形状检查。

---

## Finding #4 Evaluation（发现 #4 评估）

### Review Original（审查原文）

> **[P1] Leaf executable oracle 未冻结 `reviewSeries`，也未拒绝真实 title-derived extra fields**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`test/code-review-contract.test.ts:945-980,1269-1312` 的 resolved/supplied schema与 equality checks均不含 `reviewSeries`，且只拒绝 artificial `titleFallback`。`storyTitle`、`storySlug`、`storyName`、`storyFilename`、`crDirCandidate`等真实 fallback surface作为额外字段会被忽略并执行 callback。

**严重性判断：合理**

oracle无法表达 runner解析 `main`而 leaf消费其他 series，亦不能证明 leaf拒绝真实 title-derived输入，导致 AC4/AC5/AC11 false-green，P1 合理。

**修复建议：可行**

只在唯一 shared test-only adapter中把 `reviewSeries`加入 frozen required identity并严格相等；将 supplied context冻结为 exact accepted field set，任何额外字段都稳定 `frozen-cr-context-mismatch`。逐 CR01–06覆盖 missing/mismatch `reviewSeries`与上述真实 extra fields，全部断言 callback恰零次；不得修改 leaf algorithm或新增第二套 resolver。

**误报评估：非误报**

字段列表与当前分支直接证明缺口。

---

## Finding #5 Evaluation（发现 #5 评估）

### Review Original（审查原文）

> **[P1] 14 类 blocked zero-mutation matrix 未冻结逐类 stable reason**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`test/code-review-contract.test.ts:768-883` 已覆盖14类并验证 callback-zero与树快照，但 `details.reason`大多仅为 `expect.any(String)`。因此 lifecycle、unsafe与I/O分类互换仍可通过。current resolver已有稳定映射：dual=`canonical-and-unfinished-legacy-coexist`；multi=`multiple-unfinished-legacy-directories`；canonical malformed=`current-series-evidence-invalid`；legacy malformed=`legacy-current-series-evidence-invalid`；ancestor类=`unsafe-code-review-root`；candidate类=`unsafe-cr-directory-entry`；artifact symlink/non-file=`unsafe-cr-artifact-entry`；artifact read/root listing=`inspection-io-failure`；invalid root=`invalid-project-root`。

**严重性判断：合理**

reason是调用方恢复/诊断分支的稳定输入；错误分类会让 completion evidence高估 closure，违反 AC9/AC11，P1合理。

**修复建议：可行**

在现有参数化 matrix中建立精确 `{blockedClass -> issueId/category/reason}` 表并逐类断言上述映射，同时保留 redaction、callback-zero和 project/external tree exact equality。不得新增 reason taxonomy或改变 production behavior来迎合测试。

**误报评估：非误报**

`expect.any(String)`无法冻结 observable diagnostic。

---

## Finding #6 Evaluation（发现 #6 评估）

### Review Original（审查原文）

> **[P1] Source/installed activation测试未正向冻结 no-title-rederive 禁止性语义**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效，但 Reviewer 的“不得修改 entrypoint”修复限制不成立 — 需要 bounded 修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`test/code-review-contract.test.ts:1109-1175` 对 source entry使用宽松 OR regex并仅排除危险正向措辞，对 installed entry也只排除一个相邻 pattern；门禁语义完全缺失仍会通过。独立读取八个 package的 current `SKILL.md` / `SKILL.en.md` 后确认：它们描述 numeric resolver或 verified `crDir`，但没有统一、明确写出“不得根据 Story title/slug/name/filename重新推导 `crDir`”。因此仅加强测试而禁止修正文案会形成无法满足的 GREEN criteria。

**严重性判断：合理**

active entrypoint是 agent激活时首先消费的 contract surface；byte parity只能证明复制一致，不能证明所复制语义完整。该缺口影响 AC4/AC7/AC11，P1合理。

**修复建议：可行，范围修订如下**

允许在 shared contract package、runner、CR01–06八个 package的 source `SKILL.md` 与 `SKILL.en.md` 中各加入一条最小、语义等价的 hard gate：只消费一次解析并冻结的 numeric Story identity + `reviewSeries` + `crDir`，禁止根据 title/name/slug/filename或本地 candidate重推导目录。随后对每个 source ZH/EN entry正向断言该门禁；两个 IDE fresh target仅重放 installed active `SKILL.md`的同一断言和 byte parity，并继续断言 installed `SKILL.en.md` 为 `ENOENT`。不得修改 workflow、installer surface、workspace mirrors或为测试改写其他 entrypoint内容。

**误报评估：非误报；仅修复范围需纠正**

Reviewer识别的语义缺口成立；但其“不得修改 entrypoint以迎合测试”与current bytes冲突。这里授权的是补真实 activation contract，而非为断言制造无业务语义的措辞。

---

## Finding #7 Evaluation（发现 #7 评估）

### Review Original（审查原文）

> **[P1] Candidate detector 漏 bare title/name/slug/filename 与真实 quoted/interleaved concat**
> - 来源：blind + edge + auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`test/code-review-contract.test.ts:1407-1421` 的 `titleName`仅包含 `storyKey/storySlug/storyName`及少量变体，遗漏 AC3明示的 bare `title/name/slug/filename`与等价 prefixed/dotted forms。`test/code-review-contract.test.ts:1043-1053` 所谓 shell/template concat仍通过 `.join("")`生成连续 token；专用 regex也只覆盖有限 JS `+ "-" +`形状。真实 quoted/interleaved shell、template与config表达式可以不进入 candidate集合，ledger仍 false-green。

**严重性判断：合理**

candidate set本身漏项会使 exact ledger与 `active-canonical=[]`失去证明力，直接影响 AC7/AC10/AC11，P1合理。

**修复建议：可行**

保持现有 frozen roots与 explicit files完全不变，只扩展 bounded detector到 bare及等价 prefixed/dotted `title/name/slug/filename` placeholder，以及 shell/template/JS/config中的 quoted或interleaved concat。mutation必须使用真实分段字节，例如 `${story_id}"-"${story_slug}"-code-review"`、`"{story_id}-" + "{filename}-code-review"`、`${story.id}${"-"}${story.slug}${"-code-review"}`；每个 family必须先被 detector发现，再因临时路径未分类稳定失败。不得扩大到 generic repository scan、Story 11.10、drawer、mirrors、archive/history。

**误报评估：非误报**

当前命名集合和 mutation bytes均可机械证明漏扫。

---

## Bounded Fix Authorization（唯一 Bounded 修复授权）

### Allowed Files（允许修改文件）

Fixer只可修改以下文件；除本 evaluation追加 Fix Summary外，任何其他路径均禁止写入：

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
2. `test/code-review-contract.test.ts`
3. `test/fixtures/code-review-contract/title-bearing-path-ledger.json`（仅当 detector修正导致当前 frozen classified match的 locator/token发生机械变化；不得借此重分类 active finding）
4. 下列八个 package各自的 `SKILL.md` 与 `SKILL.en.md`（仅允许加入 Finding #6 的一条最小 no-title-rederive hard gate，不得改其他段落）：
   - `speclite-code-review-contract`
   - `speclite-goal-orchestrator-epic-story-code-review-runner`
   - `speclite-code-review-01-reviewer`
   - `speclite-code-review-02-evaluator`
   - `speclite-code-review-03-fixer`
   - `speclite-code-review-04-rules-extractor`
   - `speclite-code-review-05-todo-tracker`
   - `speclite-code-review-06-finalizer`
5. 本文件 `11-9-code-review-evaluation-20260905-round-3.md`（只允许追加 Fix Summary）

Finding #3只能验证调用方已冻结的 required tracker identities。若在以上白名单内无法获得 configured workflow tracker的 exact requiredness/path/key，Fixer必须 HALT并返回 Evaluator；不得读取模糊候选、默认 legacy `bmm-workflow-status.yaml`、扩白名单到 config/runner实现或发明 optional语义。

### Explicitly Forbidden（明确禁止）

- 不得修改 shared contract、runner/CR01–06 workflow、CHANGELOG、templates、module help、README/current docs、release manifest、SPEC、Story、tracker、completion gate、root goal records或其他 CR artifacts。
- 不得修改 report basenames、artifact schema、CR review/evaluation/fix/rules/TODO/finalizer algorithm、round numbering、approval/confirmation policy、dependencies或 public CLI。
- 不得修改 installer/file projection；installed `SKILL.en.md`继续必须为 `ENOENT`。
- 不得扩展到 Story 11.10、external `speclite-drawer-er-modeler/`与 zip、workspace `.agents/.claude` mirrors、fixed-count baselines、archive/history。
- candidate scan或 tracker identity若暴露白名单外 residual，必须 HALT并返回 Evaluator，不得自行吸收。

---

## RED / GREEN Verification Authorization（RED / GREEN 验证授权）

### RED Evidence（红灯证据）

Fixer必须先增加失败断言并在 production/doc patch前运行 focused test记录 RED；现有 `35 passed / 4 todo`不得替代。RED至少逐项证明：

1. canonical/legacy中的 current Story + known family + current series malformed filename当前被当作 unrelated，同时 ordinary notes/其他 Story应保持 unrelated。
2. CR04/CR05 missing/wrong `evaluationSource`或真实 evaluation hash mismatch当前仍可组成 DONE。
3. arbitrary tracker path/key、missing/non-regular tracker及 fake current `afterHash`当前仍可组成 DONE；不得使用不存在的 Story shorthand path作正向 fixture。
4. CR01–06 对 missing/mismatch `reviewSeries`及 `storyTitle/storySlug/storyName/storyFilename/crDirCandidate`等extra fields当前仍会执行callback。
5. 14类matrix中 reason互换时当前断言仍可通过。
6. 任一 source/installed active entry删除明确 no-title/name/slug/filename rederive hard gate时，当前 activation测试仍可通过。
7. bare变量族与真实 quoted/interleaved split concat当前不产生 candidate，绕过 unclassified fail-close。

### GREEN Criteria（绿灯标准）

1. malformed current artifact intent在 canonical/legacy均稳定 fail-close；ordinary notes、其他 Story与合法其他 series仍不受影响。
2. CR04与CR05都精确绑定 finalizer所引用的 current evaluation basename及真实 canonicalized hash；missing/wrong/hash mismatch稳定阻断。
3. authentic DONE fixture使用真实存在、project-contained、no-follow regular的 required Story/sprint/configured workflow trackers，exact role/path/key与当前 canonicalized `afterHash`全部成立；任一缺失、身份不明或不一致均阻断。configured workflow identity不可用时必须HALT，不得猜测。
4. 唯一 shared test-only leaf adapter冻结 `storyId + reviewSeries + canonicalCrDir + crDir + compatibilityMode + legacyArtifactPaths`和exact accepted schema；逐 CR01–06的missing/mismatch/extra-field case均返回同一 stable HALT且 callback恰零次。
5. 14类blocked matrix逐例冻结 `issueId/category/reason`的既有精确映射，并继续通过callback-zero、redaction及project/external tree exact equality。
6. 八个 source package的 ZH/EN entrypoint均包含最小等价的 explicit no-title/name/slug/filename rederive hard gate；两个 IDE target的 installed active `SKILL.md`逐字节一致并重放同一正向断言，installed `SKILL.en.md`保持 `ENOENT`。
7. detector覆盖 bare/prefixed/dotted placeholder与真实 quoted/interleaved shell/template/JS/config concat；逐family mutation先被发现、再因未分类而失败，同时frozen roots、no-follow inventory、byte-wise locator、ledger双向exact equality与`active-canonical=[]`保持成立。
8. focused test最终 PASS且仍为原有4个`it.todo`；Allowed Files的`git diff --check` PASS。entrypoint canonical source改动引发的 governance/check由 outer owner在Fixer完成后按项目级流程执行，Fixer本轮不得运行。

### Allowed Verification（允许验证）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`
- 上述 focused test明确依赖且只用于 fresh-install parity的精确现有 install/update test（仅focused file无法执行该路径时）
- 对 Allowed Files执行 `git diff --check`
- 只读、精确且仍限定 frozen roots的 candidate-scan probe

不得运行 `npm run build`、full suite、packaging或 canonical governance。Fixer不得刷新 completion gate；由 outer Flow Gate owner在修复后独立刷新。

---

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | malformed filename绕过 current signal | P1 | **P1** | filename intent必须先于strict identity识别并fail-close。 |
| 2 | CR04/CR05缺current evaluation lineage | P1 | **P1** | 两份closeout报告必须绑定同一真实evaluation bytes。 |
| 3 | tracker change set不真实 | P1 | **P1** | required role/path/key与当前after-state必须独立重读核验。 |
| 4 | leaf未冻结series与exact schema | P1 | **P1** | 跨series或title-derived extra input仍可进入mutation。 |
| 5 | blocked matrix未冻结reason | P1 | **P1** | 14类observable diagnostic可能漂移而测试不报错。 |
| 6 | activation缺明确禁止性语义 | P1 | **P1** | parity不能替代active entrypoint hard gate。 |
| 7 | detector漏bare family与真实split concat | P1 | **P1** | candidate集合可漏项并令ledger false-green。 |

### CR TODO（建议纳入 CR TODO，非阻塞）

无。七项均为当前 Story 11.9阻塞项，不得延迟；四个既有 `it.todo`保持既有边界。

### False Positives（可忽略/误报）

无。Finding #6仅纠正Reviewer提出的修复文件限制，不驳回其finding。

### Evaluation Decision（评估决定）

- **Finding #1**：确认P1，补filename-level current intent fail-close。
- **Finding #2**：确认P1，补CR04/CR05 current evaluation basename/hash lineage。
- **Finding #3**：确认P1，补required tracker exact identity与真实after-state；配置身份不可得即HALT。
- **Finding #4**：确认P1，补`reviewSeries`与exact supplied schema，逐CR01–06 callback-zero。
- **Finding #5**：确认P1，冻结14类既有stable reason映射。
- **Finding #6**：确认P1，允许八个package的ZH/EN source entrypoint各增加一条最小禁止性hard gate；不改变installer surface。
- **Finding #7**：确认P1，仅在既有frozen roots内补bare命名族与真实quoted/interleaved concat detector。
- **Owner Gate**：`NONE`。七项observable behavior均由Story AC、Round2 GREEN criteria与shared contract唯一确定；不需要产品、Architecture或scope裁决。
- **整体裁决**：`FIX_REQUIRED`。完成bounded Fixer、outer completion gate刷新及fresh Reviewer/Evaluator双PASS前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 7

#### Fix Summary（修复总结）

1. **malformed current artifact intent**：将 current Story、known family、current `reviewSeries` 的 intent 识别前置于 strict filename identity；非法 round、空 round或错误 extension在 canonical/legacy均 fail-close，ordinary notes、其他 Story与合法其他 series保持 unrelated。
2. **CR04/CR05 evaluation lineage**：要求 rules extraction 与 TODO result各自的 `evaluationSource` basename和`evaluationSourceHash`精确绑定 finalizer引用的 current evaluation；测试在同步重算 predecessor source hash后仍验证 wrong/missing lineage被阻断。
3. **required tracker authenticity**：resolver只消费调用方冻结的 `trackerBindings`；Story与sprint绑定精确锚定`${implementationArtifacts}`和完整`storyKey`，workflow只接受显式requiredness/path/key。每个required tracker均执行project containment、ancestor no-follow、regular-file与当前canonicalized `afterHash`重读校验；bindings不可得、路径/key错误、missing/non-regular或bytes漂移均HALT，不猜测workflow默认路径。
4. **leaf frozen context**：唯一test-only adapter加入`reviewSeries`并冻结exact accepted schema；CR01–06对missing/mismatch series及`storyTitle`、`storySlug`、`storyName`、`storyFilename`、`crDirCandidate`等extra field统一返回`frozen-cr-context-mismatch`且callback为零。
5. **14类stable reason**：现有blocked zero-mutation matrix逐类冻结`issueId/category/reason`精确映射，并保留redaction、callback-zero及project/external tree byte-exact验证。
6. **八包activation hard gate**：仅在shared contract、runner与CR01–06的source `SKILL.md`/`SKILL.en.md`各增加一条最小等价禁止性语义；source ZH/EN及两个fresh-install IDE target的active `SKILL.md`均正向断言no-title/name/slug/filename rederive，installed `SKILL.en.md`仍为`ENOENT`。
7. **bounded candidate detector**：保持frozen roots与explicit files不变，补bare/prefixed/dotted `title/name/slug/filename` placeholder以及真实quoted/interleaved shell、JS和template split concat；ledger仅作机械locator/token同步，`active-canonical=[]`保持成立。

#### Verification（验证）

- RED：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `6 failed / 30 passed / 4 todo`。
- GREEN：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `36 passed / 4 todo`。
- Allowed Files：`git diff --check -- <Round 3 allowlist>` → PASS。
- 按evaluation限制未运行`npm run build`、full suite、packaging或canonical governance；completion gate与governance/check交由outer owner。
- 未修改Story、tracker、completion gate、workflow/reference、CHANGELOG、installer surface、workspace mirrors、Story 11.10、external drawer或fixed-count baseline。
