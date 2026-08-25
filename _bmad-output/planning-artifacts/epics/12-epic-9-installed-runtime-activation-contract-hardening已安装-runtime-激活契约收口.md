# Epic 9: Installed Runtime Activation Contract Hardening（已安装 Runtime 激活契约收口）

SpecLite 已经具备 `speclite resolve config` 与 `speclite resolve customization` 的 Node CLI runtime support，但 canonical installed skill activation protocol 尚未全量收口。当前风险是：部分已安装 Agent / Workflow 仍直接读取 `_speclite/config.toml` 或调用 `_speclite/scripts/resolve_*.py`，导致目标项目中已存在于 merged runtime config 的字段被误判缺失，典型复现是 `/Users/fancyliu/Repos/noi` 中 `speclite-agent-analyst` 没有读取 `_speclite/config.user.toml` 的 `core.user_name` 与 `core.communication_language`。后续排查还确认：部分 Workflow 的 installed self-contained skill entry 缺少 skill-local `data/` resources，导致已安装 Workflow 无法从 `{skill-root}/data/` 读取结构化查表数据。

本 Epic 是 corrective planning Epic。它不改变 `speclite resolve` 的 merge semantics、stdout/stderr machine contract 或 `CommandResult` JSON contract。它只收口 installed skill activation contract、AI 会话中的 CLI availability preflight、full canonical skill corpus regression gate，以及 Python resolver scripts 的兼容资产边界。

## Product Problem（产品问题）

当前 installed runtime contract 在三个层面存在断裂：

- `speclite resolve` 已是 Node/TypeScript runtime support command，但部分 canonical skill 文案仍绑定 legacy Python resolver 或单文件 `_speclite/config.toml`。
- AI 对话会话能否执行 `speclite resolve` 取决于 `speclite` binary 是否在该会话 `PATH` 中；现有 activation protocol 未把 CLI availability 作为明确 preflight。
- Python resolver scripts 的定位不清：源码和 packaging inventory 仍把它们当 runtime assets，但默认 skill activation 不应依赖它们。

## Product Thesis（产品主张）

Installed skill activation 必须只有一个默认 resolver entry：`speclite resolve`。如果 AI execution plane 无法运行 `speclite`，skill 必须明确 halt 为 CLI unavailable，而不是回退 Python resolver、手写 TOML merge、读取 source checkout 或把 merged config 缺失误报成用户配置错误。

## Scope（范围）

本 Epic 覆盖：

- canonical Agent / Workflow `SKILL.md` 与 activation references 的 Node CLI resolver migration。
- `command -v speclite` 或等价 CLI availability preflight 的 activation contract。
- Alice / `speclite-agent-analyst` merged config regression。
- full canonical skill corpus lint / fixture / release gate。
- Python resolver scripts 作为 compatibility assets 的 install、files-index、validate、update、repair、uninstall、packaging 和 docs 边界。
- skill-local `data/` resources 作为 installed self-contained skill package runtime surface 的 copy、hash、validate、fixture 和 update/repair 边界。

本 Epic 不覆盖：

- 改变 `speclite resolve` 的 default machine stdout、stderr JSON Lines、exit code、missing key behavior 或 merge order。
- 新增第二个 resolver command、wrapper daemon、background service 或 IDE-specific command pointer artifact。
- 重新实现 TOML merge 逻辑。
- 将 Python scripts 恢复为默认 activation fallback。
- 修改 unrelated skill persona、menu、workflow business logic 或 artifact content quality。

## Runtime Decision（运行时决策）

默认 activation contract：

```sh
command -v speclite >/dev/null 2>&1
speclite resolve config --project-root "$PROJECT_ROOT" --key core.user_name --key core.communication_language
speclite resolve customization --skill "$SKILL_ROOT" --project-root "$PROJECT_ROOT" --key agent
```

Workflow activation 使用：

```sh
speclite resolve customization --skill "$SKILL_ROOT" --project-root "$PROJECT_ROOT" --key workflow
speclite resolve customization --skill "$SKILL_ROOT" --project-root "$PROJECT_ROOT" --key workflow.on_complete
```

规则：

- `--project-root` 必须显式传入。
- 默认 mode 只消费 stdout JSON，不使用 `--human`。
- `speclite` unavailable 必须 halt，并输出明确 remediation。
- `config.toml.example` 只能作为字段结构参考。
- Python resolver scripts 只允许作为 compatibility / troubleshooting assets。

## Story List（Story 列表）

