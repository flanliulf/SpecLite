---
name: speclite-handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

编写一份交接文档，总结当前对话，使一个全新的 agent 能够继续工作。将其保存到用户操作系统的临时目录，而不是当前 workspace。

在文档中包含一个 "suggested skills" 章节，用于建议 agent 应调用的 skills。

不要重复已经记录在其他 artifacts（specs、plans、ADRs、issues、commits、diffs）中的内容。改为通过 path 或 URL 引用它们。

遮蔽任何敏感信息，例如 API keys、passwords 或 personally identifiable information。

如果用户传入了 arguments，将其视为下一次 session 重点内容的描述，并相应地调整文档。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/core-skills/speclite-handoff/` 与实际安装副本。
