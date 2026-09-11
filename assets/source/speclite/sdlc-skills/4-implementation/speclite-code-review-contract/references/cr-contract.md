# CR Workflow Contract v2（CR 工作流契约 v2）

本文档是 SpecLite CR01–06、Epic Story Code Review runner 及人工 strict-serial 编排的唯一规范性共享契约。各 consumer 必须直接读取本文件，不得复制、覆盖或重新定义本契约。

## Runtime Resolution（运行时解析）

执行任一 CR Skill 前必须：

1. 通过 `speclite resolve config --project-root {project-root}` 解析 merged runtime config。
2. 将当前 Skill 目录的父目录记为 `{skills-root}`。
3. 从 `{skills-root}/speclite-code-review-contract/references/cr-contract.md` 读取本契约。
4. 本文件不可读、runtime config 失败或关键路径为空时 HALT；不得使用 runner、历史默认路径或旧 CR artifact 作为 fallback。

## Execution Context（执行上下文）

CR01–06 必须同时支持 runner 编排和人工 fresh session 顺序调用。每次调用建立：

- `orchestrationMode: runner | manual`：只描述调用来源，不改变任何质量门禁。
- `confirmationPolicy: explicit | preauthorized`：需要写入或修复授权的 Skill 必须消费该值；缺失时固定为 `explicit`。
- `authorizationSource`：`preauthorized` 时必填，必须指向 runner goal record、人工 orchestrator record 或用户在当前调用中给出的明确授权。
- `handoffTarget: runner | manual-orchestrator | user`：Skill 结束时返回结构化结果的接收方。

任何 CR Skill 都不得把 runner 当成 scope、authorization、convergence 或 freshness 的唯一 authority。runner 可以提供候选输入和 durable records；各 Skill 仍须按本契约独立重算、验证并输出结果。人工模式下没有 runner record 时，用户当前明确授权或人工 orchestrator durable record 是合法 `authorizationSource`。

### Invocation Parameter Matrix（调用参数矩阵）

runner 与人工 orchestrator 调用各 CR Skill 时必须传入下列参数；缺失时按回落列处理，Skill 不得自行猜测：

| Skill | 必传参数 | 回落 |
|---|---|---|
| CR01 reviewer / CR02 evaluator | `reviewSeries`、`orchestrationMode`、`handoffTarget` | 只读，无授权参数 |
| CR03 fixer | `mode`、`confirmationPolicy`、`authorizationSource`、`orchestrationMode`、`handoffTarget` | `confirmationPolicy` 缺失固定 `explicit` |
| CR04 rules-extractor | `orchestrationMode`、`handoffTarget` | 修改全局文档另需显式授权 |
| CR05 todo-tracker | `mode`、`confirmationPolicy`、`authorizationSource`、`orchestrationMode`、`handoffTarget` | 同 CR03 |
| CR06 finalizer | `confirmationPolicy`、`authorizationSource`、`orchestrationMode`、`handoffTarget` | 同 CR03 |

`preauthorized` 而缺 `authorizationSource` 时，写入/修复类 Skill（CR03/05/06）必须 HALT，不得静默改写。

## Implementation Anchor Policy（实现锚点策略）

CR01–06、runner 和人工 orchestrator 必须按以下顺序判定实现证据：

1. `Contract Anchor`：owning SPEC 明确规定的 schema、接口、路径、命令或文件名；不满足即 hard gate 失败。
2. `Functional Anchor`：必须成立的功能行为、不变量、状态迁移或安全边界。
3. `Evidence Anchor`：证明功能成立的测试、fixture、snapshot、trace、report 或 command result。
4. `Guidance Anchor`：Story 建议、历史实现形态、示例目录或非规范性文件名，只用于定位，不得单独阻断。

固定源码路径、fixture、schema 或 command 只有 owning SPEC 明确要求时才是 hard gate。否则必须使用 equivalent implementation policy：只要等价实现满足 Functional Anchor，并有当前、可追溯的 Evidence Anchor，就不得因文件名、目录或实现形态不同而判失败。采用等价实现时必须在 review scope 或 goal records 中记录 owning source、等价依据和验证证据。

## Canonical Identity（规范身份）

