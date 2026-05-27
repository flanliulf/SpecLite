---
Story: 2-4
Round: 1
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具在当前执行环境不可用，本轮降级为串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均已完成。`npm test`、focused resolver tests 和 `npm run build` 均通过，但发现 2 个中优先级契约问题和 1 个低优先级 fixture 问题。建议：不通过，先修复中优先级问题后进入 evaluator。

## 新发现

### 1. [中] `ResolveMergeResultSchema` 无法解析实际 resolver result

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/config/resolve-output-schema.ts:8-14` 将 merge result schema 定义为 `{ value, diagnostics, exitCode }` 且 `.strict()`。
  - `src/config/customization-reader.ts:9-13` 实际 `ResolverResult` 返回 `{ value, issues, exitCode }`，`resolveTomlLayers()` 也在 `src/config/customization-reader.ts:96-100` 返回 `issues`。
  - 定向复现：`ResolveMergeResultSchema.safeParse(await resolveProjectConfig(...))` 返回失败，错误为缺少 `diagnostics` 且存在未识别 key `issues`。

- **影响**
  - Story 2.4 要求 `src/config/resolve-output-schema.ts` 提供 stdout、stderr JSON Lines 和 merge-result parser anchor。当前 anchor 与真实 resolver result 漂移，无法作为 executable schema 验证实现，也会让后续消费者或测试误以为存在 `diagnostics` 字段。

- **建议**
  - 在 schema 或 resolver result 中统一字段名：要么把实际 result 改为 `diagnostics`，要么让 `ResolveMergeResultSchema` 接受当前 `issues` 字段并明确命名。
  - 增加一个测试，直接用 `ResolveMergeResultSchema.parse(await resolveProjectConfig(...))` 或对应 public adapter 验证 schema 与实现同步。

### 2. [中] installed skill fixture 仍正向断言 legacy Python resolver 路径

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - Resolve contract 明确写明 installed skill instructions 应显式传入 `speclite resolve customization --project-root`：`_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:72-81`。
  - `speclite-dev-story` 激活说明仍要求执行 `python3 {speclite-runtime-root}/scripts/resolve_customization.py --skill {skill-root} --key workflow`，见 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md:20-21` 和 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/activation.md:13-19`。
  - `test/skill-artifact-loop.test.ts:49-55` 当前正向断言 installed skill 包含 `{speclite-runtime-root}/scripts/resolve_customization.py`，而不是断言新 runtime command。

- **影响**
  - Story 2.4 虽已实现 Node/TypeScript `speclite resolve customization`，但 release-gate fixture 仍证明 installed activation 会走 legacy Python resolver。此前本机已多次复现裸 `python3` 缺少 `tomllib`，这会保留 Story 2.4 试图消除的 runtime instability。

- **建议**
  - 至少把 Story 2.4 覆盖的 release-gate skill activation fixture 改为 `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow`。
  - 调整 `test/skill-artifact-loop.test.ts`，断言 installed skill 包含新 command 且不包含 legacy resolver path。若不打算在 Story 2.4 改 source skill instruction，需要在 Story/测试中明确把该项降级为后续 Story，并停止将 legacy path 当作通过证据。

### 3. [低] `resolve-parity` fixture 目录本身没有承载 parity cases

- **来源**：auditor
- **分类**：patch

- **证据**
  - Contract 要求 `resolve-parity` 是 MVP release gate fixture，并覆盖 config/customization merge、repeated key、missing key、optional/required failure、array semantics、non-ASCII、explicit project root 和 fallback search：`_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:134-152`。
  - 当前 `test/fixtures/resolve-parity/README.md:1-5` 仅说明测试会临时创建 fixture；`test/fixtures/resolve-parity/fixture-case.json:1-5` 仅包含 case metadata。
  - `test/resolve-cli.test.ts:155-164` 只校验 fixture manifest metadata；真正的 parity project tree 由测试 helper `createResolveParityFixture()` 内联生成。

- **影响**
  - 行为测试覆盖较好，但 fixture artifact 不可复用、不可审阅，也不能独立表达 release-gate cases。后续 fixture drift 或跨工具 parity 校验会依赖测试私有 helper，而不是 Story 要求的 `resolve-parity` fixture。

- **建议**
  - 将 parity case 输入、expected stdout/stderr 或 case manifest 结构化放入 `test/fixtures/resolve-parity/`，让测试从 fixture 目录读取并生成临时项目树。
  - 至少扩展 `fixture-case.json`，枚举需要覆盖的场景与 expected semantic result，避免 fixture 目录只作为占位符。

## 验证摘要

- `npm test` ✅ 通过（98 / 98 tests，17 / 17 files）
- `npm run lint` N/A（`package.json` 当前未定义 lint script）
- `npm run build` ✅ 通过
- Focused resolver tests ✅ 通过（17 / 17 tests，4 / 4 files）
  - `npm test -- test/config-merge-rules.test.ts test/resolve-readers.test.ts test/resolve-cli.test.ts test/skill-artifact-loop.test.ts`
- 定向复现 ❌ 发现 schema mismatch
  - 输入：对 `resolveProjectConfig()` 的实际返回值执行 `ResolveMergeResultSchema.safeParse(...)`
  - 预期：schema 作为 merge-result parser anchor 应能解析实际 result
  - 实际：缺少 `diagnostics`，且 `issues` 被 `.strict()` 视为未识别 key

## 通过项

- `speclite resolve config` 已注册，并要求显式 `--project-root`。
- `speclite resolve customization` 已注册，并要求 `--skill`，支持显式 `--project-root` 与 fallback project search。
- Config 四层 merge order、customization 三层 merge order、optional warning continue、required failure blocking、missing key `{}` success、repeated key selection 和 no `CommandResult` envelope 的 executable tests 均通过。
- Shared merge rules 覆盖 scalar override、table deep merge、keyed array whole-item replacement、append fallback 和 no deletion mechanism。
- Diagnostics 当前未在 stderr 泄露临时 root absolute path，相关 tests 已覆盖。
