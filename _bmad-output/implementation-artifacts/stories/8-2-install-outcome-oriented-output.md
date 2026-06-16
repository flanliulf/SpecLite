# Story 8.2: Install Outcome-Oriented Output（Install Outcome 导向输出）

Status: done

<!-- Corrective planning Story: 延续 Story 1.7 的 install locale/prompt 基础，聚焦 outcome-oriented result 分支。 -->

## Story（故事）

作为首次安装 SpecLite 的项目维护者，
我希望 `speclite install` 在未写入、被阻止、写入失败、ReadyCheck 失败和安装就绪时展示不同的人类 outcome，
以便我不会把预览、暂停或失败误认为已经安装完成。

## Acceptance Criteria（验收标准）

1. **Install without `--yes` shows prewrite-paused（无 `--yes` 显示 prewrite-paused）**
   **前提** 用户执行 `speclite install <target>` 且未传入 `--yes`；
   **当** 命令在写入前暂停；
   **则** 输出 outcome 为 `prewrite-paused`；
   **并且** Summary 明确说明“本次尚未执行安装，也没有写入任何项目文件”；
   **并且** Next Actions 同时给出默认安装命令 `speclite install <target> --yes` 与自定义安装命令 `speclite install <target> --yes --interactive`。

2. **Prewrite blockers show blocked-before-write（写入前 blocker 显示 blocked-before-write）**
   **前提** source、target 或 package evidence 在写入前 blocked；
   **当** `install` 停止；
   **则** 输出 outcome 为 `blocked-before-write`；
   **并且** Summary 明确说明未写入；
   **并且** Next Actions 优先提示修复 blocker，而不是直接诱导用户追加 `--yes`。

3. **Write stage failures show write-failed（写入阶段失败显示 write-failed）**
   **前提** `install --yes` 进入写入阶段后失败；
   **当** runtime structure、IDE mirror、manifest/index 或 safe write 阶段失败；
   **则** 输出 outcome 为 `write-failed`；
   **并且** 必须展示 failed step、已完成写入范围、pending steps 和人工检查动作。

4. **ReadyCheck failures show ready-check-failed（ReadyCheck 失败显示 ready-check-failed）**
   **前提** `install --yes` 已写入但 ReadyCheck failed；
   **当** local readiness blocker 存在；
   **则** outcome 为 `ready-check-failed`；
   **并且** 明确说明项目不能视为 ready；
   **并且** Next Actions 引导用户修复 readiness blocker 后重新运行 `speclite install --yes` 或 `speclite validate`。

5. **Successful installs show ready（成功安装显示 ready）**
   **前提** `install --yes` 或 `install --yes --interactive` 成功并通过 ReadyCheck；
   **当** 输出 Ready Summary；
   **则** outcome 为 `ready`；
   **并且** 默认 no-prompt 与 explicit interactive 的文案必须准确区分；
   **并且** 不得新增未契约化 public JSON 字段。

### Story 8.8 Consistency Addendum（Story 8.8 一致性补充）

- `install` 属于 Operation Profile；后续修改 install human renderer 时，应使用 `Summary`、`Scope`、`State / Authorization`、`Plan / Evidence`、`Issues / Conflicts`、`Next Actions` 的操作型语义，而不是把所有 command 强行套入同一固定 section 顺序。
- 跨目录或绝对 target path 场景必须在 human output 中展示足够执行上下文，例如目标项目、目标绝对路径和命令执行目录；但不得把目标绝对路径写入 public `CommandResult` JSON。
- 默认 human output 不应同时输出同一事实的本地化行与 raw field 行，例如 `待处理 steps` 与 `pendingSteps=...`。
- Empty state 必须放入所属 section，例如 `Issues（问题）` 下输出 `- 无问题`；不应再使用独立 `Empty State（空状态）` 让用户跨段落拼语义。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Derive install human outcomes from existing install state（AC: 1-5）
  - [x] 在 install human renderer 中从 `CommandResult.status`、`completedSteps`、`pendingSteps`、issues、write authorization 和 ReadyCheck state 推导 human outcome。
  - [x] Outcome label 只用于 human-readable output；不得新增 JSON field，除非先改 SPEC。
  - [x] 保持 `install --json` schema 不变。

- [x] Task 2: Update install renderer and catalog（AC: 1-5）
  - [x] 扩展 `src/diagnostics/output.ts` 的 `renderInstallHumanOutput()`，使用 Story 8.1 的 shared frame。
  - [x] 扩展 `src/cli/messages.ts`，新增 `prewrite-paused`、`blocked-before-write`、`write-failed`、`ready-check-failed`、`ready` 的 `zh-CN` / `en-US` 文案。
  - [x] Summary 必须先说明是否写入、是否 ready、是否需要动作。

- [x] Task 3: Preserve Story 1.7 behavior（AC: 1, 5）
  - [x] `install --yes` 继续 no-prompt happy path。
  - [x] `install --yes --interactive` 继续显示 explicit interactive 文案。
  - [x] Prompt/summary 分离、NO_COLOR/non-TTY/CI 无 ANSI 输出保持不变。

