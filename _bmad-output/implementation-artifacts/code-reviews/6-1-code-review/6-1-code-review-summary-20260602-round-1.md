---
Story: 6-1
Round: 1
Date: 2026-06-02
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具在当前环境不可用，已按 skill 降级为串行三层审查模式；Blind Hunter、Edge Case Hunter、Acceptance Auditor 逻辑均在当前上下文完成，无失败审查层。dev-story 记录显示 `npm run build`、focused Vitest 和全量 `npm test` 通过；本轮 CR 为遵守严格只读约束，未重新运行会写入 `dist/` 或测试缓存的命令。当前存在 3 个 blocking patch findings，建议不通过，先修复后进入 evaluator。

## 新发现

### 1. [中] `compareSemanticJson` 仍按 JSON 字符串顺序比较对象，可能把语义相同的 JSON 判为不一致

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - `src/fixtures/fixture-contract.ts:376-390` 先调用 `normalizeStableFixtureJson`，随后直接对 `actual` 与 `expected` 做 `JSON.stringify` 字符串比较。
  - Story 6.1 AC 2/4 要求 command JSON、manifest/index snapshots 和 public JSON 走 semantic comparison，并且稳定比较不得依赖不稳定排序。对象字段顺序是 JSON 表达形式，不应成为 semantic mismatch。

- **影响**
  - 如果 actual 与 expected 包含相同字段和值但 key insertion order 不同，fixture comparison 会失败，维护者可能被迫重排 snapshot 字段来适配实现细节。
  - 这会把比较策略退化为 raw JSON bytes 的弱变体，违背 Story 6.1 的 expected output contract foundation。

- **建议**
  - 对 plain object 做 canonical key ordering 后再深比较，或使用结构化 deep equality 并只对有 contract ordering 的 arrays 保持顺序断言。
  - 增加测试：`compareSemanticJson({ actual: { b: 1, a: 2 }, expected: { a: 2, b: 1 } })` 应通过。

