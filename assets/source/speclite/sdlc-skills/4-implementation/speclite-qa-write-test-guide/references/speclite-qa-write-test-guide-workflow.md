# QA Test Guide Writer Workflow

## Overview（概述）

本文档承载 `speclite-qa-write-test-guide` 的详细工作流。入口 SKILL.md 只保留阶段路由；执行时按本文档盘点事实、建立测试心智模型、生成测试指南、审核并定稿。

## Step 1：Fact Inventory（事实盘点）

先确认本次指南的事实来源，不要直接从记忆或通用经验写测试口径。

必须读取或确认：

- 用户点名的 PRD、TSD、Story、implementation notes、测试需求或对话结论。
- 当前代码事实或已实现入口，如果用户要求基于实现写测试指南。
- 现有测试、fixture、DB 表、接口路径、配置项和 report/trace 入口。
- 用户指定的目标路径、文档受众和执行环境。

把事实分成三类：

| 分类 | 处理方式 |
|---|---|
| Current Fact | 可直接写入测试指南，作为执行和判定依据。 |
| Historical Reference | 只能用于背景说明，不得作为当前测试预期。 |
| Unknown | 不猜测；写入 Open Questions 或先向用户确认。 |

hard stop 条件：

- 接口路径、核心字段、枚举或外部系统响应缺失，且无法从当前事实源确认。
- 用户要求的测试判定与当前规格冲突。
- 当前实现事实与规格冲突，且用户要求“按实现验收”或“按规格验收”的口径不清楚。
- 需要写入的文件路径未明确，且仓库没有可推导的测试文档目录。

## Step 2：Testing Mental Model（测试心智模型）

测试指南开头必须先建立正确心智模型。不要直接进入类名、包名或模块调用链。

推荐结构：

1. 用一句话说明本需求的测试核心。
2. 列出 3-7 条最容易误判的规则。
3. 对每条规则写出正向理解和反向禁区。

示例：

| 规则 | 正向理解 | 反向禁区 |
|---|---|---|
| accepted is not finished | 接口成功只说明文件已接收 | 不能据此断言后续 Job、外部写入或 mapping 已完成 |
| scope controls closure | 不同 `sync_scope` 决定闭合条件 | 不能把缺文件一律判为异常 |
| success-only projection | 只有外部 API 成功才写 success projection | 不能用 dry-run、blocked 或失败结果写成功快照 |

## Step 3：Guide Draft（指南初稿）

优先使用 `assets/test-guide-template.md`。如果用户已有既定模板，可以沿用用户模板，但必须保留以下执行性内容：

- Executive Summary（执行摘要）
- Core Mental Model（核心心智模型）
- Core Contracts（核心契约）
- Test Data Setup（测试数据构造）
- Trigger Steps（触发方式）
- Evidence Checklist（证据清单）
- Test Scenario Matrix（测试场景矩阵）
- Pass And Fail Criteria（通过与失败标准）
- Troubleshooting（排查提示）
- Review Checklist（审核清单）

每个测试场景必须使用固定六字段：

| 字段 | 写法要求 |
|---|---|
| `Purpose` | 说明这个场景验证哪条业务规则，不写实现类名。 |
| `Data Setup` | 明确输入文件、字段、枚举、配置或前置数据。 |
| `Trigger` | 明确调用接口、执行 Job、修改配置或等待事件的方式。 |
| `Expected Result` | 写可观察状态、响应、记录、report 或 trace。 |
| `Must Not Happen` | 写反向断言，防止测试误判。 |
| `Evidence` | 写证据位置，必须可复核。 |

## Step 4：Rigor Review（严谨性审核）

初稿完成后，必须执行一次细节审核。审核目标不是润色，而是消除歧义和不可执行表达。

### Language Review（措辞审核）

替换以下模糊表达：

| 模糊词 | 替换方向 |
|---|---|
| 正常 | 具体状态、code、字段值或记录数 |
| 合理 | 明确判断规则 |
| 及时 | 明确等待条件、Job、时间窗口或 SLA |
| 应该可见 | 明确查询入口、表、接口或 report |
| 处理成功 | 明确 accepted、closed、attempted、API success 或 projected |

### Testing Rigor Review（测试严谨性审核）

逐项检查：

- 是否把接口 accepted 和业务 finished 分开。
- 是否每个关键规则都有 `Must Not Happen`。
- 是否每个场景都有可定位证据。
- 是否存在只写“验证通过”但没有响应、状态、DB、trace 或 report 证据的场景。
- 是否猜测了第三方字段、枚举或 API 响应。
- 是否用开发模块名替代测试操作步骤。
- 是否写清楚配置模式、触发方式和等待条件。
- 是否写清楚敏感字段和日志/trace/report 的禁区。

### Structure Review（结构审核）

用脚本或人工表格检查每个场景是否包含六个必需字段。若是 Markdown 表，可用类似命令辅助检查：

```bash
rg -n "Purpose|Data Setup|Trigger|Expected Result|Must Not Happen|Evidence" <guide-file>
```

## Step 5：Delivery（交付）

交付回复包含：

- 输出文件路径。
- 场景数量和核心覆盖点。
- 已执行的审核项。
- 剩余 open questions。
- 如果运行了 `git diff --check`、字段完整性检查或其他校验，报告命令结论。

凡本 Skill 生成的运行产物，文档末尾追加：

```text
---

*本文档由 speclite-qa-write-test-guide Skill 自动生成*
```

## Output Quality Bar（输出质量线）

合格的测试指南必须让测试人员能回答：

1. 我造什么数据？
2. 我怎么触发？
3. 我去哪看？
4. 看到什么算对？
5. 看到什么必须报错？

如果这五个问题无法回答，继续修正文档，不交付。
