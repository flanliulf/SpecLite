---
schemaVersion: speclite.cr-evaluation.v2
artifactType: code-review-evaluation
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: restart
round: 3
generatedAt: 2026-09-11T18:52:00+08:00
modelUsed: Claude Opus 5 (claude-opus-5)
reviewModel: Claude Opus 5 (claude-opus-5)
reviewSource: 11-9-code-review-summary-20260911-restart-round-3.md
reviewSourceHash: sha256:d22b4249caf2ed70eb80210dbc4411e5e1ae20429f024cdb0ab2f52c85569b1e
headSha: bee8e076feebb634560fd0a366f55c7180e6dbbb
scopeHash: sha256:2399343fe889dcc8dccce7ff6946d86b7138ec194e8198d2ba1bdf4a6047dd28
verdict: PASS_WITH_DEFERRED_TODOS
acceptedCounts:
  p0: 0
  p1: 0
  deferred: 5
  verifyRequired: 0
  dismissed: 3
convergence:
  newBlocking: 0
  recurredBlocking: 0
  resolvedBlocking: 2
  churnDetected: false
  architectureCategories: []
---

# Code Review Evaluation（代码审查评估）

## Binding Verification（绑定验证）

- Review 来源及 hash：`_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-summary-20260911-restart-round-3.md`，`shasum -a 256` = `sha256:d22b4249caf2ed70eb80210dbc4411e5e1ae20429f024cdb0ab2f52c85569b1e`；review `verdict: FINDINGS_REPORTED`、`scopeExceptions: []`、`failedLayers: []`、`acCoverageComplete: true`、`findingCounts` 合计 8（patch 2 / defer 3 / dismiss 3），与正文 8 条 finding（R1-F6、R1-F7、R1-F8、R2-F2、R2-F3、R3-F1、R3-F2、R3-F3）一致；schema 有效，未 degraded。
- Story、series、round：匹配（`storyId=11-9`、`storyKey=11-9-normalize-code-review-artifact-directories-by-story-id`、`reviewSeries=restart`、`round=3`；crDir 内 restart series 最大 round 为 3，不存在既有 round 3 evaluation，本文件是唯一 current evaluation）。
- crDir 来源：manual orchestrator 通过 `speclite resolve cr-directory` 传入 `crDir=_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`legacyArtifactPaths=[]`；本 evaluation 未重推导，写入同一目录。
- Scope hash：匹配（`headSha=bee8e076feebb634560fd0a366f55c7180e6dbbb` 与本机 `git rev-parse HEAD` 一致，即 round 2 fix commit；`scopeHash` 自 review 复制；工作树未提交改动仅为 round 3 summary 本身、`goal-execute-records/EXPERIMENTS.md` 与 kickoff gate 明确排除的非 Epic 11 文件）。
- Reviewer quorum：3/3（blind / edge / auditor 均 PASS；raw layer 输出已按 reviewer workflow 清理，本评估只依赖 review 正文证据与自行复现）。
- Evaluator 独立性：**同模型限制说明**——reviewer 与 evaluator 均为 Claude Opus 5 (claude-opus-5)。为此本评估对全部 8 条 finding 在 `$TMPDIR` 临时项目用 `dist/bin/speclite.js`（bundle 18:27 晚于 `src/config/cr-directory.ts` 18:26，`grep -c checkBoundary dist/bin/speclite.js` = 2）第一手复现，逐条记录主动寻找的反证；对 R3-F1 另用 `node --import tsx` 直接加载 `src/config/resolve-output-schema.ts` 验证 schema 拒绝结论；并对 round 2 已 resolved 的 R1-F4 / R2-F1 做抽样复核。未采信任何 reviewer 结论作为证据替代。
- Read-only 声明：本次未修改源码、测试、Story、tracker 或 review source；只读验证为 `npx vitest run test/cr-directory.test.ts test/code-review-contract.test.ts`（41 passed / 4 todo）与 `$TMPDIR` 临时项目 CLI 探针 10 例（每例零 mutation，用后已整体删除）。未运行全量 `vitest`、`npm pack` 或 packaging / portability / integrity 测试。
- 轮次边界（如实记录）：本轮为 Restart Brief（`goal-execute-records/PLAN.md:5,:25`）规定的第 3 轮上限；round 1 / round 2 已连续两轮 `newBlocking > 0`。本轮若接受任何 new P0/P1，契约 Convergence 的 `stopLossConsecutiveRounds=3` 即触发，正确 verdict 将是 `STOP_LOSS` 而非 `FIX_REQUIRED`。下文 R3-F1 的裁决**不以此为依据**，其理由独立成立。

## Finding Evaluations（逐项评估）

### R1-F6: dangling symlink 候选被判为可用 canonical 或列入 legacyCrDirs

- 发现指纹：`sha256:a5701f031269aa3734bbf19619ad083ae8deb586613cd4f7e3ebd028feccd224`
- Reviewer 提出的失败场景：(a) `11-9-code-review -> <不存在路径>`：`lstat` 成功、`realpath` ENOENT 被 `path-normalizer.ts:132` 视为非 escape、`collectRoundEvidence` ENOENT 返回 undefined → `ok=true, crDir=canonical, continue`，consumer 首次 `mkdir -p <crDir>/.tmp` 失败。(b) `11-9-dangling-code-review -> nowhere` 被列入 `legacyCrDirs` 但不在 `roundEvidence`。
- 独立证据：(a) 复现：`ok:true`、`crDir=impl/code-reviews/11-9-code-review`、`compatibilityMode=canonical`、`roundEvidence=[]`、exit 0。源码 `cr-directory.ts:354`（`checkBoundary` 的 ENOENT → `"inside"`）与 `:250`（`collectRoundEvidence` ENOENT → undefined）自 round 2 未变；`git diff --stat 7dc8197 bee8e07 -- src/fs/path-normalizer.ts` 为空。
- 已检查的反证：与 round 1 / 2 相同——(1) 无越界写入风险（dangling 目标上任何写入均 ENOENT）；(2) 静态 dangling symlink 不是 TOCTOU，在 in-scope 范围内；(3) 失败晚于 resolver、无 stable issue，但 fail-close 结果一致且不影响任何正常目录布局。round 3 无使其升级的新事实。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：维持登记 TODO（T2）；触发条件不变：为候选目录引入 symlink 目标存在性 / `stat` 校验时（宜与 R2-F3、R3-F1 同一批 symlink 语义 TODO 一并关闭），或任一 consumer 报告 resolver `continue` 后首次写入因 dangling symlink ENOENT。

### R1-F7: `ResolveCrDirectoryOutputSchema` 的 details redaction refinement 会拒绝 `implementation_artifacts` 含 `tmp` 等段名时的合法 block 输出

- 发现指纹：`sha256:d4580fd95b30f1cb5b2021019a0db7474e856619cf3c7742b5f1d1ecf13cd550`
- Reviewer 提出的失败场景：`implementation_artifacts = "tmp/impl"` + 双未完成 run → CLI 正常输出 ambiguity block，但 `ResolveCrDirectoryOutputSchema.safeParse` 因 `findUnsafeIssueValue` 命中 `tmp` 段而失败。
- 独立证据：`src/config/resolve-output-schema.ts:106-111` 的 `superRefine` 仍调用 `findUnsafeIssueValue(issue.details)`；`git log 7dc8197..bee8e07` 中 `resolve-output-schema.ts` 仅在 feature commit `6079257` 新增，两次 fix commit 未触碰；CLI stdout 不经该 schema，schema 仅在测试内消费（`test/cr-directory.test.ts:71,:242,:378,:452`）。
- 已检查的反证：与 round 1 / 2 相同——CR-local schema 有意镜像 SPEC 07 redaction 约定（`src/validation/issue-model.ts`），`artifact-documents` 等既有 issue 在同样 config 下同样被拒；放宽属仓库级决策，不归本 Story；无 CLI 行为缺陷、无写入风险。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。

### R1-F8: config 解析失败时 stdout 为空，与 cli.md "始终返回 cr-directory.v1 evidence" 措辞不一致

- 发现指纹：`sha256:f312d0d64cc0a8608e997b338a86a34f0166c607335428402b2e9f64ae62705b`
- Reviewer 提出的失败场景：项目无 `_speclite/config.toml` → stdout 空、stderr 一条 SPEC 07 issue、exit 1、无 `continuation` 字段。
- 独立证据：临时空项目复现：exit 1、stdout 0 字节、stderr `runtime-path.missing-entry`（`affectedPath: _speclite/config.toml`）；`docs/reference/cli.md:238` "Machine stdout 始终返回 … evidence" 措辞未改。
- 已检查的反证：与 round 1 / 2 相同——`cr-contract.md` Runtime Resolution 规定 runtime config 失败先于 CR 目录解析即 HALT，exit≠0 已足以阻断；"始终返回" 描述 resolver 阶段（含 block），upstream config 失败属 SPEC 07 runtime-path 阶段，与 `artifact-roots` / `artifact-documents` 同形。不构成缺陷。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。

### R2-F2: 别名 symlink 与目标目录解析到同一物理目录时被计为两个未完成 run 根，误报 `ambiguous-resume-root`

- 发现指纹：`sha256:d90de50b466b377bd56f6a69c391c9eae964c5dbba656c9a18f60d3857b1577a`
- Reviewer 提出的失败场景：canonical 含 restart round-1 summary，同级 `11-9-alias-code-review -> 11-9-code-review` → `cr-directory.ambiguous-resume-root`，`roundEvidence` 两条 unfinished=true 指向同一物理目录。
- 独立证据：复现：`ok:false`、`legacyCrDirs=["impl/code-reviews/11-9-alias-code-review"]`、`roundEvidence` 两条 `summaryRounds:[1], finalizerRounds:[], unfinished:true`、exit 1、零 mutation。源码 `:172-189`（symlink 指向目录即入选 legacy）、`:210-232` 未引入 realpath 去重。
- 已检查的反证：与 round 2 相同——契约 `cr-contract.md:64-65` "判定只看 `code-reviews/` 下的目录名与候选目录的直接子文件名 … ≥2 legacy 含 → block"，一个名称匹配 legacy 模式且指向目录的 symlink 按目录名规则就是一个 legacy 目录，输出精确符合契约；finding 的 invariant 要求引入物理身份语义，超出决策 A "只看目录名" 边界；失败方向 fail-closed、零写入、`roundEvidence` 完整可诊断；在契约不变前提下无可执行改进项。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：无。依据 `cr-contract.md:64-65` 与 Story `Threat Model & Non-Goals` "resolver 只看文件名" 裁决为 by-design。

### R2-F3: 产物文件为 symlink 时 `Dirent.isFile()` 静默忽略，与 legacy 目录 symlink 的 stat 跟随语义不一致

- 发现指纹：`sha256:e492716502cf8f7580da8290b53cc8d5431ce6e1d888ead92f20ecb3c4384c05`
- Reviewer 提出的失败场景：canonical 内 `11-9-code-review-summary-…-restart-round-1.md` 为指向项目内真实文件的 symlink → `summaryRounds=[]`、unfinished=false；镜像：legacy 真实 summary + symlink 形式 finalizer → `finalizerRounds=[]` → 误判 unfinished → `legacy-resume` 路由到已关闭 run。
- 独立证据：复现：canonical summary 为 symlink → `roundEvidence=[{canonical, summaryRounds:[], finalizerRounds:[], unfinished:false}]`、`crDir=canonical`、exit 0。源码 `:257` `if (!entry.isFile()) continue;` 未变；legacy 目录 symlink 在 `:178-188` 经 `stat` 跟随，语义分叉仍在。
- 已检查的反证：与 round 2 相同——契约 `:64` "直接子文件名" 是 Contract Anchor，实现在名字之外又加了 `isFile()` 类型过滤且与同文件对目录 symlink 的处理不一致，是实现层未在契约明示的语义分叉，不是 by-design；但 CR01–06 只写真实文件，触发需人工把产物替换为 symlink，两种失败方向均不越界、不属产物真伪认证。非阻塞。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：维持登记 TODO（T3）；触发条件不变：处理 R1-F6 时一并固定 symlink 产物条目语义（契约 `cr-contract.md:64` 一句明示 "symlink 产物不计入" 或对 symlink 条目 `stat` 后按 `isFile` 计入）并补一条测试；或任一 consumer 报告 symlink 产物导致 `roundEvidence` 与磁盘不符。

### R3-F1: legacy symlink 条目名含反斜杠时 boundary 检查被 `\`→`/` 归一化绕过，越界目录被判为 `legacy-resume` 写根

- 发现指纹：`sha256:49d05a401da857b874a092cb54ad49ec081218dd4862a176c3c61fbde6b98433`
- Reviewer 提出的失败场景：POSIX 上 `code-reviews/11-9-a\b-code-review -> $TMPDIR/outside`（条目名含一个反斜杠），outside 含 restart round-1 summary → `boundaryBlock(candidate)` 经 `path-normalizer.ts:65` `replaceAll("\\","/")` 把候选改写为 `…/11-9-a/b-code-review` → `lstat(…/11-9-a)` ENOENT → `"inside"`；随后 `cr-directory.ts:184` 用原始名 `stat` 跟随到项目外目录 → push → `:198` readdir 项目外目录 → `unfinished=true` → `ok=true, legacy-resume, crDir=…/11-9-a\b-code-review`，且该输出不通过 `ResolveCrDirectoryOutputSchema`。
- 独立证据：
  1. **复现**：`$TMPDIR` 临时项目按上述布局 → dist CLI 输出 `ok:true`、`compatibilityMode:"legacy-resume"`、`crDir:"impl/code-reviews/11-9-a\\b-code-review"`、`roundEvidence[0].summaryRounds:[1], unfinished:true`、`continuation:"continue"`、exit 0。**对照组**（同布局、名称改为 `11-9-ab-code-review`）→ `cr-directory.symlink-escape` block、`legacyCrDirs=[]`、`roundEvidence=[]`、exit 1。根因与 reviewer 一致：`path-normalizer.ts:65` 的 `replaceAll("\\","/")` 与 `:121-135` 逐段 `lstat` 走的是改写后的不存在路径（ENOENT → `:132` 返回 undefined），而 `cr-directory.ts:184` 的 `stat` 与 `:198` 的 `readdir` 用的是原始名。
  2. **schema 拒绝确认**：用 `node --import tsx` 直接加载 `src/config/resolve-output-schema.ts` 对上述输出 `safeParse` → `success:false`，三处 `path must be project-relative POSIX`（`crDir`、`legacyCrDirs.0`、`roundEvidence.0.crDir`）；`isProjectRelativePosixPath(crDir)` = false（`src/manifest/manifest-schema.ts:19` `trimmed.includes("\\")`）。
  3. **边界探针**（用于界定 TODO 范围，非新 finding）：(a) 反斜杠名 symlink 指向**项目内**目录 → 同样 `legacy-resume`、输出 schema-invalid，但不越界；(b) 反斜杠名的**真实**目录（非 symlink，`:174` 分支不经 boundary）→ 同样 schema-invalid 输出，不越界；(c) 反斜杠名越界 symlink 但 outside **无**匹配 summary → `canonical` + 该条目仍列入 `legacyCrDirs` 且 `roundEvidence` 含一条 `unfinished:false`（即已枚举了项目外目录的文件名）。因此这是 "legacy 条目名经 `normalizeProjectRelativePosixPath` 后与原名不等价" 这一类的统一缺口，反斜杠是 POSIX 上唯一能触发它的字符（`trim()` 受 `legacyPattern` 首尾锚点保护，`/` 与 `//` 不可能出现在单个条目名中）。
