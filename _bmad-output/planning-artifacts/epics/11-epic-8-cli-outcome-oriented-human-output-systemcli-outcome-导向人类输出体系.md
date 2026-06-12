# Epic 8: CLI Outcome-Oriented Human Output System（CLI Outcome 导向人类输出体系）

SpecLite 的核心体验不是单个命令是否执行成功，而是用户运行命令后能否马上理解：当前发生了什么、有没有写入项目文件、为什么停在这里、风险在哪里、下一步应该运行什么命令。本 Epic 将 `install`、`update`、`update --repair`、`status`、`validate`、`resolve config` 和 `resolve customization` 的 human-readable output 统一到一套 outcome-oriented presentation system 中，确保每个命令都使用人类友好的结构化信息，同时保持 `--json` contract、exit code、issue ordering、path normalization 和 fixture stable comparison 不变。

本 Epic 是 corrective planning Epic。它不新增 GUI、不新增交互式 TUI、不改变 command core behavior、不把 human-readable 文案变成 automation contract。它只重构 CLI 输出语义、组织形式、i18n message catalog、Next Actions 和测试覆盖，让所有 CLI 命令共享一套清晰、可验证、可本地化的输出体验。

## Product Problem（产品问题）

当前 CLI 输出存在底层一致性问题：部分 human-readable renderer 直接复述内部 `CommandResult.status`、`completedSteps`、`pendingSteps` 或英文 `nextActions`，但没有先给用户一个明确 outcome。典型症状包括：

- 非 `--yes` 的 `speclite install <target>` 实际未安装、未写入，却展示 `Install result（安装结果）` 和“install 已完成当前阶段”，用户难以判断这只是写入前暂停。
- `Next Actions（下一步）` 仍可能透传英文内部字符串，破坏默认中文输出和 i18n 体验。
- `install` 的 Ready Summary 已开始区分 `default-no-prompt` 与 `explicit-interactive`，但普通 install result、blocked result 和 failure result 还没有同等的 outcome model。
- `update`、`status`、`validate`、`resolve` 各自拼装输出，缺少共享的 title、summary、state、issues、next actions 和 empty-state 规范。

## Product Thesis（产品主张）

每个 CLI command 都必须先回答用户的五个问题：

1. 本次命令做了什么？
2. 有没有写入或准备写入项目文件？
3. 当前 outcome 是什么？
4. 如果有问题，原因、影响和安全边界是什么？
5. 下一步应该运行什么命令或人工检查什么路径？

## Scope（范围）

本 Epic 覆盖当前 CLI 命令面：

- `speclite install`
- `speclite update`
- `speclite update --repair`
- `speclite status`
- `speclite validate`
- `speclite resolve config`
- `speclite resolve customization`

本 Epic 不覆盖：

- Post-MVP 新命令，如 `doctor`、`sync`、`uninstall`、`init`、`list`。
- `CommandResult` JSON public data shape 的非兼容变更。
- 新增 browser / desktop UI。
- 新增 spinner-only progress、interactive TUI framework 或 long-running daemon。
- 自动修复范围外 fixture drift、source freshness 或远程 provenance。

## Shared Output Frame（共享输出框架）

所有 human-readable command output 必须使用稳定结构。不同命令可裁剪栏目，但栏目语义必须一致。

```text
<command>: <outcome label>（中文 outcome）

Summary（摘要）
<1-3 行人类结论，先说有没有写入、是否完成、是否需要动作>

Scope（范围）
<target / projectRoot / source / checked area / resolve key 等>

State（状态）
<command-specific outcome、health、checked categories、plan state、write authorization>

Evidence（证据）
<paths / targets / planned effects / completed steps / checked items>

Issues（问题）
<severity、category、issue id、affected path、impact、suggested next step>

Next Actions（下一步）
<本地化、按优先级排序、可直接执行或可人工检查的动作>
```

## Outcome Taxonomy（Outcome 分类）

Outcome 不应全 CLI 共用一套枚举，而应按 command 分组。共享的是输出框架和生成规则。

### Install Outcomes（Install Outcome）

| Outcome | 用户语义 |
|---|---|
| `prewrite-paused` | 尚未安装，未写入，等待用户用 `--yes` 或 `--interactive` 授权继续 |
| `blocked-before-write` | 写入前检查失败，未写入，需要先修复 blocker |
| `write-failed` | 已进入写入阶段但失败，需要处理写入阶段 blocker |
| `ready-check-failed` | 已写入部分或全部安装内容，但本地就绪检查失败 |
| `ready` | 已安装并通过 ReadyCheck |

