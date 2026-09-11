---
Story: 11-1
Round: 2
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-1-code-review-summary-20260902-round-2.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-1 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer summary 报告 Round 1 provenance P1 已关闭，并新增 1 个 finding：`test/contract-anchors.test.ts` 仍将 no-key full-read 的 `sources: {}` 固定为 executable anchor，导致 full `npm test` 唯一失败。经独立代码、Story、SPEC 与定向测试核验，该 finding 成立；它是 stale test expectation，不是 public resolve output contract，也不是 runtime provenance 修复错误。评估结论为 CR 不通过，授权 bounded P1 fixer 仅更新 `test/contract-anchors.test.ts` 的旧 anchor expectation，并按 CR03 规则补充本 evaluation 的 fix record。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：已关闭

Round 1 evaluation 将 `resolveArtifactRootsFromProjectConfig()` 丢失 merged config provenance 评为 P1，并授权 bounded fixer 在 `src/config/artifact-root-resolver.ts`、`src/config/config-reader.ts`、`src/config/customization-reader.ts`、`test/artifact-root-resolution.test.ts`、`test/resolve-readers.test.ts` 范围内修复。当前代码核验显示该 P1 已关闭：

- `src/config/customization-reader.ts:97-103` 仍按 TOML leaf dotted key 收集 source metadata；`src/config/customization-reader.ts:249-254` 当前 no-key full-read 会对 selected nested value 调用 `collectTomlLeafKeys()`，并通过 `hasSelectedKey()` 确认 leaf 存在后返回 metadata，不再只按 `core` / `modules` 顶层 key 过滤。
- `src/config/config-reader.ts:11-20` 保持 `resolveProjectConfig({ projectRoot, keys? })` API，并继续把 config merge 委托给 `resolveTomlLayers()`；未新增第二套 merge logic。
- `src/config/artifact-root-resolver.ts:160-185` 的 `resolveArtifactRootsFromProjectConfig()` 复用 `resolveProjectConfig()` 并将 `configResult.sources` 作为 `configSources` 透传到 artifact-root handoff。
- `test/resolve-readers.test.ts:65-123` 已覆盖 no-key full nested config reads 返回 `core.output_folder`、`modules.sdlc.planning_artifacts`、team custom `modules.sdlc.analysis_artifacts`、user custom `modules.sdlc.project_knowledge` 的 leaf metadata，且不返回顶层 `core` / `modules`。
- `test/artifact-root-resolution.test.ts:248-314` 已覆盖 project-config handoff：team custom root override、user custom root override，以及 legacy fallback 所依赖的 `core.output_folder` / `modules.sdlc.planning_artifacts` provenance 均可从 `configSources` 定位。
- 独立运行 `npx vitest run test/resolve-readers.test.ts test/artifact-root-resolution.test.ts` 通过，2 files / 12 tests passed。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | - | - | Round 1 没有转入 CR TODO 的历史 finding。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] `contract-anchors.test.ts` 仍断言 no-key full-read `sources: {}`，与 Story 11.1 provenance handoff 冲突**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer 对失败点和 contract 边界的描述准确。`test/contract-anchors.test.ts:357-384` 的用例先调用 `resolveProjectConfig({ projectRoot: tempRoot })`，再用 `ResolveMergeResultSchema.parse(result)` 校验 merge-result shape，最后把完整 result 断言为 `sources: {}`。我独立运行 `npx vitest run test/contract-anchors.test.ts -t "parses the resolver merge result returned by the runtime readers"`，结果为 1 failed / 6 skipped；唯一 diff 是 expected `sources: {}`，received `sources.core.project_name = { key: "core.project_name", affectedPath: "_speclite/config.toml", role: "required-config" }`。这说明 schema parse、value、issues、exitCode 均未失败，失败点局限在旧 source expectation。

该 expectation 与当前已批准的 runtime 行为冲突。`src/config/customization-reader.ts:243-254` 明确将 no-key full-read 的 `sources` 选择改为 selected nested value 的 leaf dotted keys；在此 anchor fixture 中，`_speclite/config.toml` 只有 `core.project_name` 一个 leaf，因此返回 `core.project_name` 的 required-config metadata 是稳定且可解释的最小结果，不是随机或过度暴露的 source map。

