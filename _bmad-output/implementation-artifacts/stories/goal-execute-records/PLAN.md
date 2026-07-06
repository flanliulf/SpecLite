# Epic 10 Story Creation Plan（Epic 10 Story 创建计划）

## Objective（目标）

使用 `bmad-create-story` workflow，从当前进度继续为 Epic 10 创建尚未完成的 Story 文件，并同步更新 `sprint-status.yaml` 与本目录下的执行记录。

## Current Continuation Point（当前续跑点）

- 已读取 `bmad-create-story` Skill、`discover-inputs.md`、`checklist.md` 与 `template.md`。
- 已解析 customization：无 prepend / append activation steps；persistent facts 为 `_bmad-output/project-context.md`。
- 已读取 `_bmad/bmm/config.yaml`，确认 `implementation_artifacts` 为 `_bmad-output/implementation-artifacts`。
- 已完整读取 `_bmad-output/implementation-artifacts/sprint-status.yaml`。
- 当前 tracker 状态：
  - `epic-10`: `in-progress`
  - `10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure`: `ready-for-dev`
  - `10-2` 到 `10-6`: `backlog`
- 决策：用户前文写到 `LAN.md`，后文正式说明为 `PLAN.md`；本轮按三份文件 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 执行，不额外创建 `LAN.md`。

## Serial Execution Rules（串行执行规则）

- 严格一次只创建一个 Story，不并行创建、不批量生成。
- 每个 Story 的顺序为：
  1. 读取目标 Story 所需上下文。
  2. 生成该 Story 文件。
  3. 自检 Story 文件是否包含 `Status: ready-for-dev`、核心 AC、任务、Dev Notes、References、Change Log。
  4. 更新 `sprint-status.yaml` 中该 Story 的状态为 `ready-for-dev`。
  5. 更新 `EXPERIMENTS.md` 与 `EXPERIMENT_NOTES.md`。
  6. 进入下一个 Story。
- 如遇需要决策的事项，优先采用推荐决策并记录，不等待用户确认；只有出现会越过用户授权边界的改动才停止。

## Story Queue（Story 队列）

- [x] `10-2-ecosystem-authoring-contract-and-creator-support`
- [x] `10-3-frontend-ecosystem-source-expansion`
- [x] `10-4-other-ecosystem-source-expansion`
- [x] `10-5-ecosystem-fixture-and-release-gate-generalization`
- [x] `10-6-public-docs-and-maintainer-workflow`

## Verification Plan（验证计划）

- 每个 Story 创建后检查文件存在、标题、状态、关键章节和 tracker 状态。
- 全部 Story 完成后运行：
  - `rg -n "10-[2-6].*: backlog" _bmad-output/implementation-artifacts/sprint-status.yaml`
  - `git diff --check -- _bmad-output/implementation-artifacts/sprint-status.yaml _bmad-output/implementation-artifacts/stories`
  - `git status --short -- _bmad-output/implementation-artifacts/sprint-status.yaml _bmad-output/implementation-artifacts/stories`

## Completion Verification（完成验证）

- `rg -n "10-[2-6].*: backlog" _bmad-output/implementation-artifacts/sprint-status.yaml`：无匹配，表示 `10.2` 到 `10.6` 已无 backlog。
- Story 文件关键章节检查：`10.2` 到 `10.6` 均包含标题、`Status: ready-for-dev`、`Acceptance Criteria`、`Tasks / Subtasks`、`Dev Notes`。
- `git diff --check -- _bmad-output/implementation-artifacts/sprint-status.yaml _bmad-output/implementation-artifacts/stories/...`：通过。
- `speclite-check-canonical-source-change`：`status=ok`，`findings=[]`。
