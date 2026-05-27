# Story 3.3: IDE Mirror And File Integrity Validation（IDE 镜像与文件完整性验证）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为工具链维护者，
我希望 `speclite validate` 能检查 IDE mirrors 与 installed manifest/hash baseline 是否一致，
以便发现 `.claude/skills`、`.agents/skills` 或 installer-owned 文件发生的 drift，并获得稳定、可复现的诊断结果。

## Acceptance Criteria（验收标准）

1. **Claude mirror package hash is checked against the manifest baseline（Claude 镜像包 Hash 与 Manifest Baseline 一致）**
   **前提** manifest / skill index 记录了某个 `canonicalSkillId` 的 `canonicalPackageHash`，且该 skill 映射到 `claude` target；
   **当** 用户运行 `speclite validate`，且 `.claude/skills/<canonicalSkillId>/` 中存在 mapped self-contained skill entry；
   **则** 系统必须按本 Story 的 Canonical Package Hash Algorithm Contract 计算当前 entry 的 canonical package hash，并与 installed manifest/index baseline 比较；
   **并且** package-level mismatch 必须报告 `issueId: "ide-mirror.hash-mismatch"`、`category: "ide-mirror"`、`severity: "error"` 和 project-relative POSIX `affectedPath`；
   **并且** 不得因为 target directory 是 `.claude/skills` 而允许 canonical package 内容偏离 baseline。

2. **Agents mirror package hash is checked against the same canonical baseline（Agents 镜像包 Hash 与同一 Canonical Baseline 一致）**
   **前提** manifest / skill index 记录了同一 `canonicalSkillId` 的 `canonicalPackageHash`，且该 skill 映射到 `agents` target；
   **当** 用户运行 `speclite validate`，且 `.agents/skills/<canonicalSkillId>/` 中存在 mapped self-contained skill entry；
   **则** 系统必须使用同一 Canonical Package Hash Algorithm Contract 验证该 entry 的 canonical package hash 与 manifest baseline 一致；
   **并且** 若同一 canonical skill 同时安装到 `claude` 与 `agents`，两个 target 的 canonical package content 必须等价；
   **并且** target-specific wrapper、discovery metadata 或 adapter artifact 不得混入 canonical package hash，只能通过 files index 的独立 file-level hash 校验。

3. **Files index installer-owned entries are checked by raw bytes（Files Index 中 Installer-Owned 文件按 Raw Bytes 校验）**
   **前提** `_speclite/_config/files-index.json` 记录了 `ownership: "installer-owned"` 的 file-level hash；
   **当** `validate` 检查已安装文件；
   **则** 系统必须基于当前文件 raw bytes 计算 `sha256`，并与 files index 中记录的 file-level hash 比较；
   **并且** mismatch 必须报告 `issueId: "file-integrity.hash-mismatch"`、`category: "file-integrity"`、`severity: "error"` 和 project-relative POSIX `affectedPath`；
   **并且** 缺失的 installer-owned 文件必须报告 `file-integrity.missing-installer-owned-file`；
   **并且** line ending、executable bit、file mode、symlink handling 和 case conflict 必须作为独立 validation dimensions，不得被 hash normalization 隐式吸收。

4. **Validate reports drift without repairing or rewriting files（Validate 只报告 Drift，不修复或重写文件）**
   **前提** `validate` 发现 IDE mirror drift、canonical package mismatch、file-level hash mismatch 或 missing installer-owned file；
   **当** 命令输出诊断结果；
   **则** issue 必须包含稳定 `issueId`、`category`、`severity`、`affectedPath`、redaction-safe `details`、`impact` 和 `suggestedNextStep`；
   **并且** `validate` 不得写入、删除、chmod、normalize、repair、regenerate 或覆盖任何 drift 文件；
   **并且** suggested next step 应引导用户运行后续明确的 `speclite update --repair` 或人工检查路径，而不是静默覆盖。

5. **Missing, duplicate, or overlapping target entries produce target-specific diagnostics（缺失、重复或重叠 Target Entry 产生 Target-Specific 诊断）**
   **前提** manifest / skill index 声明某 canonical skill 应映射到某个 IDE target；
   **当** `validate` 检查 target mirror；
   **则** expected skill entry 缺失必须报告 `ide-mirror.missing-entry`；
   **并且** 同一 target 中存在多个 entry 声称或投影到同一 `canonicalSkillId` 时，必须报告 `ide-mirror.duplicate-entry`；
   **并且** 额外 entry 与已安装 canonical skill id 重叠时，必须报告 missing、mismatched 或 duplicate 中最具体的 stable issue；
   **并且** 不得生成未在 taxonomy 中保留的自由文本 issue id。

