# Story 11.1: Executable Artifact Root Resolution Contract（可执行 Artifact Root 解析契约）

Status: ready-for-dev

<!-- EPIC 11 strict-serial 起点。本 Story 只建立 executable resolution contract；不得提前实施 Story 11.2/11.3。 -->

## Story（故事）

作为 SpecLite runtime 与 workflow 维护者，  
我希望七类 artifact roots 通过唯一、可执行的 resolution contract 解析，  
以便 installer、manifest、validator 和 installed workflows 不会分别维护互相漂移的路径、默认值与 fallback 语义。

## Acceptance Criteria（验收标准）

1. **七类 Fields 与 Placeholders 由唯一契约管理**

   **前提** runtime config、module metadata 或 workflow 使用 artifact root；  
   **当** 解析七类 fields 与 placeholders；  
   **则** 必须支持 `core.brainstorming_artifacts` / `{brainstorming_artifacts}`，以及 `[modules.sdlc]` 下的 `analysis_artifacts`、`planning_artifacts`、`solutioning_artifacts`、`implementation_artifacts`、`devops_artifacts`、`project_knowledge` 与对应 placeholders；  
   **并且** fields、fresh defaults 与 legacy fallback 只由 `SPEC 09` 管理。

2. **Fresh Defaults 由 Resolver 统一提供**

   **前提** fresh config 尚不存在；  
   **当** resolver 计算 artifact roots；  
   **则** 必须返回以下 project-relative POSIX roots，且每项 `resolutionMode` 为 `fresh-default`：

   - `_speclite-output/0-brainstorming-artifacts`
   - `_speclite-output/1-analysis-artifacts`
   - `_speclite-output/2-planning-artifacts`
   - `_speclite-output/3-solutioning-artifacts`
   - `_speclite-output/4-implementation-artifacts`
   - `_speclite-output/5-devops-artifacts`
   - `_speclite-output/project-knowledge-base`

   **并且** command、manifest 或 workflow 不得建立与该 executable registry 竞争的第二套 canonical defaults。

3. **Existing Explicit Config 继续权威**

   **前提** existing install 已有显式 artifact root 配置；  
   **当** resolver 计算实际 root；  
   **则** 每个显式值继续权威，并标记为 `explicit-config`；  
   **并且** 不得因 canonical defaults 变化回写或改写已有配置。

4. **新增 Fields 缺失时使用兼容 Fallback**

   **前提** existing install 缺少新增 fields；  
   **当** resolver 应用兼容规则；  
   **则** `brainstorming_artifacts` fallback 到已有 `{output_folder}/brainstorming`，`analysis_artifacts` 与 `solutioning_artifacts` fallback 到已有 `{planning_artifacts}`；  
   **并且**逐 field 标记为 `legacy-compatible`，不得描述为 migration、配置损坏或 fresh default。

5. **Resolution Result 可被全部 Consumers 复用**

   **前提** root resolution 完成；  
   **当** 结果后续被 installer、manifest、validator 或 workflow 消费；  
   **则** 必须提供稳定的 `field`、`placeholder`、`resolvedRoot` 与 `resolutionMode`；  
   **并且**结果顺序确定，所有 public paths 使用 project-relative POSIX form；  
   **并且**本 Story 的完成证据是共享 API/model 与 contract tests，不要求在本 Story 把所有 consumers 切换到新投影。

6. **Project Boundary Failure 使用稳定诊断**

   **前提** 配置包含 unresolved token、path escape 或 symlink escape；  
   **当** resolver 校验 project boundary；  
   **则** 必须返回 `SPEC 07` 的稳定 `artifact-path` diagnostic；  
   **并且**不得把 escaped absolute path、home directory、drive letter、temporary/cache path 或 raw exception 投影到 public JSON、manifest/index、issue details 或 fixture snapshot。

7. **Project Knowledge 与 Public Documentation 保持分离**

   **前提** 调用方区分 Project Knowledge 与 Public Documentation；  
   **当** 解析输出语义；  
   **则** `{project_knowledge}` 表示 workflow-generated project knowledge，fresh default 为 `_speclite-output/project-knowledge-base`；  
   **并且** `docs/` 保持 Primary Public Document，不作为 fresh default、alias 或 fallback；  
   **并且** existing install 显式配置 `project_knowledge = "{project-root}/docs"` 时仍须保留并标记 `explicit-config`。

