---
project: SpecLite
date: 2026-05-28
workflow: bmad-correct-course
changeScope: Moderate
mode: Incremental
trigger: full-canonical-skill-closure
approval: approved
approvedAt: 2026-05-28T14:03:00+08:00
---

# Sprint Change Proposal（冲刺变更提案）

## Issue Summary（问题摘要）

当前 MVP 对 SpecLite canonical skill 闭环的表达仍偏向“最小阶段覆盖”与少量代表性 skill fixture。用户明确指出：MVP 版本不能只包含 `assets/source/speclite/core-skills/` 与 `assets/source/speclite/sdlc-skills/` 中的部分 canonical skill；完整 AI 方法论闭环必须包含这两个目录下的全部 skills。

本次检查确认：

- `assets/source/speclite/core-skills/` 当前有 13 个 `SKILL.md` package roots。
- `assets/source/speclite/sdlc-skills/` 当前有 40 个 `SKILL.md` package roots。
- 两者合计 53 个 canonical skill package roots。
- `support-skills/` 是 authoring support，不属于目标项目默认运行时 SDLC 方法论安装集合。
- 当前 `module-help.csv` 与真实 package roots 不完全一致：`core-skills` 有 2 个 package roots 未进入 help metadata，`sdlc-skills` 有 5 个 agent package roots 未进入本模块 help metadata，且 `sdlc-skills/module-help.csv` 通过 cross-module row 引用了 `speclite-brainstorming`。
- 当前 fresh install fixture expected tree 仍只显式断言 `speclite-dev-story` 的 IDE mirror entry，不能证明完整 canonical skill set 已安装、索引和可验证。

因此，这不是新增 Post-MVP governance 功能，而是 MVP 安装控制面的完整性修正：MVP 必须把 `core-skills/` 与 `sdlc-skills/` 下全部 canonical package roots 纳入 source discovery、IDE mirror creation、skill index、help/phase discovery、ready check、validate、fixture 和 release evidence 的闭环。

## Impact Analysis（影响分析）

**PRD Impact（PRD 影响）：** 有 MVP scope wording 需要收紧。PRD 已要求 source skill discovery、canonical skill mirror、methodology discovery、phase coverage、ready summary 和 maintainer fixture，但没有明确“所选模块下全部 canonical package roots 必须进入 installed runtime baseline”。需要补充这一句，避免实现只满足代表性 skill 或最小阶段入口。

**Epic Impact（Epic 影响）：** 影响 Epic 1、Epic 2、Epic 3 和 Epic 6。Epic 1/2 已在 `sprint-status.yaml` 中标记 done，因此批准后需要 reopening 或追加 corrective implementation task；Epic 3/6 仍处 in-progress / ready-for-dev，可直接吸收新的 validation 和 fixture AC。

**Story Impact（Story 影响）：**

- Story 1.3：模块选择摘要需要表达“选中模块会安装该模块下全部 canonical package roots”，而不只是能力范围摘要。
- Story 1.5：IDE mirror creation 必须安装所选模块下全部 canonical package roots，并记录所有 package roots 的 source reference/hash。
- Story 1.6：ReadyCheck 和 ready summary 必须验证/展示完整 installed skill count，不能只看 required installed skill entries。
- Story 2.1：discovery metadata 需要覆盖全部 canonical package roots；缺 help/menu metadata 的 package 也必须至少有 canonical package / skill index 可见性，或被明确要求补齐 help metadata。
- Story 2.2：IDE skill entry mapping 要以全部 package roots 为输入，不以 `module-help.csv` rows 作为唯一来源。
- Story 2.3：minimum phase coverage 仍是 installed-state matrix，但必须说明与完整 installed skill set 的关系：phase rows 可以服务阶段发现，不能被误读为完整安装清单。
- Story 3.2 / 3.3 / 3.4：validate 必须发现 skill index、IDE mirror、help index、phase coverage 与 package roots 的不一致，包括 missing mirrored package、unknown help id、unmapped package root 或 duplicate canonical id。
- Story 6.2：fresh install fixture expected outputs 必须断言 53 个 canonical skills 的 install/mirror/index baseline。
- Story 6.5：skill artifact loop 保持最小闭环即可，但必须明确它不是完整 skill set coverage 的替代证据。

