# Epic 12: Owning Contract And Hook Platform Alignment（Owning Contract 与 Hook 平台对齐）

SpecLite 维护者与 AI IDE 使用者可以依赖"owning SPEC 与已发布实现一致"的 lifecycle / issue / hook 契约：SPEC 09 追认已实现的 Flow Gate report v2 与 gate precedence，SPEC 07 不再保留无产出点的 issue id，installer 生成的 hook 命令在 Claude Code 与 Codex 上只依赖两家平台文档化的行为，并且 canonical source hook 只投影到真正拥有 protected surface 的项目。

**实施范围：** Corrective planning Epic。来源为 `story-candidates-2026-09-13.md` 的 SC-3、SC-4、SC-5 与 SC-5 Dev Notes 中的 module-scoped hook projection 候选，以及 Epic 11 retro `A11-3`（tracker 与 gate artifact precedence）。覆盖 SPEC 09 `FlowGateReportMetadata` v2 字段集与 freshness policy、SPEC 07 `artifact-path.fixture-write-failed` 归属、hook 命令路径 / Codex 输出协议 / Stop 对称处理 / legacy shape 识别、canonical source hook 的 module-scoped 投影，以及对应 fixtures、packaging manifest 与 maintainer docs。

**MVP guard：** 本 Epic 不改变 Flow Gate 判定规则、Flow Gate mode / result 枚举、canonical hook 的 warning-only 语义、hook 事件集合与 matcher、`CommandResult` JSON contract 或 `speclite resolve` contract。任何 SPEC 变更必须先于实现落地并在 SPEC 变更记录中留痕；任何改变 installer-owned hook config 内容的 Story 必须先把既有形态登记为 recognized legacy shape，否则不得进入实现。

**覆盖 FR / NFR / UX：** FR35b, FR35c, FR36, FR39, FR41b, FR41c, FR66, FR71a, NFR14, NFR17, NFR17a, NFR28b, NFR32f, SPEC 03 repair eligibility, SPEC 07 issue taxonomy ownership, SPEC 09 lifecycle contract ownership

## Dependency / Sequencing（依赖与顺序）

Epic 12 分两条子线，不要求 strict serial：

- Story 12.1 与 Story 12.2 互相独立，也不依赖 Story 12.3 / 12.4；两者都是 owning SPEC 收口，可并行或任意顺序执行。
- Story 12.3 → Story 12.4 为 serial：Story 12.4 消费 Story 12.3 建立的 hook 命令形态与 recognized legacy shape 机制，不得先于 Story 12.3 进入 in-progress。
- Epic 12 与 Epic 13 无代码级依赖，可并行；但 retro `A11-3` 要求 precedence 裁决在"下一个 Story kickoff 前"完成，因此建议 Story 12.1 作为两个 Epic 中最先 kickoff 的 Story，其 kickoff gate 以当前 SPEC 09 为准，precedence 裁决作为本 Story 自身的交付物。

明确排除：`TODO-013`（protected namespace artifact root 是否由 resolver 拒绝）与 `TODO-014`（single-file `story_location`）属于 artifact root 契约决策，与 Flow Gate report 契约无关，不并入 Story 12.1；保留在 CR TODO backlog 由后续 artifact root 相关 Story 裁决。

## Story 12.1: Flow Gate Report v2 Contract Ratification And Gate Precedence（Flow Gate Report v2 契约追认与 Gate 优先级裁决）

作为依赖 `speclite-flow-gate` 报告作为 machine-readable gate input 的 SpecLite 维护者，  
我希望 SPEC 09 的 `FlowGateReportMetadata` 与已发布的 hook / skill 实现一致，并明确 tracker 与 gate artifact 的先后顺序，  
以便后续 Story 的 kickoff / completion gate 引用的是正确契约，而不是被 hook 拒绝的 legacy 版本。

### Acceptance Criteria（验收标准）

