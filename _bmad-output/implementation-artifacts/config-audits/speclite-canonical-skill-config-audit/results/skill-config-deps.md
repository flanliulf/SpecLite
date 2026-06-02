# Skill Config Dependencies（Skill 配置依赖提取）

- 生成时间：2026-05-28T04:03:30.868Z
- Skill 数量：53
- 扫描文本文件数量：396
- 含配置文件引用的 Skill：45
- 含配置项引用的 Skill：48
- 配置文件引用去重数：264
- 配置文件引用出现次数：610
- 配置项引用去重数：2741
- 配置项引用出现次数：4049

## Per Skill Summary（逐 Skill 汇总）

| Skill | Scope | Files | Config Files | Config Items |
| --- | --- | ---: | ---: | ---: |
| `speclite-advanced-elicitation` | `core-skills` | 3 | 2 | 23 |
| `speclite-brainstorming` | `core-skills` | 13 | 4 | 28 |
| `speclite-customize` | `core-skills` | 2 | 5 | 24 |
| `speclite-distillator` | `core-skills` | 6 | 0 | 7 |
| `speclite-editorial-review-prose` | `core-skills` | 1 | 0 | 0 |
| `speclite-editorial-review-structure` | `core-skills` | 1 | 0 | 0 |
| `speclite-help` | `core-skills` | 2 | 4 | 24 |
| `speclite-index-docs` | `core-skills` | 1 | 0 | 0 |
| `speclite-party-mode` | `core-skills` | 2 | 1 | 21 |
| `speclite-review-acceptance-auditor` | `core-skills` | 1 | 0 | 1 |
| `speclite-review-adversarial-general` | `core-skills` | 1 | 0 | 0 |
| `speclite-review-edge-case-hunter` | `core-skills` | 1 | 0 | 4 |
| `speclite-shard-doc` | `core-skills` | 1 | 0 | 0 |
| `speclite-domain-research` | `sdlc-skills` | 12 | 6 | 46 |
| `speclite-market-research` | `sdlc-skills` | 12 | 6 | 46 |
| `speclite-technical-research` | `sdlc-skills` | 12 | 6 | 46 |
| `speclite-agent-analyst` | `sdlc-skills` | 4 | 4 | 55 |
| `speclite-agent-tech-writer` | `sdlc-skills` | 7 | 4 | 55 |
| `speclite-brownfield-context-builder` | `sdlc-skills` | 26 | 23 | 163 |
| `speclite-document-project` | `sdlc-skills` | 18 | 10 | 305 |
| `speclite-prfaq` | `sdlc-skills` | 13 | 7 | 47 |
| `speclite-product-brief` | `sdlc-skills` | 15 | 7 | 47 |
| `speclite-agent-pm` | `sdlc-skills` | 3 | 4 | 54 |
| `speclite-agent-ux-designer` | `sdlc-skills` | 3 | 4 | 54 |
| `speclite-create-prd` | `sdlc-skills` | 24 | 6 | 81 |
| `speclite-create-ux-design` | `sdlc-skills` | 21 | 6 | 44 |
| `speclite-edit-prd` | `sdlc-skills` | 12 | 6 | 55 |
| `speclite-validate-prd` | `sdlc-skills` | 22 | 6 | 70 |
| `speclite-agent-architect` | `sdlc-skills` | 3 | 4 | 54 |
| `speclite-check-implementation-readiness` | `sdlc-skills` | 12 | 6 | 42 |
| `speclite-create-architecture` | `sdlc-skills` | 22 | 13 | 172 |
| `speclite-create-epics-and-stories` | `sdlc-skills` | 7 | 8 | 62 |
| `speclite-generate-project-context` | `sdlc-skills` | 9 | 9 | 97 |
| `speclite-story-review-01-reviewer` | `sdlc-skills` | 4 | 1 | 28 |
| `speclite-story-review-02-evaluator` | `sdlc-skills` | 3 | 1 | 19 |
| `speclite-story-review-03-fixer` | `sdlc-skills` | 2 | 1 | 18 |
| `speclite-agent-dev` | `sdlc-skills` | 3 | 4 | 54 |
| `speclite-checkpoint-preview` | `sdlc-skills` | 11 | 6 | 48 |
| `speclite-code-review-01-reviewer` | `sdlc-skills` | 4 | 2 | 27 |
| `speclite-code-review-02-evaluator` | `sdlc-skills` | 3 | 2 | 13 |
| `speclite-code-review-03-fixer` | `sdlc-skills` | 2 | 2 | 12 |
| `speclite-code-review-04-rules-extractor` | `sdlc-skills` | 2 | 2 | 12 |
| `speclite-code-review-05-todo-tracker` | `sdlc-skills` | 3 | 2 | 12 |
| `speclite-code-review-06-finalizer` | `sdlc-skills` | 2 | 4 | 19 |
| `speclite-correct-course` | `sdlc-skills` | 6 | 7 | 46 |
| `speclite-create-story` | `sdlc-skills` | 8 | 9 | 107 |
| `speclite-dev-story` | `sdlc-skills` | 7 | 14 | 81 |
| `speclite-flow-gate` | `sdlc-skills` | 7 | 3 | 49 |
| `speclite-qa-generate-e2e-tests` | `sdlc-skills` | 6 | 7 | 42 |
| `speclite-quick-dev` | `sdlc-skills` | 14 | 8 | 73 |
| `speclite-retrospective` | `sdlc-skills` | 5 | 11 | 220 |
| `speclite-sprint-planning` | `sdlc-skills` | 7 | 9 | 66 |
| `speclite-sprint-status` | `sdlc-skills` | 5 | 8 | 68 |

