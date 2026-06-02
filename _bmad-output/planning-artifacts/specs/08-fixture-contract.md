# Fixture Contract（Fixture 契约）

## Status（状态）

已接受用于 MVP planning。

## Ownership（所有权）

本 SPEC 是 MVP fixture layout、expected outputs、snapshot comparison 和 release gate classification 的 canonical contract。

- PRD 负责 product requirement 和 acceptance intent。
- Architecture 负责 implementation mapping 和 module responsibility。
- 本 SPEC 负责 fixture directory names、expected output classes、stable comparison rules 和 release gate policy。
- Domain-specific specs 负责各自 outputs 的 field semantics。
- 如果 PRD 或 Architecture 文本与本 SPEC 冲突，fixture behavior 以本 SPEC 为准。

## Implementation Anchor（实现锚点）

Implementation 必须提供 `src/fixtures/fixture-contract.ts` 作为 fixture manifest parsing、expected-output comparison 和 release gate classification 的 executable contract-test anchor。该 module 不是第二份契约真源；若它与本 SPEC 冲突，以本 SPEC 为准。

## Fixture Classes（Fixture 分类）

MVP fixture cases：

| Fixture case（Fixture 用例） | Release gate（发布门禁） | Purpose（用途） |
| --- | --- | --- |
| `fresh-install-empty-project` | Yes | Fresh install、generated tree、manifest/index、IDE mirrors、ready summary gating。 |
| `existing-install-update` | Yes | Update safety、ownership protection、conflict handling、planned/applied separation。 |
| `ide-drift` | Yes | IDE mirror drift detection 和 repair planning。 |
| `source-integrity` | Yes | Source descriptor trust/evidence fixture group；required sub-cases 见下方。 |
| `resolve-parity` | Yes | 已安装 skills 的 config/customization resolver parity。 |
| `path-portability` | Yes | Cross-platform path normalization、separators、executable bit、symlink/path escape、case behavior。 |
| `skill-artifact-loop` | Yes | 最小 end-to-end skill activation 和 artifact metadata loop。 |

Release gate fixtures、required release-gate sub-cases 和 release checklist gates 必须在 Node 22 和 Node 24 上通过，才能发布 MVP。

`fresh-install-empty-project` release gate 必须验证 selected official modules 下全部 canonical package roots 已进入 `skill-index.json`、`files-index.json` 和每个 selected IDE mirror。对于当前默认官方 `core` + `sdlc` 安装，baseline 应断言 53 个 canonical package roots，而不是只断言代表性 workflow skill。

Regression assets 是必需的 repository assets，但除非 release checklist 明确将其提升为 gate，否则不阻塞 MVP release。

Packaging acceptance 是 release checklist gate，不是 fixture project case。它必须产出 stable packaging manifest artifact `dist/packaging-manifest.json`，并保存 expected assertions 与 CI/release evidence；fixture runner 不得把 packaging acceptance 当作 `test/fixtures/<case>/` 项目目录。MVP release checklist command id 是 `npm run release:packaging-check`；若 package scripts 尚未存在，Story 1.1 的 scaffold 必须创建该 script stub，并在 Epic 6 完成实际 assertions。

`skill-artifact-loop` 的 MVP release gate 只校验 installed IDE entry discovery、activation protocol、resolver access 和 artifact metadata 值域。多 skill 场景、复杂 workflow 叙事质量、人工评审结论和 richer documentation examples 仍属于 regression assets 或 Post-MVP validation，不阻塞 MVP release。

MVP release 前，release gate fixture runs 必须包含 macOS 和 Windows 的 path-portability coverage。Local developer runs 可以缩小 matrix，但 release evidence 必须包含两个 supported OS families 和两个 supported Node baselines。

## Release Gate Ownership Matrix（发布门禁所有权矩阵）

