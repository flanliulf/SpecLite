# Creation and Validation Report（创建与验证报告）

## Decision Summary（决策摘要）

`speclite-terminology-governance` 归属 `assets/source/speclite/core-skills/`，phase 为 `anytime`。它消费 0–5 阶段 artifact 并生成派生术语治理产物，不维护 SpecLite canonical source，也不推进 implementation 状态，因此不归入 `support-skills` 或 `4-implementation`。

| Item | Decision |
|---|---|
| Canonical package | `assets/source/speclite/core-skills/speclite-terminology-governance/` |
| Version | `1.0.0` |
| Author | `fancyliu` |
| Menu code | `TMG` |
| Phase | `anytime` |
| Tools | `Read, Write, Bash, Grep, Glob` |
| Default mode | Epic Glossary |
| Optional modes | Story Expansion、Cross-Artifact Governance、Chinese Term Inclusion、Domain Candidate Handoff |
| DDD boundary | 只生成候选；人工确认后交给 `speclite-domain-modeling` |

## Package Structure（包结构）

```text
speclite-terminology-governance/
├── SKILL.md
├── SKILL.en.md
├── CHANGELOG.md
├── references/
│   ├── source-authority-and-provenance.md
│   ├── term-taxonomy-and-promotion.md
│   └── terminology-governance-workflow.md
├── assets/
│   ├── epic-glossary-template.md
│   └── terminology-inventory-template.md
└── scripts/
    └── validate_glossary.py
```

## Skill Lint（Skill 规范检查）

目标是普通 Core workflow Skill，不是 `speclite-agent-*`，也不是 ecosystem Skill。按当前 `speclite-skill-lint` 的实际 rule ID，38 条通用规则适用并全部通过；`ECO-01` 至 `ECO-07` 不适用。

当前 lint canonical 文档的总数标签存在版本漂移：入口和 workflow 写 42，规则清单标题写 43，而规则 ID 实际为 38 条通用规则加 7 条 ecosystem-only 规则。本报告按实际 rule ID 判断，不降低已批准方案要求的 36 条基线。

| Rule Group | Applicable Rules | Result | Evidence |
|---|---:|---|---|
| YAML Frontmatter | `YML-01`–`YML-05` | Pass | name、目录、允许字段、安全边界一致 |
| Description Quality | `DESC-01`–`DESC-03` | Pass | 367/1024 字符；英文和中文触发词均不少于 2 个 |
| File Structure | `FILE-01`–`FILE-06` | Pass | canonical、mirror、changelog 和目录结构齐备 |
| Version Consistency | `VER-01`–`VER-05` | Pass | `1.0.0`、author、catalog 和日期同步 |
| Body Quality | `BODY-01`–`BODY-10` | Pass | 章节、引用、Flow Gate 措辞和配置引用可分类 |
| Naming | `NAME-01`–`NAME-03` | Pass | reference、script、asset 文件名符合分类命名 |
| Mirror | `MIRROR-01`–`MIRROR-03` | Pass | YAML、章节、引用路径同步 |
| Classification | `CLASS-01`–`CLASS-03` | Pass | templates 位于 `assets/`，知识位于 `references/`，脚本位于 `scripts/` |
| Ecosystem Source | `ECO-01`–`ECO-07` | N/A | Core package，不是 ecosystem source |

Density 脚本结果：

| Entry | Body chars | Workflow chars | Ratio | Workflow reference | Warning |
|---|---:|---:|---:|---|---|
| `SKILL.md` | 2488 | 636 | 0.2556 | Yes | No |
| `SKILL.en.md` | 4020 | 1107 | 0.2754 | Yes | No |

目标 Skill lint 结论：Error 0，Warning 0。

## Validation Results（验证结果）

| Check | Result |
|---|---|
| Focused tests | 7 files / 98 tests passed |
| Validator cases | 正常表、中文缺失、编号不一致、stale index、conflict status、中文原生术语、bounded-context 异义和 DDD handoff 均覆盖 |
| Existing Glossary regression | 11 Epic files / 96 Term tables / 911 rows；Error 0，Warning 0 |
| Canonical checker warn | `status: ok`；D0 findings 0 |
| Canonical checker strict | `status: ok`；D0 findings 0 |
| Canonical counts | Core 18、SDLC 49、default install 67 |
| Build | Passed |
| Packaging check | Passed；canonical 与 runtime packaging manifest 已同步 |
| Docs check | 71 Markdown files、5 drafts；passed |
| Diff whitespace check | Passed |

全量 `npm test` 运行了 435 个测试，其中 433 个通过，2 个既有 Flow Gate hook 测试因固定 `generatedAt: 2026-06-14T00:00:00.000Z` 超过 30 天 freshness policy 而失败。失败文件为 `test/flow-gate-hook-runner.test.ts`，不属于本 Skill 或本次 canonical closure 的修改范围，因此本次未修改 Flow Gate 行为或测试夹具。

## Scope Preservation（范围保持）

- 未修改现有 11 份 Epic Glossary 内容；它们只作为非破坏性回归样本。
- 未修改 `docs/reference/skills/core-skills.md`；保留其未发布草稿边界。
- 未修改本轮开始前已经 dirty 的 `docs/reference/skills/sdlc-workflows.md`。
- 未向当前 `.agents/`、`.claude/` 或 `.codex/` 手工写入运行副本；安装投影通过 fresh-install fixture 验证。
- Public Glossary 保持派生 Reference 身份，不与 PRD、Architecture、SPEC、Epic、Story、代码、tests 或 `CONTEXT.md` 竞争权威。