Story 11.1 也支持保留 provenance handoff。AC 5 要求 resolution result 可被 installer、manifest、validator 或 workflow 复用，提供稳定 result model，且 completion evidence 是共享 API/model 与 contract tests（`_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:52-58`）。Task 4 要求复用既有 TOML four-layer merge（同文件 `:99-104`）；Task 6 要求提供 stable resolver API/model 给后续 consumers（同文件 `:111-114`）；Project Structure Notes 要求 `src/config/config-reader.ts` 或相邻 wrapper 提供 merged config/provenance 到 artifact-root resolver 的稳定接入点，并继续复用 `resolveTomlLayers()`（同文件 `:238-241`）。Anchor Contract Map 还将 single config-owned resolver/model 与 four-layer TOML merge列为 Functional Anchor（同文件 `:198-199`）。因此，把 no-key full-read leaf provenance 固定为 `{}` 会把 Story 11.1 的已授权修复误判为回归。

Owning SPEC 没有要求 no-key full-read 内部 `ResolverResult.sources` 为空。`SPEC 06` 只规定 `speclite resolve config` 默认 machine stdout 是 pure JSON resolved value，不输出 `CommandResult` envelope 或 prose（`_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:30-40`）；当前 `src/commands/resolve.ts:123-129` 也只把 `result.value` 写入 stdout，`sources` 不进入 default machine output。`SPEC 06` 对 `--human` 的约束是：未请求具体 key 或多 key 来源不唯一时，Summary 的 `source path` 不得伪装成单一真实来源（同 SPEC `:42-48`）。当前 `src/commands/resolve.ts:314-331` 在 no-key 时直接返回 localized `multiple`，独立运行 `npx vitest run test/resolve-cli.test.ts -t "renders explicit human resolved-with-warnings output for optional layer diagnostics"` 通过，`test/resolve-cli.test.ts:100-107` 也断言 no-key human output 为 `source path: multiple`。因此内部 `ResolverResult.sources` 保留 leaf metadata 不改变 public stdout/stderr contract。

