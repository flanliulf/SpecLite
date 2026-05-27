# EXPERIMENT_NOTES

## 2026-05-27 12:42

- 当前执行 Story：`2-3-skill-activation-and-phase-capability-coverage`。
- 下一步：启动 fresh sub-agent，使用 `gpt-5.5` 执行 `/bmad-dev-story story 2-3`。
- 决策：沿用 functional anchor 标准；不要因缺少独立 manifest/index split files 而停止。
- 注意：当前工作树包含用户安装依赖产生的 `node_modules/`，以及未跟踪 `assets/source/speclite/support-skills/`；本流程不清理这些内容。

## 2026-05-27 12:42

- 已启动 `/bmad-dev-story story 2-3`。
- `python3` resolver 失败原因是本机旧版 Python 缺少 `tomllib`；`python3.12` resolver 成功，workflow 无 prepend/append，persistent fact 为 `_bmad-output/project-context.md`。
- 已将 `sprint-status.yaml` 中 `2-3-skill-activation-and-phase-capability-coverage` 标记为 `in-progress`。
- 本轮实现边界：只处理 Story 2.3 activation target、phase coverage、menu-target diagnostics、evidence output、fixture/tests 和 Story/过程记录。

## 2026-05-27 12:48

- Functional anchor preflight 通过：集中式 `src/manifest/manifest-schema.ts` / `src/manifest/manifest-generator.ts` 符合修订标准。
- 不要求存在独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 文件。
- 当前发现 `createMappedTargetProjection` 的 `activationTarget` 仍指向 skill directory，Story 2.3 需要收口到 installed `SKILL.md`。
- 当前 help index 的 `activationTarget` 使用 menu code 或 canonical id，Story 2.3 需要改为 installed entry target 语义或通过集中 resolver 唯一解析。

## 2026-05-27 12:50

- 红灯测试命令：`npm test -- --run test/manifest-discovery.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/skill-artifact-loop.test.ts`。
- 失败点符合预期：helper/validator/renderer 尚未实现，target writer 仍输出目录型 `activationTarget`。
- 后续实现要避免创建第二套 manifest/index split files，直接扩展现有 `manifest-schema.ts`、`manifest-generator.ts`、`target-writer.ts`、`ready-check.ts`、`diagnostics/output.ts`。

## 2026-05-27 12:54

- 已实现 `SKILL.md` activation target helper/schema、menu-target validation、ReadyCheck 接入、phase coverage evidence renderer 和 Story 2.3 tests/fixture assertions。
- 验证通过：focused tests、`test/runtime-structure.test.ts`、`npm run build`、全量 `npm test`。
- 已删除本轮 `npm run build` 生成的未跟踪 `dist/`；保留既有 `node_modules/`、`assets/source/speclite/support-skills/` 和前序 Story/CR 改动。
- 已将 Story 2.3 与 `sprint-status.yaml` 更新为 `review`。

## 2026-05-27 13:01

- 已执行 `/bmenhance-cr-01-reviewer 2-3` round 1；本步骤只做 reviewer，没有执行 evaluator 或 fixer。
- 当前环境没有 Agent 子代理工具，三层审查按 skill 降级规则由当前模型串行完成。
- 结论：CR 不通过。
- 关键发现：
  - `validateMenuTargets` 没有把 mapped phase/help target 与 `skill-index.installedTargets` 交叉校验，导致未安装 target 可被 phase coverage 伪装为 mapped。
  - ReadyCheck 对 invalid activation target 先返回 `manifest-schema.unreadable`，绕过 Story 2.3 要求的 `menu-target.missing-target` reserved diagnostic。
- 验证状态：focused tests、runtime structure tests、build、全量 `npm test` 均通过；两个问题由定向复现和代码证据确认。

## 2026-05-27 13:18

- 已执行 `/bmenhance-cr-02-evaluator 2-3` round 1；本步骤只做 evaluator，没有执行 fixer。
- 评估对象：`2-3-code-review-summary-20260527-round-1.md`。
- 评估结论：reviewer 的 2 个 patch 阻塞项均确认有效。
- 关键证据：
  - `validateMenuTargets` 当前只按 `canonicalSkillId + activationTarget` 匹配 mapped target，没有把 mapped target 的 `targetId` 与 `skill-index.installedTargets` 交叉校验。
  - ReadyCheck 对 index 先做严格 schema parse；invalid `help-index.activationTarget` 会在进入 `validateMenuTargets` 前返回 `manifest-schema.unreadable`。
