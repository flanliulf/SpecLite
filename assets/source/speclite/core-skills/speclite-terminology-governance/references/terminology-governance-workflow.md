# Terminology Governance Workflow（术语治理工作流）

## Purpose（目的）

本流程把规划和 implementation-intent 文档中的词汇转化为可追溯的术语清单、人类可读 Glossary 和可选领域候选。它采用顺序工作流，并通过确定性验证执行最多三轮定点修复。

## Inputs（输入）

| Input | Required | Meaning |
|---|---|---|
| `source_documents` | 是 | 用户点名的 PRD、UX、Architecture、SPEC、Epic、Story、TSD 或文档 glob。 |
| `mode` | 否 | `epic`、`story`、`portfolio` 或 `domain-candidates`；缺失时默认 `epic`。 |
| `glossary_root` | 否 | 最终 Glossary 根目录。优先使用用户指定位置或项目文档规范。 |
| existing glossary/index | 否 | 用于增量维护、alias 对齐和导航更新。 |
| `CONTEXT.md` / `CONTEXT-MAP.md` | 否 | 只用于识别已经批准的 domain language，不直接改写。 |

如果用户只要求分析，保持 read-only，不写入任何 output。用户要求创建或更新 Glossary 时，授权仅覆盖点名的 source scope、输出文档和必要 index；发现其它文档也需要修改时先报告。

## Step 1: Resolve Scope（解析范围）

1. 展开 `source_documents`，记录每个实际文件和 artifact type。
2. 读取项目 `AGENTS.md`、文档 style guide、现有 glossary index 和相邻页面。
3. 确定 `glossary_root`：用户输入 > 项目文档规范 > 已有 glossary root > `.specskills/output/speclite-terminology-governance/`。
4. 记录 process analysis root：`.specskills/docs/analysis/speclite-terminology-governance/`。
5. 列出预期 touched files；公开 index 是独立导航写入面。

不得把当前仓库的 `_bmad-output` 路径写成跨项目 hard gate。Source path 属于 workflow parameter；只有 owning SPEC 明确规定时才要求固定路径，否则使用 resolved root 或用户提供的 artifact。

## Step 2: Build Provenance Map（建立溯源映射）

按 `references/source-authority-and-provenance.md` 为每个 source 标记职责。保存：

- artifact type 和路径；
- Epic / Story ID、状态和标题（存在时）；
- section heading 或其它定位信息；
- source status：current、historical、proposed 或 unknown；
- 该 source 能证明的是 intent、contract、design 还是 implementation evidence。

不使用一个全局优先级覆盖所有 artifact。冲突必须按 concern 路由给 owning artifact。

## Step 3: Extract Candidates（提取候选）

逐节阅读全文，不只扫描 Markdown heading、bold 或 backticks。候选信号包括：

- 多词英文组合、稳定 capability 名称和 ownership 概念；
- 状态、outcome、reason、diagnostic、contract 和 artifact kind；
- CLI、schema、field、path、root、projection、gate 和 evidence 语义；
- AC 或异常分支中会改变判断的术语；
- 符合 Chinese Term Inclusion 门槛的中文组合。

排除普通语法连接词、通用编程概念、只出现一次且无契约意义的文件名，以及无法从上下文定义的片段。对于每个候选保留 exact source form，不先做词形合并。

## Step 4: Classify And Define（分类与定义）

依据 `references/term-taxonomy-and-promotion.md`：

1. 标记 Category、Scope、Sources 和 Status。
2. 查阅现有项目术语，优先复用已批准中文名称。
3. 保留 CLI、JSON、Skill、Workflow、Runtime、Fixture、schema id 等必要技术标识；中文名称必须仍帮助中文读者理解。
4. Definition 控制在 1–2 句，说明该词在当前项目语境中是什么、边界是什么。
5. Epic/Story 只能支撑 planned intent 或 acceptance contract 时，定义不得声称 implemented、verified 或 released。

## Step 5: Normalize And Resolve（归一与冲突处理）

