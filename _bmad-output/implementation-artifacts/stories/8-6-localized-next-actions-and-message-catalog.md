# Story 8.6: Localized Next Actions And Message Catalog（本地化 Next Actions 与消息目录）

Status: done

<!-- Corrective planning Story: 收敛默认中文 human-readable output、Next Actions 与 message catalog。 -->

## Story（故事）

作为中文默认用户，
我希望所有 CLI 输出的说明和下一步动作都使用中文，同时保留英文技术标识，
以便我不用在中英文混杂的输出中猜测下一步。

## Acceptance Criteria（验收标准）

1. **Default human-readable natural language uses zh-CN catalog（默认人类输出自然语言使用 zh-CN catalog）**
   **前提** 任一 human-readable command 使用默认 locale；
   **当** 输出 Summary、Authorization、Issues 或 Next Actions；
   **则** 自然语言必须使用 `zh-CN` catalog；
   **并且** 不得直接透传英文内部 `nextActions`。

2. **English fallback does not change machine contracts（英文 fallback 不改变机器契约）**
   **前提** 用户通过 `--locale en-US` 或环境变量指定英文；
   **当** 命令渲染 human-readable output；
   **则** 使用 `en-US` fallback catalog；
   **并且** 不改变 `CommandResult` JSON、exit code、issue ordering 或 path normalization。

3. **Command suggestions include target/display path and safety order（命令建议包含目标路径并按安全优先级排序）**
   **前提** Next Actions 需要展示命令；
   **当** 生成命令建议；
   **则** 命令必须包含目标路径占位或实际 display path；
   **并且** 应按安全优先级排序：先修 blocker，再授权写入，再运行 validate/status。

4. **Issue suggestedNextStep can localize without losing reason/path（Issue 建议动作可本地化且不丢 reason/path）**
   **前提** issue 有 `suggestedNextStep`；
   **当** 渲染本地化 Next Actions；
   **则** 可以使用 issue id / category 映射为本地化文案；
   **并且** 不得丢失原始 reason code 或 affected path。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Expand message catalog model（AC: 1, 2）
  - [x] 将 `src/cli/messages.ts` 从 locale resolver 扩展为 command output catalog。
  - [x] 为 install/update/status/validate/resolve 提供 `zh-CN` 默认和 `en-US` fallback。
  - [x] 技术标识保持英文：command、flag、path、issue id、schema id、step id、target id、JSON field。

- [x] Task 2: Localize Next Actions safely（AC: 1, 3, 4）
  - [x] 建立 Next Actions builder，输入 command id、target display path、issues、write state、outcome。
  - [x] 默认中文 Next Actions 不直接透传英文内部 `nextActions`，但保留 reason code、affected path 和 technical command。
  - [x] 安全排序：blocker 修复优先，授权写入其次，validate/status 最后。

- [x] Task 3: Propagate locale beyond install（AC: 2）
  - [x] 在 `src/bin/speclite.ts` 为 update/status/validate/resolve human mode 设计 locale flag/env 解析策略。
  - [x] `--json` output 不受 locale、TTY、terminal width 或 NO_COLOR 影响。
  - [x] 如果某 command 不支持 locale flag，应通过 shared default resolver 使用 env/default。

- [x] Task 4: Tests（AC: 1-4）
  - [x] 覆盖默认中文 natural language，不翻译技术标识。
  - [x] 覆盖 `--locale en-US` 与 `SPECLITE_LOCALE=en-US`。
  - [x] 覆盖 issue id/category 映射到本地化 action 且保留 affectedPath/reason。
  - [x] 覆盖 JSON output 与 exit code 不随 locale 改变。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- Story 1.7: `_bmad-output/implementation-artifacts/stories/1-7-install-cli-interaction-and-localized-human-output.md`
