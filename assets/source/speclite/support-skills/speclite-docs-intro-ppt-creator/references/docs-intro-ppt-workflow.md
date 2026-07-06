# Docs Intro PPT Workflow（Docs 介绍型 HTML PPT 工作流）

## Purpose（目的）

本 workflow 把“某个项目体系 / 系统设计 / 治理机制 / 产品理念 / 工作流”的介绍内容生成到 SpecLite `docs/` 下，交付一个可直接打开的 `index.html` deck。它封装的是生产过程，不绑定任何具体示例主题、目录、页数或文案。

## Inputs（输入）

执行前必须明确：

- `topic`：要介绍的体系、系统、设计、理念或 workflow。
- `output_dir`：最终输出目录，必须位于 `docs/` 下，例如 `docs/presentations/<topic-slug>/`。
- `source_materials`：用户提供文本、项目文档、代码路径、历史记录或当前对话总结。
- `audience`：目标读者或听众，例如维护者、新贡献者、评审人、内部分享对象。
- `scenario`：介绍场景，例如项目说明、设计评审、治理机制宣讲、onboarding、阶段复盘。
- `style`：优先 `Swiss Style` 或杂志风；未指定时按内容类型推荐。
- `slide_count`：默认 8-15 页，除非用户指定更长分享。
- `constraints`：必须包含、不能出现、敏感边界、术语口径和视觉偏好。

如果 `output_dir` 未给出，先提出一个 `docs/presentations/<topic-slug>/` 候选目录并等待确认。最终产物不能写到项目根目录、`/tmp` 或 `.specskills/`。

## Workflow（流程）

### Step 1: Preflight（预检）

1. 确认当前 cwd 是 SpecLite 仓库根或能定位 SpecLite 仓库根。
2. 检查 `output_dir` 是否在 `docs/` 下，解析后不能逃逸出项目根。
3. 若 `output_dir/index.html` 已存在，读取它并说明覆盖影响；没有明确授权不得覆盖。
4. 读取用户指定的 source materials；如果只给了对话总结，先把事实、推断和待确认项拆开。
5. 如果信息不足但可以保守推进，记录假设；如果会改变事实口径或覆盖已有 deck，停止并询问。

### Step 2: Source Grounding（素材归纳）

1. 读取相关 `docs/`、`assets/source/speclite/` 或用户指定文件。
2. 区分三类事实：
   - `Current fact`：当前文件、脚本、配置或用户明确陈述。
   - `Historical record`：旧计划、日志、进度记录或 snapshot。
   - `Inference`：基于材料推导出的说明，必须用谨慎语气。
3. 形成 5-9 条 deck key messages，避免把完整文档搬进 slide。
4. 如需保留过程分析，写入 `.specskills/docs/analysis/speclite-docs-intro-ppt-creator/<topic-slug>.md`，不要把分析草稿放到 `docs/`。

### Step 3: Deck Plan（Deck 规划）

1. 确定叙事弧：
   - `Hook`：为什么这个体系值得被理解。
   - `Context`：背景、边界、适用对象。
   - `System Shape`：组成部分和责任分工。
   - `Mechanism`：运行流程、触发条件、决策规则。
   - `Impact`：对用户、维护者或发布流程的影响。
   - `Runbook`：如何使用或如何判断是否完成。
   - `Takeaway`：3 条可记住的结论。
2. 生成页级大纲，标注每页：
   - slide title
   - single message
   - visual layout intent
   - source evidence
3. 技术、工程、治理、数据或矩阵内容默认推荐 `Swiss Style`；品牌、人文、行业观察或 narrative 内容可推荐杂志风。
4. 8 页以上必须包含节奏变化：封面、问题页、结构页、机制页、数字或矩阵页、操作页、takeaway 页。

### Step 4: Guizang Production（Guizang 生成）

1. 使用 `guizang-ppt-skill`：
   - 读取其 `SKILL.md`。
   - 根据风格读取对应 template、theme、layout reference。
   - Swiss Style 优先读取 `assets/template-swiss.html`、`references/themes-swiss.md`、`references/layouts-swiss.md` 和可用 validator。
   - 杂志风读取 `assets/template.html`、`references/themes.md`、`references/layouts.md` 和可用 validator。
2. 创建目录：
   - `mkdir -p <output_dir>/images`
   - 生成或更新 `<output_dir>/index.html`
3. 修改 template：
   - 替换 `<title>`。
   - 删除模板占位符和示例 slide。
   - 插入规划好的 `<section class="slide" data-layout="...">` 内容。
4. 若引用图片：
   - 图片放在 `<output_dir>/images/`。
   - 命名使用 `{page-number}-{semantic-name}.{ext}`。
   - HTML 使用相对路径 `images/<file>`。
5. 不要硬编码上一次 deck 的主题、路径、日期、数量或截图内容。

### Step 5: Verification（验证）

至少运行：

```sh
node assets/source/speclite/support-skills/speclite-docs-intro-ppt-creator/scripts/validate_docs_intro_ppt.mjs --project-root . --html <output_dir>/index.html
rg -n "\[必填\]|SLIDES_HERE|TODO|FIXME" <output_dir>/index.html
git diff --check -- <output_dir>/index.html
```

如果使用 Swiss Style 且 validator 存在，运行：

```sh
node /Users/fancyliu/.agents/skills/guizang-ppt-skill/scripts/validate-swiss-deck.mjs <output_dir>/index.html
```

如果使用其他 guizang validator，按该 Skill 的实际 script 路径运行。不要把 validator 不存在伪装为通过；只说明该项不可用。

若浏览器自动化可用：

1. 打开 `file://<absolute-output-dir>/index.html`。
2. 检查首尾页截图。
3. 逐页检查 slide 内容是否超出 viewport。
4. 若视觉检查不可用，在最终回复中明确说明。

### Step 6: Final Report（收口说明）

最终回复必须包含：

- 输出 HTML 的绝对路径。
- deck 页数与风格。
- 关键验证命令和结果。
- 是否执行浏览器渲染检查。
- 已知限制或未验证项。

如果本次修改了 `assets/source/speclite/`，还必须按 canonical source governance 要求运行：

```sh
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json
node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict
```

## Stop Conditions（停止条件）

遇到以下情况必须停止并询问用户：

- 未确认 `output_dir`，且无法安全推导。
- 目标 `index.html` 已存在但用户没有授权覆盖。
- 用户要求的内容涉及未提供的事实，且推断会影响项目口径。
- `guizang-ppt-skill` 不可用，且用户明确要求使用其模板体系。
- 验证脚本发现 deck 结构缺失、路径逃逸、占位符未清理或页数不合理。
