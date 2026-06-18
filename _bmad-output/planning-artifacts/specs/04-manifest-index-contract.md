# Manifest And Index Contract（清单与索引契约）

## Status（状态）

已接受用于 MVP planning。

## Ownership（所有权）

本 SPEC 是 SpecLite MVP 生成的 installed manifest 和 index files 的 canonical contract。

它负责：

- Manifest、skill index、help index、files index 和 minimum phase coverage matrix 的 public fields。
- 这些 installed files 的 schema version 和 compatibility policy。
- Generated indexes 使用的 canonical target ordering 和 module ordering rules。
- Validation 和 update protection 使用的 hash 与 ownership projection rules。

PRD 负责 product intent。Architecture 负责 implementation mapping。如果任一文档与本 SPEC 冲突，以本 SPEC 为准。

## Implementation Anchor（实现锚点）

Implementation 必须提供 `src/manifest/manifest-schema.ts` 作为 manifest、skill index、help index、files index 和 phase coverage projection 的 executable schema/parser anchor。该 module 不是第二份契约真源；若它与本 SPEC 冲突，以本 SPEC 为准。

## Scope（范围）

Covered installed artifacts：

- `_speclite/_config/manifest.yaml`
- `_speclite/_config/skill-index.json`
- `_speclite/_config/help-index.json`
- `_speclite/_config/files-index.json`
- `_speclite/_config/phase-coverage.json`

这些文件名和扩展名是 MVP installed-state contract。Implementation 不得自行改用 YAML、TOML、CSV、extensionless file 或 per-platform filename。若未来需要替换文件格式或路径，必须发布新的 manifest/index schema version，并同步 owning SPEC、executable schema/parser 和 fixture expected outputs。

MVP 不定义 team governance dashboard、coverage percentage、trend report 或 multi-project rollup。这些属于 Post-MVP，并且必须消费本 contract，而不是重新定义 installed state。

## Source Of Truth（真源）

Source-side truth：

- `assets/source/speclite/` 下的 module metadata 和 source skill packages 定义 canonical modules、canonical skill ids、source package content、phase metadata、help/menu labels 和 default artifact contracts。
- 对 selected modules，`skill-index.json` 必须覆盖该模块下全部 canonical package roots；help/menu metadata 缺失不得导致 package root 从 skill index、files index 或 IDE mirrors 中消失。
- `help-index.json` 与 `phase-coverage.json` 是 discovery/menu/phase projections。它们可以只包含有 help/menu metadata 的 entries，但必须引用已存在于 `skill-index.json` 的 `canonicalSkillId`，不得定义第二套 installed skill inventory。
- Help index source data 必须引用 canonical skill ids。它不得定义第二套 skill identity。
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 负责 adapter ids、target ids、target order 和 adapter capability semantics。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 负责 fixture layout 和 release gate policy。

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

Manifest/index projections 不得把 `agents` target 渲染为 branded Copilot/Cursor readiness；branding 和 dedicated target id 只能由未来 dedicated adapter 引入。

Canonical target order 由 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 负责：

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
- Artifact metadata 必须包含 `generatedAt`。它必须是 canonical UTC ISO string，即 JavaScript `Date.toISOString()` 产生的 millisecond UTC form；除非 fixture 显式 normalize，否则必须从 stable fixture snapshot comparison 中排除。

## Artifact Contract Semantics（Artifact Contract 语义）

本 SPEC 拥有 MVP artifact contract 的字段与最小验证语义。PRD、Architecture、CommandResult 和 Epics 只能引用本节，不得各自定义第二套 artifact contract。

`artifactContract.artifactType` 是 stable artifact kind，不是 human-readable title。`defaultOutputPath` 必须是 project-relative POSIX path，并且必须落在 `_speclite-output/` 或配置约定的 workflow artifact root 下。

Configured workflow artifact root 本身也是 contract path：它必须是 project-relative POSIX path，必须解析在 target project boundary 内，且不得通过 symlink escape 或 path escape 指向项目外。违反边界时 validation 必须使用 `artifact-path.escapes-project` 或 `artifact-path.symlink-escape`；不得把 escaped absolute path 写入 public JSON、manifest/index 或 fixture snapshots。

## Artifact Metadata Encoding（Artifact Metadata 编码）

Workflow artifact metadata 必须在 artifact 文件系统输出中可被 validator 读取，不得只存在于 human-readable prose。

