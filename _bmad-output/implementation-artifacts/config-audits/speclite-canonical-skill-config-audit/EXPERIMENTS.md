# EXPERIMENTS（实验记录）

## Experiment 001（实验 001）：建立审计工作目录和计划

- 时间：2026-05-27
- 方案：在 `_bmad-output/implementation-artifacts/config-audits/speclite-canonical-skill-config-audit/` 下建立独立审计目录，创建 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`、`scripts/`、`results/`。
- 原因：本任务是一次跨 canonical skill 与开发文档的配置依赖审计，不属于单个 Story、SR 或 CR，使用独立 `config-audits/` 目录能避免和现有 Story/Review 产物混杂。
- 结果：已创建目录和三份进度文件。下一步是用脚本盘点 skill 目录和开发文档语料。

## Experiment 002（实验 002）：初版配置依赖提取脚本

- 时间：2026-05-27
- 方案：新增 `scripts/config-extract-lib.mjs` 与 `scripts/extract-skill-config-deps.mjs`，递归扫描 `core-skills/` 与 `sdlc-skills/` 下的 skill 文本文件，并提取配置文件引用、占位符、反引号配置项、TOML/YAML/JSON/CSV key。
- 原因：用户明确要求不能依赖 LLM 推理，需要脚本逐一统计和执行。
- 结果：初版运行覆盖 53 个 skill，扫描 463 个文件，提取 470 个配置文件引用与 3222 个配置项引用。
- 观察：初版规则偏宽，把部分脚本源码变量、普通 Markdown 文件名和非配置文件也纳入了配置依赖。
- 结论：需要收紧规则后复跑。

## Experiment 003（实验 003）：收紧配置依赖提取规则

- 时间：2026-05-27
- 方案：排除 skill 内 `.ts`、`.js`、`.mjs`、`.sh`、`.py` 等脚本源码；配置文件引用限定为 TOML/YAML/JSON/CSV/ENV 与配置语义文件名；Markdown 中不再按普通 `key: value` 提取，只保留占位符和反引号 token。
- 原因：本次审计对象是 skill 定义中的依赖配置文件和配置项，不应把实现脚本内部变量误当配置契约。
- 结果：复跑后覆盖 53 个 skill，扫描 447 个文件，提取 280 个配置文件引用与 2754 个配置项引用。
- 结论：规则仍保守偏全，但已去掉明显非配置源码变量，适合作为后续覆盖检查输入。

## Experiment 004（实验 004）：开发文档覆盖审计脚本

- 时间：2026-05-27
- 方案：新增 `scripts/audit-config-doc-coverage.mjs`，读取 `skill-config-deps.json`，扫描 `_bmad-output/planning-artifacts/` 与 `_bmad-output/implementation-artifacts/` 开发文档语料，排除本审计目录自身，对每条配置依赖做精确 token 检索和 definition-like 行分类。
- 原因：需要逐一 skill 检查配置项是否在开发文档中有定义，并区分 planning 文档定义、implementation 文档定义、弱证据和缺失。
- 结果：最终复跑扫描 228 个开发文档文件，检查 3034 条配置依赖；其中 510 条命中 planning docs 定义、474 条仅命中 implementation docs 定义、16 条弱证据、2034 条开发文档缺失。
- 补充：报告中新增 `Per Skill Findings`，确保 53 个 skill 均被逐一列出；5 个 skill 未提取到配置依赖，也在报告中明确记录。
- 结论：开发文档覆盖存在明显缺口，尤其是 runtime config key、customization path、workflow activation fields、sprint/status path 等高频项。

## Experiment 005（实验 005）：不一致候选输出

- 时间：2026-05-27
- 方案：在覆盖审计脚本中增加 `High Repeat Missing Values` 和 `Runtime Path Variants` 章节，按缺失值跨 skill 出现次数排序，并归并 `_speclite`、`{speclite-runtime-root}`、`{skill-root}` 等 runtime path 变体。
- 原因：单条缺失列表太长，无法直接看出全局性不一致；需要由脚本汇总高频和路径变体。
- 结果：脚本识别出 6 组 runtime path 变体候选；高频缺失项包括 `modules.sdlc.implementation_artifacts`、`core.communication_language`、`core.document_output_language`、`core.output_folder`、`core.user_name`、`core.user_skill_level`、`{speclite-runtime-root}/custom/{skill-name}.toml`、`{skill-root}/customize.toml` 等。
- 结论：存在一类通用文档缺口：skill 已经广泛依赖 runtime config 与 customization schema，但 planning/implementation 文档没有形成足够完整、统一的配置契约定义。

## Experiment 006（实验 006）：完成性校验

- 时间：2026-05-27
- 方案：执行 `git diff --check`，并用 Node 断言结果中的 `skillCount`、`perSkillSummary`、`coverage`、`docFileCount` 等关键计数一致。
- 原因：需要证明脚本确实覆盖全部 canonical skill，并且 coverage 条目数量与配置依赖提取数量一致。
- 结果：`git diff --check` 无输出；断言通过。结果为：53 个 skill、447 个 skill 文本文件、280 个配置文件引用、2754 个配置项引用、3034 个覆盖检查条目、53 个逐 skill 汇总、228 个开发文档文件、5 个无配置依赖 skill。
- 结论：本轮配置依赖审计已完成，可基于报告进入后续文档或 skill 修复阶段。

## Experiment 007（实验 007）：排除 CHANGELOG.md 后复跑

- 时间：2026-05-27
- 方案：按用户补充要求修改提取库，所有 `CHANGELOG.md` 均不作为 skill 配置依赖来源，也不作为开发文档覆盖语料来源；随后复跑 `extract-skill-config-deps.mjs` 和 `audit-config-doc-coverage.mjs`。
- 原因：`CHANGELOG.md` 只记录变更历史，不能作为配置契约统计依据。
- 结果：复跑后仍覆盖 53 个 skill；扫描 skill 文本文件从 447 降为 394；配置文件引用从 280 降为 265；配置项引用从 2754 降为 2729；覆盖检查条目从 3034 降为 2994。
- 覆盖分类：476 条 planning docs 定义、473 条仅 implementation docs 定义、16 条弱证据、2029 条开发文档缺失。
- 校验：来源文件路径校验通过，skill 来源和开发文档命中文件均不包含 `CHANGELOG.md`；coverage 条目数 2994 = 配置文件引用 265 + 配置项引用 2729；逐 skill 汇总数量 53 = skillCount 53。
- 备注：结果 JSON 的上下文文本可能包含字符串 `CHANGELOG.md`，这是其他开发文档在描述安装白名单，并不是从 `CHANGELOG.md` 文件读取信息。
- 结论：当前有效审计口径已排除 `CHANGELOG.md`。

## Experiment 008（实验 008）：修正本地配置文件存在性误报

- 时间：2026-05-27
- 问题：`config-doc-coverage.md` 将 `speclite-advanced-elicitation` 的 `references/methods.csv` 标记为 `MISSING_IN_DOCS`，但该文件实际存在于 skill 包内，属于本地配置文件存在性证据，不应作为开发文档缺失项。
- 方案：增强 `audit-config-doc-coverage.mjs`，对 `config-file` 引用先执行本地路径解析和存在性检查，再进入开发文档覆盖分类。解析策略包括：
  - 相对引用来源文件目录解析。
  - 相对 skill root 解析。
  - `{skill-root}` 占位符替换。
  - skill 包内唯一 basename 匹配。
- 原因：配置文件引用和配置项引用的验证语义不同。配置项需要看开发文档是否定义；本地配置文件引用如果能解析到 skill 包内真实文件，应该先标记为 `FILE_EXISTS`。
- 结果：复跑后 `references/methods.csv` 已标记为 `FILE_EXISTS`，解析到 `assets/source/speclite/core-skills/speclite-advanced-elicitation/references/methods.csv`。
- 新统计：配置依赖总数仍为 2994；其中本地配置文件存在 85 条、planning docs 定义 429 条、仅 implementation docs 定义 473 条、弱证据 16 条、开发文档缺失 1991 条。
- 结论：这一类“skill 包内实际存在的配置文件被误报为开发文档缺失”的问题已由脚本逐项检查和更正。

## Experiment 009（实验 009）：修正本地配置项定义误报

- 时间：2026-05-27
- 问题：`config-doc-coverage.md` 将 `speclite-advanced-elicitation` 的 `core.communication_language` 标记为 `MISSING_IN_DOCS`，但该字段实际由 `config.toml.example` 的 `[core]` section 下 `communication_language = "Chinese"` 定义。
- 方案：增强 `audit-config-doc-coverage.mjs`，对 `config-item` 先识别是否来自本地配置定义来源，再进入开发文档覆盖分类。定义来源包括：
  - `toml-key`
  - `toml-section`
  - `yaml-key`
  - `json-key`
  - `csv-header`
  - 非 Markdown 配置文件中的 assignment。
- 原因：配置项引用和配置项定义不是同一类证据。来自 `config.toml.example`、`customize.toml`、YAML/JSON/CSV 配置源文件的 key 本身就是本地配置定义，不能再因为开发文档未重复定义而标记为缺失。
- 结果：复跑后 `core.communication_language` 已标记为 `LOCAL_CONFIG_DEFINED`，来源为 `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:7`，提取来源为 `toml-key`。
- 新统计：配置依赖总数仍为 2994；其中本地配置文件存在 85 条、本地配置项定义 882 条、planning docs 定义 287 条、仅 implementation docs 定义 245 条、弱证据 16 条、开发文档缺失 1479 条。
- 结论：这一类“本地配置定义文件中的字段被误报为开发文档缺失”的问题已由脚本逐项检查和更正。

## Experiment 010（实验 010）：修正占位符引用与本地配置定义断联误报

- 时间：2026-05-27
- 问题：`config-doc-coverage.md` 将 `speclite-agent-analyst` 的 `{agent.activation_steps_prepend}` 和 `{agent.activation_steps_append}` 标记为 `MISSING_IN_DOCS`，但它们实际由同一 skill 包 `customize.toml` 中 `[agent] activation_steps_prepend` 和 `activation_steps_append` 定义。
- 方案：在 `audit-config-doc-coverage.mjs` 中按 skill 建立本地配置定义索引，并在检查 `config-item` 时增加跨引用匹配：
  - 去掉 `{...}` 花括号后做 exact match。
  - 若无 section 前缀，则允许在同一 skill 本地定义中做唯一 suffix match。
  - 记录 `matchedValue` 和 `matchKind`，区分 `same-reference`、`placeholder-unwrapped`、`unique-suffix`。
- 原因：`SKILL.md` 中的 `{agent.xxx}` 是对本地 customization schema 的引用，不是独立配置项；如果同一 skill 的 `customize.toml` 已定义该 key，应视为本地配置项已定义。
- 结果：复跑后 `{agent.activation_steps_prepend}` 和 `{agent.activation_steps_append}` 均可回连到 `customize.toml:15` 与 `customize.toml:16`；后续分类细化中已标记为 `LOCAL_PLACEHOLDER_DEFINED`。
- 新统计：配置依赖总数仍为 2994；其中本地配置文件存在 85 条、本地配置项定义 1190 条、planning docs 定义 241 条、仅 implementation docs 定义 112 条、弱证据 16 条、开发文档缺失 1350 条。
- 结论：这一类“SKILL.md 占位符引用未回连到同包本地配置定义”的问题已由脚本逐项检查和更正。

## Experiment 011（实验 011）：配置引用分类规则与剩余误报归零

- 时间：2026-05-27
- 问题：同一 skill 中普遍存在本地定义、外部引用、占位引用、workflow 变量、artifact path、schema 字段和示例路径混用。如果不先分类，审计会把大量可解释引用误报为配置缺失。
- 方案：在 `PLAN.md` 中补充分类规则，并增强 `audit-config-doc-coverage.mjs`：
  - 识别 TOML array section，例如 `[[agent.menu]]`。
  - 将 `{agent.xxx}` 等占位符标记为 `LOCAL_PLACEHOLDER_DEFINED`，保留和普通本地配置定义的区别。
  - 增加 runtime config、artifact path、workflow local variable、external project file/pattern、template placeholder、schema field、workflow parameter 等分类。
  - 将 `story-kickoff`、`story-completion` 等 flow gate mode 归为 workflow parameter；将 `HEAD~1..HEAD`、`file.ts:42` 等归为 external project pattern/sample。
  - 将 brownfield evidence JSON 输出归为 artifact path。
- 逐项修正：`speclite-document-project` 中 `architecture_registry.csv` 不存在且仅为 stale resume 文案，已改为泛化的 full-scan classification reference files，不再引用不存在文件名。
- 结果：复跑后覆盖 53 个 skill，扫描 394 个 skill 文本文件，配置文件引用 264 条、配置项引用 2729 条，覆盖检查 2993 条；`UNRESOLVED=0`、`WEAK_DOC_EVIDENCE=0`。
- 回归校验：
  - `references/methods.csv` -> `FILE_EXISTS`。
  - `core.communication_language` -> `LOCAL_CONFIG_DEFINED`。
  - `{agent.activation_steps_prepend}` / `{agent.activation_steps_append}` -> `LOCAL_PLACEHOLDER_DEFINED`。
  - `story-kickoff` -> `WORKFLOW_PARAMETER_REFERENCE`。
  - `HEAD~1..HEAD` / `file.ts:42` -> `EXTERNAL_PROJECT_PATTERN_REFERENCE`。
  - `development_status{story_key}` -> `SCHEMA_FIELD_REFERENCE`。
  - 结果中的 source `CHANGELOG.md` 文件路径命中数为 0。
- 结论：本轮误报修正已完成；剩余需要沉淀到 `speclite-skill-lint`，防止新 skill 继续引入未分类配置状引用。

### Correction（校正）：project-types.csv 作为公共基础数据文件

- 用户校正：`project-types.csv` 是公共基础数据定义文件，不应因为 `speclite-document-project` 目录下缺失就泛化掉所有相关语义；可从其他 skill 的 `data/project-types.csv` 复制补齐。
- 处理：
  - 从 `speclite-create-prd/data/project-types.csv` 复制到 `speclite-document-project/data/project-types.csv`。
  - 同步复制到同样提到 `project-types.csv` 但缺少本地 data 文件的 `speclite-edit-prd/data/project-types.csv`。
  - `architecture_registry.csv` 仍确认不存在，继续不再引用。
  - 将 `speclite-document-project` 的 full-scan 文案从 `detection_keywords` 校正为 `project-types.csv` 实际字段 `detection_signals`。
- 结果：复跑后覆盖 53 个 skill，扫描 396 个 skill 文本文件，配置文件引用 264 条、配置项引用 2741 条，覆盖检查 3005 条；`UNRESOLVED=0`、`WEAK_DOC_EVIDENCE=0`。

## Experiment 012（实验 012）：沉淀 skill lint 规则

- 时间：2026-05-27
- 方案：更新 `speclite-skill-lint`，新增 BODY-10 Config reference classification rule，并同步 `SKILL.md`、`SKILL.en.md`、`references/check-rules.md`、`references/lint-workflow.md` 和 `CHANGELOG.md`。
- 内容：BODY-10 要求配置状引用必须能分类为 local file、local config definition、local placeholder reference、runtime config、artifact path、workflow local variable/parameter、template placeholder、schema field、external project reference 或 contract-defined reference。
- 版本：`speclite-skill-lint` 从 2.4.0 更新为 2.5.0，规则总数从 35 条更新为 36 条。
- 验证：`python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/support-skills/speclite-skill-lint` 通过；SKILL.md 与 SKILL.en.md 均未触发 density warning，核心能力条数均为 8。
- 结论：本次误报根因已转化为后续 skill lint 的可执行检查规则。

## Experiment 013（实验 013）：Canonical Skill Rule Atom 覆盖矩阵

- 时间：2026-05-27
- 背景：用户澄清最终目标不是只看配置项是否存在，而是要检测每个 SpecLite canonical skill 中的规则内容是否在 PRD、Architecture、Epic，尤其 Story 文档中完整覆盖且保持一致。
- 方案：新增 `scripts/audit-canonical-skill-rule-coverage.mjs`，读取 `config-doc-coverage.json`，再从 skill 文本中补充 flow gate、hard gate、Story 模板章节、证据策略和等价实现策略等流程规则，生成 rule atom inventory、coverage matrix、story gaps 和 consistency findings。
- 分层语料：脚本分别扫描 `_bmad-output/planning-artifacts/prd/`、`architecture/`、`specs/`、`epics/` 和 `_bmad-output/implementation-artifacts/stories/`，并记录每个 rule atom 在 PRD、Architecture、Specs、Epics、Stories 中的命中计数、命中行和 Story key。
- 降噪口径：
  - 本地配置定义、占位符、模板变量、普通 workflow local variable 默认标记为 `INVENTORY_ONLY`，只进入规则清单和一致性检查。
  - 进入覆盖缺口判断的范围限定为生命周期契约类规则：flow gate mode/result、hard gate path、Story 模板章节、证据策略、等价实现策略、关键 artifact path 和 Story 状态字段。
  - 普通 `HALT` 文案不再当作 hard gate path 覆盖缺口；只有绑定具体路径的 hard gate 才要求跨层覆盖。
- 结果：最终复跑得到 2989 个 rule atom、81 个开发过程文档文件；覆盖风险为 `COVERED=111`、`INVENTORY_ONLY=2741`、`MISSING_EXPECTED_LAYER=41`、`MISSING_STORY_COVERAGE=96`。
- 一致性发现：脚本识别 6 个候选，包括 `domain-complexity.csv`、`project-types.csv`、`speclite-manifest.json` 的同名不同内容候选，以及 `detection_signals`、`suggested_workflow`、`web_searches` 的跨 skill header/context 差异候选。
- 产物：
  - `results/canonical-skill-rule-inventory.json` / `results/canonical-skill-rule-inventory.md`
  - `results/rule-coverage-matrix.json` / `results/rule-coverage-matrix.md`
  - `results/story-rule-coverage-gaps.md`
  - `results/rule-consistency-findings.json` / `results/rule-consistency-findings.md`
- 结论：规则覆盖审计已从“配置项解析”扩展到“开发过程契约覆盖和一致性检查”。现有缺口主要集中在新引入的 flow gate/Anchor Evidence/Story template 规则尚未反映到既有 Story 文档，以及 runtime artifact 根路径在 Architecture/Specs 层缺少统一契约定义。

## Experiment 014（实验 014）：Rule Coverage Triage 分流

- 时间：2026-05-27
- 方案：新增 `scripts/triage-rule-coverage.mjs`，读取 `rule-coverage-matrix.json` 和 `rule-consistency-findings.json`，对 `MISSING_EXPECTED_LAYER` 与 `MISSING_STORY_COVERAGE` 按 `coverageRisk + category + value` 去重分流，并输出 `rule-coverage-triage.json` / `rule-coverage-triage.md`。
- 原因：原始风险条目按 skill 计数，适合追溯 source evidence，但不适合直接当修复任务清单；例如 `story-completion`、`PASS_EQUIVALENT` 这类全局生命周期规则会在多个 skill 中重复出现。
- 分流口径：
  - `TRUE_GAP`：需要补齐权威契约或未来流程约束，但不默认批量回改历史 Story。
  - `LEGACY_BASELINE`：由 flow-gate/story-template 改造后引入的历史基线缺口，只约束新建或后续修改的 Story。
  - `DECISION_NEEDED`：需要确认同名 data/schema 是否应收敛、改名或声明 scope。
  - `AUDIT_RULE_TUNING`：报告层应优化去重或展示方式，避免把同一全局规则重复计为多个独立修复任务。
- 结果：137 个风险覆盖条目去重为 46 个覆盖分流组；另有 6 个一致性候选和 13 个审计规则调优候选。
- 分流统计：`TRUE_GAP=34`、`LEGACY_BASELINE=12`、`DECISION_NEEDED=6`、`AUDIT_RULE_TUNING=13`。
- 关键桶：`STORY_LIFECYCLE_SCHEMA_GAP=19`、`FLOW_GATE_CONTRACT_GAP=9`、`SYSTEM_CONTRACT_GAP=5`、`ANCHOR_POLICY_GAP=1`、`STORY_TEMPLATE_MIGRATION_BASELINE=12`。
- 结论：下一轮不应批量回改历史 Story；应先补体系级 contract，再把 legacy baseline 和全局规则去重口径写回审计/skill 规范，最后处理 shared data 的设计决策。

## Experiment 015（实验 015）：P1 TRUE_GAP 体系级契约补齐

- 时间：2026-05-28
- 方案：新增 `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md` 作为 SDLC workflow lifecycle owning SPEC，并同步更新 Specs index、Architecture 和 Epics 的引用层。
- 修改范围：
  - `specs/09-sdlc-workflow-lifecycle-contract.md`：定义 runtime artifact roots、Story lifecycle artifact paths、`development_status`、Flow Gate modes/results、anchor classification、Story template sections、legacy baseline rule 和 consumer requirements。
  - `specs/README.md`：加入新 SPEC 的 reading order，并声明 canonical skill contract anchors。
  - `architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`：把 SDLC workflow lifecycle 字段和 gate/status schema 统一指向新 SPEC。
  - `architecture/05-project-structure-boundaries项目结构与边界.md`：把 `_speclite-output` 下 SDLC workflow artifact path 语义指向新 SPEC。
  - `epics/03-epic-listepic-列表.md`：增加跨 Epic SDLC Workflow Contract，要求所有 MVP Epic/Story 引用新 SPEC，不在单个 Story 或 review/finalizer 中重定义流程契约。
- 结果：复跑 rule coverage 后，`MISSING_EXPECTED_LAYER` 从 41 降为 0；`COVERED` 从 111 增至 152；剩余 `MISSING_STORY_COVERAGE=96`。
- Triage 调整：`triage-rule-coverage.mjs` 现在会把仅缺历史 Story 层的 Flow Gate 和 Story lifecycle rule 标记为 `LEGACY_BASELINE`，而不是继续作为 P1 `TRUE_GAP`。
- 当时分流统计：`LEGACY_BASELINE=40`、`AUDIT_RULE_TUNING=13`、`DECISION_NEEDED=6`，没有剩余 `TRUE_GAP`。
- 结论：P1 体系级 contract 缺口已处理完成；剩余问题不应阻塞当前实现流转，下一步应处理报告去重和 shared data variant 决策。

## Experiment 016（实验 016）：全局规则聚合展示调优

- 时间：2026-05-28
- 问题：Experiment 015 后 `coverageGroups` 已按 `category + value` 去重，但脚本仍把 13 个重复来源复制为 `AUDIT_RULE_TUNING` 分流项，导致报告看起来仍有独立待处理项。
- 方案：调整 `triage-rule-coverage.mjs`：
  - `AUDIT_RULE_TUNING` 不再作为最终 disposition。
  - flow gate mode/result 与 Story template section 的多 skill 来源保留为 `globalRuleAggregations`。
  - `dispositionCounts` 只统计真正需要处理的 `LEGACY_BASELINE` 与 `DECISION_NEEDED`。
  - Markdown 报告新增 `Global Rule Aggregation`，说明 per-skill source evidence 只用于追溯，不再计为独立修复任务。
- 结果：复跑完整审计链后，`auditRuleTuningCandidateCount=0`、`resolvedAuditRuleTuningCount=13`、`globalRuleAggregationCount=13`。
- 最新分流统计：`LEGACY_BASELINE=40`、`DECISION_NEEDED=6`，没有剩余 `TRUE_GAP` 或 `AUDIT_RULE_TUNING`。
- 结论：报告层重复扩大修复量的问题已处理；下一步只剩 shared data/schema variant 的 `DECISION_NEEDED` 设计决策。

## Experiment 017（实验 017）：Shared Data Variant Scope 声明

- 时间：2026-05-28
- 问题：剩余 6 个 `DECISION_NEEDED` 来自 3 组同名数据文件和 3 个派生字段上下文差异：
  - `project-types.csv`
  - `domain-complexity.csv`
  - `speclite-manifest.json`
  - `detection_signals`
  - `suggested_workflow`
  - `web_searches`
- 证据判断：
  - `project-types.csv` 的 PRD/document/edit/validate 版本共享 PRD discovery schema；`speclite-create-architecture` 版本是 architecture starter mapping schema。
  - `domain-complexity.csv` 的 PRD/validate 版本是 domain compliance guidance；`speclite-create-architecture` 版本是 architecture complexity and research topic mapping。
  - `speclite-manifest.json` 是 skill-local capability manifest，按 skill 描述不同 capability 是预期行为。
- 方案：
  - 新增 `assets/source/speclite/canonical-data-variant-policy.json`，机器可读声明 accepted basename variants 和 accepted field context variants。
  - 更新 `audit-canonical-skill-rule-coverage.mjs`，读取 variant policy，把已声明 scope 的同名文件与字段上下文差异移动到 `acceptedVariants`。
  - 更新 `triage-rule-coverage.mjs`，报告 accepted consistency variant 数量；无待决策项时不再输出空决策表。
- 结果：复跑完整审计链后，`consistencyFindingCount=0`、`acceptedConsistencyVariantCount=6`、`DECISION_NEEDED=0`。
- 最新最终分流：只剩 `LEGACY_BASELINE=40`；无 `TRUE_GAP`、无 `AUDIT_RULE_TUNING`、无 `DECISION_NEEDED`。
- 结论：Shared data/schema variant 决策已通过显式 scope policy 关闭；当前剩余项均为历史 Story legacy baseline，不需要回填已完成 Story。
