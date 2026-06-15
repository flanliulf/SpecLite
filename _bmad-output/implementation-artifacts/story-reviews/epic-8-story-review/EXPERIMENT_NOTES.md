# Experiment Notes（实验笔记）

## 2026-06-15 Preflight Decision（前置决策）

当前可以启动 reviewer：

- Epic 8 已有 7 个 Story markdown，均位于 `_bmad-output/implementation-artifacts/stories/`。
- `sprint-status.yaml` 显示 Epic 8 当前为 `in-progress`，各 Story 均为 `ready-for-dev`。
- Epic 8 SR 目录此前不存在，本次属于新任务，不是续跑。
- 当前工作树干净，无需隔离无关改动。

## Path Decision（路径决策）

SR 配置文档中的 Epic 文件理想命名是 `epic-{epic-id}.md`，但当前仓库实际使用 sharded planning artifact 命名：

- 实际 Epic 8 文件：`_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`

决策：

- 不创建兼容副本或重命名 planning artifact，避免改变既有文档结构。
- reviewer sub-agent 必须按当前仓库实际文件匹配 `*epic-8*` 定位 Epic 8 artifact。
- 该决策只影响本次 SR 输入定位，不改变 SR 输出目录和文件命名。

## Risk（风险）

- Epic 8 有 7 个 Story，SR-01 Epic 模式会触发分批审查要求，每批不超过 5 个 Story；需要 reviewer 保持跨批次审查口径一致。
- 如果 reviewer 内部三层 Agent 不可用，按 SR review engine 可降级为单一 LLM 审查，但必须在 review summary 中如实记录降级。
- 如果 evaluator 判定需要修订，fixer 只允许按 evaluation 明确结论修改 Story/Epic 文档，禁止扩大范围或修改源码。

## User Intervention Point（用户介入点）

当前无需用户介入。只有在以下情况出现时才停止询问：

- evaluation 要求改变需求边界。
- fixer 需要修改超出 Epic 8 SR 范围的文件。
- 最终提交前出现无关工作树改动，且无法安全隔离。
- 需要执行 push 或破坏性 git 操作。

## 2026-06-15 Reviewer Round 1 Decision（Reviewer 第 1 轮判断）

Reviewer 产物已生成，结论为有条件通过，且存在 1 个硬阻塞：

- Story 8.5 的 `unresolved` human outcome 与 resolve 默认 missing-key / pure JSON 契约存在未决冲突。
- Story 8.3 缺少 `partial-or-failed` 的 AC 级验收。
- Story 8.4 的 status outcome 与 `highLevelHealth` contract 缺少确定性映射。
- Story 8.1 与 Story 8.6 的 message catalog / Next Actions ownership 仍可能重叠。

门禁判断：

- 不能直接结束 SR，因为 reviewer 未通过且存在 `decision_needed` 与 `patch` 发现。
- 不能启动 fixer，因为尚未有 evaluator 确认哪些发现有效、哪些需要修订。
- 下一步必须启动 fresh evaluator，并以 evaluator 的“需要修订 / 可直接进入开发 / 需讨论”作为是否进入 fixer 的依据。

## 2026-06-15 Evaluator Round 1 Decision（Evaluator 第 1 轮判断）

Evaluator 已确认 SR 不可直接收口，整体结论为需修订后再审。

修订范围判断：

- Finding 1 被列入“需要修订（阻塞进入开发）”，P0，涉及 Story 8.5 的 `resolve` public contract 裁决。
- Finding 2 被列入“需要修订（阻塞进入开发）”，P1，涉及 Story 8.3 的 `partial-or-failed` AC 缺口。
- Finding 3 被列入“需要修订（阻塞进入开发）”，P1，涉及 Story 8.4 的 `status` human outcome 与 `highLevelHealth` mapping。
- Finding 4 被列入“建议纳入后续改善跟踪（非阻塞）”，P2，不作为本轮 fixer 必修范围。

下一步：

- 启动 fresh fixer。
- fixer 指令限定为 Finding 1、2、3，避免把 P2 非阻塞改善项扩大为必修变更。
- fixer 完成后必须回到 reviewer/evaluator，而不能直接提交。

## 2026-06-15 Fixer Round 1 Decision（Fixer 第 1 轮判断）

Fixer 已完成 evaluation 确认的 3 个阻塞项：

- Finding 1：Story 8.5 已写入 resolve output mode 裁决，默认 machine contract 保持 pure JSON，human output 通过显式 `--human` opt-in。
- Finding 2：Story 8.3 已新增 `partial-or-failed` AC，并扩展相关任务与测试要求。
- Finding 3：Story 8.4 已新增 `highLevelHealth` 到 status human outcome 的 mapping table，并限定 `stale` / `unknown` 不扩展 public JSON enum。
- Finding 4：按 evaluation 降级结论保持为 P2 非阻塞改善项，本轮未改。

当前判断：

- 修订未触及源码、测试、SPEC、Epic 文件或 sprint status。
- Path-limited `git diff --check` 通过。
- 因为曾执行 fixer，必须重新 review/evaluate；不能依据 fixer 自报直接判定 SR 通过。

下一步：

- 启动 Round 2 reviewer。
- Round 2 reviewer 应重点关注 Finding 1-3 是否已修复，以及 Finding 4 是否仍为非阻塞改善项。

## 2026-06-15 Reviewer Round 2 Decision（Reviewer 第 2 轮判断）

Round 2 reviewer 已给出通过结论：

- Round 1 Finding 1 已修复：Story 8.5 已明确 default JSON mode 与 explicit `--human` human mode 边界。
- Round 1 Finding 2 已修复：Story 8.3 已新增 `partial-or-failed` AC。
- Round 1 Finding 3 已修复：Story 8.4 已新增 `highLevelHealth` mapping table。
- Finding 4 维持为 P2 非阻塞改善项。
- 本轮无新的 `decision_needed` 或 `patch`。

门禁判断：

- 不能直接完成目标，因为 completion criteria 要求最新 evaluator 也通过。
- 下一步必须启动 fresh evaluator 评估 Round 2 summary。

## 2026-06-15 Evaluator Round 2 Decision（Evaluator 第 2 轮判断）

Evaluator 第 2 轮确认 Round 2 reviewer 的通过结论成立：

- Finding 1-3 均已修复。
- Finding 4 仍是 P2 非阻塞改善项。
- 无需要修订的阻塞项。
- 无误报。
- 不需要继续 fixer。

门禁判断：

- SR 循环已满足 reviewer 通过 + evaluator 通过。
- 曾执行 fixer，且 fixer 后已重新 review/evaluate。
- 下一步进入最终提交；提交前必须重新审计工作树并只纳入 Epic 8 SR 闭环相关文件。

## 2026-06-15 Final Commit Decision（最终提交决策）

最终提交范围决策：

- 纳入 Epic 8 SR 闭环相关文件：Story 8.3、8.4、8.5 修订，Epic 8 SR 进度文件，以及 Round 1/2 summary/evaluation 产物。
- 排除源码、测试、SPEC、Epic 文件和 `sprint-status.yaml`，因为本次 SR fixer 未授权也未实际修改这些文件。
- 使用中文 Conventional Commit：`docs(epic-8): 完成 Story Review 闭环`。
- 默认不 push。

剩余非阻塞跟踪：

- Finding 4 维持为 P2：Story 8.1 / 8.6 的 message catalog 与 Next Actions ownership 边界，建议在后续实现记录或 PR 说明中显式记录 key ownership 与 registry 扩展策略。
