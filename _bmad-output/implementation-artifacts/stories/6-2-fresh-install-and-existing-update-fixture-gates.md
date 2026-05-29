# Story 6.2: Fresh Install And Existing Update Fixture Gates（Fresh Install 与 Existing Update Fixture Gate）

Status: ready-for-dev

<!-- Note: This file is ready-for-dev story context. It is not evidence that source implementation, fixture runner, schemas, tests, or release gates already exist. -->

## Story（故事）

作为 SpecLite 维护者，  
我希望 fixture gates 覆盖空项目 fresh install 和既有安装 normal update，  
以便证明安装控制面能生成正确结构，并在更新时保护 human-owned custom 文件和 workflow-owned artifacts。

## Acceptance Criteria（验收标准）

1. **Fresh install generated tree is complete（Fresh Install 生成树完整）**  
   **前提** `fresh-install-empty-project` release gate fixture；  
   **当** fixture 执行 fresh install；  
   **则** expected outputs 必须验证生成的 project tree 至少包含 `_speclite/`、`_speclite-output/`、`_speclite/_config/manifest.yaml`、manifest/index snapshots、`.claude/skills/` 和 `.agents/skills/`；  
   **并且** 默认 selected official modules `core` + `sdlc` 下全部 canonical package roots 必须进入 `skill-index.json`、`files-index.json` 和每个 selected IDE mirror；当前 baseline 必须断言 `53` 个 canonical package roots，而不是只断言代表性 workflow skill；
   **并且** generated tree、files index、skill/help/phase coverage indexes 与 IDE mirror entries 使用 project-relative POSIX-style paths。

2. **Ready summary is gated by ReadyCheck（Ready Summary 由 ReadyCheck 门禁）**  
   **前提** fresh install fixture 运行到 completion；  
   **当** `ReadyCheck` 未通过；  
   **则** human-readable output 和 `install --json` 不得展示 ready summary 或 release-ready summary；  
   **并且** 只有 `ReadyCheck` 成功后，才可展示 ready summary、installed modules、IDE targets、key paths、completed steps、pending steps 和 next actions。

3. **Fresh install outputs are deterministic（Fresh Install 输出确定性）**  
   **前提** fresh install fixture 使用相同 source、配置、目标 IDE 和平台；  
   **当** repeated run 比较 expected file tree、manifest/index snapshots、command JSON 和 representative human-readable output；  
   **则** 输出必须 deterministic；  
   **并且** 允许差异仅限 owning schema 明确声明并由 comparator normalize、omit 或标记为 non-stable 的 timestamp fields，例如 metadata `generatedAt`。

4. **Normal existing update applies only safe installer-owned planned updates（普通 Existing Update 只应用安全 installer-owned planned updates）**  
   **前提** `existing-install-update` release gate fixture 包含 existing installed state；  
   **当** 运行普通 `speclite update`；  
   **则** installer-owned 文件只可按 `UpdatePlan.actions` 中的 non-conflicting planned update 变更；  
   **并且** `changedPaths`、`skippedPaths`、`updatePlan.actions` 和 manifest/files-index projection 必须与 actual apply result 和 planned effects 分离。

