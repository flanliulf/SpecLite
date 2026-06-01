---
Story: 5-4
Round: 2
Date: 2026-06-01
Model Used: GPT-5 Codex (codex)
Review Source: 5-4-code-review-summary-20260601-round-2.md
Review Model: GPT-5 Codex (codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-4 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer Round 2 结论为通过，四桶数量为 `decision_needed=0`、`patch=0`、`defer=1`、`dismiss=0`。独立复核确认 Round 1 的 2 个 P1 已真实修复；Round 2 `patch=0` 成立；保留的 `defer=1` 是 confirmed Git install human output `confirmationState=pending` 的 P2 CR TODO，不阻塞当前交付。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 Finding #1：Git descriptor full 40-hex SHA schema / validate gate：已修复

经代码验证，修复成立。`src/source/source-descriptor-schema.ts:3-4` 定义 full 40-hex SHA pattern 与 `GitCommitShaSchema`；`src/source/source-descriptor-schema.ts:43-48` 将 `git-commit.commitSha` 收紧为 full SHA；`src/source/source-descriptor-schema.ts:64-76` 对 `sourceType === "git"` 且存在 `version` 的 descriptor 增加 full SHA schema 检查。`src/validation/rules/source-integrity.ts:71-87` 在 local-only Git validate 分支拒绝 non-SHA `version` / `commitSha`，并返回稳定 `source-integrity.floating-git-source`、`reason=invalid-git-commit-evidence-shape`。

测试覆盖也成立。`test/git-source-resolution.test.ts:598-674` 覆盖 `version=main`、short SHA、tag、full ref、`HEAD` 等 malformed installed descriptor 的 schema 和 validate negative cases。本轮 evaluator 运行 `npm test -- test/git-source-resolution.test.ts`，结果为 1 file / 14 tests passed；运行 `npm test`，结果为 33 files / 250 tests passed。

### Round 1 Finding #2：Git resolver commit-ish verification：已修复

经代码验证，修复成立。`src/source/git-source-resolver.ts:18-28` 的 `GitClient` 已包含 `verifyCommit`；`src/source/git-source-resolver.ts:121-143` 在写入 descriptor 前强制执行 commit-ish verification，explicit SHA 还要求 verified SHA 与 requested SHA 完全一致；`src/source/git-source-resolver.ts:145-190` 只在 verification 成功后写入 lower-cased `version` 与 `git-commit.commitSha`。默认 Git client 在 `src/source/git-source-resolver.ts:225-247` 使用临时 Git context、`git fetch` 与 `git rev-parse --verify --end-of-options FETCH_HEAD^{commit}` 验证 commit-ish，失败时返回 undefined，不把 raw stderr 或临时路径投影到 public output。

测试覆盖也成立。`test/git-source-resolution.test.ts:31-127` 覆盖 branch、tag、full-ref、explicit SHA 成功路径与 annotated tag 解引用；`test/git-source-resolution.test.ts:129-259` 覆盖 explicit SHA 非同一 commit object、branch/tag/full-ref verification failure、verification exception 的 blocked diagnostics。本轮 evaluator 运行的 focused 与 full test 均通过。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#3 | confirmed Git install human output 在成功解析后仍显示 `confirmationState=pending` | CR TODO / 非阻塞 | 同意维持。`src/diagnostics/output.ts:498-514` 仍从 `sourceDescriptor` 反推 external access 展示并硬编码 `confirmationState=pending`；但 `src/commands/install.ts:223-239` 先创建 pending plan，确认后重建 confirmed plan，`src/commands/install.ts:239-274` 未确认路径停止，`src/commands/install.ts:415-459` confirmed Git resolver 才发生。该问题影响 human audit 展示，不改变未确认访问门禁或写入门禁。 |

---

## 发现 #1 评估

### 审查原文

> **[低] confirmed Git install human output 仍显示 `confirmationState=pending`**
> - 来源：Round 1 blind / Round 2 reviewer 复核
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

代码验证确认该问题仍存在。`src/diagnostics/output.ts:498-514` 的 `formatInstallExternalAccess` 只接收 `sourceDescriptor`，并在输出 external access 行时硬编码 `"confirmationState=pending"`。因此 confirmed Git install 成功后，human output 仍无法展示 confirmed state。

同时，runtime gate 并未因此失效。`src/commands/install.ts:223-239` 会先构建 pending `SourceResolutionPlan`，在 `confirmSourceAccess` 完成后重建 `confirmed: true` 的 plan；`src/commands/install.ts:239-274` 对未确认的非 bundled source 直接返回失败结果，不进入 resolver、operation lock 或写入；`src/commands/install.ts:415-459` 的 Git resolver 只在确认后路径发生。

**严重性判断：合理**

Reviewer Round 2 将其作为 `defer=1` 而非 `patch` 阻塞项是合理的。该问题会误导 human audit 输出，尤其是 AC4 的 confirmation 可审计展示；但它不导致未确认访问 remote、不导致 floating Git source 进入 install planning，也不污染 `git-commit` evidence。因此维持 P2 CR TODO，不作为当前 blocker。

**修复建议：可行但非必要**

后续修复方向仍可行：将 `SourceResolutionPlan.externalAccesses` 或等价 display-safe confirmation state 投影到 install result 可渲染数据，使 human output 在未确认停止路径显示 `pending`，在 confirmed success / confirmed failure-after-confirmation 路径显示 `confirmed`，并补充 confirmed Git install human output regression test。但这会触及 public result data / renderer 边界，当前 Round 2 不需要扩大修复范围。

**误报评估：非误报**

不是误报。问题真实存在，但属于 reporting / human output 可审计性缺陷，不是 Story 5.4 当前 P1 Git pinning 或 validate gate blocker。

---

## 整体评估结论

### 需要修复（阻塞交付）

无。Round 2 reviewer 的 `patch=0` 成立。

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | confirmed Git install human output 仍显示 `confirmationState=pending` | [低] | **P2** | 影响 external access confirmation 的 human audit 展示，但 runtime confirmation gate 与 Git evidence 写入门禁已生效。 |

### 可忽略（误报）

无。0 个发现建议忽略。

### 评估决定

- **Round 1 Finding #1（Git descriptor full SHA schema / validate gate）**：确认已修复；不需要继续修复。
- **Round 1 Finding #2（Git resolver commit-ish verification）**：确认已修复；不需要继续修复。
- **发现 #1（confirmed Git install human output 仍显示 pending）**：确认有效但非阻塞；应纳入 CR TODO，数量为 1。
- **Round 2 reviewer 结论**：同意通过；`patch=0` 成立，当前不需要 fixer。

### 验证命令

- `npm test -- test/git-source-resolution.test.ts`：通过，1 file / 14 tests passed。
- `npm test`：通过，33 files / 250 tests passed。
- `node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts,null,2))"`：通过，确认 `package.json` 无 `lint` script。
- 未运行 `npm run build`：该命令会重写 `dist/`，本轮 evaluator 被限制只能写入 Story 5.4 CR 目录下 Round 2 evaluation 结果及进度文件；Round 2 reviewer 已记录 build 通过。
