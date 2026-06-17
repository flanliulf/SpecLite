# Story 9.2 Code Review Plan（代码审查计划）

## Goal（目标）

对 Story 9.2 `Python Resolver Compatibility Asset Projection（Python Resolver 兼容资产投影）` 执行开发与代码审查闭环。外层严格串行：先完成 `bmad-dev-story story 9-2`，再依次执行 CR reviewer、evaluator、必要 fixer 循环，最后执行 CR rules extractor、TODO tracker、finalizer。

## Scope（范围）

- Epic 输入：`_bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md`
- Story 输入：`_bmad-output/implementation-artifacts/stories/9-2-python-resolver-compatibility-asset-projection.md`
- Code Review 输出目录：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/`
- 依赖 Story：`9-1-installed-skill-activation-contract-hardening`

## Current State（当前状态）

- 当前时间：2026-06-17 19:48 CST
- 当前 Story：9.2
- 当前轮次：Round 0
- 任务类型：新 dev/CR 任务
- Story 文件状态：`review`
- Sprint tracker 状态：`review`
- 已有 CR 产物：未发现 `9-2-code-review` 既有产物
- Git 状态：工作树存在大量既有 dirty / untracked 文件；本轮必须保留无关改动，最终提交只纳入 Epic 9 dev/CR 闭环相关白名单文件。

## Dependency Gate（依赖门禁）

- Story 9.1 状态：已 `done`
- Story 9.1 latest CR evaluator：Round 2 PASS
- Focused activation corpus gate：`npm test -- test/installed-activation-contract.test.ts` 通过，1 file / 4 tests
- Legacy activation self-test：`check_agent_skill.py --self-test-legacy-activation` 通过，checked=6
- Persona agent lint：`check_agent_skill.py --all assets/source/speclite/sdlc-skills` 通过，checked=7，0 findings
- 决策：Story 9.2 的 `blocked-by-9-1-corpus-gate` 前置条件已满足，可进入 development；Story 9.2 dev step 负责按实现需要推进 Story 正文状态。

## Steps（执行步骤）

- [x] Step 0: Preflight（前置审计）
- [x] Step 1: Initialize Logs（初始化记录）
- [x] Step 2: fresh sub-agent 执行 `bmad-dev-story story 9-2`
- [x] Step 3: fresh sub-agent 执行 `bmenhance-cr-01-reviewer 9-2`
- [x] Step 4: fresh sub-agent 执行 `bmenhance-cr-02-evaluator 9-2`
- [x] Step 5: Round 1 fresh sub-agent 执行 `bmenhance-cr-03-fixer 9-2`
- [x] Step 5a: Round 2 fresh sub-agent 执行 `bmenhance-cr-01-reviewer 9-2`
- [x] Step 5b: Round 2 fresh sub-agent 执行 `bmenhance-cr-02-evaluator 9-2`
- [x] Step 5c: Round 2 fresh sub-agent 执行 `bmenhance-cr-03-fixer 9-2`
- [x] Step 5d: Round 3 fresh sub-agent 执行 `bmenhance-cr-01-reviewer 9-2`
- [x] Step 5e: Round 3 fresh sub-agent 执行 `bmenhance-cr-02-evaluator 9-2`
- [x] Step 6a: fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor 9-2`
- [x] Step 6b: fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker 9-2`
- [x] Step 6c: fresh sub-agent 执行 `bmenhance-cr-06-finalizer 9-2`
- [x] Step 7: 更新本目录三份进度文件，并判断 Epic 9 是否可最终提交

## Stop Conditions（终止条件）

- 通过：开发完成，最新 CR reviewer 通过，最新 CR evaluator 通过，必要 fixer 后已重新 review/evaluate，并完成 rules extractor、TODO tracker、finalizer。
- 阻塞：缺失 Story 输入、review/evaluation 结果不明确且无法保守判断、需要修改需求边界、需要纳入无关文件、需要 push 或破坏性操作。

## Development Result（开发结果）

- Dev sub-agent：Helmholtz
- 结论：Story 9.2 已进入 `review`，可启动 CR reviewer。
- 修改范围摘要：
  - Runtime / installer：`src/installer/runtime-structure.ts`、`src/validation/rules/runtime-path.ts`、`src/update/update-plan.ts`
  - Packaging：`scripts/release/packaging-check.mjs`、`release/packaging-manifest.json`
  - Docs：`README.md`、`docs/reference/cli.md`、`docs/explanation/local-first-control-plane.md`、`docs/glossary/speclite-runtime-boundaries.md`
  - Tests / fixtures：`test/runtime-path-validation.test.ts`、`test/runtime-structure.test.ts`、`test/release-packaging-check.test.ts`、`test/story-6-4-path-portability.test.ts`、`test/uninstall-command.test.ts`、`test/installed-activation-contract.test.ts`、fresh-install and path-portability fixture expected files
  - Story/tracking：`_bmad-output/implementation-artifacts/stories/9-2-python-resolver-compatibility-asset-projection.md`、`_bmad-output/implementation-artifacts/sprint-status.yaml`
- 验证：
  - `npm test -- test/installed-activation-contract.test.ts`：通过，5 tests。
  - `check_agent_skill.py --self-test-legacy-activation`：通过，checked=6。
  - `check_agent_skill.py --all assets/source/speclite/sdlc-skills`：通过，checked=7，0 findings。
  - `npm test -- test/local-source-integrity.test.ts test/runtime-path-validation.test.ts test/release-packaging-check.test.ts test/uninstall-command.test.ts test/update-planning.test.ts test/update-command.test.ts test/installed-activation-contract.test.ts`：通过，62 tests。
  - `npm run build && npm run release:packaging-check`：通过。
  - `git diff --check`：通过。
  - `npm test -- --testTimeout 30000`：失败 7 个断言；失败原因记录为当前 unrelated untracked SDLC skill roots 导致 canonical package roots 从 `core=13, sdlc=44, total=57` 变为 `core=13, sdlc=48, total=61`。
- 下一步：启动 CR reviewer，判断实现质量和 residual blocker。

## Round 1 Reviewer Result（Round 1 审查结果）

- Review 文件：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-summary-20260617-round-1.md`
- 结论：不通过
- PASS：否
- Findings：1 个 `[高] / patch`
- 核心问题：`runtime-compat-script` 的 explicit repair source resolution 不完整，fresh install 投影出的 Python compatibility scripts 在 drift/missing 后可能无法由 `update --repair` 恢复。
- 降级情况：当前环境没有 reviewer 内部可调用的 `Agent` 子代理工具，reviewer 按 skill 降级路径串行完成三层审查。
- 下一步：启动 CR evaluator，评估 finding 有效性和 fixer 范围。

