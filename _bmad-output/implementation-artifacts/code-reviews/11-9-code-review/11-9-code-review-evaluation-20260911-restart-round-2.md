---
schemaVersion: speclite.cr-evaluation.v2
artifactType: code-review-evaluation
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: restart
round: 2
generatedAt: 2026-09-11T18:25:00+08:00
modelUsed: Claude Opus 5 (claude-opus-5)
reviewModel: Claude Opus 5 (claude-opus-5)
reviewSource: 11-9-code-review-summary-20260911-restart-round-2.md
reviewSourceHash: sha256:3b8243643bad91ab727d9251ff247d3bb7225a8d211e730f26542e30f9081016
headSha: 53195ae203bd0558fdc138a9e509ab34011e860a
scopeHash: sha256:4c9a2cdc44190f05a4f4d19bf4559d4e4754ff832edb1116d13f0dfa3046dc6e
verdict: FIX_REQUIRED
acceptedCounts:
  p0: 0
  p1: 2
  deferred: 2
  verifyRequired: 0
  dismissed: 3
convergence:
  newBlocking: 1
  recurredBlocking: 1
  resolvedBlocking: 4
  churnDetected: false
  architectureCategories: []
fixRecord:
  mode: patch
  status: completed
  generatedAt: 2026-09-11T18:29:30+08:00
  modelUsed: Claude Opus 5 (claude-opus-5)
  changedFiles:
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/CHANGELOG.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md
    - release/packaging-manifest.json
    - src/config/cr-directory.ts
    - test/cr-directory.test.ts
    - test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json
    - test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json
  sourceMutationAt: 2026-09-11T18:26:59+08:00
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

- Review 来源及 hash：`_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260911-restart-round-2.md`，`shasum -a 256` = `sha256:3b8243643bad91ab727d9251ff247d3bb7225a8d211e730f26542e30f9081016`；review `verdict: FINDINGS_REPORTED`、`scopeExceptions: []`、`failedLayers: []`、`acCoverageComplete: true`、`findingCounts` 合计 7（patch 2 / defer 3 / dismiss 2），schema 有效，未 degraded。
- Story、series、round：匹配（`storyId=11-9`、`storyKey=11-9-normalize-code-review-artifact-directories-by-story-id`、`reviewSeries=restart`、`round=2`；restart series 最大 round 为 2，crDir 内不存在同 hash 的既有 round 2 evaluation，本文件是唯一 current evaluation）。
- crDir 来源：manual orchestrator 通过 `speclite resolve cr-directory` 传入 `crDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`；本 evaluation 未重推导，写入同一目录。
- Scope hash：匹配（`headSha=53195ae203bd0558fdc138a9e509ab34011e860a` 与本机 `git rev-parse HEAD` 一致，即 round 1 fix commit；`scopeHash` 自 review 复制；工作树未提交改动仅为 round 2 summary 本身、`goal-execute-records/EXPERIMENTS.md` 与 kickoff gate 明确排除的 21 个非 Epic 11 文件）。
- Reviewer quorum：3/3（blind / edge / auditor 均 PASS；review 的 `.tmp/restart-round-2/` raw layer 输出已按 reviewer workflow 清理，本评估只依赖 review 正文证据与自行复现）。
- Evaluator 独立性：**同模型限制说明**——reviewer 与 evaluator 均为 Claude Opus 5 (claude-opus-5)。为此本评估对全部 7 条 finding（含 2 条 blocking 候选）都在 `$TMPDIR` 临时项目用 `dist/bin/speclite.js`（bundle 时间 17:57 晚于 `src/config/cr-directory.ts` 17:55，stack trace 中 bundle 内 `escapesProject` → `findProjectBoundarySymlinkEscape` 调用链与源码 `:154/:175/:189/:341` 一致）第一手复现，逐条记录主动寻找的反证，并对 round 1 已 resolved 的 5 条指纹做抽样复核；未采信任何 reviewer 结论作为证据替代。
- Read-only 声明：本次未修改源码、测试、Story、tracker 或 review source；只读验证为 `npx vitest run test/cr-directory.test.ts test/code-review-contract.test.ts`（40 passed / 4 todo）与 `$TMPDIR` 临时项目 CLI 探针 13 例（每例 `find -newer` 零 mutation，用后已删除）。未运行全量 `vitest`、`npm pack` 或 packaging / portability / integrity 测试。

## Finding Evaluations（逐项评估）

### R1-F4: HALTED finalizer 后 fresh-session runner 重入仍路由到 canonical（R1-F4 残留子场景）

