# Story 8.9: CLI Human Output Scan-Friendly Layout And Color（CLI 人类输出可扫描布局与颜色）

Status: done

<!-- Corrective follow-up Story: Story 8.8 已完成 profile、路径安全、empty state 和 raw step 双写收敛；本 Story 将 Sally 的完整 UX layout 建议写成可验收实现门。 -->

## Story（故事）

作为 CLI 用户和 SpecLite 维护者，
我希望 human-readable output 在保留 outcome-oriented profile 的同时，使用 bullet、缩进分组、steps count、Evidence 层级、Next Actions 标签和受控 ANSI color，
以便用户能在 3 秒内判断这是安全预览还是已写入、目标是谁、为什么停住、下一步该复制哪条命令。

## Acceptance Criteria（验收标准）

1. **Install prewrite output matches scan-friendly layout（Install 写入前预览匹配可扫描布局）**
   **前提** 用户从 `/Users/fancyliu/Repos/SpecLite` 或其他非 target cwd 执行 `speclite install /Users/fancyliu/Repos/noi`，且未传入 `--yes`；
   **当** 输出 `prewrite-paused` human result；
   **则** section 顺序必须保持 `Summary（摘要）`、`Scope（范围）`、`State（状态）`、`Evidence（证据）`、`Issues（问题）`、`Next Actions（下一步）`；
   **并且** section 之间保留空行，section 内所有用户可读事实必须用 `- ` bullet 或 `  - ` nested bullet 表达，不得继续输出无缩进的正文行、孤立小标题或 key-value dump。

2. **Summary and Scope use bullets with execution context（摘要与范围使用 bullet 并暴露执行上下文）**
   **前提** 渲染 `install` prewrite summary；
   **当** 输出 `Summary（摘要）`；
   **则** 必须以 bullet 展示 `完成状态`、`写入状态`、`用户动作`、`ready 状态` 和 `当前含义`；
   **并且** `当前含义` 必须明确表达安全预览已完成、尚未执行安装写入。
   **前提** 渲染 `Scope（范围）`；
   **当** target 是绝对路径或跨目录相对路径；
   **则** 必须以 bullet 展示 `目标项目`、`目标路径`、`项目根目录`、`命令执行目录`；
   **并且** `目标路径` 与 `命令执行目录` 不得泄漏到 JSON output。

3. **State shows counts and nested steps（状态展示数量和嵌套 steps）**
   **前提** `completedSteps` 或 `pendingSteps` 需要在 human output 中展示；
   **当** 渲染 `State（状态）`；
   **则** `已完成 steps` 与 `待处理 steps` 必须先展示数量或 `无`；
   **并且** 非空 step list 必须用 nested bullet 逐项列出 stable step id。
   **前提** 输出 manifest version 或 IDE target status；
   **当** 使用默认 human-readable mode；
   **则** 不得输出 `manifestVersion=...`、`sourceType=...; resolvedRoot=...` 这类 raw dump；
   **并且** 应使用本地化 label，例如 `manifestVersion：speclite.manifest.v1` 和 `IDE 目标状态：无`。

4. **Evidence is grouped hierarchically（证据按层级分组）**
   **前提** `install` 输出 source descriptor、external access 和 authorization；
   **当** 渲染 `Evidence（证据）`；
   **则** 必须按所属语义分组：
   `来源：bundled` 下缩进展示 `resolvedRoot`、`trustStatus`、`evidence`；
   `外部访问：未请求` 作为同级 bullet；
   `授权状态：...` 作为同级 bullet；
   **并且** 不得要求用户跨多个孤立 heading 拼接 source、external access 和 authorization 的含义。

5. **Issues empty state is friendly and self-contained（问题空状态友好且自包含）**
   **前提** human output 无 blocker、warning、info 或其他 issues；
   **当** 渲染 `Issues（问题）`；
   **则** 必须输出 `- 无问题：未发现 blocker、warning 或 info。` 或等价中文友好提示；
   **并且** 不得输出空 section、独立 `Empty State（空状态）` section，或把 `未写入项目文件` 放入 `Issues` 中。

