---
Story: 4-2
Round: 1
Date: 2026-05-31
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，本轮已降级为串行三层审查模式；Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个审查视角均已完成。Focused Vitest 通过，但发现 1 个阻塞 `patch` 项：`speclite update` / `speclite update --repair` 的结果 `targetProject` 仍通过旧 helper 直接读取 `_speclite/config.toml`，绕过 Story 4.2 要求的四层 config resolver 顺序。建议不通过，需修复后复审。

## 新发现

### 1. [中] update 结果显示名绕过四层 config resolver

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - `src/commands/update.ts:40-43` 在调用 `planUpdate` / `planRepair` 前先调用 `resolveTargetProjectDisplayName` 计算 `targetProject`；`src/commands/update.ts:63-70` 随后把该值写入 `UpdateCommandResult`。
  - `src/diagnostics/command-result.ts:380-384` 的 `readConfigProjectName` 只读取并解析 `_speclite/config.toml`，没有调用 `resolveProjectConfig`，也没有合并 `_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml`。
  - `src/update/update-plan.ts:169-170` 虽然在 planning context 中调用了 shared config resolver，但该 resolver 的 merged value 没有回传给 update command 外层，因此不能影响 `targetProject`。
  - 定向复现：临时项目中 `_speclite/config.toml` 设置 `project_name = "Base"`，`_speclite/config.user.toml` 设置 `project_name = "User Override"`，且 files-index 为空时，`runUpdateCommand` 返回 `targetProject: "Base"`、`status: "success"`、`issues: []`。
  - 现有测试 `test/update-command.test.ts:114-123` 只覆盖 base config 的非 ASCII trimming；`test/update-planning.test.ts:56-67` 构造了 `config.user.toml` 覆盖值但没有断言 update 结果是否使用 merged config display name。

- **影响**
  - 违反 AC1 中 update/repair 读取项目配置时必须按 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 顺序合并的要求。
  - 违反 Story 对“不得在 update command 或 planner 中实现第二套私有 merge logic”的约束；当前路径不是完整 merge logic，但确实是 update 命令内的第二条 config 读取路径，并且公共 JSON/human output 会忽略 installer user / custom override。

- **建议**
  - 让 update/repair 的 `targetProject` 使用 `resolveProjectConfig({ projectRoot, keys: ["core.project_name"] })` 的 merged result，或让 `planUpdate` / `planRepair` 的 planning context 显式返回 resolved config display value，避免外层再次直接读取 base TOML。
  - 增加 focused test：`config.toml` 为 `Base`、`config.user.toml` 或 `_speclite/custom/config.toml` 覆盖为 `User Override` 时，`speclite update --json` 与 `speclite update --repair --json` 的 `targetProject` 均为后层覆盖值；同时保留 malformed optional layer warning 不泄露 raw path/content 的断言。

## 验证摘要

- `npm test -- test/update-planning.test.ts test/update-command.test.ts test/resolve-readers.test.ts test/config-merge-rules.test.ts` ✅ 通过（20 / 20）
- `npm run lint` 未运行：项目 `package.json` 当前没有 `lint` script。
- `npm run build` 未运行：本步骤是只读 CR，避免重写已有未跟踪 `dist/` 生成物；Story Dev Agent Record 记录 2026-05-31 18:07 CST 曾运行通过。
- 定向复现 ✅ 复现问题
  - 输入：`_speclite/config.toml` 中 `project_name = "Base"`，`_speclite/config.user.toml` 中 `project_name = "User Override"`。
  - 预期：update 结果使用 merged config 后的 `targetProject: "User Override"`。
  - 实际：update 结果为 `targetProject: "Base"`。

## 通过项

- `src/update/update-plan.ts:169-170` 已在 planning 前调用 shared config resolver，required config error 会阻断 planning。
- `src/update/update-plan.ts:202-207` 已按 installed skill directory path 调用 shared customization resolver，lookup key 来自目录 basename。
- Focused tests 覆盖 optional config/customization parse warning、human-owned TOML preservation、basename customization lookup、protected repair planning、merge-rule reuse。
- 本轮未发现 `decision_needed` 项。
- 本轮未发现 `defer` 项。
