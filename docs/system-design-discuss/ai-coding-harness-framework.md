# AI Coding / Harness Engineering 顶层框架设计

## 设计原则

这套体系面向既有代码工程，目标不是增加文档数量，而是让 AI 在真实项目中稳定做到三件事：

1. 知道边界。
2. 按流程做事。
3. 用硬验证收口。

核心原则是：

> 架构文档承载完整设计，Instructions 承载全局红线，Skills 承载操作流程，Agents 承担角色协作，Scripts/CI 承担硬验证。

## 一、整体层级

```text
L0 代码与事实层
   现有代码 / 数据库 / API / 配置 / CI / 运行环境

L1 架构知识层
   业务架构、技术架构、领域模型、模块边界、技术选型、接口规范等

L2 全局约束层
   Instructions / Rules：所有任务都必须遵守的底线规则

L3 操作手册层
   Skills：如何新增接口、如何接入审计日志、如何加错误码、如何跑验证

L4 角色协作层
   Agents + Workflow：谁分析需求、谁设计方案、谁开发、谁审查、谁验证

L5 Hooks 生命周期治理层
   Hooks：上下文注入、写入保护、命名检查、索引维护、验证提醒

L6 自动验证层
   Scripts / CI / 静态检查 / 契约测试 / 架构依赖检查

L7 索引与演进层
   dev-map、任务看板、ADR、规则变更记录、复盘沉淀
```

## 二、推荐目录结构

```text
.ai/
  instructions/
    project-instructions.md
    backend.instructions.md
    frontend.instructions.md
    security.instructions.md

  skills/
    add-api/
      SKILL.md
    add-data-access/
      SKILL.md
    add-error-code/
      SKILL.md
    add-audit-log/
      SKILL.md
    add-observability/
      SKILL.md
    run-verification/
      SKILL.md

  agents/
    analyst.agent.md
    architect.agent.md
    developer.agent.md
    code-reviewer.agent.md
    qa.agent.md
    pm-router.agent.md

  workflows/
    feature-development.md
    bugfix.md
    refactor.md
    release.md

  hooks/
    hooks.json
    README.md
    session-start/
      inject-project-context.js
    prompt-submit/
      inject-active-artifact-context.js
      secret-detection.js
    pre-tool-use/
      file-protection.js
      secret-file-scanner.js
      artifact-naming-policy.js
      write-scope-guard.js
    post-tool-use/
      update-manifest.js
      provenance-stamp.js
      traceability-update.js
    stop/
      session-summary.js
      verify-required-reminder.js

  scripts/
    verify-all.sh
    check-layer-deps.sh
    check-error-codes.sh
    check-api-contracts.sh
    check-observability.sh

docs/
  specs/
    index.md
    version-spec-template.md
    feature-spec-template.md
    version-xxx-spec.md
    feature-xxx-spec.md
    command-result-json-contract.md
    validation-issue-contract.md
    fixture-comparison-policy.md

  architecture/
    index.md
    ADD.md
    tech-stack.md
    business-architecture.md
    technical-architecture.md
    domain-model.md
    module-boundaries.md
    dependency-rules.md
    data-access.md
    api-contracts.md
    cross-cutting-providers.md
    observability.md
    security.md

  adr/
    0001-tech-stack.md
    0002-layering-model.md
    0003-error-code-provider.md

  tsd/
    TSD-feature-xxx.md
    TSD-command-result-json-output.md

  dev-map.md
  glossary.md
```

## 三、各层职责

### L0：代码与事实层

这一层是项目真实状态本身，包括：

- 现有代码。
- 数据库结构。
- API 实现。
- 配置文件。
- 构建脚本。
- CI/CD 配置。
- 运行环境。
- 线上行为和历史缺陷。

这一层回答的是：

> 当前系统真实是什么样子。

上层所有设计、规则、技能和验证脚本，都必须以这一层为事实基础。

### L1：架构知识层

这是整套体系的“源头文档”，不要塞进 Instructions。

建议承载内容：