- 发现指纹：`sha256:0a5019c56b0fa37220562fd85361f75184cf0eb499791060c4db62a3c455113d`
- Reviewer 提出的失败场景：legacy L 含 restart round-1 summary / evaluation / CR04-05 / goal-execute-records / `result: HALTED` finalizer，canonical 不存在；用户在 fresh session 重新启动 runner → Step 0（`runner-workflow.md:16`）无条件调用 resolver → `crDir=canonical`（L 因含 finalizer 被视为已关闭）→ canonical 无 goal records、无 current artifacts → 恢复矩阵 `:26` → Step 4/5 在 canonical 写 `…-restart-round-1.md` → 同一 series 拆到两个目录、round 1 重复，且此后 resolver 不再报 ambiguity。
- 独立证据：(1) 临时项目复现 S3：L 含 summary + evaluation + `11-9-cr-finalizer-20260911-restart-round-1.md` + `goal-execute-records/PLAN.md`，canonical 不存在 → `ok:true`、`crDir=impl/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyCrDirs=[L]`、`roundEvidence=[{L, summaryRounds:[1], finalizerRounds:[1], unfinished:false}]`、exit 0——resolver 行为符合决策 A 与契约 `:66`，问题不在 resolver。(2) `runner-workflow.md:16`："调用一次 `speclite resolve cr-directory` … 冻结 `crDir` … 冻结值写入 goal records"，`:17` "识别 current review series、最大 round、latest v2 artifacts" 未指明在 `legacyArtifactPaths` / `roundEvidence` 中识别；`:34` 的 HALTED 行只写 "重入使用 goal records 冻结的 `crDir`"——fresh session 下 goal records 位于 `L/goal-execute-records/`，而 runner 按 `:16` 冻结到 canonical 后读不到它们。(3) `cr-contract.md:66`："runner 必须以 goal records 冻结的 `crDir` 重入 CR06，人工 orchestrator 以 `roundEvidence` 中含该 series finalizer 的唯一目录重入"——`roundEvidence` 定位半句只赋予了人工 orchestrator。(4) round 1 evaluation 对 R1-F4 的授权文案明写 "以 `roundEvidence` 中含 finalizer 的唯一 legacy 目录 + 其 report `result` / goal records 冻结的 `crDir` 重入"，fixRecord 只落笔了后半句；round 1 失败场景本身已包含 "runner 按 `:34` 重入 CR06 时在 canonical 找不到 evaluation → non-durable HALT，或后续 round 落入 canonical"，fresh-session 重解析正是该场景的触发路径之一，未越出授权范围。
- 已检查的反证：(1) 是否为措辞变化的新 P1？否——category（lifecycle-routing）、invariant（同一 run 完成前始终路由回同一目录）、失败结果（split-series + 重复 round）均与 round 1 相同，仅触发路径由同 session 变为 fresh session、主要位置由 `:34` 移到 `:16`；按契约 "措辞变化但 fingerprint seed 等价时必须判为 recurred"，且 reviewer 亦沿用同一指纹。(2) `:37` "同一证据同时指向多个 current 状态时 HALT" 是否已能兜底？不能——只有 runner 主动去 `legacyArtifactPaths` 中找到 L 的 HALTED finalizer，`:37` 才会触发；`:16-:18` 没有要求 runner 这样做，字面执行落入 `:26`。(3) 是否可 deferred？否——HALTED finalizer 通常需要用户介入（tracker 缺失、partial write），会话结束后 fresh session 重入是 HALTED 的主要重入路径而非边角；失败结果是静默 split-series 且事后 resolver 不再能诊断（L 已关闭、canonical 单一未完成 → `canonical`），直接违反 AC9 "在一个目录内恢复" 与 Story 核心目标。(4) 是否触及决策 A / AC12？否——修复是 runner / contract 层 ≤2 行 prose：runner 可以读取 finalizer report 内容（`:34` 本就要求 "按 report 恢复动作重入"），resolver 不读内容、basename 与 round numbering 不变。(5) 是否 Threat Model out-of-scope？否——不涉及 hard link / CRLF / TOCTOU / 伪造内容 / 审批重放。(6) 是否已构成 churn？尚未——本指纹只经历一次修复（round 1 部分落笔）与一次复现，未达契约 "连续修复后仍复现" 条件；但若 round 3 再次复现即触发 churn 阈值，见 Convergence。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：`runner-workflow.md` Step 0（`:16-:18`）追加 ≤2 行：resolver 返回 `compatibilityMode=canonical` 且 canonical 无该 series 的 v2 artifacts、而 `roundEvidence` 中恰有一个 legacy 目录含该 series finalizer 时，runner 读取该目录的 finalizer report（runner 读内容合法，resolver 不读）；其 `result: HALTED` 则以该 legacy 目录为冻结 `crDir`（连同其 `goal-execute-records/`）重入 Step 10.4，不得在 canonical 开新 round；`result: DONE` 则按 `:35` 进入 Step 11。`:34` 同步注明 "fresh session 亦按 Step 0 该规则定位，不重解析后落入 Step 4"。`cr-contract.md:66` 把 `roundEvidence` 定位规则扩展到 runner（措辞如 "runner 与人工 orchestrator 均以 `roundEvidence` 中含该 series finalizer 的唯一目录定位，runner 同时沿用该目录 goal records 冻结的 `crDir`"）。两包 `CHANGELOG.md` 追加条目。**禁止**修改 `src/config/cr-directory.ts` 的 `unfinished` 判定、finalizer basename 或让 resolver 读取内容；若 fixer 认为无法在不违反决策 A / AC12 的前提下落笔，须停止并返回 `DECISION_NEEDED` 建议。

