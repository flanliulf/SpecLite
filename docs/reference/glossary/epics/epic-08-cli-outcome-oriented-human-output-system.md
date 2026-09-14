# Epic 8: CLI Outcome-Oriented Human Output System Glossary（CLI Outcome 导向人类输出体系术语表）

本文解释 Epic 8「CLI Outcome-Oriented Human Output System」中的英文组合术语，帮助 CLI 用户和维护者理解 outcome、presentation profile、section semantics、Next Actions、本地化与可扫描布局。

> Note: 本文解释的是 Epic 8 规划文档中的术语语义。Epic 8 是 corrective planning Epic；术语定义不表示某个 renderer 分支已经实现或通过当前验证。

## Outcome-Oriented Output（Outcome 导向输出）

| Term | 中文直译 | Definition |
|---|---|---|
| **outcome-oriented human output** | Outcome 导向的人类输出 | 先告诉用户命令产生了什么结果、是否写入、为何停止及下一步，而不是只复述内部 status 或 step fields。 |
| **command outcome** | 命令结果 | 从用户任务角度描述命令当前结果的稳定标签，例如安装暂停、计划已就绪或验证失败。 |
| **outcome label** | 结果标签 | Human-readable header 中展示的 command-specific outcome 名称。它不替代 `CommandResult.status`。 |
| **outcome taxonomy** | 结果分类 | 按 command 分组定义的 outcome vocabulary；不同命令不强行共用一套枚举。 |
| **corrective planning Epic** | 纠正式规划 Epic | 修正既有体验和 contract 表达的规划范围，不新增 GUI/TUI 或改变 command core behavior。 |
| **write-state clarity** | 写入状态清晰度 | Output 明确区分未写入、准备写入、已写入、部分写入和只读。 |
| **user-action requirement** | 用户操作需求 | Summary 明确说明用户是否需要授权、修复 blocker、检查路径或继续下一条命令。 |
| **human-only presentation** | 仅人类展示 | 只影响可读文案和布局、不进入 automation contract 的信息。 |
| **automation contract preservation** | 自动化契约保持 | Human output 重构不改变 JSON shape、exit code、issue ordering、path normalization 和 stable snapshots。 |

## Shared Output Frame（共享输出框架）

| Term | 中文直译 | Definition |
|---|---|---|
| **shared output frame** | 共享输出框架 | 不同 command 共同遵守的 Header、Summary、Scope、State、Evidence、Issues 和 Next Actions 语义框架。 |
| **Header** | 头部 | 展示 command name、mode 和 outcome label 的顶部区域。 |
| **Summary** | 摘要 | 用 1–3 行先回答是否完成、是否写入、是否需要动作以及当前 outcome 含义。 |
| **Scope** | 范围 | 展示 target、project root、source、checked area、resolve key 或 Skill path 等执行范围。 |
| **State / Authorization** | 状态/授权 | 展示 health、plan state、write authorization、ready state 或 checked counts。 |
| **Plan / Evidence** | 计划/证据 | 展示 planned effects、paths、targets、steps、checked items 或支撑 outcome 的事实。 |
| **Issues / Conflicts / Gaps** | 问题/冲突/缺口 | 按任务类型展示需要处理的问题、冲突或治理缺口。 |
| **Next Actions** | 下一步动作 | 按安全优先级排列、已本地化且路径安全的下一步命令或人工检查。 |
| **section semantics** | 章节语义 | Section 名称可以按 profile 调整，但每个 section 承担的用户任务含义保持一致。 |
| **profile-specific section order** | Profile 专属章节顺序 | 不同 command 可采用适合其任务的 section 顺序，不要求所有输出套用固定模板。 |

## Presentation Profiles（展示 Profile）

| Term | 中文直译 | Definition |
|---|---|---|
| **presentation profile** | 展示 Profile | 根据 command intent 选择的 human-readable 信息组织方式。 |
| **Operation Profile** | 操作型 Profile | 用于 install、update、repair 等写入型或写入计划型命令，重点展示 authorization、plan、protected boundaries 和 apply result。 |
| **Diagnostic Profile** | 诊断型 Profile | 用于 status、validate 等只读诊断命令，重点展示 health、issues、checked scope 和 evidence。 |
| **Report / Support Profile** | 报告 / 支持型 Profile | 用于 inventory、governance report 或 opt-in resolve human output，主体使用 Results、Metrics、Gaps 或 Artifacts。 |
| **write-capable command** | 可写命令 | 可能修改 target project 的命令，必须明确 authorization 和 protected boundaries。 |
| **read-only diagnostic command** | 只读诊断命令 | 只检查并报告状态、不修改项目文件的命令。 |
| **support output** | 支持输出 | 为调试 resolver、inventory 或运营提供的可读结果，不改变默认 pure JSON contract。 |
| **profile migration** | Profile 迁移 | 将已有 command renderer 迁移到对应 presentation profile，同时保持机器契约不变。 |
| **first migration sample** | 首次迁移样本 | 先以 `install` 验证 profile contract 和 path-safe output，再推广到其他 commands。 |

