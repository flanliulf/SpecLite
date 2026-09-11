---
Story: 11-1
Round: 1
Date: 2026-09-02
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 并行调度工具在当前子任务上下文不可用，已按 reviewer Skill 降级为串行三层审查；`review-acceptance-auditor` 独立 Skill 未在可用 skill roots 中找到，Acceptance Auditor 按 `review-engine.md` / `bmad-code-review` 中的内嵌验收审计提示词执行。审查层无空输出或执行失败。

实际验证命令均通过：focused resolver tests、resolve/artifact-path regression、affected regression、`npm run build`、`git diff --check`、full `npm test` 均为 PASS。但本轮发现 1 个中优先级 patch finding：artifact-root resolver 的 project-config handoff 未能保留 Story 要求的 merged config provenance。因此建议本轮 CR 不通过，需交给 Evaluator 处理。

## 新发现

### 1. [中] `resolveArtifactRootsFromProjectConfig()` 丢失 merged config provenance，`configSources` 始终为空

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md:238-240` 要求本 Story 为 artifact-root resolver 提供 merged config/provenance 的稳定接入点或相邻 wrapper。
  - `src/config/artifact-root-resolver.ts:160-184` 暴露 `resolveArtifactRootsFromProjectConfig()` 并把 `configResult.sources` 作为 `configSources` 返回，但调用 `resolveProjectConfig({ projectRoot })` 时没有请求任何 dotted keys。
  - `src/config/customization-reader.ts:111-117` 在未请求 keys 时把 `selectedValue` 的顶层 key 传入 `selectSourceMetadata()`；`src/config/customization-reader.ts:243-253` 再用这些顶层 key 查 source map，而 source map 实际按 leaf dotted key 记录，导致全量 nested config 读取的 `sources` 为空。
  - 定向复现：临时 project 中 `_speclite/config.toml` 提供 legacy config，`_speclite/custom/config.toml` 显式覆盖 `modules.sdlc.analysis_artifacts = "team/analysis"`；调用 `resolveArtifactRootsFromProjectConfig({ lifecycle: "existing" })` 后 roots 正确解析为 `team/analysis` / `explicit-config`，但输出 `configSources: {}`。

- **影响**
  - 后续 installer、manifest、validator 或 workflow consumer 可以看到 `resolutionMode`，但无法从 resolver handoff 获取有效配置来源层，破坏 Story 11.1 文件范围中明确要求的 merged config/provenance 交接。
  - 这会让 Story 11.2/11.3 在展示 existing explicit authority、诊断 config/artifact mismatch 或解释 fallback 来源时重新推导 provenance，增加第二套语义和漂移风险。

- **建议**
  - 修复 `resolveArtifactRootsFromProjectConfig()` 或底层 `resolveProjectConfig()` 的 full-read source metadata 映射，使七类 root 及 fallback 输入的 effective dotted key source 可被稳定返回。
  - 增加 focused test：team/user custom layer 覆盖某个 root 时，resolver handoff 的 source metadata 能指向对应 `_speclite/custom/config.toml` / `_speclite/custom/config.user.toml`；legacy fallback 也应能说明 fallback 依赖的 source key。

## 验证摘要

- `npx vitest run test/artifact-root-resolution.test.ts` ✅ 通过（7 / 7）
- `npx vitest run test/resolve-readers.test.ts test/artifact-path-validation.test.ts` ✅ 通过（13 / 13）
- `npx vitest run test/config-initialization.test.ts test/runtime-structure.test.ts test/story-6-4-path-portability.test.ts` ✅ 通过（26 / 26）
- `npm run build` ✅ 通过（tsup ESM / DTS build success）
- `git diff --check` ✅ 通过（无 whitespace error）
- `npm test` ✅ 通过（473 passed / 477 total，4 todo）
- 定向复现 ✅ 完成：`resolveArtifactRootsFromProjectConfig()` roots/modes 正确，但 `configSources` 返回 `{}`，支撑 Finding #1。
- 验证副作用：`test/story-6-4-path-portability.test.ts` / packaging check 路径在本轮 reviewer 验证后更新了 `release/packaging-manifest.json` 的 `packageHash`。该文件不在 Story 11.1 File List 中，本 summary 不把它计入 Story implementation finding，但 finalizer/外层编排需要在收口前决定恢复或纳入范围。

## 通过项

- `src/config/artifact-root-resolver.ts:50-96` 集中声明七类 artifact root fields、config paths、placeholders、fresh defaults 与 legacy fallback policy，顺序与 `SPEC 09` runtime root matrix 对齐。
- `src/config/artifact-root-resolver.ts:98-158` 的 pure resolver 覆盖 fresh、existing explicit、legacy-compatible、mixed per-field mode、project-relative POSIX normalization 与 symlink boundary guard；focused tests 已验证 repeated resolution deterministic 且不创建目录。
- `src/config/config-schema.ts:116-157` 注册 unresolved-token path diagnostic，并在 `SPEC 07` 中加入 `artifact-path.unresolved-token`，details 仅包含 deterministic/redacted fields。
- `src/fs/path-normalizer.ts:107-132` 抽取 symlink boundary helper，`src/validation/rules/artifact-path.ts:321-341` 复用该 helper；artifact-path regression 继续通过。
- 两份 Flow Gate frontmatter 的 `mode`、`target`、`storyKey`、`result`、`generatedAt`、`sourceSkill` 与 hook 当前要求的 v2/handoff fields 一致；kickoff 与 completion 均为 `PASS`。
- Deferred Story 11.2+ surfaces 检查无 diff：`src/installer/config-initialization.ts`、`src/installer/runtime-structure.ts`、`src/manifest/manifest-generator.ts`、`assets/source/speclite/sdlc-skills/module.yaml` 及 fresh-install expected snapshots 未被本 Story implementation 修改。
