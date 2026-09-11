---
schemaVersion: speclite.cr-evaluation.v2
artifactType: code-review-evaluation
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: directory-routing
round: 1
generatedAt: 2026-09-09T12:10:38.300Z
modelUsed: "OpenAI gpt-5.6-sol (reasoning_effort=medium; runner dispatch metadata)"
reviewModel: "OpenAI gpt-5.6-sol (reasoning_effort=high; runner dispatch metadata)"
reviewSource: 11-9-code-review-summary-20260909-directory-routing-round-1.md
reviewSourceHash: sha256:024c2d4923d9111e1c2f5dce2c2d113641f716038203852047d6ca256fd836a9
headSha: ff7528d3f9ec34072bb669ee79f7569345c23d47
scopeHash: sha256:d0b1ef376adacdf1ec7e2e822b75e86bc9f814c3cac457dde14e3759d3c8aa26
verdict: FIX_REQUIRED
acceptedCounts:
  p0: 0
  p1: 8
  deferred: 0
  verifyRequired: 0
  dismissed: 1
fixRecord:
  mode: patch
  status: completed
  generatedAt: 2026-09-09T12:39:21Z
  modelUsed: "OpenAI gpt-5.6-sol (reasoning_effort=medium; runner dispatch metadata)"
  evaluationSourceHash: sha256:2068bc9c0252b59e9c539226fe9d390be360080f0842bc04654ef72a74f7a5fe
  fingerprints:
    - sha256:368c6718832b7cfe2253c5320e198122e23bc9e5fcd06bf1da3e3887ac40b159
    - sha256:b7d56c020c235a9f8835710c4d6b89c45874ad36d0be82847ff672d7bf135aba
    - sha256:646f848391831effbd67139b3e4866e0bf9224947d5b23a01aabc5ae13224ae5
    - sha256:88af6e25e5dc4bf54c0146ee725ebef219fe63c45cbc0a6ac28b3c24790a30c9
    - sha256:1e3b3a447e55b71ecd94df95d72327c1c8ba48eed46ecf2b6fd353d61b6229f4
    - sha256:5b81d85626cada208ee35d299e6bbc3438a9527f01db6c210608d70ce8a30a7f
    - sha256:4a506ab42bb5d39e8066f1206c7fdc4b899594fd8e2a46eee9531e4c9becc869
    - sha256:05f69a8256e98077334bd2e2f8957f0c0f97f04cce7ddd21790986f6d4fd8360
  changedFiles:
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/references/reviewer-workflow.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/references/finalizer-workflow.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md
    - assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs
    - release/packaging-manifest.json
    - test/code-review-contract.test.ts
    - test/cr-directory-resolution.test.ts
    - test/fixtures/code-review-contract/title-bearing-path-ledger.json
  sourceMutationAt: 2026-09-09T12:36:20.348Z
  verificationCommands:
    - "npm test -- test/cr-directory-resolution.test.ts test/code-review-contract.test.ts"
    - "node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs"
    - "python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract"
    - "python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer"
    - "python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer"
    - "node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json"
    - "node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict"
    - "npm run build (cwd=/private/tmp/speclite-119-packaging.xWHjZ8)"
    - "npm run release:packaging-check (cwd=/private/tmp/speclite-119-packaging.xWHjZ8)"
    - "git diff --check -- authorized-fix-paths"
  verificationResult: PASS
convergence:
  newBlocking: 8
  recurredBlocking: 0
  resolvedBlocking: 0
  churnDetected: false
  architectureCategories: []
---

# Code Review Evaluation（代码审查评估）

## Binding Verification（绑定验证）

