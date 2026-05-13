# 附录 C：技术栈清单

本附录列出 BMAD-METHOD 使用的完整技术栈，方便贡献者快速上手。

---

## 1. 核心运行时

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | >= 18.x | 运行 CLI 安装器 |
| **Python** | >= 3.8 | 配置解析脚本 |
| **Git** | >= 2.x | 模块分发 |

**为什么这些**：
- Node.js：跨平台，npm 生态
- Python：脚本灵活，TOML 解析好
- Git：开发者标配

---

## 2. 数据格式

| 格式 | 用途 | 文件示例 |
|------|------|---------|
| **Markdown** | Skills、文档 | `SKILL.md` |
| **YAML** | 模块元数据、平台配置 | `module.yaml`, `platform-codes.yaml` |
| **TOML** | 用户配置 | `config.toml` |
| **CSV** | 清单文件 | `skill-manifest.csv` |
| **JSON** | 内部数据交换 | 缓存文件 |

**选型理由**：

**为什么不全用 JSON？**
- JSON 不支持注释（用户配置不友好）
- TOML 更适合人工编辑

**为什么用 CSV 而非数据库？**
- 见第八章详细分析
- Git 友好、人类可读

**为什么 Markdown 而非 JSON 配置？**
- LLM 友好（Markdown 是训练主流）
- 人类友好（直接阅读）

---

## 3. CLI 工具栈

### Node.js 依赖

**核心库**：

```json
{
  "commander": "^11.x",      // CLI 框架
  "inquirer": "^9.x",        // 交互式提示
  "chalk": "^5.x",           // 终端颜色
  "ora": "^7.x",             // 加载动画
  "fs-extra": "^11.x",       // 文件操作增强
  "js-yaml": "^4.x",         // YAML 解析
  "@iarna/toml": "^2.x",     // TOML 解析
  "csv-parse": "^5.x",       // CSV 解析
  "csv-stringify": "^6.x",   // CSV 生成
  "semver": "^7.x",          // 语义化版本
  "execa": "^8.x"            // 子进程执行
}
```

**开发依赖**：

```json
{
  "jest": "^29.x",           // 测试框架
  "eslint": "^8.x",          // 代码规范
  "prettier": "^3.x"         // 格式化
}
```

### Python 依赖

**核心库**：

```python
# 标准库（无外部依赖）
- tomllib (Python 3.11+) 或 tomli
- pathlib
- json
- re

# 可选
- pyyaml  # YAML 解析（如需）
```

**为什么最小化依赖**？
- 用户环境可能受限
- 减少安装失败风险
- Python 标准库足够

---

## 4. 文件结构标准

### 项目根目录

```
bmad-method/
├── src/                     # 源码（Skills、Agents）
│   ├── core-skills/
│   ├── bmm-skills/
│   ├── tea-skills/
│   ├── bmb-skills/
│   └── cis-skills/
├── tools/                   # 工具
│   ├── installer/           # CLI 安装器
│   └── validators/          # 验证工具
├── docs/                    # 文档
│   ├── tutorials/
│   ├── how-to/
│   ├── reference/
│   └── explanation/
├── tests/                   # 测试
├── package.json             # Node.js 配置
├── pyproject.toml           # Python 配置（如有）
├── README.md
├── CHANGELOG.md
└── LICENSE                  # MIT
```

### 用户项目目录（安装后）

```
user-project/
├── _bmad/                   # BMAD 安装
│   ├── _config/             # 清单
│   ├── core/                # core 模块
│   ├── bmm/                 # bmm 模块
│   ├── custom/              # 用户自定义
│   ├── config.toml          # installer 配置
│   ├── config.user.toml     # 用户配置
│   └── memory/              # 运行时状态
├── .claude/skills/          # Claude Code 适配
├── .agents/skills/          # Cursor/Copilot 适配
└── _bmad-output/            # 工作产物
    ├── planning/
    ├── architecture/
    └── implementation/
```

---

## 5. 平台集成

### Claude Code

**集成方式**：
- 文件复制到 `.claude/skills/`
- 文件格式：`SKILL.md` 原样

**API**：
- `/skill-name` 调用
- 支持 subagents

### Cursor

**集成方式**：
- 文件复制到 `.agents/skills/`
- 文件格式：`SKILL.md` 原样

**API**：
- `@skill-name` 调用

### GitHub Copilot

**集成方式**：
- Skills 复制到 `.agents/skills/`
- Agents 转换为 `.agent.md`，放到 `.github/agents/`

**API**：
- `@agent-name` 调用

### 其他 40+ 平台

详见第七章和第十八章。

---

## 6. 开发工具

### 推荐 IDE

| IDE | 适用场景 |
|-----|---------|
| **VS Code** | 通用开发 |
| **Claude Code** | AI 协作开发 |
| **Cursor** | AI 加速编辑 |

