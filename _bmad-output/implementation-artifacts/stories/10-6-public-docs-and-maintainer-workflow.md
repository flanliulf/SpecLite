# Story 10.6: Public Docs And Maintainer Workflow（公开文档与维护者工作流）

Status: ready-for-dev

<!-- Expansion Story: 在 ecosystem modules 的 source、fixtures 和 release gates 具备后，更新 public docs、runtime layout、maintainer guide 和 newcomer docs，形成 Epic 10 的用户可见闭环。 -->

## Story（故事）

作为首次安装 SpecLite 的使用者、维护 canonical source 的贡献者和发布负责人，
我希望 public docs、runtime layout、quick start、maintainer guidance 和 release workflow 能清楚说明 ecosystem source authoring、install selection、selected-only runtime projection、fixture / release gate 和后续扩展流程，
以便用户知道何时选择 React / Vue / backend / other ecosystem modules，维护者知道如何新增 ecosystem source，并且发布负责人能验证 optional ecosystem 不污染默认安装。

## Acceptance Criteria（验收标准）

1. **User docs explain ecosystem selection（用户文档解释生态选择）**
   **前提** `speclite install --yes --interactive` 支持 ecosystem category -> id selection；
   **当** 用户阅读 quick start、install how-to 或 README；
   **则** docs 必须说明默认安装仍是 `core` + `sdlc`；
   **并且** interactive mode 可选择 optional ecosystem modules；
   **并且** ecosystem selection 是推荐但非 mandatory；
   **并且** `--yes`、`--json`、default no-prompt install 不会自动选择 ecosystem modules。

2. **Runtime layout documents selected-only projection（运行时文档说明选择性投影）**
   **前提** 用户阅读 runtime layout reference；
   **当** docs 描述 IDE mirrors、skill indexes、help index、phase coverage、files index 和 `_speclite/config.toml`；
   **则** 必须说明这些 projections 只包含 selected modules；
   **并且** selected ecosystem modules 会进入 `.claude/skills`、`.agents/skills` 和 indexes；
   **并且** unselected ecosystem modules 不会进入 target project runtime；
   **并且** static `core=13, sdlc=51` 只可作为特定版本默认 snapshot，不得写成长期全局真相。

3. **Canonical source layout and module docs include ecosystems（Canonical source 与 module 文档包含 ecosystems）**
   **前提** 维护者查阅 canonical source layout 或 SpecLite modules explanation；
   **当** docs 描述 source tree；
   **则** 必须列出 `ecosystems/<category>/<id>/`；
   **并且** 说明 `frontend`、`backend`、`other` 的职责与准入规则；
   **并且** 说明 ecosystem module metadata、module-help、Skill package layout、authoring / lint / changelog rules；
   **并且** 说明 `support-skills/` maintainer-only，不能被误解为 default install module。

4. **Maintainer workflow describes ecosystem authoring and release gates（维护者流程说明生态创作与发布门禁）**
   **前提** 维护者新增或迁移 ecosystem Skill；
   **当** 查阅 maintainer guide 或 support skill docs；
   **则** 文档必须按顺序说明：使用 creator / lint、更新 `module.yaml` / `module-help.csv`、运行 canonical source check、更新 fixtures、运行 build / tests / packaging check；
   **并且** 必须明确 canonical source change hook 是 warning-only guardrail，不替代 release verification；
   **并且** release check 顺序必须保持 build-first 和 packaging-last。

5. **Newcomer docs avoid scope confusion（新手文档避免范围混淆）**
   **前提** 新用户阅读 tutorials 或 quick start；
   **当** 看到 ecosystem modules；
   **则** 能理解 ecosystem modules 是额外方法论能力，不是项目依赖安装器、不是 package manager、不是 UI framework installer；
   **并且** docs 不得暗示 SpecLite 会安装 React / Vue / Java / npm package runtime dependencies；
   **并且** docs 必须区分 SpecLite CLI 自身和 target project ecosystem。

6. **Docs index and skill catalogs stay navigable（文档索引与 Skill 目录可导航）**
   **前提** 新增 ecosystem docs 或 skill catalogs；
   **当** 用户访问 `docs/index.md`、`docs/reference/index.md`、`docs/reference/skills/index.md`；
   **则** ecosystem docs 必须可发现；
   **并且** core / sdlc / support / ecosystem skill catalogs 的职责清楚；
   **并且** README、npm package `docs/quick-start.md` 和 public docs index 不互相矛盾。

