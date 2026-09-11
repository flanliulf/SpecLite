---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 2
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T20:44:18.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `6` 项 P1、`0` 项 P2。均属于 Story 11.9 已冻结的 containment、identity/authenticity、single propagation、zero-mutation、installed parity 与 classified candidate scan 边界；不涉及 Story 11.10、external drawer、report basename、CR algorithm、round/approval policy、build、full suite 或 packaging。

## P1 Findings（P1 发现）

### P1-1 — Canonical-only 的 malformed/unbound current evidence 被静默放行

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:102-147`、`:253-284`
- **Trigger condition**：canonical `11-9-code-review/` 已存在，且含 canonical-family basename 但 frontmatter malformed、story/series/round unbound 或 `disposition` 非 current。
- **Unhandled path**：`inspectCandidate` 将该目录标为 `no-current-series-evidence`，但上层 `invalidLegacy` 只过滤 legacy candidates；canonical candidate 的 invalid evidence 不参与任何 failure branch，最终固定返回 `ok=true, compatibilityMode=canonical`。同样的证据放在 legacy 会 fail-close，放在 canonical 却被当作可继续状态。
- **Consequence**：runner 可在无法唯一绑定 current series/round 的 canonical run 上继续写入，覆盖/拆分真实 current state，违反 shared contract 恢复矩阵的 candidate-evidence fail-close 条款。
- **Guard sketch**：区分 canonical empty/new 与 canonical invalid-current-evidence；任一匹配 current-series canonical family 但身份无效的 artifact 都返回 stable block，只有真正无相关 artifact 的 empty canonical 才可继续。

### P1-2 — DONE authenticity 只检查字符串形状，不验证绑定文件与 hash

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:273-287`、`:356-367`；`test/code-review-contract.test.ts:506-543`、`:1140-1161`
- **Trigger condition**：legacy 目录只有一份 finalizer，引用并不存在的 review/evaluation/CR04/CR05/completion-gate filenames，并填入任意 64 位小写 hex。
- **Unhandled path**：`validDoneFinalizer` 仅以 regex 验证 basename 和 `sha256:` 字面格式，从未 no-follow 定位 referenced files、验证它们均在同一 candidate、核对 bytes hash、current disposition、story/series/round 或 completion-gate target。GREEN fixture `currentFinalizerArtifact` 也刻意不创建任何 predecessor，却把 legacy 判为 completed。
- **Consequence**：截断、伪造或陈旧 finalizer 可把 unfinished legacy 错判为 completed，resolver 随后切到 canonical 开新 run并拆轮。
- **Guard sketch**：DONE 仅在全部 required predecessor/gate 作为同一目录/规定 gate root中的 regular current files存在、identity一致且 canonicalized content hash逐一相符时成立；否则 stable block，不得降格为 completed。

### P1-3 — Frozen context 的 leaf fail-close 仍只有 prose，没有可执行 consumer oracle

- **Location**：`test/code-review-contract.test.ts:771-797`、`:913-927`；六个 `speclite-code-review-0{1..6}-*/references/*workflow.md:7-10`
- **Trigger condition**：任一 CR01–06 consumer 收到缺失、重排、额外、mismatched `crDir/canonicalCrDir/compatibilityMode/legacyArtifactPaths`，或 title-bearing local fallback 与冻结值同时出现。
- **Unhandled path**：测试只断言 workflow 含若干中文片段与 runner invocation 文本；没有执行任何 leaf context validator，也没有证明 mismatch 分支在 artifact/source/backlog/tracker write callback 前不可达。installed test重复相同 substring assertion，并未重放 evaluator 授权要求的 mismatch-before-write behavior。
- **Consequence**：文档字符串保持不变时，真实 leaf 或后续 executable wrapper 仍可忽略/重算冻结 context，focused suite继续假绿，破坏 AC4/AC5。
- **Guard sketch**：提供共享的 test-only 或 executable consumer preflight oracle；逐 leaf 对四字段缺失、值不等、mode/path/set 不相容与 story/series mismatch 注入 mutation callback，断言 callback 为零且返回稳定 HALT。

