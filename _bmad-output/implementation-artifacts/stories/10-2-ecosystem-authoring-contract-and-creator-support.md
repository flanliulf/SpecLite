# Story 10.2: Ecosystem Authoring Contract And Creator Support（生态源定义创作契约与 Creator 支持）

Status: ready-for-dev

<!-- Expansion Story: 基于 Story 10.1 的 ecosystem module foundation，把后续新增 ecosystem Skill 的创作、lint、帮助目录和版本纪律固化为可执行支撑契约。 -->

## Story（故事）

作为 SpecLite 维护者和 ecosystem Skill 作者，
我希望 `speclite-skill-creator`、`speclite-skill-lint`、canonical source docs 和 module help 规则能够明确支持 `assets/source/speclite/ecosystems/<category>/<id>/`，
以便后续新增 React、Vue、Java、Spring Boot、Node.js、Python、npm package 等生态 Skill 时，不需要重新解释目录、metadata、命名、lint、help catalog、版本和发布检查边界。

## Acceptance Criteria（验收标准）

1. **Ecosystem authoring contract is documented（生态创作契约被文档化）**
   **前提** Story 10.1 已定义 `ecosystems/<category>/<id>/` taxonomy 与 `ecosystem-<category>-<id>` module code；
   **当** 维护者查阅 canonical source authoring docs；
   **则** docs 必须说明 ecosystem module root、`module.yaml` 必填字段、`module-help.csv` 覆盖规则、Skill package layout、category / id naming rules 和 selected-only install boundary；
   **并且** docs 必须说明 generic SDLC Skill 仍在 `sdlc-skills/`，只有具化到技术生态的 Skill 进入 `ecosystems/<category>/<id>/`；
   **并且** docs 不得把 `support-skills/` 描述成默认安装 module。

2. **Creator routes ecosystem targets correctly（Creator 能正确路由生态目标）**
   **前提** 用户通过 `speclite-skill-creator` 创建或迁移 workflow 风格 Skill；
   **当** 用户选择 ecosystem target；
   **则** creator 必须支持目标路径 `assets/source/speclite/ecosystems/<category>/<id>/<skill-name>/`；
   **并且** category 只能是 `frontend`、`backend`、`other`；
   **并且** creator 必须引导确认 `ecosystem_id`、module code、module-help row、`CHANGELOG.md`、`SKILL.md` / `SKILL.en.md` 同步和 runtime path 表达；
   **并且** Agent 定义包仍交给 `speclite-agent-creator`，不被普通 workflow creator 误生成。

3. **Lint validates ecosystem-specific rules（Lint 校验生态专属规则）**
   **前提** `speclite-skill-lint` 检查 ecosystem Skill package 或 ecosystem module root；
   **当** 目录位于 `assets/source/speclite/ecosystems/<category>/<id>/`；
   **则** lint 必须验证 package name 仍以 `speclite-` 开头、YAML / version / mirror / density 规则不降级；
   **并且** lint 必须识别 invalid category、missing / mismatched `ecosystem_id`、module code 与目录不一致、缺少 `module-help.csv` row、缺少 `CHANGELOG.md`、中文/英文入口版本不一致；
   **并且** lint 不得把 ecosystem path 误判为 external project path 或 runtime dependency。

4. **Module help and discovery guidance is explicit（Module help 与发现指引明确）**
   **前提** ecosystem module 有自己的 `module-help.csv`；
   **当** 新增或迁移 Skill package；
   **则** 每个 canonical package root 至少有一条非 `_meta` help row；
   **并且** help rows 必须使用 stable `skill` id、display name、phase、menu code / action、output location 和 artifact type；
   **并且** duplicate row、unknown package root、missing package row 继续由 module metadata / canonical source check 暴露；
   **并且** Story 10.1 的 nested discovery 不得被 creator / lint 文档写成 arbitrary deep scan。

5. **Support skills remain maintainer-only（支撑 Skill 保持维护者专用）**
   **前提** `support-skills/` 包含 `speclite-skill-creator`、`speclite-skill-lint`、`speclite-agent-creator`、`speclite-agent-lint` 和 `speclite-check-canonical-source-change`；
   **当** Story 实现更新 creator / lint / docs；
   **则** `support-skills/` 仍不进入 default target runtime install set；
   **并且** 目标项目默认安装仍由 selected modules 决定；
   **并且** support skill docs 中的 hardcoded baseline count 必须改为不会阻碍 ecosystem selected-only model 的表达。

6. **Version and changelog discipline covers ecosystem packages（版本与变更纪律覆盖生态包）**
   **前提** 维护者新增或迁移 ecosystem Skill；
   **当** creator / lint / maintainer workflow 运行；
   **则** 必须要求同步 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、metadata version 和 module docs；
   **并且** 从 `sdlc-skills/` 迁移到 ecosystem module 时必须记录 source path move、runtime behavior unchanged 和 package id 是否保持不变；
   **并且** 不得通过改名绕开 installed activation、help index 或 package root uniqueness。

