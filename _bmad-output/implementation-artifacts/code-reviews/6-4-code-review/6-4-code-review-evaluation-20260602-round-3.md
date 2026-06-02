---
Story: 6-4
Round: 3
Date: 2026-06-02
Model Used: GPT-5.5
Review Source: 6-4-code-review-summary-20260602-round-3.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 6-4 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。本轮 review 结论为不通过，未提出新的独立问题；唯一阻塞项是 Round 2 / Finding #2 的残留：`path-portability` expected validate snapshot 仍未覆盖真正 project-boundary path escape。经只读核对，该发现成立；Story 6.4 当前不应 Approved / 通过。

---

## 上轮问题回顾确认

### Round 2 / Finding #1 — Packaging manifest inventory：已闭环

Round 3 review 对该项的闭环确认成立。`test/story-6-4-path-portability.test.ts:349-361` 已读取真实 `npm pack --dry-run --json` 的 `files[].path`，并断言 `manifest.files` 包含 `dist/packaging-manifest.json` 且与真实 pack inventory 完全一致。`scripts/release/packaging-check.mjs:56` 也已保留 `packaging-manifest-included-in-package-inventory` 断言。该项不再阻塞本轮评估。

### Round 2 / Finding #2 — path-portability expected validate snapshot：仍有阻塞残留

Round 3 review 对该项的残留判断成立。`test/fixtures/path-portability/expected/command-json/validate.json:32-43` 的 `artifact-path.escapes-project` 使用 `affectedPath: "_speclite-output/review.md"` 与 `details.reason: "outside-configured-root"`，表示 artifact path 不在 configured artifact root 内。源码中真正 project-boundary escape 的分支是 `src/validation/rules/artifact-path.ts:111-129`，其稳定 reason 为 `path-escapes-project`；单元测试锚点为 `test/artifact-path-validation.test.ts:43-64` 的 `actualArtifactPath: "../outside/report.md"`。

当前 `test/story-6-4-path-portability.test.ts:197-203` 只断言 expected snapshot 包含 issue id 列表，未断言 `artifact-path.escapes-project` 的 `details.reason` 必须为 `path-escapes-project`，也未提供 `../` 或等价 project-boundary escape 的 fixture evidence。因此 Round 2 P1 中的 path escape 语义缺口仍未闭环。

### Round 2 / Finding #3 — Exit-code semantics：已闭环

Round 3 review 对该项的闭环确认成立。`test/story-6-4-path-portability.test.ts:95-106` 已断言 `update`、`update --repair`、`validate` 的 JSON status 为 `failure`，并断言真实 CLI gate 的 exit code 序列为 `[0, 0, 0, 0, 1, 1, 1]`。该项不再需要进入 CR TODO。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| 无 | 无 | 无 | Round 2 的 P2 exit-code semantics 已同步补强；本轮无可继承 CR TODO。 |

---

## 发现 #1 评估

### 审查原文

