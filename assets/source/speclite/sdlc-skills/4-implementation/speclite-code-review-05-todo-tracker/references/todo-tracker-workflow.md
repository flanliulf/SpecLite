# TODO Tracker Workflow v2（TODO 追踪工作流 v2）

本文档承载 CR05 的详细模式流程。共享 TODO eligibility、execution context、Story closeout path 和 result schema 以 CR shared contract 为准。

## Common Preflight（共同预检）

1. 解析 runtime config、backlog path、Story/TODO identity 和 `mode`。
2. `confirmationPolicy` 缺失时固定为 `explicit`。
3. `preauthorized` 时验证 `authorizationSource` 指向 runner goal record、人工 orchestrator record 或当前用户明确授权。
4. Story closeout 绑定 current evaluation source/hash、series 和 round，CR 目录只消费传入的 `crDir`（来自 `speclite resolve cr-directory`），不重推导；project utility 使用 `operationScope: project`。

## Mode A: Add（添加）

1. 只读取 current `speclite.cr-evaluation.v2` 的 Deferred TODO Candidates。
2. 只有 `PASS_WITH_DEFERRED_TODOS` 或用户显式 add 请求时允许继续。
3. 排除 P0/P1、`VERIFY_REQUIRED`、dismissed、superseded 和无 fingerprint 项。
4. explicit policy 展示候选并等待确认；preauthorized 只能接受授权范围内候选。
5. 按最大编号 + 1 分配 ID，使用 T1/T2/T3 urgency 和模板字段。
6. 写入 Open Items、更新统计并重读验证。

## Mode B: Check（检查）

1. 从 Story File List 或用户指定路径建立 `checkPaths`。
2. 对 open/in-progress 的涉及文件和建议时机执行路径匹配。
3. T1 明确提示“下次触及前必须处理，但不反向改变原 CR verdict”。

## Mode C: Resolve（解决）

1. 接收 TODO ID、解决 Story 和 commit/PR evidence。
2. 将 open/in-progress 改为 resolved，填写解决记录。
3. 移入 Resolved Items，更新统计并重读验证。

## Mode D: List（查看）

按 T1/T2/T3 展示 open/in-progress 条目和 open/in-progress/resolved 统计。只读操作，不修改 backlog，默认只返回结果、不写 durable result（仅用户显式要求留档时才写 utility result）。

## Mode E: Extract（批量提取）

1. 收集指定 Story eligible v2 evaluations。
2. 对 deferred fingerprints 跨文件去重。
3. 合并确认后复用 Mode A 的编号、写入和重读步骤。

## Mode F: Closeout（收口）

1. 仅由 runner Step 10.2 / 人工编排以 `mode=closeout` 调用，绑定 current evaluation source/hash/series/round。
2. 读取 current `speclite.cr-evaluation.v2` 的 verdict 分流：
   - `PASS`：不写 backlog，直接产出 `result: COMPLETED`、`mappedFingerprints: []` 的 durable result（零 backlog mutation）。
   - `PASS_WITH_DEFERRED_TODOS`：复用 Mode A 的候选筛选/编号/写入/重读，将全部 accepted deferred fingerprints 映射进 backlog。
   - 其它 verdict：HALT（closeout 只接受可收口 verdict）。
3. 两分支都必须写 durable result 并返回 `handoffTarget`。

## Write Durable Result（写 Durable Result）

本节仅适用于变更/收口操作（`closeout`/`add`/`resolve`/`extract`）；只读 `list`/`check` 默认跳过，除非用户显式要求留档。

1. Story closeout 使用 shared contract 的 `{crDir}/{storyId}-cr-todo-result-...` path。
2. 无 Story identity 的 project utility 使用 `{implementation_artifacts}/cr-rules/todo-results/cr-todo-result-{YYYYMMDDTHHmmss}-{mode}.md`。
3. 使用 `assets/output-template.md` 的 TODO Result 模板写 `speclite.cr-todo-result.v2`；project utility 的 Story/series/round/evaluation fields 使用 `null`，并写 `operationScope: project`。
4. 写入后重读验证 result schema、mapped fingerprints、backlog hash 和 canonical/utility filename。
5. 返回 result path/hash 与 `COMPLETED | HALTED` 给 `handoffTarget`。

## Common Mistakes（常见错误）

- 把 P0/P1 或 verify obligation 塞入 backlog。
- 把 `preauthorized` 错误解释为“必须来自 runner”。
- 重用 resolved 编号，或 backlog mutation 后不重读统计。
- 完成 Story closeout 却只返回聊天文本，不写 durable result。