6. **Repeated validate runs remain deterministic（重复 Validate 运行保持确定性）**
   **前提** 同一安装状态连续运行 `speclite validate` 三次，且 manifest、IDE mirrors 和 files index 未发生变化；
   **当** 系统返回 human-readable output 与 `--json` output；
   **则** `issues` 的 `issueId`、`category`、`severity`、`affectedPath`、`details`、`impact` 和 `suggestedNextStep` 语义内容保持一致；
   **并且** `validate.data.checkedTargets` 遵守 adapter registry canonical target order：`claude`，然后 `agents`；
   **并且** `validate.data.validatedPaths` 先规范化为 project-relative POSIX path，再按 lexicographic order 输出；
   **并且** 输出不得依赖 filesystem traversal order、glob order、object key order、async completion order、local absolute path、timestamp 或 hash value。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现与当前仓库状态（AC: 1-6）
  - [ ] 确认 Epic 1 / Epic 2 / Story 3.1 / Story 3.2 的实际代码已经建立 TypeScript CLI scaffold、`speclite validate` command hook、manifest/index executable schemas、files index generation、IDE adapter registry、diagnostics/output、`src/fixtures/fixture-contract.ts` 和 fixture assets/tests；不能只依据 story context 的 `ready-for-dev` 状态判断完成。
  - [ ] 如果 `package.json`、`src/`、`test/`、`tests/`、`src/bin/speclite.ts`、`src/commands/validate.ts`、`src/manifest/manifest-schema.ts`、`src/manifest/hash.ts`、`src/validation/validate-project.ts`、`src/validation/rules/manifest-schema.ts`、`src/ide/adapter-registry.ts`、`src/diagnostics/command-result-schema.ts` 或 `src/fs/path-normalizer.ts` 尚不存在，先完成前置 stories；不得在 Story 3.3 中创建孤立的 mirror/hash validation scaffold。
  - [ ] 修改前完整读取所有 UPDATE files，尤其是 `src/validation/rules/ide-mirror.ts`、`src/validation/rules/file-integrity.ts`、`src/ide/mirror-validator.ts`、`src/manifest/manifest-generator.ts` 或等价 files-index helper、`src/manifest/manifest-schema.ts`、`src/manifest/hash.ts`、`src/validation/validate-project.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts` 和 `src/fs/path-normalizer.ts`。
  - [ ] 检查 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [ ] Task 2: 建立 canonical package hash comparison（AC: 1, 2, 5, 6）
  - [ ] 在 `src/ide/mirror-validator.ts`、`src/validation/rules/ide-mirror.ts` 或既有 mirror validation anchor 中实现 package-level mirror comparison；不要在 `src/commands/validate.ts` 中直接遍历和拼接 issue。
  - [ ] 从 manifest / skill index 读取 `canonicalSkillId`、`canonicalPackageHash` 和 `installedTargets[]`，并仅使用 `src/ide/adapter-registry.ts` 声明的 MVP target ids：`claude`、`agents`。
  - [ ] 按 Canonical Package Hash Algorithm Contract 计算 canonical package content：`SKILL.md`、`CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example`、`customize.toml` 等 source package paths 如存在则参与 hash。
  - [ ] 明确排除 adapter-specific discovery metadata、wrapper files、capability catalog、command pointer placeholder 或 target-local generated files；这些文件若由 installer 管理，只能通过 files index 的 file-level hash 校验。
  - [ ] 对 missing expected entry 输出 `ide-mirror.missing-entry`；对 content mismatch 输出 `ide-mirror.hash-mismatch`；对同 target duplicate canonical skill entry 输出 `ide-mirror.duplicate-entry`。
  - [ ] `details` 使用稳定机器上下文，例如 `targetId`、`canonicalSkillId`、`reason`、`expectedHashAlgorithm` 和 `baselineKind`；不得包含 actual hash、expected hash、absolute path、home directory、timestamp、stack trace 或 raw filesystem error。