> **[blocking] Round 2 P1 残留：`path-portability` expected validate snapshot 仍未覆盖真正 project-boundary path escape**
> - 证据：当前 `artifact-path.escapes-project` 的 expected evidence 是 `details.reason: "outside-configured-root"`，不是源码中真实项目边界逃逸使用的 `path-escapes-project`。
> - 建议：补充 `path-portability` expected validate snapshot 与 expected-output gate，使其覆盖 `../` 或 owning taxonomy 等价的 project-boundary escape，并断言 `details.reason: "path-escapes-project"` 或明确等价的稳定 conflict reason。

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/fixtures/path-portability/expected/command-json/validate.json:32-43` 的 expected issue 确实是 `artifact-path.escapes-project`，但其 `details.reason` 为 `outside-configured-root`。源码里这是 configured root containment 检查产生的 reason：`src/validation/rules/artifact-path.ts:69-76` 对 `actualArtifactPath` 调用 `validateContainedArtifactPath`，并传入 `reason: "outside-configured-root"`；`src/validation/rules/artifact-path.ts:202-220` 也显示该 helper 只表达 configured root 外逃。

真正的 project-boundary escape 是另一条分支：`src/validation/rules/artifact-path.ts:111-129` 在 `resolveProjectRelativePath` 失败时生成 `artifact-path.escapes-project`，并写入 `details.reason: "path-escapes-project"`。对应单元测试使用 `actualArtifactPath: "../outside/report.md"`，见 `test/artifact-path-validation.test.ts:43-64`。这与当前 expected fixture 的 `_speclite-output/review.md` / `outside-configured-root` 不是同一语义。

`test/story-6-4-path-portability.test.ts:197-203` 目前只断言 expected validate snapshot 的 issue id 列表包含 `artifact-path.escapes-project`、`artifact-path.symlink-escape`、`file-integrity.case-conflict`、`file-integrity.unsafe-overwrite-risk`，没有断言 `details.reason` 为 `path-escapes-project`。定向检索 `test/fixtures/path-portability` 与 `test/story-6-4-path-portability.test.ts` 也未发现 `path-escapes-project` 或 `../outside` 进入 Story 6.4 的 expected evidence。因此 review 指出的残留缺口成立。

**严重性判断：合理**

该问题仍是 P1 阻塞。Story 6.4 的 `path-portability` expected artifacts 是 release evidence 的一部分；如果 stable expected snapshot 只覆盖 configured artifact root 外逃，而未覆盖 project-boundary escape，AC6 中的 path escape 证据仍不完整。虽然 issue id 相同，但 `details.reason` 区分了不同 failure mode，当前 evidence 会让后续 reviewer 或 fixture consumer 误以为 project-boundary escape 已被纳入 Story 6.4 expected gate。

**修复建议：可行**

review 建议可行：补充 expected validate snapshot 与 expected-output gate，使其包含 `../` 或等价 project-boundary escape；同时断言 `details.reason: "path-escapes-project"`，或在 owning taxonomy 中明确说明当前 stable conflict reason 与 project-boundary escape 的等价性。更直接、风险更低的修复路径是增加一个真实 project-boundary escape fixture，并让 Story 6.4 测试断言该 expected issue 的 reason。

**误报评估：非误报**

非误报。fixture、Story 6.4 测试断言和源码规则分支相互印证：当前 expected evidence 覆盖的是 `outside-configured-root`，而不是 `path-escapes-project`。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `path-portability` expected validate snapshot 未覆盖真正 project-boundary path escape | [blocking] | **P1** | 当前 expected evidence 是 `outside-configured-root`，未覆盖源码中 `../` 逃逸触发的 `path-escapes-project`。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 无 | 无 | 无 | 本轮没有可 defer 项；Round 2 的 exit-code semantics 已闭环。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 | 本轮 blocking finding 成立，未发现误报。 |

### 评估决定

- **发现 #1（project-boundary path escape expected coverage 缺失）**：确认有效，维持 blocking，需要修复。
- **Packaging manifest inventory**：已闭环，不再阻塞。
- **Unsafe overwrite snapshot**：已闭环，不再阻塞。
- **Exit-code semantics**：已闭环，不进入 CR TODO。
- **整体决定**：Not Approved / 不通过。Story 6.4 需要先补齐 project-boundary path escape expected evidence，再进入下一轮 CR；不得执行 finalizer。

## 验证摘要

- 已读取并评估最新 review：`_bmad-output/implementation-artifacts/code-reviews/6-4-code-review/6-4-code-review-summary-20260602-round-3.md`。
- 已按需参考 Round 2 evaluation 与修复执行记录：`6-4-code-review-evaluation-20260602-round-2.md`。
- 已只读核对相关文件：`test/fixtures/path-portability/expected/command-json/validate.json`、`test/story-6-4-path-portability.test.ts`、`src/validation/rules/artifact-path.ts`、`test/artifact-path-validation.test.ts`、`scripts/release/packaging-check.mjs`。
- 未执行测试、build、fixer、rules、todo、finalizer 或 git commit；未修改源码、Story 文档、sprint-status 或进度文件。

✅ CR 代码审查结果评估完成（第 3 轮），结果已保存

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-02
- **Model Used**: GPT-5.5
- **Fix Items**: 1

#### 修复项 #1：`path-portability` expected validate snapshot 未覆盖真正 project-boundary path escape

- **对应评估项**: 发现 #1 / P1 blocking。
- **修改文件**:
  - `test/fixtures/path-portability/expected/command-json/validate.json`
  - `test/story-6-4-path-portability.test.ts`
- **修复内容**:
  - 将 expected validate snapshot 中 `artifact-path.escapes-project` 的 evidence 从 configured-root 外逃语义改为 project-boundary escape 语义：`affectedPath` 改为 `artifact:actualArtifactPath`，`details.reason` 改为 `path-escapes-project`，并同步使用源码分支对应的 impact / suggestedNextStep 文案。
  - 在 Story 6.4 path-portability expected-output gate 中新增断言，要求 `artifact-path.escapes-project` 必须包含 `affectedPath: "artifact:actualArtifactPath"`、`details.pathRole: "actualArtifactPath"` 与 `details.reason: "path-escapes-project"`，避免后续仅凭 issue id 误判覆盖充分。
- **范围控制**:
  - 未修改 Story 文档。
  - 未实现或修改 Story 6.5 `skill-artifact-loop` / documentation examples。
  - 未处理 packaging manifest、exit-code semantics 或其他已闭环项。
  - 未执行 reviewer/evaluator 复审、rules、todo、finalizer 或 git commit。
- **验证结果**:
  - `npm test -- test/story-6-4-path-portability.test.ts`：通过，1 个测试文件 / 6 个测试。
  - `npm run build`：通过。
  - `npm run release:packaging-check`：通过，`Packaging acceptance passed: dist/packaging-manifest.json`。
  - `npm test`：通过，37 个测试文件 / 280 个测试。

✅ CR 修复执行完成，修复记录已追加到评估文件