8. **Scope Boundary（范围边界）**

   本 Story 只建立 executable resolution contract，不创建目录，不生成 fresh config/manifest projection，不修改 module metadata defaults，不修改具体 workflow artifact routing，不扫描或迁移 existing artifacts，也不实现 config/artifact mismatch。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 完成 Contract Preflight 与 Kickoff Gate（AC: 1-8）
  - [ ] 读取 Story 11.1、`SPEC 09`、`SPEC 07`、IR 2026-09-02、Architecture artifact-root patterns 与 UX Artifact Evidence 要求。
  - [ ] 生成 `story-kickoff` Flow Gate；只有 frontmatter `mode: story-kickoff`、完整 `target/storyKey` 匹配且 `result` 为 `PASS` 或 `PASS_EQUIVALENT` 才进入 `in-progress`。
  - [ ] 在 Gate 中关闭 unresolved token issue-id 决策：优先在 `SPEC 07` 注册 `artifact-path.unresolved-token`；若复用既有 issue ID，必须先记录与 taxonomy 语义一致的 contract rationale，禁止实现者临场生成自由文本 ID。
  - [ ] 确认阶段边界：Story 11.1 只建立唯一 registry/resolver；现有 consumer defaults 的迁移属于 Story 11.2/11.3，不得为了字面消除全部旧投影而越界。

- [ ] Task 2: 先增加失败的 Focused Contract Tests（AC: 1-7）
  - [ ] 建立七字段/placeholder exhaustive table 与固定字段顺序断言。
  - [ ] 覆盖 fresh、all-explicit existing、missing-new-fields existing、mixed per-field mode、Project Knowledge/Public Docs separation。
  - [ ] 覆盖 `{project-root}`、Windows separators、unresolved token、`../`、absolute path、Windows drive path、internal/external symlink boundary 与 public redaction。
  - [ ] 断言 repeated resolution 结果确定一致，且 resolver 不写文件、不改 config、不创建目录。

- [ ] Task 3: 建立唯一 Artifact Root Registry 与 Result Model（AC: 1, 5, 7）
  - [ ] 在 `src/config/` 中建立唯一 registry；字段、config key、placeholder、fresh default、legacy fallback policy 与稳定顺序必须集中定义。
  - [ ] 定义 `resolutionMode` 精确枚举：`fresh-default`、`explicit-config`、`legacy-compatible`。
  - [ ] 定义逐 field result，至少包含 `field`、`placeholder`、`resolvedRoot`、`resolutionMode`；不得持久化 raw absolute path。
  - [ ] 显式输入 lifecycle context（fresh/existing）；不得仅凭某个 field 缺失猜测 install state。

- [ ] Task 4: 实现 Fresh 与 Existing Resolution Semantics（AC: 2-4, 7）
  - [ ] Fresh context 返回七个 canonical defaults 与 `fresh-default`，其中 Project Knowledge 不得回退 `docs/`。
  - [ ] Existing context 保留所有显式值并逐 field 标记 `explicit-config`，包括显式 `project_knowledge=docs`。
  - [ ] Existing context 只对新增的 `brainstorming_artifacts`、`analysis_artifacts`、`solutioning_artifacts` 应用 `SPEC 09` fallback，并标记 `legacy-compatible`。
  - [ ] 复用既有 TOML four-layer merge；不得复制 merge logic，不得回写任何 layer。

- [ ] Task 5: 复用 Project Boundary 与 Diagnostic Contract（AC: 5-6）
  - [ ] 复用或抽取现有 project-relative POSIX normalization 与 symlink boundary guard；不得创建第二套 path sanitizer。
  - [ ] unresolved/path/symlink failures 使用 kickoff 已关闭的 `SPEC 07` issue-id contract，并保持 `artifact-path` category 与 deterministic details。
  - [ ] 验证 internal symlink 仍在 project boundary 内时可继续，external symlink 必须阻断。
  - [ ] 所有失败输出不得泄露 absolute/home/temp/cache/credential-bearing path。

- [ ] Task 6: 提供 Consumer Handoff，不实施 Projection（AC: 5, 8）
  - [ ] 导出稳定 resolver API/model，供 Story 11.2 的 config/directory/manifest projection 与 Story 11.3 的 compatibility diagnostics 消费。
  - [ ] 记录 current downstream duplicate-default surfaces，但本 Story 不修改其 observable projection、fixtures 或 installed output。
  - [ ] 增加 compile-time 或 focused consumer-shape proof，证明后续 consumers 无需重新定义 field/default/fallback 即可消费结果。