7. **Docs validation and canonical checks close the loop（文档验证与 canonical 检查闭环）**
   **前提** docs、canonical source 或 release manifest 被更新；
   **当** Story 完成；
   **则** 必须运行 docs-focused grep / link checks、canonical source check、focused tests、build、packaging check 和 `git diff --check`；
   **并且** stale docs counts、only core+sdlc 过时表达和 selected-only contradictions 必须被修正或记录为 deferred risk；
   **并且** Epic 10 completion evidence 必须指向 Story 10.1-10.6 的 docs / fixture / release gate coverage。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Preflight and docs inventory（AC: 1-7）
  - [ ] 读取 Story 10.1 到 Story 10.5、Epic 10、`README.md`、`docs/index.md`、`docs/quick-start.md`、`docs/tutorials/quick-start.md`。
  - [ ] 读取 install docs：`docs/how-to/install-speclite.md`、`docs/how-to/validate-installation.md`、`docs/how-to/manage-installed-project.md`。
  - [ ] 读取 reference docs：`docs/reference/runtime-layout.md`、`docs/reference/canonical-source-layout.md`、`docs/explanation/speclite-modules.md`、`docs/reference/skills/*.md`。
  - [ ] 搜索 stale terms：`core=13`、`sdlc=51`、`total=64`、`only core+sdlc`、`default install baseline`、`support skill package roots`。
  - [ ] 本 Task 可在 Story 10.3 / 10.4 / 10.5 完成前启动，但产物只能是 docs inventory、stale scan、gap list 和待更新 plan，不得发布最终 public docs / catalog / release workflow 更新。

- [ ] Task 2: Update user-facing install docs（AC: 1, 5）
  - [ ] Final Publication Gate: 更新 README、quick start、install how-to 等用户可见文档前，必须读取 Story 10.3 / 10.4 / 10.5 completion evidence；若任一 Story 未完成，相关 ecosystem 能力必须标记为 deferred risk，不得写成已可用承诺。
  - [ ] 更新 `README.md` 的 methodology package overview，加入 optional ecosystem modules，但保持默认 quick start 简洁。
  - [ ] 更新 `docs/quick-start.md` 和 `docs/tutorials/quick-start.md`，说明默认安装、interactive ecosystem selection、skip、`--json` / `--yes` 默认行为。
  - [ ] 更新 `docs/how-to/install-speclite.md`，加入 ecosystem selection examples 和 selected-only warnings。
  - [ ] 明确 SpecLite 不安装项目 runtime dependencies；ecosystem modules 只安装 SpecLite Skill packages。

- [ ] Task 3: Update runtime and module references（AC: 2-3）
  - [ ] Final Publication Gate: runtime layout、canonical source layout、module explanation 或 glossary 中的 ecosystem selected-only 描述，必须以 Story 10.3 / 10.4 / 10.5 completion evidence 为依据；缺失证据时只能写 future/deferred scope。
  - [ ] 更新 `docs/reference/runtime-layout.md`，把 IDE mirrors / indexes 改写为 selected module projections。
  - [ ] 更新 `docs/reference/canonical-source-layout.md`，加入 `ecosystems/<category>/<id>/` source layout、module roots 和 support boundary。
  - [ ] 更新 `docs/explanation/speclite-modules.md`，解释 ecosystem module 是 optional extension module，依赖 `sdlc`，并描述 selected-only runtime。
  - [ ] 更新 `docs/glossary/speclite-runtime-boundaries.md` 或等价 glossary，说明 canonical source、ecosystem source 和 installed projection 的关系。

- [ ] Task 4: Update maintainer and skill catalog docs（AC: 3-6）
  - [ ] Final Publication Gate: skill catalog、ecosystem catalog 和 maintainer docs 必须引用已完成的 Story 10.3 / 10.4 source package evidence；未完成 category / id 只能作为 deferred risk 或 planned example。
  - [ ] 更新 `docs/reference/skills/index.md`，加入 ecosystem skill catalog 入口。
  - [ ] 新增或更新 `docs/reference/skills/ecosystem-skills.md`，列出 backend / frontend / other modules、example ids、default install boundary 和 authoring rule。
  - [ ] 更新 `docs/reference/skills/support-skills.md`，说明 creator / lint / canonical source check 在 ecosystem authoring 中的顺序。
  - [ ] 更新 `assets/source/speclite/README.md` 与 `README.en.md`，让 canonical source authoring docs 与 public docs 一致。

- [ ] Task 5: Document release and verification workflow（AC: 4, 7）
  - [ ] Final Publication Gate: release workflow 更新必须读取 Story 10.5 completion evidence，确认 selected ecosystem fixtures、canonical source check 和 packaging manifest 泛化已经完成；否则必须标记 deferred risk。
  - [ ] 更新 maintainer / release docs，明确 ecosystem source change 后必须运行 canonical source check。
  - [ ] 记录 build-first sequence：`npm run build` -> focused tests / fixture gates -> canonical source check -> `npm run release:packaging-check`。
  - [ ] 说明 hook warning-only：hook 可以提醒，但不能替代 release gate。
  - [ ] 记录 selected ecosystem fixtures 和 negative assertions 的维护规则。

