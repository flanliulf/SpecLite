---
Story: 8-7
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5)
Review Source: 8-7-code-review-summary-20260616-round-1.md
Review Model: GPT-5 Codex (gpt-5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 8-7 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 1 个中优先级 `patch` 类发现：`docs/reference/cli.md` 中 CLI option 表与实际 `speclite` CLI surface 不一致。经独立核对 Story AC、源码 option 注册、文档内容和构建后 CLI help，该发现有效、非误报，并违反 Story 8.7 AC4 的 docs/renderer 一致性要求。评估结论为 not approved，需要 CR-03 fixer。

---

## 发现 #1 评估

### 审查原文

> **[中] `docs/reference/cli.md` 把 `--locale` 记录到不支持的 `init/list`，同时漏列真实支持的 `status/validate`**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 8.7 AC4 明确要求 quick-start、reference 或 troubleshooting 文档引用命令时，示例必须与 outcome vocabulary 和实际 renderer 一致（`_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md:32-36`）。当前 `docs/reference/cli.md` 在 `Init Options` 中列出 `--locale <locale>`，且描述为 `status output`（`docs/reference/cli.md:63-74`）；在 `List Options` 中列出 `--locale <locale>`，且描述为 `validate output`（`docs/reference/cli.md:78-88`）。同一文档的 `Status Options` 和 `Validate Options` 表只列 `--json`，没有列出真实支持的 `--locale <locale>`（`docs/reference/cli.md:91-109`）。

源码注册与文档相反：`init` 只注册 `--json`、`--dry-run`、`--yes`（`src/bin/speclite.ts:79-85`），`list` 只注册 `--json`（`src/bin/speclite.ts:111-116`）；`status` 和 `validate` 分别注册了 `--locale <locale>`（`src/bin/speclite.ts:285-313`）。构建后的 CLI help 也一致显示：`node dist/bin/speclite.js init --help` 和 `list --help` 不含 `--locale`，而 `status --help` 和 `validate --help` 均列出 `--locale <locale>`。进一步复现 `node dist/bin/speclite.js init --locale en-US --dry-run /tmp/speclite-review-readonly` 与 `node dist/bin/speclite.js list --locale en-US /tmp/speclite-review-readonly` 均返回 exit code `1`，错误为 `unknown option '--locale'`。

**严重性判断：合理**

该问题是 public CLI reference 与真实 CLI surface 的不一致，会让用户复制不可用的 `init/list --locale` 命令，并漏掉 `status/validate --locale` 这两个真实能力。它直接违反 Story 8.7 AC4 对 reference docs 与实际 renderer/CLI surface 一致性的要求。虽然不改变 runtime 行为或 JSON contract，但属于验收标准覆盖面内的文档契约错误，应保持 `patch` 阻塞，评估优先级为 P1。

**修复建议：可行**

建议修复方向正确：从 `Init Options` 和 `List Options` 删除 `--locale <locale>`，并在 `Status Options` 与 `Validate Options` 增加 `--locale <locale>`，文案分别对齐 `src/bin/speclite.ts` 中 `status` / `validate` 的 help 描述。该改动范围小、风险低，符合 CR-03 fixer 的处理边界。

此外，建议在同一修复中补充 focused docs/reference option parity test。当前 `test/cli-human-output-matrix.test.ts` 主要验证 matrix 行、renderer human semantics、resolve human mode 和 packaging boundary（`test/cli-human-output-matrix.test.ts:28-231`），没有验证 `docs/reference/cli.md` 中各 command option 表与 `createSpecliteProgram` 或构建后 CLI help 的 option surface 一致。补充轻量 parity test 可以覆盖本次错位的直接回归点。

**误报评估：非误报**

非误报。reviewer 的文档行号、源码 option 注册、构建后 CLI 复现和 AC4 影响判断均成立。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `docs/reference/cli.md` 将 `--locale` 错列到 `init/list`，同时漏列 `status/validate` | [中] | **P1** | public CLI reference 与真实 CLI surface 不一致，违反 Story 8.7 AC4，需修复后复审。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 无非阻塞 CR TODO；本轮问题应作为阻塞修复项处理。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 无误报。 |

### 评估决定

- **发现 #1（`docs/reference/cli.md` option 表与 CLI surface 不一致）**：not approved。确认有效、非误报，保持 `patch` 阻塞；需要 CR-03 fixer 修复文档 option 表，并建议补充 focused docs/reference option parity test 后进入 Round 2 CR。
- **CR TODO 数量（阻塞修复项）**：1。
- **非阻塞 CR TODO 数量**：0。
- **误报数量**：0。
- **是否需要 fixer**：是，需要 CR-03 fixer。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5)
- **Fix Items**: 1

#### 修复项 1：`docs/reference/cli.md` option 表与 CLI surface 对齐

- **对应 Finding**: 发现 #1，`--locale <locale>` 被错列到 `init/list`，同时漏列真实支持的 `status/validate`。
- **状态**: 已完成。
- **修改文件**:
  - `docs/reference/cli.md`: 从 `Init Options` / `List Options` 删除 `--locale <locale>`；在 `Status Options` / `Validate Options` 增加 `--locale <locale>`。
  - `test/docs-reference-cli-options.test.ts`: 新增 focused parity test，解析 `docs/reference/cli.md` 中 `init/list/status/validate` 的 documented options，并与 `createSpecliteProgram()` 生成的 CLI help option surface 比对。
- **关键差异**:
  - `init` documented options 现在只保留 `--json`、`--dry-run`、`--yes`。
  - `list` documented options 现在只保留 `--json`。
  - `status` documented options 现在包含 `--json`、`--locale <locale>`。
  - `validate` documented options 现在包含 `--json`、`--locale <locale>`。
- **验证结果**:
  - `npm test -- test/docs-reference-cli-options.test.ts`: 通过，1 file / 1 test。
  - `npm test -- test/docs-reference-cli-options.test.ts test/cli-human-output-matrix.test.ts`: 通过，2 files / 5 tests。
  - `npm run build`: 通过。
  - `npm test`: 通过，52 files / 368 tests。
  - `npm run release:packaging-check`: 通过；运行后出现的 `release/packaging-manifest.json` `packageHash` drift 已精确恢复。
  - `git diff --check`: 通过。
- **边界确认**: 未改变 CLI runtime behavior、command core behavior、JSON schema 或 outcome vocabulary；未修改 Story 8.7 状态、sprint status、code-review `PLAN.md`、`EXPERIMENTS.md` 或 `EXPERIMENT_NOTES.md`；未执行 stage、commit 或 push。