- [ ] Task 3: 实现 files index raw-byte integrity checks（AC: 3, 4, 6）
  - [ ] 在 `src/validation/rules/file-integrity.ts` 或既有 validation rule module 中读取 `_speclite/_config/files-index.json` 的已解析结果；schema/shape 错误继续由 Story 3.2 的 `manifest-schema` rule 负责。
  - [ ] 只对 `ownership: "installer-owned"` 且属于 installed runtime/control hub、IDE execution plane 或 installer-generated artifact 的 entries 执行 current raw-byte hash comparison。
  - [ ] 使用 shared hash helper（例如 `src/manifest/hash.ts`）计算 `sha256`；不要新增第三方 hash dependency，不要把 text normalization、line ending normalization 或 JSON pretty-print 作为 hash 输入替代。
  - [ ] 文件缺失时输出 `file-integrity.missing-installer-owned-file`；raw-byte hash mismatch 时输出 `file-integrity.hash-mismatch`；无法可靠建立 ownership 时输出 `file-integrity.unknown-ownership`。
  - [ ] executable intent mismatch、case conflict、stale safe-write temp file 等维度如果已能由本 Story 检查，则使用 taxonomy 已保留的 `file-integrity.executable-bit-mismatch`、`file-integrity.case-conflict`、`file-integrity.stale-temp-file`；否则保留为明确后续 validation dimension，不得把它们吞进 hash mismatch。
  - [ ] Human-owned 和 workflow-owned files 不得被 Story 3.3 的 drift check 当作可自动修复对象；如需要报告，只能报告 ownership/risk，不得要求 validate 修改它们。

- [ ] Task 4: 接入 validate orchestration and deterministic data projection（接入 Validate 编排与确定性数据投影）（AC: 4, 6）
  - [ ] `src/commands/validate.ts` 继续只负责参数解析、project root resolution、调用 `validateProject` / equivalent domain service，并返回 `CommandResult<ValidateCommandData>`。
  - [ ] `src/validation/validate-project.ts` 或 equivalent aggregator 必须在 `manifest-schema` schema validation 之后执行 `ide-mirror` 和 `file-integrity` rules；如果 manifest/index 无法读取，后续 rules 不得伪造 mirror 或 file integrity 结果。
  - [ ] `checkedCategories` 只列出实际执行的 categories，并遵守 canonical issue category order；执行本 Story checks 时必须包含 `ide-mirror` 和/或 `file-integrity`。
  - [ ] `checkedTargets` 只列出实际检查的 targets，并遵守 adapter registry order：`claude`，然后 `agents`。
  - [ ] `validatedPaths` 必须包含实际检查过的 target directories、manifest/index paths 或 files-index paths，全部规范化为 project-relative POSIX path 后按字典序输出。
  - [ ] `CommandResult.issues` 必须按 severity order、canonical issue category order、normalized affected path、issue id 排序；不得按发现顺序、rule execution order 或 async completion order 输出。
  - [ ] Human-readable validate output 使用 shared diagnostics/output layer；不得在 validation rule 内自行拼接 issue layout、path display、summary 或 next action ordering。

- [ ] Task 5: 保持 read-only validation and repair boundary（保持只读验证与 Repair 边界）（AC: 4, 5）
  - [ ] `speclite validate` 不得调用 update planner、repair planner、safe write、chmod、copy-tree、target writer、manifest generator 或 IDE mirror writer。
  - [ ] 对 IDE mirror drift 或 installer-owned file drift，human-readable output 和 JSON `suggestedNextStep` 必须指向明确后续路径，例如运行 `speclite update --repair` 或人工检查 affected path；不得暗示 validate 已修复。
  - [ ] 普通 `speclite update` 的确认或 `--yes` 不得修复 drift；drift repair 只属于后续 Epic 4 的 `update --repair` 明确授权路径。
  - [ ] Validate 可以报告 stale lock warning，但不得删除 lock 或 stale temp files；write-capable command 的 operation lock 行为不属于本 Story。

- [ ] Task 6: 编写 focused tests、integration tests 和 fixture assertions（AC: 1-6）
  - [ ] Unit tests 覆盖 `.claude/skills/<canonicalSkillId>/` missing entry、package hash mismatch、valid package hash、duplicate canonical skill entry。
  - [ ] Unit tests 覆盖 `.agents/skills/<canonicalSkillId>/` missing entry、package hash mismatch、valid package hash、duplicate canonical skill entry。
  - [ ] Unit tests 覆盖同一 canonical skill 在 `claude` 与 `agents` targets 中 canonical package hash 一致，且 adapter artifacts 不参与 canonical package hash。
  - [ ] Unit tests 覆盖 files index installer-owned raw-byte hash mismatch、missing installer-owned file、unknown ownership、project-relative POSIX path normalization。
  - [ ] Unit tests 覆盖 details redaction：不得出现 actual/expected hash values、absolute path、home directory、temporary/cache path、timestamp、stack trace 或 raw exception object。
  - [ ] Integration / fixture tests 覆盖 valid installed mirrors、`ide-drift` fixture、files index mismatch fixture、missing target entry fixture 和 duplicate entry fixture。
  - [ ] 重复运行相同 validate fixture 至少 3 次，确认 issue arrays、issueCounts、checkedCategories、checkedTargets、validatedPaths、nextActions 和 `--json` semantic output 稳定。
  - [ ] Negative tests 断言 validate 不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、temporary extraction root 或 source checkout，也不执行 update/repair/write/chmod。

