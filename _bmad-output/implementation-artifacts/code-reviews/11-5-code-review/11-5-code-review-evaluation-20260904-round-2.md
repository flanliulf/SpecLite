---
Story: 11-5
Round: 2
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-5-code-review-summary-20260904-round-2.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 6

#### Fix Results（修复结果）

1. **#1 Architecture finite probe 条件拆分：已完成**
   - `planningRoot` 可用时无条件检查 Planning root-level `architecture.md`；仅 `explicit-config` 追加 Planning subject whole 与 `index.md`。保持 candidate order、diagnostic-only、block/no-consumption 与零 mutation。
2. **#2 subject directory symlink rebinding：已完成**
   - canonical entry inspection/listing/read 前 `lstat` lexical subject directory；symlink 复用 `artifact-path.symlink-escape`，安全 `affectedPath`、`actualConsumedPath=null`、`consumedPaths=[]`，不接受 realpath target 为新 container。
3. **#3 angle-wrapped external/network destination：已完成**
   - 先 parse/unwrap angle destination，再分类 external scheme/network，之后才做 query/fragment stripping、single decode 与 local `.md` 判断。
4. **#4 fenced code context：已完成**
   - 新增无 dependency bounded line-state masker，排除 backtick/tilde fence、合法较长 closing fence与 unclosed fence-to-EOF；未扩成完整 Markdown parser。
5. **#5 Windows drive-letter local-ish destination：已完成**
   - generic scheme 前识别 slash/backslash drive-letter，fail closed 为 `artifact-path.broken-shard-reference` / `unsupported-local-reference`；公开 evidence 不含 raw path、drive letter 或 absolute path。
6. **#6 nested-bracket inline 与 shortcut reference：已完成**
   - bounded bracket scanner 支持 nested inline、full/collapsed/shortcut reference及 normalized case-insensitive label，保持 usage order、dedupe、self-link exclusion和 destination guards。

#### Files Changed（修改文件）

- `src/config/artifact-document-discovery.ts`
- `test/artifact-document-discovery.test.ts`
- 本 evaluation（仅增加本记录）

现有 `SPEC 07`、`SPEC 09` 与 public CLI docs 已准确表达 Owner M+L，本轮未重复修改；未修改 Story、tracker、flow gates、CR summary/rules/TODO、external drawer、IDE mirrors 或 Story 11.6+。

#### Verification（验证）

- Focused discovery：`1` file、`38/38` passed。
- Build：ESM/DTS passed；resolver/path/CLI related：`3` files、`24/24` passed。首次 related run 仅因旧 `dist` stale 被 prerequisite 拒绝，required build 后通过。
- Docs：`72` Markdown files、`5` drafts passed。
- Canonical normal/strict：`status=ok`、无 findings；live `core=19`、`sdlc=50`、`defaultInstall.total=69`，仅 D0 且 `decisionRecordRequired=false`。
- Packaging：passed。
- Full：`59/64` files passed；`531` passed、`4` todo、`12` failed。12 项均为 external drawer 使 fixed counts 从 `18/68` 变为 `19/69` 的既有漂移；无 Story 11-5 discovery 新失败，未修改 drawer/fixed-count baselines。
- Scoped whitespace/diff audit：通过；边界仅为上述 implementation/test 文件与本记录。

#### Caveats（限制）

- Full-suite 12 项 external drawer failures 不属于 Story 11-5，未处理或降级为本 Story finding。
- 无新 Owner blocker；下一门禁仍为 fresh Reviewer Round 3 与 fresh Evaluator Round 3，本记录不构成 CR PASS/finalization 授权。

## Evaluation Summary（评估总结）

对 Story 11-5 的第 2 轮 CR 复审结果进行独立评估。Round 2 汇总的 6 个 finding 均可由 current source、Story AC 与 Owner M+L 已写入的 `SPEC 09` contract 交叉确认，均为阻塞当前交付的 P1 patch；没有 P0、P2、误报或需要新 Owner 决策的项目。

**Overall verdict（整体裁决）**：`FAIL`。Story 11-5 不得进入 CR04、CR05、CR06 或 `done`。下一步应由 fresh Fixer 只修复本评估明确授权的 #1-#6，完成 required verification 后进入 fresh Reviewer Round 3 与 fresh Evaluator Round 3。

## Previous Round Confirmation（上轮问题回顾确认）

### Round 1 #1 canonical whole/index symlink escape：已关闭原 finding

