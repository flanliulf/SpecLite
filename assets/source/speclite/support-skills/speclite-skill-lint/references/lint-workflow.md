# Skills Lint Workflow

## Overview（概述）

本文档承载 `speclite-skill-lint` 的详细扫描流程。入口 SKILL.md 只保留阶段路由；执行 36 条规则时按本文档逐组检查。若入口与本文档冲突，以本文档的执行细则为准。

## Target Discovery（目标定位）

支持三类输入：
- 完整目录路径，例如 `assets/source/speclite/support-skills/speclite-skill-creator/`。
- Skill 名称，例如 `speclite-skill-creator`，按 `assets/source/speclite/`、`.claude/skills/`、`.agents/skills/`、`.codex/skills/` 的实际存在目录搜索。
- "所有 Skill"，批量扫描上述实际存在目录。

目标目录必须包含 SKILL.md。缺少 SKILL.md 时报告关键文件缺失并终止该目标。

## Read Phase（读取阶段）

对每个目标读取：
- SKILL.md，并拆分 YAML frontmatter 和正文。
- SKILL.en.md，如存在则同样拆分。
- CHANGELOG.md，如存在则提取最新版本。
- references/、scripts/、assets/ 的文件树。
- SKILL.md 与 SKILL.en.md 中引用的相对路径。

然后运行：

```bash
python3 scripts/check_skill_density.py <skill-dir>
```

脚本输出 JSON 字段用于 BODY-07 与 BODY-08，不允许用 LLM 估算替代脚本结果。

## Rule Groups（规则分组）

1. YAML Frontmatter（YML-01 ~ YML-05）
   - 验证 name、description、顶级属性白名单、metadata 字段契约和 YAML 安全边界。

2. Description Quality（DESC-01 ~ DESC-03）
   - 验证三段式结构、中英文触发词覆盖、触发词具体性和尖括号安全。

3. File Structure（FILE-01 ~ FILE-06）
   - 验证 SKILL.md、SKILL.en.md、CHANGELOG.md、目录名、README.md 禁止项和保留前缀。

4. Version Consistency（VER-01 ~ VER-05）
   - 验证 metadata.version、CHANGELOG 最新版本、日期格式、metadata.author、metadata.catalog 字段契约和 SKILL.en.md 版本一致性。

5. Body Quality（BODY-01 ~ BODY-10）
   - 验证正文长度、必需章节、引用路径、模糊表述、核心能力条数、中文 canonical 语言规则、Workflow density、Workflow extraction、fixed path hard gate 和 config reference classification。

6. Naming（NAME-01 ~ NAME-03）
   - 验证 references/、scripts/、assets/ 文件命名。

7. Mirror（MIRROR-01 ~ MIRROR-03）
   - 验证 SKILL.en.md YAML 对齐、英文章节齐备和引用路径同步。

8. Classification（CLASS-01 ~ CLASS-03）
   - 验证模板、脚本和知识文档是否放在正确目录。

## Metadata Contract（metadata 字段契约）

检查 YAML frontmatter 时只认可以下 `metadata` 子字段：
- `metadata.version`：必填，SemVer 格式，并与 CHANGELOG.md 最新版本和 SKILL.en.md 一致。
- `metadata.author`：必填，非空，记录原始作者。
- `metadata.catalog`：可选；存在时必须非空、kebab-case，并与源码 catalog 归属及 SKILL.en.md mirror 一致。

发现未登记的 `metadata.*` 字段时，在 YML-04 中报告非法字段；不要把未知字段解释为开放扩展。

## Workflow Density（Workflow 密度）

BODY-07 与 BODY-08 必须使用 `scripts/check_skill_density.py` 的输出：
- `body_chars`：入口正文字符数。
- `workflow_chars`：Workflow 章节字符数。
- `workflow_ratio`：Workflow 占正文比例。
- `near_body_limit`：`body_chars >= 4500`。
- `has_workflow_reference`：入口是否引用 workflow reference。
- `triggered_density_warning`：`workflow_chars > 1500` 且 `workflow_ratio > 0.5`。