### Story 9.1: Installed Skill Activation Contract Hardening（已安装 Skill 激活契约收口）

作为 SpecLite 维护者和 AI IDE 使用者，
我希望所有已安装 Skill 的激活协议都通过 `speclite resolve` 读取 merged runtime config 和 customization，并在 `speclite` CLI 不可用时明确阻断，
以便 Agent / Workflow 在目标项目中使用一致的配置合并结果，不再误读单个 `_speclite/config.toml` 或回退 legacy Python resolver。

#### Acceptance Criteria（验收标准）

1. **Default activation uses only Node CLI resolver（默认激活只使用 Node CLI Resolver）**
   **前提** canonical Agent 或 Workflow 需要读取 runtime config / customization；
   **当** 用户在 `.claude/skills`、`.agents/skills` 或等价 installed execution plane 中激活该 Skill；
   **则** activation protocol 必须调用 `speclite resolve config --project-root {project-root}` 与 `speclite resolve customization --skill {skill-root} --project-root {project-root}`；
   **并且** `--project-root` 必须显式传入；
   **并且** 默认 activation 不得调用 `_speclite/scripts/resolve_config.py`、`_speclite/scripts/resolve_customization.py`、`assets/source/speclite/scripts/resolve_*.py`、`python3 resolve_*.py`、`node dist/...` internal path、source checkout path 或 package cache path。

2. **CLI availability preflight is explicit（CLI 可用性预检明确）**
   **前提** Skill activation 即将调用 `speclite resolve`；
   **当** 当前 AI 会话 shell 中 `speclite` command 不可用；
   **则** Skill 必须 halt，并报告 `SpecLite CLI command speclite is not available in this AI session PATH` 或等价明确错误；
   **并且** next action 必须指向暴露或安装 Node CLI；
   **并且** 不得回退 Python resolver、手写 TOML merge 或误报 runtime config 缺字段。

3. **Merged config fields are honored by Agent activation（Agent 激活尊重合并后配置字段）**
   **前提** target project 的 `core.user_name`、`core.communication_language` 或 `core.document_output_language` 位于 `_speclite/config.user.toml`、`_speclite/custom/config.toml` 或 `_speclite/custom/config.user.toml`；
   **当** Agent activation 读取 runtime config；
   **则** 必须以 `speclite resolve config` 的 merged output 为准；
   **并且** 不得只读取 `_speclite/config.toml` 后要求用户补齐已存在于 merged config 的字段；
   **并且** `config.toml.example` 只能作为字段结构参考，不得作为 runtime fallback。

4. **Alice / NOI regression is covered（Alice / NOI 回归被覆盖）**
   **前提** fixture 或 integration setup 模拟 `/Users/fancyliu/Repos/noi` 的安装形态：`_speclite/config.toml` 不含 `core.user_name` / `core.communication_language`，但 `_speclite/config.user.toml` 包含这些字段；
   **当** `speclite-agent-analyst` activation protocol 执行 config preflight；
   **则** activation 读取到 merged values，并继续渲染 Alice menu；
   **并且** `persistent_facts` 指向的 `**/project-context.md` 缺失只记录为无可加载事实，不阻断菜单。

5. **Full canonical corpus rejects legacy resolver dependency（全量 Canonical Corpus 拒绝 Legacy Resolver 依赖）**
   **前提** release gate 扫描 canonical source skills 和 fresh install expected installed skills；
   **当** corpus test / agent lint 检查 activation protocol；
   **则** canonical persona Agent inventory 中所有 `assets/source/speclite/sdlc-skills/**/speclite-agent-*` 的 `SKILL*.md`、customization-capable workflow skills 和 `workflow.on_complete` references 必须使用 `speclite resolve`；
   **并且** installed mirror 中对应的 `.claude/skills/**/SKILL*.md`、`.agents/skills/**/SKILL*.md`、activation references 与 workflow terminal step files 必须满足同一 contract；
   **并且** support-side `assets/source/speclite/support-skills/speclite-agent-*` 必须进入 corpus inventory 和负向扫描，但除非其文档声明 persona activation block，否则不得被误判为 persona Agent 迁移对象；
   **并且** 出现 `resolve_customization.py`、`resolve_config.py`、`_speclite/config.toml` 单文件 runtime config 读取、`{speclite-runtime-root}/scripts` 默认调用或 source checkout resolver fallback 时测试失败。

