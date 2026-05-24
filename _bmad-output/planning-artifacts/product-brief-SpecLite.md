---
title: "Product Brief: SpecLite（产品简报：SpecLite）"
status: "complete"
created: "2026-05-20"
updated: "2026-05-20"
inputs:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/research/technical-speclite-bmad-tooling-system-design-research-2026-05-11.md"
---

# Product Brief: SpecLite（产品简报：SpecLite）

## Executive Summary（执行摘要）

SpecLite 是面向 AI IDE 时代的本地研发方法论安装与治理层。它把 SPEC-Driven、TDD、阶段化研发流程、方案评审、故事规划、实现、测试和对抗性审查等 For AI 方法论，从一组分散的 Markdown、提示词、agent/skill 文件和人工约定，转化为可安装、可验证、可更新、可跨 IDE 分发的本地工程系统。

SpecLite 要解决的核心问题不是“团队缺少更多 skill 文件”，而是方法论能力在 Claude Code、GitHub Copilot、Cursor 等多 AI IDE 环境中快速碎片化：同一套流程入口在不同 IDE 中不一致，配置和产物路径依赖口头约定，更新时容易覆盖用户定制，企业规范负责人也难以证明研发规范是否真正进入执行现场。

MVP 的产品假设很直接：如果 SpecLite 能通过一条命令完成安装，在 `.claude/skills` 与 `.agents/skills` 中生成一致的执行入口，并用 `_speclite`、manifest/index、`status`、`validate`、`update` 和 `_speclite-output` 形成可诊断闭环，团队就能把注意力从“怎么复制和配置 AI IDE 能力”转回研发流程本身。

## The Problem（问题）

AI IDE 正在成为研发过程的实际执行入口，但团队方法论仍常常停留在文档库、提示词集合、手工复制的 skills 和个人配置中。技术负责人需要反复同步不同 IDE 的目录和 agent；开发者需要记住当前阶段该调用哪个 skill；工具链维护者只能人工比对目录来排查漂移；方法论维护者发布新 skill 后无法稳定证明它已经进入所有目标 IDE；企业规范负责人也缺少一条可审查链路来确认 SPEC、测试、评审和审查流程是否落地。

这种状态带来四类成本：跨 IDE 能力漂移、过程产物路径混乱、更新覆盖用户定制的风险，以及规范落地不可验证。随着 skill/agent/prompt 生态继续扩张，单靠 README、培训和复制脚本只会让系统更脆弱。

## The Solution（解决方案）

SpecLite 提供一个以 Node 为主的 CLI 安装器/控制面，用本地文件契约把方法论内容安装到目标项目和 AI IDE 中。它不是简单文件复制器，而是围绕 canonical source、IDE execution mirrors、项目 runtime metadata、manifest/index、验证器、更新保护和过程产物仓库建立的控制面。

MVP 的核心用户命令是 `speclite install`、`speclite status`、`speclite validate` 和 `speclite update`，并提供 `speclite resolve config` 与 `speclite resolve customization` 作为运行时支撑命令。安装完成后，目标项目获得 `_speclite` metadata/control hub、`_speclite-output` artifact repository、manifest/index 文件，以及 `.claude/skills`、`.agents/skills` 等 IDE skill mirrors。用户在 IDE 中调用 SpecLite skills，产物按配置沉淀到 planning、implementation、review 或 project knowledge 路径。

## Who This Serves（服务对象）

SpecLite 首先服务于需要在团队中落地 AI-assisted SDLC 方法论的技术负责人和工具链维护者。他们需要一套可重复安装、可验证、可更新、可审查的本地工具链，而不是依赖个人 IDE 配置和手工同步。

第二类核心用户是 AI IDE 使用者。他们希望在当前研发阶段看到稳定入口，选择对应 skill，并让 SPEC、方案、故事、实现记录、测试设计和审查文档按约定输出。

第三类用户是方法论维护者和企业规范负责人。他们关心的不是单个 skill 是否存在，而是统一研发规范是否以菜单、manifest、validate 报告和标准过程产物的形式进入团队执行体系。

## What Makes This Different（差异化）

SpecLite 的差异化在于把“方法论内容”与“安装治理控制面”合在一起。传统文档库、提示词集合或手工复制方式可以传播内容，却无法稳定保证跨 IDE 一致性、安装健康度、更新安全和规范落地证据。

