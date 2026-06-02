# CR TODO Backlog — 跨 Story 延迟事项追踪

> 本文档由 `bmad-enhance-05-cr-todo-tracker` 技能维护。
> 记录 Code Review 中发现的非阻塞改进项，跨 Story 追踪直到解决。

## 统计摘要

| 状态 | 数量 |
|------|------|
| 🔴 open | 7 |
| 🟡 in-progress | 0 |
| ✅ resolved | 1 |

---

## Open Items

<!-- 按优先级排序：P1 > P2 > P3 -->

### TODO-001: 外置 `resolve-parity` fixture cases

- **来源**: 2-4 CR round 1-3 (2026-05-27 ~ 2026-05-27)
- **优先级**: P2
- **类别**: test-gap
- **描述**: `test/fixtures/resolve-parity/` 当前只有 README 和 `fixture-case.json` metadata，真正的 config/customization merge、repeated key、missing key、optional/required failure、array semantics、non-ASCII、explicit project root 与 fallback search cases 内联在 `test/resolve-cli.test.ts` 的 `createResolveParityFixture()` helper 中。现有 behavior tests 覆盖较好，但 release-gate fixture 本身不可独立审阅、复用或跨工具校验。
- **涉及文件**: `test/fixtures/resolve-parity/README.md`, `test/fixtures/resolve-parity/fixture-case.json`, `test/resolve-cli.test.ts`
- **建议时机**: Epic 6 fixture ownership / release-gate fixture 整理时，将 parity case 输入与 expected semantic result 外置到 `test/fixtures/resolve-parity/`，并让测试从 fixture 目录读取生成临时项目树。
- **状态**: open
- **解决记录**:

### TODO-002: 对齐 `generatedAt` validator 与 ISO 8601 contract

