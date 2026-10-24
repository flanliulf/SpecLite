# Next Iteration Action Plan（发布收口与下一轮迭代行动计划）

先核验并收口 `0.4.1` 发布，再对账 Epic 12／13 规划，随后执行新的实现就绪检查。通过检查后，优先推进 Story 12.1，使 Flow Gate 的正式契约与实现一致。

本文用于维护者安排后续工作。它汇总已有建议，不替代 PRD、SPEC、Epic、Story 或 Flow Gate。保存和提交本文，不代表已授权执行发布或 Story 开发。

## Evidence Baseline（证据基线）

| 项目 | 日期与范围 |
|---|---|
| 整理日期 | 2026-10-24。 |
| 原始评估 | 2026-09-15 的 Claude Code 会话回顾、代码检查、Git／npm 查询和测试。 |
| 原始代码基线 | `ceca9b9`，本地 package version 为 `0.4.1`。 |
| 本次本地核对 | HEAD 仍为 `ceca9b9`。Epic 12／13 及七个 Story 在工作区 tracker 中仍为 `backlog`。两个 Epic 文件尚未跟踪，相关索引、候选文档和 tracker 有未提交改动。 |
| 远端信息边界 | 本地 `origin/main` 引用比 HEAD 多三个提交。本次未执行 fetch，也未重新查询 npm；执行计划前须重新核验。 |

2026-09-15 的评估确认：Epic 1–11 共 70 个 Story 登记为 `done`；Epic 11 有 `PASS` completion gate；后续修复了 fresh install 的 validate 误报和 repair conflict 问题。跨项目安装、篡改检测、修复、卸载和重装已有历史会话证据。这些结果支持下一轮规划，但不证明新 Epic 已具备实施条件。

同次评估中，Git `main` 和 `v0.4.1` tag 已推送，npm `latest` 仍为 `0.4.0`，`0.4.1` 未发布。发布会话停在 `EOTP`，即 npm 要求一次性验证码。此状态只代表当时的查询结果。

## Execution Sequence（执行顺序）

### Step 1 Release Closeout（核验并收口发布）

1. 重新检查工作区、远端提交、`v0.4.1` tag、npm 版本列表与 dist-tag。核对现存发布 worktree 的 HEAD 和改动。
2. 若 `0.4.1` 已发布，直接核验发布结果。不要重复发布，也不要把已前进的 `latest` 改回旧版本。
3. 若版本仍未发布，在确认本次发布授权后，使用与 tag 一致的干净代码树完成发布。需要 OTP 时，由用户完成验证。
4. 在临时目录安装已发布的指定版本。检查 CLI 版本、tarball 内容、`CHANGELOG.md` 和必要的安装验证。
5. 记录 tag、commit、npm version、dist-tag、tarball 校验信息和验证结果。确认发布 worktree 无独有改动后，再安排清理。

**完成标准：** Git 与 npm 的发布证据对应同一版本，干净安装验证通过。不能只凭 push 成功或 CHANGELOG 中的版本条目判定发布完成。

### Step 2 Planning Reconciliation（对账并提交规划）

1. 先查看远端新增提交，再将其中与本计划有关的候选事项纳入范围核对。不要直接把旧工作区规划当作最新全集。
2. 核对 `story-candidates-2026-09-13.md`、Epic 12／13、`epics/index.md`、Epic list 和 `sprint-status.yaml`。为已进入 Epic 的候选补充对应关系，修正“尚未进入 sprint-status”的过期说明。
3. 对账 CR TODO：`TODO-010` 对应 Story 12.3，`TODO-011` 对应 Story 13.3；`TODO-013`／`TODO-014` 保留为独立 artifact root 契约决策。核验 `TODO-028` 的交付证据后，再决定是否关闭。
4. 逐项检查 Story 的验收标准、契约归属、依赖和 Threat Model & Non-Goals。后者用于界定要处理的威胁及明确排除的范围。
5. 按明确范围提交规划。保留业务源码、个人配置和其他任务的改动。

**完成标准：** 候选、Epic、tracker 和 TODO 的归属一致；相关规划已进入可复核的 Git 提交；Story 状态仍按实际进度登记。

### Step 3 Readiness And Story Entry（执行就绪检查并进入 Story）

1. 基于对账后的 PRD、UX、Architecture、SPEC 和 Epic 12／13，运行 fresh IR，即新的 implementation readiness 检查。
2. 如检查发现阻塞项或需要 owner 裁决，先处理这些问题，再重新检查。不得沿用仅覆盖 Epic 11 的历史 `READY`。
3. IR 达到 `READY` 后，创建待实施 Story 的独立 context 文件，再执行 SR，即 Story 设计审查，并完成需要的修订与复审。
4. 实施前运行该 Story 的 `story-kickoff` Flow Gate。只有门禁允许继续，才进入开发。
5. 实施后保留测试、`story-completion`、CR 和 finalizer 证据，再按正式 workflow 更新 tracker。

