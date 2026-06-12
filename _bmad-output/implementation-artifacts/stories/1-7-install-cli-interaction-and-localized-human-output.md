# Story 1.7: Install CLI Interaction And Localized Human Output（安装 CLI 交互与本地化人类输出）

Status: ready-for-dev

<!-- Corrective Story: created after real first-install terminal output exposed CLI interaction and locale gaps. -->

## Story（故事）

作为首次安装 SpecLite 的项目维护者，
我希望 `speclite install` 的终端输出按阶段清晰区分日志、摘要、提示和确认，
以便在中文默认输出中安全理解安装范围、写入时机和下一步动作，同时让 `--yes` 与 `--json` 适合自动化和新手 happy path。

## Acceptance Criteria（验收标准）

1. **Install human-readable flow uses separated stage blocks.**
   **前提** 用户执行 `speclite install` 的 human-readable flow；
   **当** 系统展示模块选择、配置模式、写入计划确认、写入进度和 Ready Summary；
   **则** 每个阶段必须使用稳定 heading block，例如 `Step 1/4 Select modules（选择模块）`；
   **并且** summary、safety statement、prompt 和用户输入必须在视觉上分离；
   **并且** prompt 必须单独占行，不得把长段 summary 与 `readline.question()` 的输入提示拼接在同一段文本中。

2. **Default install human-readable locale is Chinese.**
   **前提** 用户未显式指定 locale；
   **当** CLI 渲染 human-readable install output；
   **则** 默认使用 `zh-CN` message catalog；
   **并且** 自然语言提示、阶段标题和摘要说明默认中文；
   **并且** command name、flag、module id、target id、step id、path、schema id、issue id、reason code 和 JSON field 不得本地化。

3. **English fallback is explicit and does not change contracts.**
   **前提** 用户通过 `--locale en-US` 或 `SPECLITE_LOCALE=en-US` 指定英文；
   **当** CLI 渲染 human-readable install output；
   **则** 使用 `en-US` fallback catalog；
   **并且** locale 变化不得改变 `CommandResult` JSON、exit code、issue ordering、path normalization、manifest/index 内容或 fixture stable JSON comparison。

4. **`install --yes` becomes a no-prompt happy path.**
   **前提** 用户执行 `speclite install --yes`；
   **当** 目标目录、source resolution 和 write plan 均没有 blocking issue；
   **则** 命令必须使用默认 modules、quick config 和默认 IDE targets 形成写入计划；
   **并且** 不再要求模块选择、配置模式或最终写入确认等普通交互输入；
   **并且** human-readable 输出必须说明本次使用了默认值并已由 `--yes` 授权无 conflict planned writes。

5. **Custom interactive install is explicit.**
   **前提** 用户需要自定义模块、配置模式或 IDE targets；
   **当** 用户进入自定义安装流程；
   **则** 必须通过显式 interactive mode 或显式 flags 进入；
   **并且** `--json --yes` 必须保持无交互，不得等待 stdin。
   **备注** MVP 可以选择先实现 `--interactive`，或先提供 `--modules`、`--config-mode`、`--ide-targets`、`--locale` 等显式 flags；但不得继续让 `--yes` 同时表示授权写入和继续询问默认问题。

6. **Final pre-write review is concise and ordered.**
   **前提** 系统生成 final pre-write review；
   **当** 任何项目文件尚未写入；
   **则** review 必须按稳定顺序展示 target、source descriptor、config mode、selected modules、IDE targets、planned writes 和 pending phases；
   **并且** 明确说明当前状态为尚未写入项目文件；
   **并且** 明确说明确认后会开始写入 `_speclite`、artifact root、IDE mirrors 和 manifest/index。

7. **No-color, non-TTY, CI and narrow terminal output remain readable.**
   **前提** install output 运行在 `NO_COLOR`、non-TTY、CI 或窄终端环境；
   **当** 系统渲染阶段、prompt、失败结果或 Ready Summary；
   **则** 输出不得包含 ANSI escape，不得依赖 spinner-only progress、颜色、图标或动态覆盖行表达唯一语义；
   **并且** 窄终端必须降级为 key-value block，不得丢失 target、source、planned writes、issue id、step id、path 或 next action。

8. **Focused tests lock the interaction contract.**
   **前提** 开发者实现本 Story；
   **当** 修改 CLI prompt adapter、install renderer、message catalog 或 `--yes` 行为；
   **则** 必须补充 focused CLI smoke / fixture tests，覆盖默认中文输出、英文 locale fallback、prompt/summary 分离、`install --yes` no-prompt flow、`install --json --yes` 无交互稳定输出、`NO_COLOR` / non-TTY / CI 无 ANSI 输出；
   **并且** 不得新增未契约化 JSON 字段；若确需新增 public JSON 字段，必须先更新 owning SPEC、schema/parser 和 fixture expected outputs。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 建立 CLI message catalog 与 locale resolution（AC: 2, 3）
  - [ ] 新增 `zh-CN` default catalog 和 `en-US` fallback catalog。
  - [ ] 支持 `--locale` 和 `SPECLITE_LOCALE`，解析顺序为 explicit flag -> env -> `zh-CN`。
  - [ ] 保持技术标识不本地化，包括 command、flag、module id、target id、step id、path、schema id、issue id、reason code 和 JSON field。

