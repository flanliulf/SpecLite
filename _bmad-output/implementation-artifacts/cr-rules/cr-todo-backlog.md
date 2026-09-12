# CR TODO Backlog — 跨 Story 延迟事项追踪

> 本文档由 `bmad-enhance-05-cr-todo-tracker` 技能维护。
> 记录 Code Review 中发现的非阻塞改进项，跨 Story 追踪直到解决。

## 统计摘要

| 状态 | 数量 |
|------|------|
| 🔴 open | 15 |
| ⏸ superseded-by-restart | 5 |
| 🟡 in-progress | 0 |
| ✅ resolved | 8 |

---

## Open Items

<!-- 按优先级排序：P1 > P2 > P3 -->

> 自 Story 11.9 起，新增条目使用 CR v2 的 `T1/T2/T3` 紧迫度；下列既有条目的 legacy `P2` 字段原样保留，不作机械迁移。`T1` 表示下次触及前必须处理，但仍是当前非阻塞项。

### TODO-028: Epic 11 runner 最终交付提供 Story 11.10 inventory 可点击路径

- **来源**: 11-10 CR main round 3 (2026-09-12)
- **紧迫度**: T2
- **发现指纹**: sha256:2aa33e08aed8bcf90107d218d7ab644b1c056a9c9c37c9c90a9cd366e364693e
- **类别**: other
- **描述**: Story 11.10 AC8 要求"Epic 11 runner 最终交付必须提供该 Story 文件的可点击路径"。当前两份 11.10 flow-gate 与 goal records 均不含 `_bmad-output/implementation-artifacts/stories/11-10-inventory-all-grill-related-skill-references-for-human-confirmation.md` 路径；载体（epic-completion handoff / Story done 最终交付消息）在 Story CR 阶段尚未发生。evaluator main round 1–3 均判 deferred T2。
- **涉及文件**: `_bmad-output/implementation-artifacts/flow-gates/epic-11-completion-gate.md`（待生成）, `_bmad-output/implementation-artifacts/stories/11-10-inventory-all-grill-related-skill-references-for-human-confirmation.md`
- **建议时机**: 运行 `speclite-flow-gate mode=epic-completion target=11` 时，在报告 Recommended Next Action / handoff 段写入该 Story 文件的可点击路径；Story 11.10 `done` 的最终交付消息亦须包含该路径。
- **状态**: open
- **解决记录**:

### TODO-023: 使含反斜杠的 legacy 目录名在 boundary 检查前 fail-close

- **来源**: 11-9 CR restart round 3 (2026-09-11)
- **紧迫度**: T1
- **发现指纹**: sha256:49d05a401da857b874a092cb54ad49ec081218dd4862a176c3c61fbde6b98433
- **类别**: other
- **描述**: `src/config/cr-directory.ts:180` 的 `boundaryBlock(candidate)` 经 `src/fs/path-normalizer.ts:65` `replaceAll("\\","/")` 归一化后检查的是另一条路径（ENOENT → inside），而 `:184` stat / `:198` readdir 使用原始条目名；POSIX 上 `code-reviews/11-9-a\b-code-review -> <项目外目录>`（含同 series 未完成 summary）被判为 `legacy-resume` 写根且输出不通过 `ResolveCrDirectoryOutputSchema`。对照组（无反斜杠）正确 `symlink-escape`。属 in-scope symlink 越界检测的确定性绕过，但触发需刻意构造（CR 工作流不产生此类目录名），evaluator restart round 3 判 deferred T1。
- **涉及文件**: `src/config/cr-directory.ts`, `test/cr-directory.test.ts`
- **建议时机**: 下次触及 `src/config/cr-directory.ts` 前必须处理：legacy 枚举循环对 `normalizeProjectRelativePosixPath(candidate) !== candidate`（或条目名含 `\`）的条目以 `cr-directory.unreadable-candidate` 阻断，并补一条 fixture；不修改 `src/fs/path-normalizer.ts`。关闭须由 fresh review/evaluation 将本 fingerprint 判为 resolved。
- **状态**: open
- **解决记录**:

### TODO-024: 对 dangling symlink 候选做存在性校验而非报告可用 crDir

- **来源**: 11-9 CR restart round 3 (2026-09-11)
- **紧迫度**: T2
- **发现指纹**: sha256:a5701f031269aa3734bbf19619ad083ae8deb586613cd4f7e3ebd028feccd224
- **类别**: tech-debt
- **描述**: `src/config/cr-directory.ts:181-184`：legacy symlink `stat` 遇 ENOENT 时落穿到 `legacyCrDirs.push`；canonical 为 dangling symlink（含指向项目外不存在路径）时 `findProjectBoundarySymlinkEscape` 把 realpath ENOENT 视为非 escape、`collectRoundEvidence` ENOENT 返回 undefined → `ok=true, continue`，consumer 首次 `mkdir -p <crDir>/.tmp` 才 ENOENT。无越界写入，但失败晚于 resolver 且无 stable issue。evaluator restart round 1–3 均 deferred T2。
- **涉及文件**: `src/config/cr-directory.ts`, `src/fs/path-normalizer.ts`, `test/cr-directory.test.ts`
- **建议时机**: 引入候选 symlink 存在性 / `stat` 校验时与 TODO-023、TODO-025 同批关闭（例如 dangling → `unreadable-candidate` 或 skip）；或任一 consumer 报告 resolver `continue` 后首次写入 ENOENT 时处理。
- **状态**: open
- **解决记录**:

### TODO-025: 固定 symlink 形式产物文件在 unfinished run 判定中的语义

- **来源**: 11-9 CR restart round 3 (2026-09-11)
- **紧迫度**: T3
- **发现指纹**: sha256:e492716502cf8f7580da8290b53cc8d5431ce6e1d888ead92f20ecb3c4384c05
- **类别**: tech-debt
- **描述**: `src/config/cr-directory.ts:257` `collectRoundEvidence` 用 `entry.isFile()` 过滤，symlink 形式的 v2 summary / finalizer 被静默忽略，与 `:178-184` 对 legacy 目录 symlink 的 stat 跟随语义不一致；镜像场景可把已关闭 run 判为 unfinished 或反之。CR01–06 不产生 symlink 产物，契约未明示该语义。evaluator restart round 2–3 deferred T3。
- **涉及文件**: `src/config/cr-directory.ts`, `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md`, `test/cr-directory.test.ts`
- **建议时机**: 处理 TODO-024 时一并裁决：契约 CR Directory Resolution 明示"symlink 产物不计入"或对 symlink 条目 stat 后按 isFile 计入，并补一条测试固定所选语义。
- **状态**: open
- **解决记录**:

### TODO-026: 把 runner Step 0 的 goal records 写入移到 fresh-session 定位规则之后

- **来源**: 11-9 CR restart round 3 (2026-09-11)
- **紧迫度**: T3
- **发现指纹**: sha256:bf3b4158f4e91bc04f8b3958d5ae7478f835f0ed17a5cfcbb5514dd1a53611e0
- **类别**: other
- **描述**: `speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md:16` 末句"冻结值写入 goal records"位于 `:17` fresh-session 定位规则之前；HALTED legacy run 的 fresh session 若按字面顺序执行，会先在 canonical `goal-execute-records/` 写 preflight（创建 canonical 目录）再以 legacy 覆盖 `crDir`，留下孤立记录。后续 `:17` 判定不受影响，无错误路由。evaluator restart round 3 deferred T3。
- **涉及文件**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`
- **建议时机**: 下次修改 runner Step 0 时（与 TODO-027 同次，docs-only）：把"冻结值写入 goal records"移到 `:17` 之后，或在 `:17` 注明定位规则先于任何 goal records 写入。
- **状态**: open
- **解决记录**:

