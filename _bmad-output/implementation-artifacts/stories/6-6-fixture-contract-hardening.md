# Story 6.6: Fixture Contract Hardening（Fixture Contract 收口）

Status: done

<!-- Note: This file is ready-for-dev story context. It is not evidence that the CR TODOs are closed or that fixture contract hardening has already been implemented. -->

## Story（故事）

作为 SpecLite 维护者，
我希望收口 release confidence fixture 的输入外置、时间戳契约、fixture 分类和路径逃逸断言，
以便 CR TODO 中暴露的 fixture contract 缺口被证据化关闭，而不是继续依赖 test helper 或弱断言。

## Acceptance Criteria（验收标准）

1. **Resolve parity inputs are fixture-owned（Resolve Parity 输入归 Fixture 管理）**
   **前提** `resolve-parity` fixture 运行；
   **当** 测试 config 和 customization merge parity；
   **则** input config/customization layers 必须来自 `test/fixtures/resolve-parity/input/` 下的 fixture assets；
   **并且** `test/resolve-cli.test.ts` 或等价 helper 不得再硬编码真实 layer 内容、directory tree 或 expected merge input。

2. **Generated timestamp contract is internally consistent（生成时间戳契约内部一致）**
   **前提** public JSON、manifest/index、fixture snapshot 或 artifact metadata 包含 `generatedAt`；
   **当** schema、parser、fixture comparator、expected outputs 和 story/spec wording 校验时间戳；
   **则** 必须选择并同步一个明确契约：canonical UTC ISO string，或 owning SPEC 允许的 broader parseable ISO string；
   **并且** 不允许 schema 只接受 canonical UTC、fixture/story 却声称任意 ISO parseable string 的漂移。

3. **Source-integrity variant classification is explicit（三段式 Source Integrity 分类显式化）**
   **前提** `source-integrity` fixture 使用三段式 case id，例如 `<group>/<sub-case>/<variant>`；
   **当** fixture registry、manifest、runner 或 tests 分类 release gate 与 regression assets；
   **则** 三段式 id 必须由 fixture contract、registry 和 tests 明确定义；
   **并且** 不得让 release gate variant 因未注册而得到 `undefined`、ambiguous 或 silently non-gate classification。

4. **Dynamic path escape gate asserts reason（动态 Path Escape Gate 断言 Reason）**
   **前提** path-portability dynamic CLI gate 覆盖 artifact path escape；
   **当** validation issue 指向项目边界外路径；
   **则** test 必须断言 `artifact-path.escapes-project` 的 `details.reason = path-escapes-project`；
   **并且** 不得只断言 issue id 存在。