5. **Human-owned custom files are preserved（Human-owned Custom 文件保持不变）**  
   **前提** `existing-install-update` fixture 中存在 `_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 或其它 human-owned custom 文件；  
   **当** 普通 update 执行；  
   **则** human-owned files 必须保持 byte-for-byte unchanged；  
   **并且** update plan 应使用 `skip` + `reason: "human-owned"` 或等价 contract-owned projection 表达保护，而不是 overwrite、rewrite、reformat、normalize 或 delete。

6. **Workflow-owned artifacts are never overwritten, deleted, or reordered（Workflow-owned Artifacts 不被覆盖、删除或重排）**  
   **前提** `existing-install-update` fixture 中存在 `_speclite-output/` 或 configured artifact root 下的 workflow-owned artifacts 和 metadata；  
   **当** 普通 update 执行；  
   **则** workflow artifacts、metadata sidecars、frontmatter metadata 和 directory entries 必须保持存在且内容未修改；  
   **并且** update plan 应使用 `skip` + `reason: "workflow-owned"` 或等价 contract-owned projection 表达保护。

7. **Installer-owned drift blocks normal update as conflict（Installer-owned Drift 阻断普通 Update）**  
   **前提** `existing-install-update` fixture 中某个 installer-owned path 与 recorded hash 或 expected canonical content 不一致；  
   **当** 运行普通 `speclite update`；  
   **则** normal update 必须产生 `conflicts[]` entry 和 command-level `update.conflicts` issue；  
   **并且** `CommandResult.status` 必须是 `failure`、exit code non-zero，不得静默覆盖 drift，也不得把 drift 转成 repair action。

8. **Failure outputs contain actionable step state（失败输出包含可执行步骤状态）**  
   **前提** fresh install 或 existing update fixture 失败；  
   **当** output renderer 生成 human-readable output 和 `--json`；  
   **则** 不展示 ready summary 或 release-ready summary；  
   **并且** output 必须包含 completed steps、failed step、pending steps、blocking issue/conflict reason 和 suggested manual action，automation 依赖必须存在于 structured fields，而不只在 prose 中。

9. **Repair ownership is explicit and not mixed into normal update（Repair 归属明确且不混入普通 Update）**  
   **前提** Story 6.2 实现 `existing-install-update` fixture；  
   **当** fixture 覆盖 installer-owned drift；  
   **则** 本 Story 的普通 `existing-install-update` fixture 只验证 normal update 的 planned update、protected files、workflow artifacts 和 conflict behavior；  
   **并且** `update --repair` 行为不得混入该普通 fixture。若本 Story 不实现显式 `update --repair` fixture，必须把 repair fixture ownership 作为 handoff 记录给 Story 6.3 / 6.4，并要求后续先更新 owning SPEC、executable schema/parser，再更新 repair expected outputs。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 实现前置核对与契约阅读（AC: 1-9）
  - [ ] 重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 和 `test/fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；Epic 4/5 behavior 与本 Epic fixture gates 仍必须按当前源码验证，不得把本 ready-for-dev story 当作源码完成证据。
  - [ ] 按 `_bmad-output/planning-artifacts/specs/README.md` 的 implementation reading order 读取 owning SPEC。至少读取 `01-command-result-json-contract.md`、`03-install-plan-contract.md`、`04-manifest-index-contract.md`、`05-ide-adapter-registry-contract.md`、`07-validation-issue-taxonomy.md` 和 `08-fixture-contract.md`。
  - [ ] 重新读取 Story 6.1 的 fixture contract foundation 和 Story 5.5 的 source descriptor / redaction closure，确认 comparator、fixture classification、redaction 和 no-network assumptions 是否已真实落地。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的 behavior。若前置 implementation 尚未存在，按前序 story 顺序补齐或记录 blocker，不得伪造 fixture pass。
  - [ ] 检查 dirty worktree，保留用户、父 agent 或其它 sub-agent 的改动；不得格式化、重写、同步或回滚无关 planning docs、Story 1-5、Story 6.1、其它 Epic 6 story、源码或 status 文件。

- [ ] Task 2: 建立 `fresh-install-empty-project` release gate fixture（AC: 1-3）
  - [ ] 在 `test/fixtures/fresh-install-empty-project/` 或等价 fixture root 下创建 stable lower-kebab fixture layout：`input/`、`expected/`、`README.md`。
  - [ ] Input state 必须表示 empty target project，不得依赖当前 repo `_bmad`、`_bmad-output`、home directory、checkout root、cache、temporary path 或 network state。
  - [ ] Expected installed tree 必须覆盖 `_speclite/` metadata/control hub、`_speclite-output/` artifact repository、`.claude/skills/` 和 `.agents/skills/` execution plane。
  - [ ] Expected installed tree 必须列出默认 `core` + `sdlc` 的全部 canonical skill mirror entries：`.claude/skills/*/SKILL.md` 为 `53` 个，`.agents/skills/*/SKILL.md` 为 `53` 个。
  - [ ] Expected manifest/index snapshots 必须覆盖 manifest、skill index、help index、files index 和 phase coverage index 的 required schema versions、canonical target order 和 project-relative POSIX paths。
  - [ ] Expected manifest/index snapshots 必须断言 `skill-index.json` 有 `53` 个 canonical package root entries，`files-index.json` 覆盖每个 selected mirror 中对应 package files。
  - [ ] Expected command JSON 必须使用 `CommandResult<InstallCommandData>`，包含 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；不得新增未契约化 `readySummary` JSON blob。