### R1-F6: dangling symlink 候选被判为可用 canonical 或列入 legacyCrDirs

- 发现指纹：`sha256:a5701f031269aa3734bbf19619ad083ae8deb586613cd4f7e3ebd028feccd224`
- Reviewer 提出的失败场景：(a) `11-9-code-review -> <不存在路径>`：lstat 成功、realpath ENOENT 被 `path-normalizer.ts:132` 视为非 escape、`collectRoundEvidence` ENOENT 返回 undefined → `ok=true, crDir=canonical, continue`，consumer 首次 `mkdir -p <crDir>/.tmp` 失败。(b) `11-9-dangling-code-review -> nowhere` 被列入 `legacyCrDirs` 但不在 `roundEvidence`。
- 独立证据：(a) 复现：`ok:true`、`crDir=impl/code-reviews/11-9-code-review`、`canonical`、`roundEvidence=[]`、exit 0；随后 `mkdir -p impl/code-reviews/11-9-code-review/.tmp` → "No such file or directory"。(b) 复现：`legacyCrDirs=["impl/code-reviews/11-9-dangling-code-review"]`、`roundEvidence=[]`；源码 `cr-directory.ts:179-184` 的 `stat` ENOENT 分支落穿到 `push`。代码自 round 1 未变（round 1 授权范围明确不含本项，fixer 未越权顺手修改）。
- 已检查的反证：与 round 1 相同——(1) 无越界写入风险（dangling 目标上 `mkdir -p` / 普通写入均 ENOENT，不会在项目外创建目录）；(2) 静态 dangling symlink 不是 TOCTOU，在 in-scope 范围内；(3) 失败晚于 resolver、无 stable issue，但 fail-close 结果一致且不影响任何正常目录布局。round 2 未出现使其升级的新事实；R2-F1 修复面（`escapesProject` 错误捕获）与本项相邻但不重叠（本项是 ENOENT 语义而非非 ENOENT 异常），仍不并入 P1。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：维持登记 TODO（T2）；触发条件不变：为候选目录引入 symlink 目标存在性 / `stat` 校验时（R2-F1 修复后的自然扩展，可与 R2-F3 同一 TODO 关闭），或任一 consumer 报告 resolver `continue` 后首次写入因 dangling symlink ENOENT。

### R1-F7: `ResolveCrDirectoryOutputSchema` 的 details redaction refinement 会拒绝 `implementation_artifacts` 含 `tmp` 等段名时的合法 block 输出

- 发现指纹：`sha256:d4580fd95b30f1cb5b2021019a0db7474e856619cf3c7742b5f1d1ecf13cd550`
- Reviewer 提出的失败场景：`implementation_artifacts = "tmp/impl"` + 双未完成 run → CLI 正常输出 ambiguity block，但 `ResolveCrDirectoryOutputSchema.safeParse` 因 `findUnsafeIssueValue` 命中 `tmp` 段而失败。
- 独立证据：`src/config/resolve-output-schema.ts:106-111` 的 `superRefine` 仍对 `details` 调用 `findUnsafeIssueValue`；round 1 fixer 未触碰（授权范围外），行为未变；CLI 实际 stdout 不经该 schema，schema 仅在测试内消费。
- 已检查的反证：与 round 1 相同——CR-local schema 有意镜像 SPEC 07 redaction 约定（`src/validation/issue-model.ts` `hasTemporaryOrCachePathShape`），`artifact-documents` 等既有 issue 在同样 config 下同样被拒；放宽属 SPEC 07 / issue-model 仓库级决策，不归本 Story；无 CLI 行为缺陷、无写入风险。round 2 无新事实。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。

### R1-F8: config 解析失败时 stdout 为空，与 cli.md "始终返回 cr-directory.v1 evidence" 措辞不一致

