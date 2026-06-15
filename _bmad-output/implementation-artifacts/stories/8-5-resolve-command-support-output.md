# Story 8.5: Resolve Command Support Output（Resolve 命令支持输出）

Status: done

<!-- Corrective planning Story: resolve 是 runtime support command；任何 human output 改动必须保护 installed skills 依赖的 pure JSON stdout。 -->

## Story（故事）

作为已安装 skill 或调试 runtime 的维护者，
我希望 `speclite resolve config` 和 `speclite resolve customization` 输出清楚说明解析成功、fallback、warning 或失败原因，
以便定位配置合并和 customization lookup 问题。

## Acceptance Criteria（验收标准）

1. **Successful resolve output explains requested key and source（成功 resolve 输出说明 key 与来源）**
   **前提** resolve config/customization 成功；
   **当** 输出 human-readable result；
   **则** outcome 为 `resolved`；
   **并且** 输出必须展示 requested key、resolved layer、source path 和 value summary。

2. **Fallback or optional-layer warning shows resolved-with-warnings（Fallback 或 optional layer warning 显示 resolved-with-warnings）**
   **前提** resolver 使用 fallback 或 optional layer 失败但仍能返回结果；
   **当** 输出 human-readable result；
   **则** outcome 为 `resolved-with-warnings`；
   **并且** warning 必须指出 fallback 来源和用户可检查的路径。

3. **Unresolved values show unresolved（无法返回值显示 unresolved）**
   **前提** resolver 无法返回请求值；
   **当** 输出 human-readable result；
   **则** outcome 为 `unresolved`；
   **并且** Issues 必须包含 reason、missing key 或 failed layer。

4. **Invalid input shows invalid-input（非法输入显示 invalid-input）**
   **前提** 用户传入非法 key、非法 project root 或不支持的 resolver 参数；
   **当** 命令停止；
   **则** outcome 为 `invalid-input`；
   **并且** Next Actions 必须说明合法命令形态。

### Resolve Output Mode Decision（Resolve 输出模式裁决）

