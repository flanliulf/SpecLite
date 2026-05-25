# Project Structure & Boundaries（项目结构与边界）

## Complete Project Directory Structure（完整项目目录结构）

```text
speclite-cli/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── .gitignore
├── .npmignore
├── .editorconfig
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── architecture.md
│   ├── installation.md
│   ├── validation.md
│   └── troubleshooting.md
├── assets/
│   └── source/
│       └── speclite/
│           ├── core-skills/
│           ├── sdlc-skills/
│           ├── custom/
│           └── scripts/
├── src/
│   ├── bin/
│   │   └── speclite.ts
│   ├── commands/
│   │   ├── install.ts
│   │   ├── status.ts
│   │   ├── validate.ts
│   │   ├── update.ts
│   │   └── resolve.ts
│   ├── source/
│   │   ├── source-descriptor.ts
│   │   ├── source-descriptor-schema.ts
│   │   ├── source-resolver.ts
│   │   ├── source-discovery.ts
│   │   └── source-integrity.ts
│   ├── modules/
│   │   ├── module-metadata.ts
│   │   ├── module-selection.ts
│   │   ├── module-directories.ts
│   │   └── official-modules.ts
│   ├── config/
│   │   ├── config-schema.ts
│   │   ├── config-reader.ts
│   │   ├── config-writer.ts
│   │   ├── customization-schema.ts
│   │   ├── customization-reader.ts
│   │   ├── merge-rules.ts
│   │   └── resolve-output-schema.ts
│   ├── manifest/
│   │   ├── manifest-schema.ts
│   │   ├── manifest-generator.ts
│   │   ├── skill-index.ts
│   │   ├── help-index.ts
│   │   ├── files-index.ts
│   │   └── hash.ts
│   ├── ide/
│   │   ├── adapter-registry.ts
│   │   ├── adapter-schema.ts
│   │   ├── target-writer.ts
│   │   ├── mirror-validator.ts
│   │   └── adapters/
│   │       ├── claude-code.ts
│   │       └── agents-directory.ts
│   ├── validation/
│   │   ├── issue-model.ts
│   │   ├── validate-project.ts
│   │   ├── rules/
│   │   │   ├── manifest-schema.ts
│   │   │   ├── source-integrity.ts
│   │   │   ├── ide-mirror.ts
│   │   │   ├── runtime-path.ts
│   │   │   ├── menu-target.ts
│   │   │   ├── legacy-namespace.ts
│   │   │   ├── artifact-path.ts
│   │   │   ├── file-integrity.ts
│   │   │   └── operation-lock.ts
│   │   └── reporters/
│   │       ├── human-reporter.ts
│   │       └── json-reporter.ts
│   ├── update/
│   │   ├── ownership-model.ts
│   │   ├── update-plan.ts
│   │   ├── conflict-detector.ts
│   │   └── apply-update.ts
│   ├── installer/
│   │   ├── install-plan.ts
│   │   ├── install-plan-schema.ts
│   │   ├── install-context.ts
│   │   ├── install-runner.ts
│   │   ├── ready-summary.ts
│   │   └── progress-events.ts
│   ├── fs/
│   │   ├── path-normalizer.ts
│   │   ├── safe-write.ts
│   │   ├── copy-tree.ts
│   │   └── permissions.ts
│   ├── diagnostics/
│   │   ├── command-result.ts
│   │   ├── command-result-schema.ts
│   │   ├── errors.ts
│   │   └── output.ts
│   └── index.ts
├── test/
│   ├── unit/
│   │   ├── config/
│   │   ├── fs/
│   │   ├── manifest/
│   │   ├── source/
│   │   └── validation/
│   ├── integration/
│   │   ├── install.test.ts
│   │   ├── status.test.ts
│   │   ├── validate.test.ts
│   │   ├── update.test.ts
│   │   └── resolve.test.ts
│   └── fixtures/
│       ├── fixture-contract.ts
│       ├── fresh-install-empty-project/
│       ├── existing-install-update/
│       ├── ide-drift/
│       ├── source-integrity/
│       ├── resolve-parity/
│       ├── skill-artifact-loop/
│       └── path-portability/
├── fixtures/
│   ├── sources/
│   │   ├── minimal-speclite-source/
│   │   └── full-speclite-source/
│   └── expected/
│       ├── manifests/
│       ├── file-trees/
│       └── validation-summaries/
└── dist/
    ├── bin/
    │   └── speclite.js
    └── packaging-manifest.json
```

