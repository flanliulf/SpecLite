# Validation Issues（校验问题）

本文记录 SpecLite CLI 的 `ValidationIssue` 分类、稳定 issue id 与处理建议。它回答“`--json` 输出或 human-readable `Issues` 里的这个 issueId 是什么意思，下一步该做什么”。

事实锚点是 `src/validation/issue-model.ts`（category 枚举与 reason codes）、`src/diagnostics/command-result-schema.ts`（issue schema）以及各 `src/validation/rules/*.ts` 与命令实现。本文只列出当前源码中实际存在的 id；新增 issue id 时先更新 owning SPEC 与 schema，再更新本文。

## Issue Model（Issue 模型）

每条 issue 的稳定字段如下。`--json` 输出中它们位于 `issues[]`；human-readable 输出把同一字段渲染为 `[severity] severity=… category=… issueId=… location=… affectedPath=… details=… impact=… suggestedNextStep=…` 一行。

| Field | Meaning |
|---|---|
| `severity` | `critical`、`error`、`warning` 或 `info`。只有 `warning` 及以上会让 `validate` 视为未通过；`info` 不影响通过判定。 |
| `category` | 固定枚举，见下表；`issueId` 必须以 `<category>.` 开头。 |
| `issueId` | 稳定标识，供自动化按 id 判断，不要按 `impact` 文案判断。 |
| `affectedPath` | project-relative POSIX path，或 `.` 表示项目根；不暴露本机绝对路径。 |
| `details` | 可选的结构化补充，例如 `artifactType`、`reason`、`field`、`resolutionMode`。 |
| `impact` / `suggestedNextStep` | 面向人的解释与建议，随 locale 变化，不作为 contract。 |

## Categories（分类）

| Category | Checked by `validate` | Scope |
|---|---|---|
| `environment` | 否 | Node.js 版本与平台预检，在命令入口触发。 |
| `manifest-schema` | 是 | `_speclite/_config/manifest.yaml` 与 index 文件的 schema 与版本。 |
| `source-integrity` | 是 | source descriptor、trust status、hash / lock evidence 与远程访问授权。 |
| `ide-mirror` | 是 | `.claude/skills/`、`.agents/skills/` 与 canonical projection 的一致性。 |
| `runtime-path` | 是 | installed runtime metadata 中的路径合法性与 legacy namespace。 |
| `menu-target` | 是 | help / menu / phase coverage 与已安装 Skill entry 的映射。 |
| `legacy-namespace` | 是 | 旧 runtime 残留与 stale skill entry。 |
| `artifact-path` | 是 | artifact root 解析、workflow artifact 目录、metadata 与 document shape。 |
| `file-integrity` | 是 | ownership、hash、安全写入与 temp file。 |
| `operation-lock` | 否 | `_speclite/.lock` project operation lock，由写入类命令触发。 |
| `update` | 否 | update / repair plan 的 conflict 与 postcondition，由 `update` 触发。 |

`validate` 的 human-readable `Scope` 会同时列出已检查与未检查的 categories，方便判断某类问题是否在本次检查范围内。

## Environment And Source（环境与来源）

以下 issue 在命令入口、manifest 读取和 source 解析阶段产生，通常意味着安装前提不成立。

### Environment（环境）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `environment.unsupported-node` | `error` | 当前 Node.js 低于最低支持版本（`>=22`）。 | 升级到 Node.js 22 LTS 或推荐的 24 LTS 后重试。 |
| `environment.unsupported-platform` | `error` | 当前平台不在支持范围内。 | 在受支持的 local-first filesystem 环境中运行。 |

### Manifest Schema（Manifest 结构）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `manifest-schema.unreadable` | `error` | installed manifest 缺失或不可读。 | 恢复 `_speclite/_config` 后重新运行 `speclite install --yes`。 |
| `manifest-schema.missing-version` | `critical` | manifest 缺少 `schemaVersion`。 | 用受支持的 SpecLite 版本重新生成 manifest。 |
| `manifest-schema.unsupported-version` | `error` / `critical` | manifest 可读，但 schema 版本不受支持。 | 用受支持的 SpecLite 版本重新生成 manifest。 |
| `manifest-schema.schema-corruption` | `critical` | installed-state metadata 无法安全读取。 | 先运行 `speclite validate` 或人工检查 installed metadata。 |
| `manifest-schema.malformed-field` | `error` / `critical` | manifest 或 index 中某个字段形状不符合 contract，例如 artifact root 投影与 install path 不一致。 | 重新运行 `speclite install --yes` 重新生成 manifest 与 artifact root 目录。 |
| `manifest-schema.invalid-files-index` | `error` | `files-index.json` 不可读，`uninstall` 无法判定 installer-owned 边界。 | 恢复 `_speclite/_config/files-index.json`，或人工检查后再 uninstall。 |
| `manifest-schema.migration-needed` | — | installed manifest 需要迁移到当前 contract。 | 运行 `speclite update`，查看 recoverable canonical inventory migration plan。 |