- 发现指纹：`sha256:f312d0d64cc0a8608e997b338a86a34f0166c607335428402b2e9f64ae62705b`
- Reviewer 提出的失败场景：项目无 `_speclite/config.toml` → stdout 空、stderr 一条 SPEC 07 issue、exit 1、无 `continuation` 字段。
- 独立证据：临时空项目复现：exit 1、stdout 0 字节、stderr `runtime-path.missing-entry`（`component: config-resolver`），与 `artifact-roots` / `artifact-documents` 同形；`docs/reference/cli.md:238` "始终返回" 措辞未改（round 1 已明确为可选调整，fixer 未采用属合法选择）。
- 已检查的反证：与 round 1 相同——`cr-contract.md` Runtime Resolution 规定 runtime config 失败先于 CR 目录解析即 HALT，exit≠0 已足以阻断；"始终返回" 描述 resolver 阶段（含 block），upstream config 失败属 SPEC 07 runtime-path 阶段。不构成缺陷。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。

### R2-F1: `escapesProject` 路径（lstat / realpath）只吞 ENOENT，ELOOP / ENOTDIR / EACCES 仍以未捕获异常穿透 CLI

- 发现指纹：`sha256:b9c63a8bac175253d894d8ec95b9ec26a24c62f36f882707c5eec812ee291b49`
- Reviewer 提出的失败场景：(1) `implementation_artifacts` 根为普通文件 → `lstat(<impl>/code-reviews)` ENOTDIR；(2) `code-reviews` / canonical / legacy 自环 symlink → `realpath` ELOOP；(3) `<impl>` mode 000 → `lstat` EACCES；(4) legacy symlink → `notes.md/sub` → realpath ENOTDIR。四者经 `cr-directory.ts:154 / :175 / :189` 的 `escapesProject`（`path-normalizer.ts:117,:133` 非 ENOENT 直接 throw）穿透 → stdout 空、stderr 含绝对路径 stack trace、无 `cr-directory.*` issue、`--human` 同样崩溃。
- 独立证据：五个场景在 `$TMPDIR` 临时项目全部复现——(1) `impl` 为普通文件：`Error: ENOTDIR … lstat '…/impl/code-reviews'`，stack 经 `findProjectBoundarySymlinkEscape` → `escapesProject` → `resolveCrDirectory`（bundle `:15036`，对应源码 `:154`）；(2a) `code-reviews -> code-reviews` 自环：`ELOOP … realpath`，同 `:154`；(2b) `11-9-code-review -> 11-9-code-review` 自环：`ELOOP`，bundle `:15068`（源码 `:189`）；(3) `impl` mode 000：`EACCES … lstat`，`:154`；(4) `11-9-x-code-review -> notes.md/sub`：`ENOTDIR … realpath`，bundle `:15056`（源码 `:175`）。五例 exit 1、stdout 0 字节、stderr 各含 2 行 `$TMPDIR` 绝对路径；`--human` 同样以未捕获 ELOOP 退出。源码 `cr-directory.ts:340-342` 的 `escapesProject` 无 try/catch，`path-normalizer.ts:114-118,:130-134` 只吞 `isMissingPathError`。round 1 修复只包住了 `readdir`（`:161-166`、`:244-249`）与 legacy `stat`（`:179-183`）调用面。`docs/reference/cli.md:238` 在 round 1 修复后明文承诺 "候选路径不是可读目录时以 `unreadable-candidate` 阻断而非抛异常"，当前实现违反了自己新增的承诺。
- 已检查的反证：(1) 是否与 R1-F1 同指纹（应判 recurred 而非 new）？否——invariant 与 category 相同，但 `concreteFailureScenario`（ELOOP / 祖先 ENOTDIR / 祖先 EACCES 经 lstat/realpath）与 `primaryLocation`（`:341` 而非 readdir 调用面）均不同，round 1 授权范围明确限定 "非 ENOENT 的 `readdir` 失败" 与 "legacy symlink 目标 `stat().isDirectory()`"，fixer 未越权也未遗漏授权项，故本项是同 invariant 的第二调用面，指纹为 `new`；round 1 的 R1-F1 指纹确已关闭（见 Convergence）。(2) 是否 Threat Model out-of-scope？否——自环 symlink、祖先为普通文件、祖先无权限都是协作式本地文件系统的静态状态，"symlink 越界检测（复用 `findProjectBoundarySymlinkEscape`）" 与 "fail-close" 明示 in scope；不涉及 hard link / CRLF / TOCTOU / 伪造内容。(3) fail-close 是否仍成立？成立（exit 1、零写入），故不是 P0；但 CLI 机器契约（stdout evidence + stable `issueId` + `continuation`）与 kickoff gate "禁止 stack / absolute path" 的诊断纪律被违反，runner 按 `runner-workflow.md:16` 拿不到 `continuation`。与 R1-F1 判 P1 的依据完全一致，若本项降级即与 round 1 裁决自相矛盾。(4) 修复是否需要触碰 Story 11.5 的 `path-normalizer.ts`？不需要——在 `cr-directory.ts` 的 `escapesProject` 包装层捕获非 ENOENT 错误并返回 `unreadable-candidate(candidate, errorCode)` 即可统一三个调用点，issue id 与 schema enum、`cli.md` 列表均已存在，不新增 issue id、不改 basename / round / 审批规则。(5) 是否只是 verify 义务？否——需要改变生产语义（抛异常 → 结构化 block）。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：`src/config/cr-directory.ts` 把 `escapesProject`（`:340-342`）改为捕获非 ENOENT 错误并向三个调用点（`:154`、`:175`、`:189`）返回可判别结果，由调用点以既有 `unreadable(candidate, errorCode)` 结构化 block（`details` 只含 `storyId` / `reviewSeries` / `canonicalCrDir` / `errorCode` / `reason`，不得写入 `error.message` 或绝对路径）；ENOENT 语义保持不变（不得顺手改动 R1-F6 的 dangling 判定）。`test/cr-directory.test.ts` 补三个 fixture：`implementation_artifacts` 根为普通文件（ENOTDIR）、`code-reviews` 或 canonical 自环 symlink（ELOOP）、`<impl>` mode 000（EACCES，沿用 `:414` 的 root / 非 POSIX skip guard），断言 stdout 结构化 block、stderr 单行 issue、`JSON.stringify(result)` 不含 `projectRoot`，并复用 `ResolveCrDirectoryOutputSchema.parse` 校验。不得修改 `src/fs/path-normalizer.ts`。

