# Epic 11: Phase-Aligned Workflow Artifact Governance（阶段对齐的 Workflow Artifact 治理）

目标项目维护者与 AI IDE 使用者可以获得与 SpecLite SDLC 阶段顺序一致、可预测、可审计的 workflow artifact 文件体系：fresh install 预创建完整阶段 roots，canonical Skills 将产物写入唯一约定位置，existing installs 继续尊重既有配置与 workflow-owned artifacts，不发生静默迁移。

**覆盖 FR / NFR / UX：** FR13a, FR23b, FR23c, FR23d, FR23e, FR23f, FR23g, FR66a, NFR14a, NFR40f, UX Filesystem Space Map, UX Artifact Evidence Card

## Dependency / Sequencing（依赖与顺序）

Epic 11 按 Story 11.1 → 11.10 strict serial 执行。每个 Story 只能消费更早 Story 已建立的 contract/evidence，不得依赖未来 Story 才能成立：

- Story 11.1 建立 executable root-resolution contract。
- Story 11.2 投影 fresh-install config、directories、manifest/index 与 evidence。
- Story 11.3 建立 existing-install compatibility、no-silent-migration 与 mismatch diagnostics。
- Story 11.4–11.10 依次消费上述基础；Story 11.8 必须以 exact-old-ID / exact-old-path bounded scan 独立完成 readiness rename/routing closure，Story 11.10 随后以新 canonical state 为 baseline 执行 broad、read-only grill semantic inventory，不作为 Story 11.8 的后置验收条件。

## Story 11.1: Executable Artifact Root Resolution Contract（可执行 Artifact Root 解析契约）

作为 SpecLite runtime 与 workflow 维护者，  
我希望七类 artifact roots 通过唯一、可执行的 resolution contract 解析，  
以便 installer、manifest、validator 和 installed workflows 不会分别维护互相漂移的路径、默认值与 fallback 语义。

### Acceptance Criteria（验收标准）

1. **七类 fields 与 placeholders 由唯一契约管理**

   **Given** runtime config、module metadata 或 workflow 使用 artifact root  
   **When** 解析七类 fields 与 placeholders  
   **Then** 必须支持 `brainstorming_artifacts`、`analysis_artifacts`、`planning_artifacts`、`solutioning_artifacts`、`implementation_artifacts`、`devops_artifacts`、`project_knowledge` 及其对应 placeholders  
   **And** fields、fresh defaults 与 legacy fallback 只由 `SPEC 09` 管理。

2. **Fresh defaults 由 resolver 统一提供**

   **Given** fresh config 尚不存在  
   **When** resolver 计算 artifact roots  
   **Then** 返回 `0-brainstorming-artifacts/` 至 `5-devops-artifacts/` 以及 `project-knowledge-base/` 的 canonical fresh defaults  
   **And** command、manifest 或 workflow 不得维护第二套默认值。

3. **Existing explicit config 继续权威**

   **Given** existing install 已有显式 artifact root 配置  
   **When** resolver 计算实际 root  
   **Then** 显式配置继续权威，并标记为 `explicit-config`  
   **And** 不得因 canonical defaults 变化自动改写已有配置。

4. **新增 fields 缺失时使用兼容 fallback**

   **Given** existing install 缺少新增 fields  
   **When** resolver 应用兼容规则  
   **Then** `brainstorming_artifacts` fallback 到旧 `{output_folder}/brainstorming`，`analysis_artifacts` 与 `solutioning_artifacts` fallback 到既有 `{planning_artifacts}`  
   **And** 结果标记为 `legacy-compatible`，不得描述为 migration 或配置损坏。

5. **Resolution result 可被全部 consumers 复用**

   **Given** root resolution 完成  
   **When** 结果被 installer、manifest、validator 或 workflow 消费  
   **Then** 必须提供稳定的 `resolvedRoot` 与 `resolutionMode`  
   **And** 所有 public paths 使用 project-relative POSIX form。

6. **Project boundary failure 使用稳定诊断**

   **Given** 配置包含 unresolved token、path escape 或 symlink escape  
   **When** resolver 校验 project boundary  
   **Then** 返回 owning taxonomy 中的稳定 diagnostic  
   **And** 不得把 escaped absolute path 投影到 public JSON、manifest/index 或 fixture snapshot。

7. **Project Knowledge 与 Public Documentation 保持分离**

   **Given** 调用方区分 Project Knowledge 与 Public Documentation  
   **When** 解析输出语义  
   **Then** `{project_knowledge}` 表示 workflow-generated project knowledge  
   **And** `docs/` 保持 Primary Public Document，不作为 alias 或 fallback。

8. **Scope Boundary（范围边界）**

   本 Story 只建立 executable resolution contract，不创建目录，不生成 fresh config/manifest projection，也不修改具体 workflow 的 artifact routing。

### Requirement Traceability（需求追踪）

- FR13a
- NFR14a
- NFR40f（resolution contract 部分）
- UX-DR7、UX-DR8
- SPEC 09

## Story 11.2: Fresh Install Artifact Root Projection（Fresh Install Artifact Root 投影）

作为目标项目维护者，  
我希望 fresh install 把已解析的阶段化 artifact roots 投影到 config、目录结构、manifest/index 和安装摘要，  
以便新项目从首次安装开始就获得完整、可审计的 SDLC artifact topology。

### Acceptance Criteria（验收标准）

1. **Fresh config 投影七类 artifact fields**

   **Given** 目标项目执行 fresh install  
   **When** installer 生成 `_speclite/config.toml`  
   **Then** 必须写入 Story 11.1 resolution contract 定义的七类 artifact fields，分别指向：

   - `core.brainstorming_artifacts = "{project-root}/_speclite-output/0-brainstorming-artifacts"`
   - `modules.sdlc.analysis_artifacts = "{project-root}/_speclite-output/1-analysis-artifacts"`
   - `modules.sdlc.planning_artifacts = "{project-root}/_speclite-output/2-planning-artifacts"`
   - `modules.sdlc.solutioning_artifacts = "{project-root}/_speclite-output/3-solutioning-artifacts"`
   - `modules.sdlc.implementation_artifacts = "{project-root}/_speclite-output/4-implementation-artifacts"`
   - `modules.sdlc.devops_artifacts = "{project-root}/_speclite-output/5-devops-artifacts"`
   - `modules.sdlc.project_knowledge = "{project-root}/_speclite-output/project-knowledge-base"`

2. **写入授权后预创建全部一级目录**

   **Given** final write plan 已获授权且 operation lock 已取得  
   **When** runtime structure creation 执行  
   **Then** 必须预创建上述七个一级目录  
   **And** 未授权、存在 blocker 或未取得 lock 时不得创建目录。

3. **Directory plan 由 canonical metadata 驱动**

   **Given** installer 构建 directory plan  
   **When** 读取 required roots  
   **Then** 目录集合与顺序必须来自 canonical module metadata 和 Story 11.1 的 resolved model  
   **And** command 层不得维护第二份硬编码列表。

4. **Manifest/index 投影实际 resolved roots**

   **Given** fresh roots 已解析并创建  
   **When** manifest/index generation 执行  
   **Then** 必须投影实际 `resolvedRoot`、`resolutionMode: fresh-default`、ownership 与 artifact contract references  
   **And** manifest/index 不得成为第二套 config 真源。