## Per Skill Details（逐 Skill 明细）

### speclite-advanced-elicitation

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-advanced-elicitation`
- Scanned Files：3
- Config Files：`{project-root}/_speclite/config.toml`, `references/methods.csv`
- Config Items：`communication_language`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `method_name`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `output_folder`, `output_pattern`, `planning_artifacts`, `project_knowledge`, `project_name`, `project-root`, `user_name`, `user_skill_level`

### speclite-brainstorming

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-brainstorming`
- Scanned Files：13
- Config Files：`../brain-methods.csv`, `{project-root}/_speclite/config.toml`, `brain-methods.csv`, `references/brain-methods.csv`
- Config Items：`{brainstorming_session_output_file}`, `brainstorming_session_output_file`, `communication_language`, `context_file`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `output_folder`, `planning_artifacts`, `project_knowledge`, `project_name`, `project-root`, `session_goals`, `session_topic`, `skill-root`, `technique_name`, `user_name`, `user_skill_level`

### speclite-customize

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-customize`
- Scanned Files：2
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-name}.user.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `config.user.toml`, `customize.toml`
- Config Items：`communication_language`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `output_folder`, `planning_artifacts`, `project_knowledge`, `project_name`, `project-root`, `skill-name`, `skill-root`, `user_name`, `user_skill_level`, `workflow`

### speclite-distillator

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-distillator`
- Scanned Files：6
- Config Files：无
- Config Items：`downstream_consumer`, `output_path`, `path1`, `path2`, `skill-root`, `source_documents`, `token_budget`

### speclite-editorial-review-prose

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-editorial-review-prose`
- Scanned Files：1
- Config Files：无
- Config Items：无

### speclite-editorial-review-structure

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-editorial-review-structure`
- Scanned Files：1
- Config Files：无
- Config Items：无

### speclite-help

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-help`
- Scanned Files：2
- Config Files：`{project-root}/_speclite/_config/speclite-help.csv`, `{project-root}/_speclite/config.toml`, `{project-root}/_speclite/config.user.toml`, `{speclite-runtime-root}/_config/speclite-help.csv`
- Config Items：`_meta`, `{communication_language}`, `communication_language`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `output_folder`, `outputs`, `planning_artifacts`, `project_knowledge`, `project_name`, `project-root`, `user_name`, `user_skill_level`

### speclite-index-docs

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-index-docs`
- Scanned Files：1
- Config Files：无
- Config Items：无

