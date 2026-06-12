---
title: "Install CLI Interaction Revision"
date: "2026-06-12"
source: "bmad-agent-ux-designer"
status: "ready-for-prd-and-story"
related:
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md"
  - "_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md"
  - "_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md"
---

# Install CLI Interaction Revision（安装 CLI 交互修订）

## Executive Summary（执行摘要）

首次安装的当前问题不是单一英文文案，而是 `install` human-readable flow 缺少清晰的信息层级：日志、摘要、提示、确认和用户输入共享同一文本流，用户无法快速判断“系统已经做了什么、还没有做什么、现在需要我确认什么、按 Enter 后会不会写文件”。

本修订将 `speclite install` 首次安装体验定义为分阶段、可扫描、默认中文、可自动化旁路的 CLI control-plane interaction。它不改变 `CommandResult` JSON 契约，不引入 GUI，不要求颜色或 spinner；它要求 human-readable renderer 与 interactive prompt adapter 明确区分内容类型，并把 `--json` 保持为稳定自动化接口。

## Problem Evidence（问题证据）

用户在新项目中执行：

```sh
npx @fancyliu/speclite@latest install --yes
```

当前输出暴露以下 UX 问题：

- 多段 install summary 被拼接成长段落，阶段之间缺少可见边界。
- `readline.question()` 的确认提示把 summary 与用户输入放在同一个 question 中，用户输入回显紧贴上一段提示。
- `--yes` 已授权写入，但仍要求模块选择、配置模式选择和最终确认，语义不符合大多数 CLI 用户对 `--yes` 的预期。
- 默认交互文案为英文；安装后配置默认值虽然是 `Chinese`，但首次安装期间 CLI renderer 并不读取或使用 message catalog。
- 用户无法清晰区分“已完成的只读检查”“待确认的写入计划”“按 Enter 后才会发生的写入阶段”。

## Design Goal（设计目标）

`speclite install` 必须让首次用户在 30 秒内完成三件事：

1. 看懂当前阶段和下一步动作。
2. 确认写入范围和默认配置是否安全。
3. 安装完成后知道从哪里开始使用 SpecLite。

自动化用户必须能用 `--json` 或显式 flags 完成同样的安装，不解析 human-readable 文案。

## Interaction Principles（交互原则）

- **阶段先行**：每个主要阶段都有稳定标题和状态，避免长段落堆叠。
- **输入隔离**：prompt 必须单独占行，且与上一段 summary 之间有空行。
- **确认可解释**：任何会进入写入阶段的确认都必须说明按 Enter 后会发生什么。
- **默认中文**：human-readable CLI 默认使用中文，自然语言可本地化；技术标识不翻译。
- **`--json` 稳定**：locale、TTY、terminal width、颜色和 prompt 变化不得影响 JSON。
- **`--yes` 诚实**：`--yes` 表示使用安全默认值并授权无 conflict 的 planned writes；不得继续要求普通确认。
- **不靠颜色理解**：颜色只能增强，不承载唯一语义；CI / non-TTY / `NO_COLOR` 输出必须完整可读。

## Install Flow Model（安装流程模型）

默认 interactive install 分为四个 human-visible stages：

1. `Step 1/4 Select modules（选择模块）`
   - 展示 required modules、default selected modules、可选 module table。
   - prompt 单独占行：`请输入 module ids，直接回车使用默认值：`

2. `Step 2/4 Configure project（配置项目）`
   - 展示 target、source、selected modules 的紧凑摘要。
   - 展示 quick / detailed 的差异。
   - prompt 单独占行：`请选择配置模式 [quick/detailed]，直接回车使用 quick：`

3. `Step 3/4 Review write plan（确认写入计划）`
   - 分块展示 target、source、config、modules、IDE targets、planned writes、pending phases。
   - 明确说明：当前仍未写入任何项目文件。
   - prompt 单独占行：`确认后将开始写入 _speclite、IDE mirrors、manifest/index。按回车继续，Ctrl+C 取消：`

4. `Step 4/4 Install and ReadyCheck（写入与就绪检查）`
   - 按稳定 step order 展示 completed / pending 状态。
   - ReadyCheck 通过后展示 Ready Summary。

`--yes` flow 不进入 Step 1-3 的 interactive prompts。它必须使用默认模块、quick config 和默认 IDE targets，直接进入 write plan + execution；human-readable 输出仍可展示“已使用默认值”的摘要。

## Output Layout（输出布局）

Human-readable install output 使用以下 block primitives：

```text
SpecLite Install（安装）

Step 1/4 Select modules（选择模块）
Required: core
Default: core, sdlc

Available modules:
- core  SpecLite Core Module 0.0.0  package roots: 13
- sdlc  SpecLite SDLC Module 0.0.0  package roots: 44

? 请输入 module ids，直接回车使用默认值：
```

