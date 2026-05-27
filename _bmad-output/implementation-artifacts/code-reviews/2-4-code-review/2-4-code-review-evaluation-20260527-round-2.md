---
Story: 2-4
Round: 2
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 2-4-code-review-summary-20260527-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-4 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer round 2 对 Round 1 两个 P1 的修复确认属实；Round 1 的 `resolve-parity` fixture 可审阅性问题继续维持 P2 CR TODO / 非阻塞状态。本轮新增的 installed config activation contract 缺口经代码验证确认有效，严重性判断合理，应作为 P1 阻塞项交由 fixer 处理。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 Finding #1：`ResolveMergeResultSchema` 无法解析实际 resolver result：已修复有效

`src/config/resolve-output-schema.ts` 已将 merge result schema 对齐为 `value`、`issues`、`exitCode`。`test/contract-anchors.test.ts` 已新增直接调用 `resolveProjectConfig()` 并用 `ResolveMergeResultSchema.parse(result)` 校验真实返回对象的 anchor。Reviewer round 2 将该项判定为已修复有效，评估确认属实。

### Round 1 Finding #2：installed skill fixture 仍正向断言 legacy Python resolver 路径：已修复有效

`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md:21` 已使用 `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow` 作为 workflow customization 解析命令；`references/activation.md:15` 与 `references/workflow-steps.md:342` 也已迁到同一 runtime command。`test/skill-artifact-loop.test.ts:53-66` 正向断言 installed `SKILL.md` / `references/activation.md` 包含新 customization command，并负向断言不包含 legacy Python resolver path。Reviewer round 2 将该项判定为已修复有效，评估确认属实。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#3 | `resolve-parity` fixture 目录本身没有承载 parity cases | CR TODO / 非阻塞 | 同意维持 Round 1 evaluator 结论：这是 fixture 可审阅性和复用性问题，不阻塞 Story 2.4 本轮交付；本轮 fixer scope 不应扩大到该项。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] Installed skill activation 仍直接读取 config.toml，未调用 `speclite resolve config`**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 2.4 Task 7 明确要求 installed skill instructions 调用 `speclite resolve config --project-root <project>` 与 `speclite resolve customization --skill <skill-dir> --project-root <project>`，见 `_bmad-output/implementation-artifacts/stories/2-4-runtime-config-and-customization-resolve.md:136-138`。同一 Story 的 Runtime Path notes 也写明 installed skills should call `speclite resolve config --project-root <project>`，见 `_bmad-output/implementation-artifacts/stories/2-4-runtime-config-and-customization-resolve.md:312-314`。

当前实现已经提供正确的 resolver entry：`src/commands/resolve.ts:27-42` 注册 `resolve config --project-root` 并调用 `resolveProjectConfig()`；`src/config/config-reader.ts:17-46` 的 `resolveProjectConfig()` 按顺序读取 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 四层。也就是说，四层 config merge 能力存在。

但 installed skill activation 尚未接入这个能力。`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md:21` 只调用 `speclite resolve customization ...`，随后仍写明从 `{project-root}/_speclite/config.toml` 解析 `project_name`、`user_name`、`communication_language` 等字段；同文件 `SKILL.md:38-44` 的激活流程第 4 步也是“从 `{project-root}/_speclite/config.toml` 加载配置”。详细 activation reference 在 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/activation.md:36-44` 同样要求单文件读取，而不是执行 `speclite resolve config --project-root {project-root}`。

测试覆盖也存在同样缺口。`test/skill-artifact-loop.test.ts:53-66` 只断言 installed `SKILL.md` 与 `references/activation.md` 包含 `speclite resolve customization ...`；`test/skill-artifact-loop.test.ts:79-91` 在测试进程中单独调用 `resolve config --project-root tempRoot --key core.project_name`，但没有断言 installed activation instruction 本身包含 `speclite resolve config --project-root {project-root}`，也没有证明 skill activation 会消费四层 merge 后的 config。

**严重性判断：合理**

Reviewer 标为 `[中]` 合理，评估为 P1 阻塞项。原因是 Story 2.4 的核心 contract 不只是提供 CLI resolver，而是让 installed skill runtime activation 使用该 resolver，避免 IDE 内运行时绕过四层 config merge。当前文档化 activation 会只读取 required base file，导致 `_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 中的覆盖无法进入真实 skill activation。这是 AC / Task 7 的行为契约缺口，不是文档措辞或测试风格问题。

