# Spec Content（规格内容）

## Acceptance Criteria（验收标准）

1. 新 CR run 唯一 root 为 `{implementation_artifacts}/code-reviews/{story_id}-code-review/`。
2. `{story_id}` 只来自规范编号，点转连字符；Story `11.9` 精确为 `11-9-code-review/`。
3. Title/name/slug/filename 的非编号文本、中文、空格、标点不得参与目录名。
4. Orchestrator 只解析一次 canonical `$cr_dir` 并传给 CR01–06；下游不得重新推导。
5. Review/evaluation/fix/rules/TODO/finalization/temp/round artifacts 全部写同一目录。
6. Goal records 固定在 `$cr_dir/goal-execute-records/`，继续使用 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
7. 审计并同步 orchestrator、CR01–06、shared contract/config、templates、help、metadata/contracts、scripts/hooks/fixtures/docs 及全部 `$cr_dir` expressions。
8. Existing title-bearing CR directories 不自动迁移、重命名或删除。
9. Legacy-only unfinished run 必须诊断并在一个目录内恢复；canonical+legacy 无法唯一判定 current round 时 stable conflict + stop，不猜测、不拆轮。
10. Negative scan 排除 active title-bearing patterns；仅 legacy fixtures/明确 compatibility docs 可分类保留。
11. Tests 覆盖纯编号、任意 title 不影响、CR01–06 同 `$cr_dir`、goal records、legacy-only、dual-dir ambiguity 与 title traversal 无法越界。
12. 不修改 report basenames、CR algorithm、round numbering 或 approval rules。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| numeric canonical root | normalization table | `FAIL_CONTRACT` |
| single resolution/propagation | review、evaluation、fixer append、rules、TODO result、finalizer、`.tmp/`、goal records 全部使用同一 normalized `$cr_dir` | `FAIL_FUNCTION` |
| legacy/ambiguity/no-migration | resume + dual-dir fixtures | `FAIL_EVIDENCE` |
| active corpus closure | title-bearing negative scan | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Parser/helper 位置可调整；numeric-only root、single `$cr_dir` propagation、single-round directory、legacy no-migration、ambiguous stop 与 traversal safety 不可改变。

## Anchor Evidence Summary（锚点证据摘要）
- Normalization：`11.9` 与 `11-9` 唯一归一为 `11-9-code-review`；非数字、零前缀、title 与 traversal inputs fail-close。
- Propagation：runner resolver invocation count 为 1，CR01–06、all artifacts、`.tmp/`、`goal-execute-records/` 消费同一 `crDir`。
- Legacy / ambiguity：唯一 unfinished legacy 原位 resume；completed legacy 使用 canonical；dual/multi 或 unsafe evidence 产生 stable、redacted、zero-write diagnostic。
- Scan / install：active title-bearing expression 为零；fresh `.agents` / `.claude` resolver bytes、mode 与 CLI probe 通过。
- Gates：kickoff `PASS`；completion `PASS_EQUIVALENT`；Story status target=`review`。