- Markdown artifacts 必须在文件开头使用 YAML frontmatter 承载 metadata，且至少包含 `workflowType`、`sourceSkill` 和 `generatedAt`。
- 非 Markdown file artifacts 必须在同一 artifact root 下写出 sidecar JSON，命名为 `<artifact-filename>.metadata.json`，并包含相同 metadata keys。
- Directory artifacts 必须在 artifact directory 内写出 `metadata.json`，并包含相同 metadata keys。
- Manifest/index projection 可以记录 artifact contract 和 metadata location，但不得替代 on-disk artifact metadata。

Metadata sidecar files 是 workflow-owned artifacts。Install、update 和 repair 不得把它们作为 installer-owned changed paths，也不得因为 artifact validation failure 覆盖它们。

MVP validation 只检查：

- artifact type 与 `artifactContract.artifactType` 匹配
- output path 符合 `defaultOutputPath` 或配置允许的 project-relative path
- required metadata keys 存在且值域合法
- `workflowType` 和 `sourceSkill` 是 non-empty stable strings
- `sourceSkill` 与 installed canonical skill id 一致
- `generatedAt` 存在且符合 canonical UTC ISO string / `Date.toISOString()` form，并在 stable fixture snapshot comparison 中 normalize 或 exclude

Artifact files 是 workflow-owned。Install、update 和 repair 不得把 workflow artifacts 作为 installer-owned changed paths，也不得用 artifact validation 结果触发 overwrite。MVP 不验证叙事质量、内容完整度、人工评审结论或业务正确性。

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

### Hook Artifact Entries（Hook 产物条目）

Post-MVP hook projection 继续使用 `speclite.files-index.v1`，不得新增第二套 hook index 作为 installed-state 真源。Hook files 必须作为 files index entries 记录 file-level hash、ownership、`executable` intent、`artifactKind` 和 `sourceRef`。

Hook artifact `artifactKind` 最小 vocabulary：

- `hook-runner`：installer-owned executable runner，例如 `_speclite/hooks/flow-gate-enforcement/runner.mjs`。
- `hook-source-metadata`：installer-owned hook source metadata，例如 `_speclite/hooks/flow-gate-enforcement/hook-manifest.json`。
- `platform-hook-config`：project execution-plane hook config，例如 `.claude/settings.json` 或 `.codex/hooks.json`。
- `safe-merged-platform-hook-config`：当未来实现 safe merge 且整文件包含 human-owned 配置时，用于表达 merged config protection 语义。

Hook runner 必须记录 `executable: true`。Platform hook config 若由 installer 新建，可以记录 `ownership: "installer-owned"`；若整文件已有 human-owned 内容且 implementation 选择 safe merge，则必须记录 protected ownership/merge 语义，不得把整文件伪装成完全 installer-owned。若无法安全 merge，installer 必须输出 manual action，不得静默覆盖。

Hook source files 的 `sourceRef` 必须指向 `assets/source/speclite/hooks/<hook-id>/...`。Generated platform config 可以使用 stable local reference token，例如 `generated:claude-flow-gate-hook-config` 或 `generated:codex-flow-gate-hook-config`。

`_speclite/config.toml` 中的 `[hooks.<hookId>]` table 是 runtime descriptor projection，只帮助 skills、support commands 和用户理解 hook identity、runner path、platform config path 与 trust boundary。它不得替代 files index 中的 hook artifact entries；validation、update、repair 和 drift detection 必须继续以 files index 的 file-level hash、ownership、`artifactKind`、`executable` 和 `sourceRef` 为 integrity 真源。

同理，`_speclite/config.toml` 中的 `[agents.<canonicalSkillId>]` table 是 runtime-facing descriptor projection。Canonical skill inventory、installed target mapping、package hash 和 phase coverage 仍由 `skill-index.json`、`help-index.json`、`phase-coverage.json` 和 files index 管理；agent descriptors 不得创建第二套 installed skill inventory。

## Fixture Policy（Fixture 策略）

Manifest/index fixtures 是 contract tests，不是 documentation examples。本 SPEC 只拥有 manifest/index 字段和 projection 语义；fixture directory names、release gate classification、expected output classes、snapshot comparison rules、release checklist gates 和 regression asset policy 由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 管理。

当 manifest/index public fields、schema version、hash/ownership projection 或 phase coverage semantics 变化时，必须按 fixture contract 更新对应 fixture inputs、expected manifest/index snapshots、command JSON expected outputs 和 validation assertions。Generated manifest/index outputs 必须 deterministic，除非字段已由 owning SPEC 明确声明并从 stable fixture comparison 排除。
