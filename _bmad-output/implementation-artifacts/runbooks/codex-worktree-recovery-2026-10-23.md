# Codex Worktree Recovery Runbook（Codex Worktree 恢复操作说明）— 2026-10-23

本文供另一台机器上的 Codex session 执行。目标分两步：

1. 让主检出目录能切回 `master` 并拉取 `origin/master` 的最新更新；
2. 把该仓库所有分支与 worktree 调整到正常状态：主检出归人工使用，integration branch 不被 linked worktree 占用，每个 linked worktree 都有明确的分支和用途，未提交改动不丢失。

规则依据见 `_bmad-output/planning-artifacts/story-candidates-2026-10-23.md` 的 R1、R2、R7、R8。

## Instructions for Codex（给 Codex 的执行要求）

- 全程使用中文输出。
- 严格按 Phase 顺序执行。遇到 **确认点** 时，先输出计划并停下，等用户在对话中明确同意后再执行写操作。
- 每条写命令执行前，先打印目标 worktree 的绝对路径和分支。
- 任何结果与本文预期不符时立即停止，报告实际输出，不得自行变通。

### Forbidden Commands（禁止命令）

以下命令即使看起来能解决问题，也不得执行：

- `git reset --hard`、`git checkout -- <path>`、`git restore` 丢弃改动、`git clean`
- `git stash`（所有 worktree 共享同一个 stash 栈，容易混淆和丢失）、`git stash drop`、`git stash clear`
- `git worktree remove --force`、`git branch -D`
- `git push`（含 `--force`）、`git rebase`、对共享分支执行 `git merge`（`--ff-only` 更新 `master` 除外）
- 移动或删除 Codex app 管理的 worktree 目录（通常位于 `~/.codex/worktrees/` 下），以及用 `rm` 删除任何 worktree 目录

## Phase 0: Preconditions（前置条件）

请用户先完成以下事项并在对话中确认：

1. 停止所有正在这个仓库任何 worktree 中运行的 Codex 和 Claude Code session（当前这个恢复 session 除外）。
2. 关闭 SourceTree 和 IDEA 中对相关 worktree 的写操作，避免并发修改。
3. 告诉 Codex 主检出目录的绝对路径，记为 `REPO`。已知候选：`/Users/fancyliu/IdeaProjects/ka-workspace/wshoto-ka-vw-anhui`。

校验 `REPO` 确实是主检出：

```bash
git -C "$REPO" rev-parse --path-format=absolute --git-dir
git -C "$REPO" rev-parse --path-format=absolute --git-common-dir
```

两者相同才是主检出。不同时停止并报告。

## Phase 1: Read-only Inventory（只读盘点）

本阶段只执行读命令。`git fetch` 只更新 `refs/remotes/*`，不改动任何工作区，可以执行。

```bash
git -C "$REPO" fetch --prune origin
git -C "$REPO" worktree list --porcelain
git -C "$REPO" branch -vv
git -C "$REPO" stash list
```

对 `worktree list` 中的每个 worktree（记为 `WT`）执行：

```bash
git -C "$WT" status --porcelain=v1 -b
git -C "$WT" log --oneline -1
git -C "$WT" rev-list --left-right --count origin/master...HEAD
git -C "$WT" merge-base --is-ancestor HEAD origin/master && echo merged || echo not-merged
```

`rev-list` 输出左边是 behind（`origin/master` 有、HEAD 没有），右边是 ahead。

输出盘点表：

| 路径 | 类型（main/linked） | 分支 | HEAD | 已修改/未跟踪文件数 | behind/ahead | 已并入 `origin/master` | 有 upstream | 用途判断 | 建议处置 |
|---|---|---|---|---|---|---|---|---|---|

另外单独列出：

- 哪个 worktree 占用了 `master`（`worktree list --porcelain` 中 `branch refs/heads/master` 所在项）。
- 本地 `master` 相对 `origin/master` 的 behind/ahead。
- 位于 `~/.codex/worktrees/` 下的 worktree（Codex app 管理，后续只登记、不移动）。
- stash 列表是否为空。如果不为空，只报告，不处理。

