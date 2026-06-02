# Story 6.1: Fixture Case Layout And Expected Output Contract（Fixture Case 布局与 Expected Output 契约）

Status: done

<!-- Note: This file is ready-for-dev story context. It is not evidence that source implementation, fixture runner, schemas, or tests already exist. -->

## Story（故事）

作为 SpecLite 维护者，  
我希望每个 fixture case 都有稳定的目录布局、输入数据和 expected outputs，  
以便新增或修改安装能力时，可以用同一套契约测试资产验证行为是否仍然正确。

## Acceptance Criteria（验收标准）

1. **Stable fixture case layout（稳定 Fixture Case 布局）**  
   **前提** 维护者创建新的 fixture case；  
   **当** fixture case 被加入测试资产；  
   **则** case directory 必须使用 stable lower-kebab name；  
   **并且** single case 使用 `test/fixtures/<case>/`，group sub-case 使用 `test/fixtures/<group>/<sub-case>/`；  
   **并且** layout 至少区分 `input/`、`expected/` 和 `README.md`，不得把 generated output、cache、temporary 或 checkout-root-specific path 混入 expected truth。

2. **Expected output classes are explicit（Expected Output 类别显式）**  
   **前提** fixture case 描述安装前后状态；  
   **当** 维护者定义 expected outputs；  
   **则** expected outputs 至少支持 expected file tree、manifest/index snapshots、command JSON output、validation issue set、stderr JSON Lines diagnostics、file hashes 或 normalized file-tree summary；  
   **并且** human-readable output expected assets 必须按 Compact、Evidence、Structured profiles 表达断言边界；  
   **并且** 每类 expected output 的比较规则由 owning SPEC 与 executable parser 管理。

3. **Path fields are portable and redaction-safe（路径字段可移植且可脱敏）**  
   **前提** fixture snapshot 包含 path fields；  
   **当** 生成或比较 expected outputs；  
   **则** path fields 必须使用 project-relative POSIX-style path；  
   **并且** stable expected outputs 不得依赖 absolute local path、home directory、drive letter、OS-specific separators、checkout root、cache path、temporary extraction path、fixture output path 或 credential-bearing source locator。

4. **Stable comparison excludes only declared non-stable fields（稳定比较只排除已声明的不稳定字段）**  
   **前提** fixture snapshot 包含 public JSON、manifest/index 或 artifact metadata；  
   **当** 进行 stable comparison；  
   **则** 允许的 timestamp fields 必须由 owning schema 显式声明，并在 comparison 中 normalize、omit 或单独标记为 non-stable；  
   **并且** 未声明字段不得引入 timestamp、random id、process id、environment variable、duration、p95 measurement、profiling sample、stack trace 或不稳定排序。

5. **Human-readable output profiles are contract-testable（人类可读输出 Profile 可契约测试）**  
   **前提** fixture expected output 覆盖 `status`、`validate`、`install` 或 `update`；  
   **当** 比较 human-readable output；  
   **则** fixture 必须覆盖 Compact、Evidence 和 Structured profiles 的代表性输出；  
   **并且** comparison 不得依赖颜色、ANSI escape、terminal width、spinner-only progress、absolute local path、checkout root、locale-only wording 或图标作为唯一语义。

6. **Narrow terminal fallback preserves fields（窄终端降级保留字段）**  
   **前提** fixture expected output 包含 table/list diagnostics、targets、paths、plans 或 artifact evidence；  
   **当** terminal width 小于 80 columns 并触发 key-value fallback；  
   **则** severity、issueId、affectedPath、targetId、entryPath、next action、planned effect、conflict reason、artifact path、workflowType、sourceSkill 和 generatedAt presence 等关键字段仍必须可读且可断言；  
   **并且** layout 降级不得丢失 automation 或审计所需字段。

7. **Snapshot update follows contract-first discipline（Snapshot 更新遵循契约优先纪律）**  
   **前提** public contract、fixture behavior、output profile 或 comparison policy 发生变化；  
   **当** 维护者需要更新 fixture expected outputs；  
   **则** 必须先更新 owning SPEC，再更新 executable schema/parser/comparator，最后更新 expected outputs 或 snapshots；  
   **并且** 不得先用 snapshot 更新反推契约行为，也不得在 CI 中依赖自动 snapshot update 让测试通过。

