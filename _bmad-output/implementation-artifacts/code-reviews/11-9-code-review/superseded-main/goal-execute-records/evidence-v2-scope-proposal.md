# Evidence v2 Scope Proposal（证据 v2 范围提案）

## Snapshot（快照）

- `storyId`: `11-9`
- `storyKey`: `11-9-normalize-code-review-artifact-directories-by-story-id`
- `reviewSeries`: `evidence-v2`
- `baseSha`: `ff7528d3f9ec34072bb669ee79f7569345c23d47`
- `headSha`: `ff7528d3f9ec34072bb669ee79f7569345c23d47`
- `crDir`: `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`
- `canonicalCrDir`: `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`
- `compatibilityMode`: `canonical`
- `legacyArtifactPaths`: `[]`
- `workflowTracker`: `optional`
- manifest 快照时间：`2026-09-07T14:21:28+08:00`
- diff 口径：显式执行 `git diff --name-status --no-renames ff7528d3f9ec34072bb669ee79f7569345c23d47...HEAD`，并分别合并 `staged`、`unstaged`、`untracked`；rename 以旧路径删除和新路径新增分别枚举。
- 基线事实：`HEAD == baseSha`，所以 `base..HEAD` committed delta 为 `0` 项；当前内容差异全部来自工作树。

## Summary（汇总）

| Group | Count | Decision |
|---|---:|---|
| actual changed unique paths | 558 | inventory only；含提案落盘后自身路径 |
| proposed declared | 40 | 待用户批准 |
| requires decision | 1 | 待用户逐项批准 declared 或 excluded |
| proposed excluded | 517 | 待用户批准；含提案自身 |
| Story File List 展开路径 | 44 | 其中 4 个 mutable workflow/tracker 项建议 excluded |
| Story File List 路径未出现在本快照 | 0 | 无 |

工作树层计数（同一路径可能同时出现在多层）：原快照 `staged=42`、`unstaged=255`、`untracked=278`；提案落盘后 `untracked=279`。root 重算确认 558 个 actual 路径与下面三组逐项双向一致。

本文件只是 scope proposal，不是 reviewer artifact，不输出已批准的 `scopeHash`，也不包含 review verdict。用户批准精确范围前不得启动 CR01 review。

## Proposed Declared（建议声明）

以下为 Story 11.9 File List 展开后，剔除 mutable Story/tracker/gate 输出的 implementation 候选：

| Path | Git layer/status | Rationale |
|---|---|---|
| `assets/source/speclite/README.en.md` | `unstaged:M` | Story File List 明确声明；11.9 用户可见路径/帮助/文档传播面。 |
| `assets/source/speclite/README.md` | `unstaged:M` | Story File List 明确声明；11.9 用户可见路径/帮助/文档传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/CHANGELOG.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/SKILL.en.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/SKILL.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/references/reviewer-workflow.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/CHANGELOG.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/SKILL.en.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/SKILL.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/references/evaluator-workflow.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/CHANGELOG.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/SKILL.en.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/SKILL.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/references/fixer-workflow.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/CHANGELOG.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/SKILL.en.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/SKILL.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/references/rules-extractor-workflow.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/CHANGELOG.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/SKILL.en.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/SKILL.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/references/todo-tracker-workflow.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/CHANGELOG.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/SKILL.en.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/SKILL.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/references/finalizer-workflow.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/CHANGELOG.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/SKILL.en.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/SKILL.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` | `untracked:A` | Story File List 明确声明；11.9 executable resolver 实现。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/CHANGELOG.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/SKILL.en.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/SKILL.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md` | `unstaged:M` | Story File List 明确声明；11.9 shared contract、runner 或 CR01–06 的 `crDir` 契约传播面。 |
| `assets/source/speclite/sdlc-skills/module-help.csv` | `unstaged:M` | Story File List 明确声明；11.9 用户可见路径/帮助/文档传播面。 |
| `docs/reference/skills/sdlc-workflows.md` | `unstaged:M` | Story File List 明确声明；11.9 用户可见路径/帮助/文档传播面。 |
| `docs/reference/workflow-artifact-layout.md` | `unstaged:M` | Story File List 明确声明；11.9 用户可见路径/帮助/文档传播面。 |
| `release/packaging-manifest.json` | `unstaged:M` | Story File List 明确声明；发布包纳入新增 resolver 的清单。 |
| `test/code-review-contract.test.ts` | `unstaged:M` | Story File List 明确声明；11.9 resolver/legacy/ambiguity/propagation 回归测试主体。 |

