# Config Doc Coverage（配置开发文档覆盖审计）

- 生成时间：2026-05-28T04:03:45.336Z
- 开发文档文件数量：230
- Skill 数量：53
- 配置依赖条目数：3005
- 本地配置文件存在：85
- 本地配置项定义：1044
- 本地占位引用已回连：170
- Runtime config 引用：426
- Artifact path 引用：166
- Workflow 局部变量：70
- 外部项目文件引用：20
- 外部项目模式引用：36
- 模板占位符：702
- Schema 字段引用：99
- Workflow 参数引用：183
- Planning docs 定义：4
- 仅 Implementation docs 定义：0
- 弱证据：0
- 未解析：0
- 未提取到配置依赖的 Skill：5
- 开发文档中存在但 skill 未引用的配置文件候选：64
- 开发文档中存在但 skill 未引用的配置项候选：369

## Per Skill Summary（逐 Skill 汇总）

| Skill | Scope | Total | File Exists | Local Config | Local Placeholder | Runtime | Artifact | Workflow Var | External File | External Pattern | Template | Schema | Workflow Param | Planning | Implementation | Weak | Unresolved |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `speclite-advanced-elicitation` | `core-skills` | 25 | 1 | 22 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-agent-analyst` | `sdlc-skills` | 59 | 1 | 41 | 11 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-agent-architect` | `sdlc-skills` | 58 | 1 | 40 | 11 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-agent-dev` | `sdlc-skills` | 58 | 1 | 40 | 11 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-agent-pm` | `sdlc-skills` | 58 | 1 | 40 | 11 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-agent-tech-writer` | `sdlc-skills` | 59 | 1 | 41 | 11 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-agent-ux-designer` | `sdlc-skills` | 58 | 1 | 40 | 11 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-brainstorming` | `core-skills` | 32 | 3 | 21 | 0 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| `speclite-brownfield-context-builder` | `sdlc-skills` | 186 | 2 | 33 | 4 | 7 | 18 | 0 | 9 | 23 | 43 | 37 | 10 | 0 | 0 | 0 | 0 |
| `speclite-check-implementation-readiness` | `sdlc-skills` | 48 | 3 | 24 | 5 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| `speclite-checkpoint-preview` | `sdlc-skills` | 54 | 3 | 24 | 4 | 14 | 0 | 0 | 0 | 2 | 0 | 2 | 5 | 0 | 0 | 0 | 0 |
| `speclite-code-review-01-reviewer` | `sdlc-skills` | 29 | 0 | 0 | 0 | 2 | 6 | 13 | 0 | 2 | 0 | 4 | 2 | 0 | 0 | 0 | 0 |
| `speclite-code-review-02-evaluator` | `sdlc-skills` | 15 | 0 | 0 | 0 | 2 | 6 | 5 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-code-review-03-fixer` | `sdlc-skills` | 14 | 0 | 0 | 0 | 2 | 6 | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-code-review-04-rules-extractor` | `sdlc-skills` | 14 | 0 | 0 | 0 | 2 | 6 | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-code-review-05-todo-tracker` | `sdlc-skills` | 14 | 0 | 0 | 0 | 2 | 6 | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-code-review-06-finalizer` | `sdlc-skills` | 23 | 0 | 0 | 0 | 2 | 8 | 5 | 0 | 0 | 0 | 2 | 6 | 0 | 0 | 0 | 0 |
| `speclite-correct-course` | `sdlc-skills` | 53 | 3 | 25 | 5 | 13 | 2 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-create-architecture` | `sdlc-skills` | 185 | 3 | 18 | 0 | 28 | 3 | 0 | 4 | 1 | 124 | 1 | 3 | 0 | 0 | 0 | 0 |
| `speclite-create-epics-and-stories` | `sdlc-skills` | 70 | 3 | 24 | 5 | 16 | 0 | 0 | 0 | 0 | 16 | 0 | 6 | 0 | 0 | 0 | 0 |
| `speclite-create-prd` | `sdlc-skills` | 87 | 3 | 30 | 5 | 14 | 0 | 0 | 0 | 0 | 21 | 0 | 14 | 0 | 0 | 0 | 0 |
| `speclite-create-story` | `sdlc-skills` | 116 | 3 | 23 | 4 | 15 | 17 | 0 | 0 | 1 | 4 | 22 | 27 | 0 | 0 | 0 | 0 |
| `speclite-create-ux-design` | `sdlc-skills` | 50 | 3 | 24 | 5 | 14 | 1 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| `speclite-customize` | `core-skills` | 29 | 0 | 20 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 |
| `speclite-dev-story` | `sdlc-skills` | 95 | 3 | 25 | 4 | 19 | 9 | 0 | 0 | 0 | 5 | 8 | 22 | 0 | 0 | 0 | 0 |
| `speclite-distillator` | `core-skills` | 7 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | 0 |
| `speclite-document-project` | `sdlc-skills` | 315 | 4 | 72 | 5 | 13 | 15 | 0 | 3 | 1 | 194 | 0 | 8 | 0 | 0 | 0 | 0 |
| `speclite-domain-research` | `sdlc-skills` | 52 | 3 | 24 | 5 | 14 | 0 | 0 | 0 | 0 | 5 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-edit-prd` | `sdlc-skills` | 61 | 3 | 31 | 5 | 13 | 3 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 |
| `speclite-editorial-review-prose` | `core-skills` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-editorial-review-structure` | `core-skills` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-flow-gate` | `sdlc-skills` | 52 | 0 | 29 | 0 | 2 | 6 | 0 | 0 | 0 | 9 | 1 | 5 | 0 | 0 | 0 | 0 |
| `speclite-generate-project-context` | `sdlc-skills` | 106 | 3 | 24 | 5 | 14 | 1 | 0 | 3 | 2 | 50 | 1 | 3 | 0 | 0 | 0 | 0 |
| `speclite-help` | `core-skills` | 28 | 0 | 20 | 1 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| `speclite-index-docs` | `core-skills` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-market-research` | `sdlc-skills` | 52 | 3 | 24 | 5 | 14 | 0 | 0 | 0 | 0 | 5 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-party-mode` | `core-skills` | 22 | 0 | 20 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-prfaq` | `sdlc-skills` | 54 | 4 | 26 | 5 | 14 | 0 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | 0 |
| `speclite-product-brief` | `sdlc-skills` | 54 | 4 | 27 | 5 | 16 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 |
| `speclite-qa-generate-e2e-tests` | `sdlc-skills` | 49 | 3 | 24 | 2 | 14 | 4 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-quick-dev` | `sdlc-skills` | 81 | 3 | 24 | 6 | 14 | 6 | 0 | 0 | 4 | 3 | 14 | 7 | 0 | 0 | 0 | 0 |
| `speclite-retrospective` | `sdlc-skills` | 231 | 3 | 25 | 2 | 17 | 3 | 0 | 0 | 0 | 180 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-review-acceptance-auditor` | `core-skills` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-review-adversarial-general` | `core-skills` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-review-edge-case-hunter` | `core-skills` | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |
| `speclite-shard-doc` | `core-skills` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `speclite-sprint-planning` | `sdlc-skills` | 75 | 4 | 33 | 5 | 13 | 9 | 0 | 0 | 0 | 4 | 0 | 7 | 0 | 0 | 0 | 0 |
| `speclite-sprint-status` | `sdlc-skills` | 76 | 3 | 25 | 2 | 13 | 9 | 0 | 0 | 0 | 20 | 0 | 4 | 0 | 0 | 0 | 0 |
| `speclite-story-review-01-reviewer` | `sdlc-skills` | 29 | 0 | 0 | 0 | 2 | 4 | 12 | 0 | 0 | 5 | 0 | 5 | 1 | 0 | 0 | 0 |
| `speclite-story-review-02-evaluator` | `sdlc-skills` | 20 | 0 | 0 | 0 | 2 | 4 | 10 | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| `speclite-story-review-03-fixer` | `sdlc-skills` | 19 | 0 | 0 | 0 | 2 | 4 | 10 | 0 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 |
| `speclite-technical-research` | `sdlc-skills` | 52 | 3 | 24 | 5 | 14 | 0 | 0 | 0 | 0 | 5 | 0 | 1 | 0 | 0 | 0 | 0 |
| `speclite-validate-prd` | `sdlc-skills` | 76 | 3 | 37 | 5 | 13 | 6 | 0 | 0 | 0 | 0 | 2 | 10 | 0 | 0 | 0 | 0 |

