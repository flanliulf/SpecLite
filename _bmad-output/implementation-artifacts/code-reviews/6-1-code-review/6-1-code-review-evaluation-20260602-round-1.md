---
Story: 6-1
Round: 1
Date: 2026-06-02
Model Used: GPT-5.5
Review Source: 6-1-code-review-summary-20260602-round-1.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 6-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 4 个发现：3 个 blocking patch findings，1 个 defer finding。经代码与 Story/SPEC 契约独立验证，Finding #1、#2、#3 均确认有效且需要修复；Finding #4 为有效的后续一致性问题，但不应阻塞本轮 Story 6.1 修复闭环。整体评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] `compareSemanticJson` 仍按 JSON 字符串顺序比较对象，可能把语义相同的 JSON 判为不一致**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`compareSemanticJson` 先调用 `normalizeStableFixtureJson`，随后直接执行 `JSON.stringify(actual)` 与 `JSON.stringify(expected)` 并比较字符串，未对 plain object key 做 canonical ordering，也未执行结构化 deep equality。证据位于 `src/fixtures/fixture-contract.ts:376-390`。Story 6.1 要求 Command JSON、manifest/index snapshots 等 parse 后进行 semantic comparison，不比较 raw pretty-printed bytes；同时 stable comparison 不得依赖 object insertion order 或 non-deterministic ordering，证据位于 `_bmad-output/implementation-artifacts/stories/6-1-fixture-case-layout-and-expected-output-contract.md:35-39`、`:95-100`、`:213-222`。

**严重性判断：合理**

原始严重性为中，合理。该问题会导致字段和值相同但 key insertion order 不同的对象比较失败，破坏 Story 6.1 的 expected output contract foundation。它属于 contract helper 的功能缺陷，阻塞本轮交付质量，因此评估为 P1。

**修复建议：可行**

建议对 plain object 做稳定 key 排序后再比较，或改为结构化 deep equality，并保留数组的 contract ordering 语义。对应负向/正向测试可覆盖 `{ b: 1, a: 2 }` 与 `{ a: 2, b: 1 }` 应通过。

**误报评估：非误报**

该发现直接由当前实现证实，不是误报。

---

## 发现 #2 评估

### 审查原文

> **[中] `allowedNonStableFields` 可以掩盖非 timestamp 字段，random/duration 类字段可被错误归一化**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：基本准确**

`normalizeStableJsonValue` 只要发现 key 存在于 `allowedNonStableFields`，就调用 `assertAllowedNonStableValue` 后把该字段归一化为 `"<iso8601>"`，证据位于 `src/fixtures/fixture-contract.ts:495-501`。`assertAllowedNonStableValue` 仅在字段名包含 `at` 时校验值可被 `Date.parse` 解析，字段如 `randomId`、`processId` 不会被拒绝，证据位于 `src/fixtures/fixture-contract.ts:526-532`。Story 6.1 明确要求允许的 timestamp fields 必须由 owning schema 显式声明，未声明字段不得引入 random id、process id、environment variable、duration、p95、profiling sample、stack trace 或不稳定排序，证据位于 `_bmad-output/implementation-artifacts/stories/6-1-fixture-case-layout-and-expected-output-contract.md:35-39`、`:95-99`、`:213-222`。

审查原文中 `durationMs` 的例子需要细化：当前实现会因为 `"durationMs"` 字段名包含 `at` 而对其执行 timestamp parse 校验，因此数值型 duration 会被拒绝；但若误传可解析日期字符串，仍可能被归一化。`randomId`、`processId` 这类例子则完全成立。因此问题描述核心准确，但部分例子表述偏宽。

**严重性判断：合理**

原始严重性为中，合理。该问题会让调用方通过 allowlist 掩盖非 schema-declared timestamp 的不稳定字段，违反 AC 4 与 stable comparison policy。它会造成本应失败的 fixture snapshot 漏检，因此评估为 P1。

**修复建议：可行**

建议将 allowlist 限制为 schema-declared timestamp field，或把 allowlist 设计为带类型的声明，例如 `{ field: "generatedAt", kind: "iso-timestamp" }`。测试应覆盖 `randomId`、`processId`、`durationMs`、`generatedAt` 的正负路径。

**误报评估：非误报**

虽然 `durationMs` 示例需要更精确表述，但允许任意 allowlist key 被 timestamp 归一化的核心缺陷存在，不是误报。

---

## 发现 #3 评估

### 审查原文

> **[中] Fixture manifest 的 `expectedOutputClass` 没有绑定 expected output class registry**
> - 来源：auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`FixtureCaseManifestSchema.expectedOutputClass` 当前使用 `z.string().min(1).optional()`，未绑定 `ExpectedOutputClassSchema`，证据位于 `src/fixtures/fixture-contract.ts:144-152`。合法 expected output class registry 已由 `EXPECTED_OUTPUT_CLASS_IDS` 和 `ExpectedOutputClassSchema` 定义，证据位于 `src/fixtures/fixture-contract.ts:38-47`、`:130-137`、`:215-257`。现有测试只验证 `ExpectedOutputClassSchema.safeParse("unknown-output").success` 为 `false`，没有验证 manifest parser 会拒绝未知 `expectedOutputClass`，证据位于 `test/fixture-contract.test.ts:101-121`。

Story 6.1 AC 2 要求 expected output classes explicit，且每类 expected output 的比较规则由 owning SPEC 与 executable parser 管理，证据位于 `_bmad-output/implementation-artifacts/stories/6-1-fixture-case-layout-and-expected-output-contract.md:22-27`、`:87-94`。当前 manifest parser 允许任意非空字符串，确实绕过了 registry。

**严重性判断：合理**

