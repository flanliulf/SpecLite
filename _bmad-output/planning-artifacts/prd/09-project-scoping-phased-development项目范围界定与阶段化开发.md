# Project Scoping & Phased Development（项目范围界定与阶段化开发）

## MVP Strategy & Philosophy（MVP 策略与理念）

**MVP Approach:** Platform MVP / Control Plane MVP

SpecLite 的 MVP 策略不是用最少页面或最少命令证明概念，而是交付一个最小可信安装控制面。MVP 必须让用户在真实或 fixture 项目中完成从 source skills 到多 AI IDE execution mirrors、`_speclite` metadata、manifest/index、`_speclite-output` artifact repository、status/validate/update 的完整闭环。

这个 MVP 的核心学习目标是验证：SpecLite 是否能把 For AI 研发方法论从静态 skill 源定义转化为可安装、可验证、可更新、可跨 IDE 分发的本地研发过程系统。如果这个闭环成立，后续再扩展更多 IDE、更多命令、更强迁移能力和企业治理能力才有坚实基础。

**Resource Requirements:** MVP 至少需要覆盖 Node.js CLI/installer、文件系统与跨平台路径、TOML/YAML/CSV/Markdown 解析、AI IDE adapter、manifest/index 生成、验证器、fixture 测试和文档示例能力。团队角色上至少需要工具链/Node.js 工程能力、方法论 skill 体系维护能力和测试/验证设计能力。

## MVP Feature Set (Phase 1)（MVP 功能集（Phase 1））

**Core User Journeys Supported:**

MVP 必须支持以下核心旅程：

- 技术负责人完成多 AI IDE 安装。
- AI IDE 使用者按阶段调用研发 skills。
- 工具链维护者排查安装漂移。
- SpecLite 维护者发布并验证新的可安装 skill。
- 企业规范负责人验证研发规范是否通过菜单、manifest、validate 报告和产物目录落地。

**Must-Have Capabilities:**

- Node-first CLI installer/control plane。
- Node 版 config/customization resolver。
- `speclite install`、`speclite status`、`speclite validate`、`speclite update`。
- 默认 bundled source discovery（`assets/source/speclite/`）与正式可分发 SpecLite source skill discovery。
- 安装到 `.claude/skills` 和 `.agents/skills`。
- 生成 `_speclite` metadata/control hub。
- 生成 `_speclite-output` artifact repository。
- 生成 manifest/index 文件，包括 skill/help/files 等索引能力。
- 阶段化 skills 菜单可被 IDE 发现，并能激活核心研发 workflow。
- 核心流程产物可输出到配置约定路径。
- deterministic validation，覆盖 manifest/schema、IDE mirror、runtime path、菜单 target、legacy namespace residue、artifact path 和文件完整性。
- 文件所有权模型，区分 installer-owned、human-owned、workflow-owned。
- 更新流程保护 human-owned custom 文件和 workflow artifacts。
- 默认 bundled source，以及 npm public registry、private registry、local tarball、offline bundle、Git source、local path 等替代安装来源。
- 跨平台路径基础能力，至少覆盖 macOS 与 Windows 的路径规范、换行符、权限和 shell 差异。
- fixture project 示例，展示安装前后目录变化、manifest/index、status、validate、update 和一个最小 skill 产物闭环。

**MVP Boundary Clarification:**

MVP 的 fixture 要求包括可用于验证安装行为的 fixture project 和最小闭环示例。更大规模的自动化 fixture matrix、跨版本回归套件和完整 CI 验证矩阵可以在 Post-MVP 增强，但不能取消 MVP 中的基础 fixture 示例和最小安装验证。

## Fixture Project Requirements（Fixture 项目需求）

MVP 必须维护最小 fixture project 集合，作为 installer/control plane 的可重复验收资产：

- `fresh-install-empty-project`: 空项目运行 fresh install，验证 `_speclite`、`_speclite-output`、manifest/index、`.claude/skills` 和 `.agents/skills` 生成结果。
- `existing-install-update`: 已安装项目运行 update，验证 installer-owned 文件更新、human-owned custom 文件保留、workflow artifacts 不被覆盖。
- `source-integrity`: 从 bundled source、Git source、local tarball、offline bundle 或 local path 安装，验证 source descriptor、integrity evidence、blocked/unverified 行为、local source self-reference guard 和安装摘要。
- `ide-drift`: 人为修改某个 IDE mirror，验证 `validate` 能报告 target、canonical skill id、hash mismatch 和建议下一步。
- `skill-artifact-loop`: 至少一个阶段化 skill 从 IDE entry 发现、激活到输出 planning 或 review artifact 的最小闭环。

每个 fixture 必须包含 expected file tree、expected manifest/index snapshot、expected command output 摘要和 validation assertions。fixture assertion 失败时，MVP 不应展示 ready summary。

## Backward Compatibility Strategy（向后兼容策略）

MVP 生成的 metadata、manifest/index 和 validation issue model 必须为 Post-MVP 命令预留兼容路径：

