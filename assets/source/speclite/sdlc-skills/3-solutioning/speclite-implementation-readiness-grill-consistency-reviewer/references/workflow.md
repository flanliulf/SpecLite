# Workflow（执行工作流）

## Objective（目标）

对 PRD、UX、Architecture、Epics / Stories 进行 implementation-readiness 一致性 grill，将隐性跨文档漂移转成可实现、可验收、可追踪的规划合同。每个 grill question 必须是一个可定位、可修复、可验证的问题。

## Target Documents（目标文档）

优先读取目标项目的 canonical planning artifacts：

- PRD：运行 `speclite resolve artifact-documents --subject prd --project-root {project-root}`，只读取其 `consumedPaths`（whole 为 `{planning_artifacts}/prd/prd.md`，sharded 为同目录 `index.md` 声明的 shards）；`continuation=block` 时 HALT，不得自行择一或混合。
- Architecture：运行 `speclite resolve artifact-documents --subject architecture --project-root {project-root}`，只读取其 `consumedPaths`（whole 为 `{solutioning_artifacts}/architecture/architecture.md`）；existing install 缺 `solutioning_artifacts` 时 resolver 会报告 Planning fallback 与 `legacy-compatible`，不迁移文件。
- UX：通过 Planning root resolver evidence 优先读取 `{planning_artifacts}/ux/ux-design-specification.md`；仅在 canonical 缺失时读取 exact legacy `{planning_artifacts}/ux-design-specification.md`。记录 `resolvedRoot`、`resolutionMode`、`actualConsumedPath`，按需读取同一 UX boundary 内的 direction、wireframe、design-system、screenshot 与 asset outputs；不得迁移 legacy artifact 或读取 project-root 外的 relative reference。
- Epics / Stories：运行 `speclite resolve artifact-documents --subject epics --project-root {project-root}`，只读取其 `consumedPaths`（whole 为 `{planning_artifacts}/epics/epics.md`）；Story 文件位于 `{implementation_artifacts}/stories/`。
- Shared contracts：目标项目的 UX / route contract、requirements inventory、coverage map、StoryGateRule 或等价 normalized gate 文档。
- Gate reports：`implementation-readiness-report-*.md`、`review-gates-report.md`、`spec-consistency-report.md`、`prototype-gate-report.md`、validation report。
- Context docs：`CONTEXT.md`、`CONTEXT-MAP.md` 或其他用户指定的讨论、背景与领域资料。
- Archive：只作历史证据和漂移对照，不得直接当作 current source of truth。

若上述路径不存在，先做 inventory 并在记录中写明 fallback。不得凭固定路径假设文档存在。

## Built-in Grilling Protocol（内建追问协议，源自 grill-with-docs 方法）

本 Skill 内建以下追问规则（源自 grill-with-docs 方法，不依赖 `speclite-grill-with-docs` Skill），执行时按本节自包含协议推进：

1. Relentless interview：围绕规划方案的每个方面持续追问，直到 PRD、UX、Architecture、Epics / Stories 的边界能共同解释。
2. Design tree walk：沿设计树逐分支检查，并一次解决一个依赖决策，不跳过前置未闭合问题。
3. One question at a time：每次只提出一个 grill question，并给出 recommended decision。若用户已授权执行，可按推荐决策修订；若需要真实业务判断，则 HALT。
4. Evidence before asking：凡能通过读取文档、代码、配置或历史记录回答的问题，先探索证据，不把可查问题抛给用户。
5. Domain awareness：探索时同时寻找 `CONTEXT.md`、`CONTEXT-MAP.md`、ADR、planning index、gate report 和历史记录，明确 single-context 或 multi-context 结构。
6. Glossary challenge：当用户或文档用词与 glossary / canonical term 冲突时，立即标出冲突并要求统一术语。
7. Fuzzy language sharpening：遇到模糊或重载词，提出精确 canonical term，并把最终术语写回 glossary、requirements inventory 或对应 planning artifact。
8. Concrete scenarios：用具体边界场景压测领域关系、状态迁移、权限、异常、发布 gate 和实现 handoff。
9. Code/document cross-reference：当文档声称某行为已存在或某路径可行时，检查代码、schema、fixture、route 或配置是否一致；发现冲突时记录为 grill issue。
10. Inline documentation update：决策一旦清晰，立即更新相关 planning artifact 或记录文件；不要把已确认的术语、边界和 gate 批量拖到最后。
11. Context creation laziness：只有当目标项目缺少 context 文档且本轮确实解决了领域术语时，才创建或更新 `CONTEXT.md`；不得为了形式创建空文档。
12. ADR sparingly：只有同时满足 hard to reverse、surprising without context、real trade-off 三个条件时，才建议 ADR；普通 planning contract 修订只写入对应规划文档。

## Related Skills（协作 Skill）

- Optional workflow support：`speclite-implementation-readiness-check` 用于 readiness discovery 或报告复核。
- Optional review support：`speclite-review-adversarial-general`、`speclite-review-edge-case-hunter` 用于扩展批判性发现和边界路径。
- Optional gate support：`speclite-flow-gate` 用于 Story / Epic 状态推进前的 Contract -> Functional -> Evidence 检查。
- Optional docs support：`speclite-index-docs` 用于 shard 或目录索引变化后的 index 同步。

如果这些 Skill 未安装，继续执行本 Skill 的本地文档审查流程，并在记录中说明 fallback。

## Output Directories（输出目录）

在创建 `summary.md`、round directory 或任何 progress/record 前，必须运行：

```bash
speclite resolve artifact-roots --project-root {project-root}
```

