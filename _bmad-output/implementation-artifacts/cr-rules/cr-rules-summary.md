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
| CR-TEST-01 | No-write 回归断言必须覆盖全部禁止写入路径并支持既有路径排除 | 1-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-03 | 用户可见交互能力必须接入 command path 而非停留在 pure model | 1-3, 1-4 | 8/12 | rules-summary | 已写入规则总结 |
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
| CR-API-13 | Resolver schema anchor 必须解析真实 runtime result shape | 2-4 | 7/12 | rules-summary | 已写入规则总结 |
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
| CR-TEST-02 | Command fixture 必须显式满足被测 gate 之前的前置 evidence | 4-3 | 7/12 | rules-summary | 已写入规则总结 |
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
| CR-API-27 | Manifest 枚举字段必须绑定 executable registry schema | 6-1 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-28 | Normal update apply 成功后必须同步 installed-state projection | 6-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-29 | Conflict failure 输出必须同时保持 structured step state 与准确 summary | 6-2 | 7/12 | rules-summary | 已写入规则总结 |

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

- **来源问题**: Story 1.3 要求用户可选择一个或多个 official modules，但首轮实现只在 `createModuleSelection` pure model 层支持 `userSelectedModuleIds`，`speclite install` command path 没有 prompt、参数或其他用户选择入口，导致 AC6 未真正落地。Story 1.4 再次出现同类问题：detailed config 的内部 model 支持 `values`、`selectedModuleIds` 和 `ideTargetIds`，但真实 CLI adapter 只收集 mode，用户无法调整 AC4 要求的字段。
- **CR 证据**:
  - `1-3-code-review-summary-20260526-round-1.md`: Finding #1 指出 CLI 只暴露 `[target-directory]`、`--json`、`--yes`，install orchestration 未传入 `userSelectedModuleIds`。
  - `1-3-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题为 P1，推荐不新增 public selection flag，而是在 human interactive path 增加受控多选入口。
  - `1-3-code-review-evaluation-20260526-round-2.md`: evaluator 确认 human interactive module selection 已接入 command path，invalid id 有 stable diagnostic，Finding #1 已关闭。
  - `1-4-code-review-summary-20260526-round-1.md`: Finding #1 指出 detailed config prompt 声称可调整 project fields、module artifact paths、selected modules 和 IDE targets，但 CLI 只解析 `{ mode }`。
  - `1-4-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题为 P1，需要在真实 CLI path 补齐 detailed config collection。
  - `1-4-code-review-evaluation-20260526-round-2.md`: evaluator 确认 CLI detailed path 已收集 core fields、SDLC module fields、selected modules 和 IDE targets，Finding #1 已关闭。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 2 | Story 1.3 与 Story 1.4 均出现 pure model 支持但 command path 未暴露真实用户能力的问题，并均经 Round 2 验证关闭。 |
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
- **全局文档建议**:
  - 不建议本次升格；该规则虽已跨 Story 复现，但属于 command orchestration / interactive path 的实现流程规则，且直接修改全局文档会扩大本次 Story 收尾范围。本次按用户授权 record-only 更新规则总结。
- **本次落地**:
  - Story 1.3 与 Story 1.4 的 Round 1 fixer 均已修复，Round 2 evaluator 均确认关闭。
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

