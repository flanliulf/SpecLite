---
schemaVersion: speclite.cr-evaluation.v2
artifactType: code-review-evaluation
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: restart
round: 1
generatedAt: 2026-09-11T17:50:00+08:00
modelUsed: Claude Opus 5 (claude-opus-5)
reviewModel: Claude Opus 5 (claude-opus-5)
reviewSource: 11-9-code-review-summary-20260911-restart-round-1.md
reviewSourceHash: sha256:e7b8f68c43b6a71e72d1ff69e6c3eec22ec748596ae2221067cc5dbff4c533f0
headSha: 6079257c6a1cacbb6d3629812f1a69dd4f0603e4
scopeHash: sha256:6000d174aa5e5253ff9d1ba8a03dbbc8433682611031b37897eff2bddef5d7e1
verdict: FIX_REQUIRED
acceptedCounts:
  p0: 0
  p1: 5
  deferred: 1
  verifyRequired: 1
  dismissed: 2
convergence:
  newBlocking: 5
  recurredBlocking: 0
  resolvedBlocking: 0
  churnDetected: false
  architectureCategories: []
fixRecord:
  mode: patch
  status: completed
  generatedAt: 2026-09-11T18:01:12+08:00
  modelUsed: Claude Opus 5 (claude-opus-5)
  changedFiles:
    - _bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260911-restart-round-1.md
    - _bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260911-restart-round-1.md
    - _bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/EXPERIMENTS.md
    - _bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/EXPERIMENT_NOTES.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/SKILL.en.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/SKILL.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/SKILL.en.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/SKILL.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/SKILL.en.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/SKILL.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/SKILL.en.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/SKILL.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/SKILL.en.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/SKILL.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/SKILL.en.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/SKILL.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/references/finalizer-workflow.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md
    - docs/reference/cli.md
    - release/packaging-manifest.json
    - src/config/cr-directory.ts
    - src/config/resolve-output-schema.ts
    - test/cr-directory.test.ts
    - test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json
    - test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json
  sourceMutationAt: 2026-09-11T17:57:01+08:00
  verificationCommands:
    - npx vitest run test/cr-directory.test.ts test/code-review-contract.test.ts
    - npm run build
    - node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict
    - npm run release:packaging-check
    - npx vitest run
    - npm run docs:check
    - git diff --check
  verificationResult: PASS
---

# Code Review Evaluation（代码审查评估）

## Binding Verification（绑定验证）

- Review 来源及 hash：`_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260911-restart-round-1.md`，`shasum -a 256` = `sha256:e7b8f68c43b6a71e72d1ff69e6c3eec22ec748596ae2221067cc5dbff4c533f0`；review `verdict: FINDINGS_REPORTED`、`scopeExceptions: []`、`failedLayers: []`、`acCoverageComplete: true`，schema 有效，未 degraded。
- Story、series、round：匹配（`storyId=11-9`、`storyKey=11-9-normalize-code-review-artifact-directories-by-story-id`、`reviewSeries=restart`、`round=1`；restart series 仅此一轮，无同 hash 的既有 evaluation）。
- crDir 来源：manual orchestrator 通过 `speclite resolve cr-directory --story-id 11.9 --review-series restart --project-root .` 传入 `crDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`；本 evaluation 未重推导，写入同一目录。
- Scope hash：匹配（`headSha=6079257c6a1cacbb6d3629812f1a69dd4f0603e4` 与本机 `git rev-parse HEAD` 一致；`scopeHash` 自 review 复制）。
- Reviewer quorum：3/3（blind / edge / auditor 均 PASS）。
- Evaluator 独立性：**同模型限制说明**——reviewer 与 evaluator 均为 Claude Opus 5 (claude-opus-5)。为此本评估对每条 blocking finding 都在 `$TMPDIR` 临时项目用 `dist/bin/speclite.js`（bundle 时间 17:15 晚于 `src/config/cr-directory.ts` 17:03，且 bundle 内 `collectRoundEvidence` / `isMissing` 逻辑与源码逐行一致）第一手复现，并逐条记录主动寻找的反证；未采信任何 reviewer 结论作为证据替代。review 的 `.tmp/` raw layer 输出已按 reviewer workflow 清理，本评估只依赖 review 正文证据与自行复现。
- Read-only 声明：本次未修改源码、测试、Story、tracker 或 review source；只读验证为 `npx vitest run test/cr-directory.test.ts`（22 passed）与 `$TMPDIR` 下临时项目 CLI 探针（用后已删除）。

## Finding Evaluations（逐项评估）

### R1-F1: 候选路径为非目录或不可读时 resolver 抛未捕获异常，CLI 无结构化 block evidence 且 stderr 含绝对路径

