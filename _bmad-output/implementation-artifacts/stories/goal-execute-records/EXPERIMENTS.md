# Epic 10 Story Creation Experiments（Epic 10 Story 创建尝试记录）

## Experiment 1: Workflow Activation And Continuation Check（Workflow 激活与续跑点检查）

- Time: 2026-07-06
- Story Scope: Epic 10
- Approach: 先读取 `bmad-create-story` Skill、workflow customization、BMad config、persistent facts、tracker 与已有 Story 文件，再确定第一个未完成 Story。
- Why This Approach（选择原因）: 用户明确要求先检查当前执行进度，避免重复创建；Skill 也要求从 `sprint-status.yaml` 自动发现第一个 backlog Story。
- Result（结果）:
  - `python3` 解析 customization 因 `tomllib` 缺失失败。
  - 改用 `python3.12` 成功解析 workflow。
  - 确认 `epic-10` 已 `in-progress`，`10-1` 已 `ready-for-dev`，第一个未完成 Story 是 `10-2`。
- Decision（决策）:
  - 使用 `python3.12` 作为本轮 resolver 命令。
  - 按 `PLAN.md` 而不是 `LAN.md` 创建进度记录，因为用户后文明确三份记录文件为 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。

## Experiment 2: Story 10.2 Creation（Story 10.2 创建）

- Time: 2026-07-06
- Status: Completed
- Approach: 基于 Epic 10、Story 10.1、support skill docs、module metadata 代码和 canonical source check 脚本，创建 authoring / creator / lint / module-help / version discipline Story。
- Why This Approach（选择原因）: 10.2 的目标不是再实现 selected-only projection，而是降低后续 ecosystem package authoring 成本；因此 Story 必须把 support skills 与 deterministic checks 写成主线。
- Result（结果）:
  - 已创建 `_bmad-output/implementation-artifacts/stories/10-2-ecosystem-authoring-contract-and-creator-support.md`。
  - 已将 `sprint-status.yaml` 中 `10-2-ecosystem-authoring-contract-and-creator-support` 更新为 `ready-for-dev`。
- Decision（决策）:
  - `support-skills/` 保持 maintainer-only，不创建 module metadata。
  - creator / lint 同时进入 Story 范围；只改 docs 而不改 lint 会留下不可验证的 authoring drift。

## Experiment 3: Story 10.3 Creation（Story 10.3 创建）

- Time: 2026-07-06
- Status: Completed
- Approach: 检查当前 source tree 是否已有 frontend / React / Vue canonical package，再按 Epic 10 和前序 Story 契约创建 frontend ecosystem expansion Story。
- Why This Approach（选择原因）: 仓库没有可迁移的 frontend-specific Skill；因此 10.3 应定义首批 React / Vue seed modules，而不是虚构迁移事实。
- Result（结果）:
  - 已创建 `_bmad-output/implementation-artifacts/stories/10-3-frontend-ecosystem-source-expansion.md`。
  - 已将 `sprint-status.yaml` 中 `10-3-frontend-ecosystem-source-expansion` 更新为 `ready-for-dev`。
- Decision（决策）:
  - React / Vue seed packages 必须以目标项目 evidence 为基础，不在 Story 中硬编码未经查证的框架版本。
  - 通用 UX / Architecture / Story workflow 继续留在 `sdlc`，不迁入 frontend ecosystem。

## Experiment 4: Story 10.4 Creation（Story 10.4 创建）

- Time: 2026-07-06
- Status: Completed
- Approach: 先盘点 npm、CLI、docs 相关 existing SDLC capabilities，再创建 `other` category 的受约束 Story。
- Why This Approach（选择原因）: `other` 容易变成 catch-all；先分类既有能力能避免把默认 SDLC workflow 静默迁走。
- Result（结果）:
  - 已创建 `_bmad-output/implementation-artifacts/stories/10-4-other-ecosystem-source-expansion.md`。
  - 已将 `sprint-status.yaml` 中 `10-4-other-ecosystem-source-expansion` 更新为 `ready-for-dev`。
- Decision（决策）:
  - `speclite-npm-publisher`、`speclite-write-opensource-docs` 和 `speclite-agent-docs-steward` 默认保持在 `sdlc`。
  - `other` 初始 example ids 采用 `npm-package`、`cli-tool`、`documentation-only`，禁止无边界 `misc` / `general`。

## Experiment 5: Story 10.5 Creation（Story 10.5 创建）

- Time: 2026-07-06
- Status: Completed
- Approach: 读取 fixture release gate、packaging check、manifest-schema baseline 和 canonical source check 当前 hardcoded count，再创建 release gate generalization Story。
- Why This Approach（选择原因）: Epic 10 引入 optional ecosystem 后，最容易出错的是把 default `core+sdlc` count 当作所有 install state 的 truth。
- Result（结果）:
  - 已创建 `_bmad-output/implementation-artifacts/stories/10-5-ecosystem-fixture-and-release-gate-generalization.md`。
  - 已将 `sprint-status.yaml` 中 `10-5-ecosystem-fixture-and-release-gate-generalization` 更新为 `ready-for-dev`。
- Decision（决策）:
  - default no-ecosystem fixture 可以继续保留 explicit `core+sdlc` baseline，但 validation / release gate 必须按 selected modules 推导 expected count。
  - release verification 必须串行：先 build，再 focused tests / fixture gates，最后 packaging check。

## Experiment 6: Story 10.6 Creation（Story 10.6 创建）

- Time: 2026-07-06
- Status: Completed
- Approach: 读取 public docs 入口、quick start、runtime layout、canonical source layout 和 README 当前表达，再创建 docs / maintainer workflow 收口 Story。
- Why This Approach（选择原因）: Epic 10 的 source / fixture / release gate 变化最终必须被用户和维护者看见；仅有 Story 或 tests 不足以指导后续扩展。
- Result（结果）:
  - 已创建 `_bmad-output/implementation-artifacts/stories/10-6-public-docs-and-maintainer-workflow.md`。
  - 已将 `sprint-status.yaml` 中 `10-6-public-docs-and-maintainer-workflow` 更新为 `ready-for-dev`。
- Decision（决策）:
  - docs 必须把 ecosystem modules 写成 optional Skill package selection，不得暗示安装 React / Vue / Java / npm runtime dependencies。
  - `core+sdlc` count 只允许作为 default no-ecosystem snapshot，有上下文限定。

## Experiment 7: Final Verification（最终验证）

- Time: 2026-07-06
- Status: Completed
- Approach: 按用户要求和 hook 提示，验证 tracker 无 backlog、Story 关键章节存在、diff whitespace check 通过，并运行 canonical source change check。
- Why This Approach（选择原因）: 本轮只创建 Story 文档和 tracker/进度记录，不涉及代码实现；因此采用文件级验证与 canonical source warning-only check 收口。
- Result（结果）:
  - `10.2` 到 `10.6` 均已创建为 `ready-for-dev`。
  - `sprint-status.yaml` 中 `10.2` 到 `10.6` 均为 `ready-for-dev`。
  - `git diff --check` 通过。
  - `speclite-check-canonical-source-change` 输出 `status=ok` 且 `findings=[]`。
- Decision（决策）:
  - 不运行 `npm test` 或 `npm run build`，因为本轮没有修改 runtime code、canonical source、fixtures 或 package manifest；Story 10.5 / 10.6 已把这些命令列为后续实现 Story 的验收门禁。
