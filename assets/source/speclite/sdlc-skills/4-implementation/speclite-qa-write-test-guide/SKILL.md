---
name: speclite-qa-write-test-guide
description: "Create human-readable, execution-ready QA test guides from product specs, technical specs, implementation notes, code facts, or prior discussion. Use when the user says '测试指南', '测试方案', '测试人员文档', '验收测试文档', 'QA test guide', 'acceptance test guide', 'test plan for QA', or asks to help testers understand logic before execution. Capable of turning complex implementation context into test data setup, trigger steps, observation evidence, pass/fail criteria, scenario matrices, and detail review checklists."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    将 PRD、TSD、Story、实现文档、代码事实或对话结论转成面向测试人员的可执行测试指南。核心原则是：不写开发设计文档，而是让测试人员清楚知道怎么构造数据、怎么触发、看哪里、什么算对、什么算错。

[Core Capabilities（核心能力）]
    - **测试心智模型提炼**：把复杂链路压缩成测试人员需要理解的业务规则、状态语义和误判边界。
    - **测试数据构造指导**：明确字段、fixture、边界值、异常输入和最小数据组合。
    - **触发与证据链设计**：把接口、Job、配置、DB、report、trace、日志和外部系统响应串成可复核执行路径。
    - **场景矩阵生成**：为每个场景输出 `Purpose`、`Data Setup`、`Trigger`、`Expected Result`、`Must Not Happen` 和 `Evidence`。
    - **严谨性审核**：检查 accepted/finished 混淆、模糊词、缺少反向断言、证据不可定位和规格臆测。
    - **可读性控制**：使用测试人员视角行文，避免类名堆叠、架构复述和无法执行的泛化描述。

[Workflow（执行流程）]
    本 Skill 采用事实盘点 -> 测试心智模型 -> 指南初稿 -> 严谨性审核 -> 定稿交付的迭代优化工作流。详细步骤、审核规则和输出模板见 `references/speclite-qa-write-test-guide-workflow.md`。

    Step 1：盘点事实来源
        读取用户指定文档、当前规格、代码事实或对话结论。区分当前事实、历史参考和未确认事项；缺少关键业务口径时停止并要求澄清。

    Step 2：建立测试心智模型
        先写测试人员必须理解的一句话规则，再列核心误判边界。例如 accepted 不等于 finished、dry-run 不等于真实写、API failure 不得写 success mapping。

    Step 3：生成测试指南
        以 `assets/test-guide-template.md` 为结构参考，输出测试数据构造、触发方式、证据清单、场景矩阵、通过/失败标准和排查路径。

    Step 4：审核并定点修正
        按 workflow reference 中的 review checklist 检查每个场景是否具备正向预期、反向断言和证据位置；修掉模糊词和开发视角表达。

    Step 5：交付
        输出文档路径、场景数量、关键覆盖点、审核结论和剩余未确认项。若写入运行产物，在文档末尾追加生成标注。

[Notes（注意事项）]
    - 先回答测试人员的五个问题：造什么数据、怎么触发、去哪看、看到什么算对、看到什么必须报错。
    - 不把接口 accepted 写成业务 finished；不把开发类名、模块层级或实现调用链当成测试执行路径。
    - 每个关键规则必须同时写正向判定和反向判定，反向判定使用 `Must Not Happen` 表达。
    - 证据必须可定位到字段、表、接口响应、trace/report、日志或外部系统响应；避免“正常”“合理”“及时”等不可执行词。
    - 未确认的第三方字段、枚举、接口返回或环境配置不得猜测；标为 open question 或要求用户确认。
    - 文档内容默认中文，章节标题使用 English（中文）形式；命令、路径、字段名、fixture 名称、schema/issue id 等技术标识使用英文。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步维护 `CHANGELOG.md`、`references/` 和 `assets/`。