### P1-4 — “every blocked preflight” 实际只测一个 synthetic unbound case

- **Location**：`test/code-review-contract.test.ts:711-738`、`:1012-1019`
- **Trigger condition**：dual canonical+legacy、multi-legacy、ancestor symlink/non-directory、candidate symlink/non-directory、artifact I/O、malformed evidence 等其他 resolver failure发生。
- **Unhandled path**：标题声称覆盖 every blocked preflight，但测试只布置一个含 `unbound.md` 的 legacy目录；`runResolverPreflight` 是测试内新写的 `if (outcome.ok) mutation()`，本身直接编码预期结论，既不消费 runner实现，也没有对 Round 1 evaluator列出的全部 blocked classes执行 Story/tracker/goal/temp/progress exact snapshot。
- **Consequence**：runner ordering或某一 failure class的 mutation边界回归时仍无可重放证据，completion gate会继续把单案例 synthetic helper误表述为 runner-wide zero mutation closure。
- **Guard sketch**：用同一 runner preflight adapter参数化全部 stable failure reasons；每例均对完整受控 tree做 path/type/bytes/hash snapshot并断言真实 mutation callback零调用。

### P1-5 — Installed parity 遗漏 runner 与 CR01–06 的 entrypoints

- **Location**：`test/code-review-contract.test.ts:876-927`
- **Trigger condition**：fresh install 的任一 `SKILL.md` / `SKILL.en.md` 仍为旧版、遗漏 runtime activation/contract handoff，而 resolver与workflow files恰好为新版。
- **Unhandled path**：`parityPaths` 只列 shared contract reference、resolver script、runner workflow和六个leaf workflows；没有比较 runner/contract/CR01–06 的 `SKILL.md` 与 `SKILL.en.md`。Round 1 evaluator明确要求 changed entrypoints/workflows 双 IDE deterministic parity，当前实现只关闭了一半。
- **Consequence**：canonical source和内部 workflow测试均绿时，最终用户安装入口仍可能不加载新workflow、使用旧参数契约或按title重新推导。
- **Guard sketch**：把 shared contract、runner、CR01–06 的中英文 entrypoints加入 `.agents/.claude` byte parity清单，并从installed entrypoint验证它实际引用同一changed workflow/contract。

### P1-6 — Candidate scanner 仍可被 shell/JS 分段拼接与未知 title token 绕过

- **Location**：`test/code-review-contract.test.ts:1029-1072`、`:1106-1122`
- **Trigger condition**：active producer新增 `storyId + "-" + storySlug + "-code-review"`、模板分段、alternate placeholder或其他非连续 title-bearing expression。
- **Unhandled path**：scanner虽遍历frozen roots，却只对UTF-8解码文本运行三个连续-token regex；Round 1 evaluator指定的 shell/JS concatenation 并未被识别。fail-close test仅覆盖 duplicate path、symlink与non-file，从未注入一个未分类或不同拼接形式并证明scanner失败；因此 ledger exact equality只约束regex已经看见的9个fixture match。
- **Consequence**：新的 active title-bearing `$cr_dir` producer可完全不进入ledger，`active-canonical`仍为零且candidate scan错误通过，违反 AC7/AC10/AC11。
- **Guard sketch**：冻结并测试能覆盖分段变量/字符串拼接、alternate placeholder与concrete title path的token normalization；向临时candidate注入每个family并断言未分类match稳定失败，再与ledger做双向exact equality。

## P2 Findings（P2 发现）

无。

## Exclusions（明确排除）

- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 及 zip。
- 未运行 `npm run build`、full suite、packaging 或 canonical governance。
- 未建议变更 report basenames、CR algorithms、round numbering、approval/confirmation policy、public CLI 或 dependencies。

