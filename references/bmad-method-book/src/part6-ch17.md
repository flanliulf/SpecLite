# 第十七章：模块生态系统（官方/社区/自定义）

> "core, bmm, tea, bmb, cis, 以及社区模块"
>
> — tools/installer/modules/registry.js

---

## 一个生态的诞生

任何成功的开发工具都需要生态系统：

- **VS Code** → Extensions Marketplace
- **npm** → 200 万+ 包
- **Docker** → Docker Hub

**BMAD-METHOD 的生态**：模块系统（Modules）

但 BMAD 的模块系统不是简单复制 npm 模式，而是有自己的设计哲学：**策展 + 开放**。

## 问题定义：生态系统的两难

### 完全开放的代价

**npm 的问题**：
- 200 万包，质量参差不齐
- 安全漏洞频发（恶意包）
- 维护废弃严重
- 用户难以选择

### 完全封闭的代价

**App Store 的问题**：
- 审核严格，但创新受限
- 中心化控制
- 30% 抽成
- 开发者怨声载道

### BMAD 的中间道路

```
官方模块（核心，严格策展）
   +
社区模块（扩展，松散策展）
   +
自定义模块（私有，无策展）
```

**三层结构**：质量 + 创新 + 灵活。

---

## 三种模块类型

### 类型 1：官方模块（Official Modules）

**位置**：`src/` 目录（与主仓库同源码）

**当前官方模块**：

| 模块 | 全称 | 用途 |
|------|------|------|
| **core** | Core Skills | 基础设施（bmad-help、bmad-customize 等） |
| **bmm** | BMad Method | 主要方法论（PRD、架构、Story） |
| **tea** | Test Engineering Agent | 测试工程 |
| **bmb** | BMad Builder | 元工具（创建 Skills） |
| **cis** | Creative Innovation Studio | 创意工作流 |

**特征**：
- 由核心团队维护
- 严格质量审查
- 与主版本同步发布
- 是 BMAD 的"标准库"

### 类型 2：社区模块（Community Modules）

**位置**：独立 Git 仓库

**注册方式**：

```bash
bmad install --module github.com/user/bmad-mymodule
```

**特征**：
- 任何人可以发布
- 通过 Git URL 安装
- 由作者维护
- 质量自负

**示例**（假想）：
- `bmad-react-patterns`：React 开发模式
- `bmad-fintech-compliance`：金融合规工作流
- `bmad-gamedev`：游戏开发

### 类型 3：自定义模块（Custom Modules）

**位置**：`_bmad/custom/` 目录

**用途**：
- 公司内部模块
- 团队特定工作流
- 未发布的实验

**特征**：
- 不发布到外部
- 仅本项目使用
- 无需符合任何规范
- 完全自由

---

## 源码实现：模块注册表

在 `tools/installer/modules/registry.js` 中：

```javascript
class ModuleRegistry {
  constructor() {
    // 官方模块（硬编码）
    this.officialModules = {
      'core': {
        source: 'bundled',
        path: 'src/core-skills',
        version: 'matches-bmad'
      },
      'bmm': {
        source: 'bundled',
        path: 'src/bmm-skills',
        version: 'matches-bmad'
      },
      'tea': {
        source: 'git',
        url: 'https://github.com/bmad-code-org/bmad-tea',
        version: 'stable'
      },
      // ... 其他官方模块
    };
    
    // 社区模块（动态注册）
    this.communityModules = {};
  }
  
  registerCommunityModule(code, url) {
    this.communityModules[code] = {
      source: 'git',
      url: url,
      version: 'stable',
      trusted: false  // 社区模块默认不可信
    };
  }
  
  getModule(code) {
    return this.officialModules[code] 
        || this.communityModules[code]
        || this.detectCustomModule(code);
  }
  
  detectCustomModule(code) {
    const customPath = `_bmad/custom/modules/${code}`;
    if (fs.existsSync(customPath)) {
      return {
        source: 'local',
        path: customPath,
        version: 'local'
      };
    }
    return null;
  }
}
```

**关键设计**：
- 三种来源：bundled / git / local
- 优先级：official > community > custom
- 可信标记（trusted）

### 模块加载流程

```javascript
class ModuleLoader {
  async loadModule(code, options) {
    const module = this.registry.getModule(code);
    
    if (!module) {
      throw new Error(`Module not found: ${code}`);
    }
    
    switch (module.source) {
      case 'bundled':
        // 直接从 src/ 复制
        return await this.loadBundled(module);
      
      case 'git':
        // Git 克隆到缓存
        return await this.loadFromGit(module);
      
      case 'local':
        // 直接使用本地路径
        return await this.loadLocal(module);
    }
  }
  
  async loadFromGit(module) {
    // 复用第十章的 ExternalModuleManager
    return await this.externalManager.cloneExternalModule(
      module.code,
      { url: module.url, channel: module.version }
    );
  }
}
```

---

## 模块结构标准

无论哪种类型，模块都遵循统一结构：

```
my-module/
├── module.yaml              # 模块元数据（必需）
├── README.md                # 模块说明
├── skills/                  # Skills 目录
│   ├── skill-1/
│   │   └── SKILL.md
│   └── skill-2/
│       └── SKILL.md
├── agents/                  # Agents 配置（可选）
│   └── agents.yaml
├── workflows/               # 工作流模板（可选）
│   └── workflow-1.md
└── config.yaml              # 模块默认配置（可选）
```

### module.yaml 示例

```yaml
code: my-module
name: My Custom Module
version: 1.0.0
description: A custom module for X workflow

author:
  name: Alice
  email: alice@example.com

dependencies:
  - core: ">=1.0.0"
  - bmm: ">=2.0.0"

agents:
  - id: bob
    name: Bob
    title: Custom Agent
    skills:
      - skill-1
      - skill-2
```

