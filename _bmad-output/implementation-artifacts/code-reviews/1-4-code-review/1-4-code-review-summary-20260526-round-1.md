---
Story: 1-4
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。当前环境未提供可调用的 `Agent` 子代理工具，三层并行审查已按 skill 降级为单一 LLM 审查，并覆盖 Blind Hunter、Edge Case Hunter、Acceptance Auditor 的 6 个维度。审查基于 Story `1-4-project-config-initialization`、实际实现文件、测试文件、Story Dev Agent Record 与本轮命令复验。

本轮发现 2 个 `patch` 类问题，其中 1 个高严重性隐私/输出契约问题、1 个中严重性 AC 覆盖问题。建议本轮不通过，需要进入 evaluator；若 evaluator 采纳，应进入 fixer。

## 新发现

### 1. [中] Detailed config 在 CLI 中只能选择模式，不能调整 AC4 要求的配置项

- **来源**：single-llm(auditor+edge)
- **分类**：patch

- **证据**
  - `src/bin/speclite.ts:49-50` 只把一次 `configInput.prompt` 的回答交给 `parseConfigInitializationAnswer`。
  - `src/bin/speclite.ts:121-126` 仅根据回答返回 `{ mode: "detailed" | "quick" }`，没有收集 `user_name`、`project_name`、语言、artifact paths、selected modules 或 IDE targets。
  - `src/installer/config-initialization.ts:192-199` 的 prompt 文案声称 detailed config 可以调整 project fields、module artifact paths、selected modules 和 IDE targets，但实际 CLI 没有对应输入路径。

- **影响**
  - AC4 要求 detailed config 中用户可以确认或调整项目级配置、module artifact paths、安装模块和 IDE targets。当前 CLI 只能切换 mode，实际配置仍全部走默认值或测试注入值，用户无法完成 detailed 调整。
  - 现有测试只断言 prompt 包含 “quick or detailed”，未覆盖 detailed 模式下字段调整的交互行为。

- **建议**
  - 为 CLI detailed 模式实现明确的字段收集流程，至少覆盖 Story 声明的可调整字段，并复用 `ConfigInitializationSelection.values` / `selectedModuleIds` / `ideTargetIds`。
  - 若当前 Story 只允许 quick defaults，则应降低 prompt 承诺并在 Story/AC 中明确 detailed 字段调整延后，否则补充 detailed config 的交互测试。

### 2. [高] Rejected artifact path 会在 public issue 中回显原始绝对路径/敏感路径

- **来源**：single-llm(blind+edge+auditor)
- **分类**：patch

- **证据**
  - `src/config/config-schema.ts:70-90` 在检测到 absolute path、drive letter 或 `../` escape 时调用 `createArtifactPathIssue("artifact-path.escapes-project", input.value, ...)`。
  - `src/config/config-schema.ts:100-114` 将 `affectedPath` 设置为传入值，随后该 `ValidationIssue` 会进入 public command output。
  - `test/config-initialization.test.ts:186-209` 只覆盖 `../outside`，未覆盖 `/Users/...`、home directory、drive letter 或 token-like path 的 redaction。

- **影响**
  - AC3 与 AC9 要求 public path display 不泄露 absolute path、home directory、cache path、temporary path 或敏感信息。当前被拒绝的 unsafe path 会原样进入 `affectedPath`，`install --json` 或 human output 都可能回显用户本地绝对路径。
  - 这属于输出隐私契约问题，也会破坏 fixture-stable / redaction-safe 诊断要求。

- **建议**
  - 对 rejected path 的 public projection 做 redaction，例如将 `affectedPath` 固定为字段名或安全占位值，只在 private state 中保留原始输入。
  - 为 absolute path、home path、drive-letter path 和 suspicious credential-bearing path 增加测试，断言 `summary`、`issues`、`nextActions` 与 JSON 序列化结果不包含原始敏感路径。

## 验证摘要

- `npm test` ❌ 失败：当前环境执行 `vitest run` 时返回 `sh: vitest: command not found`，说明依赖未安装或不可用，CR 阶段未能复验测试套件。
- `npm run lint --if-present` ✅ 退出 0；`package.json` 当前未定义 `lint` 脚本，因此没有实际 lint 覆盖。
- `npm run build` 未执行：该脚本调用 `tsup` 并会写入构建产物；本轮用户要求严格只读，只允许写 CR 结果与临时文件。
- Dev Agent Record 记录开发阶段 `npx vitest run test/config-initialization.test.ts`、`npm test`、`npm run build` 均通过，但本轮 CR 未能独立复现 `npm test` / `build`。

## 通过项

- `src/config/config-writer.ts` 使用 TOML writer anchor 统一序列化 `[core]` 与 `[modules.sdlc]`，未在 install orchestration 中复制第二套 merge logic。
- `src/config/config-reader.ts` 提供共享 TOML parse anchor，Story 1.4 测试覆盖 writer/parser round trip。
- `src/installer/config-initialization.ts` 为 `_speclite/config.toml` 与 `_speclite/config.user.toml` 生成 installer-owned planned writes，并将 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml` 规划为 human-owned create-if-absent / protected skip。
- `src/commands/install.ts` 在 config initialization 后仍返回 `writeAuthorized: false` 的 internal `InstallPlan`，public JSON 继续使用 `CommandResult<InstallCommandData>`，未新增 `configInitializationStatus`、`configPaths`、`quickConfig`、`detailedConfig` 或 `readySummary`。
- 代码未发现 Story 1.5+ 的 runtime directory creation、IDE mirror creation、manifest/index generation、ReadyCheck 或 ready summary 写入实现。
