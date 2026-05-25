# Innovation & Novel Patterns（创新与新模式）

## Detected Innovation Areas（已识别创新领域）

SpecLite 的核心创新在于把 For AI 研发方法论从静态内容集合转化为可安装、可验证、可治理、可跨 IDE 分发的本地系统。它不是单一 CLI、单一 IDE 插件或单个 prompt library，而是把 SPEC-Driven、TDD、敏捷阶段化流程、方案评审、故事规划、实现、测试和对抗性审查等研发规范，映射为多个 AI IDE 中一致可调用的 skills 菜单、运行时配置、manifest/index 和过程产物结构。

这个创新挑战了一个隐含假设：AI IDE 方法论能力只需要以 Markdown、提示词或 agent 文件形式存在。SpecLite 的假设是，随着 AI IDE 成为研发执行入口，方法论内容必须具备安装控制面、运行时元数据、跨 IDE mirror、验证链路和更新保护，否则无法在真实团队中稳定落地。

## Market Context & Competitive Landscape（市场背景与竞争格局）

当前 AI IDE、skill、agent、prompt 生态正在碎片化。单个 IDE 可以加载自己的 skill 或 agent，但团队常常同时使用 Claude Code、GitHub Copilot、Cursor 等工具，导致方法论入口、配置方式、菜单暴露和产物路径分散。传统文档库、prompt 集合或手工复制方式可以传播内容，但无法保证跨 IDE 一致性、安装健康度、更新安全和研发规范落地证据。

SpecLite 的差异化位置是本地 developer tooling 与 AI SDLC 方法论治理的交叉点。它不是复制外部命名空间，而是为 SpecLite 的 SPEC-Driven、TDD 和阶段化研发流程建立自己的 `_speclite` metadata hub、IDE execution mirrors、manifest/index gateway 和 `_speclite-output` artifact repository。

## Validation Approach（验证方法）

创新假设需要通过可操作验证闭环证明。MVP 应验证以下问题：

- 一条命令是否能在真实或 fixture 项目中生成多个 AI IDE 的一致 skill mirrors。
- IDE 菜单是否能正确提示当前阶段可用 skills，并激活对应 workflow。
- `_speclite`、manifest/index 和 `_speclite-output` 是否能让安装结果可发现、可审查、可验证。
- 企业规范负责人是否能通过菜单、manifest、validate 报告和产物目录判断研发规范是否落地。
- fresh install、status、validate、update 是否能构成可信安装控制面，而不是一次性复制脚本。

验证方法应包括 fixture install tests、mirror hash validation、manifest/schema validation、菜单 target validation、runtime path validation、legacy namespace residue detection、产物输出路径验证，以及 Windows/macOS 跨平台安装验证。

## Risk Mitigation（风险缓解）

最大创新风险是产品被实现成“复杂一点的文件复制器”，没有形成真正控制面。缓解方式是把 `_speclite` runtime、manifest/index、IDE mirror validation、status/validate/update、文件所有权模型和产物路径验证列为 MVP 必备能力。

第二个风险是创新范围过大，导致同时承担方法论内容、安装器、IDE adapter、更新系统、企业治理和跨平台支持。缓解方式是用 MVP 验证最小闭环：正式可分发 source skills -> 多 IDE mirrors -> `_speclite` metadata -> 阶段化菜单 -> skill 激活 -> 产物输出 -> validate/update。

第三个风险是企业环境不可用。缓解方式是在创新验证中纳入 npm 分发、private registry、本地 tarball、offline bundle、Windows/macOS 路径规范、代理和受限权限诊断，避免只在开发者个人机器上成立。
