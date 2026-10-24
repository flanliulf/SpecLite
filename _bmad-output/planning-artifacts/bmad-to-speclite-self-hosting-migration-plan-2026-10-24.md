---
title: SpecLite 自举开发与 BMAD 过程文档迁移方案
project: SpecLite
documentType: migration-plan
status: proposed
createdAt: 2026-10-24
assessmentDate: 2026-09-16
assessmentHead: ceca9b974f01cd087fd8765b8f68b5da16b0901b
implementationStatus: not-started-by-this-plan
---

# SpecLite 自举开发与 BMAD 过程文档迁移方案（Self-Hosting Migration Plan）

## 1. 执行摘要（Executive Summary）

**总体可行。建议分阶段切换，先完成文档迁移验收，再用一条真实 Story 验收开发接管。**

本方案将本项目的开发流程从 BMAD 过渡到 SpecLite 自身。迁移后，SpecLite runtime（安装在本项目中、实际执行工作流的配置、Skill 和 Hook）应能持续支撑后续 Epic 和 Story。既有需求、设计、状态和评审证据必须保持可追溯。

推荐顺序：

```text
刷新基线与确认范围
→ 完成最小前置收口
→ 固定 runtime 版本并隔离演练
→ 独立迁移过程文档
→ 验收文档完整性与实际消费
→ 用真实 Story 验收开发闭环
→ 将 SpecLite 设为唯一活动流程
```

需要分别证明三件事：产品具备所需能力；本仓库正确安装并实际消费这些能力；迁移后的文档能够支撑持续迭代。源代码测试通过不能替代后两项证明。

### 1.1 日期与授权边界（Date and Authorization Boundary）

- **评估日期：2026-09-16。** 本文整理该次评估和推荐方案。
- **整理日期：2026-10-24。** 本次只新增方案文档并提交，不执行迁移、安装、Story 开发或状态变更。
- 下文的文件数量、测试结果和阻塞项属于原评估快照。它们不是 2026-10-24 的重新验收结论。
- 原评估基线包含 HEAD 之外的 Epic 12/13 工作区规划。实施前必须重新核对当前 HEAD、工作区、产物清单、平台行为和 Story 状态。
- `status: proposed` 表示方案待进入实施决策。保存或提交本文，不等于批准具体文件变更、执行迁移或通过任何 Flow Gate。

## 2. 评估基线（Assessment Baseline）

2026-09-16 的评估基于 HEAD `ceca9b974f01cd087fd8765b8f68b5da16b0901b` 及当时的工作区规划。

| 对象 | 原评估结果 | 对迁移的意义 |
| --- | --- | --- |
| Epic 1–11 | tracker 均为 `done` | 适合在阶段边界建立迁移基线 |
| Story | 70 个 `done` | 保留完成状态和证据，不因迁移重开 |
| Epic 12 / 13 | 分别有 4 / 3 个 backlog Story | 是后续迭代候选，实施前须刷新状态 |
| `_bmad-output` | 共 1,182 个文件 | 需要逐文件分类和处置清单 |
| Planning / Implementation / 根目录上下文 | 分别为 91 / 1,090 / 1 个文件 | 分阶段迁移，保留扩展产物 |
| 隐藏文件 | 93 个 `.tmp` 文件、1 个 `.DS_Store` | 单独审查，不静默丢弃 |
| 全量测试 | 68 个测试文件通过，731 passed、4 todo | 证明当时受测行为，不证明实际接管 |
| `docs:check` | 80 份 Markdown 检查通过 | 只覆盖对应公开文档检查范围 |
| 本项目 `status` | `manifestPresent: false`、`highLevelHealth: not-configured` | 尚未形成完整 installed runtime |
| 本项目 `validate` | 5 个 critical，均为 installed metadata 缺失 | 正式接管前必须补齐并验证安装 |
| PRD discovery | `invalid-sharded`、`outside-subject-directory`、`continuation: block` | 当前结构不能直接被 resolver 消费 |
| Epics / Architecture discovery | 均成功；Architecture 使用 `legacy-compatible` | 已有复用基础，但仍需在新根目录复验 |

Implementation 还包含 Flow Gates、SR/CR、复盘、CR rules/TODO、配置审计、开发验证和执行账本。不能只搬迁 PRD、Architecture 与新 Epic。

## 3. 切换前置条件（Cutover Prerequisites）

