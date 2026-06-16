export type CliLocale = "zh-CN" | "en-US";

export type CliMessageKey =
  | "summary"
  | "scope"
  | "state"
  | "evidence"
  | "issues"
  | "nextActions"
  | "outcome"
  | "emptyState"
  | "completed"
  | "writes"
  | "userAction"
  | "completedYes"
  | "completedNo"
  | "writeNone"
  | "writeChanged"
  | "actionRequired"
  | "actionNotRequired"
  | "readyState"
  | "readyYes"
  | "readyNo"
  | "installOutcomePrewritePaused"
  | "installOutcomeBlockedBeforeWrite"
  | "installOutcomeWriteFailed"
  | "installOutcomeReadyCheckFailed"
  | "installOutcomeReady"
  | "installSummaryPrewritePaused"
  | "installSummaryBlockedBeforeWrite"
  | "installSummaryWriteFailed"
  | "installSummaryReadyCheckFailed"
  | "installSummaryReady"
  | "installActionFixBlockerBeforeYes"
  | "installActionInspectCompletedWrites"
  | "installActionFixReadyCheck"
  | "statusOutcomeInstalled"
  | "statusOutcomeNotInstalled"
  | "statusOutcomePartial"
  | "statusOutcomeFailed"
  | "statusOutcomeStale"
  | "statusOutcomeUnknown"
  | "validateOutcomeValid"
  | "validateOutcomeValidWithWarnings"
  | "validateOutcomeInvalid"
  | "validateOutcomeCannotValidate"
  | "noIssues"
  | "noConflicts"
  | "noPlannedWrites"
  | "noCheckedItems"
  | "validateNoIssuesForCheckedCategories"
  | "validateNoConflicts"
  | "validateNoCategoriesChecked"
  | "validateSkippedCategoriesCaveat"
  | "statusSummaryInstalled"
  | "statusSummaryNotInstalled"
  | "statusSummaryStale"
  | "statusSummaryPartial"
  | "statusSummaryFailed"
  | "statusSummaryUnknown"
  | "validateSummaryValid"
  | "validateSummaryValidWithWarnings"
  | "validateSummaryInvalid"
  | "validateSummaryCannotValidate"
  | "updateSummaryPlanReady"
  | "updateSummaryRepairPlanReady"
  | "updateSummaryNoOp"
  | "updateSummaryBlockedByConflict"
  | "updateSummaryApplied"
  | "updateSummaryPartialOrFailed"
  | "nextActionNone"
  | "installActionRunYes"
  | "installActionRunInteractive"
  | "installActionFixBlockerThenRunYes"
  | "installActionInspectCompletedThenValidate"
  | "installActionFixReadyThenInstallOrValidate"
  | "statusActionInstall"
  | "statusActionInspectIdeThenValidate"
  | "statusActionInspectManifestThenValidate"
  | "statusActionValidateFreshness"
  | "statusActionRestoreMetadata"
  | "validateActionContinue"
  | "validateActionRestoreMetadata"
  | "validateActionRerunAfterIssues"
  | "updateActionResolveBlocker"
  | "updateActionReviewPlanAuthorize"
  | "updateActionReviewRepairAuthorize"
  | "updateActionInspectCompleted"
  | "updateActionValidateAfterWrites"
  | "updateActionStatusAfterWrites"
  | "issueActionBlocking"
  | "issueActionNonBlocking"
  | "resolveActionWarnings"
  | "resolveActionUnresolved"
  | "resolveActionSupportedShape"
  | "commandStatus"
  | "statusLabel"
  | "commandStatusStatusNote"
  | "highLevelHealth"
  | "targetProject"
  | "targetPath"
  | "commandCwd"
  | "projectRoot"
  | "installLocation"
  | "manifestVersion"
  | "source"
  | "externalAccess"
  | "manifest"
  | "installedModules"
  | "ideTargets"
  | "installIdeTargets"
  | "ideTargetStatuses"
  | "keyPaths"
  | "checkedCategories"
  | "notCheckedCategories"
  | "checkedTargets"
  | "validatedPaths"
  | "issueCounts"
  | "issueFields"
  | "issueImpactSummary"
  | "issueManualActionLocalized"
  | "outputProfile"
  | "evidenceProfile"
  | "mode"
  | "planStatus"
  | "authorization"
  | "updatePlanEffects"
  | "repairPlanEffects"
  | "changedPaths"
  | "skippedPaths"
  | "remainingConflicts"
  | "conflicts"
  | "protectedBoundaries"
  | "noPathsChangedYet"
  | "noPathsSkippedDuringApply"
  | "noRemainingConflicts"
  | "noConflictsDetectedSentence"
  | "conflictsBlockWriteAuthorizationSentence"
  | "repairWriteIncompleteSentence"
  | "updateWriteIncompleteSentence"
  | "repairWritesAuthorizedSentence"
  | "updateWritesAuthorizedSentence"
  | "repairNoWritesAuthorizedSentence"
  | "updateNoWritesAuthorizedSentence"
  | "noWritesAuthorizedSentence"
  | "stepState"
  | "failedStep"
  | "completedWrites"
  | "completedSteps"
  | "pendingSteps"
  | "executionFailureBoundary"
  | "writeRepairIncompleteSentence"
  | "unexecutedItems"
  | "protectedBoundaryCustom"
  | "protectedBoundaryArtifact"
  | "protectedBoundaryInstallerDrift"
  | "planActionRepair"
  | "planActionWrite"
  | "planActionConflict"
  | "planActionUnchanged"
  | "planActionReviewReason"
  | "conflictActionInstallerOwnedDrift"
  | "conflictActionHumanOwned"
  | "conflictActionWorkflowOwned"
  | "conflictActionUnknownOwnership"
  | "conflictActionMissingSourceEvidence"
  | "conflictActionUnsupportedRepair"
  | "conflictActionNotAuthorized"
  | "conflictActionUnchanged"
  | "conflictActionUnknownReason"
  | "resolveRequestedKey"
  | "resolveRequestedKeyAll"
  | "resolveResolvedLayer"
  | "resolveResolvedLayerNone"
  | "resolveMergedResolverLayers"
  | "resolveSourcePath"
  | "resolveSourcePathNone"
  | "resolveSourcePathMultiple"
  | "resolveSourcePathUnknown"
  | "resolveValueSummary"
  | "resolveValueNotProduced"
  | "resolveValueEmptyObject"
  | "resolveValueObjectWithKeys"
  | "resolveTechnicalIdentifierNote"
  | "resolveOutputMode"
  | "resolveOutputModeHuman"
  | "resolveMachineContract"
  | "resolveMachineContractPureJson"
  | "resolveLegalCommand"
  | "resolveFailedLayer"
  | "resolveReasonCode"
  | "resolveResolvedKeys"
  | "resolveResolvedKeysNone"
  | "resolveSourcePaths"
  | "resolveFallbackSource"
  | "resolveFallbackProjectSearch"
  | "resolveFallbackOptionalLayer"
  | "resolveResolverLayer"
  | "resolveUnresolvedReason"
  | "resolveMissingKey";