## Architectural Boundaries（架构边界）

**API Boundaries（API 边界）：**
SpecLite 的 API 边界是 CLI commands 与 file contracts。`src/commands/` 只负责参数解析、调用 orchestration 和返回 `CommandResult`，不得直接写 manifest、复制 IDE mirrors 或执行深层 validation rule。

**Component Boundaries（组件边界）：**

- `source/` 只负责把 bundled source、npm/private registry/tarball/offline bundle/Git source/local path 归一为 Canonical Source Tree（规范来源树）与 Source Descriptor（来源描述符）；trust/evidence 语义以 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 为准。Local path source 必须先经过 self-reference guard，不得把 target project 的 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output 当作 canonical source；违反时输出 `source-integrity.local-source-self-reference`。
- `assets/source/speclite/` 是 bundled source assets（内置源资产）边界，存放产品随包发布的 SpecLite source definitions；它由 `src/source/` 读取，但不属于 resolver 代码。
- `modules/` 只负责读取 Module Metadata（模块元数据）、选择模块、创建 Declarative Directories（声明式目录）。
- `config/` 是唯一 Config/Customization Merge Implementation（配置/定制化合并实现）所在位置。
- `manifest/` 是唯一 Manifest/Index/Hash Generation（清单/索引/哈希生成）位置；字段契约以 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 为准。
- `ide/` 只处理 Platform Adapter（平台适配器）、Target Directory（目标目录）、adapter metadata、canonical target order 和 Mirror Validation（镜像验证）。Adapter registry 字段、target id、target order、capability 和 status 语义以 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 为准。MVP adapter schema 可保留 command pointer 扩展位，但不得生成 Command Pointer（命令指针）artifact。
- `validation/` 只读取 State（状态）并产生 Issues（问题），不直接修复。
- `update/` 只基于 Ownership/Hash（所有权/哈希）生成并执行 Update Plan（更新计划）；遇到 installer-owned drift 默认生成 conflict。普通 `update` 的交互确认或 `--yes` 只授权无 conflict 的 planned update writes，不得把 drift conflict 转成 repair。只有 `speclite update --repair` 可以恢复可安全 repair 的 IDE mirrors、manifest/index 和 runtime scripts，且不得覆盖 human-owned custom 或 workflow-owned artifacts。repair 写入前必须生成 repair plan，列出 affected paths、ownership、current hash、expected hash 和 action；交互模式确认后写入，脚本模式需要 `--yes`。普通 dry-run、交互确认前或脚本模式缺少 `--yes` 时仍输出真实 unapplied plan，不得把 planned action 改写为 `skip:not-authorized`。`restore-canonical` 必须有 resolved canonical source 或 installed canonical package baseline；缺少 source evidence 时进入 conflict，reason 为 `missing-source-evidence`。MVP 输出 impact summary、changed/skipped/conflict paths 和 machine-readable plan，但不生成 standalone report artifact；`sync`、顶级 `repair`、backup/restore 和 richer update reports 不进入 MVP。
- `installer/` 编排 Install Flow（安装流程），但不拥有各领域规则；pre-write install plan、external access、dry-run、`--yes` 和 write authorization 语义以 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 为准。实现必须保持 `SourceResolutionPlan -> InstallPlan -> write/apply -> CommandResult projection` 顺序。
- `fs/` 是唯一允许实现 Path Normalization（路径规范化）、Safe Writes（安全写入）和跨平台文件操作的模块。Installer-owned 写入必须 temp-write + rename；`changedPaths` 只记录当前命令实际完成的 mutation。Safe-write temporary files 不进入 files index；`validate` 可将不阻断 safe write 的 stale temp files 报告为 `file-integrity.stale-temp-file` warning，如果 stale temp file 阻断 safe-write target naming、rename 或 safe mutation 则必须报告为 error；MVP update/repair 不自动清理 lock 或 stale temp files。`fs/` 还负责阻断 symlink escape、path escape、case conflict 和 unsafe overwrite。

