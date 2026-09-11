---
schemaVersion: speclite.cr-rules-extraction.v2
artifactType: cr-rules-extraction
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: main
round: 24
generatedAt: 2026-09-07T12:50:00+08:00
modelUsed: GPT-5.6Sol
evaluationSource: 11-9-code-review-evaluation-20260907-round-24.md
evaluationSourceHash: sha256:71664453b8898ee7024c77719dda03b220af1a6a40c462c27a82d67bb410cf39
eligibleFindingSetHash: sha256:9d505517ddd99f9bba73b03cb2a21e1cd8ed1355959f4441560fbb3e862261e2
candidateRuleCount: 6
globalRuleEligibleCount: 0
result: HALTED
provisional: true
blockReason: legacy-v2-evidence-mismatch
---

# CR Rules Extraction Report（CR 规则提炼报告）

## Halt Notice（暂停说明）

本文件仅保留已授权 record-only 的规则整理结果，不是有效 v2 CR06 predecessor。最初写入的 `COMPLETED` 已由 outer orchestrator 纠正：installed global bmenhance Skills 与 R24 review/evaluation 均为 legacy 格式，未提供完整 v2 schema、scope/finding identity、canonical deferred fingerprint 等上游证据。下列 eligible hash 是本次规则候选摘要的计算值，不等同于 v2 绑定的 accepted finding set hash。未执行 CR05/CR06，未经受控证据规范化或明确 legacy closeout policy 裁决，不允许据此推进状态。

## Source Binding（来源绑定）

- Story / series / round：`11-9 / main / 24`。
- Latest Reviewer：`11-9-code-review-summary-20260907-round-24.md`，SHA-256 `e6cca13cd4ecaedbe5e7489b34b8f49a37188e5f2f5fc7b52009084e73d47354`，结论 `PASS / PASS_RECOMMENDED`。
- Latest Evaluator：`11-9-code-review-evaluation-20260907-round-24.md`，SHA-256 `71664453b8898ee7024c77719dda03b220af1a6a40c462c27a82d67bb410cf39`，结论 `PASS_WITH_DEFERRED_TODOS`。
- `eligibleFindingSetHash` 由本次六个去重候选的 stable JSON（对象 key 排序、UTF-8、Unicode NFC）计算；候选分别为 `CR-API-44`、`CR-PROCESS-03`、`CR-DOC-08`、`CR-TEST-01`、`CR-TEST-08`、`CR-DOC-05`。

## Eligible Evidence（合格证据）

- Round 1-4：single CR root、caller-frozen context、真实 CLI/installed leaf propagation、runner-wide no-write 与 frozen title-bearing detector。
- Round 5-21：tracker/Story machine terminal 的 exact structural region、bounded parser totality 与 invalid/ambiguous fail-close。
- Round 2-23：current artifact identity、round/source/hash、predecessor graph、fixRecord authority、completion gate 与 source mutation freshness。
- Round 19：CR04/CR05 durable output plane 与 active docs/help 的双向 binding。
- 以上 accepted blocking findings 均已有 authorized fix evidence，并由 Round 24 Reviewer/Evaluator 双 PASS 复核关闭。

## Candidate Rules（候选规则）

| 规则 | 处理 | 分数 | 说明 |
|---|---|---:|---|
| `CR-API-44` | 新增 | 11/12 | 单一 resolver 与 caller-frozen context 贯穿全部 leaf。 |
| `CR-PROCESS-03` | 新增 | 11/12 | 完成证据绑定同轮 predecessor graph 与 source freshness。 |
| `CR-DOC-08` | 新增 | 10/12 | machine terminal 只在 owning structural region 内认证，歧义语法 fail closed。 |
| `CR-TEST-01` | 去重更新 | 10/12 | 补入 runner progress、round artifacts、goal records、temp、Story、tracker 全 mutation surface。 |
| `CR-TEST-08` | 去重更新 | 10/12 | 补入 frozen full classified corpus 与 title-bearing 完整变量族。 |
| `CR-DOC-05` | 去重更新 | 11/12 | 补入 CR04/CR05 durable output 与 active docs/help binding。 |

## Global Eligibility（全局升格）

- 本次 `globalRuleEligibleCount=0`。三个新增规则均集中于 CR orchestration/lifecycle 技术域；另三项已有等价 rules-summary identity，只做跨 Story evidence 更新。
- outer orchestrator 已授权 `record-only`，因此不修改 project-context、Architecture、SPEC、AGENTS/CLAUDE、public docs 或其它全局 authority。

## Excluded Items（排除项）

- `supersededIndex` identity/continuity：Round 5 首次确认、Round 24 carried 的未解决 P2；状态不满足 rules-summary 的“已验证、已解决或已确认可沉淀”门槛，交由 CR05 去重登记，不在 CR04 双重管理。
- Round 24 两条 Blind observations：Evaluator 已确认 `dismiss`，不进入 eligible finding set。
- external drawer、fixed-count drift、Story 11.10、mirrors 与 broad/full suite caveat：明确在 Story 11.9 closeout scope 外，不沉淀为本 Story 规则。

## Applied Record（已落地记录）

- 已更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，本次写后 SHA-256：`bc9d453731133a26755357f28c43cd708d18164f9f2fe71fd98bb58461051c73`。
- 未修改 backlog、Story、tracker、completion gate、source、tests、contracts、Skills/templates、docs/help、Story 11.10、drawer 或 mirrors。

## Result（结果）

- Result：`HALTED / PROVISIONAL`；规则沉淀已完成，但 v2 收口证据未完成。
- 下一步：待用户裁决受控证据规范化或明确 legacy closeout policy；当前禁止 CR05/CR06 与 Story/tracker 状态更新。

---
*本文档由 bmenhance-cr-04-rules-extractor Skill 以 record-only 模式生成*