原始严重性为中，合理。该问题会让 fixture manifest 声明无 parser anchor / comparison rule 的 expected output class，破坏 explicit expected output class contract，因此评估为 P1。

**修复建议：可行**

建议将 `expectedOutputClass` 改为 `ExpectedOutputClassSchema.optional()`；若未来需要一个 manifest 绑定多类 expected output，再引入 `z.array(ExpectedOutputClassSchema)` 或兼容迁移策略。修复时还需要处理现有 fixture manifest 中非 registry 值的实际数据。

**误报评估：非误报**

该发现直接由 schema 定义与测试覆盖缺口证实，不是误报。

---

## 发现 #4 评估

### 审查原文

> **[低] Source integrity manifest id 规则与 release gate registry 的粒度不一致，后续 runner 语义可能分裂**
> - 来源：edge
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

`FixtureManifestCaseIdSchema` 允许 `source-integrity/<sub-case>` 以及可选第三段路径，证据位于 `src/fixtures/fixture-contract.ts:139-142`。`FIXTURE_GATE_REGISTRY.fixtureGroupSubCases` 只把 `REQUIRED_SOURCE_INTEGRITY_SUB_CASES` 映射为两段 `source-integrity/<sub-case>` id，证据位于 `src/fixtures/fixture-contract.ts:196-205`。`getFixtureGateClassification` 只检查 registry，不会把未登记的三段 id 分类为 `fixture-group-sub-case`，证据位于 `src/fixtures/fixture-contract.ts:280-284`。现有 fixture manifest 中确实存在三段 `source-integrity/source-unreadable-blocked/<variant>` id。

**严重性判断：合理**

原始严重性为低，合理。该问题会造成 parser accepts 与 gate classification 的合法边界不同，但 reviewer 已将其标记为 `defer`，且该问题涉及后续 Story 6.3/6.4 的 runner 与 source-integrity matrix 语义，不是当前 Story 6.1 三个核心 patch 缺陷之一。

**修复建议：可行但非必要**

后续需要明确三段 source-integrity variant 是 required gate 的细分 evidence、regression asset，还是 documentation example。若合法，应在 registry 中显式分类；若不合法，应收窄 schema 并迁移既有 fixture manifests。

**误报评估：非误报**

该发现准确，但作为非阻塞一致性风险纳入 CR TODO 即可。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `compareSemanticJson` 依赖 `JSON.stringify` 对象字段顺序 | [中] | **P1** | 违反 semantic comparison，不同 key insertion order 会造成误失败。 |
| 2 | `allowedNonStableFields` 可掩盖非 schema-declared timestamp 字段 | [中] | **P1** | `randomId` / `processId` 等字段可被误归一化，导致 unstable snapshot 漏检。 |
| 3 | Manifest `expectedOutputClass` 未绑定 expected output class registry | [中] | **P1** | 任意非空 class 可通过 parser，绕过 explicit expected output class contract。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 4 | Source integrity manifest id 与 gate registry 粒度不一致 | [低] | **P2** | 问题有效，但属于后续 runner/gate classification 语义收敛，不阻塞本轮 patch 修复。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（semantic JSON object ordering）**：确认有效，需修复后复审。
- **发现 #2（non-stable allowlist 过宽）**：确认有效，需修复后复审；`durationMs` 示例需更精确，但不改变结论。
- **发现 #3（expectedOutputClass 未绑定 registry）**：确认有效，需修复后复审。
- **发现 #4（source-integrity id/classification 粒度不一致）**：确认有效但非阻塞，建议进入 CR TODO 或后续 Story 6.3/6.4 语义收敛。
- **整体决定**：不通过 / Not Approved。Story 6.1 应先修复 Finding #1、#2、#3，再进入下一轮 CR。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-02
- **Model Used**: GPT-5.5
- **Fix Items**: 3

### 修复范围

仅处理本评估文件确认的 3 个 P1：

1. `compareSemanticJson` 对象字段顺序语义比较缺陷。
2. `allowedNonStableFields` 过宽导致非 schema-declared timestamp 字段可被归一化。
3. `FixtureCaseManifestSchema.expectedOutputClass` 未绑定 expected output class registry。

未处理 P2 defer：`source-integrity` manifest id 与 release gate registry 粒度不一致。

### 修复结果

| # | 修复项 | 修改文件 | 处理结果 |
|---|--------|----------|----------|
| 1 | `compareSemanticJson` 不再用 `JSON.stringify` 字符串相等决定 pass/fail，改为结构化 deep equality；保留 arrays 的顺序语义。 | `src/fixtures/fixture-contract.ts`、`test/fixture-contract.test.ts` | 已修复，并新增对象 key insertion order 回归测试。 |
| 2 | `allowedNonStableFields` 仅允许 schema-declared timestamp 字段，且值必须是可解析 ISO 8601 string；`randomId`、`processId`、`durationMs` 即使出现在 allowlist 也会失败。 | `src/fixtures/fixture-contract.ts`、`test/fixture-contract.test.ts` | 已修复，并新增三类非 timestamp allowlist 负向测试。 |
| 3 | `FixtureCaseManifestSchema.expectedOutputClass` 改为 `ExpectedOutputClassSchema.optional()`，未知 class 不再通过 manifest parser。 | `src/fixtures/fixture-contract.ts`、`test/fixture-contract.test.ts` | 已修复，并新增 manifest parser 正/负向测试。 |

### 验证结果

- `npx vitest run test/fixture-contract.test.ts`：通过，8 tests passed。
- `npm run build`：通过，ESM 与 DTS build success。
- `npx vitest run test/fixture-contract.test.ts test/skill-artifact-loop.test.ts`：通过，9 tests passed。
- `npm test`：通过，35 test files passed，266 tests passed。
