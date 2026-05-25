# Executive Summary（执行摘要）

SpecLite 是面向 AI IDE 时代的本地研发方法论安装与治理层，目标是把一套基于 SPEC-Driven、TDD 测试理论、敏捷阶段化流程控制、企业级统一研发规范和研发过程文档体系的 For AI 方法论，稳定安装到多个 AI IDE 中。它解决的核心问题不是缺少更多 skill 文件，而是方法论能力散落在 Markdown、提示词、目录结构和人工约定中，难以在 Claude Code、GitHub Copilot、Cursor 等多 IDE 环境中保持一致、可发现、可配置和可持续演进。MVP 的硬交付 IDE target 是 `.claude/skills` 与 `.agents/skills`；GitHub Copilot/Cursor 可通过 `.agents/skills` 兼容路径进入 MVP，专用 command pointer 或专有 adapter 属于 Post-MVP。

成功后的 SpecLite 让团队不再围绕“每个 IDE 怎么配置、每个 agent 怎么复制、过程文档放哪里”反复协调，而是把注意力放回 SPEC、方案评审、史诗/故事/任务规划、实现、测试、对抗性审查等研发流程本身。当前多 AI IDE 并存已经成为现实，skill/agent/prompt 体系正在爆炸式增长和碎片化；SpecLite 已具备方法论内容基础，下一阶段需要补齐安装控制面，使这些内容成为可安装、可更新、可验证、可跨 IDE 分发的本地系统。

## What Makes This Special（差异化亮点）

SpecLite 的差异化在于它不是文件复制器，而是 AI IDE 方法论系统的安装控制面。用户通过一条命令即可把同一套 SpecLite skills 安装进多个 AI IDE，并让各 IDE 看到一致的执行入口，避免“这个 IDE 有、那个 IDE 缺”的能力漂移。

安装器同时生成项目级 `_speclite` runtime、配置文件、manifest、skill/help/files 索引和 `_speclite-output` 输出目录，使安装结果不只是可用，而且可发现、可审查、可验证、可通过 Git 跟踪并可持续演进。这个控制面把 SpecLite 从一组方法论源码定义转化为一个可治理的本地研发过程系统。
