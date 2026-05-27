---
Story: 2-5
Round: 2
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Round 1 的两个 P1 原始复现场景已被 fixer 覆盖：`actualArtifactPath` 位于错误 output root 外不再返回 `[]`，反斜杠 artifact public path 会在 filesystem normalization 前被拒绝。`generatedAt` ISO 接受范围维持 Round 1 evaluator 结论，作为 P2 CR TODO 非阻塞保留。

由于当前环境没有可调用的 Agent 工具，本轮按 skill 降级规则串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；三层均完成，无失败层。

结论：不通过。fixer 对 `actualArtifactPath` 的 containment 修复过窄，将合法的 configured workflow artifact root 内路径误判为 `outside-default-output-path`，与 owning SPEC 的 “`defaultOutputPath` 或配置允许的 project-relative path” 语义不一致。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `actualArtifactPath` 未校验位于 configured/default output root 下
   - 修复位置：`src/validation/rules/artifact-path.ts` 新增 path role containment check。
   - 验证结果：`actualArtifactPath="_speclite-output/other/report.md"` 在 `configuredRoot="_speclite-output/planning-artifacts"`、`defaultOutputPath="_speclite-output/planning-artifacts"` 时不再返回 `[]`，会报告 `artifact-path.escapes-project`。
   - 复审备注：原始缺口已修复，但当前实现把合法范围收窄到 `defaultOutputPath`，形成本轮新发现。

2. Round 1 / Finding #2 — Artifact path validator 会放行反斜杠路径，未强制 POSIX-style public path contract
   - 修复位置：`src/validation/rules/artifact-path.ts` 在调用 `resolveProjectRelativePath` 前复用 `isProjectRelativePosixPath`。
   - 验证结果：`configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 中的反斜杠输入均返回 `artifact-path.escapes-project`，不再被 normalize 后放行。

### 仍为非阻塞待办

1. Round 1 / Finding #3 — `generatedAt` 值域校验比 Story contract 更窄
   - 维持既有评估结论：CR TODO / P2 非阻塞。
   - 本轮未要求 fixer 处理，当前 helper 仍使用 `Date.toISOString()` 生成 canonical UTC millisecond form。

## 新发现

### 1. [中][新] `actualArtifactPath` containment 被过度收窄为必须位于 `defaultOutputPath` 下

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/artifact-path.ts:69-77` 只在 `defaultOutputPath.relativePath` 与 `actualArtifactPath.relativePath` 都存在时调用 `validateContainedArtifactPath({ containerPath: defaultOutputPath.relativePath, ... })`，没有允许 `actualArtifactPath` 位于 broader `configuredRoot` 内的配置允许路径。
  - `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:140-147` 规定 MVP validation 检查 output path 符合 `defaultOutputPath` 或配置允许的 project-relative path。
  - 定向复现：当 `configuredRoot="_speclite-output/implementation-artifacts"`、`defaultOutputPath="_speclite-output/implementation-artifacts/story-reviews"`、`actualArtifactPath="_speclite-output/implementation-artifacts/code-reviews/2-5.md"`，该 actual path 仍位于 configured artifact root 内，但 `validateArtifactPathContract(...)` 返回 `artifact-path.escapes-project`，details 为 `reason: "outside-default-output-path"`。

- **影响**
  - 该实现修掉了“错误 root 被放行”的 P1，但把 contract 解释成“只能写入 defaultOutputPath”。这会拒绝 configured workflow artifact root 内由配置允许的 sibling artifact path，导致合法 workflow output 被错误阻塞。
  - 对 Story 2.5 来说，这仍是 artifact path structural validation contract 缺口：validator 未表达 “default output path 或 configured allowed path” 的二选一语义。

- **建议**
  - 将 containment 判断改为：`defaultOutputPath` 必须位于 `configuredRoot` 下；`actualArtifactPath` 至少必须位于 `configuredRoot` 下，并在存在更具体 configured allowed output path 时再校验该 allowlist。
  - 增加 regression test：`configuredRoot="_speclite-output/implementation-artifacts"`、`defaultOutputPath="_speclite-output/implementation-artifacts/story-reviews"`、`actualArtifactPath="_speclite-output/implementation-artifacts/code-reviews/2-5.md"` 应通过或按配置 allowlist 规则判定，而不应无条件返回 `outside-default-output-path`。

## 验证摘要

- ✅ `npm test -- --run test/artifact-path-validation.test.ts` 通过，1 file / 6 tests。
- ✅ `npm run build` 通过。
- ✅ `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts` 通过，4 files / 20 tests。
- ❌ `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts` 失败，4 files passed / 1 file failed；失败点是 `test/runtime-structure.test.ts` 期望 IDE `skillCount=54`，当前实际为 `53`。
- ❌ `npm test` 失败，18 files passed / 1 file failed，110 tests passed / 1 failed；失败点同为 `test/runtime-structure.test.ts` 的 skillCount fixture drift。
- ✅ `git diff --check` 通过。
- 额外复核：
  - Round 1 P1 原始错误 root 复现已不再返回 `[]`。
  - Round 1 P1 反斜杠 public artifact path 复现已不再返回 `[]`。
  - 本轮新增 configured-root sibling path 复现返回 `artifact-path.escapes-project` / `outside-default-output-path`，确认存在误拒绝。

## 通过项

- 严格 POSIX-style artifact public path 校验已覆盖 `configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 三个 role。
- 原始 `actualArtifactPath` 位于 configured/default output root 外的放行问题已被覆盖。
- Markdown frontmatter、sidecar metadata、workflow-owned path classification、artifact evidence row 与 `skill-artifact-loop` metadata fixture 在 focused tests 中仍通过。
- 本轮未将缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` split files 作为缺陷；manifest/index 能力当前由集中 builder/helper 承载，符合修订后的 functional anchor 标准。

## 结论

- **结论：不通过**
- **阻塞项**：1 个新发现，`actualArtifactPath` containment 规则过窄，误拒绝 configured artifact root 内的合法路径。
- **建议**：进入 evaluator round 2 独立评估；如确认有效，再由 fixer 调整 containment 语义并补充 configured-root sibling path regression test。`generatedAt` 维持 P2 CR TODO。