**Architecture Impact（架构影响）：** 需要强化 source discovery、module manager、IDE target writer、manifest/index generator、ready check 和 validation 之间的职责边界。`module-help.csv` 是 help/menu/phase metadata source，不应成为 canonical package discovery 的唯一来源。

**Specs Impact（SPEC 影响）：** `04-manifest-index-contract.md` 需要补充 installed skill set completeness rule：`skill-index.json` 必须覆盖 selected modules 下全部 canonical package roots；`help-index.json` 与 `phase-coverage.json` 可以是 discovery/menu 投影，但不得隐藏或替代 skill index completeness。`08-fixture-contract.md` 可补充 fresh install release gate 对 full canonical skill set 的 fixture expectation。

**Implementation Impact（实现影响）：** 当前 `src/modules/module-metadata.ts` 已递归发现 `SKILL.md` package roots；`src/ide/target-writer.ts` 也基于 package roots 创建 package entries。主要风险在 metadata/fixture/test acceptance：`module-help.csv` 与 package roots 未完全对齐、phase coverage 没有覆盖无 help row 的 package、fixture expected tree 只断言代表性 skill。批准后应优先补 metadata 与 tests，再修 runtime 行为。

**Sprint Tracking Impact（冲刺跟踪影响）：** 当前 proposal 未更新 `sprint-status.yaml`。批准后建议把 Epic 1 / Epic 2 corrective work 标记为 explicit correction task，或把相关 done story 重新打开到 `ready-for-dev` / `in-progress` 后走 flow gate 和 CR。

## Recommended Approach（推荐路径）

推荐采用 **Moderate Direct Adjustment（中等范围直接调整）**：

- 不新增 Epic，不把 Epic 7 拉回 MVP。
- 不 rollback Epic 1/2 的既有工作。
- 对 PRD、Epics、Architecture、SPEC 和 fixture contract 做小范围精确补充。
- 对 implementation 做 targeted fix：metadata completeness、fixture expected outputs、runtime/validation tests。
- 对已完成 Story 1.3 / 1.5 / 1.6 / 2.1 / 2.2 / 2.3 记录 corrective reopen 或 corrective task，避免 silently 修改 done scope。

不建议选择 Potential Rollback。现有模块发现代码已经具备递归发现 package roots 的基础，不需要推倒重做。

不建议选择 PRD MVP Review / scope reduction。用户指出的是 MVP 闭环完整性缺口，不是要降低 MVP 目标；完整 canonical skill set 是 SpecLite 方法论产品价值的一部分，应进入 MVP。

## Detailed Change Proposals（详细变更提案）

### PRD Changes（PRD 修改）

File: `_bmad-output/planning-artifacts/prd/04-product-scope产品范围.md`

Section: MVP - Minimum Viable Product（MVP - 最小可行产品）

OLD:

```md
MVP 还必须覆盖核心阶段化研发流程的 skills 菜单提示、skill 激活和产物输出路径，使 SPEC-Driven、TDD、方案评审、故事规划、实现、测试、对抗性审查等流程具备稳定 IDE 入口。
```

NEW:

```md
MVP 还必须覆盖核心阶段化研发流程的 skills 菜单提示、skill 激活和产物输出路径，使 SPEC-Driven、TDD、方案评审、故事规划、实现、测试、对抗性审查等流程具备稳定 IDE 入口。

MVP 的默认官方安装集合必须包含 `assets/source/speclite/core-skills/` 与 `assets/source/speclite/sdlc-skills/` 下全部 canonical skill package roots；`support-skills/` 只服务 canonical skill 源定义的创建、迁移和 lint，不属于目标项目默认运行时 SDLC 方法论安装集合。
```

Rationale: 明确 MVP installed runtime baseline，防止用代表性 skill 或最小 phase coverage 替代完整 canonical skill package set。