已知现场（以本阶段实测为准）：

- 主检出位于 `codex/sprint4-story-review-20261021`，有未提交的 Story、TSD、sprint 状态改动。
- `master` 被 `/Users/fancyliu/IdeaProjects/ka-workspace/wshoto-ka-vw-anhui-master-merge-20261021` 检出，该 worktree 干净。
- Sprint 2 开发结果在分支 `codex/feature/sprint2-20261019` 上，可能有未提交改动（如 Story 3.7、`SummaryPreviewExtractor.java` 相关）。

**确认点 1**：输出盘点表和每个 worktree 的建议处置，等用户确认。

## Phase 2: Preserve Uncommitted Changes（保存未提交改动）

目标是不丢失任何改动。用提交保存，不用 stash。提交是可逆的：如果之后需要撤回，可以执行 `git reset --soft HEAD~1`。

对每个有改动的 worktree：

1. 列出 `git -C "$WT" status --porcelain=v1` 的完整文件清单，按"已跟踪修改"和"未跟踪文件"分组。
2. 未跟踪文件逐个让用户确认是否纳入，可能是临时文件或含敏感信息。
3. 不得纳入 `.claude/`、`.codex/`、`_speclite/config.user.toml`、`_speclite/custom/*.user.toml`。
4. 提议中文 Conventional Commit 信息，例如：
   - 主检出 sprint4 规划改动：`docs(planning): 保存 sprint4 story review 未提交改动`
   - Sprint 2 开发改动：`chore(sprint2): 保存 Story 3.7 等未提交开发改动`

**确认点 2**：用户确认文件范围与提交信息后执行：

```bash
git -C "$WT" add -- <确认的文件列表>
git -C "$WT" commit -m "<确认的提交信息>"
git -C "$WT" status --porcelain=v1 -b
```

提交后该 worktree 应为干净状态，不干净时停止并报告。

## Phase 3: Release `master`（释放 master）

找到占用 `master` 的 worktree，记为 `HOLDER`。

- 如果 `HOLDER` 就是 `REPO`，跳到 Phase 4。
- 如果 `HOLDER` 是 linked worktree：
  1. 确认它是干净的。
  2. 检查本地 `master` 是否有未推送提交：`git -C "$REPO" log --oneline origin/master..master`。有输出时停止，报告这些提交，由用户决定是否需要先推送（例如合并结果尚未推送）。Codex 不得自行推送。
  3. 向用户提供两种处置方式：
     - **A 删除该 worktree（推荐，merge 任务已完成时）**：`git -C "$REPO" worktree remove "$HOLDER"`。不加 `--force`，如果 worktree 有改动 git 会拒绝执行，这是安全的。
     - **B 保留该 worktree，改用临时合并分支**：`git -C "$HOLDER" switch -c merge/master-<来源分支简称>`。

**确认点 3**：用户选择 A 或 B 后执行。之后执行 `git -C "$REPO" worktree list --porcelain`，验证不再有 linked worktree 占用 `master`。

## Phase 4: Switch to `master` and Pull（主检出切回 master 并拉取）

```bash
git -C "$REPO" status --porcelain=v1 -b
git -C "$REPO" switch master
git -C "$REPO" rev-parse --abbrev-ref master@{upstream}
```

如果 `master` 没有 upstream，确认后执行 `git -C "$REPO" branch --set-upstream-to=origin/master master`。

```bash
git -C "$REPO" merge --ff-only origin/master
git -C "$REPO" rev-parse master origin/master
```

- 两个 SHA 必须一致。
- 如果 `--ff-only` 失败，说明本地 `master` 与远程分叉。停止，报告 `git log --oneline origin/master..master` 和 `git log --oneline master..origin/master`，由用户裁决。不得 reset 或 rebase。

完成后，主检出就回到了人工使用状态：SourceTree 和 IDEA 可以在这里正常切换和拉取 `master`。

## Phase 5: Normalize Linked Worktrees（整理其余 linked worktree）

对每个 linked worktree 按下表处置，每项处置都要经过用户确认：

