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
| CR-TEST-01 | No-write 回归断言必须覆盖全部禁止写入路径并支持既有路径排除 | 1-2 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-03 | 用户可见交互能力必须接入 command path 而非停留在 pure model | 1-3, 1-4 | 8/12 | rules-summary | 已写入规则总结 |
| CR-API-04 | Internal InstallPlan 必须记录 selectedModules 且不得泄露到 public CommandResult | 1-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-05 | Module required_dependencies 必须在 metadata discovery 阶段确定性校验 | 1-3 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-06 | `module-help.csv` 的 canonicalSkillId 必须引用已发现 package root | 1-5 | 7/12 | rules-summary | 已写入规则总结 |
| CR-API-07 | 非事务写入失败必须通过已契约字段暴露 partial progress | 1-5 | 7/12 | rules-summary | 已写入规则总结 |
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
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 3 个 findings，包含 1 个 `decision_needed` 和 2 个 `patch`；evaluator 将 3 项均评估为 P1 阻塞并要求 fixer 修复。
  - Round 1 fixer 已修复 3 项，并记录 `npm test` 通过 7 个 test files / 39 个 tests、`npm run build` 通过；验证后清理 `node_modules/` 和 `dist/`。
  - Round 2 reviewer/evaluator 均通过；3 个 findings 均关闭，新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5 (gpt-5.5)。本次按用户授权执行 record-only，仅写入本规则总结；全局文档已有相近契约锚点，且全局文档修改会扩大范围，因此不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| 交互式模块选择必须接入 command path 而非停留在 pure model | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Internal InstallPlan 必须记录 selectedModules 且不得泄露到 public CommandResult | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| Module required_dependencies 必须在 metadata discovery 阶段确定性校验 | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

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
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 3 个高严重性 `patch` findings：IDE mirror directory mutation 安全、`module-help.csv` 到 canonical package 的完整性校验、写入中途失败后的 public failure progress 表达；fixer 已修复 3 项，并记录定向测试、`npm test`、`npm run build` 均通过。
  - Round 2 reviewer/evaluator 均通过；3 个 findings 均关闭，新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5.5 (gpt-5.5)。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局文档已有相近安全、metadata 和 CommandResult 边界约束，且全局文档修改会扩大范围，因此不修改全局文档。

#### 升格判定摘要

| 候选规则 | 硬性门槛 | 总分 | 建议去向 | 用户确认结果 |
|----------|----------|------|----------|--------------|
| Installer-owned directory mutation 必须先通过 path-safety guard | 通过 | 8/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| `module-help.csv` 的 canonicalSkillId 必须引用已发现 package root | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |
| 非事务写入失败必须通过已契约字段暴露 partial progress | 通过 | 7/12 | rules-summary | 用户本次授权默认推荐决策：record-only |

### 提炼规则

#### CR-SEC-02：Installer-owned directory mutation 必须先通过 path-safety guard

- **来源问题**: IDE mirror entry root 在 `copyCanonicalPackage` 中通过 raw `mkdir` 创建，目录 mutation 发生在 symlink / project-boundary / case conflict 等 path-safety guard 之前；当 `.claude` 或 `.agents` 是项目外 symlink 时，可能先在项目边界外创建目录。
- **CR 证据**:
  - `1-5-code-review-summary-20260526-round-1.md`: Finding #1 指出 `.claude/skills/<canonicalSkillId>` 或 `.agents/skills/<canonicalSkillId>` 的 raw `mkdir` 先于 `safeWriteFile` 安全校验执行。
  - `1-5-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC2 与 AC6/AC7，评估为 P1 阻塞项。
  - `1-5-code-review-evaluation-20260527-round-2.md`: evaluator 确认 `copyCanonicalPackage` 已改为调用 `ensureSafeDirectory`，并有 `.claude` / `.agents` symlink regression tests 断言外部目录未创建。
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
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-06：`module-help.csv` 的 canonicalSkillId 必须引用已发现 package root

- **来源问题**: module discovery 读取 `module-help.csv` 后，只校验 module 至少存在 package roots，未校验每个 help row 的 `canonicalSkillId` 是否对应已发现 canonical package root；缺失引用会被 mirror/help/phase projection 静默过滤。
- **CR 证据**:
  - `1-5-code-review-summary-20260526-round-1.md`: Finding #2 指出 orphan help row 不会生成 mirror entry、help index 或 phase coverage，也不会产生 blocking diagnostic。
  - `1-5-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC9，要求使用 reserved issue id 或既有契约化 diagnostic。
  - `1-5-code-review-evaluation-20260527-round-2.md`: evaluator 确认 discovery 阶段新增 `module-metadata.unknown-help-skill` 校验，并通过 install diagnostic 映射和双层测试覆盖。
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
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-07：非事务写入失败必须通过已契约字段暴露 partial progress

- **来源问题**: `applyInstallPlan` 在 runtime/config/artifact writes 已完成后若 IDE mirror 或 manifest/index 写入失败，只返回 issue；`runInstallCommand` 固定使用 config initialization completed steps，隐藏已完成的 write-phase mutations。
- **CR 证据**:
  - `1-5-code-review-summary-20260526-round-1.md`: Finding #3 指出 public failure output 无法表达 runtime/artifact 已完成但后续写入失败的 partial state。
  - `1-5-code-review-evaluation-20260526-round-1.md`: evaluator 确认该问题违反 AC10/Task 7，要求只使用 `completedSteps` / `pendingSteps` 等已契约字段表达。
  - `1-5-code-review-evaluation-20260527-round-2.md`: evaluator 确认失败分支已返回 `completedSteps` / `pendingSteps` partial progress，未新增 `failedStep`、`changedPaths`、`readySummary` 或 ad-hoc blob。