- [ ] Task 3: 实现 ReadyCheck 与 ready summary fixture assertions（AC: 2, 8）
  - [ ] 使用 stable progress `stepId` 断言 lifecycle order，至少覆盖 `source-discovery`、`manifest-generation`、`ide-mirror-creation`、`config-initialization`、`ready-check` 和 ready summary gate。
  - [ ] `ReadyCheck` 必须至少确认 manifest/index 可读且 schema version supported、source descriptor projection valid、selected IDE mirrors 存在、selected modules 下全部 canonical package roots 对应 installed skill entries 可见、`_speclite` / artifact root / runtime paths 存在，且本次 install 没有 blocking issue 或 failed required step。
  - [ ] `ReadyCheck` 不得执行 full hash scan、remote source access、remote freshness/provenance revalidation、implicit update check 或 repair planning。
  - [ ] 失败路径 expected output 必须断言 completed steps、failed step、pending steps、blocking issue 和 suggested manual action；不得展示 ready summary 或 release-ready summary。
  - [ ] Human-readable Evidence profile 必须展示 Summary、Steps、Paths、Targets、Issues 和 Next actions；Structured profile 必须由 parsed JSON semantic comparison 覆盖。

- [ ] Task 4: 建立 `existing-install-update` normal update release gate fixture（AC: 4-7）
  - [ ] 在 `test/fixtures/existing-install-update/` 或等价 fixture root 下创建 existing installed state，包含 installer-owned baseline、human-owned custom files、workflow-owned artifacts 和一个 installer-owned planned update case。
  - [ ] 使用 files index / manifest hash baseline 表达 ownership 和 expected hashes；不要在 fixture helper 中定义第二套 ownership truth。
  - [ ] 普通 update expected JSON 必须使用 `CommandResult<UpdateCommandData>`，断言 `updatePlan.actions`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation` 和 `writeAuthorized` 的语义分离。
  - [ ] Installer-owned planned update 只在无 drift、无 conflict、write authorization 成立时进入 actual `changedPaths`；dry-run 或未授权路径必须保持 `changedPaths` 和 `skippedPaths` 为空，并保留真实 planned actions。
  - [ ] Human-owned custom 文件保持 unchanged；expected outputs 必须用 unchanged content checks 或 hash/assertion 证明未被 rewrite、reformat、normalize 或 delete。
  - [ ] Workflow-owned artifacts 保持 unchanged；metadata frontmatter、sidecar JSON、directory artifact metadata 和 artifact order 不得被 update 改写或重排。

- [ ] Task 5: 收口 normal update conflict 与 failure behavior（AC: 7-8）
  - [ ] 为 installer-owned drift 建立普通 update conflict sub-scenario；`UpdateConflict.reason` 使用 stable lower-kebab reason code `installer-owned-drift`。
  - [ ] 当 `conflicts.length > 0` 时，`issues` 必须包含且仅包含 command-level blocking issue `update.conflicts`，并在 `details.conflictCount` 中记录 conflict count；不要把每个 conflict 复制为独立 command-level issue。
  - [ ] `CommandResult.status` 为 `failure`，exit code non-zero；human-readable output 不展示 ready/release-ready summary，必须展示 conflict reason、affected path、ownership 和 suggested manual action。
  - [ ] `operation-lock.project-locked` 等 pre-planning blocker 不得放进 `data.conflicts`，也不得输出 update plan 假装 planning 完成。
  - [ ] Partial write failure 必须列出 completed mutations 与 blocking issue/conflict，不得声称 transaction rollback；recovery 指向 `validate`、normal `update` 或 explicit `update --repair`，视 owning SPEC 语义而定。

- [ ] Task 6: 明确 `update --repair` fixture handoff 与更新顺序（AC: 9）
  - [ ] 本 Story 默认不实现 `update --repair` release gate fixture；普通 `existing-install-update` fixture 不得包含 `RepairPlan` expected output，不得调用 `speclite update --repair`，不得把 repair actions 混入 `UpdatePlan.actions`。
  - [ ] 在 fixture README、test naming 或 release gate registry 中明确记录：repair 行为由显式 `update --repair` fixture handoff 给 Story 6.3 / 6.4 承接，除非本 Story 被重新授权新增单独 `update-repair-*` fixture。
  - [ ] 若实现期间必须覆盖 repair，必须创建显式 `update --repair` fixture 或 sub-scenario，command id 必须是 `update.repair`，data 必须是 `RepairCommandData`，且 repair actions 只能覆盖 installer-owned paths。
  - [ ] 无论 repair 归属本 Story还是后续 Story，都必须遵守更新顺序：先更新 owning SPEC，再更新 executable schema/parser/comparator，最后更新 fixture snapshots。不得先改 snapshots 反推 repair contract。
  - [ ] Repair expected outputs 的后续 handoff 必须说明：normal update conflict expected outputs 先稳定，repair fixture 在此基础上只验证 explicit repair eligibility、expectedHash、restore-canonical/regenerate、missing-source-evidence 和 protected human/workflow paths。

- [ ] Task 7: Deterministic comparison 与 release gate classification（AC: 1-9）
  - [ ] 使用 Story 6.1 的 `src/fixtures/fixture-contract.ts` 或等价 anchor 识别 `fresh-install-empty-project` 与 `existing-install-update` 为 fixture project release gates。
  - [ ] Command JSON、manifest/index snapshots 和 validation issue sets 必须 parse 后 semantic comparison，不比较 raw pretty-printed bytes。
  - [ ] Stable outputs 中不得出现 absolute paths、home directories、drive letters、OS-specific separators、timestamps、random ids、process ids、environment variables、credentials、cache paths、temporary paths、stack traces、duration、elapsed time、p95 measurement 或 profiling sample。
  - [ ] Public arrays 使用 owning SPEC 排序规则：`ideTargets` / `checkedTargets` 遵守 canonical target order `claude`、`agents`；`updatePlan.actions`、`conflicts`、`changedPaths`、`skippedPaths` 按 normalized path 与 contract-defined key 排序。
  - [ ] Human-readable snapshots 覆盖 Compact / Evidence / Structured representative profiles，且 `NO_COLOR`、non-TTY、CI 和 narrow terminal `<80` fallback 不丢失 severity、issueId、affectedPath、targetId、entryPath、next action、planned effect、conflict reason 或 artifact metadata。

- [ ] Task 8: 编写 focused tests 与 CI matrix hooks（AC: 1-9）
  - [ ] Unit tests 覆盖 fixture registry、release gate classification、ReadyCheck gating、generated tree comparison、manifest/index parser wiring、CommandResult parser wiring 和 update conflict projection。
  - [ ] Integration / fixture tests 覆盖 `fresh-install-empty-project` success、fresh install controlled failure、`existing-install-update` success with planned installer-owned update、human-owned unchanged、workflow-owned unchanged 和 installer-owned drift conflict。
  - [ ] Negative tests 覆盖 ready summary premature display、release-ready summary on failure、human-owned rewrite、workflow artifact deletion/reorder、silent installer-owned drift overwrite、repair action accidentally appearing in normal update output。
  - [ ] Tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、remote provenance service 或外部网络。
  - [ ] CI/release evidence 应准备 Node 22 和 Node 24 matrix。可使用 `actions/setup-node` with explicit `node-version: ${{ matrix.node }}`，matrix 仅覆盖 SpecLite MVP baseline `[22, 24]`，不要加入 Node 26 作为 MVP baseline。

- [ ] Task 9: 本地验证与交付边界（AC: 1-9）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 affected fixture contract、fresh install fixture、existing update fixture、diagnostics output、manifest/index parser、CommandResult parser、path normalization 和 update conflict tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass，不要跳过 conflict/protection/ReadyCheck tests，不要创建 private JSON shape。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-5、Story 6.1、Story 6.3-6.5、Epic 7、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 6.3 source-integrity full sub-case matrix、Story 6.4 runtime/path matrix 或 Story 6.5 skill-artifact-loop。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，root TypeScript CLI scaffold、status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation ordering anchors 已存在。root `fixtures/`、Epic 4 update/repair behavior、Epic 5 source-integrity behavior、Story 6.1 fixture contract 和本 Story release gates 仍需按当前源码逐项确认。
- Story 3.5 command JSON contract 已存在，是 `fresh-install-empty-project` / `existing-install-update` expected outputs 的基础输入之一；但 Epic 3 没有证明 full canonical install/update fixture coverage。实现 Story 6.2 前必须验证 Epic 1-5 与 Story 6.1 的 actual source anchors、tests 和 fixture assets 是否已经真实创建。
- 当前 worktree 已有用户或其它流程产生的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Story 1-5 / 6.1 files。实现本 Story 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是 initialized placeholder，没有补充新的 implementation guardrails。实际 implementation guardrails 以 live PRD、Architecture、UX、owning SPEC、readiness report 和本 Story 为准。
- 最近 5 个 commit 均为 docs/context/source/glossary/specs 方向，没有可复用的 TypeScript implementation commit pattern。Dev agent 必须读取实际源码与 tests，不得从 docs commits 推断实现已经存在。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能指向不含 `tomllib` 的旧 runtime。
- 本 Story 是 ready-for-dev story context。它描述 dev agent 应如何实现、验证和守住边界；它不是 `fresh-install-empty-project`、`existing-install-update`、fixture runner、expected outputs 或 tests 已存在的证明。

### Scope Boundary（范围边界）

- 本 Story 负责：`fresh-install-empty-project` release gate、`existing-install-update` normal update release gate、ReadyCheck / ready summary gating、generated tree / manifest / IDE mirror expected outputs、human-owned custom preservation、workflow-owned artifact preservation、installer-owned drift conflict、failure step output、deterministic snapshots 和 repair fixture ownership handoff。
- 本 Story 消费：Story 6.1 的 fixture layout、expected output class registry、semantic comparison、human-readable profile assertions、release gate classification；Story 5.5 的 source descriptor trust/redaction closure；Story 4.3/4.4/4.6 的 plan-before-write、operation lock、safe write、normal update conflict 和 explicit repair boundary；Story 3.5 的 `CommandResult` / `ValidationIssue` contract；Story 3.2 的 manifest/index schema；Story 1.6 的 install progress / ready summary behavior。
- 本 Story 不负责：Story 6.3 `source-integrity` full required sub-case matrix、`ide-drift` fixture、`resolve-parity` full behavior；Story 6.4 Node/macOS/Windows path-portability matrix、runtime/p95 evidence、packaging acceptance completion；Story 6.5 `skill-artifact-loop` end-to-end；Post-MVP `doctor` / `sync` / `uninstall`、top-level `repair`、backup/restore、coverage dashboard 或 enterprise integration workflow。
- 本 Story 不修改 owning SPEC。若实现中发现 fixture contract、CommandResult、manifest/index、install plan、taxonomy 或 repair semantics 需要变更，必须先提出并更新 owning SPEC，再更新 executable schema/parser/comparator，最后更新 fixture expected outputs。
- 普通 `existing-install-update` fixture 不得把 `update --repair` 行为混入 normal update。Repair coverage 必须通过明确的 handoff 或显式 separate fixture 承接。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node 26 当前为 Current，不进入 MVP baseline。不要使用 Node 24-only API，除非提供 Node 22-compatible path 并同步 runtime policy、fixtures 和 release matrix。
- CLI foundation 仍是 TypeScript + commander。不要为 fixture runner、snapshot helper、ReadyCheck assertion 或 update fixture 引入 oclif/yargs/cac/clipanion。
- Storage model 是 filesystem-first/local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent fixture cache server 或 background process。
- `src/fixtures/fixture-contract.ts` 或等价 anchor 负责 fixture manifest parsing、layout validation、expected output classes、comparison policy 和 release gate classification。它不得重新定义 CommandResult、manifest/index、ValidationIssue、adapter registry、install plan 或 update/repair semantics。
- `src/diagnostics/output.ts` 拥有 Compact、Evidence、Structured profiles。Fixture assertions 应驱动 shared renderer，而不是允许各 command 手写 output。
- `src/fs/path-normalizer.ts` 是 project-relative POSIX path、path escape、symlink escape、case conflict 和 redaction-safe path display 的共享边界。Fixture helper 不得复制第二套路劲逻辑。
- `src/diagnostics/command-result-schema.ts` 是 `CommandResult` / `ValidationIssue` parser anchor；`src/manifest/manifest-schema.ts` 是 manifest/index parser anchor；`src/installer/install-plan-schema.ts` 是 install/update planning anchor；`src/ide/adapter-registry.ts` 是 target id/order anchor。
- `validation/` 只读取 state 并产生 issues，不修复。普通 `update` 对 installer-owned drift 产生 conflict；只有 explicit `update --repair` 可以按 owning SPEC 修复可安全 repair 的 installer-owned drift。

### Implementation Anchors（实现锚点）

实际文件名应贴合已经落地的实现。如果文件尚不存在，应按架构边界创建；如果文件已经存在，修改前必须完整读取并保留既有 behavior。

- `test/fixtures/fresh-install-empty-project/`：fresh install release gate fixture input、expected file tree、manifest/index snapshots、command JSON、human-readable output assertions 和 README。
- `test/fixtures/existing-install-update/`：existing update normal update release gate fixture input、expected update plan、changed/skipped/conflict paths、protected file assertions 和 README。
- `src/fixtures/fixture-contract.ts`：fixture manifest parsing、layout validation、expected output classes、release gate classification。
- `src/fixtures/fixture-runner.ts` 或 `test/fixtures/fixture-runner.ts`：执行 fixture case、收集 actual outputs、调用 comparators；不得拥有 field-level contract truth。
- `src/fixtures/comparators/json.ts` 或等价 helper：CommandResult semantic comparison、non-stable field normalization 和 stable ordering checks。
- `src/fixtures/comparators/file-tree.ts` 或等价 helper：generated tree comparison、raw-byte hash、installer-owned hash assertions、human/workflow-owned unchanged checks。
- `src/fixtures/comparators/human-output.ts` 或等价 helper：Compact/Evidence/Structured profile assertions、no ANSI、terminal width fallback、text equivalent checks。
- `src/installer/progress-events.ts`：stable install lifecycle `stepId`。
- `src/installer/ready-summary.ts`：ReadyCheck-gated ready summary rendering and data assembly。
- `src/commands/install.ts`、`src/installer/install-runner.ts`：fresh install orchestration, SourceResolutionPlan -> InstallPlan -> write/apply -> CommandResult projection。
- `src/commands/update.ts`、`src/update/update-plan.ts`、`src/update/conflict-detector.ts`、`src/update/apply-update.ts`：normal update planning、conflict detection、protected files、actual apply results。
- `src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`：public JSON envelope、status/exit code, issue ordering, human-readable profiles。
- `src/manifest/manifest-schema.ts`、`src/manifest/manifest-generator.ts` 或等价 files-index helper：manifest/index snapshots, file ownership/hash projection。
- `src/ide/adapter-registry.ts`、`src/ide/target-writer.ts`：canonical target order `claude`, `agents` and generated IDE mirror entries。
- `src/fs/path-normalizer.ts`、`src/fs/safe-write.ts`：project-relative POSIX paths, redaction, safe writes。

### Fresh Install Fixture Requirements（Fresh Install Fixture 要求）

- Fixture id 必须是 `fresh-install-empty-project`，release gate classification 为 fixture project gate。
- Input project 必须为空项目或最小项目，不携带 current repo planning artifacts、source checkout paths、cache paths、temporary paths 或 external network dependency。
- Generated tree expected outputs 至少覆盖：
  - `_speclite/`
  - `_speclite/_config/manifest.yaml`
  - `_speclite/_config/skill-index.json`
  - `_speclite/_config/help-index.json`
  - `_speclite/_config/files-index.json`
  - `_speclite/_config/phase-coverage.json`
  - `_speclite-output/`
  - `.claude/skills/<canonicalSkillId>/`
  - `.agents/skills/<canonicalSkillId>/`
- Manifest/index snapshots 必须使用 schema versions：`speclite.manifest.v1`、`speclite.skill-index.v1`、`speclite.help-index.v1`、`speclite.files-index.v1`、`speclite.phase-coverage.v1`。
- IDE targets 使用 physical target ids：`claude` -> `.claude/skills`，`agents` -> `.agents/skills`。不得输出 branded `copilot`、`cursor` target id 或 branded readiness。
- Ready summary 只在 `ReadyCheck` 成功后出现；failure output 必须列出 completed steps、failed step、pending steps 和 manual action。
- Expected outputs 必须覆盖 parsed `install --json`，human-readable Evidence profile，必要时覆盖 Compact/Structured representative assertions。
- All path fields 使用 project-relative POSIX-style paths；`data.paths.projectRoot` 必须是 `"."`。
- Stable comparison 只 normalize schema-declared non-stable timestamps；不得容忍 random ordering、absolute path、home directory、drive letter、OS separator、cache/temp path、duration 或 stack trace。

### Existing Update Fixture Requirements（Existing Update Fixture 要求）

- Fixture id 必须是 `existing-install-update`，release gate classification 为 fixture project gate。
- Input installed state 必须包含：
  - installer-owned baseline files，可安全 planned update 的 installer-owned target。
  - human-owned custom files，例如 `_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 或等价 custom path。
  - workflow-owned artifacts，例如 `_speclite-output/` 下的 Markdown artifact、metadata sidecar 或 artifact directory metadata。
  - installer-owned drift case，用于验证 normal update conflict。
