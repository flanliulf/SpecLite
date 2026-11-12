# SpecLite Concepts Primer（SpecLite 概念体系科普分享）

本分享面向研发工程师、架构师、技术负责人和项目交付负责人，用于在 20–30 分钟内讲清 SpecLite 的概念体系：它解决什么问题，Module、Skill、Agent、Workflow 是什么关系，SDLC 五阶段各产出什么，以及安装后如何上手。听众不需要用过 SpecLite。

| Item | Value |
|---|---|
| Format | 单页横向翻页 HTML deck（22 页：封面、导览、17 页正文、结束页与 2 页术语附录），配套 17 页 Markdown 分享稿 |
| Entry | deck：[`index.html`](index.html)；分享稿：[`speaker-script.md`](speaker-script.md) |
| Generated | `2026-11-11` |
| Scope | 只从使用者角度讲解；不涉及 CLI 内部实现和 SpecLite 自身的维护流程 |
| Role | Supplementary Public Material，不是规范来源 |

`index.html` 是按分享稿生成的单文件 HTML deck（瑞士国际主义风格，克莱因蓝 IKB 主题，生成于 `2026-11-12`），用浏览器直接打开即可：`←` `→` 翻页，`ESC` 总览，`P` 进入演讲者模式。17 页正文与分享稿逐页对应，页眉标注分享稿页码；分享稿每页的讲者备注已写入对应页的演讲者备注，四张 Mermaid 图在 deck 中用等价的 HTML 图示还原。`assets/motion.min.js` 是入场动效的本地副本；字体与图标从 CDN 加载，离线时回退到系统字体且不显示图标，内容仍可阅读。

内容以分享稿为准，deck 不新增分享稿没有的事实。分享稿每页列出的出处，以及末尾的实际阅读文档清单、原文事实与归纳的区分和撰写时发现的待确认事项，只保留在 [`speaker-script.md`](speaker-script.md) 中，不进入 deck。

分享稿中的关键事实必须与下列主要公开文档保持一致。发生冲突时，应修正分享稿；不能以分享稿覆盖 Reference、Explanation 或 Tutorial。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 演示目录 | [`../index.md`](../index.md) |
| 初学者导览 | [`../../tutorials/speclite-orientation.md`](../../tutorials/speclite-orientation.md) |
| 入口选择与 SDLC 路径 | [`../../explanation/skill-taxonomy-and-sdlc.md`](../../explanation/skill-taxonomy-and-sdlc.md) |
| SDLC 阶段源定义 | [`../../reference/sdlc-phases.md`](../../reference/sdlc-phases.md) |
| Agent 名录 | [`../../reference/skills/agent-roster.md`](../../reference/skills/agent-roster.md) |
| SDLC Workflow catalog | [`../../reference/skills/sdlc-workflows.md`](../../reference/skills/sdlc-workflows.md) |
| 文件所有权模型 | [`../../explanation/file-ownership-model.md`](../../explanation/file-ownership-model.md) |
| Workflow 产物目录 | [`../../reference/workflow-artifact-layout.md`](../../reference/workflow-artifact-layout.md) |
| 快速开始 | [`../../quick-start.md`](../../quick-start.md) |