| ID | 原评估发现 | 推荐处理与验收 |
| --- | --- | --- |
| B1 | 本仓库只有部分 `_speclite` 配置和 hooks，缺少 manifest/index；配置仍指向 `_bmad-output` | 在隔离副本完成正式安装，核对现有配置、hooks 和 Skill 冲突；验证安装身份、索引和实际激活 |
| B2 | PRD `index.md` 的 `../specs/*.md` 导航被 resolver 当作越出 subject 的 shard 引用 | index 保留本 subject 的分片声明；将跨 SPEC 阅读导航移入同目录说明 shard；保留内容并更新章节引用；实际 discovery 必须通过 |
| B3 | SPEC 09 仍声明 Flow Gate report v1，实际 hook 和模板要求 v2 | 通过受控契约变更完成追认；保留历史 v1；新 Story 重新生成当前有效的 v2 gate |
| B4 | CLI 合并多层配置，hook 直接读取 `_speclite/config.toml` | 在 shared base config 显式配置七类 roots；所有相关 override 必须与之相同；验证 CLI、Skill、hook 实际消费路径一致 |
| B5 | 源码 `contractRefs` 和部分测试读取旧 SPEC 路径 | 定向迁移当前契约引用和测试输入；审查 manifest/fixture 影响；保留兼容判断和历史引用 |
| B6 | 双平台 hook 的命令路径、Codex 放行输出和 Stop 处理尚有收口项 | 按 Story 12.3 和实施时平台文档完成验证；覆盖根目录、子目录和 worktree |

B4 在原评估中是迁移可能触发的风险，未证明当时已有 override 误读。通用 override 支持应另按产品契约治理，不隐含加入本次迁移实现范围。

原评估建议先用现有 BMAD 流程完成 12.1、12.3 所承担的前置收口。为避免“必须完成 12.1 才能开始 12.1”的循环，先由 owner 对已实现的 v2 作受控追认，再按适用流程完成 Story 验证。不得以临时绕过 hook 代替契约修订。

如果实施时这些事项已完成，应验证其当前证据与 installed consumption，复用结论，不重复开发。无需等待 Epic 12/13 全部完成后才开始迁移。

## 4. 目标体系（Target Model）

### 4.1 四层职责（Ownership Layers）

| 层次 | 目录 | 职责 |
| --- | --- | --- |
| Canonical source | `assets/source/speclite/` | 定义方法论、Skill、Hook 和默认契约 |
| Runtime projection | `_speclite/`、IDE Skill 投影 | 固定版本后实际执行工作流 |
| Workflow artifacts | `_speclite-output/` | 维护活动过程文档、状态和所需历史记录 |
| Public Documentation | `docs/` | 维护对外公开文档，不整体搬入 Project Knowledge |

本仓库同时是产品源码仓库和产品使用项目。canonical source 变更经过验证后，再显式升级本项目 runtime。一次 Story 执行期间，执行规则不得随源码修改自动漂移。

### 4.2 标准产物目录（Artifact Roots）

```text
_speclite-output/
├── project-context.md
├── 0-brainstorming-artifacts/
├── 1-analysis-artifacts/
├── 2-planning-artifacts/
├── 3-solutioning-artifacts/
├── 4-implementation-artifacts/
├── 5-devops-artifacts/
└── project-knowledge-base/
```

七类 roots 由当前 artifact-root resolver 和配置确定。`project-context.md` 按其 producer 约定放在输出根目录。原评估发现其内容仍为初始化占位，接管前应依据当前代码、契约和项目规则补全。

切换后只有一套活动 tracker 和活动写入根。旧 `_bmad-output` 冻结为历史与恢复基线。仓库入口应明确新根目录及 Skill 名称，避免宽泛发现规则同时消费新旧上下文。退出日常执行的 BMAD 项目入口保留恢复副本；清理历史单独处理。

## 5. 文档迁移设计（Artifact Migration）

### 5.1 产物映射（Artifact Mapping）

以下目标位置均相对于 `_speclite-output/`。该表定义分类规则；实施时必须形成逐文件清单。

