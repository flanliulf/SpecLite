# Success Criteria（成功标准）

## User Success（用户成功）

MVP 成功意味着用户可以在一个目标项目中通过一条命令完成 SpecLite 安装，并在 `.claude/skills` 与 `.agents/skills` 两类 IDE execution target 中看到一致的 SpecLite skills。该成功由 `fresh-install-empty-project` 的 expected file tree、manifest/index snapshot 和 command assertions 证明：两个 target 均生成已选 canonical skills 的 self-contained entries，随后 `validate` 不产生 `manifest-schema`、`ide-mirror` 或 `menu-target` error/critical issue。用户无需手工复制 skill、直接编辑 IDE 目录或自行维护 workflow artifact path；支持 `.agents/skills` 的 GitHub Copilot/Cursor 可复用该通用 target，但 MVP 不承诺专用 Copilot/Cursor command pointer。

用户能够围绕 SPEC-Driven、TDD、阶段化流程、方案评审、故事规划、实现、测试和对抗性审查直接调用对应 skills。MVP 最小阶段覆盖矩阵必须为每项核心能力提供唯一可解析的 canonical skill entry 和所选 IDE target 状态；`skill-artifact-loop` 必须证明至少一个 mapped skill 能依次完成 discovery、activation、config resolution 和 configured-path artifact write，并通过 artifact metadata assertion。用户成功因此可由 coverage matrix 与 fixture evidence 检查，而不依赖对“稳定可用”的主观判断。

## Business Success（业务成功）

SpecLite 工具化系统的业务成功标准是把既有方法论内容从“可阅读的 skill 源定义”推进为“可安装、可验证、可跨 IDE 分发的本地研发方法论系统”。第一阶段不以用户规模或收入为主要指标；价值证明条件是目标用户能在真实或 fixture 项目中完成 install → validate → mapped skill activation → configured artifact write 闭环，且过程中不手工复制 skill、不直接修补 IDE mirror、不以口头约定补足 artifact path。闭环是否成立由 command result、manifest/index、validate issues 和 generated artifact evidence 联合判定。

3 个月内的成功标准是 `fresh-install-empty-project`、`existing-install-update`、`source-integrity`、`ide-drift` 和 `skill-artifact-loop` 的 expected tree、snapshot、command output 与 validation assertions 全部通过，并在至少一个真实或 fixture 项目中完成 fresh install、status、validate、update 闭环。12 个月内的成功标准是每次 release 均保留可复查的 packaging、fixture、validation 和 performance evidence，安装、更新、验证文档及五类执行示例通过 link/reference check 与对应 fixture assertions，使方法论内容的演进可以由 release evidence 判定，而不依赖“可维护”或“已采用”的主观声明。

## Technical Success（技术成功）

MVP 必须正确生成 `_speclite`、`_speclite-output` 和 manifest/index 相关文件，并保持清晰的所有权边界：`_speclite` 作为 metadata/control hub，IDE skill directories 作为 execution plane，`_speclite-output` 作为 workflow artifact repository，目标项目 `docs/` 作为 Primary Public Document（主要公开文档）。Fresh install 必须生成 `0-brainstorming-artifacts/` 至 `5-devops-artifacts/` 的阶段 roots 以及 `project-knowledge-base/`；Analysis research、product brief 与 PRFAQ 不得被归类为 project knowledge。安装器必须处理正式可分发的 SpecLite skills、runtime scripts、manifest/index、IDE mirrors 和输出目录，不包含已删除或非分发辅助来源。

安装结果必须可验证：IDE mirrors 内容一致，manifest schema 校验通过，`files-manifest` 或等价完整性机制可用于后续更新保护，installed skills 不残留旧 runtime namespace、旧配置格式或错误 runtime path。各阶段对应的 skills 菜单能正确提示，skills 能正确激活，并能按照配置输出预期产物。

## Outcome-to-Evidence Overview（成果到证据概览）