## Per Skill Findings（逐 Skill 检查结果）

### speclite-advanced-elicitation

- Scope：`core-skills`
- Total：25
- File Exists：1
- Local Config Defined：22
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `references/methods.csv` -> `assets/source/speclite/core-skills/speclite-advanced-elicitation/references/methods.csv` (relative-to-source-file) at `assets/source/speclite/core-skills/speclite-advanced-elicitation/SKILL.md:15`
- Local Config Defined Sample：
  - config-item `communication_language` defined by `communication_language` at `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:7` (assignment, same-reference)
  - config-item `core` defined by `core` at `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:4` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:8` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:10` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.user_name` defined by `core.user_name` at `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:6` (toml-key, same-reference)
  - config-item `core.user_skill_level` defined by `core.user_skill_level` at `assets/source/speclite/core-skills/speclite-advanced-elicitation/config.toml.example:9` (toml-key, same-reference)
- Result：未发现未解析或弱证据项。

### speclite-agent-analyst

- Scope：`sdlc-skills`
- Total：59
- File Exists：1
- Local Config Defined：41
- Local Placeholder Defined：11
- Runtime Config Reference：6
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/SKILL.md:26`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:16` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:15` (assignment, same-reference)
  - config-item `agent` defined by `agent` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:5` (toml-section, same-reference)
  - config-item `agent.activation_steps_append` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:16` (toml-key, same-reference)
  - config-item `agent.activation_steps_prepend` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:15` (toml-key, same-reference)
  - config-item `agent.communication_style` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:24` (toml-key, same-reference)
  - config-item `agent.icon` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:13` (toml-key, same-reference)
  - config-item `agent.identity` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:23` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{agent.activation_steps_append}` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:16` (toml-key, placeholder-unwrapped)
  - config-item `{agent.activation_steps_prepend}` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:15` (toml-key, placeholder-unwrapped)
  - config-item `{agent.communication_style}` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:24` (toml-key, placeholder-unwrapped)
  - config-item `{agent.icon}` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:13` (toml-key, placeholder-unwrapped)
  - config-item `{agent.identity}` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:23` (toml-key, placeholder-unwrapped)
  - config-item `{agent.menu}` defined by `agent.menu` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:32` (toml-array-section, placeholder-unwrapped)
  - config-item `{agent.persistent_facts}` defined by `agent.persistent_facts` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:18` (toml-key, placeholder-unwrapped)
  - config-item `{agent.principles}` defined by `agent.principles` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst/customize.toml:26` (toml-key, placeholder-unwrapped)
- Result：未发现未解析或弱证据项。

### speclite-agent-architect

- Scope：`sdlc-skills`
- Total：58
- File Exists：1
- Local Config Defined：40
- Local Placeholder Defined：11
- Runtime Config Reference：6
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/SKILL.md:26`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:16` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:15` (assignment, same-reference)
  - config-item `agent` defined by `agent` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:5` (toml-section, same-reference)
  - config-item `agent.activation_steps_append` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:16` (toml-key, same-reference)
  - config-item `agent.activation_steps_prepend` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:15` (toml-key, same-reference)
  - config-item `agent.communication_style` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:24` (toml-key, same-reference)
  - config-item `agent.icon` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:13` (toml-key, same-reference)
  - config-item `agent.identity` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:23` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{agent.activation_steps_append}` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:16` (toml-key, placeholder-unwrapped)
  - config-item `{agent.activation_steps_prepend}` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:15` (toml-key, placeholder-unwrapped)
  - config-item `{agent.communication_style}` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:24` (toml-key, placeholder-unwrapped)
  - config-item `{agent.icon}` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:13` (toml-key, placeholder-unwrapped)
  - config-item `{agent.identity}` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:23` (toml-key, placeholder-unwrapped)
  - config-item `{agent.menu}` defined by `agent.menu` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:32` (toml-array-section, placeholder-unwrapped)
  - config-item `{agent.persistent_facts}` defined by `agent.persistent_facts` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:18` (toml-key, placeholder-unwrapped)
  - config-item `{agent.principles}` defined by `agent.principles` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect/customize.toml:26` (toml-key, placeholder-unwrapped)
- Result：未发现未解析或弱证据项。

### speclite-agent-dev

- Scope：`sdlc-skills`
- Total：58
- File Exists：1
- Local Config Defined：40
- Local Placeholder Defined：11
- Runtime Config Reference：6
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/SKILL.md:26`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:16` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:15` (assignment, same-reference)
  - config-item `agent` defined by `agent` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:5` (toml-section, same-reference)
  - config-item `agent.activation_steps_append` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:16` (toml-key, same-reference)
  - config-item `agent.activation_steps_prepend` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:15` (toml-key, same-reference)
  - config-item `agent.communication_style` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:24` (toml-key, same-reference)
  - config-item `agent.icon` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:13` (toml-key, same-reference)
  - config-item `agent.identity` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:23` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{agent.activation_steps_append}` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:16` (toml-key, placeholder-unwrapped)
  - config-item `{agent.activation_steps_prepend}` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:15` (toml-key, placeholder-unwrapped)
  - config-item `{agent.communication_style}` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:24` (toml-key, placeholder-unwrapped)
  - config-item `{agent.icon}` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:13` (toml-key, placeholder-unwrapped)
  - config-item `{agent.identity}` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:23` (toml-key, placeholder-unwrapped)
  - config-item `{agent.menu}` defined by `agent.menu` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:32` (toml-array-section, placeholder-unwrapped)
  - config-item `{agent.persistent_facts}` defined by `agent.persistent_facts` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:18` (toml-key, placeholder-unwrapped)
  - config-item `{agent.principles}` defined by `agent.principles` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml:26` (toml-key, placeholder-unwrapped)
- Result：未发现未解析或弱证据项。

### speclite-agent-pm

- Scope：`sdlc-skills`
- Total：58
- File Exists：1
- Local Config Defined：40
- Local Placeholder Defined：11
- Runtime Config Reference：6
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/SKILL.md:26`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:16` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:15` (assignment, same-reference)
  - config-item `agent` defined by `agent` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:5` (toml-section, same-reference)
  - config-item `agent.activation_steps_append` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:16` (toml-key, same-reference)
  - config-item `agent.activation_steps_prepend` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:15` (toml-key, same-reference)
  - config-item `agent.communication_style` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:24` (toml-key, same-reference)
  - config-item `agent.icon` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:13` (toml-key, same-reference)
  - config-item `agent.identity` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:23` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{agent.activation_steps_append}` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:16` (toml-key, placeholder-unwrapped)
  - config-item `{agent.activation_steps_prepend}` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:15` (toml-key, placeholder-unwrapped)
  - config-item `{agent.communication_style}` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:24` (toml-key, placeholder-unwrapped)
  - config-item `{agent.icon}` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:13` (toml-key, placeholder-unwrapped)
  - config-item `{agent.identity}` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:23` (toml-key, placeholder-unwrapped)
  - config-item `{agent.menu}` defined by `agent.menu` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:32` (toml-array-section, placeholder-unwrapped)
  - config-item `{agent.persistent_facts}` defined by `agent.persistent_facts` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:18` (toml-key, placeholder-unwrapped)
  - config-item `{agent.principles}` defined by `agent.principles` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm/customize.toml:26` (toml-key, placeholder-unwrapped)
- Result：未发现未解析或弱证据项。

### speclite-agent-tech-writer

- Scope：`sdlc-skills`
- Total：59
- File Exists：1
- Local Config Defined：41
- Local Placeholder Defined：11
- Runtime Config Reference：6
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/SKILL.md:26`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:16` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:15` (assignment, same-reference)
  - config-item `agent` defined by `agent` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:5` (toml-section, same-reference)
  - config-item `agent.activation_steps_append` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:16` (toml-key, same-reference)
  - config-item `agent.activation_steps_prepend` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:15` (toml-key, same-reference)
  - config-item `agent.communication_style` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:24` (toml-key, same-reference)
  - config-item `agent.icon` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:13` (toml-key, same-reference)
  - config-item `agent.identity` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:23` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{agent.activation_steps_append}` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:16` (toml-key, placeholder-unwrapped)
  - config-item `{agent.activation_steps_prepend}` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:15` (toml-key, placeholder-unwrapped)
  - config-item `{agent.communication_style}` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:24` (toml-key, placeholder-unwrapped)
  - config-item `{agent.icon}` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:13` (toml-key, placeholder-unwrapped)
  - config-item `{agent.identity}` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:23` (toml-key, placeholder-unwrapped)
  - config-item `{agent.menu}` defined by `agent.menu` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:32` (toml-array-section, placeholder-unwrapped)
  - config-item `{agent.persistent_facts}` defined by `agent.persistent_facts` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:18` (toml-key, placeholder-unwrapped)
  - config-item `{agent.principles}` defined by `agent.principles` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer/customize.toml:26` (toml-key, placeholder-unwrapped)
- Result：未发现未解析或弱证据项。

### speclite-agent-ux-designer

- Scope：`sdlc-skills`
- Total：58
- File Exists：1
- Local Config Defined：40
- Local Placeholder Defined：11
- Runtime Config Reference：6
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/SKILL.md:26`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:16` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:15` (assignment, same-reference)
  - config-item `agent` defined by `agent` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:5` (toml-section, same-reference)
  - config-item `agent.activation_steps_append` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:16` (toml-key, same-reference)
  - config-item `agent.activation_steps_prepend` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:15` (toml-key, same-reference)
  - config-item `agent.communication_style` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:24` (toml-key, same-reference)
  - config-item `agent.icon` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:13` (toml-key, same-reference)
  - config-item `agent.identity` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:23` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{agent.activation_steps_append}` defined by `agent.activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:16` (toml-key, placeholder-unwrapped)
  - config-item `{agent.activation_steps_prepend}` defined by `agent.activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:15` (toml-key, placeholder-unwrapped)
  - config-item `{agent.communication_style}` defined by `agent.communication_style` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:24` (toml-key, placeholder-unwrapped)
  - config-item `{agent.icon}` defined by `agent.icon` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:13` (toml-key, placeholder-unwrapped)
  - config-item `{agent.identity}` defined by `agent.identity` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:23` (toml-key, placeholder-unwrapped)
  - config-item `{agent.menu}` defined by `agent.menu` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:32` (toml-array-section, placeholder-unwrapped)
  - config-item `{agent.persistent_facts}` defined by `agent.persistent_facts` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:18` (toml-key, placeholder-unwrapped)
  - config-item `{agent.principles}` defined by `agent.principles` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer/customize.toml:26` (toml-key, placeholder-unwrapped)
- Result：未发现未解析或弱证据项。

### speclite-brainstorming

- Scope：`core-skills`
- Total：32
- File Exists：3
- Local Config Defined：21
- Local Placeholder Defined：0
- Runtime Config Reference：3
- Artifact Path Reference：3
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：2
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `../brain-methods.csv` -> `assets/source/speclite/core-skills/speclite-brainstorming/references/brain-methods.csv` (relative-to-source-file) at `assets/source/speclite/core-skills/speclite-brainstorming/references/steps/step-02d-progressive-flow.md:69`
  - config-file `brain-methods.csv` -> `assets/source/speclite/core-skills/speclite-brainstorming/references/brain-methods.csv` (skill-basename-unique-match) at `assets/source/speclite/core-skills/speclite-brainstorming/references/steps/step-02d-progressive-flow.md:7`
  - config-file `references/brain-methods.csv` -> `assets/source/speclite/core-skills/speclite-brainstorming/references/brain-methods.csv` (relative-to-source-file) at `assets/source/speclite/core-skills/speclite-brainstorming/SKILL.md:16`
- Local Config Defined Sample：
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/core-skills/speclite-brainstorming/config.toml.example:7` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/core-skills/speclite-brainstorming/config.toml.example:4` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/core-skills/speclite-brainstorming/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/core-skills/speclite-brainstorming/config.toml.example:8` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/core-skills/speclite-brainstorming/config.toml.example:10` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/core-skills/speclite-brainstorming/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.user_name` defined by `core.user_name` at `assets/source/speclite/core-skills/speclite-brainstorming/config.toml.example:6` (toml-key, same-reference)
  - config-item `core.user_skill_level` defined by `core.user_skill_level` at `assets/source/speclite/core-skills/speclite-brainstorming/config.toml.example:9` (toml-key, same-reference)