- **硬性门槛**:
  - 有证据: 是
  - 可规则化: 是
  - 非纯特例: 是
  - 不重复: 是
  - 状态明确: 是
- **量化评分**:

  | 维度 | 分数 | 理由 |
  |------|------|------|
  | 复现频次 | 1 | 同一 Story 中 reviewer/evaluator 均确认，并由 Round 2 验证关闭。 |
  | 影响范围 | 1 | 影响 install write phase failure output，也适用于 update/repair 等非事务写入流程。 |
  | 风险等级 | 1 | partial mutation 被隐藏会误导人工恢复、validate/repair 入口和自动化诊断。 |
  | 根因稳定性 | 1 | 非事务流程若只返回单一 issue，后续多阶段写入命令容易重复隐藏 progress。 |
  | 可执行性 | 2 | 可通过 stable lifecycle step 列表、failure-path tests 和 public JSON negative assertions 检查。 |
  | 文档缺口 | 1 | CommandResult contract 已有字段，但 CR 规则需要沉淀“不得用固定 pending steps 覆盖 partial mutation”的实现检查点。 |

- **总分**: 7/12
- **建议去向**: rules-summary
- **适用范围**: install/update/repair 等本地文件系统非事务写入命令的 failure path。
- **规避指南**:
  - 不得在多阶段写入失败时固定回退到 pre-write completed steps，也不得声称 rollback 或隐藏已完成 mutation。
- **最佳实践**:
  - writer 返回 stable lifecycle `completedSteps` / `pendingSteps` partial progress；command 层只映射到 owning SPEC 已声明字段，并用 negative assertions 防止泄露未契约字段。
- **全局文档建议**:
  - 不建议本次升格；现有 CommandResult / install lifecycle 文档已有总体字段契约，本次按用户授权只记录到 CR rules summary。
- **本次落地**:
  - Round 1 fixer 已修复，Round 2 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 2 evaluation 明确 CR TODO 0，本次未识别未解决的非阻塞改进项。

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
- **结论概览**:
  - Round 1 reviewer/evaluator 确认 2 个中优先级 `patch` findings，并由 evaluator 升为 P1 阻塞：mapped help/phase target 未反查 `skill-index.installedTargets`，以及 ReadyCheck 将 invalid activation target 过早归类为 `manifest-schema.unreadable`。
  - Round 2 reviewer/evaluator 确认 1 个新的 P1 阻塞：`activationTarget` 可以跨 skill 指向另一个 canonical skill 的 installed `SKILL.md`。
  - Fixer 已修复 3 项，并补充 validator / ReadyCheck regression；Round 3 reviewer/evaluator 均通过，新发现 0，需要修复项 0，CR TODO 0。
  - 本次 04 使用模型：GPT-5 Codex (gpt-5-codex)。本次按用户授权执行默认推荐决策：record-only 写入本规则总结；全局 manifest/index、validation taxonomy 和 adapter registry SPEC 已有相近边界原则，因此不修改全局文档。

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
  - Round 1 fixer 已修复，Round 3 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-11：ReadyCheck 可读 index 的 target 语义错误必须保留 reserved `menu-target.*` 诊断

- **来源问题**: ReadyCheck 在读取 `help-index.json` / `phase-coverage.json` 时先执行严格 schema parse，invalid `activationTarget` 会提前返回 generic `manifest-schema.unreadable`，绕过 Story 2.3 要求的 reserved `menu-target.missing-target` 诊断。
- **CR 证据**:
  - `2-3-code-review-summary-20260527-round-1.md`: Finding #2 指出 invalid `help-index.activationTarget="DS"` 在 ReadyCheck 中返回 `manifest-schema.unreadable`。
  - `2-3-code-review-evaluation-20260527-round-1.md`: evaluator 确认 target 语义错误应保留 reserved `menu-target.*` 分类，且 malformed JSON / missing file 才保留 `manifest-schema.unreadable`。
  - `2-3-code-review-evaluation-20260527-round-3.md`: evaluator 确认 ReadyCheck 已消费 blocking `menu-target.*` issue，invalid activation target regression 有效。
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
  - Round 1 fixer 已修复，Round 3 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### CR-API-12：Installed activation path basename 必须绑定对应 `canonicalSkillId`

- **来源问题**: `activationTarget` 只校验 `.claude/skills/<任意目录>/SKILL.md` 或 `.agents/skills/<任意目录>/SKILL.md` path shape，没有要求路径中的 installed skill directory basename 等于当前 `canonicalSkillId`；help 与 phase coverage 同时错指另一个 skill 时，validator 与 ReadyCheck 会错误通过。
- **CR 证据**:
  - `2-3-code-review-summary-20260527-round-2.md`: Finding #1 指出 `canonicalSkillId="speclite-dev-story"` 时可错指 `.claude/skills/other-skill/SKILL.md`，`validateMenuTargets(...)` 返回 `[]`，ReadyCheck 返回 `ok: true`。
  - `2-3-code-review-evaluation-20260527-round-2.md`: evaluator 确认该问题违反 AC 1 / AC 2，评估为 P1 阻塞项。
  - `2-3-code-review-evaluation-20260527-round-3.md`: evaluator 确认 help `activationTarget`、phase mapped `entryPath` 与 `activationTarget` 已解析 target family / basename 并绑定到对应 `canonicalSkillId`。
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
  - Round 2 fixer 已修复，Round 3 evaluator 确认关闭。
- **同步状态**: 已写入规则总结

#### 05 TODO Tracker 交接

- **无需新增 TODO backlog**: Round 1 / Round 2 / Round 3 evaluation 均明确 CR TODO 0，本次未识别未解决的非阻塞改进项。

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
