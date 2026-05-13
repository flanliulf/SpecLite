<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Known Failure Patterns — 已知失败模式库

> 本文件是 speclite-brownfield-context-builder 自身的"教训记忆"。每条目记录一类历史上犯过的错误，
> 用于在 Phase 3 合成阶段前由 SKILL prompt 强制注入，让模型主动避开同类陷阱。
>
> **写入流程**：每次 Skill 在真实项目上发现新一类系统性错误（来自 `validation/hallucination-report.json`、
> 用户回报、或 `golden/` 回归差异），必须以条目形式入库，附最小复现样例与防御机制编号。
>
> **使用流程**：Phase 3 合成 prompt 自动追加本文件全文（或仅"识别特征"列）。

---

## 条目模板

```yaml
- id: KFP-XXX
  name: <短名>
  detected_in: <首次发现的项目>
  category: hallucination | silent_drop | semantic_mistranslation
  symptom: <用户最终看到的错误现象>
  trigger: <触发该错误的输入条件>
  identifying_signals: <baseline 中的可机械识别特征>
  defensive_mechanism: M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8
  guard_action: <生成阶段必须执行的动作>
  example_wrong: <错误示例>
  example_right: <正确示例>
```

机制编号沿用源 brownfield-context-builder 的 Evidence-First / LLM-Last 设计记录。

---

## KFP-001 — Endpoint 推断幻觉（CRUD 完成主义）

- **detected_in**: csair-custom (PrizeDrawController/MemberController/ChannelQrcodeController/...)
- **category**: hallucination
- **symptom**: 当 evidence 中某 Controller 仅有一行根 ANY 端点（如 `/lucky` ANY）时，baseline 自动补全成
  `/list /save /update /detail /remove /publish /participate ...` 等 8–12 个 CRUD 端点；这些端点在源码中
  **完全不存在**。
- **trigger**: evidence 中 Controller 端点稀疏（< 3 个） + Controller 名带"业务术语" + LLM 偏好"看起来完整"。
- **identifying_signals**:
  - baseline 表格中某 Controller 出现的端点数 > evidence 中该 Controller 端点数。
  - 端点名是 `/list /save /update /detail /create /remove /add` 等通用 CRUD 词且 evidence 中无匹配。
- **defensive_mechanism**: M1（覆盖率契约暴露稀疏） + M3（骨架渲染禁止 LLM 写新端点） + M5（对抗性反查）。
- **guard_action**:
  > **每个 baseline 端点必须能在 `evidence/api-inventory.json#/apis` 中精确字符串反查**。
  > 反查失败 → 删除该行；不允许"为了对齐表格"补全。
  > 当某 Controller 在 evidence 中端点数 ≤ 2 时，自动追加 `> ⚠️ 证据稀疏：本 Controller 仅识别 N 个端点，可能存在抽取盲区` 提示。
- **example_wrong**:
  ```
  | /save | POST | auth | 保存活动 |
  ```
- **example_right**:
  ```
  | /addActivity | POST | auth | [anchor:evidence/api-inventory.json#/apis/42] |
  ```

---

## KFP-002 — Controller 类前缀漏拼接

- **detected_in**: csair-custom 全量 Spring Controller
- **category**: silent_drop
- **symptom**: api-inventory.json 中各 Spring Controller 的端点是"扁平方法路径"（如 `getManagerResource`），
  没有拼上类级 `@RequestMapping("/lucky")` 前缀。下游 baseline 因找不到完整路径，转而由 LLM 推测。
- **trigger**: extract_api_inventory.py 的 Spring 分支只匹配方法注解，未做类级前缀拼接（NestJS 分支已做）。
- **identifying_signals**:
  - evidence/api-inventory.json 中同一 handler_file 的多个端点完全不共享公共前缀。
  - 同一 Controller 内出现 `ANY /lucky` 与 `POST /addActivity` 这种"根路径与方法分离"的形态。
- **defensive_mechanism**: M2（AST + 框架适配器，必须做类级前缀解析）。
- **guard_action**:
  > Spring/JAX-RS 抽取必须先解析类级 `@RequestMapping` / `@Path`，再拼接方法级路径，输出 `endpoint = class_prefix + method_path`。
  > 同时保留 `class_prefix` 与 `method_path` 两个原始字段，便于下游溯源。

---

## KFP-003 — MyBatis Plus 实体被静默丢弃

