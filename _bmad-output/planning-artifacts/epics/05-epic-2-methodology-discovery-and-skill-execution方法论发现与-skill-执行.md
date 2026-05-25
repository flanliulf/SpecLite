# Epic 2: Methodology Discovery And Skill Execution（方法论发现与 Skill 执行）

AI IDE 使用者可以在 `.claude/skills` 与 `.agents/skills` 中发现、选择并激活 SpecLite 方法论能力，并让 workflow 读取统一配置、应用 customization、输出带 metadata 的过程产物。

## Story 2.1: Methodology Discovery Metadata Generation（方法论发现元数据生成）

作为 AI IDE 使用者，
我希望安装后的 SpecLite 能提供稳定的方法论发现元数据，
以便 IDE 可以展示研发阶段、可用 skills、入口路径和激活目标，而不需要用户手工查找 Markdown 文件。

**验收标准：**

**前提** SpecLite 已完成所选模块的安装规划
**当** 系统生成 discovery metadata
**则** 每个可发现能力都会记录 phaseId、phaseLabel、moduleId、canonicalSkillId、skill 名称、entry label 和 activation target
**并且** canonicalSkillId 必须来自 source skill package，不得由 IDE adapter 重新命名。

**前提** 某个 skill 属于 SPEC、方案评审、故事规划、实现、测试或审查阶段
**当** 系统生成 MVP 最小阶段覆盖数据
**则** 该 skill 会被映射到对应阶段
**并且** 每个关键研发阶段至少可以表达是否存在 mapped skill entry。

**前提** 系统生成 help index 或菜单发现数据
**当** discovery metadata 写入 installed projection
**则** help index 只能引用 canonicalSkillId、phase、entry label 和 activation target
**并且** 不得定义第二套 skill identity、alias-only identity 或 IDE-specific identity。

**前提** 某个 workflow 具有默认产物输出约定
**当** 系统生成 discovery metadata
**则** 可以记录可选 artifactContract 摘要
**并且** artifactContract 至少能支持后续校验 artifact type、默认输出路径、workflowType、sourceSkill 和 generatedAt。

**前提** discovery metadata 已生成
**当** 后续 IDE adapter 或 validation rule 读取它
**则** 字段、target order、hash 和 ownership 投影遵守 manifest/index owning SPEC
**并且** 不依赖 filesystem traversal order、glob 顺序或异步完成顺序。

## Story 2.2: IDE Skill Entry Mapping（IDE Skill Entry 映射）

作为 AI IDE 使用者，
我希望 SpecLite 把方法论发现元数据映射成 `.claude/skills` 与 `.agents/skills` 中可加载的 skill entries，
以便我可以在不同 AI IDE 中看到一致的 SpecLite 能力入口。

**验收标准：**

**前提** discovery metadata 已生成
**当** 系统处理 `claude` IDE target
**则** 每个可映射的 canonical skill 会生成 `.claude/skills` 下的 self-contained skill entry
**并且** entry 会保留 canonical skill package 内容，不因 target 不同而改写。

**前提** discovery metadata 已生成
**当** 系统处理 `agents` IDE target
**则** 每个可映射的 canonical skill 会生成 `.agents/skills` 下的 self-contained skill entry
**并且** GitHub Copilot 或 Cursor 在 MVP 中只通过 `agents` target 兼容使用，不生成专用 target id。

**前提** 某个 IDE target 支持映射
**当** adapter 完成 entry 写入或规划
**则** 系统会报告 mapped 状态
**并且** 记录 targetId、entryPath、activationTarget 和 canonicalSkillId。

**前提** 某个 IDE target 不支持当前 entry type 或 capability
**当** adapter 无法完成映射
**则** 系统会报告 unsupported 或 failed 状态
**并且** 状态语义遵守 adapter registry owning SPEC，不与 install planning 或 status summary 的状态词混用。

**前提** 同一 canonical skill 被映射到多个 IDE targets
**当** 系统生成 manifest/index 投影
**则** 不同 target 的 canonical skill package hash 必须一致
**并且** target-specific 差异只能出现在 adapter metadata、target directory 或 Post-MVP command pointer 扩展位中。

**前提** MVP 不支持 command pointer artifact
**当** adapter registry 声明 commandPointerBehavior
**则** 系统只允许记录 `none` 或 `unsupported` 语义
**并且** 不会生成 GitHub Copilot/Cursor 专用 command pointer artifact。

## Story 2.3: Skill Activation And Phase Capability Coverage（Skill 激活与阶段能力覆盖）

作为 AI IDE 使用者，
我希望从已映射的 IDE entry 中选择并激活 SpecLite skills，
以便按照 SPEC、方案评审、故事规划、实现、测试和审查等研发阶段推进工作。

**验收标准：**

**前提** `.claude/skills` 或 `.agents/skills` 中存在 mapped skill entry
**当** 用户在 AI IDE 中选择该 entry
**则** IDE 可以加载对应 self-contained skill package
**并且** 激活目标指向该 canonical skill 的 `SKILL.md` 或等价入口。

**前提** 用户需要执行 SPEC、方案评审、故事规划、实现、测试或审查阶段能力
**当** 系统生成或读取最小阶段覆盖矩阵
**则** 每个关键阶段都会显示是否存在 mapped skill entry
**并且** 对应 canonical skill id、moduleId、entryPath、activationTarget 和 target status 可被检查。

**前提** 某个关键阶段没有 mapped skill entry
**当** 用户或验证器查看阶段覆盖结果
**则** 系统会清晰表达该阶段未覆盖或 unsupported
**并且** 不会用 alias-only identity 或 IDE-specific identity 伪造覆盖。