- [ ] Task 7: 本地验证与范围控制（AC: 1-6）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 IDE mirror validation、file integrity validation、CommandResult projection、path normalization 和 validate integration focused tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass 或创建 validate-only fallback implementation。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [ ] 检查 diff，确认没有实现 Story 3.4 的 runtime/menu/legacy/artifact validation、Story 3.5 的全量 CommandResult 迁移、Story 3.6 的 progress/category coverage、Epic 4 update/repair apply behavior、Epic 5 remote freshness/provenance checks 或 Epic 6 release fixture matrix。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 `package.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 3.3 的开发必须在 Epic 1 / Epic 2 / Story 3.1 / Story 3.2 的实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 到 `1-6`、`2-1` 到 `2-5`、`3-1` 和 `3-2` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Epic 2 / 3-1 / 3-2 story 文件。实现 Story 3.3 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、module help catalog、custom stubs、legacy Python resolver scripts 和 canonical skill packages。Story 3.3 validate 必须检查 installed projection 与 IDE mirrors，不得把 source checkout 当成 installed state，也不得访问 remote source。

### Previous Story Intelligence（前序 Story 延续约束）

- Story 3.1 明确 `status` 是 lightweight installed-state summary，不执行 full file hash scan，不输出 `issueCounts`、`checkedCategories`、`checkedTargets` 或 `validatedPaths`。Story 3.3 的 drift diagnostics 必须留在 `speclite validate`。
- Story 3.2 已把 manifest、skill index、help index、files index 和 phase coverage 的 schema/shape validation 放入 `manifest-schema` boundary。Story 3.3 不应重复实现 schema parser，也不应把 schema corruption 映射为 `ide-mirror` 或 `file-integrity`。
- Story 3.2 明确 package-level `canonicalPackageHash` 与 files index file-level hash 是两层不同语义。Story 3.3 必须保持该分层：package-level mirror mismatch 用 `ide-mirror`；generic installed file raw-byte mismatch 用 `file-integrity`。
- Story 3.2 要求 `ValidateCommandData.issueCounts` 固定包含 `info`、`warning`、`error`、`critical`，`checkedCategories` 使用 canonical issue category order，`checkedTargets` 使用 adapter order，`validatedPaths` 使用 normalized lexicographic order。Story 3.3 只能扩展这些已定义字段，不能新增未契约化 validate payload。
- Story 3.1 / 3.2 都强调 `validate` local-only、read-only。Story 3.3 发现 drift 时只报告，不修复；repair 行为属于后续 Epic 4 的 `update --repair` 明确授权路径。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts 和 owning SPECs，而不是已提交 TypeScript implementation；dev agent 不得从这些 docs commit 推断源码已经存在。
- 由于当前 repository implementation scaffold 尚未出现，Story 3.3 实现前必须重新检查 git history 和 worktree，确认前置代码是否已经由其他 agent 添加。

### Scope Boundary（范围边界）

- 本 Story 只负责 `speclite validate` 的 IDE mirror package-level drift detection、files index installer-owned raw-byte hash comparison、missing/duplicate target entry diagnostics、read-only drift reporting、deterministic validate projection 和 focused fixtures/tests。
- 本 Story 不负责：
  - Epic 1 的 CLI scaffold、install source discovery、module selection、config initialization、manifest/index generation、IDE mirror writes 或 install ready summary。
  - Epic 2 的 methodology discovery metadata、skill entry mapping、phase coverage generation、activation target validation、`speclite resolve` runtime support 或 workflow artifact metadata validation。
  - Story 3.1 的 lightweight `speclite status` UX 或 high-level health aggregation。
  - Story 3.2 的 manifest/index schema validation、schema migration diagnostics 或 index required field parser。
  - Story 3.4 的 runtime path、menu target uniqueness、legacy namespace residue、artifact path boundary、symlink/path escape 或 stale entry manual cleanup guidance。
  - Story 3.5 的 complete CommandResult / ValidationIssue contract migration across all commands.
  - Story 3.6 的 full validation progress, category coverage, checked category/target/path display UX and issue ordering coverage beyond what Story 3.3 directly produces.
  - Epic 4 update/repair write planning, safe write, operation lock enforcement, update conflicts or repair apply behavior.
  - Epic 5 remote freshness/provenance revalidation, source lockfile lifecycle or enterprise source policy.
  - Epic 6 full release gate fixture matrix beyond focused IDE drift and file integrity fixtures.
  - Post-MVP `doctor`, `sync`, `uninstall`, top-level `repair`, migration tooling, governance dashboard, coverage percentage, trend report, command pointer artifacts or dedicated Copilot/Cursor adapters.

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。除非已有 Node 22-compatible path 并同步更新 runtime policy / fixtures，否则不得使用 Node 24-only API。
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Storage model 是 local-first filesystem。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/validate.ts` 只负责 orchestration。Manifest/index parsing 属于 `src/manifest/`；target id/order belongs to `src/ide/`; issue model and projection belongs to `src/diagnostics/` and `src/validation/`; hash/path behavior belongs to `src/manifest/hash.ts` and `src/fs/path-normalizer.ts`.
- Runtime schema validation 如已在前置 stories 中使用 `zod@4.4.3`，继续复用同一 dependency 和 style；不要为了 Story 3.3 引入新 schema library。
- Hashing 应复用 Node.js 22-compatible built-in crypto 或前置 stories 已建立的 shared hash helper；不要新增 native hash dependency，不要依赖 platform-specific file metadata。
- All public paths in command output, issues, details, fixtures and manifest/index projections must be project-relative POSIX-style unless an owning SPEC explicitly marks a field as redacted/non-stable.
- Human-readable output and `--json` output must share the same semantic model. Renderer modules must not invent a second issue shape, command status, path policy or sorting policy.

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/bin/speclite.ts` 通过 commander 注册 `speclite validate`。
- `src/commands/validate.ts` 拥有 command orchestration，并返回 `CommandResult<ValidateCommandData>`。
- `src/manifest/manifest-schema.ts` 拥有 manifest、skill index、help index、files index 和 phase coverage projection 的 executable schemas/parsers。
- `src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价拆分模块拥有 files index domain access 或 projection helpers。
- `src/manifest/hash.ts` 拥有 canonical package hash 与 raw-byte file hash helpers。
- `src/ide/adapter-registry.ts` 拥有 canonical target order、target id validation 和 self-contained entry layout policy。
- `src/ide/mirror-validator.ts` 或 `src/validation/rules/ide-mirror.ts` 拥有 Story 3.3 的 IDE mirror validation rule。
- `src/validation/rules/file-integrity.ts` 拥有 Story 3.3 的 files index raw-byte integrity rule。
- `src/validation/validate-project.ts` 拥有 validation aggregation、checkedCategories / checkedTargets / validatedPaths collection 和 deterministic sorting。
- `src/diagnostics/command-result-schema.ts` 拥有 `CommandResult`、`ValidationIssue`、`ValidateCommandData` 和 command id validation。
- `src/diagnostics/command-result.ts` 拥有 status/exit-code projection，且必须根据 issues severity 推导 validate command status。
- `src/diagnostics/output.ts` 拥有 Evidence human-readable validate rendering 与 Structured JSON rendering。
- `src/fs/path-normalizer.ts` 拥有 project-relative POSIX path normalization。

