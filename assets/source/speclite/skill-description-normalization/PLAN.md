# Plan（计划）

## Scope（范围）

- 检查 `assets/source/speclite/core-skills/`、`assets/source/speclite/sdlc-skills/`、`assets/source/speclite/support-skills/` 下所有现有 canonical skill 源定义。
- 只修改现有 `SKILL.md` 与现有 `SKILL.en.md` frontmatter 中的 `description` 字段。
- 不创建缺失的 `SKILL.en.md`。
- 不改动 skill 正文、references、CHANGELOG、配置、测试 fixture 或其他无关文件。

## Rules（规则）

- `SKILL.md` 的 `description` 使用中文，允许少量触发名词、命令、文件后缀、专有技术术语保留英文。
- `SKILL.en.md` 的 `description` 使用英文。
- 每个 `description` 采用三段式：功能描述 + 触发条件 + 核心能力。
- 中文控制在 200 字以内，英文控制在 1024 字符以内。

## Steps（步骤）

1. 已完成：递归发现三个目标目录下的所有 `SKILL.md` 与 `SKILL.en.md`。
2. 已完成：提取每个文件 YAML frontmatter 中的 `description`，形成审计清单。
3. 已完成：标记语言不符合、结构不清晰、过长或缺少触发条件/核心能力的条目。
4. 已完成：仅对不合规 description 做定向改写。
5. 已完成：重新运行审计，确认语言、长度和三段式结构达标。
6. 已完成：运行 `git diff --check` 做基础格式校验，并汇总改动范围。

## Result（结果）

- 覆盖 81 个现有入口文件：`SKILL.md` 55 个，`SKILL.en.md` 26 个。
- 未创建缺失的 `SKILL.en.md`。
- 复查结果：语言、长度、三段式结构均通过。
- `git diff --check` 在本次相关路径上通过。
