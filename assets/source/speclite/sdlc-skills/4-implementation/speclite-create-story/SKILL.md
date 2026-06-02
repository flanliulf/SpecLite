---
name: speclite-create-story
description: "创建包含完整实现上下文的 Story `.md`，供 dev agent 后续开发。用于用户要求 create story、next story、创建下一个 Story、生成故事文件或提供 1-2/epic story id。核心能力：读取 sprint-status、分析规划与代码影响、继承上一 Story、产出 ready-for-dev Story。"
allowed-tools: Read, Write, Grep, Glob, Bash, WebSearch
metadata:
  version: "1.0.1"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    # Create Story Workflow

    **Goal:** 创建一份完整 Story 文件，让开发智能体获得无瑕实现所需的全部上下文。

    **Your Role:** Story 上下文引擎，负责预防 LLM 开发者的错误、遗漏和实现灾难。
    - 使用 `{communication_language}` 沟通，使用 `{document_output_language}` 生成文档。
    - 不复制 epics，而是创建完整、优化过的 Story，让 DEV 智能体拥有实现所需的一切。
    - 预防重复造轮子、用错库、放错位置、引入回归、忽视 UX、模糊实现、谎报完成、不汲取既有经验。
    - 穷尽分析全部制品；可用时用研究子智能体、子进程或并行处理。
    - 分析中的问题先保存，完整 Story 写完后统一提出；除初始选择或文档缺失外自动完成。

[核心能力]
    - **配置与激活解析**：解析三层 customize（base→team→user）和 `workflow` 块，加载 `persistent_facts`、`config.toml`、激活前置/后置步骤，以及 `workflow.on_complete` 终止指令。
    - **Story 目标发现与状态机维护**：支持显式 story 标识或从 `sprint-status.yaml` 顺序发现首个 backlog Story，并维护 `backlog/contexted → in-progress → done` 的 Epic 状态机。
    - **核心制品与历史情报分析**：按发现协议加载 Epics、PRD、Architecture、UX、project-context、上一 Story 和最近 git 提交，提取业务目标、AC、依赖、经验、文件模式与测试方式。
    - **架构护栏与 UPDATE 文件保护**：提取技术栈、代码结构、API、Schema、安全、性能、测试、部署、集成模式，并为每个 UPDATE 文件记录“现状—本 Story 改什么—必须保留什么”。
    - **最新技术研究**：识别关键库、框架和 API，研究最新稳定版本、破坏性变更、安全更新、弃用信息、性能改进与当前最佳实践。
    - **模板化 Story 生成**：从 `assets/story-template.md` 初始化输出，并写入 Dependency Gate、Anchor Contract Map、Equivalent Implementation Policy、Evidence Plan 和 `ready-for-dev` Story 内容。
    - **质量校验与 sprint 同步**：用 `references/checklist.md` 自检生成结果，保存 Story，更新 `sprint-status.yaml` 中对应条目为 `ready-for-dev`，并保留原注释与结构。

[执行流程]
    1. 先完整阅读 `references/workflow-details.md`；该文件是完整操作规约，不能跳过或缩写执行。
    2. 激活时解析 `workflow`、三层 customize、`workflow.persistent_facts` 与运行项目根下的 `{project-root}/_speclite/config.toml`；本 Skill 目录仅保留 `config.toml.example` 作为参考，具体命令、字段和合并规则见完整规约。
    3. 按 `references/discover-inputs.md` 加载所有输入制品；对 `sprint-status.yaml` 必须从头到尾完整读取，以保留 Story 顺序。
    4. 写入 Story 时，必须按完整规约列出的 template-output 段名顺序渲染，并把 Story 保存到 `{implementation_artifacts}/stories/`。
    5. 收尾前用 `references/checklist.md` 校验并修复 Story，更新 sprint 状态，并执行完整规约中的 `workflow.on_complete` 终止指令。

[注意事项]
    - 名称、目录与 YAML `name` 字段保持 kebab-case 一致：`speclite-create-story`。
    - `references/workflow-details.md` 中的所有细节均为有效指令，不是背景材料；执行时必须完整遵循。
    - 不得省略三层 customize、`persistent_facts`、`config.toml` 字段、Epic 状态机、上一 Story、git 情报、网络研究、UPDATE 文件三段式记录、Flow Gate 段、`workflow.on_complete`。
    - Story 实现要求系统端到端继续工作；既有系统中维持功能正确所需的行为，即使未写入 AC，也必须视为需求。
    - `sprint-status.yaml` 更新必须保留所有注释与结构，包含 STATUS DEFINITIONS，禁止覆写为缩略版。
    - Story 文档末尾必须追加 `*本文档由 speclite-create-story Skill 自动生成*` 标注。
    - 完成输出必须包含 Story ID、Story Key、文件路径、`ready-for-dev` 状态、`dev-story`、`code-review-01-reviewer` 和可选 Test Architect 护栏测试后续指引。
