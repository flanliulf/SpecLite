# Tools 目录分析报告

## 总体定位

`tools` 目录不是业务 skill 本身，而是围绕 `src` 中 BMAD native skills/module 定义建立的一套工程化支撑层，主要负责：

- 将 `src/core-skills`、`src/bmm-skills` 中的 skill/module 定义安装到目标项目。
- 生成 `_bmad` 运行时目录、配置、manifest、help catalog。
- 将 native skills 分发到不同 AI IDE/Agent 工具的标准 skill 目录。
- 校验 skill 定义、文件引用、文档链接。
- 构建文档站点和 LLM 上下文文件。
- 处理迁移、格式化、SVG 视觉回归等维护任务。

核心入口在 `package.json`：

- CLI 主入口：`tools/installer/bmad-cli.js`
- NPM bin：`bmad`、`bmad-method`
- 安装命令：`node tools/installer/bmad-cli.js install`
- 质量检查：`npm run quality`
- skill 校验：`node tools/validate-skills.js --strict`
- 文件引用校验：`node tools/validate-file-refs.js --strict`
- 文档构建：`node tools/build-docs.mjs`

## 与 src 的关系

`src` 是“定义源”，`tools` 是“处理器/安装器/校验器”。

`src` 中主要承载：

- `src/core-skills/module.yaml`：core 模块配置 schema，例如 `user_name`、`project_name`、`communication_language`、`output_folder`。
- `src/bmm-skills/module.yaml`：BMM 模块配置 schema、默认选中状态、目录创建声明、agent roster。
- `src/**/SKILL.md`：native Agent Skills 标准入口文件。
- `src/**/customize.toml`：区分 agent persona 与 workflow 类 skill 的重要信号。
- `src/**/module-help.csv`：帮助菜单和 workflow catalog 的数据源。
- `src/scripts/*.py`：安装后共享到 `_bmad/scripts` 的运行时脚本，例如 customization/config 解析。

`tools` 会读取这些源文件并生成：

- `_bmad/<module>/...`：模块内容拷贝。
- `_bmad/scripts/...`：共享脚本。
- `_bmad/config.toml`：团队级安装配置。
- `_bmad/config.user.toml`：个人级安装配置。
- `_bmad/custom/config.toml`、`_bmad/custom/config.user.toml`：用户持久覆盖配置 stub。
- `_bmad/_config/manifest.yaml`：安装状态、模块版本、IDE 列表。
- `_bmad/_config/skill-manifest.csv`：所有 native skills 的索引。
- `_bmad/_config/files-manifest.csv`：安装文件与 hash。
- `_bmad/_config/bmad-help.csv`：合并后的帮助/菜单目录。
- 各 IDE skill 目录，例如 `.claude/skills`、`.agents/skills`、`.opencode/commands` 等。

## tools 目录结构

`tools` 可分为几类：

- `tools/installer/`：核心安装器。
- `tools/validate-skills.js`：native skill 确定性规则校验。
- `tools/skill-validator.md`：LLM 辅助二阶段 skill 审查规则。
- `tools/validate-file-refs.js`：检查 `src` 内跨文件引用。
- `tools/validate-doc-links.js`：检查文档链接。
- `tools/fix-doc-links.js`：自动修正文档链接风格。
- `tools/build-docs.mjs`：文档站点与 LLM 文件构建。
- `tools/format-workflow-md.js`：旧式 mixed markdown/XML workflow 格式化。
- `tools/migrate-custom-module-paths.js`：历史 custom module manifest 路径迁移。
- `tools/validate-svg-changes.sh`：SVG 视觉差异验证。
- `tools/docs/*.md`：维护/迁移说明文档。
- `tools/javascript-conventions.md`：JS 代码组织约定。

## 安装器主流程

入口链路：

1. `package.json` 的 `bin` 指向 `tools/installer/bmad-cli.js`。
2. `bmad-cli.js` 使用 `commander` 动态加载 `tools/installer/commands/*.js`。
3. `install` 命令进入 `tools/installer/commands/install.js`。
4. `install.js` 调用 `UI.promptInstall(options)` 收集安装配置。
5. 然后调用 `Installer.install(config)` 或 `Installer.quickUpdate(config)`。

核心安装流程在 `tools/installer/core/installer.js`：

