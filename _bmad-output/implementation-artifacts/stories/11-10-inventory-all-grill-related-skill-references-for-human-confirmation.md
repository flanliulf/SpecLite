# Story 11.10: Inventory All Grill-Related Skill References For Human Confirmation（盘点全部 Grill 相关 Skill 引用供人工确认）

Status: in-progress

## Story（故事）

作为 SpecLite canonical source 维护者，  
我希望获得所有 grill-related Skill 定义及引用的完整、逐条、可定位清单，  
以便在额外治理或语义调整前先确认真实关系和影响范围。

## Acceptance Criteria（验收标准）

1. 扫描 `assets/source/speclite/` 全部 packages 与关联 ZH/EN definitions、steps、references、templates/assets、scripts/hooks、metadata/help/registry/contracts、active docs，不限目录名含 `grill`。
2. Case-insensitive 词集至少含 `grill`、`grilling`、`ir-grill`、`grill-consistency`、`implementation-readiness-grill` 及扫描发现的所有 variants/IDs/paths。
3. 每一 match 记录 owner package、file、line、language、reference type、literal、target Skill/workflow/path、active/compatibility/legacy/fixture classification、11.8 impact 与 keep/fix/confirm recommendation。
4. Reference types 至少区分 identity/frontmatter、trigger/description、caller→callee、prerequisite、output directory、report filename、help/discovery、rename mapping、prose/example、legacy/regression evidence。
5. 关系摘要区分 grill Skills、callers、artifact consumers、historical/compat/test expressions，并记录 SDLC stage 与 artifact root。
6. ZH 与 EN 分条记录并做 parity；不得压缩为不可定位的合并项。
7. 以 Story 11.8 完成后的 current state 为 baseline；old IDs / `ir-grill/` compatibility 单列；本 inventory 不是 11.8 completion gate。
8. 最终结果写入本 Story implementation artifact 的独立 `Grill Reference Inventory（Grill 引用清单）` 章节，并在 Epic runner handoff 提供可点击 path。
9. 记录 reproducible command、scope、Git commit/tree identity、exclusions/reasons、raw matches、deduplicated entries 与 classification counts。
10. 每个 machine match 必须 1:1 对应 report entry；遗漏/未分类即失败；100% reconciliation 不表示所有 references 应删除或已获批。
11. 除本 Story artifact、runner records 与必要 tracker 外，被盘点 canonical definitions 全程 read-only；进一步修改等待用户确认与新 change authorization。
12. 最终先展示摘要、高风险、歧义，再明确请求人工确认；“已列出”不等于批准。
13. Active exact old ID/path 单列为 Story 11.8 regression；其他 semantic/parity risks 是待确认治理候选；两类都不自动修改或回写 11.8。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Baseline / Read-only Kickoff（AC: 1-13）
  - [x] 核验 11.1–11.9 `done` + completion Gates，尤其锁定 11.8 new IDs/root/mapping/exact-scan identity。
  - [x] 记录 initial Git commit/tree/status 与允许写入白名单；运行 11.10 `story-kickoff`。
- [x] Task 2: 设计可复现 Broad Scanner（AC: 1-2, 9-10）
  - [x] 固定 include/exclude、case-insensitive variants、raw output 格式与 deterministic sort；禁止人工抽样替代机器全集。
- [x] Task 3: 逐 Match 分类与关系建模（AC: 3-7, 13）
  - [x] 建立 stable entry ID 与 raw-match-to-entry mapping；分别计算 ZH/EN parity、caller/callee/consumer relationships。
  - [x] 将 11.8 exact regression 与 generic governance candidates 分开。
- [x] Task 4: 写入 Inventory 与 Completeness Evidence（AC: 8-10）
  - [x] 在下方独立章节填入每条 entry、counts、commands、tree identity、exclusions 与 100% reconciliation。
- [x] Task 5: Read-only Diff Proof 与 Human Handoff（AC: 11-13）
  - [x] 对 canonical source 做 before/after tree comparison，证明零修改。
  - [x] 运行 completeness validator；展示摘要/风险/歧义并请求用户确认，不执行治理修改。
  - [x] 完成 story-completion Gate 与实际 evidence summary。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- Current canonical source 已存在 core `speclite-grill-with-docs`、`speclite-grilling`，以及旧 Implementation Readiness grill package/references；不能仅扫描 package names。
- Story 11.8 已于 2026-09-05 完成（completion gate `PASS_EQUIVALENT`）；本 inventory 于 2026-09-12 在 11.8 之后的 current tree 上执行（原"11.8 尚未实现"的 create-story 基线声明已过期）。
- 本 Story 是 read-only audit；唯一业务输出是本文件中的 inventory，外加 runner/tracker/gate records。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- Scanner 必须 deterministic、case-insensitive、binary-safe，并输出可回查 line + literal；symlink/vendor/cache/generated mirrors 的 include/exclude 必须显式说明。
- Stable entry identity 应基于 normalized source path + line + literal occurrence；去重不得合并 ZH/EN 或不同语义角色。
- 保存 raw output identity/hash，独立 validator 校验 raw match count = mapped match count 且 unmapped=0。
- 不修改 canonical definitions；任何“建议修正”只写 recommendation/classification。
- 不需要新 runtime dependency 或 web research；优先 `rg --line-number --ignore-case` 与仓库内 deterministic parser/test。
- 默认 scope：全量 include `assets/source/speclite/**` 与 active public docs；`docs/legacy/**` 若 include 则分类为 legacy，否则在 exclusions 逐项说明；tests/fixtures 是否进入 completeness denominator 必须在 kickoff 固定；installed mirrors、generated snapshots、`node_modules/` 与 caches 默认排除，除非它们是 current canonical contract 的唯一 evidence。
- Raw identity 除 HEAD commit/tree 外，还必须记录 dirty-worktree diff identity、normalized scan command（或 hash）与 raw match artifact hash，避免漏掉未提交 canonical changes。

## Previous Story Intelligence（前序 Story 情报）