6. **Existing resolver contract remains unchanged（现有 Resolver 契约保持不变）**
   **前提** 实现本 Story；
   **当** 修改 activation text、lint、fixtures 或 tests；
   **则** 不得改变 `speclite resolve` 默认 stdout pure JSON、stderr JSON Lines、missing key `{}` / exit 0、optional layer warning、required layer failure、merge order 或 `--human` opt-in behavior；
   **并且** 不得新增第二套 TOML merge implementation。

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR52a`、`FR52b`、`FR63a`、`FR71`
- **Supporting NFRs:** `NFR35b-13`、`NFR39`、`NFR40b`
- **UX / Contract Anchors:** SPEC 06 resolve command、ADR 0002 Node resolver decision、Story 2.4/6.5/8.5 established contracts
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/9-1-installed-skill-activation-contract-hardening.md` 的 Story、Acceptance Criteria、Source Requirements 与 Anchor Contract Map；未复制执行记录

### Story 9.2: Python Resolver Compatibility Asset Projection（Python Resolver 兼容资产投影）

作为 SpecLite 维护者，
我希望 legacy Python resolver scripts 在安装结果中被明确定义为 compatibility assets，而不是默认 runtime support，
以便保留排查和迁移价值，同时防止 installed skills 重新依赖 `_speclite/scripts/resolve_*.py`。

#### Acceptance Criteria（验收标准）

1. **Python scripts are compatibility assets only（Python Scripts 仅是兼容资产）**
   **前提** `assets/source/speclite/scripts/resolve_config.py` 与 `assets/source/speclite/scripts/resolve_customization.py` 仍保留在 bundled source 中；
   **当** install / update / repair / packaging 处理这些 scripts；
   **则** 它们必须被标记为 compatibility assets，例如 `artifactKind: "runtime-compat-script"` 或 owning SPEC 允许的等价分类；
   **并且** docs / manifest / files-index 必须说明它们不是默认 skill activation path；
   **并且** Story 9.1 的 full corpus tests 必须继续拒绝 installed skills 引用这些 scripts。

2. **Fresh install projects compatibility scripts with ownership metadata（Fresh Install 投影兼容脚本与所有权元数据）**
   **前提** 用户执行 fresh install；
   **当** installer 写入 `_speclite` runtime structure；
   **则** 若产品决策保留 compatibility assets，必须写入 `_speclite/scripts/resolve_config.py` 与 `_speclite/scripts/resolve_customization.py`；
   **并且** `files-index.json` 必须记录 project-relative path、`installer-owned` ownership、`runtime-compat-script` artifact kind、`sourceRef`、`sha256` hash、`hashAlgorithm` 和 executable intent；
   **并且** safe-write、path boundary、line ending 和 hash projection 必须与其它 installer-owned assets 一致。

3. **Validation distinguishes compat assets from legacy activation dependency（Validation 区分兼容资产与 Legacy 激活依赖）**
   **前提** `validateRuntimePaths` 或等价 validation 读取 files-index；
   **当** `_speclite/scripts/resolve_*.py` 以 approved compatibility asset 形态存在；
   **则** 不得仅因该 path 存在而报告 `runtime-path.legacy-resolver-path`；
   **并且** 如果 Skill activation text、manifest runtime entry、help/phase reference 或 docs default path 引用这些 scripts 作为 resolver，则必须报告 legacy resolver dependency 或让 corpus test 失败。

4. **Update, repair and uninstall honor compatibility asset ownership（Update、Repair 与 Uninstall 尊重兼容资产所有权）**
   **前提** installed project 中 compatibility scripts 缺失、hash drift、mode drift 或 sourceRef drift；
   **当** normal update、explicit `update --repair` 或 uninstall 执行；
   **则** normal update 对 installer-owned drift 保持 conflict / planned update 语义；
   **并且** explicit repair 只可恢复 installer-owned compatibility scripts；
   **并且** uninstall 可移除 installer-owned compatibility scripts；
   **并且** human-owned custom files 与 workflow-owned artifacts 不受影响。

5. **Packaging inventory includes source and installed compatibility asset rules（Packaging Inventory 包含源码与安装兼容资产规则）**
   **前提** 运行 release packaging gate；
   **当** package inventory 校验 runtime assets；
   **则** `assets/source/speclite/scripts/resolve_config.py` 与 `assets/source/speclite/scripts/resolve_customization.py` 必须作为 packaged source assets 存在；
   **并且** packaging manifest / tests 必须断言它们的 classification 是 compatibility，不是 default resolver runtime dependency；
   **并且** 不得为了让 packaging gate 通过而把 `test/fixtures/` 或 root `fixtures/` 打包。

