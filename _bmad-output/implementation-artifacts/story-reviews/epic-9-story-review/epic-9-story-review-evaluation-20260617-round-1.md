---
Epic: 9
Scope: epic
Round: 1
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: epic-9-story-review-summary-20260617-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Story Review Evaluation
---

## Evaluation Summary（评估总结）

本轮以 fresh SR evaluator sub-agent 身份对 Round 1 reviewer 的 4 个 findings 逐条核验。4 个发现均有 Story / Epic / packaging 现状证据支撑，不属于误报；它们都指向 Story 文档内的 gate、corpus scan、scope inventory 或 negative validation matrix 不完整问题。

整体结论为不通过。Epic 9 仍应先进入 SR fixer：修订 Story 9.1 / 9.2 的依赖门禁、全量语料扫描范围、support-side `speclite-agent-*` 边界说明，以及 Python compatibility asset 的负向验证矩阵后，再进行下一轮 reviewer。

## Finding #1 Evaluation（发现 #1 评估）

### Original Review（审查原文）

> **[高] Story 9.2 缺少对 Story 9.1 负向 gate 已就绪的硬启动条件**
> - 来源：consistency+contract
> - 分类：patch
> - 涉及 Story：9-2
> - 证据 - Epic 9 明确要求 Story 9.1 是 P0，Story 9.2 是 P1 且依赖 Story 9.1 的默认 activation path 负向断言；Story 9.2 也写明“Story 9.1 应先完成或至少先提供 full corpus negative tests”。但 Story 9.2 当前 `Status: ready-for-dev`，Task 1/Task 2 没有要求在实现前先验证 Story 9.1 的 full corpus negative tests 已存在或可运行。
> - 影响 - 如果开发者先实现 Story 9.2，可能会把 `_speclite/scripts/resolve_*.py` 投影为兼容资产，却尚未有 corpus gate 防止 installed skills 重新引用这些 scripts。这会直接削弱 Epic 9 的核心完成门禁。
> - 建议 - 在 `9-2-python-resolver-compatibility-asset-projection.md` 增加 Task 0 或 Dependency Gate hard check：若 Story 9.1 未完成，至少必须先存在并通过 Story 9.1 的 full corpus negative tests；否则 Story 9.2 不得进入 implementation。也可以将 Story 9.2 状态调整为明确的 `blocked-by-9-1-corpus-gate`，直到该条件满足。

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修订（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性**：准确 — Epic 9 明确 Story 9.1 是 P0，Story 9.2 是 P1 且依赖 Story 9.1 对默认 activation path 的负向断言；Story 9.2 自身 Dependency Gate 也只写“应先完成或至少先提供 full corpus negative tests”，但 `Status` 仍为 `ready-for-dev`，Tasks 没有 implementation 前 hard check。

**严重性判断**：合理 — 该问题直接影响 Epic 9 的执行顺序和默认 resolver contract，属于进入开发前必须修订的 blocker。

**修订建议**：可行 — 在 Story 9.2 增加 Task 0 / Dependency Gate hard check，或将状态明确改为 blocked-by-9-1-corpus-gate，均能收口该风险。

**误报评估**：非误报 — 源 Story 文档确实存在 ready 状态与 dependency gate 强度不一致。

## Finding #2 Evaluation（发现 #2 评估）

### Original Review（审查原文）

> **[中] Story 9.1 的 full corpus 测试扫描范围遗漏 `SKILL.en.md`**
> - 来源：structure+contract
> - 分类：patch
> - 涉及 Story：9-1
> - 证据 - Story 9.1 Task 2 要求 full corpus test 扫描 `assets/source/speclite/**/SKILL.md`、`references/**/*.md` 和 fresh install mirrored skill files；Task 3 却要求迁移 `SKILL.md` 与 `SKILL.en.md`。Epic 9 的 scope 是 canonical Agent / Workflow activation protocol migration，不限中文入口。
> - 影响 - 英文 skill 入口可能继续保留 `resolve_customization.py`、单文件 `_speclite/config.toml` 或缺失 `command -v speclite` preflight，测试仍可通过，造成 installed corpus gate 假绿。
> - 建议 - 将 Task 2 和 Evidence Plan 中的 corpus scan 明确扩大为 `assets/source/speclite/**/SKILL*.md` 或等价白名单，覆盖 `SKILL.md`、`SKILL.en.md`、activation references、workflow terminal step files，以及 fresh install mirrored entries。

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修订（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性**：准确 — Story 9.1 Task 2 只点名 `SKILL.md`，但 Task 3 / Task 4 明确要求迁移 `SKILL.en.md`；仓库中也存在大量 canonical `SKILL.en.md`。

**严重性判断**：合理 — 这会让 full corpus gate 无法证明英文入口满足同一 activation contract，属于 AC5 可测性缺口。

**修订建议**：可行 — 将 Task 2、Task 5、Task 7 和 Evidence Plan 的扫描表达统一为 `SKILL*.md` 或显式列举 `SKILL.md` / `SKILL.en.md`，并说明 installed mirror 的覆盖粒度即可。

**误报评估**：非误报 — 任务范围内部存在实际不一致。

## Finding #3 Evaluation（发现 #3 评估）

### Original Review（审查原文）

