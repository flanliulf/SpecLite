---
Epic: 9
Scope: epic
Round: 1
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Story Review Summary
Stories Reviewed: 2
---

## Review Conclusion（审查结论）

首轮审查。共审查 Epic 9 下 2 个 Story。审查层状态：0/3 层完成（当前环境未提供可调用的 `Agent` 子代理工具，Structure & Completeness Hunter、Consistency Checker、Contract & Boundary Auditor 均无法独立启动；已按 SR engine 的 B0 降级规则使用 single-LLM fallback 完成八维审查）。

- 通过：0 个
- 有条件通过：1 个
- 硬阻塞：1 个

总体判断：Epic 9 的产品方向、Story 拆分和 Node-only resolver 边界基本成立，但 Round 1 尚未达到 PASS。主要风险集中在 full canonical corpus 的扫描边界、Story 9.2 对 Story 9.1 负向 gate 的前置依赖、以及 Python compatibility asset 相关负向验证覆盖不足。建议先修订 Story 文档后再进入 evaluator。

## Review Scope（审查范围）

- Story 文件：
  - `_bmad-output/implementation-artifacts/stories/9-1-installed-skill-activation-contract-hardening.md`
  - `_bmad-output/implementation-artifacts/stories/9-2-python-resolver-compatibility-asset-projection.md`
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md`
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
  - `_bmad-output/planning-artifacts/adr/0002-replace-python-resolvers-with-node-parity.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - 前序 Story 证据摘要：Story 1.5、2.4、3.4、4.1、4.6、6.2、6.4、6.5、6.7、8.5
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与架构文档一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互/认证/安全/性能口径
  - 跨 Epic 共享契约
  - Node-only resolver 默认契约
  - Python resolver compatibility asset 边界

## New Findings（新发现）

### 1. [高] Story 9.2 缺少对 Story 9.1 负向 gate 已就绪的硬启动条件
- **来源**：consistency+contract
- **分类**：patch
- **涉及 Story**：9-2
- **证据** - Epic 9 明确要求 Story 9.1 是 P0，Story 9.2 是 P1 且依赖 Story 9.1 的默认 activation path 负向断言；Story 9.2 也写明“Story 9.1 应先完成或至少先提供 full corpus negative tests”。但 Story 9.2 当前 `Status: ready-for-dev`，Task 1/Task 2 没有要求在实现前先验证 Story 9.1 的 full corpus negative tests 已存在或可运行。
- **影响** - 如果开发者先实现 Story 9.2，可能会把 `_speclite/scripts/resolve_*.py` 投影为兼容资产，却尚未有 corpus gate 防止 installed skills 重新引用这些 scripts。这会直接削弱 Epic 9 的核心完成门禁。
- **建议** - 在 `9-2-python-resolver-compatibility-asset-projection.md` 增加 Task 0 或 Dependency Gate hard check：若 Story 9.1 未完成，至少必须先存在并通过 Story 9.1 的 full corpus negative tests；否则 Story 9.2 不得进入 implementation。也可以将 Story 9.2 状态调整为明确的 `blocked-by-9-1-corpus-gate`，直到该条件满足。

### 2. [中] Story 9.1 的 full corpus 测试扫描范围遗漏 `SKILL.en.md`
- **来源**：structure+contract
- **分类**：patch
- **涉及 Story**：9-1
- **证据** - Story 9.1 Task 2 要求 full corpus test 扫描 `assets/source/speclite/**/SKILL.md`、`references/**/*.md` 和 fresh install mirrored skill files；Task 3 却要求迁移 `SKILL.md` 与 `SKILL.en.md`。Epic 9 的 scope 是 canonical Agent / Workflow activation protocol migration，不限中文入口。
- **影响** - 英文 skill 入口可能继续保留 `resolve_customization.py`、单文件 `_speclite/config.toml` 或缺失 `command -v speclite` preflight，测试仍可通过，造成 installed corpus gate 假绿。
- **建议** - 将 Task 2 和 Evidence Plan 中的 corpus scan 明确扩大为 `assets/source/speclite/**/SKILL*.md` 或等价白名单，覆盖 `SKILL.md`、`SKILL.en.md`、activation references、workflow terminal step files，以及 fresh install mirrored entries。

### 3. [中] Story 9.1 的 Agent 迁移范围与“所有 `speclite-agent-*`”验收标准不完全一致
- **来源**：consistency
- **分类**：patch
- **涉及 Story**：9-1
- **证据** - AC5 要求所有 `speclite-agent-*`、customization-capable workflow skills 和 `workflow.on_complete` references 必须使用 `speclite resolve`。但 Task 3 仅指定 `assets/source/speclite/sdlc-skills/**/speclite-agent-*/SKILL.md` 与 `SKILL.en.md`，Task 7 的 agent lint 也只运行在 `assets/source/speclite/sdlc-skills`。当前 source tree 还存在 `assets/source/speclite/support-skills/speclite-agent-creator` 与 `assets/source/speclite/support-skills/speclite-agent-lint`。
- **影响** - 如果 support-side `speclite-agent-*` 属于 canonical installed corpus，Story 9.1 可能漏迁移或漏测这些入口；如果它们不属于 persona Agent，也需要 Story 文档显式说明排除规则，否则实现者会在 support tool 与 persona agent 边界上产生不同解释。
- **建议** - 在 Story 9.1 中补充 canonical corpus inventory 规则：哪些 `speclite-agent-*` 必须迁移，哪些 support tools 仅做负向 lint/packaging 检查并排除 persona activation。同步更新 Task 3、Task 5、Task 7 和 Anchor Contract Map，避免只覆盖 `sdlc-skills`。

