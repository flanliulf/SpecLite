---
Story: 11-6
Round: 1
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-6-code-review-summary-20260904-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-6 的第 1 轮 CR 代码审查结果（首轮）进行逐条独立评估。Reviewer 汇总的 7 个 P1 均由 current source、Story AC 或 executable evidence 直接支持；Finding #8 也有效，但它是 inactive duplicate source 的维护漂移，不构成当前 active producer/consumer blocker，应作为 P2 交 CR05 登记。

本轮总体结论为 **FAIL**：7 个 P1 全部阻塞交付，不能进入 CR04、CR05 或 CR06。Finding #3 原标记为 `DECISION_NEEDED`，但现有 owning contract 已能唯一推出修复规则，因此 **不需要 Owner Gate**：已存在的 legacy supporting HTML 必须原位选择和继续使用；缺失的 supporting HTML 属于本次新创建 artifact，必须写入 AC2 / FR23d 规定的 canonical `{planning_artifacts}/ux/` exact path。该规则同时满足 legacy no-migration 与 new-artifact canonical-only，不授权创建新的 legacy supporting artifact。

Fixer 获得一次性修复 Findings #1–#7 的授权；Finding #8 不得夹带修复。修复后必须以 executable behavior fixtures 证明 fresh/canonical/legacy/coexistence、supporting-path selection、fail-close、local references、三空间边界与 zero-mutation，而不是继续以 corpus `toContain` 代替行为证据。

---

## 发现 #1 评估

### 审查原文

> **[P1] Fresh 创建 canonical 主文档后 `actualConsumedPath` 仍为 `null`**
> - 来源：blind + edge + auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`step-01-init.md:37-45` 在 fresh 分支记录 `actualConsumedPath: null`；同文件 `85-97` 随后创建 canonical 主文档，却没有把状态回填为该 project-relative POSIX path。`step-02-discovery.md:153-158` 又直接把 `{actualConsumedPath}` 作为 append 与 frontmatter 更新目标。Story AC8 明确要求 discovery evidence 记录 `actualConsumedPath`（Story `:20`），不是允许执行时依赖括号中的默认路径猜测。

**严重性判断：合理**

该缺口使 fresh workflow 在创建后仍携带空目标，影响实际写入、进度更新和 completion reporting，直接违反 AC2、AC5、AC8、AC10，属于功能阻塞 P1。

**修复建议：可行**

仅在 canonical 文件成功创建并完成初始 frontmatter 写入后，将 `actualConsumedPath` 原子地回填为 `{planning_artifacts}/ux/ux-design-specification.md` 的 project-relative POSIX path；在此之前保持 `null`。增加 executable fresh fixture，断言创建前后状态转换、后续 append target 与 evidence 一致。

**误报评估：非误报**

当前 source 没有任何实际回填步骤；“canonical default”文案不能替代状态转换。

---

## 发现 #2 评估

### 审查原文

> **[P1] Existing canonical 文件缺少 `stepsCompleted` 时会进入 fresh copy 分支**
> - 来源：blind + edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`step-01-init.md:39-43` 先把现存 canonical/legacy 主文档选为 `actualConsumedPath`，`49-53` 仅在存在 `stepsCompleted` 时进入 continuation；紧接着 `55-57` 把“document exists but no `stepsCompleted`”与真正不存在文件合并为 fresh setup，并在 `85-88` 要求向 canonical path copy template。没有 non-overwrite、structured recovery 或 zero-mutation branch。

**严重性判断：合理**

该控制流可能覆盖或碰撞用户已有 canonical artifact；即使底层 copy 偶然拒绝覆盖，也只会产生未治理异常。对 existing workflow-owned artifact 的内容完整性风险构成交付阻塞 P1。

**修复建议：可行**

将状态明确拆成三类：不存在才允许 fresh create；存在且 workflow frontmatter 有效才 continuation；存在但 `stepsCompleted` 缺失或无效则 fail closed，输出可恢复说明并保持 artifact、workflow status 与 progress 零变更。复用现有 artifact-path diagnostic source，不新增 stable issue ID。

