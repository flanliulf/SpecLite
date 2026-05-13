# 第二十章：三大性能瓶颈分析

> "性能不是首要目标，但仍然是真实的约束"
>
> — BMAD-METHOD 工程实践

---

## 性能的现实

BMAD-METHOD 选择"简单透明优于复杂高效"，但这不意味着性能可以忽视。

实际使用中，用户会感知到三个明显的性能瓶颈：

1. **冷启动**：首次安装慢
2. **配置解析**：每次执行 Skill 时
3. **审查时间**：对抗式审查的时间成本

本章诚实剖析这些瓶颈，分析根因和缓解策略。

---

## 瓶颈 1：冷启动慢

### 现象

**首次安装时间**：

```bash
$ time bmad install --modules core,bmm,tea

[1/11] Validating environment...    (1s)
[2/11] Parsing config...            (1s)
[3/11] Resolving modules...         (2s)
[4/11] Cloning tea (Git)...         (15s)
[5/11] Copying files...             (3s)
[6/11] Adapting platforms...        (2s)
[7/11] Generating manifest...       (3s)
[8/11] Calculating hashes...        (5s)
[9/11] Verifying integrity...       (2s)

real    0m34.521s
```

**用户感知**：
- 30-60 秒等待
- 进度条移动慢
- "怎么这么慢？"

### 根因分析

**主要时间消耗**：

| 步骤 | 时间 | 原因 |
|------|------|------|
| **Git 克隆** | 15-30s | 网络延迟 + 仓库大小 |
| **哈希计算** | 5-10s | 1000+ 文件 |
| **平台适配** | 2-5s | 多平台 × 多文件 |
| **其他** | 5-10s | 配置解析、UI 等 |

**根本问题**：
- I/O 密集（文件系统、网络）
- 单线程串行执行
- 没有缓存复用（首次）

### 缓解策略

**策略 1：浅克隆**（已实现）

```bash
git clone --depth=1 ...
```

**效果**：减少 Git 克隆 50-70% 时间

**策略 2：并行执行**（部分实现）

```javascript
// 当前：串行
for (const platform of platforms) {
  await adaptPlatform(platform);
}

// 改进：并行
await Promise.all(
  platforms.map(p => adaptPlatform(p))
);
```

**效果**：平台适配时间减半

**策略 3：增量哈希**（待实现）

只对变化的文件计算哈希。

**效果**：更新场景节省 80% 哈希时间

**策略 4：缓存复用**（已实现）

```bash
# 第二次安装（缓存命中）
$ time bmad install --modules core,bmm,tea

real    0m3.421s
```

**效果**：30秒 → 3秒，10x 加速

### 用户教育

**重要的诚实**：

> "首次安装较慢，但后续操作快速。这是一次性成本。"

文档中明确告知用户：
- 预期时间范围
- 后续操作的快速
- 加速建议（已有缓存时）

---

## 瓶颈 2：配置解析每次执行

### 现象

每次调用 Skill 时，都需要解析配置：

```python
# resolve_config.py
def resolve_config(project_root):
    # 1. 加载 4 层配置
    # 2. 深度合并
    # 3. 变量替换
    # 4. 返回最终配置
```

**典型耗时**：100-300ms

**用户感知**：
- 每次 Skill 调用都有 100-300ms 延迟
- 频繁使用时累积

### 根因分析

**步骤拆解**：

| 步骤 | 时间 |
|------|------|
| **读取 4 个 TOML 文件** | 30-50ms |
| **解析 TOML** | 20-40ms |
| **深度合并** | 10-20ms |
| **变量替换（递归）** | 30-100ms |
| **验证** | 10-30ms |
| **总计** | 100-240ms |

**根本问题**：
- 每次都从磁盘读取
- 每次都重新解析
- 无内存缓存

### 缓解策略

**策略 1：内存缓存**（部分实现）