### TODO-027: fresh-session 定位规则对 ≥2 个已关闭 legacy 目录显式 HALT

- **来源**: 11-9 CR restart round 3 (2026-09-11)
- **紧迫度**: T3
- **发现指纹**: sha256:a8b153e483cb11369daebae96c3ae7c4b4601dfd3ed2d7988159e6222e86a4b2
- **类别**: other
- **描述**: `runner-workflow.md:17` 前提为"`roundEvidence` 中恰有一个 legacy 目录含该 series finalizer"；两个 legacy 目录各含同 series finalizer（均 HALTED）且 canonical 不存在时规则静默，恢复矩阵落入 Step 4 在 canonical 开新 round（第三个目录）。该状态要求同一 series 曾在两个 title 目录各自 finalize（契约 `:54` 规定 Correct Course 必须换 series），本仓库不可达。evaluator restart round 3 deferred T3。
- **涉及文件**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`
- **建议时机**: 下次触及 `:17` 时（与 TODO-026 同次，docs-only）增加"≥2 个 legacy 含该 series finalizer → HALT 请求裁决"一句。
- **状态**: open
- **解决记录**:

### TODO-018: 补齐 unfinished current-v2 artifact authenticity 认证

- **来源**: 11-9 CR round 6 (2026-09-08)
- **紧迫度**: T1（原技术等级 P1；用户显式接受当前交付风险，未修复、未验证关闭）
- **发现指纹**: sha256:3efe0732e9f9a20aa9940913efe212d59102bf583c2ffbe8a551e123e5bacb20
- **类别**: other
- **描述**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:291-311,485-537` 对 unfinished current v2 artifact 仅验证 identity 五字段，identity-only 残片仍可能把 title-bearing legacy directory 选为后续写入 root。该 finding 原技术等级为 P1，当前仍成立且未修复；依据 `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/evidence-v2-authorization.md` 的 `R6 User-directed Risk Acceptance`，仅将当前交付处置改为 T1，不表示 fixed、resolved 或误报，也不改变全局 P1/TODO 规则。所指 `resolve-cr-directory.mjs` 已随 2026-09-11 Story 11.9 restart 删除（决策 C：历史产物归档于 `11-9-code-review/superseded-main/`）。
- **涉及文件**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`, `test/code-review-contract.test.ts`, `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md`
- **建议时机**: 下次触及 unfinished current-v2 authenticity、legacy-resume 认证或相应 classifier 前必须处理。关闭证据须包含与 artifact family/current state 相称的最小 v2 authenticity 实现、合法 `FINDINGS_REPORTED`/`FIX_REQUIRED` unfinished recovery control、identity-only 残片 fail-close 与 zero-write focused regression，并由后续 fresh review/evaluation 将本 fingerprint 判为 resolved；不得复用 terminal-only DONE 条件。
- **状态**: superseded-by-restart
- **解决记录**:

### TODO-019: 使非法 `~round` near-current delimiter fail-close

- **来源**: 11-9 CR round 6 (2026-09-08)
- **紧迫度**: T1（原技术等级 P1；用户显式接受当前交付风险，未修复、未验证关闭）
- **发现指纹**: sha256:6a902447d67688642c6465da4fe74e1914a6011c0a9214b3346d734836dbfdc8
- **类别**: other
- **描述**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:445-458` 的 artifact basename classifier 未把 selected series 后的非法 `~round` 识别为 `malformed-current-intent`，因此 near-current evidence 可能被静默归为 unrelated。该 finding 原技术等级为 P1，当前仍成立且未修复；依据 `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/evidence-v2-authorization.md` 的 `R6 User-directed Risk Acceptance`，仅将当前交付处置改为 T1，不表示 fixed、resolved 或误报，也不改变全局 P1/TODO 规则。所指 `resolve-cr-directory.mjs` 已随 2026-09-11 Story 11.9 restart 删除（决策 C：历史产物归档于 `11-9-code-review/superseded-main/`）。
- **涉及文件**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`, `test/code-review-contract.test.ts`, `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md`
- **建议时机**: 下次触及 artifact basename classifier、round delimiter 或 `malformed-current-intent` 认证前必须处理。关闭证据须证明 exact Story/family/date/selected-series 下的非法 `~round` fail-close，并以 canonical、legacy、合法 other-series、ordinary-note、无分隔合法 series 与 zero-write focused regressions约束 matcher；还须由后续 fresh review/evaluation 将本 fingerprint 判为 resolved。
- **状态**: superseded-by-restart
- **解决记录**:

### TODO-020: 拒绝 bounded inline list 中的 unquoted flow mapping

- **来源**: 11-9 CR round 6 (2026-09-08)
- **紧迫度**: T1（原技术等级 P1；用户显式接受当前交付风险，未修复、未验证关闭）
- **发现指纹**: sha256:dd07435baba8abce70cb0f54bdf7a7a43c42b020c7c42cb8dbe5325983813ddc
- **类别**: other
- **描述**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:695-715,780-854` 的 bounded inline-list grammar 会把 `declaredFiles: [src/a.ts: injected]` 这一 YAML flow mapping item 当作 path scalar，使非规范 predecessor 参与 DONE authentication。该 finding 原技术等级为 P1，当前仍成立且未修复；依据 `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/goal-execute-records/evidence-v2-authorization.md` 的 `R6 User-directed Risk Acceptance`，仅将当前交付处置改为 T1，不表示 fixed、resolved 或误报，也不改变全局 P1/TODO 规则。所指 `resolve-cr-directory.mjs` 已随 2026-09-11 Story 11.9 restart 删除（决策 C：历史产物归档于 `11-9-code-review/superseded-main/`）。
- **涉及文件**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`, `test/code-review-contract.test.ts`, `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md`
- **建议时机**: 下次触及 predecessor inline-list grammar、artifact authentication 或相关 classifier 前必须处理。关闭证据须在既有 bounded grammar 中拒绝 unquoted colon+ASCII-whitespace flow-mapping item，同时保留 bare colon、quoted colon-space、authentic predecessor、ordinary producer list 与 zero-write controls；不得扩大为 whole-document YAML 或 quoted tracker key治理，并须由后续 fresh review/evaluation 将本 fingerprint 判为 resolved。
- **状态**: superseded-by-restart
- **解决记录**:

### TODO-021: 保留 RFC3339 freshness 比较的完整小数秒精度

- **来源**: 11-9 CR round 6 (2026-09-08)
- **紧迫度**: T2
- **发现指纹**: sha256:a71d3d571a9ff71b09d6f36a00e65148d2ceb2e57c1b1603ecd4cd93ecd31244
- **类别**: tech-debt
- **描述**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:620-648,681-692` 接受任意长度 RFC3339 小数秒，却以 `Date.parse()` 的毫秒值比较 freshness；例如 `.9001Z` 与 `.9000Z` 可能被截为相同毫秒并错误通过。当前 producer 尚无超过毫秒精度的实证，故保持 evaluator 原 T2 处置，未修复、未验证关闭。所指 `resolve-cr-directory.mjs` 已随 2026-09-11 Story 11.9 restart 删除（决策 C：历史产物归档于 `11-9-code-review/superseded-main/`）。
- **涉及文件**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`, `test/code-review-contract.test.ts`, `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md`
- **建议时机**: 下次修改 freshness comparator、RFC3339 timestamp schema 或 timestamp producer 精度时处理。关闭证据须由 owner 明确保留完整允许精度或同步收窄 schema/producer，并以不同小数秒精度的先后、相等、时区等价及现有毫秒 producer focused regressions证明比较器与 contract 一致；随后由 fresh review/evaluation确认本 fingerprint resolved。
- **状态**: superseded-by-restart
- **解决记录**:

### TODO-022: 定义并认证 superseded ordinal lineage

- **来源**: 11-9 CR round 6 (2026-09-08)
- **紧迫度**: T2
- **发现指纹**: sha256:cc04b874c8df8002fee766dfe795e7b68aed5e67658359dffd159c66831b6483
- **类别**: tech-debt
- **描述**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:275-303,421-438` 当前只验证 superseded suffix 为正整数及 frontmatter identity，未认证 ordinal 连续性；缺口或重编号时历史 ordinal identity 可能变化。现有 contract 尚未定义缺口恢复、不可重编号或持久 registry，且该问题不影响 current artifact 唯一性、round 连续性或 current completion authentication，故保持 evaluator 原 T2 处置，未修复、未验证关闭。所指 `resolve-cr-directory.mjs` 已随 2026-09-11 Story 11.9 restart 删除（决策 C：历史产物归档于 `11-9-code-review/superseded-main/`）。
- **涉及文件**: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`, `test/code-review-contract.test.ts`, `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md`
- **建议时机**: 下次修改 supersession lineage/authentication 或需要把 ordinal 作为审计身份前处理。关闭证据须先由 owner 明确定义 gap、replacement、不可重编号或 registry 语义，再同步 resolver 与 focused tests 覆盖连续、缺口、重编号、合法历史副本及 current uniqueness；后续 fresh review/evaluation须确认本 fingerprint resolved。若 owner 决定 ordinal 仅为文件名 suffix，则须以明确 contract 决策关闭，不能冒充实现修复。
- **状态**: superseded-by-restart
- **解决记录**:

### TODO-009: 对齐 `speclite-npm-publisher` fixture hash

- **来源**: 1-7 CR round 1-2 (2026-06-12 ~ 2026-06-12)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 1-7 round 1/2 reviewer 与 evaluator 均确认全量 `npm test` 的唯一失败为 `test/fixture-release-gates.test.ts` 中 `speclite-npm-publisher` deterministic fixture hash mismatch，差异集中在 `_speclite/_config/skill-index.json`、`.agents/.claude` 下 `speclite-npm-publisher` 的 `CHANGELOG.md`、`references/speclite-npm-publisher-workflow.md`、`SKILL.md` hash 以及 `canonicalPackageHash`。该问题真实存在并影响全量测试红绿状态，但当前 Story 1-7 diff 未修改 `speclite-npm-publisher` asset package、fresh-install expected fixture 或 release gate test，因此不应混入 Story 1-7 fixer 范围。
- **涉及文件**: `test/fixture-release-gates.test.ts`, `assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher`, `test/fixtures/fresh-install-empty-project`, `_speclite/_config/skill-index.json`
- **建议时机**: 下次触及 `speclite-npm-publisher` canonical skill package、fresh-install expected fixture 或 release gate fixture hash 维护时处理；需由具备 release gate / fixture 维护上下文的专项步骤同步 canonical package hash 与 expected fixture。
- **状态**: open
- **解决记录**:

### TODO-010: Runner 缺失 `_speclite/config.toml` 时返回 actionable block

- **来源**: 7-1 CR round 1-2 (2026-06-15 ~ 2026-06-15)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 7-1 Round 1 Finding #2 指出 installed runner 在缺失 `_speclite/config.toml` 的 damaged/partial install 场景下会抛出 `ENOENT` stack trace 并以 `exitCode=1` 结束，而不是返回 platform 支持的 `decision=block` 与可执行修复建议。Round 2 evaluator 确认 `src/hooks/flow-gate-enforcement.ts:101-111` 和 `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs:64-66` 仍直接读取 config，`test/flow-gate-hook-runner.test.ts:145-160` 的 helper 总是预先创建 `_speclite/config.toml`，因此缺失 config 的韧性路径没有回归覆盖；该问题真实存在但属于 damaged/partial install resilience，不阻塞 Story 7-1 主路径交付。
- **涉及文件**: `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs`, `src/hooks/flow-gate-enforcement.ts`, `test/flow-gate-hook-runner.test.ts`
- **建议时机**: Epic 7 内下次触及 flow gate hook runner、installed hook damaged-state handling 或 runner regression tests 时处理；捕获 missing/unreadable/invalid `_speclite/config.toml`，返回 actionable block 决策并补充直接执行 installed `runner.mjs` 的回归测试。
- **状态**: open
- **解决记录**:

### TODO-011: `sync` / `uninstall` 失败 human output 展示 `Step State`

- **来源**: 7-2 CR round 1-2 (2026-06-15 ~ 2026-06-15)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 7-2 Round 1 Finding #2 指出 `sync` / `uninstall` human output 在失败时未展示 `Step State`，Round 2 evaluator 确认该项有效但非阻塞。当前数据层已携带 `completedSteps`、`failedStep`、`pendingSteps` lifecycle fields，但 `src/diagnostics/output.ts` 中 `renderSyncHumanOutput` 与 `renderUninstallHumanOutput` 仍未输出与 update renderer 等价的 `Step State` block，导致非 JSON 用户看不到完整失败步骤状态；应补齐 renderer 行为并增加 human output focused tests。
- **涉及文件**: `src/diagnostics/output.ts`, `test/sync-command.test.ts`, `test/uninstall-command.test.ts`
- **建议时机**: Epic 7 内下次触及 `sync` / `uninstall` human output renderer、失败诊断展示或相关 human output regression tests 时处理；为失败场景输出 `Completed steps`、`Failed step`、`Pending steps`，并覆盖 `sync` safe-write failure 与 `uninstall` remove failure。
- **状态**: open
- **解决记录**:

### TODO-012: 收口 `workflow-artifact-layout.md` generic route strings

- **来源**: 11-2 CR round 3 (2026-09-03)
- **优先级**: P2
- **类别**: other
- **描述**: Story 11.2 Round 3 reviewer/evaluator 均确认 `docs/reference/workflow-artifact-layout.md:133-146`、`:189`、`:223` 仍含 generic producer / updater route strings，属于 Story 11.4+ future-story 范围，不阻塞 Story 11.2 fresh-install projection。CR05 去重核验显示当前 backlog 无 `workflow-artifact-layout.md`、generic workflow routing、`planning-artifacts/research`、`speclite-workflow-status.yaml` 或相关 producer route 条目；Story 11.4、11.5、11.6、11.7、11.8、11.9 分别覆盖 Analysis、PRD/Epics/Architecture、UX、PRD validation、Implementation Readiness 与 CR routing，但尚无单一 owner Story/AC 充分覆盖该表中全部残留 generic rows（包括 brainstorming、project-context、brownfield planning handoff、correct-course proposal、updater-only workflow status 与 current-differences 说明）。需要保留一条跨 Story backlog，避免后续分段实施时遗漏残留 docs / canonical Skill alignment。
- **涉及文件**: `docs/reference/workflow-artifact-layout.md`, `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md`, `_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md`, `_bmad-output/implementation-artifacts/stories/11-6-consolidate-ux-artifacts-under-the-planning-ux-space.md`, `_bmad-output/implementation-artifacts/stories/11-7-standardize-the-prd-validation-report-filename.md`, `_bmad-output/implementation-artifacts/stories/11-8-rename-and-relocate-implementation-readiness-skills.md`, `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md`
- **建议时机**: Epic 11 Story 11.4-11.9 执行或收口时逐项分类并更新；若发现 brainstorming、project-context、brownfield handoff、correct-course proposal 或 updater-only workflow status 不属于任一已授权 Story 的 acceptance criteria，应创建后续受控 Story/owner decision 后再关闭本 TODO。
- **状态**: open
- **解决记录**:

### TODO-013: 决策 protected namespace artifact root 是否由 resolver 拒绝

- **来源**: 11-3 CR round 1-3 (2026-09-03 ~ 2026-09-03)
- **优先级**: P2
- **类别**: other
- **描述**: Story 11.3 Round 1/2/3 reviewer/evaluator 与 CR04 均确认当前实现只修复 ownership precedence：`_speclite`、`.claude`、`.agents` 等 installer/control namespace 与 configured artifact roots overlap 时，installer-owned namespace 优先于 workflow-owned root。Config resolver 层是否应直接拒绝这些 namespace 作为 artifact root 仍没有 `SPEC 09` owner contract 或 `SPEC 07`/resolver-local stable diagnostic；Round 3 evaluator 还独立确认 `implementation_artifacts = "_speclite"` 当前仍可解析为 `ok=true`、`issues=[]`、`resolutionMode="explicit-config"`。该项是 Owner future 决策，不是 Story 11.3 当前缺陷、已批准需求或已实现承诺。
- **涉及文件**: `src/config/artifact-root-resolver.ts`, `src/config/config-schema.ts`, `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`, `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`, `test/artifact-root-resolution.test.ts`, `test/existing-install-compatibility.test.ts`
- **建议时机**: Epic 11 artifact root owner contract 收口或新增 protected namespace policy Story 前处理；先由 Owner 决定 `_speclite`、`.claude`、`.agents` 等 namespace 是否属于 invalid artifact root，再定义 stable issue owner/id/details 与 focused regressions。
- **状态**: open
- **解决记录**:

### TODO-014: 决策 single-file `story_location` 与 metadata-only legacy Story 是否支持

- **来源**: 11-3 CR round 2-3 (2026-09-03 ~ 2026-09-03)
- **优先级**: P2
- **类别**: other
- **描述**: Story 11.3 Round 2/3 reviewer/evaluator 与 CR04 均确认 `SPEC 09` 当前将 `story_location` 定义为 Story 文件所在目录，合法 Story artifact 为 `{story_root}/{story_key}.md`；当前 implementation 因此只消费目录下 direct child story-key `.md`，并排除 README、notes、metadata sidecar、hidden/temp、recursive child 以及 single-file `story_location`。若要兼容 single-file `story_location` 或 metadata-only `legacy.md`，必须先更新 `SPEC 09` / consumer discovery owner contract。该项是 Owner future 决策，不是 Story 11.3 当前缺陷、已批准需求或已实现承诺。
- **涉及文件**: `src/validation/validate-project.ts`, `src/validation/artifact-paths.ts`, `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml`, `test/existing-install-compatibility.test.ts`
- **建议时机**: Epic 11 legacy Story compatibility 收口或 Owner 明确需要扩展 legacy input shape 时处理；先决定 single-file / metadata-only 是否进入 contract，再同步 discovery、diagnostic 与 regression tests。
- **状态**: open
- **解决记录**:

### TODO-015: 补齐 Story 11.4 broad scan `575` 可复现证据

- **来源**: 11-4 CR round 2-7 (2026-09-03 ~ 2026-09-04)
- **优先级**: P2
- **类别**: other
- **描述**: Story 11.4 Round 2 reviewer/evaluator 确认 `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md:59-64` 与 `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:157-166` 声称 broad repo scan found `575` legacy-pattern hits，但未记录原始 command、regex、include/exclude glob 或 per-bucket input source。Round 2 summary 记录不同 regex 得到 `126`、`154`、`599`、`605`，aggregator 复跑得到 `123` 与 `154`，因此 exact `575` 不可独立复现；Round 7 evaluator 仍将该项维持为 P2 / CR TODO / evidence hygiene defer，且不阻塞 `EVALUATION_PASS`。
- **涉及文件**: `_bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md`, `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md`, `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-summary-20260903-round-2.md`, `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260903-round-2.md`, `_bmad-output/implementation-artifacts/code-reviews/11-4-code-review/11-4-code-review-evaluation-20260904-round-7.md`
- **建议时机**: Epic 11 evidence governance 收口、future completion gate rerun 或下次触及 Story 11.4 completion evidence 时处理；关闭条件是补充可复现 command、regex、scope、include/exclude glob 与 per-bucket counts，或重新生成一份带同等可复现输入来源的 broad legacy-pattern audit，并明确旧 `575` 是否仍被采用、替换或作废。
- **状态**: open
- **解决记录**:

### TODO-016: 定义 missing-index `.md` symlink candidate 语义

- **来源**: 11-5 CR round 7 (2026-09-04)
- **优先级**: P2
- **类别**: other
- **描述**: Story 11.5 Round 7 reviewer/evaluator 确认 `src/config/artifact-document-discovery.ts:776-809` 的 missing-index candidate scan 只收集 `Dirent.isFile()` 的 lexical `.md` entry，因此会忽略 `.md` symlink；至少在 subject 内 symlink 指向 subject 内 readable regular file 时，当前行为可能把真实 shard candidate 从 `artifact-path.invalid-sharded-document-shape` / `shards-without-index` 错报为 `artifact-path.subject-document-missing`。Round 8 reviewer/evaluator 复核该行为仍存在并维持 P2 defer：当前 resolver 仍 structured block、`actualConsumedPath=null`、`consumedPaths=[]` 且零 mutation，不构成 Story 11.5 blocker；但 owning contract 尚未唯一规定 in-bound regular、outbound、broken、directory/FIFO 或其它 non-regular target 应按 lexical existence 计为 candidate，还是先按安全 target eligibility 分类，因此不得把该项写成已解决，也不得在缺少 Owner 决策时猜测实现。
- **涉及文件**: `src/config/artifact-document-discovery.ts`, `test/artifact-document-discovery.test.ts`, `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`, `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
- **建议时机**: Epic 11 artifact-document discovery contract 收口或下次触及 missing-index candidate scan 前处理；Owner 须先逐项决定 subject 内 readable regular、outbound、broken、directory/FIFO 与其它 non-regular `.md` symlink 的 candidate semantics、stable diagnostic 与 mismatch precedence。后续 acceptance 必须证明 index-present 时不扫描 undeclared subtree、missing-index 分支只判断不消费、结果保持 structured block、safe project-relative evidence 与零 mutation；除非 Owner contract 明确要求，不新增 stable issue ID，也不扩展为通用 filesystem 异常治理。
- **状态**: open
- **解决记录**:

### TODO-017: 收口 inactive Architecture duplicate 的 UX wildcard

- **来源**: 11-6 CR round 1-5 (2026-09-04 ~ 2026-09-04)
- **优先级**: P2
- **类别**: duplication
- **描述**: Story 11.6 Round 1 reviewer/evaluator 发现 shipped duplicate `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/steps/step-01-init.md:74` 仍以 `*ux-design*.md` 搜索 UX 输入；Round 2-5 持续复核并维持 P2 defer。当前 active source `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-01-init.md:59,74` 已采用 canonical `{planning_artifacts}/ux/ux-design-specification.md` 优先、exact legacy `{planning_artifacts}/ux-design-specification.md` fallback、canonical wins 与 no-migration contract，因此该项是 inactive duplicate ownership / maintenance drift，不是 Story 11.6 active producer、consumer、installed operation 或验收 blocker。不得把本 TODO 解释为 active source 未实现，也不得在未明确 duplicate ownership 前删除文件或扩大为 Architecture workflow 重构。
- **涉及文件**: `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/steps/step-01-init.md`, `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-01-init.md`
- **建议时机**: 下次触及 `speclite-create-architecture` step source ownership、package duplicate cleanup 或 Architecture input discovery 时处理；先确认 `steps/` duplicate 的保留、生成或删除责任，再仅将 retained source 对齐 active exact UX contract，并验证 package/install projection 不会重新激活 wildcard。
- **状态**: open
- **解决记录**:

---

<!-- 已解决事项归档于此，保留用于回顾 -->

### TODO-003: 默认 `npm test` 5s timeout 慢测治理

- **来源**: 4-3 CR round 1-4 (2026-05-31 ~ 2026-05-31)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 4-3 Round 1 reviewer/evaluator 记录默认 `npm test` 的 Vitest 5s timeout 下存在慢测超时风险；同轮记录显示使用 `--testTimeout=15000` 可区分为测试运行时限/慢测治理问题。Round 4 evaluator 确认本轮 `npm test` 未复现失败，但该项仍应作为非阻塞 CR TODO / defer 追踪，避免后续全量测试在默认门槛下偶发超时。
- **涉及文件**: `package.json`, `vitest.config.ts`, `test/update-command.test.ts`, `test/update-planning.test.ts`
- **建议时机**: 已在 Story 6.8 处理。
- **解决日期**: 2026-06-02
- **关闭 Story**: Story 6.8
- **状态**: resolved
- **解决记录**: Story 6.8 复核 `package.json` 的默认 `test` script 与 `vitest.config.ts`，直接运行默认 `npm test`，当前 suite 在默认命令下稳定通过：38 files / 288 tests passed，Duration 10.13s，未复现 Story 4.3 曾记录的 5s timeout failure。最终 release confidence verification 继续要求默认 `npm test` 与 release verification command 同轮通过；若未来新增慢测重新触发 timeout，应作为新的 CR TODO 记录。