5. **CR TODO bookkeeping is evidence-bound（CR TODO 关闭绑定证据）**
   **前提** 本 Story 范围内缺口被修复；
   **当** 更新 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`；
   **则** 仅关闭 `TODO-001`、`TODO-002`、`TODO-005`、`TODO-006` 中已有代码、fixture 和测试证据支撑的项；
   **并且** 不得提前关闭 packaging gate、default `npm test` stability、Git `confirmationState` 或其它后续 Story 范围 TODO。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Preflight and contract reading（AC: 1-5）
  - [x] 读取 `_bmad-output/planning-artifacts/specs/README.md`，再按 owning SPEC reading order 读取 `04-manifest-index-contract.md`、`06-resolve-command-contract.md`、`07-validation-issue-taxonomy.md` 和 `08-fixture-contract.md`。
  - [x] 读取 Story 6.1、6.3、6.4 和本 Story，确认 fixture layout、resolve parity、source-integrity classification、path portability gate 的既有边界。
  - [x] 检查 dirty worktree；不得回滚或格式化用户、父 agent 或其它流程产生的无关改动。

- [x] Task 2: Externalize resolve parity input layers（AC: 1）
  - [x] 将 config merge parity 的真实 input layers 放入 `test/fixtures/resolve-parity/input/config/`。
  - [x] 将 customization merge parity 的真实 input layers 放入 `test/fixtures/resolve-parity/input/customization/`。
  - [x] 调整 test helper，使其复制或读取 fixture input assets，而不是在 helper 中手写真实 layer 内容。
  - [x] 保留 `test/fixtures/resolve-parity/expected/` 中的 stdout JSON 和 stderr JSON Lines expected outputs。

- [x] Task 3: Align `generatedAt` contract（AC: 2）
  - [x] 复核 `src/manifest/manifest-schema.ts` 或等价 schema 当前对 `generatedAt` 的校验语义。
  - [x] 若保留 canonical UTC，更新 Story/spec/test wording，使 fixture/artifact metadata 不再声称接受任意 parseable ISO string。
  - [x] 若改为 broader ISO parseability，先更新 owning SPEC，再更新 schema/parser/comparator/tests。
  - [x] 保证 stable comparison normalize、omit 或 exclude concrete `generatedAt` value，不比较环境相关时间。

- [x] Task 4: Fix source-integrity variant classification（AC: 3）
  - [x] 复核 `src/fixtures/fixture-contract.ts` 中 fixture id parser、registry、classification 和 manifest projection。
  - [x] 将三段式 `source-integrity/<sub-case>/<variant>` 行为写成明确 contract 和 registry rule，或调整 fixture ids 回到已注册的两段式 contract。
  - [x] 补充 tests 覆盖三段式 variant 不再得到 `undefined` classification。

- [x] Task 5: Strengthen dynamic path escape assertion（AC: 4）
  - [x] 复核 `test/story-6-4-path-portability.test.ts` 或等价 dynamic CLI gate。
  - [x] 确保 dynamic test 构造 artifact path escape，并断言 issue id 与 `details.reason = path-escapes-project`。
  - [x] 保留 existing expected snapshot gate 对 path escape reason 的断言。

- [x] Task 6: Update CR TODO evidence for this Story only（AC: 5）
  - [x] 对已关闭项更新 `cr-todo-backlog.md` 的 status、resolved date、resolution evidence 和 affected files。
  - [x] 保持未实现项为 `open`，并在 notes 中说明由 Story 6.7 或 6.8 处理。

- [x] Task 7: Verification（AC: 1-5）
  - [x] 运行 affected tests：resolve parity、fixture contract/source-integrity classification、path portability dynamic gate、manifest/artifact timestamp schema。
  - [x] 运行 `npm run build`。
  - [x] 若本 Story 改动触及 shared test/runtime behavior，运行默认 `npm test`；若失败，记录失败命令和原因，不得伪造通过。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，`epic-6` 为 `in-progress`，Story 6.1-6.5 均已 `done`，`epic-6-retrospective` 已 `done`。本 Story 创建后只新增 `6-6-fixture-contract-hardening: ready-for-dev`，不得改动 6.1-6.5 或 retrospective 状态。
- `TODO-001` 已被重新定义为“收口 `resolve-parity` fixture input cases”：expected stdout JSON 和 stderr JSON Lines 已在 `test/fixtures/resolve-parity/expected/`，剩余缺口是 `input/config/` 与 `input/customization/` 仍未承载真实 layers。
- `TODO-002` 指向 `generatedAt` wording 与 schema 语义漂移。当前实现证据显示 schema 以 canonical UTC ISO string 为准，但 Story 6.5 wording 曾使用 broader parseable ISO phrasing。
- `TODO-005` 指向 `source-integrity` 三段式 variant classification。当前 fixture registry 需要显式说明或测试覆盖，避免 variant case 落到 undefined classification。
- `TODO-006` 指向 dynamic CLI path escape gate 断言弱化。当前 expected snapshot 已覆盖 reason，但 dynamic test 仍需断言 `details.reason`。

### Scope Boundary（范围边界）

- 本 Story 负责 `TODO-001`、`TODO-002`、`TODO-005`、`TODO-006` 的代码、fixture、test 和 backlog 证据化关闭。
- 本 Story 不负责 `TODO-003` default `npm test` timeout、`TODO-007` release packaging gate、`TODO-008` packaged docs example assertion 或 `TODO-004` Git confirmed assertion regression；这些由 Story 6.7 和 6.8 处理。
- 不要新增第二套 config/customization merge implementation。`src/config/` 仍是唯一 merge implementation boundary。
- 不要通过只修改 snapshots 关闭 TODO。Contract changes 必须先更新 owning SPEC，再更新 executable schema/parser，最后更新 fixtures。

### Architecture Requirements（架构要求）

- Runtime baseline 仍是 Node.js 22 minimum、Node.js 24 recommended。不得引入 Node 24-only API，除非同步 runtime policy 和 tests。
- Fixture layout、expected outputs、release gate ownership matrix 和 regression asset policy 以 `08-fixture-contract.md` 为真源。
- `speclite resolve` stdout 是 pure resolved JSON object，stderr diagnostics 是 `ValidationIssue` JSON Lines；fixture helper 不得实现第二套 TOML merge。
- Public path fields 和 fixture snapshots 必须使用 project-relative POSIX-style path，不得包含 checkout root、home directory、absolute path、drive letter 或 OS-specific separators。

### Implementation Anchors（实现锚点）

```text
src/config/
src/fixtures/fixture-contract.ts
src/manifest/manifest-schema.ts
src/validation/rules/artifact-path.ts
test/resolve-cli.test.ts
test/story-6-4-path-portability.test.ts
test/fixtures/resolve-parity/input/config/
test/fixtures/resolve-parity/input/customization/
test/fixtures/resolve-parity/expected/
test/fixtures/source-integrity/
_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md
```

### Previous Story Intelligence（前序 Story 情报）

- Story 6.3 已将 `resolve-parity` expected stdout/stderr assets 外置，但 helper 仍可能生成真实 input tree。
- Story 6.4 已建立 path portability gate，并在 expected snapshot 中覆盖 path escape reason；本 Story 只补 dynamic assertion 强度。
- Story 6.5 的 artifact metadata wording 暴露 `generatedAt` parseability 与 schema canonical UTC 校验之间的口径风险。

### References（参考）

- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- `_bmad-output/implementation-artifacts/stories/6-3-drift-source-integrity-and-resolve-parity-fixtures.md`
- `_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md`
- `_bmad-output/implementation-artifacts/stories/6-5-skill-artifact-loop-and-documentation-examples.md`

## Dev Agent Record（开发代理记录）

### Agent Model Used

GPT-5.5

### Debug Log References

- 2026-06-02 17:58 CST: `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 失败，原因是当前 `python3` 缺少 stdlib `tomllib`；已按 skill fallback 读取默认 customization，无 team/user override。
- 2026-06-02 18:00 CST: `npx vitest run test/resolve-cli.test.ts test/fixture-contract.test.ts test/artifact-metadata.test.ts test/story-6-4-path-portability.test.ts` red phase 失败，4 个失败均对应 Story 6.6 缺口。
- 2026-06-02 18:03 CST: 同一 focused Vitest 命令通过，4 files / 31 tests passed。
- 2026-06-02 18:05 CST: `npm run build` 通过。
- 2026-06-02 18:05 CST: 首次 `npm test` 失败，原因是 touched-surface `test/artifact-path-validation.test.ts` 仍断言旧 `outside-configured-root` reason；已同步为 Story 6.6 的 `path-escapes-project` reason。
- 2026-06-02 18:06 CST: `npx vitest run test/artifact-path-validation.test.ts test/story-6-4-path-portability.test.ts` 通过，2 files / 15 tests passed。
- 2026-06-02 18:06 CST: `npm test` 通过，37 files / 284 tests passed。
- 2026-06-02 18:06 CST: `git diff --check` 通过。

