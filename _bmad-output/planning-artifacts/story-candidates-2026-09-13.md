# Story Candidates（Story 候选）— 2026-09-13

本文记录 2026-09-13 公开文档体系整理过程中发现、但超出文档范围、需要作为后续 Story 规划的事项。它们尚未进入 `sprint-status.yaml`，不表示已排期或已批准；每项给出证据、产品诉求依据与验收草案，供规划下一 Epic 或 backlog 整理时裁决。

## SC-1 Post-MVP 命令的 outcome-oriented human output 迁移

- **现状**：`init`、`list`、`doctor`、`sync`、`uninstall`、`governance-report` 六个命令的 renderer 仍以 `Status:` 开头输出 legacy human output，不走 `renderPresentationFrame`，不支持 `--locale`（`src/diagnostics/output.ts` L333–830）。`HUMAN_OUTPUT_PRESENTATION_PROFILES` 只登记了三个 `resolve` key。
- **来源**：Story 8.8 把这六个命令的 profile 映射写成"若 renderer 被触达 / 未来迁移时"；Epic 8 retro `A7-2` 明确排除 Post-MVP 新命令。
- **产品诉求**：Epic 8 的 outcome-oriented、可扫描、本地化 human output 应覆盖全部面向人的命令，否则用户在治理命令上仍会误判"未写入 / 写入失败 / 只读诊断"。
- **验收草案**：六个命令输出 `Outcome（结果）` frame 与 profile-specific section；支持 `--locale`；`docs/reference/cli-human-output-matrix.md` 新增对应 command/outcome 行并附 focused tests；JSON contract 不变。
- **关联文档**：`docs/reference/cli.md` Output Modes、`docs/reference/cli-human-output-matrix.md` Presentation Profiles 已标注"映射已定义，renderer 未迁移"。

## SC-2 `validate` Next Actions 按 severity 过滤

- **现状**：`createValidateCommandResult` 只有两种 nextActions：无 issue 一句，有任何 issue 就输出 "Inspect manifest-schema issues and repair or reinstall installed-state metadata."；zh-CN renderer 又为每条 issue 追加一行"检查 …"。fresh install 后立即 `validate` 会得到 20 余条针对 `info` 级 `not-yet-produced` 的 Next Actions，以及一条与实际 issue 无关的 manifest-schema 提示。
- **来源**：`9a88a1a` 引入 `artifact-path.missing-required-artifact` 的 `not-yet-produced`（`info`）两态后，nextActions 生成逻辑未同步。
- **产品诉求**：Story 8.6 / 8.9 要求 Next Actions 是 outcome-oriented、可扫描的下一步，而不是 issue 列表的回声。
- **验收草案**：`info` 级 issue 不产生 Next Actions；nextActions 按最高 severity 与 category 生成，manifest-schema 提示只在存在该类 issue 时出现；`test/validate-command.test.ts` 与 human output matrix 增加 pristine install 用例。

## SC-3 `artifact-path.fixture-write-failed` 的归属

- **现状**：SPEC 07（zh / en）把它列为稳定 issue id；`src/validation/rules/artifact-path.ts` 只有类型联合声明，无产出点、无测试、无 fixture。
- **产品诉求**：SPEC 07 是 issue taxonomy 的 owning contract，公开文档 `docs/reference/validation-issues.md` 只能如实标注"当前无产出点"。
- **验收草案**：二选一并同步 SPEC 07 与 `validation-issues.md`：在 fixture writer（Story 6.x 的 fixture contract）中实现并加 fail-closed 测试；或从 SPEC 07 与类型联合中移除，并在 SPEC 07 变更记录中说明。

## SC-4 SPEC 09 追认 Flow Gate report v2