| 文档 | 内容 |
|---|---|
| `business-architecture.md` | 业务域、核心流程、上下文边界、核心对象 |
| `technical-architecture.md` | 系统结构、运行形态、模块职责、核心链路 |
| `domain-model.md` | 实体、值对象、聚合、状态机、业务规则 |
| `module-boundaries.md` | 模块职责、允许依赖、禁止依赖 |
| `dependency-rules.md` | 分层依赖、调用方向、跨模块访问规则 |
| `data-access.md` | Repository/DAO 规范、事务边界、查询约束 |
| `api-contracts.md` | REST/RPC 规范、分页、错误响应、版本策略 |
| `cross-cutting-providers.md` | 日志、错误码、审计日志、权限、配置等 Provider |
| `observability.md` | 日志、指标、Trace、告警、关键路径观测要求 |
| `security.md` | 密钥、权限、输入校验、审计、安全边界 |
| `adr/*.md` | 技术选型和重大设计决策的原因、取舍、后果 |
| `specs/*.md` | 版本/功能级规格设计文档，说明本次要解决什么、影响什么、边界是什么、完成标准是什么 |
| `tsd/*.md` | 单次需求/项目的技术落地方案，说明本次怎么实现、怎么上线、怎么验证 |

这一层回答的是：

> 系统应该是什么样子。

这一层适合保存完整解释、背景、取舍和上下文。比如为什么采用某种分层方式、为什么禁止某类依赖、为什么统一错误码必须经过 Provider、为什么审计日志必须覆盖某些操作。

#### ADD / Architecture

ADD（Architecture Design Document，架构设计文档）是 L1 架构知识层中的系统级架构基线。它回答：

> 系统应该长什么样，长期应该如何运作。

ADD 适合承载：

- 系统整体架构视图。
- 模块、服务、上下文边界。
- 分层依赖规则。
- 核心机制：鉴权、限流、异步任务、幂等、重试、容灾、可观测性。
- 数据访问策略。
- 集成方式。
- 质量属性要求。
- ADR 索引。

ADD 不应该承载本次需求的接口字段、表结构、灰度步骤、具体 Story 任务。这些应进入 TSD、SPEC 或 Story。

#### ADR / 架构决策记录

ADR（Architecture Decision Record，架构决策记录）是关键技术取舍的独立记录。它回答：

> 为什么这么选，没选什么，代价是什么。

ADR 适合在以下情况产生：

- 决策会影响后续多个需求。
- 决策难回滚或长期存在。
- 决策跨团队、跨模块或跨系统。
- 决策存在明显争议或多个备选方案。
- 决策引入新基础设施、新中间件或新全局机制。

ADR 本体应独立存放在 `docs/adr/`。ADD、TSD、SPEC 只引用 ADR，不复制 ADR 全文。

#### TSD / 技术方案文档

TSD（Technical Solution Design，技术方案文档）是单次需求或项目的技术落地方案。它回答：

> 这次具体怎么实现、怎么上线、怎么验证。

TSD 更偏传统软件工程协作，主要面向人类工程师、Tech Lead、Reviewer、QA、运维和发布决策者。它适合承载：

- 背景与目标。
- 非目标。
- 方案概览。
- 流程与时序。
- 接口设计。
- 数据设计。
- 模块改动方案。
- 迁移与发布。
- 灰度与回滚。
- 测试计划。
- 风险与对策。
- 对 ADD、ADR、SPEC 的引用。

TSD 不应该成为精确契约的真源。字段级 schema、JSON contract、排序规则、兼容性、错误码语义、fixture comparison policy 等应进入 SPEC。TSD 只引用 SPEC，并说明本次如何实现该契约。

#### SPEC 与 TSD 的边界

SPEC 与 TSD 有交集，但不等同。

| 维度 | SPEC | TSD |
|---|---|---|
| 主要读者 | LLM、Dev Agent、测试、fixture、CI、Reviewer | 人类工程师、Tech Lead、Reviewer、QA、运维 |
| 核心作用 | 定义什么是正确 | 说明这次怎么落地 |
| 表达方式 | 结构化契约、规则、边界、验收断言 | 方案叙述、设计解释、发布与风险安排 |
| 典型内容 | schema、状态机、排序规则、兼容性、错误码语义、fixture policy | 接口接入、表设计、流程时序、迁移、灰度、回滚、测试计划 |
| 生命周期 | 契约级，可长期作为真源 | 需求/项目级，结束后主要用于追溯 |
| 下游 | Story、测试、fixture、CI、代码审查 | Story、开发、评审、发布、QA |

