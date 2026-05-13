# 第四章：Skill-first 架构的设计哲学

> "Skills 是离散能力单元，基于 Anthropic Agent Skills 标准，使用 Markdown + YAML frontmatter 定义。"
>
> — src/core-skills/module.yaml

---

## 为什么是 Markdown？

在 `/tmp/BMAD-METHOD/src/` 目录下，有 42 个 Agent Skills。每个 Skill 都是一个 `SKILL.md` 文件，包含 YAML frontmatter 和 Markdown 正文。

这个设计选择看似简单，实则深思熟虑。

### 问题定义

AI 辅助开发工具面临一个根本矛盾：

- **LLM 的原生格式是文本**（Markdown、自然语言）
- **传统软件的原生格式是代码**（Python、JavaScript、YAML）

如果用代码定义 AI 工作流，LLM 需要"翻译"才能理解。如果用自然语言定义，又缺乏结构化和可执行性。

BMAD-METHOD 的答案是：**Markdown + YAML frontmatter**——既是 LLM 的原生格式，又有足够的结构化。

### 约束分析

| 约束 | 影响 |
|------|------|
| **跨平台兼容** | 必须在 40+ AI IDE 中运行 |
| **人类可读** | 用户需要能直接阅读和修改 |
| **LLM 友好** | LLM 需要能直接理解，无需编译 |
| **版本控制** | 必须 Git 友好，diff 清晰 |
| **零依赖** | 不能依赖特定运行时或编译器 |

在这些约束下，设计空间急剧缩小：

- ❌ Python/JavaScript 代码：需要运行时，LLM 不友好
- ❌ DSL（领域特定语言）：学习曲线陡，工具链复杂
- ❌ 纯 YAML：表达能力弱，难以描述复杂逻辑
- ✅ **Markdown + YAML frontmatter**：平衡可读性与结构化

## 源码实现：SKILL.md 的结构

在 `src/core-skills/bmad-help/SKILL.md` 中，可以看到标准的 Skill 结构：

```markdown
---
name: bmad-help
description: 'Analyzes current project state and recommends next steps...'
---

# BMad Help

[Skill 实现内容：指令、步骤、示例]
```

**关键设计**：

1. **YAML frontmatter**：提供结构化元数据（name、description）
2. **Markdown 正文**：提供自然语言指令和上下文
3. **无代码逻辑**：所有逻辑都是"指令"而非"代码"

这不是技术规格，这是**设计宣言**：Skill 是"指令集"而非"程序"。

### 为什么不是代码？

在 `tools/installer/core/manifest-generator.js` 第 110-184 行，有一个 `collectSkills()` 函数：

```javascript
async collectSkills() {
  const walk = async (dir) => {
    // 1. 查找 SKILL.md
    // 2. 解析 frontmatter
    // 3. 验证名称匹配
    // 4. 递归子目录
  };
}
```

**关键观察**：安装器只需要"发现"和"复制" Skill 文件，不需要"编译"或"执行"它们。

**设计意图**：
- Skill 的执行者是 LLM，不是 Node.js 或 Python
- 安装器只是"文件管理器"，不是"运行时"
- 这种分离让 Skill 可以在任何支持 Markdown 的 AI IDE 中运行

## 验证与证据

### 证据 1：跨平台支持

在 `tools/installer/ide/platform-codes.yaml` 中，定义了 40+ AI IDE 平台：

```yaml
platforms:
  claude-code:
    installer:
      target_dir: .claude/skills
  
  cursor:
    installer:
      target_dir: .agents/skills
  
  github-copilot:
    installer:
      target_dir: .agents/skills
      commands_target_dir: .github/agents
      commands_extension: .agent.md
```

**关键数字**：40+ 平台，统一使用 Markdown 格式。

**验证**：Markdown 是唯一被所有平台支持的格式。

### 证据 2：人类可读性

在 `src/bmm-skills/1-analysis/create-prd/SKILL.md` 中，可以看到完整的 PRD 创建工作流：

- 1200+ 行 Markdown
- 包含步骤说明、示例、模板
- 用户可以直接阅读，无需"反编译"

**对比**：如果用 Python 代码实现，用户需要阅读代码逻辑才能理解工作流。

### 证据 3：Git 友好

```bash
$ git diff src/core-skills/bmad-help/SKILL.md
```

Markdown 的 diff 清晰可读，每行变更都有明确含义。

**对比**：如果用 JSON 或 YAML 定义复杂逻辑，diff 会充斥大量缩进和括号变更。

## 诚实陈述：代价与局限

### 代价 1：缺乏类型检查

Markdown 没有类型系统。如果 Skill 引用了不存在的文件或变量，只能在运行时发现。

**实际影响**：
- 在 `tools/validate-skills.js` 中，有一个验证器检查 Skill 的基本格式
- 但无法检查"语义正确性"（如引用的文件是否存在）

**缓解措施**：
- 引用验证工具（`tools/validate-file-refs.js`）
- 人工审查（贡献指南要求"重度人工策展"）

### 代价 2：难以测试

如何测试一个 Markdown 文件？

在 `test/` 目录下，只有 6 个测试文件，主要测试安装器逻辑，**没有 Skill 的单元测试**。

**原因**：Skill 的执行者是 LLM，测试需要"模拟 LLM 行为"——这在技术上可行（如 LLM-as-a-judge），但成本极高。

**实际做法**：依赖人工测试和社区反馈。

### 代价 3：性能限制

Markdown 是"解释执行"的——LLM 每次都需要重新阅读和理解整个 Skill 文件。

**对比**：编译型语言可以预编译为字节码，执行更快。

**实际影响**：
- 每次调用 Skill，LLM 需要加载 1000-2000 行 Markdown
- 对于 Claude Opus，这大约是 500-1000 tokens 的上下文消耗

**缓解措施**：
- Anthropic 的 Prompt Caching（缓存 Skill 内容）
- 模块化设计（将大 Skill 拆分为小步骤）

## 替代方案对比

| 方案 | 优势 | 劣势 | BMAD 选择 |
|------|------|------|----------|
| **Python/JS 代码** | 类型安全、可测试、性能高 | LLM 不友好、需运行时 | ❌ |
| **DSL** | 表达能力强、可优化 | 学习曲线陡、工具链复杂 | ❌ |
| **纯 YAML** | 结构化、易解析 | 表达能力弱、不适合长文本 | ❌ |
| **Markdown + YAML** | LLM 友好、人类可读、跨平台 | 无类型检查、难测试、性能限制 | ✅ |

## 设计原则提炼

从 Skill-first 架构中，可以提炼出一个核心原则：

> **为执行者优化，而非为开发者优化**

传统软件为"机器"优化（编译、类型检查、性能）。AI 原生软件为"LLM"优化（自然语言、上下文、可解释性）。

BMAD-METHOD 选择了后者，并承担了相应的代价。

---

*下一章，我们将深入分析具名智能体系统——如何让 AI 从"工具"变成"队友"。*