- [ ] Task 7: Verification（AC: 1-8）
  - [ ] 运行 focused artifact-root resolution 与 resolve reader tests。
  - [ ] 运行受影响的 config/path validation regression tests。
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `git diff --check`，并确认 diff 未包含 Story 11.2+ scope。
  - [ ] 在进入 `review` 前运行 `story-completion` Flow Gate，并以实际 test/command 输出填写 `Anchor Evidence Summary`；不得把本 Evidence Plan 当成 verified evidence。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- `src/config/config-schema.ts` 当前只表达旧 config surface：`CORE_CONFIG_FIELDS` 没有 `brainstorming_artifacts`，`SDLC_CONFIG_FIELDS` 没有 `analysis_artifacts` / `solutioning_artifacts`，也没有统一 resolution result type。
- `src/config/config-reader.ts::resolveProjectConfig()` 当前只调用 `resolveTomlLayers()` 完成四层 TOML merge 与 key extraction，不区分 fresh/existing，也不返回 `resolvedRoot` / `resolutionMode`。
- `src/installer/config-initialization.ts` 当前维护旧 fresh defaults：Planning / Implementation / DevOps 与 `project_knowledge=docs`。Story 11.1 不改变其 observable output；Story 11.2 将消费本 Story resolver 后负责新 projection。
- `src/installer/runtime-structure.ts::createArtifactRootContext()` 当前再次维护旧 fallback/default，并只支持旧 placeholders。该面属于 Story 11.2 consumer migration，不应在 11.1 提前改目录创建。
- manifest generator 与 `assets/source/speclite/sdlc-skills/module.yaml` 仍只有旧 root context/defaults。它们是已知 downstream migration surface，不是 Story 11.1 已实现证据。
- `src/validation/rules/artifact-path.ts` 已提供 `artifact-path.escapes-project`、`artifact-path.symlink-escape`、project-relative POSIX 与 symlink boundary 语义；新 resolver 应复用或抽取共享 helper。
- `src/config/customization-reader.ts::resolveTomlLayers()` 是当前 TOML merge/provenance 实现。不得在 artifact-root resolver 中重写 base → user → team custom → user custom merge。

### Contract Decisions Required Before Development（开发前必须关闭的契约决策）

1. **Unresolved token issue ID**：`SPEC 07` 当前没有 unresolved-token 专用 reserved ID。Kickoff Gate 必须先确认新增 `artifact-path.unresolved-token`，或记录复用现有 ID 的明确 taxonomy rationale。未关闭时结果应为 `DECISION_NEEDED`，不得开始实现。
2. **Staged ownership boundary**：AC 2 的“不得维护第二套默认值”在本 Story 表示 registry/resolver 成为唯一 executable contract source；将 installer、manifest、module metadata 和 workflow consumers 切换到该 source 是 Story 11.2/11.3 的 strict-serial downstream scope。Story 11.1 不得修改 fresh installed tree、config、manifest snapshot 或 workflow routing。

### Technical Requirements（技术要求）

- Runtime baseline：Node.js 22 minimum、Node.js 24 recommended；TypeScript ESM。
- 复用当前固定依赖：`toml@4.1.1`、`zod@4.4.3`、`vitest@4.1.6`；本 Story不需要新增 runtime dependency。
- `resolvedRoot` 是 display-safe project-relative POSIX path，不包含 `{project-root}` token或 raw absolute path；filesystem I/O 前才解析到当前 target project absolute root。
- Mode 必须逐 field 记录；mixed existing config 不能只给整个 config 一个粗粒度 mode。
- Fallback 是 read/resolve compatibility，不是 migration；resolver 必须保持 pure/read-only，不写 config、不创建目录、不修改 artifact。
- 字段顺序必须稳定：Brainstorming、Analysis、Planning、Solutioning、Implementation、DevOps、Project Knowledge。
- Error producer 只能输出 owning taxonomy 已注册的 stable issue ID；details 不得含 absolute path、timestamp、stack trace 或随机值。

### Architecture Compliance（架构合规）