**误报评估：非误报**

当前判断条件和后续 copy 目标构成可达的覆盖/冲突路径。

---

## 发现 #3 评估

### 审查原文

> **[P1] Legacy main continuation 未绑定 supporting HTML 的 selected paths**
> - 来源：blind + edge
> - 分类：decision_needed

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级；无需 Owner Gate）

### 评估分析

**问题描述准确性：准确**

`workflow-details.md:59-73` 只声明 canonical `color_themes_file` / `design_directions_file`，并要求 legacy main continuation 发现 legacy sibling；但 discovery state 只有 `actualConsumedPath`。`step-08-visual-foundation.md:187-192`、`step-09-design-directions.md:65-80,187-192` 仍无条件写 canonical supporting HTML，`step-14-complete.md:65-80,167-171` 也无条件报告 canonical supporting paths。因此，现存 legacy sibling 没有 selected-path evidence，报告可能与实际继续使用的 artifact 分叉。

**严重性判断：合理**

selected main、supporting HTML、cross-document links 与 completion reporting 不一致，会破坏 AC2、AC5、AC6、AC8、AC10；P1 合理。

**修复建议：可行，且现有 contract 已唯一决定策略**

无需请求 Owner 决策。Owning evidence 的组合已经排除歧义：

- Epic Story AC2 要求 workflow 创建的三个核心 artifact 默认输出到 canonical `ux/` exact paths（Epic `:478-486`）；FR23d 也规定 `{planning_artifacts}/ux/` 承载三个文件（requirements inventory `:61`）。
- Epic Story AC4 要求新 UX workflow-owned artifact 不得落回 Planning root（Epic `:496-501`）。
- Epic Story AC8 只保护 **existing legacy artifacts** 原位可发现且不迁移（Epic `:523-528`）；Create UX ZH/EN entrypoint也明确区分“new artifacts写canonical”与“existing legacy artifacts原位继续”（`SKILL.md:17` / `SKILL.en.md:17`）。

因此必须采用以下 deterministic matrix：

1. canonical main 存在：选择 canonical main 与 canonical supporting paths；legacy main/siblings 全部不触碰。
2. 仅 legacy main 存在，legacy sibling 已存在：为对应 sibling 记录 project-relative `actualColorThemesPath` / `actualDesignDirectionsPath`（或语义等价字段）并原位使用，不复制、不迁移、不覆盖。
3. 仅 legacy main 存在，某 sibling 缺失：缺失项是 **new artifact**，必须选择相应 canonical `{planning_artifacts}/ux/<exact-basename>`；不得在 Planning root 新建 legacy sibling。已存在的另一 sibling仍原位使用。
4. main 与 sibling 的 selected paths 分处两个目录时，links/navigation 必须按各 containing directory 计算，completion report 必须报告各自真实 selected path。

这不是新增产品决策，而是对 AC2/AC4 的 new-write rule 与 AC8 的 existing-only exception 做机械合取。应补齐 legacy main + 2 siblings、partial siblings、main only、canonical+legacy coexistence fixtures，并断言 selected paths、hash boundary、reporting 与 cross-document links。

**误报评估：非误报**

问题成立；只是 Reviewer 对“missing sibling 是否需要 Owner 决策”的保留可以由现有 contract 消解，因此从 `decision_needed` 转为 authorized patch。

---

## 发现 #4 评估

### 审查原文

> **[P1] UX discovery 未对 resolver failure 与 candidate final type/readability 定义统一 fail-close**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`resolveArtifactRoots()` 的结果类型明确包含 `ok`、`roots` 和 `issues`（`src/config/artifact-root-resolver.ts:47-52`），且实现会因 normalization 或 symlink failure 跳过单个 root，最终在 `:190-194` 返回 `ok=false`。Create UX activation却在 `workflow-details.md:41-46` 直接消费 `planning_artifacts.resolvedRoot`，没有先要求 `ok=true`、无 blocking issue且 Planning root唯一存在。`step-01-init.md:37-45` 的 candidate guard也只描述 project boundary；`resolveProjectRelativePath()`（`src/fs/path-normalizer.ts:81-105`）仅做 lexical containment，不能证明 candidate 是 readable regular file或安全 symlink target。

