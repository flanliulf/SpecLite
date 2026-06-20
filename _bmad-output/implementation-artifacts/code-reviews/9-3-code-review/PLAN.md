# Story 9.3 Code Review Plan（代码审查计划）

## Goal（目标）

对 Story 9.3 `Installed Skill Data Directory Projection（已安装 Skill data 目录投影）` 执行开发与代码审查闭环。外层严格串行：先完成 `bmad-dev-story story 9-3`，再依次执行 CR reviewer、evaluator、必要 fixer 循环，最后执行 CR rules extractor、TODO tracker、finalizer，并完成本地中文 Conventional Commit，不 push。

## Scope（范围）

- Epic 输入：`_bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md`
- Story 输入：`_bmad-output/implementation-artifacts/stories/9-3-installed-skill-data-directory-projection.md`
- Code Review 输出目录：`_bmad-output/implementation-artifacts/code-reviews/9-3-code-review/`
- 依赖 Story：`9-1-installed-skill-activation-contract-hardening`、`9-2-python-resolver-compatibility-asset-projection`

## Current State（当前状态）

- 当前时间：2026-06-20 15:09 CST
- 当前 Story：9.3
- 当前轮次：Round 1
- 任务类型：Round 2 evaluator 完成，CR closeout 进行中
- Story 文件状态：`review`
- Sprint tracker 状态：`review`
- 已有 CR 产物：未发现 `9-3-code-review` 既有 reviewer/evaluator/fixer/finalizer 产物；development 记录文件存在。
- Git 状态：存在 Story 9.3 创建、实现、fixture、packaging、测试和本 code review 目录改动；最终提交只纳入 Story 9.3 dev/CR 闭环相关白名单文件。

## Dependency Gate（依赖门禁）

- Story 9.1 状态：已 `done`
- Story 9.1 latest CR evaluator：Round 2 PASS
- Story 9.2 状态：已 `done`
- Story 9.2 latest CR evaluator：Round 3 PASS
- Epic 9 状态：`in-progress`，因新增 Story 9.3 重新打开
- 决策：Story 9.3 依赖门禁已满足，可进入 development；Story 9.3 dev step 负责按实现需要推进 Story 正文状态。

## Steps（执行步骤）

- [x] Step 0: Preflight（前置审计）
- [x] Step 1: Initialize Logs（初始化记录）
- [x] Step 2: fresh sub-agent 执行 `bmad-dev-story story 9-3`（完成，agent: Dalton / `019ee3d1-c564-7491-8dbc-f12bbc1bc62e`）
- [x] Step 3: fresh sub-agent 执行 `bmenhance-cr-01-reviewer 9-3`（完成，agent: Erdos / `019ee3dd-37c4-7c63-bfad-be116323c71f`，Round 1 PASS，0 findings）
- [x] Step 4: fresh sub-agent 执行 `bmenhance-cr-02-evaluator 9-3`（完成，agent: Herschel / `019ee3e0-e425-7883-b232-cba8622443cd`，0 code findings，需补 full test 与 packaging check 证据）
- [x] Step 4b: 补跑 evaluator 要求的 release evidence：`npm test -- --testTimeout 30000`、`npm run release:packaging-check`（通过）
- [x] Step 4c: Round 2 fresh sub-agent 执行 `bmenhance-cr-01-reviewer 9-3`（完成，agent: Zeno / `019ee3f1-6b27-70a2-8e7a-9a2eb22e6892`，Round 2 PASS，0 findings）
- [x] Step 4d: Round 2 fresh sub-agent 执行 `bmenhance-cr-02-evaluator 9-3`（完成，agent: Godel / `019ee3f4-4904-7b62-8157-d693303370ec`，PASS，0 effective findings）
- [ ] Step 5: 如 evaluator 要求修复，fresh sub-agent 执行 `bmenhance-cr-03-fixer 9-3`，然后回到 reviewer/evaluator；本轮 evaluator 未要求 fixer
- [x] Step 6a: fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor 9-3`（完成，agent: Aquinas / `019ee3f6-ec15-7a81-84f7-f70a4d40963f`，无候选规则，无需写入）
- [x] Step 6b: fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker 9-3`（完成，agent: Cicero / `019ee3f9-1935-78a0-9ab3-c61715785c17`，0 candidates，无 backlog 变更）
- [x] Step 6c: fresh sub-agent 执行 `bmenhance-cr-06-finalizer 9-3`（完成，agent: Kant / `019ee3fa-a8df-7f00-a506-412b86a72d8e`，Story done，sprint story entry done）
- [ ] Step 7: 最终 scoped audit 与本地中文 Conventional Commit

## Stop Conditions（终止条件）

- 通过：开发完成，最新 CR reviewer 通过，最新 CR evaluator 通过，必要 fixer 后已重新 review/evaluate，并完成 rules extractor、TODO tracker、finalizer 和本地提交。
- 阻塞：缺失 Story 输入、review/evaluation 结果不明确且无法保守判断、需要修改需求边界、需要纳入无关文件、需要 push 或破坏性操作。
