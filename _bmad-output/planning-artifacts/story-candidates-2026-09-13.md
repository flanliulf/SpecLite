# Story Candidates（Story 候选）— 2026-09-13

本文记录 2026-09-13 公开文档体系整理过程中发现、但超出文档范围、需要作为后续 Story 规划的事项。它们尚未进入 `sprint-status.yaml`，不表示已排期或已批准；每项给出证据、产品诉求依据与验收草案，供规划下一 Epic 或 backlog 整理时裁决。

## SC-1 Post-MVP 命令的 outcome-oriented human output 迁移

- **现状**：`init`、`list`、`doctor`、`sync`、`uninstall`、`governance-report` 六个命令的 renderer 仍以 `Status:` 开头输出 legacy human output，不走 `renderPresentationFrame`，不支持 `--locale`（`src/diagnostics/output.ts` L333–830）。`HUMAN_OUTPUT_PRESENTATION_PROFILES` 只登记了三个 `resolve` key。
- **来源**：Story 8.8 把这六个命令的 profile 映射写成"若 renderer 被触达 / 未来迁移时"；Epic 8 retro `A7-2` 明确排除 Post-MVP 新命令。
- **产品诉求**：Epic 8 的 outcome-oriented、可扫描、本地化 human output 应覆盖全部面向人的命令，否则用户在治理命令上仍会误判"未写入 / 写入失败 / 只读诊断"。
- **验收草案**：六个命令输出 `Outcome（结果）` frame 与 profile-specific section；支持 `--locale`；`docs/reference/cli-human-output-matrix.md` 新增对应 command/outcome 行并附 focused tests；JSON contract 不变。
- **关联文档**：`docs/reference/cli.md` Output Modes、`docs/reference/cli-human-output-matrix.md` Presentation Profiles 已标注"映射已定义，renderer 未迁移"。

## SC-2 `validate` Next Actions 按 severity 过滤

- **现状**：`createValidateCommandResult` 只有两种 nextActions：无 issue 一句，有任何 issue 就输出 "Inspect manifest-schema issues and repair or reinstall installed-state metadata."；zh-CN renderer 又为每条 issue 追加一行"检查 …"。fresh install 后立即 `validate` 会得到 20 余条针对 `info` 级 `not-yet-produced` 的 Next Actions，以及一条与实际 issue 无关的 manifest-schema 提示。
- **来源**：`9a88a1a` 引入 `artifact-path.missing-required-artifact` 的 `not-yet-produced`（`info`）两态后，nextActions 生成逻辑未同步。
- **产品诉求**：Story 8.6 / 8.9 要求 Next Actions 是 outcome-oriented、可扫描的下一步，而不是 issue 列表的回声。
- **验收草案**：`info` 级 issue 不产生 Next Actions；nextActions 按最高 severity 与 category 生成，manifest-schema 提示只在存在该类 issue 时出现；`test/validate-command.test.ts` 与 human output matrix 增加 pristine install 用例。

## SC-3 `artifact-path.fixture-write-failed` 的归属

- **现状**：SPEC 07（zh / en）把它列为稳定 issue id；`src/validation/rules/artifact-path.ts` 只有类型联合声明，无产出点、无测试、无 fixture。
- **产品诉求**：SPEC 07 是 issue taxonomy 的 owning contract，公开文档 `docs/reference/validation-issues.md` 只能如实标注"当前无产出点"。
- **验收草案**：二选一并同步 SPEC 07 与 `validation-issues.md`：在 fixture writer（Story 6.x 的 fixture contract）中实现并加 fail-closed 测试；或从 SPEC 07 与类型联合中移除，并在 SPEC 07 变更记录中说明。

## SC-4 SPEC 09 追认 Flow Gate report v2

- **现状**：SPEC 09 `FlowGateReportMetadata` 仍声明 `schemaVersion: "speclite.flow-gate-report.v1"`；`src/hooks/flow-gate-enforcement.ts` 以 `v2` 为 REQUIRED、`v1` 为 LEGACY（拒绝）；`speclite-flow-gate` 的 `assets/report-template.md` 与 CHANGELOG 已是 `v2`，新增 `handoffContractVersion`、`foundationPrerequisiteStatus`、`foundationPrerequisiteRefs`、`closureOwnerCheckStatus`、`closureOwnerRefs`、`sourceSkill`。公开文档 `docs/reference/specs/flow-gate-handoff-contract.md` 已按 v2 描述。
- **产品诉求**：SPEC 09 是 lifecycle contract 的唯一 owner；owner 落后于实现会让后续 Story 的 kickoff gate 无法引用正确契约（Epic 11 retro `A11-3`、`A11-5` 相关）。
- **验收草案**：SPEC 09 更新 `FlowGateReportMetadata` 到 v2 字段集与允许值；注明 v1 为 legacy 且 hook 拒绝；记录 30 天 freshness policy（`MAX_METADATA_AGE_DAYS`）是否上升为契约；`docs/reference/specs/flow-gate-handoff-contract.md` 的 Freshness Policy 小节同步。

## Related Evidence（相关证据）

- `docs-review-2026-09-13.md`、`docs-review-round2-2026-09-13.md`（session scratch 报告）。
- Epic 8 retro：`_bmad-output/implementation-artifacts/epic-8-retro-2026-07-06.md`。
- Epic 11 retro：`_bmad-output/implementation-artifacts/epic-11-retro-2026-09-12.md`。
