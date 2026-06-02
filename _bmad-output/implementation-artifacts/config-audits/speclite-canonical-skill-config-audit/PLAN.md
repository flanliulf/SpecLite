# PLAN（计划）

## Objective（目标）

对 `assets/source/speclite/core-skills/` 与 `assets/source/speclite/sdlc-skills/` 下所有 canonical skill 定义进行规则依赖审计：

- 逐一提取 skill 定义内容中依赖的配置文件。
- 逐一提取 skill 定义内容中引用的配置项。
- 逐一提取 skill 定义内容中影响研发流程的 rule atom，例如 flow gate mode/result、hard gate、artifact path contract、Story 模板章节、等价实现策略和证据规则。
- 逐一 skill 对照 `_bmad-output/planning-artifacts/` 与 `_bmad-output/implementation-artifacts/` 中的开发文档，检查这些配置文件和配置项是否有定义。
- 分层检查 PRD、Architecture、Specs、Epics、Stories 中是否覆盖应当进入开发过程契约的规则。
- 识别遗漏、不一致、只在 skill 中出现但开发文档未定义、跨 skill 同名基础数据不一致、跨 Story 未体现的情况。
- 所有统计和检查必须由脚本执行，LLM 只负责解释脚本输出和记录结论。

## Scope（范围）

### Included（包含）

- `assets/source/speclite/core-skills/`
- `assets/source/speclite/sdlc-skills/`
- `_bmad-output/planning-artifacts/`
- `_bmad-output/implementation-artifacts/`
- 新增本审计目录下的脚本和结果文件。

### Excluded（不包含）

- `assets/source/speclite/support-skills/`：它们是 canonical skill 源定义的基础支撑工具，不属于本次“目标 AI IDE runtime canonical skill”配置依赖审计对象。
- 源码实现修复：本次先做配置依赖审计与报告，不直接修改 skill 定义或产品代码。
- `node_modules/`、`dist/` 等构建或依赖目录。

## Work Directory（工作目录）

`_bmad-output/implementation-artifacts/config-audits/speclite-canonical-skill-config-audit/`

计划产物：

- `PLAN.md`：本文件，记录总体计划。
- `EXPERIMENTS.md`：记录每次脚本方案、执行结果和取舍。
- `EXPERIMENT_NOTES.md`：记录实时思考和发现。
- `scripts/extract-skill-config-deps.mjs`：提取 core/sdlc skill 中的配置文件和配置项引用。
- `scripts/audit-config-doc-coverage.mjs`：对照开发文档检查配置依赖覆盖情况。
- `scripts/audit-canonical-skill-rule-coverage.mjs`：将配置覆盖结果和流程词法规则合并为 rule atom 清单，并检查 PRD、Architecture、Specs、Epics、Stories 分层覆盖和一致性候选。
- `scripts/triage-rule-coverage.mjs`：对 rule coverage 风险项做去重分流，区分 true gap、legacy baseline、decision needed 和 audit rule tuning。
- `results/skill-config-deps.json`：结构化提取结果。
- `results/skill-config-deps.md`：按 skill 汇总的提取报告。
- `results/config-doc-coverage.json`：结构化对照检查结果。
- `results/config-doc-coverage.md`：开发文档覆盖审计报告。
- `results/canonical-skill-rule-inventory.json` / `results/canonical-skill-rule-inventory.md`：canonical skill 规则原子清单。
- `results/rule-coverage-matrix.json` / `results/rule-coverage-matrix.md`：规则在 PRD、Architecture、Specs、Epics、Stories 中的覆盖矩阵。
- `results/story-rule-coverage-gaps.md`：需要 Story 层体现但当前未命中的规则缺口。
- `results/rule-consistency-findings.json` / `results/rule-consistency-findings.md`：跨 skill 同名基础数据或本地定义上下文不一致候选。
- `results/rule-coverage-triage.json` / `results/rule-coverage-triage.md`：规则覆盖缺口的分流结果和建议执行顺序。

## Method（方法）

1. Inventory（盘点）
   - 用脚本枚举 `core-skills/` 与 `sdlc-skills/` 下所有 skill 目录。
   - 对每个 skill 扫描 `SKILL.md`、`SKILL.en.md`、`customize.toml`、`config.toml.example`、`references/`、`assets/`、`data/` 中的文本文件。
   - `CHANGELOG.md` 只记录变更历史，不作为配置契约来源，必须排除在统计之外。

