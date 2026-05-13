---
name: speclite-dev-story
description: "Execute story implementation following a context filled story spec file as the developer agent. Use when user mentions 'dev this story', 'dev story', 'implement story', 'implement the next story in the sprint plan', 'develop story file', '开发 Story', '实现 Story', '执行 Story 实现', '继续开发 Story', '开发下一个 Story', '实现故事', '编码实现 Story', or provides a story file path. Capable of customize.toml three-tier resolution and config-driven activation, sprint-status driven story discovery and review-continuation detection, red-green-refactor implementation with multi-level testing and HALT triggers, definition-of-done validation per references/checklist.md, sprint-status synchronization preserving comments, and on_complete terminal directive execution."
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
metadata:
    version: "1.0.2"
    author: "fancyliu"
    catalog: "speclite"
---

[技能说明]
    Story 实现执行引擎，承担 SpecLite 实现阶段的开发者角色：依据已填充上下文的 Story 规格文件，按顺序执行任务/子任务，遵循红-绿-重构循环完成实现、测试、回归与 Definition of Done 校验，最终把 Story 标记为 `review`。

    **角色约定（Developer）**：
    - 所有响应使用 `{communication_language}`，语言风格按 `{user_skill_level}` 调整；所有文档使用 `{document_output_language}` 生成
    - **只能**修改 Story 文件的：Tasks/Subtasks 复选框、Dev Agent Record（Debug Log、Completion Notes）、File List、Change Log、Status
    - 严格按 Step 顺序执行，禁止跳过；**绝对禁止**因"里程碑"或"会话边界"停止；除非触发 HALT 条件或用户另有指示，必须一次执行内完成 Story
    - `{user_skill_level}` 仅影响对话风格，**不影响**代码更新内容

[核心能力]
    - **三层 customize 解析与配置激活**：执行 `{speclite-runtime-root}/scripts/resolve_customization.py` 解析 `workflow` 块，失败时按 base→team→user 合并 `customize.toml` / `{skill-name}.toml` / `{skill-name}.user.toml`；加载 `persistent_facts`（支持 `file:` 前缀）；从 `{project-root}/_speclite/config.toml` 解析 `project_name` / `user_name` / `communication_language` / `document_output_language` / `user_skill_level` / `implementation_artifacts` / `date`。详见 `references/activation.md`
    - **Story 自动发现与评审延续检测**：支持显式 `{story_path}`；否则按从头到尾顺序扫描 `sprint-status.yaml` `development_status` 找第一条 `ready-for-dev` 且 key 形如 `数字-数字-名称` 的 Story；无 sprint-status 时直接搜索 `{implementation_artifacts}`；检测 "Senior Developer Review (AI)" 与 "Review Follow-ups (AI)" 段并提取结论、未完成项、严重度
    - **测试驱动实现与质量门**：严格按红-绿-重构循环（先写失败测试 → 最小代码使其通过 → 在测试保持绿色下重构）；编写单元/集成/端到端测试；运行已有测试集杜绝回归、运行新测试、运行 lint/静态检查；按 Acceptance Criteria 显式量化校验
    - **HALT 与 DoD 校验**：HALT 触发器为依赖越界、连续 3 次实现失败、必要配置缺失；按 `references/checklist.md` 执行 DoD；测试未真实存在并通过时**绝不**标记 `[x]`
    - **Sprint 状态同步**：开始时 `ready-for-dev → in-progress`；完成时 `in-progress → review`；**保留 sprint-status.yaml 全部注释与结构**（含 STATUS DEFINITIONS）；评审跟进任务 `[AI-Review]` 必须在 Review Follow-ups 段与 Senior Developer Review → Action Items 段**双向勾选**
    - **on_complete 终止指令**：完成沟通后解析并执行 `workflow.on_complete`，作为退出前的最终终端指令

[约定]
    - 裸路径（如 `references/checklist.md`、`references/workflow-steps.md`）相对于 skill 根目录解析
    - `{skill-root}` 解析为本 skill 安装目录（即 `customize.toml` 所在位置）
    - `{project-root}` 前缀路径相对于项目工作目录解析
    - `{speclite-runtime-root}` 解析为目标项目安装后的 SpecLite 运行目录，即 `{project-root}/_speclite`
    - `{skill-name}` 解析为 skill 目录的 basename（即 `speclite-dev-story`）

