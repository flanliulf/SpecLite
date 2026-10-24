# Epic 13: Governance Command Outcome-Oriented Human Output（治理命令 Outcome 导向人类输出）

项目维护者、工具链维护者与 AI IDE 使用者可以在 `init`、`list`、`doctor`、`sync`、`uninstall`、`governance-report` 六个 Post-MVP 治理命令上获得与 Epic 8 同一套 outcome-oriented、中文默认、可扫描、下一步明确的 human-readable output，并且 `validate` 的 Next Actions 只反映需要人处理的 severity，而不是 issue 列表的回声。

**实施范围：** Corrective planning Epic。来源为 `story-candidates-2026-09-13.md` 的 SC-1、SC-2 与 CR `TODO-011`。覆盖 `validate` nextActions 生成规则、六个治理命令的 `renderPresentationFrame` 迁移、`--locale` 支持、`Step State` 失败展示、`docs/reference/cli-human-output-matrix.md` 的 command/outcome 行、focused tests 与 human output fixtures。Epic 8 retro `A7-2` 对 Post-MVP 命令的排除到本 Epic 解除。

**MVP guard：** 本 Epic 只重构 human-readable presentation、message catalog 与 Next Actions 生成；不改变六个命令的 command core behavior、`CommandResult` JSON contract、exit code、issue ordering 或 fixture stable JSON comparison。`nextActions` 属于 `CommandResult` public 字段，其内容变更必须先在 SPEC 01 nextActions ordering 下确认为 compatible change，并同步 fixture expected outputs；`resolve artifact-documents --human` 与 `resolve cr-directory --human` 不在本 Epic 范围。

**覆盖 FR / NFR / UX：** FR35a, FR35b, FR72, FR73, FR74, FR75, FR76, FR78, NFR35b, NFR35b-11, NFR35b-12, NFR35b-13, NFR35b-14, UX-DR1, UX-DR2, UX-DR5, UX-DR9, UX-DR10, UX-DR11, UX-DR13

## Dependency / Sequencing（依赖与顺序）

Epic 13 按 Story 13.1 → 13.2 → 13.3 strict serial 执行：

- Story 13.1 先在 `validate` 上建立 severity-aware Next Actions 生成规则，作为后续两个 Story 的 Next Actions 参照模式。
- Story 13.2 迁移三个只读命令（`doctor`、`list`、`governance-report`），只涉及 Diagnostic / Report-Support profile，不触碰写入语义。
- Story 13.3 迁移三个写入型命令（`init`、`sync`、`uninstall`），复用 Story 13.2 建立的迁移模式并补齐 `Step State`（`TODO-011`）。
- Epic 13 与 Epic 12 无代码级依赖，可并行。

## Story 13.1: Severity-Aware Validate Next Actions（按 Severity 生成的 Validate Next Actions）

作为在 fresh install 后立即运行 `speclite validate` 的项目维护者，  
我希望 Next Actions 只列出需要我处理的事项，  
以便我不会因为 20 余条针对 `info` 级 `not-yet-produced` 的提示和一条与实际 issue 无关的 manifest-schema 提示而误判安装失败。

### Acceptance Criteria（验收标准）

1. **`info` 级 issue 不产生 Next Actions**

   **Given** `validate` 结果只含 `info` 级 issue（例如 `artifact-path.missing-required-artifact` 的 `not-yet-produced` 两态）  
   **When** 生成 `CommandResult.nextActions`  
   **Then** 不得为这些 issue 生成任何 Next Action  
   **And** 输出与无 issue 情况等价的"无需处理"下一步。

2. **按最高 severity 与 category 生成**

   **Given** `validate` 结果含 `warning` / `error` / `critical` issue  
   **When** 生成 nextActions  
   **Then** 必须按 SPEC 01 priority order（blocking remediation → recommended next step → optional exploration）输出，且每条 Next Action 对应至少一个实际存在的 issue category  
   **And** `manifest-schema` 相关提示只在存在该 category 的 issue 时出现。

3. **zh-CN renderer 不逐条回声**

   **Given** human output locale 为 `zh-CN`  
   **When** 渲染 Next Actions section  
   **Then** 不得为每条 issue 追加一行"检查 …"回声；Next Actions 数量必须与 `CommandResult.nextActions` 一致  
   **And** issue 明细继续留在 `Issues` section。