**Service Boundaries（服务边界）：**
MVP 无网络服务。内部 service boundary 通过 TypeScript module API 和 file contract 体现。跨模块通信必须使用明确数据结构，例如 `SourceDescriptor`、`InstallPlan`、`Manifest`、`ValidationIssue`、`UpdatePlan`。

**Data Boundaries（数据边界）：**

- `_speclite/`: metadata/control hub。
- `assets/source/speclite/`: product-shipped bundled source assets。
- `.claude/skills/`、`.agents/skills/`: MVP IDE execution plane；target id 分别为 `claude` 与 `agents`。Copilot/Cursor 专用 command pointer 或 adapter 是 Post-MVP，MVP 中不得伪造 `copilot` 或 `cursor` target id。
- `_speclite-output/`: workflow artifact repository。
- `docs/`: project knowledge。
- `test/fixtures/`: acceptance and regression assets。

## Requirements to Structure Mapping（需求到结构的映射）

**Feature/FR Mapping（功能/FR 映射）：**

- FR1-FR17 安装与项目接入 → `src/commands/install.ts`、`src/installer/`、`src/source/`、`src/modules/`、`src/ide/`、`src/manifest/`。
- FR18-FR24 方法论发现与执行 → `src/manifest/help-index.ts`、`src/ide/adapter-registry.ts`、`src/ide/target-writer.ts`、fixture `skill-artifact-loop/`；FR24 只要求 MVP 最小阶段覆盖矩阵，不要求覆盖率报告或治理 dashboard；矩阵字段契约以 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 为准，adapter registry 契约以 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 为准。
- FR25-FR35、FR28a 与 FR35a-FR35c 状态、验证与 JSON 输出 → `src/commands/status.ts`、`src/commands/validate.ts`、`src/validation/`、`src/diagnostics/`、`src/diagnostics/command-result.ts`、`src/diagnostics/command-result-schema.ts`。
- FR36-FR41 与 FR41a-FR41c 更新与文件所有权保护 → `src/commands/update.ts`、`src/update/`、`src/manifest/files-index.ts`、`_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`。
- FR42-FR52、FR51a-FR51b 与 FR52a-FR52c 配置与定制化 → `src/config/` 与 `src/commands/resolve.ts`；FR51a 要求 MVP 默认只读并保护 human-owned TOML；resolve 行为契约以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 为准。
- FR53-FR59 分发来源与渠道 → `src/source/`。
- FR60-FR65 与 FR63a 安装反馈与就绪状态 → `src/installer/progress-events.ts`、`src/installer/ready-summary.ts`、`src/diagnostics/output.ts`。
- FR66-FR71 与 FR71a-FR71b 维护者工作流与示例 → `test/fixtures/`、`fixtures/expected/`、`docs/`。Fixture expected outputs 是契约测试资产，不是普通示例；fixture layout、expected output classes、comparison policy 和 release gate 分类以 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 为准。
- FR72-FR78 Post-MVP 治理与扩展 → 在 `commands/`、`validation/reporters/`、`ide/adapters/` 中复用 MVP JSON schema 与 module boundaries。

**Cross-Cutting Concerns（横切关注点）：**

- 路径规范化 → `src/fs/path-normalizer.ts`，所有模块调用它，不自行拼接 report path。
- Issue model → `src/validation/issue-model.ts` 与 `src/diagnostics/command-result.ts`。
- Producer/consumer JSON schema → `src/diagnostics/command-result-schema.ts`。
- 文件所有权 → `src/update/ownership-model.ts`。
- Hash integrity → `src/manifest/hash.ts` 与 `src/manifest/files-index.ts`。
- Node 运行时支持 → CI workflow 和 Node 22/Node 24 fixture matrix。
- Legacy namespace residue → `src/validation/rules/legacy-namespace.ts`。

## Integration Points（集成点）

**Internal Communication（内部通信）：**

