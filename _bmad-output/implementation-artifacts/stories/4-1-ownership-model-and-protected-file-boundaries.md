# Story 4.1: Ownership Model And Protected File Boundaries（所有权模型与受保护文件边界）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望 SpecLite 明确区分 installer-owned、human-owned 和 workflow-owned 文件，  
以便 update 和 repair 可以安全修改工具生成内容，同时保护人工配置和研发过程产物。

## Acceptance Criteria（验收标准）

1. **Managed files carry readable ownership（受管理文件携带可读取所有权）**  
   **前提** SpecLite 安装生成文件清单；  
   **当** 系统记录 installed state；  
   **则** 每个受管理文件会被标记为 `installer-owned`、`human-owned` 或 `workflow-owned`；  
   **并且** ownership 信息可被 `update`、`update --repair` 和 `validate` 读取；  
   **并且** files index 中的 ownership 与 hash 语义必须遵守 `04-manifest-index-contract.md`，不能由 update 模块另写一份字段真源。

2. **Installer initialized config remains installer-owned with hash checks（Installer 初始化配置按 Installer-Owned 与 Hash 判断）**  
   **前提** 文件位于 `_speclite/config.toml` 或 `_speclite/config.user.toml`；  
   **当** 系统判断 ownership；  
   **则** 这些 installer 初始化配置文件可被标记为 `installer-owned`；  
   **并且** 后续 update 必须按 manifest/files index hash、ownership 与配置契约判断是否可安全修改；  
   **并且** installer-owned 不等于可静默覆盖，发生 drift 时普通 `update` 必须进入 conflict 或 skipped planning，而不是直接恢复。

3. **Human-owned custom files are read-only to install/update/repair（Human-Owned Custom 文件对安装更新修复只读）**  
   **前提** 文件位于 `_speclite/custom/*.toml` 或 `_speclite/custom/*.user.toml`；  
   **当** 系统判断 ownership；  
   **则** 这些文件默认视为 `human-owned`；  
   **并且** `install`、`update`、`update --repair` 不得覆盖、重写、重排、格式化、normalize 或删除已存在文件；  
   **并且** 实现只能读取这些文件以支持 resolver 行为和 protected boundary 判断，不得将其当作 installer-generated output 重新生成。

