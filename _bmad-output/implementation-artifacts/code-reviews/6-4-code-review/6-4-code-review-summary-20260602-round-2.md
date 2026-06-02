---
Story: 6-4
Round: 2
Date: 2026-06-02
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 工具不可用，已按技能降级为串行三层审查模式：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由当前模型串行完成。已读取 Round 1 review、Round 1 evaluation 以及 evaluation 中的“修复执行记录”，重点复核 4 个 blocking 修复项。

结论：不通过。`path-portability` 的真实 CLI smoke gate、terminal width matrix 与 packaging check 幂等文本测试均有实际改进；但仍存在 2 个阻塞问题：packaging manifest 的稳定 inventory 与真实 `npm pack --dry-run --json` inventory 不一致，且 `path-portability` fixture expected validate snapshot 仍未覆盖 path escape / unsafe overwrite。另有 1 个非阻塞覆盖缺口：真实 CLI gate 捕获了 exit code 但未断言。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `path-portability` gate 没有执行真实命令，手写 expected artifacts 可绕过 AC 3-8
   - 修复位置：`test/story-6-4-path-portability.test.ts:52-117` 新增临时项目真实 CLI gate，依次执行 `install`、`status`、`resolve config`、`resolve customization`、`update`、`update --repair`、`validate`。
   - 验证结果：代码审查确认不再只读取手写 expected artifacts；`runCli` 被真实调用并解析各 command JSON / resolve JSON。

2. Round 1 / Finding #3 — Terminal width matrix 只覆盖 `<80`，缺少 `80-119` 和 `>=120`
   - 修复位置：`test/story-6-4-path-portability.test.ts:263-300` 将 human output 检查扩展为 `72`、`100`、`120` 三段矩阵。
   - 验证结果：代码审查确认覆盖 `<80`、`80-119`、`>=120`，并继续检查 `NO_COLOR` / non-TTY / CI 下无 ANSI 且关键字段可读。

### 仍为阻塞

1. Round 1 / Finding #2 — AC6 `path escape` / `unsafe overwrite` 覆盖缺失
   - 部分修复：`test/story-6-4-path-portability.test.ts:89-108` 在真实 CLI validate 输出中断言 `artifact-path.escapes-project`、`file-integrity.case-conflict`、`file-integrity.unsafe-overwrite-risk`。
   - 残留问题：`test/fixtures/path-portability/expected/command-json/validate.json:7-31` 仍只有 `file-integrity.case-conflict` 与 `artifact-path.symlink-escape`，没有 path escape / unsafe overwrite；语义 expected-output 测试也没有断言 expected snapshot 必含这些 issue。

2. Round 1 / Finding #4 — `release:packaging-check` package inventory 非幂等风险
   - 部分修复：`scripts/release/packaging-check.mjs:18-22`、`71-72` 将 `dist/packaging-manifest.json` 从 stable inventory / hash 中过滤，`test/story-6-4-path-portability.test.ts:310-331` 增加连续两次运行文本一致性断言。
   - 残留问题：真实 `npm pack --dry-run --json` 在当前仓库仍包含 `dist/packaging-manifest.json`，但生成的 `dist/packaging-manifest.json` 自身 `files` 不包含该路径，导致 acceptance artifact 不再准确列出实际 package inventory。

### 仍为非阻塞待办

无 Round 1 defer 项。

## 新发现

### 1. [高][新] Packaging manifest 的 `files` 与真实 npm package inventory 不一致

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `package.json:9-15` 的 package `files` 包含整个 `dist/`。
  - `scripts/release/packaging-check.mjs:18-22` 主动从 `packResult.files` 中过滤 `dist/packaging-manifest.json`，并在 `scripts/release/packaging-check.mjs:71-72` 把过滤后的列表写入 manifest。
  - `dist/packaging-manifest.json:23-527` 的 `files` 列表不包含 `dist/packaging-manifest.json`。
  - 只读复核命令 `npm pack --dry-run --json` 显示真实 package inventory 当前包含 `dist/packaging-manifest.json`，总数 504；manifest 自身列出的文件数为 503。

- **影响**
  - AC9 要求 `dist/packaging-manifest.json` 列出 package file inventory；当前 artifact 列出的不是实际 npm package inventory，而是过滤后的 stable inventory。
  - Release checklist 可能通过，但发布包实际包含一个 manifest 未声明的文件；这会削弱 bundled source / package evidence 的可信度。

- **建议**
  - 二选一固定 contract：要么通过 `package.json` / `.npmignore` 等机制让真实 package 排除 `dist/packaging-manifest.json`，再保持 manifest 排除；要么让 manifest 明确列出自身，并用两阶段生成或 normalized self-entry 策略保证幂等。
  - 增加只读可复核断言：`npm pack --dry-run --json` 的实际 `files[].path` 与 `dist/packaging-manifest.json.files` 在约定策略下完全一致。

