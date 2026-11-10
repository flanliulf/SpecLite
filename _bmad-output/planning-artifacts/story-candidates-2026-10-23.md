# Story Candidates（Story 候选）— 2026-10-23

本文记录 2026-10-23 在下游多人团队项目中排查 AI session 与 Git worktree 混乱时发现、需要作为后续 Story 规划的事项。它尚未进入 `sprint-status.yaml`，不表示已排期或已批准；给出证据、产品诉求依据、规则草案与验收草案，供规划下一 Epic 或 backlog 整理时裁决。

## Background（背景）

### 下游现场

- 团队形态：多人；SpecLite 产物（PRD、Epics、Stories、`sprint-status.yaml`、code-reviews、goal records）提交到项目仓库；`.claude/`、`.codex/` 属于开发者个人设置，不提交。
- 宿主：Codex app 与 Codex CLI、Claude Code 桌面版与 CLI 混用；两个互不依赖的 Epic 偶尔由两个 session 并行执行。
- 事故现象（SourceTree 截图与 Codex 会话记录）：
  1. 主检出目录 `wshoto-ka-vw-anhui` 被 Codex session 用作 cwd，停在 `codex/sprint4-story-review-20261021`，且有未提交的 Story、TSD、sprint 状态改动。
  2. `master` 被临时 linked worktree `wshoto-ka-vw-anhui-master-merge-20261021` 检出；在主检出中切换 `master` 失败：`fatal: 'master' is already used by worktree at ...`。
  3. Sprint 2 开发结果位于另一个分支 `codex/feature/sprint2-20261019`，与规划改动分处两个分支且均未提交。
  4. 追问"运行中的会话实际在哪个目录、哪个分支工作"时，AI 只能确认会话登记的 cwd，并承认会话可通过命令 `workdir` 或 `git -C` 操作其他 worktree，无法证明实际写入位置。

### Failure Modes（失败模式）

| # | 失败模式 | 对应规则 |
|---|---|---|
| F1 | 人工主检出被 AI session 占用 | R1 |
| F2 | integration branch 被 linked worktree 锁定 | R2 |
| F3 | session ↔ worktree ↔ branch 绑定不可见、不可约束 | R3、R4 |
| F4 | 规划产物与开发产物跨分支分叉且未提交 | R5 |
| F5 | 分支命名由宿主生成、无语义 | Naming Defaults |
| F6 | 多人/多 session 并行时 `sprint-status.yaml` 必然冲突 | R6 |
| F7 | 个人设置不提交，新 worktree 缺 Skill projection 与 hook | R7 |

结论：worktree + feature branch 本身合理，且下游已在使用；缺的是所有权与绑定规则。只增加"新开 worktree"要求而不定义所有权，会放大上述问题。

### Constraint Strength（约束强度）

- **Hard（HALT）**：只读检测、校验与绑定登记。SpecLite 负责判断"当前工作区能否开跑"。
- **不强制 SpecLite 创建 worktree**：Codex app 与 Claude Code 会自建 worktree；SpecLite 接受宿主创建结果并补登记。CLI 辅助创建列为可选后续。
- **Defaults（WARN）**：命名与目录只给默认值，偏离仅 WARN 并记录。

### Rules（规则草案）