4. **JSON contract 兼容**

   **Given** `nextActions` 是 `CommandResult` public 字段  
   **When** 生成规则变更  
   **Then** 必须先在 Story 文件 D1 决策表确认为 `speclite.command-result.v1` 内的 compatible change  
   **And** `test/fixtures/**/expected/**` 中受影响的 validate expected outputs 同步刷新，`CommandResult.schemaVersion` 不变。

5. **Focused tests 与 human output matrix**

   **Given** 本 Story 实现完成  
   **When** 执行 focused test suite  
   **Then** `test/validate-command.test.ts` 至少覆盖：pristine fresh install 零 Next Action、仅 `info` 零 Next Action、`warning` 单条、`error` + `manifest-schema` 组合、多 category 排序  
   **And** `docs/reference/cli-human-output-matrix.md` 增加 pristine install 用例行。

6. **Scope Boundary（范围边界）**

   不改变 `validate` 的检查规则、issue 产出、severity 定义或 `issueCounts`；不触碰 `status` 的 nextActions。

### Threat Model & Non-Goals（威胁模型与非目标）

- **In scope**：nextActions 生成规则与 renderer 的一致性。
- **Out of scope（明示）**：issue severity 重新分级、message catalog 结构重构。
- **CR 契约**：命中 out-of-scope 类别的 finding 归 `dismiss`。

### Dependency Gate（依赖门禁）

- 以 SPEC 01 nextActions ordering、SPEC 07 severity 语义、Story 8.4 / 8.6 已建立的 validate human output 为约束。
- 不依赖 Epic 12 任何 Story。

### Anchor Contract Map（锚点契约映射）

- **Contract**：SPEC 01 `nextActions` priority order（NFR35b-11）、SPEC 07 severity。
- **Functional**：`src/diagnostics/command-result.ts` `createValidateCommandResult` nextActions 生成、`src/diagnostics/output.ts` validate zh-CN renderer。
- **Evidence**：`test/validate-command.test.ts`、validate fixture expected outputs、human output matrix 行。
- **Guidance**：`docs/reference/cli-human-output-matrix.md`、`docs/reference/cli.md` Output Modes。

### Equivalent Implementation Policy（等价实现策略）

允许调整 nextActions 生成的内部 helper 或 category → action 映射表位置，但不得改变"`info` 零 Next Action、manifest-schema 提示条件化、renderer 不回声"的可观测行为。

### Evidence Plan（证据计划）

