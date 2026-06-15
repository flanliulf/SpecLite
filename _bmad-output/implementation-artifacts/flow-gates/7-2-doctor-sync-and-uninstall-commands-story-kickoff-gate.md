# Flow Gate Report: 7-2-doctor-sync-and-uninstall-commands

## Summary（摘要）

- Mode: `story-kickoff`
- Target: `7-2-doctor-sync-and-uninstall-commands`
- Date: `2026-06-15`
- Result: `PASS`
- Model Used: `GPT-5 (Codex)`

本报告按 `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/SKILL.md` 与 `references/workflow-details.md` 的 `story-kickoff` mode 执行；其中 canonical 定义中的 `{implementation_artifacts}` 按本仓库实际映射为 `_bmad-output/implementation-artifacts`。本次只生成 gate evidence，不修改源码、不推进 Story 状态、不替代后续 `bmad-dev-story` 或 CR。

## Contract Anchors（契约锚点）

- `PASS`: 已加载 BMad runtime config：`_bmad/bmm/config.yaml` 指向 `_bmad-output/planning-artifacts` 与 `_bmad-output/implementation-artifacts`。
- `PASS`: 已读取 `_bmad-output/implementation-artifacts/sprint-status.yaml`，当前 `epic-7: in-progress`，`7-1-flow-gate-hook-enforcement: done`，`7-2-doctor-sync-and-uninstall-commands: ready-for-dev`。本 gate 发生在 `ready-for-dev` -> `in-progress` 之前。
- `PASS`: Epic-level predecessor evidence 已存在：`_bmad-output/implementation-artifacts/flow-gates/epic-7-kickoff-gate.md` 结果为 `PASS`。
- `PASS`: Story file 存在并可读取：`_bmad-output/implementation-artifacts/stories/7-2-doctor-sync-and-uninstall-commands.md`，状态为 `ready-for-dev`。
- `PASS`: Story `7-2` 包含 lifecycle sections：`Dependency Gate`、`Anchor Contract Map`、`Equivalent Implementation Policy`、`Evidence Plan`、`Anchor Evidence Summary`。
- `PASS`: Story `7-2` 的 owning SPEC anchors 存在：`01-command-result-json-contract.md`、`03-install-plan-contract.md`、`04-manifest-index-contract.md`、`07-validation-issue-taxonomy.md`。
- `PASS`: Story `7-2` 明确要求 `doctor`、`sync`、`uninstall` 的 command contracts 先进入 owning SPEC，再同步 executable schema/parser 和 tests；该 contract-first 顺序属于本 Story 开发任务。

## Functional Anchors（功能锚点）

- `PASS`: Story `7-1-flow-gate-hook-enforcement` 已完成并标记为 `done`，建立了 hook config、hook runner 和 hook source metadata 的 installer-owned artifact projection 基座。
- `PASS`: 现有 MVP command / validation / update / safe-write anchors 存在，Story `7-2` 可复用 `src/validation/validate-project.ts`、`src/validation/issue-model.ts`、`src/update/update-plan.ts`、`src/fs/operation-lock.ts`、`src/fs/safe-write.ts`、`src/ide/adapter-registry.ts` 等基座。
- `PASS`: 当前尚未实现 `doctor`、`sync`、`uninstall`；这些是 Story `7-2` 的开发目标，不构成 kickoff 前置 failure。
- `PASS_WITH_LIMIT`: Story `7-2` 不得依赖 Story `7-5` 的 `init` / `list` internals；本 kickoff 未发现必须依赖 `7-5` 的前置 blocker。

## Evidence Anchors（证据锚点）

- `PASS`: Story `7-1` finalizer 已完成，`sprint-status.yaml` 中 `7-1-flow-gate-hook-enforcement: done`。
- `PASS`: Story `7-2` 的 `Evidence Plan` 已列出 command tests / fixture cases、`npm run build`、`npm test`、`git diff --check`。
- `PASS`: Story `7-2` 的 `Anchor Contract Map` 已将 command contract、external access authorization、ValidationIssue reuse、safe write / ownership anchors 和 focused tests 分类，后续 CR 可按该映射审查。
- `PASS_WITH_LIMIT`: 当前工作树包含 Story `7-1` 已完成但未提交的改动、Epic 8 既有未追踪文件和本次 gate/progress files。本 gate 不回滚、不整理、不提交这些既有改动；后续开发与提交必须继续隔离 scope。

## Guidance Equivalence（指引等价性）

- `PASS_EQUIVALENT_NOTE`: 本报告将 `speclite-flow-gate` 定义中的 `_speclite/config.toml`、`_speclite-output`、`speclite-dev-story` 等 workflow 概念映射为当前仓库对应的 `_bmad/bmm/config.yaml`、`_bmad-output`、`bmad-dev-story`，沿用既有 Epic 6 / Epic 7 / 7-1 gate 报告。
- `PASS_EQUIVALENT_NOTE`: `sprint-status.yaml` 的 `story_location` 为 `_bmad-output/implementation-artifacts`，而实际 Story markdown 位于 `_bmad-output/implementation-artifacts/stories/`。本次按现有仓库 canonical Story 目录读取 Story evidence。
- `NO_CONFLICT`: Story `7-2` 的推荐 command module 名称可以等价调整，但必须保留独立 command id、contract schema、renderer tests、safe-write path 和 ownership/hash 检查。

## Missing Or Ambiguous Items（缺失或歧义项）

- 无 `story-kickoff` blocker。
- 需要后续开发实现的项目已在 Story Tasks 中列明：`doctor`、`sync`、`uninstall` command contracts、source/IDE mirror reconciliation、safe uninstall plan、lock/safe-write behavior、JSON schema/tests 和 fixtures。

## Recommended Next Action（推荐下一步）

Story `7-2-doctor-sync-and-uninstall-commands` 的 `story-kickoff` gate 通过。可以启动 fresh dev sub-agent 执行：

```text
/bmad-dev-story story 7-2
```

该 dev step 必须先更新 command owning SPEC，再实现 `doctor`、`sync`、`uninstall`；不得改变 `validate` local-only contract，不得删除 human-owned custom files 或 workflow-owned artifacts，不得把 `sync` 实现成隐藏 repair。

---

*本文档由 speclite-flow-gate Skill 自动生成*