1. 构建标准化配置：`Config.build(originalConfig)`。
2. 解析安装路径：`InstallPaths.create(config)`。
3. 构建官方模块管理器：`OfficialModules.build(config, paths)`。
4. 检测已有安装：`ExistingInstall.detect(paths.bmadDir)`。
5. 如是更新，移除取消选择的模块/IDE，并备份用户自定义或修改过的文件。
6. 安装共享脚本：`src/scripts` → `_bmad/scripts`。
7. 安装模块：`src/core-skills`、`src/bmm-skills` 或外部/community/custom module → `_bmad/<module>`。
8. 创建模块声明的输出目录，例如 `planning_artifacts`、`implementation_artifacts`。
9. 生成每个模块的 `config.yaml`。
10. 生成 central config 和 manifests。
11. 合并 `module-help.csv` 到 `_bmad/_config/bmad-help.csv`。
12. 配置选中的 IDE，将 skill 目录复制到对应目标。
13. 删除 `_bmad` 内冗余 skill 目录，因为最终 skill 会进入 IDE skill 目录。
14. 恢复用户自定义文件或将修改文件备份成 `.bak`。
15. 输出安装总结。

## 模块发现与安装

模块管理主要在 `tools/installer/modules/official-modules.js`。

内置模块发现逻辑：

- `core` → `src/core-skills`
- `bmm` → `src/bmm-skills`

此外还支持：

- external official modules
- community modules
- custom source modules
- marketplace/plugin resolution 形式的模块

安装时有几个关键过滤规则：

- 跳过 `module.yaml`，因为它只用于安装期 schema/元数据。
- 跳过模块根部 `config.yaml`，因为安装器会生成真实配置。
- 跳过 `sub-modules/`。
- 跳过 sidecar 目录。
- agent markdown 若含 `localskip="true"` 会跳过本地安装。
- 其他文件按原样复制。

配置收集来自 `module.yaml`：

- 含 `prompt` 的字段会变成安装问题。
- `scope: user` 会写入 `config.user.toml`。
- 默认 team scope 写入 `config.toml`。
- `result` 支持基于 `{value}`、`{project-root}`、`{output_folder}` 等变量生成最终路径。
- `directories` 是声明式目录创建机制，替代不安全的模块自定义安装脚本。

## Manifest 生成

`tools/installer/core/manifest-generator.js` 是安装后可发现性的核心。

它做几件事：

- 递归扫描安装后的模块目录。
- 一个目录只要有合法 `SKILL.md` 就被识别为 native skill。
- `SKILL.md` 必须有 YAML frontmatter。
- `name`、`description` 必须存在。
- `name` 必须等于目录名。
- 生成 `skill-manifest.csv`，字段包括 `canonicalId,name,description,module,path`。
- 从各模块 `module.yaml` 的 `agents:` 数组收集 agent essence。
- 写入 `_bmad/config.toml` 的 `[agents.<code>]` 段。
- 写入 `manifest.yaml`，记录安装版本、模块版本、IDE 列表。
- 写入 `files-manifest.csv`，带 SHA256 hash，用于后续检测用户修改。
- 创建 `_bmad/custom` 配置 stub。

这里的关键设计是：agent persona 的“名片信息”来自 `module.yaml`，而 agent 的完整行为仍在对应 skill 目录和 `customize.toml` 中。

## IDE/Agent 工具适配

IDE 适配由 `tools/installer/ide/manager.js` 和 `tools/installer/ide/_config-driven.js` 完成。

支持的平台定义在 `tools/installer/ide/platform-codes.yaml`。

每个平台可声明：

- `target_dir`：skill 目录安装位置。
- `global_target_dir`：全局安装位置。
- `commands_target_dir`：命令指针目录。
- `commands_extension`：命令文件扩展名。
- `commands_body_template`：命令文件正文模板。
- `commands_filter`：如 `agents-only`，只生成 agent persona 命令。
- `ancestor_conflict_check`：检测祖先目录重复安装冲突。
- `suspended`：暂时阻止安装的平台提示。

典型目标：

- Claude Code：`.claude/skills`
- Cursor/Gemini/Codex 等：`.agents/skills`
- OpenCode：`.agents/skills`，并生成 `.opencode/commands/<skill>.md`
- GitHub Copilot：`.agents/skills`，并生成 `.github/agents/*.agent.md`，且只暴露 persona agents

