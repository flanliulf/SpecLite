---
schemaVersion: speclite.cr-rules-extraction.v2
artifactType: cr-rules-extraction
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: restart
round: 3
generatedAt: 2026-09-11T18:54:43+08:00
modelUsed: Claude Opus 5 (claude-opus-5)
evaluationSource: 11-9-code-review-evaluation-20260911-restart-round-3.md
evaluationSourceHash: sha256:fc332c898e68d94e773e7be01eef4854e193a86e8f281bd6896d8e49c458af00
eligibleFindingSetHash: sha256:1eb6fb2df38394ee1327c2dbf00ea76613c46c0e429ab0b7181cddf3200d4ece
candidateRuleCount: 5
globalRuleEligibleCount: 2
result: COMPLETED
---

# CR Rules Extraction（CR 规则提炼）

## Binding Verification（绑定验证）

- Story、series、round：11-9 / restart / 3（current evaluation verdict `PASS_WITH_DEFERRED_TODOS`，p1=0）。
- Evaluation source/hash：`11-9-code-review-evaluation-20260911-restart-round-3.md` / `sha256:fc332c898e68d94e773e7be01eef4854e193a86e8f281bd6896d8e49c458af00`。
- Eligible finding set hash：`sha256:1eb6fb2df38394ee1327c2dbf00ea76613c46c0e429ab0b7181cddf3200d4ece`（12 个 fingerprint：7 accepted-then-resolved + 5 deferred；排除 3 dismissed）。
- crDir 由 orchestrator 传入（`speclite resolve cr-directory` → canonical），未重推导；`superseded-main/` 下 main / evidence-v2 / directory-routing series 只作背景，不生成规则。

## Model Timeline（模型时间线）

| 轮次 | 角色 | 模型 | Evidence caveat |
|---:|---|---|---|
| 1 | reviewer（blind / edge / auditor 三层 + aggregator） | Claude Opus 5 (claude-opus-5) | 三层为 fresh sub-agent，aggregator 为 manual orchestrator |
| 1 | evaluator | Claude Opus 5 (claude-opus-5) | 同模型，已记录 independence caveat |
| 1 | fixer（patch，completed） | Claude Opus 5 (claude-opus-5) | fix commit `53195ae`；沙箱外 vitest 726 passed |
| 2 | reviewer 三层 + aggregator | Claude Opus 5 (claude-opus-5) | 同上 |
| 2 | evaluator | Claude Opus 5 (claude-opus-5) | 同模型 |
| 2 | fixer（patch，completed） | Claude Opus 5 (claude-opus-5) | fix commit `bee8e07`；vitest 727 passed |
| 3 | reviewer 三层 + aggregator | Claude Opus 5 (claude-opus-5) | 同上 |
| 3 | evaluator | Claude Opus 5 (claude-opus-5) | 同模型；`PASS_WITH_DEFERRED_TODOS` |

全程单一模型家族，跨模型独立性缺失是本 series 的 evidence caveat；每轮 blocking finding 均有 $TMPDIR 第一手复现与反证记录。

## Eligible Evidence（合格证据）

