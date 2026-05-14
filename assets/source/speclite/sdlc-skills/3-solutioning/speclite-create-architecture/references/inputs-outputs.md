# 输入产物、输出产物与资源文件清单

本文件是 `speclite-create-architecture` Skill 的输入/输出/资源详细清单，由主入口 SKILL.md 引用。

## 输入产物

| 输入 | 描述 | 路径模式 | 必填 |
| ---- | ---- | -------- | ---- |
| PRD | 产品需求文档 | `{planning_artifacts}/*prd*.md` 或 `{planning_artifacts}/*prd*/index.md` | **是** |
| Product Brief | 产品简报 | `*brief*.md` | 否 |
| UX Design | UX 设计 | `*ux-design*.md` | 否 |
| Research | 研究文档 | `*research*.md` | 否 |
| Project Knowledge | 项目知识库 | `{project_knowledge}/**` 或 `{project-root}/docs/**` | 否 |
| Project Context | 项目上下文（含技术偏好与规则） | `**/project-context.md` | 否 |

## 输出产物

- 主输出：`{planning_artifacts}/architecture.md`（基于 `assets/architecture-decision-template.md` 创建）
- 文档以 append-only 方式按步骤构建，frontmatter 持续追踪 `stepsCompleted`、`inputDocuments`、`lastStep`、`status`
- 文档章节顺序：Project Context Analysis → Starter Template Evaluation → Core Architectural Decisions → Implementation Patterns & Consistency Rules → Project Structure & Boundaries → Architecture Validation Results
- 末尾追加生成标注

## 资源文件

- `customize.toml`：workflow 配置默认值（activation_steps_prepend/append、persistent_facts、on_complete）
- `assets/architecture-decision-template.md`：架构文档模板（含 frontmatter）
- `references/steps/step-01-init.md` ~ `references/steps/step-08-complete.md`：8 个微文件步骤定义
- `references/steps/step-01b-continue.md`：续作处理器
- `data/project-types.csv`：项目类型与典型 starter 映射（web_app/mobile_app/api_backend/full_stack/cli_tool/desktop_app）
- `data/domain-complexity.csv`：业务领域与复杂度映射（e_commerce/fintech/healthcare/social/education/productivity/media/iot/government/process_control/building_automation/gaming）
