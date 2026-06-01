---
Story: 5-4
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (codex)
Review Source: 5-4-code-review-summary-20260601-round-1.md
Review Model: GPT-5 Codex (codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-4 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 提出的 3 个 patch 桶发现均为真实问题；其中 2 个直接破坏 Git commit pinning / local validate evidence shape 契约，阻塞交付；1 个是 confirmed Git install 成功后的 human output 状态展示错误，影响诊断可审计性但不改变访问门禁和写入门禁，建议纳入 CR TODO 非阻塞跟踪。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[高] installed Git descriptor 可以用非 SHA selector 伪装为 `git-commit` evidence 并通过 validate**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码验证确认该问题成立。`src/source/source-descriptor-schema.ts:41-45` 对 `git-commit.commitSha` 只做 `z.string().min(1)`，未约束 full 40-hex SHA；`src/source/source-descriptor-schema.ts:49-60` 对 `SourceDescriptor.version` 也只做非空字符串约束，没有在 `sourceType === "git"` 时要求与 concrete commit SHA 语义一致。`src/validation/rules/source-integrity.ts:70-87` 的 Git validate 分支只检查 `descriptor.version` 存在、存在 `git-commit` evidence、且某条 evidence 的 `commitSha === descriptor.version`，没有验证两者是 full SHA。

独立复现命令：

```bash
npx tsx -e 'import { validateSourceIntegrity } from "./src/validation/rules/source-integrity.ts"; const r=validateSourceIntegrity({manifest:{schemaVersion:"speclite.manifest.v1",sourceDescriptor:{sourceType:"git",requestedVersion:"main",version:"main",resolvedRoot:"redacted-git-remote",integrityEvidence:[{kind:"git-commit",commitSha:"main",verified:false}],trustStatus:"unverified"},installedModules:[],targetIds:[],paths:{projectRoot:".",specliteRoot:"_speclite",artifactRoot:"_speclite-output",manifestPath:"_speclite/_config/manifest.yaml"}}}); console.log(JSON.stringify(r));'
```

输出为 `{"issues":[],"validatedPaths":["_speclite/_config/manifest.yaml"]}`，证明 non-SHA selector 可伪装为 installed `git-commit` evidence 并通过 validate。

**严重性判断：合理**

Story 5.4 AC1 要求只有 resolved commit SHA 存在时才允许进入 install planning，AC3 要求 requested branch/tag/input ref 不得覆盖 resolved version 或 commit evidence，AC6 要求 validate 对本地 descriptor/evidence shape 做检查。当前 validate 可接受 `version=main` / `commitSha=main`，属于本地 installed-state 后置门禁失效，阻塞 Story 5.4 交付。

**修复建议：可行**

最小修复边界：

- 在 source descriptor schema 或共享 helper 中定义 full 40-hex SHA 约束，并对 `git-commit.commitSha` 强制校验。
- 在 Git validate 分支中显式拒绝 non-SHA `descriptor.version` / non-SHA `git-commit.commitSha`，返回稳定 `source-integrity.floating-git-source` 或 `source-integrity.missing-evidence`。
- 补充 focused tests：`version=main` / `commitSha=main`、short SHA、tag/branch/symbolic ref 作为 installed Git evidence 均必须失败。
- 保持 AC6 local-only：不得在 validate 中访问 Git remote、fetch、clone 或重新验证 freshness/provenance。

**误报评估：非误报**

该发现有 schema、validate 分支和独立复现输出共同支撑，不是误报。

---

## 发现 #2 评估

### 审查原文

> **[高] explicit commit SHA 没有被证明为 commit-ish 就可成为 `git-commit` evidence**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/source/git-source-resolver.ts:43` 定义 full SHA shape；`src/source/git-source-resolver.ts:286-289` 将 full SHA selector 归类为 `commit`。但真正选择 resolved commit 时，`src/source/git-source-resolver.ts:229-248` 只解析 `git ls-remote` 输出；当 `requestedRefKind === "commit"` 时，`src/source/git-source-resolver.ts:236-239` 只要任意 entry 的 `oid` 等于 requested SHA，就直接返回该 SHA。`src/source/git-source-resolver.ts:250-260` 仅校验 `<40-hex>\t<ref>` 文本 shape，不区分该 oid 是 commit object、annotated tag object 或其它 advertised object。

独立复现命令：

```bash
npx tsx -e 'import { resolveGitSource } from "./src/source/git-source-resolver.ts"; import { normalizeSourceSelection } from "./src/source/source-selection.ts"; void (async()=>{ const oid="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; const s=normalizeSourceSelection({sourceType:"git",sourceValue:"https://git.example.test/acme/source.git",requestedVersion:oid}); if(!s.ok) throw new Error("selection failed"); const r=await resolveGitSource({selection:s.selection,gitClient:{lsRemote:async()=>`${oid}\trefs/tags/v1.0.0\n`}}); console.log(JSON.stringify(r)); })();'
```

输出为 `ok:true`，并生成 `version` 与 `git-commit.commitSha` 均为该 oid 的 descriptor，证明 explicit SHA 未被证明为 commit-ish 即可成为 evidence。

**严重性判断：合理**

Story 5.4 Task 3 明确要求 Git source resolution 必须产出 concrete commit SHA，且仅检测字符串像 SHA 不能作为可写入 evidence；Story 5.4 还明确建议使用 `git rev-parse --verify --end-of-options <rev>^{commit}` 或等价 Git-safe path 验证 commit-ish。当前实现把 arbitrary advertised oid 当成 `git-commit` evidence，直接破坏 AC1/AC3，对 install planning 的 evidence 污染是阻塞级功能缺陷。

**修复建议：可行**

最小修复边界：

- 扩展 `GitClient` abstraction，增加 `verifyCommit` / `resolveCommit` / 等价 commit-ish verification 能力，使 resolver 不只依赖 `lsRemote` 字符串解析。
- 对 explicit full SHA selector，必须在 remote/object context 中证明 `<sha>^{commit}` 成立后才生成 `git-commit` evidence。
- 对 branch/tag/full-ref resolution，最终写入的 `version` / `commitSha` 也必须是 dereferenced commit-ish SHA；annotated tag object oid 或 non-commit oid 必须 blocked。
- 补充 negative tests：annotated tag object oid、non-commit oid、commit-ish verification failure 的 explicit SHA 都不能进入 install planning。

**误报评估：非误报**

该发现与 Story 5.4 的 commit-ish 证明要求直接一致，并且可用当前 resolver mock 复现。

---

## 发现 #3 评估

### 审查原文

> **[低] human output 在确认并成功解析后仍固定显示 `confirmationState=pending`**
> - 来源：blind
> - 分类：patch

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

`src/source/source-selection.ts:112-127` 的 `createSourceResolutionPlan` 会根据 confirmed 参数生成 plan；`src/source/source-selection.ts:183-192` 的 `createExternalAccess` 已能输出 `confirmationState: "confirmed"`。`src/commands/install.ts:223-239` 先创建 pending plan；若存在 `confirmSourceAccess`，会调用确认回调并重新创建 `confirmed: true` 的 plan；未确认时在 `src/commands/install.ts:239-274` 停止，不访问 Git client、不进入写入。

问题出在 human renderer：`src/diagnostics/output.ts:42-58` 和 `src/diagnostics/output.ts:346-358` 都调用 `formatInstallExternalAccess(result.data.sourceDescriptor)`；`src/diagnostics/output.ts:498-514` 只从 `sourceDescriptor` 反推 external access 行，并硬编码 `"confirmationState=pending"`。同时 `src/diagnostics/command-result-schema.ts:107-117` 的 `InstallCommandDataSchema` 没有 `externalAccesses` 字段，导致 confirmed plan 状态没有进入 public result data。

独立复现 confirmed Git install 的 human output：

```bash
npx tsx -e 'import { mkdtemp, rm } from "node:fs/promises"; import os from "node:os"; import path from "node:path"; import { runInstallCommand } from "./src/commands/install.ts"; import { renderInstallHumanOutput } from "./src/diagnostics/output.ts"; void (async()=>{ const commit="0123456789abcdef0123456789abcdef01234567"; const tempRoot=await mkdtemp(path.join(os.tmpdir(),"speclite-eval-git-confirmed-")); try { const outcome=await runInstallCommand({options:{json:true,yes:true,sourceType:"git",sourceValue:"https://token:secret@git.example.test/acme/source.git?private=secret",requestedVersion:"main"},gitClient:{lsRemote:async()=>`${commit}\trefs/heads/main\n`},confirmSourceAccess:async()=>undefined,runtime:{nodeVersion:"v22.12.0",platform:"darwin",platformRelease:"23.0.0",cwd:tempRoot,targetProject:"git-confirmed"}}); const text=renderInstallHumanOutput(outcome.result); console.log(JSON.stringify({exitCode:outcome.exitCode, confirmationLine:text.split("\n").find(l=>l.includes("confirmationState="))})); } finally { await rm(tempRoot,{recursive:true,force:true}); } })();'
```

输出确认 `exitCode:0`，但 human output 行仍为 `confirmationState=pending`。

**严重性判断：偏高**

Reviewer 标为低是合理起点；评估后维持非阻塞但提升为 P2 TODO，而不是 P1 阻塞。理由是：AC4 的核心安全语义是 Git remote access 必须先声明 external access intent，且用户未确认前不得访问 remote。当前 runtime 顺序满足这个门禁：未确认路径不调用 Git client；confirmed 路径才调用 Git resolver。错误集中在 post-success human output 的诊断投影，没有导致未确认访问、install planning 绕过或 source evidence 污染。

但该问题不能忽略。Story 5.4 的 AC4 具有可审计性要求，当前 `InstallCommandResult` 不携带 `externalAccesses`，human output 又把成功确认展示为 pending，会误导审计者，以为成功路径没有确认 source access。因此它应作为 CR TODO 跟踪，并在 Story 5.5 reporting/trust 收口前修复或至少保留明确待办。

**修复建议：可行但非必要**

最小修复边界：

- 将 `sourceResolutionPlan.externalAccesses` 或等价 display-safe confirmation state 投影到 install result 可渲染数据，避免 human renderer 从 `sourceDescriptor` 反推。
- human output 应在未确认停止路径显示 `pending`，在 confirmed success/failure-after-confirmation 路径显示 `confirmed`。
- 补充 confirmed Git install human output test，断言 `confirmationState=confirmed`；保留未确认路径 `pending` 测试。

该修复触及 public result data shape 或 output renderer，属于诊断/reporting 边界；不建议在当前 fixer 为了两个 P1 修复而扩大到结果 schema 迁移，除非用户决定本轮一并处理。

**误报评估：非误报**

该发现真实存在，但不改变本轮核心 Git pinning 安全门禁，因此不作为阻塞交付修复项。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | installed Git descriptor 可以用非 SHA selector 伪装为 `git-commit` evidence 并通过 validate | [高] | **P1** | 本地 validate evidence shape 门禁失效，直接违反 AC1/AC3/AC6。 |
| 2 | explicit commit SHA 没有被证明为 commit-ish 就可成为 `git-commit` evidence | [高] | **P1** | resolver 仅验证字符串/advertised oid，未证明 commit-ish，直接污染 Git commit evidence。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | human output 在确认并成功解析后仍固定显示 `confirmationState=pending` | [低] | **P2** | 影响 external access confirmation 的 human audit 展示，但 runtime confirmation gate 已生效，不阻塞当前 P1 修复闭环。 |

### 可忽略（误报）

无。3 个发现均有效，0 个建议忽略。

### 评估决定

- **发现 #1（installed Git descriptor 非 SHA evidence 通过 validate）**：确认有效，阻塞交付；下一步 fixer 应最小范围修复 Git SHA shape validation 与 focused tests。
- **发现 #2（explicit SHA 未证明 commit-ish）**：确认有效，阻塞交付；下一步 fixer 应扩展 Git resolver/client 的 commit-ish verification，并补充 negative tests。
- **发现 #3（confirmed success human output 仍显示 pending）**：确认有效但非阻塞；建议记录为 CR TODO P2。若用户要求 AC4 的 public human audit 必须本轮完全准确，可提升为本轮修复项；在当前评估中，因 runtime gate 已阻止未确认访问，默认不阻塞交付。

### 验证命令

- `npm test -- test/git-source-resolution.test.ts`：通过，1 file / 9 tests passed。
- `npm run build`：通过，ESM 与 DTS build success。
- `npx tsx -e ... validateSourceIntegrity non-SHA Git descriptor reproduction`：复现，返回 `issues: []`。
- `npx tsx -e ... resolveGitSource explicit SHA advertised as tag reproduction`：复现，返回 `ok: true`。
- `npx tsx -e ... confirmed Git install human output reproduction`：复现，成功路径仍输出 `confirmationState=pending`。
