---
Story: 9-1
Round: 1
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 9-1-code-review-summary-20260617-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 9-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查共提出 2 条 finding，均指向 Story 9.1 的 AC5 gate 缺口：agent lint 的 legacy activation negative check 漏报，以及 full corpus activation contract test 覆盖不足。经独立代码验证，2 条发现均有效，均需要 fixer 修复；本轮评估结论为 **FAIL**。

---

## 发现 #1 评估

### 审查原文

> **[中] `check_agent_skill.py` 的 legacy activation 正则不会命中目标字符串**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述准确。`assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py:51-57` 中 `LEGACY_ACTIVATION_PATTERN` 使用 Python raw string，但 pattern 内写成了 `resolve_customization\\.py`、`python3\\s+\\S*resolve_[a-z_]+\\.py`、`读取\\s+...` 等双重转义形式。由于 raw string 不会消费反斜杠，这些 pattern 会匹配字面量反斜杠，而不是普通文本中的 `.`, `\s` 语义。

该 pattern 在 `assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py:429-435` 被用于 `RUNTIME-03` finding，因此漏报会直接削弱 agent lint 对 legacy resolver / single-file config activation 的负向门禁。独立复现确认同一 pattern 对 `resolve_customization.py --key agent`、`resolve_config.py`、`python3 scripts/resolve_config.py`、`读取 `{project-root}/_speclite/config.toml`` 均返回 `False`。

Story 9.1 AC5 明确要求出现 `resolve_customization.py`、`resolve_config.py`、`_speclite/config.toml` 单文件 runtime config 读取、`{speclite-runtime-root}/scripts` 默认调用或 source checkout resolver fallback 时测试失败，见 `_bmad-output/implementation-artifacts/stories/9-1-installed-skill-activation-contract-hardening.md:42-48`。当前 lint 实现无法满足该要求。

**严重性判断：合理**

原始严重性 `[中]` 合理，但从交付门禁角度应作为 **P1 阻塞修复**。原因是 Story AC5 明确把该负向扫描作为 release gate 的一部分；如果 lint 输出假绿，会让后续 legacy activation 文案重新进入 canonical source 而不被阻断。

**修复建议：可行**

审查建议可行。应把 Python raw regex 中多余的双重转义修正为单层 regex 转义，例如 `r"resolve_customization\.py"`、`r"python3\s+\S*resolve_[a-z_]+\.py"`、`r"读取\s+`?\{project-root\}/_speclite/config\.toml`?"`，并增加针对 `LEGACY_ACTIVATION_PATTERN` / `RUNTIME-03` 的最小负向测试或脚本级验证样例，证明 legacy samples 会产生 finding。

**误报评估：非误报**

该 finding 有源码位置、调用位置和定向复现支撑，不是误报。

---

## 发现 #2 评估

### 审查原文

> **[中] “full corpus” activation contract test 未覆盖 `references/**/*.md` 全量 corpus**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述准确。`test/installed-activation-contract.test.ts:28-37` 使用固定 suffix 列表定义 `activationContractFiles`，仅覆盖 `SKILL.md`、`SKILL.en.md`、`references/activation.md`、`references/workflow-details.md` 和少量固定 step / workflow 文件。`test/installed-activation-contract.test.ts:61-64` 的 canonical corpus 扫描谓词只接受这些 suffix，没有遍历 `assets/source/speclite/**/references/**/*.md`。

独立统计确认，当前 `assets/source/speclite` 下共有 226 个 `references/**/*.md`，其中只有 29 个被该 suffix 列表覆盖，197 个 reference markdown 文件不在该 test 的 negative scan corpus 中。

Story 9.1 AC5 要求 release gate 扫描 canonical source skills 和 fresh install expected installed skills；其中 canonical persona Agent、customization-capable workflow skills、`workflow.on_complete` references、installed mirror 的 `SKILL*.md`、activation references 与 workflow terminal step files 都必须满足同一 contract，见 `_bmad-output/implementation-artifacts/stories/9-1-installed-skill-activation-contract-hardening.md:42-48`。Story 的 Task 2 / Task 5 也明确要求 full corpus test 覆盖 `assets/source/speclite/**/SKILL*.md`、`assets/source/speclite/**/references/**/*.md`、workflow terminal step files 和 fresh install mirrored `SKILL*.md` / reference files，见 `_bmad-output/implementation-artifacts/stories/9-1-installed-skill-activation-contract-hardening.md:63-69` 与 `:85-90`。当前固定 suffix 实现与这些要求不一致。

