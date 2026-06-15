# Story 8.4: Status And Validate Human Output Separation（Status 与 Validate 人类输出分层）

Status: done

<!-- Corrective planning Story: 保持 `status` 轻量方向感，`validate` 完整诊断，不改变 JSON contract。 -->

## Story（故事）

作为工具链维护者，
我希望 `status` 保持轻量方向感，`validate` 提供完整诊断，
以便用户不会把 status 当成弱化版 validate，也不会被 validate 的细节淹没。

## Acceptance Criteria（验收标准）

1. **Status output maps high-level health to outcome（Status 输出将 high-level health 映射为 outcome）**
   **前提** 用户运行 `speclite status`；
   **当** 系统读取 installed-state summary；
   **则** 输出 outcome 必须来自 `installed`、`not-installed`、`stale`、`partial`、`failed` 或 `unknown`；
   **并且** Summary 应优先展示 high-level health、source/version、IDE target summary 和下一步建议；
   **并且** status human outcome 必须按以下 deterministic mapping 从 `status.data.highLevelHealth` 推导：

   | `status.data.highLevelHealth` | status human outcome |
   | --- | --- |
   | `configured` | `installed` |
   | `not-configured` | `not-installed` |
   | `partial` | `partial` |
   | `failed` | `failed` |

   **并且** `stale` 和 `unknown` 只能是 human-derived label，其证据必须来自 manifest、source descriptor、version/evidence insufficiency 或 installed-state summary 不足；不得新增 public JSON enum，除非先更新 `01-command-result-json-contract.md`。

2. **Status command success is not installation health success（Status 命令成功不等于安装健康通过）**
   **前提** `status.data.highLevelHealth` 为 `not-configured`、`partial` 或 `failed`；
   **当** `CommandResult.status` 仍为 success；
   **则** human-readable output 不得把命令成功误写成安装健康通过；
   **并且** 必须通过 outcome 和 Next Actions 解释状态含义。

3. **Validate output maps issue state to validate outcome（Validate 输出将 issue 状态映射为 validate outcome）**
   **前提** 用户运行 `speclite validate`；
   **当** validation 完成；
   **则** 输出 outcome 必须来自 `valid`、`valid-with-warnings`、`invalid` 或 `cannot-validate`；
   **并且** issue counts、checked categories、checked targets、validated paths 和 issue list 必须按 canonical order 展示。

4. **Validate errors produce concrete next actions（Validate error 产生具体下一步）**
   **前提** validate 存在 error 或 critical issue；
   **当** 输出 Next Actions；
   **则** 必须优先展示具体修复动作或下一条诊断命令；
   **并且** 不得只输出泛化的“检查配置”。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Implement status outcome mapping（AC: 1, 2）
  - [x] 从 `StatusCommandData.highLevelHealth`、manifest presence、IDE target status、source descriptor 推导 status human outcome。
  - [x] 按 AC1 mapping table 实现 `configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`。
  - [x] 若输出 `stale` 或 `unknown`，必须作为 human-derived label，并在 Evidence 中说明 manifest、source descriptor、version/evidence insufficiency 或 installed-state summary 不足；不得扩展 `status.data.highLevelHealth` public JSON enum，除非先更新 SPEC。
  - [x] 对 `not-configured`、`partial`、`failed` 明确说明 command 成功只是读取成功，不代表安装健康通过。
  - [x] 不让 `status` 执行 full validation、remote source access、implicit update check 或 repair planning。

- [x] Task 2: Implement validate outcome mapping（AC: 3, 4）
  - [x] 从 `ValidateCommandData.issueCounts` 和 `CommandResult.status` 推导 `valid`、`valid-with-warnings`、`invalid`、`cannot-validate`。
  - [x] 输出 checkedCategories、checkedTargets、validatedPaths 和 issue list，排序复用 `src/validation/validation-order.ts`。
  - [x] error/critical 的 Next Actions 应从 issue category / issue id / suggestedNextStep 推导具体动作。

- [x] Task 3: Update renderer and catalog（AC: 1-4）
  - [x] 扩展 `renderStatusHumanOutput()` 与 `renderValidateHumanOutput()`，使用 Story 8.1 shared frame。
  - [x] 扩展 `src/cli/messages.ts` 的 status/validate outcome、empty state 和 Next Actions 文案。
  - [x] 技术标识不翻译，路径保持 project-relative POSIX。