## Requires Decision（需要决定）

以下文件明显承载 11.9 测试证据，但 Story File List 未声明；仅建议补入，不自动授权：

| Path | Git layer/status | Proposed choice | Rationale |
|---|---|---|---|
| `test/fixtures/code-review-contract/title-bearing-path-ledger.json` | `untracked:A` | 建议 `declared` | 新增 title-bearing path ledger fixture，被 `test/code-review-contract.test.ts` 的 11.9 active-pattern/legacy fixture 校验消费；File List 当前遗漏。 |

## Proposed Excluded（建议排除）

下列为其余实际变更的精确路径清单。每项均有排除理由；批准后才可进入 `excludedFiles`：

| Path | Git layer/status | Rationale |
|---|---|---|
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/evidence-v2-scope-proposal.md` | `untracked:A` | 本提案自身；纳入 actual/excluded 路径清单，不纳入 implementation 内容摘要，避免自引用。 |
| `README.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/11-1-code-review-evaluation-20260902-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/11-1-code-review-evaluation-20260903-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/11-1-code-review-evaluation-20260903-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/11-1-code-review-summary-20260902-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/11-1-code-review-summary-20260902-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/11-1-code-review-summary-20260903-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/EXPERIMENTS.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-1-code-review/PLAN.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/11-2-code-review-evaluation-20260903-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/11-2-code-review-evaluation-20260903-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/11-2-code-review-evaluation-20260903-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/11-2-code-review-summary-20260903-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/11-2-code-review-summary-20260903-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/11-2-code-review-summary-20260903-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/EXPERIMENTS.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/PLAN.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-code-review-evaluation-20260903-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-code-review-evaluation-20260903-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-code-review-evaluation-20260903-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-code-review-summary-20260903-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-code-review-summary-20260903-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-code-review-summary-20260903-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-cr-finalizer-20260903-main-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/EXPERIMENTS.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/PLAN.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260903-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260904-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260904-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260904-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260904-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260904-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-summary-20260903-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-summary-20260903-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-summary-20260904-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-summary-20260904-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-summary-20260904-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-summary-20260904-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-summary-20260904-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-cr-finalizer-20260904-main-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/EXPERIMENTS.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/PLAN.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-evaluation-20260904-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-evaluation-20260904-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-evaluation-20260904-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-evaluation-20260904-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-evaluation-20260904-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-evaluation-20260904-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-evaluation-20260904-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-evaluation-20260904-round-8.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-summary-20260904-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-summary-20260904-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-summary-20260904-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-summary-20260904-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-summary-20260904-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-summary-20260904-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-summary-20260904-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/11-5-code-review-summary-20260904-round-8.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/EXPERIMENTS.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-5-code-review/PLAN.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-evaluation-20260904-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-evaluation-20260904-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-evaluation-20260904-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-evaluation-20260904-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-evaluation-20260904-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-summary-20260904-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-summary-20260904-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-summary-20260904-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-summary-20260904-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/11-6-code-review-summary-20260904-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/EXPERIMENTS.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-6-code-review/PLAN.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-acceptance-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-acceptance-20260905-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-acceptance-20260905-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-acceptance-20260905-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-acceptance-20260905-round-8.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-blind-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-blind-20260905-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-blind-20260905-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-blind-20260905-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-blind-20260905-round-8.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-edge-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-edge-20260905-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-edge-20260905-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-edge-20260905-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-edge-20260905-round-8.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260904-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260904-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-8.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-summary-20260904-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-summary-20260904-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-summary-20260905-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-summary-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-summary-20260905-round-5.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-summary-20260905-round-6.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-summary-20260905-round-7.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-summary-20260905-round-8.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/EXPERIMENTS.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-7-code-review/PLAN.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-acceptance-20260905-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-acceptance-20260905-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-acceptance-20260905-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-acceptance-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-blind-20260905-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-blind-20260905-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-blind-20260905-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-blind-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-edge-20260905-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-edge-20260905-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-edge-20260905-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-edge-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-evaluation-20260905-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-evaluation-20260905-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-evaluation-20260905-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-evaluation-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-summary-20260905-round-1.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-summary-20260905-round-2.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-summary-20260905-round-3.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-code-review-summary-20260905-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/11-8-cr-finalizer-20260905-main-round-4.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/EXPERIMENTS.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-8-code-review/PLAN.md` | `untracked:A` | 其他 Story 的 CR report/log/workflow evidence；与 Story 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-1.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-10.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-11.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-12.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-13.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-14.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-15.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-16.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-17.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-2.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-3.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-4.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-5.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-6.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-7.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-8.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-acceptance-20260905-round-9.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-1.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-10.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-11.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-12.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-13.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-14.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-15.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-16.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-17.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-2.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-3.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-4.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-5.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-6.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-7.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-8.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-blind-20260905-round-9.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-1.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-10.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-11.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-12.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-13.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-14.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-15.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-16.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-17.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-2.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-3.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-4.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-5.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-6.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-7.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-8.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-edge-20260905-round-9.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-1.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-10.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-11.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-12.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-13.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-14.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-15.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-16.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-2.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-3.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-4.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-5.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-6.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-7.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-8.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-9.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260907-round-17.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260907-round-18.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260907-round-19.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260907-round-20.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260907-round-21.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260907-round-22.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260907-round-23.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260907-round-24.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-1.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-10.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-11.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-12.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-13.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-14.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-15.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-16.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-17.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-2.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-3.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-4.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-5.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-6.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-7.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-8.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260905-round-9.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260907-round-18.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260907-round-19.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260907-round-20.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260907-round-21.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260907-round-22.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260907-round-23.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260907-round-24.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-cr-rules-extraction-20260907-main-round-24.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/EXPERIMENTS.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/EXPERIMENT_NOTES.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/PLAN.md` | `untracked:A` | 方案 A 保留的旧 11.9 CR report/log/experiment evidence；不属于本次 implementation scope。 |
| `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/evidence-v2-authorization.md` | `untracked:A` | 本次 `evidence-v2` 的 authorization/progress/goal workflow output；必须排除，防止 `scopeHash` 自引用。 |
| `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` | `unstaged:M` | CR rules/TODO 全局治理输出；本次未授权修改 global governance，显式 excluded。 |
| `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` | `unstaged:M` | CR rules/TODO 全局治理输出；本次未授权修改 global governance，显式 excluded。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-1-executable-artifact-root-resolution-contract-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-1-executable-artifact-root-resolution-contract-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-3-existing-install-compatibility-and-diagnostics-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-3-existing-install-compatibility-and-diagnostics-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-7-standardize-the-prd-validation-report-filename-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-7-standardize-the-prd-validation-report-filename-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-8-rename-and-relocate-implementation-readiness-skills-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-8-rename-and-relocate-implementation-readiness-skills-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-kickoff-gate.md` | `untracked:A` | mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。 |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | `unstaged:M` | mutable sprint tracker；本次 workflow tracker optional，tracker 写入不作为 implementation 内容。 |
| `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md` | `unstaged:M` | 其他 Story 的 mutable planning/workflow artifact；与 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md` | `unstaged:M` | 其他 Story 的 mutable planning/workflow artifact；与 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md` | `unstaged:M` | 其他 Story 的 mutable planning/workflow artifact；与 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md` | `unstaged:M` | 其他 Story 的 mutable planning/workflow artifact；与 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md` | `unstaged:M` | 其他 Story 的 mutable planning/workflow artifact；与 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/stories/11-6-consolidate-ux-artifacts-under-the-planning-ux-space.md` | `unstaged:M` | 其他 Story 的 mutable planning/workflow artifact；与 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/stories/11-7-standardize-the-prd-validation-report-filename.md` | `unstaged:M` | 其他 Story 的 mutable planning/workflow artifact；与 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/stories/11-8-rename-and-relocate-implementation-readiness-skills.md` | `unstaged:M` | 其他 Story 的 mutable planning/workflow artifact；与 11.9 implementation slice 无关。 |
| `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md` | `unstaged:M` | Story 文件虽在 File List，但属于 mutable workflow/tracker artifact；本轮建议显式 excluded。 |
| `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` | `unstaged:M` | 其他 planning/implementation workflow artifact；不属于 Story 11.9 implementation slice。 |
| `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` | `unstaged:M` | 其他 planning/implementation workflow artifact；不属于 Story 11.9 implementation slice。 |
| `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.en.md` | `unstaged:M` | 其他 planning/implementation workflow artifact；不属于 Story 11.9 implementation slice。 |
| `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` | `unstaged:M` | 其他 planning/implementation workflow artifact；不属于 Story 11.9 implementation slice。 |
| `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md` | `unstaged:M` | 其他 planning/implementation workflow artifact；不属于 Story 11.9 implementation slice。 |
| `assets/source/speclite/core-skills/module-help.csv` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/core-skills/speclite-drawer-er-modeler.zip` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/core-skills/speclite-drawer-er-modeler/CHANGELOG.md` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/core-skills/speclite-drawer-er-modeler/SKILL.en.md` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/core-skills/speclite-drawer-er-modeler/SKILL.md` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/core-skills/speclite-drawer-er-modeler/references/er-drawing-rules.md` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/core-skills/speclite-shard-doc/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/docs/examples/fixture-derived-examples.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/data/speclite-manifest.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/customer-faq.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/internal-faq.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/press-release.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/verdict.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/data/speclite-manifest.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/contextual-discovery.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/draft-and-review.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/prompts/finalize.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/references/steps/step-12-complete.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01b-continue.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-02-discovery.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-03-core-experience.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-04-emotional-response.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-05-inspiration.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-06-design-system.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-07-defining-experience.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-08-visual-foundation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-09-design-directions.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-10-user-journeys.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-11-component-strategy.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-12-ux-patterns.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-13-responsive-accessibility.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-14-complete.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/scripts/ux-artifact-operation.mjs` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/references/steps/step-e-01-discovery.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/CHANGELOG.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/customize.toml` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-01-discovery.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-02-format-detection.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-02b-parity-check.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-03-density-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-04-brief-coverage-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-05-measurability-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-06-traceability-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-07-implementation-leakage-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-08-domain-compliance-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-09-project-type-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-10-smart-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-11-holistic-quality-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-12-completeness-validation.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-13-report-complete.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/CHANGELOG.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/SKILL.en.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/SKILL.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/assets/readiness-report-template.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/customize.toml` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-01-document-discovery.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-02-prd-analysis.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-03-epic-coverage-validation.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-04-ux-alignment.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-05-epic-quality-review.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-06-final-assessment.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/workflow-details.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/SKILL.en.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/SKILL.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/config.toml.example` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/activation-en.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/inputs-outputs.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-01-init.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-02-context.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-03-starter.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-04-decisions.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-05-patterns.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-06-structure.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-07-validation.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/workflow-steps.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/steps/step-01-init.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/steps/step-04-decisions.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/SKILL.en.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/SKILL.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/references/activation.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/references/workflow-steps.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/SKILL.en.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/SKILL.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/references/steps/step-01-discover.md` | `unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/CHANGELOG.md` | `staged:A` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/SKILL.en.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/SKILL.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/assets/readiness-report-template.md` | `staged:A` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/config.toml.example` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/customize.toml` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-01-document-discovery.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-02-prd-analysis.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-03-epic-coverage-validation.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-04-ux-alignment.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-05-epic-quality-review.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-06-final-assessment.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/workflow-details.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/review-dimensions.md` | `staged:A` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | `staged:A, unstaged:M` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/CHANGELOG.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/SKILL.en.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/SKILL.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/references/prompt-library.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/references/record-output-spec.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/references/review-dimensions.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/references/testing-scenarios.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/references/workflow.md` | `staged:D` | Story 11.8 readiness rename 工作树变更；明确不混入 11.9。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/discover-inputs.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/SKILL.en.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/SKILL.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/references/workflow-details.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `assets/source/speclite/sdlc-skills/module.yaml` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/explanation/local-first-control-plane.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/explanation/runtime-boundaries.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/explanation/speclite-modules.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/explanation/speclite-workflows.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/how-to/install-speclite.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/quick-start.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/reference/canonical-source-layout.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/reference/cli-human-output-matrix.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/reference/cli.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/reference/command-result-json.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/reference/config-and-customization.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/reference/runtime-layout.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/reference/specs/command-result-json-contract.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `docs/tutorials/first-brownfield-project.md` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/bin/speclite.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/commands/install.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/commands/resolve.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/commands/status.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/config/artifact-document-discovery.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/config/artifact-root-resolver.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/config/config-schema.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/config/customization-reader.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/config/resolve-output-schema.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/config/ux-artifact-routing.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/diagnostics/command-result-schema.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/diagnostics/output.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/fs/path-normalizer.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/ide/target-writer.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/installer/config-initialization.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/installer/ready-check.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/installer/runtime-structure.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/manifest/analysis-artifact-routing.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/manifest/manifest-generator.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/manifest/manifest-schema.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/modules/module-metadata.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/status/installed-state.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/update/conflict-detector.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/update/ownership-model.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/update/update-plan.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/validation/artifact-paths.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/validation/rules/artifact-path.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/validation/rules/manifest-schema.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `src/validation/validate-project.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/analysis-artifact-routing.test.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/artifact-document-discovery.test.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/artifact-path-validation.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/artifact-root-resolution.test.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/config-initialization.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/contract-anchors.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/existing-install-compatibility.test.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixture-release-gates.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/fresh-install-empty-project/expected/command-json/fresh-install-success.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/fresh-install-empty-project/expected/installed-state/manifest-full.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/fresh-install-empty-project/expected/installed-state/manifest.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json` | `untracked:A` | Story 11.8 rename/routing fixture 或测试；明确不混入 11.9。 |
| `test/fixtures/path-portability/expected/command-json/validate.json` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/fixtures/resolve-parity/expected/human/config-invalid-input.txt` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/implementation-readiness-rename-routing.test.ts` | `untracked:A` | Story 11.8 rename/routing fixture 或测试；明确不混入 11.9。 |
| `test/install-progress-ready-summary.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/manifest-discovery.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/ownership-model.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/prd-validation-report-path.test.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/resolve-readers.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/runtime-structure.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/skill-artifact-loop.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/source-and-modules.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/story-6-4-path-portability.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/update-planning.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/ux-artifact-routing.test.ts` | `untracked:A` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |
| `test/validate-command.test.ts` | `unstaged:M` | mixed worktree 中未被 Story 11.9 File List 声明、也无直接 11.9 resolver fixture 证据的变更；建议 excluded。 |

## Story File List Reconciliation（Story 文件清单对账）

Story File List 共展开 44 个精确路径。下列 4 个虽在 File List 中，但因属于 mutable workflow/tracker output，建议从本次 implementation `declaredFiles` 移至 `excludedFiles`：

- `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md` — mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。
- `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-kickoff-gate.md` — mutable Flow Gate workflow output；不纳入 implementation scope，后续 gate 另行生成并绑定。
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — mutable sprint tracker；本次 workflow tracker optional，tracker 写入不作为 implementation 内容。
- `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md` — Story 文件虽在 File List，但属于 mutable workflow/tracker artifact；本轮建议显式 excluded。

所有展开后的 File List 路径均在本快照中有实际变更。

## Mutable Workflow Output Policy（可变工作流输出策略）

方案 A 保留旧报告，不修改源码或 global Skills。以下路径是本轮已存在、即将更新或由本提案自身产生的明确 mutable workflow outputs，建议全部 excluded：

- `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/PLAN.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/evidence-v2-authorization.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/evidence-v2-scope-proposal.md`

- 既有 11.9 review/evaluation/layer/rules evidence 也全部明确 excluded；不删除、不改写旧报告。
- 后续 CR evidence、临时文件、Flow Gate 与 tracker 写入均属于 mutable workflow output，不是 implementation 内容。
- 本提案文件在原快照后生成，已由 root 补入 `actualChangedFiles` 与 proposed `excludedFiles`；不属于 `declaredFiles`，其可变内容不参与 implementation 内容摘要。不得为了避免自引用而从 actual 清单隐藏文件。
- 若快照时间后出现新的或被修改的 workflow output，应按上述规则显式追加到 `excludedFiles`，并在计算 `scopeHash` 前重读工作树；不得静默忽略。
- 本提案不授权修改源码、global Skills、global CR rules/TODO 或任何其他文件。

## Approval Gate（批准门禁）

请用户在启动 review 前明确批准：

1. `proposed declared` 的 40 个精确路径；
2. `requires decision` 的 1 个路径分别归入 `declared` 或 `excluded`；
3. `proposed excluded` 的 517 个精确路径及理由；
4. 批准后由 reviewer 基于批准清单与当时重读的内容摘要计算唯一 `scopeHash`。

未获明确批准时，状态保持 `scope proposed / review not started`。