- Artifact root resolution 归 `src/config/` 所有；command、installer、manifest、validator 和 Skill consumer 不得各自实现第二套语义。
- Manifest/index 未来只投影 resolved roots 与 mode，不成为第二套 config 真源。
- `docs/` 保持 Public Documentation Plane；`{project_knowledge}` 是独立 Project Knowledge Plane。
- 不引入数据库、服务、后台进程或网络访问。
- 本 Story不改变 public `CommandResult` schema；若新增/调整 `ValidationIssue` ID，必须同步 `SPEC 07` 与 focused fixture assertion。

### Library And Framework Requirements（库与框架要求）

- 使用项目现有 TypeScript、Node 标准库、Zod/TOML/Vitest 组合；不得为 registry、path normalization 或 result modeling引入新包。
- 不升级 package versions；本 Story没有依赖最新外部 API 的实现需求，因此无需技术版本迁移。
- 使用 ESM `.js` import suffix、kebab-case TypeScript 文件名、PascalCase type、camelCase function/variable。

### Project Structure Notes（项目结构说明）

- 推荐新增 `src/config/artifact-root-resolver.ts` 与 `test/artifact-root-resolution.test.ts`；文件名属于 Guidance Anchor，等价的 config-owned module split 可接受。
- 预计更新 `src/config/config-schema.ts`，使 config document/type 能表达新增 fields；不得通过把新增 fields 直接加入旧 interactive prompt 列表而提前改变 Story 11.2 projection。
- 预计更新 `src/config/config-reader.ts` 或提供相邻 wrapper，使 resolver 消费 merged config/provenance；必须继续复用 `resolveTomlLayers()`。
- 如需共享 symlink boundary helper，可从 `src/validation/rules/artifact-path.ts` / `src/fs/path-normalizer.ts` 抽取，但必须保留现有 validation behavior 和 issue shape。
- Story 11.1 不应更新 `src/installer/config-initialization.ts`、`src/installer/runtime-structure.ts`、manifest projection、module metadata、Ready Summary 或 fresh-install expected snapshots，除非 kickoff 通过正式 scope decision 改变 Story 边界。

### Testing Requirements（测试要求）

- 首选新建 focused table-driven test，覆盖 7 roots × fresh/explicit/legacy/mixed modes。
- 必须覆盖 `project_knowledge` fresh 不等于 `docs`，但 existing explicit `docs` 仍保留。
- 必须覆盖 portable `{project-root}` token、POSIX normalization、Windows separator input，以及 unresolved/path/symlink failures。
- external symlink negative fixture 必须使用临时 project boundary，snapshot 只断言 display-safe details，不记录临时绝对路径。
- 至少运行：focused resolver tests、`test/resolve-readers.test.ts`、`test/artifact-path-validation.test.ts`、`npm run build`、`git diff --check`。
- 不在本 Story刷新 config initialization、runtime structure、manifest 或 full fresh-install snapshots；这些属于 Story 11.2 evidence。

## Dependency Gate（依赖门禁）

- Current PRD 的 `FR13a`、`NFR14a`、`NFR40f`、Epic 11 strict-serial sequence、`SPEC 09` runtime root contract、`SPEC 07` taxonomy、Architecture shared-resolver boundary 和 UX Artifact Evidence 语义必须保持一致。
- Fresh IR `_bmad-output/planning-artifacts/implementation-readiness-report-2026-09-02.md` 必须为 `READY`；该结论只授权进入 Story lifecycle，不替代 implementation evidence。
- Story 11.1 是 EPIC 11 首个 Story，不依赖后续 Story。Story 11.2/11.3 只能消费本 Story输出，不能反向成为本 Story completion gate。
- Required gate mode：`story-kickoff`。
- Kickoff report：`_bmad-output/implementation-artifacts/flow-gates/11-1-executable-artifact-root-resolution-contract-story-kickoff-gate.md`。
- Gate metadata 的 `target` 与 `storyKey` 必须等于完整 Story key；只有 `PASS` / `PASS_EQUIVALENT` 才能进入 `in-progress`。
- unresolved token issue-id 与 staged ownership boundary 未关闭时，Gate 必须返回 `DECISION_NEEDED`；不得用 create-story 的 `ready-for-dev` 状态绕过该决策。

## Anchor Contract Map（锚点契约映射）

