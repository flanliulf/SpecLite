---
Story: 11-5
Round: 2
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Round 2 三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级），但最新实现仍有 **6 个 P1 blocking findings**，因此本轮总体结论为 **FAIL**，不得进入 CR04/CR05/CR06。

Round 1 的 canonical whole/index entry symlink、声明顺序和 index self-link 已关闭；Owner M+L 的 mismatch 与 Markdown grammar 修复仅部分关闭。独立最小复现确认：Architecture 的 Planning root-level probe 在 `legacy-compatible` 模式被漏掉；subject directory 自身可通过 symlink 重绑定 authoritative boundary；angle-bracket external link 和 fenced code 被误当 local shard；Windows drive-letter reference 被误当 external；nested-bracket inline 与 shortcut reference 被静默漏读。

第 6 项不要求把 bounded subset 擅自扩大成完整 CommonMark，也不需要再次请求 Owner 决策：现行 `SPEC 09` 已明确支持 inline 与 reference-style local Markdown links，并要求 unsupported local-ish destination 不得静默忽略。Fixer 可以在不升级 dependency 的前提下支持这两种标准形态；若某一形态明确不属于实现支持集，也必须稳定映射为 `artifact-path.broken-shard-reference`，不能返回成功并少消费。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Incorporated evidence |
| --- | --- | --- | --- |
| Blind Hunter | PASS（层执行成功） | `FAIL` / 1 actionable finding | Windows drive-letter destination 在 portable guard 前被 generic scheme 分支忽略；其余 Round 1 主修复未发现新增偏差。 |
| Edge Case Hunter | PASS（层执行成功） | `FAIL` / 3 findings | subject directory symlink 重绑定、nested-bracket inline / shortcut reference 静默漏读、Windows drive-letter 静默忽略。 |
| Acceptance Auditor | PASS（层执行成功） | `FAIL` / 2 blocking gaps | Architecture root-level mismatch probe 被错误限定 explicit；angle-bracket external link 与 fenced code 被错误扫描为 shards。 |

本 Aggregator 对所有候选重新核对源码、contract、测试与临时项目行为；Windows finding 合并 Blind/Edge 重复证据，Acceptance 的 Markdown finding按不同根因拆为 angle destination 与 fenced-code context 两项。External drawer、`.agents/.claude` mirrors 与 fixed-count drift 未计入 Story 11.5 finding。

## Findings（去重发现）

### 1. [P1] Architecture Planning root-level probe 被错误限定为 explicit Solutioning

- **Category**：contract / compatibility diagnostic
- **Source**：Acceptance Auditor；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:584-619`；`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:104`
- **Evidence**：`architectureMismatchCandidates()` 在 `root.resolutionMode !== "explicit-config"` 时直接返回空数组，但 Owner M / `SPEC 09` 的限定只适用于额外的 Planning `architecture/architecture.md` 与 `architecture/index.md`；历史 `{planning_artifacts}/architecture.md` 是 Architecture 的无条件 bounded candidate。
- **Reproduction**：Architecture root 为 Planning fallback、`resolutionMode=legacy-compatible`、只存在 `planning/architecture.md` 时，resolver 返回 `artifact-path.subject-document-missing`，而不是 `artifact-path.config-artifact-mismatch`；`consumedPaths=[]`。
- **Impact**：AC7 的 bounded mismatch 诊断在合法 existing fallback 模式下失真，Owner M 的候选顺序未被完整实现。
- **Recommendation**：始终在可用 `planningRoot` 下探测 `{planning_artifacts}/architecture.md`；仅把 Planning architecture subject whole/index 限定为 explicit `solutioning_artifacts`。Probe 仍只生成 diagnostic evidence，不得 fallback 消费、迁移或写入。

### 2. [P1] Subject directory 自身的 symlink 可重绑定 authoritative boundary

- **Category**：security / path containment
- **Source**：Edge Case Hunter；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:102-121,394-450,560-582`
- **Evidence**：`inspectReadableSubjectFile()` 与 `resolveDeclaredShards()` 都先 `realpath(subjectAbsolutePath)`，随后把 symlink target 当作 authoritative container；它们没有验证 lexical subject directory 自身是否被 symlink 重绑定。Artifact-root resolver 的 containment 不等价于 subject-directory containment。
- **Reproduction**：令 `planning/prd` symlink 到 project 内另一个非 subject 目录，并在 target 中放置 `prd.md`，resolver 返回 `ok=true`、`whole-only`、`consumedPaths=["planning/prd/prd.md"]`。指向 project 外时同样可沿 symlink 消费。
- **Impact**：consumer 可读取 authoritative subject directory 之外的内容，且 public evidence 仍显示安全的 project-relative lexical path，破坏 AC4/AC5/AC10 与 `SPEC 09` path safety。
- **Recommendation**：在检查 canonical whole/index/shards 前验证 subject directory 本身未越出或重绑定其 authoritative lexical boundary；失败使用 `artifact-path.symlink-escape`，顶层 `actualConsumedPath=null`、`consumedPaths=[]`，保持零 mutation。不得仅以 symlink target 作为新的 subject container。

