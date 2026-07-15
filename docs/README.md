# Docs Directory Guide（文档目录指南）

`docs/` 是 SpecLite 的公开项目文档源，面向使用者、开发者和维护者，承载产品使用、CLI 与 runtime 参考、核心概念和 canonical methodology framework 说明。

本文面向文档维护者，定义目录职责、内容归类、索引关系和引用规范。面向普通读者的导航入口是 [`index.md`](index.md)，具体写作格式遵循 [`_STYLE_GUIDE.md`](_STYLE_GUIDE.md)。

## Scope and Boundaries（范围与边界）

`docs/` 只承载可以长期公开维护的项目知识，不替代以下目录：

| 目录 | 职责 | 与 `docs/` 的关系 |
|---|---|---|
| `assets/source/speclite/` | SpecLite canonical methodology package source，定义 CLI 应安装和投影什么。 | `docs/` 可以解释其结构与治理方式，但不能成为 canonical source。 |
| `_bmad-output/` | planning、Story、review、retrospective、Flow Gate 等研发过程产物。 | 可以作为编写公开文档时的证据来源，但不作为公开文档入口。 |
| `src/`、`test/` | CLI implementation、schema、runtime contract 与可执行验证。 | Reference 文档应与这些事实锚点保持一致。 |
| 目标项目中的 `_speclite/` | 安装后的 metadata/control hub。 | `docs/` 只说明 contract，不保存目标项目状态。 |
| 目标项目中的 `_speclite-output/` | workflow-owned artifact repository。 | `docs/` 只说明目录和生命周期，不承载实际 workflow 产物。 |

## Entrypoints（入口分工）

| 文件 | 主要读者 | 职责 |
|---|---|---|
| [`README.md`](README.md) | 文档维护者 | 说明目录职责、归类决策、索引与引用维护规则。 |
| [`index.md`](index.md) | 文档读者 | 提供公开文档首页、核心主题和分类导航。 |
| [`_STYLE_GUIDE.md`](_STYLE_GUIDE.md) | 文档作者与 reviewer | 规定语言、标题、Markdown、文档类型模板和目标校验方式。 |
| [`quick-start.md`](quick-start.md) | npm package 使用者 | npm package 携带的 Distribution Entrypoint（发布入口），覆盖安装、验证、排错和必要维护。 |
| [`tutorials/quick-start.md`](tutorials/quick-start.md) | 首次学习者 | 按 preview、authorization、status、output、JSON、maintenance 顺序完成首次学习路径。 |

维护者不应把完整文档清单同时复制到 `README.md` 和 `index.md`。新增页面的读者导航归 `index.md` 与各子目录 `index.md` 管理，`README.md` 只维护分类规则和治理状态。

Package-facing `quick-start.md` 必须保持自包含，只引用 `package.json.files` 中实际发布的文件。Tutorial 可以链接完整的 How-To、Explanation 和 Reference 体系，但不复制高级安装变体和完整参数说明。

## Directory Map（目录结构）

```text
docs/
├── README.md
├── index.md
├── _STYLE_GUIDE.md
├── quick-start.md
├── tutorials/
│   └── index.md
├── how-to/
│   └── index.md
├── explanation/
│   └── index.md
├── reference/
│   ├── index.md
│   ├── specs/
│   │   └── index.md
│   ├── skills/
│   │   └── index.md
│   └── glossary/
│       └── index.md
├── glossary/
└── presentations/
    └── index.md
```

## Directory Responsibilities（目录职责）

| 目录 | 文档类型 | 回答的问题 | 归类规则 |
|---|---|---|---|
| [`tutorials/`](tutorials/index.md) | Tutorial | “第一次怎样从头到尾完成一条学习路径？” | 面向新用户，按顺序讲解，必须有前置条件、步骤和可验证结果。 |
| [`how-to/`](how-to/index.md) | How-To | “怎样完成一个明确任务或解决一个具体问题？” | 面向已有基础的用户，以目标和操作步骤为主，不承担完整概念教学。 |
| [`explanation/`](explanation/index.md) | Explanation | “这个概念为什么存在，边界和设计取舍是什么？” | 面向理解与决策，解释原理、关系和取舍；稳定字段与命令细节链接到 Reference。 |
| [`reference/`](reference/index.md) | Reference | “命令、字段、目录、schema 或稳定 contract 是什么？” | 面向查阅，内容应精确、结构稳定，并以源码、schema、fixture 或 canonical source 为事实锚点。 |
| [`reference/specs/`](reference/specs/index.md) | Normative Specification | “公共 schema、字段或行为契约必须遵守什么？” | 只承载已稳定且对实现与消费者具有规范效力的契约；实现 schema、fixtures 和 tests 是 executable anchors。 |
| [`reference/skills/`](reference/skills/index.md) | Skill Catalog | “有哪些 Skill，它们位于哪里、属于什么阶段？” | 只维护 catalog、边界和路由；完整 activation 与 workflow 仍以对应 `SKILL.md` 为准。 |
| [`reference/glossary/`](reference/glossary/index.md) | Glossary | “这个术语的短定义是什么？” | 每个术语保持 1-2 句；需要长篇解释时链接到 `explanation/` 或其他 Reference。 |
| [`glossary/`](glossary/glossary.md) | Legacy Compatibility | “旧术语入口在哪里？” | 兼容旧链接，不再作为新 glossary 的默认落点；新增术语统一进入 `reference/glossary/`。 |
| [`presentations/`](presentations/index.md) | Supplementary Public Material | “是否有适合演示、分享或发布的可视化材料？” | 保存独立演示产物及其局部资源，不替代主要公开文档或规范性说明；关键结论必须能追溯到正式文档。 |

