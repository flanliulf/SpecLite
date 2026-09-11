---
Story: 11-9
Round: 1
Date: 2026-09-05
Model Used: GPT-5.6
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无 timeout、empty output 或降级），三层均为 **FAIL**。Aggregator 按 `bmad-code-review` 对三份 layer report 做 best-effort normalization，并独立核对 Story 11.9、shared CR contract、executable resolver、runner、CR01–06 Directory Preflight、focused tests 与 current completion gate。

三层共提出 `14` 条原始 finding；按 root cause 合并后为 **8 个 P1**、**0 个 P2**、**0 个 decision-needed**、**0 个 defer**、**0 个 dismissed**，**Owner Gate: NONE**。重复项仅做来源合并，不计为 dismissed。当前 numeric-only normal path、canonical basename、legacy no-migration、基本 dual/multi block 与 resolver install probe 已落地，但 recovery evidence、filesystem containment、frozen handoff 与全链 evidence closure 仍存在 Story-owned hard gaps。

总体结论为 **FAIL**。本结果构成 latest Reviewer Round 1 正式 findings；必须由 fresh Evaluator 独立裁决后，才可授权 bounded Fixer。当前 completion gate 的外部 drawer `PASS_EQUIVALENT` 隔离理由本身可接受，但不能豁免以下八项 Story 11.9 阻塞项，也不得用于 CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 5 P1 / 0 P2 | 五项均接受并与其他层重复项合并。 |
| Edge Case Hunter | PASS | `FAIL` / 7 P1 / 0 P2 | 七项均接受；其中 symlink、legacy evidence、finalizer 与 scan 分别并入共享 root cause。 |
| Acceptance Auditor | PASS | `FAIL` / 2 P1 / 0 P2 | 两项均接受；分别并入 symlink containment 与 legacy/finalizer authenticity root causes。 |

## Findings（发现）

### P1-1 — Missing `code-reviews/` 时未验证既有 ancestor，canonical write root 可经 symlink 逃逸 project

