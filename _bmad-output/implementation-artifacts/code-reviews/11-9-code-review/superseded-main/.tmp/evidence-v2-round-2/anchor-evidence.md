# Anchor Evidence（锚点证据）

- 本轮 scopeHash：`sha256:b453941087e5c4ac29705f51438704f374c50e63badf0dd8f5357d528379a9fe`。
- 冻结 review input：`review-input.diff`，raw SHA-256=`8218ebd79e971467e66d7ac18732f32d2c17a097047532e08d6040743e968b50`；已与当前 41 个 declared 文件重新生成的 diff 逐字节核对一致。
- current sourceMutationAt：`2026-09-07T09:27:03.484Z`；来自 `test/code-review-contract.test.ts`。
- 用户授权的 fixer 结果：F1–F6 三文件 bounded patch，current evaluation fixRecord=completed。
- current evaluation canonical hash：`sha256:1d2bdc23c52662e1c58a83b32f936b197566c92c3dd7c4edb1cc002a54ee87bf`。
- 上轮 summary canonical hash：`sha256:9f8fa299bfe5e4c30a5ca45d61fcfbb618b18fb9b141db60909e1a291ab86ae7`。
- 历史 completion gate：`_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md`，result=PASS_EQUIVALENT，generatedAt=2026-09-07T04:45:00.000Z；早于本轮 source mutation，仅作历史证据，不是 fresh completion gate。
- Fixer 历史验证：`npx vitest run test/code-review-contract.test.ts` => 103 passed / 4 todo / 0 failed。
- 本轮实际执行：`npx vitest run test/code-review-contract.test.ts --reporter=dot` => 103 passed / 4 todo / 0 failed；执行后 41 个 declared content digests、`sourceMutationAt` 与冻结 diff 均保持一致。
- 本轮禁止 build、release:packaging-check、full suite 和任何 writer；focused vitest 由主 reviewer 统一执行。