| 发现指纹 | Disposition | 验证证据 | 跨 Story 复现 |
|---|---|---|---|
| `sha256:348347a12e0eb1bcfcff130e1a50ccdd248f659f31ec1d80e6d988a69fd80579`（R1-F1） | accepted P1 (r1) → resolved (r2) | r2 三层复现 unreadable-candidate 结构化 block | 是：CR-API-15（3-1，missing vs corrupted 区分）同 invariant family |
| `sha256:400bd7faf0613f19bb2072be771d90a3f245a431dbcda73001ebdaaf4da1c0f4`（R1-F2） | accepted P1 (r1) → resolved (r2) | r2 契约 :58 / runner :16 / finalizer :8 一致 | 否 |
| `sha256:ae5e5b2b1c61f8d89b0391fd2d79587af93af75b9cc69dca4f63ce7fd19e4c20`（R1-F3） | accepted P1 (r1) → resolved (r2) | r2 六个调用串 + 矩阵 + Inputs + 断言 | 否（同 Story 内 prose→调用面缺口） |
| `sha256:0a5019c56b0fa37220562fd85361f75184cf0eb499791060c4db62a3c455113d`（R1-F4） | accepted P1 (r1), recurred+accepted (r2) → resolved (r3) | r3 三层实测 H1/H2/S6/S19 定位规则可执行 | 否 |
| `sha256:eaa2fdd5add007eeae09da4bc5e78f1397e33fc000ee577e63c64a0765161486`（R1-F5） | accepted P1 (r1) → resolved (r2) | r2 boundary 先于 readdir，block 时 legacyCrDirs=[] | 是：CR-API-17（3-3，遍历阶段应用边界）/ CR-SEC-02（1-5，mutation 前 guard）同 family |
| `sha256:7e40af3c27209de14a77c440662c701d078814a8d44cbe505aaaa53cca3ba421`（R1-F9） | accepted VERIFY (r1) → resolved (r2) | r2 test:597-602 goal records 断言 | 否 |
| `sha256:b9c63a8bac175253d894d8ec95b9ec26a24c62f36f882707c5eec812ee291b49`（R2-F1） | accepted P1 (r2) → resolved (r3) | r3 五场景 ELOOP / ENOTDIR / EACCES 结构化 block | 是：与 R1-F1 同 family（CR-API-15） |
| `sha256:a5701f031269aa3734bbf19619ad083ae8deb586613cd4f7e3ebd028feccd224`（R1-F6） | deferred T2 (r1–r3) | r1–r3 dangling symlink 复现如旧 | 是：CR-SEC-08（3-4，realpath boundary 而非 symlink 存在性）邻近 family，但 deferred 未接受修复 |
| `sha256:e492716502cf8f7580da8290b53cc8d5431ce6e1d888ead92f20ecb3c4384c05`（R2-F3） | deferred T3 (r2–r3) | r2–r3 symlink 产物 isFile() 忽略 | 否 |
| `sha256:49d05a401da857b874a092cb54ad49ec081218dd4862a176c3c61fbde6b98433`（R3-F1） | deferred T1 (r3) | r3 反斜杠名越界绕过复现，对照组 block | 是：CR-SEC-04（2-5，先严格校验 POSIX-style 再 normalization）同 invariant family |
| `sha256:bf3b4158f4e91bc04f8b3958d5ae7478f835f0ed17a5cfcbb5514dd1a53611e0`（R3-F2） | deferred T3 (r3) | r3 文本顺序推导 | 否 |
| `sha256:a8b153e483cb11369daebae96c3ae7c4b4601dfd3ed2d7988159e6222e86a4b2`（R3-F3） | deferred T3 (r3) | r3 S18 复现 resolver 输出 | 否 |

统计：AC 相关 4（R1-F3 AC4、R1-F4 AC9、R1-F9 AC11、R1-F2 AC9）；fail-close / path-safety 5（R1-F1、R1-F5、R2-F1、R1-F6、R3-F1）；契约一致性 / 流程文案 3（R1-F2、R3-F2、R3-F3）；语义分叉 1（R2-F3）。source layer：blind 7、edge 8、auditor 5（多层重叠 4）。修复未引入回归：round 2 新 finding R2-F1 是 round 1 修复未覆盖的第二调用面（同 invariant），round 3 新 finding R3-F1 是第三种根因；均非 churn（evaluator r3 `churnDetected=false`）。

## Excluded Evidence（排除证据）

| 来源 | 排除理由 |
|---|---|
| R1-F7 `sha256:d4580fd9…` | evaluator dismissed（SPEC 07 仓库级 redaction 约定，非 Story 所有） |
| R1-F8 `sha256:f312d0d6…` | evaluator dismissed（与 artifact-documents 同约定，exit≠0 已覆盖） |
| R2-F2 `sha256:d90de50b…` | evaluator dismissed（"只看目录名"设计的 by-design fail-closed） |
| `superseded-main/` 下 24+10+2 轮 main / evidence-v2 / directory-routing findings（TODO-018~022 等） | Correct Course 归档，对应实现已删除；根 invariant（目录归属只按文件名、不做产物认证）已迁移为 Story Threat Model，不按轮次放大置信度 |

## Candidate Rules（候选规则）

### CR-11-9-R1: 文件系统探测只把 ENOENT 当"不存在"，其余错误码必须归入结构化 block

- 类型：`avoidance`
- 适用范围：`src/config/*` 与 `src/fs/*` 中所有 resolver / discovery 的 `readdir` / `stat` / `lstat` / `realpath` 调用面，包括通过共享 helper 间接调用的路径。
- Evidence：R1-F1（readdir/stat 面，r1 P1）、R2-F1（boundary helper 面，r2 P1）——同一 invariant 在两个调用面分两轮暴露，修复一次只包住一个面。跨 Story：CR-API-15（3-1 "missing 与 corrupted 区分"）。
- Global eligibility：`global-rule-eligible`（同 family 在 3-1 与 11-9 均被 evaluator 接受）。
- 例外：ENOENT 语义（视为"不存在 / inside"）保持；hard link / TOCTOU 等威胁模型外状态不要求覆盖。