**完成标准：** 当前 Story 有有效的输入、审查结论和 kickoff gate。`backlog`、`ready-for-dev`、Story 文件存在或 IR `READY` 均不等于实施完成。

### Step 4 Story Delivery Order（按依赖推进 Story）

| Story | 目标 | 顺序与完成证据 |
|---|---|---|
| 12.1 | 追认 Flow Gate report v2，裁决 freshness policy 归属及 gate／tracker 优先级。 | 建议最先推进；对齐 SPEC 09、report template、hook 校验与测试。 |
| 12.2 | 收口 `artifact-path.fixture-write-failed` 的契约归属。 | 与 12.1 独立；明确实现该 issue 或移除声明，并同步证据。 |
| 12.3 | 收口 hook 命令路径、Codex 输出、Stop 处理及 `TODO-010`。 | 先定义旧配置识别，再验证配置升级；以实施时的最新官方平台文档核验行为。 |
| 12.4 | 按项目需要投影 canonical source hook。 | 必须等待 12.3 completion gate `PASS`；验证有／无 protected surface 的安装与更新。 |
| 13.1 | 按 severity 和实际 issue category 生成 validate Next Actions。 | Epic 13 起点；先确认 public `nextActions` 内容变化的兼容性。 |
| 13.2 | 迁移 `doctor`、`list`、`governance-report` 的 human output。 | 等待 13.1 completion gate `PASS`。 |
| 13.3 | 迁移 `init`、`sync`、`uninstall` 的 human output，补齐失败 Step State。 | 等待 13.2 completion gate `PASS`，并关闭 `TODO-011`。 |

Epic 12 的硬依赖为 `12.3 → 12.4`。Epic 13 按 `13.1 → 13.2 → 13.3` 严格串行。两个 Epic 没有已声明的代码级依赖，允许在各自门禁通过后并行。

优先推进 12.1 是治理建议，不新增其他 Story 对它的代码级依赖。Epic 11 retrospective 的 `A11-3` 要求在下一个 Story kickoff 前裁决 gate 优先级；Epic 12 草案又把该裁决列为 12.1 的交付物。fresh IR 和 12.1 kickoff 必须明确这一起步条件，不能仅凭本文绕过已有门禁。

## Verification And Follow-ups（验证与后续事项）

- **契约一致性：** 已知差异是 SPEC 09 声明 report v1，而 hook 要求 v2。12.1 应先确认 owning SPEC，再同步消费者。
- **Hook 升级：** 改变 installer-owned hook config 前，必须登记 recognized legacy shape，即可识别的旧配置形态。否则既有安装可能遇到 `hook-config-conflict`。
- **测试隔离：** 2026-09-15 全量复跑为 727 passed、4 failed、4 todo。失败涉及 npm 缓存权限及共享 packaging manifest 的删除／重建。使用临时缓存并串行复验相关四个文件后，28 个测试通过。后者不等于默认并行测试已修复；应单独评估测试隔离，且避免在混合工作区直接重生成发布基线。
- **条件性债务：** 下次修改 `src/config/cr-directory.ts` 时，同批处理 `TODO-023`／`TODO-024`／`TODO-025`。不把这些事项自动混入无关 Story。
- **审查收敛：** 保留明确的威胁模型。CR 达到 STOP_LOSS 时，回到 Story 边界裁决或 Correct Course，不用无限追加修复轮次替代决策。

## Source Index（来源索引）

| 来源 | 用途 |
|---|---|
| [Epic 11 completion gate](../implementation-artifacts/flow-gates/epic-11-completion-gate.md) | 已完成能力、Story gate 与历史验证证据。 |
| [Epic 11 retrospective](../implementation-artifacts/epic-11-retro-2026-09-12.md) | `A11-*` 行动项、门禁顺序与审查边界。 |
| [Story candidates](story-candidates-2026-09-13.md) | SC-1 至 SC-5 的问题来源。 |
| [Epic index](epics/index.md) | Epic 12／13 的工作区规划入口。 |
| [Sprint status](../implementation-artifacts/sprint-status.yaml) | Story 登记状态。 |
| [CR TODO backlog](../implementation-artifacts/cr-rules/cr-todo-backlog.md) | 待办归属与关闭证据。 |
| [SPEC 09](specs/09-sdlc-workflow-lifecycle-contract.md) | 生命周期和 Flow Gate 的正式契约。 |
| [CHANGELOG](../../CHANGELOG.md) | 已记录的版本变更；发布成功须另查 registry。 |
| [Docs directory guide](../../docs/README.md) | 过程计划归 `_bmad-output/`，不接入公开文档导航。 |

截至整理时，Epic 12／13 正文仅存在于未跟踪的工作区文件；步骤 2 完成后，才能将其作为已提交的交接材料。