### TODO-007: 固化 `release:packaging-check` 的 build 前置顺序

- **来源**: 6-5 CR round 1 (2026-06-02)
- **优先级**: P2
- **类别**: tech-debt
- **描述**: `package.json:19-23` 当前只定义独立的 `build` 与 `release:packaging-check` script，没有提供串行 release gate 入口，也没有让 packaging check 自身确认或触发 build。`scripts/release/packaging-check.mjs:7-18` 直接执行 `npm pack --dry-run --json`，随后在 `scripts/release/packaging-check.mjs:38-47` 断言 `dist/bin/speclite.js` 与 `dist/bin/speclite.d.ts` 已进入 package inventory，因此该 gate 实际依赖 build 已完成。Story 6.5 dev log 已记录 build 与 packaging check 并行时会因 `tsup` 清理 `dist` 出现 transient failure，顺序重跑才通过；当前不阻塞 Story 6.5，但 release gate 顺序应固化。
- **涉及文件**: `package.json`, `scripts/release/packaging-check.mjs`, `test/release-packaging-check.test.ts`
- **建议时机**: 已在 Story 6.7 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.7 新增 `release:verify`，串行执行 `npm run build && npm run release:packaging-check`；`scripts/release/packaging-check.mjs` 现在在执行 `npm pack --dry-run --json` 前检查 `dist/bin/speclite.js`、`dist/bin/speclite.d.ts`、必要 runtime assets 和 source-vs-dist mtime，缺失或陈旧时输出稳定 prerequisite diagnostic。验证：`npm test -- test/release-packaging-check.test.ts test/story-6-4-path-portability.test.ts test/skill-artifact-loop.test.ts`、`npm run build`、`npm run release:packaging-check`、`npm run release:verify`、`npm test` 均通过。

