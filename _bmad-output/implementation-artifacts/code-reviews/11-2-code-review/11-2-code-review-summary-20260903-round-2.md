---
Story: 11-2
Round: 2
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Round 1 Finding #1 已关闭；Round 1 Finding #2 的 bounded docs 主体修复已关闭，但 fix record follow-up 中的 brownfield tutorial Step 1 / Step 6 仍属于当前 fresh default drift，不应降级为历史示例。focused tests、docs check、canonical warn/strict、packaging、build、full `npm test` 与 `git diff --check` 均通过。

本轮新增 2 个 `[中][新] patch` finding，均有明确修复路径。建议：不通过，进入 `bmenhance-cr-02-evaluator` 对 Round 2 findings 做裁决与授权。

`failed_layers`：

- `parallel-agent-dispatch-unavailable`：当前运行上下文未暴露可用的三层并行 sub-agent 调度接口，本轮按 Skill 降级为串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 方法。
- `standalone-acceptance-auditor-skill-missing`：未发现独立 acceptance auditor Skill；本轮按 `bmad-code-review` acceptance-auditor 方法手工完成 AC 对照审计。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — ReadyCheck 在 fresh projection 缺失或不一致时未 fail-closed
   - `src/installer/ready-check.ts:53-63` 明确比较 `field`、`configPath`、`placeholder`、`resolvedRoot`、`resolutionMode`、`plane`、`ownership`、`contractRefs`。
   - `src/installer/ready-check.ts:360-380` 实现了 `artifactRoots` present + manifest missing 时 fail-closed；caller 与 manifest 均 omit 时保留 legacy 兼容；manifest present + input absent 时仍允许 manifest projection 驱动 runtime check。
   - `src/installer/ready-check.ts:382-410` 比较逐 entry 字段；`src/installer/ready-check.ts:415-459` 覆盖 count、duplicate、registry order。
   - `src/installer/ready-check.ts:461-498` 把 `paths.artifactRoots` parser issue 归入 `manifest-schema.malformed-field`，details 只保留 field/reason/count/index 等 deterministic/redacted 信息。
   - `test/install-progress-ready-summary.test.ts:126-305` 覆盖 manifest missing、order mismatch、`resolvedRoot` mismatch、duplicate field、legacy both-omit 兼容。
   - 定向复现：删除 caller input 的 `paths.artifactRoots`、保留 manifest projection 时 ReadyCheck 返回 ok 且 manifest 7 roots 驱动 runtime path check；删除 manifest entry 的 `resolvedRoot` 时返回 `manifest-schema.malformed-field` / `invalid-field`，没有被 mismatch 逻辑覆盖或重复误导。

2. Round 1 / Finding #2 — D1 current public docs 仍引用旧 fresh defaults
   - bounded docs 主体已修复：例如 `docs/quick-start.md:150-167` 列出七个 fresh defaults，并明确 `docs/` 是 Public Documentation，不是 fresh `project_knowledge` default；`docs/reference/runtime-layout.md:26-33` 同步列出七个 workflow-owned planes 与 `docs/*` public docs 边界。
   - SPEC 09 contract 也明确：fresh install 使用七字段 fresh defaults（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:64-80`），`docs/` 不是 fresh `{project_knowledge}` default（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:88-93`）。
   - 状态：bounded sections 关闭；但 brownfield tutorial Step 1 / Step 6 follow-up 仍是当前 drift，见“新发现 #2”。

### 仍为非阻塞待办

1. `docs/reference/workflow-artifact-layout.md` 后续章节中的 generic `planning-artifacts/`、`implementation-artifacts/`、`devops-artifacts/` 字符串
   - 判断：不因字符串命中自动判错。
   - 理由：`docs/reference/workflow-artifact-layout.md:129-148` 讨论 producer Skill 的 route/catalog 当前行为；`docs/reference/workflow-artifact-layout.md:212-223` 明确是 `Current Differences` 表，记录 canonical source 尚未完全对齐的 workflow routing。Story 11.2 AC7 明确“不修改 Analysis、Planning、UX、Readiness 或 CR workflow 的具体路由”（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:28-29`）。
   - 结论：应作为 Story 11.4+ workflow routing / canonical Skill alignment 后续项或 CR TODO，不作为本轮 Story 11.2 patch finding。

## 新发现

### 1. [中][新] fresh detailed artifact root 显式覆盖被投影为 `fresh-default`

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/bin/speclite.ts:650-661` 在 detailed config 下收集 `brainstorming_artifacts`、`analysis_artifacts`、`planning_artifacts`、`solutioning_artifacts`、`implementation_artifacts`、`devops_artifacts`、`project_knowledge` 等 artifact root 字段。
  - `src/bin/speclite.ts:707-723` 明确非空输入会写入 `values[field]`；prompt 文案说 Enter 才保留 deterministic default，因此非空值是显式配置。
  - `src/installer/config-initialization.ts:124-131` 对 fresh lifecycle 调用 resolver，并把 detailed `values` 注入 `createFreshArtifactRootConfig()`。
  - `src/config/artifact-root-resolver.ts:245-256` 在 `lifecycle === "fresh"` 时会读取 `explicitValue` 并优先使用它，但无论是否有显式值都返回 `resolutionMode: "fresh-default"`。
  - `src/config/artifact-root-resolver.ts:259-265` 对 existing lifecycle 的显式值使用 `resolutionMode: "explicit-config"`，说明 resolver 已有区分显式配置的 public vocabulary。
  - `src/installer/config-initialization.ts:397-405` 与 `src/commands/install.ts:1293-1320` 会把 artifact root summary 暴露给用户；`src/commands/install.ts:1426-1432` 直接展示 `resolvedRoot (resolutionMode)`。
  - 定向复现：

    ```text
    input: mode=detailed, values.planning_artifacts="_speclite-output/plans"
    actual projection:
    field="planning_artifacts"
    resolvedRoot="_speclite-output/plans"
    resolutionMode="fresh-default"
    ```

  - `test/config-initialization.test.ts:166-201` 已覆盖 detailed `planning_artifacts` TOML round-trip，但没有断言 `result.artifactRoots` 的 `resolutionMode`，因此 regression 未被捕获。