7. **Canonical source change check is part of authoring flow（Canonical source 变更检查进入创作流程）**
   **前提** ecosystem module 或 Skill source 被新增、迁移或删除；
   **当** creator / maintainer docs 给出验证步骤；
   **则** 必须先运行 `speclite-check-canonical-source-change`；
   **并且** 再按对象类型运行 `speclite-skill-lint` 或 `speclite-agent-lint`；
   **并且** canonical source check 必须能覆盖 nested ecosystem package roots、module-help drift、docs stale counts 和 packaging manifest drift。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Preflight and source review（AC: 1-7）
  - [ ] 读取 Story 10.1、Epic 10、`assets/source/speclite/README.md`、`docs/reference/canonical-source-layout.md`、`docs/explanation/speclite-modules.md`、`docs/reference/skills/support-skills.md`。
  - [ ] 读取 `speclite-skill-creator`、`speclite-skill-lint`、`speclite-agent-creator`、`speclite-agent-lint`、`speclite-check-canonical-source-change` 的 `SKILL.md` 与关键 `references/`。
  - [ ] 读取 implementation anchors：`src/modules/module-metadata.ts`、`src/modules/module-selection.ts`、`test/source-and-modules.test.ts`、`test/canonical-source-change-check-script.test.ts`。
  - [ ] 检查 `git status --short -- assets/source/speclite docs src test release _bmad-output/implementation-artifacts/stories/10-2-ecosystem-authoring-contract-and-creator-support.md`，识别用户已有 canonical source 变更。

- [ ] Task 2: Add authoring contract documentation（AC: 1, 4-7）
  - [ ] 更新 `assets/source/speclite/README.md`，新增 `ecosystems/<category>/<id>/` authoring section，说明 category、id、module code、module yaml、module-help、Skill layout、support skill usage。
  - [ ] 更新 `docs/reference/canonical-source-layout.md`，把 Module Roots 从 only top-level `core` / `sdlc` 扩展为 top-level modules + bounded nested ecosystem modules。
  - [ ] 更新 `docs/explanation/speclite-modules.md`，解释 ecosystem module 是 optional extension module，依赖 `sdlc`，不改变 `core` / `sdlc` 默认行为。
  - [ ] 更新 `docs/reference/skills/support-skills.md`，移除会失效的 hardcoded default baseline count，改为 selected module truth 与 maintainer-only support boundary。

- [ ] Task 3: Extend `speclite-skill-creator` for ecosystem target routing（AC: 2, 5-6）
  - [ ] 在 `speclite-skill-creator` 入口或 workflow reference 中加入 target group：`core-skills`、`sdlc-skills/<phase>`、`support-skills`、`ecosystems/<category>/<id>`。
  - [ ] 为 ecosystem target 增加 category / ecosystem id / module code / module-help row / version sync / changelog sync 确认清单。
  - [ ] 保持 Agent routing rule：`speclite-agent-*`、`bmad-agent-*` 或 `[agent]` package 仍转交 `speclite-agent-creator`。
  - [ ] 增加 creator 触发测试或 golden example，证明 ecosystem path 不会生成到 `sdlc-skills/` 或 project runtime mirror。

- [ ] Task 4: Extend `speclite-skill-lint` for ecosystem validation（AC: 3-4, 6）
  - [ ] 更新 lint rules reference，新增 ecosystem source path classification：`assets/source/speclite/ecosystems/<category>/<id>/<skill>/`。
  - [ ] 增加 lint checks：category enum、`ecosystem_id` / module code / directory consistency、required `module-help.csv` row、package id uniqueness、version / changelog / mirror sync。
  - [ ] 确保 existing YAML、description、body density、fixed path hard gate、runtime path、forbidden prefix 规则继续适用于 ecosystem packages。
  - [ ] 增加 negative tests：invalid category、missing `CHANGELOG.md`、`SKILL.en.md` 版本不一致、unknown module-help row、ecosystem path 被误判为 external path。

- [ ] Task 5: Update canonical source change check for ecosystem authoring drift（AC: 4, 7）
  - [ ] 扩展 `check_canonical_source_change.mjs`，让 counts / module-help checks 包含 `ecosystems/<category>/<id>/` module roots。
  - [ ] 报告中区分 default install baseline 与 selected ecosystem counts，避免把 ecosystem packages 算入 unconditional default install total。
  - [ ] 增加 stale text scan coverage，捕获 docs 中 only core+sdlc、固定 root count、support count 和 package total 的过时表达。
  - [ ] 更新 `test/canonical-source-change-check-script.test.ts`，加入 nested ecosystem fixture 与 module-help drift assertion。

