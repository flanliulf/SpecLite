# Epic 1: Project Installation Onboarding（项目安装引导）

项目维护者可以使用默认官方内置来源，从选择目录、官方模块和 AI IDE targets，到生成 `_speclite` runtime、IDE skill mirrors、`_speclite-output` 和 ready summary，完成一次可信 fresh install。替代来源路径由 Epic 5 扩展。

## Story 1.1: CLI Install Entry And Runtime Guard（CLI 安装入口与运行时守卫）

作为项目维护者，
我希望运行 `speclite install` 时先获得清晰的运行时与平台就绪反馈，
以便在任何项目文件被修改前，确认当前环境是否可以安全开始 SpecLite 安装。

**验收标准：**

**前提** 代码库尚未具备 MVP CLI 脚手架
**当** 维护者开始 Story 1.1
**则** 必须建立 ESM package、commander 命令层、tsup 构建、tsx 本地执行和 vitest 测试骨架
**并且** `bin.speclite` 必须指向 `dist/bin/speclite.js`
**并且** package scripts 必须至少包含 build/test 命令和 `release:packaging-check` stub，后者在 Epic 6 完成 packaging assertions
**并且** 在接入 runtime/platform guard 之前，必须先建立 `src/diagnostics/command-result-schema.ts` executable contract anchor、producer/consumer contract tests 和最小 fixture expected output 骨架。

**前提** 代码库尚未具备 owning SPEC implementation anchors
**当** 维护者建立 MVP scaffold
**则** 必须创建 `src/diagnostics/command-result-schema.ts`、`src/source/source-descriptor-schema.ts`、`src/installer/install-plan-schema.ts`、`src/manifest/manifest-schema.ts`、`src/ide/adapter-registry.ts`、`src/config/resolve-output-schema.ts` 和 `src/fixtures/fixture-contract.ts`
**并且** 每个 anchor 可以先提供最小 parser/schema/registry stub，但不得让 CLI orchestration、reporters、fixture assertions 或 adapters 绕过这些 anchors 手写契约逻辑。

**前提** CLI 脚手架已建立
**当** 维护者运行本地构建或冒烟测试
**则** `speclite` 入口可以加载安装命令骨架
**并且** 最小测试能验证命令入口、diagnostics contract anchor、runtime guard、`package.json engines.node` 和确定性失败输出形状。

**前提** CLI 骨架和 diagnostics contract anchor 已通过冒烟测试
**当** 维护者接入 runtime/platform guard
**则** runtime/platform guard 必须复用 diagnostics contract anchor 产生确定性 `CommandResult` failure envelope
**并且** 不得在命令实现中临时拼接第二套 failure JSON shape。

**前提** 用户在目标项目中运行 `speclite install`
**当** CLI 启动
**则** 命令会根据 MVP 运行时策略校验检测到的 Node.js 版本
**并且** 当版本不受支持时，报告 `environment.unsupported-node`，包含检测到的版本和要求的版本范围
**并且** 该 guard 必须与 `package.json engines.node`、fixture matrix 和 taxonomy details 保持一致。

**前提** 检测到的 Node.js 版本满足最低要求
**当** CLI 继续启动流程
**则** 命令会验证当前平台是否支持 MVP 安装路径
**并且** 当平台不受支持时，报告 `environment.unsupported-platform` 诊断。

**前提** 运行时与平台检查均通过
**当** 安装命令初始化
**则** 命令会创建 install command context，但尚不写入 installer-owned 项目文件
**并且** 后续安装阶段会按定义顺序准备执行。

