# IDE Adapter Registry Contract（IDE 适配器注册表契约）

## Status（状态）

Accepted for MVP planning.

## Ownership（所有权）

This SPEC is the canonical contract for the MVP IDE adapter registry.

- PRD owns product requirement and acceptance intent.
- Architecture owns implementation mapping and module responsibility.
- This SPEC owns adapter ids, target ids, adapter capability fields, target ordering, status semantics, and command pointer extension boundaries.
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.en.md` owns installed manifest/index projections that consume adapter registry data.
- If PRD or Architecture text conflicts with this SPEC, this SPEC wins for adapter registry behavior.

## Implementation Anchor（实现锚点）

Implementation must provide `src/ide/adapter-registry.ts` as the executable registry/schema anchor for adapter ids, target ids, capability fields, target ordering, and target status mapping. This module is not a second contract source; if it conflicts with this SPEC, this SPEC wins.

## MVP Targets（MVP 目标）

MVP target ids are physical execution targets, not branded IDE claims:

1. `claude`: `.claude/skills`
2. `agents`: `.agents/skills`

GitHub Copilot and Cursor may use the `agents` target when they support `.agents/skills`. MVP must not fabricate `copilot` or `cursor` target ids unless a dedicated adapter exists.

Human-readable output and docs must display `agents` as an agents directory target or `.agents/skills` target; they must not render it as Copilot/Cursor readiness, health, or dedicated adapter status. Branded Copilot/Cursor target ids or branded readiness may be output only after a future dedicated adapter exists and this SPEC is updated first with target id, status, and fixture rules.

Canonical target order is:

```ts
const CANONICAL_TARGET_ORDER = ["claude", "agents"] as const;
```

Manifest generation, command JSON `ideTargets`, validation `checkedTargets`, phase coverage rows, and fixture snapshots must use this order. They must not use glob order, filesystem order, user selection order, or async adapter completion order.

## Adapter Definition Shape（适配器定义形状）

MVP adapter registry entries must include:

```ts
type IdeAdapterDefinition = {
  id: "claude" | "agents";
  targetDirectory: ".claude/skills" | ".agents/skills";
  entryType: "self-contained-skill";
  supportedActivationTargets: string[];
  sharedTargetPolicy: "dedupe-by-canonical-skill-id";
  commandPointerBehavior: "none" | "unsupported";
  knownLimitations: string[];
  validationChecks: string[];
  targetOrder: number;
};
```

`commandPointerBehavior` is an extension placeholder only. MVP must not generate command pointer artifacts.

Adapter definitions must not rename canonical skill ids, canonical skill package directories, or customization lookup keys.

## Status Semantics（状态语义）

Target status vocabulary is layer-specific:

| Layer | Values | Meaning |
| --- | --- | --- |
| Install planning | `planned`, `unsupported`, `failed` | Whether the adapter can participate in planned writes. |
| Installed phase coverage | `mapped`, `unsupported`, `failed` | Whether an installed phase entry is visible through a target. |
| Status summary | `not-configured`, `configured`, `partial`, `failed` | Health summary for an installed target. |

The same literal may appear in different layers, but it must be interpreted by the layer-scoped type: `InstallPlanningTargetStatus`, `InstalledPhaseCoverageStatus`, or `StatusSummaryTargetHealth`. Do not treat one layer's `unsupported` or `failed` as another layer's semantics.

`unsupported` means the adapter declared a capability gap. It is not a write failure.

`failed` means a target directory resolution, schema generation, write, or reverse validation step was attempted or planned and failed.

If a user explicitly selects a target and that target is unsupported for the requested module set, install planning must produce a blocking error. If a target is optional or not selected, unsupported may be reported as warning, info, or known limitation according to `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.en.md`.

## Adapter Responsibilities（适配器职责）

An adapter may:

- resolve its target directory
- map canonical skill packages to self-contained target entries
- produce target-specific discovery metadata
- report declared capability gaps
- provide reverse validation checks for generated entries

An adapter must not:

- modify canonical skill package content
- implement config/customization merge logic
- decide source trust
- compute files-index ownership independently
- generate command pointer artifacts in MVP
- create branded target ids for IDEs that only consume `.agents/skills`

## Fixture Policy（Fixture 策略）

Adapter changes must update fixtures that cover:

- canonical target ordering
- generated target directory paths
- target status mapping
- unsupported target behavior
- duplicate canonical skill id handling
- reverse validation of mapped self-contained skill entries
- canonical package hash stability across targets

`fresh-install-empty-project`, `ide-drift`, and `path-portability` are release gate fixtures for adapter behavior.