```python
class ConfigCache:
    _cache = {}
    _mtimes = {}
    
    @classmethod
    def get(cls, project_root):
        # 检查文件 mtime
        current_mtimes = cls._get_mtimes(project_root)
        
        if current_mtimes == cls._mtimes.get(project_root):
            # 缓存有效
            return cls._cache[project_root]
        
        # 重新加载
        config = resolve_config_uncached(project_root)
        cls._cache[project_root] = config
        cls._mtimes[project_root] = current_mtimes
        return config
```

**效果**：
- 首次：100-240ms
- 后续：< 5ms

**策略 2：懒解析**（已实现）

```python
# 不预解析所有变量
# 只在访问时解析
config = LazyConfig(file_path)
config.get('bmm.user_skill_level')  # 触发解析
```

**效果**：减少不必要的解析

**策略 3：编译缓存**（待实现）

```python
# 将解析结果保存为二进制缓存
config.cache.bin  # pickle/msgpack
```

**效果**：跳过 TOML 解析

### 用户视角

**实际影响**：
- 单次：100-300ms 不明显
- 长会话：累积可观（10次 × 200ms = 2秒）

**建议**：
- 启用配置缓存（默认）
- 避免不必要的 Skill 切换

---

## 瓶颈 3：对抗式审查时间

### 现象

```bash
$ bmad code-review

Layer 1: Blind Hunter...           (2 min)
Layer 2: Edge Case Hunter...       (3 min)
Layer 3: Acceptance Auditor...     (2 min)

Total review time: 7 minutes
```

**用户感知**：
- 7 分钟审查"很长"
- 想要更快

### 根因分析

**主要时间消耗**：

| 来源 | 时间 |
|------|------|
| **LLM 推理** | 5-6 min |
| **文件读取** | 30s |
| **Token 处理** | 1-2 min |
| **结果汇总** | 30s |

**根本问题**：
- LLM 推理慢（不是 BMAD 问题）
- 三层串行（虽然概念上"并行"，但实际工具限制）
- 每层都需要完整上下文

### 缓解策略

**策略 1：真正的并行**（待实现）

如果工具支持并行 subagent：

```javascript
const [blind, edge, acceptance] = await Promise.all([
  reviewBlind(code),
  reviewEdgeCases(code),
  reviewAcceptance(code, story)
]);
```

**效果**：7 min → 3 min（按最慢的算）

**策略 2：按需审查**（部分实现）

不是所有代码都需要三层：

```yaml
review_levels:
  trivial_change: skip          # 拼写、注释
  minor_refactor: blind_only    # 重构
  new_feature: all_three        # 新功能
  critical_logic: all_three + manual  # 关键逻辑
```

**效果**：80% 场景节省 50% 时间

**策略 3：增量审查**（待实现）

只审查变化的部分：

```bash
# 仅审查 git diff
bmad code-review --since=HEAD~1
```

**效果**：减少 70-90% 审查范围

**策略 4：缓存复用**（待实现）

如果代码未变，复用之前审查结果：

```javascript
const cacheKey = sha256(code);
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

**效果**：未变更代码的审查时间 → 0

### 诚实陈述

**不可避免的现实**：

LLM 推理时间是物理上限：
- 不是 BMAD 的代码问题
- 不是网络问题
- 是 LLM 推理本身耗时

**用户需要接受**：
- AI 审查比人工审查慢
- 但比人工审查全面

---

## 综合性能数据

### 典型操作时间

| 操作 | 时间 | 瓶颈 |
|------|------|------|
| **首次安装（小）** | 15-30s | Git + 哈希 |
| **首次安装（大）** | 30-60s | Git + 哈希 + 适配 |
| **更新（无修改）** | 5-15s | Git fetch + 哈希 |
| **更新（有修改）** | 10-30s | + 备份 + 交互 |
| **配置解析（首次）** | 100-300ms | 读取 + 解析 |
| **配置解析（缓存）** | < 5ms | 内存查找 |
| **Skill 调用** | 200-500ms | 配置 + 加载 |
| **代码审查** | 4-7 min | LLM 推理 |
| **PRD 生成** | 5-15 min | LLM + 用户交互 |
| **架构设计** | 10-30 min | LLM + 用户交互 |

### 性能对比

**与替代工具对比**：

| 工具 | 首次安装 | 配置解析 | 审查时间 |
|------|---------|---------|---------|
| **npm install** | 5-30s | < 1ms | N/A |
| **Docker pull** | 30-120s | N/A | N/A |
| **BMAD install** | 15-60s | 100-300ms | 4-7 min |

**关键观察**：
- 安装时间相当
- 配置解析较慢（但已优化）
- 审查时间最长（但物理限制）

---

## 性能预算

BMAD-METHOD 的性能目标（推断）：

```yaml
performance_budget:
  installation:
    cold_start: < 60s        # 95th percentile
    warm_start: < 10s
    update: < 30s
  
  runtime:
    config_parse_first: < 500ms
    config_parse_cached: < 10ms
    skill_invoke: < 1s
  
  workflow:
    prd_generation: 5-30 min  # depends on Level
    code_review: 4-10 min
    architecture: 10-60 min
