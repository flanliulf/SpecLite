---
title: "Product Brief Distillate: SpecLite（产品简报细节包：SpecLite）"
type: llm-distillate
source: "product-brief-SpecLite.md"
created: "2026-05-20"
purpose: "为后续 PRD、架构、Epic/Story 和实现工作流提供 token-efficient 上下文"
inputs:
  - "_bmad-output/planning-artifacts/product-brief-SpecLite.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/research/technical-speclite-bmad-tooling-system-design-research-2026-05-11.md"
---

# Product Brief Distillate: SpecLite（产品简报细节包：SpecLite）

## Product Thesis（产品主张）

- SpecLite 是面向 AI IDE 方法论系统的本地安装器/控制面，不是提示词库，也不是文件复制器。
- 核心产品承诺：通过一条命令把同一套 SpecLite 方法论能力安装到多个 AI IDE 执行目标，并让这些能力可发现、可验证、可更新、可安全演进。
- 产品把 SPEC-Driven、TDD、阶段化 SDLC workflow、方案评审、故事规划、实现、测试和对抗性审查，从静态方法论文档转化为 AI IDE 中可执行的工作流入口。
- MVP 价值只有在 install -> IDE discovery -> skill activation -> artifact output -> validate -> update 形成可重复本地闭环时才算成立。

## Primary Problem Signals（核心问题信号）

- AI IDE 正在成为研发过程的实际执行现场，但方法论资产仍分散在 Markdown、提示词、手工复制的 skills、agent 文件和人工约定中。
- 使用 Claude Code、GitHub Copilot、Cursor 等工具的多 IDE 团队会遇到能力漂移：一个 IDE 有某个 skill，另一个 IDE 没有；菜单和输出路径也可能不同。
- 手工复制无法证明安装健康度、skill identity 一致性、runtime path 正确性、更新安全性或方法论覆盖情况。
- 工作流产物是重要项目记忆，但如果没有治理过的输出结构，就难以查找、审查、复用，也难以在更新过程中得到保护。
- 企业或流程治理用户需要证据证明标准在团队环境中可执行，而不只是写在手册里。

## Core Users And Jobs（核心用户与任务）

- 技术负责人：在目标项目中一次性安装 SpecLite，启用多个 IDE，确认所有团队成员看到同一套 workflow skills，并减少重复配置解释。
- AI IDE 使用者：打开相关阶段菜单，选择 skill，运行 workflow，并让 SPEC、planning、implementation、review 产物写入可预测位置。
- 工具链维护者：无需人工比对目录，即可诊断 IDE mirror drift、stale legacy entries、runtime path 错误、manifest/index 问题和不安全本地改动。
- 方法论维护者：新增或修订 source skill 后，可以证明它可安装、可索引、可镜像、可发现、可激活，并能产出预期 artifact。
- 企业规范负责人：检查 phase coverage、installed skill entries、validate output 和过程产物，确认标准化 SDLC 实践已经进入执行体系。

## MVP Scope Signals（MVP 范围信号）

- MVP 是平台/控制面 MVP，不是薄演示，也不是完整治理套件。
- 必须包含 TypeScript/Node.js CLI，并以 Node 22 为最低运行时、Node 24 为推荐运行时。
- 必须暴露主用户命令：`speclite install`、`speclite status`、`speclite validate`、`speclite update`。
- 必须暴露运行时支撑命令：`speclite resolve config` 和 `speclite resolve customization`。
- 必须把 canonical SpecLite source skills 安装到 `.claude/skills` 和 `.agents/skills`；MVP target id 是物理 execution target：`claude` 与 `agents`。
- 必须生成 `_speclite` metadata/control hub、`_speclite-output` artifact repository、manifest/index files、shared scripts/config 和 IDE mirrors。
- 必须支持 fresh install、轻量 status、本地确定性 validation、update planning、update safety，以及通过 `speclite update --repair` 修复 installer-owned drift 的路径。
- 必须包含基础 fixture 证据：fresh install empty project、existing install update、source integrity、IDE drift、resolve parity、path portability，以及至少一个 skill artifact loop 作为 regression asset 或在提升后成为更强 gate。

