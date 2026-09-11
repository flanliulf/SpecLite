# Blind Hunter Findings（盲审发现）

## Provenance（来源）

- Fresh agent: `/root/epic11_9_r2_blind_capacity3`
- Model: OpenAI GPT-5.6 Sol (high)
- completedAt: `2026-09-07T10:02:42Z`
- diffSha256: `8218ebd79e971467e66d7ac18732f32d2c17a097047532e08d6040743e968b50`
- 已完整读至 EOF，仅指定 Skill 与冻结 diff；无 writes/tests/build/agents。
- 以下为该独立层返回的候选发现中文忠实转录；其 blocking 建议不是 Evaluator 已裁决 P1。未补充主线程新发现。

## BH-R2-01（延期 TODO backlog 未认证）

- severity suggestion: blocking
- category: provenance
- invariant: `PASS_WITH_DEFERRED_TODOS` 只有在每个 mapped fingerprint 均持久存在于实际 backlog，且其内容匹配 `backlogSourceHash` 时，才能成为 `DONE`。
- concrete_failure_scenario: evaluation 含一个 deferred fingerprint；CR05 把它列在 `mappedFingerprints` 并提供任意语法合法的 64-hex `backlogSourceHash`，但 `cr-rules/cr-todo-backlog.md` 不存在或不含该项。resolver 仍验证 TODO report 并可将 legacy round 判定为 DONE，丢失延期义务。
- primary_location: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs::validDoneFinalizer` / `validPredecessorSchema("cr-todo-result")`
- 第一手 diff evidence: `validPredecessorSchema` 只核对 `backlogSource === "cr-todo-backlog.md"` 和 hash 语法，没有读取或计算 backlog hash。新增 accepted-graph fixture 使用固定 `sha256:888...`，未创建 backlog，但期望 `{ok:true, compatibilityMode:"canonical"}`。

## BH-R2-02（无效 YAML tracker 可授权完成）

- severity suggestion: blocking
- category: authority
- invariant: sprint/workflow tracker 在其中终态 scalar 授权 DONE 前，必须是结构有效的 YAML。
- concrete_failure_scenario: tracker 内容为 `]\nimplementation: done\n`，finalizer `afterHash` 同步为这些内容。首行 `]` 使 YAML 无效，但 scanner 把它当作普通可见行；exact terminal scanner 找到唯一 `implementation: done`，tracker authentication 通过。
- primary_location: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs::trackerLinesOutsideYamlBlockScalars`
- 第一手 diff evidence: scanner 只跟踪部分 block/quote/flow 状态，否则执行 `visible.push(line)`；terminal matching 前没有 whole-document YAML parse 或 unmatched-closing-token rejection。

## BH-R2-03（空格形式重复 authority key 绕过唯一性）

- severity suggestion: blocking
- category: authority
- invariant: 每个 authoritative frontmatter key，尤其 finalizer `result`，必须在 YAML grammar 下语义唯一。
- concrete_failure_scenario: 完整合法 finalizer 已有 `result: DONE`，再加入 `result : HALTED`。YAML 将两者解释为同一 key，必须 fail-close；parser 忽略带空格形式，保留 DONE，finalizer 可通过。
- primary_location: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs::parseLeadingFrontmatter`
- 第一手 diff evidence: parser 只识别 `^([A-Za-z][A-Za-z0-9]*):...$`，不匹配行静默跳过。新增测试拒绝 quoted duplicate result 与 spaced fixRecord，但 general authority key 没有同样的 semantic duplicate guard。

## BH-R2-04（Reviewer finding 与 Evaluator disposition 无完整核对）

- severity suggestion: blocking
- category: completeness
- invariant: evaluator PASS 授权 DONE 前，每个 reviewer finding 必须有且只有一个 evaluator disposition。
- concrete_failure_scenario: review=`FINDINGS_REPORTED`、`findingCounts.patch: 2`；evaluation=`PASS`、`acceptedCounts.dismissed: 1`，其余 blocking/deferred/verify count 为零，没有第二项 disposition。递归重绑 hashes 后，resolver 可接受两种 schema 并判完成，虽然一个 patch finding 消失。
- primary_location: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs::validDoneFinalizer` / `validPredecessorSchema`
- 第一手 diff evidence: review/evaluation 有 hash binding，但没有 `findingCounts` 与 `acceptedCounts` 的 equality/reconciliation，也没有解析一一 fingerprint disposition。新增测试改变 review 为 FINDINGS_REPORTED 后允许 evaluator PASS 拥有 completion authority，表明依赖 evaluator declaration。
