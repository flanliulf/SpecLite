---
Story: 2-1
Round: 1
Date: 2026-05-27
Model Used: GPT-5.5
Review Source: 2-1-code-review-summary-20260527-round-1.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查共提出 2 个中级 `patch` 类发现，分别涉及 `artifactContract.defaultOutputPath` path escape 归一化缺口，以及 `project_knowledge` / `docs` 与通配 `outputs="*"` 被错误投影为 workflow `artifactContract`。经独立代码验证与 SPEC 对照，2 个发现均确认有效，均应作为阻塞交付修复项进入 fixer。

---

## 发现 #1 评估

### 审查原文

> **[中] `artifactContract` 路径归一化允许内部 `..` 段逃逸 configured root**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/manifest/manifest-generator.ts:114-124` 仅替换 root placeholder、统一分隔符和压缩重复 `/`，随后在 `src/manifest/manifest-generator.ts:125-133` 只拒绝 `.`、`..`、前缀 `../`、absolute path 和 Windows drive path。关键问题在 `src/manifest/manifest-generator.ts:135-150`：`normalizedPosix` 只是过滤空 segment 和 `.`，没有折叠内部 `..`，随后用字符串 `startsWith` 判断是否仍在 `artifactRoots.output_folder` / `planning_artifacts` / `implementation_artifacts` / `project_knowledge` 下。

独立复现结果确认：`createArtifactContract({ outputLocation: "{output_folder}/../outside", outputArtifactType: "report", artifactRoots })` 当前返回 `defaultOutputPath: "_speclite-output/../outside"`，不是 `undefined`。这与 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:125-127` 的要求冲突：`defaultOutputPath` 必须是 project-relative POSIX path，且必须落在 `_speclite-output/` 或 configured workflow artifact root 下；path escape 不得写入 manifest/index 或 fixture snapshots。

**严重性判断：合理**

原始严重性为中级是合理的。该问题不会直接写文件，但会把解析后逃逸 configured root 的路径发布到 installed manifest/index public contract 中，破坏 Story 2-1 建立的 artifact contract 边界，并可能让后续 Story 2-5 / Epic 3 validator 消费错误契约。按本评估模板优先级定义，它属于功能契约和质量门禁缺陷，评估为 P1 阻塞交付。

**修复建议：可行**

reviewer 建议在 `normalizeArtifactOutputPath` 中使用 `path.posix.normalize` 折叠替换后的路径，并基于 canonical project-relative POSIX path 做 root containment 判断。该方向可行，且应补充 reviewer 指出的内部 `..`、混合 separator、合法 `./` 路径测试。实现时还需要确保 `path.posix.normalize` 产生的 `"."`、`".."`、`../*`、absolute 和 drive path 继续被拒绝。

**误报评估：非误报**

非误报。代码路径、SPEC 约束和独立复现三者一致证明该发现真实存在。

---

## 发现 #2 评估

### 审查原文

> **[中] `project_knowledge` / `docs` 与通配 `outputs` 被投影成 workflow `artifactContract`**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/installer/runtime-structure.ts:290-298` 将 `project_knowledge` 默认解析为 `docs`。`src/manifest/manifest-generator.ts:140-150` 又把 `artifactRoots.project_knowledge` 纳入 eligible containment root，因此 `{project_knowledge}` 会被视为可生成 `artifactContract.defaultOutputPath` 的合法路径。与此同时，`src/manifest/manifest-generator.ts:156-163` 对 `outputArtifactType` 做 slug normalize；当原值为 `*` 时会被清空，然后回退为 `"workflow-artifact"`。

资产数据证据也成立：`assets/source/speclite/sdlc-skills/module-help.csv:3` 中 `speclite-document-project` 声明 `output-location={project_knowledge}`、`outputs=*`。独立复现结果确认：`createArtifactContract({ outputLocation: "{project_knowledge}", outputArtifactType: "*", artifactRoots })` 当前返回 `defaultOutputPath: "docs"` 和 `artifactType: "workflow-artifact"`。

该行为与 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:121-127` 冲突：`artifactContract` 是 workflow artifact minimum contract；`artifactType` 必须是 stable artifact kind；`defaultOutputPath` 必须落在 `_speclite-output/` 或 configured workflow artifact root 下。`docs` / `project_knowledge` 是 project knowledge 目录，不应默认被投影为 workflow artifact repository。`src/ide/target-writer.ts:96-123` 会把 `createArtifactContract` 的结果直接写入 `phaseCoverageRows`，因此不是孤立 helper 问题。

**严重性判断：合理**