## Round 1 Evaluator Result（Round 1 评估结果）

- Evaluation 文件：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-evaluation-20260617-round-1.md`
- 结论：不通过
- PASS：否
- Reviewer findings：有效 1 条，误报 0 条
- Requires Fixer：是
- Fixer 精确范围：
  - 修复 `runtime-compat-script` 的 repair source resolution，使 `assets/source/speclite/scripts/resolve_*.py` 与 `bundled-runtime-compat:scripts/resolve_*.py` 能从当前 SpecLite package bundled source 恢复 canonical bytes。
  - 补充 focused tests 覆盖删除/篡改两个 `_speclite/scripts/resolve_*.py` 后 `speclite update --repair --yes` 可恢复。
  - 不得改默认 activation resolver、human-owned/workflow-owned 边界、normal update hidden repair 语义或无关 docs/progress files。
- 用户裁决：无需用户裁决。
- 下一步：启动 CR fixer，仅按 evaluator 范围定点修复。

## Round 2 Fixer Result（Round 2 修复结果）

- Fixer 依据：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-evaluation-20260617-round-2.md`
- 修复记录：已追加到 evaluation 文件 `## 修复执行记录`
- 修改文件：
  - `src/update/update-plan.ts`
  - `test/update-planning.test.ts`
  - `_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-evaluation-20260617-round-2.md`
