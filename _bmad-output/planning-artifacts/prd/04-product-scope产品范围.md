# Product Scope（产品范围）

## MVP - Minimum Viable Product（MVP - 最小可行产品）

MVP 包含 Node-first installer/control plane 的最小闭环：fresh install、status、validate、update；source skill discovery；安装到 `.claude/skills` 和 `.agents/skills` 等目标 IDE skill directories；生成 `_speclite` runtime/config/custom/scripts、manifest/index 和 `_speclite-output` 初始目录；并提供基础 validator 验证安装健康度。

MVP 还必须覆盖核心阶段化研发流程的 skills 菜单提示、skill 激活和产物输出路径，使 SPEC-Driven、TDD、方案评审、故事规划、实现、测试、对抗性审查等流程具备稳定 IDE 入口。

MVP 的默认官方安装集合必须包含 `assets/source/speclite/core-skills/` 与 `assets/source/speclite/sdlc-skills/` 下全部 canonical skill package roots；`support-skills/` 只服务 canonical skill 源定义的创建、迁移和 lint，不属于目标项目默认运行时 SDLC 方法论安装集合。

## Growth Features (Post-MVP)（增长功能（Post-MVP））

Post-MVP 重点增强更新安全、平台适配和团队采用能力，包括 backup/restore/report、批量迁移、更丰富的更新影响报告、更多 AI IDE platform registry、GitHub Copilot agent command pointer、扩展 fixture install test matrix、breaking schema upgrade workflow、schema migration tooling、完整 source lockfile 管理，以及更完整的 troubleshooting 和 migration guide。基础 hash-backed update protection 属于 MVP，覆盖 files index/hash、ownership 判断、conflict detection 和 `update --repair` repair plan；基础 schema version 字段与兼容性规则也属于 MVP；MVP 也必须保留最小 source integrity evidence 与 hash/lock 校验能力，用于支持 source descriptor trust status。

## Vision (Future)（未来愿景）

长期愿景是让 SpecLite 成为 AI IDE 时代的本地研发方法论安装与治理层。它不仅能安装 skills，还能持续维护方法论内容、IDE execution plane、项目 runtime、manifest/index、验证规则和研发过程产物之间的一致性，使团队可以把 SPEC、测试、规划、实现和审查流程作为可治理的 For AI 工程系统持续演进。