- `_speclite/_config/manifest.yaml`、skill/help/files index 和 source descriptor 必须包含 schema version。
- Post-MVP 的 `speclite list`、`speclite doctor`、`speclite sync` 和 `speclite uninstall` 必须能读取 MVP manifest，不要求用户重装才能识别现有安装。
- 新增 validation rule 不得改变已有 issue id、category、severity 和 affected path 的语义。
- 新增 MVP 命令 JSON 字段必须通过 `CommandResult.schemaVersion` 扩展；不得破坏既有 `speclite.command-result.v1`、`CommandResult` 和 `ValidationIssue` 字段语义。
- 新增 IDE adapter 必须通过 adapter registry 扩展，不改变 canonical skill package 内容。
- 新增配置键必须允许旧 resolver 忽略未知字段，且不得破坏 human-owned override 文件。
- 如未来必须升级 schema，工具必须输出 migration-needed 状态、旧版本、新版本和人工确认步骤；MVP producers 只能输出 manual 或 unsupported migration kind，automated-available 保留给 Post-MVP migration tooling。

MVP 暂不包含完整迁移指南，也不自动迁移手工复制 skills、旧参考结构或其他历史目录。MVP 只记录新安装状态、保护当前安装所有权边界，并把自动迁移能力留到 Post-MVP。

## Post-MVP Features（Post-MVP 功能）

**Phase 2 (Post-MVP):**

- `speclite init`、`speclite list`、`speclite doctor`、`speclite sync`、`speclite uninstall`。
- GitHub Copilot agent command pointer 和 Cursor 专用 adapter；MVP 只通过 `.agents/skills` 提供兼容路径。
- 更多 AI IDE platform registry 和 data-driven adapter。
- backup/restore、standalone report artifact、批量迁移报告和更丰富的更新影响报告；基础 hash-backed update protection 属于 MVP，覆盖 update/repair plan、impact summary、changed/skipped/conflict paths 和冲突跳过。
- breaking schema upgrade workflow、schema migration tooling 和完整 source lockfile 管理；基础 schema version 字段与兼容性规则属于 MVP，最小 source integrity evidence 与 hash/lock 校验也属于 MVP。
- CI/企业自动化集成增强，基于 MVP 已提供的统一 JSON output contract。
- 扩展 fixture install test matrix。
- troubleshooting 文档。
- 完整 migration guide。

**Phase 3 (Expansion):**

- 企业级安装策略模板、私有 registry 推荐配置和离线包治理。
- 更强的规范落地报告与流程覆盖分析。
- 多项目/多仓库安装状态汇总。
- 更高级的 source/channel/version 策略。
- 对第三方 SpecLite extension 或内部 fork 的治理能力。
- 更完整的跨 IDE 能力差异管理与兼容报告。

## Risk Mitigation Strategy（风险缓解策略）

**Technical Risks:**

最大技术风险是 MVP 同时涉及 Node CLI、TOML resolver、manifest/index、IDE adapter、验证器、更新保护、跨平台路径和多安装来源，形成过宽实现面。缓解策略是以最小可信控制面为边界：先完成 source discovery -> install -> IDE mirrors -> `_speclite` -> manifest/index -> validate -> update -> fixture project 的闭环，再扩展更多命令和 IDE 类型。

第二个技术风险是 TOML 人类可编辑配置在 Node 工具链中被破坏。缓解策略是 installer-owned TOML 可生成，human-owned override TOML 默认只读或保守更新；需要修改时必须通过明确命令或报告提示。

第三个技术风险是多安装来源导致实现复杂度膨胀。缓解策略是尽早抽象 source/channel/version，把 bundled source、npm、private registry、tarball、offline bundle、Git source 和 local path 统一归一为 canonical source tree，再进入同一套 manifest/index 与 IDE mirror 流程；local path 先经过 self-reference guard，避免把安装结果或输出目录重新当作 source。

**Market Risks:**

最大市场风险是用户把 SpecLite 理解为“又一个 prompt/skill 文件集合”，看不到控制面的必要性。MVP 必须通过一条命令安装、多 IDE 一致、validate 可诊断、update 保护用户定制、fixture 示例可复现来证明差异化价值。

第二个市场风险是目标用户觉得安装器太重。缓解方式是保持 CLI 主用户命令少而清晰，MVP 面向用户主流程只宣传 install/status/validate/update；`resolve` 作为 runtime support command 支撑 skills 读取配置，不要求用户理解为独立工作流。

**Resource Risks:**

资源风险在于实现者可能先做大量方法论内容整理或 IDE 扩展，而延迟核心控制面。缓解策略是把 MVP 验收集中在安装控制面闭环：没有 Node resolver、manifest/index、IDE mirror validation、文件所有权保护和 fixture 安装示例，就不视为 MVP 完成。

如果资源不足，仍应保留 install/status/validate/update、`resolve` runtime support command 和两个 IDE mirror 目标，削减范围应优先从更多 IDE、更多命令、完整迁移指南、扩展 CI matrix 和企业高级报告中进行，而不是削减控制面核心能力。