- 普通 `speclite update` expected outputs 必须使用 `CommandResult<UpdateCommandData>`。`UpdateCommandData` required fields 是 `updatePlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation` 和 `writeAuthorized`。
- `updatePlan.actions` 描述 planned effects，不是 execution log；`changedPaths` / `skippedPaths` 只描述 actual apply result。当 `writeAuthorized === false` 时，即使 plan 含真实 planned actions，`changedPaths` 和 `skippedPaths` 也必须为空。
- Human-owned custom 文件不得 overwrite、rewrite、reformat、normalize 或 delete；如果出现在 plan 中，必须是 protected skip / unchanged assertion。
- Workflow-owned artifacts 不得 overwrite、delete、reorder 或被 repair/update 当作 installer-owned changed path；artifact metadata presence 和 content unchanged 必须可断言。
- Installer-owned drift 在 normal update 中必须进入 `conflicts[]`，reason 为 `installer-owned-drift`；普通 update 的 confirmation 或 `--yes` 不得把 drift conflict 转成 repair action。
- `conflicts.length > 0` 时 `CommandResult.status` 为 `failure`，exit code non-zero，`issues` 包含 command-level `update.conflicts` issue，`details.conflictCount` 与 conflict count 一致。
- Failure human output 不得展示 ready/release-ready summary；必须展示 conflict reason、affected path、ownership、completed/failed/pending step state 和 suggested manual action。