File: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`

Section: Installation & Project Onboarding（安装与项目引导）

OLD:

```md
- FR14: 系统可以发现正式可分发的 SpecLite source skills。
- FR15: 系统可以将同一 canonical skill 暴露到多个目标 AI IDE。
```

NEW:

```md
- FR14: 系统可以发现正式可分发的 SpecLite source skills；MVP 默认官方安装集合必须递归发现 `core-skills/` 与 `sdlc-skills/` 下全部包含 `SKILL.md` 的 canonical package roots，并排除 `support-skills/`、已删除入口和非正式分发辅助来源。
- FR15: 系统可以将同一 canonical skill 暴露到多个目标 AI IDE；对于被选中模块下的每个 canonical package root，MVP 必须在每个已选择且支持的 IDE target 中生成 self-contained skill entry，并在 skill index / files index 中记录 source reference 与 hash。
```

Rationale: 将“全部 package roots”提升为 FR14/FR15 的产品级验收边界。

### Epic / Story Changes（Epic / Story 修改）

File: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md`

Story: 1.3 Official Module Selection And Install Summary（官方模块选择与安装摘要）

OLD:

```md
**则** 摘要会列出已选择的模块、版本和将参与安装的能力范围
```

NEW:

```md
**则** 摘要会列出已选择的模块、版本、将参与安装的能力范围，以及每个模块下将安装的 canonical package root count
**并且** 默认官方安装集合中，`core` 与 `sdlc` 选中后必须包含各自目录下全部包含 `SKILL.md` 的 canonical package roots。
```

Rationale: 让用户在写入前看到完整安装范围，而不是只看到模块名。

Story: 1.5 Runtime Structure, Artifact Directory And IDE Mirror Creation（运行时结构、产物目录与 IDE 镜像创建）

OLD:

```md
**则** 系统会把所选 canonical skills 安装到 `.claude/skills`
```

NEW:

```md
**则** 系统会把所选模块下全部 canonical package roots 安装到 `.claude/skills`
```

OLD:

```md
**则** 系统会把同一批 canonical skills 安装到 `.agents/skills`
```

NEW:

```md
**则** 系统会把同一批完整 canonical package roots 安装到 `.agents/skills`
```

Add:

```md
**前提** 所选模块包含 canonical package roots
**当** 系统生成 skill index 与 files index
**则** `skill-index.json` 必须包含所选模块下每一个 canonical package root 的 `canonicalSkillId`、`sourcePackagePath`、`canonicalPackageHash` 和 installedTargets
**并且** `files-index.json` 必须包含每个 IDE target 中对应 package files 的 installer-owned hash projection。
```

Rationale: 将完整 package set 纳入 installed-state contract，而不只纳入 IDE 文件复制。

Story: 1.6 Install Progress And Ready Summary（安装进度与就绪摘要）

OLD:

```md
**则** ReadyCheck 只检查 manifest/index 可读、source descriptor projection 有效、selected IDE mirrors 和 required installed skill entries 可见、required runtime paths 存在，以及本次 install 没有 blocking issue 或 failed required step
```

NEW:

```md
**则** ReadyCheck 只检查 manifest/index 可读、source descriptor projection 有效、selected IDE mirrors 和 selected modules 下全部 canonical package roots 的 installed skill entries 可见、required runtime paths 存在，以及本次 install 没有 blocking issue 或 failed required step
```

Rationale: ReadyCheck 不能只看 required entries，否则“部分安装”会被误报为 ready。

