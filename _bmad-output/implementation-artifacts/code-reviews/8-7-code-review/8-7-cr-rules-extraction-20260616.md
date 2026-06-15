# Story 8-7 CR Rules Extraction

## Executive Summary（执行摘要）

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Execution Mode**: story-local rules extraction in Story code-review directory
- **Output Boundary**: 仅记录本 Story 规则提取结果；不修改 source/test/story/sprint status/progress files，不 stage、commit、push；本次不更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，不更新全局/项目级规则文档。

本次 CR 历史包含 2 轮 review/evaluation。Round 1 发现 1 个有效 `patch` finding：`docs/reference/cli.md` 的 option 表把 `--locale <locale>` 错列到不支持的 `init/list`，同时漏列真实支持该 option 的 `status/validate`。Round 1 evaluation 将该问题确认为 P1 阻塞修复项；fixer 已修正文档 option 表，并新增 `test/docs-reference-cli-options.test.ts`，用 focused parity test 对 `docs/reference/cli.md` option 表和 `createSpecliteProgram()` 生成的 CLI help option surface 做 exact sorted equality 比对。Round 2 review/evaluation 确认问题已修复，新 findings 为 0，CR TODO 为 0。

结论：提取 1 条候选规则。它应作为候选规则记录：`docs/reference/cli.md` 等 public CLI reference 的 option 表必须通过 focused parity test 与真实 CLI help surface 对齐。该规则有明确 CR 证据、可规则化且已解决，但目前只在单个 Story 中出现，风险主要是文档契约和可复制命令误导，不满足本轮“明确升格项目级规则”的保守门槛。本次只写入 Story-local 提取总结，不更新正式 CR rules summary 或全局/项目级规则文档。

## Analysis Sources（分析来源）

- `8-7-code-review-summary-20260616-round-1.md`
- `8-7-code-review-evaluation-20260616-round-1.md`
- `8-7-code-review-summary-20260616-round-2.md`
- `8-7-code-review-evaluation-20260616-round-2.md`

## Model Timeline（模型时间线）

| 文件 | 角色 | Model Used |
|------|------|------------|
| `8-7-code-review-summary-20260616-round-1.md` | CR reviewer / Round 1 | GPT-5 Codex (gpt-5) |
| `8-7-code-review-evaluation-20260616-round-1.md` | CR evaluator + fixer record / Round 1 | GPT-5 Codex (gpt-5) |
| `8-7-code-review-summary-20260616-round-2.md` | CR reviewer / Round 2 | GPT-5 Codex (gpt-5) |
| `8-7-code-review-evaluation-20260616-round-2.md` | CR evaluator / Round 2 | GPT-5 Codex (gpt-5) |

## Findings Analysis（发现分析）

| 轮次 | findings | 来源分布 | 分类分布 | 修复状态 |
|------|----------|----------|----------|----------|
| Round 1 | 1 | `auditor+edge`: 1 | `patch`: 1 | confirmed valid，P1 阻塞，已进入 fixer |
| Round 2 | 0 | 无 | `decision_needed: 0`, `patch: 0`, `defer: 0`, `dismiss: 0` | Approved，无新增 CR TODO |

### Common Pattern（共性模式）

Public CLI reference 容易把 command option 表当作静态手写文档维护，但真实 source of truth 是 CLI command registration 和 help surface。Story 8-7 的 Round 1 问题同时出现了两类漂移：把 `--locale <locale>` 写到不支持的 `init/list`，以及从真实支持的 `status/validate` 漏列。该漂移会让用户复制不可用命令，也会削弱 read-only、validation 和 localized human output 文档可信度。

该问题的可靠收口方式不是只改当前表格，而是补 focused parity test：解析 `docs/reference/cli.md` 中对应 command 的 option 表，并与 `createSpecliteProgram()` 生成的 command help option surface 做 exact sorted equality。Round 2 已确认该测试能覆盖本次错列和漏列回归。

## Extracted Candidate Rule（提取候选规则）

### CAND-CR-DOC-8-7-01：CLI reference option 表必须通过 focused parity test 与 command help surface 对齐

- **来源问题**: `docs/reference/cli.md` 中 `Init Options` / `List Options` 错列不支持的 `--locale <locale>`，同时 `Status Options` / `Validate Options` 漏列真实支持的 `--locale <locale>`，导致 public CLI reference 与真实 CLI behavior/help surface 不一致。
- **CR 证据**:
  - `8-7-code-review-summary-20260616-round-1.md`: Finding #1 指出 `docs/reference/cli.md` 把 `--locale` 记录到不支持的 `init/list`，并漏列真实支持的 `status/validate`；定向 CLI smoke 复现 `init/list --locale` 均返回 `unknown option '--locale'`。
  - `8-7-code-review-evaluation-20260616-round-1.md`: evaluator 确认该 finding 有效、非误报，违反 Story 8.7 AC4，需修复后复审；并建议补 focused docs/reference option parity test。
  - `8-7-code-review-evaluation-20260616-round-1.md`: fixer record 显示已修正 `docs/reference/cli.md`，并新增 `test/docs-reference-cli-options.test.ts`，解析文档 option 表并与 `createSpecliteProgram()` 的 CLI help option surface 比对。
  - `8-7-code-review-summary-20260616-round-2.md` 与 `8-7-code-review-evaluation-20260616-round-2.md`: reviewer/evaluator 均确认 Round 1 finding 已修复，`init/list/status/validate` 的 documented options 与 CLI help option surface 已对齐，focused parity test、matrix focused test、build、full test 和 release packaging check 均通过。