**前提** 运行时或平台校验失败
**当** 命令退出
**则** 不会创建或修改 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills` 文件
**并且** 失败结果包含清晰的下一步建议。

**前提** 用户请求机器可读输出
**当** `speclite install --json` 在运行时或平台守卫阶段失败
**则** 命令返回符合 `CommandResult` 契约的 install failure envelope
**并且** 输出可用于 fixture assertion 的确定性 issue 字段。

**Implementation Tasking Guidance（实现拆分建议）：**

- 先建立 ESM package、commander command layer、tsup/tsx/vitest 和 `bin.speclite`。
- 再建立 executable contract anchors 与 producer/consumer contract tests。
- 再接入 runtime/platform guard，并复用 diagnostics contract 输出 failure envelope。
- 最后补最小 fixture expected output skeleton；不得在 guard 或 CLI orchestration 中临时定义第二套 JSON shape。

## Story 1.2: Project Target Directory Resolution And Existing Install Detection（项目目标目录解析与既有安装检测）

作为项目维护者，
我希望 `speclite install` 能解析我要安装到的项目目录，并在写入前识别目录状态，
以便确认 SpecLite 会安装到正确位置，且不会误覆盖已有安装或非空项目内容。

**验收标准：**

**前提** 用户启动 `speclite install` 且未显式指定安装目录
**当** 命令进入目标目录解析阶段
**则** 系统会使用当前工作目录作为默认目标项目目录
**并且** 以 project-relative POSIX-style path 展示解析后的安装位置。

**前提** 用户通过参数或交互输入指定安装目录
**当** 系统解析该目录
**则** 系统会规范化最终安装路径
**并且** 展示可供用户确认的目标路径摘要。

**前提** 解析后的安装目录不存在
**当** 系统检查目录状态
**则** 系统会报告目录将被创建
**并且** 在用户确认前不写入任何项目文件。

**前提** 解析后的安装目录已存在但没有 SpecLite 安装状态
**当** 系统检查目录内容
**则** 系统会区分空目录与非空目录
**并且** 向用户展示继续安装可能影响的项目根目录。

**前提** 解析后的安装目录已有 SpecLite 安装内容
**当** 系统检测到 `_speclite` 或 manifest/index 等安装状态
**则** 系统会报告 existing-install 状态
**并且** 列出检测到的 runtime、manifest version、IDE targets 和建议下一步。

**前提** 用户尚未确认目标目录
**当** 目标目录解析与状态检查完成
**则** 系统不会创建或修改 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills` 文件
**并且** 后续安装阶段必须等待明确确认后才能继续。

## Story 1.3: Official Module Selection And Install Summary（官方模块选择与安装摘要）

作为项目维护者，
我希望在安装前选择要安装的官方 SpecLite 模块或能力包，并看到清晰的版本与选择摘要，
以便确认本次安装范围符合项目需要。

**验收标准：**

**前提** 目标目录已解析且用户已确认可以继续安装流程
**当** 系统进入官方模块发现阶段
**则** 系统会从正式可分发的 SpecLite source tree 读取可安装模块
**并且** 默认官方来源投影为 `sourceType: "bundled"` 的 SourceDescriptor，canonical tree 来自 package 内 `assets/source/speclite/`
**并且** 不会把已删除、非目标辅助来源或非正式分发内容列为可安装模块。

**前提** 系统发现可安装模块
**当** 向用户展示模块列表
**则** 每个模块会显示模块标识、名称和版本信息
**并且** 用户可以选择一个或多个官方模块或能力包。

**前提** 用户选择模块后继续
**当** 系统生成安装范围摘要
**则** 摘要会列出已选择的模块、版本、将参与安装的能力范围，以及每个模块下将安装的 canonical package root count
**并且** 默认官方安装集合中，`core` 与 `sdlc` 选中后必须包含各自目录下全部包含 `SKILL.md` 的 canonical package roots
**并且** 该摘要在写入项目前展示给用户确认。

**前提** 没有发现任何可安装官方模块
**当** 系统无法形成有效安装范围
**则** 命令会停止后续安装阶段
**并且** 输出可诊断的失败原因和建议下一步。

**前提** 用户请求 `install --json` 输出
**当** 模块选择阶段完成或失败
**则** 机器可读输出仅使用当前 `CommandResult<InstallCommandData>` 字段表达状态
**并且** pre-write fresh install 中 `installedModules` 为空，pending / selected module state 通过 `completedSteps`、`pendingSteps`、`issues`、`nextActions` 和 human-readable summary 表达。

## Story 1.4: Project Config Initialization（项目配置初始化）

作为项目维护者，
我希望在安装过程中配置项目名称、用户称呼、交流语言、文档语言和产物输出目录，
以便安装后的 SpecLite skills 能读取统一项目配置并按团队约定工作。