1. **SPEC 09 追认 v2 字段集**

   **Given** `src/hooks/flow-gate-enforcement.ts` 与 installed runner 以 `speclite.flow-gate-report.v2` 为 REQUIRED、`v1` 为 LEGACY  
   **When** 更新 SPEC 09 `Flow Gate Report Metadata` 章节  
   **Then** `FlowGateReportMetadata.schemaVersion` 必须声明为 `"speclite.flow-gate-report.v2"`  
   **And** 必须补齐 `handoffContractVersion`、`foundationPrerequisiteStatus`、`foundationPrerequisiteRefs`、`closureOwnerCheckStatus`、`closureOwnerRefs`、`sourceSkill` 的类型、允许值与必填性，且与 `speclite-flow-gate` 的 `assets/report-template.md` 及 hook 实际校验逻辑逐字段一致。

2. **v1 明确标记为 legacy 且被拒绝**

   **Given** existing installs 可能仍持有 v1 report  
   **When** SPEC 09 描述 schema evolution  
   **Then** 必须注明 `v1` 为 legacy、hook 对其返回稳定拒绝诊断、且不提供自动迁移  
   **And** 不得把 v1 report 重新定义为可通过的 gate evidence。

3. **Freshness policy 裁决入约**

   **Given** hook 与 runner 各自硬编码 `MAX_METADATA_AGE_DAYS = 30`  
   **When** 本 Story 裁决 freshness policy 归属  
   **Then** 必须二选一并记录依据：把 30 天 freshness 写入 SPEC 09 作为契约项；或在 SPEC 09 中声明 freshness 为 hook 实现细节且不构成契约  
   **And** `docs/reference/specs/flow-gate-handoff-contract.md` 的 Freshness Policy 小节与裁决结果一致。

4. **Tracker 与 gate artifact precedence 裁决（`A11-3`）**

   **Given** `sprint-status.yaml` 与 Flow Gate completion report 可能出现顺序不一致  
   **When** SPEC 09 定义 Story completion 顺序  
   **Then** 必须明确"story-completion gate PASS / PASS_EQUIVALENT 与 finalizer 先于 tracker `done`"  
   **And** `speclite-flow-gate` 对"tracker 已 `done` 但缺少对应 completion gate PASS report"给出稳定、可复现的诊断文本或 result，不得依赖 prose 扫描。

5. **Canonical corpus 与公开文档同步**

   **Given** SPEC 09 已更新  
   **When** 执行 canonical corpus 与 docs 一致性检查  
   **Then** `speclite-flow-gate` 的 `SKILL.md` / `SKILL.en.md` / `assets/report-template.md` / CHANGELOG、`docs/reference/specs/flow-gate-handoff-contract.md` 不得再出现与 SPEC 09 冲突的 schemaVersion、字段名或允许值  
   **And** 变更走 `speclite-check-canonical-source-change`。

6. **Focused tests 覆盖契约一致性**

   **Given** 本 Story 实现完成  
   **When** 执行 focused test suite  
   **Then** `test/flow-gate-hook-runner.test.ts` 与 `test/flow-gate-skill-contract.test.ts` 至少断言：v2 必填字段缺一即拒绝、v1 返回 legacy 诊断、report template 与 SPEC 09 字段集一致、precedence 违规诊断稳定  
   **And** 每个新增静态门禁测试附带至少一个反向 mutant 用例（`A11-5` / `CR-TEST-09`）。

7. **Scope Boundary（范围边界）**

   本 Story 不修改 Flow Gate mode / result 枚举、判定规则、hook 事件集合、runner 命令路径或 Codex 输出协议；后三者归 Story 12.3。

### Threat Model & Non-Goals（威胁模型与非目标）

- Flow Gate report 面向**协作式本地文件系统**：report 作者是同一仓库的 Skill 运行时与开发者，不是对抗方。
- **In scope**：schemaVersion 与字段集一致性、legacy 拒绝、freshness 归属、precedence 顺序诊断。
- **Out of scope（明示）**：report 伪造 / 签名认证、审批历史重放、frontmatter 之外的 prose 解析、tracker 文件锁与并发写入。
- **CR 契约**：命中 out-of-scope 类别的 finding 归 `dismiss`，引用本章节即可。

