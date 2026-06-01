# Story 5.2 实验笔记

更新时间：2026-06-01 16:20 CST

## Notes（笔记）

- 当前 `sprint-status.yaml` 显示 `epic-5: in-progress`，Story 5.1 为 `done`，Story 5.2 到 5.5 仍为 `ready-for-dev`。
- Story 5.2 范围是 npm public/private registry source resolution、resolved version、registry integrity / version-lock evidence、trust status derivation、registry diagnostics、redaction 和 validate/status no-network 边界。
- Story 5.2 明确不负责 Story 5.3 local tarball/offline/local integrity、Story 5.4 Git source pinning、Story 5.5 full trust reporting、Post-MVP commands 或完整 source lockfile lifecycle。
- Story 5.1 已新增 `CR-SEC-14`：Source label sanitizer 必须覆盖 token、query 和 fragment 后再进入 public projection。Story 5.2 registry resolver 必须复用该 redaction 原则，不重新引入 raw registry URL/token/query 泄露路径。
- 当前工作树已有大量无关 dirty/untracked 文件；后续必须逐文件核对，不回滚、不清理。
- fresh sub agent 已启动执行 `/bmad-dev-story story 5-2`；本轮只做 dev-story，不并行启动 reviewer。
- `bmad-dev-story` workflow 解析结果要求加载 `_bmad-output/project-context.md`；该文件仍是占位信息，实际实现以 Story 5.2、live source、owning SPEC 和当前 tests 为准。
- Step 4 已将 `sprint-status.yaml` 中 Story 5.2 标记为 `in-progress`；完成门禁通过后 Story 文件与 `sprint-status.yaml` 均已切到 `review`。
- Registry resolver 通过 injected `RegistryMetadataClient` 支持 deterministic local-only tests；默认 public npm client 仅在用户显式确认 source access 后才可能使用 Node 22 `fetch`。
- `--yes` 仅代表 command-level write authorization，不自动确认 registry source access；未确认时输出 `source-integrity.unsupported-source` / `source-access-not-confirmed` 并且不调用 registry client。
- `trustStatus: "trusted"` 仅由 expected lock / expected integrity match 产生；registry SRI alone 为 `unverified`。
- Validate 新增本地 `source-integrity` shape rule，仅读取 manifest/source descriptor，不接收 registry client、不做 remote freshness/latest check。

## Risks（风险）

- Registry resolver 容易误用真实网络或 npm cache；Story 要求 deterministic local-only tests 和 explicit external access confirmation。
- `trustStatus: "trusted"` 只能来自 expected hash 或 lock match，不能因为来源是 public/private registry 自动 trusted。
- Private registry diagnostics 必须 redacted；不能把 raw registry endpoint、auth token、private query、proxy secret 或 stack trace 放入 public JSON、human output 或 fixture snapshot。
- 已知 CR 风险：`src/commands/install.ts` 为避免改动范围过大保留了 bundled path 与 registry path 的重复 orchestration 片段；后续可在 CR 认可后提取 shared helper，但本轮不做额外重构。
- 已知 CR 风险：private registry 的真实 endpoint/config lifecycle 尚未作为 public contract 暴露；本 Story 通过 injected client 和 display-safe package/channel 覆盖 resolver boundary，完整 enterprise registry config 仍应由后续 contract/story 明确。

## Reviewer Round 1 Notes（代码审查第 1 轮笔记）

- 内部 `Agent` 工具不可用；本轮不是并行三 sub-agent，而是当前 reviewer 串行执行三层视角，summary 中已标注降级。
- 通过项：未确认 registry source access 时不会调用 registry client；`--yes` 不自动确认 source access；focused tests 使用 injected client/local fixtures；未发现 validate/status remote freshness/latest check；未发现 5.3/5.4/5.5/Epic 6/Post-MVP 提前实现。
- 阻塞判断：private registry explicit config lifecycle 不能只靠 `registryClient` 注入测试代表真实用户配置；CLI/default runtime 没有 private registry endpoint/config 成功路径，默认 private client 直接 `authentication-required`。
- Patch 判断：registry success descriptor 当前用 `resolvedRoot` 承载 package identity，和 Story AC3 “只能通过 `integrityEvidence[].packageName` 表示”不一致。
- Patch 判断：validate local-only rule 只检查 registry evidence kind 是否存在，未校验 `trustStatus` 与 `verified` evidence 的一致性，无法发现 trusted-without-trust-anchor 或 blocked installed descriptor。
- 重复 orchestration 判断：`src/commands/install.ts` 的 duplicated bundled/registry flow 是维护风险，但本轮没有单独判为阻塞；它应在 private config 裁决与 patch 后再视范围决定是否提取 helper。

