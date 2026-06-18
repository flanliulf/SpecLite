---
name: speclite-check-canonical-source-change
description: "检查 SpecLite canonical source 变更后的派生一致性。用于用户要求 canonical source check、检查 assets/source/speclite、canonical 变更闭环、更新 skill/hook/agent 后验收或扫描 sdlc/core/total 数量。核心能力：对齐 root counts、module-help.csv、hook source、baseline 常量、fixtures、docs 和 packaging manifest。"
allowed-tools: Read, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    只读检查 `assets/source/speclite/` 作为 SpecLite canonical source 发生新增或修改后的闭环一致性。它把 canonical skill、hook、agent、fixture、docs 和 release packaging 的派生关系集中成一份可执行检查清单，避免 root counts、`module-help.csv`、hook descriptor、安装 fixture 或发布 manifest 漂移。

[Core Capabilities（核心能力）]
    - **Root counts 对齐**：统计 `core-skills`、`sdlc-skills`、`support-skills` 和 `hooks`，确认默认安装 baseline 仍是 `core+sdlc`。
    - **`module-help.csv` 对齐**：检查 `core` / `sdlc` package roots 是否都有 help row，并报告重复、缺失或未知 row。
    - **Hook source 完整性**：检查每个 canonical hook package 的 `README.md`、`hook-manifest.json`、`runner.mjs`、Claude/Codex fragment 和 manifest id。
    - **Agent lint 路由提醒**：识别 `speclite-agent-*` 变更时提醒使用 `speclite-agent-lint`，避免套用 workflow-only 规则。
    - **派生产物扫描**：检查 `CORE_SDLC_BASELINE_ENTRY_COUNT`、文档旧数字、fixture 旧数字、legacy Codex hook array shape 和 `release/packaging-manifest.json`。
    - **验证命令建议**：输出 scoped script、skill density、focused tests、build、full tests、packaging check 和 `git diff --check`。

[Workflow（执行流程）]
    1. 确认仓库根目录，默认在 SpecLite 仓库根运行。
    2. 读取 `references/canonical-change-checklist.md`，确认本次 canonical 变更涉及 skill、hook、agent、docs、fixtures 或 packaging 哪些面。
    3. 运行只读脚本：
       `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`
    4. 对脚本 findings 做人工复核：`warning` 表示需要同步派生产物；`failure` 表示脚本本身无法读取必要输入。
    5. 若涉及 Agent 定义包，补跑：
       `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <agent-dir>`
    6. 若涉及普通 Skill 包，补跑：
       `python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py <skill-dir>`
    7. 完成修复后重新运行 Step 3，并按脚本输出的 recommended commands 执行聚焦测试和 release packaging check。

[Notes（注意事项）]
    - 本 Skill 只读，不直接修改 canonical source 或派生产物。
    - `support-skills` 不进入默认目标项目 skill mirrors；默认安装 baseline 只计算 `core+sdlc`。
    - Hook guardrail 是 deterministic 保护层，不替代开发流程或人工 review。
    - `canonical-source-change-check` hook 是 warning-only：提醒运行本 Skill 和验证命令，不阻断 Claude/Codex 会话。
    - 检查报告必须用实际文件和脚本结果支撑，不凭记忆更新 `sdlc`、`core`、`support` 或 `total` 数字。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 体系维护并纳入 SpecLite support-skills。修改时必须同步 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/` 和 `scripts/`。
