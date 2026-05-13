# 第六章：四层配置合并机制

> "installer → team → custom → user"
>
> — 配置优先级从低到高

---

## 一个经典的矛盾

软件工程中有一个经典矛盾：

**标准化 vs 定制化**

- **标准化**：团队需要统一规范、一致的工作流、可预测的行为
- **定制化**：个人需要适应自己的习惯、偏好、工作方式

大多数工具选择其中一个：
- 选择标准化 → 用户抱怨"不灵活"
- 选择定制化 → 团队抱怨"太混乱"

BMAD-METHOD 的答案是：**两者都要**。

## 问题定义：配置的四个层级

### 层级 1：安装器配置（installer）

**来源**：`_bmad/config.toml`（安装器生成）

**职责**：
- 提供默认值
- 确保系统可运行
- 定义核心变量

**示例**：
```toml
[core]
project_name = "My Project"
communication_language = "en"
document_output_language = "en"
output_folder = "{project-root}/_bmad-output"

[bmm]
user_skill_level = "intermediate"
planning_artifacts = "{output_folder}/planning-artifacts"
implementation_artifacts = "{output_folder}/implementation-artifacts"
```

**特点**：
- 由安装器自动生成
- 用户不应手动编辑
- 每次安装/更新时重新生成

### 层级 2：团队配置（team）

**来源**：`_bmad/custom/config.toml`（人工编写，提交到 Git）

**职责**：
- 定义团队规范
- 统一工作流
- 共享配置

**示例**：
```toml
[core]
communication_language = "zh-cn"
document_output_language = "zh-cn"

[bmm]
user_skill_level = "expert"
planning_artifacts = "{project-root}/docs/planning"
implementation_artifacts = "{project-root}/docs/implementation"

# 团队规范
persistent_facts = [
  "file:{project-root}/docs/team-standards.md",
  "file:{project-root}/docs/coding-guidelines.md"
]
```

**特点**：
- 人工编写
- 提交到 Git（团队共享）
- 覆盖 installer 配置

### 层级 3：用户配置（user）

**来源**：`_bmad/config.user.toml`（安装器生成，用户可编辑）

**职责**：
- 个人偏好
- 本地环境
- 不影响团队

**示例**：
```toml
[core]
user_name = "Alice"
communication_language = "en"  # 个人偏好英文

[bmm]
user_skill_level = "beginner"  # 个人技能等级
```

**特点**：
- 安装器生成模板
- 用户可编辑
- 不提交到 Git（.gitignore）

### 层级 4：自定义用户配置（custom.user）

**来源**：`_bmad/custom/config.user.toml`（人工编写，不提交到 Git）

**职责**：
- 高级个人定制
- 覆盖团队配置
- 完全控制

**示例**：
```toml
[core]
output_folder = "/Users/alice/bmad-output"  # 个人输出目录

[bmm]
planning_artifacts = "{output_folder}/my-planning"

# 个人工作流定制
persistent_facts = [
  "file:/Users/alice/.bmad/my-preferences.md"
]
```

**特点**：
- 人工编写
- 不提交到 Git（.gitignore）
- 最高优先级

---

## 源码实现：配置合并逻辑

在 `src/scripts/resolve_config.py` 中实现了四层合并：

```python
def resolve_config(project_root, key=None):
    """
    四层配置合并
    
    优先级（从低到高）：
    1. _bmad/config.toml              (installer)
    2. _bmad/custom/config.toml       (team)
    3. _bmad/config.user.toml         (user)
    4. _bmad/custom/config.user.toml  (custom.user)
    """
    
    # 1. 加载 installer 配置
    config = load_toml(f"{project_root}/_bmad/config.toml")
    
    # 2. 合并 team 配置
    team_config = load_toml(f"{project_root}/_bmad/custom/config.toml")
    config = deep_merge(config, team_config)
    
    # 3. 合并 user 配置
    user_config = load_toml(f"{project_root}/_bmad/config.user.toml")
    config = deep_merge(config, user_config)
    
    # 4. 合并 custom.user 配置
    custom_user_config = load_toml(f"{project_root}/_bmad/custom/config.user.toml")
    config = deep_merge(config, custom_user_config)
    
    # 5. 变量替换
    config = resolve_variables(config, project_root)
    
    return config
```