- **影响**
  - Story 11.2 AC5 要求 Ready Summary 展示实际 root、plane、resolution mode 与 ownership（`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:24-25`）。当前显式用户路径会被展示成 fresh default，导致 manifest、CommandResult/Ready Summary 与实际配置来源语义不一致。
  - 这不会破坏路径创建或 ReadyCheck 字段一致性，因为各输出会一致地传播同一个错误 mode；风险在于 cross-output projection “一致但语义错误”，后续 review/readiness 可能把用户自定义路径误判为 canonical default。

- **建议**
  - 在 `selectRootValue()` 的 fresh 分支中，当 `explicitValue !== undefined` 时返回 `resolutionMode: "explicit-config"`；仅当使用 `createFreshDefaultForOutputFolder(...)` 时返回 `fresh-default`。
  - 给 `test/config-initialization.test.ts` 当前 detailed round-trip case 增加 `result.artifactRoots.find(field === "planning_artifacts")?.resolutionMode === "explicit-config"` 断言，并补一个默认 quick/fresh root 仍为 `fresh-default` 的对照断言。
  - 如 evaluator 认为 Story 11.2 AC4 中 “fresh-default” 字样只允许默认模式，应明确裁决：显式 detailed override 是否允许存在；否则当前 CLI prompt 与 override behavior 已经表明应区分 explicit。

