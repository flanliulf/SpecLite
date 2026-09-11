---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-8-rename-and-relocate-implementation-readiness-skills"
round: 3
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T19:27:00.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
---

# Story 11.8 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `1` 项 P1、`0` 项 P2。该项是 Round 2 方案 I 修复新暴露的 effective control-plane 分叉，可由已冻结的 exact exclusions 与 AC6/AC9/AC10 独立 closure 合同唯一关闭，`Owner Gate: NONE`。

## P1 Findings（P1 发现）

### P1-1 — Candidate walker 在冻结 exclusions 之外仍硬编码两个隐式排除，可隐藏 active residual

- **Location**：`test/implementation-readiness-rename-routing.test.ts:24-44,262-275,277-298`
- **Trigger condition**：old ID/path token 出现在任一冻结 candidate root 下名为 `dist/` 或 `node_modules/` 的目录，例如 `src/dist/active-consumer.ts` 或 `test/fixtures/node_modules/active-hook.md`。
- **Unhandled path**：方案 I validator 只证明 fixture 的 `excludedPaths` exact 等于三个冻结路径；但实际 walker 在每一层 `readdir()` 后又无条件 `continue` 所有 basename 为 `node_modules` 或 `dist` 的 entry。这两个 effective exclusions 不在 `FROZEN_EXCLUDED_PATHS`，也不经过 validator 或 mutation cases。因此 fixture 保持六个 roots、三个 exclusions、六组 tokens 与 ledger 全部不变时，新增在上述目录中的 exact-old-ID/path match仍不会进入 raw-byte扫描，也不会产生 `active-unclassified` 或 ledger mismatch。所谓“只允许三个 exact exclusions”的 control-plane 与真正执行的扫描面并不相同。
- **Consequence**：AC6/AC9/AC10 的独立 exact scan 仍可漏掉冻结 roots 内的 active identity/producer/consumer residual并 false-green。
- **Evidence**：`:272-274` exact-assert 的 exclusions 仅为 `:32-36` 三项；`:293` 在 `isExcluded()` 之外另行跳过 `node_modules` 与 `dist`。当前 mutation test只注入 fixture extra exclusion，无法触发或约束这两个代码内隐式 exclusion。
- **Guard sketch**：删除这两个隐式跳过，让六个冻结 roots除三项 exact exclusions外全部 no-follow遍历；或若二者确属授权 exclusion，则必须先由同一冻结合同显式列入并取得超出现有方案 I 的 owner/evaluator授权。补一个在临时 candidate tree 的 `dist/`/`node_modules/` 中放置 token 的 focused mutation，证明 walker不会静默漏扫；不得扩大为 Story 11.10 generic grill inventory。

## P2 Findings（P2 发现）

无。

## Closed Round-2 Paths（Round 2 已闭合路径）

- Existing artifact-root resolver `ok=false` 已返回并传播原 stable issues，`readPlanningContext()` 在 migration projection 与 transaction 前返回 blocked empty plan；symlink escape focused case同时断言 `actions=[]`、`changedPaths=[]` 与无 journal。
- 无 artifact-root 配置的既有 legacy-compatible 分支保持独立；explicit resolver failure 不再由 `undefined` 触发 Planning fallback。
- `UpdatePlanActionSchema` 仅允许 `update`/`skip + canonical-skill-renamed + replacementCanonicalSkillId` 的受控组合，缺 replacement 与其它 non-skip reason/replacement组合均被拒绝。
- 两个 old IDs × 两个 IDE targets 的首次 authorized update 均携带 typed replacement binding；同一 project 二次 replay 为 typed skip、`changedPaths=[]`，old redirect、active entry与两份 indexes 的 bytes/hash保持不变。
- 方案 I 已把六个 roots、三个 fixture exclusions 与六组 token key/parts移入独立 test-code constants，并在 ledger scan 前校验 missing/extra/变形 control-plane；本轮只报告 walker另行加入、绕过这些 constants 的两个隐式 exclusions。

## Evidence Boundary（证据边界）

- 已遍历：Round 2 Fixer 的 resolver success/failure与zero-write early return、typed action合法/非法组合、首次redirect apply、二次幂等 replay、modified-old conflict、candidate control-plane mutation及walker每个 file/directory/symlink/non-file分支。
- 未运行：build、full suite、packaging、canonical governance或global TypeScript检查；未修改 production、tests、fixture、Story、tracker、completion gate、root logs或其它 review artifact。
- 排除：broad inventory、Story 11.10 generic grill semantics、external drawer/zip、workspace mirrors、fixed-count drift与其他 Story TypeScript baseline。

## Owner Gate（Owner 门禁）

`NONE`。最小修复是让 walker 的 effective exclusions 精确等于已冻结的三项，并增加局部 mutation proof；不需要产品、业务或架构选择。

---

*本文档由 bmad-review-edge-case-hunter Skill 自动生成*