- **现状**：SPEC 09 `FlowGateReportMetadata` 仍声明 `schemaVersion: "speclite.flow-gate-report.v1"`；`src/hooks/flow-gate-enforcement.ts` 以 `v2` 为 REQUIRED、`v1` 为 LEGACY（拒绝）；`speclite-flow-gate` 的 `assets/report-template.md` 与 CHANGELOG 已是 `v2`，新增 `handoffContractVersion`、`foundationPrerequisiteStatus`、`foundationPrerequisiteRefs`、`closureOwnerCheckStatus`、`closureOwnerRefs`、`sourceSkill`。公开文档 `docs/reference/specs/flow-gate-handoff-contract.md` 已按 v2 描述。
- **产品诉求**：SPEC 09 是 lifecycle contract 的唯一 owner；owner 落后于实现会让后续 Story 的 kickoff gate 无法引用正确契约（Epic 11 retro `A11-3`、`A11-5` 相关）。
- **验收草案**：SPEC 09 更新 `FlowGateReportMetadata` 到 v2 字段集与允许值；注明 v1 为 legacy 且 hook 拒绝；记录 30 天 freshness policy（`MAX_METADATA_AGE_DAYS`）是否上升为契约；`docs/reference/specs/flow-gate-handoff-contract.md` 的 Freshness Policy 小节同步。

## SC-5 Hook 平台契约收口：命令路径、Codex 放行与 Stop 对称处理

> 记录日期：2026-09-15。来源：wshoto-ka-vw-anhui 安装验证后，对照当日下载的 Claude Code hooks 参考（code.claude.com/docs/en/hooks.md）与 Codex hooks 文档（learn.chatgpt.com/docs/hooks）逐条核对生成的 `.claude/settings.json`、`.codex/hooks.json` 与两个 runner。结构、事件、matcher、stdin 字段与输出协议均符合；本 Story 只收口下列三个健壮性缺口。

### Story（故事）

作为在 Claude Code 或 Codex 中使用已安装 SpecLite 的开发者，  
我希望 SpecLite 生成的 hook 命令能在会话工作目录不是项目根时仍被找到，且 runner 在 Codex 上只输出两家文档都定义了的字段，  
以便 Flow Gate 与 canonical source 提醒在两个平台上行为一致、不依赖未文档化的宽容行为。

### Gaps（缺口与证据）

| # | 现状 | 平台文档 | 证据 |
|---|---|---|---|
| G1 | hook 命令为相对路径 `node _speclite/hooks/<id>/runner.mjs ...` | Claude："Handlers run in the current directory"，示例推荐 `"$CLAUDE_PROJECT_DIR"/...`；Codex："Commands run with the session cwd"，无文档化的项目根变量 | `src/installer/hook-artifacts.ts` L241–318（`createClaudeHooks` / `createCodexHooks`） |
| G2 | Flow Gate 在 Codex 放行时输出 `{"decision":"allow","reason":...}` | Codex UserPromptSubmit 只定义 `decision:"block"` 与 Common output fields，`allow` 未文档化；"Exit 0 with no output is treated as success" | `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs` L176–186（`emitHookResult`：claude 分支放行不输出，其余分支总是输出） |
| G3 | canonical hook 在 Codex Stop 上输出 `hookSpecificOutput.additionalContext`，且只在 claude 分支检查 `stop_hook_active` | Codex Stop 只支持 Common output fields（`continue`、`stopReason`、`systemMessage`、`suppressOutput`），`additionalContext` 未列出；`stop_hook_active` 两家都提供 | `assets/source/speclite/hooks/canonical-source-change-check/runner.mjs` L18–23（`isClaudeStopSummary` 仅限 claude）、L34/L41、L149 |

### Acceptance Criteria（验收标准）

