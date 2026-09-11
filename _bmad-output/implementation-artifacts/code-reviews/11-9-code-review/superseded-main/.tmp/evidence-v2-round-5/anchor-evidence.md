# Round 5 Anchor Evidence（第五轮锚点证据）

- frozen diff raw SHA-256：`60e13525492c23c683269b0740f5984eb6f0422d4a9ce10742a34e8a4846cf5d`；`41/41` declared headers，重建后的 41 个文件逐字节等于 current workspace；路径：`.tmp/evidence-v2-round-5/review-input.diff`。
- runtime config：本轮独立执行 `node dist/bin/speclite.js resolve config --project-root /Users/fancyliu/Repos/SpecLite`，exit 0；directory resolver 未重跑且禁止下游重跑。
- frozen directory evidence：`ok=true`、`issue=null`、`crDir=canonicalCrDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`。
- base/head：`ff7528d3f9ec34072bb669ee79f7569345c23d47` / `ff7528d3f9ec34072bb669ee79f7569345c23d47`；当前 physical actual=642、declared=41、excluded=601、scopeExceptions=0。
- scopeHash：`sha256:5100d046395d281a6bfce4aa7a55a3d36edd9b10995e5d1b811b3e533b287c19`；content digests 只绑定 41 个 declared 当前完整内容，excluded mutable workflow outputs 仅绑定 path，避免自引用。
- R4 current review canonical SHA-256：`sha256:89fcdab79e86493a2d9cbf60ae992c45865824ed5f5035959d9b434dea28b634`。
- R4 current evaluation canonical SHA-256：`sha256:6227dfe46266657df0000b822976a402bfb5a937bb510f5fc090811d97512189`；`fixRecord.status=completed`、`sourceMutationAt=2026-09-08T03:15:11Z`。
- R4 accepted P1：`sha256:13ca7c2e80fa880328288c79731adb48aa04f1ffdacdb94ebb93e7886dccafaa`，本轮只作为待 fresh 核验的 terminal-state grammar totality 历史输入，不能预定 resolved。
- R4 Fixer 历史证据（非本轮执行）：resolver/test raw hashes 为 `bead9645ba0be21d542e1b1891b88e52b81f9bdd4ae27bdcbfe30251a17db409` / `397b122fb52c85a4c6fc46da5a8e6f65642bd08f36c42711f6ded0212263d462`；canonical hashes 为 `9808caa6094dff231dec606c91fe29f40016b174fbfa2d0c75a1141ccadfc417` / `52625c33884f44163e97df15a7a6e4cf25cd61bb07adccf7b3b590b7a8afcbb4`；`108 passed / 4 todo` 是 Fixer 证据，不冒称本轮执行。
- 本轮 fresh focused verification：`npx --no-install vitest run test/code-review-contract.test.ts --reporter=dot` PASS，`108 passed / 4 todo / 0 failed`；`node --check` 与 root `git diff --check` PASS。
- 当前 resolver raw/canonical SHA-256：`bead9645ba0be21d542e1b1891b88e52b81f9bdd4ae27bdcbfe30251a17db409` / `9808caa6094dff231dec606c91fe29f40016b174fbfa2d0c75a1141ccadfc417`；focused test raw/canonical SHA-256：`397b122fb52c85a4c6fc46da5a8e6f65642bd08f36c42711f6ded0212263d462` / `52625c33884f44163e97df15a7a6e4cf25cd61bb07adccf7b3b590b7a8afcbb4`。
- shared `release/packaging-manifest.json` 当前 raw/canonical SHA-256：`82bf17e81ce0ce06cab618084f79c817707bf8537146772e3bf2e69bd4a3c976` / `2e58ae0350722346fb05315094c5331231f9a21293490138edca13c79be15979`；相对 R4 canonical `f6304cb3c36f227100460c5099eb569c80fc44c824a536467bb761340b184f15` 仅 `files` / `includedRuntimeAssets` 各新增 external skill-lint 的 `rule-registry.json`、`list_rules.py`、`test_skill_tools.py` 并更新 `packageHash`，完整字节继续纳入 declared hash，但不作为 11.9 实现成果或提交授权。
- External Package Exclusion：`speclite-skill-lint/` 与 `speclite-skill-creator/` 两包及同包增量完整进入 actual/excluded；三层不得修改、回滚或把它们计作 11.9 成果。
- Completion gate：现存 gate 是历史 stale evidence，不是本轮 fresh completion gate；Auditor 必须完成 12/12 AC coverage。
- Round 4 是单次 stop-loss 例外；`maxRounds=5` 仍有效，Reviewer 不预设 Evaluator 裁决。三层禁止 tests/build/packaging/full-suite/writer，只写各自输出。
