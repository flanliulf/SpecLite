---
name: speclite-skill-creator
description: "创建或迭代 SpecLite workflow Skill；用于 create skill、新建技能、生成技能包或封装工作流。设计入口、辅助资源和验证用例；Agent 定义包转交 speclite-agent-creator。"
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "2.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

## Overview（技能说明）

创建 SpecLite 普通 workflow Skill，输出中文 SKILL.md、英文 mirror、CHANGELOG 和按需辅助资源。按共享规则契约区分基础格式、Codex 适配与项目约定；不宣称生成结果已获官方认证。

## Core Capabilities（核心能力）

- 识别目标、输入输出、触发边界和缺失信息，一次最多问三个有实质影响的问题。
- 按实际需求选取工作流模式，支持 core、sdlc、support 与 ecosystem source 分区。
- 用共享规则表生成规范字段、语义等价的双语入口及版本记录。
- 按需配置 Codex 调用策略、显示信息和真实 MCP 依赖。
- 将详细规则、模板讲解、输出模板和确定性代码按用途组织，并明确加载路由。
- 运行密度检查、静态复核并提供可执行行为用例，区分未测试与已验证。

## Workflow（执行流程）

1. 读取 `references/skill-creation-workflow.md`，确认 SpecLite 目标、source 路径、宿主与用户已授权范围。Agent 包转交专属 creator。
2. 规划前读取 `references/spec-guide.md`，按其中 Shared Contract 路由解析实际 `{lint-root}` 并读取共享 registry；需要选择执行模式时读取 `references/workflow-patterns.md`。
3. 生成前读取 `references/templates.md`，按规则实例化入口与资源；Codex 配置仅在需要且字段值已核实时生成。实施流程加入 owning SPEC、等价实现证据及 Flow Gate guidance。
4. 使用当前配套 lint 的 `scripts/check_skill_density.py` 统计两个入口；Workflow 未识别时不能判 PASS。命中项目密度阈值时抽取实际承载流程的 reference，并在入口说明何时读取。
5. 验证前读取 `references/testing-guide.md`；按共享规则清单检查草稿，记录静态结果和真实宿主行为测试状态。已有用户授权足够时继续，不重复请求确认。
6. 交付文件树、版本、契约版本、验证证据和未执行用例。安装、外部 mirror 同步与分发按本次授权执行。

## Notes（注意事项）

- 本 creator 专用于 SpecLite；中文 canonical、英文 mirror、CHANGELOG、speclite- 前缀与长度预算是项目约定。
- metadata.version / author 必填，catalog 可选且存在时为 speclite；未知扩展字段查来源和消费方，不冒充官方禁止。
- description 可翻译，目标、触发与排除边界等价；身份字段保持一致。英文 mirror 不是 Codex 自动读取的第二入口。
- name 匹配 speclite-agent-* / bmad-agent-* 或 customize.toml 含 [agent] 时使用 speclite-agent-creator；缺少依赖时报告未执行。
- ecosystem source 分区为 `ecosystems/<category>/<id>`，category 仅 frontend、backend、other；module metadata、help row、selected-only 和 other admission 按详细流程保留。
- 脚本用于确定性需求；allowed-tools 不提供跨宿主权限隔离，也不代替 MCP 依赖声明。
- 过程输出遵循项目 `.specskills/output/`、`.specskills/docs/analysis/` 约定；source 编辑与安装副本同步分开记录，不隐式写入外部工作区。
- 维护时同步两个入口、相关 references/scripts 和 CHANGELOG；本次 source 修订不自动代表安装副本已更新。
