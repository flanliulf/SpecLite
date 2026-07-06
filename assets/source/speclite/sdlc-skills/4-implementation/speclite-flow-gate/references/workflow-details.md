# Flow Gate Workflow Details

## Goal

Validate SpecLite implementation flow handoffs before they mutate Story/Epic state. The workflow detects drift between Story guidance, owning SPEC contracts, actual source implementation, and test or fixture evidence.

## Paths

- `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`
- `story_root` = value of `story_location` from `sprint-status.yaml`, otherwise `{implementation_artifacts}/stories`
- `flow_gate_root` = `{implementation_artifacts}/flow-gates`
- `report_template` = `assets/report-template.md`
- `foundation_handoff_candidates` = project-provided foundation handoff manifests when present, such as `evidence/foundation/downstream-prerequisites.md`, `evidence/foundation/future-closure-ledger.md`, `packages/shared-schema/fixtures/foundation/downstream-prerequisites.valid.json`, and `packages/shared-schema/fixtures/foundation/future-closure-ledger.valid.json`

## Inputs

Accept exactly one mode:

| Mode | Target | Report name |
| --- | --- | --- |
| `story-kickoff` | Story key or Story file | `{story-key}-story-kickoff-gate.md` |
| `story-completion` | Story key or Story file | `{story-key}-story-completion-gate.md` |
| `epic-completion` | Epic number | `epic-{n}-completion-gate.md` |
| `epic-kickoff` | Epic number | `epic-{n}-kickoff-gate.md` |

If mode or target is missing, ask for the missing value and HALT. Do not infer a destructive state transition.

## Result Enum

| Result | Meaning | Downstream action |
| --- | --- | --- |
| `PASS` | Contract, functional implementation, and evidence all match. | Continue downstream workflow. |
| `PASS_EQUIVALENT` | Story guidance names differ, but owning SPEC, actual implementation, and evidence prove equivalent behavior. | Continue downstream workflow and preserve the equivalence note. |
| `FAIL_CONTRACT` | Owning SPEC required contract anchor is missing or contradicted. | Fix contract anchor or revise SPEC/Story before continuing. |
| `FAIL_FUNCTION` | Contract exists but actual runtime/source behavior is missing. | Implement or repair functionality before continuing. |
| `FAIL_EVIDENCE` | Function may exist but tests, fixtures, snapshots, or command evidence are missing. | Add evidence before continuing. |
| `DECISION_NEEDED` | Documents conflict or scope is ambiguous. | Ask user or run correct-course before continuing. |

## Anchor Classification

Classify every dependency in the Story/Epic into one of four types:

| Anchor type | Definition | Gate behavior |
| --- | --- | --- |
| `Contract Anchor` | File, schema, parser, issue id, command output, or fixture contract explicitly required by an owning SPEC. | Missing means `FAIL_CONTRACT`. |
| `Functional Anchor` | Actual source implementation that provides the required behavior. It can be centralized or split. | Missing means `FAIL_FUNCTION`. |
| `Evidence Anchor` | Test, fixture, snapshot, command result, or CI/release evidence that proves the behavior. | Missing means `FAIL_EVIDENCE`. |
| `Guidance Anchor` | Suggested path, module split, naming hint, or Story-local implementation guidance not mandated by owning SPEC. | Mismatch can be `PASS_EQUIVALENT`; it is not a hard gate alone. |

## Foundation Handoff Metadata（地基交接元数据）

Story kickoff reports must always write these YAML frontmatter fields:

| Field | Allowed values for downstream development | Meaning |
| --- | --- | --- |
| `foundationPrerequisiteStatus` | `PASS`, `NOT_APPLICABLE` | Whether project foundation handoff prerequisites were checked for the target Story. |
| `foundationPrerequisiteRefs` | Free text path or comma-separated refs | Source manifests, evidence docs, or gate reports used for the prerequisite decision. |
| `closureOwnerCheckStatus` | `PASS`, `NOT_APPLICABLE` | Whether future-closure ownership was checked against the correct owning Epic/Story. |
| `closureOwnerRefs` | Free text path or comma-separated refs | Closure ledger refs and owning Story/Epic refs used for the owner decision. |

When a project does not provide foundation handoff manifests, write `NOT_APPLICABLE` for both status fields and explain that no project-level foundation handoff source was found. When manifests exist, `NOT_APPLICABLE` is valid only if the target Story is outside their declared downstream prerequisite or future-closure scope.

If either status is `FAIL_CONTRACT`, `FAIL_FUNCTION`, `FAIL_EVIDENCE`, or `DECISION_NEEDED`, the report `result` must also block downstream development. Downstream hooks and workflow runners treat missing status fields or non-allowing values as a hard stop.

