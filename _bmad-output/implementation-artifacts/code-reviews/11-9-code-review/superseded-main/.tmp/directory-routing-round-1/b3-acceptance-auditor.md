- Actor: Fresh Acceptance Auditor
- Model: gpt-5.6-sol
- Reasoning Effort: high
- Status: COMPLETED / FINDINGS_REPORTED
- Finding Count: 2 blocking，0 verify-required

# Acceptance Coverage（验收覆盖）

| AC | 结果 | Coverage Evidence |
|---|---|---|
| AC1 | PASS | `resolveCrDirectory` 新 run 固定 numeric root；`test/cr-directory-resolution.test.ts:119-143` 覆盖 zero-mutation canonical |
| AC2 | PASS | `resolver:7,26-31` 仅无前导零 `N.N` / `N-N` 且 `11.9` 归一 `11-9`；`test:110-117` |
| AC3 | PASS | resolver 无 title/name/slug/filename 参数；`test:111-116` 拒非法文本/traversal；只读 scan 无 active title-bearing expression |
| AC4 | PASS | `runner-workflow:17` 唯一 resolve；`:19,73,77,99,105-108` 传 frozen context；leaf 禁重解析 |
| AC5 | PASS | `cr-contract:87,103-117` 全产物同 `crDir`；shared backlog 为批准的 cross-Story tracker |
| AC6 | PASS | `runner-workflow:42-52` 固定 goal records 三文件 |
| AC7 | FAIL | resolver/orchestrator/CR01–06/help/manifest/tests 主要 docs 已同步，但 CR01/public lifecycle 仍清理 `.tmp`，见 AA02 |
| AC8 | PASS | resolver 只读；`test:167-208` 选择前后目录无迁移/重命名/删除 |
| AC9 | FAIL | 常规 legacy summary/dual 覆盖；仅 `.tmp` / goal records 的 pre-summary 中断态误判新 run，见 AA01 |
| AC10 | PASS | `test:402-436` active consumer negative scan + ledger；补 scan 无未分类 active pattern |
| AC11 | FAIL | numeric/常规 legacy/dual/physical/context/goal/install 覆盖，未覆盖 AA01 |
| AC12 | PASS | `cr-contract:63,75` 目录职责及 runner 审批顺序保持 |

# Findings（发现）

## AA-01 — Legacy pre-summary 中断态会被拆到 canonical sibling

- Category: `lifecycle`
- Blocking: `true`
- Disposition: `new`
- Invariant: 唯一 legacy-only unfinished run 必须原目录恢复，不得因尚无顶层 review artifact 创建 canonical sibling。
- Concrete Failure Scenario: 仅存在 `state/code-reviews/11-9-old-title-code-review/.tmp/directory-routing-round-1/review-input.diff` 和/或 `goal-execute-records/PLAN.md`，尚无顶层 current-family Markdown。`inspectDirectoryCandidate` 跳过两个 reserved directory，得到 `currentCount=0` 和 `NO_CURRENT_SERIES_EVIDENCE`；随后选 canonical `state/code-reviews/11-9-code-review`，下一次写入拆同一未完成 run。
- AC: AC9，并影响 AC11。
- Primary Location: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:296`
- First-hand Evidence: `resolver:353-359` 仅以顶层 recognized artifact 数判 CURRENT，`:127-132` 无 CURRENT 则 canonical。`legacy test writeCurrent` 预写 summary，`test:35-47,145-165` 无 pre-summary case。
- Suggested Bucket: `patch`

## AA-02 — Active workflow 仍授权清理旧 .tmp

- Category: `lifecycle-policy`
- Blocking: `true`
- Disposition: `new`
- Invariant: directory-routing replacement 不得清理既有 `.tmp` evidence。
- Concrete Failure Scenario: review 完成后 CR01 Step 7 清理当前 round 临时目录，public docs 同样可清理；round 随即变历史，其 diff/layer/scope/history inputs 被删除，违反本轮禁止清理旧 `.tmp` 边界。
- AC: Approved Replacement Boundary 第 4 项；AC7。
- Primary Location: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/references/reviewer-workflow.md:56`
- First-hand Evidence: `spec-content.md:28` 禁清理旧 `.tmp`；`reviewer-workflow:62` 要求清理当前 round；`docs/reference/workflow-artifact-layout.md:193,234` 清理 review/cache。
- Suggested Bucket: `patch`

# Evidence Freshness（证据时效）

Fresh development gate `PASS`，`generatedAt=2026-09-09T08:33:22Z`，raw SHA-256=`e7f93a5531ebfaffe7e483361eca67dd45a4b7e56a8b645d8532dded6935cd1f`；`25 pass / 4 todo` 与 full `695 pass / 13 fail / 4 todo` 仅为 historical evidence；本层只读读取/scan，没有 build/full/packaging 或文件修改。

> Actor id: `/root/story119_r1_auditor`；fresh dispatch metadata: `gpt-5.6-sol / high / fork none`。
