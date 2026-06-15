# Story 8-5 CR Rules Extraction

## Executive Summary（执行摘要）

- **Story**: `8-5-resolve-command-support-output`
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Execution Mode**: record-only in Story code-review directory
- **Output Boundary**: 仅记录本 Story 规则提取结果；不修改 source/test/story/sprint status/progress files，不更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，不更新全局/项目级规则文档。

本次 CR 历史包含 2 轮 review/evaluation。Round 1 发现 1 个有效 `patch` finding：explicit `--human` Summary 将单数 `source path` 显示为候选首层，而不是 selected dotted key 的真实 effective source。Round 1 evaluation 将其确认为 P1 阻塞修复；fixer 已通过 `ResolverResult.sources` 携带 selected key effective source metadata 并更新 human output/test/docs。Round 2 review/evaluation 确认该问题已修复，新 findings 为 0，CR TODO 为 0。

结论：提取 1 条候选规则，但它不满足全局/项目级规则晋升阈值。该问题目前是 Story 8-5 单次候选，且现有规则 `CR-API-19` 与 `docs/reference/cli.md` 已覆盖相近的 resolver/public output 边界；本次只在本文件记录 candidate，不更新全局/项目级规则文档，不交给 05 TODO Tracker。

## Analysis Sources（分析来源）

- `8-5-code-review-summary-20260616-round-1.md`
- `8-5-code-review-evaluation-20260616-round-1.md`
- `8-5-code-review-summary-20260616-round-2.md`
- `8-5-code-review-evaluation-20260616-round-2.md`

## Model Timeline（模型时间线）

| 文件 | 角色 | Model Used |
|------|------|------------|
| `8-5-code-review-summary-20260616-round-1.md` | CR reviewer / Round 1 | GPT-5 Codex (gpt-5-codex) |
| `8-5-code-review-evaluation-20260616-round-1.md` | CR evaluator + fixer record / Round 1 | GPT-5 Codex (gpt-5-codex) |
| `8-5-code-review-summary-20260616-round-2.md` | CR reviewer / Round 2 | GPT-5 Codex (gpt-5-codex) |
| `8-5-code-review-evaluation-20260616-round-2.md` | CR evaluator / Round 2 | GPT-5 Codex (gpt-5-codex) |

## Findings Analysis（发现分析）

| 轮次 | findings | 来源分布 | 分类分布 | 修复状态 |
|------|----------|----------|----------|----------|
| Round 1 | 1 | `auditor+edge`: 1 | `patch`: 1 | confirmed valid，P1 阻塞，已进入 fixer |
| Round 2 | 0 | 无 | `decision_needed: 0`, `patch: 0`, `defer: 0` | Approved，无新增 CR TODO |

### Common Pattern（共性模式）

当 resolver 支持多层覆盖时，presentation layer 如果只持有候选路径列表，很容易把候选首层当作 selected key 的精确来源输出。这个输出在用户可见 human support frame 中会产生误导：字段名是单数 `source path`，但值实际只是候选首层，而非 selected dotted key 的 effective source。

该模式在 Story 8-5 中同时覆盖 `resolve config` 与 `resolve customization` 两个子命令；但从 CR 历史看，它只在本 Story 中作为单个 finding 出现，Round 2 已确认关闭。

## Extracted Candidate Rule（提取候选规则）

### CAND-CR-API-8-5-01：Resolve human output 的单数 `source path` 必须来自 selected key effective source metadata

- **来源问题**: explicit `--human` Summary 中的 `source path` 被渲染为候选首层路径，导致后续 layer 覆盖 base value 时，human output 指向错误文件。
- **CR 证据**:
  - `8-5-code-review-summary-20260616-round-1.md`: Finding #1 指出 `src/commands/resolve.ts` 使用固定 `sourcePaths` 首项渲染 `source path`，在 `core.project_name` 被 `_speclite/config.user.toml` 覆盖时仍输出 `_speclite/config.toml`。
  - `8-5-code-review-evaluation-20260616-round-1.md`: evaluator 确认该 finding 有效并提升为 P1，建议携带 selected dotted key 的 effective source metadata；若不能提供精确来源，则不得用单数 `source path` 伪装精确来源。
  - `8-5-code-review-evaluation-20260616-round-1.md`: fixer record 显示 `ResolverResult.sources` 已携带 selected dotted key effective source metadata，explicit `--human` 输出改为从 metadata 渲染 `source path`。
  - `8-5-code-review-summary-20260616-round-2.md` 与 `8-5-code-review-evaluation-20260616-round-2.md`: reviewer/evaluator 均确认 Round 1 finding 已修复，`core.project_name` 与 `workflow.on_complete` 覆盖场景均显示 user layer effective source。

