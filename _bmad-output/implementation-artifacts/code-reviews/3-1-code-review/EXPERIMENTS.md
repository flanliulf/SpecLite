# EXPERIMENTS

## 尝试记录

### 2026-05-28 初始化

- 方案: 将本目录进度文件收敛为 Story 3.1 dev-only 执行记录。
- 选择原因: 用户本轮硬性要求只执行 `/bmad-dev-story story 3-1`，完成后进入 `review`，不得执行 CR/finalizer/git。
- 结果: 已收敛计划，开始读取 Story、项目上下文和前置实现锚点。

### 2026-05-28 前置核对

- 方案: 使用 `rg --files` 和文件读取核对 `package.json`、`src/`、`test/`、CLI、install、manifest/source/adapter/diagnostics/fixture anchors 是否存在。
- 结果: 前置实现锚点存在；`src/commands/status.ts` 尚不存在，需要在 Story 3.1 范围内新增。
- 关键边界: 当前 worktree 大量 dirty 文件保留不动，只修改 Story 3.1 需要的 status 实现、测试、状态文件和本目录进度记录。

### 2026-05-28 Red-Green-Refactor

- Red: 新增 `test/status-command.test.ts`，focused test 首次运行失败，原因是 `src/commands/status.ts` 不存在。
- Green: 新增 `src/commands/status.ts`、`src/status/installed-state.ts`，扩展 `StatusCommandData` / `StatusCommandResult` schema、human/json renderer 和 CLI 注册。
- Refactor: 补齐 partial target 的 `reason` 与 `affectedPath`，并保持 `installedModules` 使用 manifest 顺序。
- 结果: `npx vitest run test/status-command.test.ts` 通过，`npm run build` 通过，`npm test` 全量通过。

### 2026-05-28 验证收口

- 命令: `npx vitest run test/status-command.test.ts`
- 结果: 1 个测试文件、8 个测试通过。
- 命令: `npm run build`
- 结果: tsup ESM 与 DTS 构建通过。
- 命令: `npm test`
- 结果: 21 个测试文件、126 个测试通过。
- 范围检查: 未修改 planning artifacts、其他 story 文件，也未实现 validate/update/repair/remote freshness/provenance/doctor/sync/uninstall/command pointer/branded Copilot-Cursor target。

### 2026-05-28 CR Round 1

- 方案: 按 `bmenhance-cr-01-reviewer` 首轮流程审查 Story 3.1 相关变更。
- 降级说明: 当前外层环境无独立 Agent 工具可调用，按 skill 规则降级为当前上下文串行三层审查。
- 范围: 仅审查 Story File List 中的 `src/bin/speclite.ts`、`src/commands/status.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/output.ts`、`src/status/installed-state.ts`、`test/status-command.test.ts` 以及必要状态文件 diff；不审查无关 dirty worktree。
- 验证: `npx vitest run test/status-command.test.ts` 通过；`git diff --check -- <Story 3.1 files>` 通过。
- 结果: 生成 `3-1-code-review-summary-20260528-round-1.md`；结论为不通过，包含 2 个 patch 项、0 个 decision_needed、0 个 defer。

### 2026-05-28 CR Evaluation Round 1

- 方案: 按 `bmenhance-cr-02-evaluator` 评估最新一轮 CR summary，即 `3-1-code-review-summary-20260528-round-1.md`。
- 范围: 严格只读 Story 3.1 文档、CR summary 与相关源码；不修复、不改源码、不改 Story 文件。
- 判断: Finding #1 与 Story 的 public path / deterministic JSON 契约冲突，确认有效，评估为 P1 修复项；Finding #2 与 corrupted manifest/index/source descriptor 应进入 failed health 的算法冲突，确认有效，评估为 P1 修复项。
- 结果: 生成 `3-1-code-review-evaluation-20260528-round-1.md`；整体不通过，需修复项 2 个，TODO / 记录项 0 个，误报 0 个，可进入 fixer。

### 2026-05-28 CR Fixer Round 1 计划

- 方案: 按 `bmenhance-cr-03-fixer` 只修复最新评估文件确认的 2 个 P1 项。
- 修复项 1: 在 manifest/public status path schema 边界复用 project-relative POSIX path 校验，malformed manifest path 视为 invalid manifest，返回 failed health 与默认 safe paths，不投影原始 path。
- 修复项 2: 将 `readSkillIndex` 改为区分 `valid` / `missing` / `invalid`；missing 保持 partial，invalid/schema-invalid/unreadable 映射为 failed target 与 failed high-level health。
- 验证计划: 补充 absolute / parent / backslash path 不泄露测试，以及 invalid JSON / schema-invalid skill-index failed 测试；运行 `npx vitest run test/status-command.test.ts` 和 `git diff --check`。

### 2026-05-28 CR Fixer Round 1 结果

