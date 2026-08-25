# Epic 11: Phase-Aligned Workflow Artifact Governance（阶段对齐的 Workflow Artifact 治理）

目标项目维护者与 AI IDE 使用者可以获得与 SpecLite SDLC 阶段顺序一致、可预测、可审计的 workflow artifact 文件体系：fresh install 预创建完整阶段 roots，canonical Skills 将产物写入唯一约定位置，existing installs 继续尊重既有配置与 workflow-owned artifacts，不发生静默迁移。

**覆盖 FR / NFR / UX：** FR13a, FR23b, FR23c, FR23d, FR23e, FR23f, FR23g, FR66a, NFR14a, NFR40f, UX Filesystem Space Map, UX Artifact Evidence Card

## Dependency / Sequencing（依赖与顺序）

Epic 11 按 Story 11.1 → 11.10 strict serial 执行。每个 Story 只能消费更早 Story 已建立的 contract/evidence，不得依赖未来 Story 才能成立：

- Story 11.1 建立 executable root-resolution contract。
- Story 11.2 投影 fresh-install config、directories、manifest/index 与 evidence。
- Story 11.3 建立 existing-install compatibility、no-silent-migration 与 mismatch diagnostics。
- Story 11.4–11.10 依次消费上述基础；Story 11.10 的 grill inventory 在 Story 11.8 readiness rename/routing 完成后执行。

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

## Story 11.5: Organize Planning Documents as Whole and Sharded Artifacts（组织 Planning 文档的整篇与分片产物）

作为使用 SpecLite 的产品、架构和项目维护人员，  
我希望 PRD、Epics 和 Architecture 文档分别进入 `{planning_artifacts}` 下的专属目录，  
以便完整文档与执行 `shard-doc` 后的分片文档可以被稳定创建、发现和消费。

### Acceptance Criteria（验收标准）

1. **安装时预创建 Planning 子目录**

   **Given** 目标项目执行 fresh install  
   **When** runtime structure creation 执行  
   **Then** 必须预创建：

   - `{planning_artifacts}/epics/`
   - `{planning_artifacts}/prd/`
   - `{planning_artifacts}/architecture/`

2. **Planning Creation Workflows 使用专属完整文档路径**

   **Given** 用户运行对应的 PRD、Epics 或 Architecture creation workflow  
   **When** workflow 创建完整文档  
   **Then** 默认输出路径必须分别为：

   - `{planning_artifacts}/epics/epics.md`
   - `{planning_artifacts}/prd/prd.md`
   - `{planning_artifacts}/architecture/architecture.md`

3. **Shard 输出保留在对应 subject directory**

   **Given** 用户对上述完整文档执行 `speclite-shard-doc`  
   **When** workflow 生成 sharded documents  
   **Then** 分片必须继续位于对应的 `epics/`、`prd/` 或 `architecture/` subject directory  
   **And** 必须保留现有 `index.md` 与 shard 文件命名契约  
   **And** 不得额外引入未经要求的 `shards/` 层级  
   **And** 完整文档与分片文档必须可以共存，不得静默覆盖彼此。

4. **Consumers 支持新 Whole/Sharded 位置**

   **Given** downstream Skill 需要读取 PRD、Epics 或 Architecture  
   **When** 执行 planning document discovery  
   **Then** 必须支持新完整文档位置、新 subject directory 中的 sharded `index.md`，以及 subject directory 中的 shard documents。

5. **Whole/Sharded 共存时使用确定性发现规则**

   **Given** 完整文档和 sharded documents 同时存在  
   **When** downstream workflow 选择输入  
   **Then** 必须使用 canonical workflow 已定义的 whole/sharded discovery precedence  
   **And** 必须记录实际消费的 artifact path  
   **And** 不得无提示地混合两个版本。

6. **Canonical Source 与相关引用同步更新**

   **Given** Planning 输出与发现路径发生变化  
   **When** 本 Story 实施完成  
   **Then** 必须同步更新所有相关 `SKILL.md`、`SKILL.en.md`、workflow steps/references、`module-help.csv`、module metadata、artifact contracts、config examples、planning/readiness 输入发现规则与路径治理文档  
   **And** 不得遗留与新契约冲突的旧默认路径声明。