- 默认 `speclite resolve config` 和 `speclite resolve customization` 必须继续保持 machine contract：stdout 只输出 resolved JSON object，stderr 只输出 JSON Lines diagnostics，不得混入 human-readable prose。
- 默认 missing key behavior 不变：stdout 为 `{}`，exit code 为 0，stderr 为空。Missing key 在默认 JSON mode 下不是 failure。
- Human-readable resolve support 必须通过显式 `--human` opt-in 入口触发；未传入 `--human` 时，不得改变 stdout/stderr/exit code 的既有 automation contract。
- `unresolved` 只适用于显式 human mode 中的 missing key、empty result 或 failure 说明；它不得改变 default JSON mode 的 `{}` / exit 0 / empty stderr 行为。
- Dev 阶段必须把 `--human` 入口同步记录到 `06-resolve-command-contract.md`、commander registration、docs、tests 和 fixtures；本 SR fixer 不修改 SPEC，除非后续确认 Story 无法在上述保守裁决下自洽。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Resolve contract decision before changing stdout behavior（AC: 1-4）
  - [x] 读取并更新 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`，记录默认 stdout/stderr/exit code machine contract 继续不变，并新增显式 `--human` opt-in human-readable output 入口。
  - [x] 保护现有 runtime support：默认 `resolve config/customization` stdout 继续 pure JSON；默认 missing key 保持 stdout `{}`、exit code 0、stderr empty。
  - [x] 在 commander registration、docs、tests 和 fixtures 中记录 `--human`，并证明未传入 `--human` 时 installed skills 的 automation contract 不被破坏。
  - [x] 更新 `src/config/resolve-output-schema.ts` 或等价 schema/parser anchor 时，只允许补充 human mode 所需解析/fixture 支撑，不得把默认 JSON mode 改成 `CommandResult`。

- [x] Task 2: Add resolve human output mode（AC: 1-4）
  - [x] 在 `src/commands/resolve.ts` 中新增 explicit human output path 或等价 presentation hook。
  - [x] Human mode 使用 Story 8.1 shared frame：Outcome、Summary、Scope、Evidence、Issues、Next Actions。
  - [x] 成功时展示 requested key、resolved layer/source path、value summary；不得泄露 absolute project root。

- [x] Task 3: Preserve JSON Lines diagnostics and parity（AC: 2-4）
  - [x] Optional layer warning 仍可作为 `ValidationIssue` shape 输出；human mode 可以渲染，但 JSON mode 必须保持 schema。
  - [x] Missing key 的现有默认 `{}` / exit 0 / empty stderr 语义不得改变；human mode 可以把 missing key 或 empty result 解释为 `unresolved`，但只能在显式 `--human` 下发生。
  - [x] Invalid input 使用 existing `runtime-path.missing-entry` 或 SPEC 指定 issue id。

- [x] Task 4: Tests（AC: 1-4）
  - [x] 扩展 `test/resolve-cli.test.ts`，覆盖默认 pure JSON 不破坏、explicit human mode resolved/resolved-with-warnings/unresolved/invalid-input。
  - [x] 覆盖 stdout/stderr separation、JSON Lines diagnostics、中文 locale 技术标识保留和 redaction。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- Resolve contract: `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- CommandResult exception note: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- Architecture resolve support command rules: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`

### Current Implementation Anchors（当前实现锚点）

- CLI registration: `src/commands/resolve.ts`
- Config resolver: `src/config/config-reader.ts`
- Customization resolver: `src/config/customization-reader.ts`
- Diagnostics: `src/config/resolve-diagnostics.ts`
- Output schema: `src/config/resolve-output-schema.ts`
- Existing tests and fixtures: `test/resolve-cli.test.ts`, `test/resolve-readers.test.ts`, `test/fixtures/resolve-parity/`

### Scope Boundary（范围边界）

- 不破坏 installed skills 依赖的 resolve pure JSON stdout。
- 不把 resolve 改成 `CommandResult`，除非 owning SPEC 明确改变 exception boundary。
- 不改变 merge order、optional/required layer semantics、missing key behavior 或 fallback project search，除非 SPEC 同步更新。
- 不泄露 absolute path、home directory、cache path 或 raw exceptions。

## Dependency Gate（依赖门禁）

- 本 Story 必须先处理 resolve contract 与 Epic 8 human output 目标之间的冲突：现有 contract 要求 stdout pure JSON，Epic 8 要求 human-readable result。不能直接改默认 stdout。
- 若引入 new flag，必须在 commander registration、docs、tests 和 SPEC 中一致记录。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `06-resolve-command-contract.md` | Resolve stdout/stderr、merge order、missing key、fallback behavior。 |
| Contract Anchor | `01-command-result-json-contract.md` | Resolve 是 explicit exception，不使用 CommandResult。 |
| Functional Anchor | `src/commands/resolve.ts` | Current CLI behavior source。 |
| Functional Anchor | `src/config/*reader.ts` | Config/customization resolution source。 |
| Evidence Anchor | resolve parity tests | 证明 existing JSON mode 和 new human mode 不冲突。 |

## Equivalent Implementation Policy（等价实现策略）

Human output mode 可以通过 flag、profile 或 wrapper command 暴露；只要 SPEC 已定义、default runtime support 不破坏、tests 覆盖即可等价。不能接受未改 SPEC 就改变 default stdout 的实现。

## Evidence Plan（证据计划）

- `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts`
- 新增 resolve human output tests
- `npm run build`
- `npm test`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-dev-story --key workflow`：失败，默认 `python3` 缺少 stdlib `tomllib`。
- `python3.12 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-dev-story --key workflow`：通过，workflow 无 prepend/append，persistent fact 为 `project-context.md`。
- `npm test -- test/resolve-cli.test.ts`：RED 阶段 6 个 `--human` 用例因未知 flag 失败；实现后 15/15 通过。
- `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts`：19/19 通过。
- `npm run build`：通过。
- `npm test`：49 个 test files / 356 个 tests 通过。
- `git diff --check`：通过。

### Completion Notes（完成说明）

- 为 `speclite resolve config/customization` 增加显式 `--human` opt-in support output，输出 `Outcome`、`Summary`、`Scope`、`Evidence`、`Issues`、`Next Actions`。
- 默认 machine mode 未改：stdout 继续 pure JSON，stderr 继续 JSON Lines diagnostics；missing key 默认仍为 stdout `{}`、exit code 0、stderr empty。
- Human mode 覆盖 `resolved`、`resolved-with-warnings`、`unresolved`、`invalid-input`，并对 fallback / optional layer warning、missing key、required layer failure 和缺少必需参数给出脱敏说明。
- 更新 resolve contract SPEC、CLI reference、README、schema anchor、fixtures 和 focused tests；未引入 `CommandResult` envelope，未改变 merge order、optional/required layer semantics 或 fallback project search。

### File List（文件清单）

- `README.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- `docs/reference/cli.md`
- `src/commands/resolve.ts`
- `src/config/resolve-output-schema.ts`
- `test/fixtures/resolve-parity/README.md`
- `test/fixtures/resolve-parity/expected/human/config-invalid-input.txt`
- `test/fixtures/resolve-parity/expected/human/config-resolved-with-warnings.txt`
- `test/fixtures/resolve-parity/expected/human/config-resolved.txt`
- `test/fixtures/resolve-parity/expected/human/config-unresolved.txt`
- `test/resolve-cli.test.ts`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-15 | 0.1 | 创建 Epic 8.5 ready-for-dev Story，明确 resolve human output 必须保护 pure JSON runtime support contract。 | Amelia |
| 2026-06-16 | 0.2 | 实现 explicit `--human` resolve support output，并保持默认 pure JSON runtime support contract 不变。 | GPT-5 Codex |
