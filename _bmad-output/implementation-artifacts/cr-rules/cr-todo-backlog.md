# CR TODO Backlog — 跨 Story 延迟事项追踪

> 本文档由 `bmad-enhance-05-cr-todo-tracker` 技能维护。
> 记录 Code Review 中发现的非阻塞改进项，跨 Story 追踪直到解决。

## 统计摘要

| 状态 | 数量 |
|------|------|
| 🔴 open | 1 |
| 🟡 in-progress | 0 |
| ✅ resolved | 8 |

---

## Open Items

<!-- 按优先级排序：P1 > P2 > P3 -->

### TODO-009: 对齐 `speclite-npm-publisher` fixture hash

- **来源**: 1-7 CR round 1-2 (2026-06-12 ~ 2026-06-12)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 1-7 round 1/2 reviewer 与 evaluator 均确认全量 `npm test` 的唯一失败为 `test/fixture-release-gates.test.ts` 中 `speclite-npm-publisher` deterministic fixture hash mismatch，差异集中在 `_speclite/_config/skill-index.json`、`.agents/.claude` 下 `speclite-npm-publisher` 的 `CHANGELOG.md`、`references/speclite-npm-publisher-workflow.md`、`SKILL.md` hash 以及 `canonicalPackageHash`。该问题真实存在并影响全量测试红绿状态，但当前 Story 1-7 diff 未修改 `speclite-npm-publisher` asset package、fresh-install expected fixture 或 release gate test，因此不应混入 Story 1-7 fixer 范围。
- **涉及文件**: `test/fixture-release-gates.test.ts`, `assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher`, `test/fixtures/fresh-install-empty-project`, `_speclite/_config/skill-index.json`
- **建议时机**: 下次触及 `speclite-npm-publisher` canonical skill package、fresh-install expected fixture 或 release gate fixture hash 维护时处理；需由具备 release gate / fixture 维护上下文的专项步骤同步 canonical package hash 与 expected fixture。
- **状态**: open
- **解决记录**:

---

<!-- 已解决事项归档于此，保留用于回顾 -->

### TODO-003: 默认 `npm test` 5s timeout 慢测治理

- **来源**: 4-3 CR round 1-4 (2026-05-31 ~ 2026-05-31)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 4-3 Round 1 reviewer/evaluator 记录默认 `npm test` 的 Vitest 5s timeout 下存在慢测超时风险；同轮记录显示使用 `--testTimeout=15000` 可区分为测试运行时限/慢测治理问题。Round 4 evaluator 确认本轮 `npm test` 未复现失败，但该项仍应作为非阻塞 CR TODO / defer 追踪，避免后续全量测试在默认门槛下偶发超时。
- **涉及文件**: `package.json`, `vitest.config.ts`, `test/update-command.test.ts`, `test/update-planning.test.ts`
- **建议时机**: 已在 Story 6.8 处理。
- **解决日期**: 2026-06-02
- **关闭 Story**: Story 6.8
- **状态**: resolved
- **解决记录**: Story 6.8 复核 `package.json` 的默认 `test` script 与 `vitest.config.ts`，直接运行默认 `npm test`，当前 suite 在默认命令下稳定通过：38 files / 288 tests passed，Duration 10.13s，未复现 Story 4.3 曾记录的 5s timeout failure。最终 release confidence verification 继续要求默认 `npm test` 与 release verification command 同轮通过；若未来新增慢测重新触发 timeout，应作为新的 CR TODO 记录。

### TODO-007: 固化 `release:packaging-check` 的 build 前置顺序

- **来源**: 6-5 CR round 1 (2026-06-02)
- **优先级**: P2
- **类别**: tech-debt
- **描述**: `package.json:19-23` 当前只定义独立的 `build` 与 `release:packaging-check` script，没有提供串行 release gate 入口，也没有让 packaging check 自身确认或触发 build。`scripts/release/packaging-check.mjs:7-18` 直接执行 `npm pack --dry-run --json`，随后在 `scripts/release/packaging-check.mjs:38-47` 断言 `dist/bin/speclite.js` 与 `dist/bin/speclite.d.ts` 已进入 package inventory，因此该 gate 实际依赖 build 已完成。Story 6.5 dev log 已记录 build 与 packaging check 并行时会因 `tsup` 清理 `dist` 出现 transient failure，顺序重跑才通过；当前不阻塞 Story 6.5，但 release gate 顺序应固化。
- **涉及文件**: `package.json`, `scripts/release/packaging-check.mjs`, `test/release-packaging-check.test.ts`
- **建议时机**: 已在 Story 6.7 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.7 新增 `release:verify`，串行执行 `npm run build && npm run release:packaging-check`；`scripts/release/packaging-check.mjs` 现在在执行 `npm pack --dry-run --json` 前检查 `dist/bin/speclite.js`、`dist/bin/speclite.d.ts`、必要 runtime assets 和 source-vs-dist mtime，缺失或陈旧时输出稳定 prerequisite diagnostic。验证：`npm test -- test/release-packaging-check.test.ts test/story-6-4-path-portability.test.ts test/skill-artifact-loop.test.ts`、`npm run build`、`npm run release:packaging-check`、`npm run release:verify`、`npm test` 均通过。