- **来源**：blind + edge + auditor
- **分类**：patch
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:37-47,151-168`；`test/code-review-contract.test.ts:470-503`
- **证据**：`inspectRoot()` 对目标 `ENOENT` 直接返回 `missing`，调用方随即返回 canonical success；它没有从最近存在 ancestor 开始执行 no-follow/type/realpath containment。若 `implementationArtifacts` 或中间父级是指向 project 外的 symlink，而 `code-reviews/` 尚未存在，返回的 project-relative `crDir` 在后续创建时实际写到 project 外。当前 test 预先创建普通实目录，只覆盖 title traversal，不覆盖 missing leaf + symlink ancestor。
- **影响**：runner 会把一个未验证且可越界的 `crDir` 冻结并传播给全部 CR artifacts、`.tmp/` 与 goal records，违反 AC1/AC11 和 shared contract 的 project containment / unsafe fail-close。
- **修复义务**：对 missing target 逐段检查既有 ancestor 的 `lstat`、directory type 与 `realpath` containment；symlink、non-directory、escape 或无效 project root 均返回 stable blocking diagnostic，并补 project 内、project 外及 missing-root 的 zero-write fixtures。

### P1-2 — Legacy candidate 未区分 `UNFINISHED` 与无 current-series 可绑定 evidence

- **来源**：blind + edge + auditor
- **分类**：patch
- **位置**：`resolve-cr-directory.mjs:84-118,170-213`；`test/code-review-contract.test.ts:505-623`
- **证据**：当 legacy 目录为空、只有无关文件、只有其他 series，或 requested series evidence malformed/unbound 时，`maxRound=null`、`completed=false`；外层把所有 `!completed` 都计入 `unfinishedLegacy`。单一候选因此被静默选为 `legacy-resume`，现有 ambiguity fixture 甚至用无结构的 `round-evidence.md` 代表 unfinished 状态。
- **影响**：新 run 可写入无法证明属于 current `storyId + reviewSeries + round` 的 title-bearing legacy 目录；恢复目标依赖猜测，违反 AC1/AC9/AC11 以及“evidence 无法唯一绑定必须 block-before-write”。
- **修复义务**：将候选状态显式分为 `completed | unfinished | no-current-series-evidence | unsafe`；仅唯一且身份、series、round 合法的 requested-series unfinished round 可原位恢复，空/无关/other-series/malformed/unbound evidence 必须 stable block，并补正反与 zero-mutation fixtures。

### P1-3 — Latest round 与 `DONE` 可由任意 basename、错绑 frontmatter 或正文伪字段伪造

- **来源**：blind + edge + auditor
- **分类**：patch
- **位置**：`resolve-cr-directory.mjs:182-204`；`test/code-review-contract.test.ts:505-571`
- **证据**：`maxRound` 接受任意以 `-{reviewSeries}-round-N.md` 结尾的 regular file，不限定 shared contract 的 canonical artifact families，也不拒绝非 safe integer。Finalizer 只要求 filename 含 `-cr-finalizer-`，并在文件任意位置分别匹配 `schemaVersion` 与 `result: DONE`；没有验证合法 frontmatter boundary、`storyId`、`reviewSeries`、frontmatter `round`、filename round、canonical basename、current disposition 与 required source bindings。
- **影响**：错误 Story/series/round、正文示例或不完整 finalizer 可把真实 unfinished legacy round 误判 completed，resolver 随后启动 canonical sibling，拆分同一 run，直接违反 AC8/AC9/AC11。
- **修复义务**：仅从合同列举的 canonical current artifact basename 解析 round；严格解析并验证 v2 frontmatter identity、series、round、disposition 与 finalizer `DONE` required bindings。任何冲突、超界或伪造 evidence 必须进入 stable ambiguity block；补 wrong-story、wrong-series、wrong-round、body-only、malformed、superseded 与 oversized-round fixtures。

### P1-4 — Runner 未把冻结的完整 resolver context 传给 CR01–06

- **来源**：blind
- **分类**：patch
- **位置**：`speclite-code-review-contract/references/cr-contract.md:61-65`；`speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md:17,72,76,98,104-107`；各 CR01–06 workflow `Directory Preflight`；`test/code-review-contract.test.ts:625-645`
- **证据**：shared contract 与六个 leaf workflow 要求 runner mode 同时消费冻结的 `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`，并禁止 leaf 重跑 resolver。但 runner 的 CR01–06 invocation 仅传 `crDir={crDir}`；test 也只断言这一个参数。leaf 因而无法验证传入 path 与 orchestrator resolver result 的完整一致性，legacy-resume 尤其缺少可核验上下文。
- **影响**：single resolution 退化为不可验证的单字符串 handoff，AC4/AC5/AC7 的 frozen-context propagation 没有端到端闭环。
- **修复义务**：定义并向 CR01–06 传递完整 immutable resolver context（四字段或稳定绑定对象/hash），leaf 验证其与 `storyId/reviewSeries` 一致；补六个 invocation 的完整传播与 mismatch fail-close assertions。

### P1-5 — Filesystem inspection I/O failure 未转换为 stable、redacted、single-JSON diagnostic

- **来源**：edge
- **分类**：patch
- **位置**：`resolve-cr-directory.mjs:60-68,182-204,239-243`
- **证据**：root/candidate `readdir()` 以及候选 artifact read 的非 `ENOENT`/并发异常没有统一结构化分类，CLI 也没有顶层 catch。部分 read failure 被静默折叠为空内容，其他异常会直接抛出并输出 raw absolute path/stack；stdout 不再保证恰一个 JSON。
- **影响**：caller 虽可能因 non-zero 停止，却失去合同要求的 stable reason、project-relative evidence、redaction 与可恢复 machine identity，且不同 I/O 点表现不一致。
- **修复义务**：对 root listing、candidate listing、artifact stat/read 和并发消失统一捕获并分类；所有 unsafe inspection 都返回 `cr-directory.ambiguous-resume-root` 的稳定、去敏 details，CLI 顶层保证 single JSON、无 raw error/path/stack，并补 permission/I/O/disappearing-entry probes。

### P1-6 — Ambiguity 的 zero-mutation evidence 未覆盖 runner progress、Story 与 trackers

- **来源**：edge
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:573-623,754-758`；`runner-workflow.md:13-20,41-51`
- **证据**：当前测试仅直接调用 read-only resolver，并 snapshot `code-reviews` root；没有验证 outer runner 在 dual/multi/unsafe failure 时，goal records、`.tmp/`、Story、sprint tracker、workflow tracker 与 progress state 均未先行 mutation。runner prose 的 Step 0 顺序是正向证据，但当前 oracle 没有把 stop-before-all-writes 变为可重放断言；文件末尾也明确把 runner state-machine 真行为留为独立 todo。
- **影响**：completion gate 所述“progress mutation 测试为零变化”高于 current test evidence；真实 orchestrated failure 若顺序回归，仍可留下半写 tracker/progress state，违反 shared contract 第 65–87 行与 Story 技术约束。
- **修复义务**：在不扩大 CR algorithm 的前提下增加最小 executable preflight/order harness 或等价可重放 oracle，对 dual/multi/unsafe cases snapshot 所有 mutation surfaces，断言 failure 后 exact zero delta；不得用 resolver-only directory snapshot冒充 runner-wide closure。

### P1-7 — Fresh-install 只核对 resolver，未核对 installed runner、contract 与 CR01–06 的同一 context 消费