### Promotion Decision（升格判定）

| 硬性门槛 | 判定 | 理由 |
|----------|------|------|
| 有证据 | 是 | 4 个 CR summary/evaluation/fix record 文件均可追溯该问题、修复和复审关闭结果。 |
| 可规则化 | 是 | 可写成“public CLI reference option 表必须与 command help option surface 对齐，并由 focused parity test 保护”的明确行为约束。 |
| 非纯特例 | 是 | 适用于 public CLI reference option 表、command registration、help surface 和 docs parity tests，不只绑定 `--locale`。 |
| 不重复 | 是 | 现有 Story AC4 与 Epic 8 要求 docs 示例匹配实际 renderer，但未沉淀到 CR rules 或项目级规则中的“option 表与 help surface exact parity test”检查点。 |
| 状态明确 | 是 | Round 2 reviewer/evaluator 均确认修复关闭，findings 0，CR TODO 0。 |

硬性门槛结论：通过，可作为候选规则记录；但本轮不建议直接升格为全局/项目级规则，原因是复现证据仍集中在单个 Story，且影响主要局限于 CLI reference option 表维护流程。

| 维度 | 分数 | 理由 |
|------|------|------|
| 复现频次 | 0 | 该精确问题只在 Story 8-7 Round 1 出现；Round 2 已关闭，尚未跨 Story 或多轮重复复现。 |
| 影响范围 | 1 | 影响 public CLI reference、CLI command help surface、docs focused tests 和用户可复制命令。 |
| 风险等级 | 1 | 会让用户复制不可用命令并漏掉真实能力，违反 AC4，但不改变 runtime behavior、JSON schema 或写入安全边界。 |
| 根因稳定性 | 1 | 根因是手写 docs option 表与 command registration/help surface 漂移，属于后续 CLI option 增改时可能复现的实现/文档维护习惯。 |
| 可执行性 | 2 | 可通过 focused parity test 对 documented options 与 `createSpecliteProgram()` help output 做 exact sorted equality，比人工审阅更可检查。 |
| 文档缺口 | 2 | 当前全局/project context 与 CR rules summary 未覆盖该具体检查点；现有 AC4 是 Story 级通用要求。 |

- **总分**: 7/12
- **建议去向**: story-local candidate；若用户后续确认正式沉淀，可进入 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，暂不进入全局/项目级规则文档。
- **是否需要用户确认**: 是。若要写入正式 `cr-rules-summary.md` 或 `_bmad-output/project-context.md`，需要用户另行确认具体范围。
- **适用范围**: `docs/reference/cli.md` 及后续任何 public CLI reference 中手写 command option 表、command usage 表、help surface 摘要，以及与 `createSpecliteProgram()` / built CLI help 可比对的 option surface。
- **规避指南**:
  - 不得仅靠人工复制维护 public CLI reference option 表。
  - 不得在文档中为 command 列出未注册的 option，也不得漏列 public help 中真实支持且面向用户的 option。
  - 不得把 command-specific option 描述错贴到其他 command，例如把 `status output` 或 `validate output` 描述写入 `init/list`。
- **最佳实践**:
  - 新增或修改 CLI option 时，同步更新 `docs/reference/cli.md`，并扩展 focused parity test 覆盖对应 command。
  - parity test 应从文档 option 表解析 option token，并与 `createSpecliteProgram()` 或构建后 CLI help option surface 做 exact sorted equality。
  - 对 runtime support command 或特殊 command group，如果文档有意只列 subset，必须在测试或文档中明确 subset policy，避免把遗漏误判为通过。
- **本次落地**:
  - Round 1 fixer 已修复 `docs/reference/cli.md` 的 `init/list/status/validate` option 表。
  - Round 1 fixer 已新增 `test/docs-reference-cli-options.test.ts`，覆盖本次错列和漏列回归。
  - Round 2 reviewer/evaluator 确认全部关闭。
- **同步状态**: candidate recorded only in Story 8-7 code-review directory。

## Global Update Assessment（全局更新评估）

- **是否达到 promotion rules 的全局建议阈值**: 否。总分 7/12，低于全局文档规则阈值 `>= 8/12`。
- **是否更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`**: 否。本轮仅 story-local 记录；正式 `cr-rules-summary.md` 写入需要用户另行确认 record-only 范围。
- **是否更新 `_bmad-output/project-context.md` / `CONTEXT.md` / architecture docs / docs reference**: 否。
- **不更新原因**:
  - 该候选规则虽可执行且有明确修复闭环，但目前只在单个 Story 中出现。
  - 现有 Story 8.7 AC4 与 Epic 8 已提供通用 docs/renderer 一致性要求，本条是更细的 implementation/CR 检查点，适合先保留为 Story-local candidate。
  - 用户本轮明确要求只有 promotion rules 明确满足时才允许更新项目级规则文档；本条总分未达到全局升格阈值。
  - `bmenhance-cr-04-rules-extractor` 要求全局文档写入需确认具体范围；本轮未执行 apply-confirmed。

## TODO Tracker Handoff（TODO Tracker 交接）

无需交给 05 TODO Tracker。

- Round 1 evaluation 明确无非阻塞 CR TODO；本轮唯一问题作为阻塞修复项处理。
- Round 2 review/evaluation 均确认 findings 0、非阻塞 CR TODO 0。
- 候选规则对应问题已由 fixer 修复并复审关闭，不是未完成的非阻塞改进项。
