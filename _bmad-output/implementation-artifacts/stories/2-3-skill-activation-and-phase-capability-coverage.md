# Story 2.3: Skill Activation And Phase Capability Coverage（Skill 激活与阶段能力覆盖）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为 AI IDE 使用者，  
我希望从已映射的 IDE entry 中选择并激活 SpecLite skills，  
以便按照 SPEC、方案评审、故事规划、实现、测试和审查等研发阶段推进工作。

## Acceptance Criteria（验收标准）

1. **Mapped IDE entry activates the canonical self-contained skill（已映射 IDE entry 激活 canonical 自包含 skill）**  
   **前提** `.claude/skills/<canonicalSkillId>/` 或 `.agents/skills/<canonicalSkillId>/` 中存在 Story 2.2 生成的 mapped self-contained skill entry，且 Story 2.1 discovery metadata 与 Story 2.2 target mapping 已真实实现；  
   **当** 用户在 AI IDE 中选择该 entry；  
   **则** IDE 可以加载对应 self-contained skill package；  
   **并且** activation target 必须指向 installed entry 中该 canonical skill 的 `SKILL.md` 或 owning SPEC 明确允许的等价入口；  
   **并且** activation 不得依赖 source checkout、archive planning docs、display name、menu label、IDE-specific alias 或 hard-coded absolute path。

2. **Activation target is stable, project-relative and unique（激活目标稳定、项目相对且唯一）**  
   **前提** 系统从 help index、skill index、phase coverage 或 target mirror 中解析 activation target；  
   **当** 解析 `.claude/skills` 或 `.agents/skills` entry；  
   **则** 每个 help/menu/phase entry 必须解析到且仅解析到一个 installed canonical skill entry；  
   **并且** `entryPath` 与 `activationTarget` 必须是 project-relative POSIX path，例如 `.claude/skills/<canonicalSkillId>/SKILL.md`；  
   **并且** 不得输出 checkout absolute path、home directory、temporary path、cache path、drive letter、OS-specific separator 或 source package path 作为 installed activation target。

3. **Minimum phase coverage exposes key SDLC capabilities（最小阶段覆盖暴露关键研发能力）**  
   **前提** 用户需要执行 SPEC、方案评审、故事规划、实现、测试或审查阶段能力；  
   **当** 系统生成或读取 MVP 最小阶段覆盖矩阵；  
   **则** 每个关键阶段都会显示是否存在 mapped skill entry；  
   **并且** 每个可检查 entry 至少包含 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`ideTargets[].targetId`、`ideTargets[].entryPath`、`ideTargets[].activationTarget` 和 `ideTargets[].status`；  
   **并且** rows 必须使用 `speclite.phase-coverage.v1` shape，并按 `phaseId`、`moduleId`、`canonicalSkillId` 稳定排序。

4. **Missing coverage is explicit and cannot be faked（缺失覆盖必须显式且不可伪造）**  
   **前提** 某个关键阶段没有 mapped skill entry，或某个 selected target 无法表示该 entry；  
   **当** 用户、validator 或 fixture 查看阶段覆盖结果；  
   **则** 系统会清晰表达该阶段未覆盖、`unsupported`、`failed` 或 no mapped target；  
   **并且** 不得使用 alias-only identity、IDE-specific identity、display-only row、empty generated skill、copilot/cursor branded target 或 command pointer placeholder 伪造覆盖；  
   **并且** validation 必须使用 reserved issue ids，例如 `menu-target.no-mapped-target`、`menu-target.missing-target`、`menu-target.ambiguous-target` 或 `menu-target.unknown-skill`。

5. **Skill activation follows the installed `SKILL.md` activation protocol（Skill 激活遵守已安装 `SKILL.md` 协议）**  
   **前提** 用户从 IDE entry 激活某个 skill；  
   **当** skill 的 activation protocol 开始执行；  
   **则** 运行上下文必须来自 installed self-contained package 的 `SKILL.md` 和其相邻 copied resources；  
   **并且** 如果该 skill 需要读取 config/customization，必须通过 `speclite resolve config` 或 `speclite resolve customization` runtime support command，而不是在 skill、adapter 或 renderer 中手写第二套 merge logic；  
   **并且** Story 2.3 不实现 Story 2.4 的 resolver 行为，只验证 activation entry 与未来 resolver access 的边界；  
   **并且** resolver success / installed reverse validation 的 release gate 明确推迟到 Story 2.4 或 Story 2.5，Story 2.3 fixture 不得伪造 resolver success。