6. **Docs and fixtures state the Node-only default clearly（Docs 与 Fixture 清楚声明 Node-only 默认）**
   **前提** 用户或维护者阅读 runtime boundary、CLI reference、install docs 或 fixture README；
   **当** 文档提到 `_speclite/scripts/resolve_*.py`；
   **则** 必须明确这些 scripts 是 legacy compatibility / troubleshooting assets；
   **并且** `speclite resolve config` 与 `speclite resolve customization` 是唯一默认 installed activation resolver；
   **并且** docs 不得建议 users 在正常 activation 中运行 Python resolver。

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR52a`、`FR52b`、`FR71`
- **Supporting NFRs:** `NFR14`、`NFR17`、`NFR17a`、`NFR25a`、`NFR25b`、`NFR25c`、`NFR29`、`NFR40d`
- **UX / Contract Anchors:** SPEC 04 compatibility asset projection、SPEC 06 Node-only default resolver、SPEC 08 packaging/fixture evidence、ADR 0002
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/9-2-python-resolver-compatibility-asset-projection.md` 的 Story、Acceptance Criteria、Source Requirements 与 Anchor Contract Map；未复制执行记录

### Story 9.3: Installed Skill Data Directory Projection（已安装 Skill data 目录投影）

作为 SpecLite 维护者和 AI IDE 使用者，
我希望 canonical skill package 中的 skill-local `data/` 目录被安装到 `.claude/skills` 与 `.agents/skills` 的 self-contained skill entry 中，并被 hash、validate、fixture 和 update/repair 逻辑一致覆盖，
以便已安装 Workflow 可以从 `{skill-root}/data/` 读取结构化查表数据，不再依赖 source checkout，也不因缺少 `project-types.csv` 或 `domain-complexity.csv` 阻断执行。

#### Acceptance Criteria（验收标准）

1. **Installed entries include skill-local data resources（安装入口包含 Skill 本地 data 资源）**
   **前提** canonical skill package root 中存在 `data/` 目录；
   **当** fresh install、existing update 或 IDE mirror writer 生成 `.claude/skills/<canonicalSkillId>/` 与 `.agents/skills/<canonicalSkillId>/`；
   **则** `data/` 下 regular files 必须按原 relative path 递归复制到两个 installed self-contained entries；
   **并且** 复制过程必须保留 raw bytes、relative POSIX path、file hash、`sourceRef`、ownership 和 executable intent；
   **并且** 不得复制 source-only `SKILL.en.md`，不得改写 canonical skill content，不得生成 adapter-owned placeholder data。

2. **Copy, package hash and validation surfaces stay identical（复制、包 Hash 与校验面保持一致）**
   **前提** `canonicalPackageHash` 用于证明同一 canonical skill package 在不同 IDE targets 中内容一致；
   **当** `data/` 被纳入 installed entry surface；
   **则** copy predicate、`hashPackageDirectory(... include ...)` predicate 和 `validateIdeMirror` hash predicate 必须使用同一语义，全部包含 `data/`；
   **并且** `.claude` 与 `.agents` 中同一 skill 的 `canonicalPackageHash` 必须一致；
   **并且** `ide-mirror.hash-mismatch`、duplicate-entry detection 和 file-integrity diagnostics 不得因为漏扫 `data/` 而误报健康；
   **并且** validate 不得扫描 source checkout 来补齐 baseline。

3. **Data-dependent workflow regressions are covered（依赖 data 的 Workflow 回归被覆盖）**
   **前提** canonical source 中存在 root-level `data/` 的 skill packages，包括 `speclite-create-prd`、`speclite-validate-prd`、`speclite-edit-prd`、`speclite-create-architecture`、`speclite-document-project`、`speclite-prfaq` 和 `speclite-product-brief`；
   **当** release gate 运行安装、fixture 或 focused tests；
   **则** 每个包含 root-level `data/` 的 installed skill entry 都必须在 `.claude/skills/<id>/data/` 和 `.agents/skills/<id>/data/` 中出现相同文件；
   **并且** `speclite-create-prd` 必须至少断言 `data/domain-complexity.csv` 与 `data/project-types.csv` 可从 installed skill root 旁路读取；
   **并且** `speclite-validate-prd` 必须至少断言同名 CSV 被安装；
   **并且** `references/data/` 继续通过 existing `references/` copy surface 覆盖，不得与 root-level `data/` 混淆。