### 2. [中] `allowedNonStableFields` 可以掩盖非 timestamp 字段，random/duration 类字段可被错误归一化

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/fixtures/fixture-contract.ts:497-500` 只要 key 出现在 `allowedNonStableFields`，就返回固定值 `"<iso8601>"`。
  - `src/fixtures/fixture-contract.ts:526-531` 仅当字段名包含 `at` 时才校验 ISO timestamp；`randomId`、`durationMs`、`processId` 等字段如果被传入 allowlist，不会被拒绝。
  - Story 6.1 AC 4 明确：只允许 owning schema 显式声明的 timestamp fields 被 normalize/omit；random id、process id、duration、profiling 等不稳定字段不得进入 stable outputs。

- **影响**
  - 调用方可以误把 `randomId`、`durationMs`、`processId` 放入 allowlist，比较器会把它们当作 `generatedAt` 一样归一化，导致本应失败的 unstable snapshot 泄漏通过。
  - 输出值统一写成 `"<iso8601>"` 也会误导非 timestamp 字段的 comparison result。

- **建议**
  - 将可归一化字段限制为 schema-declared timestamp field allowlist，或让 allowlist entry 携带字段类型，例如 `{ field: "generatedAt", kind: "iso-timestamp" }`。
  - 增加负向测试：`allowedNonStableFields: ["randomId"]`、`["durationMs"]`、`["processId"]` 均应失败；仅 `generatedAt` 等 timestamp 字段可归一化。

### 3. [中] Fixture manifest 的 `expectedOutputClass` 没有绑定 expected output class registry

- **来源**：auditor
- **分类**：patch

- **证据**
  - `src/fixtures/fixture-contract.ts:144-152` 中 `FixtureCaseManifestSchema.expectedOutputClass` 使用 `z.string().min(1).optional()`，未复用 `ExpectedOutputClassSchema`。
  - `src/fixtures/fixture-contract.ts:38-47` 已定义合法 expected output classes；`src/fixtures/fixture-contract.ts:215-257` 也已建立 registry，但 manifest parser 没有消费该 registry。
  - `test/fixture-contract.test.ts:102-121` 只验证 `ExpectedOutputClassSchema.safeParse("unknown-output")`，没有验证 `FixtureCaseManifestSchema` 会拒绝未知 `expectedOutputClass`。

- **影响**
  - fixture manifest 可以声明任意 expected output class，绕过 Story 6.1 AC 2 的 “Expected output classes are explicit” 要求。
  - 后续 fixture runner 或 release gate 分类如果信任 manifest parser，会把无 parser anchor / comparison rule 的 expected output 当作合法资产。

- **建议**
  - 将 `expectedOutputClass` 改为 `ExpectedOutputClassSchema.optional()`，或按需要支持数组时使用 `z.array(ExpectedOutputClassSchema)`。
  - 增加测试：`FixtureCaseManifestSchema.safeParse({ caseId: "resolve-parity", expectedOutputClass: "unknown-output" }).success` 必须为 `false`。

### 4. [低] Source integrity manifest id 规则与 release gate registry 的粒度不一致，后续 runner 语义可能分裂

- **来源**：edge
- **分类**：defer

- **证据**
  - `src/fixtures/fixture-contract.ts:139-142` 允许 `source-integrity/<sub-case>` 以及可选第三段路径。
  - `src/fixtures/fixture-contract.ts:196-205` 的 release gate registry 只登记 `source-integrity/<required-sub-case>` 两段 id。
  - 现有 `test/fixtures/source-integrity/source-unreadable-blocked/*/fixture-case.json` 使用三段 id；这些 id 可能能被 parser 接受，但 `getFixtureGateClassification` 不会把它们归类为 release gate sub-case。

- **影响**
  - 这不是本次新增代码单独造成的直接功能回归，但会让 “parser accepts” 和 “gate classification” 形成不同合法性边界。
  - 后续 Story 6.2-6.5 若基于 parser 与 registry 分别实现 fixture runner / release gate，可能出现同一 fixture manifest 被解析但无法分类的情况。

- **建议**
  - 后续明确三段 source-integrity fixture 是 regression asset、documentation example，还是 required gate 的细分 evidence。
  - 若三段 id 合法，应在 registry 中显式分类；若不合法，应收窄 `FixtureManifestCaseIdSchema` 并迁移既有 fixture manifest。

## 验证摘要

- `npm test` ✅ dev-story 记录通过（35 files / 266 tests passed）；本轮 CR 未重新执行，原因是用户要求严格只读且当前验证可能写入缓存。
- `npm run lint` 未执行；`package.json` 当前未定义 `lint` script。
- `npm run build` ✅ dev-story 记录通过（tsup ESM/DTS build success）；本轮 CR 未重新执行，避免写入 `dist/`。
- 定向复现 未执行写入型命令；本轮通过代码审查定位到上述 comparison/schema 边界缺口。

## 通过项

- `src/fixtures/fixture-contract.ts` 已提供 release gate fixture cases、required `source-integrity` sub-cases、expected output class registry、fixture gate classification 和 parser anchor 数据结构。
- layout validator 覆盖 single case 与 group sub-case 的 `input/`、`expected/`、`README.md` 基础布局，并拒绝部分 generated/cache/temp/build/absolute path 进入 expected truth。
- parser wiring 复用 `CommandResult`、`ValidationIssue`、manifest/index schemas，没有在 fixture helper 内重写这些核心 shape。
- human-readable output helper 已覆盖 ANSI rejection、spinner-only rejection、field presence 和 narrow fallback 关键字段的基础断言。
- 已知既有问题：source-integrity 既有 fixture manifest 的层级与 release gate classification 需要后续统一，本轮列为 defer，不计入当前 blocking patch。

## 结论

- **结论：不通过**
- **阻塞项**：Finding #1、#2、#3
- **非阻塞项**：Finding #4
- **建议**：先修复 semantic JSON comparison、non-stable field allowlist 和 manifest expected output class validation，再进入 evaluator。