- [ ] Task 6: Add docs checks and stale text coverage（AC: 6-7）
  - [ ] 增加或更新 docs reference tests，例如 `test/docs-reference-cli-options.test.ts` 或等价 docs assertion。
  - [ ] 扩展 canonical source change check stale text scan，覆盖 public docs 的 outdated count 和 only core+sdlc wording。
  - [ ] 对 `docs/index.md`、`docs/reference/index.md`、`docs/reference/skills/index.md` 做 link / route coverage。

- [ ] Task 7: Verification（AC: 1-7）
  - [ ] 运行 docs-focused grep：`rg -n "core=13|sdlc=51|total=64|only core\\+sdlc|only core\\+SDLC" README.md docs assets/source/speclite test`，确认遗留表达只在版本快照或 fixture expected 中有明确限定。
  - [ ] 运行 docs tests：`npm test -- test/docs-reference-cli-options.test.ts test/canonical-source-change-check-script.test.ts`。
  - [ ] 运行 canonical source check：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`。
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm run release:packaging-check`。
  - [ ] 运行 `git diff --check -- README.md docs assets/source/speclite test release _bmad-output/implementation-artifacts/stories/10-6-public-docs-and-maintainer-workflow.md`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic 10 要求 Story 10.6 更新 public docs、runtime layout、maintainer guide 和 newcomer docs，明确 ecosystem source authoring、install selection、selected-only runtime projection、release gate 和后续生态扩展流程。
- Story 10.1-10.5 分别建立 ecosystem foundation、authoring contract、frontend examples、other examples、fixture / release gate matrix；10.6 必须把这些变成用户和维护者能找到的文档路径。

### Current Verified Baseline（当前已验证基线）

- `README.md` 当前 overview 只列 `core-skills/`、`sdlc-skills/`、`support-skills/`、`hooks/`、`scripts/`、`custom/`。
- `docs/quick-start.md` 当前默认模块表只说明 required `core` 与 default-selected `sdlc`。
- `docs/reference/runtime-layout.md` 当前写着 official source snapshot 包含 13 个 core package roots 和 51 个 SDLC package roots，并描述默认选择 `core` + `sdlc`。
- `docs/reference/canonical-source-layout.md` 当前 top-level layout 没有 `ecosystems/`。
- `docs/index.md` 当前 core topics 包含 canonical source layout、runtime layout、SpecLite module 等入口，可作为新增 ecosystem docs 的导航锚点。

### Previous Story Intelligence（前序 Story 情报）

- Story 10.2 要求 support skill docs 不再把 support skills 写成 default install module，也要求 authoring flow 包含 creator / lint / canonical source check。
- Story 10.3 要求新手不能误解 frontend ecosystem module 等于新增 Web UI product scope。
- Story 10.4 要求 `other` category 有准入规则，不能写成 catch-all。
- Story 10.5 要求 docs 不再把 default `core+sdlc` count 写成长期全局真相。

### Scope Boundary（范围边界）

- 本 Story 允许提前执行 docs inventory、stale term scan 和文档差距分析；最终 public docs、catalog、runtime layout 和 release workflow 发布必须等待 Story 10.3 / 10.4 / 10.5 completion evidence，或把未完成能力明确标记为 deferred risk。
- 不把 ecosystem docs 写成已实现 runtime dependency installer；它只是 SpecLite Skill package selection。
- 不在 docs 中承诺尚未实现的 hosted service、browser dashboard、third-party package installation 或 remote catalog。
- 不删除兼容入口 `docs/quick-start.md`、README quick start 或 existing docs index。
- 不把 fixture expected snapshots 中的 historical count 当作 public docs 推荐语。

### Testing Guidance（测试指引）

- 对 docs 中必须保留的 snapshot count，添加上下文限定，例如“当前版本默认 no-ecosystem snapshot”。
- 对 public docs 的 ecosystem examples，优先用 stable module ids 和 paths，不写未经实现验证的具体 package root count。
- 对 hook 描述，必须保持 warning-only，不说成 blocking workflow。

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#Story-10.6`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md#Completion-Gate`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-2-ecosystem-authoring-contract-and-creator-support.md#Acceptance-Criteria`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-3-frontend-ecosystem-source-expansion.md#Scope-Boundary`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-4-other-ecosystem-source-expansion.md#Recommended-Classification-Decision`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-5-ecosystem-fixture-and-release-gate-generalization.md#Acceptance-Criteria`]
- [Source: `README.md#What-SpecLite-Provides`]
- [Source: `docs/quick-start.md#Choose-Install-Configuration`]
- [Source: `docs/reference/runtime-layout.md#IDE-Mirrors`]
- [Source: `docs/reference/canonical-source-layout.md#Top-Level-Layout`]
- [Source: `docs/index.md#Core-Topics`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

待实现后填写。

### Debug Log References（调试日志引用）

待实现后填写。

### Completion Notes List（完成说明）

待实现后填写。

### File List（文件清单）

待实现后填写。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-07-06 | 0.1 | 创建 Story 10.6，定义 ecosystem public docs、runtime layout、maintainer workflow、newcomer guidance、docs index 和 release verification 文档闭环。 | John / Codex |
