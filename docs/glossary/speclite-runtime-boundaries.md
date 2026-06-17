# SpecLite Runtime Boundaries（SpecLite 运行边界）

`SpecLite Runtime Boundaries（SpecLite 运行边界）` 是一组用于区分安装系统职责的核心概念：canonical source、IDE skills 目录、`_speclite` 和 `_speclite-output`。

根据 `product-brief-SpecLite.md` 的 Technical Approach：

> canonical source 是权威来源，IDE skills 目录是可再生成 execution plane，`_speclite` 是 metadata/control hub，`_speclite-output` 是过程产物仓库。

这些概念容易混淆，因为它们都会出现在安装链路中，但它们的职责、所有权和更新策略不同。

## Canonical Source（规范来源）

`canonical source` 是 SpecLite 方法论内容的权威来源。

它表示安装器应读取、校验并分发的规范源内容，例如 source skill package、module metadata、runtime scripts 和相关 source definitions。

在当前项目中，随产品发布的内置源资产位于 `assets/source/speclite/`。`src/source/` 是 source resolver 代码，不是 canonical source 内容本体。

canonical source 的关键职责是定义“应该安装什么”。它不是目标项目中的运行状态，也不是 IDE-specific mirror。

## IDE Skills Directory（IDE Skills 目录）

IDE skills 目录是目标 AI IDE 的 execution plane。

例如：

- `.claude/skills`
- `.agents/skills`

这些目录用于让 IDE 发现、加载和执行已安装的 SpecLite skills。它们承载的是 canonical skill package 在具体 IDE execution plane 中的安装投影。

IDE skills 目录应该可再生成。也就是说，如果 IDE mirror 发生 drift，安装器可以基于 canonical source、manifest/index 和 update/repair 规则重新生成或修复 installer-owned 内容。

IDE skills 目录不应成为新的权威来源，也不应承载 human-owned customization 或 workflow-owned artifacts。

## Speclite Control Hub（Speclite 控制中心）

`_speclite` 是目标项目中的 metadata/control hub。

它用于保存安装控制面需要的项目级元数据、配置、manifest、index、runtime scripts、customization 入口和安装状态。

`_speclite` 的职责是回答“当前项目安装了什么、如何解析配置、如何验证和更新”。它不是 skill execution directory，也不是 workflow 产物存放区。

安装器可以管理 `_speclite` 中的 installer-owned 文件，但必须保护 human-owned custom 文件，例如 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml`。

`_speclite/scripts/resolve_*.py` 是特殊的 installer-owned compatibility projection。它们只用于 legacy compatibility、migration aid 和 troubleshooting，并在 `files-index.json` 中以 `runtime-compat-script` 记录。唯一默认 installed Skill activation resolver 是 Node CLI 的 `speclite resolve config` 和 `speclite resolve customization`；Python scripts 不是默认 runtime dependency，也不是推荐的正常激活路径。

## Speclite Output Repository（Speclite 产物仓库）

`_speclite-output` 是过程产物仓库，也就是 workflow artifact repository。

它用于存放已激活 workflow 输出的 research、planning、implementation、review 等过程产物。

`_speclite-output` 的职责是承载“workflow 执行产生了什么”。它不定义 skill 内容，不保存安装控制元数据，也不应被 install 或 update 静默覆盖。

这些文件通常应视为 workflow-owned artifacts。更新流程必须保护它们，避免覆盖用户或 workflow 已生成的过程记录。

## Comparison Table（对比表）

| 概念 | 主要职责 | 是否权威来源 | 是否可再生成 | 典型所有权 |
| --- | --- | --- | --- | --- |
| `canonical source` | 定义应安装的 SpecLite 方法论内容 | 是 | 不适用，源本身应被维护和发布 | source-owned |
| IDE skills 目录 | 让 IDE 发现、加载和执行 skills | 否 | 是，基于 canonical source 再生成 | installer-owned mirror |
| `_speclite` | 保存安装元数据、配置、manifest/index 和 runtime 控制信息 | 否 | 部分可再生成，human custom 受保护 | installer-owned + human-owned |
| `_speclite-output` | 保存 workflow 过程产物 | 否 | 否，产物应保留 | workflow-owned |

## Key Rules（关键规则）

- canonical source 决定安装内容，IDE skills 目录只是安装投影。
- IDE skills 目录可以被 update/repair 修复，但不能反向定义 canonical source。
- `_speclite` 是控制面和元数据中心，不是 skill 执行目录。
- `_speclite-output` 是过程产物仓库，不是 installer metadata 或 source definitions。
- install、update 和 repair 可以管理 installer-owned 文件，但不得静默覆盖 human-owned custom 文件或 workflow-owned artifacts。
