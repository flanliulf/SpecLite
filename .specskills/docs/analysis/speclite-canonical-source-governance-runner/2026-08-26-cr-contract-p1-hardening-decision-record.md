# Canonical Source Governance Decision Record

| Field | Value |
|---|---|
| Date | 2026-08-26 |
| Change Scope | Category A CR 工作流契约深化：在既有 CR 独立契约包重构基础上，落地 7 个 P1 修订（① completion gate 状态 + 部分收口 resume；② CR05 `mode=closeout` 的 PASS no-op；③ CR06 强制绑定 CR04/CR05 前序报告 + gate hash；④ 授权四元组下传 + 契约调用参数矩阵；⑤ `reviewSeries` 安全值域 + superseded 规则 + Hash 规范化；⑥「原子收口」→ fail-closed coordinated write；⑦ 状态机结构锁测试 + 真行为测试 `it.todo`），并修复 flow-gate 固定日期回归，同步 fresh-install fixture 基线。 |
| Governance Classes | `canonical-source-truth` (`D0`)、`module-discovery-contract` (`D0`)、`hook-source-contract` (`D0`)、`frozen-historical-record` (`D2`) |
| D0 Findings | `speclite-check-canonical-source-change` warn / strict 模式均为 `status: ok` 且 `findings: []`；`core=18`、`sdlc=50` count 未回退。 |
| D1 Decisions | 本轮无 `D1` surface。 |
| D2 Decisions | `docs/legacy/HANDOFF.md` 见下表。 |
| Verification | `vitest` 454 passed / 4 todo / 0 fail（60 文件全绿）；`npm run build`、`npm run release:packaging-check`、canonical checker strict mode、`git diff --check` 均通过。 |

## Decisions

| Surface | Decision | Reason | Evidence |
|---|---|---|---|
| `assets/source/speclite/docs/legacy/HANDOFF.md` | updated（非 historical rewrite） | 仅更新前瞻性引用与「新代理接手方式」指引：已删除的 `references/cr-config.md` → 新 `speclite-code-review-contract/references/cr-contract.md`；未改动任何已记录的历史执行事实或结果，符合 frozen-historical-record「保留历史事实、更新当前指引」策略。 | `git diff` @@-117 config 引用替换为独立契约包、@@-171 接手指引第 2 步引用替换；7 insertions / 4 deletions，全部为引用与指引文字。 |
| CR 共享契约与 workflow 引用（`speclite-code-review-contract/references/cr-contract.md`、`speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`、`speclite-code-review-05-todo-tracker/references/todo-tracker-workflow.md`、`speclite-code-review-06-finalizer/references/finalizer-workflow.md`、`speclite-code-review-06-finalizer/assets/output-template.md`） | updated | 7×P1 均为共享契约 owner 内的规范深化（状态机、closeout 模式、前序绑定、授权矩阵、身份/hash、fail-closed 写入），不复制或覆盖 consumer 定义。 | `test/code-review-contract.test.ts` 新增 8 条结构锁用例 + 4 条 `it.todo` 全绿；strict checker `status: ok`。 |
| fresh-install fixture 基线（`test/fixtures/fresh-install-empty-project/expected/installed-state/{files-index-full,skill-index-full,help-index-full,phase-coverage-full}.json`） | updated（historical snapshot 刷新） | canonical 内容变更后必须刷新确定性安装树基线，否则 release gate fixture 失配；基线由真实 install 再生，非手工编辑 hash。 | `test/fixture-release-gates.test.ts` 8/8 通过；`npm run release:packaging-check` 通过。 |

---

*本文档由 speclite-canonical-source-governance-runner Skill 自动生成*
