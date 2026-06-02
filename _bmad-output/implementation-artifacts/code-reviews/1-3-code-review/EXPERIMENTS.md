# EXPERIMENTS（尝试记录）

## 2026-05-28 Corrective CR Reopen Run（校正复审轮次）

### Attempt 0（准备与分流）

- 方案：先核对 `sprint-status.yaml` 中 Story 1-3 的状态，再决定是否执行 dev-story。
- 原因：用户明确要求如果 story 对应 sprint 状态是 `review`，则跳过 `/bmad-dev-story story {story id}`。
- 结果：Story 1-3 当前状态为 `review`，本轮跳过 dev-story，进入 reviewer -> evaluator -> fixer 串行闭环。

### Attempt 1（Reviewer-only 复审输入收集）

- 方案：读取 `bmenhance-cr-01-reviewer` 配置、Story 文件、历史 round 1/2 review/evaluation、当前 Story diff 与 corrective 相关代码/测试 diff。
- 原因：本轮是 reopened corrective dev verification 后的 Story 1-3 复审，必须避免重新开发或扩展到 evaluator/fixer/finalizer。
- 结果：确认本轮为 `round-3`；历史 round 2 已 Approved；本轮新增 corrective Task 10 聚焦 canonical package root closure（`core=13`、`sdlc=40`、total `53`）。
- 决策：按 skill 降级规则在主流程内串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。

### Attempt 2（验证命令）

- 方案：执行 canonical package root 计数、`git diff --check`、Story 1-3 corrective 相关定向测试、全量测试、`npm run lint` 和 `npm run build`。
- 原因：review summary 模板要求记录真实 test/lint/build 结果；同时用命令证据验证 corrective 实现。
- 结果：`core-skills` 下 `SKILL.md` 数量为 13，`sdlc-skills` 下数量为 40；`git diff --check` 通过；定向测试 6 files / 45 tests 通过；全量 `npm test` 20 files / 116 tests 通过；`npm run build` 通过；`npm run lint` 失败于 `package.json` 未定义 lint script。
- 决策：将 lint 记录为脚本缺失，不作为本轮代码质量 finding；继续生成 reviewer conclusion。

### Attempt 3（Round 3 Reviewer 结论）

- 方案：对 corrective diff 做三层复审并生成 `1-3-code-review-summary-20260528-round-3.md`。
- 原因：用户要求仅完成 reviewer 步骤并报告是否通过、是否有 findings、是否需要 fixer。
- 结果：发现 1 个新 `patch` finding：package root count evidence 已进入未被成功路径展示的 config summary 和写入后的 ready summary，但没有真正出现在成功路径的写入前展示结果中。
- 决策：reviewer 结论不通过；需要进入 fixer，但本轮不启动 fixer。

### Attempt 4（Round 3 Review Evaluation）

- 方案：按 `/bmenhance-cr-02-evaluator 1-3` 读取最新 Round 3 reviewer summary，检测既有 evaluation round 1/2 后生成 round 3 evaluation。
- 原因：用户明确要求只处理 Story 1-3 最新 review，不执行 fixer / finalizer，不主动修改源码。
- 证据：Story AC7 要求 canonical package root count 必须在任何 project file write 之前展示确认；`configPlan.summary` 包含该 count，但 `runInstallCommand` 成功路径在 `configPlan.ok` 后直接进入 `InstallPlanSchema.parse(...)` 与 `applyInstallPlan(...)`；最终包含 count 的 `createInstalledReadySummary` 是 ready summary，`completedSteps` 已到 `ready-summary`。
- 命令：`find assets/source/speclite/core-skills -name SKILL.md | wc -l` 返回 13；`find assets/source/speclite/sdlc-skills -name SKILL.md | wc -l` 返回 40；`git diff --check -- _bmad-output/implementation-artifacts/code-reviews/1-3-code-review src/commands/install.ts src/installer/config-initialization.ts test/install-module-selection.test.ts` 通过。
- 结果：生成 `1-3-code-review-evaluation-20260528-round-3.md`；evaluator 结论不通过，reviewer finding 确认有效，P1 阻塞，需要 fixer。
- 决策：按用户要求本轮停止在 evaluator，不执行 fixer / finalizer，不修改源码或 Story 文档。