### Source Integrity（来源完整性）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `source-integrity.unsupported-source` | `error` | source type 或 module selection 不受支持，例如未知 module id。 | 只选择官方 module 列表中的 id，或使用受支持的 source type。 |
| `source-integrity.missing-source-descriptor` | `error` | update 需要可读的 installed source descriptor。 | 恢复 `_speclite/_config/manifest.yaml` 的 `sourceDescriptor`。 |
| `source-integrity.malformed-source-descriptor` | `error` | installed source descriptor 格式错误。 | 修复 manifest 中的 `sourceDescriptor` 后重新规划 update。 |
| `source-integrity.missing-evidence` | `error` | bundled official source 缺少可复现的 packaging evidence。 | 恢复 `package-lock.json` 或补充 packaging evidence anchor。 |
| `source-integrity.missing-source-evidence` | `error` | update 写入后无法持久化 files-index 投影，或 planning 缺少 source evidence。 | 运行 `speclite validate`，恢复 `files-index.json` 后重新 update。 |
| `source-integrity.blocked-source` | `error` | source descriptor 处于 blocked trust status，不能进入写入阶段。 | 先解决 source-integrity 问题，再授权 install / update 写入。 |
| `source-integrity.floating-git-source` | `error` | git source 未 pin 到已验证 commit。 | 把 git source pin 到 verified commit 后重新规划。 |
| `source-integrity.hash-mismatch` | `error` | 解析到的 source 内容与记录的 hash 不一致。 | 检查 source 内容或 lock evidence，避免使用被篡改的来源。 |
| `source-integrity.lock-mismatch` | `error` | lock evidence 与 source 不一致。 | 更新或恢复 lock evidence 后重试。 |
| `source-integrity.authentication-required` | — | registry 或 git source 需要认证。 | 配置认证后重试；SpecLite 不代为保存凭据。 |
| `source-integrity.registry-unreachable` | — | registry source 无法访问。 | 检查网络或改用 bundled / local source。 |
| `source-integrity.tarball-unreadable` | — | local tarball 无法读取。 | 检查 tarball 路径与权限。 |
| `source-integrity.offline-bundle-unreadable` | — | offline bundle 无法读取。 | 检查 bundle 路径与完整性。 |
| `source-integrity.local-source-self-reference` | — | local source 指向目标项目自身。 | 改用独立的 source 路径。 |
| `source-integrity.external-access-not-authorized` | `error` | `doctor --revalidate-source` 未获显式授权，不执行远程 revalidation。 | 确认外部访问意图后加 `--yes` 重新运行 `doctor`。 |

## Installed Runtime（已安装运行时）

以下 issue 描述 installed projection 与 canonical source、index 与 menu 之间的漂移。

### IDE Mirror（IDE 镜像）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `ide-mirror.missing-entry` | `error` | 选中的 IDE target 缺少某个已安装 Skill entry。 | 运行 `speclite install --yes` 或 `speclite update --repair --yes` 恢复。 |
| `ide-mirror.hash-mismatch` | — | IDE mirror 内容与 canonical package hash 不一致。 | 用 `speclite update --repair` 预览并修复 installer-owned drift。 |
| `ide-mirror.duplicate-entry` | — | 同一 Skill id 在 mirror 中出现多次。 | 重新生成 index 并移除重复投影。 |
| `ide-mirror.unsupported-target` | `error` | 选择了不受支持的 IDE target。 | 使用 `claude` 或 `agents`。 |
| `ide-mirror.source-read-failed` | `error` | canonical package 读取失败，无法证明投影。 | 恢复可读的 canonical package 文件后重试。 |
| `ide-mirror.target-write-failed` | `error` | IDE mirror 写入失败。 | 检查目标路径权限后重试。 |
| `ide-mirror.hook-config-conflict` | `error` | 目标项目已有 `.claude/settings.json` 或 `.codex/hooks.json`，SpecLite 不覆盖。 | 保留既有 hooks，手动加入 SpecLite hook 命令后重新运行 install。 |

### Runtime Path（运行时路径）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `runtime-path.missing-entry` | `error` | files-index 缺少必需的 runtime metadata；`resolve` 参数缺失或非法时也复用此 id（`details.status="invalid-args"`）。 | 重新生成 installed runtime metadata；`resolve` 场景检查命令参数。 |
| `runtime-path.missing-required-path` | `error` | installed-state readiness 需要的本地 runtime path 缺失。 | 恢复该路径或重新运行 `speclite install --yes`。 |
| `runtime-path.invalid-script-path` | — | runtime path 不是项目内的 project-relative POSIX path。 | 用 project-relative POSIX path 重新生成 runtime metadata。 |
| `runtime-path.legacy-resolver-path` | — | runtime metadata 指向非当前 namespace，例如把 Python resolver 当作默认 resolver。 | 用当前 SpecLite namespace 重新生成 runtime metadata。 |
| `runtime-path.symlink-escape` | `critical` | runtime target 是逃逸项目边界的 symlink。 | 选择真实的项目目录。 |

