# Install Defaults（安装默认值）

本文是 `speclite install` 默认值的唯一源定义：默认无交互安装（`--yes`）与 interactive 安装时各项的默认取值与规则。其它文档引用本文，不再各自维护默认值表。

事实锚点：`src/bin/speclite.ts` 的安装交互、`src/installer/config-initialization.ts`、`src/config/artifact-root-resolver.ts`、`src/ide/adapter-registry.ts` 与 fresh-install fixture `test/fixtures/fresh-install-empty-project/`。

## Defaults（默认值）

| Item | Default | Rule |
|---|---|---|
| Source type | `bundled` | 使用随 CLI 包携带的 `assets/source/speclite/`；`--source`、`--source-value`、`--channel`、`--version` 可切换到 registry、git 或 local source。 |
| Required module | `core` | 不可取消。 |
| Default-selected module | `sdlc` | `--yes` 与 interactive 默认都选中；interactive 可取消。 |
| Optional ecosystem modules | 不选择 | `--yes`、`--json` 与 default no-prompt 路径绝不自动选择；interactive 按 `ecosystem category -> id` 引导，skip 是合法路径。 |
| Config mode | `quick` | interactive 可切换 detailed，逐项回答 config 值。 |
| IDE targets | `claude`、`agents` | 分别投影到 `.claude/skills` 与 `.agents/skills`；当前 adapter registry 只有这两个 target。 |
| Runtime root | `_speclite` | metadata / control hub，见 [`runtime-layout.md`](runtime-layout.md)。 |
| Artifact root（`core.output_folder`） | `_speclite-output` | 七个 workflow-owned planes 的共同前缀，见 [`workflow-artifact-layout.md`](workflow-artifact-layout.md)。 |
| `user_name` | `SpecLite` | 仅 `--yes` 无交互路径使用该默认；interactive 必须输入。 |
| `project_name` | 目标项目根目录名 | interactive 可修改。 |
| `communication_language` / `document_output_language` | `Chinese` | 影响 Skill 对话与产物语言，不影响 CLI `--locale`。 |
| Human output locale | `zh-CN` | 由 `--locale` 或 `SPECLITE_LOCALE` 覆盖为 `en-US`；JSON 输出不受影响。 |
| Write authorization | 未授权 | 不带 `--yes` 只执行 target preflight；`--yes` 是 command-level write authorization，不表示接受 unverified source。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| CLI 参数参考 | [`cli.md`](cli.md) |
| 安装操作 | [`../how-to/install-speclite.md`](../how-to/install-speclite.md) |
| 首次安装演练 | [`../tutorials/first-install-walkthrough.md`](../tutorials/first-install-walkthrough.md) |
| Runtime layout | [`runtime-layout.md`](runtime-layout.md) |
| Ecosystem module catalog | [`skills/ecosystem-skills.md`](skills/ecosystem-skills.md) |