### 3. [P1] Angle-bracket external scheme 被误当 local Markdown shard

- **Category**：parser / external-reference classification
- **Source**：Acceptance Auditor；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:500-525`；`SPEC 09:100`；`docs/reference/cli.md:226`
- **Evidence**：scheme/network 判断发生在 angle destination 解包之前。`<https://example.com/chapter.md>` 的 raw value 不以 scheme 开头，解包后又不再检查 scheme，最后因 `.md` 后缀进入 local resolution。
- **Reproduction**：`index.md` 只含 `[External](<https://example.com/chapter.md>)` 时，resolver 错误返回 `artifact-path.broken-shard-reference` / `missing-shard`；contract 要求 external schemes 不作为 shard。
- **Impact**：合法文档会被错误阻塞，runtime 行为与 public docs 不一致，影响 AC3/AC4/AC5/AC8/AC10。
- **Recommendation**：先解析并解包 destination，再对实际 destination 执行 network/external scheme classification；继续保持 query/fragment stripping 与 single decode 的既定顺序。

### 4. [P1] Fenced code 中的示例 Markdown link 被误当 shard declaration

- **Category**：parser / Markdown context
- **Source**：Acceptance Auditor；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:458-497`；`SPEC 09:100`
- **Evidence**：三个 regex 直接扫描完整 raw Markdown，没有排除 fenced code context；代码块中的 link-like text 在 CommonMark 语义下不是 link。
- **Reproduction**：`index.md` 只含 fenced code ``[Example](missing.md)`` 时，resolver 返回 `artifact-path.broken-shard-reference` / `missing-shard`，而不是合法的 index-only sharded shape。
- **Impact**：文档中的教程、示例或代码片段会触发伪 shard 并阻塞 consumer，影响 AC3/AC4/AC5/AC8/AC10。
- **Recommendation**：在 link extraction 前以确定性、无依赖方式排除 fenced code spans（并确保 fence 内容不参与 definition/reference 扫描）；增加 backtick/tilde fence regression fixtures。

### 5. [P1] Windows drive-letter local-ish destination 被 generic external scheme 静默忽略

- **Category**：portability / fail-closed validation
- **Source**：Blind Hunter + Edge Case Hunter；Aggregator 独立确认
- **Location**：`src/config/artifact-document-discovery.ts:500-506`；`src/fs/path-normalizer.ts:64-78`
- **Evidence**：generic `/^[A-Za-z][A-Za-z0-9+.-]*:/` scheme check 先把 `C:` 归类为 external；既有 portable path guard 明确把 drive-letter path 视为越界/非法，但当前 reference 从未到达该 guard。
- **Reproduction**：`[Drive](C:/outside.md)` 返回 `ok=true`、`sharded-only`、`consumedPaths=[index.md]`、`issues=[]`。
- **Impact**：unsupported local-ish reference 被静默少消费，跨平台 evidence 误报有效；与 Owner L 的 fail-closed 语义冲突。
- **Recommendation**：在 generic URI scheme 前识别 drive-letter（含 slash/backslash 形态），返回 `artifact-path.broken-shard-reference`，`referenceKind=unsupported-local-reference`；public issue details 不得泄露 drive letter 或 absolute path。

### 6. [P1] Nested-bracket inline 与 shortcut reference 被静默漏读

- **Category**：parser / declared-shard completeness
- **Source**：Edge Case Hunter；Aggregator 独立确认并完成 Owner-scope 判定
- **Location**：`src/config/artifact-document-discovery.ts:467-495`；`SPEC 09:100`；`docs/reference/workflow-artifact-layout.md:142`
- **Evidence**：inline regex `\[[^\]]*\]\(([^)]*)\)` 无法解析 nested bracket link text；reference regex 只识别 full/collapsed `[text][label]` / `[text][]`，不会把 `[One]` 与 `[One]: one.md` 识别为 shortcut reference。两者都在定义存在或 shard 存在时返回成功但少消费。
- **Reproduction**：分别使用 `[See [One]](one.md)` 和 `[One]` + `[One]: one.md`，并创建 `one.md`，两种情况均返回 `ok=true`、`sharded-only`，但 `declaredShardPaths=[]`、`consumedPaths=[index.md]`。
- **Impact**：明确声明的 shard 被静默遗漏，破坏 AC3/AC4/AC5/AC10 的 complete consumption evidence。
- **Recommendation**：在 bounded、无 dependency upgrade 边界内识别 nested-bracket inline 与 shortcut reference；至少必须把未支持但明显 local-ish 的形态 fail closed 为 `artifact-path.broken-shard-reference`，不得静默成功。该修复不授权实现完整 CommonMark parser。
- **Owner decision classification**：**patch，不是新的 Owner decision**。现行 contract 已同时规定 inline/reference-style 支持和 unsupported local-ish block；无论选择支持还是稳定拒绝，当前 silent omission 都不合约。

## Round 1 Closure Matrix（首轮发现闭环矩阵）

| Round 1 finding | Round 2 result | Evidence |
| --- | --- | --- |
| #1 canonical whole/index symlink escape | PASS（原 finding 已关闭） | Canonical entry 已做 `lstat`、readability、realpath subject containment，并有 whole/index/in-bound fixtures；Round 2 Finding #2 是不同层级的 subject-directory symlink 重绑定。 |
| #2 config-vs-actual legacy mismatch | **FAIL / partial** | PRD/Epics 与 explicit Solutioning candidates 已覆盖；Architecture Planning root-level candidate 被错误绑到 explicit mode。 |
| #3 Markdown link grammar | **FAIL / partial** | 普通 inline/full reference、query/fragment、single decode、malformed/undefined 已覆盖；angle external、fenced code、drive-letter、nested/shortcut 仍偏离 fail-closed/ignore contract。 |
| #4 declaration order/dedupe | PASS | 实现保留首次声明顺序并按首次出现去重；fixture 使用逆字母顺序验证。 |
| #5 index self-link | PASS | direct、normalized、repeated self-link 均排除，`consumedPaths` 不重复 index。 |

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Evidence / note |
| --- | --- | --- |
| AC1 | PASS | Fresh PRD/Epics/Architecture subject directories 有既有 runtime/fixture evidence。 |
| AC2 | PASS | 三个 canonical whole producer paths 已锁定。 |
| AC3 | **FAIL** | 四类 link extraction/classification 缺口会伪造或漏掉 index 声明 shards；order/self-link 已通过。 |
| AC4 | **FAIL** | Subject symlink 可越界消费；合法或 local-ish Markdown shapes 被误阻塞/静默漏读。 |
| AC5 | **FAIL** | 唯一 decision table 已存在，但 runtime 分支仍未完整实现 Owner M+L。 |
| AC6 | PASS | Canonical Planning fallback subject 在 `legacy-compatible` 模式可正常消费且不迁移。 |
| AC7 | **FAIL** | Architecture Planning root-level mismatch probe 在 fallback mode 被误报 missing。 |
| AC8 | **FAIL** | Docs 声明 external scheme ignore、inline/reference-style support，但 runtime 对 angle external 和两类声明行为不一致。 |
| AC9 | PASS | Active fresh Architecture-to-Planning 与 root-level PRD/Epics negative scan evidence 仍成立。 |
| AC10 | **FAIL** | 当前 29 个 focused fixtures 未覆盖本轮六项 regression classes。 |
| AC11 | PASS | 本轮审查与建议只涉及 PRD/Epics/Architecture discovery；未扩展到 UX 或 Story 11.6+。 |

## Verification（验证）

- `npm test -- test/artifact-document-discovery.test.ts`：PASS，`29/29`。
- `npm test -- test/artifact-root-resolution.test.ts test/resolve-readers.test.ts test/story-6-4-path-portability.test.ts test/artifact-path-validation.test.ts`：PASS，`34/34`。
- `npm run docs:check`：PASS，72 Markdown files / 5 drafts。
- `git diff --check -- src/config/artifact-document-discovery.ts test/artifact-document-discovery.test.ts _bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md _bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md docs/reference/cli.md docs/reference/workflow-artifact-layout.md`：PASS。
- Canonical source checker（warn mode）：`status=ok`、`findings=[]`；live counts 为 `core=19`、`defaultInstall=69`，`changedPathCount=82` 属当前混合工作树背景。
- 独立临时项目复现：上述 Architecture fallback、angle external、fenced code、Windows drive、nested inline、shortcut reference、subject symlink 共 `7/7` 均复现当前错误行为；临时目录已清理。
- 未运行 build、full suite 或 packaging；本 Aggregator 未修改源码、tests、Story、tracker、SPEC/docs、progress logs 或其它 CR 文件。

## Caveats（限制与隔离项）

- Blind Hunter 误运行一次 build，但其报告确认没有 tracked `dist` 变化；这是 process caveat，不改变 findings。
- External `speclite-drawer-er-modeler`、`.agents/.claude` mirrors 与 canonical fixed-count `68 -> 69` drift 不属于 Story 11.5 Round 2 finding，也未据此扩大修复范围。
- 现有 focused tests 全绿只证明已登记的 29/34 cases；它们未覆盖本轮已复现的六类边界，不能据此判定 CR PASS。

## Next Gate（下一门禁）

进入 fresh Evaluator Round 2。Evaluator 应逐项确认以上 6 个 findings 的有效性、P1 优先级与 fixer 授权；在 latest Reviewer 与 latest Evaluator 都通过前，Story 11.5 保持 `review`，不得执行 CR04/CR05/CR06。