## Classification Decision（归类决策）

新增文档前，先按读者的首要问题确定唯一主类型：

| 首要问题 | 放置位置 | 典型内容 |
|---|---|---|
| 用户需要跟随步骤学习完整流程 | `tutorials/` | 第一次安装、第一次 brownfield baseline。 |
| 用户已知道目标，只需要完成任务 | `how-to/` | 安装、验证、更新、修复、CI 自动化。 |
| 用户需要理解概念、边界或设计原因 | `explanation/` | local-first control plane、ownership model、runtime boundaries。 |
| 用户需要准确查找稳定事实 | `reference/` | CLI options、JSON schema、runtime layout、validation issues。 |
| 用户或实现者需要遵守明确的公共契约 | `reference/specs/` | CommandResult JSON contract、未来稳定的 public schema contract。 |
| 用户只需要术语短定义 | `reference/glossary/` | Flow Gate、workflow artifact、ownership 术语。 |
| 内容主要用于现场讲解或视觉展示 | `presentations/<topic>/` | 单页 HTML deck 及其本地资源。 |

一篇文档可能同时包含步骤、解释和字段表，但必须保留一个主目的。混合内容按以下方式拆分：

- Tutorial 中只保留完成学习路径所需的最小解释，深层原理链接到 `explanation/`。
- How-To 中只保留完成任务所需的参数，完整命令和字段链接到 `reference/`。
- Explanation 不复制完整 catalog、schema 或 option matrix，改为链接到 Reference。
- Reference 不展开长篇设计理由，改为链接到 Explanation。
- Glossary 不承载长篇教程、边界论证或实现细节。

## Indexing Rules（索引规则）

每篇面向普通读者的公开 Markdown 正文必须可以从 [`index.md`](index.md) 经有限层级到达。面向维护者的 `README.md` 由 GitHub 目录页直接展示，不要求复制到读者主题索引中。

新增、重命名或迁移文档时，按顺序维护：

1. 更新同目录或最近父目录的 `index.md`。
2. 如果文档是核心主题或新的分类入口，再更新 [`index.md`](index.md)。
3. 如果根目录 [`README.md`](README.md) 中的职责、例外或已知迁移状态发生变化，再同步本文。
4. 如果移动已有文档会破坏公开链接，保留最小兼容页并指向新的主要公开文档。
5. 不把 `_bmad-output/` 中的过程文档登记为 public docs 导航入口。

`index.md` 负责“读者去哪里”，子目录 `index.md` 负责“这一类有哪些文档”，正文页负责“当前主题与哪些前后主题相关”。三者不能互相替代。

### Publication Gate（发布门槛）

进入读者索引的页面至少必须具备明确目标、当前事实依据、完成首要任务所需的核心内容、可验证结果或稳定字段，以及合理的相关文档。未达到这些要求的页面必须标记 `Draft（草稿）` 并移出所有 `index.md`；旧链接已经公开时，可以保留带显著 Draft 标记的入口，但不能把它描述为完整指南。

## Linking Rules（引用规则）

文档关系不仅要求链接可打开，还要求读者能够沿任务、概念和 contract 找到相邻信息。

### Required Relationships（必要关系）

- Tutorial 应链接到后续 How-To 和关键 Reference。
- How-To 应链接到它实际使用的 CLI、配置、JSON 或 layout Reference。
- Explanation 应链接到对应 Reference；如果存在相反方向的高价值导航，Reference 也应链接回 Explanation。
- Glossary 应链接到术语的详细 Explanation 或 Reference，不复制长篇正文。
- Presentation 应链接到支撑其结论的主要公开文档或规范性说明；正式索引也应提供演示入口并说明其补充性质。
- 兼容页必须明确主要替代文档，避免两个位置同时演进成事实来源。

### Link Format（链接格式）

- `docs/` 内统一使用相对链接，不写本机绝对路径。
- 默认链接到主要公开文档，不把 legacy compatibility page 当作新文档的依赖入口。
- 链接标题锚点时，修改标题后必须同步检查 fragment。
- 链接源码、schema 或 canonical source 时，优先指向稳定文件；容易漂移的具体行号只用于审查报告，不写入长期公开文档。
- 链接 `_bmad-output/` 时必须说明它是历史证据或过程产物，不能把它描述为 public contract source。
- 外部链接应指向权威来源，并在提交前检查可访问性和重定向结果。

### Related Documents（相关文档）

除纯索引页、Draft、Frozen Compatibility 和 Distribution Entrypoint 外，正文页应在末尾区域提供带关系类型的 `Related Documents（相关文档）`：

