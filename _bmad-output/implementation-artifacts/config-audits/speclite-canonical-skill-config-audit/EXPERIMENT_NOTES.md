# EXPERIMENT_NOTES（实时笔记）

## 2026-05-27

- 用户要求不能依赖 LLM 推理逐一检查，需要通过明确脚本统计和执行完成。
- 本次审计对象只包括 `assets/source/speclite/core-skills/` 与 `assets/source/speclite/sdlc-skills/`。
- `assets/source/speclite/support-skills/` 是 canonical skill 源定义建设的基础支撑 skill，不纳入目标 runtime canonical skill 配置依赖审计对象。
- 开发文档语料范围是 `_bmad-output/planning-artifacts/` 与 `_bmad-output/implementation-artifacts/`。
- 需要确保每个 skill 都被枚举；没有配置依赖的 skill 也要在结果中记录为空，而不是跳过。
- Skill inventory 当前为 53 个 canonical skills；support skills 明确排除。
- 用户补充：`CHANGELOG.md` 中的信息不纳入统计。脚本已统一跳过所有 `CHANGELOG.md` 来源文件。
- 当前有效配置依赖提取结果：扫描 394 个 skill 文本文件，提取 265 个配置文件引用与 2729 个配置项引用。
- 当前有效开发文档覆盖结果：扫描 228 个开发文档文件，检查 2994 条配置依赖。
- 当前有效覆盖分类：476 条 planning docs 定义、473 条仅 implementation docs 定义、16 条弱证据、2029 条开发文档缺失。
- 5 个 skill 未提取到配置依赖：`speclite-editorial-review-prose`、`speclite-editorial-review-structure`、`speclite-index-docs`、`speclite-review-adversarial-general`、`speclite-shard-doc`。
- 高频缺失项集中在 runtime config schema 和 customization schema，例如 `core.*`、`modules.sdlc.*`、`workflow.*`、`agent.*`、`{speclite-runtime-root}/custom/{skill-name}.toml`。
- 需要把这些结果视为“配置契约覆盖审计”的输出，不直接在本任务中修复 skill 或 planning docs，除非用户后续授权进入修复阶段。
- 完成性校验通过：coverage 条目数 2994 = 配置文件引用 265 + 配置项引用 2729；逐 skill 汇总数量 53 = skillCount 53；support-skills 未被纳入；`CHANGELOG.md` 来源文件未被纳入。
- 用户指出 `references/methods.csv` 实际存在，原报告把它列为 missing 是误报。脚本已改为先检查 `config-file` 是否能解析到 skill 包内真实文件。
- 当前覆盖分类更新为：85 条本地配置文件存在、429 条 planning docs 定义、473 条仅 implementation docs 定义、16 条弱证据、1991 条开发文档缺失。
- `references/methods.csv` 现在标记为 `FILE_EXISTS`，解析路径为 `assets/source/speclite/core-skills/speclite-advanced-elicitation/references/methods.csv`。
- 用户指出 `core.communication_language` 实际由 `config.toml.example` 的 `[core]` section 下 `communication_language = "Chinese"` 定义，原报告把它列为 missing 是误报。脚本已改为先识别本地配置项定义。
- 当前覆盖分类更新为：85 条本地配置文件存在、882 条本地配置项定义、287 条 planning docs 定义、245 条仅 implementation docs 定义、16 条弱证据、1479 条开发文档缺失。
- `core.communication_language` 现在标记为 `LOCAL_CONFIG_DEFINED`，来源为 `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:7`。
- 用户指出 `{agent.activation_steps_prepend}` 和 `{agent.activation_steps_append}` 实际由同包 `customize.toml` 的 `[agent]` section 定义。脚本已建立每个 skill 的本地配置定义索引，并用去花括号后的 key 回连本地定义。
- 当前覆盖分类更新为：85 条本地配置文件存在、1190 条本地配置项定义、241 条 planning docs 定义、112 条仅 implementation docs 定义、16 条弱证据、1350 条开发文档缺失。
- `speclite-agent-analyst` 的 `{agent.activation_steps_prepend}` 与 `{agent.activation_steps_append}` 可回连到同包 `customize.toml:15` 与 `customize.toml:16`；后续分类细化后标记为 `LOCAL_PLACEHOLDER_DEFINED`。
- 进一步确认：同一 skill 中“本地定义 + `{agent.xxx}` 占位引用”现象是普遍模式，不能把 `{...}` 一律当外部缺失配置；必须先按本地定义、本地占位、runtime config、artifact path、workflow 变量、模板占位、schema 字段、workflow 参数和外部项目引用分类。
- `audit-config-doc-coverage.mjs` 已增加 TOML array section、local placeholder、runtime/artifact/workflow/schema/template/external 分类；`{agent.activation_steps_prepend}` 与 `{agent.activation_steps_append}` 现在标记为 `LOCAL_PLACEHOLDER_DEFINED`。
- `speclite-document-project` 的 `architecture_registry.csv` 是真实 stale reference，不是误报；已把该行改为泛化的 full-scan classification reference files。
- 当前最终覆盖分类：扫描 394 个 skill 文本文件，提取 264 个配置文件引用与 2729 个配置项引用；覆盖检查 2993 条；`UNRESOLVED=0`，`WEAK_DOC_EVIDENCE=0`。
- 回归样例全部通过：`references/methods.csv` -> `FILE_EXISTS`，`core.communication_language` -> `LOCAL_CONFIG_DEFINED`，`{agent.activation_steps_prepend}` / `{agent.activation_steps_append}` -> `LOCAL_PLACEHOLDER_DEFINED`，`story-kickoff` -> `WORKFLOW_PARAMETER_REFERENCE`，`HEAD~1..HEAD` / `file.ts:42` -> `EXTERNAL_PROJECT_PATTERN_REFERENCE`。
- `speclite-skill-lint` 需要沉淀 BODY-10 Config reference classification，把本次审计分类口径转成后续 skill 创建和迭代时的规则。
- `speclite-skill-lint` 已新增 BODY-10，版本更新到 2.5.0，规则总数更新到 36 条；density checker 通过，SKILL.md 与 SKILL.en.md 均未触发 density warning。
- 用户校正：`project-types.csv` 是公共基础数据定义文件。已从 `speclite-create-prd/data/project-types.csv` verbatim 复制到 `speclite-document-project/data/project-types.csv` 和 `speclite-edit-prd/data/project-types.csv`；`architecture_registry.csv` 仍不存在并保持不引用。
- `speclite-document-project` 的 full-scan 文案已从 `detection_keywords` 校正为 `detection_signals`，与复制来的 `project-types.csv` header 对齐。
- 校正后最终覆盖分类：扫描 396 个 skill 文本文件，提取 264 个配置文件引用与 2741 个配置项引用；覆盖检查 3005 条；`UNRESOLVED=0`，`WEAK_DOC_EVIDENCE=0`。
- 用户澄清最终目标是检测 canonical skill 中的规则内容是否被 PRD、Architecture、Epic、Story 文档完整覆盖并保持一致，不是只抽配置项。
- 新增 `audit-canonical-skill-rule-coverage.mjs`，把配置覆盖结果提升为 rule atom inventory，并补充 flow gate、hard gate、Story 模板、等价实现策略和证据策略等流程规则。
- Rule coverage 的关键降噪原则：本地配置定义、占位符、模板变量和 workflow local variable 默认是 `INVENTORY_ONLY`，不直接当 Story 缺口；进入缺口判断的必须是开发生命周期契约。
- 初版 rule coverage 曾把大量本地配置定义和普通 `HALT` 误归入覆盖缺口；已收紧为只跟踪 lifecycle contract、关键 artifact path、Story 状态字段和绑定具体路径的 hard gate。
- 当前 rule coverage 结果：2989 个 rule atom、81 个分层开发文档；`COVERED=111`，`INVENTORY_ONLY=2741`，`MISSING_EXPECTED_LAYER=41`，`MISSING_STORY_COVERAGE=96`。
- 当前 Story 缺口集中在新 flow gate 体系、`Anchor Evidence Summary` / `Evidence Plan` / `Dependency Gate` 等 Story 模板章节、`PASS_EQUIVALENT` 等 gate result，以及 `story_location` / `flow_gate_root` / `development_status` 等 Story 生命周期字段。
- 当前一致性候选为 6 项：`domain-complexity.csv`、`project-types.csv`、`speclite-manifest.json` 的同名不同内容候选，以及 `detection_signals`、`suggested_workflow`、`web_searches` 的 header/context 差异候选。
- 规则覆盖结果不是要求把所有 skill 内部变量写进 Story，而是明确哪些规则应进入开发过程契约，哪些只做 inventory/consistency，以避免再次出现“固定路径 anchor 被误当 hard gate”的延迟 HALT 问题。
- 新增 `triage-rule-coverage.mjs`，将 137 个风险覆盖条目按 `coverageRisk + category + value` 去重为 46 个覆盖分流组，并额外识别 13 个全局规则去重调优候选。
- 当前分流统计：`TRUE_GAP=34`、`LEGACY_BASELINE=12`、`DECISION_NEEDED=6`、`AUDIT_RULE_TUNING=13`。
- `TRUE_GAP` 主要分布在 `STORY_LIFECYCLE_SCHEMA_GAP`、`FLOW_GATE_CONTRACT_GAP`、`SYSTEM_CONTRACT_GAP` 和 `ANCHOR_POLICY_GAP`，下一步应补权威契约，不应直接批量修改历史 Story。
- `LEGACY_BASELINE` 主要来自 `Dependency Gate`、`Anchor Contract Map`、`Equivalent Implementation Policy`、`Evidence Plan`、`Anchor Evidence Summary` 等新版 Story 模板字段；策略是不回填已完成 Story，只约束新建或后续修改 Story。
- `AUDIT_RULE_TUNING` 说明当前 coverage matrix 保留 per-skill source evidence 是必要的，但修复规划应按全局规则去重，否则会把同一 `story-completion` 或 `PASS_EQUIVALENT` 规则重复算作多个修复任务。

