# EXPERIMENT_NOTES

## 实时笔记

- 2026-05-28: 前置核对显示 Epic 3 的 `3-3-ide-mirror-and-file-integrity-validation` 当前为 `ready-for-dev`。工作区中该 Story 文件已有既有未提交改动，执行时必须保留并在其基础上继续。
- 2026-05-28: `python3` 为 3.9.6，执行 workflow resolver 因缺少 `tomllib` 失败；按 skill fallback 读取 `customize.toml`，未发现 team/user override。
- 2026-05-28: `package.json`、`src/`、`test/`、`src/bin/speclite.ts`、`src/commands/validate.ts`、`src/manifest/manifest-schema.ts`、`src/manifest/hash.ts`、`src/validation/validate-project.ts` 和 `src/validation/rules/manifest-schema.ts` 等前置实现文件已存在，可以继续 Story 3.3；大量 dirty worktree 属于既有改动，必须保留。
- 2026-05-28: 保守决策：不在 `src/commands/validate.ts` 中拼 issue；所有 Story 3.3 domain checks 放在 validation rules，command 仍只负责 target resolution 与调用 `validateProject`。
- 2026-05-28: 保守决策：manifest-schema rule 暴露已解析 manifest/index 给 aggregator；只在 schema issues 为 0 且 skill/files index 解析成功时执行后续 drift rules，避免把 schema corruption 误映射为 mirror/file integrity。
- 2026-05-28: 保守决策：executable bit、case conflict、stale temp file 未在本 Story 新增独立 checks；保留现有 taxonomy 边界，不把这些维度塞进 package hash。
- 2026-05-28: 验证完成：`npm run build` 通过；`npm test` 通过，22 个 test files、138 个 tests。Story 3.3 与 sprint status 已推进到 `review`。
- 2026-05-28: CR Round 1 只读审查开始；本轮不复跑测试、不修源码、不改 Story，依据 Story Dev Agent Record 与代码证据核对实现。
- 2026-05-28: CR Round 1 发现 adapter artifact symlink 会被 `hashPackageDirectory()` 在 include 过滤前误判为 canonical package symlink，违反 adapter artifact 不参与 canonical package hash 的要求。
- 2026-05-28: CR Round 1 发现 files-index dangling symlink 因 `access()` 先于 `lstat()` 被归类为 missing installer-owned file，导致 symlink handling 维度被误报为缺失文件。
- 2026-05-28: CR Evaluation Round 1 只评估 `3-3-code-review-summary-20260528-round-1.md`；未修改源码或 Story 文件。
- 2026-05-28: 评估决策 #1：adapter artifact symlink finding 成立。`hashPackageDirectory()` 先 `listFiles()` 后 include 过滤，`listFiles()` 遇任意 symlink 即 throw；非 canonical adapter symlink 会误触发 `ide-mirror.hash-mismatch`。保守结论为 P1 修复项，不降级 TODO。
- 2026-05-28: 评估决策 #2：dangling symlink file-integrity finding 成立。`validateFileIntegrity()` 先 `access()` 后 `lstat()`，dangling symlink 会被 follow target 后误报 missing；违反 symlink handling 独立维度。保守结论为 P1 修复项，不降级 TODO。
- 2026-05-28: CR Evaluation Round 1 结论：2 个需修复项、0 个 TODO/记录项、0 个误报；可进入 `bmenhance-cr-03-fixer`。
- 2026-05-28: CR Fixer Round 1 只处理评估确认的 2 项。保守决策 #1：把 include 边界前移到 `listFiles()` 遍历阶段，非 canonical adapter artifact symlink 直接跳过；canonical paths / canonical directories 下的 symlink 仍保留 `symlink-in-canonical-package` 行为。
- 2026-05-28: CR Fixer Round 1 保守决策 #2：files-index 使用 `lstat()` 判定路径实体；`ENOENT` 才是 missing，symlink 无论 target 是否存在都不 follow，统一报告 redaction-safe `file-integrity.hash-mismatch` + `shape: "symlink"`。
- 2026-05-28: CR Fixer Round 1 验证完成：`npm test -- test/validate-command.test.ts` 通过；`npm run build` 通过；`git diff --check` 通过。
- 2026-05-28: CR Round 2 复审开始；只读复核 Round 1 两个 patch 修复，不修改源码或 Story 文件。当前 `3-3-code-review/` 目录已有 Round 1 summary/evaluation，因此本轮 reviewer 输出应为 round-2 summary。
- 2026-05-28: CR Round 2 复审结论：`src/manifest/hash.ts` 已在遍历阶段应用 include，adapter artifact symlink 不再误触发 canonical hash mismatch；`src/validation/rules/file-integrity.ts` 已用 `lstat()` 区分 missing 与 symlink。Focused validate tests 10/10 通过，`git diff --check` 通过；本轮 reviewer 通过，可进入 evaluator。
- 2026-05-28: CR Evaluation Round 2 开始；只评估 `3-3-code-review-summary-20260528-round-2.md`，不修改源码或 Story 文件。已有 1 份 evaluation，因此本轮评估输出应为 round-2。
- 2026-05-28: 评估决策 #1：Round 1 Finding #1 已闭环。`src/manifest/hash.ts` 在 `listFiles()` 遍历阶段计算 `included`，目录、文件和 symlink 都只在 included path 下继续处理；`src/validation/rules/ide-mirror.ts` 将 canonical directory root 纳入 include 判定，非 canonical adapter artifact symlink 不再误触发 canonical package shape mismatch。
- 2026-05-28: 评估决策 #2：Round 1 Finding #2 已闭环。`src/validation/rules/file-integrity.ts` 先 `lstat()`，仅 `ENOENT` 报 missing；symlink 不 follow target，统一报告 `file-integrity.hash-mismatch` 且带 `details.shape: "symlink"`。
- 2026-05-28: CR Evaluation Round 2 验证完成：`npm test -- test/validate-command.test.ts` 通过，10/10 tests；scoped `git diff --check` 通过。结论 Approved/通过，0 个需修复项，0 个 CR TODO/记录项；可进入 rules/todo/finalizer。
- 2026-05-28: CR Rules Extraction 04 完成。默认采用 record-only：新增 `CR-API-17` 与 `CR-SEC-07` 到 `cr-rules-summary.md`；不修改全局文档，不交给 TODO。
- 2026-05-28: CR TODO Tracker 05 完成。Round 2 evaluator 明确 CR TODO 0；本轮无 non-blocking 候选，不修改 `cr-todo-backlog.md`。
- 2026-05-28: CR Finalizer 06 完成。最新 Round 2 evaluation 为 Approved/通过；Story `Status` 已更新为 `done`；`sprint-status.yaml` 对应条目已更新为 `done`；`bmm-workflow-status.yaml` 不存在，按规则跳过。Epic 3 仍有 3-4 到 3-6 未 done，不修改 Epic 主状态。