- 发现指纹：`sha256:348347a12e0eb1bcfcff130e1a50ccdd248f659f31ec1d80e6d988a69fd80579`
- Reviewer 提出的失败场景：`code-reviews` / `11-9-code-review` 为普通文件、`11-9-<text>-code-review` 为指向普通文件的项目内 symlink、候选目录 mode 000 → `readdir` 抛 ENOTDIR / EACCES，`cr-directory.ts:142` / `:220` 只吞 ENOENT → 异常穿透 commander，stdout 空、stderr 为含绝对路径的 stack trace、无 `cr-directory.*` issue。
- 独立证据：四个场景在 `$TMPDIR` 临时项目全部复现——(a) canonical 为普通文件：`Error: ENOTDIR ... scandir 'impl/code-reviews/11-9-code-review'`，stack 经 `collectRoundEvidence`（bundle `:15094`）；(b) legacy symlink → 项目内普通文件：同 ENOTDIR；(c) `code-reviews` 为普通文件：ENOTDIR 经 `resolveCrDirectory`（bundle `:15028`）；(d) canonical mode 000：`EACCES`。四例 exit=1、stdout 0 字节、stderr 含 6 行 `/Users/...` 绝对路径。`src/bin/speclite.ts:393-404` `runCli` 只吞 commander informational exit，其余异常直接抛出。`docs/reference/cli.md:238` 明文承诺 "Machine stdout 始终返回 `speclite.resolve.cr-directory.v1` evidence…包括 block result"；`runner-workflow.md:16` 只以 `continuation=block` 作为 HALT 条件，此处无 `continuation` 字段可读。
- 已检查的反证：(1) 是否属 Threat Model out-of-scope？否——普通文件 / 权限错误是协作式本地文件系统的静态状态，不涉及 hard link / CRLF / TOCTOU / 伪造内容。(2) 是否为仓库级既有约定？否——同构的 Story 11.5 resolver `src/config/artifact-document-discovery.ts:775-790` 对非 ENOENT 的 `readdir` 失败返回结构化 `ok:false` 并升级为 `shard-candidate-scan-unreadable` block，仓库先例是结构化 fail-close，本 resolver 偏离了它。(3) fail-close 是否仍成立？成立（exit 1、零写入），因此不是 P0；但 CLI 机器契约（stdout evidence + stable issueId）与 kickoff gate "禁止 stack / absolute path" 的诊断纪律被违反，runner/人工 orchestrator 无法拿到 `continuation` 与 `issueId`。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：在 `src/config/cr-directory.ts` 把非 ENOENT 的 `readdir` 失败（`code-reviews` 枚举与 `collectRoundEvidence`）归入 stable `path-safety` block issue（建议 id `cr-directory.unreadable-candidate`，`affectedPath` 为项目相对路径，`details` 只含 `storyId` / `reviewSeries` / `canonicalCrDir` / `reason`，不得写入 `error.message` 或绝对路径）；legacy 入选前对 symlink 目标做 `stat().isDirectory()` 校验（非目录即同一 issue block）；`src/config/resolve-output-schema.ts` 的 `issueId` enum 同步登记；`test/cr-directory.test.ts` 补 ENOTDIR（普通文件 / symlink→文件）与 EACCES（可跳过非 POSIX 平台）fixture，断言 stdout 结构化 block、stderr 单行 issue、`JSON.stringify(result)` 不含 `projectRoot`。不得读取产物正文、不得引入新的 ownership/validator 状态。

### R1-F2: 契约 :58 与 runner-workflow :16 的"不得继续写入 legacy 目录"与 `legacy-resume` 语义矛盾

- 发现指纹：`sha256:400bd7faf0613f19bb2072be771d90a3f245a431dbcda73001ebdaaf4da1c0f4`
- Reviewer 提出的失败场景：磁盘仅有 `11-9-<title>-code-review/` 含 restart round-1 summary 且无 finalizer → resolver 返回 `crDir=<legacy>`、`legacy-resume`，但 `cr-contract.md:58` 与 `runner-workflow.md:16` 字面规定 legacy 目录"不得继续写入" → consumer 要么 HALT，要么改写 canonical 使下一次解析成为 canonical+legacy 双未完成 → ambiguity block，同一 series 被拆到两个目录。
- 独立证据：`cr-contract.md:58`："发现 legacy 或带 slug 目录时只读记录到 `legacyArtifactPaths`，不得自动移动、删除或继续写入"；同文件 `:65`（CR Directory Resolution 恢复矩阵）："恰一个 legacy 含未完成 run 且 canonical 不含 → 原位 `legacy-resume`"；`runner-workflow.md:16` 末句："slug/legacy 目录只读记录，不自动移动或继续写入"；`finalizer-workflow.md:8`："`compatibilityMode=legacy-resume` 时原位收口，不迁移"。`:58` 来自 `ff7528d` 基线（kickoff gate 引用 `cr-contract.md@ff7528d:56-58`），restart 新增的 `:62-66` 未回头调和。临时项目复现 legacy-resume 路由：`crDir=impl/code-reviews/11-9-some-title-code-review`、`compatibilityMode=legacy-resume`、exit 0。
- 已检查的反证：(1) `:58` 是否可解读为"不得作为**新** run 的写入目录"从而与 `:65` 相容？字面不能——"继续写入"恰恰指向续写既有 run；一个 fresh consumer 同时读到两句会得到相反指令。(2) 是否只是 Guidance Anchor？否——`cr-contract.md` 是 owning shared contract（Contract Anchor），且 Story AC7 要求同步 shared contract 与全部 `$cr_dir` expressions，AC9 要求 legacy-only unfinished run "在一个目录内恢复"。(3) 是否存在测试守护？`test/cr-directory.test.ts:500-524` 只断言含 `speclite resolve cr-directory` / `crDir` / 不重推导文案，不检测矛盾句。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：把 `cr-contract.md:58` 与 `runner-workflow.md:16` 末句改为"除 resolver 判定 `legacy-resume` 的唯一未完成 run 原位续写外，legacy / slug 目录只读记录到 `legacyArtifactPaths`，不得自动移动、删除或作为新 run 目录"（措辞可调，语义不变）；不得触碰 Canonical Paths 表、basename、round 或审批规则（AC12）。