6. **Next Actions have action labels and path-safe commands（下一步具有动作标签和路径安全命令）**
   **前提** `install` 输出默认安装与自定义安装建议；
   **当** target 为 `/Users/fancyliu/Repos/noi`；
   **则** `Next Actions（下一步）` 必须使用可扫描动作标签：
   `- 默认安装：运行 \`speclite install /Users/fancyliu/Repos/noi --yes\``；
   `- 自定义安装：运行 \`speclite install /Users/fancyliu/Repos/noi --yes --interactive\``；
   **并且** 不能提示 `speclite install noi --yes`。
   **前提** command 因 blocker 停止；
   **当** 输出 `Next Actions（下一步）`；
   **则** blocker 修复动作必须排在授权写入命令之前，且仍保留动作标签。

7. **Color is implemented as guarded scan enhancement（颜色作为受控扫描增强实现）**
   **前提** renderer 在 TTY 环境中输出 human-readable text；
   **当** `NO_COLOR` 未设置、`CI` 未设置、`options.noColor !== true` 且 `options.isTty !== false`；
   **则** 可以启用少量 ANSI style：section title 使用 bold，`Outcome` 按状态使用标准 8/16 色，`Next Actions` 命令使用 cyan 或 bold；
   **并且** 颜色不得承担唯一语义，移除 ANSI 后文本必须完整可读。
   **前提** `NO_COLOR=1`、CI、non-TTY、docs 示例、fixture 或 `--json` 输出；
   **当** 渲染相同 command；
   **则** 不得包含 ANSI escape。

8. **Color palette is terminal-theme safe（颜色方案兼容不同终端主题）**
   **前提** 实现 ANSI color helper；
   **当** 选择 outcome / severity / command color；
   **则** 只能使用标准 ANSI 8/16 色与 bold，不得使用 truecolor、256 色、背景色、dim text、低对比灰色或依赖浅色/深色主题的色块；
   **并且** outcome color map 必须至少覆盖：
   `ready` / `valid` 为 green；
   `prewrite-paused` / `plan-ready` 为 cyan 或 blue；
   `blocked-before-write` / `invalid` / failure 为 red；
   warning / partial 状态为 yellow。

9. **Color dependency decision is explicit（颜色依赖决策明确）**
   **前提** 实现 ANSI color helper；
   **当** 选择第三方依赖；
   **则** 必须引入 `picocolors@1.1.1` 作为 production dependency，并同步更新 `package.json` 与 `package-lock.json`；
   **并且** 不得引入 `chalk`、`colorette`、`strip-ansi` 或其他 terminal style runtime/test dependency，除非先更新本 Story 或新增 ADR 说明替换理由。
   **前提** renderer 需要使用颜色能力；
   **当** 编写实现代码；
   **则** 只有集中 ANSI helper 可以直接 import `picocolors`；
   **并且** command renderer、message catalog、test fixture 和 docs 示例不得直接调用 `picocolors` API。

10. **Shared layout helpers are reusable without broad behavior changes（共享布局 helper 可复用且不扩大行为范围）**
   **前提** 实现 bullet、nested bullet、counted list、grouped evidence、labeled next action 或 ANSI helper；
   **当** 修改 `src/diagnostics/output.ts` 或新增等价 presentation helper；
   **则** helper 必须集中定义并被 install renderer 复用；
   **并且** 不得在每个 renderer 中手写散落的 ANSI escape、缩进字符串或重复 formatter。
   **前提** 其他 command renderer 未被本 Story 明确迁移；
   **当** 共享 helper 被引入；
   **则** 不得改变 command core behavior、exit code、issue ordering、JSON contract、path normalization 或 write authorization。

11. **Tests lock exact layout and color guards（测试锁定布局与颜色护栏）**
    **前提** 实现 Story 8.9；
    **当** 运行 focused tests；
    **则** 必须断言 install absolute-target prewrite output 的 `Summary`、`Scope`、`State`、`Evidence`、`Issues`、`Next Actions` section 片段符合 bullet / nested bullet / labels / count 结构；
    **并且** 必须断言无色环境无 ANSI、TTY color 环境有受控 ANSI、本地测试 helper 移除 ANSI 后仍包含完整语义；
    **并且** 必须断言 `renderCommandResultJson()` 不包含 human-only absolute target context 或 ANSI escape。