现有 Story 11.5 shared implementation已经展示可复用模式：canonical entry先做 `lstat`、readability、`realpath` containment与dereferenced regular-file检查（`src/config/artifact-document-discovery.ts:102-161,465-529`）。Finding要求复用模式，而不是新增 UX-local root resolver。

**严重性判断：合理**

无 Planning root或invalid/non-regular candidate继续执行，会导致错误 fallback、raw filesystem failure、越界读取或部分 mutation，直接违反 AC8/AC10 与 project-boundary要求，P1合理。

**修复建议：可行**

在任何 read/write/frontmatter/progress mutation 前建立单一 gate：resolver `ok=true`、无 blocking issues、且恰有一个 Planning root；否则透传/复用resolver diagnostic并 halt，空消费、零 artifact write、零 progress mutation。canonical/legacy main与supporting candidates须经 portable path、`lstat`、readability、`realpath` project containment和dereferenced regular-file检查；unsafe symlink复用 `artifact-path.symlink-escape`，其它缺失/无效状态复用现有 artifact-path diagnostic family或内部稳定 reason，不新增 UX-local root resolver、public schema或 stable issue ID。

**误报评估：非误报**

文本 contract 没有前置 gate，generic lexical helper也不覆盖final filesystem type/readability。

---

## 发现 #5 评估

### 审查原文

> **[P1] Local-reference boundary 未在 single percent-decode 后校验**
> - 来源：edge + auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`workflow-details.md:72` 与 Steps 8/9 仅要求 relative resolution + normalize + boundary guard，没有定义 URI decoding 顺序。`normalizeProjectRelativePosixPath()`（`src/fs/path-normalizer.ts:64-79`）不会 percent-decode；因此 encoded traversal能在 lexical检查时保留为普通segment。当前 `test/ux-artifact-routing.test.ts:135-146` 只验证 literal inside path 与 literal `../../outside.css`，没有解析真实 Markdown/HTML destination。

Story 11.5 已实现 bounded Markdown grammar及正确的 `strip query/fragment -> decodeURIComponent once` 顺序（`src/config/artifact-document-discovery.ts:540-678`），可抽取或复用相关 shared helper；不需要引入完整 browser/Markdown parser或依赖升级。

**严重性判断：合理**

浏览器/renderer single-decode后的路径可逃逸project root，直接违反AC6及安全边界，P1合理。

**修复建议：可行**

实现 bounded、dependency-free local-reference helper/harness，至少覆盖 inline及reference-style Markdown local links、HTML `href`/`src`：parse → strip query/fragment → decode exactly once → portable normalization → relative to containing artifact directory → project containment → symlink containment/readability（读取目标时）。Malformed percent encoding、absolute/drive/backslash/network或其它unsupported local-ish forms fail closed；明确external schemes不作为local artifact读取。不要实现完整CommonMark、DOM或browser URL engine。

Required fixtures至少包括：query/fragment、single decode、double-encoded文本不发生第二次decode、encoded traversal/separator、malformed encoding、containing-directory cross-document links、Markdown reference-style、HTML `href`/`src`、asset与symlink escape。

**误报评估：非误报**

Reviewer已有最小复现，current helper和focused test均未覆盖decode后的语义路径。

---

## 发现 #6 评估

### 审查原文

> **[P1] Story 范围内的 config examples 仍陈述旧三-root defaults**
> - 来源：blind
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer列出的六个 `config.toml.example` 均只包含 `planning_artifacts`、`implementation_artifacts`、`project_knowledge=docs`，并自述为runtime field-structure/reference，而非existing legacy示例。例如 Create UX `config.toml.example:7-15` 与 Readiness `:7-15`。Canonical registry明确定义七个 fields及phase-aligned defaults（`src/config/artifact-root-resolver.ts:54-107`），module metadata也逐项声明它们（`module.yaml:35-68`）。