### Attempt 5（Round 4 Reviewer 输入收集）

- 方案：按 `/bmenhance-cr-01-reviewer 1-3` 读取 skill 配置、Story AC、Round 3 reviewer/evaluator、fixer diff、当前源码和测试。
- 原因：本轮只复检 Round 3 fixer 后状态，不能扩大到 evaluator/fixer/finalizer，也不能回滚或清理已有改动。
- 结果：确认已有 3 份 review summary，本轮输出 `round-4`；fixer 将 `createPrewriteModuleSummary` 接入 human `configureProject` prompt，并新增写入前 no-install-artifacts 测试。
- 决策：当前环境无独立 `Agent` 工具，按 skill 降级为主流程串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层复检。

### Attempt 6（Round 4 Reviewer 验证命令）

- 方案：执行 package root 计数、限定路径 `git diff --check`、Story 1-3 targeted tests、扩展相关测试、全量测试、build、lint，并做 detailed config 定向复现。
- 原因：需要用真实命令证据确认 Round 3 P1 是否关闭，同时检查 fixer 是否引入选择范围或写入时序回归。
- 结果：`core-skills` 下 `SKILL.md` 数量为 13，`sdlc-skills` 下数量为 40；限定路径 `git diff --check` 通过；`test/install-module-selection.test.ts` 9 tests 通过；8 个相关 test files / 57 tests 通过；全量 `npm test` 20 files / 117 tests 通过；`npm run build` 通过；`npm run lint` 因 `package.json` 未定义 lint script 失败。
- 额外复现：当 `configureProject` 返回 `mode: "detailed"` 且 `selectedModuleIds: ["core"]` 时，pre-write prompt 仍包含 `core=13, sdlc=40, total=53`，最终安装结果为 `installedModules: ["core"]` 且 final summary 为 `core=13, total=13`。
- 决策：Round 3 P1 未完全关闭；默认 quick human path 已修复，但 detailed config 仍可在 pre-write summary 之后改变最终安装范围。

### Attempt 7（Round 4 Reviewer 结论）

- 方案：生成 `1-3-code-review-summary-20260528-round-4.md`。
- 原因：用户要求给出 reviewer 结论、findings 和是否需要进入 evaluator/fixer。
- 结果：记录 1 个上轮遗留 `patch` finding：pre-write canonical package root count summary 与最终 selected module set 可能不一致。
- 决策：reviewer 结论不通过；需要进入 evaluator/fixer，但本轮按用户要求不执行。

### Attempt 8（Round 4 Review Evaluation）

- 方案：按 `/bmenhance-cr-02-evaluator 1-3` 读取最新 Round 4 reviewer summary，检测既有 evaluation round 1/2/3 后生成 round 4 evaluation。
- 原因：用户明确要求只处理 Story 1-3 最新 review，不执行 fixer / finalizer，不主动修改源码。
- 证据：Story AC7 要求 pre-write summary 必须描述每个 selected module 的 canonical package root count；当前 `createPrewriteModuleSummary` 在 `configSelection` 产生前使用初始 `selectedModules`，而 detailed config 可返回新的 `selectedModuleIds`，随后才计算 `finalSelectedModules` 并进入 `applyInstallPlan`。
- 命令：`npm test -- --run test/install-module-selection.test.ts` 通过，1 file / 9 tests；限定路径 `git diff --check` 通过；`find assets/source/speclite/core-skills -name SKILL.md | wc -l` 返回 13；`find assets/source/speclite/sdlc-skills -name SKILL.md | wc -l` 返回 40。
- 定向复现：用 `node --import tsx -e ...` 调用 `runInstallCommand`，让 `configureProject` 返回 `mode: "detailed"` 与 `selectedModuleIds: ["core"]`；结果显示 pre-write prompt 仍为 `core=13, sdlc=40, total=53`，最终 `installedModules` 为 `["core"]`，final summary 为 `core=13, total=13`，`config.toml` 不含 `[modules.sdlc]`。
- 结果：生成 `1-3-code-review-evaluation-20260528-round-4.md`；evaluator 结论不通过，reviewer finding 确认有效，P1 阻塞，需要 fixer。
- 决策：按用户要求本轮停止在 evaluator，不执行 fixer / finalizer，不修改源码或 Story 文档。