## Command Outcomes（命令 Outcome）

| Term | 中文直译 | Definition |
|---|---|---|
| **prewrite-paused** | 写入前暂停 | Install 已完成写入前计划，但没有写入任何项目文件，等待 `--yes` 或 interactive 授权。 |
| **blocked-before-write** | 写前阻塞 | Source、target 或 package evidence 在写入前失败，必须先修 blocker，不能仅追加 `--yes`。 |
| **write-failed** | 写入失败 | Install 已进入写入阶段后失败，可能已有部分文件写入，需要展示 failed/completed/pending scope。 |
| **ready-check-failed** | 就绪检查失败 | 安装内容已部分或全部写入，但本地 ReadyCheck 未通过，项目不能视为 ready。 |
| **ready** | 就绪 | Install 已完成并通过 ReadyCheck，可以展示 Ready Summary。 |
| **default-no-prompt** | 默认无提示 | 使用默认 module、config 和 target 的无普通提示安装路径。 |
| **explicit-interactive** | 显式交互 | 用户明确进入自定义选择流程的安装模式。 |
| **plan-ready** | 计划就绪 | Update plan 已生成但未写入，等待 `--yes` 授权无 conflict actions。 |
| **repair-plan-ready** | 修复计划就绪 | Explicit repair plan 已生成但未写入，等待用户授权。 |
| **no-op** | 无操作 | 当前状态没有 planned writes，也无需 update 或 repair。 |
| **blocked-by-conflict** | 因冲突阻塞 | 存在 conflict，普通 `--yes` 不能绕过。 |
| **applied** | 已应用 | 无 conflict 且获授权的 planned writes 已实际执行。 |
| **partial-or-failed** | 部分完成或失败 | Apply 或 repair 只完成部分动作或执行失败，需要人工处理。 |
| **protected path** | 受保护路径 | 因 human/workflow ownership 等边界不会被 update/repair 修改的路径。 |
| **next validation action** | 下一步验证动作 | Apply 后建议运行的 validate 或 status 命令，用于确认 installed state。 |
| **installed** | 已安装 | Status 成功读取到 installed state，具体健康度仍由 `highLevelHealth` 解释。 |
| **not-installed** | 未安装 | 没有安装跟踪事实或项目尚未安装。 |
| **stale** | 过时 | 存在安装痕迹，但 manifest、index 或 runtime state 已过期或不一致。 |
| **partial** | 部分 | Installed state 只存在一部分。 |
| **failed** | 失败 | Status 证据表明安装状态明确失败或不可用。 |
| **unknown** | 未知 | 证据不足，不能可靠判断安装状态。 |
| **valid** | 有效 | Validate 执行完成且没有 blocking issues。 |
| **valid-with-warnings** | 有效（有警告） | Validate 通过，但存在 warning 或 info。 |
| **invalid** | 无效 | Validate 发现 error 或 critical issue。 |
| **cannot-validate** | 无法验证 | 缺少 manifest、schema、source evidence 或其他前置条件，无法执行有效验证。 |
| **resolved** | 已解析 | Config/customization 成功解析并返回请求值。 |
| **resolved-with-warnings** | 已解析但有警告 | Resolver 成功返回结果，但使用 fallback 或遇到 optional-layer warning。 |
| **unresolved** | 未解析 | Resolver 失败，无法返回请求值。 |
| **invalid-input** | 无效输入 | Requested key、project root 或 resolver 参数不合法。 |

## Human And Machine Boundaries（人类与机器边界）

