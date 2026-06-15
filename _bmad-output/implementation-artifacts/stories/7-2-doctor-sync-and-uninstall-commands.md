# Story 7.2: Doctor, Sync And Uninstall Commands（Doctor、Sync 与 Uninstall 命令）

Status: ready-for-dev

<!-- Post-MVP Story: 不属于 MVP implementation readiness gate。实现前必须先通过 Epic 7 kickoff / Story kickoff gate。 -->

## Story（故事）

作为工具链维护者，
我希望 Post-MVP 提供 `speclite doctor`、`speclite sync` 和 `speclite uninstall`，
以便进行更深入环境诊断、显式同步 source 与 IDE mirrors，并安全移除 installer-owned 安装结果。

## Acceptance Criteria（验收标准）

1. **Doctor reuses ValidationIssue model（Doctor 复用 ValidationIssue 模型）**
   **前提** 用户运行 Post-MVP `speclite doctor`；
   **当** 命令执行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断；
   **则** 输出复用 `ValidationIssue` category、issue id、severity 和 affected path 语义；
   **并且** 不发明第二套诊断模型。

2. **Doctor external access is explicit and authorized（Doctor 外部访问显式授权）**
   **前提** Post-MVP `speclite doctor` 需要访问远程 source 或执行 freshness/provenance revalidation；
   **当** 命令规划外部访问；
   **则** external access intent 必须显式展示并等待授权；
   **并且** external access shape 必须复用或扩展 install-plan contract 的 `SourceResolutionPlan.externalAccesses` 与 `ExternalAccess`，不得发明第二套授权模型；
   **并且** 不改变 MVP `validate` local-only 边界。

3. **Sync reuses manifest/index and ownership/hash（Sync 复用 manifest/index 与 ownership/hash）**
   **前提** 用户运行 Post-MVP `speclite sync`；
   **当** 命令显式同步 source 与 IDE mirrors；
   **则** 同步行为必须复用 manifest/index、files index、ownership/hash 和 adapter registry；
   **并且** `sync` 是 Post-MVP source-to-mirror reconciliation，不得改变 MVP `update` / `update --repair` 的 conflict、repair eligibility 和 ownership 语义；
   **并且** 不修改 human-owned custom 文件或 workflow-owned artifacts。

4. **Uninstall removes only installer-owned state（Uninstall 只移除 installer-owned 安装结果）**
   **前提** 用户运行 Post-MVP `speclite uninstall`；
   **当** 命令移除安装结果；
   **则** 只能移除 installer-owned 文件或目录；
   **并且** 对 human-owned custom 文件和 workflow-owned artifacts 必须保留或提示人工处理。

5. **Write-capable commands use lock, plan-before-write and safe write（写入命令使用锁、写前计划与安全写入）**
   **前提** Post-MVP `speclite doctor`、Post-MVP `speclite sync` 或 Post-MVP `speclite uninstall` 需要写入项目；
   **当** 命令进入写入阶段；
   **则** 必须使用 project operation lock、plan-before-write 和 safe write；
   **并且** 失败时输出 completed steps、failed step、pending steps 和 manual action。

6. **Post-MVP command JSON remains contract-first（Post-MVP 命令 JSON 仍先契约后实现）**
   **前提** Post-MVP 新命令输出 `--json`；
   **当** 机器可读结果被生成；
   **则** 复用 `CommandResult` 兼容扩展机制；
   **并且** command-specific `data` payload 必须先由对应 command owning SPEC 定义，再同步 `CommandResult` schema anchor 和 fixture expected outputs；
   **并且** 不破坏 MVP fixture 和既有 automation 依赖。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Add command contracts before implementation（AC: 1, 2, 6）
  - [ ] 扩展 `01-command-result-json-contract.md`，定义 `doctor`、`sync`、`uninstall` command ids、data payloads、exit code 和 issue projection。
  - [ ] 如 `doctor` 增加 external access intent，先扩展 `03-install-plan-contract.md` 的 `SourceResolutionPlan.externalAccesses` / `ExternalAccess` 语义。
  - [ ] 更新 `src/diagnostics/command-result-schema.ts` 与 contract tests。

- [ ] Task 2: Implement `speclite doctor` as richer diagnostics（AC: 1, 2）
  - [ ] 在 `src/bin/speclite.ts` 注册 command，把实现放入 `src/commands/doctor.ts` 或等价模块。
  - [ ] 复用 `src/validation/validate-project.ts`、`src/validation/issue-model.ts`、`src/validation/validation-order.ts`，不得创建第二套 issue category / severity。
  - [ ] 保持 `speclite validate` local-only；doctor 的 remote freshness/provenance check 必须显式授权。