### Update / Repair Outcomes（Update / Repair Outcome）

| Outcome | 用户语义 |
|---|---|
| `plan-ready` | 已生成 update plan，尚未写入，等待 `--yes` |
| `repair-plan-ready` | 已生成 repair plan，尚未写入，等待 `--yes` |
| `no-op` | 当前状态无需更新或修复 |
| `blocked-by-conflict` | 存在 conflict，普通授权不可继续 |
| `applied` | 已执行无 conflict planned writes |
| `partial-or-failed` | 写入或 repair 执行失败，需要人工处理 |

### Status Outcomes（Status Outcome）

| Outcome | 用户语义 |
|---|---|
| `installed` | 已读取到安装状态，high-level health 可解释 |
| `not-installed` | 未安装或缺少安装跟踪事实 |
| `stale` | 有安装痕迹但状态过期或不一致 |
| `partial` | 安装状态部分存在但不完整 |
| `failed` | 安装状态明确失败或不可用 |
| `unknown` | 证据不足，无法判断 |

### Validate Outcomes（Validate Outcome）

| Outcome | 用户语义 |
|---|---|
| `valid` | 校验通过，无阻塞问题 |
| `valid-with-warnings` | 校验通过但存在 warning / info |
| `invalid` | 存在 error / critical issue |
| `cannot-validate` | 缺少 manifest、schema、source evidence 或其他前置条件 |

### Resolve Outcomes（Resolve Outcome）

| Outcome | 用户语义 |
|---|---|
| `resolved` | config/customization 解析成功 |
| `resolved-with-warnings` | 解析成功但存在 fallback、optional layer warning 或兼容提示 |
| `unresolved` | 解析失败，无法返回请求值 |
| `invalid-input` | 输入 key、project root 或 resolver 参数不合法 |

## Story 8.1: Shared CLI Outcome And Presentation Contract（共享 CLI Outcome 与展示契约）

作为 CLI 用户，
我希望所有 SpecLite 命令都使用一致的 outcome、摘要、证据和下一步结构，
以便无论运行哪个命令，都能快速判断当前状态、写入边界和下一步动作。

**验收标准：**

**前提** 任一 CLI command 生成 human-readable output
**当** 输出被渲染
**则** 必须包含 command title、outcome label、Summary 和 Next Actions
**并且** Summary 必须先回答本次是否完成、是否写入、是否需要用户动作。

**前提** command 输出涉及路径、issue、target、schema、step 或 JSON field
**当** human-readable output 使用中文 locale
**则** 自然语言说明必须中文化
**并且** command name、flag、path、issue id、schema id、step id、target id 和 JSON field 不得本地化。

**前提** command 输出需要展示空状态
**当** 无 issues、无 conflicts、无 planned writes 或无 checked items
**则** 必须显示明确 empty state，例如 `无问题`、`无 conflict`、`未写入项目文件`
**并且** 不得用空白区域让用户猜测。

**前提** human-readable output 与 `--json` 同时存在
**当** 两者表达同一 command result
**则** 必须共享 status、issue、path、next action、severity 和 sorting semantics
**并且** human-readable 文案不得成为 automation 的唯一信息来源。

## Story 8.2: Install Outcome-Oriented Output（Install Outcome 导向输出）

作为首次安装 SpecLite 的项目维护者，
我希望 `speclite install` 在未写入、被阻止、写入失败、ReadyCheck 失败和安装就绪时展示不同的人类 outcome，
以便我不会把预览、暂停或失败误认为已经安装完成。

**验收标准：**

**前提** 用户执行 `speclite install <target>` 且未传入 `--yes`
**当** 命令在写入前暂停
**则** 输出 outcome 为 `prewrite-paused`
**并且** Summary 明确说明“本次尚未执行安装，也没有写入任何项目文件”
**并且** Next Actions 同时给出默认安装命令 `speclite install <target> --yes` 与自定义安装命令 `speclite install <target> --interactive`。

**前提** source、target 或 package evidence 在写入前 blocked
**当** `install` 停止
**则** 输出 outcome 为 `blocked-before-write`
**并且** Summary 明确说明未写入
**并且** Next Actions 优先提示修复 blocker，而不是直接诱导用户追加 `--yes`。