### Attempt 9（Round 5 Reviewer 输入收集）

- 方案：按 `/bmenhance-cr-01-reviewer 1-3` 读取 skill 配置、Story AC、Round 4 review/evaluation 修复记录、Round 4 fixer diff、当前源码和测试。
- 原因：本轮只复检 Round 4 fixer 后状态，重点确认 P1 是否关闭，不扩大到 evaluator/fixer/finalizer。
- 结果：确认已有 4 份 review summary，本轮输出 `round-5`；fixer 已在 `src/commands/install.ts` 中新增 `confirmPrewriteInstallScope` callback，并在 `finalSelectedModules` 与 `configPlan` 确定后、`applyInstallPlan` 前生成最终 summary。
- 决策：当前环境无独立 `Agent` 工具，按 skill 降级为主流程串行审查。

### Attempt 10（Round 5 Reviewer 验证命令）

- 方案：执行 Story 1-3 相关定向测试、全量测试、build、lint、限定路径 `git diff --check` 和 canonical package root 计数。
- 原因：需要用真实命令证据确认 Round 4 P1 是否关闭，同时检查 CLI prompt、写入时序、JSON/headless contract 和测试覆盖是否有新回归。
- 结果：`npm test -- --run test/install-module-selection.test.ts test/cli-smoke.test.ts` 通过，2 files / 14 tests；`npm test` 20 files / 118 tests 通过；`npm run build` 通过；`npm run lint` 因 `package.json` 未定义 lint script 失败；限定路径 `git diff --check` 通过；canonical package root count 仍为 `core=13`、`sdlc=40`。
- 决策：lint script 缺失不是本轮代码 finding；继续生成 reviewer conclusion。

### Attempt 11（Round 5 Reviewer 结论）

- 方案：生成 `1-3-code-review-summary-20260528-round-5.md`。
- 原因：用户要求给出 review 文件路径、reviewer 是否通过、是否有 findings、是否需要进入 evaluator/fixer。
- 结果：Round 4 P1 已关闭；未发现新的阻塞项或中高优先级问题。
- 决策：reviewer 结论通过；不需要进入 evaluator/fixer；本轮按用户要求不执行 evaluator / fixer / finalizer。

### Attempt 12（Round 5 Review Evaluation）

- 方案：按 `/bmenhance-cr-02-evaluator 1-3` 读取最新 Round 5 reviewer summary，检测既有 evaluation round 1/2/3/4 后生成 round 5 evaluation。
- 原因：用户停止条件要求 reviewer 通过且 evaluator 评估也通过，因此本轮仍需独立评估 reviewer pass 是否成立。
- 证据：Story AC7 要求 install scope summary 在任何 project file write 前展示并包含每个 selected module 的 canonical package root count；当前 `runInstallCommand` 在 `finalSelectedModules` 与 `configPlan` 确定后生成 `finalPrewriteSummary`，并在 `InstallPlanSchema.parse(...)` / `applyInstallPlan(...)` 前调用 `confirmPrewriteInstallScope`。
- 测试证据：`test/install-module-selection.test.ts` 覆盖 detailed config 改为 `core` only 的 regression path，断言最终 pre-write prompt 为 `core=13, total=13`、不包含旧的 `core=13, sdlc=40, total=53`，并在确认回调内验证尚无安装写入；`test/cli-smoke.test.ts` 覆盖 CLI human flow 的第三个最终 pre-write prompt。
- 命令：`npm test -- --run test/install-module-selection.test.ts test/cli-smoke.test.ts` 通过，2 files / 14 tests；`npm test` 通过，20 files / 118 tests；`npm run build` 通过；`npm run lint` 因缺少 `lint` script 失败；限定路径 `git diff --check` 通过；canonical package root count 为 `core=13`、`sdlc=40`。
- 结果：生成 `1-3-code-review-evaluation-20260528-round-5.md`；evaluator 结论通过，Fix Items: 0。
- 决策：不需要 fixer；按用户要求本轮停止在 evaluator，不执行 fixer / finalizer，不修改源码或 Story 文档。

## 2026-05-26

### Experiment 1：Story 1-3 启动预检