## Explicitly Out Of MVP / Rejected For First Version（MVP 明确不做 / 首版拒绝项）

- MVP 不实现数据库、服务器、云运行时、托管 registry UI、后台 daemon、REST API、GraphQL API 或前端 UI。
- MVP 不构建专用 GitHub Copilot command pointer 或 Cursor-specific adapter；它们只能通过 `.agents/skills` 兼容路径使用。
- MVP 不创建虚假的 `copilot` 或 `cursor` target id；target id 必须表示物理 execution directory。
- 首个实现切片不包含 Post-MVP 命令 `init`、`list`、`doctor`、`sync` 或 `uninstall`。
- MVP 不实现从旧手工复制、legacy SpecLite structures 或内部 fork 的完整迁移；只报告边界并保护既有文件。
- 不静默删除 stale legacy entries；必须提供 path、risk category、manual action 和 verification command。
- 不把 `validate` 当成 repair command；validation 只报告问题。
- 不把 Python resolver 作为 MVP 主 control-plane 依赖；Node resolver 必须提供 runtime support command parity。
- Human-owned TOML 文件一旦存在，就不得被重写、格式化、重排或覆盖。
- 不允许 adapter 修改 canonical skill package content；平台差异属于 adapter metadata/target mapping。

## Core Architecture Boundaries（核心架构边界）

- `assets/source/speclite/` 是随产品发布的 canonical source asset 区域，承载 modules、skills、custom defaults 和 scripts。
- `_speclite/` 是 metadata/control hub，承载 config、custom stubs、scripts、manifest/index、source descriptor、installed state 和 control metadata。
- `.claude/skills/` 与 `.agents/skills/` 是 IDE execution planes；skills 需要足够 self-contained 以便 IDE 加载，但项目配置应通过 `_speclite`/resolver contracts 读取。
- `_speclite-output/` 是工作流产物仓库，用于 planning、implementation、review 等生成产物。
- `docs/` 或配置指定的 project knowledge paths 存放更长期的人类/项目知识。
- Installer-owned files 只能通过授权的 install/update/repair 路径重新生成或修复。
- Human-owned custom files 和 workflow-owned artifacts 默认受保护，永不静默覆盖。

## Command Surface And Behavioral Contracts（命令面与行为契约）

- `speclite install` 安装 runtime metadata、config stubs、manifest/index、IDE mirrors 和 output directories，并且只有 required steps 通过后才展示 ready summary。
- `speclite status` 是轻量、本地只读命令，不应执行完整 hash scan、远程来源访问、freshness check、provenance revalidation 或 implicit update check。
- `speclite validate` 是 deterministic local-only validation，检查 manifest/schema、source descriptor shape、IDE mirrors、runtime paths、menu targets、legacy namespace residue、artifact paths、file integrity、operation lock state 和相关 installed-state issues。
- `speclite update` 必须 plan before write，检测本地改动，保护 human/workflow-owned files，并展示 changed/skipped/conflict paths。
- `speclite update --repair` 是 MVP 中修复安全 installer-owned drift 的机制；没有顶级 `speclite repair`，也没有 MVP `speclite sync`。
- `speclite resolve config` 与 `speclite resolve customization` 的 stdout 必须是纯 parsed JSON；stderr diagnostics 是 `ValidationIssue` 形状的 JSON Lines；warning diagnostics 不会让成功解析失败。
- 核心命令通过统一 `CommandResult` envelope 支持 `--json`；`resolve` 是例外，它为了 installed skills 故意返回 raw resolved JSON。

## Config And Customization Requirements（配置与定制化要求）