> **[中] Story 9.1 的 Agent 迁移范围与“所有 `speclite-agent-*`”验收标准不完全一致**
> - 来源：consistency
> - 分类：patch
> - 涉及 Story：9-1
> - 证据 - AC5 要求所有 `speclite-agent-*`、customization-capable workflow skills 和 `workflow.on_complete` references 必须使用 `speclite resolve`。但 Task 3 仅指定 `assets/source/speclite/sdlc-skills/**/speclite-agent-*/SKILL.md` 与 `SKILL.en.md`，Task 7 的 agent lint 也只运行在 `assets/source/speclite/sdlc-skills`。当前 source tree 还存在 `assets/source/speclite/support-skills/speclite-agent-creator` 与 `assets/source/speclite/support-skills/speclite-agent-lint`。
> - 影响 - 如果 support-side `speclite-agent-*` 属于 canonical installed corpus，Story 9.1 可能漏迁移或漏测这些入口；如果它们不属于 persona Agent，也需要 Story 文档显式说明排除规则，否则实现者会在 support tool 与 persona agent 边界上产生不同解释。
> - 建议 - 在 Story 9.1 中补充 canonical corpus inventory 规则：哪些 `speclite-agent-*` 必须迁移，哪些 support tools 仅做负向 lint/packaging 检查并排除 persona activation。同步更新 Task 3、Task 5、Task 7 和 Anchor Contract Map，避免只覆盖 `sdlc-skills`。

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修订（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性**：准确 — Story 9.1 AC5 使用“所有 `speclite-agent-*`”，但 Task 3 / Task 7 主要限定 `sdlc-skills`。当前 packaging manifest 中确实包含 `support-skills/speclite-agent-creator` 和 `support-skills/speclite-agent-lint`，Story 9.1 只在 Task 5 提到不要把 `speclite-agent-lint` 误判为 persona Agent，未覆盖 `speclite-agent-creator` 或 full corpus inventory 规则。

**严重性判断**：合理 — 该问题会让实现者无法判断 support-side agent-named skills 是迁移对象、负向扫描对象还是显式排除对象，影响验收一致性。

**修订建议**：可行 — 补充 canonical corpus inventory 表，分别标记 persona Agent、support tooling、workflow skill、fresh install mirror 的迁移 / lint / negative scan 责任。

**误报评估**：非误报 — support-side `speclite-agent-*` 的存在和 manifest 覆盖使该边界必须在 Story 中明确。

## Finding #4 Evaluation（发现 #4 评估）

### Original Review（审查原文）

> **[中] Story 9.2 对 compat script 被误宣称为默认 resolver 的负向验证覆盖不足**
> - 来源：contract
> - 分类：patch
> - 涉及 Story：9-2
> - 证据 - AC3 要求如果 Skill activation text、manifest runtime entry、help/phase reference 或 docs default path 引用 `_speclite/scripts/resolve_*.py` 作为 resolver，必须报告 legacy resolver dependency 或让 corpus test 失败。但 Task 2 只要求“Skill activation text 引用”负向断言，Task 4 也只明确保留 activation text / source checkout resolver negative behavior；Task 5 只要求更新 docs，没有要求 docs default path 负向断言。
> - 影响 - 即使 installed skills 本身不引用 Python scripts，manifest、help index、phase coverage 或 docs 仍可能把 compat asset 表述成默认 runtime dependency，破坏 Epic 9 “只作为 compatibility / troubleshooting assets”的边界。
> - 建议 - 在 Story 9.2 Task 2/4/5/6 中增加负向测试矩阵：manifest runtime entry、help/phase reference、docs default resolver path、packaging metadata 中任一把 `_speclite/scripts/resolve_*.py` 声明为 default resolver 时必须失败；只有明确标注 `runtime-compat-script` / troubleshooting 的引用可通过。

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修订（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性**：准确 — Story 9.2 AC3 的负向覆盖对象包含 Skill activation text、manifest runtime entry、help/phase reference 和 docs default path；Tasks 只明确了 Skill activation text 负向断言，未把其它对象转成可执行验证矩阵。

**严重性判断**：合理 — Python scripts 作为 compatibility asset 的边界是 Epic 9 完成门禁之一；如果 docs / manifest / help 把它们重新表达为 default resolver，Node-only 默认 contract 会被削弱。

**修订建议**：可行 — 在 Task 2 / Task 4 / Task 5 / Task 6 中增加负向验证矩阵和允许引用规则，明确 `runtime-compat-script` / troubleshooting 才可通过。

**误报评估**：非误报 — AC 与任务验证粒度之间存在清晰缺口。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修订，阻塞进入开发）

| # | Finding | Original Severity | Evaluated Priority | Notes |
|---|------|----------|------------|------|
| 1 | Story 9.2 缺少 Story 9.1 corpus gate 硬启动条件 | [高] | P1 | sequencing blocker |
| 2 | Story 9.1 full corpus scan 未覆盖 `SKILL.en.md` | [中] | P1 | corpus gate 假绿风险 |
| 3 | Story 9.1 `speclite-agent-*` 范围与任务不一致 | [中] | P1 | inventory 边界不清 |
| 4 | Story 9.2 compat script 负向验证矩阵不足 | [中] | P1 | contract gate 不完整 |

### Follow-up Improvements（建议纳入后续改善跟踪，非阻塞）

| # | Finding | Original Severity | Evaluated Priority | Notes |
|---|------|----------|------------|------|
| - | 无 | - | - | 本轮无降级项 |

### Ignorable False Positives（可忽略，误报）

| # | Finding | Original Severity | Ignore Reason |
|---|------|----------|---------|
| - | 无 | - | 本轮无误报 |

### Evaluation Decision（评估决定）

**Overall Result（整体结论）**：需修订后再审

**PASS**：否

**Requires Fixer（是否要求 fixer）**：是

建议 SR fixer 仅修订 Story 9.1 / Story 9.2 的文档契约与验证范围：Story 9.2 增加 Story 9.1 corpus gate hard check；Story 9.1 统一 `SKILL*.md` / installed mirror / support-side `speclite-agent-*` inventory；Story 9.2 补齐 manifest、help/phase、docs default path、packaging metadata 的 negative assertion matrix。不得在 fixer 中扩大到源码实现或无关文档。
