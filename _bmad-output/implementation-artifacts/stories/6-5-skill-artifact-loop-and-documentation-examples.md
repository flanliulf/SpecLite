# Story 6.5: Skill Artifact Loop And Documentation Examples（Skill Artifact Loop 与文档示例）

Status: ready-for-dev

<!-- Note: This file is ready-for-dev story context. It is not evidence that source implementation, fixture runner, installed skill execution, artifact writer, documentation examples, packaging inventory, schemas, tests, or release gates already exist. -->

## Story（故事）

作为 SpecLite 维护者，  
我希望至少有一个阶段化 skill 从 IDE entry 发现、激活到输出 artifact 的闭环 fixture，  
以便证明 SpecLite 安装后不只是文件存在，而是真正能驱动研发流程并产出可检查文档。

## Acceptance Criteria（验收标准）

1. **Installed IDE entry discovery is fixture-observable（Installed IDE Entry 发现可由 Fixture 观察）**  
   **前提** `skill-artifact-loop` release gate fixture 已完成 fresh install 或使用等价 installed state；  
   **当** fixture 从 installed help index、phase coverage、skill index 或 IDE target mirror 中发现阶段化 skill；  
   **则** entry 必须解析到唯一 `canonicalSkillId`、`activationTarget` 和 installed skill package；  
   **并且** discovery 不需要人工查找 source skill、复制 prompt、读取 `assets/source/speclite/**/SKILL.md` 或依赖 checkout absolute path。

2. **Activation uses installed runtime support（Activation 使用已安装 Runtime Support）**  
   **前提** fixture 激活该 installed skill；  
   **当** skill 按自身 activation protocol 读取项目级 config 和 customization；  
   **则** 必须通过 installed runtime support，例如 `speclite resolve config --project-root <project>` 与 `speclite resolve customization --skill <installed-skill-dir> --project-root <project>`，或 owning SPEC 允许的等价入口；  
   **并且** 不得依赖 Python resolver、`_bmad/scripts/resolve_*.py`、`assets/source/speclite/scripts/resolve_*.py`、`node dist/...` internal build path、source checkout path、package cache path 或 fixture helper 中第二套 merge logic。

3. **Workflow writes a minimal planning or review artifact（Workflow 写出最小 Planning 或 Review Artifact）**  
   **前提** installed skill workflow 完成最小闭环；  
   **当** workflow 写出 planning、implementation 或 review artifact；  
   **则** artifact 必须位于 `_speclite-output` 或配置约定的 workflow artifact root 下，且路径使用 project-relative POSIX-style path；  
   **并且** on-disk metadata 必须包含 `workflowType`、`sourceSkill` 和 `generatedAt`。

4. **Artifact loop validation stays MVP-minimal（Artifact Loop 校验保持 MVP 最小范围）**  
   **前提** fixture validate artifact loop；  
   **当** 检查生成 artifact；  
   **则** 只校验 artifact type、默认输出路径、metadata location 和 metadata 值域；  
   **并且** `skill-artifact-loop` 只证明一个最小 installed activation / artifact loop，不得替代 `fresh-install-empty-project` 对 full canonical skill set 的安装、索引和 IDE mirror coverage 证明；
   **并且** `generatedAt` 必须存在且可 parse 为 ISO 8601 string，并在 stable snapshot 中 normalize、omit 或标记为 non-stable；  
   **并且** 不把叙事质量、人工评审结论、业务正确性、内容完整度或多 skill workflow 成功率作为 MVP validation。

5. **Documentation examples are fixture-derived（文档示例来自 Fixture）**  
   **前提** 文档读者查看 fresh install、目录树、manifest/index、status/validate 输出或 update 保护示例；  
   **当** docs 或 packaged documentation examples 展示这些输出；  
   **则** 示例必须引用或来自 fixture expected outputs / 同一 semantic model；  
   **并且** 不复制 schema 真源、不定义第二套 JSON / manifest / fixture / artifact contract，不把 human-readable prose 变成 automation dependency。