### R1-F3: runner Step 5/6/9/10 调用模板与 CR01–06 Inputs 未显式承载 `crDir` 等冻结值

- 发现指纹：`sha256:ae5e5b2b1c61f8d89b0391fd2d79587af93af75b9cc69dca4f63ce7fd19e4c20`
- Reviewer 提出的失败场景：`runner-workflow.md:70,74,96,102-105` 的 sub-agent 调用串仍为 `/speclite-code-review-0N {storyId} reviewSeries={reviewSeries}`（无 `crDir`）；CR01–06 `SKILL.md` Inputs 段未登记 `crDir`；`reviewer-workflow.md:8` 规定无传入值时自行调用 CLI → runner 模式下每个 fresh sub-agent 各自重推导，Step 0 冻结值无传递通道，FS 状态在 Step 0 与 CRxx 之间变化（如 R1-F4）时结果分叉。
- 独立证据：`runner-workflow.md:70` `/speclite-code-review-01-reviewer {storyId} reviewSeries={reviewSeries}`、`:74` evaluator 同形、`:96` fixer、`:102-105` CR04/05/06 均不含 `crDir` / `compatibilityMode` / `legacyArtifactPaths`；`cr-contract.md` "Invocation Parameter Matrix" 规定"runner 与人工 orchestrator 调用各 CR Skill 时必须传入下列参数；缺失时按回落列处理，Skill 不得自行猜测"，而矩阵列只有 `reviewSeries` / `orchestrationMode` / `handoffTarget` / `mode` / `confirmationPolicy` / `authorizationSource`，无 `crDir`；CR01–06 六个 `SKILL.md` 与 `SKILL.en.md` 的 Inputs 段均未列 `crDir`（`grep` 仅在 Contract 段命中"只消费…传入的 crDir"）；`reviewer-workflow.md:8` "无传入值时自行调用该 CLI 一次"。`test/cr-directory.test.ts:500-524` 仅断言 workflow 文件含 `crDir` 与"不重推导"文案。
- 已检查的反证：(1) runner `SKILL.md:62` / `SKILL.en.md:55` 与 `runner-workflow.md:16` 都写了"冻结 `crDir` 并传给 CR01–06"，LLM runner 可能自行补参——但 Contract Anchor 是 Invocation Parameter Matrix 与各 Step 的调用模板，二者都缺该参数，"传给"只在 prose 层成立，AC4 要求的是实际调用面；(2) 是否为既有形状（`orchestrationMode` / `handoffTarget` 也未出现在调用串）？是，但 AC4 是本 Story 新增硬要求，`crDir` 的缺失由本 Story 负责，`orchestrationMode` / `handoffTarget` 的缺失不在本 Story 范围（不扩大）；(3) manual 模式下 reviewer 自行调用 CLI 是否合法？合法（`reviewer-workflow.md:8` 的 fallback 对 manual 成立），问题只在 runner 模式无通道。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：在 `runner-workflow.md` Step 5/6/9/10 调用模板显式追加 `crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths}`；在 `cr-contract.md` Invocation Parameter Matrix 为 CR01–06 增加 `crDir`（连同 `compatibilityMode`、`legacyArtifactPaths`）为必传参数，回落列写"manual 模式缺失时 Skill 自行调用 `speclite resolve cr-directory` 一次；runner 模式缺失即 HALT"；CR01–06 `SKILL.md` 与 `SKILL.en.md` Inputs 段登记 `crDir` / `compatibilityMode` / `legacyArtifactPaths`；`test/cr-directory.test.ts:500` 追加 prose 断言（runner 四处调用模板含 `crDir=`，六个 SKILL.md Inputs 段含 `crDir`）。不得改动 CR algorithm / round numbering / 审批规则。

### R1-F4: HALTED finalizer report 使按文件名判定的 `unfinished` 翻转为 false，legacy-resume run 重入时路由到 canonical