下表是既有 outcome-to-evidence 链路的权威导航映射，不定义第二套 requirement、schema 或 fixture contract。产品语义仍由对应 FR/NFR 管理；字段、状态、排序、fixture comparison 与 lifecycle 细节仍以 owning SPEC 为准。

| Product Outcome | Primary Journey | Existing FR/NFR Cluster | Fixture/Release Evidence | Owning SPEC/Section |
| --- | --- | --- | --- | --- |
| 多 IDE fresh install 可重复且 installed projection 一致 | Journey 1、Journey 4 | FR1–FR19、FR60–FR69；NFR1–NFR11a、NFR23–NFR29 | `fresh-install-empty-project`、`ide-drift`、expected tree、manifest/index snapshot、Ready Summary gate | SPEC 01 `CommandResult`、SPEC 04 manifest/index、SPEC 05 IDE adapter、SPEC 08 fixture |
| Skill 可被发现、激活并按阶段化 artifact topology 写入配置路径 | Journey 2、Journey 5 | FR13a、FR20–FR24、FR66–FR71b；NFR14a、NFR17a、NFR28b、NFR40b、NFR40f | `skill-artifact-loop`、`fresh-install-empty-project` / `existing-install-update` topology evidence、artifact metadata assertions、docs link/reference check | SPEC 04 manifest/index、SPEC 08 fixture、SPEC 09 SDLC workflow lifecycle |
| 安装状态可诊断，update/repair 保持 ownership protection 与显式恢复边界 | Journey 3 | FR25–FR41c；NFR7–NFR10、NFR25a–NFR25c、NFR30–NFR35j | `existing-install-update`、`ide-drift`、status/validate/update/repair command snapshots | SPEC 01 `CommandResult`、SPEC 03 install plan、SPEC 07 issue taxonomy、SPEC 08 fixture |
| 多来源安装具有可审查的 trust 与 integrity evidence | Journey 1、Journey 4 | FR8–FR9、FR53–FR59；NFR12–NFR13e、NFR22、NFR32e、NFR40c–NFR40d | `source-integrity` sub-cases、packaging manifest、npm/tarball/offline bundle release assertions | SPEC 02 source descriptor、SPEC 07 issue taxonomy、SPEC 08 fixture |
| 核心路径具备跨平台、性能与 release 可复查性 | Journey 1、Journey 3、Journey 4 | FR66–FR71b；NFR2–NFR5a、NFR18–NFR21、NFR40–NFR40f | Node 22/24、macOS/Windows `path-portability`、performance baseline 与 release evidence | SPEC 01 fixture comparison、SPEC 08 release gate 与 fixture policy |

## Measurable Outcomes（可衡量成果）

- 在空项目中运行一条安装命令后，生成 `_speclite`、`_speclite-output`、IDE skills 目录和 manifest/index 文件。
- 同一 canonical skill 在多个目标 AI IDE 中保持一致，mirror 校验通过。
- fresh install、status、validate、update 四类核心用户命令均可执行并返回可诊断结果，`resolve` runtime support command 可供 installed skills 稳定解析 config/customization。
- validator 能检测并报告 manifest/schema、IDE mirror、runtime path、legacy namespace residue、skill menu target 和产物路径问题。
- 阶段化研发流程中的核心 skills 可以被 IDE 正确发现、激活，并输出对应 planning、implementation 或 review 产物。
- human-owned custom 文件和 workflow artifacts 不被 installer/update 覆盖。
- existing install 的显式 artifact root 配置继续权威；缺少新增字段时使用规定的 legacy fallback，普通 install、update 和 repair 不移动、重命名或重写既有 workflow artifacts。
- 手工只修改 config path 而未迁移 artifacts 时，系统给出可诊断结果，且不得误报 artifact migration 已完成。
- 安装范围严格限制在正式可分发 SpecLite source tree，不包含已删除或非目标辅助来源。
