---
Story: 2-5
Round: 2
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 2-5-code-review-summary-20260527-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-5 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer round 2 确认 Round 1 的两个 P1 原始问题已被修复，同时提出 1 个新发现：`actualArtifactPath` containment 被过度收窄为必须位于 `defaultOutputPath` 下。经源码、owning SPEC、Story contract、现有 fixture 与定向复现核实，该新发现确认有效，严重性足以阻塞交付。`generatedAt` 维持 Round 1 evaluator 已确认的 P2 CR TODO，不纳入本轮 fixer scope。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：原始错误 root 放行问题已修复，但引入过窄 containment

`src/validation/rules/artifact-path.ts:50-58` 现在会校验 `defaultOutputPath` 位于 `configuredRoot` 下，`src/validation/rules/artifact-path.ts:69-77` 会校验 `actualArtifactPath` 位于 `defaultOutputPath` 下。Round 1 的原始错误 root 场景不再被放行；但后一段实现把 `actualArtifactPath` 的合法范围固定为 `defaultOutputPath`，没有表达 owning SPEC 的 “`defaultOutputPath` 或配置允许的 project-relative path” 语义。

### Round 1 / Finding #2：反斜杠 public path 放行问题已修复

`src/validation/rules/artifact-path.ts:92-107` 在 filesystem normalization 前调用 `isProjectRelativePosixPath`，会拒绝 `configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 中的非 POSIX public path。Round 1 的反斜杠路径 normalize 后放行问题已修复。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#3 | `generatedAt` 值域校验比 Story contract 更窄 | CR TODO / 非阻塞 | 同意维持 Round 1 evaluator 结论：P2 非阻塞，不扩大本轮 fixer scope。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] `actualArtifactPath` containment 被过度收窄为必须位于 `defaultOutputPath` 下**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

当前实现先校验 `defaultOutputPath` 位于 `configuredRoot` 下（`src/validation/rules/artifact-path.ts:50-58`），随后在存在 `actualArtifactPath` 时只用 `defaultOutputPath` 作为 container 校验 actual path（`src/validation/rules/artifact-path.ts:69-77`）。这意味着只要 actual path 不在 `defaultOutputPath` 子路径下，即使它仍位于 broader configured artifact root 内，也会返回 `artifact-path.escapes-project`，details.reason 为 `outside-default-output-path`。

owning SPEC 规定 `defaultOutputPath` 必须落在 `_speclite-output/` 或配置约定的 workflow artifact root 下（`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:125-127`），且 MVP validation 检查 output path 符合 `defaultOutputPath` 或配置允许的 project-relative path（同文件 `140-147`）。Story AC1 同样要求 artifact 写入 `_speclite-output` 或配置约定的 workflow artifact root，并以 project-relative POSIX-style path 记录（`_bmad-output/implementation-artifacts/stories/2-5-workflow-artifact-output-and-metadata-validation.md:15-21`）。

定向复现确认：当 `configuredRoot="_speclite-output/implementation-artifacts"`、`defaultOutputPath="_speclite-output/implementation-artifacts/story-reviews"`、`actualArtifactPath="_speclite-output/implementation-artifacts/code-reviews/2-5.md"` 时，当前 `validateArtifactPathContract(...)` 返回 `artifact-path.escapes-project` / `outside-default-output-path`。该 actual path 没有逃出 project boundary，也没有逃出 configured artifact root；它只是没有位于 `defaultOutputPath` 子目录下。

现有正向 fixture 也说明不同 workflow 可以拥有不同 artifact output 子目录：`test/skill-artifact-loop.test.ts:129-133` 断言 code review artifact contract 的 `defaultOutputPath` 是 `_speclite-output/implementation-artifacts/code-reviews`，而不是 story review 的 `_speclite-output/implementation-artifacts/story-reviews`。因此 validator 不应把 broader configured root 内的合法 configured path 一概误判为 escaped。

**严重性判断：合理**

Reviewer 标注为 [中] 合理；按评估模板映射为 P1 阻塞项。原因是该缺陷会错误拒绝配置允许的 workflow output path，属于 artifact path structural validation contract 的 false negative / false rejection，不是单纯测试命名或代码风格问题。它会阻断合法 workflow artifact 输出通过 validation。

**修复建议：可行**

建议保留 Round 1 fixer 已补的 POSIX public path 校验和 `defaultOutputPath` within `configuredRoot` 校验；调整 `actualArtifactPath` containment 语义为至少位于 `configuredRoot` 下。若后续 validator 输入能获得更具体的 configured allowed output path / allowlist，则再对 allowlist 做精确校验。回归测试应覆盖：`configuredRoot="_speclite-output/implementation-artifacts"`、`defaultOutputPath="_speclite-output/implementation-artifacts/story-reviews"`、`actualArtifactPath="_speclite-output/implementation-artifacts/code-reviews/2-5.md"` 不应无条件返回 `outside-default-output-path`。

**误报评估：非误报**

源码分支、owning SPEC 和定向复现均支持 reviewer 结论，非误报。

---

## 验证摘要评估

Reviewer 记录包含 `test/runtime-structure.test.ts` 的 focused run 和全量 `npm test` 失败，失败点为 `skillCount` 期望值与实际值不一致。经当前环境复核：

- `npm test -- --run test/artifact-path-validation.test.ts test/runtime-structure.test.ts` 仍失败，失败位置为 `test/runtime-structure.test.ts:45` 的 fixture equality。
- 直接执行 `runInstallCommand(...)` 得到当前安装结果 `skillCount=54`，summary 也显示 `54 skills`。
- fixture 文件 `test/fixtures/fresh-install-empty-project/expected/command-json/fresh-install-success.json:6`、`33-45` 当前仍记录 `53 skills` / `skillCount: 53`。
- `src/modules/module-metadata.ts:313-330` 会递归发现模块目录下的 `SKILL.md` package roots；当前 `assets/source/speclite/sdlc-skills/module-help.csv:31` 已包含 `speclite-flow-gate`，且 `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/SKILL.md:1-9` 存在 skill package root。

评估结论：`skillCount` 失败是当前 bundled source skill inventory 与 fresh-install fixture snapshot 不一致导致的真实 fixture drift；它不是 Story 2.5 round 2 `actualArtifactPath` containment 修复应处理的代码回归，也不应扩大本轮 fixer scope。若要恢复全量测试，需要另行授权对 fresh-install expected fixture 做基线更新，或回到引入 `speclite-flow-gate` 的对应 Story/变更中处理。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `actualArtifactPath` containment 被过度收窄为必须位于 `defaultOutputPath` 下 | [中] | **P1** | 会误拒绝位于 configured artifact root 内、但不在 default output 子目录下的配置允许路径。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R1-#3 | `generatedAt` 值域校验比 Story contract 更窄 | [低] | **P2** | 维持 Round 1 evaluator 结论，当前 helper 使用 canonical `Date.toISOString()`，不纳入本轮 fixer scope。 |

### 可忽略（误报）

无。

### 不纳入本轮 fixer scope

| # | 项目 | 判断 | 说明 |
|---|------|------|------|
| V-1 | `skillCount` fixture drift | 真实 fixture drift，但非本轮 Story 2.5 round 2 fixer 项 | 当前 runtime 产生 54，fixture 仍记录 53；该问题与 `actualArtifactPath` containment 无直接关系，需单独授权或回到引入 skill inventory 变化的变更处理。 |

### 评估决定

- **发现 #1（`actualArtifactPath` containment 被过度收窄）**：确认有效，P1，需要 fixer 修复 containment 语义并补充 configured-root sibling path regression test。
- **Round 1 / Finding #3（`generatedAt` 值域校验比 Story contract 更窄）**：继续作为 P2 CR TODO 保留，本轮不处理。
- **`skillCount=54` vs `53` 测试失败**：确认是 fixture drift，不是本轮 artifact-path 修复项；不列入本轮 fixer scope。

评估结论：不通过。Story 2.5 需要进入 fixer 处理 1 个 P1 阻塞项；本 evaluator 未执行任何修复。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-27
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项

1. `actualArtifactPath` containment 被过度收窄为必须位于 `defaultOutputPath` 下
   - 状态：已修复。
   - 修改文件：`src/validation/rules/artifact-path.ts`、`test/artifact-path-validation.test.ts`。
   - 修复内容：保留 `defaultOutputPath` within `configuredRoot` 校验；将 `actualArtifactPath` containment container 从 `defaultOutputPath` 调整为 `configuredRoot`，避免误拒绝 configured artifact root 内的 sibling workflow output path。
   - 回归覆盖：新增 configured-root sibling path 正向测试，覆盖 `configuredRoot="_speclite-output/implementation-artifacts"`、`defaultOutputPath="_speclite-output/implementation-artifacts/story-reviews"`、`actualArtifactPath="_speclite-output/implementation-artifacts/code-reviews/2-5.md"` 应通过。
   - 范围控制：未修改 `generatedAt` ISO validator；未处理 `skillCount` fixture drift。

#### 验证结果

- `npm test -- --run test/artifact-path-validation.test.ts`：通过，1 file / 7 tests。
- `npm run build`：通过。
- `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts`：通过，4 files / 21 tests。
- `git diff --check`：通过。
- `npm test`：失败于已知 out-of-scope `test/runtime-structure.test.ts:45` skillCount fixture equality（expected 54 / actual 53），本轮未修复该 drift。

✅ CR 修复执行完成，修复记录已追加到评估文件。
