# Changelog

本文件记录 `speclite-ir-grill-consistency-reviewer` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.1] - 2026-07-04

### Changed

- 将 grill-with-docs 的单题追问、设计树遍历、证据优先、术语校准、具体场景、文档/代码交叉验证、内联更新和 ADR sparingly 规则移植为本 Skill 的内建协议。
- 移除对外部 grill skill 名称的显式依赖表述，避免通用 Skill 运行时误以为必须加载相邻 Skill。
- 同步更新中文 canonical 与英文 mirror 的版本号和能力描述。

## [1.0.0] - 2026-07-04

### 初始版本

- 新增 PRD、UX、Architecture、Epics / Stories implementation-readiness 一致性 grill 编排。
- 新增 grill-with-docs 方法内化规则。
- 新增默认 50 题严格串行 round 机制。
- 新增审查维度矩阵、问题归类、prompt library、记录输出规范和退出条件。
- 新增中文 canonical `SKILL.md` 与英文 mirror `SKILL.en.md`。

### 已知问题

- 尚未执行真实 subagent pressure test；当前提供 `references/testing-scenarios.md` 作为触发与执行质量测试建议。

---

版本变更类型说明：
- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能
