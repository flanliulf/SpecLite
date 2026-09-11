---
Story: 11-2
Round: 1
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。focused tests、canonical source warn/strict check、packaging check、build、full test 与 `git diff --check` 均通过；验证命令未引入额外 drift。当前建议不通过并进入 Evaluator：发现 2 个 `[中]` 问题，均属于 `patch` 桶。其中 1 个是 ReadyCheck 对 fresh manifest / CommandResult 七 root projection 的一致性校验缺口；1 个是 D1 current public docs 仍发布旧 fresh defaults。

三层审查执行说明：当前上下文无法发起内部 parallel review agents，已按 Skill 降级为串行执行 blind / edge / auditor 三层审查方法；未发现方法层 skipped。独立 Acceptance Auditor skill package 不存在，验收审计按 `bmad-code-review` 内置 prompt 内联执行。`failed_layers`: `parallel-agent-dispatch-unavailable`, `standalone-acceptance-auditor-skill-missing`。

## 新发现

### 1. [中] ReadyCheck 可在 fresh manifest 缺失或错配 `artifactRoots[]` 时仍通过

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `SPEC 01` 已声明 `CommandPathSummary.artifactRoot` 必须保留，`artifactRoots` 是 optional additive projection；当存在时顺序固定为七 root registry 顺序（`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:612-617`, `675-679`）。
  - `SPEC 04` 同样声明 manifest `artifactRoot` 保留，`artifactRoots?: ArtifactRootProjection[]` 是 `speclite.manifest.v1` optional additive field，不要求 version bump；当存在时顺序固定（`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:113-124`）。
  - `runReadyCheck()` 当前先从 command input 复制 `paths.artifactRoots`，只有在 manifest 自身存在 `paths.artifactRoots` 时才覆盖；缺失时不会失败，也不会记录 fresh manifest projection 缺失（`src/installer/ready-check.ts:127-133`, `277-292`）。
  - ReadyCheck 的 runtime path 检查只验证 `readyPaths.artifactRoots[].resolvedRoot` 是否存在，不比较 command input 与 manifest projection 是否一致，也不校验 manifest projection 完整性/唯一性（`src/installer/ready-check.ts:134-140`）。
  - 定向复现 1：fresh install 后删除 `_speclite/_config/manifest.yaml` 的 `paths.artifactRoots`，再调用 `runReadyCheck()`；实际输出 `{"hadArtifactRoots":true,"readyOk":true,"issueId":null,"returnedArtifactRoots":7}`。预期应能在 fresh install 场景发现 manifest projection 缺失，至少不能声称 manifest / ReadyCheck projection 一致。
  - 定向复现 2：fresh install 后将 manifest 第一个 root 的 `resolvedRoot` 从 `_speclite-output/0-brainstorming-artifacts` 改为已存在的 `_speclite-output/1-analysis-artifacts`，再调用 `runReadyCheck()`；实际输出 `{"readyOk":true,"issueId":null,"commandFirst":"_speclite-output/0-brainstorming-artifacts","readyFirst":"_speclite-output/1-analysis-artifacts"}`。预期应检测 manifest 与 command result 七 root projection 不一致。

- **影响**
  - Story 11.2 的 completion claim 要求 config / runtime / manifest / CommandResult / ReadyCheck / Ready Summary 消费同一 Story 11.1 registry/resolver，并保持七 root path/mode/ownership/contractRefs 一致；当前 ReadyCheck 会掩盖 fresh manifest 缺失或错配 projection 的 installed-state drift。
  - 这不破坏旧 consumer 对 legacy `artifactRoot` 的 backward compatibility，但会削弱 fresh install 的 manifest/index/Ready Summary gate 可信度。

- **建议**
  - 在 `runReadyCheck()` 中增加 projection reconciliation：当 command input 已携带 `paths.artifactRoots`，manifest 缺失或 manifest projection 与 input projection 不完全一致时，应返回稳定 `ValidationIssue`，或至少在 fresh install / install lifecycle 调用路径强制失败。
  - 补充 regression：manifest 缺失 `artifactRoots[]`、manifest 七 root 顺序/字段/`resolvedRoot` 错配但目录存在、重复 root path 三类场景。旧 manifest 兼容可以通过调用方 lifecycle/context 明确豁免，而不是让 fresh install 静默回填。

### 2. [中] D1 current public docs 仍发布旧 fresh defaults

- **来源**：auditor
- **分类**：patch