- 发现指纹：`sha256:0a5019c56b0fa37220562fd85361f75184cf0eb499791060c4db62a3c455113d`
- Reviewer 提出的失败场景：legacy 目录 L 含 restart round-1 summary/evaluation + 一个 `result: HALTED` 的 `11-9-cr-finalizer-…-restart-round-1.md`（`finalizer-workflow.md:68` 规定 HALTED 也写 canonical filename）；canonical 不存在 → `cr-directory.ts:240` 判定 L `unfinished=false` → `crDir=canonical`；runner 按 `:34` 重入 CR06 时在 canonical 找不到 evaluation → non-durable HALT，或后续 round 落入 canonical 造成同一 series 跨目录。
- 独立证据：临时项目两步复现——step1（L 含 summary + evaluation，无 finalizer）：`crDir=…/11-9-some-title-code-review`、`legacy-resume`、`unfinished:true`；step2（追加空文件 `11-9-cr-finalizer-20260911-restart-round-1.md`）：`crDir=impl/code-reviews/11-9-code-review`、`canonical`、L 的 `unfinished:false`，exit 0。`finalizer-workflow.md:64-68` 与 `assets/output-template.md:33`（`result: <DONE|HALTED>`）确认 HALTED report 与 DONE 同名；`runner-workflow.md:34` 要求 HALTED 时"按 report 恢复动作重入 Step 10.4"；goal records 位于 `{crDir}/goal-execute-records/`（legacy-resume 时即 `L/goal-execute-records/`），runner 续跑在 canonical 下找不到它们。
- 已检查的反证：(1) 是否可由 resolver 解决？不可——决策 A 明确 resolver 不读内容，AC12 禁止改 basename，把 HALTED 编入文件名或让 resolver 解析 `result` 都会重开已冻结裁决。(2) 是否需要 owner 裁决（`DECISION_NEEDED`）？**否**——决策 A 原文已把"审批与 round 有效性继续归 runner 与 CR06"，kickoff gate 明确决策 A/B/C "新 session 不得重开"；resolver 输出已给出足够证据：`legacyCrDirs` 仍列出 L（legacy 判定不依赖 unfinished），`roundEvidence` 记录 L 的 `summaryRounds=[1]`、`finalizerRounds=[1]`，而 canonical 无任何 round 证据。runner 读取自己的 finalizer report / goal records 属于既有职责（`runner-workflow.md:9,18,34-35` 本就要求按 v2 frontmatter 与 result 判定状态），不是新读取范围。因此存在一条**同时满足决策 A 与 AC12** 的契约层解法：在 runner Step 0 恢复矩阵增加规则——"canonical 无当前 series 任何 round 证据，且恰一个 legacy 目录的 `roundEvidence` 含当前 series 的 finalizer 时，runner 必须读取该目录最大 round 的 finalizer report：`result: HALTED` → 以该 legacy 目录为 `crDir`（视同 `legacy-resume`）按 report 恢复动作重入 Step 10.4，不得在 canonical 开新 run；`result: DONE` → Story 已完成"；`cr-contract.md` CR Directory Resolution 追加一句"finalizer 文件存在但 `result: HALTED` 的 run，其重入目录由 runner 按 report 与 goal records 冻结的 `crDir` 判定，resolver 结果对该 run 不具 authority"。这与 R1-F3（冻结值显式传递）联动即可闭环。(3) 是否可 defer？该 sub-case 直接违反 AC9 "在一个目录内恢复"，且 R1-F2/F3 已要求修改同两份文件，补一条规则成本极低、无代码变更；留作 TODO 会让一条已知的 split-series 路径带入 finalizer，故不 defer。(4) 现实触发概率：需 title-bearing legacy 目录 + HALTED finalizer + 续跑；本仓库全历史无 title-bearing 目录，但 legacy-resume 是 AC8/AC9 的交付语义，面向其他安装项目，不能以本仓库无实例为由降级。(5) 是否触发 `ARCHITECTURE_TRIAGE`？finding 类别为 lifecycle，但可由单一局部 prose patch 关闭，不满足"无法通过单一局部 patch 关闭"，不升级。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：按上述 (2) 在 `runner-workflow.md`（Step 0 或恢复矩阵 `:34` 行）与 `cr-contract.md` CR Directory Resolution 章节各加 ≤2 行规则；可选在 `finalizer-workflow.md:68` 补注"HALTED report 写入传入的 `crDir`，重入时沿用同一 `crDir`"。**禁止**修改 `src/config/cr-directory.ts` 的 `unfinished` 判定、finalizer basename 或让 resolver 读取内容。若 fixer 认为无法在不违反决策 A / AC12 的前提下落笔，须停止并返回 `DECISION_NEEDED` 建议，而不是自行扩大范围。

### R1-F5: `code-reviews` 为越界 symlink 时 resolver 先枚举越界目录再检测 escape，block 结果中的 `legacyCrDirs` 来自项目外列表

