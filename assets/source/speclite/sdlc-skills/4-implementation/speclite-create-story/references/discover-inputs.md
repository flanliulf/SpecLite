# 输入发现协议（Discover Inputs Protocol）

**目标：** 根据本 Skill 的 Input Files 配置，智能加载项目文件（整文件或分片）。

**前置：** 仅当工作流定义了 Input Files 时执行；如无配置则跳过。

---

## Step 1：解析输入模式

- 读取 Input Files 表，对每个输入组（prd / architecture / epics / ux 等）记录其 **load strategy**

## Step 2：按策略加载

对每个模式按以下子步骤顺序处理：

### 2a：优先尝试分片文档

若该输入存在分片模式，按其加载策略（缺省为 **FULL_LOAD**）执行：

#### FULL_LOAD 策略

适用于 PRD / Architecture / UX / brownfield 文档等需要全貌的场景。

1. 用 glob 找到所有 `.md` 文件（如 `{planning_artifacts}/*architecture*/*.md`）
2. 完整加载每个文件
3. 按"`index.md` 优先，其次字母序"拼接
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

### 2b：分片未命中则尝试整文件

1. 对 "whole" 模式做 glob 匹配（如 `{planning_artifacts}/*prd*.md`）
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
