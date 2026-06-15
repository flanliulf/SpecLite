# Story 7.4: Process Governance Coverage Report（流程治理覆盖报告）

Status: done

<!-- Post-MVP Story: 不属于 MVP implementation readiness gate。实现前必须先通过 Epic 7 kickoff / Story kickoff gate。 -->

## Story（故事）

作为企业规范负责人，
我希望 Post-MVP 能基于已安装状态、阶段覆盖矩阵、标准产物和 validate 结果生成流程治理覆盖报告，
以便判断 SpecLite 是否真正把 SPEC、方案评审、故事规划、实现、测试和审查规范落到团队执行过程中。

## Acceptance Criteria（验收标准）

1. **Report metrics build on MVP evidence（报告指标建立在 MVP 证据上）**
   **前提** 项目已安装 SpecLite 并生成 MVP 最小阶段覆盖矩阵；
   **当** 系统生成 Post-MVP 流程治理覆盖报告；
   **则** 报告可以展示阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量；
   **并且** 这些指标建立在 MVP manifest/index、phase coverage 和 validate output 之上。

2. **Missing phase entries are explicit gaps（缺失阶段入口显式报告为缺口）**
   **前提** 某个研发阶段缺少 mapped skill entry；
   **当** 报告计算阶段入口覆盖；
   **则** 该阶段被标记为缺口；
   **并且** 报告显示对应 phaseId、phaseLabel、moduleId、canonicalSkillId 或缺失原因。

3. **Artifact existence uses artifact contract, not prose quality（标准产物存在率使用 artifact contract 而非文档质量）**
   **前提** 某个标准过程产物缺失或 metadata 不合法；
   **当** 报告计算标准产物存在率；
   **则** 报告引用 artifact contract、artifact path 和 validation issue；
   **并且** 不把文档内容质量或人工评审结论作为自动覆盖率指标。

4. **Trend/export/multi-project builds on MVP matrix（趋势、导出、多项目建立在 MVP 矩阵上）**
   **前提** 团队需要查看趋势、导出、多项目或团队视角；
   **当** Post-MVP 扩展报告能力；
   **则** 这些能力只能在 MVP 最小阶段覆盖矩阵与 validate output 的基础上扩展；
   **并且** 不改变 MVP install/status/validate/update 的核心契约。

5. **Machine-readable report reuses existing contracts or new owning SPEC（机器可读报告复用既有契约或新增 owning SPEC）**
   **前提** 治理报告需要机器可读输出；
   **当** 输出 `--json` 或报告 artifact；
   **则** 必须复用 `CommandResult`、`ValidationIssue` 或明确新增的 owning SPEC；
   **并且** 不定义第二套 issue category、skill identity 或 artifact identity。

6. **Report redacts sensitive team/project path details（报告脱敏团队或项目路径信息）**
   **前提** 报告暴露团队或项目路径信息；
   **当** 生成 human-readable 或 machine-readable output；
   **则** 路径和 source 信息遵守 project-relative POSIX path 与 redaction 策略；
   **并且** 不泄露 credentials、home directory、cache path 或 temporary extraction path。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Define governance report contract（AC: 1, 5）
  - [x] 决定报告是 CLI command、workflow artifact，还是两者都有；只要 CLI `--json` 或 machine-readable report artifact 定义新的 machine-readable fields，必须先新增或扩展对应 owning SPEC。
  - [x] 同步更新 executable schema/parser 与 fixture-stable assertions，确保 metrics/report fields 的机器可读契约先于实现落地。
  - [x] 定义 metric fields：phaseEntryCoverage、artifactPresenceRate、validatePassRate、openGapCount。
  - [x] 复用 `CommandResult` / `ValidationIssue` / manifest/index identity，不创建第二套 skill/artifact identity。

- [x] Task 2: Implement phase coverage and gap calculation（AC: 1, 2）
  - [x] 从 `_speclite/_config/phase-coverage.json` 或 manifest/index projection 读取 phase rows。
  - [x] 对 missing/unsupported/failed target 生成 gap entries，包含 phaseId、phaseLabel、moduleId、canonicalSkillId 或 missing reason。
  - [x] 排序必须 deterministic，复用 canonical target order。

- [x] Task 3: Implement artifact existence and metadata checks（AC: 1, 3）
  - [x] 复用 `src/validation/validate-project.ts` 中 artifact-path validation 或拆出可复用 helper。
  - [x] 只检查 artifact existence、metadata、configured root、default output path；不得评分 prose quality 或人工 review 结论。
  - [x] 报告引用 validation issue 和 artifact path，保持 project-relative POSIX。

- [x] Task 4: Implement output and documentation examples（AC: 4-6）
  - [x] Human-readable report 使用 Summary、Scope、Metrics、Gaps、Issues、Next Actions。
  - [x] `--json` 或 artifact output 必须 schema-first，并有 fixture-stable comparison。
  - [x] 文档说明趋势/导出/多项目只能扩展在 MVP matrix 与 validate output 之上。

- [x] Task 5: Verification（AC: 1-6）
  - [x] 新增 focused tests 覆盖完整覆盖、缺失 phase、artifact metadata invalid、validate issue aggregation、redaction。
  - [x] 运行 `npm run build`、focused tests、`npm test` 或记录阻塞、`git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`
- UX governance journey: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Manifest/index phase coverage: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- Artifact validation and lifecycle: `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
- Validation issue taxonomy: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`

### Current Implementation Anchors（当前实现锚点）