### TODO-008: 补强 packaged documentation example 空集合断言

- **来源**: 6-5 CR round 1 (2026-06-02)
- **优先级**: P2
- **类别**: test-gap
- **描述**: `scripts/release/packaging-check.mjs:25-31` 从 package inventory 筛选 `assets/source/speclite/docs/examples/*.md` 并生成 `packagedDocumentationExamples`，但 `scripts/release/packaging-check.mjs:67-70` 只使用 `packagedDocumentationExamples.every(...)` 做分类断言，空数组也会通过。当前 `test/skill-artifact-loop.test.ts:378-401` 已通过 fixture case 与 expected classification 覆盖 Story 6.5 docs example 行为，因此不阻塞本 Story；但 standalone `npm run release:packaging-check` 的 packaged docs examples 分类证明强度仍需补强。
- **涉及文件**: `scripts/release/packaging-check.mjs`, `test/release-packaging-check.test.ts`, `dist/packaging-manifest.json`, `assets/source/speclite/docs/examples/fixture-derived-examples.md`
- **建议时机**: 已在 Story 6.7 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.7 将 `packaged-documentation-examples-classified` 改为非空、允许路径、package inventory presence、classification 和 `isReleaseGateFixture: false` 的组合断言；新增 negative tests 覆盖 empty list、missing path、wrong classification 和误把 `test/fixtures/` 当 docs example。`dist/packaging-manifest.json` 记录 `assets/source/speclite/docs/examples/fixture-derived-examples.md` 为唯一 packaged documentation example 且 assertion passed。验证：focused packaging tests、`npm run release:packaging-check`、`npm run release:verify` 和默认 `npm test` 均通过。