- [ ] Task 6: Verification（AC: 1-7）
  - [ ] 运行 focused creator / lint tests 或脚本：`python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/support-skills/speclite-skill-creator`。
  - [ ] 运行 canonical source change check：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`。
  - [ ] 运行 module metadata / source tests：`npm test -- test/source-and-modules.test.ts test/canonical-source-change-check-script.test.ts`。
  - [ ] 运行 `git diff --check -- assets/source/speclite docs src test _bmad-output/implementation-artifacts/stories/10-2-ecosystem-authoring-contract-and-creator-support.md`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic 10 要求把 ecosystem module 的 source authoring contract 固化到 support skills、creator / lint guidance、module-help 规则、naming rules 和 changelog / version discipline。
- Story 10.1 已定义 ecosystem source path 为 `assets/source/speclite/ecosystems/<category>/<id>/`，module code 为 `ecosystem-<category>-<id>`，并要求 ecosystem modules optional、selected-only、依赖 `sdlc`。
- 用户明确要求本轮 Story 创建过程不因普通决策等待挂起；实现本 Story 时如遇“creator 是否更新 docs 还是脚本”的非产品级分歧，优先选择同时更新 docs + deterministic lint / test 的可验证方案。

### Current Verified Baseline（当前已验证基线）

- `support-skills/` 当前没有 `module.yaml` / `module-help.csv`，不是 install module；它服务 maintainer authoring，不进入默认目标项目 runtime。
- `speclite-skill-creator` 当前 Step 2 只说明生成到 `assets/source/speclite/<group>/<skill-name>/`，其中 `<group>` 为 `core-skills`、`sdlc-skills/<phase>` 或 `support-skills`；尚未表达 ecosystem target。
- `speclite-skill-lint` 当前规则覆盖 YAML、description、版本、mirror、density、fixed path hard gate 和 `speclite-` 前缀；尚未表达 ecosystem path / module metadata consistency。
- `docs/reference/skills/support-skills.md` 当前写着 support skills 不计入默认安装 baseline，并包含 `core=13`、`sdlc=51`、`total=64` 这类会随 ecosystem 变化失效的静态表达。
- `src/modules/module-metadata.ts` 当前 `discoverOfficialModules` 读取 `module.yaml`、`module-help.csv`、递归 package roots，并校验 duplicate module code、duplicate skill id、unknown dependency、unknown help skill。
- `speclite-check-canonical-source-change` 当前 counts 只有 `core`、`sdlc`、`support`、`hooks` 和 `defaultInstall.total`，`checkModuleHelp` 只固定检查 `core-skills` 与 `sdlc-skills`。

### Previous Story Intelligence（前序 Story 情报）

- Story 10.1 把 nested discovery、ecosystem metadata validation、two-level selection、selected-only projection、首批 backend migration 和 release gate 作为系统闭环。
- Story 10.2 不应重新实现 selected-only projection；它应让后续新增 ecosystem source 的 authoring / lint / docs / verification 流程可重复。
- Story 10.1 的 preferred discovery boundary 是 top-level modules 加 exactly `ecosystems/<category>/<id>/module.yaml`，因此 creator / lint 文档不得鼓励 arbitrary deep module roots。

### Architecture Compliance（架构遵循）

- 不把 `_speclite-output/` 过程产物写回 canonical source。
- 不把 `support-skills/` 纳入 default install baseline。
- 不改变 existing `core` / `sdlc` package content，除非实现 evidence 证明某个 tech-specific package 被迁移到 ecosystem module 且 module-help / docs / fixtures 已同步。
- 不把 source repo path 写成 installed runtime dependency；Skill 文档必须继续使用 `{project-root}`、`.claude/skills/<skill-name>`、`.agents/skills/<skill-name>` 和 `_speclite` runtime 表达。

### Testing Guidance（测试指引）

- 优先增加 deterministic unit / script tests，不依赖人工交互。
- 对 creator guidance 可以使用 golden text / fixture path assertions，重点证明 ecosystem target 被接受且 support / agent routing 未回归。
- 对 lint guidance 必须覆盖 negative cases，避免后续 ecosystem package 缺少 `module-help.csv` row 或 version sync 却通过。
- 对 canonical source check 必须同时验证 selected ecosystem count 与 default install total 不混淆。

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#Story-10.2`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md#Dev-Notes`]
- [Source: `assets/source/speclite/README.md#Support-Skills`]
- [Source: `docs/reference/canonical-source-layout.md#Module-Roots`]
- [Source: `docs/explanation/speclite-modules.md#Installation-Model`]
- [Source: `docs/reference/skills/support-skills.md#Boundaries`]
- [Source: `src/modules/module-metadata.ts#discoverOfficialModules`]
- [Source: `assets/source/speclite/support-skills/speclite-skill-creator/SKILL.md#Workflow`]
- [Source: `assets/source/speclite/support-skills/speclite-skill-lint/SKILL.md#Workflow`]
- [Source: `assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs#createReport`]

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
| 2026-07-06 | 0.1 | 创建 Story 10.2，定义 ecosystem source authoring、creator routing、lint validation、module-help、support skill 和 canonical source check 维护契约。 | John / Codex |