### R2-F2: 别名 symlink 与目标目录解析到同一物理目录时被计为两个未完成 run 根，误报 `ambiguous-resume-root`

- 发现指纹：`sha256:d90de50b466b377bd56f6a69c391c9eae964c5dbba656c9a18f60d3857b1577a`
- Reviewer 提出的失败场景：canonical 含 restart round-1 summary（未完成），同级 `11-9-alias-code-review -> 11-9-code-review` → `cr-directory.ambiguous-resume-root`，`roundEvidence` 两条 unfinished=true 指向同一物理目录；镜像场景两个 legacy 名指向同一目录同样 block。
- 独立证据：两场景复现：`legacyCrDirs=["impl/code-reviews/11-9-alias-code-review"]`、`roundEvidence` 两条 `summaryRounds:[1], finalizerRounds:[], unfinished:true`、issue `multiple-unfinished-run-roots`、exit 1、零 mutation；镜像场景 `legacyCrDirs` 两条同样 block。行为与源码 `:169-185`（symlink 指向目录即入选 legacy）、`:207-229` 一致。
- 已检查的反证：(1) 契约 Contract Anchor（`cr-contract.md:64-65`）："判定只看 `code-reviews/` 下的目录名与候选目录的直接子文件名：legacy 目录 = `{storyId}-<非空文本>-code-review`；… ≥2 legacy 含 → block"。一个名称匹配 legacy 模式且指向目录的 symlink，按目录名规则**就是**一个 legacy 目录；resolver 输出精确符合契约。finding 的 invariant "同一物理目录不应被计为两个 run 根" 不是契约不变量，而是要求引入物理身份（realpath 去重）语义，这超出决策 A "只看目录名" 的边界。(2) 失败方向是 fail-closed：零写入、stable issue、`roundEvidence` 完整列出两条完全相同的 round 证据，操作者可据此识别别名并按 `suggestedNextStep` "archive the extra … run"（移除别名 symlink）恢复；不存在 split-series 或静默错路由风险。(3) 触发前提（同级放置一个 title-bearing 别名 symlink 指向 CR 目录）在协作式本地文件系统中无任何 CR01–06 或 runner 产生路径，Story AC8 也不要求识别别名。(4) 是否值得登记 TODO？否——在契约不变的前提下没有可执行的改进项；若未来决定引入物理身份判定，那是对决策 A 的重开，须由项目负责人裁决而非 TODO。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。依据 `cr-contract.md:64-65` 与 Story `Threat Model & Non-Goals` "resolver 只看文件名" 裁决为 by-design；不得为其编写代码或测试。

### R2-F3: 产物文件为 symlink 时 `Dirent.isFile()` 静默忽略，与 legacy 目录 symlink 的 stat 跟随语义不一致