判断规则：

- 如果内容定义“什么输出/行为/契约是正确的”，放 SPEC。
- 如果内容说明“本次如何实现、部署、灰度、回滚、验证”，放 TSD。
- 如果 TSD 中某段规则会被多个需求复用，抽成 SPEC 或沉淀进 ADD。
- 如果某个技术选择影响长期架构或存在重大取舍，抽成 ADR。
- TSD 引用 SPEC，不复制 SPEC 的细则。

#### SPEC / 规格设计文档

SPEC / 规格设计文档是 L1 架构知识层中的精确工程契约。它不是 Instructions / Rules，也不是 Skill，也不是 TSD 的 AI 版，而是后续 Rule、Skill、Agent 工作流、测试、fixture 和 CI 的上游判定依据。

SPEC 更适合 AI Coding 场景，不是因为名称叫 SPEC，而是因为它应被写成结构化、可引用、可验证、低歧义的契约文档。它回答：

> 什么是正确。

建议承载在：

```text
docs/specs/
  index.md
  version-spec-template.md
  feature-spec-template.md
  version-xxx-spec.md
  feature-xxx-spec.md
  command-result-json-contract.md
  validation-issue-contract.md
  fixture-comparison-policy.md
```

SPEC 主要回答：

- 当前版本或功能到底要解决什么问题。
- 哪些问题是核心目标，哪些只是顺手优化。
- 改动会影响哪些业务流程、模块、接口、数据或配置。
- 哪些既有行为必须保持兼容。
- 哪些边界条件必须明确。
- 哪些事项明确不做。
- 最终什么样才算完成。
- 验收标准是什么。

SPEC 必须尽量消除不确定表达。对于已经确定的需求，不应使用“建议”“可以”“推荐”“可选”等模糊词。对于尚未确定的内容，应明确标记为待澄清问题，而不是隐藏在模糊表述中。

SPEC 的主要价值是解决：

> 知道做什么。

SPEC 不能单独解决：

> 如何稳定地做到位。

因此，SPEC 之后必须继续进入 Instructions / Rules、Skills、Agents + Workflow、Scripts / CI 这些层级。否则 AI 即使读懂了 SPEC，也可能出现跳过细节、漏做验收项、重复犯错、无法说明进度状态等问题。

SPEC 与其他层的关系：

| SPEC 内容 | 对应层级 | 承载构件 | 对应章节 |
|---|---|---|---|
| 项目是什么、解决什么问题、复杂度在哪 | L1 架构知识层 | `business-architecture.md`、`technical-architecture.md` | `## 1. 背景`、`## 4. 现状与问题` |
| 当前版本要解决什么问题 | L1 架构知识层 | `docs/specs/version-xxx-spec.md` | `## 1. 背景`、`## 2. 目标`、`## 5. 需求明细` |
| 当前功能要实现什么能力 | L1 架构知识层 | `docs/specs/feature-xxx-spec.md` | `## 2. 目标`、`## 5. 需求明细`、`## 8. 验收标准` |
| 核心目标与非目标 | L1 架构知识层 | SPEC 的目标 / 非目标章节 | `## 2. 目标`、`## 3. 非目标` |
| 影响哪些模块 | L1 架构知识层 | SPEC + `module-boundaries.md` | `## 6. 影响范围`、`## 7. 方案约束` |
| 哪些行为必须兼容 | L1，部分稳定后进入 L2 | SPEC 兼容性要求；稳定后提炼进 Instructions | `## 5. 需求明细`、`## 8. 验收标准` |
| 边界条件和待澄清问题 | L1 + L4 | SPEC；由 Analyst / Architect 补齐或打回澄清 | `## 5. 需求明细`、`## 9. 待澄清问题` |
| 什么样才算完成 | L1 + L6 | SPEC 验收标准；测试、脚本、CI 负责验证 | `## 8. 验收标准` |
| 反复出现的约束 | L2 | 从 SPEC 中提炼为 Instructions / Rules | `## 7. 方案约束`、`## 8. 验收标准` |
| 固定执行步骤 | L3 | 从 SPEC 任务类型中沉淀为 Skills | `## 6. 影响范围`、`## 7. 方案约束`、`## 8. 验收标准` |
| 需求分析和技术方案接力 | L4 | Analyst / Architect / Workflow | `## 9. 待澄清问题`、完整 SPEC |