分隔规则：

- Heading 与正文之间空一行。
- Prompt 前必须空一行，并以 `? ` 开头；它只能包含当前需要用户输入的内容。
- Summary block 使用 `Key: value` 或短列表，不使用一整段长句。
- Safety statement 独立成行：`当前状态：尚未写入项目文件。`
- Final confirmation 不得把完整 summary 拼进同一个 question string。

## Language & Message Catalog（语言与消息目录）

CLI human-readable message 必须有 message catalog。MVP 至少支持：

- `zh-CN`：默认语言。
- `en-US`：英文 fallback 和现有英文用户的兼容路径。

Locale 解析顺序：

1. 显式 CLI flag：`--locale zh-CN` / `--locale en-US`。
2. 环境变量：`SPECLITE_LOCALE`。
3. 默认：`zh-CN`。

Message catalog 只覆盖自然语言，不覆盖：

- command name、flag、module id、target id、step id。
- path、field name、schema id、issue id、reason code。
- JSON field、manifest/index field、fixture id。

安装后写入的 `communication_language` / `document_output_language` 继续表示 agent communication 和 document output language；它们不能被误当作首次安装 CLI renderer 的 locale source。

## `--yes`, Interactive, And JSON Semantics（`--yes`、交互与 JSON 语义）

`install` 模式语义：

| Mode | Prompt behavior | Defaults | Writes | Intended user |
| --- | --- | --- | --- | --- |
| `install` without `--yes` | 只读预览，不写入 | 不适用 | 不写入 | 想先确认 target/source 的用户 |
| `install --yes` | 不询问普通交互确认 | 默认 modules、quick config、默认 IDE targets | 授权无 conflict planned writes | 新手和脚本化 happy path |
| `install --interactive --yes` | 允许模块/配置/IDE 选择 | 用户输入覆盖默认值 | 最终确认后写入 | 需要自定义的用户 |
| `install --json --yes` | 无 human prompts | 显式 flags 或默认值 | 授权无 conflict planned writes | CI / automation |

如暂不引入 `--interactive` flag，MVP 必须至少保证 `--yes` 不再触发普通 confirmation prompts；详细配置可以通过后续显式 flags 或未来交互模式补齐。

## Ready Summary Requirements（就绪摘要要求）

Ready Summary 必须在 ReadyCheck 通过后展示，并按稳定顺序包含：

1. Summary：安装已完成、target project、manifest version。
2. Installed modules：module id、display name、package root count。
3. IDE targets：target id、target path、skill count。
4. Key paths：`_speclite`、`_speclite-output`、manifest path、IDE mirror paths。
5. Next actions：打开 IDE skill、运行 `speclite status`、必要时运行 `speclite validate`。

失败时不得展示 Ready Summary heading，也不得输出容易被理解为 ready 的 success block。

## Acceptance Criteria（验收标准）

1. 默认 human-readable `install` 输出为中文；英文可通过 `--locale en-US` 或 `SPECLITE_LOCALE=en-US` 启用。
2. `install --json` 输出不受 locale、TTY、terminal width 或 prompt 文案影响。
3. 模块选择、配置模式、最终写入确认和 Ready Summary 均使用稳定 heading block，不能拼成长段落。
4. Prompt 与 summary 分离；所有 prompt 单独占行，且前置空行。
5. `install --yes` 使用默认模块、quick config 和默认 IDE targets，不再要求普通交互确认。
6. 如保留自定义交互，必须通过显式 interactive mode 或显式 flags 进入，不得让 `--yes` 同时表示“授权写入”和“继续询问默认问题”。
7. `NO_COLOR`、non-TTY 和 CI 输出不包含 ANSI escape，不依赖 spinner-only progress。
8. Fixture 或 CLI smoke 必须覆盖中文默认输出、英文 locale 输出、prompt/summary 分离、`--yes` no-prompt flow、`--json` stability。

## Implementation Notes（实现备注）

- 建议新增 `src/cli/messages.ts` 或等价模块管理 catalog 与 locale resolution。
- 建议把 prompt adapter 与 install summary renderer 分离：renderer 只渲染 block，prompt adapter 只渲染当前问题。
- `src/bin/speclite.ts` 不应继续直接硬编码长段英文 prompt。
- `src/commands/install.ts` 可以继续拥有 install semantic summary，但自然语言应通过 renderer/message catalog 输出。
- 所有新增测试应优先覆盖 `test/cli-smoke.test.ts`、install focused tests 和 fixture contract；如变更 public JSON 字段，必须先更新 owning SPEC，本修订不要求新增 JSON 字段。