6. **Phase coverage uses adapter registry target semantics（阶段覆盖使用 adapter registry target 语义）**  
   **前提** 阶段覆盖矩阵被写入 manifest/index、被 human-readable output 展示或被 validation/fixture 读取；  
   **当** 系统处理 target rows；  
   **则** target order 必须为 `claude` 后 `agents`，并复用 `src/ide/adapter-registry.ts` 的 canonical order；  
   **并且** installed phase coverage target status 只能使用 `mapped`、`unsupported`、`failed`；  
   **并且** 不得混用 install planning 的 `planned` / `unsupported` / `failed` 或 status summary 的 `not-configured` / `configured` / `partial` / `failed`。

7. **CLI output presents phase coverage as evidence, not a dashboard（CLI 输出把阶段覆盖作为证据而非仪表盘）**  
   **前提** human-readable output、ready summary、status 扩展输出或 validate output 展示 phase coverage；  
   **当** 用户查看覆盖结果；  
   **则** 输出应以 Evidence profile 展示 phase、target、entry path、activation target 和 status；  
   **并且** 窄终端可降级为 key-value block，`NO_COLOR`、non-TTY 和 CI 中仍可理解；  
   **并且** MVP 不实现 coverage percentage、trend、team dashboard、multi-project rollup、Post-MVP governance report 或 branded Copilot/Cursor readiness。

8. **Focused tests and fixtures prove activation and phase coverage（聚焦测试与 fixture 证明激活和阶段覆盖）**  
   **前提** Story 2.3 修改 activation target parsing、phase coverage reader/projection、menu-target validation、output renderer 或 fixtures；  
   **当** 开发者完成实现；  
   **则** 必须补充 unit、integration 和 fixture assertions，覆盖 installed entry loadability、activation target uniqueness、project-relative POSIX paths、canonical target order、status vocabulary、missing/no-mapped target diagnostics、no alias-only identity、no source-checkout dependency 和 no branded target ids；  
   **并且** tests 必须 local-only、deterministic、parse JSON/manifest/index semantically，不访问 npm registry、Git remote、private registry、offline bundle origin 或外部网络。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置 stories 与当前仓库实现状态（AC: 1-8）
  - [ ] 确认 Story 1.1-1.6 已真实实现，而不只是 story context 处于 `ready-for-dev`：需要存在 `package.json`、`src/`、`test/`、`src/diagnostics/command-result-schema.ts`、`src/manifest/manifest-schema.ts`、`src/manifest/skill-index.ts`、`src/manifest/help-index.ts`、`src/manifest/files-index.ts`、`src/manifest/phase-coverage.ts`、`src/ide/adapter-registry.ts`、`src/ide/target-writer.ts`、`src/config/resolve-output-schema.ts` 和 fixture harness。
  - [ ] 确认 Story 2.1 已真实提供 discovery metadata、canonical capability identity、help index identity boundary、phase coverage generator 和 optional artifact contract projection。
  - [ ] 确认 Story 2.2 已真实提供 `.claude/skills/<canonicalSkillId>/` 与 `.agents/skills/<canonicalSkillId>/` self-contained entry mapping、target writer、target status projection、files index installed entry projection 和 canonical package hash stability。
  - [ ] 如果上述实现 anchors 仍不存在，停止 Story 2.3 实现，先完成前置 stories；不得在 Story 2.3 中重建 CLI scaffold、source discovery、manifest generator、target writer 或 resolver。
  - [ ] 检查当前 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [ ] Task 2: 收口 activation target parser 与 installed entry resolver（AC: 1, 2, 5）
  - [ ] 在 `src/manifest/manifest-schema.ts` 或 existing phase coverage schema helper 中定义/复用 activation target field validation；该 module 是 manifest/index executable anchor，不得在 renderer、adapter 或 test helper 中定义第二份 target shape。
  - [ ] 在 `src/manifest/help-index.ts`、`src/manifest/skill-index.ts`、`src/manifest/phase-coverage.ts` 或等价模块中提供 resolver，确保 help/menu/phase entry 只能解析到一个 installed canonical skill entry。
  - [ ] `activationTarget` 必须指向 installed package entry，例如 `.claude/skills/<canonicalSkillId>/SKILL.md` 或 `.agents/skills/<canonicalSkillId>/SKILL.md`；不得指向 `assets/source/speclite/.../SKILL.md`。
  - [ ] 当 `SKILL.md` 缺失、entry path 不存在、target path ambiguous 或 target status 非 mapped 时，不得 fallback 到 source checkout，也不得通过 display label 猜测目标。
  - [ ] 若 implementation 需要提供 helper type，可使用 `InstalledSkillActivationTarget` 或等价命名，但必须以 owning SPEC 字段为准。

