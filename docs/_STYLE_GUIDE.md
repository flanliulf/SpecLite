# Documentation Style Guide（文档规范）

本规范定义 SpecLite `docs/` 的目录职责、文档类型、结构模板和后续校验目标。

当前主要渲染目标是 GitHub 和 npm，因此文档必须优先使用可稳定渲染的 CommonMark / GitHub Flavored Markdown。暂不使用 Starlight-only admonition 语法。

## Scope（适用范围）

本规范适用于 `docs/` 下的公开项目文档，包括 tutorial、how-to、explanation、reference 和 glossary 文档。

本规范不直接约束 `_bmad-output/` 下的研发过程产物，也不直接约束 `assets/source/speclite/` 下的 canonical skill package 内容。

## Language Rules（语言规则）

| 项目 | 规范 |
|---|---|
| 对话和文档正文 | 中文 |
| 章节标题 | English（中文）形式 |
| 命令、路径、字段、schema、issue id | 保留英文技术标识 |
| 专有技术术语 | 保留英文，必要时首次出现补中文解释 |

## Markdown Rules（Markdown 规则）

| 规则 | 说明 |
|---|---|
| 不使用 horizontal rule | 避免用 `---` 分割正文流。 |
| 不使用 `####` 标题 | 需要更细层级时，改用短段落、列表或表格。 |
| 避免深层嵌套列表 | 拆成新的小节或表格。 |
| 非代码内容不用 code block | 目录树、命令、JSON、配置示例可以使用 code block。 |
| 表格单元格保持短句 | 每个单元格通常 1-2 句。 |
| 每篇文档控制标题数量 | 通常 8-12 个 `##`，每个 `##` 下最多 2-3 个 `###`。 |

## Callouts（提示块）

当前不使用 Starlight `:::note` / `:::tip` / `:::caution` 语法。

GitHub 和 npm 友好的写法如下：

> Note: 用于补充上下文、前置条件或短例子。

> Tip: 用于快捷路径、最佳实践或常用选择。

> Caution: 用于潜在风险、破坏性操作或容易误解的边界。

每个主要小节最多使用 1-2 个提示块。Tutorial 可以在较长的主要任务区块中使用更多提示块，但应保持克制。

## Tutorials（教程）

Tutorial 是学习导向文档，用于带新用户从零完成一条完整路径。

标准结构：

1. Title + Hook（标题和结果导向开场）
2. What You'll Learn（你会学到什么）
3. Prerequisites（前置条件）
4. Quick Path（快速路径）
5. Understanding Topic（背景理解）
6. Step 1 / Step 2 / Step 3（主要步骤）
7. What You've Accomplished（完成结果）
8. Quick Reference（快速参考）
9. Common Questions（常见问题）
10. Key Takeaways（关键要点）

适合主题：

| 文档 | 用途 |
|---|---|
| `tutorials/quick-start.md` | 从安装 SpecLite 到完成首次验证。 |
| `tutorials/first-brownfield-project.md` | 在既有项目中完成第一次 brownfield baseline。 |

## How-To Guides（操作指南）

How-To 是任务导向文档，用于解决一个明确问题。

标准结构：

1. Title + Hook（使用某个命令或 workflow 完成某个任务）
2. When to Use This（何时使用）
3. When to Skip This（何时跳过，可选）
4. Prerequisites（前置条件）
5. Steps（编号步骤）
6. What You Get（产出物）
7. Example（示例，可选）
8. Tips（提示，可选）

适合主题：

| 文档 | 用途 |
|---|---|
| `how-to/install-speclite.md` | 安装 SpecLite 到目标项目。 |
| `how-to/validate-installation.md` | 验证安装状态并读取结果。 |
| `how-to/update-and-repair.md` | 生成 update plan 并执行安全修复。 |
| `how-to/customize-a-skill.md` | 修改项目级或用户级 customization。 |

## Explanation（概念说明）

Explanation 是理解导向文档，用于解释概念、架构、原理和设计取舍。

标准结构：

1. Title + Hook（解释对象）
2. Overview / Definition（定义和重要性）
3. Key Concepts（关键概念）
4. Comparison Table（对比表，可选）
5. When to Use / When Not to Use（适用边界，可选）
6. Diagram（图示，可选，每篇最多 1 个 Mermaid 图）

适合主题：

| 文档 | 用途 |
|---|---|
| `explanation/local-first-control-plane.md` | 解释 SpecLite 为什么是 local-first CLI control plane。 |
| `explanation/canonical-methodology-framework.md` | 解释 canonical 方法论源包和工程化框架。 |
| `explanation/runtime-boundaries.md` | 解释 canonical source、IDE mirrors、`_speclite`、`_speclite-output` 的边界。 |
| `explanation/file-ownership-model.md` | 解释 installer-owned、human-owned、workflow-owned 的保护模型。 |

## Reference（参考）

Reference 是信息导向文档，用于快速查阅稳定技术规格。

Reference 文档回答“是什么”“怎么调用”“字段是什么”，不展开解释“为什么”。需要概念深度时，链接到 `explanation/`。

常见类型：

| 类型 | 用途 | 示例 |
|---|---|---|
| Index / Landing | 分类索引页面 | `reference/index.md` |
| Catalog | 项目目录 | `reference/skills/index.md` |
| Deep-Dive | 单个项目深度解析 | `reference/cli.md` |
| Configuration | 配置选项参考 | `reference/config-and-customization.md` |
| Glossary | 术语定义 | `reference/glossary/index.md` |
| Comprehensive | 综合参考 | `reference/skills/sdlc-workflows.md` |

标准字段：

| 字段 | 说明 |
|---|---|
| Skill | canonical skill id 或路径。 |
| Agent | 关联 persona 或执行角色。 |
| Input | 主要输入。 |
| Output | 主要输出。 |
| Description | 一句话说明用途。 |

## Glossary（术语表）

Glossary 属于 Reference 类型，用于短定义和快速查阅。

规则：

- 使用分类 `##` 标题。
- 术语放在表格中，不为每个术语创建单独标题。
- 术语名加粗。
- 定义控制在 1-2 句。
- 不用 “A term is...” 或 “This is...” 开头。
- 长解释链接到 `explanation/`。

表格格式：

```md
## Runtime（运行时）

| Term | Definition |
|---|---|
| **canonical source** | SpecLite 方法论内容的权威来源，定义 installer 应安装什么。 |
| **workflow artifact** | workflow 按配置输出的过程产物，记录来源 skill 和生成时间。 |
```

## Target Tooling（目标工具）

后续应补充 docs tooling，并把以下命令接入 `package.json`。

这些命令是目标规范，不是当前已实现的提交门禁。

```sh
npm run docs:fix-links
npm run docs:fix-links -- --write
npm run docs:validate-links
npm run docs:build
```

目标职责：

| 命令 | 目标职责 |
|---|---|
| `npm run docs:fix-links` | 预览 Markdown link 格式修复。 |
| `npm run docs:fix-links -- --write` | 应用 Markdown link 格式修复。 |
| `npm run docs:validate-links` | 校验文档内部链接和相对路径。 |
| `npm run docs:build` | 构建未来文档站点或执行等价渲染检查。 |
