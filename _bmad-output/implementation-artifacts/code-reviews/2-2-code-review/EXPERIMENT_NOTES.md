# EXPERIMENT_NOTES

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