5. **Ready Summary 展示实际 filesystem planes**

   **Given** fresh install 输出 Ready Summary 或 Filesystem Space Map  
   **When** 展示 Phase Artifact、Project Knowledge 与 Public Documentation planes  
   **Then** 必须展示实际 roots、plane/phase、resolution mode 和 ownership  
   **And** `docs/` 与 `{project_knowledge}` 必须作为不同 planes 呈现。

6. **Fresh-install fixtures 验证 projection**

   **Given** fresh install fixture 运行  
   **When** 比较 expected config、file tree、manifest/index 与 human/JSON evidence  
   **Then** 必须验证七类 fields、全部一级目录、project-relative POSIX paths 和 deterministic ordering  
   **And** 不允许 absolute path、checkout root 或非契约化 timestamp 进入 stable snapshot。

7. **Scope Boundary（范围边界）**

   本 Story 只处理 fresh-install projection，不迁移 existing artifacts，不定义 legacy fallback，也不修改 Analysis、Planning、UX、Readiness 或 CR workflow 的具体输出路由。

### Requirement Traceability（需求追踪）

- FR13a
- NFR14a
- NFR40f（fresh-install 部分）
- UX-DR3、UX-DR7
- SPEC 03、SPEC 04、SPEC 08、SPEC 09

## Story 11.3: Existing Install Compatibility And Diagnostics（Existing Install 兼容与诊断）

作为 existing SpecLite 项目的维护者，  
我希望既有 artifact 配置和 workflow-owned artifacts 在 topology 演进后继续有效，  
以便普通 install、update 或 repair 不会把 fallback 误当成 migration，也不会破坏历史产物。

### Acceptance Criteria（验收标准）

1. **Existing explicit config 继续权威**

   **Given** existing install 已显式配置 `planning_artifacts`、`implementation_artifacts`、`devops_artifacts` 或 `project_knowledge`  
   **When** 执行 status、validate、update、repair planning 或 workflow resolution  
   **Then** 已有配置继续权威  
   **And** 不得用 fresh defaults 自动覆盖或回写这些 fields。

2. **新增 fields 缺失时使用 legacy fallback**

   **Given** existing install 缺少 `brainstorming_artifacts`、`analysis_artifacts` 或 `solutioning_artifacts`  
   **When** resolver 读取 roots  
   **Then** 必须使用 Story 11.1 定义的 legacy fallback  
   **And** 不得把缺少新增 fields 报告为配置损坏。

3. **普通 lifecycle operations 不迁移 workflow artifacts**

   **Given** 旧目录中存在 PRD、Story、review、research 或其他 workflow-owned artifacts  
   **When** 执行 install、update 或 `update --repair`  
   **Then** 不得移动、复制、重命名、删除或重写这些 artifacts  
   **And** explicit artifact migration 保留为独立、另行授权的后续能力。

4. **Config/artifact mismatch 只产生诊断**

   **Given** 用户只修改 config root，但 artifacts 仍位于旧路径  
   **When** validator 或 workflow discovery 比较 configured root、resolved root、actual consumed path 与 on-disk evidence  
   **Then** 必须报告稳定的 `config-artifact-mismatch` diagnostic  
   **And** 不得修改 config、迁移 artifact 或宣称 migration 已完成。

5. **Legacy lifecycle artifacts 继续可发现**

   **Given** existing install 使用旧 whole/sharded planning documents 或旧 `sprint-status.story_location`  
   **When** downstream workflow 发现和解析历史 artifacts  
   **Then** 旧位置继续可发现、可消费  
   **And** 实际消费路径与 compatibility mode 必须进入可审计 evidence。

6. **Existing-install output 展示实际 roots**

   **Given** Ready Summary、status 或 Filesystem Space Map 展示 existing install  
   **When** 输出 resolved roots  
   **Then** 必须展示实际 `resolvedRoot` 与 `resolutionMode`  
   **And** 不得用 fresh defaults 代替 existing state。

7. **Compatibility fixtures 覆盖 mismatch 与 non-migration**

   **Given** `existing-install-update` 与 config/artifact mismatch fixtures 运行  
   **When** 比较 config、file tree、diagnostics 和 artifact content  
   **Then** 必须验证显式配置保持权威、legacy fallback 可解析、workflow artifacts 内容不变且 mismatch 可诊断  
   **And** 不允许 fixture 通过自动迁移来满足断言。

8. **Scope Boundary（范围边界）**

   本 Story 只处理 existing-install compatibility 和 diagnostics，不执行 artifact migration，也不修改具体 workflow 的新默认输出路由。

### Requirement Traceability（需求追踪）

- FR13a
- NFR14a
- NFR40f（existing-install 与 mismatch 部分）
- UX-DR3、UX-DR7、UX-DR8、UX-DR15
- SPEC 07、SPEC 08、SPEC 09

## Story 11.4: Route Analysis Workflows into Dedicated Artifact Subdirectories（将 Analysis Workflows 路由至专属 Artifact 子目录）

作为使用 SpecLite 的 AI IDE 用户和项目维护者，  
我希望 `1-analysis` 阶段的 workflow artifact 输出到 `{analysis_artifacts}` 下的专属子目录，  
以便分析产物具有稳定、可预测的阶段归属，并与 planning artifacts、project knowledge 和公开文档明确分离。

### Acceptance Criteria（验收标准）

1. **安装时预创建 Analysis 子目录**

   **Given** 目标项目执行 fresh install  
   **When** runtime structure creation 执行  
   **Then** 必须预创建：

   - `{analysis_artifacts}/research/`
   - `{analysis_artifacts}/product-brief/`
   - `{analysis_artifacts}/prfaq/`

2. **Research Skills 统一输出至 `research/`**

   **Given** 用户运行 `speclite-domain-research`、`speclite-market-research` 或 `speclite-technical-research`  
   **When** Skill 创建 research artifact  
   **Then** 产物必须写入 `{analysis_artifacts}/research/`  
   **And** 各 Skill 必须保留现有文件命名规则。

3. **Product Brief 输出至专属目录**

   **Given** 用户运行 `speclite-product-brief`  
   **When** Skill 创建 product brief artifact  
   **Then** 产物必须写入 `{analysis_artifacts}/product-brief/`。

4. **PRFAQ 输出至专属目录**

   **Given** 用户运行 `speclite-prfaq`  
   **When** Skill 创建 PRFAQ artifact  
   **Then** 产物必须写入 `{analysis_artifacts}/prfaq/`。

5. **Canonical Source 与相关引用同步更新**

   **Given** Analysis 输出路径发生变化  
   **When** 本 Story 实施完成  
   **Then** 必须同步更新所有受影响的 canonical `SKILL.md`、`SKILL.en.md`、workflow steps/references、`module-help.csv`、module metadata、artifact contracts、config examples 与路径治理文档  
   **And** 不得遗留与新契约冲突的旧路径声明。

6. **Project Knowledge、Public Docs 与 Analysis Artifacts 语义分离**

   **Given** research Skills 需要读取项目背景  
   **When** 扫描目标项目上下文或写入 research artifact  
   **Then** Skills 可以读取 `{project_knowledge}`  
   **But** 不得把 research artifact 输出到 `{project_knowledge}`  
   **And** `_speclite-output/project-knowledge-base/` 必须保持为 workflow-generated project knowledge 的默认位置  
   **And** target project `docs/` 必须保持为 Primary Public Document。

