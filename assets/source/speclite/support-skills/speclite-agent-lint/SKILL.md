---
name: speclite-agent-lint
description: "检查 SpecLite Agent 定义包是否符合通用 Skill 与 Agent 专属规则。用于用户提到 speclite agent lint、lint speclite agent、check speclite agent、validate agent definition、检查 Speclite Agent、Agent 规范检查、检查 agent 定义或审计 speclite-agent-* 目录。核心能力：只读校验 [agent]、persona、menu、prompt 引用、runtime 残留并输出结构化修复报告。"
allowed-tools: Read, Grep, Glob, Bash
metadata:
  version: "1.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    Speclite Agent Lint 是只读规范检查器，用于审查 `speclite-agent-*` 定义包。它在通用 Skill 规则基础上增加 Agent 专属语义检查，重点防止 `[agent]` 被误检为 `[workflow]`、菜单目标断链、persona 激活语义丢失和 BMad runtime 残留。

[Core Capabilities（核心能力）]
    - **通用 Skill 合规检查**：验证 YAML frontmatter、description、allowed-tools、metadata、版本一致性、正文长度、必需章节和引用路径。
    - **Agent 定制块检查**：确认 `customize.toml` 存在 `[agent]`，关键字段完整，数组与数组表结构符合合并规则。
    - **激活流程检查**：确认入口使用 Speclite resolver 的 `--key agent`，并保留 persona、persistent facts、config、greet、menu dispatch 和持续身份规则。
    - **菜单完整性检查**：验证 `[[agent.menu]]` 的 code 唯一、description 非空、每项只能包含 `skill` 或 `prompt` 之一，并检查目标 Skill 或本地 prompt 文件存在。
    - **Speclite 运行模型检查**：扫描 `_bmad`、`config.yaml`、`/bmad:*`、源码仓库 runtime 依赖和 config fallback 误用。
    - **Deterministic 脚本检查**：运行 `scripts/check_agent_skill.py`，用可复核 JSON 结果支撑人工报告。
    - **文件归类检查**：检查根目录 Markdown 白名单、prompt 文件迁移、`references/` 与 `assets/` 职责边界。
    - **修复方案输出**：按 Critical / Major / Minor / Observation 输出证据、影响、建议调整和验证方式。

[Workflow（执行流程）]
    1. 确认目标 Agent Skill 目录、Skill 名称或 `--all` 扫描根；若未提供路径或名称，先询问，不猜测。
    2. 完整阅读 `references/lint-rules.md`，按规则读取目录、`SKILL.md`、`CHANGELOG.md`、`customize.toml`、引用的 references/assets 和本地 prompt。
    3. 对目标目录运行只读脚本：`python3 scripts/check_agent_skill.py <agent-dir>`；批量扫描时运行 `python3 scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills`。
    4. 执行通用规则：frontmatter、description、版本、正文章节、根目录文件、引用路径和命名。
    5. 执行 Agent 专属规则：`[agent]` 字段、激活流程、`--key agent`、persona 语义、菜单项、prompt 文件、持续身份。
    6. 执行 Speclite 专属规则：runtime 路径、`_speclite/config.toml`、custom fallback、BMad 残留、公共源码目录混用。
    7. 输出报告：使用 `assets/report-template.md` 格式，列出结论、Findings、调整方案和验证建议。
    8. 如果用户要求重新检查，重新执行完整扫描并标注已修复、新增和仍存在问题。

[Notes（注意事项）]
    - 本 Skill 属于 `support-skills/`，只服务 SpecLite canonical skill 源定义检查，不属于目标项目默认 SDLC runtime 安装集合。
    - 默认只读，绝不修改目标 Agent Skill 文件。
    - `scripts/check_agent_skill.py` 是确定性证据来源；人工报告不得与脚本中的 Critical/Major 结论矛盾。
    - `customize.toml` 对 Agent 必须承载 `[agent]`，不能套用 workflow-only lint 规则。
    - Agent 包的 `SKILL.en.md` 不是硬性必需项；如存在，必须与中文 canonical 入口保持版本和运行模型一致。
    - `CHANGELOG.md` 可以保留 BMAD 来源说明；`SKILL.md` 和当前 references 不得把 BMAD 路径写成运行依赖。
    - 菜单目标不存在时通常是 Major；如果入口会直接分发到不存在的必需目标，可升级为 Critical。
    - `prompt` 引用的文件是执行指令，缺失或路径未迁移会导致 Agent 菜单项不可用。
    - 报告必须用中文，路径使用工作区相对路径。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-agent-creator 维护并纳入 SpecLite support-skills 体系。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/`、`assets/` 和 `scripts/`。
