# Epic 6: Maintainer Fixture And Release Confidence（维护者 Fixture 与发布信心）

SpecLite 维护者可以用 fixture projects 和 expected outputs 验证 fresh install、existing update、IDE drift、source integrity、resolve parity、path portability 和 skill artifact loop，形成发布前可信证据。

## Story 6.1: Fixture Case Layout And Expected Output Contract（Fixture Case 布局与 Expected Output 契约）

作为 SpecLite 维护者，
我希望每个 fixture case 都有稳定的目录布局、输入数据和 expected outputs，
以便新增或修改安装能力时，可以用同一套契约测试资产验证行为是否仍然正确。

**验收标准：**

**前提** 维护者创建新的 fixture case
**当** fixture case 被加入测试资产
**则** case directory 使用稳定 lower-kebab 命名
**并且** layout 遵守 fixture contract owning SPEC。

**前提** fixture case 描述安装前后状态
**当** 维护者定义 expected outputs
**则** expected outputs 至少可以包含 expected file tree、expected manifest/index snapshot、expected command output 摘要和 validation assertions
**并且** 每类 expected output 的比较规则由 owning SPEC 管理。

**前提** fixture snapshot 包含路径字段
**当** 生成或比较 expected outputs
**则** 路径必须使用 project-relative POSIX-style path
**并且** 不依赖 absolute local path、home directory、OS-specific separators 或 checkout root。

**前提** fixture snapshot 包含 public JSON
**当** 进行 stable comparison
**则** 允许的 timestamp 字段必须由 schema 显式声明并排除比较
**并且** 未声明字段不得引入随机值、环境相关文本或不稳定顺序。

**前提** fixture snapshot 包含 human-readable command output
**当** 比较 `status`、`validate`、`install` 或 `update` expected outputs
**则** fixture 必须覆盖 Compact、Evidence 和 Structured profiles 的代表性输出
**并且** stable comparison 不得依赖颜色、ANSI escape、terminal width、spinner-only progress、absolute local path 或 checkout root。

**前提** fixture expected output 包含表格化或列表化诊断
**当** 窄终端触发 key-value fallback
**则** severity、issueId、affectedPath、targetId、entryPath、next action、planned effect、conflict reason 和 artifact metadata 等关键字段仍必须可读且可断言
**并且** 不得因为布局降级而丢失 automation 所需字段。

**前提** 契约行为发生变化
**当** 维护者需要更新 fixture expected outputs
**则** 必须先更新 owning SPEC 和 executable schema/parser
**并且** 不得先更新 snapshots 再反推契约行为。

**前提** 新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind
**当** 维护者提交变更
**则** 必须同步新增或更新相关 fixture 输入和 expected outputs
**并且** release gate 或 regression asset 分类保持明确。

## Story 6.2: Fresh Install And Existing Update Fixture Gates（Fresh Install 与 Existing Update Fixture Gate）

作为 SpecLite 维护者，
我希望 fixture gates 覆盖空项目 fresh install 和既有安装 update，
以便证明安装控制面能生成正确结构，并在更新时保护 human-owned custom 文件和 workflow artifacts。

**验收标准：**

**前提** `fresh-install-empty-project` fixture
**当** 测试运行 fresh install
**则** expected outputs 验证 `_speclite`、`_speclite-output`、manifest/index、`.claude/skills` 和 `.agents/skills` 已按预期生成
**并且** fresh install baseline 必须断言 `core-skills/` 与 `sdlc-skills/` 下全部 53 个 canonical package roots 均出现在 skill index 和每个 selected IDE mirror 中
**并且** ready summary 只在 ReadyCheck 成功后出现。

**前提** fresh install fixture 完成
**当** 比较 expected file tree 和 manifest/index snapshot
**则** 生成结果在相同 source、配置、目标 IDE 和平台上保持确定性
**并且** 允许差异仅限 schema 明确排除的 timestamp 字段。

**前提** `existing-install-update` fixture
**当** 测试运行 update
**则** installer-owned 文件可以按 plan 更新
**并且** human-owned custom 文件保留不变。