SpecLite 用 canonical skill identity 和 manifest/index 管理同一套 skills，用 data-driven IDE adapter 映射不同执行目标，用 deterministic validation 检查 mirror、schema、runtime path、menu target、legacy namespace residue 和 artifact path，用文件所有权模型保护 human-owned custom 文件与 workflow-owned artifacts。它把本地文件系统变成可审查的系统 API，而不是把关键行为藏在个人 IDE 状态里。

## Scope And MVP（范围与 MVP）

MVP 是一个最小可信控制面，必须证明 source skills 可以稳定进入多 AI IDE，并完成安装、发现、激活、输出、验证和更新闭环。

MVP 包含：TypeScript/Node.js CLI；`install`、`status`、`validate`、`update`；Node 版 config/customization resolver；正式可分发 SpecLite source discovery；`.claude/skills` 与 `.agents/skills` 两类硬交付 target；`_speclite`、`_speclite-output`、manifest/index 生成；data-driven IDE adapter registry；deterministic validation；hash-backed update protection；npm public/private registry、local tarball、offline bundle 和 pinned Git source；macOS 与 Windows 的路径基础能力；以及 fixture install tests。

MVP 不包含专用 GitHub Copilot command pointer、Cursor 专有 adapter、`init/list/doctor/sync/uninstall`、完整历史迁移、治理 dashboard、大规模 fixture matrix、企业 CI 深度集成或自动迁移旧手工复制结构。这些能力进入 Post-MVP。

## Success Criteria（成功标准）

用户成功的第一信号是：在一个空项目中运行一条安装命令后，目标项目生成 `_speclite`、`_speclite-output`、IDE skill mirrors 和 manifest/index 文件，且 `.claude/skills` 与 `.agents/skills` 中的 canonical skills 保持一致。

工具链成功的第一信号是：`status` 能快速展示安装来源、版本、IDE 覆盖和健康摘要；`validate` 能稳定报告 manifest/schema、IDE mirror、runtime path、menu target、legacy namespace residue、artifact path 和 file integrity 问题；`update` 能在写入前展示计划，保护 human-owned custom 文件与 workflow artifacts。

方法论落地成功的第一信号是：核心研发阶段在 IDE 中有可发现的 skills 菜单，至少一个阶段化 skill 能从 IDE entry 激活并输出 planning 或 review artifact。企业规范负责人可以通过菜单、manifest、validate 报告和产物目录判断规范链路是否完整。

## Technical Approach（技术路径）

SpecLite 采用 local-first、filesystem-backed 架构，不依赖数据库、云服务或后台守护进程。TypeScript/Node.js 负责 CLI、source discovery、manifest/index generation、IDE adapter、validation、update protection 和 resolver；TOML 继续承载项目配置与 customization 覆盖；YAML/CSV/Markdown/JSON 分别承载 module metadata、索引、skill/workflow 内容、命令输出和验证模型。

系统边界保持清晰：canonical source 是权威来源，IDE skills 目录是可再生成 execution plane，`_speclite` 是 metadata/control hub，`_speclite-output` 是过程产物仓库。安装器可以管理 installer-owned 文件，但不得静默覆盖 human-owned custom 文件或 workflow-owned artifacts。

## Key Risks（关键风险）

最大风险是 SpecLite 被实现成“复杂一点的复制脚本”，缺少真正控制面。MVP 必须把 runtime metadata、manifest/index、validator、update protection 和 fixture 验证作为核心验收，而不是附加项。

第二个风险是范围过宽。安装来源、跨平台路径、IDE adapter、resolver、manifest 和 update safety 都很重要，但实现顺序必须围绕最小闭环推进：source discovery -> install -> IDE mirrors -> `_speclite` -> manifest/index -> validate -> update -> fixture proof。

第三个风险是企业环境不可用或不可解释。MVP 需要把 private registry、local tarball、offline bundle、pinned Git source、代理/权限失败和路径兼容问题作为显式可诊断约束，而不是假设公网 npm 和个人开发机永远可用。

## Vision（愿景）

如果 MVP 成立，SpecLite 将从一套可阅读的方法论 source，演进为 AI IDE 时代的本地研发规范操作系统。它能持续维护方法论内容、IDE execution plane、项目 runtime、manifest/index、验证规则和研发过程产物之间的一致性，让团队把 SPEC、测试、规划、实现和审查流程作为可治理的 For AI 工程系统持续演进。