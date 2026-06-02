# EXPERIMENT_NOTES

## 2026-05-28 CR Closeout

- 当前执行 Story：`2-2-ide-skill-entry-mapping`。
- 执行顺序：`bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`，严格串行。
- 默认决策：无新增规则时不修改全局文档；无非阻塞项时不新增 TODO；finalizer 只同步 Story 2-2 相关状态，不处理其他 Story 或 Epic 主状态。
- 04 结果：Round 3 未产生新 findings；既有 `CR-API-09` 已覆盖 Round 1 的可复用规则；本轮不新增规则总结、不修改全局文档。
- 05 结果：新增 TODO 0；现有 backlog 的 TODO-001/TODO-002 均非 Story 2-2 来源，且不匹配 Story 2-2 File List；本轮不修改 `cr-todo-backlog.md`。
- 06 结果：latest evaluation round 3 结论为通过；Story `Status` 已更新为 `done`；`sprint-status.yaml` 对应条目已更新为 `done`；`bmm-workflow-status.yaml` 不存在，按规则跳过。
- Epic 结果：Epic 2 仍有 `2-3-skill-activation-and-phase-capability-coverage: review`，不更新 `epic-2` 主状态。
- 当前步骤：三步收尾完成。

## 2026-05-28 Evaluator Round 3

- 已完成 `/bmenhance-cr-02-evaluator 2-2` round 3。
- 评估对象：`2-2-code-review-summary-20260528-round-3.md`。
- 评估产物：`2-2-code-review-evaluation-20260528-round-3.md`。
- evaluator 结论：通过；reviewer pass 成立；未发现 reviewer 漏掉的阻塞项或 CR TODO。
- fixer 决策：不需要 fixer；按用户边界不执行 fixer/finalizer。
- 独立验证：targeted tests 7 files / 51 tests 通过；full `npm test` 20 files / 118 tests 通过；`git diff --check` 通过；`npm run lint` Missing script，已确认 `package.json` 未定义 `lint` script。

## 2026-05-28 Corrective CR Reopen Run（校正复审轮次）

- 已完成 `/bmenhance-cr-01-reviewer 2-2` round 3。
- 复审结论：通过；新 findings：0；阻塞项：0；无需进入 fixer。
- 主要证据：`writeIdeMirrors()` 使用 selected module `packageRoots` 构建 package entries；runtime test 断言 `skill-index.json` entries 与 `.claude` / `.agents` mirror `SKILL.md` ids 完全一致；fixture expected installed tree 中 `.claude` 与 `.agents` 各 53 个 `SKILL.md` entry。
- 验证结果：`npm run build` 通过；targeted tests 7 files / 51 tests 通过；full `npm test` 20 files / 118 tests 通过；`git diff --check` 通过；`npm run lint` Missing script，按既有 evaluator 结论视为项目脚本事实。
- 本轮停止：按用户要求不执行 evaluator/fixer/finalizer。

- 当前判断：Story 2-2 已处于 `review`，说明上一轮 corrective dev verification 已完成到待审状态。
- 下一步：等待前序 Story 完成后，启动全新 sub-agent 执行 `/bmenhance-cr-01-reviewer 2-2`。

## 2026-05-27 12:02

- 当前执行 Story：`2-2-ide-skill-entry-mapping`。
- 下一步：启动 fresh sub-agent，使用 `gpt-5.5` 执行 `/bmad-dev-story story 2-2`。
- 决策：沿用 Story 2.1 修订后的 functional anchor 标准；不要因缺少独立 manifest/index split files 而停止。
- 注意：当前工作树包含用户安装依赖产生的 `node_modules/`，以及未跟踪 `assets/source/speclite/support-skills/`；本流程不清理这些内容。

## 2026-05-27 12:34

- Story 2.2 当前 CR 状态：第 2 轮 reviewer 通过，第 2 轮 evaluator 通过。
- 下一步：启动第五个 fresh sub-agent，按顺序执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- 决策：04/05 若有可落地默认推荐项，按用户授权采用推荐决策执行；若无新增规则/TODO，则记录无新增并继续 finalizer。

## 2026-05-27 12:07

- 已执行 `bmad-dev-story` 激活步骤；workflow 无 prepend/append，persistent fact 为 `file:{project-root}/**/project-context.md`。
- `project-context.md` 仍为占位内容，实施依据以 Story 2.2、live specs、当前源码和测试为准。
- 前置 anchor 初查通过：当前仓库存在 `package.json`、`src/`、`test/`、`src/manifest/manifest-schema.ts`、`src/manifest/manifest-generator.ts`、`src/installer/runtime-structure.ts`、`src/ide/adapter-registry.ts`、`src/ide/target-writer.ts`、`src/fixtures/fixture-contract.ts` 与 fixture tests。

## 2026-05-27 12:12

- 实现决策：`SKILL.en.md` 不属于 Story 2.2 self-contained entry 白名单，本轮不复制到 IDE mirror；canonical source package 可继续保留该文件。
- 实现决策：`cursor` / `copilot` 等 branded target 在 MVP 中不是 registry target；用户显式选择时返回 `ide-mirror.unsupported-target`，而不是回退为 `agents`。
- 验证结果：`npm run build`、`npm test`、`git diff --check` 均通过。
- 状态结果：Story `2-2-ide-skill-entry-mapping` 与 `sprint-status.yaml` 已更新为 `review`。

## 2026-05-27 12:36

- 已执行 `bmenhance-cr-04-rules-extractor`。
- 规则沉淀：新增 `CR-API-09`，标题为 ``canonicalPackageHash` 必须基于 installed canonical entry copied surface`，总分 7/12，最终去向 `rules-summary`。
- 决策：仅 record-only 更新 `cr-rules-summary.md`；不修改 `project-context.md`、architecture、specs 或其他全局文档。
- 05 交接：Round 2 evaluation 明确 CR TODO 0，目前未识别未解决非阻塞项。

## 2026-05-27 12:36

- 已执行 `bmenhance-cr-05-todo-tracker`。
- TODO 结果：新增 0 条；无 open/in-progress 条目需要匹配 Story 2.2。
- 证据：Round 1 evaluation 的 CR TODO 表为无；Round 2 evaluation 明确无继承或新增 CR TODO，且无需要纳入 CR TODO 的事项。
- 文件决策：`cr-todo-backlog.md` 当前不存在；因为本次新增 TODO 为 0，不初始化该 backlog 文件。

## 2026-05-27 12:36

- 已执行 `bmenhance-cr-06-finalizer`。
- CR 审批证据：latest evaluation 为 `2-2-code-review-evaluation-20260527-round-2.md`，结论为通过。
- 状态同步：Story `2-2-ide-skill-entry-mapping` 已标记 `done`；`sprint-status.yaml` 对应条目已同步为 `done`。
- 容错结果：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 规则跳过。
- Epic 结果：Epic 2 仍有 `2-3`、`2-4`、`2-5` 未 done，因此保留 `epic-2: in-progress`。