- UX design: `_bmad-output/planning-artifacts/ux-design-specification.md`
- CommandResult contract: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`

### Current Implementation Anchors（当前实现锚点）

- Locale resolver: `src/cli/messages.ts`
- CLI install locale flag: `src/bin/speclite.ts`
- Human renderers and next actions: `src/diagnostics/output.ts`
- Command result producer nextActions: `src/diagnostics/command-result.ts`, `src/commands/*`
- Tests: `test/cli-smoke.test.ts`, `test/install-progress-ready-summary.test.ts`

### Scope Boundary（范围边界）

- 不本地化 command name、flags、paths、ids、schema names、JSON field names。
- 不改变 JSON `nextActions` contract unless owning SPEC is updated。
- 不把 localization catalog 变成 plugin system、remote translation service 或 user-editable runtime customization。
- 不以颜色、图标或 terminal width 作为唯一语义。

## Dependency Gate（依赖门禁）

- Story 8.1 shared frame 应先完成，否则本 Story 需先建立 Next Actions builder 的最小 shared primitive。
- Story 8.2-8.5 的 command-specific outcomes 可并行消费 catalog，但必须避免重复定义同一文案 key。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | JSON `nextActions` 与 public fields 不随 locale 改变。 |
| Functional Anchor | `src/cli/messages.ts` | Catalog 和 locale resolution。 |
| Functional Anchor | `src/diagnostics/output.ts` | Human output consumes catalog。 |
| Evidence Anchor | locale focused tests | 证明中文默认、英文 fallback、JSON parity、technical identifiers。 |

## Equivalent Implementation Policy（等价实现策略）

Catalog 可以拆到 `src/cli/messages/*.ts` 或集中在 `src/cli/messages.ts`；只要 key ownership 清晰、tests 覆盖且 renderers 复用即可等价。不能接受散落在 command renderer 中的硬编码中文/英文混排。

## Evidence Plan（证据计划）

- 新增 or 扩展 `test/cli-smoke.test.ts` locale cases
- 新增 `test/cli-message-catalog.test.ts` 或等价 focused tests
- `npm run build`
- `npm test`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `npm test -- test/cli-message-catalog.test.ts`（RED：4 failed；GREEN：4 passed）
- `npm test -- test/cli-message-catalog.test.ts test/cli-smoke.test.ts test/install-outcome-human-output.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`（80 passed）
- `npm run build`（通过；曾产生 `release/packaging-manifest.json` packageHash drift，已精确恢复）
- `npm test`（50 files / 360 tests passed）
- `git diff --check`（通过）

### Completion Notes（完成说明）

实现 `zh-CN` 默认 command output catalog 与 `en-US` fallback，覆盖 install/update/status/validate/resolve 的 human output。Next Actions 改为 human-only localized builder：默认中文不透传内部英文 `nextActions`，命令建议包含实际 target 或 `<target>` 占位，并按 blocker 修复、授权写入、validate/status 复查排序。Issue human `suggestedNextStep` 可按 issue id/category 本地化，同时保留 `issueId`、`affectedPath` 与 reason code；`CommandResult` JSON、exit code、issue ordering 与 path normalization 未改变。

### File List（文件清单）

- `src/cli/messages.ts`
- `src/diagnostics/output.ts`
- `src/bin/speclite.ts`
- `src/commands/resolve.ts`
- `test/cli-message-catalog.test.ts`
- `test/cli-output-presentation.test.ts`
- `test/fixture-release-gates.test.ts`
- `test/install-progress-ready-summary.test.ts`
- `test/resolve-cli.test.ts`
- `test/source-selection.test.ts`
- `test/status-command.test.ts`
- `test/target-directory.test.ts`
- `test/update-command.test.ts`
- `test/validate-command.test.ts`
- `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-15 | 0.1 | 创建 Epic 8.6 ready-for-dev Story，聚焦本地化 Next Actions 与 message catalog。 | Amelia |
| 2026-06-16 | 1.0 | 实现默认 `zh-CN` human output catalog、localized Next Actions、locale propagation 与 focused regression tests。 | GPT-5 Codex |