**前提** `existing-install-update` fixture 中存在 workflow-owned artifacts
**当** update 执行
**则** workflow artifacts 不会被覆盖、删除或重排
**并且** fixture assertions 明确验证这些 artifacts 仍然存在且内容未被修改。

**前提** fixture 测试 update behavior
**当** installer-owned 文件存在本地 drift
**则** 普通 update 会产生 conflict 而不是静默覆盖
**并且** repair 行为由显式 `update --repair` fixture 或后续 fixture 覆盖。

**前提** fresh install 或 update fixture 失败
**当** 测试生成结果
**则** 不展示 ready summary 或 release-ready summary
**并且** failure 输出包含 completed steps、failed step、pending steps 和 suggested manual action。

## Story 6.3: Drift, Source Integrity And Resolve Parity Fixtures（Drift、来源完整性与 Resolve Parity Fixtures）

作为 SpecLite 维护者，
我希望 fixture suite 覆盖 IDE drift、source integrity 和 resolver parity，
以便验证安装漂移、来源信任和配置解析这些高风险路径在变更后仍然稳定。

**验收标准：**

**前提** `ide-drift` fixture
**当** 测试人为修改某个 IDE mirror 中的 canonical skill package 文件
**则** `speclite validate` 会报告稳定的 `ide-mirror` 或 `file-integrity` issue
**并且** expected output 包含 target、canonical skill id、hash mismatch 和 suggested next step。

**前提** `source-integrity` fixture group
**当** release gate fixture suite 运行
**则** 必须分别运行 `bundled-packaging-trusted`、`bundled-packaging-missing-evidence-blocked`、`registry-lock-trusted`、`registry-unverified`、`git-floating-blocked`、`local-source-snapshot-unverified`、`local-source-path-redacted`、`local-source-installed-state-blocked`、`artifact-hash-mismatch-blocked` 和 `source-unreadable-blocked` sub-cases
**并且** 每个 sub-case 都有独立 input、expected command JSON、expected issues 和 redaction assertions。

**前提** `bundled-packaging-trusted` 或 `bundled-packaging-missing-evidence-blocked` sub-case
**当** 测试 bundled source 的 packaging evidence
**则** packaging manifest、package hash 或 package lock match 可以产生 `trusted`
**并且** missing packaging evidence 必须阻断 bundled source trust，并输出稳定 `source-integrity` issue。

**前提** `registry-lock-trusted` 或 `registry-unverified` sub-case
**当** 测试 registry source 的 integrity evidence
**则** expected outputs 分别覆盖 hash/lock match 产生的 `trusted`，以及只有可复现 evidence 时的 `unverified`
**并且** `unverified` source 只有用户显式选择后才能进入 write planning。

**前提** `git-floating-blocked` 或 `artifact-hash-mismatch-blocked` sub-case
**当** Git source 只有 branch/tag/remote URL，或 tarball/offline/local source 发生 hash/lock mismatch
**则** source 被标记为 `blocked`
**并且** blocked source 不得进入 install planning 或写入步骤。

**前提** `local-source-snapshot-unverified` 或 `local-source-path-redacted` sub-case
**当** 测试 local source snapshot evidence 和 public JSON projection
**则** snapshot hash 只覆盖 canonical source tree allowlist，且没有 expected hash/lock match 时 trustStatus 保持 `unverified`
**并且** public JSON 与 fixture snapshot 不得暴露 absolute local path、home directory 或 checkout root。

**前提** `local-source-installed-state-blocked` sub-case
**当** local source 指向 `_speclite/`、IDE mirrors、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output
**则** source 被标记为 `blocked`
**并且** expected issue id 必须为 `source-integrity.local-source-self-reference`，且不进入 install planning 或写入步骤。

**前提** `source-unreadable-blocked` sub-case
**当** registry unreachable、authentication required、tarball unreadable 或 offline bundle unreadable 发生
**则** expected issues 使用稳定 `source-integrity` issue id
**并且** credentials、credential-bearing URLs、cache path 和临时路径被 redacted。

**前提** `resolve-parity` fixture
**当** 测试 `speclite resolve config`
**则** expected outputs 验证 config merge order、missing key、repeated key、required/optional layer failure 和 stdout/stderr shape
**并且** 与 Python resolver baseline 语义保持一致。

