# Round 4 Anchor Evidence（第四轮锚点证据）

- frozen diff raw SHA-256：`3b8d85276cc7f1308fb11a422158a933940034d70dfb2821353fd45746873490`；`41/41` declared headers，重建后的 41 个文件逐字节等于 current workspace；路径：`.tmp/evidence-v2-round-4/review-input.diff`。
- runtime config：本轮执行 `node dist/bin/speclite.js resolve config --project-root /Users/fancyliu/Repos/SpecLite`，exit 0；directory resolver 未重跑且禁止下游重跑。
- frozen directory evidence：`ok=true`、`issue=null`、`crDir=canonicalCrDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`。
- base/head：`ff7528d3f9ec34072bb669ee79f7569345c23d47` / `ff7528d3f9ec34072bb669ee79f7569345c23d47`。
- R3 current evaluation：`11-9-code-review-evaluation-20260907-evidence-v2-round-3.md`；canonical SHA-256=`sha256:e217f90e9835cbebc3de0f54aa0790892e1f1a551c7fbbaea689a5f70f65fe00`；`verdict=FIX_REQUIRED`；`fixRecord.status=completed`。
- R3 review canonical SHA-256：`sha256:cd196bdc14154b16cefb7b9b16a71d225344b32e60a25964db233f5e139f70a7`。
- current sourceMutationAt：`2026-09-08T00:45:57.541Z`（直接取自 R3 current evaluation `fixRecord`）。
- current resolver raw SHA-256：`d02050d915323f8c003a838acdeff0b2acf2e576600a0d00efb0011fb6dc964d`。
- current focused test raw SHA-256：`824af162a5bc87a169024e456a9934a24a1d60ec7b5bcef0732d35665418ae17`。
- R3 fix evidence（引用历史、非本轮执行）：仅 resolver 与 focused test 两文件；真实 `RED 2 failed / 105 passed / 4 todo` → `GREEN 107 passed / 4 todo / 0 failed`；39 个非目标 declared canonical content digests 无漂移；root hash、syntax、diff checks 与 strict verification 均 PASS。
- 本轮 fresh focused verification：`npx vitest run test/code-review-contract.test.ts --reporter=dot` PASS，`107 passed / 4 todo / 0 failed`；`node --check` 与两目标 diff checks PASS。
- Completion gate：现存 gate 早于本轮 fix mutation，只作历史 provenance，不是本轮 fresh completion evidence。
- 三层禁止 tests/build/packaging/full-suite/writer；Auditor 必须完成 12/12 AC coverage。