- Manifest schema and phase coverage types: `src/manifest/manifest-schema.ts`
- Artifact validation: `src/validation/validate-project.ts`, `src/validation/rules/artifact-path.ts`
- Installed-state summary: `src/status/installed-state.ts`
- Command result / renderer: `src/diagnostics/command-result-schema.ts`, `src/diagnostics/output.ts`
- Fixture and artifact tests: `test/artifact-metadata.test.ts`, `test/artifact-path-validation.test.ts`, `test/skill-artifact-loop.test.ts`

### Scope Boundary（范围边界）

- 本 Story 不判断文档内容质量、人工 review 是否充分或团队真实执行质量。
- 不新增 Web dashboard、数据库趋势服务、后台 daemon 或 hosted registry UI。
- 不改变 install/status/validate/update 的核心契约。
- 不引入第二套 phase、skill、artifact 或 issue identity。

## Dependency Gate（依赖门禁）

- 如果报告是新 CLI command，必须先有 owning SPEC 和 schema。
- 如果报告是 workflow artifact，必须遵守 `09-sdlc-workflow-lifecycle-contract.md` 的 artifact root 和 metadata 规则。
- 如果使用 validate output，必须保持 validate local-only，不访问 remote source。
- Hook coverage metric 只有在 Story 7.1 已定义 installed hook metadata、validation evidence 和 trust boundary 后才能纳入报告；否则必须作为 unsupported/future capability 处理。
- 报告不得依赖 Story 7.5 的 `list` output；必须直接消费 manifest/index、phase coverage、Flow Gate metadata 或已契约化 report artifact。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `04-manifest-index-contract.md` | phase coverage 和 skill identity 的唯一来源。 |
| Contract Anchor | `09-sdlc-workflow-lifecycle-contract.md` | workflow artifact path、metadata 和 lifecycle fields。 |
| Contract Anchor | `07-validation-issue-taxonomy.md` | report issues 必须复用 existing issue model。 |
| Functional Anchor | `src/validation/validate-project.ts` | artifact-path validation 可复用。 |
| Functional Anchor | `src/manifest/manifest-schema.ts` | phase coverage data shape。 |
| Evidence Anchor | artifact/phase coverage focused tests | 证明 metrics、gaps、redaction 和 stable ordering。 |

## Equivalent Implementation Policy（等价实现策略）

治理报告可以作为 command、workflow artifact 或 docs-backed utility 实现。Reviewer 应按 contract / functional / evidence anchors 判断等价，不按建议文件名判断。但任何 machine-readable shape 必须有 owning SPEC。

## Evidence Plan（证据计划）

- `npm test -- test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts`
- 新增 governance report focused tests
- `npm run build`
- `npm test`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 (Codex)

### Debug Log References（调试日志引用）

- 2026-06-15: `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 因 `/usr/bin/python3` 3.9.6 缺少 `tomllib` 失败；按 fallback 手工读取 workflow defaults，未修改 Python 环境。
- 2026-06-15: `npm test -- test/governance-report-command.test.ts` 先红后绿；red 为 unknown command，green 为 2 tests passed。
- 2026-06-15: `npm test -- test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/governance-report-command.test.ts` 通过，4 files / 20 tests passed。
- 2026-06-15: `npm run build` 通过，ESM 与 DTS build success。
- 2026-06-15: `npm test` 通过，45 files / 323 tests passed。
- 2026-06-15: `git diff --check` 通过，无 whitespace error。

### Completion Notes（完成说明）

默认决策：实现只读 CLI command `speclite governance-report`，同时提供 `--json` 与 human-readable output；本 Story 不生成 workflow artifact writer，以避免新增写入面和 artifact lifecycle 复杂度。

新增 owning SPEC `10-process-governance-report-contract.md`，并在 `01-command-result-json-contract.md` 登记 `governance-report` command id 与 payload 归属。机器可读输出复用 `CommandResult` envelope、`ValidationIssue` issue model、manifest/index phase identity 与 artifact contract identity。

实现 `GovernanceReportData.metrics.phaseEntryCoverage`、`artifactPresenceRate`、`validatePassRate`、`openGapCount`；phase gap 使用 `_speclite/_config/phase-coverage.json` 与 canonical target order，missing/unsupported/failed target 输出 `phaseGaps[]` 并映射为 `menu-target.phase-entry-gap`。

将 artifact path discovery 与 metadata validation 从 `validateProject` 内部拆为可复用 helper；报告只检查 artifact existence、metadata、configured root、default output path，并保持 project-relative POSIX path/redaction，不判断 prose quality、人工 review 或团队执行质量。

Human output 固定包含 `Summary`、`Scope`、`Metrics`、`Gaps`、`Issues`、`Next Actions`；how-to 文档明确趋势、导出、多项目只能扩展在 MVP matrix 与 validate output 之上。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/7-4-process-governance-coverage-report.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/10-process-governance-report-contract.md`
- `docs/how-to/index.md`
- `docs/how-to/process-governance-report.md`
- `src/bin/speclite.ts`
- `src/commands/governance-report.ts`
- `src/diagnostics/command-result-schema.ts`
- `src/diagnostics/command-result.ts`
- `src/diagnostics/output.ts`
- `src/validation/artifact-paths.ts`
- `src/validation/validate-project.ts`
- `test/governance-report-command.test.ts`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-15 | 0.1 | 创建 Epic 7.4 ready-for-dev Story，上下文覆盖 Post-MVP 流程治理覆盖报告边界。 | Amelia |
| 2026-06-15 | 1.0 | 实现只读 `governance-report` CLI、机器可读契约、human output、文档示例和 focused tests，Story 状态推进到 review。 | Codex |