**前提** `resolve-parity` fixture
**当** 测试 `speclite resolve customization`
**则** expected outputs 验证 customization merge order、skill directory basename lookup key、array merge rules 和 optional layer warning diagnostics
**并且** 不允许 adapter 或 skill helper 实现第二套 merge logic。

**前提** validation issue taxonomy 或 resolve contract 发生变化
**当** 维护者更新 fixture expected outputs
**则** 必须同一变更中更新 owning SPEC、executable schema/parser 和 fixture assertions
**并且** 不得只改 snapshot 让测试通过。

**Implementation Tasking Guidance（实现拆分建议）：**

- 先实现 `ide-drift` fixture 的最小闭环，锁定 canonical skill hash mismatch、target、suggested next step 和 human/json output parity。
- 再分批实现 `source-integrity` sub-cases，每个 sub-case 保持独立 input、expected command JSON、expected issues 和 redaction assertions，避免把 trustStatus、write planning 和 redaction 断言混在一个大 fixture。
- 最后实现 `resolve-parity` fixture，把 config merge、customization merge、diagnostic stderr shape 和 Python parity baseline 分成可独立失败的断言组。

## Story 6.4: Path Portability And Runtime Matrix Evidence（路径可移植性与运行时矩阵证据）

作为 SpecLite 维护者，
我希望 fixture gates 覆盖 Node 22/24、macOS/Windows 和关键路径可移植性场景，
以便证明 MVP 在声明支持的运行时与平台上可重复安装、验证和更新。

**验收标准：**

**前提** release gate fixture suite 运行
**当** CI 或本地验证执行 MVP fixture gates
**则** 必须覆盖 Node 22 minimum 和 Node 24 recommended runtime
**并且** 不得使用 Node 24-only API，除非提供 Node 22 兼容路径或更新 runtime policy。

**前提** release gate fixture suite 记录 runtime/p95 baseline
**当** 维护者比较 command runtime regression
**则** p95 duration、regression percentage 和 profiling sample 必须写入 release/performance evidence
**并且** stable command JSON snapshots 和 stable fixture snapshots 不比较具体 wall-clock values。

**前提** path-portability fixture 运行在 macOS 13+ 和 Windows 11
**当** 执行 install、status、validate、update 或 resolve 相关路径
**则** public path fields 必须使用 project-relative POSIX-style path
**并且** fixture snapshot 不依赖 OS-specific separators、drive letter、home directory 或 checkout root。

**前提** fixture 覆盖 canonical source text files
**当** 安装器复制 canonical source 内容
**则** canonical text line endings 保持 LF
**并且** installer 不按平台改写 canonical text line endings。

**前提** fixture 覆盖 generated scripts 或 runtime scripts
**当** files index 记录脚本信息
**则** 必须记录 `executable` intent
**并且** Windows fixture 不要求 POSIX chmod 语义，但必须验证受支持脚本入口可用。

**前提** fixture 覆盖大小写敏感路径冲突
**当** install、update 或 repair 规划写入
**则** case conflict 必须被阻断并产生稳定 issue 或 conflict reason
**并且** 不允许同一项目在不同操作系统上产生不可比较安装结果。

**前提** fixture 覆盖 symlink escape 或 path escape
**当** safe write 或 validation 处理目标路径
**则** 写入必须被阻断或 validate 必须报告稳定 issue
**并且** 不得把项目外路径写入 public JSON、manifest/index 或 fixture snapshot。

**前提** fixture 覆盖 shell invocation 差异
**当** 命令在支持平台上执行
**则** command id、path normalization、exit code 和 JSON output 语义保持稳定
**并且** 不依赖 shell-specific path separators 或别名行为。

**前提** fixture 覆盖 terminal width 差异
**当** human-readable command output 在小于 80 columns、80-119 columns 和大于等于 120 columns 下生成
**则** Compact 与 Evidence output 的关键字段仍可读且顺序稳定
**并且** 表格 fallback 不得丢失 path、issue id、target id、next action 或 conflict reason。