- Functional anchor 判断：本轮未把缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 作为缺陷；两个问题都存在于当前集中式 helper/schema/ReadyCheck 语义中。
- 输出文件：`2-3-code-review-evaluation-20260527-round-1.md`。
- 下一步：需要 fixer 修复 2 个 P1 阻塞项。

## 2026-05-27 13:12

- 已执行 `/bmenhance-cr-03-fixer 2-3` round 1；本步骤只做 fixer，没有执行 reviewer/evaluator/finalizer。
- 修复 #1：`validateMenuTargets` 现在会把 help/phase mapped target 与 `skill-index.installedTargets` 交叉校验，未安装 target 返回 reserved `menu-target.missing-target`。
- 修复 #2：ReadyCheck 对可读 index 的 target 语义 schema 失败会返回 reserved `menu-target.missing-target` 或 `menu-target.no-mapped-target`，不再把 invalid help activation target 提前归类为 `manifest-schema.unreadable`。
- 回归测试：新增 `skillIndex.installedTargets=["agents"]` 但 help/phase 声明 `claude` mapped 的 validation 用例；新增 ReadyCheck invalid `help-index.activationTarget="DS"` 分类用例。
- 验证通过：`npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`、`npm run build`、`git diff --check -- ...`、`npm test`。

## 2026-05-27 13:18

- 已执行 `/bmenhance-cr-01-reviewer 2-3` round 2；本步骤只做 reviewer，没有执行 evaluator 或 fixer。
- Agent 子代理工具不可用，按 skill 降级规则由当前模型串行完成三层审查。
- Round 1 两个 P1 修复点复核通过：`skill-index.installedTargets` 交叉校验已存在，ReadyCheck invalid activation target 已映射到 reserved `menu-target.*`。
- 新阻塞发现：`validateMenuTargets` 与 ReadyCheck 仍允许 `canonicalSkillId` 与 `activationTarget` 中的 installed skill directory basename 不一致，例如 `speclite-dev-story` 错指 `.claude/skills/other-skill/SKILL.md`。
- 验证通过：focused tests 2 files / 11 tests、`npm run build`、全量 `npm test` 14 files / 80 tests。
- 结论：CR round 2 不通过；输出文件为 `2-3-code-review-summary-20260527-round-2.md`。

## 2026-05-27 13:27

- 已执行 `/bmenhance-cr-02-evaluator 2-3` round 2；本步骤只做 evaluator，没有执行 fixer。
- 评估对象：`2-3-code-review-summary-20260527-round-2.md`。
- 评估结论：reviewer 的新发现确认有效，属于 P1 阻塞项。
- 关键证据：
  - `isInstalledSkillActivationTarget` 只验证 `.claude/skills/<任意目录>/SKILL.md` 或 `.agents/skills/<任意目录>/SKILL.md` 的 path shape，没有绑定 basename 与 `canonicalSkillId`。
  - `validateMenuTargets` 当前只校验 target family 是否安装，并要求 help 与 phase coverage 的 `canonicalSkillId + activationTarget` 相互匹配；help/phase 同时错指 `other-skill` 时会返回 `[]`。
  - ReadyCheck 后续 mirror existence check 使用 `skill-index.canonicalSkillId` 检查 `.claude/skills/speclite-dev-story/SKILL.md` 存在，但不会验证 help/phase 的 `activationTarget` 是否指向同一 canonical skill。
- 独立复现：`validateMenuTargets(...)` 返回 `[]`；临时项目中的 `runReadyCheck(...)` 返回 `ok: true`。
- Functional anchor 判断：本轮未把缺少独立 split files 作为缺陷；问题存在于集中式 helper/schema/ReadyCheck 语义中。
- 输出文件：`2-3-code-review-evaluation-20260527-round-2.md`。
- 下一步：需要 fixer 修复 1 个 P1 阻塞项，绑定 installed path basename 与 `canonicalSkillId`，并补充 validator / ReadyCheck regression。

