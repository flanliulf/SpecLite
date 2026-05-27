---
Story: 2-4
Round: 1
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 2-4-code-review-summary-20260527-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-4 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 提出的 2 个中优先级契约问题均经代码验证确认有效，应阻塞交付并交由 fixer 修复；1 个低优先级 fixture 可审阅性问题属实，但不影响当前 resolver 行为正确性，建议纳入 CR TODO 跟踪。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] `ResolveMergeResultSchema` 无法解析实际 resolver result**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/config/resolve-output-schema.ts:8-14` 将 `ResolveMergeResultSchema` 定义为严格对象，字段为 `value`、`diagnostics`、`exitCode`。但实际 resolver result 类型在 `src/config/customization-reader.ts:9-13` 定义为 `value`、`issues`、`exitCode`，`resolveTomlLayers()` 在 `src/config/customization-reader.ts:80-99` 的失败和成功路径均返回 `issues`。`resolveProjectConfig()` 也复用 `ResolverResult`，见 `src/config/config-reader.ts:4-17`。

已做只读定向复现：对 `resolveProjectConfig()` 的实际返回值执行 `ResolveMergeResultSchema.safeParse(...)`，结果失败；返回对象 keys 为 `value`、`issues`、`exitCode`，schema 报告缺少 `diagnostics` 且 `issues` 是未识别 key。Reviewer 的复现结论属实。

**严重性判断：合理**

Story 2.4 的 resolver schema anchor 应能约束真实 merge result。如果 anchor 无法解析真实实现，后续消费者和测试会围绕不存在的 `diagnostics` 字段建立错误契约；这是功能契约漂移，不是文档或命名风格问题。按中优先级、阻塞交付处理合理。

**修复建议：可行**

统一字段名即可修复。建议 fixer 优先让 schema 与当前 command/runtime 统一到同一命名，并新增直接解析 `resolveProjectConfig()` 或公开 adapter result 的测试，防止再次漂移。

**误报评估：非误报**

有源码行号和定向复现支撑，非误报。

---

## 发现 #2 评估

### 审查原文

> **[中] installed skill fixture 仍正向断言 legacy Python resolver 路径**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Resolve contract 明确要求 `speclite resolve customization` 支持显式 `--project-root`，且 installed skill instructions 应显式传入它，见 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:70-81`。当前命令实现已经提供新 runtime command：`src/commands/resolve.ts:45-63` 注册 `resolve customization`，要求 `--skill`，并支持 `--project-root`。

但 installed skill source 仍描述 legacy Python resolver path：`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md:20-21` 写明执行 `{speclite-runtime-root}/scripts/resolve_customization.py`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/activation.md:13-19` 也要求执行 `python3 {speclite-runtime-root}/scripts/resolve_customization.py --skill {skill-root} --key workflow`。对应 fixture test 在 `test/skill-artifact-loop.test.ts:49-55` 正向断言 installed skill 包含 `{speclite-runtime-root}/scripts/resolve_customization.py`。

**严重性判断：合理**

这是 release-gate activation contract 与 Story 2.4 新 runtime command 的不一致。测试虽然在 `test/skill-artifact-loop.test.ts:73-85` 额外验证 `speclite resolve customization` 可调用，但仍保留 legacy path 为通过证据，无法证明 installed activation 已迁到新命令。考虑本仓库已有裸 `python3`/`tomllib` 不稳定背景，该问题会保留 Story 2.4 要消除的运行时风险。按中优先级、阻塞交付处理合理。

**修复建议：可行**

建议 fixer 将 Story 2.4 覆盖的 installed activation instruction 改为 `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`，并调整 `test/skill-artifact-loop.test.ts` 为正向断言新 command、负向断言 legacy Python resolver path。若保留 fallback 说明，也不应把 legacy path 作为主 activation contract 或通过证据。

**误报评估：非误报**

契约、source skill instruction 和 fixture test 三方证据一致，非误报。

---

## 发现 #3 评估

### 审查原文

> **[低] `resolve-parity` fixture 目录本身没有承载 parity cases**
> - 来源：auditor
> - 分类：patch

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

Contract 要求 `resolve-parity` 作为 MVP release gate fixture 覆盖 config/customization merge、repeated key、missing key、optional/required failure、array semantics、non-ASCII、explicit project root 和 fallback search，见 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:134-152`。当前 fixture 目录的 `test/fixtures/resolve-parity/README.md:1-5` 只说明测试会临时创建项目树，`test/fixtures/resolve-parity/fixture-case.json:1-5` 只包含 case metadata。实际输入和断言主要内联在 `test/resolve-cli.test.ts:1-164` 与 helper `createResolveParityFixture()` 的 `test/resolve-cli.test.ts:201-259`。

