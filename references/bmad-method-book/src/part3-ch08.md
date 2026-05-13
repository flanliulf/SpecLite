# 第八章：为什么选择 CSV 而非数据库

> "skill-manifest.csv, files-manifest.csv, bmad-help.csv"
>
> — _bmad/_config/ 目录下的三个核心清单文件

---

## 一个反直觉的选择

在 `_bmad/_config/` 目录下，有三个 CSV 文件：

- `skill-manifest.csv` — 技能索引（42 个 Skills）
- `files-manifest.csv` — 文件完整性跟踪（1000+ 文件）
- `bmad-help.csv` — 帮助目录（13 列 schema）

这是一个反直觉的设计选择。2026 年，当大多数项目使用 SQLite、PostgreSQL 或 MongoDB 时，BMAD-METHOD 选择了 CSV——一个诞生于 1972 年的古老格式。

为什么？

## 问题定义：索引的本质需求

安装器需要回答三类查询：

1. **技能查询**："这个项目安装了哪些 Skills？"
2. **文件完整性**："哪些文件被用户修改了？"
3. **帮助导航**："用户当前应该执行哪个工作流？"

这些查询有三个共同特点：

- **数据量小**：技能数 <500，文件数 <5000
- **查询简单**：主要是线性扫描和简单过滤
- **更新频率低**：只在安装/更新时写入

在这些约束下，数据库的优势（索引、JOIN、事务）都用不上。

## 约束分析

| 约束 | 影响 |
|------|------|
| **零依赖** | 不能依赖 SQLite、PostgreSQL 等外部服务 |
| **人类可读** | 用户需要能直接查看和编辑 |
| **Git 友好** | diff 必须清晰，冲突易解决 |
| **跨语言** | Node.js 和 Python 都需要能解析 |
| **简单透明** | 用户应该能理解存储格式 |

在这些约束下：

- ❌ SQLite：需要二进制文件，diff 不可读
- ❌ JSON：嵌套结构，diff 充斥括号和缩进
- ❌ YAML：解析慢，大文件性能差
- ✅ **CSV**：纯文本，diff 清晰，任何语言都能解析

## 源码实现：CSV 的读写

### 写入：生成清单

在 `tools/installer/core/manifest-generator.js` 第 29-32 行：

```javascript
cleanForCSV(text) {
  // 标准化所有空白字符为单个空格
  return text.trim().replaceAll(/\s+/g, ' ');
}
```

在第 186-234 行，生成 `skill-manifest.csv`：

```javascript
async writeSkillManifest(bmadDir) {
  const csvPath = path.join(bmadDir, '_config', 'skill-manifest.csv');
  const header = 'name,description,module,path,canonicalId\n';
  
  const rows = this.skills.map(skill => {
    const name = this.escapeCSVField(skill.name);
    const desc = this.escapeCSVField(this.cleanForCSV(skill.description));
    const module = skill.module;
    const path = skill.path;
    const id = skill.canonicalId;
    
    return `${name},${desc},${module},${path},${id}`;
  });
  
  await fs.writeFile(csvPath, header + rows.join('\n'));
}
```

**关键设计**：
- 手动拼接 CSV（不依赖第三方库）
- 字段清洗（`cleanForCSV`）：将多行文本压缩为单行
- 字段转义（`escapeCSVField`）：处理逗号、引号、换行符

### 读取：解析清单

在 `tools/installer/ide/shared/installed-skills.js` 第 14-32 行：

```javascript
async function getInstalledCanonicalIds(bmadDir) {
  const csvPath = path.join(bmadDir, '_config', 'skill-manifest.csv');
  const content = await fs.readFile(csvPath, 'utf8');
  
  const records = csv.parse(content, { 
    columns: true,           // 第一行作为列名
    skip_empty_lines: true   // 跳过空行
  });
  
  return new Set(records.map(r => r.canonicalId));
}
```

**关键设计**：
- 使用 `csv-parse` 库（唯一的 CSV 依赖）
- `columns: true`：自动将第一行映射为对象键
- 返回 `Set`：去重，O(1) 查找

## 验证与证据

### 证据 1：性能足够

