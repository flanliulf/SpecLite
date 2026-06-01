---
Story: 5-3
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-3-code-review-summary-20260601-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-3 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查仅提出 1 个 `patch` 阻塞项：confirmed local source 生成 local `sourceDescriptor` / evidence 后，后续 install planning、module discovery、IDE mirror copy 与 indexes 仍使用 bundled source tree。经代码验证，该发现有效且阻塞交付。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[高] Confirmed local source 写入阶段仍安装 bundled source**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码路径支持 reviewer 的描述。`src/commands/install.ts:320-365` 在 `local-tarball`、`offline-bundle`、`local` resolution 成功后，只把 `localResolution.descriptor` 传给 `continueInstallWithSourceDescriptor(...)`，没有传入 private canonical source tree 或 install source root。进入后续流程后，`src/commands/install.ts:725` 固定调用 `discoverModulesForInstall(projectRoot)`，而 `src/commands/install.ts:1195-1207` 又固定调用 `discoverOfficialModules({ projectRoot })`。`src/modules/module-metadata.ts:58-64` 明确显示未传 `sourceRoot` 时会读取 `path.join(projectRoot, "assets/source/speclite")`。

写入阶段同样未切换到 local source root。`src/commands/install.ts:893-899` 调用 `applyInstallPlan` 时传入 `packageRoot: projectRoot`；`src/installer/runtime-structure.ts:169-178` 将该 `packageRoot` 传给 `writeIdeMirrors`；`src/ide/target-writer.ts:55-63` 再拼接 `packageRoot/assets/source/speclite/...` 作为实际 copy source。`src/ide/target-writer.ts:109-115` 生成的 `skillIndexEntries` 也使用这一 bundled `sourceRefRoot` 和从 bundled package 算出的 `canonicalPackageHash`。

这意味着 manifest 会记录 local descriptor，因为 `src/installer/runtime-structure.ts:184-189` 直接把 `input.sourceDescriptor` 写入 installed manifest；但 installed skills、skill index hash、files index entry hash 的实际输入来自 bundled tree。该状态会让 source evidence 与 installed content 不一致。

现有测试也没有覆盖这一点。`test/local-source-integrity.test.ts:411-476` 的 confirmed local tarball 测试只断言 install JSON 中的 local descriptor、status/validate local-only 行为与 redaction；没有构造含唯一 marker 的 local canonical source tree，也没有断言 `.claude/skills/.../SKILL.md`、`skill-index.sourcePackagePath`、`canonicalPackageHash` 或 files index entries 来自 local source。

**严重性判断：合理**

原始严重性为高，评估后按 CR 模板归为 P1 阻塞交付。Story 5.3 的用户价值是从 local tarball、offline bundle 或 local path 安装并记录可复现完整性证据；AC1/AC2/AC3/AC7 允许记录 artifact 或 snapshot evidence 并在显式确认后进入 planning，但这种允许必须约束 actual install input。当前实现可以在 local descriptor 为 `unverified` 的情况下成功写入 bundled content，直接破坏 manifest/sourceDescriptor 与 installed files 的一致性。

AC5 也支持 reviewer 的边界判断：tarball/offline bundle 的 artifact `contentHash` 可以保持 raw bytes hash，不必和 tree hash 混用；但如果 tarball/offline bundle 没有 extractor 或 canonical source tree handle，系统不能继续写入 bundled tree。缺少 installable canonical source tree 时应阻塞，而不是生成成功安装。

**修复建议：可行**

建议成立，且修复边界应保持最小：