- Result：未发现未解析或弱证据项。

### speclite-brownfield-context-builder

- Scope：`sdlc-skills`
- Total：186
- File Exists：2
- Local Config Defined：33
- Local Placeholder Defined：4
- Runtime Config Reference：7
- Artifact Path Reference：18
- Workflow Local Variable：0
- External Project File Reference：9
- External Project Pattern Reference：23
- Template Placeholder：43
- Schema Field Reference：37
- Workflow Parameter Reference：10
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/SKILL.md:43`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/config.toml.example` (relative-to-source-file) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/SKILL.md:76`
- Local Config Defined Sample：
  - config-item `associated_kfp` defined by `associated_kfp` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/golden/spring-mvc-basic/expected/api-inventory.expected.json:9` (json-key, same-reference)
  - config-item `brownfield_output` defined by `brownfield_output` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/customize.toml:9` (assignment, same-reference)
  - config-item `default_sources` defined by `default_sources` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/customize.toml:13` (assignment, same-reference)
  - config-item `expected_endpoints` defined by `expected_endpoints` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/golden/spring-mvc-basic/expected/api-inventory.expected.json:2` (json-key, same-reference)
  - config-item `expected_models` defined by `expected_models` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/golden/mybatis-plus-basic/expected/data-model-inventory.expected.json:2` (json-key, same-reference)
  - config-item `history_sources` defined by `skills.speclite-brownfield-context-builder.history_sources` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `modules.sdlc` defined by `modules.sdlc` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/config.toml.example:3` (toml-section, same-reference)
  - config-item `modules.sdlc.planning_artifacts` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/config.toml.example:5` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{brownfield_output}` defined by `brownfield_output` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/customize.toml:9` (assignment, placeholder-unwrapped)
  - config-item `{history_sources}` defined by `skills.speclite-brownfield-context-builder.history_sources` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder/config.toml.example:4` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-check-implementation-readiness

- Scope：`sdlc-skills`
- Total：48
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：5
- Runtime Config Reference：14
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：2
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/workflow-details.md:53`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/workflow-details.md:94`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-checkpoint-preview

- Scope：`sdlc-skills`
- Total：54
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：4
- Runtime Config Reference：14
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：2
- Template Placeholder：0
- Schema Field Reference：2
- Workflow Parameter Reference：5
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/references/workflow-details.md:24`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/references/workflow-details.md:71`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{implementation_artifacts}` defined by `modules.sdlc.implementation_artifacts` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:11` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview/config.toml.example:10` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-code-review-01-reviewer

