# CR Rules Summary

用于沉淀跨 Story 可复用的 CR 规则提炼结果，记录规则来源、量化升格判定、适用范围、落地位置与同步状态。

---

## 规则索引

| 规则编号 | 标题 | 来源 Story | 总分 | 建议去向 | 同步状态 |
|----------|------|------------|------|----------|----------|
| CR-API-01 | Existing-install 的不可用 manifest 不得伪装成默认版本 | 1-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-02 | Installed-state 检测必须校验触达的 manifest/index 内容与 schema | 1-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-SEC-01 | Target 与 installed-state 边界检查必须使用 no-follow 路径判断 | 1-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-DOC-01 | 写入确认前的 human output 必须展示可审计 target summary | 1-2 | 6/12 | rules-summary | 已写入规则总结 |
| CR-DOC-02 | Final pre-write install scope summary 必须绑定最终 selected module set | 1-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-TEST-01 | No-write 回归断言必须覆盖全部禁止写入路径并支持既有路径排除 | 1-2, 11-9 | 10/12 | rules-summary | 已写入规则总结 |
| CR-API-03 | 用户可见交互能力必须接入 command path 而非停留在 pure model | 1-3, 1-4, 10-1 | 8/12 | rules-summary | 已写入规则总结 |
| CR-API-04 | Internal InstallPlan 必须记录 selectedModules 且不得泄露到 public CommandResult | 1-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-05 | Module required_dependencies 必须在 metadata discovery 阶段确定性校验 | 1-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-06 | `module-help.csv` 的 canonicalSkillId 必须引用已发现 package root | 1-5 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-07 | 非事务写入失败必须通过已契约字段暴露 partial progress | 1-5, 4-4 | 8/12 | rules-summary | 已写入规则总结 |
| CR-SEC-02 | Installer-owned directory mutation 必须先通过 path-safety guard | 1-5 | 8/12 | rules-summary | 已写入规则总结 |
| CR-SEC-03 | `artifactContract.defaultOutputPath` 必须先 canonicalize 再做 root containment | 2-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-08 | `artifactContract` 只允许 stable artifact kind 与 workflow artifact root | 2-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-09 | `canonicalPackageHash` 必须基于 installed canonical entry copied surface | 2-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-10 | Help/phase mapped target 必须反查 `skill-index.installedTargets` | 2-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-11 | ReadyCheck 可读 index 的 target 语义错误必须保留 reserved `menu-target.*` 诊断 | 2-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-12 | Installed activation path basename 必须绑定对应 `canonicalSkillId` | 2-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-13 | Resolver schema anchor 必须解析真实 runtime result shape | 2-4, 11-1 | 9/12 | rules-summary | 已写入规则总结 |
| CR-API-14 | Installed activation 必须通过 `speclite resolve` runtime entry 获取配置与 customization | 2-4 | 8/12 | rules-summary | 已写入规则总结 |
| CR-SEC-04 | Artifact path public contract 必须先严格校验 POSIX-style 再做 filesystem normalization | 2-5 | 6/12 | rules-summary | 已写入规则总结 |
| CR-SEC-05 | `actualArtifactPath` containment 必须以 configured artifact root 为边界 | 2-5 | 7/12 | rules-summary | 已写入规则总结 |
| CR-SEC-06 | Public status path projection 必须拒绝未校验 installed-state paths | 3-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-15 | Installed-state index 读取必须区分 missing 与 corrupted | 3-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-16 | Skill index completeness 必须比对 selected canonical package root expected set | 3-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-17 | Canonical hash walker 必须在遍历阶段应用 candidate include 边界 | 3-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-SEC-07 | File integrity symlink 诊断必须先 no-follow 分类再决定 issue 语义 | 3-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-18 | Production artifact validation 必须消费 on-disk metadata entity | 3-4 | 8/12 | rules-summary | 已写入规则总结 |
| CR-API-19 | Config 派生的 public command result 字段必须复用 shared resolver | 4-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-SEC-08 | Symlink escape issue 必须基于 realpath boundary 而非 symlink 存在性 | 3-4 | 8/12 | rules-summary | 已写入规则总结 |
| CR-SEC-09 | Protected path classifier 结果必须优先于 files-index ownership | 4-1, 4-5 | 8/12 | rules-summary | 已写入规则总结 |
| CR-SEC-10 | File integrity ownership 检查必须使用 configured artifact root | 4-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-20 | Source trust evidence 缺失或 malformed 时 update planning 必须 fail closed | 4-3 | 8/12 | rules-summary | 已写入规则总结 |
| CR-TEST-02 | Command fixture 必须显式满足被测 gate 之前的前置 evidence | 4-3, 11-6, 11-8 | 10/12 | rules-summary | 已写入规则总结 |
| CR-SEC-11 | Safe-write stale temp 诊断必须覆盖同目录受控 roots | 4-4 | 7/12 | rules-summary | 已写入规则总结 |
| CR-SEC-12 | Safe-write cleanup failure 必须返回稳定 issue 而不是 raw error | 4-4 | 7/12 | rules-summary | 已写入规则总结 |
| CR-SEC-13 | Existing overwrite 必须执行 apply-time ownership/hash baseline preflight | 4-4 | 8/12 | rules-summary | 已写入规则总结 |
| CR-SEC-14 | Source label sanitizer 必须覆盖 token、query 和 fragment 后再进入 public projection | 5-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-SEC-15 | Private registry metadata client 调用必须先通过显式 runtime config 绑定 | 5-2 | 8/12 | rules-summary | 已写入规则总结 |
| CR-API-21 | Registry package identity 只能投影到 integrity evidence | 5-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-22 | Validate 必须本地校验 trustStatus 与 evidence verified 一致性 | 5-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-23 | Source evidence 必须驱动实际 install input，否则写入前阻塞 | 5-3 | 10/12 | rules-summary | 已写入规则总结 |
| CR-API-24 | Git source descriptor validate 必须拒绝非 full commit SHA evidence | 5-4 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-25 | Git commit evidence 必须经过 commit-ish verification 后才能写入 | 5-4 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-26 | Blocked SourceDescriptor 必须在 schema 与 runtime 写入边界双层 fail closed | 5-5 | 8/12 | rules-summary | 已写入规则总结 |
| CR-PROCESS-01 | 全仓 typecheck 既有债务必须用 Story touched surface 过滤裁决 | 5-5 | 7/12 | rules-summary | 已写入规则总结 |
| CR-TEST-03 | Semantic JSON fixture comparison 不得依赖对象字段插入顺序 | 6-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-TEST-04 | Stable fixture normalization 只能覆盖 schema-declared timestamp fields | 6-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-TEST-05 | Legacy activation negative pattern 必须用 canonical samples 自测 | 9-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-TEST-06 | Activation contract corpus discovery 必须结构化覆盖 canonical 与 installed mirror | 9-1 | 8/12 | rules-summary | 已写入规则总结 |
| CR-API-27 | Manifest 枚举字段必须绑定 executable registry schema | 6-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-28 | Normal update apply 成功后必须同步 installed-state projection | 6-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-29 | Conflict failure 输出必须同时保持 structured step state 与准确 summary | 6-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-30 | 环境级 terminal profile 禁色必须优先于显式 false option | 8-9 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-31 | 文档禁止的 module admission rule 必须绑定 executable gate | 10-4 | 8/12 | rules-summary | 已写入规则总结 |
| CR-DOC-03 | Companion SPEC mirror 必须同步契约收敛 wording | 6-6 | 5/12 | rules-summary | 已写入规则总结 |
| CR-DOC-04 | 已迁移 ecosystem package id 不得残留为 SDLC catalog/root/workflow | 10-6 | 9/12 | rules-summary | 已写入规则总结 |
| CR-SEC-16 | Compatibility script repair 必须绑定 artifact kind、target path 与 sourceRef | 9-2 | 8/12 | rules-summary | 已写入规则总结 |
| CR-API-32 | Installed-state selected-module validation 不得 core-only 或非 sdlc 短路 | 10-5 | 9/12 | rules-summary | 已写入规则总结 |
| CR-API-33 | Canonical governance map 必须覆盖 ecosystem source classification 与 ecosystem-only impact rule | 10-6 | 10/12 | rules-summary | 已写入规则总结 |
| CR-TEST-07 | Release packaging source assertion 必须动态覆盖全部 nested ecosystem modules | 10-5 | 9/12 | rules-summary | 已写入规则总结 |
| CR-SEC-17 | Release package inventory gate 必须排除 cache/temp/build/source-local dist 输出 | 10-5 | 9/12 | rules-summary | 已写入规则总结 |
| CR-API-34 | Artifact-root resolver handoff 必须保留 leaf dotted-key provenance | 11-1 | 10/12 | rules-summary | 已写入规则总结 |
| CR-API-35 | Fresh ReadyCheck 必须对 caller 与 manifest 的 optional additive projection 做 fail-closed reconciliation | 11-2 | 10/12 | rules-summary | 已写入规则总结 |
| CR-API-36 | `resolutionMode` 必须表达 field-level 来源语义而非 lifecycle 标签 | 11-2 | 9/12 | rules-summary | 已写入规则总结 |
| CR-PROCESS-02 | Owner correction 必须用 dated controlled correction 保留原决策轨迹 | 11-2 | 8/12 | rules-summary | 已写入规则总结 |
| CR-API-37 | Existing-state consumer 必须将 blocking artifact-root resolver issue fail closed | 11-3, 11-8 | 11/12 | rules-summary | 已写入规则总结 |
| CR-API-38 | Config/artifact mismatch 必须消费 consumer-filtered actual path evidence | 11-3 | 10/12 | rules-summary | 已写入规则总结 |
| CR-SEC-18 | Installer-owned namespace 必须优先于 overlapping artifact roots | 11-3 | 10/12 | rules-summary | 已写入规则总结 |
| CR-API-39 | Workflow artifact metadata schema 必须兼容 unknown future keys 且保持 required keys strict | 11-3 | 8/12 | rules-summary | 已写入规则总结 |
| CR-API-40 | Public resolver surfaces 必须区分 raw config 与 effective artifact-root resolution | 11-4 | 10/12 | rules-summary | 已写入规则总结 |
| CR-SEC-19 | Analysis artifact route selection 必须验证 portable basename 与 project-local readable regular candidate | 11-4 | 11/12 | rules-summary | 已写入规则总结 |
| CR-DOC-05 | Installed Markdown workflow 与 executable implementation 必须形成可定位、同源的双向 binding | 11-4, 11-6, 11-8, 11-9 | 11/12 | rules-summary | 已写入规则总结 |
| CR-API-41 | Whole/sharded selection 必须分离 canonical entry safety 与 selected graph validation | 11-5 | 11/12 | rules-summary | 已写入规则总结 |
| CR-SEC-20 | Artifact discovery 必须以 dereferenced regular-file 与 containment 证据决定消费资格 | 11-5, 11-7 | 11/12 | rules-summary | 已写入规则总结 |
| CR-DOC-06 | Bounded Markdown shard parser 必须 post-decode 分类、fail closed 并保持声明顺序 | 11-5 | 10/12 | rules-summary | 已写入规则总结 |
| CR-SEC-21 | Filesystem write 必须在 operation 内重验 physical owner 与 nearest existing ancestor | 11-6 | 11/12 | rules-summary | 已写入规则总结 |
| CR-DOC-07 | Bounded markup validator 必须与 renderer 的 precedence 和 character-reference 语义一致 | 11-6 | 10/12 | rules-summary | 已写入规则总结 |
| CR-API-42 | 多步骤 artifact producer 必须锁定单一 invocation identity 并复用 exact target | 11-7 | 10/12 | rules-summary | 已写入规则总结 |
| CR-TEST-08 | Contract corpus gate 必须按 surface role 分类 whole semantic candidate | 11-7, 11-8, 11-9 | 10/12 | rules-summary | 已写入规则总结 |
| CR-TEST-09 | 静态 evidence oracle 必须用稳定 mutant 证明 fail-closed reachability | 11-7 | 9/12 | rules-summary | 已写入规则总结 |
| CR-API-43 | Canonical identity rename 必须由实际 mutation action 承载 typed replacement 并保持幂等 | 11-8 | 11/12 | rules-summary | 已写入规则总结 |
| CR-API-44 | CR 目录身份必须单次解析并以 caller-frozen context 贯穿所有 leaf | 11-9 | 11/12 | rules-summary | 已写入规则总结 |
| CR-PROCESS-03 | CR 完成证据必须绑定同轮 predecessor graph 与 source freshness | 11-9 | 11/12 | rules-summary | 已写入规则总结 |
| CR-DOC-08 | 机器终态字段解析必须限定结构区域并对歧义语法 fail closed | 11-9 | 10/12 | rules-summary | 已写入规则总结 |

---

## Story 记录

<!-- 新 Story 规则沉淀记录追加在本章节下方，按日期升序或项目既有顺序排列。 -->

### Story 1-2 / 2026-05-26

- **Story**: 1-2
- **分析来源**:
  - `1-2-code-review-summary-20260526-round-1.md`
  - `1-2-code-review-evaluation-20260526-round-1.md`
  - `1-2-code-review-summary-20260526-round-2.md`
  - `1-2-code-review-evaluation-20260526-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 5 个 patch findings；Round 1 fixer 已全部修复并通过 `npm test -- --run test/target-directory.test.ts`、`npm test`、`npm run build`。
  - Round 2 reviewer/evaluator 均通过；5 个 findings 均关闭，新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5 (gpt-5.5)。本次按用户授权执行 record-only，仅写入本规则总结；全局文档已存在相近约束或需要更大范围确认，因此不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Existing-install 的不可用 manifest 不得伪装成默认版本 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Installed-state 检测必须校验触达的 manifest/index 内容与 schema | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Target 与 installed-state 边界检查必须使用 no-follow 路径判断 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| 写入确认前的 human output 必须展示可审计 target summary | 通过 | 6/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| No-write 回归断言必须覆盖全部禁止写入路径并支持既有路径排除 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-01：Existing-install 的不可用 manifest 不得伪装成默认版本

- **来源问题**: existing-install 在 `_speclite/` 存在但 manifest 缺失时，把未知 manifest 投影为默认 `speclite.manifest.v1`，导致 public JSON 和 human output 难以区分真实可读 manifest 与 unavailable 状态。
- **CR 证据**:
  - `1-2-code-review-summary-20260526-round-1.md`: Finding #1 指出 missing manifest 被回填为默认 manifest version。
  - `1-2-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题为 P1，需要修复，不能用默认版本伪装 unavailable manifest。
  - `1-2-code-review-evaluation-20260526-round-2.md`: evaluator 确认当前实现使用 `unavailable` sentinel，Finding #1 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer 与 evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 installer existing-install 报告和 command JSON/human output 投影。 |
  | 风险等级 | 2 | 会把未知 installed state 伪装为有效默认版本，削弱安全门禁和自动化判断。 |
  | 根因稳定性 | 1 | 属于实现习惯上的 fallback misuse，后续类似 projection 易复现。 |
  | 可执行性 | 2 | 可检查为 unavailable sentinel、issue 或 nextAction，不回填默认版本，并配套测试。 |
  | 文档缺口 | 0 | 现有 SPEC/Story 已有 manifest/index 与 public output 边界，相近约束已存在。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: installer、status、validate 等读取 existing installed state 并生成 public projection 的流程。
- **规避指南**:
  - 不得用当前默认 schema/version 常量填充不可读、缺失或未知的 installed-state manifest。
- **最佳实践**:
  - 对 unavailable state 使用稳定 sentinel、合规 `manifest-schema.*` issue 或明确 nextAction，并用 focused test 断言不会输出默认版本。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 与 manifest/index 相关 SPEC 已覆盖 public output 和 manifest/index 边界，本次不扩大到全局文档修改。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-02：Installed-state 检测必须校验触达的 manifest/index 内容与 schema

- **来源问题**: existing-install 检测只按路径存在性识别 installed-state index，没有读取或校验 index 内容，导致 malformed/unsupported index 可静默通过。
- **CR 证据**:
  - `1-2-code-review-summary-20260526-round-1.md`: Finding #2 指出 manifest/index 校验只覆盖 manifest.yaml，其他 index 文件损坏会被静默放过。
  - `1-2-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC5/Task 4，需复用 `manifest-schema.*` issue model。
  - `1-2-code-review-summary-20260526-round-2.md`: reviewer 确认四类 installed-state index 已读取和 schema 校验。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认并由复审验证关闭。 |
  | 影响范围 | 1 | 影响 existing-install 检测、installed summary 和后续 manifest/index 消费。 |
  | 风险等级 | 2 | 损坏 installed-state index 被静默接受会导致错误状态判断和后续安全风险。 |
  | 根因稳定性 | 1 | 路径存在性被误当成内容有效性，是易复现的实现缺口。 |
  | 可执行性 | 2 | 可用 schemaVersion/schema 校验和 `manifest-schema.*` issue 配套回归测试。 |
  | 文档缺口 | 0 | validation taxonomy 与 manifest/index SPEC 已有相近约束。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: 任何把 manifest/index 作为 installed-state evidence 的 install、status、validate、update/repair 前置检查。
- **规避指南**:
  - 不得只因 manifest/index 文件存在就视为可用 installed-state evidence。
- **最佳实践**:
  - 对当前流程触达的 manifest/index 逐项读取、解析、校验 schemaVersion 和关键字段；失败时复用已声明 issue taxonomy。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 已覆盖 installed manifest/index/schema version shape failures。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

### Story 1-3 / 2026-05-26

- **Story**: 1-3
- **分析来源**:
  - `1-3-code-review-summary-20260526-round-1.md`
  - `1-3-code-review-evaluation-20260526-round-1.md`
  - `1-3-code-review-summary-20260526-round-2.md`
  - `1-3-code-review-evaluation-20260526-round-2.md`
  - `1-3-code-review-summary-20260528-round-3.md`
  - `1-3-code-review-evaluation-20260528-round-3.md`
  - `1-3-code-review-summary-20260528-round-4.md`
  - `1-3-code-review-evaluation-20260528-round-4.md`
  - `1-3-code-review-summary-20260528-round-5.md`
  - `1-3-code-review-evaluation-20260528-round-5.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 3 个 findings，包含 1 个 `decision_needed` 和 2 个 `patch`；evaluator 将 3 项均评估为 P1 阻塞并要求 fixer 修复。
  - Round 1 fixer 已修复 3 项，并记录 `npm test` 通过 7 个 test files / 39 个 tests、`npm run build` 通过；验证后清理 `node_modules/` 和 `dist/`。
  - Round 2 reviewer/evaluator 均通过；3 个 findings 均关闭，新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5 (gpt-5.5)。本次按用户授权执行 record-only，仅写入本规则总结；全局文档已有相近契约锚点，且全局文档修改会扩大范围，因此不修改全局文档。
  - 2026-05-28 corrective CR reopen 中，Round 3/4 连续暴露 AC7 pre-write install scope summary 未绑定真实最终 selected module set 的问题；Round 5 reviewer/evaluator 均确认已关闭，findings 0，Fix Items: 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权采用默认推荐决策 record-only，仅追加一条已修复可复用规则；不修改全局文档，不新增 TODO。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 交互式模块选择必须接入 command path 而非停留在 pure model | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Internal InstallPlan 必须记录 selectedModules 且不得泄露到 public CommandResult | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Module required_dependencies 必须在 metadata discovery 阶段确定性校验 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Final pre-write install scope summary 必须绑定最终 selected module set | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-03：用户可见交互能力必须接入 command path 而非停留在 pure model

- **来源问题**: Story 1.3 要求用户可选择一个或多个 official modules，但首轮实现只在 `createModuleSelection` pure model 层支持 `userSelectedModuleIds`，`speclite install` command path 没有 prompt、参数或其他用户选择入口，导致 AC6 未真正落地。Story 1.4 再次出现同类问题：detailed config 的内部 model 支持 `values`、`selectedModuleIds` 和 `ideTargetIds`，但真实 CLI adapter 只收集 mode，用户无法调整 AC4 要求的字段。Story 10.1 再次复现同类边界：internal/programmatic module selection 与 prompt 文案已能展示 ecosystem category/id 信息，但 explicit interactive install 仍是一次 exact module code 输入，未真正接入 AC5 要求的 category -> ecosystem id 两级 command path。
- **CR 证据**:
  - `1-3-code-review-summary-20260526-round-1.md`: Finding #1 指出 CLI 只暴露 `[target-directory]`、`--json`、`--yes`，install orchestration 未传入 `userSelectedModuleIds`。
  - `1-3-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题为 P1，推荐不新增 public selection flag，而是在 human interactive path 增加受控多选入口。
  - `1-3-code-review-evaluation-20260526-round-2.md`: evaluator 确认 human interactive module selection 已接入 command path，invalid id 有 stable diagnostic，Finding #1 已关闭。
  - `1-4-code-review-summary-20260526-round-1.md`: Finding #1 指出 detailed config prompt 声称可调整 project fields、module artifact paths、selected modules 和 IDE targets，但 CLI 只解析 `{ mode }`。
  - `1-4-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题为 P1，需要在真实 CLI path 补齐 detailed config collection。
  - `1-4-code-review-evaluation-20260526-round-2.md`: evaluator 确认 CLI detailed path 已收集 core fields、SDLC module fields、selected modules 和 IDE targets，Finding #1 已关闭。
  - `10-1-code-review-summary-20260706-round-1.md`: Finding #1 指出 interactive install 仍是一次 exact module code 输入，没有实现 AC5 要求的 category -> ecosystem id 两级选择。
  - `10-1-code-review-evaluation-20260706-round-1.md`: evaluator 确认该发现为 P1 阻塞项，并要求补齐真实 CLI 两级交互、保留 programmatic exact module code selection 与 invalid diagnostic。
  - `10-1-code-review-evaluation-20260706-round-2.md`: evaluator 确认 `collectInteractiveModuleSelection(...)` 已接入 explicit interactive command path，两级 prompt、skip、backend -> java-springboot、unknown ecosystem id regression 均已覆盖，Round 1 P1 关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 1.3、Story 1.4 与 Story 10.1 均出现 pure/internal model 或 prompt display 支持但 command path 未暴露完整真实用户能力的问题，并均经后续复审验证关闭。 |
  | 影响范围 | 1 | 影响 install command orchestration、CLI prompt、module selection 和 project config initialization 交互边界。 |
  | 风险等级 | 1 | 会导致用户可见 AC 被 pure model 测试误判为已实现，但真实 command path 不可用。 |
  | 根因稳定性 | 1 | 属于 model 层和 command path 脱节的实现习惯，后续 CLI flow 容易复现。 |
  | 可执行性 | 2 | 可要求 command path 集成测试覆盖 prompt、多选、取消默认项和 invalid id diagnostic。 |
  | 文档缺口 | 1 | 全局已有 module selection/CommandResult 约束，但未细化“pure model 不等于用户入口”的检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: CLI command path 中需要把 pure domain model 暴露为用户可操作能力的 install、source selection、module selection、IDE selection 或 project config initialization 流程。
- **规避指南**:
  - 不得只因 pure model 支持用户输入参数，就把对应用户能力标记为 command path 已实现。
- **最佳实践**:
  - 用户可见能力必须有 command orchestration 入口、human/headless 边界策略、stable diagnostic 和 command-level integration tests；若 public flag matrix 未授权扩展，应优先使用已契约化 interactive path 或 no-write pending state。
  - 多阶段 interactive flow 必须用 command-level tests 覆盖真实 prompt 顺序、skip/empty answer、有效选择映射和 invalid diagnostic，不能只验证 pure helper 的数据结构或一次性 exact-code 输入。
- **全局文档建议**:
  - 不建议本次升格；该规则虽已跨 Story 复现，但属于 command orchestration / interactive path 的实现流程规则，且直接修改全局文档会扩大本次 Story 收尾范围。本次按用户授权 record-only 更新规则总结。
- **本次落地**:
  - Story 1.3 与 Story 1.4 的 Round 1 fixer 均已修复，Round 2 evaluator 均确认关闭。
  - Story 10.1 的 Round 1 fixer 已修复 AC5 两级 interactive install，Round 2 evaluator 确认关闭；本次 04 仅更新既有规则证据，不新增规则编号。
- **同步状态**: 已写入规则总结

#### CR-API-04：Internal InstallPlan 必须记录 selectedModules 且不得泄露到 public CommandResult

- **来源问题**: 首轮实现只把 selected modules 投影到 human-readable summary，没有构造并校验 internal `InstallPlan.selectedModules`；同时 Story 明确禁止把 selected modules 新增到 public `CommandResult<InstallCommandData>`。
- **CR 证据**:
  - `1-3-code-review-summary-20260526-round-1.md`: Finding #2 指出 `InstallPlanSchema.selectedModules` 已定义，但 install path 只生成 summary，没有 internal executable plan。
  - `1-3-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 Story Task 6 与 Install Plan contract，要求构造 internal plan 且不新增 public JSON 字段。
  - `1-3-code-review-evaluation-20260526-round-2.md`: evaluator 确认 internal `InstallPlan` 已由 install path 构造并返回，public `CommandResult` 未暴露 `selectedModules`，Finding #2 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，且复评验证关闭。 |
  | 影响范围 | 1 | 影响 install planning contract、command outcome 和 public JSON projection 边界。 |
  | 风险等级 | 1 | internal plan 缺失会削弱后续 Story 消费 selected modules 的可靠性；泄露到 public JSON 会破坏契约。 |
  | 根因稳定性 | 1 | 人类摘要、internal plan 与 public JSON 三层投影容易混淆，后续命令可能复现。 |
  | 可执行性 | 2 | 可通过 `InstallPlanSchema.parse`、public result negative assertion 和 focused tests 检查。 |
  | 文档缺口 | 1 | Install Plan 与 CommandResult 约束已存在，但本规则细化了 selectedModules 的 internal/public 分层。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: install/update/repair 等有 internal plan 与 public command result 分层的 command orchestration。
- **规避指南**:
  - 不得用 human-readable summary 替代 internal executable plan；也不得为方便测试把 internal selected/planned state 直接塞进 public `CommandResult`。
- **最佳实践**:
  - 在 internal schema anchor 中构造并校验 plan state；public JSON 只暴露 owning SPEC 已声明字段，并用 negative assertion 防止未契约化字段泄露。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 与 `01-command-result-json-contract.md` 已拥有相关真源，本次作为 CR 实践记录即可。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-05：Module required_dependencies 必须在 metadata discovery 阶段确定性校验

- **来源问题**: 首轮实现读取 `required_dependencies` 后只在 module selection 递归时 best-effort 添加依赖；未知 dependency id 会被静默忽略，无法在 metadata/schema 边界产生 deterministic diagnostic。
- **CR 证据**:
  - `1-3-code-review-summary-20260526-round-1.md`: Finding #3 指出 module metadata discovery 未校验 dependency id 是否存在，selection 层遇到未知 dependency 直接 `return`。
  - `1-3-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC6 的 required dependency 显式语义，要求 metadata discovery 阶段阻断并输出 stable issue code。
  - `1-3-code-review-evaluation-20260526-round-2.md`: evaluator 确认 unknown dependency 已抛出 `module-metadata.unknown-required-dependency`，并通过 install path 输出 deterministic diagnostic reason，Finding #3 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认并由 Round 2 验证关闭。 |
  | 影响范围 | 1 | 影响 module metadata parser、module selection dependency semantics 和 install failure diagnostic。 |
  | 风险等级 | 1 | 静默忽略依赖会让 bundled metadata 拼写错误延后暴露，破坏 deterministic install diagnostics。 |
  | 根因稳定性 | 1 | 把 schema-level invariants 留到 consumer best-effort 处理是稳定易复现的边界缺口。 |
  | 可执行性 | 2 | 可通过 metadata discovery 校验、stable error code 和 install diagnostic mapping tests 检查。 |
  | 文档缺口 | 1 | 全局已有 module metadata/selection 边界，但未单独沉淀 dependency existence 必须在 discovery 阶段校验。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: bundled source module metadata、package metadata、adapter dependency 或任何由 metadata 声明引用关系的 discovery/parser 阶段。
- **规避指南**:
  - 不得在 consumer 或 renderer 中静默忽略 metadata 声明的未知引用，也不得把缺失 dependency 当作空依赖继续执行。
- **最佳实践**:
  - 在 discovery/parser 阶段一次性收集可引用 id 集合并校验引用存在；失败时输出 stable diagnostic code，并在 command path 保留 reason mapping 和 no-write 断言。
- **全局文档建议**:
  - 不建议本次升格；当前仅 Story 1.3 触发一次，且规划文档已有 module metadata 与 diagnostics 边界。后续多 Story 复现时再考虑进入 metadata/parser guideline。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-DOC-02：Final pre-write install scope summary 必须绑定最终 selected module set

- **来源问题**: Story 1.3 AC7 要求 install scope summary 在任何 project file write 前展示，并包含每个 selected module 的 canonical package root count。Corrective CR Round 3 发现 canonical package root count 只出现在未真正展示的 config summary 或写入后的 ready summary；Round 4 进一步发现 pre-write summary 虽已出现，但在 detailed config 可改变 selected modules 后，summary 仍绑定配置前的临时 module set，可能展示 `core=13, sdlc=40, total=53`，实际只安装 `core`。
- **CR 证据**:
  - `1-3-code-review-summary-20260528-round-3.md`: Finding #1 指出 canonical package root count 没有真正出现在成功路径的写入前展示结果中，分类为 `patch`。
  - `1-3-code-review-evaluation-20260528-round-3.md`: evaluator 确认该 finding 有效，要求在成功路径写入前展示 / 确认 canonical package root count。
  - `1-3-code-review-summary-20260528-round-4.md`: Finding #1 指出 pre-write package root count summary 可能与最终 selected module set 不一致。
  - `1-3-code-review-evaluation-20260528-round-4.md`: evaluator 确认 detailed config 可以在 pre-write summary 后改变 selected module set，因此需要在最终 selected module set 和 `configPlan` 确定后、`applyInstallPlan(...)` 前生成最终 summary / confirmation。
  - `1-3-code-review-evaluation-20260528-round-5.md`: evaluator 确认 Round 4 P1 已关闭，Fix Items: 0。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story corrective CR 中连续 Round 3/4 暴露同类 pre-write summary 绑定错误，并由 Round 5 验证关闭。 |
  | 影响范围 | 1 | 影响 install command 的 human confirmation、module selection、detailed config 和 write authorization 顺序。 |
  | 风险等级 | 1 | 用户可能基于错误的 canonical package root count 授权写入，导致确认内容与实际安装范围不一致。 |
  | 根因稳定性 | 1 | 多阶段交互中先生成 summary、后改变 final selection/config 的实现顺序容易在后续 flow 中复现。 |
  | 可执行性 | 2 | 可通过 callback 时序断言、no-write assertion 和 selected module count regression test 检查。 |
  | 文档缺口 | 1 | InstallPlan / CommandResult SPEC 已覆盖 pre-write planning，但未细化 final human summary 必须基于最终 selected module set。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: `speclite install` 及未来所有先收集用户配置、再执行写入的 CLI human flow。
- **规避指南**:
  - 不得在用户仍可改变 module/config selection 之前生成最终 pre-write install scope summary，也不得把写入后的 ready summary 当作 AC7 的 pre-write confirmation。
- **最佳实践**:
  - 先解析最终 selected module set 和 config plan，再生成 human-visible pre-write summary；summary 必须在 write/apply 前确认，并由 regression test 覆盖 final selected modules、canonical package root count 和 no-write timing。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 已有 pre-write planning/confirmation 真源，本次只作为 Story 1-3 corrective CR 的可复用实践记录。
- **本次落地**:
  - Round 4 fixer 已修复，Round 5 reviewer/evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-SEC-01：Target 与 installed-state 边界检查必须使用 no-follow 路径判断

- **来源问题**: target root 和 installed-state 子路径检查存在 symlink 跟随风险，普通文件 target 也可能被误分类为 non-empty directory。
- **CR 证据**:
  - `1-2-code-review-summary-20260526-round-1.md`: Finding #3 指出 regular file 与 symlink target 未安全区分，存在 path escape/误分类风险。
  - `1-2-code-review-evaluation-20260526-round-1.md`: evaluator 将该问题评估为 P1，要求明确区分普通文件、symlink 与 unsafe target。
  - `1-2-code-review-evaluation-20260526-round-2.md`: evaluator 确认 no-follow 区分 symlink、regular-file 与 installed-state boundary，Finding #3 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 的 reviewer/evaluator 均确认并复审关闭。 |
  | 影响范围 | 1 | 影响 target directory inspection 与 installed-state boundary detection。 |
  | 风险等级 | 2 | symlink/path escape 可能导致后续写入或检测越界。 |
  | 根因稳定性 | 1 | 文件系统检查若默认跟随路径，后续模块易重复犯错。 |
  | 可执行性 | 2 | 可要求 `lstat`/no-follow、unsafe issue、focused symlink/regular-file tests。 |
  | 文档缺口 | 0 | architecture 和 validation taxonomy 已有 symlink/path escape 总体约束。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: target project boundary、runtime path、manifest/index、artifact path、IDE mirror path 等文件系统边界检查。
- **规避指南**:
  - 不得在安全边界判断中用默认 follow 行为读取 symlink target 下的 installed state。
- **最佳实践**:
  - 先用 no-follow `lstat` 判断目标路径类型；对 symlink/path escape 返回合规 issue；测试覆盖 symlink target、symlink runtime root、regular file target 和 broken/unsafe path。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md` 已有 `fs/` 阻断 symlink escape、path escape 和 unsafe overwrite 的约束。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-DOC-01：写入确认前的 human output 必须展示可审计 target summary

- **来源问题**: target confirmation gate 依赖人类确认，但 human-readable output 未显示 display-safe target root、directory state、existing runtime、manifest version、IDE target statuses 和 next action。
- **CR 证据**:
  - `1-2-code-review-summary-20260526-round-1.md`: Finding #4 指出 human-readable output 未满足 target summary 和 existing-install 详情要求。
  - `1-2-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC2/AC4/AC5，是确认前审计性缺口。
  - `1-2-code-review-evaluation-20260526-round-2.md`: evaluator 确认 summary/human renderer 已覆盖 target、directory state、runtime、manifest、IDE targets 与 next actions。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认并复审关闭。 |
  | 影响范围 | 1 | 影响 install confirmation gate 的 CLI human-readable 审计体验。 |
  | 风险等级 | 1 | 可能导致用户无法确认实际影响路径或 existing state。 |
  | 根因稳定性 | 1 | JSON 与 human output 分层时容易遗漏人类确认所需字段。 |
  | 可执行性 | 2 | 可用 output 文案断言检查 display-safe target、state、manifest、IDE targets 和 next action。 |
  | 文档缺口 | 0 | command-result SPEC 已说明 human-readable 可以更丰富且遵循 display-safe policy。 |

- **总分**: 6/12
- **建议去向**: rules-summary
- **适用范围**: 需要用户确认后才允许写入的 CLI flows，特别是 target/project root、update/repair plan 和 conflict resolution。
- **规避指南**:
  - 不得只在 JSON 中保留确认依据，而让 human-readable confirmation 缺少 target 与状态明细。
- **最佳实践**:
  - human summary 至少展示 display-safe target、状态、检测到的 runtime/manifest/target 信息、是否 no-write，以及下一步动作。
- **全局文档建议**:
  - 不建议本次升格；现有 command-result contract 已给出 human-readable 与 public JSON 边界，本规则作为 Story 级实践记录即可。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-TEST-01：No-write 回归断言必须覆盖全部禁止写入路径并支持既有路径排除

- **来源问题**: no-write 测试只检查部分路径，未覆盖 `_speclite`、operation lock、safe-write temp、manifest/index 等 Story 禁止写入路径，也未完整覆盖边界分支。Story 11.9 Round 1-3 再次暴露同根因：ambiguity/unbound/invalid-context blocker 的 zero-mutation 证明只覆盖单个 synthetic case 或 filesystem subset，没有同时冻结 runner progress、round artifact、goal record、temp、Story 与 trackers 的全部 mutation surface。
- **CR 证据**:
  - `1-2-code-review-summary-20260526-round-1.md`: Finding #5 指出 no-write 与边界测试覆盖不足。
  - `1-2-code-review-evaluation-20260526-round-1.md`: evaluator 确认该测试缺口为 P2，建议同轮修复并注意 preexisting paths 排除。
  - `1-2-code-review-evaluation-20260526-round-2.md`: evaluator 确认 no-write assertion 覆盖 `_speclite`、`_speclite-output`、IDE mirrors、operation lock、temp/safe-write paths、manifest/index，并支持 preexisting paths。
  - `11-9-code-review-evaluation-20260905-round-1.md`: Findings #5/#6 确认 I/O/ambiguity block 必须返回 stable redacted single JSON，并证明 CR artifacts、runner progress、Story 与 trackers 均零 mutation。
  - `11-9-code-review-evaluation-20260905-round-2.md`: Finding #4 确认 runner-wide zero-mutation 不能只覆盖单一 synthetic unbound case，必须覆盖完整 blocked reason matrix。
  - `11-9-code-review-evaluation-20260905-round-3.md`: Finding #5 确认每类 blocker 的 stable reason 与 zero-mutation surface 必须一一绑定；后续 Round 24 双 PASS 确认闭合。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 1.2 与 11.9 均出现仅检查部分禁止写入面导致 zero-mutation 证明不足。 |
  | 影响范围 | 2 | 影响 install/update 类写入门禁以及 CR runner 的 artifact、progress、Story、tracker 与临时状态。 |
  | 风险等级 | 2 | 阻断路径漏写检查可能让歧义或无效 identity 在失败前留下可被后续恢复误认的持久状态。 |
  | 根因稳定性 | 2 | mutation surface 随工作流扩展时，共享 no-write helper 和 blocked matrix 很容易遗漏新路径或新状态面。 |
  | 可执行性 | 2 | 可通过共享 assertion helper、preexisting path whitelist 和 focused branch tests 检查。 |
  | 文档缺口 | 1 | 全局 no-write/writeAuthorized 语义存在，但测试 helper 覆盖策略未充分细化。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: install/update/repair 等 pre-confirmation/dry-run gate，以及 CR runner 的 ambiguity、invalid identity、invalid context 与 filesystem failure blocker tests。
- **规避指南**:
  - 不得只断言一两个 output directory 未创建，就宣称 no-write gate 已被测试覆盖。
- **最佳实践**:
  - no-write helper 应列出全部 forbidden paths，并允许 existing-install fixture 标记 preexisting paths，避免把已有状态误判为本次命令写入。
  - 多阶段 runner 还应在每个 stable blocker 前后 snapshot round artifacts、goal records、temp、progress、Story 与 trackers，并对完整 reason matrix 逐类证明零 mutation。
- **全局文档建议**:
  - 不建议本次升格；该规则更偏测试实践，暂记录到 CR rules summary，后续多 Story 重复出现后再考虑进入 test guideline。
- **本次落地**:
  - Story 1.2 Round 1 fixer 已修复，Round 2 evaluator 确认关闭；Story 11.9 Round 1-3 fixer 扩展 runner-wide blocked matrix 与全 mutation surface，Round 24 Reviewer/Evaluator 确认保持关闭。
- **同步状态**: 已写入规则总结

### Story 1-4 / 2026-05-26

- **Story**: 1-4
- **分析来源**:
  - `1-4-code-review-summary-20260526-round-1.md`
  - `1-4-code-review-evaluation-20260526-round-1.md`
  - `1-4-code-review-summary-20260526-round-2.md`
  - `1-4-code-review-evaluation-20260526-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 `patch` findings：detailed config CLI 字段调整缺失、rejected artifact path public 输出泄露；fixer 已修复 2 项，并记录 `npm ci`、`npm test`、`npm run build`、再次 `npm test` 均通过。
  - Round 2 reviewer/evaluator 均通过；2 个 findings 均关闭，新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5 (gpt-5.5)。本次按用户授权执行默认推荐决策：无新增规则；仅 record-only 更新既有 `CR-API-03` 证据与评分，不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 用户可见交互能力必须接入 command path 而非停留在 pure model | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only 更新既有 CR-API-03 |
| Rejected artifact path 的 public issue projection 必须 redaction-safe | 未通过（不重复：否） | 7/12 | none | 无需新增规则；既有 CommandResult / Manifest / ValidationIssue SPEC 已覆盖 |

#### 无需新增规则记录

- **无需新增规则**: 本 Story 没有产生新的 `CR-{DOMAIN}-{NN}` 规则。
- **已更新既有规则**: `CR-API-03` 增补 Story 1.4 证据，`复现频次` 从单 Story 提升为跨 Story，`总分` 从 7/12 更新为 8/12，最终去向仍为 `rules-summary`。
- **不沉淀候选**: `Rejected artifact path` 问题有明确 CR 证据、可规则化且已解决，但 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`、`04-manifest-index-contract.md` 和 `07-validation-issue-taxonomy.md` 已明确覆盖 public path / `affectedPath` / `details` 的 redaction-safe 要求；按“不重复”硬性门槛不新增规则，也不修改全局文档。
- **05 TODO Tracker 交接**: Round 2 evaluation 明确 CR TODO 0，本次无未解决非阻塞项需要交给 05。

### Story 1-5 / 2026-05-27

- **Story**: 1-5
- **分析来源**:
  - `1-5-code-review-summary-20260526-round-1.md`
  - `1-5-code-review-evaluation-20260526-round-1.md`
  - `1-5-code-review-summary-20260527-round-2.md`
  - `1-5-code-review-evaluation-20260527-round-2.md`
  - `1-5-code-review-summary-20260528-round-3.md`
  - `1-5-code-review-evaluation-20260528-round-3.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 3 个高严重性 `patch` findings：IDE mirror directory mutation 安全、`module-help.csv` 到 canonical package 的完整性校验、写入中途失败后的 public failure progress 表达；fixer 已修复 3 项，并记录定向测试、`npm test`、`npm run build` 均通过。
  - Round 2 reviewer/evaluator 均通过；3 个 findings 均关闭，新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5 (gpt-5.5)。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局文档已有相近安全、metadata 和 CommandResult 边界约束，且全局文档修改会扩大范围，因此不修改全局文档。
  - 2026-05-28 corrective CR reopen 中，Round 3 reviewer/evaluator 均通过，findings 0，Fix Items 0，CR TODO 0；Round 1 的 3 个规则来源问题仍保持关闭。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权采用默认推荐决策 record-only，仅补充 round 3 证据与无新增规则结论；不修改全局文档，不新增 TODO。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Installer-owned directory mutation 必须先通过 path-safety guard | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| `module-help.csv` 的 canonicalSkillId 必须引用已发现 package root | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| 非事务写入失败必须通过已契约字段暴露 partial progress | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

#### Round 3 补充结论

- **无需新增候选规则**: Round 3 corrective CR reopen 未产生新的 finding；无可进入升格评分的新增候选规则。
- **本次处理**: 仅补充 round 3 review/evaluation 来源和既有规则仍保持关闭的证据，不新增 `CR-{DOMAIN}-{NN}` 编号。

### 提炼规则

#### CR-SEC-02：Installer-owned directory mutation 必须先通过 path-safety guard

- **来源问题**: IDE mirror entry root 在 `copyCanonicalPackage` 中通过 raw `mkdir` 创建，目录 mutation 发生在 symlink / project-boundary / case conflict 等 path-safety guard 之前；当 `.claude` 或 `.agents` 是项目外 symlink 时，可能先在项目边界外创建目录。
- **CR 证据**:
  - `1-5-code-review-summary-20260526-round-1.md`: Finding #1 指出 `.claude/skills/<canonicalSkillId>` 或 `.agents/skills/<canonicalSkillId>` 的 raw `mkdir` 先于 `safeWriteFile` 安全校验执行。
  - `1-5-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC2 与 AC6/AC7，评估为 P1 阻塞项。
  - `1-5-code-review-evaluation-20260527-round-2.md`: evaluator 确认 `copyCanonicalPackage` 已改为调用 `ensureSafeDirectory`，并有 `.claude` / `.agents` symlink regression tests 断言外部目录未创建。
  - `1-5-code-review-evaluation-20260528-round-3.md`: evaluator 确认该关闭状态未被 corrective changes 破坏，mirror entry root 仍经过 `copyCanonicalPackage`、`ensureSafeDirectory` 和 `validateProjectPath`。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 的 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 IDE mirror directory creation，并可复用于 runtime、artifact、manifest/index 等 installer-owned directory mutation。 |
  | 风险等级 | 2 | 目录创建可能越过项目边界或跟随 symlink，在外部路径留下 mutation。 |
  | 根因稳定性 | 1 | raw filesystem helper 绕过安全 primitive 是后续文件系统写入模块容易复现的实现习惯。 |
  | 可执行性 | 2 | 可要求统一使用 safe directory primitive，并用 symlink、case conflict、path escape regression tests 检查。 |
  | 文档缺口 | 1 | 现有全局文档已有 path-safety 总体边界，但未在 CR 规则中沉淀 directory mutation 也必须先过 guard 的实现检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: installer-owned runtime、artifact、IDE mirror、manifest/index 目录创建和复制流程。
- **规避指南**:
  - 不得在任何 installer-owned directory mutation 中直接调用 raw `mkdir`、copy helper 或递归目录创建，绕过 project-boundary、symlink、case conflict 和 unsafe overwrite 检查。
- **最佳实践**:
  - 目录创建与文件写入使用同一套 path-safety primitive；新增 mirror/artifact/runtime path 时同步补 symlink escape、path escape 和 external mutation negative tests。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md` 与 Story AC 已覆盖 path-safety 总原则，本次仅 record-only 沉淀 CR 实践，不扩大到全局文档修改。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；Round 3 evaluator 确认仍保持关闭。
- **同步状态**: 已写入规则总结

#### CR-API-06：`module-help.csv` 的 canonicalSkillId 必须引用已发现 package root

- **来源问题**: module discovery 读取 `module-help.csv` 后，只校验 module 至少存在 package roots，未校验每个 help row 的 `canonicalSkillId` 是否对应已发现 canonical package root；缺失引用会被 mirror/help/phase projection 静默过滤。
- **CR 证据**:
  - `1-5-code-review-summary-20260526-round-1.md`: Finding #2 指出 orphan help row 不会生成 mirror entry、help index 或 phase coverage，也不会产生 blocking diagnostic。
  - `1-5-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC9，要求使用 reserved issue id 或既有契约化 diagnostic。
  - `1-5-code-review-evaluation-20260527-round-2.md`: evaluator 确认 discovery 阶段新增 `module-metadata.unknown-help-skill` 校验，并通过 install diagnostic 映射和双层测试覆盖。
  - `1-5-code-review-evaluation-20260528-round-3.md`: evaluator 确认缺失 help reference 校验仍保持关闭，同时确认 writer 从 package roots 而非 help rows 生成安装清单。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认并由 Round 2 验证关闭；与 CR-API-05 的 metadata 引用校验有同类复现迹象。 |
  | 影响范围 | 1 | 影响 module metadata discovery、IDE mirror planning、help index 和 phase coverage projection。 |
  | 风险等级 | 1 | 静默丢弃 help row 会生成不完整 installed projection，后续验证或 ReadyCheck 可能基于错误状态。 |
  | 根因稳定性 | 1 | metadata 引用关系若留给 consumer best-effort filter，后续新增引用字段时容易复现。 |
  | 可执行性 | 2 | 可在 discovery 阶段对 canonical id 集合做确定性校验，并用 parser/install orchestration tests 检查。 |
  | 文档缺口 | 1 | 现有规则已有 dependency 引用校验，但 `module-help.csv` 到 package root 的 canonical identity 约束需要单独沉淀。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: bundled module metadata、help/menu projection、phase coverage、IDE mirror package discovery 中的 canonical id 引用关系。
- **规避指南**:
  - 不得对 `module-help.csv`、phase coverage 或 metadata 中的 canonical skill id 做静默 filter；缺失 package root 必须阻断并输出稳定 diagnostic。
- **最佳实践**:
  - 在 discovery/parser 阶段先收集 package root basename 集合，再校验所有 metadata/help 引用；command path 保留 deterministic reason code，并断言 no-write。
- **全局文档建议**:
  - 不建议本次升格；该规则与 metadata/parser 实践相关，且全局文档修改会扩大范围。本次记录到 CR rules summary，后续多 Story 复现时再考虑统一到 metadata guideline。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；Round 3 evaluator 确认仍保持关闭。
- **同步状态**: 已写入规则总结

#### CR-API-07：非事务写入失败必须通过已契约字段暴露 partial progress

- **来源问题**: `applyInstallPlan` 在 runtime/config/artifact writes 已完成后若 IDE mirror 或 manifest/index 写入失败，只返回 issue；`runInstallCommand` 固定使用 config initialization completed steps，隐藏已完成的 write-phase mutations。Story 4.4 再次暴露同类问题：多个 safe write 已成功后，后续失败路径没有把此前完成的 `changedPaths` 投影到 stable diagnostics。
- **CR 证据**:
  - `1-5-code-review-summary-20260526-round-1.md`: Finding #3 指出 public failure output 无法表达 runtime/artifact 已完成但后续写入失败的 partial state。
  - `1-5-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC10/Task 7，要求只使用 `completedSteps` / `pendingSteps` 等已契约字段表达。
  - `1-5-code-review-evaluation-20260527-round-2.md`: evaluator 确认失败分支已返回 `completedSteps` / `pendingSteps` partial progress，未新增 `failedStep`、`changedPaths`、`readySummary` 或 ad-hoc blob。
  - `1-5-code-review-evaluation-20260528-round-3.md`: evaluator 确认 partial progress 与 public output 边界仍保持关闭，failure path 不泄露未契约字段。
  - `4-4-code-review-summary-20260601-round-1.md`: Finding #1 指出 install apply partial failure 不记录此前已成功 rename 的 project-relative `changedPaths`。
  - `4-4-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题为 P1，需要在 apply orchestration 层维护 operation-local changed paths。
  - `4-4-code-review-evaluation-20260601-round-2.md`: evaluator 确认 changed paths 已在失败 issue details 和 install `nextActions` 中稳定投影，问题关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 1-5 与 Story 4-4 均出现多阶段非事务写入失败隐藏 partial progress 的问题，并经后续复审关闭。 |
  | 影响范围 | 1 | 影响 install write phase failure output，也适用于 update/repair 等非事务写入流程。 |
  | 风险等级 | 1 | partial mutation 被隐藏会误导人工恢复、validate/repair 入口和自动化诊断。 |
  | 根因稳定性 | 1 | 非事务流程若只返回单一 issue，后续多阶段写入命令容易重复隐藏 progress。 |
  | 可执行性 | 2 | 可通过 stable lifecycle step 列表、failure-path tests 和 public JSON negative assertions 检查。 |
  | 文档缺口 | 1 | CommandResult contract 已有字段，但 CR 规则需要沉淀“不得用固定 pending steps 覆盖 partial mutation”的实现检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: install/update/repair 等本地文件系统非事务写入命令的 failure path。
- **规避指南**:
  - 不得在多阶段写入失败时固定回退到 pre-write completed steps，也不得声称 rollback 或隐藏已完成 mutation。
- **最佳实践**:
  - writer 返回 stable lifecycle `completedSteps` / `pendingSteps` partial progress；发生 rename 成功后的 mutation 时，operation orchestration 必须只把实际完成的 project-relative paths 追加到 `changedPaths`，command 层只映射到 owning SPEC 已声明字段，并用 negative assertions 防止泄露未契约字段。
- **全局文档建议**:
  - 不建议本次升格；现有 CommandResult / install lifecycle 文档已有总体字段契约，本次按用户授权只记录到 CR rules summary。
- **本次落地**:
  - Story 1-5 Round 1 fixer 已修复，Round 2 evaluator 确认关闭；Round 3 evaluator 确认仍保持关闭。Story 4-4 Round 1 fixer 已修复 changed paths 投影，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 与 Round 3 evaluation 均明确 CR TODO 0，本次未识别未解决的非阻塞改进项。
- **无需新增规则记录**: Round 3 corrective CR reopen 未产生新的 finding；本次 04 仅补充已关闭证据，不新增 `CR-{DOMAIN}-{NN}` 规则。

### Story 2-5 / 2026-05-27

- **Story**: 2-5
- **分析来源**:
  - `2-5-code-review-summary-20260527-round-1.md`
  - `2-5-code-review-evaluation-20260527-round-1.md`
  - `2-5-code-review-summary-20260527-round-2.md`
  - `2-5-code-review-evaluation-20260527-round-2.md`
  - `2-5-code-review-summary-20260527-round-3.md`
  - `2-5-code-review-evaluation-20260527-round-3.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 P1 artifact path structural validation 问题：`actualArtifactPath` 可逃出 configured/default artifact root，以及反斜杠 public artifact path 被 normalize 后放行；同时确认 1 个 P2 非阻塞 TODO：`generatedAt` validator 只接受 `Date.toISOString()` canonical UTC millisecond form，可能比 parseable ISO 8601 contract 更窄。
  - Round 1 fixer 修复 P1 后，Round 2 reviewer/evaluator 发现 containment 被过度收窄为必须位于 `defaultOutputPath` 下；Round 2 fixer 将 `actualArtifactPath` containment 调整为 `configuredRoot` 边界并补 regression。
  - Round 3 reviewer/evaluator 均通过；`generatedAt` 继续交给 05 TODO Tracker；`skillCount=54` vs fixture `53` 被 evaluator 判定为真实 fixture drift，但不属于 Story 2.5 CR TODO 或本轮修复范围。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局 PRD / Architecture / owning SPEC 已有 path 和 artifact contract 原则，且全局文档修改会扩大范围，因此不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Artifact path public contract 必须先严格校验 POSIX-style 再做 filesystem normalization | 通过 | 6/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| `actualArtifactPath` containment 必须以 configured artifact root 为边界 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| `generatedAt` validator 接受范围比 Story contract 更窄 | 通过 | N/A | todo-tracker | 已确认 P2 非阻塞项，交给 05 TODO Tracker；不写入规则总结 |

### 提炼规则

#### CR-SEC-04：Artifact path public contract 必须先严格校验 POSIX-style 再做 filesystem normalization

- **来源问题**: `validateArtifactPathContract` 在进入 filesystem normalization 前未严格校验 artifact public path，导致 `_speclite-output\\planning-artifacts\\report.md` 这类反斜杠路径被 normalize 为 POSIX path 后通过，违背 Story 2.5 对 artifact root、default output path 和 actual artifact path 的 project-relative POSIX-style public contract。
- **CR 证据**:
  - `2-5-code-review-summary-20260527-round-1.md`: Finding #2 指出 artifact path validator 会放行反斜杠路径，未强制 POSIX-style public path contract。
  - `2-5-code-review-evaluation-20260527-round-1.md`: evaluator 确认该问题为 P1，要求在 normalization 前复用严格 project-relative POSIX-style predicate。
  - `2-5-code-review-evaluation-20260527-round-3.md`: evaluator 确认 `configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 三个 role 的反斜杠输入均已由 regression 覆盖，Round 1 P1 未回退。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 3 复审验证关闭。 |
  | 影响范围 | 1 | 影响 artifact contract validator 与后续 manifest/evidence/fixture 对 public artifact path 的消费。 |
  | 风险等级 | 1 | 会让 Windows-style 或 mixed-separator public paths 进入通过态，造成跨平台和 snapshot 审计噪音。 |
  | 根因稳定性 | 1 | 把 filesystem normalization 当成 public contract normalization 是路径处理代码中容易复现的边界误用。 |
  | 可执行性 | 2 | 可在 validator 入口调用 strict POSIX predicate，并用三个 path role 的反斜杠 regression 检查。 |
  | 文档缺口 | 0 | PRD / Architecture / owning SPEC 已有 project-relative POSIX-style path 原则，本规则沉淀实现检查点。 |

- **总分**: 6/12
- **建议去向**: rules-summary
- **适用范围**: artifact contract validator、manifest/index path projection、validation issue path 投影和 fixture comparison 中所有 public artifact path 字段。
- **规避指南**:
  - 不得先把 public path 中的反斜杠、drive letter、absolute path、`..` 或重复 separator normalize 成可接受路径后再判断契约是否有效。
- **最佳实践**:
  - 在 filesystem path resolution 前先执行 strict project-relative POSIX-style predicate；只有 public contract 合法后，才进入 project boundary、symlink 和 writability 等 filesystem safety check。
- **全局文档建议**:
  - 不建议本次升格；全局文档已有 project-relative POSIX path 原则，本次作为 Story 2.5 CR 实践记录即可。
- **本次落地**:
  - Round 1 fixer 已修复，Round 3 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-SEC-05：`actualArtifactPath` containment 必须以 configured artifact root 为边界

- **来源问题**: Round 1 fixer 初次修复错误 root 放行时，将 `actualArtifactPath` containment 过度收窄为必须位于 `defaultOutputPath` 下，导致位于 broader `configuredRoot` 内、但属于 sibling workflow output path 的合法 artifact 被误判为 `outside-default-output-path`。
- **CR 证据**:
  - `2-5-code-review-summary-20260527-round-1.md`: Finding #1 指出 `actualArtifactPath` 未校验位于 configured/default output root 下，项目内但错误 artifact root 可返回 `[]`。
  - `2-5-code-review-evaluation-20260527-round-2.md`: evaluator 确认 Round 1 修复过窄，要求 `actualArtifactPath` 至少位于 `configuredRoot` 下，并用 configured-root sibling path regression 覆盖。
  - `2-5-code-review-evaluation-20260527-round-3.md`: evaluator 确认 current implementation 对 `actualArtifactPath` 使用 `configuredRoot` 作为 containment container，configured-root sibling path 返回 0 个 issue，configured root 外路径仍返回 `outside-configured-root`。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中出现原始放行缺口与修复后过窄缺口，并由 Round 3 复审验证关闭。 |
  | 影响范围 | 1 | 影响 artifact path validator、workflow artifact output path 和 configured root 内多 workflow 子目录。 |
  | 风险等级 | 2 | 过宽会放行错误 artifact root，过窄会阻断合法 workflow output，均会破坏 artifact contract validation。 |
  | 根因稳定性 | 1 | 将 `defaultOutputPath` 与 configured artifact root / allowed output path 混为同一边界，是 contract relationship 容易误读的实现习惯。 |
  | 可执行性 | 2 | 可用 configured-root sibling positive regression 与 configured-root escape negative regression 同时检查。 |
  | 文档缺口 | 0 | owning SPEC 已说明 `defaultOutputPath` 或配置允许的 project-relative path，本规则沉淀实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: artifact path validator、workflow artifact writer、manifest/index artifact contract projection，以及未来引入 configured allowed output path / allowlist 的验证逻辑。
- **规避指南**:
  - 不得把 `actualArtifactPath` 无条件限制为 `defaultOutputPath` 子路径；也不得只做 project boundary check 而忽略 configured artifact root。
- **最佳实践**:
  - 保持 `defaultOutputPath` 必须位于 `configuredRoot` 下；`actualArtifactPath` 至少必须位于 `configuredRoot` 下，如后续存在更具体 allowlist，再在 configured root 边界内做精确 allowlist 校验。
- **全局文档建议**:
  - 不建议本次升格；owning SPEC 已覆盖 configured root / default output path 语义，本次按默认推荐决策只记录到 CR rules summary。
- **本次落地**:
  - Round 2 fixer 已修复，Round 3 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **新增 TODO backlog**: `generatedAt` validator 只接受 `Date.toISOString()` canonical UTC millisecond form，可能比 Story / owning SPEC 的 parseable ISO 8601 contract 更窄；该项已由 Round 1、Round 2、Round 3 evaluator 确认为 P2 非阻塞项，应由 05 TODO Tracker 维护。
- **明确排除**: `skillCount=54` vs fixture `53` 是真实 fixture drift，但 evaluator 明确判断不属于 Story 2.5 CR TODO；本次不记录、不修复。

### Story 2-4 / 2026-05-27

- **Story**: 2-4
- **分析来源**:
  - `2-4-code-review-summary-20260527-round-1.md`
  - `2-4-code-review-evaluation-20260527-round-1.md`
  - `2-4-code-review-summary-20260527-round-2.md`
  - `2-4-code-review-evaluation-20260527-round-2.md`
  - `2-4-code-review-summary-20260527-round-3.md`
  - `2-4-code-review-evaluation-20260527-round-3.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 P1 阻塞项：`ResolveMergeResultSchema` 与真实 resolver result 字段漂移，以及 installed customization activation 仍断言 legacy Python resolver path；fixer 已修复并由后续复审确认未回归。
  - Round 2 reviewer/evaluator 确认 1 个 P1 阻塞项：installed config activation 仍直接读取 `_speclite/config.toml`，未调用 `speclite resolve config --project-root`；fixer 已修复并由 Round 3 确认关闭。
  - Round 3 reviewer/evaluator 均通过；需要修复项 0，未发现新的阻塞项或中高优先级问题。
  - Round 1 P2 `resolve-parity` fixture 可审阅性问题继续作为非阻塞 CR TODO 交给 05，不写入本规则总结，避免 open TODO 与已沉淀规则重复管理。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局 resolve command contract / Story 已有 runtime entry 约束，本次不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Resolver schema anchor 必须解析真实 runtime result shape | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Installed activation 必须通过 `speclite resolve` runtime entry 获取配置与 customization | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only，不修改全局文档 |
| `resolve-parity` fixture cases 应外置到 fixture 目录 | 通过 | N/A | todo-tracker | 未解决非阻塞项，交给 05 TODO Tracker |

### 提炼规则

#### CR-API-13：Resolver schema anchor 必须解析真实 runtime result shape

- **来源问题**: Story 2.4 首轮实现提供 `ResolveMergeResultSchema` 作为 merge-result parser anchor，但 schema 定义为 `value`、`diagnostics`、`exitCode`，真实 resolver result 返回 `value`、`issues`、`exitCode`。严格 schema 无法解析真实 runtime result，导致 executable contract 与实现漂移。
- **CR 证据**:
  - `2-4-code-review-summary-20260527-round-1.md`: Finding #1 指出 `ResolveMergeResultSchema.safeParse(await resolveProjectConfig(...))` 失败，缺少 `diagnostics` 且拒绝 `issues`。
  - `2-4-code-review-evaluation-20260527-round-1.md`: evaluator 确认该问题为 P1，要求统一字段并补直接解析真实 resolver result 的测试。
  - `2-4-code-review-evaluation-20260527-round-3.md`: evaluator 确认 `ResolveMergeResultSchema` 已对齐 `issues` 字段，`test/contract-anchors.test.ts` 直接调用 `resolveProjectConfig()` 并用 schema 解析真实返回对象。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 3 复审验证未回归。 |
  | 影响范围 | 1 | 影响 resolve config/customization 的 schema anchor、command output 消费和 contract tests。 |
  | 风险等级 | 1 | Schema anchor 与真实 result 漂移会让消费者围绕不存在字段建立错误契约。 |
  | 根因稳定性 | 1 | Runtime result type 与 public parser schema 分开维护时，字段命名漂移容易复现。 |
  | 可执行性 | 2 | 可直接用真实 resolver function 返回值执行 schema parse，并对 unknown key / required key 做回归测试。 |
  | 文档缺口 | 1 | 全局 contract 有 no `CommandResult` envelope 和 output schema 原则，但未细化 schema anchor 必须解析真实 runtime result 的检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: resolve command、config/customization reader、schema anchor、command output parser，以及任何把 runtime result 暴露给 executable contract 的模块。
- **规避指南**:
  - 不得只按期望字段手写 strict schema，而不让 schema 直接解析真实 runtime function 的返回对象。
- **最佳实践**:
  - Contract anchor tests 应调用真实 resolver 或 public adapter，并对 schema parse 成功、字段名、unknown key 拒绝和 required key 缺失进行回归断言。
- **全局文档建议**:
  - 不建议本次升格；resolve command contract 已声明输出边界，本次仅 record-only 记录实现检查点，不扩大到全局文档修改。
- **本次落地**:
  - Round 1 fixer 已修复，Round 3 evaluator 确认未回归。
- **同步状态**: 已写入规则总结

#### CR-API-14：Installed activation 必须通过 `speclite resolve` runtime entry 获取配置与 customization

- **来源问题**: Story 2.4 首轮 installed customization activation 仍正向断言 legacy Python resolver path；Round 2 又发现 installed config activation 直接读取 `_speclite/config.toml`，绕过四层 config merge resolver。两类问题都让 installed skill runtime behavior 与 `speclite resolve` contract 脱节。
- **CR 证据**:
  - `2-4-code-review-summary-20260527-round-1.md`: Finding #2 指出 `speclite-dev-story` activation 和 fixture test 仍使用 `{speclite-runtime-root}/scripts/resolve_customization.py`。
  - `2-4-code-review-evaluation-20260527-round-1.md`: evaluator 确认该问题为 P1，要求主 activation instruction 和 release-gate fixture 转向 `speclite resolve customization --skill {skill-root} --project-root {project-root}`。
  - `2-4-code-review-summary-20260527-round-2.md`: Finding #1 指出 installed config activation 仍从 `_speclite/config.toml` 单文件读取，未调用 `speclite resolve config --project-root`。
  - `2-4-code-review-evaluation-20260527-round-3.md`: evaluator 确认 installed activation 已同时要求 `speclite resolve customization --skill {skill-root} --project-root {project-root}` 与 `speclite resolve config --project-root {project-root}`，并通过 fixture tests 覆盖 legacy path / 单文件读取负向断言。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | 同一 Story 两轮分别暴露 customization resolver 与 config resolver 的 activation bypass，且均经 evaluator 确认为 P1。 |
  | 影响范围 | 1 | 影响 installed skill activation、IDE runtime behavior、release-gate fixture 和 runtime command contract。 |
  | 风险等级 | 1 | Activation 绕过 resolver 会保留 Python runtime 不稳定或丢失 config override layer，导致测试通过但真实 IDE 行为不一致。 |
  | 根因稳定性 | 1 | Source instruction、reference 文档和 fixture test 容易保留旧读取方式，是 runtime migration 中稳定复现的漂移模式。 |
  | 可执行性 | 2 | 可用 installed artifact 正向断言 `speclite resolve` command，负向断言 legacy Python path 和单文件 config 读取文案。 |
  | 文档缺口 | 1 | Resolve contract 已声明 runtime entry，但 CR 说明了 installed activation fixture 必须消费该 entry 的检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: installed skill instructions、activation references、workflow customization resolution、config resolution、skill artifact loop fixtures 和 IDE mirror release gate。
- **规避指南**:
  - 不得在 installed activation 中直接读取 `_speclite/config.toml` 或调用 legacy resolver script 来替代 `speclite resolve` runtime command。
- **最佳实践**:
  - Installed artifact tests 必须同时断言 runtime command 正向存在和旧路径 / 旧读取方式负向不存在；涉及 layered config 时应通过 override layer 证明 activation contract 消费 resolver 输出。
- **全局文档建议**:
  - 不建议本次直接修改全局文档；该规则虽达到 8/12，但目标 contract 已存在于 resolve command / Story 范围内，本次用户要求为 Story 2.4 CR 收尾，默认 record-only 避免扩大到 project-context 或 architecture。
- **本次落地**:
  - Round 1 和 Round 2 fixer 已修复，Round 3 evaluator 确认全部关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **交给 05 TODO Tracker**: Round 1 evaluator 已确认 P2 非阻塞项：`resolve-parity` fixture 目录只有 metadata，真正 parity cases 内联在 `test/resolve-cli.test.ts` helper 中，release-gate fixture 独立审阅性不足。

### Story 2-3 / 2026-05-27

- **Story**: 2-3
- **分析来源**:
  - `2-3-code-review-summary-20260527-round-1.md`
  - `2-3-code-review-evaluation-20260527-round-1.md`
  - `2-3-code-review-summary-20260527-round-2.md`
  - `2-3-code-review-evaluation-20260527-round-2.md`
  - `2-3-code-review-summary-20260527-round-3.md`
  - `2-3-code-review-evaluation-20260527-round-3.md`
  - `2-3-code-review-summary-20260528-round-4.md`
  - `2-3-code-review-evaluation-20260528-round-4.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个中优先级 `patch` findings，并由 evaluator 升为 P1 阻塞：mapped help/phase target 未反查 `skill-index.installedTargets`，以及 ReadyCheck 将 invalid activation target 过早归类为 `manifest-schema.unreadable`。
  - Round 2 reviewer/evaluator 确认 1 个新的 P1 阻塞：`activationTarget` 可以跨 skill 指向另一个 canonical skill 的 installed `SKILL.md`。
  - Fixer 已修复 3 项，并补充 validator / ReadyCheck regression；Round 3 reviewer/evaluator 均通过，新发现 0，需要修复项 0，CR TODO 0。
  - Round 4 reopened corrective reviewer/evaluator 再次确认历史 3 个 P1 仍关闭；本轮新增 findings 0，Fix Items 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only 补记 round 4 证据；全局 manifest/index、validation taxonomy 和 adapter registry SPEC 已有相近边界原则，因此不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Help/phase mapped target 必须反查 `skill-index.installedTargets` | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| ReadyCheck 可读 index 的 target 语义错误必须保留 reserved `menu-target.*` 诊断 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Installed activation path basename 必须绑定对应 `canonicalSkillId` | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-10：Help/phase mapped target 必须反查 `skill-index.installedTargets`

- **来源问题**: `validateMenuTargets` 只验证 help index 与 phase coverage 之间的 `canonicalSkillId` / `activationTarget` 一致性，没有把 mapped target 的 `targetId` 反查到 skill index 中对应 skill 的 `installedTargets`，导致未安装 target 可被 projections 内部自洽地伪装为 mapped。
- **CR 证据**:
  - `2-3-code-review-summary-20260527-round-1.md`: Finding #1 指出 `skillIndex.installedTargets=["agents"]` 时，help/phase 同时声明 `claude` mapped 仍返回 `[]`。
  - `2-3-code-review-evaluation-20260527-round-1.md`: evaluator 确认该问题违反 AC 2 / AC 4 / AC 8，评估为 P1 阻塞项。
  - `2-3-code-review-evaluation-20260527-round-3.md`: evaluator 确认 `canonicalSkillId -> installedTargets` 映射校验与 regression 覆盖有效。
  - `2-3-code-review-evaluation-20260528-round-4.md`: reopened corrective evaluator 确认该历史 finding 仍已修复，未重新打开。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 3 复审验证关闭。 |
  | 影响范围 | 1 | 影响 help index、phase coverage、skill index 和 ReadyCheck 对 installed-state projection 的一致性判断。 |
  | 风险等级 | 2 | 未安装 target 被伪装为 mapped 会让 activation evidence 指向不可用或未登记 target，破坏缺失覆盖不可伪造边界。 |
  | 根因稳定性 | 1 | 多份 installed-state projections 只做相互匹配而不反查 source-of-truth，是后续 manifest/index validation 容易复现的实现缺口。 |
  | 可执行性 | 2 | 可要求 validator 建立 `canonicalSkillId -> installedTargets` 映射，并补充 mismatched target family regression。 |
  | 文档缺口 | 0 | manifest/index 与 validation taxonomy SPEC 已有 installed target 和 menu-target 边界，本规则沉淀实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: help index、phase coverage、skill index、ReadyCheck、validate menu-target 类别以及任何从 installed-state projections 推断 mapped IDE target 的流程。
- **规避指南**:
  - 不得仅因 help index 与 phase coverage 内部一致，就认定 target 已安装或可激活。
- **最佳实践**:
  - 对每个 mapped target，必须以 `skill-index.entries[].installedTargets` 为 installed target 真源反查；不一致时返回 reserved `menu-target.missing-target` 或 `menu-target.no-mapped-target`，并配套 validator / ReadyCheck 回归测试。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 与 `07-validation-issue-taxonomy.md` 已覆盖 skill index、phase coverage 与 menu-target issue 边界，本次只记录 CR 实践。
- **本次落地**:
  - Round 1 fixer 已修复，Round 3 evaluator 确认关闭，Round 4 evaluator 再次确认有效。
- **同步状态**: 已写入规则总结

#### CR-API-11：ReadyCheck 可读 index 的 target 语义错误必须保留 reserved `menu-target.*` 诊断

- **来源问题**: ReadyCheck 在读取 `help-index.json` / `phase-coverage.json` 时先执行严格 schema parse，invalid `activationTarget` 会提前返回 generic `manifest-schema.unreadable`，绕过 Story 2.3 要求的 reserved `menu-target.missing-target` 诊断。
- **CR 证据**:
  - `2-3-code-review-summary-20260527-round-1.md`: Finding #2 指出 invalid `help-index.activationTarget="DS"` 在 ReadyCheck 中返回 `manifest-schema.unreadable`。
  - `2-3-code-review-evaluation-20260527-round-1.md`: evaluator 确认 target 语义错误应保留 reserved `menu-target.*` 分类，且 malformed JSON / missing file 才保留 `manifest-schema.unreadable`。
  - `2-3-code-review-evaluation-20260527-round-3.md`: evaluator 确认 ReadyCheck 已消费 blocking `menu-target.*` issue，invalid activation target regression 有效。
  - `2-3-code-review-evaluation-20260528-round-4.md`: reopened corrective evaluator 确认该历史 finding 仍已修复，未重新打开。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 3 复审验证关闭。 |
  | 影响范围 | 1 | 影响 ReadyCheck、installed-state reverse validation、automation issue taxonomy 和用户诊断输出。 |
  | 风险等级 | 2 | generic schema issue 会掩盖 menu-target 语义错误，削弱自动化分类和修复路径。 |
  | 根因稳定性 | 1 | 严格 schema gate 过早拦截语义诊断，是 validation pipeline 中稳定易复现的流程缺口。 |
  | 可执行性 | 2 | 可按 index 类型映射 schema failure，target 语义字段错误转为 reserved `menu-target.*`，不可读/缺失仍为 `manifest-schema.unreadable`。 |
  | 文档缺口 | 0 | validation taxonomy 已声明 `menu-target.*` issue id，本规则沉淀 ReadyCheck 管线中的分类检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: ReadyCheck、validate、manifest/index schema parse 和任何需要在 structural parse 与 semantic validation 之间保持 issue taxonomy 边界的流程。
- **规避指南**:
  - 不得把可读 index 中已知 target 语义字段错误统一吞并为 generic schema unreadable。
- **最佳实践**:
  - 对 `activationTarget`、`entryPath`、`targetId`、`targetIds`、`status` 等 menu-target 语义字段建立 reserved issue 映射；保留 JSON 不可读、文件缺失、整体结构非对象等场景为 manifest/schema 级 issue。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 已声明目标 issue id，本次作为 ReadyCheck 实现层经验沉淀。
- **本次落地**:
  - Round 1 fixer 已修复，Round 3 evaluator 确认关闭，Round 4 evaluator 再次确认有效。
- **同步状态**: 已写入规则总结

#### CR-API-12：Installed activation path basename 必须绑定对应 `canonicalSkillId`

- **来源问题**: `activationTarget` 只校验 `.claude/skills/<任意目录>/SKILL.md` 或 `.agents/skills/<任意目录>/SKILL.md` path shape，没有要求路径中的 installed skill directory basename 等于当前 `canonicalSkillId`；help 与 phase coverage 同时错指另一个 skill 时，validator 与 ReadyCheck 会错误通过。
- **CR 证据**:
  - `2-3-code-review-summary-20260527-round-2.md`: Finding #1 指出 `canonicalSkillId="speclite-dev-story"` 时可错指 `.claude/skills/other-skill/SKILL.md`，`validateMenuTargets(...)` 返回 `[]`，ReadyCheck 返回 `ok: true`。
  - `2-3-code-review-evaluation-20260527-round-2.md`: evaluator 确认该问题违反 AC 1 / AC 2，评估为 P1 阻塞项。
  - `2-3-code-review-evaluation-20260527-round-3.md`: evaluator 确认 help `activationTarget`、phase mapped `entryPath` 与 `activationTarget` 已解析 target family / basename 并绑定到对应 `canonicalSkillId`。
  - `2-3-code-review-evaluation-20260528-round-4.md`: reopened corrective evaluator 确认该历史 finding 仍已修复，未重新打开。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 3 复审验证关闭。 |
  | 影响范围 | 1 | 影响 activation target resolution、help index、phase coverage、IDE mirror activation 和 ReadyCheck。 |
  | 风险等级 | 2 | 用户从一个 canonical skill entry 激活到另一个 installed skill package，会执行错误 activation protocol。 |
  | 根因稳定性 | 1 | 只校验 path shape 不校验 identity binding，是 path projection / identity projection 容易复现的边界缺口。 |
  | 可执行性 | 2 | 可集中解析 installed entry path 与 activation target，并用 cross-skill mismatch regression 检查。 |
  | 文档缺口 | 0 | Story / SPEC 已声明 activation target 指向 canonical skill installed `SKILL.md`，本规则沉淀实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: installed skill activation target helper、help index、phase coverage、IDE mirror validation、ReadyCheck 和 fixture expected installed-state projections。
- **规避指南**:
  - 不得只检查 activation path 是否长得像 installed `SKILL.md`；必须检查 path 中 skill directory identity 是否等于当前 `canonicalSkillId`。
- **最佳实践**:
  - 使用集中 helper 解析 `targetId` 与 skill directory basename；help `activationTarget`、phase `entryPath` 和 phase `activationTarget` 必须共同绑定当前 `canonicalSkillId`，错配时返回 reserved `menu-target.missing-target`。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 和 Story 2.3 已覆盖 activation target canonical identity 要求，本次作为 CR 实践记录。
- **本次落地**:
  - Round 2 fixer 已修复，Round 3 evaluator 确认关闭，Round 4 evaluator 再次确认有效。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 / Round 2 / Round 3 / Round 4 evaluation 均明确 CR TODO 0，本次未识别未解决的非阻塞改进项。

### Story 1-6 / 2026-05-27

- **Story**: 1-6
- **分析来源**:
  - `1-6-code-review-summary-20260527-round-1.md`
  - `1-6-code-review-evaluation-20260527-round-1.md`
- **结论概览**:
  - Round 1 reviewer 结论通过，finding 0；未发现新的阻塞项、中高优先级问题或需要记录为 CR TODO 的既有问题。
  - Round 1 evaluator 结论为 `Approved / 通过`，确认需修复项 0、误报 0、无需 fixer、CR TODO 0。
  - Fixer 已按 0 修复项收口，未修改源码、测试、Story 状态、sprint 状态或其他无关文件。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：无新增规则；仅 record-only 记录本 Story 规则提炼结论，不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 无 | 不适用 | N/A | none | 无 CR finding、无修复项、无未解决非阻塞项，因此无需新增规则或升格 |

#### 无需新增规则记录

- **无需新增规则**: 本 Story 没有产生新的 `CR-{DOMAIN}-{NN}` 规则。
- **规则升格判定**: 未识别到可量化评分的候选规则；不存在需要升格为全局文档规则、写入规则索引或交给 05 TODO Tracker 的事项。
- **全局文档建议**: 不修改 `project-context.md`、architecture、specs 或其他全局规划文档，避免扩大 Story 1-6 CR 收尾范围。
- **05 TODO Tracker 交接**: Round 1 evaluation 明确 CR TODO 0，本次无未解决非阻塞项需要交给 05。

### Story 2-1 / 2026-05-27

- **Story**: 2-1
- **分析来源**:
  - `2-1-code-review-summary-20260527-round-1.md`
  - `2-1-code-review-evaluation-20260527-round-1.md`
  - `2-1-code-review-summary-20260527-round-2.md`
  - `2-1-code-review-evaluation-20260527-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个中优先级 `patch` findings，并由 evaluator 升为 P1 阻塞：`artifactContract.defaultOutputPath` 内部 `..` path escape，以及 `{project_knowledge}` / `docs` + `outputs="*"` 被错误投影为 workflow `artifactContract`。
  - Fixer 已修复 2 项，并通过定向测试、`npm test` 和 `git diff --check`；Round 2 reviewer/evaluator 均通过，新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局 SPEC/architecture 已有 artifact contract 与 workflow artifact root 边界原则，且全局文档修改会扩大范围，因此不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| `artifactContract.defaultOutputPath` 必须先 canonicalize 再做 root containment | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| `artifactContract` 只允许 stable artifact kind 与 workflow artifact root | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-SEC-03：`artifactContract.defaultOutputPath` 必须先 canonicalize 再做 root containment

- **来源问题**: `artifactContract.defaultOutputPath` 在替换 `{output_folder}` 等 root placeholder 后，只做字符串前缀判断，未折叠内部 `..`，导致 `_speclite-output/../outside` 这类解析后逃逸 workflow artifact root 的路径进入 public phase coverage contract。
- **CR 证据**:
  - `2-1-code-review-summary-20260527-round-1.md`: Finding #1 指出 `{output_folder}/../outside` 被投影为 `_speclite-output/../outside`，违反 project-relative POSIX path 与 workflow artifact root containment 要求。
  - `2-1-code-review-evaluation-20260527-round-1.md`: evaluator 确认该问题为 P1 阻塞项，要求使用 canonical POSIX path 归一化并补内部 `..` / mixed separator 回归测试。
  - `2-1-code-review-evaluation-20260527-round-2.md`: evaluator 确认 `normalizeProjectRelativePosixPath` 已拒绝 `"."`、`".."`、`../*`、absolute path 与 Windows drive path，并通过回归测试关闭该 finding。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 manifest/index phase coverage 的 public artifact contract path 投影。 |
  | 风险等级 | 2 | 解析后逃逸 workflow artifact root 的路径进入 public contract，会误导后续 validator 或 artifact writer 消费边界。 |
  | 根因稳定性 | 1 | 字符串前缀判断替代 canonical path containment 是路径处理代码中容易复现的实现习惯。 |
  | 可执行性 | 2 | 可要求先 `path.posix.normalize` / project-relative canonicalization，再做 root containment，并用内部 `..`、mixed separator、合法 `./` 测试检查。 |
  | 文档缺口 | 0 | owning SPEC 已有 project-relative POSIX path 与 workflow artifact root containment 原则，本规则沉淀的是 CR 实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: manifest/index generation、phase coverage、artifact contract projection、validation issue path 投影中所有 project-relative POSIX path containment 判断。
- **规避指南**:
  - 不得在未 canonicalize 的路径字符串上直接使用 `startsWith(root + "/")` 判断 artifact root containment。
- **最佳实践**:
  - 先将 placeholder 替换结果归一为 canonical project-relative POSIX path，拒绝 `.`、`..`、`../*`、absolute path、drive path 和解析后越界路径，再执行 workflow artifact root containment 判断。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 与 architecture 已覆盖 path/root 边界原则，本次仅 record-only 沉淀 CR 实践，不扩大到全局文档修改。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-08：`artifactContract` 只允许 stable artifact kind 与 workflow artifact root

- **来源问题**: `{project_knowledge}` / `docs` 被纳入 eligible artifact root，且 `outputs="*"` 被归一后 fallback 为 `workflow-artifact`，导致没有明确 stable artifact kind 或 workflow artifact root 的 source metadata 也生成 `artifactContract`。
- **CR 证据**:
  - `2-1-code-review-summary-20260527-round-1.md`: Finding #2 指出 `speclite-document-project` 的 `{project_knowledge}` + `outputs=*` 被投影为 `defaultOutputPath: "docs"` 与 `artifactType: "workflow-artifact"`。
  - `2-1-code-review-evaluation-20260527-round-1.md`: evaluator 确认该行为混淆 project knowledge 与 workflow artifact repository，应将 non-workflow root 与泛化 outputs 保持 `artifactContract` absent。
  - `2-1-code-review-evaluation-20260527-round-2.md`: evaluator 确认 eligible roots 已排除 `project_knowledge`，且 `outputs="*"` 不再 fallback 为 `workflow-artifact`，相关回归断言已通过。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 source metadata 到 phase coverage / manifest installed projection 的 artifact contract 生成。 |
  | 风险等级 | 2 | 错误 contract 会混淆 `docs` project knowledge 与 `_speclite-output` workflow artifact repository，并让后续 validator 消费伪造 artifact kind。 |
  | 根因稳定性 | 1 | 对泛化 metadata 做 fallback 合成 stable-looking contract 是后续 metadata projection 容易复现的实现习惯。 |
  | 可执行性 | 2 | 可用 eligible root allowlist、stable slug 检查和 absent-contract regression tests 确定性检查。 |
  | 文档缺口 | 0 | manifest/index SPEC 已明确 artifact kind 和 default output path 边界，本规则沉淀的是实现侧 gating 检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: source metadata parser、manifest/index generation、phase coverage projection 和任何从 human-facing output metadata 生成 machine-readable artifact contract 的流程。
- **规避指南**:
  - 不得把 `project_knowledge`、`docs`、custom/control paths 或泛化 `outputs="*"` 自动合成为 workflow `artifactContract`。
- **最佳实践**:
  - 只有路径落在 workflow artifact root allowlist 且 `outputs` 能归一为 non-empty stable artifact kind 时才生成 `artifactContract`；否则保持字段 absent，并用 negative assertions 固化。
- **全局文档建议**:
  - 不建议本次升格；owning SPEC 已覆盖 stable artifact kind 与 workflow artifact root 原则，本次按用户授权只记录到 CR rules summary。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0，本次未识别未解决的非阻塞改进项。

### Story 2-2 / 2026-05-27

- **Story**: 2-2
- **分析来源**:
  - `2-2-code-review-summary-20260527-round-1.md`
  - `2-2-code-review-evaluation-20260527-round-1.md`
  - `2-2-code-review-summary-20260527-round-2.md`
  - `2-2-code-review-evaluation-20260527-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个中优先级 `patch` finding，并由 evaluator 升为 P1 阻塞：`canonicalPackageHash` 按 source package 全目录计算，但 installed self-contained entry 只复制白名单文件，导致 package-level hash 的证明对象与实际 installed target entry surface 不一致。
  - Fixer 已修复该项：`hashPackageDirectory()` 支持 include predicate，`copyCanonicalPackage()` 的安装白名单谓词被导出复用，`writeIdeMirrors()` 用同一白名单计算 `canonicalPackageHash`，并补充 source-only `SKILL.en.md` 回归测试。
  - Round 2 reviewer/evaluator 均通过；新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局 manifest/index SPEC 已有 package-level hash 与 file-level hash 分层原则，但本规则属于实现侧 hash 输入面检查点，因此不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| `canonicalPackageHash` 必须基于 installed canonical entry copied surface | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-09：`canonicalPackageHash` 必须基于 installed canonical entry copied surface

- **来源问题**: Story 2.2 首轮实现把 `canonicalPackageHash` 计算输入绑定到 source package 全目录；但 installed self-contained entry 只复制 `SKILL.md`、`CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example`、`customize.toml` 等白名单文件，source-only `SKILL.en.md` 不会安装。结果是 manifest skill index 记录的 package-level hash 会随未安装文件变化，却不能证明 `.claude/skills` 与 `.agents/skills` 中实际 installed canonical entry 内容一致。
- **CR 证据**:
  - `2-2-code-review-summary-20260527-round-1.md`: Finding #1 指出 source 全目录 hash 与 installed entry 目录 hash 不一致，削弱 AC5 的 package-level hash 语义。
  - `2-2-code-review-evaluation-20260527-round-1.md`: evaluator 确认该问题为 P1，需要将 hash 输入面与 installed canonical entry surface 对齐，并补充包含 source-only `SKILL.en.md` 的回归测试。
  - `2-2-code-review-evaluation-20260527-round-2.md`: evaluator 确认 `canonicalPackageHash` 已使用 installed canonical entry 白名单计算，fixture hash 更新为 installed surface hash，focused regression test 和 runtime structure tests 均通过。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 skill index、IDE mirror target writer、fixture expected installed state 和后续 validate/update 对 package-level hash 的消费。 |
  | 风险等级 | 1 | hash 证明对象错误会让 source-only 文件变化污染 installed package hash，并削弱跨 IDE target mirror 一致性判断。 |
  | 根因稳定性 | 1 | 复制面与 hash 面由不同 helper 定义时，后续新增 source-only 文件或白名单调整容易再次漂移。 |
  | 可执行性 | 2 | 可要求 hash 计算复用 installed copy predicate，并用 source-only 文件 fixture 断言 canonical package hash 等于 installed entry surface hash、不同于 source full-tree hash。 |
  | 文档缺口 | 1 | 全局 SPEC 已有 package-level hash 与 file-level hash 分层，但未单独沉淀“hash 输入面必须与 installed copied surface 共用谓词”的实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: IDE mirror target writer、manifest skill index generation、canonical package copy/hash helpers，以及任何从 source package 投影 installed self-contained entry 的流程。
- **规避指南**:
  - 不得用 source package 全目录 hash 代表 installed canonical entry hash，除非两者的文件集合由同一 installable-surface predicate 明确保证完全一致。
- **最佳实践**:
  - 复制 installed canonical entry 与计算 `canonicalPackageHash` 必须复用同一 include predicate；新增 source-only 或 mirror-only 文件时，测试必须同时断言 package-level hash、installed target contents 和 files index file-level hashes 的边界不混用。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 已声明 `canonicalPackageHash` 的 package-level 语义以及 package-level/file-level hash 分层。本次仅 record-only 记录实现检查点，不扩大到全局文档修改。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0，本次未识别未解决的非阻塞改进项。

### Story 3-1 / 2026-05-28

- **Story**: 3-1
- **分析来源**:
  - `3-1-code-review-summary-20260528-round-1.md`
  - `3-1-code-review-evaluation-20260528-round-1.md`
  - `3-1-code-review-summary-20260528-round-2.md`
  - `3-1-code-review-evaluation-20260528-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个中优先级 `patch` findings，并由 evaluator 升为 P1 阻塞：Status public paths 会透传 manifest 中未校验 path；corrupted `skill-index.json` 被降级为 `partial`。
  - Fixer 已修复两项：manifest/public command path schema 复用 project-relative POSIX 校验；`skill-index` 读取结果区分 `valid` / `missing` / `invalid`，invalid 进入 failed target 与 failed high-level health。
  - Round 2 reviewer/evaluator 均通过；新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局 SPEC 已有 public path 与 health algorithm 契约，本次不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Public status path projection 必须拒绝未校验 installed-state paths | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Installed-state index 读取必须区分 missing 与 corrupted | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-SEC-06：Public status path projection 必须拒绝未校验 installed-state paths

- **来源问题**: Story 3.1 首轮实现将 `manifest.paths` 直接投影到 `StatusCommandData.paths`，而 manifest path schema 只校验非空字符串。malformed manifest 可把 absolute path、parent traversal 或 backslash path 带入 public status JSON，违反 public path 必须为 project-relative POSIX path 且不得泄露本地绝对路径的契约。
- **CR 证据**:
  - `3-1-code-review-summary-20260528-round-1.md`: Finding #1 指出 `src/status/installed-state.ts` 会把 `manifest.paths` 原样写入 status data，定向复现显示 `/tmp/leak` 进入 `data.paths.specliteRoot`。
  - `3-1-code-review-evaluation-20260528-round-1.md`: evaluator 确认该问题直接违反 Story 3.1 AC 2 / AC 6，评估为 P1，需要修复并补充 malformed path regression。
  - `3-1-code-review-evaluation-20260528-round-2.md`: evaluator 确认 manifest schema 与 public `CommandPathSummarySchema` 已复用 project-relative POSIX 校验，malformed path 不再投影到 public JSON。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 status command、manifest projection、public CommandResult path schema 和 deterministic fixture output。 |
  | 风险等级 | 2 | 未校验 path 会泄露 absolute/local path，并使 malformed installed-state 被下游误当成可消费摘要。 |
  | 根因稳定性 | 1 | manifest/internal installed-state path 与 public projection path 容易混用，后续 status/validate/report projection 仍可能复现。 |
  | 可执行性 | 2 | 可通过 shared project-relative POSIX schema、negative public JSON assertions 和 malformed path fixtures 检查。 |
  | 文档缺口 | 0 | Story 3.1 与 owning SPEC 已声明 public path 契约，本规则沉淀 CR 实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: status、validate、ready summary、manifest/index projection 等把 installed-state path 暴露到 public `CommandResult` 或 fixture JSON 的流程。
- **规避指南**:
  - 不得把 manifest、index 或 installed-state 中的 path 字段原样投影为 public JSON path。
- **最佳实践**:
  - 在 schema anchor 或 public projection 边界复用 project-relative POSIX path 校验；校验失败时把 installed-state 视为 corrupted/unreadable，并返回 safe default path 或 stable issue，而不是输出原始 path。
- **全局文档建议**:
  - 不建议本次升格；public path contract 已由 Story 3.1 与 owning SPEC 覆盖，本次按用户授权只记录到 CR rules summary。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-15：Installed-state index 读取必须区分 missing 与 corrupted

- **来源问题**: Story 3.1 首轮实现的 `readSkillIndex` 在 JSON parse、schema parse 或文件读取失败时统一返回 `undefined`，导致 missing index 与 corrupted/unreadable index 都被映射为 target `partial`。这弱化了 corrupted installed-state 的 failed health 语义，也让自动化消费者无法区分安装不完整与 state 损坏。
- **CR 证据**:
  - `3-1-code-review-summary-20260528-round-1.md`: Finding #2 指出 invalid `skill-index.json` 被归类为 `partial`，而不是 failed installed-state health。
  - `3-1-code-review-evaluation-20260528-round-1.md`: evaluator 确认该问题违反 Story 3.1 health algorithm，评估为 P1，需要区分 missing 与 invalid/corrupted。
  - `3-1-code-review-evaluation-20260528-round-2.md`: evaluator 确认 `SkillIndexReadResult` 已拆分为 `missing` / `invalid` / `valid`，invalid JSON 与 schema-invalid skill-index 均进入 failed target 和 failed high-level health。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 status installed-state reader、target health、high-level health aggregation 和后续 validate/update 对 installed summary 的消费。 |
  | 风险等级 | 2 | corrupted index 被降级为 partial 会掩盖安装状态损坏，误导自动化与人工修复路径。 |
  | 根因稳定性 | 1 | 读取 helper 用 `undefined` 表示所有失败类型，是状态读取代码中稳定易复现的缺口。 |
  | 可执行性 | 2 | 可用 discriminated result、invalid JSON/schema-invalid regression 和 health aggregation assertion 检查。 |
  | 文档缺口 | 0 | Story 3.1 已声明 corrupted manifest/index/source descriptor 应进入 failed health，本规则沉淀实现侧检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: status、validate、ready check、update/repair preflight 中读取 manifest/index/source descriptor 并聚合 installed-state health 的流程。
- **规避指南**:
  - 不得用同一个 `undefined`、`null` 或 empty result 同时表示 missing file、JSON parse failure、schema failure 和 unreadable corrupted file。
- **最佳实践**:
  - installed-state 读取 helper 应返回 discriminated result；missing 可以按产品语义进入 partial/not-configured，corrupted/unreadable/schema-invalid 应进入 failed 或 stable issue taxonomy，并补充 focused regression。
- **全局文档建议**:
  - 不建议本次升格；Story 3.1 health algorithm 已覆盖该语义，本次按用户授权只记录到 CR rules summary。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 evaluator 明确两项均为阻塞修复项，不降级为 TODO；Round 2 reviewer/evaluator 均确认无新增 defer / 非阻塞项，本次不修改 `cr-todo-backlog.md`。

### Story 3-2 / 2026-05-28

- **Story**: 3-2
- **分析来源**:
  - `3-2-code-review-summary-20260528-round-1.md`
  - `3-2-code-review-evaluation-20260528-round-1.md`
  - `3-2-code-review-summary-20260528-round-2.md`
  - `3-2-code-review-evaluation-20260528-round-2.md`
  - `3-2-code-review-summary-20260528-round-3.md`
  - `3-2-code-review-evaluation-20260528-round-3.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个中优先级 `patch` finding，并由 evaluator 升为 P1 阻塞：`skill-index` completeness 只按 entry 总数判断，无法保证 selected canonical package roots 全部覆盖。
  - Round 1 fixer 补充 duplicate root 场景后，Round 2 reviewer/evaluator 继续确认该修复仍未按 expected canonical package root inventory 做 set equality，因此仍为 P1 阻塞项。
  - Round 2 fixer 已改为比对 expected `moduleId:sourcePackagePath` set 与 actual skill-index root set，并补充同 count replacement regression；Round 3 reviewer/evaluator 均确认通过，新增 finding 0、CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权采用默认推荐决策 record-only，仅写入本规则总结；该经验已由 Story AC 与 owning SPEC 局部覆盖，不修改全局文档，不新增 TODO。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Skill index completeness 必须比对 selected canonical package root expected set | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-16：Skill index completeness 必须比对 selected canonical package root expected set

- **来源问题**: Story 3.2 首轮实现只按 `skill-index` entry 总数判断 completeness；第一轮修复又只覆盖 duplicate root 和模块 root 数量，仍可能接受“总数 53、无 duplicate、module count 正确，但 expected root 被唯一 unexpected root 替换”的 installed-state projection。
- **CR 证据**:
  - `3-2-code-review-summary-20260528-round-1.md`: Finding #1 指出 `validateSelectedModuleCompleteness` 只检查 entries 数量，不能保证 selected canonical package root 全部覆盖。
  - `3-2-code-review-evaluation-20260528-round-2.md`: evaluator 确认 duplicate/root count 修复仍不足，必须按 selected canonical package root expected set 与 actual set 做 equality。
  - `3-2-code-review-evaluation-20260528-round-3.md`: evaluator 确认 expected inventory set equality、missing/unexpected diagnostics 和 focused regression 已闭环，整体结论 Approved / 通过。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 多轮 CR 连续暴露 count-only 与 duplicate/count-only 修复不足的问题，并由 Round 3 验证关闭。 |
  | 影响范围 | 1 | 影响 validate manifest-schema rule、installed skill index projection、后续 status/update/IDE adapter 对 installed-state 的信任边界。 |
  | 风险等级 | 2 | 会让数量正确但 canonical root inventory 错误的 installed-state 被接受，削弱 schema validation 与自动化消费判断。 |
  | 根因稳定性 | 1 | 用 count 或 unique count 替代 expected set equality 是 manifest/index completeness 校验中容易复现的实现习惯。 |
  | 可执行性 | 2 | 可用 expected set 与 actual set equality、missing/unexpected stable diagnostics 和同 count replacement regression 确定性检查。 |
  | 文档缺口 | 0 | Story 3.2 AC 与 manifest/index contract 已声明 selected roots coverage，本规则沉淀的是 CR 实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: manifest/index validation、installed-state projection validation、ready check 或任何需要证明 selected module canonical package roots 全覆盖的流程。
- **规避指南**:
  - 不得用 entry 总数、module 分组数量或 duplicate 检查替代 selected canonical package root expected set equality。
- **最佳实践**:
  - 对 selected modules 构造 expected `moduleId:sourcePackagePath` 或等价 stable key set，与 actual skill-index entries 做 set equality；缺失 expected root、出现 unexpected root、重复 root 都应输出 stable issue，并用同 count replacement regression 固化。
- **全局文档建议**:
  - 不建议本次升格；Story 3.2 AC 与 manifest/index owning SPEC 已覆盖 selected roots coverage 语义，本次按用户授权只记录到 CR rules summary，不扩大到全局文档修改。
- **本次落地**:
  - Round 2 fixer 已修复，Round 3 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1、Round 2 的 findings 均为阻塞修复项，不降级为 TODO；Round 3 reviewer/evaluator 明确新增 finding 0、CR TODO 0，本次不修改 `cr-todo-backlog.md`。

### Story 3-3 / 2026-05-28

- **Story**: 3-3
- **分析来源**:
  - `3-3-code-review-summary-20260528-round-1.md`
  - `3-3-code-review-evaluation-20260528-round-1.md`
  - `3-3-code-review-summary-20260528-round-2.md`
  - `3-3-code-review-evaluation-20260528-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 `patch` findings，并由 evaluator 评估为 P1 阻塞：非 canonical adapter artifact symlink 会误触发 `ide-mirror.hash-mismatch`；dangling symlink 会被误报为 missing installer-owned file。
  - Fixer 已修复两项：canonical package hash walker 在遍历阶段应用 include 过滤；files-index integrity 先用 `lstat()` 区分 missing、symlink 和 unreadable。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权采用默认推荐决策 record-only，仅写入本规则总结；相关经验已有 Story 3.3 contract 和既有 path/hash 规则覆盖，不修改全局文档，不新增 TODO。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Canonical hash walker 必须在遍历阶段应用 candidate include 边界 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| File integrity symlink 诊断必须先 no-follow 分类再决定 issue 语义 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-17：Canonical hash walker 必须在遍历阶段应用 candidate include 边界

- **来源问题**: Story 3.3 首轮实现让 `hashPackageDirectory()` 先遍历完整 entry root，再应用 canonical include 过滤；因此非 canonical adapter artifact symlink 即使不属于 package hash candidate，也会在过滤前被 `listFiles()` 误判为 canonical package symlink，触发 `ide-mirror.hash-mismatch`。
- **CR 证据**:
  - `3-3-code-review-summary-20260528-round-1.md`: Finding #1 指出 `.claude/skills/<id>/adapter-link` 或 `.agents/skills/<id>/wrapper-link` 这类 adapter artifact symlink 会误触发 `shape: "symlink-in-canonical-package"`。
  - `3-3-code-review-evaluation-20260528-round-1.md`: evaluator 确认该问题违反 adapter artifact exclusion contract，评估为 P1，需要修复。
  - `3-3-code-review-evaluation-20260528-round-2.md`: evaluator 确认 `hashPackageDirectory()` 已把 include 过滤传入 `listFiles()`，非 canonical symlink 被跳过，canonical candidate symlink 仍被拒绝。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 canonical package hash helper、IDE mirror validation 和 adapter artifact/file-index 分层。 |
  | 风险等级 | 1 | 会让合法 target-local artifact 触发 validate failure，并给出错误 drift 诊断。 |
  | 根因稳定性 | 1 | 先遍历后过滤是 hash/include helper 中容易复现的实现习惯。 |
  | 可执行性 | 2 | 可通过遍历阶段 include predicate、canonical directory root 判定和 adapter symlink regression 确定性检查。 |
  | 文档缺口 | 1 | 既有规则已有 hash input surface 分层，但未细化“symlink 异常也必须受 include 边界约束”。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: canonical package hash、IDE mirror validation、安装包白名单遍历和任何“候选文件集合 + symlink 拒绝”组合的 helper。
- **规避指南**:
  - 不得先遍历完整 entry root 并对所有 symlink 抛错后，再应用 canonical package candidate include 过滤。
- **最佳实践**:
  - 在 walker 遍历阶段计算 normalized relative path 是否属于 candidate；只有 included file/directory/symlink 才参与递归、hash record 或 shape mismatch，并用 adapter artifact symlink regression 固化排除边界。
- **全局文档建议**:
  - 不建议本次升格；Story 3.3 contract 与既有 `CR-API-09` 已覆盖 canonical hash 输入面分层，本次仅 record-only 记录实现检查点，不扩大到全局文档修改。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-SEC-07：File integrity symlink 诊断必须先 no-follow 分类再决定 issue 语义

- **来源问题**: Story 3.3 首轮实现对 files-index entry 先调用会 follow symlink target 的存在性检查；dangling symlink 的 link 本身存在但 target 缺失时，被误报为 `file-integrity.missing-installer-owned-file`，没有进入 symlink handling 分支。
- **CR 证据**:
  - `3-3-code-review-summary-20260528-round-1.md`: Finding #2 指出 dangling symlink 被 `access()` 跟随后误报为 missing installer-owned file。
  - `3-3-code-review-evaluation-20260528-round-1.md`: evaluator 确认该问题违反 symlink handling 独立 validation dimension，评估为 P1，需要修复。
  - `3-3-code-review-evaluation-20260528-round-2.md`: evaluator 确认当前实现先用 `lstat()`，仅 `ENOENT` 报 missing；symlink 不 follow target，统一报告 `file-integrity.hash-mismatch` 与 `details.shape: "symlink"`。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 files-index raw-byte integrity、validate diagnostics、repair guidance 和 redaction-safe details。 |
  | 风险等级 | 1 | 会把 shape/symlink 风险误导为缺失文件，影响用户 repair 判断和后续 fixer 验证。 |
  | 根因稳定性 | 1 | 使用 follow 行为的 `access()` / exists helper 做安全分类，是路径与 symlink 处理中的稳定风险。 |
  | 可执行性 | 2 | 可要求先 `lstat`/no-follow 分类，再分别处理 ENOENT、symlink、unreadable 和 regular file，并补 dangling/existing symlink regression。 |
  | 文档缺口 | 1 | 既有 `CR-SEC-01` 覆盖 path boundary no-follow，本规则细化 file-integrity issue 语义与诊断分类。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: file integrity validation、installed-state file ownership checks、read-only drift diagnostics 和需要区分 missing / symlink / unreadable 的 filesystem 检查。
- **规避指南**:
  - 不得用会 follow symlink target 的 existence check 决定 installer-owned file 是否缺失。
- **最佳实践**:
  - 先使用 no-follow stats 判断路径实体；只有 `ENOENT` 才报告 missing，symlink 必须作为独立 shape/diagnostic 处理，并断言不泄露 readlink target、absolute path 或 hash value。
- **全局文档建议**:
  - 不建议本次升格；既有安全规则已覆盖 no-follow 边界，本次仅 record-only 记录 file-integrity 诊断分类检查点。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 evaluator 明确两项均为阻塞修复项，不降级为 TODO；Round 2 reviewer/evaluator 明确新增 finding 0、CR TODO 0，本次不修改 `cr-todo-backlog.md`。

### Story 3-4 / 2026-05-28

- **Story**: 3-4
- **分析来源**:
  - `3-4-code-review-summary-20260528-round-1.md`
  - `3-4-code-review-evaluation-20260528-round-1.md`
  - `3-4-code-review-summary-20260528-round-2.md`
  - `3-4-code-review-evaluation-20260528-round-2.md`
  - `3-4-code-review-summary-20260528-round-3.md`
  - `3-4-code-review-evaluation-20260528-round-3.md`
  - `3-4-code-review-summary-20260528-round-4.md`
  - `3-4-code-review-evaluation-20260528-round-4.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 3 个 `patch` findings，并由 evaluator 评估为 P1 阻塞：production validate 未消费 workflow artifact metadata、installed canonical `SKILL.md` legacy config reference 未接入主流程、runtime symlink escape 未按 realpath boundary 分类。
  - Round 2 reviewer/evaluator 继续确认 directory artifact `<directory>/metadata.json` 未进入 production artifact validation，作为 Round 1 artifact metadata 修复的未闭环项进入 fixer。
  - Round 3 reviewer/evaluator 确认 `artifact-path` symlink validation 会把项目内 symlink 误报为 `artifact-path.symlink-escape`，进入 fixer。
  - Round 4 reviewer/evaluator 均确认通过；新增 finding 0，需要修复项 0，CR TODO 0，最终 evaluator 结论为 Approved / 通过。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权采用默认推荐决策 record-only，仅写入本规则总结；两条经验偏 validate / filesystem 技术域，不修改全局文档，不新增 TODO。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Production artifact validation 必须消费 on-disk metadata entity | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Symlink escape issue 必须基于 realpath boundary 而非 symlink 存在性 | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-18：Production artifact validation 必须消费 on-disk metadata entity

- **来源问题**: Story 3.4 首轮实现只在 rule-level helper 显式传入 metadata 时校验 required artifact metadata，production `speclite validate` 没有读取 actual artifact path 的 on-disk metadata；第一轮修复覆盖 file artifacts 后，Round 2 又暴露 directory artifact `<directory>/metadata.json` 未作为 artifact entity 被发现。
- **CR 证据**:
  - `3-4-code-review-summary-20260528-round-1.md`: Finding #1 指出 `validateProject` 调用 `validateArtifactPathContract()` 时未传入 artifact metadata / actual artifact path，production validate 无法触发 metadata missing/invalid issue。
  - `3-4-code-review-evaluation-20260528-round-2.md`: evaluator 确认 directory artifact metadata 未被 production discovery 读取，`metadata.json` 被跳过导致 AC5 仍漏报。
  - `3-4-code-review-evaluation-20260528-round-4.md`: evaluator 确认 file artifact 与 directory artifact metadata production validation 均已闭环。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 多轮 CR 连续暴露 file artifact 与 directory artifact metadata 未进入 production validation 的问题。 |
  | 影响范围 | 1 | 影响 `speclite validate` artifact-path aggregation、workflow artifact metadata contract 和 command-level diagnostics。 |
  | 风险等级 | 2 | production validate 漏报 required metadata missing/invalid，会让 workflow artifact contract 失效并误导自动化验收。 |
  | 根因稳定性 | 1 | rule helper 支持但 command aggregation 未消费真实 on-disk entity，是 validation 接入层容易复现的实现缺口。 |
  | 可执行性 | 2 | 可用 artifact entity discovery、frontmatter/sidecar/directory metadata reader 和 command-level regression 检查。 |
  | 文档缺口 | 1 | Artifact contract 已声明 metadata 位置，但 CR 暴露了 production aggregation 必须消费 entity 的实现检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: `speclite validate`、workflow artifact validation、artifact metadata discovery 和任何 rule-level contract 需要由 command aggregation 喂入真实 on-disk entity 的流程。
- **规避指南**:
  - 不得只在 pure rule helper 测试中显式传入 metadata，就认定 production command path 已覆盖 artifact metadata validation。
- **最佳实践**:
  - production validation 应先发现 actual artifact entity，再按 artifact type 读取 Markdown frontmatter、file sidecar JSON 或 directory `metadata.json`，把 `actualArtifactPath`、metadata 与 `metadataLocation` 一并传入 rule 层，并补 command-level missing/invalid regression。
- **全局文档建议**:
  - 不建议本次升格；该规则偏 artifact validation 接入实现细节，且 Story 3.4 / owning artifact path contract 已覆盖 metadata 位置。本次按用户授权只记录到 CR rules summary。
- **本次落地**:
  - Round 1 与 Round 2 fixer 已修复，Round 4 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-SEC-08：Symlink escape issue 必须基于 realpath boundary 而非 symlink 存在性

- **来源问题**: Story 3.4 首轮 runtime-path validation 只要发现 symlink segment 就报告 `runtime-path.symlink-escape`，没有判断 symlink target 是否逃出 project boundary；Round 3 又在 artifact-path validation 中发现同类误报，项目内 artifact symlink 也被报告为 `artifact-path.symlink-escape`。
- **CR 证据**:
  - `3-4-code-review-summary-20260528-round-1.md`: Finding #3 指出 runtime path symlink 分类未解析 target，项目内 symlink 可能被误报为 escape。
  - `3-4-code-review-evaluation-20260528-round-3.md`: evaluator 独立复现 `_speclite-output/link -> _speclite-output/real` 项目内 symlink 被误报为 `artifact-path.symlink-escape`。
  - `3-4-code-review-evaluation-20260528-round-4.md`: evaluator 确认 runtime-path 与 artifact-path 均已改为 `realpath()` boundary 判断，项目内 symlink 不再误报，project-external symlink escape 仍报告。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | 同一 Story 中 runtime-path 与 artifact-path 两个 validation domains 均出现“symlink 存在即 escape”的同类问题。 |
  | 影响范围 | 1 | 影响 runtime path、artifact path、validate diagnostics 和合法项目内 symlink layout。 |
  | 风险等级 | 2 | 会把合法项目内 symlink 误判为 escape，阻断合法安装/产物布局；若反向处理不当也可能漏报真正 project-external escape。 |
  | 根因稳定性 | 1 | 将 symlink shape 与 boundary escape 混为一谈，是 filesystem validation 中稳定易复现的分类错误。 |
  | 可执行性 | 2 | 可用 `lstat` 发现 symlink、`realpath` 对 target 与 project root 做 boundary 比较，并用 internal/external symlink paired regression 固化。 |
  | 文档缺口 | 0 | 既有 Story issue mapping 已定义 symlink escape 语义，本规则沉淀 CR 实现检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: runtime-path、artifact-path、file integrity、IDE mirror 和任何需要把 symlink shape 与 project boundary escape 区分开的 filesystem validation。
- **规避指南**:
  - 不得仅因路径 segment 是 symlink 就报告 `*.symlink-escape`；escape issue 必须表示解析后确实越过 project boundary。
- **最佳实践**:
  - 先 no-follow 识别 symlink，再对 symlink target 和 project root 执行 `realpath`；项目内 symlink 继续后续校验，项目外 symlink 才报告 escape，并确保 public details 不泄露外部绝对路径。
- **全局文档建议**:
  - 不建议本次升格；`CR-SEC-01` / `CR-SEC-07` 已沉淀 no-follow 和 symlink 诊断边界，本条作为 Story 3.4 中 runtime/artifact path 的补充实现规则记录。
- **本次落地**:
  - Round 1 与 Round 3 fixer 已修复，Round 4 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1、Round 2、Round 3 的 findings 均为当前 Story 3.4 验收相关阻塞修复项，不降级为 TODO；Round 4 reviewer/evaluator 明确新增 finding 0、CR TODO 0，本次不修改 `cr-todo-backlog.md`。

### Story 4-1 / 2026-05-31

- **Story**: 4-1
- **分析来源**:
  - `4-1-code-review-summary-20260531-round-1.md`
  - `4-1-code-review-evaluation-20260531-round-1.md`
  - `4-1-code-review-summary-20260531-round-2.md`
  - `4-1-code-review-evaluation-20260531-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 `patch` findings，并由 evaluator 评估为 P1 阻塞：`update --repair` 未把 protected path classifier 结果作为 files-index 错标时的硬边界；`validate` file-integrity ownership 检查未接收 configured artifact root。
  - Fixer 已修复两项：update/repair planning 优先使用 classifier 的 `human-owned` / `workflow-owned` / `unknown` protected 结论；file-integrity validation 使用 manifest configured artifact root，并新增对应 focused regressions。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局 SPEC/已有 CR 规则已覆盖 artifact root、symlink、path-safety 等相近原则，本次不扩大修改全局文档，不新增 TODO。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Protected path classifier 结果必须优先于 files-index ownership | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| File integrity ownership 检查必须使用 configured artifact root | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-SEC-09：Protected path classifier 结果必须优先于 files-index ownership

- **来源问题**: Story 4.1 首轮实现先对 entry path 调用 `classifyOwnership()`，但当 classifier 返回已知 ownership 时又回退使用 files-index entry 的 `ownership`。因此 `_speclite/custom/config.toml` 或 configured artifact root 下文件即使按路径应为 protected，只要 files-index 错标为 `installer-owned`，`update --repair` 仍会生成 `restore-canonical` action。Story 4.5 再次暴露同类边界：classifier unknown path 在 `data.conflicts[]` 中正确为 `ownership: "unknown"`，但 `updatePlan.actions[]` 又被误投影为 `ownership: "installer-owned"`。
- **CR 证据**:
  - `4-1-code-review-summary-20260531-round-1.md`: Finding #1 指出 `_speclite/custom/config.toml` 被 files-index 错标为 `installer-owned` 时，repair plan 生成 `restore-canonical` 且 conflicts 为空。
  - `4-1-code-review-evaluation-20260531-round-1.md`: evaluator 确认该问题为 P1，要求 classifier 的 `human-owned`、`workflow-owned`、`unknown` 作为 protected 硬边界。
  - `4-1-code-review-evaluation-20260531-round-2.md`: evaluator 确认 `classifyEntryConflict()` 已优先返回 protected conflict，`planRepair()` 遇到 protected conflict 后不会读取 source evidence 或生成 repair action。
  - `4-5-code-review-summary-20260601-round-1.md`: Finding #1 指出 classifier unknown path 会在 `updatePlan.actions[]` 中被默认投影为 installer-owned conflict action。
  - `4-5-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题违反 Story 4.5 unknown ownership protected boundary，要求不扩展 schema 时不得追加误导性 installer-owned action。
  - `4-5-code-review-evaluation-20260601-round-2.md`: evaluator 确认修复后 unknown path 只保留在 `data.conflicts[]`，不再进入 installer-owned planned action。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 4.1 与 Story 4.5 均出现 files-index ownership 或 public action projection 覆盖 classifier protected/unknown 结论的问题，并均由复审验证关闭。 |
  | 影响范围 | 1 | 影响 update planning、repair planning、files-index ownership 消费和 protected path conflict 生成。 |
  | 风险等级 | 2 | 错标 files-index 可让 human-owned/workflow-owned 文件进入可执行 repair action，存在覆盖用户配置或工作流产物风险。 |
  | 根因稳定性 | 1 | 将 mutable index metadata 置于 path classifier 边界之上，是 update/repair 消费 installed-state 时易复现的实现习惯。 |
  | 可执行性 | 2 | 可要求 classifier protected result 先行短路，并用错标 `_speclite/custom/*.toml` 与 configured artifact root regression 固化。 |
  | 文档缺口 | 0 | 既有 path-safety、artifact root 和 ownership 边界规则已有相近原则，本条沉淀为 update/repair 具体检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: update/repair planning、files-index ownership 消费、installed-state drift repair 和任何需要同时消费 path classifier 与 persisted ownership metadata 的流程。
- **规避指南**:
  - 不得让 files-index entry 的 `installer-owned` 标记或 public action projection 覆盖 path classifier 已判定的 `human-owned`、`workflow-owned` 或 `unknown` protected 结果。
- **最佳实践**:
  - 先按当前 configured roots 和 path classifier 计算 protected boundary；若 classifier 结果为 protected，立即生成 stable conflict 并跳过 source evidence、canonical restore 或其他 mutation action；若 public planned action schema 不能表达 `unknown`，不得伪装成 installer-owned action，并用 mislabel/unknown regression 检查 `repairPlan.actions[]` 或 `updatePlan.actions[]` 不含误导性 action。
- **全局文档建议**:
  - 不建议本次升格；该规则偏 update/repair ownership planning 实现检查点，且已有 `CR-SEC-02`、`CR-SEC-05`、`CR-SEC-07` 等相近安全边界规则，本次按用户授权仅写入规则总结。
- **本次落地**:
  - Story 4.1 Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
  - Story 4.5 Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-SEC-10：File integrity ownership 检查必须使用 configured artifact root

- **来源问题**: Story 4.1 首轮实现中 `validateProject()` 已读取 manifest configured artifact root，但调用 `validateFileIntegrity()` 时没有传入该 root；file-integrity ownership classification 只能识别默认 `_speclite-output`，导致 `.artifacts/report.md` 这类 configured workflow artifact root 下的错标 entry 无法报告 `file-integrity.unsafe-overwrite-risk`。
- **CR 证据**:
  - `4-1-code-review-summary-20260531-round-1.md`: Finding #2 指出 `validateFileIntegrity()` 调用 `classifyOwnership()` 时未接收 configured artifact root。
  - `4-1-code-review-evaluation-20260531-round-1.md`: evaluator 确认该问题违反 AC6，要求 `validateFileIntegrity()` 接收 `manifest.paths.artifactRoot` 并覆盖 `.artifacts/report.md` 错标场景。
  - `4-1-code-review-evaluation-20260531-round-2.md`: evaluator 确认 `validateProject()` 已将 configured artifact root 传入 file-integrity rule，回归测试断言 `classifiedOwnership: "workflow-owned"`。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 project validate、file-integrity ownership diagnostics 和 configured workflow artifact root 下的 unsafe overwrite risk 检测。 |
  | 风险等级 | 2 | configured artifact root 下 protected workflow artifact 错标后会漏报 unsafe overwrite 风险，削弱 update/repair 前置安全门禁。 |
  | 根因稳定性 | 1 | command aggregation 已读取 configured root 但 rule-level helper 未消费，是 validation 接入层常见遗漏。 |
  | 可执行性 | 2 | 可通过函数入参传递、classifier 调用携带 artifactRoot，并用 configured root mislabel focused test 检查。 |
  | 文档缺口 | 0 | 既有 artifact root containment 规则已有相近原则，本条沉淀 file-integrity ownership validation 的接入检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: file-integrity validation、project validate aggregation、configured workflow artifact root ownership classification 和 unsafe overwrite diagnostics。
- **规避指南**:
  - 不得在 rule-level ownership 检查中只使用默认 artifact root，而忽略 manifest/config 中的 configured artifact root。
- **最佳实践**:
  - 在 command aggregation 层读取 manifest configured artifact root 后，必须传入所有需要 ownership classification 的 validation helper；focused test 应覆盖非默认 root 下 workflow-owned path 被 files-index 错标为 `installer-owned` 时仍报告 `file-integrity.unsafe-overwrite-risk`。
- **全局文档建议**:
  - 不建议本次升格；`CR-SEC-05` 已覆盖 configured artifact root 边界原则，本条作为 file-integrity validation 接入细则 record-only 沉淀。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 evaluator 明确两项均为 P1 阻塞修复项，不降级为 TODO；Round 2 reviewer/evaluator 明确新增 finding 0、CR TODO 0，本次不修改 `cr-todo-backlog.md`。

### Story 4-2 / 2026-05-31

- **Story**: 4-2
- **分析来源**:
  - `4-2-code-review-summary-20260531-round-1.md`
  - `4-2-code-review-evaluation-20260531-round-1.md`
  - `4-2-code-review-summary-20260531-round-2.md`
  - `4-2-code-review-evaluation-20260531-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 `patch` finding，并由 evaluator 评估为 P1 阻塞：`speclite update` / `speclite update --repair` 的 public `targetProject` 显示名绕过四层 config resolver，只读取 base `_speclite/config.toml`。
  - Fixer 已修复该项：update/repair 结果显示名优先通过 shared `resolveProjectConfig({ keys: ["core.project_name"] })` 读取四层 merged config value，缺失或不可用时才走既有 fallback。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局架构文档已有 `src/config/` 作为唯一 merge implementation、`resolve config` 四层顺序和 diagnostics/output 统一渲染等相近约束，本次不扩大修改全局文档，不新增 TODO。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Config 派生的 public command result 字段必须复用 shared resolver | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-19：Config 派生的 public command result 字段必须复用 shared resolver

- **来源问题**: Story 4.2 首轮实现中 `runUpdateCommand` 在 planning 前计算 `targetProject`，但显示名 fallback 只读取 `_speclite/config.toml`，没有调用 shared config resolver，也没有合并 `_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml`。因此 update/repair 的 public JSON/human result 会展示 base config 值，而不是 Story AC1 要求的四层 merged value。
- **CR 证据**:
  - `4-2-code-review-summary-20260531-round-1.md`: Finding #1 指出 `src/commands/update.ts` 的 `targetProject` 通过旧 helper 直接读取 base `_speclite/config.toml`，绕过四层 config resolver。
  - `4-2-code-review-evaluation-20260531-round-1.md`: evaluator 确认该问题违反 Story 4-2 AC1，并要求复用 `src/config/config-reader.ts` 的 shared resolver。
  - `4-2-code-review-evaluation-20260531-round-2.md`: evaluator 确认 `resolveUpdateTargetProjectDisplayName` 已调用 `resolveProjectConfig({ keys: ["core.project_name"] })`，update 与 repair regression 均覆盖四层覆盖顺序。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭；与既有 resolver activation 规则有同类实现边界复现迹象。 |
  | 影响范围 | 1 | 影响 update/repair command result、JSON/human output 显示名和 config merge order 的 public projection。 |
  | 风险等级 | 1 | 会让用户可见输出与 canonical resolver 语义不一致，造成自动化或人工判断使用错误项目名。 |
  | 根因稳定性 | 1 | command 层为显示字段单独读取 config 是容易复现的实现习惯，尤其在 planning context 已使用 resolver 但未回传显示值时。 |
  | 可执行性 | 2 | 可要求所有 config 派生 public 字段调用 shared resolver，并用四层覆盖 regression 覆盖 update 与 repair 两条 command path。 |
  | 文档缺口 | 1 | 全局文档已有集中 resolver 与 diagnostics/output 原则，但未细化 public command result 显示字段也必须复用 shared resolver。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: update/repair/status/validate 等 command result 中任何由 project config 或 customization 派生的 public JSON/human output 字段。
- **规避指南**:
  - 不得为 public command result 的显示字段在 command 或 diagnostics helper 中新增 base-config-only 读取路径；不得因为 planning 阶段已调用 resolver，就默认外层 public result 也使用了 merged value。
- **最佳实践**:
  - public result 字段若来自 config/customization，必须直接复用 shared resolver 或消费 resolver 已返回的 merged value；focused regression 应覆盖至少一条后层 override，并同时断言主要 command path 与 repair/alternate path。
- **全局文档建议**:
  - 不建议本次升格；`_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md` 已要求 config/customization merge logic 集中在 `src/config/`，并要求 public result 渲染由 diagnostics/output 层统一处理。本条作为 command result 字段接入细则 record-only 沉淀。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 evaluator 明确唯一 finding 为 P1 阻塞修复项，不降级为 TODO；Round 2 reviewer/evaluator 明确新增 finding 0、CR TODO 0，本次不修改 `cr-todo-backlog.md`。

### Story 4-3 / 2026-05-31

- **Story**: 4-3
- **分析来源**:
  - `4-3-code-review-summary-20260531-round-1.md`
  - `4-3-code-review-evaluation-20260531-round-1.md`
  - `4-3-code-review-summary-20260531-round-2.md`
  - `4-3-code-review-evaluation-20260531-round-2.md`
  - `4-3-code-review-summary-20260531-round-3.md`
  - `4-3-code-review-evaluation-20260531-round-3.md`
  - `4-3-code-review-summary-20260531-round-4.md`
  - `4-3-code-review-evaluation-20260531-round-4.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 P1 `patch` findings：Story 4.3 越界暴露 `update --repair` executable repair plan / `restore-canonical`，以及 manifest 存在但缺失或 malformed `sourceDescriptor` 时仍可继续生成 write-capable update plan；另有 1 个非阻塞 defer：默认 `npm test` 5s timeout 慢测治理。
  - Round 2 reviewer/evaluator 确认 Round 1 两个 blocker 已收敛，但新增 1 个 P1 `patch` finding：manifest 文件缺失、不可读或 YAML parse 失败时仍绕过 source descriptor blocker。
  - Round 3 reviewer/evaluator 确认 manifest 缺失/读取/parse blocker 已修复，但新增 1 个 P1 `patch` finding：`test/update-command.test.ts` 仍按旧 missing files-index 行为断言，导致全量 `npm test` 失败。
  - Round 4 reviewer/evaluator 均确认通过：repair 越界行为未回归；缺失或 malformed `sourceDescriptor`、manifest 缺失、不可读或 YAML parse 失败均阻断 write-capable update plan；`test/update-command.test.ts` 旧断言已修复。剩余慢测治理维持 CR TODO / defer。
  - 本次 04 使用模型：GPT-5.5。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；不修改全局文档；未解决慢测治理交给 05 TODO Tracker。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Source trust evidence 缺失或 malformed 时 update planning 必须 fail closed | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Command fixture 必须显式满足被测 gate 之前的前置 evidence | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| 默认 `npm test` 5s timeout 慢测治理 | 未通过：状态未解决 | - | todo-tracker | 交给 05 TODO Tracker |

### 提炼规则

#### CR-API-20：Source trust evidence 缺失或 malformed 时 update planning 必须 fail closed

- **来源问题**: Story 4.3 首轮实现中，manifest 存在但缺失或 malformed `sourceDescriptor` 时会返回空 issues，继续构建 update plan；Round 2 又发现 manifest 文件缺失、不可读或 YAML parse 失败时也返回空 issues，导致 `--yes` 下仍可能暴露 `writeAuthorized: true` 的 write-capable update plan。
- **CR 证据**:
  - `4-3-code-review-evaluation-20260531-round-1.md`: evaluator 确认缺失或 malformed `sourceDescriptor` 会绕过 source trust gate，必须生成 `source-integrity.*` / malformed blocker 并阻断 planning。
  - `4-3-code-review-evaluation-20260531-round-2.md`: evaluator 确认 manifest 文件缺失、不可读或 YAML parse 失败路径返回空 issues，必须改为 blocking issue。
  - `4-3-code-review-evaluation-20260531-round-4.md`: evaluator 确认 `readManifestContext()` 与 source descriptor parse 路径均已产生 blocking issue，`updatePlan.actions: []`、`writeAuthorized: false` 行为持续有效。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | 同一 Story 中连续两轮暴露 source trust evidence 不可用时 fail-open 的同类问题，Round 4 复审确认关闭。 |
  | 影响范围 | 1 | 影响 update planning、repair placeholder、source descriptor trust gate 和 command JSON/human output 的 write authorization 投影。 |
  | 风险等级 | 2 | 缺少可信 source evidence 时仍暴露 write-capable plan，会破坏 pre-write gate 并可能误导后续写入授权。 |
  | 根因稳定性 | 1 | 把 manifest/source descriptor 读取失败当作无 evidence 而非 blocking evidence，是 update/repair 前置检查中稳定易复现的实现习惯。 |
  | 可执行性 | 2 | 可要求所有 manifest/source descriptor 读取、parse、schema 失败路径生成 stable `source-integrity.*` error issue，并用 focused tests 断言空 actions 与 `writeAuthorized: false`。 |
  | 文档缺口 | 0 | Story 4.3 和 source trust gate 已有业务契约，本条作为 CR 实现检查点沉淀，不扩大到全局文档。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: `speclite update`、`speclite update --repair`、source descriptor trust/evidence gate、以及任何在写入前依赖 manifest/source evidence 构建 plan 的流程。
- **规避指南**:
  - 不得在 manifest 缺失、不可读、YAML parse 失败、`sourceDescriptor` 缺失或 schema malformed 时返回空 issues 并继续构建 write-capable plan。
- **最佳实践**:
  - source trust evidence 读取链路应 fail closed：失败路径生成 stable error issue，planning 在 action construction 前短路，public result 断言 `requiresConfirmation: false`、`writeAuthorized: false`、`updatePlan.actions: []`。
- **全局文档建议**:
  - 不建议本次升格；该规则偏 Story 4.3 update planning/source trust gate 的实现检查点，且本轮用户要求保守默认、不扩大修改全局文档。
- **本次落地**:
  - Round 1/2 fixer 已修复，Round 4 reviewer/evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-TEST-02：Command fixture 必须显式满足被测 gate 之前的前置 evidence

- **来源问题**: Story 4.3 Round 3 暴露 `test/update-command.test.ts` 仍使用缺 manifest fixture 断言 missing files-index conflict；但当前 source descriptor gate 应先于 files-index conflict 生效，导致全量 `npm test` 失败，也让测试目标与实际 gate 顺序不一致。Story 11.6 Round 2 再次出现同根因：legacy no-migration fixture 在 install 完成后才创建 legacy tree，因此只能证明 update/repair 后未改变，不能证明 install 面对 already-existing legacy artifacts 时的行为。Story 11.8 Round 1 又发现测试只匹配 legacy 文案，没有在第一条 write-capable command 前创建真实 legacy readiness tree，也没有逐阶段验证 discovery 与原位保护；三次都属于 fixture 未建立目标 gate 所要求的前置世界状态。
- **CR 证据**:
  - `4-3-code-review-summary-20260531-round-3.md`: reviewer 指出 missing files-index conflict 测试没有创建 `_speclite/_config/manifest.yaml`，实际先返回 `source-integrity.missing-source-descriptor`。
  - `4-3-code-review-evaluation-20260531-round-3.md`: evaluator 确认该测试断言问题为 P1，需要补齐 trusted manifest/source descriptor fixture 或改成 missing manifest gate 断言。
  - `4-3-code-review-evaluation-20260531-round-4.md`: evaluator 确认 `writeTrustedManifest()` 已让测试越过 source descriptor gate 后继续覆盖 missing files-index conflict，全量 `npm test` 通过。
  - `11-6-code-review-summary-20260904-round-2.md`: Finding #4 确认 legacy fixture 的 setup 顺序无法证明 install-existing no-migration，且 completion gate 的旧 evidence 超过实际覆盖。
  - `11-6-code-review-evaluation-20260904-round-2.md`: evaluator 将该 finding 确认为 P1，要求 install 前创建并 snapshot legacy main、supporting HTML 与 asset tree，并逐阶段断言 command success、source invariants、`changedPaths` 和 canonical counterpart absence。
  - `11-6-code-review-evaluation-20260904-round-5.md`: evaluator 确认六类 legacy entries 已在 install 前建立，install/update/repair 后逐阶段保持 path/type/hash/symlink text 且 canonical counterparts 不存在，该缺口已关闭。
  - `11-8-code-review-evaluation-20260905-round-1.md`: Finding #6 确认只验证 Markdown 中的 legacy/no-migration 措辞不能证明真实 discovery 与 lifecycle preservation；Fix Summary 在 install/update/repair 前建立真实 `{planning_artifacts}/ir-grill/` tree，并逐阶段比较 path、no-follow type、bytes、hash、tree 与 mutation-set 零交集。
  - `11-8-code-review-evaluation-20260905-round-4.md`: evaluator 确认真实 legacy tree 的原位 discovery 与 install/update/repair preservation 持续关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 4.3、11.6 与 11.8 均出现 fixture 未先满足目标 gate 前置状态、从而证明错误阶段、错误命令语义或仅证明文案的问题，并分别经后续复审关闭。 |
  | 影响范围 | 2 | 影响 install/update/repair 多阶段 lifecycle、source descriptor/files-index gate、legacy compatibility 与 completion evidence 的可信度。 |
  | 风险等级 | 1 | 错误 fixture 会让回归套件失败或误测为错误 gate，削弱测试对 public contract 的信号质量。 |
  | 根因稳定性 | 2 | 多 gate、多 lifecycle command flow 中，fixture 未显式满足前置 evidence、或用文案存在替代行为世界状态，是跨 Story 稳定复现的测试编写缺口。 |
  | 可执行性 | 2 | 可要求每个 command fixture 写明目标 gate，并补齐前置 trusted manifest/source descriptor 或明确断言前置 gate。 |
  | 文档缺口 | 1 | 现有测试规则未细化多 gate command fixture 的前置 evidence 要求。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: install/update/repair/status/validate 等存在 source trust、manifest/index、ownership、compatibility、conflict 多层 gate 的 command-level tests。
- **规避指南**:
  - 不得用缺失前置 evidence 的 fixture 去断言后置 gate；例如要测试 files-index conflict 时，必须先提供可信 manifest/source descriptor。
  - 不得在 lifecycle 首阶段之后才创建“already-existing”输入，再用后续阶段 invariants 代替首阶段 no-migration/no-copy 证据。
- **最佳实践**:
  - 测试 fixture 应显式服务一个 gate：若目标是后置 conflict，则补齐前置 gate 所需 evidence；若目标是前置 blocker，则断言前置 issue、空 plan 和禁止写入授权。
  - 多阶段 compatibility fixture 应在第一条命令前建立完整输入并 snapshot；每一阶段分别断言 command success/failure、path/type/content/hash/symlink text、changed paths 与目标侧 absence/presence，不能只比较最终状态。
- **全局文档建议**:
  - 不建议本次升格；该规则偏 command regression 编写实践，本次按用户授权 record-only 沉淀。
- **本次落地**:
  - Story 4.3 Round 3 fixer 已修复，Round 4 evaluator 确认关闭。Story 11.6 Round 2/3 fixer 补齐 install-before-existing 与逐阶段证据，Round 5 reviewer/evaluator 确认保持关闭。Story 11.8 Round 1 fixer 补齐真实 legacy readiness tree、discovery 与逐阶段原位保护，Round 4 reviewer/evaluator 确认保持关闭；本次不新增重复规则编号。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **新增 TODO backlog 候选**: Round 1 / Finding #3、Round 2/3/4 历史 CR TODO 均指向默认 `npm test` 5s timeout 慢测治理。该项未在 Story 4-3 中解决，latest evaluator 明确建议作为 P2 非阻塞 defer 继续记录，因此交给 05 TODO Tracker 写入 `cr-todo-backlog.md`。

### Story 4-4 / 2026-06-01

- **Story**: 4-4
- **分析来源**:
  - `4-4-code-review-summary-20260601-round-1.md`
  - `4-4-code-review-evaluation-20260601-round-1.md`
  - `4-4-code-review-summary-20260601-round-2.md`
  - `4-4-code-review-evaluation-20260601-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 4 个 P1 `patch` findings：partial failure diagnostics 缺少已成功写入的 `changedPaths`、validate 漏扫同目录嵌套 stale temp、safe-write cleanup failure 会抛 raw error、`allowExisting=true` 缺少 apply-time ownership/hash baseline preflight。
  - Fixer 已修复 4 项，并记录 focused tests、`npm run build`、全量 `npm test` 与 `git diff --check` 均通过；Round 2 reviewer/evaluator 均确认通过，需修复 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 (codex)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。
  - `CR-API-07` 已存在等价 partial progress 规则，本次按模板更新该规则的来源 Story、复现频次、评分和 4-4 证据；另新增 3 条 safe-write / validate 安全边界规则。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 非事务写入失败必须通过已契约字段暴露 partial progress | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only，更新既有 `CR-API-07` |
| Safe-write stale temp 诊断必须覆盖同目录受控 roots | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Safe-write cleanup failure 必须返回稳定 issue 而不是 raw error | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Existing overwrite 必须执行 apply-time ownership/hash baseline preflight | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### 既有规则更新：CR-API-07 非事务写入失败必须通过已契约字段暴露 partial progress

- **处理结果**: 不新建重复规则；已将 Story 4-4 作为第二个来源 Story 写入 `CR-API-07`，并将该规则总分从 7/12 更新为 8/12。
- **更新依据**: Story 4-4 Round 1 Finding #1 与 Story 1-5 的非事务 partial progress 问题等价，均要求多阶段写入失败时不得隐藏已经完成的 mutation。
- **同步状态**: 已写入规则总结

#### CR-SEC-11：Safe-write stale temp 诊断必须覆盖同目录受控 roots

- **来源问题**: `safeWriteFile` 使用 target 同目录 `.speclite-tmp-*` 临时文件，但 validate 首轮只扫描 `_speclite` 顶层 stale temp，漏掉 `_speclite/_config/**` 和 IDE mirror target 目录下的实际 stale temp。
- **CR 证据**:
  - `4-4-code-review-summary-20260601-round-1.md`: Finding #2 指出 validate 只扫描 `_speclite` 顶层，漏报 safe-write 同目录产生的嵌套 `.speclite-tmp-*`。
  - `4-4-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题违反 AC5/AC8，并要求按 installed files index、installer-owned roots 或受控目录集合递归发现。
  - `4-4-code-review-evaluation-20260601-round-2.md`: evaluator 确认 `_speclite`、`.claude/skills`、`.agents/skills` 与 files-index installer-controlled parent dirs 已纳入受控递归扫描，问题关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 validate file-integrity、safe-write temp cleanup diagnostics、IDE mirror 与 `_speclite/_config` 等 installer-owned roots。 |
  | 风险等级 | 2 | 漏报 stale temp 会削弱 safe mutation blocker 与人工清理诊断，可能让后续写入被不透明地阻断。 |
  | 根因稳定性 | 1 | 写入 primitive 使用同目录 temp，而 validation helper 只扫固定顶层，是文件系统安全链路容易复现的集成缺口。 |
  | 可执行性 | 2 | 可要求基于受控 roots 递归扫描 `.speclite-tmp-*`，输出 project-relative POSIX path，并用嵌套/IDE mirror regression 覆盖。 |
  | 文档缺口 | 0 | Architecture 已有 safe-write temp 与 validate stale temp 总原则，本条沉淀为 validate 接入检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: safe-write temp cleanup、validate file-integrity stale temp discovery、installer-owned runtime/config/artifact/IDE mirror roots。
- **规避指南**:
  - 不得只扫描 `_speclite` 顶层来判断 safe-write stale temp；任何 target 同目录 temp 都必须能被受控范围内的 validate 诊断发现。
- **最佳实践**:
  - validate 应从 `_speclite`、IDE skill mirrors 和 files-index installer-controlled parent dirs 构造受控 scan roots；递归发现 `.speclite-tmp-*` 时不得跟随 symlink，并保持 stable project-relative POSIX output。
- **全局文档建议**:
  - 不建议本次升格；全局文档已覆盖 safe-write / validate 总原则，本次按用户授权仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-SEC-12：Safe-write cleanup failure 必须返回稳定 issue 而不是 raw error

- **来源问题**: 首轮 `safeWriteFile` 在 temp-write 或 rename 异常后直接 `await rm(tempPath, { force: true })`，cleanup 自身失败时会抛出底层错误，绕过稳定 `file-integrity.stale-temp-file` issue。
- **CR 证据**:
  - `4-4-code-review-summary-20260601-round-1.md`: Finding #3 指出 safe-write cleanup failure 不是 best-effort，会抛 raw error。
  - `4-4-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题破坏 controlled failure 和 stable diagnostics，必须修复。
  - `4-4-code-review-evaluation-20260601-round-2.md`: evaluator 确认 cleanup failure 已返回稳定 issue，`affectedPath` 为 project-relative temp path，不泄露 raw stack 或 absolute path。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 shared safe-write primitive 以及 install/update/repair 等所有使用该 primitive 的写入命令。 |
  | 风险等级 | 2 | raw cleanup error 会破坏 stable CommandResult projection，并可能泄露本地路径或平台差异。 |
  | 根因稳定性 | 1 | cleanup 被当作普通 await 而非 best-effort failure branch，是文件系统异常处理中的稳定风险。 |
  | 可执行性 | 2 | 可要求 cleanup 独立 `try/catch`、stable issue code、manual action 和 serialization negative assertions。 |
  | 文档缺口 | 0 | 全局已有 stable issue / safe-write 总原则，本条作为 shared primitive 实现检查点记录。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: `src/fs/safe-write.ts`、safe-write cleanup、stale temp diagnostics、所有本地写入 command failure path。
- **规避指南**:
  - 不得让 cleanup failure 覆盖原始 safe-write controlled failure，也不得把 Node raw error、absolute temp path 或 stack 直接投影到 public result。
- **最佳实践**:
  - cleanup 必须 best-effort；失败时返回稳定 `file-integrity.stale-temp-file` issue，包含 manual action、failed step、pending cleanup steps 和 project-relative affected path，并由 tests 覆盖 serialization 安全。
- **全局文档建议**:
  - 不建议本次升格；该规则偏 shared primitive 具体实现检查点，本次按用户授权仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-SEC-13：Existing overwrite 必须执行 apply-time ownership/hash baseline preflight

- **来源问题**: 首轮 `safeWriteFile(...allowExisting=true)` 只凭 `allowExisting` 放行普通文件 overwrite，没有在 rename 前验证 expected ownership、current hash、path classification、type/symlink 或 stale temp blocker，后续 update/repair apply 误用时存在 unsafe overwrite 风险。
- **CR 证据**:
  - `4-4-code-review-summary-20260601-round-1.md`: Finding #4 指出 `allowExisting=true` 缺少 ownership/hash baseline preflight。
  - `4-4-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题违反 AC6 和 Task 5，要求 apply-time preflight 阻断 protected/unknown ownership、baseline drift、type mismatch、symlink 和 stale temp blocker。
  - `4-4-code-review-evaluation-20260601-round-2.md`: evaluator 确认 `safeWriteFile` 已要求 `expectedExistingFile` baseline，并在 rename 前验证 ownership、path classification、stale temp blocker 和 current hash；生产调用面未新增不安全 overwrite。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 2 | 影响 shared safe-write primitive、future update/repair apply、installer-owned baseline 消费和 protected path overwrite 安全。 |
  | 风险等级 | 2 | 缺少 apply-time baseline 会把 TOCTOU 漂移或错误调用变成覆盖 human/workflow/unknown-owned 文件的风险。 |
  | 根因稳定性 | 1 | 只在 planning 阶段校验、apply primitive 不复核 baseline，是写入安全链路中容易复现的流程缺口。 |
  | 可执行性 | 2 | 可要求 existing overwrite 必须提供 baseline，并用 protected ownership、unknown ownership、baseline drift、type mismatch、symlink 和 stale temp tests 检查。 |
  | 文档缺口 | 0 | 既有 ownership/path-safety 规则覆盖总体原则，本条沉淀 apply-time safe-write baseline preflight 细则。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: safe-write existing target overwrite、future update/repair apply、installer-owned files-index/hash baseline mutation。
- **规避指南**:
  - 不得只凭 `allowExisting=true` 覆盖现有文件；existing overwrite 必须在 apply-time 重新证明目标仍为预期 installer-owned baseline。
- **最佳实践**:
  - safe-write existing target path 需要 `expectedExistingFile` 或等价 wrapper；rename 前重新 lstat/read/hash/classify，阻断 protected/unknown ownership、baseline drift、type mismatch、symlink/case conflict 和 stale temp blocker。
- **全局文档建议**:
  - 不建议本次升格；该规则与既有 ownership/path-safety 文档相近，且全局文档修改超出本次收尾授权。本次只 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 9-2 / 2026-06-17

- **Story**: 9-2
- **分析来源**:
  - `9-2-code-review-summary-20260617-round-1.md`
  - `9-2-code-review-evaluation-20260617-round-1.md`
  - `9-2-code-review-summary-20260617-round-2.md`
  - `9-2-code-review-evaluation-20260617-round-2.md`
  - `9-2-code-review-summary-20260617-round-3.md`
  - `9-2-code-review-evaluation-20260617-round-3.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：fresh install 投影的 Python compatibility scripts 已记录为 installer-owned `runtime-compat-script`，但 `update --repair` 仍只能读取 project-relative `sourceRef`，无法从 package bundled source 恢复 canonical bytes。
  - Round 1 fixer 已补充 bundled source repair resolution 和 focused tests；Round 2 reviewer/evaluator 随后确认核心场景关闭，但发现新 P1：allowlist 只绑定 `sourceRef`，未绑定 target path，可能把 resolver bytes 写入非 resolver `_speclite/scripts/*` path。
  - Round 2 fixer 已将 `runtime-compat-script` repair source resolution 收紧为 target path 与 sourceRef 成对匹配；Round 3 reviewer/evaluator 确认 Round 1/2 findings 均关闭，新增 finding 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按外层 orchestrator 授权执行默认保守决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE、Story 文档、源码或 CR 进度文件。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Compatibility script repair 必须绑定 artifact kind、target path 与 sourceRef | 通过 | 8/12 | rules-summary | 用户本次授权默认保守决策：record-only |

### 提炼规则

#### CR-SEC-16：Compatibility script repair 必须绑定 artifact kind、target path 与 sourceRef

- **来源问题**: Story 9.2 首轮实现把 Python resolver compatibility scripts 作为 installer-owned `runtime-compat-script` 投影到 fresh install，但 explicit repair 的 canonical bytes 读取只依赖 project-relative `sourceRef`，导致 canonical sourceRef 与 `bundled-runtime-compat:*` fallback sourceRef 均不可恢复。Round 1 修复后又暴露 allowlist 只绑定 `sourceRef` 而不绑定 target path，schema-valid 但语义错误的 files-index entry 可让 `update --repair --yes` 把 resolver bytes 写入非 resolver `_speclite/scripts/*` path。
- **CR 证据**:
  - `9-2-code-review-summary-20260617-round-1.md`: Finding #1 指出 `readRepairCandidateBytes` 只委托 `readSourceEvidence`，fresh install 目标项目通常不包含 `assets/source/speclite/scripts/resolve_*.py`，`bundled-runtime-compat:scripts/...` 也不是 project-relative path。
  - `9-2-code-review-evaluation-20260617-round-1.md`: evaluator 确认该问题违反 AC4 repair ownership lifecycle，并要求覆盖 canonical sourceRef 与 `bundled-runtime-compat:*` fallback sourceRef repair。
  - `9-2-code-review-summary-20260617-round-2.md`: Finding #1 指出 Round 1 修复只校验 allowlisted `sourceRef` / scriptName，未校验 `entry.path` / `action.affectedPath` 必须是 approved resolver target path。
  - `9-2-code-review-evaluation-20260617-round-2.md`: evaluator 确认需要将 repair allowlist 同时绑定 `sourceRef` 与 target path，非 resolver `_speclite/scripts/*` target path 即使 sourceRef allowlisted 也不得写入。
  - `9-2-code-review-evaluation-20260617-round-3.md`: evaluator 确认 `readRepairCandidateBytes` 已要求 `artifactKind === "runtime-compat-script"`、resolver `sourceRef` 与 `targetPath === "_speclite/scripts/${scriptName}"` 成对匹配；positive 与 negative focused tests 均已覆盖。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中连续两轮暴露 repair source resolution 边界问题：先缺 bundled source resolution，再缺 target/sourceRef 配对；Round 3 复审验证关闭。 |
  | 影响范围 | 1 | 影响 `speclite update --repair`、installer-owned runtime compatibility assets、files-index sourceRef 消费和 repair apply 写入边界。 |
  | 风险等级 | 2 | source evidence 读取失败会破坏 AC4 explicit repair；sourceRef 未绑定 target path 又可能把 allowlisted bytes 写入错误 installer-owned path。 |
  | 根因稳定性 | 1 | 将 persisted metadata 的 `artifactKind`、`sourceRef` 与实际 target path 分开校验，是 update/repair source resolution 中稳定易复现的实现习惯风险。 |
  | 可执行性 | 2 | 可写成成对 allowlist 检查，并用 positive repair tests 与 malformed files-index negative test 自动验证。 |
  | 文档缺口 | 1 | 既有 `CR-SEC-09` 覆盖 classifier 优先级，`CR-API-20` 覆盖 source trust fail closed，但尚未沉淀 compatibility repair 中 artifact kind、target path 与 sourceRef 三者成对校验。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: `runtime-compat-script`、installer-owned compatibility assets、`update --repair` source resolution、files-index repair planning/apply，以及后续任何从 package bundled source 恢复 canonical bytes 的 installer-owned asset。
- **规避指南**:
  - 不得只凭 allowlisted `sourceRef` 或 `artifactKind` 就读取 bundled canonical bytes 并写入 `action.affectedPath`。
  - 不得让 malformed-but-schema-valid files-index entry 把 resolver bytes 恢复到非 approved resolver target path。
- **最佳实践**:
  - repair source resolution 必须同时证明 asset type、target path 与 sourceRef 成对匹配；positive tests 覆盖 approved target 的 deleted/drifted repair，negative tests 覆盖非 approved target 即使 sourceRef allowlisted 也保持 conflict / `missing-source-evidence` 且不写入。
- **全局文档建议**:
  - 暂不建议本次直接修改 `_bmad-output/project-context.md`、architecture、AGENTS 或 CLAUDE。该规则总分达到 8/12，但适用范围偏 update/repair compatibility asset 技术域，且已有全局/CR 规则覆盖更 broad 的 ownership、source evidence 和 path-safety 原则；后续若整理 update/repair 专章，可考虑把“installer-owned repair source 必须绑定 target path 与 source evidence”作为实现检查点补入。
- **本次落地**:
  - Round 1 fixer 已修复 bundled compatibility source repair；Round 2 fixer 已修复 target path/sourceRef 配对；Round 3 evaluator 确认关闭。
  - focused verification 记录包括 `npm test -- --run test/update-planning.test.ts` 通过，`test/update-planning.test.ts` 覆盖 approved resolver repair、`bundled-runtime-compat:*` fallback sourceRef repair 和非 resolver target path negative case。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 3 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 6-6 / 2026-06-02

- **Story**: 6-6
- **分析来源**:
  - `6-6-code-review-summary-20260602-round-1.md`
  - `6-6-code-review-evaluation-20260602-round-1.md`
  - `6-6-code-review-summary-20260602-round-2.md`
  - `6-6-code-review-evaluation-20260602-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 `auditor` 来源、`patch` 分类 finding：English companion SPEC 中 `generatedAt` wording 仍保留 broader parseable ISO，与 schema、中文 owning SPEC 和 regression test 已选择的 canonical UTC / JavaScript `Date.toISOString()` 契约不一致。
  - Fixer 已同步 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.en.md` 两处 wording 和 `_bmad-output/planning-artifacts/specs/08-fixture-contract.en.md` 一处 wording，并用 `rg` 确认 English companion SPEC 不再残留 broader wording pattern。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5 (gpt-5.5)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改 project-context、architecture、AGENTS/CLAUDE、owning SPEC 或源码。
  - 该问题属于当前 Story 的 companion SPEC mirror 同步收敛检查点，不升格为全局文档规则。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Companion SPEC mirror 必须同步契约收敛 wording | 通过 | 5/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-DOC-03：Companion SPEC mirror 必须同步契约收敛 wording

- **来源问题**: Story 6.6 AC2 已将 `generatedAt` 契约收敛为 canonical UTC / JavaScript `Date.toISOString()` millisecond UTC form，但 English companion SPEC 仍保留 broader ISO parseability wording，导致 schema、测试、中文 SPEC 与英文 companion SPEC 对外表达不一致。
- **CR 证据**:
  - `6-6-code-review-summary-20260602-round-1.md`: Finding #1 指出 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.en.md` 与 `_bmad-output/planning-artifacts/specs/08-fixture-contract.en.md` 仍保留 broader `generatedAt` wording。
  - `6-6-code-review-evaluation-20260602-round-1.md`: evaluator 确认该 finding 违反 AC2，要求同步 English companion SPEC wording，并记录修复范围。
  - `6-6-code-review-evaluation-20260602-round-2.md`: evaluator 确认 English companion SPEC 已收敛为 canonical UTC / `Date.toISOString()` wording，且未发现新的 `decision_needed`、`patch`、`defer` 或 `dismiss` findings。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 companion SPEC mirror、fixture semantic assertion wording 和 downstream contract readers。 |
  | 风险等级 | 1 | companion SPEC wording 漂移会误导实现者或文档消费者，但本次未造成 runtime schema 漏检。 |
  | 根因稳定性 | 1 | 中英文/companion SPEC 同步时容易只改 owning text 或代码契约，漏掉镜像 wording。 |
  | 可执行性 | 2 | 可用 focused `rg` pattern 检查 broader wording 残留，并要求 mirror SPEC 与 schema/test 选择同一契约。 |
  | 文档缺口 | 0 | 该规则是 Story 6.6 的 companion SPEC mirror 检查点，不需要升级为全局文档约束。 |

- **总分**: 5/12
- **建议去向**: rules-summary
- **适用范围**: 涉及 English companion SPEC、中文 owning SPEC、schema/test wording 同步收敛的 fixture / manifest contract 维护。
- **规避指南**:
  - 不得只同步中文 owning SPEC 或 runtime schema；当 Story 明确要求 wording 与 schema/test 同步时，companion SPEC mirror 中的 broader 或旧 wording 也必须复核。
- **最佳实践**:
  - 契约收敛后使用 focused `rg` 覆盖 owning SPEC 与 companion SPEC 的旧 wording pattern；CR 记录中列出镜像文件的修复位置和残留检查命令。
- **全局文档建议**:
  - 不建议本次升格；该问题主要绑定 Story 6.6 的 companion SPEC mirror 同步场景，按用户要求不扩大到 project-context 或 architecture。
- **本次落地**:
  - Round 1 fixer 已修复三处 English companion SPEC wording；Round 2 reviewer/evaluator 确认通过。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 6-2 / 2026-06-02

- **Story**: 6-2
- **分析来源**:
  - `6-2-code-review-summary-20260602-round-1.md`
  - `6-2-code-review-evaluation-20260602-round-1.md`
  - `6-2-code-review-summary-20260602-round-2.md`
  - `6-2-code-review-evaluation-20260602-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 P1 `patch` findings：normal update apply 后未同步 installed-state / files-index projection；existing update conflict failure 缺少 AC8 step state 且 summary 误导为已应用更新。
  - Fixer 已修复两项：apply 成功后写回 `_speclite/_config/files-index.json` projection，并在 conflict failure 中投影 completed / failed / pending step state、manualAction 和准确 summary。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改全局 project-context、architecture、AGENTS/CLAUDE 或源码。
  - 全局文档已覆盖 update plan / changedPaths / skippedPaths / conflicts、CommandResult summary template 和 command data payload 总体契约；本次两条作为 Story 6.2 暴露出的 implementation checkpoint 沉淀，不重复修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Normal update apply 成功后必须同步 installed-state projection | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Conflict failure 输出必须同时保持 structured step state 与准确 summary | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-28：Normal update apply 成功后必须同步 installed-state projection

- **来源问题**: Story 6.2 首轮实现中，normal update 在 `--yes` 且无 conflict 时写入 installer-owned planned update，但未同步 `_speclite/_config/files-index.json` 中对应 entry 的 hash / projection，导致下一次普通 update 可能把刚由 installer 写入的新内容误判为 `installer-owned-drift`。
- **CR 证据**:
  - `6-2-code-review-summary-20260602-round-1.md`: Finding #1 指出 `applyUpdateActions` 只执行写入并返回 `changedPaths` / `skippedPaths`，没有更新 files-index / manifest projection，定向复现第二次 update 失败为 `installer-owned-drift`。
  - `6-2-code-review-evaluation-20260602-round-1.md`: evaluator 确认该问题违反 AC4/AC7，属于 P1，需要修复 apply 后 projection 同步并增加 follow-up update 回归断言。
  - `6-2-code-review-evaluation-20260602-round-2.md`: evaluator 确认 `applyUpdateActions` 已记录成功应用 action，并通过 `syncAppliedFilesIndexProjection` 写回 files-index hash，fixture 与 regression 均已覆盖。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 normal update apply、installed-state/files-index projection、fixture release gate 和后续 update baseline。 |
  | 风险等级 | 2 | 成功写入后的 baseline 不一致会把后续安全 update 误判为 drift conflict，破坏 existing install update 持续可用性。 |
  | 根因稳定性 | 1 | planned effect、actual write result 与 installed-state projection 三层容易脱节，是 update/repair 实现中的稳定风险。 |
  | 可执行性 | 2 | 可要求 apply 成功后同步 projection，并用 `update --yes` 后立即再跑普通 `update` 的 regression 检查无同路径 drift。 |
  | 文档缺口 | 0 | 全局文档已有 changedPaths / skippedPaths 表示实际执行结果、plan actions 表示 planned effects 的总契约，本条作为实现检查点沉淀。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: normal update、installer-owned `create` / `update` action apply、installed-state/files-index projection、existing-install update fixture gate。
- **规避指南**:
  - 不得只更新目标文件内容而保留旧 installed-state projection；成功应用 installer-owned planned write 后，baseline metadata 必须与 actual write result 一致。
- **最佳实践**:
  - apply 阶段记录成功写入的 installer-owned action，用 planned `expectedHash` 更新 files-index entry，并把 metadata projection write 纳入 `changedPaths`；回归测试应覆盖 follow-up 普通 update 不再出现同路径 `installer-owned-drift`。
- **全局文档建议**:
  - 不建议本次升格；全局 update safety 与 command result 契约已覆盖 plan/actual/conflict 总边界，直接修改全局文档会扩大本次 04/05/06 收尾范围。本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-29：Conflict failure 输出必须同时保持 structured step state 与准确 summary

- **来源问题**: Story 6.2 首轮实现中，existing update conflict failure 的 `update.conflicts` issue 缺少 AC8 要求的 completed / failed / pending step state 与 manual action，且 expected JSON summary 错误宣称已应用更新，和 `writeAuthorized=false`、`changedPaths=[]`、conflicts failure 状态矛盾。
- **CR 证据**:
  - `6-2-code-review-summary-20260602-round-1.md`: Finding #2 指出 conflict projection 只写 `details.conflictCount`，human renderer 不展示 step state，fixture expected JSON summary 错误写成 applied updates。
  - `6-2-code-review-evaluation-20260602-round-1.md`: evaluator 确认该问题违反 AC8 的 structured automation contract 和 failure messaging correctness，属于 P1。
  - `6-2-code-review-evaluation-20260602-round-2.md`: evaluator 确认 conflict lifecycle state 已投影到 command data 与 issue details，human output 已展示 Step State，summary 已改为 conflict-before-apply 且 no project files changed。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 update conflict JSON projection、human-readable output、fixture expected output 和 automation consumers。 |
  | 风险等级 | 2 | 失败 summary 与 structured result 矛盾会误导自动化和人工判断，缺少 step state 会削弱 failure gate 可诊断性。 |
  | 根因稳定性 | 1 | command summary、issue details、command data 与 renderer 多处 projection 容易不一致，后续 failure path 可能复现。 |
  | 可执行性 | 2 | 可用 schema、fixture expected JSON、human output 和 focused regression 同时断言 step state、manualAction 与 summary。 |
  | 文档缺口 | 0 | 全局文档已有 CommandResult summary template、command data payload 和 conflicts failure 总契约，本条作为实现检查点沉淀。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: update / update.repair failure path、`update.conflicts` issue projection、human renderer、fixture release gate 和 command result schema。
- **规避指南**:
  - 不得让 failure summary 宣称已应用更新，也不得只在人类输出或只在 issue 中表达失败进度；automation 依赖的 step state 必须进入 structured fields。
- **最佳实践**:
  - conflict failure 应稳定投影 completedSteps、failedStep、pendingSteps、blocking conflict reason 和 manualAction；fixture tests 同时覆盖 JSON structured fields、human Step State 和 summary 与 `writeAuthorized` / `changedPaths` 的一致性。
- **全局文档建议**:
  - 不建议本次升格；全局 command result 与 update safety 契约已有相近约束，修改全局文档超出本次收尾授权。本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 6-1 / 2026-06-02

- **Story**: 6-1
- **分析来源**:
  - `6-1-code-review-summary-20260602-round-1.md`
  - `6-1-code-review-evaluation-20260602-round-1.md`
  - `6-1-code-review-summary-20260602-round-2.md`
  - `6-1-code-review-evaluation-20260602-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 3 个 P1 `patch` findings：semantic JSON comparison 依赖 `JSON.stringify` 对象字段顺序、`allowedNonStableFields` 可掩盖非 schema-declared timestamp 字段、manifest `expectedOutputClass` 未绑定 expected output class registry。
  - Round 1 fixer 已修复 3 个 P1，并记录 `npx vitest run test/fixture-contract.test.ts`、focused Vitest、`npm run build`、`npm test` 均通过。
  - Round 2 reviewer/evaluator 均确认通过；新增 blocking finding 0。唯一未解决项为 `source-integrity` manifest id 与 release gate registry 粒度不一致，维持 P2 defer / 非阻塞。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。
  - `source-integrity` 粒度不一致仍未解决，04 不写入规则总结，交由 05 TODO Tracker 管理。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Semantic JSON fixture comparison 不得依赖对象字段插入顺序 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Stable fixture normalization 只能覆盖 schema-declared timestamp fields | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Manifest 枚举字段必须绑定 executable registry schema | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Source integrity manifest id 与 release gate registry 粒度不一致 | 未通过 | 交给 05 | todo-tracker | 未解决非阻塞项，不写入规则总结 |

### 提炼规则

#### CR-TEST-03：Semantic JSON fixture comparison 不得依赖对象字段插入顺序

- **来源问题**: Story 6.1 首轮实现中，`compareSemanticJson` 在 stable normalization 后直接比较 `JSON.stringify(actual)` 与 `JSON.stringify(expected)`，导致字段和值相同但 object key insertion order 不同的 JSON 被误判为 mismatch。
- **CR 证据**:
  - `6-1-code-review-summary-20260602-round-1.md`: Finding #1 指出 semantic JSON comparison 仍按字符串顺序比较对象，违背 Story 6.1 对 parsed JSON semantic comparison 的要求。
  - `6-1-code-review-evaluation-20260602-round-1.md`: evaluator 确认该问题为 P1，需要修复为结构化 deep equality 或 canonical key ordering，并补充对象字段顺序回归测试。
  - `6-1-code-review-evaluation-20260602-round-2.md`: evaluator 确认 `compareSemanticJson` 已改为 stable normalization 后使用 `isDeepStrictEqual`，并已有 nested object key insertion order 回归覆盖。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 fixture expected output semantic comparison、command JSON snapshot 和 manifest/index snapshot 比较策略。 |
  | 风险等级 | 1 | 会造成语义相同的 JSON 误失败，削弱 fixture contract 稳定性并增加维护者按实现细节重排 snapshot 的成本。 |
  | 根因稳定性 | 1 | 把 serialization output 当作 semantic equality 是测试 helper 中容易复现的实现习惯。 |
  | 可执行性 | 2 | 可通过结构化 deep equality 或 canonical key ordering 检查，并配套 object key order regression。 |
  | 文档缺口 | 1 | 全局 SPEC 已有 semantic comparison 原则，本条补充 fixture helper 的可执行实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: fixture comparison helper、CommandResult JSON snapshots、manifest/index expected outputs、resolve parity 等需要比较 parsed JSON 语义的测试资产。
- **规避指南**:
  - 不得用 `JSON.stringify(actual) === JSON.stringify(expected)` 判断 parsed JSON object 的语义相等。
- **最佳实践**:
  - 对 plain object 使用结构化 deep equality 或 canonical key ordering；array 保留 contract ordering 语义，并补充 key insertion order 不同但语义相同的 focused regression。
- **全局文档建议**:
  - 不建议本次升格；architecture 与 fixture contract SPEC 已覆盖 semantic comparison 总原则，本条作为 Story 6.1 暴露出的 test helper implementation checkpoint 记录。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-TEST-04：Stable fixture normalization 只能覆盖 schema-declared timestamp fields

- **来源问题**: Story 6.1 首轮实现中，`allowedNonStableFields` 只要包含字段名就会把字段归一化为 `"<iso8601>"`，`randomId`、`processId` 等非 timestamp 字段可被误放行，导致 unstable snapshot 漏检。
- **CR 证据**:
  - `6-1-code-review-summary-20260602-round-1.md`: Finding #2 指出 `allowedNonStableFields` 可以掩盖非 timestamp 字段，违反 AC 4 对稳定输出的限制。
  - `6-1-code-review-evaluation-20260602-round-1.md`: evaluator 确认该问题为 P1，需要将 allowlist 收窄为 schema-declared timestamp fields，并覆盖 `randomId`、`processId`、`durationMs` 负向测试。
  - `6-1-code-review-evaluation-20260602-round-2.md`: evaluator 确认 `SCHEMA_DECLARED_TIMESTAMP_FIELDS` 已限制为 `createdAt`、`generatedAt`、`timestamp`、`updatedAt`，非 timestamp allowlist 路径已有负向测试。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 stable fixture output、manifest/generated metadata、artifact metadata 和 JSON snapshot normalization。 |
  | 风险等级 | 2 | 会把 random/process/duration 等不稳定字段伪装为稳定 timestamp，导致本应失败的 fixture snapshot 漏检。 |
  | 根因稳定性 | 1 | 把字段名 allowlist 当作类型声明是 snapshot normalization 中容易复现的缺口。 |
  | 可执行性 | 2 | 可检查 schema-declared timestamp allowlist、timestamp parse 校验，并配套正负向 focused tests。 |
  | 文档缺口 | 0 | 全局 architecture 已约束 stable fixture snapshot 只能 normalize/exclude 明确声明的 timestamp 差异。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: fixture comparison helper、artifact metadata、manifest/index generated metadata、任何 stable snapshot normalization 逻辑。
- **规避指南**:
  - 不得仅凭调用方传入字段名就归一化 non-stable field；random id、process id、duration、profiling sample、stack trace 等不得进入 stable output。
- **最佳实践**:
  - 归一化前先绑定 owning schema 声明的 timestamp field allowlist，并校验值为可解析 timestamp；focused tests 同时覆盖合法 timestamp 与非 timestamp allowlist 的失败路径。
- **全局文档建议**:
  - 不建议本次升格；全局文档已有 timestamp/stable fixture snapshot 原则，本条作为 CR 实现检查点沉淀。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-27：Manifest 枚举字段必须绑定 executable registry schema

- **来源问题**: Story 6.1 首轮实现中，`FixtureCaseManifestSchema.expectedOutputClass` 使用任意非空字符串，未绑定 `ExpectedOutputClassSchema`，导致 manifest 可声明未知 expected output class 并绕过 executable registry。
- **CR 证据**:
  - `6-1-code-review-summary-20260602-round-1.md`: Finding #3 指出 manifest `expectedOutputClass` 没有绑定 expected output class registry。
  - `6-1-code-review-evaluation-20260602-round-1.md`: evaluator 确认该问题为 P1，要求 manifest parser 拒绝未知 expected output class 并补充正负向测试。
  - `6-1-code-review-evaluation-20260602-round-2.md`: evaluator 确认 `expectedOutputClass` 已改为 `ExpectedOutputClassSchema.optional()`，manifest parser 已覆盖合法 `command-json` 与非法 `unknown-output`。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 fixture manifest parser、expected output class registry、release gate classification 后续消费。 |
  | 风险等级 | 2 | 未绑定 registry 会让无 parser anchor / comparison rule 的 class 进入合法 manifest，破坏 automation contract。 |
  | 根因稳定性 | 1 | schema 中用 `z.string()` 表达枚举字段而未复用 registry schema，是后续 manifest 字段扩展中可复现的实现风险。 |
  | 可执行性 | 2 | 可检查 manifest schema 必须复用 executable enum/registry schema，并用 unknown value negative test 覆盖。 |
  | 文档缺口 | 0 | 全局 SPEC 已要求 expected output classes explicit，本条作为 manifest parser implementation checkpoint 记录。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: fixture manifest、manifest/index schema、adapter/source/validation 等拥有 executable registry 或 enum vocabulary 的 file contract。
- **规避指南**:
  - 不得在 manifest parser 中用任意非空字符串承接已存在 executable registry 的枚举字段。
- **最佳实践**:
  - 字段 schema 应直接复用 registry schema 或由 registry 派生；新增 registry value 时同步 parser、classification、fixtures 和 unknown value negative test。
- **全局文档建议**:
  - 不建议本次升格；全局 fixture contract SPEC 已覆盖 expected output classes explicit，本条不扩大到全局文档修改。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **新增 TODO 候选**: `source-integrity` manifest id 与 release gate registry 粒度不一致。Round 2 evaluator 明确认可该项为 P2 defer / 非阻塞，适合交由 05 TODO Tracker；04 不将其写入已沉淀规则总结。

### Story 5-5 / 2026-06-01

- **Story**: 5-5
- **分析来源**:
  - `5-5-code-review-summary-20260601-round-1.md`
  - `5-5-code-review-evaluation-20260601-round-1.md`
  - `5-5-code-review-summary-20260601-round-2.md`
  - `5-5-code-review-evaluation-20260601-round-2.md`
  - `5-5-code-review-summary-20260601-round-3.md`
  - `5-5-code-review-evaluation-20260601-round-3.md`
  - `5-5-code-review-summary-20260601-round-4.md`
  - `5-5-code-review-evaluation-20260601-round-4.md`
  - `5-5-code-review-summary-20260601-round-5.md`
  - `5-5-code-review-evaluation-20260601-round-5.md`
  - `5-5-code-review-summary-20260601-round-6.md`
  - `5-5-code-review-evaluation-20260601-round-6.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：blocked source 的 no-write gate 只依赖上游 command/resolver 分支，`InstallPlanSchema` 与 `applyInstallPlan` 写入边界本身没有 fail closed。
  - Round 2-5 reviewer/evaluator 连续确认并修复 write boundary failure shape、runtime/test touched-file type diagnostics、optional callback 传参和 validation/test touched-surface type diagnostics；这些细项分别被最小修复关闭，不转 CR TODO。
  - Round 6 reviewer/evaluator 均通过；四桶为 `decision_needed=0`、`patch=0`、`defer=0`、`dismiss=0`，需修复项 0，CR TODO 0。全仓 `tsc` 仍因既有类型债务失败，但 Story 5.5 touched surface 过滤无输出。
  - Story 5.5 已修复 Story 5.4 遗留 `TODO-004` 范围：resolved Git install human output 的 `confirmationState` 基于 resolved evidence/version/contentHash 显示 `confirmed`，未确认 Git access gate 仍保持 `pending` 且不调用 Git client。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。用户已授权默认推荐决策；本次执行 record-only，仅写入本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Blocked SourceDescriptor 必须在 schema 与 runtime 写入边界双层 fail closed | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| 全仓 typecheck 既有债务必须用 Story touched surface 过滤裁决 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-26：Blocked SourceDescriptor 必须在 schema 与 runtime 写入边界双层 fail closed

- **来源问题**: Story 5.5 Round 1 中，blocked source 的写入阻断主要依赖 `runInstallCommand` 上游分支；`InstallPlanSchema` 仍可接受 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus === "blocked"` 的 plan，`applyInstallPlan` 也可能在获取 operation lock 后继续写入。
- **CR 证据**:
  - `5-5-code-review-summary-20260601-round-1.md`: Finding #1 指出 blocked source 的写入阻断没有落在 install plan / apply 写入边界本身。
  - `5-5-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题为 P1，要求 schema 层拒绝已授权 blocked plan，并在 runtime apply 获取 lock 前 fail closed。
  - `5-5-code-review-evaluation-20260601-round-6.md`: evaluator 确认 `InstallPlanSchema.superRefine` 与 `applyInstallPlan` 的 blocked descriptor gate 未回退，runtime 返回 `changedPaths: []` 且 details 不泄露 raw source/path。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 确认，并由后续多轮复审验证未回退。 |
  | 影响范围 | 2 | 影响 source trust、install plan schema、runtime apply、operation lock、write authorization 和 public diagnostics。 |
  | 风险等级 | 2 | blocked source 若越过写入边界，可能导致不可信来源写入、operation lock 误获取或 public diagnostics 泄露来源细节。 |
  | 根因稳定性 | 1 | 属于把 no-write invariant 放在 command 上游而非 shared write boundary 的实现习惯，后续 update/repair/apply 复用时容易复现。 |
  | 可执行性 | 2 | 可用 schema regression、direct `applyInstallPlan` no-lock/no-write regression 和 redaction negative assertion 检查。 |
  | 文档缺口 | 0 | SourceDescriptor、InstallPlan 与 write eligibility SPEC 已覆盖总原则，本条作为 CR 实现检查点沉淀。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: install/update/repair 等消费 `SourceDescriptor`、`InstallPlanSchema` 和 runtime apply/write boundary 的流程。
- **规避指南**:
  - 不得只在 command orchestration 上游阻断 `trustStatus=blocked`；已授权 plan schema 与 runtime apply boundary 都必须 fail closed。
  - runtime apply 的 blocked gate 必须发生在获取 operation lock 或执行任何 filesystem write 之前。
- **最佳实践**:
  - schema 层拒绝 `writeAuthorized=true` + blocked descriptor；runtime 层返回稳定 `source-integrity.blocked-source` failure、`changedPaths: []` 和 no-lock/no-write 结果。
  - failure details 只保留稳定 reason/source type，不输出 `resolvedRoot`、raw URL、本机 absolute path、cache/temp/staging path、raw stderr 或 stack trace。
- **全局文档建议**:
  - 不建议本次升格；全局 source descriptor / install plan contract 已覆盖 trust/write eligibility 总原则，且用户本次限定 04 为 record-only，不修改全局文档。
- **本次落地**:
  - Round 1 fixer 已修复；Round 6 reviewer/evaluator 确认未回退。
- **同步状态**: 已写入规则总结

#### CR-PROCESS-01：全仓 typecheck 既有债务必须用 Story touched surface 过滤裁决

- **来源问题**: Story 5.5 Round 3-5 中，`npx tsc --noEmit` 持续因全仓既有类型债务失败；reviewer/evaluator 需要区分本 Story touched surface 的新增诊断与历史债务，避免把全仓债务误判为当前 Story blocker，也避免遗漏本 Story touched-file 诊断。
- **CR 证据**:
  - `5-5-code-review-summary-20260601-round-3.md`: reviewer 指出全仓 `tsc` 失败中仍包含 Story touched files 的相关诊断，要求 evaluator 裁决并最小清理。
  - `5-5-code-review-summary-20260601-round-4.md`: reviewer 在全仓失败背景下过滤出 `src/ide/target-writer.ts` 的 Story touched-surface 诊断。
  - `5-5-code-review-summary-20260601-round-5.md`: reviewer 扩大到 Story 5.5 validation/test touched surface 后过滤出剩余相关诊断。
  - `5-5-code-review-evaluation-20260601-round-6.md`: evaluator 复核 Story 5.5 touched surface 过滤无输出，并明确全仓 `tsc` 退出码 2 属于既有类型债务，不阻塞本 Story。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 多轮复现，Round 3-5 均需要用 touched-surface 过滤裁决。 |
  | 影响范围 | 1 | 影响 CR reviewer/evaluator/fixer 对 typecheck 失败的归因、修复边界和通过判断。 |
  | 风险等级 | 1 | 误归因会扩大修复范围或遗漏当前 Story 新增类型诊断，但通常不直接造成运行时缺陷。 |
  | 根因稳定性 | 1 | 在存在全仓既有 typecheck 债务的仓库中，Story 局部修复容易反复遇到该判断问题。 |
  | 可执行性 | 2 | 可要求先跑全仓命令记录退出码，再用明确 touched-file/touched-surface `rg` 过滤并把结果写入 CR 记录。 |
  | 文档缺口 | 1 | 现有 CR 记录体现了该做法，但尚未在规则总结中沉淀为 reviewer/evaluator/fixer 的复用判断规则。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: 存在全仓既有 typecheck/lint/test 债务时的 Story CR reviewer、evaluator 和 fixer 收口流程。
- **规避指南**:
  - 不得只因全仓 `tsc` 退出码非 0 就扩大当前 Story 修复范围；也不得只因“全仓已有债务”忽略 touched surface 中的新诊断。
- **最佳实践**:
  - 先记录全仓命令退出码和历史债务判断，再用 Story touched files / touched surface 的稳定路径过滤输出。
  - 若过滤结果非空，只修当前 Story touched surface；若过滤结果为空，可把全仓失败记录为既有债务并允许 Story 继续收尾。
- **全局文档建议**:
  - 不建议本次升格；该规则属于 CR 流程操作检查点，本次按用户授权仅 record-only。
- **本次落地**:
  - Round 3-5 fixer 已逐项清理 Story 5.5 touched-surface 诊断；Round 6 evaluator 确认过滤无输出。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 6 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不新增 TODO。
- **需由 05 处理的既有 TODO**: `TODO-004` 已在 Story 5.5 范围内修复，并由 Round 6 reviewer/evaluator 确认未回退；交由 05 按 backlog 格式标记为 resolved。

### Story 5-4 / 2026-06-01

- **Story**: 5-4
- **分析来源**:
  - `5-4-code-review-summary-20260601-round-1.md`
  - `5-4-code-review-evaluation-20260601-round-1.md`
  - `5-4-code-review-fixer-summary-20260601-round-1.md`
  - `5-4-code-review-summary-20260601-round-2.md`
  - `5-4-code-review-evaluation-20260601-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 P1 `patch` finding：installed Git descriptor 可用非 SHA selector 伪装 `git-commit` evidence 并通过 validate；explicit commit SHA 未证明为 commit-ish 即可写入 `git-commit` evidence。
  - Round 1 fixer 已修复 2 个 P1，并通过 `npm test -- test/git-source-resolution.test.ts`、affected focused tests、`npm test`、`npm run build` 和 scoped `git diff --check`。
  - Round 2 reviewer/evaluator 均确认通过；需修复 0，可忽略 0，CR TODO 1。
  - 本次 04 使用模型：GPT-5 Codex (codex)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。
  - 未解决的 P2：confirmed Git install human output 仍显示 `confirmationState=pending`，交给 05 TODO Tracker，不在本文件重复作为已沉淀规则管理。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Git source descriptor validate 必须拒绝非 full commit SHA evidence | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Git commit evidence 必须经过 commit-ish verification 后才能写入 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| confirmed Git install human output 仍显示 `confirmationState=pending` | 未通过：状态未解决 | - | todo-tracker | 交给 05 TODO Tracker |

### 提炼规则

#### CR-API-24：Git source descriptor validate 必须拒绝非 full commit SHA evidence

- **来源问题**: Story 5.4 Round 1 暴露 installed Git descriptor 中 `version: "main"` 与 `git-commit.commitSha: "main"` 可通过 local validate，导致 branch/tag/raw selector 能伪装成 concrete commit evidence。
- **CR 证据**:
  - `5-4-code-review-summary-20260601-round-1.md`: Finding #1 指出 `SourceIntegrityEvidenceSchema` 与 Git validate 分支只检查非空字符串和 equality，未检查 full 40-hex SHA。
  - `5-4-code-review-evaluation-20260601-round-1.md`: evaluator 独立复现 `version=main` / `commitSha=main` 返回 `issues: []`，确认该问题为 P1。
  - `5-4-code-review-fixer-summary-20260601-round-1.md`: fixer 已收紧 schema/validate full SHA shape，并补充 malformed installed descriptor negative tests。
  - `5-4-code-review-evaluation-20260601-round-2.md`: evaluator 确认 Git descriptor full SHA schema / validate gate 已修复。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 Git `SourceDescriptor` schema、local validate、manifest installed-state health 和 source-integrity diagnostics。 |
  | 风险等级 | 2 | malformed installed Git evidence 被 validate 放过会削弱 floating source 后置门禁和自动化健康判断。 |
  | 根因稳定性 | 1 | 把 evidence presence/equality 当作语义有效性，是 source descriptor validation 中容易复现的实现习惯。 |
  | 可执行性 | 2 | 可通过 shared full SHA schema、local-only validate guard 和 focused malformed descriptor tests 检查。 |
  | 文档缺口 | 0 | source descriptor contract 已覆盖 Git commit evidence 与 validate no-network 总原则，本条作为 CR 实现检查点沉淀。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: Git source descriptor、`git-commit` integrity evidence、manifest installed projection、`speclite validate` local source-integrity rule。
- **规避指南**:
  - 不得只因 Git descriptor `version` 与 `git-commit.commitSha` 相等就视为有效 evidence；两者都必须是 full concrete commit SHA。
- **最佳实践**:
  - 在 schema 和 validate 两层复用 full commit SHA guard；validate 保持 local-only，只检查 descriptor/evidence shape，不访问 Git remote、freshness 或 provenance。
- **全局文档建议**:
  - 不建议本次升格；全局 source descriptor / validation contract 已覆盖 Git commit evidence 与 local-only validate 边界，本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-25：Git commit evidence 必须经过 commit-ish verification 后才能写入

- **来源问题**: Story 5.4 Round 1 暴露 explicit 40-hex selector 只要出现在 `ls-remote` 输出的任意 advertised oid 中，即可被写入 `version` 与 `git-commit.commitSha`，没有证明该对象是 commit-ish。
- **CR 证据**:
  - `5-4-code-review-summary-20260601-round-1.md`: Finding #2 指出 resolver 只解析 `<oid>\t<ref>`，没有执行 `git rev-parse --verify --end-of-options <rev>^{commit}` 或等价 commit-ish verification。
  - `5-4-code-review-evaluation-20260601-round-1.md`: evaluator 独立复现 arbitrary advertised tag oid 可生成 `git-commit` evidence，确认该问题为 P1。
  - `5-4-code-review-fixer-summary-20260601-round-1.md`: fixer 已新增 `GitClient.verifyCommit`，并要求 branch/tag/full-ref/explicit SHA 候选 oid 经验证后才写入 descriptor。
  - `5-4-code-review-evaluation-20260601-round-2.md`: evaluator 确认 explicit SHA 要求 verified SHA 与 requested SHA 一致，verification failure / exception 均 blocked。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 Git resolver、install planning eligibility、source descriptor evidence 和 focused fixture contract。 |
  | 风险等级 | 2 | 未证明 commit-ish 的 object 进入 `git-commit` evidence 会污染 install planning 和 installed state。 |
  | 根因稳定性 | 1 | source resolver 容易把 string shape 或 advertised oid 当作 proof，后续 source-specific evidence 扩展也可能复现。 |
  | 可执行性 | 2 | 可要求 resolver 调用 injected commit verification，并用 annotated tag object、non-commit oid、verification failure/exception tests 覆盖。 |
  | 文档缺口 | 0 | Story/SPEC 已明确 commit-ish proof 要求，本条作为 CR 实现检查点沉淀。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: Git source resolver、Git client abstraction、source resolution plan confirmed path、Git evidence 写入前门禁。
- **规避指南**:
  - 不得把 full 40-hex 字符串或 `ls-remote` advertised oid 当作 commit proof；写入 `git-commit` evidence 前必须证明最终对象可解引用为 commit。
- **最佳实践**:
  - 通过 injected `verifyCommit` 或等价 Git-safe path 解析 commit-ish；explicit SHA 必须验证结果与 requested SHA 完全一致，branch/tag/full-ref 必须写入 dereferenced commit SHA。
- **全局文档建议**:
  - 不建议本次升格；该规则细化 Git source resolver implementation checkpoint，且 owning Story/SPEC 已覆盖 commit-ish proof 总原则。本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **新增 TODO 候选**: confirmed Git install human output 仍显示 `confirmationState=pending`。
- **建议优先级**: P2。
- **建议类别**: other。
- **交接理由**: Round 2 evaluator 确认该问题真实存在且影响 external access confirmation 的 human audit 展示，但 runtime confirmation gate 与 Git evidence 写入门禁已生效，不阻塞 Story 5.4 finalizer。

### Story 5-3 / 2026-06-01

- **Story**: 5-3
- **分析来源**:
  - `5-3-code-review-summary-20260601-round-1.md`
  - `5-3-code-review-evaluation-20260601-round-1.md`
  - `5-3-code-review-fixer-summary-20260601-round-1.md`
  - `5-3-code-review-summary-20260601-round-2.md`
  - `5-3-code-review-evaluation-20260601-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：confirmed local source 已记录 local `SourceDescriptor` / evidence，但 module discovery、IDE mirror copy、files index 与 skill index 仍读取 bundled source，导致 source evidence 与 actual installed content 不一致。
  - Fixer 已按保守边界修复：`local` source 通过 private non-enumerable `installSourceRoot` 贯穿 module discovery 与 write phase；public descriptor、manifest、human output、files index 和 skill index 只使用 display-safe `local-source/...` ref；`local-tarball` / `offline-bundle` 在无 extractor/canonical tree handle 时写入前稳定阻塞，artifact `contentHash` 保持 raw bytes hash。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，可忽略 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。
  - Source descriptor、install plan 与 manifest/index owning SPEC 已覆盖 canonical source、write eligibility、redaction 和 source evidence 总原则；本条作为 CR 实现检查点沉淀，不重复修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Source evidence 必须驱动实际 install input，否则写入前阻塞 | 通过 | 10/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-23：Source evidence 必须驱动实际 install input，否则写入前阻塞

- **来源问题**: Story 5.3 首轮实现中，confirmed local source 会生成 local `SourceDescriptor`、`contentHash` 和 integrity evidence，但后续 install planning、module discovery、IDE mirror copy、files index 与 skill index 仍使用 bundled source tree，造成 manifest/sourceDescriptor 记录 local evidence，而 actual installed content 来自 bundled source。
- **CR 证据**:
  - `5-3-code-review-summary-20260601-round-1.md`: Finding #1 指出 local resolution 成功后安装阶段仍固定读取 bundled source，导致 source evidence 与 installed state 不一致。
  - `5-3-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题为 P1，要求 local canonical source root 贯穿 install；tarball/offline bundle 若没有 canonical tree handle 必须写入前阻塞。
  - `5-3-code-review-fixer-summary-20260601-round-1.md`: fixer 记录 `local` source private install source handle、local copy/hash/index 链路，以及 artifact source 无 canonical tree handle 时阻塞写入。
  - `5-3-code-review-evaluation-20260601-round-2.md`: evaluator 确认 Round 1 P1 已修复，local canonical root 已贯穿 install，private root 未泄露，tarball/offline stable blocked，CR TODO 0。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 2 | 影响 source resolver、install orchestration、module discovery、IDE mirror copy、manifest/index、files index 与 skill index。 |
  | 风险等级 | 2 | 会让 public source evidence 指向 local source，而实际安装内容来自 bundled source，破坏来源完整性和后续验证可信度。 |
  | 根因稳定性 | 2 | 属于 source descriptor public projection 与 private install source handle 脱节的架构链路缺口，后续 source 类型扩展容易复现。 |
  | 可执行性 | 2 | 可要求 install source handle 贯穿 discovery/copy/hash/index，并用 marker source、no private path leakage、artifact-source blocked regression 检查。 |
  | 文档缺口 | 1 | owning SPEC 已覆盖 source descriptor/write eligibility 总原则，但未沉淀“source evidence 必须驱动 actual install input”的 CR 实现检查点。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: `src/source/` source resolver、install orchestration、module discovery、IDE mirror writer、manifest/files/skill index 生成，以及任何会把 `SourceDescriptor` evidence 与 actual installed content 关联的流程。
- **规避指南**:
  - 不得在记录 non-bundled source evidence 后继续从 bundled source tree 执行 discovery、copy、hash 或 index generation。
  - 不得因为 artifact source 已有 raw bytes `contentHash` 就允许写入 bundled content；缺少 installable canonical tree handle 时必须在写入前 fail closed。
- **最佳实践**:
  - public `SourceDescriptor` 与 private install source handle 分层：public projection 只保留 display-safe label，private handle 只在 install 链路内部传递。
  - focused tests 应构造带唯一 marker 的 local canonical source tree，断言 installed files、files index hash/sourceRef、skill index `sourcePackagePath` / `canonicalPackageHash` 均来自该 source；同时断言 private root 不出现在 public JSON、human output、manifest或 indexes。
  - 对 tarball/offline bundle，如果当前实现没有 extractor/source payload staging/canonical tree handle，应断言 confirmed source 在 module planning/write phase 前 blocked，且 artifact `contentHash` 仍保持 raw bytes hash。
- **全局文档建议**:
  - 不建议本次升格；`02-source-descriptor-contract.md`、`03-install-plan-contract.md` 与 `04-manifest-index-contract.md` 已覆盖 source descriptor、write eligibility、canonical source 和 installed projection 的总体原则。本条属于 Story 5.3 暴露出的 implementation checkpoint，本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 5-2 / 2026-06-01

- **Story**: 5-2
- **分析来源**:
  - `5-2-code-review-summary-20260601-round-1.md`
  - `5-2-code-review-evaluation-20260601-round-1.md`
  - `5-2-code-review-summary-20260601-round-2.md`
  - `5-2-code-review-evaluation-20260601-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 3 个 P1：private registry 成功路径缺少显式 runtime config、registry package identity 被投影到顶层 `resolvedRoot`、`validateSourceIntegrity` 未校验 `trustStatus` 与 evidence `verified` 的本地一致性。
  - Fixer 已按 evaluator 边界修复 3 项：只定义最小 private runtime/API config，不新增 CLI flag、持久配置、token scope 或 `.npmrc` lifecycle；registry success descriptor 移除顶层 `resolvedRoot` package identity；validate 增加 local-only consistency checks。
  - Round 2 reviewer/evaluator 均确认通过；新增 blocker 0，需修复 0，CR TODO 0；`install.ts` 重复 orchestration 维持 dismiss，不列 TODO。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。
  - 全局 source descriptor contract / architecture 已覆盖 registry redaction、trust status、validate no-network 等总原则；本次 3 条作为 CR 实现检查点沉淀，不重复修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Private registry metadata client 调用必须先通过显式 runtime config 绑定 | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Registry package identity 只能投影到 integrity evidence | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Validate 必须本地校验 trustStatus 与 evidence verified 一致性 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-SEC-15：Private registry metadata client 调用必须先通过显式 runtime config 绑定

- **来源问题**: Story 5.2 首轮实现中，private registry 成功路径只存在于 injected `registryClient` test，真实 runtime 没有显式 private registry endpoint/config 入口；默认 client 对 `private-registry` 直接返回 authentication-required，无法证明 AC2 的用户显式配置语义。
- **CR 证据**:
  - `5-2-code-review-summary-20260601-round-1.md`: Finding #1 指出 private registry 缺少真实显式 endpoint/config lifecycle，成功路径只存在于 injected test client。
  - `5-2-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题为 P1，要求本 Story 仅定义最小 private in-memory/runtime config contract，不猜测 CLI flag、持久配置或 token lifecycle。
  - `5-2-code-review-evaluation-20260601-round-2.md`: evaluator 确认 `RegistryRuntimeConfig` 已表达 `registryKind`、display-safe label、package/channel 绑定；缺 config 或绑定不匹配时在调用 metadata client 前返回 `source-integrity.authentication-required`。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 private registry resolver、install runtime/API 输入、diagnostics 与 metadata client 调用边界。 |
  | 风险等级 | 2 | 未经显式配置就尝试 private registry 或隐式回退 public registry，可能破坏访问意图、认证边界和 redaction safety。 |
  | 根因稳定性 | 1 | source resolver 扩展时容易把 test injection 当作 runtime contract，后续 source 类型也可能复现。 |
  | 可执行性 | 2 | 可检查为 metadata client 调用前必须校验 source type、kind、package、channel 和 display-safe label，并配套 no-client-call regression。 |
  | 文档缺口 | 1 | 全局文档已有 registry redaction 与 source access 总原则，但没有沉淀 private registry runtime config 绑定这个实现检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: private registry resolver、install runtime/API layer、metadata client injection、registry diagnostics 和 source access confirmation flow。
- **规避指南**:
  - 不得用测试注入的 metadata client 替代真实 runtime contract；private registry 在缺少显式 runtime config 或 package/channel/kind 绑定不匹配时，必须在访问 metadata client 前 fail closed。
- **最佳实践**:
  - private registry runtime config 仅暴露 display-safe label 与必要绑定字段；focused tests 同时覆盖缺 config 不调用 client、提供 explicit config 成功解析、public output 不泄露 secret。
- **全局文档建议**:
  - 不建议本次升格；该规则偏 Story 5.2 private registry resolver 实现检查点，且全局 source descriptor / architecture 已覆盖 registry redaction 和 explicit source access 总原则。本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-21：Registry package identity 只能投影到 integrity evidence

- **来源问题**: Story 5.2 首轮实现中，registry success descriptor 把 package name 写入顶层 `resolvedRoot`，与 Story AC3 要求 package identity 只能通过 `integrityEvidence[].packageName` 表示的 automation contract 不一致。
- **CR 证据**:
  - `5-2-code-review-summary-20260601-round-1.md`: Finding #2 指出 `resolvedRoot: packageName` 形成第二处 registry package identity。
  - `5-2-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题为 P1，要求移除 registry success descriptor 顶层 package identity 并同步 tests/fixtures/output。
  - `5-2-code-review-evaluation-20260601-round-2.md`: evaluator 确认 success descriptor 不再写入 `resolvedRoot`，package identity 仅保留在 `integrityEvidence[].packageName`。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 registry `SourceDescriptor`、fixtures、status/install/validate 的 automation contract 消费。 |
  | 风险等级 | 1 | 第二处 package identity 会增加后续 public contract 兼容成本，并可能误导消费方依赖错误字段。 |
  | 根因稳定性 | 1 | optional display/source fields 容易被复用为 identity 字段，是 descriptor 扩展中的稳定实现风险。 |
  | 可执行性 | 2 | 可通过 schema/fixture/assertion 检查 registry success descriptor 不含顶层 `resolvedRoot` package identity。 |
  | 文档缺口 | 1 | 全局文档允许 `resolvedRoot` 作为 display-safe source label，但未沉淀 registry identity 只能来自 evidence 的实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: registry source descriptor、source-integrity fixtures、install/status/validate public JSON projection 和 automation consumers。
- **规避指南**:
  - 不得把 registry package name、scope/package selector 或 private package identity 复制到顶层 `resolvedRoot`、`packageName` 或其他第二身份字段。
- **最佳实践**:
  - registry source 的 package identity 只放在 `registry-integrity` / `version-lock` evidence 的 `packageName`；若 human output 需要显示 label，只使用 contract 允许的 redacted/display-safe metadata，不新增 automation identity。
- **全局文档建议**:
  - 不建议本次升格；该规则细化 Story 5.2 AC3 与 existing source descriptor contract 的 registry 实现检查点。本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-22：Validate 必须本地校验 trustStatus 与 evidence verified 一致性

- **来源问题**: Story 5.2 首轮实现中，`validateSourceIntegrity` 对 registry descriptor 只检查是否存在 registry/lock evidence，无法发现 `trustStatus: "trusted"` 但没有 `verified: true` evidence、已安装 descriptor 仍为 `blocked`，或 `unverified` 携带 failed verification 语义。
- **CR 证据**:
  - `5-2-code-review-summary-20260601-round-1.md`: Finding #3 指出 validate 只检查 evidence 是否存在，未校验 trusted/blocked 与 evidence verification 的本地一致性。
  - `5-2-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题为 P1，要求补 local-only consistency rules 和 focused tests，不访问 registry、不做 freshness/latest check。
  - `5-2-code-review-evaluation-20260601-round-2.md`: evaluator 确认 validate 已覆盖 missing evidence、installed blocked descriptor、trusted-without-verified-evidence、unverified failed lock evidence，并保持 local-only。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 validate command、source-integrity issue、installed manifest descriptor 和 registry evidence contract。 |
  | 风险等级 | 2 | 错误 trusted 或 blocked installed state 被 validate 放过，会削弱本地健康检查和写入前 evidence gate。 |
  | 根因稳定性 | 1 | 只校验 shape/presence 而不校验语义一致性，是 validation rule 中常见且可复现的缺口。 |
  | 可执行性 | 2 | 可写成 focused tests：trusted 必须有 verified evidence、blocked installed descriptor 必报 issue、failed verification 不得以 unverified 通过。 |
  | 文档缺口 | 0 | source descriptor contract 与 architecture 已覆盖 trust/evidence 语义和 validate no-network 边界，本条作为 CR 实现检查点沉淀。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: `speclite validate`、`src/validation/rules/source-integrity.ts`、本地 manifest/source descriptor/evidence shape 与 consistency validation。
- **规避指南**:
  - 不得把 evidence presence 当作 validate 通过条件；`trustStatus` 与 evidence `verified` 语义必须本地一致，且 failed verification 必须变成 stable `source-integrity` issue。
- **最佳实践**:
  - validate 保持 local-only：只读 manifest/source descriptor/evidence，不访问 registry 或 remote provenance；用 focused tests 覆盖 trusted-without-verified-evidence、blocked installed descriptor 和 failed evidence cases。
- **全局文档建议**:
  - 不建议本次升格；全局文档已有 trust/evidence 与 validate no-network 总原则，本条只记录 Story 5.2 暴露出的 implementation checkpoint。本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 4-5 / 2026-06-01

- **Story**: 4-5
- **分析来源**:
  - `4-5-code-review-summary-20260601-round-1.md`
  - `4-5-code-review-evaluation-20260601-round-1.md`
  - `4-5-code-review-summary-20260601-round-2.md`
  - `4-5-code-review-evaluation-20260601-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：classifier unknown path 在 `data.conflicts[]` 中为 `ownership: "unknown"`，但 `updatePlan.actions[]` 被误投影为 `ownership: "installer-owned"`。
  - Fixer 已按保守方案修复：不扩展 `UpdatePlanActionSchema`，只让 unknown ownership conflict 保留在 `data.conflicts[]`，并新增 `README.md` classifier unknown regression。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 (codex)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。
  - `CR-SEC-09` 已存在等价 ownership/classifier 边界规则，本次不新建重复规则；已将 Story 4-5 作为复现来源补充到 `CR-SEC-09`，并将该规则总分从 7/12 更新为 8/12。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Protected path classifier 结果必须优先于 files-index ownership | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only，更新既有 `CR-SEC-09` |

### 提炼规则

#### 既有规则更新：CR-SEC-09 Protected path classifier 结果必须优先于 files-index ownership

- **处理结果**: 不新建重复规则；已将 Story 4-5 作为第二个来源 Story 写入 `CR-SEC-09`，并将该规则总分从 7/12 更新为 8/12。
- **更新依据**: Story 4-5 Round 1 Finding #1 与 Story 4-1 的 protected classifier 优先级问题同源，均要求 classifier 的 `human-owned` / `workflow-owned` / `unknown` protected 结论不得被 files-index ownership 或 public action projection 覆盖。
- **同步状态**: 已写入规则总结。

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 5-1 / 2026-06-01

- **Story**: 5-1
- **分析来源**:
  - `5-1-code-review-summary-20260601-round-1.md`
  - `5-1-code-review-evaluation-20260601-round-1.md`
  - `5-1-code-review-summary-20260601-round-2.md`
  - `5-1-code-review-evaluation-20260601-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：`npm` source value 中的 `?token=secret` 可进入 public JSON `data.sourceDescriptor.resolvedRoot` 与 human-readable `Source` / `External Access` 输出，违反 Story 5.1 redaction/display-safe 要求。
  - Fixer 已在 `sanitizePackageLabel()` 中增加 secret-like key、query string、fragment 与 strict npm package-name allowlist 检查，不满足 display-safe 条件时统一投影为 `redacted-npm-package`，并补充 focused regression。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。
  - 全局 architecture / source descriptor contract 已覆盖 credentials、tokens、private query string 不得进入 public JSON / fixture snapshot 的总体原则；本条作为 CR 实现检查点沉淀，不重复修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Source label sanitizer 必须覆盖 token、query 和 fragment 后再进入 public projection | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-SEC-14：Source label sanitizer 必须覆盖 token、query 和 fragment 后再进入 public projection

- **来源问题**: Story 5.1 首轮实现中，`npm` source value 只按 unsafe display value 做粗略检查，未检查 secret-like token、query string 或 fragment，导致 `@scope/pkg?token=secret` 可作为 display-safe label 进入 blocked `SourceDescriptor.resolvedRoot`、`SourceResolutionPlan.externalAccesses[]` 和 human-readable output。
- **CR 证据**:
  - `5-1-code-review-summary-20260601-round-1.md`: Finding #1 指出 `sanitizePackageLabel()` 未检查 `containsSecretLikeToken()` 或 query string，定向命令确认 JSON 与 human output 泄露 raw token/query。
  - `5-1-code-review-evaluation-20260601-round-1.md`: evaluator 确认该问题违反 Story 5.1 AC4/AC6，属于 P1，需要修复 npm source display-safe redaction 与 focused regression。
  - `5-1-code-review-evaluation-20260601-round-2.md`: evaluator 确认 `sanitizePackageLabel()` 已对 secret-like token、query/fragment delimiter 和 strict npm package-name allowlist 做检查，selection、external access、install JSON 与 human output 均不泄露 raw query/token。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 source selection、blocked source descriptor、external access intent、install JSON 与 human-readable output。 |
  | 风险等级 | 2 | raw token/private query 进入 public output 会造成 secret 泄露和 fixture/public contract 破坏。 |
  | 根因稳定性 | 1 | source-specific label sanitizer 容易只校验 URL/path 而漏掉 package selector 内嵌 query/token，是后续 source 类型扩展中可复现的实现习惯风险。 |
  | 可执行性 | 2 | 可要求 source label sanitizer 覆盖 secret-like keys、query、fragment、absolute/local path 与 strict label allowlist，并配套 JSON/human negative assertions。 |
  | 文档缺口 | 0 | 全局 source descriptor / architecture 已覆盖 public redaction 总原则，本条作为 CR 实现检查点沉淀。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: `src/source/` source selection、source resolver、blocked `SourceDescriptor`、external access intent、install/update/status/validate 等会将 source label 投影到 public JSON 或 human output 的流程。
- **规避指南**:
  - 不得只检查 URL、absolute path 或 credential URL 形态后就把 source value 当作 display-safe；package selector、version/channel selector 或其他 source-specific label 中的 token、query 和 fragment 也必须 redacted。
- **最佳实践**:
  - public source label 进入 `CommandResult`、fixture snapshot、human-readable output 或 `ValidationIssue.details` 前，应先通过集中 sanitizer，校验 secret-like keys、query/fragment delimiter、local path 和 strict source-specific allowlist；focused tests 同时断言 JSON 与 human output 不包含 raw token/query。
- **全局文档建议**:
  - 不建议本次升格；全局文档已覆盖 credentials/tokens/private query string 不得进入 public output 的原则，且修改全局文档超出本次 04/05/06 收尾授权。本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 8-9 / 2026-06-17

- **Story**: 8-9
- **分析来源**:
  - `8-9-code-review-summary-20260617-round-1.md`
  - `8-9-code-review-evaluation-20260617-round-1.md`
  - `8-9-code-review-summary-20260617-round-2.md`
  - `8-9-code-review-evaluation-20260617-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：`NO_COLOR=1` / `CI=true` 可被调用方通过 `options.noColor=false` / `options.ci=false` 绕过，违反 Story AC 7 / AC 11 的无 ANSI 硬性护栏。
  - Fixer 已修复 `shouldUseAnsi()` 优先级，使真实 `process.env.NO_COLOR` 与真实 `process.env.CI` 先于 explicit false options 生效，并补充 `test/cli-human-output-matrix.test.ts` regression。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，CR TODO 0。full `npm test` 的 canonical skill count / fixture count 漂移被记录为非 8-9 外部边界，不纳入本规则。
  - 本次 04 使用模型：GPT-5 Codex (codex)。本次按用户要求执行规则提取并采用默认推荐决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE 或源码。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 环境级 terminal profile 禁色必须优先于显式 false option | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-API-30：环境级 terminal profile 禁色必须优先于显式 false option

- **来源问题**: Story 8.9 首轮实现中，`shouldUseAnsi()` 只有在 `options.noColor !== false` 时读取 `process.env.NO_COLOR`，只有在 `options.ci !== false` 时读取 `process.env.CI`。调用方传入 `{ noColor:false, isTty:true, ci:false }` 或 `{ isTty:true, ci:false }` 时，可让真实 `NO_COLOR=1` / `CI=true` 环境仍输出 ANSI，破坏无色环境、CI、docs/fixture 和 JSON 边界的 Story contract。
- **CR 证据**:
  - `8-9-code-review-summary-20260617-round-1.md`: Finding #1 指出 `NO_COLOR` / CI 禁色护栏可被 explicit false options 绕过，并给出定向复现。
  - `8-9-code-review-evaluation-20260617-round-1.md`: evaluator 确认该问题为 P1，要求修复 guard 优先级并补充 `NO_COLOR=1 + noColor:false + ci:false`、`CI=true + ci:false` regression。
  - `8-9-code-review-summary-20260617-round-2.md`: reviewer 确认 Round 1 P1 已修复，新增 regression 有效，TTY positive path 与 JSON 无 ANSI 未回归。
  - `8-9-code-review-evaluation-20260617-round-2.md`: evaluator 确认 `src/diagnostics/ansi-style.ts:31-38` 已将真实环境级禁色条件放在 options 条件之前，Round 2 Approved。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭；暂无跨 Story 复现。 |
  | 影响范围 | 1 | 影响 human renderer terminal profile、public renderer options、docs/fixture 无 ANSI 边界和 focused color regression。 |
  | 风险等级 | 1 | 会导致 CI 或无色环境输出 ANSI，破坏 AC 和日志可读性，但不涉及数据损坏或安全边界。 |
  | 根因稳定性 | 1 | 属于 option override 与真实环境 guard 优先级的实现习惯问题，后续 terminal profile 选项扩展时可能复现。 |
  | 可执行性 | 2 | 可写成集中 helper 规则，并用 `NO_COLOR=1`、`CI=true`、explicit false options、TTY positive path 和 JSON 无 ANSI tests 检查。 |
  | 文档缺口 | 1 | `docs/reference/cli-human-output-matrix.md` 已有 broad color policy，但未沉淀 explicit false option 不得覆盖真实环境禁色的实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: human-readable CLI renderer、terminal profile helper、ANSI color dependency/import boundary、docs/fixture/JSON 无 ANSI contract，以及 future renderer options 扩展。
- **规避指南**:
  - 不得让 `options.noColor === false` 或 `options.ci === false` 覆盖真实 `process.env.NO_COLOR`、真实 `process.env.CI` 或 non-TTY 禁色护栏。
  - 不得把 explicit false option 解释为“强制启用颜色”；它只能表示未通过该 option 主动禁色。
- **最佳实践**:
  - `shouldUseAnsi()` 类集中 helper 应先检查真实环境级禁色条件，再处理 option-level disable 与 TTY positive path；focused tests 同时覆盖禁色优先级、positive TTY、JSON 无 ANSI 和 dependency/import boundary。
- **全局文档建议**:
  - 不建议本次升格到 `_bmad-output/project-context.md`、`CONTEXT.md` 或 `AGENTS.md`。现有 `docs/reference/cli-human-output-matrix.md` 已覆盖 broad color policy 和 dependency/import boundary，本条是 Story 8.9 暴露出的实现检查点，评分 7/12，按阈值进入 rules-summary 即可。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 9-1 / 2026-06-17

- **Story**: 9-1
- **分析来源**:
  - `9-1-code-review-summary-20260617-round-1.md`
  - `9-1-code-review-evaluation-20260617-round-1.md`
  - `9-1-code-review-summary-20260617-round-2.md`
  - `9-1-code-review-evaluation-20260617-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 P1 `patch` findings：`check_agent_skill.py` 的 legacy activation regex 双重转义导致 `RUNTIME-03` 漏报；`test/installed-activation-contract.test.ts` 的 fixed suffix corpus 未覆盖全量 `references/**/*.md` 与 installed mirror。
  - Fixer 已修复 `LEGACY_ACTIVATION_PATTERN` 并新增 `--self-test-legacy-activation`；同时将 activation contract test 改为结构化扫描 canonical `SKILL*.md`、`references/**/*.md`，并在临时 install 后扫描 `.agents/skills` 与 `.claude/skills` mirror。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认保守决策：record-only。仅更新本规则总结，不修改全局文档、architecture、AGENTS/CLAUDE、Story 文档、源码或 CR 进度文件。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Legacy activation negative pattern 必须用 canonical samples 自测 | 通过 | 7/12 | rules-summary | 用户本次授权默认保守决策：record-only |
| Activation contract corpus discovery 必须结构化覆盖 canonical 与 installed mirror | 通过 | 8/12 | rules-summary | 用户本次授权默认保守决策：record-only |

### 提炼规则

#### CR-TEST-05：Legacy activation negative pattern 必须用 canonical samples 自测

- **来源问题**: Story 9.1 首轮实现中，`check_agent_skill.py` 的 `LEGACY_ACTIVATION_PATTERN` 使用 Python raw string 但写入双重转义，导致 `resolve_customization.py`、`resolve_config.py`、`python3 scripts/resolve_config.py` 和 `{project-root}/_speclite/config.toml` 等 legacy activation 文案无法被 `RUNTIME-03` 命中，agent lint 产生假绿。
- **CR 证据**:
  - `9-1-code-review-summary-20260617-round-1.md`: Finding #1 指出 legacy activation regex 对目标字符串全部返回 `False`，导致 AC5 lint gate 漏报。
  - `9-1-code-review-evaluation-20260617-round-1.md`: evaluator 确认该问题为 P1，要求修复 raw regex 转义并增加最小负向验证。
  - `9-1-code-review-evaluation-20260617-round-2.md`: evaluator 确认当前 pattern、sample 列表与 `RUNTIME-03` 调用链完整，`--self-test-legacy-activation` 通过。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 1 | 影响 agent lint 的 `RUNTIME-03` negative gate、canonical persona Agent activation 迁移和 release packaging 前置检查。 |
  | 风险等级 | 2 | lint 假绿会允许 legacy Python resolver 或单文件 config activation 文案重新进入 installed skills，导致安装后 runtime 失败或 contract 退化。 |
  | 根因稳定性 | 1 | regex 转义与 negative gate 样例脱节是 lint rule 扩展中可复现的实现习惯风险。 |
  | 可执行性 | 2 | 可要求每个 legacy negative pattern 配套 canonical bad samples 和脚本级 self-test，并在 CR/release gate 中运行。 |
  | 文档缺口 | 0 | 既有 `CR-API-14` 已沉淀 installed activation 必须走 `speclite resolve` runtime entry；本条是 lint gate 实现检查点，不重复升格。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: `speclite-agent-lint`、activation protocol negative gate、legacy resolver / single-file config 文案扫描，以及后续新增 lint regex 的 self-test 设计。
- **规避指南**:
  - 不得只凭 lint rule 存在就认为 negative gate 生效；legacy activation pattern 必须用真实 canonical bad samples 证明会命中。
  - 不得在 Python raw regex 中使用会匹配字面反斜杠的双重转义来表达 `.`、`\s` 等 regex 语义。
- **最佳实践**:
  - 为每个 runtime activation negative pattern 维护最小 canonical sample set；提供可单独运行的 self-test，并让 focused CR 验证同时覆盖 sample 命中和正常 corpus 0 findings。
- **全局文档建议**:
  - 不建议本次升格到全局文档；全局文档已有 activation runtime 总原则，本条作为 Story 9.1 暴露出的 lint implementation checkpoint 沉淀。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；`--self-test-legacy-activation` 通过 6 条 legacy activation samples。
- **同步状态**: 已写入规则总结

#### CR-TEST-06：Activation contract corpus discovery 必须结构化覆盖 canonical 与 installed mirror

- **来源问题**: Story 9.1 首轮实现中，`test/installed-activation-contract.test.ts` 使用固定 suffix 白名单定义 full corpus，仅覆盖少量 `SKILL*.md` 与特定 reference 文件，遗漏大量 canonical `references/**/*.md`，且没有对临时安装后的 `.agents/skills` / `.claude/skills` mirror 使用同一 negative scan。
- **CR 证据**:
  - `9-1-code-review-summary-20260617-round-1.md`: Finding #2 指出当前 corpus 只覆盖 29/226 个 canonical `references/**/*.md`，197 个 reference markdown 未被扫描。
  - `9-1-code-review-evaluation-20260617-round-1.md`: evaluator 确认该问题违反 Story AC5 / Task 2 / Task 5，要求结构化扫描 canonical `SKILL*.md`、全量 `references/**/*.md` 和 installed mirror。
  - `9-1-code-review-summary-20260617-round-2.md`: reviewer 确认 discovery 覆盖 326 个 contract files，missed references 为 0，并扫描临时 install 后的 `.agents/skills` 与 `.claude/skills` mirror。
  - `9-1-code-review-evaluation-20260617-round-2.md`: evaluator 确认 focused Vitest 通过，Round 1 finding 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审验证关闭。 |
  | 影响范围 | 2 | 同时影响 canonical source skills、workflow references、fresh install mirror、`.agents/skills` 与 `.claude/skills` activation contract。 |
  | 风险等级 | 2 | suffix 白名单遗漏会让 legacy resolver 文案绕过 release gate，造成 installed skill runtime contract 回退。 |
  | 根因稳定性 | 1 | 手工 suffix 白名单容易随新增 reference / terminal step 文件漂移，是 corpus gate 中稳定可复现的流程缺口。 |
  | 可执行性 | 2 | 可写成结构化 discovery 规则，并用 missed-reference 统计、temporary install mirror scan 和 negative regex assertion 自动检查。 |
  | 文档缺口 | 0 | Epic 9 / Story 9.1 已有 full corpus release gate 要求，本条是测试实现方式的 CR 检查点，不重复写入全局文档。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: installed activation contract tests、canonical skill corpus release gate、fresh install mirror verification、workflow terminal step/reference 文件 negative scan。
- **规避指南**:
  - 不得用固定 suffix 白名单冒充 full corpus；新增 reference markdown、localized `SKILL*.md` 或 terminal step 文件时不得依赖人工同步测试白名单。
  - 不得只扫描 canonical source 而跳过临时 install 后的 `.agents/skills` / `.claude/skills` mirrored activation surface。
- **最佳实践**:
  - 使用结构化 file discovery 覆盖 canonical `SKILL*.md`、所有 `references/**/*.md` 和 installed mirror 中对应文件；测试中保留 missed-reference 统计或等价 guard，并对 canonical 与 mirror 复用同一 legacy activation negative assertion。
- **全局文档建议**:
  - 不建议本次升格到全局文档；虽然总分为 8/12，但文档缺口为 0，且规则适用范围偏测试 gate 实现。本次按阈值与用户授权仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；focused `npm test -- test/installed-activation-contract.test.ts` 通过。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 10-1 / 2026-07-06

- **Story**: 10-1
- **分析来源**:
  - `10-1-code-review-summary-20260706-round-1.md`
  - `10-1-code-review-evaluation-20260706-round-1.md`
  - `10-1-code-review-summary-20260706-round-2.md`
  - `10-1-code-review-evaluation-20260706-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：interactive `speclite install` 仍是一次 exact module code 输入，没有实现 AC5 要求的 category -> ecosystem id 两级选择。
  - Fixer 已修复 explicit interactive install 的两级 prompt 编排，保留 programmatic exact module code selection、默认/`--json` 不自动选择 ecosystem module、unknown module stable diagnostic，并补充 CLI smoke regression。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户指定的保守 record-only 策略，仅更新既有规则 `CR-API-03` 的复现证据和本 Story 记录；不修改全局文档、Story 文档、`sprint-status.yaml`、源码或 TODO backlog。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 用户可见交互能力必须接入 command path 而非停留在 pure model | 通过 | 8/12 | rules-summary | 用户本次授权保守 record-only：更新既有 CR-API-03 |

### 提炼规则

#### CR-API-03：用户可见交互能力必须接入 command path 而非停留在 pure model

- **来源问题**: Story 10.1 的 AC5 要求 explicit interactive install 先展示 ecosystem category selection，再只展示该 category 下的 ecosystem ids；首轮实现只把 category/id 信息展示在一次性 prompt 中，并要求输入 exact module code，导致用户可见 AC 没有真正接入 command path。
- **CR 证据**:
  - `10-1-code-review-summary-20260706-round-1.md`: Finding #1 指出 interactive install 未实现 category -> ecosystem id 两级选择，来源为 `blind+auditor`，分类为 `patch`。
  - `10-1-code-review-evaluation-20260706-round-1.md`: evaluator 确认该 finding 为 P1 阻塞项，并记录修复执行已补齐 `collectInteractiveModuleSelection(...)`、category prompt、ecosystem id prompt、skip/empty/unknown id regression。
  - `10-1-code-review-evaluation-20260706-round-2.md`: evaluator 确认 Round 1 P1 已关闭，Round 2 reviewer 通过结论成立，无新增 finding、无 CR TODO。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是，作为既有 `CR-API-03` 的复现证据更新，不新增重复规则编号
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 1.3、Story 1.4 已沉淀同类问题，Story 10.1 再次复现 command path 未暴露完整用户能力的问题。 |
  | 影响范围 | 1 | 影响 install command orchestration、interactive prompt、module selection 和 ecosystem module guided install。 |
  | 风险等级 | 1 | 会导致用户可见 AC 被 helper 数据结构或 prompt 文案误判为已实现，但真实 interactive command path 不可用。 |
  | 根因稳定性 | 1 | 属于 pure/internal model、prompt display 与 command path 脱节的实现习惯，后续 CLI flow 容易复现。 |
  | 可执行性 | 2 | 可要求 command-level tests 覆盖真实 prompt 顺序、skip/empty answer、有效选择映射和 invalid diagnostic。 |
  | 文档缺口 | 1 | 既有 `CR-API-03` 已覆盖总体规则，本次补充多阶段 interactive flow 的复现证据和检查点，不新增全局文档约束。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: CLI command path 中需要把 pure domain model、metadata grouping 或 prompt display 转化为真实用户可操作能力的 install、module selection、source selection、IDE selection 或 project config initialization 流程。
- **规避指南**:
  - 不得只因 helper 支持输入参数、prompt 展示分组信息或 programmatic exact code path 可用，就把对应 interactive 用户能力标记为已实现。
- **最佳实践**:
  - 对多阶段 interactive flow，必须在 command path 编排真实 prompt 顺序，并用 CLI/integration tests 覆盖 skip、empty answer、有效选择映射、过滤后的选项展示和 stable invalid diagnostic。
- **全局文档建议**:
  - 不建议本次升格到全局文档；该模式已由既有 `CR-API-03` 在规则总结中覆盖，且本次用户明确禁止修改全局项目文档。若后续要全局化，可只建议在 install/CLI command orchestration 指南中补充“multi-step interactive AC 必须有 command-level regression”的检查点。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；本次 04 仅更新 `cr-rules-summary.md` 中既有 `CR-API-03` 证据和 Story 10-1 记录。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 evaluation 未降级任何 CR TODO，Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 11-9 / 2026-09-07

- **Story**: 11-9
- **分析来源**:
  - `11-9-code-review-summary-20260905-round-1.md` 至 `11-9-code-review-summary-20260905-round-17.md`
  - `11-9-code-review-summary-20260907-round-18.md` 至 `11-9-code-review-summary-20260907-round-24.md`
  - `11-9-code-review-evaluation-20260905-round-1.md` 至 `11-9-code-review-evaluation-20260905-round-16.md`
  - `11-9-code-review-evaluation-20260907-round-17.md` 至 `11-9-code-review-evaluation-20260907-round-24.md`
- **模型使用时间线**:
  - Round 1-7 Reviewer 记录为 `GPT-5.6`，Round 8-19 记录为 `OpenAI GPT-5.6 Sol (gpt-5.6-sol)`，Round 20-24 记录为 `GPT-5.6Sol`。
  - Round 1 Evaluator 记录为 `GPT-5.6 (gpt-5.6)`，Round 2-19 主要记录为 `OpenAI GPT-5.6 Sol (gpt-5.6-sol)`，Round 20-24 记录为 `GPT-5.6Sol`；Fixer 身份保留在各轮 evaluation 的 `Fix Execution Record`。
  - 本次 CR04 Rules Extractor 使用 `GPT-5.6Sol`。
- **结论概览**:
  - Round 1-23 的 accepted blocking findings 反复集中在五类根因：单一 CR root/context 传播、artifact identity/round/predecessor authenticity、machine-owned tracker/parser totality、runner-wide zero mutation、contract corpus/detector completeness；各轮 authorized Fixer 已逐步关闭。
  - Round 24 Reviewer 三层 `3/3 PASS`、Aggregator `PASS / PASS_RECOMMENDED` 且 blocker=`0`；Evaluator 精确结论为 `PASS_WITH_DEFERRED_TODOS`，review/evaluation SHA-256 分别为 `e6cca13cd4ecaedbe5e7489b34b8f49a37188e5f2f5fc7b52009084e73d47354` 与 `71664453b8898ee7024c77719dda03b220af1a6a40c462c27a82d67bb410cf39`。
  - 本次 CR04 按 outer orchestrator 的默认推荐授权执行 `record-only`：新增 3 条规则，更新 `CR-TEST-01`、`CR-TEST-08`、`CR-DOC-05` 的跨 Story 证据；不修改 project-context、Architecture、SPEC、source、tests、Story、tracker、completion gate 或 TODO backlog。
  - 唯一未解决项是 Round 5 首次确认、Round 24 carried 的 `supersededIndex` identity/continuity P2；状态不明确为已解决，因此不进入 rules summary，交由 CR05 去重登记。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| CR 目录身份必须单次解析并以 caller-frozen context 贯穿所有 leaf | 通过 | 11/12 | rules-summary | outer orchestrator 已授权 record-only，新增 CR-API-44 |
| CR 完成证据必须绑定同轮 predecessor graph 与 source freshness | 通过 | 11/12 | rules-summary | outer orchestrator 已授权 record-only，新增 CR-PROCESS-03 |
| 机器终态字段解析必须限定结构区域并对歧义语法 fail closed | 通过 | 10/12 | rules-summary | outer orchestrator 已授权 record-only，新增 CR-DOC-08 |
| 阻断路径 no-write 证据必须覆盖 runner 全部 mutation surface | 通过；与既有规则同根 | 10/12 | rules-summary | 更新 CR-TEST-01，不创建重复规则 |
| Contract corpus gate 必须冻结独立 control plane 并做双向分类 | 通过；与既有规则同根 | 10/12 | rules-summary | 更新 CR-TEST-08，不创建重复规则 |
| CR04/CR05 durable output 必须同步 active docs/help | 通过；与既有规则同根 | 11/12 | rules-summary | 更新 CR-DOC-05，不创建重复规则 |
| `supersededIndex` identity/continuity | 未通过：状态未解决 | N/A | todo-tracker | 交由 CR05；不得在 CR04 双重管理或实现 |

### 提炼规则

#### CR-API-44：CR 目录身份必须单次解析并以 caller-frozen context 贯穿所有 leaf

- **来源问题**: Round 1-4 连续发现 runner 只传播部分 resolver 值、真实 CLI 无法携带 required tracker bindings、leaf 仅靠 prose/substring 断言且仍可重新从 title/name/slug/filename 推导目录，导致同一 Story 的 review/evaluation/fix/rules/TODO/finalizer/goal records 可能分叉到多个 root 或在歧义状态下继续写入。
- **CR 证据**:
  - `11-9-code-review-evaluation-20260905-round-1.md`: Findings #2/#4/#7 确认 orchestrator 必须一次解析完整 `crDir/canonicalCrDir/compatibilityMode/legacyArtifactPaths` 与 tracker bindings，并传给 CR01-06；fresh installed runner/contract/leaves 必须消费同一 context。
  - `11-9-code-review-evaluation-20260905-round-2.md`: Findings #3/#5 确认 leaf 要有 executable exact-context fail-close oracle，ZH/EN installed entrypoints 均不得重推导。
  - `11-9-code-review-evaluation-20260905-round-4.md`: Findings #1/#6/#7 关闭真实 CLI reachability、leaf exact `ok/issue` schema 与 title-bearing 全变量族；Round 24 evaluator 确认保持关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是；适用于任何 orchestrator 解析 canonical identity 后委派多个 leaf 的工作流
  - 不重复: 是；`CR-API-42` 约束 artifact producer invocation identity，本规则补充 orchestration root、compatibility mode、tracker bindings 与全部 leaf 的 caller-frozen context
  - 状态明确: 是；已修复并由 Round 24 双 PASS 确认
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 1-4 从 runner、CLI、leaf、installed parity 与 detector 多面连续复现。 |
  | 影响范围 | 2 | 影响 CR01-06、goal records、review/evaluation/fix/rules/TODO/finalizer 与 tracker binding。 |
  | 风险等级 | 2 | identity 分叉或歧义后写入会拆轮、污染历史并让错误 tracker 被认证。 |
  | 根因稳定性 | 2 | 多 leaf 工作流若允许各自从 display metadata 重算 identity，会随入口增加稳定复现。 |
  | 可执行性 | 2 | 可由唯一 resolver、typed CLI args、leaf exact schema、fresh installed invocation 与 mismatch-before-write matrix 检查。 |
  | 文档缺口 | 1 | Story/contract 已拥有 CR root 语义，但跨工作流可复用的 caller-frozen orchestration 检查点尚未独立沉淀。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: 多 leaf agent workflow、canonical identity resolver、legacy resume、tracker binding、installed Skill entrypoint 与 durable artifact root。
- **规避指南**:
  - 不得让下游 leaf 从 title、slug、filename 或默认路径重新推导 root，也不得只传播 `storyId` 后让 leaf 自行补齐 compatibility/tracker context。
- **最佳实践**:
  - orchestrator 只调用一次 owning resolver，冻结完整 typed context；每个 leaf 在任何写入前核对 exact schema/value，并用真实 CLI 与 installed entrypoint 证明同一对象贯穿全链路。
- **全局文档建议**:
  - 不建议本次升格；该规则集中于 CR orchestration 技术域，且用户明确授权 record-only，不修改全局上下文或 Architecture。
- **本次落地**:
  - Round 1-4 authorized Fixer 已完成 single resolution、typed propagation、leaf executable oracle 与 installed parity；Round 24 双 PASS 确认保持关闭。
- **同步状态**: 已写入规则总结

#### CR-PROCESS-03：CR 完成证据必须绑定同轮 predecessor graph 与 source freshness

- **来源问题**: Round 2-23 多次出现 finalizer/CR04/CR05 只凭 `DONE/COMPLETED` prose、basename 或部分 hash 即认证完成，未同时绑定 current Story/series/round、review/evaluation source hash、finding/scope/count 语义、fixRecord authority、completion mutation source 与 higher-round review 的 source mutation，导致 stale 或错代 evidence 可能被误认成 current closeout。
- **CR 证据**:
  - `11-9-code-review-evaluation-20260905-round-2.md`: Finding #2 确认 finalizer 必须验证完整 v2 状态、predecessor 文件与真实 hash。
  - `11-9-code-review-evaluation-20260907-round-19.md` 至 `round-23.md`: 连续关闭 current disposition、predecessor schema/calendar、scope/count/finding-set、fixRecord authority、higher-round generated/source mutation freshness 与 recursive hash rebinding。
  - `11-9-code-review-evaluation-20260907-round-24.md`: 确认 stale/equal/after/no-prior-fix authentic single-variable matrix、latest prior fix 聚合与 recursive predecessor hash rebinding 均闭合。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是；适用于任何由多份 durable reports 决定终态的工作流
  - 不重复: 是；既有规则覆盖 single invocation identity、partial progress 与 owner correction，本规则补充 completion predecessor graph 和 source freshness
  - 状态明确: 是；已修复并由 Round 24 双 PASS 确认
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 2、3、5、19-23 从多个 predecessor 与 freshness 面反复复现。 |
  | 影响范围 | 2 | 跨 Reviewer、Evaluator、Fixer、CR04、CR05、completion gate、CR06 与 trackers。 |
  | 风险等级 | 2 | stale/错代 evidence 可错误推进 Story done，破坏状态机与审计真实性。 |
  | 根因稳定性 | 2 | 只检查 prose 状态或局部 hash 是多报告工作流中稳定的 incomplete-authenticity 模式。 |
  | 可执行性 | 2 | 可由 exact predecessor schema/hash/round/source、scope/finding set、calendar 与 stale/equal/after/no-prior matrix机械验证。 |
  | 文档缺口 | 1 | owning CR contract 已有专属语义，但规则总结尚未沉淀通用 predecessor graph/freshness 检查点。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: CR durable report state machine、multi-round review/fix、completion gate、finalizer、tracker terminal transition 与其它多产物完成协议。
- **规避指南**:
  - 不得仅凭文件存在、basename、`PASS/DONE/COMPLETED` prose 或单个 hash 推进终态；不得让 higher-round review 早于 latest prior fix 的 source mutation。
- **最佳实践**:
  - 终态消费者应验证完整 current predecessor graph，并把 review/evaluation/rules/TODO/gate 的 identity、hash、series、round、scope、finding/count 与 source mutation freshness递归绑定；变更上游后必须重算全部 dependent hashes。
- **全局文档建议**:
  - 不建议本次升格；该规则属于 CR lifecycle 专属流程域，本次只做 record-only。
- **本次落地**:
  - Round 2-23 authorized Fixer 已逐层关闭 predecessor authenticity 与 freshness；Round 24 双 PASS 确认当前 graph 成立。
- **同步状态**: 已写入规则总结

#### CR-DOC-08：机器终态字段解析必须限定结构区域并对歧义语法 fail closed

- **来源问题**: Round 5-21 的 tracker/Story parser 多次把 YAML block scalar、multiline quoted/flow content、tag/anchor/property、Markdown fence、HTML comment/raw `pre/code` body 或 bold `**Status**` 中的伪字段认证为真实 machine-owned terminal，也曾因 comment/quote/property state 错误遮蔽真实 owner；局部 regex 与不完整 lexer 会同时产生 false accept 与 false reject。
- **CR 证据**:
  - `11-9-code-review-evaluation-20260905-round-5.md` 至 `round-16.md`: 连续确认缩进 terminal grammar、block scalar、fence/raw region、flow/property/tag 与 exact key 边界的 accepted findings 和 fixes。
  - `11-9-code-review-evaluation-20260907-round-17.md` 至 `round-21.md`: 关闭 named tag authority、document-root property/rejected state、plain remainder 与 raw Story exact key 的剩余 totality 缺口。
  - `11-9-code-review-evaluation-20260907-round-24.md`: latest evaluator 确认相关 parser/terminal predecessor evidence 保持关闭且无新 blocker。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是；适用于从 Markdown/YAML 文档读取 machine-owned 状态字段的 bounded parser
  - 不重复: 是；`CR-DOC-06/07`覆盖 shard/markup语义，本规则补充跨 Markdown/YAML 的 terminal-field region 与 fail-closed totality
  - 状态明确: 是；已修复并由 Round 24 双 PASS 确认
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 5-21 多轮从 YAML、Markdown 与 raw HTML 状态边界反复复现。 |
  | 影响范围 | 2 | 影响 Story、sprint/workflow tracker 与 finalizer trackerChangeSet 的终态认证。 |
  | 风险等级 | 2 | false accept 可错误完成 Story，false reject 会错误阻断合法恢复。 |
  | 根因稳定性 | 2 | 用全文 regex 或不完整 bounded lexer读取半结构文档是稳定复现根因。 |
  | 可执行性 | 2 | 可用 parser-valid/invalid matrix、same-line transition、scalar/fence/raw/comment 与 exact-key mutants 检查。 |
  | 文档缺口 | 0 | owning CR contract 已详细规定 role-specific grammar；本规则用于复用 CR 经验，不新增第二 authority。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: Markdown Story status、YAML sprint/workflow terminal、leading frontmatter、bounded document parser 与恢复/终态认证。
- **规避指南**:
  - 不得用 whole-file regex 搜索 machine key，也不得把 code fence、raw HTML、comment、block/multiline scalar 或 display-only bold label 当作 owning field。
- **最佳实践**:
  - 按 role 限定唯一结构区域与 exact key grammar；对 unsupported、malformed、duplicate 或语义歧义状态 fail closed，并用 parser-validity assertion 与 adversarial transition matrix同时证明 false-accept/false-reject 边界。
- **全局文档建议**:
  - 不建议本次升格；owning contract 已覆盖具体 grammar，重复写入全局文档会制造第二 authority。
- **本次落地**:
  - Round 5-21 authorized Fixer 已完成 bounded parser hardening；Round 24 双 PASS 确认保持关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **候选**: `supersededIndex` identity/continuity，来源为 Story 11.9 Round 5 首次 evaluator acceptance，Round 6-24 持续 carried。
- **边界**: 该项仍未解决，只允许 CR05 依据既有 evidence 与确定性 canonical fingerprint 去重登记；CR04 不创建 backlog 条目、不实现该项，也不把它升级为 blocker 或已沉淀规则。

### Story 11-8 / 2026-09-05

- **Story**: 11-8
- **分析来源**:
  - `11-8-code-review-summary-20260905-round-1.md`
  - `11-8-code-review-evaluation-20260905-round-1.md`
  - `11-8-code-review-summary-20260905-round-2.md`
  - `11-8-code-review-evaluation-20260905-round-2.md`
  - `11-8-code-review-summary-20260905-round-3.md`
  - `11-8-code-review-evaluation-20260905-round-3.md`
  - `11-8-code-review-summary-20260905-round-4.md`
  - `11-8-code-review-evaluation-20260905-round-4.md`
- **模型使用时间线**:
  - Round 1-3 Reviewer/Aggregator均记录为`GPT-5.6 (gpt-5.6)`；Round 4 Reviewer/Aggregator记录为`GPT-5`。
  - Round 1与Round 4 Evaluator记录为`GPT-5.6 (gpt-5.6)`；Round 2与Round 3 Evaluator记录为`GPT-5.6 Sol (gpt-5.6-sol)`。
  - Round 1与Round 3 Fixer记录为`GPT-5.6 Sol (gpt-5.6-sol)`；Round 2 Fixer记录为`GPT-5.6 (gpt-5.6)`。
  - 本次CR04 Rules Extractor使用`GPT-5.6 Sol (gpt-5.6-sol)`。
- **结论概览**:
  - Round 1确认6个P1，覆盖projection type mismatch、resolver route/docs分叉、old-ID真实activation、authorized apply/precondition、candidate-scan分类与legacy lifecycle evidence；Fixer全部关闭。
  - Round 2确认3个P1：existing resolver failure fail-open、方案I control-plane与ledger同源、redirect action缺typed rename/replacement与幂等证据；Fixer全部关闭。
  - Round 3确认1个P1：walker在三个frozen exact exclusions之外隐式跳过`dist`/`node_modules`；Fixer以临时probe完成RED/GREEN并关闭。
  - Round 4 Reviewer三层`3/3 PASS`，Evaluator为`PASS`，P1=`0`、P2=`0`、Owner Gate=`NONE`，形成latest双PASS并明确`ALLOW CR04`。
  - 本次CR04按外层strict-serial授权执行`record-only`：新增1条规则，并去重更新4条既有规则；不修改全局文档、source、tests、Story、tracker、gate或TODO backlog。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Canonical identity rename必须由实际mutation action承载typed replacement并保持幂等 | 通过 | 11/12 | rules-summary | 外层strict-serial授权record-only，新增CR-API-43 |
| Existing-state consumer必须将blocking artifact-root resolver issue fail closed | 通过；与既有规则同根 | 11/12 | rules-summary | 更新CR-API-37的跨Story evidence与适用范围 |
| Contract corpus gate必须独立冻结control-plane并约束effective scan domain | 通过；属于既有role/candidate gate | 10/12 | rules-summary | 更新CR-TEST-08，不新建重复规则 |
| Command fixture必须在首个lifecycle前建立真实legacy前置世界状态 | 通过；属于既有fixture前置规则 | 10/12 | rules-summary | 更新CR-TEST-02，不新建重复规则 |
| Producer/spec/docs必须共同消费resolver-owned route | 通过；属于既有Markdown/executable双向binding | 11/12 | rules-summary | 更新CR-DOC-05，不新建重复规则 |
| Phase projection未消费必填参数与Story专属exact basenames | 未通过：一次性实现错误或纯Story特例 | 4/12 | none | 不沉淀 |
| Drawer fixed-count、global `tsc`、Story 11.10 broad inventory | 未通过：明确范围外 | N/A | none | 不沉淀、不交TODO |

### 提炼规则

#### CR-API-43：Canonical identity rename 必须由实际 mutation action 承载 typed replacement 并保持幂等

- **来源问题**: Story 11.8 Round 1发现old-ID mapping只在update ownership helper中存在，clean existing package仍保留old executable implementation并同时投影active package，形成双active identity。修复为redirect后，Round 2又发现真正改写old entrypoint的plan action仍只是普通`update`，machine consumer无法从实际mutation确定rename reason与唯一replacement，且没有二次authorized update证明幂等。
- **CR 证据**:
  - `11-8-code-review-evaluation-20260905-round-1.md`: Findings #3/#4确认clean old package必须在ownership/hash/type/mode与commit-time precondition保护下转为最小redirect，覆盖两个old IDs × 两个IDE targets的authorized apply，并保持modified-old zero-write。
  - `11-8-code-review-evaluation-20260905-round-2.md`: Finding #3确认执行redirect的old entrypoint action必须携带machine-validated`canonical-skill-renamed`与唯一`replacementCanonicalSkillId`；Fix Summary让首次`update`与二次幂等`skip`共享typed binding，并完成2×2 plan→apply→replay。
  - `11-8-code-review-evaluation-20260905-round-4.md`: evaluator确认redirect最终态、typed rename/replacement、modified-old protection、precondition fail-close与幂等均保持关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是；适用于任何installed canonical package/entrypoint identity rename
  - 不重复: 是；`CR-API-28`覆盖普通update后的projection同步，本规则补充identity migration action本身的machine语义、redirect与幂等
  - 状态明确: 是；已修复并由Round 4 double-PASS确认
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 1从真实activation/final state、Round 2从machine plan与replay连续暴露同一identity migration根因。 |
  | 影响范围 | 2 | 影响update planner、CommandResult schema、installed entrypoint、active package、files/skill/help/phase indexes与两类IDE target。 |
  | 风险等级 | 2 | 双active或无replacement语义的迁移会让旧请求继续执行obsolete implementation，并使自动化无法确定唯一replacement。 |
  | 根因稳定性 | 2 | Rename若只更新部分metadata、helper或最终文件，而未统一actual action与installed projection，后续package migration高概率复现。 |
  | 可执行性 | 2 | 可用typed action schema、2 IDs × 2 targets、authorized apply/replay、modified-old与四类precondition矩阵直接检查。 |
  | 文档缺口 | 1 | 既有update规则覆盖normal projection与overwrite safety，但未规定canonical identity rename必须绑定actual mutation与幂等replacement。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: canonical Skill/package ID rename、installed entrypoint migration、IDE target projection、update plan/result schema、files/skill/help/phase index同步与existing-install compatibility。
- **规避指南**:
  - 不得只新增old→active mapping helper或active package，就把old-ID activation视为已redirect；clean old executable entrypoint不能与active implementation并存为双active。
  - 不得让实际改写old entrypoint的action退化为无identity语义的普通`update`，也不得依赖companion file的间接`skip`表达replacement。
  - 不得删除、覆盖或静默改写modified old package；ownership/hash/type/mode与plan-to-commit drift任一不符都必须在任何operation/journal前fail closed。
- **最佳实践**:
  - Canonical rename应由全局唯一mapping生成最小redirect与唯一active package；真正执行old entrypoint mutation的plan record携带stable rename reason和唯一replacement，machine schema拒绝其他非法reason/replacement组合。
  - 参数化所有old IDs与installed targets执行首次plan→authorized apply→二次authorized replay；断言首次typed`update`、二次typed`skip`、`changedPaths=[]`、redirect/active/index bytes与hash不变，以及fresh install不生成old package。
  - 对content、mode、type/non-file与missing四类commit-time变化断言stable issue、zero partial write与无journal残留。
- **全局文档建议**:
  - 不建议本次升格到全局文档。规则总分高但适用范围集中于canonical identity migration/update技术域，且本次仅授权CR04 record-only；现有SPEC 04/07/09继续拥有具体identity、CommandResult与root contract。
- **本次落地**:
  - Round 1/2 Fixer已完成deterministic redirect、typed actual action、2×2 authorized apply/replay与precondition矩阵；Round 4 Reviewer/Evaluator确认关闭。本次仅新增规则记录。
- **同步状态**: 已写入规则总结

#### 既有规则更新：CR-API-37 Existing-state consumer 必须将 blocking artifact-root resolver issue fail closed

- **处理结果**: Story 11.3的public readout与Story 11.8的update planning都是resolver failure被`undefined`/fallback吞掉的同一consumer根因；来源更新为`11-3, 11-8`，标题从readout扩展为consumer，总分由10/12更新为11/12。
- **更新依据**: `11-8-code-review-evaluation-20260905-round-2.md`确认resolver `ok=false`必须原样传播stable issues并在projection/transaction前HALT；Round 4确认合法无配置的legacy-compatible分支与failure分支已明确区分。
- **同步状态**: 已写入规则总结

#### 既有规则更新：CR-TEST-08 Contract corpus gate 必须按 surface role 分类 whole semantic candidate

- **处理结果**: 不新建“candidate-scan control-plane”专属规则。Story 11.8的同源缩面与walker隐式exclusion属于既有whole-candidate/role gate的扫描面前置条件；来源更新为`11-7, 11-8`，补充独立冻结roots/exclusions/tokens及effective-domain mutation要求。
- **更新依据**: Round 2/3 evaluation与Fix Summary依次关闭control-plane/ledger同源和未声明`dist`/`node_modules` skip；Round 4确认`6 roots / 3 exclusions / 6 token key-parts / 24 rows`与active-zero保持闭合。
- **同步状态**: 已写入规则总结

#### 既有规则更新：CR-TEST-02 Command fixture 必须显式满足被测 gate 之前的前置 evidence

- **处理结果**: Story 11.8的legacy prose-only test与Story 11.6的install-after-legacy setup同属fixture未在首阶段前建立目标世界状态；来源更新为`4-3, 11-6, 11-8`，根因稳定性由1提升为2，总分由9/12更新为10/12。
- **更新依据**: Round 1 evaluation/Fix Summary建立真实legacy readiness tree并逐阶段验证discovery、path/type/bytes/hash/tree及mutation-set零交集；Round 4确认关闭。
- **同步状态**: 已写入规则总结

#### 既有规则更新：CR-DOC-05 Installed Markdown workflow 与 executable implementation 必须形成可定位、同源的双向 binding

- **处理结果**: Story 11.8的producer/spec/docs resolver route分叉是Story 11.4/11.6双向binding在route ownership上的第三次复现；来源更新为`11-4, 11-6, 11-8`，补充resolver-provided root、第三fallback禁止与current docs exact parity要求，不新建重复DOC/API规则。
- **更新依据**: Round 1 evaluation/Fix Summary统一两个readiness producer、record spec与D1 current docs到Solutioning fixed child，并对resolver failure执行HALT/zero-write；Round 4确认关闭且Grill既有record basenames未误改。
- **同步状态**: 已写入规则总结

#### 不沉淀 / 交接项

- **Phase projection未消费必填参数**: 不新建规则。它是本Story一次性签名/调用错位，已由现有type gate与focused IDE projection测试关闭，缺少跨Story独立规则价值。
- **Story专属readiness IDs、route child与exact basenames**: 不泛化。具体真源仍为Story 11.8及SPEC 04/07/09；CR04只沉淀其可复用migration、resolver消费与evidence-gate模式。
- **External drawer、workspace mirrors、fixed-count drift与global `tsc`其他Story错误**: 明确范围外，不作为Story 11.8规则证据，不修改、不吸收。
- **Story 11.10 broad grill inventory与generic parser/scan扩面**: Evaluator明确排除，不包装为规则或TODO。

#### 05 TODO Tracker 交接

- **无需新增TODO backlog**: Round 1-4 evaluation均未产生Story 11.8 P2；latest Round 4为P1=`0`、P2=`0`、Owner Gate=`NONE`。CR04不执行CR05，也不修改`cr-todo-backlog.md`。

### Story 11-7 / 2026-09-05

- **Story**: 11-7
- **分析来源**:
  - `11-7-code-review-summary-20260904-round-1.md`
  - `11-7-code-review-evaluation-20260904-round-1.md`
  - `11-7-code-review-summary-20260904-round-2.md`
  - `11-7-code-review-evaluation-20260904-round-2.md`
  - `11-7-code-review-summary-20260905-round-3.md`
  - `11-7-code-review-evaluation-20260905-round-3.md`
  - `11-7-code-review-summary-20260905-round-4.md`
  - `11-7-code-review-evaluation-20260905-round-4.md`
  - `11-7-code-review-summary-20260905-round-5.md`
  - `11-7-code-review-evaluation-20260905-round-5.md`
  - `11-7-code-review-summary-20260905-round-6.md`
  - `11-7-code-review-evaluation-20260905-round-6.md`
  - `11-7-code-review-summary-20260905-round-7.md`
  - `11-7-code-review-evaluation-20260905-round-7.md`
  - `11-7-code-review-summary-20260905-round-8.md`
  - `11-7-code-review-evaluation-20260905-round-8.md`
- **模型时间线**:
  - Round 1 Reviewer 为 `GPT-5.5 (gpt-5.5)`；Round 1 Evaluator/Fixer 为 `GPT-5.6 (gpt-5.6)`。
  - Round 2-8 Reviewer、Evaluator与Round 2-7 Fixer均记录为`GPT-5.6 (gpt-5.6)`；Round 8 Reviewer三层`3/3 PASS`，Round 8 Evaluator为`PASS`。
- **结论概览**:
  - Round 1-2共确认10个P1，覆盖single invocation date、Step 2-13 exact path state、repair成功证据、完整五类legacy lifecycle、downstream physical owner chain、active surface inventory与可重放completion evidence；对应Fix Summary均已完成。
  - Round 3-7继续确认12个P1，全部属于focused evidence fail-open：whole framed/unframed candidate、config semantic key role、private producer/discovery role、逐surface zero intersection、all-entry location/type inventory、static filesystem binding和local-function reachability；各轮均以稳定反例先RED、再以bounded test-only方案GREEN。
  - Round 8 Reviewer/Evaluator形成latest double-PASS：P1=`0`、P2=`0`、Owner Gate=`NONE`，允许进入CR04。Focused为`10/10`，exact related为`53/53`；affected中的4项失败仅为范围外drawer fixed-count drift，不作为本Story规则来源。
  - 本次CR04按外层严格编排授权采用`record-only`：新增3条规则，并将downstream filesystem qualification去重更新到既有`CR-SEC-20`；不修改全局文档、source、tests、Story、tracker、gate或TODO backlog。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 多步骤artifact producer必须锁定单一invocation identity并复用exact target | 通过 | 10/12 | rules-summary | 外层严格编排授权record-only，新增CR-API-42 |
| Contract corpus gate必须按surface role分类whole semantic candidate | 通过 | 10/12 | rules-summary | 外层严格编排授权record-only，新增CR-TEST-08 |
| 静态evidence oracle必须用稳定mutant证明fail-closed reachability | 通过 | 9/12 | rules-summary | 外层严格编排授权record-only，新增CR-TEST-09 |
| Downstream artifact candidate的physical owner/readability/type/location资格 | 通过；与既有规则等价 | 11/12 | rules-summary | 去重更新CR-SEC-20证据，不新建规则 |
| Completion gate exact command/inventory刷新 | 未通过：本Story一次性evidence维护，已有Flow Gate流程约束 | 5/12 | none | 不沉淀独立规则 |
| TOML arrays、通用Markdown/TOML/JavaScript parser、AST或完整call graph | 未通过：超出已批准bounded contract且被Evaluator明确驳回 | 3/12 | none | 不沉淀、不交TODO |

### 提炼规则

#### CR-API-42：多步骤 artifact producer 必须锁定单一 invocation identity 并复用 exact target

- **来源问题**: Round 1发现report filename、initial metadata/body与final metadata仍可分别消费不同的date source；Round 2又发现Step 2-13 frontmatter使用不存在的snake_case token，导致后续step可能脱离Step 1锁定的exact target。若多步骤workflow在各阶段重算日期、路径或别名，跨午夜与同日冲突场景会产生identity分叉、重复artifact或错误消费证据。
- **CR 证据**:
  - `11-7-code-review-evaluation-20260904-round-1.md`: Finding #1确认一次invocation只能生成一次`validationInvocationDate`，filename、initial/final metadata、body与completion path必须共同消费该值；Fix Summary以跨午夜双时钟验证关闭。
  - `11-7-code-review-evaluation-20260904-round-2.md`: Finding #1确认Step 2-13必须统一绑定`validationReportPath: '{validationReportPath}'`，禁止新增snake_case alias或第二路径计算规则；Fix Summary动态枚举全部active steps验证关闭。
  - `11-7-code-review-evaluation-20260905-round-8.md`: evaluator确认exact filename/date/path、single invocation state与Step 2-13 locked path均保持关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是；适用于任何跨多步骤生成dated/versioned artifact的workflow
  - 不重复: 是；`SPEC 07`定义当前report冲突语义，本规则补充跨步骤identity propagation的实现检查点
  - 状态明确: 是；已修复并由Round 8 double-PASS确认
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 1的date source与Round 2的path token从两个阶段连续复现同一identity propagation根因。 |
  | 影响范围 | 2 | 影响workflow activation、13个steps、metadata/body、private producer、completion output与downstream evidence。 |
  | 风险等级 | 2 | identity分叉可导致错误artifact路径、重复输出、同日冲突绕过或自动化关联失真。 |
  | 根因稳定性 | 2 | 多步骤workflow若允许每步重算或使用alias，随着step增加会高概率再次漂移。 |
  | 可执行性 | 2 | 可用单一producer scan、全step token closure、跨午夜双时钟与existing-target矩阵直接检查。 |
  | 文档缺口 | 0 | FR23e、Story与`SPEC 07`已有当前artifact owning contract；本规则仅沉淀可复用实现检查点。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: 多步骤Markdown workflow、dated/versioned report producer、跨step metadata update与任何在activation阶段确定artifact identity的流程。
- **规避指南**:
  - 不得在后续step重新读取clock、重算basename/path或引入未声明alias；也不得让frontmatter、body与completion output消费不同identity token。
  - Existing exact target必须按owning contract阻断，不得通过suffix、counter、temp、same-content reuse、overwrite或append制造第二identity。
- **最佳实践**:
  - Activation只生成一次identity state，并把exact project-relative target作为显式state贯穿全部steps；focused test动态枚举consumer token closure，而非只抽查首尾step。
  - 使用跨午夜双时钟和same/different existing target fixture，断言filename、metadata、body、private operation与completion output仍绑定首次identity，且阻断路径保持zero mutation。
- **全局文档建议**:
  - 不建议本次升格。Current FR23e、Story 11.7与`SPEC 07`已拥有具体report contract，且本轮仅授权record-only；规则总结用于其它多步骤artifact producer复用。
- **本次落地**:
  - Round 1-2 Fixer已完成single-date与全step exact path binding，Round 8 Reviewer/Evaluator确认关闭；本次仅新增规则记录。
- **同步状态**: 已写入规则总结

#### CR-TEST-08：Contract corpus gate 必须按 surface role 分类 whole semantic candidate

- **来源问题**: Story 11.7 Round 1-6多次证明“扫描了所有文件”不等于contract gate完整：整行legacy豁免、framed value二次截断、不对称delimiter、support basename全局skip、config局部key而非完整TOML semantic path、private script整文件豁免及negated`arrayContaining(allPaths)`都可让非法active default或单一路径污染保持绿色。Story 11.8 Round 1-3又从扫描面本身复现：roots、exclusions、tokens与ledger同源可同步缩面，且walker还能在冻结的exact exclusions之外隐式跳过任意`dist`/`node_modules`子树。Story 11.9 Round 1-4 再次证明 title-bearing CR root detector 若漏掉中文、下划线、bare variable、quoted/interleaved concat、alternate placeholder 或完整变量族，也会把 active forbidden derivation 错记为 clean。
- **CR 证据**:
  - `11-7-code-review-evaluation-20260904-round-1.md`: Finding #3要求按producer/metadata/help/contracts/examples/downstream建立显式inventory，并以精确`file + clause` legacy allowlist替代整行skip。
  - `11-7-code-review-evaluation-20260904-round-2.md`: Findings #3/#5要求先提取完整basename/value再anchored分类，并把customization、published config与private producer按不同role纳入。
  - `11-7-code-review-evaluation-20260905-round-3.md`: Findings #1/#2确认framed whole value、config/private exact role及每个command metadata surface分别与protected set求zero intersection。
  - `11-7-code-review-evaluation-20260905-round-4.md`: Findings #1/#2要求support exemption绑定exact file+clause role，report target deny vocabulary不能依赖value恰好包含managed basename。
  - `11-7-code-review-evaluation-20260905-round-5.md`: Findings #1/#2要求complete-clause role、共享start/end boundary与完整TOML table/dotted semantic key path。
  - `11-7-code-review-evaluation-20260905-round-6.md`: Finding #1用保留fragment/count但改变surrounding role的mutant证明complete-clause anchor必须fail closed；Round 8确认所有相关义务关闭。
  - `11-8-code-review-evaluation-20260905-round-2.md`: Finding #2确认candidate roots、exclusions、tokens与ledger同源会形成self-proof；Fix Summary在test code独立冻结`6 roots / 3 exclusions / 6 token key-parts`，并以missing/extra/malformed control-plane mutants证明scan前fail-close。
  - `11-8-code-review-evaluation-20260905-round-3.md`: Finding #1确认actual walker仍在frozen exact exclusions外硬编码basename skip；Fix Summary删除隐式排除，并用临时嵌套`dist`/`node_modules` probe证明effective scan domain与冻结合同一致。
  - `11-8-code-review-evaluation-20260905-round-4.md`: evaluator确认24-row actual/ledger双向exact equality、role allowlist、active-zero与effective exclusions closure均保持关闭。
  - `11-9-code-review-evaluation-20260905-round-1.md`: Finding #8 要求 active title-bearing negative scan 使用 frozen full classified corpus，而不是由当前命中结果反推 inventory。
  - `11-9-code-review-evaluation-20260905-round-2.md`: Finding #6 与 Round 3 Finding #7、Round 4 Finding #7 连续补齐中文/下划线、alternate placeholder、bare title/name/slug/filename、quoted/interleaved concat 与完整变量族；Round 24 双 PASS 确认 detector closure 保持成立。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是；适用于跨Markdown/TOML/CSV/source的contract corpus gate
  - 不重复: 是；`CR-TEST-05/06`覆盖canonical sample与corpus discovery，本规则补充surface-role、whole semantic candidate及per-surface集合断言
  - 状态明确: 是；已修复并由Round 8 double-PASS确认
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 11.7、11.8、11.9 连续在 inventory、tokenizer、allowlist、control plane、walker exclusion 与变量族 detector 中复现。 |
  | 影响范围 | 2 | 跨Skill metadata、steps、help、docs、examples、TOML config、CSV与private source。 |
  | 风险等级 | 1 | 主要风险是contract regression漏报和错误closeout evidence，而非直接数据损坏。 |
  | 根因稳定性 | 2 | 按行/substring/全文件skip构造negative scan是跨格式contract test中稳定的false-green来源。 |
  | 可执行性 | 2 | 可用显式role inventory、whole-value classifier、complete-clause anchor、semantic key path和逐surfaceintersection直接检查。 |
  | 文档缺口 | 1 | 既有测试规则覆盖sample/corpus范围，但未覆盖跨格式surface-role和whole candidate语义。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: canonical contract parity/negative scans、跨Markdown/TOML/CSV/source inventory、legacy compatibility allowlist与protected path/name metadata assertions。
- **规避指南**:
  - 不得按整行关键词、全文件或裸basename全局豁免；allowlist必须绑定真实`relativePath + complete clause/field/declaration role + exact occurrence count`。
  - 不得在识别quoted/code-span/TOML/CSV framed value后再按空白或标点截断，也不得只解析局部assignment key而忽略table/dotted semantic path。
  - 不得用单个negated collection matcher表达“任何受保护元素均不得出现”；每个public surface都必须投影actual intersection并精确断言为空。
  - 不得让fixture/ledger同时定义candidate roots、exclusions和search tokens；也不得让walker在已冻结control-plane之外另藏basename、extension或subtree skip。
- **最佳实践**:
  - 先定义surface inventory与role，再按真实格式提取whole semantic candidate并做anchored classification；合法support/historical fragments在扫描前以完整role anchor精确移除。
  - 对每类允许和禁止形态建立synthetic adversarial table，同时对真实active corpus执行同一classifier；任何未知role、未消费syntax或managed prefix malformed value都fail closed。
  - Roots、exact exclusions与token key/parts应在独立于ledger的test code或immutable contract中冻结，并在任何scan前做双向exact校验；mutation还应证明missing/extra/变形control-plane及冻结root内嵌套目录不会被隐式漏扫。
- **全局文档建议**:
  - 不建议本次升格。规则适用面集中于contract-test oracle，且本轮仅授权record-only；后续可作为canonical source审查与fixture设计检查表复用。
- **本次落地**:
  - Story 11.7 Round 1-6对应Fixer已逐步加固classified inventory，Round 8 Reviewer/Evaluator确认关闭。Story 11.8 Round 2/3 fixer进一步关闭control-plane同源缩面与walker隐式exclusion，Round 4 reviewer/evaluator确认关闭。Story 11.9 Round 1-4 fixer补齐 title-bearing 全变量族与 frozen classified scan，Round 24 Reviewer/Evaluator确认保持关闭；本次更新既有`CR-TEST-08`而不新增重复测试规则。
- **同步状态**: 已写入规则总结

#### CR-TEST-09：静态 evidence oracle 必须用稳定 mutant 证明 fail-closed reachability

- **来源问题**: Round 4-7发现private producer/discovery静态门禁虽然对current source绿色，却可漏掉slice外第二writer、第二条或多行aliased filesystem import、未批准original binding、discovery间接调用local mutation helper、leading-whitespace declaration及nested declaration后的direct call。根因是oracle只搜索固定substring/slice或用相邻declaration切分函数，而没有证明已声明有限语法内的binding与reachable body被完整消费。
- **CR 证据**:
  - `11-7-code-review-evaluation-20260905-round-4.md`: Finding #3要求whole-file唯一producer、static mutation role与behavioral immutability三组证据，不能只搜索一个`writeFile(` substring或固定slice。
  - `11-7-code-review-evaluation-20260905-round-5.md`: Finding #3确认必须枚举全部static fs bindings/local aliases，并从discovery对local function declaration建立有限direct-call reachable closure；第二条aliased writer与indirect helper mutant用于RED。
  - `11-7-code-review-evaluation-20260905-round-6.md`: Finding #2补齐multiline named import、exact current original-binding allowlist与leading-whitespace local declaration，未知或未消费shape必须fail closed。
  - `11-7-code-review-evaluation-20260905-round-7.md`: Finding #1确认nested declaration不能截断enclosing function body；Fix Summary改用有限declared-function body span并同时保持external、leading-whitespace与nested mutants可达。
  - `11-7-code-review-evaluation-20260905-round-8.md`: evaluator确认三类mutant均命中`executePrdValidationReportOperation`、`inspectTarget`与`writeFile`，current read-only discovery返回空violations，Round 8 double-PASS。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是；适用于用轻量静态oracle保护唯一writer、只读discovery或有限调用边界的测试
  - 不重复: 是；既有规则未覆盖test-local reachability oracle的mutation-proof完整性
  - 状态明确: 是；已修复并由Round 8 double-PASS确认
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 4-7连续在whole-file scope、import binding、declaration shape与nested body span中复现。 |
  | 影响范围 | 1 | 主要影响private filesystem producer/discovery与同类静态contract-test技术域。 |
  | 风险等级 | 2 | false-green可隐藏第二writer或read-only discovery到mutation path，破坏zero-mutation与legacy preservation保证。 |
  | 根因稳定性 | 2 | 手写regex/static slice若没有完整消费与mutant证明，会随格式重排或helper抽取稳定漏检。 |
  | 可执行性 | 2 | 可用exact binding allowlist、function-body span、reachable closure、behavior snapshot及一组稳定mutants直接验证。 |
  | 文档缺口 | 0 | Story测试要求已有fail-closed evidence边界；本条作为专项实现规则沉淀，不扩大到通用静态分析规范。 |

- **总分**: 9/12
- **建议去向**: rules-summary
- **适用范围**: test-local轻量静态oracle、唯一filesystem writer检查、read-only discovery/helper reachability；不授权通用JavaScript parser、AST、动态调用或完整call graph。
- **规避指南**:
  - 不得以current source通过、固定slice无禁用substring或单一behavior fixture无mutation，替代对已支持binding/declaration/call形态的完整消费证明。
  - 不得静默忽略未知static import、未批准original binding、duplicate local name、unsupported declaration或unbalanced body；有限oracle遇到未支持结构必须fail closed。
- **最佳实践**:
  - 先明确支持的有限syntax与current binding allowlist，再对每个static import建立`original -> local`映射、按完整function body span构造local direct-call closure，并结合before/after no-follow snapshot验证current behavior。
  - 每个声称受保护的逃逸分支必须有稳定mutant先证明旧oracle会false-green，再证明修复后命中；同时保留无mutantcurrent source为绿色，避免测试反向规定不存在的runtime行为。
- **全局文档建议**:
  - 不建议本次升格。该规则是有限test-oracle技术实践，且Evaluator明确排除通用parser/AST/call graph扩张；record-only最符合当前范围。
- **本次落地**:
  - Round 4-7 Fixer已在单一focused test内完成bounded evidence hardening，Round 8 Reviewer/Evaluator确认关闭；本次仅新增规则记录。
- **同步状态**: 已写入规则总结

#### 去重与不沉淀项

- **Downstream filesystem qualification**: Story 11.7的portable path、readable no-follow regular file、`realProject -> realPlanning -> exact realPlanning/prd -> candidate`链和same-basename all-entry inventory，与既有`CR-SEC-20`的dereferenced regular-file、containment、structured discovery资格等价。本次只把Story 11.7 Round 1-3/8证据追加到`CR-SEC-20`，并将索引来源更新为`11-5, 11-7`，不创建`CR-SEC-22`。
- **Completion gate replayability**: Round 1 Finding #5已由outer Flow Gate owner刷新exact command、inventory、counts、time与HEAD/worktree evidence；这是本Story current evidence维护，不形成独立开发规则。
- **TOML arrays与通用parser/AST/call graph**: Round 5-8 Evaluator明确驳回为超出已批准bounded matrix；不得把驳回候选包装为已验证规则或TODO。
- **External drawer与fixed-count drift**: `speclite-drawer-er-modeler/`、zip、workspace mirrors及其4项affected失败不属于Story 11.7规则来源，不修改、不吸收。

#### 05 TODO Tracker 交接

- **无需新增TODO backlog**: Round 1-8 evaluation均未批准Story 11.7 P2，latest Round 8为P1=`0`、P2=`0`、Owner Gate=`NONE`；CR04不执行CR05，也不修改`cr-todo-backlog.md`。

### Story 11-6 / 2026-09-04

- **Story**: 11-6
- **分析来源**:
  - `11-6-code-review-summary-20260904-round-1.md`
  - `11-6-code-review-evaluation-20260904-round-1.md`
  - `11-6-code-review-summary-20260904-round-2.md`
  - `11-6-code-review-evaluation-20260904-round-2.md`
  - `11-6-code-review-summary-20260904-round-3.md`
  - `11-6-code-review-evaluation-20260904-round-3.md`
  - `11-6-code-review-summary-20260904-round-4.md`
  - `11-6-code-review-evaluation-20260904-round-4.md`
  - `11-6-code-review-summary-20260904-round-5.md`
  - `11-6-code-review-evaluation-20260904-round-5.md`
- **结论概览**:
  - 模型使用时间线：Reviewer Round 1-5、Evaluator Round 1-5 与四轮 Fixer records 均记录 `Model Used: GPT-5.5 (gpt-5.5)`；本次 CR04 使用模型为 GPT-5.5。
  - Round 1-4 依次暴露并关闭 route/frontmatter/legacy supporting path、physical owner/nearest ancestor、bounded reference parser、install-existing evidence、operation coupling 与 installed private binding 等阻塞项；Round 5 Reviewer/Evaluator 双 PASS，`0 P0 / 0 P1 / 0 new P2`。
  - 本次按外层 strict-serial CR04 授权采用 record-only：仅更新本规则总结。去重后新增 `CR-SEC-21`、`CR-DOC-07` 两条规则，并用 Story 11.6 证据更新既有 `CR-DOC-05`、`CR-TEST-02`；不修改任何全局文档、源码、测试、Story、tracker、gate、CR artifact或TODO。
  - 既有 inactive Architecture duplicate step 中的 `*ux-design*.md` wildcard 状态未闭合，保持 P2 并交 CR05；external drawer、Story专属 basenames、raw template `stepsCompleted: []` 与新增 public CLI 主张均不沉淀。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Filesystem write 必须在 operation 内重验 physical owner 与 nearest existing ancestor | 通过 | 11/12 | rules-summary | 外层编排已授权 record-only，新增 CR-SEC-21 |
| Installed Markdown workflow 与 executable implementation 必须形成可定位、同源的双向 binding | 通过 | 11/12 | rules-summary | 更新既有 CR-DOC-05 的跨 Story 证据、标题与评分，不新增重复规则 |
| Bounded markup validator 必须与 renderer 的 precedence 和 character-reference 语义一致 | 通过 | 10/12 | rules-summary | 外层编排已授权 record-only，新增 CR-DOC-07 |
| Command fixture 必须显式满足被测 gate 之前的前置 evidence | 通过 | 9/12 | rules-summary | 更新既有 CR-TEST-02 的跨 Story lifecycle 证据与评分，不新增重复规则 |
| inactive Architecture duplicate UX wildcard | 未通过：状态未闭合 | N/A | todo-tracker | 保持既有 P2 defer，交 CR05 去重/登记 |
| Story专属 UX basenames、raw template 初始 frontmatter 与 external drawer caveat | 未通过：纯特例或非本 Story finding | N/A | none | 不沉淀 |

### 提炼规则

#### CR-SEC-21：Filesystem write 必须在 operation 内重验 physical owner 与 nearest existing ancestor

- **来源问题**: Story 11.6 Round 2 发现 candidate gate 只验证 lexical/project containment：missing leaf 没有检查 nearest existing ancestor，existing canonical/legacy candidate 也没有限制到各自 physical owner，project 内 cross-space symlink 因而可被当作安全目标。Round 3 进一步证明仅在 preflight 返回“可写”仍存在 replacement window：owner或ancestor可在真实 create/mkdir 前被替换，使先前批准的路径跨 physical ownership。若检查与 mutation 分离，安全结论无法约束实际 operation。
- **CR 证据**:
  - `11-6-code-review-summary-20260904-round-2.md`: Finding #1 合并 missing ancestor 与 cross-space symlink 根因，要求 canonical target物理留在 real UX owner、legacy target物理留在 real Planning owner，并对 missing leaf 验证 nearest existing ancestor。
  - `11-6-code-review-evaluation-20260904-round-2.md`: evaluator 确认该 finding 为 P1，授权 owner-specific candidate policy、nearest-existing-ancestor检查与 write 前重验，不新增 taxonomy 或 UX-local resolver。
  - `11-6-code-review-summary-20260904-round-3.md`: Finding #1 通过 deterministic preflight-to-write replacement 证明返回 approval 后再由 caller执行 mutation 仍可跨 owner，要求 actual operation 与 last-moment revalidation 耦合。
  - `11-6-code-review-evaluation-20260904-round-3.md`: fixer record确认同一 bounded operation执行 initial inspection、受控 interposition、commit-time reinspection与 exclusive `wx` create/single `mkdir`，并覆盖 replacement、existing target及zero-mutation matrix。
  - `11-6-code-review-evaluation-20260904-round-5.md`: latest evaluator确认 physical-owner、nearest-ancestor与operation coupling在 canonical script及repository routing中保持关闭，两份installed copy也执行对应负例。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是；`CR-SEC-02/13/19/20`分别覆盖 mutation前guard、existing overwrite preflight、read-route candidate与discovery资格，本规则只补 actual write operation 内的 owner/ancestor commit-time coupling
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 2 与 Round 3 连续从 missing ancestor、cross-space symlink和preflight replacement复现同一根因，并由 Round 5确认关闭。 |
  | 影响范围 | 2 | 适用于 artifact file create、on-demand directory create、canonical/legacy owner以及installed Skill filesystem primitive。 |
  | 风险等级 | 2 | 检查与写入脱耦可导致跨 owning space 或项目边界的实际 mutation，属于安全与数据完整性风险。 |
  | 根因稳定性 | 2 | filesystem path安全检查若返回 approval给caller，再单独执行 mutation，会稳定暴露TOCTOU与symlink/ancestor replacement窗口。 |
  | 可执行性 | 2 | 可用owner-specific realpath、nearest-existing-ancestor、commit-time reinspection、exclusive create与受控 replacement zero-mutation tests检查。 |
  | 文档缺口 | 1 | 既有规则覆盖candidate/discovery与通用safe-write，但未明确把missing ancestor和physical owner重验耦合到实际artifact operation。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: 任何依据 configured artifact root/owning space 创建文件或目录的 runtime/Skill-local filesystem operation，尤其是允许missing leaf、on-demand parent或existing symlink的流程。
- **规避指南**:
  - 不得只证明 target lexical位于project root；canonical、legacy与其它space必须各自绑定明确physical owner。
  - 不得把 missing leaf直接视为安全；必须找到nearest existing ancestor，验证其为dereferenced directory且物理位于owner内。
  - 不得由preflight helper返回可写状态后让caller另行执行raw write/mkdir；安全重验与实际mutation必须处于同一bounded operation，重验后不得再经过user-controlled seam。
- **最佳实践**:
  - Operation先验证project/planning/owner physical roots和target lexical containment，再验证target确实missing与nearest existing ancestor；commit前重做同一检查，随后立即使用exclusive file create或single non-recursive directory create。
  - 回归矩阵至少覆盖regular-file/FIFO/dangling/out-of-project/project内cross-space ancestor、existing target preservation、owner/ancestor replacement和outside/target/progress zero mutation。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则总分高但适用范围集中在artifact filesystem operation技术域，且本轮明确为record-only；已有path-safety owner contract与D1 docs承载current truth。
- **本次落地**:
  - Round 2/3 fixer完成owner/ancestor与operation coupling，Round 5 reviewer/evaluator确认关闭；本次仅新增`CR-SEC-21`与Story 11-6记录。
- **同步状态**: 已写入规则总结

#### 既有规则更新：CR-DOC-05 Installed Markdown workflow 与 executable implementation 必须形成可定位、同源的双向 binding

- **处理结果**: 不新建重复规则。Story 11.4 已证明“helper有安全语义但installed Markdown未绑定”；Story 11.6 又证明“Markdown强制operation但installed package无实现”。两者是同一 Agent execution双轨根因的相反方向，已将标题改为双向binding，来源更新为`11-4, 11-6`，总分由9/12更新为11/12。
- **更新依据**: `11-6-code-review-evaluation-20260904-round-4.md`确认installed private binding缺失是P1；其fix record与Round 5 evaluation确认canonical Skill-local script、repo import同源、真实installer投影、两份installed invocation及fixed private CLI全部闭环。
- **同步状态**: 已写入规则总结

#### CR-DOC-07：Bounded markup validator 必须与 renderer 的 precedence 和 character-reference 语义一致

- **来源问题**: Story 11.6 Round 2 发现 UX link validator 与实际Markdown/HTML renderer语义不一致：normalized duplicate Markdown reference definitions使用last-wins，可让unsafe first definition被safe duplicate覆盖；HTML attribute raw值中的character reference又在validator strip query/fragment之前未被解释，导致renderer解析到的local path与validator检查的字符串不同。单独验证“看起来安全的最终字符串”不足以证明真实消费路径安全。
- **CR 证据**:
  - `11-6-code-review-summary-20260904-round-2.md`: Findings #2/#3 分别确认duplicate definition precedence与HTML character-reference bypass，要求first-definition-wins及bounded decode或fail-close，禁止引入完整parser扩面。
  - `11-6-code-review-evaluation-20260904-round-2.md`: evaluator确定Markdown normalized label采用first-definition-wins；local-ish HTML `href`/`src` raw value只要含`&`，就在strip/decode前返回`unsupported-local-reference`，同时保留external scheme与literal fragment/query-only例外。
  - `11-6-code-review-evaluation-20260904-round-2.md`: fixer record确认duplicate unsafe-first/safe-second、safe-first/unsafe-second及decimal/hex/named/malformed HTML reference matrix均已覆盖。
  - `11-6-code-review-evaluation-20260904-round-5.md`: latest evaluator确认first-definition-wins与HTML raw `&` fail-close保持current executable evidence。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是；`CR-DOC-06`覆盖Markdown shard grammar/pipeline/order，本规则限定validator与真实renderer在跨Markdown/HTML precedence及entity语义上的等价性，不重复单个语法case
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | 同一轮从Markdown duplicate precedence与HTML character reference两个markup surface复现renderer-validator分叉，并与Story 11.5 bounded parser drift形成跨 Story迹象。 |
  | 影响范围 | 1 | 主要影响使用bounded Markdown/HTML local-reference validator的workflow artifact、assets与cross-document navigation技术域。 |
  | 风险等级 | 2 | 语义分叉可让renderer消费validator未检查的越界路径，形成cross-space/project escape，也可制造伪block。 |
  | 根因稳定性 | 2 | 手写validator若自行定义precedence/decoding而未对齐renderer，duplicate、entity、query/fragment组合会高概率再次产生语义差。 |
  | 可执行性 | 2 | 可用unsafe-first/safe-second双向矩阵、normalized labels、decimal/hex/named/malformed entity与external/fragment controls确定性验证。 |
  | 文档缺口 | 1 | 既有bounded Markdown规则未覆盖HTML renderer entity semantics及跨markup validator parity。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: 解析workflow-owned Markdown links、reference definitions、HTML `href`/`src`、screenshots/assets与cross-document navigation的bounded validator；不授权完整CommonMark、DOM或HTML entity parser。
- **规避指南**:
  - 不得用last-wins覆盖Markdown renderer的first-definition语义，也不得验证会被renderer忽略的duplicate destination。
  - 不得在HTML raw attribute仍可能含character reference时先strip `?`/`#`并把结果当实际renderer target；未实现完整且同语义decoder时必须对local-ish形态fail closed。
  - 不得把external scheme或纯literal fragment/query-only reference误纳入local filesystem containment。
- **最佳实践**:
  - 先固定支持的renderer subset与precedence，再让validator复用同一normalized label/first occurrence规则；HTML若采用保守策略，应在任何local path分类或percent decode前拒绝raw `&`。
  - Tests成对覆盖unsafe-first/safe-second、safe-first/unsafe-second、case/whitespace label normalization、named/numeric/malformed entities、query/fragment decoy、external schemes及literal fragment/query-only controls。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则属于bounded markup validator技术域，现有D1 docs已记录current first-wins与HTML fail-close；本轮只沉淀可复用CR检查点。
- **本次落地**:
  - Round 2 fixer已修复，Round 5 reviewer/evaluator确认关闭；本次仅新增`CR-DOC-07`与Story 11-6记录。
- **同步状态**: 已写入规则总结

#### 既有规则更新：CR-TEST-02 Command fixture 必须显式满足被测 gate 之前的前置 evidence

- **处理结果**: 不新建“legacy no-migration fixture”专属规则。Story 11.6 install-after-legacy setup错误与Story 4.3缺trusted manifest却断言后置gate同属fixture前置状态不成立；已将来源更新为`4-3, 11-6`，总分由7/12更新为9/12，并补充多阶段 lifecycle逐阶段evidence要求。
- **更新依据**: `11-6-code-review-summary-20260904-round-2.md`与对应evaluation确认install-existing证据缺口；Round 5 evaluation确认六类legacy entries在install前建立并由install/update/repair逐阶段验证source invariants与canonical no-copy。
- **同步状态**: 已写入规则总结

#### 未沉淀 / 交接项

- **inactive Architecture duplicate `*ux-design*.md` wildcard**: 状态未闭合，不进入已解决规则总结；维持latest Evaluator确认的P2 defer，交CR05做去重与正式登记。
- **raw template `stepsCompleted: []`**: 不沉淀。Round 2 aggregator/evaluator确认active Step 1在bind前先写`stepsCompleted: [1]`，不是current runtime defect。
- **“internal helper未接public CLI”主张**: 不单独沉淀。Round 2驳回无授权public surface扩面；Round 4真实缺口已由更新后的`CR-DOC-05`限定为installed private binding，而非public CLI。
- **Story专属 UX basenames、legacy sibling位置与config example文件清单**: 已修复的Story局部契约，不泛化为跨Story规则。
- **external drawer与fixed-count drift**: 范围外并发状态，不是Story 11.6 finding，不写入规则。

#### 05 TODO Tracker 交接

- **交接候选**: inactive shipped Architecture duplicate step仍含`*ux-design*.md` wildcard；维持P2，仅由CR05决定backlog去重/登记与owner归属。
- **CR04 边界**: 本次不写`cr-todo-backlog.md`，不处理该duplicate，不执行CR05；Story 11.6已解决规则与该open项不重复管理。

### Story 11-1 / 2026-09-03

- **Story**: 11-1
- **分析来源**:
  - `11-1-code-review-summary-20260902-round-1.md`
  - `11-1-code-review-evaluation-20260902-round-1.md`
  - `11-1-code-review-summary-20260902-round-2.md`
  - `11-1-code-review-evaluation-20260903-round-2.md`
  - `11-1-code-review-summary-20260903-round-3.md`
  - `11-1-code-review-evaluation-20260903-round-3.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：`resolveArtifactRootsFromProjectConfig()` roots/modes 正确，但 no-key full-read 的 `configSources` 为空，未满足 Story 11.1 的 merged config/provenance handoff。
  - Round 1 fixer 已修复 `src/config/customization-reader.ts` 的 no-key full-read source selection，并新增 `test/resolve-readers.test.ts` 与 `test/artifact-root-resolution.test.ts` regression；Round 3 reviewer/evaluator 确认该 P1 已关闭。
  - Round 2 reviewer/evaluator 确认 1 个 P1 `patch` finding：`test/contract-anchors.test.ts` 仍锚定旧 `sources: {}` expectation，和已批准的 leaf provenance handoff 冲突；fixer 已作 test-only 更新，Round 3 确认关闭。
  - Round 3 reviewer/evaluator 均通过；新 findings 0，CR TODO 0，用户决策点 0。
  - 本次 04 按外层编排授权采用默认推荐决策：record-only。仅更新本规则总结，不修改 project-context、Architecture、AGENTS、CLAUDE、Story、SPEC、Flow Gate、源码、测试或 tracker。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Artifact-root resolver handoff 必须保留 leaf dotted-key provenance | 通过 | 10/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-API-34 |
| Resolver schema anchor 必须解析真实 runtime result shape | 通过 | 9/12 | rules-summary | 用户本次授权默认推荐决策：record-only，更新既有 CR-API-13 复现证据，不新增重复规则 |

### 提炼规则

#### CR-API-34：Artifact-root resolver handoff 必须保留 leaf dotted-key provenance

- **来源问题**: Story 11.1 Round 1 发现 artifact-root resolver wrapper 已能解析正确 roots/modes，但 `resolveProjectConfig()` no-key full-read 只按顶层 `core` / `modules` 过滤 source metadata，导致返回给 downstream consumers 的 `configSources` 为空。后续 installer、manifest、validator 或 workflow consumer 若要解释 explicit authority、legacy fallback 或 config/artifact mismatch，只能重新推导来源层，形成第二套 provenance 语义。
- **CR 证据**:
  - `11-1-code-review-summary-20260902-round-1.md`: Finding #1 指出 `resolveArtifactRootsFromProjectConfig()` 调用 no-key `resolveProjectConfig()` 后将空 `configSources` 透传给 resolver handoff。
  - `11-1-code-review-evaluation-20260902-round-1.md`: evaluator 确认该 finding 为 P1，要求在既有 four-layer TOML merge/provenance 语义上修复，不新增第二套 merge logic。
  - `11-1-code-review-evaluation-20260902-round-1.md`: 修复执行记录确认 no-key full-read 已改为按 selected nested value 的 leaf dotted keys 返回 source metadata，并补充 team/user custom 与 legacy fallback provenance regression。
  - `11-1-code-review-evaluation-20260903-round-3.md`: evaluator 独立确认 Round 1 P1 已关闭，`resolveArtifactRootsFromProjectConfig()` 当前会把 `configResult.sources` 作为 `configSources` 透传。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator/fixer/复审闭环均确认；与既有 shared resolver 接入规则有同类风险迹象，但本具体模式首次沉淀。 |
  | 影响范围 | 2 | 影响 config reader、artifact-root resolver handoff，以及后续 installer、manifest、validator、workflow consumer 的 artifact-root evidence 解释。 |
  | 风险等级 | 2 | provenance 丢失会让 explicit-config、legacy-compatible fallback 与 mismatch diagnostics 的 authority 难以追溯，可能诱导后续 consumer 另建不一致语义。 |
  | 根因稳定性 | 2 | nested config 与 leaf source metadata 分开选择时，顶层 key/full-read 误配是稳定实现陷阱，后续新 root field 仍可能复现。 |
  | 可执行性 | 2 | 可用 leaf dotted-key source selection、`configSources` handoff assertions、team/user custom override 与 legacy fallback regression 直接检查。 |
  | 文档缺口 | 1 | 既有 SPEC/Architecture 要求 single resolver 与 provenance，但既有 CR 规则未细化 no-key full-read handoff 必须保留 leaf metadata。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: config/customization reader、artifact-root resolver、resolve/config handoff、以及任何向 downstream consumers 暴露 merged config/provenance 的 API。
- **规避指南**:
  - 不得在 no-key full-read 或 nested config handoff 中只按顶层 key 过滤 source metadata，导致 leaf dotted-key provenance 丢失。
  - 不得让 downstream consumer 为了解释 artifact-root authority 重新读取 TOML 或维护第二套 config source 推导逻辑。
- **最佳实践**:
  - resolver handoff 应保留 selected nested value 中每个 relevant leaf dotted key 的 effective source metadata，并明确区分 explicit root source 与 legacy fallback source。
  - focused regression 应覆盖 team custom、user custom、legacy fallback provenance，以及不返回顶层 `core` / `modules` source metadata 的 leaf-only guard。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则总分为 10/12，但用户本轮明确授权 CR04/05 采用默认 record-only 决策且禁止修改全局文档；`SPEC 09` 与 Architecture 已提供 owning artifact-root / shared resolver 原则，本条沉淀为实现检查点。
- **本次落地**:
  - Round 1 fixer 已修复，Round 3 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-API-34` 和 Story 11-1 记录。
- **同步状态**: 已写入规则总结

#### CR-API-13：Resolver schema anchor 必须解析真实 runtime result shape

- **来源问题**: Story 11.1 Round 2 发现 `test/contract-anchors.test.ts` 仍把 no-key full-read 的 `sources: {}` 固定为 executable anchor。该 expectation 与 Round 1 已批准的 runtime leaf provenance handoff 冲突，导致 full `npm test` 唯一失败，并可能诱导后续修复回退真实 runtime result shape。
- **CR 证据**:
  - `11-1-code-review-summary-20260902-round-2.md`: Finding #1 指出 contract anchor 仍断言旧 `sources: {}`，但 current runtime result 已返回 `sources.core.project_name` leaf metadata。
  - `11-1-code-review-evaluation-20260903-round-2.md`: evaluator 确认该 finding 为 P1，说明 public CLI machine output 只输出 `result.value`，human no-key output 仍显示 `source path: multiple`，因此 direct-API anchor 应跟随真实 runtime result。
  - `11-1-code-review-evaluation-20260903-round-2.md`: 修复执行记录确认该用例已更新为 leaf `core.project_name` metadata，并保留 schema parse、value、issues、exitCode 与 leaf-not-top-level guard。
  - `11-1-code-review-evaluation-20260903-round-3.md`: evaluator 确认 Round 2 P1 已关闭，focused verification 覆盖 `test/contract-anchors.test.ts` 并通过。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是，本次复用既有 `CR-API-13`，不新增等价规则编号
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | 同类 schema/runtime anchor 漂移已在 Story 2.4 与 Story 11.1 复现。 |
  | 影响范围 | 1 | 影响 direct API contract anchor、resolve/config reader schema parse 和 full-suite completion evidence。 |
  | 风险等级 | 1 | stale anchor 会把正确 runtime behavior 误判为回归，或诱导 fixer 回退已批准语义。 |
  | 根因稳定性 | 2 | contract anchor snapshot 与 runtime result shape 分离维护，字段或 metadata 语义演进时容易再次漂移。 |
  | 可执行性 | 2 | 可要求 anchor tests 解析真实 runtime result，并对 changed fields/source metadata 写精确 assertions。 |
  | 文档缺口 | 1 | 既有 CR-API-13 已覆盖该检查点；本次补充跨 Story 复现证据，而非新增全局文档要求。 |

- **总分**: 9/12
- **建议去向**: rules-summary
- **适用范围**: resolver schema anchor、contract anchor tests、runtime result parser、以及任何直接锚定 internal API result shape 的 executable contract。
- **规避指南**:
  - 不得用陈旧 expected snapshot 覆盖真实 runtime result shape；当 Story 已批准 runtime semantics 更新时，direct-API anchor 必须同步更新为精确字段断言。
- **最佳实践**:
  - Contract anchor tests 应继续调用真实 runtime function，通过 schema parse 验证 result shape，并分别断言 public output boundary 与 internal metadata boundary，避免把 internal API metadata 误读为 CLI output contract。
- **全局文档建议**:
  - 不建议本次升格到全局文档；该模式已由既有 `CR-API-13` 记录，本次只更新复现证据和规则索引。
- **本次落地**:
  - Round 2 fixer 已修复，Round 3 reviewer/evaluator 确认关闭；本次 04 仅更新 `CR-API-13` 的索引来源/评分，并在 Story 11-1 记录中追加复现证据。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 与 Round 2 evaluator 均未降级任何 CR TODO；Round 3 evaluator 明确 TODO 0、用户决策点 0。04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 11-2 / 2026-09-03

- **Story**: 11-2
- **分析来源**:
  - `11-2-code-review-summary-20260903-round-1.md`
  - `11-2-code-review-evaluation-20260903-round-1.md`
  - `11-2-code-review-summary-20260903-round-2.md`
  - `11-2-code-review-evaluation-20260903-round-2.md`
  - `11-2-code-review-summary-20260903-round-3.md`
  - `11-2-code-review-evaluation-20260903-round-3.md`
  - `EXPERIMENT_NOTES.md`
- **结论概览**:
  - 模型使用时间线：Reviewer Round 1/2/3、Evaluator Round 1/2/3 以及两轮 Fixer records 均记录 `Model Used: GPT-5.5 (gpt-5.5)`；本次 CR04 使用模型：GPT-5.5 (gpt-5.5)。
  - Round 1 reviewer/evaluator 确认 2 个真阳性：ReadyCheck 对 fresh manifest `paths.artifactRoots[]` 缺失/错配未 fail-closed；D1 current public docs 仍发布旧 fresh defaults。Evaluator 将 ReadyCheck 上调为 P1，D1 docs 判为 P2 bounded patch；Round 1 fixer 已修复，Round 3 evaluator 确认关闭。
  - Round 2 reviewer/evaluator 确认 2 个真阳性：fresh detailed per-root explicit override 被投影为 `fresh-default`；brownfield tutorial Step 1 / Step 6 仍使用旧 default quick paths。Evaluator 将前者改裁为 P1 `decision_needed`，用户批准方案 A 后，fixer 以 dated controlled correction 修订 owner artifacts 并完成 resolver/tests/docs 修复；Round 3 reviewer/evaluator 确认全部关闭。
  - Round 3 reviewer/evaluator 均通过；新增 findings 0，阻塞修复 0，新 owner decision 0。唯一保留项为 `docs/reference/workflow-artifact-layout.md` generic route strings，维持 Story 11.4+ / CR TODO 候选，交 CR05 判断。
  - 本次 04 按外层编排授权采用默认推荐决策：record-only。仅更新本规则总结与必要 CR04 记录，不修改 project-context、Architecture、AGENTS、CLAUDE、Story、SPEC、Flow Gate、源码、测试、tracker、Reviewer、Evaluator 或 TODO backlog。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Fresh ReadyCheck 必须对 caller 与 manifest 的 optional additive projection 做 fail-closed reconciliation | 通过 | 10/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-API-35 |
| `resolutionMode` 必须表达 field-level 来源语义而非 lifecycle 标签 | 通过 | 9/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-API-36 |
| Owner correction 必须用 dated controlled correction 保留原决策轨迹 | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-PROCESS-02 |
| D1 current public docs fresh defaults 必须同步 | 未通过：不重复 | 6/12 | none | 已由 canonical governance 的 `current-public-docs` D1 policy 覆盖；本轮作为修复证据，不新增重复规则 |
| Brownfield tutorial Step 1 / Step 6 default quick paths | 未通过：纯局部文档遗漏 | 4/12 | none | 已修复，但绑定单一 tutorial section，不沉淀为全局规则 |
| `workflow-artifact-layout.md` generic route strings | 未通过：状态未闭合 | 5/12 | todo-tracker | 维持 Story 11.4+ / CR TODO 候选；CR04 不写 `cr-todo-backlog.md`，交 CR05 去重/登记判断 |

### 提炼规则

#### CR-API-35：Fresh ReadyCheck 必须对 caller 与 manifest 的 optional additive projection 做 fail-closed reconciliation

- **来源问题**: Story 11.2 Round 1 发现 fresh install caller 已携带七个 `paths.artifactRoots[]` expected projection，但 ReadyCheck 在 manifest 缺失该 optional additive field、顺序错配、entry 内容错配或重复 field 时仍可继续使用 caller projection 并返回 ready。这样会让 manifest/index drift 被 Ready Summary gate 掩盖，形成 false-ready。
- **CR 证据**:
  - `11-2-code-review-summary-20260903-round-1.md`: Finding #1 用删除 manifest `paths.artifactRoots[]` 与改写第一个 `resolvedRoot` 的定向复现证明 `runReadyCheck()` 仍返回 `ok=true`。
  - `11-2-code-review-evaluation-20260903-round-1.md`: evaluator 确认该 finding 为 P1，要求 caller `paths.artifactRoots[]` 存在时将其作为 expected projection，与 manifest projection 做 fail-closed reconciliation，同时保留旧 manifest optional compatibility。
  - `11-2-code-review-evaluation-20260903-round-1.md`: 修复执行记录确认 `runReadyCheck()` 已覆盖 manifest missing projection、count mismatch、non-unique field、fixed order mismatch、entry field mismatch 与 invalid entry，并复用 `manifest-schema.malformed-field` 的 deterministic details。
  - `11-2-code-review-evaluation-20260903-round-3.md`: evaluator 独立确认 ReadyCheck Round 1 finding 关闭，focused regressions 覆盖 missing/order/path/duplicate/legacy both-omit 场景。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 的 reviewer 定向复现、evaluator P1 裁决、fixer 修复与 Round 3 复审复评均确认；暂无跨 Story 复现。 |
  | 影响范围 | 2 | 影响 install caller projection、manifest/index projection、ReadyCheck、Ready Summary、fixtures 和 release confidence。 |
  | 风险等级 | 2 | ReadyCheck false positive 会把 manifest/index drift 投影为 ready，直接破坏 fresh install gate 可信度。 |
  | 根因稳定性 | 2 | optional additive public field 与 backward compatibility 并存时，容易只保留 optional parse 而遗漏 caller/manifest reconciliation。 |
  | 可执行性 | 2 | 可通过 manifest missing/count/order/field/entry mismatch regressions、stable issue details 和 legacy both-omit negative guard 直接检查。 |
  | 文档缺口 | 1 | SPEC 01/04 声明 optional additive projection 与 ordering，但既有 CR 规则未沉淀 ReadyCheck 对 expected/actual projection fail-closed 的实现检查点。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: install/ready-check、manifest/index validation、CommandResult/Ready Summary projection，以及任何由 caller expected projection 与 on-disk manifest projection共同支撑 readiness 的流程。
- **规避指南**:
  - 不得因为 public field 是 optional additive，就在 fresh/install caller 已提供 expected projection 时静默回填或跳过 manifest projection mismatch。
  - 不得只检查 artifact root directories 是否存在，而不比较 caller projection 与 manifest projection 的 count、order、field uniqueness 和 entry content。
- **最佳实践**:
  - 当 caller/input 携带 expected additive projection 时，ReadyCheck 应把 manifest 缺失、重复、顺序错配、field 错配、`resolvedRoot` 错配或 schema-invalid entry 归为 blocking `ValidationIssue`。
  - Legacy compatibility 应以 caller 与 manifest 均省略 additive projection为明确豁免；manifest present/input absent 可以继续由 manifest projection 驱动 runtime path check。
  - Issue details 应使用 deterministic/redacted codes，不携带 absolute path、hash、timestamp 或临场新增 taxonomy。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则分数达到 10/12，但适用面偏 install/ReadyCheck 实现域；SPEC 01/04 已拥有 public field contract，本次按 CR04 record-only 只写入规则总结。
- **本次落地**:
  - Round 1 fixer 已修复，Round 3 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-API-35` 和 Story 11-2 记录。
- **同步状态**: 已写入规则总结

#### CR-API-36：`resolutionMode` 必须表达 field-level 来源语义而非 lifecycle 标签

- **来源问题**: Story 11.2 Round 2 发现 fresh detailed prompt 允许用户对单个 artifact root field 输入非空值，resolver 也会使用该值，但 projection 仍统一标记为 `fresh-default`。这会让 manifest、CommandResult 和 Ready Summary 在路径正确的同时错误表达来源语义，把用户显式配置伪装成默认值。
- **CR 证据**:
  - `11-2-code-review-summary-20260903-round-2.md`: Finding #1 指出 detailed config 下 `planning_artifacts="_speclite-output/plans"` 生效，但 `resolutionMode` 仍为 `fresh-default`。
  - `11-2-code-review-evaluation-20260903-round-2.md`: evaluator 确认现象有效，但因 Story 11.2 kickoff 与 CLI detailed override 语义冲突，将其改裁为 P1 `decision_needed`，要求 owner 裁决。
  - `EXPERIMENT_NOTES.md`: Owner Decision Closed 记录用户批准方案 A：fresh detailed 非空逐 field 输入为 `explicit-config`；未显式 fields、quick/default 与仅由 `output_folder` 派生的 roots 保持 `fresh-default`。
  - `11-2-code-review-evaluation-20260903-round-2.md`: 修复执行记录确认 `src/config/artifact-root-resolver.ts` fresh 分支已按 `explicitValue !== undefined` 返回 `explicit-config`，并补充 focused/negative-guard tests。
  - `11-2-code-review-evaluation-20260903-round-3.md`: evaluator 确认 owner correction、runtime、tests 和 ad-hoc detailed install propagation 均已闭环。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 的 Round 2 reviewer/evaluator/fixer 与 Round 3 复核确认；同类 source/provenance 语义风险在 artifact-root resolver 系列中已有复现迹象。 |
  | 影响范围 | 2 | 影响 resolver、config initialization、CLI detailed prompt、manifest、CommandResult、Ready Summary 和 focused fixtures/tests。 |
  | 风险等级 | 1 | 不破坏目录创建，但会让 public projection 错误表达用户显式输入来源，误导 review/readiness 或后续 consumer 判断。 |
  | 根因稳定性 | 2 | lifecycle、default derivation 与 field-level explicit value 混在同一 projection 时，后续新增 root field 或 mode enum 容易再次误标。 |
  | 可执行性 | 2 | 可用 per-field explicit override test、quick/default negative guard、`output_folder` 派生 guard 和 manifest/CommandResult propagation check 直接验证。 |
  | 文档缺口 | 1 | SPEC 09 已通过 controlled correction补上语义，但既有 CR 规则未沉淀“mode 表达 field-level 来源而非 lifecycle”的检查点。 |

- **总分**: 9/12
- **建议去向**: rules-summary
- **适用范围**: artifact-root resolver、runtime config projection、manifest/CommandResult/Ready Summary field projection，以及任何包含 `fresh-default` / `explicit-config` / `legacy-compatible` 等来源枚举的 public/internal result。
- **规避指南**:
  - 不得把 `resolutionMode` 当成 install lifecycle 标签统一赋值；它必须反映每个 field 的实际来源。
  - 不得将用户在 detailed prompt 中输入的非空逐 field root 标为 `fresh-default`，除非 owner contract 明确把该输入定义为 default 参数化。
- **最佳实践**:
  - 对每个 projected field 分别判断来源：非空逐 field explicit input 为 `explicit-config`；blank Enter、quick/default 和仅由 `output_folder` 派生的 per-root values 保持 `fresh-default`；existing explicit config 与 legacy fallback 按 owner contract 单独标记。
  - Tests 应同时覆盖 positive explicit override、其它未覆盖 fields 仍为 default、quick/default negative guard 和 end-to-end manifest/CommandResult propagation。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则总分为 9/12，但 `SPEC 09` 已作为 field-level owner 完成 controlled correction；本次只沉淀为后续 resolver/projection 实现检查点。
- **本次落地**:
  - Round 2 fixer 已修复，Round 3 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-API-36` 和 Story 11-2 记录。
- **同步状态**: 已写入规则总结

#### CR-PROCESS-02：Owner correction 必须用 dated controlled correction 保留原决策轨迹

- **来源问题**: Story 11.2 Round 2 暴露 `resolutionMode` 语义分叉后，现有 kickoff gate 曾写入“fresh install all seven roots are `fresh-default`”，而新 owner decision 选择了 fresh detailed 非空逐 field 输入为 `explicit-config`。若直接改写 Story、SPEC 或 kickoff 原文，会让后续 CR 无法追溯为什么原 gate wording 被 supersede，也会掩盖真实的 owner decision 过程。
- **CR 证据**:
  - `11-2-code-review-evaluation-20260903-round-2.md`: evaluator 将 mode finding 改裁为 `decision_needed`，要求先由 `SPEC 09` / Story 11.1 / Story 11.2 owner 决策，并明确是否需要 controlled correction。
  - `EXPERIMENT_NOTES.md`: Owner Decision Closed 记录用户批准方案 A，并要求用 dated controlled correction 保留 2026-09-02 原决策轨迹，不得静默改写。
  - `11-2-code-review-evaluation-20260903-round-2.md`: 修复执行记录确认已在 `SPEC 09`、Story 11.1、Story 11.2 和 Story 11.2 kickoff gate 追加 `Controlled Correction 2026-09-03`。
  - `11-2-code-review-summary-20260903-round-3.md`: reviewer 确认 2026-09-02 kickoff 原始决策未删除，新修正只 supersede 该 bullet 的最后一句并限定适用范围。
  - `11-2-code-review-evaluation-20260903-round-3.md`: evaluator 确认 owner artifacts 以 dated controlled correction 闭环，未用 post-hoc 文档掩盖 runtime/public projection 分裂。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 本 Story 首次以 owner decision + controlled correction 形式闭环；同类历史快照/当前事实边界风险在 canonical governance 中已有稳定模式。 |
  | 影响范围 | 2 | 影响 SPEC、Story、kickoff/completion gate、review/evaluation records 和后续 CR 判断。 |
  | 风险等级 | 1 | 静默改写通常不直接破坏 runtime，但会破坏审计链、让后续 reviewer/evaluator 误读原决策和授权边界。 |
  | 根因稳定性 | 2 | owner artifacts 与 gate wording 发生冲突时，开发者容易把旧文本直接改成当前事实，导致历史轨迹丢失。 |
  | 可执行性 | 1 | 可通过 diff、dated correction heading、supersede wording 和 reviewer/evaluator record 检查，但不完全适合自动化。 |
  | 文档缺口 | 1 | canonical governance 已要求 frozen historical record 不静默刷新；本规则补充 CR owner-correction 场景下的 dated correction 操作检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: owner decision gate、SPEC/Story/kickoff/completion gate controlled correction、CR evaluation/fix records，以及任何需要修正已关闭 owner wording 但保留历史事实的流程。
- **规避指南**:
  - 不得为了让当前实现看起来一致而删除或重写原始 gate/Story/SPEC 决策文本。
  - 不得在未记录 owner decision、日期、supersede 范围和证据的情况下把需求语义分叉直接交给 fixer。
- **最佳实践**:
  - 对已关闭 owner artifact 的语义修正应追加 `Controlled Correction YYYY-MM-DD` 或等价 dated note，明确保留原决策、说明 supersede 的具体句子/范围，并绑定 reviewer/evaluator/fixer evidence。
  - Review 阶段应检查 controlled correction 是否在所有 owner artifacts 中一致出现，且没有借修正文档暗中扩大 Story scope。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则与 canonical governance 的 D2 frozen-history policy 相近，本次只沉淀为 CR owner-correction 操作规则，避免重复修改全局治理文档。
- **本次落地**:
  - Round 2 fixer 已按 owner decision 修订，Round 3 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-PROCESS-02` 和 Story 11-2 记录。
- **同步状态**: 已写入规则总结

#### 未沉淀 / 交接项

- **D1 current public docs fresh defaults**: 不新增规则。理由：该事项已由 `canonical-governance.json` 的 `current-public-docs` D1 policy 与 `docs/reference/canonical-source-governance.md` 覆盖；Round 1 evaluator/fixer 已按 bounded scope 修复，本次作为 CR-API-35/36 的背景证据，不创建重复 CR-DOC 规则。
- **Brownfield tutorial Step 1 / Step 6 default quick paths**: 不新增规则。理由：该 finding 绑定单一 tutorial 的两个 section，已由 Round 2 fixer 修复；可作为 D1 docs 修复证据，但纯局部路径 drift 不具备单独规则化价值。
- **`workflow-artifact-layout.md` generic route strings**: 不写入规则总结，也不在 CR04 直接写 `cr-todo-backlog.md`。理由：Round 3 evaluator 明确它仍属于 Story 11.4+ / CR TODO 候选，当前状态未闭合；交 CR05 做现有 TODO 去重、归属和是否登记判断。

#### 05 TODO Tracker 交接

- **交接候选**: `workflow-artifact-layout.md` generic route strings，归属 Story 11.4+ workflow routing / canonical Skill alignment。CR04 不直接写 TODO backlog，避免与 CR05 职责重叠。

### Story 11-3 / 2026-09-03

- **Story**: 11-3
- **分析来源**:
  - `11-3-code-review-summary-20260903-round-1.md`
  - `11-3-code-review-evaluation-20260903-round-1.md`
  - `11-3-code-review-summary-20260903-round-2.md`
  - `11-3-code-review-evaluation-20260903-round-2.md`
  - `11-3-code-review-summary-20260903-round-3.md`
  - `11-3-code-review-evaluation-20260903-round-3.md`
- **结论概览**:
  - 模型使用时间线：Reviewer Round 1/2/3 与 Evaluator Round 1/2/3 均记录 `Model Used: GPT-5.5 (gpt-5.5)`；Round 1 evaluation 后的 fresh fixer recovery record 也记录 `Model Used: GPT-5.5 (gpt-5.5)`；本次 CR04 使用模型：GPT-5 (Codex)。
  - Findings 统计：Round 1 reviewer/evaluator 确认 4 个 `patch` finding，并均评估为 P1；Round 2 reviewer/evaluator 确认 1 个 legacy `story_location` directory noise `patch` finding，并评估为 P1；Round 3 reviewer/evaluator 均通过，新增 blocker 0。
  - Round 1/2 fixer 已修复 malformed config status failure、project-level legacy actual path plumbing、installer namespace ownership precedence、unknown future metadata passthrough，以及 legacy story directory noise filtering；Round 3 evaluator 独立确认 5 个 P1 均 Closed。
  - Resolver-level protected namespace rejection 与 single-file / metadata-only legacy Story 支持均被 Round 3 evaluator 明确维持为 P2 Owner future；本次不得写成当前强制规则或已实现 contract。
  - Packaging 证据以 Round 3 evaluator 的最终顺序重跑为有效证据：`npm run release:packaging-check` 顺序重跑通过；早先 build/packaging 并行导致的 `dist` 竞态失败不作为产品回归。
  - 本次 04 按外层编排授权采用默认推荐决策：record-only。仅更新本规则总结，不修改 project-context、Architecture、AGENTS、CLAUDE、Story、SPEC、Flow Gate、源码、测试、tracker、Reviewer、Evaluator、TODO backlog、PLAN、EXPERIMENTS 或 EXPERIMENT_NOTES。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Existing-state readout 必须将 blocking config resolver issue fail closed | 通过 | 10/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-API-37 |
| Config/artifact mismatch 必须消费 consumer-filtered actual path evidence | 通过 | 10/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-API-38 |
| Installer-owned namespace 必须优先于 overlapping artifact roots | 通过 | 10/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-SEC-18 |
| Workflow artifact metadata schema 必须兼容 unknown future keys 且保持 required keys strict | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-API-39 |
| Resolver-level protected namespace rejection | 未通过：状态未闭合且需 owner contract | 5/12 | todo-tracker | P2 Owner future；不写成当前强制规则，不写入本 rules summary 正文规则 |
| Single-file `story_location` 或 metadata-only legacy Story 支持 | 未通过：状态未闭合且需 owner contract | 5/12 | todo-tracker | P2 Owner future；`SPEC 09` 当前仍定义 directory + `{story_key}.md`，不写成当前兼容 contract |

### 提炼规则

#### CR-API-37：Existing-state consumer 必须将 blocking artifact-root resolver issue fail closed

- **来源问题**: Story 11.3 Round 1 发现 `status` 在 existing `_speclite/config.toml` malformed 或 artifact-root resolver blocking failure 时，静默回退 manifest `artifactRoots`，继续输出 `status="success"`、`issues=[]` 与 7 个 `fresh-default` roots。Story 11.8 Round 2 又发现 update planning 在 existing resolver `ok=false` 时返回 `undefined`，随后把 failure 误当成 legacy-compatible absence并回退 Planning-root migration projection。两者都把 blocking resolver evidence吞掉，再以 stale/default fallback继续 readout 或构造 write-capable plan。
- **CR 证据**:
  - `11-3-code-review-summary-20260903-round-1.md`: Finding #1 指出 `readInstalledStateSummary()` 在 resolver `!ok` 时返回 `input.manifestPaths`，`status` command 继续 success/no issues。
  - `11-3-code-review-evaluation-20260903-round-1.md`: evaluator 确认该 finding 为 P1，要求复用现有 resolver issues，blocking issue 时 status command failure、top-level `issues` 非空，并不得展示 manifest-derived fresh roots。
  - `11-3-code-review-evaluation-20260903-round-1.md`: fresh fixer recovery record 确认 malformed required config 下 `exitCode=1`、`status="failure"`、`data.highLevelHealth="failed"`，且 missing config lightweight fallback 仍保持非 blocking legacy 边界。
  - `11-3-code-review-evaluation-20260903-round-3.md`: evaluator 独立确认 Round 1 Finding #1 已 Closed，malformed config regression 覆盖 human/JSON 不泄露 temp root、不含 `mode=fresh-default`。
  - `11-8-code-review-evaluation-20260905-round-2.md`: Finding #1 确认 existing resolver failure 被吞掉后会进入 Planning-root migration fallback；Fix Summary 将 resolution表达为显式success/failure，原样传播stable issues，并在projection/transaction前返回blocked empty plan。
  - `11-8-code-review-evaluation-20260905-round-4.md`: evaluator确认resolver `ok=false` 的issues传播、projection前HALT、`actions=[]`、`changedPaths=[]`与合法无root配置的legacy-compatible分支均保持关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 11.3 的 public readout 与 Story 11.8 的 update planning 均吞掉 blocking resolver evidence并使用fallback继续执行，已形成跨 Story 复现。 |
  | 影响范围 | 2 | 影响 `status` command、installed-state summary、artifact-root resolver handoff、JSON/human output 与 automation health gate。 |
  | 风险等级 | 2 | blocking config failure 被伪装为 success/fresh defaults，会让用户和自动化误判 existing install current truth。 |
  | 根因稳定性 | 2 | Consumer把 `undefined` 同时表示“合法缺省”与“resolver失败”，再用默认/legacy fallback继续执行，是 readout 与 write planning 层稳定易复现的实现陷阱。 |
  | 可执行性 | 2 | 可用 malformed config、schema-invalid root、top-level issues、exit code、human output 与 no fresh-default projection regression 直接检查。 |
  | 文档缺口 | 1 | 既有 rules 覆盖 manifest/index unavailable 与 public config resolver 复用，但未细化 artifact-root resolver blocking issue 不得用 manifest roots 冒充 current readout。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: `status`、Ready Summary、installed-state readout、update/repair planning、artifact-root resolver handoff，以及任何消费 existing config/root resolution 后生成 public output 或 write-capable projection 的 command path。
- **规避指南**:
  - 不得在 blocking config/root resolver issue 出现时回退 manifest projection 并继续输出 empty issues 或 healthy/current roots。
  - 不得用同一个 `undefined`/empty value同时表达“合法无配置的 legacy-compatible 状态”和“resolver `ok=false`”；失败必须保留issues并在任何projection/transaction前阻断。
  - 不得把 `fresh-default` manifest roots 当作 existing config current truth；missing config 的 legacy fallback 必须与 malformed/invalid config failure 明确区分。
- **最佳实践**:
  - Existing-state readout 应消费 resolver 返回的 merged value、resolution mode 与 issues；blocking issue 进入 top-level `issues` 并驱动 command failure 或明确 warning，不展示 stale manifest-derived `artifactRoots`。
  - Write-capable consumer应把resolver success/failure建模为可区分结果；只允许明确成功返回的`legacy-compatible` roots进入fallback-compatible projection，失败路径断言empty plan、zero changed path与无journal/partial write。
  - Tests 应同时覆盖 malformed config、invalid root、missing config legacy fallback、human/JSON parity、redacted path 和 `status.data.highLevelHealth` / `CommandResult.status` 的边界。
- **全局文档建议**:
  - 不建议本次升格到全局文档。`SPEC 01`、`SPEC 09` 与既有 CR rules 已有 command/status/config 总原则，本条偏 Story 11.3 existing artifact-root readout 实现检查点；本次仅 record-only。
- **本次落地**:
  - Story 11.3 Round 1 fixer 已修复 readout fallback，Round 3 reviewer/evaluator 确认关闭。Story 11.8 Round 2 fixer已修复update consumer的failure propagation与projection前HALT，Round 4 reviewer/evaluator确认关闭；本次更新既有`CR-API-37`而不新增重复规则。
- **同步状态**: 已写入规则总结

#### CR-API-38：Config/artifact mismatch 必须消费 consumer-filtered actual path evidence

- **来源问题**: Story 11.3 Round 1 发现 project-level validation 只有低层 helper 手动传入 `actualArtifactPath` 时才能产生 `artifact-path.config-artifact-mismatch`；production `validate` 不会读取 legacy `sprint-status.story_location` 作为实际消费路径。Round 2 又发现修复后的 directory discovery 过宽，会把 `README.md`、`notes.md`、`notes.txt`、sidecar、hidden/temp 或 recursive child 都当作 story `actualConsumedPath` mismatch。
- **CR 证据**:
  - `11-3-code-review-summary-20260903-round-1.md`: Finding #2 指出 `validateArtifactPaths()` 只在 configured/default output root 下发现 artifacts，legacy actual path mismatch 只在手动 helper 参数中成立。
  - `11-3-code-review-evaluation-20260903-round-1.md`: evaluator 确认该 finding 为 P1，授权只接入 Story 11.3 范围内的 read-only legacy `sprint-status.story_location` evidence，不实现 whole/sharded precedence、新 routing 或 migration。
  - `11-3-code-review-summary-20260903-round-2.md`: Finding #1 指出 legacy `story_location` 目录会把非 story 文件也纳入 `actualConsumedPath` mismatch。
  - `11-3-code-review-evaluation-20260903-round-2.md`: evaluator 确认该 finding 为 P1，要求 directory `story_location` 只纳入同一 `development_status` 中合法 Story key 对应的 direct child `{story_key}.md`。
  - `11-3-code-review-evaluation-20260903-round-3.md`: evaluator 确认 Round 1 Finding #2 与 Round 2 Finding #1 均 Closed；production regression 覆盖 legal story file 被纳入、README/notes/sidecar/hidden/temp/recursive child 被排除，single-file `story_location` 不作为本轮合法 evidence。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 连续两轮暴露 production actual evidence 缺失与 directory noise false positive，并由 Round 3 复审复评确认关闭。 |
  | 影响范围 | 2 | 影响 `speclite validate`、artifact-path aggregation、legacy sprint status discovery、validation issue details 和 reviewer/evaluator evidence quality。 |
  | 风险等级 | 2 | production path 漏接会漏报真实 config/artifact mismatch；过宽接入会制造 false positive 并污染 `actualConsumedPath`。 |
  | 根因稳定性 | 2 | rule-level helper 可用但 command aggregation 未接入，或通用 directory walker 被用于特定 consumer evidence，是 validation 集成层稳定风险。 |
  | 可执行性 | 2 | 可通过 `runValidateCommand()` production regression、story-key direct child filter、project-relative details 和 no-noise assertions 检查。 |
  | 文档缺口 | 1 | `SPEC 07`/`SPEC 09` 声明 mismatch details 与 story location contract，但既有规则未沉淀“actual evidence 必须由具体 consumer 过滤后再进入 mismatch”的实现检查点。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: project-level artifact validation、legacy actual consumed path discovery、`artifact-path.config-artifact-mismatch` diagnostics、Story consumer handoff，以及任何把 rule helper 支持提升到 production command aggregation 的流程。
- **规避指南**:
  - 不得只用 pure helper 手动传入 `actualArtifactPath` 来证明 production validate 已能发现 actual consumed path。
  - 不得把通用 directory recursion 的全部文件都当作某个 workflow consumer 的 actual artifacts，尤其不得把 README、notes、metadata sidecar、hidden/temp 或 recursive child 提升为 Story `actualConsumedPath`。
- **最佳实践**:
  - Production validation 应从具体 consumer contract 提供或发现 actual path evidence；对 legacy `story_location` directory，只接受同一 `development_status` 中合法 Story key 的 direct child `{story_key}.md`。
  - `artifact-path.config-artifact-mismatch` details 必须保持 project-relative POSIX，包含 `field`、`configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode` 和 stable `reason`，并保持 read-only/no-migration。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则适用面偏 validation aggregation 技术域，且 `SPEC 07` / `SPEC 09` 已拥有 public issue shape 与 Story artifact owner contract；本次只沉淀为实现检查点。
- **本次落地**:
  - Round 1/2 fixer 已修复，Round 3 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-API-38` 与 Story 11-3 记录。
- **同步状态**: 已写入规则总结

#### CR-SEC-18：Installer-owned namespace 必须优先于 overlapping artifact roots

- **来源问题**: Story 11.3 Round 1 发现 artifact roots 可以配置为 `_speclite`、`.claude` 或 `.agents` 等 installer/control namespace；由于 `classifyOwnership()` 先匹配 configured artifact root，再匹配 installer-owned path，`_speclite/_config/manifest.yaml`、`.claude/skills/*` 等 installer-managed files 会被误判为 `workflow-owned`，从而在 update/repair planning 中被 `workflow-owned skip` 吞掉。
- **CR 证据**:
  - `11-3-code-review-summary-20260903-round-1.md`: Finding #3 指出 `implementation_artifacts="_speclite"` 被 resolver 接受，`_speclite/_config/manifest.yaml` 被 classifier 归为 `workflow-owned`。
  - `11-3-code-review-evaluation-20260903-round-1.md`: evaluator 确认该 finding 为 P1，但只授权 ownership precedence patch；resolver-level protected namespace rejection 需 owner decision / future requirement。
  - `11-3-code-review-evaluation-20260903-round-1.md`: fresh fixer recovery record 确认 classifier 顺序改为 human-owned custom path、installer-owned namespace、configured artifact roots，并补充 update/repair overlap regression。
  - `11-3-code-review-evaluation-20260903-round-3.md`: evaluator 确认 Round 1 Finding #3 Closed；同时独立复现确认 `implementation_artifacts="_speclite"` 仍可解析为 `explicit-config` 且 `issues=[]`，说明 protected namespace rejection 没有被误写入当前 contract。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 本 Story reviewer/evaluator/fixer/复审复评闭环确认；与既有 ownership classifier 优先级、files-index mislabel 和 configured root 边界问题有同类复现迹象。 |
  | 影响范围 | 2 | 影响 ownership classifier、update planning、repair planning、files-index consumption、installer-owned runtime/config/skill namespaces 与 no-migration 边界。 |
  | 风险等级 | 2 | installer-managed files 被误判为 workflow-owned skip，会绕过 update/repair 对 manifest、files-index、skill package 或 hook config 的 managed repair。 |
  | 根因稳定性 | 2 | 多类 ownership boundary 按路径前缀交叠时，先匹配宽泛 workflow root 再匹配 managed namespace 是稳定易复现的 ordering bug。 |
  | 可执行性 | 2 | 可用 `_speclite`、`.claude`、`.agents` overlap classifier tests，以及 update/repair 不输出 `workflow-owned skip` 的 regression 检查。 |
  | 文档缺口 | 1 | 既有 CR-SEC-09 覆盖 classifier 优先于 files-index，本规则补充 classifier 内部 installer namespace 与 configured artifact root overlap 的 precedence 检查点。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: ownership classification、update/repair planning、installer-owned namespace detection、configured artifact roots overlap，以及 no-migration / protected workflow artifact preservation 相关流程。
- **规避指南**:
  - 不得让宽泛 configured artifact root 覆盖已知 installer-owned namespace；no-migration 保护不得扩大成 managed installer updates bypass。
  - 不得把 resolver-level protected namespace rejection 当作本规则已实现或当前强制要求；它仍需要 owner contract 与 stable diagnostic。
- **最佳实践**:
  - Ownership classifier 应保持 human-owned custom path 优先，其后 installer-owned managed namespaces，再匹配 configured/default workflow artifact roots。
  - Update/repair regression 应覆盖 overlapping artifact root 下 `_speclite/_config/*`、`.claude/skills/*`、`.agents/skills/*` 等仍可按 installer-owned drift/conflict/regenerate 处理，而不是 `workflow-owned skip`。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则与既有 ownership/path-safety 规则相近，且 resolver-level rejection 尚未 owner-confirm；本次只记录已实现的 precedence contract。
- **本次落地**:
  - Round 1 fixer 已修复，Round 3 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-SEC-18` 与 Story 11-3 记录。
- **同步状态**: 已写入规则总结

#### CR-API-39：Workflow artifact metadata schema 必须兼容 unknown future keys 且保持 required keys strict

- **来源问题**: Story 11.3 Round 1 发现 `WorkflowArtifactMetadataSchema` 使用 `.strict()`，会把带有 future extension keys 的 workflow artifact metadata 解析为 `unrecognized_keys`，再被 validator 转成 `artifact-path.invalid-required-metadata`。这违反 existing install 对 unknown future metadata 的兼容读取要求；同时修复又不能放松 `workflowType`、`sourceSkill`、`generatedAt` 三个 required keys 及 canonical `sourceSkill` mismatch。
- **CR 证据**:
  - `11-3-code-review-summary-20260903-round-1.md`: Finding #4 指出 metadata 带 `futureKey` 时 strict schema 拒绝，测试未覆盖 unknown future metadata 正向兼容。
  - `11-3-code-review-evaluation-20260903-round-1.md`: evaluator 确认该 finding 为 P1，要求只允许 unknown future keys，required keys/value/sourceSkill 仍必须严格。
  - `11-3-code-review-evaluation-20260903-round-1.md`: fresh fixer recovery record 确认 schema 改为 `.passthrough()`，并新增 frontmatter、sidecar、directory metadata 三种 unknown future key positive tests。
  - `11-3-code-review-evaluation-20260903-round-3.md`: evaluator 确认 Round 1 Finding #4 Closed；missing required metadata、invalid values 与 wrong canonical `sourceSkill` negative tests 仍通过。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 本 Story reviewer/evaluator/fixer/复审复评闭环确认；暂无跨 Story 同字段复现。 |
  | 影响范围 | 1 | 影响 workflow artifact metadata schema、artifact path validation、frontmatter/sidecar/directory metadata 读取和 existing compatibility。 |
  | 风险等级 | 1 | 过严会把兼容 future metadata 判 invalid；过松则可能放过 required metadata 缺失或 canonical `sourceSkill` mismatch。 |
  | 根因稳定性 | 2 | schema evolution 中 `.strict()` 与 required-field validation 混用是稳定风险，后续 metadata 扩展仍可能复现。 |
  | 可执行性 | 2 | 可用 passthrough schema、required key negative tests、wrong sourceSkill negative tests 和三类 metadata location positive tests 检查。 |
  | 文档缺口 | 1 | 既有 rules 已覆盖 metadata production consumption，但未细化 unknown future metadata 与 required metadata strictness 的双边兼容规则。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: workflow artifact metadata schema、artifact path validation、frontmatter/sidecar/directory metadata reader，以及 any backward/forward-compatible metadata extension point。
- **规避指南**:
  - 不得用 `.strict()` 或等价 unknown-key rejection 阻断 future additive metadata；也不得为了兼容 unknown keys 而放松 required keys、value domain 或 canonical source identity。
- **最佳实践**:
  - 对 metadata extension point 使用 passthrough/loose outer object；对 `workflowType`、`sourceSkill`、`generatedAt` 等 required fields 保持 explicit required/value validation。
  - Tests 应同时覆盖 frontmatter、sidecar、directory metadata unknown future key positive cases，以及 missing required、invalid required value、wrong canonical `sourceSkill` negative cases。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则偏 metadata schema evolution 实现域，且 Story 11.3 Testing Requirements 已直接覆盖 unknown future metadata；本次仅 record-only。
- **本次落地**:
  - Round 1 fixer 已修复，Round 3 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-API-39` 与 Story 11-3 记录。
- **同步状态**: 已写入规则总结

#### 未沉淀 / 交接项

- **Resolver-level protected namespace rejection**: 不写入当前规则总结正文，也不写成已实现 contract。理由：Round 1/2/3 evaluator 均将 config resolver 层拒绝 `_speclite`、`.claude`、`.agents` artifact root 判为 `decision_needed / future` 或 P2 Owner future；当前只实现 ownership precedence，尚无 owner contract 与 stable diagnostic。
- **Single-file `story_location` 或 metadata-only legacy Story 支持**: 不写入当前规则总结正文，也不写成 existing compatibility 已支持。理由：Round 2/3 evaluator 明确 `SPEC 09` 当前定义 `story_location` 为 Story 文件所在目录，合法 artifact 为 `{story_root}/{story_key}.md`；扩展 single-file 或 metadata-only `legacy.md` 需要先 owner decision。

#### 05 TODO Tracker 交接

- **交接候选**:
  - Resolver-level protected namespace rejection：是否在 config resolver 层拒绝 `_speclite`、`.claude`、`.agents` 等 installer/control namespace 作为 artifact root。
  - Single-file `story_location` 或 metadata-only legacy Story 支持：是否扩展 `SPEC 09` / consumer discovery contract。
- **CR04 边界**: 本次不写 `cr-todo-backlog.md`，不执行 CR05，只将候选项交给后续 CR05 做去重、归属和是否登记判断。

### Story 11-4 / 2026-09-04

- **Story**: 11-4
- **分析来源**:
  - `11-4-code-review-summary-20260904-round-4.md`
  - `11-4-code-review-evaluation-20260904-round-4.md`
  - `11-4-code-review-summary-20260904-round-5.md`
  - `11-4-code-review-evaluation-20260904-round-5.md`
  - `11-4-code-review-summary-20260904-round-6.md`
  - `11-4-code-review-evaluation-20260904-round-6.md`
  - `11-4-code-review-summary-20260904-round-7.md`
  - `11-4-code-review-evaluation-20260904-round-7.md`
- **排除来源**:
  - `11-4-code-review-summary-20260904-round-3.md`
  - `11-4-code-review-evaluation-20260904-round-3.md`
- **结论概览**:
  - Round 4 evaluator 明确 Round 3 summary/evaluation 为 concurrent invalid provenance，本次 CR04 不采信 Round 3 的 finding、授权、canonical governance 判断或 closeout 结论。
  - Round 4 evaluation 接受 3 个 P1：fresh `resolve artifact-roots --lifecycle fresh` 在缺少 base config 时应走 pure resolver；public resolver docs 不得遗留 two-command closed list；analysis route helper 必须约束 portable basename、project-local boundary、regular non-symlink candidate 与 Owner B no-migration precedence。Round 4 fix record 已修复，Round 7 evaluator 确认关闭。
  - Round 5 evaluation 接受 2 个 P1：PB/PRFAQ installed Markdown workflow 未同步 TS route helper safety contract；trimmed project identity 与 basename generation 不一致。Round 5 fix record 已修复，Round 7 evaluator 确认关闭。
  - Round 6 evaluation 接受 2 个 P1：regular non-symlink candidate 未做 readability probe；PB/PRFAQ Load Config 未显式从 raw merged `core.project_name` 绑定 `{project_name}`。Round 6 fix record 已修复，Round 7 evaluator 确认关闭。
  - Round 7 reviewer/evaluator 均为 PASS；新增 findings 0，阻塞修复 0。Round 2 Finding #3 继续为 P2 / CR TODO / evidence hygiene defer，不阻塞 Story 11.4 `EVALUATION_PASS`，本次 CR04 不登记 TODO backlog。
  - 本次 04 按外层编排授权采用默认推荐决策：record-only。仅更新本规则总结，不修改 project-context、Architecture、AGENTS、CLAUDE、Story、SPEC、Flow Gate、源码、测试、tracker、Reviewer、Evaluator、TODO backlog、PLAN、EXPERIMENTS、EXPERIMENT_NOTES、commit 或 push。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Public resolver surfaces 必须区分 raw config 与 effective artifact-root resolution | 通过 | 10/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-API-40 |
| Analysis artifact route selection 必须验证 portable basename 与 project-local readable regular candidate | 通过 | 11/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-SEC-19 |
| Installed Markdown workflow 必须与 executable route helper 保持同等 safety/config binding | 通过 | 9/12 | rules-summary | 用户本次授权默认推荐决策：record-only，新增 CR-DOC-05 |
| Public resolver docs closed-list drift | 未通过：偏一次性同步且已有 public docs/CLI contract gate | 6/12 | none | 已作为 Round 4 fix evidence 使用，不新增开发规则 |
| broad legacy-pattern `575` 精确计数缺少可复现命令 | 未通过：状态未闭合 | 5/12 | todo-tracker | 维持 Round 2 Finding #3 P2 defer；CR04 不写 `cr-todo-backlog.md`，交 CR05 去重/登记判断 |

### 提炼规则

#### CR-API-40：Public resolver surfaces 必须区分 raw config 与 effective artifact-root resolution

- **来源问题**: Story 11.4 Round 4 发现 public `resolve artifact-roots --lifecycle fresh` 在 fresh project 尚无 `_speclite/config.toml` 时，先走 required raw config reader 而失败，无法返回 Story 11.1 已定义的七个 `fresh-default` effective roots；同时修复必须保持 `resolve config` 仍是 raw merged config surface，不能用 artifact-root synthetic fallback 污染 raw config 语义。Round 6 又发现 PB/PRFAQ route selection 使用 `{project_name}`，但 Load Config 未显式绑定 raw merged `core.project_name`，进一步证明 raw config value 与 effective artifact-root resolver result 需要分层消费。
- **CR 证据**:
  - `11-4-code-review-evaluation-20260904-round-4.md`: Finding #1 被确认为 P1，要求仅在 `lifecycle=fresh` 且 required base config 确实 `ENOENT` 时以 empty config 调用 pure artifact-root resolver，返回七个 `fresh-default` roots 与空 `configSources`；不得吞掉 malformed/unreadable/non-file config，也不得改变 `resolve config` required-layer/raw semantics。
  - `11-4-code-review-evaluation-20260904-round-4.md`: 修复执行记录确认 fresh absent public CLI、fresh valid config、existing absent 与 raw config absent matrix 均按分层语义修复。
  - `11-4-code-review-evaluation-20260904-round-6.md`: Finding #2 被确认为 P1，要求 PB/PRFAQ installed workflow 从 `speclite resolve config --project-root {project-root}` 的 raw merged config field `core.project_name` 绑定 `{project_name}`，不得把 `config.toml.example` 当 runtime fallback，也不得改变 `resolve artifact-roots` surface。
  - `11-4-code-review-evaluation-20260904-round-7.md`: evaluator 确认 fresh `resolve artifact-roots`、raw `resolve config` 与 PB/PRFAQ raw `core.project_name` binding 均已关闭，且 Round 3 invalid provenance 不作为输入。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 的 Round 4 与 Round 6 从 public CLI 与 installed workflow 两个 surface 暴露同一 raw/effective 分层风险，并由 Round 7 复审复评关闭。 |
  | 影响范围 | 2 | 影响 `resolve config`、`resolve artifact-roots`、installed workflow Load Config、fresh install bootstrap、artifact-root provenance 和 downstream route selection。 |
  | 风险等级 | 2 | raw config 与 effective roots 混用会在 fresh project 误失败，或让 workflow 用 synthetic fallback 代替真实 config value，破坏 runtime support contract。 |
  | 根因稳定性 | 2 | resolver surface 增加后，consumer 容易只复用 required raw config reader 或反向用 effective resolver 填 raw fields，是稳定集成陷阱。 |
  | 可执行性 | 2 | 可用 fresh absent/fresh valid/existing absent/raw config absent CLI matrix、raw `core.project_name` workflow scan 和 focused tests 直接检查。 |
  | 文档缺口 | 1 | `SPEC 01`、`SPEC 09` 与 CLI docs 已定义两类 surface，但既有 CR 规则未沉淀 public resolver consumer 的 raw-vs-effective 分层检查点。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: public resolver commands、installed Skill workflow Load Config、artifact-root route selection、fresh install bootstrap、以及任何同时消费 raw merged config 和 effective artifact-root resolver result 的流程。
- **规避指南**:
  - 不得用 required raw config reader 阻断 fresh lifecycle 下 base config `ENOENT` 的 effective artifact-root resolution。
  - 不得把 `resolve artifact-roots` 的 synthetic defaults、legacy-compatible roots 或 fallback provenance 当作 `resolve config` 的 raw merged config value。
  - 不得让 installed workflow 隐式猜测 `{project_name}`；必须显式绑定到 raw merged `core.project_name`，并在 route selection 前处理 missing、非 string 或 trim-empty。
- **最佳实践**:
  - Public resolver tests 应覆盖 `fresh + base config ENOENT`、fresh valid config、malformed/non-file/unreadable fail-closed、existing absent fail-closed、以及 raw `resolve config` 不变。
  - Installed workflow 应先调用 `resolve config` 绑定 non-root runtime fields，再调用 `resolve artifact-roots` 绑定 effective artifact roots；两类 evidence 的变量名、HALT 条件和 tests 应分开断言。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则总分 10/12，但用户本轮明确限定 CR04 record-only 范围；同时 active CLI docs 与 SPEC 已有 owning contract，本条沉淀为后续 CR 检查规则。
- **本次落地**:
  - Round 4 与 Round 6 fixer 已修复，Round 7 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-API-40` 和 Story 11-4 记录。
- **同步状态**: 已写入规则总结

#### CR-SEC-19：Analysis artifact route selection 必须验证 portable basename 与 project-local readable regular candidate

- **来源问题**: Story 11.4 Round 4 发现 `resolveAnalysisDocumentRoute()` 直接把 `projectName` 拼入 basename，未约束 single filename segment、project boundary、candidate type 或 symlink escape；Round 5 发现校验使用 trimmed 值但 basename 仍用原始值；Round 6 发现 regular non-symlink candidate 未做 readability probe。若这些检查缺失，Product Brief / PRFAQ route selection 可能逃离 analysis root、选择 directory/non-file/symlink/unreadable file，或因首尾空格产生不同 artifact basename，破坏 resume/write 前的 fail-closed 与 no-migration policy。
- **CR 证据**:
  - `11-4-code-review-evaluation-20260904-round-4.md`: Finding #3 被确认为 P1，要求 `projectName` 仅作为 portable single filename segment；new/legacy candidate 必须 project-local，project root 外 symlink fail closed，existing candidate 只有 project-local regular non-symlink file 才算存在，只有 `ENOENT` 表示 missing，并保持 new-first、legacy-compatible-only、related artifacts co-location 与 no migration/copy/delete/rename/rewrite。
  - `11-4-code-review-evaluation-20260904-round-5.md`: Finding #2 被确认为 P1，要求 helper 返回 trimmed project name，并用 trimmed value 生成 Product Brief / PRFAQ main 与 distillate basename；内部空格与 Unicode 保留，不做 slugify 或额外字符集收窄。
  - `11-4-code-review-evaluation-20260904-round-6.md`: Finding #1 被确认为 P1，要求 regular non-symlink existing candidate 还必须通过 `fs.open(..., "r")` readability probe；`EACCES`、`EPERM`、ACL/sandbox 或任何 non-`ENOENT` open failure 均 HALT。
  - `11-4-code-review-evaluation-20260904-round-7.md`: evaluator 确认 basename、directory/non-file、symlink boundary、trimmed basename mismatch、readability probe、new-first 不读取 legacy、`ENOENT` missing 与 no-migration 语义均已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | 同一 Story 多轮反复暴露 basename、candidate type/symlink、trim identity 与 readability 子问题，均由 Round 7 确认关闭。 |
  | 影响范围 | 2 | 影响 Product Brief、PRFAQ、analysis artifact routing helper、installed workflow resume/write path、distillate co-location 与 legacy compatibility。 |
  | 风险等级 | 2 | 错误 route 可逃离 root、选择不可安全读取的 existing artifact、或制造重复 artifact，直接影响文件写入/恢复边界。 |
  | 根因稳定性 | 2 | 文件路径 helper 容易把 display name 当 path segment，把 existence 当 readability，把 directory/symlink 当普通 artifact，是稳定复现风险。 |
  | 可执行性 | 2 | 可用 unsafe name、trimmed basename、internal space/Unicode、directory、symlink escape、unreadable mock、new-first 和 neither-missing tests 直接检查。 |
  | 文档缺口 | 1 | 既有 path/file integrity 规则覆盖 no-follow 与 ENOENT 分类，本规则补充 analysis artifact route selection 的 basename/readability/no-migration composite check。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: analysis document routing、workflow artifact resume/write target selection、Product Brief/PRFAQ/main+distillate co-location、legacy-compatible root-level discovery，以及任何从 display project name 生成 artifact basename 的流程。
- **规避指南**:
  - 不得把 raw display name 直接拼接成 path segment；必须先 trim，拒绝空白、`.`、`..`、separator、NUL、absolute 或 drive-like shape，并保留合法内部空格/Unicode。
  - 不得把 path existence 当作 valid existing artifact；directory、non-file、candidate symlink、project-boundary symlink escape、unreadable file 或 non-`ENOENT` error 都必须 HALT。
  - 不得在 legacy-compatible discovery 中 migration、copy、delete、rename 或 rewrite 旧 artifact；new existing 优先，legacy 只在 new missing 且 legacy safe regular readable file 时使用。
- **最佳实践**:
  - Route helper 应返回 trimmed basename identity，并对 new/legacy candidate 统一执行 project-local boundary、no-follow type、readability probe 和 `ENOENT`-only missing 分类。
  - Related artifacts 应始终跟随 selected main directory；focused regressions 应覆盖 Product Brief 与 PRFAQ 两类 artifact、new-first 不探测 legacy、both missing 选择 new subject、legacy-compatible-only 与 no-migration tokens。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则虽然分数高，但适用范围集中于 analysis artifact route selection 技术域；已有 global path-safety / file-integrity rules 可承接通用原则，本次只沉淀 Story 11.4 的 composite implementation checklist。
- **本次落地**:
  - Round 4/5/6 fixer 已修复，Round 7 reviewer/evaluator 确认关闭；本次 04 仅新增 `CR-SEC-19` 和 Story 11-4 记录。
- **同步状态**: 已写入规则总结

#### CR-DOC-05：Installed Markdown workflow 与 executable implementation 必须形成可定位、同源的双向 binding

- **来源问题**: Story 11.4 Round 5 发现 TS helper 已包含 route safety，但 Product Brief / PRFAQ installed Markdown workflow 才是真实 Agent 执行面，仍只有 literal exists 选择逻辑，未声明 portable filename、project-local regular non-symlink、symlink escape、unreadable/non-`ENOENT` HALT 等边界。Round 6 又发现两份 workflow 使用 `{project_name}` 构造 artifact basename，却未在 Load Config 中明确绑定 raw merged `core.project_name`。Story 11.6 Round 4 从反方向复现同一双轨根因：active Create UX Markdown 已强制调用 bounded filesystem operation，但实现只存在于未发布的 repository `src/`/test import graph，fresh installed Skill 无可定位、可执行的 binding。Story 11.8 Round 1 再次发现 Grill workflow/record spec绕开resolver硬编码default与第三fallback，而current docs又发布Planning root、幽灵目录和非exact basename；三类缺口都会让helper/resolver truth、真实installed workflow与用户可见route guidance脱节。
- **CR 证据**:
  - `11-4-code-review-evaluation-20260904-round-5.md`: Finding #1 被确认为 P1，说明 `resolveAnalysisDocumentRoute()` 仅由 tests 调用，Product Brief / PRFAQ installed workflow 没有消费 TS helper；要求两份 workflow-details 同步 TS helper 等价规则，并补 installed workflow contract assertions。
  - `11-4-code-review-evaluation-20260904-round-5.md`: 修复执行记录确认两份 workflow 已补充 trim、portable single filename segment、project-local、regular non-symlink、unreadable/non-`ENOENT` HALT、`ENOENT` missing、new-first、legacy-compatible-only、related artifacts co-location 与 no migration/copy/delete/rename/rewrite。
  - `11-4-code-review-evaluation-20260904-round-6.md`: Finding #2 被确认为 P1，要求两份 workflow Load Config 显式从 raw merged config field `core.project_name` 绑定 `{project_name}`，字段缺失、非 string 或 trim-empty 时 HALT before route selection。
  - `11-4-code-review-evaluation-20260904-round-7.md`: evaluator 确认 PB/PRFAQ installed workflow route safety contract 与 `core.project_name` binding 均已关闭，并由 `test/analysis-artifact-routing.test.ts` contract scan 覆盖。
  - `11-6-code-review-evaluation-20260904-round-4.md`: evaluator 确认 required filesystem operation 仅存在于未发布 `src/` 与 repository tests，installed Create UX package缺少 private script、exact invocation、result/HALT contract 与真实消费证据，构成 P1。
  - `11-6-code-review-evaluation-20260904-round-4.md`: 修复执行记录将 operation 收口到 canonical Skill-local private Node script，repository harness 直接 import 同一 export，installer 投影到 `.agents` / `.claude` 并记录 bytes/hash/mode/`sourceRef`/`executable`。
  - `11-6-code-review-evaluation-20260904-round-5.md`: evaluator 通过两份 installed copy 的实际 create/mkdir/negative invocation、fixed argv、single JSON 与 no hidden hook 确认双向 binding 和 single source 已关闭。
  - `11-8-code-review-evaluation-20260905-round-1.md`: Finding #2 确认 Grill producer、record spec与D1 current docs未共同消费resolver-provided Solutioning fixed child，且存在合同外`.specskills/output` fallback；Fix Summary统一resolver invocation、HALT/zero-write与exact public route/basename。
  - `11-8-code-review-evaluation-20260905-round-4.md`: evaluator确认两个readiness producer、record spec与current docs保持同一resolver-backed route，Grill既有record basenames未被误改。
  - `11-9-code-review-evaluation-20260907-round-19.md`: Finding #6 确认 CR04/CR05 durable output plane 已进入 executable contract，但 active public docs/help metadata 未同步，真实 Agent 与用户无法定位收口产物；Fix Summary 对齐 docs/help 双输出，Round 24 双 PASS 确认保持关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 11.4、11.6、11.8 与 11.9 分别从 helper→Markdown、Markdown→installed executable、resolver→producer/docs、durable output→docs/help 四个方向复现同源 binding 缺口。 |
  | 影响范围 | 2 | 影响 Product Brief、PRFAQ、installed Skill Markdown、workflow-details contract scan、Agent execution path 与 executable helper evidence 的可信度。 |
  | 风险等级 | 2 | 任一方向缺失都会让真实 installed Agent 绕开已验证安全语义或根本无法执行 required operation，导致越界风险、late failure 或虚假 completion evidence。 |
  | 根因稳定性 | 2 | 对 Agent-installed workflow 而言，TS helper/test 与 Markdown instructions 分离维护，后续 workflow route 或 config field 演进时高概率复现。 |
  | 可执行性 | 2 | 可用 canonical Markdown contract scan、package inventory/index/hash/mode检查及真实 `.agents` / `.claude` installed invocation同时验证两端。 |
  | 文档缺口 | 1 | 既有规则强调 executable gate，但未具体要求 Markdown workflow 与 evidence helper 的 route safety/config binding parity。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: installed Skill Markdown workflow、workflow-details routing/operation instructions、Skill-local private executable、repository helper/harness、installer package projection、contract scan 与 installed invocation tests。
- **规避指南**:
  - 不得只修 TS helper 或 tests，就把 installed Markdown workflow 视为已获得同等 runtime safety。
  - 不得让 active Markdown 强制执行某个 operation，却只在未发布 repository source/test graph 中保留实现；required operation 必须在 installed Skill 中有 exact、可定位、可执行且非 public 扩面的 binding。
  - 不得维护 repository helper 与 installed script 两份实际 operation 实现；测试与 installed invocation 必须消费同一 canonical source/export。
  - 不得在 Markdown route selection 中使用未在 Load Config 显式绑定的变量；尤其涉及 basename 的 `{project_name}` 必须绑定到 raw merged `core.project_name`。
  - 不得在workflow或record spec中绕开shared resolver硬编码default root、增加第三fallback，或让current docs发布不同root/basename。
  - 不得把 `.agents` / `.claude` mirror 是否存在、external drawer 或 full count caveat 写成 workflow parity 的前置规则；本规则只约束 canonical installed Markdown workflow 与 executable evidence helper。
- **最佳实践**:
  - 每次新增或调整 workflow route helper 时，同步检查真实 installed workflow Markdown 是否包含同等 input binding、HALT 条件、candidate safety、precedence、related artifact co-location 与 no-migration wording。
  - Route由shared resolver拥有时，producer、record spec与current docs必须消费同一resolved root/fixed child，并对resolver block/error统一HALT；focused contract test应同时覆盖custom、legacy-compatible、failure与exact public basename。
  - Contract tests 应扫描 canonical workflow-details 中的 executable tokens，并由真实 installer 证明 private executable进入两类 target、bytes/hash/mode/sourceRef一致，再从 installed copy执行成功、失败与安全负例；不能用repo-local import或manifest文字替代installed consumption。
  - Private CLI只暴露Story授权的fixed argv/result contract；test-only interposition不得通过argv、stdin、env或active workflow输入进入installed surface。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则偏 installed workflow 文档/测试协同域，且本轮只授权 CR04 record-only；本次不修改 Architecture、project-context、AGENTS 或 public docs。
- **本次落地**:
  - Story 11.4 Round 5/6 fixer 已修复Markdown→helper parity，Round 7确认关闭。Story 11.6 Round 4 fixer已补Skill-local private binding、single source与installed invocation，Round 5 reviewer/evaluator确认关闭。Story 11.8 Round 1 fixer已统一readiness producer/spec/docs的resolver route，Round 4 reviewer/evaluator确认关闭。Story 11.9 Round 19 fixer同步 CR04/CR05 durable output 的 active docs/help 双输出，Round 24确认保持关闭；本次继续更新既有`CR-DOC-05`而不新增重复规则。
- **同步状态**: 已写入规则总结

#### 未沉淀 / 交接项

- **Public resolver docs closed-list drift**: 不新增开发规则。理由：Round 4 Finding #2 已作为 P1 修复证据关闭，但它主要是四处 active public docs 与现有 CLI/SPEC contract 的一次性同步遗漏；相关通用风险已由 `CR-API-40` 的 raw/effective resolver 分层和既有 public docs governance 覆盖。
- **Round 2 Finding #3 / broad legacy-pattern `575` 精确计数缺少可复现命令**: 不写入当前规则总结正文，也不在 CR04 登记 backlog。理由：Round 7 evaluator 明确维持 P2 / CR TODO / evidence hygiene defer；该项状态未闭合，且应交 CR05 做去重、归属和是否登记判断。
- **external drawer、`.agents/.claude` mirror、build/packaging/full-suite fixed-count caveat**: 不写入开发规则。理由：Round 7 evaluator 明确这些 caveat 与 Story 11.4 bounded closeout scope 隔离，不构成本轮阻塞项或规则沉淀来源。
- **Round 3 summary/evaluation**: 禁止采信。理由：Round 4 provenance recovery 与 Round 7 evaluator 均确认其为 concurrent invalid provenance，不得作为 finding set、授权、canonical governance 判断或 closeout 输入。

#### 05 TODO Tracker 交接

- **交接候选**:
  - Round 2 Finding #3：broad legacy-pattern `575` 精确计数缺少可复现命令，维持 P2 / CR TODO / evidence hygiene defer。
- **CR04 边界**: 本次不写 `cr-todo-backlog.md`，不执行 CR05，只将候选项交给后续 CR05 做去重、归属和是否登记判断。

### Story 11-5 / 2026-09-04

- **Story**: 11-5
- **分析来源**:
  - `11-5-code-review-summary-20260904-round-1.md`
  - `11-5-code-review-evaluation-20260904-round-1.md`
  - `11-5-code-review-summary-20260904-round-2.md`
  - `11-5-code-review-evaluation-20260904-round-2.md`
  - `11-5-code-review-summary-20260904-round-3.md`
  - `11-5-code-review-evaluation-20260904-round-3.md`
  - `11-5-code-review-summary-20260904-round-4.md`
  - `11-5-code-review-evaluation-20260904-round-4.md`
  - `11-5-code-review-summary-20260904-round-5.md`
  - `11-5-code-review-evaluation-20260904-round-5.md`
  - `11-5-code-review-summary-20260904-round-6.md`
  - `11-5-code-review-evaluation-20260904-round-6.md`
  - `11-5-code-review-summary-20260904-round-7.md`
  - `11-5-code-review-evaluation-20260904-round-7.md`
  - `11-5-code-review-summary-20260904-round-8.md`
  - `11-5-code-review-evaluation-20260904-round-8.md`
- **模型时间线**:
  - Round 1-8 Reviewer、Evaluator 与各轮 Fixer 均记录为 `GPT-5.5 (gpt-5.5)`；Round 8 Reviewer 三层为 `3/3 PASS`，Round 8 Evaluator 为 `PASS`。
- **结论概览**:
  - Round 1-4 反复暴露 whole/index/subject symlink containment、finite mismatch probe、bounded Markdown grammar、声明顺序、自引用、destination pipeline 与 `selection=whole` validation precedence 缺口；Owner M/L/S 的裁决及对应 fixer 已逐轮关闭这些 P1。
  - Round 5-7 继续发现 canonical entry、mismatch candidate、candidate scan 与 declared shard 的 filesystem truth 不完整：non-file/unreadable entry 被当 absent、无关 subtree 被扫描、scan failure 抛 raw error、dereferenced symlink target 未验证 regular file。Owner I 与各轮 fixer 已将阻塞项收敛为 structured fail-closed，并由 Round 8 double-PASS 确认关闭。
  - Round 8 为 latest Reviewer/Evaluator double-PASS，当前 `0 P0 / 0 P1`；focused/related `123/123`、docs、canonical warn/strict 与 diff checks 均通过。External drawer、mirror 与 fixed-count drift不属于 Story 11.5 规则来源。
  - Round 7 Finding #2 仍是有效 P2：missing-index candidate scan忽略 lexical `.md` symlink。该项未解决且 owning candidate semantics未完整定义，本次禁止写成已解决规则，交 CR05 正式登记。
  - 外层严格编排已授权本次 CR04 采用 record-only；仅更新本规则总结，不修改全局文档、源码、测试、SPEC、Story、tracker、gate、review/evaluation、TODO backlog、progress logs、mirror或external drawer。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Whole/sharded selection 必须分离 canonical entry safety 与 selected graph validation | 通过 | 11/12 | rules-summary | 外层严格编排授权 record-only，新增 CR-API-41 |
| Artifact discovery 必须以 dereferenced regular-file 与 containment 证据决定消费资格 | 通过 | 11/12 | rules-summary | 外层严格编排授权 record-only，新增 CR-SEC-20 |
| Bounded Markdown shard parser 必须 post-decode 分类、fail closed 并保持声明顺序 | 通过 | 10/12 | rules-summary | 外层严格编排授权 record-only，新增 CR-DOC-06 |
| Missing-index lexical `.md` symlink candidate semantics | 未通过：状态未闭合且 owning taxonomy 未完整定义 | 7/12 | todo-tracker | 保持 Round 7 Finding #2 P2 defer；CR04 不写 backlog，交 CR05 登记 |

### 提炼规则

#### CR-API-41：Whole/sharded selection 必须分离 canonical entry safety 与 selected graph validation

- **来源问题**: Story 11.5 Round 4 发现显式 `selection=whole` 仍在 selection branch 前解析未选 `index.md` 的 shard graph，导致 missing/broken 未选 shard 阻断已明确选择的 whole；Round 5 又证明即使跳过 graph，若无条件扫描整个 subject tree，未选且无关 subtree 的访问异常仍可阻断调用。同时，canonical whole/index entry 本身的类型、可读性与 containment 不能因未被选择而跳过，否则 discovery shape 与安全证据失真。
- **CR 证据**:
  - `11-5-code-review-evaluation-20260904-round-4.md`: Finding #6 被确认 P1，要求显式 `selection=whole` 只消费 whole并记录未选 index，不读取或验证未选 shard graph；canonical entry safety仍须保留。
  - `11-5-code-review-evaluation-20260904-round-5.md`: Finding #2 被确认 P1，要求 `indexPresent=true` 时跳过仅服务于 missing-index shape判断的递归 candidate scan，避免无关 subtree影响任何 selection branch。
  - `11-5-code-review-evaluation-20260904-round-6.md`: canonical entry symlink final-target regular-file gate被确认必须发生在 shape/selection之前，证明 entry safety 与 graph validation是两个独立阶段。
  - `11-5-code-review-evaluation-20260904-round-8.md`: Owner S closure确认 whole/index entry先完成 safety检查；whole+index且显式选择whole时跳过未选index内容与graph，只记录`unselectedPath`并继续。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 4-6从graph解析、candidate scan与entry safety三个阶段连续暴露同一precedence问题，并由Round 8确认关闭。 |
  | 影响范围 | 2 | 共享resolver同时服务PRD、Epics、Architecture及其CLI/consumer surfaces。 |
  | 风险等级 | 2 | 错误顺序会让未选内容阻断合法选择，或跳过canonical entry安全门禁后错误继续。 |
  | 根因稳定性 | 2 | 多形态resolver容易把existence、entry safety、shape判定与selected graph validation混成单一流程。 |
  | 可执行性 | 2 | 可用whole+index、三种selection、unsafe entry、broken/malformed/undefined未选graph与无关subtree fixtures直接验证。 |
  | 文档缺口 | 1 | `SPEC 09`已有decision table，但既有CR规则尚未沉淀entry safety与selected graph validation分阶段检查点。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: 支持whole/sharded共存与invocation-scoped selection的document resolver、artifact consumer、CLI discovery surface及任何具有未选分支的多形态输入解析。
- **规避指南**:
  - 不得在显式选择whole后读取、解析或验证未选index的内容与declared shard graph，也不得让只为missing-index判断服务的undeclared candidate scan提前运行。
  - 不得因某形态未被选择而跳过其canonical entry自身的no-follow type、readability、realpath containment与dereferenced regular-file安全检查。
  - 不得把未选graph的内容错误写入`consumedPaths`；block时必须空消费并保持zero mutation。
- **最佳实践**:
  - Resolver按`canonical entry safety -> shape/selection decision -> selected graph validation -> consumption projection`分阶段实现；阶段输出使用显式状态，避免truthy existence代替安全资格。
  - 回归矩阵应覆盖whole-only、sharded-only、whole+sharded无selection、显式whole、显式sharded，以及未选graph为missing/malformed/undefined、canonical entry non-file/symlink escape和无关subtree unreadable。
- **全局文档建议**:
  - 不建议本次升格到全局文档。规则虽为11/12，但适用范围集中于多形态document discovery；owning `SPEC 09`与public guidance已表达契约，本次只沉淀为复用CR检查表。
- **本次落地**:
  - Round 4-7 fixer已修复相关blocking findings，Round 8 reviewer/evaluator double-PASS确认关闭；本次仅新增`CR-API-41`与Story 11-5记录。
- **同步状态**: 已写入规则总结

#### CR-SEC-20：Artifact discovery 必须以 dereferenced regular-file 与 containment 证据决定消费资格

- **来源问题**: Story 11.5 多轮证明`exists`、`access(R_OK)`、lexical `lstat`或安全-looking relative path都不足以证明artifact可消费：canonical entry、subject directory、mismatch probe与declared shard均曾允许symlink逃逸、symlink重绑定container、symlink最终指向directory/FIFO，或把non-file/unreadable entry当missing；missing-index scan的`readdir`失败还曾以raw exception逃逸structured result。Story 11.7 从 downstream historical report discovery 再次复现同类根因：仅验证candidate自身仍不足以证明`realProject -> realPlanning -> exact realPlanning/prd -> candidate`的完整physical owner chain，且same-basename inventory若只记录`Dirent.isFile()`会漏掉symlink、directory与其它non-file entry。
- **CR 证据**:
  - `11-5-code-review-evaluation-20260904-round-1.md`: canonical whole/index symlink escape被确认P1，要求realpath subject containment及structured empty-consumption block。
  - `11-5-code-review-evaluation-20260904-round-2.md`: subject directory symlink rebinding被确认P1；不得把realpath target升格为新的authoritative container。
  - `11-5-code-review-evaluation-20260904-round-5.md`: canonical whole non-file/unreadable与index-present无关scan被确认必须fail closed或跳过。
  - `11-5-code-review-evaluation-20260904-round-6.md`: canonical whole/index与finite mismatch candidate必须验证dereferenced final target为project-local readable regular file；candidate scan failure采用Owner I的structured mapping。
  - `11-5-code-review-evaluation-20260904-round-7.md`: declared shard symlink final target non-regular被确认P1并修复；Round 8 evaluation确认该gate发生在加入消费路径之前。
  - `11-7-code-review-evaluation-20260904-round-1.md`: Finding #4确认Edit PRD、Implementation Readiness与Correct Course在加载historical report前必须统一验证portable path、readable no-follow regular file与physical PRD-owner containment。
  - `11-7-code-review-evaluation-20260904-round-2.md`: Finding #2进一步确认必须先证明`realPlanning`位于`realProject`内，并要求`realPrdOwner`物理路径精确等于`realPlanning/prd`；相对于错误owner root的candidate containment不能算安全。
  - `11-7-code-review-evaluation-20260905-round-3.md`: Finding #3确认全项目same-basename inventory必须在递归前记录所有matching entry的no-follow类型，不能只枚举regular file；Fix Summary完成location+type精确快照。
  - `11-7-code-review-evaluation-20260905-round-8.md`: evaluator确认downstream physical owner chain与same-basename all-entry no-follow inventory均保持关闭，最新Reviewer/Evaluator双PASS。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 11.5 Round 1、2、5、6、7与Story 11.7 Round 1–3跨Story复现于canonical entry、container、probe、declared shard、downstream historical discovery和location inventory。 |
  | 影响范围 | 2 | 跨PRD/Epics/Architecture、canonical/mismatch/declared-shard branches及公共consumer evidence。 |
  | 风险等级 | 2 | 可导致越界读取、消费directory/FIFO、raw error泄露或把不可判定状态伪装成安全continue。 |
  | 根因稳定性 | 2 | filesystem API分别回答lexical type、access、real target与dereferenced type；缺少统一资格序列会稳定漏检。 |
  | 可执行性 | 2 | 可通过lstat/access/realpath/stat顺序、containment、ENOENT-only missing、structured issue与zero-mutation matrix直接检查。 |
  | 文档缺口 | 1 | `CR-SEC-07/08/19`分别覆盖no-follow、realpath或analysis route；本规则补充shared document discovery中dereferenced eligibility与structured failure的组合边界。 |

- **总分**: 11/12
- **建议去向**: rules-summary
- **适用范围**: artifact/document discovery、canonical entry、declared references、bounded mismatch probes、subject containers、historical report readers、same-basename lifecycle inventory及会把filesystem entity加入public consumption evidence的resolver。
- **规避指南**:
  - 不得用lexical existence、`access(R_OK)`或relative evidence替代dereferenced target的regular-file与containment验证。
  - 不得接受subject/container symlink重绑定authoritative boundary；也不得让canonical或declared artifact symlink最终指向directory、FIFO或其它non-regular target后进入消费路径。
  - 不得让bounded enumeration/readability错误以raw exception逃逸；non-`ENOENT`不可判定状态必须映射到owning stable issue/reason，输出安全project-relative evidence、空消费与zero mutation。
- **最佳实践**:
  - 对允许symlink的artifact entry统一执行lexical `lstat`、readability probe、`realpath` containment和dereferenced `stat().isFile()`，且只在全部通过后加入`declaredShardPaths`/`consumedPaths`。
  - 对diagnostic-only candidate复用同一eligibility contract，但只产生mismatch evidence，不fallback消费、不迁移；fixtures覆盖in-bound regular、outbound、broken、directory/FIFO、unreadable、root/nested enumeration failure及重复调用稳定性。
  - 多级owner链必须逐级证明physical containment与exact subject identity；全局location inventory应先记录matching entry的project-relative path与no-follow type，再只递归真实directory且绝不follow symlink。
- **全局文档建议**:
  - 不建议本次升格到全局文档。既有全局/CR安全规则已覆盖通用no-follow与realpath原则；本条作为artifact discovery组合检查清单去重补充，不修改Architecture或project-context。
- **本次落地**:
  - Story 11.5 Round 1-7对应P1均已修复，Round 8 double-PASS确认消费资格与structured failure关闭；Story 11.7 Round 1-3补齐downstream owner chain与all-entry inventory，Round 8再次确认关闭。本次更新`CR-SEC-20`复现证据，不创建等价新规则。
- **同步状态**: 已写入规则总结

#### CR-DOC-06：Bounded Markdown shard parser 必须 post-decode 分类、fail closed 并保持声明顺序

- **来源问题**: Story 11.5 Round 1-4持续发现手写Markdown shard parser的完整性与顺序缺口：reference-style、query/fragment、percent-encoded、nested/shortcut links被静默漏读；external/network、Windows drive、backslash、fenced code、escaped opener、malformed/empty/duplicate definitions被误分类；raw与decoded destination在不同阶段分类导致同一语义被忽略、消费或错误block；alphabetical sort又改写index声明顺序。
- **CR 证据**:
  - `11-5-code-review-evaluation-20260904-round-1.md`: Owner L批准bounded inline/reference-style subset；要求parse、strip query/fragment、single decode、portable/containment/readability顺序，unsupported/malformed local-ish fail closed，并保留first-declaration order。
  - `11-5-code-review-evaluation-20260904-round-2.md`: angle external、fenced code、drive-letter、nested inline与shortcut reference被确认P1，要求在bounded、无dependency范围内准确分类。
  - `11-5-code-review-evaluation-20260904-round-3.md`: reference definition state、post-decode portability、malformed inline与odd/even escaped opener被确认需修复，不能静默少消费或制造伪声明。
  - `11-5-code-review-evaluation-20260904-round-4.md`: 要求destination在single decode后统一分类、first-definition-wins先于duplicate destination validation、empty definition fail closed、backslash拒绝、angle内部空白malformed，并保持不扩展到完整CommonMark或link-title grammar。
  - `11-5-code-review-evaluation-20260904-round-8.md`: Owner L closure确认inline/reference-style、label normalization、post-decode classification、声明顺序、first-occurrence dedupe与self-link exclusion均保持关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Round 1-4连续多轮从grammar、context、escape、definition precedence和pipeline order复现。 |
  | 影响范围 | 2 | 共享parser影响PRD、Epics、Architecture所有sharded consumers及public CLI evidence。 |
  | 风险等级 | 1 | 主要造成文档少消费、伪block或host-dependent path evidence，未形成数据写入损坏。 |
  | 根因稳定性 | 2 | bounded手写parser若没有显式grammar与单一pipeline，新增形态时高概率在不同阶段重复分类或静默遗漏。 |
  | 可执行性 | 2 | 可建立accepted/rejected syntax、context、decode、portable、order/dedupe/self-link固定fixture矩阵。 |
  | 文档缺口 | 1 | `CR-DOC-05`覆盖installed Markdown与helper parity；本规则补充Markdown作为executable shard declaration input时的parser invariant。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: 从Markdown index提取本地artifact references的bounded parser、document resolver、CLI discovery与consumer contract tests；不授权完整CommonMark、HTML、inline code、image或link-title扩展。
- **规避指南**:
  - 不得在single percent-decode前分别用raw字符串决定drive/external/network/local语义；也不得second decode或把decoded backslash/drive path转换后访问。
  - 不得静默忽略supported或明显local-ish但malformed/unsupported的reference；必须使用owning stable issue与`referenceKind` fail closed。External/network与fenced-code literal应确定性ignore。
  - 不得排序改写index声明顺序；first-definition-wins、first-occurrence dedupe与index self-link exclusion必须在访问无效duplicate或投影消费路径之前生效。
- **最佳实践**:
  - 固定`parse bounded syntax -> strip query/fragment -> decode exactly once -> classify external/network/portable local -> containment/readability`pipeline，并让所有inline/reference-style形态复用同一destination classifier。
  - Tests同时覆盖inline/full/collapsed/shortcut、nested labels、case/whitespace normalization、angle、query/fragment、percent encoding、external/network、Windows/backslash、traversal、fence、escaped opener、malformed/undefined/duplicate definition、declaration order/dedupe/self-link。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则针对Markdown shard declaration技术域，owning SPEC与public docs已有明确支持边界；本次record-only沉淀为CR复用规则。
- **本次落地**:
  - Round 1-4 fixer已关闭parser阻塞项，Round 8 reviewer/evaluator确认Owner L未回归；本次仅新增`CR-DOC-06`与Story 11-5记录。
- **同步状态**: 已写入规则总结

#### 未沉淀 / 交接项

- **Missing-index lexical `.md` symlink candidate semantics**: 不写入已解决规则。理由：Round 7 Finding #2与Round 8 double-PASS均确认current `Dirent.isFile()`仍忽略该entry；影响为diagnostic truth/mismatch precedence，当前仍structured block、空消费与zero mutation，且in-bound、outbound、broken、directory/FIFO target的undeclared candidate policy尚无完整owning contract。
- **Round 1-7逐条实现特例**: 不为angle inner whitespace、duplicate definition、self-link、fenced code等分别新增规则；它们已分别收敛到`CR-DOC-06`的统一parser pipeline或`CR-API-41`的selection precedence，避免规则碎片化。
- **External drawer、`.agents/.claude` mirrors与fixed-count drift**: 不作为Story 11.5规则来源，也不修改或回滚；它们与本Story bounded discovery closeout隔离。

#### 05 TODO Tracker 交接

- **交接候选**:
  - Round 7 Finding #2：由Owner明确missing-index undeclared lexical `.md` symlink candidate semantics，至少覆盖subject内readable regular、outbound、broken、directory/FIFO/non-regular target；实现保持index-present no-scan、只判断不消费、structured block、safe project-relative evidence与zero mutation，除非owning contract明确要求否则不新增stable issue ID。
- **CR04 边界**: 本次不写`cr-todo-backlog.md`、不执行CR05；只将P2候选交给下一门禁做去重与正式登记。candidate symlink taxonomy不得写成`CR-SEC-20`已解决内容。

### Story 10-5 / 2026-07-07

- **Story**: 10-5
- **分析来源**:
  - `10-5-code-review-summary-20260707-round-1.md`
  - `10-5-code-review-evaluation-20260707-round-1.md`
  - `10-5-code-review-summary-20260707-round-2.md`
  - `10-5-code-review-evaluation-20260707-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 3 个 P1 `patch` findings：core-only installed state 绕过 selected-module validation、release packaging source assertion 只覆盖示例 ecosystem modules、release package exclusion gate 缺少 cache/temp/build/source-local dist 负向断言。
  - Fixer 已修复 3 项：selected-module validation 覆盖所有 `manifest.installedModules`，packaging assertion 从 canonical source 动态枚举全部 8 个 nested ecosystem modules，release gate 新增 `generated-output-excluded` assertion 并排除 cache/temp/build/source-local dist 输出。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户指定的 record-only 策略，仅新增本规则总结记录；不修改全局文档、Story 文档、`sprint-status.yaml`、源码、测试或 TODO backlog。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Installed-state selected-module validation 不得 core-only 或非 sdlc 短路 | 通过 | 9/12 | rules-summary | 用户本次授权 record-only：新增 CR-API-32 |
| Release packaging source assertion 必须动态覆盖全部 nested ecosystem modules | 通过 | 9/12 | rules-summary | 用户本次授权 record-only：新增 CR-TEST-07 |
| Release package inventory gate 必须排除 cache/temp/build/source-local dist 输出 | 通过 | 9/12 | rules-summary | 用户本次授权 record-only：新增 CR-SEC-17 |

### 提炼规则

#### CR-API-32：Installed-state selected-module validation 不得 core-only 或非 sdlc 短路

- **来源问题**: Story 10.5 Round 1 发现 `validateInstalledStateSelection` 在 `manifest.installedModules` 不包含 `sdlc` 时直接跳过整段 selected-module validation；core-only 是已支持的 selected install shape，因此混入 unselected ecosystem 的 `skill-index`、`files-index`、`phase-coverage` 或 `help-index` 条目时会漏报。
- **CR 证据**:
  - `10-5-code-review-summary-20260707-round-1.md`: Finding #1 指出 core-only installed state 会 bypass selected-module validation，来源为 `blind+edge+auditor`，分类为 `patch`。
  - `10-5-code-review-evaluation-20260707-round-1.md`: evaluator 确认该 finding 为 P1，要求移除非 `sdlc` manifest 的整体验证短路，并补 core-only negative validation。
  - `10-5-code-review-evaluation-20260707-round-1.md`: 修复执行记录确认已移除短路，并新增 core-only installed state 混入 unselected ecosystem package root 的负向 validation。
  - `10-5-code-review-evaluation-20260707-round-2.md`: evaluator 确认 `validateInstalledStateSelection` 已对 `skillIndex`、`sourcePackagePath`、`phaseCoverage`、`filesIndex` 和 `helpIndex` 执行 selected module truth 校验，Round 1 P1 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是，既有 `CR-API-16` 覆盖 selected package root set equality，本条补充合法 selected-module 子集不得绕过 validation 的检查点
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认并由 Round 2 复审验证关闭；暂无跨 Story 复现。 |
  | 影响范围 | 2 | 影响 validate、status、update、repair 等消费 installed-state truth 的 selected module projection 校验。 |
  | 风险等级 | 2 | 合法 core-only 或其他 selected-module 子集若跳过校验，会让未选 ecosystem 条目进入 installed-state indexes 后仍通过 validate。 |
  | 根因稳定性 | 2 | 旧 core+sdlc baseline 假设扩展到 ecosystem modules 后形成稳定流程缺口，后续新增 selected-module 组合时容易复现。 |
  | 可执行性 | 2 | 可通过移除 module-combination early return、对所有 `manifest.installedModules` 做 subset/missing/source/path/help/phase/files 校验，并用 core-only negative regression 检查。 |
  | 文档缺口 | 0 | 现有 runtime/docs 已声明 installed-state validation 以 selected modules 为 truth，本条作为实现检查点沉淀，不重复修改全局文档。 |

- **总分**: 9/12
- **建议去向**: rules-summary
- **适用范围**: installed-state manifest/index validation、selected module projection、validate/status/update/repair 读取目标项目 installed state 的流程。
- **规避指南**:
  - 不得因为 `manifest.installedModules` 未包含某个历史默认模块（例如 `sdlc`）就跳过 selected-module validation。
  - 不得只覆盖默认 `core+sdlc` 或 selected ecosystem happy path，而漏掉 core-only、default-selected、optional ecosystem 等合法 selected-module 子集。
- **最佳实践**:
  - selected-module validation 应从 `manifest.installedModules` 构造 truth set，并对 `skill-index`、`files-index`、`phase-coverage`、`help-index` 等所有 installed projections 执行同一套 subset / unexpected / missing / sourceRef 对齐检查。
  - 任何按 module combination 分支的 validation 都应至少有一个合法子集负例测试，证明 unselected ecosystem 条目会产生 stable `manifest-schema.*` issue。
- **全局文档建议**:
  - 不建议本次升格到全局文档；docs/reference runtime 与 manifest/index contract 已覆盖 selected module truth 的总体原则，本条属于 Story 10.5 暴露出的 implementation checkpoint。本次只写入 `cr-rules-summary.md`。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；本次 04 仅新增 `CR-API-32` 和 Story 10-5 记录。
- **同步状态**: 已写入规则总结

#### CR-TEST-07：Release packaging source assertion 必须动态覆盖全部 nested ecosystem modules

- **来源问题**: Story 10.5 Round 1 发现 release packaging assertion 只证明每个 category 至少有一个 `SKILL.md`，并硬编码检查 `java-springboot`、`react`、`npm-package` 三个示例 `module.yaml`；当前 canonical source 已有 8 个 ecosystem modules，示例化断言无法证明所有 nested ecosystem source files 都进入 npm package。
- **CR 证据**:
  - `10-5-code-review-summary-20260707-round-1.md`: Finding #2 指出 `ecosystem-source-included` 是 example-based，而不是覆盖全部 nested ecosystem modules，来源为 `blind+edge+auditor`，分类为 `patch`。
  - `10-5-code-review-evaluation-20260707-round-1.md`: evaluator 确认该 finding 为 P1，要求从 canonical source 或 package inventory 动态枚举所有 `assets/source/speclite/ecosystems/<category>/<id>/module.yaml` 与对应 `SKILL.md` package roots。
  - `10-5-code-review-evaluation-20260707-round-1.md`: 修复执行记录确认 release gate 已从 canonical source 动态枚举 ecosystem modules，并新增 backend/nodejs 非示例 module 缺失的负向测试。
  - `10-5-code-review-evaluation-20260707-round-2.md`: evaluator 确认当前 canonical source 下 8 个 ecosystem module 和 8 个 `SKILL.md` package root 均被 packaging assertion 覆盖，Round 1 P1 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认并由 Round 2 复审验证关闭；暂无跨 Story 复现。 |
  | 影响范围 | 2 | 影响 canonical source tree、release packaging manifest、npm package inventory 和 ecosystem module release confidence。 |
  | 风险等级 | 2 | 示例化断言会让新增或非示例 ecosystem module 缺包时仍通过 release gate，导致发布包缺失真实 source files。 |
  | 根因稳定性 | 2 | 用少量示例替代 canonical source 动态枚举，是 source tree 扩展后高概率复现的 release gate 漏洞。 |
  | 可执行性 | 2 | 可从 canonical source 动态枚举 `module.yaml` 和递归 `SKILL.md` roots，与 package inventory 做 set coverage，并配套非示例缺失负例测试。 |
  | 文档缺口 | 0 | 现有 canonical source layout 文档已声明 release packaging 必须包含 `assets/source/speclite/ecosystems/**`，本条沉淀为 assertion implementation checkpoint。 |

- **总分**: 9/12
- **建议去向**: rules-summary
- **适用范围**: release packaging check、packaging manifest 生成、npm package dry-run inventory、canonical source ecosystem module 扩展。
- **规避指南**:
  - 不得用固定示例 module 或“每个 category 至少一个文件”替代全部 nested ecosystem modules 的 package inventory 断言。
  - 不得把当前 source tree 中的示例 id 硬编码为 release confidence 的完整证明。
- **最佳实践**:
  - release packaging assertion 应以 canonical source 为 truth，动态枚举每个 ecosystem `module.yaml` 与实际 package root source files，并用 set difference 报告 missing / unexpected。
  - 测试必须至少包含一个同 category 非示例 module 缺失的 negative case，确保新增 ecosystem module 不会被示例化断言漏掉。
- **全局文档建议**:
  - 不建议本次升格到全局文档；全局/参考文档已覆盖 ecosystem source inclusion 的原则，本条属于 release gate 实现检查点。本次只写入 `cr-rules-summary.md`。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；本次 04 仅新增 `CR-TEST-07` 和 Story 10-5 记录。
- **同步状态**: 已写入规则总结

#### CR-SEC-17：Release package inventory gate 必须排除 cache/temp/build/source-local dist 输出

- **来源问题**: Story 10.5 Round 1 发现 release packaging exclusion gate 只排除 `test/fixtures/` 和 `fixtures/`，没有明确阻断 `.cache/`、`cache/`、`tmp/`、`temp/`、source-local `dist/`、`build/` 等 generated outputs；这些输出若误入 package inventory，当前 release gate 缺少失败条件。
- **CR 证据**:
  - `10-5-code-review-summary-20260707-round-1.md`: Finding #3 指出 release packaging exclusion gate 缺少 cache/temp/build output assertions，来源为 `blind+edge+auditor`，分类为 `patch`。
  - `10-5-code-review-evaluation-20260707-round-1.md`: evaluator 确认该 finding 为 P1，要求新增 `generated-output-excluded` 或等价 assertion，并保留 top-level runtime `dist/bin/**` 与 `dist/packaging-manifest.json` allowlist。
  - `10-5-code-review-evaluation-20260707-round-1.md`: 修复执行记录确认已新增 `generated-output-excluded` assertion，排除 `.cache`、`cache`、`tmp`、`temp`、`build` 与 source-local `dist`，并新增 cache/temp/build output 负向测试。
  - `10-5-code-review-evaluation-20260707-round-2.md`: evaluator 确认 generated output exclusion gate 与负向测试已闭环，Round 1 P1 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认并由 Round 2 复审验证关闭；暂无跨 Story 复现。 |
  | 影响范围 | 2 | 影响 release packaging manifest、npm package inventory、ecosystem source package roots 和 release artifact hygiene。 |
  | 风险等级 | 2 | cache/temp/build/source-local dist 输出进入 npm package 可能泄露本地生成物或发布不可复现 artifact。 |
  | 根因稳定性 | 2 | exclusion gate 只覆盖 fixture directories 而缺少 generated output taxonomy，是 release packaging 扩展后稳定流程缺口。 |
  | 可执行性 | 2 | 可集中维护 forbidden generated-output patterns、显式 runtime dist allowlist，并用 package inventory 负向测试检查。 |
  | 文档缺口 | 0 | 现有 canonical source layout 和 source descriptor 文档已声明 cache/temp/build output 不应进入 source/package truth，本条作为 release gate 实现检查点沉淀。 |

- **总分**: 9/12
- **建议去向**: rules-summary
- **适用范围**: release packaging check、npm package inventory、packaging manifest、canonical source / ecosystem source package root 发布流程。
- **规避指南**:
  - 不得只排除 fixture directories 就认为 release package 已排除 generated outputs。
  - 不得用宽泛 `dist/**` 排除规则误伤 top-level runtime `dist/bin/**` 或 `dist/packaging-manifest.json`；必须区分 package runtime output 与 source-local generated output。
- **最佳实践**:
  - release gate 应集中维护 generated-output forbidden patterns，覆盖 `.cache`、`cache`、`tmp`、`temp`、`build` 和 source-local `dist` 等路径段，并用 allowlist 保留明确应发布的 top-level runtime artifacts。
  - 测试应构造包含 forbidden generated output 的 package inventory，断言对应 assertion fail closed，并同时覆盖 allowed runtime dist artifacts 不被误杀。
- **全局文档建议**:
  - 不建议本次升格到全局文档；全局/参考文档已覆盖 generated output 排除原则，本条属于 release package inventory gate 的实现检查点。本次只写入 `cr-rules-summary.md`。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；本次 04 仅新增 `CR-SEC-17` 和 Story 10-5 记录。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 evaluation 未降级任何 CR TODO，Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 10-4 / 2026-07-06

- **Story**: 10-4
- **分析来源**:
  - `10-4-code-review-summary-20260706-round-1.md`
  - `10-4-code-review-evaluation-20260706-round-1.md`
  - `10-4-code-review-summary-20260706-round-2.md`
  - `10-4-code-review-evaluation-20260706-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 1 个 P1 `patch` finding：`other/misc`、`other/general`、`other/tools` 已在 docs、creator guidance 和 lint guidance 中禁止，但缺少 runtime metadata validation 或 canonical checker 的 executable gate。
  - Fixer 已修复 runtime metadata validation 与 canonical checker 双 gate，并补充 `misc`、`general`、`tools` metadata rejection 负例和实际 `ecosystems/other/misc/module.yaml` canonical checker 负例。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户指定的保守 record-only 策略，仅新增本规则总结记录；不修改全局文档、architecture、CLAUDE、Story 文档、`sprint-status.yaml`、源码、测试或 TODO backlog。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 文档禁止的 module admission rule 必须绑定 executable gate | 通过 | 8/12 | rules-summary | 用户本次授权保守 record-only：新增 CR-API-31 |

### 提炼规则

#### CR-API-31：文档禁止的 module admission rule 必须绑定 executable gate

- **来源问题**: Story 10.4 要求 `other` ecosystem 有 strict admission rules，并明确禁止 `other/misc`、`other/general`、`other/tools` 这类无边界 id。Round 1 发现这些 banned ids 只存在于 docs、creator guidance 和 lint guidance 文案中；runtime metadata validation 仍可能接受合法 metadata 形状的 `ecosystem_category: other` + banned `ecosystem_id`，canonical checker 也只扫描 catch-all 文案漂移，没有扫描实际 banned module root。
- **CR 证据**:
  - `10-4-code-review-summary-20260706-round-1.md`: Finding #1 指出 banned `other` ids 已文档化但缺少 executable gates，来源为 `edge+auditor`，分类为 `patch`。
  - `10-4-code-review-evaluation-20260706-round-1.md`: evaluator 确认该 finding 为 P1，要求 fixer 增加 executable validation / canonical checker gate 和负例测试。
  - `10-4-code-review-evaluation-20260706-round-1.md`: 修复执行记录确认已新增 `module-metadata.banned-other-ecosystem-id`、canonical checker `ecosystem-other.banned-id`、三个 metadata rejection 负例和实际 `other/misc/module.yaml` checker fixture。
  - `10-4-code-review-evaluation-20260706-round-2.md`: evaluator 确认 runtime metadata validation、canonical checker 和负例测试均已闭环，Round 2 新发现 0，CR TODO 0，允许 closeout。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认并由 Round 2 复审验证关闭；暂无跨 Story 复现。 |
  | 影响范围 | 1 | 影响 ecosystem module metadata validation、canonical source checker、release/source admission gate 和 selected-only module discovery。 |
  | 风险等级 | 2 | 文档禁令若没有 executable gate，后续可引入无边界 `other` module root 并被 discovery/package/install 相关流程接受，破坏 strict admission 与 release gate。 |
  | 根因稳定性 | 1 | 将 admission rule 停留在文档/guidance 而未绑定 parser/checker gate，是 module taxonomy 扩展时容易复现的实现习惯风险。 |
  | 可执行性 | 2 | 可要求 runtime metadata validation、canonical checker 或 release gate 至少一处 fail closed，并配套 banned id / banned root 负例测试。 |
  | 文档缺口 | 1 | 全局/参考文档已有 banned id 文案，但既有 CR 规则未沉淀“文档禁止的 admission rule 必须有 executable gate”的实现检查点。 |

- **总分**: 8/12
- **建议去向**: rules-summary
- **适用范围**: ecosystem module taxonomy、module metadata parser、canonical source checker、release gate、以及任何把文档/guidance 中的禁止性 admission rule 落到 source/package/install validation 的流程。
- **规避指南**:
  - 不得只在 README、reference docs、creator guidance 或 lint guidance 中声明 banned id / banned value，就认为 admission rule 已闭环。
  - 不得只扫描文案漂移而不扫描实际 source tree / metadata root；对 banned id 的实际 module root 必须 fail closed。
- **最佳实践**:
  - 禁止性 admission rule 应至少接入一个运行时或 release-path executable gate；metadata parser 和 canonical checker 能双层覆盖时，应分别提供 stable issue code。
  - 负例测试应同时覆盖字段级 metadata rejection 和实际 canonical source root rejection；对于枚举/命名约束，应断言 stable diagnostic id、path 和 offending value。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则总分为 8/12，但适用范围偏 module taxonomy / validation gate 实现域；且用户明确要求本轮仅执行 rules extractor，采用最保守推荐决策，不修改 project-context、architecture、CLAUDE 或其他全局文档。本次只写入 `cr-rules-summary.md`。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；本次 04 仅新增 `cr-rules-summary.md` 中 `CR-API-31` 和 Story 10-4 记录。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 evaluation 未降级任何 CR TODO，Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。

### Story 10-6 / 2026-07-07

- **Story**: 10-6
- **分析来源**:
  - `10-6-code-review-summary-20260707-round-1.md`
  - `10-6-code-review-evaluation-20260707-round-1.md`
  - `10-6-code-review-summary-20260707-round-2.md`
  - `10-6-code-review-evaluation-20260707-round-2.md`
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个 P1 `patch` findings：已迁移 backend ecosystem package ids 仍残留在 SDLC catalog/layout/workflow docs；canonical governance map 未覆盖 `ecosystems/**` source classification、ecosystem `module.yaml` / `module-help.csv` discovery 和 ecosystem-only impact rule。
  - Fixer 已修复 2 项：移除 SDLC 语境中的已迁移 backend package ids 并补 docs negative test；更新 `canonical-governance.json`、governance docs、checker glob 支持和 ecosystem-only checker regression。
  - Round 2 reviewer/evaluator 均确认通过；新增 finding 0，需修复 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户指定的 record-only 策略，仅新增本规则总结记录；不修改全局文档、Story 文档、`sprint-status.yaml`、源码、测试或 TODO backlog。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 已迁移 ecosystem package id 不得残留为 SDLC catalog/root/workflow | 通过 | 9/12 | rules-summary | 用户本次授权 record-only：新增 CR-DOC-04 |
| Canonical governance map 必须覆盖 ecosystem source classification 与 ecosystem-only impact rule | 通过 | 10/12 | rules-summary | 用户本次授权 record-only：新增 CR-API-33 |

### 提炼规则

#### CR-DOC-04：已迁移 ecosystem package id 不得残留为 SDLC catalog/root/workflow

- **来源问题**: Story 10.6 Round 1 发现三条已迁移到 backend ecosystem modules 的 package ids 仍出现在 SDLC skill catalog、canonical source layout 和 workflow explanation 的 SDLC 语境中；同时 ecosystem catalog 已把它们列为 ecosystem modules，形成 public docs / catalog ownership 矛盾。
- **CR 证据**:
  - `10-6-code-review-summary-20260707-round-1.md`: Finding #1 指出 `docs/reference/skills/sdlc-workflows.md` 仍把 `speclite-brownfield-java-springboot-backend-tech-stack-digger`、`speclite-brownfield-nodejs-backend-tech-stack-digger`、`speclite-brownfield-python-backend-tech-stack-digger` 列为 SDLC workflows，来源为 `auditor+edge`，分类为 `patch`。
  - `10-6-code-review-evaluation-20260707-round-1.md`: evaluator 确认该 finding 为 P1，并补充同类 drift 位于 `docs/reference/canonical-source-layout.md` 与 `docs/explanation/speclite-workflows.md`，要求同步修正文档并补 focused docs test。
  - `10-6-code-review-evaluation-20260707-round-1.md`: 修复执行记录确认 SDLC catalog、canonical source layout、workflow explanation 已移除已迁移 backend-specific package ids 的 SDLC 表述，并新增负向断言。
  - `10-6-code-review-evaluation-20260707-round-2.md`: evaluator 确认三条 backend-specific package ids 仅保留在 ecosystem catalog，SDLC catalog/layout/workflow explanation 不再残留，focused docs test 已覆盖。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，且同一根因同时出现在多个 public docs/catalog surface；Round 2 复审验证关闭。 |
  | 影响范围 | 2 | 影响 SDLC catalog、ecosystem catalog、canonical source layout、workflow explanation 和 default vs selected-only ecosystem boundary。 |
  | 风险等级 | 1 | 会误导用户或维护者把 optional ecosystem package roots 当成 default-selected SDLC workflows，但不直接造成 runtime crash。 |
  | 根因稳定性 | 2 | source taxonomy 迁移后，下游 docs/catalog/layout 容易残留旧 package ids，是 ecosystem module 扩展中稳定可复现的 drift 模式。 |
  | 可执行性 | 2 | 可用 focused docs negative tests 断言迁移 package ids 不出现在 SDLC catalog/layout/workflow docs，同时 positive 断言仍在 ecosystem catalog。 |
  | 文档缺口 | 1 | 既有规则未具体覆盖“已迁移 package id 在旧分类 docs 中负向清理”的检查点，本条补充迁移闭环规则。 |

- **总分**: 9/12
- **建议去向**: rules-summary
- **适用范围**: ecosystem package migration、public skill catalog、canonical source layout、workflow explanation、README / docs index 中涉及 module taxonomy 和 selected-only boundary 的文档更新。
- **规避指南**:
  - 不得在 package root 已迁移到 `assets/source/speclite/ecosystems/<category>/<id>/` 后，继续把该 package id 列为 SDLC workflow、SDLC root 或 default-selected workflow 示例。
  - 不得只新增 ecosystem catalog 正向条目而不清理旧分类文档中的同名 package id。
- **最佳实践**:
  - 每次迁移 package root 时，应同时做正向与负向文档验证：ecosystem catalog 必须列出新归属，旧 SDLC/support/core catalog、layout 和 workflow explanation 不得保留旧归属表述。
  - focused docs tests 应枚举迁移 package ids，断言它们只出现在目标分类文档或明确的迁移说明中，不作为旧分类正文条目出现。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则总分为 9/12，但适用范围偏 ecosystem migration docs gate；用户本次明确只授权更新 CR rules 相关文件，不修改全局项目文档。本次只写入 `cr-rules-summary.md`。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；本次 04 仅新增 `CR-DOC-04` 和 Story 10-6 记录。
- **同步状态**: 已写入规则总结

#### CR-API-33：Canonical governance map 必须覆盖 ecosystem source classification 与 ecosystem-only impact rule

- **来源问题**: Story 10.6 Round 1 发现 `canonical-governance.json` 未把 `assets/source/speclite/ecosystems/**` 纳入 `canonical-source-truth`，未把 ecosystem `module.yaml` / `module-help.csv` 纳入 `module-discovery-contract`，也缺少 ecosystem-only impact rule；因此 ecosystem-only canonical source change 可能无法触发对应 governance followups。
- **CR 证据**:
  - `10-6-code-review-summary-20260707-round-1.md`: Finding #2 指出 governance map 缺少 ecosystem path globs、ecosystem module metadata discovery globs 和 ecosystem module change impact rule，来源为 `auditor+edge`，分类为 `patch`。
  - `10-6-code-review-evaluation-20260707-round-1.md`: evaluator 确认该 finding 为 P1，指出 checker 以 governance map 的 `classes[].pathGlobs` 与 `impactRules[].whenChanged` 计算 `impactedClasses` / `triggeredRules`，ecosystem-only 变化会缺少治理分类和 followups。
  - `10-6-code-review-evaluation-20260707-round-1.md`: 修复执行记录确认 governance map 已新增 ecosystem source classification、ecosystem metadata discovery globs、`ecosystem-module-change` impact rule，并同步 governance docs、checker `*` 单段 glob 支持和 ecosystem-only regression。
  - `10-6-code-review-evaluation-20260707-round-2.md`: evaluator 确认 ecosystem-only changed path fixture 会触发 `canonical-source-truth`、`module-discovery-contract`、`ecosystem-module-change` 和 required followups。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 复审和 checker regression 验证关闭。 |
  | 影响范围 | 2 | 影响 canonical source governance map、module discovery contract、canonical checker、governance docs、fixtures、packaging 和 maintainer workflow。 |
  | 风险等级 | 2 | ecosystem-only canonical source change 若不触发治理分类和 followups，会让 docs、fixtures、packaging 或 selected-only validation 漏检，造成迁移/release 闭环失败。 |
  | 根因稳定性 | 2 | source taxonomy 扩展后 machine-readable governance map 与 checker path glob 需要同步扩展，缺口会随新增 ecosystem modules 高概率复现。 |
  | 可执行性 | 2 | 可要求 governance map path globs、impact rule、docs sync 和 checker fixture test 同步更新，并断言 `impactedClasses` / `triggeredRules` / followups。 |
  | 文档缺口 | 1 | 既有规则覆盖 executable gate 和 packaging/validation 检查点，但未覆盖 governance map 必须显式分类 ecosystem-only source change。 |

- **总分**: 10/12
- **建议去向**: rules-summary
- **适用范围**: canonical source governance map、canonical source checker、ecosystem module metadata discovery、maintainer workflow、release verification 和 docs/governance 同步。
- **规避指南**:
  - 不得只在 docs 中说明 ecosystem maintainer workflow，而遗漏 machine-readable governance map 中的 `ecosystems/**` source classification、metadata globs 或 ecosystem-only impact rule。
  - 不得把 mixed worktree 下其它 class/rule 被触发的 `status: "ok"` 误当成 ecosystem-only governance 已闭环。
- **最佳实践**:
  - 新增或迁移 canonical source taxonomy 时，应同步更新 governance map 的 `classes[].pathGlobs`、`impactRules[].whenChanged`、human docs 和 checker tests。
  - checker regression 必须构造 ecosystem-only changed path，断言触发 `canonical-source-truth`、`module-discovery-contract`、`ecosystem-module-change` 以及 ecosystem catalog、fixtures、packaging、creator/lint 或 skill lint 等 required followups。
- **全局文档建议**:
  - 不建议本次升格到全局文档。该规则总分为 10/12，但本次用户明确只授权更新 CR rules 相关文件，且 Round 1 fixer 已在 governance docs / machine-readable map 中完成同步；本轮仅沉淀为后续 CR 检查规则。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭；本次 04 仅新增 `CR-API-33` 和 Story 10-6 记录。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 evaluation 未降级任何 CR TODO，Round 2 evaluation 明确 CR TODO 0；04 未识别未解决的非阻塞改进项，因此不向 05 交接 TODO 候选。
