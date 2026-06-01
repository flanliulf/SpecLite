# Story 5.4 实验笔记

更新时间：2026-06-01 18:44 CST

## Notes（笔记）

- 当前 `sprint-status.yaml` 显示 `epic-5: in-progress`，Story 5.1、5.2、5.3 为 `done`，Story 5.4 和 5.5 为 `ready-for-dev`。
- Story 5.4 范围是 Git source external access intent、remote/ref resolution、resolved commit SHA pinning、floating branch/tag/URL-only source rejection、`git-commit` integrity evidence、Git-specific source-integrity diagnostics、credential-bearing remote redaction、install/status/validate no-network boundary 和 focused tests。
- Story 5.4 明确不负责 Story 5.5 full trust/reporting matrix、Epic 6 fixture matrix、enterprise allowlist、signatures、provenance verification、Post-MVP commands 或完整 source lockfile lifecycle。
- Story 5.4 必须复用前序 source selection、registry/local source resolver、trust/evidence helper、redaction 和 validate/status local-only patterns，不创建私有 JSON shape、私有 trust model 或隐藏写入流程。
- Git remote resolution 只能在 SourceResolutionPlan 已声明 external access intent 且用户确认后发生；未确认时不得访问 remote、fetch、clone、获取 operation lock 或写项目文件。
- 如果实现使用 Git CLI，必须通过 wrapper 隔离 stdout/stderr、exit status、timeout 和 redaction；不得让 raw Git error、credential-bearing remote、private query string、temporary checkout path 或 stack trace 进入 public JSON、human output、manifest/index 或 fixture snapshots。
- 当前工作树已有大量无关 dirty/untracked 文件；后续必须逐文件核对，不回滚、不清理。
- `bmad-dev-story` workflow 解析需要 `python3.12` fallback；裸 `python3` 报 `Python 3.11+ is required (stdlib tomllib not found)`。
- `_bmad-output/project-context.md` 仍是初始化占位，不提供额外实现约束；实现以 Story、owning SPEC 和 live source 为准。
- `sprint-status.yaml` 已在 2026-06-01 17:22 CST 将 Story 5.4 标为 `in-progress`，后续完成后再统一置为 `review`。
- RED 结果说明现状仍停在 Story 5.1 unsupported boundary：确认后的 Git source 返回 `source-integrity.unsupported-source`，没有调用 injected Git client，也没有生成 `git-commit` evidence；validate 对 `git` descriptor 返回空 validated paths。
- dev-story agent `019e827d-6349-7c03-b0f5-597e43032dc7` 在完成开发前发生 stream disconnected，已关闭；该步骤视为未完成，不能进入 reviewer/evaluator/fixer。
- 失败 agent 已留下部分 RED / preflight 工作，包含 `src/source/git-source-resolver.ts`、`test/git-source-resolution.test.ts`、本目录进度文件和 `sprint-status.yaml` 的 `in-progress` 状态。后续 fresh replacement dev-story agent 必须先核对这些文件，再继续完成，不得盲目覆盖或回滚。
- replacement dev-story agent `019e828a-880c-7680-b283-85cafbf103f7` 再次 stream disconnected，关闭后确认没有完成开发、最终验证或状态迁移；下一次续跑需要收窄到“完成已有 RED tests 与状态收尾”，避免重复大范围探索。
- replacement dev-story agent `019e828c-53f8-7053-a98c-dbf46ec04da6` 第三次 stream disconnected，关闭后确认 Story 仍为 `ready-for-dev`、sprint 仍为 `in-progress`。随后本地只做取证验证：focused Git source tests、全量 tests 和 build 均已通过；下一步应使用 completion-only dev-story agent 完成文档/状态收尾。
- completion-only dev-story agent `019e828f-1e15-75c0-bfe3-2a4611923bf8` 第四次同类 stream disconnected，关闭后确认没有完成状态/文档收尾。当前阻塞点是 fresh GPT-5.5 sub-agent 执行通道连续失败，而不是当前 5.4 实现验证失败。
- 不能在父 agent 中直接把 Story 5.4 标为 `review` 或启动 reviewer，因为用户明确要求 dev-story 由 fresh sub-agent 严格串行完成。
- completion-only fresh dev-story sub-agent 于 2026-06-01 18:04 CST 接手后，只执行收尾核对和状态迁移：Story 5.4 已置为 `review`，`sprint-status.yaml` 中 5.4 已置为 `review`，未进入 reviewer/evaluator/fixer/finalizer/commit。
- 收尾依据的验证证据：`npm test -- test/git-source-resolution.test.ts` 通过，1 file / 9 tests passed；`npm test` 通过，33 files / 245 tests passed；`npm run build` 通过。
- 代码核对锚点：`src/source/git-source-resolver.ts` 覆盖 requested ref classification、`git ls-remote` wrapper、resolved commit SHA、`git-commit` evidence、blocked diagnostics 和 trust derivation；`src/commands/install.ts` 在 confirmed Git source 后调用 resolver；`src/validation/rules/source-integrity.ts` 对 installed Git descriptor 做 local-only evidence shape 检查；`test/git-source-resolution.test.ts` 覆盖 pinning、floating rejection、redaction、auth failure、validate/status no-network。
- Round 1 reviewer 使用 `bmenhance-cr-01-reviewer`；当前环境无内部 Agent 调度工具，已按 skill fallback 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查，并在 summary 中注明。
- Round 1 reviewer 验证证据：`npm test -- test/git-source-resolution.test.ts` 通过，1 file / 9 tests passed；`npm test` 通过，33 files / 245 tests passed；`npm run build` 通过；`package.json` 无 `lint` script。
- Round 1 reviewer 结论：不通过。四桶数量为 `decision_needed=0`、`patch=3`、`defer=0`、`dismiss=0`。
- 主要阻塞发现 1：`SourceIntegrityEvidenceSchema` 和 `validateSourceIntegrity` 未强制 Git `version` / `commitSha` 为 full 40-hex SHA；定向复现显示 `version: "main"` / `commitSha: "main"` 可通过 validate。
- 主要阻塞发现 2：explicit 40-hex selector 只要出现在 `ls-remote` 输出 oid 中即可被当作 `git-commit` evidence，没有 commit-ish verification。
- 非阻塞 patch 发现：human install output 的 external access 展示从 descriptor 反推，并硬编码 `confirmationState=pending`，confirmed success path 也会显示 pending。
- Round 1 evaluator 独立复核结论：Finding 1 与 Finding 2 均为 P1 阻塞修复，分别破坏 installed Git descriptor local validate evidence shape 和 resolver commit-ish proof；Finding 3 真实存在，但 runtime confirmation gate 已由 `createSourceResolutionPlan` / `runInstallCommand` 生效，问题集中在 human output/reporting 投影，评为 P2 非阻塞 CR TODO。
- Story 5.4 AC4 的当前裁决：若仅看访问门禁，未确认路径不调用 Git client、confirmed 后才解析 remote，因此 Finding 3 不阻塞；若用户要求 public human audit 在本 Story 内完全准确，可在后续 fixer 中提升处理，但 evaluator 默认不扩大当前 P1 修复边界。
- evaluator 验证命令：`npm test -- test/git-source-resolution.test.ts` 通过，`npm run build` 通过；三个 `npx tsx -e ...` 定向复现分别确认 non-SHA validate 通过、explicit SHA arbitrary advertised oid 通过、confirmed human output 仍显示 pending。
- Round 1 fixer 只修 evaluator 确认的 2 个 P1：Git descriptor full SHA shape 和 resolver commit-ish verification；P2 human output confirmationState 仅记录为 CR TODO。
- Git descriptor shape 修复点：`git-commit.commitSha` 由 schema 收紧为 full 40-hex SHA；Git descriptor `version` 在 schema 和 validate 中都必须是 full SHA；validate 对 non-SHA `version` / `commitSha` 返回稳定 `source-integrity.floating-git-source`，原因 `invalid-git-commit-evidence-shape`。
- Git resolver 修复点：`GitClient` 新增 `verifyCommit`；branch/tag/full-ref/explicit SHA 的候选 oid 必须经 commit-ish verification 后才写入 `version` 和 `git-commit.commitSha`；explicit SHA 若 verification 返回不同 SHA 或 undefined，则 blocked。
- Git resolver failure 边界：injected `verifyCommit` 抛错时转为 `source-integrity.floating-git-source` / `reason=git-commit-verification-failed`，不泄露 raw verification error。
- annotated tag object 处理边界：tag selector 可以通过 `verifyCommit` 解引用到 commit SHA 后写入 resolved evidence；explicit SHA selector 若实际是 annotated tag object oid，则不会被当作 requested commit SHA 接受。
- 默认 Git client 的 verification 只在 confirmed resolver 阶段运行，使用临时 Git context 与 `git rev-parse --verify --end-of-options FETCH_HEAD^{commit}`；validate/status 仍 local-only，不访问 remote。
- Round 1 fixer 验证：`npm test -- test/git-source-resolution.test.ts` 通过 14/14；affected tests `contract-anchors`、`local-source-integrity`、`update-planning` 均通过；`npm test` 通过 250/250；`npm run build` 通过；scoped `git diff --check` 通过。
- Round 2 reviewer 使用 `bmenhance-cr-01-reviewer`；当前环境无内部 Agent 调度工具，已按 skill fallback 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层复检。
- Round 2 P1-1 复检结论：`src/source/source-descriptor-schema.ts` 已对 `git-commit.commitSha` 和 Git descriptor `version` 增加 full 40-hex SHA 检查；`src/validation/rules/source-integrity.ts` 已在 local-only validate Git 分支拒绝 non-SHA evidence shape；focused tests 覆盖 branch/tag/full-ref/short SHA/HEAD 等 negative cases。
- Round 2 P1-2 复检结论：`src/source/git-source-resolver.ts` 已要求 branch/tag/full-ref/explicit SHA 候选 oid 经过 `verifyCommit` 后才写入 `version` 和 `git-commit.commitSha`；explicit SHA 还要求 verified SHA 与 requested SHA 完全一致；focused tests 覆盖 annotated tag 解引用、explicit SHA 负例、verification failure 和 exception。
- Round 2 P2 复检结论：human output `confirmationState=pending` 仍存在于 `src/diagnostics/output.ts` hardcoded renderer，但 runtime gate 仍在 `runInstallCommand` 中保证未确认不访问 Git client、confirmed 后才 resolver；维持 evaluator 的 CR TODO / 非阻塞结论。
- Round 2 reviewer 验证：`npm test -- test/git-source-resolution.test.ts` 通过 14/14；`npm test` 通过 250/250；`npm run build` 通过；`package.json` 无 `lint` script。
- Round 2 reviewer 结论：通过。四桶数量为 `decision_needed=0`、`patch=0`、`defer=1`、`dismiss=0`；`defer=1` 为 Round 1 P2 CR TODO。
- Round 2 evaluator 独立复核结论：同意 reviewer 通过；Round 1 两个 P1 均已真实修复，当前 `patch=0` 成立。
- Round 2 evaluator 对 P1-1 的证据：`SourceDescriptorSchema` 已强制 `git-commit.commitSha` 和 Git descriptor `version` 使用 full 40-hex SHA；validate Git 分支已拒绝 non-SHA evidence shape；focused tests 覆盖 `main`、short SHA、tag、full ref、`HEAD` 等 malformed installed descriptor。
- Round 2 evaluator 对 P1-2 的证据：`GitClient.verifyCommit` 已成为 resolver 写入 descriptor 前的必经门禁；explicit SHA 要求 verified SHA 与 requested SHA 一致；默认 Git client 使用 `FETCH_HEAD^{commit}` 做 commit-ish verification；focused tests 覆盖 annotated tag 解引用、explicit SHA 不同 commit object、verification failure 和 exception。
- Round 2 evaluator 对 P2 的证据：`formatInstallExternalAccess` 仍硬编码 `confirmationState=pending`，因此问题真实存在；但 `runInstallCommand` 的 pending / confirmed plan gate 保证未确认路径不进入 Git resolver，confirmed 后才 resolver，因此不阻塞当前 Git pinning 交付。
- Round 2 evaluator 验证：`npm test -- test/git-source-resolution.test.ts` 通过 14/14；`npm test` 通过 250/250；检查 `package.json` scripts 确认无 `lint` script。
- Round 2 evaluator 边界：未运行 `npm run build`，避免重写 `dist/`；未修改源码、Story 文档或 `sprint-status.yaml`；未启动 fixer/finalizer/commit。
- Round 2 evaluator 最终数量：需修复 0、可忽略 0、CR TODO 1。
- 第五个 fresh sub-agent 已启动 04 rules extractor，不启动 dev-story/reviewer/evaluator/fixer/commit。
- 04 输入：Round 1/2 reviewer summary、Round 1/2 evaluator、Round 1 fixer、Story 5.4、`sprint-status.yaml`、现有 `cr-rules-summary.md` 与 `cr-todo-backlog.md`。
- 04 判定：两个已修复 P1 均通过硬性门槛，评分均为 7/12，建议去向为 `rules-summary`，不升格全局文档；原因是 owning Story/SPEC 已覆盖总原则，本次只沉淀 implementation checkpoint。
- 04 写入：`cr-rules-summary.md` 新增 `CR-API-24`（Git source descriptor validate 必须拒绝非 full commit SHA evidence）与 `CR-API-25`（Git commit evidence 必须经过 commit-ish verification 后才能写入）。
- 04 交接：confirmed Git install human output 仍显示 `confirmationState=pending` 是未解决 P2，影响 human audit 展示但 runtime gate 不受影响，交给 05 TODO Tracker，不在 `cr-rules-summary.md` 中作为已解决规则重复管理。
- 04 边界：未修改源码、测试、Story 文档、`sprint-status.yaml` 或全局文档；未启动 05/06/commit。
- 05 TODO Tracker 已执行；读取现有 backlog 后确认最大编号为 `TODO-003`，open 统计为 3。
- 05 写入：新增 `TODO-004: confirmed Git install human output confirmation state 对齐`，优先级 P2，类别 `other`，涉及 `src/diagnostics/output.ts`、`src/diagnostics/command-result-schema.ts`、`src/commands/install.ts`、`test/git-source-resolution.test.ts`。
- 05 统计：`cr-todo-backlog.md` open 统计从 3 更新为 4，in-progress/resolved 保持 0。
- 05 边界：仅管理追踪文档，不修改源码、测试、Story 文档或 `sprint-status.yaml`；未启动 06/commit。
- 06 finalizer 已执行；最新 evaluation 文件为 `5-4-code-review-evaluation-20260601-round-2.md`，结论包含“通过”，满足 CR approved 前置。
- 06 状态变更：Story 5.4 文档从 `Status: review` 置为 `Status: done`；`sprint-status.yaml` 中 Story 5.4 从 `review` 置为 `done`，`last_updated` 更新为 2026-06-01 18:42 CST。
- 06 workflow tracking：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 finalizer 容错记录 skipped，未新建。
- 06 Epic 状态：Epic 5 下 Story 5.5 仍为 `ready-for-dev`，因此 Epic 5 保持 `in-progress`，未触发 Epic done 更新。
- 06 边界：未修改源码、测试或无关 dirty/untracked 文件；未运行 git commit。
- 最终状态验证：Story 文件输出 `Status: done`；`sprint-status.yaml` 输出 `last_updated: 2026-06-01 18:42 CST`、Epic 5 `in-progress`、Story 5.4 `done`、Story 5.5 `ready-for-dev`。
- 最终 TODO 验证：`cr-todo-backlog.md` open 统计为 4，`TODO-004` 存在，优先级 P2，类别 `other`，状态 open。
- 最终文件验证：Round 2 summary/evaluation、Story、sprint status、CR rules summary、CR TODO backlog、PLAN、EXPERIMENTS、EXPERIMENT_NOTES 均存在。
- 最终格式验证：`git diff --check -- <本轮 tracked 改动文件>` 无输出；对 untracked 进度文件补充 trailing whitespace 检查无输出。

## Risks（风险）

- 容易把用户输入的 branch/tag/ref 误当作 resolved commit evidence；Story 5.4 必须只允许 concrete commit SHA 进入 `git-commit` evidence。
- `--yes` 或 command-level write confirmation 不得自动接受 floating Git source、missing commit evidence、authentication failure、unresolved ref、unsupported Git transport 或 source policy rejection。
- Validate/status 后续只能读取本地 manifest/source descriptor，不得执行 Git remote freshness check、latest tag check、branch head check、provenance revalidation 或 implicit update check。
- 后续 reviewer 仍需独立复核当前实现是否完全满足 Story 5.4 所有 AC；本次只完成 dev-story 文档/状态收尾。
