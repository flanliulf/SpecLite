# Story 7.5: Project Config Init And Listing Commands（项目配置初始化与列表命令）

Status: ready-for-dev

<!-- Post-MVP Story: 不属于 MVP implementation readiness gate。实现前必须先通过 Epic 7 kickoff / Story kickoff gate。 -->

## Story（故事）

作为项目维护者，
我希望 Post-MVP 提供 `speclite init` 和 `speclite list`，
以便在不重新安装全部内容的情况下初始化或重建项目配置，并查看可用模块、skills、IDE targets 或版本。

## Acceptance Criteria（验收标准）

1. **Init creates or rebuilds project config without silent overwrite（Init 创建或重建配置且不静默覆盖）**
   **前提** 项目需要初始化或重建 SpecLite 项目级配置；
   **当** 用户运行 Post-MVP `speclite init`；
   **则** 命令可以创建或重建项目级配置入口；
   **并且** 不得静默覆盖 human-owned custom 文件。

2. **Init reads existing installed state before planning writes（Init 写入计划前读取既有安装状态）**
   **前提** 项目已有 `_speclite` 安装状态；
   **当** 用户运行 Post-MVP `speclite init`；
   **则** 命令必须读取现有 manifest、config 和 ownership 信息；
   **并且** 在修改 installer-owned 配置前展示 plan 和影响范围。

3. **List reuses canonical identity sources（List 复用 canonical identity 来源）**
   **前提** 用户想查看可安装模块、skills、IDE targets 或版本；
   **当** 用户运行 Post-MVP `speclite list`；
   **则** 命令会从 manifest/index、source metadata 或 adapter registry 中读取可列信息；
   **并且** 不定义第二套 skill identity 或 IDE target identity。

4. **List JSON reuses CommandResult-compatible extension path（List JSON 复用 CommandResult 兼容扩展路径）**
   **前提** Post-MVP `speclite list` 输出机器可读结果；
   **当** 用户传入 `--json`；
   **则** 输出复用 MVP `CommandResult` envelope 和已契约化 data payload 扩展机制；
   **并且** 不破坏 `speclite.command-result.v1` 的既有字段语义。

5. **Public JSON fields are contract-first（Public JSON 字段先契约后实现）**
   **前提** Post-MVP `speclite init` 或 Post-MVP `speclite list` 需要新增 public JSON 字段；
   **当** 实现该字段；
   **则** 必须先新增或扩展对应 command owning SPEC，再更新 `CommandResult` executable schema/parser 和 fixture expected outputs；
   **并且** 不依赖 human-readable output 承载自动化字段。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Contract-first planning for `init` / `list`（AC: 4, 5）
  - [ ] 扩展 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`，明确 `init` / `list` command id、data payload、exit code 和 compatibility rule。
  - [ ] 更新 `src/diagnostics/command-result-schema.ts`，不得添加未在 SPEC 中声明的 public fields。
  - [ ] 如新增 issue id、category 或 data 子字段，同步 fixture expected outputs 或 contract tests。

- [ ] Task 2: Implement `speclite init` planning and safe write path（AC: 1, 2）
  - [ ] 在 `src/bin/speclite.ts` 注册 `init` command，并把 orchestration 放入新的 `src/commands/init.ts` 或等价 command module。
  - [ ] 复用 `src/config/config-reader.ts`、`src/config/config-writer.ts`、`src/config/config-schema.ts` 与 `src/installer/config-initialization.ts`，不得另建配置解析模型。
  - [ ] 对已存在 `_speclite` 的项目读取 manifest、files index、ownership/hash 和 config layers 后生成 plan。
  - [ ] 写入阶段必须使用 `src/fs/operation-lock.ts` 和 `src/fs/safe-write.ts`；失败时输出 completed steps、failed step、pending steps 和 manual action。
  - [ ] 对 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml` 只读保护，不覆盖、不重排、不格式化。

- [ ] Task 3: Implement `speclite list` from canonical indexes（AC: 3, 4）
  - [ ] 从 `assets/source/speclite/**/module.yaml`、`module-help.csv`、manifest/index、`src/ide/adapter-registry.ts` 读取可列信息。
  - [ ] `list` 输出可按 modules、skills、IDE targets 或 versions 分组，但 identity 必须复用 `canonicalSkillId`、module id 和 canonical target order。
  - [ ] `--json` 输出只使用已契约 data payload；human-readable output 不能成为 automation 的唯一信息来源。

- [ ] Task 4: Tests and fixtures（AC: 1-5）
  - [ ] 新增 focused tests 覆盖 fresh init、existing init plan、human-owned custom protection、list canonical identity、`--json` schema parse。
  - [ ] 更新或新增 fixture expected outputs，确保 stable sorting、project-relative POSIX paths 和 redaction。
  - [ ] 运行 `npm run build`、focused tests、`npm test` 或记录阻塞原因、`git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`