报告建议：
- BODY-07：当 `triggered_density_warning` 为 true 时，提示 Workflow 过重。
- BODY-08：当 BODY-07 命中且 `has_workflow_reference` 为 false 时，建议抽取 `references/<skill-name>-workflow.md` 或等价 workflow reference。
- 如果 `near_body_limit` 为 true，在 BODY-07 详情中提示正文接近 5000 字上限。

## Flow Gate Wording（门控措辞）

BODY-09 扫描 SKILL.md、SKILL.en.md 和 references/ 中的正文段落：
- 若段落同时包含强制门控词（如 `must exist`、`required file`、`hard gate`、`必须存在`、`必须有`）和具体源码路径（如 `src/`、`test/`、`assets/source/`、`fixtures/`），检查同段或相邻段落是否说明 owning SPEC 或 equivalent implementation policy。
- 若未说明，报告 Warning，并建议将固定路径改写为 Contract Anchor、Functional Anchor、Evidence Anchor 或 Guidance Anchor。
- 固定文件名只有 owning SPEC 明确要求时才可作为 hard gate；否则 workflow skill 必须允许等价 functional implementation 通过证据门控。

## Config Reference Classification（配置引用分类）

BODY-10 扫描 SKILL.md、SKILL.en.md 和 references/ 中的配置状引用：
- 配置文件候选：`*.toml`、`*.yaml`、`*.yml`、`*.json`、`*.csv`、`*.env`，以及包含 config、customize、settings、module、manifest、index、status、context、coverage、workflow、registry、schema、methods、help、files、phase 等语义的文件名。
- 配置项候选：`{section.key}`、`section.key`、`*_file`、`*_path`、`*_dir`、`*_root`、`*_location`、`*_status`、`*_pattern`、`workflow.*`、`agent.*`、`core.*`、`modules.*` 和 workflow mode。

分类顺序：
1. Local file：能解析到同一 skill 包内真实存在的 `references/`、`assets/`、`data/`、`scripts/` 或配置文件。
2. Local config definition：来自同一 skill 的 `config.toml.example`、`customize.toml`、YAML、JSON 或 CSV header。
3. Local placeholder reference：`SKILL.md` 或 `SKILL.en.md` 中的 `{agent.xxx}`、`{workflow.xxx}` 等能回连同一 skill 本地配置定义。
4. Runtime config：`{project-root}`、`{speclite-runtime-root}`、`{skill-root}`、`core.*`、`agent.*`、`workflow.*`、`modules.*` 等 runtime/customization schema。
5. Artifact path：`{implementation_artifacts}`、`{planning_artifacts}`、`story_location`、`flow_gate_root`、`*_file`、`*_path`、`*_dir` 等 workflow 产物或路径变量。
6. Workflow local variable / parameter：`$name`、`story-kickoff`、`story-completion`、`source_documents`、`token_budget`、`review_mode`、`story_key` 等步骤内部变量、mode 或输入输出参数。
7. Template placeholder / schema field：`{{...}}`、story template section、frontmatter/status/evidence JSON 字段。
8. External project reference：`package.json`、`tsconfig.json`、`Cargo.toml`、`*.java`、`HEAD~1..HEAD`、`file.ts:42` 等目标项目扫描文件、模式或示例位置。
9. Contract-defined：planning/implementation contract 中有 definition-like 说明的配置引用。

若以上均不匹配，报告 BODY-10 Warning，并给出来源文件、行号和建议修复方式：补充本地定义、修正 stale path、明确 external project sample，或补充 owning contract。

## Report Phase（报告阶段）

输出标准表格：
- `#`
- `规则 ID`
- `检查项`
- `状态`
- `详情`

总结行使用 `X/36 项通过，Y 项警告，Z 项错误`。错误和警告必须附带具体修复建议。

## Rescan Phase（复查阶段）

用户说"重新检查"、"re-lint"或"再查一次"时，重新执行读取、脚本统计和 36 条规则扫描。报告中标注已修复项和新增项。