| 文档类型 | 必要关系 |
|---|---|
| Tutorial | 下一步 How-To、关键 Reference。 |
| How-To | 实际使用的 CLI、配置、JSON 或 layout Reference。 |
| Explanation | 对应 Reference，以及必要的 Glossary。 |
| Reference | 规范性说明或 executable anchor，以及高价值 Explanation。 |
| Presentation | 支撑结论的主要公开文档或规范性说明。 |
| Compatibility Entry | 唯一明确的主要替代文档。 |

只被父索引列出不代表引用关系完整；正文页仍应提供离开当前页面后的合理下一步。

## New Categories（新增分类）

现有 Diátaxis 四类、Glossary 和 Presentation 已覆盖当前顶层文档形态。Normative Specification 作为 Reference 子类型放入 `reference/specs/`，不新增顶层目录。

只有同时满足以下条件时才新增分类：

- 内容有稳定且独立的读者任务，无法合理归入现有分类。
- 预计持续产生多篇文档，而不是为单篇文档创建目录。
- 新分类不会复制 canonical source、研发过程产物或现有 Reference catalog。
- 已定义目录职责、文件命名、入口 `index.md` 和与现有分类的交叉引用规则。
- 已同步更新 [`index.md`](index.md)、本文和 [`_STYLE_GUIDE.md`](_STYLE_GUIDE.md) 中受影响的规范。

如果只是主题不同，优先在现有分类下新增文档；如果只是附件或局部资源，优先放入对应文档的同名资源子目录。

## Current Migration State（当前迁移状态）

当前目录结构已经形成稳定主干，但仍有以下已知整理项：

| Area | Current State | Follow-up |
|---|---|---|
| Active indexes | `tutorials/`、`how-to/`、`explanation/`、`reference/`、`reference/specs/`、`reference/skills/`、`reference/glossary/` 只索引达到最低可发布标准的正文。 | 新增文档时继续执行最近父索引更新。 |
| Legacy glossary | [`glossary/glossary.md`](glossary/glossary.md) 和 4 个旧页面是 Frozen Compatibility surface，并指向主要术语表与详细文档。 | 旧路径只维护跳转和必要兼容说明；新增术语进入 `reference/glossary/`。 |
| Long-form glossary pages | Runtime boundaries 与 IDE discovery 长文已迁入 `explanation/`；file ownership 与 workflow artifact 分别链接到详细 Explanation / Reference。 | 避免旧路径和主要公开文档双写同一事实。 |
| Draft pages | `explanation/` 下 2 篇、`how-to/` 下 1 篇、`reference/` 下 2 篇仍是 Draft，共 5 篇，已移出读者索引；`tutorials/` 当前没有 Draft。 | 达到最低可发布标准后再恢复索引；扩写前先确认规范性说明或 executable evidence。 |
| Related-document links | 主要公开正文已按任务、概念和契约关系补齐 `Related Documents（相关文档）`；`docs:check` 校验结构存在。 | Reviewer 继续判断关系语义是否真实，不为对称机械增加反向链接。 |
| Presentations | [`presentations/index.md`](presentations/index.md) 与 deck README 提供补充材料入口、适用范围和事实来源。 | 新增 deck 时同步登记 catalog 与主要公开文档。 |
| Public path portability | [`index.md`](index.md) 的 migrated material 已改为 repository-neutral 项目标识，不再暴露本机绝对路径。 | 后续新增公开文档继续使用相对路径、公开 URL 或 repository-neutral 标识。 |

## Maintenance Workflow（维护流程）

新增或迭代文档时执行以下检查：

1. 读取本文和 [`_STYLE_GUIDE.md`](_STYLE_GUIDE.md)，确认主类型和目标读者。
2. 从 CLI implementation、schema、tests、fixtures 或 canonical source 核对事实，不凭历史过程文档补全当前 contract。
3. 更新正文与最近父索引；核心主题同步更新 [`index.md`](index.md)。
4. 补齐带关系类型的 `Related Documents（相关文档）`，检查任务链、概念链和 contract 链。
5. 运行 `npm run docs:check`，校验链接、fragment、索引可达性、package 边界、Draft 状态和必要关系。
6. 运行 `git diff --check`。

## Review Checklist（评审清单）

- [ ] 文档只有一个明确主类型，路径与类型一致。
- [ ] 正文和章节标题符合中文与 English（中文）规则。
- [ ] 技术事实有当前源码、schema、fixture、test 或 canonical source 支撑。
- [ ] 最近父索引已更新，核心主题已进入 `docs/index.md`。
- [ ] 正文包含合理的前置、下一步或相关 contract 链接。
- [ ] 所有相对链接、fragment、图片和局部资源可解析。
- [ ] 没有新增本机绝对路径，也没有将 `_bmad-output/` 当作公开事实源。
- [ ] 兼容入口与主要替代文档的关系清楚。
- [ ] 新分类满足独立职责、多文档规模和索引要求。
- [ ] `git diff --check` 通过。
- [ ] `npm run docs:check` 通过。
