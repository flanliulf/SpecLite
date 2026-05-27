# EXPERIMENTS

## 2026-05-27 12:42 - Preflight

- 方案：确认 Story 2.3 文件、`sprint-status.yaml` 状态和当前工作树，再启动 fresh dev sub-agent。
- 选择原因：Epic 2 需要严格串行推进；Story 2.3 必须在 Story 2.1 / 2.2 完成后继续，并且不能误处理当前大量既有改动。
- 结果：Story 2.3 为 `ready-for-dev`；Story 2.1 / 2.2 已为 `done`；当前工作树包含前序 Story 相关改动、文档同步改动、`node_modules/` 和 `assets/source/speclite/support-skills/` 未跟踪项。
- 结论：可以启动 `/bmad-dev-story story 2-3`，但必须要求 sub-agent 保留无关改动，不回滚、不清理。

## 2026-05-27 12:42 - Dev Story Activation

- 方案：按 `/bmad-dev-story story 2-3` workflow 启动 Story 2.3 开发，先读取 skill customization、config、Story、sprint status、project-context 和当前工作树状态。
- 选择原因：Story 2.3 需要严格串行推进，并且当前 worktree 已混有前序 Story 2.1/2.2、CR、文档同步、`node_modules/` 与 `assets/source/speclite/support-skills/` 未跟踪改动。
- 结果：`python3` resolver 因 stdlib `tomllib` 缺失失败；使用 `python3.12` 成功解析 workflow。Story 2.3 在 `sprint-status.yaml` 中从 `ready-for-dev` 更新为 `in-progress`。
- 结论：本轮只叠加 Story 2.3 范围内的 activation target、phase coverage、menu-target validation、evidence output 和测试改动；不回滚、不清理、不格式化无关文件。

## 2026-05-27 12:48 - Functional Anchor Preflight

- 方案：核对 Story 2.3 Task 1 要求的前置实现锚点，包括 package scaffold、`src/`、`test/`、manifest/index builder、runtime structure、IDE adapter registry、target writer、resolve output schema、fixture contract 和 fixture assets/tests。
- 选择原因：用户明确修订 functional anchor 标准，manifest/index 能力可以由集中 builder/helper 承载，不要求独立 `skill-index.ts` / `help-index.ts` / `files-index.ts` / `phase-coverage.ts` split files。
- 结果：关键锚点存在；manifest/index 能力集中在 `src/manifest/manifest-schema.ts` 与 `src/manifest/manifest-generator.ts`，目标写入在 `src/ide/target-writer.ts`，runtime 写入在 `src/installer/runtime-structure.ts`。
- 结论：前置 Story 2.1/2.2 代码锚点足以进入 Story 2.3 实现；不因缺少 split files 阻塞。

## 2026-05-27 12:50 - Red Tests

- 方案：先补 focused Vitest 失败用例，覆盖 installed `SKILL.md` activation target、phase coverage status vocabulary、menu-target diagnostics、phase coverage evidence renderer 和 installed skill activation protocol fixture。
- 选择原因：Story 2.3 要求红-绿-重构，并且 activation target 语义目前已有明确缺口。
- 执行命令：`npm test -- --run test/manifest-discovery.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/skill-artifact-loop.test.ts`
- 结果：测试按预期失败；缺少 `createInstalledSkillActivationTarget`、`renderPhaseCoverageEvidence`、`validateMenuTargets`，且现有 `activationTarget` 仍为目录或 menu code。
- 结论：红灯有效，下一步在集中式 schema/builder、target writer、ready-check 和 renderer 中实现最小 green path。

## 2026-05-27 12:54 - Validation And Story Closeout

- 方案：完成 green/refactor 后运行 focused tests、runtime fixture、build 和全量 Vitest，再更新 Story 与 sprint status 到 review。
- 执行命令：
  - `npm test -- --run test/manifest-discovery.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/skill-artifact-loop.test.ts`
  - `npm test -- --run test/runtime-structure.test.ts`
  - `npm run build`
  - `npm test`
- 结果：focused tests 4 files / 13 tests 通过；runtime structure 1 file / 8 tests 通过；build 通过；全量 tests 14 files / 78 tests 通过。
- 结论：Story 2.3 AC 与任务已满足，Story 和 `sprint-status.yaml` 可更新为 `review`。

## 2026-05-27 13:01 - CR Round 1 Reviewer