- Cross-Epic lifecycle: `_bmad-output/planning-artifacts/epics/03-epic-listepic-列表.md`
- SDLC contract: `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
- CommandResult contract: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- Install plan / write authorization: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- Manifest/index identity: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- IDE target identity: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`

### Current Implementation Anchors（当前实现锚点）

- CLI registration: `src/bin/speclite.ts`
- Existing command modules: `src/commands/install.ts`, `src/commands/status.ts`, `src/commands/validate.ts`, `src/commands/update.ts`, `src/commands/resolve.ts`
- Config runtime: `src/config/config-reader.ts`, `src/config/config-writer.ts`, `src/config/config-schema.ts`, `src/config/customization-reader.ts`
- Existing config initialization logic: `src/installer/config-initialization.ts`
- Manifest and index schemas: `src/manifest/manifest-schema.ts`
- IDE adapter order and targets: `src/ide/adapter-registry.ts`
- Safe write and lock: `src/fs/safe-write.ts`, `src/fs/operation-lock.ts`
- CommandResult schema: `src/diagnostics/command-result-schema.ts`
- Renderer: `src/diagnostics/output.ts`

### Scope Boundary（范围边界）

- 本 Story 是 Post-MVP，不得把 `init` / `list` 纳入 MVP release gate。
- 不实现 Flow Gate hook enforcement、`doctor`、`sync`、`uninstall`、CI workflow 或 governance report；这些属于 7.1-7.4。
- 不重写 `install` 行为，不改变现有 `status` / `validate` / `update` semantics。
- 不新增数据库、daemon、remote service、GUI/TUI 或长期 cache。
- 不把 `module-help.csv` 当成 canonical package inventory 的唯一来源。

## Dependency Gate（依赖门禁）

- **Epic Gate**: Epic 7 是 Post-MVP backlog。启动开发前必须有 `epic-kickoff` gate 的明确 PASS / PASS_EQUIVALENT，或记录人工接受 Post-MVP 开发的决策。
- **Contract Gate**: 新 command 的 JSON output 必须先更新 owning SPEC 和 executable schema。
- **Predecessor Gate**: Epic 1-6 MVP contracts 必须保持可消费；不得破坏现有 tests/fixtures。
- **Forward Compatibility Gate**: 如果 `list` 暴露 hook artifacts，必须消费 Story 7.1 已契约化的 hook metadata，不得定义第二套 hook identity 或 hook inventory。
- **Worktree Gate**: 当前仓库已有 release / fixture 相关未提交改动；实现时必须先隔离范围，禁止误提交无关变更。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | 定义 `init` / `list` JSON envelope 和 data payload 后才能实现 `--json`。 |
| Contract Anchor | `04-manifest-index-contract.md` | `list` 的 skill/module/phase identity 必须来自 manifest/index/source metadata。 |
| Contract Anchor | `05-ide-adapter-registry-contract.md` | IDE target id 与顺序必须使用 `claude`, `agents` canonical order。 |
| Functional Anchor | `src/commands/init.ts` / `src/commands/list.ts` | 推荐新增 command modules；若等价集中实现，必须保留清晰 command boundary。 |
| Functional Anchor | `src/fs/safe-write.ts` + `src/fs/operation-lock.ts` | `init` 写入必须使用 safe write 与 operation lock。 |
| Evidence Anchor | focused tests + fixture expected outputs | 证明 human-owned custom protection、canonical listing、JSON schema 和 path redaction。 |
| Guidance Anchor | 文件名建议 | 固定文件名不是 hard gate；等价 command boundary 可接受，但需记录 rationale。 |

## Equivalent Implementation Policy（等价实现策略）

如果实现不新增 `src/commands/init.ts` 或 `src/commands/list.ts`，reviewer 必须先检查是否存在等价 command boundary、schema anchor、tests 和 fixtures。不能只因建议路径不同判失败；但不能接受没有 owning SPEC 的 public JSON 扩展。

## Evidence Plan（证据计划）

- `npm test -- test/config-initialization.test.ts test/config-merge-rules.test.ts`
- 新增 focused tests，例如 `test/init-command.test.ts`、`test/list-command.test.ts`
- `npm run build`
- `npm test` 或说明外部阻塞
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。实现完成前不得把本 Story 标记为 `review` 或 `done`。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

待实现时填写。

### Debug Log References（调试日志引用）

待实现时填写。

### Completion Notes（完成说明）

待实现时填写。

### File List（文件清单）

待实现时填写。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-15 | 0.2 | 重编号为 Epic 7.5，并补充对 Story 7.1 hook metadata 的 forward compatibility 边界。 | Amelia |
| 2026-06-15 | 0.1 | 创建 Epic 7.1 ready-for-dev Story，上下文覆盖 `init` / `list` contract-first 实现边界。 | Amelia |