## 2026-05-27 13:28

- 已执行 `/bmenhance-cr-03-fixer 2-3` round 2；本步骤只做 fixer，没有执行 reviewer/evaluator/finalizer。
- 修复：`validateMenuTargets` 现在会解析 help `activationTarget`、phase mapped `entryPath` 与 `activationTarget`，并要求其中的 installed skill directory basename 等于对应 `canonicalSkillId`。
- 诊断：cross-skill basename mismatch 会返回 reserved `menu-target.missing-target`，details 中记录 `activationSkillDirectory` / `entrySkillDirectory` 与 `reason="skill-id-mismatch"`。
- 回归测试：新增 validator 用例覆盖 help/phase 同时错指 `.claude/skills/other-skill/SKILL.md`；新增 ReadyCheck 用例覆盖临时项目中真实存在 `speclite-dev-story` 与 `other-skill` mirror 时仍必须失败。
- 验证通过：`npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`、`npm run build`、`git diff --check -- ...`。

## 2026-05-27 13:36

- 已执行 `/bmenhance-cr-01-reviewer 2-3` round 3；本步骤只做 reviewer，没有执行 evaluator 或 fixer。
- Agent 子代理工具不可用，按 skill 降级规则由当前模型串行完成三层审查。
- Round 1 两个 P1 修复点复核通过：`skill-index.installedTargets` 交叉校验持续有效，ReadyCheck invalid activation target 仍映射到 reserved `menu-target.*`。
- Round 2 一个 P1 修复点复核通过：help `activationTarget`、phase mapped `entryPath` 与 `activationTarget` 的 installed skill directory basename 已绑定到对应 `canonicalSkillId`。
- 验证通过：focused Vitest 2 files / 13 tests、`npm run build`、全量 `npm test` 14 files / 82 tests。
- 结论：CR round 3 reviewer 通过；输出文件为 `2-3-code-review-summary-20260527-round-3.md`。

## 2026-05-27 13:40

- 已执行 `/bmenhance-cr-02-evaluator 2-3` round 3；本步骤只做 evaluator，没有执行 fixer/finalizer。
- 评估对象：`2-3-code-review-summary-20260527-round-3.md`。
- 评估结论：reviewer round 3 的通过结论成立。
- 关键证据：
  - `validateMenuTargets` 已校验 help/phase mapped target 与 `skill-index.installedTargets` 的一致性。
  - ReadyCheck 已消费 blocking `menu-target.*` issue，并保留 target 语义 schema failure 到 reserved issue id 的映射。
  - help `activationTarget`、phase mapped `entryPath` 与 `activationTarget` 已解析 installed target family / skill directory basename，并绑定到对应 `canonicalSkillId`。
  - validator 与 ReadyCheck regression 覆盖了 Round 1 的 2 个 P1 和 Round 2 的 1 个 P1。
- Functional anchor 判断：继续遵守修订标准；集中 builder/helper 承载 manifest/index 能力可接受，缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 不构成缺陷。
- 验证通过：`npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`、`npm run build`、`npm test`。
- 输出文件：`2-3-code-review-evaluation-20260527-round-3.md`。
- 下一步：CR 循环停止条件已满足，可进入后续 rules/todo/finalizer；本步骤未执行这些后续动作。

## 2026-05-27 13:43

- 已按顺序执行 post-CR 收尾：04 rules extractor -> 05 TODO tracker -> 06 finalizer。
- 04 结果：新增 `CR-API-10`、`CR-API-11`、`CR-API-12` 到 `cr-rules-summary.md`；本次只做 record-only，不改全局文档。
- 05 结果：Story 2.3 三轮 evaluation 均为 CR TODO 0；无 backlog 条目需要新增或解决，因此未创建 `cr-todo-backlog.md`。
- 06 结果：最新 round 3 evaluation 已确认通过并满足停止条件；Story 2.3 状态与 `sprint-status.yaml` 已同步为 `done`。
- 跳过项：`bmm-workflow-status.yaml` 不存在，按 finalizer 容错规则跳过；Epic 2 尚未全部 done，不更新 Epic 状态。
- 本步骤未执行新的 reviewer/evaluator/fixer，未触碰源码或无关改动。
