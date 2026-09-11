---
Story: 11-1
Round: 1
Date: 2026-09-02
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-1-code-review-summary-20260902-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer summary 仅报告 1 个新发现：`resolveArtifactRootsFromProjectConfig()` 已返回正确 roots/modes，但未能保留 Story 11.1 要求的 merged config provenance handoff，导致 `configSources` 为空。经独立代码核验与临时 project 定向复现，该发现成立；它属于 Story 11.1 的 Functional Anchor 缺口，不是 Story 11.2/11.3 consumer migration，也不是单纯 Guidance/future concern。评估结论为 CR 不通过，授权 bounded fixer 修复该 P1。

---

## 发现 #1 评估

### 审查原文

> **[中] `resolveArtifactRootsFromProjectConfig()` 丢失 merged config provenance，`configSources` 始终为空**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer 对实际代码路径的描述准确。`src/config/artifact-root-resolver.ts:43-48` 已把 `configSources?: Record<string, ResolverSourceMetadata>` 暴露在 resolver result model 中；`src/config/artifact-root-resolver.ts:160-185` 的 `resolveArtifactRootsFromProjectConfig()` 调用 `resolveProjectConfig({ projectRoot: input.projectRoot })` 后直接把 `configResult.sources` 返回为 `configSources`。问题在于该调用没有传入 dotted keys。

底层来源映射确实按 leaf dotted key 建立：`src/config/customization-reader.ts:96-103` 通过 `collectTomlLeafKeys()` 把每个 TOML leaf key 写入 `sources`；但 `src/config/customization-reader.ts:111-118` 又调用 `selectSourceMetadata()` 过滤 sources，而 `src/config/customization-reader.ts:243-257` 在 `requestedKeys.length === 0` 时只使用 `Object.keys(selectedValue)`，即 `core`、`modules` 这类顶层 key。由于 sources map 中保存的是 `core.output_folder`、`modules.sdlc.analysis_artifacts` 等 leaf dotted key，full-read nested config 的 source metadata 会被过滤成 `{}`。

`src/config/config-reader.ts:11-20` 允许调用方传 `keys?: string[]`，并在 `src/config/config-reader.ts:21-47` 定义了四层 config merge；因此问题不是 merge layer 不存在，而是 Story 11.1 wrapper 没有稳定拿到 full-read provenance。

我用系统临时目录独立复现：`_speclite/config.toml` 提供 legacy base config，`_speclite/custom/config.toml` 显式覆盖 `modules.sdlc.analysis_artifacts = "team/analysis"`；调用当前源码 `resolveArtifactRootsFromProjectConfig({ lifecycle: "existing" })` 后，`analysis_artifacts` root 正确解析为 `team/analysis` 且 mode 为 `explicit-config`，但返回 `configSources: {}`。这与 Reviewer 的定向复现一致。

Story 层面也确认该要求不是误读。AC 5 在 `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:52-58` 要求 result 可被 installer、manifest、validator 或 workflow 复用，至少提供稳定 `field`、`placeholder`、`resolvedRoot` 与 `resolutionMode`；Task 4 在 `:99-104` 要求复用既有 TOML four-layer merge；Task 6 在 `:111-114` 要求导出稳定 resolver API/model 供 Story 11.2/11.3 消费；Dev Notes 在 `:127-133` 明确指出 `resolveProjectConfig()` 当前不返回 root/mode、`resolveTomlLayers()` 是当前 TOML merge/provenance 实现且不得重写；Project Structure Notes 在 `:166-170` 明确要求 `src/config/config-reader.ts` 或相邻 wrapper “提供 merged config/provenance 到 artifact-root resolver 的稳定接入点”。Story 的 Anchor Contract Map 在 `:198-199` 把 single config-owned resolver/model 与 four-layer TOML merge列为 Functional Anchor，缺失为 `FAIL_FUNCTION`。

