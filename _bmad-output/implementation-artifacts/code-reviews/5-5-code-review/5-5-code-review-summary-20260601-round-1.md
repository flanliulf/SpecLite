---
Story: 5-5
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 调度工具不可用，已按 skill fallback 在当前 reviewer 中串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。focused tests、`npm test`、`npm run build` 均通过；项目 `package.json` 无 `lint` script，未运行 `npm run lint`。

结论：不通过。发现 1 个需要明确修复的 `patch` 项，原因是 blocked source 的写入阻断没有落在 install plan / apply 写入边界本身，当前主要依赖 `runInstallCommand` 上游分支避免进入写入。

四桶数量：`decision_needed=0`，`patch=1`，`defer=0`，`dismiss=0`。

## 新发现

### 1. [中] 写入边界未直接拒绝 `trustStatus=blocked` 的 SourceDescriptor

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/installer/install-plan-schema.ts:42-51` 的 `InstallPlanSchema` 只校验 `sourceDescriptor` shape、planned writes、confirmation 和 `writeAuthorized`，没有禁止 `sourceDescriptor.trustStatus === "blocked"`。
  - `src/installer/runtime-structure.ts:35-45` 的 `applyInstallPlan` 只在 `writeAuthorized` 为 false 时返回，不检查 blocked source。
  - 同一函数随后会获取 operation lock 并开始创建目录、写 config、IDE mirrors 和 manifest/index；见 `src/installer/runtime-structure.ts:64-68`、`src/installer/runtime-structure.ts:84-96`、`src/installer/runtime-structure.ts:188-230`。
  - 当前 CLI 主路径确实在 `runInstallCommand` 上游对 registry/local/Git/bundled blocked resolution 返回 failure，不会正常走到 apply；但 install plan / apply 写入边界本身仍可接受一个由测试、未来 update path 或内部调用构造的 blocked descriptor。

- **影响**
  - AC4 要求 blocked source 在 install/update 写入前停止。当前保护分散在 resolver/command 分支，写入边界没有本地 invariant；后续复用 `InstallPlanSchema` 或 `applyInstallPlan` 时容易绕过 blocked gate。
  - 这不是当前 focused CLI happy path 的测试失败，但属于核心 source-integrity write eligibility 缺口。

- **建议**
  - 在 `InstallPlanSchema.superRefine` 或 `applyInstallPlan` 入口增加硬门禁：`sourceDescriptor.trustStatus === "blocked"` 时返回/抛出稳定 `source-integrity` 或 `operation-lock` 失败，且不得 acquire lock 或写任何文件。
  - 补一条定向测试：构造 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus="blocked"` 的 install plan，断言 `applyInstallPlan` 不创建 `_speclite`、不写 manifest/index、返回稳定 issue。

## 验证摘要

- `npm test -- test/source-descriptor-trust-reporting.test.ts test/source-and-modules.test.ts test/registry-source-resolution.test.ts test/local-source-integrity.test.ts test/git-source-resolution.test.ts test/status-command.test.ts test/validate-command.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts` 通过（9 / 9 test files，104 / 104 tests）
- `npm test` 通过（34 / 34 test files，256 / 256 tests）
- `npm run build` 通过（tsup ESM 与 DTS build success）
- `npm run lint` 未运行：`package.json` scripts 中没有 `lint`
- `git diff --check -- <Story 5.5 reviewed files>` 通过

## 通过项

- `SourceDescriptorSchema` 只允许 owning SPEC 声明的 7 个 `sourceType` 与 4 个 `SourceIntegrityEvidence.kind`，并拒绝非 blocked 空 evidence、trusted 无 verified evidence、registry/Git `contentHash`、local content hash 缺失、Git 非 full SHA version、unsafe `resolvedRoot`。
- `deriveSourceTrustStatus` 已被 bundled、registry、local、Git resolver 统一调用；resolver 成功路径将 no-anchor evidence 推导为 `unverified`，expected hash / lock / bundled package-lock evidence 推导为 `trusted`，blocking issue / missing evidence 推导为 `blocked`。
- Public JSON、manifest/index、status/install/validate human output 和 source-integrity fixture 的 source projection 使用 redacted/display-safe labels，未发现 credential、private URL/query、home/absolute/cache/temp/staging/Git checkout/raw stderr/stack trace 泄漏。
- `status` 与 `validate` 读取本地 installed manifest/index/files/IDE state；未发现 registry、Git remote、local origin、cache 或 provenance 访问。
- Story 5.4 `TODO-004` 已覆盖：resolved Git install human output 显示 `confirmationState=confirmed`，未确认 access gate 仍保持 `pending` 且不调用 Git client。
- 未发现越界实现 Epic 6 full fixture matrix、source lockfile lifecycle、enterprise policy/signatures/provenance 或 Post-MVP commands。
