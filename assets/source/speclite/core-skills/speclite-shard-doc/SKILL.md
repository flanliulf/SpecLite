---
name: speclite-shard-doc
description: "Split large markdown documents into smaller organized files by heading sections using markdown-tree-parser. Use when user says shard document, split markdown, explode docs, break up large doc, 拆分文档, 分片 Markdown, 拆大文档, 文档切片, or wants a large markdown file split into section files. Capable of source validation, destination selection, npx sharding execution, output verification, completion reporting, and original document handling."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Shard Doc 使用 `npx @kayvan/markdown-tree-parser` 将大型 Markdown 文档按二级标题等结构拆分成更小、更易维护的文件，并生成 index。

[核心能力]
    - **源文档校验**：确认源路径存在、可访问且为 `.md` 文件。
    - **目标目录选择**：默认使用源文件同名目录，也允许用户指定。
    - **分片执行**：运行 `npx @kayvan/markdown-tree-parser explode <source> <destination>`。
    - **输出验证**：确认目标目录中生成文件和 `index.md`。
    - **完成报告**：报告源文件、目标目录、生成文件数量和工具输出。
    - **原文处理**：询问删除、归档或保留原文，并执行用户选择。

[执行流程]
    1. 获取 source document；未提供时询问用户。
    2. 验证文件存在、可访问且扩展名为 `.md`，否则 HALT。
    3. 推导默认目标目录：同目录下以源文件 basename 命名的文件夹；询问用户确认或提供新路径。
    4. 确认目标目录存在或可创建，且有写权限。
    5. 运行 `npx @kayvan/markdown-tree-parser explode [source-document] [destination-folder]`。
    6. 验证输出文件和 `index.md`；无输出时 HALT。
    7. 报告完成结果。
    8. 询问用户如何处理原文：delete、move archive、keep，并执行所选操作。

[注意事项]
    - 保留原文和分片版本会造成重复和后续加载混乱，应明确提醒用户。
    - npx 命令失败或没有生成文件时必须 HALT。
    - 删除或移动原文前必须获得用户选择。
    - 对 archive 路径，默认使用源文件同目录 `archive/` 子目录。

