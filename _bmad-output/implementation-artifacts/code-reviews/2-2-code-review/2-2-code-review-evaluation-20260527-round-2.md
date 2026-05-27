---
Story: 2-2
Round: 2
Date: 2026-05-27
Model Used: GPT-5.5
Review Source: 2-2-code-review-summary-20260527-round-2.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-2 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。本轮 reviewer 结论为：Round 1 P1 `canonicalPackageHash` 输入面问题已修复，未发现新的阻塞项或中高优先级问题；`npm run lint` 因项目未定义 `lint` script 而无法执行。经独立代码核查、hash 复算和 focused regression test 验证，评估结论如下。

---

## 上轮问题回顾确认

### Round 1 / Finding #1 — `canonicalPackageHash` 覆盖 source 全目录，但 installed entry 只复制白名单文件：已修复

经代码验证，reviewer 对修复状态的判断成立。

- `src/manifest/hash.ts:17-23` 的 `hashPackageDirectory()` 已支持 `include` predicate，并在列出 package 文件后按 predicate 过滤 hash 输入面。
- `src/fs/copy-tree.ts:7-9` 定义 installed canonical entry 白名单；`src/fs/copy-tree.ts:44` 使用 `isInstallableCanonicalPackageFile()` 过滤实际复制文件；`src/fs/copy-tree.ts:88-93` 导出同一 predicate，覆盖 `SKILL.md`、`CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example`、`customize.toml`，不包含 source-only `SKILL.en.md`。
- `src/ide/target-writer.ts:55-57` 计算 `canonicalPackageHash` 时已调用 `hashPackageDirectory(sourcePackageRoot, { include: isInstallableCanonicalPackageFile })`，因此 package-level hash 输入面与 installed canonical entry copied surface 对齐。
- `test/ide-target-writer.test.ts:67-120` 已新增包含 source-only `SKILL.en.md` 的回归测试，断言 `canonicalPackageHash` 等于 installed surface hash，并且不同于 source 全目录 hash；同时验证 `.claude/skills` 与 `.agents/skills` installed entries 不包含 `SKILL.en.md`。
- `test/runtime-structure.test.ts:61-70` 与 `test/runtime-structure.test.ts:126-143` 继续验证真实 fixture 安装后 `.claude/skills/speclite-dev-story/SKILL.en.md` 和 `.agents/skills/speclite-dev-story/SKILL.en.md` 不存在，且两个 target 的 installed `SKILL.md` file hash 一致。
- `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-speclite-dev-story.json:1-7` 的 `canonicalPackageHash` 已更新为白名单过滤后的 `sha256:266f783ee45543a079052d1829c1e2fa6a8ffbd5138c5d1990747815594fdf65`。

独立只读复算确认当前 source 全目录 hash 为 `sha256:ee9617e3915f6dcd116b01d105b71f6938476ac4e028ff6285a90c327d93b53c`，installed surface hash 为 `sha256:266f783ee45543a079052d1829c1e2fa6a8ffbd5138c5d1990747815594fdf65`，两者不同，fixture 记录的是 installed surface hash。该结果与 Story 2.2 AC5 的跨 target canonical package hash 稳定性要求一致：`_bmad-output/implementation-artifacts/stories/2-2-ide-skill-entry-mapping.md:45-50`、`_bmad-output/implementation-artifacts/stories/2-2-ide-skill-entry-mapping.md:96-102`。

复核 owning SPEC 后，当前修复也符合 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:159-173` 对 `canonicalPackageHash` 的 package-level 语义，以及 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md:62-80` 对 self-contained skill entry copied surface 的要求。

验证命令：

- `npm test -- test/ide-target-writer.test.ts test/runtime-structure.test.ts`：通过，2 个测试文件，11 个测试。
- `git diff --check`：通过，无 whitespace error 输出。

关于 reviewer 提到的 `npm run lint`：`package.json:12-17` 当前仅定义 `build`、`dev`、`test`、`release:packaging-check`，没有 `lint` script。因此 Missing script 是环境/项目脚本事实，不构成本轮新增阻塞缺陷。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | 本轮没有需要继承或新增的 CR TODO。 |

---

## 发现 #1 评估

### 审查原文

> **本轮未发现新的阻塞项或中高优先级问题。**

### 评估结论：确认 reviewer 结论成立

### 评估分析

**问题描述准确性：准确**

本轮 review 的核心不是提出新 defect，而是确认 Round 1 P1 已修复且无新增阻塞项。代码核查显示 hash 输入面、复制白名单、target writer 调用点、fixture snapshot 和 focused tests 已对齐；未观察到 reviewer 对修复状态的误判。

**严重性判断：合理**

由于 Round 1 P1 已修复，且本轮未提出新的中高优先级问题，reviewer 给出“通过”而不是继续阻塞是合理的。`npm run lint` 不存在的问题来自项目脚本缺失，不是本次修复引入的 runtime 或 contract 缺陷。

**修复建议：可行但非必要**

reviewer 未要求新增修复。当前证据不足以要求 fixer 继续修改代码或 Story 文档。

**误报评估：非误报**

reviewer 的通过结论有代码、fixture、测试和 hash 复算支持，不属于误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | Round 1 P1 已修复，本轮无新增阻塞项。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有需要纳入 CR TODO 的事项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮未识别误报。 |

### 评估决定

- **Round 1 / Finding #1（`canonicalPackageHash` 覆盖 source 全目录，但 installed entry 只复制白名单文件）**：确认已修复，无需继续阻塞。
- **本轮新发现**：无。
- **`npm run lint` Missing script**：确认是 `package.json` 未定义 lint script 的项目事实，不作为本轮阻塞项。
- **最终评估决定**：通过。Story 2-2 当前已满足 reviewer + evaluator 双通过停止条件。