### 4. [中] Story 9.2 对 compat script 被误宣称为默认 resolver 的负向验证覆盖不足
- **来源**：contract
- **分类**：patch
- **涉及 Story**：9-2
- **证据** - AC3 要求如果 Skill activation text、manifest runtime entry、help/phase reference 或 docs default path 引用 `_speclite/scripts/resolve_*.py` 作为 resolver，必须报告 legacy resolver dependency 或让 corpus test 失败。但 Task 2 只要求“Skill activation text 引用”负向断言，Task 4 也只明确保留 activation text / source checkout resolver negative behavior；Task 5 只要求更新 docs，没有要求 docs default path 负向断言。
- **影响** - 即使 installed skills 本身不引用 Python scripts，manifest、help index、phase coverage 或 docs 仍可能把 compat asset 表述成默认 runtime dependency，破坏 Epic 9 “只作为 compatibility / troubleshooting assets”的边界。
- **建议** - 在 Story 9.2 Task 2/4/5/6 中增加负向测试矩阵：manifest runtime entry、help/phase reference、docs default resolver path、packaging metadata 中任一把 `_speclite/scripts/resolve_*.py` 声明为 default resolver 时必须失败；只有明确标注 `runtime-compat-script` / troubleshooting 的引用可通过。

## Per-Story Review Conclusion（逐篇审查结论）

### Story 9.1: Installed Skill Activation Contract Hardening（已安装 Skill 激活契约收口）

**结论：有条件通过**

**优点**
- Story 目标与 Epic 9 核心问题一致，明确保护 `speclite resolve` 的 machine stdout、stderr JSON Lines、missing key、merge order 和 `--human` opt-in contract。
- Alice / NOI regression、CLI unavailable negative test、legacy Python resolver negative test 都被纳入 AC 和 Evidence Plan，方向正确。

**关键问题**
1. **full corpus scan 未覆盖 `SKILL.en.md`** — Task 2 与 Task 3 范围不一致，可能漏掉英文入口中的 legacy activation text。
2. **support-side `speclite-agent-*` 边界不清** — AC 写“所有 `speclite-agent-*`”，但任务与验证命令主要限定在 `sdlc-skills`。

**建议动作**
- 修订 Task 2、Task 3、Task 5、Task 7 与 Anchor Contract Map，明确 canonical corpus inventory、`SKILL.en.md` 覆盖和 support tool 排除/纳入规则。

### Story 9.2: Python Resolver Compatibility Asset Projection（Python Resolver 兼容资产投影）

**结论：硬阻塞**

**优点**
- Story 清楚区分 Python resolver scripts 的 compatibility asset 定位与 Node `speclite resolve` 默认 runtime support。
- AC 覆盖 install、files-index、validate、update、repair、uninstall、packaging、docs，生命周期方向完整。

**关键问题**
1. **缺少 Story 9.1 corpus gate 前置硬检查** — 当前可直接进入 ready-for-dev，但 Epic 9 要求 Story 9.2 依赖 Story 9.1 的默认 activation path 负向断言。
2. **负向验证矩阵未覆盖 manifest/help/docs default path** — AC3 覆盖范围比 Tasks/Verification 更广，可能漏掉非 Skill 文案把 Python scripts 重新宣传成默认 resolver。

**建议动作**
- 在 Story 9.2 开头增加 hard dependency check；在 Task 2/4/5/6 中补齐 manifest/help/phase/docs/packaging metadata 的 negative assertions。

## Passed Items（通过项）

- Epic 9 的二段拆分合理：Story 9.1 先迁移默认 activation protocol，Story 9.2 再处理 Python resolver compatibility asset 生命周期。
- 两个 Story 都明确不得改变 `speclite resolve` 的默认 machine contract，不新增第二套 TOML merge implementation，不使用 `--human` 作为 machine activation input。
- Story 9.1 已覆盖 Alice / NOI merged config regression、CLI unavailable halt、legacy resolver negative string 和 release packaging/check 方向。
- Story 9.2 已识别现有 `runtime-script` fixture 风险，并要求将 Python resolver scripts 从默认 runtime support 语义中剥离。
- 已知既有问题，非本次引入：`_bmad-output/project-context.md` 仍是初始化占位内容，本轮已改以 Epic、SPEC、ADR 和 Architecture shard 作为主要基准。

## Final Result（最终结论）

- **结论**：不通过
- **PASS**：否
- **阻塞项**：Story 9.2 必须先补充 Story 9.1 corpus gate 前置硬检查。
- **发现数量**：4 个
- **严重度分布**：高 1 个，中 3 个，低 0 个
- **single-LLM fallback**：是
- **建议**：先执行 SR fixer 修订 Story 9.1 / 9.2 的范围、gate 和负向测试矩阵，再进行下一轮 reviewer。