12. **Interactive install prompts remain scan-friendly and localized（交互式安装 prompt 保持可扫描并本地化）**
    **前提** 用户运行 `npm run dev -- install /Users/fancyliu/Repos/noi --yes --interactive`；
    **当** CLI 输出 `Step 1/4 Select modules（选择模块）`、`Step 2/4 Configure project（配置项目）` 和 `Step 3/4 Final pre-write review（最终写入前复核）`；
    **则** 每个 Step heading 后必须保留空行，section label 与列表项之间也必须保留空行；
    **并且** `Available modules:` 下 `sdlc` 必须展示为 `sdlc: SpecLite SDLC Module 0.0.0`，与 `core: SpecLite Core Module 0.0.0` 的命名模式一致；
    **并且** `Step 2/4 Configure project（配置项目）` 必须把 `quick` 与 `detailed` 展示为可比较列表项，说明适用场景与差异，而不是连续正文句；
    **并且** interactive quick 与 detailed 都必须提示并校验 non-empty `user_name`，不得在 interactive 安装中静默使用 `SpecLite`；
    **并且** `Step 3/4 Final pre-write review（最终写入前复核）` heading 只能出现一次；
    **并且** Step 3 内必须展示 `Config values（配置值）`，包含 project name、user display name、communication/document languages 和 artifact root；
    **并且** Step 3 内 `Selected modules`、`IDE targets`、`Write boundary` 等 section 必须使用默认中文 label，同时保留英文技术标识，例如 `Selected modules（已选模块）`、`IDE targets（IDE 目标）`、`Write boundary（写入边界）`；
    **并且** `Selected modules（已选模块）` 必须展示 `sdlc (SpecLite SDLC Module 0.0.0)`；
    **并且** `IDE targets（IDE 目标）` 必须在 target id 后展示安装目录，例如 `claude (.claude/skills), agents (.agents/skills)`；
    **并且** `Write boundary（写入边界）` 中目录型写入范围必须以 trailing slash 展示，例如 `confirmationWillWrite=_speclite/, _speclite-output/, IDE mirrors, manifest/index`。

## Expected Install Layout（期望 Install 布局）

无色输出必须至少满足以下结构；TTY color 只能在不改变文本的前提下增强 title、outcome 和 command 扫描性：

```text
SpecLite install
Outcome（结果）: prewrite-paused

Summary（摘要）
- 完成状态：已完成
- 写入状态：未写入项目文件
- 用户动作：需要
- ready 状态：not ready
- 当前含义：安全预览已完成；尚未执行安装写入。

Scope（范围）
- 目标项目：noi
- 目标路径：/Users/fancyliu/Repos/noi
- 项目根目录：.
- 命令执行目录：/Users/fancyliu/Repos/SpecLite

State（状态）
- manifestVersion：speclite.manifest.v1
- 已完成 steps：无
- 待处理 steps：8 个
  - source-discovery
  - module-selection
  - config-initialization
  - runtime-structure
  - ide-mirror-creation
  - manifest-generation
  - ready-check
  - ready-summary
- IDE 目标状态：无

Evidence（证据）
- 来源：bundled
  - resolvedRoot：assets/source/speclite
  - trustStatus：blocked
  - evidence：none
- 外部访问：未请求
- 授权状态：source 在写入计划前已处于 blocked 状态。

Issues（问题）
- 无问题：未发现 blocker、warning 或 info。

Next Actions（下一步）
- 默认安装：运行 `speclite install /Users/fancyliu/Repos/noi --yes` 使用默认配置完成安装。
- 自定义安装：运行 `speclite install /Users/fancyliu/Repos/noi --yes --interactive` 进入交互模式自定义安装。
```

## Expected Interactive Install Prompt Layout（期望交互式 Install Prompt 布局）

`install --yes --interactive` 的无色输出必须至少满足以下结构；TTY color 只能增强 heading、outcome 或 command，不得改变文本语义：

