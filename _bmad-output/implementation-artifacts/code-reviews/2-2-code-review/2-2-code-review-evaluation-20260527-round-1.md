---
Story: 2-2
Round: 1
Date: 2026-05-27
Model Used: GPT-5.5
Review Source: 2-2-code-review-summary-20260527-round-1.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查发现 1 个中级 `patch` 类阻塞问题：`canonicalPackageHash` 当前按 source package 全目录计算，但 Story 2.2 的 installed self-contained entry 只复制白名单文件，导致 manifest package-level hash 不能证明实际 `.claude/skills` / `.agents/skills` entry 内容。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] `canonicalPackageHash` 覆盖 source 全目录，但 installed entry 只复制白名单文件**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述与当前代码一致。Story 2.2 AC5 要求 package-level hash 只覆盖 canonical package content，并证明同一 canonical skill 在不同 IDE targets 中内容一致：`_bmad-output/implementation-artifacts/stories/2-2-ide-skill-entry-mapping.md:45-50`。但安装复制面由 `src/fs/copy-tree.ts:7-9` 的白名单定义，`src/fs/copy-tree.ts:44-56` 只复制 `isInstallableCanonicalPackageFile()` 过滤后的文件，`src/fs/copy-tree.ts:88-93` 的谓词未包含 `SKILL.en.md`。同时，`src/ide/target-writer.ts:55` 在复制 target entry 前直接调用 `hashPackageDirectory(sourcePackageRoot)` 生成 `canonicalPackageHash`，而 `src/manifest/hash.ts:17-32` 会遍历并 hash 目录内全部文件。因此当前 hash 输入面确实大于 installed entry 内容面。

独立只读复算也确认 reviewer 的复现成立：`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/` 当前包含 `SKILL.en.md`，source 全目录 hash 为 `sha256:ee9617e3915f6dcd116b01d105b71f6938476ac4e028ff6285a90c327d93b53c`，按 Story 2.2 白名单过滤后的 installable surface hash 为 `sha256:266f783ee45543a079052d1829c1e2fa6a8ffbd5138c5d1990747815594fdf65`。fixture 也把前者写入 `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-speclite-dev-story.json:1-7`，而 runtime 测试明确断言 installed `.claude/skills/speclite-dev-story/SKILL.en.md` 与 `.agents/skills/speclite-dev-story/SKILL.en.md` 不存在：`test/runtime-structure.test.ts:61-70`、`test/runtime-structure.test.ts:126-130`。

**严重性判断：合理**

原始严重性为中级，评估后按 P1 处理是合理的。该问题不是展示层瑕疵，而是 manifest/index 中 package-level hash 的证明对象错误：它会随 source-only 文件变化而变化，却不能证明实际 installed target entry 的内容。Story 2.2 AC5 与 Task 4 都把 canonical package hash 作为本 Story 的核心交付面：`_bmad-output/implementation-artifacts/stories/2-2-ide-skill-entry-mapping.md:45-50`、`_bmad-output/implementation-artifacts/stories/2-2-ide-skill-entry-mapping.md:96-102`。因此该问题阻塞 Story 2.2 交付。

**修复建议：可行**

reviewer 建议将 package-level hash 的输入与 installed canonical entry surface 对齐，或复制后基于 installed target entry 目录计算并校验所有 mapped targets 的 package hash 一致。该方向可行，并且应补充回归测试：使用包含 `SKILL.en.md` 但安装白名单排除该文件的 fixture，断言 `skill-index.entries[].canonicalPackageHash` 等于 `.claude/skills/<id>/` 与 `.agents/skills/<id>/` 的 installed entry surface hash，同时不受未安装 source-only 文件影响。

**误报评估：非误报**

该发现由 edge+auditor 双来源命中，且代码、Story AC、fixture snapshot 与独立 hash 复算共同支持。不存在将 file-level hash 与 package-level hash 混淆的误报迹象；当前实现确实把 source package 全目录 hash 记录为 canonical package hash。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `canonicalPackageHash` 覆盖 source 全目录，但 installed entry 只复制白名单文件 | [中] | **P1** | hash 证明对象与 Story 2.2 installed entry surface 不一致，阻塞 AC5 的 package-level hash 语义。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有需要降级为 CR TODO 的发现。 |

### 评估决定

- **发现 #1（`canonicalPackageHash` 覆盖 source 全目录，但 installed entry 只复制白名单文件）**：确认有效，维持阻塞交付判断。建议进入 fixer，修正 hash 输入面并补充针对包含 source-only `SKILL.en.md` package 的回归测试。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-27
- **Model Used**: GPT-5.5
- **Fix Items**: 1

### 修复项

1. **P1 - `canonicalPackageHash` 输入面与 installed canonical entry surface 不一致**
   - 状态：已修复
   - 修改：`hashPackageDirectory()` 支持传入 relative file include predicate；`copyCanonicalPackage()` 的安装白名单谓词导出复用；`writeIdeMirrors()` 计算 `canonicalPackageHash` 时使用同一安装白名单，排除 source-only `SKILL.en.md`。
   - 回归测试：在 `test/ide-target-writer.test.ts` 增加包含 source-only `SKILL.en.md` 的 package-level hash 测试，断言 `canonicalPackageHash` 等于 `.claude/skills` 与 `.agents/skills` installed entry surface hash，且不同于 source 全目录 hash。
   - Fixture：更新 `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-speclite-dev-story.json`，使 `speclite-dev-story` 的 `canonicalPackageHash` 对齐安装白名单过滤后的 canonical entry surface。

### 验证结果

- `npm test -- test/ide-target-writer.test.ts`：通过，1 个测试文件，3 个测试。
- `npm test -- test/runtime-structure.test.ts`：通过，1 个测试文件，8 个测试。
- `npm test`：通过，12 个测试文件，72 个测试。
- `git diff --check`：通过，无 whitespace error 输出。
