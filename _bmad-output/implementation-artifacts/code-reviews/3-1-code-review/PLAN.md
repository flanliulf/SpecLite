# PLAN

## 范围

- Story: `3-1-lightweight-install-status-summary`
- Story 文件: `_bmad-output/implementation-artifacts/stories/3-1-lightweight-install-status-summary.md`
- 当前目标: 按用户要求仅执行 `/bmad-dev-story story 3-1` 的开发步骤，将 Story 3.1 实现、测试、验证完成后推进到 `review`。

## 开发计划

1. [x] 激活 `bmad-dev-story`，读取 workflow、config、persistent facts、Story 3.1、`sprint-status.yaml` 和项目上下文。
2. [x] 核对 Epic 1 / Epic 2 前置实现锚点、当前 worktree dirty 状态，并记录只处理 Story 3.1。
3. [x] 按 Story 任务顺序执行 red-green-refactor：先写 focused failing tests，再实现最小 status command / installed-state reader / renderer / schema 变更。
4. [x] 每个任务完成后只在 Story 文件允许区域更新 checkbox、Dev Agent Record、File List 和 Change Log。
5. [x] 运行 `npm run build`、focused tests、`npm test` 和重复 fixture 验证；若通过，将 Story 3.1 与 `sprint-status.yaml` 状态推进到 `review`。

## 决策原则

- 本轮不执行 CR、评估、fixer、规则提炼、TODO tracker、finalizer、git commit 或 push。
- 优先复用既有 TypeScript + commander、zod schema、manifest/source/adapter/path helper。
- `speclite status` 只做 local lightweight read；不调用 full validate、hash scan、remote source、update check、repair planner 或 operation lock。
- 不回滚或覆盖本轮开始前已经存在的未提交改动。

## CR Round 1 计划

1. [x] 激活 `bmenhance-cr-01-reviewer`，读取 `cr-config.md`、`review-engine.md` 和输出模板。
2. [x] 定位 Story `3-1`、CR 目录和轮次；确认本轮为首轮审查。
3. [x] 只围绕 Story 3.1 File List 收集 diff、源码和验收标准证据。
4. [x] 按三层审查语义执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor；当前环境无独立 Agent 工具，降级为串行审查。
5. [x] 生成 CR summary，清理临时审查上下文，仅保留本目录允许产物。

## CR Evaluation Round 1 计划

1. [x] 激活 `bmenhance-cr-02-evaluator`，读取 `cr-config.md`、评估输出模板和 Story 3.1 CR 目录。
2. [x] 定位最新审查结果 `3-1-code-review-summary-20260528-round-1.md`，确认被评估审查轮次为 Round 1。
3. [x] 检测现有评估文件，确认本次评估轮次为 Round 1。
4. [x] 只读 Story 3.1 文档与相关源码，对 2 条 reviewer findings 逐条验证有效性、严重性和修复建议。
5. [x] 生成 `3-1-code-review-evaluation-20260528-round-1.md`，结论为 2 个需修复项、0 个 TODO / 记录项、0 个误报。

## CR Fixer Round 1 计划

1. [x] 激活 `bmenhance-cr-03-fixer`，按 `cr-config.md` 定位 Story `3-1` 最新评估文件。
2. [x] 提取评估确认的 2 个 P1 修复项，确认本轮只修复这些条目，不修改 Story 文档。
3. [x] 修复 manifest/public status path 投影校验，确保 malformed path 不进入 public JSON。
4. [x] 修复 corrupted `skill-index.json` 语义，区分 missing 与 invalid，并将 invalid 映射为 failed。
5. [x] 补充 focused tests，运行 focused test 与 `git diff --check`。
6. [x] 将修复执行记录追加到最新评估文件。

## CR Round 2 复审计划

1. [x] 激活 `bmenhance-cr-01-reviewer`，按用户要求作为 fresh sub-agent 执行 Story 3.1 修复后复审。
2. [x] 定位 Story、CR 目录和历史记录；确认已有 1 个 summary，本轮为 Round 2 复审。
3. [x] 读取 Round 1 summary、Round 1 evaluation 和修复执行记录，建立 2 个修复项的复审清单。
4. [x] 仅围绕 Story 3.1 相关 diff、源码、测试和 AC 执行三层审查，重点验证两个修复项是否解决且无新问题。
5. [x] 生成 `3-1-code-review-summary-20260528-round-2.md`，记录 blocking / patch / defer 数量与是否可进入 evaluator。

## CR Evaluation Round 2 计划

1. [x] 激活 `bmenhance-cr-02-evaluator`，按用户要求作为 fresh sub-agent 只评估 Story 3.1 最新 Round 2 CR 结果。
2. [x] 按 `cr-config.md` 定位 `3-1-code-review` 目录、最新 reviewer 文件和评估轮次；确认本次为 Evaluation Round 2。
3. [x] 读取 Round 2 summary、Round 1 evaluation、修复记录、Story 3.1 验收约束和相关源码 / tests。
4. [x] 独立验证 Round 1 两个修复项是否闭环，并确认 Round 2 未新增 blocking / patch / defer 项。
5. [x] 生成 `3-1-code-review-evaluation-20260528-round-2.md`，结论为 Approved / 通过，需修复项 0 个，TODO / 记录项 0 个。

## CR 收尾计划（04 → 05 → 06）

1. [x] 执行 `bmenhance-cr-04-rules-extractor 3-1`：读取全部 CR 历史，基于两项已修复 P1 findings 提炼规则，采用用户授权的默认推荐决策 record-only。
2. [x] 执行 `bmenhance-cr-05-todo-tracker 3-1`：只检查 non-blocking 候选项；Round 1 / Round 2 均无 CR TODO，记录无新增 TODO。
3. [x] 执行 `bmenhance-cr-06-finalizer 3-1`：验证最新 evaluator 为 Approved 后，将 Story 3.1 与 sprint status 同步为 `done`；规划目录未发现 `bmm-workflow-status.yaml`，按 skill 容错跳过。