6. **New staged skill or artifact kind updates fixtures and assertions（新增阶段化 Skill 或 Artifact Kind 同步 Fixture 与断言）**  
   **前提** dev agent 为支持本 Story 新增阶段化 skill、artifact kind、artifact metadata field、documentation example class 或 packaged documentation example；  
   **当** 更新 documentation examples 或 release assets；  
   **则** 必须同步 fixture input、expected outputs、validation assertions、manifest/index projection 和 packaging inventory；  
   **并且** 保持最小 `skill-artifact-loop` release gate 与 richer regression assets / documentation examples 分类明确。

7. **Post-MVP governance remains out of scope（Post-MVP 治理保持范围外）**  
   **前提** dev agent 实现本 Story；  
   **当** 需要更丰富的治理可视化或质量评分；  
   **则** 不得实现 Post-MVP governance dashboard、coverage trend、多 skill complex workflows、manual review quality scoring、complete docs rewrite、`doctor` / `sync` / `uninstall`、top-level `repair`、branded Copilot/Cursor target 或 command pointer artifact。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Preflight and implementation reality check（AC: 1-7）
  - [ ] 重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/`、`test/fixtures/` 和 `dist/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；Epic 4/5 behavior 与本 Epic fixture/artifact gates 仍必须按当前源码验证，不得把 ready-for-dev story context 当作源码完成证据。
  - [ ] 重新读取 `_bmad-output/planning-artifacts/specs/README.md`，再按 owning SPEC reading order 读取与本 Story 相关的 `01-command-result-json-contract.md`、`04-manifest-index-contract.md`、`05-ide-adapter-registry-contract.md`、`06-resolve-command-contract.md`、`07-validation-issue-taxonomy.md` 和 `08-fixture-contract.md`。
  - [ ] 重新读取 Story 6.1、6.2、6.3、6.4、2.3、2.4 和 2.5，确认 fixture contract、installed activation、resolver runtime support、artifact metadata、path portability、documentation example packaging boundary 是否真实落地。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的 behavior。若前置 implementation 尚未存在，按前序 story 顺序补齐或记录 blocker，不得伪造 fixture pass。
  - [ ] 检查 dirty worktree，保留用户、父 agent 或其它 sub-agent 的改动；不得格式化、重写、同步或回滚无关 planning docs、Story 1-5、Story 6.1/6.2/6.3/6.4、源码或 status 文件。

- [ ] Task 2: Establish or extend `skill-artifact-loop` release gate fixture（AC: 1-4, 6）
  - [ ] 在 `test/fixtures/skill-artifact-loop/` 或现有等价 fixture root 下使用 stable lower-kebab layout：`input/`、`expected/`、`README.md`。
  - [ ] Fixture input 必须包含 installed state：manifest/index、skill index、help index、phase coverage、files index、selected IDE target entry、installed self-contained skill package、project config/customization layers 和 configured artifact root。
  - [ ] Fixture registry 将 `skill-artifact-loop` 标记为 fixture project release gate。不要把 documentation examples、packaging acceptance 或 richer multi-skill regression assets 合并进这个最小 gate。
  - [ ] Fixture README / registry 必须明确：本 gate 是最小 activation/artifact loop evidence，不是 full canonical installed set coverage；full `core` + `sdlc` 53 skill baseline 由 `fresh-install-empty-project` gate 证明。
  - [ ] 创建 `skill-artifact-loop` gate 后，必须补充 6.4 runtime matrix inclusion：复用 6.4 已建立的 runner wiring、Node `[22, 24]` policy、release evidence metadata 和 typed gate slot，将 6.4 的 pending/skip slot 转为实际 gate run evidence。
  - [ ] Fixture README 明确 release gate scope：installed IDE entry discovery、activation protocol、resolver access、artifact write 和 metadata value-domain validation。

- [ ] Task 3: Verify installed IDE entry discovery and activation target（AC: 1）
  - [ ] 从 installed help index、phase coverage 或 skill index 解析阶段化 skill entry，断言 `canonicalSkillId` 唯一、`activationTarget` 指向 installed `SKILL.md`，且 installed package directory 存在。
  - [ ] `activationTarget` 与 `entryPath` 必须是 project-relative POSIX path，例如 `.claude/skills/<canonicalSkillId>/SKILL.md` 或 `.agents/skills/<canonicalSkillId>/SKILL.md`。
  - [ ] Target order 必须保持 `claude`、`agents`；不得输出 branded `copilot`、`cursor` target id 或 command pointer artifact。
  - [ ] Negative assertions 必须 fail on source checkout path、absolute path、home directory、drive letter、OS-specific separator、cache path、temporary extraction path、fixture output absolute path、archive planning artifact path 或 alias-only identity。

