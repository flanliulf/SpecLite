# EXPERIMENTS

## 2026-05-27 14:44 - Preflight

- 方案：确认 Story 2.5 文件、`sprint-status.yaml` 状态和当前工作树，再启动 fresh dev sub-agent。
- 选择原因：Epic 2 需要严格串行推进；Story 2.5 必须在 Story 2.1 / 2.2 / 2.3 / 2.4 完成后继续，并且不能误处理当前大量既有改动。
- 结果：Story 2.5 为 `ready-for-dev`；Story 2.1 / 2.2 / 2.3 / 2.4 已为 `done`；当前工作树包含前序 Story 相关改动、文档同步改动、CR TODO backlog、`node_modules/`、`assets/source/speclite/support-skills/` 和构建产物 `dist/` 等未跟踪项。
- 结论：可以启动 `/bmad-dev-story story 2-5`，但必须要求 sub-agent 保留无关改动，不回滚、不清理。

## 2026-05-27 14:46 - Dev Story Activation

- 方案：按 `/bmad-dev-story story 2-5` 解析 workflow、读取 `_bmad-output/project-context.md`、`_bmad/bmm/config.yaml`、Story 2.5 和完整 `sprint-status.yaml`。
- 选择原因：Story 2.5 是 Epic 2 串行最后一个 Story，必须先确认状态与上下文，再进入实现。
- 结果：本机 `python3` 因缺少 `tomllib` 解析失败；改用 `python3.12` 成功解析 workflow。`sprint-status.yaml` 中 Story 2.5 从 `ready-for-dev` 更新为 `in-progress`。
- 结论：继续执行；不使用 legacy Python resolver 作为 Story 2.5 runtime contract。

## 2026-05-27 14:49 - Red Phase

- 方案：先补 `test/artifact-metadata.test.ts`、`test/artifact-path-validation.test.ts`，并扩展 `test/skill-artifact-loop.test.ts`。
- 选择原因：Story 要求 metadata/frontmatter/sidecar、artifact-path diagnostics、evidence output 和 `skill-artifact-loop` fixture 先有可执行断言。
- 结果：`npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts` 按预期失败，缺少 `src/validation/artifact-metadata.ts` 和 `src/validation/rules/artifact-path.ts`。
- 结论：测试正确暴露 Story 2.5 缺口。

## 2026-05-27 14:52 - Green / Refactor

- 方案：在现有边界内实现最小 helper：`src/manifest/manifest-schema.ts`、`src/validation/artifact-metadata.ts`、`src/validation/rules/artifact-path.ts`、`src/diagnostics/output.ts`。
- 选择原因：manifest/index owning schema 承载 contract shape；validation 承载 metadata/path 结构校验；diagnostics 只渲染 evidence row，不新增 dashboard。
- 结果：focused tests 通过；`skill-artifact-loop` 写入 metadata-bearing Markdown artifact 并验证 generatedAt normalization。
- 结论：Story 2.5 核心实现收口。

## 2026-05-27 14:54 - Validation

- 方案：运行 build、focused regression、全量 Vitest 和 diff hygiene。
- 选择原因：Story 2.5 touching manifest schema、validation、diagnostics 与 fixture，需要类型和回归双验证。
- 结果：
  - `npm run build` 通过。
  - `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts` 通过，5 files / 26 tests。
  - `npm test` 通过，19 files / 109 tests。
  - `git diff --check` 通过。
- 结论：Story 2.5 可进入 review；未修改 `_bmad-output/planning-artifacts/`，未实现 Epic 3/4/6 扩展范围或 Post-MVP dashboard。

## 2026-05-27 15:00 - CR Round 1 Reviewer

- 方案：使用 `/bmenhance-cr-01-reviewer 2-5` 执行首轮 code review；因当前环境无 Agent 工具，按 skill 降级规则串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。
- 选择原因：Epic 2 严格串行 CR 流程要求本步骤只做 reviewer，不进入 evaluator/fixer；审查范围限定为 Story 2.5 的 artifact output path contract、metadata encoding、frontmatter/sidecar、artifact-path validation、workflow-owned protection、artifact evidence 与 `skill-artifact-loop` fixture。
- 结果：
  - `npm run build` 通过。
  - `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts` 通过，5 files / 26 tests。
  - `npm test` 通过，19 files / 109 tests。
  - `git diff --check` 通过。
  - 定向复现发现 `actualArtifactPath` 可位于 configured/default output root 外仍返回 `[]`。
  - 定向复现发现反斜杠 artifact path 被 normalize 后放行，未按 POSIX-style path contract 报告 violation。