**关键函数**：`deep_merge`

```python
def deep_merge(base, override):
    """
    深度合并两个配置
    
    规则：
    - 标量值：后者覆盖前者
    - 表（Tables）：递归合并
    - 数组（带 code/id 键）：按键合并
    - 其他数组：追加
    """
    result = base.copy()
    
    for key, value in override.items():
        if key not in result:
            result[key] = value
        elif isinstance(value, dict):
            # 递归合并表
            result[key] = deep_merge(result[key], value)
        elif isinstance(value, list) and has_key_field(value):
            # 按键合并数组
            result[key] = merge_by_key(result[key], value)
        elif isinstance(value, list):
            # 追加数组
            result[key] = result[key] + value
        else:
            # 覆盖标量
            result[key] = value
    
    return result
```

---

## 设计哲学：分离关注点

### 关注点 1：官方默认值（installer）

**职责**：
- 确保系统可运行
- 提供合理的默认值
- 定义核心变量

**不应该**：
- 包含团队特定配置
- 包含个人偏好
- 假设特定工作流

### 关注点 2：团队规范（team）

**职责**：
- 统一团队工作流
- 定义团队标准
- 共享配置

**不应该**：
- 覆盖个人偏好
- 强制个人环境
- 包含敏感信息

### 关注点 3：个人偏好（user）

**职责**：
- 适应个人习惯
- 配置本地环境
- 不影响团队

**不应该**：
- 提交到 Git
- 影响其他成员
- 覆盖团队规范（除非有充分理由）

### 关注点 4：高级定制（custom.user）

**职责**：
- 完全控制
- 覆盖任何配置
- 实验性配置

**不应该**：
- 提交到 Git
- 用于常规配置（应该用 user）

---

## 验证与证据

### 证据 1：无需 fork

**传统方案**：
```
官方仓库 → Fork → 修改配置 → 维护 Fork
```

**问题**：
- 需要维护 Fork
- 难以同步上游更新
- 团队成员需要各自 Fork

**BMAD-METHOD 方案**：
```
官方仓库 → 安装 → 编辑 custom/config.toml
```

**优势**：
- 无需 Fork
- 上游更新自动同步
- 团队共享一个配置文件

### 证据 2：团队与个人共存

**场景**：
- 团队规范：使用中文文档
- Alice 偏好：使用英文（个人习惯）

**配置**：

`_bmad/custom/config.toml`（团队，提交到 Git）：
```toml
[core]
communication_language = "zh-cn"
document_output_language = "zh-cn"
```

`_bmad/config.user.toml`（Alice，不提交）：
```toml
[core]
communication_language = "en"
```

**结果**：
- Alice 的 AI 用英文交流
- 但生成的文档仍是中文（遵守团队规范）
- 其他成员不受影响

### 证据 3：变量替换

在 `src/scripts/resolve_config.py` 中：

```python
def resolve_variables(config, project_root):
    """
    变量替换
    
    支持的变量：
    - {project-root}
    - {output_folder}
    - {planning_artifacts}
    - 等等
    """
    variables = {
        "project-root": project_root,
        "output_folder": config.get("core", {}).get("output_folder", ""),
        # ... 其他变量
    }
    
    return substitute_variables(config, variables)
```

**示例**：
```toml
[bmm]
planning_artifacts = "{output_folder}/planning"
implementation_artifacts = "{output_folder}/implementation"
```

**解析后**：
```toml
[bmm]
planning_artifacts = "/path/to/project/_bmad-output/planning"
implementation_artifacts = "/path/to/project/_bmad-output/implementation"
```

---

## 对比分析

| 方案 | 标准化 | 定制化 | 团队协作 | 个人偏好 | 维护成本 |
|------|--------|--------|---------|---------|---------|
| **单层配置** | ✅ | ❌ | ✅ | ❌ | 低 |
| **环境变量** | ⚠️ | ✅ | ❌ | ✅ | 中 |
| **Fork 仓库** | ❌ | ✅ | ⚠️ | ✅ | 高 |
| **四层配置** | ✅ | ✅ | ✅ | ✅ | 中 |

---

## 诚实陈述：四层配置的代价

### 代价 1：学习曲线