| 现有产物 | 目标位置 | 迁移规则 |
| --- | --- | --- |
| PRD 分片、需求索引 | `2-planning-artifacts/prd/` | 保留需求 ID、正文和修订历史；适配 index |
| Epics 分片和索引 | `2-planning-artifacts/epics/` | 纳入批准基线中的新规划，保留编号与依赖 |
| UX 及资源 | `2-planning-artifacts/ux/` | 文档、HTML 和资源一并校验 |
| Architecture 分片 | `3-solutioning-artifacts/architecture/` | 保持分片结构，更新当前引用 |
| SPEC | `3-solutioning-artifacts/specs/` | 保留中文 owner 与英文 mirror 关系 |
| ADR | `3-solutioning-artifacts/adr/` | 登记为本项目扩展目录 |
| Research、Brief、PRFAQ | `1-analysis-artifacts/` 对应子目录 | 按类型归位，不补造不存在的产物 |
| Change Proposal、Story candidates | `2-planning-artifacts/` | 保留决策、批准与应用状态 |
| IR 和一致性审查 | `3-solutioning-artifacts/implementation-readiness-report/` 对应目录 | 保留历史日期；切换后另做 fresh IR |
| Sprint tracker | `4-implementation-artifacts/sprint-status.yaml` | 保留状态映射，更新 `story_location` |
| 已完成 Story | `4-implementation-artifacts/stories/` | 保留状态和历史正文，支持后续发现 |
| SR、CR、执行账本 | `4-implementation-artifacts/` 对应目录 | 保留 series、round、superseded 和历史目录关系 |
| Flow Gates | `4-implementation-artifacts/flow-gates/` | 保留原文，不刷新有效期 |
| CR rules、TODO backlog | `4-implementation-artifacts/cr-rules/` | 持续维护，保留编号和状态 |
| Retrospectives | `4-implementation-artifacts/retrospectives/` | 验证后续流程能发现上个 Epic 的经验 |
| 配置审计、开发验证等 | Implementation 内登记的扩展目录 | 审计脚本与输入依赖一起核对 |
| 历史 whole/archive 文档 | 对应阶段的 archive 区域 | 不加入活动 shard 声明 |
| `.tmp`、系统杂项 | 清单单独列项 | 保留源备份，查明引用后决定目标处置 |

### 5.2 内容与状态保真（Content and State Preservation）

活动文档可以更新当前路径、跨阶段链接和必要的结构。每项转换必须有 diff 和迁移记录，不得改变需求语义。

历史证据保留原生成者、日期、schema、结果、scope hash 和 round binding。历史命令、旧 File List、当时消费路径保持原文。涉及 hash 绑定的证据优先逐字节复制；迁移清单负责定位副本。

不得把历史 `bmad-*` provenance 改写为 `speclite-*`。不得把旧报告改成 v2、刷新日期或修改 `PASS`，以伪造当前有效性。旧 Story 的状态按批准基线继承；新 Story 仍须独立通过当前门禁。

目录迁移前要检查未完成 review 和 goal records。tracker 为 `done` 不能替代该检查。发现未完成 run 时先确定唯一续跑根，避免新旧目录同时参与 CR discovery。

### 5.3 迁移清单与工具（Manifest and Tooling）

使用项目级迁移工具。每个源文件至少记录：`sourcePath`、`targetPath`、`artifactType`、`lifecycle`、`operation`、`sourceHash`、`targetHash`、`transforms`、`consumer` 和 `verification`。

工具应支持以下行为：

1. 先生成只读计划，再执行已确认的文件操作。
2. 源内容变化时拒绝沿用旧计划；目标冲突时停止。
3. 重复执行不重复追加，不覆盖未知修改。
4. 中断后识别已完成操作，并支持恢复。
5. 为每个源文件记录迁移、保留或排除结论。
6. 分别验证内容保真、引用有效和实际 runtime 消费。

该工具属于本项目迁移专项。现有 install/update/repair 不承担 workflow-owned 文档迁移。本文不新增公共 `speclite migrate` 命令，也不改变安装器的 no-migration 契约。

### 5.4 契约权威关系（Contract Authority）

迁移前建立契约登记表，记录主题、工程 owner、公共规范入口、executable anchor 和冲突处置。目录变化不能自动决定契约权威。

`docs/reference/specs/` 的公共规范入口与过程 SPEC 的开发约束应保持一致。遇到冲突，先受控修订 owner，再同步实现、测试和文档。不复制出第二套独立维护的公共规范。

## 6. 实施阶段（Execution Phases）