- 发现指纹：`sha256:eaa2fdd5add007eeae09da4bc5e78f1397e33fc000ee577e63c64a0765161486`
- Reviewer 提出的失败场景：`<impl>/code-reviews -> $TMPDIR/outside`，outside 含 `11-9-outside-title-code-review/` → `cr-directory.ts:140` 的 readdir 先于 `:153` 的 escape 循环执行，越界列表写入 `base.legacyCrDirs`；`:158` 的 block 结果报告 `legacyCrDirs: ["…/code-reviews/11-9-outside-title-code-review"]`——一个项目内不存在的路径。
- 独立证据：临时项目复现：`issueId=cr-directory.symlink-escape`、`affectedPath=impl/code-reviews`、exit 1，但 stdout 顶层 `legacyCrDirs: ["impl/code-reviews/11-9-outside-title-code-review"]`；源码顺序确认 `:139-151` readdir + 填充 `base.legacyCrDirs` 在 `:153-166` escape 检测之前，且 `blocked()`（`:252`）保留 `base.legacyCrDirs`。
- 已检查的反证：(1) 是否泄露绝对路径？否——issue `details` 只含 `storyId` / `reviewSeries` / `canonicalCrDir` / `reason`，`legacyCrDirs` 为项目相对拼接，现有测试 `:304-330` 断言 `not.toContain(outside)` 通过。(2) 是否 out of scope？否——symlink 越界检测明确 in scope，且 Story 要求"任何 separator/traversal … 不得改变它"、"候选越界时先阻断"。(3) 影响是否足以阻塞？block 与零写入仍成立，风险在于 block evidence 自身失真（列出项目内不存在的目录）且 resolver 已读取项目外目录名；`runner-workflow.md:16` 要求把 `legacyCrDirs` 作为 `legacyArtifactPaths` 记录，人工 orchestrator 会据此去找不存在的目录。这是 resolver 输出正确性缺陷而非仅美观问题；修复为纯重排（把 `codeReviewsDir` 的 escape 检测提到 readdir 之前），零语义风险。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：`src/config/cr-directory.ts` 把 `codeReviewsDir` 的 `findProjectBoundarySymlinkEscape` 提前到 `:139` readdir 之前；escape block 时 `legacyCrDirs` 保持 `[]`；`test/cr-directory.test.ts:304` 场景追加断言 `legacyCrDirs: []` 与 `roundEvidence: []`（outside 内放一个 `11-9-outside-title-code-review/` 子目录以触发原缺陷）。

### R1-F6: dangling symlink 候选被判为可用 canonical 或列入 legacyCrDirs

- 发现指纹：`sha256:a5701f031269aa3734bbf19619ad083ae8deb586613cd4f7e3ebd028feccd224`
- Reviewer 提出的失败场景：(a) `11-9-code-review -> <不存在的项目外路径>`：lstat 成功、realpath ENOENT 被 `path-normalizer.ts:132` 视为非 escape、`collectRoundEvidence` ENOENT 返回 undefined → `ok=true, crDir=canonical, continue`，consumer 首次 `mkdir -p <crDir>/.tmp` 失败。(b) `11-9-dangling-code-review -> nowhere` 被列入 `legacyCrDirs` 但不在 `roundEvidence`。
- 独立证据：(a) 复现：`ok:true`、`crDir=impl/code-reviews/11-9-code-review`、`canonical`、exit 0；随后 `mkdir -p impl/code-reviews/11-9-code-review/.tmp` → "No such file or directory"，exit 1。(b) 复现：`legacyCrDirs=["impl/code-reviews/11-9-dangling-code-review"]`、`roundEvidence=[]`。
- 已检查的反证：(1) 是否可能越界写入？否——dangling symlink 上 `mkdir -p` 返回 EEXIST/ENOENT，普通写入跟随 symlink 到不存在的目标亦 ENOENT，不会在项目外创建目录；(2) 是否 out of scope？静态 dangling symlink 不是 TOCTOU，在 in-scope 范围内；(3) 是否阻塞交付？失败发生在 consumer 首次写入，晚于 resolver 且无 stable issue，但 fail-close 结果一致（不写、可诊断），且不影响任何正常目录布局；与 R1-F1 的 `stat().isDirectory()` 校验相邻，但 R1-F1 授权范围只覆盖 legacy symlink 目标非目录，不强制覆盖 dangling canonical。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：登记 TODO（建议 T2）；触发条件：为候选目录引入 `stat` 校验时（R1-F1 修复后的自然扩展）一并处理，或任一 consumer 报告 resolver `continue` 后首次写入 ENOENT。

### R1-F7: `ResolveCrDirectoryOutputSchema` 的 details redaction refinement 会拒绝 `implementation_artifacts` 含 `tmp` 等段名时的合法 block 输出

- 发现指纹：`sha256:d4580fd95b30f1cb5b2021019a0db7474e856619cf3c7742b5f1d1ecf13cd550`
- Reviewer 提出的失败场景：`implementation_artifacts = "tmp/impl"` + 双未完成 run → CLI 正常输出 ambiguity block，但 `ResolveCrDirectoryOutputSchema.safeParse` 因 `findUnsafeIssueValue` 命中 `tmp` 段而失败。
- 独立证据：`src/config/resolve-output-schema.ts:105-110` 对 `details` 调用 `findUnsafeIssueValue`；`src/validation/issue-model.ts:143-148` `hasTemporaryOrCachePathShape` 以 `/(^|[\\/])(?:tmp|temp|cache|\.cache|node_modules|\.npm)([\\/]|$)/i` 判定；`src/diagnostics/command-result-schema.ts:54-69` 的 SPEC 07 `ValidationIssueSchema` 对全部 issue details 施加同一 refinement。顶层 `crDir` / `canonicalCrDir` / `legacyCrDirs` 只用 `ProjectRelativePosixPathSchema`，不受影响；CLI 实际 stdout 不经该 schema（schema 仅在 `test/cr-directory.test.ts` 内消费）。
- 已检查的反证：是否为 Story 11.9 引入的独有缺陷？否——CR-local schema 有意镜像 SPEC 07 redaction 约定，`artifact-documents` 等既有 issue 在同样 config 下同样被拒；放宽属于 SPEC 07 / issue-model 的仓库级决策，不归本 Story。无 CLI 行为缺陷、无写入风险。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。若将来需要允许 `tmp` 段名，应在 SPEC 07 `issue-model` 层统一裁决，不在本 Story 修改。

