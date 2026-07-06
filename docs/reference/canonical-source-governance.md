# Canonical Source Governance（规范来源治理）

本文定义 SpecLite canonical source 迭代的治理规则。它回答三个问题：哪些文件代表当前事实，哪些文件只是派生或历史证据，以及 `assets/source/speclite/` 变更后必须触发哪些确定性检查和人工决策。

治理目标不是让 hook 替代维护者判断，而是把可确定的问题交给脚本，把不可完全确定的问题显式记录为决策。

## Governance Rule（治理规则）

每次 canonical source 变更必须先分类，再更新派生产物：

1. 识别变更属于哪类治理对象。
2. 根据影响面矩阵列出必须同步、需要评估和不得改写的文件。
3. 对 `D0` 问题执行确定性修复。
4. 对 `D1` / `D2` 问题记录 `updated`、`skipped` 或 `historical snapshot` 决策。
5. 使用 checker、lint、test、build 和 packaging check 收口。

`assets/source/speclite/canonical-governance.json` 是机器可读的治理映射；本文是面向维护者的解释。

## Determinism Levels（确定性分层）

| Level | Meaning | Examples | Governance |
|---|---|---|---|
| `D0` | 机器能判断对错 | package root count、`module-help.csv` 覆盖、hook source 文件完整性、baseline count、packaging manifest | strict mode 可阻断 |
| `D1` | 机器能提示风险，但需要人工判断 | 新 workflow 是否应进入 reference docs、README 是否需要同步 | 必须记录更新或跳过理由 |
| `D2` | 主要依赖人工治理 | legacy mapping 是否仍是活参考、旧 `PLAN.md` 是否是历史快照 | 不得假装自动化完成 |

## Classification（文件分类）

| Class | Source | Determinism | Policy |
|---|---|---:|---|
| `canonical-source-truth` | `core-skills/`、`sdlc-skills/`、`support-skills/`、`hooks/`、`scripts/`、`custom/` | `D0` | authoritative source，先分类再同步 |
| `module-discovery-contract` | `module.yaml`、`module-help.csv`、baseline constants | `D0` | 必须匹配真实 package roots |
| `hook-source-contract` | `hooks/<hook-id>/` | `D0` | manifest、runner、README、IDE fragments 必须完整 |
| `current-public-docs` | `docs/`、root `README.md`、`assets/source/speclite/README*.md` | `D1` | 当前用户可见行为变化时同步 |
| `living-legacy-reference` | 仍指导维护的 legacy mapping/context | `D2` | 可追加当前说明，不按历史结果全量重写 |
| `frozen-historical-record` | 已完成的 `PLAN.md`、`EXPERIMENTS.md`、handoff snapshot | `D2` | 默认保留过去事实 |
| `release-evidence` | `release/packaging-manifest.json`、`dist/packaging-manifest.json` | `D0` | packaged content 变化后重新生成 |

## Impact Matrix（影响面矩阵）

| Change Type | Must Update | Must Evaluate | Verification |
|---|---|---|---|
| 新增、删除、重命名 `core` / `sdlc` skill | `module-help.csv`、baseline count、fixtures、packaging manifest | `docs/reference/skills/`、README、legacy mapping | skill/agent lint、canonical checker、tests、build、packaging check |
| 修改现有 `core` / `sdlc` skill 内容 | packaging manifest、可能的 fixture hash | public docs 是否仍描述旧行为 | scoped lint、focused tests、canonical checker |
| 新增或修改 support skill | support catalog、source README、packaging manifest | living legacy support policy | density/script tests、canonical checker |
| 新增或修改 hook | hook manifest、runner、README、IDE fragments、runtime docs | blocking/warning 语义是否变化 | hook tests、canonical checker、packaging check |
| 修改 governance map | governance docs、checker tests、packaging manifest | 是否改变 D1/D2 决策记录要求 | warn + strict checker |
| current docs-only 变更 | docs index 或 cross-link | release docs 是否受影响 | `git diff --check`、packaging check |
| historical record | 默认不改旧事实 | 是否需要 dated current-status note | 人工 decision record |

## Hook and Skill Model（Hook 与 Skill 模型）

`canonical-source-change-check` hook 只负责发现 `assets/source/speclite/` 变更并发出 warning。它不应直接替维护者决定哪些 docs 或 legacy 文件必须修改。

当 hook 提醒 canonical source 已变化时，维护者应使用：

- `speclite-canonical-source-governance-runner`：执行分类、影响面分析、修订和决策记录。
- `speclite-check-canonical-source-change`：执行只读确定性检查，并可用 `--mode strict` 让 `D0` finding 变成阻断项。

本地 hook 继续 `exit 0`。CI 或 release gate 可以运行 strict checker。

## Decision Records（决策记录）

当 `D1` 或 `D2` 面向被影响时，必须在治理 runner 的输出或提交说明中记录：

| Field | Meaning |
|---|---|
| `surface` | 被评估的文件或分类 |
| `decision` | `updated`、`skipped`、`historical snapshot` |
| `reason` | 为什么同步或跳过 |
| `evidence` | checker、test、diff 或文档证据 |

历史执行文件不应为了匹配当前数字而被静默重写。如果旧记录可能误导，应追加 dated note 或在当前治理文档中声明它是 snapshot。

## Verification Commands（验证命令）

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict
npm run build
npm test
npm run release:packaging-check
git diff --check
```
