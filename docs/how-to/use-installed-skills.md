# Use Installed Skills（使用已安装 Skills）

本文后续用于说明如何在目标 IDE 的 skill directory 中发现和使用已安装的 SpecLite skills。

## Runtime Prerequisite（运行时前提）

已安装 Skill 的默认激活路径依赖 Node CLI：当前 AI 会话的 shell 必须能从 `PATH` 中执行 `speclite`。激活前应先运行 `command -v speclite >/dev/null 2>&1`；如果不可用，Skill 必须 HALT，并报告 `SpecLite CLI command speclite is not available in this AI session PATH`。

处理方式是把已安装或本地构建的 `speclite` Node CLI 暴露到当前会话 `PATH` 后重试。不要回退到 Python resolver、不要读取 source checkout resolver，也不要只读取 `_speclite/config.toml`。

需要 runtime config 或 customization 时，installed Skill 必须使用：

```sh
speclite resolve config --project-root /path/to/project
speclite resolve customization --skill /path/to/project/.agents/skills/<skill-name> --project-root /path/to/project
```

## Status（状态）

待补充。