**验收标准：**

**前提** 用户已确认安装目录和模块选择
**当** 系统进入配置初始化阶段
**则** 系统会提供快速配置与详细配置两种模式
**并且** 用户可以选择适合当前项目的配置方式。

**前提** 用户选择快速配置模式
**当** 系统收集最小配置输入
**则** 系统会确定用户称呼或团队名称、项目名称、交流语言、文档输出语言和过程产物输出目录
**并且** 对未显式提供的值使用可展示、可确认的默认值。

**前提** 用户选择详细配置模式
**当** 系统收集项目级配置输入
**则** 用户可以定义用户称呼、项目名称、交流语言、文档输出语言、产物路径、安装模块和 IDE targets
**并且** 系统会在写入前展示最终配置摘要。

**前提** 配置值已收集完成
**当** 系统准备生成项目级配置
**则** 配置会进入 `_speclite/config.toml` 与 `_speclite/config.user.toml` 的 installer-owned 初始化计划
**并且** 本 Story 只允许按 create-if-absent 规则初始化 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml` 这两个 human-owned project-level stubs；如果目标已存在则不得修改其内容、顺序或注释。

**前提** fresh install 安装 skill packages
**当** 系统处理 skill-specific customization
**则** 本 Story 不默认创建 `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`
**并且** 这些 skill-specific human-owned files 只能由用户手工创建或未来显式 customization 命令创建。

**前提** 用户尚未确认最终配置摘要
**当** 配置初始化阶段结束
**则** 系统不会写入配置文件
**并且** 后续写入阶段必须等待明确确认后才能继续。

**前提** 用户请求 `install --json` 输出
**当** 配置初始化完成或失败
**则** 机器可读输出通过 `completedSteps`、`pendingSteps`、`paths`、`issues` 和 `nextActions` 表达配置初始化状态
**并且** 不新增未契约化 config blob、selected module field 或 pending module field
**并且** 不泄露 home directory、环境变量或认证信息。

## Story 1.5: Runtime Structure, Artifact Directory And IDE Mirror Creation（运行时结构、产物目录与 IDE 镜像创建）

作为项目维护者，
我希望在确认安装计划后由系统创建 SpecLite 运行时结构、过程产物目录和 AI IDE skill mirrors，
以便目标项目获得可运行、可发现、可验证的 SpecLite 安装结果。

**验收标准：**

**前提** 用户已确认安装目录、模块选择和项目配置
**当** 系统进入写入阶段
**则** 系统会创建 `_speclite` metadata/control hub
**并且** fresh install 可在 gate 完成后先创建 `_speclite/` 作为 `_speclite/.lock` parent，并将该受限目录创建视为 lock acquisition 的一部分
**并且** 除 lock parent 和 lock file 外，shared scripts、module directories、configuration、help catalog 和 manifest/index 等 installer-owned mutation 都必须在 lock 获取成功后执行。

**前提** 项目配置中定义了过程产物输出目录
**当** 系统创建 artifact repository
**则** 系统会创建 `_speclite-output` 或配置约定的输出结构
**并且** 不会覆盖已有 workflow-owned 过程产物。

**前提** 用户选择了 `claude` IDE target
**当** 系统创建 IDE execution mirror
**则** 系统会把所选模块下全部 canonical package roots 安装到 `.claude/skills`
**并且** 记录每个 skill 的 canonical identity、target path 和 source reference
**并且** 缺 canonical skill package 的 module 不得作为默认 installed module 进入 IDE mirror 或 ReadyCheck，除非后续补齐 packages 或 owning SPEC 明确 metadata-only module contract。

**前提** 用户选择了 `agents` IDE target
**当** 系统创建 IDE execution mirror
**则** 系统会把同一批完整 canonical package roots 安装到 `.agents/skills`
**并且** canonical skill package 内容不会因 IDE target 不同而变化。

**前提** 写入过程中目标路径已存在
**当** 系统判断文件所有权和路径安全性
**则** installer-owned 文件按计划生成或更新
**并且** human-owned custom 文件、workflow-owned artifacts、symlink escape、path escape、case conflict 和 unsafe overwrite 会被保护或阻断。

**前提** IDE mirror creation 完成
**当** 系统生成安装投影
**则** manifest/index 会记录安装模块、IDE targets、skill/help/files index、ownership 和 hash 信息
**并且** 所有 public path 使用 project-relative POSIX-style path。

**前提** 所选模块包含 canonical package roots
**当** 系统生成 skill index 与 files index
**则** `skill-index.json` 必须包含所选模块下每一个 canonical package root 的 `canonicalSkillId`、`sourcePackagePath`、`canonicalPackageHash` 和 installedTargets
**并且** `files-index.json` 必须包含每个 IDE target 中对应 package files 的 installer-owned hash projection。

**前提** 任一关键写入步骤失败
**当** 命令返回失败结果
**则** 系统不会展示 ready summary
**并且** 通过 `CommandResult.status`、`issues`、`completedSteps`、`pendingSteps` 和 manual action 表达失败，不新增未契约化 `failedStep` 字段。

## Story 1.6: Install Progress And Ready Summary（安装进度与就绪摘要）

作为项目维护者，
我希望安装过程展示清晰的阶段进度，并在成功后给出完整 ready summary，
以便确认 SpecLite 已正确安装、哪些 IDE targets 已配置，以及接下来该如何开始使用。

**验收标准：**

**前提** 用户执行 `speclite install`
**当** 安装流程运行
**则** 系统会按顺序展示 source discovery / module selection、config initialization、runtime structure、IDE mirror creation、manifest generation、ready check 和 ready summary 阶段状态
**并且** 每个阶段只在实际开始或完成时报告对应状态
**并且** machine-readable progress `stepId` 使用 stable lower-kebab id，例如 `ready-check`
**并且** progress `stepId` 只作为 fixture-observable deterministic signal，automation 依赖必须读取 `CommandResult.data.completedSteps` 和 `CommandResult.data.pendingSteps`
**并且** human-readable step label 可以是 `ready check`，但 contract/internal guard 名称必须是 `ReadyCheck`。

**前提** source discovery / module selection、config initialization、runtime structure、IDE mirror creation、manifest generation 和 ReadyCheck 全部成功
**当** 安装流程完成
**则** 系统会展示 SpecLite ready summary
**并且** 摘要包含安装位置、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令。

**前提** install 内部运行 ReadyCheck
**当** 系统判断是否可以展示 ready summary
**则** ReadyCheck 只检查 manifest/index 可读、source descriptor projection 有效、selected IDE mirrors 和 selected modules 下全部 canonical package roots 的 installed skill entries 可见、required runtime paths 存在，以及本次 install 没有 blocking issue 或 failed required step
**并且** 默认 installed modules 必须具备 canonical skill package evidence，缺 packages 的 module 不得计入 ready result，除非 owning SPEC 明确 metadata-only module contract
**并且** ReadyCheck 不执行 full hash scan、remote source access、implicit update check 或 repair planning。

**前提** 已配置一个或多个 AI IDE targets
**当** 系统生成 ready summary
**则** 摘要会展示每个 AI IDE 的 skill 数量和目标目录
**并且** 标明用户下一步如何启动 AI agent 或调用帮助 skill。

**前提** 任一 required step 失败
**当** 命令结束
**则** 系统不会展示 ready summary
**并且** 失败结果通过 `CommandResult.status`、`issues`、completed steps、pending steps 和 manual action 表达，不新增未契约化 `failedStep` 字段。

**前提** 用户请求 `install --json` 输出
**当** 安装完成、warning 或 failure
**则** 机器可读输出会包含 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps` 等契约字段
**并且** 不新增未契约化的 `readySummary` JSON blob。

