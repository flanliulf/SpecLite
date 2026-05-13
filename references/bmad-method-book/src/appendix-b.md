# 附录 B：关键数据结构速查

本附录提供 BMAD-METHOD 中关键数据结构的速查，方便开发者快速理解和使用。

---

## 1. SKILL.md 结构

**位置**：`src/{module}-skills/{category}/{skill-name}/SKILL.md`

**完整模板**：

```markdown
---
name: skill-canonical-id
description: 一句话描述（用于 trigger 匹配）
triggers:
  - "trigger phrase 1"
  - "trigger phrase 2"
allowed-tools:
  - Read
  - Write
  - Bash
type: skill | agent
---

# Skill Name

## Purpose
[详细说明 Skill 的用途]

## When to Use
[何时调用此 Skill]

## Process
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

## Inputs
- [输入 1]：来源
- [输入 2]：来源

## Outputs
- [输出 1]：保存位置

## References
- detailed-rules.md
- examples.md

## Constraints
- [约束 1]
- [约束 2]
```

**字段说明**：

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | ✅ | 全局唯一标识符 |
| `description` | ✅ | LLM 用于匹配触发 |
| `triggers` | ⚠️ | 触发词列表（推荐） |
| `allowed-tools` | ⚠️ | 工具白名单 |
| `type` | ⚠️ | skill / agent |

---

## 2. module.yaml 结构

**位置**：`src/{module}-skills/module.yaml`

**完整模板**：

```yaml
code: bmm
name: BMad Method Module
version: 6.0.0
description: Main BMAD methodology module

author:
  name: BMad Code Org
  url: https://github.com/bmad-code-org

dependencies:
  - core: ">=1.0.0"

categories:
  - id: 1-analysis
    name: Analysis
    description: Requirements gathering and analysis
  - id: 2-planning
    name: Planning
    description: PRD and product specification
  - id: 3-solutioning
    name: Solutioning
    description: Architecture and technical design
  - id: 4-implementation
    name: Implementation
    description: Coding and review

agents:
  - id: mary
    name: Mary
    title: Business Analyst
    domain: Requirements Analysis
    persona: |
      You are Mary, a Business Analyst with 10 years of experience.
      Empathetic, detail-oriented, skilled at eliciting requirements.
    skills:
      - bmad-brainstorming
      - bmad-advanced-elicitation
      - create-brief
  
  - id: john
    name: John
    title: Product Manager
    skills:
      - create-prd
  
  # ... 其他 Agents

config_template: |
  [bmm]
  user_skill_level = "intermediate"
  planning_artifacts = "{output_folder}/planning"
```

---

## 3. 配置文件层次（四层）

### Layer 1: installer 配置

**位置**：`_bmad/config.toml`

```toml
[core]
project_name = "My Project"
communication_language = "en"
output_folder = "{project-root}/_bmad-output"

[bmm]
user_skill_level = "intermediate"
planning_artifacts = "{output_folder}/planning"
```

### Layer 2: team 配置

**位置**：`_bmad/custom/config.toml`（提交到 Git）

```toml
[core]
communication_language = "zh-cn"
document_output_language = "zh-cn"

[bmm]
user_skill_level = "expert"

persistent_facts = [
  "file:{project-root}/docs/team-standards.md"
]
```

### Layer 3: user 配置

**位置**：`_bmad/config.user.toml`（不提交）

```toml
[core]
user_name = "Alice"
communication_language = "en"
```

### Layer 4: custom.user 配置

**位置**：`_bmad/custom/config.user.toml`（不提交）

```toml
[core]
output_folder = "/Users/alice/bmad-output"
```

### 合并优先级

```
Final = installer ⊕ team ⊕ user ⊕ custom_user
       (低)                              (高)
```

---

## 4. 清单文件结构

### skill-manifest.csv

**位置**：`_bmad/_config/skill-manifest.csv`

```csv
name,description,module,path,canonicalId,type,triggers
"BMad Help","Get guidance on BMAD workflows",core,core/bmad-help/SKILL.md,bmad-help,skill,"help|guidance"
"Create PRD","Generate Product Requirements Document",bmm,bmm/2-planning/create-prd/SKILL.md,create-prd,skill,"prd|requirements"
```

**字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 显示名 |
| `description` | string | 描述 |
| `module` | string | 所属模块 |
| `path` | string | 相对路径 |
| `canonicalId` | string | 唯一 ID |
| `type` | enum | skill / agent |
| `triggers` | string | 触发词（pipe 分隔） |

### files-manifest.csv

**位置**：`_bmad/_config/files-manifest.csv`

```csv
type,name,module,path,hash
skill,"BMad Help",core,core/bmad-help/SKILL.md,e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
config,"Core Config",core,core/config.yaml,d41d8cd98f00b204e9800998ecf8427e
```

**字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | enum | skill/config/script/template |
| `name` | string | 文件名/描述 |
| `module` | string | 所属模块 |
| `path` | string | 相对路径 |
| `hash` | string | SHA256 哈希 |

### bmad-help.csv

**位置**：`_bmad/_config/bmad-help.csv`