- Review 来源及 hash：`11-9-code-review-summary-20260909-directory-routing-round-1.md` 的 raw SHA-256 与按 NFC、LF、单一 terminal LF 规范化后的 SHA-256 均为 `sha256:024c2d4923d9111e1c2f5dce2c2d113641f716038203852047d6ca256fd836a9`，与本评估一对一绑定。
- Story、series、round：`11-9` / `directory-routing` / `1` 均匹配；同 series、同 round 不存在既有 current evaluation。
- Scope hash：独立对 `scope-manifest-final.json.canonicalPayload` 计算 SHA-256，得到 `sha256:d0b1ef376adacdf1ec7e2e822b75e86bc9f814c3cac457dde14e3759d3c8aa26`。live inventory 使用 `git diff --no-renames --name-only -z ff7528d3f9ec34072bb669ee79f7569345c23d47` 加 untracked 重算为 696 actual / 42 declared / 654 excluded / 0 exceptions；42 个 NFC/LF/trim-tail content digest 全部匹配，写入本文件前 live delta 为空。
- Finding set：9 个 fingerprint seed 分别独立重算匹配；`findingSetCanonicalJson` 的 SHA-256 为 `sha256:01de0380c8d0bcbc9195514d66ffb8f3073850757687ec87ef24d1fb78d82145`。
- Reviewer quorum：`blind + edge + auditor` 3/3，`failedLayers=[]`，`acCoverageComplete=true`。
- Completion gate 仅作开发阶段证据：实际路径 `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md`，raw SHA-256 `e7f93a5531ebfaffe7e483361eca67dd45a4b7e56a8b645d8532dded6935cd1f`，`generatedAt=2026-09-09T08:33:22Z`；它不替代本轮 CR 裁决。
- Evaluator 独立性：Reviewer 与 Evaluator 均为 `OpenAI gpt-5.6-sol`，reasoning effort 分别为 high 与 medium，因此存在同模型相关性限制。本评估没有按 layer 或 reviewer bucket 机械采纳；每个阻塞候选均对照 current production control flow、Story AC、shared contract、合法反例与职责边界寻找反证。

## Finding Evaluations（逐项评估）

### DR-R1-F1: 普通 note 中的 series 子串被误判为 current identity conflict

- 发现指纹：`sha256:368c6718832b7cfe2253c5320e198122e23bc9e5fcd06bf1da3e3887ac40b159`
- Reviewer 提出的失败场景：普通文件 `11-9-code-review-summary-maintenance.md` 因包含 `main` 被当成 malformed current artifact，并阻断新 run。
- 独立证据：`resolve-cr-directory.mjs:363-386` 先尝试完整 current/other-series regex，随后在 line 382 仅以 `startsWith(storyId-family)` 加 `includes(reviewSeries)` 判 identity conflict；shared contract line 89 明确 ordinary notes 不参与归属。
- 已检查的反证：对 selected series 的 near-current 非法 filename 确实需要 fail-close，但该义务不能扩张到不具日期、series、round 结构的普通 note；精确 matcher 可以同时保留 near-current 拒绝与 ordinary-note 排除。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：将 malformed-current 检测限定到可证明具有 selected current-family intent 的结构，补普通 note substring 与非法 near-current 的成对回归，避免修复时回退 TODO-019 的边界。

### DR-R1-F2: 缺失 v2 schema/type 的文件仍建立 legacy current authority

- 发现指纹：`sha256:b7d56c020c235a9f8835710c4d6b89c45874ad36d0be82847ff672d7bf135aba`
- Reviewer 提出的失败场景：精确 current filename 只含 `storyId/reviewSeries/round`，缺 `schemaVersion/artifactType`，仍令 legacy candidate 成为 current authority。
- 独立证据：`resolve-cr-directory.mjs:336-350` 对 `artifactType` 和 `schemaVersion` 仅在字段存在时比较，缺失时仍增加 `currentCount`；shared contract 的 Review/Evaluation/CR04–06 schemas 均将二者作为 v2 artifact 必备 identity。
- 已检查的反证：本次批准禁止 resolver 重建 approval scanner，但 schema/type 与 filename family 的一致性属于 bounded directory ownership provenance，不是审批真实性、gate 或 tracker 认证。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：对精确 current-family artifact 强制要求与 family 匹配的 `schemaVersion` 和 `artifactType`，补缺字段及错误 family 回归；不得恢复旧 approval scanner。

### DR-R1-F3: --__proto__ 绕过 strict CLI unknown-argument gate

