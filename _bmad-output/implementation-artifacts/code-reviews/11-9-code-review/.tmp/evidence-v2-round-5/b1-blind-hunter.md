# Blind Hunter（盲审）

- model: `OpenAI GPT-5.6 Sol (high)`
- input: `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/.tmp/evidence-v2-round-5/review-input.diff`
- input_raw_sha256: `60e13525492c23c683269b0740f5984eb6f0422d4a9ce10742a34e8a4846cf5d`
- result: `1 blocking finding`

## Findings（发现）

### B1 — 引号形式的同名 YAML key 可绕过 required tracker duplicate 检查

- severity: `blocking`
- category: `authority`
- invariant: required sprint/workflow tracker 中，caller-frozen key 必须只有一个语义实例且该实例精确等于 `expectedTerminalState`；任何 duplicate 或非终态实例都必须在认证历史 `DONE` 前阻断。
- concrete_failure_scenario: workflow tracker 的受控内容为 `implementation: done` 后紧跟 `"implementation": in-progress`，并且 finalizer 的 `trackerChangeSet.afterHash` 与该完整文件一致。`trackerLinesOutsideYamlBlockScalars()` 不会把第二行判为 ambiguity，但 `candidatePattern` 只匹配未引号的 literal key，因此 `matches.length === 1` 且读取到 `done`；`validTrackerChangeSet()` 随后接受 tracker，`validDoneFinalizer()` 可把 legacy round 判为真实 `DONE`，resolver 最终返回 canonical new-run 目录。实际 YAML 中同一语义 key 已 duplicate，且后一个值为 `in-progress`，因此本应 fail-close 的 tracker authority 被绕过。
- primary_location: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:1054`
- evidence: diff 中 `trackerHasExactTerminalState()` 在第 1058 行构造的 regex 以未引号 `keyExpression` 开头，第 1059–1061 行仅对该 regex 的命中计数，第 1062 行只要求恰一条；同一 diff 的 YAML scanner 会保留合法 quoted mapping-key 行，却没有将 quoted/unquoted 的同名 key 归一化后做 semantic duplicate 检查。故上述两行输入稳定地产生“实际 ambiguous/non-terminal → 错误认证为 terminal”的结果。