- [ ] Task 4: Activate skill through installed runtime support（AC: 2）
  - [ ] Fixture activation 只能从 installed self-contained skill package 读取 `SKILL.md` 和相邻 copied resources，例如 `customize.toml`、`references/`、`assets/`、`scripts/`。
  - [ ] Fixture harness 只能使用 installed `SKILL.md` 的 activation protocol 作为确定性入口；不得从 source checkout prompt、planning workspace story text 或当前 repo `assets/source/speclite/**/SKILL.md` 直接生成 artifact。
  - [ ] Skill 读取 config/customization 时调用 `speclite resolve config` 与 `speclite resolve customization` runtime support command；`resolve config` 显式传 `--project-root`，`resolve customization` 显式传 `--skill <installed-skill-dir>` 与 `--project-root`。
  - [ ] Resolve stdout 必须是 pure resolved JSON object；stderr diagnostics 必须是 `ValidationIssue` JSON Lines；warning diagnostics 不阻断成功，error/critical diagnostics non-zero。
  - [ ] 不允许 adapter、installed skill helper、fixture helper、renderer 或 test helper 实现第二套 TOML merge、第二个 customization key 或 source-checkout resolver fallback。
  - [ ] Fixture harness 不得调用真实 LLM、agent runtime、IDE automation、network service 或人工交互；release gate 必须 deterministic、local-only、CI-friendly。
  - [ ] 如果前置 Story 2.4 尚未实现 Node/TypeScript resolver，fixture 失败应保留为有效前置信号；不要回退到 Python resolver 让 release gate 假绿。

- [ ] Task 5: Write minimal workflow artifact and metadata（AC: 3-4）
  - [ ] 使用一个已安装、阶段化且带 `artifactContract` 的 canonical skill，或在 source metadata/skill package/manifest/help index/phase coverage/fixtures 全部同步的前提下新增最小阶段化 skill。不得只在 fixture 中伪造 skill identity。
  - [ ] Artifact 由受控 test skill 或 fixture-owned deterministic minimal workflow writer 写出；writer 只能消费 installed activation protocol、`speclite resolve` 输出和 fixture input，不得驱动真实 agent/LLM，也不得把 source checkout prompt 文案当作 artifact generation source。
  - [ ] Workflow 写出最小 planning 或 review artifact 到 configured artifact root，路径必须在 target project boundary 内，project-relative POSIX-style，且不通过 symlink/path escape 指向项目外。
  - [ ] Markdown artifact 使用 leading YAML frontmatter 写入 `workflowType`、`sourceSkill`、`generatedAt`；非 Markdown file artifact 使用 `<artifact-filename>.metadata.json`；directory artifact 使用目录内 `metadata.json`。
  - [ ] `sourceSkill` 必须等于 installed canonical skill id；不得来自 display name、menu label、phase label、IDE-specific alias、target id 或 source checkout path。
  - [ ] `generatedAt` 使用 runtime ISO 8601 string。Fixture 只 parse/validate presence and ISO compatibility，并 normalize/exclude concrete value from stable snapshots。
  - [ ] Artifact 与 metadata sidecar 是 `workflow-owned`。Install、update 和 repair 不得把它们当作 installer-owned changed path、repair action 或 silent overwrite target。

- [ ] Task 6: Validate artifact loop with minimal assertions（AC: 4）
  - [ ] Validator / fixture comparator 只检查 artifact type、default output path、metadata location、required metadata keys、`workflowType` non-empty stable string、`sourceSkill` canonical id match 和 `generatedAt` parseability。
  - [ ] Stable snapshots 不比较具体 `generatedAt`、duration、elapsed time、p95、profiling sample、process id、random id、environment value 或 local absolute path。
  - [ ] Negative tests 覆盖 missing metadata、invalid `generatedAt`、wrong `sourceSkill`、artifact path escape、symlink escape、unwritable artifact root、metadata sidecar missing、second Markdown frontmatter block 和 artifact written outside configured root。
  - [ ] 不检查 artifact prose 质量、人工评审结论、完整 PRD/story 内容、LLM answer quality 或 multi-step workflow subjective quality。

