# Experiments（尝试记录）

## Attempt 1（尝试 1）：先做只读递归审计

- 时间：2026-05-28
- 方案：用脚本递归扫描三个目标目录的 `SKILL.md` / `SKILL.en.md`，只读取 YAML frontmatter 的 `description` 字段，先不改文件。
- 原因：目标文件数量多，且工作树已有大量既有变更；先用确定性审计避免凭印象改错范围。
- 结果：发现 81 个现有入口文件；中文入口普遍为英文主描述夹中文触发词，英文入口普遍混入中文触发词，均需要规范化。

## Attempt 2（尝试 2）：机械化替换 description 字段

- 时间：2026-05-28
- 方案：为 81 个现有入口文件逐一准备符合三段式的中英文 `description`，用脚本只替换 YAML frontmatter 中的单行 `description:`。
- 原因：需要覆盖所有入口且只改一个字段，脚本化替换能降低漏改和误改正文的风险。
- 结果：已替换 81 个 `description` 字段；复查结果为 `flagged: 0`，未发现中文入口超 200 字、英文入口含中文、英文入口超 1024 字或三段式关键词缺失。

## Attempt 3（尝试 3）：最终校验

- 时间：2026-05-28
- 方案：再次运行 description 规则审计、Ruby YAML frontmatter 解析检查，以及限定路径的 `git diff --check`。
- 原因：确认双引号 YAML 字符串可解析，并确认本次相关路径没有 whitespace/error marker 问题。
- 结果：description 审计 `flagged: 0`；YAML 解析 `bad: 0`；`git diff --check` 通过。