## Evaluator Round 1 Notes（代码审查评估第 1 轮笔记）

- 评估裁决：private registry explicit config lifecycle 是 Story 5.2 blocker，不判为误报；默认推荐在本 Story 定义最小 private in-memory/runtime config contract，不猜测 CLI flag、持久配置文件、token scope 或完整 auth lifecycle。
- 评估裁决：registry success descriptor 顶层 `resolvedRoot` 承载 package identity 违反 AC3，应移除或改为非 identity 的 contract-safe display 信息；package identity 保留在 `integrityEvidence[].packageName`。
- 评估裁决：`validateSourceIntegrity` 必须补 local-only consistency checks，至少覆盖 trusted-without-verified-evidence、blocked installed descriptor 和 missing evidence；不得访问 registry 或做 freshness/latest check。
- 评估裁决：`install.ts` 重复 orchestration 不单独阻塞，也不列 CR TODO；本 Story fixer 不应扩大到无关重构。
- Round 1 evaluation 数量：需要修复 3、可忽略 1、待讨论 0、CR TODO 0；evaluator 不通过，需要进入 fixer。

## Fixer Round 1 Notes（代码修复第 1 轮笔记）

- Private registry explicit config lifecycle：本轮只定义最小 in-memory/runtime contract，通过 `RegistryRuntimeConfig` 表达 `displaySafeRegistryLabel`、`registryKind`、`packageName`、`channel` 与 injected metadata client 调用的显式绑定；未提供或绑定不匹配时在调用 registry client 前返回 `source-integrity.authentication-required`。
- 本轮未新增 CLI flag、持久配置文件、token scope、`.npmrc` 解析、raw endpoint 或完整 auth lifecycle；public JSON/human output 不输出 registry label、raw endpoint、token、query、fragment 或 secret。
- Registry success descriptor：`resolveRegistrySource` 成功路径不再把 package identity 写入顶层 `resolvedRoot`；package identity 只保留在 `integrityEvidence[].packageName`，fixtures 已同步。
- Validate local-only consistency：`trusted` registry descriptor 必须存在至少一条 `verified: true` 的 `registry-integrity` 或 `version-lock` evidence；installed `blocked` registry descriptor 会产生本地 `source-integrity` issue；`unverified` 必须有 registry/lock evidence，且 failed lock evidence 不能以 `verified: false` 留在 unverified 状态。
- 验证仍保持 local-only；没有新增 registry 访问、freshness/latest check、package-manager cache 或外部网络依赖。

## Reviewer Round 2 Notes（代码审查第 2 轮笔记）

- 内部 `Agent` 工具仍不可用；本轮按 reviewer skill 降级为单一 LLM 串行复审，并在 summary 中标注。
- Round 1 P1 #1 已修复：`RegistryRuntimeConfig` 是最小 runtime/API contract；缺 config、kind/package/channel 不匹配或 label 非 display-safe 时，在调用 registry client 前返回 `source-integrity.authentication-required`；有 config 时 injected private metadata success path 通过。
- Round 1 P1 #2 已修复：registry success descriptor 不再投影顶层 `resolvedRoot` package identity；package identity 只在 `integrityEvidence[].packageName`，fixtures 已确认。
- Round 1 P1 #3 已修复：validate source-integrity local-only rule 覆盖 missing evidence、trusted-without-verified-evidence、blocked installed descriptor、unverified failed lock evidence。
- 本轮未发现新增 Story 5.3/5.4/5.5/Epic 6/Post-MVP 越界实现；未新增 CLI flag、持久 registry config、token scope、`.npmrc` 或完整 auth lifecycle。
- `install.ts` 重复 orchestration 未显示新行为问题，按用户指示和 Round 1 evaluator 结论维持 dismiss，不作为 blocker。
- Round 2 reviewer 四桶数量：decision_needed 0、patch 0、defer 0、dismiss 1；reviewer 结论通过，下一步应由 Round 2 evaluator 复核。

