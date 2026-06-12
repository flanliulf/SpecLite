# Documentation Style Guide（文档规范）

本文定义项目 `docs/` 的目录职责、文档类型、结构模板和校验目标。

## Rendering Target（渲染目标）

当前主要渲染目标：

| Target | Status |
|---|---|
| GitHub | 当前目标 |
| npm | 当前目标 |
| Docs site renderer | 后续目标 |

## Documentation Types（文档类型）

| Type | Purpose | Directory |
|---|---|---|
| Tutorial | 学习导向 | `docs/tutorials/` |
| How-To | 任务导向 | `docs/how-to/` |
| Explanation | 理解导向 | `docs/explanation/` |
| Reference | 查阅导向 | `docs/reference/` |
| Glossary | 术语定义 | `docs/reference/glossary/` |

## Markdown Rules（Markdown 规则）

- 正文中文。
- 章节标题使用 English（中文）。
- 技术标识保留英文。
- 当前不使用 Starlight-only admonition。
- 新增文档时同步索引。

## Target Tooling（目标工具）

以下命令是目标规范。只有接入 `package.json` 后才能作为当前门禁。

```sh
npm run docs:fix-links
npm run docs:validate-links
npm run docs:build
```
