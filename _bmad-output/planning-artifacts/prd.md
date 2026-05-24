---
stepsCompleted: [1, 2, '2b', '2c', 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - path: '_bmad-output/planning-artifacts/research/technical-speclite-bmad-tooling-system-design-research-2026-05-11.md'
    type: 'research'
    title: 'SpecLite 工具化系统设计研究'
workflowType: 'prd'
releaseMode: 'phased'
documentCounts:
  briefCount: 0
  researchCount: 1
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: 'developer_tool'
  subtype: 'cli_tool + IDE integration tooling + local installer/control plane'
  domain: 'AI-assisted SDLC / developer tooling'
  complexity: 'high technical/system complexity; general/low regulatory complexity'
  projectContext: 'brownfield'
user_name: 'Fancyliu'
project_name: 'SpecLite'
date: '2026-05-11'
---

<!-- markdownlint-disable MD025 -->

# Product Requirements Document - SpecLite

**Author:** Fancyliu
**Date:** 2026-05-11

## Executive Summary

SpecLite 是面向 AI IDE 时代的本地研发方法论安装与治理层，目标是把一套基于 SPEC-Driven、TDD 测试理论、敏捷阶段化流程控制、企业级统一研发规范和研发过程文档体系的 For AI 方法论，稳定安装到多个 AI IDE 中。它解决的核心问题不是缺少更多 skill 文件，而是方法论能力散落在 Markdown、提示词、目录结构和人工约定中，难以在 Claude Code、GitHub Copilot、Cursor 等多 IDE 环境中保持一致、可发现、可配置和可持续演进。MVP 的硬交付 IDE target 是 `.claude/skills` 与 `.agents/skills`；GitHub Copilot/Cursor 可通过 `.agents/skills` 兼容路径进入 MVP，专用 command pointer 或专有 adapter 属于 Post-MVP。

成功后的 SpecLite 让团队不再围绕“每个 IDE 怎么配置、每个 agent 怎么复制、过程文档放哪里”反复协调，而是把注意力放回 SPEC、方案评审、史诗/故事/任务规划、实现、测试、对抗性审查等研发流程本身。当前多 AI IDE 并存已经成为现实，skill/agent/prompt 体系正在爆炸式增长和碎片化；SpecLite 已具备方法论内容基础，下一阶段需要补齐安装控制面，使这些内容成为可安装、可更新、可验证、可跨 IDE 分发的本地系统。

### What Makes This Special

SpecLite 的差异化在于它不是文件复制器，而是 AI IDE 方法论系统的安装控制面。用户通过一条命令即可把同一套 SpecLite skills 安装进多个 AI IDE，并让各 IDE 看到一致的执行入口，避免“这个 IDE 有、那个 IDE 缺”的能力漂移。

安装器同时生成项目级 `_speclite` runtime、配置文件、manifest、skill/help/files 索引和 `_speclite-output` 输出目录，使安装结果不只是可用，而且可发现、可审查、可验证、可通过 Git 跟踪并可持续演进。这个控制面把 SpecLite 从一组方法论源码定义转化为一个可治理的本地研发过程系统。

## Project Classification

SpecLite 属于 developer tool，交付形态是 CLI tool、AI IDE integration tooling 和 local installer/control plane 的组合。它运行在 AI-assisted SDLC / developer tooling 领域，具备较高的技术和系统复杂度，但不属于医疗、金融、政务等强监管业务域。项目上下文是 brownfield：它不是从零创建方法论内容，而是在既有 SpecLite source/skill 体系之上构建新的安装、同步、manifest、IDE adapter、runtime 配置和验证控制面。

## Success Criteria

### User Success

MVP 成功意味着用户可以在一个目标项目中通过一条命令完成 SpecLite 安装，并在 `.claude/skills` 与 `.agents/skills` 两类 IDE execution target 中看到一致的 SpecLite skills。用户不需要手工复制 skill、手动配置 IDE 目录或自行维护过程文档路径；安装完成后，支持 `.agents/skills` 的 GitHub Copilot/Cursor 可复用该通用 target，但 MVP 不承诺专用 Copilot/Cursor command pointer。

用户能够围绕 SPEC-Driven、TDD、阶段化流程、方案评审、故事规划、实现、测试、对抗性审查等研发过程直接调用对应 skills。这些 skills 能稳定激活，并按配置输出 research、planning、implementation、review 等过程产物，让团队把注意力放回研发流程本身，而不是安装和同步细节。

### Business Success

SpecLite 工具化系统的业务成功标准是：它把既有方法论内容从“可阅读的 skill 源定义”推进为“可安装、可验证、可跨 IDE 分发的本地研发方法论系统”。第一阶段成功不以用户规模或收入为主要指标，而以能否证明安装控制面的产品价值为核心：目标用户能够在真实项目中完成安装、验证和使用闭环，并确认这比手工复制、人工约定和逐 IDE 配置更可靠。

3 个月内的成功标准是完成可重复的本地安装闭环，覆盖 fresh install、status、validate 和 update 的核心路径，并能在至少一个真实或 fixture 项目中稳定复现。12 个月内的成功标准是形成可维护的安装、更新、验证、文档和示例体系，使 SpecLite 的方法论内容可以作为稳定工具链被团队采用和演进。

### Technical Success

MVP 必须正确生成 `_speclite`、`_speclite-output` 和 manifest/index 相关文件，并保持清晰的所有权边界：`_speclite` 作为 metadata/control hub，IDE skill directories 作为 execution plane，`_speclite-output` 作为 artifact repository。安装器必须处理正式可分发的 SpecLite skills、runtime scripts、manifest/index、IDE mirrors 和输出目录，不包含已删除或非分发辅助来源。

安装结果必须可验证：IDE mirrors 内容一致，manifest schema 校验通过，`files-manifest` 或等价完整性机制可用于后续更新保护，installed skills 不残留旧 runtime namespace、旧配置格式或错误 runtime path。各阶段对应的 skills 菜单能正确提示，skills 能正确激活，并能按照配置输出预期产物。

### Measurable Outcomes

- 在空项目中运行一条安装命令后，生成 `_speclite`、`_speclite-output`、IDE skills 目录和 manifest/index 文件。
- 同一 canonical skill 在多个目标 AI IDE 中保持一致，mirror 校验通过。
- fresh install、status、validate、update 四类核心用户命令均可执行并返回可诊断结果，`resolve` runtime support command 可供 installed skills 稳定解析 config/customization。
- validator 能检测并报告 manifest/schema、IDE mirror、runtime path、legacy namespace residue、skill menu target 和产物路径问题。
- 阶段化研发流程中的核心 skills 可以被 IDE 正确发现、激活，并输出对应 planning、implementation 或 review 产物。
- human-owned custom 文件和 workflow artifacts 不被 installer/update 覆盖。
- 安装范围严格限制在正式可分发 SpecLite source tree，不包含已删除或非目标辅助来源。

## Product Scope

### MVP - Minimum Viable Product

MVP 包含 Node-first installer/control plane 的最小闭环：fresh install、status、validate、update；source skill discovery；安装到 `.claude/skills` 和 `.agents/skills` 等目标 IDE skill directories；生成 `_speclite` runtime/config/custom/scripts、manifest/index 和 `_speclite-output` 初始目录；并提供基础 validator 验证安装健康度。

MVP 还必须覆盖核心阶段化研发流程的 skills 菜单提示、skill 激活和产物输出路径，使 SPEC-Driven、TDD、方案评审、故事规划、实现、测试、对抗性审查等流程具备稳定 IDE 入口。

### Growth Features (Post-MVP)

Post-MVP 重点增强更新安全、平台适配和团队采用能力，包括 backup/restore/report、批量迁移、更丰富的更新影响报告、更多 AI IDE platform registry、GitHub Copilot agent command pointer、扩展 fixture install test matrix、breaking schema upgrade workflow、schema migration tooling、完整 source lockfile 管理，以及更完整的 troubleshooting 和 migration guide。基础 hash-backed update protection 属于 MVP，覆盖 files index/hash、ownership 判断、conflict detection 和 `update --repair` repair plan；基础 schema version 字段与兼容性规则也属于 MVP；MVP 也必须保留最小 source integrity evidence 与 hash/lock 校验能力，用于支持 source descriptor trust status。

### Vision (Future)

长期愿景是让 SpecLite 成为 AI IDE 时代的本地研发方法论安装与治理层。它不仅能安装 skills，还能持续维护方法论内容、IDE execution plane、项目 runtime、manifest/index、验证规则和研发过程产物之间的一致性，使团队可以把 SPEC、测试、规划、实现和审查流程作为可治理的 For AI 工程系统持续演进。

## User Journeys

### Journey 1: 技术负责人完成多 IDE 安装

李澈是团队技术负责人，团队成员同时使用 Claude Code、GitHub Copilot 和 Cursor。过去他需要手工复制 skills、同步不同 IDE 的目录结构，并反复解释哪些 agent 可用、产物该放在哪里。每次有人换 IDE，团队方法论执行入口就可能漂移。MVP 中 GitHub Copilot/Cursor 的可用路径以 `.agents/skills` 兼容加载为准，专用 command pointer 留到 Post-MVP。

他在项目根目录执行一条 SpecLite 安装命令，选择目标 IDE 和需要安装的模块。安装器发现正式可分发的 SpecLite source skills，生成 `.claude/skills`、`.agents/skills` 等 IDE skill mirrors，同时创建 `_speclite` runtime、manifest/index、配置文件和 `_speclite-output` 目录。

安装完成后，他运行 `status` 或 `validate`，确认多个 IDE 中的 canonical skills 一致，manifest/schema 通过校验，阶段化菜单可以被正确发现。团队第一次获得一个可重复、可审查、可验证的 SpecLite 安装结果，不再依赖手工复制和口头约定。

### Journey 2: AI IDE 使用者按阶段调用研发 skills

林予是一名开发者，正在一个新功能中使用 AI IDE 协作完成研发流程。她不想记住所有 skill 名称，也不想翻目录找提示词；她需要知道“当前阶段可以做什么”。

她在 Claude Code 或支持 `.agents/skills` 的 Copilot/Cursor 环境中触发 SpecLite 菜单指令。IDE 显示当前阶段包含的 skills 菜单，例如 SPEC、方案评审、史诗/故事/任务规划、实现、测试、对抗性审查等能力。林予选择某个 skill，AI IDE 按该 skill 的规约激活流程，读取 `_speclite` 配置和相关上下文。

执行完成后，skill 按配置把产物写入 `_speclite-output` 或指定文档目录，例如 SPEC、方案、故事、实现记录、测试设计或审查文档。林予感受到的价值不是“多了一个提示词”，而是研发过程中的每个关键阶段都有稳定入口、明确菜单和可沉淀产物。

### Journey 3: 工具链维护者排查安装漂移

周航负责团队工具链维护。某次团队成员反馈一个 `.agents/skills` 兼容 IDE 中能看到某些 SpecLite skills，但另一个兼容 IDE 中缺失，另一个成员还发现某个 skill 输出路径不对。过去这类问题只能靠人工比对目录，排查成本很高。

周航运行 SpecLite `validate`。验证器读取 manifest、skill index、help index、files manifest 和 IDE mirrors，识别出某个 IDE mirror 内容不一致，同时报告一个旧 runtime path 残留和一个菜单 target 缺失。报告明确指出问题文件、影响范围和建议恢复路径。

他执行 update 或修复命令后重新 validate，确认 IDE mirror 一致、manifest schema 通过、菜单 target 存在、human-owned custom 文件未被覆盖。漂移问题从“大家各自猜”变成可诊断、可复现、可修复的本地治理问题。

### Journey 4: SpecLite 维护者发布新的可安装 skill

许宁是 SpecLite 方法论维护者。她新增了一个对抗性审查相关 skill，并更新了 module metadata、菜单配置和产物路径。她的目标不是只让源码目录里多一个 Markdown 文件，而是确保这个能力可以被安装到多个 AI IDE，并在菜单中正确出现。

她在本地运行 source validation，检查 `assets/source/speclite/` 下的 skill layout、root 文件白名单、assets/scripts 归位、customize 配置、菜单 target 和 runtime path。随后她把 source 安装到 fixture 项目，生成 IDE mirrors、`_speclite` metadata、manifest/index 和输出目录。

安装测试通过后，她确认新增 skill 在 Claude Code 和 `.agents/skills` 目标中内容一致，菜单能正确提示，对应 workflow 能激活并输出 review 产物。这个旅程证明 SpecLite 的方法论演进不是手工扩散，而是通过安装控制面稳定进入目标项目和 AI IDE。

### Journey 5: 企业规范负责人验证研发规范落地

沈薇是企业规范负责人，负责推动团队采用统一的 SPEC-Driven、TDD、阶段化流程、方案评审、故事规划、实现、测试和对抗性审查规范。过去这些规范分散在文档、培训材料、提示词和人工约定里，即使团队声称“已经采用”，实际执行时也很容易因 IDE 差异、agent 漂移或产物路径不统一而变形。

她希望看到的不只是 SpecLite 被安装成功，而是统一研发规范是否被稳定转化为团队可执行的 AI IDE 工作入口。安装完成后，她检查多个 IDE 中是否呈现一致的阶段化 skills 菜单，确认每个关键研发阶段都有对应 skills，且这些 skills 能输出标准化过程产物，例如 SPEC、方案评审记录、故事规划、测试设计、实现记录和对抗性审查文档。

当团队开始使用 SpecLite 后，沈薇通过 manifest/index、输出目录结构和 validate 报告确认规范执行链路是否完整：哪些阶段有入口，哪些产物已生成，哪些 skill 或菜单配置存在缺口。她的成功时刻是：研发规范不再只是静态文档，而成为多个 AI IDE 中一致可用、可检查、可持续改进的执行体系。

### Journey Requirements Summary

这些旅程揭示出 MVP 必须具备以下能力：

- 一条命令完成多 AI IDE 安装，并生成一致的 IDE skill mirrors。
- 安装器生成 `_speclite` runtime、配置、manifest/index、输出目录，而不只是复制 skill 文件。
- IDE 中存在阶段化菜单入口，能提示当前阶段可用 skills。
- 用户可以从菜单选择 skill，并稳定产出 SPEC、方案、故事、实现、测试、审查等过程文档。
- `status`、`validate`、`update` 能诊断和修复 IDE mirror 漂移、manifest/schema 问题、runtime path 残留、菜单 target 缺失。
- human-owned custom 文件和 workflow artifacts 在安装与更新过程中不被覆盖。
- source skill 变更可以通过 fixture install 和 deterministic validation 证明可安装、可激活、可输出产物。
- 企业规范负责人/流程治理者必须能验证统一研发规范是否落地：多个 IDE 中的阶段化 skills 菜单一致，关键研发阶段均有对应 skills，标准过程产物能按配置生成并被检查。

## Domain-Specific Requirements

### Compliance & Regulatory

SpecLite 不属于强监管业务域，但需要满足企业研发规范落地的内部合规要求。系统必须让 SPEC-Driven、TDD、阶段化流程、方案评审、故事规划、实现、测试和对抗性审查等研发规范在多个 AI IDE 中形成一致入口，并通过产物目录、manifest/index 和 validate 报告证明关键流程是否可执行、是否有输出、是否存在缺口。

SpecLite 的安装结果应具备 Git 可审查性和本地可追踪性。生成的 `_speclite`、IDE skill mirrors、manifest/index 和 `_speclite-output` 目录结构应清晰区分工具生成内容、人类定制内容和 workflow 产物，支持团队在代码审查、流程治理和工具升级时判断变更来源与影响范围。

### Technical Constraints

安装器必须优先保证跨 IDE 一致性。同一 canonical skill 安装到 `.claude/skills`、`.agents/skills` 等目标目录后，应保持内容一致。MVP 平台差异只能限制在 target directory 与可验证 metadata 映射层；专用 command pointer artifact 属于 Post-MVP，不应被 MVP adapter 生成。

系统必须明确文件所有权边界。Installer-owned 文件可以被安装器生成、更新和验证；human-owned custom 文件和 workflow artifacts 不应被自动覆盖。MVP 更新流程必须在修改前检测已安装文件是否被用户改动，并提供可诊断的 update/repair plan、影响摘要和冲突跳过结果；backup、restore、standalone report artifact 和更丰富的更新影响报告属于 Post-MVP。

系统必须支持本地、离线、可重复执行的安装与验证。MVP 阶段不依赖云服务、数据库或后台守护进程；核心状态应来自文件系统、TOML/YAML/CSV/Markdown/JSON 等可读文件契约。

系统必须考虑 npm 分发与企业内网离线安装两种分发路径。公开或标准环境下，SpecLite installer 应支持通过 npm 包分发和执行；企业内网或受限网络环境下，应支持从本地包、镜像源、压缩包或内部 registry 安装，避免把运行能力绑定到公网访问。

系统必须具备跨平台路径处理能力，覆盖 Windows 与 macOS 的路径分隔符、可执行脚本调用、文件权限、换行符、大小写敏感性和 shell 差异。安装器、manifest 生成、hash 计算、IDE target directory 解析和 validate 报告都必须使用平台无关的路径规范，避免同一项目在不同操作系统上产生不同安装结果。

### Integration Requirements

SpecLite 必须集成多个 AI IDE 的 skill/agent 加载机制，MVP 硬交付 `.claude/skills` 与 `.agents/skills` 这类目标目录。GitHub Copilot/Cursor 如果支持 `.agents/skills`，可通过该通用 target 使用 SpecLite skills；未来 GitHub Copilot agent command pointer、Cursor 专用入口和其它平台差异保留 data-driven adapter 扩展点。

SpecLite 必须把 source skill 定义、module metadata、runtime scripts、IDE mirrors、manifest/index 和 output artifacts 连接为完整安装链路。安装完成后，IDE 中的菜单指令应能展示当前阶段可用 skills，用户可以选择并激活对应 skill，产物按配置写入 `_speclite-output` 或指定文档目录。

企业环境中可能存在代理、私有 npm registry、无法访问 GitHub/npm 公网、受限文件系统权限和统一工具链版本要求。SpecLite 的安装流程应把这些作为一等约束：支持显式 source/channel 配置，输出清晰失败原因，并避免在安装过程中隐式下载未声明资源。

### Risk Mitigations

主要风险之一是 SpecLite 被误实现为简单文件复制器，导致安装后缺少 runtime、manifest、索引、验证和更新保护。缓解方式是把 installer/control plane 作为 MVP 核心，要求 fresh install、status、validate、update 都进入第一版范围。

第二个风险是多 IDE 内容漂移。缓解方式是使用 canonical skill identity、manifest/index 和 mirror validation，确保同一 skill 在不同 IDE 目标目录中保持一致。

第三个风险是更新覆盖用户定制或过程产物。缓解方式是区分 installer-owned、human-owned 和 workflow-owned 文件，并在 update 前执行 hash 或等价完整性检测。

第四个风险是方法论规范无法证明已落地。缓解方式是要求阶段化 skills 菜单、关键流程对应 skills、标准过程产物、manifest/index 和 validate 报告共同形成可检查链路，让企业规范负责人能够判断规范是否真实进入团队执行过程。

第五个风险是企业环境安装失败或行为不可解释。缓解方式是把 npm public registry、private registry、本地 tarball、offline bundle、代理、权限和跨平台路径作为显式安装约束，并要求所有 source/channel 可配置、可诊断、可审查。

SpecLite 的 developer tooling 领域约束需要通过后续 ADR 固化为系统契约。至少应形成以下架构决策：分发策略、跨平台路径规范、文件所有权模型、data-driven IDE adapter、企业离线安装策略和 deterministic validation pipeline。这些决策直接影响 MVP 是否能在真实团队和企业环境中落地，而不是只在本地开发机上完成演示。

## Innovation & Novel Patterns

### Detected Innovation Areas

SpecLite 的核心创新在于把 For AI 研发方法论从静态内容集合转化为可安装、可验证、可治理、可跨 IDE 分发的本地系统。它不是单一 CLI、单一 IDE 插件或单个 prompt library，而是把 SPEC-Driven、TDD、敏捷阶段化流程、方案评审、故事规划、实现、测试和对抗性审查等研发规范，映射为多个 AI IDE 中一致可调用的 skills 菜单、运行时配置、manifest/index 和过程产物结构。

这个创新挑战了一个隐含假设：AI IDE 方法论能力只需要以 Markdown、提示词或 agent 文件形式存在。SpecLite 的假设是，随着 AI IDE 成为研发执行入口，方法论内容必须具备安装控制面、运行时元数据、跨 IDE mirror、验证链路和更新保护，否则无法在真实团队中稳定落地。

### Market Context & Competitive Landscape

当前 AI IDE、skill、agent、prompt 生态正在碎片化。单个 IDE 可以加载自己的 skill 或 agent，但团队常常同时使用 Claude Code、GitHub Copilot、Cursor 等工具，导致方法论入口、配置方式、菜单暴露和产物路径分散。传统文档库、prompt 集合或手工复制方式可以传播内容，但无法保证跨 IDE 一致性、安装健康度、更新安全和研发规范落地证据。

SpecLite 的差异化位置是本地 developer tooling 与 AI SDLC 方法论治理的交叉点。它不是复制外部命名空间，而是为 SpecLite 的 SPEC-Driven、TDD 和阶段化研发流程建立自己的 `_speclite` metadata hub、IDE execution mirrors、manifest/index gateway 和 `_speclite-output` artifact repository。

### Validation Approach

创新假设需要通过可操作验证闭环证明。MVP 应验证以下问题：

- 一条命令是否能在真实或 fixture 项目中生成多个 AI IDE 的一致 skill mirrors。
- IDE 菜单是否能正确提示当前阶段可用 skills，并激活对应 workflow。
- `_speclite`、manifest/index 和 `_speclite-output` 是否能让安装结果可发现、可审查、可验证。
- 企业规范负责人是否能通过菜单、manifest、validate 报告和产物目录判断研发规范是否落地。
- fresh install、status、validate、update 是否能构成可信安装控制面，而不是一次性复制脚本。

验证方法应包括 fixture install tests、mirror hash validation、manifest/schema validation、菜单 target validation、runtime path validation、legacy namespace residue detection、产物输出路径验证，以及 Windows/macOS 跨平台安装验证。

### Risk Mitigation

最大创新风险是产品被实现成“复杂一点的文件复制器”，没有形成真正控制面。缓解方式是把 `_speclite` runtime、manifest/index、IDE mirror validation、status/validate/update、文件所有权模型和产物路径验证列为 MVP 必备能力。

第二个风险是创新范围过大，导致同时承担方法论内容、安装器、IDE adapter、更新系统、企业治理和跨平台支持。缓解方式是用 MVP 验证最小闭环：正式可分发 source skills -> 多 IDE mirrors -> `_speclite` metadata -> 阶段化菜单 -> skill 激活 -> 产物输出 -> validate/update。

第三个风险是企业环境不可用。缓解方式是在创新验证中纳入 npm 分发、private registry、本地 tarball、offline bundle、Windows/macOS 路径规范、代理和受限权限诊断，避免只在开发者个人机器上成立。

## Developer Tool Specific Requirements

### Project-Type Overview

SpecLite 作为 developer tool，核心交付物是一个 Node-first CLI installer/control plane，用于把 SpecLite 方法论体系安装、同步、验证和更新到目标项目及多个 AI IDE 中。它不是通用脚手架，也不是单一 IDE 插件，而是围绕 SpecLite skills、runtime metadata、manifest/index、IDE mirrors 和 workflow artifacts 建立本地可治理工具链。

MVP 必须把既有 SpecLite source skill 体系转化为可安装系统：用户通过 CLI 完成安装后，目标项目中应生成 `_speclite` metadata/control hub、`_speclite-output` artifact repository、manifest/index 文件，以及 `.claude/skills`、`.agents/skills` 等 IDE execution mirrors。CLI 还必须提供安装状态检查、确定性验证和安全更新入口，使 SpecLite 能作为团队研发规范工具链被持续使用。

### Technical Architecture Considerations

MVP 运行时与控制面必须以 Node.js 为主。现有 Python resolver 可作为历史参考或过渡实现，但 MVP 需要实现 Node 版 config/customization resolver，保证安装器、配置解析、定制化合并、manifest/index 生成、IDE adapter 和验证逻辑位于同一主工具链中。

TOML 继续作为外部配置与定制化契约。Node 工具链必须能够读取和生成 installer-owned TOML，同时对 human-owned TOML 默认采用只读或保守更新策略，避免破坏注释、排序和人工维护结构。YAML、CSV、Markdown、JSON 可继续承担 manifest、skill index、help index、source metadata 和报告输出等职责。

架构上应保持 canonical source、installer control plane、IDE execution plane 和 artifact repository 的清晰边界。source skill 是唯一权威来源；IDE skills 目录是可再生成 mirror；`_speclite` 存放配置、manifest、索引、runtime scripts 和安装状态；`_speclite-output` 存放 research、planning、implementation、review 等 workflow 产物。

### Language Matrix

MVP 支持以下语言和文件契约：

- Node.js: CLI installer/control plane、config/customization resolver、IDE adapter、manifest/index 生成、status/validate/update。
- TOML: 用户可见配置与定制化契约，包括 project config、user config、custom override。
- Markdown: skill 定义、workflow 说明、菜单提示、PRD/ADR/story/review 等过程文档。
- YAML/CSV/JSON: module metadata、manifest、skill/help/files index、验证报告和机器可读状态。
- Python: 仅作为既有 resolver 参考或兼容背景，不作为 MVP 主控制面依赖。

MVP 不要求支持运行时插件语言扩展，也不要求为第三方开发者提供多语言 SDK。语言支持重点是让 SpecLite 自身安装控制面可维护、可验证、可跨平台运行。

### Installation Methods

MVP 必须支持以下安装来源和分发方式：

- npm public registry: 面向标准开发环境的默认安装路径。
- private npm registry: 面向企业内网、镜像源和统一工具链治理环境。
- local tarball: 支持从本地包文件安装，便于离线验证和受限网络环境使用。
- offline bundle: 支持完整离线包安装，避免安装过程隐式访问公网。
- Git source: 支持从指定 Git source 安装或生成安装包，用于开发版、内部 fork 或特定版本验证；MVP 只允许解析到具体 commit SHA 的 pinned Git source 进入 install planning 和写入步骤。

安装过程必须显式记录 source/channel/version 信息，并在 `status` 与 `validate` 中可见。安装失败时应输出可诊断原因，例如 registry 不可达、权限不足、source 缺失、manifest 不合法、IDE target 不可写或路径不兼容。

### API Surface

MVP 对用户暴露的 CLI 命令面为：

- `speclite install`: 在目标项目中安装 SpecLite runtime、manifest/index、IDE mirrors 和输出目录。
- `speclite status`: 展示当前项目安装状态、source/channel/version、目标 IDE 覆盖情况和关键健康摘要。
- `speclite validate`: 执行确定性验证，检查 manifest/schema、IDE mirror、runtime path、菜单 target、legacy namespace residue、产物路径和文件完整性。
- `speclite update`: 基于 source/channel/version 更新 installer-owned 文件，并保护 human-owned custom 文件和 workflow artifacts。

MVP 还必须提供 runtime support command（运行时支撑命令），但不作为主用户旅程命令宣传：

- `speclite resolve config`: 通过 Node resolver 解析项目级配置，支持 key 抽取，并兼容 Python resolver baseline。
- `speclite resolve customization`: 通过 Node resolver 解析 skill customization，支持 key 抽取，并兼容 Python resolver baseline。

`speclite resolve` 的 stdout 必须只输出解析结果 JSON；诊断信息以 JSON Lines 输出到 stderr，每行一个 `ValidationIssue` 形状的 diagnostic；命令通过退出码表达成功或失败。
当 `speclite resolve` 解析成功但产生 warning diagnostics 时，命令必须返回 exit code 0；只有 error 或 critical diagnostics 才返回非 0。
`speclite resolve` 的产品输出应使用 2 空格缩进、末尾换行，并保留非 ASCII 字符不转义；parity fixtures 必须比较 JSON 语义，而不是 byte-for-byte 文本。
默认情况下，请求不存在的 `--key` 不视为失败：命令输出 `{}`、退出码为 0、stderr 不输出 issue。严格缺失校验只能通过未来显式 flag 增加，不能改变默认兼容行为。
`speclite resolve` 必须支持重复 `--key`；输出对象必须使用原 dotted key 字符串作为字段名，缺失 key 省略。
`speclite resolve config` 必须要求显式 `--project-root`。`speclite resolve customization` 应支持显式 `--project-root`；为兼容 Python resolver baseline，未传 `--project-root` 时保留向上查找 fallback：先从 skill directory 查找 `_speclite` 或 `.git`，找不到再从 cwd 查找。
`speclite resolve` 对 TOML layer 读取或解析失败必须区分 required 与 optional：required layer 失败时命令失败；optional layer 失败时输出 `ValidationIssue` 形状的 warning JSON diagnostic 到 stderr，并将该层视为 `{}` 继续解析。
`speclite resolve` 必须保留 Python resolver 的数组合并规则：只有当 base+override 的所有数组元素都是 table，且全部拥有同一个 `code` 或全部拥有同一个 `id` 时才 keyed merge；命中同 key 时 override item 整项替换 base item，不做 item-level deep merge；混用 `code`/`id`、部分元素缺 key 或出现非 table 元素时必须 append。
`speclite resolve` 的 MVP 合并模型不提供删除机制：override 不能删除 base item；禁用默认项只能通过同 key 整项替换为 no-op 或未来显式 deletion schema 处理。
`speclite resolve config` 必须严格保持四层合并顺序：installer-owned `_speclite/config.toml` → installer-owned `_speclite/config.user.toml` → human-owned `_speclite/custom/config.toml` → human-owned `_speclite/custom/config.user.toml`。custom 层必须覆盖 installer user 层。
`speclite resolve customization` 必须严格保持三层合并顺序：skill `customize.toml` defaults → `_speclite/custom/{skill}.toml` team custom → `_speclite/custom/{skill}.user.toml` user custom。Node parity 以 Python 实际代码行为为准，而不是 docstring 的优先级措辞。
`speclite resolve customization --skill` 必须使用 skill directory basename 作为 customization lookup key。IDE adapters 不应重命名 canonical skill directory；如未来确需改名，必须在 manifest 中显式记录 customization key，并让 resolver 使用该 key。

MVP 面向用户的核心命令必须支持统一 JSON output：`speclite install --json`、`speclite status --json`、`speclite validate --json`、`speclite update --json` 和 `speclite update --repair --json`。JSON 输出必须使用统一 `CommandResult` envelope，并让 `issues` 复用同一 `ValidationIssue` model；`speclite resolve` 是 runtime support command 例外，stdout 必须保持纯解析结果 JSON，供 installed skills 稳定读取配置。

PRD 只拥有产品需求和验收意图；Architecture 只保留实现映射。详细字段 schema、排序规则、路径策略、timestamp 策略、schema evolution、fixture comparison policy 和 executable schema anchor 由 `_bmad-output/planning-artifacts/specs/command-result-json-contract.md` 管理；`speclite resolve` 的例外输出契约由 `_bmad-output/planning-artifacts/specs/resolve-command-contract.md` 管理；fixture layout、expected output、ready summary gate 和 release gate 分类由 `_bmad-output/planning-artifacts/specs/fixture-contract.md` 管理。若 PRD 或 Architecture 的摘要性描述与 owning SPEC 冲突，以 SPEC 为准。

`SourceDescriptor` 的 trust status、integrity evidence、write eligibility、Git pinning、source lock boundary 和 validate no-network boundary 由 `_bmad-output/planning-artifacts/specs/source-descriptor-contract.md` 管理。Install/update/repair 的 pre-write planning、external access、`--yes`、dry-run、operation lock、safe write、partial failure 和 write authorization 语义由 `_bmad-output/planning-artifacts/specs/install-plan-contract.md` 管理。Manifest/index projection 由 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md` 管理；validation issue taxonomy 由 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md` 管理。

验收意图是：核心命令的 human-readable output、`--json` output、exit code 和 fixture assertions 共享同一 issue/status 语义；`status` 保持 lightweight local-only summary，并与 `validate` 的详细 diagnostics 分工清晰；`update` 和 `update --repair` 坚持 plan-before-write、ownership protection、conflict visibility 和 explicit write authorization；新增 public JSON 字段、reason code、redacted path 形状或 fixture comparison 规则时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。

Post-MVP 命令包括：

- `speclite init`: 初始化或重建项目级配置。
- `speclite list`: 列出可安装模块、skills、IDE targets 或版本。
- `speclite doctor`: 提供环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断与修复建议。
- `speclite sync`: 显式同步 source 与 IDE mirrors。
- `speclite uninstall`: 移除 installer-owned 安装结果，并保留或提示处理 human-owned/workflow-owned 内容。

CLI 应同时支持交互式使用和脚本化使用。MVP 输出必须同时提供人类可读文本和统一 JSON output；Post-MVP 可在该契约基础上扩展 CI、企业工具链和自动化验证集成。

### Code Examples

MVP 文档与测试资料必须包含 fixture project，用于展示安装前后结构和典型命令流程。示例应覆盖：

- 空项目 fresh install。
- 安装后 `_speclite`、`_speclite-output`、`.claude/skills`、`.agents/skills` 的目录变化。
- manifest/index 文件生成结果。
- `status` 输出示例。
- `validate` 成功与失败示例。
- `update` 在 installer-owned 与 human-owned 文件上的行为差异。
- 一个阶段化 skill 菜单被 IDE 发现并产出 planning 或 review artifact 的最小闭环。

示例不应只是 README 片段，而应作为 fixture install tests 的基础，使维护者可以用同一套 fixture 验证安装行为、IDE mirror 一致性、manifest/schema、runtime path 和产物路径。

### Migration Guide

MVP 暂时不提供完整迁移指南。当前阶段不把从手工复制 skills、旧参考结构或其他历史目录迁移作为首版交付目标。

MVP 仅需在文档中明确：SpecLite 安装目标是新的 `_speclite` 命名空间、SpecLite source skills、SpecLite manifest/index 和 SpecLite output artifact structure。MVP 不负责自动迁移旧系统，也不在未确认的情况下删除用户已有目录或历史入口。

MVP 文档必须提供最小迁移边界清单：

- 用户在安装前确认目标项目将使用 `_speclite` 作为新的 runtime namespace。
- 用户保留原有手工复制 skills、历史配置和过程产物的人工处置权。
- 安装器只管理 installer-owned 文件，不接管 human-owned custom 文件或 workflow artifacts。
- 安装完成后，用户通过 `status` 和 `validate` 查看新的 SpecLite 安装状态、IDE target 覆盖和配置路径。
- 需要从旧结构迁移到正式 SpecLite installer/control plane 的自动化流程进入 Post-MVP。

完整迁移指南进入 Post-MVP，后续可覆盖从手工复制、旧版 SpecLite 结构、历史参考结构或企业内部 fork 迁移到正式 SpecLite installer/control plane。

### Implementation Considerations

实现顺序应优先保证控制面闭环，而不是先扩展大量命令或 IDE 类型。MVP 应先完成 Node CLI skeleton、source discovery、TOML resolver、manifest/index 生成、IDE adapter、fresh install、status、validate、update 和 fixture install tests。

文件所有权模型必须在第一版实现：installer-owned 文件可由 installer 管理；human-owned custom TOML 和用户定制内容不得被无提示覆盖；workflow-owned artifacts 不参与 update 覆盖。`update` 必须基于 hash、manifest 或等价完整性机制识别本地改动，并输出 update plan、impact summary、changed/skipped/conflict paths；无法确认安全时保守跳过。持久报告产物、备份/恢复和历史对比留到 Post-MVP。

跨平台路径处理必须作为基础设施实现，覆盖 macOS 和 Windows 的路径分隔符、换行符、文件权限、大小写敏感性、shell 差异和可执行入口。所有 manifest、hash、IDE target 和 validate 报告应使用稳定、可比较的路径规范。

Git source、private registry、本地 tarball 和 offline bundle 支持会显著增加安装来源复杂度，因此 source/channel abstraction 必须尽早设计。不同来源最终应归一为同一 canonical source tree，再进入 manifest/index 生成和 IDE mirror 安装流程。

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Platform MVP / Control Plane MVP

SpecLite 的 MVP 策略不是用最少页面或最少命令证明概念，而是交付一个最小可信安装控制面。MVP 必须让用户在真实或 fixture 项目中完成从 source skills 到多 AI IDE execution mirrors、`_speclite` metadata、manifest/index、`_speclite-output` artifact repository、status/validate/update 的完整闭环。

这个 MVP 的核心学习目标是验证：SpecLite 是否能把 For AI 研发方法论从静态 skill 源定义转化为可安装、可验证、可更新、可跨 IDE 分发的本地研发过程系统。如果这个闭环成立，后续再扩展更多 IDE、更多命令、更强迁移能力和企业治理能力才有坚实基础。

**Resource Requirements:** MVP 至少需要覆盖 Node.js CLI/installer、文件系统与跨平台路径、TOML/YAML/CSV/Markdown 解析、AI IDE adapter、manifest/index 生成、验证器、fixture 测试和文档示例能力。团队角色上至少需要工具链/Node.js 工程能力、方法论 skill 体系维护能力和测试/验证设计能力。

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

MVP 必须支持以下核心旅程：

- 技术负责人完成多 AI IDE 安装。
- AI IDE 使用者按阶段调用研发 skills。
- 工具链维护者排查安装漂移。
- SpecLite 维护者发布并验证新的可安装 skill。
- 企业规范负责人验证研发规范是否通过菜单、manifest、validate 报告和产物目录落地。

**Must-Have Capabilities:**

- Node-first CLI installer/control plane。
- Node 版 config/customization resolver。
- `speclite install`、`speclite status`、`speclite validate`、`speclite update`。
- 正式可分发 SpecLite source skill discovery。
- 安装到 `.claude/skills` 和 `.agents/skills`。
- 生成 `_speclite` metadata/control hub。
- 生成 `_speclite-output` artifact repository。
- 生成 manifest/index 文件，包括 skill/help/files 等索引能力。
- 阶段化 skills 菜单可被 IDE 发现，并能激活核心研发 workflow。
- 核心流程产物可输出到配置约定路径。
- deterministic validation，覆盖 manifest/schema、IDE mirror、runtime path、菜单 target、legacy namespace residue、artifact path 和文件完整性。
- 文件所有权模型，区分 installer-owned、human-owned、workflow-owned。
- 更新流程保护 human-owned custom 文件和 workflow artifacts。
- npm public registry、private registry、local tarball、offline bundle、Git source 安装来源。
- 跨平台路径基础能力，至少覆盖 macOS 与 Windows 的路径规范、换行符、权限和 shell 差异。
- fixture project 示例，展示安装前后目录变化、manifest/index、status、validate、update 和一个最小 skill 产物闭环。

**MVP Boundary Clarification:**

MVP 的 fixture 要求包括可用于验证安装行为的 fixture project 和最小闭环示例。更大规模的自动化 fixture matrix、跨版本回归套件和完整 CI 验证矩阵可以在 Post-MVP 增强，但不能取消 MVP 中的基础 fixture 示例和最小安装验证。

### Fixture Project Requirements

MVP 必须维护最小 fixture project 集合，作为 installer/control plane 的可重复验收资产：

- `fresh-install-empty-project`: 空项目运行 fresh install，验证 `_speclite`、`_speclite-output`、manifest/index、`.claude/skills` 和 `.agents/skills` 生成结果。
- `existing-install-update`: 已安装项目运行 update，验证 installer-owned 文件更新、human-owned custom 文件保留、workflow artifacts 不被覆盖。
- `source-integrity`: 从 Git source、local tarball 或 offline bundle 安装，验证 source descriptor、integrity evidence、blocked/unverified 行为和安装摘要。
- `ide-drift`: 人为修改某个 IDE mirror，验证 `validate` 能报告 target、canonical skill id、hash mismatch 和建议下一步。
- `skill-artifact-loop`: 至少一个阶段化 skill 从 IDE entry 发现、激活到输出 planning 或 review artifact 的最小闭环。

每个 fixture 必须包含 expected file tree、expected manifest/index snapshot、expected command output 摘要和 validation assertions。fixture assertion 失败时，MVP 不应展示 ready summary。

### Backward Compatibility Strategy

MVP 生成的 metadata、manifest/index 和 validation issue model 必须为 Post-MVP 命令预留兼容路径：

- `_speclite/_config/manifest.yaml`、skill/help/files index 和 source descriptor 必须包含 schema version。
- Post-MVP 的 `speclite list`、`speclite doctor`、`speclite sync` 和 `speclite uninstall` 必须能读取 MVP manifest，不要求用户重装才能识别现有安装。
- 新增 validation rule 不得改变已有 issue id、category、severity 和 affected path 的语义。
- 新增 MVP 命令 JSON 字段必须通过 `CommandResult.schemaVersion` 扩展；不得破坏既有 `speclite.command-result.v1`、`CommandResult` 和 `ValidationIssue` 字段语义。
- 新增 IDE adapter 必须通过 adapter registry 扩展，不改变 canonical skill package 内容。
- 新增配置键必须允许旧 resolver 忽略未知字段，且不得破坏 human-owned override 文件。
- 如未来必须升级 schema，工具必须输出 migration-needed 状态、旧版本、新版本和人工确认步骤。

MVP 暂不包含完整迁移指南，也不自动迁移手工复制 skills、旧参考结构或其他历史目录。MVP 只记录新安装状态、保护当前安装所有权边界，并把自动迁移能力留到 Post-MVP。

### Post-MVP Features

**Phase 2 (Post-MVP):**

- `speclite init`、`speclite list`、`speclite doctor`、`speclite sync`、`speclite uninstall`。
- GitHub Copilot agent command pointer 和 Cursor 专用 adapter；MVP 只通过 `.agents/skills` 提供兼容路径。
- 更多 AI IDE platform registry 和 data-driven adapter。
- backup/restore、standalone report artifact、批量迁移报告和更丰富的更新影响报告；基础 hash-backed update protection 属于 MVP，覆盖 update/repair plan、impact summary、changed/skipped/conflict paths 和冲突跳过。
- breaking schema upgrade workflow、schema migration tooling 和完整 source lockfile 管理；基础 schema version 字段与兼容性规则属于 MVP，最小 source integrity evidence 与 hash/lock 校验也属于 MVP。
- CI/企业自动化集成增强，基于 MVP 已提供的统一 JSON output contract。
- 扩展 fixture install test matrix。
- troubleshooting 文档。
- 完整 migration guide。

**Phase 3 (Expansion):**

- 企业级安装策略模板、私有 registry 推荐配置和离线包治理。
- 更强的规范落地报告与流程覆盖分析。
- 多项目/多仓库安装状态汇总。
- 更高级的 source/channel/version 策略。
- 对第三方 SpecLite extension 或内部 fork 的治理能力。
- 更完整的跨 IDE 能力差异管理与兼容报告。

### Risk Mitigation Strategy

**Technical Risks:**

最大技术风险是 MVP 同时涉及 Node CLI、TOML resolver、manifest/index、IDE adapter、验证器、更新保护、跨平台路径和多安装来源，形成过宽实现面。缓解策略是以最小可信控制面为边界：先完成 source discovery -> install -> IDE mirrors -> `_speclite` -> manifest/index -> validate -> update -> fixture project 的闭环，再扩展更多命令和 IDE 类型。

第二个技术风险是 TOML 人类可编辑配置在 Node 工具链中被破坏。缓解策略是 installer-owned TOML 可生成，human-owned override TOML 默认只读或保守更新；需要修改时必须通过明确命令或报告提示。

第三个技术风险是多安装来源导致实现复杂度膨胀。缓解策略是尽早抽象 source/channel/version，把 npm、private registry、tarball、offline bundle 和 Git source 统一归一为 canonical source tree，再进入同一套 manifest/index 与 IDE mirror 流程。

**Market Risks:**

最大市场风险是用户把 SpecLite 理解为“又一个 prompt/skill 文件集合”，看不到控制面的必要性。MVP 必须通过一条命令安装、多 IDE 一致、validate 可诊断、update 保护用户定制、fixture 示例可复现来证明差异化价值。

第二个市场风险是目标用户觉得安装器太重。缓解方式是保持 CLI 主用户命令少而清晰，MVP 面向用户主流程只宣传 install/status/validate/update；`resolve` 作为 runtime support command 支撑 skills 读取配置，不要求用户理解为独立工作流。

**Resource Risks:**

资源风险在于实现者可能先做大量方法论内容整理或 IDE 扩展，而延迟核心控制面。缓解策略是把 MVP 验收集中在安装控制面闭环：没有 Node resolver、manifest/index、IDE mirror validation、文件所有权保护和 fixture 安装示例，就不视为 MVP 完成。

如果资源不足，仍应保留 install/status/validate/update、`resolve` runtime support command 和两个 IDE mirror 目标，削减范围应优先从更多 IDE、更多命令、完整迁移指南、扩展 CI matrix 和企业高级报告中进行，而不是削减控制面核心能力。

## Functional Requirements

### Installation & Project Onboarding

- FR1: 项目维护者可以指定 SpecLite 安装目录。
- FR2: 系统可以解析并展示最终安装路径。
- FR3: 系统可以检查安装目录是否存在、是否为空、是否已有 SpecLite 安装内容。
- FR4: 项目维护者可以确认是否安装到解析后的目录。
- FR5: 项目维护者可以选择要安装的官方 SpecLite 模块或能力包。
- FR6: 系统可以检查并展示可安装模块的版本信息。
- FR7: 系统可以展示用户已选择的模块、版本和安装摘要。
- FR8: 项目维护者可以选择是否从自定义来源安装 SpecLite。
- FR9: 项目维护者可以从 Git source 或 local path 安装或验证 SpecLite source。
- FR10: 项目维护者可以选择要集成的 AI IDE 目标。
- FR11: 系统可以展示每个目标 AI IDE 的配置结果。
- FR12: 系统可以为目标项目创建 SpecLite 项目级运行元数据结构。
- FR13: 系统可以为目标项目创建 SpecLite 过程产物输出结构。
- FR14: 系统可以发现正式可分发的 SpecLite source skills。
- FR15: 系统可以将同一 canonical skill 暴露到多个目标 AI IDE。
- FR16: 项目维护者可以查看安装完成后的项目结构和安装摘要。
- FR17: 项目维护者可以查看安装完成后的下一步使用指引。

### Methodology Discovery & Execution

- FR18: 安装器可以生成 IDE-specific discovery metadata，列出研发阶段、canonical skill id、skill 名称、目标 IDE entry path 和激活 target。Manifest、skill index、help index、files index 与最小阶段覆盖矩阵的字段、版本、hash 和 ownership 规则由 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md` 作为 canonical contract 管理；IDE adapter id、target id、target order、capability 与 status 语义由 `_bmad-output/planning-artifacts/specs/ide-adapter-registry-contract.md` 管理。
- FR19: MVP 中每个 IDE adapter 必须把 discovery metadata 映射为该 IDE target directory 中的 self-contained skill entry，并报告 mapped、unsupported 或 failed 状态。Adapter schema 可以声明 `commandPointerBehavior: "none" | "unsupported"` 作为 Post-MVP 扩展位，但 MVP 不生成 command pointer artifact。
- FR20: AI IDE 使用者可以通过已映射的 IDE entry 选择并激活 SpecLite skill。
- FR21: AI IDE 使用者可以调用 SPEC、方案评审、故事规划、实现、测试和审查相关能力；每项能力必须映射到至少一个 canonical skill id。
- FR22: 已激活的 skill 可以读取项目级配置、customization 覆盖和相关上下文。
- FR23: 已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和生成时间。MVP artifact contract 至少校验 artifact type、默认输出路径、`workflowType`、`sourceSkill` 和 `generatedAt` 元数据字段；产物内容质量不进入 MVP validation。
- FR23a: Artifact metadata 的 MVP 校验必须覆盖最小值域：`workflowType` 必须是非空稳定字符串，`sourceSkill` 必须是非空 canonical skill id，`generatedAt` 若存在必须是 ISO 8601 string，且默认排除出 stable fixture snapshot comparison。
- FR24: 企业规范负责人可以查看 MVP 最小阶段覆盖矩阵，确认 SPEC、方案评审、故事规划、实现、测试和审查阶段是否存在 mapped skill entry、对应 canonical skill id、以及目标 IDE target 是否可见。MVP 阶段覆盖矩阵来自 manifest、help index 和 installed skill entries，最小字段必须覆盖 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`ideTargets[].targetId`、`ideTargets[].entryPath`、`ideTargets[].activationTarget`、`ideTargets[].status` 和可选 `artifactContract`；不提供覆盖率百分比、趋势、团队汇总或治理 dashboard。

### Methodology Responsibility Matrix

| Capability | Installer Control Plane | IDE Adapter | Skill Content | Validation Method |
| --- | --- | --- | --- | --- |
| Stage discovery | Generate discovery metadata with phase, canonical skill id, entry path, and activation target | Map metadata to IDE-specific self-contained skill entry; command pointer remains Post-MVP | N/A | Validate each menu target resolves to one installed skill entry |
| Skill activation | Install self-contained skill package and record target mapping | Expose mapped entry and report mapped/unsupported/failed state | Follow `SKILL.md` activation protocol | Fixture activation test for at least one mapped skill |
| Workflow execution | Provide resolved config paths and output directory contract | N/A | Read config/customization and execute workflow steps | Skill execution fixture writes expected artifact |
| Artifact governance | Record configured output locations in manifest/index | N/A | Write artifact metadata and content | Validate artifact exists at configured path with expected metadata |
| Process governance | Generate minimum phase coverage metadata from manifest/help index/installed skill entries | Report mapped skill entry visibility per IDE target | Produce standard artifacts for executed workflows | Validate MVP phase coverage matrix locally; richer coverage reports remain Post-MVP |

### Status & Validation

- FR25: 工具链维护者可以查看当前项目的 SpecLite 安装状态。
- FR26: 工具链维护者可以查看安装来源、版本和目标 IDE 覆盖情况。
- FR27: 工具链维护者可以验证 manifest、skill index、help index 和 files index 的有效性。
- FR28: 工具链维护者可以验证多个 IDE mirrors 是否与 canonical source 一致。
- FR28a: 当 IDE mirror 中的 canonical skill package 文件偏离 manifest 记录的 canonical package hash 时，`validate` 必须报告 `ide-mirror` 或 `file-integrity` error，但不得自动修复。
- FR29: 工具链维护者可以检测缺失的菜单目标或不可激活的 skill。
- FR30: 工具链维护者可以检测错误 runtime path、legacy namespace residue 和产物路径问题。
- FR31: 工具链维护者可以检测旧版或遗留 AI IDE 入口。
- FR32: 系统可以在检测到遗留入口与当前 canonical skill id 或 IDE target 重叠时，提示重复加载、菜单冲突或能力漂移风险。
- FR33: 系统可以为遗留入口提供包含 path、risk category、manual action 和 verification command 的人工清理建议。
- FR34: 工具链维护者可以验证 shared scripts、module directories、configuration、help catalog 和 IDE mirrors 是否安装完成。
- FR35: 系统可以输出可诊断的验证结果，指出问题类型、影响范围和修复方向。
- FR35a: MVP 面向用户的核心命令必须支持 `--json`，并使用统一 `CommandResult` envelope；详细字段、排序、路径、timestamp、schema evolution、status 推导、exit code 和 fixture comparison 契约以 `_bmad-output/planning-artifacts/specs/command-result-json-contract.md` 为准。
- FR35b: `CommandResult` 中的 issues 必须复用同一 `ValidationIssue` model，并与 human-readable output、exit code 和 fixture assertions 保持一致；issue category、issue id 与默认 severity 语义以 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md` 为准。
- FR35c: PRD 不定义第二份 public JSON 字段真源。新增 public JSON 字段、reason code、redacted path 形状、排序规则或 command-specific payload 行为时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。

### Update & File Ownership Protection

- FR36: 项目维护者可以更新已安装的 SpecLite installer-owned 文件。
- FR37: 系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。
- FR38: 系统可以在更新前识别本地文件是否被用户修改。
- FR39: 系统可以避免覆盖 human-owned custom 文件。
- FR40: 系统可以避免覆盖 workflow-owned 过程产物。
- FR41: 项目维护者可以看到 update 对安装内容、用户定制和过程产物的影响摘要，包括 planned effects、实际 changed/skipped paths 和 conflicts；public output 契约以 `_bmad-output/planning-artifacts/specs/command-result-json-contract.md` 为准。
- FR41a: `update` 遇到 IDE mirror drift 或其他 installer-owned drift 时必须默认标记 conflict，不得静默覆盖；MVP 只有 `speclite update --repair` 或用户确认后才可恢复 canonical 内容，不新增顶级 `speclite repair` 命令，`speclite sync` 保持 Post-MVP。
- FR41b: `speclite update --repair` 必须只修复可安全恢复或重建的 installer-owned drift，并继续保护 human-owned custom 文件和 workflow-owned artifacts；repair eligibility、missing source evidence、restore-canonical/regenerate、conflict projection 和 reason code 语义以 owning SPEC 为准。
- FR41c: Install/update/repair 必须坚持 plan-before-write、显式写入授权、project operation lock、safe write、保守 stale lock 处理和 partial failure 可诊断性；具体 planning/write authorization 契约以 `_bmad-output/planning-artifacts/specs/install-plan-contract.md` 为准。MVP 不生成 standalone report artifact，不提供事务性 rollback、backup/restore、顶级 repair 或 sync。

### Configuration & Customization

- FR42: 项目维护者可以在安装过程中配置用户称呼或团队名称。
- FR43: 项目维护者可以在安装过程中配置项目名称。
- FR44: 项目维护者可以在安装过程中配置 AI agent 的交流语言。
- FR45: 项目维护者可以在安装过程中配置文档输出语言。
- FR46: 项目维护者可以在安装过程中配置过程产物输出目录。
- FR47: 项目维护者可以选择快速配置或详细配置模式。
- FR48: 项目维护者可以使用项目级配置定义用户称呼、项目名称、交流语言、文档输出语言、产物路径、安装模块和 IDE targets。
- FR49: 用户可以通过定制化配置覆盖 skill workflow、agent persona、菜单项和输出路径默认值。
- FR50: 系统可以按 installer base、installer user、team custom、user custom 的优先级解析并合并配置。
- FR51: 系统可以通过 ownership manifest、路径规则和只读策略保留 human-owned 配置的人工维护边界。
- FR51a: MVP 默认不修改 human-owned TOML，包括 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml`。所谓保守更新在 MVP 中只表示读取并保护；任何对 human-owned TOML 的写入都必须由未来显式命令或交互确认引入，并通过 ADR 记录。
- FR51b: Fresh install 可以在目标路径不存在时创建 human-owned TOML stub，但这是 create-if-absent 规则；如果 `_speclite/custom/*.toml` 或 `_speclite/custom/*.user.toml` 已存在，install/update/repair 不得覆盖、重写、重排或格式化。
- FR52: 系统可以让 skills 使用统一配置访问项目名称、用户偏好、输出路径和流程约定。
- FR52a: 系统必须提供 `speclite resolve config` 与 `speclite resolve customization` 作为 MVP runtime support command，使已安装 skills 能通过稳定入口读取 config/customization，而不依赖 Python resolver 或内部构建路径。
- FR52b: `speclite resolve` 必须保持 Python resolver parity，包括 stdout/stderr shape、exit code、missing key、repeated key、project-root fallback、required/optional layer failure、array merge、config/customization merge order 和 customization lookup key。详细契约以 `_bmad-output/planning-artifacts/specs/resolve-command-contract.md` 为准；PRD 与 Architecture 不重新定义第二份 resolve 字段真源。
- FR52c: `resolve-parity` fixture 必须覆盖 config/customization resolver 兼容性，并随 resolver 行为变更同步更新 owning SPEC、parser/schema 和 expected outputs。

### Distribution Sources & Channels

- FR53: 项目维护者可以从 npm public registry 安装 SpecLite。
- FR54: 项目维护者可以从 private registry 安装 SpecLite。
- FR55: 项目维护者可以从 local tarball 安装 SpecLite。
- FR56: 项目维护者可以从 offline bundle 安装 SpecLite。
- FR57: 项目维护者可以从 Git source 安装 SpecLite，并在 install/update 的 source resolution 阶段验证 Git source；写入前 Git source 必须解析到具体 commit SHA，只指定 remote URL、branch 或 tag 的浮动 Git source 不得进入 install planning。`speclite validate` 不负责访问 Git remote 或重新验证远程 freshness/provenance，只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline。
- FR58: 系统可以记录并展示安装来源、channel 和版本信息。
- FR59: 系统可以在安装来源不可用或不合法时给出明确失败原因。

### Installation Feedback & Readiness

- FR60: 系统可以在安装过程中展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 的执行状态。
- FR61: 系统可以展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 的安装结果。
- FR62: 系统可以展示每个已配置 AI IDE 的 skill 数量和目标目录。
- FR63: 系统可以在安装完成后展示包含安装路径、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令的 SpecLite ready summary。
- FR63a: Ready summary 的 human-readable 输出可以包含解释性文案，但 automation 依赖必须进入 `install --json` 的 `InstallCommandData` 字段，例如 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；MVP 不新增未契约化的 `readySummary` JSON blob。
- FR64: 系统可以在安装完成后展示用户下一步如何启动 AI agent 和调用帮助 skill。
- FR65: 系统可以在安装完成后展示安装位置、已安装模块和已配置工具清单。

### Maintainer Workflow & Examples

- FR66: SpecLite 维护者可以验证新增或修改的 source skill 是否可安装。
- FR67: SpecLite 维护者可以使用 fixture project 复现 fresh install 流程。
- FR68: SpecLite 维护者可以使用 fixture project 验证安装前后目录变化。
- FR69: SpecLite 维护者可以使用 fixture project 验证 status、validate 和 update 行为。
- FR70: SpecLite 维护者可以验证至少一个 skill 从 IDE 发现到产物输出的最小闭环。
- FR71: 文档读者可以通过 fresh install 示例、安装前后目录树、manifest/index 示例、status/validate 输出示例和 update 保护示例理解安装后结构、常用命令和验证结果。
- FR71a: Fixture expected outputs 是契约测试资产，不是仅供阅读的示例；新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind 时，必须同步相关 fixture 输入和 expected outputs。
- FR71b: Fixture case directory、expected output classes、snapshot comparison、ready summary gate、release gate / regression asset 区分和 baseline case 集合由 `_bmad-output/planning-artifacts/specs/fixture-contract.md` 管理。实现不得先更新 snapshots 再反推契约行为；契约变更必须先更新 owning SPEC 和 executable schema/parser，再更新 fixture expected outputs。

### Post-MVP Governance & Expansion

- FR72: 项目维护者可以初始化或重建项目级配置。
- FR73: 项目维护者可以列出可安装模块、skills、IDE targets 或版本。
- FR74: 工具链维护者可以运行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断。
- FR75: 工具链维护者可以显式同步 source 与 IDE mirrors。
- FR76: 项目维护者可以移除 installer-owned 安装结果。
- FR77: 工具链维护者可以把 MVP 机器可读输出接入 CI、企业工具链和自动化验证流程。
- FR78: 企业规范负责人可以查看包含阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量的规范落地与流程覆盖报告。该报告属于 Post-MVP，可在 MVP 最小阶段覆盖矩阵与 validate output 之上增加趋势、导出、多项目/团队视角和企业治理汇总。

## Non-Functional Requirements

### Performance

- NFR1: 在常规 fixture 项目中，fresh install 必须至少输出 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 5 个阶段状态；fixture baseline 应记录阶段顺序、完成结果和阶段耗时。
- NFR2: `status` 在常规 fixture 项目中应在 2 秒内返回项目安装摘要，不执行完整文件完整性扫描；性能基准以 3 次连续运行的 p95 结果为准。
- NFR2a: MVP `status` 必须是轻量本地只读摘要，只读取本地 manifest、source descriptor、manifest version、installed modules、IDE target summary、关键路径和 high-level health；不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source，不得执行 remote freshness check、provenance revalidation、完整文件 hash scan 或隐式 update check。
- NFR3: `validate` 可以执行完整校验，但必须按 manifest/schema、IDE mirror、runtime path、menu target、artifact path 和 file integrity 类别输出进度；常规 fixture 项目中每个类别必须在开始和结束时输出状态。
- NFR4: `update` 与 `validate` 必须跳过 hash 未变化的 source skills 和 IDE mirrors；在 fixture baseline 中，未变化文件的重复写入次数必须为 0。
- NFR5: fixture project 中的 fresh install、status、validate、update 必须记录 baseline runtime；任一命令相较上一 accepted baseline 退化超过 25% 时，验证报告必须标记为 performance regression。

### Reliability & Determinism

- NFR6: 相同 source、配置、目标 IDE 和安装目录在同一平台上重复安装，应生成 byte-for-byte 一致的 `_speclite/_config`、manifest/index 和 IDE mirror 文件；允许差异仅限明确标记的时间戳字段。
- NFR7: `install` 对已存在安装内容必须输出 existing-install 状态，列出 detected runtime、manifest version、IDE targets 和下一步选项，不得静默覆盖已有 SpecLite 状态。
- NFR8: `update` 必须在修改文件前完成所有权和本地变更判断；无法确认安全时必须跳过该文件、输出 conflict 状态，并保留原文件不变。
- NFR9: `validate` 的检查结果必须可复现，同一安装状态下连续运行 3 次应返回相同 issue id、category、severity 和 affected path 集合。
- NFR9a: MVP `validate` 必须是本地确定性命令，不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source；不得执行 remote freshness check 或 provenance revalidation。远程重新验证只能发生在显式 `update`、安装来源解析流程或 Post-MVP `doctor` 中。
- NFR10: 安装失败时，系统不得展示 ready summary；失败结果必须列出 completed steps、failed step、pending steps 和 manual action，且退出状态不得为成功。
- NFR11: ready summary 只能在 source discovery、manifest generation、IDE mirror creation、config initialization 和 basic validation 全部成功后展示。

### Security & Safety

- NFR12: 安装器不得在 install plan 未声明且用户未确认的情况下访问远程 source、下载额外资源或执行外部脚本；install summary 必须记录每个 external access 的 redacted/display-safe source、reason 和 confirmation state。
- NFR13: 自定义 Git source、local path、tarball 和 offline bundle 必须在安装摘要中展示 source type、redacted/display-safe source value、resolved version 或 content hash。
- NFR13a: `sourceDescriptor.trustStatus` 必须区分 `trusted`、`unverified` 和 `blocked`：MVP 中只有 expected hash/lock match 可产生 `trusted`，不提供通用 trusted source allowlist schema；缺少信任锚但可安装的 source 为 `unverified`；hash mismatch、lock mismatch、unsupported source 或 Post-MVP source policy 拒绝必须为 `blocked` 并阻止写入。
- NFR13b: `sourceDescriptor.contentHash` 不对所有 source type 强制存在；MVP 必须强制 `sourceDescriptor.integrityEvidence` 至少包含一种可复现证据。registry source 记录 package/version/integrity 或 lock match；tarball/offline bundle 记录 content hash；Git source 记录 commit SHA；local source 记录 snapshot hash 或等价 manifest hash。只指定 remote URL、branch 或 tag 的浮动 Git source 不得写入。缺少完整性证据时必须输出 `source-integrity` error 并阻止写入。
- NFR13b-1: Local source snapshot hash 只覆盖 canonical source tree allowlist，必须排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。Tarball/offline bundle 至少必须记录包文件 artifact hash；解包后的 canonical source tree hash 可作为 expected installed state 输入，但不得与 artifact `contentHash` 混用。
- NFR13b-2: Source staging、临时解包目录、package-manager cache path 和临时 Git checkout path 是 private implementation state，不得进入 public JSON、manifest/index、files index、fixture snapshot 或 `ValidationIssue.details`。受控成功/失败应 best-effort cleanup；崩溃残留不属于 installed-state validation 范围。
- NFR13c: `integrityEvidence[].verified === false` 只能表示 evidence 可复现但未被 expected hash 或 lock match 背书，并且只能对应 `sourceDescriptor.trustStatus === "unverified"`。hash mismatch、lock mismatch 或 evidence 校验失败必须输出 `source-integrity` error，将 source 标记为 `blocked` 并阻止写入。
- NFR13d: `source-integrity` 与 `file-integrity` 必须是不同 issue category。source resolver/install planning 阶段的来源证据、registry/proxy/authentication failure、unreadable tarball/offline bundle 或 Post-MVP source policy 问题必须使用 `source-integrity`；已安装文件、manifest files index 或 IDE mirror hash mismatch 必须使用 `file-integrity` 或更具体的 `ide-mirror` category。
- NFR13e: Source descriptor 字段与语义以 `_bmad-output/planning-artifacts/specs/source-descriptor-contract.md` 为准。PRD、Architecture、Manifest/index 和 CommandResult 中的 source descriptor 描述只作为摘要或投影，不得各自定义 trust/evidence 规则。
- NFR14: human-owned custom 文件、workflow-owned 产物和发生 drift 的 IDE mirror 文件不得被 install 或 update 静默覆盖；覆盖保护通过 ownership manifest、路径规则和 hash comparison 共同判断。
- NFR15: 对遗留入口或 stale entries 的处理必须默认提供 path、risk category、suggested manual action 和 verification command，不应在未确认的情况下删除用户目录中的文件。
- NFR16: validate 报告和 JSON payload 不得泄露 home directory 以外的无关本机路径、环境变量值或认证信息；路径展示应使用 project-relative POSIX path，只有项目外诊断场景可使用明确标记的 redacted absolute path。
- NFR17: installer 生成的脚本和配置文件必须在 manifest 中记录 generator、source version、content hash 和 ownership，便于用户审查其由 SpecLite 安装器生成。
- NFR17a: Manifest/index schema、skill/help/files index、minimum phase coverage matrix、canonical target ordering、package-level hash 与 file-level hash 的职责分离必须遵守 `_bmad-output/planning-artifacts/specs/manifest-index-contract.md`。Canonical skill package hash 用于跨 IDE mirror 一致性；files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed paths、skipped paths 和 conflicts。File hash 基于 raw bytes；line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions。Runtime scripts 与 generated scripts 必须在 files index 中记录 `executable`。
- NFR17b: Canonical source text files 必须使用 LF。Installer 不得按平台改写 canonical text line endings；如果必须生成平台专用脚本，必须作为独立 generated file 记录自己的 files index entry 和 raw-byte hash。`executable` 表示 POSIX executable intent；Windows 不要求 POSIX chmod 语义，但仍保留该字段用于脚本生成意图和跨平台 fixture。

### Compatibility & Portability

- NFR18: MVP 必须支持 macOS 13+ 和 Windows 11 的核心安装、状态检查、验证和更新路径；不满足版本要求时必须输出 unsupported-platform 诊断。
- NFR19: 所有 manifest、index、hash、validate 报告、IDE target 记录、`CommandResult.data` path fields、`issues[].affectedPath` 和 plan action affected paths 必须使用 project-relative POSIX-style path，并通过同一 normalization function 生成。
- NFR20: 系统必须通过跨平台 fixture 覆盖路径分隔符、LF/CRLF、可执行权限、大小写敏感路径冲突、symlink escape、path escape 和 shell invocation 差异；写入前必须阻断 symlink/path escape、case conflict 和 unsafe overwrite。
- NFR21: Node.js MVP 运行时版本要求必须在安装前检查；不满足要求时必须输出 detected version、required range 和安装前置建议。
- NFR22: npm public registry、private registry、local tarball、offline bundle 和 Git source 的安装入口必须最终归一为包含 source type、resolved root、version、integrity evidence 和 trust status 的 source descriptor。完整 source lockfile 生成、刷新、轮转和迁移属于 Post-MVP；MVP 只消费 expected hash、version-lock、registry integrity、content hash、snapshot hash 或 Git commit SHA 作为最小 trust evidence。
- NFR23: 不同 AI IDE 的平台差异必须限制在 adapter 配置、target directory metadata 和 Post-MVP command pointer artifact 中；MVP 不生成 command pointer artifact，canonical skill package 内容 hash 不得因 IDE target 不同而变化。MVP target id 必须表示物理 execution target：`claude` 对应 `.claude/skills`，`agents` 对应 `.agents/skills`；GitHub Copilot/Cursor 在 MVP 中只能通过 `agents` target 表示，不能伪造专用 target id。

### Integration Quality

- NFR24: 每个 AI IDE adapter 必须声明 id、target directory、supported entry types、shared target policy、known limitations、validation checks 和 canonical target order。Adapter registry 字段与状态语义必须遵守 `_bmad-output/planning-artifacts/specs/ide-adapter-registry-contract.md`。MVP adapter schema 可以声明 `commandPointerBehavior: "none" | "unsupported"`，但不得生成 command pointer artifact。Manifest generation、`CommandResult.data.ideTargets`、`validate.data.checkedTargets` 和 fixture snapshots 必须复用 adapter registry 的 canonical target order，不得使用 glob、filesystem、user selection 或 async completion order。
- NFR24a: Target status 词汇必须按层区分。Install planning 使用 `planned`、`unsupported`、`failed`；installed phase coverage 使用 `mapped`、`unsupported`、`failed`；status summary 使用 `not-configured`、`configured`、`partial`、`failed`。这些枚举不得跨层复用含义。用户显式选择的 target 若 unsupported 必须成为 blocking error；未选择或可选 target 的 unsupported 可作为 warning、info 或 known limitation。
- NFR25: IDE mirror 生成结果必须能被 validate 反向检查，确认 skill 数量、canonical id、relative path、content hash 和 source reference 一致。
- NFR25a: IDE mirror drift 必须产生稳定 issue id、category、severity 和 affected path；MVP 的 `speclite update --repair` 或用户确认行为必须显式触发并可被 fixture 验证，`speclite sync` 保持 Post-MVP。
- NFR25b: installer-owned drift repair 必须覆盖 `_speclite` metadata/control hub 与 IDE execution plane 中的 installer-owned files，并通过 fixture 验证 human-owned 与 workflow-owned 内容保持不变。
- NFR25c: repair plan 输出必须稳定、可诊断、可测试；相同 drift 状态下 repeated repair planning 应产生相同 affected path、hash 和 action 集合。
- NFR26: 系统必须用 not-configured、configured、partial、failed 4 类状态报告每个 IDE target，并为 partial/failed 输出原因和 affected path。
- NFR27: 新增 IDE adapter 不应要求修改 canonical skill 内容；adapter 测试必须证明 canonical skill package hash 在新增前后不变。
- NFR28: manifest/index、help catalog 和 menu target 之间必须保持可验证的一致关系：MVP 中每个 menu target 必须能解析到唯一 installed self-contained skill entry；command pointer target 保持 Post-MVP。
- NFR28a: Source 侧以 `assets/source/speclite/` 下的 module metadata 与 source skill package 作为 canonical truth；installed 侧以 manifest/index 作为已安装投影。Help index 只能引用 `canonicalSkillId`、phase、entry label 和 activation target，不得定义第二套 skill identity、alias-only identity 或 IDE-specific skill identity。
- NFR29: shared scripts、module directories、configuration 和 help catalog 的安装结果必须能在 ready summary 和 validate 中以 installed/missing/mismatched 状态检查。

### Diagnostics & Observability

- NFR30: 所有核心命令必须输出 success、warning 或 failure 状态；每个状态必须包含 command、target project、summary 和 next action。`failure` 必须对应非 0 exit code；`success` 和 `warning` 必须对应 0 exit code。
- NFR31: 错误信息必须包含 issue id、category、severity、affected path 或 component、impact 和 suggested next step。
- NFR32: stale legacy entries、legacy namespace residue、runtime path 错误、manifest/schema 错误、source integrity 错误、installed file integrity 错误、operation lock 错误、update/repair planning blocker 和 IDE mirror 漂移必须以不同 issue category 呈现，并在 validate summary 或 command-level issue 输出中分别计数或呈现。
- NFR32a: `ValidationIssue.category`、issue id 边界、默认 severity 指引和 validation fixture ownership 由 `_bmad-output/planning-artifacts/specs/validation-issue-taxonomy.md` 作为 canonical taxonomy 管理。新增 issue category 必须先更新该 SPEC；新增 issue id 必须在同一变更中补 fixture assertion。
- NFR32b: `manifest-schema.migration-needed` 是 MVP 保留 issue id，用于旧版或不兼容 manifest/index schema 需要迁移时的诊断；不得用自由文本 issue id 表示 schema migration。
- NFR32c: `manifest-schema.migration-needed` 的 `details` 至少必须包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind` 和 `manualActionRequired`，且不得包含 absolute path、timestamp、stack trace 或环境相关文本。
- NFR32d: 每个 MVP issue category 必须在 taxonomy SPEC 中预留最小 issue id baseline。实现不得发明自由文本 issue id；新增 issue id 必须先更新 taxonomy，并在同一变更中补 fixture assertion。
- NFR32e: 企业 source 失败必须使用稳定 source-integrity issue id，包括 registry unreachable、authentication required、offline bundle unreadable 和 tarball unreadable；credentials 和 credential-bearing URLs 必须 redacted。
- NFR32f: Write-capable command 出现 `operation-lock.project-locked` 必须为 `failure` 且非 0 exit code；`validate` 发现 stale lock 时可以输出 `operation-lock.stale-lock` warning，不阻断。
- NFR32g: `update.conflicts` 是 command-level update/repair planning blocker，category 必须为 `update`，severity 必须为 `error`；逐路径冲突只放在 `data.conflicts`，不得复制成多个 issues。
- NFR33: `status` 只提供 source/channel/version、IDE target coverage、manifest presence 和 high-level health；`validate` 提供逐项 issue id、category、severity、affected path 和修复建议。
- NFR34: 安装完成摘要必须展示安装位置、已安装模块、已配置 AI IDE、关键目录、manifest version、source descriptor 和下一步使用建议。
- NFR35: MVP 的机器可读输出必须与人类可读输出共享同一 issue model；同一检查结果的 issue id、category、severity 和 affected path 必须一致。
- NFR35a: `--json` 输出必须保持 deterministic schema；相同安装状态和命令参数下，除明确允许的 timestamp 字段外，`CommandResult.schemaVersion`、`CommandResult`、`ValidationIssue` 和 command-specific `data` 的语义内容必须一致。详细 deterministic comparison policy 以 `_bmad-output/planning-artifacts/specs/command-result-json-contract.md` 为准。
- NFR35a-schema: `CommandResult.schemaVersion` 必须作为真实兼容性边界使用。`speclite.command-result.v1` 内不得删除字段、重命名字段、改变既有字段语义、收窄枚举、做字段类型不兼容改变或新增必填字段；这些变更必须发布为新的 schema version。
- NFR35a-0: `CommandResult.command` 必须可跨 shell、参数顺序和命令别名稳定比较；`--json`、`--yes`、`--project-root`、source 参数和其他 flags 不得影响 command ID。`update --repair` 的 command ID 必须为 `update.repair`。
- NFR35a-1: `CommandResult.targetProject` 必须可跨不同 checkout root 稳定比较；同一 trim 后非空的 project config 项目名称应产生相同 targetProject，缺失、空字符串或纯空白项目名称时同一目录 basename 应产生相同 targetProject；MVP 不得通过 slugify、字符集限制或长度改写改变该显示标识。
- NFR35b: human-readable output、`--json` output、exit code 和 fixture assertions 必须从同一 `CommandResult.status` 推导；不得出现 JSON 为 `success` 但 exit code 非 0，或存在 error/critical issue 但 exit code 为 0 的情况。
- NFR35b-1: `status.data.highLevelHealth` 不得与 `CommandResult.status` 互相推导。`CommandResult.status` 表示命令结果；`highLevelHealth` 表示安装健康摘要。命令成功读取到 `not-configured`、`partial` 或 `failed` 安装状态时，`CommandResult.status` 仍可为 `success`，exit code 仍应为 0。
- NFR35b-2: `status.data.highLevelHealth === "not-configured"` 是合法未安装状态，不是命令失败。`status` 成功判断该状态时必须返回 `CommandResult.status: "success"`，exit code 0，并在 `nextActions` 中建议运行 `speclite install`。
- NFR35b-3: `status.data.highLevelHealth === "partial"` 或 `"failed"` 不得自动生成 warning issue，也不得自动把 `CommandResult.status` 推导为 `warning`。`status` 必须优先通过 `summary`、`highLevelHealth` 和 `nextActions` 表达轻量摘要；只有轻量读取过程本身发现明确 warning 条件时，才产生 warning issue。
- NFR35b-4: `speclite status --json` 必须允许 `issues: []`；空 issues 只表示本次轻量 status 命令无命令级 warning/error/critical issue，不得作为安装健康通过的证明。安装健康断言必须读取 `data.highLevelHealth`。
- NFR35b-5: MVP `status.data` 不得包含 `issueCounts`；`issueCounts` 只属于 `validate.data`。fixture、CI 和自动化脚本不得要求 `status` 输出问题计数，也不得把 `status` 当成弱化版 `validate`。
- NFR35b-6: `validate.data.issueCounts` 必须固定包含 `info`、`warning`、`error` 和 `critical` 四个 key；计数为 0 的 severity 也不得省略。fixture、CI 和自动化脚本可以依赖该固定 key set。
- NFR35b-7: `validate.data.checkedCategories` 必须按 canonical issue category order 输出：`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。部分执行时必须保留已执行类别的相对顺序，不得使用文件系统遍历、规则注册或对象 key 顺序作为输出顺序。
- NFR35b-8: `validate.data.checkedTargets` 和 command data 中的 `ideTargets` 必须按 manifest/adapter registry canonical target order 输出。部分执行时必须保留已执行 targets 的相对顺序，不得使用 glob、文件系统、平台返回或 adapter 完成顺序作为输出顺序。
- NFR35b-9: `validate.data.validatedPaths` 必须先规范化为 project-relative POSIX path，再按字典序输出。不得使用 validation rule execution order、filesystem traversal order 或 issue discovery order 作为输出顺序。
- NFR35b-10: `CommandResult.issues` 必须按 severity order（`critical`、`error`、`warning`、`info`）、canonical issue category order、normalized affected path、issue id 依次排序。
- NFR35b-11: `CommandResult.nextActions` 必须按 command-specific priority order 输出：blocking remediation、recommended next step、optional exploration。同一 priority tier 内按命令定义的稳定顺序输出，不得按字母序或 reporter 拼接顺序重排。
- NFR35b-12: `CommandResult.summary` 必须使用 command-specific stable summary template，且该约束只适用于 `--json` output。JSON summary 不得包含 timestamp、absolute path、home directory、环境相关措辞、随机排序内容或未规范化路径；human-readable output 不受该模板限制。
- NFR35b-13: Human-readable output 可以更丰富，但不得成为自动化依赖的唯一承载位置；automation 需要的值必须进入 structured JSON 或 file contract。Human output 也必须遵守 credential、cache path、temporary extraction path、home directory 和 local absolute source path 的 redaction/display-safe 策略。
- NFR35c: command-specific `data` payload 不得使用未记录字段作为自动化依赖；新增、弃用或重命名 payload 字段必须通过 `CommandResult.schemaVersion` 和 fixture expected outputs 管理。
- NFR35d: JSON path fields 必须可跨 macOS/Windows 和不同 checkout root 稳定比较；fixture snapshots 不得依赖 absolute local path、OS-specific separators 或 home directory；`data.paths.projectRoot` 必须为 `"."`。
- NFR35e: `ValidationIssue.issueId` 必须可跨不同 affected path、IDE target、source name、hash 和运行次数稳定比较。Issue id 不得包含动态值；新增 validation rule 可以新增 issue id，但不得改变已有 issue id 的问题类型语义。
- NFR35f: `ValidationIssue.details` 必须可被 fixture snapshot 稳定比较，并不得泄露 absolute path、home directory、环境变量、认证信息、stack trace、raw exception object、timestamp、随机 id 或其它非确定性字段。
- NFR35g: `ValidationIssue.severity` 必须作为 `CommandResult.status` 和 exit code 的稳定输入；各 validation rule 不得自行重定义 severity 语义，不得用 warning 阻断命令，也不得在 error/critical issue 存在时输出 command success。
- NFR35h: `ValidationIssue.impact` 与 `ValidationIssue.suggestedNextStep` 必须可被 fixture snapshot 稳定比较；不得包含 path、IDE target、source name、timestamp、stack trace、hash、随机值或长段解释。
- NFR35i: public JSON timestamp 必须是显式例外而非默认能力；任何允许 timestamp 的字段必须在 schema 中声明，并从 stable fixture snapshot comparison 中排除。
- NFR35j: public JSON arrays 不得依赖 filesystem traversal、object insertion、rule execution、adapter completion 或 async completion order。`changedPaths`、`skippedPaths`、`conflicts`、`completedSteps`、`pendingSteps`、`installedModules` 等数组必须在 schema 中声明排序规则。

### Maintainability & Extensibility

- NFR36: source discovery、module selection、IDE adapter、manifest/index 生成和 validation checks 必须通过独立模块边界和公开接口连接；新增 adapter 不得修改 source discovery 逻辑。
- NFR37: 新增官方模块只允许通过 module metadata、skill package 和 manifest/index generation 扩展安装流程，不应要求重写 installer pipeline。
- NFR38: 新增验证规则不得改变已有 issue id、category、severity 字段含义；需要新增字段时必须通过 schema version 扩展。
- NFR39: 配置和定制化解析逻辑必须集中在统一 resolver 中；skill 或 adapter 不得实现自己的配置合并规则。
- NFR40: fixture project 应作为维护者验证 installer 行为的基础资产；每个新增安装能力必须同步新增或更新 fixture case、expected output 和 validation assertion。
- NFR40a: MVP release gate fixtures 必须在 Node 22 和 Node 24 上通过，并包含 macOS 与 Windows path-portability 证据。Windows fixture 不要求 POSIX chmod，但必须验证 files index 中的 `executable` intent 和受支持的脚本入口可用性。

### NFR Measurement Matrix

| Area | Primary NFRs | Measurement Method | Pass Criteria |
| --- | --- | --- | --- |
| Install progress | NFR1, NFR10, NFR11 | Run fresh install on fixture project and parse ordered step events | Required steps appear once, in order, and final ready summary appears only after basic validation passes |
| Command runtime | NFR2, NFR3, NFR5 | Run 3 repeated fixture commands and record p95 duration | `status` p95 < 2s; accepted baseline regression <= 25% |
| Determinism | NFR6, NFR9, FR71a | Repeat install/validate on same fixture and compare normalized outputs | Generated canonical files and issue sets match except allowed timestamp fields |
| Update safety | NFR8, NFR14 | Modify installer-owned, human-owned, and workflow-owned fixture files before update | Conflicts are reported; human/workflow-owned files remain unchanged |
| Path portability | NFR18-NFR20 | Run path fixtures on macOS 13+ and Windows 11 | Normalized paths are project-relative POSIX-style; no separator, newline, permission, symlink escape, path escape, unsafe overwrite, or case-conflict failure |
| IDE integration | NFR23-NFR29 | Generate mirrors for all selected IDE targets and run reverse validation | Each canonical skill has expected target paths and matching package/file hash projections |
| Diagnostics | NFR30-NFR35j, NFR32a | Compare human-readable and machine-readable outputs against issue schema and taxonomy | Required issue fields are present and semantic fields match across output modes |
| Extensibility | NFR36-NFR40 | Add a fixture module, adapter, and validation rule in isolation | Existing module, adapter, and issue schema behavior remains compatible |
