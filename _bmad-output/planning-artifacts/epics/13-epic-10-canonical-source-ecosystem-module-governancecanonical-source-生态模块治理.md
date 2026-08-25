# Epic 10: Canonical Source Ecosystem Module Governance（Canonical Source 生态模块治理）

`assets/source/speclite/` 是 SpecLite 方法论的 canonical source 定义目录。当前官方模块只有 `core` 和 `sdlc` 两个安装模块，但 source tree 中已经出现少量具化到 Java / Spring Boot、Node.js、Python 等技术栈的 Skill。随着后续 React、Vue、Java、Spring Boot、Node.js、Python、npm package 等生态定义持续增加，如果继续把它们混在 `sdlc-skills/` 中，安装时会把不相关技术栈的 Skill 全量投影到目标项目，削弱 canonical source 的边界、安装体验和 installed runtime 的信号质量。

本 Epic 建立 `ecosystems` module 体系：生态模块依赖 `sdlc`，但不强制安装；交互式 install 在选择 `sdlc` 后强烈建议通过“前端 / 后端 / 其他”到具体生态的两级选择启用对应模块；最终只安装用户选择的 ecosystem modules。`core`、`sdlc` 和 ecosystem modules 均保持 module contract，而 ecosystem 是扩展模块层。

## Product Problem（产品问题）

当前体系存在四个断点：

- Source taxonomy 只有 `core-skills/` 与 `sdlc-skills/`，无法表达“通用 SDLC 方法论”和“特定技术生态扩展”的差异。
- Installer 的 official module discovery 只扫描 `assets/source/speclite/*/module.yaml`，不支持 `ecosystems/<category>/<id>/` 这类分层 source definition。
- 安装选择是 flat module list，无法用“前端 / 后端 / 其他”到 “React / Vue / Java / SpringBoot / Node.js / Python” 的两级方式引导用户。
- Current installed projection 只按 selected modules 工作，但如果 ecosystem source 仍混在 `sdlc` 中，实际效果仍是全量安装不相关技术栈 Skill。

## Product Thesis（产品主张）

SpecLite 的 canonical source 应把通用研发方法论和技术生态扩展分层表达。`sdlc` 继续承载跨技术栈的产品、规划、架构、实现和发布流程；`ecosystems/<category>/<id>/` 承载某个技术生态下的源定义、Skill 和后续方法论扩展。安装时，生态选择应是强推荐但非必选，并且必须 selected-only projection，不能因为 source tree 存在生态定义就全量安装。

## Scope（范围）

本 Epic 覆盖：

- `assets/source/speclite/ecosystems/<category>/<id>/` canonical source taxonomy。
- Ecosystem module metadata、discovery、validation、dependency 和 module code contract。
- Installer 两级生态选择体验：`frontend` / `backend` / `other` 到具体 ecosystem id。
- `core` required、`sdlc` default selected、ecosystem optional but recommended when `sdlc` is selected 的安装规则。
- Selected-only IDE mirror、skill-index、help-index、phase-coverage、files-index 和 installed config projection。
- 现有 Java / Spring Boot、Node.js、Python 等 backend 技术栈 Skill 的迁移边界。
- Fixture、packaging、canonical source check、runtime docs 和 maintainer workflow 的闭环更新。

本 Epic 不覆盖：

- 改变 `core` / `sdlc` 现有默认安装行为。
- 把 ecosystem modules 变成 mandatory modules。
- 新增第三套 runtime resolver、daemon、IDE target 或 source checkout runtime dependency。
- 把所有技术栈定义一次性补齐到完整矩阵；本 Epic 建立体系与首批迁移闭环，后续生态可以增量进入。
- 改写现有 SDLC workflow business logic、Agent persona 或 PRD / Architecture artifact contract。

## Module Decision（模块决策）

Ecosystem source path 使用：

```text
assets/source/speclite/ecosystems/<category>/<id>/
```

初始 category 固定为：

- `frontend`
- `backend`
- `other`

Ecosystem module code 使用 flat stable id：

```text
ecosystem-<category>-<id>
```

示例：

- `assets/source/speclite/ecosystems/backend/java-springboot/` -> `ecosystem-backend-java-springboot`
- `assets/source/speclite/ecosystems/backend/nodejs/` -> `ecosystem-backend-nodejs`
- `assets/source/speclite/ecosystems/frontend/react/` -> `ecosystem-frontend-react`

