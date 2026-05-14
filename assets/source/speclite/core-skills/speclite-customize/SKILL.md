---
name: speclite-customize
description: "Author and update customization overrides for installed SpecLite skills. Use when user says customize speclite, override a skill, change agent behavior, customize workflow, 自定义 Speclite, 修改 Skill 行为, 覆盖配置, 调整 agent, 定制工作流, or wants to inspect customizable skills. Capable of discovering customizable agent and workflow surfaces, composing sparse TOML overrides, writing team or user customization files, and verifying merge results."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Customize 将用户意图转换为 `{speclite-runtime-root}/custom/` 下正确放置的 TOML override。它支持探索可定制 Skill、选择 agent/workflow surface、生成稀疏 override、写入 team 或 user 文件，并验证合并结果。

[核心能力]
    - **预检安装**：确认 `{project-root}/_speclite/` 和 runtime 脚本是否存在。
    - **可定制项发现**：运行 `scripts/list_customizable_skills.py` 扫描安装 Skill 的 `customize.toml`。
    - **surface 判断**：区分 `[agent]`、`[workflow]` 或双 surface，帮助用户选择正确覆盖面。
    - **稀疏 TOML 生成**：只写用户要改变的字段，不复制完整 `customize.toml`。
    - **team/user 放置**：将团队覆盖写入 `{speclite-runtime-root}/custom/{skill-name}.toml`，个人覆盖写入 `{skill-name}.user.toml`。
    - **合并验证**：优先使用 resolver，失败时按 base -> team -> user 手动解释合并结果。

[执行流程]
    1. 预检 `{project-root}/_speclite/`；缺失时说明 Speclite 未安装并停止。
    2. 读取 `{project-root}/_speclite/config.toml` 和 `config.user.toml` 获取 user_name 和 communication_language。
    3. 分类用户意图：directed、exploratory、audit/iterate 或 cross-cutting。
    4. exploratory 或 audit 场景运行 `python3 {skill-root}/scripts/list_customizable_skills.py --project-root {project-root}`，必要时追加 `--extra-root`。
    5. 读取目标 Skill 的 `customize.toml` 和已存在覆盖文件，判断应修改 agent surface、workflow surface 或多个 workflow。
    6. 生成稀疏 TOML，先展示完整内容和 diff，等待用户明确确认。
    7. 写入 `{speclite-runtime-root}/custom/` 下 team 或 user 覆盖文件。
    8. 运行 `python3 {speclite-runtime-root}/scripts/resolve_customization.py --skill <install-path> --key <agent-or-workflow>` 验证；失败时手动合并并解释。
    9. 总结写入位置、变更字段和后续迭代方式。

[注意事项]
    - `{speclite-runtime-root}` = `{project-root}/_speclite`。
    - 中央 config 覆盖不属于 per-skill customize，需明确说明边界。
    - 如果目标 `customize.toml` 没暴露用户想改的字段，必须如实说明，不得发明字段。
    - Override 必须稀疏，只包含用户确认的字段。
    - 写文件前必须展示内容并获得明确确认。