## 2026-05-28

- P1 `TRUE_GAP` 的正确处理方式不是批量回填历史 Story，而是先补 SDLC workflow lifecycle 的 owning SPEC，再让 Architecture、Specs index 和 Epic 层引用同一契约。
- 已新增 `09-sdlc-workflow-lifecycle-contract.md`，统一定义 runtime artifact roots、Story lifecycle artifact paths、`development_status`、Flow Gate modes/results、anchor classification、Story template sections、legacy baseline rule 和 consumer requirements。
- 已同步 Specs index、Architecture 和 Epics，使 flow gate、Story path、status schema、anchor equivalence 和 legacy Story baseline 都有体系级定义来源。
- 复跑 rule coverage 后，`MISSING_EXPECTED_LAYER` 从 41 降为 0，说明 PRD/Architecture/Specs/Epics 预期层面的体系契约缺口已补齐。
- 剩余 `MISSING_STORY_COVERAGE=96` 全部是历史 Story 未包含新版 template/gate 字段的基线问题，不应作为当前 P1 阻塞项；后续只要求新建或修改 Story 使用新版模板与 gate evidence。
- `triage-rule-coverage.mjs` 已把仅缺 Story 层的 flow gate 和 Story lifecycle 规则归为 `LEGACY_BASELINE`，当时分流无 `TRUE_GAP`，剩余为 `LEGACY_BASELINE=40`、`AUDIT_RULE_TUNING=13`、`DECISION_NEEDED=6`。
- `AUDIT_RULE_TUNING` 已完成：13 个全局生命周期规则重复来源改为 `globalRuleAggregations` 追溯证据，不再进入最终 disposition 统计。
- 最新最终分流为 `LEGACY_BASELINE=40`、`DECISION_NEEDED=6`；`auditRuleTuningCandidateCount=0`、`resolvedAuditRuleTuningCount=13`。
- 下一步优先级：处理 `DECISION_NEEDED` 的 shared data/schema 变体决策，重点是 `project-types.csv`、`domain-complexity.csv`、`speclite-manifest.json` 及相关 header/context 差异。
- `DECISION_NEEDED` 已完成：新增 `assets/source/speclite/canonical-data-variant-policy.json`，声明 `project-types.csv`、`domain-complexity.csv`、`speclite-manifest.json` 及 `detection_signals`、`suggested_workflow`、`web_searches` 的 accepted scope。
- 最新 consistency 结果为 `consistencyFindingCount=0`、`acceptedConsistencyVariantCount=6`。
- 最新最终 triage 只剩 `LEGACY_BASELINE=40`；无 `TRUE_GAP`、无 `AUDIT_RULE_TUNING`、无 `DECISION_NEEDED`。
- 当前剩余项都是历史 Story 未批量回填新版 flow gate / Story template 字段的 legacy baseline，不应阻塞后续 canonical skill 迭代。

## Closeout（收尾结论）

- 本轮 canonical skill rule/config 审计已完成闭环：配置引用误报已归零，rule coverage 的体系级契约缺口已归零，shared data/schema 决策项已通过 variant policy 关闭。
- 当前最终状态：`UNRESOLVED=0`、`WEAK_DOC_EVIDENCE=0`、`MISSING_EXPECTED_LAYER=0`、`consistencyFindingCount=0`、`auditRuleTuningCandidateCount=0`。
- 最终 triage 只保留 `LEGACY_BASELINE=40`；这些都是历史 Story 未回填新版 flow gate / Story template 字段，不应批量修改历史 Story，也不应阻塞后续开发。
- 后续新建、重新打开、进入开发或进入 review 的 Story 必须按 `09-sdlc-workflow-lifecycle-contract.md`、新版 Story template 和 flow gate policy 执行。
- 已同步顶层维护文档：`assets/source/speclite/README.md`、`assets/source/speclite/README.en.md` 和 `assets/source/speclite/CANONICAL_SKILL_ITERATION_CONTEXT.md`。