| Term | 中文直译 | Definition |
|---|---|---|
| **human-readable mode** | 人类可读模式 | 默认终端输出，可以本地化、分 section、使用 bullet 并自适应宽度。 |
| **raw stable field** | 原始稳定字段 | `pendingSteps`、issue ID 等供机器稳定读取的字段，默认不与本地化行重复展示。 |
| **duplicate fact rendering** | 重复事实渲染 | 同一事实同时以本地化句子和 raw field 输出，容易让用户误以为是两个状态。 |
| **structured JSON** | 结构化JSON | `--json` 输出的稳定 machine contract，不包含 ANSI、terminal layout 或 human-only decoration。 |
| **pure JSON resolve mode** | 纯 JSON 解析模式 | Resolve 默认只在 stdout 输出 JSON；human profile 必须显式 opt in。 |
| **status/health separation** | 状态/健康分离 | `CommandResult.status=success` 不等于 installed health 通过，human outcome 必须解释两者。 |
| **automation-required field** | 需自动化字段 | CI 或脚本必需的信息，必须存在于 structured JSON 或 file contract，不能只写进 prose。 |

## Empty States And Issue Presentation（空状态与问题展示）

| Term | 中文直译 | Definition |
|---|---|---|
| **empty state** | 空状态 | Issues、conflicts、gaps、planned writes 或 checked items 为空时的明确文本。 |
| **section-local empty state** | 章节内空状态 | `- 无问题` 等文本直接放在对应 section 内，不另建脱离语境的 Empty State section。 |
| **silent blank section** | 静默空白章节 | Section 标题下没有内容、要求用户猜测是否遗漏输出的反模式。 |
| **issue presentation** | 问题呈现 | 展示 severity、category、issue ID、affected path、impact 和 suggested next step 的统一方式。 |
| **canonical issue order** | 规范问题顺序 | Validate issues 按既定 severity/category/path/ID 顺序展示。 |
| **blocker-first action** | 阻断项优先动作 | Next Actions 先处理 error/conflict，再授权写入，最后运行 validation/status。 |
| **specific remediation** | 特定修复 | 指向具体命令、path 或 configuration 的修复建议，避免只说“检查配置”。 |

## Localization And Next Actions（本地化与下一步）

| Term | 中文直译 | Definition |
|---|---|---|
| **localized Next Actions** | 本地化下一步动作 | 自然语言说明来自 locale catalog，同时保留 command、flag、path、ID 和 reason code。 |
| **message catalog** | 消息目录 | `zh-CN`、`en-US` 等 locale 的 human-readable 文案资源。 |
| **default locale** | 默认 Locale | 未显式选择 locale 时采用的 `zh-CN`。 |
| **fallback catalog** | 回退 Catalog | 用户选择英文时使用的 `en-US` catalog，不能改变 JSON 或排序语义。 |
| **internal nextAction** | 内部后续动作 | Command data 中的稳定 action 意图或原始信息，不能未经本地化直接透传为默认中文文案。 |
| **path-safe command** | 路径安全命令 | Next Actions 中不会因 cwd 不同而误指向其他项目的命令，必要时使用 absolute target path。 |
| **display path** | 显示路径 | 为人展示且能安全关联 target 的路径表达；不能只剩可能被 cwd 误解析的 basename。 |
| **default install action** | 默认安装操作 | `speclite install <target> --yes`，使用默认选择继续安装。 |
| **custom install action** | 自定义安装操作 | `speclite install <target> --yes --interactive`，明确进入自定义安装。 |
| **reason-code preservation** | 原因码保留 | 本地化文案可以改变，但原始 issue ID、reason code 和 affected path 必须保留。 |

## Scan-Friendly Layout（可扫描布局）

| Term | 中文直译 | Definition |
|---|---|---|
| **scan-friendly layout** | 扫描友好布局 | 用户能在数秒内看出 outcome、write state、target、blocker 和可复制命令的排版。 |
| **section spacing** | 节间距 | Sections 之间保留空行，帮助视觉分组。 |
| **bullet fact** | 项目符号事实 | Section 内每个用户可读事实用 `- ` 单独表达，避免长段混合多个状态。 |
| **nested bullet** | 嵌套项目符号 | 用 `  - ` 表达 step list 或 Evidence 下的子字段。 |
| **step count** | 步骤计数 | 先展示 completed/pending steps 数量或“无”，再列出具体 stable IDs。 |
| **Evidence hierarchy** | 证据层级 | 以 source、external access、authorization 等同级主题组织证据，再缩进展示其字段。 |
| **labeled action** | 标记动作 | 使用“默认安装”“自定义安装”等标签说明命令目的。 |
| **key-value dump** | 键值堆叠 | 不分用户语义、直接输出内部字段和值的反模式。 |
| **exact section fragment test** | 精确章节片段测试 | Focused test 对关键 section、bullet、hierarchy 和 command fragments 作精确断言。 |

