# Story 8.3: Update And Repair Outcome-Oriented Output（Update 与 Repair Outcome 导向输出）

Status: ready-for-dev

<!-- Corrective planning Story: 聚焦 `speclite update` 与 `speclite update --repair` 的 human-readable output，不改变 update/repair safety semantics。 -->

## Story（故事）

作为项目维护者，
我希望 `speclite update` 和 `speclite update --repair` 清楚区分计划、授权、conflict、no-op、已执行和失败，
以便我能安全更新 installer-owned 文件，同时保护 human-owned 和 workflow-owned 内容。

## Acceptance Criteria（验收标准）

1. **Unapplied update plan shows plan-ready（未应用 update plan 显示 plan-ready）**
   **前提** 用户运行 `speclite update` 且未传入 `--yes`；
   **当** 系统生成 unapplied update plan；
   **则** outcome 为 `plan-ready`；
   **并且** Summary 明确说明尚未写入；
   **并且** Next Actions 说明可用 `speclite update <target> --yes` 授权无 conflict planned writes。

2. **No changed paths shows no-op（无 changed paths 显示 no-op）**
   **前提** update plan 没有 changed paths；
   **当** 系统判断无需更新；
   **则** outcome 为 `no-op`；
   **并且** 输出应明确 `No planned writes` 或等价中文 empty state。

3. **Conflicts show blocked-by-conflict（Conflict 显示 blocked-by-conflict）**
   **前提** update 或 repair 存在 conflicts；
   **当** 输出 human-readable result；
   **则** outcome 为 `blocked-by-conflict`；
   **并且** conflict、protected paths、ownership 和 reason 必须可见；
   **并且** 不得提示用户用普通 `--yes` 绕过 conflict。

4. **Unapplied repair plan shows repair-plan-ready（未应用 repair plan 显示 repair-plan-ready）**
   **前提** 用户运行 `speclite update --repair` 且未传入 `--yes`；
   **当** 系统生成 repair plan；
   **则** outcome 为 `repair-plan-ready`；
   **并且** Summary 明确 repair 是显式恢复动作，不是普通 update 的隐藏模式。

5. **Applied update/repair shows applied with boundaries（已执行 update/repair 显示 applied 及边界）**
   **前提** update 或 repair 已执行写入；
   **当** 输出 applied result；
   **则** outcome 为 `applied`；
   **并且** changed、skipped、conflicts、protected boundaries 和 next validation action 必须可见。

6. **Partial or failed write shows partial-or-failed（部分执行或写入失败显示 partial-or-failed）**
   **前提** update 或 repair 已进入、准备进入或部分完成写入阶段；
   **当** apply、safe-write、operation-lock 或 partial execution failure 阻止完整完成；
   **则** outcome 为 `partial-or-failed`；
   **并且** Summary 必须说明是写入/repair 执行未完整完成，而不是普通 conflict 或 no-op；
   **并且** Evidence 必须列出已完成写入、失败步骤或 blocker、未执行项和受保护边界；
   **并且** Issues 必须保留 command-level blocker 或 failure reason，不能把 path-level conflicts 复制成多个 command-level `issues[]`；
   **并且** Next Actions 必须给出人工恢复、重新运行或验证动作，并明确哪些步骤尚未执行。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Derive update/repair outcomes without changing data schema（AC: 1-6）
  - [ ] 从 `UpdateCommandData` / `RepairCommandData` 的 `updatePlan`、`repairPlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized` 推导 human outcome。
  - [ ] 当 apply、safe-write、operation-lock 或 partial execution failure 发生时，推导 `partial-or-failed`，并区分已完成写入、失败步骤、未执行项和保护边界。
  - [ ] 保持 `update.conflicts` command-level issue 只汇总 conflictCount，不把 path-level conflicts 复制成多个 `issues[]`。
  - [ ] Outcome label 不写入 JSON，除非先更新 SPEC。