- [ ] Task 2: 重构 install prompt adapter，分离 summary 与 prompt（AC: 1, 6, 7）
  - [ ] 不再把 long summary 拼进同一个 `readline.question()` question。
  - [ ] 每个 prompt 单独占行，前置空行，并只包含当前需要用户输入的问题。
  - [ ] 将模块选择、配置模式、final pre-write review 渲染为稳定 block。

- [ ] Task 3: 修正 `--yes` 语义（AC: 4, 5）
  - [ ] `install --yes` 使用默认 modules、quick config 和默认 IDE targets，不要求普通交互输入。
  - [ ] `install --json --yes` 不等待 stdin。
  - [ ] 自定义选择必须进入显式 interactive mode 或显式 flags。

- [ ] Task 4: 更新 install human-readable renderer（AC: 1, 6, 7）
  - [ ] 输出稳定 stage heading、key-value summary、safety statement 和 next actions。
  - [ ] Final pre-write review 按 target、source descriptor、config mode、selected modules、IDE targets、planned writes、pending phases 排序。
  - [ ] Ready Summary 继续复用 Story 1.6 的 Evidence profile，不新增 JSON blob。

- [ ] Task 5: 补充 tests / fixtures（AC: 1-8）
  - [ ] 更新或新增 `test/cli-smoke.test.ts` 覆盖默认中文输出和英文 fallback。
  - [ ] 覆盖 prompt/summary 分离，断言 prompt 不包含 long pre-write summary。
  - [ ] 覆盖 `install --yes` no-prompt flow 与 `install --json --yes` 无交互。
  - [ ] 覆盖 `NO_COLOR`、non-TTY、CI 无 ANSI 输出。
  - [ ] 如 human-readable fixture snapshot 存在，更新 expected output；如没有，新增 focused normalized output assertion。

- [ ] Task 6: 本地验证与范围控制（AC: 1-8）
  - [ ] 运行 focused Vitest tests。
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test` 或说明无法全量运行的原因。
  - [ ] 运行 `git diff --check`。
  - [ ] 确认未新增 public JSON 字段、未改变 `CommandResult` schema、未改 manifest/index 契约。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- UX revision: `_bmad-output/planning-artifacts/ux-install-cli-interaction-spec-2026-06-12.md`
- PRD functional updates: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
  - `FR17a`
  - `FR47a`
  - `FR63b`
  - `FR65a`
- PRD non-functional updates: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
  - `NFR1a`
  - `NFR11a`
  - `NFR35b-14`
  - `NFR40e`
- Epic story source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md`

### Current Implementation Evidence（当前实现证据）

- `src/bin/speclite.ts` currently builds module-selection prompt copy directly in `createModuleSelectionQuestion()`.
- `src/bin/speclite.ts` currently calls `io.prompt()` for module selection, project configuration, source access confirmation and pre-write confirmation.
- `src/bin/speclite.ts` currently combines `input.prompt` and final confirmation in `confirmPrewriteInstallScope()`.
- `src/commands/install.ts` currently builds final pre-write and ready summary strings as English sentence arrays joined by spaces.
- `src/installer/config-initialization.ts` currently defaults installed project config `communication_language` and `document_output_language` to `Chinese`, but that config is not the CLI renderer locale for first install.
- `src/diagnostics/output.ts` currently renders install human output in English and should remain semantically backed by `CommandResult`.

### Scope Boundary（范围边界）

- 本 Story 只改 install human-readable output、prompt adapter、locale/message catalog、`--yes` interaction semantics 和对应 tests。
- 本 Story 不改 canonical source package discovery、IDE mirror writes、ReadyCheck semantic scope、manifest/index schema、source descriptor trust model、file ownership model、update/repair behavior 或 public JSON data shape。
- 不引入 GUI、spinner-only progress、interactive TUI framework、database、daemon、network service 或 new automation API。

### Suggested Implementation Shape（建议实现形态）

- 新增 `src/cli/messages.ts` 或等价模块：
  - `type Locale = "zh-CN" | "en-US"`
  - `resolveCliLocale({ flag, env })`
  - `t(locale, key, params)`
- 新增或拆分 install presentation helper：
  - stage heading renderer
  - key-value block renderer
  - module table/list renderer
  - final pre-write review renderer
  - prompt label renderer
- 保持 `--json` path 独立于 human-readable renderer；`--json` 不应调用 prompt adapter。
- 如果实现 `--interactive`，必须在 commander options、tests 和 docs 中说明它只控制 human prompts，不改变 JSON contract。

## Testing（测试）

建议最小测试集：

```sh
npm test -- test/cli-smoke.test.ts
npm test -- test/install-progress-ready-summary.test.ts
npm run build
git diff --check
```

如新增 message catalog 模块，补充 focused unit tests 覆盖 locale resolution 和技术标识不翻译。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-12 | 0.1 | 新增 corrective Story，覆盖安装 CLI 交互、本地化 human output 和 `--yes` no-prompt 语义。 | Sally / John |

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

待开发阶段填写。

### Debug Log References（调试日志引用）

待开发阶段填写。

### Completion Notes（完成说明）

待开发阶段填写。

### File List（文件清单）

待开发阶段填写。