- Scope：`sdlc-skills`
- Total：29
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：6
- Workflow Local Variable：13
- External Project File Reference：0
- External Project Pattern Reference：2
- Template Placeholder：0
- Schema Field Reference：4
- Workflow Parameter Reference：2
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-code-review-02-evaluator

- Scope：`sdlc-skills`
- Total：15
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：6
- Workflow Local Variable：5
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：1
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-code-review-03-fixer

- Scope：`sdlc-skills`
- Total：14
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：6
- Workflow Local Variable：5
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-code-review-04-rules-extractor

- Scope：`sdlc-skills`
- Total：14
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：6
- Workflow Local Variable：5
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-code-review-05-todo-tracker

- Scope：`sdlc-skills`
- Total：14
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：6
- Workflow Local Variable：5
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-code-review-06-finalizer

- Scope：`sdlc-skills`
- Total：23
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：8
- Workflow Local Variable：5
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：2
- Workflow Parameter Reference：6
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-correct-course

- Scope：`sdlc-skills`
- Total：53
- File Exists：3
- Local Config Defined：25
- Local Placeholder Defined：5
- Runtime Config Reference：13
- Artifact Path Reference：2
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：4
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md:24`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md:304`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:3` (toml-key, unique-suffix)
  - config-item `{user_skill_level}` defined by `core.user_skill_level` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:6` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-create-architecture