```

**特点**：
- 安装/启动：硬性目标
- 工作流：弹性范围
- 用户教育：明确预期

---

## 诚实陈述：性能与设计的取舍

### 取舍 1：CSV vs SQLite

**性能差距**：
- CSV 查询：45ms
- SQLite 查询：5ms
- **差距**：9 倍

**为什么选 CSV**：
- 当前规模下 45ms 可接受
- 简单透明 > 性能
- Git 友好 > 性能

**未来**：
- 如规模增长（>10k Skills），考虑 SQLite

### 取舍 2：哈希追踪 vs mtime

**性能差距**：
- 哈希：3 秒/1000 文件
- mtime：< 100ms

**为什么选哈希**：
- mtime 不可靠（编辑器、Git）
- 用户数据保护 > 性能

### 取舍 3：完整审查 vs 快速审查

**时间差距**：
- 三层审查：7 min
- 单层审查：2 min

**为什么选三层**：
- 漏报代价 > 时间代价
- 提供 `--quick` 模式作为兜底

---

## 优化路线图

### 已实现优化

✅ Git 浅克隆（`--depth=1`）
✅ 全局缓存（外部模块）
✅ 配置内存缓存（部分）
✅ 增量更新（备份/恢复）

### 计划中优化

🔮 真正并行（subagent）
🔮 增量哈希（仅变化文件）
🔮 编译缓存（配置）
🔮 增量审查（git diff）
🔮 审查结果缓存

### 不会实现的"优化"

❌ 改用 SQLite（牺牲透明性）
❌ 移除哈希追踪（牺牲安全性）
❌ 跳过对抗审查（牺牲质量）

---

## 设计原则提炼

从性能瓶颈分析中，可以提炼出一个核心原则：

> **性能服务于价值，不是相反**

**具体体现**：

1. **承认瓶颈**：不假装没问题
2. **理解根因**：分析而非抱怨
3. **缓解优先**：优化最痛的点
4. **接受取舍**：保护核心价值

**统一思想**：
- 不是"性能至上"
- 而是"性能足够"

---

## 数字证据

### 性能瓶颈优先级

| 瓶颈 | 频率 | 影响 | 优先级 |
|------|------|------|--------|
| **配置解析** | 高（每次） | 中（200ms） | ⭐⭐⭐ |
| **冷启动** | 低（一次） | 高（30s+） | ⭐⭐ |
| **审查时间** | 中（每周） | 高（7min） | ⭐ |

### 优化收益

**配置缓存**：
- 投入：100 行代码
- 收益：99%+ 时间节省（缓存命中时）

**Git 浅克隆**：
- 投入：1 行代码（`--depth=1`）
- 收益：50-70% 时间节省

**并行平台适配**（待实现）：
- 投入：50 行重构
- 收益：50% 时间节省

---

*下一章，我们将解释一个反直觉的选择——为什么拒绝量化性能基准？*