- 发现指纹：`sha256:646f848391831effbd67139b3e4866e0bf9224947d5b23a01aabc5ae13224ae5`
- Reviewer 提出的失败场景：合法 resolve 参数后追加 `--__proto__ ignored`，CLI 仍 exit 0 / `ok=true`。
- 独立证据：`resolve-cr-directory.mjs:657-680` 使用普通对象收集参数；`values["__proto__"] = "ignored"` 不产生 own enumerable key，随后 `Object.keys(values)` 的 unknown 检查无法看到它，违反 shared contract line 75 的 unknown fail-close。
- 已检查的反证：字符串值不会把 prototype 设为任意对象，因此这里不是泛化的 prototype-pollution 漏洞；但 CLI 接受明确 unknown 参数本身仍是 production contract 违规。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：使用 null-prototype 参数表或 `Map`，补 `__proto__`、`constructor`、`prototype` unknown/duplicate 回归，仅修 strict CLI 参数面。

### DR-R1-F4: 超大 round 被同 series 的 other-series regex 吞掉

- 发现指纹：`sha256:88af6e25e5dc4bf54c0146ee725ebef219fe63c45cbc0a6ac28b3c24790a30c9`
- Reviewer 提出的失败场景：selected series 的 exact filename 含非 safe-integer round；exact 分支下落后被 other-series 分支当 unrelated，legacy evidence 被忽略并选择 canonical sibling。
- 独立证据：`resolve-cr-directory.mjs:367-381` 在 exact regex 命中后只在 safe integer 时返回；overflow 会继续进入不排除 selected series 的 `completeOtherSeries` 并直接返回 `unrelated`。
- 已检查的反证：round numbering 的业务 owner 不在 resolver，但判定 filename 是否能作为 current directory ownership evidence属于 resolver；不可表示的 selected-series round 必须 fail-close，不能静默视为其他 series。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：exact selected-series filename 命中而 round 非 safe integer时直接 identity conflict，并补边界值/overflow/合法 other-series 回归。

### DR-R1-F5: quoted semantic duplicate identity 未被 bounded parser 识别

- 发现指纹：`sha256:1e3b3a447e55b71ecd94df95d72327c1c8ba48eed46ecf2b6fd353d61b6229f4`
- Reviewer 提出的失败场景：frontmatter 同时含 `storyId: 11-9` 与 `"storyId": 11-8`；quoted semantic key 被忽略，legacy candidate 仍成为 current。
- 独立证据：`resolve-cr-directory.mjs:389-412` 只匹配 bare key `/^([A-Za-z][A-Za-z0-9]*):/`，只对捕获到的字面 key 去重；YAML quoted key 与 bare key 是同一语义字段，冲突 identity 未被检测。
- 已检查的反证：不需要引入 whole-document YAML、审批字段或旧 scanner；只需对五个 bounded identity keys 识别合法 quoted/bare 语义重复并 fail-close。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：为 bounded identity key 实现 semantic duplicate 检测，补 quoted/bare 同值、冲突值、重复值和普通非 identity key 回归。

### DR-R1-F6: CR06 将 frozen legacy-resume 再解释为仅 unfinished

- 发现指纹：`sha256:5b81d85626cada208ee35d299e6bbc3438a9527f01db6c210608d70ce8a30a7f`
- Reviewer 提出的失败场景：resolver 已将含 `DONE` claim 的唯一 current legacy 冻结为 `legacy-resume`，CR06 又以 “仅 unfinished” 条件重解释该目录。
- 独立证据：shared contract line 83 明确“即使包含 DONE claim”也绑定 legacy，并由正常 approval owner判断完成性；`finalizer-workflow.md:14-17` 又写“仅 resolver 判定的单一 unfinished legacy directory”可作为 current，文义冲突。
- 已检查的反证：CR06 仍必须执行 evaluation、scope、gate、CR04/05、tracker 等既有 closeout gates；删除 `unfinished` 二次筛选不会降低这些审批门槛，也不会把 directory ownership 等同 approval authenticity。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：将 CR06 Step 1 改为原样消费 frozen `compatibilityMode=legacy-resume`，随后继续全部原 approval/freshness gates；不得修改审批算法。

### DR-R1-F7: Legacy pre-summary 中断态被拆到 canonical sibling