安装 native skills 的方式是“verbatim copy”：

- 根据 `_bmad/_config/skill-manifest.csv` 找到每个 skill 源目录。
- 将整个 skill 目录原样复制到目标 IDE 的 skill 目录。
- 不转换 `SKILL.md` frontmatter。
- 过滤 `.DS_Store`、临时文件、隐藏文件等。

命令指针机制：

- 对 OpenCode 等支持 slash command 的工具，生成一个很小的命令文件。
- 默认正文类似 `@skills/{canonicalId}`。
- OpenCode 会跳过保留命令名，如 `review`、`commit`、`help`。
- 已存在命令文件若像生成器产物，会刷新；若像用户手工修改，会保留。

## 配置交互细节

`tools/installer/ui.js` 负责交互式与非交互式安装体验。

支持参数包括：

- `--directory`
- `--modules`
- `--tools`
- `--list-tools`
- `--list-options`
- `--set <module>.<key>=<value>`
- `--action install|update|quick-update`
- `--custom-source`
- `--yes`
- `--channel stable|next`
- `--all-stable`
- `--all-next`
- `--next <code>`
- `--pin CODE=TAG`

交互行为：

- 首先确认安装目录。
- 检测是否已有 `_bmad`。
- 已安装时可选择 Quick Update 或 Modify Installation。
- fresh install 时选择模块和 IDE。
- core 配置总是优先收集。
- 非 core 模块会进入一个 gateway：Express Setup 或 Customize。
- Express Setup 使用默认值。
- Customize 允许选择具体模块逐项配置。
- `--yes` 模式尽量使用默认值，但 fresh non-interactive install 需要明确 `--tools`。
- `--set` 不参与 schema prompt 流程，而是在安装后 patch central TOML。

## 更新与保护机制

安装器对用户文件有较强保护：

- 通过 `files-manifest.csv` 的 hash 检测修改。
- manifest 外文件视为 custom files。
- 更新前备份 custom files。
- 修改过的 installer-owned 文件会备份为 `.bak`，避免直接覆盖后丢失。
- `_bmad/custom/config.toml` 与 `_bmad/custom/config.user.toml` 永不覆盖。
- `_bmad/memory`、`_bmad/_memory` 被视为运行时用户状态，不纳入 custom/modified 警告。
- quick update 会保留已有配置，只为新增字段补默认值或提示。

## 帮助目录合并

帮助目录来自 `module-help.csv`。

核心逻辑在 `Installer.mergeModuleHelpCatalogs()`：

- 扫描 core 和已安装模块的 `module-help.csv`。
- 校验 header 是否与 canonical schema 一致。
- 按固定 13 列位置解析。
- module 列为空时，非 core 模块会自动补模块名。
- 最终生成 `_bmad/_config/bmad-help.csv`。
- `bmad-help` skill 可基于这个 CSV 展示 workflow 菜单、阶段、前后置关系、输出位置等。

这让 `src` 中新增 workflow/skill 时，只要维护 `module-help.csv`，安装后帮助系统就能发现。

## Skill 校验体系

`tools/validate-skills.js` 是确定性第一阶段校验器。

它扫描 `src` 下所有含 `SKILL.md` 的目录，检查规则包括：

- `SKILL.md` 必须存在。
- frontmatter 必须有 `name`。
- frontmatter 必须有 `description`。
- `name` 必须符合 `bmad-*` 小写短横线格式。
- `name` 必须匹配目录名。
- `description` 需有质量要求和长度限制。
- `SKILL.md` 必须有正文。
- 非 `SKILL.md` 不应使用 `name`/`description` frontmatter。
- 不允许 `{installed_path}`。
- step 文件命名必须是 `step-NN-description.md`。
- step frontmatter 不应含 `name`/`description`。
- step 数量建议 2 到 10。
- 不应包含时间估计。

`tools/skill-validator.md` 是第二阶段 LLM 审查说明，用于补充确定性脚本难以判断的规则：

- 内部引用是否相对路径正确。
- 外部引用是否使用 `{project-root}` 或 config 变量。
- 是否跨 skill 引用内部文件。
- workflow frontmatter 变量是否合理。
- step 是否有 goal、next step、HALT 菜单等待、无 forward loading。
- 变量引用是否定义。
- skill 调用是否使用 “Invoke” 语义。