1. `resolveLocalSource` 或其调用层需要返回 public `sourceDescriptor` 之外的 private install source handle，例如 `canonicalSourceRoot` / `installSourceRoot`。该字段不得进入 public JSON、manifest/index、fixture snapshot 或 human output。
2. 对 `local` source，如果该路径已经是 canonical source tree，module discovery、module selection、IDE mirror copy、package hash、files index 和 skill index 必须使用该 local root，而不是 `projectRoot/assets/source/speclite`。
3. 对 `local-tarball` / `offline-bundle`，如果当前 MVP 没有 extractor、没有 source payload 识别、没有 canonical source tree staging，则 confirmed source resolution 后也不得进入 write phase；应返回稳定 `source-integrity.unsupported-source` 或更具体的 local source issue，并保持 no bundled fallback。
4. 如果后续支持 extraction，artifact `contentHash` 仍必须是 tarball/bundle raw bytes hash；extracted canonical tree hash 只能作为单独的 installed-state input，不得覆盖 artifact hash，也不得暴露 temporary extraction root。
5. 补充 focused tests：local canonical source tree 内放唯一 marker，confirmed install 后断言 copied `SKILL.md`、`skill-index.canonicalPackageHash`、`files-index` hash 与 sourcePackagePath/copy input 都来自 local root；tarball/offline bundle 在没有 extractor/source payload 时断言 blocked 而非 success。

**误报评估：非误报**

不是误报。reviewer 的静态路径追踪与源码一致，且没有发现其他代码路径会把 local source root 传给 `discoverOfficialModules`、`applyInstallPlan` 或 `writeIdeMirrors`。现有 validate/status local-only 检查只能证明安装后不重新访问 origin，不能证明安装内容来自 local source。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Confirmed local source 写入阶段仍安装 bundled source | [高] | **P1** | manifest/sourceDescriptor 记录 local evidence，但 actual install input 仍为 bundled tree，破坏 Story 5.3 的来源完整性语义。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 无 | 无 | 无 | 无 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 | 无 |

### 评估决定

- **发现 #1（Confirmed local source 写入阶段仍安装 bundled source）**：确认有效，必须修复后才能进入下一轮 reviewer/evaluator 复检。本轮不启动 fixer、不修改源码、不提交代码。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-01
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：Confirmed local source 写入阶段仍安装 bundled source

- **状态**: 已修复，等待 Round 2 reviewer/evaluator 复检。
- **源码修复**:
  - `src/source/local-source-resolver.ts`：`local` source 成功解析时返回非枚举 private `installSourceRoot`，保留 public `SourceDescriptor` 的 display-safe `resolvedRoot: "local-source"`，避免 absolute local root 进入 public JSON 或 fixture projection。
  - `src/commands/install.ts`：confirmed `local` source 将 private source root 传入 module discovery 和 write phase；confirmed `local-tarball` / `offline-bundle` 若没有 canonical tree handle，则在 module planning/write phase 前以 `source-integrity.unsupported-source` 阻塞，不再 fallback 到 bundled source。
  - `src/installer/runtime-structure.ts` 与 `src/ide/target-writer.ts`：write phase 支持 private `sourceRoot` 与 public-safe `sourceRefRoot`；copy、files index hash、skill index `canonicalPackageHash` 均基于实际 install source root，local source public refs 使用 `local-source/...`。
- **测试修复**:
  - `test/local-source-integrity.test.ts` 新增 local canonical source marker 安装断言，覆盖 installed `.claude/skills/.../SKILL.md`、files index `sourceRef`/hash、skill index `sourcePackagePath`/`canonicalPackageHash` 均来自 local root且不泄露 private root。
  - 新增 tarball/offline bundle confirmed install blocked 断言，确认无 extractor/canonical tree handle 时不会写 `_speclite`、IDE mirror 或 manifest/index。
- **验证**:
  - `npx vitest run test/local-source-integrity.test.ts`：通过，1 file / 14 tests。
  - `npx vitest run test/ide-target-writer.test.ts test/runtime-structure.test.ts test/install-module-selection.test.ts`：通过，3 files / 22 tests。
  - `npm test`：通过，32 files / 236 tests。
  - `npm run build`：通过，tsup ESM 与 DTS build success。
