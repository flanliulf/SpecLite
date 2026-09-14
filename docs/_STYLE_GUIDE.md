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
| 每篇文档控制标题数量 | 最多 12 个 `##`（`docs:check` 强制），每个 `##` 下通常 2-3 个 `###`。Tutorial 的 `## Step N` 系列合计算作一个小节；`quick-start.md`、`README.md`、`_STYLE_GUIDE.md` 与 `reference/glossary/epics/` 豁免。 |
| 表格单元格长度 | 单元格不超过 320 个字符（`docs:check` 强制）；更长的规约下沉到正文段落或 owning document。 |
| 不写本机绝对路径 | 不出现以 macOS、Linux 或 Windows 用户目录开头的本机路径；示例使用 `<project-root>`、`example-project` 或 project-relative path。 |

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
| `tutorials/speclite-orientation.md` | 用最小心智模型帮助初学者理解产品职责、核心概念和学习路径。 |
| `tutorials/speclite-developer-training.md` | 将多篇材料组织成有顺序、实验和验收标准的开发者培训。 |
| `tutorials/first-install-walkthrough.md` | 从安装 SpecLite 到完成首次验证。 |
| `tutorials/first-brownfield-project.md` | 在既有项目中完成第一次 brownfield baseline。 |

## Distribution Entrypoint（发布入口）

`docs/quick-start.md` 是随 npm package 发布的自包含操作入口，不是 Compatibility Entry。它必须只引用 `package.json.files` 中实际发布的文件，并以“适用于携带本文的 package version”表达版本范围，不手工写死 package version。

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

Research Note（调研笔记）是 Explanation 的一个变体：记录外部工具或候选设计在某个日期的可观察事实，不构成 public contract。它必须在标题后标记：

```md
> Status: Research Note（调研笔记）。本文记录的是外部工具在本机的可观察行为与候选设计，不是 SpecLite 的 public contract。
```

适合主题：

| 文档 | 用途 |
|---|---|
| `explanation/local-first-control-plane.md` | 解释 SpecLite 为什么是 local-first CLI control plane。 |
| `explanation/speclite-modules.md` | 解释 Module 的安装组织、配置、依赖和 runtime contract。 |
| `explanation/flow-gate-handoff-pitfalls.md` | 解释 Flow Gate handoff 各角色的位置与常见误解。 |
| `explanation/runtime-boundaries.md` | 解释 canonical source、IDE mirrors、`_speclite`、`_speclite-output` 的边界。 |
| `explanation/file-ownership-model.md` | 解释 installer-owned、human-owned、workflow-owned 的保护模型。 |

## Reference（参考）

Reference 是信息导向文档，用于快速查阅稳定技术规格。

Reference 文档回答“是什么”“怎么调用”“字段是什么”，不展开解释“为什么”。需要概念深度时，链接到 `explanation/`。

`reference/specs/` 是 Reference 的规范性说明子类型，只承载已被当前实现采用、对实现和外部消费者具有规范效力、并具备 executable anchors 的公共契约。

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

## Epic Glossaries（Epic 术语表）

`reference/glossary/epics/` 收录由 `speclite-terminology-governance` 从规划产物生成的过程术语表。它们只登记在该目录的 `index.md`，不进入 `docs/index.md` 或读者术语表首页；不作为 public contract 事实来源；豁免 `##` 数量上限，但仍遵守其余 Markdown 规则。

## Draft Publication（草稿发布）

未达到最低可发布标准的页面必须在标题后标记：

```md
> Status: Draft（草稿）。本文尚未达到最低可发布标准，因此不进入读者索引。
```

Draft 可以保留在原分类目录中，但不得进入 `docs/index.md` 或子目录 `index.md`。达到明确目标、事实依据、核心内容、可验证结果或稳定字段、相关文档这些最低要求后，才能移除标记并恢复索引。

## Moved Entries（迁移入口）

重命名或迁移已公开的文档时，在旧路径保留一个 Moved 兼容页，只含标题、状态行和指向新位置的链接，不承载正文与小节：

```md
# Old Title（旧标题）

> Status: Moved（已迁移）。本文已迁移到 [`new-name.md`](new-name.md)；本路径仅保持旧链接可用。
```

Moved 页与 `docs/glossary/` 下的 Frozen Compatibility 页一样，豁免 `Related Documents（相关文档）`、最近父索引与可达性要求，但 `docs:check` 会要求它们链接到一个非 Draft 的主要公开文档，并禁止出现 `##` 小节。

## Generated Footer（生成说明页脚）

由 Skill 生成初稿的文档可以在文件末尾保留一行生成说明，格式固定为：

```md
> Generated by（生成说明）：本文初稿由 `speclite-agent-docs-steward` Skill 生成；后续以人工维护的正文为准。
```

它必须是文件的最后一个非空行，位于 `Related Documents（相关文档）` 之后；不使用其它措辞或斜体形式，`docs:check` 会拒绝非此形式的“由 … Skill 生成”页脚。

## Related Documents（相关文档）

除 index、Draft、Frozen Compatibility 和 Distribution Entrypoint 外，主要公开文档必须在末尾区域提供带关系类型的表格：

```md
## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 规范性说明 | [`specs/example-contract.md`](specs/example-contract.md) |
| 概念解释 | [`../explanation/example.md`](../explanation/example.md) |
```

链接关系必须表达前置、下一步、概念解释、技术参考或契约依据之一，不能只为对称而添加反向链接。

## Docs Tooling（文档工具）

当前统一检查入口是：

```sh
npm run docs:check
```

检查职责：

| Check | Responsibility |
|---|---|
| Link and fragment | 校验 `docs/` 与根 `README.md` 的相对链接、heading fragment、图片和 HTML entry。 |
| Reachability | 校验主要公开 Markdown 可以从 `docs/index.md` 到达，且被最近父目录的 `index.md` 列出。 |
| Boundary | 校验 package Quick Start 与根 `README.md` 只用相对链接引用发布包文件；Frozen / Moved 兼容页指向主要公开文档且不含小节。 |
| Publication | 阻止 Draft 被读者索引列出。 |
| Relationships | 校验主要公开正文包含 `Related Documents（相关文档）`。 |
| Style | 校验无 horizontal rule、无 `####`、`##` 不超过 12 个、单元格不超过 320 字符、无本机绝对路径、无 Starlight admonition、生成说明页脚格式。 |

没有文档站点之前不提供虚构的 `docs:build`；自动修复命令等出现稳定重复需求后再增加。
