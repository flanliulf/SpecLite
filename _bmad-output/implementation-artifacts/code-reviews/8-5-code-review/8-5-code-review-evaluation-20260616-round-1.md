---
Story: 8-5
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 8-5-code-review-summary-20260616-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 8-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查报告提出 1 个 finding：human resolve output 将 `source path` 渲染为候选首层路径，而不是请求 key 的真实 effective source。经独立代码验证，该 finding 有效，且直接影响 AC1 对 successful resolve human output 中 `source path` 的要求。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] Human resolve output 会把 source path 显示为候选首层，而不是真实 resolved 来源**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/commands/resolve.ts:49-60` 在 `resolve config` 中向渲染上下文传入固定候选路径列表，首项为 `_speclite/config.toml`。同文件 `src/commands/resolve.ts:170-173` 在 human output 的 Summary 中渲染 `source path` 时直接使用 `context.sourcePaths?.[0]`，因此成功输出中的单数 `source path` 始终是候选首层，而不是 selected dotted key 的实际来源。

fixture 也证明该输出会误导：`test/fixtures/resolve-parity/input/config/_speclite/config.toml:1-3` 将 `core.project_name` 定义为 `Fixture Base`，而 `test/fixtures/resolve-parity/input/config/_speclite/config.user.toml:1-2` 将同一 key 覆盖为 `Fixture User`。`test/resolve-cli.test.ts:75-78` 却断言 human output 包含 `source path: _speclite/config.toml`。对应 snapshot `test/fixtures/resolve-parity/expected/human/config-resolved.txt:8-11` 同样展示 `requested key: core.project_name` 与 `source path: _speclite/config.toml`，但该 key 的 effective value 来自 user layer。

底层 resolver 当前返回结构也未携带 effective source metadata：`src/config/customization-reader.ts:9-13` 的 `ResolverResult` 只有 `value`、`issues`、`exitCode`；`src/config/customization-reader.ts:73-99` 逐层 deep merge 后仅返回 selected value；`src/config/config-reader.ts:21-46` 定义了 config layer 顺序，但没有把 selected key 的最终来源传递给 presentation 层。因此 reviewer 对“使用候选首层硬编码 source path，而不是真实 resolved key 来源”的判断成立。

**严重性判断：偏低**

原始严重性为 `[中]`，但 Story AC1 明确要求 successful resolve human output 展示 `requested key`、`resolved layer`、`source path` 和 `value summary`，见 `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md:15-20`。当前实现虽然展示了 `source path` 字段，但该字段在覆盖场景下给出错误来源，属于验收标准中的核心信息不准确，而不是普通展示文案问题。评估后应提升为 **P1**：功能缺陷 / 质量门禁违规，阻塞交付。

**修复建议：可行**

reviewer 建议可行：优先在 resolver result 中携带 selected dotted key 的 effective source metadata，并让 human output 使用真实来源；如果当前 story 不准备实现精确来源追踪，则应避免用单数 `source path` 伪装为精确来源，改为 `source paths checked` 等不声明 exact source 的表达，并同步 SPEC/AC 语义。考虑 AC1 已写明 `source path`，更稳妥的修复方向是携带 effective source metadata，并补充覆盖后续 layer 覆盖 base value 的 human mode 测试。

**误报评估：非误报**

该 finding 有代码、fixture、snapshot 和 Story AC 共同支撑，不是误报。`Evidence` 区域额外输出完整 `source paths` 列表不能消除 Summary 中单数 `source path` 的错误含义，因为 AC1 要求的是 successful resolve output 中 source path 的可用来源信息，而当前 Summary 会把维护者导向错误文件。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Human resolve output 使用候选首层路径作为单数 `source path` | [中] | **P1** | 直接违反 AC1 对 successful resolve human output 中来源信息的要求，覆盖场景会显示错误文件。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|

### 评估决定

- **发现 #1（Human resolve output 会把 source path 显示为候选首层，而不是真实 resolved 来源）**：确认有效，且应从原始 `[中]` 提升为 **P1 阻塞修复**。修复应携带 selected key 的 effective source metadata；若短期无法保证精确来源，则必须避免把候选路径渲染为单数 `source path`，并同步调整 AC/SPEC 语义后再交付。
- **整体决定**：not approved。当前 CR TODO 数量为 0，误报数量为 0。需要进入 CR-03 fixer。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：Human resolve output 使用真实 effective source path

- **Status**: fixed
- **Files Changed**:
  - `src/config/customization-reader.ts`
  - `src/config/resolve-output-schema.ts`
  - `src/commands/resolve.ts`
  - `test/resolve-readers.test.ts`
  - `test/resolve-cli.test.ts`
  - `test/contract-anchors.test.ts`
  - `test/fixtures/resolve-parity/expected/human/config-resolved.txt`
  - `test/fixtures/resolve-parity/expected/human/config-resolved-with-warnings.txt`
  - `test/fixtures/resolve-parity/expected/human/config-unresolved.txt`
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
  - `docs/reference/cli.md`
- **Key Difference**:
  - Resolver result now carries selected dotted key effective source metadata in `sources`, derived from successfully loaded TOML layers using the same merge order.
  - Explicit `--human` output now renders Summary `source path` from effective selected key metadata. `core.project_name` resolves to `_speclite/config.user.toml`; `workflow.on_complete` resolves to `_speclite/custom/speclite-create-story.user.toml`.
  - Default machine mode still serializes only `result.value`, so `speclite resolve config/customization` stdout remains pure JSON and missing key default behavior remains `{}` / exit code `0` / empty stderr.
- **Verification**:
  - `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`: passed, 3 files / 26 tests.
  - `npm run build`: passed.
  - `npm test`: passed, 49 files / 356 tests.
  - `git diff --check`: passed.
  - `release/packaging-manifest.json`: packageHash drift detected after build and restored precisely.
