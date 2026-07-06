---
name: speclite-docs-intro-ppt-creator
description: "生成 SpecLite docs 下的介绍型 HTML PPT。用于用户要求把某个项目体系、系统设计、治理机制、理念或工作流总结成 docs presentation、HTML PPT、网页 slides、介绍 deck。核心能力：限定输出目录、基于事实材料规划叙事、调用 guizang-ppt-skill 生成单 HTML deck，并用确定性检查和浏览器抽样收口。"
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    面向 SpecLite 项目文档场景，把一个体系、系统设计、治理规则、产品理念或工作流总结成 `docs/` 下可打开的单文件 HTML PPT。它不是通用写作 Skill，而是一个 presentation production wrapper：先限定输出目录和事实来源，再使用 `guizang-ppt-skill` 的模板、主题、layout 和 validator 生成介绍型 deck。

[Core Capabilities（核心能力）]
    - **输出目录治理**：要求用户指定或确认 `docs/` 下的目标子目录，默认候选为 `docs/presentations/<topic-slug>/`。
    - **事实素材归纳**：读取用户给定材料、项目文档和必要代码证据，区分当前事实、历史记录和推断，不把示例内容硬编码进新 deck。
    - **叙事规划**：按受众、介绍场景和时长规划 8-15 页 deck，覆盖问题、系统结构、运行机制、决策矩阵、操作路径和 takeaway。
    - **Guizang 集成**：按场景选择 `guizang-ppt-skill` 的杂志风或 Swiss Style，并读取对应 template、theme、layout 与 validator。
    - **单 HTML 交付**：在目标目录生成 `index.html`，必要时创建同级 `images/`，不把过程分析散落到 `docs/`。
    - **确定性验证**：运行本 Skill 的输出契约检查、guizang validator、占位符扫描、`git diff --check`，并在可用时用浏览器抽样检查渲染。

[Workflow（执行流程）]
    本 Skill 采用顺序工作流与迭代验证组合。详细步骤、输出契约和停止条件见 `references/docs-intro-ppt-workflow.md`。

    1. 确认主题、受众、输出目录、事实来源、风格和页数范围。
    2. 读取源材料并形成事实边界，必要分析记录写入 `.specskills/docs/analysis/speclite-docs-intro-ppt-creator/`。
    3. 读取并使用 `guizang-ppt-skill`，选择合适模板、主题和 layout。
    4. 在确认的 `docs/` 子目录生成 `index.html` 和必要资源目录。
    5. 运行本 Skill 的 `scripts/validate_docs_intro_ppt.mjs`、guizang validator、占位符扫描和 whitespace 检查。
    6. 若浏览器自动化可用，抽样检查首尾页和逐页溢出；不可用时明确说明未做视觉渲染验证。
    7. 总结输出路径、页数、验证结果和剩余风险。

[Notes（注意事项）]
    - 本 Skill 只用于 SpecLite 自身 public docs production，不属于目标项目默认 SDLC runtime install set。
    - 如果用户没有给定输出目录，必须先给出一个 `docs/` 下的候选目录并取得确认，不能写到项目根目录或临时目录作为最终产物。
    - 生成内容必须基于当前材料；对未证实内容使用“推断”或“建议”表述，不伪造成项目事实。
    - 介绍型 PPT 应避免把详细操作手册全文塞进 slide；细节保留在 source docs 或补充 reference 中。
    - 技术/工程/治理类内容默认优先 Swiss Style；人文叙事、品牌故事或行业观察类内容可选杂志风。
    - 若输出目录已存在 `index.html`，先读取并说明覆盖影响；没有用户明确授权不得覆盖。
    - 本 Skill 不推进 Story/Epic 状态，不消费 implementation anchor，因此不需要 Flow Gate guidance。
    - 修改 canonical source 后，收口前必须运行 `speclite-check-canonical-source-change` 建议的检查命令。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/support-skills/speclite-docs-intro-ppt-creator/` 与实际安装副本。
