---
Story: 11-5
Round: 8
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Round 8 三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级），三层结论均为 **PASS / 0 P0/P1 findings**。Aggregator 独立核对 Story、Round 7 summary/evaluation/fix record、current source/tests、`SPEC 07`、`SPEC 09` 与 public guidance，并复跑 focused、related、docs、canonical warn/strict、changed-package density 与 scoped diff checks；未发现 Story 11.5 新的阻塞问题。

Round 7 Finding #1 已关闭：declared shard 在 lexical entry/readability、`realpath` containment 后，现于加入 `resolvedPaths` 前验证 dereferenced final target 必须为 regular file；directory/FIFO 等 non-regular target稳定映射至既有 `artifact-path.broken-shard-reference` / `unreadable-shard` block，subject 内 regular-file symlink继续合法，subject 外 target继续使用 containment diagnostic。Round 7 Finding #2 **仍然存在且未被修复或忽略**：missing-index candidate scan 仍只计入 `Dirent.isFile()` 的 `.md` entries，lexical `.md` symlink candidate semantics保持未定义；依据 Round 7 Evaluator，该项为非阻塞 P2，必须由 CR05 登记 TODO，不得把本轮 PASS 表述为该项已解决。

本轮总体结论为 **PASS**，去重后为 **0 P0 / 0 P1**。下一门禁为 fresh Evaluator Round 8；在 latest Evaluator 也判定 PASS 前，不得进入 CR04、CR05 或 CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `PASS` / 0 P0/P1 | 确认 final-target regular-file gate、direct/reference fixtures、shape/selection矩阵、safe evidence与zero mutation；P2保持defer。 |
| Edge Case Hunter | PASS | `PASS` / 0 findings | `4 files / 123 tests`通过，覆盖directory/FIFO/regular/outside、schema、重复调用、no-leak与zero mutation；未重开历史finding。 |
| Acceptance Auditor | PASS | `PASS` / 0 findings | AC1-AC11通过；AC5、AC7、AC10保留已知P2 caveat，且明确要求CR05登记。 |

## Findings（去重发现）

无 P0/P1 actionable finding。

### Deferred P2（延后项，不计为本轮阻塞 finding）

- **来源**：Round 7 Finding #2；Round 7 Evaluator 已裁决 defer；Round 8 三层与 Aggregator 确认行为未改。
- **位置**：`src/config/artifact-document-discovery.ts:776-808`。
- **当前事实**：missing-index candidate scan 仍以 `entry.isFile() && entry.name.toLowerCase().endsWith(".md")` 收集 candidates，因而不计 lexical `.md` symlink。
- **影响边界**：可能使至少 subject 内 safe regular-file symlink candidate 被诊断为 `subject-document-missing` 而非 `shards-without-index`；current outcome仍为structured block、空消费和零 mutation，没有错误continue或越界读取证据。
- **处置**：保持 P2，不在本轮修复；CR05 必须登记 TODO，保留未来 Owner contract 对 in-bound、outbound、broken 与 non-regular undeclared symlink candidate semantics 的裁决问题。不得新增stable issue ID、不得把它扩为通用filesystem治理，也不得在 closeout 中写成已解决。

## Round 7 P1 Closure（Round 7 阻塞项闭环）

| Prior item | Round 8 result | Current evidence |
| --- | --- | --- |
| Round 7 #1 declared shard symlink final target未验证regular file | PASS（关闭） | `resolveDeclaredShards()` 在 containment 后执行 `stat(targetRealPath).isFile()`，失败统一返回 `unreadable-shard`；加入`resolvedPaths`只发生在该gate之后。 |
| Directory target | PASS | inline、reference-style、sharded-only、whole+sharded无selection及`selection=sharded` fixtures均block，`declaredShardPaths=[]`、`consumedPaths=[]`、重复调用稳定、safe evidence且zero mutation。 |
| FIFO target | PASS | 非Windows reference-style FIFO fixture不打开target即block，复用`unreadable-shard`，不泄露absolute/raw target。 |
| In-bound regular symlink | PASS | 合法继续，保留lexical declared/consumed path。 |
| Outbound symlink | PASS | 保持`outside-subject-directory` containment mapping，未被non-regular mapping吞并。 |

## Owner And Historical Closure（Owner 与历史闭环）