此外，`test/installed-activation-contract.test.ts:92-141` 的 install regression 只读取临时安装后的 Alice entry，没有对 fresh install expected installed-state 或实际安装 mirror 的 mirrored references 做全量负向扫描。因此 reviewer 指出的 installed mirror 同 contract 覆盖不足也成立。

**严重性判断：合理**

原始严重性 `[中]` 合理，但同样应作为 **P1 阻塞修复**。这是 Story 9.1 的核心 gate：如果 full corpus test 只扫固定 suffix，会允许未列入白名单的 reference / terminal hook 文件重新引入 legacy resolver 文案。

**修复建议：可行**

审查建议可行。应将 discovery 从固定 suffix 白名单改成结构化遍历，至少覆盖 canonical source 的 `SKILL*.md`、所有 `references/**/*.md`、明确识别的 workflow terminal step files，并对 fresh install mirrored entries 使用同一负向 pattern 扫描。若 installed-state 只保存 manifest / file index / hash，而不保存实体文件，则应通过临时 install 产物或 fixture file index 定位 installed mirror 后读取实际文件内容，避免只验证单个 Alice entry。

**误报评估：非误报**

该 finding 由测试代码、Story AC / task 要求和独立 corpus 统计共同支撑，不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `check_agent_skill.py` legacy activation regex 漏报 | [中] | **P1** | agent lint 的 `RUNTIME-03` 负向门禁无法命中目标 legacy strings，违反 AC5 gate。 |
| 2 | full corpus activation contract test 覆盖不足 | [中] | **P1** | 当前 test 只扫固定 suffix，未覆盖全量 `references/**/*.md` 和 installed mirror contract。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 reviewer findings 均为阻塞修复项，不建议降级为 CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮未发现误报。 |

### 评估决定

- **发现 #1（`check_agent_skill.py` legacy activation regex 漏报）**：确认有效，需由 fixer 修复 `LEGACY_ACTIVATION_PATTERN` 的转义并补充最小负向验证，确保 `RUNTIME-03` 能捕获 reviewer 列出的 legacy samples。
- **发现 #2（full corpus activation contract test 覆盖不足）**：确认有效，需由 fixer 扩展 `test/installed-activation-contract.test.ts` 的 corpus discovery，覆盖 canonical `SKILL*.md`、全量 `references/**/*.md`、terminal step files，以及 installed mirror 中对应的 `SKILL*.md` / references。
- **整体决定**：CR 评估 **FAIL**。需要 fixer，精确范围限于上述两项 gate 修复及其必要测试更新；不应修改 Story 文档、进度文件、无关源码或无关 fixture baseline。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-17
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 2

#### 修复条目

1. **发现 #1：`check_agent_skill.py` legacy activation regex 漏报**
   - 修复文件：`assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py`
   - 修复内容：将 `LEGACY_ACTIVATION_PATTERN` 的 raw regex 双重转义改为单层 regex 转义，使 `resolve_customization.py`、`resolve_config.py`、`python3 ...resolve_*.py` 和 `{project-root}/_speclite/config.toml` 文案可以被 `RUNTIME-03` 命中。
   - 验证补充：新增 `LEGACY_ACTIVATION_SAMPLES` 与 `--self-test-legacy-activation`，用于脚本级最小负向样例验证。

2. **发现 #2：full corpus activation contract test 覆盖不足**
   - 修复文件：`test/installed-activation-contract.test.ts`
   - 修复内容：将 canonical corpus discovery 从固定 suffix 白名单改为结构化扫描 `SKILL*.md` 与 `references/**/*.md`，覆盖 terminal step files 所在的 `references/steps/**/*.md`。
   - mirror 覆盖：在临时 install 后扫描 `.agents/skills` 与 `.claude/skills` mirror 中的 `SKILL*.md` 与 `references/**/*.md`，并复用同一 legacy activation negative assertion。
   - 范围控制：未修改 Story 文档、进度文件、无关 fixture baseline 或 unrelated snapshots。

#### 验证结果

- `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --self-test-legacy-activation`：通过，检查 6 条 legacy activation samples。
- `npm test -- test/installed-activation-contract.test.ts`：通过，4 个测试全部通过。
- `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills`：通过，检查 7 个 `speclite-agent-*`，`Critical/Major/Minor/Observation` 均为 0。