2. Extraction（提取）
   - 提取配置文件路径：例如 `config.toml`、`customize.toml`、`*.yaml`、`*.yml`、`*.json`、`*.csv`、`*.env`、`_speclite/config.toml`、`_speclite/custom/*.toml`。
   - 提取配置项：例如 `field_name`、`section.key`、`{placeholder}`、TOML/YAML/JSON 中的 key、文档中反复出现的 runtime config key。
   - 每个结果必须带来源文件、行号、上下文、所属 skill。

3. Development Doc Corpus（开发文档语料）
   - 扫描 `_bmad-output/planning-artifacts/` 与 `_bmad-output/implementation-artifacts/` 下的 Markdown、YAML、TOML、JSON、CSV、TXT 等文本文件。
   - 跳过已有 audit 结果、构建产物和明显非开发文档目录。
   - 跳过所有 `CHANGELOG.md`。

4. Coverage Audit（覆盖检查）
   - 对每个 skill 配置文件引用，先解析是否存在于 skill 包本地文件中。
   - 对每个配置项，先判断其是否来自本地配置定义文件中的 TOML/YAML/JSON key 或 CSV header。
   - 对 `SKILL.md` 中的 `{section.key}` 占位符，回连同一 skill 包本地配置定义文件中的 `section.key`。
   - 对 runtime config、artifact path、workflow local variable、external project file reference 做独立分类，避免把已知引用类型误报为开发文档缺失。
   - 对以上规则都无法解析的配置文件引用和配置项，在开发文档语料中做精确 token 检索。
   - 统计是否有命中、命中文档、命中行号和上下文。
   - 标记 `FILE_EXISTS`、`LOCAL_CONFIG_DEFINED`、`LOCAL_PLACEHOLDER_DEFINED`、`RUNTIME_CONFIG_REFERENCE`、`ARTIFACT_PATH_REFERENCE`、`WORKFLOW_LOCAL_VARIABLE`、`EXTERNAL_PROJECT_FILE_REFERENCE`、`EXTERNAL_PROJECT_PATTERN_REFERENCE`、`TEMPLATE_PLACEHOLDER`、`SCHEMA_FIELD_REFERENCE`、`WORKFLOW_PARAMETER_REFERENCE`、`DEFINED_IN_PLANNING_DOCS`、`DEFINED_IN_IMPLEMENTATION_DOCS`、`UNRESOLVED`、`WEAK_DOC_EVIDENCE`。

5. Classification Rules（分类规则）
   - `Local Definition`：来自同一 skill 包的 `config.toml.example`、`customize.toml`、`*.yaml`、`*.json`、`*.csv` key/header。
   - `Local File Reference`：指向同一 skill 包内真实存在的 `references/`、`assets/`、`data/` 等文件。
   - `Local Placeholder Reference`：`SKILL.md` 中的 `{agent.xxx}`、`{workflow.xxx}` 等占位符，能回连同一 skill 的本地配置定义。
   - `Runtime Config Reference`：例如 `{project-root}/_speclite/config.toml`、`{speclite-runtime-root}/custom/{skill-name}.toml`、`core.*`、`agent.*`、`workflow.*` 等 runtime/customization schema 引用。
   - `Artifact Path Reference`：例如 `{implementation_artifacts}/sprint-status.yaml`、`story_location`、`review_input` 等 workflow artifact 路径或产物占位符。
   - `Workflow Local Variable`：例如 `$story_id`、`$cr_dir`、`$failed_layers`，属于步骤内部变量，不按配置项缺失处理。
   - `External Project File Reference`：例如 `Cargo.toml`、`pyproject.toml`、`docker-compose.yml`、`.gitlab-ci.yml`，属于 brownfield/document-project 对目标项目的扫描对象。
   - `External Project Pattern Reference`：例如 `*.java`、`.tsx`、`@TableName(...)`、`pom.xml`、`HEAD~1..HEAD`、`file.ts:42` 等目标项目扫描模式、VCS range 或示例代码位置。
   - `Template Placeholder`：例如 `{{story_key}}`、`{{research_topic_slug}}`，属于模板填充值，不按配置项缺失处理。
   - `Schema Field Reference`：例如 evidence/status/schema 文档中的 `created_at`、`repo_type`、`outputs_generated` 等字段。
   - `Workflow Parameter Reference`：例如 `source_documents`、`token_budget`、`context_file`、`session_topic`、`story-kickoff`，属于 workflow 输入、输出、mode 或派生参数。
   - `Unresolved`：以上规则都无法解释，且开发文档也没有 definition-like 命中的项，才是真正需要后续人工处理或文档补齐的缺口。

