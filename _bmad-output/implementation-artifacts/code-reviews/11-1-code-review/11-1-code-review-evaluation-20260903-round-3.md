---
Story: 11-1
Round: 3
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-1-code-review-summary-20260903-round-3.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-1 的第 3 轮 CR 代码审查结果（复审）进行独立评估。Reviewer summary 报告 Round 1 的 no-key full-read leaf provenance handoff P1 与 Round 2 的 stale contract anchor expectation P1 均已关闭，且本轮新 findings 为 0。经历史 CR 产物、Story 11.1 AC/Anchor Contract Map、current source/tests、public machine/human output boundary、Flow Gate metadata、sprint tracker 与 Story 11.2+ scope diff 独立核验，该结论合理。整体评估通过；没有需要修复、转入 CR TODO 或请求用户裁决的 finding。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：已关闭

Round 1 的 finding 是 `resolveArtifactRootsFromProjectConfig()` no-key full-read 丢失 merged config provenance，导致 `configSources` 为空。当前代码和测试显示该 P1 已关闭：

- `src/config/customization-reader.ts:96-103` 仍按 TOML leaf dotted key 收集 source metadata；`src/config/customization-reader.ts:111-117` 将 selected value 与 source selection 绑定；`src/config/customization-reader.ts:249-254` 在 no-key full-read 时改为对 selected nested value 调用 `collectTomlLeafKeys()`，并通过 `hasSelectedKey()` 防止顶层 `core` / `modules` 误入 source map。
- `src/config/artifact-root-resolver.ts:160-185` 的 `resolveArtifactRootsFromProjectConfig()` 继续复用 `resolveProjectConfig()`，并将 `configResult.sources` 作为 `configSources` 透传到 artifact-root resolver result；未重写 four-layer TOML merge。
- `test/resolve-readers.test.ts:65-123` 覆盖 no-key full nested config reads 返回 `core.output_folder`、`modules.sdlc.planning_artifacts`、team custom `modules.sdlc.analysis_artifacts`、user custom `modules.sdlc.project_knowledge` 的 leaf metadata，且不返回顶层 `core` / `modules`。
- `test/artifact-root-resolution.test.ts:248-314` 覆盖 project-config handoff：team custom root override、user custom root override，以及 legacy fallback 所依赖的 `core.output_folder` / `modules.sdlc.planning_artifacts` provenance 均可从 `configSources` 定位。
- 独立 focused verification：`npx vitest run test/contract-anchors.test.ts test/resolve-readers.test.ts test/artifact-root-resolution.test.ts test/resolve-cli.test.ts test/artifact-path-validation.test.ts` 通过，5 files / 43 tests passed。

### Round 2 / Finding #1：已关闭

Round 2 的 finding 是 `test/contract-anchors.test.ts` 仍将 no-key full-read 的 `sources: {}` 固定为 executable anchor，和 Round 1 已批准的 leaf provenance handoff 冲突。当前代码和测试显示该 P1 已关闭：

- `test/contract-anchors.test.ts:357-387` 现在保留 `ResolveMergeResultSchema.parse(result)`、`value`、`issues: []`、`exitCode: 0` anchors，并将 `sources` 精确更新为 leaf `core.project_name` metadata。
- 同一用例在 `test/contract-anchors.test.ts:387` 断言 `result.sources` 不包含顶层 `core`，保留 Round 1 修复后的 leaf-not-top-level provenance 语义，没有削弱 public contract。
- public machine output boundary 未被改变：`src/commands/resolve.ts:123-129` 在 default machine mode 下只输出 `result.value`，source metadata 不进入 stdout JSON。
- public human output boundary 未被改变：`src/commands/resolve.ts:314-317` 在 no-key request 下返回 `source path: multiple`；`test/resolve-cli.test.ts:87-107` 覆盖 no-key human output 为 `source path: multiple`，且不泄露 fixture absolute path。
- 独立 focused verification 已覆盖 `test/contract-anchors.test.ts` 并通过，证明 stale expectation 不再导致 full-read provenance 回归。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | - | - | Round 1 与 Round 2 均无 deferred CR TODO；本轮也无需新增 TODO。 |

---

## 新发现评估（本轮无新发现）

Reviewer Round 3 报告新 findings 为 0。独立核验后同意该判断：