- [ ] Task 3: 生成/读取 MVP 最小阶段覆盖矩阵（AC: 3, 4, 6）
  - [ ] 复用 Story 2.1 的 discovery metadata 与 Story 2.2 的 installed target facts 生成 `speclite.phase-coverage.v1` rows；不得重新扫描 IDE directories 来发明 canonical skill identity。
  - [ ] 覆盖 SPEC、方案评审、故事规划、实现、测试和审查等关键研发能力；每项能力必须映射到至少一个 source-defined `canonicalSkillId`，例如来自 `assets/source/speclite/*/module-help.csv` 的 `skill` column。
  - [ ] 使用 Story 2.1 定义的 MVP minimum phase-to-skill coverage fixture table 作为唯一关键阶段映射来源；不得在 renderer、validator、fixture snapshot 或 activation helper 中硬编码第二套映射。
  - [ ] 对 table 中 required `canonicalSkillId` 缺失、source package 缺失或没有 mapped target 的场景，保持 missing row / reserved diagnostic 可见；不得用 optional / anytime skill 伪造关键阶段覆盖。
  - [ ] `phaseId` 与 `phaseLabel` 的映射必须集中在 manifest/phase coverage generation 或 source metadata helper 中；不得在 renderer、validator 或 fixture snapshot 中硬编码第二套映射。
  - [ ] Rows 按 `phaseId`、`moduleId`、`canonicalSkillId` 排序；`ideTargets[]` 按 `claude`、`agents` 排序。
  - [ ] 缺失 mapped entry 时，必须表达 no mapped target 或 layer-correct `unsupported` / `failed`，不能把 `anytime`、display-only menu row 或 optional core skill 当成关键阶段覆盖的替代。

- [ ] Task 4: 接入 menu-target validation 和 diagnostics（AC: 2, 4, 8）
  - [ ] 在 `src/validation/rules/menu-target.ts` 或 existing validation rule 中检查 help index、skill index、phase coverage rows 与 installed entries 的一致性。
  - [ ] 对 missing activation target 使用 `menu-target.missing-target`；对多个 installed entries 匹配同一 target 使用 `menu-target.ambiguous-target`；对 unknown canonical skill id 使用 `menu-target.unknown-skill`；对 phase coverage row 没有 mapped target 使用 `menu-target.no-mapped-target`。
  - [ ] 对 IDE mirror entry 缺失、hash drift、duplicate entry 或 target write failure，继续使用 `ide-mirror.*` issue ids；不要把 mirror file drift 误报为 generic menu target 问题。
  - [ ] Diagnostics details 只能包含 stable、redaction-safe fields；不得把 path、target、skill id、hash、timestamp 或 random id 拼进 issue id。
  - [ ] Human-readable output 可以解释缺失阶段，但 automation 依赖必须进入 `ValidationIssue`、manifest/index 或 fixture outputs。