7. **旧 Planning 文档保持可发现且不迁移**

   **Given** existing install 的 whole/sharded planning documents 位于旧路径  
   **When** 执行 install、update、repair 或 downstream discovery  
   **Then** 旧文档必须保持可发现  
   **And** 不得自动迁移、移动、复制、重命名或删除这些文档。

8. **Corpus 与路径一致性检查排除旧生产者默认值**

   **Given** canonical source 已完成路径更新  
   **When** 执行 corpus/path consistency 检查  
   **Then** 受影响的 producers 不得继续把新 PRD、Epics 或 Architecture 完整文档默认输出到 `{planning_artifacts}` 根目录。

9. **Focused Tests 与 Fixtures 覆盖 Whole/Sharded 路由**

   **Given** 本 Story 实现完成  
   **When** 执行 focused test suite  
   **Then** 至少覆盖 fresh install 子目录创建、三类完整文档的新路径、`shard-doc` 输出与 `index.md`、whole-only、sharded-only、whole-and-sharded coexistence、legacy planning paths 的发现，以及 artifact provenance 和实际消费路径。

10. **Scope Boundary（范围边界）**

    本 Story 只处理 PRD、Epics 和 Architecture；UX artifacts 由 Story 11.6 单独处理。

### Requirement Traceability（需求追踪）

- FR23c
- NFR14a
- NFR40f（Planning whole/sharded 部分）

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

8. **重复运行遵循既有冲突策略**

   **Given** 同一天已存在目标 basename 的报告  
   **When** 用户再次运行 workflow  
   **Then** 必须沿用当前 workflow 的显式冲突处理策略  
   **And** 不得因文件名统一而引入静默覆盖。

9. **Focused Tests 与 Fixtures 覆盖命名契约**

   **Given** 本 Story 实现完成  
   **When** 执行 focused test suite  
   **Then** 至少覆盖精确 basename、日期格式及零填充、`{planning_artifacts}/prd/` 默认路径、canonical metadata/help/example 一致性、legacy report discovery，以及同日重复运行的冲突行为。

10. **Scope Boundary（范围边界）**

    本 Story 不修改 PRD validation 的检查规则、评分逻辑或报告正文结构，也不处理 Implementation Readiness 文件名。

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

6. **所有 Canonical References 同步更新**

   **Given** Skill 标识与输出路径发生变化  
   **When** 本 Story 实施完成  
   **Then** 必须同步更新相关 `SKILL.md`、`SKILL.en.md`、workflow steps/references/templates、upstream/downstream orchestration、`module-help.csv`、module metadata、artifact contracts、help/registry/manifest 数据、config examples、hooks、scripts、tests，以及面向用户和维护者的文档。

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

9. **Canonical Corpus 排除 Active 旧名称与旧路径**

   **Given** canonical source 已完成更名与路径更新  
   **When** 执行 corpus consistency 检查  
   **Then** 旧 Skill 名称和 `ir-grill/` 仅允许存在于明确标注的 compatibility mapping、migration documentation 或 regression fixtures  
   **And** 不得继续出现在 active producer、orchestrator 或 help 声明中。

10. **Focused Tests 与 Fixtures 覆盖 Rename/Routing 契约**

    **Given** 本 Story 实现完成  
    **When** 执行 focused test suite  
    **Then** 至少覆盖 fresh install 仅投影新名称、frontmatter/package/help/registry 一致性、两个 Skills 的新输出目录、readiness check 报告 basename、old ID compatibility/deprecation、update plan rename 行为、用户修改旧 package 时的保护，以及 legacy `ir-grill/` evidence discovery。

11. **Scope Boundary（范围边界）**

    本 Story 不改变 Implementation Readiness 的检查算法、评分规则和报告正文结构；所有 grill 引用的全量盘点由 Story 11.10 单独处理。

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

7. **以 Story 11.8 实施后的 Current State 为基准**

   **Given** Story 11.8 已完成 Skill rename 和 routing 变更  
   **When** 执行最终 inventory  
   **Then** 报告必须反映 canonical current state  
   **And** 必须单独保留旧 ID 和旧 `ir-grill/` compatibility expressions 清单。

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
    **And** 不得用抽样结果宣称完整。

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

### Requirement Traceability（需求追踪）

- FR66a
- NFR14a
- NFR40f（Grill reference inventory evidence）
