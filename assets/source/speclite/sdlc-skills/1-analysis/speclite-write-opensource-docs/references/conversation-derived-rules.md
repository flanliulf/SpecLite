# Conversation-Derived Rules（对话沉淀规则）

本文件记录本 Skill 从 SpecLite `docs/` 目录治理对话中沉淀的项目级写作规则。

## Docs Role（Docs 职责）

`docs/` 是 SpecLite 的官网文档源，用于承载面向使用者、开发者和维护者的公开项目文档。

`docs/` 不替代：

- `_bmad-output/` 研发过程产物。
- `_speclite-output/` workflow artifact repository。
- `assets/source/speclite/` canonical methodology package source。

## Content Spine（内容主线）

| 主线 | 推荐目录 |
|---|---|
| 用户采用 | `tutorials/`、`how-to/` |
| CLI control plane 工程实现 | `reference/`、`explanation/` |
| canonical methodology framework | `reference/`、`explanation/` |

## Rendering Target（渲染目标）

当前主要渲染目标是 GitHub 和 npm。

因此：

- 不使用 Starlight-only admonition。
- 使用 CommonMark / GitHub Flavored Markdown。
- 目标 docs tooling 可以记录，但未接入 `package.json` 前不能声称可运行。

## Compatibility（兼容性）

- `docs/quick-start.md` 是当前稳定入口，迁移到 `tutorials/quick-start.md` 前必须保留。
- 旧 `docs/glossary/` 可逐步迁移到 `docs/reference/glossary/`，迁移时保留回链。
- 新增 docs 页面时同步 `docs/index.md`。
- package-facing 入口变化时同步 README 或保留旧入口。

## Boundaries（边界）

- 泛化 AI Coding 思想或不依赖当前项目事实的长篇理念文档，不应放入本项目 `docs/`。
- 由当前实现、fixtures、canonical source 支撑的工程化解释可以放入 `docs/explanation/`。
- Reference 文档不展开深层原因；需要原因时链接到 Explanation。