8. **Release gate and regression asset classification is explicit（发布门禁与回归资产分类明确）**  
   **前提** 新增 module、adapter、source type、validation rule、ownership behavior、installed artifact kind、output profile 或 fixture helper；  
   **当** 维护者提交变更；  
   **则** 必须同步新增或更新相关 fixture input、expected output 和 validation assertion；  
   **并且** release gate fixture、required release-gate sub-case、release checklist gate、regression asset 和 documentation example 的分类必须明确，不得混用。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 实现前置核对与范围边界（AC: 1-8）
  - [x] 重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 和 `test/fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；Epic 4/5 behavior 与本 Epic fixture contract 仍必须按当前源码验证，不得把本 story context 当作源码完成证据。
  - [x] 重新读取 `_bmad-output/planning-artifacts/specs/README.md`，再按 owning SPEC 顺序读取 `01`、`04`、`05`、`06`、`07`、`08` 中与 fixture/output 相关的 sections；不要从 PRD、Architecture 或旧 story 复制 field-level truth。
  - [x] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的 behavior。若前置 implementation 尚未存在，按前序 story 顺序补齐或记录 blocker，不得在本 Story 内伪造通过状态。
  - [x] 检查 dirty worktree，保留用户、父 agent 或其它 sub-agent 的改动；不得格式化、重写、同步或回滚无关 planning docs、Story 1-5、其它 Epic 6 story、源码或 status 文件。

- [x] Task 2: 建立 fixture contract executable anchor（AC: 1-2, 7-8）
  - [x] 在 `src/fixtures/fixture-contract.ts` 或等价 module 中集中定义 fixture manifest parsing、case layout validation、expected output class registry、comparison policy 和 gate classification。该 module 是 implementation anchor，不是第二份契约真源。
  - [x] 定义 `FixtureCaseId`、`FixtureGroupId`、`FixtureSubCaseId`、`ExpectedOutputClass`、`FixtureGateClassification` 等 producer-facing types，并强制 lower-kebab validation。
  - [x] 将 release gate fixture project cases 固化为 registry-driven data：`fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity` group、`resolve-parity`、`path-portability`、`skill-artifact-loop`。
  - [x] 将 `source-integrity` required sub-cases 固化为 registry-driven data：`bundled-packaging-trusted`、`bundled-packaging-missing-evidence-blocked`、`registry-lock-trusted`、`registry-unverified`、`git-floating-blocked`、`local-source-snapshot-unverified`、`local-source-path-redacted`、`local-source-installed-state-blocked`、`artifact-hash-mismatch-blocked`、`source-unreadable-blocked`。
  - [x] 明确 `packaging-acceptance` 是 release checklist gate，不是 `test/fixtures/<case>/` fixture project case；它的 stable artifact 是 `dist/packaging-manifest.json`。

- [x] Task 3: 实现 fixture layout validator（AC: 1, 3, 8）
  - [x] 验证 single case layout：`test/fixtures/<case>/input/`、`test/fixtures/<case>/expected/`、`test/fixtures/<case>/README.md`。
  - [x] 验证 group sub-case layout：`test/fixtures/<group>/<sub-case>/input/`、`test/fixtures/<group>/<sub-case>/expected/`、`test/fixtures/<group>/<sub-case>/README.md`。
  - [x] 允许 `fixtures/sources/` 存放 reusable source packages，允许 `fixtures/expected/` 存放 shared expected snapshots，但每个 test 必须显式说明它验证的 fixture case 或 sub-case。
  - [x] 阻止或报告 generated output、cache、temporary、build output、`node_modules`、checkout root、home directory 或 absolute local path 被登记为 expected truth。
  - [x] 保持 fixture source assets、expected outputs 和 docs examples 的边界：fixture expected outputs 是 contract test assets，不是普通文档示例；文档示例只能引用或派生自 expected outputs。

- [x] Task 4: 定义 expected output class registry（AC: 2, 4, 7）
  - [x] 为 expected installed tree 建立 normalized file-tree summary 规则，并要求 installer-owned file 使用 hash assertion。
  - [x] 为 manifest/index snapshots 绑定 `src/manifest/manifest-schema.ts` executable parser；不得在 fixture helper 中 hand-roll manifest/index field checks。
  - [x] 为 command JSON output 绑定 `src/diagnostics/command-result-schema.ts` parser，并按 `CommandResult` semantic fields 比较。
  - [x] 为 validation issue set 绑定 `ValidationIssue` shape 和 taxonomy ordering；比较 severity、category、issueId、affectedPath/component、details、impact、suggestedNextStep。
  - [x] 为 `speclite resolve` stdout/stderr expected outputs 绑定 `src/config/resolve-output-schema.ts`：stdout parse 为 JSON semantics，stderr 逐行 parse 为 `ValidationIssue` JSON Lines。
  - [x] 为 human-readable output profiles 定义 normalized assertion helper：断言 field presence、section ordering、no ANSI、text equivalent、profile-specific content，而不是把 terminal wrapping 当作 raw bytes truth。

- [x] Task 5: 实现 stable comparison normalizers（AC: 3-6）
  - [x] 建立 project-relative POSIX path normalizer，并复用 `src/fs/path-normalizer.ts` 或等价共享 helper；不要在 fixture runner 内创建第二套路劲规则。
  - [x] 建立 non-stable field policy：只允许 schema-declared generated metadata timestamps 等明确字段被 normalize/exclude；unknown timestamp-like、random-like 或 environment-specific fields 必须 fail。
  - [x] 检查 stable outputs 中不得出现 absolute path、home directory、drive letter、OS-specific separator、credential、token、cache path、temporary path、process id、environment variable、stack trace、duration 或 profiling sample。
  - [x] 对 public JSON arrays 使用 contract ordering rules；不得依赖 filesystem traversal、object insertion order、async completion order、adapter completion order 或 test execution order。
  - [x] 对 human-readable output 分别覆盖 Compact width `<80`、Standard width `80-119`、Wide width `>=120` 和 Structured mode；断点只影响 presentation，不影响 `CommandResult` data、issue ordering、path normalization、exit code 或 fixture comparison。

- [x] Task 6: 收口 output profile fixture policy（AC: 5-6）
  - [x] 在 `src/diagnostics/output.ts` 或现有 output layer 中保持 Compact、Evidence、Structured profiles 共享同一 semantic model；command modules 不得自行拼接 status text、issue layout、path display 或 profile-specific private fields。
  - [x] Compact profile 覆盖 command title、high-level health/source/version/target count/next action 等快速摘要，不输出 automation-only hidden state。
  - [x] Evidence profile 覆盖 Summary、Steps/Checked、Paths/Targets、Issues/Conflicts、Next actions，并适用于 `install`、`validate`、`update` 默认 human-readable output。
  - [x] Structured profile 绑定 `CommandResult`、`ValidationIssue`、command-specific data payload、resolve JSON 或 governance artifact data，不受 terminal width、TTY、颜色、locale 或平台影响。
  - [x] `NO_COLOR`、non-TTY、CI 和 copy-paste review 场景必须无 ANSI escape，且 status、severity、issueId、category、path、next action 和 reason code 都有文本表达。

- [x] Task 7: 明确 release gate 与 regression asset 分类（AC: 8）
  - [x] 在 fixture registry 中标记 release gate fixture project、release-gate group sub-case、release checklist gate、regression asset 和 documentation example。
  - [x] Release gate fixtures 必须作为 MVP release 前的 blocking evidence；local developer runs 可以缩小 matrix，但 release evidence 必须包含 Node 22、Node 24、macOS 和 Windows path-portability coverage。
  - [x] Regression assets 是必需 repository assets，但除非 release checklist 显式提升为 gate，否则不阻塞 MVP release。
  - [x] `test/fixtures/` 与 root `fixtures/` 默认不得进入 package；除非某路径被明确标记为 packaged documentation example。Packaged examples 不等同于 release gate fixtures。
  - [x] Documentation examples 必须引用或派生自 fixture expected outputs，不能复制 schema 真源或定义第二套 contract。

- [x] Task 8: 编写 focused tests 与 minimum contract examples（AC: 1-8）
  - [x] Unit tests 覆盖 lower-kebab validation、single case layout、group sub-case layout、missing required directories、invalid expected class、gate classification 和 packaging-acceptance 非 fixture-project boundary。
  - [x] Comparator tests 覆盖 semantic JSON comparison、manifest/index parser wiring、stderr JSON Lines parsing、ValidationIssue ordering、path normalization、timestamp normalization/exclusion 和 random/env/path leak failure。
  - [x] Human output tests 覆盖 Compact/Evidence/Structured profiles、`NO_COLOR`、non-TTY、CI、narrow terminal key-value fallback 和 no spinner-only progress。
  - [x] Path portability tests 至少在 normalizer 层覆盖 POSIX style path、Windows separator normalization、drive letter leak rejection、home directory leak rejection、checkout-root-independent comparison 和 symlink/path escape diagnostic handoff。
  - [x] Snapshot or fixture update tests 必须证明 snapshot update 需要 explicit local action，CI 下 mismatch、missing 或 obsolete snapshots fail；不得让 CI 自动写入 expected outputs。
  - [x] 若实际 fixture cases 尚未具备前序 command implementation，可先建立 contract-level fixture examples 与 comparator tests；不要实现 Story 6.2-6.5 的完整 fixture matrix。

- [x] Task 9: 本地验证与交付边界（AC: 1-8）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 fixture contract、normalizer、comparator、diagnostics output profile、manifest/index parser wiring、CommandResult parser wiring 和 affected fixture tests。
  - [x] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass，不要跳过 comparison/redaction/profile tests，不要创建 private JSON shape。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-5、其它 Epic 6 story、Post-MVP Epic 7、无关源码或用户改动。
  - [x] 检查 diff，确认没有提前实现 `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity` full sub-case matrix、`resolve-parity` full behavior、`path-portability` OS matrix、`skill-artifact-loop` 或 complete packaging acceptance；本 Story 只提供 fixture contract foundation。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，root TypeScript CLI scaffold、status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation ordering anchors 已存在。root `fixtures/`、Epic 4 update/repair behavior、Epic 5 source-integrity behavior 和 Epic 6 fixture runner/release gate behavior 仍需按当前源码逐项确认。
- Story 3.5 command JSON contract 已存在，是 fixture comparison 的基础输入之一；但 Epic 3 没有实现 Epic 4/5/6 的 downstream behavior。实现 Story 6.1 前必须验证 Epic 1-5 的 actual source anchors、tests 和 fixture assets 是否已经真实创建。
- 当前 worktree 已有用户或其它流程产生的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Story 1-5 files。实现本 Story 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是 initialized placeholder，没有补充新的 implementation guardrails。实际 implementation guardrails 以 live PRD、Architecture、UX、owning SPEC 和本 Story 为准。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能指向不含 `tomllib` 的旧 runtime。
- 本 Story 是 ready-for-dev story context。它描述 dev agent 应如何实现、验证和守住边界；它不是 `src/fixtures/fixture-contract.ts`、fixture runner、expected outputs 或 tests 已存在的证明。

### Scope Boundary（范围边界）

- 本 Story 负责：fixture case layout、fixture group/sub-case layout、expected output class registry、semantic comparison rules、stable path/timestamp/randomness policy、human-readable output profile fixture policy、narrow terminal fallback assertions、contract-first snapshot update discipline、release gate vs regression asset classification，以及 focused fixture contract tests。
- 本 Story 消费：Story 1-5 产生的 CLI skeleton、CommandResult/ValidationIssue contract、manifest/index schema、diagnostics output layer、path normalizer、source descriptor/redaction model、update/repair planning boundaries 和 resolve contract。若这些 implementation anchors 尚未存在，dev agent 必须按前置 story 顺序处理或记录 blocker。
- 本 Story 不负责：实现完整 `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity` full group、`resolve-parity` full behavior、`path-portability` OS matrix、`skill-artifact-loop` end-to-end、release packaging checker、documentation examples rewrite、Post-MVP `doctor` / `sync` / `uninstall`、enterprise dashboards 或 coverage trend reports。
- 本 Story 不修改 owning SPEC。若实现中发现 fixture contract 需要变更，必须先提出并更新 owning SPEC，再更新 executable schema/parser/comparator 和 expected outputs。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node 26 当前为 Current，不进入 MVP baseline。不要使用 Node 24-only API，除非提供 Node 22-compatible path 并同步 runtime policy、fixtures 和 release matrix。
- CLI foundation 仍是 TypeScript + commander。不要为 fixture runner、snapshot helper 或 output profile 引入 oclif/yargs/cac/clipanion。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 existing executable schema/parser anchors。新增 dependency 前必须证明 Node 22 support、offline determinism、testability 和 redaction behavior。
- Storage model 是 filesystem-first/local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent fixture cache server 或 background process。
- `src/fixtures/fixture-contract.ts` 是 fixture layout、expected output comparison 和 release gate classification 的 executable implementation anchor。它不得重新定义 CommandResult、manifest/index、ValidationIssue、adapter registry 或 resolve semantics。
- `src/diagnostics/output.ts` 拥有 Compact、Evidence、Structured profiles。Fixture assertions 应驱动共享 renderer，而不是允许各 command 手写 output。
- `src/fs/path-normalizer.ts` 是 project-relative POSIX path、path escape、symlink escape、case conflict 和 redaction-safe path display 的共享边界。Fixture helper 不得复制第二套路劲逻辑。
- `src/manifest/manifest-schema.ts`、`src/diagnostics/command-result-schema.ts`、`src/config/resolve-output-schema.ts`、`src/ide/adapter-registry.ts` 和 validation taxonomy 是 semantic comparison 的 parser/schema sources。

### Implementation Anchors（实现锚点）

实际文件名应贴合已经落地的实现。如果文件尚不存在，应按架构边界创建；如果文件已经存在，修改前必须完整读取并保留既有 behavior。

- `src/fixtures/fixture-contract.ts`：fixture manifest parsing、layout validation、expected output classes、comparison policy、release gate/regression asset classification。
- `src/fixtures/fixture-runner.ts` 或 `test/fixtures/fixture-runner.ts`：读取 fixture case、执行 command 或 comparator、收集 actual outputs；不得拥有 field-level contract truth。
- `src/fixtures/comparators/json.ts` 或等价 helper：semantic JSON comparison、non-stable field normalization、stable array ordering checks。
- `src/fixtures/comparators/file-tree.ts` 或等价 helper：normalized file tree、raw-byte hash、installer-owned hash assertions、human/workflow-owned unchanged checks。
- `src/fixtures/comparators/human-output.ts` 或等价 helper：Compact/Evidence/Structured profile assertions、no ANSI、terminal width fallback、text equivalent checks。
- `src/fs/path-normalizer.ts`：project-relative POSIX path policy、redacted external path diagnostic、Windows separator and drive-letter leak rejection。
- `src/diagnostics/output.ts`：shared profile rendering and key-value fallback。
- `src/diagnostics/command-result-schema.ts`：`CommandResult` / `ValidationIssue` parser for command JSON expected outputs。
- `src/manifest/manifest-schema.ts`：manifest/index parser for expected manifest snapshots。
- `src/config/resolve-output-schema.ts`：resolve stdout JSON and stderr JSON Lines parser.
- `src/ide/adapter-registry.ts`：canonical target order and target id validation.
- `test/unit/fixtures/`、`test/fixtures/fixture-contract.test.ts`、`test/fixtures/_contract-baseline/` 或 equivalent：Story 6.1 focused tests and contract examples.

### Fixture Contract Requirements（Fixture 契约要求）

**Directory layout（目录布局）**

```text
test/fixtures/<case>/
  input/
  expected/
    file-tree.txt
    manifest/
    command-json/
    validation-issues.json
    stderr-jsonl/
  README.md

