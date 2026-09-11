# Finalizer Workflow v2（Finalizer 工作流 v2）

本文档承载 CR06 的详细 fail-closed closeout 流程。共享 identity、scope、freshness、tracker 和 finalizer report schema 以 CR shared contract 为准。

## Step 1: Resolve Identity（解析身份）

1. 建立唯一 `storyId/storyKey/storyFile/reviewSeries`。
2. CR 目录只消费传入的 `crDir`（来自 `speclite resolve cr-directory`），不重推导；`compatibilityMode=legacy-resume` 时原位收口，不迁移。
3. legacy v1、slug 目录或 superseded series 只作历史 evidence。
4. 由 Finalizer 自身按 shared contract 重算 current scope；runner/manual records 只可作为候选输入。

## Step 2: Validate Current Evaluation（验证 current evaluation）

读取 current series 最大 round 的 `speclite.cr-evaluation.v2`，精确检查：

- Story/series/round 与 current review 一致；
- `reviewSourceHash` 匹配 review 当前内容；
- 独立重算的 current `scopeHash` 与 evaluation 一致；
- verdict 为 `PASS`，或为 `PASS_WITH_DEFERRED_TODOS` 且所有 accepted deferred fingerprints 已映射到 backlog；
- `FIX_REQUIRED`、`VERIFY_REQUIRED`、`ARCHITECTURE_TRIAGE`、`STOP_LOSS`、`DECISION_NEEDED` 一律 HALT；
- 最后 fixRecord 后已有更高 round fresh review/evaluation，且 current evaluation 不带未复验 fixRecord。

## Step 2.5: Validate Closeout Predecessors（验证收口前序产物）

读取 current series/round 的 CR04 与 CR05 durable report，精确检查：

- `speclite.cr-rules-extraction.v2` 存在，storyId/series/round 一致，`evaluationSourceHash` 等于本次所用 evaluation；
- `speclite.cr-todo-result.v2` 存在，storyId/series/round 一致，`evaluationSourceHash` 一致；`PASS_WITH_DEFERRED_TODOS` 时 `mappedFingerprints` 必须覆盖全部 accepted deferred fingerprint；
- 任一报告缺失、identity/hash 不一致，或 standalone 调用下无法定位前序报告时 HALT。

这确保无论 runner 还是人工 standalone，都必须完成 `RULES -> TODO -> FINALIZE`，不能跳过 CR04/CR05。

## Step 3: Validate Completion Gate（验证完成门禁）

验证 current Story completion gate：

- `schemaVersion: speclite.flow-gate-report.v2`；
- mode/target/storyKey 精确匹配；
- result 为 `PASS` 或 `PASS_EQUIVALENT`；
- foundation/closure owner status 合法；
- `generatedAt >= max(review.sourceMutationAt, evaluation.generatedAt, latest fixRecord.sourceMutationAt)`。

gate 缺失、stale 或 target mismatch 时 HALT，并要求 fresh `speclite-flow-gate mode=story-completion`。历史测试计数或“修复方向收紧”不能替代 freshness。

## Step 4: Validate Required Trackers（验证 required trackers）

1. Story 与 `sprint-status.yaml` 始终 required。
2. merged runtime config 声明的 workflow tracker 为 required；仅配置明确 optional 时可跳过。
3. 文件缺失、Story key 不唯一、状态字段无法精确定位时 HALT。
4. 禁止智能猜测位置或只按 story-id 前缀匹配多个条目。

## Step 5: Prepare Fail-closed Change Set（准备 fail-closed 变更集）

写入前展示并记录 Story 状态、sprint key、required workflow key、timestamp fields 和 exact files，并对每个目标 tracker 计算写前内容 hash（`before hash`，按 Hash Canonicalization）。Epic 状态保持不变，除非用户另行授权且 epic-completion gate current。任何目标冲突或超出授权范围时 HALT。

## Step 6: Coordinated Write and Re-read（协调写入并重读）

本步是 fail-closed coordinated write，而非事务级原子写：

1. 按固定顺序 Story -> sprint -> workflow tracker 执行最小状态修改，不改业务代码、测试或需求正文。
2. 每写一个立即重读并核对写后 hash（`after hash`）；不符即停止后续写入。
3. 任一步失败时按逆序用 `before hash` 尝试回退已写文件，并记录回退结果。
4. 只有全部 required tracker 均为 done、key 唯一且写后重读一致时成功。
5. 无法全部成功或回退不确定时记录 partial write（已写/未写/回退/建议 resume 动作），停止后续 Story 并生成 `HALTED` report；不得输出成功。

## Step 7: Write Finalizer Report（写 Finalizer 报告）

1. 一旦 `{crDir}` 已解析，所有 `DONE` 或 `HALTED` 退出均使用 `assets/output-template.md` 写 canonical report。
2. 写 evaluation source/hash/verdict、独立重算 `scopeHash`、completion gate binding、tracker writes/reread 和 result。
3. 写入后重读验证 schema、identity、hash、result 和 canonical filename。
4. 如果 runtime/identity 失败导致 `{crDir}` 尚不可确定，只能返回 non-durable HALT，并明确“未生成 finalizer report”及原因。

## Step 8: Handoff（交接）

将 report path/hash 与 `DONE | HALTED` 返回 `handoffTarget`。全部 Story done 时只提示运行 epic-completion gate；未经授权不更新 Epic。

## Common Mistakes（常见错误）

- 使用 runner 提供的 scope hash 而不独立重算。
- 用 prose “Approved/通过”代替 exact evaluation enum。
- required tracker 缺失时警告后继续，或 partial write 后仍输出 DONE。
- finalizer 完成后自动 commit/push 或自动关闭 Epic。