`SPEC 09` 进一步确认 artifact-root 语义需要可解释 source。它将 artifact roots、fallback、mode 与 project knowledge boundary 定义为 field-level contract source，并要求 Architecture、Epic、Story、canonical skill 和 audit report 只能引用、不得重定义这些语义（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:21-58`）。Runtime artifact roots 必须通过 installed runtime config 或 `speclite resolve config` 读取，不得从 source checkout、package 文案、hardcoded command path 或 manifest projection 反推（同 SPEC `:60-76`）；existing explicit config 继续权威、legacy fallback 必须报告为 `legacy-compatible` 且不代表 migration（同 SPEC `:78-86`）。这与 Round 1 修复后的 leaf provenance handoff 一致。

**严重性判断：合理，评估为 P1**

原始严重性为 `[中]`，问题位于 test expectation 而不是 runtime resolver 逻辑，因此不是 P0，也不要求回退 source。它仍应评为 P1，因为 full `npm test` 仍因该 executable contract anchor 失败，阻塞 Story 11.1 CR closeout/finalizer；若不修复，会诱导 fixer 回退已关闭的 runtime provenance P1，破坏 strict-serial foundational Story 的 handoff evidence。

**修复建议：可行**

建议授权 bounded fixer 仅修改 `test/contract-anchors.test.ts` 中该用例的 stale expectation。最小稳定语义应为：

- 保留 `ResolveMergeResultSchema.parse(result)` 能解析 current result 的 schema anchor。
- 继续断言 `value` 为 `{ core: { project_name: "anchor-fixture" } }`、`issues` 为 `[]`、`exitCode` 为 `0`。
- 将 `sources: {}` 改为断言 `sources["core.project_name"]` 存在，且至少包含 `key: "core.project_name"`、`affectedPath: "_speclite/config.toml"`、`role: "required-config"`。
- 可额外断言 `sources` 不含顶层 `core`，以保持 Round 1 修复的 leaf-not-top-level 语义；不要在该 anchor 中要求 unrelated roots、fallback fields 或 Story 11.2/11.3 consumer behavior。

修复范围必须严格限制为：

- `test/contract-anchors.test.ts`
- 本 evaluation 文件中由 CR03 fixer 追加的 fix record

不授权修改 `src/config/customization-reader.ts`、`src/config/config-reader.ts`、`src/config/artifact-root-resolver.ts`、Story、SPEC、Flow Gate、tracker、review summaries、Story 11.2/11.3 consumers、installer/manifest/module metadata/fresh-install snapshots 或 unrelated cleanup。特别是不授权回退 `src/config/customization-reader.ts` 的 no-key full-read leaf provenance 行为。

修复后至少运行：

- `npx vitest run test/contract-anchors.test.ts test/resolve-readers.test.ts test/artifact-root-resolution.test.ts`
- `npm test`
- `npm run build`
- `git diff --check`

若 `npm test` 仍有除 `test/contract-anchors.test.ts` stale expectation 以外的失败，Fixer 必须停止并回报新的证据，不得扩大 scope 自行修复。

**误报评估：非误报**

这不是 public/external contract 要求 `sources` 为空。公开 CLI machine output 只输出 `result.value`，human no-key output 仍显示 `source path: multiple`。失败来自 test 内部 direct API anchor 对旧 full-read behavior 的精确快照，因此是 stale anchor，需要更新。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `contract-anchors.test.ts` 仍断言 no-key full-read `sources: {}` | [中] | **P1** | 该 expectation 与 Round 1 已批准并已关闭的 leaf provenance handoff 冲突，导致 full suite 唯一失败并阻塞 CR closeout。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮无需要转入 CR TODO 的 finding。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮无误报。 |

### 评估决定

- **发现 #1（no-key full-read `sources: {}` stale anchor）**：确认有效，CR 不通过，授权 fixer 执行 bounded P1 test-only 修复。
- **历史 finding 状态**：Round 1 provenance P1 已关闭；不得回退 `src/config/customization-reader.ts` 的 full-read leaf provenance。
- **允许修改的 bounded test scope**：仅 `test/contract-anchors.test.ts` 中 `parses the resolver merge result returned by the runtime readers` 用例的 stale expectation。
- **允许的 evaluation record scope**：仅本文件中由 CR03 fixer 追加修复执行记录。
- **禁止扩大范围**：不得修改源码、Story、SPEC、Flow Gate、tracker、review summaries、Story 11.2/11.3 consumer surfaces、installer/manifest/module metadata/fresh-install snapshots 或 unrelated cleanup。
- **用户决策点**：无。该 finding 不需要改变 public contract 或需求边界；属于已批准 runtime 行为引出的 stale executable anchor。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-03
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 1

#### Fix Item #1：no-key full-read `sources: {}` stale anchor
- **Status**: 已完成
- **Files Modified**: `test/contract-anchors.test.ts`
- **Change Summary**: 将 `parses the resolver merge result returned by the runtime readers` 用例中的旧 `sources: {}` expectation 更新为 leaf `core.project_name` metadata，断言 `key`、`affectedPath`、`role`，并补充不含顶层 `core` 的 leaf-not-top-level anchor。
- **Scope Boundary**: 未修改源码、Story、SPEC、Flow Gate、tracker、review summaries、Story 11.2/11.3 consumer surfaces 或其它测试用例。
- **Verification**: `npx vitest run test/contract-anchors.test.ts test/resolve-readers.test.ts test/artifact-root-resolution.test.ts` 通过（3 files / 19 tests）；`npm test` 通过（61 files / 474 passed / 4 todo）；`npm run build` 通过；`git diff --check` 通过。
- **Generated Drift Handling**: 验证过程中 `release/packaging-manifest.json` 的 `packageHash` 产生构建性 drift，已按 bounded 指令精确恢复；未保留该生成物改动。
