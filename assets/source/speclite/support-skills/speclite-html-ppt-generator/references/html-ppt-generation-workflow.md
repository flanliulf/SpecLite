# HTML PPT Generation Workflow（HTML PPT 生成工作流）

## Purpose（目的）

本 workflow 使用 `speclite-html-ppt-generator` 自带的 template、layout、theme 和 validator 生成单文件 HTML PPT。它是 SpecLite-owned 的 presentation engine，不依赖外部 `guizang-ppt-skill` 安装路径。

## Inputs（输入）

执行前确认：

- `topic`：deck 主题。
- `output_dir`：最终输出目录，由上层任务或用户指定。
- `style`：`magazine` 或 `swiss`；未指定时按内容类型推荐。
- `slide_count`：默认 8-15 页，除非用户另有要求。
- `source_materials`：文档、代码、截图、已有大纲或用户上下文。
- `constraints`：必须包含、不能出现、术语口径、图片素材和视觉偏好。

## Style Routing（风格路由）

- `swiss`：技术、工程、治理、产品机制、数据、矩阵、流程、系统关系。
- `magazine`：人文叙事、行业观察、品牌故事、观点分享、带纪实图片的演讲。

如果用户明确指定风格，优先按用户要求执行；如果指定风格与内容明显冲突，先说明风险，再继续执行或请求确认。

## Workflow（流程）

### Step 1: Resolve Skill Root（定位 Skill 根）

1. 当前 Skill 根目录是包含 `SKILL.md` 的 `speclite-html-ppt-generator/`。
2. 所有 template、layout、theme、script 路径都必须相对该目录解析。
3. 禁止使用个人全局 skill 路径、外部 `guizang-ppt-skill` 安装路径或任何非本 package 内路径。

### Step 2: Read Assets（读取资产）

按风格读取：

| Style | Template | Theme | Layout | Validator |
|---|---|---|---|---|
| `magazine` | `assets/template.html` | `references/themes.md` | `references/layouts.md` | `references/checklist.md` |
| `swiss` | `assets/template-swiss.html` | `references/themes-swiss.md` | `references/layouts-swiss.md` 与 `references/swiss-layout-lock.md` | `scripts/validate-swiss-deck.mjs` |

需要图片时同时读取 `references/image-prompts.md`；需要组件细节时读取 `references/components.md`。

### Step 3: Plan Deck（规划 Deck）

1. 形成 8-15 页的页级大纲。
2. 每页只承载一个核心信息。
3. 每页标注：
   - `slide_title`
   - `message`
   - `layout`
   - `source_evidence`
   - `visual_asset`
4. 不要把详细长文档直接塞进 slide；保留为 source docs 或 reference。

### Step 4: Generate Files（生成文件）

1. 创建输出目录和图片目录：

```sh
mkdir -p "<output_dir>/images"
```

2. 将选定 template 复制或写入：

```sh
cp "<skill-root>/assets/template-swiss.html" "<output_dir>/index.html"
```

或：

```sh
cp "<skill-root>/assets/template.html" "<output_dir>/index.html"
```

3. 替换 `<title>`。
4. 删除 `[必填]`、`SLIDES_HERE` 和模板示例 slide。
5. 插入规划好的 `<section class="slide" data-layout="...">`。
6. 图片统一放入 `<output_dir>/images/`，HTML 使用相对路径 `images/<file>`。

## Verification（验证）

所有 deck 至少运行：

```sh
rg -n "\[必填\]|SLIDES_HERE" "<output_dir>/index.html"
git diff --check -- "<output_dir>/index.html"
```

Swiss Style 必须运行：

```sh
node "<skill-root>/scripts/validate-swiss-deck.mjs" "<output_dir>/index.html"
```

如果上层 workflow 有自己的输出 contract checker，也必须一并运行，例如：

```sh
node assets/source/speclite/support-skills/speclite-docs-intro-ppt-creator/scripts/validate_docs_intro_ppt.mjs --project-root . --html "<output_dir>/index.html"
```

浏览器自动化可用时：

1. 打开 `file://<absolute-output-dir>/index.html`。
2. 抽样保存首尾页截图。
3. 逐页检查核心内容是否超出 viewport。
4. 将是否执行视觉验证写入最终回复。

## Stop Conditions（停止条件）

必须停止并询问用户：

- `output_dir` 未确认且无法安全推导。
- 目标 `index.html` 已存在但用户未授权覆盖。
- 用户要求的事实材料不足，且推断会影响项目口径。
- 选定风格所需 template 或 layout reference 缺失。
- Swiss validator 报错且无法通过局部修复收口。

## Attribution（授权说明）

本 Skill 的模板体系改编自 `guizang-ppt-skill`。发布和修改时必须保留 `references/third-party-notices.md`，并确保 package manifest 包含该文件。