- 方案：按 `/bmenhance-cr-01-reviewer 2-3` 执行首轮只读代码审查，读取 Story 2.3、CR 配置、现有 CR 目录、Story File List 和相关 diff；由于当前工具环境没有 Agent 子代理工具，三层审查降级为当前模型串行执行。
- 选择原因：Epic 2 CR 流程要求严格串行，本步骤只允许 reviewer；用户明确要求 functional anchor 不因缺少独立 `skill-index.ts` / `help-index.ts` / `files-index.ts` / `phase-coverage.ts` split files 而报缺陷。
- 执行命令：
  - `npm test -- --run test/manifest-discovery.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/skill-artifact-loop.test.ts`
  - `npm test -- --run test/runtime-structure.test.ts`
  - `npm run build`
  - `npm test`
  - `npx tsx -e ... validateMenuTargets(...)` 定向复现 skillIndex 与 phaseCoverage 目标不一致场景。
  - `npx tsx -e ... runReadyCheck(...)` 定向复现 invalid help-index activationTarget 诊断场景。
- 结果：focused tests 4 files / 13 tests 通过；runtime structure 1 file / 8 tests 通过；build 通过；全量 tests 14 files / 78 tests 通过。定向复现发现 `validateMenuTargets` 对 skillIndex/phaseCoverage 不一致返回 `[]`，ReadyCheck 对 invalid help-index activationTarget 返回 `manifest-schema.unreadable`。
- 结论：首轮 CR 不通过；存在 2 个明确 patch 类阻塞项，结果已写入 `2-3-code-review-summary-20260527-round-1.md`。

## 2026-05-27 13:18 - CR Round 1 Evaluator

- 方案：按 `/bmenhance-cr-02-evaluator 2-3` 只评估 reviewer round 1 的 2 个 patch 阻塞项，不执行 fixer；读取 Story 2.3、CR 配置/模板、reviewer 输出、`menu-target` validation、ReadyCheck、manifest schema 和相关 tests。
- 选择原因：Epic 2 CR 流程要求 reviewer -> evaluator -> fixer 严格串行；用户明确要求 functional anchor 修订标准，即 manifest/index 能力可由集中 builder/helper 承载，不要求独立 split files。
- 执行验证：
  - 读取 `src/validation/rules/menu-target.ts`、`src/installer/ready-check.ts`、`src/manifest/manifest-schema.ts`、Story 2.3 AC 和 manifest/index owning SPEC。
  - 使用 `npx tsx -e ... validateMenuTargets(...)` 独立复现 `skillIndex.installedTargets=["agents"]` 但 help/phase 声明 `claude` mapped 时返回 `[]`。
  - 使用 `npx tsx -e ... runReadyCheck(...)` 独立复现 invalid `help-index.activationTarget="DS"` 返回 `manifest-schema.unreadable`，`affectedPath="_speclite/_config/help-index.json"`。
- 结果：2 个 reviewer 发现均属实，均非 split-file anchor 误报；严重性 [中] 合理，评估后列为 P1 阻塞修复项。
- 结论：CR round 1 评估不通过；已写入 `2-3-code-review-evaluation-20260527-round-1.md`，下一步应执行 fixer 处理 2 个 P1 项。

## 2026-05-27 13:12 - CR Round 1 Fixer

- 方案：按 `/bmenhance-cr-03-fixer 2-3` 只处理 evaluation round 1 确认的 2 个 P1 项，不执行 reviewer/evaluator/finalizer。
- 修复项：
  - 在 `validateMenuTargets` 中建立 `canonicalSkillId -> installedTargets` 映射，校验 help `targetIds`、help `activationTarget` 指向的 target，以及 phase mapped `targetId` 是否均存在于对应 `skill-index.installedTargets`。
  - 在 ReadyCheck index schema 失败路径中，仅将 `help-index.json` / `phase-coverage.json` 的 `activationTarget`、`entryPath`、`targetId`、`targetIds`、`status` 等 Story 2.3 menu-target 语义错误映射为 reserved `menu-target.*` issue id；缺失文件、JSON 不可读和非 target schema 错误仍保留 `manifest-schema.unreadable`。
- 执行命令：
  - `npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`
  - `npm run build`
  - `git diff --check -- src/validation/rules/menu-target.ts src/installer/ready-check.ts test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`
- 结果：针对性 Vitest 2 files / 11 tests 通过；build 通过；diff whitespace 检查通过。
- 结论：2 个 P1 阻塞项已完成定点修复，并补充 focused regression tests。