- Scope：`sdlc-skills`
- Total：185
- File Exists：3
- Local Config Defined：18
- Local Placeholder Defined：0
- Runtime Config Reference：28
- Artifact Path Reference：3
- Workflow Local Variable：0
- External Project File Reference：4
- External Project Pattern Reference：1
- Template Placeholder：124
- Schema Field Reference：1
- Workflow Parameter Reference：3
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/activation-en.md:9`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/activation-en.md:38`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/notes-en.md:13`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/customize.toml:15` (assignment, same-reference)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/config.toml.example:4` (toml-section, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/config.toml.example:10` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.user_skill_level` defined by `core.user_skill_level` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/config.toml.example:9` (toml-key, same-reference)
  - config-item `detection_signals` defined by `detection_signals` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/data/project-types.csv:1` (csv-header, same-reference)
  - config-item `implementation_artifacts` defined by `implementation_artifacts` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/config.toml.example:14` (assignment, same-reference)
- Result：未发现未解析或弱证据项。

### speclite-create-epics-and-stories

- Scope：`sdlc-skills`
- Total：70
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：5
- Runtime Config Reference：16
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：16
- Schema Field Reference：0
- Workflow Parameter Reference：6
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/references/activation.md:53`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/references/activation.md:77`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/references/activation.md:6`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/customize.toml:20` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:8` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:5` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:8` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:9` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:11` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:6` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:8` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:9` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:14` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:16` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:7` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-create-prd

- Scope：`sdlc-skills`
- Total：87
- File Exists：3
- Local Config Defined：30
- Local Placeholder Defined：5
- Runtime Config Reference：14
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：21
- Schema Field Reference：0
- Workflow Parameter Reference：14
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/references/workflow-details.md:57`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/references/workflow-details.md:107`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/references/workflow-details.md:14`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-create-story

- Scope：`sdlc-skills`
- Total：116
- File Exists：3
- Local Config Defined：23
- Local Placeholder Defined：4
- Runtime Config Reference：15
- Artifact Path Reference：17
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：1
- Template Placeholder：4
- Schema Field Reference：22
- Workflow Parameter Reference：27
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/workflow-details.md:22`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/workflow-details.md:12`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/workflow-details.md:8`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/customize.toml:20` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:8` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:5` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:8` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:9` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:11` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:6` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:8` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:9` (toml-key, unique-suffix)
  - config-item `{implementation_artifacts}` defined by `modules.sdlc.implementation_artifacts` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:15` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:7` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-create-ux-design

- Scope：`sdlc-skills`
- Total：50
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：5
- Runtime Config Reference：14
- Artifact Path Reference：1
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：3
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:31`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:78`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:10`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-customize

- Scope：`core-skills`
- Total：29
- File Exists：0
- Local Config Defined：20
- Local Placeholder Defined：0
- Runtime Config Reference：7
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：1
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local Config Defined Sample：
  - config-item `communication_language` defined by `communication_language` at `assets/source/speclite/core-skills/speclite-customize/config.toml.example:7` (assignment, same-reference)
  - config-item `core` defined by `core` at `assets/source/speclite/core-skills/speclite-customize/config.toml.example:4` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/core-skills/speclite-customize/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/core-skills/speclite-customize/config.toml.example:8` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/core-skills/speclite-customize/config.toml.example:10` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/core-skills/speclite-customize/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.user_name` defined by `core.user_name` at `assets/source/speclite/core-skills/speclite-customize/config.toml.example:6` (toml-key, same-reference)
  - config-item `core.user_skill_level` defined by `core.user_skill_level` at `assets/source/speclite/core-skills/speclite-customize/config.toml.example:9` (toml-key, same-reference)
- Result：未发现未解析或弱证据项。

### speclite-dev-story

- Scope：`sdlc-skills`
- Total：95
- File Exists：3
- Local Config Defined：25
- Local Placeholder Defined：4
- Runtime Config Reference：19
- Artifact Path Reference：9
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：5
- Schema Field Reference：8
- Workflow Parameter Reference：22
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/activation.md:17`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/activation.md:11`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/activation.md:7`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:8` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:5` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:8` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:9` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:11` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:6` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:8` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:9` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:7` (toml-key, unique-suffix)
  - config-item `{user_skill_level}` defined by `core.user_skill_level` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/config.toml.example:10` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-distillator

- Scope：`core-skills`
- Total：7
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：1
- Artifact Path Reference：1
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：2
- Schema Field Reference：0
- Workflow Parameter Reference：3
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-document-project

- Scope：`sdlc-skills`
- Total：315
- File Exists：4
- Local Config Defined：72
- Local Placeholder Defined：5
- Runtime Config Reference：13
- Artifact Path Reference：15
- Workflow Local Variable：0
- External Project File Reference：3
- External Project Pattern Reference：1
- Template Placeholder：194
- Schema Field Reference：0
- Workflow Parameter Reference：8
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/references/workflow-details.md:24`
  - config-file `assets/project-scan-report-schema.json` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/assets/project-scan-report-schema.json` (relative-to-source-file) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/SKILL.md:42`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/references/workflow-details.md:65`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/customize.toml:15` (assignment, same-reference)
  - config-item `asset_patterns` defined by `asset_patterns` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/data/documentation-requirements.csv:1` (csv-header, same-reference)
  - config-item `async_event_patterns` defined by `async_event_patterns` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/data/documentation-requirements.csv:1` (csv-header, same-reference)
  - config-item `auth_security_patterns` defined by `auth_security_patterns` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/data/documentation-requirements.csv:1` (csv-header, same-reference)
  - config-item `batches_completed` defined by `batches_completed` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/assets/project-scan-report-schema.json:109` (json-key, same-reference)
  - config-item `ci_cd_patterns` defined by `ci_cd_patterns` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/data/documentation-requirements.csv:1` (csv-header, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/config.toml.example:4` (toml-key, unique-suffix)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-domain-research

- Scope：`sdlc-skills`
- Total：52
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：5
- Runtime Config Reference：14
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：5
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/references/workflow-details.md:28`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/references/workflow-details.md:99`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-edit-prd

- Scope：`sdlc-skills`
- Total：61
- File Exists：3
- Local Config Defined：31
- Local Placeholder Defined：5
- Runtime Config Reference：13
- Artifact Path Reference：3
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：6
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/references/workflow-details.md:57`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/references/workflow-details.md:105`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/references/workflow-details.md:14`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-editorial-review-prose

- Scope：`core-skills`
- Total：0
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：0
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：脚本未提取到配置文件或配置项依赖。

### speclite-editorial-review-structure

- Scope：`core-skills`
- Total：0
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：0
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：脚本未提取到配置文件或配置项依赖。

### speclite-flow-gate

- Scope：`sdlc-skills`
- Total：52
- File Exists：0
- Local Config Defined：29
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：6
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：9
- Schema Field Reference：1
- Workflow Parameter Reference：5
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/customize.toml:8` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/customize.toml:7` (assignment, same-reference)
  - config-item `communication_language` defined by `communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/config.toml.example:4` (assignment, same-reference)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/config.toml.example:2` (toml-key, same-reference)
