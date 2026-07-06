# Changelog

本文件记录 `speclite-brownfield-nodejs-backend-tech-stack-digger` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.0] - 2026-06-16

### 初始版本

- 新增 Node.js 后端技术栈专属分析工作流。
- 新增 npm / pnpm / Yarn / Bun、workspace、lockfile 和 package manager 版本解析规则。
- 新增 Express、NestJS、Fastify、Koa、Prisma、TypeORM、Redis client、BullMQ、Passport、Jest 等 Node.js 生态证据矩阵。
- 新增 Node.js 专属 Markdown 报告模板。
- 新增双语入口 `SKILL.md` 与 `SKILL.en.md`。

### 已知问题

- `package.json` semver range 不能代表实际安装版本；缺失 lockfile 且无法执行包管理器命令时必须标记版本不确定。

---

版本变更类型说明：

- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能

后续版本更新时，在 [1.0.0] 之前插入新版本记录，并同步更新 SKILL.md 与 SKILL.en.md 中的 metadata.version。
