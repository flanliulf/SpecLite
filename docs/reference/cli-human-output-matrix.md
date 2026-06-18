# CLI Human Output Matrix（CLI 人类输出矩阵）

本文维护 CLI human-readable output 的 command/outcome/test/docs matrix。它用于防止文案、locale、terminal profile 或 docs 示例调整时重新引入不可读、误导或不稳定的输出。

## Contract Sources（契约来源）

docs 示例不是 contract source；`CommandResult` JSON contract、issue model、outcome vocabulary 和 fixture policy 的来源仍是 SPEC、schema 和 focused tests。

- SPEC：`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`、`_bmad-output/planning-artifacts/specs/08-fixture-contract.md`。
- schema：`src/diagnostics/command-result-schema.ts`、`src/config/resolve-output-schema.ts`。
- focused tests：下表列出的 `test/*.test.ts`。
- docs example：只展示稳定、可复制、无颜色的人类输出；不得作为唯一 contract source。

## Normalization Policy（归一化策略）

新增 human-readable fixture 时必须声明 normalization: ANSI color, terminal width, timestamps, platform path。

| Dimension | Rule |
|---|---|
| ANSI color | `NO_COLOR=1`、CI、non-TTY 输出不得依赖颜色表达唯一语义；fixture 或 docs 示例不得包含 ANSI escape。 |
| terminal width | `columns < 80` 必须降级到 key-value block；测试使用语义断言，不依赖整段 brittle snapshot。 |
| timestamps | human fixture 不记录 wall-clock timestamp；需要时间时使用固定 fixture 值或删除字段。 |
| platform path | docs 和 fixture 使用 project-relative POSIX paths、`<project-root>` 或 `targetProject=example-project`，不得包含本机绝对路径。 |

## Presentation Profiles（展示 Profile）

Human output 先按 command intent 选择 presentation profile，再按 outcome 填充 section 内容。Profile 只影响 human-readable section order、empty state 归属和标题选择；不得改变 `CommandResult` public JSON contract。

| Profile | Commands | Section strategy |
|---|---|---|
| Operation | `install`、`init`、`update`、`update --repair`、`sync`、`uninstall` | 优先展示 `Summary`、`Scope`、`State / Authorization`、`Plan / Evidence`、`Issues / Conflicts`、`Next Actions`，适合会写入或准备写入的命令。 |
| Diagnostic | `status`、`validate`、`doctor` | `Issues` 靠近关键 state；存在 error/critical issue 时，不得把问题列表深埋在长 evidence 后。 |
| Report / Support | `list`、`governance-report`、`resolve config --human`、`resolve customization --human` | 使用 `Results`、`Metrics`、`Gaps`、`Artifacts` 或 `Evidence` 中最贴近任务的主体 section，不强制输出空洞 `State`。 |

## Install Migration Sample（Install 迁移样例）

当用户从非 target cwd 执行 `speclite install <absolute-target-path>` 时，human output 必须同时展示目标项目、目标绝对路径和命令执行目录。`Next Actions` 必须可以从原执行目录复制执行：

```text
Summary（摘要）
- 完成状态：已完成
- 写入状态：未写入项目文件
- 用户动作：需要
- ready 状态：not ready
- 当前含义：安全预览已完成；尚未执行安装写入。

Scope（范围）
- 目标项目：noi
- 目标路径：<absolute-target-path>
- 项目根目录：.
- 命令执行目录：<command-cwd>

State（状态）
- manifestVersion：speclite.manifest.v1
- 已完成 steps：无
- 待处理 steps：8 个
  - source-discovery
  - module-selection
  - config-initialization
  - runtime-structure
  - ide-mirror-creation
  - manifest-generation
  - ready-check
  - ready-summary
- IDE 目标状态：无

Evidence（证据）
- 来源：bundled
  - resolvedRoot：assets/source/speclite
  - trustStatus：blocked
  - evidence：none
- 外部访问：未请求
- 授权状态：source 在写入计划前已处于 blocked 状态。

Issues（问题）
- 无问题：未发现 blocker、warning 或 info。

Next Actions（下一步）
- 默认安装：运行 `speclite install <absolute-target-path> --yes` 使用默认配置完成安装。
- 自定义安装：运行 `speclite install <absolute-target-path> --yes --interactive` 进入交互模式自定义安装。
```

该 absolute target context 仅属于 human presentation；JSON output 不得因此新增 human-only field，也不得暴露本机绝对 target path。

相对跨目录 target 也必须保持可复制。例如用户从 SpecLite 仓库执行 `speclite install ../noi` 时，human `Next Actions` 应继续使用 `../noi --yes` 和 `../noi --yes --interactive`，不得把 target 降级为 `noi`。JSON 仍只保留 public display identifier 和 project-relative paths，不暴露 resolved absolute target。

## Interactive Install Config Review（交互式安装配置复核）