### Repair Fixture Ownership Note（Repair Fixture 归属说明）

- 本 Story 明确选择：普通 `existing-install-update` fixture 不覆盖 `update --repair` execution。它只验证 normal update 对 installer-owned planned update、human-owned custom 文件、workflow-owned artifacts 和 installer-owned drift conflict 的行为。
- `update --repair` fixture 的归属作为 explicit repair fixture handoff 给 Story 6.3 / 6.4。后续 story 必须在 expected outputs 中独立覆盖 `CommandResult<RepairCommandData>`、`command: "update.repair"`、`repairPlan.actions`、installer-owned-only repair eligibility、`expectedHash`、`restore-canonical` / `regenerate`、missing source evidence conflicts 和 human/workflow protected paths。
- 如果 dev agent 在本 Story 实现期间发现 release gate 必须立即覆盖 repair，必须先取得明确授权并创建 separate explicit `update --repair` fixture；不得把 repair assertions 塞进 `existing-install-update` normal update fixture。
- 启动 Epic 6 repair coverage 时必须遵守 contract-first update order：owning SPEC -> executable schema/parser/comparator -> fixture snapshots。Snapshot updates 不得单独定义或漂移 repair behavior。

### Testing Requirements（测试要求）

- Use Vitest。
- Fixture tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、remote provenance service 或外部网络。
- Fresh install tests 覆盖 success generated tree、ReadyCheck success ready summary、ReadyCheck failure no ready summary、manifest/index snapshots、IDE target order、project-relative POSIX paths 和 repeated run determinism。
- Existing update tests 覆盖 normal planned installer-owned update、human-owned unchanged、workflow-owned unchanged、installer-owned drift conflict、dry-run / not-authorized apply separation、failure output no ready/release-ready summary。
- JSON tests 必须 parse 后断言 semantic fields、ordering、path normalization、timestamp policy 和 redaction policy。
- Human-readable tests 必须覆盖 Evidence profile、Compact/Structured representative assertions、`NO_COLOR`、non-TTY、CI、terminal width `<80` / `80-119` / `>=120`、no ANSI、text equivalent 和 key-value fallback。
- Negative tests 必须覆盖 absolute path leak、home directory leak、Windows drive letter leak、OS separator leak、timestamp leak、random id leak、process id leak、environment value leak、stack trace leak、human-owned overwrite、workflow artifact deletion/reorder、normal update silently repairing drift。
- Snapshot / fixture update tests 必须证明 CI 下 mismatch、missing 或 obsolete snapshots fail；CI 不写 snapshots。Local snapshot update 只能在 owning SPEC 与 executable parser/schema 更新之后执行。
- Cross-platform path tests 应至少在 normalizer 层覆盖 macOS / Windows semantics；完整 OS matrix evidence 由 Story 6.4 承接。
- Tests 不得把 current repo `_bmad`、`_bmad-output` 或 story files 当作 installed target fixture state。