### R1-F8: config 解析失败时 stdout 为空，与 cli.md "始终返回 cr-directory.v1 evidence" 措辞不一致

- 发现指纹：`sha256:f312d0d64cc0a8608e997b338a86a34f0166c607335428402b2e9f64ae62705b`
- Reviewer 提出的失败场景：项目无 `_speclite/config.toml` 或 TOML 畸形 → stdout 空、stderr 一条 SPEC 07 issue、exit 1、无 `continuation` 字段；按 `runner-workflow.md:16` 字面解析 stdout 会 JSON parse error。
- 独立证据：临时空项目复现：`resolve cr-directory` exit 1、stdout 0 字节、stderr `runtime-path.missing-entry`（`component: config-resolver`）；同一项目 `resolve artifact-documents --subject prd` 同样 exit 1、stdout 0 字节。`src/commands/resolve.ts:326-339` 在 `rootResult.ok=false` 时走 `writeResolveResult`（`:384` 仅 exitCode 0 才写 stdout），与 `artifact-roots` / `artifact-documents` 完全同形；`docs/reference/cli.md:225` 对 `artifact-documents` 使用相同"始终返回…evidence"措辞；`test/cr-directory.test.ts:424` 已把缺参/无效输入的 stdout 为空断言为预期。
- 已检查的反证：runner 是否会因此误继续？否——`cr-contract.md` Runtime Resolution 规定"runtime config 失败 … HALT"，先于 CR 目录解析；exit≠0 已足以 HALT。"始终返回"描述的是 resolver 阶段（含 block），upstream config 失败属 SPEC 07 runtime-path 阶段，与既有子命令一致。不构成缺陷。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。fixer 处理 R1-F2 修改 `runner-workflow.md:16` 时**可以**顺带把 HALT 条件写成"exit≠0 或 `continuation=block`"，但这是可选措辞，不是本 finding 的义务。

### R1-F9: AC11 的 goal records 项无测试断言

