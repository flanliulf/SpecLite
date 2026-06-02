---
Story: 6-3
Round: 1
Date: 2026-06-02
Model Used: GPT-5.5
Review Source: 6-3-code-review-summary-20260602-round-1.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 6-3 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查结论为不通过，包含 1 个阻塞 finding：`resolve-parity` required config layer failure fixture 将 `_speclite/config.toml` 的 `details.layerRole` 写成 `optional-config`，但 owning SPEC 与 runtime implementation 均要求 `required-config`。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] `resolve-parity` required config layer failure fixture 标错 `layerRole`**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

经独立代码验证，reviewer 对 SPEC、runtime implementation 与 fixture expected output 的描述准确：

- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:85-94` 定义 `speclite resolve config` 的合并顺序第一层是 installer-owned `_speclite/config.toml`，并明确 `_speclite/config.toml` 是 required。
- `src/config/config-reader.ts:21-27` 在 runtime config resolver 中将 `_speclite/config.toml` 配置为 `required: true`，且 `role: "required-config"`。
- `test/fixtures/resolve-parity/expected/config/required-layer-error.jsonl:1` 对同一个 `_speclite/config.toml` missing required layer diagnostic 输出了 `details.layerRole: "optional-config"`。
- `test/fixture-contract.test.ts:257-268` 只解析 expected stderr JSON Lines 并检查 redaction，没有断言 required layer 的 `details.layerRole` 语义。
- `test/resolve-cli.test.ts:89-101` 只断言 required layer failure 的 `issueId`、`severity` 与 `affectedPath`，没有断言 `details.layerRole`，也没有把 live stderr 与 `resolve-parity` expected fixture 做语义 parity 比较。

Story 6.3 AC9 要求 `resolve-parity` 覆盖 required layer failure、stderr shape 与 exit code；AC11 要求 fixture 更新遵循 owning SPEC 优先。当前 expected fixture 将 required config layer 标成 optional config layer，与这两个验收点存在语义偏差。

**严重性判断：合理**

原始严重性标为 `[中]`，同时将其作为阻塞交付问题处理是合理的。该问题不是生产 runtime 直接把 required layer 当 optional layer，而是 release gate fixture 的 expected stderr 语义错误；因此不应上调为 P0。但它会让 Story 6.3 的 resolver parity fixture 记录错误的 required-layer failure 分类，并暴露出测试未真正锁住 runtime diagnostic 与 fixture expected output 的 parity，属于质量门禁违规，阻塞本 Story 交付，评估优先级为 P1。

**修复建议：可行**

reviewer 的修复建议可行且范围明确：

- 将 `test/fixtures/resolve-parity/expected/config/required-layer-error.jsonl` 中的 `details.layerRole` 从 `"optional-config"` 修正为 `"required-config"`。
- 补充或调整测试，让 required config layer failure 的 live stderr 与 `resolve-parity` expected JSONL 做语义比较，或至少断言 `details.layerRole === "required-config"`，避免该类 fixture parity drift 再次被全量测试漏过。

**误报评估：非误报**

该 finding 有 SPEC、runtime implementation、fixture expected output 和测试覆盖缺口四类证据互相印证；且来源为 `edge+auditor`，同时命中边界语义和验收契约，不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `resolve-parity` required config layer failure fixture 标错 `layerRole` | [中] | **P1** | Fixture expected stderr 与 SPEC/runtime 的 required config layer 语义不一致，且现有测试未锁住该 parity。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有需要 defer 的非阻塞问题。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮未发现误报。 |

### 评估决定

- **发现 #1（`resolve-parity` required config layer failure fixture 标错 `layerRole`）**：确认有效，维持阻塞交付判断；需要先修正 fixture expected JSONL，并补充或调整测试锁定 required config layer failure 的 `details.layerRole` / live stderr parity。
- **整体决定**：Not Approved / 不通过。当前 reviewer finding 准确且需要修复；修复前不应进入 fixer 之后的 rules、todo、finalizer 或 Story done 收尾。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-02
- **Model Used**: GPT-5.5
- **Fix Items**: 1

#### 修复项 #1：`resolve-parity` required config layer failure fixture 标错 `details.layerRole`

- **状态**: 已修复
- **修改文件**:
  - `test/fixtures/resolve-parity/expected/config/required-layer-error.jsonl`
  - `test/resolve-cli.test.ts`
- **关键差异**:
  - 将 expected JSONL 中 `_speclite/config.toml` missing required layer diagnostic 的 `details.layerRole` 从 `"optional-config"` 修正为 `"required-config"`。
  - 在 required layer failure CLI 测试中读取 `resolve-parity` expected JSONL，断言 live stderr 与 expected fixture 的 `details.layerRole` 一致，并显式锁定为 `"required-config"`。
- **验证结果**:
  - `npm test -- test/resolve-cli.test.ts test/fixture-contract.test.ts`：通过，2 个 test files / 18 个 tests passed。
  - `npm run build`：通过。
  - `npm test`：通过，36 个 test files / 274 个 tests passed。