- [ ] Task 7: Create documentation examples from fixture expected outputs（AC: 5-6）
  - [ ] 文档示例覆盖 fresh install、目录树、manifest/index、status/validate output 和 update protection examples；示例必须引用或生成自 fixture expected outputs / same semantic model。
  - [ ] 对 manifest/index 示例，只展示必要 excerpt 或链接 fixture expected output；不要复制完整 schema、field truth 或另写 schema table。
  - [ ] 对 status/validate/update 示例，human-readable 示例使用 no-color plain text，字段顺序和术语与 Compact / Evidence / Structured profiles 保持一致；automation facts 仍以 `CommandResult`、manifest/index 或 artifact metadata 为准。
  - [ ] 如果某些 documentation examples 需要打包发布，必须在 packaging inventory 中明确标记为 packaged documentation example，并断言它们不等同于 release gate fixture。
  - [ ] 不执行 complete docs rewrite，不重写全部 README / docs 叙事；只补本 Story 所需最小 examples 和引用关系。

- [ ] Task 8: Packaging inventory and docs example boundary（AC: 5-6）
  - [ ] 若 documentation examples 被 package，`npm run release:packaging-check` 或等价 release checklist gate 必须在 `dist/packaging-manifest.json` 中列出 package file inventory、example classification、included/excluded paths 和 stable assertions。
  - [ ] `test/fixtures/` 与 root `fixtures/` 默认不得进入 package。只有显式标记的 packaged documentation example 可进入 package。
  - [ ] `npm pack --dry-run --json` 可以作为辅助 package inventory signal，但项目 acceptance artifact 仍应是 `dist/packaging-manifest.json`，并由 tests/assertions 校验所需 runtime assets 与 docs examples classification。

- [ ] Task 9: Focused tests and release gate evidence（AC: 1-7）
  - [ ] Unit tests 覆盖 fixture registry classification、installed entry discovery、activation target parser、resolve invocation builder、artifact metadata parser/writer、generatedAt ISO parse/normalization、documentation example classification 和 packaging inventory classification。
  - [ ] Integration / fixture tests 覆盖 `skill-artifact-loop`：installed entry discovery、activation protocol readable、resolver access、deterministic no-LLM/no-agent-runtime artifact write、metadata validation、runtime matrix inclusion 和 snapshot normalization。
  - [ ] Human-readable tests 覆盖 Compact / Evidence representative output、`NO_COLOR`、non-TTY、CI 和 narrow terminal fallback；不得丢失 artifact path、workflowType、sourceSkill、generatedAt presence、targetId、entryPath、activationTarget、issueId 或 next action。
  - [ ] Run `npm test`，或至少运行 affected fixture contract、skill-artifact-loop fixture、resolve output parser、manifest/index parser、artifact metadata parser、artifact-path validation、diagnostics output profiles、packaging-check 和 docs example tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 installed skill activation、artifact loop pass、documentation package inventory 或 release gate evidence。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-5、Story 6.1/6.2/6.3/6.4、Epic 7、无关源码或用户改动。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，`sprint-status.yaml` 中 `epic-6` 为 `in-progress`，`6.1`、`6.2`、`6.3`、`6.4` 为 `ready-for-dev`，`6.5` 为 `backlog`。本 Story 创建后只应将 `6.5` 改为 `ready-for-dev`，保持 `epic-6` 为 `in-progress`，并保持 6.1-6.4 状态不变。
