# File Ownership Boundaries（文件所有权边界）

`File Ownership Boundaries（文件所有权边界）` 是 SpecLite 用于区分 installer-owned、human-owned 和 workflow-owned 文件的更新保护模型。

根据 PRD，系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。该能力支撑 update、repair、validate 和 uninstall 等流程，避免安装器把用户定制内容或 workflow 过程产物当成可覆盖的安装文件。

## installer-owned files

`installer-owned files` 是由 SpecLite installer 生成、管理、验证或修复的文件。

典型范围包括：

- IDE skill mirrors 中的 canonical skill package 投影
- `_speclite` 中的 installer metadata
- manifest/index
- runtime scripts
- files index/hash 记录

installer-owned 不等于可以静默覆盖。若这类文件发生 drift，普通 `update` 应先输出 update plan、impact summary 或 conflict；只有在用户确认、显式 repair 或满足安全写入条件时，installer 才能恢复或重建这些文件。

## human-owned files

`human-owned files` 是由项目维护者或团队人工维护的文件。

典型范围包括：

- `_speclite/custom/*.toml`
- `_speclite/custom/*.user.toml`
- 用户维护的配置覆盖
- 人工编辑的项目文档或定制内容

MVP 默认不修改 human-owned TOML。Fresh install 可以在目标路径不存在时 create-if-absent 创建 stub；如果文件已存在，install、update 和 repair 不得覆盖、重写、重排或格式化。

human-owned 的核心边界是：安装器可以读取它们来解析配置，但不能把它们当成 installer-owned 输出重新生成。

## workflow-owned files

`workflow-owned files` 是已激活 workflow 运行后产生的过程产物。

典型范围包括：

- `_speclite-output` 下的 research 产物
- planning 产物
- implementation 记录
- review 产物
- 其他按配置输出的 workflow artifacts

workflow-owned artifacts 不参与 update 覆盖。它们记录团队的实际研发过程，不是安装器 metadata，也不是 canonical source mirror。

## 更新保护规则

SpecLite 的 install、update 和 repair 必须遵守以下规则：

- installer-owned 文件可以由 installer 管理，但写入前应通过 manifest、hash、ownership 或 update plan 判断安全性。
- human-owned custom 文件不得被无提示覆盖。
- workflow-owned artifacts 不得被 install 或 update 静默覆盖。
- 无法确认安全时，更新流程应保守跳过或报告 conflict。
- `update` 应输出 planned effects、changed paths、skipped paths 和 conflicts，帮助项目维护者理解影响范围。

## 与 PRD 功能需求的关系

该术语对应 PRD 中的文件所有权能力：

- FR37: 系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。
- FR39: 系统可以避免覆盖 human-owned custom 文件。
- FR40: 系统可以避免覆盖 workflow-owned 过程产物。

这组边界的目的不是增加目录复杂度，而是确保 SpecLite 作为安装控制面时，只管理它应管理的文件，并保护用户定制和 workflow 产物。