- 发现指纹：`sha256:e492716502cf8f7580da8290b53cc8d5431ce6e1d888ead92f20ecb3c4384c05`
- Reviewer 提出的失败场景：canonical 内 `11-9-code-review-summary-…-restart-round-1.md` 为指向项目内真实文件的 symlink → `summaryRounds=[]`、unfinished=false；镜像：legacy L 真实 summary + symlink 形式 finalizer → `finalizerRounds=[]` → L 判 unfinished → `legacy-resume` 路由到已关闭 run。
- 独立证据：两场景复现：canonical summary 为 symlink → `roundEvidence=[{canonical, summaryRounds:[], finalizerRounds:[], unfinished:false}]`、`crDir=canonical`、exit 0；镜像 → `crDir=L`、`legacy-resume`、`finalizerRounds:[]`。源码 `:254` `if (!entry.isFile()) continue;` 对 symlink 条目为 false；而 legacy 目录 symlink 在 `:173-184` 经 `stat` 跟随。
- 已检查的反证：(1) 与 R2-F2 的区别：契约 `:64` 的 "直接子文件名" 是本项的 Contract Anchor，实现在名字之外又加了 `isFile()` 类型过滤，且与同文件对目录 symlink 的处理不一致——这是实现层未在契约明示的语义分叉，不是 by-design。(2) 影响是否阻塞？否——CR01–06 只写真实文件，不产生 symlink 产物；触发需要人工把产物替换为 symlink，在协作式 FS 中概率极低；两种失败方向（忽略 / 误 resume）均不会越界写入，且不属于伪造内容或产物真伪认证（symlink 目标是项目内真实文件）。(3) 是否可与 R1-F6 合并处理？可以——二者都落在 "symlink 条目的 stat 跟随语义"，宜由同一 TODO 一次固定（契约明示 "symlink 产物不计入" 或对 symlink 条目 `stat` 后按 `isFile` 计入，并补一条测试）。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：登记 TODO（T3）；触发条件：处理 R1-F6（候选 symlink 存在性 / `stat` 校验）时一并裁决并固定 symlink 产物条目语义，在 `cr-contract.md:64` 一句明示，并补一条测试；或任一 consumer 报告 symlink 产物导致 `roundEvidence` 与磁盘不符。

## Required Fixes（阻塞修复）

| 发现指纹 | 优先级 | 失败场景 | 授权范围 |
|---|---|---|---|
| `sha256:b9c63a8bac175253d894d8ec95b9ec26a24c62f36f882707c5eec812ee291b49`（R2-F1） | P1 | `implementation_artifacts` 根为普通文件 / 祖先 mode 000 / `code-reviews` 或候选目录自环 symlink / legacy symlink 指向文件内路径时，`escapesProject` 的 lstat / realpath 抛 ENOTDIR / EACCES / ELOOP 未捕获穿透 CLI：stdout 空、stderr 含绝对路径 stack trace、无 stable issue、`--human` 同样崩溃 | `src/config/cr-directory.ts`（`escapesProject` 包装层捕获非 ENOENT 错误，三个调用点 `:154/:175/:189` 以既有 `unreadable-candidate` 结构化 block；ENOENT 语义不变）、`test/cr-directory.test.ts`（impl 根为文件、自环 symlink、impl mode 000 三个 fixture）；禁止修改 `src/fs/path-normalizer.ts`、禁止新增 issue id / 改 schema enum、禁止读取产物内容、禁止改 basename / round / 审批规则 |
| `sha256:0a5019c56b0fa37220562fd85361f75184cf0eb499791060c4db62a3c455113d`（R1-F4，recurred） | P1 | legacy-resume run 写入 HALTED finalizer 后，fresh session 的 runner Step 0 重解析得 `crDir=canonical`，缺少 "到 `roundEvidence` 中含该 series finalizer 的唯一 legacy 目录读取 report / goal records" 的规则，字面执行落入 Step 4 在 canonical 写 round 1 → split-series + 重复 round 且事后不可诊断 | `speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md` Step 0（`:16-:18` 追加 ≤2 行 fresh-session 定位规则）与恢复矩阵 `:34`（注明 fresh session 亦按 Step 0 规则定位、不重解析后落入 Step 4）；`speclite-code-review-contract/references/cr-contract.md:66`（把 `roundEvidence` 定位规则扩展到 runner）；上述两包 `CHANGELOG.md` 追加条目。**禁止**修改 `src/config/cr-directory.ts` 的 `unfinished` 判定、finalizer basename 或让 resolver 读取内容；无法在决策 A / AC12 内落笔时返回 `DECISION_NEEDED` |

