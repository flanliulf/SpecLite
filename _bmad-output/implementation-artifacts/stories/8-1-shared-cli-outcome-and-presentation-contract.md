# Story 8.1: Shared CLI Outcome And Presentation Contract（共享 CLI Outcome 与展示契约）

Status: ready-for-dev

<!-- Corrective planning Story: 聚焦当前 CLI human-readable output，不新增 GUI/TUI，不改变 command core behavior。 -->

## Story（故事）

作为 CLI 用户，
我希望所有 SpecLite 命令都使用一致的 outcome、摘要、证据和下一步结构，
以便无论运行哪个命令，都能快速判断当前状态、写入边界和下一步动作。

## Acceptance Criteria（验收标准）

1. **Human output has shared title, outcome, Summary and Next Actions（人类输出具备共享标题、Outcome、摘要和下一步）**
   **前提** 任一 CLI command 生成 human-readable output；
   **当** 输出被渲染；
   **则** 必须包含 command title、outcome label、Summary 和 Next Actions；
   **并且** Summary 必须先回答本次是否完成、是否写入、是否需要用户动作。

2. **Chinese locale keeps technical identifiers untranslated（中文 locale 保留技术标识）**
   **前提** command 输出涉及路径、issue、target、schema、step 或 JSON field；
   **当** human-readable output 使用中文 locale；
   **则** 自然语言说明必须中文化；
   **并且** command name、flag、path、issue id、schema id、step id、target id 和 JSON field 不得本地化。

3. **Empty states are explicit（空状态显式可见）**
   **前提** command 输出需要展示空状态；
   **当** 无 issues、无 conflicts、无 planned writes 或无 checked items；
   **则** 必须显示明确 empty state，例如 `无问题`、`无 conflict`、`未写入项目文件`；
   **并且** 不得用空白区域让用户猜测。

4. **Human output and JSON share semantics without making prose contractual（人类输出与 JSON 共享语义但文案不成为契约）**
   **前提** human-readable output 与 `--json` 同时存在；
   **当** 两者表达同一 command result；
   **则** 必须共享 status、issue、path、next action、severity 和 sorting semantics；
   **并且** human-readable 文案不得成为 automation 的唯一信息来源。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Define shared outcome presentation primitives（AC: 1-4）
  - [ ] 在 `src/diagnostics/output.ts` 或新增 `src/cli/presentation.ts` 中定义 command title、outcome label、Summary、Scope、State、Evidence、Issues、Next Actions、Empty State 的统一 renderer primitive。
  - [ ] 复用 `CommandResult.status`、command-specific data、`ValidationIssue`、canonical issue ordering 和 project-relative POSIX paths。
  - [ ] 不新增 public JSON 字段；如确需新增，先更新 owning SPEC 和 executable schema。

- [ ] Task 2: Introduce outcome taxonomy without cross-command enum leak（AC: 1, 4）
  - [ ] 为 install、update/repair、status、validate、resolve 分别定义 human outcome vocab，不把所有命令强行塞进同一 enum。
  - [ ] Outcome label 只属于 human-readable presentation，除非 owning SPEC 明确把它提升为 public JSON field。
  - [ ] Summary 必须先回答完成状态、写入状态和用户动作。

- [ ] Task 3: Extend message catalog and locale rules（AC: 2, 3）
  - [ ] 扩展 `src/cli/messages.ts`，至少支持 `zh-CN` 默认和 `en-US` fallback。
  - [ ] 自然语言走 catalog；command、flag、path、issue id、schema id、step id、target id、JSON field 保持英文。
  - [ ] Empty states 使用 catalog，而不是硬编码散落在各 command renderer 中。

- [ ] Task 4: Migrate existing human renderers incrementally（AC: 1-4）
  - [ ] 先保留 JSON renderer `renderCommandResultJson()` 独立稳定。
  - [ ] 将 `renderInstallHumanOutput`、`renderStatusHumanOutput`、`renderValidateHumanOutput`、`renderUpdateHumanOutput` 迁移到共享 primitive。
  - [ ] 不改变 command core behavior、不改变 exit code、不改变 issue ordering。

- [ ] Task 5: Tests（AC: 1-4）
  - [ ] 新增 presentation focused tests，覆盖 title/outcome/Summary/Next Actions、中文技术标识保留、empty state、JSON parity。
  - [ ] 运行 `npm run build`、focused tests、`npm test` 或记录阻塞、`git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- UX output system: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Install CLI revision: `_bmad-output/planning-artifacts/ux-install-cli-interaction-spec-2026-06-12.md`
- CommandResult contract: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- Validation taxonomy: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`

### Current Implementation Anchors（当前实现锚点）

- CLI locale exists but minimal: `src/cli/messages.ts`
- Human renderers are centralized but command-specific: `src/diagnostics/output.ts`
- JSON renderer is stable and must stay separate: `renderCommandResultJson()`
- CLI registration and locale flag currently exist for install only: `src/bin/speclite.ts`
- Existing focused output tests: `test/cli-smoke.test.ts`, `test/install-progress-ready-summary.test.ts`, `test/status-command.test.ts`, `test/validate-command.test.ts`, `test/update-command.test.ts`

### Scope Boundary（范围边界）

- 本 Story 不实现每个 command 的 full outcome behavior；后续 8.2-8.5 负责 command-specific migration。
- 不新增 GUI/TUI、spinner-only progress、daemon 或 terminal framework。
- 不把 human outcome label 写入 JSON，除非先更新 SPEC。
- 不改变 command core behavior、exit code、public JSON schema 或 fixture JSON comparison。

## Dependency Gate（依赖门禁）

- Story 1.7 已建立 `src/cli/messages.ts` 和 install locale 基础；本 Story 必须复用，不重建 catalog。
- 若要让 status/update/validate 接收 locale flag，需要 Story 8.1 明确 CLI-level locale propagation strategy，不得只改 install。
- 所有新增 lifecycle sections 受 `09-sdlc-workflow-lifecycle-contract.md` 约束。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | Human renderer 共享 JSON semantics，但不把 prose 变成 automation contract。 |
| Contract Anchor | `07-validation-issue-taxonomy.md` | Issues section 排序和 severity/category 使用 canonical model。 |
| Functional Anchor | `src/diagnostics/output.ts` | 当前 human/json renderer 边界。 |
| Functional Anchor | `src/cli/messages.ts` | 当前 locale resolver 和 catalog 扩展位置。 |
| Evidence Anchor | output focused tests | 验证 shared frame、empty state、locale 和 JSON parity。 |

## Equivalent Implementation Policy（等价实现策略）

如果共享 primitive 放在 `src/diagnostics/output.ts` 之外，只要 command renderers 统一复用同一 data model、tests 覆盖同一语义，即可视为等价。不能接受每个 command 继续各自拼接 outcome vocabulary 和 empty state。

## Evidence Plan（证据计划）

- 新增或扩展 `test/cli-output-presentation.test.ts`
- `npm test -- test/cli-smoke.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts`
- `npm run build`
- `npm test`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

待实现时填写。

### Debug Log References（调试日志引用）

待实现时填写。

### Completion Notes（完成说明）

待实现时填写。

### File List（文件清单）

待实现时填写。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-15 | 0.1 | 创建 Epic 8.1 ready-for-dev Story，定义共享 CLI outcome 与 presentation contract。 | Amelia |