### Dependency Gate（依赖门禁）

- 以当前 SPEC 09、`src/hooks/flow-gate-enforcement.ts`、installed runner 与 `speclite-flow-gate` 现有 canonical package 为约束。
- 不依赖 Story 12.2–12.4 或 Epic 13 任何 Story。

### Anchor Contract Map（锚点契约映射）

- **Contract**：SPEC 09 `Flow Gate Report Metadata` 与 `Flow Gate Hook Enforcement Artifacts`；retro `A11-3`。
- **Functional**：`src/hooks/flow-gate-enforcement.ts` metadata 校验、`assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs`、`speclite-flow-gate` report template。
- **Evidence**：focused tests、report fixture（v2 完整 / v2 缺字段 / v1 legacy）、docs 一致性 scan。
- **Guidance**：候选位置包括 SPEC 09 对应章节、`docs/reference/specs/flow-gate-handoff-contract.md`、`speclite-flow-gate` CHANGELOG；实际文件以实现时 current canonical source 为准。

### Equivalent Implementation Policy（等价实现策略）

允许调整 SPEC 09 章节组织、类型声明写法或诊断文本措辞，但不得改变 v2 字段集、v1 拒绝语义、precedence 顺序结论或"frontmatter 是唯一 parser source"约束。

### Evidence Plan（证据计划）

- 以 v2 完整 report fixture 证明 hook 放行；以逐字段缺失 mutant 证明 fail-close。
- 以 v1 report fixture 证明 legacy 拒绝诊断稳定。
- 以 tracker `done` 且无 completion PASS report 的 fixture 证明 precedence 诊断。
- 以 docs / canonical corpus scan 证明零 schemaVersion 冲突。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- **Primary FRs:** 无直接 PRD FR；本 Story 是 SPEC 09 lifecycle contract ownership 的 corrective closure。
- **Supporting NFRs:** `NFR14`、`NFR17`、`NFR17a`、`NFR28b`、`NFR32f`
- **UX / Contract Anchors:** SPEC 09 Flow Gate Report Metadata、SPEC 09 Flow Gate Hook Enforcement Artifacts、retro `A11-3` / `A11-5`

## Story 12.2: Fixture Write Failed Issue Ownership Closure（Fixture Write Failed Issue 归属收口）

作为维护 validation issue taxonomy 的 SpecLite 维护者，  
我希望 SPEC 07 中每个稳定 issue id 都有真实产出点、测试与 fixture，或被明确移除，  
以便公开文档 `docs/reference/validation-issues.md` 不再需要标注"当前无产出点"。

### Acceptance Criteria（验收标准）

1. **归属裁决二选一并记录**

   **Given** `artifact-path.fixture-write-failed` 只存在于 SPEC 07（zh / en）与 `src/validation/rules/artifact-path.ts` 类型联合  
   **When** 本 Story kickoff  
   **Then** 必须在 Story 文件 D1 决策表中记录裁决：**方案 A** 在 fixture writer（Story 6.x fixture contract 所属实现）中实现产出点；或 **方案 B** 从 SPEC 07 与类型联合中移除  
   **And** 裁决依据必须引用 SPEC 08 fixture contract 对 fixture 写入失败的现有处理方式。

2. **方案 A：实现产出点并 fail-close**

   **Given** 选择方案 A  
   **When** fixture writer 写入 expected outputs 失败  
   **Then** 必须产出 `artifact-path.fixture-write-failed`，severity、category、affected path 与 SPEC 07 一致  
   **And** 该 issue 必须进入 `CommandResult.issues` 排序规则，并有 focused test 与 negative fixture。

3. **方案 B：移除并留痕**

   **Given** 选择方案 B  
   **When** 更新 SPEC 07 zh / en  
   **Then** 必须从稳定 issue id 列表与 `ArtifactPathIssueId` 类型联合中移除  
   **And** SPEC 07 变更记录说明移除原因与日期；`docs/reference/validation-issues.md` 同步删除该行。

