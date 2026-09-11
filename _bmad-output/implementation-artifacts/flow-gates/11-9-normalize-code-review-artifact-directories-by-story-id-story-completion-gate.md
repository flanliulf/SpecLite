---
schemaVersion: "speclite.flow-gate-report.v2"
mode: "story-completion"
target: "11-9-normalize-code-review-artifact-directories-by-story-id"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
result: "PASS"
generatedAt: "2026-09-11T10:58:37.000Z"
handoffContractVersion: "speclite.story-kickoff-handoff.v1"
foundationPrerequisiteStatus: "PASS"
foundationPrerequisiteRefs: "restart kickoff gate 2026-09-11 PASS; Story 11.1-11.8 completion gates allowing; restart commits 523ab4e, 6079257, 53195ae, bee8e07"
closureOwnerCheckStatus: "PASS"
closureOwnerRefs: "Epic 11 Story 11.9; PRD FR23g; shared speclite-code-review-contract owns cr-directory.ambiguous-resume-root and CR Directory Resolution; src/config/cr-directory.ts + speclite resolve cr-directory (decision B); Story 11.10 remains separate read-only inventory owner"
sourceSkill: "speclite-flow-gate"
---

# Flow Gate Report: 11-9-normalize-code-review-artifact-directories-by-story-id

## Summary（摘要）

- Mode: `story-completion`
- Target: `11-9-normalize-code-review-artifact-directories-by-story-id`
- Date: `2026-09-11 18:58 CST`
- Result: `PASS`
- Model Used: `Claude Opus 5`
- Restart context：本报告取代 2026-09-05 的 completion gate（对应已回退的 1.0 / 1.1 实现）。评估对象为 restart 2.0 实现（commits `6079257` → `53195ae` → `bee8e07`，reviewSeries=`restart`），CR 已在 round 3 以 `PASS_WITH_DEFERRED_TODOS` 收敛。

## Contract Anchors（契约锚点）

- PASS：CR 目录约定 `{implementation_artifacts}/code-reviews/{storyId}-code-review/`、v2 basename、`reviewSeries` 正则、series-less 文件仅作历史证据（`cr-contract.md` Canonical Identity / Canonical Paths）未变——`git diff ff7528d..bee8e07 -- cr-contract.md` 的删除行仅为 Invocation Parameter Matrix 五行与 legacy 只读句（AC12，auditor round 3 核对）。
- PASS：新增 CR Directory Resolution 章节（唯一派生点、输出字段、按 v2 文件名判定、恢复矩阵、`cr-directory.ambiguous-resume-root` / lifecycle / error / block 与 details 白名单、威胁模型边界、HALTED finalizer 重入规则）与 restart kickoff gate 冻结定义一致。
- PASS：Story `Threat Model & Non-Goals` 章节存在；AC9 措辞为"按 v2 文件名判定未完成 run，不读取产物内容"；Invocation Parameter Matrix 与 CR01–06 Inputs 登记 `crDir` / `compatibilityMode` / `legacyArtifactPaths`（AC4）。
- PASS：`speclite resolve cr-directory` 在 `docs/reference/cli.md`、`command-result-json.md`、`runtime-boundaries.md`、`cli-human-output-matrix.md` 登记；`ResolveCrDirectoryOutputSchema` 在 `src/config/resolve-output-schema.ts`；issue id 六项在 type union / zod enum / cli.md 三处一致（edge round 2 核对）。

## Functional Anchors（功能锚点）