- [x] Task 4: Failure branch evidence（AC: 2-4）
  - [x] 对 source blocked、target existing install、missing bundled source evidence、safe write failure、ReadyCheck failed 增加 focused assertions。
  - [x] write-failed / ready-check-failed 必须展示 completed steps、failed/pending 信息或等价 evidence。

- [x] Task 5: Verification（AC: 1-5）
  - [x] 运行 `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`。
  - [x] 运行新增 install outcome focused tests。
  - [x] 运行 `npm run build`、`npm test` 或记录阻塞、`git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- Prior story: `_bmad-output/implementation-artifacts/stories/1-7-install-cli-interaction-and-localized-human-output.md`
- UX install revision: `_bmad-output/planning-artifacts/ux-install-cli-interaction-spec-2026-06-12.md`
- CommandResult contract: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`

### Current Implementation Anchors（当前实现锚点）

- CLI install flags and prompt adapters: `src/bin/speclite.ts`
- Install orchestration: `src/commands/install.ts`
- Install lifecycle step ids: `src/installer/progress-events.ts`
- ReadyCheck: `src/installer/ready-check.ts`
- Renderer: `src/diagnostics/output.ts`
- Locale resolver: `src/cli/messages.ts`
- Tests: `test/cli-smoke.test.ts`, `test/install-progress-ready-summary.test.ts`, `test/install-module-selection.test.ts`

### Scope Boundary（范围边界）

- 不新增 public JSON fields。
- 不改变 source resolution、module selection、config initialization、manifest/index generation 或 ReadyCheck core behavior。
- 不实现 update/status/validate/resolve outcomes；后续 Stories 负责。
- 不引入 GUI/TUI、spinner-only progress 或 dynamic terminal dependency。

## Dependency Gate（依赖门禁）

- Story 8.1 的 shared frame 应先实现或在本 Story 中以最小可复用 primitive 一并建立。
- Story 1.7 的 no-prompt / locale / prompt separation tests 必须继续通过。
- 如果当前全量 `npm test` 因无关 release fixture 失败，必须在 Debug Log 记录失败项，不能假装通过。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | Install JSON shape 不变，outcome 不进入 JSON。 |
| Functional Anchor | `src/commands/install.ts` | Install state 和 lifecycle source。 |
| Functional Anchor | `src/diagnostics/output.ts` | Human output renderer。 |
| Functional Anchor | `src/cli/messages.ts` | Locale catalog。 |
| Evidence Anchor | install focused tests | 证明各 outcome、write state、next actions 和 JSON stability。 |

## Equivalent Implementation Policy（等价实现策略）

Outcome 推导可以在 renderer 或 helper 中实现；只要 JSON 不变、tests 覆盖全部分支、Story 1.7 行为不回退，即可接受。不能接受通过修改 command core result 来硬塞 human label。

## Evidence Plan（证据计划）

- `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`
- 新增 install outcome focused tests
- `npm run build`
- `npm test`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

Codex（GPT-5）

### Debug Log References（调试日志引用）

- `npm test -- test/install-outcome-human-output.test.ts` RED：5 个新增 outcome assertions 先失败，旧输出仍为 `install-progress` / `install-blocked` / `install-ready`。
- `npm test -- test/install-outcome-human-output.test.ts` GREEN：5 tests passed。
- `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`：3 files / 31 tests passed。
- `npm run build`：tsup build passed；曾造成 `release/packaging-manifest.json` `packageHash` drift，已恢复该文件，无剩余 diff。
- `npm test`：49 files / 342 tests passed。
- `git diff --check`：passed。

### Completion Notes（完成说明）

- 在 install human renderer 层从现有 `InstallCommandResult` 状态、completed/pending lifecycle steps 和 ReadyCheck 阶段推导 `prewrite-paused`、`blocked-before-write`、`write-failed`、`ready-check-failed`、`ready`，未新增 public JSON field。
- install human output 继续使用 Story 8.1 shared presentation frame，并在 Summary 首部展示完成状态、写入状态、用户动作和 ready 状态。
- 新增 `zh-CN` / `en-US` install outcome 文案和 branch-specific next-action/evidence 文案；write-failed / ready-check-failed 展示 failed step、completed write scope、pending steps 和人工检查/修复动作。
- 新增 focused renderer tests 覆盖 prewrite paused、prewrite blocker、write failure、ReadyCheck failure、ready default no-prompt / explicit interactive 文案和 JSON stability。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/8-2-install-outcome-oriented-output.md`
- `src/cli/messages.ts`
- `src/diagnostics/output.ts`
- `test/install-outcome-human-output.test.ts`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-16 | 1.1 | 按 Story 8.8 修正 prewrite 自定义安装命令为 `--yes --interactive`，补充 Operation Profile、路径安全、raw field 双写和 empty-state 一致性要求。 | GPT-5 Codex |
| 2026-06-16 | 0.2 | 实现 install outcome-oriented human output，新增 focused tests，并推进 Story 到 review。 | Codex |
| 2026-06-15 | 0.1 | 创建 Epic 8.2 ready-for-dev Story，聚焦 install outcome-oriented human output。 | Amelia |