### TODO-001: 收口 `resolve-parity` fixture input cases

- **来源**: 2-4 CR round 1-3 (2026-05-27 ~ 2026-05-27)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 6.3 已将 `resolve-parity` 的 expected stdout JSON 与 stderr JSON Lines 外置到 `test/fixtures/resolve-parity/expected/`，并覆盖 config/customization merge、missing/repeated key、optional/required failure、array semantics 和 non-ASCII parity surfaces。剩余缺口是 fixture input/project tree 仍未完整外置：`test/fixtures/resolve-parity/input/config/` 与 `input/customization/` 目前只有 `.gitkeep`，真实 config/customization layer 仍主要由 `test/resolve-cli.test.ts` 的 `createResolveParityFixture()` helper 在测试内生成。release-gate fixture 因此已可审阅 expected results，但 input cases 仍不可独立复用或跨工具校验。
- **涉及文件**: `test/fixtures/resolve-parity/README.md`, `test/fixtures/resolve-parity/input/config/`, `test/fixtures/resolve-parity/input/config-broken-optional/`, `test/fixtures/resolve-parity/input/customization/`, `test/resolve-cli.test.ts`
- **建议时机**: 已在 Story 6.6 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.6 已将 config merge parity、broken optional config layer 和 customization merge parity 的真实 input layers 外置到 `test/fixtures/resolve-parity/input/`，并让 `test/resolve-cli.test.ts` 的 `createResolveParityFixture()` 从 fixture input assets 复制临时项目树。验证：`npx vitest run test/resolve-cli.test.ts test/fixture-contract.test.ts test/artifact-metadata.test.ts test/story-6-4-path-portability.test.ts` 通过。

### TODO-002: 对齐 `generatedAt` validator 与 ISO 8601 contract