7. **旧安装使用兼容 fallback 且不迁移既有产物**

   **Given** existing install 未显式配置 `analysis_artifacts`  
   **When** Analysis workflow 解析输出目录  
   **Then** 必须使用 Story 11.1 定义的 resolution contract 与 Story 11.3 定义的 legacy compatibility  
   **And** 不得自动迁移、移动、复制、重命名或删除已有 Analysis artifacts。

8. **Corpus 与路径一致性检查排除旧生产者声明**

   **Given** canonical source 已完成路径更新  
   **When** 执行 corpus/path consistency 检查  
   **Then** 受影响的 Analysis producers 不得继续声明 `{planning_artifacts}/research/`、planning root 下的 product brief 或 PRFAQ 输出，以及 `{project_knowledge}` 下的 research 输出。

9. **Focused Tests 与 Fixtures 覆盖 Analysis 路由**

   **Given** 本 Story 实现完成  
   **When** 执行 focused test suite  
   **Then** 至少覆盖 fresh install 子目录创建、新默认输出路径、legacy config fallback、artifact metadata/default path，以及 project knowledge、public docs 与 analysis artifacts 的路径边界。

10. **Scope Boundary（范围边界）**

    本 Story 只处理 `1-analysis` 阶段，不处理 Planning、UX、Readiness 或 Code Review 的输出路径。

### Requirement Traceability（需求追踪）

- FR23b
- NFR14a
- NFR40f（Analysis 路由部分）

## Story 11.5: Govern Planning and Solutioning Documents as Whole and Sharded Artifacts（治理 Planning 与 Solutioning 文档的整篇与分片产物）

作为使用 SpecLite 的产品、架构和项目维护人员，  
我希望 PRD、Epics 和 Architecture 文档进入各自 phase-owned subject directory，
以便 fresh install 与 existing install 都能确定性地创建、发现和消费完整文档及分片文档，同时避免双重事实源或静默迁移。

### Acceptance Criteria（验收标准）

1. **Fresh Install 预创建 Phase-owned Subject Directories**

   **Given** 目标项目执行 fresh install  
   **When** runtime structure creation 执行  
   **Then** 必须预创建：

   - `{planning_artifacts}/prd/`
   - `{planning_artifacts}/epics/`
   - `{solutioning_artifacts}/architecture/`

2. **Creation Workflows 使用 Phase-owned 完整文档路径**

   **Given** 用户运行对应的 PRD、Epics 或 Architecture creation workflow  
   **When** workflow 创建完整文档  
   **Then** 默认输出路径必须分别为：

   - `{planning_artifacts}/prd/prd.md`
   - `{planning_artifacts}/epics/epics.md`
   - `{solutioning_artifacts}/architecture/architecture.md`

3. **Shard 输出保留在对应 subject directory**

   **Given** 用户对上述完整文档执行 `speclite-shard-doc`  
   **When** workflow 生成 sharded documents  
   **Then** 分片必须继续位于对应的 `epics/`、`prd/` 或 `architecture/` subject directory  
   **And** 必须保留现有 `index.md` 与 shard 文件命名契约  
   **And** 不得额外引入未经要求的 `shards/` 层级  
   **And** 完整文档与分片文档可以在磁盘上共存，不得静默覆盖彼此；共存不代表 downstream workflow 获得自动选择任一版本的授权。

4. **Consumers 支持 Phase-owned Whole/Sharded 位置**

   **Given** downstream Skill 需要读取 PRD、Epics 或 Architecture  
   **When** 执行 artifact discovery
   **Then** PRD 与 Epics 必须从 Planning root 支持完整文档、subject directory 中的 sharded `index.md` 及 shard documents
   **And** Architecture 必须从 Solutioning root 支持相同的 whole/sharded discovery shape。

5. **Whole/Sharded Discovery 使用唯一决策表**

   **Given** downstream workflow 在 authoritative subject directory 中发现 PRD、Epics 或 Architecture input
   **When** workflow 解析 whole/sharded discovery state
   **Then** 必须严格应用以下决策表，不得由各 consumer 自行定义 precedence：

   | Discovery State | Canonical Behavior | Continuation |
   | --- | --- | --- |
   | `whole-only` | 只消费 subject directory 中的 canonical whole document | Continue |
   | `sharded-only`，且 `index.md` 与声明的 shard links 完整 | 只消费 `index.md` 及其声明的 shards | Continue |
   | `whole+sharded`，且没有显式 input selection | 不选择任一版本、不混合内容；报告 ambiguity 并请求人工选择 | Block |
   | `whole+sharded`，且用户已对当前 invocation 提供显式 input selection | 只消费显式选择的 whole document 或 sharded `index.md`，并记录未选版本 | Continue |
   | sharded files 存在但缺少 `index.md` | 报告 invalid sharded shape | Block |
   | `index.md` 引用缺失、越出 authoritative subject directory 或无法读取的 shard | 报告 broken shard reference | Block |
   | whole document 与有效 sharded input 均不存在 | 报告 subject document missing | Block |

   **And** 显式 input selection 只解决当前 workflow invocation，不得删除、覆盖、迁移或改写未选版本
   **And** 每次 discovery 必须记录 `resolvedRoot`、`resolutionMode`、`actualConsumedPath`、`discoveryShape`、`ambiguityStatus` 与选择来源
   **And** blocking state 必须使用 `SPEC 07` 的 `artifact-path` taxonomy 中预先注册的稳定 issue ID；producer 不得临场生成自由文本 issue ID
   **And** blocking state 必须保持 read-only，不得产生部分 artifact write 或更新 workflow progress。

6. **Existing Install 使用 Explicit Config 与 Legacy-compatible Fallback**

   **Given** existing install 执行 install、update、repair 或 downstream discovery
   **When** config 显式声明 artifact roots
   **Then** explicit config 必须作为 authoritative root
   **And** 当 `solutioning_artifacts` 缺失时，必须按 SPEC 09 回退到既有 Planning root，并明确标记 `legacy-compatible`
   **And** evidence 必须展示实际解析和消费路径，不得把 fallback 表述为 fresh canonical layout。

7. **Compatibility 不触发 Migration**

   **Given** config 与现有 artifact location 不一致，或 Architecture 位于 legacy-compatible 路径
   **When** runtime 或 consumer 发现该差异
   **Then** 必须输出诊断与实际路径 evidence
   **And** 不得自动移动、复制、重命名、删除或重写文档
   **And** 不得宣称已完成 migration。

8. **Canonical Source 与相关引用同步更新**

   **Given** Planning 与 Solutioning 输出和发现路径发生变化
   **When** 本 Story 实施完成
   **Then** 必须同步更新受影响的 `SKILL.md`、`SKILL.en.md`、workflow steps/references、`module-help.csv`、module metadata、artifact contracts、config examples、producer/consumer rules 与路径治理文档
   **And** 不得创建第二套 artifact-root contract。