Ecosystem `module.yaml` 必须显式声明：

- `module_kind: ecosystem`
- `ecosystem_category: frontend | backend | other`
- `ecosystem_id: <id>`
- `required_dependencies: [sdlc]`
- `default_selected: false`
- `required: false`

`core` 仍然是 required module；`sdlc` 仍然 default selected 并依赖 `core`。任何 ecosystem module 被选择时必须自动拉起 `sdlc`，但 `--yes` / JSON 默认安装不得自动选择任何 ecosystem module。

## Story List（Story 列表）

### Story 10.1: Ecosystem Module Taxonomy And Guided Selected Install Closure（生态模块分类、引导选择与选择性安装闭环）

作为 SpecLite 维护者和目标项目安装者，
我希望技术生态相关的 canonical source 能放入 `assets/source/speclite/ecosystems/<category>/<id>/`，并在安装时通过“前端 / 后端 / 其他”到具体生态的两级选择只安装匹配的 ecosystem modules，
以便 `sdlc` 保持通用方法论边界，Java / Spring Boot、Node.js、Python、React、Vue 等技术生态扩展可以增量增长，而目标项目不会被不相关的 Skill 全量混入。

#### Acceptance Criteria（验收标准）

1. **Ecosystem source taxonomy is canonical（生态源目录成为 canonical taxonomy）**
   **前提** `assets/source/speclite/` 继续作为 canonical source authoring root；
   **当** 维护者新增技术生态定义；
   **则** ecosystem modules 必须位于 `assets/source/speclite/ecosystems/<category>/<id>/`；
   **并且** 初始 category 只能是 `frontend`、`backend`、`other`；
   **并且** `core-skills/`、`sdlc-skills/`、`support-skills/`、`hooks/`、`scripts/` 和 `custom/` 的现有职责不被重新定义；
   **并且** generic SDLC workflow 仍留在 `sdlc-skills/`，只有具化到某个技术生态的 Skill 才迁入 ecosystem module。

2. **Nested ecosystem modules are discovered deterministically（嵌套生态模块可确定发现）**
   **前提** ecosystem module root 存在 `module.yaml`；
   **当** `discoverOfficialModules` 扫描 bundled source；
   **则** 它必须同时发现 top-level modules（例如 `core-skills/`、`sdlc-skills/`）和 nested modules（例如 `ecosystems/backend/java-springboot/`）；
   **并且** `OfficialModule.sourceDirectory` 必须保存稳定 POSIX path，例如 `ecosystems/backend/java-springboot`；
   **并且** duplicate module code、duplicate canonical skill id、unknown dependency、missing module-help reference 和 invalid ecosystem metadata 必须继续 fail fast；
   **并且** module ordering 必须 deterministic，不能受 filesystem ordering 影响。

