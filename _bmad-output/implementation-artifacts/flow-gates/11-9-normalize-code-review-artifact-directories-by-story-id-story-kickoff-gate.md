---
schemaVersion: "speclite.flow-gate-report.v2"
mode: "story-kickoff"
target: "11-9-normalize-code-review-artifact-directories-by-story-id"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
result: "PASS"
generatedAt: "2026-09-11T08:30:00.000Z"
handoffContractVersion: "speclite.story-kickoff-handoff.v1"
foundationPrerequisiteStatus: "PASS"
foundationPrerequisiteRefs: "Story 11.1-11.8 sprint statuses=done; exact target-matched story-completion gates: 11.1-11.4 PASS, 11.5-11.8 PASS_EQUIVALENT; restart baseline commit 523ab4e (reverted to ff7528d surface)"
closureOwnerCheckStatus: "PASS"
closureOwnerRefs: "Epic 11 Story 11.9; PRD FR23g; shared speclite-code-review-contract owns cr-directory.ambiguous-resume-root; executable resolver relocated to src/config/cr-directory.ts + speclite resolve cr-directory (Correct Course decision B, 2026-09-11); Story 11.10 remains separate read-only inventory owner"
sourceSkill: "speclite-flow-gate"
---

# Flow Gate Report: 11-9-normalize-code-review-artifact-directories-by-story-id

## Summary（摘要）

- Mode: `story-kickoff`
- Target: `11-9-normalize-code-review-artifact-directories-by-story-id`
- Date: `2026-09-11 16:30 CST`
- Result: `PASS`
- Model Used: `Claude Opus 5`
- Restart context：本报告取代 2026-09-05 的 kickoff gate。Story 11.9 1.0 / 1.1 实现已按 Correct Course 裁决（决策 A/B/C）回退到 `ff7528d` 表面（commit `523ab4e`），旧 CR 产物归档于 `code-reviews/11-9-code-review/superseded-main/`，`reviewSeries` 自本轮起为 `restart`。2026-09-05 gate 中已关闭的 owner 决策（legacy-only 原位 resume、CR-local diagnostic owner、stable issue 定义）继续有效，不重开。

## Contract Anchors（契约锚点）

- PASS：`sprint-status.yaml` 中 Story 11.1–11.8 均为 `done`；八份 exact target-matched completion gate 为 v2 且结果允许继续（11.1–11.4 `PASS`，11.5–11.8 `PASS_EQUIVALENT`）；Story 11.9 是 strict-serial 中唯一可推进的 Story。
- PASS：`cr-contract.md@ff7528d:56` 已固定 CR 目录为 `{implementation_artifacts}/code-reviews/{storyId}-code-review/`；`:54` 固定 `reviewSeries` 取值正则；`:66-74` 固定 v2 basename `{storyId}-code-review-summary-{YYYYMMDD}-{reviewSeries}-round-{round}.md` 与 `{storyId}-cr-finalizer-{YYYYMMDD}-{reviewSeries}-round-{round}.md`；`:76` 规定不含 `reviewSeries` 的 legacy 文件只作历史证据。这三条契约是 restart 设计「只看文件名判定未完成 run」的依据。
- PASS：`storyId` 只接受 `N.N` / `N-N` 并统一为 `N-N`（正则 `^[1-9]\d*[.-][1-9]\d*$`），title / slug / 中文 / 空格 / 标点 / traversal 文本不得参与或作为 fallback（AC 2–3）。
- PASS：legacy-only unfinished run 唯一 write target 为该 legacy 目录原位续写，`compatibilityMode=legacy-resume`；不迁移、不重命名、不复制、不删除（AC 8–9，沿用 2026-09-05 裁决）。
- PASS：dual-directory / multi-legacy ambiguity 由 shared `speclite-code-review-contract` 拥有，`SPEC 07` 不新增 issue。stable diagnostic 固定为 `id=cr-directory.ambiguous-resume-root`、`category=lifecycle`、`severity=error`、`continuation=block`；details 只允许 `storyId`、project-relative POSIX `canonicalCrDir`、byte-wise 排序去重的 `legacyCrDirs`、`reviewSeries`、`roundEvidence`、`reason`；禁止 absolute/home/temp path、raw artifact content、stack、随机值。诊断必须发生在任何 round artifact、goal record、temporary file 或 tracker mutation 之前。
- PASS：Story 新增 `Threat Model & Non-Goals` 章节（决策 A）：resolver 面向协作式本地文件系统；hard link、CRLF、TOCTOU、伪造 frontmatter、产物真伪认证、审批重放、tracker 认证、freshness 比较明示 out of scope；CR 对此类 finding 按契约归 `dismiss`。AC9 措辞已改为「按 v2 文件名判定未完成 run，不读取产物内容」。
- PASS：AC12 exclusion 不变：不修改 report basename、CR algorithm、round numbering、approval rules。

## Functional Anchors（功能锚点）