如果这些文件已经由前置 stories 创建，修改前必须完整阅读并保留既有行为。如果它们因为前置 stories 尚未实现而不存在，停止 Story 3.3 实现并先完成前置条件，不要构建一个孤立的 mirror/hash validation scaffold。

### IDE Mirror Contract Notes（IDE 镜像契约备注）

- MVP target ids and order are owned by adapter registry: `claude`, then `agents`.
- Physical target directories:
  - `claude`: `.claude/skills`
  - `agents`: `.agents/skills`
- Self-contained skill entry directory names must use `canonicalSkillId`:
  - `.claude/skills/<canonicalSkillId>/`
  - `.agents/skills/<canonicalSkillId>/`
- Canonical package content includes source package files copied into installed entry when present:
  - `SKILL.md`
  - `CHANGELOG.md`
  - `references/`
  - `assets/`
  - `scripts/`
  - `config.toml.example`
  - `customize.toml`
- Adapter-specific discovery metadata, wrapper files or capability catalog entries are adapter artifacts, not canonical package content. They need separate files index entries if installer-owned.
- Installed entry must not read source checkout skill files as runtime dependencies. Reverse validation must prove the entry works from installed target directories.
- MVP must not invent `copilot` or `cursor` target ids. `.agents/skills` is represented as `agents` and must not be rendered as branded Copilot/Cursor readiness.