**前提** `install --yes` 进入写入阶段后失败
**当** runtime structure、IDE mirror、manifest/index 或 safe write 阶段失败
**则** 输出 outcome 为 `write-failed`
**并且** 必须展示 failed step、已完成写入范围、pending steps 和人工检查动作。

**前提** `install --yes` 已写入但 ReadyCheck failed
**当** local readiness blocker 存在
**则** 输出 outcome 为 `ready-check-failed`
**并且** 明确说明项目不能视为 ready
**并且** Next Actions 引导用户修复 readiness blocker 后重新运行 `speclite install --yes` 或 `speclite validate`。

**前提** `install --yes` 或 `install --yes --interactive` 成功并通过 ReadyCheck
**当** 输出 Ready Summary
**则** outcome 为 `ready`
**并且** 默认 no-prompt 与 explicit interactive 的文案必须准确区分
**并且** 不得新增未契约化 public JSON 字段。

## Story 8.3: Update And Repair Outcome-Oriented Output（Update 与 Repair Outcome 导向输出）

作为项目维护者，
我希望 `speclite update` 和 `speclite update --repair` 清楚区分计划、授权、conflict、no-op、已执行和失败，
以便我能安全更新 installer-owned 文件，同时保护 human-owned 和 workflow-owned 内容。

**验收标准：**

**前提** 用户运行 `speclite update` 且未传入 `--yes`
**当** 系统生成 unapplied update plan
**则** outcome 为 `plan-ready`
**并且** Summary 明确说明尚未写入
**并且** Next Actions 说明可用 `speclite update <target> --yes` 授权无 conflict planned writes。

**前提** update plan 没有 changed paths
**当** 系统判断无需更新
**则** outcome 为 `no-op`
**并且** 输出应明确 `No planned writes` 或等价中文 empty state。

**前提** update 或 repair 存在 conflicts
**当** 输出 human-readable result
**则** outcome 为 `blocked-by-conflict`
**并且** conflict、protected paths、ownership 和 reason 必须可见
**并且** 不得提示用户用普通 `--yes` 绕过 conflict。

**前提** 用户运行 `speclite update --repair` 且未传入 `--yes`
**当** 系统生成 repair plan
**则** outcome 为 `repair-plan-ready`
**并且** Summary 明确 repair 是显式恢复动作，不是普通 update 的隐藏模式。

**前提** update 或 repair 已执行写入
**当** 输出 applied result
**则** outcome 为 `applied`
**并且** changed、skipped、conflicts、protected boundaries 和 next validation action 必须可见。

## Story 8.4: Status And Validate Human Output Separation（Status 与 Validate 人类输出分层）

作为工具链维护者，
我希望 `status` 保持轻量方向感，`validate` 提供完整诊断，
以便用户不会把 status 当成弱化版 validate，也不会被 validate 的细节淹没。

**验收标准：**

**前提** 用户运行 `speclite status`
**当** 系统读取 installed-state summary
**则** 输出 outcome 必须来自 `installed`、`not-installed`、`stale`、`partial`、`failed` 或 `unknown`
**并且** Summary 应优先展示 high-level health、source/version、IDE target summary 和下一步建议。

**前提** `status.data.highLevelHealth` 为 `not-configured`、`partial` 或 `failed`
**当** `CommandResult.status` 仍为 success
**则** human-readable output 不得把命令成功误写成安装健康通过
**并且** 必须通过 outcome 和 Next Actions 解释状态含义。

**前提** 用户运行 `speclite validate`
**当** validation 完成
**则** 输出 outcome 必须来自 `valid`、`valid-with-warnings`、`invalid` 或 `cannot-validate`
**并且** issue counts、checked categories、checked targets、validated paths 和 issue list 必须按 canonical order 展示。

**前提** validate 存在 error 或 critical issue
**当** 输出 Next Actions
**则** 必须优先展示具体修复动作或下一条诊断命令
**并且** 不得只输出泛化的“检查配置”。

## Story 8.5: Resolve Command Support Output（Resolve 命令支持输出）

作为已安装 skill 或调试 runtime 的维护者，
我希望 `speclite resolve config` 和 `speclite resolve customization` 输出清楚说明解析成功、fallback、warning 或失败原因，
以便定位配置合并和 customization lookup 问题。

**验收标准：**

**前提** resolve config/customization 成功
**当** 输出 human-readable result
**则** outcome 为 `resolved`
**并且** 输出必须展示 requested key、resolved layer、source path 和 value summary。