test/fixtures/<group>/<sub-case>/
  input/
  expected/
  README.md
```

- `<case>`、`<group>` 和 `<sub-case>` 必须是 stable lower-kebab names。
- `fixtures/sources/` 可保存 reusable source packages。
- `fixtures/expected/` 可保存 shared expected snapshots，但每个 test 必须显式声明验证的 fixture case。
- Fixture expected outputs 是 contract test assets，不是 documentation examples。

**Expected output classes（期望输出类别）**

- expected installed tree
- expected manifest/index snapshots
- expected command JSON output
- expected validation issue set
- expected stderr diagnostics as JSON Lines
- expected file hashes or normalized file-tree summary
- expected human-readable output profile assertions for Compact / Evidence / Structured

**Stable comparison policy（稳定比较策略）**

- Command JSON 必须 parse 后做 semantic comparison；不要比较 raw pretty-printed bytes。
- Resolve stdout JSON 必须 parse 后做 semantic comparison；stderr JSON Lines 必须逐行 parse 为 `ValidationIssue` objects。
- File content 使用 normalized expected tree + hash；installer-owned files 必须 hash assertion；human-owned/workflow-owned preservation 使用 unchanged checks。
- Public path fields 必须 project-relative POSIX-style；stable snapshots 不得包含 absolute path、home directory、drive letter、OS-specific separator、cache path、temporary path 或 credential-bearing source。
- Public JSON 默认不得包含 timestamps。`generatedAt` 等 schema-declared metadata timestamp 只能 parse/normalize/exclude，不比较具体值。
- Duration、elapsed time、p95 measurement、profiling sample 和 step timing 不进入 stable command JSON 或 fixture snapshots；它们属于 release/performance evidence。
- Random ids、process ids、environment variable values、stack traces 和 non-deterministic ordering 必须让 comparison fail。

**Human-readable output policy（人类可读输出策略）**

- Compact profile 用于 `status` 默认输出和成功无 issue 的简短结果。
- Evidence profile 用于 `install`、`validate`、`update` 默认 human-readable output。
- Structured profile 用于 `--json`、fixture expected outputs、CI 和治理报告。
- Human-readable output 与 `--json` 不必同形，但必须共享 status、issue、path、next action、severity 和 sorting semantics。
- Narrow terminal fallback 必须保留 severity、issueId、affectedPath、targetId、entryPath、next action、planned effect、conflict reason 和 artifact metadata 等关键字段。

**Gate classification policy（门禁分类策略）**

| Classification（分类） | Examples（示例） | Release Meaning（发布含义） |
| --- | --- | --- |
| Fixture project gate | `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`resolve-parity`、`path-portability`、`skill-artifact-loop` | MVP release 前必须通过；release evidence 覆盖 Node 22/24，path-portability 覆盖 macOS/Windows。 |
| Fixture group sub-case | `source-integrity/<sub-case>` required sub-cases | 每个 required sub-case 是 MVP release gate。 |
| Release checklist gate | `packaging-acceptance` / `npm run release:packaging-check` | 生成 `dist/packaging-manifest.json`，不是 fixture project case。 |
| Regression asset | richer examples、multi-skill scenarios、documentation examples | 必需 repository assets，但默认不阻塞 release，除非 release checklist 提升为 gate。 |
| Documentation example | packaged or docs-facing examples | 可引用 fixture expected outputs，不定义第二套 schema truth。 |

