# Story 11.9: Normalize Code Review Artifact Directories By Story ID（按 Story ID 统一 Code Review Artifact 目录）

Status: done

## Story（故事）

作为执行 Epic Story Code Review 闭环的开发者和项目维护者，  
我希望 reviewer、evaluator、fixer、tracker、finalizer 与 goal records 始终使用唯一 Story-ID-only 目录，  
以便 CR artifacts 不再因 title/slug 分散到多个目录。

## Acceptance Criteria（验收标准）

1. 新 CR run 唯一 root 为 `{implementation_artifacts}/code-reviews/{story_id}-code-review/`。
2. `{story_id}` 只来自规范编号，点转连字符；Story `11.9` 精确为 `11-9-code-review/`。
3. Title/name/slug/filename 的非编号文本、中文、空格、标点不得参与目录名。
4. Orchestrator 只解析一次 canonical `$cr_dir` 并传给 CR01–06；下游不得重新推导。
5. Review/evaluation/fix/rules/TODO/finalization/temp/round artifacts 全部写同一目录。
6. Goal records 固定在 `$cr_dir/goal-execute-records/`，继续使用 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
7. 审计并同步 orchestrator、CR01–06、shared contract/config、templates、help、metadata/contracts、scripts/hooks/fixtures/docs 及全部 `$cr_dir` expressions。
8. Existing title-bearing CR directories 不自动迁移、重命名或删除。
9. Legacy-only unfinished run 必须诊断并在一个目录内恢复；"目录存在 series S 的未完成 run" 仅按 v2 文件名判定（直接子文件中存在 S 的 review summary 且不存在 S 的 finalizer 产物），不读取产物内容；canonical+legacy 同时含未完成 run 而无法唯一判定时 stable conflict + stop，不猜测、不拆轮。
10. Negative scan 排除 active title-bearing patterns；仅 legacy fixtures/明确 compatibility docs 可分类保留。
11. Tests 覆盖纯编号、任意 title 不影响、CR01–06 同 `$cr_dir`、goal records、legacy-only、dual-dir ambiguity 与 title traversal 无法越界。
12. 不修改 report basenames、CR algorithm、round numbering 或 approval rules。

## Threat Model & Non-Goals（威胁模型与非目标）

> 2026-09-11 项目负责人裁决（决策 A），是本 Story restart 的前提；CR 各层不得重开。

- 目录 resolver 面向**协作式本地文件系统**：使用者是同一仓库的开发者与 Skill 运行时，不是对抗方。
- **In scope**：Story ID 数字归一化与 fail-close；canonical / legacy 目录归属；symlink 越界检测（复用 `src/fs/path-normalizer.ts` 的 `findProjectBoundarySymlinkEscape`）；按 v2 文件名判定未完成 run；ambiguity 稳定诊断且零 mutation。
- **Out of scope（明示）**：hard link、CRLF / 行尾变体、TOCTOU 竞争、伪造 frontmatter 或正文伪字段、产物真伪认证、审批历史重放、tracker 认证、freshness 比较。resolver 只看文件名，不读文件内容；审批与 round 有效性继续归 runner 与 CR06（AC12）。
- **CR 契约**：命中上述 out-of-scope 类别的 finding 一律按契约归 `dismiss`，引用本章节即可，不得为其编写代码或测试。

## Tasks / Subtasks（任务 / 子任务）

### Restart 2.0（2026-09-11 重启）

- [x] 回退 9 个 canonical CR 包与 `test/code-review-contract.test.ts` 到 `ff7528d`，删除 `resolve-cr-directory.mjs` / `test/cr-directory-resolution.test.ts` / title-bearing fixture，归档旧 CR 产物到 `superseded-main/`。
- [x] TDD：先写 `test/cr-directory.test.ts`（RED），再实现 `src/config/cr-directory.ts` 与 `speclite resolve cr-directory` 子命令（GREEN）。
- [x] 契约与 Skill 同步：`cr-contract.md` 增加 ≤15 行 "CR Directory Resolution"；runner Step 0 调用一次 CLI；CR01–06 只消费传入 `crDir`；8 包 CHANGELOG 写 restart 条目。
- [x] 人工复核混入 11.4 / 11.8 改动的文档行，只删 `directoryContext` / `validate-context` 表述。
- [x] 重新生成 fresh-install fixture 与 packaging manifest；`npx vitest run`、`npm run docs:check`、`npm run release:check` 通过。
- [x] CR 闭环 ≤3 轮（reviewSeries=`restart`），边界外 finding 按 Threat Model 归 `dismiss`。

