# Story 8.8: CLI Human Output Presentation Profiles（CLI 人类输出展示 Profile）

Status: done

<!-- Corrective planning Story: 固化 human-readable output 的 command profile 规则，并把真实 install 输出问题纳入首个迁移样例。 -->

## Story（故事）

作为 CLI 用户和 SpecLite 维护者，
我希望 human-readable output 使用按命令意图分类的 presentation profile，
以便不同命令保持统一语义，同时不被强行套入不适合自身任务的固定 section 顺序。

## Acceptance Criteria（验收标准）

1. **Command renderers have explicit profiles（命令渲染器有明确 Profile）**
   **前提** 任一 human-readable renderer 被新增或修改；
   **当** 渲染 `install`、`init`、`update`、`update --repair`、`sync` 或 `uninstall`；
   **则** 必须使用 Operation Profile；
   **并且** section 顺序应优先表达 `Summary`、`Scope`、`State / Authorization`、`Plan / Evidence`、`Issues / Conflicts`、`Next Actions`。

2. **Diagnostic output keeps issues near state（诊断输出让问题靠近状态）**
   **前提** 任一 human-readable renderer 被新增或修改；
   **当** 渲染 `status`、`validate` 或 `doctor`；
   **则** 必须使用 Diagnostic Profile；
   **并且** `Issues（问题）` 应在关键 state 后可见；存在 `error` 或 `critical` issue 时，问题列表不得被深埋在长 evidence 之后。

3. **Report and support output is not forced into empty State（报告与支持输出不强套空 State）**
   **前提** 任一 human-readable renderer 被新增或修改；
   **当** 渲染 `list`、`governance-report`、`resolve config --human` 或 `resolve customization --human`；
   **则** 必须使用 Report / Support Profile；
   **并且** 主体内容应命名为 `Results`、`Metrics`、`Gaps`、`Artifacts` 或 `Evidence` 中最符合用户任务的 section，不得为了统一而强行使用空洞的 `State`。

4. **Scope and Next Actions are path-safe（范围与下一步路径安全）**
   **前提** command 输出涉及 target、project root、source path、skill path 或 requested key；
   **当** 渲染 `Scope（范围）` 或 `Next Actions（下一步）`；
   **则** 必须展示足够的执行上下文，至少包括目标项目或目标路径；
   **并且** 跨目录执行时不得把绝对 target path 降级为可能被 cwd 误解析的 basename 命令。

5. **Empty states live inside their owning section（空状态放在所属段落内）**
   **前提** human-readable output 需要展示 empty state；
   **当** 无 issues、无 conflicts、无 gaps、无 planned writes 或无 checked items；
   **则** empty state 必须放在所属 section 内，例如 `Issues（问题）` 下输出 `- 无问题`；
   **并且** 不得用独立 `Empty State（空状态）` section 让用户跨段落拼语义。

6. **Default human mode avoids raw-field duplication（默认人类模式避免 raw field 双写）**
   **前提** renderer 同时可输出本地化人类文本和 stable machine fields；
   **当** 使用默认 human-readable mode；
   **则** 不得同时输出同一事实的本地化行与 raw field 行，例如 `待处理 steps` 与 `pendingSteps=...`；
   **并且** raw field 应留给 `--json` 或未来显式 `--verbose` profile。

7. **Color is optional and never semantic-only（颜色可选且不能承载唯一语义）**
   **前提** TTY 支持 ANSI color；
   **当** human-readable output 使用颜色；
   **则** 颜色只能增强扫描效率；
   **并且** `NO_COLOR`、CI、non-TTY、docs 示例和 fixture 不得包含 ANSI escape，且无色输出必须保留完整状态、severity、issue id、path 和 next action 文本。

8. **Install absolute-target preview is the first migration sample（install 绝对目标预览是首个迁移样例）**
   **前提** 用户从 `/Users/fancyliu/Repos/SpecLite` 或其他非 target cwd 执行 `speclite install /Users/fancyliu/Repos/noi`；
   **当** 输出 prewrite-paused human result；
   **则** human output 必须清楚展示 `targetProject=noi` 与目标绝对路径，可使用 `目标项目：noi（/Users/fancyliu/Repos/noi）` 或相邻 `目标路径：/Users/fancyliu/Repos/noi`；
   **并且** `Next Actions（下一步）` 必须使用路径安全目标：默认安装命令包含 `/Users/fancyliu/Repos/noi --yes`，自定义安装命令包含 `/Users/fancyliu/Repos/noi --yes --interactive`；
   **并且** JSON output 不得因此暴露目标绝对路径。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Introduce presentation profile taxonomy（AC: 1-3）
  - [x] 在 `src/diagnostics/output.ts` 或新增等价 helper 中定义 `operation`、`diagnostic`、`report-support` profile。
  - [x] 建立 command-to-profile mapping：`install`、`init`、`update`、`update.repair`、`sync`、`uninstall` 属于 Operation；`status`、`validate`、`doctor` 属于 Diagnostic；`list`、`governance-report`、`resolve --human` 属于 Report / Support。
  - [x] 让 renderer 显式选择 profile，而不是所有 command 共享单一固定 section 顺序。