| Dependency | Anchor Type | Owning SPEC / Source | Required Evidence | Gate Behavior |
| --- | --- | --- | --- | --- |
| 七类 roots、placeholders、defaults、fallback、modes、Public Docs boundary | Contract Anchor | `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md` | 7-field contract matrix | 缺失或语义冲突为 `FAIL_CONTRACT` |
| Stable artifact-path diagnostics | Contract Anchor | `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` | issue-id registry + focused negative assertion | unresolved-token 无明确 contract 时为 `DECISION_NEEDED` |
| Story 11.1 bounded scope | Contract Anchor | Epic 11 Story 11.1、FR13a、NFR14a、NFR40f | AC 1-8 trace + no-scope-creep diff | 提前实施 11.2/11.3 为 `FAIL_CONTRACT` |
| Single config-owned resolver/model | Functional Anchor | `src/config/` existing resolver boundary | exported resolver + deterministic result | 缺失为 `FAIL_FUNCTION` |
| Four-layer TOML merge | Functional Anchor | `src/config/customization-reader.ts`、`src/config/config-reader.ts` | existing resolve regression tests | 重写/改变 precedence 为 `FAIL_FUNCTION` |
| Project boundary and redaction | Functional Anchor | `src/fs/path-normalizer.ts`、`src/validation/rules/artifact-path.ts` | escape/symlink/redaction tests | boundary leak 为 `FAIL_FUNCTION` |
| Focused resolution evidence | Evidence Anchor | `test/artifact-root-resolution.test.ts` 或等价 test | fresh/explicit/legacy/mixed/negative matrix | 缺失为 `FAIL_EVIDENCE` |
| Suggested helper filenames | Guidance Anchor | Architecture `src/config/` structure guidance | equivalent config-owned implementation rationale | 文件名不同不单独阻断，可 `PASS_EQUIVALENT` |

## Equivalent Implementation Policy（等价实现策略）

- Helper 文件名、type 拆分和 internal API 可以不同，只要实现仍由 `src/config/` 单一拥有，并通过同一 contract matrix。
- 不可等价替换的外部语义：七个 config keys/placeholders、七个 fresh defaults、existing explicit authority、三个新增 field fallbacks、三个 mode literals、project-relative POSIX/redaction、Project Knowledge/Public Docs boundary、read-only/no-write/no-migration。
- 固定 helper 文件名不是 hard gate；不得仅为满足建议路径创建 compatibility file。
- 若实现复用/抽取现有 path helper，必须证明原有 artifact-path validation 无回归；不能以“代码复用”为由改变 issue shape。
- `PASS_EQUIVALENT` 必须记录 functional equivalence、contract tests 和为何未采用建议拆分；没有 evidence 的路径差异不能通过。

## Evidence Plan（证据计划）

- Fresh matrix：7 rows、精确 defaults、全部 `fresh-default`。
- Existing explicit matrix：7 rows 保留显式值、全部 `explicit-config`，不写 config。
- Existing legacy matrix：仅缺失 brainstorming/analysis/solutioning 时使用 exact fallback 与 `legacy-compatible`；旧四项显式值不变。
- Mixed matrix：每个 field 的 mode 独立正确，字段顺序稳定。
- Path matrix：`{project-root}` internal expansion、Windows separator normalization、project-relative POSIX public result。
- Negative matrix：unresolved token、`../`、absolute path、Windows drive path、external symlink 使用稳定 issue，并证明 details/snapshot 无 absolute leak。
- Boundary matrix：fresh Project Knowledge 不等于 `docs`；existing explicit `docs` 保持 `explicit-config`。
- Purity evidence：重复执行结果一致；无 filesystem writes、无 config mutation、无 directory/manifest/workflow routing change。
- Regression evidence：现有 resolve merge、artifact-path validation 与 build 继续通过。
- Flow Gate：开发前 `story-kickoff`，进入 review 前 `story-completion`。

## Files To Modify（预计文件范围）

### New Files（新增文件，Guidance）

- `src/config/artifact-root-resolver.ts`：七字段 registry、fresh/existing discriminator、resolution result 与 pure resolver；等价 config-owned拆分可接受。
- `test/artifact-root-resolution.test.ts`：focused contract/evidence matrix；等价测试文件名可接受。

### Update Files（更新文件）

- **Path**：`src/config/config-schema.ts`
  - **Current state**：只定义旧 core/SDLC config fields、portable token normalization 与基础 artifact-path issue。
  - **What this Story changes**：让 config document/types 能表达七类 root inputs/results，或导出 resolver 所需的共享 field types。
  - **What must be preserved**：旧 config initialization 的 observable fields/prompts、portable `{project-root}` behavior、existing error shape；不得提前写入新 fresh config。
