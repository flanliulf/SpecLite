---
Story: 8-5
Round: 2
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 8-5-code-review-summary-20260616-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 8-5 的第 2 轮 CR 代码审查结果（复审）进行评估。本轮 reviewer 结论为通过，findings 0；其复核重点是 Round 1 finding 是否已修复，以及默认 machine mode 是否继续保持 pure JSON contract。经独立代码核验和 focused verification，本 evaluator 同意 reviewer 结论：Round 1 finding 已修复，本轮无新增阻塞项、CR TODO 或误报。

本轮 evaluator 额外执行 `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`，结果为 3 个 test files / 26 个 tests passed。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：已修复

Round 1 finding 指出 explicit `--human` Summary 的 `source path` 使用候选首层，而不是真实 selected key effective source。当前实现已修复该问题：

- `src/config/customization-reader.ts:79-117` 在成功加载并 merge 每个 TOML layer 后，按 leaf dotted key 记录 `affectedPath` 和 `role`，并在返回 `ResolverResult` 时附带 `sources`。
- `src/config/customization-reader.ts:243-257` 只为实际 selected value 中存在的 requested key 返回 source metadata，missing key 不会制造虚假的 source。
- `src/commands/resolve.ts:255-281` 的 `formatResolveSourcePath()` 不再取候选列表首项，而是读取 `result.sources[key]?.affectedPath`；missing / invalid / unresolved 返回 `none`，无 requested key 或多 source 返回 `multiple`。
- `src/commands/resolve.ts:101-118` 的默认 machine mode 仍只向 stdout 写入 `JSON.stringify(result.value, null, 2)`，diagnostics 仍走 stderr JSON Lines，因此 `sources` metadata 不会泄漏到默认 CLI stdout。

测试覆盖与 reviewer 复核一致：

- `test/resolve-readers.test.ts:39-59` 验证 config reader 在 `core.project_name` 被 user layer 覆盖时，`sources["core.project_name"].affectedPath` 为 `_speclite/config.user.toml`。
- `test/resolve-readers.test.ts:125-146` 验证 customization reader 在 `workflow.on_complete` 被 user customization layer 覆盖时，source path 为 `_speclite/custom/speclite-create-story.user.toml`。
- `test/resolve-cli.test.ts:57-79` 验证 explicit human config output 的 Summary 包含 `source path: _speclite/config.user.toml`，且不泄露 fixture root 或 home directory。
- `test/resolve-cli.test.ts:154-177` 验证 explicit human customization fallback 场景包含 `source path: _speclite/custom/speclite-create-story.user.toml`。
- `test/resolve-cli.test.ts:32-55`、`test/resolve-cli.test.ts:109-137` 和 `test/resolve-cli.test.ts:190-215` 验证默认 machine mode 仍保持 pure JSON、missing key `{}` / exit 0 / stderr empty，且未输出 `Outcome` prose。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | Round 1 evaluation 未留下非阻塞 CR TODO；Round 2 reviewer 也确认“仍为非阻塞待办：无”。 |

---

## 发现评估

Round 2 review summary 的新发现数量为 0，分类统计为 `decision_needed: 0`、`patch: 0`、`defer: 0`。因此本轮无逐条 finding 需要升级、降级、忽略或转入 CR TODO。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 findings 0；Round 1 阻塞 finding 已验证修复。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 无需新增 CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮无 findings，因此误报数量为 0。 |

### 评估决定

- **Round 1 / Finding #1（Human resolve output 会把 source path 显示为候选首层，而不是真实 resolved 来源）**：确认已修复，不再阻塞。
- **Round 2 新发现**：0 个；无需修复、无需纳入 CR TODO、无误报。
- **CR TODO 数量**：0。
- **误报数量**：0。
- **是否需要 fixer**：否。
- **整体决定**：Approved（approved = true）。