- PASS：`src/config/cr-directory.ts`：`normalizeCrStoryId`（`^[1-9]\d*[.-][1-9]\d*$`，fail-close）、`resolveCrDirectory`（只 `readdir` / `stat` / `lstat` / `realpath`，无写 API；legacy = `^{storyId}-.+-code-review$` 目录；unfinished = 直接子文件存在 S 的 v2 summary 且无 S 的 v2 finalizer；恢复矩阵 canonical / legacy-resume / block；`checkBoundary` 复用 `findProjectBoundarySymlinkEscape`，非 ENOENT 归 `unreadable-candidate`；boundary 先于枚举）。
- PASS：`src/commands/resolve.ts` `cr-directory` 子命令：`implementationArtifacts` 来自 `resolveArtifactRootsFromProjectConfig`；stdout 结构化 evidence（含 block）、stderr CR-local issue JSON line、exit code；`--human` support frame；legal command 列表更新（resolve-parity fixture 同步）。
- PASS：runner Step 0 一次 CLI 调用 + 冻结值传递 + fresh-session 定位规则；CR01–06 workflow / SKILL zh-en 只消费传入 `crDir`；canonical contract 包无 `scripts/`。
- PASS：live CLI `node dist/bin/speclite.js resolve cr-directory --story-id 11.9 --review-series restart --project-root .` → canonical，`superseded-main/` 归档不参与判定（三轮 auditor 各自实测）。

## Evidence Anchors（证据锚点）

- PASS：`test/cr-directory.test.ts` 29 tests（归一化矩阵、canonical / legacy-resume / ambiguity 零 mutation 与 redaction、symlink 越界、非目录 / ELOOP / EACCES 结构化 block、CLI JSON / human、全量 corpus 负向扫描 0 命中、runner 调用串 + CR01–06 Inputs + goal records prose 断言、fresh-install parity）；`test/code-review-contract.test.ts` 未改且通过。
- PASS：沙箱外 `npx vitest run` 727 passed / 0 failed / 4 todo（round 2 fixRecord）；`npm run release:check`、`npm run docs:check`、canonical strict（0 findings）、`git diff --check` PASS；fresh-install fixture 与 `release/packaging-manifest.json` 重生成。
- PASS：CR 闭环证据（`11-9-code-review/`）：restart round 1–3 review / evaluation（round 1–2 含 fixRecord）、round 3 rules-extraction（COMPLETED，5 candidate / 2 global-eligible）、round 3 todo-result（COMPLETED，TODO-023~027）。累计 7 blocking 关闭，round 3 newBlocking=0。
- PASS：`npx tsc --noEmit` 对本 Story 文件 0 新增错误；既有 136 个非 Epic 11 类型错误不在门禁内（kickoff gate 已声明）。

## Guidance Equivalence（指引等价性）

- 实现位置按决策 B 为 `src/` + CLI（Story Dev Notes 已同步）；contract 只要求唯一派生点与单次传递，故为 `PASS` 而非 `PASS_EQUIVALENT`。
- 21 个非 Epic 11 未提交文件为明确 exclusion，三轮 scope 均 0 exceptions。

## Foundation Handoff（地基交接）

- restart kickoff gate（2026-09-11，`PASS`）与 Story 11.1–11.8 completion gates 构成 predecessor handoff，`foundationPrerequisiteStatus=PASS`。
- CR directory normalization / propagation / ambiguity closure 归 Story 11.9；Story 11.10 仍为独立 read-only inventory owner，`closureOwnerCheckStatus=PASS`。

## Missing Or Ambiguous Items（缺失或歧义项）

- 无 blocker。5 条 deferred TODO（TODO-023 T1 反斜杠目录名绕过、TODO-024 T2 dangling symlink、TODO-025 T3 symlink 产物语义、TODO-026 / 027 T3 runner Step 0 文案）已登记，均在协作式威胁模型边界内为非阻塞项。
- CR04 的 2 条 global-rule-eligible 规则建议写入 `cr-rules/cr-rules-summary.md` 需用户授权，未执行。

## Recommended Next Action（推荐下一步）

Proceed with `speclite-code-review-06-finalizer`（Story → `done`，`sprint-status.yaml` 同步，finalizer report）。全部 Epic 11 Story done 后运行 `speclite-flow-gate mode=epic-completion target=11`。

---

*本文档由 speclite-flow-gate Skill 自动生成*