4. **Installed-state fixtures and release gates are refreshed（安装态 Fixture 与发布门禁同步刷新）**
   **前提** `data/` 进入 installed package surface 会改变 files-index、installed tree 和 package hash；
   **当** 实现本 Story；
   **则** `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json`、`skill-index-full.json`、`installed-tree.txt` 和相关 focused expected outputs 必须从真实 install / fixture runner 语义刷新；
   **并且** fixture updates 必须遵守 `08-fixture-contract.md` 的 change policy：先更新 owning contract / executable parser 或 predicate，再更新 snapshots；
   **并且** `release/packaging-manifest.json` 已包含 source `data/` files 时不得倒退；若 packaging check 对 installed surface 有 expected assertions，也必须同步；
   **并且** 若工作树出现 unrelated canonical skill roots 或 unrelated fixture drift，必须停止并记录为 scope blocker，不得把无关 baseline 改动混入本 Story。

5. **Update and repair preserve ownership boundaries（Update 与 Repair 保持所有权边界）**
   **前提** 既有安装缺少新纳入的 installed skill `data/` files，或这些 files 出现 installer-owned drift；
   **当** normal update、explicit `update --repair` 或 uninstall 处理 IDE skill entries；
   **则** new/missing `data/` files 必须按 installer-owned canonical package content 进入 planned update 或 repair eligibility；
   **并且** human-owned custom files、workflow-owned artifacts、`_speclite/custom/*.toml` 和 `_speclite-output/**` 不得被覆盖；
   **并且** restore / regenerate 行为必须复用既有 ownership、safe-write、conflict 和 hash evidence 模型，不新增第二套 repair semantics。

6. **Runtime activation contract remains Node-only and source-independent（运行时激活契约保持 Node-only 且不依赖源码）**
   **前提** Workflow activation 已由 Story 9.1 收口到 `speclite resolve`；
   **当** installed workflow 读取 `{skill-root}/data/*.csv` 或 `{skill-root}/data/*.json`；
   **则** 读取目标必须是 installed self-contained skill entry 中的相邻资源；
   **并且** 不得回退 `assets/source/speclite/**/data`、source checkout path、package cache path、legacy `_bmad` 目录或 Python resolver；
   **并且** `speclite resolve` 的 stdout/stderr、merge order、missing key behavior 和 `CommandResult` JSON contract 不得改变。

#### Requirement Traceability（需求追踪）

- **Primary FRs:** `FR19`、`FR20`、`FR52a`、`FR66`、`FR67`、`FR71`
- **Supporting NFRs:** `NFR14`、`NFR17a`、`NFR23`、`NFR25`、`NFR25a`、`NFR25b`、`NFR25c`、`NFR27`、`NFR40`、`NFR40b`、`NFR40d`
- **UX / Contract Anchors:** SPEC 04 canonical package hash/files index、SPEC 05 self-contained IDE entry、SPEC 08 fresh-install fixture gate、ADR 0003 canonical package equality
- **Planning Backfill Source:** `_bmad-output/implementation-artifacts/stories/9-3-installed-skill-data-directory-projection.md` 的 Story、Acceptance Criteria、Source Requirements 与 Anchor Contract Map；未复制执行记录

## Dependency / Sequencing（依赖与顺序）

Story 9.1 是 P0，优先执行。Story 9.2 是 P1，依赖 Story 9.1 对默认 activation path 的负向断言，避免兼容脚本被误引回默认路径。Story 9.3 是 corrective follow-up，依赖 Story 9.1 的 Node-only activation contract 和 Story 9.2 的 compatibility asset 边界保持不变。

## Completion Gate（完成门禁）

Epic 9 完成时必须满足：

- `/Users/fancyliu/Repos/noi` 这类安装目标中，Alice 不再因 `_speclite/config.toml` 单文件缺少字段而阻断。
- full canonical installed skill corpus 没有默认 Python resolver dependency。
- `speclite` 不在 AI 会话 `PATH` 时，activation 明确报告 CLI unavailable。
- Python scripts 即使安装，也只作为 `runtime-compat-script` 或等价兼容资产，不被 activation 文案引用。
- 包含 root-level `data/` 的 canonical skill packages 在 `.claude/skills` 与 `.agents/skills` 中拥有相同 `data/` files，并进入 files-index、package hash、validate 和 fixture release gates。
- `npm test`、`npm run release:packaging-check` 和 agent lint/corpus tests 覆盖该 contract。
