# Canonical Source Governance Runner Workflow（Canonical Source 治理执行流程）

## Inputs（输入）

- 当前用户请求和 hook warning。
- `git diff --name-only`、`git diff --cached --name-only`、`git ls-files --others --exclude-standard`。
- `assets/source/speclite/canonical-governance.json`。
- `docs/reference/canonical-source-governance.md`。
- `speclite-check-canonical-source-change` 脚本输出。

## Step 1: Preflight（预检）

1. 确认当前目录是 `/Users/fancyliu/Repos/SpecLite` 或等价 SpecLite repo root。
2. 读取治理映射和治理文档。
3. 运行：

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
```

4. 记录当前 `core`、`sdlc`、`support`、`hooks` 和 `defaultInstall.total`。
5. 如果工作树已有无关脏文件，不回滚；后续只按 pathspec 处理本轮相关文件。

## Step 2: Impact Classification（影响面分类）

按以下顺序分类：

| Surface | Determinism | Question |
|---|---:|---|
| Canonical source truth | `D0` | 是否新增、删除、重命名或改变 package/root/hook/source contract？ |
| Module discovery contract | `D0` | `module.yaml`、`module-help.csv`、baseline count 是否受影响？ |
| Hook source contract | `D0` | hook manifest、runner、README、IDE fragments 是否一致？ |
| Current public docs | `D1` | 用户会不会从 docs / README 看到旧行为？ |
| Living legacy reference | `D2` | legacy 文件是否仍指导后续迁移或维护？ |
| Frozen historical record | `D2` | 是否只是历史执行快照，应保持过去事实？ |
| Release evidence | `D0` | packaged source 是否变化，需要刷新 manifest？ |

## Step 3: D0 Closure（D0 收口）

`D0` finding 不允许只用文字解释跳过。必须修复或说明为什么脚本判断不适用，并用文件证据支撑。

常见 D0 收口：

- `module-help.csv` 缺 row：新增或修正 row。
- baseline count 漂移：按实际 `core+sdlc` 修正常量和 fixtures。
- hook source 缺文件：补齐 README、manifest、runner 或 IDE fragments。
- packaging manifest 漏 canonical 文件：运行 `npm run build` 后运行 `npm run release:packaging-check`。

## Step 4: D1 / D2 Decision Record（D1 / D2 决策记录）

对每个 `D1` 或 `D2` surface 记录：

| Field | Requirement |
|---|---|
| `surface` | 文件、目录或 governance class。 |
| `decision` | `updated`、`skipped`、`historical snapshot`。 |
| `reason` | 为什么必须同步、为什么可以跳过，或为什么保留历史事实。 |
| `evidence` | diff、checker、test、docs link 或实际文件路径。 |

可使用 `templates/decision-record.md` 作为结构。若不写独立文件，最终回复或提交说明必须包含等价字段。

## Step 5: Targeted Edits（定点修订）

只修改影响面矩阵要求的文件：

- 新 support skill：更新 support catalog、source README、living legacy support policy、packaging manifest。
- 新 hook：更新 hook docs、runtime layout、hook tests、packaging manifest。
- 新 core/sdlc skill：更新 `module-help.csv`、public skill catalog、fixtures、packaging manifest。
- governance map 修改：更新 governance doc、checker tests、packaging manifest。

不得因为 broad grep 命中历史快照就重写旧 `PLAN.md` 或 handoff 结果。

## Step 6: Verification（验证）

按风险从小到大执行：

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict
python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/support-skills/speclite-canonical-source-governance-runner
npm test -- test/canonical-source-change-check-script.test.ts test/canonical-source-change-check-hook.test.ts
npm run build
npm test
npm run release:packaging-check
git diff --check
```

## Stop Conditions（停止条件）

- `D0` strict checker 仍有 error：不得宣称完成。
- `D1` / `D2` 没有决策记录：不得宣称治理闭环完成。
- packaging manifest 与 canonical source 不一致：不得宣称 release-ready。
- 出现无关脏文件：不要回滚，报告其存在并只收口本轮 pathspec。
