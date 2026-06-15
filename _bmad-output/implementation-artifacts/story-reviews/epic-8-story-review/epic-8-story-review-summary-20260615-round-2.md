---
Epic: 8
Scope: epic
Round: 2
Date: 2026-06-15
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Story Review Summary
Stories Reviewed: 7
---

## Review Conclusion（审查结论）

复审。共审查 Epic 8 下 7 个 Story，并重点复核 Round 1 Finding 1-3 的修订结果与 Finding 4 的非阻塞状态。

审查层状态：内部 `Agent` 工具在当前工具集中不可用，Structure & Completeness Hunter、Consistency Checker、Contract & Boundary Auditor 三个独立子代理未启动；本轮按 SR-01 降级策略执行单一 LLM 回退，覆盖结构完整性、一致性、契约边界三类维度。

- 通过：7 个
- 有条件通过：0 个
- 硬阻塞：0 个

总体判断：通过。Round 1 的 3 个进入开发前需修订项均已在 Story 文档中消除核心歧义；Finding 4 仍是 P2 非阻塞改善项，可随 Epic 8 实现顺序继续跟踪，不阻塞 Epic 8 进入开发。

## Review Scope（审查范围）

- Story 文件：
  - `_bmad-output/implementation-artifacts/stories/8-1-shared-cli-outcome-and-presentation-contract.md`
  - `_bmad-output/implementation-artifacts/stories/8-2-install-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-4-status-and-validate-human-output-separation.md`
  - `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
  - `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
  - `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与架构文档一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互/认证/安全/性能口径
  - 跨 Epic 共享契约
  - `CommandResult` JSON、`resolve` pure JSON、human outcome、message catalog、fixture/docs matrix 的契约边界

说明：`sr-config.md` 示例命名中的 `_bmad-output/planning-artifacts/epics/epic-8.md` 不存在；本轮按用户指定和实际文件匹配 `*epic-8*`，使用 `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md` 作为 Epic 8 定义，未创建兼容副本，也未重命名文件。

## Previous Findings Review（上轮问题回顾）

### Fixed（已修复）

1. Round 1 / Finding 1 — Story 8.5 的 unresolved human outcome 与 resolve 默认 missing-key / pure JSON 契约存在未决冲突
   - 修复位置和方式：Story 8.5 新增 `Resolve Output Mode Decision`，明确默认 `speclite resolve config` 和 `speclite resolve customization` 继续保持 machine contract：stdout 只输出 resolved JSON object，stderr 只输出 JSON Lines diagnostics，不混入 human-readable prose；默认 missing key 继续为 stdout `{}`、exit code 0、stderr empty；human-readable resolve support 必须通过显式 `--human` opt-in 触发；`unresolved` 只适用于显式 human mode。
   - 验证结果：已消除默认 resolve pure JSON / missing-key contract 与 explicit human mode 的设计冲突。Story 8.5 还要求 Dev 阶段把 `--human` 同步记录到 `06-resolve-command-contract.md`、commander registration、docs、tests 和 fixtures，且明确未传入 `--human` 时 automation contract 不变。

2. Round 1 / Finding 2 — Story 8.3 缺少 `partial-or-failed` 的验收标准
   - 修复位置和方式：Story 8.3 新增 AC6 `Partial or failed write shows partial-or-failed`，覆盖 update/repair 已进入、准备进入或部分完成写入阶段时，apply、safe-write、operation-lock 或 partial execution failure 阻止完整完成的场景；并要求 Summary、Evidence、Issues、Next Actions 分别说明未完整完成、已完成写入、失败步骤或 blocker、未执行项、受保护边界、恢复/验证动作。
   - 验证结果：已补齐 `partial-or-failed` AC 和验收口径；Task 1、Task 2、Task 4 同步覆盖 outcome 推导、renderer 展示和 focused tests。

3. Round 1 / Finding 3 — Story 8.4 的 status outcome 与 `highLevelHealth` contract 缺少确定性映射
   - 修复位置和方式：Story 8.4 AC1 新增 deterministic mapping table：`configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`；同时明确 `stale` 和 `unknown` 只能是 human-derived label，其证据必须来自 manifest、source descriptor、version/evidence insufficiency 或 installed-state summary 不足，且不得新增 public JSON enum，除非先更新 `01-command-result-json-contract.md`。
   - 验证结果：已补齐 `highLevelHealth` 到 human outcome 的 deterministic mapping，且未新增 public JSON enum。Task 1 和 Task 4 也要求实现与测试证明 `stale` / `unknown` 不会作为新的 public JSON enum 输出。

### Still Non-Blocking（仍为非阻塞待办）

1. Round 1 / Finding 4 — Story 8.1 与 Story 8.6 的 message catalog / Next Actions ownership 边界仍可更明确
   - 维持既有评估结论：该问题有效，但属于 P2 非阻塞改善项。
   - Round 2 判断：Story 8.1 已声明 shared output frame、primitive、catalog fallback 和 empty-state 基础；Story 8.6 已声明 command-specific catalog、Next Actions builder、locale propagation 和去重要求。当前边界足以支撑 Epic 8 进入开发，但后续实现时仍建议在开发记录或实现 PR 中显式标注 key ownership 与 registry 扩展策略。

## New Findings（新发现）

本轮未发现新的阻塞项、中高优先级问题、`decision_needed` 或 `patch`。

## Per-Story Review（逐篇审查结论）

### Story 8.1: Shared CLI Outcome And Presentation Contract（共享 CLI Outcome 与展示契约）

**结论：通过**

**优点**
- 定义 shared title、outcome、Summary、Next Actions、empty state 与 JSON semantic parity，且明确 outcome label 只属于 human-readable presentation。
- Scope Boundary 保护 command core behavior、exit code、public JSON schema 和 fixture JSON comparison。

**关注点**
- Round 1 Finding 4 的 ownership clarity 仍可作为 P2 继续跟踪，尤其是 `src/cli/messages.ts` 中 shared key namespace 与 command-specific catalog 扩展边界。

**建议动作**
- 不阻塞开发；实现 Story 8.1 时在 shared primitive 或 catalog registry 中记录最小 common key ownership，供 Story 8.6 扩展。

### Story 8.2: Install Outcome-Oriented Output（Install Outcome 导向输出）

**结论：通过**

**优点**
- AC 覆盖 `prewrite-paused`、`blocked-before-write`、`write-failed`、`ready-check-failed`、`ready`，能区分预览、写入前阻断、写入失败、ReadyCheck 失败和安装就绪。
- Scope Boundary 明确不新增 public JSON fields，不改变 install core behavior，并继承 Story 1.7 的 no-prompt / locale / prompt separation 约束。

**建议动作**
- 按现有 Evidence Plan 执行 focused tests 和 build/test 验证即可。

### Story 8.3: Update And Repair Outcome-Oriented Output（Update 与 Repair Outcome 导向输出）

**结论：通过**

**优点**
- AC6 已补齐 `partial-or-failed`，并把 apply、safe-write、operation-lock、partial execution failure 的 Summary、Evidence、Issues、Next Actions 验收口径写清楚。
- 任务拆分同步覆盖 outcome 推导、renderer/catalog、安全语义保护和 tests，且保留 update/repair planning semantics 与 conflict contract。

**建议动作**
- 开发时重点验证 `operation-lock.project-locked` 是 command-level blocker，不应伪装成已完成 planning，也不应复制 path-level conflicts 到多个 `issues[]`。

### Story 8.4: Status And Validate Human Output Separation（Status 与 Validate 人类输出分层）

**结论：通过**

**优点**
- AC1 已提供 `status.data.highLevelHealth` 到 status human outcome 的 deterministic mapping，并限制 `stale` / `unknown` 为 human-derived label。
- Scope Boundary 与 Dependency Gate 均保护 `status.data.highLevelHealth` enum、status lightweight 行为和 validate 完整诊断边界。

**建议动作**
- 开发时 tests 必须覆盖 `stale` / `unknown` 不进入 public JSON enum，并证明 status 不通过新增 issues 表达 `partial` / `failed` health。

### Story 8.5: Resolve Command Support Output（Resolve 命令支持输出）

**结论：通过**

**优点**
- 已通过 `Resolve Output Mode Decision` 明确默认 `resolve` machine contract 与显式 `--human` human-readable mode 的边界。
- Scope Boundary、Dependency Gate、Equivalent Implementation Policy 均要求保护 pure JSON stdout、missing-key default behavior、merge order、optional/required layer semantics 和 CommandResult exception boundary。

**建议动作**
- Dev 阶段必须先同步 `06-resolve-command-contract.md`、commander registration、docs、tests 和 fixtures 后再暴露 `--human`；未同步前不得改变默认 stdout/stderr/exit code。

### Story 8.6: Localized Next Actions And Message Catalog（本地化 Next Actions 与消息目录）

**结论：通过**

**优点**
- AC 覆盖默认 `zh-CN` catalog、`en-US` fallback、Next Actions safety order、issue suggestedNextStep localization 和技术标识保留。
- Scope Boundary 明确不改变 JSON `nextActions` contract，不把 catalog 做成 plugin system 或 runtime customization。

**关注点**
- 与 Story 8.1 的 catalog ownership 仍建议在实现阶段明确记录，避免重复定义同一文案 key。

**建议动作**
- 不阻塞开发；实现时复用 Story 8.1 registry，不在 command renderer 中散落硬编码中文/英文混排。

### Story 8.7: Human Output Fixture And Documentation Matrix（人类输出 Fixture 与文档矩阵）

**结论：通过**

**优点**
- AC 覆盖 focused tests、JSON contract stability、NO_COLOR/non-TTY/CI/narrow terminal、docs 示例一致性。
- Scope Boundary 明确不新增 outcome vocabulary、不改变 command core behavior 或 JSON schema、不把 docs 示例变成唯一 contract source。

**建议动作**
- 执行时保留 matrix TODO，不为尚未实现的 outcome 伪造 coverage；release packaging check 如因无关工作树失败，应记录真实失败。

## Passed Checks（通过项）

- Round 1 Finding 1：Story 8.5 已把 default JSON mode 与 explicit human mode 分离，保留 canonical `resolve` pure JSON stdout 和 default missing-key `{}` / exit 0 / empty stderr 行为。
- Round 1 Finding 2：Story 8.3 已把 `partial-or-failed` 提升到 AC，并补齐 renderer 与 test 覆盖口径。
- Round 1 Finding 3：Story 8.4 已补齐 `highLevelHealth` deterministic mapping，并阻止 `stale` / `unknown` 漏到 public JSON enum。
- Round 1 Finding 4：仍为已知非阻塞改善项，非本轮 blocker。
- Epic 8 的 corrective planning 边界保持一致：不新增 GUI/TUI，不改变 command core behavior，不让 human-readable 文案成为 automation contract。
- `CommandResult` JSON、exit code、issue ordering、path normalization、fixture stable comparison 和 public JSON schema 的保护在 7 个 Story 中均有明确约束。

## Final Decision（结论）

- **结论**：通过。
- **阻塞项**：无。
- **新 `decision_needed`**：无。
- **新 `patch`**：无。
- **建议**：Epic 8 可以进入开发。进入开发后仍需按 Story Evidence Plan 验证 focused tests、JSON parity、locale/TTY stability 和 docs/fixture matrix；Finding 4 作为 P2 非阻塞改善项继续跟踪即可。
