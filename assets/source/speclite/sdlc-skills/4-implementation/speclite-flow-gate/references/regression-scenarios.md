# Flow Gate Regression Scenarios

## Equivalent Implementation For Guidance Path Drift

Scenario:
- A prior Story or workflow guidance names concrete split source files as expected anchors.
- The owning SPEC does not require those exact split files.
- The actual implementation provides the required behavior through a centralized module or another equivalent structure.
- Focused tests, fixture snapshots, command output, or installed-state evidence prove the behavior.

Expected result:
- The gate must output `PASS_EQUIVALENT`, not `FAIL_CONTRACT` or `FAIL_FUNCTION`.
- The report must classify the concrete file-name mismatch as `Guidance Anchor`.
- The report must list the owning SPEC, functional implementation path, and evidence anchor that justify equivalence.

Counterexample:
- If the owning SPEC explicitly requires the concrete file path, the missing file is a `Contract Anchor` failure and the result is `FAIL_CONTRACT`.
- If the owning SPEC exists but no functional implementation provides the behavior, the result is `FAIL_FUNCTION`.
- If functionality appears to exist but no test, fixture, snapshot, or command evidence proves it, the result is `FAIL_EVIDENCE`.

## Missing Gate Before State Transition

Scenario:
- A Story is `ready-for-dev`.
- `speclite-dev-story` is about to move it to `in-progress`.
- The story-kickoff gate report is missing, stale, or not `PASS` / `PASS_EQUIVALENT`.

Expected result:
- `speclite-sprint-status` should recommend `speclite-flow-gate`.
- `speclite-dev-story` must HALT before state mutation.