跨项共同授权：修改 `src/**` 后重新 `npm run build` 并在**沙箱外**重新生成 `release/packaging-manifest.json`；修改任一 Skill 包文件后重新生成 `test/fixtures/fresh-install-empty-project/expected/installed-state/{files-index-full,skill-index-full}.json`；验证命令至少含 `npx vitest run test/cr-directory.test.ts test/code-review-contract.test.ts`、`npm run docs:check`、canonical strict check，`npx vitest run` 全量与 `npm run release:check` 在沙箱外执行。上述以外的文件（含 Story、tracker、review、Canonical Paths 表、basename、round numbering、审批规则、SPEC 07 taxonomy、`path-normalizer.ts`、R1-F6 / R2-F3 涉及的 symlink ENOENT / `isFile` 语义）不在授权范围。

## Verify Obligations（验证义务）

| 发现指纹 | 必须补充的测试或断言 | 是否允许修改生产语义 |
|---|---|---|
| （无） | — | — |

## Deferred TODO Candidates（延期候选）

| 发现指纹 | 建议紧迫度 | 触发条件 |
|---|---|---|
| `sha256:a5701f031269aa3734bbf19619ad083ae8deb586613cd4f7e3ebd028feccd224`（R1-F6，recurred deferred） | T2 | 为 CR 目录候选引入 symlink 目标存在性 / `stat` 校验时（R2-F1 修复后的自然扩展）一并处理；或任一 consumer 报告 resolver `continue` 后首次写入因 dangling symlink ENOENT |
| `sha256:e492716502cf8f7580da8290b53cc8d5431ce6e1d888ead92f20ecb3c4384c05`（R2-F3） | T3 | 处理 R1-F6 时一并固定 symlink 产物条目语义（契约 `cr-contract.md:64` 明示 "symlink 产物不计入" 或对 symlink 条目 `stat` 后按 `isFile` 计入）并补一条测试；或任一 consumer 报告 symlink 产物导致 `roundEvidence` 与磁盘不符 |

## Convergence（收敛）

- 新增阻塞项：1（R2-F1 `b9c63a8b…`）——与 R1-F1 同 invariant 但 `concreteFailureScenario` 与 `primaryLocation` 不同，round 1 授权范围未覆盖该调用面，按 fingerprint 为 `new`。
- 复现阻塞项：1（R1-F4 `0a5019c5…`）——round 1 fixer 只落笔授权文案的 "goal records 冻结 `crDir`" 半句，"`roundEvidence` 定位" 半句被限定给人工 orchestrator，fresh-session 子场景未关闭；失败结果与 invariant 相同，判 recurred 而非新 P1。
- 已关闭阻塞项：4（R1-F1 `348347a1…`、R1-F2 `400bd7fa…`、R1-F3 `ae5e5b2b…`、R1-F5 `eaa2fdd5…`）。抽样复核：R1-F1——canonical 为普通文件 → `unreadable-candidate` / `ENOTDIR` 结构化 block，legacy mode 000 → `EACCES` block，stdout 有 evidence、stderr 无绝对路径；R1-F2——`cr-contract.md:58` 与 `runner-workflow.md:16` 已改为 "不作为新 run 目录；`legacy-resume` 唯一未完成 run 原位续写"；R1-F3——`runner-workflow.md` 六个 CR01–06 调用串均含 `crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths}`，六个 `SKILL.md` Inputs 登记三字段，`test/cr-directory.test.ts:585-621` 断言通过；R1-F5——`code-reviews -> $TMPDIR/outside`（内含 `11-9-outside-title-code-review/`）→ `symlink-escape` block 且 `legacyCrDirs=[]`、`roundEvidence=[]`，源码 `:152-156` 确认 escape 检测已前置于 readdir。R1-F9（round 1 VERIFY 义务，非 blocking，不计入 `resolvedBlocking`）：`test/cr-directory.test.ts:597-602` 已断言 `{crDir}/goal-execute-records/` 与三个 record 文件名，义务已履行。round 1 `newBlocking=5` = 本轮 `resolvedBlocking 4 + recurredBlocking 1`，账目闭合。
- Churn 证据：`churnDetected: false`。`src/config/cr-directory.ts` 错误处理面第二次触及（round 1 readdir / stat，round 2 `escapesProject`）但为不同指纹、阻塞数由 5 降至 2，不满足 "同一函数反复修改且阻塞数不下降"；R1-F4 指纹只经历一次修复 + 一次复现，未达 "连续修复后仍复现"。**阈值提示**（如实记录，不为收敛降级）：(a) 连续存在 `newBlocking > 0` 的轮次已达 2（round 1: 5，round 2: 1），`stopLossConsecutiveRounds=3`——若 round 3 再出现任何 new P0/P1 即触发契约 `STOP_LOSS`，同时触及项目负责人 "≤3 轮、第 3 轮仍有 new P1 需停下重新评估" 边界；(b) R1-F4 若在 round 3 第三次出现即满足 "同一 fingerprint 连续修复后仍复现" 的 churn 条件。因此 round 2 fixer 必须一次性、完整地关闭上表两项（R1-F4 须同时覆盖同 session 与 fresh session 两条重入路径），round 3 只允许作为 fresh review 确认收敛。
- 架构类别：`[]`——R1-F4 属 lifecycle 类别，但仍可由 runner / contract 层 ≤2 行局部 prose 关闭且不触及决策 A / AC12；R2-F1 属 path-safety 局部代码修复；无 authority / ownership / cross-component-concurrency 类 finding；未达 `maxRounds=5`。

