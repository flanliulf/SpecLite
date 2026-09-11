---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-8-rename-and-relocate-implementation-readiness-skills"
round: 4
layer: "edge"
result: "PASS"
generatedAt: "2026-09-04T19:38:54.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
---

# Story 11.8 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`PASS`。发现 `0` 项 P1、`0` 项 P2，`Owner Gate: NONE`。Round 3 Evaluator 授权的唯一 walker effective-domain 缺口已在原有方案 I 边界内闭合：candidate walker 现在只应用三个 frozen exact exclusions，不再隐式跳过任意层级的 `dist` / `node_modules`。

## P1 Findings（P1 发现）

无。

## P2 Findings（P2 发现）

无。

## Closed Round-3 Path（Round 3 已闭合路径）

- `FROZEN_EXCLUDED_PATHS` 仍精确为 legacy docs、external drawer directory 与 drawer zip 三项；`validateCandidateScanControlPlane()` 在真实 scan 前对 roots、exclusions 与 token key/parts 做 exact equality。
- `listCandidateFiles()` 已删除不受 frozen control-plane 约束的 `entry.name === "dist" || entry.name === "node_modules"` 分支。遍历域现为六个 frozen roots 减三个 exact exclusions，无其他静默缩面路径。
- 新增系统临时树在 `src/dist/probe.txt` 与 `test/fixtures/node_modules/probe.txt` 中放置无 Story token 的 regular-file probe，直接复用同一 walker 并断言两路径均被枚举；`finally` 执行递归清理。
- Main scan 仍以 `process.cwd()` 为默认 root；可选 `projectRoot` 仅为临时树复用同一 walker，没有改变真实 candidate roots、exclusions、tokens、roles 或 24-row ledger。

## Exhaustive Path Result（穷举路径结果）

- **Exact exclusion**：相对路径等于 exclusion 或位于其 subtree 时在 `lstat` 前返回；其他 basename 不再被额外跳过。
- **Symlink**：每个未排除 candidate 均先执行 no-follow `lstat`；symlink 直接抛错，不进入文件读取或目录递归。
- **Regular file**：加入 actual file set，随后以 raw bytes 检索六组 frozen token；extra、missing、duplicate 或 active-unclassified match 由 ledger 双向 exact equality 与 role allowlist fail-close。
- **Directory**：递归访问全部 entries，最终对 project-relative paths 确定性排序；Round 3 的两个原反例目录已可达。
- **Non-file / scan error**：非 regular-file、非 directory 的 entry 抛错；`lstat`、`readdir` 或后续 `readFile` 失败也向上抛出，不会产生空集合 false-green。
- **Control-plane mutation**：missing root、extra exclusion 与 malformed token 在任何 real ledger scan 前抛错；Round 3 修复未为 walker 引入新的隐式分支。

## Verification（验证）

- 定向执行：`npx vitest run test/implementation-readiness-rename-routing.test.ts -t "walks nested dist and node_modules inside frozen roots|classifies every old-id and old-path match|fails closed when the candidate-scan control-plane is narrowed or malformed" --reporter=dot`。
- 结果：`1 file passed; 3 tests passed / 6 skipped`。
- Current completion gate 记录 focused final 为 `3 files / 51 tests passed`，affected 的四项非绿仍仅是范围外 external drawer fixed-count drift；本层未将该 caveat 转化为 Story 11.8 finding。

## Evidence Boundary（证据边界）

- 已遍历：Story 11.8 AC6/AC9/AC10、Round 3 summary/evaluation/Fix Summary、current frozen control-plane、actual walker 的 exclusion/file/directory/symlink/non-file/error 分支，以及新增临时树 probe。
- 本层仅创建该 Round 4 Edge report；未修改 source、tests、fixture、Story、tracker、completion gate、root logs 或既有 CR artifacts。
- 未运行 build、full suite、packaging、canonical governance 或 global `tsc`。
- 排除 Story 11.10 broad/generic grill semantic inventory、Story 11.9，external drawer/zip、workspace mirrors、fixed-count drift 与其他 Story TypeScript baseline。

## Owner Gate（Owner 门禁）

`NONE`。Round 3 修复严格执行已授权的方案 I，未产生新产品、Architecture 或范围决策。本结果仅代表 fresh Edge Case Hunter Round 4；仍须由同轮 Blind Hunter、Acceptance Auditor、Aggregator 与 fresh Evaluator 形成最终双重裁决。

---

*本文档由 bmad-review-edge-case-hunter Skill 自动生成*