- 发现指纹：`sha256:7e40af3c27209de14a77c440662c701d078814a8d44cbe505aaaa53cca3ba421`
- Reviewer 提出的失败场景：无失败反例；若有人把 `runner-workflow.md` / `cr-contract.md` 的 goal records 改回 `{storyKey}` 目录或改文件名，`test/cr-directory.test.ts` 不会 RED。
- 独立证据：`grep -rn goal-execute-records test/*.ts` 仅命中 `test/update-planning.test.ts:654-656`（legacy fixture）；`test/cr-directory.test.ts:472-525` 的 `placeholderPattern` 只匹配 `{storyId}-{storyKey}-code-review` 形态，`:500-524` 未断言 goal records；AC11 明文列出 "goal records" 为测试覆盖项；契约与 runner 当前文案正确（`cr-contract.md:57,77`、`runner-workflow.md:41-47`：`{crDir}/goal-execute-records/` + `PLAN.md` / `EXPERIMENTS.md` / `EXPERIMENT_NOTES.md`）。
- 已检查的反证：功能本身是否缺失？否——AC6 由 prose 与实际目录（`11-9-code-review/goal-execute-records/` 三文件存在）满足；缺的只是机械守护，不需要改生产语义。
- 处置：`accepted`
- 优先级：`VERIFY`
- 必须执行的动作：在 `test/cr-directory.test.ts` "routes runner and CR01-06 through the shared CLI derivation point" 或新增 case 中断言 `runner-workflow.md` 与 `cr-contract.md` 含 `{crDir}/goal-execute-records/`，且 `runner-workflow.md` 含 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`；不得修改生产文案。

## Required Fixes（阻塞修复）

| 发现指纹 | 优先级 | 失败场景 | 授权范围 |
|---|---|---|---|
| `sha256:348347a12e0eb1bcfcff130e1a50ccdd248f659f31ec1d80e6d988a69fd80579`（R1-F1） | P1 | 候选为普通文件 / symlink→文件 / 不可读目录时 CLI 以未捕获 ENOTDIR/EACCES 退出，stdout 空、stderr 为含绝对路径的 stack trace、无 stable issue | `src/config/cr-directory.ts`（新增 path-safety issue id、非 ENOENT readdir 错误归 block、legacy symlink 目标 `stat().isDirectory()` 校验）、`src/config/resolve-output-schema.ts`（issueId enum）、`test/cr-directory.test.ts`（新增 fixture）、`docs/reference/cli.md`（可选：一句列出新 issue id）；禁止读取产物内容、禁止改 basename / round / 审批规则 |
| `sha256:400bd7faf0613f19bb2072be771d90a3f245a431dbcda73001ebdaaf4da1c0f4`（R1-F2） | P1 | 契约 `:58` / runner `:16` "不得继续写入 legacy" 与 `legacy-resume` 原位续写矛盾，字面执行导致 HALT 或 split-series | `speclite-code-review-contract/references/cr-contract.md:58`、`speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md:16`（仅调和该两句）；两包 `CHANGELOG.md` 追加条目 |
| `sha256:ae5e5b2b1c61f8d89b0391fd2d79587af93af75b9cc69dca4f63ce7fd19e4c20`（R1-F3） | P1 | runner 调用模板与 Invocation Parameter Matrix 不承载 `crDir` 等冻结值，runner 模式下 CR01–06 各自重推导 | `runner-workflow.md` Step 5/6/9/10 调用串；`cr-contract.md` Invocation Parameter Matrix；CR01–06 六包 `SKILL.md` + `SKILL.en.md` Inputs 段；`test/cr-directory.test.ts:500` prose 断言；涉及包 `CHANGELOG.md`；不得改 orchestrationMode / handoffTarget 既有语义 |
| `sha256:0a5019c56b0fa37220562fd85361f75184cf0eb499791060c4db62a3c455113d`（R1-F4） | P1 | legacy-resume run 写入 HALTED finalizer 后 `unfinished` 翻转，续跑路由到 canonical，导致 non-durable HALT 或 split-series | `runner-workflow.md`（Step 0 / 恢复矩阵 `:34` 追加 HALTED-finalizer 重入规则：以 `roundEvidence` 中含 finalizer 的唯一 legacy 目录 + 其 report `result` / goal records 冻结的 `crDir` 重入）、`cr-contract.md` CR Directory Resolution（≤2 行）、可选 `finalizer-workflow.md:68` 补注；两包 `CHANGELOG.md`。**禁止**修改 `src/config/cr-directory.ts` 的 unfinished 判定、finalizer basename 或让 resolver 读内容 |
| `sha256:eaa2fdd5add007eeae09da4bc5e78f1397e33fc000ee577e63c64a0765161486`（R1-F5） | P1 | `code-reviews` 越界 symlink 时先 readdir 项目外目录再检测 escape，block 结果 `legacyCrDirs` 列出项目内不存在的路径 | `src/config/cr-directory.ts`（把 `codeReviewsDir` escape 检测提前到 readdir 之前，escape block 时 `legacyCrDirs=[]`）、`test/cr-directory.test.ts:304` 追加断言 |

跨项共同授权：修改 `src/**` 后重新 `npm run build` 并在**沙箱外**重新生成 `release/packaging-manifest.json`；修改任一 Skill 包文件后重新生成 `test/fixtures/fresh-install-empty-project/expected/installed-state/{files-index-full,skill-index-full}.json`；验证命令至少含 `npx vitest run test/cr-directory.test.ts test/code-review-contract.test.ts`、`npm run docs:check`，`npm run release:check` 在沙箱外执行。上述以外的文件（含 Story、tracker、review、Canonical Paths 表、basename、round numbering、审批规则、SPEC 07 taxonomy）不在授权范围。

## Verify Obligations（验证义务）

| 发现指纹 | 必须补充的测试或断言 | 是否允许修改生产语义 |
|---|---|---|
| `sha256:7e40af3c27209de14a77c440662c701d078814a8d44cbe505aaaa53cca3ba421`（R1-F9） | `test/cr-directory.test.ts` 断言 `runner-workflow.md` 与 `cr-contract.md` 含 `{crDir}/goal-execute-records/`，且 `runner-workflow.md` 含 `PLAN.md` / `EXPERIMENTS.md` / `EXPERIMENT_NOTES.md` | 否 |

## Deferred TODO Candidates（延期候选）

| 发现指纹 | 建议紧迫度 | 触发条件 |
|---|---|---|
| `sha256:a5701f031269aa3734bbf19619ad083ae8deb586613cd4f7e3ebd028feccd224`（R1-F6） | T2 | 为 CR 目录候选引入 `stat` / 目标存在性校验时（R1-F1 修复的自然扩展）一并处理；或任一 consumer 报告 resolver `continue` 后首次写入因 dangling symlink ENOENT |

## Convergence（收敛）

- 新增阻塞项：5（R1-F1 `348347a1…`、R1-F2 `400bd7fa…`、R1-F3 `ae5e5b2b…`、R1-F4 `0a5019c5…`、R1-F5 `eaa2fdd5…`）；restart series round 1，`superseded-main/` 内 main / evidence-v2 / directory-routing 的 fingerprint 已随 Correct Course 归档、不迁移，故全部为 `new`。
- 复现阻塞项：0。
- 已关闭阻塞项：0。
- Churn 证据：无（restart round 1，无反复修改位置；R1-F1 与 R1-F5 落在同一文件 `src/config/cr-directory.ts` 的相邻代码块，属同一轮首次修改，不构成 churn）。
- 架构类别：`[]`——R1-F4 属 lifecycle 类别，但可由 runner / contract 层单一局部 prose patch 关闭且不触及决策 A / AC12，不满足升级 `ARCHITECTURE_TRIAGE` 的"无法通过单一局部 patch 关闭"条件；未达 `maxRounds=5` 或 stop-loss 阈值。

## Evaluation Verdict（评估结论）

- 裁决：`FIX_REQUIRED`
- 理由：存在 5 条 accepted P1——2 条 resolver 代码缺陷（R1-F1 未捕获 ENOTDIR/EACCES 破坏 CLI 机器契约与 redaction 纪律；R1-F5 越界 symlink 下 block evidence 失真）与 3 条 contract / runner 调用面缺陷（R1-F2 legacy-resume 自相矛盾；R1-F3 AC4 的 `crDir` 传递在实际调用面缺失；R1-F4 HALTED finalizer 后 legacy-resume run 续跑路由翻转，违反 AC9 "一个目录内恢复"）。R1-F4 经独立分析可在不违反决策 A（resolver 只看文件名）与 AC12（不改 basename）的前提下由 runner / contract 层规则关闭，故不判 `DECISION_NEEDED`、不升级 `ARCHITECTURE_TRIAGE`。R1-F7 / R1-F8 为仓库级既有约定，dismissed；R1-F9 仅需机械守护，verify obligation；R1-F6 为晚失败但 fail-close 一致，deferred T2。所有 finding 均在 Story Threat Model in-scope 范围，无 hard link / CRLF / TOCTOU / 伪造内容类 finding 需按契约 dismiss。
- 必须进入的下一状态：`FIX(mode=patch)` → `speclite-code-review-03-fixer`（`mode=patch`，只修上表 5 条 P1；R1-F9 的 verify obligation 可在同一 patch 轮一并补测试，但不得改生产文案）→ 重新冻结 scope → `FRESH REVIEW`（restart round 2）。

## Fix Record（修复执行记录）

- 模型：Claude Opus 5 (claude-opus-5)；mode=`patch`；confirmationPolicy=`preauthorized`，authorizationSource=2026-09-11 Story 11.9 Restart Brief Step 11 + 用户「提交并开始 CR」决定（manual orchestrator record：goal-execute-records/EXPERIMENTS.md）。
- 修复指纹与改动：
  - R1-F1 `sha256:348347a1…`：`src/config/cr-directory.ts` 新增 `cr-directory.unreadable-candidate`（path-safety/block）；`code-reviews`、canonical、legacy 候选的非 ENOENT readdir 错误一律结构化 block（details 含 `errorCode`）；legacy symlink 只在 `stat().isDirectory()` 时入选，指向文件的 symlink 被忽略；`resolve-output-schema.ts` issueId enum 同步；`docs/reference/cli.md` 列出全部 issue id。测试：code-reviews 为文件、canonical 为文件、legacy symlink→文件、legacy mode 000（EACCES）。
  - R1-F2 `sha256:400bd7fa…`：`cr-contract.md` Canonical Identity 第 3 条与 `runner-workflow.md` Step 0 改为「不作为新 run 目录；`legacy-resume` 唯一未完成 run 原位续写」。
  - R1-F3 `sha256:ae5e5b2b…`：`runner-workflow.md` Step 5/6/9/10 六个调用串显式携带 `crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths} orchestrationMode=runner handoffTarget=runner`（置于既有 `confirmationPolicy … authorizationSource` 之后，保持 `test/code-review-contract.test.ts` 既有断言不变）；`cr-contract.md` Invocation Parameter Matrix 五行增加三字段；CR01–06 `SKILL.md` / `SKILL.en.md` Inputs 各登记一条；`test/cr-directory.test.ts` 新增调用串与 Inputs 的 prose 断言。
  - R1-F4 `sha256:0a5019c5…`：`cr-contract.md` CR Directory Resolution 增加 2 行（v2 finalizer 文件名不区分 DONE/HALTED，HALTED 重入以 goal records 冻结 `crDir` / `roundEvidence` 唯一目录重入，resolver 不读内容）；`runner-workflow.md` 恢复矩阵 HALTED 行注明重入不重解析、Step 0 冻结值写入 goal records；`finalizer-workflow.md` Step 7 补注。未改 resolver 判定、basename 或审批规则。
  - R1-F5 `sha256:eaa2fdd5…`：`code-reviews` 的 symlink-escape 检测提前到 readdir 之前，escape block 时 `legacyCrDirs=[]` / `roundEvidence=[]`；测试在 outside 目录放入 `11-9-outside-title-code-review/` 断言不被列出。
  - R1-F9 `sha256:7e40af3c…`（VERIFY，同轮顺带）：`test/cr-directory.test.ts` 断言 runner 与 contract 含 `{crDir}/goal-execute-records/` 及三个 record 文件名。
  - 未触碰 R1-F6（deferred）、R1-F7 / R1-F8（dismissed）。
- 派生同步：8 包 CHANGELOG `[Unreleased] - 2026-09-11` 追加修复条目；`npm run build`；fresh-install fixture `files-index-full.json` / `skill-index-full.json` 重生成；`release/packaging-manifest.json` 在沙箱外重生成。
- 验证：`npx vitest run test/cr-directory.test.ts test/code-review-contract.test.ts` 40 passed / 4 todo；canonical strict ok / 0 findings；`npx vitest run`（沙箱外）726 passed / 0 failed / 4 todo；`npm run release:packaging-check` PASS；`npm run docs:check` PASS；`git diff --check` 干净。`npx tsc --noEmit` 对新改文件 0 新增错误（既有 136 个非 Story 错误不变）。
- Caveat：同模型（reviewer / evaluator / fixer 均为 Claude Opus 5）；fresh review / evaluation（restart round 2）必须独立执行，本 fixRecord 不构成 finalizer authorization。