从文章提出的 SPEC 目标维度看，当前体系需要以下文档和构件共同承载：

| 文档 | 用途 | 覆盖目标 |
|---|---|---|
| `docs/specs/index.md` | SPEC 目录索引，说明当前有哪些版本/功能规格文档 | 帮助定位所有 SPEC |
| `docs/specs/version-spec-template.md` | 版本级 SPEC 模板 | 版本目标、核心/非核心、影响范围、兼容性、完成标准 |
| `docs/specs/feature-spec-template.md` | 功能级 SPEC 模板 | 功能目标、边界条件、影响模块、验收标准 |
| `docs/specs/version-xxx-spec.md` | 某个版本的完整规格设计文档 | 这版解决什么、影响什么、做到什么算完成 |
| `docs/specs/feature-xxx-spec.md` | 某个功能的完整规格设计文档 | 这个功能解决什么、怎么验收、哪些行为兼容 |
| `docs/architecture/module-boundaries.md` | 模块职责和依赖边界 | 支撑“改动会影响哪些模块” |
| `docs/architecture/api-contracts.md` | 接口契约、响应格式、兼容策略 | 支撑“哪些行为必须保持兼容” |
| `docs/architecture/cross-cutting-providers.md` | 日志、错误码、审计等横切面规范 | 支撑影响范围和完成标准 |
| `docs/architecture/observability.md` | 日志、指标、Trace、告警要求 | 支撑完成标准和验证要求 |
| `.ai/scripts/verify-all.sh` | 总验证入口 | 支撑“最终什么样才算做完” |
| `.ai/scripts/check-layer-deps.sh` | 模块/分层依赖检查 | 验证“影响模块”和“边界未被破坏” |
| `.ai/instructions/project-instructions.md` | 从反复出现的 SPEC 约束中提炼全局红线 | 承接稳定下来的兼容性和架构规则 |

SPEC 的推荐模板：

```md
# 规格设计文档：<版本或功能名称>

## 1. 背景
说明为什么要做，本次变化来自什么业务问题或工程问题。

## 2. 目标
列出本次必须完成的目标。

## 3. 非目标
明确本次不做什么，避免 AI 扩大范围。

## 4. 现状与问题
描述当前系统行为、痛点、限制和已知风险。

## 5. 需求明细
逐条列出功能需求、行为要求、边界条件和兼容性要求。

## 6. 影响范围
列出涉及的模块、接口、数据、配置、权限、日志、审计、可观测性。

## 7. 方案约束
引用相关架构文档、模块边界、数据访问规范、Provider 规范和可观测性规范。

## 8. 验收标准
定义什么样才算完成，包括用户可见行为、兼容性、异常路径、测试和验证要求。

## 9. 待澄清问题
列出尚未明确的问题。未澄清前不得假设实现。
```

### L2：Instructions / Rules

这一层只放“任何任务都必须遵守”的规则，必须短、硬、稳定。

示例内容：

```md
# Project Instructions

## 架构红线
- 不得让 Domain 层依赖 Infrastructure、数据库 SDK、HTTP Client 或框架细节。
- 不得跨模块直接访问对方内部实现，必须通过公开接口或应用服务。
- 不得绕过统一 Provider 创建日志、错误码、审计日志或配置读取逻辑。

## 数据访问
- 业务代码不得直接访问数据库，必须通过项目约定的数据访问层。
- 涉及多聚合修改时，必须明确事务边界。

## 接口规范
- 新增接口必须遵守统一响应结构、错误码规范和分页规范。
- 不得返回未脱敏的敏感字段。

## 可观测性
- 新增关键业务路径必须接入日志、Trace 和必要指标。
- 外部系统调用必须包含超时、错误日志和 Trace 上下文。
```

这一层回答的是：

> AI 无论做什么都不能违反什么。

Instructions / Rules 是从架构知识层提炼出来的执行约束，不应该承载完整架构文档。它们适合放高频、高风险、稳定、跨任务都适用的规则。

### L3：Skills

这一层放“具体怎么做”。凡是有步骤、有工具、有验证项的内容，都应该从 Instructions 拆出去。

建议至少有这些 Skill：