| 阶段 | 执行内容 | 阶段出口 |
| --- | --- | --- |
| Phase 0 基线与范围 | 刷新 HEAD、工作区、状态、逐文件清单和引用；纳入未提交规划；明确变更白名单 | 可复核基线、范围、前置缺口和回滚方案齐备 |
| Phase 1 前置收口 | 核验或完成 12.1、12.3；登记本次新增缺口，保持 Story 边界 | owning contract 与执行器一致；本项目所需平台行为验证通过 |
| Phase 2 隔离演练 | 使用固定版本和内容哈希的已验证分发包安装；验证配置、索引、hooks、IDE 投影与实际激活 | 安装闭环成立；runtime 版本及消费身份可追溯 |
| Phase 3 文档迁移 | 冻结源快照，按清单复制/转换，修复引用与 discovery，输出回执 | 文档迁移验收通过；迁移操作未推进 Story 状态 |
| Phase 4 流程交接 | 更新获准的项目入口；核验规划一致性；运行 fresh IR；建立试点活动根 | 明确唯一 writer、活动 tracker、fresh gate 和试点范围 |
| Phase 5 真实试点 | 完成一条 Story 的创建、SR、开发、CR、finalizer 和写后重读 | 开发接管验收通过，SpecLite 成为唯一活动流程 |

安装应覆盖 `core`、`sdlc` 与本仓库维护所需能力。Codex 和 Claude Code 分别验证 Skill 投影、配置和 hook 实际执行。runtime 信任和启用步骤按实施时的平台要求完成。

隔离演练还须验证 update/repair 不改写 workflow-owned 文档。正式搬迁前设置受控写入窗口，阻止其他 workflow 同时更新源文档或 tracker。

## 7. 后续迭代接管（Workflow Handoff）

### 7.1 工作流入口（Workflow Entrypoints）

| 原入口 | 接管入口 |
| --- | --- |
| `bmad-help` | `speclite-help` |
| PRD、Architecture、Epics 等 BMAD Skills | 对应的 `speclite-*` Skills |
| `bmad-check-implementation-readiness` | `speclite-implementation-readiness-check` |
| `bmad-create-story` / `bmad-dev-story` | `speclite-create-story` / `speclite-dev-story` |
| `bmenhance-sr-01/02/03` | `speclite-story-review-01/02/03` 对应 package |
| `bmenhance-cr-01…06` | `speclite-code-review-01…06` 对应 package |
| Epic SR/CR runner | 对应 `speclite-goal-orchestrator-*` |
| Sprint、Retrospective、Correct Course | 对应 `speclite-*` Skills |

入口验收必须基于 installed package 和实际消费记录，不能只检查 canonical source 中存在同名目录。原评估未确认的能力，不因名称相似而视为已安装或可用。

### 7.2 Story 执行顺序（Story Lifecycle）

```text
当前规划一致性核验 → Fresh IR → 创建目标 Story
→ SR Reviewer → 只读 Evaluator → 获准修订 → 复审
→ Fresh story-kickoff → Dev Story
→ story-completion 检查与 CR 闭环
→ Rules / TODO / Finalizer → tracker 写后重读 → 下一 Story
```

具体顺序和重复检查点以已对齐的 owning contract、installed CR 共享契约和 runner 为准。最后一次源码修改后，review/evaluation 与 completion evidence 必须仍然有效。`ready-for-dev`、IR `READY`、SR 通过和历史 `done` 不能相互替代。

### 7.3 真实试点（Pilot Story）

原评估推荐：12.1、12.3 前置收口后，以 12.2 为首个真实试点。它可以覆盖契约、实现和验证，又避免把待修复 hook 本身作为首次接管证明。

实施时先确认 12.2 仍未启动。若它已启动或已完成，选择当时批准的下一条独立、范围明确的 backlog Story，并记录选择；不得为验证迁移而重开已完成 Story。

试点的全部活动产物写入新 roots。它必须读取迁移后的需求、SPEC、历史经验和规则，并完成真实 SR/CR/finalizer。两个平台分别验证同一份 gate 的消费，不重复实现 Story。试点通过后再推进其余 Story，并保持现有依赖顺序。

## 8. 验收标准（Acceptance Criteria）

### 8.1 文档迁移验收（Artifact Acceptance）

- 每个源文件均有处置结论；无未分类遗漏。
- 原样复制文件的 hash 一致；转换文件有批准范围内的 diff。
- FR/NFR、Epic/Story ID、需求语义和状态未发生非授权变化。
- PRD、Epics、Architecture discovery 均为 `continuation: continue`；`consumedPaths` 与批准清单一致。
- 活动引用可解析；历史引用可通过原路径或迁移清单追溯。
- gate、review、evaluation 的日期、结果、series 和 hash binding 保留。
- 已完成 Story、复盘、CR TODO 和规则可被实际 consumer 发现。
- 中断恢复、重复执行、源漂移和目标冲突场景验证通过。

