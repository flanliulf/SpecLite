# Customize A Skill（自定义 Skill）

本文说明如何为已安装的 SpecLite Skill 添加团队级或个人级 customization，并验证合并结果。整个过程只写 `_speclite/custom/` 下的 human-owned 文件，不修改 installer-owned 的 Skill mirror 或 `_speclite/config.toml`。

## When to Use This（何时使用）

- 需要固定某个 Agent 的 persona、菜单或激活提示，例如让 `speclite-agent-pm` 总是先读团队的产品原则。
- 需要改变某个 Workflow 的默认模板、输出语言或步骤提示。
- 需要为整个项目固定共享配置（`custom/config.toml`），或为自己固定本地偏好（`custom/config.user.toml`）。

## When to Skip This（何时跳过）

- 想修改 Skill 的正文逻辑或步骤文件。这属于 canonical source 变更，应回到 `assets/source/speclite/` 走维护者流程，见 [`../reference/canonical-source-governance.md`](../reference/canonical-source-governance.md)。
- 想改变 installer 生成的 official default。应重新运行 `speclite init` 或 `speclite install`，不要手改 `_speclite/config.toml`。

## Prerequisites（前置条件）

- 目标项目已完成安装且 `speclite validate` 通过，见 [`validate-installation.md`](validate-installation.md)。
- 当前 AI 会话 `PATH` 中可以执行 `speclite`。
- 已阅读 [`../reference/config-and-customization.md`](../reference/config-and-customization.md) 中的合并顺序：base `customize.toml` → team `custom/<skill>.toml` → user `custom/<skill>.user.toml`。

## Steps（步骤）

1. 查看目标 Skill 暴露了哪些可定制项。每个已安装 Skill 的 `customize.toml` 是唯一权威来源，例如：

   ```sh
   cat .agents/skills/speclite-agent-pm/customize.toml
   ```

   只有其中出现的字段才能被覆盖；`customize.toml` 没有暴露的行为不能通过 override 改变。

2. 选择覆盖面与落点。`[agent]` 段影响 role activation，`[workflow]` 段影响 workflow 执行；团队共享写 `_speclite/custom/<skill>.toml`，个人偏好写 `_speclite/custom/<skill>.user.toml`。

3. 写一个稀疏 override，只包含要改变的字段，不复制完整 `customize.toml`：

   ```toml
   # _speclite/custom/speclite-agent-pm.toml
   [agent]
   communication_style = "先给结论，再给依据；全程使用中文。"
   principles = ["需求澄清前先阅读 docs/product-principles.md。"]
   ```

   标量字段（如 `communication_style`）由 override 覆盖，数组字段（如 `principles`、`persistent_facts`）追加，带 `code` 的 `[[agent.menu]]` 按 `code` 替换或追加；合并规则写在每个 `customize.toml` 的注释里。

4. 用 Node CLI resolver 验证合并结果，确认 override 已生效且没有引入未知字段：

   ```sh
   speclite resolve customization --skill .agents/skills/speclite-agent-pm --project-root . --key agent
   speclite resolve customization --skill .agents/skills/speclite-agent-pm --project-root . --key agent --human
   ```

   默认 stdout 是 merged JSON；`--human` 会额外显示每个 key 的 effective source（base、team 或 user）。

5. 需要固定项目级或个人级共享配置时，同样只写 `_speclite/custom/config.toml` 或 `_speclite/custom/config.user.toml`，然后用 `speclite resolve config --project-root .` 核对 merged config。

6. 把 `_speclite/custom/*.toml` 提交到仓库，`*.user.toml` 保持本地。之后的 `speclite update` 会以 `skip`（`reason: human-owned`）跳过它们，`speclite uninstall` 会 preserve 它们。

> Tip: 安装了 core skills 的项目可以在 AI 会话中调用 `speclite-customize`（菜单码 `SC`），由它扫描可定制项、生成稀疏 TOML 并在写入前展示 diff；它的写入位置与验证命令和本文一致。

## What You Get（产出物）

- `_speclite/custom/<skill>.toml` 或 `<skill>.user.toml`：human-owned override 文件。
- `speclite resolve customization` 输出的 merged JSON 作为验证证据。
- 后续 update / repair / uninstall 不会覆盖或删除这些文件。

## Tips（提示）

- 一次只改一个 Skill 并立即用 resolver 验证，避免多个 override 互相掩盖。
- 不要在 override 里放绝对路径或凭据；`_speclite/custom/config.toml` 会被提交到仓库。
- override 无效时，先检查字段是否真的存在于该 Skill 的 `customize.toml`，再检查 team 与 user 文件的覆盖顺序。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 配置与 customization 参考 | [`../reference/config-and-customization.md`](../reference/config-and-customization.md) |
| resolve 命令参考 | [`../reference/cli.md`](../reference/cli.md) |
| 文件所有权解释 | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| 首次调用 installed Skill | [`use-installed-skills.md`](use-installed-skills.md) |
| Core Skills catalog | [`../reference/skills/core-skills.md`](../reference/skills/core-skills.md) |