只消费 resolver 返回的 `solutioning_artifacts.resolvedRoot`，并保留对应
`resolutionMode` 与 provenance evidence。`explicit-config` 和
`legacy-compatible` 都使用该 resolved root；Skill 不得自行拼接 fresh default、
Planning fallback 或第三输出根。若 resolver non-zero、返回 block/error、缺少有效
`solutioning_artifacts.resolvedRoot` 或该 root 无法安全访问，必须 HALT，并保持
zero artifact write 与 zero progress mutation。

输出目录固定为 resolver-provided root 下的 child：

```text
{solutioning_artifacts}/implementation-readiness-report/grill-consistency/
    summary.md
    goal-execute-records/
        round-N/
            PLAN.md
            EXPERIMENTS.md
            EXPERIMENT_NOTES.md
```

已有 `{planning_artifacts}/ir-grill/` 只作为 legacy historical evidence 原位读取；
不得迁移、重命名、删除，且不得把新的 round 写回该旧目录。

过程分析或临时测试建议可写入：

```text
.specskills/docs/analysis/speclite-implementation-readiness-grill-consistency-reviewer/
```

## Round Setup（轮次启动）

1. 找到已有 `round-N` 目录，选择下一个未使用编号；不得覆盖已有 round。
2. 创建本轮 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
3. 读取已有 summary 和所有 prior round 的 `PLAN.md` / `EXPERIMENT_NOTES.md`，列出 Avoided Prior Coverage。
4. 设定本轮 `Target: 50`。用户显式指定时可改成其他数量，但必须写入 `PLAN.md`。
5. 声明本轮 Target Dimensions；不得重复上一轮已经 fully closed 的主题，除非是 regression verification。

## Grill Loop（单题循环）

每个 question 固定执行：

1. Evidence Scan：用 `rg`、目录索引、YAML parse 或人工阅读定位证据。若问题可由文档或代码回答，先探索，不直接问用户。
2. Grill Question：提出一个具体问题，必须说明风险和涉及文档。
3. Recommended Decision：给出推荐答案，并说明为什么是最小可行修复。
4. Apply Decision：若用户授权执行，按推荐决策只修改当前问题直接相关的文档锚点；若用户要求只读，则跳过修改。
5. Verification：执行最小验证，例如 `rg` 锚点、`git diff --check -- <paths>`、YAML parse、experiment count。
6. Record：在 `EXPERIMENTS.md` 追加完整记录，在 `EXPERIMENT_NOTES.md` 更新摘要。

不得并行处理多个 question。不得把多个问题合并为一个 experiment。不得在当前 question 中顺手重构无关文档。

## Decision Rules（决策规则）

- 已有文档证据足够时，由 agent 自行采用推荐决策。
- 用户明确授权“按建议执行”时，推荐决策视为已接受。
- 如果需要真实业务取舍、法律/合规承诺、商业策略、无法从 canonical docs 判断的产品边界，必须 HALT。
- 如果发现两个 canonical source 互相冲突且无法判断优先级，必须 HALT，并在 `EXPERIMENTS.md` 标记 `Status: blocked`。
- ADR 只在 hard to reverse、surprising without context、real trade-off 同时成立时建议；普通 planning contract 修订不创建 ADR。

## Verification Gates（验证门）

每题至少有一个证据验证。每轮结束必须执行：

```bash
rg -n "^### Experiment" <round-dir>/EXPERIMENTS.md
git diff --check -- <changed-planning-artifacts>
```

修改 YAML 时执行可用 parse check，例如：

```bash
python3 - <<'PY'
import sys, yaml
for path in sys.argv[1:]:
    with open(path, "r", encoding="utf-8") as f:
        yaml.safe_load(f)
PY <yaml-path>
```

若本地没有 `yaml` 模块，可改用项目已有 parser 或记录 parser unavailable。

## Exit Conditions（退出条件）

每轮结束后判断状态：

### COMPLETE

满足全部条件才可结束整个 grill：

- 当前轮 50 个 question 完整记录，或用户显式设置的 question count 完整记录。
- Mandatory dimensions 已覆盖：source of truth、traceability、terminology、UX contract、API schema、state lifecycle、evidence gate、runtime ownership、security / privacy、QA fixture、implementation handoff。
- 最近一轮没有 open P0 / P1 blocker。
- 所有新合同已接入至少一个 source、owner、consumer、evidence 或 gate；高风险合同已接入多个入口。
- `summary.md` 或 final handoff 已更新，说明最新 gate、open exclusions 和 downstream consumption boundary。
- `git diff --check`、YAML parse、count check 均通过或有明确 non-blocking 说明。

### CONTINUE

出现任一情况应继续下一轮：

- 新问题密度仍高：最近 50 题中超过 10 题需要真实文档修订。
- 任一 mandatory dimension 尚未覆盖。
- 新增合同未同步到 consuming Story / readiness / index / gate。
- 最近一轮暴露出新的问题类别，尚未做同类横向扫描。

### BLOCKED

出现任一情况应停止并请用户决策：

- canonical source 冲突无法从证据裁决。
- 推荐修复涉及产品范围、法律/合规、商业策略或发布承诺。
- 需要修改用户未授权的文件或非 planning artifact。
- 验证工具缺失导致关键结构无法确认，且没有等价验证路径。

## Final Handoff（最终交接）

完成时必须更新或生成 `summary.md`，至少包含：

- 轮次范围和 question count。
- 审查维度覆盖。
- 发现问题分类与高频模式。
- 已修复合同与 remaining exclusions。
- Downstream handoff：Story Review、Sprint Planning、QA guide、Dev Story 需要读取哪些 source refs。
- Exit status：`COMPLETE`、`CONTINUE` 或 `BLOCKED`。

输出文档末尾追加：

```text
---

*本文档由 speclite-implementation-readiness-grill-consistency-reviewer Skill 自动生成*
```

## Version（版本）

- v1.0.0 - 2026-07-04：初始工作流。