### 8.2 开发接管验收（Runtime Acceptance）

- `status` 显示完整配置状态；`validate` 无 critical/error，warning 逐项解释。
- CLI、Skill、hook 消费同一份 Story、tracker 和 gate。
- 有效 gate 放行；缺失、过期、v1、目标不符和失败 gate 按契约阻断。
- 根目录、子目录和 worktree 行为符合声明的平台支持边界。
- 一个真实 Story 完成创建、SR、实现、CR、finalizer 与状态同步。
- 试运行期间旧 `_bmad-output` 无新增过程写入。
- runtime 更新或 repair 后，受保护过程文档的 hash 不变。

文档迁移通过与开发接管通过必须分别出具结论。目录存在、可点击链接、测试全绿和 tracker 完成状态，均不能单独替代实际消费证据。

## 9. 回滚策略（Rollback Strategy）

**未产生新开发状态时：**恢复原 runtime、配置和活动入口。保留迁移副本及失败记录，恢复旧根继续工作。

**已产生新 Story 进展时：**先冻结写入，保留新产物和状态。优先修复 runtime 并继续消费新根；确需恢复 BMAD 时，先验证反向映射，再对账新增文档、引用与 tracker。不得用旧快照覆盖新进展，也不得把已完成状态退回 backlog。

回滚演练必须覆盖第二种情况。恢复目录并不等于恢复完整的开发状态。

## 10. 交付物与完成定义（Deliverables and Completion）

迁移专项应交付：

1. 迁移基线、引用清单和逐文件处置清单。
2. 前置契约、安装和消费缺口的闭环记录。
3. 可重复执行、可恢复的迁移工具与操作回执。
4. 迁移后的 runtime 配置、活动文档和项目执行入口。
5. 独立的文档迁移验收报告。
6. 真实 Story 接管验收与回滚演练报告。

只有文档与运行两类验收均通过，且 SpecLite 已成为唯一活动 writer，才能宣布正式切换完成。旧文档与 BMAD 入口的最终清理另行决定。

## 11. 证据入口（Evidence References）

以下链接用于重新定位原评估涉及的文件，不固定其未来内容。实施时必须重新绑定 HEAD、文件 hash 与验证输出。

| 证据 | 核对重点 |
| --- | --- |
| [Sprint tracker](../implementation-artifacts/sprint-status.yaml) | Epic/Story 状态、依赖顺序、`story_location` |
| [PRD index](prd/index.md) | 分片声明与跨 subject 导航 |
| [Epics index](epics/index.md) | 活动 Epic corpus；原评估中的 12/13 包含工作区规划 |
| [Story candidates](story-candidates-2026-09-13.md) | SPEC 09 和平台 hook 收口来源 |
| [SPEC 09](specs/09-sdlc-workflow-lifecycle-contract.md) | artifact roots、Flow Gate、历史基线与 no-migration |
| [当前 runtime 配置](../../_speclite/config.toml) | base roots 与旧目录桥接 |
| [artifact-root resolver](../../src/config/artifact-root-resolver.ts) | 七类 roots、provenance、`contractRefs` |
| [Flow Gate evaluator](../../src/hooks/flow-gate-enforcement.ts) | 配置读取、gate 判定 |
| [canonical hook runner](../../assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs) | 实际配置与 metadata 消费 |
| [Workflow Artifact Layout](../../docs/reference/workflow-artifact-layout.md) | 标准目录、producer/consumer、discovery 规则 |
| [Runtime Layout](../../docs/reference/runtime-layout.md) | 安装投影、索引、hooks 与所有权 |
| [公共规范入口](../../docs/reference/specs/index.md) | 公共规范与过程文档的职责 |
| [SDLC catalog](../../assets/source/speclite/sdlc-skills/module-help.csv) | 接管入口及产物位置 |
| [CR runner](../../assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/SKILL.md) | strict-serial、证据身份、closeout 与状态同步 |

平台行为在实施时对照 [Codex Hooks](https://learn.chatgpt.com/docs/hooks) 和 [Claude Code Hooks](https://code.claude.com/docs/en/hooks) 核验，并记录实际平台版本与执行证据。