File: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md`

Story: 2.1 Methodology Discovery Metadata Generation（方法论发现元数据生成）

OLD:

```md
**则** 每个可发现能力都会记录 phaseId、phaseLabel、moduleId、canonicalSkillId、skill 名称、entry label 和 activation target
```

NEW:

```md
**则** 每个 canonical package root 都会在 skill index 中记录 canonicalSkillId、moduleId、source package path 和 installed targets
**并且** 每个有 help/menu metadata 的可发现能力都会记录 phaseId、phaseLabel、moduleId、canonicalSkillId、skill 名称、entry label 和 activation target。
```

Rationale: 区分完整 skill inventory 与 menu/phase discovery projection，避免无 help row 的 package root 被静默排除。

Story: 2.2 IDE Skill Entry Mapping（IDE Skill Entry 映射）

OLD:

```md
**则** 每个可映射的 canonical skill 会生成 `.claude/skills` 下的 self-contained skill entry
```

NEW:

```md
**则** 所选模块下每个 canonical package root 都会生成 `.claude/skills` 下的 self-contained skill entry
```

OLD:

```md
**则** 每个可映射的 canonical skill 会生成 `.agents/skills` 下的 self-contained skill entry
```

NEW:

```md
**则** 所选模块下每个 canonical package root 都会生成 `.agents/skills` 下的 self-contained skill entry
```

Rationale: IDE mirror completeness 的输入必须是 package roots，不是 help/menu row。

Story: 2.3 Skill Activation And Phase Capability Coverage（Skill 激活与阶段能力覆盖）

Add:

```md
**前提** 某个 installed canonical skill 没有 phase/help row
**当** 系统生成 MVP 最小阶段覆盖矩阵
**则** 该 skill 不得从 skill index 或 IDE mirror 中消失
**并且** validation 必须能区分“已安装但未暴露到 phase coverage”与“缺失 installed skill entry”。
```

Rationale: `phase-coverage.json` 是阶段发现矩阵，不是完整 installed skill inventory。

File: `_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md`

Story: 3.2 / 3.3 / 3.4

Add:

```md
**前提** selected modules 下存在 canonical package roots
**当** validate 检查 skill index、help index、phase coverage 和 IDE mirrors
**则** `skill-index.json` 必须覆盖 selected modules 下全部 canonical package roots
**并且** IDE mirrors 中缺少任一 selected canonical package entry 必须报告 stable `ide-mirror` 或 `menu-target` issue
**并且** help index 或 phase coverage 引用未知 canonicalSkillId 时必须报告 stable `menu-target` issue。
```

Rationale: 让 validate 成为完整 skill set drift 的本地确定性诊断入口。

File: `_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`

Story: 6.2 Fresh Install And Existing Update Fixture Gates（Fresh Install 与 Existing Update Fixture Gate）

OLD:

```md
**则** expected outputs 验证 `_speclite`、`_speclite-output`、manifest/index、`.claude/skills` 和 `.agents/skills` 已按预期生成
```

NEW:

```md
**则** expected outputs 验证 `_speclite`、`_speclite-output`、manifest/index、`.claude/skills` 和 `.agents/skills` 已按预期生成
**并且** fresh install baseline 必须断言 `core-skills/` 与 `sdlc-skills/` 下全部 53 个 canonical package roots 均出现在 skill index 和每个 selected IDE mirror 中。
```

Story: 6.5 Skill Artifact Loop And Documentation Examples（Skill Artifact Loop 与文档示例）

Add:

```md
**前提** `skill-artifact-loop` 只激活一个或少量代表性 workflow skill
**当** release gate 汇总 MVP 安装证据
**则** 该 fixture 只能证明 activation/artifact metadata 最小闭环
**并且** 不得替代 full canonical skill set install/mirror/index fixture assertions。
```

Rationale: 分离“完整安装集合”与“最小 workflow artifact loop”两种证据。

### Architecture Changes（架构修改）

File: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`

Section: Manifest And Index Semantics（清单与索引语义）

OLD:

```md
- Source 侧以 `assets/source/speclite/` 下的 module metadata 与 source skill package 作为 canonical truth。
```

NEW:

```md
- Source 侧以 `assets/source/speclite/` 下的 module metadata 与 source skill package 作为 canonical truth；对于默认官方 `core` 与 `sdlc` 模块，canonical package inventory 必须递归覆盖 `core-skills/` 与 `sdlc-skills/` 下全部包含 `SKILL.md` 的 package roots，`support-skills/` 不属于目标项目默认运行时 SDLC 方法论安装集合。
- `module-help.csv` 是 help/menu/phase metadata source，不是 canonical package inventory 的唯一来源；implementation 必须以 discovered package roots 生成 skill index 和 IDE mirrors，再用 help metadata 生成 help index 与 phase coverage。
```