**前提** fixture 覆盖 `NO_COLOR`、non-TTY、CI 和 copy-paste review 场景
**当** human-readable command output 在这些环境下生成
**则** 输出不得包含 ANSI escape，并且 status、severity、empty state、checked categories 和 suggested next step 均有文本等价表达
**并且** screen reader 或纯文本复制审查不依赖颜色、图标或动态覆盖行才能理解结果。

**前提** release packaging acceptance 运行
**当** 维护者构建 npm package、local tarball 或 offline bundle
**则** 必须通过 `npm run release:packaging-check` 生成 `dist/packaging-manifest.json`，列出 package file inventory，并断言包含 `package.json` bin mapping、`dist/bin/speclite.js`、`assets/source/speclite/`、installer/runtime schemas、runtime scripts/templates 和安装执行所需 runtime assets
**并且** packaging acceptance 是 release checklist gate，必须保存 stable artifact、expected assertions 和 CI/release evidence
**并且** `test/fixtures/` 与 root `fixtures/` 默认不得进入 package，除非明确标记为 packaged documentation example；packaged examples 不等同于 release gate fixtures。

## Story 6.5: Skill Artifact Loop And Documentation Examples（Skill Artifact Loop 与文档示例）

作为 SpecLite 维护者，
我希望至少有一个阶段化 skill 从 IDE entry 发现、激活到输出 artifact 的闭环 fixture，
以便证明 SpecLite 安装后不只是文件存在，而是真正能驱动研发流程并产出可检查文档。

**验收标准：**

**前提** `skill-artifact-loop` release gate fixture
**当** fixture 从 installed IDE entry 发现某个阶段化 skill
**则** entry 可以解析到 canonicalSkillId、activationTarget 和 installed skill package
**并且** 不需要手工查找 source skill 文件或复制提示词内容。

**前提** fixture 激活该 skill
**当** skill 按自身 activation protocol 执行
**则** skill 可以读取项目级 config 和 customization
**并且** 不依赖 Python resolver 或内部构建路径。

**前提** skill workflow 完成最小闭环
**当** workflow 写出 planning 或 review artifact
**则** artifact 位于配置约定路径
**并且** metadata 必须包含 `workflowType`、`sourceSkill` 和 `generatedAt`。

**前提** fixture validate artifact loop
**当** 检查生成 artifact
**则** 只校验 artifact type、默认输出路径和 metadata 值域
**并且** `generatedAt` 必须存在且可 parse 为 ISO 8601 string，并在 stable snapshot 中 normalize 或 exclude；不把叙事质量、人工评审结论或内容完整度作为 MVP validation 范围。

**前提** `skill-artifact-loop` 只激活一个或少量代表性 workflow skill
**当** release gate 汇总 MVP 安装证据
**则** 该 fixture 只能证明 activation/artifact metadata 最小闭环
**并且** 不得替代 full canonical skill set install/mirror/index fixture assertions。

**前提** 文档读者查看安装示例
**当** 文档展示 fresh install、目录树、manifest/index、status/validate 输出或 update 保护示例
**则** 示例应引用或来自 fixture expected outputs
**并且** 不复制 schema 真源或定义第二套 contract。

**前提** 维护者新增阶段化 skill 或 artifact kind
**当** 更新 documentation examples
**则** 同步更新相关 fixture 输入、expected outputs 和 validation assertions
**并且** 保持最小 `skill-artifact-loop` release gate 与 richer regression assets 的分类明确。

## Story 6.6: Fixture Contract Hardening（Fixture Contract 收口）

作为 SpecLite 维护者，
我希望收口 release confidence fixture 的输入外置、时间戳契约、fixture 分类和路径逃逸断言，
以便 CR TODO 中暴露的 fixture contract 缺口被证据化关闭，而不是继续依赖 test helper 或弱断言。

**验收标准：**

**前提** `resolve-parity` fixture 运行
**当** 测试 config 和 customization merge parity
**则** input config/customization layers 必须来自 `test/fixtures/resolve-parity/input/` 下的 fixture assets
**并且** test helper 不得再硬编码真实 layer 内容或维护第二套 merge input。