### 推荐插件（VS Code）

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",      // 格式化
    "dbaeumer.vscode-eslint",      // Linting
    "redhat.vscode-yaml",          // YAML
    "tamasfe.even-better-toml",    // TOML
    "yzhang.markdown-all-in-one"   // Markdown
  ]
}
```

---

## 7. 测试栈

### 单元测试

**框架**：Jest

**示例**：

```javascript
describe('ConfigResolver', () => {
  test('merges four layers correctly', async () => {
    const result = await resolveConfig('/path/to/project');
    expect(result.core.communication_language).toBe('zh-cn');
  });
});
```

### 集成测试

**方式**：
- 模拟项目目录
- 完整安装流程
- 验证文件结构

### E2E 测试

**方式**：
- 真实 CLI 调用
- 验证用户场景

---

## 8. CI/CD

### GitHub Actions

**典型流程**：

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
      - run: npm run lint
```

**关键检查**：
- 跨平台测试（Linux/macOS/Windows）
- 多版本 Node.js
- Lint 规范
- 测试覆盖率

---

## 9. 发布流程

### 版本号

**遵循**：[Semantic Versioning](https://semver.org/)

```
6.0.0
│ │ └─ Patch（bug 修复）
│ └─── Minor（新功能，向后兼容）
└───── Major（破坏性变更）
```

### 发布步骤

```bash
# 1. 更新 CHANGELOG
# 2. 更新版本号
npm version major|minor|patch

# 3. 推送 tag
git push --tags

# 4. 发布到 npm
npm publish

# 5. 创建 GitHub Release
gh release create v6.0.0 --notes-file CHANGELOG.md
```

---

## 10. 文档系统

### 文档结构（Diátaxis）

```
docs/
├── tutorials/           # 学习导向（新手）
├── how-to/              # 任务导向（操作）
├── reference/           # 信息导向（查询）
└── explanation/         # 理解导向（深入）
```

**Diátaxis 框架**：
- 四类文档，明确分工
- 避免混合（教程 vs 参考）

### 工具

| 工具 | 用途 |
|------|------|
| **Markdown** | 编写格式 |
| **GitBook** | 在线浏览 |
| **MkDocs** | 静态站生成（备选） |

---

## 11. 安全考虑

### 依赖审计

```bash
npm audit
npm audit fix
```

**频率**：每月一次

### 输入验证

**所有用户输入**：
- 路径验证（防止路径遍历）
- 命令注入防护
- 配置 schema 验证

### 哈希校验

**外部模块**：
- 下载后校验哈希
- 防止中间人攻击

---

## 12. 性能考虑

### 启动时间

**目标**：< 2 秒（CLI 启动）

**手段**：
- 懒加载模块
- 减少同步 I/O
- 缓存解析结果

### 内存使用

**目标**：< 200 MB（典型操作）

**手段**：
- 流式处理大文件
- 避免全量加载

---

## 13. 国际化

### 当前支持

**界面**：
- 英文（默认）
- 中文（部分）

**配置**：
```toml
[core]
communication_language = "en"  # 或 "zh-cn"
document_output_language = "en"
```

### 未来计划

- 完善中文支持
- 添加日文、韩文
- Skills 多语言版本

---

## 14. 兼容性

### 操作系统

| OS | 支持级别 |
|------|---------|
| **macOS** | ✅ 完全支持 |
| **Linux** | ✅ 完全支持 |
| **Windows** | ✅ 完全支持 |
| **WSL** | ✅ 完全支持 |

### Node.js 版本

| 版本 | 支持 |
|------|------|
| **18.x** | ✅ 推荐 |
| **20.x** | ✅ 推荐 |
| **22.x** | ✅ 测试中 |
| **< 18** | ❌ 不支持 |

### Python 版本

| 版本 | 支持 |
|------|------|
| **3.8+** | ✅ 支持 |
| **3.11+** | ✅ 推荐（tomllib 内置） |
| **< 3.8** | ❌ 不支持 |

---

## 15. 贡献者技能要求

### 必备技能

- JavaScript/TypeScript（基础）
- Markdown 编写
- Git 工作流

### 推荐技能

- Python（脚本贡献）
- YAML/TOML（配置）
- 测试编写
- 文档写作

### 加分技能

- AI/LLM 经验
- CLI 工具开发
- 跨平台开发

---

## 速查表

### 关键命令

```bash
# 开发
npm install              # 安装依赖
npm test                 # 运行测试
npm run lint             # 代码检查
npm run format           # 格式化

# 测试
npm test -- --watch      # 监听模式
npm run test:e2e         # E2E 测试

# 构建
npm run build            # 构建
npm run release          # 发布
```

### 关键文件

| 文件 | 用途 |
|------|------|
| `package.json` | Node.js 配置 |
| `tools/installer/index.js` | CLI 入口 |
| `src/scripts/resolve_config.py` | 配置解析 |
| `src/scripts/resolve_customization.py` | 定制化解析 |

---

*技术栈清单结束。*