- 发现指纹：`sha256:4a506ab42bb5d39e8066f1206c7fdc4b899594fd8e2a46eee9531e4c9becc869`
- Reviewer 提出的失败场景：legacy root 只留下 `.tmp/...` 或 `goal-execute-records/PLAN.md`，尚无顶层 current-family artifact；resolver 忽略 reserved directories并选择 canonical sibling。
- 独立证据：`resolve-cr-directory.mjs:285-358` 对全部目录执行安全检查后跳过 `RESERVED_CR_SUBPATHS`，没有任何 current artifact 时返回 `NO_CURRENT_SERIES_EVIDENCE`；Story AC9 要求 legacy-only unfinished run 在一个目录恢复，AC5/6 又明确 `.tmp` 与 goal records 属同一 run 的 CR artifacts。
- 已检查的反证：任意残留 `.tmp` 或普通 `PLAN.md` 本身不足以证明 current Story/series，不能简单把目录存在当 authority。缺口仍成立，但修复必须采用 bounded、machine-readable 的 ownership evidence，或使用已冻结 context 的 durable 恢复记录，不能扫描 prose/approval claim 或猜测最新目录。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：在 shared contract、resolver 与 focused tests 中建立最小 pre-summary current ownership marker/恢复证据，验证 Story/series/crDir identity、zero migration 与 ambiguity；不得复放 approval 或读取普通 note 作为 authority。

### DR-R1-F8: Active CR01 与 public lifecycle 仍允许删除当前 round .tmp 证据

- 发现指纹：`sha256:cf44eb0bb38ad7b131706d668f1c1daa01e3f61dee4cb69adf9dccefd577201c`
- Reviewer 提出的失败场景：CR01 写 summary 后清理 current round `.tmp`，导致后续 Evaluator 无法使用本轮保存的原始输入；public docs 也声明 `.tmp` 可清理。
- 独立证据：`reviewer-workflow.md:56-63` 与 `workflow-artifact-layout.md:193,234` 的确将 `.tmp` 定义为审查完成后清理的 transient 数据；本次 `EXPERIMENT_NOTES.md:7` 明确要求本轮及旧 `.tmp` 保留，当前实物也完整保留。
- 已检查的反证：Story AC5 只要求 temp artifacts 写入同一 resolved directory，AC7 只要求同步相关路径表达式；shared CR contract 和已批准 PLAN 均未把 `.tmp` 提升为跨 consumer durable truth source。把一次 runner 的保留策略改写为所有 CR01/public lifecycle 的永久保留策略，会新增全局 lifecycle 需求并超出本轮授权。当前 CR01 实际未清理，因此本轮证据也未丢失。
- 处置：`dismissed`
- 优先级：`NONE`
- 必须执行的动作：本轮继续遵守既有运行记录，不删除任何旧或 current `.tmp`；不得据此修改 canonical CR01 或 public cleanup policy。若要改变全局 retention，必须由 lifecycle owner另行定义保留时机、清理 owner 与 durable/temporary 边界。

### DR-R1-F9: CR01 production validator 示例的嵌套反引号使命令不可执行

- 发现指纹：`sha256:05f69a8256e98077334bd2e2f8957f0c0f97f04cce7ddd21790986f6d4fd8360`
- Reviewer 提出的失败场景：CR01 line 8 的 inline command 在 `--write-subpath` 值内部嵌套反引号，shell 执行时产生 command substitution 并令参数为空。
- 独立证据：`reviewer-workflow.md:8` 的外层 inline code 内出现 `"`.tmp/.../review-input.diff`"`，而 CR02–06 的同类命令均为普通 quoted placeholder。按 zsh 语义，内层反引号会执行不存在的相对路径，随后 validator 收到 empty 参数并 fail-close。
- 已检查的反证：这不是 production validator 实现缺陷；直接传入 `.tmp/directory-routing-round-1/review-input.diff` 已由 current focused test和本轮真实 validator证明可用。缺陷限定在 canonical CR01 可执行调用说明。
- 处置：`accepted`
- 优先级：`P1`
- 必须执行的动作：仅移除 `--write-subpath` 参数值内多余反引号，补 canonical workflow command-shape 断言或 production CLI probe。

## Required Fixes（阻塞修复）

