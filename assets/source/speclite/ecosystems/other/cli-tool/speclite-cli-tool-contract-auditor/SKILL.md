---
name: speclite-cli-tool-contract-auditor
description: "Audit CLI tool project contracts from repository evidence. Use when a selected other ecosystem module targets bin entries, command surface, TTY or non-TTY output, exit codes, JSON contracts, shell portability, install smoke, or CLI command compatibility."
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

# Speclite CLI Tool Contract Auditor

[Overview（技能说明）]
    Speclite CLI Tool Contract Auditor 是 `ecosystem-other-cli-tool` module 的项目形态审计工作流。它面向已选择 CLI tool other ecosystem module 的目标项目，围绕 `bin` entry、command surface、TTY / non-TTY output、exit codes、JSON contract、shell portability 和 install smoke 建立证据。

[Core Capabilities（核心能力）]
    - **CLI boundary discovery（CLI 边界发现）**：读取 `package.json`、manifest、entry files、command parser、README、shell scripts、tests 和 CI。
    - **Command surface audit（命令面审计）**：记录 command/subcommand/options/args、help output、error output、JSON mode 和 stable compatibility promises。
    - **Runtime behavior evidence（运行行为证据）**：区分 TTY / non-TTY、stdout / stderr、exit code、signal handling、shell portability 和 path assumptions。
    - **Install smoke planning（安装冒烟规划）**：规划 clean install、global/local invocation、`npx` / direct bin / package manager exec 的验证路径。
    - **Boundary protection（边界保护）**：通用 CLI 输出布局、Story 开发和 Code Review workflow 仍留在 `sdlc`。

[Workflow（执行流程）]
    详细步骤见 `references/cli-tool-contract-audit-workflow.md`。

    1. 确认 `{project-root}`、CLI package root、目标 command 和输出位置。
    2. 收集 CLI evidence：manifest `bin`、entry files、command parser、README、tests、fixtures、CI 和 install instructions。
    3. 只记录可验证事实；command surface、exit codes、JSON contract 和 shell portability 必须来自代码、测试、文档或命令输出。
    4. 输出 CLI contract audit note，覆盖 command surface、I/O behavior、install smoke plan、compatibility risks 和 unknowns。
    5. 如需实现或修复 CLI 行为，交给 Dev Story / Quick Dev / Code Review 等 `sdlc` workflow。

[Notes（注意事项）]
    - 本 Skill 不替代通用 CLI human output 或 implementation workflow。
    - 不从 README 示例反推出未实现行为；文档和真实 command behavior 冲突时必须标记 drift。
    - 对跨 shell 行为必须明确平台、shell、Node/runtime 和 package manager evidence。
