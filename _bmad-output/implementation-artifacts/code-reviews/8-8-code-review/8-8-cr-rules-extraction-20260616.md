# CR Rules Extraction（CR 规则提取）

## Metadata（元信息）

- Story: `8-8`
- Date: `2026-06-16`
- Mode: `analysis-only` with Story-level trace record
- Scope: only Story 8.8 CR summary / evaluation / fix records under `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/`
- Output: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-cr-rules-extraction-20260616.md`
- Global document changes: none
- Source code changes: none
- Parent orchestrator log changes: none

## Inputs（输入记录）

本次仅分析以下 CR 产物：

- `8-8-code-review-summary-20260616-round-1.md`
- `8-8-code-review-evaluation-20260616-round-1.md`
- `8-8-code-review-summary-20260616-round-2.md`
- `8-8-code-review-evaluation-20260616-round-2.md`

未分析或修改 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`、全局文档、`cr-rules-summary.md`、`cr-todo-backlog.md` 或源码。

## Model Timeline（模型时间线）

| 阶段 | 文件 | Model Used | 角色 |
| --- | --- | --- | --- |
| Round 1 review | `8-8-code-review-summary-20260616-round-1.md` | `GPT-5 Codex (codex)` | 首轮三层 CR 审查 |
| Round 1 evaluation | `8-8-code-review-evaluation-20260616-round-1.md` | `GPT-5 Codex (codex)` | findings 有效性评估 |
| Round 1 fix record | `8-8-code-review-evaluation-20260616-round-1.md` / `## 修复执行记录` | `GPT-5 Codex (codex)` | 两个阻塞项修复记录 |
| Round 2 review | `8-8-code-review-summary-20260616-round-2.md` | `GPT-5 Codex (codex)` | 复审 |
| Round 2 evaluation | `8-8-code-review-evaluation-20260616-round-2.md` | `GPT-5 Codex (codex)` | 复审结论评估 |

## Findings Analysis（发现分析）

| Finding | 来源 | 分类 | 状态 | 复审结论 |
| --- | --- | --- | --- | --- |
| 跨目录相对 target 的 human Next Actions 退化为 basename | `edge+auditor` | `patch` | 已修复 | Round 2 确认 `../noi` 不再退化为 `noi`，JSON 不泄漏 resolved absolute target |
| shared frame 把非 issue 的写入空态放进 Issues section | `blind+auditor` | `patch` | 已修复 | Round 2 确认 install no-issue 的 `Issues` section 只输出 `- 无问题` |

统计：

- Round 1 findings: 2
- Round 2 new findings: 0
- `patch`: 2
- `decision_needed`: 0
- `defer`: 0
- confirmed false positive: 0
- CR TODO: 0
- 修复引入新问题: 未发现

## Candidate Rules（候选规则）

### R1：可复制的 human Next Actions 不应复用面向展示或脱敏的 target 名称

**规则表述**：当 CLI human output 输出可复制执行的命令时，命令参数必须来自 command-safe presentation context，而不是来自可能被 basename 化、脱敏或重写的 display path。绝对 target 可以使用 resolved absolute path；相对 target 应保留从原 `commandCwd` 可直接执行的 raw relative target；JSON 输出仍不得泄漏本机绝对路径。

**证据**：

- Round 1 review 发现 `../noi` 被 `displayPath` 折叠为 `noi`，导致 human Next Actions 可能安装到错误目录。
- Round 1 evaluation 确认该 finding 有效并列为 P1。
- Round 1 fix record 记录修复：绝对 target 使用 resolved `targetRoot`，非空相对 target 保留原始命令参数作为 `pathSafeTarget`。
- Round 2 review / evaluation 确认 regression 覆盖 `../noi`，且 JSON 未泄漏 resolved absolute target。

**硬性门槛**：

| 门槛 | 结果 | 说明 |
| --- | --- | --- |
| 有证据 | 通过 | 有 Round 1 finding、evaluation、fix record 和 Round 2 verification |
| 可规则化 | 通过 | 可写成 command-safe target 与 display target 分离的行为约束 |
| 非纯特例 | 部分通过 | 可泛化到 CLI human output，但当前证据只来自 Story 8.8 install 场景 |
| 不重复 | 未验证 | 本次按用户要求未扫描全局文档，因此不提出全局文档更新 |
| 状态明确 | 通过 | 已修复，未产生未解决 TODO |

**评分**：

