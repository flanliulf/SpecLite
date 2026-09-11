# Story 11.9 Review Spec（Story 11.9 审查规格）

- Story: `11-9-normalize-code-review-artifact-directories-by-story-id`
- Status at freeze: `review`
- Review series / round: `evidence-v2 / 4`

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
|---|---|---|
| numeric canonical root | normalization table | `FAIL_CONTRACT` |
| single resolution/propagation | CR01–06、all artifacts、`.tmp/`、goal records 使用同一 `crDir` | `FAIL_FUNCTION` |
| legacy/ambiguity/no-migration | resume + dual-dir fixtures | `FAIL_EVIDENCE` |
| active corpus closure | title-bearing negative scan | `FAIL_EVIDENCE` |

## Review Boundaries（审查边界）

- Equivalent implementation policy：helper 位置可调整；numeric-only root、single `crDir` propagation、single-round directory、legacy no-migration、ambiguous stop 与 traversal safety 不可改变。
- Round 1 六项已由 completed fixRecord 关闭；Round 2 F6 reserved-path hardening 已由 completed fixRecord 与后续 fresh review 关闭。
- Round 3 F1（selected-series `@round` malformed intent）与 F2（bounded inline-list 非法 double-quoted escape）已完成两文件 authorized fix，本轮须 fresh 复核，不能预设通过。
- Round 2 F5 time precision 与 F7 supersededIndex 保持原 fingerprint 的 `T2 deferred`，不修、不升级。
- whole-YAML 文档有效性、full YAML key grammar、raw-byte vs canonical hash、live backlog authentication、resolver 重演 evaluator closure 与并发 TOCTOU 均已由 Evaluator 基于 owner 边界 dismissed；没有新的明确 owner 与具体失败场景时不得换语法或措辞升级。