9. **Corpus 与路径一致性检查排除冲突的 Active Defaults**

   **Given** canonical source 已完成路径更新  
   **When** 执行 corpus/path consistency 检查  
   **Then** active producer 不得继续把 fresh Architecture 输出到 `{planning_artifacts}/architecture/`
   **And** active producer 不得把 fresh PRD 或 Epics 完整文档输出到 `{planning_artifacts}` 根目录
   **And** 受控历史引用必须明确标记为 historical 或 `legacy-compatible`。

10. **Focused Tests 与 Fixtures 覆盖 Governance Matrix**

    **Given** 本 Story 实现完成
    **When** 执行 focused test suite
   **Then** 至少覆盖 fresh subject directories、三类完整文档路径、whole-only、valid sharded-only、whole-and-sharded without selection、whole-and-sharded with explicit selection、sharded index missing、broken shard reference、subject document missing、explicit config、fallback、compatibility evidence、config/artifact mismatch、no-migration、POSIX path 与 negative corpus scan
   **And** 所有 blocking fixture 必须断言 stable issue ID、`ambiguityStatus`、continuation result、零 artifact write 与零 progress mutation。

11. **Scope Boundary（范围边界）**

    本 Story 只处理 PRD、Epics 和 Architecture 的 whole/sharded governance；UX artifacts 由 Story 11.6 单独处理，validation/readiness/Correct Course 由后续 Story 处理；不得实施 artifact migration，不得重开已完成 Story 或改写历史完成记录。

### Implementation Tasking Boundary（实现任务边界）

为保证每个实现任务可由单个 dev agent 在 bounded context 中完成，本 Story 实施时必须依次拆为：

1. resolver/discovery decision table 与 `SPEC 09` / `SPEC 07` contract anchors；
2. PRD、Epics、Architecture producer paths；
3. downstream consumer discovery 与 explicit input selection；
4. fresh/existing/ambiguity fixture matrix；
5. canonical corpus negative scan 与最终 evidence 汇总。

后续任务只能消费更早任务已建立并验证的 contract/evidence；不得把 consumer behavior 或 fixture contract 留给 Story 11.6 及更晚 Story。

### Dependency Gate（依赖门禁）

- 必须以前置 Story 11.1–11.4、SPEC 07、SPEC 09 与 `CC-2026-08-17-architecture-root` 为当前约束。
- 不得依赖 Story 11.6 或更晚 Story 才能完成本 Story 的验收。

### Anchor Contract Map（锚点契约映射）

- **Contract**：FR23c、SPEC 07、SPEC 09、`CC-2026-08-17-architecture-root`；`SPEC 09` 必须拥有 discovery decision table，`SPEC 07` 必须在任何 producer/consumer 输出前注册对应 blocking issue IDs。
- **Functional**：artifact-root resolver、runtime structure、PRD/Epics/Architecture producers 与 consumers；允许 equivalent implementation，但必须保持同一外部契约。
- **Evidence**：focused tests、fixtures、discovery evidence 与 negative corpus scans。
- **Guidance**：候选实现位置包括 config schema/initialization、runtime structure、manifest/module metadata 与相关 workflow references；实际文件以实现时的 current codebase 为准。

### Equivalent Implementation Policy（等价实现策略）

允许实现调整内部组件边界、helper 名称或文件位置，但不得改变 phase-owned roots、discovery decision table、explicit input selection、explicit-config authority、`legacy-compatible` evidence、blocking continuation 与 no-migration 行为。任何等价实现都必须由相同的 acceptance tests 和 traceability evidence 证明。

### Evidence Plan（证据计划）

- 以 fresh 与 existing install fixtures 证明 canonical 与 compatibility 路径。
- 以完整 discovery decision matrix 证明 whole-only、valid sharded-only、coexistence、invalid sharded shape 与 missing input 的唯一 continuation behavior 和实际消费路径。
- 以 explicit input selection fixture 证明选择只作用于当前 invocation，且未选版本保持不变。
- 以 blocking fixtures 证明 stable issue、read-only stop、零 artifact write 与零 progress mutation。
- 以 mismatch/no-migration tests 证明诊断不会产生文件变更。
- 以 corpus negative scan 证明 active defaults 不再违反 phase-owned root contract。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- FR23c
- NFR14a
- NFR40f（Planning 与 Solutioning whole/sharded 部分）
- UX-DR7
- UX-DR8
- UX-DR15
- SPEC 09
- CC-2026-08-17-architecture-root

## Story 11.6: Consolidate UX Artifacts under the Planning UX Space（将 UX Artifacts 归集到 Planning UX 空间）

作为使用 SpecLite 的 UX 设计人员和项目维护者，  
我希望 UX workflows 的文档、可视化页面及 design-system 产物统一进入 `{planning_artifacts}/ux/`，  
以便 UX 资产拥有稳定的目录边界，并与 PRD、Epics 和 Architecture 产物清晰分离。

### Acceptance Criteria（验收标准）

1. **安装时预创建 UX 目录**

   **Given** 目标项目执行 fresh install  
   **When** runtime structure creation 执行  
   **Then** 必须预创建 `{planning_artifacts}/ux/`。

2. **UX Creation Workflow 使用专属文件路径**

   **Given** 用户运行 UX creation workflow  
   **When** workflow 创建核心 UX artifacts  
   **Then** 默认输出路径必须分别为：

   - `{planning_artifacts}/ux/ux-design-specification.md`
   - `{planning_artifacts}/ux/ux-color-themes.html`
   - `{planning_artifacts}/ux/ux-design-directions.html`

3. **Design System 与扩展产物保持在 UX 边界内**

   **Given** design-system workflow 或后续 UX 扩展 workflow 创建产物  
   **When** workflow 解析输出路径  
   **Then** design-system 产物必须位于 `{planning_artifacts}/ux/design-system/`  
   **And** `design-system/` 等 workflow-owned 子目录可以按需创建  
   **And** installer 必须保证父目录 `{planning_artifacts}/ux/` 已存在。

4. **UX Workflow-Owned Artifacts 不得跨越目录边界**

   **Given** UX workflow 创建其他子目录或辅助产物  
   **When** 写入 artifact  
   **Then** 必须保持在 `{planning_artifacts}/ux/` 边界内  
   **And** 不得重新散落到 `{planning_artifacts}` 根目录、target project `docs/` 或 `{project_knowledge}`。

5. **UX Producers 与 Consumers 使用统一路径**

   **Given** Skill 生产或消费 UX artifacts  
   **When** 解析输入或输出位置  
   **Then** UX design specification、color themes、design directions、design-system documents，以及 UX references、screenshots 和辅助 assets 均必须使用新的 UX 路径契约。

6. **相对链接与资源引用保持有效**

   **Given** Markdown 或 HTML artifact 因目录调整而下移  
   **When** artifact 引用本地文档、图片、样式或其他 assets  
   **Then** 相对链接、资源引用和跨文档导航必须保持有效  
   **And** 不得逃逸到 target-project root 之外。

7. **Canonical Source 与相关引用同步更新**

   **Given** UX 输出与发现路径发生变化  
   **When** 本 Story 实施完成  
   **Then** 必须同步更新相关 `SKILL.md`、`SKILL.en.md`、workflow steps/references/templates、`module-help.csv`、module metadata、artifact contracts、config examples、UX discovery rules 与路径治理文档  
   **And** 不得遗留与新契约冲突的旧默认路径声明。