**严重性判断：偏高但仍有效**

Reviewer 原始严重性为低，方向合理；但是否应阻塞本轮交付需要区分。现有测试已经覆盖主要 resolver behavior：纯 stdout JSON、repeated/missing key、optional warning、required failure、customization explicit/fallback 和 fixture metadata。该发现主要影响 release-gate fixture 的独立审阅和复用，不直接证明 resolver 行为错误。因此不应作为 fixer 阻塞项，建议进入 CR TODO。

**修复建议：可行但非必要**

将 parity case 输入和 expected semantic result 从 helper 外提到 `test/fixtures/resolve-parity/` 是可行改进；但这会扩大 fixture 组织变更范围。建议由后续 TODO 或 Epic 6 fixture ownership 统一处理，而不是在本轮阻塞 Story 2.4。

**误报评估：非误报**

发现属实，但影响级别低于前两个契约问题，评估为非阻塞 TODO。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `ResolveMergeResultSchema` 与实际 resolver result 字段不一致 | [中] | **P1** | Schema anchor 无法解析真实 result，会形成错误 executable contract。 |
| 2 | installed skill activation 仍正向断言 legacy Python resolver path | [中] | **P1** | Installed activation contract 未迁到 `speclite resolve customization --project-root`，保留运行时不稳定风险。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | `resolve-parity` fixture 目录只有 metadata，cases 内联在测试 helper 中 | [低] | **P2** | Fixture 可审阅性不足属实，但现有行为测试覆盖较好，不阻塞本轮交付。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`ResolveMergeResultSchema` 字段漂移）**：确认有效，必须由 fixer 修复，并补 schema 与真实 resolver result 同步的测试。
- **发现 #2（installed activation legacy Python path）**：确认有效，必须由 fixer 修复；主 activation instruction 和 release-gate fixture 断言应转向 `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`。
- **发现 #3（`resolve-parity` fixture 可审阅性不足）**：确认有效但非阻塞，建议纳入 CR TODO 跟踪，后续统一改造 fixture case manifest 和 expected semantic result。

本轮 evaluator 结论：不通过。需要执行 fixer，但 fixer 范围仅限发现 #1 和发现 #2；发现 #3 不要求本轮修复。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-27
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 2

#### 修复项 #1：`ResolveMergeResultSchema` 字段漂移

- **状态**: 已修复
- **改动**: `src/config/resolve-output-schema.ts` 将 merge result schema 字段从 `diagnostics` 调整为实际 resolver result 的 `issues`，保持 strict schema。
- **测试**: `test/contract-anchors.test.ts` 新增直接调用 `resolveProjectConfig()` 的 schema anchor，确认真实返回对象可被 `ResolveMergeResultSchema` 解析。

#### 修复项 #2：installed activation legacy Python path

- **状态**: 已修复
- **改动**: `speclite-dev-story` activation 主说明、`references/activation.md` 与 `workflow.on_complete` 解析命令改为 `speclite resolve customization --skill {skill-root} --project-root {project-root}`；fixture 断言改为正向验证新 command、负向验证 legacy Python resolver path。
- **测试**: `test/skill-artifact-loop.test.ts` 覆盖 installed `SKILL.md`、`references/activation.md` 与 `references/workflow-steps.md` 的 activation command；fresh install expected hash 已随安装产物内容变更同步。

#### 验证命令

- `npm test -- test/contract-anchors.test.ts test/skill-artifact-loop.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts`：通过，4 files / 15 tests。
- `npm test -- test/runtime-structure.test.ts test/skill-artifact-loop.test.ts test/contract-anchors.test.ts`：通过，3 files / 12 tests。
- `npm run build`：通过。
- `npm test`：通过，17 files / 99 tests。
- `git diff --check`：通过。

✅ CR 修复执行完成，修复记录已追加到评估文件。