```csv
phase,workflow,skill,agent,description
1-analysis,brainstorming,bmad-brainstorming,mary,"Guided brainstorming session"
2-planning,prd,create-prd,john,"Create Product Requirements Document"
3-solutioning,architecture,create-architecture,winston,"Design system architecture"
4-implementation,story,create-story,amelia,"Create implementation story"
```

---

## 5. 平台配置（platform-codes.yaml）

**位置**：`tools/installer/ide/platform-codes.yaml`

**完整结构**：

```yaml
platforms:
  claude-code:
    # 元数据
    name: "Claude Code"
    tier: 1
    preferred: true
    
    # 安装配置
    installer:
      target_dir: .claude/skills
      global_target_dir: ~/.claude/skills
      file_format: SKILL.md
      
      # 可选转换
      transform: null  # null/skill-to-agent/skill-to-command
      
      # 可选过滤
      commands_filter: null  # null/agents-only
      commands_target_dir: null
      commands_extension: null
    
    # 能力声明
    capabilities:
      - skills
      - agents
      - subagents
      - tools
    
    # 限制说明
    limitations: []
```

---

## 6. 模块缓存结构

**位置**：`~/.bmad/cache/external-modules/{module-code}/`

**结构**：
```
~/.bmad/cache/external-modules/
└── tea/
    ├── .git/                    # Git 仓库
    ├── .bmad-channel            # 通道标记
    ├── module.yaml              # 模块元数据
    ├── README.md
    └── skills/
        └── ...
```

**`.bmad-channel` 内容**：

```yaml
channel: stable
ref: v1.7.0
sha: abc123def456...
fetched_at: 2026-05-07T10:30:00Z
```

---

## 7. 输出产物结构

**位置**：`{output_folder}/`（通常 `_bmad-output/`）

**典型结构**：

```
_bmad-output/
├── planning/
│   ├── brief.md
│   ├── prd.md
│   └── prfaq.md
├── architecture/
│   ├── system-architecture.md
│   ├── tech-stack.md
│   └── adrs/
│       ├── adr-001-database-choice.md
│       └── adr-002-auth-approach.md
├── implementation/
│   ├── epics/
│   │   ├── epic-1-user-management.md
│   │   └── epic-2-orders.md
│   └── stories/
│       ├── story-1.1-signup.md
│       └── story-1.2-login.md
└── reviews/
    ├── code-review-2026-05-07.md
    └── architecture-review-2026-05-07.md
```

---

## 8. Skill 输入/输出契约

**典型 Skill 的契约**：

```yaml
inputs:
  required:
    - name: project_root
      type: path
      source: env
  
  optional:
    - name: brief
      type: file
      path: "{output_folder}/brief.md"
      fallback: "create via create-brief"

outputs:
  primary:
    - name: prd
      type: file
      path: "{output_folder}/prd.md"
      format: markdown
  
  secondary:
    - name: stories_outline
      type: file
      path: "{output_folder}/stories-outline.md"
      format: markdown

side_effects:
  - "Updates skill-manifest.csv"
  - "Logs to .bmad/logs/"
```

---

## 9. 错误码

**安装器错误码**：

| 代码 | 含义 | 处理 |
|------|------|------|
| `E001` | 环境验证失败 | 检查 Node.js 版本 |
| `E002` | 配置解析失败 | 检查 TOML 语法 |
| `E003` | Git 克隆失败 | 检查网络 / 权限 |
| `E004` | 哈希校验失败 | 文件被破坏 |
| `E005` | 平台适配失败 | 检查 platform-codes.yaml |
| `E006` | 备份失败 | 检查磁盘空间 |
| `E007` | 用户取消 | 正常退出 |

---

## 10. 通道标识

| 通道 | 含义 | 使用场景 |
|------|------|---------|
| `stable` | 最新稳定标签 | 生产推荐 |
| `next` | main 分支 HEAD | 开发预览 |
| `pinned` | 用户指定版本 | 锁定版本 |

**配置示例**：

```toml
[modules.tea]
channel = "stable"  # 或 "next" / "pinned"

[modules.tea.pin]
ref = "v1.7.0"  # 仅当 channel = "pinned" 时有效
```

---

## 速查表

| 数据结构 | 位置 | 用途 |
|---------|------|------|
| **SKILL.md** | `src/.../skills/SKILL.md` | Skill 定义 |
| **module.yaml** | `src/{module}/module.yaml` | 模块元数据 |
| **config.toml** | `_bmad/config.toml` | installer 配置 |
| **custom/config.toml** | `_bmad/custom/config.toml` | team 配置 |
| **config.user.toml** | `_bmad/config.user.toml` | user 配置 |
| **skill-manifest.csv** | `_bmad/_config/` | Skills 清单 |
| **files-manifest.csv** | `_bmad/_config/` | 文件清单 |
| **bmad-help.csv** | `_bmad/_config/` | 帮助索引 |
| **platform-codes.yaml** | `tools/installer/ide/` | 平台配置 |
| **.bmad-channel** | `~/.bmad/cache/.../` | 通道标记 |

---

*下一附录：技术栈清单。*