- 方案：基于 `sprint-status.yaml` 与 Story 文件确认 `1-3-official-module-selection-and-install-summary` 可进入开发。
- 选择原因：Story 1-1 与 Story 1-2 已 Done，Epic 1 的下一个 Story 在 sprint status 中为 `ready-for-dev`，满足串行执行前置条件。
- 结果：已创建 `1-3-code-review` 进度目录和三份中文记录文件。
- 决策：启动新的 `gpt-5.5` sub-agent 执行 `/bmad-dev-story story 1-3`。

### Experiment 2：开发 Story 1-3

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmad-dev-story story 1-3` 执行开发。
- 选择原因：用户明确要求开发步骤必须由新的 sub-agent 使用 `bmad-dev-story` 完成，并且每一步串行等待前一步结束。
- 结果：开发 sub-agent 汇报 Story `1-3` 已完成开发，Story 文件与 `sprint-status.yaml` 均更新为 `review`；新增或更新官方 source discovery、module metadata、module selection、install summary 投影、module fixture metadata 和相关测试；`npm ci && npm run build && npm test` 通过，7 个测试文件 / 33 个测试全部通过。
- 决策：进入第 1 轮 code review；不在主线程提前修改实现，避免绕过 CR 流程。

### Experiment 3：第 1 轮 Code Review

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-01-reviewer 1-3` 执行代码审查。
- 选择原因：用户明确要求 reviewer 必须在开发完成后串行执行，并由新的 sub-agent 完成。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-summary-20260526-round-1.md`；reviewer 结论不通过，提出 3 项，其中 `decision_needed` 1 项、`patch` 2 项。reviewer 因缺少 `node_modules` 且只读，未重跑 `npm test` 或 `npm run build`。
- 决策：进入 evaluator，由 evaluator 对 selection 入口/契约边界给出默认推荐决策，并确认 patch 修复范围。

### Experiment 4：第 1 轮 Review Evaluation

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-02-evaluator 1-3` 评估最新 review 文件。
- 选择原因：reviewer 包含 `decision_needed` 项，用户要求优先采用推荐决策执行，不能因等待决策挂起。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-evaluation-20260526-round-1.md`；evaluator 结论不通过，确认 3 个 findings 均有效，误报 0 项。推荐决策为不新增 public selection flag，在 human interactive path 增加最小多选入口；JSON/headless path 保持默认或 pending/no-write 表达。
- 决策：启动 fixer 修复 3 项；修复范围限定为 human interactive module selection、internal `InstallPlan.selectedModules` 构造、unknown required dependency diagnostic。

### Experiment 5：第 1 轮 Fixer

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-03-fixer 1-3` 修复 evaluator 确认的 3 项。
- 选择原因：evaluator 已确认 3 项均有效且不通过，必须先修复再复审。
- 结果：fixer 修改 `src/bin/speclite.ts`、`src/commands/install.ts`、`src/modules/module-metadata.ts`、`test/cli-smoke.test.ts`、`test/install-module-selection.test.ts`、`test/source-and-modules.test.ts`，并向 evaluation 文件追加修复记录；`npm test`、`npm run build` 均通过。
- 决策：进入第 2 轮 reviewer/evaluator 复审，重点确认 3 个修复项是否关闭且无新增回归。

### Experiment 6：第 2 轮 Code Review

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-01-reviewer 1-3` 执行复审。
- 选择原因：fixer 修改了源码和测试，必须重新由 reviewer 验证已修复问题和新增回归。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-summary-20260526-round-2.md`；reviewer 结论通过，第 1 轮 3 个 findings 均已关闭，新发现数量 0。
- 决策：进入第 2 轮 evaluator；如果 evaluator 通过，仍执行 0 修复项 fixer 收口以保持用户指定链路完整。

### Experiment 7：第 2 轮 Review Evaluation

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-02-evaluator 1-3` 评估第 2 轮 review 文件。
- 选择原因：用户要求 reviewer 通过后还必须由 evaluator 独立确认，只有两者均通过才能退出循环。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-evaluation-20260526-round-2.md`；evaluator 结论 Approved / 通过，确认上轮 3 个 findings 均已关闭，需要修复项 0，CR TODO 0。
- 决策：启动 fixer 执行 0 修复项收口；不得修改源码，仅追加必要修复记录。