1. Claude hook 命令使用 `"$CLAUDE_PROJECT_DIR"/_speclite/hooks/<id>/runner.mjs` 形式；从项目子目录启动 Claude Code 时三个 hook 仍能执行。
2. Codex hook 命令的项目根解析方案经调研后二选一并记录依据：使用 Codex 文档化的项目根变量（若存在）；或保留相对路径并在 `hook-manifest.json` 的 `trust_note` 与 `docs/reference/runtime-layout.md` 注明"须在项目根启动 Codex"。不得假设未文档化的变量。
3. `emitHookResult` 在 `--platform codex` 放行时不输出 stdout、exit 0；阻断时保持 `{"decision":"block","reason"}` + exit 2。claude 分支行为不变。
4. canonical runner 在 `--platform codex` 的 Stop 事件上只输出 `systemMessage`，不输出 `hookSpecificOutput`；`stop_hook_active === true` 时两个平台都直接 exit 0。PostToolUse 两个平台仍输出 `hookSpecificOutput.additionalContext`。
5. `isRecognizedInstallerOwnedHookConfig`（`src/installer/hook-artifacts.ts` L363 起）把当前相对路径命令登记为 recognized legacy shape，使既有安装执行 `update` / `update --repair` 时被视为 installer-owned drift 并可修复，而不是触发 `ide-mirror.hook-config-conflict`。
6. `test/hook-artifact-install.test.ts`、`test/flow-gate-hook-runner.test.ts`、`test/canonical-source-change-check-hook.test.ts` 增加 codex 平台用例：放行零输出、阻断 exit 2、Stop 无 `hookSpecificOutput`、`stop_hook_active` 短路、legacy 命令升级；fresh-install fixture（`test/fixtures/fresh-install-empty-project/expected/**` 中含 hook 命令的 files-index / installed-state 文件）与 `release/packaging-manifest.json` 同步刷新。
7. 两个 hook package 的 `claude-settings.fragment.json`、`codex-hooks.fragment.json`、`README.md` 与 `docs/reference/runtime-layout.md`、`docs/reference/canonical-source-layout.md` 同步；变更走 `speclite-check-canonical-source-change`。
8. 不改变 Flow Gate 的判定规则、canonical hook 的 warning-only 语义、事件集合与 matcher。

### Dev Notes（开发备注）

- 平台事实（2026-09-15 原文核对）：Claude UserPromptSubmit stdin 字段为 `prompt`，顶层 `decision:"block"` 阻断并向用户展示 `reason`；Claude Stop 上的 `additionalContext` 会让对话继续（"Stop hook feedback"），当前 claude 分支省略它是正确的，G3 只是把这一处理扩展到 codex。Claude UserPromptSubmit 默认超时 30 秒，Codex 600 秒。
- Claude 的 matcher 用 `RegExp.test` 做子串匹配，`Write|Edit|MultiEdit` 中 `Edit` 同时命中 `NotebookEdit`；`MultiEdit` 在当前工具列表中不存在，是否清理由本 Story 顺带裁决，但不作为验收项。
- G1 改动会改变 `.claude/settings.json` / `.codex/hooks.json` 的内容 hash，因此 AC5 是硬前置：否则所有既有安装的 `update` 都会在写前被 `hook-config-conflict` 阻断。
- 相关但不在本 Story 范围：canonical-source-change-check 随 `support` 模块装进每个目标项目，在没有 `assets/source/speclite/` 的项目里每次 Write/Edit/Stop 都启动 node 并执行 3 条 git 命令后静默退出。是否按 module 选择投影该 hook，另立候选。

### Files To Modify（预计文件范围）

- `src/installer/hook-artifacts.ts`（命令生成与 legacy shape 识别）。
- `assets/source/speclite/hooks/flow-gate-enforcement/{runner.mjs,claude-settings.fragment.json,codex-hooks.fragment.json,README.md}`。
- `assets/source/speclite/hooks/canonical-source-change-check/{runner.mjs,claude-settings.fragment.json,codex-hooks.fragment.json,README.md}`。
- `src/hooks/flow-gate-enforcement.ts`（若 `emitHookResult` 逻辑在此镜像）。
- `test/hook-artifact-install.test.ts`、`test/flow-gate-hook-runner.test.ts`、`test/canonical-source-change-check-hook.test.ts`、`test/fixtures/fresh-install-empty-project/expected/**`、`release/packaging-manifest.json`。
- `docs/reference/runtime-layout.md`、`docs/reference/canonical-source-layout.md`。

## Related Evidence（相关证据）

- `docs-review-2026-09-13.md`、`docs-review-round2-2026-09-13.md`（session scratch 报告）。
- Epic 8 retro：`_bmad-output/implementation-artifacts/epic-8-retro-2026-07-06.md`。
- Epic 11 retro：`_bmad-output/implementation-artifacts/epic-11-retro-2026-09-12.md`。
- SC-5 平台文档：code.claude.com/docs/en/hooks.md（Hook events → UserPromptSubmit / PostToolUse / Stop decision control、Workspace trust）、learn.chatgpt.com/docs/hooks（Matcher patterns、Tool coverage、Common output fields、UserPromptSubmit / PostToolUse / Stop）。