## Execution

1. Load runtime config and sprint status. If `story_location` exists, resolve Story files from it; otherwise use `{implementation_artifacts}/stories`.
2. Load target Story/Epic and relevant prior Story records. For Story mode, read the complete Story file.
3. Locate owning SPECs from Story references, project-context, and planning-artifact specs index. If the Story names a contract but no owning SPEC can be found, mark that item `DECISION_NEEDED`.
4. For `story-kickoff`, locate project-provided foundation handoff manifests from `foundation_handoff_candidates` and any Story/Epic references to foundation handoff reports. Do not hardcode project-specific owners inside the Skill; use the project's own manifests as the source of truth.
5. Inspect actual source files and tests referenced by File List, Dev Notes, previous gate reports, foundation manifests, or git diff. Do not mutate files.
6. Evaluate in this exact order: `Contract -> Functional -> Evidence -> Guidance -> Foundation Handoff`.
   - Contract: required anchors from owning SPECs exist and are not contradicted.
   - Functional: runtime/source behavior exists in a centralized or split implementation.
   - Evidence: focused tests, fixture snapshots, command output, or release evidence prove behavior.
   - Guidance: Story-local file names or module split guidance matches or has a documented equivalent.
   - Foundation Handoff: downstream prerequisite and future-closure owner claims match project manifests.
7. Select the most severe result. `FAIL_CONTRACT` overrides `FAIL_FUNCTION`; `FAIL_FUNCTION` overrides `FAIL_EVIDENCE`; `DECISION_NEEDED` overrides pass results when ambiguity affects implementation choice.
8. Write the report under `{flow_gate_root}` using `assets/report-template.md`.
9. Print the result and recommended next action.

## Mode-Specific Checks

### `story-kickoff`

- Must run before `speclite-dev-story` changes `ready-for-dev` to `in-progress`.
- Validate all predecessor dependencies in the Story's first task and Dev Notes.
- Validate foundation handoff manifests when they exist:
  - For downstream Epic prerequisites, match the target Story's Epic and declared contract surfaces, expected checks, planned evidence type, and known exclusions against the project's downstream prerequisites manifest.
  - For future closures, match any Story claim to implement or close a future-only capability against the project's closure ledger. The owning Epic and first possible Story (or equivalent owner Story explicitly documented by the current Epic) must match before `closureOwnerCheckStatus` can be `PASS`.
  - If the target Story references a closure item but the ledger has no owner, has a different owner, marks the item active-ready prematurely, or conflicts with Story scope, output `FAIL_CONTRACT` or `DECISION_NEEDED`.
  - If the target Story does not intersect any foundation handoff scope, set both foundation status fields to `NOT_APPLICABLE` and cite the manifest check.
- If the only mismatch is a non-contract suggested file name with equivalent implementation evidence, output `PASS_EQUIVALENT`.
- Apply `references/regression-scenarios.md` for guidance path drift: missing split files are not a hard gate when owning SPEC, functional implementation, and evidence anchors prove equivalent behavior.

### `story-completion`

- Must run before `speclite-dev-story` changes Story status to `review`.
- Validate `Anchor Evidence Summary`, File List, changed source paths, and test evidence.
- The Story must record any `PASS_EQUIVALENT` rationale discovered during implementation.

### `epic-completion`

- Run after all Stories in the Epic are `done`.
- Summarize implementation anchors established by the Epic and list downstream capabilities that later Epics may depend on.
- If later Epic assumptions already conflict with actual implementation shape, output `DECISION_NEEDED`.

### `epic-kickoff`

- Run before creating or developing the first Story in the next Epic.
- Compare current Epic/Story prerequisites with the latest prior Epic completion report.
- Missing prior completion report is `FAIL_EVIDENCE` unless the target Epic has no predecessor dependency.

## Report Requirements

Every report must include:

- YAML frontmatter at the start of the file with `schemaVersion`, `mode`, `target`, `storyKey` for Story modes, `result`, `generatedAt`, `foundationPrerequisiteStatus`, `foundationPrerequisiteRefs`, `closureOwnerCheckStatus`, `closureOwnerRefs`, and `sourceSkill`.
- Mode, target, date, result, and reviewer model.
- Contract anchors checked.
- Functional anchors checked.
- Evidence anchors checked.
- Guidance mismatches and equivalent implementation rationale.
- Foundation handoff prerequisites and closure owner refs checked, or explicit `NOT_APPLICABLE` rationale.
- Missing or ambiguous items.
- Recommended next action.

Downstream hooks and finalizers must read the frontmatter or sidecar metadata. They must not parse the human-readable Markdown sections to determine the gate result.

Append:

```text
---

*本文档由 speclite-flow-gate Skill 自动生成*
```
