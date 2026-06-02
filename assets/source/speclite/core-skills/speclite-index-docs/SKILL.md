---
name: speclite-index-docs
description: "为目标目录生成或更新 `index.md` 文档索引。用于用户要求 index docs、create index、更新 index.md、文档目录或整理文件入口。核心能力：扫描目录、读取摘要、分组写入索引并校验相对链接。"
allowed-tools: Read, Write, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Index Docs 用于为目标文件夹生成或更新 `index.md`，列出文件和子目录，并基于实际内容生成简短描述，而不是只根据文件名猜测。

[核心能力]
    - **目录扫描**：列出目标目录下所有文件和子目录。
    - **内容分组**：按类型、用途或子目录组织内容。
    - **描述生成**：读取每个文件，生成 3-10 个词的准确描述。
    - **索引写入**：生成或更新 `index.md`，包含 Files 和 Subdirectories 结构。
    - **相对链接校验**：使用 `./` 开头的相对路径并按组排序。
    - **安全停止**：目录缺失、不可访问或无写权限时 HALT。

[执行流程]
    1. 获取目标目录；未提供时询问用户。
    2. 确认目标目录存在且可访问，否则 HALT。
    3. 扫描文件和子目录，默认跳过隐藏文件，除非用户明确要求。
    4. 读取每个文件内容以生成准确描述。
    5. 按 Files 和 Subdirectories 生成 `index.md`。
    6. 校验相对链接、分组、排序和描述长度。

[注意事项]
    - 不要从文件名猜测用途；必须读取内容后再描述。
    - 保持描述简短但有信息量。
    - 如果无法写入 `index.md`，必须 HALT 并说明原因。
    - 不得将输出写到目标目录以外，除非用户明确要求。