- Result：未发现未解析或弱证据项。

### speclite-generate-project-context

- Scope：`sdlc-skills`
- Total：106
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：5
- Runtime Config Reference：14
- Artifact Path Reference：1
- Workflow Local Variable：0
- External Project File Reference：3
- External Project Pattern Reference：2
- Template Placeholder：50
- Schema Field Reference：1
- Workflow Parameter Reference：3
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/references/workflow-details.md:34`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/references/workflow-details.md:84`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-help

- Scope：`core-skills`
- Total：28
- File Exists：0
- Local Config Defined：20
- Local Placeholder Defined：1
- Runtime Config Reference：5
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：2
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local Config Defined Sample：
  - config-item `communication_language` defined by `communication_language` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:7` (assignment, same-reference)
  - config-item `core` defined by `core` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:4` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:8` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:10` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.user_name` defined by `core.user_name` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:6` (toml-key, same-reference)
  - config-item `core.user_skill_level` defined by `core.user_skill_level` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:9` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `communication_language` at `assets/source/speclite/core-skills/speclite-help/config.toml.example:7` (assignment, placeholder-unwrapped)
- Result：未发现未解析或弱证据项。

### speclite-index-docs

- Scope：`core-skills`
- Total：0
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：0
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：脚本未提取到配置文件或配置项依赖。

### speclite-market-research

- Scope：`sdlc-skills`
- Total：52
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：5
- Runtime Config Reference：14
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：5
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/references/workflow-details.md:28`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/references/workflow-details.md:99`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-party-mode

- Scope：`core-skills`
- Total：22
- File Exists：0
- Local Config Defined：20
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local Config Defined Sample：
  - config-item `communication_language` defined by `communication_language` at `assets/source/speclite/core-skills/speclite-party-mode/config.toml.example:7` (assignment, same-reference)
  - config-item `core` defined by `core` at `assets/source/speclite/core-skills/speclite-party-mode/config.toml.example:4` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/core-skills/speclite-party-mode/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/core-skills/speclite-party-mode/config.toml.example:8` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/core-skills/speclite-party-mode/config.toml.example:10` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/core-skills/speclite-party-mode/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.user_name` defined by `core.user_name` at `assets/source/speclite/core-skills/speclite-party-mode/config.toml.example:6` (toml-key, same-reference)
  - config-item `core.user_skill_level` defined by `core.user_skill_level` at `assets/source/speclite/core-skills/speclite-party-mode/config.toml.example:9` (toml-key, same-reference)
- Result：未发现未解析或弱证据项。

### speclite-prfaq

- Scope：`sdlc-skills`
- Total：54
- File Exists：4
- Local Config Defined：26
- Local Placeholder Defined：5
- Runtime Config Reference：14
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：2
- Schema Field Reference：0
- Workflow Parameter Reference：3
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:34`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:138`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/references/workflow-details.md:22`
  - config-file `data/speclite-manifest.json` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/data/speclite-manifest.json` (relative-to-source-file) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/SKILL.md:43`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-product-brief

- Scope：`sdlc-skills`
- Total：54
- File Exists：4
- Local Config Defined：27
- Local Placeholder Defined：5
- Runtime Config Reference：16
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：1
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:43`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:120`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/references/workflow-details.md:16`
  - config-file `data/speclite-manifest.json` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/data/speclite-manifest.json` (relative-to-source-file) at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/SKILL.md:43`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/customize.toml:15` (assignment, same-reference)
  - config-item `brief_template` defined by `brief_template` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/customize.toml:41` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:7` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-qa-generate-e2e-tests

- Scope：`sdlc-skills`
- Total：49
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：2
- Runtime Config Reference：14
- Artifact Path Reference：4
- Workflow Local Variable：0
- External Project File Reference：1
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/references/workflow-details.md:24`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/references/workflow-details.md:179`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-quick-dev

- Scope：`sdlc-skills`
- Total：81
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：6
- Runtime Config Reference：14
- Artifact Path Reference：6
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：4
- Template Placeholder：3
- Schema Field Reference：14
- Workflow Parameter Reference：7
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/references/workflow-details.md:43`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/references/workflow-details.md:114`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/references/workflow-details.md:31`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{implementation_artifacts}` defined by `modules.sdlc.implementation_artifacts` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:11` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:3` (toml-key, unique-suffix)
  - config-item `{user_skill_level}` defined by `core.user_skill_level` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/config.toml.example:6` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-retrospective

- Scope：`sdlc-skills`
- Total：231
- File Exists：3
- Local Config Defined：25
- Local Placeholder Defined：2
- Runtime Config Reference：17
- Artifact Path Reference：3
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：180
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/references/workflow-details.md:40`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/references/workflow-details.md:1515`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/references/workflow-details.md:28`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-review-acceptance-auditor

- Scope：`core-skills`
- Total：1
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：0
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-review-adversarial-general

- Scope：`core-skills`
- Total：0
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：0
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：脚本未提取到配置文件或配置项依赖。

### speclite-review-edge-case-hunter

- Scope：`core-skills`
- Total：4
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：0
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：4
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-shard-doc

- Scope：`core-skills`
- Total：0
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：0
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：0
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：脚本未提取到配置文件或配置项依赖。

### speclite-sprint-planning

- Scope：`sdlc-skills`
- Total：75
- File Exists：4
- Local Config Defined：33
- Local Placeholder Defined：5
- Runtime Config Reference：13
- Artifact Path Reference：9
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：4
- Schema Field Reference：0
- Workflow Parameter Reference：7
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/references/workflow-details.md:24`
  - config-file `assets/sprint-status-template.yaml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/assets/sprint-status-template.yaml` (relative-to-source-file) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/SKILL.md:44`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/references/workflow-details.md:302`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{implementation_artifacts}` defined by `modules.sdlc.implementation_artifacts` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:11` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-sprint-status