- [x] Task 2: Refactor shared human frame without changing JSON（AC: 1-7）
  - [x] 将 section 渲染改为 profile-aware section list，允许 `Plan / Evidence`、`Results`、`Metrics`、`Gaps`、`Artifacts` 等 profile-specific title。
  - [x] 移除默认 human output 中表达同一事实的 raw-field 双写；保留技术标识本身，但不重复本地化 label 与 `field=value`。
  - [x] 将 common empty state 归并到所属 section，例如 `Issues`、`Conflicts`、`Gaps`、`Plan` 或 `Results`，不再输出独立 `Empty State`。
  - [x] 保持 `renderCommandResultJson()`、exit code、issue ordering、public paths 和 schema contract 不变。

- [x] Task 3: Implement install path-safe presentation context（AC: 4, 8）
  - [x] 为 `install` human renderer 提供 target presentation context，例如 non-enumerable result metadata 或显式 renderer context；不得新增 public JSON field。
  - [x] 对绝对 target path 和跨 cwd 执行场景，在 `Scope（范围）` 展示目标项目、目标绝对路径和命令执行目录。
  - [x] `Next Actions（下一步）` 生成命令必须基于用户运行命令时的执行目录可安全复制执行；不能仅使用 `targetProject` basename。
  - [x] 自定义安装建议命令必须使用 `speclite install <target> --yes --interactive`，避免把 `--interactive` 误描述成无需写入授权即可完成安装。

- [x] Task 4: Define optional color policy and terminal guards（AC: 7）
  - [x] 如果加入 ANSI color，只能通过集中 helper 输出状态、severity 或 section emphasis，不得在各 renderer 内散落 escape code。
  - [x] 在 `NO_COLOR`、CI、non-TTY、docs fixture 和 test fixture 下强制无 ANSI。
  - [x] 无色输出必须可读且信息完整；测试断言不得依赖颜色。