- 修改: `src/manifest/manifest-schema.ts` 与 `src/diagnostics/command-result-schema.ts` 对 public path 字段增加 project-relative POSIX 校验。
- 修改: `src/status/installed-state.ts` 将 `skill-index` 读取结果拆为 `valid` / `missing` / `invalid`，invalid 返回 failed target 并驱动 overall failed。
- 测试: `test/status-command.test.ts` 新增 malformed manifest paths 不泄露用例，以及 invalid JSON / schema-invalid `skill-index.json` failed health 用例。
- 验证: `npx vitest run test/status-command.test.ts` 通过，1 个测试文件、10 个测试通过；`npm run build` 通过；`git diff --check` 通过。

### 2026-05-28 CR Round 2 复审

- 方案: 按 `bmenhance-cr-01-reviewer` 复审流程重新审查 Story 3.1，重点验证 Round 1 的 2 个修复项。
- 范围: 仅审查 Story 3.1 File List 与修复执行记录点名文件，包括 `src/bin/speclite.ts`、`src/commands/status.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/output.ts`、`src/manifest/manifest-schema.ts`、`src/status/installed-state.ts`、`test/status-command.test.ts`。
- 历史上下文: Round 1 reviewer 发现 2 个 patch 项；Round 1 evaluator 确认为 2 个 P1 修复项；fixer 记录显示均已修复并通过 focused test、build 与 `git diff --check`。
- 降级说明: 当前外层环境无独立 Agent 工具可调用，按 reviewer skill 降级为当前上下文串行三层审查。
- 验证: `npx vitest run test/status-command.test.ts` 通过，1 个测试文件、10 个测试通过；Story 3.1 目标文件 `git diff --check` 通过。
- 结果: 生成 `3-1-code-review-summary-20260528-round-2.md`；结论为通过，blocking 0、patch 0、defer 0，可进入 evaluator。

### 2026-05-28 CR Evaluation Round 2

- 方案: 按 `bmenhance-cr-02-evaluator` 只评估最新 CR summary，即 `3-1-code-review-summary-20260528-round-2.md`。
- 范围: 严格只读源码、Story 文档和 CR 产物；不修复、不改源码、不改 Story 文件，不触碰无关 dirty worktree。
- 判断: Round 1 Finding #1 已由 manifest schema 与 public command result schema 的 project-relative POSIX 校验闭环，malformed manifest path 不再投影到 public JSON；Round 1 Finding #2 已由 `valid` / `missing` / `invalid` skill-index 读取结果和 failed target 映射闭环。
- 验证: `npx vitest run test/status-command.test.ts` 通过，1 个测试文件、10 个测试通过；目标文件 `git diff --check` 通过。未运行会刷新 `dist/` 的 `npm run build`。
- 结果: 生成 `3-1-code-review-evaluation-20260528-round-2.md`；结论 Approved / 通过，需修复项 0 个，TODO / 记录项 0 个，满足进入 rules/todo/finalizer 条件。

### 2026-05-28 CR 04 Rules Extractor

- 方案: 严格在 Round 2 Approved 之后执行 `bmenhance-cr-04-rules-extractor 3-1`，读取 Story 3.1 四份 CR 产物。
- 判断: 两项 Round 1 P1 findings 均已修复并由 Round 2 复审 / 评估确认，具备已验证、已解决、可沉淀条件。
- 规则: 新增 `CR-SEC-06`（public status path projection 必须拒绝未校验 installed-state paths）和 `CR-API-15`（installed-state index 读取必须区分 missing 与 corrupted），均评分 7/12，建议去向 `rules-summary`。
- 决策: 按用户授权采用默认推荐决策 record-only；不修改 `project-context.md`、architecture、specs 或其他全局文档。

### 2026-05-28 CR 05 TODO Tracker

- 方案: 严格在 04 完成后执行 `bmenhance-cr-05-todo-tracker 3-1`，只处理 non-blocking 候选项。
- 判断: Round 1 evaluator 明确两项均为阻塞修复项，不建议降级为 TODO；Round 2 reviewer/evaluator 均确认 defer / CR TODO 为 0。
- 结果: 无新增 TODO；不修改 `cr-todo-backlog.md`。

### 2026-05-28 CR 06 Finalizer

- 方案: 严格在 05 完成后执行 `bmenhance-cr-06-finalizer 3-1`。
- 验证: 最新评估文件为 `3-1-code-review-evaluation-20260528-round-2.md`，结论 `Approved / 通过`；Story 当前状态为 `review`。
- 结果: 将 Story 3.1 文件状态更新为 `done`，将 `sprint-status.yaml` 中 `3-1-lightweight-install-status-summary` 更新为 `done`，并更新时间戳为 `2026-05-28 19:45 CST`。
- 容错: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 finalizer skill 跳过；Epic 3 仍有 3-2 到 3-6 未完成，因此不修改 `epic-3` 主状态。
