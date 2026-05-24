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
8. `08-fixture-contract.md`：fixture layout、expected outputs、snapshot comparison、release gates 和 regression asset policy。

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

## Change Rule（变更规则）

Contract changes 必须先更新 owning SPEC，再更新 implementation schemas/parsers，最后更新 fixtures。Snapshot changes 不得单独定义新行为。