- **来源**: 2-5 CR round 1-3 (2026-05-27 ~ 2026-05-27)
- **优先级**: P2
- **类别**: other
- **描述**: `src/manifest/manifest-schema.ts:69-75` 当前通过 `new Date(parsed).toISOString() === value` 校验 `generatedAt`，只接受 `Date.toISOString()` canonical UTC millisecond form。Story 2.5 AC5 与 owning SPEC 表述为 parseable ISO 8601 string，因此 `2026-05-27T14:00:00+08:00` 这类可解析 offset timestamp 会被拒绝。当前 workflow helper 使用 canonical `Date.toISOString()`，不阻塞 Story 2.5 CR 通过，但后续需要明确 contract 是 canonical UTC millisecond form 还是更宽的 parseable ISO 8601。
- **涉及文件**: `src/manifest/manifest-schema.ts`, `test/artifact-metadata.test.ts`, `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`, `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- **建议时机**: 已在 Story 6.6 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.6 保留 canonical UTC millisecond form，并同步 manifest schema 错误信息、artifact metadata regression test、Manifest SPEC 与 Fixture SPEC wording；offset timestamp 继续被拒绝且错误信息明确要求 `Date.toISOString()`。验证：focused Vitest 命令通过。

### TODO-005: 统一 `source-integrity` variant id 与 release gate classification

- **来源**: 6-1 CR round 1-2 (2026-06-02 ~ 2026-06-02)
- **优先级**: P2
- **类别**: tech-debt
- **描述**: `src/fixtures/fixture-contract.ts` 当前允许 `source-integrity/<sub-case>/<variant>` 三段 manifest id，但 release gate registry / `getFixtureGateClassification` 只登记 required sub-case 的两段 id；现有 `test/fixtures/source-integrity/source-unreadable-blocked/*/fixture-case.json` 已使用三段 id。Round 2 evaluator 确认该项有效但非阻塞，后续需要明确三段 variant 是 required gate 的细分 evidence、regression asset，还是 documentation example，并据此统一 schema、registry、classification 与 fixture manifests。
- **涉及文件**: `src/fixtures/fixture-contract.ts`, `test/fixture-contract.test.ts`, `test/fixtures/source-integrity/source-unreadable-blocked/local-tarball-unreadable/fixture-case.json`, `test/fixtures/source-integrity/source-unreadable-blocked/offline-bundle-unreadable/fixture-case.json`, `test/fixtures/source-integrity/source-unreadable-blocked/registry-auth-required/fixture-case.json`
- **建议时机**: 已在 Story 6.6 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.6 将 `source-integrity/<required-sub-case>/<variant>` 明确归为 required fixture group sub-case 的细分 evidence，只要 required sub-case 已注册且 variant 为 lower-kebab，就返回 `fixture-group-sub-case`；新增测试覆盖 `source-integrity/source-unreadable-blocked/local-tarball-unreadable` 不再为 `undefined`。验证：focused Vitest 命令通过。

### TODO-006: 补强动态 CLI smoke gate 的 path escape reason 断言

- **来源**: 6-4 CR round 4 (2026-06-02)
- **优先级**: P2
- **类别**: test-gap
- **描述**: `test/story-6-4-path-portability.test.ts:117-123` 的动态 CLI gate 只断言真实 `speclite validate --json` 输出包含 `artifact-path.escapes-project`、`file-integrity.case-conflict` 与 `file-integrity.unsafe-overwrite-risk`，未进一步断言 `artifact-path.escapes-project.details.reason`。`test/story-6-4-path-portability.test.ts:436-443` 的动态故障注入更接近 configured artifact root 外部路径；Story 6.4 Round 4 evaluator 已确认 expected snapshot gate 对 `details.reason: "path-escapes-project"` 的阻塞覆盖已闭环，但该动态 smoke gate 仍可补强，避免未来 issue id 保持不变而 reason 退化时漏报。
- **涉及文件**: `src/validation/rules/artifact-path.ts`, `test/story-6-4-path-portability.test.ts`
- **建议时机**: 已在 Story 6.6 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.6 的 dynamic CLI gate 现在创建实际 workflow artifact path fault，并断言真实 `speclite validate --json` 输出中的 `artifact-path.escapes-project` 同时包含 `affectedPath: artifact:actualArtifactPath`、`details.pathRole: actualArtifactPath` 和 `details.reason: path-escapes-project`；artifact path validator 对 actual artifact path 的 escape reason 已同步。验证：focused Vitest 命令通过。

### TODO-004: confirmed Git install human output confirmation state 对齐

- **来源**: 5-4 CR round 1-2 (2026-06-01 ~ 2026-06-01)
- **优先级**: P2
- **类别**: other
- **描述**: `src/diagnostics/output.ts:498-514` 的 install external access human output 仍从 `sourceDescriptor` 反推展示并硬编码 `confirmationState=pending`；confirmed Git install 成功解析后，human audit 仍显示 pending。`src/commands/install.ts:223-274` 与 `src/commands/install.ts:415-459` 的 runtime confirmation gate 已保证未确认路径不访问 Git client、confirmed 后才进入 Git resolver，因此该问题不影响 remote access gate 或 Git evidence 写入门禁，但会误导 external access confirmation 的人工审计展示。后续修复应把 `SourceResolutionPlan.externalAccesses` 或等价 display-safe confirmation state 投影到 install result 可渲染数据，并补充 confirmed success / unconfirmed stop human output regression。
- **涉及文件**: `src/diagnostics/output.ts`, `src/diagnostics/command-result-schema.ts`, `src/commands/install.ts`, `test/git-source-resolution.test.ts`
- **建议时机**: Story 5.5 source descriptor trust status / redacted reporting 收口时，或下次触及 install human output / external access confirmation 投影时处理；先确认 public result data shape，再同步 JSON schema、human renderer 和 regression tests。
- **解决日期**: 2026-06-02
- **关闭 Story**: Story 5.5；Story 6.8 补充 confirmed regression assertion。
- **状态**: resolved
- **解决记录**: Story 5.5 已修复；resolved Git install human output 的 `confirmationState` 基于 resolved evidence/version/contentHash 显示 `confirmed`，未确认 Git access gate 仍保持 `pending`。Story 6.8 在 `test/git-source-resolution.test.ts` 的 confirmed Git install path 中新增 `confirmationState=confirmed` 断言，并保留 unconfirmed path 的 `confirmationState=pending` 断言；focused verification：`npx vitest run test/git-source-resolution.test.ts` 通过，14 tests passed。

---

## 条目模板（不要删除）

<!--
### TODO-{NNN}: {简短标题}

- **来源**: {story-id} CR round {N} ({YYYY-MM-DD})
- **优先级**: P1 / P2 / P3
- **类别**: refactor / duplication / tech-debt / naming / test-gap / other
- **描述**: {具体问题描述}
- **涉及文件**: `{file-path}` (可多个)
- **建议时机**: {例如 "下次触及 init.ts 时" / "epic-3 开始前" / "专项重构"}
- **状态**: open / in-progress / resolved
- **解决记录**: {解决时填写：在哪个 story 中解决，PR/commit 引用}
-->