- **证据**
  - Canonical governance 将 `docs/**`、`README.md`、`assets/source/speclite/README*.md` 归为 `current-public-docs` D1，并要求 current user-facing docs 反映 runtime、install、module、hook、workflow behavior 变化（`assets/source/speclite/canonical-governance.json:59-72`）。
  - 本轮开发记录已承认 D1 docs drift 真实存在但被 skipped：`docs/quick-start.md`、`docs/reference/workflow-artifact-layout.md`、`docs/explanation/speclite-modules.md` 等仍含旧 fresh defaults；原因是这些文件不在 Story 11.2 file authorization 内（`_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/EXPERIMENT_NOTES.md:19-31`）。
  - 当前 docs 仍写旧 fresh defaults：`docs/quick-start.md` 仍列 `planning_artifacts=_speclite-output/planning-artifacts`、`implementation_artifacts=_speclite-output/implementation-artifacts`、`project_knowledge=docs`（`docs/quick-start.md:150-161`）。
  - `docs/reference/workflow-artifact-layout.md` 仍描述三类 SDLC root 从 `core.output_folder` 派生，并把 `project_knowledge` 默认写为 `{project-root}/docs`（`docs/reference/workflow-artifact-layout.md:34-42`）。
  - `docs/reference/config-and-customization.md` 仍只列旧 `[modules.sdlc]` 四字段（`docs/reference/config-and-customization.md:20-26`）；`docs/explanation/speclite-modules.md` 仍只列旧四字段与 `project_knowledge=docs`（`docs/explanation/speclite-modules.md:50-60`）。
  - Story 11.2 技术要求明确 `docs/` 不得继续作为 fresh `project_knowledge` default，但 Public Documentation plane 仍独立呈现（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:68-80`）。

- **影响**
  - 代码、fixtures 和 Ready Summary 已把 fresh `project_knowledge` 转到 `_speclite-output/project-knowledge-base` 并单独展示 Public Documentation plane；current public docs 继续发布旧默认，会直接误导 fresh install 用户和后续 story 审查。
  - 这不是 11.3 existing fallback/mismatch/migration，也不是 11.4+ workflow routing；它是 Story 11.2 fresh runtime defaults 改变后的 D1 public docs 同步缺口。

- **建议**
  - Evaluator 应将该项判为 Story 11.2 的 P2 / `[中]` patch 或明确 CR TODO；不是误报。
  - 若进入 fixer，scope 应限于 current public docs：同步七 root fresh defaults、`project_knowledge` fresh default、Public Documentation plane 与 Project Knowledge plane separation，并避免改写 frozen historical records 或 workflow routing 表。

## 验证摘要

- ✅ `npx vitest run test/config-initialization.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts` 通过：3 files / 31 tests。
- ✅ `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode warn` 通过：`status=ok`, `findings=[]`, counts `core=18`, `sdlc=50`, `defaultInstall.total=68`。
- ✅ `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict` 通过：`status=ok`, `findings=[]`, counts `core=18`, `sdlc=50`, `defaultInstall.total=68`。
- ✅ `npm run release:packaging-check` 通过：`Packaging acceptance passed: release/packaging-manifest.json and dist/packaging-manifest.json`。
- ✅ `npm run build` 通过：`tsup` ESM 与 DTS build success。
- ✅ `npm test` 通过：61 files / 475 passed / 4 todo。
- ✅ `git diff --check` 通过：exit 0，无输出。
- ⚠️ `npm run lint` 未执行：`package.json` 未配置 `lint` script；本轮使用 canonical warn/strict、build、full test 与 diff check 覆盖可用质量门禁。
- ⚠️ 定向复现命中 Finding #1：fresh manifest 删除或错配 `paths.artifactRoots` 后，`runReadyCheck()` 仍返回 `ok=true`。
- ✅ 测试副作用检查：验证后 `git status --short` 未出现除既有 Story 11.1/11.2 mixed worktree、CR 目录与本 summary 以外的新增漂移；临时复现目录已删除。

## 通过项

- SPEC 01 / SPEC 04 additive schema decision 合理：`artifactRoots[]` 是 optional additive field，legacy `artifactRoot` 保留，不要求 bump `speclite.command-result.v1` / `speclite.manifest.v1`；Zod schema 也将 `artifactRoots` 标为 optional（`src/manifest/manifest-schema.ts:163-185`）。
- 七 root registry 的 field、configPath、placeholder、freshDefault、plane 顺序固定，projection 统一追加 `ownership=workflow-owned` 与 SPEC 09 contract ref（`src/config/artifact-root-resolver.ts:52-129`）。
- runtime structure 的正常路径在 authorization/blocker/hook conflict guard 之后才 acquire lock，并在 lock 后创建目录/写文件；focused tests 覆盖了 `writeAuthorized=false`、blocked source、invalid root、lock conflict 等 Story 11.2 关键场景（`src/installer/runtime-structure.ts:87-118`, `120-153`）。
- Ready Summary human output 已展示七类 filesystem planes，并单独展示 Public Documentation plane；测试覆盖 no ANSI、no temp absolute path、七 root projection 和 `docs` public plane（`src/diagnostics/output.ts:970-1007`, `test/install-progress-ready-summary.test.ts:600-627`）。
- `src/bin/speclite.ts` 属于必要最小 consumer surface：interactive/detailed config 需要暴露新增 root prompts，不是无关扩 scope。
- `release/packaging-manifest.json` 的变化属于 canonical source `module.yaml` 改动后的 release evidence hash 更新；`release:packaging-check` 已通过，不应恢复该 hash。
- 未发现 11.3 existing fallback/mismatch/migration 或 11.4+ workflow routing 实现混入。本轮 docs drift 属于 current public docs 同步问题，不应通过改 workflow routing 来修。

## D1 Docs 判断

D1 docs finding 是真阳性。我的分类是 Story 11.2 P2 / `[中]` patch，且需要 Evaluator 明确授权 fixer scope 或转 CR TODO；它不是 Story 11.2 runtime P1 blocker，也不是误报。理由：Story 11.2 已改变 fresh install defaults 和 `project_knowledge` plane，canonical governance 明确要求 current public docs 反映 runtime/install/module 行为；但 docs 文件确实不在当前 Story file list 内，所以 reviewer 阶段只记录 finding，不越权修改。

## 结论

- **结论：不通过**
- **阻塞项**：无 `[高]`；有 2 个 `[中]` patch finding。
- **建议**：进入 `bmenhance-cr-02-evaluator`。Evaluator 应至少裁决 Finding #1 为需修复的 fresh ReadyCheck projection reconciliation；Finding #2 需要在 Story 11.2 CR fixer scope 内同步 current public docs，或形成显式 CR TODO / 后续受控 story。