- 大小写、单复数、连字符或缩写展开指向同一概念：选择一个 Canonical Term，其余写入 Aliases。
- 同词同义：合并 Sources，保持统一中文名称和核心 Definition。
- 同词异义：按 bounded context、artifact scope 或 concern 拆成不同记录。
- Story 与 Epic 冲突：标记 `conflicted`；Story 不静默覆盖 Epic。
- Completed Story 的旧措辞：保留 historical provenance；除非 current owning artifact 确认，否则不提升。
- 未解决冲突不得标记 `approved`，不得投影为无条件共享定义。

需要产品、架构或领域决策时停止自动归一，展示候选、来源、影响和推荐选择。

## Step 6: Project Outputs（投影输出）

### Epic Mode

- 文件名：`epic-{NN}-{slug}.md`，编号使用两位数字。
- H1：`# Epic N: {English Title} Glossary（{中文标题}术语表）`。
- 开头说明 source Epic 和状态边界。
- 按 source 概念分组，每组使用 `Term | 中文直译 | Definition`。
- 可添加 Common Distinctions 和 Related Documents，但不得改变 Term table schema。

### Story Mode

- 以 Epic inventory 为基线，只添加 Story-local 新词或更精确的范围说明。
- 保留 Story ID 和 source section；不要求每个 Story 单独生成公开页面。
- 跨多个 Story 稳定复用后，才建议提升为 Epic 或 project scope。

### Portfolio Mode

- 生成 `terminology-inventory.md`，使用 `assets/terminology-inventory-template.md`。
- Epic 页面保持自包含；共享定义从 inventory 投影，允许追加 Epic-specific context。
- 更新 index 前列出新增、重命名和删除链接；未经相应写入授权不改变公开导航。

### Domain Candidate Mode

- 生成 `domain-candidates.md`，不得直接修改 `CONTEXT.md`、`CONTEXT-MAP.md` 或 ADR。
- 经人工确认后，把 approved candidates 交给 `speclite-domain-modeling`。

每个生成文档末尾追加：

```text
---

*本文档由 speclite-terminology-governance Skill 自动生成*
```

## Step 7: Validate And Refine（验证与迭代）

在 Skill 根目录运行：

```bash
python3 scripts/validate_glossary.py <glossary-root> --require-index --format json
```

1. 读取 JSON Errors 和 Warnings。
2. 只修复对应文件与行。
3. 最多重新验证三轮。
4. 仍有 Error 时停止，不把部分成功称为完成。
5. 项目提供 `docs:check`、link checker 或 Markdown lint 时，在结构校验之后运行。

`validate_glossary.py` 不能证明语义覆盖完整；最终仍需人工抽查每个 source section、冲突记录和术语边界。

## Flow Gate Guidance（流程门控指引）

| Anchor | 本 Skill 中的含义 |
|---|---|
| Contract Anchor | PRD、Architecture、SPEC、Epic、Story 中的目标、规则和 acceptance intent。 |
| Functional Anchor | 当前代码、command behavior 或等价实现体现出的功能。 |
| Evidence Anchor | Tests、fixtures、snapshots、runtime output、reports。 |
| Guidance Anchor | Story task、历史路径和非 owning implementation hint。 |

按 `Contract -> Functional -> Evidence` 顺序区分术语所描述的是目标还是现状。固定源码路径只有 owning SPEC 明确要求时才是 hard gate；Guidance Anchor 必须允许有证据支撑的 equivalent implementation policy。

本 Skill 不推进 Story/Epic 状态，因此不生成或消费状态转换用 `speclite-flow-gate` report。如果调用方要求同时推进状态，停止术语工作并让 owning workflow 单独处理 Flow Gate。

## Error Handling（错误处理）

- Source glob 无匹配：报告缺失输入并停止，不创建空 Glossary。
- Epic 编号或标题不明确：从 source metadata 和 index 查证；仍冲突时请求用户确认。
- Existing glossary 有不同定义：保留原文，标记 conflict，不静默覆盖。
- Index 中存在断链：在已授权导航范围内修复；否则报告 exact link。
- 输出位置不明确：使用 fallback output root，不擅自创建 public docs root。
- Validator 不可执行：报告 Python 错误和未完成验证状态，不用主观检查替代 deterministic result。