- Story 11.1 AC 1-8 当前范围明确：七类 fields/placeholders、fresh defaults、existing explicit authority、legacy fallback、reusable resolution result、stable diagnostics、Project Knowledge/Public Docs boundary 与 scope boundary 分别定义在 `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:15-77`。
- Anchor Contract Map 将 `SPEC 09` 七类 roots、`SPEC 07` diagnostics、Story 11.1 bounded scope、single config-owned resolver/model、four-layer TOML merge、project boundary/redaction 与 focused resolution evidence 设为 hard anchors；当前 map 位于 `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:191-202`。
- `SPEC 09` 当前仍是 field-level owner：`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:21-58` 禁止 Story/Skill 重新定义这些语义，`:60-86` 定义七类 runtime roots、fresh defaults、existing explicit authority 与 legacy fallback，`:88-93` 定义 Project Knowledge/Public Docs boundary。
- `SPEC 07` 已注册 `artifact-path.unresolved-token`：`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:247-277` 将 unresolved token 纳入 `artifact-path` reserved ids，并要求 deterministic/redacted details。
- `src/config/config-schema.ts:12-29` 已能表达新增 artifact root fields；`src/config/config-schema.ts:116-157` 对 unresolved token、path escape、home path、drive path 和 credential-bearing URL 返回 stable artifact-path diagnostics。
- `src/config/artifact-root-resolver.ts:50-96` 集中定义七类 registry、placeholders、fresh defaults 与 legacy fallback source；`src/config/artifact-root-resolver.ts:98-157` 返回 deterministic ordered `field/configPath/placeholder/resolvedRoot/resolutionMode` result；`src/config/artifact-root-resolver.ts:205-282` 区分 fresh、existing explicit 与 legacy-compatible fallback。
- `src/fs/path-normalizer.ts:107-132` 提供共享 symlink boundary helper；`src/validation/rules/artifact-path.ts:321-341` 复用该 helper 并保持 `artifact-path.symlink-escape` issue shape。
- `test/artifact-root-resolution.test.ts:13-438` 覆盖 fresh seven-root matrix、existing explicit authority、legacy-compatible fallback、mixed per-field modes、deterministic/no-write behavior、four-layer config handoff、unresolved/path escape diagnostics、internal/external symlink boundary 与 redaction。
- Flow Gate metadata 当前有效：kickoff gate frontmatter 为 `speclite.flow-gate-report.v2`、`mode: story-kickoff`、`target/storyKey: 11-1-executable-artifact-root-resolution-contract`、`result: PASS`（`_bmad-output/implementation-artifacts/flow-gates/11-1-executable-artifact-root-resolution-contract-story-kickoff-gate.md:1-13`）；completion gate frontmatter 为 `mode: story-completion`、同一 target/storyKey、`result: PASS`（`_bmad-output/implementation-artifacts/flow-gates/11-1-executable-artifact-root-resolution-contract-story-completion-gate.md:1-13`），并在 `:28-31` 记录 `SPEC 09`、`SPEC 07`、resolver 与 deferred surfaces 均通过。
- Story 文件自身的 Anchor Evidence Summary 记录 kickoff/completion gate 均 PASS，contract/functional/evidence anchors verified，且无需 `PASS_EQUIVALENT`（`_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:322-328`）。
- sprint tracker 保持 strict-serial：`_bmad-output/implementation-artifacts/sprint-status.yaml:143-154` 显示 `epic-11: in-progress`、Story 11.1 为 `review`，Story 11.2-11.10 均仍为 `ready-for-dev`。
- Story 11.2+ deferred surfaces scoped diff check 为空：`src/installer/config-initialization.ts`、`src/installer/runtime-structure.ts`、`src/manifest/manifest-generator.ts`、`assets/source/speclite/sdlc-skills/module.yaml`、fresh-install fixture/snapshot paths 与 Story 11.2-11.10 story files 未出现 diff。
- `git diff --check` 通过，无 whitespace error。

只读边界说明：本 evaluator 未重跑 `npm run build` 或 full `npm test`，因为该仓库历史验证显示这些命令可能改写 generated `release/packaging-manifest.json`。在 CR02 evaluator 的只读约束下，本轮以 focused read-only Vitest、`git diff --check`、scope diff、live source/test/Flow Gate/tracker 证据独立确认 Reviewer Round 3 的通过判断；Reviewer summary 中的 full `npm test` 与 build pass 作为被评估输入记录，不作为唯一独立证据。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮没有阻塞交付的 finding。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮没有需要转入 CR TODO 的 finding。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮没有误报 finding。 |

### 评估决定

- **Round 1 / Finding #1（no-key full-read leaf provenance handoff）**：已关闭。当前 implementation 保留 full-read leaf metadata，并由 `resolveArtifactRootsFromProjectConfig()` 透传到 `configSources`。
- **Round 2 / Finding #1（stale `sources: {}` contract anchor expectation）**：已关闭。当前 contract anchor test 已更新为 `core.project_name` leaf metadata，并保留 leaf-not-top-level guard。
- **Round 3 新 findings**：0。未发现新的阻塞项、中高优先级问题、误报待处理项或需要人工裁决的 decision point。
- **整体决定**：CR 评估通过。
- **是否允许 closeout**：允许进入 strict-serial CR04 / CR05 / CR06。建议后续 gate 继续按 configured workflow 执行，不在 CR02 中修改 Story、tracker、Flow Gate、source、tests、review summaries、commit 或 push。
- **TODO / 用户决策点**：无。