### Previous Story Intelligence（前序 Story 情报）

- Story 6.1 已建立 fixture contract foundation：stable lower-kebab layout、expected output classes、semantic comparison、path/timestamp/randomness policy、Compact/Evidence/Structured output profiles、release gate vs regression asset classification。Story 6.2 必须复用这些 anchors，不得在 fixture cases 中定义第二套 comparison truth。
- Story 6.1 明确 `fresh-install-empty-project` 与 `existing-install-update` 是 release gate fixture project cases，并要求 release gate fixtures 在 MVP release 前提供 Node 22/24 evidence；Story 6.2 应实现这两个具体 gate 的 focused expected outputs。
- Story 6.1 的 human-readable output policy 要求 narrow terminal fallback 保留 severity、issueId、affectedPath、targetId、entryPath、next action、planned effect、conflict reason 和 artifact metadata；Story 6.2 的 install/update output fixture 必须继承。
- Story 5.5 强调 source reporting/redaction：credential、credential-bearing URL、private query string、home directory、absolute local path、drive letter、cache path、temporary extraction path、temporary Git checkout 和 raw stderr/stack trace 不得进入 public JSON、manifest/index、human-readable output 或 fixture snapshots。
- Story 4.6 的 repair boundary 对本 Story 很关键：normal `update` 遇到 installer-owned drift 必须 conflict；只有 explicit `update --repair` 可修复可安全恢复或重建的 installer-owned drift，且 repair 不覆盖 human-owned 或 workflow-owned paths。
- Story 4.3 / 4.4 的 plan-before-write、operation lock、safe write 和 partial failure diagnostics 决定 update failure output。Pre-planning lock blocker 不得输出 update plan / conflicts；partial failure 不得声称 rollback。
- Story 3.5 的 `CommandResult` / `ValidationIssue` contract 是 `install --json` 和 `update --json` fixture comparison 的唯一 public JSON truth。
- Readiness report 2026-05-26 的 Minor Concern #3 指出 Story 6.2 原 AC 中 “repair 行为由显式 `update --repair` fixture 或后续 fixture 覆盖” 有歧义。本 Story 已明确 normal `existing-install-update` 不覆盖 repair，并将 repair fixture ownership handoff 给 Story 6.3 / 6.4。
- Readiness report 2026-05-26 的 Recommended Next Steps #4 要求启动 Epic 6 前明确 `update --repair` fixture 归属和 expected outputs 更新顺序。本 Story 将该要求纳入 Task 6 与 Repair Fixture Ownership Note。