### Testing Requirements（测试要求）

- Use Vitest。
- Fixture contract tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、remote provenance service 或外部网络。
- JSON tests 必须 parse 后断言 semantic fields、ordering、path normalization、timestamp policy 和 redaction policy。
- Human-readable tests 必须覆盖 `NO_COLOR`、non-TTY、CI、terminal width `<80` / `80-119` / `>=120`、no ANSI、text equivalent 和 key-value fallback。
- Snapshot / fixture update tests 必须证明 CI 下 mismatch、missing 或 obsolete snapshots fail；CI 不写 snapshots。Local `vitest -u` 或 equivalent update 只能在 owning SPEC 与 executable parser 已同步之后使用。
- Comparator tests 必须包含 negative cases：absolute path leak、home directory leak、Windows drive letter leak、OS separator leak、timestamp leak、random id leak、process id leak、environment value leak、stack trace leak、unknown expected output class、invalid gate classification。
- Cross-platform path tests 应覆盖 macOS 与 Windows semantics。Windows 不要求 POSIX chmod behavior，但 files index 仍必须断言 `executable` intent。
- Performance evidence 只检查 evidence 存在、measurement method 和 pass/fail conclusion；不得比较具体 wall-clock values。
- Tests 不得把 current repo `_bmad`、`_bmad-output` 或 story files 当作 installed target fixture state。