- [ ] Task 5: 让 activation protocol 起点可被 fixture 验证（AC: 1, 5, 8）
  - [ ] 在 `test/fixtures/skill-artifact-loop/` 或相关 fixture 中加入最小 activation entry discovery assertion：给定 installed `.claude/skills` 或 `.agents/skills` entry，可以定位 `SKILL.md` 并读取其 activation protocol 起点。
  - [ ] Fixture 不需要由 LLM 实际执行完整 workflow 文案，也不验证人工评审质量；MVP release gate 只验证 installed IDE entry discovery、activation protocol、resolver access 边界和 artifact metadata 值域。
  - [ ] 如果 Story 2.4 resolver 尚未实现，Story 2.3 的 fixture 应明确只覆盖 activation entry 与 resolver invocation boundary，不伪造 resolver success，也不要求 `speclite resolve` 读取 config/customization 成功。
  - [ ] 如果 Story 2.5 artifact metadata 尚未实现，Story 2.3 不得生成 workflow artifact sidecars 或 metadata validation logic；只保留对 `artifactContract` 字段的读取/传递边界。
  - [ ] Tests 必须证明 installed entry 不需要 source checkout 文件作为 runtime dependency。

- [ ] Task 6: 暴露 phase coverage evidence，保持 CLI/control-plane UX（AC: 3, 4, 7）
  - [ ] 在 `src/diagnostics/output.ts` 或 existing renderer 中复用 Evidence profile 展示 phase coverage matrix；renderer 只能消费 semantic model，不得重新计算 coverage。
  - [ ] 默认字段顺序为 phase、module、canonicalSkillId、targetId、entryPath、activationTarget、status；窄终端可降级为 key-value block。
  - [ ] `agents` target 显示为 `.agents/skills` 或 agents directory target，不渲染为 Copilot/Cursor readiness。
  - [ ] 缺失/unsupported/failed rows 必须带 next action 或 suggested remediation，例如运行 `speclite validate`、检查 installed entry 或重新运行 install/update repair；不得用空表格表达缺口。
  - [ ] 不新增 GUI、HTML mockup、dashboard、coverage percentage、trend report 或 enterprise rollup。

- [ ] Task 7: 编写 focused tests、integration tests 和 fixture assertions（AC: 1-8）
  - [ ] Unit tests 覆盖 `activationTarget` path validation、project-relative POSIX normalization、no absolute/source-checkout paths、canonical `SKILL.md` target 和 target order。
  - [ ] Unit tests 覆盖 help/menu/phase entry resolver：unique match、missing target、ambiguous target、unknown skill、no mapped target。
  - [ ] Unit tests 覆盖 installed phase coverage status vocabulary：只允许 `mapped`、`unsupported`、`failed`，并拒绝 install planning/status summary enum 混用。
  - [ ] Contract tests 解析 `phase-coverage.json`、`help-index.json` 和 `skill-index.json`，断言 schema version、required fields、target order、entryPath/activationTarget、no alternate identity 和 no branded target ids。
  - [ ] Integration tests 覆盖 fresh install selected core+sdlc modules 后，关键研发阶段均可追踪到 canonical skill id 与至少一个 mapped installed target。
  - [ ] Fixture `skill-artifact-loop` 覆盖至少一个 installed IDE entry discovery、`SKILL.md` activation protocol 可读、resolver access 边界和 no source-checkout dependency。
  - [ ] Fixture `fresh-install-empty-project` 或相关 expected snapshots 更新 phase coverage evidence；stable snapshots 不包含 absolute paths、timestamps、random ids、temporary paths 或 Copilot/Cursor target id。
  - [ ] 运行 `npm run build`、`npm test`，或至少运行 Story 2.3 touched modules 的 focused Vitest tests 与相关 fixture tests。

- [ ] Task 8: 本地验证与范围控制（AC: 1-8）
  - [ ] 如新增或改变 public JSON field、manifest/index field、phase coverage field、target status、issue id、fixture comparison behavior 或 output profile，确认同一变更中先更新 owning SPEC、executable schema/parser 和 fixture expected outputs。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [ ] 检查 diff，确认没有实现 Story 2.4 config/customization resolver、Story 2.5 workflow artifact writing/metadata validation、Epic 3 full `status` / `validate` installed-state validation、Post-MVP command pointer、branded Copilot/Cursor adapter、coverage dashboard 或治理报告。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 2.3 的开发必须在 Epic 1、Story 2.1 和 Story 2.2 实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 到 `1-6-install-progress-and-ready-summary.md`、`2-1-methodology-discovery-metadata-generation.md` 和 `2-2-ide-skill-entry-mapping.md` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Story 2.1 / Story 2.2 story 文件。实现 Story 2.3 时不得格式化、重写、同步或回滚这些无关改动。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、help CSV、custom stubs、legacy Python resolver scripts 和 canonical skill packages。