### CR-11-9-R2: 路径边界检测必须先于任何枚举，且检测对象与后续 stat / readdir 使用同一未经改写的路径

- 类型：`principle`
- 适用范围：所有先做 boundary / symlink-escape 检查再枚举候选的 resolver。
- Evidence：R1-F5（先枚举后检测，越界目录名泄入结果）、R3-F1（`normalizeProjectRelativePosixPath` 把 `\` 改写为 `/`，boundary 检查与实际 stat 走了两条不同路径，deferred T1）。跨 Story：CR-SEC-04（2-5 "先严格校验 POSIX-style 再 filesystem normalization"）、CR-API-17（3-3 "遍历阶段应用边界"）。
- Global eligibility：`global-rule-eligible`（family 已在 2-5 / 3-3 被接受；11-9 的 R1-F5 被接受）。
- 例外：R3-F1 本身为 deferred，本规则不据此声称 11-9 已修复该实例。

### CR-11-9-R3: 契约声明"唯一派生点 / 单次解析并传递"时，必须同步实际调用面（调用串、参数矩阵、Inputs），并用 prose 断言守护

- 类型：`best-practice`
- 适用范围：canonical Skill 包中 runner → leaf Skill 的参数传递。
- Evidence：R1-F3（AC4 只在 prose 成立，六个调用串未携带 `crDir`）；R1-F9（AC11 goal records 无断言）。
- Global eligibility：`candidate-rule`（单 Story）。
- 例外：manual mode 允许 leaf Skill 自行调用同一 CLI 一次。

### CR-11-9-R4: 采用"只按文件名判定生命周期"时，契约必须显式规定文件名无法区分的状态（DONE vs HALTED）如何重入，并覆盖 fresh-session 与多候选情形

- 类型：`principle`
- 适用范围：CR 目录 / round 生命周期契约（cr-contract、runner-workflow、finalizer-workflow）。
- Evidence：R1-F4（r1 P1 → r2 recurred：同 session 规则写了、fresh-session 定位规则漏了）、R3-F2（goal records 写入顺序）、R3-F3（≥2 legacy 含 finalizer 时规则静默）。
- Global eligibility：`candidate-rule`（单 Story；与决策 A 强绑定）。
- 例外：不得为此让 resolver 读取产物内容（决策 A / AC12）。

### CR-11-9-R5: 在既有契约中插入新章节时，逐句复核相邻既有条款是否与新语义矛盾

- 类型：`avoidance`
- 适用范围：`cr-contract.md` 等共享契约的增量修改。
- Evidence：R1-F2（`ff7528d` 基线 `:58` "不得继续写入 legacy" 与新增 `legacy-resume` 直接矛盾，restart 实现时未调和）。
- Global eligibility：`candidate-rule`（单 Story）。
- 例外：无。

## Document Suggestions（文档建议）

| Candidate rule | 建议文件/章节 | 是否需要用户授权 | 理由 |
|---|---|---|---|
| CR-11-9-R1 | `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 规则索引：在 CR-API-15 来源 Story 追加 `11-9`，或新增 CR-SEC 条目 | 是（全局文档） | 跨 Story 第二次被接受，达到升格条件 |
| CR-11-9-R2 | 同上：CR-SEC-04 / CR-API-17 来源 Story 追加 `11-9` | 是（全局文档） | 同上 |
| CR-11-9-R3 | `_bmad-output/project-context.md` 开发规范（Skill 契约同步）段 | 是 | 单 Story 候选，建议先观察 |
| CR-11-9-R4 | `cr-contract.md` CR Directory Resolution 章节已承载 R1-F4 修复；R3-F2 / R3-F3 随 TODO 关闭时补 | 否（Story 范围内，随 TODO） | 已由本 Story 契约层实现主体 |
| CR-11-9-R5 | `_bmad-output/project-context.md` 文档修改规范段 | 是 | 单 Story 候选 |

本 report 未修改任何全局文档；上表"是"项等待用户授权后由后续 session 执行。

## Result（结果）

- 结果：`COMPLETED`
- 下一步：`speclite-code-review-05-todo-tracker`（mode=closeout，登记 evaluation 的 5 条 deferred candidates）

---

*本文档由 speclite-code-review-04-rules-extractor Skill 自动生成*
