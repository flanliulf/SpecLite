# Story 8-6 CR Rules Extraction

## Executive Summary（执行摘要）

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Execution Mode**: story-local rules extraction in Story code-review directory
- **Output Boundary**: 仅记录本 Story 规则提取结果；不修改 source/test/story/sprint status/progress files，不 stage、commit、push；本次不更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，不更新全局/项目级规则文档。

本次 CR 历史包含 4 轮 review/evaluation。Round 1 暴露默认 `zh-CN` human output 在 `status`、`validate`、`update`、`resolve --human` 等路径仍直接展示英文自然语言；Round 2 继续暴露 `resolve --human` 的英文 human label 与 `issue.impact` prose 残留；Round 3 继续暴露 `install` human renderer family 的 prewrite、ready summary、State / Evidence / Authorization label 残留；Round 4 review/evaluation 确认前三轮 finding 均已修复，findings 0，CR TODO 0。

结论：提取 1 条候选规则。该规则达到 promotion rules 的全局文档建议阈值：默认 `zh-CN` human-readable output 的自然语言 prose/label 必须全部由 message catalog 或 locale-aware formatter 渲染，技术标识保留英文；修复时必须按 renderer family 覆盖所有相关命令和分支，不能只修复当前点名命令或 happy path。因 `bmenhance-cr-04-rules-extractor` 要求全局文档更新需确认具体范围，本次只在本文件记录候选规则、量化判定和建议写入位置，不直接修改项目级规则文档。

## Analysis Sources（分析来源）

- `8-6-code-review-summary-20260616-round-1.md`
- `8-6-code-review-evaluation-20260616-round-1.md`
- `8-6-code-review-summary-20260616-round-2.md`
- `8-6-code-review-evaluation-20260616-round-2.md`
- `8-6-code-review-summary-20260616-round-3.md`
- `8-6-code-review-evaluation-20260616-round-3.md`
- `8-6-code-review-summary-20260616-round-4.md`
- `8-6-code-review-evaluation-20260616-round-4.md`

## Model Timeline（模型时间线）

| 文件 | 角色 | Model Used |
|------|------|------------|
| `8-6-code-review-summary-20260616-round-1.md` | CR reviewer / Round 1 | GPT-5 Codex (gpt-5-codex) |
| `8-6-code-review-evaluation-20260616-round-1.md` | CR evaluator + fixer record / Round 1 | GPT-5 Codex (gpt-5-codex) |
| `8-6-code-review-summary-20260616-round-2.md` | CR reviewer / Round 2 | GPT-5 Codex (gpt-5-codex) |
| `8-6-code-review-evaluation-20260616-round-2.md` | CR evaluator + fixer record / Round 2 | GPT-5 Codex (gpt-5-codex) |
| `8-6-code-review-summary-20260616-round-3.md` | CR reviewer / Round 3 | GPT-5 Codex (gpt-5-codex) |
| `8-6-code-review-evaluation-20260616-round-3.md` | CR evaluator + fixer record / Round 3 | GPT-5 Codex (gpt-5-codex) |
| `8-6-code-review-summary-20260616-round-4.md` | CR reviewer / Round 4 | GPT-5 Codex (gpt-5-codex) |
| `8-6-code-review-evaluation-20260616-round-4.md` | CR evaluator / Round 4 | GPT-5 Codex (gpt-5-codex) |

## Findings Analysis（发现分析）

| 轮次 | findings | 来源分布 | 分类分布 | 修复状态 |
|------|----------|----------|----------|----------|
| Round 1 | 1 | `blind+edge+auditor`: 1 | `patch`: 1 | confirmed valid，P1 阻塞，已进入 fixer |
| Round 2 | 1 | `blind+edge+auditor`: 1 | `patch`: 1 | confirmed valid，P1 阻塞，已进入 fixer |
| Round 3 | 1 | `blind+edge+auditor`: 1 | `patch`: 1 | confirmed valid，P1 阻塞，已进入 fixer |
| Round 4 | 0 | 无 | `decision_needed: 0`, `patch: 0`, `defer: 0`, `dismiss: 0` | Approved，无新增 CR TODO |

### Common Pattern（共性模式）

默认 `zh-CN` human-readable output 的问题不是单个 label 漏翻，而是 renderer family 覆盖不完整：实现先修复了 `status`、`validate`、`update` 与 `resolve --human` 的重点路径，但 Round 2 又暴露 `resolve --human` 的中文冒号 label 与 resolver issue prose，Round 3 又暴露 `install` 的 prewrite / ready summary / State / Evidence / Authorization 分支。根因是 human renderer 中仍直接拼接英文 `CommandResult.summary`、`issue.impact` 或硬编码英文 label，而测试只覆盖部分命令、部分 punctuation 或 happy path。