### Menu Target（菜单目标）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `menu-target.unknown-skill` | `error` | help / menu metadata 引用了未从 source 安装的 canonical Skill。 | 修复 `module-help.csv`，保证每个 entry 对应恰好一个 package root。 |
| `menu-target.missing-target` | `error` | canonical package 缺少 `SKILL.md`，无法映射。 | 在 canonical source 中恢复 `SKILL.md`。 |
| `menu-target.no-mapped-target` | `error` | phase coverage 行没有映射到已安装 IDE target。 | 从 installed skill target metadata 重新生成 `help-index.json` 与 `phase-coverage.json`。 |
| `menu-target.ambiguous-target` | `error` | 一个 help / menu entry 解析到多个已安装 entry。 | 重新生成 index 并移除重复投影。 |
| `menu-target.phase-entry-gap` | `warning` | 某个 process phase entry 未映射到已安装 target；由 `governance-report` 报告。 | 安装或选择覆盖该阶段的 module。 |

### Legacy Namespace（遗留命名空间）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `legacy-namespace.runtime-residue` | `error` | 旧 runtime namespace 与当前 runtime lookup path 重叠。 | 人工检查并清理 legacy runtime 残留后重新 validate。 |
| `legacy-namespace.stale-skill-entry` | `error` | 旧复制的 skill entry 与已安装 canonical Skill id 重叠，可能重复加载。 | 人工检查 stale skill entries 后重新 validate。 |
| `legacy-namespace.legacy-config-reference` | `error` | installed metadata 仍引用 legacy config 或 runtime path。 | 人工更新 legacy 引用后重新 validate。 |

## Artifact Path（产物路径）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `artifact-path.escapes-project` | `error` | 配置的 artifact path 不在目标项目内。 | 使用项目内的 project-relative POSIX path。 |
| `artifact-path.unresolved-token` | `error` | artifact path 含未解析的占位符。 | 改用 project-relative POSIX path，或补齐对应 config 字段。 |
| `artifact-path.symlink-escape` | `error` | artifact root 或 subject document 通过 symlink 逃逸项目边界。 | 修复目录或文档，使其位于项目内。 |
| `artifact-path.config-artifact-mismatch` | `error` | config 中的 root 与实际发现的产物位置不一致；只诊断，不迁移。`details` 含 `field`、`configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode`。 | 以配置的 artifact root 为准，人工决定是否迁移既有产物。 |
| `artifact-path.missing-required-directory` | — | 配置的 artifact root 缺失或不是目录。 | 创建该 artifact root 后再写入产物。 |
| `artifact-path.unwritable-directory` | — | artifact root 存在但不可写。 | 修复目录权限。 |
| `artifact-path.missing-required-artifact` | `info` / `warning` | 契约路径下没有产物。`details.reason=not-yet-produced`（root 存在但尚无任何产物）为 `info`；`no-artifacts-found`（已有其它产物但本契约路径为空）为 `warning`。 | 在对应阶段运行会写入该产物的 workflow。 |
| `artifact-path.missing-required-metadata` | — | workflow artifact frontmatter 缺少 `workflowType`、`sourceSkill` 或 `generatedAt`。 | 补齐 metadata 后重新 validate。 |
| `artifact-path.invalid-required-metadata` | — | workflow artifact frontmatter 无法解析。 | 用合法 YAML frontmatter 重新生成 metadata。 |
| `artifact-path.ambiguous-subject-document-shape` | `error` | PRD / Epics / Architecture 同时存在 whole 与 sharded 且无显式 selection。 | 传入 `--selection whole|sharded`，或整理为单一 shape。 |
| `artifact-path.invalid-sharded-document-shape` | `error` | sharded document 的 `index.md` 或 shard graph 不合法，或 shard candidate scan 目录不可读。 | 修复 `index.md` 声明与 shard 文件后重试。 |
| `artifact-path.broken-shard-reference` | `error` | `index.md` 引用的 shard 缺失、越界、不可读或引用格式不受支持；`details.referenceKind` 说明类型。 | 修复或移除失效引用。 |
| `artifact-path.subject-document-missing` | `error` | 请求的 subject document 不存在。 | 先运行生成该文档的 workflow。 |
| `artifact-path.fixture-write-failed` | — | 仅在类型声明中保留，当前源码没有产出点。 | 无需处理。 |