8. **旧 UX Artifacts 保持可发现且不迁移**

   **Given** existing install 的 UX artifacts 位于旧位置  
   **When** 执行 install、update、repair 或 UX discovery  
   **Then** 旧 artifacts 必须保持可发现  
   **And** 不得自动迁移、移动、复制、重命名或删除这些 artifacts。

9. **Corpus 与路径一致性检查排除旧生产者默认值**

   **Given** canonical source 已完成路径更新  
   **When** 执行 corpus/path consistency 检查  
   **Then** 受影响的 UX producers 不得继续把新 UX artifacts 默认输出到 `{planning_artifacts}` 根目录。

10. **Focused Tests 与 Fixtures 覆盖 UX 路由**

    **Given** 本 Story 实现完成  
    **When** 执行 focused test suite  
    **Then** 至少覆盖 fresh install 创建 `ux/`、三个指定文件的新默认路径、`design-system/` 按需创建、UX relative links/assets、legacy UX artifact discovery，以及 `ux/`、`docs/` 与 `{project_knowledge}` 的路径边界。

11. **Scope Boundary（范围边界）**

    本 Story 只处理 UX artifacts，不处理 PRD Validation、Implementation Readiness 或 Code Review 产物。

### Requirement Traceability（需求追踪）

- FR23d
- NFR14a
- NFR40f（UX 部分）
- UX Filesystem Space Map
- UX Artifact Evidence Card

## Story 11.7: Standardize the PRD Validation Report Filename（统一 PRD Validation Report 文件名）

作为运行 PRD validation 的产品经理和项目维护者，  
我希望 `speclite-validate-prd` 始终使用固定、可预测的日期化报告文件名，  
以便自动化工具和后续 workflow 能可靠定位 validation evidence。

### Acceptance Criteria（验收标准）

1. **固定报告 Basename**

   **Given** 用户运行 `speclite-validate-prd`  
   **When** workflow 生成 validation report  
   **Then** 报告 basename 必须严格为 `prd-validate-report-{yyyy-MM-dd}.md`。

2. **运行时生成标准日期**

   **Given** workflow 确定执行日期  
   **When** 替换 `{yyyy-MM-dd}`  
   **Then** 必须使用四位年份、两位月份和两位日期  
   **And** 例如 2026-07-21 必须生成 `prd-validate-report-2026-07-21.md`。

3. **报告使用 PRD 专属目录**

   **Given** Story 11.5 的 Planning topology 已启用  
   **When** workflow 解析默认输出位置  
   **Then** 完整输出路径必须为 `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`。

4. **Skill 标识保持不变**

   **Given** 本 Story 只统一报告命名  
   **When** canonical package 更新  
   **Then** Skill 名称必须继续为 `speclite-validate-prd`  
   **And** 不得对该 Skill 进行重命名。

5. **Canonical Source 与相关引用同步更新**

   **Given** 报告 basename 与路径已固定  
   **When** 本 Story 实施完成  
   **Then** 必须同步更新相关 `SKILL.md`、`SKILL.en.md`、workflow steps/references/templates、`module-help.csv`、artifact contracts、示例命令、示例输出、downstream report discovery 与路径治理文档  
   **And** 所有声明必须使用完全一致的名称。

6. **排除非标准新报告命名**

   **Given** 执行 canonical corpus 检查  
   **When** 检查新报告的默认命名声明  
   **Then** 不得继续声明 `prd-validation-report-*`、`prd-validation-*`、`validate-prd-report-*`、无日期固定报告名或其他与指定 basename 不一致的变体。

7. **旧名称报告保持可发现且不迁移**

   **Given** existing install 已存在旧名称 validation reports  
   **When** 执行 install、update、repair 或历史 evidence discovery  
   **Then** 不得自动重命名、迁移、覆盖或删除这些报告  
   **And** 需要历史 validation evidence 的 consumers 必须继续识别既有报告。

8. **同日目标已存在时执行 Read-only Block**

   **Given** `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` 已存在
   **When** 用户在同一天再次运行 workflow
   **Then** workflow 必须在写入前停止
   **And** 不得 overwrite、append、truncate、自动删除或生成 suffix filename
   **And** 不得更新 workflow completion/progress metadata
   **And** 必须报告 project-relative target path、冲突原因，以及“保留并移走或删除既有报告后重新运行”的人工处置建议
   **And** 即使既有内容与本次结果看似相同，也不得未经本次完整 validation 复用为新 evidence
   **And** conflict 必须使用 `SPEC 07` 的 `artifact-path` taxonomy 中预先注册的稳定 issue ID，不得使用自由文本 issue ID。

9. **Focused Tests 与 Fixtures 覆盖命名契约**

   **Given** 本 Story 实现完成  
   **When** 执行 focused test suite  
   **Then** 至少覆盖精确 basename、日期格式及零填充、`{planning_artifacts}/prd/` 默认路径、canonical metadata/help/example 一致性与 legacy report discovery
   **And** target absent 时必须创建精确 dated basename
   **And** target 存在且内容看似相同或不同时均必须 block，并断言零报告写入与零 progress mutation
   **And** legacy-name report 存在但 canonical target 不存在时，必须保留 legacy report 并创建 canonical target
   **And** conflict 后不得留下 partial report、temporary report 或受控 suffix report。

10. **Scope Boundary（范围边界）**

    本 Story 不修改 PRD validation 的检查规则、评分逻辑或报告正文结构，也不处理 Implementation Readiness 文件名。

### Dependency Gate（依赖门禁）

- 必须以前置 Story 11.1–11.6、SPEC 07 与 SPEC 09 为当前约束。
- 不得依赖 Story 11.8 或更晚 Story 才能完成报告命名、同日冲突和 legacy evidence discovery 验收。

### Anchor Contract Map（锚点契约映射）

- **Contract**：FR23e、SPEC 07、SPEC 09；固定 basename 与 same-day read-only block 由本 Story 定义，`SPEC 07` 必须在 producer 输出前注册对应 blocking issue ID。
- **Functional**：`speclite-validate-prd` report path resolution、pre-write existence check、legacy report discovery 与 workflow progress handling。
- **Evidence**：focused tests、same-day conflict fixtures、legacy discovery fixture 与 canonical corpus negative scan。
- **Guidance**：候选实现位置包括 validation workflow output step、artifact contract、help/example 与 downstream discovery；实际文件以实现时的 current canonical source 为准。

### Equivalent Implementation Policy（等价实现策略）

允许实现调整内部 existence-check helper、write guard 或文件位置，但不得改变精确 dated basename、target-exists read-only block、零 progress mutation、legacy report preservation 与 no-suffix 行为。

### Evidence Plan（证据计划）

- 以 target-absent fixture 证明只创建精确 dated basename。
- 以 same-content 与 different-content target-exists fixtures 证明两者均在写入前阻断。
- 以 filesystem snapshot 与 progress metadata comparison 证明 conflict 为零写入、零 mutation。
- 以 legacy-name-only fixture 证明历史 evidence 保持原位且不阻止 canonical target 首次创建。
- 以 canonical corpus scan 证明 active producer/help/example 不再声明非标准 basename 或自动 suffix behavior。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- FR23e
- NFR14a
- NFR40f（PRD Validation 文件名部分）