### Historical（1.0 / 1.1，已由 restart 取代）

- [x] 核验 11.1–11.8 completion Gates，运行 11.9 kickoff，冻结 canonical/legacy directory contract。
- [x] 先建立 normalization、propagation、legacy recovery、dual-directory conflict 与 traversal failing tests。
- [x] 收口 shared CR contract/parser；orchestrator 一次解析 `$cr_dir` 并显式传递 CR01–06。
- [x] 更新 CR01–06/read-write paths、templates、goal records、help/metadata/docs，不改变 basenames/algorithm/approval。
- [x] 实现 legacy-only resume 与 ambiguous dual-dir stable diagnostic；保持 legacy files 原位。
- [x] 执行 full active-pattern scan、focused CR tests、build、diff check 与 completion Gate。

### Directory Routing Replacement（目录归属重实现）

- [x] 按 2026-09-09 用户批准的完整方案修订本 Story 添加的 directory-layer contract，保留原 12 条 AC 与原 CR 审批职责。
- [x] 先建立 directory-only 与生产 context validator 的 failing tests，拆分目录测试并记录旧审批重放断言的职责映射。
- [x] 精简既有 resolver，只做 numeric identity、候选归属和物理路径安全；不做审批、gate 或 tracker 认证，不新增依赖。
- [x] 在既有脚本内接入生产 context validation，并同步 runner 与 CR01–06 中英文消费者及相关 docs/help。
- [x] 验证 numeric/title、legacy/ambiguity、safe paths、single propagation、全产物路径、zero-write、installed 双 IDE 和原审批不变；执行受控真实 Skill 路径消费验证。
- [x] 完成 build、focused/full tests、docs、canonical strict、scoped lint、diff audit 和隔离 fixed-input packaging，记录真实失败与基线对照后交接 fresh CR。

## Dev Notes（开发备注）

### Restart Implementation Location（重启实现位置，决策 B）

- 与 Story 11.1 / 11.5 同构：可执行逻辑放在 `src/config/cr-directory.ts`，通过 `speclite resolve cr-directory --story-id <N.N|N-N> --review-series <series> --project-root <root> [--human]` 暴露，输出 SPEC 01 CommandResult；schema 登记在 `src/config/resolve-output-schema.ts`；`docs/reference/cli.md` 补一行。
- Skill 只调用 CLI：runner Step 0 解析一次，把 `crDir` / `canonicalCrDir` / `compatibilityMode` / `legacyArtifactPaths` 传给 CR01–06；canonical Skill 包**不再**随包投影 `.mjs` 脚本。
- 不引入新状态：无 ownership marker、无 per-write validator、无 frontmatter 解析器；`implementationArtifacts` 来自 11.1 的 `resolveArtifactRootsFromProjectConfig`。
- Ambiguity issue 沿用 kickoff gate 已冻结定义：`cr-directory.ambiguous-resume-root` / `lifecycle` / `error` / `block`，details 只含 `storyId`、`canonicalCrDir`、byte-wise 排序去重的 `legacyCrDirs`、`reviewSeries`、`roundEvidence`、`reason`，不含绝对路径。
- 1.0 / 1.1 的 Dev Agent Record 与 File List 保留为历史，不再是当前实现事实。

### Current Verified Baseline（当前已验证基线）