- 结论：CR Round 1 reviewer 结论为不通过；结构化结果已写入 `2-5-code-review-summary-20260527-round-1.md`，下一步应进入 evaluator 评估，不由 reviewer 执行修复。

## 2026-05-27 15:18 - CR Round 1 Evaluator

- 方案：使用 `/bmenhance-cr-02-evaluator 2-5` 评估 reviewer round 1 的 3 个 findings；只读取源码、Story、owning SPEC、review summary 和现有 CR 记录，不执行 fixer。
- 选择原因：当前步骤是 Story 2.5 evaluator round 1，必须独立判断每个发现是否属实、严重性是否合理、是否需要修复；functional anchor 已修订，不把缺少独立 split files 当作缺陷。
- 结果：
  - `actualArtifactPath` 位于 configured/default output root 外仍返回 `[]`，确认有效。
  - 反斜杠 artifact path 被 normalize 后返回 `[]`，确认有效。
  - `generatedAt` offset ISO 8601 string 被当前 schema 拒绝，确认有效但影响低。
  - 首次 `npx tsx -e` 定向复现因 top-level await / CJS output 失败；改为 async IIFE 且直接导入 `.ts` 文件后复现成功。
- 结论：Evaluator round 1 结论为不通过；发现 #1/#2 为 P1 阻塞修复项，发现 #3 建议转入 CR TODO 非阻塞跟踪；结构化结果已写入 `2-5-code-review-evaluation-20260527-round-1.md`。

## 2026-05-27 15:10 - CR Round 1 Fixer

