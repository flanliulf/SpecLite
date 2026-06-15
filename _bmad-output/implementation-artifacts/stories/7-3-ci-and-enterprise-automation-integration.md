# Story 7.3: CI And Enterprise Automation Integration（CI 与企业自动化集成）

Status: ready-for-dev

<!-- Post-MVP Story: 不属于 MVP implementation readiness gate。实现前必须先通过 Epic 7 kickoff / Story kickoff gate。 -->

## Story（故事）

作为工具链维护者，
我希望在 Post-MVP 阶段让 CI 和企业自动化工具链消费 MVP 的机器可读输出，
以便团队可以自动检查安装健康、验证结果、更新冲突和发布门禁，而不依赖人工读取 CLI 文案。

## Acceptance Criteria（验收标准）

1. **CI reads status high-level health correctly（CI 正确读取 status high-level health）**
   **前提** Post-MVP CI 运行 `speclite status --json`；
   **当** 项目处于未安装、partial 或 failed high-level health 状态；
   **则** CI 可以读取 `status.data.highLevelHealth` 判断安装摘要；
   **并且** 不把 `issues: []` 误判为安装健康通过。

2. **CI reads validate coverage fields（CI 读取 validate 覆盖字段）**
   **前提** Post-MVP CI 运行 `speclite validate --json`；
   **当** validate 输出 issueCounts、checkedCategories、checkedTargets 和 validatedPaths；
   **则** 自动化可以基于稳定字段判断验证是否通过；
   **并且** 不依赖 human-readable output。

3. **CI distinguishes update plan/apply/conflict states（CI 区分 update 计划、执行与 conflict）**
   **前提** Post-MVP CI 运行 `speclite update --json` 或 `speclite update --repair --json`；
   **当** 命令输出 planned effects、changed paths、skipped paths 和 conflicts；
   **则** 自动化可以区分 unapplied plan、actual apply result 和 blocking conflicts；
   **并且** 不把 path-level conflicts 当成多个 command-level issues。

4. **Enterprise integrations obey CommandResult semantics（企业集成遵守 CommandResult 语义）**
   **前提** 企业工具链接入 SpecLite JSON output；
   **当** 需要解析 command status 和 exit code；
   **则** 必须遵守 MVP `CommandResult.status`、issue severity 和 exit code 推导规则；
   **并且** 不定义企业私有的第二套状态语义。

5. **Automation field additions remain contract-first（自动化字段新增仍先契约后实现）**
   **前提** CI 或企业自动化需要新增字段；
   **当** 扩展 command-specific data payload；
   **则** 必须先新增或扩展对应 command owning SPEC，再通过 `CommandResult.schemaVersion`、executable schema/parser 和 fixture expected outputs 管理兼容性；
   **并且** 不破坏 `speclite.command-result.v1` 的既有字段语义。

6. **Automation artifacts redact sensitive paths and source info（自动化产物脱敏路径和 source 信息）**
   **前提** 自动化记录路径或 source 信息；
   **当** 生成日志、报告或 artifacts；
   **则** 仍需遵守 project-relative POSIX path 与 redaction 策略；
   **并且** 不泄露 credentials、home directory、cache path 或 temporary extraction path。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Define CI integration contract examples without new private semantics（AC: 1-5）
  - [ ] 在 docs 或 planning artifact 中新增 CI integration guide，明确 `status.data.highLevelHealth`、`validate.data.issueCounts`、`update.data.conflicts` 的判断规则。
  - [ ] 说明 `CommandResult.status` 与 `status.data.highLevelHealth` 是不同层级，不能把 `issues: []` 等价为安装健康。
  - [ ] 若需要新增 data 字段，先更新 owning SPEC 和 schema。

- [ ] Task 2: Provide machine-readable examples and regression tests（AC: 1-4）
  - [ ] 为 `status --json` 的 `not-configured`、`partial`、`failed`、`configured` 增加 CI-consumer assertions。
  - [ ] 为 `validate --json` 的 issueCounts、checkedCategories、checkedTargets、validatedPaths 增加 stable snapshot 或 semantic assertions。
  - [ ] 为 `update --json` / `update --repair --json` 增加 plan-ready、applied、conflict、no-op scenario assertions。

