---
Story: 6-4
Round: 4
Date: 2026-06-02
Model Used: GPT-5.5
Review Source: 6-4-code-review-summary-20260602-round-4.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 6-4 的第 4 轮 CR 代码审查结果（复审）进行逐条评估。本轮 review 结论为通过，无 blocking finding；唯一新发现是动态 CLI smoke gate 仍只按 issue id 验证 path escape，未断言真实 `validate` 输出的 `details.reason`。经只读核对，该发现描述准确，但不影响 Round 3 阻塞项闭环；整体评估结论为 Approved / 通过。

---

## 上轮问题回顾确认

### Round 3 / Finding #1 — `path-portability` expected validate snapshot 未覆盖真正 project-boundary path escape：已闭环

Round 4 review 对该项的闭环确认成立。`test/fixtures/path-portability/expected/command-json/validate.json:32-43` 中 `artifact-path.escapes-project` 已固定为 `affectedPath: "artifact:actualArtifactPath"`，并在 `details.reason` 中写入 `path-escapes-project`。`test/story-6-4-path-portability.test.ts:205-215` 的 expected-output gate 也已显式断言同一 issue 必须包含 `affectedPath: "artifact:actualArtifactPath"`、`details.pathRole: "actualArtifactPath"` 与 `details.reason: "path-escapes-project"`。

源码分支仍与该 expected evidence 对齐：`src/validation/rules/artifact-path.ts:111-129` 在 project-relative path 解析失败时返回 `artifact-path.escapes-project`，并写入 `details.reason: "path-escapes-project"`。单元测试锚点 `test/artifact-path-validation.test.ts:43-64` 使用 `actualArtifactPath: "../outside/report.md"` 验证该分支。因此 Round 3 的 blocking 缺口已修复，不再阻塞。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| 无 | 无 | 无 | Round 4 review 未继承历史非阻塞待办。 |

---

## 发现 #1 评估

### 审查原文

> **[低][新] 动态 CLI smoke gate 仍只按 issue id 验证 path escape，未断言实际 validate 输出的 `details.reason`**
> - 来源：edge+auditor
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

`test/story-6-4-path-portability.test.ts:117-123` 的动态 CLI gate 对真实 `speclite validate --json` 输出只断言 `validate.issues` 包含 `artifact-path.escapes-project`、`file-integrity.case-conflict` 与 `file-integrity.unsafe-overwrite-risk`，未进一步匹配 `artifact-path.escapes-project.details.reason`。这与 review 原文一致。

同时，动态故障注入位于 `test/story-6-4-path-portability.test.ts:436-443`，将 `artifactContract.defaultOutputPath` 设置为 `reports/outside-artifacts`；该场景更偏向 configured artifact root 外部路径，而不是 `../` 形式的 project-boundary escape。Round 4 review 对动态 smoke gate 覆盖面的描述成立。

**严重性判断：合理但不阻塞**

原始严重性为低，评估后维持 P2 非阻塞。原因是 Round 3 的核心阻塞项要求 Story 6.4 release evidence / expected snapshot 能稳定覆盖真正 project-boundary path escape；当前 `test/fixtures/path-portability/expected/command-json/validate.json:32-43` 与 `test/story-6-4-path-portability.test.ts:205-215` 已硬断言 `details.reason: "path-escapes-project"`，足以防止 expected evidence 退回到仅按 issue id 判断。

动态 CLI smoke gate 若补充 `details.reason` 断言，可以降低未来真实 CLI 输出中 issue id 保持不变、reason 退化时的误判概率，但这属于测试稳健性增强，不改变当前 release fixture evidence 已闭环的事实。

**修复建议：可行但非必要**

review 建议可行：在动态 CLI gate 中定位 `artifact-path.escapes-project` issue，并断言 `affectedPath`、`details.pathRole` 与 `details.reason`；如要让动态场景也直接触发 project-boundary escape，则可补充 `../` 或等价故障注入。不过该补强不需要在当前 CR 轮次内执行，可作为 CR TODO 延后处理。

**误报评估：非误报**

非误报。动态 CLI gate 确实只断言 issue id；但该 finding 的影响被 expected snapshot gate 覆盖，因此不构成 blocking，也不需要当前修复。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 无 | 无 | 无 | 本轮无 blocking finding。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 动态 CLI smoke gate 未断言真实 `validate` 输出的 `details.reason` | [低] | **P2** | 发现有效但非阻塞；expected snapshot gate 已硬断言 `path-escapes-project`，该项可 defer / CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 | 本轮 finding 不是误报，但影响等级为非阻塞。 |

### 评估决定

- **发现 #1（动态 CLI smoke gate 未断言 `details.reason`）**：确认有效，评估为 P2 非阻塞；建议后续纳入 CR TODO 或测试稳健性补强，不需要当前修复。
- **Round 3 blocking（project-boundary path escape expected coverage 缺失）**：已闭环；expected snapshot 与 expected-output gate 已断言 `details.reason: "path-escapes-project"`。
- **整体决定**：Approved / 通过。Story 6.4 最新 round 4 review 的通过结论成立；当前无需要 fixer 处理的阻塞修复项。

✅ CR 代码审查结果评估完成（第 4 轮），结果已保存