| 发现指纹 | 优先级 | 失败场景 | 授权范围 |
|---|---|---|---|
| `sha256:368c6718832b7cfe2253c5320e198122e23bc9e5fcd06bf1da3e3887ac40b159` | P1 | 普通 note 被误判为 current conflict | resolver classifier + focused tests；同时保留非法 near-current fail-close |
| `sha256:b7d56c020c235a9f8835710c4d6b89c45874ad36d0be82847ff672d7bf135aba` | P1 | 缺 schema/type 的伪 v2 artifact 建立目录 authority | resolver bounded identity + focused tests；禁止 approval scanner |
| `sha256:646f848391831effbd67139b3e4866e0bf9224947d5b23a01aabc5ae13224ae5` | P1 | `--__proto__` 绕过 unknown gate | CLI argument table + focused CLI tests |
| `sha256:88af6e25e5dc4bf54c0146ee725ebef219fe63c45cbc0a6ac28b3c24790a30c9` | P1 | overflow round 被误归 other series | resolver classifier + focused boundary tests |
| `sha256:1e3b3a447e55b71ecd94df95d72327c1c8ba48eed46ecf2b6fd353d61b6229f4` | P1 | quoted/bare identity 冲突未检测 | bounded identity parser + focused tests |
| `sha256:5b81d85626cada208ee35d299e6bbc3438a9527f01db6c210608d70ce8a30a7f` | P1 | CR06 重解释 frozen legacy ownership | CR06 workflow 中英文对应表面及必要 command/docs assertion；保留原审批门禁 |
| `sha256:4a506ab42bb5d39e8066f1206c7fdc4b899594fd8e2a46eee9531e4c9becc869` | P1 | pre-summary legacy run 被拆到 canonical sibling | shared directory contract、resolver、focused tests的最小 machine-readable ownership恢复机制 |
| `sha256:05f69a8256e98077334bd2e2f8957f0c0f97f04cce7ddd21790986f6d4fd8360` | P1 | CR01 documented validator command 无法执行 | CR01 workflow 中英文对应表面 + focused command-shape test |

修复器只可修改 baseline 已批准的 42 个 implementation inputs 中与以上 8 项直接相关的文件。不得修改 Story、tracker、TODO backlog、review/evaluation 历史、root 三日志，不得恢复 approval scanner，不得借 F8 修改全局 `.tmp` cleanup policy。若 F7 的最小 machine-readable ownership恢复无法在既有 shared contract/resolver/test 范围内完成，必须停止并返回 architecture triage，不得扩到新 package、installer 或全局 metadata。

## Verify Obligations（验证义务）

无独立 `VERIFY_REQUIRED` 项。每个 accepted P1 的 focused regression 是其 production patch 的完成证据，不能用只新增测试替代语义修复。

## Deferred TODO Candidates（延期候选）

无。本轮不得把 accepted P1 下沉为 TODO，也不得写 TODO backlog。

## Historical TODO Status（历史 TODO 状态核验）

| TODO | 当前证据状态 | CR05 后续建议 |
|---|---|---|
| TODO-018 | `open / partially superseded`。完整 approval/authenticity 扫描已由批准的职责拆分移出 resolver，不能要求恢复；但 current-family 最小 v2 provenance 仍未闭合，DR-R1-F2 证明缺 `schemaVersion/artifactType` 仍可建立 directory authority。 | 保持 open；待 F2 修复和 fresh review/evaluation 后，再由 CR05 将旧“完整 authenticity”措辞映射为 owner 分离后的剩余 provenance义务或记录 supersession。 |
| TODO-019 | `open / incidentally covered`。当前 broad fallback 会让 selected series 的 `~round` filename fail-close，但它同时制造 DR-R1-F1，且没有针对性回归证明修复 F1 后仍保留该边界。 | 保持 open；F1 修复必须补 `~round` near-current regression，fresh review确认后再判断 resolved。 |
| TODO-020 | `superseded in resolver, not verified globally`。旧 bounded inline-list approval grammar 已从 757 行 directory-only resolver 删除，且 PLAN 将 tracker/approval grammar 归还 CR06/owner；没有证据证明所有现 owner 已实现同等拒绝。 | 不以“删代码”自动 resolved；CR05 应记录旧 resolver location 被职责决策 supersede，并对实际 owner 另行核验后再决定关闭或重映射。 |
| TODO-021 | `superseded in resolver, not verified globally`。directory-only resolver 不再解析 freshness，shared contract 与 CR06 workflow 仍要求 freshness，但本轮没有 production comparator 证据证明完整小数秒精度。 | 不以“删代码”自动 resolved；CR05 对 current freshness owner 的实际实现/执行证据核验后再裁决。 |
| TODO-022 | `open / owner-transferred`。shared contract 仍定义 superseded ordinal 与 round lineage，并明确 resolver 不拥有完整 lineage；原 `it.todo` 仍存在，没有 fresh closeout evidence。 | 保持 open，交由 runner/producer-consumer schema owner；不得因 resolver 简化而标 resolved。 |