export type CliLocaleInput = {
  flag?: string | undefined;
  env?: NodeJS.ProcessEnv | undefined;
};

const SUPPORTED_LOCALES = new Set<CliLocale>(["zh-CN", "en-US"]);

const MESSAGE_CATALOG: Record<CliLocale, Record<CliMessageKey, string>> = {
  "zh-CN": {
    summary: "Summary（摘要）",
    scope: "Scope（范围）",
    state: "State（状态）",
    evidence: "Evidence（证据）",
    issues: "Issues（问题）",
    nextActions: "Next Actions（下一步）",
    outcome: "Outcome（结果）",
    emptyState: "Empty State（空状态）",
    completed: "完成状态",
    writes: "写入状态",
    userAction: "用户动作",
    completedYes: "已完成",
    completedNo: "未完成",
    writeNone: "未写入项目文件",
    writeChanged: "已写入项目文件",
    actionRequired: "需要",
    actionNotRequired: "不需要",
    readyState: "ready 状态",
    readyYes: "ready",
    readyNo: "not ready",
    installOutcomePrewritePaused: "prewrite-paused",
    installOutcomeBlockedBeforeWrite: "blocked-before-write",
    installOutcomeWriteFailed: "write-failed",
    installOutcomeReadyCheckFailed: "ready-check-failed",
    installOutcomeReady: "ready",
    installSummaryPrewritePaused: "本次尚未执行安装，也没有写入任何项目文件。",
    installSummaryBlockedBeforeWrite: "install 在写入阶段前停止，未写入项目文件。",
    installSummaryWriteFailed: "install 已进入写入阶段但失败；项目不能视为 ready。",
    installSummaryReadyCheckFailed: "项目文件已写入，但 ReadyCheck 失败，项目不能视为 ready。",
    installSummaryReady: "安装已完成并通过 ReadyCheck；项目可视为 ready。",
    installActionFixBlockerBeforeYes: "先修复报告的 blocker，再授权 install 写入。",
    installActionInspectCompletedWrites: "重新运行或手动清理前，请检查已完成写入范围。",
    installActionFixReadyCheck: "修复 readiness blocker 后，重新运行 speclite install --yes 或 speclite validate。",
    statusOutcomeInstalled: "installed",
    statusOutcomeNotInstalled: "not-installed",
    statusOutcomePartial: "partial",
    statusOutcomeFailed: "failed",
    statusOutcomeStale: "stale",
    statusOutcomeUnknown: "unknown",
    validateOutcomeValid: "valid",
    validateOutcomeValidWithWarnings: "valid-with-warnings",
    validateOutcomeInvalid: "invalid",
    validateOutcomeCannotValidate: "cannot-validate",
    noIssues: "无问题",
    noConflicts: "无 conflict",
    noPlannedWrites: "无 planned writes",
    noCheckedItems: "无 checked items",
    validateNoIssuesForCheckedCategories: "checked categories 未发现问题",
    validateNoConflicts: "未检测到 conflict",
    validateNoCategoriesChecked: "未检查任何 categories",
    validateSkippedCategoriesCaveat: "上方列出的 skipped / not checked categories 不应被解读为 healthy。",
    statusSummaryInstalled: "installed-state summary 显示 SpecLite 已配置。",
    statusSummaryNotInstalled: "installed-state summary 显示该项目尚未安装 SpecLite。",
    statusSummaryStale: "installed-state summary 可能已过期；请运行 validate 获取诊断。",
    statusSummaryPartial: "installed-state summary 不完整；command success 不代表安装健康。",
    statusSummaryFailed: "已读取 installed-state summary，但安装健康检查失败。",
    statusSummaryUnknown: "installed-state summary 不足以判断健康状态。",
    validateSummaryValid: "已检查 categories 未发现问题。",
    validateSummaryValidWithWarnings: "已检查 categories 存在 warning/info，但没有 blocking error。",
    validateSummaryInvalid: "已检查 categories 存在 error 或 critical issue。",
    validateSummaryCannotValidate: "validate 未能完成足够检查，无法生成完整诊断列表。",
    updateSummaryPlanReady: "update plan 已生成，尚未写入项目文件。",
    updateSummaryRepairPlanReady: "repair plan 已生成；update --repair 是显式修复动作，不是普通 update 的隐藏模式。",
    updateSummaryNoOp: "本次 update/repair 不需要 planned writes。",
    updateSummaryBlockedByConflict: "conflict 阻止写入授权；普通 --yes 不能绕过 conflict。",
    updateSummaryApplied: "已在受保护边界内应用授权写入。",
    updateSummaryPartialOrFailed: "update/repair 写入未完整完成；请检查 completed writes、failed steps、pending steps 与 protected boundaries。",
    nextActionNone: "无需操作。",
    installActionRunYes: "运行 `{command}` 使用默认配置完成安装。",
    installActionRunInteractive: "运行 `{command}` 进入交互模式自定义安装。",
    installActionFixBlockerThenRunYes: "先修复 blocker，再运行 `{command}` 授权写入。",
    installActionInspectCompletedThenValidate: "先检查已完成写入范围，再运行 `{command}` 复查 installed-state。",
    installActionFixReadyThenInstallOrValidate: "修复 readiness blocker 后，运行 `{installCommand}` 或 `{validateCommand}`。",
    statusActionInstall: "运行 `{command}` 配置该项目。",
    statusActionInspectIdeThenValidate: "先检查上方 IDE target 状态，再运行 `{command}` 获取完整诊断。",
    statusActionInspectManifestThenValidate: "先检查上方 manifest/source descriptor 证据，再运行 `{command}` 获取完整诊断。",
    statusActionValidateFreshness: "运行 `{command}` 确认 installed-state freshness，再执行 write-capable command。",
    statusActionRestoreMetadata: "恢复 installed-state metadata，或运行 `{command}` 后再把该项目视为 configured。",
    validateActionContinue: "可以继续执行依赖 installed-state metadata 的本地 workflow 操作。",
    validateActionRestoreMetadata: "恢复 installed-state metadata 后运行 `{command}`。",
    validateActionRerunAfterIssues: "修复上方 issue 后运行 `{command}` 复查 checked categories。",
    updateActionResolveBlocker: "先修复 blocker（affectedPath={affectedPath}; reason={reason}）。",
    updateActionReviewPlanAuthorize: "确认 update plan 后运行 `{command}` 授权 non-conflicting planned writes。",
    updateActionReviewRepairAuthorize: "确认 explicit repair plan 后运行 `{command}` 授权 non-conflicting repair writes。",
    updateActionInspectCompleted: "先检查 completed writes 与 blocker evidence，必要时手动恢复 incomplete steps。",
    updateActionValidateAfterWrites: "运行 `{command}` 验证 installed-state integrity。",
    updateActionStatusAfterWrites: "运行 `{command}` 查看 installed-state summary。",
    issueActionBlocking: "修复 {issueId}（affectedPath={affectedPath}; reason={reason}）。",
    issueActionNonBlocking: "检查 {issueId}（affectedPath={affectedPath}; reason={reason}）。",
    resolveActionWarnings: "检查 warning issue；如果 optional resolver layer 应有值，请修复对应 layer。",
    resolveActionUnresolved: "检查 requested dotted key，或查看 resolved config layers。",
    resolveActionSupportedShape: "使用支持的 resolve command 形式后重新运行。",
    commandStatus: "命令状态",
    statusLabel: "命令状态",
    commandStatusStatusNote: "表示 status read 已完成；不代表安装健康检查通过。",
    highLevelHealth: "高层健康",
    targetProject: "目标项目",
    targetPath: "目标路径",
    commandCwd: "命令执行目录",
    projectRoot: "项目根目录",
    installLocation: "安装位置",
    manifestVersion: "manifest version",
    source: "来源",
    externalAccess: "外部访问",
    manifest: "manifest 状态",
    installedModules: "已安装 modules",
    ideTargets: "IDE targets（技术标识）",
    installIdeTargets: "IDE 目标",
    ideTargetStatuses: "IDE 目标状态",
    keyPaths: "关键路径",
    checkedCategories: "已检查 categories",
    notCheckedCategories: "未检查 categories",
    checkedTargets: "已检查 targets",
    validatedPaths: "已验证 paths",
    issueCounts: "issue counts",
    issueFields: "问题字段",
    issueImpactSummary: "请根据 issueId、category、affectedPath 与 details 判断影响范围。",
    issueManualActionLocalized: "见 Next Actions（下一步）的本地化动作。",
    outputProfile: "输出形式",
    evidenceProfile: "证据",
    mode: "模式",
    planStatus: "plan 状态",
    authorization: "授权状态",
    updatePlanEffects: "update plan / planned effects（计划影响）",
    repairPlanEffects: "repair plan / planned effects（修复影响）",
    changedPaths: "已变更 paths",
    skippedPaths: "已跳过 paths",
    remainingConflicts: "剩余 conflicts",
    conflicts: "conflicts",
    protectedBoundaries: "受保护边界",
    noPathsChangedYet: "尚未变更 path。",
    noPathsSkippedDuringApply: "apply 期间没有跳过 path。",
    noRemainingConflicts: "无剩余 conflict。",
    noConflictsDetectedSentence: "未检测到 conflict。",
    conflictsBlockWriteAuthorizationSentence: "conflict 会阻止写入授权；普通 --yes 仅适用于 non-conflicting planned writes。",
    repairWriteIncompleteSentence: "repair 写入未完整完成；重新运行前请检查 completed writes 与 blocker。",
    updateWriteIncompleteSentence: "update 写入未完整完成；重新运行前请检查 completed writes 与 blocker。",
    repairWritesAuthorizedSentence: "已记录 explicit --yes 授权，用于 non-conflicting planned repair writes。",
    updateWritesAuthorizedSentence: "已记录 explicit --yes 授权，用于 non-conflicting planned update writes。",
    repairNoWritesAuthorizedSentence: "尚未授权写入。确认 explicit repair plan 后运行 speclite update --repair <target> --yes 授权 non-conflicting repair writes。",
    updateNoWritesAuthorizedSentence: "尚未授权写入。确认 plan 后运行 speclite update <target> --yes 授权 non-conflicting planned update writes。",
    noWritesAuthorizedSentence: "尚未授权写入。",
    stepState: "step 状态",
    failedStep: "失败 step",
    completedWrites: "已完成写入",
    completedSteps: "已完成 steps",
    pendingSteps: "待处理 steps",
    executionFailureBoundary: "执行失败边界",
    writeRepairIncompleteSentence: "write/repair 执行未完整完成。",
    unexecutedItems: "未执行项目",
    protectedBoundaryCustom: "_speclite/custom：human-owned custom TOML；update 不覆盖、不 normalize、不重排、不删除。",
    protectedBoundaryArtifact: "_speclite-output：workflow-owned artifact repository；update 不覆盖 generated artifacts。",
    protectedBoundaryInstallerDrift: "installer-owned drift：普通 update 报告 conflict；repair 是显式且独立的动作。",
    planActionRepair: "确认后运行 speclite update --repair --yes 授权该 repair write。",
    planActionWrite: "确认后使用 --yes 授权该 planned write。",
    planActionConflict: "先解决 conflict；适用时可使用 explicit repair flow。",
    planActionUnchanged: "无需写入。",
    planActionReviewReason: "变更该 path 前先检查 reason。",
    conflictActionInstallerOwnedDrift: "运行 speclite update --repair，或手动检查该 path 后重新运行 update。",
    conflictActionHumanOwned: "手动检查 human-owned custom file；update 不覆盖、不 normalize、不重排、不删除。",
    conflictActionWorkflowOwned: "运行 speclite validate 检查 workflow-owned artifact metadata；update 不覆盖 generated artifacts。",
    conflictActionUnknownOwnership: "运行 speclite validate 并检查 ownership 后再重新运行 update planning。",
    conflictActionMissingSourceEvidence: "恢复 source evidence，或运行 speclite validate 后再生成 write-capable update plan。",
    conflictActionUnsupportedRepair: "使用手动动作，或等待支持的 repair path；普通 update 不覆盖该 path。",
    conflictActionNotAuthorized: "授权写入前先检查 path policy；--yes 仅适用于 non-conflicting planned writes。",
    conflictActionUnchanged: "无需操作。",
    conflictActionUnknownReason: "授权 update writes 前检查该 path；未知 reason code 保留为 {reason}。",
    resolveRequestedKey: "请求的 key",
    resolveRequestedKeyAll: "全部",
    resolveResolvedLayer: "解析 layer",
    resolveResolvedLayerNone: "无",
    resolveMergedResolverLayers: "merged resolver layers",
    resolveSourcePath: "来源路径",
    resolveSourcePathNone: "无",
    resolveSourcePathMultiple: "多个",
    resolveSourcePathUnknown: "未知",
    resolveValueSummary: "value 摘要",
    resolveValueNotProduced: "未生成",
    resolveValueEmptyObject: "empty object",
    resolveValueObjectWithKeys: "object，包含 {count} 个 key",
    resolveTechnicalIdentifierNote: "中文 locale 保留 technical identifier：{identifier}",
    resolveOutputMode: "输出模式",
    resolveOutputModeHuman: "human",
    resolveMachineContract: "机器契约",
    resolveMachineContractPureJson: "未使用 --human 时，默认 stdout 仍保持纯 JSON。",
    resolveLegalCommand: "合法 command",
    resolveFailedLayer: "失败 layer",
    resolveReasonCode: "reason code",
    resolveResolvedKeys: "已解析 keys",
    resolveResolvedKeysNone: "无",
    resolveSourcePaths: "来源路径列表",
    resolveFallbackSource: "回退来源",
    resolveFallbackProjectSearch: "project root search",
    resolveFallbackOptionalLayer: "optional layer 作为 empty object 处理",
    resolveResolverLayer: "resolver layer",
    resolveUnresolvedReason: "unresolved",
    resolveMissingKey: "缺失 key",
  },
  "en-US": {
    summary: "Summary",
    scope: "Scope",
    state: "State",
    evidence: "Evidence",
    issues: "Issues:",
    nextActions: "Next Actions / Next actions:",
    outcome: "Outcome",
    emptyState: "Empty State",
    completed: "Completed",
    writes: "Writes",
    userAction: "User action",
    completedYes: "yes",
    completedNo: "no",
    writeNone: "no project files changed",
    writeChanged: "project files changed",
    actionRequired: "required",
    actionNotRequired: "not required",
    readyState: "Ready state",
    readyYes: "ready",
    readyNo: "not ready",
    installOutcomePrewritePaused: "prewrite-paused",
    installOutcomeBlockedBeforeWrite: "blocked-before-write",
    installOutcomeWriteFailed: "write-failed",
    installOutcomeReadyCheckFailed: "ready-check-failed",
    installOutcomeReady: "ready",
    installSummaryPrewritePaused: "No installation was executed and no project files were written in this run.",
    installSummaryBlockedBeforeWrite: "No project files were written because install stopped before the write stage.",
    installSummaryWriteFailed: "Install entered the write stage and failed; the project is not ready.",
    installSummaryReadyCheckFailed: "Project files were written, but the project cannot be treated as ready.",
    installSummaryReady: "Install completed and ReadyCheck passed; the project is ready.",
    installActionFixBlockerBeforeYes: "Fix the reported blocker before authorizing install writes.",
    installActionInspectCompletedWrites: "Inspect completed writes before rerunning or cleaning up manually.",
    installActionFixReadyCheck: "Fix the readiness blocker, then rerun speclite install --yes or speclite validate.",
    statusOutcomeInstalled: "installed",
    statusOutcomeNotInstalled: "not-installed",
    statusOutcomePartial: "partial",
    statusOutcomeFailed: "failed",
    statusOutcomeStale: "stale",
    statusOutcomeUnknown: "unknown",
    validateOutcomeValid: "valid",
    validateOutcomeValidWithWarnings: "valid-with-warnings",
    validateOutcomeInvalid: "invalid",
    validateOutcomeCannotValidate: "cannot-validate",
    noIssues: "No issues",
    noConflicts: "No conflicts",
    noPlannedWrites: "No planned writes",
    noCheckedItems: "No checked items",
    validateNoIssuesForCheckedCategories: "No issues found for checked categories.",
    validateNoConflicts: "No conflicts detected.",
    validateNoCategoriesChecked: "No categories checked.",
    validateSkippedCategoriesCaveat: "Skipped / not checked categories are listed above and must not be interpreted as healthy.",
    statusSummaryInstalled: "Installed-state summary indicates SpecLite is configured.",
    statusSummaryNotInstalled: "Installed-state summary indicates SpecLite is not installed in this project.",
    statusSummaryStale: "Installed-state summary has stale human-readable evidence; run validate for diagnostics.",
    statusSummaryPartial: "Installed-state summary is partial; command success does not mean installation health passed.",
    statusSummaryFailed: "Installed-state summary could be read, but installation health failed.",
    statusSummaryUnknown: "Installed-state summary is insufficient for a human-readable health decision.",
    validateSummaryValid: "Validated checked categories have no issues.",
    validateSummaryValidWithWarnings: "Validated checked categories have warnings or informational issues, but no blocking errors.",
    validateSummaryInvalid: "Validated checked categories contain error or critical issues.",
    validateSummaryCannotValidate: "Validate could not complete enough checks to produce a diagnostic issue list.",
    updateSummaryPlanReady: "Update plan is ready for review; no project files have been written.",
    updateSummaryRepairPlanReady: "Repair plan is ready for review; update --repair is an explicit repair action, not a hidden mode of ordinary update.",
    updateSummaryNoOp: "No planned writes are required for this update/repair run.",
    updateSummaryBlockedByConflict: "Conflicts block write authorization; ordinary --yes must not bypass conflicts.",
    updateSummaryApplied: "Authorized writes were applied within protected boundaries.",
    updateSummaryPartialOrFailed: "Update write/repair execution did not fully complete; review completed writes, failed steps, pending steps, and protected boundaries.",
    nextActionNone: "No action required",
    installActionRunYes: "Run `{command}` to install with defaults.",
    installActionRunInteractive: "Run `{command}` to customize installation.",
    installActionFixBlockerThenRunYes: "Fix the blocker before running `{command}` to authorize writes.",
    installActionInspectCompletedThenValidate: "Inspect completed writes, then run `{command}` to recheck installed-state.",
    installActionFixReadyThenInstallOrValidate: "Fix the readiness blocker, then run `{installCommand}` or `{validateCommand}`.",
    statusActionInstall: "Run `{command}` to configure this project.",
    statusActionInspectIdeThenValidate: "Inspect IDE target statuses above, then run `{command}` for full diagnostics.",
    statusActionInspectManifestThenValidate: "Inspect manifest/source descriptor evidence above, then run `{command}` for full diagnostics.",
    statusActionValidateFreshness: "Run `{command}` to confirm installed-state freshness before running write-capable commands.",
    statusActionRestoreMetadata: "Restore installed-state metadata or run `{command}` before treating this project as configured.",
    validateActionContinue: "Continue with local workflow operations that depend on installed-state metadata.",
    validateActionRestoreMetadata: "Restore installed-state metadata, then run `{command}`.",
    validateActionRerunAfterIssues: "Fix the issues above, then run `{command}` to recheck checked categories.",
    updateActionResolveBlocker: "Resolve the blocker (affectedPath={affectedPath}; reason={reason}).",
    updateActionReviewPlanAuthorize: "Review the update plan, then run `{command}` to authorize non-conflicting planned writes.",
    updateActionReviewRepairAuthorize: "Review the explicit repair plan, then run `{command}` to authorize non-conflicting repair writes.",
    updateActionInspectCompleted: "Inspect completed writes and blocker evidence, and manually recover incomplete steps if needed.",
    updateActionValidateAfterWrites: "Run `{command}` to verify installed-state integrity.",
    updateActionStatusAfterWrites: "Run `{command}` to inspect installed-state summary.",
    issueActionBlocking: "Fix {issueId} (affectedPath={affectedPath}; reason={reason}).",
    issueActionNonBlocking: "Inspect {issueId} (affectedPath={affectedPath}; reason={reason}).",
    resolveActionWarnings: "Inspect the warning issue and fix optional resolver layers if their values were expected.",
    resolveActionUnresolved: "Check the requested dotted key or inspect the resolved config layers.",
    resolveActionSupportedShape: "Use a supported resolve command shape and rerun the command.",
    commandStatus: "Command status",
    statusLabel: "Status",
    commandStatusStatusNote: "means status read completed; it does not certify installation health.",
    highLevelHealth: "High-level health",
    targetProject: "Target project",
    targetPath: "Target path",
    commandCwd: "Command cwd",
    projectRoot: "Project root",
    installLocation: "Install location",
    manifestVersion: "Manifest version",
    source: "Source",
    externalAccess: "External Access",
    manifest: "Manifest",
    installedModules: "Installed modules",
    ideTargets: "IDE targets",
    installIdeTargets: "IDE targets",
    ideTargetStatuses: "IDE target statuses",
    keyPaths: "Key paths",
    checkedCategories: "Checked categories",
    notCheckedCategories: "Not checked categories",
    checkedTargets: "Checked targets",
    validatedPaths: "Validated paths",
    issueCounts: "Issue counts",
    issueFields: "Issue fields",
    issueImpactSummary: "Inspect issueId, category, affectedPath, and details for impact.",
    issueManualActionLocalized: "See localized Next Actions.",
    outputProfile: "Output profile",
    evidenceProfile: "Evidence",
    mode: "Mode",
    planStatus: "Plan status",
    authorization: "Authorization",
    updatePlanEffects: "Update Plan / Planned Effects",
    repairPlanEffects: "Repair Plan / Planned Effects",
    changedPaths: "Changed Paths",
    skippedPaths: "Skipped Paths",
    remainingConflicts: "Remaining Conflicts:",
    conflicts: "Conflicts:",
    protectedBoundaries: "Protected Boundaries",
    noPathsChangedYet: "No paths changed yet.",
    noPathsSkippedDuringApply: "No paths skipped during apply.",
    noRemainingConflicts: "No remaining conflicts.",
    noConflictsDetectedSentence: "No conflicts detected.",
    conflictsBlockWriteAuthorizationSentence: "Conflicts block write authorization. Ordinary --yes only applies to non-conflicting planned writes.",
    repairWriteIncompleteSentence: "Repair write execution did not fully complete; inspect completed writes and blockers before rerunning.",
    updateWriteIncompleteSentence: "Update write execution did not fully complete; inspect completed writes and blockers before rerunning.",
    repairWritesAuthorizedSentence: "Explicit --yes authorization was recorded for non-conflicting planned repair writes.",
    updateWritesAuthorizedSentence: "Explicit --yes authorization was recorded for non-conflicting planned update writes.",
    repairNoWritesAuthorizedSentence: "No writes authorized. Review the explicit repair plan and rerun speclite update --repair <target> --yes to authorize non-conflicting repair writes.",
    updateNoWritesAuthorizedSentence: "No writes authorized. Review the plan and rerun speclite update <target> --yes to authorize non-conflicting planned update writes.",
    noWritesAuthorizedSentence: "No writes authorized.",
    stepState: "Step State",
    failedStep: "Failed step",
    completedWrites: "Completed writes",
    completedSteps: "Completed steps",
    pendingSteps: "Pending steps",
    executionFailureBoundary: "Execution Failure Boundary",
    writeRepairIncompleteSentence: "write/repair execution did not fully complete.",
    unexecutedItems: "Unexecuted items",
    protectedBoundaryCustom: "_speclite/custom: human-owned custom TOML; update does not overwrite, normalize, reorder, or delete it.",
    protectedBoundaryArtifact: "_speclite-output: workflow-owned artifact repository; update does not overwrite generated artifacts.",
    protectedBoundaryInstallerDrift: "installer-owned drift: normal update reports conflict; repair is explicit and separate.",
    planActionRepair: "Review and rerun speclite update --repair --yes when ready to authorize this repair write.",
    planActionWrite: "Review and rerun with --yes when ready to authorize the planned write.",
    planActionConflict: "Resolve the conflict or use the explicit repair flow when applicable.",
    planActionUnchanged: "No write required.",
    planActionReviewReason: "Review the reason before changing this path.",
    conflictActionInstallerOwnedDrift: "Run speclite update --repair or manually inspect this path before rerunning update.",
    conflictActionHumanOwned: "Review the human-owned custom file manually; update will not overwrite, normalize, reorder, or delete it.",
    conflictActionWorkflowOwned: "Run speclite validate to inspect workflow-owned artifact metadata; update will not overwrite generated artifacts.",
    conflictActionUnknownOwnership: "Run speclite validate and inspect ownership before rerunning update planning.",
    conflictActionMissingSourceEvidence: "Restore source evidence or run speclite validate before generating write-capable update plans.",
    conflictActionUnsupportedRepair: "Use manual action or wait for a supported repair path; normal update will not overwrite this path.",
    conflictActionNotAuthorized: "Review the path policy before authorizing writes; --yes only applies to non-conflicting planned writes.",
    conflictActionUnchanged: "No action is required for unchanged content.",
    conflictActionUnknownReason: "Inspect this path before authorizing update writes; unknown reason code is preserved as {reason}.",
    resolveRequestedKey: "requested key",
    resolveRequestedKeyAll: "all",
    resolveResolvedLayer: "resolved layer",
    resolveResolvedLayerNone: "none",
    resolveMergedResolverLayers: "merged resolver layers",
    resolveSourcePath: "source path",
    resolveSourcePathNone: "none",
    resolveSourcePathMultiple: "multiple",
    resolveSourcePathUnknown: "unknown",
    resolveValueSummary: "value summary",
    resolveValueNotProduced: "not produced",
    resolveValueEmptyObject: "empty object",
    resolveValueObjectWithKeys: "object with {count} {keyLabel}",
    resolveTechnicalIdentifierNote: "中文 locale preserves technical identifiers: {identifier}",
    resolveOutputMode: "output mode",
    resolveOutputModeHuman: "human",
    resolveMachineContract: "machine contract",
    resolveMachineContractPureJson: "default stdout remains pure JSON when --human is omitted",
    resolveLegalCommand: "legal command",
    resolveFailedLayer: "failed layer",
    resolveReasonCode: "reason",
    resolveResolvedKeys: "resolved keys",
    resolveResolvedKeysNone: "none",
    resolveSourcePaths: "source paths",
    resolveFallbackSource: "fallback source",
    resolveFallbackProjectSearch: "project root search",
    resolveFallbackOptionalLayer: "optional layer treated as empty object",
    resolveResolverLayer: "resolver layer",
    resolveUnresolvedReason: "unresolved",
    resolveMissingKey: "missing key",
  },
};

export function resolveCliLocale(input: CliLocaleInput = {}): CliLocale {
  const requested = input.flag ?? input.env?.SPECLITE_LOCALE;
  return isCliLocale(requested) ? requested : "zh-CN";
}

export function getCliMessage(locale: CliLocale, key: CliMessageKey): string {
  return MESSAGE_CATALOG[locale]?.[key] ?? MESSAGE_CATALOG["en-US"][key];
}

export function formatCliMessage(
  locale: CliLocale,
  key: CliMessageKey,
  params: Record<string, string | number | boolean>,
): string {
  return getCliMessage(locale, key).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

function isCliLocale(value: string | undefined): value is CliLocale {
  return value !== undefined && SUPPORTED_LOCALES.has(value as CliLocale);
}