**前提** human-readable output 与 `--json` output 同时需要表达安装结果
**当** 命令生成最终输出
**则** 两种输出共享同一 command status 与 issue model
**并且** automation 依赖的字段必须进入 structured JSON 或 file contract。

**前提** install ready summary 使用 human-readable output
**当** renderer 采用 Evidence profile 展示安装结果
**则** 输出必须按稳定顺序包含 Summary、completed steps、installed modules、IDE targets、key paths 和 Next actions
**并且** 每个 path 应标明所属空间或角色，例如 metadata/control hub、IDE execution plane 或 artifact repository。

**前提** install output 运行在 `NO_COLOR`、non-TTY 或 CI 环境
**当** 系统渲染 progress、failure 或 ready summary
**则** 输出不得包含 ANSI escape、spinner-only progress 或依赖颜色/符号才能理解的状态
**并且** status、step id、target id、path 和 next action 必须有文本等价表达。

## Story 1.7: Install CLI Interaction And Localized Human Output（安装 CLI 交互与本地化人类输出）

作为首次安装 SpecLite 的项目维护者，
我希望 `speclite install` 的终端输出按阶段清晰区分日志、摘要、提示和确认，
以便在中文默认输出中安全理解安装范围、写入时机和下一步动作，同时让 `--yes` 与 `--json` 适合自动化和新手 happy path。