- Shared `speclite-code-review-contract/references/cr-contract.md` 已声明 Story-ID-only root；runner、CR01、CR06 也已有相同文案，本 Story 应复用并补齐 executable/full-chain closure，不重写一套新算法。
- Runner 当前调用面仍可能只传 `storyId`，下游可再次推导；必须传递一个已解析且验证过的 `$cr_dir` identity。
- 当前 CR governance 相关工作树/历史 commits 可能含用户改动；实现时必须 scoped audit，禁止 broad rewrite。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- 解析 Story ID 时只接受 canonical numeric identity（如 `11.9` / `11-9`），输出 normalized `11-9`；title 不是 fallback source。
- `$cr_dir` 必须 project-relative POSIX、位于 `{implementation_artifacts}/code-reviews/`，任何 separator/traversal title 不得改变它。
- Canonical/legacy ambiguity 必须在任何 round write 或 progress mutation 前停止，并使用 owning taxonomy stable issue。
- Legacy discovery 只提供 resume/evidence，不做 filesystem migration；所有同轮 outputs 保持单目录。
- 无外部 API或版本升级；重点回归 CR contract tests 与 strict-serial state-machine semantics。
- Current shared CR contract 尚未固定 legacy-only resume 应继续写 legacy directory 还是切换到 canonical directory，也未固定 dual-directory issue ID/category/details。Kickoff 必须先关闭这两个 observable decisions；未关闭时为 `DECISION_NEEDED`，CR01–06 不得各自选择。
- CR stable diagnostics 必须先选择唯一 owner：若作为 project validation issue 暴露，则由 `SPEC 07` taxonomy 承载；若仅属 CR workflow-local continuation，则由 shared `speclite-code-review-contract` 承载。无论选择哪一方，legacy-only 与 dual-directory fixtures 必须断言 owner、stable ID/category/details、redaction、stop-before-write 与 zero progress mutation。

## Previous Story Intelligence（前序 Story 情报）