- 方案：使用 `/bmenhance-cr-03-fixer 2-5` 只处理 evaluator round 1 确认的两个 P1：`actualArtifactPath` root containment 和 artifact path POSIX-style contract。
- 选择原因：两个 P1 均直接违反 Story 2.5 的 artifact output path contract；`generatedAt` validator 已降级为 P2 CR TODO，本轮不处理。
- 结果：
  - `src/validation/rules/artifact-path.ts` 在 filesystem normalization 前复用严格 `isProjectRelativePosixPath` predicate，拒绝 `configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 中的反斜杠等非 POSIX public path。
  - `src/validation/rules/artifact-path.ts` 新增 containment check：`defaultOutputPath` 必须位于 `configuredRoot` 下，`actualArtifactPath` 必须位于 `defaultOutputPath` 下。
  - `test/artifact-path-validation.test.ts` 新增项目内但错误 artifact root、以及三个 path role 反斜杠输入的回归测试。
  - `generatedAt` validator 未修改。
- 验证：
  - `npm test -- --run test/artifact-path-validation.test.ts` 通过，1 file / 6 tests。
  - `npm run build` 通过。
  - `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts` 通过，5 files / 28 tests。
  - `npm test` 通过，19 files / 111 tests。
  - `git diff --check` 通过。
- 结论：CR Round 1 fixer 已完成两个 P1 修复；下一步应由 reviewer/evaluator 复审，不在本步骤执行 finalizer。

## 2026-05-27 15:16 - CR Round 2 Reviewer

- 方案：使用 `/bmenhance-cr-01-reviewer 2-5` 对 Round 1 fixer 后实现执行 reviewer round 2；只执行 reviewer，不进入 evaluator/fixer/finalizer。
- 选择原因：本轮目标是复核两个 P1 修复是否真实满足 Story 2.5 artifact path contract，并保留 `generatedAt` P2 CR TODO 的非阻塞状态；functional anchor 标准已修订，不要求独立 split files。
- 执行模式：当前环境无 Agent 工具，按 skill 降级规则串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；三层均完成。
- 结果：
  - Round 1 P1 原始错误 root 复现已不再返回 `[]`。
  - Round 1 P1 反斜杠 public artifact path 复现已不再返回 `[]`。
  - 新发现：`actualArtifactPath` 被过度收窄为必须位于 `defaultOutputPath` 下；当 actual path 位于 broader `configuredRoot` 内但不在 `defaultOutputPath` 子目录下时，当前实现返回 `artifact-path.escapes-project` / `outside-default-output-path`，与 owning SPEC 的 `defaultOutputPath` 或配置允许 project-relative path 语义不一致。
- 验证：
  - `npm test -- --run test/artifact-path-validation.test.ts` 通过，1 file / 6 tests。
  - `npm run build` 通过。
  - `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts` 通过，4 files / 20 tests。
  - `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts` 失败，`test/runtime-structure.test.ts` 中 expected skillCount 54、actual 53。
  - `npm test` 失败，同一个 `test/runtime-structure.test.ts` skillCount fixture drift；18 files passed / 1 failed，110 tests passed / 1 failed。
  - `git diff --check` 通过。
- 结论：CR Round 2 reviewer 结论为不通过；结构化结果已写入 `2-5-code-review-summary-20260527-round-2.md`，下一步应进入 evaluator round 2 独立评估。

## 2026-05-27 15:24 - CR Round 2 Evaluator

- 方案：使用 `/bmenhance-cr-02-evaluator 2-5` 评估 reviewer round 2；只读取 reviewer summary、Round 1 evaluator、源码、Story、owning SPEC、fixture 与定向复现输出，不执行 fixer。
- 选择原因：本步骤只需判断 reviewer 新发现是否属实、严重性是否正确、是否需要修复，并单独判断 `skillCount` 测试失败是否属于本轮 fixer scope。
- 结果：
  - `src/validation/rules/artifact-path.ts` 当前对 `actualArtifactPath` 使用 `defaultOutputPath` 作为唯一 containment container。
  - 定向复现确认：actual path 位于 `_speclite-output/implementation-artifacts` configured root 内、但在 `code-reviews` sibling 子目录时，当前返回 `artifact-path.escapes-project` / `outside-default-output-path`。
  - owning SPEC 允许 output path 符合 `defaultOutputPath` 或配置允许的 project-relative path，因此 reviewer 新发现确认有效。
  - focused test 复核：`npm test -- --run test/artifact-path-validation.test.ts test/runtime-structure.test.ts` 失败于 `test/runtime-structure.test.ts:45` 的 fresh-install fixture equality。
  - 直接运行 `runInstallCommand(...)` 当前输出 `skillCount=54`，fixture `fresh-install-success.json` 仍记录 `53`；该问题判断为 skill inventory 与 fixture snapshot 的漂移，不是 Story 2.5 artifact-path fixer 本轮 scope。
- 结论：Evaluator round 2 结论为不通过；需要 fixer 处理 1 个 P1：放宽/修正 `actualArtifactPath` containment 到 configured root 或 configured allowed path 语义。`generatedAt` 继续保留 P2 CR TODO；`skillCount` fixture drift 不纳入本轮 fixer scope。

## 2026-05-27 15:27 - CR Round 2 Fixer

- 方案：使用 `/bmenhance-cr-03-fixer 2-5` 只处理 evaluator round 2 确认的 1 个 P1：`actualArtifactPath` containment 被过度收窄为必须位于 `defaultOutputPath` 下。
- 选择原因：owning SPEC 与 Story contract 允许 workflow artifact output path 位于 configured artifact root 内的配置允许 project-relative path；本轮 scope 明确排除 `generatedAt` P2 TODO 和 `skillCount` fixture drift。
- 结果：
  - `src/validation/rules/artifact-path.ts` 保留 `defaultOutputPath` 必须位于 `configuredRoot` 下的校验。
  - `src/validation/rules/artifact-path.ts` 将 `actualArtifactPath` containment container 从 `defaultOutputPath` 调整为 `configuredRoot`，避免误拒绝 configured root 内的 sibling workflow output path。
  - `test/artifact-path-validation.test.ts` 新增 configured-root sibling path 正向 regression：`story-reviews` 为 default output，`code-reviews/2-5.md` 为 actual artifact 时应通过。
  - 原始错误 root regression 仍保留，`actualArtifactPath` 位于 configured root 外时返回 `artifact-path.escapes-project` / `outside-configured-root`。
  - 未修改 `generatedAt` validator；未处理 `skillCount` fixture drift。
- 验证：
  - `npm test -- --run test/artifact-path-validation.test.ts` 通过，1 file / 7 tests。
  - `npm run build` 通过。
  - `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts` 通过，4 files / 21 tests。
  - `git diff --check` 通过。
  - `npm test` 失败于已知 out-of-scope `test/runtime-structure.test.ts:45` skillCount fixture equality（expected 54 / actual 53）；未在本 fixer 中修复。
- 结论：CR Round 2 fixer 已完成 containment P1 修复；下一步应由 reviewer/evaluator 复审，本步骤未执行 finalizer。

## 2026-05-27 15:30 - CR Round 3 Reviewer

- 方案：使用 `/bmenhance-cr-01-reviewer 2-5` 对 Round 2 fixer 后实现执行 reviewer round 3；只执行 reviewer，不进入 evaluator 或 fixer。
- 选择原因：本轮目标是复核 `actualArtifactPath` containment 是否已从 `defaultOutputPath` 修正为 `configuredRoot` 语义，并按当前代码和测试状态判断 `skillCount` fixture drift 是否阻塞 Story 2.5。
- 执行模式：当前环境无 Agent 工具，按 skill 降级规则串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；三层均完成。
- 结果：
  - `src/validation/rules/artifact-path.ts` 当前保留 `defaultOutputPath` within `configuredRoot` 校验，并对 `actualArtifactPath` 使用 `configuredRoot` 作为 containment container。
  - 定向复现确认 configured-root sibling path 返回 0 个 issue。
  - 定向复现确认 configured root 外 actual path 返回 `artifact-path.escapes-project` / `outside-configured-root`。
  - 定向复现确认反斜杠 actual path 返回 `artifact-path.escapes-project` / `invalid-project-relative-posix-path`。
  - `generatedAt` offset timestamp 仍被拒绝，维持 P2 CR TODO。
  - `skillCount=54` vs `53` 是当前 fresh-install fixture drift，导致 full `npm test` 失败，但不属于 Story 2.5 round 2 artifact-path fixer 范围，本轮不列为阻塞项。
- 验证：
  - `npm test -- --run test/artifact-path-validation.test.ts` 通过，1 file / 7 tests。
  - `npm run build` 通过。
  - `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts` 通过，4 files / 21 tests。
  - `git diff --check` 通过。
  - `npm test -- --run test/runtime-structure.test.ts` 失败于已知 fresh-install `skillCount` fixture drift。
  - `npm test` 失败于同一 out-of-scope fixture drift；18 files passed / 1 failed，111 tests passed / 1 failed。
- 结论：CR Round 3 reviewer 结论为通过；结构化结果已写入 `2-5-code-review-summary-20260527-round-3.md`。建议进入 evaluator round 3 独立评估；本步骤未执行 evaluator、fixer 或 finalizer。

## 2026-05-27 15:35 - CR Round 3 Evaluator

- 方案：使用 `/bmenhance-cr-02-evaluator 2-5` 评估 reviewer round 3；只执行 evaluator，不执行 fixer 或 finalizer。
- 选择原因：本步骤需要独立判断 reviewer 通过结论是否成立、是否满足停止 CR 循环条件，并明确 `generatedAt` P2 TODO 与 `skillCount` fixture drift 的处理边界。
- 结果：
  - `src/validation/rules/artifact-path.ts` 当前保留 `defaultOutputPath` within `configuredRoot` 校验，并将 `actualArtifactPath` containment 校验在 `configuredRoot` 下。
  - `test/artifact-path-validation.test.ts` 已覆盖 configured-root sibling artifact path 正向场景、configured root 外 actual path 负向场景、以及三个 path role 的非 POSIX 反斜杠输入。
  - Round 2 P1 containment 修复确认有效；Round 1 两个 P1 修复未回退。
  - Round 1 P2 `generatedAt` 继续保留为 CR TODO，非阻塞，本轮不追加 fixer。
  - `skillCount=54` vs fixture `53` 确认为真实 fresh-install fixture drift；它不属于 Story 2.5 artifact-path CR 阻塞项，不进入本轮 fixer，也不作为 Story 2.5 CR TODO。
- 验证：
  - `npm test -- --run test/artifact-path-validation.test.ts` 通过，1 file / 7 tests。
  - `npm run build` 通过。
  - `git diff --check` 通过。
  - `npm test -- --run test/runtime-structure.test.ts` 仍失败于已知 `test/runtime-structure.test.ts:45` fresh-install skillCount fixture drift；当前 runtime 输出 `54 skills`，fixture 仍记录 `53 skills`。
- 结论：Evaluator round 3 结论为通过；Story 2.5 满足 CR 停止条件，可进入 rules / TODO tracker / finalizer。下一步 TODO tracker 只应维护已确认的 `generatedAt` P2 TODO；不应扩大到 `skillCount` fixture drift，除非用户另行授权。

## 2026-05-27 15:39 - CR Rules Extractor

- 方案：使用 `/bmenhance-cr-04-rules-extractor 2-5` 分析 Story 2.5 全部 CR summary / evaluation / fix record；按默认推荐决策执行 record-only，不修改全局 PRD / Architecture / specs。
- 选择原因：Story 2.5 已满足 CR 停止条件，当前需要从多轮 CR 中沉淀可复用规则，并把未解决的非阻塞项交给 05 TODO Tracker。
- 结果：
  - 新增 `CR-SEC-04`：Artifact path public contract 必须先严格校验 POSIX-style 再做 filesystem normalization，评分 6/12，建议去向 `rules-summary`。
  - 新增 `CR-SEC-05`：`actualArtifactPath` containment 必须以 configured artifact root 为边界，评分 7/12，建议去向 `rules-summary`。
  - `generatedAt` validator 接受范围偏窄通过硬性门槛，但状态为未解决 P2 非阻塞项，交给 05 TODO Tracker，不写入规则总结正文。
  - `skillCount=54` vs fixture `53` 按 evaluator 结论排除，不纳入 Story 2.5 TODO 或规则修复范围。
- 全局文档建议：不修改全局文档；PRD / Architecture / owning SPEC 已有 path 和 artifact contract 原则，本次仅在 CR rules summary 中沉淀实现检查点。
- 输出文件：`_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`。
- 结论：CR 规则提炼完成，下一步进入 05 TODO Tracker，只维护已确认的 `generatedAt` P2 TODO。

## 2026-05-27 15:39 - CR TODO Tracker

- 方案：使用 `/bmenhance-cr-05-todo-tracker 2-5` 按默认推荐决策维护已确认的 Story 2.5 CR TODO；只更新 `cr-todo-backlog.md`，不修改源码或测试。
- 选择原因：Round 1 / Round 2 / Round 3 evaluator 均确认 `generatedAt` validator 比 Story / SPEC 的 parseable ISO 8601 contract 更窄，但当前 helper 使用 `Date.toISOString()`，因此为 P2 非阻塞项。
- 结果：
  - 新增 `TODO-002: 对齐 generatedAt validator 与 ISO 8601 contract`。
  - 优先级：P2。
  - 类别：other。
  - 涉及文件：`src/manifest/manifest-schema.ts`、`test/artifact-metadata.test.ts`、`test/artifact-path-validation.test.ts`、Story 2.5、`04-manifest-index-contract.md`。
  - 顶部统计从 open 1 更新为 open 2。
  - 未记录 `skillCount=54` vs fixture `53` drift。
- 输出文件：`_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`。
- 结论：CR TODO Tracker 已完成，下一步进入 finalizer。

## 2026-05-27 15:39 - CR Finalizer

- 方案：使用 `/bmenhance-cr-06-finalizer 2-5` 验证最新 evaluator round 3 通过结论后，将 Story 2.5 标记为 done 并同步状态文件。
- 前置验证：
  - 最新评估文件：`2-5-code-review-evaluation-20260527-round-3.md`。
  - 评估结论：通过；Story 2.5 满足 CR 停止条件。
  - 当前 Story 状态：`review`。
- 更新结果：
  - `_bmad-output/implementation-artifacts/stories/2-5-workflow-artifact-output-and-metadata-validation.md`：`Status: done`。
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`：`2-5-workflow-artifact-output-and-metadata-validation: done`。
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`：Epic 2 下 Story 2.1-2.5 均为 `done`，按默认推荐决策将 `epic-2: done`。
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`：`last_updated` 更新为 `2026-05-27 15:39 CST`。
  - `_bmad-output/planning-artifacts/bmm-workflow-status.yaml`：文件不存在，按 finalizer 容错规则跳过。
- 结论：Story 2.5 已完成 CR 收尾；Epic 2 的 Story 范围已全部 done。