## Story 11.8: Rename and Relocate Implementation Readiness Skills（更名并迁移 Implementation Readiness Skills）

作为执行 Implementation Readiness 检查的项目维护者，  
我希望相关 Skills 使用语义完整的统一名称，并将报告归入 `3-solutioning` 阶段的固定目录，  
以便 Skill discovery、workflow 编排和 readiness evidence 定位保持一致。

### Acceptance Criteria（验收标准）

1. **Canonical Skill 标识与 Package Directory 完成更名**

   **Given** canonical source 定义两个 Implementation Readiness Skills  
   **When** 本 Story 实施完成  
   **Then** 必须完成以下更名：

   - `speclite-ir-grill-consistency-reviewer` → `speclite-implementation-readiness-grill-consistency-reviewer`
   - `speclite-check-implementation-readiness` → `speclite-implementation-readiness-check`

2. **Fresh Install 只投影新 Canonical 名称**

   **Given** 目标项目执行 fresh install  
   **When** installer 投影 Skills  
   **Then** 只允许投影新的 canonical Skill 名称  
   **And** Skill frontmatter、package directory、help entry、registry 和 activation metadata 必须一致  
   **And** 不得出现目录名与 Skill 名不一致。

3. **两个 Skills 使用统一 Solutioning 输出目录**

   **Given** 用户运行任一新的 Implementation Readiness Skill  
   **When** workflow 解析输出目录  
   **Then** 新默认输出目录必须为 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`。

4. **Readiness Check 报告 Basename 保持不变**

   **Given** 用户运行 `speclite-implementation-readiness-check`  
   **When** workflow 创建 readiness report  
   **Then** 报告 basename 必须继续为 `implementation-readiness-report-{yyyy-MM-dd}.md`。

5. **Grill Consistency Reviewer 保持现有报告命名**

   **Given** 用户运行 `speclite-implementation-readiness-grill-consistency-reviewer`  
   **When** workflow 创建 reviewer artifact  
   **Then** 必须保持其现有报告文件命名规则  
   **And** 本 Story 不得擅自重命名该报告文件。

6. **Bounded Rename/Routing Surfaces 同步更新**

   **Given** Skill 标识与输出路径发生变化
   **When** 本 Story 实施完成
   **Then** 必须同步更新以下 bounded surfaces：

   - 两个 Skill package directories、frontmatter `name`、ZH/EN definitions 与 package-internal self-references；
   - module metadata、`module-help.csv`、help/registry/manifest source entries 与 artifact contracts；
   - direct upstream/downstream activation、customization 与 orchestration references；
   - active docs、examples、hooks、scripts 与 tests 中两个旧 canonical IDs 的 exact matches；
   - active producer/consumer、config example 与 artifact contract 中旧 `ir-grill/` output-path exact matches。

   **And** 每个 bounded surface 必须使用新 canonical ID 或新 output root，或被明确分类为 compatibility、legacy documentation 或 regression fixture
   **And** 本 AC 不要求建立所有 `grill` / `grilling` 语义引用的逐条关系清单；该 broad inventory 只属于 Story 11.10。

7. **方案 A 提供显式旧 ID 兼容行为**

   **Given** existing install、配置或用户指令仍引用旧 Skill ID  
   **When** help、status、validate、update recognition 或 activation 处理旧 ID  
   **Then** canonical metadata 必须维护旧 ID 到新 ID 的 rename mapping  
   **And** 不得把旧 ID 当作无关的未知 Skill  
   **And** activation 必须重定向到新 canonical ID，或返回包含替代命令的稳定 deprecation diagnostic  
   **And** update write plan 必须显式展示 package rename/reprojection  
   **And** 用户修改过的旧 package 不得被静默覆盖或删除。

8. **旧 Readiness Artifacts 保持原位且可发现**

   **Given** existing install 已在旧 `ir-grill/` 或旧 readiness 路径生成 workflow artifacts  
   **When** 执行 install、update、repair 或历史 evidence discovery  
   **Then** artifacts 必须保持原位并可作为历史 evidence 被发现  
   **And** 不得自动迁移、重命名或删除这些 artifacts。

9. **Exact-old-ID / Exact-old-path Negative Scan 独立关闭 Rename Contract**

   **Given** canonical source 已完成更名与路径更新  
   **When** 对全部 canonical source packages 与 active canonical documentation 执行 exact-literal scan
   **Then** 必须覆盖 `speclite-ir-grill-consistency-reviewer`、`speclite-check-implementation-readiness` 与旧 `ir-grill/` output-path expressions
   **And** 每个 match 必须被修正，或明确分类为 compatibility mapping、legacy documentation 或 regression fixture
   **And** 旧 ID 与旧 path 不得继续出现在 active package identity、producer、consumer、activation、orchestrator、customization、help、registry、manifest、artifact contract、hook、script 或 user/maintainer guidance 中
   **And** 本 exact scan 与对应分类证据足以独立验收 Story 11.8，不得等待 Story 11.10 的 broad semantic inventory。

10. **Focused Tests 与 Fixtures 覆盖 Rename/Routing 契约**

    **Given** 本 Story 实现完成  
    **When** 执行 focused test suite  
   **Then** 至少覆盖 fresh install 仅投影新名称、frontmatter/package/help/registry 一致性、两个 Skills 的新输出目录、readiness check 报告 basename、old ID compatibility/deprecation、update plan rename 行为、用户修改旧 package 时的保护，以及 legacy `ir-grill/` evidence discovery
   **And** focused evidence 必须包含 bounded surface manifest、exact-old-ID / exact-old-path scan command、match classification 与 active negative assertions
   **And** 不得用 Story 11.10 的 future inventory 代替本 Story 的 completion evidence。

11. **Scope Boundary（范围边界）**

    本 Story 不改变 Implementation Readiness 的检查算法、评分规则和报告正文结构；不盘点与两个旧 canonical IDs 或旧 `ir-grill/` path 无关的泛化 grill semantics，不生成全 corpus grill relationship inventory。所有 broad grill semantic inventory 由 Story 11.10 在本 Story 完成后单独执行。

### Dependency Gate（依赖门禁）

- 必须以前置 Story 11.1–11.7、SPEC 04、SPEC 07 与 SPEC 09 为当前约束。
- 本 Story 必须以 bounded surface manifest、exact-literal negative scan 与 focused fixtures 独立完成；不得依赖 Story 11.9、Story 11.10 或未来人工确认才成立。

### Anchor Contract Map（锚点契约映射）

- **Contract**：FR23f、SPEC 04、SPEC 07、SPEC 09；active identity 与 `renamedFromCanonicalSkillIds` 由 SPEC 04 拥有，artifact root 与 compatibility/no-migration 由 SPEC 09 拥有。
- **Functional**：两个 canonical Skill packages、module/help/registry/manifest projections、activation/customization/orchestration references、readiness artifact routing 与 update rename/reprojection planning。
- **Evidence**：bounded surface manifest、exact-old-ID / exact-old-path scan、focused fixtures、legacy evidence discovery 与 modified-old-package protection。
- **Guidance**：Story 11.10 的 broad inventory 可以发现后续治理风险，但不得替代或延迟本 Story 的 completion evidence。

### Equivalent Implementation Policy（等价实现策略）

允许调整内部 registry、projection helper 或 package migration planner，但不得改变唯一 active canonical identity、rename mapping、fresh-only-new projection、new solutioning output root、legacy artifact no-migration、modified-old-package protection 与 bounded exact-scan completion gate。

### Evidence Plan（证据计划）

- 以 bounded surface manifest 证明本 Story 的同步范围是明确且封闭的。
- 以 exact-old-ID / exact-old-path scan 证明所有 active legacy identity/path expressions 已消除，允许项均有 compatibility/legacy/fixture 分类。
- 以 fresh/update/modified-old-package fixtures 证明 projection、rename plan 与 ownership protection。
- 以 legacy artifact discovery fixture 证明旧 readiness evidence 保持原位且可发现。
- 以独立 Story completion assertion 证明无需等待 Story 11.10 才能验收。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称功能已实现或已验证。

### Requirement Traceability（需求追踪）

- FR23f
- NFR14a
- NFR40f（Implementation Readiness rename/routing 部分）

## Story 11.9: Normalize Code Review Artifact Directories by Story ID（按 Story ID 统一 Code Review Artifact 目录）

作为执行 Epic Story Code Review 闭环的开发者和项目维护者，  
我希望同一 Story 的 reviewer、evaluator、fixer、tracker、finalizer 和 goal records 始终使用唯一的 Story-ID-only 目录，  
以便 CR artifacts 不再因 Story title 或 slug 的参与而分散到两个目录。

### Acceptance Criteria（验收标准）

1. **新 Code Review Run 使用唯一目录契约**

   **Given** 用户为 Story 启动新的 Code Review run  
   **When** orchestrator 解析 CR 目录  
   **Then** 唯一目录契约必须为 `{implementation_artifacts}/code-reviews/{story_id}-code-review/`。

2. **Story ID 使用纯编号规范化**

   **Given** Story 拥有规范编号  
   **When** 生成 `{story_id}`  
   **Then** 只能由 Story 的规范编号生成  
   **And** Story `11.9` 必须规范化为 `11-9-code-review/`。

3. **目录名不得包含 Story Title 或 Slug**

   **Given** Story 同时具有编号、标题、名称、slug 或带说明的文件名  
   **When** 生成 CR 目录名  
   **Then** 不得拼接 Story title、Story name、slug、文件名中编号以外的文本，或中文/英文标题片段。

4. **Orchestrator 单次解析并传递统一 `$cr_dir`**

   **Given** `speclite-goal-orchestrator-epic-story-code-review-runner` 编排 CR 闭环  
   **When** 调用 CR 01–06 Skills  
   **Then** orchestrator 必须只解析一次 canonical `$cr_dir`  
   **And** 将同一路径传递给 `speclite-code-review-01-reviewer`、`02-evaluator`、`03-fixer`、`04-rules-extractor`、`05-todo-tracker` 与 `06-finalizer`  
   **And** 下游 Skills 不得根据 Story 文件名或标题重新推导另一个目录。

5. **全部 CR Round Artifacts 使用同一目录**

   **Given** CR 闭环生成 review summary、evaluation report、fixer 更新记录、rules extraction artifacts、CR TODO ledger、finalization evidence、临时审查目录或其他 round artifacts  
   **When** 写入这些 artifacts  
   **Then** 必须全部位于同一个 canonical `$cr_dir`。

6. **Goal Execution Records 保持在 Canonical 子目录**

   **Given** orchestrator 维护目标执行记录  
   **When** 写入进度 artifacts  
   **Then** 必须使用 `{implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/`  
   **And** 继续包含既有的 `PLAN.md`、`EXPERIMENTS.md` 和 `EXPERIMENT_NOTES.md`。

7. **所有 Canonical CR References 同步审计和更新**

   **Given** CR 目录契约需要全链路统一  
   **When** 本 Story 实施完成  
   **Then** 必须审计并更新 orchestrator 的 `SKILL.md` 与 `SKILL.en.md`、CR 01–06 Skill 定义、共享 `cr-config.md`、review/evaluation templates、`module-help.csv`、module metadata、artifact contracts、scripts、hooks、fixtures、文档，以及所有 `$cr_dir`、`cr_dir_pattern` 和 progress record 表达。

8. **既有 Title-Bearing CR 目录不得被自动迁移**

   **Given** existing install 已存在 `{story_id}-{story_slug}-code-review/`  
   **When** 执行 install、update 或 repair  
   **Then** 不得自动迁移、重命名或删除该目录及其 artifacts。

9. **Legacy CR 兼容不得造成新旧目录分裂**

   **Given** legacy title-bearing CR 目录存在  
   **When** workflow 发现历史 evidence 或恢复未完成 CR  
   **Then** 历史 artifacts 可以作为只读 evidence 被发现  
   **And** legacy-only 未完成 CR 的恢复必须给出明确 compatibility diagnostic，并在一个目录内完成  
   **And** 不得把同一轮 artifacts 静默拆分到新旧两个目录  
   **And** canonical 与 legacy 目录同时存在且无法唯一判断当前轮次时，必须停止并报告稳定冲突诊断，不得猜测。

10. **Corpus 检查阻止 Active Title-Bearing Pattern**

    **Given** canonical source 已完成目录统一  
    **When** 执行 corpus/path consistency 检查  
    **Then** active canonical definitions 不得使用 `{story_id}-{story_slug}-code-review/`、`{story_id}-{story_name}-code-review/` 或同类 title-bearing pattern  
    **And** legacy fixtures 与明确标注的兼容文档可以作为受控例外。

11. **Focused Tests 与 Fixtures 覆盖 Canonical 和 Legacy 行为**

    **Given** 本 Story 实现完成  
    **When** 执行 focused test suite  
    **Then** 至少覆盖纯数字 Story ID 规范化、英文/中文/空格/标点标题均不影响目录名、orchestrator 与 CR 01–06 使用同一 `$cr_dir`、review/evaluation 同目录、`goal-execute-records/` 路径、legacy-only 恢复、canonical/legacy 双目录冲突，以及 Story title 含路径分隔符或 traversal 文本时不能影响目录边界。

12. **Scope Boundary（范围边界）**

    本 Story 不修改 review/evaluation 文件 basename、CR 算法、round 编号或 CR 审批规则。

### Requirement Traceability（需求追踪）

- FR23g
- NFR14a
- NFR40f（Code Review 目录部分）

## Story 11.10: Inventory All Grill-Related Skill References for Human Confirmation（盘点全部 Grill 相关 Skill 引用供人工确认）

作为 SpecLite canonical source 的维护者，  
我希望获得所有 grill-related Skill 定义及引用表达的完整、逐条、可定位清单，  
以便在进行任何额外治理或语义调整前，可以先确认当前引用关系和真实影响范围。

### Acceptance Criteria（验收标准）

1. **覆盖全部 Canonical Skill Packages 与关联入口**

   **Given** `assets/source/speclite/` 是 canonical source root  
   **When** 执行 grill reference inventory  
   **Then** 必须覆盖全部 Skill packages，而不只是名称中包含 `grill` 的目录  
   **And** 扫描 `SKILL.md`、`SKILL.en.md`、workflow steps、references、templates/assets 中的指令表达、scripts/hooks、module metadata、`module-help.csv`、canonical help/registry/artifact contracts 与 active canonical documentation。

2. **搜索词覆盖全部 Grill 变体**

   **Given** grill 表达可能使用不同大小写、词形、Skill ID 或路径  
   **When** 执行大小写不敏感搜索  
   **Then** 至少覆盖 `grill`、`grilling`、`ir-grill`、`grill-consistency`、`implementation-readiness-grill`，以及扫描过程中实际发现的所有 grill-related Skill ID 与 path expression。

3. **每项引用提供逐条可定位证据**

   **Given** 扫描命中 grill-related 表达  
   **When** 写入 inventory  
   **Then** 每项必须列出 owning Skill/package、source file、精确行号、language（ZH/EN/shared）、reference type、原始 literal expression、被引用的 Skill/workflow/artifact path、active/compatibility/legacy/fixture 分类、是否受 Story 11.8 影响，以及建议保持、修正或等待确认  
   **And** 不得只提供命中文件列表或无法回查的摘要。

4. **Reference Type 使用明确分类**

   **Given** 不同 grill 表达承担不同契约角色  
   **When** 分类 inventory 条目  
   **Then** 至少区分 Skill frontmatter/name、trigger/description、caller → callee invocation、workflow prerequisite、output directory、report filename、help/discovery entry、compatibility rename mapping、prose/example，以及 legacy/regression evidence。

5. **生成 Grill 调用与消费关系摘要**

   **Given** inventory 已收集全部条目  
   **When** 生成关系摘要  
   **Then** 必须明确哪些 Skills 自身是 grill Skills、哪些 Skills 调用 grill Skills、哪些 Skills 只读取 grill artifacts、哪些表达仅为 historical/compatibility/test reference，以及每项引用所属 SDLC stage 与 artifact root。

6. **中文与英文定义分别列出并校验 Parity**

   **Given** canonical Skill 可能同时提供中文和英文定义  
   **When** 建立 inventory  
   **Then** ZH 与 EN 引用必须分别列出并执行 parity check  
   **And** 不得因语义近似而合并成无法定位的单一条目。

7. **以 Story 11.8 独立完成后的 Current State 为基准**

   **Given** Story 11.8 已完成 Skill rename 和 routing 变更  
   **When** 执行最终 inventory  
   **Then** 报告必须反映 canonical current state  
   **And** 必须单独保留旧 ID 和旧 `ir-grill/` compatibility expressions 清单
   **And** 本 inventory 不得被定义为 Story 11.8 的后置 completion gate。

8. **Inventory 写入可审计 Story Artifact**

   **Given** Story 11.10 生成盘点结果  
   **When** 保存报告  
   **Then** 必须写入 Story 11.10 implementation artifact 的独立 `Grill Reference Inventory（Grill 引用清单）` 章节  
   **And** Epic 11 runner 最终交付必须提供该 Story 文件的可点击路径。

9. **记录可复现扫描元数据与计数**

   **Given** inventory 需要可复核  
   **When** 完成扫描  
   **Then** 报告必须记录扫描命令、扫描范围、当前 Git commit/tree identity、排除项及理由、总匹配数、去重后引用数与各分类计数。

10. **Completeness Check 逐项覆盖机器扫描结果**

    **Given** 机器扫描已产生 canonical matches  
    **When** 校验 inventory 完整性  
   **Then** 每一条 match 必须对应到报告条目
   **And** 任何未分类或遗漏的 match 都必须使 Story 失败
   **And** 不得用抽样结果宣称完整
   **And** inventory completion 表示机器 match 已 100% match-to-entry，不表示所有 grill references 都应删除、已修正或已获用户批准。

11. **Read-Only Audit Boundary（只读审计边界）**

    **Given** 本 Story 的目标是先列出引用供用户确认  
    **When** 执行 inventory  
    **Then** 除 Story implementation artifact、runner records 与必要 tracking status 外，不得修改被盘点的 canonical Skill definitions  
    **And** 不得根据盘点结果擅自更名、删除或重写其他 grill references  
    **And** 进一步调整必须等待用户确认，并评估为新 Story 或 Story change。

12. **最终交付显式请求人工确认**

    **Given** inventory 已完成  
    **When** 向用户交付 Story 11.10 结果  
   **Then** 必须先展示清单摘要和高风险/歧义项，再明确请求用户确认
   **And** 不得把“已列出”解释为用户已经批准后续修改。

13. **Story 11.8 Contract Regression 与其他治理建议分离**

   **Given** broad inventory 发现 active exact-old-ID 或 active old `ir-grill/` output-path expression
   **When** 对 match 分类
   **Then** 必须将其标记为 Story 11.8 contract regression，并在高风险摘要中单独呈现
   **And** 其他 generic grill semantic、relationship 或 parity 风险必须分类为等待人工确认的后续治理候选
   **And** 两类 finding 均不得在本 Story 中自动修改 canonical definitions 或回写 Story 11.8。

### Dependency Gate（依赖门禁）

- 必须以前置 Story 11.1–11.9 的 current state 为 baseline，尤其消费 Story 11.8 已完成的新 canonical IDs、新 output root、rename mapping 与 bounded exact-scan evidence。
- 本 Story 的完成条件是 broad inventory 对机器扫描结果 100% match-to-entry、分类完整、关系摘要完整并已请求人工确认；不得依赖未来治理 Story。

### Anchor Contract Map（锚点契约映射）

- **Contract**：FR66a、Story 11.8 bounded rename/routing contract、canonical source root 与 Story 11.10 read-only audit boundary。
- **Functional**：case-insensitive broad grill scanner、match classifier、ZH/EN parity mapper、caller/callee/artifact-consumer relationship summary 与 auditable report writer。
- **Evidence**：扫描命令与 scope、Git tree identity、raw match count、deduplicated entries、match-to-entry completeness、classification counts 与 human-confirmation handoff。
- **Guidance**：Story 11.8 exact literals 是 regression classification boundary；其他 grill semantics 是后续治理候选，不自动扩大本 Story 写入范围。

### Equivalent Implementation Policy（等价实现策略）

允许调整 scanner、deduplication 或 report generator 的内部实现，但不得降低 canonical corpus coverage、逐项定位、ZH/EN parity、match-to-entry completeness、read-only boundary、regression classification 与 human-confirmation gate。

### Evidence Plan（证据计划）

- 以可复现 broad scan 与 raw output identity 证明搜索范围完整。
- 以一对一 match-to-entry reconciliation 证明没有遗漏或未分类 match。
- 以 relationship summary 与 ZH/EN parity section 证明语义关系没有被压缩为不可定位摘要。
- 以 filesystem/canonical source diff 证明本 Story 除允许的 audit artifacts 与 tracking 外保持 read-only。
- 以 final handoff 证明高风险、Story 11.8 regression 与后续治理候选已分离并请求人工确认。

### Anchor Evidence Summary（锚点证据摘要）

本节由 Story implementation 与 review 阶段填写；当前仅定义所需证据，不预先宣称 inventory 已完成或用户已确认。

### Requirement Traceability（需求追踪）

- FR66a
- NFR14a
- NFR40f（Grill reference inventory evidence）