| Skill | 职责 |
|---|---|
| `add-api` | 新增接口的标准步骤：路由、DTO、校验、错误码、文档、测试 |
| `add-data-access` | 新增数据访问逻辑：Repository、事务、迁移、查询限制 |
| `add-error-code` | 新增错误码：命名、注册、防重复、文档同步 |
| `add-audit-log` | 接入审计日志：触发条件、字段、脱敏、验证 |
| `add-observability` | 接入日志、指标、Trace、告警 |
| `run-verification` | 编译、测试、静态检查、架构检查、契约检查 |
| `write-tech-design` | 根据需求生成技术方案 |
| `code-review` | 按项目规范审查代码变更 |

Skill 模板建议统一：

```md
# Skill: add-api

## 适用场景
什么时候触发。

## 输入要求
需要用户或上下文提供哪些信息。

## 执行步骤
1. 阅读接口规范。
2. 确认业务域和模块边界。
3. 新增 DTO / Controller / Application Service。
4. 接入错误码、日志、审计、可观测性。
5. 补充测试和接口文档。

## 禁止事项
不得绕过哪些项目约束。

## 验证方式
需要运行哪些脚本或测试。

## 输出要求
最后需要汇报哪些结果。
```

这一层回答的是：

> 某件事具体应该怎么完成。

### L4：Agents + Workflow

Agents 不只是“更长的提示词”，而是角色边界。

推荐角色：

| Agent | 职责 |
|---|---|
| `analyst` | 澄清需求、识别业务边界、输出需求理解 |
| `architect` | 输出技术方案、模块影响、接口设计、风险 |
| `developer` | 根据已批准方案实现代码 |
| `code-reviewer` | 审查架构、规范、边界、测试缺口 |
| `qa` | 设计测试点、验证行为、检查回归风险 |
| `pm-router` | 只做流程路由，不改需求、不改方案 |

Workflow 负责规定接力规则：

```text
需求输入
  -> analyst 输出需求说明
  -> architect 输出技术方案
  -> 用户/闸门确认
  -> developer 实现
  -> run-verification Skill
  -> code-reviewer 审查
  -> qa 验证
  -> 完成 / 打回
```

这一层回答的是：

> 复杂任务由谁负责，按什么顺序推进。

### L5：Hooks 生命周期治理层

Hooks 是 AI Coding 工作流里的生命周期治理机制。它不替代 Instructions、Skills、Agents、Scripts 或 CI，而是在会话和工具调用的关键事件点自动执行轻量治理动作。

这一层回答的是：

> 这一步是否允许发生，上下文和痕迹是否被自动维护。

Hooks 适合承担四类职责：

| 职责 | 说明 | 示例 |
|---|---|---|
| 上下文注入 | 在会话开始或用户请求进入时补足必要上下文 | 注入当前 SPEC / TSD / Story、dev-map、artifact manifest |
| 过程阻断 | 在写入前阻断明确违规 | 密钥泄露、敏感文件写入、错误目录、命名不合规 |
| 轻量检查 | 做快速、确定、低成本检查 | 文档 frontmatter、文件命名、是否缺少关联 SPEC |
| 追溯维护 | 写入后自动维护索引和痕迹 | manifest、provenance、session summary、artifact graph |

推荐 Hook 事件：

| 事件 | 用途 |
|---|---|
| `SessionStart` | 注入项目上下文、工具版本、当前工作区状态 |
| `UserPromptSubmit` | 扫描 prompt 中的 secret，注入当前活跃 artifact 上下文 |
| `PreToolUse` | 写入前做文件保护、命名检查、写入范围检查 |
| `PostToolUse` | 写入后更新 manifest、provenance、traceability |
| `Stop` | 记录 session summary，提示未完成验证 |

最小 Hooks 清单：

| Hook | 触发点 | 职责 |
|---|---|---|
| `secret-detection` | `UserPromptSubmit` | 阻止密钥进入模型上下文 |
| `file-protection` | `PreToolUse` | 阻止写 `.env`、私钥、凭据、CI 配置等敏感文件 |
| `artifact-naming-policy` | `PreToolUse` | 约束 SPEC / TSD / ADR / Story 文件命名与目录 |
| `update-manifest` | `PostToolUse` | 写入后更新 artifact manifest |
| `provenance-stamp` | `PostToolUse` | 记录来源、时间、关联 Story / SPEC |
| `verify-required-reminder` | `Stop` | 有代码变更但未跑 `verify-all.sh` 时提醒或阻断完成声明 |