- `storyId`：只包含 Epic 和 Story 数字，统一为连字符形式，例如 `8-4`。
- `storyKey`：tracker 与 Story 文件使用的完整 key，例如 `8-4-valid-ai-output-evidence-handoff`。
- `reviewSeries`：当前实现世代，默认 `main`；发生 Correct Course 或 runtime replacement 时必须使用新的稳定值。取值必须匹配 `^[a-z0-9][a-z0-9-]{0,31}$`（禁止 `/`、`..`、路径分隔符与空白）；不合法时 preflight HALT，不得插入任何 canonical filename。
- `round`：同一 `storyId + reviewSeries` 内从 1 开始连续递增。
- CR 目录固定为 `{implementation_artifacts}/code-reviews/{storyId}-code-review/`。
- Goal records 固定为 `{crDir}/goal-execute-records/`；不得为同一 Story 创建带 slug 的第二个 CR 目录。
- `storyId` 只接受规范 numeric identity `N.N` 或 `N-N`，且每段必须为无前导零的正整数；不得从 title、slug、filename remainder、中文、空格、标点或其他文本提取、截断或 fallback。
- 发现 legacy 或带 slug 目录时记录到 `legacyArtifactPaths`；不得自动移动、复制、重命名或删除。

### CR Directory Resolution（CR 目录解析）

`speclite-code-review-contract/scripts/resolve-cr-directory.mjs` 同时提供唯一 executable directory resolver 与 production context validator。resolver 只负责 numeric identity、current candidate 归属和物理路径安全，不拥有或复放 approval、tracker、gate、scope/hash、freshness、round 连续性或 supersession；这些检查仍由 runner、Flow Gate 与 CR01–06 的原 owner 执行。

orchestrator 在一个 Story 的 CR 闭环开始时只调用一次：

`node "{skills-root}/speclite-code-review-contract/scripts/resolve-cr-directory.mjs" --mode resolve --project-root "{projectRoot}" --implementation-artifacts "{implementation_artifacts}" --story-id "{storyId}" --review-series "{reviewSeries}" [--directory-choice "{directoryChoice}"]`

stdout `ok=true` 后，orchestrator 冻结 `storyId`、`reviewSeries`、`crDir`、`canonicalCrDir`、`compatibilityMode` 与 `legacyArtifactPaths` 为同一个 `directoryContext`，并原样传给 CR01–06。runner mode consumer 不得再次调用 resolver；manual mode standalone Skill 必须独立调用 resolver 一次并冻结同样 context。任何 consumer 都不得根据 title、slug、filename 或 tracker 重新推导目录。

每个 consumer 在任何实际写入前必须调用同一脚本的 production validator，并同时提供 orchestrator 冻结 context 与本次 consumer 收到的 context：

`node "{skills-root}/speclite-code-review-contract/scripts/resolve-cr-directory.mjs" --mode validate-context --project-root "{projectRoot}" --implementation-artifacts "{implementation_artifacts}" --frozen-context "{directoryContextJson}" --story-id "{storyId}" --review-series "{reviewSeries}" --cr-dir "{crDir}" --canonical-cr-dir "{canonicalCrDir}" --compatibility-mode "{compatibilityMode}" --legacy-artifact-paths "{legacyArtifactPathsJson}" --write-subpath "{writeSubpath}"`

每次实际写入都必须单独调用一次 validator，且 `--write-subpath` 必须逐字等于本次写入的目标路径；不得用任意一次写入（例如 `review-input.diff`）的校验结果覆盖其他写入目标（例如 summary、evaluation、ownership marker、goal record 或任何 pre-summary output）。一次 validator 调用只为它收到的那一个 `writeSubpath` 建立授权。

validator 只比较两份 context 的六个冻结字段并检查 `crDir` / `writeSubpath` 的物理安全；它不重新选择目录，也不替代 consumer 原有的 approval、scope/hash、tracker、freshness、round 或 coordinated-write gate。unknown、duplicate、empty、partial 参数、context mismatch 或 unsafe path 均以 redacted JSON fail-close，并在写入前 HALT。

orchestrator 首次解析并冻结一个 current run 后，必须在其他 pre-summary `.tmp` 或 goal record 写入前创建固定 ownership marker：`{crDir}/.tmp/cr-directory-ownership.json`。创建前先调用 production validator，并将 `writeSubpath` 精确设为 `.tmp/cr-directory-ownership.json`；验证成功后写入且重读以下唯一五字段 JSON：

