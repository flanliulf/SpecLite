# Archive Documents（归档文档）

## Scope（范围）

本目录保存 planning artifacts 拆分前的 historical snapshot。这里的 `prd.md`、`architecture.md` 和 `epics.md` 只用于追溯，不参与 live planning consistency gate、implementation readiness gate、contract ownership 判断或 release gate 断言。

Live planning truth 必须读取以下 sharded folders：

- `_bmad-output/planning-artifacts/prd/`
- `_bmad-output/planning-artifacts/architecture/`
- `_bmad-output/planning-artifacts/epics/`
- `_bmad-output/planning-artifacts/specs/`

## Validation Policy（验证策略）

一致性扫描、link check、readiness report、Grill 修复和 implementation agents 不得把本目录中的旧 wording 当作当前契约冲突。若 archive 与 live sharded documents 或 owning SPECs 冲突，以 live sharded documents 和 owning SPECs 为准。