- CLI command → installer/update/validation/resolve orchestration。
- Resolve command → config/customization resolver → stable JSON output for installed skills；failures emit `ValidationIssue`-shaped JSON Lines diagnostics to stderr；stdout/stderr、merge order、fallback 和 parity fixture rules 以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 为准。
- Installer → source resolver → module manager → manifest generator → IDE target writer → validation。
- Update → files index/hash → conflict detector → update/repair plan → safe write。MVP 输出 impact summary、changed/skipped/conflict paths 和 `--json` machine-readable plan；Backup/restore、standalone report artifact、历史对比和 richer update reports 是 Post-MVP 增强，不属于基础 hash-backed update protection。
- Status → manifest reader + source descriptor reader + IDE target summary + high-level health summary；no full hash scan, no remote source access, no implicit update check。Status 不提供 full validation category coverage，也不证明 installation healthy；需要问题列表时运行 validate。
- Validate → all validation rules → human/json reporter。

**External Integrations（外部集成）：**

- Bundled source 通过 package 内 `assets/source/speclite/` 接入，是 Epic 1 fresh install 的默认官方来源。
- npm public/private registry 通过 source resolver 接入。
- local tarball 与 offline bundle 通过 source resolver 接入。
- Git source 通过 source resolver 接入，但 MVP 只有解析到具体 commit SHA 的 pinned Git source 才能进入 install planning 和写入步骤。
- local path source 通过 source resolver 接入，但不得指向 target project 的 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output。
- MVP AI IDE target directories 通过 `.claude/skills` 与 `.agents/skills` adapters 接入；GitHub Copilot/Cursor 专用 command pointer 或专有 adapter 保持 Post-MVP。
- CI 通过 npm scripts 和 fixture test commands 接入。

**Data Flow（数据流）：**

1. 用户命令创建 command context。
2. Source resolver 返回 canonical source descriptor。
3. Module manager 选择模块并声明 required directories。
4. Installer 写入 `_speclite`、IDE mirrors 和 `_speclite-output`。
5. Manifest generator 记录 installed state 与 file hashes。
6. Validator 读取 installed state 并输出 issues。
7. Update 在写入变更前使用 files manifest 与 ownership model。

**Manifest And Index Semantics（清单与索引语义）：**