4. **公开文档与 SPEC 同步**

   **Given** 任一方案完成  
   **When** 执行 docs 一致性检查  
   **Then** `docs/reference/validation-issues.md` 不得再出现"仅在类型声明中保留，当前源码没有产出点"措辞  
   **And** SPEC 07 zh / en 两个版本 issue id 集合一致。

5. **Scope Boundary（范围边界）**

   本 Story 不新增其他 issue id，不改变 `artifact-path` category 下其余 issue 的 severity 或产出逻辑。

### Threat Model & Non-Goals（威胁模型与非目标）

- **In scope**：单一 issue id 的归属一致性。
- **Out of scope（明示）**：fixture writer 的其他失败模式、issue taxonomy 整体重构、severity 重排。
- **CR 契约**：命中 out-of-scope 类别的 finding 归 `dismiss`。

### Dependency Gate（依赖门禁）

- 以当前 SPEC 07、SPEC 08 与 `src/validation/rules/artifact-path.ts` 为约束。
- 不依赖 Epic 12 其他 Story 或 Epic 13。

### Anchor Contract Map（锚点契约映射）

- **Contract**：SPEC 07 issue taxonomy ownership（FR35b / FR35c）、SPEC 08 fixture contract。
- **Functional**：`src/validation/rules/artifact-path.ts`、fixture writer（方案 A）。
- **Evidence**：focused test + negative fixture（方案 A）或 SPEC / 类型 / docs 三处移除 diff（方案 B）。
- **Guidance**：`docs/reference/validation-issues.md`。

### Equivalent Implementation Policy（等价实现策略）

允许选择方案 A 或 B，但不得保留"类型有、产出无、文档标注无产出点"的第三状态。

### Evidence Plan（证据计划）