**前提** resolver 使用 fallback 或 optional layer 失败但仍能返回结果
**当** 输出 human-readable result
**则** outcome 为 `resolved-with-warnings`
**并且** warning 必须指出 fallback 来源和用户可检查的路径。

**前提** resolver 无法返回请求值
**当** 输出 human-readable result
**则** outcome 为 `unresolved`
**并且** Issues 必须包含 reason、missing key 或 failed layer。

**前提** 用户传入非法 key、非法 project root 或不支持的 resolver 参数
**当** 命令停止
**则** outcome 为 `invalid-input`
**并且** Next Actions 必须说明合法命令形态。

## Story 8.6: Localized Next Actions And Message Catalog（本地化 Next Actions 与消息目录）

作为中文默认用户，
我希望所有 CLI 输出的说明和下一步动作都使用中文，同时保留英文技术标识，
以便我不用在中英文混杂的输出中猜测下一步。

**验收标准：**

**前提** 任一 human-readable command 使用默认 locale
**当** 输出 Summary、Authorization、Issues 或 Next Actions
**则** 自然语言必须使用 `zh-CN` catalog
**并且** 不得直接透传英文内部 `nextActions`。

**前提** 用户通过 `--locale en-US` 或环境变量指定英文
**当** 命令渲染 human-readable output
**则** 使用 `en-US` fallback catalog
**并且** 不改变 `CommandResult` JSON、exit code、issue ordering 或 path normalization。

**前提** Next Actions 需要展示命令
**当** 生成命令建议
**则** 命令必须包含目标路径占位或实际 display path
**并且** 应按安全优先级排序：先修 blocker，再授权写入，再运行 validate/status。

**前提** issue 有 `suggestedNextStep`
**当** 渲染本地化 Next Actions
**则** 可以使用 issue id / category 映射为本地化文案
**并且** 不得丢失原始 reason code 或 affected path。

## Story 8.7: Human Output Fixture And Documentation Matrix（人类输出 Fixture 与文档矩阵）

作为 SpecLite 维护者，
我希望每个 CLI command 的关键 outcome 都有 focused tests、fixture 或文档示例覆盖，
以便后续文案调整不会重新引入不可读、误导或未本地化输出。

**验收标准：**

**前提** 实现任一 command outcome renderer
**当** 修改 human-readable output
**则** 必须补充 focused test 覆盖对应 outcome、Summary、write state、Issues 和 Next Actions。

**前提** 命令支持 `--json`
**当** human-readable output 修改
**则** 必须验证 JSON output 未新增未契约字段
**并且** fixture stable JSON comparison 不受 locale、TTY、terminal width 或颜色影响。

**前提** `NO_COLOR`、non-TTY、CI 或窄终端运行
**当** 渲染 human-readable output
**则** 不得依赖 ANSI escape、颜色、图标或动态覆盖行表达唯一语义
**并且** 窄终端必须能降级为 key-value block。

**前提** docs 示例展示 CLI 输出
**当** quick-start、reference 或 troubleshooting 文档引用命令
**则** 示例必须与 outcome vocabulary 和实际 renderer 一致
**并且** 不得把只读命令、预览命令和写入命令混为同一步。

## Implementation Order（实施顺序）

1. 先实现 Story 8.1，共享 outcome/presentation contract 和本地化 Next Actions 基础设施。
2. 再实现 Story 8.2，优先修正 `install` 的 prewrite pause / blocked / failure / ready 分支。
3. 再实现 Story 8.3，统一 `update` 与 `update --repair` 的计划、授权、conflict 和 applied 输出。
4. 再实现 Story 8.4，让 `status` 和 `validate` 保持职责分离。
5. 再实现 Story 8.5，补齐 `resolve` 支持命令的人类输出。
6. 最后实现 Story 8.6 / 8.7，收敛 message catalog、Next Actions、本地化测试、fixture 和文档示例。

## Success Metrics（成功指标）

- 每个当前 CLI command 至少有一个明确 outcome vocabulary。
- 每个写入型命令都能明确展示 `projectFilesWritten` 或等价写入状态。
- 所有默认中文 human-readable output 的自然语言均来自 `zh-CN` catalog。
- 所有 Next Actions 都是本地化、命令特定、按安全优先级排序的动作。
- `--json` output、exit code、issue ordering、path normalization 和 fixture stable comparison 不因 human-readable 重构而改变。
- 所有关键 outcome 都有 focused tests 或 fixture/docs 示例覆盖。