```text
Step 1/4 Select modules（选择模块）

在写入任何项目文件前选择 SpecLite official modules。

Available modules:

- core: SpecLite Core Module 0.0.0; scope: ...
- sdlc: SpecLite SDLC Module 0.0.0; scope: ...

Required modules: core.
Default selected modules: core, sdlc.

Step 2/4 Configure project（配置项目）

在写入任何文件前选择项目配置模式。

Config mode options（配置模式选项）

- quick: 要求输入 user_name，并使用 deterministic defaults 生成 project/language/artifact paths；适合接受其余默认值的快速安装。
- detailed: 逐项确认 project fields、selected modules 和 IDE targets；适合需要自定义路径、modules 或 IDE mirrors 的安装。

Write boundary（写入边界）: 此阶段不会写入 _speclite/、_speclite-output/、IDE mirror files、manifest/index files 或 operation locks。
Default mode: quick.

Quick config user_name（快速配置用户显示名）

Quick config user_name: 请输入写入 _speclite/config.user.toml 的用户显示名:

Step 3/4 Final pre-write review（最终写入前复核）

Review state（复核状态）
...

Config values（配置值）
Project name: noi
User display name: Fancyliu
Languages: communication=Chinese, document=Chinese
Artifact root: _speclite-output

Selected modules（已选模块）
core (SpecLite Core Module 0.0.0), sdlc (SpecLite SDLC Module 0.0.0)

IDE targets（IDE 目标）
claude (.claude/skills), agents (.agents/skills)

Write boundary（写入边界）
confirmationWillWrite=_speclite/, _speclite-output/, IDE mirrors, manifest/index
```

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Add shared presentation primitives（AC: 1, 3, 4, 6, 10）
  - [x] 在 `src/diagnostics/output.ts` 或新增 `src/diagnostics/presentation-format.ts` 中集中定义 `bullet`、`nestedBullet`、`labelValueBullet`、`countedList`、`groupedEvidence` 和 `labeledCommandAction` helper。
  - [x] helper 必须处理 `zh-CN` 与 `en-US` label separator，不得破坏技术标识，例如 `manifestVersion`、`resolvedRoot`、`trustStatus`、step id、path 和 command。
  - [x] 保持 `PresentationFrameInput` profile 机制，不回退到 Story 8.8 之前的固定 section 顺序。

- [x] Task 2: Migrate install prewrite layout to bullets and hierarchy（AC: 1-6）
  - [x] 将 `Summary（摘要）` 的完成状态、写入状态、用户动作、ready 状态和当前含义改为 bullet。
  - [x] 将 `Scope（范围）` 改为 bullet，并按 `目标项目`、`目标路径`、`项目根目录`、`命令执行目录` 输出。
  - [x] 将 `State（状态）` 改为 bullet，`completedSteps` / `pendingSteps` 使用数量与 nested bullet；IDE targets 使用 `无` 或 nested list。
  - [x] 将 `Evidence（证据）` 改为 grouped bullet，避免 `sourceType=...; resolvedRoot=...` 这类 raw dump。
  - [x] 将 `Issues（问题）` 空状态改为友好提示，保留无独立 `Empty State`。
  - [x] 将 `Next Actions（下一步）` 改为 `默认安装` / `自定义安装` 标签，保留 path-safe target。

- [x] Task 3: Add guarded ANSI style helper with picocolors（AC: 7, 8, 9, 10）
  - [x] 执行 `npm install picocolors@1.1.1 --save`，把 `picocolors` 作为 production dependency 写入 `package.json` 与 `package-lock.json`。
  - [x] 新增集中 ANSI helper，例如 `src/diagnostics/ansi-style.ts` 或等价模块；该 helper 是唯一允许直接 import `picocolors` 的位置。
  - [x] helper 接收 `HumanOutputOptions` 与环境状态，统一判断 `NO_COLOR`、CI、non-TTY、`options.noColor`、`options.isTty`。
  - [x] section title 只使用 bold；outcome/severity/command 只使用标准 ANSI 8/16 色；禁止 background、dim、truecolor 和 256 色。
  - [x] 所有 renderer 通过 helper 获取 style function，不直接拼接 escape code。
  - [x] 不引入 `chalk`、`colorette`、`strip-ansi` 或其他 terminal style dependency；测试中的 ANSI 去除使用本地小 helper。

- [x] Task 4: Preserve contracts and non-color outputs（AC: 2, 7, 9, 10, 11）
  - [x] 保持 `renderCommandResultJson()` 不变，不新增 public JSON field，不输出 absolute target presentation context。
  - [x] 保持 `NO_COLOR`、CI、non-TTY、docs 示例和 fixture 输出无 ANSI。
  - [x] 保持 command core behavior、write authorization、prompt flow、exit code、issue ordering 和 path normalization 不变。
  - [x] 不引入 spinner-only progress、interactive TUI framework 或 daemon。