## 文件引用校验

`tools/validate-file-refs.js` 用于扫描 `src` 中 `.yaml/.yml/.md/.xml/.csv`：

- 检查 `{project-root}/_bmad/...` 是否能映射回 `src` 中真实文件。
- 检查 `{_bmad}/...` shorthand。
- 检查 `exec="..."`。
- 检查 `<invoke-task>...</invoke-task>`。
- 检查 `./`、`../` 相对引用。
- 检查 step metadata，例如 `nextStepFile`。
- 检查 `Load: ./file.md`。
- 检查绝对路径泄漏，如 `/Users/`、`/home/`、`C:\`。

它会跳过运行时变量和安装期生成文件，例如：

- `{planning_artifacts}`
- `{implementation_artifacts}`
- `{date}`
- `{installed_path}`
- `config.yaml`
- `_config/`
- `custom/`

这个脚本主要防止 skill/workflow 文件中出现坏路径或本地路径污染。

## 文档工具

`tools/build-docs.mjs` 是文档构建管线：

- 先运行文档链接检查。
- 清理 `build/`。
- 从 `docs/` 生成 `build/artifacts/llms.txt`。
- 从 `docs/` 合并生成 `build/artifacts/llms-full.txt`。
- 控制 `llms-full.txt` 最大字符数，避免超过 LLM 上下文限制。
- 构建 Astro/Starlight 网站到 `build/site`。
- 将 LLM artifacts 复制到站点输出。

`tools/validate-doc-links.js`：

- 检查 markdown 文档中的站点相对链接。
- 检查 anchor 是否对应实际 heading。
- 可用 `--write` 自动修复可推断的坏链接。

`tools/fix-doc-links.js`：

- 将文档链接规范化为 repo-relative `/docs/...md`。
- 目标是同时兼容 GitHub 和 Astro/Starlight。

## 其他维护工具

`tools/format-workflow-md.js`：

- 针对 mixed markdown + XML 风格 workflow 文件。
- 统一 XML tag 缩进。
- 保留 markdown 和 code block。
- 更像历史 workflow 文件维护工具，当前 native skill 体系中仍可辅助格式化旧结构。

`tools/migrate-custom-module-paths.js`：

- 迁移旧 manifest 中 custom module 的相对路径。
- 将 `relativePath` 或非绝对 `sourcePath` 转为绝对路径。
- 面向历史安装兼容。

`tools/validate-svg-changes.sh`：

- 从 Git HEAD 取旧 SVG。
- 用 Playwright 渲染旧/新 SVG 为 PNG。
- 用 ImageMagick 做像素比较。
- 生成差异图和 HTML 对比页面。
- 用于视觉资产变更审查。

## 关键数据流

可以把整个系统理解为这条链：

```text
src/core-skills + src/bmm-skills
  ↓
module.yaml / SKILL.md / customize.toml / module-help.csv / scripts
  ↓
tools/installer 收集配置、复制模块、生成 manifest
  ↓
_bmad/
  ↓
_config/skill-manifest.csv + config.toml + bmad-help.csv
  ↓
IDE adapter 根据 platform-codes.yaml 分发 native skills
  ↓
.claude/skills、.agents/skills、.opencode/commands、.github/agents 等
  ↓
用户在具体 AI 工具中 invoke skill 或 slash command
```

## 核心设计特点

这个 `tools` 目录体现出几个明确设计：

- `src` 是声明式源，`tools` 负责安装和派生，不把 IDE 适配逻辑写进 skill。
- native skill 以 `SKILL.md` 为唯一入口，目录即封装边界。
- 安装器生成 manifest，让后续 IDE 分发、卸载、更新都有依据。
- `module.yaml` 同时承担模块元数据、安装配置 schema、agent roster、目录声明。
- `module-help.csv` 将技能菜单从代码中解耦。
- `platform-codes.yaml` 让 IDE 支持变成配置驱动。
- 更新流程重视用户修改保护，避免覆盖 custom/memory/hand-edited command pointer。
- 校验工具分为确定性脚本和 LLM 推理审查两层，覆盖格式规则和语义规则。
