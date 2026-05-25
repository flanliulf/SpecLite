# Domain-Specific Requirements（领域特定需求）

## Compliance & Regulatory（合规与监管）

SpecLite 不属于强监管业务域，但需要满足企业研发规范落地的内部合规要求。系统必须让 SPEC-Driven、TDD、阶段化流程、方案评审、故事规划、实现、测试和对抗性审查等研发规范在多个 AI IDE 中形成一致入口，并通过产物目录、manifest/index 和 validate 报告证明关键流程是否可执行、是否有输出、是否存在缺口。

SpecLite 的安装结果应具备 Git 可审查性和本地可追踪性。生成的 `_speclite`、IDE skill mirrors、manifest/index 和 `_speclite-output` 目录结构应清晰区分工具生成内容、人类定制内容和 workflow 产物，支持团队在代码审查、流程治理和工具升级时判断变更来源与影响范围。

## Technical Constraints（技术约束）

安装器必须优先保证跨 IDE 一致性。同一 canonical skill 安装到 `.claude/skills`、`.agents/skills` 等目标目录后，应保持内容一致。MVP 平台差异只能限制在 target directory 与可验证 metadata 映射层；专用 command pointer artifact 属于 Post-MVP，不应被 MVP adapter 生成。

系统必须明确文件所有权边界。Installer-owned 文件可以被安装器生成、更新和验证；human-owned custom 文件和 workflow artifacts 不应被自动覆盖。MVP 更新流程必须在修改前检测已安装文件是否被用户改动，并提供可诊断的 update/repair plan、影响摘要和冲突跳过结果；backup、restore、standalone report artifact 和更丰富的更新影响报告属于 Post-MVP。

系统必须支持本地、离线、可重复执行的安装与验证。MVP 阶段不依赖云服务、数据库或后台守护进程；核心状态应来自文件系统、TOML/YAML/CSV/Markdown/JSON 等可读文件契约。

系统必须考虑 npm 分发与企业内网离线安装两种分发路径。公开或标准环境下，SpecLite installer 应支持通过 npm 包分发和执行；企业内网或受限网络环境下，应支持从本地包、镜像源、压缩包或内部 registry 安装，避免把运行能力绑定到公网访问。

系统必须具备跨平台路径处理能力，覆盖 Windows 与 macOS 的路径分隔符、可执行脚本调用、文件权限、换行符、大小写敏感性和 shell 差异。安装器、manifest 生成、hash 计算、IDE target directory 解析和 validate 报告都必须使用平台无关的路径规范，避免同一项目在不同操作系统上产生不同安装结果。

## Integration Requirements（集成需求）

SpecLite 必须集成多个 AI IDE 的 skill/agent 加载机制，MVP 硬交付 `.claude/skills` 与 `.agents/skills` 这类目标目录。GitHub Copilot/Cursor 如果支持 `.agents/skills`，可通过该通用 target 使用 SpecLite skills；未来 GitHub Copilot agent command pointer、Cursor 专用入口和其它平台差异保留 data-driven adapter 扩展点。

SpecLite 必须把 source skill 定义、module metadata、runtime scripts、IDE mirrors、manifest/index 和 output artifacts 连接为完整安装链路。安装完成后，IDE 中的菜单指令应能展示当前阶段可用 skills，用户可以选择并激活对应 skill，产物按配置写入 `_speclite-output` 或指定文档目录。

企业环境中可能存在代理、私有 npm registry、无法访问 GitHub/npm 公网、受限文件系统权限和统一工具链版本要求。SpecLite 的安装流程应把这些作为一等约束：支持显式 source/channel 配置，输出清晰失败原因，并避免在安装过程中隐式下载未声明资源。

## Risk Mitigations（风险缓解）

主要风险之一是 SpecLite 被误实现为简单文件复制器，导致安装后缺少 runtime、manifest、索引、验证和更新保护。缓解方式是把 installer/control plane 作为 MVP 核心，要求 fresh install、status、validate、update 都进入第一版范围。

第二个风险是多 IDE 内容漂移。缓解方式是使用 canonical skill identity、manifest/index 和 mirror validation，确保同一 skill 在不同 IDE 目标目录中保持一致。

第三个风险是更新覆盖用户定制或过程产物。缓解方式是区分 installer-owned、human-owned 和 workflow-owned 文件，并在 update 前执行 hash 或等价完整性检测。

第四个风险是方法论规范无法证明已落地。缓解方式是要求阶段化 skills 菜单、关键流程对应 skills、标准过程产物、manifest/index 和 validate 报告共同形成可检查链路，让企业规范负责人能够判断规范是否真实进入团队执行过程。

第五个风险是企业环境安装失败或行为不可解释。缓解方式是把 npm public registry、private registry、本地 tarball、offline bundle、代理、权限和跨平台路径作为显式安装约束，并要求所有 source/channel 可配置、可诊断、可审查。

SpecLite 的 developer tooling 领域约束需要通过后续 ADR 固化为系统契约。至少应形成以下架构决策：分发策略、跨平台路径规范、文件所有权模型、data-driven IDE adapter、企业离线安装策略和 deterministic validation pipeline。这些决策直接影响 MVP 是否能在真实团队和企业环境中落地，而不是只在本地开发机上完成演示。