- 11.8 必须先独立消除/分类两个 old IDs 与 old path；11.10 将其结果当 baseline，而非补做 11.8。
- 11.9 CR root normalization 与本 inventory 无直接写入交集；不得借 broad matches 改 CR files。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.9 `done` + completion Gates；11.8 evidence 必须包含 new IDs/root/mapping 与 bounded exact scan。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-10-inventory-all-grill-related-skill-references-for-human-confirmation-story-kickoff-gate.md`。
- 完成只依赖 broad scan 100% reconciliation、分类/关系/parity 与 human-confirmation handoff，不依赖未来治理 Story。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| `FR66a` full read-only inventory | scope + raw scan identity | `FAIL_CONTRACT` |
| match-to-entry completeness | reconciliation `unmapped=0` | `FAIL_EVIDENCE` |
| ZH/EN + relationship model | parity/relationship summaries | `FAIL_EVIDENCE` |
| 11.8 regression separation | classified exact-old subset | `FAIL_FUNCTION` |
| read-only boundary | canonical before/after tree identity | `FAIL_CONTRACT` |

## Equivalent Implementation Policy（等价实现策略）

- Scanner/deduper/report generator 可替换；不得降低 corpus coverage、line-level traceability、ZH/EN separation、100% mapping、read-only boundary、regression split 或 human-confirmation gate。

## Files To Modify（预计文件范围）

### Allowed Writes（允许写入）

- 本 Story file 的 `Grill Reference Inventory` 与 evidence sections。
- Story 11.10 flow-gate / runner records；必要的 `sprint-status.yaml` 状态更新。

### Read-only Scan Surface（只读扫描面）

- `assets/source/speclite/**`、active canonical docs、metadata/help/registry/contracts、scripts/hooks/tests 中的 grill-related references。

### Forbidden Writes（禁止写入）

- 任何被盘点的 Skill/package/document/test definition；Story 11.8 files；任何自动 rename/delete/rewrite。

## Grill Reference Inventory（Grill 引用清单）

> 2026-09-12 在 Story 11.8 完成后的 current tree（含工作树未提交改动）上执行。本清单是 read-only inventory；"已列出"不等于已批准任何修改。

### Scan Metadata（扫描元数据）

- Git identity：HEAD `3cc1ba929dbb104eba5d2fccce02b1a0ca94b0b7`；tree `7d854dd4b0c42af33e2949b8f77f7a8a8337d24d`；工作树 dirty files：canonical 面 21（均为非 Epic 11 的 skill-creator / skill-lint / grill / domain-modeling 改动，与 kickoff gate 记录一致）+ 本 Story 允许写入的 3 个 `_bmad-output` 文件；`git diff -- assets docs src test README.md | sha256` = `52fc033cb55391f5fa1b3855d031ae7b1e2f79d2d139318247c7abbdaa497f97`（前 16 位与 kickoff gate 记录的 `52fc033cb55391f5` 一致）。
- Scan command（`scan.sh`，sha256 `97bec87bac699128…`）：
  ```bash
  rg --line-number --ignore-case --no-heading --color never --sort path \
    --glob '!node_modules/**' --glob '!dist/**' --glob '!.git/**' \
    'grill' \
    assets/source/speclite docs src test README.md
  ```
  单一 token `grill`（case-insensitive）覆盖 AC2 全部 variants（`grilling`、`ir-grill`、`grill-consistency`、`implementation-readiness-grill`、`grill-with-docs` 均含该子串）。
- Scope（completeness denominator）：`assets/source/speclite/**`（含 `docs/legacy/**`）、`docs/**`、`src/**`、`test/**`（含 fixtures）、`README.md`。
- Exclusions（逐项理由）：`_bmad-output/**`（workflow / planning artifacts，非 canonical 定义；预扫描约 425 行）；`release/packaging-manifest.json`（由 assets 生成的 hash 清单，28 行命中均为 package 路径镜像）；`dist/**`（构建产物）；`node_modules/**`；installed mirrors `.claude/skills`、`.agents/skills`、`_speclite/`、`.specskills/`（安装投影 / 本地分析目录，非 canonical source）；`.git/**`；二进制（`rg` 默认跳过；scope 内实际被跳过的仅 gitignored `.DS_Store`）；hidden 路径（`test/fixtures/**/input/.gitkeep` 与 fixture 内 `.claude/` 共 22 个 tracked 文件，`rg` 默认跳过；`--hidden --no-ignore` 复扫 0 命中，不影响 269 计数）。
- Raw match artifact：`raw.txt` 269 行，sha256 `571645e6898745064d8d7fdd0e1241f82b90c91e7e700b30c00168aa0bc35c74`。Machine match 定义 = `rg` 输出的一行（path:line）；同一行多个 literal 在条目 Literal 列全部列出。
- Counts：raw 269 / entries 269 / unmapped 0（validator：`len(entries)==len(raw)` 且 ID 与 raw 行号 1:1）。
  - Classification：`fixture` 152、`active` 102、`legacy` 9、`compatibility` 6
  - Reference type：`legacy/regression-evidence` 164、`prose/example` 59、`output-directory` 9、`help/discovery` 9、`report-filename` 9、`identity/frontmatter` 6、`caller→callee` 2、`trigger/description` 4、`canonical-contract` 3、`workflow-prerequisite` 2、`rename-mapping` 2
  - Language：`shared` 162、`ZH` 87、`EN` 20
  - Owner：`fresh-install fixture` 109、`speclite-implementation-readiness-grill-consistency-reviewer` 56、`tests` 26、`Story 11.8 fixture` 17、`public docs` 11、`speclite-implementation-readiness-check` 10、`canonical legacy docs` 9、`speclite-grill-with-docs` 7、`speclite-grilling` 7、`canonical source README` 6、`sdlc module metadata/help` 5、`runtime src` 3、`core module help` 2、`repo README` 1
  - 11.8 impact：`none` 246、`11.8 evidence (test)` 8、`11.8 legacy-doc (excluded by 11.8 scan)` 5、`11.8 evidence (fixture)` 4、`11.8 read-only legacy discovery clause` 3、`11.8 read-only legacy discovery clause (11.8 ledger: legacy-documentation)` 2、`11.8 compatibility mapping` 1
  - Recommendation：`keep` 251、`keep (legacy docs; 11.8 excluded)` 9、`keep (compatibility)` 5、`confirm (commit worktree fix)` 2、`confirm` 2
- 扫描发现的 grill-related Skill ID / 词形（AC2 补全）：`speclite-grilling`、`speclite-grill-with-docs`、`speclite-implementation-readiness-grill-consistency-reviewer`（active）；`speclite-ir-grill-consistency-reviewer`（old ID，仅 mapping / legacy / fixture）；path 形态 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency[/…]`（canonical）、`{planning_artifacts}/ir-grill/`、`_speclite-output/planning-artifacts/ir-grill/`、`_speclite-output/2-planning-artifacts/ir-grill`（legacy）、`.specskills/docs/analysis/…-grill-consistency-reviewer/`（分析记录）；命令形态 `/speclite-grilling`（工作树）与 `/grilling`（HEAD）；artifactType `ir-grill-records`；菜单码 `GR` / `GWD` / `IRG`。

### Inventory Entries（清单条目）

ID = `G` + raw 行号；File:line 可直接回查。Lang 按文件：`.en.md`=EN，其余 `.md`=ZH，json/ts/yaml/csv=shared。