| Gate class（门禁类型） | Gate / Scope（门禁 / 范围） | Canonical owner（契约所有者） | Evidence artifact（证据产物） | CI / Release scope（CI / 发布范围） |
| --- | --- | --- | --- | --- |
| Fixture project gate | `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`resolve-parity`、`path-portability`、`skill-artifact-loop` | 本 SPEC 负责 case naming、layout、gate classification 和 comparison policy；domain-specific SPECs 负责被断言字段的语义。 | `test/fixtures/<case>/input/**`、`test/fixtures/<case>/expected/**`、expected command JSON、manifest/index snapshots、validation issue set。 | MVP release 前必须在 Node 22 和 Node 24 通过；`path-portability` release evidence 必须包含 macOS 和 Windows。 |
| Fixture group sub-case | `source-integrity/<sub-case>`，包括本 SPEC 列出的 required sub-cases | 本 SPEC 负责 group/sub-case naming、gate classification 和 required sub-case baseline；source descriptor、install plan 和 validation taxonomy SPECs 负责 source trust、planning 和 issue id semantics。 | `test/fixtures/source-integrity/<sub-case>/input/**`、expected command JSON、expected issues、redaction assertions。 | 每个 required sub-case 都是 MVP release gate，必须随 source type、trust/evidence 或 redaction 行为变化同步更新。 |
| Release checklist gate | `packaging-acceptance` | 本 SPEC 负责 release checklist gate 分类与证据要求；Architecture 负责 packaging implementation mapping；source descriptor SPEC 负责 bundled source trust evidence 语义。 | `dist/packaging-manifest.json`、package file inventory、expected assertions、CI/release evidence。 | MVP release 前必须通过 `npm run release:packaging-check`；它不是 fixture project case，fixture runner 不得把它当作 `test/fixtures/<case>/`。 |

## Source Integrity Fixture Sub-Cases（Source Integrity Fixture 子用例）

`source-integrity` 是 fixture group，不是单一大场景。MVP release gate 必须至少覆盖以下 stable lower-kebab sub-cases：

| Sub-case（子用例） | Release gate（发布门禁） | Purpose（用途） |
| --- | --- | --- |
| `bundled-packaging-trusted` | Yes | Bundled source 通过 packaging manifest、package hash 或 package lock match 成为 `trusted`。 |
| `bundled-packaging-missing-evidence-blocked` | Yes | Bundled source 缺少 packaging evidence 时不得成为 `trusted`，并以稳定 `source-integrity` issue 阻断。 |
| `registry-lock-trusted` | Yes | Registry source 通过 expected hash 或 lock match 成为 `trusted`。 |
| `registry-unverified` | Yes | Registry source 只有可复现 registry evidence、没有 hash/lock match 时保持 `unverified`，且只有用户显式选择后才能进入 write planning。 |
| `git-floating-blocked` | Yes | 只提供 branch、tag 或 remote URL 的 Git source 被阻断，并产生 `source-integrity` issue。 |
| `local-source-snapshot-unverified` | Yes | Local source snapshot 只有 allowlist-based reproducible evidence、没有 expected hash/lock match 时保持 `unverified`。 |
| `local-source-path-redacted` | Yes | Local source public JSON 和 fixture snapshots 使用 display-safe label，不泄露 absolute local path、home directory 或 checkout root。 |
| `local-source-installed-state-blocked` | Yes | Local source 指向 `_speclite/`、IDE mirrors、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output 时被阻断，并产生 `source-integrity.local-source-self-reference`。 |
| `artifact-hash-mismatch-blocked` | Yes | Tarball、offline bundle 或 local source snapshot 的 hash/lock mismatch 被阻断。 |
| `source-unreadable-blocked` | Yes | Registry unreachable、authentication required、tarball unreadable 和 offline bundle unreadable 使用稳定 `source-integrity` issue id，并 redacted credentials/cache/temp paths。 |

## Directory Layout（目录布局）

Fixture case directories 必须使用稳定的 lower-kebab names。

Fixture group sub-cases 必须使用 `test/fixtures/<group>/<sub-case>/`，其中 `<group>` 和 `<sub-case>` 都必须是 stable lower-kebab names。

推荐 layout：

```text
test/fixtures/<case>/
  input/
  expected/
    file-tree.txt
    manifest/
    command-json/
    validation-issues.json
    stderr-jsonl/
  README.md

test/fixtures/<group>/<sub-case>/
  input/
  expected/
  README.md
```

`fixtures/sources/` 可以保存 reusable source packages。

`fixtures/expected/` 可以保存 shared expected snapshots，但每个 test 必须显式说明它验证的 fixture case。

## Expected Output Classes（期望输出类别）

每个新的 module、adapter、source type、validation rule、ownership behavior 或 installed artifact kind 都必须更新相关 expected outputs：

- expected installed tree
- expected manifest/index snapshots
- expected command JSON output
- expected validation issue set
- applicable 时的 expected stderr diagnostics
- expected file hashes 或 normalized file-tree summary

Fixture expected outputs 是 contract test assets，不是 documentation examples。

## Comparison Rules（比较规则）

Command JSON 必须 parse 后进行 semantic comparison。

Resolve stdout JSON 必须 parse 后进行 semantic comparison。

stderr JSON Lines 必须逐行 parse，并作为 `ValidationIssue` objects 比较。

File content 应通过 normalized expected tree 加 hash 比较，其中 installer-owned 文件必须使用 hash。Human-owned 和 workflow-owned preservation 应通过 content unchanged checks 断言。

在 Windows 上，fixtures 不得要求 POSIX chmod behavior。它们仍必须在 files index entries 中断言 `executable` intent，并验证 generated script entry points 可通过 supported Windows invocation path 使用。

Stable snapshot comparison 只能忽略 SPEC 明确声明为 non-stable 的字段，例如允许的 generated metadata timestamps。

Artifact metadata 必须包含 `generatedAt`。Fixture 必须只做 semantic assertion：value 可 parse 为 ISO 8601 string。Stable snapshots 必须 normalize、omit 或单独标记该字段为 non-stable，不得比较具体 timestamp value。

Duration、elapsed time、p95 measurement、profiling sample 和阶段耗时默认不得进入 stable command JSON snapshots。若某个 command JSON schema 显式引入这类字段，该字段必须被标记为 non-stable，并在 fixture comparison 中 normalize 或 exclude。

Performance baseline、p95 duration 和 regression percentage 必须作为 release/performance evidence 保存，而不是作为 stable command JSON 或 stable fixture snapshot 字段保存。MVP 可以使用 release checklist section 或单独的 non-stable `performance-evidence` artifact 承载这些 measurement；fixture assertions 只能验证 evidence 存在、测量口径和 pass/fail conclusion，不得比较具体 wall-clock values。

除非某个 SPEC 声明并规范化，否则以下内容不得出现在 stable expected outputs 中：

- absolute paths
- home directories
- OS-specific separators
- timestamps
- random ids
- process ids
- environment variables
- credentials
- stack traces

## Ready Summary Gate（Ready Summary 门禁）

Fresh install 在该 install path 所需 ReadyCheck 通过之前，不得显示最终 ready summary。

Machine-readable progress `stepId` 必须使用 stable lower-kebab id，例如 `ready-check`。Human-readable progress step label 可以是 `ready check`；contract/internal guard 名称必须是 `ReadyCheck`。Fixtures 可以断言 `stepId` ordering；ready summary gate 必须绑定 `ReadyCheck` 通过语义，而不是自由文本 label。`stepId` 是 fixture-observable deterministic signal，不是 MVP automation API；automation 应读取 `CommandResult.data.completedSteps` 和 `CommandResult.data.pendingSteps`。

ReadyCheck 是 install 内部的最小就绪检查，不等同于完整 `speclite validate`。它必须至少覆盖：

- manifest/index 可读，且 schema version 被当前 runtime 支持
- source descriptor projection 存在且 shape valid
- selected IDE mirrors 存在，并且 selected modules 下全部 canonical package roots 对应的 installed skill entries 可见
- `_speclite`、configured artifact root 和 required runtime paths 存在
- install command 本次没有 blocking `ValidationIssue` 或 failed required step

ReadyCheck 不得执行 full hash scan、remote source access、remote freshness/provenance revalidation、implicit update check 或 repair planning。这些详细诊断属于显式 `speclite validate`、install/update source resolution 或 Post-MVP `doctor`。

`install --json` 必须通过 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps` 等 structured fields 暴露 automation dependencies；fixture assertions 不得依赖 free-form `readySummary` JSON blob。

## Change Policy（变更策略）

当 public contract 变化时，同一个变更必须更新：

1. owning SPEC
2. executable schema 或 parser（如果存在）
3. fixture expected outputs 或 contract tests
4. 只有当 product intent 或 implementation mapping 变化时，才更新 PRD/Architecture summaries

Implementation 不得先更新 snapshots，再从 snapshots 反推 contract behavior。
