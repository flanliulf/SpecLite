---
Story: 11-1
Round: 2
Date: 2026-09-02
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Round 1 Finding #1（`resolveArtifactRootsFromProjectConfig()` no-key full-read 丢失 merged config provenance）已关闭：当前 `resolveProjectConfig()` full read 会返回 leaf dotted-key source metadata，Story 11.1 resolver handoff 已覆盖 team custom、user custom、legacy fallback provenance，并保持 explicit-key behavior 与 four-layer merge 不回归。

本轮审查按 `bmenhance-cr-01-reviewer` 串行降级执行三层等价审查：当前上下文没有可调用的 Agent 并行调度工具，`review-acceptance-auditor` 也不是独立本地 Skill，而是 `bmad-code-review` 的内嵌验收审计提示词；三层审查均有结果，`failed_layers` 为空。

验证结果显示 focused tests、build、`git diff --check` 均通过；full `npm test` 仍失败 1 个文件。失败点不是 Round 1 修复未完成，而是 `test/contract-anchors.test.ts` 仍把 no-key full-read 的 `sources: {}` 作为旧快照断言。该断言与 Story 11.1 已批准的 provenance handoff 冲突，应作为本轮新增 patch finding 交给 Evaluator。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `resolveArtifactRootsFromProjectConfig()` 丢失 merged config provenance，`configSources` 始终为空
   - `src/config/customization-reader.ts:249-254` 已将 no-key full-read 的 source metadata 选择从顶层 key 改为 selected nested value 的 leaf dotted keys，并通过 `hasSelectedKey()` 校验 selected value 中确实存在对应 leaf。
   - `test/resolve-readers.test.ts:65-123` 已覆盖 no-key full nested config reads，证明 `core.output_folder`、`modules.sdlc.planning_artifacts`、team custom `modules.sdlc.analysis_artifacts`、user custom `modules.sdlc.project_knowledge` 都能返回 leaf source metadata，且不返回顶层 `core` / `modules`。
   - `test/artifact-root-resolution.test.ts:248-314` 已覆盖 artifact-root project-config handoff，证明 team custom root override、user custom root override，以及 legacy fallback 依赖的 `core.output_folder` / `modules.sdlc.planning_artifacts` provenance 均可从 `configSources` 定位。
   - focused 验证 `npx vitest run test/artifact-root-resolution.test.ts test/resolve-readers.test.ts test/artifact-path-validation.test.ts` 通过，21/21 tests passed。

### 仍为非阻塞待办

本轮没有沿用为 CR TODO 的上轮遗留项。Round 1 授权的 P1 已完成；剩余 full-suite 失败是本轮新发现的 stale contract anchor，需要单独评估授权。

## 新发现

