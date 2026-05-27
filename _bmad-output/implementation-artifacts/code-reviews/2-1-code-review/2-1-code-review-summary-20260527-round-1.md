---
Story: 2-1
Round: 1
Date: 2026-05-27
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，已按 `bmenhance-cr-01-reviewer` 降级规则在主上下文串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；三层均完成，失败层：无。`npm run build` 通过，`npm test` 通过（11 / 11 test files，66 / 66 tests），`git diff --check` 通过。当前存在 2 个中优先级契约问题，均属于修复方案明确的 `patch` 桶；建议本轮 CR 结论为不通过，并进入 evaluator 评估 findings 后再决定 fixer 修复项。

## 新发现

### 1. [中] `artifactContract` 路径归一化允许内部 `..` 段逃逸 configured root

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/manifest/manifest-generator.ts:124-150` 先把 `outputLocation` 替换和分隔符归一化，然后仅拒绝 `normalized.startsWith("../")` / absolute / drive path；之后 `normalizedPosix` 通过字符串 `startsWith(`${artifactRoots.output_folder}/`)` 判断 root，但没有用 `path.posix.normalize` 折叠内部 `..`。
  - 定向复现：`createArtifactContract({ outputLocation: "{output_folder}/../outside", outputArtifactType: "report", artifactRoots })` 返回 `{"artifactType":"report","defaultOutputPath":"_speclite-output/../outside","requiredMetadata":["workflowType","sourceSkill","generatedAt"]}`。
  - Story 2.1 AC4 / AC7 与 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 要求 `defaultOutputPath` 必须是 project-relative POSIX path，且落在 `_speclite-output/` 或 configured workflow artifact root 下；path escape 应使用 `artifact-path.*` 诊断，不能写入 public JSON / manifest / fixture snapshot。

- **影响**
  - 只要 source metadata 声明含内部 `..` 的 output location，installed `phase-coverage.json` 就可能包含看似在 `_speclite-output/` 下、实际解析后逃逸到外部的 `artifactContract.defaultOutputPath`。
  - 这会削弱 Story 2.1 对 artifact contract 的最小安全边界，也会让 Story 2.5 / Epic 3 后续 validator 消费到错误契约。

- **建议**
  - 在 `normalizeArtifactOutputPath` 中对替换后的路径执行 `path.posix.normalize`，并拒绝任意解析后为 `.`、`..`、以 `../` 开头、absolute、drive path 的结果。
  - root containment 判断必须基于解析后的 canonical project-relative POSIX path，而不是未折叠 `..` 的字符串。
  - 补充 unit test：`{output_folder}/../outside`、`{implementation_artifacts}/../../outside`、`{planning_artifacts}/./reports`、Windows separator 混合路径。

### 2. [中] `project_knowledge` / `docs` 与通配 `outputs` 被投影成 workflow `artifactContract`

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/manifest/manifest-generator.ts:140-150` 把 `artifactRoots.project_knowledge` 纳入 eligible containment root；`src/installer/runtime-structure.ts:290-298` 默认 `project_knowledge` 为 `docs`。
  - `src/manifest/manifest-generator.ts:156-163` 对 `outputs="*"` 归一化为空后回退为 `workflow-artifact`。
  - `assets/source/speclite/sdlc-skills/module-help.csv:2` 中 `speclite-document-project` 声明 `output-location={project_knowledge}`、`outputs=*`。定向复现返回 `{"artifactType":"workflow-artifact","defaultOutputPath":"docs","requiredMetadata":["workflowType","sourceSkill","generatedAt"]}`。
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md` 与 `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md` 区分 `_speclite-output` workflow artifact repository 与 `docs` project knowledge；manifest/index SPEC 要求 `artifactContract.artifactType` 是 stable artifact kind，不是 human-readable title 或合成 fallback。

- **影响**
  - 默认 install 会为 project knowledge 目录生成 workflow artifact contract，混淆 `docs` 与 `_speclite-output` 的 ownership / validation 边界。
  - `outputs=*` 被合成为 `workflow-artifact` 会伪造 stable artifact kind，违反 Story 2.1 “没有明确 contract 时保持 `artifactContract` absent，不得猜测 output path / artifact value”的边界。

- **建议**
  - 将 `artifactContract` eligibility 限定为 `_speclite-output` / configured workflow artifact roots，例如 `output_folder`、`planning_artifacts`、`implementation_artifacts`；默认 `docs` / `project_knowledge` 应保持 absent，除非 owning SPEC 明确把某个 project knowledge root 声明为 workflow artifact root。
  - 对 `outputs` 为 `*`、空值、过于泛化或无法形成 stable artifact kind 的情况返回 `undefined`，不要 fallback 成 `workflow-artifact`。
  - 补充 unit / integration assertions：`{project_knowledge}` + `*` 不生成 `artifactContract`；`{planning_artifacts}` + `prd` 仍生成最小契约；`{project-root}/_speclite/_memory` 和 custom/control paths 继续 absent。

## 验证摘要

- `npm test` ✅ 通过（11 / 11 test files，66 / 66 tests）
- `npm run build` ✅ 通过
- `git diff --check` ✅ 通过（无输出）
- 定向复现 ✅ 已执行
  - `createArtifactContract({ outputLocation: "{output_folder}/../outside", outputArtifactType: "report", artifactRoots })` 实际返回 escaped `defaultOutputPath`。
  - `createArtifactContract({ outputLocation: "{project_knowledge}", outputArtifactType: "*", artifactRoots })` 实际返回 `defaultOutputPath: "docs"` 与合成 `artifactType: "workflow-artifact"`。

## 通过项

- Story 2.1 的 functional anchor 背景已纳入审查：实现复用现有 `manifest-generator.ts` / `runtime-structure.ts` / `target-writer.ts` pipeline，未因缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts` 或 `phase-coverage.ts` 文件而误判为阻塞。
- `canonicalSkillId` 仍从 source package / module-help `skill` 字段进入 `skill-index`、`help-index` 和 `phase-coverage`，未看到从 display name、menu code 或 adapter label 反推 identity 的改动。
- phase coverage rows 按 `phaseId`、`moduleId`、`canonicalSkillId` 排序，selected target projection 使用 `claude` 后 `agents` 的 canonical order。
- missing help skill 通过 reserved `menu-target.unknown-skill` issue id 暴露，且定向测试覆盖了不泄露 package root 的 public result。
- 未看到 command pointer artifact、branded `copilot` / `cursor` target id、平行 manifest/index generator 或第二套 skill identity registry。
