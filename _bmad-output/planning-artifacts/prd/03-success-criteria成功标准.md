# Success Criteria（成功标准）

## User Success（用户成功）

MVP 成功意味着用户可以在一个目标项目中通过一条命令完成 SpecLite 安装，并在 `.claude/skills` 与 `.agents/skills` 两类 IDE execution target 中看到一致的 SpecLite skills。用户不需要手工复制 skill、手动配置 IDE 目录或自行维护过程文档路径；安装完成后，支持 `.agents/skills` 的 GitHub Copilot/Cursor 可复用该通用 target，但 MVP 不承诺专用 Copilot/Cursor command pointer。

用户能够围绕 SPEC-Driven、TDD、阶段化流程、方案评审、故事规划、实现、测试、对抗性审查等研发过程直接调用对应 skills。这些 skills 能稳定激活，并按配置输出 research、planning、implementation、review 等过程产物，让团队把注意力放回研发流程本身，而不是安装和同步细节。

## Business Success（业务成功）

SpecLite 工具化系统的业务成功标准是：它把既有方法论内容从“可阅读的 skill 源定义”推进为“可安装、可验证、可跨 IDE 分发的本地研发方法论系统”。第一阶段成功不以用户规模或收入为主要指标，而以能否证明安装控制面的产品价值为核心：目标用户能够在真实项目中完成安装、验证和使用闭环，并确认这比手工复制、人工约定和逐 IDE 配置更可靠。

3 个月内的成功标准是完成可重复的本地安装闭环，覆盖 fresh install、status、validate 和 update 的核心路径，并能在至少一个真实或 fixture 项目中稳定复现。12 个月内的成功标准是形成可维护的安装、更新、验证、文档和示例体系，使 SpecLite 的方法论内容可以作为稳定工具链被团队采用和演进。

## Technical Success（技术成功）

MVP 必须正确生成 `_speclite`、`_speclite-output` 和 manifest/index 相关文件，并保持清晰的所有权边界：`_speclite` 作为 metadata/control hub，IDE skill directories 作为 execution plane，`_speclite-output` 作为 artifact repository。安装器必须处理正式可分发的 SpecLite skills、runtime scripts、manifest/index、IDE mirrors 和输出目录，不包含已删除或非分发辅助来源。

安装结果必须可验证：IDE mirrors 内容一致，manifest schema 校验通过，`files-manifest` 或等价完整性机制可用于后续更新保护，installed skills 不残留旧 runtime namespace、旧配置格式或错误 runtime path。各阶段对应的 skills 菜单能正确提示，skills 能正确激活，并能按照配置输出预期产物。

## Measurable Outcomes（可衡量成果）

- 在空项目中运行一条安装命令后，生成 `_speclite`、`_speclite-output`、IDE skills 目录和 manifest/index 文件。
- 同一 canonical skill 在多个目标 AI IDE 中保持一致，mirror 校验通过。
- fresh install、status、validate、update 四类核心用户命令均可执行并返回可诊断结果，`resolve` runtime support command 可供 installed skills 稳定解析 config/customization。
- validator 能检测并报告 manifest/schema、IDE mirror、runtime path、legacy namespace residue、skill menu target 和产物路径问题。
- 阶段化研发流程中的核心 skills 可以被 IDE 正确发现、激活，并输出对应 planning、implementation 或 review 产物。
- human-owned custom 文件和 workflow artifacts 不被 installer/update 覆盖。
- 安装范围严格限制在正式可分发 SpecLite source tree，不包含已删除或非目标辅助来源。
