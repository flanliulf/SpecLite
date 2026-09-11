# Acceptance Audit（验收审计）

## Metadata（元数据）

- Agent：`/root/epic11_9_r2_auditor_live`
- Role：Story 11.9 evidence-v2 Round 2 Acceptance Auditor
- Model：OpenAI GPT-5.6 Sol（high）
- Completed At：`2026-09-07T10:22:56Z`
- Diff SHA-256：`8218ebd79e971467e66d7ac18732f32d2c17a097047532e08d6040743e968b50`
- Existing Focused Evidence：`103 passed / 4 todo / 0 failed`
- Findings：`1 blocking`（层建议，不是 Evaluator 已裁决优先级）
- Execution：只读；未运行 test、build、packaging、full-suite 或 writer；未读其他层/历史报告。

## Findings（发现）

### Reserved CR Subpath Symlink（保留子路径软链接可写出目录）

- Layer suggestion：`[P1][blocking]`，交由 CR02 裁决，root 不采纳为已授权修复。
- Category：`filesystem-containment`
- Invariant：所有 temporary artifacts 与 goal records 必须物理保持在同一 resolved `$crDir` 内；任何 consumer 写入前，reserved subpath 不得通过 symlink 或非目录节点逃逸。
- Concrete failure scenario：磁盘上存在 canonical `state/code-reviews/11-9-code-review/`，其中预置 `.tmp -> /outside` symlink，且不存在 current artifacts。resolver 枚举 `.tmp` 后将其分类为 `unrelated` 并直接跳过，最终返回 `ok:true`、`crDir=state/code-reviews/11-9-code-review`。CR01 随后按 frozen contract 写 `{crDir}/.tmp/review-input.diff` 时，实际修改 `/outside/review-input.diff`，而不是 resolved `$crDir` 内的文件。将 `.tmp` 替换为 `goal-execute-records` 时，`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 同样可写出 `$crDir`。
- AC 引用：AC-5 temp/round artifacts 必须全部写入同一目录；AC-6 Goal records 固定在 `$crDir/goal-execute-records/`；AC-11 目录相关 traversal 不得越界。
- Primary location：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:271-276`
- 代码证据：安全类型检查只在 `classifyArtifactName()` 返回非 `unrelated` 后执行；`.tmp` 与 `goal-execute-records` 不属于 artifact filename family，因此在第 273 行被跳过，reserved subpath 的 symlink/non-directory/containment 从未验证。

## AC Coverage（AC 覆盖）

| AC | 结论 | 实现证据 |
|---|---|---|
| AC-1–3 | Covered | normalizeStoryId 只接受 N.N/N-N，canonical root 仅由 numeric identity 构造。 |
| AC-4 | Covered | runner Step0 单次 shared resolver，CR01–06 传递同一四项冻结目录参数。 |
| AC-5 | Not fully satisfied | 各类产物 lexical path 已绑定，reserved .tmp symlink containment 仍有缺口。 |
| AC-6 | Not fully satisfied | goal records lexical path 固定，symlink 可物理写出。 |
| AC-7 | Covered | orchestrator、CR01–06、contract、help/docs、metadata、fixture、negative scan 有同步证据。 |
| AC-8 | Covered | resolver 只读，contract 禁止自动迁移 legacy/title-bearing 目录。 |
| AC-9 | Covered | 单一unfinished legacy resume；canonical冲突或multi-unfinished停止。 |
| AC-10 | Covered | ledger 与 active-corpus negative scan 区分 compatibility prose、legacy fixture 与 active expression。 |
| AC-11 | Partially covered | numeric/title traversal、dual-dir、legacy、round、frozen-context 有focused证据，reserved subpath仍有缺口。 |
| AC-12 | Covered | report basenames、CR algorithm、round numbering 与 approval rules 未改变。 |