**问题**：
- 用户需要理解四层优先级
- 需要知道编辑哪个文件
- 配置冲突时难以定位

**实际影响**：
- 新用户需要 1-2 小时学习
- 配置错误时调试困难

**缓解措施**：
- 详细文档（docs/reference/configuration.md）
- `bmad-customize` Skill（交互式配置）
- 配置验证工具

### 代价 2：调试难度

**问题**：
- 配置来自四个文件
- 合并逻辑复杂
- 难以确定最终值

**实际影响**：
- "为什么我的配置不生效？"
- "哪个文件覆盖了我的配置？"

**缓解措施**：
- `resolve_config.py --key <key>`（查看最终值）
- `--debug` 模式（显示合并过程）
- 配置文件注释（说明来源）

### 代价 3：文件数量

**问题**：
- 4 个配置文件（vs 1 个）
- 用户需要知道编辑哪个
- 增加项目复杂度

**实际影响**：
- 新用户困惑
- 文件管理负担

**缓解措施**：
- 清晰的命名约定
- `.gitignore` 自动配置
- 安装器自动生成模板

---

## 案例研究：企业团队的配置策略

### 场景

**团队**：50 人开发团队
**需求**：
- 统一使用中文文档
- 统一输出目录结构
- 统一代码规范
- 但允许个人偏好（如交流语言、技能等级）

### 配置策略

**1. installer 配置**（自动生成，不编辑）
```toml
[core]
project_name = "Enterprise Project"
communication_language = "en"
output_folder = "{project-root}/_bmad-output"
```

**2. team 配置**（提交到 Git）
```toml
# _bmad/custom/config.toml

[core]
document_output_language = "zh-cn"
output_folder = "{project-root}/docs/bmad"

[bmm]
planning_artifacts = "{output_folder}/planning"
implementation_artifacts = "{output_folder}/implementation"

# 团队规范
persistent_facts = [
  "file:{project-root}/docs/coding-standards.md",
  "file:{project-root}/docs/architecture-principles.md",
  "file:{project-root}/docs/security-guidelines.md"
]
```

**3. user 配置**（个人，不提交）
```toml
# _bmad/config.user.toml

[core]
user_name = "Alice"
communication_language = "en"  # Alice 偏好英文

[bmm]
user_skill_level = "expert"  # Alice 是专家
```

**4. custom.user 配置**（高级定制，不提交）
```toml
# _bmad/custom/config.user.toml

# Alice 的实验性配置
[bmm]
planning_artifacts = "/Users/alice/custom-planning"

persistent_facts = [
  "file:/Users/alice/.bmad/my-templates.md"
]
```

### 结果

**Alice 的最终配置**：
```toml
[core]
user_name = "Alice"                              # user
communication_language = "en"                    # user (覆盖 installer)
document_output_language = "zh-cn"               # team (覆盖 installer)
output_folder = "/path/to/project/docs/bmad"    # team (覆盖 installer)

[bmm]
user_skill_level = "expert"                      # user
planning_artifacts = "/Users/alice/custom-planning"  # custom.user (覆盖 team)
implementation_artifacts = "/path/to/project/docs/bmad/implementation"  # team

persistent_facts = [
  "file:/path/to/project/docs/coding-standards.md",      # team
  "file:/path/to/project/docs/architecture-principles.md", # team
  "file:/path/to/project/docs/security-guidelines.md",    # team
  "file:/Users/alice/.bmad/my-templates.md"               # custom.user (追加)
]
```

**关键观察**：
- ✅ 团队规范生效（中文文档、统一目录、团队标准）
- ✅ 个人偏好生效（英文交流、专家等级）
- ✅ 高级定制生效（自定义规划目录、个人模板）
- ✅ 无需 Fork，无需维护分支

---

## 设计原则提炼

从四层配置系统中，可以提炼出一个核心原则：

> **分离关注点，而非一刀切**

**具体体现**：

1. **installer**：官方默认值
2. **team**：团队规范
3. **user**：个人偏好
4. **custom.user**：高级定制

**统一思想**：
- 不是"标准化 vs 定制化"
- 而是"标准化 AND 定制化"

---

*下一章，我们将分析模块化与跨平台适配——如何支持 40+ AI IDE 平台。*
