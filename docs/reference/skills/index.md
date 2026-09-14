# Skills Reference（Skills 参考）

本文汇总 SpecLite core、SDLC、ecosystem 和 support skills。它只做 catalog routing；每个 Skill 的完整 activation、workflow 和限制仍以对应 `SKILL.md` 为准。

## Documents（文档）

| 文档 | 说明 |
|---|---|
| [`agent-roster.md`](agent-roster.md) | 七个 role activation Agent 的唯一源定义。 |
| [`core-skills.md`](core-skills.md) | required baseline core skills catalog。 |
| [`sdlc-workflows.md`](sdlc-workflows.md) | SDLC workflow skills catalog。 |
| [`ecosystem-skills.md`](ecosystem-skills.md) | optional ecosystem extension skills catalog。 |
| [`support-skills.md`](support-skills.md) | support skills catalog。 |

## Boundaries（边界）

| Catalog | Runtime Meaning |
|---|---|
| core skills | required baseline，随默认安装进入目标项目。 |
| SDLC workflows | default-selected baseline，随默认安装进入目标项目。 |
| ecosystem skills | optional ecosystem modules，只有 interactive 或显式 module selection 后才进入目标项目。 |
| support skills | maintainer-only canonical source tooling，不属于 default install module。 |