Rationale: 明确 package inventory 与 help/phase projection 的架构边界。

### SPEC Changes（SPEC 修改）

File: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`

Section: Source Of Truth（真源）

OLD:

```md
- `assets/source/speclite/` 下的 module metadata 和 source skill packages 定义 canonical modules、canonical skill ids、source package content、phase metadata、help/menu labels 和 default artifact contracts。
```

NEW:

```md
- `assets/source/speclite/` 下的 module metadata 和 source skill packages 定义 canonical modules、canonical skill ids、source package content、phase metadata、help/menu labels 和 default artifact contracts。
- 对 selected modules，`skill-index.json` 必须覆盖该模块下全部 canonical package roots；help/menu metadata 缺失不得导致 package root 从 skill index、files index 或 IDE mirrors 中消失。
- `help-index.json` 与 `phase-coverage.json` 是 discovery/menu/phase projections。它们可以只包含有 help/menu metadata 的 entries，但必须引用已存在于 `skill-index.json` 的 `canonicalSkillId`，不得定义第二套 installed skill inventory。
```

Rationale: 把完整 installed skill inventory 的 ownership 放回 manifest/index contract。

File: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`

Section: fixture release gate for `fresh-install-empty-project`

Add:

```md
`fresh-install-empty-project` release gate 必须验证 selected official modules 下全部 canonical package roots 已进入 `skill-index.json`、`files-index.json` 和每个 selected IDE mirror。对于当前默认官方 `core` + `sdlc` 安装，baseline 应断言 53 个 canonical package roots，而不是只断言代表性 workflow skill。
```

Rationale: 防止 fixture snapshots 因只覆盖 `speclite-dev-story` 而放过 partial install。

### Source / Test Changes（源码与测试修改）

批准后由 Developer agent 执行，建议最小任务集如下：

1. 更新 `assets/source/speclite/core-skills/module-help.csv`，补齐至少 `speclite-advanced-elicitation` 与 `speclite-review-acceptance-auditor` 的 help metadata，或明确这些 package 不进入 help/phase projection 但仍必须安装。
2. 更新 `assets/source/speclite/sdlc-skills/module-help.csv`，为 `speclite-agent-analyst`、`speclite-agent-pm`、`speclite-agent-ux-designer`、`speclite-agent-architect`、`speclite-agent-dev` 补齐 help/phase metadata，或明确 agent skills 的 phase projection 策略。
3. 检查 `sdlc-skills/module-help.csv` 中 `speclite-brainstorming` cross-module row 的意图：如果它表示 SDLC menu alias，应保留但测试必须覆盖；如果它误导 module ownership，应改由 core help metadata 表达。
4. 扩展 `test/source-and-modules.test.ts`：断言 `core` packageRoots 为 13、`sdlc` packageRoots 为 40、默认官方 selected package roots 合计为 53，并断言 help entries 不引用未知 package roots。
5. 扩展 `test/runtime-structure.test.ts` 与 `test/fixtures/fresh-install-empty-project/expected/**`：fresh install 后 `.claude/skills` 与 `.agents/skills` 各包含 53 个 `SKILL.md` entry，`skill-index.json` 包含 53 个 canonical skill ids，files index 包含每个 selected target 的 package files。
6. 扩展 validation tests：missing selected canonical package in mirror、unknown help canonicalSkillId、phase coverage references unknown skill id、skill index missing selected package root 均产生 stable issue。
7. 运行 targeted test suite：`npm test -- test/source-and-modules.test.ts test/runtime-structure.test.ts test/install-module-selection.test.ts test/manifest-discovery.test.ts`，必要时再运行完整 `npm test`。

## Checklist Results（检查清单结果）