- Source 侧以 `assets/source/speclite/` 下的 module metadata 与 source skill package 作为 canonical truth。
- Installed 侧以 manifest/index 作为 selected modules、source descriptor、IDE targets、phase coverage、installed files、ownership 和 hash 的投影。
- Help index 只能引用 `canonicalSkillId`、phase、entry label 和 activation target；不得定义第二套 skill identity、alias-only identity 或 IDE-specific skill identity。
- Canonical skill package hash 用于验证同一 canonical package 在不同 IDE targets 中内容一致；files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed paths、skipped paths 和 conflicts。
- File hash 基于 raw bytes 计算；line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation 维度，不得通过 hash normalisation 隐式吸收。Canonical source text files 固定 LF，installer 不得按平台改写 canonical text line endings；平台专用脚本必须作为独立 generated file 记录自己的 files index entry 和 raw-byte hash。Runtime scripts 与 generated scripts 必须在 files index 中记录 `executable`；Windows 不要求 POSIX chmod 语义，但该字段仍表示 POSIX executable intent。
- Tarball/offline bundle 的 `contentHash` 表示来源 artifact hash；若实现额外使用解包后的 canonical source tree hash 作为 expected installed-state 输入，必须基于 canonical source tree allowlist 计算，不得混用 cache/extraction directory hash、mtime 或平台 metadata。
- Adapter registry contract 拥有 canonical target order。MVP 顺序为 `claude`、`agents`；manifest generation、`CommandResult.data.ideTargets`、`validate.data.checkedTargets` 和 fixture snapshots 必须复用该顺序。Adapter status vocabulary、unsupported/failed 边界、`agents` target 的非品牌化显示规则和 command pointer 扩展位以 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 为准。
- Minimum phase coverage matrix 是 deterministic installed-state matrix，字段与排序遵守 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`。
- Artifact contract 最少校验 artifact type、configured artifact root、默认输出路径，以及 `workflowType`、`sourceSkill`、`generatedAt` metadata 值域；`generatedAt` 在 MVP artifact metadata 中 required，且 stable fixture snapshot 必须 normalize 或 exclude 具体时间值。Artifact root 和 default output path 必须是 project-relative POSIX path 且位于 target project boundary 内。字段与 overwrite/fixture comparison 语义以 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 为准。内容质量、叙事完整度或人工评审结论不进入 MVP validation。
- Target status 必须分层使用：install planning 使用 `planned`、`unsupported`、`failed`；installed phase coverage 使用 `mapped`、`unsupported`、`failed`；status summary 使用 `not-configured`、`configured`、`partial`、`failed`。这些枚举不得跨层复用含义。用户显式选择的 target 若 unsupported 必须成为 blocking error；未选择或可选 target 的 unsupported 可作为 warning、info 或 known limitation。

**Source Descriptor Trust Semantics（来源描述符信任语义）：**

`SourceDescriptor` 与 `SourceIntegrityEvidence` 的字段和语义以 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 为 canonical contract；Architecture 只保留实现映射摘要。

- `SourceDescriptor.trustStatus === "trusted"` 在 MVP 中只表示该 source 通过 expected hash / lock match、packaging manifest / package hash / lock match 验证；MVP 不提供通用 trusted source allowlist schema。
- `SourceDescriptor.trustStatus === "unverified"` 表示 source 可继续进入 install planning，但缺少可证明的信任锚；它只有在用户显式选择该 source、至少记录一种可复现 integrity evidence、且没有 hash mismatch / lock mismatch / unsupported source / local source self-reference / source policy rejection 时才能进入写入规划。bundled source、local tarball、offline bundle、Git source 和 local source 在没有可验证 package/hash/lock match 时默认属于该状态。
- `SourceDescriptor.trustStatus === "blocked"` 表示 hash mismatch、lock mismatch、unsupported source、local source self-reference 或 Post-MVP source policy 拒绝；installer 不得继续执行写入步骤，必须通过 `ValidationIssue` 和 `CommandResult.status` 报告失败。
- npm public/private registry source 不得因为来源类型本身自动成为 `trusted`；必须由 lock 或 hash 验证产生信任结论。

**Source Descriptor Integrity Semantics（来源描述符完整性语义）：**

- `SourceDescriptor.contentHash` 只对可整体内容寻址的 source artifact 强制，例如 local tarball、offline bundle 和 local source snapshot；registry 和 Git source 不应被迫伪造 content hash。
- `SourceDescriptor.integrityEvidence` 是 MVP 必填数组，所有进入写入步骤的 source 至少包含一项 evidence。
- MVP 可以消费 expected hash、lock match，或 bundled source 的 packaging manifest / package hash / package lock match 作为 `trusted` 的信任锚，但不负责生成、刷新、轮转或批量迁移外部 source lockfile；完整 source lockfile 管理属于 Post-MVP。
- Bundled source 必须投影为 `sourceType: "bundled"` 的 `SourceDescriptor`，canonical source tree 来自 `assets/source/speclite/`；它必须记录 packaging manifest / package hash / lock evidence，且 `resolvedRoot` 只能是 package-internal display-safe label。
- Local source snapshot hash 只覆盖 canonical source tree allowlist，排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。Local source 不得指向 target project 的 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output；违反时必须产生 `source-integrity.local-source-self-reference`。Tarball/offline bundle 至少记录包文件 artifact hash；解包后的 tree hash 可作为 expected installed state 输入，但不得与 artifact `contentHash` 混用。
- `SourceIntegrityEvidence.verified === false` 只表示 evidence 已记录且可复现，但未命中 expected hash 或 lock match；它不表示 verification failed。
- 当所有 integrity evidence 都是 `verified: false` 时，source descriptor 只能是 `trustStatus: "unverified"`，不能是 `trusted`。
- npm public/private registry source 必须记录 package name、version 与 `registry-integrity` 或 `version-lock` evidence。
- `SourceDescriptor.version` 表示 resolved installed source version；用户输入的 range、tag、dist-tag 或 branch 如需公开，必须使用 `requestedVersion` 或 internal plan 字段，不得覆盖 resolved `version`。
- `resolvedRoot` 进入 public JSON 时只能是 project-relative POSIX path 或 redacted/display-safe source label；不得暴露 npm cache、临时解压目录、本机 absolute path、home directory 或 drive letter。
- Git source 必须解析到 `git-commit` evidence；只记录 branch、tag 或 remote URL 不足以进入 install planning 或写入步骤，并必须产生 `source-integrity` issue。
- Private registry、proxy、Git remote、tarball 和 offline bundle source metadata 必须 redacted；credentials、tokens、credential-bearing URL、private query string 和本机 absolute source path 不得进入 public JSON 或 fixture snapshot。
- 缺少 integrity evidence、hash mismatch、lock mismatch 或 evidence 校验失败时，source resolver 必须产生 `source-integrity` error issue，将 `trustStatus` 置为 `blocked`，并让 install/update 停止写入。
- `source-integrity` 不得复用 `file-integrity` category；`source-integrity` 表示安装来源无法被安全解析或固定，`file-integrity` 表示已安装文件或 IDE mirror 与 manifest/hash baseline 不一致。
- MVP `validate` 不重新访问远程 source 来重新计算 `source-integrity`；它只检查 manifest 中记录的 source descriptor 与 integrity evidence 是否存在、形状是否有效、是否与本地安装状态一致。

## File Organization Patterns（文件组织模式）

**Configuration Files（配置文件）：**

- Package/build/test 配置保留在项目根目录。
- Runtime config templates 与 schema 位于 `src/config/`；产品内置 source definitions 位于 `assets/source/speclite/`。
- 生成到目标项目的配置由 `_speclite/config.toml` 与 `_speclite/config.user.toml` 持有。
- Human-owned overrides 位于已安装项目的 `_speclite/custom/`。

**Source Organization（源码组织）：**
Source code 按架构能力组织，而不是按泛化 utility buckets 组织。Shared utilities 仅在服务多个架构组件时允许放入 `src/fs/` 和 `src/diagnostics/`。

**Test Organization（测试组织）：**

- Unit tests 验证单个 module boundary。
- Integration tests 验证 command behavior。
- Fixtures 验证端到端 install/update/validate 结果。
- Expected outputs 与 fixture inputs 分开存储。
- Fixture case directory 使用稳定 lower-kebab 命名，layout、expected output classes、comparison rules 和 release gate policy 以 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 为准。
- MVP release gate fixtures 至少包括 `fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity` fixture group required sub-cases、`resolve-parity`、`path-portability` 和最小 `skill-artifact-loop`。`skill-artifact-loop` release gate 只覆盖 IDE entry discovery、activation、resolver access 和 artifact metadata；richer multi-skill/documentation scenarios 作为 regression assets。Release gate fixtures 必须覆盖 Node 22 和 Node 24，并提供 macOS 与 Windows path-portability 证据。

**Asset Organization（资产组织）：**
MVP 没有 frontend/static assets。随产品发布的 SpecLite source definitions 位于 `assets/source/speclite/`；fixture source 和 expected installed trees 位于 `fixtures/`。

## Development Workflow Integration（开发工作流集成）

**Development Server Structure（开发服务结构）：**
没有 development server。本地开发使用 `tsx` 执行 CLI，使用 `vitest` 运行测试。

**Build Process Structure（构建流程结构）：**
`tsup` 将 `src/bin/speclite.ts` 构建到 `dist/bin/speclite.js`。Package distribution 包含 compiled CLI 和必需 runtime assets；除非明确作为示例打包，否则不包含 test fixtures。

Packaging acceptance 是 release checklist gate，不是 fixture project case。它必须通过 `npm run release:packaging-check` 生成 stable packaging manifest artifact `dist/packaging-manifest.json`，列出 package file inventory，并保存 expected assertions 与 CI/release evidence。该 gate 必须断言 package 包含 `package.json` bin mapping、`dist/bin/speclite.js`、`assets/source/speclite/`、installer/runtime schemas、runtime scripts/templates 和执行安装所需的 contract runtime assets。Packaging manifest 还必须断言 `test/fixtures/` 和 root `fixtures/` 不进入 package，除非某个路径被明确标记为 packaged documentation example；这些 packaged examples 不等同于 release gate fixtures。

**Deployment Structure（部署结构）：**
分发目标包括 npm package、private registry package、local tarball 和 offline bundle。Build output 必须保留 CLI bin mapping，并包含 installer execution 所需的 runtime assets；packaging manifest 是 npm package、local tarball 和 offline bundle 的共同验收输入。