**前提** public JSON、manifest/index 或 artifact metadata 包含 `generatedAt`
**当** schema、fixture comparator 和 expected outputs 校验时间戳
**则** `generatedAt` 契约必须在 owning SPEC、executable schema/parser、fixture normalization 和 story/test wording 中保持一致
**并且** 不允许出现 schema 只接受 canonical UTC、fixture/story 却声称任意 ISO parseable string 的漂移。

**前提** `source-integrity` fixture 使用多层 case id
**当** fixture registry 对 sub-case 和 variant 分类
**则** 三段式 id 必须由 contract、registry、manifest 和 tests 明确定义
**并且** 不得让 release gate 变体因为未注册而落到 undefined 或 ambiguous classification。

**前提** path-portability dynamic CLI gate 覆盖 path escape
**当** validation issue 指向项目边界外路径
**则** dynamic test 必须断言 `artifact-path.escapes-project` 的 `details.reason = path-escapes-project`
**并且** 不得只断言 issue id 存在。

**前提** 上述缺口被修复
**当** 更新 CR TODO backlog
**则** 仅关闭有代码、fixture 和测试证据支撑的 TODO
**并且** 不得提前关闭 packaging gate、默认测试稳定性或 Git confirmationState 相关 TODO。

## Story 6.7: Packaging Gate Hardening（Packaging Gate 收口）

作为 SpecLite 维护者，
我希望 release packaging gate 拥有稳定的串行入口、前置构建保障和文档示例打包断言，
以便发布前 package inventory 与 documentation example boundary 可以由单一 release command 验证。

**验收标准：**

**前提** 维护者执行 release verification
**当** 运行 package release gate
**则** 必须存在稳定入口串行执行 build 和 packaging check
**并且** packaging check 不得在 stale `dist/` 或未构建 runtime assets 上产生假阳性。

**前提** `npm run release:packaging-check` 或等价 gate 生成 `dist/packaging-manifest.json`
**当** 校验 packaged documentation examples
**则** packaged documentation examples 必须有非空断言和明确 classification
**并且** 空数组、缺失路径或误把 `test/fixtures/` 当作 docs example 都不得通过。

**前提** package inventory 被断言
**当** npm package、local tarball 或 offline bundle acceptance 运行
**则** 必须覆盖 runtime bin、schemas、templates/scripts、assets/source/speclite 和明确允许的 docs examples
**并且** 默认排除 root `fixtures/` 和 `test/fixtures/`。

**前提** packaging gate 修复完成
**当** 更新 CR TODO backlog
**则** 只关闭 packaging script 和 docs example assertion 相关 TODO
**并且** 保留未完成的 fixture contract 或 test stability TODO。

## Story 6.8: Test Stability And CR TODO Closure（测试稳定性与 CR TODO 收尾）

作为 SpecLite 维护者，
我希望复核默认测试稳定性、补强 Git source confirmation assertion，并对 Epic 6 CR TODO backlog 做最终证据化关闭，
以便 Epic 6 在新增收口项完成后可以重新进入可靠收尾。

**验收标准：**

**前提** 维护者运行默认测试命令
**当** 执行 `npm test`
**则** 默认 test timeout、fixture suite runtime 和 Vitest 配置必须能稳定支持当前 suite
**并且** 若仍需更长 timeout，必须通过配置或脚本显式化，而不是依赖 story 里的人工命令记忆。

**前提** confirmed Git source install scenario 运行
**当** Git source 拥有 version、contentHash 或等价 confirmation evidence
**则** confirmed-path test 必须断言输出或 public projection 中的 `confirmationState=confirmed`
**并且** pending/unconfirmed scenario 仍保留独立断言。

**前提** Story 6.6 和 6.7 相关修复已经完成
**当** 复核 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
**则** 所有已实现 TODO 必须移动到 resolved section，并更新统计、resolved date、resolution evidence 和 affected files
**并且** 任何缺少代码或测试证据的 TODO 仍保持 open。

**前提** CR TODO 全部关闭或剩余项明确延期
**当** 准备再次收尾 Epic 6
**则** 必须运行 focused tests、`npm run build`、默认 `npm test` 和可用的 release verification command
**并且** sprint/story 状态更新不得早于代码、测试和 backlog 证据。