### 2. [中][新] brownfield tutorial Step 1 / Step 6 仍把 default quick config 指向旧路径

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `docs/tutorials/first-brownfield-project.md:74-77` 仍写明“默认 quick config 会把状态文件写到 `docs/brownfield/project-scan-report.json`”，并给出 `test ! -e "$PROJECT_ROOT/docs/brownfield/project-scan-report.json"`。
  - 同一文档已在 Step 5 修正 default quick config：`docs/tutorials/first-brownfield-project.md:149-171` 说明 `project_knowledge` 默认是 `_speclite-output/project-knowledge-base`，主要 brownfield 产物在 `_speclite-output/project-knowledge-base/brownfield/`，planning handoff 可在 `_speclite-output/2-planning-artifacts/` 或 `{project_knowledge}/brownfield/planning/`。
  - `docs/tutorials/first-brownfield-project.md:192-197` 仍把 default quick config 允许路径写成 `docs/brownfield/**` 与 `_speclite-output/planning-artifacts/*.md`，缺少 fresh `project_knowledge` default 和 numbered planning root。
  - SPEC 09 明确 `project_knowledge` fresh default 是 `_speclite-output/project-knowledge-base/`，`docs/` 不是 fresh default/alias/fallback（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:88-93`）。

- **影响**
  - 这是 public tutorial 的当前操作步骤，不是 historical note：文案直接描述“默认 quick config”。用户按 Step 1 会检查错误 sentinel path，按 Step 6 会把正确的新 default outputs 判成越界或遗漏。
  - 该问题与 `workflow-artifact-layout.md` 的 workflow routing/current differences 不同；这里不要求实现 11.4 routing，只需要把 tutorial 的 default quick config 期望与 Story 11.2 fresh projection 对齐。

- **建议**
  - 将 Step 1 sentinel path 改为默认 `{project_knowledge}` 下的 `_speclite-output/project-knowledge-base/brownfield/project-scan-report.json`，或用“通过 `speclite resolve config` 得到 `{project_knowledge}` 后检查 `{project_knowledge}/brownfield/project-scan-report.json`”的方式避免硬编码。
  - 将 Step 6 允许路径改为 fresh default 下的 `_speclite-output/project-knowledge-base/brownfield/**`，并把 planning handoff 默认/可选位置对齐到 `_speclite-output/2-planning-artifacts/*.md` 或 `{project_knowledge}/brownfield/planning/*`。
  - 保持 bounded docs patch；不要借此修改 brownfield Skill runtime routing 或旧 install migration。

## 验证摘要

- ✅ `npx vitest run test/install-progress-ready-summary.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts`：3 files passed；36 tests passed。
- ✅ `npm run docs:check`：72 Markdown files、5 drafts，links/governance rules valid。
- ✅ canonical source check warn：`status: ok`；counts `core=18`、`sdlc=50`、`defaultInstall.total=68`；findings `[]`。
- ✅ canonical source check strict：`status: ok`；counts `core=18`、`sdlc=50`、`defaultInstall.total=68`；findings `[]`。
- ✅ `npm run release:packaging-check`：`release/packaging-manifest.json` 与 `dist/packaging-manifest.json` acceptance passed。
- ✅ `npm run build`：`tsup` ESM/DTS build success。
- ✅ `npm test`：61 files passed；480 tests passed / 4 todo（484 total）。
- ✅ `git diff --check`：无输出，PASS。
- ℹ️ `npm run lint`：`package.json` 未配置 `lint` script；本轮以 docs check、canonical strict、build、full tests、diff check 作为实际质量门禁。
- ✅ 定向复现：
  - manifest present + caller input omit `paths.artifactRoots`：ReadyCheck ok，manifest 7 roots 驱动 runtime check。
  - malformed manifest entry 缺失 `resolvedRoot`：ReadyCheck 返回 `manifest-schema.malformed-field` / `invalid-field`，没有被 mismatch 逻辑覆盖。
  - fresh detailed explicit `planning_artifacts="_speclite-output/plans"`：路径生效但 `resolutionMode` 错误为 `fresh-default`，见新发现 #1。

## 通过项

- ReadyCheck 对 fresh projection 的 missing/count/order/duplicate/entry field mismatch 已 fail-closed，并复用 `manifest-schema.malformed-field`。
- ReadyCheck issue details 保持 deterministic/redacted；没有泄露 absolute path。
- `artifactRoots` optional handling 与 Zod parser 兼容：legacy input + manifest both omit 不失败；manifest present + input absent 仍能由 manifest 驱动 runtime check；invalid schema issue 不被 mismatch 结果覆盖。
- `contractRefs` 当前由单一 `ARTIFACT_ROOT_CONTRACT_REFS` 生成，ReadyCheck 逐数组顺序比较；现阶段 order 语义稳定。若未来增加多个 refs，再评估是否需要 order-insensitive compare。
- additive v1 strategy 持续成立：`artifactRoot` legacy 字段保留，`artifactRoots` 为 optional container；未破坏既有 CommandResult envelope。
- fresh 七 root defaults 与 `project_knowledge` default 主路径已在核心 docs、manifest/index/fixtures/summary 中投影；Public Docs `docs/` 与 Project Knowledge 边界已在主文档中明确分离。
- Runtime write 顺序仍符合 Story 11.2：final write authorization 与 operation lock 之前不创建 directories；artifact directory creation 由 resolver/canonical metadata 输出驱动。
- 未发现 Story 11.3+ existing migration/fallback mismatch 或 Story 11.4+ workflow routing implementation 被混入当前代码路径。
- canonical warn/strict 与 packaging manifest check 均通过，development 有意更新的 package hash 保留。

## D1 Docs Follow-Up 判断

- `docs/reference/workflow-artifact-layout.md` 后续 generic route strings：不作为当前 patch finding。它们集中在 producer routing 表、updater-only path 或 `Current Differences`，归属 Story 11.4+ workflow routing / canonical source alignment 或 CR TODO。
- `docs/tutorials/first-brownfield-project.md` Step 1 / Step 6：作为当前 patch finding。它们描述 default quick config 的用户操作路径，与本 Story fresh projection 和 SPEC 09 docs/project_knowledge boundary 直接冲突。
- `assets/source/speclite/**` 中与具体 Skill 输出路径相关的旧字符串：本轮未作为自动失败项；需要在后续 canonical Skill routing owner story 中按 source-of-truth 和 installed consumption 单独审计。

## 结论

- **结论：不通过**
- **阻塞项**：无 `[高]`；有 2 个 `[中][新] patch` finding。
- **历史 finding 状态**：
  - Round 1 Finding #1：Closed。
  - Round 1 Finding #2：bounded docs 主体 Closed；brownfield tutorial follow-up 仍为当前 drift，升级为 Round 2 新 finding #2。
- **新 findings 数 / 分类**：2 个；均为 `[中][新] patch`。
- **是否需 Evaluator**：是，建议下一步执行 `bmenhance-cr-02-evaluator` Round 2。
