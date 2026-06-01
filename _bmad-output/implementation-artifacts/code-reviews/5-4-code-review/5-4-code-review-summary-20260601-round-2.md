---
Story: 5-4
Round: 2
Date: 2026-06-01
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。内部 Agent 调度工具在当前 reviewer 中不可用，已按 skill fallback 在当前 reviewer 内串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；三层逻辑审查均完成。Round 1 的 2 个 P1 已修复，`npm test -- test/git-source-resolution.test.ts`、`npm test`、`npm run build` 均通过；项目 `package.json` 无 `lint` script，未运行 `npm run lint`。本轮未发现新的阻塞项，结论：通过。

本轮四桶数量：`decision_needed=0`，`patch=0`，`defer=1`，`dismiss=0`。其中 `defer=1` 为 Round 1 P2 human output `confirmationState=pending`，按 evaluator 决定保留为 CR TODO，不作为当前 blocker。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 - installed Git descriptor 可以用非 SHA selector 伪装为 `git-commit` evidence 并通过 validate
   - `src/source/source-descriptor-schema.ts:3-4` 新增 full 40-hex SHA pattern / schema；`src/source/source-descriptor-schema.ts:43-48` 将 `git-commit.commitSha` 收紧为 full SHA；`src/source/source-descriptor-schema.ts:64-76` 对 Git descriptor `version` 增加 full SHA schema 检查。
   - `src/validation/rules/source-integrity.ts:71-87` 在 local-only validate Git 分支中拒绝 non-SHA `version` / `commitSha`，返回 stable `source-integrity.floating-git-source`，`reason=invalid-git-commit-evidence-shape`。
   - `test/git-source-resolution.test.ts:598-674` 覆盖 `version=main`、short SHA、tag、full ref、`HEAD` 等 malformed installed descriptor 的 schema 和 validate negative cases。
   - 验证结果：`npm test -- test/git-source-resolution.test.ts` 通过，14 / 14。

2. Round 1 / Finding #2 - explicit commit SHA 没有被证明为 commit-ish 就可成为 `git-commit` evidence
   - `src/source/git-source-resolver.ts:18-28` 扩展 `GitClient.verifyCommit`；`src/source/git-source-resolver.ts:121-143` 在写入 descriptor 前强制执行 commit-ish verification，explicit SHA 还要求 verified SHA 与 requested SHA 完全一致。
   - `src/source/git-source-resolver.ts:145-190` 只在 verification 成功后写入 lower-cased `version` 与 `git-commit.commitSha`；失败路径保持 blocked descriptor。
   - `src/source/git-source-resolver.ts:194-247` 的默认 Git client 在 confirmed resolver 阶段使用临时 Git context、`git fetch` 和 `git rev-parse --verify --end-of-options FETCH_HEAD^{commit}`，不把 raw stderr 或临时路径投影到 public output。
   - `test/git-source-resolution.test.ts:31-127` 覆盖 branch/tag/full-ref/explicit SHA 成功路径与 annotated tag 解引用；`test/git-source-resolution.test.ts:129-259` 覆盖 explicit SHA 非同一 commit object、branch/tag/full-ref verification failure、verification exception 的 blocked diagnostics。
   - 验证结果：`npm test -- test/git-source-resolution.test.ts` 通过，14 / 14。

### 仍为非阻塞待办

1. Round 1 / Finding #3 - human output 在确认并成功解析后仍固定显示 `confirmationState=pending`
   - 维持 Round 1 evaluator 结论：CR TODO / 非阻塞。
   - 复核结果：`src/diagnostics/output.ts:498-514` 仍从 `sourceDescriptor` 反推 external access 展示并 hardcode `confirmationState=pending`。
   - 不阻塞理由：runtime gate 仍由 `src/commands/install.ts:223-239` 先创建 pending plan、确认后重建 confirmed plan；未确认路径在 `src/commands/install.ts:239-274` 停止，confirmed Git resolver 仅在 `src/commands/install.ts:415-459` 之后发生。该问题影响 human audit 展示，不影响当前 Git remote access gate 或写入门禁。

## 新发现

本轮未发现新的阻塞项或中高优先级问题。

## 验证摘要

- `npm test -- test/git-source-resolution.test.ts` ✅ 通过（1 file / 14 tests passed）
- `npm test` ✅ 通过（33 files / 250 tests passed）
- `npm run lint` 未运行：`package.json` 无 `lint` script
- `npm run build` ✅ 通过（tsup ESM 与 DTS build success）
- 额外复核：
  - 本地临时 bare Git repository 复核默认 Git verification 路径：`git fetch <remote> <sha>` 后 `git rev-parse --verify --end-of-options FETCH_HEAD^{commit}` 可返回 concrete commit SHA。
  - 本地临时 annotated tag 复核：fetch tag object oid 后 `FETCH_HEAD^{commit}` 可解引用到 commit SHA。

## 通过项

- Git installed descriptor 的 schema 与 validate shape gate 已阻止 non-SHA selector 伪装为 `git-commit` evidence。
- branch、tag、full-ref、explicit SHA 在 resolver 中必须经 `verifyCommit` 才能写入 `version` 与 `git-commit.commitSha`。
- explicit SHA selector 若验证结果不是同一 SHA，或 commit-ish verification 失败 / 抛错，均返回 stable redacted blocked diagnostic。
- validate/status 路径仍为 local-only，本轮未发现 Git remote freshness check、fetch、clone 或 provenance revalidation。
- 未发现越界实现 Story 5.5 full reporting matrix、Epic 6 full fixture matrix、enterprise policy、signatures、provenance verification 或 full source lockfile lifecycle。

## 结论

- **结论：通过**
- **阻塞项**：无
- **建议**：进入 Round 2 evaluator 复核；P2 human output `confirmationState=pending` 继续按 CR TODO 跟踪。