- Scope：`sdlc-skills`
- Total：76
- File Exists：3
- Local Config Defined：25
- Local Placeholder Defined：2
- Runtime Config Reference：13
- Artifact Path Reference：9
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：20
- Schema Field Reference：0
- Workflow Parameter Reference：4
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/references/workflow-details.md:24`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/references/workflow-details.md:310`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-story-review-01-reviewer

- Scope：`sdlc-skills`
- Total：29
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：4
- Workflow Local Variable：12
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：5
- Schema Field Reference：0
- Workflow Parameter Reference：5
- Planning Defined：1
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-story-review-02-evaluator

- Scope：`sdlc-skills`
- Total：20
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：4
- Workflow Local Variable：10
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：3
- Planning Defined：1
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-story-review-03-fixer

- Scope：`sdlc-skills`
- Total：19
- File Exists：0
- Local Config Defined：0
- Local Placeholder Defined：0
- Runtime Config Reference：2
- Artifact Path Reference：4
- Workflow Local Variable：10
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：0
- Workflow Parameter Reference：2
- Planning Defined：1
- Implementation Only：0
- Weak：0
- Unresolved：0
- Result：未发现未解析或弱证据项。

### speclite-technical-research

- Scope：`sdlc-skills`
- Total：52
- File Exists：3
- Local Config Defined：24
- Local Placeholder Defined：5
- Runtime Config Reference：14
- Artifact Path Reference：0
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：5
- Schema Field Reference：0
- Workflow Parameter Reference：1
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/references/workflow-details.md:28`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/references/workflow-details.md:99`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/references/workflow-details.md:12`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。

### speclite-validate-prd

- Scope：`sdlc-skills`
- Total：76
- File Exists：3
- Local Config Defined：37
- Local Placeholder Defined：5
- Runtime Config Reference：13
- Artifact Path Reference：6
- Workflow Local Variable：0
- External Project File Reference：0
- External Project Pattern Reference：0
- Template Placeholder：0
- Schema Field Reference：2
- Workflow Parameter Reference：10
- Planning Defined：0
- Implementation Only：0
- Weak：0
- Unresolved：0
- Local File Exists Sample：
  - config-file `{skill-root}/customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/customize.toml` (skill-root-placeholder) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/workflow-details.md:57`
  - config-file `config.toml.example` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/workflow-details.md:107`
  - config-file `customize.toml` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/customize.toml` (relative-to-skill-root) at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/workflow-details.md:14`
- Local Config Defined Sample：
  - config-item `activation_steps_append` defined by `activation_steps_append` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/customize.toml:21` (assignment, same-reference)
  - config-item `activation_steps_prepend` defined by `activation_steps_prepend` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/customize.toml:15` (assignment, same-reference)
  - config-item `communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `core` defined by `core` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:1` (toml-section, same-reference)
  - config-item `core.communication_language` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:4` (toml-key, same-reference)
  - config-item `core.document_output_language` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:5` (toml-key, same-reference)
  - config-item `core.output_folder` defined by `core.output_folder` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:7` (toml-key, same-reference)
  - config-item `core.project_name` defined by `core.project_name` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:2` (toml-key, same-reference)
- Local Placeholder Defined Sample：
  - config-item `{communication_language}` defined by `core.communication_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:4` (toml-key, unique-suffix)
  - config-item `{document_output_language}` defined by `core.document_output_language` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:5` (toml-key, unique-suffix)
  - config-item `{planning_artifacts}` defined by `modules.sdlc.planning_artifacts` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:10` (toml-key, unique-suffix)
  - config-item `{project_knowledge}` defined by `modules.sdlc.project_knowledge` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:12` (toml-key, unique-suffix)
  - config-item `{user_name}` defined by `core.user_name` at `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/config.toml.example:3` (toml-key, unique-suffix)
- Result：未发现未解析或弱证据项。


## Unresolved（未解析）

| Skill | Kind | Value | First Skill Source |
| --- | --- | --- | --- |

## High Repeat Unresolved Values（高频未解析项）

| Kind | Value | Skill Count | Sample Skills |
| --- | --- | ---: | --- |

## Runtime Path Variants（Runtime 路径变体候选）

这些候选由脚本按 runtime path 规则归并。它们不一定都是错误，但需要人工确认是否属于合法别名、模板占位符，还是开发文档未定义的路径变体。

### config.toml

- Skill Count：36
- Variant：`{speclite-runtime-root}/config.toml`；Status：RUNTIME_CONFIG_DEFINED；Raw：`{project-root}/_speclite/config.toml`
- Variant：`config.toml`；Status：RUNTIME_CONFIG_DEFINED；Raw：`config.toml`
- Variant：`_speclite/config.toml`；Status：RUNTIME_CONFIG_DEFINED；Raw：`_speclite/config.toml`
- Variant：`_speclite/custom/config.toml`；Status：RUNTIME_CONFIG_DEFINED；Raw：`_speclite/custom/config.toml`

### customize.toml

- Skill Count：31
- Variant：`customize.toml`；Status：DEFINED_IN_PLANNING_DOCS, FILE_EXISTS；Raw：`customize.toml`
- Variant：`{skill-root}/customize.toml`；Status：FILE_EXISTS；Raw：`{skill-root}/customize.toml`

### config.user.toml

- Skill Count：3
- Variant：`{speclite-runtime-root}/config.user.toml`；Status：RUNTIME_CONFIG_REFERENCE；Raw：`{project-root}/_speclite/config.user.toml`
- Variant：`_speclite/config.user.toml`；Status：RUNTIME_CONFIG_DEFINED；Raw：`_speclite/config.user.toml`
- Variant：`_speclite/custom/config.user.toml`；Status：RUNTIME_CONFIG_DEFINED；Raw：`_speclite/custom/config.user.toml`


## Weak Doc Evidence（弱证据）

| Skill | Kind | Value | First Skill Source |
| --- | --- | --- | --- |

## Doc Only Candidates（开发文档独有候选）

这些候选由同一提取器从开发文档中提取，但未在 core/sdlc skill 依赖集合中出现。它们可能是正常的实现细节，也可能表示 canonical skill 漏掉的配置约束。完整来源见 JSON。

