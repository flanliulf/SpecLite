# Story 6.7: Packaging Gate Hardening（Packaging Gate 收口）

Status: done

<!-- Note: This file is ready-for-dev story context. It is not evidence that release packaging verification or packaged documentation example assertions already exist. -->

## Story（故事）

作为 SpecLite 维护者，
我希望 release packaging gate 拥有稳定的串行入口、前置构建保障和文档示例打包断言，
以便发布前 package inventory 与 documentation example boundary 可以由单一 release command 验证。

## Acceptance Criteria（验收标准）

1. **Release verification command is serial and build-first（Release Verification 串行且先 Build）**
   **前提** 维护者执行 release verification；
   **当** 运行 package release gate；
   **则** 必须存在稳定入口，例如 `npm run release:verify` 或等价 script，按顺序执行 `npm run build` 和 `npm run release:packaging-check`；
   **并且** packaging check 不得在 stale `dist/`、缺失 bin 或未构建 runtime assets 上产生假阳性。

2. **Packaging check validates prerequisites（Packaging Check 校验前置条件）**
   **前提** `npm run release:packaging-check` 被直接运行；
   **当** build output 或 runtime assets 缺失；
   **则** check 必须 fail fast，并输出稳定 diagnostic 或 test assertion；
   **并且** 不得只依赖维护者记得先手动运行 build。

3. **Packaged documentation examples are non-empty and classified（打包文档示例非空且分类明确）**
   **前提** `dist/packaging-manifest.json` 包含 `packagedDocumentationExamples`；
   **当** packaging check 校验 documentation examples；
   **则** packaged documentation examples 必须有非空断言、明确 classification 和来源路径；
   **并且** 空数组、缺失路径、错误 classification 或误把 `test/fixtures/` 当作 docs example 都不得通过。

4. **Package inventory boundary remains strict（Package Inventory 边界保持严格）**
   **前提** npm package、local tarball 或 offline bundle acceptance 运行；
   **当** package inventory 被断言；
   **则** 必须覆盖 `package.json` bin mapping、`dist/bin/speclite.js`、runtime schemas、runtime scripts/templates、`assets/source/speclite/` 和明确允许的 docs examples；
   **并且** root `fixtures/` 与 `test/fixtures/` 默认不得进入 package。

