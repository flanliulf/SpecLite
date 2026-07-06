# React Project Context And Review Workflow（React 项目上下文与审查流程）

## Evidence（证据）

优先读取目标项目中的 `package.json`、workspace 配置、`package-lock.json`、`pnpm-lock.yaml`、`yarn.lock`、`bun.lockb`、framework config、TypeScript config、test config、CI 文件和源码入口。需要解释 React 或第三方 API 时，必须引用目标项目锁定版本对应的官方 docs 或用户提供资料。

## Review Dimensions（审查维度）

- Project boundary：app、package、workspace 和 source roots。
- Component architecture：page、route、feature、shared component、hook、context 和 design-system usage。
- State and data flow：local state、Context、Redux、Zustand、TanStack Query、Relay、Apollo 或其它实际出现的工具。
- Routing and rendering：React Router、Next.js、Remix、SSR/SSG/CSR boundary、server/client boundary。
- Build and test：Vite、Webpack、Turbopack、Jest、Vitest、Testing Library、Playwright、Cypress。
- Accessibility：ARIA、keyboard interaction、focus management、semantic HTML 和 test evidence。
- Migration risks：major version upgrade、router migration、state consolidation、framework migration 和 deprecated APIs。

## Output（输出）

输出 Markdown 应包含 `Evidence Summary（证据摘要）`、`Architecture Notes（架构记录）`、`Review Findings（审查发现）`、`Unknowns（未知项）` 和 `Recommended Follow-ups（后续建议）`。不得把未验证版本或未查证 API 写成事实。