- [ ] Task 3: Add redaction and path-safety checks for automation artifacts（AC: 6）
  - [ ] 复核 `src/validation/issue-model.ts` 的 unsafe value detection 是否覆盖 CI artifact 需要。
  - [ ] 对 docs/example output 执行 fixture-stable 检查，确保不包含 home directory、absolute checkout root、cache path、temporary path 或 credential-bearing URL。

- [ ] Task 4: Documentation matrix（AC: 1-6）
  - [ ] 在 `docs/` 或 planning output 中新增 CI / enterprise automation example，清楚区分 local command、exit code、JSON field、失败策略。
  - [ ] 文档示例不得要求解析 human-readable output。
  - [ ] 文档示例使用无 ANSI、无图标、稳定排序的输出片段。

- [ ] Task 5: Verification（AC: 1-6）
  - [ ] 运行 focused tests：`test/status-command.test.ts`、`test/validate-command.test.ts`、`test/update-command.test.ts`、新增 CI examples tests。
  - [ ] 运行 `npm run build`、`npm test` 或记录阻塞、`git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`
- CommandResult status and exit code: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- Validation issue ordering and severity: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- Fixture contract: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- UX design: `_bmad-output/planning-artifacts/ux-design-specification.md`

### Current Implementation Anchors（当前实现锚点）

- JSON renderer: `src/diagnostics/output.ts`
- Command result projection: `src/diagnostics/command-result.ts`
- Runtime schema: `src/diagnostics/command-result-schema.ts`
- Status command: `src/commands/status.ts`, `src/status/installed-state.ts`
- Validate command: `src/commands/validate.ts`, `src/validation/validate-project.ts`
- Update command: `src/commands/update.ts`, `src/update/update-plan.ts`
- Redaction guard: `src/validation/issue-model.ts`
- Existing tests: `test/status-command.test.ts`, `test/validate-command.test.ts`, `test/update-command.test.ts`, `test/fixture-contract.test.ts`

### Scope Boundary（范围边界）

- 本 Story 不新增 enterprise dashboard、hosted service、GitHub Action package 或 SaaS integration。
- 不改变 command core behavior，不改变 exit code derivation，不新增私有 status semantics。
- 不把 human-readable output 作为 CI contract。
- 不泄露本机绝对路径、cache、temporary extraction path、credentials 或 raw private URL。

## Dependency Gate（依赖门禁）

- 如果 Story 7.1/7.2 尚未完成，本 Story 仍可基于现有 MVP commands 提供 baseline CI integration；hook、doctor、sync、uninstall examples 必须保持 optional 或等待对应 Story 完成。
- 如果 CI examples 覆盖 Flow Gate hook enforcement，必须先依赖 Story 7.1 提供的 hook artifact metadata、trust note 和 tests。
- 本 Story 不得依赖 Story 7.5 的 `init` / `list` internals。
- 若新增 automation data fields，必须先更新 owning SPEC。
- 如果现有 JSON contract tests 不覆盖某个 CI 判断，先补测试，不直接写文档承诺。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | CI 必须使用 `CommandResult` envelope、status、exit code 和 command-specific data。 |
| Contract Anchor | `07-validation-issue-taxonomy.md` | Issue severity/order/category 是自动化判断基础。 |
| Contract Anchor | `08-fixture-contract.md` | CI examples 和 snapshots 必须 fixture-stable。 |
| Functional Anchor | `src/commands/status.ts`, `src/commands/validate.ts`, `src/commands/update.ts` | 现有 commands 是 automation 输入。 |
| Evidence Anchor | focused JSON tests + docs examples | 证明 CI 不解析 human-readable output 且不误判 health。 |

## Equivalent Implementation Policy（等价实现策略）

文档可以放在 `docs/`、planning artifact 或 command reference 中；固定文件名不是 hard gate。Hard gate 是：examples 可执行、字段来自 owning SPEC、tests 证明语义、不泄露敏感路径。

## Evidence Plan（证据计划）

- `npm test -- test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts`
- 新增 CI examples regression tests 或 snapshot normalization tests
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
| 2026-06-15 | 0.1 | 创建 Epic 7.3 ready-for-dev Story，上下文覆盖 CI/enterprise automation 对 MVP JSON output 的安全消费。 | Amelia |
