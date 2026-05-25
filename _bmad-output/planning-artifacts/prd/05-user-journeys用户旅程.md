# User Journeys（用户旅程）

## Journey 1: Multi-IDE Installation by Tech Lead（技术负责人完成多 IDE 安装）

李澈是团队技术负责人，团队成员同时使用 Claude Code、GitHub Copilot 和 Cursor。过去他需要手工复制 skills、同步不同 IDE 的目录结构，并反复解释哪些 agent 可用、产物该放在哪里。每次有人换 IDE，团队方法论执行入口就可能漂移。MVP 中 GitHub Copilot/Cursor 的可用路径以 `.agents/skills` 兼容加载为准，专用 command pointer 留到 Post-MVP。

他在项目根目录执行一条 SpecLite 安装命令，选择目标 IDE 和需要安装的模块。安装器发现正式可分发的 SpecLite source skills，生成 `.claude/skills`、`.agents/skills` 等 IDE skill mirrors，同时创建 `_speclite` runtime、manifest/index、配置文件和 `_speclite-output` 目录。

安装完成后，他运行 `status` 或 `validate`，确认多个 IDE 中的 canonical skills 一致，manifest/schema 通过校验，阶段化菜单可以被正确发现。团队第一次获得一个可重复、可审查、可验证的 SpecLite 安装结果，不再依赖手工复制和口头约定。

## Journey 2: Phase-Based Skill Use by AI IDE User（AI IDE 使用者按阶段调用研发 skills）

林予是一名开发者，正在一个新功能中使用 AI IDE 协作完成研发流程。她不想记住所有 skill 名称，也不想翻目录找提示词；她需要知道“当前阶段可以做什么”。

她在 Claude Code 或支持 `.agents/skills` 的 Copilot/Cursor 环境中触发 SpecLite 菜单指令。IDE 显示当前阶段包含的 skills 菜单，例如 SPEC、方案评审、史诗/故事/任务规划、实现、测试、对抗性审查等能力。林予选择某个 skill，AI IDE 按该 skill 的规约激活流程，读取 `_speclite` 配置和相关上下文。

执行完成后，skill 按配置把产物写入 `_speclite-output` 或指定文档目录，例如 SPEC、方案、故事、实现记录、测试设计或审查文档。林予感受到的价值不是“多了一个提示词”，而是研发过程中的每个关键阶段都有稳定入口、明确菜单和可沉淀产物。

## Journey 3: Installation Drift Troubleshooting by Toolchain Maintainer（工具链维护者排查安装漂移）

周航负责团队工具链维护。某次团队成员反馈一个 `.agents/skills` 兼容 IDE 中能看到某些 SpecLite skills，但另一个兼容 IDE 中缺失，另一个成员还发现某个 skill 输出路径不对。过去这类问题只能靠人工比对目录，排查成本很高。

周航运行 SpecLite `validate`。验证器读取 manifest、skill index、help index、files manifest 和 IDE mirrors，识别出某个 IDE mirror 内容不一致，同时报告一个旧 runtime path 残留和一个菜单 target 缺失。报告明确指出问题文件、影响范围和建议恢复路径。

他执行 `speclite update --repair` 后重新 validate，确认 IDE mirror 一致、manifest schema 通过、菜单 target 存在、human-owned custom 文件未被覆盖。漂移问题从“大家各自猜”变成可诊断、可复现、可修复的本地治理问题。

## Journey 4: Installable Skill Release by SpecLite Maintainer（SpecLite 维护者发布新的可安装 skill）

许宁是 SpecLite 方法论维护者。她新增了一个对抗性审查相关 skill，并更新了 module metadata、菜单配置和产物路径。她的目标不是只让源码目录里多一个 Markdown 文件，而是确保这个能力可以被安装到多个 AI IDE，并在菜单中正确出现。

她在本地运行 source validation，检查 `assets/source/speclite/` 下的 skill layout、root 文件白名单、assets/scripts 归位、customize 配置、菜单 target 和 runtime path。随后她把 source 安装到 fixture 项目，生成 IDE mirrors、`_speclite` metadata、manifest/index 和输出目录。

安装测试通过后，她确认新增 skill 在 Claude Code 和 `.agents/skills` 目标中内容一致，菜单能正确提示，对应 workflow 能激活并输出 review 产物。这个旅程证明 SpecLite 的方法论演进不是手工扩散，而是通过安装控制面稳定进入目标项目和 AI IDE。

## Journey 5: Engineering Standard Adoption Verification by Enterprise Governance Owner（企业规范负责人验证研发规范落地）

沈薇是企业规范负责人，负责推动团队采用统一的 SPEC-Driven、TDD、阶段化流程、方案评审、故事规划、实现、测试和对抗性审查规范。过去这些规范分散在文档、培训材料、提示词和人工约定里，即使团队声称“已经采用”，实际执行时也很容易因 IDE 差异、agent 漂移或产物路径不统一而变形。

她希望看到的不只是 SpecLite 被安装成功，而是统一研发规范是否被稳定转化为团队可执行的 AI IDE 工作入口。安装完成后，她检查多个 IDE 中是否呈现一致的阶段化 skills 菜单，确认每个关键研发阶段都有对应 skills，且这些 skills 能输出标准化过程产物，例如 SPEC、方案评审记录、故事规划、测试设计、实现记录和对抗性审查文档。

当团队开始使用 SpecLite 后，沈薇通过 manifest/index、输出目录结构和 validate 报告确认规范执行链路是否完整：哪些阶段有入口，哪些产物已生成，哪些 skill 或菜单配置存在缺口。她的成功时刻是：研发规范不再只是静态文档，而成为多个 AI IDE 中一致可用、可检查、可持续改进的执行体系。

## Journey Requirements Summary（旅程需求总结）

这些旅程揭示出 MVP 必须具备以下能力：

- 一条命令完成多 AI IDE 安装，并生成一致的 IDE skill mirrors。
- 安装器生成 `_speclite` runtime、配置、manifest/index、输出目录，而不只是复制 skill 文件。
- IDE 中存在阶段化菜单入口，能提示当前阶段可用 skills。
- 用户可以从菜单选择 skill，并稳定产出 SPEC、方案、故事、实现、测试、审查等过程文档。
- `status`、`validate`、`update` 能诊断和修复 IDE mirror 漂移、manifest/schema 问题、runtime path 残留、菜单 target 缺失。
- human-owned custom 文件和 workflow artifacts 在安装与更新过程中不被覆盖。
- source skill 变更可以通过 fixture install 和 deterministic validation 证明可安装、可激活、可输出产物。
- 企业规范负责人/流程治理者必须能验证统一研发规范是否落地：多个 IDE 中的阶段化 skills 菜单一致，关键研发阶段均有对应 skills，标准过程产物能按配置生成并被检查。
