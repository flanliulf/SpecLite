# Spec Contracts Index（SPEC 契约索引）

## Status（状态）

已接受用于 MVP planning。

## Purpose（用途）

本索引定义 MVP contracts 的 implementation reading order 和 ownership boundary。

Implementation agents 在实现或变更某个领域的行为之前，必须阅读对应的 owning SPEC。PRD 和 Architecture 是摘要与映射；当某个 SPEC 存在时，PRD 和 Architecture 不得被视为 field-level contract sources。

## Reading Order（阅读顺序）

1. `01-command-result-json-contract.md`：公开 `CommandResult` JSON、issue model projection、schema anchor、ordering、path、timestamp 和 summary policy。
2. `02-source-descriptor-contract.md`：source trust、integrity evidence、source staging/cache redaction，以及 validate no-network boundary。
3. `03-install-plan-contract.md`：source resolution plan、install/update/repair planning、write authorization、operation lock、safe writes、rollback boundary 和 repair source policy。
4. `04-manifest-index-contract.md`：manifest/index installed-state projections、files index、phase coverage matrix、hashes、ownership projection 和 installed metadata。
5. `05-ide-adapter-registry-contract.md`：MVP target ids、adapter definitions、target order、unsupported/failed status boundary，以及 command pointer non-goal。
6. `06-resolve-command-contract.md`：`speclite resolve` stdout/stderr、merge order、fallback、array merge、layer failure 和 parity fixtures。
7. `07-validation-issue-taxonomy.md`：issue categories、issue ids、default severity，以及 validation fixture ownership。
8. `08-fixture-contract.md`：fixture layout、expected outputs、snapshot comparison、release gate ownership matrix、release gates 和 regression asset policy。
9. `09-sdlc-workflow-lifecycle-contract.md`：SDLC workflow artifact roots、Story lifecycle schema、Flow Gate mode/result、anchor policy、Story template sections 和 legacy baseline rule。

## Implementation Anchors（实现锚点）

Owning SPEC 内的 `Implementation Anchor` 是实现侧必须复用的 executable schema/parser/registry 入口。MVP 至少包含：

- `src/diagnostics/command-result-schema.ts`
- `src/source/source-descriptor-schema.ts`
- `src/installer/install-plan-schema.ts`
- `src/manifest/manifest-schema.ts`
- `src/ide/adapter-registry.ts`
- `src/config/resolve-output-schema.ts`
- `src/fixtures/fixture-contract.ts`

## Canonical Skill Contract Anchors（Canonical Skill 契约锚点）

SDLC workflow lifecycle contract 的运行载体是 canonical skill packages 与审计脚本，不是产品 runtime TypeScript schema。对应 source anchors 为：

- `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/SKILL.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/assets/story-template.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/assets/sprint-status-template.yaml`
- `_bmad-output/implementation-artifacts/config-audits/speclite-canonical-skill-config-audit/scripts/audit-canonical-skill-rule-coverage.mjs`
- `_bmad-output/implementation-artifacts/config-audits/speclite-canonical-skill-config-audit/scripts/triage-rule-coverage.mjs`

## MVP Non-Goals（MVP 非目标）

除非未来 SPEC 明确将其提升为契约，否则不要从 Post-MVP 摘要中实现以下内容：

- branded Copilot/Cursor target ids 或 dedicated adapters
- command pointer artifacts
- 顶层 `speclite repair`
- `speclite sync`、`doctor`、`uninstall` 或 migration commands
- backup/restore 或 standalone update report artifacts
- 完整的 source lockfile lifecycle management
- enterprise source policy、signatures、provenance verification 或 allowlists
- coverage dashboards、trend reports 或 multi-project rollups

## Live Gate Boundary（Live Gate 边界）

`_bmad-output/planning-artifacts/archive/` 只保存 historical snapshot，不参与 live planning consistency gate、implementation readiness gate、contract ownership 判断或 release gate 断言。Implementation agents、Grill 修复和 link/consistency scans 必须读取本索引列出的 live sharded documents 与 owning SPECs；若 archive wording 与 live documents 冲突，以 live documents 和 owning SPECs 为准。

## Canonical Language And Mirrors（规范语言与镜像）

中文 `.md` 文件是 MVP live contract 的 canonical source。`.en.md` 文件只是辅助 mirror，用于外部阅读或对照；它不得单独定义行为、字段、issue id、fixture gate、schema version 或 implementation anchor。若 `.en.md` 与中文 `.md` 冲突，implementation agents 必须以中文 `.md` 为准，并把 mirror 更新视为后续同步任务，而不是从 mirror 反推契约。

## Historical Evidence Boundary（历史证据边界）

`_bmad-output/planning-artifacts/research/` 保存 historical research evidence。它可以解释背景、样本和被比较系统，但不参与 MVP planning consistency gate、implementation readiness gate、contract ownership 判断或 release gate 断言。Research 中的旧术语、外部样本名称或历史实现描述不得覆盖 live PRD、Architecture、Epics、ADRs 或 owning SPECs。

## ADR Relationship（ADR 关系）

ADR 记录 hard-to-reverse decisions 的背景、理由和 trade-off。它可以解释为什么选择某个契约边界，但不得重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchor。若 ADR 与 owning SPEC 冲突，以 owning SPEC 为准；需要保留决策背景时，同步修订 ADR wording，使它引用而不是复制契约字段。

## Post-MVP Extension SPEC Reservation（Post-MVP 扩展 SPEC 预留）

未来若提升 `speclite init`、`speclite list`、`speclite doctor`、`speclite sync`、`speclite uninstall` 或 migration commands 为实现范围，必须先新增 owning SPEC，再进入 implementation schema/parser 和 fixtures。推荐命名为 `10-post-mvp-command-contracts.md` 或按 command 拆分为独立 contract；这些预留 SPEC 不属于 MVP gate，除非后续 PRD/Architecture 明确改写范围。

## Change Rule（变更规则）

Contract changes 必须先更新 owning SPEC，再更新 implementation schemas/parsers，最后更新 fixtures。Snapshot changes 不得单独定义新行为。
