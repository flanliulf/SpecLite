---
Story: 8-8
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，本轮已按 skill 降级为当前上下文串行三层审查（blind / edge / auditor），审查输入基于 Story 8.8 当前 AC、File List、当前 git diff 和定向复现。`npm test`、focused tests、`npm run build` 与 `git diff --check` 均通过；`package.json` 未配置 `lint` script。本轮发现 2 个 patch 类问题，其中 1 个中优先级问题会导致跨目录相对 target 的 human Next Actions 仍不可安全复制执行，建议修复后进入 CR Round 2。

## 新发现

### 1. [中] 跨目录相对 target 仍会在 human Next Actions 中退化为 basename

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/commands/install.ts:84-88` 只在 raw target 为绝对路径时把 `pathSafeTarget` 设为 `targetRoot`；所有非绝对 raw target 都使用 `displayPath`。
  - `src/fs/path-normalizer.ts:121-124` 会把 `../noi` 这类相对跨目录 target 的 public `displayPath` 折叠为 basename `noi`。
  - `src/diagnostics/output.ts:1458-1461` 使用 `pathSafeTarget` 生成 human install 命令，因此相对跨目录 target 会继承这个 basename。
  - 定向复现：以 `cwd=<tmp>/SpecLite`、`targetDirectory=../noi` 调用 `runInstallCommand()` 后，`renderInstallHumanOutput()` 的 `Next Actions（下一步）` 实际输出为 `speclite install noi --yes` 和 `speclite install noi --yes --interactive`，而不是从原 cwd 可复制执行的 `../noi` 或绝对 target。

- **影响**
  - 违反 AC4 的路径安全要求：跨目录执行时不得把 target 降级为可能被 cwd 误解析的 basename。
  - 用户按输出复制命令时，可能从 `<tmp>/SpecLite` 安装到 `<tmp>/SpecLite/noi`，而不是原始意图 `<tmp>/noi`。

- **建议**
  - 在 install presentation context 中保留 raw command target 或计算专用 command-safe target：绝对输入继续使用 `targetRoot`；相对输入优先保留用户传入的相对 target（经 trim/normalize/quote），尤其不要把 `..` 场景折叠为 basename。
  - 增加 focused regression：`cwd=<tmp>/SpecLite` + `targetDirectory="../noi"` 时，human Next Actions 必须包含 `../noi --yes` 或绝对 target，且 JSON 仍不得泄漏本机绝对路径。

### 2. [低] shared frame 把非 issue 的写入空态放进了 Issues section

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/output.ts:424` 将 `getCommonEmptyStateLines(result, locale)` 传给 install shared frame 的 `emptyStateLines`。
  - `src/diagnostics/output.ts:216-218` 在没有 issue 时把所有 `emptyStateLines` 都合并到 `Issues` section。
  - `src/diagnostics/output.ts:1475-1476` 的 common empty state 同时包含 `无问题` 和 `未写入项目文件`。
  - 定向复现：absolute target prewrite preview 的 `Issues（问题）` 实际输出为：
    ```text
    - 无问题
    - 未写入项目文件
    ```

- **影响**
  - AC5 要求 empty state 放在所属 section 内；`未写入项目文件` 属于写入状态/计划状态，不属于问题列表。
  - 该信息已在 `Summary（摘要）` 的 `写入状态：未写入项目文件` 中表达，再放入 `Issues` 会削弱“无问题”的扫描语义。

- **建议**
  - 将 issue empty state 与 write/plan/checked-items empty state 分开传递：`Issues` 只承载 `- 无问题` 或真实 issue；无 planned writes、无 checked items、未写入项目文件应进入对应的 State / Plan / Results 区域，或在 Summary 已表达时不重复输出。
  - 扩展测试断言 `Issues（问题）` 在 install no-issue 场景下只包含 issue-owned empty state，不包含 `未写入项目文件`。

## 验证摘要

- `npm test` ✅ 通过（371 / 371）
- `npm run lint` 未执行：`package.json` 未配置 `lint` script。
- `npm run build` ✅ 通过
- `npm test -- test/install-outcome-human-output.test.ts` ✅ 通过（7 / 7）
- `npm test -- test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts` ✅ 通过（19 / 19）
- `git diff --check` ✅ 通过
- 定向复现 ❌ 确认 `targetDirectory="../noi"` 时 human Next Actions 仍输出 basename `noi`。
- 定向复现 ⚠️ 确认 install no-issue prewrite preview 的 `Issues（问题）` 同时包含 `- 无问题` 和 `- 未写入项目文件`。

## 通过项

- Profile taxonomy 和 command-to-profile mapping 已覆盖 Story 8.8 列出的 Operation、Diagnostic、Report / Support 命令：`src/diagnostics/output.ts:53-84`。
- Shared frame 对已迁移的 `install`、`status`、`validate`、`update` 使用 profile-aware section order；Diagnostic profile 中 `Issues` 位于 `Evidence` 前：`src/diagnostics/output.ts:167-209`。
- install absolute target 通过 non-enumerable metadata 提供 human presentation context，不进入 `renderCommandResultJson()`；focused test 已覆盖 absolute target 不泄漏 JSON：`test/install-outcome-human-output.test.ts:68-97`。
- install prewrite human Next Actions 已统一为 `--yes` 与 `--yes --interactive`；相同语义在 message catalog 和 smoke tests 中有覆盖。
- docs matrix 使用 `<absolute-target-path>` / `<command-cwd>` 占位，未引入本机绝对路径；颜色策略明确要求 `NO_COLOR`、CI、non-TTY、docs 和 fixture 无 ANSI escape。
- 已知非阻塞边界：`init`、`list`、`doctor`、`sync`、`uninstall`、`governance-report`、`resolve --human` 仍保留 legacy renderer 形态；Story 8.8 Scope Boundary 明确不强制本 Story 全量重写 Post-MVP renderer，因此本轮仅将其视为后续迁移边界，不列为阻塞发现。