- **来源问题**: no-write 测试只检查部分路径，未覆盖 `_speclite`、operation lock、safe-write temp、manifest/index 等 Story 禁止写入路径，也未完整覆盖边界分支。
- **CR 证据**:
  - `1-2-code-review-summary-20260526-round-1.md`: Finding #5 指出 no-write 与边界测试覆盖不足。
  - `1-2-code-review-evaluation-20260526-round-1.md`: evaluator 确认该测试缺口为 P2，建议同轮修复并注意 preexisting paths 排除。
  - `1-2-code-review-evaluation-20260526-round-2.md`: evaluator 确认 no-write assertion 覆盖 `_speclite`、`_speclite-output`、IDE mirrors、operation lock、temp/safe-write paths、manifest/index，并支持 preexisting paths。
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
  | 影响范围 | 1 | 影响 install pre-confirmation、failure 和 existing-install branches 的测试门禁。 |
  | 风险等级 | 1 | 测试漏报可能让后续 mutation 回归进入 pre-confirmation 阶段。 |
  | 根因稳定性 | 1 | no-write helper 容易随新增 forbidden path 漏更新。 |
  | 可执行性 | 2 | 可通过共享 assertion helper、preexisting path whitelist 和 focused branch tests 检查。 |
  | 文档缺口 | 1 | 全局 no-write/writeAuthorized 语义存在，但测试 helper 覆盖策略未充分细化。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: install/update/repair 等存在 pre-confirmation、dry-run 或 no-write gate 的 tests。
- **规避指南**:
  - 不得只断言一两个 output directory 未创建，就宣称 no-write gate 已被测试覆盖。
- **最佳实践**:
  - no-write helper 应列出全部 forbidden paths，并允许 existing-install fixture 标记 preexisting paths，避免把已有状态误判为本次命令写入。
- **全局文档建议**:
  - 不建议本次升格；该规则更偏测试实践，暂记录到 CR rules summary，后续多 Story 重复出现后再考虑进入 test guideline。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
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

- **来源问题**: Story 4.3 Round 3 暴露 `test/update-command.test.ts` 仍使用缺 manifest fixture 断言 missing files-index conflict；但当前 source descriptor gate 应先于 files-index conflict 生效，导致全量 `npm test` 失败，也让测试目标与实际 gate 顺序不一致。
- **CR 证据**:
  - `4-3-code-review-summary-20260531-round-3.md`: reviewer 指出 missing files-index conflict 测试没有创建 `_speclite/_config/manifest.yaml`，实际先返回 `source-integrity.missing-source-descriptor`。
  - `4-3-code-review-evaluation-20260531-round-3.md`: evaluator 确认该测试断言问题为 P1，需要补齐 trusted manifest/source descriptor fixture 或改成 missing manifest gate 断言。
  - `4-3-code-review-evaluation-20260531-round-4.md`: evaluator 确认 `writeTrustedManifest()` 已让测试越过 source descriptor gate 后继续覆盖 missing files-index conflict，全量 `npm test` 通过。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 4 复审验证关闭。 |
  | 影响范围 | 1 | 影响 command-level update/repair regression、source descriptor gate 与 files-index conflict 的测试分层。 |
  | 风险等级 | 1 | 错误 fixture 会让回归套件失败或误测为错误 gate，削弱测试对 public contract 的信号质量。 |
  | 根因稳定性 | 1 | 多 gate command flow 中，测试 fixture 未显式满足前置 evidence 是容易复现的测试编写缺口。 |
  | 可执行性 | 2 | 可要求每个 command fixture 写明目标 gate，并补齐前置 trusted manifest/source descriptor 或明确断言前置 gate。 |
  | 文档缺口 | 1 | 现有测试规则未细化多 gate command fixture 的前置 evidence 要求。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: update/repair/status/validate 等存在 source trust、manifest/index、ownership、conflict 多层 gate 的 command-level tests。
- **规避指南**:
  - 不得用缺失前置 evidence 的 fixture 去断言后置 gate；例如要测试 files-index conflict 时，必须先提供可信 manifest/source descriptor。
- **最佳实践**:
  - 测试 fixture 应显式服务一个 gate：若目标是后置 conflict，则补齐前置 gate 所需 evidence；若目标是前置 blocker，则断言前置 issue、空 plan 和禁止写入授权。
- **全局文档建议**:
  - 不建议本次升格；该规则偏 command regression 编写实践，本次按用户授权 record-only 沉淀。
- **本次落地**:
  - Round 3 fixer 已修复，Round 4 evaluator 确认关闭。
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