### Previous Story Intelligence（前序 Story 情报）

- Story 5.5 明确强调 ready-for-dev story context 不是源码完成证据；Story 6.1 必须继承这一前置检查，先确认 Epic 1-5 actual implementation 是否存在。
- Story 5.5 的 source reporting/redaction policy 要进入 fixture negative tests：credential、absolute path、home directory、cache path、temporary extraction path、temporary Git checkout 和 raw stderr/stack trace 不得进入 public JSON、manifest/index、human-readable output 或 fixture snapshots。
- Story 5.5 的 `source-integrity` sub-case guidance 只覆盖 Epic 5 focused cases；Story 6.1 应建立 fixture classification 和 comparator foundation，不要提前实现完整 Story 6.3 source-integrity matrix。
- Story 3.5 的 `CommandResult` / `ValidationIssue` contract 是 command JSON 和 diagnostics fixture comparison 的基础；任何 JSON shape 变化必须先走 owning SPEC 和 executable schema。
- Story 4.3、4.4、4.6 的 plan-before-write、operation lock、safe write 和 repair boundary 会影响 `update` / `update --repair` fixture expected outputs；Story 6.1 只定义 comparison 与 layout，不改变 update semantics。
- 最近 5 个 commit 均为 docs/context/source/glossary/specs 方向，没有可复用的 TypeScript implementation commit pattern。Dev agent 必须读取实际源码与 tests，不得从 docs commits 推断实现已经存在。