原始严重性为中级合理。该问题会在默认 install / discovery metadata 中产生错误 public contract，混淆 `docs` project knowledge 与 `_speclite-output` workflow artifact repository 的 ownership / validation 边界；同时 `outputs="*"` 被合成为 stable-looking `workflow-artifact`，违背“没有明确 contract 时保持 absent”的边界。按质量门禁缺陷评估为 P1 阻塞交付。

**修复建议：可行**

reviewer 建议将 `artifactContract` eligibility 限定为 `_speclite-output` / configured workflow artifact roots，并让 `outputs` 为 `*`、空值或无法形成 stable artifact kind 时返回 `undefined`。该方向可行。修复时建议保留 `{planning_artifacts}` / `{implementation_artifacts}` / `{output_folder}` 的正常 contract 生成，同时为 `{project_knowledge}` + `*`、`{project-root}/_speclite/_memory` 等非 workflow artifact 路径补回归断言。

**误报评估：非误报**

非误报。实现、source metadata 和独立复现均支持该发现；reviewer 对影响面的判断与 owning SPEC 一致。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `artifactContract` 内部 `..` 未 canonicalize，允许 defaultOutputPath 解析后逃逸 configured root | [中] | **P1** | 破坏 workflow artifact root containment，错误路径会进入 public manifest/index contract。 |
| 2 | `{project_knowledge}` / `docs` 与 `outputs="*"` 被生成 workflow `artifactContract` | [中] | **P1** | 混淆 project knowledge 与 workflow artifact repository，并合成不稳定 artifact kind。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有建议延迟处理的非阻塞 CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮没有误报。 |

### 评估决定

- **发现 #1（`artifactContract` 路径归一化允许内部 `..` 段逃逸 configured root）**：确认有效，P1 阻塞，应进入 fixer 修复。修复重点是 canonical POSIX path 归一化与 root containment 判断，并覆盖内部 `..` 回归测试。
- **发现 #2（`project_knowledge` / `docs` 与通配 `outputs` 被投影成 workflow `artifactContract`）**：确认有效，P1 阻塞，应进入 fixer 修复。修复重点是 artifact contract eligibility 边界和泛化 `outputs` 不生成 contract 的规则，并覆盖默认 source metadata 回归测试。
- **整体决定**：CR 评估不通过。建议进入 `bmenhance-cr-03-fixer`，仅修复上述 2 个 P1 阻塞项；暂不进入 finalizer。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-27
- **Model Used**: GPT-5.5
- **Fix Items**: 2

#### 修复项 1：`artifactContract` 内部 `..` path escape

- **修改文件**: `src/manifest/manifest-generator.ts`、`test/manifest-discovery.test.ts`
- **执行结果**: 已修复。
- **关键差异**: `normalizeArtifactOutputPath` 改为通过 canonical POSIX path 归一化折叠内部 `..`、混合 separator 和合法 `./`，再执行 workflow artifact root containment 判断；`{output_folder}/../outside` 现在返回 `undefined`，不会写入 `artifactContract.defaultOutputPath`。
- **回归覆盖**: 新增 `{output_folder}/../outside` 逃逸路径断言，并保留合法 `{output_folder}/./reports\\weekly` 可归一到 `_speclite-output/reports/weekly` 的断言。

#### 修复项 2：`{project_knowledge}` / `docs` + `outputs="*"` 错误生成 workflow `artifactContract`

- **修改文件**: `src/manifest/manifest-generator.ts`、`test/manifest-discovery.test.ts`
- **执行结果**: 已修复。
- **关键差异**: `artifactContract` eligibility 仅基于 `output_folder`、`planning_artifacts`、`implementation_artifacts` 这些 workflow artifact roots；`project_knowledge` 不再作为独立 eligible root。`normalizeArtifactType` 不再把 `*` 或其他无法形成 stable slug 的值回退成 `workflow-artifact`，而是返回 `undefined` 并省略 contract。
- **回归覆盖**: 新增 `{project_knowledge}` + `*`、`{planning_artifacts}` + `*`、`{project-root}/_speclite/_memory` 断言，确认非 workflow artifact path 或不稳定 artifact type 不生成 `artifactContract`。

#### 验证结果

- `npm test -- test/manifest-discovery.test.ts`: 通过，1 个测试文件、3 个测试通过。
- `npm test -- test/runtime-structure.test.ts`: 通过，1 个测试文件、7 个测试通过。
- `npm test`: 通过，11 个测试文件、67 个测试通过。
- `git diff --check`: 通过。

#### 阻塞状态

- 本轮 evaluation 确认的 2 个 P1 阻塞项均已修复；未发现仍需 fixer 处理的阻塞项。
