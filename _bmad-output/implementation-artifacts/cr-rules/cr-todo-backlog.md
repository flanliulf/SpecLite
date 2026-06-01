# CR TODO Backlog — 跨 Story 延迟事项追踪

> 本文档由 `bmad-enhance-05-cr-todo-tracker` 技能维护。
> 记录 Code Review 中发现的非阻塞改进项，跨 Story 追踪直到解决。

## 统计摘要

| 状态 | 数量 |
|------|------|
| 🔴 open | 3 |
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