### Latest Technical Information（最新技术信息）

- Node.js official releases 页面在 2026-05-26 显示 Node 24 为 LTS、Node 22 为 LTS，Node 26 为 Current；同页说明 production applications should use Active LTS or Maintenance LTS。SpecLite MVP 保持 Node 22 minimum + Node 24 recommended，不升级到 Node 26，不使用 Node 24-only API，除非提供 Node 22-compatible path 并同步 policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- Vitest snapshot 文档当前显示 Vitest v4.1.7，并说明 snapshot 会将 received value 与 reference snapshot 比较；不匹配时测试失败，snapshot artifacts 应与代码变更一起提交并 review。Story 6.1 的 JSON / fixture comparison 应优先使用 semantic JSON comparison 和 normalized fixture assertions，而不是 raw pretty-printed bytes。Source: https://vitest.dev/guide/snapshot.html
- Vitest snapshot 文档还说明 CI 默认不写 snapshots，snapshot mismatch、missing snapshot 和 obsolete snapshot 会让 run fail。Story 6.1 不得依赖 CI 自动更新 snapshots；snapshot update 必须是本地显式动作，并且必须排在 owning SPEC 与 executable parser/schema 更新之后。Source: https://vitest.dev/guide/snapshot.html
- No new third-party dependency is required by default. 如需引入 snapshot serializer、fixture parser 或 comparator dependency，必须先确认 Node 22 support、offline determinism、cross-platform path behavior、redaction behavior 和 CI failure semantics。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, owning SPEC artifacts and this Story.
- Project-level language rule remains: conversation and generated docs in Chinese, section headings use `English（中文）`, technical identifiers remain English.