- PASS：restart 实现位置（决策 B）与 Story 11.1 / 11.5 同构：`src/config/artifact-root-resolver.ts:197` `resolveArtifactRootsFromProjectConfig` 提供 `implementationArtifacts`；`src/fs/path-normalizer.ts:81` `resolveProjectRelativePath` 与 `:107` `findProjectBoundarySymlinkEscape` 提供路径与 symlink 越界检测；`src/commands/resolve.ts:135` `artifact-roots` 与 `:198` `artifact-documents` 提供子命令挂载与 issue 渲染范例。Story 11.9 在 `src/config/cr-directory.ts` 新增 `normalizeCrStoryId` / `resolveCrDirectory`，并挂载 `speclite resolve cr-directory` 子命令；canonical Skill 包不再投影 `.mjs`。
- PASS：回退后 9 个 canonical CR 包与 `ff7528d` 逐字节一致（`git diff --stat ff7528d -- <9 packages>` 为空）；`resolve-cr-directory.mjs`、`test/cr-directory-resolution.test.ts`、`test/fixtures/code-review-contract/` 已删除；无 ownership marker、per-write validator、frontmatter parser 残留。runner 当前只在 prose 层声明 Story-ID-only（`runner-workflow.md@ff7528d:16`），executable 派生点由本 Story 补齐。
- PASS：恢复矩阵唯一且仅依赖直接子文件名：canonical-only 或无既有 run → canonical；恰一个 legacy 含 series S 的未完成 run（存在 S 的 v2 summary 且不存在 S 的 v2 finalizer）且 canonical 无 S 未完成 run → 原位 resume 该 legacy；canonical 与 ≥1 legacy 同时含 S 未完成 run，或 ≥2 legacy 含 → stable diagnostic + stop-before-write；completed legacy 只进 `legacyArtifactPaths`。归档子目录（如 `superseded-main/`）不参与判定。
- PASS：CR01–06 在 runner mode 消费 runner Step 0 一次解析并传入的 `crDir` / `canonicalCrDir` / `compatibilityMode` / `legacyArtifactPaths`，禁止重推导；manual mode 调用同一 CLI 一次。

## Evidence Anchors（证据锚点）

- PASS：Story 要求 TDD RED→GREEN，focused tests 将由 `test/cr-directory.test.ts` 覆盖：归一化矩阵（`11.9` / `11-9` / `11-9-title` / 中文 / `../11.9` / `11/9` / `01.9` / 空）、canonical 新 run、legacy-resume、ambiguity 阻断 + 目录零 mutation + 输出不含 `projectRoot`、symlink 越界、CLI JSON 形状、全量 corpus 负向扫描（占位符形态与具体形态两种 regex，allowlist 只登记路径）、fresh-install parity（安装后 runner/CR 包含 `speclite resolve cr-directory` 引用）。
- PASS：restart 前基线 `npx vitest run` 为 722 passed / 4 todo；验收目标 0 failed，`npm run docs:check` 与 `npm run release:check` 通过。`npx tsc --noEmit` 的 138 个既有类型错误横跨非 Epic 11 文件，不在任何门禁内，本 Story 不处理。
- PASS：仓库 69 个 CR 目录全部为 `N-M-code-review`，非规范目录数 = 0；全历史无 title-bearing CR 目录。负向扫描的价值在于防回归而非修复现存问题。
- PASS：report basenames、CR algorithm、round numbering、approval rules、Story 11.10、external drawer、workspace mirrors、fixed-count baseline 与 21 个非 Epic 11 未提交文件（skill-creator / skill-lint / grill / domain-modeling / grilling）均列为明确 exclusion。

## Guidance Equivalence（指引等价性）

- Story 1.0 / 1.1 的 Dev Notes 曾指向「shared package 内 executable resolver」；2026-09-11 决策 B 将其改为 `src/` + CLI。owning contract 只要求「唯一派生点 + 单次解析 + 显式传递」，不要求实现位置，故本次变更属 Guidance Anchor 调整而非 contract 变更；Story Dev Notes 已同步为决策 B，无残留歧义。
- Shared CR contract 当前没有 `cr-config.md`；不得把它当既有 UPDATE file。
- 2026-09-05 completion gate（`PASS_EQUIVALENT`）对应已回退的 1.0 / 1.1 实现，保留为历史文件；本 Story 完成时必须重新生成 completion gate。

## Foundation Handoff（地基交接）

- 项目未提供独立 foundation-handoff source index；Story 11.9 的显式 predecessor handoff 为 Story 11.1–11.8 completion gates，已核验 exact target、mode 与 allowing result，故 `foundationPrerequisiteStatus=PASS`。
- Epic 11 明确把 CR directory normalization、single propagation 与 legacy ambiguity closure 归属 Story 11.9；Story 11.10 只拥有后续 broad grill read-only inventory，故 `closureOwnerCheckStatus=PASS`。

## Missing Or Ambiguous Items（缺失或歧义项）

- 无 kickoff blocker，无 Owner decision。决策 A / B / C 已由项目负责人于 2026-09-11 裁决，新 session 不得重开。
- TODO-018~022 已标 `superseded-by-restart`，所指 `resolve-cr-directory.mjs` 已删除；不作为本轮 CR 输入。
- 工作树包含 21 个非 Epic 11 未提交文件；本 Story 的 commit 不得混入。

## Recommended Next Action（推荐下一步）

Proceed with TDD for Story 11.9 restart (`reviewSeries=restart`)：先写 `test/cr-directory.test.ts` 让其 RED，再实现 `src/config/cr-directory.ts` 与 `speclite resolve cr-directory`；随后同步 `cr-contract.md`（≤15 行 CR Directory Resolution）、runner Step 0 与 CR01–06 消费文案、8 包 CHANGELOG；人工复核混入 11.4 / 11.8 改动的文档行；重新生成 fresh-install fixture 与 packaging manifest；`vitest` / `docs:check` / `release:check` 通过后运行 completion gate，再进入 CR01 → CR02 →（必要时 CR03）→ CR04 → CR05 → CR06，目标 ≤3 轮，边界外 finding 按 Story Threat Model 归 `dismiss`。

---

*本文档由 speclite-flow-gate Skill 自动生成*