- 修复摘要：
  - `readRepairCandidateBytes` 新增 `targetPath` 入参。
  - `runtime-compat-script` repair source resolution 只允许 `_speclite/scripts/resolve_config.py` + `resolve_config.py` sourceRef、`_speclite/scripts/resolve_customization.py` + `resolve_customization.py` sourceRef。
  - 非 resolver `_speclite/scripts/*` target path 即使带 allowlisted resolver sourceRef，也保留 `missing-source-evidence` 阻断，不生成 repair action，不写入文件。
  - 新增 focused negative test。
- 验证：
  - `npm test -- test/update-planning.test.ts`：通过，23 tests。
  - `git diff --check`：通过。
- 下一步：重新启动 CR reviewer Round 3。

## Round 3 Reviewer Result（Round 3 审查结果）

- Review 文件：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-summary-20260617-round-3.md`
- 结论：通过
- PASS：是
- 上轮问题关闭情况：Round 2 Finding #1 已关闭。
- 新 findings：0
- 降级情况：当前环境没有 reviewer 内部可调用的 `Agent` 子代理工具，reviewer 按 skill 降级路径执行单一复审并覆盖三类检查视角。
- 下一步：启动 CR evaluator Round 3，确认是否可 closeout。

## Round 3 Evaluator Result（Round 3 评估结果）

- Evaluation 文件：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-evaluation-20260617-round-3.md`
- 结论：通过
- PASS：是
- 上轮问题关闭确认：
  - Round 1 Finding #1 bundled compatibility script repair 缺口：已关闭。
  - Round 2 Finding #1 target path/sourceRef 未成对绑定：已关闭。
- Requires Fixer：否
- 用户裁决：无
- 下一步：进入 CR closeout，严格按 `bmenhance-cr-04-rules-extractor 9-2`、`bmenhance-cr-05-todo-tracker 9-2`、`bmenhance-cr-06-finalizer 9-2` 顺序执行。

## Rules Extractor Result（规则提炼结果）

- 执行 skill：`bmenhance-cr-04-rules-extractor`
- 输出文件：`_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`
- 决策：record-only，未修改全局文档。
- 追加规则：
  - `CR-SEC-16`：Compatibility script repair 必须绑定 artifact kind、target path 与 sourceRef，`8/12`，去向 `rules-summary`。
- TODO 判断：`cr-04` 未识别未解决的非阻塞改进项，建议 `cr-05` 无需新增 TODO，但仍需按 closeout 顺序执行确认。
- 下一步：启动 `bmenhance-cr-05-todo-tracker 9-2`。

## TODO Tracker Result（TODO 追踪结果）

- 执行 skill：`bmenhance-cr-05-todo-tracker`
- TODO backlog：未更新 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 新增 TODO：0
- 匹配 Story 9.2 的现有 TODO：0
- 判断依据：Round 3 reviewer/evaluator 均明确无非阻塞待办，`cr-04` 未向 `cr-05` 交接未解决非阻塞候选项。
- 下一步：启动 `bmenhance-cr-06-finalizer 9-2`。

## Finalizer Result（收口结果）

- 执行 skill：`bmenhance-cr-06-finalizer`
- Latest evaluation：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-evaluation-20260617-round-3.md`
- CR 结论：PASS
- 修改文件：
  - `_bmad-output/implementation-artifacts/stories/9-2-python-resolver-compatibility-asset-projection.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- 状态变更：
  - Story 9.2：`Status: review` -> `Status: done`
  - `sprint-status.yaml`：`9-2-python-resolver-compatibility-asset-projection: review` -> `done`
  - `last_updated`：`2026-06-17 20:37 CST`
  - Story 9.1：保持 `done`
  - `epic-9`：保持 `in-progress`