- 以 pristine fresh-install fixture 证明零 Next Action。
- 以逐 severity fixture 证明生成规则与排序。
- 以 zh-CN / en-US 双 locale 快照证明数量一致且无回声。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR35a`、`FR35b`
- **Supporting NFRs:** `NFR35b`、`NFR35b-11`、`NFR35b-13`、`NFR35b-14`
- **UX / Contract Anchors:** `UX-DR1`、`UX-DR10`、`UX-DR13`、SPEC 01 nextActions ordering

## Story 13.2: Read-Only Governance Command Outcome Output（只读治理命令 Outcome 输出）

作为运行 `doctor`、`list` 或 `governance-report` 的工具链维护者与规范负责人，  
我希望这三个只读命令输出与 `status` / `validate` / `resolve --human` 同样的 `Outcome（结果）` frame，  
以便我能一眼判断"这是只读诊断 / 报告，没有写入"，并知道下一步。

### Acceptance Criteria（验收标准）

1. **迁移到 presentation frame**

   **Given** `doctor`（Diagnostic profile）、`list` 与 `governance-report`（Report-Support profile）的 profile 映射已在 `HUMAN_OUTPUT_PRESENTATION_PROFILES` 定义  
   **When** 渲染 human output  
   **Then** 三个命令必须走 `renderPresentationFrame`，输出 `Outcome（结果）` frame 与 profile-specific section  
   **And** 不得再以 `Status:` 开头输出 legacy human output。

2. **只读语义可扫描**

   **Given** 三个命令均不写入  
   **When** 渲染 `State` 或等价 section  
   **Then** 必须明确表达只读 / 无写入（`PresentationWriteState` 为 `none`），不得输出空洞的 `State` section。

3. **`--locale` 支持**

   **Given** 用户传入 `--locale zh-CN` 或 `--locale en-US`  
   **When** 渲染  
   **Then** 三个命令必须通过 message catalog 渲染，默认 `zh-CN`、fallback `en-US`  
   **And** locale 不得改变 `CommandResult` JSON、exit code 或 issue ordering（NFR35b-14）。

4. **Outcome 枚举与 Next Actions**

   **Given** 每个命令的可观测结果集合  
   **When** 定义 human outcome  
   **Then** 必须为每个命令声明有限的 outcome 枚举（例如 `doctor` 的 healthy / issues-found / environment-blocked），并按 Story 13.1 建立的 severity-aware 规则生成 Next Actions。

5. **JSON contract 不变**

   **Given** 本 Story 只改 presentation  
   **When** 对比 `--json` 输出  
   **Then** `CommandResult` 与 command-specific data 逐字段不变，fixture stable JSON comparison 通过。

6. **Human output matrix 与 tests**

   **Given** 本 Story 实现完成  
   **When** 更新文档与测试  
   **Then** `docs/reference/cli-human-output-matrix.md` 为三个命令新增 command/outcome 行，并移除"映射已定义，renderer 未迁移"标注  
   **And** `test/doctor-command.test.ts`、`test/list-command.test.ts`、`test/governance-report-command.test.ts` 增加 human output focused tests，覆盖每个 outcome 与双 locale。

7. **Scope Boundary（范围边界）**

   不改变三个命令的 core behavior、data payload 或 issue 产出；不触碰 `init` / `sync` / `uninstall`。

### Threat Model & Non-Goals（威胁模型与非目标）

- **In scope**：presentation frame、locale、outcome 枚举、Next Actions。
- **Out of scope（明示）**：颜色策略调整、终端宽度适配、`resolve artifact-documents` / `resolve cr-directory` human output。
- **CR 契约**：命中 out-of-scope 类别的 finding 归 `dismiss`。

### Dependency Gate（依赖门禁）

- 必须以 Story 13.1 completion gate PASS 为前置。
- 以 Story 8.1 shared frame、Story 8.8 profiles、Story 8.9 layout / color 为约束。

### Anchor Contract Map（锚点契约映射）

- **Contract**：SPEC 01 command result boundaries、NFR35b-12 / 13 / 14、UX-DR1 / 2 / 5 / 9 / 10 / 11。
- **Functional**：`src/diagnostics/output.ts` 三个 renderer、message catalog entries。
- **Evidence**：三个 test 文件的 human output 用例、human output matrix 行。
- **Guidance**：`docs/reference/cli.md` Output Modes、`docs/reference/cli-human-output-matrix.md`。

### Equivalent Implementation Policy（等价实现策略）

允许调整 section 命名或 renderer 内部拆分，但不得改变"走 presentation frame、只读语义可扫描、locale 可切换、JSON 不变"的可观测行为。

### Evidence Plan（证据计划）

- 以每个 outcome 的 zh-CN / en-US 快照证明 frame 与 section。
- 以 `--json` 前后 diff 证明零 JSON 变化。
- 以 docs scan 证明 matrix 行完整且无"未迁移"残留。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR73`、`FR74`、`FR78`
- **Supporting NFRs:** `NFR35b`、`NFR35b-12`、`NFR35b-13`、`NFR35b-14`
- **UX / Contract Anchors:** `UX-DR1`、`UX-DR2`、`UX-DR5`、`UX-DR9`、`UX-DR10`、`UX-DR11`、Diagnostic / Report-Support profiles

## Story 13.3: Mutating Governance Command Outcome Output（写入型治理命令 Outcome 输出）

作为运行 `init`、`sync` 或 `uninstall` 的项目维护者，  
我希望这三个写入型命令输出与 `install` / `update` 同样的 Operation profile frame，并在失败时展示 `Step State`，  
以便我能清楚区分"计划待授权 / 已写入 / 写入失败在哪一步 / conflict"，而不是误判"未写入"或"写入失败"。

### Acceptance Criteria（验收标准）

1. **迁移到 Operation profile frame**

   **Given** `init`、`sync`、`uninstall` 的 Operation profile 映射已定义  
   **When** 渲染 human output  
   **Then** 三个命令必须走 `renderPresentationFrame`，输出 `Summary`、`Scope`、`State / Authorization`、`Plan / Evidence`、`Issues / Conflicts`、`Next Actions`  
   **And** 不得再以 `Status:` 开头输出 legacy human output。

2. **写入边界可扫描**

   **Given** 每个命令的 plan-before-write、已写入、conflict、失败结果  
   **When** 渲染 `State / Authorization`  
   **Then** `PresentationWriteState` 必须准确反映 `auto` / `changed` / `none`，与 `install` / `update` 的语义一致。