`artifact-path.prd-validation-report-exists` 不属于 CLI `ValidationIssue` taxonomy；它由 `speclite-validate-prd` 的 Skill-private script 在同日报告已存在时发出，见 [`workflow-artifact-layout.md`](workflow-artifact-layout.md)。

## Write Safety（写入安全）

以下 issue 由 ownership、hash、lock 与 update plan 的安全写入规则产生。

### File Integrity（文件完整性）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `file-integrity.unknown-ownership` | — | ownership classifier 无法判定某个已索引路径的 ownership。fresh install 登记的 human-owned custom stub 与 `.gitignore` 属预期状态，不触发此 issue。 | 检查 files-index 条目与实际文件后决定归属。 |
| `file-integrity.hash-mismatch` | `error` | installer-owned 文件内容与记录 hash 不一致，或被修改的历史 canonical package 无法安全重投影。 | 用 `speclite update --repair` 预览修复；rename 场景先审阅历史包变更。 |
| `file-integrity.missing-installer-owned-file` | — | files-index 记录的 installer-owned 文件缺失。 | 用 `speclite update --repair --yes` 恢复。 |
| `file-integrity.unsafe-overwrite-risk` | — | 计划写入的路径不在项目内，或与既有非 SpecLite 文件冲突。 | 检查目标路径后再授权写入。 |
| `file-integrity.case-conflict` | — | 计划写入路径与既有路径仅大小写不同。 | 处理大小写冲突后重试。 |
| `file-integrity.stale-temp-file` | `error` | 残留 `.speclite-tmp` 临时文件。 | 确认没有进行中的写操作后手动删除。 |
| `file-integrity.recovery-blocked` | `error` | recoverable update 无法证明每个 target 处于旧态或新态。 | 检查 `_speclite/_config/.update-journal.json` 与受影响文件，恢复可证明状态后重跑。 |
| `file-integrity.uninstall-remove-failed` | `error` | uninstall 授权后无法移除某个 installer-owned 路径。 | 检查路径权限后重新运行 uninstall。 |

### Operation Lock（操作锁）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `operation-lock.project-locked` | `error` | 另一个写入类 SpecLite 命令持有 `_speclite/.lock`。 | 等待其结束，或检查 `_speclite/.lock` 后再手动清理。 |
| `operation-lock.stale-lock` | `warning` | 上一次写入类命令可能未释放 lock。 | 确认没有进行中的写操作后手动删除 `_speclite/.lock`。 |
| `operation-lock.required-step-failed` | `error` | install 的必需 lifecycle step 失败，ReadyCheck 无法继续。 | 解决失败 step 后重新运行 `speclite install --yes`。 |

### Update（更新）

| Issue ID | Severity | Meaning | Suggested Next Step |
|---|---|---|---|
| `update.conflicts` | `error` | update / repair plan 存在无法自动处理的 path-level conflict；`details.conflictCount` 给出数量，`data.conflicts[]` 给出明细。 | 先解决 conflict，再授权写入；不要用 `--yes` 绕过。 |
| `update.repair-postcondition` | `error` | repair 写入后的 postcondition 校验失败。 | 运行 `speclite validate` 检查受影响路径。 |

`update.repair` 是 `update --repair` 的 command id，不是 issue id。

## Update Reason Codes（更新原因码）

`data.conflicts[].reason` 与 plan entry 的 `reason` 使用以下稳定值：

| Reason | Meaning |
|---|---|
| `unchanged` | 内容与期望一致，无需写入。 |
| `installer-owned-drift` | installer-owned 文件发生漂移，可由 update 或 repair 恢复。 |
| `human-owned` / `workflow-owned` | protected ownership，在 plan 中为 `action: "skip"`，不是 conflict。 |
| `unknown-ownership` | 无法判定 ownership，作为 conflict 阻断。 |
| `missing-source-evidence` | 缺少 source evidence，作为 conflict 阻断。 |
| `unsupported-repair` | 该路径不支持自动 repair。 |
| `not-authorized` | 未授权写入。 |

`update` 的 plan entry 与 prerequisite conflict 还可能出现更细的 reason，例如 `canonical-skill-renamed`、`missing-files-index-entry`、`unknown-module-selection`、`missing-module-dependency`。它们由 `src/update/update-plan.ts` 定义，schema 只约束形状，不枚举全部值。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| CommandResult JSON 参考 | [`command-result-json.md`](command-result-json.md) |
| 规范性说明 | [`specs/command-result-json-contract.md`](specs/command-result-json-contract.md) |
| CLI 参数参考 | [`cli.md`](cli.md) |
| 安装验证操作 | [`../how-to/validate-installation.md`](../how-to/validate-installation.md) |
| 更新与修复操作 | [`../how-to/update-and-repair.md`](../how-to/update-and-repair.md) |
| 文件所有权解释 | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| Workflow 产物目录 | [`workflow-artifact-layout.md`](workflow-artifact-layout.md) |