该问题不应升级为 P0：它不直接造成安全漏洞或数据损坏；但会让 release-gate 测试通过而 installed runtime 行为仍不符合 Story 2.4 contract，因此阻塞交付是合理的。

**修复建议：可行**

建议 fixer 仅处理本轮新发现：将 `speclite-dev-story` installed activation 中的 config 加载步骤改为执行 `speclite resolve config --project-root {project-root}`，并从 resolved JSON 中读取 `project_name`、`user_name`、`communication_language`、`document_output_language`、`user_skill_level`、`output_folder`、`implementation_artifacts` 等字段。对应测试应在 `test/skill-artifact-loop.test.ts` 中正向断言 installed `SKILL.md` / `references/activation.md` 包含 `speclite resolve config --project-root {project-root}`，并覆盖 config override layer 被 activation contract 纳入。

修复时不要处理 Round 1 的 `resolve-parity` P2 TODO，也不要把 functional anchor 修订外的独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` split files 缺失列为缺陷。

**误报评估：非误报**

Reviewer 的 Story contract、source skill activation、reference 文档和测试覆盖证据一致。该发现不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Installed skill activation 仍直接读取 `_speclite/config.toml`，未调用 `speclite resolve config --project-root` | [中] | **P1** | 四层 config merge resolver 已存在，但 installed activation contract 未使用它，会绕过 Story 2.4 的 runtime config merge contract。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R1-#3 | `resolve-parity` fixture 目录本身没有承载 parity cases | [低] | **P2** | 维持 Round 1 evaluator 结论：fixture 可审阅性问题，非本轮 fixer scope。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（installed config activation 未调用 `speclite resolve config`）**：确认有效，严重性 [中] 合理，评估为 P1 阻塞项；需要 fixer 修复。
- **Round 1 两个 P1**：修复有效，不需要重复处理。
- **Round 1 P2 `resolve-parity` fixture 可审阅性问题**：继续作为 CR TODO 跟踪，不进入本轮 fixer scope。
- **Functional anchor 修订**：本轮未将缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 作为缺陷；manifest/index 能力可由集中 builder/helper 承载。

本轮 evaluator 结论：不通过。需要执行 fixer，但 fixer 范围仅限本轮新发现的 installed config activation resolver 缺口。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-27
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 1：installed config activation 改用 `speclite resolve config`

- **状态**: 已修复
- **修改文件**:
  - `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md`
  - `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/activation.md`
  - `test/skill-artifact-loop.test.ts`
  - `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-speclite-dev-story.json`
  - `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-dev-story-skill.json`
- **关键差异**: installed `speclite-dev-story` activation 现在要求执行 `speclite resolve config --project-root {project-root}`，并从 stdout resolved JSON 读取四层合并后的 config 字段；不再把从 `{project-root}/_speclite/config.toml` 单文件加载作为主 activation contract。
- **测试补强**: `test/skill-artifact-loop.test.ts` 正向断言 installed `SKILL.md` 与 `references/activation.md` 包含 `speclite resolve config --project-root {project-root}`，并通过 `_speclite/config.user.toml` 覆盖验证 config override layer 被 resolver 输出纳入。
- **范围控制**: 未处理 Round 1 已修复 P1；未处理 `resolve-parity` fixture P2 TODO；未执行 reviewer/evaluator/finalizer。
- **验证命令**:
  - `npm test -- test/skill-artifact-loop.test.ts`
  - `npm test -- test/runtime-structure.test.ts`
  - `npm test -- test/skill-artifact-loop.test.ts test/runtime-structure.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts`
  - `git diff --check`

✅ CR 修复执行完成，修复记录已追加到评估文件。
