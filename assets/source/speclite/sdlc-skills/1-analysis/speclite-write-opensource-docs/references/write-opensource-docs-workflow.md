# Write OpenSource Docs Workflow（开源文档写作流程）

## Step 1：识别任务模式

根据用户请求选择一个主模式：

| Mode | 触发场景 | 输出 |
|---|---|---|
| `assess` | 评估 `docs/` 目录定位、结构、内容是否合理 | 评估结论和建议 |
| `scaffold` | 创建目录结构、索引和占位页 | 新增目录和 Markdown 文件 |
| `write` | 编写或补全单篇/多篇文档 | 文档正文和索引更新 |
| `migrate` | 迁移旧文档、拆分混合文档或调整路径 | 迁移后的文档和兼容入口 |
| `validate` | 检查规范、链接、渲染和索引 | 验证报告 |

如果同一请求包含多个模式，按 `assess -> scaffold -> write -> validate` 顺序执行。

## Step 2：读取项目事实

先读取可以直接发现的事实，不向用户询问可通过仓库得到的信息。

必读项：

- `docs/` 当前文件树。
- `docs/index.md`。
- 项目 `docs/_STYLE_GUIDE.md`；如果不存在，读取 `references/docs-style-guide-baseline.md`。
- README 或 package-facing 文档入口。
- `package.json` 中的 package name、files、scripts、homepage。
- 与文档主题相关的源码、CLI、schema、fixture 或 canonical source。

输出判断必须明确区分：

- 当前已实现的事实。
- 当前缺失但计划中的目标规范。
- 用户刚确认的偏好。
- 仍需用户选择的高影响取舍。

文档规范优先级：

1. 项目 `docs/_STYLE_GUIDE.md`。
2. 本 Skill 内置 `references/docs-style-guide-baseline.md`。
3. 用户本轮明确指令。

如果使用内置 baseline，必须在交付总结中说明项目侧规范缺失，并建议后续落盘 `docs/_STYLE_GUIDE.md`。

## Step 3：确定文档类型

按 `diataxis-doc-types.md` 分类：

| 用户目标 | 文档类型 |
|---|---|
| 从零学习完整路径 | Tutorial |
| 完成一个具体任务 | How-To |
| 理解概念、架构、原理和设计取舍 | Explanation |
| 快速查命令、字段、目录、配置、catalog | Reference |
| 查询术语短定义 | Glossary |

如果用户要求“整体文档体系”或“官网文档模块”，先规划 `docs/index.md` 和目录职责，再进入单篇文档。

## Step 4：生成或更新文档

使用 `assets/` 中的模板。生成时遵守：

- 正文中文，章节标题 English（中文）。
- 技术标识保留英文。
- GitHub/npm 友好 Markdown。
- 不使用 Starlight-only `:::note`、`:::tip`、`:::caution`。
- 需要提示块时使用 `> Note:`、`> Tip:`、`> Caution:`。
- 表格单元格保持短句。
- 不为非代码内容使用 code block，目录树、命令、JSON 和配置示例除外。

## Step 5：同步索引和兼容入口

新增、迁移或重命名文档时：

- 更新 `docs/index.md`。
- 更新目录级 `index.md`。
- 如果 README、npm package `files` 或 quick-start 链接依赖旧路径，保留旧入口或同步 README。
- 旧 `docs/glossary/` 迁移到 `docs/reference/glossary/` 时，先保留跳转或索引说明。

不得让新文档成为孤岛。

## Step 6：验证

始终运行：

```sh
git diff --check
```

按可用性运行：

```sh
npm test
npm run release:check
```

仅当 `package.json` 已定义时运行：

```sh
npm run docs:fix-links
npm run docs:validate-links
npm run docs:build
```

若 docs tooling 尚未实现，应在总结中明确“目标规范已记录，脚本尚未接入”。

## Step 7：交付总结

总结包含：

- 修改的文档类型。
- 新增或更新的入口。
- README/package-facing 影响。
- 验证命令及结果。
- 未实现 tooling 或需人工确认的后续项。