| ID | File:line | Lang | Owner | Type | Literal(s) | Target | Class | 11.8 | Rec | Note |
|---|---|---|---|---|---|---|---|---|---|---|
| G001 | `assets/source/speclite/README.en.md:81` | EN | canonical source README | prose/example | `grill` | — | active | none | keep |  |
| G002 | `assets/source/speclite/README.en.md:141` | EN | canonical source README | prose/example | `grill` | — | active | none | keep |  |
| G003 | `assets/source/speclite/README.en.md:143` | EN | canonical source README | output-directory | `grill`, `speclite-implementation-readiness-grill-consistency-reviewer`, `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G004 | `assets/source/speclite/README.md:101` | ZH | canonical source README | prose/example | `grill` | — | active | none | keep |  |
| G005 | `assets/source/speclite/README.md:163` | ZH | canonical source README | prose/example | `grill` | — | active | none | keep |  |
| G006 | `assets/source/speclite/README.md:165` | ZH | canonical source README | output-directory | `grill`, `speclite-implementation-readiness-grill-consistency-reviewer`, `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G007 | `assets/source/speclite/core-skills/module-help.csv:16` | shared | core module help | help/discovery | `Grill`, `grill`, `Grilling`, `speclite-grilling` | speclite-grilling | active | none | keep |  |
| G008 | `assets/source/speclite/core-skills/module-help.csv:18` | shared | core module help | help/discovery | `Grill`, `speclite-grill-with-docs` | speclite-grill-with-docs | active | none | keep |  |
| G009 | `assets/source/speclite/core-skills/speclite-grill-with-docs/CHANGELOG.md:3` | ZH | speclite-grill-with-docs | prose/example | `speclite-grill-with-docs` | speclite-grill-with-docs | active | none | keep | 变更记录 |
| G010 | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.en.md:2` | EN | speclite-grill-with-docs | identity/frontmatter | `speclite-grill-with-docs` | speclite-grill-with-docs | active | none | keep | dirty-worktree（未提交改动） |
| G011 | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.en.md:11` | EN | speclite-grill-with-docs | caller→callee | `/speclite-grilling` | speclite-grilling | active | none | confirm (commit worktree fix) | dirty-worktree（未提交改动）；HEAD 版本为 ˋ/grillingˋ / ˋ/domain-modelingˋ（非 canonical ID），工作树已改为 ˋ/speclite-grillingˋ / ˋ/speclite-domain-modelingˋ |
| G012 | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.en.md:14` | EN | speclite-grill-with-docs | prose/example | `assets/source/speclite/core-skills/speclite-grill-with-docs/` | speclite-grill-with-docs | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径）；dirty-worktree（未提交改动） |
| G013 | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.md:2` | ZH | speclite-grill-with-docs | identity/frontmatter | `speclite-grill-with-docs` | speclite-grill-with-docs | active | none | keep | dirty-worktree（未提交改动） |
| G014 | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.md:11` | ZH | speclite-grill-with-docs | caller→callee | `/speclite-grilling` | speclite-grilling | active | none | confirm (commit worktree fix) | dirty-worktree（未提交改动）；HEAD 版本为 ˋ/grillingˋ / ˋ/domain-modelingˋ（非 canonical ID），工作树已改为 ˋ/speclite-grillingˋ / ˋ/speclite-domain-modelingˋ |
| G015 | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.md:14` | ZH | speclite-grill-with-docs | prose/example | `assets/source/speclite/core-skills/speclite-grill-with-docs/` | speclite-grill-with-docs | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径）；dirty-worktree（未提交改动） |
| G016 | `assets/source/speclite/core-skills/speclite-grilling/CHANGELOG.md:3` | ZH | speclite-grilling | prose/example | `speclite-grilling` | speclite-grilling | active | none | keep | 变更记录 |
| G017 | `assets/source/speclite/core-skills/speclite-grilling/SKILL.en.md:2` | EN | speclite-grilling | identity/frontmatter | `speclite-grilling` | speclite-grilling | active | none | keep |  |
| G018 | `assets/source/speclite/core-skills/speclite-grilling/SKILL.en.md:3` | EN | speclite-grilling | trigger/description | `grill`, `Grill` | — | active | none | keep |  |
| G019 | `assets/source/speclite/core-skills/speclite-grilling/SKILL.en.md:20` | EN | speclite-grilling | prose/example | `assets/source/speclite/core-skills/speclite-grilling/` | speclite-grilling | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径） |
| G020 | `assets/source/speclite/core-skills/speclite-grilling/SKILL.md:2` | ZH | speclite-grilling | identity/frontmatter | `speclite-grilling` | speclite-grilling | active | none | keep | dirty-worktree（未提交改动） |
| G021 | `assets/source/speclite/core-skills/speclite-grilling/SKILL.md:3` | ZH | speclite-grilling | trigger/description | `grill`, `Grill` | — | active | none | keep | dirty-worktree（未提交改动） |
| G022 | `assets/source/speclite/core-skills/speclite-grilling/SKILL.md:20` | ZH | speclite-grilling | prose/example | `assets/source/speclite/core-skills/speclite-grilling/` | speclite-grilling | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径）；dirty-worktree（未提交改动） |
| G023 | `assets/source/speclite/docs/legacy/BMAD_SPECLITE_SKILL_MAPPING.md:74` | ZH | canonical legacy docs | legacy/regression-evidence | `grill`, `sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer` | speclite-ir-grill-consistency-reviewer | legacy | 11.8 legacy-doc (excluded by 11.8 scan) | keep (legacy docs; 11.8 excluded) |  |
| G024 | `assets/source/speclite/docs/legacy/CANONICAL_SKILL_ITERATION_CONTEXT.md:11` | ZH | canonical legacy docs | legacy/regression-evidence | `grill`, `speclite-ir-grill-consistency-reviewer` | speclite-ir-grill-consistency-reviewer | legacy | 11.8 legacy-doc (excluded by 11.8 scan) | keep (legacy docs; 11.8 excluded) |  |
| G025 | `assets/source/speclite/docs/legacy/CANONICAL_SKILL_ITERATION_CONTEXT.md:85` | ZH | canonical legacy docs | legacy/regression-evidence | `grill`, `Grill` | — | legacy | none | keep (legacy docs; 11.8 excluded) |  |
| G026 | `assets/source/speclite/docs/legacy/HANDOFF.md:29` | ZH | canonical legacy docs | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/`, `grill` | speclite-ir-grill-consistency-reviewer | legacy | 11.8 legacy-doc (excluded by 11.8 scan) | keep (legacy docs; 11.8 excluded) |  |
| G027 | `assets/source/speclite/docs/legacy/HANDOFF.md:48` | ZH | canonical legacy docs | legacy/regression-evidence | `grill` | — | legacy | none | keep (legacy docs; 11.8 excluded) |  |
| G028 | `assets/source/speclite/docs/legacy/HANDOFF.md:77` | ZH | canonical legacy docs | legacy/regression-evidence | `Grill` | — | legacy | none | keep (legacy docs; 11.8 excluded) |  |
| G029 | `assets/source/speclite/docs/legacy/HANDOFF.md:79` | ZH | canonical legacy docs | legacy/regression-evidence | `speclite-ir-grill-consistency-reviewer/` | speclite-ir-grill-consistency-reviewer | legacy | 11.8 legacy-doc (excluded by 11.8 scan) | keep (legacy docs; 11.8 excluded) |  |
| G030 | `assets/source/speclite/docs/legacy/HANDOFF.md:114` | ZH | canonical legacy docs | legacy/regression-evidence | `grill` | — | legacy | none | keep (legacy docs; 11.8 excluded) |  |
| G031 | `assets/source/speclite/docs/legacy/HANDOFF.md:117` | ZH | canonical legacy docs | legacy/regression-evidence | `{project-root}/_speclite-output/planning-artifacts/ir-grill/` | {planning_artifacts}/ir-grill/ (legacy path) | legacy | 11.8 legacy-doc (excluded by 11.8 scan) | keep (legacy docs; 11.8 excluded) |  |
| G032 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/SKILL.en.md:18` | EN | speclite-implementation-readiness-check | report-filename | `{planning_artifacts}/ir-grill/`, `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | compatibility | 11.8 read-only legacy discovery clause (11.8 ledger: legacy-documentation) | keep (compatibility) | 同一行同时含新 output 路径与 legacy ˋir-grill/ˋ 只读发现条款 |
| G033 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/SKILL.md:19` | ZH | speclite-implementation-readiness-check | report-filename | `{planning_artifacts}/ir-grill/`, `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | compatibility | 11.8 read-only legacy discovery clause (11.8 ledger: legacy-documentation) | keep (compatibility) | 同一行同时含新 output 路径与 legacy ˋir-grill/ˋ 只读发现条款 |
| G034 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-01-document-discovery.md:2` | ZH | speclite-implementation-readiness-check | report-filename | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{{date}}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G035 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-01-document-discovery.md:7` | ZH | speclite-implementation-readiness-check | legacy/regression-evidence | `{planning_artifacts}/ir-grill/` | {planning_artifacts}/ir-grill/ (legacy path) | compatibility | 11.8 read-only legacy discovery clause | keep (compatibility) |  |
| G036 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-02-prd-analysis.md:2` | ZH | speclite-implementation-readiness-check | report-filename | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{{date}}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G037 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-03-epic-coverage-validation.md:2` | ZH | speclite-implementation-readiness-check | report-filename | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{{date}}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G038 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-04-ux-alignment.md:2` | ZH | speclite-implementation-readiness-check | report-filename | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{{date}}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G039 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-05-epic-quality-review.md:2` | ZH | speclite-implementation-readiness-check | report-filename | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{{date}}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G040 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-06-final-assessment.md:2` | ZH | speclite-implementation-readiness-check | report-filename | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{{date}}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G041 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/workflow-details.md:67` | ZH | speclite-implementation-readiness-check | output-directory | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G042 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md:3` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | 变更记录 |
| G043 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md:11` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill-with-docs` | — | active | none | keep | 变更记录 |
| G044 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md:12` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep | 变更记录 |
| G045 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md:19` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep | 变更记录 |
| G046 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md:20` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill-with-docs` | — | active | none | keep | 变更记录 |
| G047 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:2` | EN | speclite-implementation-readiness-grill-consistency-reviewer | identity/frontmatter | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G048 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:3` | EN | speclite-implementation-readiness-grill-consistency-reviewer | trigger/description | `grill` | — | active | none | keep |  |
| G049 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:12` | EN | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill-with-docs` | — | active | none | keep | 内建协议来源说明（历史上源自 grill-with-docs 方法，非调用） |
| G050 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:17` | EN | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G051 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:18` | EN | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G052 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:31` | EN | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G053 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:34` | EN | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G054 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:37` | EN | speclite-implementation-readiness-grill-consistency-reviewer | workflow-prerequisite | `grill` | — | active | none | keep | companion skill 提及 |
| G055 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:38` | EN | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径） |
| G056 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.en.md:41` | EN | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径） |
| G057 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:2` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | identity/frontmatter | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G058 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:3` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | trigger/description | `grill` | — | active | none | keep |  |
| G059 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:12` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill`, `grill-with-docs` | — | active | none | keep | 内建协议来源说明（历史上源自 grill-with-docs 方法，非调用） |
| G060 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:17` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `Grill` | — | active | none | keep |  |
| G061 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:18` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G062 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:23` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G063 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:31` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G064 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:34` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G065 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:37` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | workflow-prerequisite | `grill` | — | active | none | keep | companion skill 提及 |
| G066 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:38` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径） |
| G067 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md:41` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径） |
| G068 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md:5` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G069 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md:8` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G070 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md:16` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G071 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md:19` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G072 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md:20` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill-with-docs` | — | active | none | keep | 内建协议来源说明（历史上源自 grill-with-docs 方法，非调用） |
| G073 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md:22` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G074 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md:70` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `Grill` | — | active | none | keep |  |
| G075 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md:16` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | output-directory | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G076 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md:29` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | legacy/regression-evidence | `{planning_artifacts}/ir-grill/` | {planning_artifacts}/ir-grill/ (legacy path) | compatibility | 11.8 read-only legacy discovery clause | keep (compatibility) |  |
| G077 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md:38` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `Grill` | — | active | none | keep |  |
| G078 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md:77` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `Grill` | — | active | none | keep |  |
| G079 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md:153` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径） |
| G080 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/review-dimensions.md:43` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G081 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md:7` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G082 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md:8` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G083 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md:9` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G084 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md:37` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G085 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md:58` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G086 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:5` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G087 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:22` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `Grill-with-docs` | — | active | none | keep | 内建协议来源说明（历史上源自 grill-with-docs 方法，非调用） |
| G088 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:24` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill-with-docs` | — | active | none | keep | 内建协议来源说明（历史上源自 grill-with-docs 方法，非调用） |
| G089 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:28` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G090 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:34` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G091 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:66` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | output-directory | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G092 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:75` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | legacy/regression-evidence | `{planning_artifacts}/ir-grill/` | {planning_artifacts}/ir-grill/ (legacy path) | compatibility | 11.8 read-only legacy discovery clause | keep (compatibility) |  |
| G093 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:81` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | output-directory | `.specskills/docs/analysis/speclite-implementation-readiness-grill-consistency-reviewer/` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | analysis 记录路径 |
| G094 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:92` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `Grill` | — | active | none | keep |  |
| G095 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:97` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `Grill` | — | active | none | keep |  |
| G096 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:141` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `grill` | — | active | none | keep |  |
| G097 | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:184` | ZH | speclite-implementation-readiness-grill-consistency-reviewer | prose/example | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | 生成署名 / 同步提示（含自身 ID 或路径） |
| G098 | `assets/source/speclite/sdlc-skills/module-help.csv:34` | shared | sdlc module metadata/help | help/discovery | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G099 | `assets/source/speclite/sdlc-skills/module-help.csv:35` | shared | sdlc module metadata/help | help/discovery | `Grill`, `grill`, `speclite-implementation-readiness-grill-consistency-reviewer`, `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | outputs 列 ˋir grill recordsˋ → 派生 artifactType ˋir-grill-recordsˋ |
| G100 | `assets/source/speclite/sdlc-skills/module.yaml:83` | shared | sdlc module metadata/help | output-directory | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G101 | `assets/source/speclite/sdlc-skills/module.yaml:107` | shared | sdlc module metadata/help | rename-mapping | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G102 | `assets/source/speclite/sdlc-skills/module.yaml:108` | shared | sdlc module metadata/help | rename-mapping | `speclite-ir-grill-consistency-reviewer` | speclite-ir-grill-consistency-reviewer | compatibility | 11.8 compatibility mapping | keep |  |
| G103 | `docs/explanation/speclite-workflows.md:61` | ZH | public docs | prose/example | `grill` | — | active | none | keep |  |
| G104 | `docs/explanation/speclite-workflows.md:65` | ZH | public docs | prose/example | `grill` | — | active | none | keep |  |
| G105 | `docs/explanation/speclite-workflows.md:95` | ZH | public docs | prose/example | `grill`, `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G106 | `docs/reference/canonical-source-layout.md:85` | ZH | public docs | help/discovery | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G107 | `docs/reference/glossary/epic-11-phase-aligned-workflow-artifact-governance.md:129` | ZH | public docs | help/discovery | `Grill` | — | active | none | keep | 术语表定义 |
| G108 | `docs/reference/glossary/epic-11-phase-aligned-workflow-artifact-governance.md:152` | ZH | public docs | help/discovery | `grill`, `Grill`, `grill-related` | — | active | none | keep | 术语表定义 |
| G109 | `docs/reference/skills/sdlc-workflows.md:70` | ZH | public docs | help/discovery | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G110 | `docs/reference/skills/sdlc-workflows.md:71` | ZH | public docs | help/discovery | `grill`, `speclite-implementation-readiness-grill-consistency-reviewer`, `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G111 | `docs/reference/workflow-artifact-layout.md:89` | ZH | public docs | output-directory | `grill-consistency/` | — | active | none | keep |  |
| G112 | `docs/reference/workflow-artifact-layout.md:169` | ZH | public docs | report-filename | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | active | none | keep |  |
| G113 | `docs/reference/workflow-artifact-layout.md:170` | ZH | public docs | output-directory | `ir-grill/`, `speclite-implementation-readiness-grill-consistency-reviewer`, `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep |  |
| G114 | `src/validation/rules/manifest-schema.ts:102` | shared | runtime src | canonical-contract | `assets/source/speclite/core-skills/speclite-grill-with-docs` | speclite-grill-with-docs | active | none | keep | canonical package root 列表 |
| G115 | `src/validation/rules/manifest-schema.ts:103` | shared | runtime src | canonical-contract | `assets/source/speclite/core-skills/speclite-grilling` | speclite-grilling | active | none | keep | canonical package root 列表 |
| G116 | `src/validation/rules/manifest-schema.ts:137` | shared | runtime src | canonical-contract | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | active | none | keep | canonical package root 列表 |
| G117 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3386` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grill-with-docs/CHANGELOG.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G118 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3392` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grill-with-docs/CHANGELOG.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G119 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3396` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G120 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3402` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G121 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3406` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grilling/CHANGELOG.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G122 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3412` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grilling/CHANGELOG.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G123 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3416` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G124 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3422` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G125 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3596` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G126 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3602` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G127 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3606` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G128 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3612` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G129 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3616` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G130 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3622` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G131 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3626` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/review-dimensions.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G132 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3632` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/review-dimensions.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G133 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3636` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G134 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3642` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G135 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3646` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G136 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3652` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G137 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3656` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G138 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:3662` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G139 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8576` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grill-with-docs/CHANGELOG.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G140 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8582` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grill-with-docs/CHANGELOG.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G141 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8586` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G142 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8592` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G143 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8596` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grilling/CHANGELOG.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G144 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8602` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grilling/CHANGELOG.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G145 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8606` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G146 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8612` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G147 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8786` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G148 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8792` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G149 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8796` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G150 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8802` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G151 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8806` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G152 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8812` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G153 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8816` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/review-dimensions.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G154 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8822` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/review-dimensions.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G155 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8826` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G156 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8832` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G157 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8836` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G158 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8842` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G159 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8846` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G160 | `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:8852` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G161 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:216` | shared | fresh-install fixture | legacy/regression-evidence | `Grill` | — | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G162 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:217` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G163 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:218` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G164 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:678` | shared | fresh-install fixture | legacy/regression-evidence | `Grill` | — | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G165 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:679` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-grill-with-docs` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G166 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:680` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G167 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:689` | shared | fresh-install fixture | legacy/regression-evidence | `Grilling` | — | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G168 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:690` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-grilling` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G169 | `test/fixtures/fresh-install-empty-project/expected/installed-state/help-index-full.json:691` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G170 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:512` | shared | fresh-install fixture | legacy/regression-evidence | `_speclite-output/3-solutioning-artifacts/implementation-readiness-report/grill-consistency` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G171 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:525` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G172 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:529` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G173 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:530` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G174 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:535` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G175 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:536` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G176 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:541` | shared | fresh-install fixture | legacy/regression-evidence | `ir-grill-records` | artifactType `ir-grill-records` | fixture | none | confirm | 安装投影快照（由 canonical 派生）；artifactType 名含旧 ˋir-grillˋ 词形（非路径形态，非 11.8 token） |
| G177 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:542` | shared | fresh-install fixture | legacy/regression-evidence | `_speclite-output/3-solutioning-artifacts/implementation-readiness-report/grill-consistency` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G178 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1407` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-grill-with-docs` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G179 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1411` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grill-with-docs` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G180 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1412` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G181 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1417` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grill-with-docs` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G182 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1418` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G183 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1428` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-grilling` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G184 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1432` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grilling` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G185 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1433` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G186 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1438` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grilling` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G187 | `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json:1439` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G188 | `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json:566` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-grill-with-docs` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G189 | `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json:568` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grill-with-docs` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G190 | `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json:580` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-grilling` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G191 | `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json:582` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grilling` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G192 | `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json:639` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G193 | `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json:641` | shared | fresh-install fixture | legacy/regression-evidence | `speclite-ir-grill-consistency-reviewer` | speclite-ir-grill-consistency-reviewer | fixture | 11.8 evidence (fixture) | keep | 安装投影快照（由 canonical 派生） |
| G194 | `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json:644` | shared | fresh-install fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G195 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:440` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grill-with-docs/` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G196 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:441` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grill-with-docs/CHANGELOG.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G197 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:442` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G198 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:443` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grilling/` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G199 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:444` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grilling/CHANGELOG.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G200 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:445` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G201 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:469` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G202 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:470` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G203 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:471` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G204 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:472` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G205 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:473` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G206 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:474` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G207 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:475` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/review-dimensions.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G208 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:476` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G209 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:477` | shared | fresh-install fixture | legacy/regression-evidence | `.agents/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G210 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1146` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grill-with-docs/` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G211 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1147` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grill-with-docs/CHANGELOG.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G212 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1148` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grill-with-docs/SKILL.md` | speclite-grill-with-docs | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G213 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1149` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grilling/` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G214 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1150` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grilling/CHANGELOG.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G215 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1151` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-grilling/SKILL.md` | speclite-grilling | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G216 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1175` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G217 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1176` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/CHANGELOG.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G218 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1177` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/SKILL.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G219 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1178` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G220 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1179` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/prompt-library.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G221 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1180` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G222 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1181` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/review-dimensions.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G223 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1182` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/testing-scenarios.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G224 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1183` | shared | fresh-install fixture | legacy/regression-evidence | `.claude/skills/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G225 | `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:1428` | shared | fresh-install fixture | legacy/regression-evidence | `_speclite-output/3-solutioning-artifacts/implementation-readiness-report/grill-consistency/` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | 安装投影快照（由 canonical 派生） |
| G226 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:5` | shared | Story 11.8 fixture | legacy/regression-evidence | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G227 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:22` | shared | Story 11.8 fixture | legacy/regression-evidence | `grill-consistency-reviewer`, `old-id-grill` | — | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G228 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:23` | shared | Story 11.8 fixture | legacy/regression-evidence | `/ir-grill` | {planning_artifacts}/ir-grill/ (legacy path) | fixture | 11.8 evidence (fixture) | keep | Story 11.8 bounded-surface ledger |
| G229 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:24` | shared | Story 11.8 fixture | legacy/regression-evidence | `grill/` | — | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G230 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:25` | shared | Story 11.8 fixture | legacy/regression-evidence | `/ir-grill` | {planning_artifacts}/ir-grill/ (legacy path) | fixture | 11.8 evidence (fixture) | keep | Story 11.8 bounded-surface ledger |
| G231 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:26` | shared | Story 11.8 fixture | legacy/regression-evidence | `/ir-grill` | {planning_artifacts}/ir-grill/ (legacy path) | fixture | 11.8 evidence (fixture) | keep | Story 11.8 bounded-surface ledger |
| G232 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:28` | shared | Story 11.8 fixture | legacy/regression-evidence | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G233 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:39` | shared | Story 11.8 fixture | legacy/regression-evidence | `old-id-grill` | — | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G234 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:87` | shared | Story 11.8 fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G235 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:94` | shared | Story 11.8 fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G236 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:101` | shared | Story 11.8 fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G237 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:108` | shared | Story 11.8 fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G238 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:123` | shared | Story 11.8 fixture | legacy/regression-evidence | `old-id-grill` | — | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G239 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:137` | shared | Story 11.8 fixture | legacy/regression-evidence | `old-id-grill` | — | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G240 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:179` | shared | Story 11.8 fixture | legacy/regression-evidence | `old-id-grill` | — | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G241 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:186` | shared | Story 11.8 fixture | legacy/regression-evidence | `old-id-grill` | — | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G242 | `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:202` | shared | Story 11.8 fixture | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | Story 11.8 bounded-surface ledger |
| G243 | `test/implementation-readiness-rename-routing.test.ts:14` | shared | tests | legacy/regression-evidence | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | 回归测试断言 |
| G244 | `test/implementation-readiness-rename-routing.test.ts:21` | shared | tests | legacy/regression-evidence | `speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 回归测试断言 |
| G245 | `test/implementation-readiness-rename-routing.test.ts:22` | shared | tests | legacy/regression-evidence | `speclite-ir-grill-consistency-reviewer` | speclite-ir-grill-consistency-reviewer | fixture | 11.8 evidence (test) | keep | 回归测试断言 |
| G246 | `test/implementation-readiness-rename-routing.test.ts:40` | shared | tests | legacy/regression-evidence | `grill-consistency-reviewer`, `old-id-grill` | — | fixture | none | keep | 回归测试断言 |
| G247 | `test/implementation-readiness-rename-routing.test.ts:41` | shared | tests | legacy/regression-evidence | `/ir-grill` | {planning_artifacts}/ir-grill/ (legacy path) | fixture | 11.8 evidence (test) | keep | 回归测试断言 |
| G248 | `test/implementation-readiness-rename-routing.test.ts:42` | shared | tests | legacy/regression-evidence | `grill/` | — | fixture | none | keep | 回归测试断言 |
| G249 | `test/implementation-readiness-rename-routing.test.ts:43` | shared | tests | legacy/regression-evidence | `/ir-grill` | {planning_artifacts}/ir-grill/ (legacy path) | fixture | 11.8 evidence (test) | keep | 回归测试断言 |
| G250 | `test/implementation-readiness-rename-routing.test.ts:44` | shared | tests | legacy/regression-evidence | `/ir-grill` | {planning_artifacts}/ir-grill/ (legacy path) | fixture | 11.8 evidence (test) | keep | 回归测试断言 |
| G251 | `test/implementation-readiness-rename-routing.test.ts:117` | shared | tests | legacy/regression-evidence | `grill` | — | fixture | none | keep | 回归测试断言 |
| G252 | `test/implementation-readiness-rename-routing.test.ts:147` | shared | tests | legacy/regression-evidence | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | 回归测试断言 |
| G253 | `test/implementation-readiness-rename-routing.test.ts:150` | shared | tests | legacy/regression-evidence | `.specskills/output/speclite-implementation-readiness-grill-consistency-reviewer/` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 回归测试断言 |
| G254 | `test/implementation-readiness-rename-routing.test.ts:151` | shared | tests | legacy/regression-evidence | `_speclite-output/3-solutioning-artifacts/implementation-readiness-report/grill-consistency/` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | 回归测试断言 |
| G255 | `test/implementation-readiness-rename-routing.test.ts:154` | shared | tests | legacy/regression-evidence | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | 回归测试断言 |
| G256 | `test/implementation-readiness-rename-routing.test.ts:157` | shared | tests | legacy/regression-evidence | `speclite-implementation-readiness-grill-consistency-reviewer`, `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 回归测试断言 |
| G257 | `test/implementation-readiness-rename-routing.test.ts:162` | shared | tests | legacy/regression-evidence | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | {solutioning_artifacts}/implementation-readiness-report/grill-consistency | fixture | none | keep | 回归测试断言 |
| G258 | `test/implementation-readiness-rename-routing.test.ts:275` | shared | tests | legacy/regression-evidence | `{planning_artifacts}/ir-grill/` | {planning_artifacts}/ir-grill/ (legacy path) | fixture | 11.8 evidence (test) | keep | 回归测试断言 |
| G259 | `test/source-and-modules.test.ts:316` | shared | tests | legacy/regression-evidence | `speclite-grill-with-docs` | speclite-grill-with-docs | fixture | none | keep | 回归测试断言 |
| G260 | `test/source-and-modules.test.ts:317` | shared | tests | legacy/regression-evidence | `speclite-grilling` | speclite-grilling | fixture | none | keep | 回归测试断言 |
| G261 | `test/update-planning.test.ts:440` | shared | tests | legacy/regression-evidence | `speclite-implementation-readiness-grill-consistency-reviewer`, `speclite-ir-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | 11.8 evidence (test) | keep | 回归测试断言 |
| G262 | `test/update-planning.test.ts:651` | shared | tests | legacy/regression-evidence | `_speclite-output/2-planning-artifacts/ir-grill` | {planning_artifacts}/ir-grill/ (legacy path) | fixture | 11.8 evidence (test) | keep | 回归测试断言 |
| G263 | `test/update-planning.test.ts:672` | shared | tests | legacy/regression-evidence | `speclite-ir-grill-consistency-reviewer` | speclite-ir-grill-consistency-reviewer | fixture | 11.8 evidence (test) | keep | 回归测试断言 |
| G264 | `test/ux-artifact-routing.test.ts:1011` | shared | tests | legacy/regression-evidence | `3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 回归测试断言 |
| G265 | `test/ux-artifact-routing.test.ts:1027` | shared | tests | legacy/regression-evidence | `3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 回归测试断言 |
| G266 | `test/validate-command.test.ts:1652` | shared | tests | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grill-with-docs` | speclite-grill-with-docs | fixture | none | keep | 回归测试断言 |
| G267 | `test/validate-command.test.ts:1653` | shared | tests | legacy/regression-evidence | `assets/source/speclite/core-skills/speclite-grilling` | speclite-grilling | fixture | none | keep | 回归测试断言 |
| G268 | `test/validate-command.test.ts:1686` | shared | tests | legacy/regression-evidence | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer` | speclite-implementation-readiness-grill-consistency-reviewer | fixture | none | keep | 回归测试断言 |
| G269 | `README.md:222` | ZH | repo README | prose/example | `Grill` | — | active | none | confirm | roadmap 条目 |

