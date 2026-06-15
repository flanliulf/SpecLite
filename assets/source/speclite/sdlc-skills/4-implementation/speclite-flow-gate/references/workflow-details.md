# Flow Gate Workflow Details

## Goal

Validate SpecLite implementation flow handoffs before they mutate Story/Epic state. The workflow detects drift between Story guidance, owning SPEC contracts, actual source implementation, and test or fixture evidence.

## Paths

- `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`
- `story_root` = value of `story_location` from `sprint-status.yaml`, otherwise `{implementation_artifacts}/stories`
- `flow_gate_root` = `{implementation_artifacts}/flow-gates`
- `report_template` = `assets/report-template.md`

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

## Execution

1. Load runtime config and sprint status. If `story_location` exists, resolve Story files from it; otherwise use `{implementation_artifacts}/stories`.
2. Load target Story/Epic and relevant prior Story records. For Story mode, read the complete Story file.
3. Locate owning SPECs from Story references, project-context, and planning-artifact specs index. If the Story names a contract but no owning SPEC can be found, mark that item `DECISION_NEEDED`.
4. Inspect actual source files and tests referenced by File List, Dev Notes, previous gate reports, or git diff. Do not mutate files.
5. Evaluate in this exact order: `Contract -> Functional -> Evidence -> Guidance`.
   - Contract: required anchors from owning SPECs exist and are not contradicted.
   - Functional: runtime/source behavior exists in a centralized or split implementation.
   - Evidence: focused tests, fixture snapshots, command output, or release evidence prove behavior.
   - Guidance: Story-local file names or module split guidance matches or has a documented equivalent.
6. Select the most severe result. `FAIL_CONTRACT` overrides `FAIL_FUNCTION`; `FAIL_FUNCTION` overrides `FAIL_EVIDENCE`; `DECISION_NEEDED` overrides pass results when ambiguity affects implementation choice.
7. Write the report under `{flow_gate_root}` using `assets/report-template.md`.
8. Print the result and recommended next action.

## Mode-Specific Checks

### `story-kickoff`

- Must run before `speclite-dev-story` changes `ready-for-dev` to `in-progress`.
- Validate all predecessor dependencies in the Story's first task and Dev Notes.
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

- YAML frontmatter at the start of the file with `schemaVersion`, `mode`, `target`, `storyKey` for Story modes, `result`, `generatedAt`, and `sourceSkill`.
- Mode, target, date, result, and reviewer model.
- Contract anchors checked.
- Functional anchors checked.
- Evidence anchors checked.
- Guidance mismatches and equivalent implementation rationale.
- Missing or ambiguous items.
- Recommended next action.

Downstream hooks and finalizers must read the frontmatter or sidecar metadata. They must not parse the human-readable Markdown sections to determine the gate result.

Append:

```text
---

*本文档由 speclite-flow-gate Skill 自动生成*
```