额外契约也支持该判断。`_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:47` 要求 source path 必须来自 selected dotted key 的 effective source metadata；`:102-115` 固定 config merge order 与 portable path 语义。`_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md:57-65` 要求 installer、manifest generator、validator 和 workflow consumer 使用同一 resolved artifact-root model，不能各自维护第二套 root/path 语义；`:191-194` 要求 config/customization merge logic 集中在 `src/config/`，artifact path consumer 复用统一 resolver。`_bmad-output/planning-artifacts/ux-design-specification.md:803-824` 的 Artifact Evidence Card 要展示 `resolvedRoot`、`resolutionMode` 与 `actualConsumedPath`，`:834` 要求 Ready Summary、Filesystem Space Map 与 Artifact Evidence Card 共享同一 resolved-root model、compatibility label 与 diagnostic source。缺失 provenance handoff 会迫使后续 consumer 重新推导来源层，违背 Story 11.1 的地基交接目的。

现有 focused test 没有覆盖这个失败面。`test/artifact-root-resolution.test.ts:248-280` 只断言 `resolveArtifactRootsFromProjectConfig()` 能通过四层 config reader 得到正确 root 和 mode，未断言 `configSources`；`test/resolve-readers.test.ts:39-59` 证明传入 explicit dotted keys 时 `sources` 可返回正确 `affectedPath` / `role`，但没有证明 no-key full-read 的 nested config source metadata 保留。

**严重性判断：合理，评估为 P1**

原始严重性为 `[中]`，作为 runtime correctness 本身不影响 roots/modes 的解析成功，因此不是 P0。但本 Story 是 Epic 11 strict-serial 的 foundational Story；Story 11.1 自身要求输出可复用 resolver API/model 与 merged config/provenance handoff。该缺口位于 `src/config/` 的 Functional Anchor，后续 Story 11.2/11.3 只能消费前序 Story 已建立的 contract/evidence，不能反向补成立 11.1。因此它阻塞 Story 11.1 交付，应评估为 P1。

**修复建议：可行**

建议授权 bounded fixer 在现有 `resolveTomlLayers()` / `resolveProjectConfig()` provenance 语义上修复，不重写 merge logic。可接受实现方向包括：

- 修复 full-read source metadata selection，使未传 `keys` 时按 selected nested config 的 leaf dotted keys 返回 source metadata，而不是只按顶层 key 过滤。
- 或在 `resolveArtifactRootsFromProjectConfig()` / 相邻 wrapper 中稳定请求或映射七类 artifact root 及 legacy fallback 输入所需的 effective dotted key source metadata，同时保持 `resolveArtifactRoots()` pure resolver 不直接读取文件。

必须补 focused regression：

- 在 `test/artifact-root-resolution.test.ts` 中扩展 project-config handoff case，断言 team custom 覆盖 `modules.sdlc.analysis_artifacts` 时，`configSources` 能指向 `_speclite/custom/config.toml` 和对应 role。
- 覆盖 legacy fallback provenance：`brainstorming_artifacts` fallback 依赖 `core.output_folder`，`analysis_artifacts` / `solutioning_artifacts` fallback 依赖 `modules.sdlc.planning_artifacts`，必须能从 handoff 中定位 effective source key 或 source layer。
- 在 `test/resolve-readers.test.ts` 中补 no-key full-read source metadata regression，防止 `selectSourceMetadata()` 再次退化为只返回顶层 key。

修复后至少运行：

- `npx vitest run test/artifact-root-resolution.test.ts test/resolve-readers.test.ts`
- `npm run build`
- `git diff --check`
- 若修改 `src/config/customization-reader.ts` 的通用 source selection 行为，运行 `npm test` 作为共享 resolver 回归。

**误报评估：非误报**

