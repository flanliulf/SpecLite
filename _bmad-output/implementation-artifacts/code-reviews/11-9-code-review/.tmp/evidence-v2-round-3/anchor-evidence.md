# Round 3 Anchor Evidence（第三轮锚点证据）

- frozen diff raw SHA-256: `2d34d3d44fd7b48a18ed58dfbc831459be274fdaf0d5b99ea69abe4fd4b77834`；路径：`.tmp/evidence-v2-round-3/review-input.diff`。
- runtime resolver：本轮仅执行一次 `node dist/bin/speclite.js resolve config --project-root /Users/fancyliu/Repos/SpecLite`，exit 0；之后禁止再次解析。
- frozen directory evidence：`ok=true`、`issue=null`、`crDir=canonicalCrDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`。
- base/head：`ff7528d3f9ec34072bb669ee79f7569345c23d47` / `ff7528d3f9ec34072bb669ee79f7569345c23d47`。
- current sourceMutationAt：`2026-09-07T12:42:41.443Z`。
- current resolver raw SHA-256：`8a1a047fc472f655824fe2491122f4883518c4035049b1b2e00931422ff43aad`。
- current focused test raw SHA-256：`d87cf7eaa3d722a620a00999b959ae86c74f77e4f8eb93d626c71685f40edf39`。
- Round 2 review canonical SHA-256：`sha256:7b7b8fbf4b6c22facbccc0498e2b0fe0bc898e1be3a6221df8bce7c0dfef1164`。
- Round 2 evaluation canonical SHA-256：`sha256:e1a5e9ee2c74c76c88db5f53bdd3d2e886d1aa98ccebc2678875f7e1ab724ccb`；含 `fixRecord.status=completed`。
- Fix evidence（引用历史、非本轮执行）：真实 RED→GREEN；focused `104 passed / 4 todo / 0 failed`；两目标文件 `git diff --check` PASS；39 个非目标 declared digests 未漂移。
- Completion gate：现存 `PASS_EQUIVALENT` 生成于 fix mutation 之前，仅作历史 provenance，不是本轮 fresh completion evidence。
- 本轮 Reviewer 可执行 focused vitest；三层禁止 tests/build/packaging/full-suite/writer。
- 最终 `scopeHash`：`sha256:8c8d96e59dbeaea668dd940eda6cded83186ebcf8098ec375ae87e00c43182d3`；全部本轮 workflow outputs 已实际物化并进入 actual/excluded，declared content digests 不包含这些 outputs 内容。
