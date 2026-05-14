<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# v2.0 Paradigm Design — Evidence-First, LLM-Last

> 目标：将 speclite-brownfield-context-builder 从"LLM 主导合成 + 校验兜底"翻转为
> "确定性流水线主导 + LLM 仅做受限叙述"。本文是 v2.0 的设计宪法，
> 任何后续 PR 必须遵守此架构边界。

---

## 1. 当前 v1.x 范式的根本缺陷

### 1.1 三大底层缺陷（来自 root-cause-and-fundamental-fix.md §三）

| # | 缺陷 | 后果 |
|:--|:----|:-----|
| F1 | LLM 拥有"写新事实"的物理权限 | 每次合成都是潜在幻觉源 |
| F2 | Evidence 与 Baseline 之间无机械契约 | 校验只能事后采样，无法兜底 |
| F3 | 错误是"项目级一次性发现"而非"产品级永久免疫" | 同类 bug 反复出现在新客户 |

### 1.2 v1.1/v1.2 的边际改进（已落地）

- M1 覆盖率契约（gaps.json）— **缓解 F2**，未根除
- M2 框架适配器（Spring 类前缀 / MyBatis-Plus）— **缓解 F2**
- M4 Anchor 强类型 / M5 对抗反查 — **缓解 F1**，未根除
- M6 黄金集回归 — **缓解 F3**
- M7 依赖白名单 — **缓解 F1**

> 关键判断：上述都是"在 LLM 出口处加滤网"。LLM 仍然是"事实写入者"。
> v2.0 的目标是 **取消 LLM 的写入权**。

---

## 2. v2.0 范式：Evidence → Skeleton → Narrative

### 2.1 三段式管线

```
[Evidence Extractors]  →  [Skeleton Renderer]  →  [Narrative Filler]
   (确定性脚本)            (确定性脚本)             (LLM，受限)
   写所有"事实"             写所有"骨架"            只能写 <!-- DESC --> 占位符
```

**核心约束**：

1. baseline/*.md 中的所有表格、列表、统计数字、技术名、端点、实体、类名
   **必须由 Skeleton Renderer 写入**，LLM 不能创建/修改/删除这些行。
2. LLM 的输出只能落在 `<!-- DESC: ... -->` 之间——一段不超过 N 个 token
   的纯叙述，且 grounded 到同一行的 anchor。
3. 任何"补全表格行"的尝试 → CI 拒绝（diff 检测）。

### 2.2 写入权矩阵

| 内容类别 | 谁写 | 可改 |
|:--------|:-----|:-----|
| 端点表格行 | Skeleton Renderer | LLM 不可改 |
| 实体表格行 | Skeleton Renderer | LLM 不可改 |
| 技术栈表格行 | Skeleton Renderer | LLM 不可改 |
| 模块拓扑/统计数字 | Skeleton Renderer | LLM 不可改 |
| Anchor 标签 | Skeleton Renderer | LLM 不可改 |
| 章节叙述（≤200 字/段） | LLM | 必须 grounded |
| 风险评估 / 改造建议 | LLM | 必须 grounded |

### 2.3 实现锚点（已有 / 待建）

| 组件 | v1.2 状态 | v2.0 目标 |
|:----|:---------|:---------|
| `render_baseline_skeleton.py` | ✅ 已建（4 个文件） | 扩展到全部 6 个 baseline 文件 |
| `validate_skeleton_diff.py` | ❌ 未建 | **新建**：对比 LLM 产出 vs 骨架，禁止超出占位符的改动 |
| `narrative_filler_prompt.md` | ❌ 未建 | **新建**：限定 LLM 只能填占位符的硬约束 prompt |
| Anchor 必填校验 | ✅ 已建 | 默认 `--strict-anchors` |
| Adversarial reviewer | ✅ 已建 | 改为流水线必跑（exit ≠ 0 阻断） |

---

## 3. 文件级变更（v1.x → v2.0）

### 3.1 SKILL.md

将 Phase 3（Baseline 合成）拆为两阶段：

- **Phase 3a — Skeleton**：调用 `render_baseline_skeleton.py`，零 LLM 参与。
- **Phase 3b — Narrative**：仅允许 LLM 填占位符，prompt 中明确"修改任何表格行
  即视为违规"。

### 3.2 references/baseline-synthesizer.md

重写为 "Narrative Filler 操作手册"：

- 只列允许的写入位置（占位符正则）
- 每段落必须以 `[anchor:...]` 结尾
- 提供 5-10 个 good/bad 例子

### 3.3 scripts/

新增 `validate_skeleton_diff.py`：

```python
# 伪代码
skeleton = read("baseline/_skeleton/system-overview.md")
final    = read("baseline/system-overview.md")
diff = unified_diff(skeleton, final)
for hunk in diff:
    if not all(line is inside <!-- DESC --> region for line in hunk):
        raise ViolationError(hunk)
```

---

## 4. 渐进式落地路径

| 阶段 | 内容 | 风险 |
|:----|:-----|:-----|
| v2.0-α | Skeleton Renderer 覆盖全部 baseline 文件 | 低，已有原型 |
| v2.0-β | validate_skeleton_diff 上线，CI 阻断 | 中，需要稳定占位符约定 |
| v2.0-γ | SKILL.md Phase 3 改写为 3a+3b | 中，需重写 prompt |
| v2.0 GA | 在 csair-custom 重跑，幻觉率应 → 0 | — |

---

## 5. 不变量（Invariants）

任何 v2.x 实现都必须满足：

- **I1**：baseline/*.md 中每条端点行必须能在 evidence/api-inventory.json 中精确反查。
- **I2**：baseline/*.md 中每条实体行必须能在 evidence/data-model-inventory.json 中精确反查。
- **I3**：baseline/*.md 中每个技术名必须 ∈ tech-stack-strict.json。
- **I4**：LLM 产出与 _skeleton/ 的 diff 只能落在 `<!-- DESC: ... -->` 区域。
- **I5**：违反 I1-I4 任何一条 → CI fail，禁止 merge。

> 这五条不变量是 v2.0 的"宪法"，破坏其中任意一条即视为退化到 v1.x。

---

## 6. 与 v1.x 的兼容策略

- v1.x 客户产出仍可读，无破坏性升级。
- v2.0 在 SKILL.md 顶层加 `mode: paradigm.v2`（默认仍为 v1）。
- v2.0 GA 后，v1 模式标记为 deprecated，3 个月窗口后移除。

---

## 7. 度量指标

| 指标 | v1.0 基线 | v2.0 目标 |
|:----|:---------|:---------|
| 幻觉端点占比 | 60-70%（csair-custom 实测） | **0%** |
| MyBatis-Plus 实体漏抽率 | ~71% | **0%**（依靠 KFP-003 + golden） |
| 技术名误译率 | 1/4（RocketMQ→RabbitMQ） | **0%** |
| 业务描述错误率 | 1/9 Controller | < 5% |

---

## 8. Out-of-Scope（v2.0 不解决）

- LLM 在叙述段中编造"业务术语"——由 KFP-005 + 历史文档摄取继续治理。
- 跨服务调用拓扑——需要新的 trace 抽取器，留给 v2.1。
- 性能 / 容量预测——v2.0 仍只做"现状描述"，不做预测。