- **detected_in**: csair-custom dao/entity/ 下 49 个 `@TableName` 实体
- **category**: silent_drop
- **symptom**: data-model-inventory.json 仅 20 条（dao/model 下旧 JPA `@Entity`），dao/entity/ 主库 70+ 实体完全缺失。
  baseline §"数据实体" 据此误判系统只有 20 个实体。
- **trigger**: extract_data_models.py 的 Java 分支硬编码 `"@Entity" in content`，遇到 MyBatis Plus 的 `@TableName` 不识别；
  且 `is_model_file` 的 `dir_indicators` 不含 "entity" 单数形式。
- **identifying_signals**:
  - 项目 pom.xml/build.gradle 含 `mybatis-plus-boot-starter`。
  - 源码大量出现 `@TableName / @TableId / @TableField` 注解。
  - data-model-inventory.json.coverage.gaps 中存在大量 `dao/entity/*.java` 条目。
- **defensive_mechanism**: M2（框架适配器：MyBatis Plus） + M1（gaps.json 暴露漏抽）。
- **guard_action**:
  > 任何含 `mybatis-plus` 依赖的项目，data extractor 必须支持 `@TableName` / `@TableId` / `@TableField`。
  > 当 `evidence/tech-stack-strict.json` 含 `MyBatis-Plus` 但 data-model-inventory 中 mybatis-plus 类型实体数 == 0 时，
  > 验证器报错（不是警告）。

---

## KFP-004 — 消息队列名称误译（RocketMQ → RabbitMQ）

- **detected_in**: csair-custom system-overview.md §4 §5
- **category**: semantic_mistranslation
- **symptom**: pom.xml 明确 `rocketmq-stream-boot-starter`，baseline 写成 RabbitMQ；mq/producer/ 下 6 个 RocketMQ Producer 被忽略。
- **trigger**: collect_config_surface.py 的 SERVICE_PATTERNS 用模糊关键字（"RABBIT_|AMQP_..."）搜全代码，
  容易被某个 import 名误中；且 LLM 在合成段落时偏好"更常见的技术名"。
- **identifying_signals**:
  - baseline 中提及的消息队列名 ∉ `evidence/tech-stack-strict.json#/techs[*].tech`。
  - 同一文档前后出现两种不同的队列名。
- **defensive_mechanism**: M7（依赖白名单严格识别） + M4（Anchor 强校验） + M5（对抗反查）。
- **guard_action**:
  > 凡涉及"消息队列 / 缓存 / 数据库 / 注册中心 / 调度框架"的具体技术名，**必须**附 `[anchor:evidence/tech-stack-strict.json#/techs/N]`。
  > 没有锚点的技术名禁止出现在 baseline 中。
  > 抽取脚本只在依赖清单（pom.xml/package.json/...）中匹配，不再扫源码。

---

## KFP-005 — 业务回调 Controller 被误标为框架回调

- **detected_in**: csair-custom open/CallbackController
- **category**: semantic_mistranslation
- **symptom**: baseline 把"接收南航会员变更回调"误描述为"企业微信事件回调入口"。
- **trigger**: 仅有一个 Controller 名 `CallbackController` 时，LLM 按通用领域知识做了语义补全。
- **identifying_signals**:
  - baseline 对 Controller 的描述中含具体厂商名（"企业微信 / 钉钉 / 微信支付 / Stripe ..."），但该名词在源码与历史文档中均无证据。
- **defensive_mechanism**: M7（反模式知识库） + 历史文档摄取（references/historical-doc-ingestion.md）。
- **guard_action**:
  > Controller 描述只能基于以下三类来源之一：
  > 1) 源码内的类/方法注释；
  > 2) 历史文档（business-fact-candidates.json）中标注 CODE_CONFIRMED 的事实；
  > 3) `[INFERRED]` 标签的低置信描述（必须显式标注）。
  > 不允许从 Controller 命名做"领域厂商"推断。

---

## 跨条目机制摘要表

| 机制 | 编号 | 作用 |
|:----|:----|:-----|
| 覆盖率契约 | M1 | 漏抽必发声（gaps.json） |
| AST + 适配器 | M2 | 替换正则，覆盖类前缀拼接、ORM 多样性 |
| 骨架渲染优先 | M3 | LLM 失去"写新事实"的物理可能性 |
| Evidence Anchor | M4 | baseline 事实必须可机械反查 |
| 对抗性 Reviewer | M5 | Phase 3 后兜底反查 |
| 黄金集回归 | M6 | 不在客户项目首次发现 bug |
| 反模式库 | M7 | 本文件，注入 Phase 3 prompt |
| 不确定性传播 | M8 | 稀疏输入必须稀疏输出 |