- 已检查的反证（P1 vs deferred 的裁决依据）：
  1. **威胁模型可达性**：Story `Threat Model & Non-Goals`（决策 A）把 resolver 定位为 "协作式本地文件系统，使用者不是对抗方"，in-scope 的 symlink 越界检测是为了拦截**协作者无意造成的**布局（如 R1-F5 的整个 `code-reviews` 被 symlink 到项目外）。触发本项需同时满足：(i) `code-reviews/` 直接子项名匹配 `{storyId}-<文本>-code-review` **且**含字面 `\`——仅 POSIX 可能（Windows 文件名不允许 `\`）；(ii) 该条目是指向项目外的 symlink；(iii) 要成为写根，项目外目标还须含**同 storyId + 同 series** 的 v2 summary 且无 finalizer。runner、CR01–06、pre-11.9 的 title/slug 派生（kebab-case）与本仓库任何脚本都不产生含 `\` 的目录名；这是一个必须**刻意构造**的病态名称，落在协作式模型之外。把它判为 P1 等同于把决策 A 明示排除的对抗性输入重新抬回阻塞面。
  2. **契约信号**：输出的 `crDir` / `legacyCrDirs` / `roundEvidence[].crDir` 均违反契约 "project-relative POSIX" 不变量并被发布 schema 拒绝。但必须如实指出：CLI stdout 在运行时**不经**该 schema（与 R1-F7 证据一致），runner 按 prose 消费 JSON，所以这只是可检测信号而非运行时防线，不能单独作为 dismiss 依据。
  3. **AC 锚点**：AC11 "title traversal 无法越界" 针对 resolver 的 **输入**（Story title 不参与、不改变目录）；本项的反斜杠来自文件系统既有状态而非输入，`test/cr-directory.test.ts` 的 traversal isolation 断言仍全部通过。不构成 Contract Anchor 硬门失败。
  4. **与本 series 既往 P1 的可比性**：R1-F5（`code-reviews` 整体越界 symlink）与 R2-F1（普通文件占位、权限缺失、自环 symlink 导致崩溃）都是协作者在日常操作中可能无意形成的状态；本项前置条件不在同一可信度层级。
  5. **触发后的后果**：`continuation=continue` 且写根物理上位于项目外——这是 in-scope 不变量的确定性违反，不能否认；但其目标正是链接创建者自己指定的目录，在协作式模型下属自致布局，不产生数据丢失或错误路由到他人产物。
  6. **修复形态**：`cr-directory.ts:172-189` 循环内一行 guard（条目名含 `\`，或更一般地 `normalizeProjectRelativePosixPath(candidate) !== candidate` 时按既有 `unreadable-candidate` 阻断）+ 一条 fixture，不改 `path-normalizer.ts`、不新增 issue id；同时覆盖上述探针 (a)(b)(c)。修复小并不影响 severity 判定，但说明 T1 可低成本关闭。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：登记 TODO（**T1**：下次触及 `src/config/cr-directory.ts` 前必须处理，高于 R1-F6 的 T2，因为后果是越界写根而非 fail-close 的 ENOENT）；修复范围建议：`cr-directory.ts` legacy 枚举循环对 `normalizeProjectRelativePosixPath(candidate) !== candidate` 的条目以 `unreadable-candidate`（`errorCode` 如 `EINVAL`）结构化阻断，`test/cr-directory.test.ts` 补 "反斜杠名越界 symlink → block" 与对照 fixture；不修改 `src/fs/path-normalizer.ts`。**裁决说明**：本项不是为收敛而降级——若按 P1 接受，契约要求的 verdict 为 `STOP_LOSS`（连续第 3 轮 `newBlocking > 0`），evaluator 会如实输出；判 deferred 的唯一依据是决策 A 冻结的协作式威胁模型与上述可达性分析。

### R3-F2: runner Step 0 中"冻结值写入 goal records"先于 fresh-session 覆盖 `crDir`，字面顺序会在 canonical 留下孤立 preflight 记录

- 发现指纹：`sha256:bf3b4158f4e91bc04f8b3958d5ae7478f835f0ed17a5cfcbb5514dd1a53611e0`
- Reviewer 提出的失败场景：R1-F4 状态下 fresh session：`runner-workflow.md:16` 末句 "冻结值写入 goal records" 位于 `:17` 定位规则之前 → 字面执行先在 `{canonicalCrDir}/goal-execute-records/EXPERIMENTS.md` 写 preflight，再按 `:17` 以 legacy 覆盖 `crDir` → canonical 多出一个含脱节 preflight 条目的目录。
- 独立证据：`runner-workflow.md:16` 末句确为 "冻结值写入 goal records（`EXPERIMENTS.md` 当次 preflight 条目）"，`:17` 才是 "Fresh session 定位规则 … 以该 legacy 目录覆盖冻结 `crDir`"，文本顺序与 reviewer 描述一致。对后续判定的影响：`:17` 的前提 "canonical 目录没有 current series 的任何 v2 artifact" 不受 `goal-execute-records/` 子目录影响（不是 v2 artifact；resolver `:257` `isFile()` 也忽略子目录），因此不会改变定位结果，无错误路由。
- 已检查的反证：(1) Step 1（`:40-42`）把 goal records 定义在 `{crDir}/goal-execute-records/`，按步骤整体执行的 runner 会在 Step 0 全部完成（含 `:17` 覆盖）后才进入 Step 1 写记录，字面歧义不必然转化为多余目录；(2) 即便发生，后果仅为 canonical 下一个含单条 preflight 的 `goal-execute-records/`，不含 v2 artifact，不影响 resolver 与恢复矩阵；(3) 与 AC5/AC6 "同一目录" 精神有轻微张力，但不是功能失败。auditor 判 "非 finding 观察" 有据；但文本顺序歧义真实存在且一句可消除。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：登记 TODO（T3，docs-only）：下次修改 `runner-workflow.md` Step 0 时，把 "冻结值写入 goal records" 移至 `:17` 之后，或在 `:17` 注明 "定位规则先于任何 goal records 写入"；可与 R3-F3 同一次 ≤2 行改动关闭。触发条件：触及 runner Step 0 文案，或任一项目报告 canonical 下出现仅含 preflight 的孤立 `goal-execute-records/`。

### R3-F3: fresh-session 定位规则前提为"恰有一个 legacy 含 finalizer"，≥2 个已关闭 legacy 时规则静默、canonical 被当作新 run

- 发现指纹：`sha256:a8b153e483cb11369daebae96c3ae7c4b4601dfd3ed2d7988159e6222e86a4b2`
- Reviewer 提出的失败场景：`11-9-a-code-review/` 与 `11-9-b-code-review/` 各含 restart round-1 summary + finalizer（均 HALTED），canonical 不存在 → resolver 返回 canonical、两条 `finalizerRounds=[1], unfinished:false` → `:17` 前提不成立、不读取任何 report → 恢复矩阵 `:27` → 在 canonical 开 round 1。
- 独立证据：复现 resolver 输出：`ok:true`、`crDir=canonical`、`compatibilityMode=canonical`、`legacyCrDirs` 两条、`roundEvidence` 两条 `summaryRounds:[1], finalizerRounds:[1], unfinished:false`、exit 0。resolver 行为符合契约 `:66` "v2 finalizer 文件名不区分 DONE / HALTED，resolver 一律视为该 series 在该目录已关闭"；缺口在 runner `:17` 的 "恰有一个" 前提未覆盖 ≥2 的情形。
- 已检查的反证：(1) 可达性：同一 series 在两个 title 目录各自写出 finalizer，要求 pre-11.9 title 派生在 series 中途改名且两次 finalize；契约 `:54` 规定 Correct Course 必须换 series；本仓库当前 `code-reviews/` 只有 canonical + `superseded-main/` 归档，不可达；其他项目低概率。(2) auditor 所述 `:38` "多 current 状态 HALT" 兜底**不确定成立**——`:17` 前提失败后 runner 不读取任何 legacy report，`:18` 只识别 canonical（空）的 artifacts，可能直接落入 `:27`；此处如实记录，不采信兜底说法。(3) 后果：两个 legacy 均按契约视为已关闭，若其中有 HALTED run 则不会被自动找回，需人工介入；不越界、不破坏已有产物。是 round 2 新增规则的 totality 缺口，非契约违反。
- 处置：`deferred`
- 优先级：`DEFERRED`
- 必须执行的动作：登记 TODO（T3，docs-only）：`runner-workflow.md:17` 增加一句 "`roundEvidence` 中 ≥2 个 legacy 目录含该 series finalizer → HALT 请求人工裁决，不得在 canonical 开新 round"；与 R3-F2 同一次改动关闭。触发条件：触及 `:17` 定位规则，或任一项目报告同一 series 在 ≥2 个 legacy 目录含 finalizer。

## Required Fixes（阻塞修复）

| 发现指纹 | 优先级 | 失败场景 | 授权范围 |
|---|---|---|---|
| （无） | — | — | — |

## Verify Obligations（验证义务）

| 发现指纹 | 必须补充的测试或断言 | 是否允许修改生产语义 |
|---|---|---|
| （无） | — | — |

## Deferred TODO Candidates（延期候选）

| 发现指纹 | 建议紧迫度 | 触发条件 |
|---|---|---|
| `sha256:49d05a401da857b874a092cb54ad49ec081218dd4862a176c3c61fbde6b98433`（R3-F1，new） | T1 | 下次触及 `src/config/cr-directory.ts` 前必须处理：legacy 枚举循环对 `normalizeProjectRelativePosixPath(candidate) !== candidate`（POSIX 上即条目名含 `\`）的条目以既有 `unreadable-candidate` 结构化阻断并补 "反斜杠名越界 symlink → block" fixture；不改 `path-normalizer.ts`。或任一项目报告 resolver `continue` 后 `crDir` 含 `\` / 物理位于项目外 |
| `sha256:a5701f031269aa3734bbf19619ad083ae8deb586613cd4f7e3ebd028feccd224`（R1-F6，recurred deferred） | T2 | 为 CR 目录候选引入 symlink 目标存在性 / `stat` 校验时一并处理（建议与 R3-F1、R2-F3 同一批 symlink 语义 TODO 关闭）；或任一 consumer 报告 resolver `continue` 后首次写入因 dangling symlink ENOENT |
| `sha256:e492716502cf8f7580da8290b53cc8d5431ce6e1d888ead92f20ecb3c4384c05`（R2-F3，recurred deferred） | T3 | 处理 R1-F6 时一并固定 symlink 产物条目语义（`cr-contract.md:64` 一句明示 "symlink 产物不计入" 或对 symlink 条目 `stat` 后按 `isFile` 计入）并补一条测试；或任一 consumer 报告 symlink 产物导致 `roundEvidence` 与磁盘不符 |
| `sha256:bf3b4158f4e91bc04f8b3958d5ae7478f835f0ed17a5cfcbb5514dd1a53611e0`（R3-F2，new） | T3 | 下次修改 `runner-workflow.md` Step 0 时把 "冻结值写入 goal records" 移至 `:17` 之后或注明 "定位规则先于任何 goal records 写入"（docs-only ≤1 行，与 R3-F3 同次关闭）；或任一项目报告 canonical 下出现仅含 preflight 的孤立 `goal-execute-records/` |
| `sha256:a8b153e483cb11369daebae96c3ae7c4b4601dfd3ed2d7988159e6222e86a4b2`（R3-F3，new） | T3 | 下次触及 `runner-workflow.md:17` 时增加 "≥2 个 legacy 含该 series finalizer → HALT 请求人工裁决"（docs-only ≤1 行，与 R3-F2 同次关闭）；或任一项目报告同一 series 在 ≥2 个 legacy 目录含 finalizer |

## Convergence（收敛）

- 新增阻塞项：0。R3-F1（`49d05a40…`）、R3-F2（`bf3b4158…`）、R3-F3（`a8b153e4…`）均为 new 指纹但裁决为 deferred，不计入 `newBlocking`。
- 复现阻塞项：0。R1-F6 / R2-F3 为 recurred deferred，R1-F7 / R1-F8 / R2-F2 为 recurred dismissed，均非 blocking。R1-F4 未第三次复现。
- 已关闭阻塞项：2（R1-F4 `0a5019c5…`、R2-F1 `b9c63a8b…`）。抽样复核：R1-F4——`runner-workflow.md:17` 已有 fresh-session 定位规则（canonical 无 current series v2 artifact 且 `roundEvidence` 恰一个 legacy 含 finalizer → 读 report / goal records，HALTED 则覆盖冻结 `crDir` 进 HALTED 行，DONE 则 canonical 为新 run），`:35` HALTED 行注明 "fresh session 按 Step 0 的定位规则先找回该 `crDir`，不得因 canonical 为空而落入 Step 4"，`cr-contract.md:66` 已把 `roundEvidence` 定位规则扩展到 "runner 与人工 orchestrator"；R2-F1——canonical 自环 symlink → `cr-directory.unreadable-candidate` / `errorCode: ELOOP` 结构化 block、stdout 有 evidence、无 stack trace、`details` 不含绝对路径，源码 `checkBoundary`（`:347-357`）捕获非 ENOENT，三个调用点 `:160 / :180 / :193` 统一经 `boundaryBlock`。账目闭合：round 1 `newBlocking=5` + round 2 `newBlocking=1` = 6 = round 2 `resolvedBlocking 4` + round 3 `resolvedBlocking 2`。R1-F9（round 1 VERIFY 义务）不计入 blocking 账目，round 2 已确认履行。
- Churn 证据：`churnDetected: false`。`src/config/cr-directory.ts` 错误处理 / path-safety 面第三次被指（round 1 readdir/stat、round 2 boundary 异常、round 3 名称归一化错位）但为三个不同指纹、三种不同根因，阻塞数由 5 → 2 → 0 单调下降，不满足 "同一函数反复修改且阻塞数不下降"；`runner-workflow.md:16-17` 被指两次（R1-F4 recurred 一次后已关闭；R3-F2 / R3-F3 为新的 totality 观察，非 blocking）。无同一 fingerprint "连续修复后仍复现"。连续 `newBlocking > 0` 链在本轮中断（round 1: 5，round 2: 1，round 3: 0），未触发 `stopLossConsecutiveRounds=3`；round 3 < `maxRounds=5`。
- 架构类别：`[]`——本轮无 authority / ownership / lifecycle / cross-component-concurrency 类阻塞 finding；R3-F3 属 lifecycle-routing 类别但为 runner prose totality 的 deferred 项，可由 ≤1 行局部文案关闭。

## Evaluation Verdict（评估结论）

- 裁决：`PASS_WITH_DEFERRED_TODOS`
- 理由：本轮无 accepted P0/P1、无 verify-only 义务；round 2 两项 P1（R1-F4、R2-F1）经第一手抽样复核确认关闭；round 1 五项 P1 与 R1-F9 义务已在 round 2 关闭。8 条 finding 中 5 条 deferred（R3-F1 T1、R1-F6 T2、R2-F3 / R3-F2 / R3-F3 T3）、3 条 dismissed（R1-F7 / R1-F8 仓库级既有约定；R2-F2 按契约 `:64-65` 与 Story Threat Model "只看文件名" by-design）。R3-F1 是 in-scope 的 symlink 越界检测确定性绕过且已复现，但其触发前提（POSIX 目录项名含字面 `\` 且为越界 symlink 且目标含同 series 未关闭 summary）是任何工作流都不产生、必须刻意构造的病态状态，落在决策 A 冻结的协作式威胁模型之外，与本 series 既往 P1（协作者可无意形成的布局）不在同一可信度层级；故判 deferred T1 而非 P1。此裁决不依赖轮次压力——若判 P1，契约要求 `STOP_LOSS`，evaluator 会如实输出。同模型 caveat：本评估每条裁决均以 `$TMPDIR` 第一手复现（含对照组与 schema `safeParse`）与源码行号为据，并逐条记录反证。所有 finding 均在 Story Threat Model in-scope 范围，无 hard link / CRLF / TOCTOU / 伪造内容类 finding。
- 必须进入的下一状态：`RULES` → `speclite-code-review-04-rules-extractor` → `TODO(mode=closeout)`（CR05 登记上表 5 条 deferred fingerprints，紧迫度 T1 / T2 / T3 / T3 / T3）→ fresh completion gate（`speclite-flow-gate mode=story-completion`）→ `FINALIZE`（CR06）。不进入 FIX / FRESH REVIEW；Restart Brief "≤3 轮" 边界在本轮以零 new P1 收敛。