### Latest Technical Information（最新技术信息）

- Node.js official releases 页面在 2026-05-26 显示 Node 24 为 LTS、Node 22 为 LTS，Node 26 为 Current；同页说明 production applications should only use Active LTS or Maintenance LTS releases。SpecLite MVP 保持 Node 22 minimum + Node 24 recommended，不升级到 Node 26，不使用 Node 24-only API，除非提供 Node 22-compatible path 并同步 policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- `actions/setup-node` README 当前建议 workflows 显式指定 `node-version`，不要依赖 runner PATH 中的系统版本；Supported version syntax 示例包含 major versions `22`、`24`，并提供 matrix testing pattern。SpecLite CI/release fixture matrix 可使用 `node-version: ${{ matrix.node }}`，matrix 使用 `[22, 24]` 作为 MVP baseline。Source: https://github.com/actions/setup-node
- `actions/setup-node` README 的示例 matrix 包含 `[20, 22, 24]`，但 SpecLite 不应因此重新纳入 Node 20；当前 owning Architecture 已排除 Node 20 并声明 Node 22/24 policy。CI implementation 应显式收敛到 project policy，而不是复制通用示例。
- No new third-party dependency is required by default. 如需新增 fixture runner、snapshot helper、path comparator 或 CLI output testing dependency，必须先确认 Node 22 support、offline determinism、cross-platform path behavior、redaction behavior 和 CI failure semantics。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, readiness report, owning SPEC artifacts and this Story.
- Project-level language rule remains: conversation and generated docs in Chinese, section headings use `English（中文）`, technical identifiers remain English.

### References（参考资料）

- `_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/architecture/index.md`
- `_bmad-output/planning-artifacts/architecture/01-project-context-analysis项目上下文分析.md`
- `_bmad-output/planning-artifacts/architecture/02-starter-template-evaluationstarter-模板评估.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-26.md`
- `_bmad-output/implementation-artifacts/6-1-fixture-case-layout-and-expected-output-contract.md`
- `_bmad-output/implementation-artifacts/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md`
- `_bmad-output/project-context.md`
- Node.js releases: https://nodejs.org/en/about/previous-releases
- GitHub `actions/setup-node`: https://github.com/actions/setup-node

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

TBD by dev agent.

### Debug Log References（调试日志引用）

TBD by dev agent.

### Completion Notes List（完成备注列表）

- Story context created by bmad-create-story sub-agent for Story 6.2 only.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- This story is ready-for-dev context, not implementation completion evidence.
- Repair ownership ambiguity from readiness report Minor Concern #3 is resolved by keeping normal `existing-install-update` separate from explicit `update --repair` fixture handoff.

### File List（文件列表）

TBD by dev agent.