## 2026-05-27 13:18 - CR Round 2 Reviewer

- 方案：按 `/bmenhance-cr-01-reviewer 2-3` 执行 Story 2.3 round 2 复审；只执行 reviewer，不执行 evaluator / fixer。读取 round 1 summary、evaluation 修复记录、Story 2.3 AC、`menu-target` validation、ReadyCheck 和相关 tests。
- 选择原因：round 1 的两个 P1 已由 fixer 记录为修复完成，本轮需要确认修复有效，并检查是否存在残留或新阻塞项；继续遵守 functional anchor 修订标准，不要求独立 manifest/index split files。
- 执行命令：
  - `npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`
  - `npm run build`
  - `npm test`
  - `npx tsx -e ... validateMenuTargets(...)` 定向复现 cross-skill activation target 错配。
  - `npx tsx -e ... runReadyCheck(...)` 定向复现 ReadyCheck 接受 cross-skill activation target 错配。
- 结果：focused tests 2 files / 11 tests 通过；build 通过；全量 tests 14 files / 80 tests 通过。Round 1 两个 P1 修复点已生效。新发现：`canonicalSkillId="speclite-dev-story"` 时，help/phase coverage 可同时把 `activationTarget` 指向 `.claude/skills/other-skill/SKILL.md`，`validateMenuTargets(...)` 返回 `[]`，ReadyCheck 在临时项目中返回 `ok: true`。
- 结论：CR round 2 不通过；存在 1 个新的 patch 类阻塞项，结果已写入 `2-3-code-review-summary-20260527-round-2.md`。

## 2026-05-27 13:27 - CR Round 2 Evaluator

- 方案：按 `/bmenhance-cr-02-evaluator 2-3` 只评估 reviewer round 2 的 1 个新发现，不执行 fixer；读取 CR 配置/模板、round 2 reviewer 输出、round 1 evaluation、Story 2.3 AC、`menu-target` validation、ReadyCheck、manifest schema 和相关 tests。
- 选择原因：用户明确要求本步骤是 Story 2.3 evaluator round 2，且 functional anchor 标准已修订，不得把缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 作为缺陷。
- 执行验证：
  - 读取 `src/manifest/manifest-schema.ts`、`src/validation/rules/menu-target.ts`、`src/installer/ready-check.ts`、`test/menu-target-validation.test.ts`、`test/install-progress-ready-summary.test.ts` 与 Story 2.3 AC。
  - 使用 `npx tsx --eval ... validateMenuTargets(...)` 独立复现 `canonicalSkillId="speclite-dev-story"` 但 help/phase `activationTarget=".claude/skills/other-skill/SKILL.md"` 时返回 `[]`。
  - 使用 `npx tsx --eval ... runReadyCheck(...)` 在临时项目中独立复现同一错配场景返回 `ok: true`。
- 结果：reviewer round 2 的 cross-skill `activationTarget` 发现确认属实；严重性 [中] 合理，评估后列为 P1 阻塞修复项。
- 结论：CR round 2 评估不通过；已写入 `2-3-code-review-evaluation-20260527-round-2.md`，下一步应由 fixer 定点修复 1 个 P1 项。

## 2026-05-27 13:28 - CR Round 2 Fixer

- 方案：按 `/bmenhance-cr-03-fixer 2-3` 只处理 round 2 evaluation 确认的 1 个 P1：cross-skill activation target 错指。
- 修复项：
  - 在 `validateMenuTargets` 中解析 installed `entryPath` / `activationTarget` 的 target family 与 skill directory basename。
  - help `activationTarget` 必须指向当前 `canonicalSkillId` 对应的 installed `SKILL.md`。
  - phase coverage mapped target 的 `entryPath` 与 `activationTarget` 必须同时指向当前 `canonicalSkillId` 对应的 installed entry。
- 执行命令：
  - `npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`
  - `npm run build`
  - `git diff --check -- src/validation/rules/menu-target.ts test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`
  - `npm test`
- 结果：targeted Vitest 2 files / 13 tests 通过；build 通过；diff whitespace 检查通过；全量 Vitest 14 files / 82 tests 通过。
- 结论：round 2 P1 已定点修复，并补充 validator 与 ReadyCheck regression；未执行 reviewer/evaluator/finalizer。

## 2026-05-27 13:36 - CR Round 3 Reviewer

