# 输入发现协议（Discover Inputs Protocol）

**目标：** 根据本 Skill 的 Input Files 配置，智能加载项目文件（整文件或分片）。

**前置：** 仅当工作流定义了 Input Files 时执行；如无配置则跳过。

---

## Step 1：解析输入模式

- 读取 Input Files 表，对每个输入组（prd / architecture / epics / ux 等）记录其 **load strategy**
- 对 `prd`、`architecture`、`epics`，在任何 Story/progress write 前分别运行 `speclite resolve artifact-documents --subject <subject> --project-root {project-root}`，且只把 JSON `consumedPaths` 交给下述 load strategy。记录完整 resolver evidence；ambiguity 时向用户请求当前 invocation selection（`"whole"` 或 `"sharded"`）并以 `--selection whole|sharded` 重跑。任何 `continuation=block` 必须 HALT，保持 zero artifact write 与 zero progress mutation，不得自行定义 whole/sharded precedence。
- 对 `ux`，运行 `speclite resolve artifact-roots --project-root {project-root}` 并记录 Planning root 的 `resolvedRoot`、`resolutionMode`。先检查 `{planning_artifacts}/ux/ux-design-specification.md`，仅在其缺失时检查 exact legacy `{planning_artifacts}/ux-design-specification.md`；canonical 与 legacy 同时存在时 canonical 胜出。把所选 project-relative path 记录为 `actualConsumedPath`，legacy 只原位读取，不得迁移、复制、重命名、删除或改写 config。相关 HTML、design-system、screenshot 与 asset references 必须相对所选 UX directory 解析并拒绝 project-root escape。

## Step 2：按策略加载

对每个模式按以下子步骤顺序处理：

### 2a：加载 resolver 选定的文档 shape

若该输入存在分片模式，按其加载策略（缺省为 **FULL_LOAD**）执行：

#### FULL_LOAD 策略

适用于 PRD / Architecture / UX / brownfield 文档等需要全貌的场景。

1. 对 PRD / Architecture 使用 shared document resolver 返回的 `consumedPaths`；对 UX 使用上述 resolver-backed `actualConsumedPath`，不得 glob 混入其它文件
2. 按 resolver 顺序完整加载每个文件（`index.md` 在前）
3. 不得另行排序或混合 whole/sharded shapes
4. 存入变量 `{pattern_name_content}`（如 `{architecture_content}`）

#### SELECTIVE_LOAD 策略

按模板变量加载特定分片。例如 epics 用 `{{epic_num}}`：

1. 检查分片模式中的模板变量
2. 若变量未定义，向用户询问或从上下文推断
3. 解析为具体路径
4. 加载该文件
5. 存入 `{pattern_name_content}`

#### INDEX_GUIDED 策略

加载 `index.md`，分析每个文档的描述与结构，再智能加载相关文档。

**不要偷懒**——只要相关概率 ≥ 5% 都加载。

1. 加载 `index.md`
2. 解析目录、链接与节标题
3. 结合工作流目标判断相关性
4. 加载所有可能相关的文档
5. 存入 `{pattern_name_content}`

**拿不准就加载**——上下文比节省 token 更重要。

---

执行完匹配策略后，将该模式标记为 **RESOLVED**，处理下一个。

### 2b：非 PRD/Epics/Architecture 输入的 legacy pattern fallback

1. 仅对不受上述 governed discovery 管理的输入执行既有 whole glob；PRD/Epics/Architecture/UX 禁止回退 glob
2. 命中则全部完整加载（不要 offset/limit）
3. 存入 `{pattern_name_content}`
4. 标记 **RESOLVED**

### 2c：仍未命中

1. 将 `{pattern_name_content}` 设为空字符串
2. 在会话中记一笔："No {pattern_name} files found"，并向用户提供补传机会

## Step 3：报告发现结果

列出所有已加载的内容变量与文件数。例如：

```text
OK Loaded {prd_content} from 5 sharded files: prd/index.md, prd/requirements.md, ...
OK Loaded {architecture_content} from 1 file: Architecture.md
OK Loaded {epics_content} from selective load: epics/epic-3.md
-- No ux_design files found
```
