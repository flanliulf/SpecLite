---
name: speclite-html-ppt-generator
description: "生成 SpecLite-owned 单文件 HTML PPT。用于用户要求创建 docs presentation、HTML PPT、网页 slides、Swiss Style deck、杂志风 deck，或其他可直接浏览器打开的介绍/分享型 deck。核心能力：使用本 Skill 内置模板、主题、layout 和 validator 生成横向翻页 HTML，并避免依赖外部个人 skill 路径。"
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    生成 SpecLite-owned 的单文件 HTML PPT。它把原本依赖外部 `guizang-ppt-skill` 的模板、layout、theme 和 Swiss validator 收纳到 SpecLite canonical source，使 docs deck 生产可以在发布包和其他机器上复现。

[Core Capabilities（核心能力）]
    - **本地模板生成**：使用本 Skill 的 `assets/template.html` 或 `assets/template-swiss.html` 创建横向翻页 deck。
    - **双视觉系统**：提供电子杂志风和 Swiss Style 两套模板、主题色与 layout reference。
    - **Layout 约束**：要求从 `references/layouts.md` 或 `references/layouts-swiss.md` 选择版式，不临时发明页面结构。
    - **输出目录控制**：根据上层任务把 `index.html` 写入用户确认的目标目录，并把图片放入同级 `images/`。
    - **验证收口**：使用 `scripts/validate-swiss-deck.mjs`、占位符扫描、`git diff --check` 和浏览器抽样检查 HTML deck。
    - **授权透明**：在 `references/third-party-notices.md` 记录模板来源与 MIT license，不把外部安装路径写入 canonical workflow。

[Workflow（执行流程）]
    本 Skill 使用顺序工作流与迭代验证组合。详细步骤、风格选择、文件路径和停止条件见 `references/html-ppt-generation-workflow.md`。

    1. 确认主题、受众、输出目录、风格、页数、素材和约束。
    2. 读取本 Skill 的模板、主题、layout reference 和质量 checklist。
    3. 复制对应模板到 `<output_dir>/index.html`，创建 `<output_dir>/images/`。
    4. 替换 `<title>`，删除模板占位符，插入已规划的 slide sections。
    5. 对 Swiss Style 运行 `scripts/validate-swiss-deck.mjs`，并对所有 deck 执行占位符与 whitespace 检查。
    6. 浏览器自动化可用时检查首尾页截图和逐页溢出；不可用时明确说明。

[Notes（注意事项）]
    - 本 Skill 是 SpecLite support skill，用于支撑 canonical docs / presentation production，不属于默认目标项目 SDLC runtime install set。
    - 不得引用个人全局 skill 路径或外部 `guizang-ppt-skill` 安装路径；所有模板、reference 和 validator 必须从本 Skill package 内读取。
    - 技术、工程、治理、数据或矩阵类内容默认优先 Swiss Style；人文叙事、品牌故事和行业观察可选电子杂志风。
    - 如果目标 `index.html` 已存在，必须先读取并说明覆盖影响；没有明确授权不得覆盖。
    - 使用第三方模板资产时，必须保留 `references/third-party-notices.md`。
    - 修改 canonical source 后，收口前必须运行 `speclite-check-canonical-source-change` 建议的检查命令。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/support-skills/speclite-html-ppt-generator/` 与实际安装副本。