3. **Ecosystem metadata and dependency contract are explicit（生态元数据与依赖契约显式）**
   **前提** module kind 是 ecosystem；
   **当** parser 读取 `module.yaml`；
   **则** `module_kind: ecosystem`、`ecosystem_category`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false` 必须被验证；
   **并且** module code 必须使用 `ecosystem-<category>-<id>` 形态，例如 `ecosystem-backend-java-springboot`；
   **并且** 选择任何 ecosystem module 时必须自动包含 `sdlc`，`sdlc` 再通过 existing dependency 包含 `core`；
   **并且** ecosystem module 不得绕过 `sdlc` config、artifact roots、activation contract 或 `speclite resolve`。

4. **Initial backend ecosystem migration proves the loop（首批后端生态迁移证明闭环）**
   **前提** 当前 `sdlc-skills/1-analysis/` 下存在具化到 backend 技术生态的 Skill；
   **当** 实现本 Story；
   **则** 至少迁移这些技术栈专属 Skill 到 ecosystem modules：`speclite-brownfield-java-springboot-backend-tech-stack-digger`、`speclite-brownfield-nodejs-backend-tech-stack-digger`、`speclite-brownfield-python-backend-tech-stack-digger`；
   **并且** 迁移后的 source paths 应分别归属 `ecosystems/backend/java-springboot/`、`ecosystems/backend/nodejs/`、`ecosystems/backend/python/`；
   **并且** generic `speclite-brownfield-backend-tech-stack-digger` 保持在 `sdlc`，除非实现时明确证明它应成为 `ecosystems/backend/generic` 并同步更新本 Story 的证据；
   **并且** 迁移不得改变 Skill 的 runtime activation contract、artifact output contract 或 source-independent installed behavior。

5. **Install prompts use two-level ecosystem selection（安装提示使用两级生态选择）**
   **前提** 用户运行 interactive `speclite install` 且最终选择包含 `sdlc`；
   **当** installer 进入 module selection；
   **则** 它必须先展示 ecosystem category selection：`frontend` / `backend` / `other` / skip；
   **并且** 用户选择 category 后只能看到该 category 下的 ecosystem ids，例如 backend 下的 `java-springboot`、`nodejs`、`python`；
   **并且** skip 是合法路径，因为 ecosystem module 强烈推荐但非 mandatory；
   **并且** `--yes`、`--json` 或无交互默认路径不得自动选择任何 ecosystem module，只能保持 existing default `core` + `sdlc`；
   **并且** CLI / programmatic selection 仍必须支持 exact module code，并对 unknown ecosystem module id 返回现有 invalid module selection error。

6. **Installed projection is selected-only（安装投影只包含已选择模块）**
   **前提** canonical source 中存在多个 ecosystem modules；
   **当** 用户只选择一个 ecosystem module；
   **则** `.claude/skills/`、`.agents/skills/`、`skill-index-full.json`、`help-index.json`、`phase-coverage.json`、`files-index-full.json` 和 installed tree 只能包含 `core`、`sdlc` 与用户选择的 ecosystem module packages；
   **并且** 未选择的 ecosystem modules 不得出现在 installed IDE mirrors、help rows、phase rows、skill index、files index 或 ready summary selected module count；
   **并且** `target-writer`、validate、status、update、repair 和 uninstall 必须继续以 selected modules 为 installed-state truth；
   **并且** 不得因为 `assets/source/speclite/ecosystems/**` 存在 source packages 就全量安装。

7. **Minimal proof hands off fixture and release generalization（最小证明交接 Fixture 与发布泛化）**
   **前提** ecosystem modules 进入 official source；
   **当** 实现完成；
   **则** `_speclite/config.toml` 或 installed summary 必须能表达 selected ecosystem module ids，且未来带 config prompts 的 ecosystem module 可以写入稳定 config table；
   **并且** 本 Story 只需用首批 backend migration 提供最小 selected-only proof，证明 selected ecosystem module 被安装、unselected backend ecosystem module 不被安装、默认 no-ecosystem install 不变；
   **并且** 只更新支撑该最小 proof 所需的 docs / fixtures / release evidence，不负责全矩阵 fixture、fixed count 泛化、release packaging manifest 和 canonical source check 的全面泛化；
   **并且** 必须把 full matrix fixture、fixed count 泛化、release packaging、canonical source check 和 public docs 全面闭环交接给 Story 10.5 / 10.6；
   **并且** 不得把 current package root count hardcode 为 only `core` + `sdlc` 的长期真相。

#### Historical Scope Decomposition（历史范围拆分）

Story 10.1 已在 sprint tracker 中标记为 `done`，且既有 implementation artifact、review 与 closure evidence 均使用 `10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure`。为保留历史身份与证据链，本轮不重编号、不创建新的可执行 Story，也不把 Story 10.1 或后续已完成 Stories 改回 `ready-for-dev`。

后续维护或审计应将该历史 Story 按四个独立验收域读取：

1. **Taxonomy And Discovery Contract：** canonical ecosystem taxonomy、nested deterministic discovery、metadata 与 dependency contract。
2. **Guided Interactive Selection：** category → ecosystem id 两级选择、skip path、exact module code 与 no-prompt defaults。
3. **Initial Backend Source Migration：** Java/Spring Boot、Node.js、Python 专属 Skill 迁移与 generic SDLC boundary。
4. **Selected-Only Projection And Proof：** selected modules 作为 installed-state truth、未选生态 negative assertions 与最小 fixture evidence。

这四个域仅用于历史 evidence mapping 和独立回归定位，不形成新的 backlog item，不进入当前 implementation authorization。未来若任一域产生新产品范围，必须通过新的 change-controlled Story 建立独立 ID、gate 和状态；不得重新执行整个 Story 10.1，也不得以维护某一域为由重开无关域。

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR2`、`FR3`、`FR18`、`FR19`、`FR20`、`FR63a`、`FR66`、`FR67`、`FR71`
- **Supporting NFRs:** `NFR6`、`NFR19`、`NFR23`、`NFR24`、`NFR27`、`NFR28a`、`NFR36`、`NFR37`、`NFR40`
- **UX / Contract Anchors:** SPEC 04 selected installed projection、SPEC 05 self-contained IDE entries、SPEC 08 fixture contract、canonical source taxonomy and module metadata
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md` 的 Story、Acceptance Criteria、Source Requirements 与 contract/reference anchors；未复制执行记录

### Story 10.2: Ecosystem Authoring Contract And Creator Support（生态源定义创作契约与 Creator 支持）

作为 SpecLite 维护者和 ecosystem Skill 作者，
我希望 `speclite-skill-creator`、`speclite-skill-lint`、canonical source docs 和 module help 规则能够明确支持 `assets/source/speclite/ecosystems/<category>/<id>/`，
以便后续新增 React、Vue、Java、Spring Boot、Node.js、Python、npm package 等生态 Skill 时，不需要重新解释目录、metadata、命名、lint、help catalog、版本和发布检查边界。

#### Acceptance Criteria（验收标准）

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

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR18`、`FR66`、`FR71`
- **Supporting NFRs:** `NFR28a`、`NFR36`、`NFR37`、`NFR40`
- **UX / Contract Anchors:** canonical source authoring contract、module-help coverage、creator/lint rules、canonical source change check
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/10-2-ecosystem-authoring-contract-and-creator-support.md` 的 Story、Acceptance Criteria、Source Requirements 与 contract/reference anchors；未复制执行记录

### Story 10.3: Frontend Ecosystem Source Expansion（前端生态源定义扩展）

作为需要在前端项目中使用 SpecLite 的开发者和维护者，
我希望 SpecLite 能提供首批 `ecosystems/frontend/<id>/` 官方生态模块，例如 React 与 Vue，
以便前端项目可以安装更贴近组件架构、状态管理、测试、可访问性、构建和迁移场景的 Skill，同时没有选择 frontend ecosystem 的项目不会被这些前端能力污染。

#### Acceptance Criteria（验收标准）

1. **Frontend ecosystem modules are explicit（前端生态模块显式存在）**
   **前提** Story 10.1 已支持 nested ecosystem module discovery；
   **当** 维护者新增前端生态源定义；
   **则** 首批 frontend modules 必须位于 `assets/source/speclite/ecosystems/frontend/react/` 与 `assets/source/speclite/ecosystems/frontend/vue/`；
   **并且** module code 分别为 `ecosystem-frontend-react` 与 `ecosystem-frontend-vue`；
   **并且** 每个 module root 必须有 `module.yaml`、`module-help.csv` 和至少一个有效 Skill package root；
   **并且** `module_kind: ecosystem`、`ecosystem_category: frontend`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false` 必须通过 metadata validation。

2. **Frontend package content is ecosystem-specific（前端包内容具备生态特异性）**
   **前提** React / Vue ecosystem modules 被选择安装；
   **当** 用户运行对应 Skill；
   **则** React module 至少提供与 React 项目事实相关的 Skill，例如组件架构 / hook state / routing / test strategy / migration review 中的一项或多项；
   **并且** Vue module 至少提供与 Vue 项目事实相关的 Skill，例如 Composition API / SFC structure / routing / state / test strategy / migration review 中的一项或多项；
   **并且** Skill 不得伪造具体框架版本或 API 细节，必须从目标项目文件、lockfile、官方 docs 或用户提供资料中取证；
   **并且** 通用 UX、PRD、Architecture、Story creation 和 code review workflow 仍留在 `sdlc`，不因 frontend module 存在而迁移。

3. **Two-level install selection handles frontend category（两级安装选择支持前端类别）**
   **前提** 用户交互式运行 `speclite install` 且选择包含 `sdlc`；
   **当** installer 展示 ecosystem recommendation；
   **则** category 层必须包含 `frontend`；
   **并且** 用户选择 `frontend` 后只看到 frontend ecosystem ids，例如 `react`、`vue`；
   **并且** 用户 skip frontend 是合法路径；
   **并且** `--yes`、`--json`、无 selector 默认路径不得自动选择 React / Vue module。

4. **Selected-only projection prevents cross-category leakage（选择性投影防止跨类别污染）**
   **前提** source tree 中同时存在 frontend、backend 和 other ecosystem modules；
   **当** 用户只选择 `ecosystem-frontend-react`；
   **则** `.claude/skills/`、`.agents/skills/`、`skill-index-full.json`、`help-index.json`、`phase-coverage.json`、`files-index-full.json` 只能包含 `core`、`sdlc` 与 React ecosystem package；
   **并且** Vue、backend、other 未选 ecosystem packages 不得出现在 IDE mirrors、help rows、phase rows、files index 或 ready summary；
   **并且** 只选择 Vue 时也必须对 React 作同等 negative assertion。

5. **Frontend module help is complete and discoverable（前端 module help 完整可发现）**
   **前提** frontend ecosystem Skill package 被创建；
   **当** `discoverOfficialModules` 读取 frontend module；
   **则** 每个 package root 必须至少有一条非 `_meta` `module-help.csv` row；
   **并且** help row 必须包含稳定 display name、menu code 或 action、phase、output location 和 artifact type；
   **并且** duplicate module code、duplicate skill id、unknown help row、unknown dependency 必须继续 fail fast。

6. **Docs and examples teach frontend ecosystem boundaries（文档和示例说明前端生态边界）**
   **前提** frontend ecosystem modules 进入 canonical source；
   **当** 用户阅读 public docs 或 maintainer docs；
   **则** docs 必须说明 React / Vue modules 是 optional ecosystem extensions；
   **并且** docs 必须说明 SpecLite 本身仍是 CLI + filesystem control plane，不因 frontend ecosystem module 而新增 Web UI product scope；
   **并且** docs 必须说明 generic frontend discussion belongs in `sdlc` unless it is bound to a concrete framework ecosystem。

7. **Release and canonical source checks cover frontend ecosystems（发布与 canonical 检查覆盖前端生态）**
   **前提** React / Vue ecosystem source files 存在；
   **当** release gate 运行；
   **则** packaging manifest 必须包含 selected frontend ecosystem source files；
   **并且** canonical source check 必须检查 frontend module-help rows、stale docs counts 和 package inventory；
   **并且** focused install tests 必须覆盖 default no-ecosystem baseline、selected React、selected Vue 和 unselected leakage negative assertions。

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR3`、`FR18`、`FR19`、`FR20`、`FR63a`、`FR66`、`FR67`、`FR71`
- **Supporting NFRs:** `NFR23`、`NFR24`、`NFR27`、`NFR36`、`NFR37`、`NFR40`
- **UX / Contract Anchors:** SPEC 04 selected-only indexes、SPEC 05 IDE projection、SPEC 08 positive/negative ecosystem fixtures、frontend ecosystem authoring contract
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/10-3-frontend-ecosystem-source-expansion.md` 的 Story、Acceptance Criteria、Source Requirements 与 contract/reference anchors；未复制执行记录

### Story 10.4: Other Ecosystem Source Expansion（其他生态源定义扩展）

作为维护 SpecLite canonical source 的方法论维护者，
我希望 `ecosystems/other/<id>/` 有明确示例、命名规则、准入标准和安装验收，
以便 npm package、CLI tool、documentation-only project 等非前端 / 后端类别可以获得专属 Skill 支持，同时 `other` 不会变成所有无法分类内容的默认堆放区。

#### Acceptance Criteria（验收标准）

1. **Other category has strict admission rules（other 类别有严格准入规则）**
   **前提** Story 10.1 已定义 category enum 为 `frontend`、`backend`、`other`；
   **当** 维护者创建 `ecosystems/other/<id>/`；
   **则** `other` 只能用于不能归入 frontend / backend 且具有稳定项目形态的生态；
   **并且** 初始允许 examples 为 `npm-package`、`cli-tool`、`documentation-only`；
   **并且** 新增其他 id 必须记录 why-not-frontend、why-not-backend、目标项目事实、安装价值和 selected-only 验收。

2. **Seed other modules are concrete and bounded（初始 other modules 具体且有边界）**
   **前提** canonical source 中还没有 `ecosystems/other/`；
   **当** 实现本 Story；
   **则** 至少建立以下 module roots 中的一个，并优先建立三者完整矩阵：`ecosystems/other/npm-package/`、`ecosystems/other/cli-tool/`、`ecosystems/other/documentation-only/`；
   **并且** module code 必须分别使用 `ecosystem-other-npm-package`、`ecosystem-other-cli-tool`、`ecosystem-other-documentation-only`；
   **并且** 每个 module root 必须有 `module.yaml`、`module-help.csv` 和至少一个有效 Skill package root；
   **并且** `module_kind: ecosystem`、`ecosystem_category: other`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false` 必须通过 validation。

3. **Existing SDLC workflows are not silently removed（既有 SDLC workflow 不被静默移除）**
   **前提** 当前 `sdlc` 中已有 `speclite-npm-publisher`、`speclite-write-opensource-docs`、`speclite-agent-docs-steward` 等与 npm / docs 相关能力；
   **当** 实现 other ecosystem examples；
   **则** 不得默认从 `sdlc` 迁移这些 workflow；
   **并且** 如果实现选择迁移某个 workflow，必须提供 explicit migration rationale、default SDLC baseline impact、module-help / docs / fixture updates 和 selected-only negative assertions；
   **并且** 在没有足够证据时，推荐创建 ecosystem-specific companion Skill 或 wrapper guidance，而不是破坏现有默认生命周期能力。

4. **Other Skill content proves project-shape specificity（other Skill 内容证明项目形态特异性）**
   **前提** 用户选择某个 other ecosystem module；
   **当** 对应 Skill 被运行；
   **则** `npm-package` 能围绕 `package.json`、package manager、publish metadata、tarball / `npx` / package surface、release gate 或 library / CLI smoke 取证；
   **并且** `cli-tool` 能围绕 `bin` entry、command surface、TTY / non-TTY output、exit code、JSON contract、shell portability 或 install smoke 取证；
   **并且** `documentation-only` 能围绕 `docs/`、README、Diataxis、package-facing docs、link integrity、public docs source 和 project facts 取证；
   **并且** 不得把泛化写作、通用发布或通用 CLI output 规则搬出 `sdlc`。

5. **Install selection and projection remain isolated（安装选择与投影保持隔离）**
   **前提** source tree 同时存在 frontend、backend、other modules；
   **当** 用户选择 `other` category；
   **则** installer 只能展示 `npm-package`、`cli-tool`、`documentation-only` 等 other ids；
   **并且** 选择 `ecosystem-other-npm-package` 不得安装 frontend / backend / other unselected modules；
   **并且** `--yes`、`--json` 和 default no-prompt install 仍不得选择任何 other ecosystem module；
   **并且** skip `other` 是合法路径。

6. **Other category docs prevent dumping-ground drift（文档防止 other 演变为杂项目录）**
   **前提** public docs 和 maintainer docs 更新；
   **当** 维护者阅读 ecosystem authoring guidance；
   **则** docs 必须明确 `other` 的准入问题清单、命名规则、example ids、anti-pattern 和 migration policy；
   **并且** docs 必须说明 `other/misc`、`other/general`、`other/tools` 这类无边界 id 默认不允许；
   **并且** docs 必须要求新 other id 在 `module-help.csv`、creator/lint rules、release gate 和 docs index 中可追踪。

7. **Release gates cover other ecosystem examples（发布门禁覆盖 other 示例）**
   **前提** other ecosystem source files 存在；
   **当** build、fixture、canonical source check 和 packaging check 运行；
   **则** nested other modules 必须被 discovered、packaged、documented，并通过 module-help drift 检查；
   **并且** focused tests 必须覆盖 selected one other module、unselected other module absence 和 cross-category absence；
   **并且** fixture / docs 不得把 default install total 写成包含 optional other modules 的 unconditional baseline。

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR3`、`FR18`、`FR19`、`FR20`、`FR63a`、`FR66`、`FR67`、`FR71`
- **Supporting NFRs:** `NFR23`、`NFR24`、`NFR27`、`NFR36`、`NFR37`、`NFR40`
- **UX / Contract Anchors:** SPEC 04 selected-only indexes、SPEC 05 IDE projection、SPEC 08 within/cross-category negative fixtures、other-category admission contract
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/10-4-other-ecosystem-source-expansion.md` 的 Story、Acceptance Criteria、Source Requirements 与 contract/reference anchors；未复制执行记录

### Story 10.5: Ecosystem Fixture And Release Gate Generalization（生态 Fixture 与发布门禁泛化）

作为 SpecLite 维护者，
我希望 fresh install、existing update、resolve parity、IDE drift、packaging manifest、canonical source check 和 release gates 能覆盖 selected ecosystem modules 与 unselected negative assertions，
以便 Epic 10 引入 frontend、backend、other ecosystem modules 后，发布门禁不再依赖 only `core+sdlc` 的静态包数量，也不会把 optional ecosystem source 误装或漏包。

#### Acceptance Criteria（验收标准）

1. **Default baseline remains explicit but not global truth（默认 baseline 明确但不是全局真相）**
   **前提** `core` required、`sdlc` default selected、ecosystem optional；
   **当** default no-ecosystem install 运行；
   **则** fixture 仍可断言 default baseline 的 `core` + `sdlc` package count；
   **并且** `CORE_SDLC_BASELINE_ENTRY_COUNT`、fixture text、docs counts 和 ready summary 不得被当作 selected ecosystem installs 的全局 expected count；
   **并且** selected ecosystem install 的 expected count 必须由 selected module package roots 推导或由 fixture case 独立声明。

2. **Fixture matrix covers selected ecosystems（Fixture 矩阵覆盖已选择生态）**
   **前提** source tree 有 backend、frontend、other ecosystem examples；
   **当** fixture release gates 运行；
   **则** 至少包含 default no-ecosystem fixture、selected backend ecosystem fixture、selected frontend ecosystem fixture 和 selected other ecosystem fixture；
   **并且** 每个 selected fixture 必须断言 selected ecosystem Skill 出现；
   **并且** 每个 selected fixture 必须断言同 category 未选择 ecosystem 和跨 category ecosystem 不出现；
   **并且** fixtures 不得泄漏本机绝对路径、cache/temp/build path、ANSI-only semantics 或 non-deterministic generatedAt。

3. **Installed-state validation uses selected module truth（安装状态验证使用 selected module 真相）**
   **前提** `_speclite/_config/manifest.yaml`、skill index、help index、files index 和 phase coverage 存在；
   **当** validate / status / update / repair 读取 installed state；
   **则** expected package roots、skill index entry count、help rows、phase rows 和 files index entries 必须基于 installed selected modules；
   **并且** unselected ecosystem source tree 不得参与 installed-state truth；
   **并且** repair 不得因为 bundled source 有未选 ecosystem packages 就补装它们。

4. **Canonical source change check understands nested ecosystems（Canonical source 检查理解嵌套生态）**
   **前提** `assets/source/speclite/ecosystems/<category>/<id>/` 存在；
   **当** `speclite-check-canonical-source-change` 运行；
   **则** 它必须统计 ecosystem modules 与 package roots；
   **并且** 检查每个 ecosystem module 的 `module-help.csv` 覆盖；
   **并且** 报告 default install total 与 optional ecosystem totals 时不得混淆；
   **并且** stale docs scan 必须捕获 only core+sdlc、固定 total、缺少 ecosystem docs 或 packaging drift。

5. **Packaging manifest includes ecosystem source files（打包清单包含生态源文件）**
   **前提** npm package release gate 运行；
   **当** `npm pack --dry-run --json` 生成 package inventory；
   **则** `release/packaging-manifest.json` 与 `dist/packaging-manifest.json` 必须包含 nested ecosystem module source files；
   **并且** packaging assertions 必须证明 bundled source includes `assets/source/speclite/ecosystems/**`；
   **并且** release fixtures 仍不得把 `test/fixtures/` 或 fixture outputs 打进 npm package。

6. **Release gates are serial and build-first（发布门禁保持串行且先 build）**
   **前提** Story 10.5 修改 tests、fixtures、source checks 或 packaging manifest；
   **当** release verification 执行；
   **则** 必须先运行 `npm run build`；
   **并且** 再运行 focused tests / fixture gates；
   **并且** 最后运行 `npm run release:packaging-check`；
   **并且** 不得并行运行会读写 `dist/` 或 packaging manifests 的命令。

7. **Docs describe fixture ownership and ecosystem matrix（文档说明 fixture ownership 与生态矩阵）**
   **前提** public docs 和 maintainer docs 更新；
   **当** 维护者查阅 release confidence / fixture contract；
   **则** docs 必须说明 default baseline、selected ecosystem fixture cases、negative assertions、packaging boundary 和 canonical source check 的职责；
   **并且** docs 必须说明 optional ecosystem modules 不改变 default install guarantee；
   **并且** docs 不得继续把 `core=13, sdlc=51, total=64` 写成长期全局真相。

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR18`、`FR19`、`FR20`、`FR63a`、`FR66`、`FR67`、`FR69`、`FR71`、`FR71a`、`FR71b`
- **Supporting NFRs:** `NFR6`、`NFR9`、`NFR19`、`NFR23`、`NFR24`、`NFR25`、`NFR27`、`NFR28a`、`NFR40`、`NFR40a`、`NFR40d`
- **UX / Contract Anchors:** SPEC 04 selected-module installed truth、SPEC 05 IDE projection、SPEC 08 ecosystem fixture matrix and serial release gate
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/10-5-ecosystem-fixture-and-release-gate-generalization.md` 的 Story、Acceptance Criteria、Source Requirements 与 contract/reference anchors；未复制执行记录

### Story 10.6: Public Docs And Maintainer Workflow（公开文档与维护者工作流）

作为首次安装 SpecLite 的使用者、维护 canonical source 的贡献者和发布负责人，
我希望 public docs、runtime layout、quick start、maintainer guidance 和 release workflow 能清楚说明 ecosystem source authoring、install selection、selected-only runtime projection、fixture / release gate 和后续扩展流程，
以便用户知道何时选择 React / Vue / backend / other ecosystem modules，维护者知道如何新增 ecosystem source，并且发布负责人能验证 optional ecosystem 不污染默认安装。

#### Acceptance Criteria（验收标准）

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

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR3`、`FR18`、`FR63a`、`FR71`
- **Supporting NFRs:** `NFR35b-13`、`NFR40`、`NFR40d`
- **UX / Contract Anchors:** `UX-DR11`、canonical source layout、runtime layout、maintainer release workflow、docs navigation
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/10-6-public-docs-and-maintainer-workflow.md` 的 Story、Acceptance Criteria、Source Requirements 与 contract/reference anchors；未复制执行记录

## Dependency / Sequencing（依赖与顺序）

Epic 10 已作为历史计划完成，不进入当前 implementation authorization，也不得按编号重新执行。既有 Story identity、tracker status 与 implementation evidence 保持不变。

对未来维护或 change-controlled extension，dependency 只按 Story 10.1 的独立历史验收域解析：

- Story 10.2 只依赖 **Taxonomy And Discovery Contract** 的 metadata schema 与 source layout evidence，不依赖 Story 10.1 其他三个域重新实施。
- Story 10.3 / 10.4 依赖 Story 10.2 的 authoring contract；它们不应反向阻塞既有 taxonomy、selection 或 backend migration evidence。
- Story 10.5 的 release gate 必须消费 **Selected-Only Projection And Proof**，并按需覆盖 **Guided Interactive Selection**；它不要求重放 backend source migration。
- Story 10.6 可以在 taxonomy/discovery contract 稳定后维护，最终文档证据与 Story 10.5 的 release evidence 对齐。

若上述任一域出现新的未实现范围，必须新建独立 Story；不得把已完成 Story 10.1 改回 `ready-for-dev`，也不得让新 Story 依赖未来编号才能成立。

## Completion Gate（完成门禁）

Epic 10 完成时必须满足：

- `assets/source/speclite/ecosystems/<category>/<id>/` 被定义为 canonical source taxonomy，并且 official module discovery 能稳定发现嵌套 ecosystem modules。
- `core` required、`sdlc` default selected、ecosystem optional but recommended 的安装规则被实现并有测试覆盖。
- 交互式 install 能按“前端 / 后端 / 其他”到具体生态两级引导；`--yes` / JSON 默认安装仍只选择 `core` + `sdlc`。
- 选择某个 ecosystem module 时，`sdlc` 自动作为 dependency 进入安装；未选择的 ecosystem modules 不进入 `.claude/skills`、`.agents/skills`、skill-index、help-index、phase-coverage 或 files-index。
- 至少一组现有 backend 技术栈 Skill 从 `sdlc-skills/` 迁移到 `ecosystems/backend/<id>/` 并通过 installed activation、help index 和 fixture regression。
- `assets/source/speclite/README.md`、`docs/reference/runtime-layout.md`、canonical source check、packaging manifest 和 fixture release gate 不再把 official source hardcode 为 only core+sdlc。
- `npm run build`、focused module/install tests、fixture release gate、`npm run release:packaging-check` 和 canonical source check 全部通过。
