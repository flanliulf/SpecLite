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

## Fixture Classes（Fixture 分类）

MVP fixture cases：

| Fixture case（Fixture 用例） | Release gate（发布门禁） | Purpose（用途） |
| --- | --- | --- |
| `fresh-install-empty-project` | Yes | Fresh install、generated tree、manifest/index、IDE mirrors、ready summary gating。 |
| `existing-install-update` | Yes | Update safety、ownership protection、conflict handling、planned/applied separation。 |
| `ide-drift` | Yes | IDE mirror drift detection 和 repair planning。 |
| `source-integrity` | Yes | Source descriptor trust/evidence 以及 blocked/unverified behavior。 |
| `resolve-parity` | Yes | 已安装 skills 的 config/customization resolver parity。 |
| `path-portability` | Yes | Cross-platform path normalization、separators、executable bit、symlink/path escape、case behavior。 |
| `skill-artifact-loop` | Regression asset | End-to-end skill activation 和 artifact metadata loop。 |

Release gate fixtures 必须在 Node 22 和 Node 24 上通过，才能发布 MVP。

Regression assets 是必需的 repository assets，但除非 release checklist 明确将其提升为 gate，否则不阻塞 MVP release。

MVP release 前，release gate fixture runs 必须包含 macOS 和 Windows 的 path-portability coverage。Local developer runs 可以缩小 matrix，但 release evidence 必须包含两个 supported OS families 和两个 supported Node baselines。

## Directory Layout（目录布局）

Fixture case directories 必须使用稳定的 lower-kebab names。

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

Fresh install 在该 install path 所需 release gate validation 通过之前，不得显示最终 ready summary。

`install --json` 必须通过 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps` 等 structured fields 暴露 automation dependencies；fixture assertions 不得依赖 free-form `readySummary` JSON blob。

## Change Policy（变更策略）

当 public contract 变化时，同一个变更必须更新：

1. owning SPEC
2. executable schema 或 parser（如果存在）
3. fixture expected outputs 或 contract tests
4. 只有当 product intent 或 implementation mapping 变化时，才更新 PRD/Architecture summaries

Implementation 不得先更新 snapshots，再从 snapshots 反推 contract behavior。