## Convergence（收敛）

- 新增阻塞项：8。
- 复现阻塞项：0；这是 `directory-routing` series round 1，旧 `evidence-v2` fingerprint 与风险接受不参与 current recurrence。
- 已关闭阻塞项：0。
- Churn 证据：无。虽然 resolver 同时承载多个 finding，但尚未发生本 series 的 fix/re-review 循环，不能仅凭同一文件多项缺陷声明 churn。
- 架构类别：无须立即上升为 `ARCHITECTURE_TRIAGE`。F6 是 leaf contract 文义修复；F7 的 lifecycle gap 可在已授权 shared contract/resolver/test 范围内定义 bounded ownership evidence。若实际修复必须越出该范围，Fixer 应 HALT 并返回 triage。
- Stop-loss：round 1 < `maxRounds=5`，连续新增 blocking 轮数为 1 < 3，没有同 fingerprint 复现或阻塞数不降证据；不触发 `STOP_LOSS`。

## Evaluation Verdict（评估结论）

- 裁决：`FIX_REQUIRED`。
- 理由：DR-R1-F1/F2/F3/F4/F5/F6/F7/F9 共 8 项是当前 directory ownership、strict CLI、single frozen context consumer 或 workflow executability 的 production P1；DR-R1-F8 将本轮运行级 `.tmp` 保留策略提升为全局生命周期要求，缺少 Story/shared contract 授权，予以 dismiss。
- 必须进入的下一状态：`FIX(mode=patch)`，仅执行上表 8 项最小授权修复；之后必须进入 fresh `directory-routing` round 2 Reviewer → Evaluator，不能直接进入 CR04/CR05/finalizer。

## Fix Record（修复执行记录）

- Date：`2026-09-09`
- Model Used：`OpenAI gpt-5.6-sol (reasoning_effort=medium; runner dispatch metadata)`
- 元信息更正：初次 Fix Record 曾依据通用系统人格误写为 `OpenAI GPT-6`；该值缺少本次 runtime 证据，现按 runner dispatch metadata 更正，修复内容、验证结果与时间字段均未改变。
- Mode：`patch`
- Fix Items：`8`
- Evaluation Source Hash（写入前 raw/canonical）：`sha256:2068bc9c0252b59e9c539226fe9d390be360080f0842bc04654ef72a74f7a5fe`
- Source Mutation At：`2026-09-09T12:36:20.348Z`

### Fix Results（修复结果）

- `DR-R1-F1` / `sha256:368c…b159`：将 malformed-current 判断收窄到包含 date 与 selected series 的结构化前缀；普通 `maintenance` note 不参与归属，`~round` near-current 仍 fail-close。
- `DR-R1-F2` / `sha256:b7d5…5aba`：精确 current-family artifact 现在强制要求 `schemaVersion` 与 `artifactType` 同 filename family 一致；未恢复 approval scanner。
- `DR-R1-F3` / `sha256:646f…ae5`：CLI 参数表改为 null-prototype object，`__proto__`、`constructor`、`prototype` unknown 参数及 duplicate 参数均 fail-close。
- `DR-R1-F4` / `sha256:88af…30c9`：selected series 的 round overflow 直接判 identity conflict；最大 safe integer 与合法 other-series 正控保留。
- `DR-R1-F5` / `sha256:1e3b…29f4`：bounded parser 仅对 `schemaVersion/artifactType/storyId/reviewSeries/round` 五项识别 bare/quoted semantic key 并拒绝 duplicate；普通非 identity duplicate 不影响目录 provenance。
- `DR-R1-F6` / `sha256:5b81…0a7f`：CR06 原样消费 frozen `legacy-resume`，不再按 `DONE`/unfinished 重解释 ownership；原 approval、scope、freshness、closeout gates 保持。
- `DR-R1-F7` / `sha256:4a50…869`：shared contract 定义固定 `.tmp/cr-directory-ownership.json` 五字段 marker、production validator 写前步骤和重读义务；resolver 只读该固定路径，覆盖 pre-summary legacy resume、plain `.tmp`/`PLAN.md` 不推断、冲突、ambiguity 与 zero-migration。
- `DR-R1-F9` / `sha256:05f6…8360`：移除 CR01 `--write-subpath` 示例值内嵌套反引号，并以 command-shape 与 production CLI 回归锁定可执行形态。