| Contract / prior scope | Round 8 result | Evidence / note |
| --- | --- | --- |
| Owner M：有限只读 mismatch probes | PASS | Probe set、声明顺序、final-target regular-file约束及diagnostic-only/no-fallback/no-migration保持成立。 |
| Owner L：bounded CommonMark-compatible subset | PASS | Inline/reference-style、query/fragment、single decode、portable/local classification、malformed/undefined处理、order/dedupe/self-link均未发现回归。 |
| Owner S：显式`selection=whole` | PASS | 未选`index.md`内容及shard graph不读取；canonical index entry safety仍保留。 |
| Owner I：candidate scan unreadable taxonomy | PASS | 必要scan失败继续使用`invalid-sharded-document-shape` / `shard-candidate-scan-unreadable`，安全relative evidence、block、空消费、零 mutation。 |
| Round 1-6 findings | PASS | 未重开root mismatch、canonical/subject symlink、Markdown grammar、portable destination、definition precedence、selection、scan scope、order/dedupe/self-link或unreadable canonical entry等已关闭问题。 |
| Round 7 Finding #2 P2 | DEFER（非阻塞） | 行为仍存在且未改；必须由CR05登记TODO。 |

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Evidence / note |
| --- | --- | --- |
| AC1 | PASS | Fresh phase-owned PRD、Epics、Architecture subject directory projection保持闭环。 |
| AC2 | PASS | Canonical whole producer paths保持`prd/prd.md`、`epics/epics.md`、`architecture/architecture.md`。 |
| AC3 | PASS | Whole/sharded同目录、无额外`shards/`层；共存仍要求invocation-scoped explicit selection。 |
| AC4 | PASS | Valid whole/sharded consumption与declared shard final-target safety均有current source和fixture证据。 |
| AC5 | PASS（P2 caveat） | Decision table、broken/unreadable block与selection成立；missing-index lexical `.md` symlink的diagnostic taxonomy仍待CR05 TODO，不改变当前fail-closed结论。 |
| AC6 | PASS | Explicit root authority与Architecture Planning `legacy-compatible` fallback未被重开。 |
| AC7 | PASS（P2 caveat） | Mismatch只诊断、不迁移、不fallback；P2在特定missing-index symlink candidate场景可能影响diagnostic precedence，已明确defer。 |
| AC8 | PASS | Shared resolver、producer/consumer、ZH/EN、help、metadata/contracts/examples/docs保持单一root contract。 |
| AC9 | PASS | Active fresh negative scan与历史分类未发现本轮回归。 |
| AC10 | PASS（P2 caveat） | `99`项focused与`24`项related覆盖current required matrix；deferred candidate-symlink taxonomy fixture属于CR05 TODO，不伪称已覆盖。 |
| AC11 | PASS | 审查与修复均限定PRD/Epics/Architecture及Story 11.5 shared discovery surface，未扩展Story 11.6+。 |

## Verification（验证）

- 三层正式结果：`3/3`成功，无降级；Blind `PASS / 0 P0/P1`、Edge `PASS / []`、Acceptance `PASS / 0`。三层均只读，未运行build、full suite或packaging。
- Aggregator复跑 `npx vitest run test/artifact-document-discovery.test.ts`：PASS，`1 file / 99 tests`。
- Aggregator复跑 `npx vitest run test/artifact-root-resolution.test.ts test/story-6-4-path-portability.test.ts test/resolve-readers.test.ts`：PASS，`3 files / 24 tests`；合计与Edge正式结果一致为`4 files / 123 tests`。
- `npm run docs:check`：PASS，`72 Markdown files / 5 drafts`。
- Canonical checker warn：PASS，`status=ok`、`findings=[]`、`changedPathCount=82`；impacted classes为`canonical-source-truth:D0`与`module-discovery-contract:D0`，`decisionRecordRequired=false`。
- Canonical checker strict（`--mode strict`）：PASS，`status=ok`、`findings=[]`，同一D0分类成立。
- Changed-package density：16个tracked changed Skill package及隔离的external drawer package共17个当前均`triggered_density_warning=false`；该结果仅是density evidence，不改变drawer ownership。
- `git diff --check`：PASS（无输出）。
- 本Aggregator未运行build、full suite或packaging；除本summary外未修改source、tests、Story、tracker、SPEC/docs、progress logs、CR TODO/rules或其它CR文件。

## Governance And Caveats（治理与限制）

- Current canonical inventory为`core=19`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=69`。其中untracked `speclite-drawer-er-modeler`及相关mirror/fixed-count状态属于并发外部范围；本轮不把它归因给Story 11.5，也不修改、回滚或纳入Story fix。
- Canonical warn/strict均为D0且无finding；developer hook要求的最终governance/packaging收口仍由root orchestrator在Epic最终阶段统一完成。本summary不替代最终runner gate。
- Round 7 P2必须保持visible：它既不是本轮P0/P1 blocker，也不是false positive或已解决项；CR05遗漏登记将构成closeout缺口。
- Mixed worktree含多Story与并发范围；本Aggregator只裁决Story 11.5 bounded surface，不据混合状态推断其他Story或外部变更归属。

## Next Gate（下一门禁）

进入 fresh Evaluator Round 8。Evaluator应独立验证 Round 7 P1 closure、三层`3/3 PASS`、AC1-AC11（含P2 caveat）及P2 defer的CR05义务。仅当latest Reviewer与latest Evaluator同时PASS后，才可依次进入CR04、CR05（登记Round 7 Finding #2 P2 TODO）与CR06。
