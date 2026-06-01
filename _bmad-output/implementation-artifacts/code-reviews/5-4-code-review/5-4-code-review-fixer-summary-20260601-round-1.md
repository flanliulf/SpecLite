---
Story: 5-4
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (codex)
Type: Code Review Fixer Summary
Evaluation Source: 5-4-code-review-evaluation-20260601-round-1.md
---

# Fixer Summary（修复总结）

## Scope（范围）

本轮执行 `/bmenhance-cr-03-fixer 5-4`，只修复 evaluator 确认的 2 个 P1 阻塞问题：

1. installed Git descriptor 中非 SHA selector 可伪装成 `git-commit` evidence 并通过 validate。
2. explicit commit SHA 未被证明为 commit-ish 即可成为 `git-commit` evidence。

P2 human output `confirmationState=pending` 问题本轮不修复，仅记录为 CR TODO。

## Fixes（修复内容）

### P1-1 Git Descriptor Full SHA Shape（Git Descriptor Full SHA 形态）

- 在 `src/source/source-descriptor-schema.ts` 增加 `FULL_GIT_COMMIT_SHA_PATTERN` 与 `GitCommitShaSchema`。
- 将 `git-commit.commitSha` 从非空字符串收紧为 full 40-hex SHA。
- 对 `sourceType === "git"` 且存在 `version` 的 descriptor 增加 full SHA schema 检查。
- 在 `src/validation/rules/source-integrity.ts` 的 Git validate 分支增加 local-only full SHA shape 检查。
- 对 `version=main` / `commitSha=main`、short SHA、tag、branch、symbolic ref 等 malformed installed descriptor 返回稳定、脱敏的 `source-integrity.floating-git-source` issue，`reason=invalid-git-commit-evidence-shape`。

### P1-2 Commit-ish Verification（Commit-ish 验证）

- 扩展 `src/source/git-source-resolver.ts` 的 `GitClient` abstraction，新增 `verifyCommit`。
- `resolveGitSource` 不再只依赖 `lsRemote` 字符串解析；branch/tag/full-ref/explicit SHA 解析出的候选 oid 必须经 `verifyCommit` 返回 full SHA 后才写入 `version` 与 `git-commit.commitSha`。
- explicit full SHA selector 只有在 verified commit SHA 与 requested SHA 完全一致时才允许继续；annotated tag object oid、non-commit oid 或 verification failure 均被 blocked。
- 默认 Git client 增加确认后 resolver 阶段的临时 Git context verification：`git fetch` 后使用 `git rev-parse --verify --end-of-options FETCH_HEAD^{commit}`，失败时返回 undefined，不把 raw Git stderr 或临时路径投影到 public output。
- 保持 `validate` local-only；本轮未在 validate/status 路径增加任何 Git remote 访问。

## Files Changed（写入文件）

- `src/source/source-descriptor-schema.ts`
- `src/source/git-source-resolver.ts`
- `src/source/source-integrity.ts`
- `src/validation/rules/source-integrity.ts`
- `test/git-source-resolution.test.ts`
- `_bmad-output/implementation-artifacts/code-reviews/5-4-code-review/5-4-code-review-fixer-summary-20260601-round-1.md`
- `_bmad-output/implementation-artifacts/code-reviews/5-4-code-review/PLAN.md`
- `_bmad-output/implementation-artifacts/code-reviews/5-4-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/5-4-code-review/EXPERIMENT_NOTES.md`

## Verification（验证）

- `npm test -- test/git-source-resolution.test.ts`
  - RED：新增测试后 13 tests 中 5 个失败，失败点对应 missing `verifyCommit`、annotated tag object 未解引用、explicit SHA 未验证、schema/validate 未拒绝 non-SHA。
  - 补充边界 RED：`verifyCommit` exception 未转成 stable blocked diagnostic 时失败，随后补最小 catch。
  - GREEN：修复后 1 file / 14 tests passed。
- `npm test -- test/contract-anchors.test.ts`：1 file / 6 tests passed。
- `npm test -- test/local-source-integrity.test.ts`：1 file / 14 tests passed。
- `npm test -- test/update-planning.test.ts`：1 file / 20 tests passed。
- `npm test`：33 files / 250 tests passed。
- `npm run build`：ESM build success，DTS build success。
- `git diff --check -- <scoped files>`：通过，无 whitespace error。

## CR TODO（CR 待办）

- P2：confirmed Git install 的 human output 仍可能显示 `confirmationState=pending`。Evaluator 判定为非阻塞，本 fixer 未扩展 public result schema 或 output renderer；后续应由 CR TODO / reporting story 跟踪。

## Boundaries（边界）

- 未启动 reviewer、evaluator、finalizer 或 commit。
- 未修改 Story 5.4 文档或 `sprint-status.yaml`。
- 未清理、回滚、格式化无关 dirty / untracked 文件。