- **R1 主检出归人**：clone 主目录只供人工使用，保持在 integration branch 或人的分支。Epic 级 runner（ECR/ESR）在主检出中运行时 HALT；`speclite-quick-dev` 允许在主检出的非 integration 分支运行，但需人确认。判定：`git rev-parse --git-dir` 等于 `git rev-parse --git-common-dir` 即为主检出。
- **R2 integration branch 不进 linked worktree**：`main`、`master`、`release/*`（可配置）禁止在 linked worktree 中检出。合并使用临时分支 `merge/<target>-<source>` 或在主检出完成。
- **R3 一对一绑定并登记**：一个 worktree = 一个 branch = 一个 run（`planning` / `dev-cr` / `merge`）= 一个活跃 session。登记表位于 `$(git rev-parse --git-common-dir)/speclite/worktrees.json`：对同一仓库所有 worktree 可见，且天然不进入版本库。字段：`worktreePath`、`branch`、`purpose`、`epicId`、`baseRef`、`baseSha`、`host`、`sessionId`、`createdAt`、`status`（`active` / `released`）。
- **R4 会话不越界**：写操作只允许发生在 `git rev-parse --show-toplevel` 等于登记 `worktreePath` 的位置；禁止以 `git -C` 或 `workdir` 写入其他 worktree。ECR Step 0、Step 4、Step 12 前重新校验。
- **R5 规划先落库再开发**：`dev-cr` worktree 只能从已提交的 base 创建，base 必须包含 validated 目标 Story 与对应 `sprint-status.yaml` 条目。Story review、TSD 等规划工作在 `docs/` 类分支完成并合入 integration branch 后，才可开开发 worktree。base 存在未提交规划改动时 HALT。
- **R6 tracker 按 Epic 分区写**：Epic 分支只修改本 Epic 的 `development_status` key（`epic-N`、`N-*`、`epic-N-retrospective`）。顶层 `last_updated` 在每个分支都会改写，是确定冲突行，需要单独规定：合并时取较晚值，或由 reconcile 命令重算。后续提供 `speclite reconcile sprint-status`，按状态单调取高合并。
- **R7 遵循团队设置：projection 不提交，worktree 预检补齐**：承认"`.claude/`、`.codex/` 不提交"为受支持的团队模式。在新 worktree 中，`.claude/skills/*`、`.claude/settings.json`、`.codex/hooks.json`（以及团队选择忽略的 `.agents/skills/*`）与 `_speclite/config.user.toml`、`_speclite/custom/*.user.toml` 都不存在。预检必须检查这些文件，缺失时 HALT，并给出 remediation：在该 worktree 执行 `speclite update --repair`，从主检出复制个人 user config；Claude Code 自建 worktree 可用 `.worktreeinclude`。
- **R8 收口边界**：默认不 push、不 merge、不删除 worktree；run 结束将登记 `status` 置为 `released`；清理 worktree 需人确认。

### Naming Defaults（命名与目录默认值）

| 项 | 默认 | 说明 |
|---|---|---|
| branch | `[{user}/]{type}/{epicKey}-{slug}` | `type`：`feat`（dev-cr）、`docs`（planning/review）、`merge`（临时合并）。多人团队建议启用 `{user}/` 前缀，避免远程重名。slug 为 kebab-case ASCII，≤ 40 字符。日期不进分支名，记录在登记表 |
| worktree 目录 | `{repo-parent}/{repo}.worktrees/{branch-slug}` | 放在仓库外的 sibling 目录。仓库内嵌套的 worktree 会被 IDEA、tsc、test runner 重复扫描，Java 项目会出现重复类 |
| 宿主自建 worktree | 接受并登记 | 位置在仓库内时，提示在 IDE 中排除 |
| 配置 | `[modules.sdlc]` 下 `isolation_mode`（`worktree` / `branch` / `none`）、`worktree_root`、`branch_prefix`、`integration_branches` | 默认 `isolation_mode = "worktree"` |

## SC-1 Workspace Isolation Contract 与只读 `speclite resolve workspace`

- **范围**：R1、R2、R7。
- **内容**：
  - 新增 canonical contract `workspace-isolation-contract.md`，参照 `speclite-code-review-contract` 的模式，由单一 owner 维护、多个 Skill 消费，不在各 Skill 中复制条款。
  - 新增只读 CLI `speclite resolve workspace --project-root .`（D0），输出 JSON：`checkoutKind`（`main` / `linked`）、`branch`、`isIntegrationBranch`、`integrationBranchHolders`（哪些 worktree 占用 integration branch）、`dirty`、`projectionPresence`（R7 各文件是否存在）、`verdict`（`ok` / `warn` / `halt`）与 `remediation`。
  - ECR Step 0、ESR preflight、`speclite-dev-story` preflight、`speclite-quick-dev` step-01 改为消费该 resolver，替代现有零散的分支检查。
  - `docs/reference/runtime-layout.md` 增加"projection 不提交"团队模式说明，消除与现行"提交 projection"表述的冲突。
- **验收草案**：
  - fixture：主检出 + integration branch、主检出 + feature branch、linked + integration branch、linked + feature branch、linked 缺 `.claude/skills`、linked 缺 `config.user.toml`，分别断言 `verdict` 与 remediation。
  - resolver 不写入任何文件，不执行 `git` 写命令。
  - `speclite-check-canonical-source-change` 的 module-help、docs、fixtures 派生项同步。

## SC-2 Worktree 绑定登记与越界校验