- [x] Task 5: Focused tests and docs matrix updates（AC: 1-12）
  - [x] 扩展 `test/install-outcome-human-output.test.ts`，断言 absolute-target prewrite output 的 exact section fragments、bullet、nested step list、step count、Evidence hierarchy 和 labeled Next Actions。
  - [x] 扩展 `test/cli-output-presentation.test.ts` 或新增 `test/cli-human-output-layout.test.ts`，覆盖 shared helper 的无色输出、TTY color 输出、本地 ANSI stripping 后语义完整性。
  - [x] 扩展 `test/cli-human-output-matrix.test.ts`，把 matrix 中 install migration sample 更新为 bullet / hierarchy 结构，并断言 docs 示例无 ANSI。
  - [x] 更新 `docs/reference/cli-human-output-matrix.md`，记录 scan-friendly layout、color policy 和 install sample。
  - [x] 运行 focused tests、`npm run build`、`npm test`、`npm run release:packaging-check` 和 `git diff --check`，或在 Dev Agent Record 中记录真实阻塞。

- [x] Task 6: Lock interactive install prompt readability（AC: 12）
  - [x] 扩展 `test/cli-smoke.test.ts` 覆盖 `install --yes --interactive` 的 Step 1 / Step 2 / Step 3 中文默认输出间距。
  - [x] 断言 `Available modules:` 下 `sdlc` 使用 `SpecLite SDLC Module 0.0.0`，且 final review 中 selected module summary 同步使用 `sdlc (SpecLite SDLC Module 0.0.0)`。
  - [x] 断言 `quick` 与 `detailed` 使用列表项展示差异和适用场景。
  - [x] 断言 Step 3 heading 只出现一次，且 Step 3 section 使用 `Selected modules（已选模块）`、`IDE targets（IDE 目标）`、`Write boundary（写入边界）`。
  - [x] 断言 IDE targets 展示安装目录，写入边界目录使用 trailing slash。
  - [x] 扩展 `test/install-module-selection.test.ts` 或等价 focused test，锁定 final pre-write prompt 的 localized module / IDE / write boundary 片段。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md:1`
- Shared output frame: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md:52`
- Story 8.8 profile and path-safe baseline: `_bmad-output/implementation-artifacts/stories/8-8-cli-human-output-presentation-profiles.md:1`
- UX design system: `_bmad-output/planning-artifacts/ux-design-specification.md:246`
- UX output primitives: `_bmad-output/planning-artifacts/ux-design-specification.md:267`
- Install CLI interaction revision: `_bmad-output/planning-artifacts/ux-install-cli-interaction-spec-2026-06-12.md`
- Current docs matrix: `docs/reference/cli-human-output-matrix.md:14`

### Current Implementation Anchors（当前实现锚点）

- `src/diagnostics/output.ts:26` 已存在 `HumanOutputOptions`，包含 `columns`、`noColor`、`isTty`、`ci`、`screenReader` 和 `locale`。
- `src/diagnostics/output.ts:53` 已存在 `HumanOutputPresentationProfile` 与 command-to-profile mapping，本 Story 应复用，不重建 profile taxonomy。
- `src/diagnostics/output.ts:151` 的 `renderPresentationFrame()` 当前只组装 section 顺序，不会把 section 内行转换为 bullet 或 nested bullet。
- `src/diagnostics/output.ts:406` 的 `renderInstallHumanOutput()` 当前仍直接传入 `manifestVersion=...`、plain `Scope` 行、plain `Evidence` heading 和逗号分隔 step list。
- `src/diagnostics/output.ts:1294` 的 `formatInstallScopeLines()` 当前输出目标项目、目标路径、命令执行目录、项目根目录；本 Story 需要调整为 bullet 且匹配推荐顺序。
- `test/install-outcome-human-output.test.ts:68` 已覆盖 absolute target、path-safe actions、无 `pendingSteps=` 和 `Issues（问题）\n- 无问题`，但未覆盖 bullet layout、step count、nested Evidence 或 color。
- `test/cli-output-presentation.test.ts:32` 当前断言 Summary plain lines；实现本 Story 时需要同步更新断言。
- `test/cli-human-output-matrix.test.ts:96` 已覆盖 NO_COLOR/non-TTY/CI 无 ANSI；本 Story 需要新增 TTY color positive case。
- `package.json:48` 当前没有 terminal color runtime dependency；本 Story 实施时必须显式新增 `picocolors@1.1.1`，不能依赖 package lock 中其他工具链的传递依赖。

### Dependency Decision（依赖决策）

Story 8.9 明确采用 `picocolors@1.1.1`，不采用 `chalk` 或 `colorette`：