- 创建本 Story 前，目标 story file `_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md` 不存在。
- 截至 2026-05-29 的 Epic 3 提交 `395b017`，root TypeScript CLI scaffold、status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation ordering anchors 已存在。root `fixtures/`、`dist/`、Epic 4 update/repair behavior、Epic 5 source-integrity behavior、Story 6.1-6.4 fixture/runtime gates 和本 Story skill artifact loop 仍需按当前源码逐项确认。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、custom stubs、legacy Python resolver scripts 和 canonical skill packages。这些 source assets 不是 installed target state，也不是 Node/TypeScript MVP CLI implementation。
- 当前 worktree 已有用户或其它流程产生的 dirty planning artifacts、`sprint-status.yaml` 改动和大量未跟踪 implementation story files。实现本 Story 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是 initialized placeholder，没有补充新的 implementation guardrails。实际 implementation guardrails 以 live PRD、Architecture、UX、readiness report、owning SPEC artifacts、previous story contexts 和本 Story 为准。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能指向不含 `tomllib` 的旧 runtime。
- 本 Story 是 ready-for-dev story context。它描述 dev agent 应如何实现、验证和守住边界；它不是 `skill-artifact-loop` fixture、installed skill activation、artifact writer、documentation examples、packaging manifest、schemas、tests 或 release gate 已存在的证明。

### Scope Boundary（范围边界）

- 本 Story 负责：最小 `skill-artifact-loop` release gate fixture、installed IDE entry discovery、installed `SKILL.md` activation protocol、`speclite resolve` runtime support access、最小 planning/review artifact write、artifact metadata value-domain validation、`generatedAt` parse and snapshot normalization、fixture-derived documentation examples、packaged documentation example classification 和 affected focused tests；它不证明 full canonical installed set coverage，后者由 Story 6.2 的 `fresh-install-empty-project` gate 负责。
- 本 Story 消费：Story 2.3 的 installed activation target boundary、Story 2.4 的 Node/TypeScript resolver runtime support、Story 2.5 的 artifact metadata/frontmatter/sidecar contract、Story 6.1 的 fixture layout/comparator/gate classification、Story 6.2 的 fresh install/update expected output foundation、Story 6.3 的 resolve parity/source redaction discipline、Story 6.4 的 Node/path/packaging boundary。
- 本 Story 不负责：重新定义 artifact contract、完整实现 source-integrity matrix、完整 path-portability OS matrix、performance dashboard、多 skill complex workflow、manual review quality scoring、complete docs rewrite、Post-MVP `doctor` / `sync` / `uninstall`、top-level `repair`、coverage trend report、enterprise dashboard、full source lockfile lifecycle、signatures、provenance policy、dedicated Copilot/Cursor adapter 或 command pointer artifact。
- 本 Story 不修改 owning SPEC。若 implementation 发现 public JSON、manifest/index、artifact contract、resolve behavior、fixture layout、taxonomy、packaging acceptance 或 documentation example classification 需要变更，必须先提出并更新 owning SPEC / Architecture，再更新 executable schema/parser/comparator，最后更新 fixture expected outputs。
- Documentation examples 是 docs-facing or packaged examples；fixture expected outputs 是 contract test assets；`packaging-acceptance` 是 release checklist gate；`skill-artifact-loop` 是 fixture project release gate。四者不得混用。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node 26 Current 不进入 MVP baseline。不要使用 Node 24-only API，除非提供 Node 22-compatible path 并同步 runtime policy、fixtures 和 release matrix。
- CLI foundation 保持 TypeScript + commander；不要为 skill loop、docs examples、packaging inventory 或 fixture runner 引入 oclif/yargs/cac/clipanion。
- Storage model 是 filesystem-first/local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent fixture cache server 或 background process。
- `src/config/` 是唯一 Config/Customization Merge Implementation 位置。Installed skill、IDE adapter、fixture helper、renderer 和 command module 不得 hand-roll merge behavior。
- `speclite resolve` 是 installed skills 的 runtime support command，不使用 `CommandResult` envelope；stdout pure JSON，stderr `ValidationIssue` JSON Lines。
- Manifest/index 和 phase coverage 是 installed-state projection truth；source assets 是 source-side truth；IDE mirrors 是 execution-plane projection；workflow artifacts 是 `_speclite-output` / configured artifact root 下的 workflow-owned outputs。
- Artifact contract fields and metadata semantics 以 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 为真源；fixture layout/comparison/gate classification 以 `08-fixture-contract.md` 为真源；adapter target/order/status 以 `05-ide-adapter-registry-contract.md` 为真源。
- Human-readable output、`--json` output、fixture expected outputs 和 documentation examples 必须共享 semantic model。Human-readable prose 不得成为 automation dependency。