**关键设计**：
- 统一格式（无论官方/社区/自定义）
- 显式依赖声明
- 版本兼容性检查

---

## 设计哲学：策展 vs 开放

### 官方模块：严格策展

**质量保证**：
- 核心团队审查
- 完整测试覆盖
- 文档完备
- 长期维护承诺

**代价**：
- 创新速度慢
- 范围有限

### 社区模块：松散策展

**质量保证**：
- 作者负责
- 用户反馈
- 可选的"官方推荐"标记

**代价**：
- 质量参差
- 维护废弃

### 自定义模块：无策展

**自由度**：
- 完全自由
- 无需符合规范
- 内部使用

**代价**：
- 不可分享
- 重复造轮子

**BMAD 的智慧**：
- 三层并存，各取所需
- 用户根据场景选择

---

## 验证与证据

### 证据 1：官方模块覆盖率

**官方模块覆盖的工作流**：

| 工作流 | 模块 | 完整度 |
|--------|------|--------|
| 头脑风暴 | bmm | ✅ 完整 |
| PRD 编写 | bmm | ✅ 完整 |
| 架构设计 | bmm | ✅ 完整 |
| 代码审查 | core | ✅ 完整 |
| 测试工程 | tea | ✅ 完整 |
| 创意写作 | cis | ⚠️ 部分 |
| 元工具 | bmb | ✅ 完整 |

**覆盖率**：80%+ 的常见软件开发工作流

### 证据 2：社区模块的潜力

**预期社区模块**（基于社区讨论）：

- 行业特定（金融、医疗、教育）
- 框架特定（React、Vue、Spring）
- 语言特定（Python、Rust、Go）
- 流程特定（敏捷、看板、瀑布）

**关键观察**：
- 官方覆盖通用场景
- 社区填补垂直场景

### 证据 3：自定义模块的实际使用

**企业场景**：
- 公司内部规范（编码标准、安全规范）
- 团队特定 Agent（如"Alice，公司 CTO 风格的架构师"）
- 私有工作流（涉及商业机密）

**优势**：
- 无需公开
- 完全控制
- 与企业系统集成

---

## 诚实陈述：生态系统的局限

### 局限 1：社区生态尚未成熟

**问题**：
- BMAD 较新，社区规模小
- 社区模块数量有限
- 缺乏发现机制

**实际影响**：
- 用户难以找到合适的社区模块
- 重复开发常见

**缓解措施**：
- 官方推广社区模块
- 提供"模块市场"（未实现）
- 鼓励贡献

### 局限 2：版本兼容性

**问题**：
- 官方模块快速演进
- 社区模块跟进慢
- 自定义模块可能过时

**实际影响**：
- 升级 BMAD 后某些模块失效
- 需要手动适配

**缓解措施**：
- 显式版本声明
- 兼容性测试
- 升级文档

### 局限 3：质量难以保证

**问题**：
- 社区模块质量参差
- 可能引入 bug 或安全问题

**实际影响**：
- 用户使用前需要审查
- 信任建立需要时间

**缓解措施**：
- "官方推荐"标记
- 用户评分（未实现）
- 安全审查工具（未实现）

---

## 案例研究：tea 模块的演进

### 起源

**问题**：
- 测试工程是软件开发关键环节
- 但与 PRD/架构有不同的工作流
- 不适合放在 bmm 模块中

**解决方案**：
- 创建独立的 tea 模块
- 专注于测试工程

### 设计

**tea 模块的 Skills**：

```yaml
skills:
  - test-strategy       # 测试策略
  - test-design         # 测试设计
  - test-data           # 测试数据
  - regression-suite    # 回归套件
  - test-review         # 测试审查
```

**tea 模块的 Agents**：

```yaml
agents:
  - id: tessa
    name: Tessa
    title: Test Engineer
    skills:
      - test-strategy
      - test-design
      - regression-suite
```

### 价值

**用户视角**：

```bash
# 默认安装：核心 + 主方法论
bmad install --modules core,bmm

# 需要测试工程时：添加 tea
bmad install --modules core,bmm,tea
```

**优势**：
- 模块化（按需安装）
- 专业化（专注测试领域）
- 独立演进（不被 bmm 拖累）

---

## 设计原则提炼

从模块生态系统中，可以提炼出一个核心原则：

> **策展核心，开放扩展**

**具体体现**：

1. **核心策展**：保证基础质量
2. **社区开放**：促进创新
3. **自定义自由**：满足私有需求

**统一思想**：
- 不是"完全控制"或"完全放任"
- 而是"分层治理"

---

## 数字证据

### 模块对比

| 类型 | 数量 | 质量 | 创新速度 | 维护 |
|------|------|------|---------|------|
| **官方** | 5 个 | ⭐⭐⭐⭐⭐ | 慢 | 长期 |
| **社区** | 0-数十 | ⭐⭐-⭐⭐⭐⭐ | 快 | 不定 |
| **自定义** | 私有 | 自负 | 最快 | 内部 |

### 安装方式对比

| 来源 | 命令 | 速度 | 信任度 |
|------|------|------|--------|
| **bundled** | `bmad install` | 极快 | 高 |
| **git official** | `bmad install --modules tea` | 快（5-15s） | 高 |
| **git community** | `bmad install --module github.com/...` | 中（5-30s） | 中 |
| **local custom** | 自动检测 | 极快 | 自负 |

---

*下一章，我们将深入分析 40+ AI IDE 平台适配策略——一份详细的平台兼容性手册。*
