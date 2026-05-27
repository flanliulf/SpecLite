# Activation Flow（激活流程）

> 本 Skill 在被触发后必须先完整执行下述 6 步激活，激活完成才进入主工作流（参见 `workflow-steps.md`）。

## 约定

- `{skill-root}` 解析为本 skill 的安装目录（即 `customize.toml` 所在位置）。
- `{project-root}` 前缀路径相对于目标项目工作目录解析。
- `{speclite-runtime-root}` 解析为目标项目安装后的 SpecLite 运行目录，即 `{project-root}/_speclite`。
- `{skill-name}` 解析为 skill 目录的 basename（即 `speclite-dev-story`）。
- `speclite resolve config --project-root {project-root}` 是运行时配置入口，按 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 顺序解析四层合并结果；Skill 目录中的 `config.toml.example` 仅作字段结构参考，不参与运行时读取。

## Activation Step 1：解析 Workflow 配置块

- 执行：`speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`
- 如脚本失败，按 base → team → user 顺序读取以下三个文件，并应用与解析器相同的结构化合并规则自行解析 `workflow` 块：
    1. `{skill-root}/customize.toml`（默认值）
    2. `{speclite-runtime-root}/custom/{skill-name}.toml`（团队覆盖）
    3. `{speclite-runtime-root}/custom/{skill-name}.user.toml`（个人覆盖）
- 任何缺失文件直接跳过。合并规则：
    · 标量：覆盖
    · 表：深度合并
    · 以 `code` 或 `id` 为键的"表数组"：按键替换匹配项并追加新项
    · 其他数组：追加

## Activation Step 2：执行前置激活步骤

- 按顺序执行 `{workflow.activation_steps_prepend}` 中的每一项

## Activation Step 3：加载持久事实

- 把 `{workflow.persistent_facts}` 中的每一项作为贯穿整个工作流运行期的基础上下文
- 前缀为 `file:` 的条目是位于 `{project-root}` 下的路径或 glob —— 加载所引用的文件内容作为事实
- 其他条目作为字面事实使用

## Activation Step 4：加载配置

- 执行：`speclite resolve config --project-root {project-root}`
- 从 stdout resolved JSON 中读取下列字段。若命令失败、required base config 缺失或关键字段为空，应提示用户先初始化/补全配置并 HALT，不得回退读取 Skill 定义目录中的 `config.toml.example`：
    · `project_name`、`user_name`
    · `communication_language`、`document_output_language`
    · `user_skill_level`
    · `output_folder`
    · `implementation_artifacts`
- `date` 使用系统当前日期时间，不从 config resolver stdout 读取。

## Activation Step 5：问候用户

- 用 `{communication_language}` 向 `{user_name}` 打招呼

## Activation Step 6：执行后置激活步骤

- 按顺序执行 `{workflow.activation_steps_append}` 中的每一项

激活完成后，进入 `workflow-steps.md` 描述的主工作流。