- **来源**: 2-5 CR round 1-3 (2026-05-27 ~ 2026-05-27)
- **优先级**: P2
- **类别**: other
- **描述**: `src/manifest/manifest-schema.ts:69-75` 当前通过 `new Date(parsed).toISOString() === value` 校验 `generatedAt`，只接受 `Date.toISOString()` canonical UTC millisecond form。Story 2.5 AC5 与 owning SPEC 表述为 parseable ISO 8601 string，因此 `2026-05-27T14:00:00+08:00` 这类可解析 offset timestamp 会被拒绝。当前 workflow helper 使用 canonical `Date.toISOString()`，不阻塞 Story 2.5 CR 通过，但后续需要明确 contract 是 canonical UTC millisecond form 还是更宽的 parseable ISO 8601。
- **涉及文件**: `src/manifest/manifest-schema.ts`, `test/artifact-metadata.test.ts`, `test/artifact-path-validation.test.ts`, `_bmad-output/implementation-artifacts/stories/2-5-workflow-artifact-output-and-metadata-validation.md`, `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- **建议时机**: 下次触及 workflow artifact metadata schema 或 Epic 3 artifact path / metadata validation 时，先确认 contract 口径；若保留 parseable ISO 8601，则放宽 validator 并补 offset timestamp / locale-specific date regression；若改为 canonical UTC millisecond form，则同步 owning SPEC 与 Story contract。
- **状态**: open
- **解决记录**:

### TODO-003: 默认 `npm test` 5s timeout 慢测治理

- **来源**: 4-3 CR round 1-4 (2026-05-31 ~ 2026-05-31)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 4-3 Round 1 reviewer/evaluator 记录默认 `npm test` 的 Vitest 5s timeout 下存在慢测超时风险；同轮记录显示使用 `--testTimeout=15000` 可区分为测试运行时限/慢测治理问题。Round 4 evaluator 确认本轮 `npm test` 未复现失败，但该项仍应作为非阻塞 CR TODO / defer 追踪，避免后续全量测试在默认门槛下偶发超时。
- **涉及文件**: `package.json`, `vitest.config.ts`, `test/update-command.test.ts`, `test/update-planning.test.ts`
- **建议时机**: Epic 6 release confidence / 测试稳定性治理时，先定位默认 5s 下的慢测用例，再决定拆分慢测、优化 fixture I/O、或在 Vitest 配置中明确合理 timeout；处理后用默认 `npm test` 和必要的 focused test 复核。
- **状态**: open
- **解决记录**:

### TODO-005: 统一 `source-integrity` variant id 与 release gate classification

- **来源**: 6-1 CR round 1-2 (2026-06-02 ~ 2026-06-02)
- **优先级**: P2
- **类别**: tech-debt
- **描述**: `src/fixtures/fixture-contract.ts` 当前允许 `source-integrity/<sub-case>/<variant>` 三段 manifest id，但 release gate registry / `getFixtureGateClassification` 只登记 required sub-case 的两段 id；现有 `test/fixtures/source-integrity/source-unreadable-blocked/*/fixture-case.json` 已使用三段 id。Round 2 evaluator 确认该项有效但非阻塞，后续需要明确三段 variant 是 required gate 的细分 evidence、regression asset，还是 documentation example，并据此统一 schema、registry、classification 与 fixture manifests。
- **涉及文件**: `src/fixtures/fixture-contract.ts`, `test/fixtures/source-integrity/source-unreadable-blocked/local-tarball-unreadable/fixture-case.json`, `test/fixtures/source-integrity/source-unreadable-blocked/offline-bundle-unreadable/fixture-case.json`, `test/fixtures/source-integrity/source-unreadable-blocked/registry-auth-required/fixture-case.json`
- **建议时机**: Story 6.3 或 6.4 触及 source-integrity fixture runner / release gate classification 语义时，先确认 variant id 所属分类；若是 required gate 细分 evidence，则扩展 registry 分类，若不是 release gate，则收窄 schema 或显式标记 regression/documentation asset 并迁移 manifest。
- **状态**: open
- **解决记录**:

### TODO-006: 补强动态 CLI smoke gate 的 path escape reason 断言

- **来源**: 6-4 CR round 4 (2026-06-02)
- **优先级**: P2
- **类别**: test-gap
- **描述**: `test/story-6-4-path-portability.test.ts:117-123` 的动态 CLI gate 只断言真实 `speclite validate --json` 输出包含 `artifact-path.escapes-project`、`file-integrity.case-conflict` 与 `file-integrity.unsafe-overwrite-risk`，未进一步断言 `artifact-path.escapes-project.details.reason`。`test/story-6-4-path-portability.test.ts:436-443` 的动态故障注入更接近 configured artifact root 外部路径；Story 6.4 Round 4 evaluator 已确认 expected snapshot gate 对 `details.reason: "path-escapes-project"` 的阻塞覆盖已闭环，但该动态 smoke gate 仍可补强，避免未来 issue id 保持不变而 reason 退化时漏报。
- **涉及文件**: `test/story-6-4-path-portability.test.ts`
- **建议时机**: Epic 6 内下次触及 path-portability release gate / CLI smoke gate 时，定位真实 validate 输出中的 `artifact-path.escapes-project` issue，断言 `affectedPath`、`details.pathRole` 与 `details.reason`；如要让动态场景也覆盖 project-boundary escape，则补充 `../` 或等价 project-boundary fault 注入。
- **状态**: open
- **解决记录**:

### TODO-007: 固化 `release:packaging-check` 的 build 前置顺序

- **来源**: 6-5 CR round 1 (2026-06-02)
- **优先级**: P2
- **类别**: tech-debt
- **描述**: `package.json:19-23` 当前只定义独立的 `build` 与 `release:packaging-check` script，没有提供串行 release gate 入口，也没有让 packaging check 自身确认或触发 build。`scripts/release/packaging-check.mjs:7-18` 直接执行 `npm pack --dry-run --json`，随后在 `scripts/release/packaging-check.mjs:38-47` 断言 `dist/bin/speclite.js` 与 `dist/bin/speclite.d.ts` 已进入 package inventory，因此该 gate 实际依赖 build 已完成。Story 6.5 dev log 已记录 build 与 packaging check 并行时会因 `tsup` 清理 `dist` 出现 transient failure，顺序重跑才通过；当前不阻塞 Story 6.5，但 release gate 顺序应固化。
- **涉及文件**: `package.json`, `scripts/release/packaging-check.mjs`, `_bmad-output/implementation-artifacts/stories/6-5-skill-artifact-loop-and-documentation-examples.md`
- **建议时机**: 下次触及 release checklist、packaging gate 或 CI 编排时，新增串行 `release:verify` script（例如先 build 再 packaging check），或让 packaging check 对缺失 `dist/bin/*` 输出明确 prerequisite diagnostic；处理后用 `npm run build` 后再执行 `npm run release:packaging-check` 复核。
- **状态**: open
- **解决记录**:

### TODO-008: 补强 packaged documentation example 空集合断言

- **来源**: 6-5 CR round 1 (2026-06-02)
- **优先级**: P2
- **类别**: test-gap
- **描述**: `scripts/release/packaging-check.mjs:25-31` 从 package inventory 筛选 `assets/source/speclite/docs/examples/*.md` 并生成 `packagedDocumentationExamples`，但 `scripts/release/packaging-check.mjs:67-70` 只使用 `packagedDocumentationExamples.every(...)` 做分类断言，空数组也会通过。当前 `test/skill-artifact-loop.test.ts:378-401` 已通过 fixture case 与 expected classification 覆盖 Story 6.5 docs example 行为，因此不阻塞本 Story；但 standalone `npm run release:packaging-check` 的 packaged docs examples 分类证明强度仍需补强。
- **涉及文件**: `scripts/release/packaging-check.mjs`, `test/skill-artifact-loop.test.ts`, `assets/source/speclite/docs/examples/fixture-derived-examples.md`
- **建议时机**: 下次触及 packaging manifest assertion 或 docs example release gate 时，在 `packaged-documentation-examples-classified` 中同时断言 `packagedDocumentationExamples.length > 0`，或显式断言 `assets/source/speclite/docs/examples/fixture-derived-examples.md` 存在且 classification 为 `packaged-documentation-example`、`isReleaseGateFixture` 为 `false`。
- **状态**: open
- **解决记录**:

---

<!-- 已解决事项归档于此，保留用于回顾 -->

### TODO-004: confirmed Git install human output confirmation state 对齐

- **来源**: 5-4 CR round 1-2 (2026-06-01 ~ 2026-06-01)
- **优先级**: P2
- **类别**: other
- **描述**: `src/diagnostics/output.ts:498-514` 的 install external access human output 仍从 `sourceDescriptor` 反推展示并硬编码 `confirmationState=pending`；confirmed Git install 成功解析后，human audit 仍显示 pending。`src/commands/install.ts:223-274` 与 `src/commands/install.ts:415-459` 的 runtime confirmation gate 已保证未确认路径不访问 Git client、confirmed 后才进入 Git resolver，因此该问题不影响 remote access gate 或 Git evidence 写入门禁，但会误导 external access confirmation 的人工审计展示。后续修复应把 `SourceResolutionPlan.externalAccesses` 或等价 display-safe confirmation state 投影到 install result 可渲染数据，并补充 confirmed success / unconfirmed stop human output regression。
- **涉及文件**: `src/diagnostics/output.ts`, `src/diagnostics/command-result-schema.ts`, `src/commands/install.ts`, `test/git-source-resolution.test.ts`
- **建议时机**: Story 5.5 source descriptor trust status / redacted reporting 收口时，或下次触及 install human output / external access confirmation 投影时处理；先确认 public result data shape，再同步 JSON schema、human renderer 和 regression tests。
- **状态**: resolved
- **解决记录**: Story 5.5 已修复；resolved Git install human output 的 `confirmationState` 基于 resolved evidence/version/contentHash 显示 `confirmed`，未确认 Git access gate 仍保持 `pending`。Story 5.5 CR round 6 reviewer/evaluator 已 approved/pass；本地尚未提交 commit。

---

## 条目模板（不要删除）

<!--
### TODO-{NNN}: {简短标题}

- **来源**: {story-id} CR round {N} ({YYYY-MM-DD})
- **优先级**: P1 / P2 / P3
- **类别**: refactor / duplication / tech-debt / naming / test-gap / other
- **描述**: {具体问题描述}
- **涉及文件**: `{file-path}` (可多个)
- **建议时机**: {例如 "下次触及 init.ts 时" / "epic-3 开始前" / "专项重构"}
- **状态**: open / in-progress / resolved
- **解决记录**: {解决时填写：在哪个 story 中解决，PR/commit 引用}
-->