| 维度 | 分数 | 理由 |
| --- | --- | --- |
| 复现频次 | 0 | 仅在 Story 8.8 的 Round 1 发现，Round 2 已修复，未见跨 Story 复现 |
| 影响范围 | 0 | 证据落在 install human output；其他命令仅为潜在适用，不作为本次证据扩展 |
| 风险等级 | 1 | 用户复制命令时可能指向错误 target，属于兼容性 / 操作风险 |
| 根因稳定性 | 1 | 根因是将 display path 复用于 executable command preview 的实现习惯 |
| 可执行性 | 2 | 可用 focused regression 覆盖 absolute target、`../noi` 和 JSON 不泄漏 |
| 文档缺口 | 0 | 本次未扫描全局文档；Story 8.8 docs matrix 已覆盖该场景 |
| 总分 | 4 | 低于沉淀阈值 |

**建议去向**：不沉淀到全局文档或 `cr-rules-summary.md`。本 Story 级记录已满足追溯；后续若同类问题在其他 Story 复现，再考虑升级为 CR reusable rule。

**是否需要用户确认**：不需要。本次不执行全局更新。

**是否需要 05 TODO Tracker**：不需要。问题已修复且无延后项。

### R2：`Issues` section 只承载真实问题或 issue-owned empty state

**规则表述**：human output 的 `Issues` section 应只包含真实 issue，或在无 issue 时输出 `- 无问题`。写入状态、计划状态、checked item 空态等非 issue 信息应留在其所属 section 或 Summary 中，避免削弱 `Issues` 的扫描语义。

**证据**：

- Round 1 review 发现 `未写入项目文件` 被合并进 `Issues` section。
- Round 1 evaluation 确认该 finding 有效并列为 P1。
- Round 1 fix record 记录修复：shared frame fallback 只输出真实 issue 或 `- 无问题`，过滤非 issue 空态。
- Round 2 review / evaluation 确认 no-issue section 精确为 `Issues（问题）\n- 无问题`。

**硬性门槛**：

| 门槛 | 结果 | 说明 |
| --- | --- | --- |
| 有证据 | 通过 | 有 Round 1 finding、evaluation、fix record 和 Round 2 verification |
| 可规则化 | 通过 | 可写成 `Issues` section ownership 约束 |
| 非纯特例 | 部分通过 | 可泛化到 shared human frame，但当前证据来自 install no-issue 场景 |
| 不重复 | 未验证 | 本次按用户要求未扫描全局文档，因此不提出全局文档更新 |
| 状态明确 | 通过 | 已修复，未产生未解决 TODO |

**评分**：

| 维度 | 分数 | 理由 |
| --- | --- | --- |
| 复现频次 | 0 | 仅在 Story 8.8 Round 1 出现，Round 2 已修复 |
| 影响范围 | 1 | 涉及 shared human frame 的信息架构，但证据仍来自 install 输出 |
| 风险等级 | 0 | 主要影响可读性和扫描语义，不改变执行结果 |
| 根因稳定性 | 1 | 根因是 shared fallback 把不同 ownership 的 empty state 合并处理 |
| 可执行性 | 2 | 可通过精确 section regression 覆盖 |
| 文档缺口 | 0 | 本次未扫描全局文档；Story 8.8 docs matrix 已覆盖 empty state ownership |
| 总分 | 4 | 低于沉淀阈值 |

**建议去向**：不沉淀到全局文档或 `cr-rules-summary.md`。本 Story 级记录保留经验即可。

**是否需要用户确认**：不需要。本次不执行全局更新。

**是否需要 05 TODO Tracker**：不需要。问题已修复且无延后项。

## Promotion Decision（升格判定）

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 是否需要沉淀 | 是否需要 05 TODO Tracker |
| --- | --- | ---: | --- | --- | --- |
| R1：可复制的 human Next Actions 不应复用面向展示或脱敏的 target 名称 | 部分通过，因全局重复性未扫描而不建议升格 | 4 | 不沉淀；保留 Story 级记录 | 否 | 否 |
| R2：`Issues` section 只承载真实问题或 issue-owned empty state | 部分通过，因全局重复性未扫描而不建议升格 | 4 | 不沉淀；保留 Story 级记录 | 否 | 否 |

结论：

- 无需全局规则更新 / 无需 TODO backlog。
- 不修改 `project-context.md`、architecture 文档、`CLAUDE.md`、`cr-rules-summary.md` 或源码。
- 当前两个候选项均已在 Story 8.8 修复和 regression 中闭环，暂不需要 05 TODO Tracker。

## Final Result（最终结果）

本次 `bmenhance-cr-04-rules-extractor` 执行为 Story 级 analysis-only 记录。已完成候选规则提炼、评分和升格判定；未执行全局文档更新，未写入 `cr-rules-summary.md`，未创建 TODO backlog。