### 2. [中][新] `path-portability` expected validate snapshot 仍未覆盖 path escape / unsafe overwrite

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `test/fixtures/path-portability/expected/command-json/validate.json:7-31` 仍只包含 `file-integrity.case-conflict` 与 `artifact-path.symlink-escape` 两个 issue。
  - `test/story-6-4-path-portability.test.ts:145-153` 只 parse expected `validate.json`，`test/story-6-4-path-portability.test.ts:179-181` 只断言 `validatedPaths`，没有断言 expected validate snapshot 必含 `artifact-path.escapes-project` 或 `file-integrity.unsafe-overwrite-risk`。
  - `test/story-6-4-path-portability.test.ts:394-400` 注入的是 `reports/outside-artifacts`，覆盖的是 outside configured artifact root；它不是 `../` 或项目边界逃逸场景。

- **影响**
  - Round 1 的 AC6 覆盖缺口仅在动态 smoke test 中部分补齐，fixture expected artifacts 仍会给下游 fixture comparator / release evidence 留下旧快照。
  - 如果未来真实 CLI gate 被拆出或 expected artifacts 被作为 release evidence 消费，path escape / unsafe overwrite 仍可能从 fixture 证据中消失。

- **建议**
  - 更新 `expected/command-json/validate.json`，使 expected validate artifact 与真实 CLI gate 的 AC6 issue set 一致。
  - 在 expected-output 测试中断言 expected `validate.issues` 至少包含 path escape 与 unsafe overwrite issue，并补一个真正的 project-boundary escape（例如 `../`）或 owning taxonomy 等价场景。

### 3. [低][新] 真实 CLI gate 捕获 exit code 但未断言 AC7 的 exit code semantics

- **来源**：auditor
- **分类**：defer

- **证据**
  - Story AC7 要求 command id、path normalization、exit code 和 JSON output semantics 保持稳定。
  - `test/story-6-4-path-portability.test.ts:343-363` 的 `runSpecliteCli` 捕获 `exitCode`，但 `test/story-6-4-path-portability.test.ts:52-117` 没有对 install/status/resolve/update/repair/validate 的 exit code 做断言。

- **影响**
  - `CommandResult.status` 与 JSON schema 仍被验证，但 path-portability gate 本身不能发现 CLI 设置错误 exit code 的回归。

- **建议**
  - 在真实 CLI gate 中断言成功命令 exit code 为 `0`，validate failure 或 resolve diagnostics 的失败场景按 contract 断言 `0` / `1`。

## 验证摘要

- `npm test` 未执行（本轮严格只读；Story 6.4 测试会删除/重写 `dist/packaging-manifest.json`）。
- `npm run lint` 未执行（严格只读，且本轮无需扩大范围确认 lint script）。
- `npm run build` 未执行（会写入 `dist/`，违反本轮只读约束）。
- 额外复核：
  - 读取 Round 1 review：`_bmad-output/implementation-artifacts/code-reviews/6-4-code-review/6-4-code-review-summary-20260602-round-1.md`。
  - 读取 Round 1 evaluation 与修复执行记录：`_bmad-output/implementation-artifacts/code-reviews/6-4-code-review/6-4-code-review-evaluation-20260602-round-1.md`。
  - 只读检查 `test/story-6-4-path-portability.test.ts`、`scripts/release/packaging-check.mjs`、`test/fixtures/path-portability/`、`dist/packaging-manifest.json`、`.github/workflows/ci.yml`、`package.json`。
  - 只读执行 `npm pack --dry-run --json`：真实 inventory 包含 `dist/packaging-manifest.json`；未写入仓库文件。

## 通过项

- `test/story-6-4-path-portability.test.ts:52-117` 已执行真实 CLI，而不是只解析 expected artifacts。
- `test/story-6-4-path-portability.test.ts:103-108` 已在真实 validate 输出中断言 `artifact-path.escapes-project`、`file-integrity.case-conflict`、`file-integrity.unsafe-overwrite-risk`。
- `test/story-6-4-path-portability.test.ts:263-300` 已覆盖 `72`、`100`、`120` 三档 terminal width，且检查无 ANSI 和关键字段。
- `scripts/release/packaging-check.mjs:18-22` 与 `test/story-6-4-path-portability.test.ts:310-331` 已消除 manifest 文本随首次/二次运行变化的直接幂等风险。
- `.github/workflows/ci.yml:15-17` 仍保持 OS matrix `macos-13` / `windows-2022` 和 Node matrix `[22, 24]`。

## 结论

- **结论：不通过**
- **阻塞项**：
  1. Packaging manifest 稳定 `files` 与真实 `npm pack --dry-run --json` inventory 不一致。
  2. `path-portability` expected validate snapshot 仍未覆盖 path escape / unsafe overwrite。
- **建议**：修复上述 2 个 blocking 后再进入下一轮 CR；exit code 断言可作为非阻塞补强同步处理。