CR 记录同时反复确认了必须保留英文的范围：command、flag、path、issue id、reason/status code、schema id、JSON field、enum value、step id、target id、source descriptor fields 等技术标识不应被翻译。真正需要 catalog/locale-aware formatter 处理的是面向人的 prose、section label、bullet label、summary explanation、impact/manual action 文案和 next action 自然语言。

## Extracted Candidate Rule（提取候选规则）

### CAND-CR-API-8-6-01：默认 `zh-CN` human output 的自然语言必须由 catalog 覆盖完整 renderer family

- **来源问题**: Story 8-6 多轮 CR 显示，默认 `zh-CN` human-readable output 即使局部接入 message catalog，仍可能在其他 command renderer 或 renderer branch 中直接透出英文 prose/label，导致默认中文用户看到中英文混杂输出并违反 AC1。
- **CR 证据**:
  - `8-6-code-review-summary-20260616-round-1.md`: Finding #1 指出 `status`、`validate`、`update`、`resolve --human` 默认中文路径仍输出英文 `CommandResult.summary`、`Command status:`、`Status:`、`Output profile:`、`requested key`、`machine contract`、`source paths` 等 human prose/label。
  - `8-6-code-review-evaluation-20260616-round-1.md`: evaluator 确认该 finding 有效，要求 human-only summary、state/evidence label、resolve human bullets 进入 catalog 或 locale-aware renderer，并保留 command、flag、path、issue id、reason code、schema id、JSON field、enum value 等技术标识。
  - `8-6-code-review-summary-20260616-round-2.md` 与 `8-6-code-review-evaluation-20260616-round-2.md`: Round 2 确认 `resolve --human` 仍透出 `source path：`、`source paths：`、`fallback source：` 和英文 resolver issue prose；测试仅检查 ASCII 冒号而漏掉中文冒号形式。
  - `8-6-code-review-summary-20260616-round-3.md` 与 `8-6-code-review-evaluation-20260616-round-3.md`: Round 3 确认 `install` human output 仍透出 `Target:`、`Directory state:`、`Completed steps:`、`Pending steps:`、`IDE target statuses:`、`Source`、`External Access`、`Authorization` 等英文 prose/label；评估明确指出修复不应只处理 prewrite-paused 路径，而应覆盖 install human renderer family。
  - `8-6-code-review-summary-20260616-round-4.md` 与 `8-6-code-review-evaluation-20260616-round-4.md`: Round 4 确认 `install`、`status`、`validate`、`update`、`resolve --human` 默认中文路径未再复现英文 prose/label，英文 fallback 与 machine/JSON contract 保持不变，CR TODO 为 0。

### Promotion Decision（升格判定）

| 硬性门槛 | 判定 | 理由 |
|----------|------|------|
| 有证据 | 是 | 8 个 CR summary/evaluation/fix record 文件均可追溯该问题、残留分支、修复和 Round 4 关闭结果。 |
| 可规则化 | 是 | 可写成“默认 `zh-CN` human output 的 prose/label 必须走 catalog/locale-aware renderer；技术标识保留英文；修复必须覆盖 renderer family”的明确行为约束。 |
| 非纯特例 | 是 | 适用于所有 CLI human-readable renderer、message catalog、locale fallback 和 human output regression，不只绑定 Story 8-6 某个文件。 |
| 不重复 | 通过，建议补充细化 | 现有 FR63b / NFR35b-14 已覆盖 message catalog 基础契约，但没有沉淀“renderer family 全覆盖、不得只修当前点名命令、负断言与技术标识正断言并用”的实现检查点。 |
| 状态明确 | 是 | Round 4 reviewer/evaluator 均确认修复关闭，findings 0，CR TODO 0。 |

硬性门槛结论：通过。该候选可进入量化评分，并达到全局文档建议阈值；本次先记录候选和建议，不直接写入项目级规则文档。

| 维度 | 分数 | 理由 |
|------|------|------|
| 复现频次 | 1 | 单 Story 内连续 3 轮 CR 复现同类缺口，覆盖 `status`、`validate`、`update`、`resolve --human`、`install` 多条路径。 |
| 影响范围 | 2 | 跨 command renderer、message catalog、issue formatter、install ready summary、focused regression tests 和 CLI documentation contract。 |
| 风险等级 | 1 | 直接造成默认中文 human output 违反验收标准和用户可读性目标，但不涉及数据损坏、安全漏洞或写入破坏。 |
| 根因稳定性 | 2 | 根因是 renderer family 与 catalog coverage 的流程/架构检查缺口，后续新增 command 或 branch 时高概率复现。 |
| 可执行性 | 2 | 可用 renderer family coverage matrix、prose/label deny-list、技术标识 allow-list、`en-US` fallback 和 JSON parity tests 检查。 |
| 文档缺口 | 1 | 项目已有基础 locale contract，但缺少面向实现和 CR 的具体检查规则。 |

