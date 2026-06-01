---
Story: 5-2
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。由于当前 Codex 环境没有可调用的内部 `Agent` 工具，本轮按 `bmenhance-cr-01-reviewer` 降级策略，由当前 reviewer 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层视角；未进行 evaluator、fixer、rules、todo 或 finalizer。

`npm run build`、focused registry/source tests、全量 `npm test` 和 `git diff --check` 均通过；`npm run lint` 失败原因是项目没有定义 `lint` script。审查发现 1 个需决策阻塞项和 2 个明确修复项，建议本轮 CR 不通过，进入 evaluator/fixer 前先裁决 private registry config lifecycle。

## 新发现

### 1. [高] Private registry 目前没有真实的显式 endpoint/config lifecycle，成功路径只存在于 injected test client

- **来源**：auditor+edge
- **分类**：decision_needed

- **证据**
  - Story AC2 要求 private registry resolution 使用用户显式配置的 registry/channel 信息：`_bmad-output/implementation-artifacts/stories/5-2-registry-source-resolution-and-diagnostics.md:21-25`。
  - CLI 新增参数只有 `--source`、`--source-value`、`--channel`、`--version`，没有 private registry endpoint/config 输入或 lifecycle：`src/bin/speclite.ts:123-132`。
  - resolver client contract 只接收 `sourceType`、`packageName`、`requestedVersion`、`channel`、`registryKind`，没有 registry endpoint/config/token scope 的 private in-memory 输入：`src/source/registry-source-resolver.ts:21-28`。
  - 默认 registry client 对 `private-registry` 直接抛出 authentication-required，无法从用户显式配置解析 private registry：`src/source/registry-source-resolver.ts:219-226`。
  - 唯一成功的 private registry install 测试通过 `registryClient` 注入 metadata：`test/registry-source-resolution.test.ts:326-346`，没有覆盖 CLI / public runtime 如何取得显式 private registry config。

- **影响**
  - Story 5.2 声称支持 private registry source resolution，但真实 CLI 用户没有可用配置入口；这会把 AC2 的成功路径降级成测试专用 dependency injection。
  - 如果 fixer 直接添加 `--registry-url` 或类似字段，会触及 redaction、public projection、manifest 禁止字段、token scope 和 config lifecycle，属于需要产品/契约决策的边界。

- **建议**
  - 先由 evaluator/owner 裁决 Story 5.2 范围：要么在本 Story 定义 private registry explicit config 的最小 contract（例如 private in-memory runtime input + redacted label + no manifest projection），要么把 private registry 成功解析明确降级为 blocked/auth-required，并调整 AC/测试口径。
  - 在裁决前不要在 fixer 中猜测 registry endpoint CLI flag、config file 字段或 token lifecycle。

### 2. [中] Registry SourceDescriptor 把 package identity 放进 `resolvedRoot`，违反 AC3 的 identity 投影边界

- **来源**：auditor
- **分类**：patch

- **证据**
  - Story AC3 明确要求 registry package identity 只能通过 `integrityEvidence[].packageName` 表示：`_bmad-output/implementation-artifacts/stories/5-2-registry-source-resolution-and-diagnostics.md:27-31`。
  - 成功 resolver 仍设置 `resolvedRoot: packageName`：`src/source/registry-source-resolver.ts:203-214`。
  - registry fixtures 也把 private package name 投影到 top-level `resolvedRoot`：`test/fixtures/source-integrity/registry-unverified/expected/source-descriptor.json:1-15`、`test/fixtures/source-integrity/registry-lock-trusted/expected/source-descriptor.json:1-22`。

- **影响**
  - `SourceDescriptor` 中出现第二处 registry package identity，和 AC3 的 automation contract 不一致。
  - 后续 manifest/status/install JSON 消费方可能依赖 `resolvedRoot` 作为 package identity，扩大未来删除或脱敏的兼容性成本。

- **建议**
  - registry success descriptor 中不要用 `resolvedRoot` 承载 package name；package identity 保留在 `registry-integrity` / `version-lock` evidence 的 `packageName`。
  - 同步更新 focused tests 与 fixtures，确保 `formatSourceDescriptor` / human output 不依赖 registry `resolvedRoot` 显示 package identity。

### 3. [中] `validateSourceIntegrity` 只检查 evidence 是否存在，未校验 trusted/blocked 与 evidence verification 的本地一致性

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - Source descriptor contract 要求 `trusted` 只能由 expected hash、lock match 或等价 trust anchor 产生，并且 `blocked` 必须在写入前停止：`_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md:82-97`。
  - 当前 validate 规则只要发现 `registry-integrity` 或 `version-lock` evidence 就直接通过：`src/validation/rules/source-integrity.ts:21-30`。
  - 这意味着本地 manifest 若被篡改为 `trustStatus: "trusted"` 但只有 `registry-integrity.verified=false`，或 `trustStatus: "blocked"` 但仍带 evidence，validate 不会产生 `source-integrity` issue。

- **影响**
  - AC7 要求 validate 对本地 descriptor 和 integrity evidence shape 做检查且保持 local-only；当前检查没有覆盖最关键的 trust/evidence consistency。
  - 安装路径自身目前不会由 registry SRI alone 产生 trusted，但 validate 无法发现 installed state drift 或手工篡改后的错误 trusted 状态。

- **建议**
  - 在 `validateSourceIntegrity` 中增加本地一致性规则：`trusted` 必须至少有一条 `verified: true` evidence；registry source `blocked` 应报告本地 source-integrity issue；registry source `unverified` 至少需要 reproducible registry/lock evidence 且不能有 failed verification 语义。
  - 补充 validate focused tests，覆盖 trusted-without-verified-evidence、blocked-installed-registry-source 和 missing evidence。

## 验证摘要

- `npm run build` 通过（tsup ESM 与 DTS build 成功）。
- `npm test -- test/source-selection.test.ts test/registry-source-resolution.test.ts` 通过（2 files / 18 tests）。
- `npm test` 通过（31 files / 217 tests）。
- `npm run lint` 失败：`Missing script: "lint"`，项目当前未定义 lint script。
- `git diff --check` 通过。
- 定向审查：
  - `--yes` 未自动确认 registry source access；JSON mode 下未提供 `confirmSourceAccess` 时 registry client 不会被调用。
  - Registry tests 使用 injected client / local temp fixtures，未发现真实 npm/private registry、Git remote、npm cache 或外部网络访问。
  - `trustStatus: "trusted"` 的 resolver 生成路径来自 expected integrity 或 lock evidence 的 `verified: true`，registry SRI alone 为 `unverified`。
  - `status` 读取 installed state，`validate` 读取 local manifest/rules，未发现 freshness/latest remote check。

## 通过项

- No access/no write before confirmation 边界基本继承 Story 5.1：未确认 registry source access 时在 `source-discovery` 后停止，不获取 operation lock、不写 manifest、不调用 registry client。
- `--yes` 只作为 command-level write authorization，没有自动确认 source access。
- Registry diagnostics 使用稳定 `source-integrity` issue id，当前 reviewed path 未发现 token、credential-bearing URL、query、fragment、private host 或 stack trace 泄露到 public output。
- 未发现 Story 5.3 tarball/offline/local path、Story 5.4 Git pinning、Story 5.5 full trust reporting、Epic 6 fixture matrix 或 Post-MVP command 的提前实现。
- `src/commands/install.ts` 的重复 orchestration 是明显维护风险，但本轮没有发现它单独造成 AC 行为失败；真正阻塞点是 private registry config lifecycle 未定义。