3. **失败时展示 `Step State`（`TODO-011`）**

   **Given** `sync` 或 `uninstall` 在某一步失败，data 已携带 `completedSteps`、`failedStep`、`pendingSteps`  
   **When** 渲染 human output  
   **Then** 必须输出与 `update` renderer 等价的 `Step State` block（`Completed steps` / `Failed step` / `Pending steps`）  
   **And** 覆盖 `sync` safe-write failure 与 `uninstall` remove failure 两种场景。

4. **`--locale` 支持**

   **Given** 用户传入 `--locale`  
   **When** 渲染  
   **Then** 三个命令通过 message catalog 渲染，默认 `zh-CN`、fallback `en-US`，locale 不改变 JSON / exit code。

5. **Outcome 枚举与 Next Actions**

   **Given** 每个命令的可观测结果集合  
   **When** 定义 human outcome  
   **Then** 必须声明有限 outcome 枚举（至少含 plan-ready / prewrite-paused / write-failed / completed / conflict 中适用者），并按 Story 13.1 规则生成 Next Actions。

6. **JSON contract 不变**

   **Given** 本 Story 只改 presentation  
   **When** 对比 `--json` 输出  
   **Then** `CommandResult` 与 command-specific data 逐字段不变，fixture stable JSON comparison 通过。

7. **Human output matrix 与 tests**

   **Given** 本 Story 实现完成  
   **When** 更新文档与测试  
   **Then** `docs/reference/cli-human-output-matrix.md` 为三个命令新增 command/outcome 行，Presentation Profiles 表格与 Note 移除全部"未迁移"表述  
   **And** `test/init-command.test.ts`、`test/sync-command.test.ts`、`test/uninstall-command.test.ts` 增加 human output focused tests，覆盖每个 outcome、失败 `Step State` 与双 locale  
   **And** `TODO-011` 在 CR TODO backlog 标记 resolved 并引用本 Story。

8. **Scope Boundary（范围边界）**

   不改变三个命令的 core behavior、plan / lock / safe-write 逻辑、data payload 或 issue 产出。

### Threat Model & Non-Goals（威胁模型与非目标）

- **In scope**：presentation frame、写入边界表达、`Step State`、locale、outcome 枚举。
- **Out of scope（明示）**：safe-write / lock 实现本身、`uninstall` 保护范围调整、颜色策略。
- **CR 契约**：命中 out-of-scope 类别的 finding 归 `dismiss`。

### Dependency Gate（依赖门禁）

- 必须以 Story 13.2 completion gate PASS 为前置，复用其迁移模式。
- 以 Story 8.2 / 8.3 install & update outcome output、SPEC 03 plan-before-write 为约束。

### Anchor Contract Map（锚点契约映射）

- **Contract**：SPEC 01 command result boundaries、SPEC 03 plan / safe write、NFR35b-12 / 13 / 14、UX-DR1 / 2 / 5 / 9 / 10 / 11。
- **Functional**：`src/diagnostics/output.ts` `renderSyncHumanOutput` / `renderUninstallHumanOutput` / init renderer、message catalog entries。
- **Evidence**：三个 test 文件的 human output 与 `Step State` 用例、human output matrix 行。
- **Guidance**：`docs/reference/cli.md` Output Modes、`docs/reference/cli-human-output-matrix.md`、`TODO-011`。

### Equivalent Implementation Policy（等价实现策略）

允许复用或抽取 `update` 的 `Step State` renderer，但不得改变"Operation frame、写入边界可扫描、失败展示 Step State、JSON 不变"的可观测行为。

### Evidence Plan（证据计划）

- 以每个 outcome 的双 locale 快照证明 frame。
- 以 `sync` safe-write failure 与 `uninstall` remove failure fixture 证明 `Step State`。
- 以 `--json` 前后 diff 证明零 JSON 变化。
- 以 docs scan 证明 matrix 无"未迁移"残留。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR72`、`FR75`、`FR76`
- **Supporting NFRs:** `NFR35b`、`NFR35b-12`、`NFR35b-13`、`NFR35b-14`
- **UX / Contract Anchors:** `UX-DR1`、`UX-DR2`、`UX-DR5`、`UX-DR9`、`UX-DR10`、`UX-DR11`、Operation profile、`TODO-011`