## Evaluator Round 2 Notes（代码审查评估第 2 轮笔记）

- 评估裁决：同意 Round 2 reviewer 的通过结论；Round 1 三个 P1 均已按 evaluation 边界修复，无需继续 fixer。
- Private registry contract 仍保持最小 runtime/API 输入，不新增 CLI flag、持久配置、token scope、`.npmrc` 或完整 auth lifecycle；缺 config 时不会调用 registry client。
- Registry success descriptor 已移除顶层 `resolvedRoot` package identity；package identity 保留在 `integrityEvidence[].packageName`，success fixtures 未出现 `resolvedRoot`。
- Validate source-integrity 保持 local-only，只检查本地 manifest/source descriptor/evidence shape，不访问 registry、不做 freshness/latest check。
- `install.ts` 重复 orchestration 继续判为可忽略维护风险；不列 blocker，也不列 CR TODO。
- Round 2 evaluation 数量：需要修复 0、可忽略 1、待讨论 0、CR TODO 0；下一步可进入 CR 04/05/06 收尾。

## Rules Extractor 04 Notes（规则提炼笔记）

- 04 输入：`5-2-code-review-summary-20260601-round-1.md`、`5-2-code-review-evaluation-20260601-round-1.md`、`5-2-code-review-summary-20260601-round-2.md`、`5-2-code-review-evaluation-20260601-round-2.md`。
- 04 判定：Round 1 三个 P1 都已有 CR 证据、可规则化、非纯特例、已由 Round 2 evaluator 确认关闭，满足 record-only 沉淀条件。
- 新增 `CR-SEC-15`：Private registry metadata client 调用必须先通过显式 runtime config 绑定；总分 8/12，去向 `rules-summary`。虽然总分达到 8，但该规则偏 private registry resolver 实现检查点，且全局文档已有 explicit source access / redaction 总原则，本次不改全局文档。
- 新增 `CR-API-21`：Registry package identity 只能投影到 integrity evidence；总分 7/12，去向 `rules-summary`。
- 新增 `CR-API-22`：Validate 必须本地校验 `trustStatus` 与 evidence `verified` 一致性；总分 7/12，去向 `rules-summary`。
- 04 不向 05 交接 TODO：Round 2 evaluation 明确 CR TODO 0；`install.ts` 重复 orchestration 维持 dismiss，不列 backlog。

## TODO Tracker 05 Notes（TODO 追踪笔记）

- 05 输入：Story 5.2 两轮 review/evaluation、04 交接结论、现有 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`。
- 05 判定：无可添加候选。Round 2 evaluation 明确“建议纳入 CR TODO 跟踪：无”和“CR TODO：0”。
- `install.ts` 重复 orchestration：Round 1 evaluator 与 Round 2 evaluator 均明确为 dismiss / 可忽略，不阻塞、不列 CR TODO；本次不把它升级为 backlog。
- backlog 当前统计保持 open 3、in-progress 0、resolved 0；三条既有 TODO 分别来自 Story 2-4、2-5、4-3，与 Story 5.2 无直接匹配。
- 05 不写入 `cr-todo-backlog.md`，只在本 Story 三份进度文件记录默认决策。

## Finalizer 06 Notes（状态收尾笔记）

- 06 前置确认：latest evaluation 是 `5-2-code-review-evaluation-20260601-round-2.md`，文件内容明确“本轮 CR evaluation 通过”，需要修复 0，CR TODO 0。
- Story 文件状态更新：`_bmad-output/implementation-artifacts/stories/5-2-registry-source-resolution-and-diagnostics.md` 从 `Status: review` 切到 `Status: done`。
- Sprint 状态更新：`_bmad-output/implementation-artifacts/sprint-status.yaml` 中 `5-2-registry-source-resolution-and-diagnostics` 从 `review` 切到 `done`，`last_updated` 刷新为 `2026-06-01 16:20 CST`。
- `bmm-workflow-status.yaml` 不存在；按 finalizer 容错跳过，未创建新文件。
- Epic 5 未完成：5.3、5.4、5.5 仍为 `ready-for-dev`，因此 `epic-5` 保持 `in-progress`，不置为 `done`。