- 跳过项：未发现 `_bmad-output/planning-artifacts/bmm-workflow-status.yaml`，按 finalizer 容错规则跳过。
- Epic 9 gate：Story 9.1 与 Story 9.2 均已 `done`；是否将 `epic-9` 同步为 `done` 需要用户或外层流程裁决，finalizer 未擅自修改。

## Round 1 Fixer Result（Round 1 修复结果）

- Fixer 依据：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-evaluation-20260617-round-1.md`
- 修复记录：已追加到 evaluation 文件 `## 修复执行记录`
- 修改文件：
  - `src/update/update-plan.ts`
  - `test/update-planning.test.ts`
  - `_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-evaluation-20260617-round-1.md`
- 修复摘要：
  - 为 `runtime-compat-script` repair candidate 增加 allowlist sourceRef 解析。
  - explicit repair 在 allowlist 命中时从当前 SpecLite package 的 `assets/source/speclite/scripts/` 读取 canonical bytes。
  - 未命中时保持原有 project-relative source evidence 逻辑。
  - 新增 focused tests 覆盖 fresh installed project 删除/篡改 resolver scripts 后 `update --repair --yes` 可恢复，以及 `bundled-runtime-compat:scripts/resolve_*.py` fallback sourceRef repair 行为。
- 验证：
  - `npm test -- --run test/update-planning.test.ts`：通过，22 tests。
  - `git diff --check`：通过。
- 下一步：重新启动 CR reviewer Round 2。

## Round 2 Reviewer Result（Round 2 审查结果）

- Review 文件：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-summary-20260617-round-2.md`
- 结论：不通过
- PASS：否
- 上轮问题关闭情况：Round 1 Finding #1 已关闭。
- 新 findings：1 个 `[中][新] / patch`
- 核心问题：explicit repair 的 compat allowlist 只绑定 `sourceRef`，未绑定 target path，可把 allowlisted Python resolver bytes 写入非 resolver 的 `_speclite/scripts/*` installer-owned entry。
- 降级情况：当前环境没有 reviewer 内部可调用的 `Agent` 子代理工具，reviewer 按 skill 降级路径串行完成三层复审。
- 下一步：启动 CR evaluator Round 2。

## Round 2 Evaluator Result（Round 2 评估结果）

- Evaluation 文件：`_bmad-output/implementation-artifacts/code-reviews/9-2-code-review/9-2-code-review-evaluation-20260617-round-2.md`
- 结论：不通过
- PASS：否
- Reviewer findings：有效 1 条，误报 0 条
- Requires Fixer：是
- Fixer 精确范围：
  - 收紧 `runtime-compat-script` repair source resolution 的 target path allowlist。
  - 要求 `sourceRef` 与 target path 成对匹配。
  - 新增 focused negative test：非 resolver `_speclite/scripts/*` target path 即使带 allowlisted resolver `sourceRef` 也不得被 repair 写入。
  - 不得改 default activation resolver、human/workflow-owned 保护、normal update hidden repair、IDE mirror repair、uninstall 或无关文档/进度文件。
- 用户裁决：无需用户裁决。
- 下一步：启动 CR fixer，仅按 evaluator 范围定点修复。

## Epic Status Closeout（Epic 状态收口）

- 时间：2026-06-17 21:49 CST
- 用户授权：允许更新 `epic-9` 为 `done`，继续。
- 状态变更：
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`：`epic-9: in-progress` -> `done`
  - `last_updated`：`2026-06-17 21:49 CST`
- 判断依据：Story 9.1 与 Story 9.2 均已 `done`，且各自最新 CR reviewer/evaluator 均 PASS，closeout 已完成。
- 下一步：执行最终提交前 scoped audit，只纳入 Epic 9 相关变更，使用中文 Conventional Commit 本地提交，不 push。