## Color And Terminal Behavior（颜色与终端行为）

| Term | 中文直译 | Definition |
|---|---|---|
| **TTY color enhancement** | TTY颜色增强 | 仅在交互 TTY 中用少量 color/bold 加快扫描，颜色不承担唯一语义。 |
| **standard ANSI 8/16 color** | 标准ANSI 8/16色 | 跨终端兼容性较好的基础前景色集合。Epic 8 不采用 truecolor、256 色或背景色。 |
| **bold section title** | 加粗节标题 | 用 ANSI bold 强化 section heading，在 strip ANSI 后仍保留完整文字。 |
| **NO_COLOR compliance** | NO_COLOR兼容性 | `NO_COLOR` 设置时完全禁用 ANSI styles。 |
| **non-TTY output** | 非TTY输出 | CI、pipe 或文件重定向场景中的纯文本输出，不包含 ANSI 或动态覆盖行。 |
| **spinner-only progress** | 仅 Spinner 进度 | 只有动画、没有稳定文本 step/status 的进度表达，是不可访问且不可复制的反模式。 |
| **stripAnsi semantic parity** | 移除 ANSI 后语义一致 | 移除 ANSI 后，outcome、severity、path 和 next action 语义仍完整。 |
| **theme-independent color** | 主题无关颜色 | 不依赖浅色/深色主题、低对比灰色或背景色才能辨认。 |
| **copy-paste safe output** | 可粘贴输出 | Output 复制到 issue、docs 或 CI log 后仍保持可读，不含光标控制或隐藏语义。 |

## Testing And Documentation Matrix（测试与文档矩阵）

| Term | 中文直译 | Definition |
|---|---|---|
| **outcome fixture** | Outcome 测试夹具 | 覆盖某个 command outcome、Summary、write state、Issues 和 Next Actions 的 expected output。 |
| **human/JSON parity** | 人类输出与 JSON 一致性 | Human renderer 与 JSON 共享 status、issue、path 和 next-action source，但 presentation 不污染 JSON。 |
| **presentation regression** | 展示回归 | 文案修改重新引入误导 outcome、未本地化 action、path 不安全或空状态不清。 |
| **documentation matrix** | 文档矩阵 | Quick Start、reference 和 troubleshooting 示例与 command/outcome/profile 的覆盖关系。 |
| **renderer/documentation parity** | 渲染器与文档一致性 | Docs 示例使用实际 outcome vocabulary 和 renderer 结构，不把预览、只读和写入混为一谈。 |
| **historical corrective addendum** | 历史修正附录 | 已完成 Stories 之后新增的布局修正说明，保留历史 ID 和 execution evidence，不重放旧 Epic。 |
| **historical baseline** | 历史基线 | 已完成 Epic 的保留状态；未来维护通过新 change-controlled Story 进行。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **command outcome vs. CommandResult status** | Outcome 面向用户任务；status 表示命令执行层成功、warning 或 failure。 |
| **prewrite-paused vs. ready** | 前者没有安装和写入；后者已写入并通过 ReadyCheck。 |
| **blocked-before-write vs. write-failed** | 前者在写入前停止；后者已进入写入阶段，可能产生部分变更。 |
| **plan-ready vs. applied** | Plan-ready 等待授权且未写入；applied 表示计划动作已执行。 |
| **status vs. validate profile** | Status 提供轻量方向感；validate 展示完整 issue/evidence。 |
| **empty state vs. missing output** | Empty state 明确说明“无”；missing output 无法判断 renderer 是否遗漏。 |
| **path-safe display vs. basename** | 前者保持目标上下文；basename 在跨目录执行时可能指向错误项目。 |
| **color enhancement vs. color-only meaning** | Enhancement 可被移除；color-only meaning 在无色环境会丢失状态。 |
| **profile consistency vs. fixed template** | Consistency 保持 section semantics；fixed template 强迫所有 commands 使用不合适的相同顺序。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| CLI 参考 | [`../cli.md`](../cli.md) |
| Human output 矩阵 | [`../cli-human-output-matrix.md`](../cli-human-output-matrix.md) |
| CommandResult JSON | [`../command-result-json.md`](../command-result-json.md) |
| 安装指南 | [`../../how-to/install-speclite.md`](../../how-to/install-speclite.md) |
| Validation issues | [`../validation-issues.md`](../validation-issues.md) |