### Implementation Anchors（实现锚点）

预期 implementation anchors 如下；如果现有代码已经有等价模块，dev agent 应复用现有边界并按本 Story 调整：

```text
src/fixtures/fixture-contract.ts
src/fixtures/fixture-runner.ts
src/fixtures/comparators/json.ts
src/fixtures/comparators/file-tree.ts
src/fixtures/comparators/human-output.ts
src/manifest/manifest-schema.ts
src/manifest/manifest-generator.ts or equivalent skill/help/phase index helpers
src/manifest/artifact-contract.ts
src/ide/adapter-registry.ts
src/ide/mirror-validator.ts
src/config/resolve-output-schema.ts
src/config/merge-rules.ts
src/validation/rules/artifact-path.ts
src/validation/artifact-metadata.ts
src/diagnostics/output.ts
src/fs/path-normalizer.ts
test/fixtures/skill-artifact-loop/
test/integration/skill-artifact-loop.test.ts
test/unit/manifest/artifact-contract.test.ts
test/unit/validation/artifact-metadata.test.ts
test/unit/fixtures/fixture-contract.test.ts
dist/packaging-manifest.json
```

- 该清单仅限本 Story 范围。只有直接支撑 installed skill artifact loop、artifact metadata、docs examples classification 或 packaging inventory assertions 时，才新增 helper files。
- If a listed anchor conflicts with already implemented local module names, use the existing module boundary and preserve the same owning SPEC semantics.
- Do not add broad workflow orchestration framework、dashboard exporter、enterprise report generator、command pointer artifact 或 dedicated browser UI inside this Story.

### Skill Artifact Loop Fixture Requirements（Skill Artifact Loop Fixture 要求）

- Fixture id 必须是 `skill-artifact-loop`，release gate classification 为 fixture project gate。
- Fixture input 必须表示 installed project，而不是当前 repo planning workspace。不要把当前 `_bmad-output/implementation-artifacts/*.md` 当作 installed target artifacts。
- Installed entry discovery source can be help index、skill index、phase coverage 或 target mirror metadata, but must resolve to one canonical installed package.
- 必需可观察字段：
  - `canonicalSkillId`
  - `targetId`
  - `entryPath`
  - `activationTarget`
  - installed package directory
  - `artifactContract.artifactType`
  - `artifactContract.defaultOutputPath`
  - required metadata keys: `workflowType`、`sourceSkill`、`generatedAt`
- Activation 必须使用 installed `SKILL.md` 和相邻 package resources。运行时不得读取 `assets/source/speclite/**/SKILL.md`。
- Resolver access assertions 必须以 semantic 方式 parse `speclite resolve` stdout JSON，并把 stderr JSON Lines 逐行 parse 为 `ValidationIssue` objects。
- Harness must be no-LLM and no-agent-runtime: it may read the installed `SKILL.md` activation protocol, call `speclite resolve`, and run a controlled test skill or fixture-owned deterministic writer, but it must not invoke real agent execution, IDE automation, external services or human-in-the-loop review.
- Artifact generation must not use source checkout prompts or current planning workspace story files as direct generation input; installed package resources and fixture-owned deterministic inputs are the only allowed sources.
- Artifact validation assertions 必须从 frontmatter、sidecar JSON 或 directory `metadata.json` 读取 on-disk metadata；仅有 manifest/index projection 不足以通过本 fixture。
- Stable snapshots 必须拒绝 absolute local paths、home directories、drive letters、backslashes、checkout root、cache paths、temporary extraction paths、fixture output absolute path、credentials、raw stack traces、random ids、process ids、environment variable values、duration 和具体 `generatedAt`。

### Documentation Example Requirements（文档示例要求）