| 状态 | 处置 |
|---|---|
| 干净，且 HEAD 已并入 `origin/master` | 建议删除：`git -C "$REPO" worktree remove "$WT"`，然后 `git -C "$REPO" branch -d <branch>`。`-d` 遇到未合并分支会拒绝删除，这是安全的 |
| 有未合并提交，例如 `codex/feature/sprint2-20261019` | 保留。只报告 behind/ahead；本次不 rebase、不 merge，后续同步由用户另行决定 |
| 位于 integration branch（`master`、`main`、`release/*`） | 不允许。回到 Phase 3 的处理方式 |
| 位于 `~/.codex/worktrees/` | 不移动、不改名，只在报告中登记分支和用途 |

规划分支（例如 `codex/sprint4-story-review-20261021`）按 R5 应先通过 PR 合入 `master`，再基于新的 `master` 开 Sprint 4 的开发 worktree。本次只在报告中提示，不执行合并或推送。

可选整理项（每项单独确认，默认不做）：

- 把仓库内或命名混乱的非 Codex app worktree 移到仓库外的同级目录：`git -C "$REPO" worktree move "$WT" "<repo-parent>/wshoto-ka-vw-anhui.worktrees/<branch-slug>"`。前提是没有 session 或 IDE 正在使用它。
- 只有从未推送（没有 upstream）的本地分支，才允许用 `git branch -m` 改成 `[{user}/]{type}/{epicKey}-{slug}` 格式；已推送的分支不改名，避免影响团队。

## Phase 6: Projection Check（个人配置补齐检查）

团队规定 `.claude/` 和 `.codex/` 不提交，因此保留下来、后续要跑 SpecLite 的 linked worktree 可能缺少这些文件。对每个这样的 worktree 检查：

```bash
ls "$WT/.claude/skills" "$WT/.claude/settings.json" "$WT/.codex/hooks.json" "$WT/_speclite/config.user.toml" 2>&1
```

缺失时：

1. 在该 worktree 先执行预览：`speclite update "$WT"`，把计划给用户看。
2. **确认点 4**：用户同意后执行 `speclite update --repair "$WT"`。
3. 从主检出复制个人配置：`cp "$REPO/_speclite/config.user.toml" "$WT/_speclite/"`。`_speclite/custom/*.user.toml` 存在时同样复制。

如果 `speclite` 不在 `PATH` 中，只报告，不要自行安装。

## Phase 7: Cleanup and Final Report（清理与最终报告）

```bash
git -C "$REPO" worktree prune --dry-run -v
```

有输出时，经用户确认后执行 `git -C "$REPO" worktree prune -v`。prune 只清理目录已不存在的 worktree 登记，不会删除文件。

验收清单（逐项给出命令输出证据）：

- [ ] 主检出位于 `master`，`master` 与 `origin/master` 的 SHA 一致。
- [ ] 没有 linked worktree 检出 `master`、`main` 或 `release/*`。
- [ ] 所有 worktree 都是干净的；Phase 2 的提交已列出 SHA。
- [ ] stash 列表与 Phase 1 相同，没有新增或丢失。
- [ ] 每个保留的 linked worktree 都有明确的分支、用途和 behind/ahead 记录。
- [ ] 需要跑 SpecLite 的 worktree 已通过 Phase 6 检查。

最终报告格式：

1. 最终 worktree 表：路径、分支、用途、behind/ahead、是否干净。
2. 本次执行的全部写操作：命令、目标 worktree、结果。
3. 新建的提交：SHA、分支、提交信息。
4. 未处理事项与建议的下一步，例如 sprint4 规划分支提 PR、sprint2 分支同步 `master`。

## Paste-ready Prompt（可直接粘贴的启动提示）

```text
请阅读并严格执行操作说明 codex-worktree-recovery-2026-10-23.md。
目标仓库主检出路径：/Users/fancyliu/IdeaProjects/ka-workspace/wshoto-ka-vw-anhui。
我已停止该仓库其他 worktree 中运行的 Codex/Claude Code session，并关闭 SourceTree/IDEA 中的写操作。
请从 Phase 0 开始，遇到确认点必须停下等我确认；禁止命令清单中的命令一律不得执行。
```
