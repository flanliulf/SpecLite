# Manifest And Index Contract（清单与索引契约）

## Status（状态）

MVP implementation 草案。

## Ownership（所有权）

本 SPEC 是 SpecLite MVP 生成的 installed manifest 和 index files 的 canonical contract。

它负责：

- Manifest、skill index、help index、files index 和 minimum phase coverage matrix 的 public fields。
- 这些 installed files 的 schema version 和 compatibility policy。
- Generated indexes 使用的 canonical target ordering 和 module ordering rules。
- Validation 和 update protection 使用的 hash 与 ownership projection rules。

PRD 负责 product intent。Architecture 负责 implementation mapping。如果任一文档与本 SPEC 冲突，以本 SPEC 为准。

## Scope（范围）

Covered installed artifacts：

- `_speclite/_config/manifest.yaml`
- `_speclite/_config/skill-index.*`
- `_speclite/_config/help-index.*`
- `_speclite/_config/files-index.*`
- Any generated minimum phase coverage matrix embedded in or derived from manifest/index data.

MVP 不定义 team governance dashboard、coverage percentage、trend report 或 multi-project rollup。这些属于 Post-MVP，并且必须消费本 contract，而不是重新定义 installed state。

## Source Of Truth（真源）

Source-side truth：

- `assets/source/speclite/` 下的 module metadata 和 source skill packages 定义 canonical modules、canonical skill ids、source package content、phase metadata、help/menu labels 和 default artifact contracts。
- Help index source data 必须引用 canonical skill ids。它不得定义第二套 skill identity。
- `docs/specs/05-ide-adapter-registry-contract.md` 负责 adapter ids、target ids、target order 和 adapter capability semantics。
- `docs/specs/08-fixture-contract.md` 负责 fixture layout 和 release gate policy。

Installed projection truth：

- Manifest 和 indexes 是 selected modules、source descriptor、target IDEs、generated files、ownership、hashes 和 discovery metadata 的 installed projection。
- IDE mirrors 是重新生成的 execution-plane projections。它们不是 canonical source。

## Schema Version（Schema 版本）

每个 manifest/index artifact 都必须包含 schema version field。

MVP versions：

- `speclite.manifest.v1`
- `speclite.skill-index.v1`
- `speclite.help-index.v1`
- `speclite.files-index.v1`
- `speclite.phase-coverage.v1`

Backward-compatible additive changes 可以添加 optional fields。删除 fields、重命名 fields、改变 field meaning、收窄 enum values、不兼容地改变 field types，或添加 required fields，都需要新的 schema version。

## Canonical Target Identity（目标标识）

MVP IDE target ids 是 physical execution targets，不是 branded IDE claims：

- `claude`: `.claude/skills`
- `agents`: `.agents/skills`

当 GitHub Copilot 和 Cursor 支持 `.agents/skills` 时，可以使用 `agents` target。除非存在 dedicated adapter，否则 MVP 不得虚构 `copilot` 或 `cursor` target ids。

Canonical target order 由 `docs/specs/05-ide-adapter-registry-contract.md` 负责：

1. `claude`
2. `agents`

Manifest generation、command JSON `ideTargets`、validation `checkedTargets` 和 fixture expected outputs 必须使用此顺序。它们不得使用 glob order、filesystem order、user selection order 或 async adapter completion order。

## Minimum Phase Coverage Matrix（最小阶段覆盖矩阵）

MVP phase coverage 是 deterministic installed-state matrix，不是 governance score。

每一行必须包含：

```ts
type PhaseCoverageRow = {
  schemaVersion: "speclite.phase-coverage.v1";
  phaseId: string;
  phaseLabel: string;
  moduleId: string;
  canonicalSkillId: string;
  ideTargets: Array<{
    targetId: "claude" | "agents";
    entryPath: string;
    activationTarget: string;
    status: "mapped" | "unsupported" | "failed";
  }>;
  artifactContract?: {
    artifactType: string;
    defaultOutputPath: string;
    requiredMetadata: Array<"workflowType" | "sourceSkill" | "generatedAt">;
  };
};
```

Path fields 必须是 project-relative POSIX paths。Rows 按 `phaseId`、再按 `moduleId`、再按 `canonicalSkillId` 排序。

`artifactContract` 验证 skill 的 minimum artifact loop contract。MVP validation 检查 artifact type、default output path 和 required metadata values。它不判断 artifact content quality、narrative completeness 或 human review outcome。

Metadata value rules：

- `workflowType` 必须是 non-empty stable string。
- `sourceSkill` 必须是 non-empty stable canonical skill id。
- 当 artifact 中存在 `generatedAt` 时，它必须是 ISO 8601 string，且除非 fixture 显式 normalize，否则必须从 stable fixture snapshot comparison 中排除。