## Evaluation Verdict（评估结论）

- 裁决：`FIX_REQUIRED`
- 理由：存在 2 条 accepted P1——R2-F1（new）：`escapesProject` 调用面对 ELOOP / ENOTDIR / EACCES 未捕获，CLI 以含绝对路径的 stack trace 退出、无 `continuation` 与 stable issue，违反 `cli.md:238` 在 round 1 新增的 "以 `unreadable-candidate` 阻断而非抛异常" 承诺，与 R1-F1 判 P1 的依据一致；R1-F4（recurred）：fresh session 的 runner 在 HALTED finalizer 后重解析落入 canonical，缺少 `roundEvidence` 定位规则，导致静默 split-series 且事后不可诊断，违反 AC9，且在 round 1 授权文案范围内可由 ≤2 行 prose 关闭。R1-F6 维持 deferred T2，R2-F3 为契约未明示的 symlink 产物语义分叉、非阻塞，deferred T3 与 R1-F6 合并触发；R2-F2 按 `cr-contract.md:64-65` "只看目录名" 与 Story Threat Model "resolver 只看文件名" 裁决 by-design，dismissed；R1-F7 / R1-F8 为仓库级既有约定，维持 dismissed。无 verify-only 义务。所有 finding 均在 Story Threat Model in-scope 范围，无 hard link / CRLF / TOCTOU / 伪造内容类 finding。同模型 caveat：本评估的每条裁决均以 `$TMPDIR` 第一手复现与源码行号为据，并逐条记录反证。
- 必须进入的下一状态：`FIX(mode=patch)` → `speclite-code-review-03-fixer`（`mode=patch`，只修 Required Fixes 表两项，授权范围以表为准；R1-F6 / R2-F3 不得顺手修改）→ 重新冻结 scope → `FRESH REVIEW`（restart round 3，仅用于确认收敛；若 round 3 出现任何 new P0/P1 或 R1-F4 第三次复现，evaluator 必须按契约输出 `STOP_LOSS` 并交项目负责人重新评估）。

## Fix Record（修复执行记录）

- 模型：Claude Opus 5 (claude-opus-5)；mode=`patch`；confirmationPolicy=`preauthorized`，authorizationSource=Restart Brief Step 11 + 用户 2026-09-11「提交并开始 CR」决定（goal-execute-records/EXPERIMENTS.md）。
- R2-F1 `sha256:b9c63a8b…`：`src/config/cr-directory.ts` 将 `escapesProject` 替换为 `checkBoundary`（`inside` | `escape` | `{errorCode}`），三个调用点统一经 `boundaryBlock` → 非 ENOENT 归既有 `cr-directory.unreadable-candidate`，ENOENT 语义不变；未改 `path-normalizer.ts`、未新增 issue id / schema enum。测试新增：impl 根为文件（ENOTDIR）、`code-reviews` / canonical / legacy 自环 symlink（ELOOP）、impl 根 mode 000（EACCES）。
- R1-F4 `sha256:0a5019c5…`（recurred）：`runner-workflow.md` Step 0 增加 fresh-session 定位规则（canonical 无 current artifacts 且 `roundEvidence` 唯一 legacy 含该 series finalizer → 读 report / goal records，HALTED 则以该 legacy 覆盖冻结 `crDir` 直接进 HALTED 行，DONE 则 canonical 为新 run），恢复矩阵 HALTED 行同步；`cr-contract.md:66` 把 `roundEvidence` 定位规则扩展到 runner。未改 resolver / basename / 审批规则。两包 CHANGELOG 追加。
- 未触碰 R1-F6 / R2-F3（deferred）、R1-F7 / R1-F8 / R2-F2（dismissed）。
- 派生同步：`npm run build`；fresh-install fixture 两文件重生成；`release/packaging-manifest.json` 沙箱外重生成。
- 验证：focused 41 passed / 4 todo；canonical strict ok；`npx vitest run`（沙箱外）727 passed / 0 failed / 4 todo；packaging-check PASS；docs:check PASS；`git diff --check` 干净。
- Caveat：同模型；round 3 fresh review / evaluation 仅确认收敛，本 fixRecord 不构成 finalizer authorization。