```json
{
  "schemaVersion": "speclite.cr-directory-ownership.v1",
  "artifactType": "cr-directory-ownership",
  "storyId": "11-9",
  "reviewSeries": "main",
  "crDir": "_bmad-output/implementation-artifacts/code-reviews/11-9-code-review"
}
```

`storyId`、`reviewSeries` 与 project-relative POSIX `crDir` 必须逐字等于 frozen `directoryContext`。该 marker 只证明 pre-summary run 的目录 ownership，不证明 approval、tracker、gate、scope/hash、freshness、round 或 completion。后续 resolver 只读取这个固定 marker；不得扫描 `.tmp` 其他文件、`PLAN.md` 或 prose/approval claim。marker 缺失不从 reserved 目录内容猜测 authority；marker malformed、字段冲突、symlink、escape 或同一 Story/series 在多个目录各有合法 marker 时 fail-close。resolver 不创建、迁移、复制、重命名或删除 marker。

Resolver 是 read-only preflight，不创建目录、临时文件、goal record 或 progress mutation。归属矩阵固定为：

| On-disk state | `crDir` | Continuation |
|---|---|---|
| 无既有 current run | canonical `{storyId}-code-review/` | Continue；后续获得写入授权并通过 validator 后先创建 ownership marker |
| canonical-only | canonical directory | Continue |
| 恰一个 current legacy（即使包含 `DONE` claim） | 该 legacy directory | Continue with `compatibilityMode=legacy-resume`；完成性由正常 approval owner 判断 |
| 恰一个仅含合法 ownership marker 的 pre-summary legacy | 该 legacy directory | Continue with `compatibilityMode=legacy-resume`；不得创建 canonical sibling |
| 多个 current candidate | none | Block；仅显式 `directoryChoice` 可选择其中一个 current candidate |
| candidate symlink、non-directory、escape 或 evidence 无法唯一绑定 current series/round | none | Block before write |

legacy-only unfinished resume 是 existing run continuation，不是新 CR run；不得在 resume 中创建 canonical sibling 或把同一轮拆分到新旧目录。Review、evaluation、fix record、rules、TODO result、finalizer、`.tmp/` 与 goal records 全部使用 resolved `crDir`。

`directoryChoice` 只能解决多个安全 current candidate 的归属歧义；不得绕过 symlink/non-directory/escape/identity conflict，不得搬迁 artifacts、合并目录或把同一 round 拆到两个目录。resolver 只读取 current-family artifact 开头的少量 identity 字段以确认 Story/series 归属；ordinary notes、其他 Story、其他 series 与历史 superseded 文件不参与归属。完整 round/supersession lineage 与 approval validity 继续由 runner 和各 CR owner 检查。

Ambiguity 由本 shared CR workflow-local contract 拥有，不进入 `SPEC 07` project validation taxonomy。Stable diagnostic 固定为：

- `issueId: cr-directory.ambiguous-resume-root`
- `category: lifecycle`
- `severity: error`
- `continuation: block`
- `details`: `storyId`、project-relative POSIX `canonicalCrDir`、byte-wise 排序且去重的 `legacyCrDirs`、`reviewSeries`、每个候选的结构化 `roundEvidence`、稳定 `reason`

`roundEvidence` 只记录本次实际检查的 canonical/legacy current-candidate ownership 与安全结果，按 byte-wise 排序且不得读取或伪造尚未检查 candidate 的状态。

Details 禁止 absolute/home/temp path、raw artifact content、stack trace、随机值或非规范时间。该 diagnostic 必须先于任何 round artifact、goal record、temporary file、Story/tracker 或 progress mutation 返回。

## Canonical Paths（规范路径）