### TODO-008: 补强 packaged documentation example 空集合断言

- **来源**: 6-5 CR round 1 (2026-06-02)
- **优先级**: P2
- **类别**: test-gap
- **描述**: `scripts/release/packaging-check.mjs:25-31` 从 package inventory 筛选 `assets/source/speclite/docs/examples/*.md` 并生成 `packagedDocumentationExamples`，但 `scripts/release/packaging-check.mjs:67-70` 只使用 `packagedDocumentationExamples.every(...)` 做分类断言，空数组也会通过。当前 `test/skill-artifact-loop.test.ts:378-401` 已通过 fixture case 与 expected classification 覆盖 Story 6.5 docs example 行为，因此不阻塞本 Story；但 standalone `npm run release:packaging-check` 的 packaged docs examples 分类证明强度仍需补强。
- **涉及文件**: `scripts/release/packaging-check.mjs`, `test/release-packaging-check.test.ts`, `dist/packaging-manifest.json`, `assets/source/speclite/docs/examples/fixture-derived-examples.md`
- **建议时机**: 已在 Story 6.7 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.7 将 `packaged-documentation-examples-classified` 改为非空、允许路径、package inventory presence、classification 和 `isReleaseGateFixture: false` 的组合断言；新增 negative tests 覆盖 empty list、missing path、wrong classification 和误把 `test/fixtures/` 当 docs example。`dist/packaging-manifest.json` 记录 `assets/source/speclite/docs/examples/fixture-derived-examples.md` 为唯一 packaged documentation example 且 assertion passed。验证：focused packaging tests、`npm run release:packaging-check`、`npm run release:verify` 和默认 `npm test` 均通过。

### TODO-001: 收口 `resolve-parity` fixture input cases

- **来源**: 2-4 CR round 1-3 (2026-05-27 ~ 2026-05-27)
- **优先级**: P2
- **类别**: test-gap
- **描述**: Story 6.3 已将 `resolve-parity` 的 expected stdout JSON 与 stderr JSON Lines 外置到 `test/fixtures/resolve-parity/expected/`，并覆盖 config/customization merge、missing/repeated key、optional/required failure、array semantics 和 non-ASCII parity surfaces。剩余缺口是 fixture input/project tree 仍未完整外置：`test/fixtures/resolve-parity/input/config/` 与 `input/customization/` 目前只有 `.gitkeep`，真实 config/customization layer 仍主要由 `test/resolve-cli.test.ts` 的 `createResolveParityFixture()` helper 在测试内生成。release-gate fixture 因此已可审阅 expected results，但 input cases 仍不可独立复用或跨工具校验。
- **涉及文件**: `test/fixtures/resolve-parity/README.md`, `test/fixtures/resolve-parity/input/config/`, `test/fixtures/resolve-parity/input/config-broken-optional/`, `test/fixtures/resolve-parity/input/customization/`, `test/resolve-cli.test.ts`
- **建议时机**: 已在 Story 6.6 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.6 已将 config merge parity、broken optional config layer 和 customization merge parity 的真实 input layers 外置到 `test/fixtures/resolve-parity/input/`，并让 `test/resolve-cli.test.ts` 的 `createResolveParityFixture()` 从 fixture input assets 复制临时项目树。验证：`npx vitest run test/resolve-cli.test.ts test/fixture-contract.test.ts test/artifact-metadata.test.ts test/story-6-4-path-portability.test.ts` 通过。

### TODO-002: 对齐 `generatedAt` validator 与 ISO 8601 contract

