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

建立 `ecosystems/<category>/<id>/` source taxonomy、nested module discovery、ecosystem metadata validation、两级 installer selection、selected-only installed projection、首批 backend 技术栈迁移、fixtures、docs 和 canonical source check 闭环。该 Story 是本 Epic 的系统闭环 Story。

### Story 10.2: Ecosystem Authoring Contract And Creator Support（生态源定义创作契约与 Creator 支持）

把 ecosystem module 的 source authoring contract 固化到 support skills、creator / lint guidance、module-help 规则、naming rules 和 changelog / version discipline，降低后续新增 React、Vue、Java、Spring Boot 等生态 Skill 的成本。

### Story 10.3: Frontend Ecosystem Source Expansion（前端生态源定义扩展）

在体系稳定后引入首批 frontend ecosystem modules，例如 React 与 Vue，把 frontend-specific 方法论、代码审查、测试、架构或迁移 Skill 放入 `ecosystems/frontend/<id>/`，并验证两级安装选择不影响 backend / other modules。

### Story 10.4: Other Ecosystem Source Expansion（其他生态源定义扩展）

为 npm package、CLI tool、documentation-only project 或其他非前端 / 后端类别建立 `ecosystems/other/<id>/` 的示例和验收规则，避免 `other` 成为无约束杂项目录。

### Story 10.5: Ecosystem Fixture And Release Gate Generalization（生态 Fixture 与发布门禁泛化）

把 fresh install、existing update、resolve parity、IDE drift、packaging manifest 和 canonical source check 从 core+sdlc baseline 泛化到 selected ecosystem matrix，并增加 unselected ecosystem negative assertions。

### Story 10.6: Public Docs And Maintainer Workflow（公开文档与维护者工作流）

更新 public docs、runtime layout、maintainer guide 和 newcomer docs，明确 ecosystem source authoring、install selection、selected-only runtime projection、release gate 和后续生态扩展流程。

## Dependency / Sequencing（依赖与顺序）

Story 10.1 是 P0，必须先完成，因为它定义 source taxonomy、module discovery、install selection 和 selected-only projection 的共同 contract。Story 10.2 依赖 Story 10.1 的 metadata schema 与 source layout。Story 10.3 / 10.4 依赖 Story 10.2 的 authoring contract。Story 10.5 可以与 Story 10.2 部分并行，但最终 release gate 必须覆盖 Story 10.1 的 selected-only behavior。Story 10.6 在 Story 10.1 后即可启动，最终需随 Story 10.5 收口。

## Completion Gate（完成门禁）

Epic 10 完成时必须满足：

- `assets/source/speclite/ecosystems/<category>/<id>/` 被定义为 canonical source taxonomy，并且 official module discovery 能稳定发现嵌套 ecosystem modules。
- `core` required、`sdlc` default selected、ecosystem optional but recommended 的安装规则被实现并有测试覆盖。
- 交互式 install 能按“前端 / 后端 / 其他”到具体生态两级引导；`--yes` / JSON 默认安装仍只选择 `core` + `sdlc`。
- 选择某个 ecosystem module 时，`sdlc` 自动作为 dependency 进入安装；未选择的 ecosystem modules 不进入 `.claude/skills`、`.agents/skills`、skill-index、help-index、phase-coverage 或 files-index。
- 至少一组现有 backend 技术栈 Skill 从 `sdlc-skills/` 迁移到 `ecosystems/backend/<id>/` 并通过 installed activation、help index 和 fixture regression。
- `assets/source/speclite/README.md`、`docs/reference/runtime-layout.md`、canonical source check、packaging manifest 和 fixture release gate 不再把 official source hardcode 为 only core+sdlc。
- `npm run build`、focused module/install tests、fixture release gate、`npm run release:packaging-check` 和 canonical source check 全部通过。
