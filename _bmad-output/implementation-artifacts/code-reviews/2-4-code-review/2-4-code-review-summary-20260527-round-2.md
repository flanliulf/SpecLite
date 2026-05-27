---
Story: 2-4
Round: 2
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子代理工具在当前执行环境不可用，本轮降级为串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均已完成。Round 1 的两个 P1 已按 evaluator 方向修复并通过 focused tests、全量 `npm test`、`npm run build` 与 `git diff --check`；`resolve-parity` fixture 可审阅性问题维持 P2 CR TODO，不阻塞本轮。但是本轮发现 1 个新的中优先级 activation contract 缺口：installed skill 仍直接读取 `_speclite/config.toml`，未通过 `speclite resolve config --project-root` 获取四层合并后的 config。建议：不通过，先修复该新发现后再进入 evaluator。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `ResolveMergeResultSchema` 无法解析实际 resolver result
   - 修复位置：`src/config/resolve-output-schema.ts` 已将 merge result schema 对齐到真实 resolver result 的 `issues` 字段，并保持 strict schema。
   - 验证结果：`test/contract-anchors.test.ts` 新增直接调用 `resolveProjectConfig()` 并用 `ResolveMergeResultSchema.parse(result)` 校验真实返回对象的测试；focused tests 与全量测试通过。

2. Round 1 / Finding #2 — installed skill fixture 仍正向断言 legacy Python resolver 路径
   - 修复位置：`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md`、`references/activation.md`、`references/workflow-steps.md` 已将主 customization activation 命令迁到 `speclite resolve customization --skill {skill-root} --project-root {project-root}`。
   - 验证结果：`test/skill-artifact-loop.test.ts` 已正向断言 installed `SKILL.md`、`references/activation.md` 与 `references/workflow-steps.md` 包含新 command，并负向断言不包含 `{speclite-runtime-root}/scripts/resolve_customization.py`。

### 仍为非阻塞待办

1. Round 1 / Finding #3 — `resolve-parity` fixture 目录本身没有承载 parity cases
   - 维持 evaluator round 1 结论：CR TODO / 非阻塞。
   - 本轮未要求 fixer 处理，当前测试仍覆盖 resolver 行为，但 fixture 独立审阅性仍待后续统一改造。

## 新发现

### 1. [中][新] Installed skill activation 仍直接读取 config.toml，未调用 `speclite resolve config`

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - Story 2.4 Task 7 明确要求 installed skill instructions 同时调用 `speclite resolve config --project-root <project>` 与 `speclite resolve customization --skill <skill-dir> --project-root <project>`，见 `_bmad-output/implementation-artifacts/stories/2-4-runtime-config-and-customization-resolve.md:136-137`。
  - 同一 Story 的 Runtime Path notes 也写明 installed skills should call `speclite resolve config --project-root <project>`，见 `_bmad-output/implementation-artifacts/stories/2-4-runtime-config-and-customization-resolve.md:312-314`。
  - 当前 `speclite-dev-story` 主说明只调用 customization resolver，随后仍从单一文件读取 config：`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md:21` 与 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md:38-44`。
  - 详细 activation reference 也仍要求从 `{project-root}/_speclite/config.toml` 加载并解析，而不是执行 `speclite resolve config --project-root {project-root}`，见 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/activation.md:36-44`。
  - `test/skill-artifact-loop.test.ts:79-91` 只在测试进程中单独调用 `resolve config`，没有断言 installed activation instruction 本身包含 `speclite resolve config --project-root`。

- **影响**
  - Activated skill 会绕过 Story 2.4 新增的 config four-layer merge contract，只读取 `_speclite/config.toml`，因此 `_speclite/config.user.toml`、`_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml` 中的 project name、language、output path 等覆盖不会进入真实 skill activation。
  - 这会让 CLI resolver tests 通过，但 installed skill 的 runtime behavior 仍与 AC 1 / Task 7 不一致，无法证明同一 skill 在不同 IDE 中读取一致的合并配置。

- **建议**
  - 将 installed `speclite-dev-story` activation 中的 config 加载步骤改为执行 `speclite resolve config --project-root {project-root}`，并从 resolved JSON 读取 `project_name`、`user_name`、`communication_language`、`document_output_language`、`user_skill_level`、`output_folder`、`implementation_artifacts` 等字段。
  - 在 `test/skill-artifact-loop.test.ts` 中增加 installed `SKILL.md` / `references/activation.md` 对 `speclite resolve config --project-root {project-root}` 的正向断言，并用 fixture 覆盖 config override layer 被 activation contract 纳入的场景。

## 验证摘要

- `npm test` 通过（99 / 99 tests，17 / 17 files）
- `npm run lint` 失败：`package.json` 未定义 `lint` script（Missing script: "lint"）
- `npm run build` 通过
- Focused resolver / activation tests 通过（15 / 15 tests，4 / 4 files）
  - `npm test -- test/contract-anchors.test.ts test/skill-artifact-loop.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts`
- `git diff --check` 通过
- 额外复核：
  - `ResolveMergeResultSchema` 与 `resolveProjectConfig()` 真实 result 字段已对齐。
  - Installed customization activation 已从 legacy Python resolver path 迁到 `speclite resolve customization --skill {skill-root} --project-root {project-root}`。
  - Functional anchor 修订已遵守：未将缺少 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 独立 split files 作为缺陷。

## 通过项

- Round 1 两个 P1 修复均有源码和测试证据支撑，未发现回归。
- `speclite resolve config` / `speclite resolve customization` CLI runtime command 的 focused behavior tests 通过。
- Config/customization reader、schema anchor、stderr JSON Lines 和 no `CommandResult` envelope 的现有测试通过。
- 低优先级 `resolve-parity` fixture 可审阅性问题维持非阻塞 TODO，本轮未错误升级。

## 结论

- **结论：不通过**
- **阻塞项**：1 个新发现，installed config activation 未调用 `speclite resolve config --project-root`。
- **建议**：执行 fixer 时仅处理本轮新发现；Round 1 已修复的两个 P1 不需要重复修改，`resolve-parity` fixture 可审阅性继续作为 P2 CR TODO 跟踪。
