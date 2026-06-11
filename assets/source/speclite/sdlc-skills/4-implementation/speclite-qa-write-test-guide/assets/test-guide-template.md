# <Feature Name> Test Guide（<功能名称>测试指南）

## Document Info（文档信息）

- 文档状态：
- Feature：
- 适用对象：
- 适用范围：
- 事实来源：
- 编写原则：本文档不是开发设计文档；重点是让测试人员知道怎么构造数据、怎么触发、看哪里、什么算对、什么算错。

## Reading Path（阅读路径）

先读 Core Mental Model（核心心智模型）和 Core Contracts（核心契约），再准备 Test Data Setup（测试数据构造），最后按 Test Scenario Matrix（测试场景矩阵）逐条执行。

## Core Mental Model（核心心智模型）

### <Rule Name>（<规则名称>）

一句话说明测试人员必须记住的规则。

它表示：

- 正向判定 1。
- 正向判定 2。

它不表示：

- 反向禁区 1。
- 反向禁区 2。

## Core Contracts（核心契约）

| 契约 | 测试人员要验证的语义 |
|---|---|
| `<field-or-api>` | 明确可观察判断 |

## Test Data Setup（测试数据构造）

| 数据项 | 构造要求 |
|---|---|
| `<field>` | 明确字段、枚举、边界值或异常值 |

## Trigger Steps（触发方式）

```bash
# command or request example
```

记录：

- 接口响应。
- 关键 ID。
- 配置模式。
- 时间窗口或 Job 触发方式。

## Evidence Checklist（证据清单）

| 证据位置 | 重点字段或事实 | 用途 |
|---|---|---|
| `<table-or-report-or-trace>` | `<field>` | 判断什么是否发生 |

## Test Scenario Matrix（测试场景矩阵）

### T01 <Scenario Name>（<场景名称>）

| 项 | 内容 |
|---|---|
| Purpose（目的） | 验证哪条业务规则 |
| Data Setup（数据） | 构造哪些输入、字段、配置或前置状态 |
| Trigger（触发） | 调用哪个接口、执行哪个 Job、等待哪个事件 |
| Expected Result（预期） | 哪些响应、状态、记录、report 或 trace 必须出现 |
| Must Not Happen（不得发生） | 哪些行为一旦出现必须报错 |
| Evidence（证据） | 从哪里截图、导出、查询或记录 |

## Pass And Fail Criteria（通过与失败标准）

### A Test Passes Only When（测试通过条件）

- 输入、触发、预期结果和证据全部匹配。
- `Must Not Happen` 中的反向断言均未发生。
- 证据可以被复核。

### A Test Fails When（测试失败条件）

- 关键 ID 缺失，无法定位证据。
- 正向预期没有发生。
- 任一反向断言发生。
- 敏感信息进入禁止出现的位置。

## Troubleshooting（排查提示）

| 现象 | 先查什么 | 常见原因 |
|---|---|---|
| <symptom> | <evidence> | <cause> |

## Review Checklist（审核清单）

- 每条场景都有 `Purpose`、`Data Setup`、`Trigger`、`Expected Result`、`Must Not Happen` 和 `Evidence`。
- 没有把 accepted 写成 finished。
- 所有关键规则都有反向断言。
- 没有使用不可执行的模糊词。
- 未确认事实被写入 Open Questions，而不是被猜成规则。

---

*本文档由 speclite-qa-write-test-guide Skill 自动生成*
