# Ecosystem Skills（生态 Skill）

本文记录 `assets/source/speclite/ecosystems/<category>/<id>/` 下的 optional ecosystem extension skills。它是快速查阅用 Reference，不替代各 Skill 包内的 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md` 和 `references/`。

## Snapshot（当前快照）

| Item | Value |
|---|---|
| Canonical source root | `assets/source/speclite/ecosystems/` |
| 当前 ecosystem modules | 8 个 modules / 8 个 package roots |
| Frontend modules | `ecosystem-frontend-react`、`ecosystem-frontend-vue` |
| Backend modules | `ecosystem-backend-java-springboot`、`ecosystem-backend-nodejs`、`ecosystem-backend-python` |
| Other modules | `ecosystem-other-npm-package`、`ecosystem-other-cli-tool`、`ecosystem-other-documentation-only` |
| Default install boundary | `--yes` / JSON 默认路径仍只选择 `core` + `sdlc` |
| Help catalog | 每个 ecosystem module root 自带 `module-help.csv` |

Interactive install 使用 `ecosystem category -> id` 两级选择；`frontend`、`backend`、`other` 都可以 skip。`--yes`、`--json` 和 default no-prompt install 不会自动选择 ecosystem modules。

Ecosystem modules 是 SpecLite optional Skill package selection，不是项目依赖安装器、不是 package manager、不是 UI framework installer。选择 React / Vue / Java / npm package ecosystem module 只安装对应 SpecLite Skill package；不会安装 React / Vue / Java / npm package runtime dependencies。

## Frontend（前端）

| Module | Skill | Menu | Output | Purpose |
|---|---|---|---|---|
| `ecosystem-frontend-react` | `speclite-react-project-context-and-review` | `RFR` | `{project_knowledge}/frontend` 或 `{planning_artifacts}` | 基于目标项目 evidence 审查 React component architecture、state、routing、testing、accessibility、build 和 migration risks。 |
| `ecosystem-frontend-vue` | `speclite-vue-project-context-and-review` | `VFR` | `{project_knowledge}/frontend` 或 `{planning_artifacts}` | 基于目标项目 evidence 审查 Vue SFC、Composition API、state、routing、testing、accessibility、build 和 migration risks。 |

React / Vue Skill 不硬编码 framework version。版本和 API 结论必须来自目标项目文件、lockfile、package manager output、官方 docs 或用户资料；证据不足时写入 unknowns。

## Backend（后端）

| Module | Skill | Menu | Output | Purpose |
|---|---|---|---|---|
| `ecosystem-backend-java-springboot` | `speclite-brownfield-java-springboot-backend-tech-stack-digger` | `BJS` | `{project_knowledge}/brownfield` 或 `{planning_artifacts}` | Java / Spring Boot 后端技术栈分析。 |
| `ecosystem-backend-nodejs` | `speclite-brownfield-nodejs-backend-tech-stack-digger` | `BNS` | `{project_knowledge}/brownfield` 或 `{planning_artifacts}` | Node.js 后端技术栈分析。 |
| `ecosystem-backend-python` | `speclite-brownfield-python-backend-tech-stack-digger` | `BPS` | `{project_knowledge}/brownfield` 或 `{planning_artifacts}` | Python 后端技术栈分析。 |

## Other（其他）

| Module | Skill | Menu | Output | Purpose |
|---|---|---|---|---|
| `ecosystem-other-npm-package` | `speclite-npm-package-project-auditor` | `NPA` | `{project_knowledge}/ecosystems/other` 或 `{devops_artifacts}` | 基于 `package.json`、package manager、publish metadata、package surface、tarball / `npx` smoke 和 release gate evidence 审计 npm package 项目。 |
| `ecosystem-other-cli-tool` | `speclite-cli-tool-contract-auditor` | `CTA` | `{project_knowledge}/ecosystems/other` 或 `{planning_artifacts}` | 基于 `bin` entry、command surface、TTY / non-TTY、exit code、JSON contract、shell portability 和 install smoke evidence 审计 CLI tool 项目。 |
| `ecosystem-other-documentation-only` | `speclite-documentation-only-project-auditor` | `DOA` | `{project_knowledge}/ecosystems/other` 或 `{planning_artifacts}` | 基于 `docs/`、README、Diataxis、package-facing docs、link integrity 和 public docs source 审计 documentation-only project。 |

Other category 只接受不能归入 frontend / backend 且具有稳定项目形态的 id。新增 other id 必须记录 `why-not-frontend`、`why-not-backend`、目标项目事实、安装价值和 selected-only 验收。`other/misc`、`other/general`、`other/tools` 默认不允许。

`speclite-npm-package-project-auditor` 不执行 publish；真实发布仍交给 `speclite-npm-publisher`。`speclite-documentation-only-project-auditor` 不迁移公开文档写作或 docs steward 能力；这些仍由 `speclite-write-opensource-docs` 和 `speclite-agent-docs-steward` 负责。

## Boundaries（边界）

Ecosystem modules 是 selected-only extension。选择 React 不会安装 Vue、backend 或 other ecosystem packages；选择 Vue 也不会安装 React、backend 或 other ecosystem packages；选择 npm-package 不会安装 cli-tool、documentation-only、frontend 或 backend packages。skip frontend / backend / other 都是合法路径。

generic UX、PRD、Architecture、Story creation 和 Code Review workflow 仍留在 `sdlc`。SpecLite 本身仍是 CLI + filesystem control plane，不因 frontend ecosystem module 而新增 Web UI、dashboard、browser runtime 或 GUI product scope。

## Related Contracts（相关契约）

| Contract | Source |
|---|---|
| Ecosystem module metadata | `assets/source/speclite/ecosystems/<category>/<id>/module.yaml` |
| Help rows and output locations | `assets/source/speclite/ecosystems/<category>/<id>/module-help.csv` |
| Module discovery | `src/modules/module-metadata.ts` |
| Module selection | `src/modules/module-selection.ts` |
| Selected-only projection | `src/ide/target-writer.ts` |