- Documentation examples must be generated from or cite fixture expected outputs. Do not hand-copy schema truth into docs prose.
- Fresh install example should show evidence that `_speclite`、`_speclite-output`、manifest/index、`.claude/skills` and `.agents/skills` exist, but it should rely on `fresh-install-empty-project` expected outputs rather than inventing new example fields.
- Directory tree examples must use project-relative POSIX-style paths and should not include local checkout root、home directory、temporary path、package cache path or machine-specific usernames.
- Manifest/index examples may include excerpts for `manifest.yaml`、`skill-index.json`、`help-index.json`、`files-index.json` or `phase-coverage.json`, but must link back to owning SPEC / fixture expected outputs for full contract meaning.
- `status` / `validate` examples must preserve Compact / Evidence / Structured profile language and should not imply `status` is full validation. Automation facts remain in `CommandResult` data、manifest/index 或 artifact metadata.
- Update protection examples must distinguish normal `speclite update` from explicit `speclite update --repair`; workflow-owned artifacts are protected and do not become repair actions.
- Packaged documentation examples 必须在 package inventory 中显式标记。Packaged docs examples 不是 release gate fixtures，也不能替代 `test/fixtures/skill-artifact-loop/`。

### Testing Requirements（测试要求）

- 使用 Vitest，并优先复用现有 project fixture runner / comparator。
- 测试类别：
  - Fixture registry: `skill-artifact-loop` is a release gate fixture; documentation examples are regression/docs assets; `packaging-acceptance` is release checklist gate.
  - Installed entry discovery: unique `canonicalSkillId`、project-relative `entryPath`、project-relative `activationTarget`、installed package exists、no source-checkout dependency.
  - Resolve runtime support: config/customization command shape、stdout pure JSON、stderr JSON Lines、missing key behavior、optional warning behavior、no Python resolver fallback.
  - Artifact metadata: Markdown frontmatter、sidecar metadata、directory metadata、required field presence、`sourceSkill` canonical id、`generatedAt` ISO parse、deterministic writer output、normalization/exclusion.
  - Artifact path: configured root、default output path、actual artifact path、project boundary、symlink/path escape、unwritable directory。
  - Documentation examples: fixture-derived content、no schema duplication、no uncontracted fields、no ANSI/color-only semantics、packaged example classification。
  - Packaging inventory: required runtime assets included, fixtures excluded by default, explicitly marked packaged documentation examples included only when intended.
- Negative tests must fail on Python resolver dependency、source checkout `SKILL.md` dependency、source checkout prompt as artifact input、real LLM or agent runtime invocation、second customization key、absolute path leak、home directory leak、drive letter leak、backslash separator leak、credential leak、cache/temp path leak、raw stderr/stack trace leak、missing metadata、invalid `generatedAt`、wrong `sourceSkill`、workflow-owned artifact overwrite、normal update repairing drift、documentation example defining a second schema truth and concrete `generatedAt` in stable snapshots.
- Tests 必须 local-only 且 deterministic。不得调用 npm registry、private registry、Git remote、offline bundle origin、remote provenance service 或外部网络。
- 如果前置 implementation 尚未完成，测试失败应保留为有效前置信号；不要跳过 fixture、不要伪造 artifact loop pass、不要提交 synthetic release evidence。

### Previous Story Intelligence（前序 Story 情报）

