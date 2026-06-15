# Story 8.2: Install Outcome-Oriented Output（Install Outcome 导向输出）

Status: ready-for-dev

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
   **并且** Next Actions 同时给出默认安装命令 `speclite install <target> --yes` 与自定义安装命令 `speclite install <target> --interactive`。

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

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Derive install human outcomes from existing install state（AC: 1-5）
  - [ ] 在 install human renderer 中从 `CommandResult.status`、`completedSteps`、`pendingSteps`、issues、write authorization 和 ReadyCheck state 推导 human outcome。
  - [ ] Outcome label 只用于 human-readable output；不得新增 JSON field，除非先改 SPEC。
  - [ ] 保持 `install --json` schema 不变。

- [ ] Task 2: Update install renderer and catalog（AC: 1-5）
  - [ ] 扩展 `src/diagnostics/output.ts` 的 `renderInstallHumanOutput()`，使用 Story 8.1 的 shared frame。
  - [ ] 扩展 `src/cli/messages.ts`，新增 `prewrite-paused`、`blocked-before-write`、`write-failed`、`ready-check-failed`、`ready` 的 `zh-CN` / `en-US` 文案。
  - [ ] Summary 必须先说明是否写入、是否 ready、是否需要动作。

- [ ] Task 3: Preserve Story 1.7 behavior（AC: 1, 5）
  - [ ] `install --yes` 继续 no-prompt happy path。
  - [ ] `install --yes --interactive` 继续显示 explicit interactive 文案。
  - [ ] Prompt/summary 分离、NO_COLOR/non-TTY/CI 无 ANSI 输出保持不变。

- [ ] Task 4: Failure branch evidence（AC: 2-4）
  - [ ] 对 source blocked、target existing install、missing bundled source evidence、safe write failure、ReadyCheck failed 增加 focused assertions。
  - [ ] write-failed / ready-check-failed 必须展示 completed steps、failed/pending 信息或等价 evidence。

- [ ] Task 5: Verification（AC: 1-5）
  - [ ] 运行 `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`。
  - [ ] 运行新增 install outcome focused tests。
  - [ ] 运行 `npm run build`、`npm test` 或记录阻塞、`git diff --check`。

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
| 2026-06-15 | 0.1 | 创建 Epic 8.2 ready-for-dev Story，聚焦 install outcome-oriented human output。 | Amelia |
