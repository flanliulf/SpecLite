---
name: speclite-grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
allowed-tools: Read, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

就此事的每个方面持续、深入地盘问我，直到我们达成共同理解。沿着决策树的每一条分支逐步推进，逐一解决各项决策之间的依赖关系。对于每个问题，提供你推荐的答案。

每次只问一个问题，并在继续之前等待我对该问题的反馈。一次问多个问题会令人困惑。

如果某个*事实*可以通过探索环境（filesystem、tools 等）找到，就自行查找，而不是询问我。不过，*决策*由我来做——把每一个决策交给我，并等待我的回答。

在我确认我们已经达成共同理解之前，不要据此采取行动。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/core-skills/speclite-grilling/` 与实际安装副本。