### Promotion Decision（升格判定）

| 硬性门槛 | 判定 | 理由 |
|----------|------|------|
| 有证据 | 是 | 4 个 CR/evaluation/fix record 文件均可追溯该问题和修复闭环。 |
| 可规则化 | 是 | 可写成“单数来源字段必须来自 effective metadata；否则必须改名为 checked paths 等非精确语义”。 |
| 非纯特例 | 是 | 适用于 layered resolver 的 selected-key source projection，不只绑定单个文件。 |
| 不重复 | 部分通过 | 现有 `CR-API-19` 已覆盖“config/customization 派生 public output 字段必须复用 shared resolver”的相近规则；`docs/reference/cli.md` 已说明 `source path` 表示 selected dotted key 的 effective source。 |
| 状态明确 | 是 | Round 2 已确认修复；CR TODO 为 0。 |

硬性门槛结论：不建议晋升为新的全局/项目级规则。主要原因是复现频次不足且已有相近规则/文档覆盖；本条保留为 Story 8-5 candidate。

| 维度 | 分数 | 理由 |
|------|------|------|
| 复现频次 | 0 | 该精确问题只在 Story 8-5 Round 1 出现；Round 2 已关闭，尚未跨 Story 复现。 |
| 影响范围 | 1 | 影响 `resolve config` 与 `resolve customization` human support output，属于 resolver support command 技术域。 |
| 风险等级 | 1 | 会造成验收标准中的来源信息错误并误导人工排查，但不涉及写入、安全或数据损坏。 |
| 根因稳定性 | 1 | 根因是 presentation layer 用候选列表替代 effective metadata，属于可复现的实现习惯。 |
| 可执行性 | 2 | 可用 `ResolverResult.sources`、selected-key `affectedPath`、human output focused tests 和 machine mode non-leak tests 检查。 |
| 文档缺口 | 0 | `docs/reference/cli.md` 已说明 `source path` 是 selected dotted key 的 effective source；现有 `CR-API-19` 已有相近 resolver/public output 规则。 |

- **总分**: 5/12
- **建议去向**: candidate-only
- **是否需要用户确认**: 若后续要把该候选写入 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 或全局文档，需要用户另行确认。
- **全局文档建议**: 不更新。未达到 `>= 8/12` 的全局文档规则阈值；且文档/规则已有相近覆盖。
- **适用范围**: `speclite resolve config/customization --human`，以及后续任何 layered resolver 把 selected key/source 信息投影为单数 human output 字段的场景。
- **规避指南**:
  - 不得把候选路径列表的首项渲染为单数 `source path`、`source file` 或其他暗示精确来源的字段。
  - 如果 resolver 当前没有 selected key effective source metadata，human output 必须改用 `source paths checked` 等非精确语义，并同步 SPEC/AC。
- **最佳实践**:
  - resolver result 应携带 selected dotted key 的 effective source metadata。
  - human output 的单数来源字段必须读取 effective metadata；missing/unresolved/multi-key 场景应输出稳定 sentinel，例如 `none` 或 `multiple`。
  - focused tests 应覆盖后续 layer 覆盖 base value 的 config/customization 场景，并断言默认 machine mode 不泄露 `sources` metadata。
- **本次落地**:
  - 已由 Round 1 fixer 修复，Round 2 reviewer/evaluator 确认关闭。
- **同步状态**: candidate recorded only in Story 8-5 code-review directory。

## Global Update Assessment（全局更新评估）

- **是否更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`**: 否。
- **是否更新 `CONTEXT.md` / `_bmad-output/project-context.md` / `docs/reference/cli.md` / architecture docs**: 否。
- **不更新原因**:
  - promotion score 为 5/12，低于全局文档规则阈值。
  - 精确问题尚未跨 Story 复现。
  - 现有 `CR-API-19` 已覆盖相近的 shared resolver/public output 接入规则。
  - `docs/reference/cli.md` 已记录 `source path` 表示 selected dotted key effective source。
  - 用户本轮约束要求只有 promotion rules 明确满足时才更新项目级规则文档；本条不满足。

## TODO Tracker Handoff（TODO Tracker 交接）

无需交给 05 TODO Tracker。

- Round 1 evaluation 明确 CR TODO 数量为 0。
- Round 2 reviewer/evaluator 均确认无新增 CR TODO。
- 本候选规则对应问题已修复，不是未完成的非阻塞改进项。