- [ ] Task 2: Update renderer and catalog（AC: 1-6）
  - [ ] 扩展 `renderUpdateHumanOutput()`，支持 `plan-ready`、`repair-plan-ready`、`no-op`、`blocked-by-conflict`、`applied`、`partial-or-failed`。
  - [ ] 使用 shared output frame：Summary、Scope、State、Evidence、Issues、Next Actions。
  - [ ] Empty states 明确显示 `无 planned writes`、`无 conflict`、`未写入项目文件`。
  - [ ] `partial-or-failed` 的 Summary、Evidence、Issues、Next Actions 必须覆盖已完成写入、失败步骤或 blocker、未执行项、protected boundaries 和恢复/验证动作。

- [ ] Task 3: Preserve update safety semantics（AC: 3-6）
  - [ ] 不修改 `src/update/update-plan.ts` 的 ownership/hash/conflict 规则，除非 Story 明确需要修复 renderer 无法表达的数据缺口。
  - [ ] `--yes` 只能授权无 conflict planned writes；不能把 conflict 转为 repair。
  - [ ] `update --repair` 必须保持 explicit repair，不作为普通 update 隐藏模式。

- [ ] Task 4: Tests（AC: 1-6）
  - [ ] 覆盖 unapplied plan、repair plan、no-op、conflict、applied、operation-lock failure、safe-write failure 和 partial execution failure。
  - [ ] 覆盖 human-readable 不提示用普通 `--yes` 绕过 conflict。
  - [ ] 覆盖 JSON output 不新增字段、sorting 不变。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- Update safety epic: `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`
- CommandResult contract: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- Install plan / write authorization: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`

### Current Implementation Anchors（当前实现锚点）

- Command entry: `src/commands/update.ts`
- Planning: `src/update/update-plan.ts`
- Conflict detection: `src/update/conflict-detector.ts`
- Ownership: `src/update/ownership-model.ts`
- Operation lock: `src/fs/operation-lock.ts`
- Renderer: `src/diagnostics/output.ts`
- Existing tests: `test/update-command.test.ts`, `test/update-planning.test.ts`, `test/ownership-model.test.ts`, `test/operation-lock-safe-write.test.ts`

### Scope Boundary（范围边界）

- 不改变 update/repair planning semantics。
- 不新增 `sync` 或 Post-MVP source-to-mirror reconciliation；那属于 Story 7.2。
- 不新增 public JSON fields。
- 不允许 ordinary `--yes` 绕过 conflicts。

## Dependency Gate（依赖门禁）

- Story 8.1 shared frame 应先完成或在本 Story 中只做 update/repair 最小等价迁移。
- Epic 4 update/repair behavior 是 contract anchor；renderer 不得改变行为。
- 如果新增 renderer helper 需要读取 terminal width / NO_COLOR，必须不影响 JSON output。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | Update/repair JSON data shape 和 `update.conflicts` issue 语义。 |
| Contract Anchor | `03-install-plan-contract.md` | `--yes` / write authorization / plan-before-write 语义。 |
| Functional Anchor | `src/update/update-plan.ts` | Update/repair plan source。 |
| Functional Anchor | `src/diagnostics/output.ts` | Human renderer。 |
| Evidence Anchor | update focused tests | 覆盖 all outcomes、conflict visibility、JSON stability。 |

## Equivalent Implementation Policy（等价实现策略）

可以新增 `src/cli/update-output.ts` 等 helper，只要 `renderUpdateHumanOutput()` 或等价入口使用它。Reviewer 应检查 behavior/evidence，而不是固定文件名。

## Evidence Plan（证据计划）

- `npm test -- test/update-command.test.ts test/update-planning.test.ts test/ownership-model.test.ts test/operation-lock-safe-write.test.ts`
- 新增 update outcome focused tests
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
| 2026-06-15 | 0.1 | 创建 Epic 8.3 ready-for-dev Story，聚焦 update/repair outcome-oriented human output。 | Amelia |