Current source 已对 canonical whole 与 canonical `index.md` 做 `lstat`、readability、`realpath` subject containment，并以 `artifact-path.symlink-escape` fail closed（`src/config/artifact-document-discovery.ts:102-118,560-581`）；focused fixtures 已覆盖 whole、index 与 in-bound canonical index symlink（`test/artifact-document-discovery.test.ts:291-334`）。Round 2 #2 是 subject directory 本身重绑定 authoritative boundary 的不同层级缺口，不重开原 finding。

### Round 1 #2 config-vs-actual mismatch：部分关闭

PRD、Epics 与 explicit Solutioning Architecture probes 已实现并有 fixtures（`src/config/artifact-document-discovery.ts:584-619`；`test/artifact-document-discovery.test.ts:336-397`），但 Architecture 历史 root-level `{planning_artifacts}/architecture.md` 被错误地和额外 Planning subject probes 一起限定为 `explicit-config`，故 Round 2 #1 有效。

### Round 1 #3 bounded Markdown grammar：部分关闭

普通 inline/full/collapsed reference-style、query/fragment、single decode、malformed/undefined/local-ish block 已实现（`src/config/artifact-document-discovery.ts:458-540`），但 Round 2 #3-#6 所列 classification/context/grammar 边界仍未满足 Owner L。

### Round 1 #4 declaration order/dedupe：已关闭

Declared shards 现按首次声明顺序 push 并 first-occurrence dedupe，不再 alphabetic sort（`src/config/artifact-document-discovery.ts:423-453`）。

### Round 1 #5 index self-link：已关闭

Resolved target 等于 canonical index 时不加入 shard list（`src/config/artifact-document-discovery.ts:449-450`），direct、normalized、repeated self-link fixture 已存在（`test/artifact-document-discovery.test.ts:90-108`）。

### Historical CR TODO（历史 CR TODO，非阻塞）

无。Round 2 的 6 项均属于 current Story 11-5 delivery scope，不能降级为 CR TODO。

## Finding #1 Evaluation（发现 #1 评估）

### Review Finding（审查原文）

> **[P1] Architecture Planning root-level probe 被错误限定为 explicit Solutioning**
> - 来源：Acceptance Auditor；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`architectureMismatchCandidates()` 在 `root.resolutionMode !== "explicit-config"` 或缺少 `planningRoot` 时直接返回空数组，因而 root-level 与 subject-level 三个候选被同一条件整体关闭（`src/config/artifact-document-discovery.ts:608-618`）。Owner M 已在 `SPEC 09` 唯一规定：Architecture 历史 `{planning_artifacts}/architecture.md` 是无条件 bounded candidate；只有额外 Planning `architecture/architecture.md` 与 `architecture/index.md` 才以 explicit `solutioning_artifacts` 为前提（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:104`）。Current implementation 与该顺序及条件不一致。

**严重性判断：合理**

该缺口使合法 `legacy-compatible` Architecture discovery 在只有 Planning root-level historical artifact 时误报 `artifact-path.subject-document-missing`，直接破坏 AC7 的 deterministic mismatch evidence。评估为 P1 blocking patch。

**修复建议：可行且唯一**

Fixer 应在 `planningRoot` 可用时始终先 probe `${planningRoot.resolvedRoot}/architecture.md`；仅当 Architecture root 的 `resolutionMode === "explicit-config"` 时再按顺序追加 Planning subject canonical whole 与 `index.md`。Probe 命中只能返回 `artifact-path.config-artifact-mismatch` 并 block，不能消费、迁移或作为 fallback continuation。

**误报评估：非误报**

Source 条件与 Owner M contract 直接构成反例，不需要新 Owner 决策。

## Finding #2 Evaluation（发现 #2 评估）

### Review Finding（审查原文）

> **[P1] Subject directory 自身的 symlink 可重绑定 authoritative boundary**
> - 来源：Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Resolver 由 lexical path 构造 authoritative `subjectDirectory`（`src/config/artifact-document-discovery.ts:63-66`），但 canonical entry 检查和 shard 检查都先将 subject directory `realpath`，再把 symlink target 当作 containment container（同文件 `416-420,560-577`）。因此 subject directory 本身若为 symlink，其 target 会被错误接受为新的 authoritative container；public evidence 仍只展示 lexical subject path。

**严重性判断：合理**

该行为允许 consumer 在已声明的 subject directory 之外读取 whole/index/shards，并以 display-safe lexical path 掩盖真实 target，破坏 authoritative boundary、AC4/AC5/AC10 与 path evidence safety。评估为 P1 blocking patch。

**修复建议：可行且可使用既有 stable issue**

Owner 决策不需要。`SPEC 09` 已要求 authoritative subject containment 与 canonical entry symlink fail-closed（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:98,102,106`），`SPEC 07` 也已规定 canonical boundary escape 使用 `artifact-path.symlink-escape`（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:293`）。Fixer 应在读取/listing canonical entries 前对 lexical subject directory 做 `lstat` 与 boundary validation；subject directory 本身为 symlink/rebound container 时，以 `artifact-path.symlink-escape` block，`affectedPath=subjectDirectory`、`actualConsumedPath=null`、`consumedPaths=[]`，保持零 mutation。不得把其 realpath target 升格为新的 authoritative subject directory，也不得改用新 issue ID。

**误报评估：非误报**

Artifact root resolver 的 root containment 不能替代 subject-directory-level boundary；current source 没有该层验证。

## Finding #3 Evaluation（发现 #3 评估）

### Review Finding（审查原文）

> **[P1] Angle-bracket external scheme 被误当 local Markdown shard**
> - 来源：Acceptance Auditor；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Current parser 在 angle destination 解包前先判断 URI scheme/network path（`src/config/artifact-document-discovery.ts:504-512`），解包后的 destination 不再重新 classification，随后只按 `.md` suffix 判为 local shard（同文件 `517-525`）。所以 `<https://example.com/chapter.md>` 会越过 external classification 并进入 local filesystem resolution。