### Canonical Package Hash Algorithm Contract（Canonical Package Hash 算法契约）

Story 3.3 的 `canonicalPackageHash` 必须是可复现的 package-level equality hash。实现必须使用同一算法生成 installed manifest/index baseline，并在 `speclite validate` 中重新计算 installed entry hash；validate 不得扫描 source checkout 来重建 baseline。

Algorithm rules：

- Input root 是一个 self-contained installed skill entry directory，例如 `.claude/skills/<canonicalSkillId>/` 或 `.agents/skills/<canonicalSkillId>/`。
- Candidate paths 只来自 adapter registry self-contained entry layout：required `SKILL.md`，以及存在时的 `CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example`、`customize.toml`。
- 对目录 candidate，递归收集其中的 regular files；空目录不产生 hash record；缺失 optional candidate 不产生 hash record；缺失 required `SKILL.md` 必须导致 package 不等价，并报告 `ide-mirror.hash-mismatch` 或更具体的 missing-entry finding。
- 每个 hash record 使用 entry-root-relative POSIX path。Records 必须先按 normalized relative POSIX path lexicographic order 排序，再进入 hash stream；不得依赖 filesystem traversal order、glob order、object key order、locale collation 或 async completion order。
- Hash stream 必须包含明确 record framing，格式为 UTF-8 metadata 与 raw bytes 的确定序列：`pathLength\npath\nbyteLength\nrawBytes\n`。`pathLength` 和 `byteLength` 使用十进制 ASCII。Final hash 是该 stream 的 `sha256` hex digest。
- File bytes 使用 raw bytes。不得 normalize Markdown whitespace、JSON formatting、line endings、path separators、frontmatter、trailing newline 或 generated timestamps。
- POSIX executable bit、file mode、mtime、ctime、uid/gid、platform permission bits 和 extended attributes 不进入 `canonicalPackageHash`；这些属于独立 validation dimensions，不能被塞进 package hash semantics。
- Symlink 不作为 canonical package file 参与 hash，也不得 follow symlink target。canonical candidate path 下出现 symlink 时，该 package shape 不满足 canonical package equality，必须用 redaction-safe reason 报告 `ide-mirror.hash-mismatch`；不得把 symlink target、absolute path 或 readlink result 放入 public details。
- Adapter-specific discovery metadata、wrapper files、capability catalog、command pointer placeholder 或 target-local generated files 必须排除在 candidate paths 之外；如果这些文件由 installer 管理，只能通过 files index 的 file-level hash 校验。
- 同一 `canonicalSkillId` 安装到多个 targets 时，各 target installed entry 必须使用上述算法与同一个 installed manifest/index `canonicalPackageHash` baseline 比较；targets 之间不得各自发明 target-specific package hash baseline。

### File Integrity Contract Notes（文件完整性契约备注）

- Files index required fields: `schemaVersion`, `path`, `ownership`, `hash`, `hashAlgorithm`, `executable`, `artifactKind`, `sourceRef`.
- `hashAlgorithm` must be `sha256`.
- File-level hash compares raw file bytes. Do not normalize line endings, path separators, JSON formatting, Markdown whitespace, executable bit, file mode or symlink shape into content hash.
- Line ending, executable bit, file mode, symlink handling and case conflict are independent validation dimensions. Use reserved taxonomy ids when implemented.
- `_speclite/.lock` and safe-write temporary files are volatile control files. They must not be recorded in files index or stable files-index hashes. Validate can report stale temp/lock issues only through dedicated categories and must not auto-clean them.
- Human-owned and workflow-owned files can appear in files index for protection, but automatic update/repair must not mutate them. Story 3.3 must not treat their content drift as safe repair action.

### Validation Issue Mapping（Validation Issue 映射）

Use only reserved MVP issue ids from the taxonomy unless the owning SPEC is updated first:

- `ide-mirror.missing-entry`: target mirror is missing an expected self-contained skill entry.
- `ide-mirror.hash-mismatch`: target mirror package content differs from canonical package hash baseline.
- `ide-mirror.duplicate-entry`: target contains more than one entry for the same canonical skill.
- `ide-mirror.unsupported-target`: adapter-declared target cannot represent required entry type.
- `ide-mirror.target-write-failed`: target write or generation failed during install/update; Story 3.3 validate should normally observe existing state, not create this from a write attempt.
- `file-integrity.hash-mismatch`: installed file raw-byte hash differs from files index.
- `file-integrity.missing-installer-owned-file`: files index references a missing installer-owned file.
- `file-integrity.control-file-drift`: manifest-generated control file drift.
- `file-integrity.unknown-ownership`: ownership cannot be established safely.
- `file-integrity.unsafe-overwrite-risk`: drift indicates unsafe overwrite risk.
- `file-integrity.case-conflict`: normalized path conflicts under case-insensitive behavior.
- `file-integrity.executable-bit-mismatch`: executable intent differs from installed file state.
- `file-integrity.stale-temp-file`: safe-write temp file residue.

Stable `details` suggestions:

```ts
type IdeMirrorIssueDetails = {
  targetId: "claude" | "agents";
  canonicalSkillId: string;
  baselineKind: "canonical-package-hash" | "installed-targets";
  expectedHashAlgorithm?: "sha256";
  reason:
    | "missing-entry"
    | "hash-mismatch"
    | "duplicate-entry"
    | "unsupported-target";
};

type FileIntegrityIssueDetails = {
  ownership?: "installer-owned" | "human-owned" | "workflow-owned";
  artifactKind?: string;
  expectedHashAlgorithm?: "sha256";
  reason:
    | "hash-mismatch"
    | "missing-installer-owned-file"
    | "unknown-ownership"
    | "control-file-drift"
    | "unsafe-overwrite-risk"
    | "case-conflict"
    | "executable-bit-mismatch"
    | "stale-temp-file";
};
```

Do not include actual hash values, expected hash values, raw parser exceptions, stack traces, absolute paths, timestamps, home directories, temporary/cache paths, credentials or random IDs in `details`.

### Validate Data Contract（Validate 数据契约）

Minimum `ValidateCommandData` shape:

```ts
type ValidationIssueCounts = {
  info: number;
  warning: number;
  error: number;
  critical: number;
};

type ValidateCommandData = {
  issueCounts: ValidationIssueCounts;
  checkedCategories: IssueCategory[];
  checkedTargets: string[];
  validatedPaths: string[];
};
```

Rules:

- `issueCounts` must include all four severity keys, even when value is 0.
- `checkedCategories` must use canonical category order and include only executed categories.
- `checkedTargets` must use adapter registry canonical target order.
- `validatedPaths` must be normalized project-relative POSIX paths sorted lexicographically.
- `CommandResult.issues` must be sorted by severity order, category order, normalized affected path, issue id.
- `validate` failures with error/critical issues must produce `CommandResult.status: "failure"` and non-zero exit code.
- `validate` warnings only must produce `CommandResult.status: "warning"` and exit code 0.
- Human-readable output cannot be the only carrier for automation-relevant fields.
- Public JSON must not include ANSI escape, icons, terminal-width formatting, local absolute paths, home directory, cache paths, temporary extraction paths, timestamps or non-deterministic ordering.

### Local-Only And No-Write Boundary（本地只读与禁止写入边界）

`speclite validate` for Story 3.3 may read:

- `_speclite/_config/manifest.yaml`
- `_speclite/_config/skill-index.json`
- `_speclite/_config/files-index.json`
- `_speclite/_config/help-index.json` only as needed to avoid duplicate canonical identity assumptions
- `_speclite/_config/phase-coverage.json` only as needed to confirm installed target visibility
- `.claude/skills/<canonicalSkillId>/`
- `.agents/skills/<canonicalSkillId>/`
- Installer-owned file paths listed in files index
- `_speclite` path presence required to find the installed-state config root

`speclite validate` for Story 3.3 must not:

- access npm registry, private registry, Git remote, offline bundle origin, package-manager cache, temporary extraction root, source checkout or remote provenance service;
- execute full `speclite status`, implicit update check, update plan or repair plan;
- write, delete, chmod, normalize, format, repair, regenerate or copy project files;
- acquire write operation lock as if it were a write-capable command;
- scan arbitrary project files outside manifest/index declared installed-state paths;
- report the same physical drift twice as both `ide-mirror` and `file-integrity` when one more specific issue fully describes it.

### Output UX Requirements（输出体验要求）

