# Skill Validation Guide（技能验证指南）

## Evidence Levels（证据层次）

从 spec-guide.md 解析配套 lint 与共享 registry；记录 contract_version、registry hash 和目标包版本。list_rules.py 只生成检查计划，density 只测量入口；都不是完整静态验证或行为测试。

静态检查按全部适用规则完成，逐条给证据。宿主无法访问、未安装、未执行或无结果时记 NOT_CHECKED。用例建议、模型对“何时使用”的解释和人工推测都不计作执行结果。

## Static Review（静态复核）

1. 安全解析两种入口 frontmatter，检查字段、重复键、类型、版本、身份字段及 description 语义等价。
2. 检查所有实际依赖路径、参考资料加载路由和资源用途；示例与真实依赖分开。
3. 运行配套 `check_skill_density.py`，保存 schema_version=2 JSON。missing / ambiguous Workflow 用人工证据判 N/A 或 NOT_CHECKED；不可把 null 当作零。
4. SpecLite 任一入口超过项目预算或命中密度阈值时，精简或拆分实际流程；两个入口同步。
5. host=codex 时，按需要检查 agents/openai.yaml 的显示信息、真实 MCP 依赖、调用策略和发现说明。无需求时可 N/A。
6. 按 registry 的 method 标明脚本检查、安全 parser 检查、语义复核或行为测试，不能混为全自动 lint。

## Behavior Cases（行为用例）

为每类准备能区分正确与错误行为的代表性请求，数量按风险选择：

| 类型 | 预期 |
|---|---|
| 直接请求 | 明确用户目标时选择正确 Skill 并产生符合要求的结果 |
| 同义/口语表达 | 不依赖精确关键词也能识别相同目标 |
| 输入缺失 | 只问影响执行的关键信息；已有授权和信息不重复询问 |
| 相邻但不相关请求 | 不误触发；creator 与 Agent creator 等边界清楚 |
| 边界请求 | 不虚构事实、不扩大范围、不执行未支持动作 |
| 依赖不可用 | 清楚停止或按已定义路线降级，不伪造工具结果 |
| 输出质量 | 文件可打开、字段完整、证据可追溯，满足用户成功标准 |

Codex 还应区分显式调用与隐式匹配；allow_implicit_invocation=false 时隐式不触发是正确结果。存在多个同名安装包时先确认实际消费路径，不能拿另一个版本的测试证明本次 source 生效。

## Execution Record（执行记录）

| Case | Host / version | Skill path / version / hash | Input | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| case-id | 实际宿主与版本 | 实际消费的包身份 | 具体请求 | 可判定结果 | 实际结果或未执行原因 | PASS / FAIL / NOT_CHECKED | 日志或产物路径 |

触发率只能由明确样本数和实际结果计算；不预设 90% 或“约 0%”为官网标准。报告 activation 和 output quality 两类结论。涉及外部写操作的测试仅在当前授权范围内执行。

## Completion（交付）

报告静态 PASS/FAIL/WARN/N/A/NOT_CHECKED 计数和行为测试状态；说明剩余用例、宿主或依赖限制。不能将 source 修改、静态通过、安装成功和实际消费合并为一个“完成”结论。重测时绑定新版本，不沿用旧证据。