**严重性判断：合理**

Owner L 与 public docs 已明确 external scheme 不作为 shard（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`；`docs/reference/cli.md:226`）。当前行为会让合法 external link 触发 false blocking issue，影响 AC3/AC4/AC5/AC8/AC10，属于 P1。

**修复建议：可行且唯一**

Fixer 应先完成 bounded destination parse/angle unwrap，再对实际 destination 做 external scheme/network classification，之后才执行 query/fragment stripping、single decode 和 local path checks。补 angle-wrapped `https:`/其它 external scheme 与 angle-wrapped network-path regression，断言它们被 ignore 且不进入 `declaredShardPaths`。

**误报评估：非误报**

Owner L 已足够裁决 angle destination 的 classification 顺序，无需扩大到完整 CommonMark parser。

## Finding #4 Evaluation（发现 #4 评估）

### Review Finding（审查原文）

> **[P1] Fenced code 中的示例 Markdown link 被误当 shard declaration**
> - 来源：Acceptance Auditor；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Definitions、inline links 与 reference-style usages 都通过 regex 扫描完整 raw Markdown（`src/config/artifact-document-discovery.ts:458-497`），没有排除 fenced code。Fenced code 中的 link-like example 不是文档声明的 link，却会被当作 shard candidate 或 undefined reference。

**严重性判断：合理**

伪 shard 会将合法 index 错误 block，直接影响 AC3/AC4/AC5/AC8/AC10。Owner L 选择的是 bounded CommonMark-compatible subset；“link”不包括 fenced code literal，因此该 context 已有唯一语义，不需要新 Owner gate。

**修复建议：可行且边界明确**

Fixer 应以 deterministic、无 dependency 的预扫描/状态机排除 fenced code 的 opening fence、content 与 closing fence，使其不参与 definition、inline 或 reference usage extraction；至少覆盖 backtick fence、tilde fence、合法缩进、closing fence 长度不短于 opening，以及未闭合 fence至 EOF。不得借此引入 dependency、实现完整 Markdown AST 或扩展处理 unrelated HTML/code-span grammar。

**误报评估：非误报**

Current raw-text regex 必然扫描 fence 内容，contract 的 CommonMark-compatible link 语义不允许把 code literal 当 link。

## Finding #5 Evaluation（发现 #5 评估）

### Review Finding（审查原文）

> **[P1] Windows drive-letter local-ish destination 被 generic external scheme 静默忽略**
> - 来源：Blind Hunter + Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Generic URI scheme regex 在 portable local path validation 前匹配 `C:`（`src/config/artifact-document-discovery.ts:504-506`），因此 `C:/outside.md` 被静默 ignore。既有 normalizer 明确将 drive-letter absolute path 作为越界/非法 path（`src/fs/path-normalizer.ts:64-75`），但该 reference 永远到不了相应 guard。

**严重性判断：合理**

Silent omission 会伪造完整 consumption evidence，并违反 Owner L 对 unsupported local-ish destination 的 fail-closed 约束及 public evidence 不得泄露 drive letter 的约束（`SPEC 09:100,106`）。评估为 P1。

**修复建议：可行且唯一**

Fixer 应在 generic external-scheme classification 前识别 Windows drive-letter local-ish forms（至少 `C:/...` 与 `C:\\...`，并保持 case-insensitive），稳定返回 `artifact-path.broken-shard-reference`、`referenceKind=unsupported-local-reference`。Public issue 的 `affectedPath` 与 details 只能使用 safe index/subject evidence，不得写入 raw reference、drive letter 或 absolute path。不得把 drive-letter path转换或尝试访问。

**误报评估：非误报**

Multi-source finding 与 source order 一致，Owner L 已定义 stable failure mapping。

## Finding #6 Evaluation（发现 #6 评估）

### Review Finding（审查原文）

> **[P1] Nested-bracket inline 与 shortcut reference 被静默漏读**
> - 来源：Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Inline regex 的 link text 在第一个 `]` 即结束，无法识别 nested-bracket link text（`src/config/artifact-document-discovery.ts:478-487`）；reference usage regex 只识别 full/collapsed `[text][label]`/`[text][]`，不会将有同名 definition 的 `[One]` 识别为 shortcut reference（同文件 `489-495`）。两者会在 shard 存在时成功返回但遗漏声明。

**严重性判断：合理**

该 silent omission 直接破坏 declared-shard completeness 与 AC3/AC4/AC5/AC10，属于 P1。

**修复建议：可行；Reviewer 建议需收窄为唯一合同实现**

Owner L 已明确“支持 inline 与 reference-style local Markdown links”（`SPEC 09:100`）。Nested-bracket link text 仍是 inline link，shortcut reference 仍是 reference-style link；因此 Fixer **必须支持并正确消费这两种形态**，不能选择把它们作为 unsupported local-ish block。实现可使用 bounded deterministic scanner，无需实现完整 CommonMark；必须保留首次声明顺序、first-occurrence dedupe、index self-link exclude、destination processing 顺序和现有 fail-closed behavior。至少补 nested-bracket inline、shortcut reference、case-insensitive/normalized shortcut label fixtures，并断言 `declaredShardPaths` 与 `consumedPaths` 完整。

**误报评估：非误报**

现有 M+L contract 足以唯一裁决，不需要 Owner 再选择“支持或拒绝”。

## Overall Evaluation Conclusion（整体评估结论）

### P0 Findings（P0 发现）

无。

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 分类 | 唯一裁决 |
|---|------|----------|-----------|------|---------|
| 1 | Architecture root-level probe 被错误限定 explicit | P1 | **P1** | patch | root-level candidate 无条件；仅额外 subject whole/index 限定 explicit。 |
| 2 | Subject directory symlink 重绑定 authoritative boundary | P1 | **P1** | patch | 使用既有 `artifact-path.symlink-escape`，不得接受 target 为新 container。 |
| 3 | Angle external scheme 被误当 local shard | P1 | **P1** | patch | angle unwrap 后先 external/network classification。 |
| 4 | Fenced code link-like literal 被扫描 | P1 | **P1** | patch | deterministic 排除 fence context，不引入 parser dependency。 |
| 5 | Windows drive-letter 被静默当 external | P1 | **P1** | patch | scheme classification 前 fail closed 为 unsupported local reference。 |
| 6 | Nested inline 与 shortcut reference 静默漏读 | P1 | **P1** | patch | 两者属于已承诺支持形态，必须支持，不能改为 reject。 |

### CR TODO（非阻塞）

无。不得将 #1-#6 降级或延后。

### False Positives（可忽略/误报）

无。

## Owner Decision Gate（Owner 决策门禁）

**Owner decision: not required**。

Owner M 已在 `SPEC 09:104` 唯一定义 Architecture root-level 与额外 subject-level probes 的适用条件；Owner L 已在 `SPEC 09:100` 唯一定义 supported inline/reference-style link、external/network ignore、unsupported local-ish fail-closed 与 destination processing 顺序。Angle external、fenced code、drive-letter、nested inline、shortcut reference 均可从该 contract 确定实现方向。Subject directory symlink 也可使用既有 `artifact-path.symlink-escape` 安全关闭，不需要新增 issue ID。

## Fix Authorization（修复授权）

Fresh Fixer 仅获授权修改 Story 11-5 artifact-document discovery 的直接实现、focused tests，以及在现有文字不精确时做最小 docs clarification；授权 findings 为 **#1、#2、#3、#4、#5、#6**。

1. **#1**：拆分 Architecture finite probe 条件；root-level Planning `architecture.md` 在 `planningRoot` 可用时无条件 probe，额外 Planning subject whole/index 仅限 explicit Solutioning；保持 candidate order、diagnostic-only、block/no-consumption/zero-mutation。
2. **#2**：在任何 canonical entry/listing/read 前拒绝 subject directory symlink rebinding；复用 `artifact-path.symlink-escape`，安全 evidence、空 consumed paths、零 mutation。
3. **#3**：angle destination unwrap 后执行 external scheme/network classification；不得访问 external target。
4. **#4**：以 bounded deterministic scanner 排除 backtick/tilde fenced code context，不引入 dependency，不扩张为完整 Markdown parser。
5. **#5**：generic scheme 判断前 fail closed Windows drive-letter local-ish path，使用 `artifact-path.broken-shard-reference` / `unsupported-local-reference`，不得泄露 raw path。
6. **#6**：支持 nested-bracket inline 与 shortcut reference；不得将已承诺支持形态改为 unsupported；继续遵循 order/dedupe/self-link 与 destination guards。

若 current docs 已准确表达 Owner M+L，Fixer 不应为了重复描述而改 `SPEC 07`、`SPEC 09` 或 public docs。不得新增 stable issue、dependency、fallback consumption、migration、write/progress mutation，亦不得处理 Story 11.6+。

## Required Verification（必需验证）

Fixer 完成后至少需要以下 focused evidence，且所有 block cases 断言 `actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block` 与 before/after zero mutation：

- Architecture `legacy-compatible` + Planning root-level `architecture.md` 命中 mismatch；Planning subject whole/index 在 non-explicit mode 不误 probe；explicit mode 的三个 candidates 保序。
- Subject directory symlink 指向 project 内其它目录与 project 外目录均返回 `artifact-path.symlink-escape`；普通真实 subject directory及既有合法 in-bound canonical entry symlink继续通过。
- Angle-wrapped external schemes/network destinations被 ignore；angle-wrapped local `.md` 仍按 destination pipeline消费。
- Backtick、tilde、合法缩进、较长 closing fence 与 unclosed fence 中的 inline/reference definition/usage 均不参与 shard extraction；fence 外链接仍按声明顺序消费。
- Windows drive-letter slash/backslash forms 均 fail closed 为 `artifact-path.broken-shard-reference` / `unsupported-local-reference`，公开 result 不含 drive letter/absolute path。
- Nested-bracket inline 与 shortcut reference（含 normalized/case-insensitive label）均被消费；继续覆盖普通 inline、full/collapsed reference、query/fragment、single decode、malformed/undefined、external/network、traversal、order/dedupe/self-link。
- 运行 focused artifact-document discovery tests、相关 resolver/path-portability tests、CLI focused tests、docs check、canonical normal+strict checker与 scoped `git diff --check`。Full suite 若仍只有 external drawer fixed-count drift，应隔离报告，不得将其误归 Story 11-5，也不得据此修改 drawer/mirrors。

## Scope Exclusions（范围排除）

- 不授权 dependency upgrade、完整 CommonMark parser、HTML block、inline code-span、image-link 或其它未形成 finding 的 Markdown grammar 扩展。
- 不授权隐式 second-root fallback consumption、artifact migration/copy/rename/delete、config rewrite 或 progress mutation。
- 不授权新增/重命名 stable issue ID，亦不授权修改 Story、tracker、flow gates、CR rules/TODO、CR04-06。
- 不授权修改 external `speclite-drawer-er-modeler`、`.agents`/`.claude` mirrors、canonical fixed-count baseline 或 Story 11.6+ 范围。
- 不授权 commit 或 push。

## Next Gate（下一门禁）

### 修复执行记录（末尾归档）
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 6

- #1 已拆分 Architecture root-level 与 explicit subject-level probes。
- #2 已在 canonical read/list 前拒绝 subject directory symlink rebinding，并输出安全空消费 evidence。
- #3 已在 angle unwrap 后执行 external/network classification。
- #4 已以无依赖 bounded masker 排除 backtick/tilde fenced code（含较长 closing 与 unclosed EOF）。
- #5 已在 generic scheme 前 fail closed drive-letter slash/backslash forms，且公开 result 不泄露 raw path。
- #6 已支持 nested-bracket inline 与 normalized/case-insensitive shortcut reference，并保持 order/dedupe/self-link guards。
- 详细 files changed、verification 与 caveats 见本文件前部同名 `## 修复执行记录`；focused discovery `38/38`、related resolver/path/CLI `24/24`、build/docs/canonical normal+strict/packaging 均通过。
- Full suite 为 `531` passed、`4` todo、`12` external drawer fixed-count failures；无 Story 11-5 新增失败，无新 Owner blocker。

由 fresh Fixer 按 #1-#6 的唯一授权边界完成修复并追加 fix record；随后必须进行 fresh Reviewer Round 3 三层审查与 fresh Evaluator Round 3。只有 latest Reviewer 与 latest Evaluator 均为 PASS，且 required verification 无 Story 11.5 新增失败，才可进入 CR04、CR05、CR06。