- TOML 继续作为面向人的配置/定制化契约。
- Config merge order：installer-owned `_speclite/config.toml` -> installer-owned `_speclite/config.user.toml` -> human-owned `_speclite/custom/config.toml` -> human-owned `_speclite/custom/config.user.toml`。
- Customization merge order：skill `customize.toml` -> `_speclite/custom/{skill}.toml` -> `_speclite/custom/{skill}.user.toml`。
- Merge rules 必须保持 Python resolver parity：scalar override，table deep-merge，数组若全部为 table 且统一由 `code` 或 `id` keyed，则同 key 整项替换并追加新项；其它数组 append。
- Keyed array replacement 是 whole-item replacement，不是 item-level deep merge。
- MVP merge model 没有 delete mechanism；如需禁用默认项，可用同 key no-op shape 替换，显式 deletion schema 留给未来。
- `resolve` 请求不存在的 `--key` 默认输出 `{}` 且 exit code 0；严格缺失 key 行为只应由未来显式 flag 引入。
- 必须支持重复 `--key`；输出对象使用原始 dotted key 字符串，缺失 key 省略。
- `resolve config` 必须要求显式 `--project-root`；`resolve customization` 支持显式 `--project-root`，并为兼容保留 Python fallback behavior。

## Manifest, Index, And Identity Requirements（清单、索引与身份要求）

- Source side canonical truth 是 `assets/source/speclite/` 下的 module metadata 与 source skill package。
- Installed side truth 是 manifest/index 对 selected modules、source descriptor、IDE targets、phase coverage、installed files、ownership 和 hashes 的投影。
- Help index 可以引用 `canonicalSkillId`、phase、entry label 和 activation target，但不得发明第二套 skill identity system。
- Canonical skill package hash 用于验证 IDE mirrors 之间的一致性。
- File-level raw-byte hashes 用于验证 installed file drift、update planning、repair planning、changed paths、skipped paths 和 conflicts。
- Line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions，不得通过 normalized hashing 隐藏。
- Canonical source text files 使用 LF；installer 不得按平台重写 canonical text line endings。
- Runtime/generated scripts 在 files index 中记录 `executable` intent；Windows 不要求 POSIX chmod 语义，但仍保留该 intent。
- Manifest/index contract 的细节归 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 管理；下游实现不得创建第二套字段真源。

## Validation And Diagnostics Requirements（验证与诊断要求）

- `ValidationIssue` category、issue id baseline、default severity 和 fixture ownership 由 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 控制。
- MVP 问题类别包括 environment、manifest-schema、source-integrity、ide-mirror、runtime-path、menu-target、legacy-namespace、artifact-path、file-integrity、operation-lock 和 update。
- `source-integrity` 与 `file-integrity` 必须区分：前者覆盖 install source trust/evidence，后者覆盖 installed files/manifest baseline drift。
- IDE mirror drift 必须报告稳定的 issue id/category/severity/affected path，且不会被 `validate` 自动修复。
- Human-readable output、`--json` output、exit code 和 fixture assertions 必须从同一个 issue/status model 推导。
- `CommandResult.status` 与 `status.data.highLevelHealth` 是不同概念；`status` 可以用 exit code 0 成功报告 `not-configured`、`partial` 或 `failed` 的安装健康状态，但不提供 full validation category coverage，也不证明 installation healthy。
- `validate.data.issueCounts` 必须包含固定 key：`info`、`warning`、`error` 和 `critical`，即使计数为 0 也不能省略。
- Public JSON paths 必须使用 project-relative POSIX-style paths；public outputs 不得暴露 absolute home paths、cache paths、temp extraction paths、credentials、tokens、environment values、raw stack traces、random ids 或 schema 未显式允许的 timestamps。
- Issues、targets、checked categories、paths、arrays 和 next actions 的排序必须 deterministic 且由 schema 定义，不能依赖 filesystem traversal 或 async completion order。

## Update, Ownership, And Safe Write Requirements（更新、所有权与安全写入要求）