4. **Project-level human-owned stubs are create-if-absent only（项目级 Human-Owned Stub 仅缺失时创建）**  
   **前提** fresh install 发现 human-owned TOML stub 不存在；  
   **当** 系统需要初始化 custom 层入口；  
   **则** 只可以按 create-if-absent 规则创建 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`；  
   **并且** 如果目标文件已存在，则不得修改其内容、顺序或注释；  
   **并且** Story 4.1 只负责验证 ownership/update/repair 保护规则，fresh-install stub 的创建流程仍由 Epic 1 / Story 1.4 负责。

5. **Skill-specific custom stubs are not auto-generated（Skill-Specific Custom Stub 不自动生成）**  
   **前提** 文件路径匹配 `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`；  
   **当** fresh install、update 或 repair 处理 skill-specific customization；  
   **则** 这些文件默认由用户手工创建或未来显式 customization command 创建；  
   **并且** fresh install 不得为每个 installed skill 自动生成 skill-specific stub；  
   **并且** 如果这些文件存在，ownership classifier 必须保护其原始字节、顺序与注释。

6. **Workflow artifacts are excluded from automatic update/repair writes（Workflow 产物排除自动更新修复写入）**  
   **前提** 文件位于 `_speclite-output` 或配置约定的 workflow artifact 目录；  
   **当** 系统判断 ownership；  
   **则** workflow 产物默认视为 `workflow-owned`；  
   **并且** `update` / `update --repair` 不得将其纳入 overwrite、restore-canonical、regenerate 或 changed paths；  
   **并且** artifact metadata validation failure 只能产生诊断，不能触发 install/update/repair 覆盖 artifact。

7. **Missing or conflicting ownership emits stable diagnostics（缺失或冲突 Ownership 输出稳定诊断）**  
   **前提** `validate` 或 `update` 发现 ownership 缺失、冲突或不可证明安全；  
   **当** 系统生成诊断结果；  
   **则** issue 会包含稳定 `issueId`、`category`、`severity` 和 `affectedPath`；  
   **并且** suggested next step 不会建议用户删除或覆盖 `human-owned` / `workflow-owned` 文件作为默认修复方式；  
   **并且** path-level conflict 进入 `data.conflicts`，command-level blocker 只使用一个 `update.conflicts` issue，不能把每个 path conflict 复制成多个 command-level issues。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证前置实现与当前仓库状态（AC: 1-7）
  - [x] 在实现前重新检查 root `package.json`、`src/`、`test/`、`fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；本 Story 仍不得把 ready-for-dev story context 当成 Epic 4 源码已完成证据。
  - [x] 确认 Epic 1 / Story 1.4 已经或将要只负责 fresh-install create-if-absent project-level custom TOML stubs；Story 4.1 不得反向要求 Story 1.4 依赖完整 update/repair 模型。
  - [x] 确认 `src/commands/update.ts` 仍按 Story 3.5 作为 non-write placeholder / public contract seam 存在，并重新检查 `src/update/`、`src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价 files-index helper、`src/diagnostics/command-result-schema.ts`、`src/validation/issue-model.ts` 或等价前置 anchors；缺失的 Epic 4 anchors 只能在本 Story 范围内创建，不得创建孤立的 update-only scaffold 并绕过 CommandResult、manifest 和 fixture contracts。
  - [x] 修改任何 UPDATE 文件前完整读取该文件，记录当前 behavior、数据 shape、public output 和测试覆盖；不得格式化、重写、同步或回滚与 Story 4.1 无关的文件。

- [x] Task 2: 建立 ownership model 与 path classifier（AC: 1-6）
  - [x] 在 `src/update/ownership-model.ts` 或既有 update ownership anchor 中集中定义 ownership literal：`installer-owned`、`human-owned`、`workflow-owned`，必要时在 internal planning 层保留 `unknown`。
  - [x] classifier 输入必须使用 normalized project-relative POSIX path；内部 absolute path 只能存在于 private filesystem state，不得进入 public JSON、manifest/index、files index 或 fixture snapshots。
  - [x] 明确 `_speclite/config.toml`、`_speclite/config.user.toml`、manifest/index、files index、runtime scripts、IDE mirror canonical package projection 等 installer-owned 类别。
  - [x] 明确 `_speclite/custom/*.toml`、`_speclite/custom/*.user.toml` 为 human-owned，包括 project-level stubs 与 skill-specific customization files。
  - [x] 明确 `_speclite-output/**` 以及 configured workflow artifact root 下的产物为 workflow-owned；configured artifact root 必须来自 config/manifest contract，不能硬编码只识别默认路径。
  - [x] 对无法判定或路径逃逸的情况返回 protected unknown/conflict outcome，不得默认当作 installer-owned。

- [x] Task 3: 收口 files index ownership projection（AC: 1, 2, 6）
  - [x] 复用或扩展 `src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价 files-index helper，确保 files index entry 包含 `path`、`ownership`、`hash`、`hashAlgorithm: "sha256"`、`executable`、`artifactKind` 和 `sourceRef`。
  - [x] File hash 必须基于 raw bytes；line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions，不得被 hash normalization 隐式吸收。
  - [x] `_speclite/.lock` 和 `.speclite-tmp-` safe-write temporary files 不得进入 files index，也不得影响 stable files-index hash。
  - [x] Human-owned 和 workflow-owned files 可以为了 protection 被列出，但 automatic update 和 repair 不得 mutate 它们。
  - [x] 如果新增或改变 files index schema/version/ownership projection，必须同一变更更新 owning SPEC、executable schema/parser 和 fixture expected outputs；如果本 Story 没有授权修改 SPEC，则只能实现现有契约。

- [x] Task 4: 将 ownership 接入 validate/update/repair planning（AC: 1-3, 6-7）
  - [x] `validate` 读取 files index/manifest ownership，能报告 missing installer-owned file、hash mismatch、unknown ownership、case conflict、unsafe overwrite risk 等 file-integrity 问题。
  - [x] 普通 `speclite update` 在 installer-owned drift 时默认产生 conflict 或 protected skip，不得把 confirmation 或 `--yes` 解释为 repair drift 授权。
  - [x] `speclite update --repair` 只允许为 installer-owned paths 生成 `restore-canonical` 或 `regenerate` repair actions；human-owned、workflow-owned、unknown ownership、missing source evidence 或 unsupported repair 必须进入 conflicts。
  - [x] `RepairPlan.actions[]` 每个 action 必须包含 `expectedHash`；`regenerate` 必须先 dry-run candidate content 并计算 expected hash 后才能进入 repair plan。
  - [x] `changedPaths` / `skippedPaths` 只表示 actual apply result；`writeAuthorized === false` 时必须为空。Planned changes/skips 必须从 `updatePlan.actions` 或 `repairPlan.actions` 读取。

- [x] Task 5: 保护 human-owned TOML 与 FR51b 分界（AC: 3-5）
  - [x] 对 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`，missing 时允许 fresh install planned create-if-absent；existing 时必须 protected skip，且不得读取敏感内容到 public output。
  - [x] 对 `_speclite/custom/{skill}.toml` 与 `_speclite/custom/{skill}.user.toml`，任何 install/update/repair 自动生成行为均为 out of scope；如产品后来需要显式 customization command，必须先新增 owning SPEC/ADR。
  - [x] Existing human-owned TOML 即使为空、malformed、包含旧注释、只部分匹配 stub 或顺序不同，也必须保持原始字节不变。
  - [x] Resolver 可以读取 human-owned TOML 以解析 configuration/customization，但不得借 update/repair 重排或格式化它们。

- [x] Task 6: 输出与诊断保持 CommandResult / ValidationIssue 契约（AC: 7）
  - [x] Reuse `src/diagnostics/output.ts` 的 Evidence / Structured profiles，不允许 `update`、`repair` 或 `validate` 自行拼接 status text、issue layout、path display 或 JSON fields。
  - [x] Path-level conflicts 必须包含 normalized `affectedPath`、`ownership` 和 stable lower-kebab `reason`，例如 `installer-owned-drift`、`human-owned`、`workflow-owned`、`unknown-ownership`、`missing-source-evidence` 或 `unsupported-repair`。
  - [x] `data.conflicts.length > 0` 时只生成一个 command-level `update.conflicts` issue，`category: "update"`，`severity: "error"`，并在 `details.conflictCount` 记录数量。
  - [x] `file-integrity.unknown-ownership`、`file-integrity.unsafe-overwrite-risk`、`file-integrity.case-conflict` 等 diagnostics 必须使用 taxonomy 中已有 issue ids；不得发明自由文本 issue id。
  - [x] suggested next step 必须优先指向 `speclite validate`、`speclite update --repair`、manual review 或重新运行 update planning，不得默认建议删除/覆盖 human-owned 或 workflow-owned 文件。

- [x] Task 7: 编写 focused tests 与 release-gate fixture assertions（AC: 1-7）
  - [x] Unit tests 覆盖 ownership classifier：installer-owned config/control files、human-owned project-level custom stubs、human-owned skill-specific customization、workflow-owned artifact root、unknown ownership、path escape、case conflict。
  - [x] Unit tests 覆盖 files index ownership projection、raw-byte hash、`executable` intent、volatile lock/temp file exclusion。
  - [x] Update planning tests 覆盖 installer-owned unchanged -> planned skip `unchanged`，installer-owned drift -> conflict `installer-owned-drift`，human-owned -> protected conflict/skip `human-owned`，workflow-owned -> protected conflict/skip `workflow-owned`，unknown -> `unknown-ownership`。
  - [x] Repair planning tests 覆盖 installer-owned `restore-canonical` / `regenerate` 必须带 `expectedHash`，missing source evidence -> conflict，human-owned/workflow-owned 不进入 `repairPlan.actions[]`。
  - [x] Diagnostics tests 覆盖 single `update.conflicts` command-level issue、path-level conflicts 不复制到 `issues[]`、`operation-lock.project-locked` 不进入 `data.conflicts`。
  - [x] Fixture updates 覆盖 `existing-install-update`、`ide-drift`、`fresh-install-empty-project` 中 ownership projection 与 preservation；human-owned 和 workflow-owned preservation 必须用 content unchanged checks 断言。
  - [x] 所有 JSON fixture 用 semantic parse comparison，不比较当前时间、absolute path、home directory、temporary path、cache path、hash 以外非稳定文本或 terminal formatting。

- [x] Task 8: 本地验证与范围控制（AC: 1-7）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 ownership model、files index、update planning、repair planning、diagnostics projection 和 fixture comparison focused Vitest tests。
  - [x] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 ownership protection tests。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-3 文件、无关源码或用户改动。
  - [x] 检查 diff，确认没有实现 Epic 5 source channel 扩展、Epic 6 release fixture matrix 全量范围、Post-MVP `doctor` / `sync` / `uninstall` / 顶级 `repair` / backup-restore / standalone update report / dedicated Copilot-Cursor target ids。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，仓库根目录已有 root `package.json`、`src/`、`test/` 以及 status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation issue/order anchors。root `fixtures/` 或后续 Epic 4/5/6 专用实现仍需按当前源码逐项确认；不要沿用本 Story 创建时的旧仓库状态。
- Epic 3 / Story 3.5 已完成：`src/commands/update.ts` 是 non-write placeholder 与 public contract seam。真实 update plan、ownership/files-index、operation lock、safe write、conflict detector 和 repair apply 仍由 Epic 4 stories 实现；本 Story 4.1 的 ready-for-dev context 不是其自身实现完成证据。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-3 story 文件。实现 Story 4.1 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR、glossary 和 owning SPEC artifacts 为准。

### Readiness Report Guidance（就绪报告建议）

- `implementation-readiness-report-2026-05-26.md` 将 FR51b 标为 Minor concern，但不阻塞 implementation。实现时必须明确 Story 1.4 与 Story 4.1 的职责拆分：Story 1.4 只负责 fresh-install create-if-absent project-level custom TOML stubs；Story 4.1 负责 ownership/update/repair 验证。
- 不得让 Story 1.4 反向依赖 Epic 4 的完整 update model。Story 4.1 可以验证、保护并在 update/repair planning 中消费这些 paths，但不应重写 Story 1.4 的 config initialization UX 或 prompt flow。
- Readiness final status 为 READY for MVP implementation，且 Epic 4 覆盖 FR36-FR41c、FR50-FR51b。Story 4.1 应把 FR37、FR39、FR40、FR51、FR51a、FR51b 作为核心保护边界。

### Scope Boundary（范围边界）

- 本 Story 只负责 ownership model、protected file boundaries、files index ownership projection、validate/update/repair 对 ownership 的读取与保护、diagnostic projection、focused tests 和相关 fixtures。
- 本 Story 不负责：
  - 完整 config/customization resolver merge order，属于 Story 4.2 与 `06-resolve-command-contract.md`。
  - update plan 的全部 UX 与 write authorization flow，属于 Story 4.3 及 `01-command-result-json-contract.md` / `03-install-plan-contract.md`。
  - project operation lock 与 safe-write implementation，属于 Story 4.4。
  - full conflict detector 和 default non-overwrite behavior，属于 Story 4.5。
  - full explicit repair flow 与 restore/regenerate application，属于 Story 4.6。
  - Epic 5 source integrity/channel expansion、Epic 6 full release-gate matrix 或 Post-MVP governance commands。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。官方 Node releases 页面在 2026-05-26 显示 Node 22 与 Node 24 为 LTS，Node 26 为 Current；不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Runtime schema validation 如前序 stories 使用 `zod@4.4.3`，继续复用同一 dependency 和 style。不要为了 ownership model 引入新的 schema/runtime validation library。
- Storage model 是 local-first filesystem。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/update.ts` 只做 orchestration 和 command mode normalization；ownership classification 属于 `src/update/ownership-model.ts`，files index/hash 属于 `src/manifest/`，path normalization 属于 `src/fs/`，public projection 属于 `src/diagnostics/`。
- `validation/` 只读取 state 并产生 issues，不直接修复。`update/` 基于 ownership/hash 生成 update/repair plan；`fs/` 是唯一允许 safe write 和 path normalization 的模块。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/update/ownership-model.ts`：ownership literals、path classifier、unknown/protected outcome 和 helper predicates。
- `src/update/update-plan.ts`：normal update planned effects 与 protected skip/conflict projection。
- `src/update/conflict-detector.ts`：installer-owned drift、human-owned/workflow-owned/unknown ownership conflict reason mapping。
- `src/update/apply-update.ts`：仅在后续 Story 4.4-4.6 的 safe-write/repair 边界内应用变更；Story 4.1 不应提前实现 full apply flow。
- `src/commands/update.ts`：command orchestration，含 normal update 与 `update.repair` command id routing。
- `src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价拆分模块：files index ownership/hash projection。
- `src/manifest/hash.ts`：raw-byte hash helper。
- `src/diagnostics/command-result-schema.ts`：`UpdatePlan`、`RepairPlan`、`UpdateConflict`、reason code producer guards。
- `src/diagnostics/command-result.ts`：single `update.conflicts` issue projection、status/exit-code derivation。
- `src/validation/issue-model.ts`：`ValidationIssue` construction helpers 与 taxonomy guardrails。
- `src/validation/rules/file-integrity.ts`：ownership/hash/file-integrity validation。
- `src/fs/path-normalizer.ts`：project-relative POSIX path normalization、escape/case conflict helpers。
- `test/fixtures/existing-install-update/`、`test/fixtures/ide-drift/`、`test/fixtures/fresh-install-empty-project/`：ownership behavior 与 preservation assertions。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐，不要绕过 manifest/diagnostics/contracts 创建私有实现。

### Ownership Rules（所有权规则）

- Installer-owned typical scope:
  - `_speclite/config.toml`
  - `_speclite/config.user.toml`
  - `_speclite` installer metadata/control files
  - manifest/index/files index/help index/skill index
  - runtime scripts under `_speclite/scripts`
  - IDE skill mirrors under `.claude/skills/**` and `.agents/skills/**`
  - generated files explicitly recorded as installer-owned in files index
- Human-owned typical scope:
  - `_speclite/custom/config.toml`
  - `_speclite/custom/config.user.toml`
  - `_speclite/custom/{skill}.toml`
  - `_speclite/custom/{skill}.user.toml`
  - user-maintained customization overrides
- Workflow-owned typical scope:
  - `_speclite-output/**`
  - configured workflow artifact root from project config/manifest
  - planning, implementation, review, retrospective and other workflow artifacts
  - artifact metadata sidecars, when generated by workflow execution
- Unknown/protected scope:
  - paths missing ownership evidence
  - paths escaping project boundary
  - symlink/path escape or case conflict candidates
  - local source self-reference paths are source-integrity blockers, not installer-owned paths

### Contract Requirements（契约要求）

- `CommandResult` public JSON shape、`UpdatePlan`、`RepairPlan`、`UpdateConflict`、reason code registry、conflict projection 和 path/order policy 由 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有。
- Install/update/repair pre-write planning、`writeAuthorized`、operation lock、safe write、repair source policy 和 human-owned TOML stub 规则由 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有。
- Manifest/index/files index fields、ownership projection、raw-byte hash、volatile file exclusion 和 deterministic fixtures 由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有。
- Issue categories、reserved issue ids 和 severity guidance 由 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有。
- Fixture layout、release gate classification、expected output classes、semantic JSON comparison 和 preservation assertions 由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有。
- ADR 只能解释决策背景，不重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchor。若 ADR 与 owning SPEC 冲突，以 owning SPEC 为准。

### UX / Output Requirements（UX 与输出要求）

- Human-readable output 使用 Evidence profile 展示 planned effects、write authorization status、changed paths、skipped paths、conflicts 和 protected paths。
- Conflict 与 skipped 必须用文本解释 reason；不能只靠颜色、图标、表格位置或紧凑符号表达。
- Ordinary `update` 与 explicit `update --repair` 必须清晰区分。`--yes` 只能授权无 conflict 的 planned writes，不能隐式 repair drift。
- Path display 必须帮助用户理解 `_speclite`、IDE execution plane、`_speclite-output` 和 project knowledge 的空间角色。
- Empty states 必须明确，例如 `No conflicts detected`，避免用户从空白推断状态。

### Testing Requirements（测试要求）

- 使用 Vitest。测试必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin 或外部网络。
- 使用 temporary directories 构造 installed-state cases；不要依赖当前 repo 的 `_bmad` 或 `_bmad-output` 作为目标项目 installed state。
- Cross-platform tests 使用 `node:path` 的 `posix` / `win32` test data 和 shared path normalization helper，不要让 host OS filesystem 行为成为唯一断言依据。
- JSON tests parse output 并断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非格式本身是测试对象。
- Fixture snapshots 必须 normalize 或 exclude owning SPEC 标记为 non-stable 的 timestamp、operation-lock volatile fields、temporary paths、projectRootHash、duration 或 environment-specific paths。
- Human-owned 和 workflow-owned preservation 必须通过 content unchanged checks 断言；installer-owned 文件使用 hash comparison。

### Previous Story Intelligence（前序 Story 情报）

- Story 1.4 明确 project-level human-owned stubs 只允许 create-if-absent：`_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`。Existing stubs 即使为空、malformed、保留旧注释或顺序不同，也不得覆盖、重写、重排或格式化。
- Story 3.5 明确 `update` / `update.repair` conflicts 只生成一个 command-level `update.conflicts` issue，path-level conflicts 留在 `data.conflicts`；`operation-lock.project-locked` 是 command-level blocker，不放入 `data.conflicts`。
- Story 3.5 还要求 human-readable output 与 `--json` output 共享同一 semantic source，command modules 不得自行拼接 public JSON、status text 或 issue layout。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts、owning SPECs、ADR 和 glossary，而不是已提交 TypeScript implementation。dev agent 不得从这些 docs commits 推断源码已经存在。

### References（参考）

- `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-26.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/adr/0003-separate-canonical-skill-packages-from-adapter-artifacts.md`
- `_bmad-output/planning-artifacts/adr/0005-manifest-index-contract-boundary.md`
- `docs/glossary/file-ownership-boundaries.md`
- `docs/glossary/speclite-runtime-boundaries.md`
- `_bmad-output/implementation-artifacts/1-4-project-config-initialization.md`
- `_bmad-output/implementation-artifacts/3-5-commandresult-and-validationissue-json-contract.md`
- Node.js official releases: https://nodejs.org/en/about/previous-releases

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5.5

### Debug Log References（调试日志引用）

- 2026-05-31: 手动 fallback 解析 `bmad-dev-story` workflow；`resolve_customization.py` 因当前 `python3` 缺少 `tomllib` 失败。
- 2026-05-31: 读取 root `package.json`、`src/`、`test/`、`test/fixtures/`、`src/commands/update.ts`、manifest/diagnostics/validation anchors，确认 Story 4.1 从 Epic 3 anchors 继续实现。
- 2026-05-31: RED: `npm test -- test/ownership-model.test.ts test/update-planning.test.ts` 失败，缺少 `src/update/ownership-model.ts` 且 `update` 仍返回 placeholder。
- 2026-05-31: GREEN: ownership classifier、files index projection、update/repair dry-run planning、file-integrity ownership diagnostics 和 focused tests 完成。
- 2026-05-31: 验证通过：focused Story 4.1 tests、`npm test`、`npm run build`、`git diff --check -- src test _bmad-output/implementation-artifacts/stories/4-1-ownership-model-and-protected-file-boundaries.md _bmad-output/implementation-artifacts/sprint-status.yaml`。

### Completion Notes List（完成备注）

- Story context created by bmad-create-story sub-agent #1.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- 新增 `src/update/ownership-model.ts`，集中定义 `installer-owned`、`human-owned`、`workflow-owned` 与 protected `unknown` classifier，覆盖 `_speclite` runtime/config、custom TOML、IDE mirrors、默认与 configured artifact root、path escape。
- 新增 `src/update/update-plan.ts`，将 `speclite update` / `speclite update --repair` 从 Epic 3 placeholder 推进为只读 dry-run planning：不会写入文件，`writeAuthorized` 保持 false，actual `changedPaths` / `skippedPaths` 保持空数组。
- 扩展 files index helper：按 raw bytes 计算 `sha256`，投影 ownership/executable/artifactKind/sourceRef，并排除 `_speclite/.lock` 与 `_speclite/.speclite-tmp-*` volatile paths。
- 扩展 file-integrity validation：补充 `file-integrity.unsafe-overwrite-risk` 与 `file-integrity.case-conflict`，并保持 human/workflow-owned protected boundary 的 suggested next step 不默认建议删除或覆盖。
- 更新 update human output，复用 CommandResult 数据展示 write authorization 与 path-level conflicts；`data.conflicts` 非空时仍只由 shared producer 生成一个 command-level `update.conflicts` issue。
- 测试覆盖新增 ownership classifier、files index projection、update planning、repair planning、file-integrity ownership diagnostics、update command contract 与 validate regression；全量 `npm test` 通过。

### File List（文件列表）

- src/commands/update.ts
- src/diagnostics/output.ts
- src/manifest/manifest-generator.ts
- src/update/ownership-model.ts
- src/update/update-plan.ts
- src/validation/rules/file-integrity.ts
- test/file-integrity-ownership.test.ts
- test/ownership-model.test.ts
- test/update-command.test.ts
- test/update-planning.test.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/stories/4-1-ownership-model-and-protected-file-boundaries.md

### Change Log（变更记录）

- 2026-05-31: 实现 Story 4.1 ownership model、protected file boundaries、files-index ownership projection、update/repair dry-run planning、file-integrity diagnostics 与 focused tests；Story 状态更新为 review。
