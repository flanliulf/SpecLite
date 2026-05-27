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