### References（参考资料）

- `_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/architecture/index.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-26.md`
- `_bmad-output/implementation-artifacts/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md`
- `_bmad-output/project-context.md`
- Node.js releases: https://nodejs.org/en/about/previous-releases
- Vitest snapshot guide: https://vitest.dev/guide/snapshot.html

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 失败：系统 Python 缺 `tomllib`，已按 skill fallback 手动读取 customization；配置事实来自 `.agents/skills/bmad-dev-story/customize.toml`，team/user override 文件不存在。
- `npx vitest run test/fixture-contract.test.ts`：先红后绿，最终 8 tests passed。
- `npm run build`：通过，tsup ESM/DTS build success。
- `npx vitest run test/fixture-contract.test.ts test/contract-anchors.test.ts test/skill-artifact-loop.test.ts test/validate-command.test.ts test/update-planning.test.ts`：5 files / 52 tests passed。
- `npm test`：35 files / 266 tests passed。

### Completion Notes List（完成备注列表）

- Story context created by bmad-create-story sub-agent for Story 6.1 only.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- This story is ready-for-dev context, not implementation completion evidence.
- 完成 fixture contract executable anchor 扩展：fixture case/group/sub-case lower-kebab validation、layout validator、expected output class registry、release gate / group sub-case / packaging checklist gate classification。
- 完成 expected output parser wiring：CommandResult、ValidationIssue set、stderr JSON Lines diagnostics、manifest/index snapshots 均复用 owning executable schemas。
- 完成 stable comparison foundation：project-relative POSIX path normalization、schema-declared non-stable timestamp normalization、absolute/home/drive/cache/temp/build/credential/stack/random field leak failure。
- 完成 human-readable output profile assertion helper：Compact/Evidence/Structured profiles、no ANSI、icon/spinner-only rejection、narrow terminal key-value fallback required fields。
- 完成 snapshot update discipline guard：expected output update 必须在 owning SPEC 与 executable parser/comparator 更新后，通过显式 local action 执行，CI 中不得自动写 snapshot。
- 未新增第三方依赖；未实现 Story 6.2-6.5 的 full fixture matrix、OS runtime matrix、full release packaging checker 或 documentation examples rewrite。

### File List（文件列表）

- `src/fixtures/fixture-contract.ts`
- `test/fixture-contract.test.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/6-1-fixture-case-layout-and-expected-output-contract.md`

## Change Log（变更日志）

- 2026-06-02：实现 Story 6.1 fixture contract foundation、focused Vitest coverage、Story 状态与 sprint tracking 更新至 review。