### Config Files

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml`
- `_bmad/_config/manifest.yaml`
- `_bmad/bmm/config.yaml`
- `_bmad/config.toml`
- `_bmad/config.user.toml`
- `_bmad/custom/config.toml`
- `_bmad/custom/config.user.toml`
- `_config/manifest.yaml`
- `_speclite/_config/files-index.json`
- `_speclite/_config/files-manifest.csv`
- `_speclite/_config/help-index.json`
- `_speclite/_config/manifest.yaml`
- `_speclite/_config/phase-coverage.json`
- `_speclite/_config/skill-index.json`
- `_speclite/_config/skill-manifest.csv`
- `_speclite/_config/speclite-help.csv`
- `_speclite/custom/{skill-name}.toml`
- `_speclite/custom/{skill-name}.user.toml`
- `_speclite/custom/{skill}.toml`
- `_speclite/custom/{skill}.user.toml`
- `.agents/skills/bmad-dev-story/customize.toml`
- `.github/workflows/ci.yml`
- `assets/source/speclite/core-skills/module-help.csv`
- `assets/source/speclite/core-skills/module.yaml`
- `assets/source/speclite/core-skills/speclite-help/config.toml.example`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/assets/sprint-status-template.yaml`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `assets/source/speclite/sdlc-skills/module.yaml`
- `bmad-help.csv`
- `bmm-workflow-status.yaml`
- `config.yaml`
- `core-skills/module.yaml`
- `custom/config.toml`
- `custom/config.user.toml`
- `dist/packaging-manifest.json`
- `files-index-dev-story-skill.json`
- `files-index.json`
- `files-manifest.csv`
- `fixture-case.json`
- `help-index.json`
- `manifest.yaml`
- `metadata.json`
- `module-help.csv`
- `packaging-manifest.json`
- `phase-coverage.json`
- `platform-codes.yaml`
- `references/BMAD-METHOD-6.6.0/package.json`
- `references/BMAD-METHOD-6.6.0/src/bmm-skills/module.yaml`
- `references/BMAD-METHOD-6.6.0/tools/installer/ide/platform-codes.yaml`
- `references/source/speclite/core-skills/module.yaml`
- `references/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev/customize.toml`
- `references/source/speclite/sdlc-skills/module.yaml`
- `sdlc-skills/module.yaml`
- `skill-index-speclite-dev-story.json`
- `skill-index.json`
- `skill-manifest.csv`
- `speclite-help.csv`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-dev-story-skill.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/manifest.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-dev-story.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-speclite-dev-story.json`
- `test/fixtures/resolve-parity/fixture-case.json`
- `test/fixtures/skill-artifact-loop/fixture-case.json`

### Config Items

- `_bmad`
- `_bmad-output`
- `_cleanupSkillDirs`
- `_config`
- `_detect_keyed_merge_field`
- `_detect_keyed_merge_field(items`
- `_memory`
- `_merge_by_key`
- `_speclite`
- `_speclite-output`
- `.agents`
- `.bak`
- `.claude`
- `.git`
- `.speclite-tmp-`
- `.speclite-tmp-*`
- `.strict(`
- `.tmp`
- `{...}`
- `{output_folder}`
- `{planning_artifacts}|{project_knowledge}`
- `1-3-official-module-selection-and-install-summary.md:122-127`
- `2026-05-27T06:00:00.000Z`
- `actions.action`
- `actions.affectedPath`
- `actions.currentHash`
- `actions.ownership`
- `actions.reason`
- `actualArtifactPath.relativePath`
- `artifact-directory-creation`
- `artifact-hash-mismatch-blocked`
- `artifact-metadata`
- `artifact-path`
- `artifact-path.*`
- `artifact-path.escapes-project`
- `artifact-path.fixture-write-failed`
- `artifact-path.invalid-required-metadata`
- `artifact-path.missing-required-directory`
- `artifact-path.missing-required-metadata`
- `artifact-path.symlink-escape`
- `artifact-path.unwritable-directory`
- `artifactContract`
- `artifactContract.artifactType`
- `artifactContract.defaultOutputPath`
- `artifactKind`
- `artifactPath`
- `artifactRoot`
- `artifactRoots.output_folder`
- `artifactRoots.project_knowledge`
- `artifactType`
- `bin.speclite`
- `category>.<stable-code`
- `commander@14.0.3`
- `CommandResult.command`
- `CommandResult.data`
- `CommandResult.data.completedSteps`
- `CommandResult.data.ideTargets`
- `CommandResult.data.paths`
- `CommandResult.data.pendingSteps`
- `CommandResult.issues`
- `CommandResult.nextActions`
- `CommandResult.schemaVersion`
- `CommandResult.status`
- `CommandResult.summary`
- `CommandResult.targetProject`
- `commands_body_template`
- `commands_extension`
- `commands_target_dir`
- `config-initialization`
- `ConfigInitializationSelection.values`
- `configInitializationStatus`
- `configInput.prompt`
- `configPaths`
- `configPending`
- `configPlan.issues`
- `configured`
- `configuredRoot`
- `configureProject`
- `createInvalidIndexIssue(...`
- `csv-parse@6.2.1`
- `customization`
- `data.changedPaths`
- `data.completedSteps`
- `data.conflicts`
- `data.conflicts.length`
- `data.highLevelHealth`
- `data.ideTargets`
- `data.installedModules`
- `data.manifestVersion`
- `data.paths`
- `data.paths.*`
- `data.paths.projectRoot`
- `data.pendingSteps`
- `data.skippedPaths`
- `data.sourceDescriptor`
- `data.sourceDescriptor.contentHash`
- `data.sourceDescriptor.integrityEvidence`
- `data.sourceDescriptor.sourceType`
- `data.validatedPaths`
- `Date.parse(value`
- `Date.toISOString(`
- `decision_needed=0`
- `defaultOutputPath.relativePath`
- `degraded_mode`
- `details.artifactKind`
- `details.blockedRootKind`
- `details.canonicalSkillId`
- `details.conflictCount`
- `details.reason`
- `details.targetId`
- `development_status.epic-3`
- `development_status.epic-3-retrospective`
- `development_status.epic-4`
- `development_status.epic-4-retrospective`
- `development_status.epic-5`
- `development_status.epic-5-retrospective`
- `development_status.epic-6`
- `development_status.epic-6-retrospective`
- `development_status.epic-7`
- `development_status.epic-7-retrospective`
- 另有 249 项，见 JSON。

## Evidence（证据）

完整命中、来源行号和上下文见 `config-doc-coverage.json`。
