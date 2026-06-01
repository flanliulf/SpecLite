---
Story: 5-2
Round: 2
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。由于当前 Codex 环境没有可调用的内部 `Agent` 工具，本轮按 `bmenhance-cr-01-reviewer` 降级策略，由当前 reviewer 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层视角；未执行 evaluator、fixer、rules、todo 或 finalizer。

Round 1 的 3 个 P1 均已修复并由 focused tests 覆盖：private registry 已有最小 runtime config contract，缺 config 时在调用 client 前返回 auth-required，有 config 时成功解析；registry success descriptor 已移除顶层 `resolvedRoot` package identity；validate local-only consistency 已覆盖 trusted-without-verified-evidence、blocked installed descriptor 和 unverified failed lock evidence。`npm run build`、focused registry tests、affected tests、全量 `npm test` 和 `git diff --check` 均通过；`npm run lint` 仍因项目没有定义 `lint` script 失败。未发现新的阻塞问题，本轮 reviewer 建议通过。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — Private registry 目前没有真实的显式 endpoint/config lifecycle，成功路径只存在于 injected test client
   - 修复位置：`src/source/registry-source-resolver.ts:32-37` 定义最小 `RegistryRuntimeConfig`；`src/source/registry-source-resolver.ts:95-114` 在 private registry 缺少显式 runtime config、kind/package/channel 绑定不匹配或 label 非 display-safe 时，返回 `source-integrity.authentication-required` 且不调用 metadata client；`src/commands/install.ts:292-299` 仅在 private registry path 传入该 runtime config。
   - 验证结果：`test/registry-source-resolution.test.ts:169-209` 覆盖 resolver 缺 config 时 blocked/auth-required 且不调用 client；`test/registry-source-resolution.test.ts:387-439` 覆盖 confirmed injected private runtime config 成功生成 descriptor 且 public output 不泄露 secret；`test/registry-source-resolution.test.ts:441-488` 覆盖 install path 缺 config 时不调用 client。
   - 范围复核：未新增 CLI flag、持久配置文件、token scope、`.npmrc` 解析或完整 auth lifecycle；`src/bin/speclite.ts:123-149` 仍只有既有 source/channel/version 参数。

2. Round 1 / Finding #2 — Registry SourceDescriptor 把 package identity 放进 `resolvedRoot`，违反 AC3 的 identity 投影边界
   - 修复位置：`src/source/registry-source-resolver.ts:235-247` 的 registry success descriptor 不再写入顶层 `resolvedRoot`；package identity 只保留在 `integrityEvidence[].packageName`。
   - 验证结果：`test/fixtures/source-integrity/registry-unverified/expected/source-descriptor.json:1-15` 与 `test/fixtures/source-integrity/registry-lock-trusted/expected/source-descriptor.json:1-22` 均无顶层 `resolvedRoot`；`test/registry-source-resolution.test.ts:48-65`、`test/registry-source-resolution.test.ts:93-110`、`test/registry-source-resolution.test.ts:156-159` 断言 success descriptor 结构。

3. Round 1 / Finding #3 — `validateSourceIntegrity` 只检查 evidence 是否存在，未校验 trusted/blocked 与 evidence verification 的本地一致性
   - 修复位置：`src/validation/rules/source-integrity.ts:21-68` 增加 registry/lock evidence 缺失、installed blocked descriptor、trusted-without-verified-evidence、unverified failed `version-lock` evidence 的 local-only consistency checks。
   - 验证结果：`test/registry-source-resolution.test.ts:491-665` 覆盖 missing evidence、trusted-without-verified-evidence、blocked installed descriptor、unverified failed lock evidence；`src/validation/validate-project.ts:105-112` 只调用本地 `validateSourceIntegrity`，没有 registry client、latest 或 freshness check。

### 仍为非阻塞待办

无。

## 新发现

本轮未发现新的阻塞项或中高优先级问题。

### [低][新] `install.ts` 重复 orchestration 仍维持 dismiss

- **来源**：blind
- **分类**：dismiss

- **证据**
  - Round 1 evaluator 已明确该项可忽略，不列 blocker；本轮复核 `src/commands/install.ts:261-339` 与 `src/commands/install.ts:638-940` 后，未发现 fixer 引入新的行为失败。

- **影响**
  - 仍是维护风险，但没有证明违反 Story 5.2 AC；若此时重构会扩大本轮修复范围。

- **建议**
  - 本 Story 继续不作为 blocker；如后续要治理，应另起专门重构或 TODO，不阻断 Story 5.2 CR。

## 验证摘要

- `npm test -- test/registry-source-resolution.test.ts` ✅ 通过（1 file / 13 tests）。
- `npm run build` ✅ 通过（tsup ESM 与 DTS build 成功）。
- `npm test -- test/source-selection.test.ts test/registry-source-resolution.test.ts test/contract-anchors.test.ts test/status-command.test.ts test/validate-command.test.ts` ✅ 通过（5 files / 56 tests）。
- `npm run lint` ❌ 失败：`Missing script: "lint"`，项目当前未定义 lint script。
- `npm test` ✅ 通过（31 files / 222 tests）。
- `git diff --check` ✅ 通过。
- 额外复核：
  - Private registry 缺 runtime config 时 auth-required 且不调用 client；有 explicit runtime config 时成功解析 injected metadata。
  - Registry success descriptor 中 package identity 只在 `integrityEvidence[].packageName`；success fixtures 无顶层 `resolvedRoot`。
  - Validate 只读本地 manifest/source descriptor；未发现 registry access、latest check、freshness check。
  - 未发现 Story 5.3 tarball/offline/local path、Story 5.4 Git source pinning、Story 5.5 full trust reporting、Epic 6 fixture matrix 或 Post-MVP command 的新增越界实现。

## 通过项

- No access/no write before confirmation 边界仍成立：registry source 未确认时停在 `source-discovery`，不调用 registry client、不获取 operation lock、不写 manifest。
- `--yes` 仍只代表 command-level write authorization，不自动确认 source access。
- Trust derivation 仍由 expected hash 或 version-lock verified evidence 驱动；registry SRI alone 为 `unverified`。
- Registry diagnostics/details 保持 redaction-safe，未发现 token、credential-bearing URL、private query、proxy secret、stack trace、absolute temp/root path 进入 public JSON/human output/fixtures。
- `status` / `validate` 仍基于 installed local state；本轮未发现 remote freshness/latest/provenance revalidation。

## 结论

- **结论：通过**
- **阻塞项**：无。
- **四桶数量**：decision_needed 0；patch 0；defer 0；dismiss 1。
- **建议**：进入 Round 2 evaluator 复核；若 evaluator 同意本结论，则不需要 fixer 循环，可继续后续 CR 04/05/06 收尾步骤。