- 当前 source metadata facts：
  - `assets/source/speclite/core-skills/module.yaml`
  - `assets/source/speclite/core-skills/module-help.csv`
  - `assets/source/speclite/sdlc-skills/module.yaml`
  - `assets/source/speclite/sdlc-skills/module-help.csv`
  - `assets/source/speclite/core-skills/<canonicalSkillId>/SKILL.md`
  - `assets/source/speclite/sdlc-skills/<phase-or-group>/<canonicalSkillId>/SKILL.md`
  - `assets/source/speclite/sdlc-skills/1-analysis/research/<canonicalSkillId>/SKILL.md`
- `module-help.csv` 中的 `skill` column 是 canonical skill id 引用；`display-name`、`menu-code`、`description`、IDE label 和 target directory basename 不能成为 identity source。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX 和 owning SPEC artifacts 为准。

### Scope Boundary（范围边界）

- 本 Story 只负责 IDE entry activation target 可解析性、installed self-contained skill activation 起点、MVP 最小阶段覆盖矩阵的读取/展示/验证、menu-target diagnostics、phase coverage evidence 和对应 tests/fixtures。
- 本 Story 可以扩展 Epic 1 / Story 2.1 / Story 2.2 已存在的 `src/manifest/`、`src/ide/`、`src/validation/`、`src/diagnostics/`、`src/fs/` 与 fixture anchors；不得创建平行 manifest/index generator、第二套 adapter registry、第二套 skill identity registry 或私有 config/customization resolver。
- 本 Story 不负责：
  - Story 2.1 的 discovery metadata source extraction、artifactContract source extraction 或 canonical capability identity generation。
  - Story 2.2 的 self-contained entry copy/write behavior、canonical package hash generation 或 target writer implementation。
  - Story 2.4 的 `speclite resolve config` / `speclite resolve customization` implementation、resolver success gate 或 config/customization merge behavior。
  - Story 2.5 的 workflow artifact writing、frontmatter/sidecar metadata 或 artifact validation。
  - Epic 3 的 lightweight status summary、full validate category coverage、status health aggregation 或 installed-state validation command UX。
  - Epic 6 的 full fixture matrix expansion beyond the focused assertions required here.
  - Post-MVP command pointer artifact、dedicated Copilot/Cursor adapter、coverage dashboard、trend report、team report 或 multi-project governance rollup。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists and runtime policy / fixtures are updated.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, persistent cache server or background process.
- `src/commands/install.ts` should orchestrate only. Phase coverage generation/reading belongs in `src/manifest/`; activation target and target order semantics belong in `src/ide/adapter-registry.ts` and installed projection helpers; menu target checks belong in `src/validation/rules/menu-target.ts`; public projection belongs in `src/diagnostics/`; path normalization belongs in `src/fs/`.
- All public paths in command output, issues, fixtures, manifest/index projections and tests must use project-relative POSIX-style paths unless an owning SPEC explicitly marks a field non-stable/redacted.
- Source-side truth is `assets/source/speclite/` module metadata and canonical skill packages. Installed-side truth is manifest/index projection. IDE mirrors are execution-plane projections, not source truth.

### Activation Requirements（激活要求）

Required activation facts for each mapped target entry:

```ts
type InstalledActivationEntry = {
  canonicalSkillId: string;
  moduleId: string;
  targetId: "claude" | "agents";
  entryPath: string;
  activationTarget: string;
  status: "mapped" | "unsupported" | "failed";
};
```

