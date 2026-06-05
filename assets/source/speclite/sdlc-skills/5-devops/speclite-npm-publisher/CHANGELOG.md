# Changelog

本文件记录 `speclite-npm-publisher` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.0] - 2026-06-05

### 初始版本

- 发布意图确认：区分咨询、审计、准备和实际 `npm publish`，正式发布前要求用户确认 `package@version`。
- Package 契约审计：从 `package.json` 和真实文件抽取发布事实，覆盖 package metadata、bin、exports、files、publishConfig 和 scripts。
- 官方 registry 凭据检查：固定校验 `https://registry.npmjs.org/` 的登录态，识别镜像 registry 凭据混淆。
- 版本占用判断：发布前检查目标版本是否已存在，禁止复用已发布版本。
- Release gate 编排：优先执行项目已有 `release:check`，否则按现有 scripts 组合 build、test、lint、typecheck。
- Tarball smoke 验证：用真实 `npm pack` tarball 在干净临时目录安装，并按 CLI 或 library 类型执行 smoke。
- 发布后复核：检查 npm metadata、dist-tag、clean `npx` 或 clean install，并处理 registry 传播延迟。
- 故障经验沉淀：覆盖 `E401`、`ENEEDAUTH`、`EOTP`、`E404 PUT scoped package`、`E403`、tarball 漏文件、`.bin` symlink 和本地 `npx` 误解析。

### 已知问题

- 不包含自动修复脚本；发布门禁失败时由执行者按项目实际结构修复或请求用户授权。
- 不覆盖 PyPI、Maven、Cargo、Docker、Homebrew 等非 npm 生态发布。

---

版本变更类型说明：
- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能

后续版本更新时，在 [1.0.0] 之前插入新版本记录，并同步更新 SKILL.md 与 SKILL.en.md 中的 metadata.version。
已知问题修复后，用删除线标注并注明修复版本，如：
- ~~**问题描述**~~ → 已在 vX.Y.Z 修复