- 方案：按 `/bmenhance-cr-01-reviewer 2-3` 执行 Story 2.3 round 3 复审；只执行 reviewer，不执行 evaluator / fixer。
- 选择原因：round 2 fixer 已记录 cross-skill activation target 错指修复，本轮需要确认历史 3 个 P1 均持续有效，并检查是否存在新的 Story 2.3 AC 1 / AC 2 / AC 4 / AC 8 阻塞项。
- 执行命令：
  - `npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`
  - `npm run build`
  - `npm test`
- 结果：focused Vitest 2 files / 13 tests 通过；build 通过；全量 Vitest 14 files / 82 tests 通过。`package.json` 未定义 `lint` script，因此本轮 lint 标记为不适用。
- 结论：CR round 3 reviewer 通过；未发现新的阻塞项或中高优先级问题，结果已写入 `2-3-code-review-summary-20260527-round-3.md`。

## 2026-05-27 13:40 - CR Round 3 Evaluator

- 方案：按 `/bmenhance-cr-02-evaluator 2-3` 只评估 reviewer round 3 的通过结论，不执行 fixer / finalizer。
- 选择原因：用户明确要求本步骤是 Story 2.3 evaluator round 3，并要求确认 reviewer 通过结论是否成立、是否满足停止 CR 循环条件；同时遵守修订后的 functional anchor 标准，不把缺少独立 manifest/index split files 作为缺陷。
- 执行验证：
  - 读取 `2-3-code-review-summary-20260527-round-3.md`、round 1/2 evaluation、CR 配置/模板。
  - 复核 `src/validation/rules/menu-target.ts`、`src/installer/ready-check.ts`、`test/menu-target-validation.test.ts`、`test/install-progress-ready-summary.test.ts` 中历史 3 个 P1 的实现与 regression 覆盖。
  - 执行 `npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`。
  - 执行 `npm run build`。
  - 执行 `npm test`。
- 结果：focused Vitest 2 files / 13 tests 通过；build 通过；全量 Vitest 14 files / 82 tests 通过。Round 1 的 2 个 P1 与 Round 2 的 1 个 P1 均确认已修复，本轮未发现新的阻塞项或中高优先级问题。
- 结论：CR round 3 evaluator 通过；reviewer 通过结论成立，Story 2.3 满足停止 CR 循环条件。结果已写入 `2-3-code-review-evaluation-20260527-round-3.md`；本步骤未执行 fixer / finalizer。

## 2026-05-27 13:43 - CR Rules Extractor / TODO Tracker / Finalizer

- 方案：按用户要求使用同一个 fresh sub-agent 继续严格串行执行 `bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`，不启动新的 reviewer / evaluator / fixer。
- 04 规则提炼：
  - 读取 Story 2.3 三轮 CR summary / evaluation，确认历史 findings 为 Round 1 两个 P1 与 Round 2 一个 P1，Round 3 reviewer/evaluator 均通过。
  - 提炼 3 条 record-only 规则：`CR-API-10` help/phase mapped target 必须反查 `skill-index.installedTargets`；`CR-API-11` ReadyCheck target 语义错误必须保留 reserved `menu-target.*` 诊断；`CR-API-12` installed activation path basename 必须绑定对应 `canonicalSkillId`。
  - 按默认推荐决策仅更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`；不修改全局 SPEC / architecture / context 文档。
- 05 TODO Tracker：
  - 三轮 evaluation 均明确 CR TODO 0；未识别未解决的非阻塞延迟项。
  - 结论：不创建 `cr-todo-backlog.md`，避免写入空 backlog。
- 06 Finalizer：
  - 验证最新评估文件 `2-3-code-review-evaluation-20260527-round-3.md` 明确 Story 2.3 满足停止 CR 循环条件。
  - 将 Story 文件 `Status` 从 `review` 更新为 `done`。
  - 将 `sprint-status.yaml` 中 `2-3-skill-activation-and-phase-capability-coverage` 从 `review` 更新为 `done`，并更新 `last_updated` 为 `2026-05-27 13:43 CST`。
  - `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 06 finalizer 容错规则跳过。
  - Epic 2 尚有 `2-4`、`2-5` 为 `ready-for-dev`，因此不触发 Epic 状态更新。
- 结论：Story 2.3 post-CR 收尾完成；未执行新的 reviewer / evaluator / fixer，未修改源码或全局文档。