5. **CR TODO bookkeeping is limited to packaging scope（CR TODO 关闭限于 Packaging 范围）**
   **前提** 本 Story 修复完成；
   **当** 更新 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`；
   **则** 只关闭 `TODO-007` 和 `TODO-008` 中已有代码、script、manifest 和 test 证据支撑的项；
   **并且** 保留 fixture contract 或 test stability TODO 给 Story 6.6/6.8。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Preflight and release contract review（AC: 1-5）
  - [x] 读取 `package.json`、`package-lock.json`、`scripts/release/packaging-check.mjs` 和 existing packaging tests。
  - [x] 读取 Story 6.4、6.5、`08-fixture-contract.md` 和 `cr-todo-backlog.md` 中 `TODO-007`、`TODO-008`。
  - [x] 检查 dirty worktree；不得回滚或格式化无关 story、planning artifact、source 或 generated files。

- [x] Task 2: Add or harden release verification script（AC: 1）
  - [x] 在 `package.json` 中新增或调整稳定 release verification script，使其串行执行 build 后再执行 packaging check。
  - [x] 保持 existing `release:packaging-check` 可直接运行；不要把全部逻辑塞进 shell-only one-off command。
  - [x] 如果已有等价 script，复用并强化其顺序和命名，不新增重复入口。

- [x] Task 3: Make packaging check prerequisite-aware（AC: 2）
  - [x] 在 `scripts/release/packaging-check.mjs` 或等价 module 中检测必要 build output 和 runtime assets。
  - [x] 缺失 prerequisite 时 fail fast，并输出稳定、可测试的 reason。
  - [x] 补充 tests 证明 stale 或 missing `dist/` 不会通过 packaging gate。

- [x] Task 4: Strengthen packaged docs example assertions（AC: 3）
  - [x] 明确 packaged documentation example 的来源、classification 和 inclusion rule。
  - [x] 断言 `packagedDocumentationExamples` 非空，且每个 entry 指向允许的 docs example path。
  - [x] 增加 negative tests 覆盖 empty docs example list、missing path、wrong classification、accidental `test/fixtures/` inclusion。

- [x] Task 5: Keep package inventory strict（AC: 4）
  - [x] 保留或补强 bin mapping、`dist/bin/speclite.js`、schemas、runtime scripts/templates 和 `assets/source/speclite/` assertions。
  - [x] 确认 `test/fixtures/` 与 root `fixtures/` 默认排除，除非通过 docs example classification 显式允许。
  - [x] 若使用 `npm pack --dry-run --json`，只作为辅助信号；acceptance artifact 仍以 `dist/packaging-manifest.json` 和 tests 为准。

- [x] Task 6: Update CR TODO evidence for packaging scope（AC: 5）
  - [x] 对已关闭的 `TODO-007`、`TODO-008` 更新 status、resolved date、resolution evidence 和 affected files。
  - [x] 不关闭 Story 6.6 或 6.8 范围的 TODO。

- [x] Task 7: Verification（AC: 1-5）
  - [x] 运行 packaging focused tests。
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm run release:packaging-check`。
  - [x] 运行新增或强化后的 release verification command。
  - [x] 若 package script 变更影响 default test flow，运行默认 `npm test`。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，`package.json` 已有 `build`、`test` 和 `release:packaging-check` scripts，但未确认存在 `release:verify` 串行入口。
- 当前 `scripts/release/packaging-check.mjs` 会生成或校验 package inventory，并派生 `packagedDocumentationExamples`；CR TODO 指出空数组使用 `.every(...)` 时可能误通过。
- Story 6.4 和 6.5 已把 packaging acceptance 与 packaged docs example boundary 纳入 Epic 6 范围；本 Story 只收口 release gate 执行顺序和 docs example assertion 强度。

### Scope Boundary（范围边界）

- 本 Story 负责 `TODO-007` 和 `TODO-008`。
- 本 Story 不负责 fixture input externalization、source-integrity classification、path escape reason、default `npm test` timeout 或 Git `confirmationState` assertion。
- 不要把 `test/fixtures/` 或 root `fixtures/` 打包成 release docs example 来让 assertion 变绿。Packaged docs example 必须有显式 classification。
- 不要引入新的 package manager、release service、CI vendor workflow 或 publishing automation；本 Story 只处理本地 release gate 和 package inventory assertion。

### Architecture Requirements（架构要求）

- Package acceptance artifact 仍是 `dist/packaging-manifest.json`。
- `npm pack --dry-run --json` 可以辅助 package inventory signal，但不能替代 project-owned packaging manifest。
- Release gate 必须 local-only、deterministic、CI-friendly，不依赖 network、real publishing、external registry write 或人工确认。
- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。

### Implementation Anchors（实现锚点）

```text
package.json
scripts/release/packaging-check.mjs
dist/packaging-manifest.json
test/story-6-4-path-portability.test.ts
test/fixtures/skill-artifact-loop/
_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md
```

### Previous Story Intelligence（前序 Story 情报）

- Story 6.4 已要求 release packaging acceptance 生成 `dist/packaging-manifest.json`，列出 package file inventory，并默认排除 `test/fixtures/` 与 root `fixtures/`。
- Story 6.5 已要求 documentation examples 来自 fixture expected outputs 或同一 semantic model，并在 packaging inventory 中显式标记 packaged documentation examples。

### References（参考）

- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/implementation-artifacts/stories/6-4-path-portability-and-runtime-matrix-evidence.md`
- `_bmad-output/implementation-artifacts/stories/6-5-skill-artifact-loop-and-documentation-examples.md`
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- `package.json`
- `scripts/release/packaging-check.mjs`

## Dev Agent Record（开发代理记录）

### Agent Model Used

GPT-5.5

### Debug Log References

- 2026-06-02 18:35 CST: `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 因 `tomllib` 缺失失败，按 skill fallback 读取 base customization；team/user override 不存在。
- 2026-06-02 18:35 CST: 读取 `package.json`、`package-lock.json`、`scripts/release/packaging-check.mjs`、Story 6.4/6.5、`08-fixture-contract.md`、`cr-todo-backlog.md` 和当前 dirty worktree。
- 2026-06-02 18:38 CST: RED `npm test -- test/release-packaging-check.test.ts` 失败，确认 `release:verify` 缺失、缺少 prerequisite/docs-example helpers，且原 packaging-check import 有 side effect。
- 2026-06-02 18:39 CST: GREEN `npm test -- test/release-packaging-check.test.ts` 通过，4 tests passed。
- 2026-06-02 18:39 CST: `npm run build` 通过。
- 2026-06-02 18:39 CST: `npm test -- test/release-packaging-check.test.ts test/story-6-4-path-portability.test.ts test/skill-artifact-loop.test.ts` 通过，3 files / 13 tests passed。
- 2026-06-02 18:40 CST: `npm run release:packaging-check` 通过。
- 2026-06-02 18:40 CST: `npm run release:verify` 通过，输出顺序为 `npm run build && npm run release:packaging-check`。
- 2026-06-02 18:40 CST: 默认 `npm test` 通过，38 files / 288 tests passed。
- 2026-06-02 18:40 CST: `git diff --check` 通过；manifest inspection 显示 packaged docs example 非空且 assertion passed。

### Implementation Plan

- 先用 focused Vitest 暴露 Story 6.7 的 release script、prerequisite guard 和 docs example assertion 缺口。
- 保持 `release:packaging-check` 为可直接运行的 Node script，只在 direct CLI run 时执行；导出纯 helper 供 tests 覆盖。
- 新增单一 `release:verify` 入口，串行执行 build 后再执行 packaging check，不新增重复 release gate。
- 将 CR TODO 收口限制在 TODO-007/TODO-008，不处理 TODO-003、Git confirmation assertion 或最终 backlog reconciliation。

### Completion Notes List

- 新增 `release:verify` script，稳定执行 `npm run build && npm run release:packaging-check`。
- `scripts/release/packaging-check.mjs` 现在先检查 `dist/bin/speclite.js`、`dist/bin/speclite.d.ts`、必要 runtime assets，并检测 source/config newer than dist 的 stale build output；缺失或陈旧时 fail fast，输出稳定 prerequisite diagnostic。
- `packagedDocumentationExamples` 断言已从空数组可误通过的 `.every(...)` 提升为非空、允许路径、package inventory presence、classification 和 `isReleaseGateFixture: false` 的组合校验。
- 新增 `test/release-packaging-check.test.ts`，覆盖 release script、missing/stale build output、empty docs example list、missing path、wrong classification 和 accidental `test/fixtures/` inclusion。
- `cr-todo-backlog.md` 仅关闭 TODO-007/TODO-008，TODO-003 保持 open，未处理 Story 6.8 范围。

### File List

- `package.json`
- `scripts/release/packaging-check.mjs`
- `test/release-packaging-check.test.ts`
- `dist/packaging-manifest.json`
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/code-reviews/6-7-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/6-7-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/stories/6-7-packaging-gate-hardening.md`

## Change Log（变更日志）

- 2026-06-02: Created ready-for-dev Story 6.7 from packaging CR TODO closure plan.
- 2026-06-02: Implemented Story 6.7 packaging gate hardening; added build-first release verification, prerequisite-aware packaging check, stronger packaged docs example assertions, focused tests, and TODO-007/TODO-008 resolution evidence.