Hooks 的边界：

- Hooks 不承载规则真源。规则真源仍在 ADD、ADR、SPEC、TSD、Instructions。
- Hooks 不替代 Skills。具体操作流程仍由 Skills 承载。
- Hooks 不替代 Scripts。完整验证仍由总验证脚本执行。
- Hooks 不替代 CI。团队级合入门禁仍由 CI 执行。
- Hooks 不应默认执行长耗时全量验证。

Hooks 与 Scripts 的关系：

```text
Hooks：过程治理
Scripts：结果验证
CI：远端合入门禁
```

Hooks 把一部分软约束下沉为自动化过程约束；Scripts 把完成标准下沉为结果门禁。

### L6：Scripts / CI

这是把软规则变成硬门禁的地方。

建议检查项：

| 脚本 | 检查内容 |
|---|---|
| `verify-all.sh` | 总验证入口 |
| `check-layer-deps.sh` | 分层依赖、模块边界 |
| `check-error-codes.sh` | 错误码重复、命名、注册遗漏 |
| `check-api-contracts.sh` | OpenAPI/接口契约一致性 |
| `check-observability.sh` | 关键路径是否缺日志、Trace、指标 |
| `check-audit-log.sh` | 敏感操作是否缺审计日志 |
| `check-doc-sync.sh` | 代码变更是否需要同步文档 |

这一层回答的是：

> 到底有没有做到。

Scripts / CI 是整个体系的硬验证层。Rule 和 Instructions 只能要求 AI 遵守，Scripts / CI 才能在可自动检查的范围内判断是否真的遵守。

### L7：索引与演进层

这一层负责让项目知识能被找到、能被更新、能持续演进。

建议内容：

| 构件 | 职责 |
|---|---|
| `docs/dev-map.md` | 项目级开发导航，告诉 AI 和开发者从哪里理解项目 |
| `docs/glossary.md` | 统一业务术语、技术术语、缩写 |
| `docs/adr/*.md` | 记录重大技术决策、取舍和后果 |
| 任务看板 | 记录需求、状态、阶段、负责人、阻塞点 |
| 规则变更记录 | 记录 Instructions / Skills / Scripts 的变更原因 |
| 复盘沉淀 | 把重复问题沉淀为文档、规则、技能或脚本 |

这一层回答的是：

> 这套体系如何被持续理解和持续改进。

## 四、依赖关系

推荐依赖关系是单向的：

```text
需求 / 版本目标 / 功能目标
  -> 反复澄清
  -> 形成 PRD / SPEC 输入

ADD / Architecture
  -> 提供架构基线、长期机制、全局约束
  -> 约束 SPEC / TSD / Story

ADR
  -> 记录关键取舍
  -> 被 ADD / SPEC / TSD 引用

SPEC
  -> 收束精确契约、边界、行为规则、验收判定
  -> 输入给 TSD / Agents + Workflow / Tests / Fixtures / CI

TSD
  -> 基于 PRD + ADD + ADR + SPEC
  -> 说明本次如何实现、上线、回滚、验证
  -> 输入给 Epic / Story / QA / Release

架构知识层
  -> 提炼全局红线
  -> 形成 Instructions

架构知识层
  -> 拆解具体操作路径
  -> 形成 Skills

Instructions
  -> 约束所有 Skills 和 Agents

Skills
  -> 调用 Scripts 完成验证

Agents
  -> 按 Workflow 调度 Skills

Hooks
  -> 在 SessionStart / UserPromptSubmit / PreToolUse / PostToolUse / Stop 等事件点自动运行
  -> 注入上下文、阻断明显违规、维护索引和追溯、提醒验证

SPEC 的验收标准
  -> 转化为测试、脚本或 CI 检查项
  -> 进入 Scripts / CI

Scripts / CI
  -> 反向暴露契约、规则和方案是否可执行

复盘结果
  -> 更新 SPEC 模板 / TSD 模板 / ADR / ADD / 架构文档 / Instructions / Skills / Hooks / Scripts
```

不要让关系变成：