| Package | Decision | Rationale |
| --- | --- | --- |
| `picocolors@1.1.1` | Adopt | 体积小、API 简单，足以覆盖 `bold`、`green`、`cyan` / `blue`、`yellow`、`red`，匹配本 Story 禁用 truecolor、256 色、背景色和 dim text 的克制色彩策略。 |
| `chalk@5.6.2` | Do not adopt | 功能完整但过重，支持 256 色和 Truecolor，能力面超过本 Story 允许范围；ESM-only 与项目兼容但没有必要。 |
| `colorette@2.0.20` | Backup only | 轻量且支持 ESM/CJS，但对当前需求没有明显优于 `picocolors` 的收益。 |

Implementation rules:

- `picocolors` 必须放入 `dependencies`，不是 `devDependencies`，因为 CLI runtime 会在 published package 中使用颜色 helper。
- 只有 `src/diagnostics/ansi-style.ts` 或等价集中 helper 可以 import `picocolors`。
- 不引入 `strip-ansi`；测试中如需去除 ANSI，使用本地小 helper 或 focused regex。
- 不直接使用 `picocolors` 的 `bg*`、`dim`、truecolor 或 256 色能力；如果库暴露这些能力，也不得在 SpecLite 中使用。

### Previous Story Intelligence（上一 Story 经验）

- Story 8.8 已完成 Operation / Diagnostic / Report-Support profile、install absolute-target presentation context、path-safe `Next Actions`、无独立 `Empty State` 和 `pendingSteps=` / `completedSteps=` raw step 双写。
- Story 8.8 未把 Sally 推荐的完整 layout 写成 AC；当前实现满足 8.8 的窄验收，但仍不满足 bullet、缩进分组、steps count、Evidence 层级、Next Actions 标签和真正颜色实现。
- Story 8.8 的实现经验显示 `exactOptionalPropertyTypes` 对 helper options 传参敏感；新增 helper 时避免显式传入 `undefined`，优先使用条件 spread 或默认值。

### Current Verified Gap（当前已验证缺口）

当前 `npm run dev -- install /Users/fancyliu/Repos/noi` 输出仍存在以下 UX gap：

- `Summary（摘要）`、`Scope（范围）`、`State（状态）` 和 `Evidence（证据）` 内部不是 bullet / nested bullet。
- `待处理 steps` 是逗号分隔长行，没有先展示数量再缩进列出。
- `Evidence（证据）` 仍使用 `来源`、`外部访问`、`授权状态` plain heading，加上 `sourceType=...; resolvedRoot=...` raw-style 行。
- `Next Actions（下一步）` 已 path-safe，但缺少 `默认安装` / `自定义安装` 标签。
- `manifestVersion=speclite.manifest.v1` 仍是 raw-style line。
- 当前代码没有实际 ANSI color 输出；8.8 只定义了 optional policy。

当前 `npm run dev -- install /Users/fancyliu/Repos/noi --yes --interactive` 输出还暴露以下 prompt-level gap：

- `Step 1/4 Select modules（选择模块）` 与 `Available modules:` 缺少足够空行时，可扫描性不足。
- `sdlc` module 名称如果输出为 `SpecLite SDLC 0.0.0`，会与 `core: SpecLite Core Module 0.0.0` 命名模式不一致；应使用 source metadata 中的 `SpecLite SDLC Module`。
- `Step 2/4 Configure project（配置项目）` 中 `quick` / `detailed` 若以连续正文展示，用户难以快速比较差异；应改为列表项并说明适用场景。
- `Step 3/4 Final pre-write review（最终写入前复核）` 不得重复输出 heading。
- Step 3 默认中文输出应本地化 section label，并在技术标识不翻译的前提下展示 IDE target 安装目录和目录型写入边界 trailing slash。

### Scope Boundary（范围边界）

- 本 Story 的必须完成面是 `install` prewrite / absolute-target human output，以及 `install --yes --interactive` 的 Step 1-3 prompt layout；其他 command 只要求共享 helper 不破坏现有 profile 和回归测试。
- 不改变 `CommandResult` public JSON schema、`targetProject` display identifier、`data.paths.projectRoot`、exit code、issue sorting 或 path normalization。
- 不让 automation 解析 human output；human layout 只改善终端可读性。
- 允许且要求新增唯一 terminal color runtime dependency：`picocolors@1.1.1`；不得新增 `chalk`、`colorette`、`strip-ansi` 或其他 terminal style dependency。
- 不引入 TUI、spinner-only progress、动态覆盖行或 terminal-width dependent semantic behavior。