### speclite-party-mode

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-party-mode`
- Scanned Files：2
- Config Files：`{project-root}/_speclite/config.toml`
- Config Items：`communication_language`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `output_folder`, `planning_artifacts`, `project_knowledge`, `project_name`, `project-root`, `user_name`, `user_skill_level`

### speclite-review-acceptance-auditor

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-review-acceptance-auditor`
- Scanned Files：1
- Config Files：无
- Config Items：`also_consider`

### speclite-review-adversarial-general

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-review-adversarial-general`
- Scanned Files：1
- Config Files：无
- Config Items：无

### speclite-review-edge-case-hunter

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-review-edge-case-hunter`
- Scanned Files：1
- Config Files：无
- Config Items：`guard_snippet`, `location`, `potential_consequence`, `trigger_condition`

### speclite-shard-doc

- Scope：`core-skills`
- Skill Dir：`assets/source/speclite/core-skills/speclite-shard-doc`
- Scanned Files：1
- Config Files：无
- Config Items：无

### speclite-domain-research

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research`
- Scanned Files：12
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{{research_topic}}`, `{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`, `persistent_facts`, `planning_artifacts`，另有 16 项

### speclite-market-research

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research`
- Scanned Files：12
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{{research_topic}}`, `{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`, `persistent_facts`, `planning_artifacts`，另有 16 项

### speclite-technical-research

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research`
- Scanned Files：12
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{{research_topic}}`, `{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`, `persistent_facts`, `planning_artifacts`，另有 16 项

### speclite-agent-analyst

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst`
- Scanned Files：4
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`
- Config Items：`{agent.activation_steps_append}`, `{agent.activation_steps_prepend}`, `{agent.communication_style}`, `{agent.icon}`, `{agent.identity}`, `{agent.menu}`, `{agent.persistent_facts}`, `{agent.principles}`, `{agent.role}`, `{communication_language}`, `{user_name}`, `activation_steps_append`, `activation_steps_prepend`, `agent`, `agent.activation_steps_append`, `agent.activation_steps_prepend`, `agent.communication_style`, `agent.icon`, `agent.identity`, `agent.menu`, `agent.menu.code`, `agent.menu.description`, `agent.menu.prompt`, `agent.menu.skill`, `agent.name`, `agent.persistent_facts`, `agent.principles`, `agent.role`, `agent.title`, `communication_language`，另有 25 项

### speclite-agent-tech-writer

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer`
- Scanned Files：7
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`
- Config Items：`{agent.activation_steps_append}`, `{agent.activation_steps_prepend}`, `{agent.communication_style}`, `{agent.icon}`, `{agent.identity}`, `{agent.menu}`, `{agent.persistent_facts}`, `{agent.principles}`, `{agent.role}`, `{communication_language}`, `{user_name}`, `activation_steps_append`, `activation_steps_prepend`, `agent`, `agent.activation_steps_append`, `agent.activation_steps_prepend`, `agent.communication_style`, `agent.icon`, `agent.identity`, `agent.menu`, `agent.menu.code`, `agent.menu.description`, `agent.menu.prompt`, `agent.menu.skill`, `agent.name`, `agent.persistent_facts`, `agent.principles`, `agent.role`, `agent.title`, `communication_language`，另有 25 项

