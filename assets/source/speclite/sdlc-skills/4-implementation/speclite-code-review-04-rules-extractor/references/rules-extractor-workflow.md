# Rules Extractor Workflow v2（规则提炼工作流 v2）

本文档承载 CR04 的详细分析与 durable output 流程。共享 identity、path、schema、finding eligibility 和 execution context 以 CR shared contract 为准。

## Step 1: Collect Eligible CR Records（收集合格记录）

1. 解析 Story identity、current `reviewSeries`、round 和 CR canonical directory。
2. 读取同一 series 的 v2 review/evaluation/fix records，并按 current、historical、superseded 分类。
3. legacy v1 只作背景，不能直接生成 candidate/global rule。
4. 将 current evaluation source/hash 作为本次 report binding。

## Step 2: Build Model Timeline（构建模型时间线）

从每个 eligible artifact 提取实际 model、role、round、generatedAt 和 fix status，构建 reviewer/evaluator/fixer 时间线；缺失字段必须标记为 evidence caveat，不得猜测。

## Step 3: Analyze Findings（分析 Findings）

只分析同时满足以下条件的 finding：

- evaluator disposition 为 accepted 或 deferred；
- 非 dismissed/superseded；
- 有 concrete failure scenario、fingerprint 和验证 evidence。

按 AC、测试充分性、质量门禁、逻辑设计、安全性能、v2 bucket、disposition 和 source layer 统计。按 fingerprint family 标记跨 round/Story recurrence，以及修复是否引入新问题。

## Step 4: Extract Candidate Rules（提炼候选规则）

1. 默认只形成 `candidate-rule`。
2. 只有同一 invariant/fingerprint family 在至少两个不同 Story 被 evaluator 接受，或用户明确批准当前特例提升，才标记 `global-rule-eligible`。
3. 输出形式限定为规避指南、指导原则、最佳实践或豁免说明。
4. 每条规则记录 evidence sources、适用范围、例外和置信度依据。

## Step 5: Assess Document Targets（评估文档目标）

在用户授权的目标项目范围内扫描 project context、architecture 和开发指南文档。对每条 candidate rule 给出建议文件、章节、理由与是否需要用户裁决；不得未经授权直接修改。

## Step 6: Write Durable Report（写入 Durable Report）

1. 使用 `assets/output-template.md` 写入 shared contract 的 rules extraction canonical path。
2. frontmatter 写 evaluation source/hash、eligible finding set hash、candidate/global counts 和 `result`。
3. 正文列出 model timeline、eligible/excluded evidence、candidate rules、global eligibility 和 document suggestions。
4. 写入后重读并验证 schema、identity、hash、counts、canonical filename。
5. 将 report path/hash 和 `COMPLETED | HALTED` 返回 `handoffTarget`。

## Common Mistakes（常见错误）

- 用 reviewer 原始 finding 绕过 evaluator disposition。
- 把同一 Story 多轮复现误当成跨 Story 全局证据。
- 只在聊天中展示总结，不写 durable report。
- 未获授权就修改 project context、architecture 或开发指南。