[执行流程]
    本 Skill 在被触发后必须先执行**激活流程**，再进入主工作流。两者均在 `references/` 中保留权威定义，本节给出概要与跳转入口。

    === 激活流程（必须先执行）===
        参见 `references/activation.md`，依次完成 6 步：
        1. 解析 `workflow` 配置块（脚本失败时按 base→team→user 合并三份 toml）
        2. 执行 `{workflow.activation_steps_prepend}`
        3. 加载 `{workflow.persistent_facts}`（`file:` 前缀按路径/glob 加载文件内容）
        4. 从 `{project-root}/_speclite/config.toml` 加载配置
        5. 用 `{communication_language}` 问候 `{user_name}`
        6. 执行 `{workflow.activation_steps_append}`

    === 主工作流（10 个 Step）===
        参见 `references/workflow-steps.md` 获取完整 Step、分支、输出话术与 HALT 条件。**严格按顺序执行，禁止跳过**：

        - **Step 1**：定位下一条就绪 Story 并完整加载（显式输入 / sprint-status 自动发现 / 直接搜索三分支）
        - **Step 2**：加载项目上下文（`{project_context}`）与 Story Dev Notes 信息
        - **Step 3**：检测评审延续，提取评审结论、未完成项与严重度，设置 `review_continuation` 与 `{pending_review_items}`
        - **Step 4**：把 Story 状态从 `ready-for-dev` 同步为 `in-progress`（无 sprint-status 时设 `{current_sprint_status}` = `no-sprint-tracking`）
        - **Step 5**：按红-绿-重构循环实现当前任务/子任务；技术方案写入 Dev Agent Record → Implementation Plan；触发 HALT 条件立即停止
        - **Step 6**：编写单元/集成/端到端测试，覆盖 Dev Notes 中的边界情况
        - **Step 7**：运行已有测试 + 新测试 + lint/静态检查；按 AC 显式量化校验；测试失败立即停止并修复
        - **Step 8**：全部校验门通过后才标记 `[x]`，更新 File List、Completion Notes；`[AI-Review]` 任务双向勾选；剩余任务回到 Step 5
        - **Step 9**：完整性核对 + 增强版 DoD 校验（详见 `references/checklist.md`）+ 把 sprint-status 同步为 `review`（保留全部注释与结构）；任意校验失败 HALT
        - **Step 10**：完成沟通、按 `{user_skill_level}` 讲解、建议下一步；最终解析并执行 `workflow.on_complete`

    === 路径 ===
        - `story_file` = ""（用户显式指定的 Story 路径；为空则自动发现）
        - `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`

[注意事项]
    - 名称、目录与 YAML `name` 字段保持 kebab-case 一致：`speclite-dev-story`
    - 激活流程的 6 步**必须**先于主工作流执行；缺失 `customize.toml` 文件可跳过，但合并规则不可省略
    - 必须从头到尾**完整读取** `sprint-status.yaml` 文件以保留顺序，禁止跳读
    - 红-绿-重构循环不可省略；HALT 触发器三者任一发生立即 HALT
    - **绝不**实现 Story 任务/子任务以外的内容；**绝不**在测试未真实存在并通过时把任务标为 `[x]`
    - `[AI-Review]` 任务必须在 Review Follow-ups 段与 Senior Developer Review → Action Items 段**双向勾选**
    - File List 必须包含**所有**新建/修改/删除文件，使用相对仓库根的路径
    - `sprint-status.yaml` 更新必须**保留所有注释与结构**（含 STATUS DEFINITIONS），禁止覆写为缩略版
    - Definition of Done 校验依据 `references/checklist.md`，缺一不可；任意 DoD 失败即 HALT
    - 收尾必须执行 `workflow.on_complete` 解析并按返回值执行最终指令
    - Skill 目录中的 `config.toml.example` 仅作为目标项目 `_speclite/config.toml` 字段结构参考，不得作为运行时 fallback
    - Step / 输出话术 / 分支 / 错误处理 的所有细节以 `references/workflow-steps.md` 与 `references/activation.md` 为准

[生成信息]
    本 Skill 由 skills-creator 自动生成。如需修改，建议同步更新 forge/ 和 .claude/skills/ 两份副本，或通过 skills-upgrade 管理版本。
