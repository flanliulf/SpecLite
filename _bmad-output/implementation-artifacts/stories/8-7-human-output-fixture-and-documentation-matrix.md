# Story 8.7: Human Output Fixture And Documentation Matrix（人类输出 Fixture 与文档矩阵）

Status: done

<!-- Corrective planning Story: 收敛 CLI human-readable output 的 focused tests、fixture 和 docs 示例矩阵。 -->

## Story（故事）

作为 SpecLite 维护者，
我希望每个 CLI command 的关键 outcome 都有 focused tests、fixture 或文档示例覆盖，
以便后续文案调整不会重新引入不可读、误导或未本地化输出。

## Acceptance Criteria（验收标准）

1. **Outcome renderer changes have focused tests（Outcome renderer 变更有 focused tests）**
   **前提** 实现任一 command outcome renderer；
   **当** 修改 human-readable output；
   **则** 必须补充 focused test 覆盖对应 outcome、Summary、write state、Issues 和 Next Actions。

2. **Human output changes do not mutate JSON contract（人类输出变更不改变 JSON 契约）**
   **前提** 命令支持 `--json`；
   **当** human-readable output 修改；
   **则** 必须验证 JSON output 未新增未契约字段；
   **并且** fixture stable JSON comparison 不受 locale、TTY、terminal width 或颜色影响。

3. **NO_COLOR/non-TTY/CI/narrow terminal remain meaningful（NO_COLOR、non-TTY、CI、窄终端仍可理解）**
   **前提** `NO_COLOR`、non-TTY、CI 或窄终端运行；
   **当** 渲染 human-readable output；
   **则** 不得依赖 ANSI escape、颜色、图标或动态覆盖行表达唯一语义；
   **并且** 窄终端必须能降级为 key-value block。

4. **Docs examples match outcome vocabulary and renderer（文档示例匹配 outcome vocabulary 与 renderer）**
   **前提** docs 示例展示 CLI 输出；
   **当** quick-start、reference 或 troubleshooting 文档引用命令；
   **则** 示例必须与 outcome vocabulary 和实际 renderer 一致；
   **并且** 不得把只读命令、预览命令和写入命令混为同一步。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Build outcome coverage matrix（AC: 1-4）
  - [x] 建立 command/outcome/test/docs matrix，覆盖 install、update、update --repair、status、validate、resolve human mode。
  - [x] 标记每个 outcome 的 focused test、JSON parity assertion、docs example 或 fixture。
  - [x] 不把 docs 示例当成 contract source；contract source 仍是 SPEC 和 schema/tests。

- [x] Task 2: Add focused tests for missing outcome coverage（AC: 1-3）
  - [x] 对每个 renderer outcome 添加 Summary、write state、Issues、Next Actions assertions。
  - [x] 覆盖 `NO_COLOR`、non-TTY、CI、compact/narrow terminal fallback。
  - [x] 覆盖 `--json` 不受 locale/TTY/terminal width 影响。

- [x] Task 3: Update docs examples（AC: 4）
  - [x] 检查 `README.md`、`docs/quick-start.md`、`docs/index.md` 和相关 troubleshooting/reference docs。
  - [x] 更新示例，区分 read-only、prewrite preview、write-authorized、repair-authorized 和 validation flows。
  - [x] 示例使用无颜色、稳定排序、可复制文本，不包含本机绝对路径或 private source。

- [x] Task 4: Fixture/stable comparison integration（AC: 1-3）
  - [x] 如新增 human-readable fixture，定义 normalization：颜色、terminal width、timestamps、platform path。
  - [x] 确保 release packaging / fixture tests 不把 human docs 示例误当 package runtime assets，除非明确标记为 packaged docs。

