# Term Taxonomy And Promotion（术语分类与提升）

## Categories（分类）

| Category | Definition | Examples Of Signals | DDD Eligibility |
|---|---|---|---|
| Business Domain | 表达业务对象、规则、不变量、事件、命令、策略或状态。 | customer obligation、approval policy、OrderPlaced。 | 高，但必须确认 bounded context。 |
| Product / UX | 表达用户目标、界面概念、用户动作或体验状态。 | onboarding state、next action。 | 中，只有承载业务语义时提升。 |
| Architecture / Technical | 表达组件、接口、数据、runtime 或技术决策。 | resolver、projection、schema contract。 | 通常不提升，可进入 technical glossary。 |
| Workflow / Methodology | 表达阶段、artifact、handoff、review 或治理流程。 | workflow artifact、readiness gate。 | 仅当项目本身的业务域就是研发工具时考虑。 |
| Operations / Evidence | 表达安装、发布、诊断、验证、fixture 或审计证据。 | fresh install、release evidence。 | 通常不提升。 |
| Identifier / Schema | 精确 field、enum、issue id、command、path 或类型名。 | `verified: false`、SourceDescriptor。 | 不直接提升；保留 exact identifier。 |

Category 描述术语性质，不表示 artifact ownership 或 implementation status。

## Scope（范围）

| Scope | Admission Rule |
|---|---|
| Story-local | 只在一个 Story 的 AC、异常或 contract 中有明确意义。 |
| Epic | 在 Epic 目标或多个 Story 中稳定使用，含义一致。 |
| Cross-Epic | 至少两个 Epic 使用同一概念，core definition 一致。 |
| Project | PRD、Architecture、Epic/Story 或多个角色共同使用。 |
| Bounded Context | 同一个 literal 在特定 context 内具有独立定义。 |

Story-local 术语不因为出现次数多就自动提升；必须证明它对更高 scope 的判断仍然成立。

## Status（状态）

| Status | Meaning |
|---|---|
| `candidate` | 已提取，定义或 scope 尚未由 owning evidence/人确认。 |
| `approved` | 中文名称、定义和 scope 已由当前 owning artifact 或人工确认。 |
| `conflicted` | 来源之间存在定义、翻译、scope 或 status 冲突。 |
| `deprecated` | 当前 owner 已明确替代，保留用于历史阅读和 alias 路由。 |

一个记录只能有一个 Status。`conflicted` 不得同时表现为 `approved`。

## Alias Normalization（别名归一）

可以自动归一：

- 大小写差异；
- 可明确判断的单复数；
- 连字符与空格差异；
- 已由 source 明确说明的缩写与全称。

不得自动归一：

- 相似但业务边界不同的词；
- 同名但属于不同 bounded context 的概念；
- 中文近义词但 owner 尚未选择 canonical name；
- 历史词与当前词之间没有正式 deprecation evidence 的关系。

## Chinese Term Inclusion（中文术语准入）

中文组合满足以下至少一项时才进入 inventory：

1. 表达项目特有业务或方法论概念；
2. 改变需求、状态、规则、契约或验收判断；
3. 跨文档稳定复用；
4. 存在歧义、alias 或 terminology drift 风险。

中文原生术语的 Canonical Term 与中文名称可以相同。除非 source 或用户要求，不强制生成英文翻译；英文等价词写入 Aliases。

## Chinese Naming（中文命名）

- 先搜索现有 glossary、PRD、Architecture、SPEC 和 `CONTEXT.md` 的已批准表达。
- 直译必须符合项目语境，不用脱离上下文的字典释义。
- 技术 identifier 保留 exact form，并用中文补足职责，例如 `SourceDescriptor` 可写为“来源描述符”。
- 不用多个候选、括号解释或完整句子填充“中文名称”单元格；详细解释写在 Definition。
- 同一 Canonical Term 在不同 Epic 中应保持中文名称一致；若语义不同，拆分 scope 而不是强行复用。

## DDD Candidate Gate（DDD 候选门槛）

候选必须同时满足：

- 对业务行为、区分、规则或不变量有影响；
- 能给出 source evidence 和清晰边界；
- 不是通用编程、基础设施、fixture 或单一实现文件的局部名称；
- 不处于 unresolved conflict；
- 可以提出 bounded context，或明确说明 context 尚待确认。

Candidate Kind 使用：Entity、Value Object、Domain Event、Command、Policy、Rule、Invariant、State 或 Domain Service。

术语进入 `domain-candidates.md` 不等于 approved ubiquitous language。人工确认后由 `speclite-domain-modeling` 更新 `CONTEXT.md`。只有决策同时满足 hard to reverse、surprising without context 和 real trade-off 时，才建议 ADR。