`install --yes --interactive` 的 `quick` 与 `detailed` 都必须采集 non-empty `user_name`。`quick` 只提示该必填个人字段，其他项目名、语言和路径使用 defaults；`detailed` 同样要求 `user_name`，并允许继续确认或调整其他配置。空输入必须重新提示，不得静默写入 `SpecLite`。

Step 2 的模式说明应保持可扫描列表：

```text
Config mode options（配置模式选项）

- quick: 要求输入 user_name，并使用 deterministic defaults 生成 project/language/artifact paths；适合接受其余默认值的快速安装。
- detailed: 逐项确认 project fields、selected modules 和 IDE targets；适合需要自定义路径、modules 或 IDE mirrors 的安装。
```

Step 3 的 final pre-write review 必须在写入确认前展示配置值：

```text
Config values（配置值）
Project name: noi
User display name: Fancyliu
Languages: communication=Chinese, document=Chinese
Artifact root: _speclite-output
```

`user_name` 写入 `_speclite/config.user.toml`。非交互 `install --yes` 可以使用 `SpecLite` fallback，但 interactive flow 不能把这个 fallback 当作用户已确认的输入。

## Color Policy（颜色策略）

颜色只是扫描增强，不承担唯一语义。`NO_COLOR=1`、CI、non-TTY、docs 示例、fixture 和 `--json` 输出不得包含 ANSI escape；TTY positive path 只允许 section title 使用 bold，outcome 使用标准 8/16 色，Next Actions 中的 command 使用 cyan。去除 ANSI 后，输出文本必须仍然完整可读。

颜色 runtime dependency 固定为 `picocolors@1.1.1`，且只有集中 helper 可以直接 import `picocolors`。不得在 renderer、message catalog、docs 示例或 test fixture 中直接调用 `picocolors` API，也不得新增 `chalk`、`colorette`、`strip-ansi` 或其他 terminal style dependency。

## Coverage Matrix（覆盖矩阵）