- 方案 A：以写入失败 fixture 证明 issue 产出且排序正确。
- 方案 B：以 grep scan 证明 SPEC 07 zh / en、类型联合、公开文档三处均无残留。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR35b`、`FR35c`
- **Supporting NFRs:** `NFR28b`、`NFR35b-10`
- **UX / Contract Anchors:** SPEC 07 issue identity、SPEC 08 fixture assertions

## Story 12.3: Hook Platform Contract Hardening（Hook 平台契约收口）

作为在 Claude Code 或 Codex 中使用已安装 SpecLite 的开发者，  
我希望 SpecLite 生成的 hook 命令能在会话工作目录不是项目根时仍被找到，且 runner 在 Codex 上只输出两家文档都定义了的字段，  
以便 Flow Gate 与 canonical source 提醒在两个平台上行为一致、不依赖未文档化的宽容行为。

### Gaps（缺口与证据）

| # | 现状 | 平台文档 | 证据 |
|---|---|---|---|
| G1 | hook 命令为相对路径 `node _speclite/hooks/<id>/runner.mjs ...` | Claude："Handlers run in the current directory"，示例推荐 `"$CLAUDE_PROJECT_DIR"/...`；Codex："Commands run with the session cwd"，无文档化的项目根变量 | `src/installer/hook-artifacts.ts`（`createClaudeHooks` / `createCodexHooks`） |
| G2 | Flow Gate 在 Codex 放行时输出 `{"decision":"allow","reason":...}` | Codex UserPromptSubmit 只定义 `decision:"block"` 与 Common output fields，`allow` 未文档化；"Exit 0 with no output is treated as success" | `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs`（`emitHookResult`） |
| G3 | canonical hook 在 Codex Stop 上输出 `hookSpecificOutput.additionalContext`，且只在 claude 分支检查 `stop_hook_active` | Codex Stop 只支持 Common output fields（`continue`、`stopReason`、`systemMessage`、`suppressOutput`）；`stop_hook_active` 两家都提供 | `assets/source/speclite/hooks/canonical-source-change-check/runner.mjs`（`isClaudeStopSummary`） |
| G4 | runner 在 `_speclite/config.toml` 缺失时的行为未被 actionable block 覆盖（`TODO-010`） | 两家平台都允许 `decision:"block"` + `reason` | `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` `TODO-010` |

### Acceptance Criteria（验收标准）

1. **Claude 命令使用项目根变量**

   **Given** installer 生成 `.claude/settings.json`  
   **When** 写入三个 hook 命令  
   **Then** 命令必须使用 `"$CLAUDE_PROJECT_DIR"/_speclite/hooks/<id>/runner.mjs` 形式  
   **And** 从项目子目录启动 Claude Code 时三个 hook 仍能执行。

2. **Codex 项目根解析方案经调研裁决**

   **Given** Codex 文档未定义项目根变量  
   **When** 本 Story 裁决 Codex 命令形态  
   **Then** 必须二选一并记录依据：使用 Codex 文档化的项目根变量（若存在）；或保留相对路径并在 `hook-manifest.json` 的 `trust_note` 与 `docs/reference/runtime-layout.md` 注明"须在项目根启动 Codex"  
   **And** 不得假设未文档化的变量。

3. **Codex 放行零输出**

   **Given** `--platform codex` 且 Flow Gate 判定放行  
   **When** `emitHookResult` 输出  
   **Then** 不输出 stdout、exit 0；阻断时保持 `{"decision":"block","reason"}` + exit 2  
   **And** claude 分支行为不变。

4. **Codex Stop 对称处理**

   **Given** `--platform codex` 的 Stop 事件  
   **When** canonical runner 输出  
   **Then** 只输出 `systemMessage`，不输出 `hookSpecificOutput`  
   **And** `stop_hook_active === true` 时两个平台都直接 exit 0；PostToolUse 两个平台仍输出 `hookSpecificOutput.additionalContext`。

5. **Recognized legacy shape（硬前置）**

   **Given** 既有安装持有相对路径形态的 hook 命令  
   **When** 执行 `update` / `update --repair`  
   **Then** `isRecognizedInstallerOwnedHookConfig` 必须把当前相对路径命令登记为 recognized legacy shape，使其被视为 installer-owned drift 并可修复  
   **And** 不得触发 `ide-mirror.hook-config-conflict`  
   **And** 本条必须先于 AC1 的命令形态变更落地，否则不得进入实现。

6. **Config 缺失时 actionable block（`TODO-010`）**

   **Given** runner 启动时 `_speclite/config.toml` 不存在或不可解析  
   **When** runner 决定输出  
   **Then** 必须返回 `decision:"block"` 与指向 `speclite install` / `speclite update --repair` 的 actionable `reason`，两个平台一致  
   **And** 不得静默放行或抛出未捕获异常。

7. **Focused tests 与 fixtures**

   **Given** 本 Story 实现完成  
   **When** 执行 focused test suite  
   **Then** `test/hook-artifact-install.test.ts`、`test/flow-gate-hook-runner.test.ts`、`test/canonical-source-change-check-hook.test.ts` 增加 codex 平台用例：放行零输出、阻断 exit 2、Stop 无 `hookSpecificOutput`、`stop_hook_active` 短路、legacy 命令升级、config 缺失 block  
   **And** `test/fixtures/fresh-install-empty-project/expected/**` 中含 hook 命令的 files-index / installed-state 文件与 `release/packaging-manifest.json` 同步刷新。

8. **Hook package 与公开文档同步**

   **Given** 两个 hook package 的 fragment 与 README  
   **When** 本 Story 完成  
   **Then** `claude-settings.fragment.json`、`codex-hooks.fragment.json`、`README.md` 与 `docs/reference/runtime-layout.md`、`docs/reference/canonical-source-layout.md` 同步  
   **And** 变更走 `speclite-check-canonical-source-change`。

9. **Scope Boundary（范围边界）**

   不改变 Flow Gate 判定规则、canonical hook 的 warning-only 语义、事件集合与 matcher。`Write|Edit|MultiEdit` matcher 中 `MultiEdit` 是否清理由本 Story 顺带裁决，但不作为验收项。

### Threat Model & Non-Goals（威胁模型与非目标）

- Hook runner 面向**协作式本地文件系统**：调用方是 Claude Code / Codex 本机进程，不是对抗方。
- **In scope**：命令路径可达性、两家平台文档化输出协议、legacy shape 识别、config 缺失 block。
- **Out of scope（明示）**：hook 配置被第三方篡改的认证、`$CLAUDE_PROJECT_DIR` 被恶意注入、Codex trust 流程本身、hook 超时调优。
- **CR 契约**：命中 out-of-scope 类别的 finding 归 `dismiss`。

### Dev Notes（开发备注）

- 平台事实（2026-09-15 原文核对）：Claude UserPromptSubmit stdin 字段为 `prompt`，顶层 `decision:"block"` 阻断并向用户展示 `reason`；Claude Stop 上的 `additionalContext` 会让对话继续，当前 claude 分支省略它是正确的，G3 只是把这一处理扩展到 codex。Claude UserPromptSubmit 默认超时 30 秒，Codex 600 秒。
- Claude 的 matcher 用 `RegExp.test` 做子串匹配，`Write|Edit|MultiEdit` 中 `Edit` 同时命中 `NotebookEdit`。
- G1 改动会改变 `.claude/settings.json` / `.codex/hooks.json` 的内容 hash，因此 AC5 是硬前置。

### Dependency Gate（依赖门禁）

- 以 SPEC 03 repair eligibility、SPEC 04 hook installed projection、SPEC 09 Flow Gate Hook Enforcement Artifacts 与两家平台 2026-09-15 版 hooks 文档为约束。
- 不依赖 Story 12.1 / 12.2 或 Epic 13；Story 12.4 依赖本 Story。

### Anchor Contract Map（锚点契约映射）

- **Contract**：SPEC 03 installer-owned drift / repair、SPEC 04 hook projection、SPEC 09 hook artifacts；平台 hooks 文档。
- **Functional**：`src/installer/hook-artifacts.ts` 命令生成与 legacy shape 识别、两个 runner 的 `emitHookResult` / Stop 分支、`src/hooks/flow-gate-enforcement.ts`（若逻辑在此镜像）。
- **Evidence**：三个 test 文件的 codex 用例、fresh-install fixture、packaging manifest。
- **Guidance**：`docs/reference/runtime-layout.md`、`docs/reference/canonical-source-layout.md`、hook package README。

### Equivalent Implementation Policy（等价实现策略）

允许调整 legacy shape 识别的实现位置或 runner 内部分支组织，但不得改变"Codex 放行零输出、阻断 exit 2、Stop 只输出 Common fields、legacy 命令可修复而非冲突"的可观测行为。

### Evidence Plan（证据计划）

- 以子目录 cwd 启动的 fixture 证明 Claude 命令可达。
- 以 codex 放行 / 阻断 / Stop / `stop_hook_active` 四组 stdin fixture 证明输出协议。
- 以持有旧命令的 existing-install fixture 证明 `update --repair` 修复而不冲突。
- 以缺失 `config.toml` fixture 证明 actionable block。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR36`、`FR39`、`FR41b`、`FR41c`
- **Supporting NFRs:** `NFR14`、`NFR17`、`NFR17a`、`NFR28b`、`NFR32f`
- **UX / Contract Anchors:** SPEC 03 repair eligibility、SPEC 04 hook installed projection、SPEC 09 Flow Gate Hook Enforcement Artifacts、`TODO-010`

## Story 12.4: Module-Scoped Canonical Source Hook Projection（按 Module 投影 Canonical Source Hook）

作为把 SpecLite 安装到普通业务项目的项目维护者，  
我希望 `canonical-source-change-check` hook 只在项目真正拥有 `assets/source/speclite/` protected surface 时才被投影，  
以便没有 canonical source 的项目不会在每次 Write / Edit / Stop 时启动 node 并执行 git 命令后静默退出。

### Acceptance Criteria（验收标准）

1. **投影条件经裁决并记录**

   **Given** `canonical-source-change-check` 当前随 `support` module 投影到所有目标项目  
   **When** 本 Story kickoff  
   **Then** 必须在 D1 决策表二选一并记录依据：**方案 A** 安装时检测 protected surface 存在才投影；或 **方案 B** 引入显式 opt-in（config 字段或 module 选择）  
   **And** 两种方案都必须保证 SpecLite 自身仓库（拥有 protected surface）的 fresh install 继续投影该 hook。

2. **未投影时 runtime 与 config 一致**

   **Given** hook 未被投影  
   **When** 检查安装结果  
   **Then** `.claude/settings.json` / `.codex/hooks.json` 不含该 hook 条目，`_speclite/hooks/canonical-source-change-check/` 不存在，`_speclite/config.toml` 不含其 runtime descriptor  
   **And** `status` / `validate` 不得把"未投影"报告为 drift 或 `ide-mirror` issue。

3. **Existing installs 视为 installer-owned drift**

   **Given** 既有安装已投影该 hook 但项目无 protected surface  
   **When** 执行 `update` / `update --repair`  
   **Then** 移除或保留必须作为 plan 中可见的 installer-owned action 呈现，不得静默删除  
   **And** 复用 Story 12.3 的 recognized legacy shape 机制，不得触发 `ide-mirror.hook-config-conflict`。

4. **Flow Gate hook 不受影响**

   **Given** `flow-gate-enforcement` 随 `sdlc` module 投影  
   **When** 本 Story 完成  
   **Then** Flow Gate hook 的投影条件、命令与事件不变。

5. **Fixtures 与 negative assertions**

   **Given** 本 Story 实现完成  
   **When** 执行 fixture gates  
   **Then** 至少有一个"无 protected surface"fresh-install fixture 断言零 hook 投影，一个"有 protected surface"fixture 断言投影存在  
   **And** `release/packaging-manifest.json` 与 `test/fixtures/**/expected/**` 同步刷新。

6. **公开文档同步**

   **Given** 投影条件已变  
   **When** 更新文档  
   **Then** `docs/reference/runtime-layout.md` hook 表格与 `docs/reference/canonical-source-layout.md` 注明投影条件  
   **And** 变更走 `speclite-check-canonical-source-change`。

7. **Scope Boundary（范围边界）**

   不改变 hook runner 的检查逻辑、warning-only 语义或事件集合；不改变 `support` module 的其他投影内容。

### Threat Model & Non-Goals（威胁模型与非目标）

- **In scope**：投影条件、未投影一致性、existing install 可见处置。
- **Out of scope（明示）**：protected surface 在安装后被创建 / 删除的自动重投影（由用户显式 `update` 触发即可）、hook 性能调优。
- **CR 契约**：命中 out-of-scope 类别的 finding 归 `dismiss`。

### Dependency Gate（依赖门禁）

- 必须以 Story 12.3 的 completion gate PASS 为前置；消费其 recognized legacy shape 机制。
- 以 SPEC 03 plan-before-write、SPEC 04 hook projection 为约束。

### Anchor Contract Map（锚点契约映射）

- **Contract**：SPEC 03 plan / repair、SPEC 04 installed projection、Epic 10 module selection guard。
- **Functional**：`src/installer/hook-artifacts.ts` `HOOK_REGISTRY` 投影条件、update plan。
- **Evidence**：有 / 无 protected surface 两组 fixture、existing-install repair fixture。
- **Guidance**：`docs/reference/runtime-layout.md`、`docs/reference/canonical-source-layout.md`。

### Equivalent Implementation Policy（等价实现策略）

允许选择方案 A 或 B，但不得改变"无 protected surface 项目零投影、SpecLite 自身仓库继续投影、existing install 处置可见"的可观测结果。

### Evidence Plan（证据计划）

- 以两组 fresh-install fixture 证明投影条件。
- 以 existing-install fixture 证明 update plan 可见且无 conflict。
- 以 `validate` 输出证明未投影不产生 drift issue。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR36`、`FR39`、`FR66`、`FR71a`
- **Supporting NFRs:** `NFR14`、`NFR28b`
- **UX / Contract Anchors:** SPEC 03 plan-before-write、SPEC 04 hook projection、Epic 10 selected-only projection guard