- **来源**: 2-5 CR round 1-3 (2026-05-27 ~ 2026-05-27)
- **优先级**: P2
- **类别**: other
- **描述**: `src/manifest/manifest-schema.ts:69-75` 当前通过 `new Date(parsed).toISOString() === value` 校验 `generatedAt`，只接受 `Date.toISOString()` canonical UTC millisecond form。Story 2.5 AC5 与 owning SPEC 表述为 parseable ISO 8601 string，因此 `2026-05-27T14:00:00+08:00` 这类可解析 offset timestamp 会被拒绝。当前 workflow helper 使用 canonical `Date.toISOString()`，不阻塞 Story 2.5 CR 通过，但后续需要明确 contract 是 canonical UTC millisecond form 还是更宽的 parseable ISO 8601。
- **涉及文件**: `src/manifest/manifest-schema.ts`, `test/artifact-metadata.test.ts`, `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`, `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- **建议时机**: 已在 Story 6.6 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.6 保留 canonical UTC millisecond form，并同步 manifest schema 错误信息、artifact metadata regression test、Manifest SPEC 与 Fixture SPEC wording；offset timestamp 继续被拒绝且错误信息明确要求 `Date.toISOString()`。验证：focused Vitest 命令通过。

### TODO-005: 统一 `source-integrity` variant id 与 release gate classification

- **来源**: 6-1 CR round 1-2 (2026-06-02 ~ 2026-06-02)
- **优先级**: P2
- **类别**: tech-debt
- **描述**: `src/fixtures/fixture-contract.ts` 当前允许 `source-integrity/<sub-case>/<variant>` 三段 manifest id，但 release gate registry / `getFixtureGateClassification` 只登记 required sub-case 的两段 id；现有 `test/fixtures/source-integrity/source-unreadable-blocked/*/fixture-case.json` 已使用三段 id。Round 2 evaluator 确认该项有效但非阻塞，后续需要明确三段 variant 是 required gate 的细分 evidence、regression asset，还是 documentation example，并据此统一 schema、registry、classification 与 fixture manifests。
- **涉及文件**: `src/fixtures/fixture-contract.ts`, `test/fixture-contract.test.ts`, `test/fixtures/source-integrity/source-unreadable-blocked/local-tarball-unreadable/fixture-case.json`, `test/fixtures/source-integrity/source-unreadable-blocked/offline-bundle-unreadable/fixture-case.json`, `test/fixtures/source-integrity/source-unreadable-blocked/registry-auth-required/fixture-case.json`
- **建议时机**: 已在 Story 6.6 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.6 将 `source-integrity/<required-sub-case>/<variant>` 明确归为 required fixture group sub-case 的细分 evidence，只要 required sub-case 已注册且 variant 为 lower-kebab，就返回 `fixture-group-sub-case`；新增测试覆盖 `source-integrity/source-unreadable-blocked/local-tarball-unreadable` 不再为 `undefined`。验证：focused Vitest 命令通过。

### TODO-006: 补强动态 CLI smoke gate 的 path escape reason 断言

- **来源**: 6-4 CR round 4 (2026-06-02)
- **优先级**: P2
- **类别**: test-gap
- **描述**: `test/story-6-4-path-portability.test.ts:117-123` 的动态 CLI gate 只断言真实 `speclite validate --json` 输出包含 `artifact-path.escapes-project`、`file-integrity.case-conflict` 与 `file-integrity.unsafe-overwrite-risk`，未进一步断言 `artifact-path.escapes-project.details.reason`。`test/story-6-4-path-portability.test.ts:436-443` 的动态故障注入更接近 configured artifact root 外部路径；Story 6.4 Round 4 evaluator 已确认 expected snapshot gate 对 `details.reason: "path-escapes-project"` 的阻塞覆盖已闭环，但该动态 smoke gate 仍可补强，避免未来 issue id 保持不变而 reason 退化时漏报。
- **涉及文件**: `src/validation/rules/artifact-path.ts`, `test/story-6-4-path-portability.test.ts`
- **建议时机**: 已在 Story 6.6 处理。
- **解决日期**: 2026-06-02
- **状态**: resolved
- **解决记录**: Story 6.6 的 dynamic CLI gate 现在创建实际 workflow artifact path fault，并断言真实 `speclite validate --json` 输出中的 `artifact-path.escapes-project` 同时包含 `affectedPath: artifact:actualArtifactPath`、`details.pathRole: actualArtifactPath` 和 `details.reason: path-escapes-project`；artifact path validator 对 actual artifact path 的 escape reason 已同步。验证：focused Vitest 命令通过。

### TODO-004: confirmed Git install human output confirmation state 对齐

- **来源**: 5-4 CR round 1-2 (2026-06-01 ~ 2026-06-01)
- **优先级**: P2
- **类别**: other
- **描述**: `src/diagnostics/output.ts:498-514` 的 install external access human output 仍从 `sourceDescriptor` 反推展示并硬编码 `confirmationState=pending`；confirmed Git install 成功解析后，human audit 仍显示 pending。`src/commands/install.ts:223-274` 与 `src/commands/install.ts:415-459` 的 runtime confirmation gate 已保证未确认路径不访问 Git client、confirmed 后才进入 Git resolver，因此该问题不影响 remote access gate 或 Git evidence 写入门禁，但会误导 external access confirmation 的人工审计展示。后续修复应把 `SourceResolutionPlan.externalAccesses` 或等价 display-safe confirmation state 投影到 install result 可渲染数据，并补充 confirmed success / unconfirmed stop human output regression。
- **涉及文件**: `src/diagnostics/output.ts`, `src/diagnostics/command-result-schema.ts`, `src/commands/install.ts`, `test/git-source-resolution.test.ts`
- **建议时机**: Story 5.5 source descriptor trust status / redacted reporting 收口时，或下次触及 install human output / external access confirmation 投影时处理；先确认 public result data shape，再同步 JSON schema、human renderer 和 regression tests。
- **解决日期**: 2026-06-02
- **关闭 Story**: Story 5.5；Story 6.8 补充 confirmed regression assertion。
- **状态**: resolved
- **解决记录**: Story 5.5 已修复；resolved Git install human output 的 `confirmationState` 基于 resolved evidence/version/contentHash 显示 `confirmed`，未确认 Git access gate 仍保持 `pending`。Story 6.8 在 `test/git-source-resolution.test.ts` 的 confirmed Git install path 中新增 `confirmationState=confirmed` 断言，并保留 unconfirmed path 的 `confirmationState=pending` 断言；focused verification：`npx vitest run test/git-source-resolution.test.ts` 通过，14 tests passed。

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
