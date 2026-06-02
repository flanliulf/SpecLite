---
Story: 6-4
Round: 1
Date: 2026-06-02
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，已按技能降级为串行三层审查模式：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由当前模型串行完成。因用户要求严格只读，未执行会写入 `dist/` 的 `npm run build`、`npm test` 或 `npm run release:packaging-check`；验证基于 Story 记录、相关 diff、源码/测试/fixture/CI/release artifacts 静态审查和只读命令。

结论：不通过。当前实现存在阻塞项：`path-portability` release gate 主要审查手写 expected artifacts，没有执行真实 CLI/fixture 状态；path escape / unsafe overwrite 与 terminal width matrix 覆盖不完整；packaging manifest 生成存在非幂等 package inventory 风险。建议修复后进入 Round 2 CR。

## 新发现

### 1. [高] `path-portability` gate 没有执行真实命令，手写 expected artifacts 可绕过 AC 3-8

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `test/story-6-4-path-portability.test.ts:51-171` 的核心 fixture 测试只读取 `expected/command-json/*.json`、`expected/resolve/*.json`、`expected/manifest-index/files-index.json` 并用 schema/字符串断言验证；该文件未导入或调用 `runInstallCommand`、`runStatusCommand`、`runValidateCommand`、`runUpdateCommand`，也未执行 `speclite resolve config/customization`。
  - `test/fixtures/path-portability/input/.gitkeep` 是唯一 input 内容；`find test/fixtures/path-portability` 显示 input 目录没有可触发 case conflict、symlink escape、path escape、LF、executable intent 或 shell invocation 差异的项目状态。
  - Story AC 3-8 要求当执行 `install`、`status`、`validate`、`update`、`resolve` 相关路径时证明 public path fields、LF、executable intent、case/symlink/path escape、shell invocation 和 terminal output 稳定；当前测试只证明手写 JSON 形状可解析。

- **影响**
  - 真实命令可以泄漏绝对路径、写入 CRLF、遗漏 executable intent、错误处理 symlink/path escape，测试仍然可能通过。
  - CI matrix 即使在 macOS/Windows + Node 22/24 上运行，也只是在不同平台重复解析同一批手写 expected files，无法形成 Story 6.4 要求的 release evidence。

- **建议**
  - 将 `path-portability` 变成可执行 release gate：从 `test/fixtures/path-portability/input/` 建立临时项目，实际运行 `install`、`status`、`validate`、`update`、`update --repair` 和 `resolve config/customization`，再用 semantic comparator 对比 expected artifacts。
  - 在 input fixture 中放入最小可复现场景：case-only collision、symlink escape、`..` path escape、LF canonical text、runtime script executable intent、Windows-compatible invocation metadata 和 no-color/narrow output 场景。

### 2. [高] AC 6 的 path escape / unsafe overwrite 没有被 path-portability fixture 覆盖

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `test/fixtures/path-portability/expected/command-json/validate.json:7-31` 只包含两个 issue：`file-integrity.case-conflict` 和 `artifact-path.symlink-escape`。
  - 对 `test/story-6-4-path-portability.test.ts` 与 `test/fixtures/path-portability/` 检索 `escapes-project`、`unsafe-overwrite`、`path escape` 没有命中；测试只在 `checkedCategories` 中看到 `runtime-path` / `artifact-path`，没有断言对应 path escape 或 unsafe overwrite issue。
  - Story AC 6 明确要求 case conflict、symlink escape、path escape 和 unsafe overwrite 均必须被阻断或由 validate 报告稳定 issue / conflict reason。

- **影响**
  - 当前 fixture 不能证明 `..` escape、artifact root escape、project boundary violation 或 unsafe overwrite 在 supported OS 上被稳定阻断。
  - 这会留下最关键的跨平台路径安全缺口，尤其是 Windows separator/drive-letter 与 symlink/path normalization 组合场景。

- **建议**
  - 增加 path escape 与 unsafe overwrite 的 explicit expected issues，例如 `artifact-path.escapes-project`、`runtime-path.escapes-project` 或 owning taxonomy 中更具体 code。
  - 增加测试断言这些 issue 必须存在，并确保 `ValidationIssue.details` 不包含 escaped absolute path。