- [x] Task 4: Tests（AC: 1-4）
  - [x] 覆盖 status `not-configured`、`configured`、`partial`、`failed` human output。
  - [x] 覆盖 `highLevelHealth` 到 human outcome 的 deterministic mapping，并证明 `stale` / `unknown` 不会作为新的 public JSON enum 输出。
  - [x] 覆盖 validate no issues、warning only、error/critical、manifest unreadable/cannot-validate。
  - [x] 验证 JSON output 不变，status 不增加 issues 来表达 health。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- CommandResult contract: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- Validation taxonomy: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- UX design: `_bmad-output/planning-artifacts/ux-design-specification.md`

### Current Implementation Anchors（当前实现锚点）

- Status command: `src/commands/status.ts`
- Installed-state summary and aggregation: `src/status/installed-state.ts`
- Validate command: `src/commands/validate.ts`
- Validation orchestration: `src/validation/validate-project.ts`
- Issue ordering: `src/validation/validation-order.ts`
- Renderer: `src/diagnostics/output.ts`
- Existing tests: `test/status-command.test.ts`, `test/validate-command.test.ts`

### Scope Boundary（范围边界）

- 不改变 `status.data.highLevelHealth` enum 或 aggregation unless SPEC is updated。
- 不让 status 变成 validate 的轻量版。
- 不让 validate 执行 repair、remote source freshness 或 implicit update。
- 不新增 public JSON fields。

## Dependency Gate（依赖门禁）

- Story 8.1 shared frame should exist or be introduced minimally.
- CommandResult and ValidationIssue ordering are hard contract anchors.
- If status outcome needs `stale` or `unknown` beyond current `highLevelHealth` values, implement as human-derived label or update SPEC first if public JSON changes.

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | `highLevelHealth` 独立于 `CommandResult.status`。 |
| Contract Anchor | `07-validation-issue-taxonomy.md` | Validate issue sorting、counts 和 severity semantics。 |
| Functional Anchor | `src/status/installed-state.ts` | Status lightweight health source。 |
| Functional Anchor | `src/validation/validate-project.ts` | Validate diagnostics source。 |
| Evidence Anchor | status/validate focused tests | 证明分层输出、Next Actions 和 JSON stability。 |

## Equivalent Implementation Policy（等价实现策略）

Outcome 可以由 renderer helper 推导，不必改变 command result shape。Reviewer 应拒绝任何通过新增 status issues 来表达 `partial` / `failed` health 的实现，除非 SPEC 被同步更新。

## Evidence Plan（证据计划）

- `npm test -- test/status-command.test.ts test/validate-command.test.ts`
- 新增 status/validate human outcome tests
- `npm run build`
- `npm test`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- 2026-06-16 03:34 CST：`npm test -- test/status-command.test.ts test/validate-command.test.ts` 红灯，确认现有 human outcome 仍为 `status-*` / `validate-*`。
- 2026-06-16 03:36 CST：focused suite 通过，2 files / 31 tests passed。
- 2026-06-16 03:37 CST：`npm run build` 通过；`release/packaging-manifest.json` 无 drift。
- 2026-06-16 03:37 CST：`npm test` 通过，49 files / 348 tests passed；`git diff --check` 通过。

### Completion Notes（完成说明）

- `renderStatusHumanOutput()` 现在从 `status.data.highLevelHealth` 推导 human-only outcome：`configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`。
- status human output 明确说明 `CommandResult.status=success` 仅代表读取完成，不等于安装健康通过；未新增 status JSON issues 或 public JSON fields。
- `renderValidateHumanOutput()` 现在从 `issueCounts` / `CommandResult.status` 推导 `valid`、`valid-with-warnings`、`invalid`、`cannot-validate`，并复用 canonical issue/category/path ordering 展示诊断证据。
- validate Next Actions 优先使用 error/critical issue 的 `suggestedNextStep`，再追加既有 command-level next actions。

### File List（文件清单）

- `src/cli/messages.ts`
- `src/diagnostics/output.ts`
- `test/status-command.test.ts`
- `test/validate-command.test.ts`
- `_bmad-output/implementation-artifacts/stories/8-4-status-and-validate-human-output-separation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-15 | 0.1 | 创建 Epic 8.4 ready-for-dev Story，聚焦 status 与 validate human output 分层。 | Amelia |
| 2026-06-16 | 1.0 | 实现 status/validate human-only outcome、canonical validate 展示和 focused tests，推进到 review。 | Codex |