| 产物 | 路径 |
|---|---|
| Story | `{implementation_artifacts}/stories/{storyKey}.md` |
| 审查目录 | `{implementation_artifacts}/code-reviews/{storyId}-code-review/` |
| 审查总结 | `{crDir}/{storyId}-code-review-summary-{YYYYMMDD}-{reviewSeries}-round-{round}.md` |
| 审查评估 | `{crDir}/{storyId}-code-review-evaluation-{YYYYMMDD}-{reviewSeries}-round-{round}.md` |
| Goal records | `{crDir}/goal-execute-records/` |
| 完成门禁 | `{implementation_artifacts}/flow-gates/{storyKey}-story-completion-gate.md` |
| TODO backlog | `{implementation_artifacts}/cr-rules/cr-todo-backlog.md` |
| Rules extraction report | `{crDir}/{storyId}-cr-rules-extraction-{YYYYMMDD}-{reviewSeries}-round-{round}.md` |
| TODO result report | `{crDir}/{storyId}-cr-todo-result-{YYYYMMDD}-{reviewSeries}-round-{round}.md` |
| TODO utility result | `{implementation_artifacts}/cr-rules/todo-results/cr-todo-result-{YYYYMMDDTHHmmss}-{mode}.md` |
| Finalizer report | `{crDir}/{storyId}-cr-finalizer-{YYYYMMDD}-{reviewSeries}-round-{round}.md` |

不含 `reviewSeries` 的 legacy 文件只能作为历史证据读取。新 artifact 必须使用上述 v2 命名。

### Artifact Revision and Supersession（产物修订与替代）

同一 `storyId + reviewSeries + round` 的 canonical filename 唯一，代表 current 产物。当同一 round 需要重建（`HALTED` 后重试）或按 Correct Course 生成替代评估时：

- current 始终保留上表的 canonical filename；
- 被取代的旧文件在扩展名前追加 `-superseded-{n}`（`n` 从 1 递增），并在 frontmatter 写 `disposition: superseded` 与 `supersededBy`；
- 消费方只把 canonical filename 视为 current，`-superseded-{n}` 仅作历史证据；
- 禁止直接覆盖旧 current 而不保留 superseded 副本。

## Review Scope Manifest（审查范围清单）

每轮 reviewer 在 frontmatter 与正文中记录：

- `baseSha`：用户指定基线；未指定时使用当前 Story development slice 已记录基线，不得自动假设 `main`。
- `headSha`：当前 `HEAD`；有未提交改动时仍记录 `HEAD`，并由 `scopeHash` 绑定实际内容。
- `scopeHash`：对规范化的 `baseSha`、`headSha`、declared/actual/excluded 文件清单及当前内容摘要计算 SHA-256。
- `declaredFiles`：Story `File List` 或 Implementation Files 声明的文件。
- `actualChangedFiles`：相对 `baseSha` 的全部实际改动，包含 staged、unstaged、untracked。
- `excludedFiles`：用户明确排除且记录理由的文件。
- `scopeExceptions`：`actualChangedFiles - declaredFiles - excludedFiles`。
- `sourceMutationAt`：本轮审查输入中最后修改的源码/测试时间或等价可追溯时间。

`scopeExceptions` 非空时 reviewer verdict 必须为 `REVIEW_DEGRADED`，除非用户明确批准这些文件进入 declared 或 excluded scope。禁止只按 Story File List 过滤后忽略未声明改动。

## Artifact Schemas（产物 Schema）

### Review Frontmatter（审查 Frontmatter）

```yaml
schemaVersion: speclite.cr-review.v2
artifactType: code-review-summary
storyId: 8-4
storyKey: 8-4-example
reviewSeries: main
round: 1
generatedAt: 2026-08-25T12:00:00+08:00
modelUsed: OpenAI GPT-5.5
verdict: FINDINGS_REPORTED
baseSha: git-sha
headSha: git-sha
scopeHash: sha256:hex
sourceMutationAt: 2026-08-25T11:50:00+08:00
inputMode: diff
declaredFiles: [src/example.ts]
actualChangedFiles: [src/example.ts]
excludedFiles: []
scopeExceptions: []
availableLayers: [blind, edge, auditor]
failedLayers: []
acCoverageComplete: true
findingSetHash: sha256:hex
findingCounts:
  decisionNeeded: 0
  patch: 1
  verifyRequired: 0
  defer: 0
  dismiss: 0
```

Review `verdict` 值域：

- `PASS_RECOMMENDED`：三层 quorum 满足且没有阻塞 finding，等待 evaluator 独立裁决。
- `FINDINGS_REPORTED`：存在待 evaluator 裁决的 finding。
- `REVIEW_DEGRADED`：scope 不完整或审查层 quorum 不满足，不得用于 finalizer。

### Evaluation Frontmatter（评估 Frontmatter）

