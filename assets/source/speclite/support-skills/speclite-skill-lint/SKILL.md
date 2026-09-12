---
name: speclite-skill-lint
description: "只读检查 Skill 定义；用于 lint skill、check skill、检查技能或评估 Skill 规范。区分基础格式、Codex 适配和 SpecLite 约定，报告证据及未检查项；Agent 定义包转交 speclite-agent-lint。"
allowed-tools: Read, Bash, Grep, Glob
metadata:
  version: "3.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

## Overview（技能说明）

只读检查普通 workflow Skill。`references/rule-registry.json` 是与 creator 共享的规则真源；规则数按注册表及适用条件计算。输出静态发现与行为验证状态，不将项目约定当作 OpenAI 官方要求。

## Core Capabilities（核心能力）

- 识别实际目标与来源，按 base、Codex 和 SpecLite 范围选择规则。
- 检查 YAML、description 目标与触发边界，保留有证据的宿主扩展。
- 检查 SpecLite 命名、版本、语义等价 mirror、配置与 ecosystem 契约。
- 用确定性脚本统计正文与 Workflow，明确未识别及歧义状态。
- 按用途核验资源组织、加载路由、输入输出、依赖缺失及停止条件。
- 按需核验 Codex agents/openai.yaml，不以静态文件推断宿主行为。
- 输出逐条 source、scope、severity、method、status 与可复核证据。

## Workflow（执行流程）

1. 读取 `references/lint-workflow.md`，定位目标并确认 profile / host。speclite-agent-*、bmad-agent-* 或 [agent] 包转交专属 lint。
2. 读取 `references/check-rules.md` 与 `references/rule-registry.json`。按实际 Skill 路径解析 `{lint-root}`，运行 `python3 "{lint-root}/scripts/list_rules.py" "{target}" --profile speclite --host codex`；参数按目标调整，外部 Skill 默认 base。此命令只生成待检查清单。
3. 按注册表逐条检查，使用安全 YAML parser；运行 `python3 "{lint-root}/scripts/check_skill_density.py" "{target}"` 取得密度证据。不得执行目标包脚本来冒充只读检查。
4. 报告 PASS / FAIL / WARN / N/A / NOT_CHECKED、理由、路径和建议；从结果计算总数。复查重新读取目标和规则契约，标明新增与修复项。

## Notes（注意事项）

- 本 Skill 不修改文件、安装副本或外部服务；Bash 仅运行可信只读检查工具。
- Error 是所选 scope 的强制契约失败，不等于所有错误都来自官网；Warning 为质量建议。缺证据时 NOT_CHECKED。
- BODY-07 / BODY-08 只消费 density schema_version=2；Workflow missing / ambiguous 的 null 不是零值或通过。项目阈值与 reference 语义复核见规则契约。
- 中文 canonical、英文 mirror、版本、speclite- 命名空间与长度预算仅适用于 SpecLite；Agent mirror 可选性由专属 lint 管理。
- 中文正文配 English（中文）标题；英文 description 可翻译，但触发边界与身份信息不可漂移。
- 不按代码围栏推断资源用途，不按单引号统计触发质量，不把 allowed-tools 当权限隔离。
- 存在 NOT_CHECKED 时不能宣称全通过；静态验证不等于加载、触发或输出质量已验证。
- 维护时同步两个入口、规则表、相关 references/scripts 与 CHANGELOG；source 和实际安装副本分别记录。