### Completion Notes List

- 已将 `resolve-parity` config/customization 真实 input layers 外置到 `test/fixtures/resolve-parity/input/`，并让 `test/resolve-cli.test.ts` 从 fixture assets 复制临时项目树，不再手写真实 layer 内容。
- 已保留 `generatedAt` canonical UTC / `Date.toISOString()` 契约，并同步 Manifest SPEC、Fixture SPEC、schema 错误信息和 artifact metadata regression test。
- 已将三段式 `source-integrity/<required-sub-case>/<variant>` 明确定义为 required fixture group sub-case 的细分 evidence，并补充 `local-tarball-unreadable` variant classification 断言。
- 已补强 dynamic path-portability CLI gate：真实 `speclite validate --json` 输出现在断言 `artifact-path.escapes-project` 的 `affectedPath`、`details.pathRole` 和 `details.reason = path-escapes-project`。
- 已按 Story 范围关闭 `TODO-001`、`TODO-002`、`TODO-005`、`TODO-006`，并保留 `TODO-003`、`TODO-007`、`TODO-008` 为 open。

### File List

- `_bmad-output/implementation-artifacts/code-reviews/6-6-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/6-6-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/6-6-fixture-contract-hardening.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `dist/packaging-manifest.json`
- `src/fixtures/fixture-contract.ts`
- `src/manifest/manifest-schema.ts`
- `src/validation/rules/artifact-path.ts`
- `test/artifact-metadata.test.ts`
- `test/artifact-path-validation.test.ts`
- `test/fixture-contract.test.ts`
- `test/fixtures/resolve-parity/README.md`
- `test/fixtures/resolve-parity/input/config/_speclite/config.toml`
- `test/fixtures/resolve-parity/input/config/_speclite/config.user.toml`
- `test/fixtures/resolve-parity/input/config/_speclite/custom/config.toml`
- `test/fixtures/resolve-parity/input/config/_speclite/custom/config.user.toml`
- `test/fixtures/resolve-parity/input/config-broken-optional/_speclite/config.toml`
- `test/fixtures/resolve-parity/input/config-broken-optional/_speclite/config.user.toml`
- `test/fixtures/resolve-parity/input/config-broken-optional/_speclite/custom/config.toml`
- `test/fixtures/resolve-parity/input/config-broken-optional/_speclite/custom/config.user.toml`
- `test/fixtures/resolve-parity/input/customization/.claude/skills/speclite-create-story/customize.toml`
- `test/fixtures/resolve-parity/input/customization/_speclite/custom/speclite-create-story.toml`
- `test/fixtures/resolve-parity/input/customization/_speclite/custom/speclite-create-story.user.toml`
- `test/resolve-cli.test.ts`
- `test/story-6-4-path-portability.test.ts`

## Change Log（变更日志）

- 2026-06-02: Created ready-for-dev Story 6.6 from CR TODO backlog closure plan.
- 2026-06-02: Implemented fixture contract hardening for TODO-001, TODO-002, TODO-005 and TODO-006; status moved to review.