### Experiment 8：第 2 轮 Fixer 收口

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-03-fixer 1-3` 读取最新评估文件并处理修复项。
- 选择原因：保持 reviewer/evaluator/fixer 循环链路完整，同时确保 0 修复项不会被误扩展为源码修改。
- 结果：fixer 未修改源码、测试、配置、Story 文档或状态文件；仅在 `1-3-code-review-evaluation-20260526-round-2.md` 追加 `Fix Items: 0` 的修复执行记录。
- 决策：reviewer 与 evaluator 均已通过，且 fixer 确认为 0 修复项；无需重复第 2~4 步，进入 04/05/06 CR 收尾。

### Experiment 9：CR 收尾

- 方案：启动第五个全新的 `gpt-5.5` sub-agent，按顺序执行 `bmenhance-cr-04-rules-extractor 1-3`、`bmenhance-cr-05-todo-tracker 1-3`、`bmenhance-cr-06-finalizer 1-3`。
- 选择原因：用户要求通过后仍需执行 04、05、06，并按默认推荐决策处理规则和 TODO。
- 结果：04 按 record-only 向 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 追加 3 条已修复可复用规则，未修改全局文档；05 判定 CR TODO 数量为 0，未创建 TODO backlog；06 验证最新 evaluation 为 Approved / 通过后，将 Story 文件更新为 `Status: done`，并将 `sprint-status.yaml` 中 `1-3-official-module-selection-and-install-summary` 更新为 `done`。
- 决策：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 规则跳过；Epic 1 尚有未完成 Story，不更新 Epic 状态。Story 1-3 完成，进入 Story 1-4。

### Attempt 13（Post-CR Closeout 04：规则提炼）

- 方案：按 `bmenhance-cr-04-rules-extractor 1-3` 读取 Story 1-3 全部 5 轮 CR summary/evaluation、既有 `cr-rules-summary.md` 和 promotion rules。
- 原因：用户要求即使 04 原本可能不需要执行，本次也必须执行，并在需要决策时采用默认推荐决策，避免挂起。
- 结果：识别 Round 3/4 的同类 AC7 pre-write summary 绑定问题已由 Round 5 确认关闭；未发现需要升格到全局文档的规则。
- 决策：采用 record-only；向 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 追加 `CR-DOC-02：Final pre-write install scope summary 必须绑定最终 selected module set`，不修改全局文档，不新增 TODO。

### Attempt 14（Post-CR Closeout 05：TODO 跟踪）

- 方案：按 `bmenhance-cr-05-todo-tracker 1-3` 执行 extract/check，读取 Story 1-3 全部 CR 文件和 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`。
- 原因：用户要求即使 05 原本不要求执行，本次也必须根据 CR 结果确认是否有非阻塞项进入 backlog。
- 结果：Round 2/3/4/5 reviewer 均记录非阻塞待办为“无”；Round 5 evaluator 明确“未发现需要延迟跟踪的非阻塞 CR TODO”。现有 backlog 仅有 TODO-001 / TODO-002，来源分别为其他 Story，未匹配 Story 1-3。
- 决策：不新增 TODO，不修改 `cr-todo-backlog.md`；继续执行 06 finalizer。

### Attempt 15（Post-CR Closeout 06：Finalizer）

- 方案：按 `bmenhance-cr-06-finalizer 1-3` 验证最新 evaluation，再同步 Story 与 sprint status。
- 原因：Round 5 evaluator 明确 `Approved / 通过` 且 `Fix Items: 0`，满足 CR Done 前置条件；当前 Story 文件与 sprint status 均仍为 `review`，需要收回 `done`。
- 结果：将 `_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md` 的 `Status` 更新为 `done`；将 `_bmad-output/implementation-artifacts/sprint-status.yaml` 中 `1-3-official-module-selection-and-install-summary` 更新为 `done`，并更新 `last_updated` 为 `2026-05-28 16:53 CST`。
- 决策：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按规则跳过；Epic 1 仍有 `1-5`、`1-6` 为 `review`，且用户要求不处理 Epic 主状态，因此不更新 `epic-1`。
