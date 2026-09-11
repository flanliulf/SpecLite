# Round 6 Anchor Evidence（第六轮锚点证据）

- frozen diff raw SHA-256：`fd5575c85b07437665085d2650d649f77e2f23ad63eecf9f6a0244cb7012a84e`；`41/41` declared headers，base+diff 重建后的 41 个文件逐字节等于 current workspace；其中 2 个 declared untracked 通过 `git diff --no-index /dev/null` 纳入。
- runtime config：本轮独立执行 `node dist/bin/speclite.js resolve config --project-root /Users/fancyliu/Repos/SpecLite`，exit 0；directory resolver 未重跑且禁止下游重跑。
- frozen directory evidence：`ok=true`、`issue=null`、`crDir=canonicalCrDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`。
- base/head：`ff7528d3f9ec34072bb669ee79f7569345c23d47` / `ff7528d3f9ec34072bb669ee79f7569345c23d47`；current physical actual=660、declared=41、excluded=619、scopeExceptions=0。
- scopeHash：`sha256:e13c712a944d494ba269db8d2b081a627f62d3af9576c026b36c78fdb8c45ed8`；41 个 declared 当前完整内容参与 digest，excluded mutable workflow outputs 只绑定路径以避免自引用。
- R5 current review canonical SHA-256：`sha256:cafb40d7f3cd75e7d4d853c0c6efa6d262f9c7c12a813c0d889b1c763964721c`；其 3/3 仅作历史，不复用为 R6 layer evidence。
- R5 current evaluation raw/canonical SHA-256：`c7136aa15d2de2551b115cb0a16c8dcdc71a6368f27aaa0ffaa75d634310659f` / `sha256:8aa6fbbc28efe31d8215496aacf1f83e3a0173ca8a3e66d4946804358da589f3`；`verdict=FIX_REQUIRED`、completed fixRecord、`sourceMutationAt=2026-09-08T08:13:09.208Z`。
- R5 accepted P1：`sha256:f901eda7efb58650982cf9e821fce188a4e6e64468449e0b2ca04493b79ed7e3`，仅作为待 fresh 核验的 bounded inline-list comment authentication 历史输入，不预定 resolved。
- R5 Fixer 历史证据（非本轮执行）：clean RED `1 failed / 109 passed / 4 todo` → GREEN `110 passed / 4 todo / 0 failed`；Root 另于 16:18:42 执行 focused `110 passed / 4 todo`。本轮 Reviewer 不冒称执行这些历史运行。
- 本轮 CR01 coordinator 实际执行：focused Vitest `110 passed / 4 todo / 0 failed`、resolver `node --check` PASS、scoped `git diff --check` PASS、runtime config resolve PASS、hash/headers/reconstruction/scope validation PASS。
- current source raw/canonical：`0fceb4e0788d99d63ba83d134fcd25a18999f8d5e1fbd6ede9c9b12558aaaf30` / `sha256:788a09297696a9ec2e10a4124687832dc44559be934238f9bd3baee1fbba675f`；test raw/canonical：`fdb534e14c60b5c73ece31ffa73786ebe7ad476dd26c26ef44b14ae8f08ae904` / `sha256:6478756ddcfa78d874df12be057cdb6b2894a253fb7f1302f8a10dacabc6f008`。
- shared `release/packaging-manifest.json` current raw/canonical：`82bf17e81ce0ce06cab618084f79c817707bf8537146772e3bf2e69bd4a3c976` / `sha256:2e58ae0350722346fb05315094c5331231f9a21293490138edca13c79be15979`；外部三路径/arrays/packageHash 增量沿用既有归属说明，不在本轮生成或修改。
- staged binary diff raw SHA-256：`06426fd385ef8a387cfe9aecb0ac0472274c3c0de69ed2fd107ed0d44f17787f`，与冻结值一致。
- External Package Exclusion：`speclite-skill-lint/` 与 `speclite-skill-creator/` 两包及同包增量继续完整进入 actual/excluded；三层不得修改、回滚或归入 Story 11.9 成果。
- Completion gate：`_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md`，result=`"PASS_EQUIVALENT"`，generatedAt=`"2026-09-07T04:45:00.000Z"`，raw/canonical=`7560114371ee86f71fbc33f12e010c140ec2fbe14000668b16b17d9b1745f0da` / `sha256:07353c318a601133dd8328ac9446f2f26048c9ecb8b86b63743421bd0a5dd7b8`；它早于 R5 source mutation，是 stale historical evidence，不是本轮 fresh gate。
- 当前 run maxRounds=6 来自用户对 R5 单次例外的明确批准；shared default=5 且未来例外未授权。Reviewer 只输出收敛输入，不预判 CR02。