- Treat this shape as implementation guidance only; executable source of truth must live in `src/manifest/manifest-schema.ts`, `src/ide/adapter-registry.ts` and owning SPECs.
- `entryPath` should point to the installed skill directory, e.g. `.claude/skills/<canonicalSkillId>`.
- `activationTarget` should point to the installed `SKILL.md`, e.g. `.claude/skills/<canonicalSkillId>/SKILL.md`.
- If future adapter semantics allow an equivalent activation entry, owning SPEC must be updated before implementation uses it.
- Activation target resolution must not read `_bmad-output/planning-artifacts/archive/`, `_bmad-output/implementation-artifacts/`, source checkout files, local cache or temporary extraction directories as runtime dependencies.
- Skill-specific customization lookup key remains the installed canonical skill directory basename; adapter must not rename it.

### Phase Coverage Requirements（阶段覆盖要求）

- Phase coverage files and schema version are owned by `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`.
- Required installed-state artifact: `_speclite/_config/phase-coverage.json`.
- Required schema version: `speclite.phase-coverage.v1`.
- Each row must include `schemaVersion`、`phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`ideTargets[]` and optional `artifactContract`.
- `ideTargets[]` items must include `targetId`、`entryPath`、`activationTarget` and installed phase coverage `status`.
- Rows sort by `phaseId`、`moduleId`、`canonicalSkillId`; targets sort by `claude` then `agents`.
- MVP phase coverage is an installed-state matrix and navigation/audit evidence. It is not a coverage percentage, quality score, trend report or governance dashboard.
- Missing key-phase coverage must remain visible. Do not collapse missing phases out of the matrix if a user or validator needs to see the gap.
- The minimum key-phase mapping is owned by Story 2.1's MVP minimum phase-to-skill coverage matrix. Story 2.3 consumes that semantic mapping for activation/evidence validation; renderer、validator and fixture snapshots must not define a second mapping.
- Required rows from the shared matrix must keep their source `phaseId` and `canonicalSkillId`; optional or `anytime` skills can appear as additional rows but cannot satisfy a missing required key phase.

### Status And Diagnostics Requirements（状态与诊断要求）

- Target status must be layer-scoped:
  - Install planning: `planned`、`unsupported`、`failed`
  - Installed phase coverage: `mapped`、`unsupported`、`failed`
  - Status summary: `not-configured`、`configured`、`partial`、`failed`
- `unsupported` is a declared capability gap. It is not a write failure.
- `failed` means a target directory resolution, schema generation, write, safe write, reverse validation or activation target resolution step failed or was planned and failed.
- Use existing taxonomy where applicable:
  - `menu-target.missing-target`
  - `menu-target.ambiguous-target`
  - `menu-target.unknown-skill`
  - `menu-target.no-mapped-target`
  - `ide-mirror.missing-entry`
  - `ide-mirror.hash-mismatch`
  - `ide-mirror.duplicate-entry`
  - `ide-mirror.unsupported-target`
  - `ide-mirror.target-write-failed`
  - `runtime-path.missing-entry`
  - `runtime-path.invalid-script-path`
  - `runtime-path.legacy-resolver-path`
- Do not add free-form issue ids. If a genuinely new public diagnostic is required, update taxonomy SPEC and fixture expected outputs first.

### UX And Output Requirements（UX 与输出要求）

- SpecLite UX is terminal + local filesystem control plane, not GUI.
- Phase coverage matrix serves both phase navigation and enterprise audit. It should show phase, canonical skill id, target id, entry path, activation target and status.
- Human-readable output may use tables or key-value evidence blocks, but structured output and manifest/index files carry automation facts.
- Output must work in `NO_COLOR`、non-TTY、CI and narrow terminal contexts. Do not rely on ANSI color, icon, spinner-only progress or terminal-width-specific formatting for meaning.
- `agents` target is a generic `.agents/skills` directory target. Do not render it as Copilot/Cursor readiness.
- Empty states must be explicit, for example `No mapped skill entry for phaseId=<id>` with layer-correct status or issue id.

### Testing Requirements（测试要求）

- Use Vitest and fixture assertions. Tests must be deterministic and local-only.
- Do not access npm registry, Git remote, private registry, offline bundle origin, package-manager cache or external network.
- JSON and manifest/index tests must parse output semantically and assert required fields, ordering and absence of non-contract fields.
- Fixture snapshots must not contain absolute paths、home directories、OS-specific separators、timestamps、random ids、process ids、environment variables、credentials or stack traces.
- Any public contract change must update owning SPEC, executable schema/parser and fixture expected outputs in the same change.

### Previous Story Intelligence（前序 Story 情报）

- Story 2.1 establishes discovery metadata as canonical capability input. Story 2.3 must consume its `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、entry label、activation target and optional `artifactContract`; it must not redefine phase metadata, artifact contract semantics or alternate skill identity.
- Story 2.1 requires `canonicalSkillId` to come from source skill package or source module metadata, not IDE adapter、menu label、directory traversal order or display name. Story 2.3 must preserve that boundary when resolving activation targets.
- Story 2.1 already requires phase coverage rows to use `speclite.phase-coverage.v1`, project-relative POSIX paths and deterministic row ordering.
- Story 2.2 establishes self-contained IDE entries as installed runtime dependencies. Story 2.3 activation must load installed `.claude/skills/<canonicalSkillId>/SKILL.md` or `.agents/skills/<canonicalSkillId>/SKILL.md`, not source packages.
- Story 2.2 preserves target order `claude` then `agents`, generic `agents` semantics, no branded Copilot/Cursor target id, no command pointer artifact and canonical package hash stability. Story 2.3 must not weaken those boundaries.
- Story 1.5 planned `_speclite/_config/phase-coverage.json` as installed projection and `.claude/skills` / `.agents/skills` mirrors as execution plane.
- Story 1.6 planned ready summary evidence and phase coverage display without turning progress or spinner output into automation API.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
  - `6e3d4e4 docs(glossary): 整理术语目录与文档索引`
  - `5b2c7a4 docs(specs): 收敛 MVP 契约与实现锚点`