- [x] Task 5: Tests and documentation matrix（AC: 1-8）
  - [x] 扩展 `test/install-outcome-human-output.test.ts`，覆盖 absolute target preview、目标绝对路径、执行目录、path-safe Next Actions、无 raw step 双写、无独立 `Empty State`。
  - [x] 扩展 `test/cli-output-presentation.test.ts` 或新增等价 focused tests，覆盖三类 profile 的 section order、empty state ownership 和 JSON parity。
  - [x] 扩展 `test/cli-message-catalog.test.ts`，确保默认中文自然语言不透传英文内部 actions，技术标识仍保留英文。
  - [x] 更新 `docs/reference/cli-human-output-matrix.md`，记录 profile mapping、颜色归一化和 install 首个迁移样例。
  - [x] 运行 focused tests、`npm run build`、`npm test` 和 `git diff --check`，或记录真实阻塞。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md:428`
- UX design system: `_bmad-output/planning-artifacts/ux-design-specification.md:246`
- UX output primitives: `_bmad-output/planning-artifacts/ux-design-specification.md:267`
- CommandResult contract: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:58`
- Human output matrix: `docs/reference/cli-human-output-matrix.md:14`
- Existing Story 8.1 shared frame: `_bmad-output/implementation-artifacts/stories/8-1-shared-cli-outcome-and-presentation-contract.md`
- Existing Story 8.6 localized actions: `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
- Existing Story 8.7 matrix policy: `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`

### Current Implementation Anchors（当前实现锚点）

- `src/diagnostics/output.ts:89` 定义当前 `PresentationFrameInput`，但没有 profile field。
- `src/diagnostics/output.ts:116` 到 `src/diagnostics/output.ts:145` 使用固定 section 顺序，并在 `Issues` 后追加独立 `Empty State`。
- `src/diagnostics/output.ts:317` 到 `src/diagnostics/output.ts:357` 是 `install` 当前 human renderer；Scope 仅输出 `targetProject` 和 `projectRoot`，State 同时输出本地化 step 与 raw `completedSteps=` / `pendingSteps=`。
- `src/diagnostics/output.ts:760` 到 `src/diagnostics/output.ts:790` 的 ready summary 也存在本地化字段与 raw field 混排，Story 8.8 实现时需判断是否一并收敛，或记录为后续 `--verbose` 方案。
- `src/fs/path-normalizer.ts:14` 到 `src/fs/path-normalizer.ts:35` 当前会把绝对 target 解析为 `targetRoot`，但 public `displayPath` 退化为 basename；这适合 JSON/public redaction，不足以支撑跨目录 human Next Actions。
- `src/commands/install.ts:1280` 到 `src/commands/install.ts:1334` 当前 prewrite summary 和 next actions 使用 `targetDisplayPath`，并把 custom install 建议为 `--interactive`，缺少 `--yes --interactive`。
- `src/bin/speclite.ts:331` 到 `src/bin/speclite.ts:379` 已有 `--yes`、`--interactive` 与 prompt 接线；Story 8.8 主要修正 human suggestion，不改变 install core flow。
- `test/install-outcome-human-output.test.ts:68` 到 `test/install-outcome-human-output.test.ts:97` 当前工作树已有 absolute-target focused expectation，可作为本 Story 的首个 regression anchor 或按等价测试保留。

### Known Install Issues Included（已纳入的真实 Install 问题）

- `目标项目：noi` 需要补足项目绝对路径或相邻 `目标路径` 行，避免用户不知道命令实际作用于哪个目录。
- `待处理 steps` 与 `pendingSteps=` 属于同一事实的双写，默认 human output 应只保留一种人类可读表达。
- `Next Actions（下一步）` 不能在跨目录执行时提示 `speclite install noi --yes`；必须使用从当前执行目录可安全复制的 target。
- 自定义安装提示应是 `speclite install <target> --yes --interactive`，因为完成安装仍需要显式写入授权。
- `Issues（问题）` 下无内容时应显示 `- 无问题`，不应让空白 Issues 和独立 `Empty State（空状态）` 分裂语义。
- 颜色可以作为 TTY 扫描增强，但不能污染 docs/fixture，也不能成为区分 success/warning/error 的唯一信号。

### Command Profile Map（命令 Profile 映射）

| Command | Profile | Story 8.8 Expectation |
| --- | --- | --- |
| `install` | Operation | 本 Story 首个完整迁移样例；必须修复 absolute target、Next Actions、empty state 和 raw-field 双写。 |
| `init` | Operation | 若 renderer 被触达，使用 write authorization / plan / issues / next actions 结构；不强制新增本 Story 外的 init 行为。 |
| `update` | Operation | 保持 Story 8.3 的 plan/conflict/applied/partial evidence；如调整 frame，必须保留 update safety semantics。 |
| `update --repair` | Operation | 保持 explicit repair boundary；不得把 repair 混入普通 update。 |
| `sync` | Operation | 未来迁移时使用 sync plan、authorization、changed/skipped/conflicts。 |
| `uninstall` | Operation | 未来迁移时使用 uninstall plan、authorization、removed/preserved paths。 |
| `status` | Diagnostic | 保持轻量只读 summary；Issues 不深埋，command success 不等于 installation health passed。 |
| `validate` | Diagnostic | 保持 issue counts、checked categories、checked targets、validated paths 和 sorted Issues。 |
| `doctor` | Diagnostic | 使用 richer diagnostics 与 external access evidence；critical/error 靠前。 |
| `list` | Report / Support | 使用 Results/Versions/IDE targets，不强套空 State。 |
| `governance-report` | Report / Support | 使用 Metrics/Gaps/Artifacts/Evidence，不强套 Operation State。 |
| `resolve config --human` | Report / Support | 保持 opt-in human support frame；默认 resolve stdout 仍 pure JSON。 |
| `resolve customization --human` | Report / Support | 保持 skill path/requested key/source path 可见；默认 resolve stdout 仍 pure JSON。 |

### Scope Boundary（范围边界）

- 不改变 command core behavior、write authorization、prompt flow、exit code 或 issue sorting。
- 不新增 public JSON fields；`targetProject` 仍是 stable display identifier，`data.paths.projectRoot` 仍为 `"."`。
- 不让 automation 解析 human output；human profile 只改善终端可读性。
- 不引入 spinner-only progress、interactive TUI framework 或 daemon。
- 不强制 Story 8.8 全量重写 Post-MVP renderer；但所有现有 renderer 必须有明确 profile mapping，后续被触达时按该 profile 迁移。

## Dependency Gate（依赖门禁）

- Story 8.1、8.6、8.7 已完成，提供 shared frame、message catalog 和 matrix 基础。
- `01-command-result-json-contract.md` 对 public JSON path policy 有优先级；human absolute target context 不得泄漏到 JSON。
- 如果实现选择 non-enumerable metadata，必须用 `renderCommandResultJson()` 或 JSON serialization test 证明 metadata 不进入 JSON。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `01-command-result-json-contract.md` | `targetProject` 不得变成绝对路径，JSON 不因 human presentation 改变。 |
| UX Anchor | `ux-design-specification.md` | CLI output primitives、Next Actions、JSON parity 和 docs/fixture 结构语言。 |
| Functional Anchor | `src/diagnostics/output.ts` | Profile-aware human renderer。 |
| Functional Anchor | `src/fs/path-normalizer.ts` | 区分 public display path 与 human presentation context。 |
| Functional Anchor | `src/commands/install.ts` | install target context 与 prewrite next actions source。 |
| Evidence Anchor | `test/install-outcome-human-output.test.ts` | absolute target install regression。 |
| Evidence Anchor | `test/cli-human-output-matrix.test.ts` | NO_COLOR/non-TTY/CI、JSON parity 和 docs matrix。 |

## Equivalent Implementation Policy（等价实现策略）

Profile taxonomy 可以放在 `src/diagnostics/output.ts`、`src/cli/presentation.ts` 或更细的 `src/diagnostics/*` helper 中。只要所有 human renderers 显式选择 profile、tests 覆盖同一语义、JSON contract 不变，即可视为等价。

目标路径上下文可以通过 non-enumerable metadata、renderer options 或 command outcome side channel 传递。不能接受把绝对路径写入 public `CommandResult` JSON，也不能接受继续用 basename 生成跨目录 Next Actions。

## Evidence Plan（证据计划）

- `npm test -- test/install-outcome-human-output.test.ts`
- `npm test -- test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts`
- `npm test -- test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`
- `npm run build`
- `npm test`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

- `npm test -- test/install-outcome-human-output.test.ts test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts`：26 tests passed。
- `npm test -- test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：59 tests passed。
- `npm run build`：tsup ESM 与 DTS build passed。
- `npm test`：52 files / 371 tests passed。
- `git diff --check`：passed。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- RED：`npm test -- test/install-outcome-human-output.test.ts` 初始失败，缺少 `目标路径` / `命令执行目录`，Next Actions 退化为 basename，并存在 raw steps 与独立 `Empty State`。
- GREEN：Story 8.8 focused tests、相关 command renderer 回归、build、全量测试和 diff whitespace gate 均通过。
- Build 修正：`exactOptionalPropertyTypes` 要求 helper 调用不能显式传入 `undefined`，已改为条件 spread。

### Completion Notes（完成说明）

- 在 `src/diagnostics/output.ts` 中加入 `operation`、`diagnostic`、`report-support` profile taxonomy 和 command-to-profile mapping；shared human frame 按 profile 排 section，Diagnostic 输出让 `Issues` 靠近 `State`。
- 移除 shared frame 的独立 `Empty State` section；默认无问题等 empty state 归入 `Issues` section，例如 `- 无问题`。
- install human output 通过 non-enumerable presentation context 展示 absolute target path 与 command cwd，并用该 context 生成 path-safe `Next Actions`；`renderCommandResultJson()` 不泄漏 absolute target path。
- install custom suggestion 已统一为 `speclite install <target> --yes --interactive`；默认 human install/ready summary 移除 `completedSteps=`、`pendingSteps=`、`selectedModules=` 等 raw-field 双写。
- docs matrix 补充 presentation profile mapping、颜色/fixture policy 和 install absolute-target migration sample。

### File List（文件清单）

- `src/diagnostics/output.ts`
- `src/diagnostics/install-presentation-context.ts`
- `src/commands/install.ts`
- `src/cli/messages.ts`
- `docs/reference/cli-human-output-matrix.md`
- `test/install-outcome-human-output.test.ts`
- `test/cli-output-presentation.test.ts`
- `test/cli-message-catalog.test.ts`
- `test/cli-human-output-matrix.test.ts`
- `test/cli-smoke.test.ts`
- `_bmad-output/implementation-artifacts/stories/8-8-cli-human-output-presentation-profiles.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-16 | 0.1 | 创建 Epic 8.8 ready-for-dev Story，固化 CLI human output presentation profiles，并纳入 install 真实输出问题。 | GPT-5 Codex |
| 2026-06-16 | 1.0 | 实现 profile-aware shared human frame、install path-safe presentation context、默认 human raw-field 去重、docs matrix 和 focused/regression tests；状态更新为 review。 | GPT-5 Codex |