### speclite-brownfield-context-builder

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder`
- Scanned Files：26
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `api-contract-candidates.json`, `Cargo.toml`, `config-surface.json`, `config.toml.example`, `evidence/config-surface.json`, `evidence/historical-docs-index.json`, `evidence/repo-manifest.json`, `evidence/schema-migration-index.json`, `historical-docs-index.json`, `os.env`, `package-lock.json`, `package.json`, `pnpm-lock.yaml`, `process.env`, `pubspec.yaml`, `pyproject.toml`，另有 3 项
- Config Items：`_error`, `.adoc`, `.dart`, `.go`, `.java`, `.kt`, `.kts`, `.org`, `.php`, `.rb`, `.rs`, `.rst`, `.svelte`, `.swift`, `.tsx`, `.vue`, `{{feature_name}}`, `{{placeholder_name}}`, `{{row_field}}`, `{brownfield_output}`, `{history_sources}`, `{planning_artifacts}`, `{project_knowledge}`, `@Table(name="...`, `@TableName(value="user_info`, `*_status`, `*.java`, `*.kt`, `ac_1`, `ac_2`，另有 133 项

### speclite-document-project

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project`
- Scanned Files：18
- Config Files：`.gitlab-ci.yml`, `{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `assets/project-scan-report-schema.json`, `config.toml.example`, `customize.toml`, `docker-compose.yml`, `package.json`
- Config Items：`{{build_command}}`, `{{dependent_path}}`, `{{dev_command}}`, `{{entry_point}}`, `{{feature_path}}`, `{{folder_path}}`, `{{import_path}}`, `{{install_command}}`, `{{integration_path}}`, `{{main_entry_point}}`, `{{reference_file}}`, `{{root_path}}`, `{{test_command}}`, `{{utility_name}}`, `{{utility_path}}`, `{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `api_count`, `api_description`, `api_endpoint`, `api_part_id`, `api_route_count`，另有 275 项

### speclite-prfaq

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq`
- Scanned Files：13
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`, `data/speclite-manifest.json`
- Config Items：`{communication_language}`, `{concept_type}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `concept_type`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `current_stage`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`，另有 17 项

### speclite-product-brief

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief`
- Scanned Files：15
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`, `data/speclite-manifest.json`
- Config Items：`{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.brief_template}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `brief_template`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`, `output-location`，另有 17 项

### speclite-agent-pm

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm`
- Scanned Files：3
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`
- Config Items：`{agent.activation_steps_append}`, `{agent.activation_steps_prepend}`, `{agent.communication_style}`, `{agent.icon}`, `{agent.identity}`, `{agent.menu}`, `{agent.persistent_facts}`, `{agent.principles}`, `{agent.role}`, `{communication_language}`, `{user_name}`, `activation_steps_append`, `activation_steps_prepend`, `agent`, `agent.activation_steps_append`, `agent.activation_steps_prepend`, `agent.communication_style`, `agent.icon`, `agent.identity`, `agent.menu`, `agent.menu.code`, `agent.menu.description`, `agent.menu.skill`, `agent.name`, `agent.persistent_facts`, `agent.principles`, `agent.role`, `agent.title`, `communication_language`, `communication_style`，另有 24 项

### speclite-agent-ux-designer

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer`
- Scanned Files：3
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`
- Config Items：`{agent.activation_steps_append}`, `{agent.activation_steps_prepend}`, `{agent.communication_style}`, `{agent.icon}`, `{agent.identity}`, `{agent.menu}`, `{agent.persistent_facts}`, `{agent.principles}`, `{agent.role}`, `{communication_language}`, `{user_name}`, `activation_steps_append`, `activation_steps_prepend`, `agent`, `agent.activation_steps_append`, `agent.activation_steps_prepend`, `agent.communication_style`, `agent.icon`, `agent.identity`, `agent.menu`, `agent.menu.code`, `agent.menu.description`, `agent.menu.skill`, `agent.name`, `agent.persistent_facts`, `agent.principles`, `agent.role`, `agent.title`, `communication_language`, `communication_style`，另有 24 项

### speclite-create-prd

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd`
- Scanned Files：24
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{product_differentiator_content}`, `{project_classification_content}`, `{project_knowledge}`, `{user_name}`, `{vision_alignment_content}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `all_journeys`, `chosen_approach`, `chosen_mvp_approach`, `communication_language`, `config.toml.example`, `contingency_approach`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `detection_signals`, `document_output_language`, `essential_journeys_for_mvp`, `implementation_artifacts`，另有 51 项

### speclite-create-ux-design

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design`
- Scanned Files：21
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{product_knowledge}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `default_output_file`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`, `persistent_facts`，另有 14 项

### speclite-edit-prd

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd`
- Scanned Files：12
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `current_date`, `detection_signals`, `document_output_language`, `implementation_artifacts`, `innovation_signals`, `key_questions`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`，另有 25 项

### speclite-validate-prd

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd`
- Scanned Files：22
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `brief_file_name`, `classification.domain`, `classification.projectType`, `communication_language`, `complete_fields`, `complete_sections`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `current_date`, `detection_signals`, `discovered_path`, `document_output_language`, `implementation_artifacts`, `innovation_signals`，另有 40 项

### speclite-agent-architect

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect`
- Scanned Files：3
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`
- Config Items：`{agent.activation_steps_append}`, `{agent.activation_steps_prepend}`, `{agent.communication_style}`, `{agent.icon}`, `{agent.identity}`, `{agent.menu}`, `{agent.persistent_facts}`, `{agent.principles}`, `{agent.role}`, `{communication_language}`, `{user_name}`, `activation_steps_append`, `activation_steps_prepend`, `agent`, `agent.activation_steps_append`, `agent.activation_steps_prepend`, `agent.communication_style`, `agent.icon`, `agent.identity`, `agent.menu`, `agent.menu.code`, `agent.menu.description`, `agent.menu.skill`, `agent.name`, `agent.persistent_facts`, `agent.principles`, `agent.role`, `agent.title`, `communication_language`, `communication_style`，另有 24 项

### speclite-check-implementation-readiness

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness`
- Scanned Files：12
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`, `outputFile`, `persistent_facts`, `planning_artifacts`，另有 12 项

### speclite-create-architecture

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture`
- Scanned Files：22
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-name}.toml`, `{skill-name}.user.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `ci.yml`, `config.toml`, `config.toml.example`, `customize.toml`, `docker-compose.yml`, `package.json`, `tsconfig.json`
- Config Items：`{communication_language}`, `{document_output_language}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `analysis_of_evaluated_starters`, `api_boundary_definitions_and_endpoints`, `api_naming_rules_with_examples`, `api_related_decisions_with_versions_and_rationale`, `api_response_structure_rules`, `areas_that_could_be_improved_later`, `assessment_of_decision_documentation_completeness`, `assessment_of_how_all_decisions_work_together`, `beginner_friendly_reason`, `build_tools_and_optimization`, `code_naming_rules_with_examples`, `communication_language`, `complete_project_tree_with_all_files_and_directories`, `complexity_level`, `component_communication_patterns_and_boundaries`, `component_count`, `components_or_epics`, `concerns_that_will_affect_multiple_components`, `concise_option_list_with_tradeoffs`, `concrete_examples_of_correct_pattern_usage`, `config.toml.example`，另有 142 项

### speclite-create-epics-and-stories

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories`
- Scanned Files：7
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-name}.user.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{{additional_requirements}}`, `{{epics_list}}`, `{{fr_list}}`, `{{nfr_list}}`, `{{project_name}}`, `{{requirements_coverage_map}}`, `{{ux_design_requirements}}`, `{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `additional_criteria`, `additional_requirements`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `epic_goal_N`，另有 32 项

### speclite-generate-project-context

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context`
- Scanned Files：9
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `Cargo.toml`, `config.toml.example`, `customize.toml`, `package.json`, `tsconfig.json`
- Config Items：`{communication_language}`, `{document_output_language}`, `{planning_artifacts}`, `{project_knowledge}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `anti_patterns_and_edge_cases`, `area_1`, `area_2`, `area_3`, `branch_naming_conventions`, `bullet_points_of_anti_patterns_and_edge_cases`, `bullet_points_of_critical_language_rules`, `bullet_points_of_framework_patterns`, `bullet_points_of_style_and_quality_rules`, `bullet_points_of_testing_requirements`, `bullet_points_of_workflow_patterns`, `category_name`, `comment_and_documentation_patterns`, `commit_message_patterns`, `communication_language`, `component_organization_rules`, `concise_technology_list`, `concise_technology_list_with_exact_versions`, `config.toml.example`, `core`，另有 67 项

### speclite-story-review-01-reviewer

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-01-reviewer`
- Scanned Files：4
- Config Files：`module.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$baseline_files`, `$epic_file`, `$epic_id`, `$failed_layers`, `$review_findings`, `$review_scope`, `$review_type`, `$round_number`, `$snake_case`, `$sr_dir`, `$story_files`, `$story_id`, `decision_needed`, `implementation_artifacts`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `story`, `story_title`, `story-count`, `story-file-1`, `story-file-2`, `story-file-path`, `story-id`, `story-id-1`, `story-id-2`

### speclite-story-review-02-evaluator

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-02-evaluator`
- Scanned Files：3
- Config Files：`module.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$epic_id`, `$evaluation_findings`, `$evaluation_round_number`, `$failed_layers`, `$latest_review_file`, `$review_round_number`, `$review_scope`, `$snake_case`, `$sr_dir`, `$story_id`, `decision_needed`, `implementation_artifacts`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `story`, `story-id`

### speclite-story-review-03-fixer

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-03-fixer`
- Scanned Files：2
- Config Files：`module.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$epic_id`, `$evaluation_file_path`, `$failed_layers`, `$fix_items`, `$fix_plan`, `$fix_results`, `$review_scope`, `$snake_case`, `$sr_dir`, `$story_id`, `implementation_artifacts`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `story`, `story-id`

### speclite-agent-dev

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev`
- Scanned Files：3
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`
- Config Items：`{agent.activation_steps_append}`, `{agent.activation_steps_prepend}`, `{agent.communication_style}`, `{agent.icon}`, `{agent.identity}`, `{agent.menu}`, `{agent.persistent_facts}`, `{agent.principles}`, `{agent.role}`, `{communication_language}`, `{user_name}`, `activation_steps_append`, `activation_steps_prepend`, `agent`, `agent.activation_steps_append`, `agent.activation_steps_prepend`, `agent.communication_style`, `agent.icon`, `agent.identity`, `agent.menu`, `agent.menu.code`, `agent.menu.description`, `agent.menu.skill`, `agent.name`, `agent.persistent_facts`, `agent.principles`, `agent.role`, `agent.title`, `communication_language`, `communication_style`，另有 24 项

### speclite-checkpoint-preview

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview`
- Scanned Files：11
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{communication_language}`, `{document_output_language}`, `{implementation_artifacts}`, `{planning_artifacts}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `baseline_commit`, `change_type`, `communication_language`, `config`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `HEAD~1..HEAD`, `implementation_artifacts`, `intent_summary`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`，另有 18 项

### speclite-code-review-01-reviewer

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer`
- Scanned Files：4
- Config Files：`speclite-workflow-status.yaml`, `sprint-status.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$anchor_evidence_summary`, `$cr_dir`, `$failed_layers`, `$review_context`, `$review_findings`, `$review_input`, `$review_mode`, `$review_type`, `$round_number`, `$snake_case`, `$spec_content`, `$story_completion_gate_report`, `$story_id`, `decision_needed`, `guard_snippet`, `HEAD~3..HEAD`, `implementation_artifacts`, `location`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `potential_consequence`, `sha1>..<sha2`, `story-id`, `trigger_condition`

### speclite-code-review-02-evaluator

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator`
- Scanned Files：3
- Config Files：`speclite-workflow-status.yaml`, `sprint-status.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$cr_dir`, `$failed_layers`, `$review_input`, `$snake_case`, `$story_id`, `decision_needed`, `implementation_artifacts`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `story-id`

### speclite-code-review-03-fixer

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer`
- Scanned Files：2
- Config Files：`speclite-workflow-status.yaml`, `sprint-status.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$cr_dir`, `$failed_layers`, `$review_input`, `$snake_case`, `$story_id`, `implementation_artifacts`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `story-id`

### speclite-code-review-04-rules-extractor

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor`
- Scanned Files：2
- Config Files：`speclite-workflow-status.yaml`, `sprint-status.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$cr_dir`, `$failed_layers`, `$review_input`, `$snake_case`, `$story_id`, `implementation_artifacts`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `story-id`

### speclite-code-review-05-todo-tracker

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker`
- Scanned Files：3
- Config Files：`speclite-workflow-status.yaml`, `sprint-status.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$cr_dir`, `$failed_layers`, `$review_input`, `$snake_case`, `$story_id`, `implementation_artifacts`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `story-id`

### speclite-code-review-06-finalizer

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer`
- Scanned Files：2
- Config Files：`{implementation_artifacts}/sprint-status.yaml`, `{planning_artifacts}/speclite-workflow-status.yaml`, `speclite-workflow-status.yaml`, `sprint-status.yaml`
- Config Items：`{implementation_artifacts}`, `{planning_artifacts}`, `$cr_dir`, `$failed_layers`, `$review_input`, `$snake_case`, `$story_id`, `development_status`, `implementation_artifacts`, `last_updated`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `planning_artifacts`, `status:`, `story-completion-gate-file`, `story-completion-gate-result`, `story-file-path`, `story-id`, `story-key`

### speclite-correct-course

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course`
- Scanned Files：6
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`, `sprint-status.yaml`
- Config Items：`{communication_language}`, `{document_output_language}`, `{project_knowledge}`, `{user_name}`, `{user_skill_level}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `change_trigger`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `default_output_file`, `document_output_language`, `handoff_recipients`, `implementation_artifacts`, `list_of_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`，另有 16 项

### speclite-create-story

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story`
- Scanned Files：8
- Config Files：`{implementation_artifacts}/sprint-status.yaml`, `{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml`, `config.toml.example`, `customize.toml`, `sprint-status.yaml`
- Config Items：`{{agent_model_name_version}}`, `{{epic_num}}`, `{architecture_content}`, `{architecture_file}`, `{communication_language}`, `{default_output_file}`, `{document_output_language}`, `{epic_num}`, `{epic_num}-{story_num}`, `{epic_num}-1-*`, `{epics_content}`, `{epics_file}`, `{implementation_artifacts}`, `{pattern_name_content}`, `{prd_content}`, `{previous_story_num}`, `{sprint_status}`, `{story_id}`, `{story_key}`, `{story_num}`, `{story_path}`, `{story_root}`, `{user_name}`, `{ux_content}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `agent_model_name_version`，另有 77 项

### speclite-dev-story

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story`
- Scanned Files：7
- Config Files：`_speclite/config.toml`, `_speclite/config.user.toml`, `_speclite/custom/config.toml`, `_speclite/custom/config.user.toml`, `{implementation_artifacts}/sprint-status.yaml`, `{project-root}/_speclite/config.toml`, `{skill-name}.toml`, `{skill-name}.user.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`, `sprint-status.yaml`
- Config Items：`{communication_language}`, `{current_sprint_status}`, `{document_output_language}`, `{pending_review_items}`, `{project_context}`, `{resolved_review_items}`, `{sprint_status}`, `{story_key}`, `{story_path}`, `{story_root}`, `{user_name}`, `{user_skill_level}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `completed_items`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `current_sprint_status`, `current_status`, `development_status`，另有 51 项

### speclite-flow-gate

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate`
- Scanned Files：7
- Config Files：`{implementation_artifacts}/sprint-status.yaml`, `{project-root}/_speclite/config.toml`, `sprint-status.yaml`
- Config Items：`{{model_used}}`, `{flow_gate_root}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `contract_anchor_findings`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `document_output_language`, `evidence_anchor_findings`, `flow_gate_root`, `functional_anchor_findings`, `guidance_equivalence_findings`, `implementation_artifacts`, `missing_or_ambiguous_items`, `model_used`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`, `persistent_facts`, `planning_artifacts`, `project_knowledge`，另有 19 项

### speclite-qa-generate-e2e-tests

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests`
- Scanned Files：6
- Config Files：`{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`, `package.json`
- Config Items：`{communication_language}`, `{default_output_file}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `default_output_file`, `document_output_language`, `implementation_artifacts`, `modules.sdlc`, `modules.sdlc.implementation_artifacts`, `modules.sdlc.planning_artifacts`, `modules.sdlc.project_knowledge`, `on_complete`, `output_folder`, `persistent_facts`, `planning_artifacts`, `project_knowledge`, `project_name`，另有 12 项

### speclite-quick-dev

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev`
- Scanned Files：14
- Config Files：`{implementation_artifacts}/sprint-status.yaml`, `{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`, `sprint-status.yaml`
- Config Items：`{baseline_commit}`, `{communication_language}`, `{deferred_work_file}`, `{diff_output}`, `{document_output_language}`, `{epic_num}`, `{epic_num}-{story_num}`, `{implementation_artifacts}`, `{planning_artifacts}`, `{preserved_intent}`, `{spec_file}`, `{sprint_status}`, `{story_key}`, `{story_num}`, `{target_status}`, `{user_name}`, `{user_skill_level}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `baseline_commit`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`，另有 43 项

### speclite-retrospective

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective`
- Scanned Files：5
- Config Files：`_speclite/config.toml`, `_speclite/config.user.toml`, `_speclite/custom/config.toml`, `_speclite/custom/config.user.toml`, `{implementation_artifacts}/sprint-status.yaml`, `{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`
- Config Items：`{communication_language}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `acceptance_action_needed`, `acceptance_status`, `action_count`, `action_item_1`, `action_item_2`, `activation_steps_append`, `activation_steps_prepend`, `actual_points`, `actual_reality_1`, `actual_reality_2`, `actual_sprints`, `additional_testing_context`, `affected_area`, `agent_1`, `agent_2`, `agent_3`, `agent_4`, `agent_5`, `agent_6`, `agent_roster`, `agreement_1`, `agreement_2`, `agreement_3`, `alternative_timeline`, `architecture_content`，另有 190 项

### speclite-sprint-planning

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning`
- Scanned Files：7
- Config Files：`{implementation_artifacts}/sprint-status.yaml`, `{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `assets/sprint-status-template.yaml`, `config.toml.example`, `customize.toml`, `sprint-status.yaml`
- Config Items：`{communication_language}`, `{document_output_language}`, `{epics_pattern}`, `{implementation_artifacts}`, `{planning_artifacts}`, `{status_file}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `development_status`, `development_status.epic-1`, `development_status.epic-1-retrospective`, `development_status.epic-2`, `development_status.epic-2-retrospective`, `document_output_language`, `done_count`, `epic_count`, `epics_location`，另有 36 项

### speclite-sprint-status

- Scope：`sdlc-skills`
- Skill Dir：`assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status`
- Scanned Files：5
- Config Files：`{implementation_artifacts}/sprint-status.yaml`, `{project-root}/_speclite/config.toml`, `{skill-root}/customize.toml`, `{speclite-runtime-root}/custom/{skill-name}.toml`, `{speclite-runtime-root}/custom/{skill-name}.user.toml`, `config.toml.example`, `customize.toml`, `sprint-status.yaml`
- Config Items：`{communication_language}`, `{sprint_status_file}`, `{user_name}`, `{workflow.activation_steps_append}`, `{workflow.activation_steps_prepend}`, `{workflow.persistent_facts}`, `activation_steps_append`, `activation_steps_prepend`, `communication_language`, `config.toml.example`, `core`, `core.communication_language`, `core.document_output_language`, `core.output_folder`, `core.project_name`, `core.user_name`, `core.user_skill_level`, `count_backlog`, `count_done`, `count_in_progress`, `count_ready`, `count_review`, `document_output_language`, `epic_backlog`, `epic_done`, `epic_in_progress`, `flow_gate_root`, `implementation_artifacts`, `invalid_entries`, `last_updated`，另有 38 项

## Evidence（证据）

完整来源文件、行号和上下文见 `skill-config-deps.json`。