### 1. [中][新] `contract-anchors.test.ts` 仍断言 no-key full-read `sources: {}`，与 Story 11.1 provenance handoff 冲突

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `test/contract-anchors.test.ts:368-380` 调用 `resolveProjectConfig({ projectRoot: tempRoot })`，随后把完整 result 固定断言为 `sources: {}`。
  - 当前定向复现命令 `npx vitest run test/contract-anchors.test.ts -t "parses the resolver merge result returned by the runtime readers"` 失败；实际 received 为 `sources.core.project_name = { key: "core.project_name", affectedPath: "_speclite/config.toml", role: "required-config" }`。
  - `src/config/customization-reader.ts:249-254` 的新行为是 no-key full-read 返回 selected nested value 的 leaf source metadata，这正是 Round 1 evaluation 授权的 bounded 修复方向。
  - `test/resolve-readers.test.ts:65-123` 与 `test/artifact-root-resolution.test.ts:248-314` 已把 full-read leaf provenance、team/user custom provenance 和 legacy fallback provenance 写成 focused regression。
  - `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:52-58` 要求 resolver result 可被 downstream consumers 复用；`:168-170` 与 `:238-241` 明确要求提供 merged config/provenance 到 artifact-root resolver 的稳定接入点，同时保持 merge precedence、optional-layer warnings、missing/repeated key 与 stdout/stderr parity。
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:47` 只要求 no-key 或多 key 的 `--human` Summary 不得伪装为单一真实 source path；`src/commands/resolve.ts:314-331` 已在无 requested keys 时输出 `source path: multiple`，因此内部 `ResolverResult.sources` 保留 leaf metadata 不违反 public output contract。

- **影响**
  - Full `npm test` 持续失败，阻塞 Story 11.1 completion lifecycle 的后续 finalizer 判断。
  - 该 anchor 属于 executable contract test；如果保留旧断言，会把已批准的 provenance handoff 修复误标为回归，诱导后续实现回退到 `sources: {}`。
  - 失败局限于 test expectation，没有发现 roots/modes、public resolve stdout/stderr、human no-key source path、explicit-key behavior 或 four-layer merge 的 runtime regression。

- **建议**
  - 更新 `test/contract-anchors.test.ts` 的该用例，使 expected result 包含 `core.project_name` 的 leaf `sources` metadata；或将该 anchor 收窄为 schema parse + value/issue/exitCode 断言，并另行断言 source metadata shape。
  - 修复后至少运行 `npx vitest run test/contract-anchors.test.ts test/resolve-readers.test.ts test/artifact-root-resolution.test.ts`、`npm test`、`npm run build`、`git diff --check`。

## 验证摘要

- `npx vitest run test/artifact-root-resolution.test.ts test/resolve-readers.test.ts test/artifact-path-validation.test.ts` ✅ 通过（3 files / 21 tests passed）
- `npx vitest run test/contract-anchors.test.ts -t "parses the resolver merge result returned by the runtime readers"` ❌ 失败（1 failed / 6 skipped）；唯一差异为 expected `sources: {}`，received `sources.core.project_name` leaf metadata
- `npm run build` ✅ 通过（tsup ESM / DTS build success）
- `git diff --check` ✅ 通过
- `npm test` ❌ 失败（60 / 61 files passed；473 passed / 1 failed / 4 todo）；唯一失败为 `test/contract-anchors.test.ts`
- 验证副作用处理：`npm test` 生成了 `release/packaging-manifest.json` 的 `packageHash` 漂移；已精确恢复为测试前 hash，未纳入 finding。

## 通过项

- `ARTIFACT_ROOT_REGISTRY` 覆盖 `SPEC 09` 七类 artifact roots、placeholders、fresh defaults、legacy fallback policy 与稳定顺序。
- Fresh defaults、existing explicit authority、missing-new-fields legacy fallback、mixed per-field mode、Project Knowledge/Public Docs boundary、unresolved/path/symlink diagnostics、public redaction 和 resolver purity 均有 focused coverage。
- Round 1 的 provenance 修复不破坏 explicit-key behavior：`test/resolve-readers.test.ts:39-59` 仍断言 repeated dotted keys 选择后的 source metadata，focused run 已通过。
- `src/commands/resolve.ts:123-129` 仍只把 `result.value` 写入 machine stdout；source metadata 不进入 default machine JSON output。
- `src/commands/resolve.ts:314-331` 在 no-key human output 下仍返回 multiple/unknown 语义，不会把某个 leaf source 伪装为单一 source path。
- Deferred Story 11.2+ surfaces 未出现 diff：`src/installer/config-initialization.ts`、`src/installer/runtime-structure.ts`、`src/manifest/manifest-generator.ts`、`assets/source/speclite/sdlc-skills/module.yaml` 与 fresh-install expected snapshots 未被本 Story implementation 修改。

## 结论

- **结论：不通过**
- **阻塞项**：1 个新 patch finding，位于 `test/contract-anchors.test.ts` 的 stale no-key full-read source metadata expectation。
- **建议**：需要进入 CR Evaluator。若 Evaluator 确认该 finding，有界修复范围应优先限制在 `test/contract-anchors.test.ts`，不应回退 `src/config/customization-reader.ts` 的 full-read leaf provenance 行为。