- [x] 1.1 Triggering story：触发点来自用户明确的 MVP scope correction；关联已完成 Epic 1/2 与当前 Epic 3/6，而非单一 story。
- [x] 1.2 Core problem：MVP installed skill set completeness 与 phase/help/menu minimum coverage 被混用，导致完整 canonical methodology closure 缺少明确 gate。
- [x] 1.3 Evidence：真实目录为 13 core + 40 sdlc = 53 package roots；current help metadata 和 fresh-install fixture evidence 不能证明完整安装集合。
- [x] 2.1 Current epic impact：Epic 3/6 可继续，但必须新增 validation 和 fixture acceptance；Epic 1/2 done scope 需要 corrective reopen/task。
- [x] 2.2 Epic changes：不新增 Epic；修改 Epic 1/2/3/6 的 Story AC。
- [x] 2.3 Remaining epics：Epic 4/5 无直接范围变化；update/repair 与 source integrity 继续消费 manifest/files/hash completeness。
- [x] 2.4 Future epic invalidation：Epic 7 不受影响，仍为 Post-MVP backlog。
- [x] 2.5 Priority/order：优先补 planning/spec/test acceptance，再改实现和 fixtures。
- [x] 3.1 PRD conflict：PRD 需要补充 MVP 完整 canonical install set，不是改变产品方向。
- [x] 3.2 Architecture conflict：需要区分 package inventory 与 help/phase projection。
- [N/A] 3.3 UX conflict：无 UI/UX 行为变化。
- [x] 3.4 Other artifacts：module-help metadata、fixtures、expected outputs、validation tests、sprint status corrective tracking 受影响。
- [x] 4.1 Direct Adjustment：可行；effort Medium；risk Medium。
- [x] 4.2 Potential Rollback：不建议；effort Medium；risk Medium；收益低。
- [x] 4.3 PRD MVP Review：不建议 scope reduction；MVP 应吸收完整 canonical set。
- [x] 4.4 Recommended path：Moderate Direct Adjustment。
- [x] 5.1 Issue summary：已记录。
- [x] 5.2 Epic/artifact impact：已记录。
- [x] 5.3 Path forward：已记录。
- [x] 5.4 MVP impact/action plan：已记录。
- [x] 5.5 Handoff plan：已记录。
- [x] 6.1 Checklist completion：除用户批准与 sprint-status 更新外均完成。
- [x] 6.2 Proposal accuracy：已基于当前 repo artifacts、source tree 与 tests 核对。
- [!] 6.3 User approval：pending。
- [!] 6.4 sprint-status update：approval 后执行；本提案不擅自修改 sprint 状态。
- [x] 6.5 Next steps：等待用户批准后交给 Developer agent 执行 targeted correction。

## Implementation Handoff（实现交接）

Change scope classification: **Moderate**。

Recommended recipients:

- Product Owner / Developer：批准本 proposal 后，将 corrective tasks 进入 sprint tracking；必要时 reopening Story 1.3 / 1.5 / 1.6 / 2.1 / 2.2 / 2.3。
- Developer agent：执行文档、metadata、runtime tests、fixtures 和 validation 的 targeted fix。
- Reviewer / Flow Gate：重点检查完整 canonical package roots 是否进入 skill index、IDE mirrors、files index、ready summary 和 fixture evidence；不得用一个 representative skill artifact loop 代替 full installed set proof。

Success criteria:

- `find assets/source/speclite/core-skills assets/source/speclite/sdlc-skills -name SKILL.md` 返回的 53 个 package roots 全部进入默认官方 install baseline。
- Fresh install 后 `.claude/skills` 与 `.agents/skills` 各有 53 个 installed `SKILL.md` entries。
- `skill-index.json` 包含 53 个 canonical skill ids，并按 contract 排序、使用 project-relative POSIX source paths。
- `help-index.json` / `phase-coverage.json` 不引用未知 canonicalSkillId；若某 package 没有 menu/phase projection，其状态被明确解释且不影响 package install completeness。
- Fresh install fixture expected outputs、manifest/index snapshots、files index snapshots 和 validation assertions 均更新。
- Story 6.5 的 `skill-artifact-loop` 仍验证最小 activation/artifact metadata loop，但 release gate 另有 full canonical skill set install proof。

## Approval（批准记录）

用户已批准本 Sprint Change Proposal 进入实施。后续变更按本文的 Moderate Direct Adjustment 路径执行，并在 sprint tracking 中记录 corrective work。