| Command | Outcome | Focused test | JSON parity assertion | Docs example | Fixture or semantic assertion |
|---|---|---|---|---|---|
| `install` | `prewrite-paused` | `test/install-outcome-human-output.test.ts`; `test/cli-human-output-matrix.test.ts` | `renderCommandResultJson` 不包含 `outcome` / human sections | `README.md`; `docs/quick-start.md`; `docs/how-to/install-speclite.md` | fixture or semantic assertion: Summary、Writes、Issues、Next Actions、NO_COLOR/non-TTY/CI |
| `install` | `blocked-before-write` | `test/install-outcome-human-output.test.ts` | `renderCommandResultJson` 不新增 human-only fields | `docs/how-to/install-speclite.md`; `docs/quick-start.md` troubleshooting | fixture or semantic assertion: blocker issue first, no write state |
| `install` | `write-failed` | `test/install-outcome-human-output.test.ts` | `renderCommandResultJson` 不新增 human-only fields | `docs/how-to/install-speclite.md` | fixture or semantic assertion: failed step、completed writes、pending steps |
| `install` | `ready-check-failed` | `test/install-outcome-human-output.test.ts` | `renderCommandResultJson` 不新增 human-only fields | `docs/how-to/install-speclite.md`; `docs/how-to/validate-installation.md` | fixture or semantic assertion: written but not ready |
| `install` | `ready` | `test/install-outcome-human-output.test.ts`; `test/install-progress-ready-summary.test.ts` | ready summary 不写入 JSON-only contract | `README.md`; `docs/quick-start.md`; `docs/how-to/install-speclite.md` | fixture or semantic assertion: default vs interactive ready summary |
| `update` | `plan-ready` | `test/update-command.test.ts`; `test/cli-human-output-matrix.test.ts` | `renderCommandResultJson` 不包含 output profile / outcome | `docs/how-to/update-and-repair.md`; `docs/reference/cli.md` | fixture or semantic assertion: prewrite preview, `writeAuthorized=false` |
| `update` | `no-op` | `test/update-command.test.ts` | `renderCommandResultJson` 不包含 human empty-state copy | `docs/how-to/update-and-repair.md` | fixture or semantic assertion: no planned writes |
| `update` | `blocked-by-conflict` | `test/update-command.test.ts` | conflict issue remains JSON `ValidationIssue` | `docs/how-to/update-and-repair.md`; `docs/quick-start.md` troubleshooting | fixture or semantic assertion: no ordinary `--yes` bypass guidance |
| `update` | `applied` | `test/update-command.test.ts` | changed paths remain JSON data, not human outcome fields | `docs/how-to/update-and-repair.md` | fixture or semantic assertion: changed paths and protected boundaries |
| `update` | `partial-or-failed` | `test/update-command.test.ts` | execution failure state remains in existing JSON data/issues | `docs/how-to/update-and-repair.md` | fixture or semantic assertion: completed/pending/failed step evidence |
| `update --repair` | `repair-plan-ready` | `test/update-command.test.ts`; `test/cli-human-output-matrix.test.ts` | `update.repair` command id remains JSON contract | `docs/how-to/update-and-repair.md`; `docs/reference/cli.md` | fixture or semantic assertion: explicit repair plan, no hidden update mode |
| `update --repair` | `no-op` | `test/update-command.test.ts` | no-op repair does not add outcome JSON field | `docs/how-to/update-and-repair.md` | fixture or semantic assertion: no planned repair writes |
| `update --repair` | `blocked-by-conflict` | `test/update-command.test.ts` | repair conflicts remain JSON `conflicts` / `issues` | `docs/how-to/update-and-repair.md` | fixture or semantic assertion: remaining conflicts and explicit repair boundary |
| `update --repair` | `applied` | `test/update-command.test.ts` | repair changed paths remain JSON data | `docs/how-to/update-and-repair.md` | fixture or semantic assertion: repair-authorized writes and validation next action |
| `update --repair` | `partial-or-failed` | `test/update-command.test.ts` | failure evidence remains JSON data/issues | `docs/how-to/update-and-repair.md` | fixture or semantic assertion: incomplete repair evidence |
| `status` | `installed` | `test/status-command.test.ts`; `test/cli-human-output-matrix.test.ts` | `highLevelHealth=configured` remains JSON source | `README.md`; `docs/quick-start.md`; `docs/how-to/validate-installation.md` | fixture or semantic assertion: read-only Summary、Writes、Issues、Next Actions |
| `status` | `not-installed` | `test/status-command.test.ts`; `test/cli-human-output-matrix.test.ts` | no human-only `not-installed` JSON field | `docs/quick-start.md`; `docs/how-to/install-speclite.md` | fixture or semantic assertion: install next action |
| `status` | `partial` | `test/status-command.test.ts` | `highLevelHealth=partial` remains public JSON value | `docs/how-to/validate-installation.md` | fixture or semantic assertion: inspect IDE targets then validate |
| `status` | `failed` | `test/status-command.test.ts` | `highLevelHealth=failed` remains public JSON value | `docs/how-to/validate-installation.md` | fixture or semantic assertion: inspect manifest/source evidence |
| `status` | `stale` | `test/status-command.test.ts` | reserved human outcome is not currently produced by public JSON | TODO: add docs example only when a producer exists | fixture or semantic assertion: TODO, do not fake coverage |
| `status` | `unknown` | `test/status-command.test.ts` | reserved human outcome is not currently produced by public JSON | TODO: add docs example only when a producer exists | fixture or semantic assertion: TODO, do not fake coverage |
| `validate` | `valid` | `test/validate-command.test.ts` | JSON decisions use issue counts and checked categories | `README.md`; `docs/quick-start.md`; `docs/how-to/validate-installation.md` | fixture or semantic assertion: no issues and validation flow |
| `validate` | `valid-with-warnings` | `test/validate-command.test.ts` | warning/info counts remain JSON source | `docs/how-to/validate-installation.md` | fixture or semantic assertion: warning next actions |
| `validate` | `invalid` | `test/validate-command.test.ts`; `test/cli-human-output-matrix.test.ts` | blocking issue counts remain JSON source | `docs/how-to/validate-installation.md`; `docs/quick-start.md` troubleshooting | fixture or semantic assertion: sorted Issues, key-value fallback |
| `validate` | `cannot-validate` | `test/validate-command.test.ts` | status/issues remain existing JSON contract | `docs/how-to/validate-installation.md` | fixture or semantic assertion: restore metadata guidance |
| `resolve --human` | `resolved` | `test/resolve-cli.test.ts`; `test/cli-human-output-matrix.test.ts` | default resolve stdout remains pure JSON | `docs/reference/cli.md` | fixture or semantic assertion: no absolute paths, human support frame |
| `resolve --human` | `resolved-with-warnings` | `test/resolve-cli.test.ts` | default resolve diagnostics remain JSON Lines stderr | `docs/reference/cli.md` | fixture or semantic assertion: optional layer warning |
| `resolve --human` | `unresolved` | `test/resolve-cli.test.ts` | missing key default stays `{}` with exit `0` | `docs/reference/cli.md` | fixture or semantic assertion: explicit human unresolved reason |
| `resolve --human` | `invalid-input` | `test/resolve-cli.test.ts` | default invalid input stays stderr JSON Lines | `docs/reference/cli.md` | fixture or semantic assertion: legal command guidance |

## Packaging Boundary（打包边界）

本 matrix 是维护者 reference，不是 packaged runtime asset。除非未来显式加入 `package.json.files` 并在 release manifest 中标记为 `packaged-documentation-example`，它不得被 fixture/release tests 当作 package runtime docs 示例。
