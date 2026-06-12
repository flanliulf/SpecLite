---
name: speclite-npm-publisher
description: "Publish open-source Node.js packages to npm with evidence-based release gates. Use when user mentions 'npm publish', 'release to npm', 'Node package release', 'bugfix 后发布', 'feature 后发布', 'npm 发布', 'Node 项目发布', '发 npm 包', package.json, npm pack, npx verification, registry auth, OTP, scoped package, GitHub push, or public package release. Capable of package metadata auditing, SemVer bump planning, version occupancy checks, commit/push gating, hook guardrails, official registry authentication, tarball install smoke tests, safe semi-automated publish, and post-publish propagation troubleshooting."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    面向开源 Node.js 项目的 npm 发布执行 Skill。它把 bugfix / feature 完成后的版本升级、发布前事实审计、中文 Conventional Commit、GitHub push、真实 tarball smoke、本机半自动 npm publish、Claude/Codex hook 防护、发布后延迟验证和故障恢复串成可复用流程，避免版本复用、脏工作树发包、镜像 registry 凭据混淆、`.bin` 入口失效和 read-side propagation delay 误判。

[Core Capabilities（核心能力）]
    - **发布意图确认**：区分"如何发布"、"检查是否可发布"和"实际执行发布"，只有用户明确授权并确认 `package@version` 后才运行 `npm publish`。
    - **SpecLite 迭代发布 SOP**：为 bugfix / feature 后的常规交付串联 SemVer 选择、`npm version --no-git-tag-version`、release gate、提交、推送、publish 和延迟复核。
    - **Package 契约审计**：从 `package.json` 和真实文件抽取 `name`、`version`、`license`、`bin`、`exports`、`files`、`publishConfig`、`repository`、`homepage`、`bugs` 和 scripts。
    - **官方 registry 凭据检查**：固定使用 `https://registry.npmjs.org/` 验证 `npm whoami`，识别默认 registry 为镜像时的凭据分离风险。
    - **版本占用判断**：发布前检查目标版本是否已存在，已发布版本绝不复用，按 SemVer 选择新版本后重跑门禁。
    - **Git 提交推送门禁**：吸收中文 Conventional Commit、精确 `git add -- <files>`、敏感文件扫描、`origin/main` 推送和 clean HEAD 发布规则。
    - **Release gate 编排**：优先运行项目已有 `release:check`，否则基于现有 scripts 组合 build、test、lint、typecheck 和项目特定检查。
    - **Tarball smoke 验证**：使用 `npm pack` 生成真实 tarball，在干净临时目录安装，并按包类型执行 CLI 或 library smoke。
    - **Hook guardrails**：为 Claude/Codex hooks 定义可阻断的危险命令和状态检查，将 hooks 作为防护层而非发布编排层。
    - **发布后复核**：验证 `npm view`、`dist-tags`、干净 `npx` 或 clean install，处理 npm registry / search / CDN 传播延迟。
    - **故障经验沉淀**：覆盖 `E401`、`ENEEDAUTH`、`EOTP`、`E404 PUT scoped package`、`E403`、tarball 漏文件、`.bin` symlink 和本地 `npx` 误解析。

[Workflow（执行流程）]
    本 Skill 采用顺序工作流 + 领域规则门禁。执行细则、命令矩阵、错误处理和报告模板见 `references/speclite-npm-publisher-workflow.md`；入口只保留阶段路由。

    Step 1：确认边界与授权
        判断用户要咨询、审计、准备还是实际发布。实际发布前必须展示目标 `package@version`、registry、publish command 和验证计划，并等待用户确认。

    Step 2：建立发布契约
        读取 reference 的 Contract Audit 部分，从 `package.json`、构建产物和 git 状态抽取事实；如果不是开源 Node.js npm package，或 `private: true` 未获明确覆盖，停止。

    Step 3：规划版本并执行发布前门禁
        对 bugfix / feature 按 SemVer 选择目标版本，在提交前执行 `npm version <version> --no-git-tag-version`，同步 version-bound 文件，并按 reference 的 Prepublish Gates 验证 official registry 登录、版本未占用、metadata、scripts、构建、测试和真实 tarball smoke。

    Step 4：提交推送并建立 clean 发布上下文
        按 Commit and Push Gate 使用中文 Conventional Commit、精确暂存和 `origin/main` 推送。正式发布必须来自 clean `HEAD` 或 clean worktree，不从脏工作树发包。

    Step 5：本机半自动发布与异常处理
        仅在用户确认后运行 publish。scoped public package 使用 `--access public`；unscoped package 不强行添加 scoped-only 语义。OTP、password、token 只在终端交互输入，agent 只解析 publish 输出。

    Step 6：发布后验证与报告
        按 reference 的 Postpublish Verification 复核 npm metadata、dist-tag、clean `npx` 或 clean install。若 read-side 暂时 404，但 publish 迹象已成立，等待重试，不重复发布同一版本。

[Notes（注意事项）]
    - 只修改用户明确要求的项目文件；发布前发现 metadata、README、LICENSE、bin 或 release script 缺口时，先列出建议并等待授权。
    - 所有包名、版本、bin 名、入口文件和 scripts 必须来自 `package.json` 与真实文件，不凭经验猜测。
    - 不记录 password、token、OTP、recovery code；不把敏感凭据写入脚本、文档、日志、聊天记录或 shell history。
    - 不在源码仓库根目录用 `npx <package>@<version>` 判断远端包；使用干净临时目录，避免本地 package 影响解析。
    - 不从 dirty worktree 运行 `npm publish`；如果发布内容会进入 tarball，必须在 publish 前提交并推送。
    - 不复用已发布版本号，不为绕过发布错误回退版本，也不为了通过门禁改变核心功能需求。
    - Claude/Codex hooks 只负责 deterministic 防护和阻断，不替代 SemVer 决策、发布报告、人工 OTP 或 postpublish 判断。
    - 本 Skill 负责发布执行；README 和发布文档专项审查可配合 `npm-release-docs-checker`。
    - 生成的发布报告写入 `.specskills/output/devops/speclite-npm-publisher/`，不得散落到项目根目录。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher/` 与实际安装副本，或通过 skills-upgrade 管理版本。
