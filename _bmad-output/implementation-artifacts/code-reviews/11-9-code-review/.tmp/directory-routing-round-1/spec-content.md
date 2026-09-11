# Story 11.9 Review Specification（Story 11.9 审查规范）

- Source: `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md`
- Status: `review`
- Story ID: `11-9`
- Review Series: `directory-routing`

## Original Acceptance Criteria（原始验收标准）

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

## Approved Replacement Boundary（已批准替换边界）

- 当前实现是真实的 directory-layer replacement：resolver 只负责 numeric identity、current candidate ownership、显式 `directoryChoice` 与物理路径安全。
- 原 approval、tracker、gate、scope/hash、freshness、round、supersession 与 coordinated-write owner 保持不变；禁止恢复旧 resolver 内的 approval replay engine。
- `reviewSeries=directory-routing` 从 round 1 新鲜审查；旧 `evidence-v2` 的 PASS、风险接受或止损授权仅属历史，不能作为本轮通过依据。
- 项目 v2 shared contract 优先于 global legacy `cr-config`；禁止低 quorum fallback、旧命名或清理旧 `.tmp`。