- **Path**：`src/config/config-reader.ts`
  - **Current state**：通过 `resolveTomlLayers()` 合并四层 config 并返回通用 resolver result。
  - **What this Story changes**：提供 merged config/provenance 到 artifact-root resolver 的稳定接入点或相邻 wrapper。
  - **What must be preserved**：merge precedence、optional-layer warnings、missing/repeated key 与 stdout/stderr parity。
- **Path**：`src/fs/path-normalizer.ts` 和/或 `src/validation/rules/artifact-path.ts`（仅在共享 helper 必需时）
  - **Current state**：分别拥有 project-relative normalization 与 artifact-path symlink/diagnostic behavior。
  - **What this Story changes**：仅抽取可复用 boundary helper，或保持原处供 resolver 复用。
  - **What must be preserved**：现有 callers、issue IDs/details、internal symlink acceptance、external symlink rejection 与 public redaction。
- **Path**：`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`（取决于 kickoff 决策）
  - **Current state**：没有 unresolved-token 专用 reserved ID。
  - **What this Story changes**：若决定新增 ID，在 implementation change 内注册 `artifact-path.unresolved-token` 并同步 fixture assertion。
  - **What must be preserved**：既有 issue ID 的语义、category 和 severity。

### Explicitly Deferred Files（明确延后）

- `src/installer/config-initialization.ts`
- `src/installer/runtime-structure.ts`
- manifest/index/Ready Summary projection files
- `assets/source/speclite/sdlc-skills/module.yaml`
- fresh-install config/tree/manifest snapshots
- concrete workflow Skills and artifact routes

上述文件属于 Story 11.2 或更晚 Story；本 Story仅可读取并记录为 downstream surface。

## References（参考资料）

- [Source: `_bmad-output/planning-artifacts/epics/14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#Story-111-Executable-Artifact-Root-Resolution-Contract可执行-Artifact-Root-解析契约`]
- [Source: `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md#Runtime-Artifact-RootsRuntime-Artifact-根路径`]
- [Source: `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md#Flow-Gate-ModesFlow-Gate-模式`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#artifact-pathartifact-path-类别`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Phase-Aligned-Artifact-Root-Contract阶段对齐的-Artifact-Root-契约`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Artifact-Root-Resolution-PatternsArtifact-Root-解析模式`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural-Boundaries架构边界`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Artifact-Evidence-CardArtifact-证据卡`]
- [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-09-02.md#Summary-And-Recommendations总结与建议`]
- [Source: `src/config/config-schema.ts`]
- [Source: `src/config/config-reader.ts`]
- [Source: `src/config/customization-reader.ts`]
- [Source: `src/fs/path-normalizer.ts`]
- [Source: `src/validation/rules/artifact-path.ts`]

## Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` 当前仅为 initialized skeleton；实现约束以 current PRD、Architecture、Specs、Epic/Story、UX 与 repository code 为准。
- 当前 worktree 已有用户的 Architecture/Epic/IR 改动；Story implementation 必须先做 scoped `git status` audit，不得回滚、覆盖、暂存或提交这些外部改动。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

待实现 Agent 填写。

### Debug Log References（调试日志引用）

待实现 Agent 填写。

### Completion Notes List（完成说明）

- 终极上下文引擎分析已完成 —— 已创建完整的开发者指南。
- Story 尚未实现；本文件中的 tasks 与 Evidence Plan 均为计划，不是 verified completion evidence。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md`（create-story output）
- `_bmad-output/implementation-artifacts/sprint-status.yaml`（tracker update）

## Anchor Evidence Summary（锚点证据摘要）

- Flow gate result：待 `story-kickoff` / `story-completion` Gate 填写。
- Contract anchors verified：待实现后填写；不得以本 Story 文档存在代替验证。
- Functional anchors verified：待实现后填写。
- Evidence anchors verified：待实际 tests/commands 完成后填写。
- Equivalent implementation decisions：待实现或 Gate 记录。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 Story 11.1 implementation context，定义 executable artifact-root resolver、contract decision、scope boundary、Flow Gate 与 evidence plan。 | Fancyliu / Codex |

---

*本文档由 speclite-create-story Skill 自动生成*