```yaml
schemaVersion: speclite.cr-evaluation.v2
artifactType: code-review-evaluation
storyId: 8-4
storyKey: 8-4-example
reviewSeries: main
round: 1
generatedAt: 2026-08-25T12:10:00+08:00
modelUsed: OpenAI GPT-5.5
reviewModel: review-model
reviewSource: review-filename
reviewSourceHash: sha256:hex
headSha: git-sha
scopeHash: sha256:hex
verdict: FIX_REQUIRED
acceptedCounts:
  p0: 0
  p1: 1
  deferred: 0
  verifyRequired: 0
  dismissed: 0
convergence:
  newBlocking: 1
  recurredBlocking: 0
  resolvedBlocking: 0
  churnDetected: false
  architectureCategories: []
```

Evaluation `verdict` 值域：

- `PASS`：无阻塞项、无未执行验证义务、无待登记延期项。
- `FIX_REQUIRED`：存在必须修改实现或测试的 P0/P1。
- `VERIFY_REQUIRED`：仅需补测试、断言或机械证据，不得改动生产语义。
- `PASS_WITH_DEFERRED_TODOS`：只有 evaluator 接受的非阻塞延期项，登记 TODO 后可收口。
- `ARCHITECTURE_TRIAGE`：finding 已迁移到 authority、ownership、lifecycle 或跨组件并发等架构裁决面。
- `STOP_LOSS`：达到 round、连续新 P1 或 churn 上限。
- `DECISION_NEEDED`：需求或授权缺失，不能安全选择修复方向。

禁止使用 `Approved`、`通过`、`不通过`等 prose 关键词代替 `verdict`。

### Fix Record（修复记录）

Fixer 必须更新 evaluation frontmatter 中的 `fixRecord`：

```yaml
fixRecord:
  mode: patch
  status: completed
  generatedAt: 2026-08-25T12:30:00+08:00
  modelUsed: OpenAI GPT-5.5
  changedFiles: [src/example.ts]
  sourceMutationAt: 2026-08-25T12:25:00+08:00
  verificationCommands: [npm test -- example]
  verificationResult: PASS
```

`mode` 值域为 `patch | verify-only`。`verify-only` 只允许更新测试、断言、fixture 或机械证据；一旦需要改变生产语义，必须停止并要求 evaluator 改判 `FIX_REQUIRED`。

### Rules Extraction Report（规则提炼报告）

CR04 必须写入 canonical path 定义的 durable report，而不是只返回聊天总结：

```yaml
schemaVersion: speclite.cr-rules-extraction.v2
artifactType: cr-rules-extraction
storyId: 8-4
storyKey: 8-4-example
reviewSeries: main
round: 1
generatedAt: 2026-08-25T12:40:00+08:00
modelUsed: OpenAI GPT-5.5
evaluationSource: evaluation-filename
evaluationSourceHash: sha256:hex
eligibleFindingSetHash: sha256:hex
candidateRuleCount: 1
globalRuleEligibleCount: 0
result: COMPLETED
```

`result` 值域为 `COMPLETED | HALTED`。合法 current evaluation 下 eligible finding 为零时，result 为 `COMPLETED` 且 `candidateRuleCount: 0`，是 clean PASS 的正常结果，不得因此 HALT；`HALTED` 仅用于缺失/无效 evaluation 或 artifact identity/hash 不一致。报告正文必须列出 eligible evidence、candidate rules、global eligibility、排除项及理由。未经用户明确授权不得修改全局文档。

### TODO Result Report（TODO 结果报告）

CR05 的收口与变更操作（`closeout`、`add`、`resolve`、`extract`）每次都必须写入 durable result report；只读查询（`list`、`check`）不修改 backlog，默认只返回结果、不产生 workspace mutation，仅在用户显式要求留档时写 utility result。`closeout` 是 Story 收口唯一入口：`PASS` 产出 `COMPLETED` 且 `mappedFingerprints: []` 的 no-op，`PASS_WITH_DEFERRED_TODOS` 等价 add。Story closeout 使用 `{crDir}` canonical path；无 Story identity 的 project utility 使用 TODO utility result path，并把 Story/evaluation binding fields 写为 `null`：

