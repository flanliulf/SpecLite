---
name: speclite-npm-package-project-auditor
description: "Audit npm package project facts before release planning. Use when a selected other ecosystem module targets an npm package, package.json, package surface, tarball smoke, npx smoke, library entrypoint, CLI bin, publish metadata, or release gate readiness. This is an evidence audit companion and does not run npm publish."
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

# Speclite Npm Package Project Auditor

[Overview（技能说明）]
    Speclite Npm Package Project Auditor 是 `ecosystem-other-npm-package` module 的项目形态审计工作流。它面向已选择 npm package other ecosystem module 的目标项目，围绕 `package.json`、package manager、publish metadata、package surface、tarball / `npx` smoke 和 release gate readiness 建立证据。

[Core Capabilities（核心能力）]
    - **Package fact discovery（包事实发现）**：读取 `package.json`、lockfile、workspace 配置、README、LICENSE、exports、types、bin、files 和 publish metadata。
    - **Package surface audit（包面审计）**：区分 library entrypoint、CLI bin、dual package、type declarations、public files 和 package-facing docs。
    - **Smoke evidence planning（冒烟证据规划）**：规划 `npm pack` tarball inspection、clean install、`npx` smoke、library import smoke 或 CLI smoke，但不默认发布。
    - **Release gate mapping（发布门禁映射）**：把项目已有 build/test/lint/typecheck/release scripts 映射为 release readiness evidence。
    - **Boundary protection（边界保护）**：保留 `speclite-npm-publisher` 在 `sdlc`，需要真实发布时转交该 DevOps workflow。

[Workflow（执行流程）]
    详细步骤见 `references/npm-package-project-audit-workflow.md`。

    1. 确认 `{project-root}`、目标 package root 和输出位置；如果 monorepo 中 package 未明确，先让用户指定。
    2. 读取 package facts：`package.json`、lockfile、workspace config、README、LICENSE、source entrypoints、dist files、CI 和 release scripts。
    3. 只记录可验证事实；package manager、registry、exports、bin、files 和 version 结论必须来自真实文件或命令输出。
    4. 生成 audit note，覆盖 package surface、tarball / `npx` / library smoke plan、release gate readiness、unknowns 和 handoff。
    5. 如果用户明确要发布，停止本 Skill 并建议运行 `speclite-npm-publisher`，不要在本 workflow 中执行 `npm publish`。

[Notes（注意事项）]
    - 本 Skill 不迁移、不复制 `speclite-npm-publisher`；它只提供 npm package project shape audit。
    - 不猜测 registry、版本、package manager 或 publish access；必须从项目文件、命令输出或用户提供资料取证。
    - 若 package 是 private、unpublished、workspace-only 或 docs-only，记录边界并避免把 release action 写成已授权事实。