- [ ] Task 3: Implement `speclite sync` as source-to-mirror reconciliation（AC: 3, 5, 6）
  - [ ] 复用 `src/update/update-plan.ts`、`src/update/conflict-detector.ts`、`src/update/ownership-model.ts` 与 `src/ide/adapter-registry.ts`。
  - [ ] 明确 `sync` 与 `update` / `update --repair` 的不同：同步 source 与 IDE mirrors，不改变普通 update conflict / repair eligibility。
  - [ ] 写入只允许 installer-owned mirror/control state；human-owned custom 与 workflow-owned artifacts 必须 skip/conflict。

- [ ] Task 4: Implement `speclite uninstall` safely（AC: 4, 5, 6）
  - [ ] 读取 files index、manifest、skill index 和 ownership classification，生成 uninstall plan。
  - [ ] 只能移除 installer-owned paths；对 human-owned custom 与 workflow-owned artifact 输出保留/人工处理动作。
  - [ ] 删除或更新 manifest/index 相关 control files 时必须保留 project-relative POSIX path 和 redaction。

- [ ] Task 5: Verification（AC: 1-6）
  - [ ] 新增 focused command tests 和 fixture cases，覆盖 external access intent、conflicts、safe write failure、uninstall protected paths。
  - [ ] 运行 `npm run build`、focused tests、`npm test` 或记录阻塞、`git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`
- Validation taxonomy: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- Install plan / external access / write authorization: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- Manifest/index and files index: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- CommandResult contract: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`

### Current Implementation Anchors（当前实现锚点）

- Validation orchestration: `src/validation/validate-project.ts`
- Validation model and order: `src/validation/issue-model.ts`, `src/validation/validation-order.ts`
- Update / repair planning: `src/update/update-plan.ts`, `src/update/conflict-detector.ts`, `src/update/ownership-model.ts`
- Operation lock and safe write: `src/fs/operation-lock.ts`, `src/fs/safe-write.ts`
- IDE mirror checks: `src/validation/rules/ide-mirror.ts`, `src/ide/adapter-registry.ts`
- Existing update command: `src/commands/update.ts`
- Existing validate command: `src/commands/validate.ts`

### Scope Boundary（范围边界）

- 不改变 `speclite validate` 的 local-only contract。
- 不把 `sync` 实现成隐藏 repair，也不让普通 `--yes` 绕过 conflicts。
- 不删除 human-owned custom files 或 workflow-owned artifacts。
- 不新增 enterprise policy engine、daemon、hosted service 或 GUI。
- 不让 `doctor` remote checks 在无授权时访问网络。

## Dependency Gate（依赖门禁）

- `doctor`、`sync`、`uninstall` 的 command contract 必须先被 SPEC 接受。
- 若 Story 7.1 尚未完成，本 Story 可先实现通用 command framework，但必须预留 hook artifact extension point。
- Story 7.1 完成后，`doctor` / `sync` / `uninstall` 必须把 hook config、hook runner 和 hook source metadata 纳入 installer-owned artifact 诊断、同步和移除范围。
- 本 Story 不得依赖 Story 7.5 的 `init` / `list` internals。
- `sync` / `uninstall` 写入前必须有 operation lock；缺失锁视为 `FAIL_CONTRACT` 或 `FAIL_FUNCTION`。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | 定义新 command result shape。 |
| Contract Anchor | `03-install-plan-contract.md` | `doctor` external access intent 必须复用/扩展同一授权模型。 |
| Contract Anchor | `07-validation-issue-taxonomy.md` | `doctor` 不得定义第二套 issue model。 |
| Functional Anchor | `src/commands/doctor.ts`, `src/commands/sync.ts`, `src/commands/uninstall.ts` | 推荐模块边界；等价实现需可审查。 |
| Functional Anchor | `src/update/*`, `src/fs/*`, `src/validation/*` | 必须复用现有 update / validation / safe-write 基座。 |
| Evidence Anchor | focused command tests + fixtures | 证明 protected paths、external access、conflict 和 JSON schema。 |

## Equivalent Implementation Policy（等价实现策略）

命令实现可以拆分或集中，但必须保留独立 command id、contract schema、renderer tests 和 safe-write path。Reviewer 不得只按建议文件名判定失败；但缺少 SPEC 更新、缺少 lock 或跳过 ownership/hash 检查必须失败。

## Evidence Plan（证据计划）

- 新增 `test/doctor-command.test.ts`、`test/sync-command.test.ts`、`test/uninstall-command.test.ts` 或等价 focused tests。
- 复用并扩展 `test/update-command.test.ts`、`test/validate-command.test.ts`、`test/operation-lock-safe-write.test.ts`。
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
| 2026-06-15 | 0.1 | 创建 Epic 7.2 ready-for-dev Story，上下文覆盖 `doctor` / `sync` / `uninstall` 的 Post-MVP 安全边界。 | Amelia |
