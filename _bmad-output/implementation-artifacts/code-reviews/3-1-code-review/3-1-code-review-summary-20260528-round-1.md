---
Story: 3-1
Round: 1
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。当前环境无独立 Agent 工具可调用，已按 `bmenhance-cr-01-reviewer` 降级规则串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；审查层均完成，未记录失败层。`npx vitest run test/status-command.test.ts` 通过，`git diff --check` 通过；本轮未重新执行 `npm run build` 或全量 `npm test`，避免在只读 CR 约束下刷新 `dist/` 或其他非 CR 产物。审查发现 2 个 patch 级问题，建议先修复后再通过。

## 新发现

### 1. [中] Status 会原样暴露 manifest 中未校验的 public paths

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/status/installed-state.ts:92-99` 将 `manifest.paths` 直接写入 `StatusCommandData.paths`。
  - `src/manifest/manifest-schema.ts:101-108` 只要求 `specliteRoot`、`artifactRoot`、`manifestPath` 为非空字符串，没有复用 project-relative POSIX path 校验。
  - 定向复现：构造 manifest，其中 `paths.specliteRoot` 为 `/tmp/leak`，`runStatusCommand` 返回 `status: "success"`、`highLevelHealth: "partial"`，并在 `data.paths.specliteRoot` 中输出 `/tmp/leak`。

- **影响**
  - 违反 Story 3.1 对 public path fields 的约束：JSON 输出不得包含 absolute local path、home directory 或 platform-specific path。
  - 下游自动化会把 malformed installed-state 当成可消费摘要，而不是 failed installed-state。

- **建议**
  - 在 manifest schema 或 status reader 的 projection 边界校验 `paths.specliteRoot`、`paths.artifactRoot`、`paths.manifestPath` 必须是 project-relative POSIX path。
  - 校验失败时将 installed-state 视为 unreadable/corrupted summary，输出 `highLevelHealth: "failed"`，不要把原始 path 透传到 public JSON。
  - 补充 status fixture：manifest path 为 absolute path 或包含 `..` / `\` 时，不得泄露原值。

### 2. [中] 损坏的 skill-index 被归类为 partial，弱化了 corrupted installed-state 语义

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/status/installed-state.ts:153-160` 对 `skill-index.json` 的读取或 schema parse 失败统一返回 `undefined`，丢失 missing 与 unreadable/corrupted 的差异。
  - `src/status/installed-state.ts:218-223` 将 `hasSkillIndex === false` 统一映射为 target `partial`，随后 `aggregateStatusHealth` 在 `src/status/installed-state.ts:115-120` 将整体 health 归类为 `partial`。
  - 定向复现：存在 valid manifest，但 `_speclite/_config/skill-index.json` 为 invalid JSON 时，`runStatusCommand` 返回 `status: "success"`、`highLevelHealth: "partial"`，target reason 为 `skill-index is missing or unreadable for this target.`。

- **影响**
  - Story 3.1 的 health algorithm 要求 manifest/index/source descriptor shape 损坏或不可读、导致无法产生稳定 installed summary 时进入 `failed`，而当前实现把 corrupted index 与普通 incomplete target 混为 `partial`。
  - 自动化无法区分“安装不完整”与“installed-state index 损坏”，可能给出过弱的健康判断。

- **建议**
  - 让 `readSkillIndex` 返回 discriminated result，例如 `missing` / `invalid` / `valid`。
  - 对 invalid/unreadable skill-index 将 `highLevelHealth` 聚合为 `failed`；missing index 如产品决策允许，可继续作为 `partial`，但需与 corrupted 分开。
  - 补充 invalid JSON 和 schema-invalid skill-index 的 focused tests。

## 验证摘要

- `npx vitest run test/status-command.test.ts` ✅ 通过（8 / 8）
- `git diff --check -- <Story 3.1 files>` ✅ 通过
- `npm run build` 未在本 CR 轮次重新执行；Story dev 记录显示此前通过
- `npm test` 未在本 CR 轮次重新执行；Story dev 记录显示此前 21 个测试文件、126 个测试通过
- 定向复现 ✅ 已执行
  - malformed manifest path：确认 absolute path 会进入 `data.paths`
  - invalid `skill-index.json`：确认 health 为 `partial` 而非 `failed`

## 通过项

- `speclite status` CLI 注册、`--json` 输出和 command id `status` 的主路径存在 focused tests 覆盖。
- 未安装项目主路径返回 `CommandResult.status: "success"`、exit code 0、`highLevelHealth: "not-configured"`、`issues: []` 和 install next action。
- IDE target 输出使用 `claude` -> `agents` 顺序，且 status vocabulary 未混用 `mapped` / `unsupported` / `planned`。
- `StatusCommandDataSchema` 使用 strict object，当前测试覆盖了 validate-only fields 不进入 status data。

## 结论

- **结论：不通过**
- **阻塞项**：无 `decision_needed`；有 2 个明确 patch 项
- **建议**：进入 evaluator，对上述 2 个 patch finding 做有效性评估；若 evaluator 认可，交由 fixer 修复后再复审。
