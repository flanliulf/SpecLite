# Validation Issue Taxonomy（验证问题分类契约）

## Status（状态）

已接受用于 MVP planning。

## Ownership（所有权）

本 SPEC 是 `ValidationIssue.category`、issue id boundaries、default severity guidance 和 fixture ownership 的 canonical taxonomy。

`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 负责 `ValidationIssue` 的 public JSON shape。本 SPEC 负责 issue categories 和 stable issue ids 背后的 meaning 与 registry discipline。

## Issue Id Policy（问题 ID 策略）

Issue ids 必须使用：

```text
<category>.<stable-code>
```

Issue ids 不得包含 path、IDE target、source name、hash、count、timestamp、random id 或任何其他 dynamic value。Dynamic context 属于 `affectedPath`、`component` 或 `details`。

当遵循 existing category boundary 时，MVP 允许添加新的 issue id。改变现有 issue id meaning 是 breaking diagnostic contract change，需要 fixture updates 和显式 migration notes。

每个 MVP category 必须在 implementation 前保留 minimum issue id baseline。当 scenario 匹配时，producers 必须使用 reserved ids；不允许 free-form issue ids。

## Canonical Category Order（标准类别顺序）

MVP category order：

1. `environment`
2. `manifest-schema`
3. `source-integrity`
4. `ide-mirror`
5. `runtime-path`
6. `menu-target`
7. `legacy-namespace`
8. `artifact-path`
9. `file-integrity`
10. `operation-lock`
11. `update`

Command JSON sorting 必须在 normalized affected path 和 issue id 之前使用此顺序。

## Category Boundaries（类别边界）

### `environment`（environment 类别）

用于 command runtime/platform guard failures。它描述当前 execution environment 无法安全运行 MVP command，不描述 installed project state。

Examples（示例）：

- detected Node.js runtime 不满足 MVP required range
- detected OS/platform 不在 MVP supported platform policy 内

Default severity（默认严重级别）：

- 当命令必须在读取或写入项目文件前停止时为 `error`

Reserved MVP issue ids：

- `environment.unsupported-node`
- `environment.unsupported-platform`

`environment.unsupported-node` details 必须至少包含 `detectedVersion` 和 `requiredRange`。`environment.unsupported-platform` details 必须至少包含 `detectedPlatform` 和 `supportedPlatforms`。Details 不得包含 absolute paths、home directories、environment variable values、timestamps、stack traces 或 raw process dumps。

### `manifest-schema`（manifest-schema 类别）

用于 installed manifest/index/schema version shape failures。

Examples（示例）：

- missing schema version
- unsupported manifest/index schema version
- 较旧 incompatible schema version 需要 migration
- malformed required manifest field
- 阻塞 installed-state reads 的 schema corruption

Default severity（默认严重级别）：

- 当 required runtime contract 缺失或损坏时为 `critical`
- 当 installed metadata unreadable 导致 validation 无法完成时为 `error`

Reserved MVP issue ids：

- `manifest-schema.missing-version`
- `manifest-schema.unsupported-version`
- `manifest-schema.migration-needed`
- `manifest-schema.malformed-field`
- `manifest-schema.schema-corruption`

`manifest-schema.migration-needed` details 必须包含：

- `currentSchemaVersion`
- `supportedSchemaVersion`
- `migrationKind`: `manual` | `automated-available` | `unsupported`
- `manualActionRequired`: boolean

MVP producers 只能输出 `migrationKind: "manual"` 或 `"unsupported"`。`"automated-available"` 是 forward-compatible enum value，只有 Post-MVP migration tooling 明确实现并更新本 SPEC 后才能由 producer 输出。

Details 不得包含 absolute paths、timestamps、free-form stack traces 或 environment-specific text。

### `source-integrity`（source-integrity 类别）

用于 installed files 被信任可写入之前的 source resolver 或 install planning issues。

Examples（示例）：

- missing integrity evidence
- hash mismatch
- lock mismatch
- unsupported source
- floating Git source without resolved commit SHA
- local source 指向 target project 内的 installed-state、execution-plane、workflow-output、dependency、cache、temporary 或 build directory
- Post-MVP source policy rejection
- registry unreachable
- authentication required
- unreadable local tarball
- unreadable offline bundle

Default severity（默认严重级别）：

- 当 install/update 必须在写入前停止时为 `error`

不要用于 installed file drift。应改用 `file-integrity` 或 `ide-mirror`。

Reserved MVP issue ids：

- `source-integrity.missing-evidence`
- `source-integrity.hash-mismatch`
- `source-integrity.lock-mismatch`
- `source-integrity.unsupported-source`
- `source-integrity.floating-git-source`
- `source-integrity.policy-rejected`
- `source-integrity.registry-unreachable`
- `source-integrity.authentication-required`
- `source-integrity.offline-bundle-unreadable`
- `source-integrity.tarball-unreadable`
- `source-integrity.local-source-self-reference`

Credentials、registry tokens、proxy secrets 和 credential-bearing URLs 必须从 `details`、`impact` 和 `suggestedNextStep` 中 redacted。

`source-integrity.local-source-self-reference` details 必须至少包含 `reason: "local-source-self-reference"` 和 `blockedRootKind`。`blockedRootKind` 必须是稳定枚举值，例如 `installed-state`、`execution-plane`、`workflow-output`、`dependency`、`cache`、`temporary` 或 `build-output`；不得包含 raw absolute path、home directory、checkout root、cache path 或 temporary path。

当 local source 指向 target project blocked roots 时，producer 必须使用 `source-integrity.local-source-self-reference`，不得回退到 `source-integrity.unsupported-source`。`source-integrity.unsupported-source` 只用于 source type、source selector 或 source policy shape 不被 MVP 支持且没有更具体 reserved issue id 的场景。

### `ide-mirror`（ide-mirror 类别）

用于 IDE execution-plane mirror problems。

Examples（示例）：

- target mirror missing a canonical skill
- target mirror content hash differs from canonical package hash
- duplicate target entry for one canonical skill
- target directory cannot represent required self-contained skill entry
- existing project-level hook config requires manual merge before installer can add SpecLite Flow Gate enforcement

Default severity（默认严重级别）：

- 当 IDE entry unusable 或检测到 content drift 时为 `error`
- 当某个 target 因 adapter declaration unsupported，但其他 targets 仍有效时为 `warning`

如果用户显式选择某个 target 且该 target unsupported，则 issue 为 `error`。如果 target 未被选择，或对 current module set 来说是 optional，则 adapter-declared unsupported status 可以是 `warning` 或 `info`。

Reserved MVP issue ids：

- `ide-mirror.missing-entry`
- `ide-mirror.hash-mismatch`
- `ide-mirror.duplicate-entry`
- `ide-mirror.unsupported-target`
- `ide-mirror.target-write-failed`
- `ide-mirror.hook-config-conflict`

`ide-mirror.hook-config-conflict` 用于 `.claude/settings.json`、`.codex/hooks.json` 或 future contracted hook config 已存在且 installer 不能证明 safe merge 的场景。Producer 必须保留既有文件，输出 deterministic `manualAction`，并不得把用户已有 hook、rule、setting 或 trust decision 静默覆盖。

### `runtime-path`（runtime-path 类别）

用于 generated runtime path 或 resolver entry problems。

Examples（示例）：

- missing `_speclite` runtime entry
- generated runtime script path is invalid
- installed skill points to an old resolver/runtime path
- runtime path escapes the target project through a symlink

Default severity（默认严重级别）：

- 当 installed skills 无法 resolve required runtime configuration 时为 `critical`
- 当某个 runtime entry 损坏但 validation 可以继续时为 `error`

Reserved MVP issue ids：

- `runtime-path.missing-entry`
- `runtime-path.invalid-script-path`
- `runtime-path.legacy-resolver-path`
- `runtime-path.symlink-escape`

### `menu-target`（menu-target 类别）

当 help/menu/discovery metadata 无法 resolve 到且仅到一个 installed skill entry 时使用。

Examples（示例）：

- menu target missing
- menu target resolves to multiple installed entries
- help index references unknown `canonicalSkillId`
- phase coverage row has no mapped target

Default severity（默认严重级别）：

- missing 或 ambiguous activation target 为 `error`
- optional target 因 adapter declaration unsupported 时为 `warning`

如果用户显式选择某个 target，而 required menu target 无法为该 target 表示，则 issue 为 `error`。Optional unsupported targets 可以保持为 `warning`。

Reserved MVP issue ids：

- `menu-target.missing-target`
- `menu-target.ambiguous-target`
- `menu-target.unknown-skill`
- `menu-target.no-mapped-target`
- `menu-target.phase-entry-gap`

### `legacy-namespace`（legacy-namespace 类别）

用于可能导致 duplicate loading 或 user confusion 的 stale old namespaces 或 legacy generated structures。

Examples（示例）：

- old runtime namespace residue
- stale copied skill entry that overlaps canonical id
- legacy config path still referenced by installed skill

Default severity（默认严重级别）：

- 当 residue inert 但有风险时为 `warning`
- 当 duplicate loading 或 wrong activation 可能发生时为 `error`

Reserved MVP issue ids：

- `legacy-namespace.runtime-residue`
- `legacy-namespace.stale-skill-entry`
- `legacy-namespace.legacy-config-reference`

### `artifact-path`（artifact-path 类别）

用于 workflow artifact repository 和 configured output path problems。

Examples（示例）：

- configured output path escapes project boundary
- configured output path still contains an unresolved placeholder token
- configured output path escapes project boundary through a symlink
- `_speclite-output` missing when required
- expected artifact directory unwritable
- skill artifact fixture fails to write expected artifact

Default severity（默认严重级别）：

- 当 workflow output 无法写入时为 `error`
- 当 optional artifact path 缺失但 workflow 可以继续时为 `warning`
- 当 contracted artifact 只是尚未产出，而不是既有流程出现缺口时为 `info`

Reserved MVP issue ids：

- `artifact-path.escapes-project`
- `artifact-path.unresolved-token`
- `artifact-path.config-artifact-mismatch`
- `artifact-path.symlink-escape`
- `artifact-path.missing-required-directory`
- `artifact-path.unwritable-directory`
- `artifact-path.fixture-write-failed`
- `artifact-path.missing-required-artifact`
- `artifact-path.missing-required-metadata`
- `artifact-path.invalid-required-metadata`
- `artifact-path.ambiguous-subject-document-shape`
- `artifact-path.invalid-sharded-document-shape`
- `artifact-path.broken-shard-reference`
- `artifact-path.subject-document-missing`
- `artifact-path.prd-validation-report-exists`

`artifact-path.missing-required-artifact` 用于 contracted artifact output path 下没有发现 workflow artifact。它必须区分“尚未产出”与“缺失”两种状态，且在两种状态下保持同一个 `issueId` 与同一个 `affectedPath`：

| State（状态） | Condition（条件） | `severity` | `details.reason` |
| --- | --- | --- | --- |
| Not yet produced（尚未产出） | 已解析的 artifact root 目录存在，且该 artifact root 下当前没有发现任何 workflow artifact。 | `info` | `not-yet-produced` |
| Missing（缺失） | artifact root 下已经存在其它 workflow artifact，但本 contract 的 output path 下没有发现 artifact。 | `warning` | `no-artifacts-found` |

`not-yet-produced` 表示 pristine install 或 workflow 尚未运行，不得被解释为 process gap；因此 pristine fresh install 后 `validate` 不得因为这些 entry 产生 warning 或 error。`no-artifacts-found` 表示项目已经在产出 workflow artifacts，但该 contract 仍未覆盖，属于真实 process gap。`artifact-root-resolver` 产生的 `reason: "missing-required-config"` 不属于上述两种状态，语义与 severity 保持不变。Details 必须保持 deterministic：只允许 `artifactType` 与稳定 `reason`，不得包含 absolute path、home directory、timestamp、stack trace 或随机值。

`artifact-path.unresolved-token` details 必须使用 deterministic fields，例如 `field` 和 `reason: "unresolved-token"`；不得包含 raw path value、absolute path、home directory、drive letter、temporary/cache path、credential-bearing URL、timestamp、stack trace 或随机值。

`artifact-path.config-artifact-mismatch` 用于已解析 config root 与实际发现的 workflow-owned artifact path 不一致，但 artifact path 仍位于 target project 内的场景。Producer 必须保持 read-only，只报告 diagnostic，不得移动、复制、重命名、删除、重写 config 或 artifact，也不得宣称 migration。Details 必须至少包含 `field`、`configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode` 和 `reason: "config-artifact-mismatch"`；当 bounded diagnostic probes 发现多个候选时，必须按 owner contract 声明顺序记录 `candidatePaths`，不得把任何候选作为 fallback 消费。PRD/Epics/Architecture subject-document discovery 的 probe set 由 `SPEC 09` 限定。这些 path 必须是 project-relative POSIX path，不得包含 absolute path、home directory、drive letter、temporary/cache path、credential-bearing URL、timestamp、stack trace 或随机值。

PRD、Epics 与 Architecture 的 whole/sharded discovery blocking states 必须使用以下 stable IDs：

- `artifact-path.ambiguous-subject-document-shape`：whole 与有效 sharded shape 共存，但当前 invocation 未提供显式 selection。
- `artifact-path.invalid-sharded-document-shape`：subject directory 中存在 shard candidates 但缺少 canonical `index.md`，或 canonical index 缺失时的必要 shard-candidate enumeration 无法完成。后者必须使用稳定 `reason=shard-candidate-scan-unreadable`、`discoveryShape=invalid-sharded`、`entryKind=shard-candidate-scan` 与 `entryState=unreadable`，只记录实际失败目录的 project-relative POSIX evidence。
- `artifact-path.broken-shard-reference`：`index.md` 声明的 shard 缺失、不可读或越出 authoritative subject directory，包括通过 symlink 越界；也用于 bounded Markdown link grammar 中 malformed destination、undefined reference-style link 或 unsupported local-ish destination，details 必须记录 `referenceKind`。
- `artifact-path.subject-document-missing`：canonical whole 与有效 sharded input 均不存在，invocation 显式选择的 shape 不存在，或 canonical whole entry 存在但为 non-file/unreadable（稳定 `reason=canonical-whole-unreadable`）。

这些 discovery issues 的 severity 必须为 `error`，continuation 必须为 `block`，且 resolver/consumer 在返回 issue 前后必须保持零 artifact write 与零 progress mutation。Details 必须使用 project-relative POSIX evidence，并至少记录 `resolvedRoot`、`resolutionMode`、`actualConsumedPath`（block 时为安全的 subject/index evidence path）、`discoveryShape`、`ambiguityStatus`、`selectionSource` 与 stable `reason`；`artifact-path.broken-shard-reference` 还必须记录 `referenceKind`。Canonical whole document 或 canonical `index.md` 自身通过 symlink 越出 authoritative subject directory 时，必须使用既有 `artifact-path.symlink-escape`，不得映射为 `broken-shard-reference`。不得包含 absolute path、home directory、drive letter、temporary/cache path、credential-bearing URL、timestamp、stack trace 或随机值。

`artifact-path.prd-validation-report-exists` 用于 `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` 在本次 PRD validation 首次 report/progress write 前已存在的同日冲突。Severity 必须为 `error`，continuation 必须为 `block`，`affectedPath` 必须是该 exact project-relative target，details 必须使用 `reason: "prd-validation-report-exists"`，`suggestedNextStep` 必须精确为“保留并移走或删除既有报告后重新运行”。Producer 不得读取内容后复用、overwrite、append、truncate、delete、产生 suffix/temp report 或更新 progress；即使内容看似相同也必须阻断。

### `file-integrity`（file-integrity 类别）

用于 installed file、files index、installer-owned drift 或 generated metadata/control file hash mismatch。

Examples（示例）：

- installed file hash differs from files index
- files index references a missing installer-owned file
- manifest-generated control file drift
- installer-owned file ownership cannot be established
- case-insensitive path conflict
- executable bit or file mode drift
- stale safe-write temp file

Default severity（默认严重级别）：

- 阻塞 update safety 的 drift 为 `error`
- unsafe overwrite risk 或 schema corruption 为 `critical`
- 需要 manual cleanup 但本身不能证明 installed content drift 的 stale temp files 为 `warning`
- 阻塞 safe-write target naming、rename 或 safe mutation 的 stale temp files 为 `error`

Reserved MVP issue ids：

- `file-integrity.hash-mismatch`
- `file-integrity.missing-installer-owned-file`
- `file-integrity.control-file-drift`
- `file-integrity.unknown-ownership`
- `file-integrity.unsafe-overwrite-risk`
- `file-integrity.case-conflict`
- `file-integrity.executable-bit-mismatch`
- `file-integrity.stale-temp-file`

`file-integrity.unknown-ownership` 只用于 installer-controlled space 内 ownership 无法建立的 files index entry。判定必须复用 ownership model 的 path classification：当 entry 的 `ownership` 不是 `installer-owned`，且该 path 的 classification 结果为 `unknown`（包括 path escape 与不属于任何已声明 human-owned custom path、installer-owned path 或 workflow artifact root 的 path）时，才报告该 issue。安装器合法登记的 protected entry 不得触发它：files index 中 `ownership` 为 `human-owned` 或 `workflow-owned`，且 path classification 给出同为 protected 的 ownership 的 entry（例如 `artifactKind: "project-custom-stub"` 的 `_speclite/custom/*.toml`、`artifactKind: "gitignore"` 的 `.gitignore`，以及 workflow artifact root 下的 workflow-owned entry）属于 expected pristine install state，必须保持无 issue。Files index 记录为 `installer-owned` 但 classification 为 protected 的 entry 仍由 `file-integrity.unsafe-overwrite-risk` 覆盖，不得改用本 issue。

### `operation-lock`（operation-lock 类别）

用于阻止 write-capable commands 安全 planning 或 applying changes 的 project-level SpecLite operation lock problems。

Examples（示例）：

- another install/update/repair is active
- stale `_speclite/.lock` requires manual cleanup

Default severity（默认严重级别）：

- 当 write-capable command 无法获取 project operation lock 时为 `error`
- 当 validate 观察到 stale lock 但没有尝试写入时为 `warning`

Reserved MVP issue ids：

- `operation-lock.project-locked`
- `operation-lock.stale-lock`

### `update`（update 类别）

用于汇总 path-level conflicts 的 command-level update 或 repair planning blockers。

Examples（示例）：

- update plan contains one or more path-level conflicts
- repair plan contains blockers that cannot be safely repaired

Default severity（默认严重级别）：

- 当 update 或 repair 无法作为 successful plan 继续时为 `error`

Reserved MVP issue ids：

- `update.conflicts`

当问题是 target-specific 时，IDE mirror content drift 可以使用 `ide-mirror`；当问题是 generic installed file/hash mismatch 时，使用 `file-integrity`。不要在两个 categories 中重复同一个 finding。

## Fixture Policy（Fixture 策略）

每条 validation rule 必须拥有至少一个 fixture assertion，覆盖：

- `issueId`
- `category`
- `severity`
- `affectedPath` or `component`
- deterministic `details`
- stable `impact`
- stable `suggestedNextStep`

新增 validation categories 需要先更新本 SPEC，再 implementation。Existing categories 下的新增 issue ids 需要在同一变更中更新 fixtures。