**前提** 用户从 IDE entry 激活某个 skill
**当** skill 的激活协议开始执行
**则** skill 可以按照自身 `SKILL.md` activation protocol 继续运行
**并且** 不要求用户手工查找 source skill 文件或复制提示词内容。

**前提** 阶段覆盖矩阵被写入 manifest/index 或 command output
**当** 自动化或 validation 读取它
**则** 输出顺序遵守 manifest/adapter registry canonical target order
**并且** 字段值使用稳定、可比较的 project-relative POSIX path。

## Story 2.4: Runtime Config And Customization Resolve（Runtime Config 与 Customization Resolve）

作为 AI IDE 使用者，
我希望已激活的 SpecLite skill 能通过稳定命令读取项目配置和 customization 覆盖，
以便不同 IDE 中运行的同一 skill 使用一致的项目名称、语言、输出路径、persona 和 workflow 设置。

**验收标准：**

**前提** 已安装项目包含 `_speclite` 配置层
**当** 已激活 skill 调用 `speclite resolve config --project-root <project>`
**则** 命令会按 installer base、installer user、team custom、user custom 的顺序合并配置
**并且** stdout 只输出解析结果 JSON。

**前提** 已安装 skill 需要读取 workflow 或 agent customization
**当** skill 调用 `speclite resolve customization --skill <skill-dir> --project-root <project>`
**则** 命令会按 skill defaults、team custom、user custom 的顺序合并 customization
**并且** 使用 skill directory basename 作为 customization lookup key。

**前提** 用户请求一个不存在的 dotted key
**当** `speclite resolve` 执行成功
**则** 命令默认输出 `{}` 并返回 exit code 0
**并且** 不向 stderr 输出 issue，除非未来显式 strict missing flag 被引入。

**前提** 用户重复传入多个 `--key`
**当** `speclite resolve` 输出结果
**则** 输出对象使用原 dotted key 字符串作为字段名
**并且** 缺失 key 会被省略。

**前提** optional TOML layer 读取或解析失败
**当** resolver 继续合并其余配置层
**则** stderr 会输出 ValidationIssue 形状的 warning JSON diagnostic
**并且** 命令在没有 error 或 critical diagnostics 时仍返回 exit code 0。

**前提** required TOML layer 读取或解析失败
**当** resolver 无法继续安全解析
**则** 命令返回非 0 exit code
**并且** stdout/stderr shape 仍遵守 resolve-command owning SPEC。

**前提** customization 包含数组字段
**当** resolver 合并数组
**则** 只有所有元素都是 table 且共享同一个 `code` 或同一个 `id` 时才 keyed merge
**并且** 命中同 key 时 override item 整项替换 base item，不做 item-level deep merge。

## Story 2.5: Workflow Artifact Output And Metadata Validation（Workflow Artifact 输出与 Metadata 校验）

作为 AI IDE 使用者，
我希望已激活的 workflow 能把产物写入配置约定的位置，并记录稳定 metadata，
以便团队可以追踪每个产物来自哪个 workflow、哪个 skill，以及是否满足 MVP artifact contract。

**验收标准：**

**前提** 已激活 workflow 读取到项目级输出路径配置
**当** workflow 生成 planning、implementation 或 review artifact
**则** artifact 会写入 `_speclite-output` 或配置约定的输出目录
**并且** 输出路径使用 project-relative POSIX-style path 记录。

**前提** workflow 写入 artifact
**当** artifact metadata 被生成
**则** metadata 至少包含非空稳定字符串 `workflowType`、非空 canonical skill id 形式的 `sourceSkill`
**并且** 包含 ISO 8601 string 形式的 `generatedAt`。

**前提** workflow artifact 是 Markdown 文件
**当** workflow 写入 artifact metadata
**则** metadata 必须位于文件开头的 YAML frontmatter
**并且** frontmatter 至少包含 `workflowType`、`sourceSkill` 和 `generatedAt`。

**前提** workflow artifact 不是 Markdown 文件或是目录产物
**当** workflow 写入 artifact metadata
**则** file artifact 必须写出同目录 `<artifact-filename>.metadata.json`，directory artifact 必须写出目录内 `metadata.json`
**并且** sidecar metadata file 与 artifact 本体一样属于 workflow-owned artifact。

**前提** workflow artifact 完成写入
**当** validator 或 fixture comparison 读取 artifact metadata
**则** `generatedAt` 必须是 ISO 8601 string
**并且** 缺少 `generatedAt` 必须作为 artifact contract violation 报告，具体时间值默认从 stable fixture snapshot comparison 中 normalize 或 exclude。

**前提** workflow artifact 已存在
**当** 新 workflow 产物准备写入
**则** 系统不得被 installer/update 逻辑静默覆盖 workflow-owned artifact
**并且** artifact 写入行为必须遵守该 workflow 自己的输出策略。

**前提** validate 检查 artifact contract
**当** artifact metadata 缺失或值域不合法
**则** 系统会报告 artifact-path 或相关 validation issue
**并且** 不把产物叙事质量、人工评审结论或内容完整度作为 MVP validation 范围。

**前提** artifact contract 被写入 manifest/index 或 discovery metadata
**当** 后续 skill、validator 或自动化读取它
**则** artifact type、默认输出路径、workflowType、sourceSkill 和 generatedAt 语义保持一致
**并且** 不在 PRD、Architecture、Manifest/index 或 CommandResult 中各自定义第二套 artifact contract。
