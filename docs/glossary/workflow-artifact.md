# Workflow Artifact（Workflow 产物）

`Workflow Artifact（Workflow 产物）` 是已激活的 workflow 按配置约定位置输出的过程产物。

根据 PRD `FR23`，已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和 generatedAt。

MVP artifact contract 至少校验：

- artifact type
- 默认输出路径
- `workflowType`
- `sourceSkill`
- `generatedAt` 元数据字段

## Metadata Fields（元数据字段）

**workflowType**

表示生成该产物的 workflow 类型。MVP 中必须是非空稳定字符串，用于区分 research、planning、implementation、review 等过程产物类别。

**sourceSkill**

表示生成该产物的 canonical skill id。MVP 中必须是非空值，用于追踪产物来自哪个已安装的 source skill。

**generatedAt**

表示产物生成时间。MVP workflow artifact 必须包含该字段，且值必须是 ISO 8601 string。由于它依赖当前时间，默认应在 stable fixture snapshot comparison 中 normalize 或 exclude。

## Metadata Encoding（Metadata 编码）

Markdown workflow artifact 必须在文件开头使用 YAML frontmatter 写入 metadata。非 Markdown file artifact 必须在同一目录写出 `<artifact-filename>.metadata.json` sidecar。Directory artifact 必须在目录内写出 `metadata.json`。

这些 metadata files 与 artifact 本体一样属于 workflow-owned artifacts。Manifest/index 可以记录 metadata location，但不能替代 artifact 本身携带 metadata。

## MVP Boundary（MVP 边界）

MVP validation 只校验 artifact contract 的结构性要求，包括产物类型、默认输出路径和必要元数据字段。

产物正文质量不进入 MVP validation。也就是说，MVP 可以判断产物是否按约定生成、是否可追踪来源和生成时间，但不判断产物内容是否写得好、是否完整或是否满足人工质量标准。