```yaml
schemaVersion: speclite.cr-todo-result.v2
artifactType: cr-todo-result
operationScope: story
storyId: 8-4
storyKey: 8-4-example
reviewSeries: main
round: 1
generatedAt: 2026-08-25T12:45:00+08:00
modelUsed: OpenAI GPT-5.5
mode: add
evaluationSource: evaluation-filename
evaluationSourceHash: sha256:hex
confirmationPolicy: explicit
authorizationSource: current-user-confirmation
mappedFingerprints: [sha256:hex]
backlogSource: cr-todo-backlog.md
backlogSourceHash: sha256:hex
result: COMPLETED
```

`result` 值域为 `COMPLETED | HALTED`。变更/收口操作没有 deferred candidate 时结果可以是 `COMPLETED` 且 `mappedFingerprints: []`；只读 `list`/`check` 默认不写 result，如用户要求留档亦记 `COMPLETED`；均不得据此改变 evaluation verdict。

### Finalizer Report（Finalizer 报告）

CR06 在 `{crDir}` 已成功解析后，必须在任何 `DONE` 或 `HALTED` 退出前写入 canonical finalizer report。若 runtime/identity 失败导致 `{crDir}` 无法确定，只能返回明确的 non-durable HALT，不得伪造 report path：

```yaml
schemaVersion: speclite.cr-finalizer.v2
artifactType: cr-finalizer
storyId: 8-4
storyKey: 8-4-example
reviewSeries: main
round: 1
generatedAt: 2026-08-25T12:50:00+08:00
modelUsed: OpenAI GPT-5.5
evaluationSource: evaluation-filename
evaluationSourceHash: sha256:hex
evaluationVerdict: PASS
rulesExtractionSource: rules-extraction-filename
rulesExtractionSourceHash: sha256:hex
todoResultSource: todo-result-filename
todoResultSourceHash: sha256:hex
scopeHash: sha256:hex
completionGateSource: gate-filename
completionGateResult: PASS
completionGateGeneratedAt: 2026-08-25T12:48:00+08:00
completionGateSourceHash: sha256:hex
trackerWrites: [story, sprint, workflow]
trackerChangeSet:
  - path: tracker-path
    key: exact-key
    beforeHash: sha256:hex
    afterHash: sha256:hex
    rereadConsistent: true
trackerRereadConsistent: true
result: DONE
```

`result` 值域为 `DONE | HALTED`。发生 partial write 时必须为 `HALTED`，正文记录已写、未写和恢复动作，不得把部分成功表述为 done。

## Hash Canonicalization（Hash 规范化）

所有 `*Hash`（`scopeHash`、`findingSetHash`、`eligibleFindingSetHash`、finding `fingerprint`、`reviewSourceHash`、`evaluationSourceHash`、`backlogSourceHash`、tracker change hash 等）必须按统一算法计算，确保不同 fresh agent 对相同输入得到逐字节相同结果：

- 文本统一 Unicode NFC、换行归一为 LF、去除文件尾部多余空白；
- 文件与路径清单按 POSIX 相对路径的 byte-wise 升序排序；
- 结构化输入序列化为 UTF-8 JSON，对象 key 按 Unicode code point 升序，无多余空白，`null` 显式写出；
- 文件内容以 UTF-8 字节纳入，二进制文件以原始字节纳入；
- 最终对规范化字节序列计算 SHA-256，写为 `sha256:<hex 小写>`。

任一 `*Hash` 的语义与此算法冲突时以本节为准。

## Finding Identity（Finding 身份）

每条非 dismiss finding 必须包含：

- `findingId`：本轮展示 ID。
- `fingerprint`：对 `category + invariant + concreteFailureScenario + primaryLocation` 的规范化文本计算 SHA-256。
- `category`：稳定类别，例如 `authority`、`ownership`、`lifecycle`、`concurrency`、`totality`、`security`、`ac-gap`。
- `invariant`：被违反的单一不变量。
- `concreteFailureScenario`：具体输入或状态 → 实际错误结果；无法给出时不得作为 blocking finding。
- `disposition`：`new | recurred | resolved | superseded | deferred | dismissed`。
- `supersedes` 或 `supersededBy`：跨轮或 Correct Course 时的关联。

措辞变化但 fingerprint seed 等价时必须判为 `recurred`，不得计为新 P1。

## Layer Quorum（审查层 Quorum）

- 完整 PASS 建议需要 `blind + edge + auditor` 三层全部成功。
- Acceptance Auditor 缺失时不能声明 AC coverage complete。
- 仅两层成功时可以输出 findings，但 verdict 必须为 `REVIEW_DEGRADED`，除非同轮补跑失败层成功。
- 一层或零层成功时 HALT，不得降级为可收口的单模型 PASS。
- 降级状态、错误和补跑结果必须写入 frontmatter。

