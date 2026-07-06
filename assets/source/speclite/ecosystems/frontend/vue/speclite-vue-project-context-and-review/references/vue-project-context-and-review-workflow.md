# Vue Project Context And Review Workflow（Vue 项目上下文与审查流程）

## Evidence（证据）

优先读取目标项目中的 `package.json`、workspace 配置、`package-lock.json`、`pnpm-lock.yaml`、`yarn.lock`、`bun.lockb`、Vue / Nuxt / Vite 配置、TypeScript config、test config、CI 文件和源码入口。需要解释 Vue 或第三方 API 时，必须引用目标项目锁定版本对应的官方 docs 或用户提供资料。

## Review Dimensions（审查维度）

- Project boundary：app、package、workspace 和 source roots。
- SFC structure：`.vue` 文件组织、`<script setup>`、props/emits、slots、composables 和 shared components。
- Composition API：`ref`、`reactive`、computed、watch、composable、provide/inject 和 lifecycle usage。
- Routing and state：Vue Router、Pinia、Vuex legacy、query/cache library 和 route-level data loading。
- Build and test：Vite、Nuxt、Webpack、Jest、Vitest、Vue Test Utils、Playwright、Cypress。
- Accessibility：ARIA、keyboard interaction、focus management、semantic HTML 和 test evidence。
- Migration risks：major version upgrade、Options API 到 Composition API、Vuex 到 Pinia、Nuxt migration 和 deprecated APIs。

## Output（输出）

输出 Markdown 应包含 `Evidence Summary（证据摘要）`、`Architecture Notes（架构记录）`、`Review Findings（审查发现）`、`Unknowns（未知项）` 和 `Recommended Follow-ups（后续建议）`。不得把未验证版本或未查证 API 写成事实。