- 文件所有权分为 installer-owned、human-owned、workflow-owned。
- Fresh install 只能在 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml` 不存在时 create-if-absent 创建 project-level human-owned TOML stubs；skill-specific custom stubs 不由 fresh install 默认创建，已存在 human-owned files 不得覆盖、重写、重排或格式化。
- Update 写入前必须比较 ownership 和 hashes；不安全或无法确认的情况进入 conflict/skip，而不是静默覆盖。
- 即使 installer-owned drift 发生在 installer-owned 区域，ordinary update 也不得静默覆盖；默认行为是 conflict。普通 `update` 的用户确认或 `--yes` 只授权无 conflict 的 planned update writes，只有 `update --repair` 可以修复可安全 repair 的 drift。
- Write-capable commands 必须使用 project operation lock `_speclite/.lock`；获取 lock 失败时不得写入。
- Lock file 是 volatile control state，不进入 files index 或 stable fixture snapshot。
- Safe writes 使用 temp-write + rename；temp files 不作为 files-index entries。
- `changedPaths` 只记录当前命令实际完成的 mutation。
- MVP 不提供 transactional rollback、backup/restore、standalone update report artifact 或 automatic stale temp/lock cleanup。

## Source And Distribution Requirements（来源与分发要求）

- MVP 支持的 source channels 包括 npm public registry、private npm registry、local tarball、offline bundle 和 pinned Git source。
- Git source 必须在 install planning 和写入前解析到具体 commit SHA；只有 floating URL/branch/tag 会被阻断。
- `SourceDescriptor.trustStatus` 取值为 `trusted`、`unverified`、`blocked`。
- MVP 中的 `trusted` 表示 expected hash 或 lock match；npm/private registry 不会因为来源类型本身自动 trusted。
- `unverified` 只有在用户显式选择该 source、存在可复现 integrity evidence、且没有 mismatch/policy rejection 时才能继续。
- `blocked` 覆盖 hash mismatch、lock mismatch、unsupported source、missing evidence、evidence verification failure 或 source policy rejection。
- MVP 只消费最小 integrity evidence，不生成、刷新、轮转或迁移完整 external source lockfile。
- `validate` 不访问 remotes 重新检查 source freshness/provenance；remote revalidation 属于显式 update/source resolution 或 Post-MVP doctor。
- Source staging/cache/temp checkout paths 是 private implementation state，不得进入 public JSON、manifest/index、files index、issue details 或 fixture snapshots。

## Fixture And Test Requirements（Fixture 与测试要求）

- Fixture expected outputs 是契约资产，不是普通文档示例。
- Release gate fixtures 应覆盖 Node 22 与 Node 24；portability evidence 必须包含 macOS 和 Windows path behavior。
- Baseline release gate fixture set：`fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity` required sub-cases、`resolve-parity`、`path-portability` 和最小 `skill-artifact-loop`；richer multi-skill/documentation scenarios 可作为 regression assets。
- Fixtures 必须验证 generated file trees、manifest/index snapshots、command output summaries、validation assertions、update protection、path normalization、target order 和 deterministic issue sets。
- Contract changes 必须先更新 owning SPEC 与 executable schema/parser，再更新 expected snapshots。
- Required install steps 失败时不得展示 ready summary。

## Detailed User Scenarios To Preserve（需要保留的详细用户场景）

- 技术负责人把 SpecLite 安装进多 IDE 团队项目；成功状态是 `.claude/skills` 与 `.agents/skills` 镜像同一套 canonical skills，并由 `validate` 确认一致。
- 开发者从 IDE 触发阶段菜单，选择 workflow skill，并在配置输出路径中得到 planning 或 review artifact，无需记忆原始 skill 名称。
- 工具链维护者在团队成员反馈 missing skills 后运行 `validate`；报告能指出 IDE mirror mismatch、stale runtime path、menu target gap 或 legacy entry risk，并给出可操作 affected paths。
- 方法论维护者新增 review skill 后，用 source validation 与 fixture install 证明 layout、menu target、mirror hash、activation 和 artifact output 正确。
- 企业规范负责人检查 minimum phase coverage matrix、manifest/help index、installed IDE target entries、validate output 和 artifacts，以验证流程标准可执行。

## Competitive And Market Context（竞争与市场语境）

- 本地 research 未使用外部 web citation；竞争语境基于 BMad-style tooling 的本地证据和当前 AI IDE fragmentation。
- 传统文档、提示词包和复制出来的 skills 可以传播知识，但不能提供安装健康度、跨 IDE mirror 一致性、更新安全、manifest/index discovery 或治理证据。
- BMad 为 Node-first installer tooling、layered customization、manifest/index、IDE adapters 和 local artifact workflows 提供了强参考架构；SpecLite 应借鉴模式，同时保留自己的 `_speclite` namespace 和 contracts。
- SpecLite 的差异化取决于 control-plane credibility：deterministic validation、ownership protection、local-first contracts 和 fixture-backed install/update behavior。

## Success Metrics And Acceptance Signals（成功指标与验收信号）

- 空项目 fresh install 会创建 `_speclite`、`_speclite-output`、manifest/index、`.claude/skills` 和 `.agents/skills`。
- 同一个 canonical skill package 在选中的 IDE mirrors 中具有匹配 hash。
- `status` 在预期 fixture baseline 内返回 lightweight local summary，且不执行 full integrity scan。
- `validate` 在重复运行中返回 deterministic issue set，并报告 category-specific progress。
- `update` 跳过未变化文件、检测 conflicts，并保留 human-owned custom files 和 workflow-owned artifacts。
- `resolve` 通过 config/customization parity fixtures，行为与 Python baseline 兼容。
- 至少一个 skill artifact loop 能证明 IDE discovery、activation、artifact metadata/output path 正确。
- JSON output schema、issue model、path normalization、ordering rules 和 fixture snapshots 在重复运行中保持稳定。

## Open Questions For Implementation Planning（实现规划开放问题）

- Release gate 已收口：`fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity` required sub-cases、`resolve-parity`、`path-portability` 和最小 `skill-artifact-loop`；richer multi-skill/documentation scenarios 是 regression assets。
- 最小 official module/skill subset 应包含哪些能力，才能展示 SPEC、solution review、story planning、implementation、testing 和 review coverage，同时不压垮 MVP？
- Packaging acceptance 已收口：npm package、local tarball 和 offline bundle 必须生成 packaging manifest，验证 `assets/source/speclite/`、compiled CLI、runtime schemas/scripts/templates 与必要 runtime assets 被打包，且 fixtures 默认不进入 package。
- 哪种 TOML parser/writer strategy 能默认保护 human-owned files，同时安全生成 installer-owned TOML？
- Offline bundle 与 local tarball 的 source evidence 应如何生成，并如何面向早期用户说明？
- 最小 human-readable CLI experience 应做到什么程度，才能既清晰可用，又把 automation dependencies 严格放在 `CommandResult` JSON/file contracts 中？
- 哪些 legacy namespace residues 在 MVP validation 中应是 warning，哪些应是 error？
- 初始开发环境中如何运行或证明 Windows path portability fixtures？

## Implementation Handoff Notes（实现交接说明）

- Implementation agents 应先读 `_bmad-output/planning-artifacts/specs/README.md`，再读各 owning SPEC，然后再读 PRD/architecture 摘要；owning SPEC 覆盖 command result JSON、resolve command、fixture contract、source descriptor、install plan、manifest/index、IDE adapter registry 和 validation taxonomy。
- 第一批代码应先建立 TypeScript CLI skeleton、`src/fs/path-normalizer.ts`、`src/diagnostics/command-result-schema.ts`、最小命令注册和 contract tests，再扩展完整 installer behavior。
- 不要在 feature modules 内实现第二套 config merge、path formatting、JSON reporter ordering、source trust semantics 或 issue taxonomy。
- 任何 public JSON fields、issue ids、adapter target status、source descriptor semantics、manifest/index projection、fixture comparison 或 resolver behavior 的变更，都必须在同一变更中更新 owning SPEC 和 fixture assertions。
