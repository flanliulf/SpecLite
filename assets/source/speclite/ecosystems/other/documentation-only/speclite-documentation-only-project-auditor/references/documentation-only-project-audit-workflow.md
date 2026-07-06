# Documentation-only Project Audit Workflow（纯文档项目审计流程）

## Evidence（证据）

优先读取目标项目中的 `docs/`、README、style guide、index、package metadata、site config、assets、links、CI/docs scripts 和 publishing instructions。是否属于 documentation-only project 必须基于项目文件、交付物和用户说明判断。

## Review Dimensions（审查维度）

- Project boundary：主要交付物、runtime absence、docs source root、publishing target。
- Docs source：`docs/`、README、index、style guide、navigation、templates、assets。
- Diataxis map：tutorials、how-to、explanation、reference、glossary 和 release notes 的职责。
- Package-facing docs：npm/GitHub README、examples、API reference、support policy。
- Link and render readiness：internal links、anchors、images/media、GitHub/npm rendering、future docs tooling。
- Handoff：写作、迁移或治理任务分别转交 `speclite-write-opensource-docs` 或 `speclite-agent-docs-steward`。

## Output（输出）

输出 Markdown 应包含 `Evidence Summary（证据摘要）`、`Docs Source Map（文档源地图）`、`Diataxis Boundary（Diataxis 边界）`、`Link And Render Readiness（链接与渲染就绪度）`、`Unknowns（未知项）` 和 `Handoff（交接）`。