**实测数据**（基于 42 个 Skills）：

```bash
$ time node -e "require('csv-parse/sync').parse(require('fs').readFileSync('skill-manifest.csv', 'utf8'), {columns: true})"

real    0m0.045s
user    0m0.032s
sys     0m0.012s
```

**45 毫秒**解析 42 行 CSV。

**推算**：
- 500 个 Skills：~500ms
- 5000 个 Skills：~5s（开始成为瓶颈）

**结论**：对于当前规模（<500 Skills），CSV 性能足够。

### 证据 2：Git diff 清晰

```bash
$ git diff _bmad/_config/skill-manifest.csv
```

```diff
+ "Create Epic","Generate Epic specification","bmm","bmm/2-plan-workflows/create-epic/SKILL.md","create-epic"
- "Create Story","Generate Story specification","bmm","bmm/2-plan-workflows/create-story/SKILL.md","create-story"
```

每行变更都有明确含义，冲突易解决。

**对比 JSON**：

```diff
   {
-    "name": "Create Story",
+    "name": "Create Epic",
-    "canonicalId": "create-story"
+    "canonicalId": "create-epic"
   }
```

JSON 的 diff 包含大量结构性噪音（括号、缩进）。

### 证据 3：人类可读

打开 `skill-manifest.csv`：

```csv
name,description,module,path,canonicalId
"BMad Help","Get guidance on what to do next","core","core/bmad-help/SKILL.md","bmad-help"
"Create PRD","Generate Product Requirements Document","bmm","bmm/1-analysis/create-prd/SKILL.md","create-prd"
```

用户可以直接用 Excel、Google Sheets 或文本编辑器查看和编辑。

## 诚实陈述：CSV 的局限

### 局限 1：无索引

CSV 是线性扫描，O(n) 复杂度。

**实际影响**：
- 42 个 Skills：45ms（可接受）
- 5000 个 Skills：5s（开始成为瓶颈）

**缓解措施**：
- 当前规模下无需优化
- 未来可考虑 SQLite（但会牺牲人类可读性）

### 局限 2：无关系查询

CSV 无法执行 JOIN、GROUP BY 等复杂查询。

**实际影响**：
- 当前查询都是简单过滤（"找到所有 bmm 模块的 Skills"）
- 如果需要复杂查询（"找到所有依赖 X 的 Skills"），CSV 无法胜任

**实际做法**：
- 在代码中手动实现关联逻辑
- 例如：先读取 `skill-manifest.csv`，再读取每个 Skill 的 `SKILL.md`

### 局限 3：并发写入风险

多进程同时写入 CSV 可能导致文件损坏。

**实际影响**：
- 安装器是单进程运行，无并发写入
- 用户手动编辑 CSV 时可能与安装器冲突

**缓解措施**：
- 文档警告用户不要在安装过程中编辑 CSV
- 使用文件锁（未实现）

## 替代方案对比

| 方案 | 查询性能 | 人类可读 | Git 友好 | 零依赖 | 复杂查询 |
|------|---------|---------|---------|--------|---------|
| **CSV** | O(n) | ✅ | ✅ | ✅ | ❌ |
| **SQLite** | O(log n) | ❌ | ❌ | ❌ | ✅ |
| **JSON** | O(n) | ⚠️ | ⚠️ | ✅ | ❌ |
| **YAML** | O(n) | ✅ | ✅ | ✅ | ❌ |

**BMAD-METHOD 的选择**：CSV（简单透明优于复杂高效）

## 设计原则提炼

从 CSV 选择中，可以提炼出一个核心原则：

> **为当前规模优化，而非为未来规模过度设计**

当技能数 <500 时，CSV 的简单性远超其性能劣势。如果未来技能数 >5000，再迁移到 SQLite 也不迟。

**过早优化的代价**：
- SQLite 增加依赖（需要 native 模块）
- 二进制文件不可读（用户无法直接查看）
- Git diff 不友好（二进制 diff）

**延迟优化的收益**：
- 保持简单透明
- 降低学习曲线
- 减少依赖和复杂度

---

*下一章，我们将分析文件系统作为存储层的设计哲学——为什么不用数据库？*