### Verification（验证）

- RED：首次 focused regression 为 `7 failed / 24 passed / 4 todo`，分别命中 production 与 contract 缺口；ledger 失败属于新增 fixture 的预期同步项。
- GREEN：最终 `npm test -- test/cr-directory-resolution.test.ts test/code-review-contract.test.ts` 为 `31 passed / 4 todo / 0 failed`。
- `node --check`、三个相关 Skill density、path-limited `git diff --check` 均通过。
- Canonical checker warn/strict 均为 `status=ok`、`findings=[]`；当前全树报告的 `201` 个 changed canonical paths 是既有混合工作树背景，本轮未据此扩范围。
- 隔离 packaging：固定输入 aggregate hash=`89e2e227744b15acbc7a807ff380446344d16575327a457e9e071fb279436f42`；在 `/private/tmp/speclite-119-packaging.xWHjZ8` 使用独立 npm cache 执行 `npm run build` 与 `npm run release:packaging-check` 均通过。真实产物 `release/packaging-manifest.json` raw hash=`46af6656c082fd17eb94b0d2ec8178533c38a0c06e42ac96907ec12b7b0ccdf5`、`packageHash=sha256:5b47ae5d416c18e535d24b1fb558faf3e41a3cdaa6b1b32bc7dc5be5ba005172`，live manifest 与隔离产物逐字节一致。

### Scope and Governance（范围与治理）

- 相对 `approved-source-bytes.tgz`，42 个授权实施输入仅上列 8 个 `changedFiles` 漂移；其余 34 个逐字节一致。live inventory=`697 actual / 42 declared / 655 excluded / 0 exceptions`，相对 review snapshot 的唯一新增 path 是本 evaluation，未预列 future path。
- shared contract 从 `## Review Scope Manifest（审查范围清单）` 到 EOF 的 current/snapshot SHA-256 均为 `305ac191483eb724e78aa23d4f69aacd54edfcf152976114babe61d91ce86f97`；原审批尾部逐字节保留。
- staged set 仍为 42 项，`git diff --cached --binary --full-index` SHA-256 仍为 `06426fd385ef8a387cfe9aecb0ac0472274c3c0de69ed2fd107ed0d44f17787f`；`HEAD` 仍为 `ff7528d3f9ec34072bb669ee79f7569345c23d47`。
- `D0 canonical-source-truth`：已更新 canonical contract/resolver 与真实隔离派生 packaging manifest；strict checker 与 packaging check 通过。`D1 current-public-docs`：`skipped`，本轮授权将 marker 归属机制限定在 shared CR contract/resolver/tests，现有 public docs 不承担该低层 writer schema。`D2 living/frozen history`：`historical snapshot`，未修改 legacy references、root 三日志或既有 review 历史。
- 限制：未在主混合目录运行 build/full suite，也未为既有历史 `695 passed / 13 failed / 4 todo` 的外部固定计数扩修；本轮验证覆盖 evaluation 指定 focused tests、相关 consumer/docs、syntax、Skill density、canonical strict 与隔离 packaging。

### Handoff（交接）

`fixRecord.status=completed`。本记录不改变 evaluation 原 verdict；下一步必须由 runner 启动 fresh `directory-routing` round 2 CR01 → CR02，不得直接进入 CR04/CR05/finalizer，也不得据此更新 Story、tracker 或 TODO backlog。