**严重性判断：合理**

用户复制这些 active package examples会创建显式 legacy配置，resolver必须把它视为authoritative explicit config；这与Story AC7“同步 examples、不遗留旧 active default”（Story `:19`；Epic `:516-521`）正面冲突，P1合理。

**修复建议：可行**

只更新Reviewer列出的六个Story-scope producer/consumer package examples。`core.brainstorming_artifacts`使用`{project-root}/_speclite-output/0-brainstorming-artifacts`；`modules.sdlc`包含 `analysis_artifacts`、`planning_artifacts`、`solutioning_artifacts`、`implementation_artifacts`、`devops_artifacts`、`project_knowledge`，值与 current fresh defaults一致。增加六文件exact parity与旧三-root negative scan；不得全库批量重写其它Skill example。

**误报评估：非误报**

文件定位、字段缺失和current canonical defaults均可直接复核。

---

## 发现 #7 评估

### 审查原文

> **[P1] AC10 的 legacy、links/assets 与三空间行为没有可执行证据**
> - 来源：blind + auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/ux-artifact-routing.test.ts:89-133` 的legacy case只创建一个文件、调用artifact-root resolver、搜索prompt文本并比较该文件自身hash；它没有执行 canonical-first/legacy fallback、supporting sibling selection或install/update/repair路径。`:135-146` 只直接调用generic lexical guard。`:148-217` 主要验证文本包含与negative regex。因此目前 `6/6` green无法捕获Findings #1–#5。Completion gate却在 `:31-33` 声明legacy main/siblings selection、links与assets均已通过，证据强度不足。

**严重性判断：合理**

AC10明确要求fixtures覆盖三个exact files、links/assets、legacy discovery及`ux/`、`docs/`、`{project_knowledge}`边界（Story `:22`；Epic `:536-540`）。缺少行为fixture意味着核心验收未被证明，属于质量门禁P1。

**修复建议：可行**

以最小 internal helper或等价executable harness覆盖AC明确行为；不要把任务扩展成完整workflow engine。测试必须实际调用同一 discovery/reference logic，并证明：

- fresh创建后`actualConsumedPath`回填且append target正确；
- canonical、legacy、coexistence及legacy sibling全量/partial/missing矩阵；
- existing invalid frontmatter、resolver blocking、directory/dangling symlink/non-regular/unreadable candidate全部fail closed且zero mutation；
- real Markdown/HTML local references、assets、single-decode、containing-dir、symlink与cross-document navigation；
- Planning UX、Public Docs `docs/`、Project Knowledge三空间允许/禁止矩阵；
- install/update/repair不迁移legacy tree，使用tree/content hashes验证；
- 六个config examples七root parity。

修复通过后，completion gate中的相关evidence必须由root/Flow Gate owner按真实结果刷新；Code Fixer本轮不应自行把旧gate文案当成通过证据。

**误报评估：非误报**

现有测试的断言对象与AC行为之间存在明确断层。

---

## 发现 #8 评估

### 审查原文

> **[P2] Shipped inactive Architecture duplicate step仍含 `*ux-design*.md` wildcard**
> - 来源：auditor
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

`assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/steps/step-01-init.md:59-75` 仍保留generic UX wildcard；但active ZH/EN entrypoints激活的是 `references/steps/step-01-init.md`。因此该duplicate目前没有证据影响active Architecture consumer，却确实是shipped source drift。

**严重性判断：合理**

P2合理：它可能导致未来误激活或维护混淆，但不是current active producer/consumer路径，也不推翻AC9当前active negative scan。

**修复建议：可行但本轮不授权**

由CR05登记为TODO，后续在duplicate source ownership明确时处理。不得借Story 11.6删除duplicate、重构Architecture workflow或把它夹带进P1 Fixer scope。

**误报评估：非误报**

文件确实shipped且内容漂移；仅其优先级和处置为非阻塞defer。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | fresh创建后`actualConsumedPath`未回填 | P1 | **P1** | fresh后续写入目标不确定。 |
| 2 | existing canonical无`stepsCompleted`可能进入copy | P1 | **P1** | 存在覆盖/冲突与非结构化失败风险。 |
| 3 | legacy supporting HTML没有selected paths | P1 | **P1** | 现有contract已唯一决定，无Owner Gate。 |
| 4 | resolver/candidate未统一fail close | P1 | **P1** | invalid root或non-regular candidate可能继续并产生mutation。 |
| 5 | local reference未按single-decode后校验 | P1 | **P1** | encoded traversal可越出project root。 |
| 6 | 六个config examples仍为旧三-root | P1 | **P1** | 直接违反AC7并诱导显式legacy配置。 |
| 7 | AC10缺少executable behavior evidence | P1 | **P1** | 当前green tests无法证明核心behavior。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 8 | inactive Architecture duplicate仍含UX wildcard | P2 | **P2** | shipped drift有效，但不在active路径；CR05登记。 |

### 可忽略（误报）

无。

### Owner Gate（Owner 门禁）

- **结论：不需要 Owner Gate。** Finding #3 可由 AC2/AC4 的new-write canonical rule与AC8的existing-only legacy protection唯一推出。
- **禁止的替代策略：** legacy main continuation时，不得为缺失sibling在Planning root创建新的legacy artifact；这会违反FR23d/AC4。不得为已存在legacy sibling创建canonical副本；这会违反AC8 no-copy/no-migration。

### Fix Authorization（修复授权）

授权同一个fresh Fixer一次性修复Findings #1–#7，范围仅限：

1. Create UX ZH/EN entrypoints、`references/workflow-details.md`、必要的active step/continuation/completion files，用于状态转换、selected supporting paths、fail-close和bounded reference contract；
2. 复用/抽取现有shared root/path/reference/candidate safety logic所需的最小internal source；允许新增bounded internal UX discovery/reference helper或fixture harness，但不允许新增UX-local artifact-root resolver、public CLI command/schema、stable issue ID或依赖；
3. `test/ux-artifact-routing.test.ts`及必要的bounded test fixtures/helper tests，用于上述executable matrix；
4. Reviewer明确列出的六个`config.toml.example`，仅同步七root field/default parity；
5. 若canonical source hash变化导致生成态不一致，仅允许刷新对应packaging manifest/generated evidence；不得借此吸收drawer、mirrors或fixed-count修复。

不授权修改Story、PRD、Epic、SPEC 07/09、sprint tracker、既有CR summary、CR rules/TODO、11.7+、inactive Architecture duplicate、drawer package/zip、`.agents`/`.claude` mirrors或fixed-count baselines。Evaluation文件只允许由Fixer追加规范的fix record，不得改写本评估裁决。

### Required Verification（必需验证）

Fixer至少必须提供：

- focused UX executable suite：fresh/canonical/legacy/coexistence、legacy sibling full/partial/missing、invalid frontmatter、actual selected paths与completion reporting；
- root/candidate negative matrix：resolver `ok=false`/Planning root missing、directory、dangling symlink、in-bound symlink→non-regular、out-of-bound symlink、unreadable candidate，均断言halt、空消费、零artifact write与零progress mutation；
- local-reference matrix：Markdown inline/reference-style、HTML `href`/`src`、query/fragment、single/double encoding、malformed encoding、encoded traversal/separator、containing-directory、cross-document、asset、external scheme与symlink；
- 三空间矩阵：`{planning_artifacts}/ux/`、`docs/`、`{project_knowledge}`的allowed/forbidden targets；
- install/update/repair legacy no-migration tree/content hashes；
- 六个scope config examples七rootexact parity与old-default negative scan；
- affected tests、build、docs、canonical normal/strict、packaging（如manifest需刷新）和`git diff --check`；full suite结果须把external drawer fixed-count drift与本Story regression分开报告。

### Scope Boundary（范围边界）

- Finding #5只要求bounded local-reference subset，不是完整CommonMark/HTML/browser parser项目。
- Finding #7只补AC10明确行为，不建立通用workflow execution framework。
- Finding #8只进入CR TODO，不得在本轮Fixer中处理。
- external `speclite-drawer-er-modeler`、zip、mirrors与由其引起的fixed-count drift继续隔离。

### 评估决定

- **发现 #1**：确认有效，P1 patch。
- **发现 #2**：确认有效，P1 patch。
- **发现 #3**：确认有效，P1 patch；现有contract已唯一决定，Owner Gate=`NONE`。
- **发现 #4**：确认有效，P1 patch；复用shared resolver/path/candidate safety，不新增UX-local root resolver/taxonomy。
- **发现 #5**：确认有效，P1 patch；复用/抽取bounded parser，禁止完整parser扩面。
- **发现 #6**：确认有效，P1 patch；只改六个scope examples。
- **发现 #7**：确认有效，P1 patch；行为fixtures必须能捕获#1–#5。
- **发现 #8**：确认有效，P2 defer；CR05登记。
- **Overall**：`FAIL`。
- **Next**：fresh Fixer修复#1–#7并追加fix record；随后必须进入fresh Reviewer Round 2与fresh Evaluator Round 2，二者均PASS后才允许CR04/CR05/CR06。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 7
- **Result**: Findings #1–#7 已按本评估授权完成；Finding #8 保持未修复并留待 CR05。

### Fix Results（修复结果）

| Finding | Result | Targeted implementation and evidence |
|---|---|---|
| #1 fresh `actualConsumedPath` | fixed | 新增 internal `resolveUxArtifactRoute()` / `bindCreatedUxMain()` executable contract。Fresh route 在创建前保持 main/append target 为 `null`；canonical main 与有效 `stepsCompleted` frontmatter 成功落盘并 re-probe 后，回填同一 project-relative POSIX canonical path。Fixture 实际断言 create 前后状态转换和 append target。 |
| #2 invalid existing workflow state | fixed | Canonical-first 与 legacy fallback 均把 existing main 的缺失、空或非整数 `stepsCompleted` 视为 `workflow-frontmatter-invalid` structured recovery；返回 `continuation=block`、空 consumption/append target，并以 tree/content snapshot 证明零覆盖、零 progress mutation。Fresh 分支现在只对两个 main 均不存在时可达。 |
| #3 legacy supporting selected paths | fixed | Routing matrix新增 `actualColorThemesPath` / `actualDesignDirectionsPath`。Canonical main始终选择canonical supporting paths；legacy main对每个已存在legacy sibling原位选择，对缺失sibling只选择canonical `ux/` exact path。Steps 8/9/14与continuation/completion reporting均使用selected paths，并按各containing directory解析cross-document references。Full/partial/missing/coexistence fixture全部执行。 |
| #4 root/candidate fail-close | fixed | 直接消费shared `ArtifactRootResolutionResult`，要求`ok=true`且恰有一个Planning root；未新增UX-local root resolver或stable issue ID。Main和supporting candidates统一执行portable path、`lstat`、readability、`realpath` project containment与dereferenced regular-file gate。Directory、dangling symlink、in-bound symlink→directory、out-of-bound symlink、unreadable和resolver blocked/missing均halt、空消费、零mutation。 |
| #5 bounded local references | fixed | 新增dependency-free `validateUxLocalReferences()`，覆盖Markdown inline/reference-style与quoted/unquoted HTML `href`/`src`；严格执行parse → strip query/fragment → single decode → encoded-separator/local-ish guard → containing-directory resolution → lexical/realpath containment → readable regular-file。Fixtures覆盖single/double encoding、malformed、undefined、literal/encoded traversal、encoded separator、absolute/drive/backslash/network、asset、cross-document、external scheme与symlink escape。未扩展为完整CommonMark/DOM/browser parser。 |
| #6 six config examples | fixed | 仅同步评估列出的Create UX、Readiness、Architecture、Epics、Correct Course、Create Story六个`config.toml.example`：`core.brainstorming_artifacts`及SDLC六fields均与current seven-root fresh defaults exact parity；executable parity与legacy three-root negative scan通过。 |
| #7 AC10 executable evidence | fixed | `test/ux-artifact-routing.test.ts`由6个主要为文本断言的cases扩展为33个behavior cases，直接调用同一internal route/reference helpers；覆盖fresh/canonical/legacy/coexistence、supporting matrix、invalid state、root/candidate安全、links/assets、三空间ownership和install/update/repair legacy no-migration hashes。 |

### Files Changed（变更文件）

- 新增：`src/config/ux-artifact-routing.ts`。
- 更新：`test/ux-artifact-routing.test.ts`。
- 更新Create UX active contract：`references/workflow-details.md`、`references/steps/step-01-init.md`、`step-01b-continue.md`、`step-08-visual-foundation.md`、`step-09-design-directions.md`、`step-14-complete.md`。
- 更新六个明确授权的`config.toml.example`。
- D1最小同步：`docs/reference/workflow-artifact-layout.md`。
- D0 generated evidence：`release/packaging-manifest.json`由packaging check刷新；未手工编辑manifest。

### Verification（验证）

- Focused：`npm test -- --run test/ux-artifact-routing.test.ts` → **1 file / 33 tests passed**。
- Affected：UX、artifact roots、artifact documents、config initialization、update planning、ownership → **6 files / 191 tests passed**。
- Build：`npm run build` → PASS。
- Docs：`npm run docs:check` → **72 Markdown files / 5 drafts**，PASS。
- Packaging：`npm run release:packaging-check` → PASS。
- Canonical checker：warn与strict均`status=ok`、`findings=[]`；current counts为`core=19`、`sdlc=50`、`defaultInstall.total=69`。
- Density：六个changed package roots均无`triggered_density_warning`。
- Diff hygiene：`git diff --check` → PASS。
- Full：`npm test` → **60 files passed / 5 files failed；624 tests passed / 12 failed / 4 todo**。12个失败全部是既存external untracked `speclite-drawer-er-modeler`令固定断言从`core=18,total=68`漂移到`core=19,total=69`；focused/affected无Story 11.6 regression。Fixer未修改drawer package/zip、`module-help.csv`、fixed-count baselines或IDE mirrors。

### Governance Decisions（治理决策）

| Surface | Decision | Reason | Evidence |
|---|---|---|---|
| `canonical-source-truth` / `module-discovery-contract` (`D0`) | updated / verified | 本轮修改existing SDLC package内容但未新增、删除或重命名package root；六examples、active contract、tests与generated release evidence定点同步。 | canonical warn+strict均`status=ok/findings=[]`；density与packaging PASS。 |
| `current-public-docs` (`D1`) | updated | Legacy supporting selection、selected-path evidence与fail-close是current用户行为，需在current layout reference显式可见。 | `docs/reference/workflow-artifact-layout.md` UX row；`docs:check` PASS。 |
| `living-legacy-reference` (`D2`) | skipped | 本轮没有改变legacy mapping/maintenance ownership；current workflow与public layout已完整承载原位继续和missing-sibling canonical-only规则，改legacy mapping会扩面。 | scoped diff + current workflow/public doc。 |
| `frozen-historical-record` (`D2`) | historical snapshot | 既有PLAN/EXPERIMENTS/handoff记录保留当时事实，不用current测试数字静默重写。 | scope audit未修改历史记录。 |

### Scope Audit（范围审计）

- Finding #8 inactive Architecture duplicate未修；保留给CR05。
- 未修改Story、tracker、kickoff/completion gates、Reviewer summary、CR rules/TODO、11.7+、drawer/zip、`.agents`/`.claude` mirrors或fixed-count baselines。
- 未新增public CLI、schema、dependency、stable issue ID或UX-local root resolver。
- 无新Owner blocker；下一步必须由fresh Reviewer Round 2与fresh Evaluator Round 2复审复评。