- `5b2c7a4` updated live SPEC contracts for CommandResult, SourceDescriptor, InstallPlan, manifest/index, IDE adapter registry, validation taxonomy and fixtures; treat live sharded docs and owning SPECs as current implementation truth.
- Do not use `_bmad-output/planning-artifacts/archive/` whole documents as live contract sources.
- Worktree was already dirty when this Story was created; implementation agents must preserve unrelated user changes.

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories: `commander@14.0.3`、`yaml@2.9.0`、`toml@4.1.1`、`csv-parse@6.2.1`、`fs-extra@11.3.5`、`zod@4.4.3`、`typescript@6.0.3`、`tsx@4.21.0`、`tsup@8.5.1`、`vitest@4.1.6` and `@types/node@22`.
- Use Node.js 22-compatible `node:fs/promises`、`node:path`、`node:crypto` and stable ECMAScript APIs. Do not introduce Node 24-only behavior.
- Do not add globbing、table rendering、prompt、validation、adapter、filesystem or terminal UI dependencies silently. If a new dependency seems necessary, justify it against Architecture, update package/test fixtures and keep Node 22 compatibility.
- External web research was not required for this Story because the implementation surface is governed by project-owned live PRD, Architecture, UX and owning SPEC contracts, and no dependency upgrade is part of the acceptance scope.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Story 2.3`]
- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Epic 2`]
- [Source: `_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md`]
- [Source: `_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md`]
- [Source: `_bmad-output/implementation-artifacts/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`]
- [Source: `_bmad-output/implementation-artifacts/1-6-install-progress-and-ready-summary.md`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 2`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 5`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#API Surface`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Methodology Discovery & Execution`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Integration Quality`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Manifest And Index Semantics`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Phase Coverage Matrix`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Journey 3: Phase-Based Skill Use & Artifact Evidence`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Scope`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Minimum Phase Coverage Matrix`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#Self-Contained Skill Entry Layout`]
- [Source: `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md#Scope`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#menu-target`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Fixture Classes`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-create-story --key workflow` failed because local `python3` lacks stdlib `tomllib`.
- `python3.12 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-create-story --key workflow` resolved workflow successfully; `workflow.on_complete` is empty.

### Completion Notes List（完成备注清单）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 2.3 created with `Status: ready-for-dev`.
- Sprint status updated: `2-3-skill-activation-and-phase-capability-coverage` from `backlog` to `ready-for-dev`.
- Scope respected: no planning artifacts, Story 2.1/2.2, Epic 1 story files, source code, or unrelated files should be changed by this create-story run.

### File List（文件清单）

- `_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md`