```text
Instructions 里塞完整架构文档
SPEC 里混入全局规则却不沉淀 Instructions
TSD 里复制 SPEC 契约细则导致漂移
ADD 里写本次需求的接口、表结构、灰度步骤
ADR 混在 TSD 正文里导致关键决策不可追溯
Skills 里重复所有规则
Agents 自己解释架构
Hooks 承载规则真源或执行长耗时全量验证
Scripts 和文档互相脱节
```

这样后期一定会失控。

## 五、规则晋升机制

不是所有规范一开始都应该进入 Instructions 或 CI。可以用这条路径演进：

```text
一次性需求
  -> PRD / SPEC / TSD

一次性经验
  -> 复盘记录

本次如何实现、上线、验证
  -> TSD

字段级契约、行为规则、验收判定
  -> SPEC

SPEC 中反复出现的边界条件
  -> 架构文档 / Instructions

反复出现的问题
  -> ADR / 架构文档

所有任务都必须遵守
  -> Instructions

有固定操作步骤
  -> Skill

生命周期事件点上的轻量治理
  -> Hook

可以自动检查
  -> Script / CI
```

判断标准：

| 问题 | 去向 |
|---|---|
| 这是系统事实吗？ | 架构文档 |
| 这是本次版本或功能要做什么吗？ | SPEC |
| 这是本次怎么实现、上线、回滚、验证吗？ | TSD |
| 这是字段级契约、行为规则或自动化验收判定吗？ | SPEC |
| 这是全局底线吗？ | Instructions |
| 这是具体步骤吗？ | Skill |
| 这是角色工作吗？ | Agent |
| 这是生命周期事件点上的上下文注入、写入保护、命名检查或追溯维护吗？ | Hook |
| 这是可自动验证的吗？ | Script / CI |
| 这是重大取舍吗？ | ADR |

## 六、最小可落地版本

如果先做 MVP，建议只建这几个：

```text
docs/architecture/index.md
docs/architecture/ADD.md
docs/architecture/module-boundaries.md
docs/architecture/cross-cutting-providers.md
docs/architecture/observability.md
docs/adr/

docs/specs/version-spec-template.md
docs/specs/feature-spec-template.md
docs/tsd/TSD-template.md

.ai/instructions/project-instructions.md

.ai/skills/run-verification/SKILL.md
.ai/skills/add-api/SKILL.md
.ai/skills/add-data-access/SKILL.md

.ai/hooks/hooks.json
.ai/hooks/pre-tool-use/file-protection.js
.ai/hooks/pre-tool-use/artifact-naming-policy.js
.ai/hooks/post-tool-use/update-manifest.js
.ai/hooks/stop/verify-required-reminder.js

.ai/scripts/verify-all.sh
.ai/scripts/check-layer-deps.sh

docs/dev-map.md
```

先把“架构事实、全局红线、常见操作、总验证入口”四件事立起来，后面再扩 Agents 和更多专项 Skills。

## 七、最终框架

```text
版本/功能需求进 docs/specs
系统架构基线进 docs/architecture/ADD.md
完整架构设计进 docs/architecture
关键决策进 docs/adr
单次需求技术方案进 docs/tsd
项目导航进 docs/dev-map
全局红线进 .ai/instructions
具体流程进 .ai/skills
角色协作进 .ai/agents + .ai/workflows
生命周期治理进 .ai/hooks
硬性验证进 .ai/scripts + CI
复盘沉淀反哺 docs / instructions / skills / hooks / scripts
```

这套体系的最终目标是让 AI 在既有项目中获得稳定上下文，并在工程边界内可靠工作：

- 用架构知识层解决“系统是什么、应该是什么”。
- 用 ADD / Architecture 解决“系统长期应该如何组织和运作”。
- 用 ADR 解决“关键技术取舍为什么成立”。
- 用 SPEC 解决“什么契约、行为、边界和验收判定是正确的”。
- 用 TSD 解决“这次如何实现、上线、回滚和验证”。
- 用 Instructions / Rules 解决“什么不能违反”。
- 用 Skills 解决“具体怎么做”。
- 用 Agents + Workflow 解决“谁负责、怎么接力”。
- 用 Hooks 解决“过程中的上下文、写入保护、轻量治理和追溯如何自动发生”。
- 用 Scripts / CI 解决“到底有没有做到”。
- 用索引与演进层解决“如何持续理解和改进”。
