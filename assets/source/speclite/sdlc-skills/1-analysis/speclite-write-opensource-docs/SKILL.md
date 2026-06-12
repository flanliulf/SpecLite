---
name: speclite-write-opensource-docs
description: "编写和维护开源项目 docs 目录文档，覆盖 tutorials、how-to、explanation、reference、glossary、docs index 和 style guide。用于用户要求 open source docs、write docs、docs scaffold、Diataxis、GitHub/npm 文档、开源文档、文档目录、教程、操作指南、概念说明或参考文档。核心能力：审计真实仓库、分类文档类型、生成 GitHub/npm 友好 Markdown、同步索引和验证文档体系。"
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    本 Skill 用于编写和维护开源项目的 `docs/` 目录文档。它把 `docs/` 视为面向 GitHub、npm 和未来官网站点的公开文档源，按 Diataxis 区分 Tutorials、How-To、Explanation、Reference 和 Glossary，并保持 README、package surface、索引和渲染约束一致。

[Core Capabilities（核心能力）]
    - **Repo 证据审计**：先读取真实 `docs/`、README、package metadata、CLI/API surface 和现有规范；项目规范缺失时使用内置 style guide baseline。
    - **Diataxis 分类**：将请求归入 tutorial、how-to、explanation、reference 或 glossary，并按对应结构写作。
    - **目录脚手架**：创建或补齐 `docs/tutorials`、`docs/how-to`、`docs/explanation`、`docs/reference`、`docs/reference/glossary` 等结构。
    - **GitHub/npm 友好写作**：使用 CommonMark / GitHub Flavored Markdown，不生成 Starlight-only admonition 语法。
    - **索引同步**：新增、迁移或重命名文档时同步 `docs/index.md`；影响 package-facing 入口时同步 README 或保留兼容入口。
    - **规范沉淀**：创建和维护 `docs/_STYLE_GUIDE.md`，明确目录职责、模板、校验目标和后续 docs tooling 缺口。
    - **质量验证**：检查文档类型边界、链接、旧入口、渲染约束、目标 tooling 声明和泛化内容外迁边界。

[Workflow（执行流程）]
    详细执行流程见 `references/write-opensource-docs-workflow.md`。入口流程如下：

    1. 判断任务模式：`assess`、`scaffold`、`write`、`migrate` 或 `validate`。
    2. 读取项目事实：`docs/` 文件树、`docs/index.md`、项目 `docs/_STYLE_GUIDE.md` 或 `references/docs-style-guide-baseline.md`、README、package metadata 和相关源码入口。
    3. 依据 `references/diataxis-doc-types.md` 选择文档类型；高影响分类不明确时，先向用户询问。
    4. 根据模式生成或修改文档，使用 `assets/` 中对应模板。
    5. 同步索引和兼容入口，避免新文档成为孤岛。
    6. 运行可用验证命令；`npm run docs:*` 仅在 `package.json` 已存在对应脚本时运行。
    7. 总结 touched files、文档类型、未实现 tooling 和剩余风险。

[Notes（注意事项）]
    - `docs/` 是公开项目文档源，不替代 `_bmad-output/`、`_speclite-output/` 或 `assets/source/speclite/`。
    - Reference 回答“是什么、字段是什么、怎么调用”；Explanation 回答“为什么、如何工作、设计取舍是什么”。
    - Tutorials 面向新手完整学习路径；How-To 面向已有基础用户解决具体任务。
    - 当前主要渲染目标是 GitHub 和 npm，提示块使用 blockquote 形式，例如 `> Note:`、`> Tip:`、`> Caution:`。
    - 文档规范优先级为项目 `docs/_STYLE_GUIDE.md` > 本 Skill 内置 `references/docs-style-guide-baseline.md` > 用户本轮明确指令。
    - 目标 docs tooling 可以写入规范，但在脚本未接入 `package.json` 前，不得声称它们是当前可运行门禁。
    - 泛化 AI Coding 思想或与当前项目事实无关的长篇理念文档，应迁出项目 `docs/` 或标为外部参考，不混入官网文档源。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/sdlc-skills/1-analysis/speclite-write-opensource-docs/` 与实际安装副本。
