# Source Assets（源资产）

`assets/source/` 是 SpecLite 产品随仓库发布的 source assets 根目录，用于承载可被安装器读取、校验、打包和分发的权威源内容。

当前该目录下的主要子目录是 `speclite/`，它是 SpecLite 内置方法论内容的 canonical source catalog。

## Positioning（定位）

`assets/source/` 的职责是保存“应该安装什么”，而不是保存“某个目标项目已经安装了什么”。

在当前项目中：

- `assets/source/speclite/` 保存 Speclite Skill、module metadata、支撑工具、共享运行时脚本源码和 customization 示例。
- 这些 source packages 会被安装器投影到目标项目中的 IDE skills 目录、`_speclite/` runtime control hub 和相关 manifest/index。
- installed state、IDE mirror、runtime config 和 workflow artifacts 都不应该反向定义这里的 source truth。

换句话说，`assets/source/` 是 source-side truth 的根；目标项目中的安装结果只是它的 installed projection。

## Runtime Boundaries（运行边界）

不要把 `assets/source/` 误用为运行时路径。安装后的目标项目应使用自己的目录结构：

- `.claude/skills/` 或 `.agents/skills/`：IDE execution plane，用于让 AI IDE 发现、加载和执行已安装 Skill。
- `_speclite/`：metadata/control hub，用于保存配置、manifest、index、runtime scripts、customization 入口和安装状态。
- `_speclite-output/`：workflow artifact repository，用于保存 planning、implementation、review 等过程产物。

`assets/source/` 与这些目录的关系是 source-to-projection，而不是 runtime dependency。Skill 执行规约中不应把 `assets/source/speclite/scripts`、`assets/source/speclite/custom` 或其他仓库源码路径写成目标项目的运行时依赖。

## Current Catalog（当前目录）

当前 `assets/source/` 包含：

| 路径 | 定位 |
| ---- | ---- |
| `speclite/` | SpecLite 官方内置 source catalog，承载 core skills、SDLC skills（含 DevOps 发布阶段）、共享 scripts、customization 示例和 module metadata。 |

其中 `assets/source/speclite/` 的内部说明见 [`speclite/README.md`](speclite/README.md)。

## Source Of Truth（真源）

对安装链路而言，`assets/source/speclite/` 下的 module metadata 和 source skill packages 定义：

- canonical modules
- canonical skill ids
- source package content
- phase metadata
- help/menu labels
- default artifact contracts
- DevOps release and deployment skill definitions

manifest/index 是安装后的投影；IDE mirrors 是可再生成的 execution-plane projections。它们可以用于验证安装状态，但不能成为新的 canonical source。

## Related References（相关参考）

- [`speclite/README.md`](speclite/README.md)：Speclite source catalog 的目录结构和维护约定。
- [`../../docs/glossary/speclite-runtime-boundaries.md`](../../docs/glossary/speclite-runtime-boundaries.md)：canonical source、IDE skills、`_speclite` 和 `_speclite-output` 的边界说明。
- [`../../_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`](../../_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md)：manifest/index 与 source-side truth 的契约。
