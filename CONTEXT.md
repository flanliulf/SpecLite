# SpecLite

SpecLite 是一个本地安装器与治理层，用于把 SpecLite 方法论源定义安装到目标项目和多个 AI IDE 中，并保持安装结果可发现、可验证、可更新。

## Language（语言）

**Canonical Source Tree（规范来源树）**:
经过校验的 SpecLite 源定义树，安装器可以将其打包、镜像到 AI IDE skill 目录，并记录到 manifest 中。
_避免_: `_bmad`、`_bmad-output`、开发辅助产物

**Bundled Source Assets（内置源资产）**:
随产品发布的 SpecLite 源定义，存放在 `assets/source/speclite/`，安装时由 source resolver 读取。
_避免_: `src/source/`、resolver 实现代码

**Source Resolver（来源解析器）**:
位于 `src/source/` 的 TypeScript 实现，用于把内置源、npm、tarball、offline bundle、Git 或 local source 归一为 **Canonical Source Tree（规范来源树）**。
_避免_: 内置源资产、skill package 内容

**Node Config Resolver（Node 配置解析器）**:
MVP 中由 Node/TypeScript 实现的配置与定制化解析器，负责替代旧 Python resolver，并以 Python parity fixture 证明行为兼容。
_避免_: Python runtime dependency、重新发明合并语义

**Resolver Runtime Entry（解析器运行入口）**:
skills 调用配置与定制化解析能力时使用的稳定产品接口，例如 `speclite resolve config` 与 `speclite resolve customization`，或安装器生成的薄 wrapper。
_避免_: `node dist/...`、内部构建产物路径、Python 脚本入口

**Runtime Support Command（运行时支撑命令）**:
MVP 必须实现但不作为主用户旅程宣传的 CLI surface，用于支撑已安装 skills 的运行时能力。
_避免_: Post-MVP 可选命令、内部私有 API

**Python Resolver Baseline（Python 解析器基线）**:
现有 `resolve_config.py` 与 `resolve_customization.py` 的输入、合并规则、错误处理和 JSON 输出行为，用作 Node resolver 迁移期的兼容性基线。
_避免_: MVP 主运行时依赖、长期运行入口

**SpecLite Source Definition（SpecLite 源定义）**:
由 SpecLite 作者维护的 skill、module、runtime、script 和 metadata 内容，作为产品源码的一部分被安装到用户项目中。
_避免_: 已安装项目状态、BMad 工作文件

**Installer Control Plane（安装控制面）**:
Node-first CLI 系统，负责解析源定义、写入 runtime metadata、创建 IDE mirrors、验证安装健康度，并在 update 时保护受所有权管理的文件。
_避免_: 文件复制器、prompt library

**IDE Execution Plane（IDE 执行面）**:
目标 AI IDE 的 skill 目录，用于加载并执行已安装的 SpecLite skill packages。
_避免_: `_speclite` runtime、source tree

**Artifact Repository（产物仓库）**:
目标项目中配置的 workflow artifact 输出位置，用于保存 SpecLite skills 生成的过程产物。
_避免_: installer metadata、source definitions

**BMad Development Artifacts（BMad 开发辅助产物）**:
由于本项目自身使用 BMad 辅助开发而产生的 `_bmad/` 和 `_bmad-output/` 目录。
_避免_: SpecLite 源定义、installer-owned 产品文件

## Relationships（关系）

- **SpecLite Source Definition（SpecLite 源定义）** 随产品发布时位于 **Bundled Source Assets（内置源资产）** 中，经 source resolution 和 validation 后成为 **Canonical Source Tree（规范来源树）**。
- **Source Resolver（来源解析器）** 从 `assets/source/speclite/` 读取 **Bundled Source Assets（内置源资产）**；`src/source/` 存放 resolver 代码，不存放内置 skill 内容。
- **Node Config Resolver（Node 配置解析器）** 必须覆盖 **Python Resolver Baseline（Python 解析器基线）** 中的四层 config merge、三层 customization merge、`--key` 抽取和 JSON 输出语义。
- **Resolver Runtime Entry（解析器运行入口）** 暴露 **Node Config Resolver（Node 配置解析器）** 的能力；skill instructions 只能依赖这个稳定入口，不得依赖 `dist/` 内部文件路径。
- `speclite resolve config` 与 `speclite resolve customization` 是 **Runtime Support Command（运行时支撑命令）**，属于 MVP 支撑 API，但不是面向终端用户宣传的主命令。
- **Python Resolver Baseline（Python 解析器基线）** 只作为迁移参考和 parity fixture oracle；通过兼容性验证后，正式安装后的 skills 不应依赖 Python resolver。
- **Installer Control Plane（安装控制面）** 将 **Canonical Source Tree（规范来源树）** 安装到 **IDE Execution Plane（IDE 执行面）** 和目标项目 runtime metadata 中。
- **IDE Execution Plane（IDE 执行面）** 执行已安装的 skills，这些 skills 可以把 workflow 输出写入 **Artifact Repository（产物仓库）**。
- **BMad Development Artifacts（BMad 开发辅助产物）** 可以作为规划过程参考，但不是 **Canonical Source Tree（规范来源树）** 的一部分，也不得进入 installer scope、IDE mirrors 或新的 SpecLite manifests。

## Example Dialogue（示例对话）

> **Dev:** “安装器是否应该扫描 `_bmad/`？它里面也有 manifest 和 skill list。”
> **Domain expert:** “不应该。`_bmad/` 存在是因为这个仓库本身使用 BMad 辅助开发。SpecLite 内置源定义位于 `assets/source/speclite/`。”

## Flagged Ambiguities（已澄清歧义）

- “`_bmad/` 看起来像可安装 source tree，因为它包含 manifests 和 skills” — 已澄清：它是 BMad 辅助开发产物，不是 SpecLite 产品源。
- “`references/source/speclite` 看起来只是 reference-only 文件夹” — 已澄清：该过渡目录已迁移到 `assets/source/speclite/`，`references/` 不再作为产品源或参考源保留。
- “`src/source/` 听起来像 SpecLite 源定义未来归宿” — 已澄清：它是 source resolver 实现目录；内置源定义存放在 `assets/source/speclite/`。
- “Node-first 是否意味着可以直接丢弃 Python resolver 语义” — 已澄清：不可以。Node resolver 要替代 Python runtime 依赖，但必须先通过 Python parity fixture 证明合并与输出行为兼容。
- “skills 是否可以调用 `node dist/...` 来使用 Node resolver” — 已澄清：不可以。skills 应调用稳定的 **Resolver Runtime Entry（解析器运行入口）**，例如 `speclite resolve ...` 或安装器生成的薄 wrapper。
- “`speclite resolve` 是否是 Post-MVP 命令” — 已澄清：不是。它是 MVP 的 **Runtime Support Command（运行时支撑命令）**，用于支撑 skill 激活时读取 config/customization。
