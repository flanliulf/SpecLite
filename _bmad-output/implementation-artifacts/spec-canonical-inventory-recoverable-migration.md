---
title: 'Canonical Inventory Recoverable Migration（Canonical Inventory 可恢复迁移）'
type: 'feature'
created: '2026-09-01'
status: 'done'
baseline_commit: 'c96fe9aed14635a0e827e6e05648fb21469a9055'
context:
  - '{project-root}/_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 旧安装的 update 只遍历既有 `files-index`，无法吸收新版 canonical 新增文件、移动后的 sourceRef 和派生索引变化；NOI 因而被 116 个 inventory drift、48 个 missing source 和 24 个 package drift 阻断。

**Approach:** 从 canonical source 构建完整 desired installed-state；以旧 `skill-index` 中实际存在的 Skill 补齐其当前唯一 ecosystem module owner，再用完整 preflight、operation lock、单文件安全写、indexes-last 和 recovery journal 做可续跑的协调提交。

## Boundaries & Constraints

**Always:** dry-run 零写入；apply 必须显式 `--yes` 并持有 project lock；payload、manifest、skill/help/phase indexes 和 files index 来自同一 projection；modules 取 manifest 原值与旧 Skill 唯一 owner 的并集；所有 existing paths 按旧 baseline preflight；`files-index` 最后提交；中断后只能在 old/new 状态可证明时续跑；human/workflow-owned 字节不变。

**Ask First:** 删除 stale path；处理零个或多个 owner 的旧 Skill；支持 `registry`/`git` 自动迁移；升级为严格瞬时 all-or-nothing 事务。

**Never:** 扩装旧 inventory 未证明存在的 ecosystem；认领 unindexed existing path；以 package drift 重复阻断安全 file-level plan；引入新依赖；直接写 NOI；把多文件 rename 宣称为瞬时原子事务。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior | Error Handling |
|---|---|---|---|
| 新 canonical path | 旧 index 和磁盘均无 | dry-run=`create`；apply 后进入全套 indexes | 路径后来出现则首写前阻断 |
| 安全更新 | current=旧 baseline，desired 改变 | `update` 并同步 sourceRef/hash | source/target 漂移则 conflict |
| module 重分类 | 旧 Skill 唯一属于当前 ecosystem module | manifest 仅补入该 owner | owner 不唯一则 fail closed |
| 路径碰撞或本地 drift | unindexed-existing 或 current≠baseline | 不写入、不认领 | `unknown-ownership` / `installer-owned-drift` |
| 中断恢复 | journal 显示部分提交 | 锁内校验后幂等续跑 | 状态不可证明则保留 journal 并阻断 |

</frozen-after-approval>

## Code Map

- `src/ide/target-writer.ts` -- canonical projection 与立即写入当前耦合。
- `src/manifest/manifest-generator.ts` -- manifest/index deterministic builders。
- `src/update/update-plan.ts` -- desired/current diff、apply 与失败报告。
- `src/fs/safe-write.ts`、`src/fs/operation-lock.ts` -- 单文件写入与命令互斥边界。
- `src/commands/update.ts`、`src/commands/sync.ts` -- lock 内 recovery/apply 编排。

## Tasks & Acceptance

**Execution:**
- [x] `src/ide/target-writer.ts` -- 抽出 install/update 共用的无副作用 mirror projection builder。
- [x] `src/update/update-plan.ts` -- 实现 module owner closure、完整 desired state 和安全 create/update；不可映射 stale 内容保持 conflict。
- [x] `src/fs/update-transaction.ts` -- 实现无依赖 journal、stable plan identity、old/new hash 与幂等 recovery；journal 不进 files index。
- [x] `src/commands/update.ts`、`src/commands/sync.ts` -- 仅在持锁写路径执行 recovery/coordinated apply；dry-run 只规划。
- [x] `test/update-planning.test.ts`、`test/update-command.test.ts`、`test/sync-command.test.ts`、`test/story-6-4-path-portability.test.ts` -- 覆盖 migration、冲突、失败注入、续跑与 public output。

**Acceptance Criteria:**
- Given manifest 仅有 `core/sdlc` 但旧 skill index 含当前唯一归属 ecosystem 的 Skill, when dry-run, then 只补这些 owner modules，输出完整 create/update plan 且零写入。
- Given plan 无冲突, when `--yes`, then payload 与全部 installed-state artifacts 在同一 lock 生命周期内闭合，follow-up dry-run 为 no-op。
- Given target/source/index 在首写前偏离 baseline, when apply, then 零 mutation、fail closed。
- Given apply 中断, when 下次授权命令读取 journal, then 仅在每个路径可证明为 old/new 时续跑，否则输出稳定 recovery blocker。
- Given protected、unindexed-existing 或 locally drifted path, when planning/apply, then 原字节不变且 reason 可复核。

## Spec Change Log

## Design Notes

“Recoverable” 表示完整预检、命令互斥、单文件原子替换、持久化进度和 indexes-last；崩溃时可出现可识别中间态，但不得误报 success。module closure 只消费旧 `skill-index` 证据，不引入其他 ecosystem defaults。

## Verification

**Commands:**
- `npm test -- test/update-planning.test.ts test/update-command.test.ts test/sync-command.test.ts test/story-6-4-path-portability.test.ts` -- focused migration/recovery tests 全部通过。
- `npm run build && npm test` -- build 与 full suite 通过。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` -- `status=ok`。
- `node dist/bin/speclite.js sync /Users/fancyliu/Repos/noi --json` -- 只读计划无 resolver false positives，可迁移 inventory 使用 create/update 表达。
- `git diff --check` -- 无 whitespace error。

## Suggested Review Order

**规划与所有权边界**

- 从 update 入口统一构造 desired state、冲突与授权语义。
  [`update-plan.ts:64`](../../src/update/update-plan.ts#L64)

- 以旧 inventory 证据闭合 module owner 与依赖。
  [`update-plan.ts:784`](../../src/update/update-plan.ts#L784)

- 仅消除可由 file-level 计划完全解释的 package drift。
  [`update-plan.ts:1245`](../../src/update/update-plan.ts#L1245)

**可恢复提交边界**

- 在首写前验证 source、baseline、mode 与 journal contract。
  [`update-transaction.ts:71`](../../src/fs/update-transaction.ts#L71)

- 清理全部已提交但遗留 journal 的崩溃窗口。
  [`update-transaction.ts:57`](../../src/fs/update-transaction.ts#L57)

- create 使用原子 no-replace，阻止检查后路径突现覆盖。
  [`safe-write.ts:50`](../../src/fs/safe-write.ts#L50)

**Canonical 投影**

- 复用无副作用 projection，并把 source I/O 转成结构化 blocker。
  [`target-writer.ts:94`](../../src/ide/target-writer.ts#L94)

**回归证据**

- 覆盖 malformed、重复路径、mode-only、续跑与 journal 清理。
  [`update-planning.test.ts:1403`](../../test/update-planning.test.ts#L1403)

- 覆盖 canonical source 不可读时的 fail-closed 输出。
  [`ide-target-writer.test.ts:20`](../../test/ide-target-writer.test.ts#L20)

- packaging evidence 绑定最终构建内容哈希。
  [`packaging-manifest.json:1`](../../release/packaging-manifest.json#L1)
