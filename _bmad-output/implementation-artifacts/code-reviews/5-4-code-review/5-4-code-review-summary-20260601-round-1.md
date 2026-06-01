---
Story: 5-4
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。内部 Agent 调度工具在当前 reviewer 中不可用，已按 skill fallback 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；三层逻辑审查均完成。`npm test -- test/git-source-resolution.test.ts`、`npm test`、`npm run build` 均通过；项目 `package.json` 无 `lint` script，未运行 `npm run lint`。本轮发现 3 个 `patch` 桶问题，其中 2 个为阻塞 Story 5.4 Git pinning / validate shape 契约的问题。结论：不通过。

四桶数量：`decision_needed=0`，`patch=3`，`defer=0`，`dismiss=0`。

## 新发现

### 1. [高] installed Git descriptor 可以用非 SHA selector 伪装为 `git-commit` evidence 并通过 validate

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/source/source-descriptor-schema.ts:41-45` 只要求 `git-commit.commitSha` 是非空字符串；`src/source/source-descriptor-schema.ts:53-58` 也只要求 `version` 是非空字符串，没有 40-hex commit SHA shape 约束。
  - `src/validation/rules/source-integrity.ts:70-87` 对 Git descriptor 的本地 validate 只检查 `descriptor.version` 存在、存在 `git-commit` evidence、且某条 evidence 的 `commitSha === descriptor.version`。
  - 定向复现：用 `version: "main"`、`integrityEvidence: [{ kind: "git-commit", commitSha: "main", verified: false }]` 调用 `validateSourceIntegrity`，实际返回 `{"issues":[],"validatedPaths":["_speclite/_config/manifest.yaml"]}`。

- **影响**
  - 这会让已安装 manifest 中的 branch/tag/raw selector 以 `git-commit` evidence 形态通过本地 validate，违背 AC1/AC3/AC6 对 concrete commit SHA 和 local evidence shape 的要求。
  - 该问题会削弱 Story 5.4 对 floating Git source 的后置防线：即使 install resolver 阶段阻断了部分 floating 输入，落盘后的 malformed Git descriptor 仍可能被 validate 视为健康。

- **建议**
  - 在 `SourceIntegrityEvidenceSchema` 对 `git-commit.commitSha` 增加 full 40-hex SHA 约束，并确保 `SourceDescriptor.version` 在 `sourceType === "git"` 时也必须是同一 full SHA。
  - 在 `validateSourceIntegrity` 的 Git 分支中显式拒绝 non-SHA `version` / `commitSha`，返回 stable redacted `source-integrity.floating-git-source` 或 `source-integrity.missing-evidence` issue。
  - 补充 focused test：manifest 中 `version=main`、`commitSha=main` 必须失败；short SHA、tag、branch、symbolic ref 也必须失败。

### 2. [高] explicit commit SHA 没有被证明为 commit-ish 就可成为 `git-commit` evidence

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - `src/source/git-source-resolver.ts:236-239` 对 `requestedRefKind === "commit"` 的处理只检查 `ls-remote` 输出中是否存在同 oid；没有调用 `git rev-parse --verify --end-of-options <rev>^{commit}` 或等价 commit-ish verification。
  - `src/source/git-source-resolver.ts:250-260` 只解析 `<oid>\t<ref>`，不会区分 commit object、annotated tag object 或其它 advertised object。
  - 定向复现：mock `lsRemote` 返回 `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\trefs/tags/v1.0.0\n`，请求同一个 40-hex selector，`resolveGitSource` 实际返回 `ok: true`、`kind: "git-commit"`、`trustStatus: "unverified"`。

- **影响**
  - Story 5.4 明确要求 explicit commit SHA 不能只做字符串 shape 检查，必须由 resolver 证明为 commit-ish；当前实现可把非 commit object 的 advertised oid 当成 commit evidence。
  - 这会污染 `version` 和 `git-commit` evidence，进而允许 install planning 基于未证明的对象继续。

- **建议**
  - 扩展 `GitClient` abstraction，显式返回已验证的 commit-ish SHA，或增加 `verifyCommit`/`resolveCommit` 步骤；测试里 mock 该步骤。
  - 对 tag/ref resolution 也应保证最终 `commitSha` 是 dereferenced commit-ish，而不是仅仅是任意 advertised oid。
  - 补充 negative tests：annotated tag object oid、non-commit oid、未能 commit-ish verify 的 explicit SHA 均必须 blocked。

### 3. [低] human output 在确认并成功解析后仍固定显示 `confirmationState=pending`

- **来源**：blind
- **分类**：patch

- **证据**
  - `src/diagnostics/output.ts:498-514` 的 `formatInstallExternalAccess` 仅从 `sourceDescriptor` 推导 external access 展示，并硬编码 `"confirmationState=pending"`。
  - `src/diagnostics/output.ts:354-357` 在 ready summary 中也复用该函数；因此 confirmed Git source 成功安装后，human output 仍会展示 pending。
  - `test/git-source-resolution.test.ts:250-298` 覆盖 confirmed Git branch success 和 redaction，但没有断言 human output 中的 confirmation state 已从 pending 变为 confirmed。

- **影响**
  - 这不直接造成写入绕过，但 public human output 会与实际流程矛盾：Git remote 已经在确认后访问并成功解析，却仍显示 pending。
  - 对 AC4 的 external access intent/confirmation 可审计性有诊断质量风险。

- **建议**
  - 将 `sourceResolutionPlan.externalAccesses` 或等价 confirmed state 投影到 install result 可渲染数据，避免从 `sourceDescriptor` 反推。
  - 补充 confirmed Git install human output test，断言成功路径显示 `confirmationState=confirmed`，未确认路径显示 `pending`。

## 验证摘要

- `npm test -- test/git-source-resolution.test.ts` ✅ 通过（9 / 9）
- `npm test` ✅ 通过（245 / 245）
- `npm run lint` 未运行：`package.json` 无 `lint` script
- `npm run build` ✅ 通过（tsup ESM 与 DTS build success）
- 定向复现：
  - `validateSourceIntegrity` 对 non-SHA `git-commit` evidence 返回 `issues: []`，复现 Finding 1。
  - `resolveGitSource` 在 explicit 40-hex selector 只由 arbitrary advertised ref echo 时返回 `ok: true`，复现 Finding 2。

## 通过项

- 未确认 Git source 在 `src/commands/install.ts:223-274` 返回 failure，测试 `test/git-source-resolution.test.ts:202-248` 证明不调用 Git client、不创建 `_speclite`、不返回 install plan。
- confirmed branch 成功路径保留 `requestedVersion: "main"`，`version` 和 `git-commit.commitSha` 使用 resolved commit SHA，测试 `test/git-source-resolution.test.ts:250-298` 覆盖该行为。
- floating remote-only source 在 `src/source/git-source-resolver.ts:61-71` blocked，测试 `test/git-source-resolution.test.ts:300-340` 覆盖 no Git client、no install plan、no write。
- authentication / unreachable / unresolved failures 使用 stable `source-integrity` issue，`src/source/source-integrity.ts:119-145` 只生成 redacted-safe details。
- status / validate 当前实现保持 local-only；`test/git-source-resolution.test.ts:413-516` 通过本地 manifest fixture 验证不会依赖 Git client 或 remote。
- 未发现本轮实现提前引入 Story 5.5 full reporting matrix、Epic 6 full fixture matrix、enterprise policy、signatures、provenance verification 或 full source lockfile lifecycle。