- **范围**：R3、R4、R8。
- **内容**：
  - `speclite workspace register | status | release`：读写 `$(git rev-parse --git-common-dir)/speclite/worktrees.json`；`status` 列出所有 worktree 的绑定、分支、dirty 状态与 ahead/behind，直接回答"哪个 session 在哪个 worktree 工作"。
  - 宿主自建 worktree 首次运行 runner 时自动 register（只登记，不移动、不改名）。
  - ECR goal records `PLAN.md` 记录 `worktreePath`、`branch`、`baseRef`、`baseSha`；`crDir` 只记录相对 project root 的路径。
  - ECR Step 0、Step 4、Step 12 校验 `show-toplevel` 与登记一致，不一致 HALT。
- **验收草案**：
  - 两个 linked worktree 并行登记互不覆盖；对已 `active` 的 worktree 重复 register 视为续跑，绑定冲突 HALT。
  - 模拟 session 在 worktree A 登记、却从 worktree B 运行 Step 12 commit，断言 HALT。
  - 登记文件写入使用原子写，并受 `_speclite/.lock` 或独立锁保护。

## SC-3 规划先落库的 Kickoff 门禁

- **范围**：R5。
- **内容**：
  - `speclite-flow-gate mode=story-kickoff` 增加检查：目标 Story 文件与 `sprint-status.yaml` 条目已提交在 `baseSha` 可达历史中，当前 worktree 对这些文件无未提交改动。
  - `speclite-create-story`、Story review runner（ESR）在 `docs/` 类分支运行时，收口提示"合入 integration branch 后再开 dev-cr worktree"。
- **验收草案**：
  - fixture：Story 文件未提交、Story 已提交但 base 早于提交、规划改动在另一个未合并分支三种情况，均 HALT 并给出 remediation。
  - 门禁报告 schema 增量字段向后兼容，flow-gate hook 只读取既有字段。

## SC-4 `sprint-status.yaml` 分区写与 reconcile

- **范围**：R6。
- **内容**：
  - 所有更新 `sprint-status.yaml` 的 Skill（`sprint-planning`、`create-story`、`dev-story`、`sprint-status`、`quick-dev`、`code-review-06-finalizer`、`retrospective`）在 Epic 分支上只写本 Epic 的 key。
  - 规定 `last_updated` 的合并语义。
  - 新增 `speclite reconcile sprint-status --ours <file> --theirs <file>`：按状态单调取高合并，冲突（如同一 key 双方都有非单调变化）输出结构化报告而不是静默选择；可作为 git merge driver 接入（opt-in）。
- **验收草案**：
  - 两个 Epic 分支分别推进各自 Story 后合并，reconcile 结果包含双方推进且无降级。
  - 同一 Story 在两个分支出现 `done` 与 `in-progress` 时取 `done`；出现非法组合时报告冲突。
  - Skill 写入越过本 Epic key 时，由 finalizer 或 flow-gate 检出。

## SC-5（可选，后续）`speclite workspace create`

- **范围**：为不使用宿主自建 worktree 的 CLI 用户提供一致的创建入口。
- **内容**：按 Naming Defaults 计算分支与目录，从 integration branch 最新 `origin` HEAD 创建，执行 R7 补齐，并自动 register。
- **前置**：SC-1、SC-2 完成并在下游验证一个 Sprint 后再评估是否需要。

## Related Evidence（相关证据）

- 现有零散规则：ECR `references/runner-workflow.md` Step 0"确认 cwd、branch、HEAD"、Step 4"baseline 不自动假设 main"、Step 12"工作树存在无关改动时先隔离或询问"；`speclite-quick-dev` `references/steps/step-01-clarify-and-route.md` 的 version control sanity check。
- `sprint-status-template.yaml` 的 `development_status` 以 story key 分行，分区写可将冲突收敛到行级；顶层 `last_updated` 为确定冲突点。
- `docs/reference/runtime-layout.md` 当前要求提交 `.claude/skills/*`、`.agents/skills/*`、`.claude/settings.json`、`.codex/hooks.json`，与下游团队实践不一致，由 SC-1 文档项收口。
- 下游现场恢复步骤见 `_bmad-output/implementation-artifacts/runbooks/codex-worktree-recovery-2026-10-23.md`。
- **关联文档**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`、`assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/references/workflow-details.md`、`assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev/references/steps/step-01-clarify-and-route.md`、`assets/source/speclite/sdlc-skills/module.yaml`、`docs/reference/runtime-layout.md`、`docs/reference/workflow-artifact-layout.md`。
