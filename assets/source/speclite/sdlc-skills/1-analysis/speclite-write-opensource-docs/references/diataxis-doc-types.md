# Diataxis Doc Types（Diataxis 文档类型）

## Tutorial（教程）

Tutorial 是学习导向文档，帮助新用户从零完成一条完整路径。

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

## How-To（操作指南）

How-To 是任务导向文档，帮助已有基础的用户解决一个明确问题。

标准结构：

1. Title + Hook（使用某个命令或 workflow 完成某个任务）
2. When to Use This（何时使用）
3. When to Skip This（何时跳过，可选）
4. Prerequisites（前置条件）
5. Steps（编号步骤）
6. What You Get（产出物）
7. Example（示例，可选）
8. Tips（提示，可选）

## Explanation（概念说明）

Explanation 是理解导向文档，解释概念、架构、原理和设计取舍。

标准结构：

1. Title + Hook（解释对象）
2. Overview / Definition（定义和重要性）
3. Key Concepts（关键概念）
4. Comparison Table（对比表，可选）
5. When to Use / When Not to Use（适用边界，可选）
6. Diagram（图示，可选，每篇最多 1 个 Mermaid 图）

## Reference（参考）

Reference 是信息导向文档，提供稳定技术规格和快速查阅入口。

常见类型：

| 类型 | 用途 |
|---|---|
| Index / Landing | 分类索引页面 |
| Catalog | 项目目录 |
| Deep-Dive | 单个项目深度解析 |
| Configuration | 配置选项参考 |
| Glossary | 术语定义 |
| Comprehensive | 综合参考 |

## Glossary（术语表）

Glossary 属于 Reference 类型。

规则：

- 使用分类 `##` 标题。
- 术语放在表格中，不为每个术语创建单独标题。
- 术语名加粗。
- 定义控制在 1-2 句。
- 长解释链接到 `explanation/`。

## Decision Table（决策表）

| 类型 | 导向 | 示例问题 |
|---|---|---|
| Tutorial | 学习 | 如何从零安装并首次使用？ |
| How-To | 任务 | 如何验证安装？ |
| Explanation | 理解 | 为什么 runtime 要分成四层？ |
| Reference | 查阅 | CLI 参数是什么？ |
| Glossary | 术语 | workflow artifact 是什么？ |