**验收标准：**

**前提** 用户执行 `speclite install` 的 human-readable flow
**当** 系统展示模块选择、配置模式、写入计划确认、写入进度和 Ready Summary
**则** 每个阶段必须使用稳定 heading block，例如 `Step 1/4 Select modules（选择模块）`
**并且** summary、safety statement、prompt 和用户输入必须在视觉上分离
**并且** prompt 必须单独占行，不得把长段 summary 与 `readline.question()` 的输入提示拼接在同一段文本中。

**前提** 用户未显式指定 locale
**当** CLI 渲染 human-readable install output
**则** 默认使用 `zh-CN` message catalog
**并且** 自然语言提示、阶段标题和摘要说明默认中文
**并且** command name、flag、module id、target id、step id、path、schema id、issue id、reason code 和 JSON field 不得本地化。

**前提** 用户通过 `--locale en-US` 或 `SPECLITE_LOCALE=en-US` 指定英文
**当** CLI 渲染 human-readable install output
**则** 使用 `en-US` fallback catalog
**并且** locale 变化不得改变 `CommandResult` JSON、exit code、issue ordering、path normalization、manifest/index 内容或 fixture stable JSON comparison。

**前提** 用户执行 `speclite install --yes`
**当** 目标目录、source resolution 和 write plan 均没有 blocking issue
**则** 命令必须使用默认 modules、quick config 和默认 IDE targets 形成写入计划
**并且** 不再要求模块选择、配置模式或最终写入确认等普通交互输入
**并且** human-readable 输出必须说明本次使用了默认值并已由 `--yes` 授权无 conflict planned writes。

**前提** 用户需要自定义模块、配置模式或 IDE targets
**当** 用户进入自定义安装流程
**则** 必须通过显式 interactive mode 或显式 flags 进入
**并且** `--json --yes` 必须保持无交互，不得等待 stdin。

**前提** 系统生成 final pre-write review
**当** 任何项目文件尚未写入
**则** review 必须按稳定顺序展示 target、source descriptor、config mode、selected modules、IDE targets、planned writes 和 pending phases
**并且** 明确说明当前状态为尚未写入项目文件
**并且** 明确说明确认后会开始写入 `_speclite`、artifact root、IDE mirrors 和 manifest/index。

**前提** install output 运行在 `NO_COLOR`、non-TTY、CI 或窄终端环境
**当** 系统渲染阶段、prompt、失败结果或 Ready Summary
**则** 输出不得包含 ANSI escape，不得依赖 spinner-only progress、颜色、图标或动态覆盖行表达唯一语义
**并且** 窄终端必须降级为 key-value block，不得丢失 target、source、planned writes、issue id、step id、path 或 next action。

**前提** 开发者实现本 Story
**当** 修改 CLI prompt adapter、install renderer、message catalog 或 `--yes` 行为
**则** 必须补充 focused CLI smoke / fixture tests，覆盖默认中文输出、英文 locale fallback、prompt/summary 分离、`install --yes` no-prompt flow、`install --json --yes` 无交互稳定输出、`NO_COLOR` / non-TTY / CI 无 ANSI 输出
**并且** 不得新增未契约化 JSON 字段；若确需新增 public JSON 字段，必须先更新 owning SPEC、schema/parser 和 fixture expected outputs。