- Story 11.8 必须先完成 canonical rename/routing；11.9 不得把 generic grill 或 readiness work 混入 CR root normalization。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.8 `done` + completion Gates；不得依赖 11.10。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-kickoff-gate.md`。
- Legacy-only write target 或 dual-directory stable diagnostic 未关闭时不得开始实现。
- 若 stable diagnostic owner 在 `SPEC 07` taxonomy 与 shared CR contract 之间未决，kickoff 必须返回 `DECISION_NEEDED`；CR01–06 不得各自发明 issue ID、category 或 resume behavior。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| numeric canonical root | normalization table | `FAIL_CONTRACT` |
| single resolution/propagation | review、evaluation、fixer append、rules、TODO result、finalizer、`.tmp/`、goal records 全部使用同一 normalized `$cr_dir` | `FAIL_FUNCTION` |
| legacy/ambiguity/no-migration | resume + dual-dir fixtures | `FAIL_EVIDENCE` |
| active corpus closure | title-bearing negative scan | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Parser/helper 位置可调整；numeric-only root、single `$cr_dir` propagation、single-round directory、legacy no-migration、ambiguous stop 与 traversal safety 不可改变。

## Files To Modify（预计文件范围）

- `speclite-code-review-contract/{SKILL.md,SKILL.en.md,references/cr-contract.md}`。
- `speclite-goal-orchestrator-epic-story-code-review-runner/**` 与 CR01–06 `SKILL*` / references / templates。
- Shared owner `speclite-code-review-contract/references/cr-contract.md`、module help/metadata/contracts、scripts/hooks/fixtures/docs 的 path expressions；current canonical source 不存在 `cr-config.md`，不得把它当作既有 UPDATE file。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`：仅当 kickoff 决定 legacy-only / dual-directory diagnostics 属 project validation taxonomy 时同变更更新；若 shared CR contract owns these diagnostics，必须记录 no-`SPEC 07` change rationale，并在 fixtures 断言 CR-local owner boundary。
- 扩展 `test/code-review-contract.test.ts`，新增 legacy/ambiguity/propagation fixtures。

## References（参考资料）

- [Source: Epic 11 Story 11.9]
- [Source: PRD FR23g]
- [Source: `speclite-code-review-contract/references/cr-contract.md`]
- [Source: `speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`]

## Dev Agent Record（开发代理记录）

### Implementation Plan（实施计划）

- Directory resolver 仅拥有 numeric Story identity、current candidate ownership、显式 `directoryChoice` 与物理路径安全；`DONE`、approval、tracker、gate、scope/hash、freshness、round completeness 和 coordinated write 继续由原 CR owner 验证。
- Resolver 返回并冻结 `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`；唯一 current legacy 即使含 `DONE` claim 也原位绑定，不隐式换目录或重启 series。
- 同一 production script 导出并提供 CLI `validate-context`，只验证 runner 已冻结的 Story/series/四字段与单个 `writeSubpath`，不重新发现或选择目录。
- runner 单次 resolve；CR01–06 每次写入前调用 production validator。显式 `directoryChoice` 只消除多个安全 current candidates 的归属歧义，不能绕过 unsafe path、迁移历史或合并/拆分轮次。
- 原 `test/code-review-contract.test.ts` 的 15 个审批 contract tests 与 4 个 `it.todo` 保留；目录、安全、scan、install 和 production validator coverage 拆到 `test/cr-directory-resolution.test.ts`。旧 resolver 审批重放测试退出的职责映射记录在本轮 goal records，不能视为审批规则删除。

### Directory Routing Authorization（目录归属重实现授权）

- 2026-09-09 用户批准「按上一条完整方案实施」。当前执行方案及精确范围见 `../code-reviews/11-9-code-review/goal-execute-records/PLAN.md` 和 `directory-routing-baseline.json`。
- 原任务完成说明及下方旧 PASS_EQUIVALENT 记录保留为历史；当前旧 completion gate 实际为 FAIL_FUNCTION，新实现与 fresh CR 尚未完成。
- 新 series=`directory-routing`，目录归属与审批解耦；旧 evidence-v2 及 TODO018–022 保留，不靠重标证据或风险豁免完成。

### Agent Model Used（使用模型）
OpenAI GPT-5.6 Sol (medium)

### Completion Notes List（完成说明）
- 2026-09-09 流程顺序纠正：开发完成后曾在 fresh development completion gate 之前提前切换为 `review`；已先恢复 Story/sprint 为 `in-progress`。仅在保存旧 `FAIL_FUNCTION` gate 并由真实 Flow Gate 生成允许结论后，才可重新进入 `review`。
- 2026-09-09 fresh development completion gate 已按 canonical `speclite-flow-gate` 生成 `PASS`，raw SHA-256=`e7f93a5531ebfaffe7e483361eca67dd45a4b7e56a8b645d8532dded6935cd1f`；旧 `FAIL_FUNCTION` gate 以原始 hash `b013691d…` 逐字节保存后，Story/sprint 才重新进入 `review`。后续顺序为 CR01/02 → 必要 CR03 与复审复评 → CR04/05 → fresh closeout gate → CR06。
- 2026-09-09 directory-routing 开发完成：resolver 从 1791 行收敛为 757 行，只处理 numeric identity、current candidate 归属、显式 `directoryChoice` 和物理安全；移除 trackerBindings、审批历史重放与 Markdown/HTML/YAML 审批扫描。
- 同一 production script 新增 export/CLI `validate-context`：比较 orchestrator frozen context 与 consumer context 的 Story/series/四目录字段，并在写前校验 write path；runner 只 resolve 一次，CR01–06 均真实调用该入口且不重选目录。
- RED→GREEN：新增 directory test 初始 `1 passed / 9 failed`，实现后 focused 最终 `25 passed / 4 todo`；原 `test/code-review-contract.test.ts` 精确保留 15 个审批 tests 与 4 个 `it.todo`。主代理只读核对确认 shared contract 从 Review Scope Manifest 到 EOF 与 HEAD 逐字节一致。
- installed 双 IDE 验证使用真实 `runInstallCommand`，确认 `.agents/.claude` resolver bytes、mode、resolve 与 validate CLI；这是 production 路径消费证据，不冒充正式审批 E2E。链路按 CR01/02、必要 CR03 与复审复评、CR04/05、fresh closeout gate、CR06 顺序记录，完整证据在 CR06 后齐备。
- 验证：build、focused、docs、canonical strict、八个 scoped density lint、diff check 与隔离 packaging PASS；affected `37 passed / 4 failed`，失败均为范围外 core `18→19` / total `68→69` 固定计数。
- 隔离 full 关闭 file parallelism 后为 `695 passed / 13 failed / 4 todo`；其中 12 项均为同一外部固定计数，1 项仅因 `/private/tmp` copy 被 local-source 自引用保护拒绝，迁到允许的系统 TMPDIR 单测为 `14 passed`。不声称 full PASS，也不扩大范围修复。
- 主目录旧 manifest `82bf17e8…` 在开发 baseline full 的既有 writer/cache 失败中丢失且无法原字节恢复；最终同步的是隔离工具真实新派生版 rawHash `029b8110…`（packageHash `sha256:143d04dc…`），与隔离输出逐字节一致，不冒充旧版恢复。
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Kickoff `PASS`：legacy-only 唯一 unfinished run 原位 resume；dual/multi ambiguity 由 shared CR-local contract 以 `cr-directory.ambiguous-resume-root` fail-close，并在任何写入前停止。
- 新增 executable shared resolver，仅接受 numeric Story ID；runner 单次解析并向 CR01–06、全部 CR artifacts、`.tmp/` 与 goal records 传播同一 `crDir`。
- 完成 legacy recovery、latest-round、ambiguity redaction/zero-write、title/traversal isolation、active-pattern scan 与 fresh-install resolver parity 回归。
- Focused final `24 passed / 4 todo`；affected matrix `74 passed / 4 external fixed-count failures / 4 todo`；full suite `695 passed / 12 external fixed-count failures / 4 todo`。
- `docs:check`、ESM/DTS build、packaging、canonical strict、skill density 与 `git diff --check` 均通过；completion gate 为 `PASS_EQUIVALENT`。

### Restart 2.0 Completion Notes（重启完成说明）

- 实现：`src/config/cr-directory.ts`（`normalizeCrStoryId` fail-close、`resolveCrDirectory` 只按目录名与直接子文件名判定、`checkBoundary` 复用 `findProjectBoundarySymlinkEscape` 并把非 ENOENT 归 `cr-directory.unreadable-candidate`）、`speclite resolve cr-directory` 子命令、`ResolveCrDirectoryOutputSchema`；无 marker / validator / frontmatter 解析。
- 契约：`cr-contract.md` CR Directory Resolution（唯一派生点、恢复矩阵、`cr-directory.ambiguous-resume-root`、威胁模型、HALTED finalizer 重入规则）；runner Step 0 一次解析 + fresh-session 定位规则 + 六个调用串携带 `crDir` / `compatibilityMode` / `legacyArtifactPaths`；CR01–06 只消费传入 `crDir`。
- CR 闭环（reviewSeries=`restart`，3 轮，commits `6079257` → `53195ae` → `bee8e07`）：round 1 FIX_REQUIRED（5 P1）→ round 2 FIX_REQUIRED（2 P1，其中 R1-F4 recurred）→ round 3 `PASS_WITH_DEFERRED_TODOS`（p1=0，累计 7 blocking 关闭，5 deferred 登记为 TODO-023~027，3 dismissed）。全部 finding 在 Threat Model in-scope；无 hard link / CRLF / TOCTOU / 伪造内容类 finding。
- 验证：`npx vitest run` 727 passed / 0 failed / 4 todo（沙箱外）；`npm run docs:check`、`npm run release:check`、canonical strict、`git diff --check` PASS；`npx tsc --noEmit` 对本 Story 文件 0 新增错误（既有 136 个非 Story 错误不变）。
- 边界：未修改 report basename / round / 审批规则（AC12）；21 个非 Epic 11 文件未纳入；`superseded-main/` 历史证据保留。

### Restart 2.0 Anchor Evidence Summary（重启锚点证据摘要）

- Normalization：`11.9` / `11-9` → `11-9-code-review`；12 类非法输入 fail-close（`test/cr-directory.test.ts:20-44`）。
- Propagation：runner Step 0 一次 CLI，六个调用串 + Invocation Parameter Matrix + CR01–06 Inputs 携带冻结值；prose 断言 `test:638-679`。
- Legacy / ambiguity：legacy-only 未完成 run 原位 `legacy-resume`；canonical+legacy / 多 legacy → `cr-directory.ambiguous-resume-root`（lifecycle / error / block）零 mutation、无绝对路径（`test:118-264`）。
- Path safety：symlink 越界、非目录 / 不可读候选（ENOTDIR / ELOOP / EACCES）结构化 block（`test:265-491`）。
- Scan / install：全量 corpus title-bearing 表达式 0 命中；fresh-install parity（runner / contract 含 CLI 引用，无 `scripts/`）。
- Gates：restart kickoff `PASS`（2026-09-11）；completion gate 见 `flow-gates/…-story-completion-gate.md`（restart 重生成）。

### Restart 2.0 File List（重启文件清单）
- `src/config/cr-directory.ts`（新）、`src/commands/resolve.ts`（`resolve cr-directory` 子命令）、`src/config/resolve-output-schema.ts`（`ResolveCrDirectoryOutputSchema`）
- `test/cr-directory.test.ts`（新）；`test/fixtures/fresh-install-empty-project/expected/installed-state/{files-index-full,skill-index-full}.json`、`test/fixtures/resolve-parity/expected/human/config-invalid-input.txt`、`release/packaging-manifest.json`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/cr-contract.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/runner-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-0{1..6}-*/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/*-workflow.md}`
- `assets/source/speclite/{README.md,README.en.md}`、`assets/source/speclite/sdlc-skills/module-help.csv`、`docs/reference/cli.md`、`docs/reference/skills/sdlc-workflows.md`、`docs/reference/workflow-artifact-layout.md`
- 删除：`speclite-code-review-contract/scripts/resolve-cr-directory.mjs`、`test/cr-directory-resolution.test.ts`、`test/fixtures/code-review-contract/title-bearing-path-ledger.json`
- `_bmad-output/implementation-artifacts/{stories/11-9-*.md,sprint-status.yaml,cr-rules/cr-todo-backlog.md,flow-gates/11-9-*-story-kickoff-gate.md,code-reviews/11-9-code-review/**}`

### File List（1.0 / 1.1 历史文件清单）
- `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-kickoff-gate.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/cr-contract.md,scripts/resolve-cr-directory.mjs}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/runner-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/reviewer-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/evaluator-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/fixer-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/rules-extractor-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/todo-tracker-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/finalizer-workflow.md}`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `assets/source/speclite/{README.md,README.en.md}`
- `docs/reference/skills/sdlc-workflows.md`
- `docs/reference/workflow-artifact-layout.md`
- `test/code-review-contract.test.ts`
- `test/cr-directory-resolution.test.ts`
- `test/fixtures/code-review-contract/title-bearing-path-ledger.json`
- `release/packaging-manifest.json`

## Anchor Evidence Summary（锚点证据摘要）
- Normalization：`11.9` 与 `11-9` 唯一归一为 `11-9-code-review`；非数字、零前缀、title 与 traversal inputs fail-close。
- Propagation：runner resolver invocation count 为 1，CR01–06、all artifacts、`.tmp/`、`goal-execute-records/` 消费同一 `crDir`。
- Legacy / ambiguity：唯一 unfinished legacy 原位 resume；completed legacy 使用 canonical；dual/multi 或 unsafe evidence 产生 stable、redacted、zero-write diagnostic。
- Scan / install：active title-bearing expression 为零；fresh `.agents` / `.claude` resolver bytes、mode 与 CLI probe 通过。
- Gates：kickoff `PASS`；completion `PASS_EQUIVALENT`；Story status target=`review`。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 CR Story-ID-only root、single propagation、legacy/ambiguity 与 evidence 上下文。 | Fancyliu / Codex |
| 2026-09-05 | 1.0 | 实现 numeric-only resolver、single `crDir` propagation、legacy resume、ambiguity pre-write stop，并完成回归与 Completion Gate。 | Codex |
| 2026-09-09 | 1.1 | 以 directory-only resolver + production frozen-context validator 替换审批重放实现，保留原 CR owner，完成隔离验证并交接 fresh CR。 | Codex |
| 2026-09-11 | 2.0 | Restart：依 Correct Course 裁决（A 威胁模型边界 / B 实现迁入 `src/` + CLI / C 历史产物归档）回退 1.0–1.1 实现到 `ff7528d`，新增 Threat Model 章节，AC9 改为按 v2 文件名判定未完成 run，TODO-018~022 标 `superseded-by-restart`。 | Fancyliu / Claude |
| 2026-09-11 | 2.1 | Restart CR 闭环完成：restart round 1–3（FIX_REQUIRED → FIX_REQUIRED → PASS_WITH_DEFERRED_TODOS），TODO-023~027 登记，completion gate 重生成，CR06 收口。 | Claude |
---
*本文档由 bmad-create-story Skill 自动生成*
