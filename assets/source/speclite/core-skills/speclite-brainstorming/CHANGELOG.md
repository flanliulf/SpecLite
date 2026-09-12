# Changelog

本文件记录 `speclite-brainstorming` 的版本变更。

## [1.1.0] - 2026-09-12

### 变更

- Brainstorming session 输出根改用 `SPEC 09` 的 `{brainstorming_artifacts}` placeholder，不再硬编码 `{output_folder}/brainstorming`。
- `references/workflow.md` 增加 `speclite resolve artifact-roots` 解析步骤，要求从 `brainstorming_artifacts.resolvedRoot` 取得输出根，缺失时 HALT，不在 workflow 内手写 fallback。
- `references/steps/step-01-session-setup.md` 的既有 session 扫描目录同步改为 `{brainstorming_artifacts}/`。
- `config.toml.example` 补充 `core.brainstorming_artifacts` 字段说明。

### 兼容性

- Existing install 缺少 `core.brainstorming_artifacts` 时，由 resolver 按 `SPEC 09` fallback 到 `{output_folder}/brainstorming`；本 Skill 不迁移既有 brainstorming artifacts。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-brainstorming` 迁移 Brainstorming core Skill。
- 将 workflow 和 steps 迁入 `references/`，将模板迁入 `assets/`。
- 转换配置来源、模板路径和输出标注到 Speclite 运行模型。

### 已知限制

- 长步骤文件保留源流程语义，后续如需更细的 Speclite 状态机可继续拆分优化。