- **来源**：edge
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:625-645,699-752`
- **证据**：canonical single-propagation test 只读取 source corpus；fresh-install test 只比较 resolver bytes/mode 并运行 resolver CLI probe，没有读取 `.agents` / `.claude` 中 installed shared contract、runner、CR01–06 entrypoints/workflows，也没有在 installed corpus 重放 once-only resolution 和完整 context propagation assertions。
- **影响**：source tests 与 resolver install probe 可同时为绿，而实际安装包仍保留旧 runner/leaf consumer 或缺少冻结 context，违反 AC4/AC5/AC7 的 installed runtime truth。
- **修复义务**：对两个 IDE target 的 shared contract、runner、CR01–06 changed entrypoints/workflows 做 deterministic source-installed parity，并在 installed corpus 重放 once-only resolver、完整 frozen context 与 no-title-rederive assertions。

### P1-8 — Active title-bearing negative scan 不是 frozen full classified corpus scan

- **来源**：blind + edge
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:647-697`
- **证据**：`activeFiles` 是手工 Markdown 子集，未递归覆盖 Story 冻结的 scripts、hooks、templates、fixtures、help、metadata/contracts、release/current docs；两条 regex 只识别少量相邻 placeholder，漏掉 shell/JS 拼接、其他 placeholder spelling、config expression 与 concrete title-bearing producer。public-doc test 仅要求至少出现一个 canonical token，不能拒绝同文件并存旧 active pattern。
- **影响**：当前人工广扫未发现已知 active residual，但该结果没有被 deterministic oracle 固化；遗漏 surface 可重新引入第二套 title-bearing root 而 focused suite 仍 false-green，AC7/AC10/AC11 的全量 negative closure 不成立。
- **修复义务**：建立 no-follow deterministic inventory，冻结 roots/extensions/exclusions/token families，输出逐 match `{path,line,token,role}` ledger；actual matches 与 classified ledger 双向 exact equality，active role 必须为零，legacy fixture/compatibility docs 只能按 exact role allowlist 保留。

## Deduplication And Parsing（去重与解析）

- `P1-1` 合并 Blind #1、Edge #3、Acceptance #1。
- `P1-2` 合并 Blind #2、Edge #1 与 Acceptance #2 的 no/unbound current-series evidence 部分。
- `P1-3` 合并 Blind #3、Edge #2 与 Acceptance #2 的 finalizer authenticity / round binding 部分。
- `P1-4` 接受 Blind #4；与 resolver evidence authenticity 相关，但 root cause 是跨 leaf handoff 缺字段，故不并入 `P1-2/P1-3`。
- `P1-5` 接受 Edge #4；是 I/O failure machine contract，不与 evidence 内容校验合并。
- `P1-6` 接受 Edge #5；是 runner-wide mutation ordering evidence，不与 resolver 本体 read-only 合并。
- `P1-7` 接受 Edge #6；是 installed consumer parity，不与 source propagation 合并。
- `P1-8` 合并 Blind #5、Edge #7。
- Edge layer 使用结构化 Markdown 而非 Skill 期望的 JSON array；其 location、trigger、consequence 与 guard 字段完整，best-effort normalization 无信息损失。Blind 与 Acceptance 均可直接解析。
- Valid layers=`3/3`；failed layers=`0`；duplicates merged=`6`；dismissed=`0`。

## Acceptance Criteria Impact（验收标准影响）

| AC | Result | Blocking findings |
| --- | --- | --- |
| AC1–AC3 | FAIL | `P1-1`、`P1-2` 使返回的唯一 canonical/resume root 仍可能越界或基于未绑定 evidence。 |
| AC4–AC7 | FAIL | `P1-4`、`P1-7` 使 source 到 installed CR01–06 的 frozen context propagation 未闭环。 |
| AC8–AC9 | FAIL | `P1-2`、`P1-3` 仍可误恢复或误开启 canonical sibling，破坏 no-migration/single-run semantics。 |
| AC10 | FAIL | `P1-8` 的 negative scan 无法证明全部 active surface 为零。 |
| AC11 | FAIL | `P1-1`–`P1-3`、`P1-5`–`P1-8` 缺少关键反例与全链 evidence。 |
| AC12 | PASS | 本轮未发现 report basename、CR algorithm、round numbering 或 approval rules 被改变。 |

## Verification And Boundary（核证与边界）

- 独立读取并核对 current resolver、shared contract、runner、CR01–06 Directory Preflight、focused test body、Story 与 completion gate。
- 接受三层只读临时探针所报告的 ancestor symlink、empty/other-series legacy、mismatched/body-only finalizer 复现；本 Aggregator 以当前代码路径再次核对其可达性，未复跑 build、full suite、packaging 或 canonical governance。
- Focused `24 passed / 4 todo` 证明现有 happy paths，但不能否定八项未覆盖或合同不一致路径。
- External drawer 仍仅是 fixed-count caveat；没有将其、zip、workspace mirrors、Story 11.10 或其他 Epic 11 accumulated changes归入 Story 11.9 finding。
- 本 Aggregator 只创建本 summary；未修改 source、tests、fixtures、Story、tracker、completion gate、goal records 或既有 CR artifacts。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 八项都由 Story 11.9、kickoff frozen decisions 与 shared CR contract 唯一确定：project-contained numeric root、合法 current-series evidence、authentic finalizer、完整 frozen resolver context、stable redacted I/O failure、stop-before-all-writes、installed consumer parity 与 full classified active scan。无需新增产品、Architecture 或范围裁决。

## Final Verdict（最终裁决）

**FAIL — 8 P1、0 P2、Owner Gate NONE；valid layers 3/3。**

下一步进入 fresh Evaluator Round 1。Evaluator 必须逐项独立确认或驳回，并给出 bounded Fixer authorization；在 Evaluator 正式裁决前不得修改源码，也不得进入 CR04、CR05 或 CR06。
