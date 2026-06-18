# Changelog

本文件记录 `speclite-brownfield-backend-tech-stack-digger` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.0] - 2026-06-16

### 初始版本

- 新增基于代码事实的既有后端项目技术栈报告契约。
- 新增用户指定 `{output-dir}` 的 Markdown 报告输出约束。
- 新增跨生态 dependency evidence、lockfile、runtime config、deployment evidence 的版本解析优先级规则。
- 新增技术栈分类清单、证据摘要、未确认项和核验命令输出模板。
- 新增双语入口 `SKILL.md` 与 `SKILL.en.md`。

### 已知问题

- 外部服务端版本只能在仓库存在配置、镜像、Helm、Compose 或运维脚本证据时确定；否则必须标记为待运维确认。

---

版本变更类型说明：
- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能

后续版本更新时，在 [1.0.0] 之前插入新版本记录，并同步更新 SKILL.md 与 SKILL.en.md 中的 metadata.version。