- **总分**: 9/12
- **建议去向**: global-doc suggestion + story-local candidate record
- **是否需要用户确认**: 是。若要写入 `_bmad-output/project-context.md`、`_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 或其他项目级规则文档，需要确认具体范围后执行。
- **目标文档建议**:
  - `_bmad-output/project-context.md` 的 `Critical Implementation Rules（关键实现规则）`：补充一条实现规则，供后续 Story 开发和 CR 使用。
  - `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`：如用户确认 record-only，可按现有规则编号追加为 `CR-API-30` 或 `CR-DOC-04`，具体编号以写入时该文件最新索引为准。
- **适用范围**: CLI human-readable output、message catalog、locale fallback、diagnostics/output renderer、command-specific renderer、issue formatter、Next Actions renderer，以及相关 focused regression tests。
- **规避指南**:
  - 不得在默认 `zh-CN` human output 中直接输出英文 `CommandResult.summary`、`issue.impact`、hard-coded section label、bullet label 或解释句。
  - 不得只修复当前 CR 点名命令、happy path 或 ASCII punctuation；必须复核同一 renderer family 的 prewrite、ready summary、State、Evidence、Issues、Authorization、Next Actions 等相关分支。
  - 不得把 command、flag、path、issue id、reason/status code、schema id、JSON field、enum value、step id、target id 等技术标识翻译成中文。
- **最佳实践**:
  - 新增或修改 human renderer 时，先列出 renderer family coverage matrix：命令、mode、locale、section、issue path、ready/prewrite/failure branch。
  - 默认 `zh-CN` regression tests 同时包含英文 prose/label 负断言和技术标识正断言；对 locale-specific punctuation 也要覆盖，例如中文冒号 `：`。
  - `en-US` fallback tests 应证明英文 prose/label 仍可用；JSON parity tests 应证明 locale 不改变 `CommandResult` JSON、exit code、issue ordering、path normalization 或 machine mode stdout。
- **本次落地**:
  - Round 1 fixer 修复 `status`、`validate`、`update`、`resolve --human` 的主要默认中文 output。
  - Round 2 fixer 修复 `resolve --human` label/prose 和中文冒号测试盲点。
  - Round 3 fixer 修复 `install` renderer family 的 prewrite、ready summary、State / Evidence / Authorization label，并补充 regression。
  - Round 4 reviewer/evaluator 确认全部关闭。
- **同步状态**: 已记录在 Story 8-6 code-review 目录；未同步全局文档，未写入 `cr-rules-summary.md`。

## Global Update Assessment（全局更新评估）

- **是否达到 promotion rules 的全局建议阈值**: 是，9/12，且影响范围、风险等级、可执行性、文档缺口均 >= 1。
- **是否更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`**: 否，本轮仅 story-local 记录；若后续用户确认 record-only，可再按 `assets/output-format.md` 写入。
- **是否更新 `_bmad-output/project-context.md` / architecture / docs**: 否，本轮不直接修改项目级规则文档。
- **建议更新位置**: `_bmad-output/project-context.md` 的 `Critical Implementation Rules（关键实现规则）`。
- **建议写入要点**:
  - 默认 `zh-CN` human-readable CLI output 的所有自然语言 prose/label 必须来自 message catalog 或 locale-aware formatter；英文只允许作为技术标识保留。
  - locale 修复必须覆盖同一 renderer family 的所有相关命令和分支，不能只修 CR 点名路径；回归测试必须同时包含英文 prose/label 负断言、技术标识正断言、`en-US` fallback 和 JSON/machine-mode parity。
- **不直接更新原因**:
  - `bmenhance-cr-04-rules-extractor` 要求全局文档写入需确认具体范围。
  - 现有 PRD / NFR / docs 已覆盖基础 locale contract，本条是更具体的实现检查点，适合先由用户确认写入 `_bmad-output/project-context.md` 还是仅写入 CR rules summary。
  - 用户本轮明确禁止修改 source/test/story/sprint status/progress files，本次保持最小写入面，仅新增本 Story 规则提取总结。

## TODO Tracker Handoff（TODO Tracker 交接）

无需交给 05 TODO Tracker。

- Round 1-4 evaluation 均记录 CR TODO 数量为 0。
- 该候选规则对应问题已由前三轮 fixer 修复，并在 Round 4 关闭，不是未完成的非阻塞改进项。
- 本次未新增 open backlog 项；后续若用户确认不写入全局文档，也只应保留为已解决的 Story-local candidate，不进入 `cr-todo-backlog.md`。
