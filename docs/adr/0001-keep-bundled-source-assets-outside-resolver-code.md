# Keep Bundled Source Assets Outside Resolver Code（内置源资产与来源解析器代码分离）

SpecLite 将随产品发布的源定义保存在 `assets/source/speclite/`，而 `src/source/` 只保存 TypeScript source resolver 实现。这个决策避免 bundled skills、modules、runtime assets 和 metadata 与 resolver 代码混淆，并要求所有安装来源都先通过 source resolution 归一为经过校验的 Canonical Source Tree（规范来源树），再进入安装流程。
