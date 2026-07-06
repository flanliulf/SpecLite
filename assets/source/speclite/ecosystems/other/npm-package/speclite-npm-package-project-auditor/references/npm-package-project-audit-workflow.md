# Npm Package Project Audit Workflow（npm package 项目审计流程）

## Evidence（证据）

优先读取目标项目中的 `package.json`、lockfile、workspace 配置、README、LICENSE、source entrypoints、build output、CI 配置和 release scripts。需要判断 npm registry、publish access、package manager 或 package surface 时，必须来自项目文件、命令输出或用户提供资料。

## Review Dimensions（审查维度）

- Package boundary：package root、workspace membership、package manager 和 publish target。
- Package metadata：`name`、`version`、`license`、`type`、`exports`、`main`、`module`、`types`、`bin`、`files`、`publishConfig`。
- Package surface：library API、CLI bin、type declarations、public docs 和 README/package-facing examples。
- Smoke plan：`npm pack`、tarball file inspection、clean install、`npx` smoke、library import smoke、CLI smoke。
- Release gate readiness：build/test/lint/typecheck/release scripts、CI status、version occupancy check handoff。
- Unknowns：缺失 package facts、未确认 registry、未确认 auth、未确认 package manager。

## Output（输出）

输出 Markdown 应包含 `Evidence Summary（证据摘要）`、`Package Surface（包面）`、`Smoke Plan（冒烟计划）`、`Release Gate Readiness（发布门禁就绪度）`、`Unknowns（未知项）` 和 `Handoff（交接）`。真实发布动作交给 `speclite-npm-publisher`。