Target status semantics：

- `mapped`：adapter 为 target 生成了 self-contained skill entry，且该 entry 在 installed metadata 中可见。
- `unsupported`：adapter 声明该 target 在 MVP 中无法表示此 entry type 或 command pointer mode。这不是 write failure。
- `failed`：adapter 尝试或计划 mapping，但 target directory resolution、write、schema generation 或 reverse validation 失败。

Target status vocabulary 按 layer 区分。`mapped` / `unsupported` / `failed` 属于 installed phase coverage。Install planning 使用 `planned` / `unsupported` / `failed`；status summaries 使用 `not-configured` / `configured` / `partial` / `failed`。这些 vocabularies 不得互换。

## Skill Index（Skill 索引）

Skill index 将 canonical skill ids 映射到 source package metadata 和 installed target entries。

Required MVP fields：

- `schemaVersion`
- `canonicalSkillId`
- `moduleId`
- `sourcePackagePath`
- `canonicalPackageHash`
- `installedTargets[]`
- `phaseIds[]`

`canonicalPackageHash` 是 package-level。它验证相同 canonical package content 是否跨 IDE targets 被 mirror。它不替代 files index 中的 file-level hashes。

## Help Index（Help 索引）

Help index 将 user-facing menu/help entries 映射到 canonical skills。

Required MVP fields：

- `schemaVersion`
- `phaseId`
- `entryLabel`
- `canonicalSkillId`
- `activationTarget`
- `targetIds[]`

Help index entries 必须引用 `canonicalSkillId`。它们不得创建 alternate skill ids、alias-only identities 或 IDE-specific skill identities。

## Files Index（文件索引）

Files index 负责 installed files 的 file-level integrity 和 ownership projections。

Required MVP fields：

- `schemaVersion`
- `path`
- `ownership`: `installer-owned` | `human-owned` | `workflow-owned`
- `hash`
- `hashAlgorithm`: `sha256`
- `executable`: boolean
- `artifactKind`
- `sourceRef`

Package-level hashes 验证 canonical package equality。File-level hashes 验证 drift、update planning、repair planning、changed paths、skipped paths 和 conflicts。

File hashes 基于 raw file bytes 计算。Line endings、executable bit、file mode、symlink handling 和 case-conflict checks 是独立的 validation dimensions，不得被静默 normalize 到 hash 中。Runtime scripts 和 generated scripts 必须显式设置 `executable`，这样 permission drift 可以在不重载 content hash semantics 的情况下被诊断。

Source canonical text files 必须使用 LF line endings。Installers 不得按平台改写 canonical text line endings。如果必须生成 platform-specific script，它就是 distinct generated file，拥有自己的 files index entry 和 raw-byte hash。

`executable` 记录 POSIX executable intent。在 Windows 上，validation 不要求 POSIX chmod semantics，但该字段仍记录 script generation intent，并支持 cross-platform fixtures。

Volatile operation-control files，例如 `_speclite/.lock` 和 safe-write temporary files，不得记录在 files index 中，也不得影响 stable files-index hashes。Validation 可以通过 dedicated issue categories 检查它们的 shape 或 stale state。

Human-owned 和 workflow-owned files 可以为了 protection 被列出，但 automatic update 和 repair 不得 mutate 它们。

## Fixture Policy（Fixture 策略）

Manifest/index fixtures 是 contract tests，不是 documentation examples。

Fixture case directories 必须使用 stable lower-kebab names。MVP baseline cases：

| Fixture case（Fixture 用例） | MVP release gate（MVP 发布门禁） | Purpose（用途） |
| --- | --- | --- |
| `fresh-install-empty-project` | Yes | Fresh install baseline 和 ready summary gating。 |
| `existing-install-update` | Yes | Update safety、ownership protection 和 planned/applied result separation。 |
| `ide-drift` | Yes | IDE mirror drift detection 和 repair planning。 |
| `source-integrity` | Yes | Source descriptor trust/evidence 以及 blocked/unverified behavior。 |
| `resolve-parity` | Yes | 已安装 skills 的 config/customization resolver parity。 |
| `skill-artifact-loop` | Regression asset | End-to-end skill activation 和 artifact metadata loop。 |
| `path-portability` | Yes | Cross-platform path normalization、separators、permissions、executable bit、symlink/path escape 和 case behavior。 |

每个新的 module、adapter、source type、validation rule、ownership behavior 或 installed artifact kind 都必须更新：

- fixture input source
- expected installed tree
- expected manifest/index snapshots
- expected command JSON output
- expected validation issue set

Generated outputs 必须 deterministic，除非是已从 stable fixture comparison 排除的 schema-declared timestamp fields。