- [x] Task 5: Final verification（AC: 1-4）
  - [x] 运行 CLI output focused tests。
  - [x] 运行 `npm run build`、`npm test`、`npm run release:packaging-check` 或记录阻塞。
  - [x] 运行 `git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- UX design testing strategy: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Fixture contract: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- Package/release confidence prior story: `_bmad-output/implementation-artifacts/stories/6-7-packaging-gate-hardening.md`
- Test stability prior story: `_bmad-output/implementation-artifacts/stories/6-8-test-stability-and-cr-todo-closure.md`

### Current Implementation Anchors（当前实现锚点）

- Renderer: `src/diagnostics/output.ts`
- Locale/catalog: `src/cli/messages.ts`
- CLI entry: `src/bin/speclite.ts`
- Existing tests: `test/cli-smoke.test.ts`, `test/install-progress-ready-summary.test.ts`, `test/update-command.test.ts`, `test/status-command.test.ts`, `test/validate-command.test.ts`, `test/resolve-cli.test.ts`
- Fixture/release tests: `test/fixture-contract.test.ts`, `test/fixture-release-gates.test.ts`, `test/release-packaging-check.test.ts`
- Docs: `README.md`, `docs/quick-start.md`, `docs/index.md`

### Scope Boundary（范围边界）

- 本 Story 不再新增 outcome vocabulary；它收敛 coverage、fixtures 和 docs。
- 不改变 command core behavior 或 JSON schema。
- 不把 docs 示例变成唯一 contract source。
- 不引入 flaky snapshot：timestamps、absolute paths、terminal width、color 必须 normalize 或语义断言。

## Dependency Gate（依赖门禁）

- Story 8.1-8.6 的 renderer/catalg/outcome work 应先完成或至少有可测试 entrypoint。
- 如果某 outcome 尚未实现，本 Story 应保留 matrix TODO，而不是伪造 coverage。
- 若 release packaging check 当前因无关工作树改动失败，必须记录真实失败，不跳过证据。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `08-fixture-contract.md` | Fixture layout、stable comparison、release gate policy。 |
| Contract Anchor | `01-command-result-json-contract.md` | Human output changes must not mutate JSON contract。 |
| Functional Anchor | `src/diagnostics/output.ts` | Human renderer source。 |
| Functional Anchor | `docs/quick-start.md`, `README.md` | Public docs examples。 |
| Evidence Anchor | focused tests + release packaging check | 证明 output coverage、docs consistency 和 package surface。 |

## Equivalent Implementation Policy（等价实现策略）

Coverage matrix 可以是 docs 文件、test helper、planning artifact 或 fixture metadata。Reviewer 应检查它是否可维护、可追溯、与 tests/docs 对齐，而不是固定路径。

## Evidence Plan（证据计划）

- CLI human output focused tests
- `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/update-command.test.ts test/status-command.test.ts test/validate-command.test.ts test/resolve-cli.test.ts`
- `npm run build`
- `npm test`
- `npm run release:packaging-check`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `npm test -- test/cli-human-output-matrix.test.ts`：先 RED，缺少 `docs/reference/cli-human-output-matrix.md`；补文档后通过，4 tests passed。
- `npm test -- test/cli-human-output-matrix.test.ts test/cli-output-presentation.test.ts test/install-outcome-human-output.test.ts test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/update-command.test.ts test/status-command.test.ts test/validate-command.test.ts test/resolve-cli.test.ts`：9 files / 96 tests passed。
- `npm run build`：通过。
- `npm test`：51 files / 367 tests passed。
- `npm run release:packaging-check`：通过；测试/packaging check 产生的 `release/packaging-manifest.json` packageHash drift 已精确恢复。
- `git diff --check`：通过，无 whitespace 输出。

### Completion Notes（完成说明）

- 新增 `docs/reference/cli-human-output-matrix.md`，记录 install、update、update --repair、status、validate、resolve human mode 的 command/outcome/test/docs/fixture coverage，并明确 docs 示例不是 contract source。
- 新增 `test/cli-human-output-matrix.test.ts`，覆盖 matrix 完整性、`NO_COLOR`/non-TTY/CI/窄终端语义、`--json` parity、resolve human mode 和 packaging boundary。
- 更新 README、quick-start、CLI reference、install/update/validate how-to docs，区分 read-only、prewrite preview、write-authorized、repair-authorized 和 validation flows，示例使用无颜色稳定文本。
- 未改变 command core behavior、outcome vocabulary 或 JSON schema；`status` 的 reserved `stale` / `unknown` 在 matrix 中标记为 TODO，不伪造 coverage。

### File List（文件清单）

- `README.md`
- `docs/quick-start.md`
- `docs/index.md`
- `docs/reference/index.md`
- `docs/reference/cli.md`
- `docs/reference/cli-human-output-matrix.md`
- `docs/how-to/install-speclite.md`
- `docs/how-to/update-and-repair.md`
- `docs/how-to/validate-installation.md`
- `test/cli-human-output-matrix.test.ts`
- `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-15 | 0.1 | 创建 Epic 8.7 ready-for-dev Story，聚焦 CLI human output fixture 与 docs matrix。 | Amelia |
| 2026-06-16 | 1.0 | 实现 human output coverage matrix、focused tests、docs flow 示例和 packaging boundary 验证，Story 推进到 review。 | GPT-5 Codex |