6. Consistency Audit（一致性检查）
   - 对同一配置文件或配置项在多个 skill 中的引用形式做去重和差异统计。
   - 对开发文档中出现的同名配置项做路径和语义上下文比较。
   - 对 `data/` 下同名 CSV/JSON/YAML/TOML 基础数据文件做 hash 比较，识别同名不同内容候选。
   - 对关键本地定义字段做上下文比较，识别跨 skill schema/header 不一致候选。
   - 读取 `assets/source/speclite/canonical-data-variant-policy.json`，将已明确声明 scope 的同名数据文件或字段上下文差异归入 accepted variants，而不是待决策缺口。
   - 输出潜在不一致清单，由脚本提供证据，人工只做解释。

7. Rule Atom Coverage（规则原子覆盖）
   - 从配置覆盖结果中继承 `FILE_EXISTS`、`LOCAL_CONFIG_DEFINED`、`LOCAL_PLACEHOLDER_DEFINED`、`RUNTIME_CONFIG_REFERENCE`、`ARTIFACT_PATH_REFERENCE`、`SCHEMA_FIELD_REFERENCE` 等分类。
   - 从 skill 文本中补充流程词法规则：`story-kickoff`、`story-completion`、`epic-completion`、`epic-kickoff`、`PASS_EQUIVALENT`、`FAIL_CONTRACT`、`FAIL_FUNCTION`、`FAIL_EVIDENCE`、`DECISION_NEEDED`、`Dependency Gate`、`Anchor Contract Map`、`Evidence Plan`、`Anchor Evidence Summary`、`owning SPEC`、`equivalent implementation policy`。
   - 对每个 rule atom 扫描 PRD、Architecture、Specs、Epics、Stories，记录命中层、文件、行号、Story key 和 Epic key。
   - 结果分为 `COVERED`、`MISSING_STORY_COVERAGE`、`MISSING_EXPECTED_LAYER`、`NO_DEV_DOC_COVERAGE`、`INVENTORY_ONLY`。
   - `INVENTORY_ONLY` 进入规则清单和一致性检查，但默认不要求逐条出现在 PRD、Architecture、Epic 或 Story。
   - 覆盖缺口只针对生命周期契约类规则：flow gate mode/result、hard gate path、Story 模板章节、证据策略、等价实现策略、关键 artifact path 和 Story 状态字段。
   - 本地配置定义、占位符、模板变量和普通 workflow local variable 先按本地定义/一致性处理，避免把 skill 内部实现细节误判为 Story 缺口。

8. Reporting（报告）
   - 输出 JSON 作为机器可复核证据。
   - 输出 Markdown 作为人工阅读报告。
   - 在 `EXPERIMENTS.md` 与 `EXPERIMENT_NOTES.md` 中记录脚本执行过程、限制和下一步。

9. Triage（分流）
   - 对 `MISSING_EXPECTED_LAYER` 与 `MISSING_STORY_COVERAGE` 做 `category + value` 去重，避免把同一个全局生命周期规则按每个 skill 重复计为独立修复任务。
   - 将缺口分为 `TRUE_GAP`、`LEGACY_BASELINE`、`DECISION_NEEDED`。
   - `TRUE_GAP` 表示需要补齐权威契约或未来流程约束，但不默认批量回改历史 Story。
   - `LEGACY_BASELINE` 表示新版 flow-gate/story-template 规则引入后的历史基线缺口，只约束新建或后续修改的 Story。
   - `DECISION_NEEDED` 表示同名 data/schema 是否应收敛、改名或声明 scope 需要人工决策。
   - 全局生命周期规则的重复来源保留为 `globalRuleAggregations` 追溯证据，不作为最终待处理分流项。

## Completion Criteria（完成标准）

- 所有 `core-skills/` 与 `sdlc-skills/` skill 目录均被脚本枚举。
- 每个 skill 都有配置依赖提取结果，即使结果为空也要明确记录。
- 每条配置文件/配置项引用都带有来源文件和行号。
- 每条配置依赖都完成开发文档覆盖检查。
- 每条 rule atom 都完成 PRD、Architecture、Specs、Epics、Stories 分层覆盖检查，或被明确标记为 `INVENTORY_ONLY`。
- 审计报告明确列出遗漏、不一致、弱证据、Story 层覆盖缺口和无配置依赖的 skill。
- 风险缺口有可复核的分流结果，不要求直接批量修改历史 Story。
- `git diff --check` 通过。