这不是因为 Story 11.2/11.3 尚未消费 resolver 而产生的 future-only concern。Story 11.1 已经导出 `resolveArtifactRootsFromProjectConfig()`，并在 Story File List 与 Anchor Evidence Summary 中把该 wrapper 作为 consumer handoff 的完成证据；当前 wrapper 返回的 `configSources` 为空，说明 11.1 自身的 handoff 证据不完整。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `resolveArtifactRootsFromProjectConfig()` 丢失 merged config provenance，`configSources` 为空 | [中] | **P1** | Story 11.1 明确要求 resolver project-config handoff 保留 merged config/provenance；当前实现未满足 Functional Anchor，阻塞交付。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮无需要转入 CR TODO 的 finding。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮无误报。 |

### 评估决定

- **发现 #1（project-config handoff 丢失 merged config provenance）**：确认有效，CR 不通过，授权 fixer 执行 bounded P1 修复。
- **允许修改的 bounded source scope**：`src/config/artifact-root-resolver.ts`、`src/config/config-reader.ts`、`src/config/customization-reader.ts`。优先保持现有 API/model，使用既有 `configSources` / `ResolverSourceMetadata`，不得新增第二套 merge logic。
- **允许修改的 bounded test scope**：`test/artifact-root-resolution.test.ts`、`test/resolve-readers.test.ts`。测试必须覆盖 team/user custom layer provenance 与 legacy fallback provenance。
- **Story evidence scope**：默认不授权修改 Story、Flow Gate、tracker、SPEC、Epic、public schema、installer projection、manifest projection、module metadata、fresh-install snapshots 或 Story 11.2/11.3 consumer surfaces。仅当 fixer 因实际修复需要补充本轮 CR fix summary 时，可按 CR03 规则写回本 evaluation 文件的修复摘要；Story/Flow Gate/tracker 更新应留给后续 finalizer 或外层编排明确授权。
- **用户决策点**：无。该问题已有明确 bounded patch path，不需要产品或 scope 决策。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-02
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 1

#### 修复项 #1：`resolveArtifactRootsFromProjectConfig()` 丢失 merged config provenance

- **处理结果**: 已修复。
- **源码修改**: `src/config/customization-reader.ts` 的 `selectSourceMetadata()` 在 no-key full-read 时改为按 selected nested value 的 leaf dotted keys 选择 source metadata；显式 `keys` 请求仍保持原有扁平 key selection 语义。未重写 four-layer merge logic，未新增第二套 provenance 语义。
- **测试修改**: `test/resolve-readers.test.ts` 新增 no-key full-read regression，证明 nested config 会返回 `core.output_folder`、`modules.sdlc.planning_artifacts`、team custom `modules.sdlc.analysis_artifacts` 与 user custom `modules.sdlc.project_knowledge` 的 leaf source metadata，且不返回顶层 `core` / `modules` metadata。`test/artifact-root-resolution.test.ts` 扩展 project-config handoff case，证明 team custom root override、user custom root override，以及 legacy fallback 所需的 `core.output_folder` / `modules.sdlc.planning_artifacts` effective source 均可从 `configSources` 定位。
- **验证结果**:
  - `npx vitest run test/artifact-root-resolution.test.ts test/resolve-readers.test.ts`: 通过，2 个 test file / 12 个 tests passed。
  - `npm run build`: 通过。
  - `git diff --check`: 通过。
  - `npm test`: 已按通用 reader 行为变更运行；60/61 个 test files 通过，473 个 tests 通过，4 个 todo。唯一失败为范围外 `test/contract-anchors.test.ts` 仍断言 full-read `sources: {}`，与本轮已修复的 full-read leaf provenance 语义冲突；按 bounded test scope 未修改该文件。
- **范围外生成物处理**: `npm run build` 生成了范围外 `release/packaging-manifest.json` 的 `packageHash` 变化，已精确恢复。
- **未修复项 / 范围外阻塞**: 本轮授权 P1 finding 已修复；完整测试剩余的 `test/contract-anchors.test.ts` anchor expectation 更新需要外层另行授权。
