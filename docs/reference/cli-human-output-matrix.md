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