## Dependency Gate（依赖门禁）

- Story 8.1、8.6、8.7、8.8 已完成，提供 shared frame、message catalog、fixture/docs matrix、presentation profile 和 install path-safe baseline。
- `01-command-result-json-contract.md` 对 public JSON path policy 有优先级；human absolute target context 和 ANSI style 不得进入 JSON。
- `docs/reference/cli-human-output-matrix.md` 已声明 docs/fixture 示例不得包含 ANSI；本 Story 只能在 TTY positive test 中验证 ANSI。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` | JSON 不新增 outcome、layout、ANSI 或 human-only absolute path 字段。 |
| UX Anchor | `_bmad-output/planning-artifacts/ux-design-specification.md` | CLI output primitives、Next Actions、JSON parity 和 docs/fixture 结构语言。 |
| UX Anchor | `_bmad-output/planning-artifacts/ux-install-cli-interaction-spec-2026-06-12.md` | `NO_COLOR` / non-TTY / CI 不依赖颜色，human prompt/output 分层。 |
| Functional Anchor | `src/diagnostics/output.ts` | Shared frame 与 install renderer 的 layout migration。 |
| Functional Anchor | `src/diagnostics/ansi-style.ts` 或等价 helper | 唯一 import `picocolors` 的位置，集中执行 TTY / CI / `NO_COLOR` 护栏。 |
| Functional Anchor | `src/diagnostics/install-presentation-context.ts` | Human-only target path context 继续不进入 JSON。 |
| Functional Anchor | `src/cli/messages.ts` | 自然语言仍通过 catalog；技术标识不本地化。 |
| Dependency Anchor | `package.json` / `package-lock.json` | 新增且只新增 `picocolors@1.1.1` 作为 production dependency。 |
| Evidence Anchor | `test/install-outcome-human-output.test.ts` | Install absolute-target layout regression。 |
| Evidence Anchor | `test/cli-smoke.test.ts` | `install --yes --interactive` prompt spacing、module name consistency 和 Step 3 localized output regression。 |
| Evidence Anchor | `test/install-module-selection.test.ts` | Final pre-write prompt 的 selected modules、IDE target directory 和 write boundary regression。 |
| Evidence Anchor | `test/cli-output-presentation.test.ts` | Shared presentation helper 和 profile regression。 |
| Evidence Anchor | `test/cli-human-output-matrix.test.ts` | NO_COLOR/non-TTY/CI/docs fixture 无 ANSI 与 TTY positive case。 |
| Documentation Anchor | `docs/reference/cli-human-output-matrix.md` | Scan-friendly sample、color policy 和 fixture normalization。 |

## Equivalent Implementation Policy（等价实现策略）

可以在 `src/diagnostics/output.ts` 内实现 helper，也可以拆到 `src/diagnostics/presentation-format.ts`、`src/diagnostics/ansi-style.ts` 或等价文件。只要满足以下条件即可视为等价：

- install prewrite human output 与 `Expected Install Layout` 的结构语义一致。
- `install --yes --interactive` Step 1-3 prompt output 与 `Expected Interactive Install Prompt Layout` 的结构语义一致。
- ANSI style 集中受控，只通过 `picocolors@1.1.1` helper 输出，移除 ANSI 后完整可读。
- `NO_COLOR`、CI、non-TTY、docs、fixture 和 JSON 不含 ANSI。
- focused tests 能证明 JSON contract、path safety 和 profile ordering 未回归。
- `chalk`、`colorette`、`strip-ansi` 或其他 terminal style dependency 未进入 `package.json`。

## Evidence Plan（证据计划）

- `npm test -- test/install-outcome-human-output.test.ts`
- `npm test -- test/cli-smoke.test.ts test/install-module-selection.test.ts`
- `npm test -- test/cli-output-presentation.test.ts test/cli-human-output-matrix.test.ts`
- `npm test -- test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`
- `npm run build`
- `npm run release:packaging-check`
- `npm test`
- `git diff --check`

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `npm install picocolors@1.1.1 --save`：通过，`picocolors` 被提升为 production dependency。
- `npm test -- test/install-outcome-human-output.test.ts test/cli-output-presentation.test.ts test/cli-human-output-matrix.test.ts`：通过，21 tests passed。
- `npm test -- test/cli-smoke.test.ts`：通过，11 tests passed。
- `npm test -- test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，59 tests passed。
- `npm test -- test/source-selection.test.ts test/git-source-resolution.test.ts test/cli-message-catalog.test.ts`：通过，31 tests passed。
- `npm test -- test/install-outcome-human-output.test.ts test/cli-output-presentation.test.ts test/cli-human-output-matrix.test.ts test/cli-smoke.test.ts test/source-selection.test.ts test/git-source-resolution.test.ts test/cli-message-catalog.test.ts`：最终重跑通过，63 tests passed。
- `npm run build`：通过，tsup ESM / DTS build success。
- `npm run release:packaging-check`：通过，packaging acceptance passed。
- `git diff --check`：通过，无 whitespace error。
- `npm test`：失败，剩余失败来自当前 mixed worktree 中 canonical SDLC skill package roots 从 44/57 漂移到 48/61，以及全量并发下相关 install fixture timeout；未在本 Story 范围内更新这些非 8.9 fixture/count 断言。

