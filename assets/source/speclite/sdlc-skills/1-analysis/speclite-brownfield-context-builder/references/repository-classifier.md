<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Repository Classifier — 仓库分类与结构识别

> 本文档定义仓库类型判定标准、part 划分规则、技术栈识别规则和文档索引规则。
> Phase 1 的核心参考文件。由 `scan_repo.py` 脚本执行实际扫描。

## 1 仓库类型判定标准

### 1.1 三种仓库类型

| 类型 | 定义 | 典型特征 |
|:-----|:-----|:---------|
| **monolith** | 单体项目，一个代码库一个应用 | 单个 package.json / pom.xml / go.mod 在根目录 |
| **monorepo** | 单仓多包，一个代码库多个独立包/应用 | 有 workspaces / lerna.json / nx.json / turbo.json |
| **multi-part** | 多部分项目，一个代码库包含多个逻辑子系统 | 根目录下有 2+ 个 PART_INDICATORS 匹配的目录（如 server/ + client/） |

### 1.2 判定优先级

```
1. 检查 monorepo 指标（最高优先）：
   - package.json 中有 "workspaces" 字段 → monorepo
   - 存在 lerna.json → monorepo
   - 存在 nx.json → monorepo
   - 存在 turbo.json → monorepo

2. 检查 multi-part 指标：
   - 根目录下有 ≥2 个 Part 指标目录（见§2）→ multi-part

3. 默认：
   - monolith
```

## 2 Part 划分规则

### 2.1 Part 指标目录

以下根目录名自动识别为 Part：

| 目录名 | Part 类型 | 说明 |
|:-------|:----------|:-----|
| `client`, `frontend`, `web`, `app` | frontend | 前端/客户端 |
| `server`, `backend`, `api` | backend | 后端/服务端 |
| `worker`, `jobs` | worker | 后台任务/队列消费者 |
| `packages`, `libs` | packages | 共享库/工具包 |
| `sdk` | sdk | SDK |
| `infra`, `infrastructure`, `deploy` | infra | 基础设施/部署 |
| `tools`, `scripts` | tools | 工具脚本 |

### 2.2 Part 信息提取

每个 Part 需提取：
- **name**：目录名
- **path**：相对路径（含 `/`）
- **type**：frontend / backend / worker / packages / sdk / infra / tools
- **language**：该 Part 目录下的主要语言（按文件数统计）
- **framework**：该 Part 目录下检测到的框架
- **entry_point**：入口文件（index.ts / main.py / Main.java 等）

## 3 技术栈初步识别规则

### 3.1 语言检测

按文件扩展名统计，排序后取 top-N：

| 扩展名 | 语言 |
|:-------|:-----|
| `.py` | Python |
| `.js` | JavaScript |
| `.ts`, `.tsx` | TypeScript |
| `.java` | Java |
| `.kt`, `.kts` | Kotlin |
| `.go` | Go |
| `.rs` | Rust |
| `.rb` | Ruby |
| `.php` | PHP |
| `.swift` | Swift |
| `.dart` | Dart |
| `.vue` | Vue |
| `.svelte` | Svelte |

### 3.2 框架检测

通过根目录（或 Part 目录）的配置文件及依赖声明检测：

| 配置文件 | 检测方式 | 可识别框架 |
|:---------|:---------|:-----------|
| package.json | 解析 dependencies / devDependencies | React, Next.js, Vue, Nuxt, Angular, Svelte, Express, Fastify, Koa, NestJS, Hono, Elysia |
| pyproject.toml | 内容关键词匹配 | Django, Flask, FastAPI, Starlette |
| requirements.txt | — | Python |
| go.mod | — | Go |
| Cargo.toml | — | Rust |
| pom.xml | — | Maven + Java |
| build.gradle(.kts) | — | Gradle + Java/Kotlin |
| Gemfile | — | Ruby |
| composer.json | — | PHP |
| pubspec.yaml | — | Flutter + Dart |

### 3.3 包管理器检测

按 lock 文件识别：

| Lock 文件 | 包管理器 |
|:----------|:---------|
| package-lock.json | npm |
| yarn.lock | yarn |
| pnpm-lock.yaml | pnpm |
| bun.lockb | bun |
| poetry.lock | poetry |
| uv.lock | uv |
| go.sum | go |
| Cargo.lock | cargo |

## 4 现有文档索引规则

### 4.1 文档发现

扫描整个仓库中扩展名为 `.md`, `.rst`, `.txt`, `.adoc`, `.org` 的文件，过滤条件：
- 文件名包含文档指示词：readme, changelog, contributing, license, architecture, design, api, guide, tutorial, manual, spec, docs
- 或文件位于名称含 "doc" 的目录下

### 4.2 文档分类

| 分类 | 匹配规则 |
|:-----|:---------|
| readme | 文件名含 "readme" |
| changelog | 文件名含 "changelog" |
| architecture | 文件名含 "architect" |
| api | 文件名含 "api" |
| deployment | 文件名含 "deploy" 或 "infra" |
| guide | 文件名含 "guide" 或 "tutorial" 或 "contributing" |
| other | 以上均不匹配 |

### 4.3 标题提取

从每个文档的前 20 行中提取第一个 `# ` 标题作为文档标题。无标题时使用文件名。

## 5 历史文档来源识别规则

### 5.1 自动发现

- 扫描 `{project-root}/docs/history/` 目录（默认路径）
- 扫描用户通过 `--history-sources` 指定的路径

### 5.2 来源标签

所有索引的文档标注来源标签：

| 标签 | 含义 |
|:-----|:-----|
| `code` | 从代码中提取的事实 |
| `current-doc` | 仓库内现有文档 |
| `historical-doc` | 历史 PRD / 技术方案等 |
| `user-guidance` | 用户手动补充的信息 |

## 6 输出文件说明

| 文件 | 内容 | 格式 |
|:-----|:-----|:-----|
| `evidence/repo-manifest.json` | 仓库结构清单：类型、语言、框架、Parts、目录、配置、文档 | JSON |
| `evidence/existing-doc-inventory.json` | 现有文档索引：路径、类型、标题、来源标签 | JSON |

详细字段 schema 见 `references/evidence-schema.md`。
