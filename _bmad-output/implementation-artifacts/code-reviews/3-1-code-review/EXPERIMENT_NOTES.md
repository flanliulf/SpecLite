# EXPERIMENT_NOTES

## 实时笔记

- 2026-05-28: 前置核对显示 Epic 3 的 `3-1-lightweight-install-status-summary` 当前为 `ready-for-dev`。工作区已有大量既有未提交改动，本流程不回滚这些改动，只处理当前 Story 所需范围。
- 2026-05-28: `python3` resolver 因系统 Python 3.9 缺少 `tomllib` 失败；已按 skill fallback 手工读取 customize，确认无 team/user override，persistent facts 为 `_bmad-output/project-context.md`。
- 2026-05-28: `_bmad-output/project-context.md` 仍为初始化占位；本轮以 Story 3.1、live source files 和 planning SPEC references 为实现依据。
- 2026-05-28: 保守决策：status command 返回 `CommandResult.status: "success"` 和 exit code 0，即使 `highLevelHealth` 为 `partial` / `failed`，除非 lightweight read 本身无法生成稳定 result；本 Story 未引入 command-level issue。
- 2026-05-28: 保守决策：status reader 只读取 manifest 与 skill-index，并做 target directory shallow count；未读取 full files-index hash、未调用 validate、未访问 remote source、未检查 operation lock、未执行 update/repair planning。
- 2026-05-28: 验证通过，Story 3.1 已推进到 `review`；本轮未执行 CR/finalizer/git 操作。
- 2026-05-28: 启动 `bmenhance-cr-01-reviewer 3-1` 首轮代码审查；只读 Story 3.1 相关源码和测试，允许写入本 CR 目录结果文件与进度记录。
- 2026-05-28: 当前环境无独立 Agent 工具；按 reviewer skill 降级为串行三层审查，并在 CR summary 中标注审查层状态。
- 2026-05-28: CR Round 1 定向复现显示 `manifest.paths` 可透传 absolute path 到 `status.data.paths`；invalid `skill-index.json` 当前被归类为 `partial`。两项均记录为 patch finding。
- 2026-05-28: 启动 `bmenhance-cr-02-evaluator 3-1`；最新审查结果为 `3-1-code-review-summary-20260528-round-1.md`，本次评估轮次为 Round 1。
- 2026-05-28: 保守评估决策：2 条 reviewer findings 均直接违反 Story 3.1 验收契约，均确认为 P1 需修复项；不降级为 TODO，不标记误报。
- 2026-05-28: 启动 `bmenhance-cr-03-fixer 3-1`；最新评估文件为 `3-1-code-review-evaluation-20260528-round-1.md`，本轮只处理其中确认需要修复的 2 项，不修改 Story 文档。
- 2026-05-28: 保守修复决策：malformed manifest path 直接让 manifest parse 失败，避免在 projection 层保留任何原始不可信 path；missing skill-index 仍为 partial，corrupted/schema-invalid skill-index 才进入 failed。
- 2026-05-28: 修复完成并验证通过：focused status test 10/10 通过，`npm run build` 通过，`git diff --check` 通过；未执行 git commit / push。
- 2026-05-28: 启动 `bmenhance-cr-01-reviewer 3-1` Round 2 复审；只读源码与 Story 文档，允许写入本 CR 目录复审结果和进度文件。
- 2026-05-28: 复审关注点固定为 Round 1 两个 P1 修复项：public paths 不泄露 malformed manifest paths；corrupted `skill-index.json` 进入 failed installed-state health。
- 2026-05-28: Round 2 复审通过；focused status test 10/10 通过，目标文件 `git diff --check` 通过；本轮未执行会刷新 `dist/` 的 `npm run build`。
- 2026-05-28: 启动 `bmenhance-cr-02-evaluator 3-1` Round 2 评估；最新审查结果为 `3-1-code-review-summary-20260528-round-2.md`，已有评估 1 份，本次评估轮次为 Round 2。
- 2026-05-28: Round 2 评估确认 reviewer 通过结论成立：Round 1 两项 P1 修复均已源码和测试闭环，未发现新增阻塞项；结论 Approved / 通过，可进入 rules/todo/finalizer。
- 2026-05-28: 启动 `bmenhance-cr-04-rules-extractor 3-1`；按用户授权采用默认推荐决策 record-only，新增 `CR-SEC-06` 与 `CR-API-15` 到 `cr-rules-summary.md`，不修改全局文档。
- 2026-05-28: 启动 `bmenhance-cr-05-todo-tracker 3-1`；Round 1 / Round 2 均无 non-blocking 候选项，决策为无新增 TODO，不修改 `cr-todo-backlog.md`。
- 2026-05-28: 启动 `bmenhance-cr-06-finalizer 3-1`；已验证最新 evaluator 为 Approved，将 Story 3.1 与 `sprint-status.yaml` 同步为 `done`。`bmm-workflow-status.yaml` 不存在，按容错规则跳过；Epic 3 仍有未完成 Story，不修改 Epic 主状态。
