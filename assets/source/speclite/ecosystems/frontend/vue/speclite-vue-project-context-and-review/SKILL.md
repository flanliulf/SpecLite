---
name: speclite-vue-project-context-and-review
description: "Analyze a Vue project from repository evidence and write a framework-specific context and review note. Use when user mentions 'Vue project context', 'Vue architecture review', 'Vue SFC review', 'Composition API review', 'Vue routing', 'Vue state management', 'Vue migration review', 'Vue 测试策略', or asks for evidence-based Vue frontend analysis. Requires project files, lockfile, official docs, or user-provided materials for version and API claims."
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Vue Project Context And Review

[Overview（技能说明）]
    Speclite Vue Project Context And Review 是 `ecosystem-frontend-vue` module 的前端生态分析工作流。它面向已经选择 Vue ecosystem module 的目标项目，用代码事实、lockfile、配置文件、测试文件、官方文档或用户资料建立 Vue 项目上下文，并输出 SFC、Composition API、state、routing、testing、accessibility、build 和 migration review 结论。

[Core Capabilities（核心能力）]
    - **项目事实发现**：读取 `package.json`、workspace 配置、lockfile、Vue / Vite / Nuxt / TypeScript / test 配置和源码入口，确认 Vue project 边界。
    - **版本证据提取**：Vue、Vue Router、Pinia、Nuxt、test runner 和 build tool 版本必须来自 lockfile、package manager output、官方 docs 或用户提供资料。
    - **SFC 结构审查**：识别 `.vue` Single File Component 分层、script setup、props/emits、slots、composables 和 shared component 组织。
    - **Composition API 审查**：整理 `ref`、`reactive`、computed、watch、composable、provide/inject 和 lifecycle usage 的实际证据。
    - **路由与状态审查**：分析 Vue Router、Pinia、Vuex legacy、query/cache library 和 route-level data loading 的实际 wiring。
    - **测试与可访问性审查**：检查 unit/component/e2e 测试、Vue Test Utils、Vitest/Jest/Playwright/Cypress、ARIA 和 keyboard/focus 证据。
    - **迁移风险记录**：对 Vue major upgrade、Options API 到 Composition API、Vuex 到 Pinia、Nuxt migration 或 bundler migration 给出 evidence-linked risk list。

[Workflow（执行流程）]
    详细步骤见 `references/vue-project-context-and-review-workflow.md`。

    1. 确认 `{project-root}` 与输出位置；若用户未给输出目录，先询问。
    2. 收集 Vue evidence：manifest、lockfile、package manager output、framework config、source entry、test config、CI 和用户资料。
    3. 只记录可验证事实。框架版本、API 语义和迁移建议不得来自记忆或猜测；缺证据时写入 `Unknowns（未知项）`。
    4. 分析 SFC/composable/route/state/testing/build/accessibility/migration 维度，并给出文件路径级证据。
    5. 输出 Markdown review note 到用户指定位置，默认建议 `{project_knowledge}/frontend/vue-project-context-and-review.md`。

[Notes（注意事项）]
    - 本 Skill 只处理 Vue-specific 前端项目事实；通用 UX、PRD、Architecture、Story creation 和 Code Review 仍属于 `sdlc` workflow。
    - 不要硬编码 Vue、Vue Router、Pinia、Nuxt、Vite 或测试框架的最新版本；必须从目标项目文件、lockfile、官方 docs 或用户资料取证。
    - SpecLite 仍是 CLI + filesystem control plane；本 Skill 不创建 Web UI、dashboard、browser runtime 或 GUI product scope。
    - 如果项目同时包含 React、Angular、Svelte 或 backend services，只分析与 Vue evidence 直接相关的范围，并把其它生态写为 out-of-scope。