### 3. [中] Terminal width matrix 只覆盖 `<80`，缺少 `80-119` 和 `>=120`

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `test/story-6-4-path-portability.test.ts:195-218` 只调用 `renderUpdateHumanOutput` 一次，参数为 `columns: 72`、`noColor: true`、`isTty: false`、`ci: true`。
  - `test/fixtures/path-portability/expected/human-output/` 只有 `compact-width-72.txt` 和 `evidence-no-color.txt`；没有 standard width `80-119`、wide width `>=120` 或独立 copy-paste review expected output。
  - Story AC 8 要求 terminal width `<80`、`80-119`、`>=120`，以及 `NO_COLOR`、non-TTY、CI、copy-paste review 下关键字段仍可读且顺序稳定。

- **影响**
  - 宽度断点只在窄终端上被验证，Standard/Wide renderer 仍可能丢失 path、issue id、target id、next action、planned effect、conflict reason、status、severity 或 artifact metadata。

- **建议**
  - 为 `80-119` 和 `>=120` 增加 expected human output 或生成式断言。
  - 将 `NO_COLOR`、non-TTY、CI、copy-paste review 拆成至少可辨别的组合断言，确保每个 automation-relevant field 都被覆盖。

### 4. [中] `release:packaging-check` 的 package inventory 依赖执行前是否已有 `dist/packaging-manifest.json`

- **来源**：blind+edge
- **分类**：patch

- **证据**
  - `scripts/release/packaging-check.mjs:7-21` 先运行 `npm pack --dry-run --json` 并把 `packResult.files` 固化为 inventory。
  - `scripts/release/packaging-check.mjs:79-83` 之后才写入 `dist/packaging-manifest.json`。
  - 当前 `dist/packaging-manifest.json:523-526` 的 inventory 包含 `dist/packaging-manifest.json`，这只会在执行前该文件已经存在时出现；干净 checkout 首次运行时，`npm pack` 的 inventory 不会包含稍后才写出的 manifest。

- **影响**
  - 同一个命令的 `files` 与 `packageHash` 会随执行历史变化：首次运行和二次运行的 package inventory 不一致。
  - 这削弱 AC 9 中 `dist/packaging-manifest.json` 作为 stable packaging acceptance artifact 的可信度，也可能让 release checklist 与实际将要发布的 package 内容不一致。

- **建议**
  - 在运行 `npm pack --dry-run --json` 前确定 manifest inclusion 策略：要么先生成临时/最终 manifest 再 pack，要么明确将 manifest 排除出 package inventory 并在 assertions 中固定该策略。
  - 增加幂等性测试：删除 `dist/packaging-manifest.json` 后连续运行两次，断言两次输出的 `files` 与 `packageHash` 一致。

## 验证摘要

- `npm test` 未执行（严格只读约束；当前 Story 6.4 测试会调用 `scripts/release/packaging-check.mjs` 并写入 `dist/packaging-manifest.json`）。
- `npm run lint` 未执行（项目未在本次审查范围内确认 lint script；严格只读）。
- `npm run build` 未执行（会写入 `dist/`，违反本轮只读约束）。
- 只读复核：
  - `git status --short`：确认工作树存在大量无关脏改，审查仅聚焦 Story 6.4 File List 与直接相关 artifacts。
  - `find _bmad-output/implementation-artifacts/code-reviews/6-4-code-review -maxdepth 2 -type f`：未发现既有 summary，本轮为 Round 1。
  - `find test/fixtures/path-portability -maxdepth 4 -print`：确认 input 只有 `.gitkeep`，expected artifacts 为手写快照集合。
  - `rg` 定向检索：确认 path-portability fixture 未命中 `escapes-project` / `unsafe-overwrite` 覆盖，terminal width 只看到 `columns: 72`。

## 通过项

- `.github/workflows/ci.yml:15-17` 配置了 OS matrix `macos-13` / `windows-2022` 和 Node matrix `[22, 24]`，未引入 Node 20 或 Node 26。
- `package.json:20-23` 将 `release:packaging-check` 接到 `node scripts/release/packaging-check.mjs`，且 `package.json:9-11` 的 `engines.node` 仍为 `>=22`。
- `test/fixtures/path-portability/expected/command-json/update.json` 未混入 `repairPlan`，`test/fixtures/path-portability/expected/command-json/update-repair.json` 使用 `command: "update.repair"` 并能被 `RepairCommandResultSchema` 解析，normal update 与 explicit repair 的快照边界基本清晰。
- `src/fixtures/fixture-contract.ts:65-77` 将 `skill-artifact-loop` 保持为 `pending` / `deferred-to-story-6-5`，本 Story File List 内未发现提前实现 6.5 release gate 的新增行为。
