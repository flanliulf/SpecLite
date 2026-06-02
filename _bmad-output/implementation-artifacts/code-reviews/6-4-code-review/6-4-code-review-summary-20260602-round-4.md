---
Story: 6-4
Round: 4
Date: 2026-06-02
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 工具不可用，已按技能降级为串行三层审查模式：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由当前模型串行完成。已读取 Round 1/2/3 review、Round 1/2/3 evaluation，以及最新 evaluation 中的“修复执行记录”，重点复核 Round 3 的 project-boundary path escape 修复，并回归确认 packaging、unsafe overwrite、exit-code semantics。

结论：通过。Round 3 blocking 已闭环：`path-portability` expected validate snapshot 现在覆盖源码真实项目边界逃逸分支，使用 `details.reason: "path-escapes-project"`，没有退化为 `outside-configured-root`。Packaging manifest inventory 与 `npm pack --dry-run --json` 仍一致；unsafe overwrite expected issue 仍存在；真实 CLI gate 仍断言 exit code 与 `CommandResult.status` 语义。未发现新的阻塞项。

## 上轮问题回顾

### 已修复

1. Round 3 / Finding #1 — `path-portability` expected validate snapshot 未覆盖真正 project-boundary path escape
   - 修复位置：`test/fixtures/path-portability/expected/command-json/validate.json:33-43` 将 `artifact-path.escapes-project` 的 expected evidence 固定为 `affectedPath: "artifact:actualArtifactPath"`、`details.pathRole: "actualArtifactPath"`、`details.reason: "path-escapes-project"`。
   - 修复位置：`test/story-6-4-path-portability.test.ts:197-215` 显式断言 expected validate snapshot 必含 `artifact-path.escapes-project`，并断言 `affectedPath`、`pathRole` 与 `reason: "path-escapes-project"`。
   - 验证结果：源码真实 project-boundary escape 分支位于 `src/validation/rules/artifact-path.ts:111-129`，其稳定 reason 是 `path-escapes-project`；对应单元锚点 `test/artifact-path-validation.test.ts:43-64` 使用 `actualArtifactPath: "../outside/report.md"`。当前 expected snapshot 已覆盖该分支语义，未再使用 `outside-configured-root`。

### 仍为非阻塞待办

无来自上轮的既有非阻塞待办。

## 新发现

### 1. [低][新] 动态 CLI smoke gate 仍只按 issue id 验证 path escape，未断言实际 validate 输出的 `details.reason`

- **来源**：edge+auditor
- **分类**：defer

- **证据**
  - `test/story-6-4-path-portability.test.ts:117-123` 对真实 `speclite validate --json` 输出只断言存在 `artifact-path.escapes-project`、`file-integrity.case-conflict`、`file-integrity.unsafe-overwrite-risk`，未断言真实输出中 `artifact-path.escapes-project.details.reason`。
  - `test/story-6-4-path-portability.test.ts:436-443` 的动态故障注入仍将 `artifactContract.defaultOutputPath` 设为 `reports/outside-artifacts`，该语义更接近 configured artifact root 外部路径；Round 3 指定的 project-boundary branch 已由 expected snapshot gate 覆盖，而不是由动态 smoke gate 覆盖。

- **影响**
  - 该项不影响 Round 3 blocking 结论：expected validate snapshot 已经硬断言 `path-escapes-project`，并与源码真实分支对齐。
  - 后续若希望动态 smoke gate 与 expected snapshot 完全同构，当前测试还可以补充真实 validate 输出的 `details.reason` 断言，降低未来 issue id 相同但 reason 退化的误判概率。

- **建议**
  - 非阻塞补强：在真实 CLI gate 的 `validate.issues` 断言中匹配 `artifact-path.escapes-project` 的 `affectedPath`、`details.pathRole` 与 `details.reason`；如要让动态场景也触发 project-boundary escape，则补充 `../` 或等价 project-boundary fault 注入。

## 验证摘要

- `npm test` 未执行：本轮用户要求严格只读，且 Story 6.4 测试会删除/重写 `dist/packaging-manifest.json`。
- `npm run lint` 未执行：严格只读，本轮未扩大范围确认 lint script。
- `npm run build` 未执行：会写入 `dist/`，违反本轮只读约束。
- 额外复核：
  - 已读取 `6-4-code-review-summary-20260602-round-1.md`、`round-2.md`、`round-3.md` 与对应 evaluation 文件。
  - 已重点读取最新 evaluation 的“修复执行记录”，确认其声明的 2 个修改文件为 `test/fixtures/path-portability/expected/command-json/validate.json` 与 `test/story-6-4-path-portability.test.ts`。
  - 已只读核对 `test/fixtures/path-portability/expected/command-json/validate.json`、`test/story-6-4-path-portability.test.ts`、`src/validation/rules/artifact-path.ts`、`test/artifact-path-validation.test.ts`、`scripts/release/packaging-check.mjs`、`package.json`、`dist/packaging-manifest.json`。
  - 已只读执行 `npm pack --dry-run --json` inventory 比对：`packCount: 504`，`manifestCount: 504`，`includesManifestInPack: true`，`includesManifestInManifest: true`，`equal: true`，差异列表为空。

## 通过项

- Round 3 blocking 已修复：expected validate snapshot 现在覆盖 `details.reason: "path-escapes-project"`，并由 expected-output gate 明确断言。
- Unsafe overwrite 仍闭环：`test/fixtures/path-portability/expected/command-json/validate.json:46-60` 保留 `file-integrity.unsafe-overwrite-risk`，`test/story-6-4-path-portability.test.ts:197-203` 继续断言 expected issue set 包含该 issue。
- Packaging acceptance 仍闭环：`scripts/release/packaging-check.mjs:19-23` 使用 normalized self-entry 策略将 `dist/packaging-manifest.json` 纳入 `files`；`dist/packaging-manifest.json` 与真实 `npm pack --dry-run --json` inventory 均为 504 项且完全一致。
- Exit-code semantics 仍闭环：`test/story-6-4-path-portability.test.ts:95-106` 断言 `update`、`update --repair`、`validate` 的 JSON status 为 `failure`，并断言真实 CLI gate 的 exit code 序列为 `[0, 0, 0, 0, 1, 1, 1]`。
- 未发现 fixture 目录误打包、Story 6.5 `skill-artifact-loop` 提前实现、normal update 混入 repair plan 或 package inventory 新差异。

## 结论

- **结论：通过**
- **阻塞项**：无
- **非阻塞项**：
  1. 动态 CLI smoke gate 可进一步断言真实 validate 输出的 `artifact-path.escapes-project.details.reason`，或补充 project-boundary fault 注入，使动态场景与 expected snapshot 同构。
- **建议**：可进入 evaluator 复核；上述非阻塞项可作为后续测试稳健性补强，不阻塞 Story 6.4 本轮 CR 通过。