### Relationship And Parity Summary（关系与双语一致性摘要）

**Grill Skills（自身即 grill Skill）**

| Skill | SDLC stage / menu | Artifact root | 定义证据 |
|---|---|---|---|
| `speclite-grilling` | core（anytime）/ `GR` | 无产物（交互式追问） | G007, G016, G017, G018, G019, G020, G021, G022（SKILL zh/en、CHANGELOG、core module-help） |
| `speclite-grill-with-docs` | core（anytime）/ `GWD` | ADR / glossary（由被调用 Skill 产出） | G008, G009, G010, G011, G012, G013, G014, G015 |
| `speclite-implementation-readiness-grill-consistency-reviewer` | 3-solutioning / `IRG` | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`（summary.md、goal-execute-records/round-N） | G042–G097、module.yaml G100、module-help G099 |

**Callers（调用 grill Skill）**

- `speclite-grill-with-docs` → `/speclite-grilling`（G014 ZH、G011 EN，caller→callee；同时调用非 grill 的 `/speclite-domain-modeling`）。这是 corpus 中唯一的显式 grill 调用。**HEAD 版本该行为 `/grilling` 与 `/domain-modeling`（非 canonical ID，无对应 package）；工作树未提交改动已改为 canonical ID。**
- `speclite-implementation-readiness-grill-consistency-reviewer` 与 `speclite-implementation-readiness-check`：module-help `preceded-by`（G099：IRG 前置 IR）+ reviewer SKILL:37 "可配合"（G065 ZH / G054 EN）——协作 / 前置关系，无显式 invocation。reviewer CHANGELOG:12 明确"移除对外部 grill skill 名称的显式依赖"，其 `grill-with-docs` 七处提及（G043, G046, G049, G059, G072, G087, G088；其中 G043 / G046 为 CHANGELOG 历史条目，其余 5 处为 SKILL / references 正文）均为"内建协议来源"说明，**不是**对 `speclite-grill-with-docs` 的调用。
- 无任何 Skill 调用 `speclite-grilling` 以外的 grill Skill；无 runner / orchestrator 调用 IRG。

**Artifact consumers（只读取 grill 产物 / 路径）**

- `speclite-implementation-readiness-check`：写同一 `grill-consistency/` 目录（report-filename，G032, G033, G034, G036, G037, G038, G039, G040, G041）并只读发现 legacy `{planning_artifacts}/ir-grill/`（G032 EN / G033 ZH / G035）。
- 契约 / 注册面：`module.yaml` artifact dir（G100）、`src/validation/rules/manifest-schema.ts` canonical package roots（G114, G115, G116）、`module-help.csv` output-location（G098/G099）、public docs（G103–G113）、README zh/en（G001–G006）。

**Historical / compatibility / test expressions**

- Compatibility（6）：`module.yaml:108` rename mapping（G102）；IR check 与 reviewer 的 legacy `ir-grill/` 只读发现条款（G032, G033, G035, G076, G092）——与 Story 11.8 ledger 的 `compatibility-mapping` / `legacy-documentation` 角色一致。
- Legacy（9）：`assets/source/speclite/docs/legacy/**`（G023–G031）含旧 ID 与旧 default path `_speclite-output/planning-artifacts/ir-grill/`；11.8 已排除该目录，本清单分类为 legacy。
- Fixture / regression evidence（152）：fresh-install 快照 109 行（安装投影，由 canonical 派生）、Story 11.8 bounded-surfaces ledger 17 行、测试断言 26 行。

**ZH / EN parity**

| Package | ZH 命中行 | EN 命中行 | Parity |
|---|---|---|---|
| `speclite-grilling` | 3（2, 3, 20） | 3（2, 3, 20） | 一致 |
| `speclite-grill-with-docs` | 3（2, 11, 14） | 3（2, 11, 14） | 一致 |
| `speclite-implementation-readiness-grill-consistency-reviewer` | 11（2, 3, 12, 17, 18, 23, 31, 34, 37, 38, 41） | 10（2, 3, 12, 17, 18, 31, 34, 37, 38, 41） | 数量不一致 |
| `speclite-implementation-readiness-check` | 1（19） | 1（18） | 一致 |
| `README` | 3（101, 163, 165） | 3（81, 141, 143） | 一致 |

- reviewer SKILL ZH 第 23 行（"避免无限 grill"）在 EN 第 23 行为 "does not loop forever"，语义对应但 literal 不含 grill——literal 数量 11 vs 10 的唯一差异，非语义缺失。
- 其余四对逐行对应（frontmatter name、description、调用行 / 输出路径行、生成署名行）。
- `references/*.md` 与 `CHANGELOG.md` 仅有 ZH canonical 版本（无 EN mirror），按 Skill 体系约定不要求 parity。

### High-risk / Ambiguous / Human Confirmation（高风险、歧义与人工确认）

**A. Story 11.8 contract regression（AC13 单列）**

- **0 项。** active class 中无 exact old ID（`speclite-ir-grill-consistency-reviewer`、`speclite-check-implementation-readiness`）与 old path（`/ir-grill` 四形态）命中；所有 old-token 命中均在 compatibility mapping、legacy 只读发现条款、legacy docs、fixtures / tests 中，与 11.8 ledger 分类一致。

**B. 后续治理候选（等待人工确认，本 Story 不修改）**

| # | 条目 | 问题 | 建议 |
|---|---|---|---|
| B1 | G011、G014（`speclite-grill-with-docs/SKILL{.en}.md:11`） | HEAD 提交版本调用 `/grilling` 与 `/domain-modeling`，均非 canonical Skill ID（无对应 package）；工作树中已有未提交修正为 `/speclite-grilling` / `/speclite-domain-modeling`。 | 确认并提交该修正（属非 Epic 11 的 21 个未提交文件之一）；这是 corpus 中唯一断裂的 caller→callee。 |
| B2 | G099（`sdlc-skills/module-help.csv:35`）→ G176（fixture `artifactType: ir-grill-records`） | outputs 列 `ir grill records` 派生出 artifactType `ir-grill-records`，沿用 11.8 已弃用的 `ir-grill` 词形（非路径形态，不在 11.8 token 内）。 | 确认是否改为 `grill-consistency-records` 之类；改动会触发 fixture / packaging 重生成，需新 change authorization。 |
| B3 | G269（`README.md:222`） | roadmap 条目"将 Grill 能力无痕融合到核心流程 Skills"暗示 standalone grill Skills 的未来去向未定。 | 确认该条目是否仍有效；若有效，`speclite-grilling` / `speclite-grill-with-docs` 的治理应作为独立 Story。 |
| B4 | G043, G046, G049, G059, G072, G087, G088（reviewer 包内 `grill-with-docs` 提及） | 文案称"内建 grill-with-docs 协议"，读者可能误解为依赖 `speclite-grill-with-docs`；CHANGELOG:12 已声明移除显式依赖。 | 确认是否把措辞改为"内建追问协议（源自 grill-with-docs 方法）"以消除歧义；纯文案，非阻塞。 |
| B5 | G093（`workflow.md:81` `.specskills/docs/analysis/…`） | 过程分析路径指向 `.specskills/`（本地分析目录，非 SPEC 09 artifact root）；测试 G253 只禁止 `.specskills/output/`，未覆盖 `docs/analysis/`。 | 确认是否属 canonical contract；若否，应改为 resolver-provided root 或明确标注为本地可选。 |
| B6 | Parity 差异（reviewer SKILL:23） | literal 计数 ZH 11 / EN 10，语义一致。 | 无需处理；记录以证明 parity 已逐行核对。 |

**C. 人工确认记录（2026-09-12）**

| # | 用户裁决 | 落地 |
|---|---|---|
| B1 | 是，提交工作树修正 | commit `a349f08`：`speclite-grill-with-docs` SKILL zh/en 改为 `/speclite-grilling` / `/speclite-domain-modeling`；fixture 与 packaging manifest 按提交树重生成 |
| B2 | 按建议更名 | commit `cfe49c1`：`module-help.csv:35` outputs `ir grill records` → `grill consistency records`（artifactType `grill-consistency-records`） |
| B3 | 按建议 | README roadmap 条目保留；standalone grill Skills（`speclite-grilling` / `speclite-grill-with-docs`）的去向作为**未来独立 Story 候选**登记于本清单，不在 Epic 11 内处理 |
| B4 | 改措辞 | commit `cfe49c1`：SKILL zh/en:12、prompt-library:20、workflow:22/24 改为"内建追问协议（源自 grill-with-docs 方法，不依赖 `speclite-grill-with-docs` Skill）"；CHANGELOG 历史条目不改 |
| B5 | 保持不动（用户 2026-09-12 裁决） | 出处：`references/workflow.md:78-82`；`.specskills/docs/analysis/<skill>/` 是 `speclite-skill-creator` workflow 定义的项目级过程分析约定（`skill-creation-workflow.md:59`，dirty-worktree 行号；HEAD 为 `:56`），`speclite-terminology-governance`、`speclite-docs-intro-ppt-creator` 同样使用；测试 `implementation-readiness-rename-routing.test.ts:150` 只禁止 `.specskills/output/…` 作为产物路径，不涉及 `docs/analysis/` |
| B6 | 无需处理 | — |

B1 / B2 / B4 的改动是用户确认后的独立 change commit，不属于 Story 11.10 的 read-only inventory 本身；inventory 条目 G011 / G014 / G099 / G043–G088 的 literal 以扫描时（HEAD `3cc1ba9`）为准，未回写。

**Post-confirmation change commits（AC11 评估：Story change，非新 Story）**

按 AC11，B1 / B2 / B4 在用户逐项确认后评估为 **Story 11.10 change**（范围小、与 inventory 直接对应、不引入新 AC），以独立 commit 落地并纳入本 Story 的 CR scope：

| Commit | 文件 |
|---|---|
| `a349f08` | `assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.md`、`SKILL.en.md`；`test/fixtures/fresh-install-empty-project/expected/installed-state/{files-index-full,skill-index-full}.json`；`release/packaging-manifest.json` |
| `cfe49c1` | `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/prompt-library.md,references/workflow.md}`；`assets/source/speclite/sdlc-skills/module-help.csv`；`test/fixtures/fresh-install-empty-project/expected/installed-state/{files-index-full,skill-index-full,phase-coverage-full}.json`；`release/packaging-manifest.json` |

B3 / B5 保持不动；B6 无需处理。

**C'. 原人工确认请求（已答复）**

以上 A 类 0 项、B 类 6 项均未修改任何 canonical 定义。请确认：(1) B1 是否提交工作树修正；(2) B2–B5 是否立项为后续治理 Story / change；(3) 本 inventory 是否可作为 Story 11.10 的 completion evidence。"已列出"不构成对任何修改的批准。

## References（参考资料）

- [Source: Epic 11 Story 11.10]
- [Source: PRD FR66a]
- [Source: Story 11.8 bounded rename/routing contract]
- [Source: `assets/source/speclite/` canonical source root]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
Claude Opus 5 (claude-opus-5)，manual orchestrator 模式。

### Completion Notes List（完成说明）
- Scanner：`rg` 单 token `grill` case-insensitive，deterministic sort；raw 269 行 → 269 entries，validator `unmapped=0`。分类由 scratchpad 脚本 `classify.py` 规则化生成并逐条人工复核（reviewer 包 56 行、IR check 10 行、core grill 包 14 行、docs / README / src / legacy 逐行核对）。
- 11.8 regression：0；compatibility 6（与 11.8 ledger 角色一致）；legacy 9；fixture 152；active 102。
- 高风险 / 歧义 6 项（B1–B6）已在 inventory 末尾单列并请求人工确认；B1（`speclite-grill-with-docs` HEAD 版本调用非 canonical `/grilling` / `/domain-modeling`）是唯一断裂的 caller→callee，工作树已有未提交修正。
- Read-only：scan 前后 canonical source（`assets/`、`docs/`、`src/`、`test/`、`README.md`）`git status` 集合一致，本 Story 只写 Story 文件、flow-gates、goal records、`sprint-status.yaml`。
- 本 inventory 不表示任何 grill reference 应删除、已修正或已获批准。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-10-inventory-all-grill-related-skill-references-for-human-confirmation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/flow-gates/11-10-inventory-all-grill-related-skill-references-for-human-confirmation-story-{kickoff,completion}-gate.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-10-code-review/**`
- Post-confirmation Story change（`a349f08`、`cfe49c1`）：`assets/source/speclite/core-skills/speclite-grill-with-docs/{SKILL.md,SKILL.en.md}`；`assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/prompt-library.md,references/workflow.md}`；`assets/source/speclite/sdlc-skills/module-help.csv`；`test/fixtures/fresh-install-empty-project/expected/installed-state/{files-index-full,skill-index-full,phase-coverage-full}.json`；`release/packaging-manifest.json`

## Anchor Evidence Summary（锚点证据摘要）
- Scan identity：HEAD `3cc1ba9` / tree `7d854dd4…` / dirty 21 / raw sha256 `571645e689874506…`。
- Reconciliation：raw 269 = entries 269，unmapped 0。
- Read-only diff：canonical source 改动集合 before/after 一致（仅既有 21 个非 Epic 11 dirty files，本 Story 未触碰）。
- Handoff：A 类 11.8 regression 0 项；B 类治理候选 6 项，已请求人工确认。
- Gates：kickoff `PASS`（2026-09-12）；completion gate 见 `flow-gates/11-10-…-story-completion-gate.md`。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 broad read-only grill inventory、100% reconciliation 与 human confirmation 上下文。 | Fancyliu / Codex |
| 2026-09-12 | 1.0 | 在 11.9 restart 之后的 current tree 上执行 broad scan（269 matches，100% match-to-entry），填入 inventory / 关系 / parity / 高风险清单，请求人工确认。 | Claude |
| 2026-09-12 | 1.1 | 记录用户对 B1–B4 的裁决与落地 commit（`a349f08`、`cfe49c1`）；B5 补充出处待判断。 | Claude |
| 2026-09-12 | 1.2 | B5 裁决保持不动；用户确认 inventory 作为 completion evidence，进入 CR 闭环。 | Claude |
| 2026-09-12 | 1.3 | CR main round 1 修复：G019/G022 分类与计数、15 条 Literal 补全、"七处提及"、G176 Target、B5 行号标注、exclusion 幻影 `.zip`；新增 Post-confirmation change commits 小节并扩展 File List。 | Claude |
| 2026-09-12 | 1.4 | CR main round 2 修复：G019 / G022 Target 对齐自身 ID，G022 恢复 dirty-worktree 标注；Exclusions 补 hidden 路径披露（R2-F2 顺带）。 | Claude |

---
*本文档由 bmad-create-story Skill 自动生成*
