# Acceptance Audit Report（验收审计报告）

- **Dispatch model**: `gpt-5.6-sol`
- **Reasoning effort**: `high`
- **Role**: fresh Acceptance Auditor
- **Review boundary**: `directory-routing` Round 2，完整 42-file current diff
- **Result**: `FINDINGS_REPORTED`
- **AC coverage**: `12/12`
- **Blocking finding candidates**: `2`
- **Verify-required candidates**: `0`
- **File mutations / test execution**: 无；仅只读审查，未运行 build、full suite 或 packaging writers

## Findings（发现）

### AA-01 — CR01 校验的 `writeSubpath` 与随后写入的 summary 目标不一致

- **Priority**: `P1`
- **Category**: `path-safety.actual-write-binding`
- **Fingerprint status**: `new`
- **Invariant**: 每次 CR directory 写入前，production validator 接收的 `writeSubpath` 必须精确对应本次实际写入目标。
- **Concrete failure scenario**:  
  `$crDir/11-9-code-review-summary-20260909-directory-routing-round-2.md` 已是指向 project root 外部文件的 symlink，而 `$crDir/.tmp/directory-routing-round-2/review-input.diff` 路径安全。CR01 按规定命令只以 `.tmp/.../review-input.diff` 调用 validator，validator 因只检查所传入的 `writePath` 而返回 `ok=true`；随后 Step 7 写 summary 时没有验证 summary 自身，写操作可跟随 symlink 写到项目外。
- **Violated AC / boundary**: AC-11；Approved Replacement Boundary 中“本轮每次写入只调用 production `--mode validate-context`”及物理路径安全边界。
- **Primary location**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/references/reviewer-workflow.md:8`
- **Supporting evidence**:
  - 同一 workflow 在 `:61` 执行 summary 写入，但唯一规定的 validator 命令固定校验 `.tmp/.../review-input.diff`。
  - `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:213-220` 只检查调用方实际传入的 `writeSubpath`，不会顺带验证其他目标。
  - shared contract 在 `cr-contract.md:71-75` 要求实际写入前检查 `crDir/writeSubpath`。
  - `test/cr-directory-resolution.test.ts:353-364` 只断言每个 leaf 文档含一个 `--write-subpath`，没有验证各实际写目标与参数逐写对应。
- **Candidate count**: `1`

### AA-02 — CRLF 的合法 current artifact 会被误判为 legacy identity conflict

- **Priority**: `P1`
- **Category**: `compatibility.legacy-resume-identity`
- **Fingerprint status**: `new`
- **Invariant**: 唯一 legacy-only current run 的合法 v2 identity 必须被识别并原位恢复，不能因规范化后等价的换行形式改变 ownership 结论。
- **Concrete failure scenario**:  
  唯一 title-bearing legacy directory 内存在合法 current v2 summary，frontmatter 使用常见 CRLF：
  `---\r\nschemaVersion: ...\r\n...`。`readLeadingIdentity()` 要求内容精确以 `---\n` 开始，因此立即返回 `null`；调用方随后返回 `current-directory-identity-conflict` 和 blocking diagnostic，而不是 `compatibilityMode=legacy-resume`。该 legacy-only unfinished run 无法按 AC-9 恢复。
- **Violated AC / boundary**: AC-9；shared contract 的 legacy-only resume matrix 与等价规范化边界。
- **Primary location**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:427`
- **Supporting evidence**:
  - `resolve-cr-directory.mjs:368-379` 将 `readLeadingIdentity()` 返回 `null` 固定转为 identity conflict。
  - `cr-contract.md:97-104` 要求唯一 current legacy 原位恢复。
  - `cr-contract.md:350-358` 明确把换行规范化为 LF，说明 CRLF 与 LF 在共享 artifact contract 中应保持等价。
  - `test/cr-directory-resolution.test.ts:480-520` 的 identity cases 全部只构造 LF 输入，没有覆盖 CRLF。
- **Candidate count**: `1`

## AC Coverage（验收标准覆盖）

| AC | Status | Evidence |
|---|---|---|
| AC-1 | Covered | `resolve-cr-directory.mjs:67-95` 在无 current run 时返回唯一 numeric canonical root；`test/cr-directory-resolution.test.ts:119-141` 验证无副作用。 |
| AC-2 | Covered | `resolve-cr-directory.mjs:7,41-46` 仅接受 `N.N` / `N-N` 并转为连字符；测试 `:111-117` 覆盖 `11.9 → 11-9` 与前导零拒绝。 |
| AC-3 | Covered | resolver API 不接收 title/name/slug/filename；`runner-workflow.md:17-19` 禁止按这些字段重推导；测试 `:419-454` 扫描 active workflow。 |
| AC-4 | Covered | `runner-workflow.md:17-19` 规定每 Story 单次 resolve 并原样传递 frozen context；`:73,77,99,105-108` 覆盖 CR01–06；测试 `:353-369` 核对单次 resolve 与六个 consumer。 |
| AC-5 | Covered with blocking path-safety deviation | `cr-contract.md:102,124-132` 将 review/evaluation/fix/rules/TODO/finalizer/temp 全部绑定同一 `crDir`；测试 `:244-302` 枚举各写入 plane。实际目标校验缺口见 AA-01。 |
| AC-6 | Covered | `runner-workflow.md:44-52` 固定三个 goal record basename；测试 `:247-259` 覆盖全部路径。 |
| AC-7 | Covered | 42 个声明输入包含 orchestrator、CR01–06、shared contract、resolver、help、docs、fixture、tests 与 packaging manifest；只读 active-expression scan 未发现未分类的 title-bearing producer。 |
| AC-8 | Covered | resolver 无写 API；legacy、dual-dir 测试在 `:145-207` 对比写前写后目录并确认不创建 canonical sibling；marker resume 测试 `:556-584` 同样验证不迁移。 |
| AC-9 | Covered with blocking compatibility deviation | `resolve-cr-directory.mjs:142-174` 实现唯一 current candidate、dual ambiguity 和 explicit safe choice；测试 `:145-207,556-618` 覆盖 legacy-only、DONE claim、marker 与 dual-dir。CRLF current artifact 误阻断见 AA-02。 |
| AC-10 | Covered | `test/cr-directory-resolution.test.ts:419-454` 对 active files 做 negative scan，并通过 `title-bearing-path-ledger.json` 分类 legacy fixture 与 regression assertion。 |
| AC-11 | Covered with two blocking deviations | 测试覆盖 numeric-only、title independence、六 consumer、goal records、legacy-only、dual-dir、directoryChoice、symlink/traversal 和 write planes；AA-01 与 AA-02 给出仍未覆盖的具体反例。 |
| AC-12 | Covered | `cr-contract.md:124-143` 保留既有 report basenames、round 与 supersession 规则；CR03 `fixer-workflow.md:14-60`、CR06 `finalizer-workflow.md:19-82` 保留原 evaluation authorization、fresh review、completion gate、tracker 与 coordinated-write owner。旧 development gate 未被当作 current closeout evidence。 |

## Candidate Counts（候选统计）

```yaml
candidateCount: 2
blockingCount: 2
verifyRequiredCount: 0
categories:
  path-safety.actual-write-binding: 1
  compatibility.legacy-resume-identity: 1
```

本报告止于 fresh Acceptance Audit，不推进 evaluator、fixer 或其他 CR 步骤。
