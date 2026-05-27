```markdown
<!-- Double-brace variables are filled dynamically at runtime. -->

# Story {{epic_num}}.{{story_num}}: {{story_title}}

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a {{role}},
I want {{action}},
so that {{benefit}}.

## Acceptance Criteria

1. [Add acceptance criteria from epics/PRD]

## Tasks / Subtasks

- [ ] Task 1 (AC: #)
  - [ ] Subtask 1.1
- [ ] Task 2 (AC: #)
  - [ ] Subtask 2.1

## Dev Notes

- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- Detected conflicts or variances (with rationale)

### Dependency Gate

- Prerequisite capabilities to verify before development:
- Required gate mode: `story-kickoff`
- Expected gate result before implementation: `PASS` or `PASS_EQUIVALENT`

### Anchor Contract Map

| Dependency | Anchor Type | Owning SPEC / Source | Required Evidence | Gate Behavior |
| --- | --- | --- | --- | --- |
| `<dependency>` | `Contract Anchor / Functional Anchor / Evidence Anchor / Guidance Anchor` | `<path or section>` | `<test, fixture, command, or source evidence>` | `<PASS / PASS_EQUIVALENT / failure condition>` |

### Equivalent Implementation Policy

- Suggested implementation paths are guidance unless an owning SPEC makes them contract anchors.
- If existing centralized or differently named modules satisfy the same contract and evidence, treat them as equivalent and record the rationale.
- Do not create compatibility files solely to satisfy a non-contract guidance path.

### Evidence Plan

- Focused tests:
- Fixture or snapshot assertions:
- Command or regression checks:
- Flow gate report expected at: `{implementation_artifacts}/flow-gates/{{story_key}}-story-kickoff-gate.md`

### Files to Modify (UPDATE files)

For each UPDATE file this Story touches, record:

- **Path**: `<file path>`
- **Current state**: <today's responsibilities, state machine, API calls, data shapes, existing behaviors>
- **What this Story changes**: <the specific sections or behaviors being modified>
- **What must be preserved**: <existing interactions and behaviors that must not break>

### References

- Cite all technical details with source paths and sections, e.g. [Source: docs/<file>.md#Section]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

### Anchor Evidence Summary

- Flow gate result:
- Contract anchors verified:
- Functional anchors verified:
- Evidence anchors verified:
- Equivalent implementation decisions:

---

*本文档由 speclite-create-story Skill 自动生成*
```