### Completion Notes（完成说明）

- 完成 install prewrite human output scan-friendly layout：Summary / Scope / State / Evidence / Issues / Next Actions 均使用 bullet 或 nested bullet，step list 展示数量，Evidence 按来源、外部访问、授权状态分组。
- 新增 `src/diagnostics/ansi-style.ts`，以 `picocolors@1.1.1` 实现受控 ANSI helper；默认 docs / fixture / CI / non-TTY / JSON 无 ANSI，TTY positive path 仅使用 bold、cyan/green/red/yellow 等标准 ANSI 能力。
- 保持 `renderCommandResultJson()` public schema 不变；absolute target context 与 ANSI 均未进入 JSON。
- 完成 `install --yes --interactive` Step 1/2/3 prompt 可扫描布局：module 名称、quick/detailed 列表、Step 3 localized section label、IDE target directory 和 trailing slash write boundary 均有测试覆盖。
- 2026-06-18 docs alignment: interactive quick/detailed prompt layout 明确 `user_name` 必填，Step 3 增加 `Config values（配置值）` 复核段，避免用户显示名在写入前不可见。
- 遗留阻塞：全量 `npm test` 仍受 mixed worktree 中非 8.9 新增 SDLC skill 目录影响，多个测试仍期望 57/44 skill count；本 Story 未调整这些非 8.9 fixture/count 合同。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/8-9-cli-human-output-scan-friendly-layout-and-color.md`
- `docs/quick-start.md`
- `docs/how-to/install-speclite.md`
- `docs/reference/cli.md`
- `docs/reference/cli-human-output-matrix.md`
- `package.json`
- `package-lock.json`
- `src/commands/install.ts`
- `src/diagnostics/ansi-style.ts`
- `src/diagnostics/output.ts`
- `test/cli-human-output-matrix.test.ts`
- `test/cli-message-catalog.test.ts`
- `test/cli-output-presentation.test.ts`
- `test/cli-smoke.test.ts`
- `test/git-source-resolution.test.ts`
- `test/install-outcome-human-output.test.ts`
- `test/source-selection.test.ts`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-18 | 0.4 | 补充 interactive `user_name` 必填 prompt、Step 3 `Config values` 复核段和公开 install docs 对齐要求。 | John / Codex |
| 2026-06-16 | 0.1 | 创建 Epic 8.9 ready-for-dev Story，完整覆盖 Sally 推荐的 CLI human output layout、bullet / nested grouping、steps count、Evidence hierarchy、Next Actions labels 和 guarded ANSI color design。 | GPT-5 Codex |
| 2026-06-16 | 0.2 | 根据依赖技术决策补充 `picocolors@1.1.1` adoption、`chalk` / `colorette` 排除理由、集中 helper 边界和 packaging evidence。 | GPT-5 Codex |
| 2026-06-16 | 0.3 | 补充 `install --yes --interactive` Step 1-3 prompt layout、module name consistency、quick/detailed 对比列表、Step 3 本地化与写入边界展示要求。 | John / Codex |
| 2026-06-17 | 1.0 | 实现 8.9 scan-friendly install prewrite layout、interactive prompt layout、guarded ANSI helper、focused tests、docs matrix 和 review 状态更新。 | GPT-5 Codex |