- Default human-readable `validate` should use Evidence profile, not the Compact status profile.
- Issue rows must show severity, category, issue id, affected path or component, impact and suggested next step.
- IDE mirror drift should lead with the canonical skill id and target id in human-readable context, while keeping public JSON dynamic context in `details`.
- File integrity drift should lead with the affected project-relative path and ownership/risk context, not raw hash values.
- Empty issue state must be explicit; however, `No issues found` is only valid for categories actually checked.
- Output must work under `NO_COLOR`, non-TTY, CI and narrow terminal. Color, symbol or table layout must never be the only carrier of severity, issue id, path or next action.
- `--json` output must not include ANSI escape, icons, terminal-width formatting, local absolute paths, home directory, cache paths, temporary extraction paths, timestamps, hash values or non-deterministic ordering.

### Testing Requirements（测试要求）

- IDE mirror tests:
  - valid `.claude/skills/<canonicalSkillId>/` package hash passes.
  - valid `.agents/skills/<canonicalSkillId>/` package hash passes.
  - canonical package hash record sorting is stable across filesystem traversal, glob and async completion order.
  - missing optional canonical package paths are ignored, empty directories produce no hash records, and missing required `SKILL.md` fails package equality.
  - symlink under canonical package candidate paths fails package equality without following or leaking symlink target.
  - missing expected target entry maps to `ide-mirror.missing-entry`.
  - package content mismatch maps to `ide-mirror.hash-mismatch`.
  - duplicate canonical skill entry maps to `ide-mirror.duplicate-entry`.
  - adapter artifacts do not change canonical package hash.
- File integrity tests:
  - installer-owned raw-byte hash mismatch maps to `file-integrity.hash-mismatch`.
  - missing installer-owned file maps to `file-integrity.missing-installer-owned-file`.
  - unknown ownership maps to `file-integrity.unknown-ownership`.
  - executable intent mismatch maps to `file-integrity.executable-bit-mismatch` if that dimension is implemented in this Story.
  - case conflict maps to `file-integrity.case-conflict` if that dimension is implemented in this Story.
- Path and redaction tests:
  - all accepted paths are project-relative POSIX.
  - absolute path, home directory, Windows separator, drive letter and checkout-root-dependent path are rejected or redacted according to owning SPEC.
  - `ValidationIssue.details`, `impact` and `suggestedNextStep` do not contain dynamic path/hash/time/source text.
- Determinism tests:
  - repeated validate fixture runs produce stable issue arrays, issueCounts, checkedCategories, checkedTargets and validatedPaths.
  - arrays do not depend on filesystem traversal, glob order, object key order, validation rule registration order or async completion.
- Boundary tests:
  - Story 3.3 validate rules do not invoke remote source resolver, source checkout scanning, status command, update planner, repair planner, target writer, safe write, chmod or filesystem mutation.

### Latest Technical Information（最新技术信息）

本 Story 不需要引入或升级外部依赖。遵守仓库中 Architecture 已固定的平台与契约：

- Node.js 22 LTS minimum，Node.js 24 LTS recommended。
- TypeScript + commander CLI foundation。
- Runtime schema validation 如已存在，复用 `zod@4.4.3`。
- Hashing 复用 Node.js built-in crypto 或前置 stories 已建立的 shared helper；不要为了 file integrity validation 添加新 dependency。
- 复用前置 implementation stories 已选择的 YAML/JSON/TOML/CSV parser；不要为了 mirror/file integrity validation 添加新 parser 或新 CLI framework。

Story 3.3 是受契约约束的本地 deterministic validation 能力，不应在本实现中追逐最新 dependency version。如果确实需要 dependency 变更，必须停止并在单独授权的变更中更新 owning Architecture / SPEC / fixtures。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` 当前存在，但只包含初始化占位内容。不要把它当作完整 implementation rule source。
- 本 Story 的 live source of truth 是 Epic 3 shard、PRD status/validation FR/NFR、Architecture implementation mapping、UX control-plane guidance，以及 `_bmad-output/planning-artifacts/specs/` 下的 owning SPECs。

## References（参考）

- `_bmad-output/project-context.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/3-1-lightweight-install-status-summary.md`
- `_bmad-output/implementation-artifacts/3-2-manifest-and-index-schema-validation.md`
- `_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md`
- `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `assets/source/speclite/core-skills/module.yaml`
- `assets/source/speclite/core-skills/module-help.csv`
- `assets/source/speclite/sdlc-skills/module.yaml`
- `assets/source/speclite/sdlc-skills/module-help.csv`

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

由 dev agent 填写。

### Debug Log References（调试日志引用）

由 dev agent 填写。

### Completion Notes List（完成备注列表）

- Story context 由 `bmad-create-story` workflow 创建。
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

由 dev agent 填写。