## Round Binding（轮次绑定）

- reviewer round = 当前 `reviewSeries` 中最大已有 round + 1，不得使用文件数量。
- evaluator round 必须等于被评估 review round，不得独立递增。
- `reviewSourceHash` 必须匹配 review 文件当前内容。
- 同一 `reviewSourceHash` 只能有一个 current evaluation；重复执行应幂等返回已有文件，或创建明确标记为 `superseded` 的替代评估。
- fixer 只能消费 current evaluation，且 current `scopeHash` 必须与 evaluation 匹配。

## State Machine（状态机）

```text
REVIEW -> EVALUATE
PASS -> RULES -> TODO(mode=closeout) -> FINALIZE
PASS_WITH_DEFERRED_TODOS -> RULES -> TODO(mode=closeout) -> FINALIZE
FIX_REQUIRED -> FIX(mode=patch) -> FRESH REVIEW
VERIFY_REQUIRED -> FIX(mode=verify-only) -> VERIFY -> FRESH REVIEW
ARCHITECTURE_TRIAGE | STOP_LOSS | DECISION_NEEDED -> HALT + USER DECISION
REVIEW_DEGRADED -> RETRY FAILED LAYER OR HALT
```

Finalizer 只能消费 `PASS` 或已完成 TODO 登记的 `PASS_WITH_DEFERRED_TODOS`。

## Convergence（收敛）

默认阈值：

- `maxRounds: 5`
- `stopLossConsecutiveRounds: 3`
- `churnWatch: true`

每轮按 fingerprint 机械计算 `newBlocking`、`recurredBlocking`、`resolvedBlocking`。出现以下任一条件即终止 fixer 循环：

- round 达 `maxRounds`；
- 连续 `stopLossConsecutiveRounds` 轮存在 `newBlocking > 0`；
- 同一 fingerprint 连续修复后仍复现，或同一函数反复修改且阻塞数不下降；
- architecture category 包含 authority、ownership、lifecycle 或 cross-component-concurrency，且无法通过单一局部 patch 关闭。

## Completion Freshness（完成证据时效）

完成门禁的**生成方**是 runner Step 10.3 或人工编排中等价的 `speclite-flow-gate mode=story-completion` 调用；finalizer（CR06）只验证不生成。runner/人工编排必须在调用 CR06 之前产出 current gate。

Finalizer 必须同时验证：

1. evaluation `verdict` 合法且精确匹配当前 Story、series、round。
2. 当前 scope hash 等于 evaluation `scopeHash`。
3. completion gate 为 v2，target/storyKey 匹配，result 为 `PASS` 或 `PASS_EQUIVALENT`。
4. completion gate `generatedAt` 不早于 evaluation 或 fixRecord 的 `sourceMutationAt`。
5. 最后一次修复或 verify-only 后已经完成 fresh reviewer/evaluator。
6. required tracker 存在；Story、sprint tracker 和项目配置声明的 workflow tracker 通过 fail-closed coordinated write（写前/写后 hash + 失败逆序回退）同步并在写后重读一致。
7. current CR04 `speclite.cr-rules-extraction.v2` 与 CR05 `speclite.cr-todo-result.v2` 报告存在，且二者 `evaluationSourceHash` 与本次 evaluation 一致，禁止 standalone 跳过 RULES/TODO 直接 finalize。

任一条件失败必须 HALT。缺失 required tracker 不得警告后继续。

## TODO and Rules Governance（TODO 与规则治理）

- CR P0/P1 始终表示当前交付阻塞。
- TODO backlog 使用 `T1/T2/T3` urgency，禁止复用 P1/P2/P3。
- `T1` 表示下次触及前必须处理，但仍是当前非阻塞项。
- runner 或人工 orchestrator 必须向 TODO tracker 传入 `confirmationPolicy: explicit | preauthorized`；Skill 不得自行选择。
- rules extractor 只消费 evaluator accepted、非 `dismissed/superseded` 且有验证证据的 finding。
- 提升为全局规则至少满足：跨两个 Story 复现，或用户明确批准当前 Story 特例提升；否则只输出候选建议。