- Story 2.3 established installed `SKILL.md` activation target, phase coverage evidence, canonical target order, no source-checkout dependency, no branded Copilot/Cursor target id and no command pointer artifact. Story 6.5 must discover installed entries from those projections, not from source assets.
- Story 2.4 defined `speclite resolve` as runtime support outside `CommandResult`: stdout pure JSON, stderr JSON Lines diagnostics, config four-layer merge, customization three-layer merge, basename lookup key, repeated/missing keys, optional/required layer semantics, array merge parity and no deletion. Python resolver is parity baseline only.
- Story 2.5 defined workflow artifact metadata: `workflowType`、`sourceSkill`、`generatedAt`; Markdown frontmatter, sidecar JSON and directory metadata; `generatedAt` parseable but excluded/normalized in stable snapshots; workflow-owned artifacts protected from install/update/repair overwrite.
- Story 6.1 established fixture contract foundation: stable lower-kebab layout, single case vs group sub-case layout, expected output classes, semantic JSON comparison, path/timestamp/randomness policy, Compact/Evidence/Structured profiles, release gate vs regression asset vs documentation example classification and packaging acceptance as non-fixture release checklist gate.
- Story 6.2 established `fresh-install-empty-project` and normal `existing-install-update` fixture boundaries, including ReadyCheck gating, generated tree / manifest / IDE mirror expected outputs, human-owned custom preservation, workflow-owned artifact preservation and normal update conflict behavior. It explicitly kept `update --repair` out of normal update.
- Story 6.3 established `ide-drift`、`source-integrity` required sub-cases and `resolve-parity` fixture boundaries; it also reinforced redaction everywhere and local-only deterministic tests.
- Story 6.4 established Node 22/24 runtime matrix, path-portability, terminal width / `NO_COLOR` / non-TTY / CI output requirements, packaging acceptance inventory boundary and packaged documentation example classification.
- Readiness report 2026-05-26 says implementation agents should read owning SPECs first, then PRD / Architecture summaries and Story. It flags Epic 6 as a wide release confidence area that must stay bounded by 6.1-6.5 Story scopes.
- Recent git history is documentation/context/spec oriented, not implementation scaffold. Dev agent must re-check actual source tree before coding.

### Latest Technical Information（最新技术信息）

- 2026-05-26 核对 Node.js official releases page：Node 24 为 LTS，Node 22 为 LTS，Node 26 为 Current；该页说明 production applications 应使用 Active LTS 或 Maintenance LTS releases。SpecLite MVP 保持 Node 22 minimum + Node 24 recommended，不升级 MVP baseline 到 Node 26。Source: https://nodejs.org/en/about/previous-releases
- npm CLI v11 `npm pack` docs 显示 `npm pack <package-spec>`，支持 `dry-run` 报告将要执行的内容且不做变更，并支持 `json` output。`npm pack --dry-run --json` 可辅助核验 documentation examples 的 package file inventory，但 SpecLite release acceptance 仍应写出并断言 `dist/packaging-manifest.json`。Source: https://docs.npmjs.com/cli/v11/commands/npm-pack
- ISO 8601 timestamp validation for `generatedAt` should use existing Node/JavaScript standard parsing, preferably through a small injectable-clock helper and semantic tests. Do not add date/time、JSON Schema、frontmatter、globbing、terminal UI or artifact-management dependencies unless the dev agent proves Node 22 support、offline determinism、cross-platform path behavior、redaction behavior and deterministic fixture comparison.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, readiness report, owning SPEC artifacts and this Story.

### References（参考）

- `_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
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
- `_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md`
- `_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md`
- `_bmad-output/implementation-artifacts/2-5-workflow-artifact-output-and-metadata-validation.md`
- `_bmad-output/implementation-artifacts/6-1-fixture-case-layout-and-expected-output-contract.md`
- `_bmad-output/implementation-artifacts/6-2-fresh-install-and-existing-update-fixture-gates.md`
- `_bmad-output/implementation-artifacts/6-3-drift-source-integrity-and-resolve-parity-fixtures.md`
- `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md`
- `https://nodejs.org/en/about/previous-releases`
- `https://docs.npmjs.com/cli/v11/commands/npm-pack`

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

由 dev agent 填写。

### Debug Log References（调试日志引用）

- `python3.12 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-create-story --key workflow` resolved workflow successfully; `workflow.on_complete` is empty.
- Full `sprint-status.yaml` was read before creation; `6-5-skill-artifact-loop-and-documentation-examples` was `backlog`, `6.1`-`6.4` were `ready-for-dev`, and `epic-6` was `in-progress`.
- `TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S %Z'` returned `2026-05-26 17:56:52 CST` for status update timestamp.

### Completion Notes List（完成备注）

- Story context created by independent `bmad-create-story` sub-agent for Epic 6 / Story 6.5.
- Scope respected: this create-story run should modify only this story file and `_bmad-output/implementation-artifacts/sprint-status.yaml`.

### File List（文件列表）

- `_bmad-output/implementation-artifacts/6-5-skill-artifact-loop-and-documentation-examples.md`
